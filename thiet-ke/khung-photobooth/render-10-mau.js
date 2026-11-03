/* node render-10-mau.js [từ mẫu] [tới mẫu] [thư mục] [tên zip] – mặc định 1 10 10-mau; 15 mẫu kem: 11 25 15-mau-kem khung-photobooth-15-mau-kem.zip
   → 10-mau/NN-ten-{1-anh-ngang|anh-doi|dai-3-anh|1-anh-doc}.png (ô ảnh trong suốt)
   + 10-mau/xem-truoc/*.jpg (có ảnh mẫu) + 10-mau/tong-quan-{1-anh-ngang|anh-doi|dai-3-anh|1-anh-doc}.jpg + 10-mau/khung-photobooth-10-mau.zip */
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path'), { execSync } = require('child_process');
const [M0, M1, THU, ZIP] = [+(process.argv[2] || 1), +(process.argv[3] || 10), process.argv[4] || '10-mau', process.argv[5] || 'khung-photobooth-10-mau.zip'];
const D = path.join(__dirname, THU), X = path.join(D, 'xem-truoc');
fs.mkdirSync(X, { recursive: true });
const KIEU = { 1: '1-anh-ngang', 2: 'anh-doi', 3: 'dai-3-anh', 4: '1-anh-doc' };
const VP = { 1: [1800, 1200], 2: [1200, 1800], 3: [600, 1800], 4: [1200, 1800] }, TB = { 1: [380, 253], 2: [260, 390], 3: [130, 390], 4: [260, 390] };
(async () => {
  const b = await chromium.launch();
  const ds = { 1: [], 2: [], 3: [], 4: [] };
  for (const k of [1, 2, 3, 4]) {
    const p = await b.newPage({ viewport: { width: VP[k][0], height: VP[k][1] } });
    for (let m = M0; m <= M1; m++) {
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
  for (const k of [1, 2, 3, 4]) {
    const [tw, th] = TB[k];
    const html = '<body style="margin:0;background:#EDE6DA;font:600 22px sans-serif;color:#5B2A12"><div id="g" style="display:grid;grid-template-columns:repeat(5,' + tw + 'px);gap:28px 22px;padding:28px">' +
      ds[k].map(([f, t]) => '<div><img src="file://' + f + '" style="width:' + tw + 'px;height:' + th + 'px;display:block;box-shadow:0 4px 12px rgba(0,0,0,.2)"><div style="margin-top:8px">' + t.replace('-' + KIEU[k], '') + '</div></div>').join('') + '</div></body>';
    fs.writeFileSync(path.join(D, '_tq.html'), html);
    await p.goto('file://' + path.join(D, '_tq.html')); await p.waitForTimeout(500);
    await (await p.$('#g')).screenshot({ path: path.join(D, 'tong-quan-' + KIEU[k] + '.jpg'), type: 'jpeg', quality: 85 });
  }
  fs.unlinkSync(path.join(D, '_tq.html'));
  await b.close();
  execSync('cd "' + D + '" && rm -f ' + ZIP + ' && zip -q ' + ZIP + ' *.png');
})();
