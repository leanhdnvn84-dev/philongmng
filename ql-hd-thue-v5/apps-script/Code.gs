/**
 * QL-HD-THUE v5 — Apps Script (chỉ đọc).
 * Đọc dữ liệu từ Google Sheet, trả về cho giao diện. Không ghi gì vào Sheet.
 */
const SPREADSHEET_ID = '1ViMipwXN6yW4gDY3mtvrlf5CzF5jAQ1VlbPRN4QQaNM';
const TZ = 'Asia/Ho_Chi_Minh';
const LEGACY_SHEETS = ['toanha', 'tang_phong', 'khach_khachthue', 'hopdong', 'phuluc', 'giathue', 'phidichvu',
  'kythanhtoan', 'chitietky', 'denghithanhtoan', 'hoadon', 'thanhtoan', 'sys_cauhinh',
  'dien_congto', 'dien_chiso', 'dien_dongia', 'dien_tinhtien'];

function doGet() {
  return HtmlService.createHtmlOutputFromFile('index')
    .setTitle('QL-HD-THUE v5 — Đối chiếu tiền thuê')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/** Trả về toàn bộ các sheet dưới dạng {tên: {headers, rows}} — cùng cấu trúc với legacy.json. */
function getLegacyData() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const out = {};
  LEGACY_SHEETS.forEach(function (name) {
    const sh = ss.getSheetByName(name);
    if (!sh) { out[name] = { headers: [], rows: [] }; return; }
    const values = sh.getDataRange().getValues();
    const headers = (values[0] || []).map(function (h) { return String(h === null ? '' : h).trim(); });
    const rows = [];
    for (let i = 1; i < values.length; i++) {
      const raw = values[i];
      if (raw.every(function (v) { return v === '' || v === null; })) continue;
      const rec = {};
      headers.forEach(function (h, c) {
        if (!h) return;
        rec[h] = normalizeCell_(raw[c]);
      });
      rec._row = i + 1;
      rows.push(rec);
    }
    out[name] = { headers: headers.filter(function (h) { return h; }), rows: rows };
  });
  return out;
}

function normalizeCell_(v) {
  if (v === null || v === undefined) return null;
  if (v instanceof Date) return Utilities.formatDate(v, TZ, 'yyyy-MM-dd');
  if (typeof v === 'string') { const s = v.trim(); return s === '' ? null : s; }
  if (typeof v === 'boolean') return v;
  if (typeof v === 'number') return v;
  return String(v);
}
