// Phân tích các lớp vá trong index.html: hàm/biến toàn cục nào bị định nghĩa lại ở đâu.
const fs = require('fs');
const acorn = require('acorn');
const walk = require('acorn-walk');

const file = process.argv[2];
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
const defs = {}; // name -> [{block, line, kind, wrapper, deferred}]
const add = (name, rec) => { (defs[name] = defs[name] || []).push(rec); rec.block.defs.push(name); };

function declaredIn(fnNode) {
  const names = new Set();
  (fnNode.params || []).forEach(p => walk.simple(p, { Identifier(n) { names.add(n.name); } }, undefined, undefined));
  const body = fnNode.body;
  walk.recursive(body, null, {
    Function(node) { if (node.type === 'FunctionDeclaration' && node.id) names.add(node.id.name); },
    VariableDeclarator(node) { if (node.id.type === 'Identifier') names.add(node.id.name); },
  });
  return names;
}
// Hàm chạy ngay: IIFE, hoặc hàm có tên được gọi trực tiếp (\`install();\`) ở thân hàm/khối bao ngoài.
function isImmediate(fn, ancestors) {
  const i = ancestors.indexOf(fn), parent = ancestors[i - 1];
  if (parent && (parent.type === 'CallExpression' || parent.type === 'NewExpression') && parent.callee === fn) return true;
  if (fn.type === 'FunctionDeclaration' && fn.id && parent && Array.isArray(parent.body)) {
    return parent.body.some(st => st.type === 'ExpressionStatement' && st.expression.type === 'CallExpression' &&
      st.expression.callee.type === 'Identifier' && st.expression.callee.name === fn.id.name);
  }
  return false;
}

for (const b of blocks) {
  let ast;
  try { ast = acorn.parse(b.code, { ecmaVersion: 'latest', sourceType: 'script', locations: true, allowReturnOutsideFunction: true }); }
  catch (e) { b.error = e.message; continue; }
  const L = (node) => b.bodyLine + node.loc.start.line - 1;
  const wrapperOf = (name) => new RegExp('(?:const|let|var)\\s+[\\w$]+\\s*=\\s*(?:window\\.)?' + name.replace(/\$/g, '\\$') + '\\b(?!\\s*\\()').test(b.code) ||
    new RegExp('(?:window\\.)?' + name.replace(/\$/g, '\\$') + '\\s*\\.\\s*(?:call|apply)\\s*\\(').test(b.code);

  // Khai báo cấp cao nhất của khối script => toàn cục.
  for (const st of ast.body) {
    if (st.type === 'FunctionDeclaration') add(st.id.name, { block: b, line: L(st), kind: 'function', wrapper: false, deferred: false });
    if (st.type === 'VariableDeclaration') st.declarations.forEach(d => { if (d.id.type === 'Identifier' && d.init && /Function/.test(d.init.type)) add(d.id.name, { block: b, line: L(d), kind: st.kind + ' =fn', wrapper: false, deferred: false }); });
  }
  // Gán lại: window.X = … hoặc X = … (X không khai báo cục bộ).
  walk.ancestor(ast, {
    AssignmentExpression(node, _s, ancestors) {
      if (node.operator !== '=') return;
      let name = null, kind = '';
      const t = node.left;
      if (t.type === 'MemberExpression' && !t.computed && t.object.type === 'Identifier' && GLOBAL_OBJ.has(t.object.name)) { name = t.property.name; kind = 'window.' + name + '='; }
      else if (t.type === 'Identifier') {
        const fns = ancestors.filter(a => /Function/.test(a.type));
        if (!fns.length) return; // cấp cao nhất: không phải ghi đè hàm
        if (fns.some(f => declaredIn(f).has(t.name))) return;
        name = t.name; kind = name + '=';
      }
      if (!name) return;
      const fnsAll = ancestors.filter(a => /Function/.test(a.type));
      const deferred = fnsAll.some(f => !isImmediate(f, ancestors));
      const isFn = !/^(Literal|ObjectExpression|ArrayExpression|TemplateLiteral|BinaryExpression|UnaryExpression)$/.test(node.right.type);
      add(name, { block: b, line: L(node), kind: kind + (isFn ? '' : ' (giá trị)'), wrapper: wrapperOf(name), deferred });
    },
  });
}

// Chỉ giữ những tên thực sự bị định nghĩa hơn 1 lần và là hàm/cờ toàn cục.
const isValueOnly = (list) => list.every(r => / \(giá trị\)$/.test(r.kind));
const multiAll = Object.entries(defs).filter(([, v]) => v.length > 1);
const flags = multiAll.filter(([, v]) => isValueOnly(v)).sort((a, b) => a[0].localeCompare(b[0]));
const multi = multiAll.filter(([, v]) => !isValueOnly(v)).sort((a, b) => b[1].length - a[1].length || a[0].localeCompare(b[0]));
const blockRef = (b) => `#${b.n}${b.id ? ' `' + b.id + '`' : ''}`;
let out = '';
out += `# Bản đồ lớp vá của index.html\n\n`;
out += `Sinh tự động bởi \`tools/patch-map.js\` (phân tích cú pháp bằng acorn). Chạy lại sau mỗi lần sửa (trong thư mục \`apps-script\`): \`npm --prefix tools install\` (lần đầu) rồi \`node tools/patch-map.js index.html > PATCH_MAP.md\`.\n\n`;
out += `- Số khối \`<script>\` nội tuyến: **${blocks.length}**${blocks.some(b => b.error) ? ' (có khối lỗi cú pháp!)' : ''}\n`;
out += `- Số hàm toàn cục bị định nghĩa/ghi đè từ 2 lần trở lên: **${multi.length}** (+ ${flags.length} cờ/biến trạng thái được gán ở nhiều nơi)\n\n`;
out += `### Top hàm bị ghi đè nhiều nhất\n\n| Hàm | Số lần | Bản có hiệu lực ★ |\n|---|---|---|\n`;
for (const [name, list] of multi.slice(0, 15)) { const sync = list.filter(r => !r.deferred), w = sync[sync.length - 1] || list[list.length - 1]; out += `| \`${name}\` | ${list.length} | dòng ${w.line}, khối ${blockRef(w.block)} |\n`; }
out += `\n`;
out += `## Cách đọc\n\n`;
out += `- **Thứ tự**: theo vị trí trong file = thứ tự trình duyệt chạy. Bản *đồng bộ* (không hoãn) xuất hiện **sau cùng** là bản đang có hiệu lực khi trang tải xong.\n`;
out += `- **Bọc**: khối này lưu bản trước (\`const old=window.X\`) rồi gọi lại nó ⇒ bản mới *chồng lên* chứ không thay thế; sửa ở bản cũ vẫn có tác dụng.\n`;
out += `- **Hoãn**: phép gán nằm trong callback (DOMContentLoaded, setTimeout, MutationObserver, hàm được gọi sau…) ⇒ có thể chạy muộn hơn và thắng cả bản đứng sau trong file. Cần kiểm tra thủ công.\n`;
out += `- **Khi sửa một hàm**: sửa ở bản ★ (có hiệu lực). Nếu bản ★ là \"Bọc\", lần ngược lên các bản trước để biết logic gốc nằm ở đâu.\n\n`;
out += `## Hàm/biến toàn cục bị ghi đè\n\n`;
for (const [name, list] of multi) {
  const sync = list.filter(r => !r.deferred);
  const winner = sync[sync.length - 1];
  const deferredAfter = list.some(r => r.deferred);
  out += `### \`${name}\` — ${list.length} lần${deferredAfter ? ' ⚠ có bản hoãn' : ''}\n\n`;
  out += `| # | Dòng | Khối script | Kiểu | Bọc | Hoãn |\n|---|---|---|---|---|---|\n`;
  list.forEach((r, i) => {
    out += `| ${i + 1}${r === winner ? ' ★' : ''} | ${r.line} | ${blockRef(r.block)} | \`${r.kind}\` | ${r.wrapper ? '✔' : ''} | ${r.deferred ? '✔' : ''} |\n`;
  });
  out += `\n`;
}
out += `## Cờ / biến trạng thái gán ở nhiều nơi\n\nKhông phải ghi đè hàm — chỉ là trạng thái được cập nhật từ nhiều chỗ.\n\n| Tên | Các dòng |\n|---|---|\n`;
for (const [name, list] of flags) out += `| \`${name}\` | ${list.map(r => r.line + (r.deferred ? ' (hoãn)' : '')).join(', ')} |\n`;
out += `\n`;
out += `## Danh sách khối script\n\n| # | Dòng | id | Mô tả (chú thích đầu khối) | Định nghĩa/ghi đè tên dùng chung |\n|---|---|---|---|---|\n`;
const multiNames = new Set(multi.map(([n]) => n));
for (const b of blocks) {
  const shared = [...new Set(b.defs.filter(n => multiNames.has(n)))];
  out += `| ${b.n} | ${b.start}–${b.end} | ${b.id ? '`' + b.id + '`' : ''} | ${(b.error ? '**LỖI CÚ PHÁP: ' + b.error + '** ' : '') + b.label.replace(/\|/g, '\\|')} | ${shared.map(n => '`' + n + '`').join(', ')} |\n`;
}
process.stdout.write(out);
