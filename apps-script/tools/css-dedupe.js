// Dọn CSS trùng trong index.html (an toàn với thứ tự cascade):
//  1) Luật có CÙNG bộ chọn + CÙNG khai báo, cùng ngữ cảnh @media: giữ bản cuối, bỏ bản trước.
//  2) Trong một luật, khai báo trùng thuộc tính: giữ khai báo thắng (có !important ưu tiên, rồi bản sau cùng).
//  3) Bỏ luật rỗng.
// Dùng: node tools/css-dedupe.js index.html   (ghi đè file, in thống kê)
const fs = require('fs');
const postcss = require('postcss');
const file = process.argv[2];
let html = fs.readFileSync(file, 'utf8');
let stats = { rules: 0, decls: 0, empty: 0, blocks: 0 };
const ctx = n => { const a = []; for (let p = n.parent; p && p.type !== 'root'; p = p.parent) if (p.type === 'atrule') a.push('@' + p.name + ' ' + p.params); return a.join('|'); };
html = html.replace(/(<style[^>]*>)([\s\S]*?)(<\/style>)/g, (m, open, css, close) => {
  let root;
  try { root = postcss.parse(css); } catch (e) { return m; }
  stats.blocks++;
  // 2) khai báo trùng trong cùng luật
  root.walkRules(rule => {
    const seen = new Map();
    rule.each(d => { if (d.type !== 'decl') return; const k = d.prop.toLowerCase(); const prev = seen.get(k);
      if (prev) { if (prev.important && !d.important) { d.remove(); stats.decls++; return; } if (prev.value === d.value && prev.important === d.important) { prev.remove(); stats.decls++; } }
      seen.set(k, d); });
  });
  return open + root.toString() + close;
});
// 1) luật trùng hoàn toàn trên toàn file (giữ bản cuối)
const all = [];
html = html.replace(/(<style[^>]*>)([\s\S]*?)(<\/style>)/g, (m, open, css, close) => { all.push(css); return m; });
const roots = all.map(c => { try { return postcss.parse(c); } catch (e) { return null; } });
const keyOf = r => ctx(r) + '||' + r.selector.replace(/\s+/g, ' ').trim() + '||' + r.nodes.filter(n => n.type === 'decl').map(d => d.prop + ':' + d.value + (d.important ? '!' : '')).join(';');
const last = new Map();
roots.forEach((root, i) => root && root.walkRules(r => { last.set(keyOf(r), r); }));
roots.forEach(root => root && root.walkRules(r => { if (last.get(keyOf(r)) !== r) { r.remove(); stats.rules++; } }));
// 1b) thuộc tính ở luật trước bị luật SAU cùng bộ chọn + ngữ cảnh ghi đè chắc chắn (độ ưu tiên >=): bỏ ở luật trước.
stats.overridden = 0;
const bySel = new Map();
roots.forEach(root => root && root.walkRules(r => { const k = ctx(r) + '||' + r.selector.replace(/\s+/g, ' ').trim(); if (!bySel.has(k)) bySel.set(k, []); bySel.get(k).push(r); }));
for (const list of bySel.values()) {
  for (let i = 0; i < list.length - 1; i++) {
    list[i].each(d => {
      if (d.type !== 'decl' || String(d.value).includes('var(') || d.prop.startsWith('--')) return;
      // Không bỏ khi bản sau dùng giá trị mới (dvh, clamp, -webkit-…): bản trước có thể là dự phòng cho trình duyệt cũ.
      const later = list.slice(i + 1).some(r => r.nodes.some(x => x.type === 'decl' && x.prop.toLowerCase() === d.prop.toLowerCase() && (x.important || !d.important) && !/[ds]v[hw]|lv[hw]|-webkit-|-moz-|clamp\(|min\(|max\(|fit-content|stretch/.test(x.value)));
      if (later) { d.remove(); stats.overridden++; }
    });
  }
}
roots.forEach(root => root && root.walkRules(r => { if (!r.nodes.some(n => n.type === 'decl')) { r.remove(); stats.empty++; } }));
roots.forEach(root => root && root.walkAtRules(a => { if (/media|supports/.test(a.name) && !a.nodes.length) a.remove(); }));
let i = 0;
html = html.replace(/(<style[^>]*>)([\s\S]*?)(<\/style>)/g, (m, open, css, close) => { const r = roots[i++]; return r ? open + r.toString() + close : m; });
fs.writeFileSync(file, html);
console.log(JSON.stringify(stats));
