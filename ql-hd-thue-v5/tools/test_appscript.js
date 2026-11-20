// Kiểm thử bản Apps Script: giả lập google.script.run để trả dữ liệu, rồi kiểm tra giao diện render.
const { chromium } = require('playwright');
const path = require('path'); const fs = require('fs');
(async () => {
  const data = fs.readFileSync(path.join(__dirname, '../data/legacy.json'), 'utf8');
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--no-sandbox'] });
  const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
  const errors = [];
  p.on('pageerror', e => errors.push(e.message));
  await p.addInitScript(`
    window.google = { script: { run: (function () {
      const r = { _ok: null, _fail: null,
        withSuccessHandler(f) { this._ok = f; return this; },
        withFailureHandler(f) { this._fail = f; return this; },
        getLegacyData() { const d = ${data}; setTimeout(() => this._ok(d), 0); return this; } };
      return r; })() } };`);
  await p.goto('file://' + path.resolve(__dirname, '../apps-script/index.html'));
  await p.waitForSelector('#nav button');
  const navCount = await p.locator('#nav button').count();
  const h1 = await p.textContent('main h1');
  console.log('nav buttons:', navCount, '| first heading:', h1);
  await p.click('#nav button:has-text("Đối chiếu")');
  console.log('compare rows:', await p.locator('main tbody tr').count());
  console.log('errors:', errors.length ? errors : 'none');
  await b.close();
})().catch(e => { console.error('FAIL', e.message); process.exit(1); });
