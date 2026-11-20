const { chromium } = require('playwright'); const path = require('path');
(async () => {
  const dir = process.argv[2];
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--no-sandbox'] });
  const p = await b.newPage({ viewport: { width: 1280, height: 900 }, deviceScaleFactor: 2 });
  await p.goto('file://' + path.resolve(__dirname, '../dist/ql-hd-thue-v5.html'));
  for (const [tab, name] of [['Đối chiếu', 'compare'], ['Kiểm tra', 'issues'], ['Hợp đồng', 'contracts']]) {
    await p.click(`#nav button:has-text("${tab}")`);
    await p.screenshot({ path: `${dir}/${name}.png`, fullPage: false });
  }
  await p.click('#nav button:has-text("Hợp đồng")');
  await p.click('tr.click[data-open="HDT070"]');
  await p.screenshot({ path: `${dir}/detail-HDT070.png`, fullPage: false });
  await b.close(); console.log('ok');
})().catch(e => { console.error(e); process.exit(1); });
