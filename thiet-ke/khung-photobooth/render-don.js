/* node render-don.js → khung-1-anh.png (1800x1200, ô ảnh trong suốt) + xem-truoc-1-anh.jpg */
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1800, height: 1200 } });
  for (const xem of [0, 1]) {
    await p.goto('file://' + __dirname + '/don.html' + (xem ? '?xem=1' : ''));
    await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(600);
    if (xem) await p.screenshot({ path: __dirname + '/xem-truoc-1-anh.jpg', type: 'jpeg', quality: 88 });
    else await p.screenshot({ path: __dirname + '/khung-1-anh.png', omitBackground: true });
  }
  await b.close();
})();
