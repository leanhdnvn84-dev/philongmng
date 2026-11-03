/* node render-don.js → khung-anh-doi.png (1200x1800, 2 ô ảnh trong suốt) + xem-truoc-anh-doi.jpg */
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1200, height: 1800 } });
  for (const xem of [0, 1]) {
    await p.goto('file://' + __dirname + '/doi.html' + (xem ? '?xem=1' : ''));
    await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(600);
    if (xem) await p.screenshot({ path: __dirname + '/xem-truoc-anh-doi.jpg', type: 'jpeg', quality: 88 });
    else await p.screenshot({ path: __dirname + '/khung-anh-doi.png', omitBackground: true });
  }
  await b.close();
})();
