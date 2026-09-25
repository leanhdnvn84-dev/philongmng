// Chạy Code.gs trong Node với các dịch vụ Apps Script giả lập (Sheet trong bộ nhớ,
// Cache/Properties/Lock…). Dữ liệu mẫu sinh tất định để hai lần chạy cho kết quả
// giống hệt nhau — dùng cho kiểm thử hồi quy giao diện, KHÔNG dùng cho sản xuất.
'use strict';
const fs = require('fs');
const vm = require('vm');
const crypto = require('crypto');

const FIXED_NOW = new Date('2026-09-20T09:00:00+07:00').getTime();

function hash(s) { let h = 2166136261; for (const c of String(s)) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; }

class Range {
  constructor(sheet, row, col, nr, nc) { Object.assign(this, { sheet, row, col, nr: nr || 1, nc: nc || 1 }); }
  getValues() {
    const out = [];
    for (let r = 0; r < this.nr; r++) { const src = this.sheet.data[this.row - 1 + r] || []; const line = []; for (let c = 0; c < this.nc; c++) { const v = src[this.col - 1 + c]; line.push(v === undefined ? '' : v); } out.push(line); }
    return out;
  }
  getValue() { return this.getValues()[0][0]; }
  getDisplayValues() { return this.getValues().map(r => r.map(v => String(v))); }
  setValues(vals) {
    for (let r = 0; r < vals.length; r++) { const i = this.row - 1 + r; while (this.sheet.data.length <= i) this.sheet.data.push([]); for (let c = 0; c < vals[r].length; c++) this.sheet.data[i][this.col - 1 + c] = vals[r][c]; }
    return this;
  }
  setValue(v) { return this.setValues([[v]]); }
  getRow() { return this.row; }
  getColumn() { return this.col; }
  getNumRows() { return this.nr; }
  createTextFinder(text) {
    const self = this; let entire = false;
    return {
      matchEntireCell(b) { entire = !!b; return this; },
      matchCase() { return this; },
      findNext() {
        const vals = self.getValues();
        for (let r = 0; r < vals.length; r++) for (let c = 0; c < vals[r].length; c++) {
          const s = String(vals[r][c]); if (entire ? s === text : s.indexOf(text) >= 0) return new Range(self.sheet, self.row + r, self.col + c, 1, 1);
        }
        return null;
      },
      findAll() { const x = this.findNext(); return x ? [x] : []; },
    };
  }
  setNumberFormat() { return this; } setFontWeight() { return this; } setBackground() { return this; } clearContent() { return this.setValues(this.getValues().map(r => r.map(() => ''))); }
}
class Sheet {
  constructor(name, data) { this.name = name; this.data = data || []; }
  getName() { return this.name; }
  getLastRow() { let n = this.data.length; while (n > 0 && !(this.data[n - 1] || []).some(v => v !== '' && v !== undefined && v !== null)) n--; return n; }
  getLastColumn() { return this.data.reduce((m, r) => { let n = (r || []).length; while (n > 0 && (r[n - 1] === '' || r[n - 1] === undefined)) n--; return Math.max(m, n); }, 0); }
  getRange(a, b, c, d) {
    if (typeof a === 'string') { const m = a.match(/^([A-Z]+)(\d+)$/); const col = m[1].split('').reduce((s, ch) => s * 26 + ch.charCodeAt(0) - 64, 0); return new Range(this, +m[2], col, 1, 1); }
    return new Range(this, a, b, c, d);
  }
  getDataRange() { return new Range(this, 1, 1, Math.max(1, this.getLastRow()), Math.max(1, this.getLastColumn())); }
  deleteRow(r) { this.data.splice(r - 1, 1); }
  appendRow(row) { this.data.splice(this.getLastRow(), 0, row.slice()); }
  getMaxRows() { return this.data.length + 100; } getMaxColumns() { return 200; }
  setFrozenRows() {} insertColumnAfter() {} autoResizeColumns() {} hideSheet() {} setColumnWidth() {}
}
class Spreadsheet {
  constructor(sheets) { this.sheets = sheets; }
  getSheetByName(n) { return this.sheets[n] || null; }
  insertSheet(n) { return (this.sheets[n] = new Sheet(n, [])); }
  deleteSheet(sh) { delete this.sheets[sh.name]; }
  getSheets() { return Object.values(this.sheets); }
  getId() { return 'MOCK_SS'; } getUrl() { return 'https://example.invalid/ss'; }
}

// ---------------- Dữ liệu mẫu ----------------
const TODAY = '2026-09-20';
function isoAdd(days) { const d = new Date(TODAY + 'T00:00:00Z'); d.setUTCDate(d.getUTCDate() + days); return d.toISOString().slice(0, 10); }

function buildSeed(codeText, htmlText) {
  const sheetNames = {};
  const sheetsBlock = codeText.match(/SHEETS:\s*\{([\s\S]*?)\n  \}/)[1];
  for (const m of sheetsBlock.matchAll(/(\w+):\s*'([A-Z0-9_]+)'/g)) sheetNames[m[1]] = m[2];
  const allNames = new Set(Object.values(sheetNames));
  const reserved = new Set(['DASHBOARD', 'NO_LOGIN', 'SYSTEM_LOCKED']);
  const fieldRe = /\b(?:ID|TEN|NGAY|MA|SO|TRANG|GHI|LOAI|HO|NOI|KHU|TANG|HANG|DON|THANH|NGUOI|CHU|EMAIL|DIEN|SDT|MO|VI|DIA|KET|NHA|GIA|TIEN|THOI|HAN|PHONG|DOI|MUC|CAP|LY|DA|GIO|NAM|THANG|TONG|PHUONG|CHUC|BO|DE|HINH|LINK|VAT|THIET|DUYET|CAN|CONG|DIEN|TU|DEN|KY|DAT|LAN|MUC|PHAN|NOI)(?:_[A-Z0-9]+)*\b/g;
  const fields = new Set();
  for (const t of [codeText, htmlText]) for (const m of t.matchAll(fieldRe)) if (!allNames.has(m[0]) && !reserved.has(m[0]) && m[0].length > 1) fields.add(m[0]);
  // Mọi chuỗi IN_HOA nằm trong dấu nháy (danh sách cột bắt buộc, cấu hình bảng…).
  for (const t of [codeText, htmlText]) for (const m of t.matchAll(/['"`]([A-Z][A-Z0-9]*(?:_[A-Z0-9]+)+|[A-Z]{4,})['"`]/g)) if (!allNames.has(m[1]) && !reserved.has(m[1])) fields.add(m[1]);
  const cols = ['ID', 'ID_HANG_MUC', ...[...fields].filter(f => f !== 'ID' && f !== 'ID_HANG_MUC').sort()];

  const prefixOf = {
    employees: 'NV', contractors: 'NT', suppliers: 'NCC', users: 'ND', roles: 'VR', permissions: 'PQ', work: 'CV', daily: 'HN', assets: 'TB', materials: 'VT',
    stockTxn: 'NX', recoveries: 'TH', deviceTransfers: 'CT', maintenanceLogs: 'NK', maintenancePlans: 'KH', maintenanceItems: 'HM', maintenanceSchedules: 'LBT',
    buildingAreas: 'KV', operationDetails: 'VH', proposals: 'DX', proposalBuyMaterial: 'DXVT', proposalBuy: 'DXM', proposalDispose: 'DXTL', proposalMaintenance: 'DXBT',
    contracts: 'HD', tenants: 'KT', floors: 'TANG', prospects: 'KHTN', audit: 'AUD', emailConfig: 'CFG', emailLog: 'EM',
  };
  const N = 7;
  const id = (key, i) => (prefixOf[key] || 'X') + String(i + 1).padStart(4, '0');
  const refFor = {
    ID_NHAN_VIEN: 'employees', ID_NGUOI_THUC_HIEN: 'employees', ID_NGUOI_GIAO: 'employees', ID_NGUOI_DE_XUAT: 'employees', ID_NGUOI_NHAN: 'employees', ID_NGUOI_GUI: 'employees',
    ID_NHA_THAU: 'contractors', ID_NHA_CUNG_CAP: 'suppliers', ID_VAI_TRO: 'roles', ID_KHU_VUC: 'buildingAreas', ID_HANG_MUC: 'maintenanceItems', ID_THIET_BI: 'assets',
    ID_VAT_TU: 'materials', ID_DE_XUAT: 'proposals', ID_HOP_DONG: 'contracts', ID_KHACH_THUE: 'tenants', ID_TANG: 'floors', ID_LICH: 'maintenanceSchedules',
  };
  const statuses = ['Hoàn thành', 'Đang thực hiện', 'Chưa thực hiện', 'Hoạt động', 'Chờ duyệt', 'Đã duyệt', 'Ngừng sử dụng'];
  const valueFor = (key, col, i) => {
    const h = hash(key + '|' + col + '|' + i);
    if (col === 'ID') return id(key, i);
    if (col === 'ID_HANG_MUC') return key === 'maintenanceItems' || key === 'operationDetails' ? id('maintenanceItems', i) : id('maintenanceItems', h % N);
    if (col === 'ID_LICH' && key === 'maintenanceSchedules') return id(key, i);
    if (col === 'ID_AUDIT') return id('audit', i);
    if (col === 'ID_VAI_TRO') return key === 'roles' ? '' : (key === 'users' ? ['VR0004', 'VR0001', 'VR0002', 'VR0003'][i % 4] : 'VR000' + (1 + h % 4));
    if (refFor[col]) return id(refFor[col], h % N);
    if (/^TRANG_THAI|^DOI_PCCC$/.test(col)) return key === 'users' || key === 'employees' ? (i === N - 1 ? 'Ngừng hoạt động' : 'Hoạt động') : statuses[h % statuses.length];
    if (/^(NGAY|HAN|DEADLINE)|_NGAY|NGAY_/.test(col)) return isoAdd((h % 90) - 45);
    if (/^(SO_|DON_GIA|THANH_TIEN|TONG|GIA|CHU_KY|SO_LUONG|TIEN|LAN|NAM$|THANG$|KY)/.test(col)) return (h % 50) + 1;
    if (/EMAIL/.test(col)) return 'user' + i + '@example.invalid';
    if (/^(XEM|THEM|SUA|XOA|IN_XUAT|DUYET)$/.test(col)) return h % 2 ? 'TRUE' : '';
    if (/MAT_KHAU/.test(col)) return i === 0 ? 'mock-pass' : '';
    if (/HINH|LINK|ANH/.test(col)) return '';
    return col.split('_').slice(0, 2).join(' ').toLowerCase() + ' ' + (i + 1);
  };
  const sheets = {};
  for (const [key, name] of Object.entries(sheetNames)) {
    if (name === 'SYS_ID_SEQUENCE') { sheets[name] = new Sheet(name, [['ENTITY', 'PREFIX', 'LAST_NUMBER', 'UPDATED_AT']]); continue; }
    if (name === 'KTDK') continue;
    const rows = [cols.slice()];
    const count = /AUDIT|EMAIL/.test(name) ? 2 : N;
    for (let i = 0; i < count; i++) rows.push(cols.map(c => valueFor(key, c, i)));
    if (key === 'roles') rows.slice(1).forEach((r, i) => { r[cols.indexOf('ID')] = 'VR000' + (i + 1); });
    sheets[name] = new Sheet(name, rows);
  }
  return sheets;
}

// ---------------- Dịch vụ Apps Script ----------------
function makeServices(state) {
  const cacheStore = new Map();
  const props = new Map();
  const cache = {
    get: k => (cacheStore.has(k) ? cacheStore.get(k) : null),
    getAll: keys => { const o = {}; keys.forEach(k => { if (cacheStore.has(k)) o[k] = cacheStore.get(k); }); return o; },
    put: (k, v) => { cacheStore.set(k, String(v)); },
    putAll: o => { Object.entries(o).forEach(([k, v]) => cacheStore.set(k, String(v))); },
    remove: k => { cacheStore.delete(k); },
    removeAll: keys => keys.forEach(k => cacheStore.delete(k)),
  };
  const propsObj = {
    getProperty: k => (props.has(k) ? props.get(k) : null),
    setProperty: (k, v) => { props.set(k, String(v)); return propsObj; },
    setProperties: o => { Object.entries(o).forEach(([k, v]) => props.set(k, String(v))); return propsObj; },
    deleteProperty: k => { props.delete(k); return propsObj; },
    getProperties: () => Object.fromEntries(props),
    getKeys: () => [...props.keys()],
  };
  props.set('PHILONG_BUILDING_FAVICON_URL', 'https://example.invalid/favicon.png');
  props.set('V80_INSPECTION_DATA_REMOVED_AT', '2026-01-01 00:00:00');
  const lock = { waitLock() {}, tryLock() { return true; }, releaseLock() {}, hasLock() { return true; } };
  let uuid = 0;
  const pad = n => String(n).padStart(2, '0');
  const formatDate = (d, tz, fmt) => {
    const t = new Date(new Date(d).getTime() + 7 * 3600e3);
    const map = { yyyy: t.getUTCFullYear(), MM: pad(t.getUTCMonth() + 1), dd: pad(t.getUTCDate()), HH: pad(t.getUTCHours()), mm: pad(t.getUTCMinutes()), ss: pad(t.getUTCSeconds()) };
    return fmt.replace(/yyyy|MM|dd|HH|mm|ss/g, m => map[m]);
  };
  const Utilities = {
    formatDate, sleep() {}, getUuid: () => '00000000-0000-4000-8000-' + String(++uuid).padStart(12, '0'),
    base64Encode: b => Buffer.from(Array.isArray(b) ? b : String(b)).toString('base64'),
    base64EncodeWebSafe: b => Buffer.from(Array.isArray(b) ? b.map(x => x & 255) : String(b)).toString('base64').replace(/\+/g, '-').replace(/\//g, '_'),
    base64Decode: s => [...Buffer.from(String(s), 'base64')],
    computeDigest: (alg, s) => [...crypto.createHash('md5').update(String(s)).digest()].map(x => (x > 127 ? x - 256 : x)),
    DigestAlgorithm: { MD5: 'MD5', SHA_256: 'SHA_256' },
    newBlob: (data, type, name) => ({ getBytes: () => data, getContentType: () => type, getName: () => name, setName() { return this; } }),
    Charset: { UTF_8: 'UTF-8' },
  };
  const unsupported = name => new Proxy({}, { get: (_, p) => { if (p === Symbol.toPrimitive || p === 'then') return undefined; return (..._a) => { throw new Error('MOCK_UNSUPPORTED:' + name + '.' + String(p)); }; } });
  return {
    SpreadsheetApp: { openById: () => state.ss, getActiveSpreadsheet: () => state.ss, flush() {} },
    CacheService: { getScriptCache: () => cache, getUserCache: () => cache, getDocumentCache: () => cache },
    PropertiesService: { getScriptProperties: () => propsObj, getUserProperties: () => propsObj },
    LockService: { getScriptLock: () => lock, getUserLock: () => lock, getDocumentLock: () => lock },
    Utilities,
    Session: { getActiveUser: () => ({ getEmail: () => 'mock@example.invalid' }), getEffectiveUser: () => ({ getEmail: () => 'mock@example.invalid' }), getScriptTimeZone: () => 'Asia/Ho_Chi_Minh' },
    MailApp: { sendEmail() { state.mails.push([...arguments]); }, getRemainingDailyQuota: () => 100 },
    HtmlService: unsupported('HtmlService'), DriveApp: unsupported('DriveApp'), DocumentApp: unsupported('DocumentApp'),
    ScriptApp: { getProjectTriggers: () => [], newTrigger: () => unsupported('Trigger'), deleteTrigger() {}, getOAuthToken: () => 'mock' },
    UrlFetchApp: unsupported('UrlFetchApp'),
    Logger: { log() {} },
  };
}

function createBackend(codePath, htmlPath) {
  const codeText = fs.readFileSync(codePath, 'utf8');
  const htmlText = fs.readFileSync(htmlPath, 'utf8');
  const state = { ss: new Spreadsheet(buildSeed(codeText, htmlText)), mails: [] };
  const RealDate = Date;
  class FixedDate extends RealDate { constructor(...a) { if (a.length) super(...a); else super(FIXED_NOW); } static now() { return FIXED_NOW; } }
  const sandbox = Object.assign({ console: { log() {}, warn() {}, error() {}, info() {} }, Date: FixedDate }, makeServices(state));
  vm.createContext(sandbox);
  vm.runInContext(codeText, sandbox, { filename: 'Code.gs' });
  return {
    call(fn, args) {
      if (typeof sandbox[fn] !== 'function' || /_$/.test(fn)) throw new Error('Script function not found: ' + fn);
      const result = sandbox[fn].apply(null, args || []);
      return result === undefined ? null : JSON.parse(JSON.stringify(result));
    },
    state,
  };
}
module.exports = { createBackend, FIXED_NOW };
