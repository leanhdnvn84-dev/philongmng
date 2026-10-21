/**
 * Tạo cloudflare/index.html và cloudflare/worker.js từ tai-ve/NguyenHien-iframe.html.
 * worker.js: dán vào Cloudflare → Workers & Pages → Edit code; mọi đường dẫn trả về trang khung.
 * Chạy: node tools/build-cloudflare.js
 */
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(ROOT, 'tai-ve', 'NguyenHien-iframe.html'), 'utf8');
/* Nền giấy mời (assets/giay-moi-nen.webp) không còn nhúng trong web app: Worker trả ở /giay-moi-nen.webp (CORS cho html2canvas, cache 30 ngày) */
const gm = fs.readFileSync(path.join(ROOT, 'assets', 'giay-moi-nen.webp')).toString('base64');
fs.mkdirSync(path.join(ROOT, 'cloudflare'), { recursive: true });
fs.writeFileSync(path.join(ROOT, 'cloudflare', 'index.html'), html);
fs.writeFileSync(path.join(ROOT, 'cloudflare', 'worker.js'), `/**
 * Cloudflare Worker: trang khung THPT Nguyễn Hiền · Khoá 2000 – 2003
 * Dán toàn bộ file này vào Workers & Pages → nguyenhien → Edit code → Deploy.
 * Mọi đường dẫn đều trả về trang khung nhúng web app Apps Script (link /exec),
 * riêng /giay-moi-nen.webp trả ảnh nền giấy mời (web app tải khi mở giấy mời).
 */
const HTML = ${JSON.stringify(html)};
const GM_B64 = ${JSON.stringify(gm)};
let GM = null;

export default {
  async fetch(request) {
    if (new URL(request.url).pathname === '/giay-moi-nen.webp') {
      if (!GM) GM = Uint8Array.from(atob(GM_B64), function (c) { return c.charCodeAt(0); });
      return new Response(GM, {
        headers: {
          'content-type': 'image/webp',
          'cache-control': 'public, max-age=2592000, immutable',
          'access-control-allow-origin': '*'
        }
      });
    }
    return new Response(HTML, {
      headers: {
        'content-type': 'text/html; charset=utf-8',
        'cache-control': 'public, max-age=300'
      }
    });
  }
};
`);
console.log('Đã ghi cloudflare/index.html và cloudflare/worker.js');
