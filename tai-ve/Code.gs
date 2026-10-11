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
  HocSinh:  ['id', 'lopId', 'hoTen', 'chucVu', 'hienO', 'thuTu'],
  HoatDong: ['id', 'namHoc', 'ngay', 'tieuDe', 'moTa', 'icon', 'anhId', 'trangThai', 'lopDeXuat', 'taoLuc'],
  ThayCo:   ['id', 'hoTen', 'vaiTro', 'anhId', 'thuTu'],
  LuuBut:   ['id', 'lopId', 'tacGia', 'noiDung', 'trangThai', 'taoLuc'],
  Anh:      ['id', 'album', 'lopId', 'chuThich', 'fileId', 'nguoiDang', 'taoLuc'],
  TaiKhoan: ['user', 'hoTen', 'role', 'lopId', 'salt', 'hash', 'active', 'lienHe'],
  TinTuc:   ['id', 'loai', 'tieuDe', 'noiDung', 'ngay', 'noiBat', 'trangThai', 'taoLuc'],
  DangKy:   ['id', 'lopId', 'hoTen', 'lienHe', 'ghiChu', 'trangThai', 'taoLuc'],
  NhatKy:   ['time', 'user', 'action'],
  CauHinh:  ['key', 'value']
};

const CONFIG_KEYS = ['tenTruong', 'nienKhoa', 'namRaTruong', 'diaChi', 'cauMoDau', 'loiNgo', 'nguoiKy', 'trichDan', 'trichDanTacGia'];
const CONFIG_DEFAULT = {
  tenTruong: 'THPT Nguyễn Hiền',
  nienKhoa: '2000 – 2003',
  namRaTruong: '2003',
  diaChi: '61 Phan Đăng Lưu, Hòa Cường Nam, Hải Châu, Đà Nẵng',
  cauMoDau: 'Mùa phượng năm ấy, mình rời trường.',
  trichDan: 'Gốc phượng sân sau giờ còn không ta? Ai về trường chụp giùm một tấm nha.',
  trichDanTacGia: 'Lưu bút của một bạn khoá 2000 – 2003',
  loiNgo: 'Ba năm áo trắng trôi qua như một cái chớp mắt. Hơn hai mươi năm sau, chúng ta mỗi người một ngả, nhưng tiếng trống trường, gốc phượng sân sau và những trang lưu bút vẫn còn đó. Trang này là để mình tìm lại nhau.',
  nguoiKy: 'Ban liên lạc khoá 2000 – 2003'
};

/** Thư mục Drive gốc – mọi dữ liệu (Sheet + ảnh) đều lưu ở đây */
const ROOT_FOLDER_ID = '1xUV4WDLHiE9YlyG35Fy3v7ELSxlWWV_a';

/** Google Sheet dữ liệu gốc: NGUYENHIEN_DATA */
const DATA_SHEET_ID = '1EyH5_IAwYVhNPuZFbwMpauCW0K1Y0S4yxOQ93Nla7LE';

/** Số lớp 12 của khoá – tên lớp dạng 12/1 … 12/12 */
const SO_LOP = 12;

const TZ = 'Asia/Ho_Chi_Minh';
const SESSION_TTL = 21600; // 6 giờ
const PROP = PropertiesService.getScriptProperties();
let _ss = null;
let _cache = {};

/* ======================= WEB ======================= */
function doGet() {
  return HtmlService.createHtmlOutputFromFile('Index')
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
    const h = SHEETS[name];
    const sh = ss.getSheetByName(name) || ss.insertSheet(name);
    const cur = sh.getLastRow() === 0 ? [] : sh.getRange(1, 1, 1, h.length).getValues()[0];
    if (cur.join('|') !== h.join('|')) {
      sh.getRange(1, 1, 1, h.length).setValues([h])
        .setFontWeight('bold').setBackground('#1e4f9c').setFontColor('#ffffff');
      sh.setFrozenRows(1);
    }
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
    const pw = Math.random().toString(36).slice(2, 10);
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
function sh_(n) { return ss_().getSheetByName(n); }

function read_(n) {
  if (_cache[n]) return _cache[n];
  const sh = sh_(n), h = SHEETS[n], last = sh.getLastRow();
  if (last < 2) return (_cache[n] = []);
  const v = sh.getRange(2, 1, last - 1, h.length).getDisplayValues();
  const out = [];
  v.forEach(function (r, i) {
    if (r[0] === '') return;
    const o = { _row: i + 2 };
    h.forEach(function (k, j) { o[k] = r[j]; });
    out.push(o);
  });
  return (_cache[n] = out);
}

function safe_(v) {
  const s = v == null ? '' : String(v);
  return /^[=+@]/.test(s) ? "'" + s : s;
}
function rowOf_(n, o) { return SHEETS[n].map(function (k) { return safe_(o[k]); }); }

function append_(n, o) {
  const sh = sh_(n), r = sh.getLastRow() + 1;
  sh.getRange(r, 1, 1, SHEETS[n].length).setNumberFormat('@').setValues([rowOf_(n, o)]);
  delete _cache[n];
}
function appendMany_(n, list) {
  if (!list.length) return;
  const sh = sh_(n), r = sh.getLastRow() + 1;
  sh.getRange(r, 1, list.length, SHEETS[n].length).setNumberFormat('@')
    .setValues(list.map(function (o) { return rowOf_(n, o); }));
  delete _cache[n];
}
function update_(n, o) {
  sh_(n).getRange(o._row, 1, 1, SHEETS[n].length).setNumberFormat('@').setValues([rowOf_(n, o)]);
  delete _cache[n];
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
  Object.keys(o).forEach(function (k) { if (k !== '_row' && k !== 'salt' && k !== 'hash') r[k] = o[k]; });
  return r;
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
  read_('CauHinh').forEach(function (c) { r[c.key] = c.value; });
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
function saveImage_(dataUrl, name) {
  const m = String(dataUrl || '').match(/^data:(image\/[\w+.\-]+);base64,(.+)$/);
  if (!m) throw new Error('Tệp ảnh không hợp lệ.');
  if (m[2].length > 15 * 1024 * 1024) throw new Error('Ảnh quá lớn.');
  const blob = Utilities.newBlob(Utilities.base64Decode(m[2]), m[1], name || ('anh_' + uid_() + '.jpg'));
  const f = folder_().createFile(blob);
  try { f.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW); } catch (e) { }
  return f.getId();
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
  return { token: token, user: a.user, hoTen: a.hoTen, role: a.role, lopId: a.lopId };
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

function getPublicData() {
  try { autoSeed_(); } catch (e) { console.log('autoSeed: ' + e.message); }
  const accs = read_('TaiKhoan').filter(function (a) { return a.role === 'class' && a.active !== '0'; });
  const hs = read_('HocSinh');
  const lop = sort_(read_('Lop')).map(function (l) {
    const o = pub_(l);
    const ad = accs.find(function (a) { return a.lopId === l.id; });
    o.admin = ad ? ad.hoTen : '';
    o.adminLienHe = ad ? (ad.lienHe || '') : '';
    o.hs = sort_(hs.filter(function (h) { return h.lopId === l.id; })).map(pub_);
    return o;
  });
  const dk = read_('DangKy').filter(function (d) { return d.trangThai !== 'huy'; });
  const dkLop = {};
  dk.forEach(function (d) { dkLop[d.lopId] = (dkLop[d.lopId] || 0) + 1; });
  return {
    tinTuc: sortNews_(read_('TinTuc').filter(function (t) { return t.trangThai === 'published'; })).map(pub_),
    dangKy: { tong: dk.length, theoLop: dkLop },
    cfg: cfg_(),
    lop: lop,
    hoatDong: read_('HoatDong').filter(function (e) { return e.trangThai === 'published'; }).map(pub_),
    thayCo: sort_(read_('ThayCo')).map(pub_),
    luuBut: read_('LuuBut').filter(function (x) { return x.trangThai === 'approved'; }).map(pub_).reverse(),
    anh: read_('Anh').map(pub_).reverse()
  };
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
    append_('LuuBut', { id: uid_(), lopId: lopId, tacGia: tacGia, noiDung: noiDung, trangThai: 'pending', taoLuc: now_() });
    return true;
  });
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
    o.hs = sort_(hs.filter(function (h) { return h.lopId === l.id; })).map(pub_);
    return o;
  });
  const mine = function (x, field) { return isS || x[field] === u.lopId; };
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
    tinTuc: isS ? sortNews_(read_('TinTuc')).map(pub_) : [],
    dangKy: read_('DangKy').filter(function (x) { return mine(x, 'lopId'); }).map(pub_).reverse(),
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
function setClassAdmin(token, lopId, user, hoTen, pw) {
  return lock_(function () {
    const u = auth_(token, true);
    const l = find_('Lop', lopId);
    if (!l) throw new Error('Lớp không tồn tại.');
    user = normUser_(user);
    if (!/^[a-z0-9_.]{3,30}$/.test(user)) throw new Error('Tên đăng nhập chỉ gồm chữ thường không dấu, số, dấu _ hoặc . (3–30 ký tự).');
    hoTen = req_(hoTen, 'họ tên admin', 60);
    const ex = find_('TaiKhoan', user);
    if (ex && !(ex.role === 'class' && ex.lopId === lopId)) throw new Error('Tên đăng nhập "' + user + '" đã được dùng cho tài khoản khác.');
    if (!ex && String(pw || '').length < 6) throw new Error('Mật khẩu phải từ 6 ký tự.');
    if (ex && pw && String(pw).length < 6) throw new Error('Mật khẩu phải từ 6 ký tự.');
    remove_('TaiKhoan', function (a) { return a.role === 'class' && a.lopId === lopId && a.user !== user; });
    if (ex) {
      const a = find_('TaiKhoan', user);
      a.hoTen = hoTen; a.active = '1';
      if (pw) { a.salt = Utilities.getUuid(); a.hash = hash_(a.salt, String(pw)); }
      update_('TaiKhoan', a);
    } else {
      const salt = Utilities.getUuid();
      append_('TaiKhoan', { user: user, hoTen: hoTen, role: 'class', lopId: lopId, salt: salt, hash: hash_(salt, String(pw)), active: '1' });
    }
    log_(u, 'Gán admin lớp ' + l.ten + ': ' + user);
    return true;
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
    const o = pick_(s, ['id', 'lopId', 'hoTen', 'chucVu', 'hienO', 'thuTu']);
    if (o.id) {
      const ex = find_('HocSinh', o.id);
      if (!ex) throw new Error('Học sinh không tồn tại.');
      canLop_(u, ex.lopId);
    }
    if (!find_('Lop', o.lopId)) throw new Error('Lớp không tồn tại.');
    canLop_(u, o.lopId);
    o.hoTen = req_(o.hoTen, 'họ tên', 80);
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

/** Dán từ Excel: mỗi dòng "Họ tên<TAB>Chức vụ<TAB>Hiện ở" (dấu ; cũng được). */
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
      list.push({ id: uid_() + list.length, lopId: lopId, hoTen: p[0].slice(0, 80), chucVu: (p[1] || '').slice(0, 40), hienO: (p[2] || '').slice(0, 80), thuTu: String(++order) });
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
      o.anhId = saveImage_(dataUrl, 'thayco_' + uid_() + '.jpg');
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
  const fileId = saveImage_(p.dataUrl, p.name);
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
      const v = String(cfg[k]).trim().slice(0, 3000);
      const ex = rows.find(function (r) { return r.key === k; });
      if (ex) { ex.value = v; update_('CauHinh', ex); } else append_('CauHinh', { key: k, value: v });
    });
    log_(u, 'Cập nhật cài đặt chung');
    return true;
  });
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

  const GV = ['Cô Nguyễn Thị Hoa', 'Thầy Trần Văn Lộc', 'Cô Lê Thị Mỹ', 'Thầy Phạm Quốc Hùng', 'Cô Võ Thị Lan', 'Thầy Đỗ Minh Tâm', 'Cô Huỳnh Thu Hà', 'Thầy Bùi Văn Sơn', 'Cô Phan Thị Nga', 'Thầy Ngô Đức Trí', 'Cô Đặng Mỹ Linh', 'Thầy Lê Văn Đức'];
  const BAN = ['Ban A', 'Ban A', 'Ban A', 'Ban B', 'Ban B', 'Ban B', 'Ban C', 'Ban C', 'Ban C', 'Ban D', 'Ban D', 'Ban D'];
  const NOI = ['tiết mục múa “Áo trắng” giải nhất văn nghệ 20/11', 'đội bóng đá vô địch Hội khoẻ Phù Đổng', 'trại đẹp nhất hội trại 26/3', 'báo tường giải nhất ngày 9/1', 'đội rung chuông vàng vào chung kết', 'lớp có nhiều bạn đi học xa nhất'];
  lops.forEach(function (l, i) {
    if (!l.gvcn) l.gvcn = GV[i % GV.length];
    if (!l.ban) l.ban = BAN[i % BAN.length];
    if (!l.gioiThieu) l.gioiThieu = 'Lớp ' + l.ten + ' học dãy ' + (i < 6 ? 'nhà A' : 'nhà B') + ', nhớ nhất ' + NOI[i % NOI.length] + '.';
    update_('Lop', l);
  });

  const HO = ['Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Võ', 'Đặng', 'Bùi', 'Đỗ', 'Huỳnh', 'Phan', 'Ngô'];
  const DEM = ['Văn', 'Thị', 'Minh', 'Ngọc', 'Thanh', 'Quốc', 'Hoàng', 'Thu', 'Hữu', 'Mỹ'];
  const TEN = ['An', 'Bình', 'Châu', 'Dũng', 'Hà', 'Hải', 'Hằng', 'Hùng', 'Khoa', 'Lan', 'Linh', 'Long', 'Mai', 'Nam', 'Nhi', 'Phúc', 'Quang', 'Tâm', 'Thảo', 'Trang', 'Tuấn', 'Vy', 'Yến', 'Đạt'];
  const CITY = ['Đà Nẵng', 'Đà Nẵng', 'Đà Nẵng', 'TP.HCM', 'TP.HCM', 'Hà Nội', 'Quảng Nam', 'Huế', 'Hội An', 'Úc', 'Mỹ', 'Nhật Bản', 'Đức', 'Canada'];
  const hs = [];
  lops.forEach(function (l, i) {
    const cnt = 40 + (i * 5) % 9;
    for (let k = 0; k < cnt; k++) {
      hs.push({ id: id('hs'), lopId: l.id, hoTen: HO[(k + i) % 12] + ' ' + DEM[(k * 3 + i) % 10] + ' ' + TEN[(k * 7 + i * 3) % 24],
        chucVu: k === 0 ? 'Lớp trưởng' : k === 1 ? 'Bí thư' : k === 2 ? 'Lớp phó học tập' : k === 3 ? 'Lớp phó văn nghệ' : '',
        hienO: CITY[(k * 3 + i) % CITY.length], thuTu: String(k + 1) });
    }
  });
  appendMany_('HocSinh', hs);

  const EV = [
    ['2000–2001', '20/11/2000', 'Đêm văn nghệ 20/11', 'Lần đầu khối 10 lên sân khấu trường. Tiết mục múa “Áo trắng” giành giải nhất.', '🎤'],
    ['2000–2001', '26/03/2001', 'Hội trại 26/3', 'Hai ngày một đêm dựng trại, trò chơi lớn và đốt lửa trại.', '⛺'],
    ['2001–2002', '12/2001', 'Hội khoẻ Phù Đổng', 'Bóng đá nam, bóng chuyền nữ, kéo co giữa các lớp khối 11.', '⚽'],
    ['2001–2002', '04/2002', 'Dã ngoại về nguồn', 'Thăm di tích, trồng cây và giao lưu với trường bạn.', '🚌'],
    ['2002–2003', '09/01/2003', 'Rung chuông vàng', 'Ngày Học sinh – Sinh viên, mười hai lớp thi báo tường và rung chuông vàng.', '🔔'],
    ['2002–2003', '05/2003', 'Lễ tri ân và chia tay', 'Đêm cuối dưới mái trường, hát “Mong ước kỷ niệm xưa”, trao lưu bút.', '🌺'],
    ['Sau ra trường', '08/2013', 'Họp lớp 10 năm', 'Cả khoá về thăm trường, gặp lại thầy cô chủ nhiệm.', '🥂'],
    ['Sau ra trường', '07/2023', 'Họp lớp 20 năm', 'Họp mặt ở biển Mỹ Khê, hơn 300 bạn về dự.', '🎉']
  ];
  appendMany_('HoatDong', EV.map(function (e) { return { id: id('hd'), namHoc: e[0], ngay: e[1], tieuDe: e[2], moTa: e[3], icon: e[4], anhId: '', trangThai: 'published', lopDeXuat: '', taoLuc: t }; }));

  const TC = [['Thầy Nguyễn Văn Thành', 'Hiệu trưởng'], ['Cô Trần Thị Thu', 'Phó hiệu trưởng'], ['Thầy Lê Quang Vinh', 'Bí thư Đoàn trường']];
  lops.forEach(function (l, i) { TC.push([l.gvcn || GV[i % GV.length], 'Chủ nhiệm ' + l.ten]); });
  const seen = {};
  appendMany_('ThayCo', TC.filter(function (x) { if (seen[x[0]]) return false; seen[x[0]] = 1; return true; })
    .map(function (x, i) { return { id: id('tc'), hoTen: x[0], vaiTro: x[1], anhId: '', thuTu: String(i + 1) }; }));

  const L = function (i) { return lops[i % lops.length].id; };
  const LB = [
    ['Hải', 1, 'Mong 20 năm nữa tụi mình vẫn gọi nhau là mày tao như hồi ngồi bàn cuối.'],
    ['Trang', 4, 'Cảm ơn cô chủ nhiệm đã tin con, kể cả lúc con không tin chính mình.'],
    ['Long', 0, 'Gốc phượng sân sau giờ còn không ta? Ai về trường chụp giùm một tấm nha.'],
    ['Linh', 6, 'Lớp mình còn nợ nhau một chuyến đi Hội An.'],
    ['Tuấn', 2, 'Đứa nào mượn Kính Vạn Hoa tập 23 của tui thì trả nha.'],
    ['Mai', 10, 'Nhớ buổi tập văn nghệ dưới mưa trước ngày 20/11.'],
    ['Phúc', -1, 'Ba năm Nguyễn Hiền là ba năm đẹp nhất. Cảm ơn tất cả.'],
    ['Thảo', -1, 'Hẹn cả khoá ngày 20/11 năm nay, nhớ về đông đủ nha.']
  ];
  appendMany_('LuuBut', LB.map(function (x) { return { id: id('lb'), lopId: x[1] < 0 ? '' : L(x[1]), tacGia: x[0], noiDung: x[2], trangThai: 'approved', taoLuc: t }; }));

  appendMany_('TinTuc', [
    { id: id('tt'), loai: 'Họp lớp', tieuDe: 'Họp lớp toàn khoá 2026: hẹn nhau dịp 20/11', noiDung: 'Lớp 12/5 đề xuất, Ban liên lạc đã chốt: cả khoá về thăm trường 61 Phan Đăng Lưu buổi sáng, chiều họp mặt ở biển Mỹ Khê. Mời thầy cô chủ nhiệm cả 12 lớp.', ngay: '20/11/2026', noiBat: '1', trangThai: 'published', taoLuc: t },
    { id: id('tt'), loai: 'Thông báo', tieuDe: 'Cập nhật “Giờ đang ở”', noiDung: 'Admin các lớp nhờ mọi người báo nơi đang sống để làm biểu đồ bạn bè đang ở đâu.', ngay: '', noiBat: '0', trangThai: 'published', taoLuc: t },
    { id: id('tt'), loai: 'Tri ân', tieuDe: 'Thăm thầy cô ngày 20/11', noiDung: 'Danh sách thầy cô đã nghỉ hưu cần ghé thăm, xem ở mục Kỷ yếu.', ngay: '', noiBat: '0', trangThai: 'published', taoLuc: t },
    { id: id('tt'), loai: 'Tìm người', tieuDe: 'Lớp 12/9 tìm bạn Phúc', noiDung: 'Ai còn liên lạc với bạn Phúc báo admin lớp 12/9 giúp.', ngay: '', noiBat: '0', trangThai: 'published', taoLuc: t }
  ]);

  const ANH = [['Hội trại 26/3', 'Dựng trại'], ['Đêm văn nghệ 20/11', 'Tập văn nghệ'], ['Hội khoẻ Phù Đổng', 'Giao lưu bóng đá'], ['Ảnh tập thể', 'Chụp ảnh lớp'], ['Họp lớp 20 năm', 'Họp lớp ở Mỹ Khê'], ['Giao lưu', 'Giao lưu hai lớp'], ['Lễ tri ân và chia tay', 'Ngày chia tay']];
  const anh = [];
  for (let i = 0; i < 24; i++) {
    const a = ANH[i % ANH.length];
    anh.push({ id: id('anh'), album: a[0], lopId: L(i), chuThich: a[1], fileId: '', nguoiDang: 'Dữ liệu mẫu', taoLuc: t });
  }
  for (let i = 0; i < 6; i++) {
    anh.push({ id: id('anh'), album: 'Ngày ấy', lopId: L(i), chuThich: 'Ảnh lớp năm 2003', fileId: '', nguoiDang: 'Dữ liệu mẫu', taoLuc: t });
    anh.push({ id: id('anh'), album: 'Bây giờ', lopId: L(i), chuThich: 'Họp lớp năm 2023', fileId: '', nguoiDang: 'Dữ liệu mẫu', taoLuc: t });
  }
  appendMany_('Anh', anh);

  const dk = [];
  for (let i = 0; i < 24; i++) {
    const h = hs[(i * 37) % hs.length];
    dk.push({ id: id('dk'), lopId: h.lopId, hoTen: h.hoTen, lienHe: '0900 000 ' + String(100 + i), ghiChu: i % 5 === 0 ? 'Đi cùng gia đình' : '', trangThai: i % 3 === 0 ? 'xacnhan' : 'cho', taoLuc: t });
  }
  appendMany_('DangKy', dk);

  return 'Đã nạp: ' + hs.length + ' học sinh, ' + EV.length + ' hoạt động, ' + LB.length + ' lưu bút, ' + anh.length + ' ảnh minh hoạ, 4 tin, ' + dk.length + ' đăng ký.';
}

function xoaDuLieuMau_() {
  let total = 0;
  ['HocSinh', 'HoatDong', 'ThayCo', 'LuuBut', 'TinTuc', 'Anh', 'DangKy'].forEach(function (s) {
    const all = read_(s);
    const keep = all.filter(function (x) { return String(x.id).indexOf('mau_') !== 0; });
    if (keep.length === all.length) return;
    total += all.length - keep.length;
    const sh = sh_(s), w = SHEETS[s].length;
    if (sh.getLastRow() > 1) sh.getRange(2, 1, sh.getLastRow() - 1, w).clearContent();
    if (keep.length) sh.getRange(2, 1, keep.length, w).setNumberFormat('@').setValues(keep.map(function (o) { return rowOf_(s, o); }));
    delete _cache[s];
  });
  return 'Đã xoá ' + total + ' dòng dữ liệu mẫu. Thông tin chủ nhiệm, ban, giới thiệu của các lớp vẫn giữ để bạn sửa lại.';
}
