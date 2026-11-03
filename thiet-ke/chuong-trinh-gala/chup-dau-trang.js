/* Chụp dau-trang.html → dau-trang.jpg (3x) dùng làm đầu trang file Word */
const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 560, height: 226 }, deviceScaleFactor: 3 });
  await p.goto('file://' + __dirname + '/dau-trang.html'); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(800);
  await p.screenshot({ path: __dirname + '/dau-trang.jpg', type: 'jpeg', quality: 90 }); await b.close(); })();
