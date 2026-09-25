// Bản đồ hàm của index.html (phân tích cú pháp bằng acorn):
//   1) Hàm toàn cục nào còn bị định nghĩa lại / bọc chồng (lớp vá) — mục tiêu là 0.
//   2) Các hàm lõi gọi những bước mở rộng nào (PL_STEPS), theo đúng thứ tự, và bước đó khai báo ở đâu.
// Dùng:  node tools/patch-map.js index.html > PATCH_MAP.md
//        node tools/patch-map.js index.html --check   (thoát mã 1 nếu còn hàm bị ghi đè)
const fs = require('fs');
const acorn = require('acorn');
const walk = require('acorn-walk');

const file = process.argv[2];
const CHECK = process.argv.includes('--check');
const html = fs.readFileSync(file, 'utf8');
const lineOf = (idx) => html.slice(0, idx).split('\n').length;

const blocks = [];
for (const m of html.matchAll(/<script(?![^>]*\bsrc=)([^>]*)>([\s\S]*?)<\/script>/g)) {
  const openIdx = m.index, bodyIdx = m.index + m[0].indexOf('>') + 1;
  const idm = m[1].match(/id="([^"]+)"/);
  const code = m[2];
  const cm = code.match(/\/\*+\s*([\s\S]*?)\*\/|\/\/\s*(.*)/);
  let label = cm ? (cm[1] || cm[2] || '').replace(/[=\s]+/g, ' ').trim() : '';
  if (label.length > 110) label = label.slice(0, 107) + '…';
  blocks.push({ n: blocks.length + 1, id: idm ? idm[1] : '', start: lineOf(openIdx), end: lineOf(openIdx + m[0].length), bodyLine: lineOf(bodyIdx), code, label, defs: [] });
}

const GLOBAL_OBJ = new Set(['window', 'globalThis', 'self']);
const isGlobalMember = (n) => n && n.type === 'MemberExpression' && !n.computed && n.object.type === 'Identifier' && GLOBAL_OBJ.has(n.object.name);

// Lượt 1: phân tích cú pháp + gom tên mọi hàm khai báo (để biết `window.X=Y` có phải gán hàm).
const FN_NAMES = new Set();
for (const b of blocks) {
  try { b.ast = acorn.parse(b.code, { ecmaVersion: 'latest', sourceType: 'script', locations: true, allowReturnOutsideFunction: true }); }
  catch (e) { b.error = e.message; continue; }
  walk.simple(b.ast, { FunctionDeclaration(n) { if (n.id) FN_NAMES.add(n.id.name); } });
}
// Giá trị là hàm: biểu thức hàm, hoặc tên một hàm đã khai báo (không bị che bởi tham số/biến cục bộ).
const isFunctionValue = (n, ancestors) => /Function/.test(n.type) || (n.type === 'Identifier' && FN_NAMES.has(n.name) && !ancestors.filter(a => /Function/.test(a.type)).some(f => (f.params || []).some(p => p.type === 'Identifier' && p.name === n.name)));

const defs = {};          // tên -> [{block, line, kind, wrapper, deferred, value}]
const dynamicHooks = [];  // window[name] = ...
const add = (name, rec) => { (defs[name] = defs[name] || []).push(rec); rec.block.defs.push(name); };

function declaredIn(fnNode) {
  const names = new Set();
  (fnNode.params || []).forEach(p => walk.simple(p, { Identifier(n) { names.add(n.name); } }));
  walk.recursive(fnNode.body, null, {
    Function(node) { if (node.type === 'FunctionDeclaration' && node.id) names.add(node.id.name); },
    VariableDeclarator(node) { if (node.id.type === 'Identifier') names.add(node.id.name); },
  });
  return names;
}
// Hàm chạy ngay: IIFE, hoặc hàm có tên được gọi trực tiếp (`install();`) trong thân bao ngoài.
function isImmediate(fn, ancestors) {
  const i = ancestors.indexOf(fn), parent = ancestors[i - 1];
  if (parent && (parent.type === 'CallExpression' || parent.type === 'NewExpression') && parent.callee === fn) return true;
  if (fn.type === 'FunctionDeclaration' && fn.id && parent && Array.isArray(parent.body)) {
    return parent.body.some(st => st.type === 'ExpressionStatement' && st.expression.type === 'CallExpression' &&
      st.expression.callee.type === 'Identifier' && st.expression.callee.name === fn.id.name);
  }
  return false;
}

// PL_STEPS: nơi khai báo bước + nơi gọi bước.
const stepDefs = {};   // 'mod.step' -> [line]
const stepCalls = {};  // tên hàm lõi -> [{mod, step, line}]
const coreDefLine = {};

for (const b of blocks) {
  if (!b.ast) continue;
  const L = (node) => b.bodyLine + node.loc.start.line - 1;
  const esc = (s) => s.replace(/[$]/g, '\\$');
  const wrapperOf = (name) => new RegExp('(?:const|let|var)\\s+[\\w$]+\\s*=\\s*(?:window\\.)?' + esc(name) + '\\b(?!\\s*[(|&])').test(b.code) ||
    new RegExp('(?:window\\.)?' + esc(name) + '\\s*\\.\\s*(?:call|apply)\\s*\\(').test(b.code);

  for (const st of b.ast.body) {
    if (st.type === 'FunctionDeclaration') add(st.id.name, { block: b, line: L(st), kind: 'function', wrapper: false, deferred: false, value: false });
    if (st.type === 'VariableDeclaration') st.declarations.forEach(d => { if (d.id.type === 'Identifier' && d.init && /Function/.test(d.init.type)) add(d.id.name, { block: b, line: L(d), kind: st.kind + ' =fn', wrapper: false, deferred: false, value: false }); });
  }
  walk.ancestor(b.ast, {
    AssignmentExpression(node, _s, ancestors) {
      if (node.operator !== '=') return;
      const t = node.left, r = node.right;
      if (t.type === 'MemberExpression' && t.computed && t.object.type === 'Identifier' && GLOBAL_OBJ.has(t.object.name)) {
        dynamicHooks.push({ block: b, line: L(node) });
        return;
      }
      let name = null, kind = '';
      if (isGlobalMember(t)) {
        name = t.property.name; kind = 'window.' + name + '=';
        if (r.type === 'Identifier' && r.name === name) return;                                   // window.X = X (xuất ra window)
        if (r.type === 'LogicalExpression' && isGlobalMember(r.left) && r.left.property.name === name) return; // window.X = window.X || {}
      } else if (t.type === 'Identifier') {
        const fns = ancestors.filter(a => /Function/.test(a.type));
        if (fns.some(f => declaredIn(f).has(t.name))) return;
        if (!fns.length && !/Function/.test(r.type)) return; // cấp cao nhất: chỉ tính khi gán hàm
        name = t.name; kind = name + '=';
      }
      if (!name) return;
      const deferred = ancestors.filter(a => /Function/.test(a.type)).some(f => !isImmediate(f, ancestors));
      const value = !isFunctionValue(r, ancestors);
      add(name, { block: b, line: L(node), kind: kind + (value ? ' (giá trị)' : ''), wrapper: !value && wrapperOf(name), deferred, value });
    },
    CallExpression(node, _s, ancestors) {
      const c = node.callee;
      if (c.type !== 'Identifier') return;
      const lit = (i) => node.arguments[i] && node.arguments[i].type === 'Literal' ? node.arguments[i].value : null;
      if (c.name === 'plDefineSteps_' && lit(0) && node.arguments[1] && node.arguments[1].type === 'ObjectExpression') {
        node.arguments[1].properties.forEach(p => { const k = p.key && (p.key.name || p.key.value); if (k) (stepDefs[lit(0) + '.' + k] = stepDefs[lit(0) + '.' + k] || []).push(L(p)); });
      }
      if (c.name === 'plStep_' && lit(0) && lit(1)) {
        // Hàm lõi bao ngoài: khai báo function X hoặc gán X=function / window.X=function.
        let owner = '(ngoài hàm)';
        for (let i = ancestors.length - 1; i >= 0; i--) {
          const a = ancestors[i];
          if (a.type === 'FunctionDeclaration' && a.id) { owner = a.id.name; coreDefLine[owner] = coreDefLine[owner] || L(a); break; }
          if (/Function/.test(a.type)) {
            const p = ancestors[i - 1];
            if (p && p.type === 'AssignmentExpression') { owner = isGlobalMember(p.left) ? p.left.property.name : (p.left.name || owner); coreDefLine[owner] = coreDefLine[owner] || L(p); break; }
            if (p && p.type === 'VariableDeclarator' && p.id.type === 'Identifier') { owner = p.id.name; coreDefLine[owner] = coreDefLine[owner] || L(p); break; }
            if (p && p.type === 'Property') continue;
          }
        }
        (stepCalls[owner] = stepCalls[owner] || []).push({ mod: lit(0), step: lit(1), line: L(node) });
      }
    },
  });
}

const multiAll = Object.entries(defs).filter(([, v]) => v.length > 1);
const isValueOnly = (list) => list.every(r => r.value);
const flags = multiAll.filter(([, v]) => isValueOnly(v)).sort((a, b) => a[0].localeCompare(b[0]));
const multi = multiAll.filter(([, v]) => !isValueOnly(v)).sort((a, b) => b[1].length - a[1].length || a[0].localeCompare(b[0]));

if (CHECK) {
  if (multi.length || dynamicHooks.length) {
    multi.forEach(([n, l]) => console.error(`GHI ĐÈ: ${n} — dòng ${l.map(r => r.line).join(', ')}`));
    dynamicHooks.forEach(h => console.error(`GẮN ĐỘNG window[...] — dòng ${h.line}`));
    process.exit(1);
  }
  console.log(`OK: không còn hàm toàn cục bị ghi đè (${blocks.length} khối script).`);
  process.exit(0);
}

const blockRef = (b) => `#${b.n}${b.id ? ' `' + b.id + '`' : ''}`;
let out = '';
out += `# Bản đồ hàm của index.html\n\n`;
out += `Sinh tự động bởi \`tools/patch-map.js\`. Chạy lại sau mỗi lần sửa (trong thư mục \`apps-script\`): \`npm --prefix tools install\` (lần đầu) rồi \`node tools/patch-map.js index.html > PATCH_MAP.md\`. Kiểm tra nhanh: \`node tools/patch-map.js index.html --check\`.\n\n`;
out += `- Số khối \`<script>\` nội tuyến: **${blocks.length}**${blocks.some(b => b.error) ? ' (có khối lỗi cú pháp!)' : ''}\n`;
out += `- Hàm toàn cục còn bị định nghĩa lại / bọc chồng: **${multi.length}**${dynamicHooks.length ? ` (+ ${dynamicHooks.length} chỗ gắn động \`window[...]=\`)` : ''}\n`;
out += `- Hàm lõi dùng bước mở rộng \`PL_STEPS\`: **${Object.keys(stepCalls).length}**\n\n`;

out += `## Quy ước\n\n`;
out += `- Mỗi hàm toàn cục có **một định nghĩa duy nhất**. Không gán lại \`window.X=\` và không bọc \`const old=window.X; window.X=function(){old()…}\`.\n`;
out += `- Khối giao diện nào cần chen vào hàm lõi thì khai báo bước: \`plDefineSteps_('tenKhoi',{tenBuoc:function(){…}})\`.\n`;
out += `- Hàm lõi gọi bước bằng \`plStep_('tenKhoi','tenBuoc',…)\` theo thứ tự ghi trong thân hàm; khối chưa nạp thì bước bị bỏ qua.\n`;
out += `- Bước tên \`before…\`/\`after…\` chạy trước/sau; bước trả \`true\` (vd. \`renderGeneric\`, \`openForm\`, \`blockSave\`) nghĩa là đã tự xử lý hoặc chặn — hàm lõi bỏ qua phần mặc định.\n\n`;

out += `## Hàm lõi và các bước (theo thứ tự chạy)\n\n`;
const cores = Object.keys(stepCalls).sort((a, b) => (coreDefLine[a] || 0) - (coreDefLine[b] || 0));
for (const core of cores) {
  out += `### \`${core}\` — định nghĩa ở dòng ${coreDefLine[core] || '?'}\n\n| # | Bước | Khai báo ở dòng |\n|---|---|---|\n`;
  stepCalls[core].forEach((c, i) => {
    const where = stepDefs[c.mod + '.' + c.step];
    out += `| ${i + 1} | \`${c.mod}.${c.step}\` | ${where ? where.join(', ') : '**chưa khai báo**'} |\n`;
  });
  out += `\n`;
}
const unused = Object.keys(stepDefs).filter(k => !Object.values(stepCalls).some(list => list.some(c => c.mod + '.' + c.step === k)) && !new RegExp("PL_STEPS\\." + k.split('.')[0] + "(?:&&PL_STEPS\\." + k.split('.')[0] + ")?\\." + k.split('.')[1]).test(html));
if (unused.length) out += `Bước đã khai báo nhưng không hàm lõi nào gọi: ${unused.map(k => '`' + k + '`').join(', ')}\n\n`;

out += `## Hàm toàn cục còn bị ghi đè\n\n`;
if (!multi.length) out += `Không còn. ✅\n\n`;
for (const [name, list] of multi) {
  const sync = list.filter(r => !r.deferred), winner = sync[sync.length - 1];
  out += `### \`${name}\` — ${list.length} lần${list.some(r => r.deferred) ? ' ⚠ có bản hoãn' : ''}\n\n| # | Dòng | Khối script | Kiểu | Bọc | Hoãn |\n|---|---|---|---|---|---|\n`;
  list.forEach((r, i) => { out += `| ${i + 1}${r === winner ? ' ★' : ''} | ${r.line} | ${blockRef(r.block)} | \`${r.kind}\` | ${r.wrapper ? '✔' : ''} | ${r.deferred ? '✔' : ''} |\n`; });
  out += `\n`;
}
if (dynamicHooks.length) out += `⚠ Gắn động \`window[...]=\`: ${dynamicHooks.map(h => 'dòng ' + h.line).join(', ')}\n\n`;

out += `## Biến trạng thái gán ở nhiều nơi\n\nKhông phải ghi đè hàm — chỉ là trạng thái được cập nhật từ nhiều chỗ.\n\n| Tên | Các dòng |\n|---|---|\n`;
for (const [name, list] of flags) out += `| \`${name}\` | ${list.map(r => r.line + (r.deferred ? ' (hoãn)' : '')).join(', ')} |\n`;
out += `\n`;

out += `## Danh sách khối script\n\n| # | Dòng | id | Mô tả (chú thích đầu khối) | Bước khai báo |\n|---|---|---|---|---|\n`;
for (const b of blocks) {
  const mods = new Set();
  Object.entries(stepDefs).forEach(([k, lines]) => { if (lines.some(l => l >= b.start && l <= b.end)) mods.add(k.split('.')[0]); });
  out += `| ${b.n} | ${b.start}–${b.end} | ${b.id ? '`' + b.id + '`' : ''} | ${(b.error ? '**LỖI CÚ PHÁP: ' + b.error + '** ' : '') + b.label.replace(/\|/g, '\\|')} | ${[...mods].map(n => '`' + n + '`').join(', ')} |\n`;
}
process.stdout.write(out);
