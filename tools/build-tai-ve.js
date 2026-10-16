/**
 * Tạo bản tải về tai-ve/NguyenHien-2000-2003.html từ apps-script/Index.html.
 *
 * Trình xem tệp trên điện thoại (iPhone, Zalo, Drive…) thường không chạy JavaScript,
 * nên trang chỉ hiện mỗi phần đầu. Script này mở Index.html trong Chromium, chụp lại
 * nội dung các trang đã vẽ bằng dữ liệu mẫu rồi ghi sẵn vào HTML:
 *  - Không có JavaScript: hiện tất cả các trang nối tiếp nhau để cuộn đọc.
 *  - Có JavaScript: trang chạy như bình thường (bỏ class "nojs", vẽ lại từ đầu).
 *
 * tai-ve/Index.html (dán vào Apps Script) bỏ phần dữ liệu mẫu trong const DEMO cho nhẹ.
 *
 * Chạy: node tools/build-tai-ve.js   (cần playwright + Chromium)
 */
const fs = require('fs');
const path = require('path');
const { chromium } = require(process.env.PLAYWRIGHT || 'playwright');

const ROOT = path.join(__dirname, '..');
const SRC = path.join(ROOT, 'apps-script', 'Index.html');
const OUT = path.join(ROOT, 'tai-ve', 'NguyenHien-2000-2003.html');
const OUT_GAS = path.join(ROOT, 'tai-ve', 'Index.html'); // bản dán vào Apps Script (file HTML tên Index), không vẽ sẵn nội dung mẫu
const IDS = ['v-home', 'v-classes', 'v-events', 'v-yearbook', 'v-gallery', 'v-connect', 'v-birthday', 'foot', 'navTop', 'navBot', 'albumList'];

const NOJS_CSS = `
/* ===== BẢN TĨNH (khi trình xem không chạy JavaScript) ===== */
.nojs-only{display:none}
html.nojs .nojs-only{display:block;background:#FFF8E1;color:#7A5600;border-bottom:1px solid #F0D68A;padding:10px 16px;font-size:14px;text-align:center}
html.nojs .view{display:block}
html.nojs #v-admin,html.nojs nav.bot,html.nojs .g nav{display:none}
html.nojs body{padding-bottom:0}
html.nojs .view+.view{border-top:8px solid #22213A}
html.nojs .p-home .nho p{max-height:none;opacity:1}
html.nojs .p-home .nho small,html.nojs .p-cls .nhoai button,html.nojs .p-cls .search{display:none}
`;

function put(s, a, b) {
  if (s.split(a).length !== 2) throw new Error('Không tìm thấy đúng 1 chỗ: ' + a.slice(0, 60));
  return s.split(a).join(b);
}

(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1280, height: 900 }, reducedMotion: 'reduce' });
  await p.goto('file://' + SRC);
  await p.waitForTimeout(500);
  const snap = await p.evaluate(ids => Object.fromEntries(ids.map(id => [id, document.getElementById(id).innerHTML])), IDS);
  await b.close();

  let s = fs.readFileSync(SRC, 'utf8');
  // Apps Script cắt "//…" tới hết dòng và "/* … */" trong <script>, kể cả khi nằm trong chuỗi
  // → chỉ được dùng hai cặp ký tự này cho chú thích thật (dòng bắt đầu bằng /*).
  [...s.matchAll(/<script>([\s\S]*?)<\/script>/g)].forEach(m => {
    m[1].split('\n').forEach((l, i) => {
      const t = l.replace(/^\s*\/\*.*?\*\/\s*/, '');
      if (/\/\/|\/\*/.test(t)) throw new Error('Có "//" hoặc "/*" trong script (Apps Script sẽ cắt mất): ' + t.trim().slice(0, 100));
    });
  });
  // Bản cho Apps Script: chạy thật không bao giờ dùng DEMO (chỉ lấy cfg mặc định) → bỏ dữ liệu mẫu cho nhẹ, mở nhanh hơn
  const m = s.match(/^const DEMO=(.*);$/m);
  if (!m) throw new Error('Không tìm thấy dòng const DEMO=');
  const demoCfg = JSON.parse(m[1]).cfg;
  const nhe = { tinTuc: [], dangKy: { tong: 0, theoLop: {} }, cfg: demoCfg, lop: [], hoatDong: [], thayCo: [], luuBut: [], anh: [] };
  const src = s.replace(m[0], () => 'const DEMO=' + JSON.stringify(nhe) + ';');
  s = put(s, '<html lang="vi">', '<html lang="vi" class="nojs">');
  s = put(s, '/* ===== RESPONSIVE ===== */', NOJS_CSS + '\n/* ===== RESPONSIVE ===== */');
  s = put(s, '<body data-p="home">', '<body data-p="home">\n<div class="nojs-only">Đang hiển thị bản đọc vì nút bấm chưa chạy được. Nếu mở tệp tải về, hãy mở bằng Safari hoặc Chrome để tìm bạn, xem ảnh lớn và chuyển trang.</div>');
  IDS.forEach(id => {
    const re = new RegExp('(<(section|footer|nav|datalist)\\b[^>]*\\bid="' + id + '"[^>]*>)(</\\2>)');
    if (!re.test(s)) throw new Error('Không tìm thấy khung #' + id);
    s = s.replace(re, (m, open, tag, close) => open + snap[id] + close);
  });
  // gỡ class "nojs" ở cuối script khởi động: chạy tới đây nghĩa là JavaScript không lỗi
  s = s.replace(/\n<\/script>\n<\/body>/, () => "\ndocument.documentElement.classList.remove('nojs');\n</script>\n</body>");
  if (!s.includes("classList.remove('nojs')")) throw new Error('Không chèn được lệnh gỡ nojs');
  fs.writeFileSync(OUT, s);
  fs.writeFileSync(OUT_GAS, src);
  console.log('Đã ghi', path.relative(ROOT, OUT), (s.length / 1024).toFixed(0) + ' KB');
})().catch(e => { console.error(e); process.exit(1); });
