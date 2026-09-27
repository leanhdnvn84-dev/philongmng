// Demo iPhone: app trong iframe (như trang Google Apps Script), thanh trạng thái giả 54px.
//   node tools/harness/demo-ios.js index.html <thư_mục_ảnh>
// "truoc": trang ngoài tràn dưới thanh trạng thái (viewport-fit=cover) → iframe bắt đầu ở y=0.
// "sau":   trang ngoài nằm dưới thanh trạng thái → iframe bắt đầu ở y=54.
'use strict';
const fs = require('fs'), path = require('path');
const { chromium } = require('playwright');
const { createBackend, FIXED_NOW } = require('./gas-mock');
const src = fs.readFileSync(path.join(__dirname, 'run.js'), 'utf8');
const MOCK_CLIENT = eval(src.match(/const MOCK_CLIENT = (`[\s\S]*?`);/)[1]);
const NO_FS = 'Element.prototype.requestFullscreen=undefined;Element.prototype.webkitRequestFullscreen=undefined;Object.defineProperty(document,"fullscreenEnabled",{value:false});';
const htmlPath = path.resolve(process.argv[2] || 'index.html'), outDir = path.resolve(process.argv[3] || 'demo-out');
const SB = 54;
(async () => {
  fs.mkdirSync(outDir, { recursive: true });
  const app = fs.readFileSync(htmlPath, 'utf8').replace('<head>', () => '<head><script>window.parent.__rpc&&(window.__rpc=(f,a)=>window.parent.__rpc(f,a));' + MOCK_CLIENT + NO_FS + '</script>');
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM || undefined });
  for (const mode of ['truoc', 'sau']) {
    const backend = createBackend(path.join(path.dirname(htmlPath), 'Code.gs'), htmlPath);
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, locale: 'vi-VN', timezoneId: 'Asia/Ho_Chi_Minh' });
    const page = await ctx.newPage();
    await page.clock.install({ time: FIXED_NOW });
    await page.exposeFunction('__rpc', (fn, a) => { try { return JSON.stringify({ ok: true, value: backend.call(fn, JSON.parse(a)) }); } catch (e) { return JSON.stringify({ ok: false, error: String(e.message || e) }); } });
    const top = mode === 'truoc' ? 0 : SB;
    const outer = `<!doctype html><html><head><meta name="viewport" content="width=device-width, initial-scale=1"><style>html,body{margin:0;height:100%;background:#000;overflow:hidden}
      iframe{position:fixed;left:0;right:0;top:${top}px;bottom:0;width:100%;height:calc(100% - ${top}px);border:0}
      #sb{position:fixed;left:0;right:0;top:0;height:${SB}px;z-index:9;display:flex;justify-content:space-between;align-items:center;padding:0 32px;box-sizing:border-box;font:600 17px -apple-system,Arial;color:${mode === 'truoc' ? '#000' : '#fff'};background:${mode === 'truoc' ? 'linear-gradient(#f2f2f2,rgba(242,242,242,.85) 70%,rgba(242,242,242,0))' : '#000'}}</style></head>
      <body><div id="sb"><span>19:42</span><span>▮▮▮ ◠ 49</span></div><iframe src="http://app.test/app"></iframe></body></html>`;
    await page.route('**/*', r => { const u = r.request().url(); if (u === 'http://app.test/') return r.fulfill({ contentType: 'text/html; charset=utf-8', body: outer }); if (u === 'http://app.test/app') return r.fulfill({ contentType: 'text/html; charset=utf-8', body: app }); return r.abort(); });
    await page.goto('http://app.test/');
    const f = () => page.frames().find(x => x.url().endsWith('/app'));
    const tick = async (n = 12) => { for (let i = 0; i < n; i++) { await page.clock.runFor(300); await page.waitForTimeout(30); } };
    await tick();
    await f().evaluate(() => document.getElementById('plStartupAllV841592')?.click());
    await tick(20);
    await f().evaluate(() => window.showPage && window.showPage('work'));
    await tick(15);
    await page.screenshot({ path: path.join(outDir, `ios-${mode}.png`) });
    if (mode === 'sau') {
      await f().evaluate(() => { const r = (APP.core && APP.core.work || [])[0]; if (r) window.editWork(r.ID); });
      await tick(10);
      await page.screenshot({ path: path.join(outDir, 'ios-sau-form-sua-cong-viec.png') });
      await f().evaluate(() => { window.v17CloseForm && v17CloseForm(); showPage('daily'); });
      await tick(15);
      await f().evaluate(() => { const r = (APP.core && APP.core.daily || [])[0]; if (r) v17EditPageRecord('daily', r.ID); });
      await tick(10);
      await page.screenshot({ path: path.join(outDir, 'ios-sau-form-sua-hang-ngay.png') });
      const locked = await f().evaluate(() => [...document.querySelectorAll('#v17FormFields :is(select:disabled,input[readonly])')].map(e => e.id));
      console.log('daily locked:', locked);
    }
    await ctx.close();
  }
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
