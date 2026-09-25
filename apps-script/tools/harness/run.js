// Kiểm thử hồi quy giao diện: mở index.html trong Chromium với backend giả
// (gas-mock.js), đi qua mọi trang + vài thao tác, lưu ảnh chụp DOM đã chuẩn hóa.
//   node tools/harness/run.js <index.html> <thư_mục_kết_quả> [Code.gs]
// So sánh hai lần chạy: node tools/harness/compare.js <dirA> <dirB>
'use strict';
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
const { createBackend, FIXED_NOW } = require('./gas-mock');

const htmlPath = path.resolve(process.argv[2] || 'index.html');
const outDir = path.resolve(process.argv[3] || 'harness-out');
const codePath = path.resolve(process.argv[4] || path.join(path.dirname(htmlPath), 'Code.gs'));
const ONLY = process.env.ONLY || '';

const PAGES = ['work', 'daily', 'maintenanceLog', 'maintenancePlan', 'maintenanceItems', 'equipment', 'warehouseDevice', 'materialWarehouse', 'materials', 'recovery',
  'proposalBuyMaterial', 'proposalBuy', 'proposalMaintenance', 'proposalDispose', 'tenants', 'prospects', 'floors', 'buildingAreas', 'employees', 'pcccEmployees',
  'contractors', 'suppliers', 'operationDetail'];
const SYSTEM_PAGES = ['users', 'roles', 'permissions', 'systemAudit', 'maintenanceDataTool', 'systemConfig', 'emailConfig'];

const MOCK_CLIENT = `
(function(){
  function runner(ok,fail,uo){
    return new Proxy({}, {get:function(_,name){
      if(name==='withSuccessHandler')return function(f){return runner(f,fail,uo)};
      if(name==='withFailureHandler')return function(f){return runner(ok,f,uo)};
      if(name==='withUserObject')return function(u){return runner(ok,fail,u)};
      if(typeof name!=='string')return undefined;
      return function(){
        var args=Array.prototype.slice.call(arguments);
        window.__rpcPending=(window.__rpcPending||0)+1;
        window.__rpc(name,JSON.stringify(args)).then(function(res){
          res=JSON.parse(res);
          setTimeout(function(){
            window.__rpcPending--;
            if(res.ok){if(ok)ok(res.value,uo)}else{var e=new Error(res.error);if(fail)fail(e,uo)}
          },0);
        });
      };
    }});
  }
  window.google={script:{run:runner(null,null,undefined),host:{close:function(){},setHeight:function(){},setWidth:function(){},editor:{focus:function(){}}},url:{getLocation:function(cb){cb({hash:'',parameter:{},parameters:{}})}},history:{push:function(){},replace:function(){},setChangeHandler:function(){}}}};
  window.open=function(){return null};
  window.print=function(){};
  window.alert=function(m){(window.__alerts=window.__alerts||[]).push(String(m))};
  window.confirm=function(m){(window.__alerts=window.__alerts||[]).push('confirm:'+m);return true};
  window.prompt=function(){return null};
  try{Object.defineProperty(navigator,'clipboard',{value:{writeText:function(){return Promise.resolve()}}})}catch(e){}
})();
`;

// Tiện ích chạy trong trang: tìm phần tử đang hiển thị theo chữ, đóng hộp thoại trên cùng.
const PAGE_HELPERS = `(function(){
      window.__vis = el => { if (!el || !el.getClientRects().length) return false; const cs = getComputedStyle(el); if (cs.visibility === 'hidden' || cs.display === 'none') return false; const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
      window.__topModal = () => [...document.querySelectorAll('.active, [open], [aria-modal="true"]')].filter(e => /modal|dialog|popup|drawer|view/i.test(e.id + ' ' + e.className + ' ' + e.tagName) && window.__vis(e)).pop() || null;
      window.__clickText = (re, scope) => {
        re = new RegExp(re, 'i');
        const root = scope || document;
        const cands = [...root.querySelectorAll('button, a, [role="button"], .btn')].filter(b => window.__vis(b) && !b.disabled && !b.closest('.menu-panel, .topbar, .pm-header') && [(b.textContent || '').replace(/\\s+/g, ' ').trim().replace(/^[^\\p{L}\\d+]+/u, ''), b.getAttribute('aria-label') || '', b.title || ''].some(t => re.test(t.trim())));
        if (!cands.length) return false; cands[0].click(); return (cands[0].textContent || '').trim().slice(0, 40) || true;
      };
      window.__closeTop = () => {
        const m = window.__topModal(); if (!m) return 'none';
        if (window.__clickText('^(đóng|hủy|huỷ|×|✕|x|close|thoát|quay lại)$', m)) return 'button';
        const c = [...m.querySelectorAll('[data-close], .close, [class*="close"], [aria-label*="Đóng"]')].find(window.__vis); if (c) { c.click(); return 'close'; }
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })); return 'escape';
      };
    })();`;

function normalizeHtml(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/g, '')
    .replace(/<style[\s\S]*?<\/style>/g, '')
    .replace(/\s+/g, ' ')
    .replace(/> </g, '>\n<');
}

async function main() {
  fs.rmSync(outDir, { recursive: true, force: true });
  fs.mkdirSync(outDir, { recursive: true });
  const html = fs.readFileSync(htmlPath, 'utf8').replace('<head>', () => '<head><script>' + MOCK_CLIENT + PAGE_HELPERS + '</script>');
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM || undefined });
  const report = { html: htmlPath, runs: [] };

  for (const viewport of [{ name: 'desktop', width: 1440, height: 900 }, { name: 'mobile', width: 390, height: 844, isMobile: true }]) {
    if (ONLY && !ONLY.split(',').includes(viewport.name)) continue;
    const backend = createBackend(codePath, process.env.SEED_HTML || htmlPath);
    const rpcLog = [];
    const errors = [];
    const context = await browser.newContext({ viewport: { width: viewport.width, height: viewport.height }, isMobile: !!viewport.isMobile, hasTouch: !!viewport.isMobile, locale: 'vi-VN', timezoneId: 'Asia/Ho_Chi_Minh' });
    const page = await context.newPage();
    await page.clock.install({ time: FIXED_NOW - 60000 });
    await page.clock.pauseAt(FIXED_NOW); // dừng thời gian tự chạy: chỉ tiến khi runFor()
    await page.exposeFunction('__rpc', (fn, argsJson) => {
      const args = JSON.parse(argsJson);
      rpcLog.push(fn + '(' + JSON.stringify(args).slice(0, 300) + ')');
      try { return JSON.stringify({ ok: true, value: backend.call(fn, args) }); }
      catch (e) { return JSON.stringify({ ok: false, error: String(e && e.message || e) }); }
    });
    page.on('pageerror', e => errors.push('pageerror: ' + e.message));
    page.on('console', m => { if (m.type() === 'error') errors.push('console.error: ' + m.text().slice(0, 300)); });
    await page.route('**/*', route => {
      const url = route.request().url();
      if (url === 'http://app.test/') return route.fulfill({ status: 200, contentType: 'text/html; charset=utf-8', body: html });
      return route.abort();
    });

    let step = 0;
    // Tiến đồng hồ giả một lượng CỐ ĐỊNH mỗi lần (để hai lần chạy giống hệt nhau),
    // giữa các bước chờ (thời gian thật) cho mọi RPC đang chạy trả về.
    const drain = async () => {
      for (let k = 0; k < 400; k++) {
        const pending = await page.evaluate(() => window.__rpcPending || 0).catch(() => 0);
        if (!pending) return;
        await new Promise(r => setTimeout(r, 5));
      }
    };
    const settle = async () => {
      for (let i = 0; i < 12; i++) {
        await drain();
        // Lỗi ném ra trong hẹn giờ của trang là lỗi thật của ứng dụng: ghi lại rồi chạy tiếp.
        try { await page.clock.runFor(250); } catch (e) { errors.push('timer: ' + String(e.message || e).split('\n')[0].replace(/^clock\.runFor: /, '')); }
      }
      await drain();
    };
    const snap = async (label) => {
      await settle();
      step++;
      const data = await page.evaluate(() => ({
        html: document.body.outerHTML,
        title: document.title,
        active: (document.querySelector('main.container>section.section.active') || {}).id || '',
        alerts: (window.__alerts || []).splice(0),
        storage: JSON.stringify(Object.keys(sessionStorage).sort().map(k => [k, sessionStorage.getItem(k)])),
      }));
      const name = `${viewport.name}-${String(step).padStart(3, '0')}-${label}`;
      fs.writeFileSync(path.join(outDir, name + '.html'), normalizeHtml(data.html));
      const calls = rpcLog.splice(0);
      const errs = errors.splice(0);
      fs.writeFileSync(path.join(outDir, name + '.meta.txt'), [
        'active: ' + data.active, 'title: ' + data.title, 'alerts: ' + JSON.stringify(data.alerts), 'session: ' + data.storage,
        'rpc:', ...calls.map(c => '  ' + c), 'errors:', ...errs.map(e => '  ' + e),
      ].join('\n') + '\n');
      report.runs.push({ name, active: data.active, rpc: calls.length, errors: errs.length });
    };
    const safe = async (label, fn) => { try { await fn(); } catch (e) { errors.push('harness(' + label + '): ' + String(e.message || e).split('\n')[0]); } await snap(label); };

    await page.goto('http://app.test/');
    await snap('startup');
    await safe('enter-app', async () => {
      const ok = await page.evaluate(() => { const b = document.getElementById('plStartupAllV841592'); if (b && !b.disabled) { b.click(); return true; } return false; });
      if (!ok) throw new Error('startup button unavailable');
    });

    const goto = async (id) => page.evaluate((id) => {
      const btn = document.querySelector(`.menu-panel button[data-page="${id}"]`) || document.querySelector(`.menu-panel button[onclick*="'${id}'"]`);
      if (btn) { btn.click(); return 'click'; }
      if (typeof window.showPage === 'function') { window.showPage(id); return 'call'; }
      return 'none';
    }, id);


    const act = (label, fn, arg) => safe(label, async () => { const r = await page.evaluate(fn, arg); if (r === false || r === 'none') throw new Error('no target'); });
    const interact = async (id) => {
      await act(id + '-row', () => {
        const sec = document.querySelector('main.container>section.section.active') || document;
        const row = [...sec.querySelectorAll('tbody tr')].find(r => window.__vis(r) && r.children.length > 1);
        if (!row) return false; (row.children[1] || row).click(); return true;
      });
      await act(id + '-view', re => window.__clickText(re), '^(xem|chi tiết)$');
      await act(id + '-view-close', () => window.__closeTop());
      // Sửa rồi Lưu nguyên trạng (đi qua luồng lưu thật tới backend giả).
      await act(id + '-edit', re => window.__clickText(re), '^(sửa|chỉnh sửa)$');
      await act(id + '-edit-save', () => { const m = window.__topModal(); return m ? window.__clickText('^(lưu|lưu lại|cập nhật|lưu & đóng|lưu và đóng)', m) : false; });
      await act(id + '-edit-close', () => window.__closeTop());
      // Thêm mới: điền mọi ô trống đang hiển thị rồi Lưu.
      await act(id + '-add', re => window.__clickText(re), '^(\\+|thêm|nhập thiết bị|tạo)');
      await act(id + '-add-fill', () => {
        const m = window.__topModal(); if (!m) return false;
        let n = 0;
        m.querySelectorAll('input, textarea, select').forEach(el => {
          if (!window.__vis(el) || el.disabled || el.readOnly) return;
          if (el.tagName === 'SELECT') { if (!el.value && el.options.length > 1) { el.selectedIndex = 1; el.dispatchEvent(new Event('change', { bubbles: true })); n++; } return; }
          if (/checkbox|radio|file|hidden|button|submit/.test(el.type) || el.value) return;
          el.value = el.type === 'date' ? '2026-09-21' : (el.type === 'number' || el.inputMode === 'numeric' ? '3' : 'thu nghiem');
          el.dispatchEvent(new Event('input', { bubbles: true })); el.dispatchEvent(new Event('change', { bubbles: true })); n++;
        });
        return true;
      });
      await act(id + '-add-save', () => { const m = window.__topModal(); return m ? window.__clickText('^(lưu|lưu lại|thêm|tạo|nhập|lưu & đóng|lưu và đóng)', m) : false; });
      await act(id + '-add-close', () => window.__closeTop());
      await act(id + '-delete', re => window.__clickText(re), '^xóa$');
      await act(id + '-delete-close', () => window.__closeTop());
      await act(id + '-find', () => window.__clickText('^tìm$'));
      await safe(id + '-type', async () => {
        const ok = await page.evaluate(() => { const a = document.activeElement; if (a && /INPUT|TEXTAREA/.test(a.tagName)) return true; const inp = [...document.querySelectorAll('input[type="search"], input[placeholder*="Tìm"], input[placeholder*="tìm"]')].find(window.__vis); if (inp) { inp.focus(); return true; } return false; });
        if (!ok) throw new Error('no search');
        await page.keyboard.type('noi dung 3');
      });
      await act(id + '-all', () => window.__clickText('^tất cả$'));
      await act(id + '-cleanup', () => { let n = 0; while (window.__topModal() && n < 4) { window.__closeTop(); n++; } return true; });
    };

    for (const id of PAGES) {
      await safe('page-' + id, async () => { await goto(id); });
      await interact(id);
    }
    // Trang Hệ thống khi đang khóa.
    await safe('locked-users', async () => { await page.evaluate(() => window.showPage && window.showPage('users')); });
    // Mở khóa bằng hộp thoại mật khẩu thật của giao diện.
    await safe('unlock', async () => {
      await page.evaluate(() => {
        const t = [...document.querySelectorAll('.navitem>[data-menu-toggle]')].find(x => /HỆ THỐNG/.test(x.textContent));
        const item = t && t.closest('.navitem');
        if (typeof window.requestSystemUnlock_ === 'function') window.requestSystemUnlock_(item, t, function () {});
      });
      await settle();
      const input = await page.$('#plActionDialog input[type="password"], #plActionDialog input');
      if (!input) throw new Error('no password input');
      await input.fill('mock-pass');
      await page.evaluate(() => { const d = document.getElementById('plActionDialog'); const b = d && [...d.querySelectorAll('button')].reverse().find(x => x.offsetParent !== null); if (b) b.click(); });
    });
    for (const id of SYSTEM_PAGES) {
      await safe('page-' + id, async () => { await goto(id); });
      await interact(id);
    }
    // Quay lại vài trang dữ liệu (dùng cache) và Làm mới.
    // Mở lại mọi trang (dữ liệu đã có trong bộ nhớ đệm -> chỉ chạy các bước sau khi chuyển trang).
    for (const id of PAGES) await safe('back-' + id, async () => { await goto(id); });
    await safe('refresh', async () => { await page.evaluate(() => { const b = document.getElementById('refreshBtn'); if (b) b.click(); else if (window.loadLiveData) window.loadLiveData(); }); });
    await safe('lock', async () => { await page.evaluate(() => { if (window.plLockSystemV137_) window.plLockSystemV137_(); }); });
    await context.close();
  }
  await browser.close();
  fs.writeFileSync(path.join(outDir, 'report.json'), JSON.stringify(report, null, 1));
  console.log('snapshots:', report.runs.length, 'errors total:', report.runs.reduce((s, r) => s + r.errors, 0));
}
main().catch(e => { console.error(e); process.exit(1); });
