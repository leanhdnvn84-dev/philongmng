/**
 * Tạo lại dữ liệu mẫu nhúng trong apps-script/Index.html (dòng `const DEMO={...}`).
 *
 * Chạy chính Code.gs trên một Google Sheet giả lập trong bộ nhớ: setup lớp 12/1…12/12,
 * gọi napDuLieuMau_() rồi getPublicData(), và ghi kết quả vào dòng DEMO.
 * Nhờ vậy nội dung demo luôn khớp với dữ liệu mẫu mà Apps Script nạp thật.
 *
 * Chạy: node tools/build-demo.js
 */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.join(__dirname, '..');
const GS = path.join(ROOT, 'apps-script', 'Code.gs');
const HTML = path.join(ROOT, 'apps-script', 'Index.html');

/* ---- Google Sheet giả lập ---- */
function makeSheet() {
  const rows = [];
  const sh = {
    getLastRow: () => rows.length,
    getLastColumn: () => rows.reduce((m, r) => Math.max(m, (r || []).length), 0),
    getMaxRows: () => Math.max(rows.length, 1000),
    getRange: (r, c, nr, nc) => {
      nr = nr || 1; nc = nc || 1;
      const rg = {
        setValues: v => { v.forEach((row, i) => { rows[r - 1 + i] = rows[r - 1 + i] || []; row.forEach((x, j) => { rows[r - 1 + i][c - 1 + j] = String(x); }); }); return rg; },
        getValues: () => Array.from({ length: nr }, (_, i) => Array.from({ length: nc }, (_, j) => (rows[r - 1 + i] || [])[c - 1 + j] || '')),
        getDisplayValues: () => rg.getValues(),
        setNumberFormat: () => rg, setFontWeight: () => rg, setBackground: () => rg, setFontColor: () => rg,
        clearContent: () => { for (let i = 0; i < nr; i++) if (rows[r - 1 + i]) rows[r - 1 + i] = []; return rg; }
      };
      return rg;
    },
    deleteRow: r => rows.splice(r - 1, 1),
    setFrozenRows: () => {}
  };
  return sh;
}
const sheets = {};
const ss = {
  getSheetByName: n => sheets[n] || null,
  insertSheet: n => (sheets[n] = makeSheet()),
  getSheets: () => Object.values(sheets),
  getId: () => 'demo', getUrl: () => 'demo'
};
const props = { DEMO_AUTO: '1' };
const cache = {};
const ctx = {
  SpreadsheetApp: { openById: () => ss },
  PropertiesService: { getScriptProperties: () => ({ getProperty: k => props[k] || null, setProperty: (k, v) => { props[k] = v; } }) },
  CacheService: { getScriptCache: () => ({ get: k => cache[k] || null, put: (k, v) => { cache[k] = v; }, remove: k => { delete cache[k]; }, getAll: ks => Object.fromEntries(ks.filter(k => k in cache).map(k => [k, cache[k]])), putAll: o => { Object.assign(cache, o); } }) },
  LockService: { getScriptLock: () => ({ waitLock: () => {}, releaseLock: () => {} }) },
  Utilities: {
    formatDate: () => '2026-10-11 09:00:00',
    getUuid: () => require('crypto').randomUUID(),
    computeDigest: () => [], base64Encode: () => '', DigestAlgorithm: {}, Charset: {}
  },
  Logger: { log: () => {} }, Session: { getActiveUser: () => ({ getEmail: () => '' }) },
  console
};
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(GS, 'utf8') + `
Object.keys(SHEETS).forEach(function (n) { const s = ss_().insertSheet(n); s.getRange(1, 1, 1, SHEETS[n].length).setValues([SHEETS[n]]); });
Object.keys(CONFIG_DEFAULT).forEach(function (k) { append_('CauHinh', { key: k, value: CONFIG_DEFAULT[k] }); });
for (let i = 1; i <= SO_LOP; i++) append_('Lop', { id: 'lop' + i, ten: '12/' + i, gvcn: '', ban: '', gioiThieu: '', thuTu: String(i) });
globalThis.__msg = napDuLieuMau_();
_cache = {};
globalThis.__demo = getPublicData();
`, ctx);

const demo = JSON.stringify(ctx.__demo);
if (/\/\/|\/\*/.test(demo)) throw new Error('Dữ liệu mẫu có "//" hoặc "/*" (Apps Script sẽ cắt mất)');
let html = fs.readFileSync(HTML, 'utf8');
const re = /^const DEMO=.*$/m;
if (!re.test(html)) throw new Error('Không tìm thấy dòng const DEMO= trong Index.html');
html = html.replace(re, () => 'const DEMO=' + demo + ';');
fs.writeFileSync(HTML, html);
console.log(ctx.__msg, '→ đã ghi DEMO (' + (demo.length / 1024).toFixed(0) + ' KB) vào apps-script/Index.html');
