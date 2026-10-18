/**
 * Tạo cloudflare/index.html và cloudflare/worker.js từ tai-ve/NguyenHien-iframe.html.
 * worker.js: dán vào Cloudflare → Workers & Pages → Edit code; mọi đường dẫn trả về trang khung.
 * Chạy: node tools/build-cloudflare.js
 */
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(ROOT, 'tai-ve', 'NguyenHien-iframe.html'), 'utf8');
fs.mkdirSync(path.join(ROOT, 'cloudflare'), { recursive: true });
fs.writeFileSync(path.join(ROOT, 'cloudflare', 'index.html'), html);
fs.writeFileSync(path.join(ROOT, 'cloudflare', 'worker.js'), `/**
 * Cloudflare Worker: trang khung THPT Nguyễn Hiền · Khoá 2000 – 2003
 * Dán toàn bộ file này vào Workers & Pages → nguyenhien → Edit code → Deploy.
 * Mọi đường dẫn đều trả về trang khung nhúng web app Apps Script (link /exec).
 */
const HTML = ${JSON.stringify(html)};

export default {
  async fetch(request) {
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
