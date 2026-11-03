/* node render.js → xem-truoc-N.jpg + truong-nguyen-hien-trong-toi.pdf (A4) */
const { chromium } = require(process.env.PLAYWRIGHT || '/opt/node-tools/node_modules/playwright'); const path = require('path'), url = require('url');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 900, height: 1200 }, deviceScaleFactor: 2 });
  await p.goto(url.pathToFileURL(path.join(__dirname, 'bai.html')).href); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(1500);
  console.log(await p.title());
  const tr = await p.$$('.trang'); for (let i = 0; i < tr.length; i++) await tr[i].screenshot({ path: path.join(__dirname, `xem-truoc-${i + 1}.jpg`), type: 'jpeg', quality: 85 });
  await p.emulateMedia({ media: 'print' }); await p.pdf({ path: path.join(__dirname, 'truong-nguyen-hien-trong-toi.pdf'), format: 'A4', printBackground: true, preferCSSPageSize: true });
  await b.close();
})();
