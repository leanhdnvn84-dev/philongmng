/* node render-10-mau.js → 10-mau/NN-ten-{1-anh|anh-doi|3-anh}.png (ô ảnh trong suốt)
   + 10-mau/xem-truoc/*.jpg (có ảnh mẫu) + 10-mau/tong-quan-{1-anh|anh-doi|3-anh}.jpg + 10-mau/khung-photobooth-10-mau.zip */
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path'), { execSync } = require('child_process');
const D = path.join(__dirname, '10-mau'), X = path.join(D, 'xem-truoc');
fs.mkdirSync(X, { recursive: true });
const KIEU = { 1: '1-anh', 2: 'anh-doi', 3: '3-anh' };
(async () => {
  const b = await chromium.launch();
  const ds = { 1: [], 2: [], 3: [] };
  for (const k of [1, 2, 3]) {
    const p = await b.newPage({ viewport: k === 1 ? { width: 1800, height: 1200 } : { width: 1200, height: 1800 } });
    for (let m = 1; m <= 10; m++) {
      for (const xem of [0, 1]) {
        await p.goto('file://' + __dirname + '/mau.html?m=' + m + '&b=' + k + (xem ? '&xem=1' : ''));
        await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(350);
        const ten = (await p.title()) + '-' + KIEU[k];
        if (xem) { const f = path.join(X, ten + '.jpg'); await p.screenshot({ path: f, type: 'jpeg', quality: 86 }); ds[k].push([f, ten]); }
        else await p.screenshot({ path: path.join(D, ten + '.png'), omitBackground: true });
      }
    }
    await p.close();
  }
  /* bảng tổng quan: 5 cột × 2 hàng */
  const p = await b.newPage({ viewport: { width: 2000, height: 1000 } });
  for (const k of [1, 2, 3]) {
    const tw = k === 1 ? 380 : 260, th = k === 1 ? 253 : 390;
    const html = '<body style="margin:0;background:#EDE6DA;font:600 22px sans-serif;color:#5B2A12"><div id="g" style="display:grid;grid-template-columns:repeat(5,' + tw + 'px);gap:28px 22px;padding:28px">' +
      ds[k].map(([f, t]) => '<div><img src="file://' + f + '" style="width:' + tw + 'px;height:' + th + 'px;display:block;box-shadow:0 4px 12px rgba(0,0,0,.2)"><div style="margin-top:8px">' + t.replace('-' + KIEU[k], '') + '</div></div>').join('') + '</div></body>';
    fs.writeFileSync(path.join(D, '_tq.html'), html);
    await p.goto('file://' + path.join(D, '_tq.html')); await p.waitForTimeout(500);
    await (await p.$('#g')).screenshot({ path: path.join(D, 'tong-quan-' + KIEU[k] + '.jpg'), type: 'jpeg', quality: 85 });
  }
  fs.unlinkSync(path.join(D, '_tq.html'));
  await b.close();
  execSync('cd "' + D + '" && rm -f khung-photobooth-10-mau.zip && zip -q khung-photobooth-10-mau.zip *.png');
})();
