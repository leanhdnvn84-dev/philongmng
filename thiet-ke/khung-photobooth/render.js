/* node render.js → khung-xanh|vang|phuong.png (1200x1800, 2 ô trong suốt) + xem-truoc-xanh.jpg, xem-truoc-vang.jpg (có ảnh mẫu) */
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1200, height: 1800 } });
  for (const m of ['xanh', 'vang', 'phuong']) {
    for (const xem of [0, 1]) {
      await p.goto('file://' + __dirname + '/khung.html?m=' + m + (xem ? '&xem=1' : ''));
      await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(600);
      if (xem) await p.screenshot({ path: __dirname + '/xem-truoc-' + m + '.jpg', type: 'jpeg', quality: 88 });
      else await p.screenshot({ path: __dirname + '/khung-' + m + '.png', omitBackground: true });
    }
  }
  await b.close();
})();
