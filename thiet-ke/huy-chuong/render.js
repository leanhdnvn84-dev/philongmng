/* Dựng ảnh: PLAYWRIGHT=/opt/node-tools/node_modules/playwright node render.js <thư mục> */
const { chromium } = require(process.env.PLAYWRIGHT || 'playwright');
(async () => {
  const D = process.argv[2] || __dirname, b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1600, height: 3000 }, deviceScaleFactor: 3 });
  await p.goto('file://' + D + '/huy-chuong.html'); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(500);
  await (await p.$('#hc')).screenshot({ path: D + '/huy-chuong-in-300dpi.png', omitBackground: true });
  const q = await b.newPage({ viewport: { width: 1600, height: 3000 }, deviceScaleFactor: 1 });
  await q.goto('file://' + D + '/huy-chuong.html'); await q.evaluate(() => document.fonts.ready); await q.waitForTimeout(500);
  await (await q.$('#nen')).screenshot({ path: D + '/huy-chuong-xem-truoc.png' });
  await b.close(); console.log('ok');
})();
