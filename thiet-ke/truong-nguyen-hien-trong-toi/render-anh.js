/* node render-anh.js → anh-in/trang-N.jpg (A4 300 dpi = 2480×3508) + anh-in/truong-nguyen-hien-trong-toi-anh.zip */
const { chromium } = require(process.env.PLAYWRIGHT || '/opt/node-tools/node_modules/playwright');
const path = require('path'), url = require('url'), fs = require('fs'), { execFileSync } = require('child_process');
const D = path.join(__dirname, 'anh-in'); fs.mkdirSync(D, { recursive: true });
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 900, height: 1200 }, deviceScaleFactor: 3.125 });
  await p.goto(url.pathToFileURL(path.join(__dirname, 'bai.html')).href); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(2500);
  const tr = await p.$$('.trang'); const ds = [];
  for (let i = 0; i < tr.length; i++) { const f = `trang-${i + 1}.jpg`; await tr[i].screenshot({ path: path.join(D, f), type: 'jpeg', quality: 95 }); ds.push(f); }
  await b.close();
  execFileSync('zip', ['-q', '-FS', 'truong-nguyen-hien-trong-toi-anh.zip', ...ds], { cwd: D });
  console.log(tr.length, 'trang');
})();
