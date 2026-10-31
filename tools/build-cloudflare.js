/**
 * Tạo cloudflare/index.html và cloudflare/worker.js từ tai-ve/NguyenHien-iframe.html.
 * worker.js: dán vào Cloudflare → Workers & Pages → Edit code.
 * 31/10: người dùng báo vào qua iframe vẫn chậm, mở thẳng link Apps Script thì nhanh → Worker KHÔNG trả trang khung nữa
 * mà chuyển hướng 302 ngay sang link /exec (giữ tham số, vd. ?viet=1). Trang khung vẫn giữ ở tai-ve/ để dùng lại khi cần.
 * Chạy: node tools/build-cloudflare.js
 */
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(ROOT, 'tai-ve', 'NguyenHien-iframe.html'), 'utf8');
const EXEC = html.match(/var U='(https:[^']*\/exec)'/)[1];
/* Nền giấy mời (assets/giay-moi-nen.webp) không còn nhúng trong web app: Worker trả ở /giay-moi-nen.webp (CORS cho html2canvas, cache 30 ngày) */
const gm = fs.readFileSync(path.join(ROOT, 'assets', 'giay-moi-nen.webp')).toString('base64');
fs.mkdirSync(path.join(ROOT, 'cloudflare'), { recursive: true });
fs.writeFileSync(path.join(ROOT, 'cloudflare', 'index.html'), html);
fs.writeFileSync(path.join(ROOT, 'cloudflare', 'worker.js'), `/**
 * Cloudflare Worker: trang khung THPT Nguyễn Hiền · Khoá 2000 – 2003
 * Dán toàn bộ file này vào Workers & Pages → nguyenhien → Edit code → Deploy.
 * Mọi đường dẫn chuyển thẳng (302) sang web app Apps Script /exec, giữ nguyên tham số (vd. ?viet=1 từ mã QR Gala) –
 * không qua iframe nên mở nhanh như link gốc; riêng /giay-moi-nen.webp trả ảnh nền giấy mời (web app tải khi mở giấy mời).
 */
const EXEC = ${JSON.stringify(EXEC)};
const GM_B64 = ${JSON.stringify(gm)};
let GM = null;

export default {
  async fetch(request) {
    const u = new URL(request.url);
    if (u.pathname === '/giay-moi-nen.webp') {
      if (!GM) GM = Uint8Array.from(atob(GM_B64), function (c) { return c.charCodeAt(0); });
      return new Response(GM, {
        headers: {
          'content-type': 'image/webp',
          'cache-control': 'public, max-age=2592000, immutable',
          'access-control-allow-origin': '*'
        }
      });
    }
    if (u.pathname === '/favicon.ico') return new Response(null, { status: 204 });
    return new Response(null, { status: 302, headers: { location: EXEC + u.search, 'cache-control': 'no-store' } });
  }
};
`);
console.log('Đã ghi cloudflare/index.html và cloudflare/worker.js');
