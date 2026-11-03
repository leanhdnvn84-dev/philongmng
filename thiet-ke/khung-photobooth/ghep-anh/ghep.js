/* Ghép ảnh thật vào mẫu: node ghep.js → ghep-anh/*.jpg (mẫu 36 "Ngày trở về" đầy đủ) */
const { chromium } = require('playwright');
const D = __dirname + '/../';
const VIEC = [[2, 'ghep-anh/anh-1.jpg,ghep-anh/anh-2.jpg', 'ngay-tro-ve-anh-doi'], [1, 'ghep-anh/anh-1.jpg', 'ngay-tro-ve-ngang-anh-1'], [1, 'ghep-anh/anh-2.jpg', 'ngay-tro-ve-ngang-anh-2']];
(async () => {
  const b = await chromium.launch();
  for (const [k, anh, ten] of VIEC) {
    const p = await b.newPage({ viewport: k === 1 ? { width: 1800, height: 1200 } : { width: 1200, height: 1800 } });
    await p.goto('file://' + D + 'mau.html?m=36&b=' + k + '&xem=1&anh=' + encodeURIComponent(anh));
    await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(700);
    await p.screenshot({ path: __dirname + '/' + ten + '.jpg', type: 'jpeg', quality: 93 }); await p.close();
  }
  await b.close();
})();
