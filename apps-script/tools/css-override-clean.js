// Dọn CSS vá chồng: cùng MỘT bộ chọn nhưng được "nâng độ ưu tiên" ở các bản vá sau
// (html#plMobileViewport thay cho #plMobileViewport, thêm :not(#pl-s1):not(#pl-s2)…, lặp lớp .a.a.a).
// Các biến thể đó chọn ĐÚNG cùng tập phần tử, nên với mỗi thuộc tính chỉ một khai báo thắng:
// !important trước, rồi độ ưu tiên, rồi bản sau cùng. Khai báo thua bị bỏ; luật rỗng bị bỏ.
// Chỉ so trong cùng ngữ cảnh @media/@supports. Không đụng khai báo dùng var() hoặc biến --x,
// và giữ bản trước khi bản thắng dùng giá trị mới (dvh, clamp, -webkit-…) có thể là dự phòng.
// Dùng: node tools/css-override-clean.js index.html   (ghi đè file, in thống kê)
const fs = require('fs');
const postcss = require('postcss');
const file = process.argv[2];
let html = fs.readFileSync(file, 'utf8');
const stats = { decls: 0, empty: 0, groups: 0 };
const ctx = n => { const a = []; for (let p = n.parent; p && p.type !== 'root'; p = p.parent) if (p.type === 'atrule') a.push('@' + p.name + ' ' + p.params); return a.join('|'); };
const BOOST_NOT = /:not\(#pl-[a-z]\d\)/g;
// Tách danh sách bộ chọn theo dấu phẩy ở cấp ngoài cùng.
function splitList(sel) { const out = []; let d = 0, cur = ''; for (const c of sel) { if (c === '(') d++; if (c === ')') d--; if (c === ',' && !d) { out.push(cur.trim()); cur = ''; } else cur += c; } out.push(cur.trim()); return out; }
// Chuẩn hóa một bộ chọn + đếm phần "tăng ưu tiên" [id, lớp, thẻ] đã gỡ bỏ.
function norm(part) {
  let s = part.replace(/\s+/g, ' ').trim(), ids = 0, cls = 0, el = 0;
  s = s.replace(BOOST_NOT, () => { ids++; return ''; });
  s = s.replace(/(^|[\s>+~(])html(#plMobileViewport)/g, (m, a, b) => { el++; return a + b; });
  s = s.replace(/(\.[A-Za-z_][\w-]*)(\1)+(?![\w-])/g, (m, one) => { cls += m.length / one.length - 1; return one; });
  return { key: s, boost: [ids, cls, el] };
}
const cmp = (a, b) => a[0] - b[0] || a[1] - b[1] || a[2] - b[2];
const risky = v => /[ds]v[hw]|lv[hw]|-webkit-|-moz-|clamp\(|min\(|max\(|fit-content|stretch/.test(v);

// Bỏ qua chuỗi "<style>" nằm trong <script> (mẫu in, chú thích).
const scripts = []; html.replace(/<script[^>]*>[\s\S]*?<\/script>/g, (m, at) => { scripts.push([at, at + m.length]); return m; });
const inScript = at => scripts.some(([a, b]) => at > a && at < b);
const blocks = [];
html.replace(/(<style[^>]*>)([\s\S]*?)(<\/style>)/g, (m, o, css, at) => { blocks.push(inScript(at) ? null : css); return m; });
const roots = blocks.map(c => { if (c == null) return null; try { return postcss.parse(c); } catch (e) { return null; } });
const groups = new Map();
let order = 0;
roots.forEach(root => root && root.walkRules(r => {
  const parts = splitList(r.selector).map(norm);
  const key = ctx(r) + '||' + parts.map(p => p.key).join(', ');
  if (!groups.has(key)) groups.set(key, []);
  groups.get(key).push({ rule: r, boosts: parts.map(p => p.boost), order: order++ });
}));
for (const list of groups.values()) {
  if (list.length < 2) continue;
  // Chỉ xử lý khi mọi phần của danh sách bộ chọn có cùng chiều so sánh ưu tiên (không mơ hồ).
  const rank = (a, b) => { const c = a.boosts.map((x, i) => cmp(x, b.boosts[i])); if (c.every(v => v === 0)) return 0; if (c.every(v => v >= 0)) return 1; if (c.every(v => v <= 0)) return -1; return null; };
  let ok = true;
  for (let i = 0; i < list.length && ok; i++) for (let j = i + 1; j < list.length; j++) if (rank(list[i], list[j]) === null) { ok = false; break; }
  if (!ok) continue;
  stats.groups++;
  const byProp = new Map();
  list.forEach(e => e.rule.each(d => { if (d.type !== 'decl' || d.prop.startsWith('--')) return; const p = d.prop.toLowerCase(); if (!byProp.has(p)) byProp.set(p, []); byProp.get(p).push({ d, e }); }));
  for (const decls of byProp.values()) {
    if (decls.length < 2 || decls.some(x => String(x.d.value).includes('var('))) continue;
    // Khai báo thắng: !important → ưu tiên cao hơn → xuất hiện sau.
    const win = decls.reduce((w, x) => { if (x.d.important !== w.d.important) return x.d.important ? x : w; const r = rank(x.e, w.e); if (r > 0) return x; if (r < 0) return w; return x.e.order > w.e.order ? x : w; });
    if (risky(win.d.value)) continue;
    decls.forEach(x => { if (x !== win) { x.d.remove(); stats.decls++; } });
  }
}
roots.forEach(root => root && root.walkRules(r => { if (!r.nodes.some(n => n.type === 'decl')) { r.remove(); stats.empty++; } }));
roots.forEach(root => root && root.walkAtRules(a => { if (/media|supports/.test(a.name) && a.nodes && !a.nodes.length) a.remove(); }));
let i = 0;
html = html.replace(/(<style[^>]*>)([\s\S]*?)(<\/style>)/g, (m, open, css, close) => { const r = roots[i++]; return r ? open + r.toString() + close : m; });
fs.writeFileSync(file, html);
console.log(JSON.stringify(stats));
