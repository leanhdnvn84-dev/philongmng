/**
 * ============================================================
 *  THPT NGUYỄN HIỀN · NIÊN KHOÁ 2000 – 2003
 *  Web app Google Apps Script – Code.gs
 *  Dữ liệu: Google Sheet · Ảnh: Google Drive
 *  Vai trò: Ban liên lạc (super) · Admin lớp (class – mỗi lớp 1 admin)
 * ============================================================
 *  CÀI ĐẶT LẦN ĐẦU: chọn hàm `setup` → Run → xem Execution log
 *  để lấy mật khẩu tài khoản "banlienlac". Dữ liệu ghi vào Sheet NGUYENHIEN_DATA.
 * ============================================================
 */

const SHEETS = {
  Lop:      ['id', 'ten', 'gvcn', 'ban', 'gioiThieu', 'thuTu'],
  HocSinh:  ['id', 'lopId', 'hoTen', 'chucVu', 'hienO', 'thuTu', 'sdt', 'ngaySinh', 'nu'],
  HoatDong: ['id', 'namHoc', 'ngay', 'tieuDe', 'moTa', 'icon', 'anhId', 'trangThai', 'lopDeXuat', 'taoLuc'],
  ThayCo:   ['id', 'hoTen', 'vaiTro', 'anhId', 'thuTu'],
  LuuBut:   ['id', 'lopId', 'tacGia', 'noiDung', 'trangThai', 'taoLuc'],
  Anh:      ['id', 'album', 'lopId', 'chuThich', 'fileId', 'nguoiDang', 'taoLuc'],
  TaiKhoan: ['user', 'hoTen', 'role', 'lopId', 'salt', 'hash', 'active', 'lienHe'],
  TinTuc:   ['id', 'loai', 'tieuDe', 'noiDung', 'ngay', 'noiBat', 'trangThai', 'taoLuc'],
  DangKy:   ['id', 'lopId', 'hoTen', 'lienHe', 'ghiChu', 'trangThai', 'taoLuc'],
  TimBan:   ['id', 'nguoiTim', 'lopNguoiTim', 'lienHe', 'timAi', 'lopCanTim', 'manhMoi', 'trangThai', 'phanHoi', 'taoLuc', 'ghiChu'],
  NhatKy:   ['time', 'user', 'action'],
  LuotXem:  ['id', 'thoiGian', 'khach', 'moi', 'thietBi', 'nguon', 'loai', 'giaTri'],
  CauHinh:  ['key', 'value']
};

const CONFIG_KEYS = ['tenTruong', 'nienKhoa', 'namRaTruong', 'diaChi', 'cauMoDau', 'loiNgo', 'nguoiKy', 'trichDan', 'trichDanTacGia', 'banLienLac', 'doanMoDau', 'thuNgo', 'giayMoi', 'keHoach', 'tuDuyetLb', 'taiTro', 'anhien', 'ttLoiMoi', 'ttNguoiLienHe', 'ttSoLienHe', 'banQuyen'];
const CONFIG_DEFAULT = {
  tenTruong: 'THPT Nguyễn Hiền',
  nienKhoa: '2000 – 2003',
  namRaTruong: '2003',
  diaChi: '61 Phan Đăng Lưu, Hòa Cường Nam, Hải Châu, Đà Nẵng',
  cauMoDau: 'Mùa hè nào rồi cũng qua, chỉ mùa hè năm ấy là ở lại mãi.',
  /** Đoạn dưới câu mở đầu trang chủ. Chữ trong ngoặc nhọn tự thay: {namRaTruong} {tenTruong} {diaChi} (phần trước dấu phẩy đầu) {soNam} {soLop} */
  tuDuyetLb: '',
  taiTro: '',
  anhien: '1', // Dòng liên hệ cuối popup nhà tài trợ: 1 hiện, 0 ẩn.
  ttLoiMoi: 'Muốn đồng hành cùng buổi Gala? Liên hệ',
  ttNguoiLienHe: '', // Để trống thì lấy người đầu tiên trong Ban liên lạc.
  ttSoLienHe: '',
  doanMoDau: 'Tháng Năm {namRaTruong}, ba hồi trống cuối cùng vang lên trên sân trường {tenTruong}, {diaChi}. Những cánh phượng rơi đỏ lối. Cuốn lưu bút chưa kịp chuyền hết một vòng lớp. Có những lời tạm biệt mình hẹn để mai nói, rồi để tới tận bây giờ. {soNam} năm, mỗi đứa một phương trời. Nơi này là để {soLop} lớp mình gọi tên nhau thêm một lần nữa.',
  trichDan: 'Gốc phượng sân sau giờ còn không ta? Ai về trường chụp giùm một tấm nha.',
  trichDanTacGia: 'Lưu bút của một bạn khoá 2000 – 2003',
  loiNgo: 'Ba năm áo trắng trôi qua như một cái chớp mắt. Hơn hai mươi năm sau, chúng ta mỗi người một ngả, nhưng tiếng trống trường, gốc phượng sân sau và những trang lưu bút vẫn còn đó. Trang này là để mình tìm lại nhau.',
  nguoiKy: 'Ban liên lạc khoá 2000 – 2003',
  /** Mỗi dòng một người: Họ tên | Điện thoại hoặc Zalo | Vai trò (tuỳ chọn) */
  /** Nội dung popup Thư ngỏ / Giấy mời (JSON) và Kế hoạch (văn bản có ký hiệu) – để trống dùng mặc định trong Index.html */
  thuNgo: '', giayMoi: '', keHoach: '',
  banLienLac: 'Lê Trung Hiếu | 0905 394 493\nHoàng Diệu Thúy | 0905 865 867\nNguyễn Thị Tuyết Mai | 0905 516 896'
};

/** Câu mặc định của các bản trước: nếu Sheet còn giữ nguyên thì tự dùng câu mặc định mới. */
const CONFIG_CU = {
  cauMoDau: ['Mùa phượng năm ấy, mình rời trường.', 'Có một mùa hè, tụi mình để quên tuổi mười tám ở sân trường.']
};

/** Mục để trống trong Sheet thì dùng giá trị mặc định (vd. lỡ bấm Lưu khi ô còn trống). */
const CONFIG_TRONG_DUNG_MAC_DINH = ['banLienLac', 'doanMoDau'];

/** Thư mục Drive gốc – mọi dữ liệu (Sheet + ảnh) đều lưu ở đây */
const ROOT_FOLDER_ID = '1xUV4WDLHiE9YlyG35Fy3v7ELSxlWWV_a';
/** Thư mục ảnh thầy cô (dán mã ảnh vào cột anhId của tab ThayCo) */
const THAYCO_FOLDER_ID = '19LbsB4ivxftPNtybx8A3Xcb-vnSXxK4K';

/** Google Sheet dữ liệu gốc: NGUYENHIEN_DATA */
const DATA_SHEET_ID = '1EyH5_IAwYVhNPuZFbwMpauCW0K1Y0S4yxOQ93Nla7LE';

/** Số lớp 12 của khoá – tên lớp dạng 12/1 … 12/12 */
const SO_LOP = 12;

const TZ = 'Asia/Ho_Chi_Minh';
const SESSION_TTL = 21600; // 6 giờ
const PROP = PropertiesService.getScriptProperties();
let _ss = null;
let _cache = {};
let _hdr = {};
/** Cột chỉ admin xem được, không đưa ra trang công khai */
const PRIVATE_COLS = { HocSinh: ['sdt'], TimBan: ['lienHe', 'phanHoi', 'ghiChu'] };

/* ======================= WEB ======================= */
function doGet(e) {
  const out = HtmlService.createHtmlOutputFromFile('Index');
  /* Tham số trên link (vd. ?viet=1 từ mã QR ở buổi Gala → mở thẳng ô Viết lưu bút). Chỉ nhận vài khoá, giá trị chữ/số ngắn. */
  const p = (e && e.parameter) || {}, tham = {};
  ['viet', 'trang'].forEach(function (k) { if (p[k] && /^[\w-]{1,20}$/.test(p[k])) tham[k] = p[k]; });
  const th = 'window.THAM=' + JSON.stringify(tham) + ';';
  /* Gửi sẵn dữ liệu công khai cùng trang: khỏi chờ thêm một lần gọi google.script.run (mở trong Zalo nhanh hơn).
     Thoát "/" và "<" để Apps Script không cắt "//" và không đóng thẻ script sớm. */
  try {
    const j = pubJson_().replace(/</g, '\\u003c').replace(/\//g, '\\/');
    const rv = 'window.BOOT_REV=' + JSON.stringify(CacheService.getScriptCache().get('PUB_REV') || '') + ';';
    out.setContent(out.getContent().replace('<script id="boot"></script>', function () { return '<script id="boot">' + th + rv + 'window.BOOT=' + j + ';</script>'; }));
  } catch (err) {
    console.log('BOOT: ' + err.message);
    out.setContent(out.getContent().replace('<script id="boot"></script>', function () { return '<script id="boot">' + th + '</script>'; }));
  }
  return out
    .setTitle('THPT Nguyễn Hiền · Niên khoá 2000–2003')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/* ======================= SETUP ======================= */
function setup() {
  const root = DriveApp.getFolderById(ROOT_FOLDER_ID);
  const ss = SpreadsheetApp.openById(DATA_SHEET_ID);
  PROP.setProperty('SS_ID', ss.getId());
  _ss = ss;

  Object.keys(SHEETS).forEach(function (name) {
    const sh = ss.getSheetByName(name) || ss.insertSheet(name);
    const h = hdr_(name); // giữ nguyên các cột bạn tự thêm, chỉ bổ sung cột còn thiếu ở cuối
    sh.getRange(1, 1, 1, h.length).setFontWeight('bold').setBackground('#1e4f9c').setFontColor('#ffffff');
    sh.setFrozenRows(1);
    sh.getRange(1, 1, sh.getMaxRows(), h.length).setNumberFormat('@');
  });
  ['Sheet1', 'Trang tính1'].forEach(function (n) {
    const s = ss.getSheetByName(n);
    if (s && s.getLastRow() === 0 && ss.getSheets().length > 1) ss.deleteSheet(s);
  });

  let photoFolderOk = false;
  const savedFolder = PROP.getProperty('FOLDER_ID');
  if (savedFolder) { try { DriveApp.getFolderById(savedFolder); photoFolderOk = true; } catch (e) { } }
  if (!photoFolderOk) {
    const it = root.getFoldersByName('ANH');
    const f = it.hasNext() ? it.next() : root.createFolder('ANH');
    PROP.setProperty('FOLDER_ID', f.getId());
  }

  const cfg = read_('CauHinh');
  Object.keys(CONFIG_DEFAULT).forEach(function (k) {
    if (!cfg.some(function (c) { return c.key === k; })) append_('CauHinh', { key: k, value: CONFIG_DEFAULT[k] });
  });

  // Tạo sẵn 12 lớp: 12/1 → 12/12 (chỉ thêm lớp còn thiếu)
  const have = read_('Lop').map(function (l) { return l.ten; });
  const newLop = [];
  for (let i = 1; i <= SO_LOP; i++) {
    const ten = '12/' + i;
    if (have.indexOf(ten) < 0) newLop.push({ id: uid_() + i, ten: ten, gvcn: '', ban: '', gioiThieu: '', thuTu: String(i) });
  }
  if (newLop.length) { appendMany_('Lop', newLop); Logger.log('>>> Đã tạo ' + newLop.length + ' lớp (12/1 → 12/' + SO_LOP + ')'); }

  if (!read_('TaiKhoan').some(function (a) { return a.role === 'super'; })) {
    const pw = easyPw_();
    const salt = Utilities.getUuid();
    append_('TaiKhoan', { user: 'banlienlac', hoTen: 'Ban liên lạc', role: 'super', lopId: '', salt: salt, hash: hash_(salt, pw), active: '1' });
    Logger.log('>>> TÀI KHOẢN BAN LIÊN LẠC:  banlienlac  /  ' + pw + '   (hãy đổi mật khẩu sau khi đăng nhập)');
  }
  Logger.log('>>> Sheet dữ liệu: ' + ss.getUrl());
  Logger.log('>>> Thư mục ảnh: https://drive.google.com/drive/folders/' + PROP.getProperty('FOLDER_ID'));
}

/* ======================= DATA HELPERS ======================= */
function ss_() {
  if (_ss) return _ss;
  return (_ss = SpreadsheetApp.openById(DATA_SHEET_ID));
}
function sh_(n) { return ss_().getSheetByName(n) || shTen_(n) || taoSheet_(n); }
/** Sheet người dùng tự tạo với tên có dấu/cách (vd. "Tìm bạn", "Tìm bạn cũ") vẫn nhận là TimBan. */
function shTen_(n) {
  if (n !== 'TimBan') return null;
  const k = function (t) { return String(t).normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/gi, 'd').replace(/[^a-z]/gi, '').toLowerCase(); };
  const ds = ss_().getSheets().filter(function (x) { return /^timban(cu)?$/.test(k(x.getName())); });
  return ds[0] || null;
}
/** Sheet mới thêm ở bản sau (vd. LuotXem) tự tạo khi cần, khỏi phải chạy lại setup(). */
function taoSheet_(n) {
  if (!SHEETS[n]) return null;
  const sh = ss_().insertSheet(n);
  sh.getRange(1, 1, 1, SHEETS[n].length).setNumberFormat('@').setValues([SHEETS[n]]).setFontWeight('bold');
  sh.setFrozenRows(1);
  return sh;
}

/**
 * Hàng tiêu đề thật của sheet. Dữ liệu đọc/ghi theo TÊN cột, nên trong Sheet có thể chèn,
 * đổi thứ tự hay thêm cột riêng mà không bị lệch. Cột thiếu được tự thêm vào cuối.
 */
function hdr_(n) {
  if (_hdr[n]) return _hdr[n];
  const sh = sh_(n), lc = sh.getLastColumn();
  let h = lc ? sh.getRange(1, 1, 1, lc).getDisplayValues()[0].map(function (x) { return String(x).trim(); }) : [];
  while (h.length && !h[h.length - 1]) h.pop();
  const miss = SHEETS[n].filter(function (k) {
    if (n === 'HocSinh' && k === 'nu') return !h.some(function (x) { return x.toLowerCase() === 'nu'; });
    if (n === 'HocSinh' && k === 'ngaySinh') return !h.some(function (x) { return /^(ngaysinh|namsinh|ngay sinh|ngày sinh|ngày tháng năm sinh)$/i.test(x); });
    return h.indexOf(k) < 0;
  });
  if (miss.length) {
    sh.getRange(1, h.length + 1, 1, miss.length).setNumberFormat('@').setValues([miss]);
    if (n === 'HocSinh' && miss.indexOf('nu') >= 0) sh.getRange(2, h.length + miss.indexOf('nu') + 1, Math.max(1, sh.getMaxRows() - 1), 1).insertCheckboxes();
    h = h.concat(miss);
  }
  return (_hdr[n] = h);
}
/** Khoá của cột j: tên cột, hoặc __cJ nếu ô tiêu đề để trống (vẫn giữ dữ liệu khi ghi lại). */
function colKey_(h, j) { return h[j] || ('__c' + j); }
/** Bỏ dấu thanh bị gõ lặp (vd "Nguyễ̃n", "Thị̣") và chuẩn hoá Unicode. */
function clean_(v) {
  return String(v).normalize('NFC').replace(/([\u00C0-\u1EF9])[\u0300-\u036F]+/g, '$1').trim();
}

function read_(n) {
  if (_cache[n]) return _cache[n];
  const sh = sh_(n), h = hdr_(n), last = sh.getLastRow(), key = SHEETS[n][0];
  if (last < 2) return (_cache[n] = []);
  const v = sh.getRange(2, 1, last - 1, h.length).getDisplayValues();
  const out = [];
  v.forEach(function (r, i) {
    const o = { _row: i + 2 };
    h.forEach(function (k, j) { o[colKey_(h, j)] = clean_(r[j]); });
    if (n === 'HocSinh') {
      o.ngaySinh = o.namsinh || o.ngaysinh || o['ngay sinh'] || o['Ngày sinh'] || o['Ngày tháng năm sinh'] || o.ngaySinh || '';
      if (Object.prototype.hasOwnProperty.call(o, 'Nu')) o.nu = o.Nu;
    }
    if (o[key] === '') return;
    out.push(o);
  });
  return (_cache[n] = out);
}

function safe_(v) {
  const s = v == null ? '' : String(v);
  return /^[=+@]/.test(s) ? "'" + s : s;
}
function rowOf_(n, o) { const h = hdr_(n); return h.map(function (k, j) {
  if (n === 'HocSinh' && k.toLowerCase() === 'nu') return /^(true|1|yes|x|✓|co|có)$/i.test(String(o.nu || '').trim());
  if (n === 'HocSinh' && /^(ngaysinh|namsinh|ngay sinh|ngày sinh|ngày tháng năm sinh)$/i.test(k)) return safe_(o.ngaySinh);
  return safe_(o[colKey_(h, j)]);
}); }

function append_(n, o) {
  const sh = sh_(n), r = sh.getLastRow() + 1;
  sh.getRange(r, 1, 1, hdr_(n).length).setNumberFormat('@').setValues([rowOf_(n, o)]);
  delete _cache[n];
  pubBust_(n);
}
function appendMany_(n, list) {
  if (!list.length) return;
  const sh = sh_(n), r = sh.getLastRow() + 1;
  sh.getRange(r, 1, list.length, hdr_(n).length).setNumberFormat('@')
    .setValues(list.map(function (o) { return rowOf_(n, o); }));
  delete _cache[n];
  pubBust_(n);
}
function update_(n, o) {
  sh_(n).getRange(o._row, 1, 1, hdr_(n).length).setNumberFormat('@').setValues([rowOf_(n, o)]);
  delete _cache[n];
  pubBust_(n);
}
function find_(n, val) {
  const key = SHEETS[n][0];
  return read_(n).find(function (o) { return o[key] === String(val); });
}
function remove_(n, pred) {
  const rows = read_(n).filter(pred).map(function (o) { return o._row; }).sort(function (a, b) { return b - a; });
  const sh = sh_(n);
  rows.forEach(function (r) { sh.deleteRow(r); });
  delete _cache[n];
  pubBust_(n);
  return rows.length;
}
function upsert_(n, o) {
  const key = SHEETS[n][0];
  if (!o[key]) o[key] = uid_();
  const ex = find_(n, o[key]);
  if (ex) { Object.keys(o).forEach(function (k) { ex[k] = o[k]; }); update_(n, ex); }
  else append_(n, o);
  return o[key];
}

function uid_() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
function now_() { return Utilities.formatDate(new Date(), TZ, 'yyyy-MM-dd HH:mm:ss'); }
function pick_(o, keys) {
  const r = {};
  keys.forEach(function (k) { if (o && o[k] !== undefined) r[k] = String(o[k]).trim(); });
  return r;
}
function pub_(o) {
  const r = {};
  Object.keys(o).forEach(function (k) { if (k !== '_row' && k !== 'salt' && k !== 'hash' && k.indexOf('__c') !== 0) r[k] = o[k]; });
  return r;
}
/** Bản công khai: chỉ các cột chuẩn của sheet, bỏ cột riêng tư (vd số điện thoại). */
function pubOf_(n) {
  const hide = PRIVATE_COLS[n] || [];
  return function (o) {
    const r = {};
    SHEETS[n].forEach(function (k) { if (hide.indexOf(k) < 0) r[k] = o[k] == null ? '' : o[k]; });
    return r;
  };
}
function sort_(arr) {
  return arr.slice().sort(function (a, b) {
    const x = Number(a.thuTu) || 9999, y = Number(b.thuTu) || 9999;
    return x - y || String(a.ten || a.hoTen || '').localeCompare(String(b.ten || b.hoTen || ''), 'vi', { numeric: true });
  });
}
function lock_(fn) {
  const l = LockService.getScriptLock();
  l.waitLock(20000);
  try { return fn(); } finally { l.releaseLock(); }
}
function log_(u, action) {
  try { append_('NhatKy', { time: now_(), user: u.user, action: action }); } catch (e) { }
}
function cfg_() {
  const r = {};
  Object.keys(CONFIG_DEFAULT).forEach(function (k) { r[k] = CONFIG_DEFAULT[k]; });
  read_('CauHinh').forEach(function (c) {
    const cu = (CONFIG_CU[c.key] || []).indexOf(c.value) >= 0;
    const trong = c.value === '' && CONFIG_TRONG_DUNG_MAC_DINH.indexOf(c.key) >= 0;
    r[c.key] = cu || trong ? CONFIG_DEFAULT[c.key] : c.value;
  });
  return r;
}
function req_(v, label, max) {
  v = String(v || '').trim();
  if (!v) throw new Error('Vui lòng nhập ' + label + '.');
  if (max && v.length > max) throw new Error(label + ' quá dài (tối đa ' + max + ' ký tự).');
  return v;
}

/* ======================= IMAGES (DRIVE) ======================= */
function folder_() {
  const id = PROP.getProperty('FOLDER_ID');
  if (!id) throw new Error('Chưa có thư mục ảnh. Hãy chạy setup().');
  return DriveApp.getFolderById(id);
}
function saveImage_(dataUrl, name, thuMuc) {
  const m = String(dataUrl || '').match(/^data:(image\/[\w+.\-]+);base64,(.+)$/);
  if (!m) throw new Error('Tệp ảnh không hợp lệ.');
  if (m[2].length > 15 * 1024 * 1024) throw new Error('Ảnh quá lớn.');
  const blob = Utilities.newBlob(Utilities.base64Decode(m[2]), m[1], name || ('anh_' + uid_() + '.jpg'));
  const f = (thuMuc || folder_()).createFile(blob);
  try { f.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW); } catch (e) { }
  return f.getId();
}
/** Nhận mã ảnh Drive hoặc nguyên đường link (…/file/d/MÃ/view, …?id=MÃ) → trả về mã. */
function idAnh_(v) {
  v = String(v || '').trim();
  const m = v.match(/\/d\/([\w-]{20,})/) || v.match(/[?&]id=([\w-]{20,})/);
  return m ? m[1] : v;
}
/**
 * Ảnh dán tay vào Sheet (thầy cô, hoạt động, album) thường đang để riêng tư → trang không hiện được.
 * Tự mở quyền "Bất kỳ ai có đường liên kết đều xem được", mỗi ảnh một lần (nhớ trong Script Property ANH_DA_MO).
 */
function moAnh_(ids, epBuoc) {
  let memo = [];
  try { memo = JSON.parse(PROP.getProperty('ANH_DA_MO') || '[]'); } catch (e) { }
  const ketQua = [];
  let doi = false;
  ids.forEach(function (id) {
    if (!id || (!epBuoc && memo.indexOf(id) >= 0)) return;
    try {
      DriveApp.getFileById(id).setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      ketQua.push([id, 'đã mở']);
    } catch (e) { ketQua.push([id, 'lỗi: ' + e.message]); }
    if (memo.indexOf(id) < 0) { memo.push(id); doi = true; }
  });
  if (doi) { try { PROP.setProperty('ANH_DA_MO', JSON.stringify(memo.slice(-300))); } catch (e) { } }
  return ketQua;
}
/* ---------- Ảnh lấy thẳng từ thư mục Drive ----------
 * Trong thư mục ANH: mỗi lớp 1 thư mục tên là lớp ("12-4"), thư mục "Chung" cho ảnh không thuộc lớp nào,
 * thư mục "GVCN" cho ảnh thầy cô (tên tệp có số lớp, vd "12-4.jpg", hoặc tên thầy cô).
 * Bỏ ảnh vào thư mục → bấm "Đồng bộ ảnh từ Drive" (Quản trị → Hình ảnh) hoặc chờ đồng bộ tự động.
 * Ảnh tải lên qua trang cũng được lưu thẳng vào thư mục của lớp.
 */
const THU_MUC_CHUNG = 'Chung';
const NGUON_DRIVE = 'Thư mục Drive';
function tenThuMucLop_(ten) { return String(ten).replace(/\//g, '-'); }
function thuMucCon_(cha, ten, khacTen) {
  const ds = [ten].concat(khacTen || []);
  for (let i = 0; i < ds.length; i++) {
    const it = cha.getFoldersByName(ds[i]);
    if (it.hasNext()) return it.next();
  }
  return cha.createFolder(ten);
}
/** Thư mục ảnh của một lớp (lopId rỗng → thư mục Chung). Chấp nhận cả tên "Lớp 12-4", "12.4", "12_4". */
function thuMucAnh_(lopId, goc) {
  goc = goc || folder_();
  const l = lopId ? find_('Lop', lopId) : null;
  if (!l) return thuMucCon_(goc, THU_MUC_CHUNG, ['Ảnh chung', 'Chung cả khoá']);
  const t = tenThuMucLop_(l.ten);
  return thuMucCon_(goc, t, ['Lớp ' + t, String(l.ten).replace(/\//g, '.'), String(l.ten).replace(/\//g, '_')]);
}
function anhTrong_(folder) {
  const out = [], it = folder.getFiles();
  while (it.hasNext()) {
    const f = it.next();
    if (f.isTrashed() || !/^image\//.test(f.getMimeType())) continue;
    out.push(f);
  }
  return out;
}
function boDau_(v) { return String(v || '').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase(); }
function albumTuTen_(ten, lopId) {
  const n = boDau_(ten);
  if (/ngay\s*ay/.test(n)) return 'Ngày ấy';
  if (/bay\s*gio/.test(n)) return 'Bây giờ';
  return lopId ? 'Ảnh lớp' : 'Ảnh chung';
}

/**
 * Xếp ảnh đã có vào đúng thư mục (chạy một lần khi chuyển sang cách mới, gọi lại cũng không sao):
 * ảnh trong tab Anh → thư mục lớp/Chung; ảnh rời ở thư mục ANH: ảnh thầy cô → GVCN, còn lại → Chung.
 * Chỉ CHUYỂN tệp (giữ nguyên mã ảnh), không tạo bản sao.
 */
function xepAnhVaoThuMuc_() {
  const goc = folder_(), gocId = goc.getId(), kq = { chuyen: 0 }, tm = {};
  const thuMuc = function (lopId) { return tm[lopId] || (tm[lopId] = thuMucAnh_(lopId, goc)); };
  const trong = function (f, folder) { const it = f.getParents(); while (it.hasNext()) if (it.next().getId() === folder.getId()) return true; return false; };
  read_('Anh').forEach(function (a) {
    if (!a.fileId) return;
    try {
      const f = DriveApp.getFileById(idAnh_(a.fileId)), dich = thuMuc(a.lopId);
      if (!trong(f, dich)) { f.moveTo(dich); kq.chuyen++; }
    } catch (e) { }
  });
  const anhGv = {}, anhHd = {};
  read_('ThayCo').forEach(function (t) { if (t.anhId) anhGv[idAnh_(t.anhId)] = 1; });
  read_('HoatDong').forEach(function (h) { if (h.anhId) anhHd[idAnh_(h.anhId)] = 1; });
  const gv = thuMucCon_(goc, 'GVCN');
  anhTrong_(goc).forEach(function (f) {
    if (anhHd[f.getId()]) return;
    f.moveTo(anhGv[f.getId()] ? gv : thuMuc(''));
    kq.chuyen++;
  });
  return kq;
}

function dongBoAnh_() {
  const goc = folder_(), kq = { them: 0, doi: 0, xoa: 0, gv: 0, chuaGan: [] };
  if (!PROP.getProperty('DA_XEP_ANH')) { kq.chuyen = xepAnhVaoThuMuc_().chuyen; PROP.setProperty('DA_XEP_ANH', '1'); }
  const anh = read_('Anh'), theoFile = {}, thay = [], moi = [], moQuyen = [], co = {};
  anh.forEach(function (a) { if (a.fileId) theoFile[idAnh_(a.fileId)] = a; });
  const ds = sort_(read_('Lop')).map(function (l) { return l.id; }).concat(['']);
  ds.forEach(function (lopId) {
    anhTrong_(thuMucAnh_(lopId, goc)).forEach(function (f) {
      const id = f.getId(), a = theoFile[id];
      co[id] = 1;
      if (a) { if (a.lopId !== lopId) { a.lopId = lopId; thay.push(a); } return; }
      moi.push({ id: uid_() + moi.length, album: albumTuTen_(f.getName(), lopId), lopId: lopId, chuThich: f.getDescription() || '', fileId: id, nguoiDang: NGUON_DRIVE, taoLuc: now_() });
      moQuyen.push(id);
    });
  });
  thay.forEach(function (a) { update_('Anh', a); });
  kq.doi = thay.length;
  if (moi.length) { appendMany_('Anh', moi); kq.them = moi.length; }
  kq.xoa = remove_('Anh', function (a) { return a.nguoiDang === NGUON_DRIVE && !co[idAnh_(a.fileId)]; });
  /* GVCN */
  const tc = read_('ThayCo'), daGan = {};
  tc.forEach(function (t) { if (t.anhId) daGan[idAnh_(t.anhId)] = 1; });
  anhTrong_(thuMucCon_(goc, 'GVCN')).forEach(function (f) {
    const ten = f.getName().replace(/\.[^.]+$/, ''), m = ten.match(/12\s*[-_.\/ ]\s*(\d{1,2})(?!\d)/);
    let t = null;
    if (m) t = tc.find(function (x) { return new RegExp('12\\s*/\\s*' + Number(m[1]) + '(?!\\d)').test(x.vaiTro); });
    if (!t) t = tc.find(function (x) { const h = boDau_(x.hoTen).replace(/^(co|thay)\s+/, ''); return h.split(' ').length > 1 && boDau_(ten).indexOf(h) >= 0; });
    if (!t) { if (!daGan[f.getId()]) kq.chuaGan.push(f.getName()); else moQuyen.push(f.getId()); return; }
    moQuyen.push(f.getId());
    if (idAnh_(t.anhId) !== f.getId()) { t.anhId = f.getId(); update_('ThayCo', t); kq.gv++; }
  });
  moAnh_(moQuyen, false);
  return kq;
}
function moTaDongBo_(kq) {
  return (kq.chuyen ? 'Đã xếp ' + kq.chuyen + ' ảnh cũ vào thư mục lớp/Chung. ' : '') +
    'Thêm ' + kq.them + ' ảnh, chuyển lớp ' + kq.doi + ' ảnh, gỡ ' + kq.xoa + ' ảnh đã xoá khỏi thư mục, gán ' + kq.gv + ' ảnh GVCN.' +
    (kq.chuaGan.length ? ' Chưa gán được (đặt tên có số lớp, vd 12-4.jpg): ' + kq.chuaGan.join(', ') : '');
}
/** Quản trị → Hình ảnh → "Đồng bộ ảnh từ Drive" (Ban liên lạc). */
function dongBoAnhDrive(token) {
  return lock_(function () {
    const u = auth_(token, true);
    const msg = moTaDongBo_(dongBoAnh_());
    log_(u, 'Đồng bộ ảnh từ Drive: ' + msg);
    return msg;
  });
}
/** Chạy trong trình soạn thảo (và bởi trình kích hoạt tự động). */
function dongBoAnh() {
  const l = LockService.getScriptLock();
  if (!l.tryLock(30000)) return;
  try { Logger.log(moTaDongBo_(dongBoAnh_())); } finally { l.releaseLock(); }
}
/** Chạy trong trình soạn thảo: xếp lại toàn bộ ảnh đã có vào đúng thư mục lớp/Chung/GVCN rồi đồng bộ. */
function xepLaiAnh() {
  const l = LockService.getScriptLock();
  l.waitLock(30000);
  try {
    const n = xepAnhVaoThuMuc_().chuyen;
    PROP.setProperty('DA_XEP_ANH', '1');
    Logger.log('Đã chuyển ' + n + ' ảnh. ' + moTaDongBo_(dongBoAnh_()));
  } finally { l.releaseLock(); }
}
/** Chạy một lần trong trình soạn thảo: tạo thư mục cho từng lớp + bật đồng bộ ảnh tự động 30 phút/lần. */
function batDongBoAnhTuDong() {
  ScriptApp.getProjectTriggers().forEach(function (t) { if (t.getHandlerFunction() === 'dongBoAnh') ScriptApp.deleteTrigger(t); });
  ScriptApp.newTrigger('dongBoAnh').timeBased().everyMinutes(30).create();
  dongBoAnh();
  Logger.log('Đã bật đồng bộ ảnh tự động mỗi 30 phút. Thư mục ảnh: ' + folder_().getUrl());
}

/** Chạy trong trình soạn thảo: mở quyền xem cho mọi ảnh thầy cô / hoạt động / album và in mã các ảnh trong thư mục thầy cô. */
function moQuyenAnh() {
  const ids = [];
  read_('ThayCo').forEach(function (t) { if (t.anhId) ids.push(idAnh_(t.anhId)); });
  read_('HoatDong').forEach(function (h) { if (h.anhId) ids.push(idAnh_(h.anhId)); });
  read_('Anh').forEach(function (a) { if (a.fileId) ids.push(idAnh_(a.fileId)); });
  try {
    const it = DriveApp.getFolderById(THAYCO_FOLDER_ID).getFiles();
    Logger.log('Ảnh trong thư mục thầy cô (copy mã dán vào cột anhId của tab ThayCo):');
    while (it.hasNext()) {
      const f = it.next();
      if (!/^image\//.test(f.getMimeType())) continue;
      ids.push(f.getId());
      Logger.log('  ' + f.getName() + '  →  ' + f.getId());
    }
  } catch (e) { Logger.log('Không mở được thư mục thầy cô: ' + e.message); }
  moAnh_(ids, true).forEach(function (r) { if (r[1] !== 'đã mở') Logger.log(r[0] + ': ' + r[1]); });
  pubBust_('');
  Logger.log('Xong: đã mở quyền xem cho ' + ids.length + ' ảnh. Mở lại trang là thấy.');
}
function trashImage_(id) {
  if (!id) return;
  try { DriveApp.getFileById(id).setTrashed(true); } catch (e) { }
}

/* ======================= AUTH ======================= */
function hash_(salt, pw) {
  return Utilities.base64Encode(Utilities.computeDigest(
    Utilities.DigestAlgorithm.SHA_256, salt + '|' + pw, Utilities.Charset.UTF_8));
}
function normUser_(u) { return String(u || '').trim().toLowerCase(); }

function login(user, pw) {
  user = normUser_(user);
  const cache = CacheService.getScriptCache();
  const fk = 'F_' + user;
  const fails = Number(cache.get(fk) || 0);
  if (fails >= 5) throw new Error('Đăng nhập sai quá nhiều lần. Vui lòng thử lại sau 10 phút.');
  const a = find_('TaiKhoan', user);
  if (!a || a.active === '0' || hash_(a.salt, String(pw || '')) !== a.hash) {
    cache.put(fk, String(fails + 1), 600);
    throw new Error('Sai tên đăng nhập hoặc mật khẩu.');
  }
  cache.remove(fk);
  const token = Utilities.getUuid();
  cache.put('S_' + token, JSON.stringify({ user: a.user }), SESSION_TTL);
  log_(a, 'Đăng nhập');
  return { token: token, user: a.user, hoTen: a.hoTen, role: a.role, lopId: a.lopId, adminData: getAdminData(token) };
}

function logout(token) {
  if (token) CacheService.getScriptCache().remove('S_' + token);
  return true;
}

function auth_(token, needSuper) {
  const raw = token && CacheService.getScriptCache().get('S_' + token);
  if (!raw) throw new Error('SESSION: Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
  const s = JSON.parse(raw);
  const a = find_('TaiKhoan', s.user);
  if (!a || a.active === '0') throw new Error('SESSION: Tài khoản không còn hiệu lực.');
  if (needSuper && a.role !== 'super') throw new Error('Chỉ Ban liên lạc mới được thực hiện thao tác này.');
  return { user: a.user, hoTen: a.hoTen, role: a.role, lopId: a.lopId, lienHe: a.lienHe || '' };
}
function canLop_(u, lopId) {
  if (u.role !== 'super' && u.lopId !== String(lopId || '')) throw new Error('Bạn chỉ được quản lý lớp của mình.');
}

function changePassword(token, oldPw, newPw) {
  return lock_(function () {
    const u = auth_(token);
    const a = find_('TaiKhoan', u.user);
    if (hash_(a.salt, String(oldPw || '')) !== a.hash) throw new Error('Mật khẩu hiện tại không đúng.');
    if (String(newPw || '').length < 6) throw new Error('Mật khẩu mới phải từ 6 ký tự.');
    a.salt = Utilities.getUuid();
    a.hash = hash_(a.salt, String(newPw));
    update_('TaiKhoan', a);
    log_(u, 'Đổi mật khẩu');
    return true;
  });
}

/**
 * Quên mật khẩu Ban liên lạc: chọn hàm này trong trình soạn thảo → Run → xem Execution log.
 * Đặt mật khẩu mới dễ nhớ cho tài khoản "banlienlac" (tạo mới nếu chưa có) và mở khoá đăng nhập.
 */
function datLaiMatKhauBanLienLac() {
  if (!Session.getActiveUser().getEmail()) throw new Error('Chỉ chạy được từ trình soạn thảo Apps Script.');
  return lock_(function () {
    const pw = easyPw_(), salt = Utilities.getUuid();
    const a = find_('TaiKhoan', 'banlienlac');
    if (a) { a.salt = salt; a.hash = hash_(salt, pw); a.active = '1'; a.role = 'super'; update_('TaiKhoan', a); }
    else append_('TaiKhoan', { user: 'banlienlac', hoTen: 'Ban liên lạc', role: 'super', lopId: '', salt: salt, hash: hash_(salt, pw), active: '1' });
    CacheService.getScriptCache().remove('F_banlienlac');
    Logger.log('>>> TÀI KHOẢN BAN LIÊN LẠC:  banlienlac  /  ' + pw + '   (đăng nhập xong nên đổi mật khẩu)');
    return 'banlienlac / ' + pw;
  });
}

/* ======================= PUBLIC ======================= */
function autoSeed_() {
  if (PROP.getProperty('DEMO_AUTO') || typeof napDuLieuMau_ !== 'function') return;
  const empty = function (n) { const s = sh_(n); return !s || s.getLastRow() < 2; };
  if (!empty('HocSinh') || !empty('HoatDong') || !empty('Anh') || !empty('TinTuc')) { PROP.setProperty('DEMO_AUTO', '1'); return; }
  lock_(function () {
    if (PROP.getProperty('DEMO_AUTO')) return;
    _cache = {};
    try { napDuLieuMau_(); } finally { PROP.setProperty('DEMO_AUTO', '1'); _cache = {}; }
  });
}

/* Dữ liệu công khai lưu đệm ở CacheService (chia nhỏ vì mỗi ô tối đa 100KB), xoá ngay khi có ghi dữ liệu. */
const PUB_KEY = 'PUB_STUDENT_V3_', PUB_TTL = 420, PUB_CHUNK = 30000;
function pubBust_(n) {
  if (n === 'NhatKy' || n === 'LuotXem') return;
  try {
    const c = CacheService.getScriptCache();
    const slide = ['Lop', 'Anh', 'LuuBut', 'ThayCo', 'TinTuc', 'CauHinh', 'TaiKhoan'].indexOf(n) >= 0;
    c.removeAll((n === 'LuuBut' ? [PUB_KEY + 'n', 'LB_MOI'] : [PUB_KEY + 'n']).concat(slide ? ['TC_DATA'] : []));
    if (slide) c.put('TC_REV', uid_(), SESSION_TTL);
  } catch (e) { }
}
function pubJson_() {
  const c = CacheService.getScriptCache();
  try {
    const n = Number(c.get(PUB_KEY + 'n') || 0);
    if (n) {
      const ks = [];
      for (let i = 0; i < n; i++) ks.push(PUB_KEY + i);
      const got = c.getAll(ks);
      if (ks.every(function (k) { return got[k] != null; })) return ks.map(function (k) { return got[k]; }).join('');
    }
  } catch (e) { }
  /* Chống "dồn": bộ đệm vừa xoá mà nhiều máy cùng hỏi thì chỉ MỘT lượt đọc Sheet, các lượt khác chờ bộ đệm (tối đa ~12 giây). */
  try {
    if (c.get('PUB_DANG')) {
      for (let t = 0; t < 40; t++) {
        Utilities.sleep(300);
        const n2 = Number(c.get(PUB_KEY + 'n') || 0);
        if (n2) {
          const ks2 = []; for (let i = 0; i < n2; i++) ks2.push(PUB_KEY + i);
          const g2 = c.getAll(ks2);
          if (ks2.every(function (k) { return g2[k] != null; })) return ks2.map(function (k) { return g2[k]; }).join('');
        }
        if (!c.get('PUB_DANG')) break;
      }
    }
    c.put('PUB_DANG', '1', 30);
  } catch (e) { }
  let j;
  try { j = JSON.stringify(taoPublicData_()); } finally { try { c.remove('PUB_DANG'); } catch (e) { } }
  try {
    const o = {}, n = Math.ceil(j.length / PUB_CHUNK);
    for (let i = 0; i < n; i++) o[PUB_KEY + i] = j.slice(i * PUB_CHUNK, (i + 1) * PUB_CHUNK);
    c.putAll(o, PUB_TTL);
    c.put(PUB_KEY + 'n', String(n), PUB_TTL);
    c.put('PUB_REV', bam_(j), 21600);
  } catch (e) { console.log('PUB cache: ' + e.message); }
  return j;
}
/** Dấu nội dung (băm nhanh): chỉ đổi khi dữ liệu công khai thật sự khác. */
function bam_(t) {
  let h = 5381, g = 0;
  for (let i = 0; i < t.length; i++) { h = ((h << 5) + h + t.charCodeAt(i)) | 0; g = (g * 31 + t.charCodeAt(i)) | 0; }
  return (h >>> 0).toString(36) + (g >>> 0).toString(36) + t.length.toString(36);
}
/** Trang hỏi định kỳ (~90 giây): chỉ đọc 1 ô bộ đệm; bộ đệm vừa bị xoá thì dựng lại một lần. Dấu đổi → trang tải dữ liệu mới. */
function getPubRev() {
  const c = CacheService.getScriptCache();
  /* Đang có máy khác dựng lại thì trả dấu cũ ngay (không chờ), lượt hỏi sau sẽ thấy dấu mới. */
  if ((!c.get(PUB_KEY + 'n') || !c.get('PUB_REV')) && !c.get('PUB_DANG')) pubJson_();
  return c.get('PUB_REV') || '0';
}
/** Trigger "Khi sửa"/"Khi thay đổi" của Sheet (bật bằng batTuCapNhat): gõ tay trong Sheet → xoá bộ đệm ngay, mọi máy thấy sau ≤ 90 giây. */
function khiSuaSheet(e) {
  let ten = '';
  try { ten = (e && e.range ? e.range.getSheet() : ss_().getActiveSheet()).getName(); } catch (x) { }
  if (ten === 'NhatKy' || ten === 'LuotXem') return;
  const k = Object.keys(SHEETS).filter(function (n) { return n === ten; })[0] || (shTen_('TimBan') && shTen_('TimBan').getName() === ten ? 'TimBan' : '');
  pubBust_(k || 'CauHinh');
}
function getPublicData() {
  return JSON.parse(pubJson_());
}
/** Chạy trong trình soạn thảo sau khi sửa tay Sheet, để trang hiện ngay (không chờ 5 phút). */
function lamMoiDuLieu() {
  pubBust_('');
  Logger.log('Đã làm mới, mở lại trang là thấy dữ liệu mới.');
}
/* Trình chiếu ở hội nghị: đọc lại Sheet ngay (bỏ qua bộ đệm) để chiếu đúng dữ liệu mới nhất, kể cả dòng sửa tay.
   Nhiều máy cùng gọi trong 20 giây thì dùng chung một lần đọc. */
function getDuLieuMoi() {
  const c = CacheService.getScriptCache();
  if (!c.get('PUB_MOI_T')) {
    pubBust_('');
    c.put('PUB_MOI_T', '1', 20);
  }
  return JSON.parse(pubJson_());
}
/** Trình chiếu chỉ cần tên lớp, ảnh, lưu bút, thầy cô, tin và cấu hình. */
function taoTrinhChieuData_() {
  const r = {
    cfg: cfg_(),
    lop: sort_(read_('Lop')).map(function (l) { return { id: l.id, ten: l.ten }; }),
    anh: read_('Anh').map(pubOf_('Anh')).map(function (a) { a.fileId = idAnh_(a.fileId); return a; }).reverse(),
    luuBut: read_('LuuBut').filter(function (x) { return x.trangThai === 'approved'; }).map(pubOf_('LuuBut')).reverse(),
    thayCo: sort_(read_('ThayCo')).map(pubOf_('ThayCo')).map(function (t) { t.anhId = idAnh_(t.anhId); return t; }),
    tinTuc: sortNews_(read_('TinTuc').filter(function (t) { return t.trangThai === 'published'; })).map(pubOf_('TinTuc'))
  };
  try { moAnh_(r.anh.map(function (a) { return a.fileId; }).concat(r.thayCo.map(function (t) { return t.anhId; })).filter(String), false); } catch (e) { console.log('moAnh trình chiếu: ' + e.message); }
  return r;
}
function getSlideRevision() {
  return CacheService.getScriptCache().get('TC_REV') || '0';
}
/** force=true đọc Sheet trực tiếp để thấy cả thay đổi gõ tay, dùng định kỳ trong lúc chiếu. */
function getSlideData(force) {
  const c = CacheService.getScriptCache(), rev = c.get('TC_REV') || '0';
  if (!force) {
    try { const raw = c.get('TC_DATA'); if (raw) return JSON.parse(raw); } catch (e) { }
  }
  const result = { rev: rev, data: taoTrinhChieuData_() };
  try { c.put('TC_DATA', JSON.stringify(result), 12); } catch (e) { }
  return result;
}
/* Giữ ấm: trigger 5 phút/lần dựng sẵn dữ liệu công khai vào bộ đệm, để doGet không phải đọc Sheet khi có người mở trang
   (bớt màn trắng lúc mở). Sửa tay Sheet cũng tự hiện sau tối đa 5 phút. */
function giuAm() {
  pubBust_('');
  pubJson_();
}
/** Chạy MỘT LẦN trong trình soạn thảo để bật giữ ấm (cần cấp quyền). */
/** Chạy MỘT LẦN trong trình soạn thảo: bật giữ ấm 5 phút + tự cập nhật khi sửa tay Sheet (cần cấp quyền). */
function batTuCapNhat() {
  ScriptApp.getProjectTriggers().forEach(function (t) { if (t.getHandlerFunction() === 'khiSuaSheet') ScriptApp.deleteTrigger(t); });
  ScriptApp.newTrigger('khiSuaSheet').forSpreadsheet(DATA_SHEET_ID).onEdit().create();
  ScriptApp.newTrigger('khiSuaSheet').forSpreadsheet(DATA_SHEET_ID).onChange().create();
  batGiuAm();
  Logger.log('Đã bật tự cập nhật: sửa tay Sheet là trang tự hiện dữ liệu mới (≤ 90 giây), giữ ấm 5 phút/lần.');
}
function batGiuAm() {
  ScriptApp.getProjectTriggers().forEach(function (t) { if (t.getHandlerFunction() === 'giuAm') ScriptApp.deleteTrigger(t); });
  ScriptApp.newTrigger('giuAm').timeBased().everyMinutes(5).create();
  giuAm();
  Logger.log('Đã bật giữ ấm: dữ liệu công khai được dựng sẵn mỗi 5 phút.');
}
function taoPublicData_() {
  try { autoSeed_(); } catch (e) { console.log('autoSeed: ' + e.message); }
  const accs = read_('TaiKhoan').filter(function (a) { return a.role === 'class' && a.active !== '0'; });
  const hs = read_('HocSinh');
  const lop = sort_(read_('Lop')).map(function (l) {
    const o = pubOf_('Lop')(l);
    const ad = accs.find(function (a) { return a.lopId === l.id; });
    o.admin = ad ? ad.hoTen : '';
    o.adminLienHe = ad ? (ad.lienHe || '') : '';
    o.hs = sort_(hs.filter(function (h) { return h.lopId === l.id; })).map(pubOf_('HocSinh'));
    return o;
  });
  const dk = read_('DangKy').filter(function (d) { return d.trangThai !== 'huy'; });
  const dkLop = {};
  dk.forEach(function (d) { dkLop[d.lopId] = (dkLop[d.lopId] || 0) + 1; });
  const r = {
    tinTuc: sortNews_(read_('TinTuc').filter(function (t) { return t.trangThai === 'published'; })).map(pubOf_('TinTuc')),
    dangKy: { tong: dk.length, theoLop: dkLop },
    timBan: read_('TimBan').filter(function (x) { return x.trangThai === 'dangtim' || x.trangThai === 'datim'; }).map(pubOf_('TimBan')).reverse(),
    cfg: cfg_(),
    lop: lop,
    hoatDong: read_('HoatDong').filter(function (e) { return e.trangThai === 'published'; }).map(pubOf_('HoatDong')).map(function (h) { h.anhId = idAnh_(h.anhId); return h; }),
    thayCo: sort_(read_('ThayCo')).map(pubOf_('ThayCo')).map(function (t) { t.anhId = idAnh_(t.anhId); return t; }),
    luuBut: read_('LuuBut').filter(function (x) { return x.trangThai === 'approved'; }).map(pubOf_('LuuBut')).reverse(),
    anh: read_('Anh').map(pubOf_('Anh')).map(function (a) { a.fileId = idAnh_(a.fileId); return a; }).reverse()
  };
  /* ảnh dán tay vào Sheet: tự mở quyền xem (mỗi ảnh một lần) */
  try {
    moAnh_([].concat(r.thayCo.map(function (t) { return t.anhId; }), r.hoatDong.map(function (h) { return h.anhId; }), r.anh.map(function (a) { return a.fileId; })).filter(String), false);
  } catch (e) { console.log('moAnh: ' + e.message); }
  return r;
}

function submitNote(tacGia, lopId, noiDung) {
  const cache = CacheService.getScriptCache();
  const cnt = Number(cache.get('NOTE_RATE') || 0);
  if (cnt > 30) throw new Error('Hệ thống đang bận, vui lòng thử lại sau ít phút.');
  cache.put('NOTE_RATE', String(cnt + 1), 60);
  tacGia = req_(tacGia, 'họ tên', 60);
  noiDung = req_(noiDung, 'nội dung lưu bút', 1500);
  lopId = String(lopId || '');
  if (lopId && !find_('Lop', lopId)) throw new Error('Lớp không tồn tại.');
  return lock_(function () {
    /* Bật "Tự duyệt lưu bút" (Cài đặt) trong buổi Gala → hiện ngay trên trình chiếu, khỏi chờ admin duyệt. */
    const tt = cfg_().tuDuyetLb === '1' ? 'approved' : 'pending';
    append_('LuuBut', { id: uid_(), lopId: lopId, tacGia: tacGia, noiDung: noiDung, trangThai: tt, taoLuc: now_() });
    return tt;
  });
}

/* Trình chiếu kỷ yếu hỏi lưu bút mới (khoảng 45 giây/lần): chỉ đọc sheet LuuBut, đệm 20 giây cho nhiều máy chiếu cùng lúc. */
function getLuuBut() {
  const cache = CacheService.getScriptCache();
  const c = cache.get('LB_MOI');
  if (c) return JSON.parse(c);
  const r = read_('LuuBut').filter(function (x) { return x.trangThai === 'approved'; }).map(pubOf_('LuuBut')).reverse();
  try { cache.put('LB_MOI', JSON.stringify(r), 20); } catch (e) {}
  return r;
}

/* ======================= ADMIN: ĐỌC DỮ LIỆU ======================= */
function getAdminData(token) {
  const u = auth_(token);
  const isS = u.role === 'super';
  const accs = read_('TaiKhoan');
  const hs = read_('HocSinh');
  let lop = sort_(read_('Lop'));
  if (!isS) lop = lop.filter(function (l) { return l.id === u.lopId; });
  lop = lop.map(function (l) {
    const o = pub_(l);
    const ad = accs.find(function (a) { return a.role === 'class' && a.lopId === l.id; });
    o.adminUser = ad ? ad.user : '';
    o.admin = ad ? ad.hoTen : '';
    o.adminLienHe = ad ? (ad.lienHe || '') : '';
    o.hs = sort_(hs.filter(function (h) { return h.lopId === l.id; })).map(pub_);
    return o;
  });
  const mine = function (x, field) { return isS || x[field] === u.lopId; };
  const lopIds = {};
  read_('Lop').forEach(function (l) { lopIds[l.id] = 1; });
  const log = read_('NhatKy').filter(function (x) { return isS || x.user === u.user; }).slice(-50).reverse().map(pub_);
  return {
    me: u,
    cfg: cfg_(),
    lop: lop,
    hoatDong: read_('HoatDong').filter(function (e) { return isS || e.lopDeXuat === u.lopId; }).map(pub_),
    thayCo: isS ? sort_(read_('ThayCo')).map(pub_) : [],
    luuBut: read_('LuuBut').filter(function (x) { return mine(x, 'lopId'); }).map(pub_).reverse(),
    anh: read_('Anh').filter(function (x) { return mine(x, 'lopId'); }).map(pub_).reverse(),
    accounts: isS ? accs.map(pub_) : [],
    hsLac: isS ? sort_(hs.filter(function (h) { return !lopIds[h.lopId]; })).map(pub_) : [],
    tinTuc: isS ? sortNews_(read_('TinTuc')).map(pub_) : [],
    dangKy: read_('DangKy').filter(function (x) { return mine(x, 'lopId'); }).map(pub_).reverse(),
    timBan: read_('TimBan').filter(function (x) { return isS || x.lopCanTim === u.lopId || x.lopNguoiTim === u.lopId; }).map(pub_).reverse(),
    log: log
  };
}

/* ======================= LỚP & ADMIN LỚP ======================= */
function saveClass(token, l) {
  return lock_(function () {
    const u = auth_(token);
    const isNew = !l || !l.id;
    if (isNew || u.role === 'super') auth_(token, true); else canLop_(u, l.id);
    if (!isNew && !find_('Lop', l.id)) throw new Error('Lớp không tồn tại.');
    const fields = u.role === 'super' ? ['id', 'ten', 'gvcn', 'ban', 'gioiThieu', 'thuTu'] : ['id', 'gvcn', 'ban', 'gioiThieu'];
    const o = pick_(l, fields);
    if (u.role === 'super') {
      o.ten = req_(o.ten, 'tên lớp', 20);
      const dup = read_('Lop').find(function (x) { return x.ten.toLowerCase() === o.ten.toLowerCase() && x.id !== o.id; });
      if (dup) throw new Error('Đã có lớp ' + o.ten + '.');
    }
    const id = upsert_('Lop', o);
    log_(u, (isNew ? 'Thêm lớp ' : 'Sửa thông tin lớp ') + (o.ten || (find_('Lop', id) || {}).ten || ''));
    return id;
  });
}

function deleteClass(token, id) {
  return lock_(function () {
    const u = auth_(token, true);
    const l = find_('Lop', id);
    if (!l) throw new Error('Lớp không tồn tại.');
    if (read_('HocSinh').some(function (h) { return h.lopId === id; })) throw new Error('Lớp còn học sinh. Hãy xoá học sinh trước.');
    if (read_('Anh').some(function (a) { return a.lopId === id; })) throw new Error('Lớp còn ảnh. Hãy xoá ảnh trước.');
    remove_('TaiKhoan', function (a) { return a.role === 'class' && a.lopId === id; });
    remove_('Lop', function (x) { return x.id === id; });
    log_(u, 'Xoá lớp ' + l.ten);
    return true;
  });
}

/** Gán / đổi admin của 1 lớp – mỗi lớp chỉ có đúng 1 admin. */
function setClassAdmin(token, lopId, user, hoTen, pw, lienHe) {
  return lock_(function () {
    const u = auth_(token, true);
    const l = find_('Lop', lopId);
    if (!l) throw new Error('Lớp không tồn tại.');
    user = normUser_(user);
    if (!/^[a-z0-9_.]{3,30}$/.test(user)) throw new Error('Tên đăng nhập chỉ gồm chữ thường không dấu, số, dấu _ hoặc . (3–30 ký tự).');
    hoTen = req_(hoTen, 'họ tên admin', 60);
    lienHe = String(lienHe || '').trim().slice(0, 60);
    const ex = find_('TaiKhoan', user);
    if (ex && !(ex.role === 'class' && ex.lopId === lopId)) throw new Error('Tên đăng nhập "' + user + '" đã được dùng cho tài khoản khác.');
    if (!ex && String(pw || '').length < 6) throw new Error('Mật khẩu phải từ 6 ký tự.');
    if (ex && pw && String(pw).length < 6) throw new Error('Mật khẩu phải từ 6 ký tự.');
    remove_('TaiKhoan', function (a) { return a.role === 'class' && a.lopId === lopId && a.user !== user; });
    if (ex) {
      const a = find_('TaiKhoan', user);
      a.hoTen = hoTen; a.active = '1'; a.lienHe = lienHe;
      if (pw) { a.salt = Utilities.getUuid(); a.hash = hash_(a.salt, String(pw)); }
      update_('TaiKhoan', a);
    } else {
      const salt = Utilities.getUuid();
      append_('TaiKhoan', { user: user, hoTen: hoTen, role: 'class', lopId: lopId, salt: salt, hash: hash_(salt, String(pw)), active: '1', lienHe: lienHe });
    }
    log_(u, 'Gán admin lớp ' + l.ten + ': ' + user);
    return true;
  });
}

/* ---- Tài khoản dễ nhớ ---- */
const PW_WORDS = ['phuongvi', 'aotrang', 'luubut', 'tiengve', 'bangden', 'phantrang', 'trongtruong', 'hoctro', 'santruong', 'muctim', 'hanhlang', 'gheda'];
/** Mật khẩu dễ nhớ dạng "luubut-4827" (chữ không dấu + 4 số). */
function easyPw_() {
  return PW_WORDS[Math.floor(Math.random() * PW_WORDS.length)] + '-' + String(1000 + Math.floor(Math.random() * 9000));
}
/** Tên đăng nhập theo tên lớp: 12/1 → lop12_1 */
function lopUser_(ten) {
  return 'lop' + String(ten || '').toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
}

/** Tạo sẵn tài khoản admin cho mọi lớp chưa có admin. Trả về danh sách {lop, user, pw} – mật khẩu chỉ hiện lần này. */
function autoCreateClassAdmins(token) {
  return lock_(function () {
    const u = auth_(token, true);
    const accs = read_('TaiKhoan');
    const rows = [], out = [];
    const taken = function (x) { return accs.some(function (a) { return a.user === x; }) || rows.some(function (r) { return r.user === x; }); };
    sort_(read_('Lop')).forEach(function (l) {
      if (accs.some(function (a) { return a.role === 'class' && a.lopId === l.id; })) return;
      const base = lopUser_(l.ten);
      let user = base, k = 1;
      while (taken(user)) user = base + '_' + (++k);
      const pw = easyPw_(), salt = Utilities.getUuid();
      rows.push({ user: user, hoTen: 'Admin lớp ' + l.ten, role: 'class', lopId: l.id, salt: salt, hash: hash_(salt, pw), active: '1', lienHe: '' });
      out.push({ lop: l.ten, user: user, pw: pw });
    });
    appendMany_('TaiKhoan', rows);
    if (rows.length) log_(u, 'Tạo tự động ' + rows.length + ' tài khoản admin lớp');
    return out;
  });
}

function removeClassAdmin(token, lopId) {
  return lock_(function () {
    const u = auth_(token, true);
    const n = remove_('TaiKhoan', function (a) { return a.role === 'class' && a.lopId === lopId; });
    log_(u, 'Gỡ admin lớp ' + ((find_('Lop', lopId) || {}).ten || lopId));
    return n;
  });
}

/* ======================= HỌC SINH ======================= */
function saveStudent(token, s) {
  return lock_(function () {
    const u = auth_(token);
    const o = pick_(s, ['id', 'lopId', 'hoTen', 'chucVu', 'hienO', 'thuTu', 'sdt', 'ngaySinh', 'nu']);
    if (o.id) {
      const ex = find_('HocSinh', o.id);
      if (!ex) throw new Error('Học sinh không tồn tại.');
      canLop_(u, ex.lopId);
    }
    if (!find_('Lop', o.lopId)) throw new Error('Lớp không tồn tại.');
    canLop_(u, o.lopId);
    o.hoTen = req_(o.hoTen, 'họ tên', 80);
    if (o.ngaySinh && !/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(o.ngaySinh)) throw new Error('Ngày sinh cần có dạng ngày/tháng/năm, ví dụ 12/04/1985.');
    if (o.ngaySinh) {
      const p = o.ngaySinh.split('/').map(Number), d = new Date(p[2], p[1] - 1, p[0]);
      if (d.getFullYear() !== p[2] || d.getMonth() !== p[1] - 1 || d.getDate() !== p[0]) throw new Error('Ngày sinh không hợp lệ.');
      o.ngaySinh = p[0].toString().padStart(2, '0') + '/' + p[1].toString().padStart(2, '0') + '/' + p[2];
    }
    o.nu = /^(true|1|yes|x|✓|co|có)$/i.test(String(o.nu || '').trim()) ? 'TRUE' : 'FALSE';
    const id = upsert_('HocSinh', o);
    log_(u, (s.id ? 'Sửa' : 'Thêm') + ' học sinh ' + o.hoTen);
    return id;
  });
}

function deleteStudent(token, id) {
  return lock_(function () {
    const u = auth_(token);
    const ex = find_('HocSinh', id);
    if (!ex) throw new Error('Học sinh không tồn tại.');
    canLop_(u, ex.lopId);
    remove_('HocSinh', function (x) { return x.id === id; });
    log_(u, 'Xoá học sinh ' + ex.hoTen);
    return true;
  });
}

/** Chuyển nhiều học sinh sang một lớp (Ban liên lạc) – dùng khi mã lớp bị nhập sai. */
function moveStudents(token, ids, lopId) {
  return lock_(function () {
    const u = auth_(token, true);
    const l = find_('Lop', lopId);
    if (!l) throw new Error('Lớp không tồn tại.');
    const set = {};
    (ids || []).forEach(function (x) { set[String(x)] = 1; });
    let n = 0;
    read_('HocSinh').slice().forEach(function (h) {
      if (set[h.id] && h.lopId !== l.id) { h.lopId = l.id; update_('HocSinh', h); n++; }
    });
    log_(u, 'Chuyển ' + n + ' học sinh sang lớp ' + l.ten);
    return n;
  });
}

/** Dán từ Excel: Họ tên, Chức vụ, Hiện ở, Điện thoại, Ngày sinh, Nữ (hai cột cuối tuỳ chọn). */
function importStudents(token, lopId, text) {
  return lock_(function () {
    const u = auth_(token);
    if (!find_('Lop', lopId)) throw new Error('Lớp không tồn tại.');
    canLop_(u, lopId);
    const exist = read_('HocSinh').filter(function (h) { return h.lopId === lopId; });
    let order = exist.length;
    const list = [];
    String(text || '').split(/\r?\n/).forEach(function (line) {
      const p = line.split(/\t|;/).map(function (x) { return x.trim(); });
      if (!p[0] || /^(họ\s*tên|ho\s*ten|stt)$/i.test(p[0])) return;
      if (/^\d+$/.test(p[0]) && p[1]) p.shift(); // bỏ cột STT
      const ngaySinh = p[4] || '';
      if (ngaySinh && !/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(ngaySinh)) throw new Error('Ngày sinh không đúng dạng ngày/tháng/năm: ' + p[0]);
      if (ngaySinh) {
        const a = ngaySinh.split('/').map(Number), d = new Date(a[2], a[1] - 1, a[0]);
        if (d.getFullYear() !== a[2] || d.getMonth() !== a[1] - 1 || d.getDate() !== a[0]) throw new Error('Ngày sinh không hợp lệ: ' + p[0]);
      }
      list.push({ id: uid_() + list.length, lopId: lopId, hoTen: p[0].slice(0, 80), chucVu: (p[1] || '').slice(0, 40), hienO: (p[2] || '').slice(0, 80), sdt: (p[3] || '').slice(0, 30), ngaySinh: ngaySinh, nu: /^(true|1|yes|x|✓|co|có|nữ|nu)$/i.test(p[5] || '') ? 'TRUE' : 'FALSE', thuTu: String(++order) });
    });
    if (!list.length) throw new Error('Không đọc được dòng nào.');
    appendMany_('HocSinh', list);
    log_(u, 'Nhập ' + list.length + ' học sinh vào lớp ' + find_('Lop', lopId).ten);
    return list.length;
  });
}

/* ======================= HOẠT ĐỘNG ======================= */
const EV_FIELDS = ['id', 'namHoc', 'ngay', 'tieuDe', 'moTa', 'icon'];

function saveEvent(token, e, dataUrl) {
  return lock_(function () {
    const u = auth_(token);
    const o = pick_(e, EV_FIELDS);
    o.tieuDe = req_(o.tieuDe, 'tên hoạt động', 150);
    const ex = o.id ? find_('HoatDong', o.id) : null;
    if (o.id && !ex) throw new Error('Hoạt động không tồn tại.');
    if (u.role !== 'super') {
      // Admin lớp: chỉ đề xuất / sửa đề xuất còn chờ duyệt của lớp mình
      if (ex && (ex.lopDeXuat !== u.lopId || ex.trangThai !== 'pending')) throw new Error('Chỉ sửa được đề xuất đang chờ duyệt của lớp mình.');
      o.trangThai = 'pending';
      o.lopDeXuat = u.lopId;
    } else if (!ex) {
      o.trangThai = 'published';
      o.lopDeXuat = '';
    }
    if (!ex) o.taoLuc = now_();
    if (dataUrl) {
      if (ex && ex.anhId) trashImage_(ex.anhId);
      o.anhId = saveImage_(dataUrl, 'hoatdong_' + uid_() + '.jpg');
    }
    const id = upsert_('HoatDong', o);
    log_(u, (u.role === 'super' ? (ex ? 'Sửa' : 'Thêm') + ' hoạt động ' : 'Đề xuất hoạt động ') + o.tieuDe);
    return id;
  });
}

function setEventStatus(token, id, status) {
  return lock_(function () {
    const u = auth_(token, true);
    if (['published', 'pending', 'hidden'].indexOf(status) < 0) throw new Error('Trạng thái không hợp lệ.');
    const ex = find_('HoatDong', id);
    if (!ex) throw new Error('Hoạt động không tồn tại.');
    ex.trangThai = status;
    update_('HoatDong', ex);
    log_(u, (status === 'published' ? 'Đăng' : 'Ẩn') + ' hoạt động ' + ex.tieuDe);
    return true;
  });
}

function deleteEvent(token, id) {
  return lock_(function () {
    const u = auth_(token);
    const ex = find_('HoatDong', id);
    if (!ex) throw new Error('Hoạt động không tồn tại.');
    if (u.role !== 'super' && (ex.lopDeXuat !== u.lopId || ex.trangThai !== 'pending')) throw new Error('Không có quyền xoá hoạt động này.');
    trashImage_(ex.anhId);
    remove_('HoatDong', function (x) { return x.id === id; });
    log_(u, 'Xoá hoạt động ' + ex.tieuDe);
    return true;
  });
}

/* ======================= THẦY CÔ ======================= */
function saveTeacher(token, t, dataUrl) {
  return lock_(function () {
    const u = auth_(token, true);
    const o = pick_(t, ['id', 'hoTen', 'vaiTro', 'thuTu']);
    o.hoTen = req_(o.hoTen, 'họ tên thầy cô', 80);
    const ex = o.id ? find_('ThayCo', o.id) : null;
    if (dataUrl) {
      if (ex && ex.anhId) trashImage_(ex.anhId);
      let gv = null;
      try { gv = thuMucCon_(folder_(), 'GVCN'); } catch (e) { }
      o.anhId = saveImage_(dataUrl, 'thayco_' + uid_() + '.jpg', gv);
    }
    const id = upsert_('ThayCo', o);
    log_(u, (ex ? 'Sửa' : 'Thêm') + ' thầy cô ' + o.hoTen);
    return id;
  });
}

function deleteTeacher(token, id) {
  return lock_(function () {
    const u = auth_(token, true);
    const ex = find_('ThayCo', id);
    if (!ex) throw new Error('Không tìm thấy.');
    trashImage_(ex.anhId);
    remove_('ThayCo', function (x) { return x.id === id; });
    log_(u, 'Xoá thầy cô ' + ex.hoTen);
    return true;
  });
}

/* ======================= LƯU BÚT ======================= */
function canNote_(u, n) {
  if (u.role === 'super') return;
  if (n.lopId !== u.lopId) throw new Error('Bạn chỉ duyệt được lưu bút của lớp mình.');
}

function moderateNote(token, id, status) {
  return lock_(function () {
    const u = auth_(token);
    if (['approved', 'hidden', 'pending'].indexOf(status) < 0) throw new Error('Trạng thái không hợp lệ.');
    const n = find_('LuuBut', id);
    if (!n) throw new Error('Lưu bút không tồn tại.');
    canNote_(u, n);
    n.trangThai = status;
    update_('LuuBut', n);
    log_(u, (status === 'approved' ? 'Duyệt' : status === 'hidden' ? 'Ẩn' : 'Bỏ duyệt') + ' lưu bút của ' + n.tacGia);
    return true;
  });
}

function deleteNote(token, id) {
  return lock_(function () {
    const u = auth_(token);
    const n = find_('LuuBut', id);
    if (!n) throw new Error('Lưu bút không tồn tại.');
    canNote_(u, n);
    remove_('LuuBut', function (x) { return x.id === id; });
    log_(u, 'Xoá lưu bút của ' + n.tacGia);
    return true;
  });
}

/* ======================= HÌNH ẢNH ======================= */
function uploadPhoto(token, p) {
  const u = auth_(token);
  let lopId = String((p && p.lopId) || '');
  if (u.role !== 'super') lopId = u.lopId;
  if (lopId && !find_('Lop', lopId)) throw new Error('Lớp không tồn tại.');
  const album = req_(p.album, 'tên album', 60);
  let tm = null;
  try { tm = thuMucAnh_(lopId); } catch (e) { }
  const fileId = saveImage_(p.dataUrl, p.name, tm);
  return lock_(function () {
    const id = uid_();
    append_('Anh', { id: id, album: album, lopId: lopId, chuThich: String(p.chuThich || '').slice(0, 200), fileId: fileId, nguoiDang: u.hoTen, taoLuc: now_() });
    log_(u, 'Tải ảnh vào album ' + album + (lopId ? ' (' + find_('Lop', lopId).ten + ')' : ' (chung)'));
    return id;
  });
}

function updatePhoto(token, id, album, chuThich) {
  return lock_(function () {
    const u = auth_(token);
    const a = find_('Anh', id);
    if (!a) throw new Error('Ảnh không tồn tại.');
    canLop_(u, a.lopId);
    a.album = req_(album, 'tên album', 60);
    a.chuThich = String(chuThich || '').slice(0, 200);
    update_('Anh', a);
    return true;
  });
}

function deletePhoto(token, id) {
  return lock_(function () {
    const u = auth_(token);
    const a = find_('Anh', id);
    if (!a) throw new Error('Ảnh không tồn tại.');
    canLop_(u, a.lopId);
    trashImage_(a.fileId);
    remove_('Anh', function (x) { return x.id === id; });
    log_(u, 'Xoá 1 ảnh trong album ' + a.album);
    return true;
  });
}

/* ======================= CẤU HÌNH ======================= */
function saveConfig(token, cfg) {
  return lock_(function () {
    const u = auth_(token, true);
    const rows = read_('CauHinh');
    CONFIG_KEYS.forEach(function (k) {
      if (!cfg || cfg[k] === undefined) return;
      const v = String(cfg[k]).trim().slice(0, /^(thuNgo|giayMoi|keHoach|taiTro)$/.test(k) ? 30000 : 3000);
      if (k === 'anhien' && v !== '0' && v !== '1') throw new Error('anhien chỉ nhận 0 (ẩn) hoặc 1 (hiện).');
      const ex = rows.find(function (r) { return r.key === k; });
      if (ex) { ex.value = v; update_('CauHinh', ex); } else append_('CauHinh', { key: k, value: v });
    });
    log_(u, 'Cập nhật cài đặt chung');
    return true;
  });
}

/* ======================= THỐNG KÊ LƯỢT XEM ======================= */
const LX_THIET_BI = ['iPhone/iPad', 'Android', 'Máy tính'];
const LX_NGUON = ['Zalo', 'Facebook', 'Trình duyệt'];
const LX_LOAI = ['vao', 'trang', 'lop'];

/**
 * Trang gửi lên sau khi đã hiện xong (gộp nhiều lượt vào một lần gọi).
 * Không lưu tên, số điện thoại hay IP: "khach" là mã ngẫu nhiên của trình duyệt.
 */
function ghiLuotXem(khach, thietBi, nguon, ds) {
  khach = String(khach || '');
  if (!/^[a-z0-9]{8,24}$/.test(khach) || !Array.isArray(ds)) return false;
  const c = CacheService.getScriptCache(), k = 'LX_' + Utilities.formatDate(new Date(), TZ, 'HHmm');
  const cnt = Number(c.get(k) || 0);
  if (cnt > 3000) return false;
  c.put(k, String(cnt + 1), 120);
  thietBi = LX_THIET_BI.indexOf(thietBi) >= 0 ? thietBi : 'Máy tính';
  nguon = LX_NGUON.indexOf(nguon) >= 0 ? nguon : 'Trình duyệt';
  const t = now_().slice(0, 16);
  const rows = ds.slice(0, 30).filter(function (e) { return e && LX_LOAI.indexOf(e.loai) >= 0; }).map(function (e) {
    const v = String(e.giaTri || '').slice(0, 40);
    return { id: uid_(), thoiGian: t, khach: khach, moi: e.loai === 'vao' && v === '1' ? '1' : '', thietBi: thietBi, nguon: nguon, loai: e.loai, giaTri: e.loai === 'vao' ? '' : v };
  });
  if (!rows.length) return true;
  const l = LockService.getScriptLock();
  if (!l.tryLock(8000)) return false;
  try { appendMany_('LuotXem', rows); } finally { l.releaseLock(); }
  return true;
}

function getThongKe(token) {
  auth_(token, true);
  const rows = read_('LuotXem');
  const vao = rows.filter(function (r) { return r.loai === 'vao'; });
  const ngay = [], now = new Date();
  for (let i = 29; i >= 0; i--) ngay.push(Utilities.formatDate(new Date(now.getTime() - i * 86400000), TZ, 'yyyy-MM-dd'));
  const homNay = ngay[29], tu7 = ngay[23];
  const theoNgay = {}, nguoiNgay = {};
  ngay.forEach(function (d) { theoNgay[d] = 0; nguoiNgay[d] = {}; });
  const gio = [], tb = {}, ng = {}, khach = {}, khach7 = {}, ngayCuaKhach = {};
  for (let h = 0; h < 24; h++) gio.push(0);
  vao.forEach(function (r) {
    const d = r.thoiGian.slice(0, 10), h = Number(r.thoiGian.slice(11, 13));
    if (theoNgay[d] !== undefined) { theoNgay[d]++; nguoiNgay[d][r.khach] = 1; }
    if (h >= 0 && h < 24) gio[h]++;
    tb[r.thietBi] = (tb[r.thietBi] || 0) + 1;
    ng[r.nguon] = (ng[r.nguon] || 0) + 1;
    khach[r.khach] = 1;
    if (d >= tu7) khach7[r.khach] = 1;
    (ngayCuaKhach[r.khach] = ngayCuaKhach[r.khach] || {})[d] = 1;
  });
  const dem = function (loai) {
    const m = {};
    rows.forEach(function (r) { if (r.loai === loai && r.giaTri) m[r.giaTri] = (m[r.giaTri] || 0) + 1; });
    return Object.keys(m).map(function (k) { return [k, m[k]]; }).sort(function (a, b) { return b[1] - a[1]; });
  };
  const dk = read_('DangKy').filter(function (d) { return d.trangThai !== 'huy'; }).length;
  return {
    batDau: vao.reduce(function (m, r) { return !m || r.thoiGian < m ? r.thoiGian : m; }, ''),
    tong: vao.length,
    homNay: theoNgay[homNay],
    bayNgay: ngay.slice(23).reduce(function (s, d) { return s + theoNgay[d]; }, 0),
    nguoi: Object.keys(khach).length,
    nguoi7: Object.keys(khach7).length,
    quayLai: Object.keys(ngayCuaKhach).filter(function (k) { return Object.keys(ngayCuaKhach[k]).length > 1; }).length,
    ngay: ngay.map(function (d) { return [d, theoNgay[d], Object.keys(nguoiNgay[d]).length]; }),
    gio: gio,
    thietBi: tb,
    nguon: ng,
    trang: dem('trang'),
    lop: dem('lop').slice(0, 12),
    dangKy: dk
  };
}

/* ======================= KẾT NỐI: TIN TỨC ======================= */
function sortNews_(arr) {
  return arr.slice().sort(function (a, b) {
    return (Number(b.noiBat) || 0) - (Number(a.noiBat) || 0) || String(b.taoLuc).localeCompare(String(a.taoLuc));
  });
}

function saveNews(token, t) {
  return lock_(function () {
    const u = auth_(token, true);
    const o = pick_(t, ['id', 'loai', 'tieuDe', 'noiDung', 'ngay', 'noiBat', 'trangThai']);
    o.tieuDe = req_(o.tieuDe, 'tiêu đề tin', 150);
    o.noiDung = String(o.noiDung || '').slice(0, 3000);
    o.loai = String(o.loai || 'Thông báo').slice(0, 30);
    o.noiBat = o.noiBat === '1' ? '1' : '0';
    if (['published', 'hidden'].indexOf(o.trangThai) < 0) o.trangThai = 'published';
    const ex = o.id ? find_('TinTuc', o.id) : null;
    if (o.id && !ex) throw new Error('Tin không tồn tại.');
    if (!ex) o.taoLuc = now_();
    if (o.noiBat === '1') {
      read_('TinTuc').forEach(function (x) { if (x.noiBat === '1' && x.id !== o.id) { x.noiBat = '0'; update_('TinTuc', x); } });
    }
    const id = upsert_('TinTuc', o);
    log_(u, (ex ? 'Sửa' : 'Đăng') + ' tin "' + o.tieuDe + '"');
    return id;
  });
}

function deleteNews(token, id) {
  return lock_(function () {
    const u = auth_(token, true);
    const ex = find_('TinTuc', id);
    if (!ex) throw new Error('Tin không tồn tại.');
    remove_('TinTuc', function (x) { return x.id === id; });
    log_(u, 'Xoá tin "' + ex.tieuDe + '"');
    return true;
  });
}

/* ======================= KẾT NỐI: ĐĂNG KÝ HỌP LỚP ======================= */
function submitRegistration(hoTen, lopId, lienHe, ghiChu) {
  const cache = CacheService.getScriptCache();
  const cnt = Number(cache.get('REG_RATE') || 0);
  if (cnt > 30) throw new Error('Hệ thống đang bận, vui lòng thử lại sau ít phút.');
  cache.put('REG_RATE', String(cnt + 1), 60);
  hoTen = req_(hoTen, 'họ tên', 60);
  lienHe = req_(lienHe, 'số điện thoại hoặc Zalo', 60);
  lopId = String(lopId || '');
  if (!find_('Lop', lopId)) throw new Error('Vui lòng chọn lớp.');
  return lock_(function () {
    const dup = read_('DangKy').find(function (d) {
      return d.lopId === lopId && d.hoTen.toLowerCase() === hoTen.toLowerCase() && d.trangThai !== 'huy';
    });
    if (dup) throw new Error('Bạn ' + hoTen + ' của lớp này đã đăng ký rồi.');
    append_('DangKy', { id: uid_(), lopId: lopId, hoTen: hoTen, lienHe: lienHe, ghiChu: String(ghiChu || '').slice(0, 300), trangThai: 'cho', taoLuc: now_() });
    return true;
  });
}

function setRegistrationStatus(token, id, status) {
  return lock_(function () {
    const u = auth_(token);
    if (['cho', 'xacnhan', 'huy'].indexOf(status) < 0) throw new Error('Trạng thái không hợp lệ.');
    const d = find_('DangKy', id);
    if (!d) throw new Error('Đăng ký không tồn tại.');
    canLop_(u, d.lopId);
    d.trangThai = status;
    update_('DangKy', d);
    log_(u, (status === 'xacnhan' ? 'Xác nhận' : status === 'huy' ? 'Huỷ' : 'Đặt lại') + ' đăng ký của ' + d.hoTen);
    return true;
  });
}

function deleteRegistration(token, id) {
  return lock_(function () {
    const u = auth_(token);
    const d = find_('DangKy', id);
    if (!d) throw new Error('Đăng ký không tồn tại.');
    canLop_(u, d.lopId);
    remove_('DangKy', function (x) { return x.id === id; });
    log_(u, 'Xoá đăng ký của ' + d.hoTen);
    return true;
  });
}

/* ======================= TÌM BẠN CŨ ======================= */
/* Ai cũng gửi được lời nhờ tìm bạn (nút nhấp nháy ở góc màn hình). Hiện ngay trên "Bảng tìm bạn";
   liên hệ người gửi + phản hồi "Tôi biết bạn này" chỉ Ban liên lạc / admin lớp liên quan thấy. */
function submitTimBan(nguoiTim, lopNguoiTim, lienHe, timAi, lopCanTim, manhMoi) {
  const cache = CacheService.getScriptCache();
  const cnt = Number(cache.get('TB_RATE') || 0);
  if (cnt > 20) throw new Error('Hệ thống đang bận, vui lòng thử lại sau ít phút.');
  cache.put('TB_RATE', String(cnt + 1), 60);
  nguoiTim = req_(nguoiTim, 'tên của bạn', 60);
  lienHe = req_(lienHe, 'số điện thoại hoặc Zalo của bạn', 60);
  timAi = req_(timAi, 'tên người bạn muốn tìm', 80);
  manhMoi = String(manhMoi || '').trim().slice(0, 600);
  lopNguoiTim = String(lopNguoiTim || ''); lopCanTim = String(lopCanTim || '');
  if (lopNguoiTim && !find_('Lop', lopNguoiTim)) throw new Error('Lớp không tồn tại.');
  if (lopCanTim && !find_('Lop', lopCanTim)) throw new Error('Lớp không tồn tại.');
  return lock_(function () {
    const dup = read_('TimBan').find(function (x) { return x.trangThai === 'dangtim' && x.timAi.toLowerCase() === timAi.toLowerCase() && x.nguoiTim.toLowerCase() === nguoiTim.toLowerCase(); });
    if (dup) throw new Error('Bạn đã gửi lời tìm ' + dup.timAi + ' rồi, Ban liên lạc đang hỗ trợ.');
    const o = { id: uid_(), nguoiTim: nguoiTim, lopNguoiTim: lopNguoiTim, lienHe: lienHe, timAi: timAi, lopCanTim: lopCanTim, manhMoi: manhMoi, trangThai: 'dangtim', phanHoi: '', taoLuc: now_(), ghiChu: '' };
    append_('TimBan', o);
    return pubOf_('TimBan')(o);
  });
}

/** "Tôi biết bạn này": ghi nối vào cột phanHoi (chỉ admin xem) để Ban liên lạc nối hai người. */
function phanHoiTimBan(id, ten, lienHe, loi) {
  const cache = CacheService.getScriptCache();
  const cnt = Number(cache.get('TB_RATE') || 0);
  if (cnt > 20) throw new Error('Hệ thống đang bận, vui lòng thử lại sau ít phút.');
  cache.put('TB_RATE', String(cnt + 1), 60);
  ten = req_(ten, 'tên của bạn', 60);
  lienHe = String(lienHe || '').trim().slice(0, 60);
  loi = req_(loi, 'điều bạn biết', 400);
  return lock_(function () {
    const x = find_('TimBan', id);
    if (!x || (x.trangThai !== 'dangtim' && x.trangThai !== 'datim')) throw new Error('Lời tìm bạn không còn.');
    const dong = '[' + now_() + '] ' + ten + (lienHe ? ' (' + lienHe + ')' : '') + ': ' + loi.replace(/\s+/g, ' ');
    x.phanHoi = (x.phanHoi ? x.phanHoi + '\n' : '') + dong;
    if (x.phanHoi.length > 4000) x.phanHoi = x.phanHoi.slice(-4000);
    update_('TimBan', x);
    return true;
  });
}

function canTimBan_(u, x) {
  if (u.role !== 'super' && x.lopCanTim !== u.lopId && x.lopNguoiTim !== u.lopId) throw new Error('Bạn chỉ được quản lý lời tìm bạn liên quan đến lớp mình.');
}
function setTimBanStatus(token, id, status, ghiChu) {
  return lock_(function () {
    const u = auth_(token);
    if (['dangtim', 'datim', 'an'].indexOf(status) < 0) throw new Error('Trạng thái không hợp lệ.');
    const x = find_('TimBan', id);
    if (!x) throw new Error('Lời tìm bạn không tồn tại.');
    canTimBan_(u, x);
    x.trangThai = status;
    if (ghiChu !== undefined) x.ghiChu = String(ghiChu || '').slice(0, 500);
    update_('TimBan', x);
    log_(u, (status === 'datim' ? 'Đã tìm thấy: ' : status === 'an' ? 'Ẩn lời tìm ' : 'Hiện lại lời tìm ') + x.timAi);
    return true;
  });
}
function deleteTimBan(token, id) {
  return lock_(function () {
    const u = auth_(token);
    const x = find_('TimBan', id);
    if (!x) throw new Error('Lời tìm bạn không tồn tại.');
    canTimBan_(u, x);
    remove_('TimBan', function (r) { return r.id === id; });
    log_(u, 'Xoá lời tìm ' + x.timAi);
    return true;
  });
}

/* ======================= LIÊN HỆ CỦA ADMIN ======================= */
/** Số điện thoại / Zalo hiện trong danh bạ admin ở trang Kết nối (để trống thì ẩn). */
function updateMyContact(token, lienHe) {
  return lock_(function () {
    const u = auth_(token);
    const a = find_('TaiKhoan', u.user);
    a.lienHe = String(lienHe || '').trim().slice(0, 60);
    update_('TaiKhoan', a);
    log_(u, 'Cập nhật liên hệ');
    return true;
  });
}

/**
 * ============================================================
 *  DỮ LIỆU MẪU – nạp / xoá nội dung mẫu (tự nạp khi Sheet còn trống)
 * ============================================================
 */
/* ======================= DỮ LIỆU MẪU ======================= */
/**
 * Nạp dữ liệu mẫu giống bản demo. Mọi dòng mẫu có id bắt đầu bằng "mau_"
 * để có thể xoá sạch bằng xoaDuLieuMau(). Chạy từ trình soạn thảo,
 * hoặc từ Quản trị → Cài đặt (tài khoản Ban liên lạc).
 */
/** Nội dung mẫu dùng chung cho nạp và xoá (để nhận ra đâu là dữ liệu mẫu). */
const MAU_GV = ['Cô Nguyễn Thị Hoa', 'Thầy Trần Văn Lộc', 'Cô Lê Thị Mỹ', 'Thầy Phạm Quốc Hùng', 'Cô Võ Thị Lan', 'Thầy Đỗ Minh Tâm', 'Cô Huỳnh Thu Hà', 'Thầy Bùi Văn Sơn', 'Cô Phan Thị Nga', 'Thầy Ngô Đức Trí', 'Cô Đặng Mỹ Linh', 'Thầy Lê Văn Đức'];
const MAU_GT = [
  'Lớp ngồi tầng hai dãy nhà A, cửa sổ nhìn thẳng ra gốc phượng. Giờ ra chơi cả lớp đứng hành lang thả máy bay giấy xuống sân, bị thầy giám thị gọi tên hoài.',
  'Đội văn nghệ của lớp tập “Áo trắng” dưới mưa suốt một tuần, rồi giành giải nhất đêm 20/11. Cái áo dài ướt sũng hôm đó, có bạn vẫn còn giữ.',
  'Lớp nhiều “mọt sách” nhất khối, nhưng cũng là lớp trốn tiết ra căng tin bị bắt nhiều nhất. Thầy chủ nhiệm giận mà vẫn mua bánh mì cho cả lớp.',
  'Đội bóng đá nam vô địch Hội khoẻ Phù Đổng. Trận chung kết cả lớp khản cổ cổ vũ, cô chủ nhiệm cũng hét theo, quên cả giữ dáng.',
  'Trại của lớp dựng bằng tre và lá dừa, đẹp nhất hội trại 26/3. Đêm đó cả lớp thức trắng kể chuyện ma, sáng ra ai cũng thâm quầng mắt.',
  'Lớp của những tờ báo tường giải nhất. Bài thơ “Gửi mái trường” của lớp, đến giờ thầy cô vẫn còn nhắc.',
  'Lớp có nhiều bạn đi xa nhất: Úc, Mỹ, Nhật, Đức. Mỗi lần họp lớp là một lần gọi video vòng quanh thế giới, lệch múi giờ mà vẫn đủ mặt.',
  'Nổi tiếng với chiếc trống tự chế từ thùng sơn và những buổi sinh hoạt lớp cuối tuần chẳng bao giờ về đúng giờ.',
  'Đội Rung chuông vàng vào tới chung kết. Câu hỏi cuối cùng, cả sân trường nín thở nhìn lớp trưởng giơ tấm bảng lên.',
  'Lớp ồn nhất dãy nhà B nhưng thương nhau nhất: có bạn ốm là cả lớp kéo tới nhà, mang theo tập vở chép bài hộ.',
  'Lớp có ban nhạc “Phượng Hồng”, chơi guitar ở mọi đêm lửa trại. Bài tủ là “Mong ước kỷ niệm xưa”, hát tới đâu khóc tới đó.',
  'Lớp út của khoá, ngồi cuối dãy, gần căng tin nhất. Lời hứa “mười năm nữa gặp lại” của lớp đã giữ được hai lần rồi.'
];
const MAU_TC = ['Thầy Nguyễn Văn Thành', 'Cô Trần Thị Thu', 'Thầy Lê Quang Vinh', 'Cô Hồ Thị Minh', 'Thầy Trương Công Bình'];
/** Lời giới thiệu lớp do bản mẫu cũ tạo ra: "Lớp 12/1 học dãy nhà A, nhớ nhất …" */
const MAU_GT_CU = /^Lớp \S+ học dãy nhà [AB], nhớ nhất /;

function napDuLieuMau() {
  if (!Session.getActiveUser().getEmail()) throw new Error('Chỉ chạy được từ trình soạn thảo Apps Script.');
  return lock_(napDuLieuMau_);
}
function xoaDuLieuMau() {
  if (!Session.getActiveUser().getEmail()) throw new Error('Chỉ chạy được từ trình soạn thảo Apps Script.');
  return lock_(xoaDuLieuMau_);
}
function seedDemo(token) { return lock_(function () { const u = auth_(token, true); const r = napDuLieuMau_(); log_(u, 'Nạp dữ liệu mẫu'); return r; }); }
function clearDemo(token) { return lock_(function () { const u = auth_(token, true); const r = xoaDuLieuMau_(); log_(u, 'Xoá dữ liệu mẫu'); return r; }); }

function napDuLieuMau_() {
  if (read_('HocSinh').some(function (h) { return h.id.indexOf('mau_') === 0; })) throw new Error('Đã có dữ liệu mẫu. Hãy xoá dữ liệu mẫu trước khi nạp lại.');
  const lops = sort_(read_('Lop'));
  if (!lops.length) throw new Error('Chưa có lớp nào. Hãy chạy setup() trước.');
  const t = now_();
  let n = 0;
  const id = function (p) { return 'mau_' + p + '_' + (++n); };

  const GV = MAU_GV;
  const BAN = ['Ban A', 'Ban A', 'Ban A', 'Ban B', 'Ban B', 'Ban B', 'Ban C', 'Ban C', 'Ban C', 'Ban D', 'Ban D', 'Ban D'];
  const GT = MAU_GT;
  lops.forEach(function (l, i) {
    if (!l.gvcn) l.gvcn = GV[i % GV.length];
    if (!l.ban) l.ban = BAN[i % BAN.length];
    if (!l.gioiThieu) l.gioiThieu = GT[i % GT.length];
    update_('Lop', l);
  });

  const HO = ['Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Võ', 'Đặng', 'Bùi', 'Đỗ', 'Huỳnh', 'Phan', 'Ngô', 'Trương', 'Dương', 'Hồ', 'Lương'];
  const DEM_NAM = ['Văn', 'Minh', 'Quốc', 'Hữu', 'Đức', 'Thanh', 'Hoàng', 'Công', 'Ngọc', 'Gia'];
  const DEM_NU = ['Thị', 'Ngọc', 'Thu', 'Mỹ', 'Kim', 'Thanh', 'Bảo', 'Hoài', 'Phương', 'Diệu'];
  const TEN_NAM = ['An', 'Bình', 'Dũng', 'Hải', 'Hùng', 'Khoa', 'Long', 'Nam', 'Phúc', 'Quang', 'Tâm', 'Tuấn', 'Đạt', 'Huy', 'Khánh', 'Lộc', 'Nhân', 'Sơn', 'Thắng', 'Vinh', 'Trí', 'Hiếu', 'Bảo', 'Toàn'];
  const TEN_NU = ['Hà', 'Hằng', 'Lan', 'Linh', 'Mai', 'Nhi', 'Thảo', 'Trang', 'Vy', 'Yến', 'Hương', 'Ngân', 'Phương', 'Quyên', 'Diễm', 'Uyên', 'Hạnh', 'Thư', 'Châu', 'Nga', 'Loan', 'Trâm', 'Duyên', 'Thủy'];
  const CITY = ['Đà Nẵng', 'Đà Nẵng', 'Đà Nẵng', 'Đà Nẵng', 'TP.HCM', 'TP.HCM', 'Hà Nội', 'Hội An', 'Tam Kỳ', 'Huế', 'Nha Trang', 'Úc', 'Mỹ', 'Nhật Bản', 'Đức', 'Canada', 'Singapore', 'Hàn Quốc'];
  const CV = ['Lớp trưởng', 'Bí thư', 'Lớp phó học tập', 'Lớp phó văn nghệ', 'Lớp phó lao động', 'Thủ quỹ'];
  const hs = [];
  lops.forEach(function (l, i) {
    const cnt = 40 + (i * 5) % 9, seen = {};
    for (let k = 0; k < cnt; k++) {
      const nu = (k * 7 + i * 3) % 5 < 2 || k === 1 || k === 3;
      let ten, tries = 0;
      do {
        const r = k * 13 + i * 7 + tries * 5;
        ten = HO[(r + k) % HO.length] + ' ' + (nu ? DEM_NU : DEM_NAM)[(r * 3 + tries) % 10] + ' ' + (nu ? TEN_NU : TEN_NAM)[(r * 7 + i) % 24];
        tries++;
      } while (seen[ten] && tries < 20);
      seen[ten] = 1;
      hs.push({ id: id('hs'), lopId: l.id, hoTen: ten, chucVu: CV[k] || '', hienO: CITY[(k * 5 + i * 3) % CITY.length], thuTu: String(k + 1) });
    }
  });
  appendMany_('HocSinh', hs);

  const EV = [
    ['2000–2001', '05/09/2000', 'Ngày khai giảng đầu tiên', 'Lần đầu bước qua cổng trường Nguyễn Hiền trong tà áo trắng còn thơm mùi vải mới. Ai cũng lạ, ai cũng rụt rè, chẳng ai ngờ ba năm sau lại khóc vì phải rời nơi này.', '🎒'],
    ['2000–2001', '20/11/2000', 'Đêm văn nghệ 20/11', 'Lần đầu khối 10 lên sân khấu trường. Tiết mục múa “Áo trắng” giành giải nhất, cả hội trường vỗ tay mãi không dứt.', '🎤'],
    ['2000–2001', '26/03/2001', 'Hội trại 26/3', 'Hai ngày một đêm dựng trại bằng tre, lá dừa. Đêm lửa trại, cả khối nắm tay thành vòng tròn, hát tới khàn giọng.', '⛺'],
    ['2001–2002', '12/2001', 'Hội khoẻ Phù Đổng', 'Bóng đá nam, bóng chuyền nữ, kéo co giữa các lớp khối 11. Thắng thua giờ chẳng ai nhớ, chỉ nhớ những chai nước chuyền tay giữa sân nắng.', '⚽'],
    ['2001–2002', '04/2002', 'Dã ngoại về nguồn', 'Chuyến xe sớm về Mỹ Sơn, cả lớp hát suốt dọc đường. Lần đầu tiên tụi mình đi xa cùng nhau.', '🚌'],
    ['2002–2003', '09/01/2003', 'Rung chuông vàng', 'Ngày Học sinh – Sinh viên, mười hai lớp thi báo tường và rung chuông vàng. Cả sân trường hồi hộp theo từng câu hỏi.', '🔔'],
    ['2002–2003', '03/2003', 'Trăm ngày trước kỳ thi', 'Lễ thắp nến “100 ngày” dưới sân trường. Ai cũng ước một điều, nhiều người ước được ở lại thêm một chút.', '🕯️'],
    ['2002–2003', '05/2003', 'Lễ tri ân và chia tay', 'Đêm cuối dưới mái trường. Cả khoá hát “Mong ước kỷ niệm xưa”, trao nhau lưu bút, ôm thầy cô thật lâu.', '🌺'],
    ['Sau ra trường', '08/2013', 'Họp lớp 10 năm', 'Cả khoá về thăm trường, gặp lại thầy cô chủ nhiệm. Có bạn đã bế con theo, đứng chụp ảnh đúng chỗ ngồi ngày xưa.', '🥂'],
    ['Sau ra trường', '07/2023', 'Họp lớp 20 năm', 'Họp mặt ở biển Mỹ Khê, hơn 300 bạn về dự. Có một phút lặng để nhớ những người bạn, người thầy không thể về nữa.', '🎉']
  ];
  appendMany_('HoatDong', EV.map(function (e) { return { id: id('hd'), namHoc: e[0], ngay: e[1], tieuDe: e[2], moTa: e[3], icon: e[4], anhId: '', trangThai: 'published', lopDeXuat: '', taoLuc: t }; }));

  const TC = [[MAU_TC[0], 'Hiệu trưởng'], [MAU_TC[1], 'Phó hiệu trưởng'], [MAU_TC[2], 'Bí thư Đoàn trường'], [MAU_TC[3], 'Tổ trưởng Ngữ văn'], [MAU_TC[4], 'Giám thị, người gác cổng trường']];
  lops.forEach(function (l, i) { TC.push([l.gvcn || GV[i % GV.length], 'Chủ nhiệm ' + l.ten]); });
  const seen = {};
  appendMany_('ThayCo', TC.filter(function (x) { if (seen[x[0]]) return false; seen[x[0]] = 1; return true; })
    .map(function (x, i) { return { id: id('tc'), hoTen: x[0], vaiTro: x[1], anhId: '', thuTu: String(i + 1) }; }));

  const L = function (i) { return lops[i % lops.length].id; };
  /* hiển thị từ dưới lên (mới nhất trước) */
  const LB = [
    ['Thảo', -1, 'Hẹn cả khoá ngày 20/11 năm nay, nhớ về đông đủ nha. Đừng để ghế nào trống.'],
    ['Dũng', -1, 'Có những người bạn đã đi xa mãi, không về họp lớp được nữa. Mỗi lần nhắc tên, cả bọn lại im lặng một lúc. Thương lắm.'],
    ['Phúc', -1, 'Ba năm Nguyễn Hiền là ba năm đẹp nhất. Cảm ơn tất cả, kể cả những lần bị phạt đứng ngoài hành lang.'],
    ['Yến', 9, 'Nhớ ổ bánh mì ở cổng trường, hai ngàn một ổ. Nhớ cái nắng tháng Năm chiếu qua cửa lớp. Nhớ tụi bây nhiều lắm.'],
    ['Nam', 7, 'Tiếng trống trường là âm thanh mình nhớ nhất. Sáng nào đi ngang trường cũ, mình vẫn chậm xe lại một chút.'],
    ['Quang', 11, 'Gửi mình năm 18 tuổi: đừng sợ thi trượt. Đáng sợ hơn là không kịp nói cảm ơn mẹ, cảm ơn thầy cô. Nói sớm đi nhé.'],
    ['Khoa', 8, 'Gửi bạn ngồi bàn trên năm lớp 11: mình là đứa hay giật tóc bạn đó. Xin lỗi nha. Thật ra hồi đó mình chỉ muốn bạn quay xuống nói chuyện.'],
    ['Mai', 10, 'Nhớ buổi tập văn nghệ dưới mưa trước ngày 20/11. Áo ướt hết mà cả bọn vẫn cười. Giờ chẳng còn ai rủ mình tắm mưa nữa.'],
    ['Vy', 5, 'Năm đó mình chưa kịp đưa lưu bút cho bạn ký thì bạn chuyển vào Sài Gòn. Cuốn sổ vẫn còn, trang của bạn vẫn để trống. Về họp lớp, ký giùm mình nha.'],
    ['Tuấn', 2, 'Đứa nào mượn Kính Vạn Hoa tập 23 của tui thì trả nha. Không cần trả sách, về họp lớp là được.'],
    ['Hằng', 3, 'Thầy ơi, thầy dạy em phương trình, nhưng điều em nhớ nhất là câu thầy nói hôm chia tay: “Sống tử tế, rồi mọi thứ sẽ ổn.” Em vẫn nhớ, thầy ạ.'],
    ['Linh', 6, 'Lớp mình còn nợ nhau một chuyến đi Hội An. Hứa từ năm lớp 12, giờ con tụi mình cũng sắp bằng tuổi mình hồi đó rồi.'],
    ['Nhi', 2, 'Mẩu giấy gấp tư năm lớp 12 mình không dám đưa, giờ vẫn kẹp trong cuốn Văn học 12. Người ấy hạnh phúc rồi, mình cũng vậy. Chỉ là nhớ cái cảm giác tim đập thình thịch hồi đó.'],
    ['Long', 0, 'Gốc phượng sân sau giờ còn không ta? Ai về trường chụp giùm một tấm nha.'],
    ['Trang', 4, 'Cô ơi, năm đó con nghỉ học mấy tuần vì nhà khó khăn, cô đạp xe tới tận nhà xin cho con đi học lại. Giờ con cũng làm cô giáo. Con cảm ơn cô, muộn hơn hai mươi năm.'],
    ['Hải', 1, 'Mày nhớ không, bàn cuối dãy cửa sổ, tụi mình khắc tên lên mặt bàn rồi bị thầy giám thị bắt. Chỗ khắc đó chắc bị sơn lại lâu rồi, nhưng tên mày thì vẫn còn trong tao.']
  ];
  appendMany_('LuuBut', LB.map(function (x) { return { id: id('lb'), lopId: x[1] < 0 ? '' : L(x[1]), tacGia: x[0], noiDung: x[2], trangThai: 'approved', taoLuc: t }; }));

  const TT = [
    ['Họp lớp', 'Về trường mình, thêm một lần nữa: họp lớp toàn khoá dịp 20/11', 'Ban liên lạc đã chốt: buổi sáng cả khoá về thăm trường 61 Phan Đăng Lưu, chụp ảnh dưới gốc phượng, thắp nén hương nhớ thầy cô và bạn bè đã khuất. Buổi chiều họp mặt ở biển Mỹ Khê. Mời thầy cô chủ nhiệm cả 12 lớp. Hãy về, dù chỉ một buổi.', '20/11/2026', '1'],
    ['Tri ân', 'Cùng đi thăm thầy cô đã nghỉ hưu', 'Nhiều thầy cô của khoá mình đã nghỉ hưu, có thầy cô sức khoẻ đã yếu. Ban liên lạc lập danh sách để các lớp chia nhau đến thăm trước ngày 20/11. Một bó hoa, một cái nắm tay, với thầy cô là đủ.', '', '0'],
    ['Tìm người', 'Lớp 12/9 tìm bạn Phúc', 'Phúc ngồi bàn ba dãy giữa, chuyển vào Sài Gòn năm 2004 rồi mất liên lạc. Ai còn số điện thoại hay Facebook của Phúc, báo admin lớp 12/9 giúp. Cả lớp vẫn chờ.', '', '0'],
    ['Thông báo', 'Gửi ảnh cũ để làm cuốn kỷ yếu 23 năm', 'Ai còn ảnh lớp, ảnh hội trại, trang lưu bút… chụp lại gửi admin lớp. Ban liên lạc sẽ in thành cuốn kỷ yếu tặng mỗi bạn trong buổi họp lớp.', '', '0'],
    ['Thông báo', 'Cập nhật “Giờ đang ở”', 'Nhờ mọi người báo nơi đang sống để vẽ bản đồ bạn bè khắp nơi. Biết đâu bạn cũ đang ở ngay thành phố của mình.', '', '0']
  ];
  appendMany_('TinTuc', TT.map(function (x) { return { id: id('tt'), loai: x[0], tieuDe: x[1], noiDung: x[2], ngay: x[3], noiBat: x[4], trangThai: 'published', taoLuc: t }; }));

  const ANH = [['Hội trại 26/3', 'Đêm lửa trại'], ['Đêm văn nghệ 20/11', 'Tập văn nghệ dưới mưa'], ['Hội khoẻ Phù Đổng', 'Trận chung kết bóng đá'], ['Ảnh tập thể', 'Cả lớp dưới gốc phượng'], ['Họp lớp 20 năm', 'Gặp lại ở Mỹ Khê'], ['Trăm ngày trước kỳ thi', 'Thắp nến trăm ngày'], ['Lễ tri ân và chia tay', 'Ôm thầy cô ngày chia tay'], ['Ngày khai giảng đầu tiên', 'Áo trắng ngày đầu'], ['Giao lưu', 'Giao lưu hai lớp']];
  const anh = [];
  for (let i = 0; i < 27; i++) {
    const a = ANH[i % ANH.length];
    anh.push({ id: id('anh'), album: a[0], lopId: L(i), chuThich: a[1], fileId: '', nguoiDang: 'Dữ liệu mẫu', taoLuc: t });
  }
  for (let i = 0; i < 6; i++) {
    anh.push({ id: id('anh'), album: 'Ngày ấy', lopId: L(i), chuThich: 'Ảnh lớp, tháng Năm 2003', fileId: '', nguoiDang: 'Dữ liệu mẫu', taoLuc: t });
    anh.push({ id: id('anh'), album: 'Bây giờ', lopId: L(i), chuThich: 'Gặp lại sau hai mươi năm', fileId: '', nguoiDang: 'Dữ liệu mẫu', taoLuc: t });
  }
  appendMany_('Anh', anh);

  const GC = ['Đi cùng gia đình', '', 'Bay từ Úc về', '', 'Sẽ mang theo cuốn lưu bút cũ', 'Muốn gặp lại cô chủ nhiệm', '', 'Đến muộn một chút'];
  const dk = [];
  for (let i = 0; i < 24; i++) {
    const h = hs[(i * 37) % hs.length];
    dk.push({ id: id('dk'), lopId: h.lopId, hoTen: h.hoTen, lienHe: '0900 000 ' + String(100 + i), ghiChu: GC[i % GC.length], trangThai: i % 3 === 0 ? 'xacnhan' : 'cho', taoLuc: t });
  }
  appendMany_('DangKy', dk);

  return 'Đã nạp: ' + hs.length + ' học sinh, ' + EV.length + ' hoạt động, ' + LB.length + ' lưu bút, ' + anh.length + ' ảnh minh hoạ, ' + TT.length + ' tin, ' + dk.length + ' đăng ký.';
}

function xoaDuLieuMau_() {
  let total = 0, giu = 0;
  const tenMau = MAU_TC.concat(MAU_GV);
  ['HocSinh', 'HoatDong', 'ThayCo', 'LuuBut', 'TinTuc', 'Anh', 'DangKy'].forEach(function (s) {
    const all = read_(s);
    const keep = all.filter(function (x) {
      if (String(x.id).indexOf('mau_') !== 0) return true;
      // Thầy cô mẫu mà bạn đã sửa tên → giữ lại thành dữ liệu thật
      if (s === 'ThayCo' && tenMau.indexOf(x.hoTen) < 0) { x.id = uid_() + (++giu); return true; }
      return false;
    });
    if (keep.length === all.length && !giu) return;
    total += all.length - keep.length;
    const sh = sh_(s), w = hdr_(s).length;
    if (sh.getLastRow() > 1) sh.getRange(2, 1, sh.getLastRow() - 1, w).clearContent();
    if (keep.length) sh.getRange(2, 1, keep.length, w).setNumberFormat('@').setValues(keep.map(function (o) { return rowOf_(s, o); }));
    delete _cache[s];
    pubBust_(s);
  });
  // Lớp: bỏ lời giới thiệu và tên chủ nhiệm do bản mẫu điền, giữ phần bạn đã tự sửa
  let lop = 0;
  read_('Lop').forEach(function (l) {
    let doi = false;
    if (l.gioiThieu && (MAU_GT.indexOf(l.gioiThieu) >= 0 || MAU_GT_CU.test(l.gioiThieu))) { l.gioiThieu = ''; doi = true; }
    if (l.gvcn && MAU_GV.indexOf(l.gvcn) >= 0) { l.gvcn = ''; doi = true; }
    if (doi) { update_('Lop', l); lop++; }
  });
  PROP.setProperty('DEMO_AUTO', '1');
  return 'Đã xoá ' + total + ' dòng dữ liệu mẫu' + (lop ? ', dọn lời giới thiệu mẫu của ' + lop + ' lớp' : '') +
    (giu ? '. Giữ lại ' + giu + ' dòng thầy cô bạn đã sửa' : '') + '. Dữ liệu bạn tự nhập không bị ảnh hưởng.';
}
