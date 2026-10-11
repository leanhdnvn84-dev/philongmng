/**
 * Tạo bản tải về tai-ve/NguyenHien-2000-2003.html từ apps-script/Index.html.
 *
 * Trình xem tệp trên điện thoại (iPhone, Zalo, Drive…) thường không chạy JavaScript,
 * nên trang chỉ hiện mỗi phần đầu. Script này mở Index.html trong Chromium, chụp lại
 * nội dung các trang đã vẽ bằng dữ liệu mẫu rồi ghi sẵn vào HTML:
 *  - Không có JavaScript: hiện tất cả các trang nối tiếp nhau để cuộn đọc.
 *  - Có JavaScript: trang chạy như bình thường (bỏ class "nojs", vẽ lại từ đầu).
 *
 * Chạy: node tools/build-tai-ve.js   (cần playwright + Chromium)
 */
const fs = require('fs');
const path = require('path');
const { chromium } = require(process.env.PLAYWRIGHT || 'playwright');

const ROOT = path.join(__dirname, '..');
const SRC = path.join(ROOT, 'apps-script', 'Index.html');
const OUT = path.join(ROOT, 'tai-ve', 'NguyenHien-2000-2003.html');
const IDS = ['v-home', 'v-classes', 'v-events', 'v-yearbook', 'v-gallery', 'v-connect', 'foot', 'navTop', 'navBot', 'albumList'];

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
  s = put(s, '<html lang="vi">', '<html lang="vi" class="nojs">');
  s = put(s, '/* ===== RESPONSIVE ===== */', NOJS_CSS + '\n/* ===== RESPONSIVE ===== */');
  s = put(s, '<body data-p="home">', '<body data-p="home">\n<div class="nojs-only">Bạn đang xem bản đọc (trình xem tệp không chạy được nút bấm). Mở tệp bằng Safari hoặc Chrome để tìm bạn, xem ảnh lớn và chuyển trang.</div>');
  IDS.forEach(id => {
    const re = new RegExp('(<(section|footer|nav|datalist)\\b[^>]*\\bid="' + id + '"[^>]*>)(</\\2>)');
    if (!re.test(s)) throw new Error('Không tìm thấy khung #' + id);
    s = s.replace(re, (m, open, tag, close) => open + snap[id] + close);
  });
  s = put(s, "if(window.google&&google.script&&google.script.run)loadPublic().catch(err);\n</script>",
    "if(window.google&&google.script&&google.script.run)loadPublic().catch(err);\ndocument.documentElement.classList.remove('nojs');\n</script>");
  fs.writeFileSync(OUT, s);
  console.log('Đã ghi', path.relative(ROOT, OUT), (s.length / 1024).toFixed(0) + ' KB');
})().catch(e => { console.error(e); process.exit(1); });
