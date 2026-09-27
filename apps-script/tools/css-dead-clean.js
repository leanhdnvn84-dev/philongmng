// Bỏ luật CSS "chết": bộ chọn cần một id/class KHÔNG còn xuất hiện ở đâu ngoài CSS
// (không có trong HTML, JavaScript của index.html, cũng không có trong Code.gs) → không thể khớp phần tử nào.
// Tên được ghép động trong JS ('pl47-'+col, `v17_${f}`, 'is-'+s…) được giữ: mọi tên bắt đầu bằng
// một tiền tố ghép động đều coi là còn dùng. Bộ chọn danh sách (a, b) chỉ bỏ phần chết.
// Dùng: node tools/css-dead-clean.js index.html [Code.gs]   (ghi đè file, in thống kê)
const fs = require('fs');
const path = require('path');
const postcss = require('postcss');
const file = process.argv[2];
const gsFile = process.argv[3] || path.join(path.dirname(file), 'Code.gs');
let html = fs.readFileSync(file, 'utf8');
const gs = fs.existsSync(gsFile) ? fs.readFileSync(gsFile, 'utf8') : '';
const stats = { parts: 0, rules: 0, bytes: 0 };

const scripts = []; html.replace(/<script[^>]*>[\s\S]*?<\/script>/g, (m, at) => { scripts.push([at, at + m.length]); return m; });
const inScript = at => scripts.some(([a, b]) => at > a && at < b);
// Văn bản ngoài các khối <style> thật (HTML + JS) + Code.gs.
let other = gs, last = 0;
html.replace(/<style[^>]*>[\s\S]*?<\/style>/g, (m, at) => { if (inScript(at)) return m; other += html.slice(last, at); last = at + m.length; return m; });
other += html.slice(last);
const dyn = new Set();
other.replace(/([A-Za-z_][\w-]*)['"`]\s*\+/g, (m, p) => dyn.add(p));
other.replace(/([A-Za-z_][\w-]*)\$\{/g, (m, p) => dyn.add(p));
const used = name => other.includes(name) || [...dyn].some(p => name.startsWith(p));
const deadPart = sel => (sel.replace(/:not\([^)]*\)/g, '').match(/[#.][A-Za-z_][\w-]*/g) || []).some(t => !used(t.slice(1)));
const split = sel => { const out = []; let d = 0, cur = ''; for (const c of sel) { if (c === '(') d++; if (c === ')') d--; if (c === ',' && !d) { out.push(cur.trim()); cur = ''; } else cur += c; } out.push(cur.trim()); return out; };

html = html.replace(/(<style[^>]*>)([\s\S]*?)(<\/style>)/g, (m, open, css, close, at) => {
  if (inScript(at)) return m;
  let root; try { root = postcss.parse(css); } catch (e) { return m; }
  root.walkRules(r => {
    if (r.parent.type === 'atrule' && /keyframes/i.test(r.parent.name)) return;
    const parts = split(r.selector), keep = parts.filter(p => !deadPart(p));
    if (keep.length === parts.length) return;
    stats.parts += parts.length - keep.length;
    if (!keep.length) { stats.rules++; stats.bytes += r.toString().length; r.remove(); } else r.selector = keep.join(',');
  });
  root.walkAtRules(a => { if (/media|supports/.test(a.name) && a.nodes && !a.nodes.length) a.remove(); });
  return open + root.toString() + close;
});
fs.writeFileSync(file, html);
console.log(JSON.stringify(stats));
