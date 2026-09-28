// Đo tốc độ thật (không đồng hồ giả): mở app với backend giả, chuyển qua các trang nhiều vòng,
// đo thời gian mỗi lần chuyển trang (tới khi DOM yên) + tổng thời gian chạy script (CDP).
//   node tools/harness/bench.js <index.html> [Code.gs] [số_vòng]
'use strict';
const fs = require('fs');
const path = require('path');
const { chromium } = require(path.join(__dirname, '..', 'node_modules', 'playwright'));
const { createBackend } = require('./gas-mock.js');
const src = fs.readFileSync(path.join(__dirname, 'run.js'), 'utf8');
const grab = name => eval(src.match(new RegExp('const ' + name + ' = (`[\\s\\S]*?`);'))[1]);
const MOCK_CLIENT = grab('MOCK_CLIENT');
const htmlPath = path.resolve(process.argv[2]);
const codePath = path.resolve(process.argv[3] || path.join(path.dirname(htmlPath), 'Code.gs'));
const ROUNDS = Number(process.argv[4] || 3);
const PAGES = ['work', 'daily', 'maintenanceLog', 'equipment', 'materialWarehouse', 'proposalBuyMaterial', 'proposalBuy', 'tenants', 'employees', 'visitors'];

(async () => {
  const html = fs.readFileSync(htmlPath, 'utf8').replace('<head>', () => '<head><script>' + MOCK_CLIENT + '</script>');
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM || undefined });
  const out = {};
  for (const vp of [{ name: 'desktop', width: 1440, height: 900 }, { name: 'mobile', width: 390, height: 844, isMobile: true }]) {
    const backend = createBackend(codePath, htmlPath);
    const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, isMobile: !!vp.isMobile, hasTouch: !!vp.isMobile, locale: 'vi-VN', timezoneId: 'Asia/Ho_Chi_Minh' });
    const page = await ctx.newPage();
    const rpcT = {}; out['rpc-' + vp.name] = rpcT;
    await page.exposeFunction('__rpc', (fn, a) => { const t = Date.now(); try { return JSON.stringify({ ok: true, value: backend.call(fn, JSON.parse(a)) }); } catch (e) { return JSON.stringify({ ok: false, error: String(e && e.message || e) }); } finally { const k = fn === 'legacyV22NoLogin' ? 'L:' + JSON.parse(a)[0] : fn; const e = rpcT[k] || (rpcT[k] = { n: 0, ms: 0 }); e.n++; e.ms += Date.now() - t; } });
    await page.route('**/*', r => r.request().url() === 'http://app.test/' ? r.fulfill({ status: 200, contentType: 'text/html; charset=utf-8', body: html }) : r.abort());
    const cdp = await ctx.newCDPSession(page); await cdp.send('Performance.enable');
    const metric = async () => { const m = (await cdp.send('Performance.getMetrics')).metrics; const g = k => (m.find(x => x.name === k) || {}).value || 0; return { script: g('ScriptDuration'), style: g('RecalcStyleDuration'), layout: g('LayoutDuration') }; };
    const t0 = Date.now();
    await page.goto('http://app.test/');
    await page.waitForFunction(() => { const b = document.getElementById('plStartupAllV841592'); return b && !b.disabled; }, null, { timeout: 60000 });
    const load = Date.now() - t0;
    await page.evaluate(() => document.getElementById('plStartupAllV841592').click());
    await page.waitForTimeout(1500);
    // Chờ DOM yên: không có thay đổi trong 150ms.
    const quiet = () => page.evaluate(() => new Promise(res => { let t; const mo = new MutationObserver(() => { clearTimeout(t); t = setTimeout(done, 150); }); const s = performance.now(); const done = () => { mo.disconnect(); res(performance.now() - s - 150); }; mo.observe(document.body, { childList: true, subtree: true, attributes: true }); t = setTimeout(done, 150); }));
    if (process.env.CPUPROF) { await cdp.send('Profiler.enable'); await cdp.send('Profiler.setSamplingInterval', { interval: 200 }); await cdp.send('Profiler.start'); }
    const m0 = await metric();
    const times = [];
    for (let r = 0; r < ROUNDS; r++) for (const p of PAGES) {
      const s = Date.now();
      await page.evaluate(id => { const b = document.querySelector(`.menu-panel button[data-page="${id}"]`) || document.querySelector(`.menu-panel button[onclick*="'${id}'"]`); if (b) b.click(); else if (window.showPage) window.showPage(id); }, p);
      await quiet();
      times.push(Date.now() - s);
    }
    const m1 = await metric();
    if (process.env.CPUPROF) {
      const { profile } = await cdp.send('Profiler.stop');
      // Cộng thời gian "self" theo hàm (tên + dòng) → top hàm tốn CPU.
      const dt = {}; const ids = profile.samples; for (let i = 0; i < ids.length; i++) dt[ids[i]] = (dt[ids[i]] || 0) + (profile.timeDeltas[i] || 0);
      const agg = {}; for (const n of profile.nodes) { const t = dt[n.id] || 0; if (!t) continue; const f = n.callFrame; const k = (f.functionName || '(anon)') + ' @' + (f.lineNumber + 1) + (f.url ? '' : ' [native]'); agg[k] = (agg[k] || 0) + t; }
      fs.writeFileSync(process.env.CPUPROF + '-' + vp.name + '.txt', Object.entries(agg).sort((a, b) => b[1] - a[1]).slice(0, 60).map(([k, v]) => (v / 1000).toFixed(0) + 'ms\t' + k).join('\n'));
    }
    times.sort((a, b) => a - b);
    out[vp.name] = { loadMs: load, switches: times.length, medianMs: times[times.length >> 1], totalMs: times.reduce((a, b) => a + b, 0), scriptS: +(m1.script - m0.script).toFixed(2), styleS: +(m1.style - m0.style).toFixed(2), layoutS: +(m1.layout - m0.layout).toFixed(2) };
    await ctx.close();
  }
  await browser.close();
  console.log(JSON.stringify(out));
})();
