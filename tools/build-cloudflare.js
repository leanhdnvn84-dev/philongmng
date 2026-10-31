/**
 * Tạo cloudflare/index.html và cloudflare/worker.js từ tai-ve/NguyenHien-iframe.html.
 * worker.js: dán vào Cloudflare → Workers & Pages → Edit code.
 * 31/10: thử chuyển hướng 302 thẳng sang /exec cho nhanh, nhưng thanh địa chỉ hiện script.google.com – người dùng không chịu → quay lại trang khung iframe gọn.
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
 * Mọi đường dẫn trả về trang khung gọn (iframe nhúng web app Apps Script /exec – thanh địa chỉ giữ tên miền gọn),
 * riêng /giay-moi-nen.webp trả ảnh nền giấy mời (web app tải khi mở giấy mời).
 */
const HTML = ${JSON.stringify(html)};
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
    return new Response(HTML, {
      headers: {
        'content-type': 'text/html; charset=utf-8',
        'cache-control': 'public, max-age=3600',
        /* trình duyệt mở sẵn kết nối tới Google ngay khi nhận tiêu đề, trước cả khi đọc trang */
        'link': '<https://script.google.com>; rel=preconnect, <https://script.googleusercontent.com>; rel=preconnect'
      }
    });
  }
};
`);
console.log('Đã ghi cloudflare/index.html và cloudflare/worker.js');
