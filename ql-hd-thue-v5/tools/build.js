// Gộp lõi, đối chiếu, giao diện và dữ liệu cũ thành MỘT file HTML chạy offline.
const fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..');
const read = p => fs.readFileSync(path.join(root, p), 'utf8');
const legacy = read('data/legacy.json');
// Chặn đoạn "</script>" trong dữ liệu để không đóng thẻ sớm.
const safeLegacy = legacy.replace(/<\/script/gi, '<\\/script');
let html = read('src/index.template.html');
const parts = { '/*__LEGACY_JSON__*/null': safeLegacy, '/*__ENGINE__*/': read('src/engine.js'), '/*__RECON__*/': read('src/reconcile.js'), '/*__APP__*/': read('src/app.js') };
for (const [k, v] of Object.entries(parts)) {
  if (!html.includes(k)) throw new Error('Thiếu placeholder ' + k);
  html = html.replace(k, () => v);
}
fs.mkdirSync(path.join(root, 'dist'), { recursive: true });
const out = path.join(root, 'dist', 'ql-hd-thue-v5.html');
fs.writeFileSync(out, html, 'utf8');
console.log('built', out, (html.length / 1024).toFixed(0) + ' KB');
