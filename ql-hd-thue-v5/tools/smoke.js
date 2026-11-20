// Kiểm thử khói: mở app trong Chromium, kiểm tra lỗi JS và từng tab.
const { chromium } = require('playwright') ;
(async () => {
  const path = require('path');
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--no-sandbox'] });
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const errors = [];
  page.on('pageerror', e => errors.push('pageerror: ' + e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
  await page.goto('file://' + path.resolve(__dirname, '../dist/ql-hd-thue-v5.html'));
  const tabs = ['Tổng quan', 'Hợp đồng', 'Đối chiếu', 'Thanh toán', 'Kiểm tra'];
  for (const t of tabs) {
    await page.click(`nav.tabs button:has-text("${t}")`);
    const txt = await page.textContent('main');
    console.log(t, '→ main chars:', txt.length);
  }
  await page.click('nav.tabs button:has-text("Hợp đồng")');
  await page.click('tr.click[data-open="HDT021"]');
  console.log('detail heading:', await page.textContent('main h2'));
  await page.screenshot({ path: process.env.SHOT || '/tmp/claude-0/shot-detail.png', fullPage: false });
  await page.click('nav.tabs button:has-text("Tổng quan")');
  await page.screenshot({ path: process.env.SHOT2 || '/tmp/claude-0/shot-overview.png', fullPage: true });
  console.log('errors:', errors.length ? errors : 'none');
  await browser.close();
})().catch(e => { console.error('FAIL', e.message); process.exit(1); });
