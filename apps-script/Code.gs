/**
 * PHILONG BUILDING
 * V5.4.76-split-desktop-mobile
 *
 * Database: IT ASSET DATABASE - PHI LONG
 * DB_ID: 1ggFuX2kHKmzJciIPuTVdIWIlyO4Ryn1fnUegdywK3lE
 *
 * File set:
 * - Code.gs
 * - index.html
 */

const APP_CONFIG = {
  APP_NAME: 'PHI LONG TECHNOLOGY',
  APP_SUBTITLE: 'IT ASSET MANAGEMENT',
  VERSION: '5.4.94-footer',
  SPREADSHEET_ID: '1ggFuX2kHKmzJciIPuTVdIWIlyO4Ryn1fnUegdywK3lE',
  TIMEZONE: 'Asia/Saigon',
  DATE_FORMAT: 'dd/MM/yyyy',
  DATETIME_FORMAT: 'dd/MM/yyyy HH:mm:ss'
};

const SHEET = {
  THIET_BI: 'THIET_BI',
  DANH_MUC_THIET_BI: 'DM_THIETBI',
  DM_THIETBI: 'DM_THIETBI',
  NHAN_SU: 'NHAN_SU',
  TAI_KHOAN: 'TAI_KHOAN',
  DANH_MUC_PHONG_BAN: 'DANH_MUC_PHONG_BAN',
  DANH_MUC_CO_SO: 'DANH_MUC_CO_SO',
  DANH_MUC_TANG: 'DANH_MUC_TANG',
  DANH_MUC_KHO: 'DM_KHO',
  DM_KHO: 'DM_KHO',
  KHO_NHAPXUATTON: 'KHO_NHAPXUATTON',
  KHO_NHAP: 'KHO_NHAPXUATTON',
  KHO_TON: 'KHO_NHAPXUATTON',
  NHAP_XUAT_TON: 'KHO_NHAPXUATTON',
  BAO_TRI_THIET_BI: 'BAO_TRI_THIET_BI',
  THU_HOI_THIET_BI: 'KHO_THUHOI',
  KHO_THUHOI: 'KHO_THUHOI',
  THANH_LY_THIET_BI: 'THANH_LY_THIET_BI',
  DE_XUAT_MUA_THIET_BI: 'DE_XUAT_MUA_THIET_BI',
  DE_XUAT_THANH_LY: 'DE_XUAT_THANH_LY',
  VAI_TRO: 'VAI_TRO',
  PHAN_QUYEN: 'PHAN_QUYEN',
  NHAT_KY_HE_THONG: 'NHAT_KY_HE_THONG',
  LICH_SU_CHUYEN_THIET_BI: 'LICH_SU_CHUYEN_THIET_BI'
  ,CAM_NANG: 'CAM_NANG'
};

// CẨM NANG là bảng độc lập. Tối đa năm ảnh, lưu lần lượt vào HINH_ANH_1..5.
const CAM_NANG_HEADERS_V865 = Object.freeze([
  'STT',
  'TINH_HUONG',
  'HIEN_TUONG_MO_TA',
  'QUY_TRINH_XU_LY',
  'TAI_NGUYEN_LENH',
  'NGUOI_THUC_HIEN',
  'NGAY_CAP_NHAT',
  'HINH_ANH_1',
  'HINH_ANH_2',
  'HINH_ANH_3',
  'HINH_ANH_4',
  'HINH_ANH_5'
]);
const CAM_NANG_VISIBLE_HEADERS_V865 = Object.freeze(CAM_NANG_HEADERS_V865.slice());
const CAM_NANG_IMAGE_FOLDER_ID_V865 = '116gIdzEn1FdSJXybN4R7_jofeorvhhBb';

const TABLES = {
  THIET_BI:{sheet:SHEET.THIET_BI,pk:'ID_THIET_BI',prefix:'TB',dateFields:['NGAY_TAO','NGAY_CAP_NHAT'],hiddenColumns:['ID_THIET_BI_CU'],titleColumns:['MA_THIET_BI','TEN_THIET_BI','TRANG_THAI'],editable:true},
  DANH_MUC_THIET_BI:{sheet:SHEET.DANH_MUC_THIET_BI,pk:'ID_DANH_MUC',prefix:'DM',editable:true},
  NHAN_SU:{sheet:SHEET.NHAN_SU,pk:'ID_NHAN_SU',prefix:'NS',hiddenColumns:['TRANG_THAI_XAC_MINH','NGUON_DU_LIEU'],editable:true},
  TAI_KHOAN:{sheet:SHEET.TAI_KHOAN,pk:'ID_TAI_KHOAN',prefix:'TK',hiddenColumns:['AUTH_UID','MAT_KHAU_HASH','MAT_KHAU_SALT','MAT_KHAU_CAP_NHAT_LUC'],editable:true},
  DANH_MUC_PHONG_BAN:{sheet:SHEET.DANH_MUC_PHONG_BAN,pk:'ID_PHONG_BAN',prefix:'PB',editable:true},
  DANH_MUC_CO_SO:{sheet:SHEET.DANH_MUC_CO_SO,pk:'ID_CO_SO',prefix:'CS',editable:true},
  DANH_MUC_TANG:{sheet:SHEET.DANH_MUC_TANG,pk:'ID_TANG',prefix:'TG',editable:true},
  DANH_MUC_KHO:{sheet:SHEET.DANH_MUC_KHO,pk:'ID_KHO',prefix:'KHO',editable:true},
  DM_KHO:{sheet:SHEET.DM_KHO,pk:'ID_KHO',prefix:'KHO',editable:true},
  DM_THIETBI:{sheet:SHEET.DM_THIETBI,pk:'ID_DANH_MUC',prefix:'DM',editable:true},
  KHO_NHAPXUATTON:{sheet:SHEET.KHO_NHAPXUATTON,pk:'ID_GIAO_DICH',prefix:'NXT',editable:true},
  KHO_THUHOI:{sheet:SHEET.KHO_THUHOI,pk:'ID_THU_HOI',prefix:'TH',editable:true},
  KHO_NHAP:{sheet:SHEET.KHO_NHAP,pk:'ID_NHAP_KHO',prefix:'NK',cancel:true,hiddenColumns:['NGAY_HUY','ID_TAI_KHOAN_HUY','LY_DO_HUY'],editable:true},
  KHO_TON:{sheet:SHEET.KHO_TON,pk:'ID_TON_KHO',prefix:'TON',editable:false},
  NHAP_XUAT_TON:{sheet:SHEET.NHAP_XUAT_TON,pk:'ID_GIAO_DICH',prefix:'NXT',hidden:true,editable:false},
  BAO_TRI_THIET_BI:{sheet:SHEET.BAO_TRI_THIET_BI,pk:'ID_BAO_TRI',prefix:'BT',editable:true},
  THU_HOI_THIET_BI:{sheet:SHEET.THU_HOI_THIET_BI,pk:'ID_THU_HOI',prefix:'TH',editable:true},
  THANH_LY_THIET_BI:{sheet:SHEET.THANH_LY_THIET_BI,pk:'ID_THANH_LY',prefix:'TL',cancel:true,editable:true},
  DE_XUAT_MUA_THIET_BI:{sheet:SHEET.DE_XUAT_MUA_THIET_BI,pk:'ID_DE_XUAT',prefix:'DXM',cancel:true,hiddenColumns:['NGAY_HUY','ID_TAI_KHOAN_HUY','LY_DO_HUY'],editable:true},
  DE_XUAT_THANH_LY:{sheet:SHEET.DE_XUAT_THANH_LY,pk:'ID_DE_XUAT',prefix:'DXTL',cancel:true,editable:true},
  VAI_TRO:{sheet:SHEET.VAI_TRO,pk:'ID_VAI_TRO',prefix:'ROLE',editable:true},
  PHAN_QUYEN:{sheet:SHEET.PHAN_QUYEN,pk:'ID',prefix:'PQ',editable:true},
  NHAT_KY_HE_THONG:{sheet:SHEET.NHAT_KY_HE_THONG,pk:'ID_LOG',prefix:'LOG',editable:false},
  LICH_SU_CHUYEN_THIET_BI:{sheet:SHEET.LICH_SU_CHUYEN_THIET_BI,pk:'ID_LICH_SU',prefix:'LSC',editable:false}
};


/** V5.4 DATA CONNECTION CLEAN: backend is the only source of truth for sheet routing. */
const PAGE_DATA_ROUTES = Object.freeze({
  equipment:{feature:'THIET_BI',read:'THIET_BI',write:'THIET_BI'},

  warehouseDevice:{feature:'KHO',read:'KHO_NHAPXUATTON',write:'KHO_NHAPXUATTON'},
  materialWarehouse:{feature:'KHO',read:'KHO_NHAPXUATTON',write:'KHO_NHAPXUATTON'},
  recovery:{feature:'THU_HOI',read:'KHO_THUHOI',write:'KHO_THUHOI'},
  disposal:{feature:'THANH_LY',read:'THANH_LY_THIET_BI',write:'THANH_LY_THIET_BI'},
  allocation:{feature:'KHO',read:null,write:null},

  maintenance:{feature:'BAO_TRI',read:'BAO_TRI_THIET_BI',write:'BAO_TRI_THIET_BI'},
  maintenanceLog:{feature:'BAO_TRI',read:'BAO_TRI_THIET_BI',write:'BAO_TRI_THIET_BI'},
  maintenancePlan:{feature:'BAO_TRI',read:'BAO_TRI_THIET_BI',write:null},

  employees:{feature:'DANH_MUC',read:'NHAN_SU',write:'NHAN_SU'},
  departments:{feature:'DANH_MUC',read:'DANH_MUC_PHONG_BAN',write:'DANH_MUC_PHONG_BAN'},
  locations:{feature:'DANH_MUC',read:'DANH_MUC_CO_SO',write:'DANH_MUC_CO_SO'},
  warehouses:{feature:'DANH_MUC',read:'DM_KHO',write:'DM_KHO'},
  floors:{feature:'DANH_MUC',read:'DANH_MUC_TANG',write:'DANH_MUC_TANG'},
  buildingAreas:{feature:'DANH_MUC',read:'DANH_MUC_CO_SO',write:null},
  maintenanceItems:{feature:'DANH_MUC',read:'DM_THIETBI',write:'DM_THIETBI'},

  users:{feature:'TAI_KHOAN',read:'TAI_KHOAN',write:'TAI_KHOAN'},
  roles:{feature:'PHAN_QUYEN',read:'VAI_TRO',write:'VAI_TRO'},
  permissions:{feature:'PHAN_QUYEN',read:'PHAN_QUYEN',write:null},
  systemAudit:{feature:'NHAT_KY',read:'NHAT_KY_HE_THONG',write:null},
  systemConfig:{feature:'CAI_DAT',read:null,write:null},

  work:{feature:'CONG_VIEC',read:null,write:null},
  daily:{feature:'CONG_VIEC',read:null,write:null},
  handbook:{feature:'CAM_NANG',read:'CAM_NANG',write:'CAM_NANG'},
  contracts:{feature:'CHO_THUE',read:null,write:null},
  tenants:{feature:'CHO_THUE',read:null,write:null},
  prospects:{feature:'CHO_THUE',read:null,write:null},
  contractors:{feature:'DANH_MUC',read:null,write:null},
  suppliers:{feature:'DANH_MUC',read:null,write:null},
  pcccEmployees:{feature:'DANH_MUC',read:null,write:null},
  maintenanceDataTool:{feature:'BAO_TRI',read:null,write:null},
  emailConfig:{feature:'CAI_DAT',read:null,write:null}
});

const UI_CONTAINER_PAGE = Object.freeze({
  maintenancePlanTable:'maintenancePlan', maintenanceLogTable:'maintenanceLog',
  maintenanceScheduleTable:'maintenancePlan', equipmentTable:'equipment',
  warehouseDeviceTable:'warehouseDevice', allocationTable:'allocation',
  recoveryTable:'recovery', stockTxnTable:'materialWarehouse', materialTable:'materialWarehouse',
  employeesTable:'employees', departmentsTable:'departments', locationsTable:'locations', warehousesTable:'warehouses', usersTable:'users', rolesTable:'roles',
  permissionsTable:'permissions', systemAuditTable:'systemAudit', floorsTable:'floors',
  buildingAreasTable:'buildingAreas', maintenanceItemsTable:'maintenanceItems'
});

function getPageRouteV54_(page) {
  return PAGE_DATA_ROUTES[String(page || '')] || null;
}
function assertPageWritableV54_(page) {
  const route = getPageRouteV54_(page);
  if (!route) throw new Error('Trang chưa khai báo route dữ liệu: ' + page);
  if (!route.write) throw new Error('Trang "' + page + '" hiện chỉ đọc hoặc chưa có sheet nghiệp vụ chuẩn.');
  if (!TABLES[route.write]) throw new Error('Write route không hợp lệ: ' + route.write);
  return route;
}
function filterPayloadToHeadersV54_(sheetKey, payload) {
  const cfg = TABLES[sheetKey], headers = getHeaders_(getSheet_(cfg.sheet)), out = {};
  Object.keys(payload || {}).forEach(function(k){ if (headers.indexOf(k) >= 0) out[k] = payload[k]; });
  return out;
}
function normalizeUiPayloadV54_(page, sheetKey, payload) {
  const p = Object.assign({}, payload || {});
  if (sheetKey === 'THIET_BI') {
    if (p.HANG && !p.HANG_SAN_XUAT) p.HANG_SAN_XUAT = p.HANG;
    if (p.THONG_SO && !p.THONG_SO_KY_THUAT) p.THONG_SO_KY_THUAT = p.THONG_SO;
    if (p.ID_NGUOI_SU_DUNG && !p.ID_NHAN_SU_SU_DUNG) p.ID_NHAN_SU_SU_DUNG = p.ID_NGUOI_SU_DUNG;
  }
  if (sheetKey === 'KHO_NHAP') {
    if (p.NGAY_NHAP_KHO && !p.NGAY_NHAP) p.NGAY_NHAP = p.NGAY_NHAP_KHO;
    if (p.TEN_THIET_BI && !p.TEN_HANG) p.TEN_HANG = p.TEN_THIET_BI;
    if (p.TINH_TRANG && !p.TINH_TRANG_KHI_NHAP) p.TINH_TRANG_KHI_NHAP = p.TINH_TRANG;
    if (!p.SO_LUONG) p.SO_LUONG = 1;
  }
  if (sheetKey === 'THU_HOI_THIET_BI') {
    if (p.TINH_TRANG_KHI_TRA && !p.TINH_TRANG) p.TINH_TRANG = p.TINH_TRANG_KHI_TRA;
    if (!p.SO_LUONG_THU_HOI) p.SO_LUONG_THU_HOI = 1;
  }
  if (sheetKey === 'BAO_TRI_THIET_BI') {
    if (p.NGAY_THUC_HIEN && !p.NGAY_BAO_LOI) p.NGAY_BAO_LOI = p.NGAY_THUC_HIEN;
    if (!p.NGAY_BAO_LOI) p.NGAY_BAO_LOI = Utilities.formatDate(new Date(), APP_CONFIG.TIMEZONE, APP_CONFIG.DATE_FORMAT);
    if (p.NOI_DUNG_THUC_HIEN && !p.MO_TA_SU_CO) p.MO_TA_SU_CO = p.NOI_DUNG_THUC_HIEN;
    if (p.HIEN_TRANG && !p.MO_TA_SU_CO) p.MO_TA_SU_CO = p.HIEN_TRANG;
    if (p.PHUONG_AN_DE_XUAT && !p.PHUONG_AN_XU_LY) p.PHUONG_AN_XU_LY = p.PHUONG_AN_DE_XUAT;
    if (p.LOAI_DE_XUAT && !p.LOAI_BAO_TRI) p.LOAI_BAO_TRI = p.LOAI_DE_XUAT;
    if (p.CHI_PHI_DU_KIEN && !p.CHI_PHI) p.CHI_PHI = p.CHI_PHI_DU_KIEN;
    if (p.ID_NGUOI_THUC_HIEN && !p.ID_NHAN_SU_XU_LY) p.ID_NHAN_SU_XU_LY = p.ID_NGUOI_THUC_HIEN;
    if (p.DON_VI_THUC_HIEN && !p.DON_VI_SUA_CHUA) p.DON_VI_SUA_CHUA = p.DON_VI_THUC_HIEN;
    if (!p.TRANG_THAI) p.TRANG_THAI = 'Đang xử lý';
  }
  if (sheetKey === 'DE_XUAT_MUA_THIET_BI') {
    if (p.DON_GIA && !p.DON_GIA_DU_KIEN) p.DON_GIA_DU_KIEN = p.DON_GIA;
    if (p.MUC_DICH_LY_DO && !p.MUC_DICH_SU_DUNG) p.MUC_DICH_SU_DUNG = p.MUC_DICH_LY_DO;
    p.NHOM_THIET_BI = p.NHOM_THIET_BI || 'THIẾT BỊ';
    const qty=toNumber_(p.SO_LUONG), unit=toNumber_(p.DON_GIA_DU_KIEN);
    if (qty > 0 && unit >= 0) p.THANH_TIEN = qty * unit;
  }
  if (sheetKey === 'DE_XUAT_THANH_LY' && p.LY_DO && !p.LY_DO_DE_XUAT) p.LY_DO_DE_XUAT = p.LY_DO;
  if (sheetKey === 'NHAN_SU') {
    if (p.DIEN_THOAI && !p.SO_DIEN_THOAI) p.SO_DIEN_THOAI = p.DIEN_THOAI;
    if (p.PHONG_BAN && !p.ID_PHONG_BAN) p.ID_PHONG_BAN = p.PHONG_BAN;
  }
  if (sheetKey === 'TAI_KHOAN') {
    if (p.ID_NHAN_VIEN && !p.ID_NHAN_SU) p.ID_NHAN_SU = p.ID_NHAN_VIEN;
    if (p.EMAIL_DANG_NHAP && !p.EMAIL) p.EMAIL = p.EMAIL_DANG_NHAP;
  }
  return filterPayloadToHeadersV54_(sheetKey, p);
}

const SAFE_RESPONSE_HIDE_COLUMNS = [
  'AUTH_UID',
  'MAT_KHAU_HASH',
  'MAT_KHAU_SALT',
  'MAT_KHAU_CAP_NHAT_LUC'
];

function doGet(e) {
  const out = HtmlService
    .createHtmlOutputFromFile('index')
    .setTitle('PhiLong Technology');
  // Mặc định chặn nhúng trang vào website khác (chống clickjacking).
  // Chỉ bật khi thật sự cần nhúng (vd. Google Sites): Script property ALLOW_IFRAME_EMBED = true.
  if (String(PropertiesService.getScriptProperties().getProperty('ALLOW_IFRAME_EMBED') || '').toLowerCase() === 'true') {
    out.setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  }
  return out;
}




function testConnection_() {
  const ss = getDb_();
  return {
    ok: true,
    name: ss.getName(),
    id: ss.getId(),
    url: ss.getUrl(),
    version: APP_CONFIG.VERSION,
    checkedAt: nowText_()
  };
}
function testConnection() { return authCallAdminOrOwnerV5470_(testConnection_, arguments); }

function saveRecordV53_(sheetKeyOrName, record) {
  const tableKey = resolveTableKey_(sheetKeyOrName);
  const cfg = TABLES[tableKey];
  if (!cfg.editable) throw new Error('Sheet này không cho sửa trực tiếp: ' + cfg.sheet);
  const lock = LockService.getDocumentLock();
  lock.waitLock(30000);
  try {
    const sh=getSheet_(cfg.sheet), headers=getHeaders_(sh), incoming=Object.assign({},record||{}), pk=cfg.pk;
    normalizeWarehouseDocument_(tableKey,incoming,headers);
    const pkIndex=headers.indexOf(pk);
    if (pkIndex < 0) throw new Error('Không tìm thấy primary key '+pk+' trong '+cfg.sheet);
    // V5.4.77: tìm đúng dòng bằng TextFinder, chỉ đọc 1 dòng thay vì cả sheet.
    let sheetRow=-1;
    if (incoming[pk]) sheetRow=findSheetRowByValueV5477_(sh,pkIndex,incoming[pk]);
    if (sheetRow < 2) {
      const nk=findNaturalKey_(tableKey,incoming);
      if (nk) sheetRow=findSheetRowByValueV5477_(sh,headers.indexOf(nk.field),nk.value);
      if (sheetRow > 1 && !incoming[pk]) incoming[pk]=sh.getRange(sheetRow,pkIndex+1).getValues()[0][0];
    }
    if (!incoming[pk]) incoming[pk]=generateId_(tableKey);
    const rowIndex=sheetRow>1?sheetRow-1:-1;
    if (rowIndex > 0) {
      const existing=rowArrayToObject_(headers,sh.getRange(sheetRow,1,1,headers.length).getValues()[0]), merged=Object.assign({},existing);
      headers.forEach(function(h){ if(Object.prototype.hasOwnProperty.call(incoming,h)) merged[h]=incoming[h]; });
      merged[pk]=existing[pk]||incoming[pk];
      applyAutoFields_(merged,headers,false);
      sh.getRange(rowIndex+1,1,1,headers.length).setValues([headers.map(function(h){return normalizeWriteValue_(merged[h]);})]);
      memoForgetSheetV5477_(cfg.sheet);
      syncInventoryForDocument_(tableKey,merged);
      writeSystemLog_('UPDATE',cfg.sheet,merged[pk],'V5.4 PATCH UPDATE');
      afterSheetWriteV5477_(cfg.sheet);
      return {ok:true,action:'update',id:merged[pk],row:safeRow_(merged)};
    }
    if (isDuplicateNaturalKey_(tableKey,incoming)) {
      const nk=findNaturalKey_(tableKey,incoming);
      throw new Error('Dữ liệu đã tồn tại: '+nk.field+' = '+nk.value);
    }
    const clean={};
    headers.forEach(function(h){if(Object.prototype.hasOwnProperty.call(incoming,h))clean[h]=incoming[h];});
    clean[pk]=incoming[pk];
    applyAutoFields_(clean,headers,true);
    sh.appendRow(headers.map(function(h){return normalizeWriteValue_(clean[h]);}));
    memoForgetSheetV5477_(cfg.sheet);
    syncInventoryForDocument_(tableKey,clean);
    writeSystemLog_('CREATE',cfg.sheet,clean[pk],'V5.4 CREATE');
    afterSheetWriteV5477_(cfg.sheet);
    return {ok:true,action:'create',id:clean[pk],row:safeRow_(clean)};
  } finally { lock.releaseLock(); }
}


/**
 * V5.4.70 - Cơ chế tồn kho cũ (KHO_TON tách riêng, cột SO_LUONG_VAO/RA) chỉ dùng được
 * khi KHO_TON là sheet riêng. Database hiện tại gộp KHO_TON / KHO_NHAP / NHAP_XUAT_TON
 * vào chung KHO_NHAPXUATTON; tồn kho được tính động bằng buildWarehouseStockV5448_().
 * Khi đó tuyệt đối không xóa/ghi đè sheet sổ nhập - xuất - tồn.
 */
function legacyInventoryEnabledV5470_() {
  return SHEET.KHO_TON !== SHEET.NHAP_XUAT_TON && SHEET.KHO_TON !== SHEET.KHO_NHAPXUATTON;
}

function rebuildStockV53_(writeLog) {
  if (writeLog === undefined) writeLog = true;
  if (!legacyInventoryEnabledV5470_()) {
    return { ok:true, skipped:true, rows:0, message:'Tồn kho được tính động từ ' + SHEET.KHO_NHAPXUATTON + '; không ghi đè sổ nhập - xuất - tồn.' };
  }
  const ledger = readTable_('NHAP_XUAT_TON').rows;
  const sh = getSheet_(SHEET.KHO_TON);
  const headers = getHeaders_(sh);
  const map = {};

  ledger.forEach(g => {
    const key = makeStockKey_(g);
    if (!key) return;
    if (!map[key]) {
      map[key] = {
        ID_TON_KHO: 'TON-' + Utilities.getUuid().slice(0, 8).toUpperCase(),
        ID_KHO: g.ID_KHO || '',
        ID_DANH_MUC: g.ID_DANH_MUC || '',
        MA_HANG: g.MA_HANG || '',
        TEN_HANG: g.TEN_HANG || '',
        ID_THIET_BI: g.ID_THIET_BI || '',
        LOAI_QUAN_LY: g.LOAI_QUAN_LY || '',
        DON_VI_TINH: g.DON_VI_TINH || '',
        SO_LUONG_NHAP: 0,
        SO_LUONG_CAP_PHAT: 0,
        SO_LUONG_THU_HOI: 0,
        SO_LUONG_THANH_LY: 0,
        SO_LUONG_DIEU_CHINH: 0,
        SO_LUONG_TON: 0,
        DON_GIA_BINH_QUAN: 0,
        GIA_TRI_TON: 0,
        TINH_TRANG_TON: '',
        VI_TRI_KHO: '',
        NGAY_CAP_NHAT: nowText_()
      };
    }
    const vào = toNumber_(g.SO_LUONG_VAO);
    const ra = toNumber_(g.SO_LUONG_RA);
    const type = String(g.LOAI_GIAO_DICH || '').toUpperCase();
    if (type === 'NHAP') map[key].SO_LUONG_NHAP += vào;
    if (type === 'THU_HOI') map[key].SO_LUONG_THU_HOI += vào;
    if (type === 'CAP_PHAT') map[key].SO_LUONG_CAP_PHAT += ra;
    if (type === 'THANH_LY') map[key].SO_LUONG_THANH_LY += ra;
    if (type === 'DIEU_CHINH') map[key].SO_LUONG_DIEU_CHINH += (vào - ra);
    map[key].SO_LUONG_TON += (vào - ra);
    if (toNumber_(g.DON_GIA) > 0) map[key].DON_GIA_BINH_QUAN = toNumber_(g.DON_GIA);
    map[key].GIA_TRI_TON = map[key].SO_LUONG_TON * map[key].DON_GIA_BINH_QUAN;
  });

  const rows = Object.keys(map).map(k => headers.map(h => normalizeWriteValue_(map[k][h])));
  if (sh.getLastRow() > 1) sh.getRange(2, 1, sh.getLastRow()-1, headers.length).clearContent();
  if (rows.length) sh.getRange(2, 1, rows.length, headers.length).setValues(rows);
  if (writeLog) writeSystemLog_('REBUILD_STOCK', SHEET.KHO_TON, '', 'Tính lại tồn kho từ NHAP_XUAT_TON');
  return { ok:true, rows: rows.length };
}

/* V5.4.77 - Mỗi lượt gọi server chỉ mở file Spreadsheet 1 lần và nhớ đối tượng sheet theo tên. */
var DB_MEMO_V5477_ = null, SHEET_MEMO_V5477_ = {};
function getDb_() {
  if (!DB_MEMO_V5477_) DB_MEMO_V5477_ = SpreadsheetApp.openById(APP_CONFIG.SPREADSHEET_ID);
  return DB_MEMO_V5477_;
}

function getSheet_(sheetName) {
  if (SHEET_MEMO_V5477_[sheetName]) return SHEET_MEMO_V5477_[sheetName];
  const sh = getDb_().getSheetByName(sheetName);
  if (!sh) throw new Error('Không tìm thấy sheet: ' + sheetName);
  SHEET_MEMO_V5477_[sheetName] = sh;
  return sh;
}

/**
 * XÓA DỮ LIỆU ĐÁNH GIÁ KỸ THUẬT ĐÃ NGỪNG SỬ DỤNG.
 * Chạy thủ công một lần trong Apps Script sau khi triển khai bản này.
 * Chỉ xóa đúng 5 sheet DG_* và các dòng phân quyền DANH_GIA_KY_THUAT.
 */
function removeTechnicalEvaluationDataV5481_() {
  const db = getDb_();
  const targets = ['DG_KY_DANH_GIA','DG_TIEU_CHI','DG_PHIEU','DG_KET_QUA','DG_TONG_HOP'];
  const removed = [];
  targets.forEach(function(name) {
    const sheet = db.getSheetByName(name);
    if (sheet) { db.deleteSheet(sheet); delete SHEET_MEMO_V5477_[name]; removed.push(name); }
  });
  const permissionSheet = db.getSheetByName(SHEET.PHAN_QUYEN);
  let removedPermissions = 0;
  if (permissionSheet && permissionSheet.getLastRow() > 1) {
    const headers = getHeaders_(permissionSheet);
    const featureIndex = headers.indexOf('CHUC_NANG');
    if (featureIndex >= 0) {
      const rows = permissionSheet.getDataRange().getValues();
      for (let row = rows.length - 1; row >= 1; row--) {
        if (String(rows[row][featureIndex] || '').trim().toUpperCase() === 'DANH_GIA_KY_THUAT') {
          permissionSheet.deleteRow(row + 1); removedPermissions++;
        }
      }
    }
  }
  try { CacheService.getScriptCache().removeAll(['V5433_LOOKUPS']); } catch (_) {}
  writeSystemLog_('REMOVE_TECHNICAL_EVALUATION','SYSTEM','DG_*','Đã xóa '+removed.join(', ')+'; xóa '+removedPermissions+' dòng phân quyền.');
  return {ok:true,removedSheets:removed,removedPermissions:removedPermissions};
}
function removeTechnicalEvaluationDataV5481() { return authCallAdminOrOwnerV5470_(removeTechnicalEvaluationDataV5481_, arguments); }

/* =========================================================
   V5.4.65 - CAM_NANG độc lập: chỉ nhập và xem
   Sheet CAM_NANG độc lập, gồm bảy cột nghiệp vụ và tối đa năm cột hình ảnh
   với Thiết bị, Kho, Bảo trì, Đánh giá hoặc các bảng khác.
   ========================================================= */
function normalizeCamNangHeaderV865_(value) {
  const key = String(value || '').trim().toUpperCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/Đ/g, 'D')
    .replace(/[^A-Z0-9]+/g, '_').replace(/^_+|_+$/g, '');
  const aliases = {
    STT: 'STT',
    TINH_HUONG: 'TINH_HUONG',
    HIEN_TUONG: 'HIEN_TUONG_MO_TA',
    MO_TA: 'HIEN_TUONG_MO_TA',
    HIEN_TUONG_MO_TA: 'HIEN_TUONG_MO_TA',
    QUY_TRINH: 'QUY_TRINH_XU_LY',
    QUY_TRINH_XU_LY: 'QUY_TRINH_XU_LY',
    TAI_NGUYEN: 'TAI_NGUYEN_LENH',
    LENH: 'TAI_NGUYEN_LENH',
    TAI_NGUYEN_LENH: 'TAI_NGUYEN_LENH',
    NGUOI_THUC_HIEN: 'NGUOI_THUC_HIEN',
    NGAY_CAP_NHAT: 'NGAY_CAP_NHAT'
  };
  return aliases[key] || key;
}

function getCamNangColumnInfoV865_(sheet) {
  const width = Math.max(Number(sheet.getLastColumn() || 0), 1);
  const headers = sheet.getRange(1, 1, 1, width).getDisplayValues()[0];
  const positions = {};
  headers.forEach(function(value, index) {
    const key = normalizeCamNangHeaderV865_(value);
    if (key && positions[key] === undefined) positions[key] = index;
  });
  return { width: width, headers: headers, positions: positions };
}

function ensureCamNangSheetV865_() {
  const db = getDb_();
  let sheet = db.getSheetByName(SHEET.CAM_NANG);
  if (!sheet) sheet = db.insertSheet(SHEET.CAM_NANG);

  const lastRow = Number(sheet.getLastRow() || 0);
  const info = getCamNangColumnInfoV865_(sheet);
  const hasHeader = info.headers.some(function(value) { return String(value || '').trim() !== ''; });

  // Sheet mới/trống: ghi đúng thứ tự A:G.
  if (!hasHeader && lastRow <= 1) {
    if (sheet.getMaxColumns() < CAM_NANG_HEADERS_V865.length) {
      sheet.insertColumnsAfter(sheet.getMaxColumns(), CAM_NANG_HEADERS_V865.length - sheet.getMaxColumns());
    }
    sheet.getRange(1, 1, 1, CAM_NANG_HEADERS_V865.length).setValues([CAM_NANG_HEADERS_V865.slice()]);
  } else {
    // Sheet đã có dữ liệu: chỉ đổi tên/append cột còn thiếu, không xóa dữ liệu cũ.
    const current = getCamNangColumnInfoV865_(sheet);
    let nextColumn = Math.max(Number(sheet.getLastColumn() || 0), 1);
    CAM_NANG_HEADERS_V865.forEach(function(header) {
      const oldIndex = current.positions[header];
      if (oldIndex !== undefined) {
        if (String(current.headers[oldIndex] || '').trim() !== header) {
          sheet.getRange(1, oldIndex + 1).setValue(header);
        }
        return;
      }
      nextColumn += 1;
      if (sheet.getMaxColumns() < nextColumn) sheet.insertColumnsAfter(sheet.getMaxColumns(), 1);
      sheet.getRange(1, nextColumn).setValue(header);
      current.positions[header] = nextColumn - 1;
    });
  }

  sheet.setFrozenRows(1);
  return sheet;
}

function camNangRowHasDataV865_(row, positions) {
  return CAM_NANG_HEADERS_V865.some(function(header) {
    if (header === 'STT') return false;
    const index = positions[header];
    return index !== undefined && String(row[index] === undefined ? '' : row[index]).trim() !== '';
  });
}

function syncCamNangSttV865_(sheet) {
  const info = getCamNangColumnInfoV865_(sheet);
  const lastRow = Number(sheet.getLastRow() || 0);
  if (lastRow <= 1 || info.positions.STT === undefined) return;
  const values = sheet.getRange(2, 1, lastRow - 1, info.width).getValues();
  let maxStt = 0;
  values.forEach(function(row) {
    const n = Number(row[info.positions.STT]);
    if (isFinite(n) && n > maxStt) maxStt = n;
  });
  let nextStt = maxStt + 1;
  values.forEach(function(row, index) {
    if (!camNangRowHasDataV865_(row, info.positions)) return;
    if (String(row[info.positions.STT] === undefined ? '' : row[info.positions.STT]).trim() !== '') return;
    sheet.getRange(index + 2, info.positions.STT + 1).setValue(nextStt++);
  });
}

function camNangDateV865_() {
  return Utilities.formatDate(new Date(), APP_CONFIG.TIMEZONE, 'yyyy-MM-dd');
}

function camNangReadRowsV865_() {
  const sheet = ensureCamNangSheetV865_();
  syncCamNangSttV865_(sheet);
  const info = getCamNangColumnInfoV865_(sheet);
  const values = sheet.getDataRange().getDisplayValues();
  const rows = [];
  values.slice(1).forEach(function(row) {
    if (!camNangRowHasDataV865_(row, info.positions)) return;
    const item = {};
    CAM_NANG_HEADERS_V865.forEach(function(header) {
      const index = info.positions[header];
      item[header] = index === undefined ? '' : String(row[index] === undefined ? '' : row[index]);
    });
    rows.push(item);
  });
  return { sheet: SHEET.CAM_NANG, headers: CAM_NANG_VISIBLE_HEADERS_V865.slice(), rows: rows };
}

function getCamNangPageDataV865_() {
  const data = camNangReadRowsV865_();
  return { ok: true, sheet: data.sheet, headers: data.headers, rows: data.rows, count: data.rows.length, readonly: false };
}
function getCamNangPageDataV865() { return authCallUserV5470_(getCamNangPageDataV865_, arguments); }

function setupCamNangSheetV865_() {
  const sheet = ensureCamNangSheetV865_();
  syncCamNangSttV865_(sheet);
  return {
    ok: true,
    sheet: SHEET.CAM_NANG,
    range: 'A1:L1',
    headers: CAM_NANG_HEADERS_V865.slice(),
    message: 'Đã tạo/đồng bộ bảy cột nghiệp vụ và năm cột hình ảnh cho sheet CAM_NANG.'
  };
}
function setupCamNangSheetV865() { return authCallAdminOrOwnerV5470_(setupCamNangSheetV865_, arguments); }

// Tên ngắn để chạy thủ công một lần trong Apps Script nếu cần.
function setupCamNangSheet() { return setupCamNangSheetV865.apply(null, arguments); }

function saveCamNangRecordV865_(payload) {
  payload = payload || {};
  const situation = String(payload.TINH_HUONG || '').trim();
  if (!situation) throw new Error('Vui lòng nhập Tình huống.');
  const lock = LockService.getDocumentLock();
  lock.waitLock(30000);
  try {
    const sheet = ensureCamNangSheetV865_();
    syncCamNangSttV865_(sheet);
    const info = getCamNangColumnInfoV865_(sheet);
    const values = sheet.getDataRange().getValues();
    let maxStt = 0;
    values.slice(1).forEach(function(row) {
      const n = Number(info.positions.STT === undefined ? '' : row[info.positions.STT]);
      if (isFinite(n) && n > maxStt) maxStt = n;
    });
    const rowWidth = Math.max(Number(sheet.getLastColumn() || 0), CAM_NANG_HEADERS_V865.length);
    const row = Array(rowWidth).fill('');
    CAM_NANG_HEADERS_V865.forEach(function(header) {
      const index = info.positions[header];
      if (index === undefined) return;
      if (header === 'STT') row[index] = maxStt + 1;
      else if (header === 'NGAY_CAP_NHAT') row[index] = camNangDateV865_();
      else row[index] = String(payload[header] === undefined || payload[header] === null ? '' : payload[header]).trim();
    });
    sheet.getRange(sheet.getLastRow() + 1, 1, 1, rowWidth).setValues([row]);
    afterSheetWriteV5477_(SHEET.CAM_NANG);
    writeSystemLog_('CREATE', SHEET.CAM_NANG, 'STT-' + String(maxStt + 1), 'Thêm nội dung Cẩm nang');
    return { ok: true, persisted: true, sheet: SHEET.CAM_NANG, stt: maxStt + 1, row: row };
  } finally {
    lock.releaseLock();
  }
}
function saveCamNangRecordV865() { return authCallUserV5470_(saveCamNangRecordV865_, arguments); }

function updateCamNangRecordV865_(payload) {
  payload = payload || {};
  const stt = Number(payload.STT);
  const situation = String(payload.TINH_HUONG || '').trim();
  if (!isFinite(stt) || stt <= 0) throw new Error('Thiếu STT nội dung cần sửa.');
  if (!situation) throw new Error('Vui lòng nhập Tình huống.');
  const lock = LockService.getDocumentLock();
  lock.waitLock(30000);
  try {
    const sheet = ensureCamNangSheetV865_();
    syncCamNangSttV865_(sheet);
    const info = getCamNangColumnInfoV865_(sheet);
    const values = sheet.getDataRange().getValues();
    let rowNumber = 0;
    values.slice(1).some(function(row, index) {
      const current = Number(info.positions.STT === undefined ? '' : row[info.positions.STT]);
      if (current === stt) { rowNumber = index + 2; return true; }
      return false;
    });
    if (!rowNumber) throw new Error('Không tìm thấy nội dung STT-' + stt + '.');
    const rowWidth = Math.max(Number(sheet.getLastColumn() || 0), CAM_NANG_HEADERS_V865.length);
    const row = values[rowNumber - 1].slice(0, rowWidth);
    while (row.length < rowWidth) row.push('');
    CAM_NANG_HEADERS_V865.forEach(function(header) {
      const index = info.positions[header];
      if (index === undefined) return;
      if (header === 'STT') row[index] = stt;
      else if (header === 'NGAY_CAP_NHAT') row[index] = camNangDateV865_();
      else row[index] = String(payload[header] === undefined || payload[header] === null ? '' : payload[header]).trim();
    });
    sheet.getRange(rowNumber, 1, 1, rowWidth).setValues([row]);
    afterSheetWriteV5477_(SHEET.CAM_NANG);
    writeSystemLog_('UPDATE', SHEET.CAM_NANG, 'STT-' + stt, 'Sửa nội dung Cẩm nang');
    return { ok: true, persisted: true, sheet: SHEET.CAM_NANG, stt: stt, row: row };
  } finally {
    lock.releaseLock();
  }
}
function updateCamNangRecordV865() { return authCallUserV5470_(updateCamNangRecordV865_, arguments); }

function getCamNangPageData() { return getCamNangPageDataV865.apply(null, arguments); }
function saveCamNangRecord() { return saveCamNangRecordV865.apply(null, arguments); }
function updateCamNangRecord() { return updateCamNangRecordV865.apply(null, arguments); }

function uploadCamNangImageV865_(fileData) {
  fileData = fileData || {};
  const dataUrl = String(fileData.dataUrl || '');
  const match = dataUrl.match(/^data:(image\/(?:png|jpe?g|gif|webp));base64,([A-Za-z0-9+/=]+)$/i);
  if (!match) throw new Error('Ảnh không hợp lệ. Chỉ nhận PNG, JPG, GIF hoặc WEBP.');
  if (match[2].length > 11000000) throw new Error('Ảnh quá lớn. Vui lòng chọn ảnh nhỏ hơn khoảng 8 MB.');
  const folder = DriveApp.getFolderById(CAM_NANG_IMAGE_FOLDER_ID_V865);
  const bytes = Utilities.base64Decode(match[2]);
  const originalName = String(fileData.name || 'cam-nang-image').replace(/[^A-Za-z0-9._ -]/g, '_').trim() || 'cam-nang-image';
  const blob = Utilities.newBlob(bytes, match[1], originalName);
  const file = folder.createFile(blob);
  // Web App cần quyền xem trực tiếp thì thẻ IMG mới tải được ảnh.
  // Một số miền Google Workspace chặn chia sẻ công khai, vì vậy vẫn trả về
  // URL thumbnail; người dùng cùng quyền Drive vẫn xem được ảnh trong Web App.
  try { file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW); } catch (sharingError) {}
  const imageId = file.getId();
  return { ok: true, id: imageId, name: file.getName(), url: 'https://drive.google.com/thumbnail?id=' + imageId + '&sz=w1600', fileUrl: file.getUrl(), folderId: CAM_NANG_IMAGE_FOLDER_ID_V865 };
}
function uploadCamNangImageV865() { return authCallUserV5470_(uploadCamNangImageV865_, arguments); }
function uploadCamNangImage() { return uploadCamNangImageV865.apply(null, arguments); }

function getHeaders_(sheet) {
  return sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0].map(h => String(h || '').trim()).filter(Boolean);
}

function readTable_(tableKey) {
  const cfg = TABLES[tableKey] || { sheet: tableKey };
  const sh = getSheet_(cfg.sheet || tableKey);
  const values = sh.getDataRange().getDisplayValues();
  if (!values.length) return { headers:[], rows:[] };
  const headers = values[0].map(h => String(h || '').trim());
  const rows = values.slice(1)
    .filter(row => row.some(v => String(v || '').trim() !== ''))
    .map(row => rowArrayToObject_(headers, row));
  return { headers, rows };
}

function rowArrayToObject_(headers, row) {
  const obj = {};
  headers.forEach((h, i) => {
    if (!h) return;
    obj[h] = row[i] === undefined ? '' : row[i];
  });
  return obj;
}

function resolveTableKey_(sheetKeyOrName) {
  if (TABLES[sheetKeyOrName]) return sheetKeyOrName;
  const found = Object.keys(TABLES).find(k => TABLES[k].sheet === sheetKeyOrName);
  if (found) return found;
  throw new Error('Sheet/module không hợp lệ: ' + sheetKeyOrName);
}

function safeRow_(row) {
  const out = {};
  Object.keys(row || {}).forEach(k => {
    if (SAFE_RESPONSE_HIDE_COLUMNS.indexOf(k) >= 0) return;
    out[k] = row[k];
  });
  return out;
}

/**
 * V5.4.77 - Tìm số dòng (1-based trên sheet) có giá trị đúng bằng value trong cột colIndex (0-based),
 * dùng TextFinder thay vì đọc toàn bộ sheet. Trả về -1 nếu không có.
 */
function findSheetRowByValueV5477_(sh, colIndex, value) {
  const text = String(value == null ? '' : value).trim();
  const lastRow = sh.getLastRow();
  if (!text || colIndex < 0 || lastRow < 2) return -1;
  const hits = sh.getRange(2, colIndex + 1, lastRow - 1, 1).createTextFinder(text).matchCase(true).matchEntireCell(true).findAll();
  for (let i = 0; i < hits.length; i++) {
    const row = hits[i].getRow();
    // Xác nhận lại giá trị thật (TextFinder so theo chữ hiển thị).
    if (String(sh.getRange(row, colIndex + 1).getValues()[0][0]).trim() === text) return row;
  }
  return -1;
}

function findRowIndexByPk_(data, pkIndex, id) {
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][pkIndex]) === String(id)) return i;
  }
  return -1;
}

function generateId_(tableKey) {
  // V5.4.77: không đọc cả sheet để kiểm tra trùng; thời gian đến giây + 8 ký tự UUID đủ duy nhất.
  const cfg = TABLES[tableKey];
  const date = Utilities.formatDate(new Date(), APP_CONFIG.TIMEZONE, 'yyyyMMddHHmmss');
  return `${cfg.prefix}-${date}-${Utilities.getUuid().replace(/-/g, '').slice(0, 8).toUpperCase()}`;
}

function applyAutoFields_(rowObj, headers, isCreate) {
  const now = nowText_();
  if (isCreate && headers.indexOf('NGAY_TAO') >= 0 && !rowObj.NGAY_TAO) rowObj.NGAY_TAO = now;
  if (headers.indexOf('NGAY_CAP_NHAT') >= 0) rowObj.NGAY_CAP_NHAT = now;
  if (headers.indexOf('THANH_TIEN') >= 0 && (!rowObj.THANH_TIEN || rowObj.THANH_TIEN === '')) {
    const qty = toNumber_(rowObj.SO_LUONG || rowObj.SO_LUONG_THANH_LY || rowObj.SO_LUONG_CAP);
    const price = toNumber_(rowObj.DON_GIA || rowObj.DON_GIA_DU_KIEN || rowObj.GIA_THANH_LY);
    if (qty && price) rowObj.THANH_TIEN = qty * price;
  }
}

function normalizeWriteValue_(value) {
  if (value === undefined || value === null) return '';
  if (typeof value === 'number' || typeof value === 'boolean') return value;
  return String(value);
}

function nowText_() {
  return Utilities.formatDate(new Date(), APP_CONFIG.TIMEZONE, APP_CONFIG.DATETIME_FORMAT);
}

/**
 * V5.4.71 - Đọc số chấp nhận cả định dạng Việt Nam và quốc tế:
 * "1.500.000" = 1500000, "1,500,000" = 1500000, "1.5" = 1.5, "1,5" = 1.5,
 * "1.234,56" = 1234.56, "1,234.56" = 1234.56, "1.500.000 đ" = 1500000.
 */
function toNumber_(v) {
  if (v === null || v === undefined || v === '') return 0;
  if (typeof v === 'number') return isFinite(v) ? v : 0;
  let s = String(v).trim().replace(/[^\d.,-]/g, '');
  if (!s) return 0;
  const neg = s.indexOf('-') === 0;
  s = s.replace(/-/g, '');
  const lastDot = s.lastIndexOf('.'), lastComma = s.lastIndexOf(',');
  if (lastDot >= 0 && lastComma >= 0) {
    // Dấu xuất hiện sau cùng là dấu thập phân, dấu còn lại là phân cách hàng nghìn.
    if (lastDot > lastComma) s = s.replace(/,/g, '');
    else s = s.replace(/\./g, '').replace(',', '.');
  } else if (lastComma >= 0) {
    s = /^\d{1,3}(,\d{3})+$/.test(s) ? s.replace(/,/g, '') : s.replace(/,/g, '.');
  } else if (lastDot >= 0) {
    if (/^\d{1,3}(\.\d{3})+$/.test(s)) s = s.replace(/\./g, '');
  }
  if ((s.match(/\./g) || []).length > 1) return 0;
  const n = Number(s);
  return isFinite(n) ? (neg ? -n : n) : 0;
}

function countBy_(rows, field) {
  const m = {};
  rows.forEach(r => {
    const key = String(r[field] || 'Chưa có').trim() || 'Chưa có';
    m[key] = (m[key] || 0) + 1;
  });
  return Object.keys(m).map(k => ({ label:k, value:m[k] })).sort((a,b) => b.value - a.value);
}

function isDoneStatus_(status) {
  const s = String(status || '').toLowerCase();
  return s.indexOf('hoàn thành') >= 0 || s.indexOf('đã duyệt') >= 0 || s.indexOf('từ chối') >= 0 || s.indexOf('hủy') >= 0 || s.indexOf('đã mua') >= 0;
}

function postInventoryTransaction_(type, doc, docId) {
  const sh = getSheet_(SHEET.NHAP_XUAT_TON);
  const headers = getHeaders_(sh);
  const isOut = ['CAP_PHAT','THANH_LY'].indexOf(type) >= 0;
  const qty = getDocumentQtyByType_(type, doc);
  const unit = toNumber_(doc.DON_GIA || doc.GIA_THANH_LY || doc.DON_GIA_DU_KIEN || 0);
  const row = {
    ID_GIAO_DICH: generateId_('NHAP_XUAT_TON'),
    NGAY_GIAO_DICH: nowText_(),
    LOAI_GIAO_DICH: type,
    ID_CHUNG_TU: docId,
    ID_KHO: doc.ID_KHO || doc.ID_KHO_NHAP_LAI || '',
    ID_THIET_BI: doc.ID_THIET_BI || '',
    ID_DANH_MUC: doc.ID_DANH_MUC || '',
    MA_HANG: doc.MA_HANG || '',
    TEN_HANG: doc.TEN_HANG || doc.TEN_THIET_BI || '',
    LOAI_QUAN_LY: doc.LOAI_QUAN_LY || (doc.ID_THIET_BI ? 'THEO_TAI_SAN' : 'THEO_SO_LUONG'),
    DON_VI_TINH: doc.DON_VI_TINH || 'Cái',
    SO_LUONG_VAO: isOut ? 0 : qty,
    SO_LUONG_RA: isOut ? qty : 0,
    DON_GIA: unit,
    THANH_TIEN: qty * unit,
    TON_SAU_GIAO_DICH: '',
    ID_TAI_KHOAN_THUC_HIEN: doc.ID_TAI_KHOAN_NHAP || doc.ID_TAI_KHOAN_CAP_PHAT || doc.ID_TAI_KHOAN_THU_HOI || doc.ID_TAI_KHOAN_THANH_LY || doc.ID_TAI_KHOAN || '',
    GHI_CHU: doc.GHI_CHU || '',
    NGAY_TAO: nowText_()
  };
  sh.appendRow(headers.map(h => normalizeWriteValue_(row[h])));
}

function getDocumentQtyByType_(type, doc) {
  if (type === 'CAP_PHAT') return toNumber_(doc.SO_LUONG_CAP || doc.SO_LUONG || 1);
  if (type === 'THU_HOI') return toNumber_(doc.SO_LUONG_THU_HOI || doc.SO_LUONG || 1);
  if (type === 'THANH_LY') return toNumber_(doc.SO_LUONG_THANH_LY || doc.SO_LUONG || 1);
  return toNumber_(doc.SO_LUONG || 1);
}


function makeStockKey_(g) {
  if (!g.ID_KHO) return '';
  if (g.ID_THIET_BI) return [g.ID_KHO, g.ID_THIET_BI].join('|');
  return [g.ID_KHO, g.ID_DANH_MUC, g.MA_HANG || g.TEN_HANG].join('|');
}

function normalizeWarehouseDocument_(tableKey, rowObj, headers) {
  if (!isInventoryRelatedSheet_(tableKey)) return;
  if (headers.indexOf('DON_VI_TINH') >= 0 && !rowObj.DON_VI_TINH) rowObj.DON_VI_TINH = 'Cái';
  if (headers.indexOf('LOAI_QUAN_LY') >= 0 && !rowObj.LOAI_QUAN_LY) rowObj.LOAI_QUAN_LY = rowObj.ID_THIET_BI ? 'THEO_TAI_SAN' : 'THEO_SO_LUONG';
  if (headers.indexOf('TRANG_THAI') >= 0 && !rowObj.TRANG_THAI) rowObj.TRANG_THAI = defaultWarehouseStatus_(tableKey);
  if (tableKey === 'KHO_NHAP' && headers.indexOf('SO_PHIEU_NHAP') >= 0 && !rowObj.SO_PHIEU_NHAP) rowObj.SO_PHIEU_NHAP = nextDocumentNo_('NK');
  if (tableKey === 'THANH_LY_THIET_BI' && headers.indexOf('SO_PHIEU_THANH_LY') >= 0 && !rowObj.SO_PHIEU_THANH_LY) rowObj.SO_PHIEU_THANH_LY = nextDocumentNo_('TL');
  if (headers.indexOf('SO_LUONG') >= 0 && !rowObj.SO_LUONG) rowObj.SO_LUONG = 1;
  if (headers.indexOf('SO_LUONG_CAP') >= 0 && !rowObj.SO_LUONG_CAP) rowObj.SO_LUONG_CAP = 1;
  if (headers.indexOf('SO_LUONG_THU_HOI') >= 0 && !rowObj.SO_LUONG_THU_HOI) rowObj.SO_LUONG_THU_HOI = 1;
  if (headers.indexOf('SO_LUONG_THANH_LY') >= 0 && !rowObj.SO_LUONG_THANH_LY) rowObj.SO_LUONG_THANH_LY = 1;
  if (headers.indexOf('THANH_TIEN_THANH_LY') >= 0 && !rowObj.THANH_TIEN_THANH_LY) {
    rowObj.THANH_TIEN_THANH_LY = toNumber_(rowObj.SO_LUONG_THANH_LY) * toNumber_(rowObj.GIA_THANH_LY);
  }
}

function defaultWarehouseStatus_(tableKey) {
  if (tableKey === 'KHO_NHAP') return 'Đã nhập';
  if (tableKey === 'THU_HOI_THIET_BI') return 'Hoàn thành';
  if (tableKey === 'THANH_LY_THIET_BI') return 'Hoàn thành';
  return 'Hoạt động';
}

function isInventoryRelatedSheet_(tableKey) {
  return ['DANH_MUC_KHO','KHO_NHAP','KHO_TON','NHAP_XUAT_TON','THU_HOI_THIET_BI','THANH_LY_THIET_BI'].indexOf(tableKey) >= 0;
}

function isInventorySheet_(tableKey) {
  return ['KHO_NHAP','THU_HOI_THIET_BI','THANH_LY_THIET_BI'].indexOf(tableKey) >= 0;
}

function shouldPostInventory_(tableKey, row) {
  const s = String(row.TRANG_THAI || '').toLowerCase();
  if (s.indexOf('hủy') >= 0 || s.indexOf('nháp') >= 0 || s.indexOf('chờ') >= 0) return false;
  if (tableKey === 'KHO_NHAP') return s.indexOf('đã nhập') >= 0 || s.indexOf('hoàn') >= 0;
  if (tableKey === 'THU_HOI_THIET_BI') return s.indexOf('hoàn') >= 0 || s.indexOf('đã thu') >= 0 || String(row.TRANG_THAI_NHAP_KHO || '').toLowerCase().indexOf('đã') >= 0;
  if (tableKey === 'THANH_LY_THIET_BI') return s.indexOf('hoàn') >= 0 || s.indexOf('đã thanh') >= 0;
  return false;
}

function inventoryTypeForTable_(tableKey) {
  if (tableKey === 'KHO_NHAP') return 'NHAP';
  if (tableKey === 'THU_HOI_THIET_BI') return 'THU_HOI';
  if (tableKey === 'THANH_LY_THIET_BI') return 'THANH_LY';
  return '';
}

function syncInventoryForDocument_(tableKey, rowObj) {
  if (!isInventorySheet_(tableKey)) return;
  if (!legacyInventoryEnabledV5470_()) return;
  const cfg = TABLES[tableKey];
  const docId = rowObj[cfg.pk];
  if (!docId) return;

  // Cập nhật giao dịch theo kiểu idempotent: xóa giao dịch cũ của chứng từ rồi ghi lại nếu trạng thái hợp lệ.
  deleteInventoryTransactionsByDoc_(docId);
  rebuildStockV53_(false);

  if (!shouldPostInventory_(tableKey, rowObj)) return;

  const type = inventoryTypeForTable_(tableKey);
  const qty = getDocumentQty_(tableKey, rowObj);
  if (qty <= 0) throw new Error('Số lượng phải lớn hơn 0.');

  if (['CAP_PHAT','THANH_LY'].indexOf(type) >= 0) {
    validateStockAvailable_(rowObj, qty);
  }

  postInventoryTransaction_(type, rowObj, docId);
  rebuildStockV53_(false);
}

function getDocumentQty_(tableKey, row) {
  if (tableKey === 'THU_HOI_THIET_BI') return toNumber_(row.SO_LUONG_THU_HOI || row.SO_LUONG || 1);
  if (tableKey === 'THANH_LY_THIET_BI') return toNumber_(row.SO_LUONG_THANH_LY || row.SO_LUONG || 1);
  return toNumber_(row.SO_LUONG || 1);
}

function validateStockAvailable_(row, qty) {
  const key = makeStockKey_({
    ID_KHO: row.ID_KHO || '',
    ID_THIET_BI: row.ID_THIET_BI || '',
    ID_DANH_MUC: row.ID_DANH_MUC || '',
    MA_HANG: row.MA_HANG || '',
    TEN_HANG: row.TEN_HANG || row.TEN_THIET_BI || ''
  });
  const stock = readTable_('KHO_TON').rows;
  const found = stock.find(r => makeStockKey_(r) === key);
  const remain = found ? toNumber_(found.SO_LUONG_TON) : 0;
  if (remain < qty) {
    throw new Error('Tồn kho không đủ. Hiện còn ' + remain + ', yêu cầu xuất ' + qty + '.');
  }
}

function deleteInventoryTransactionsByDoc_(docId) {
  if (!docId) return 0;
  const sh = getSheet_(SHEET.NHAP_XUAT_TON);
  const headers = getHeaders_(sh);
  const idIdx = headers.indexOf('ID_CHUNG_TU');
  if (idIdx < 0 || sh.getLastRow() < 2) return 0;
  const values = sh.getRange(2, 1, sh.getLastRow() - 1, headers.length).getValues();
  let deleted = 0;
  for (let i = values.length - 1; i >= 0; i--) {
    if (String(values[i][idIdx]) === String(docId)) {
      sh.deleteRow(i + 2);
      deleted++;
    }
  }
  return deleted;
}

function findNaturalKey_(tableKey, rowObj) {
  const candidates = {
    THIET_BI: 'MA_THIET_BI',
    KHO_NHAP: 'SO_PHIEU_NHAP',
    THANH_LY_THIET_BI: 'SO_PHIEU_THANH_LY',
    DE_XUAT_MUA_THIET_BI: 'MA_PHIEU',
    DE_XUAT_THANH_LY: 'MA_PHIEU'
  };
  const field = candidates[tableKey];
  if (!field || !rowObj[field]) return null;
  return { field, value: rowObj[field] };
}

function isDuplicateNaturalKey_(tableKey, rowObj) {
  const nk = findNaturalKey_(tableKey, rowObj);
  if (!nk) return false;
  const cfg = TABLES[tableKey];
  const sh = getSheet_(cfg.sheet);
  return findSheetRowByValueV5477_(sh, getHeaders_(sh).indexOf(nk.field), nk.value) > 1;
}

function findRowIndexByField_(data, headers, field, value) {
  const idx = headers.indexOf(field);
  if (idx < 0 || !value) return -1;
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][idx]) === String(value)) return i;
  }
  return -1;
}

function nextDocumentNo_(prefix) {
  return prefix + '-' + Utilities.formatDate(new Date(), APP_CONFIG.TIMEZONE, 'yyyyMMdd-HHmmss');
}


function writeSystemLog_(action, sheetName, recordId, note) {
  try {
    const sh = getSheet_(SHEET.NHAT_KY_HE_THONG);
    const headers = getHeaders_(sh);
    const row = {};
    row.ID_LOG = 'LOG-' + Utilities.formatDate(new Date(), APP_CONFIG.TIMEZONE, 'yyyyMMddHHmmss') + '-' + Utilities.getUuid().slice(0,5).toUpperCase();
    row.ID_NHAT_KY = row.ID_LOG;
    row.THOI_GIAN = nowText_();
    row.NGAY_TAO = nowText_();
    row.HANH_DONG = action;
    row.SHEET_NAME = sheetName;
    row.CHUC_NANG = sheetName;
    row.DOI_TUONG = sheetName;
    row.ID_BAN_GHI = recordId;
    row.ID_DOI_TUONG = recordId;
    row.NOI_DUNG = note || '';
    row.KET_QUA = 'OK';
    row.GHI_CHU = note || '';
    sh.appendRow(headers.map(h => normalizeWriteValue_(row[h])));
    memoForgetSheetV5477_(SHEET.NHAT_KY_HE_THONG);
  } catch (err) {
    console.warn('Không ghi được nhật ký:', err);
  }
}


/** =========================================================
 * V5.3.13 - COMPATIBILITY LAYER FOR NEW FULL UI TEMPLATE
 * Giao diện mới gọi các hàm V20/V22/V64/V82.
 * Lớp này giữ backend Google Sheets hiện tại và trả dữ liệu an toàn.
 * ========================================================= */

function legacyV22NoLogin(fn,args,authToken) {
  args=Array.isArray(args)?args:[];
  authToken=authTokenFromArgsV5470_(arguments,authIsTokenArgV5470_(authToken)?authToken:String(authToken||''));
  args=authStripArgsV5470_(args);
  const apiName=String(fn||'');
  if(apiName==='getPageBundleV64')args=[args[0],args[1],authToken];
  else if(apiName==='getPageBundleV20')args=[args[0],authToken];
  else if(apiName==='getCorePageBundleV82')args=[args[0],args[1],authToken];
  else if(['saveUiFormV19','saveUiFormV20','saveUiFormV22','saveUniversalEditV26'].indexOf(apiName)>=0)args=[Object.assign({},args[0]||{},{authToken:authToken})];
  else if(apiName==='saveRolePermissions')args=[args[0],args[1],authToken];
  else if(apiName==='resetPermissionDataV5466'||apiName==='resetAccountPermissionDataV5463')args=[args[0],authToken];
  else if(apiName==='saveUserAccount'||apiName==='saveRoleRecord'||apiName==='saveSystemConfigV549'||apiName==='saveEmailAlertConfig')args=[args[0],authToken];
  else if(apiName==='getEmailAlertConfig'||apiName==='getSystemConfigV549')args=[authToken];
  else if(apiName==='runMaintenanceDataAuditV78'||apiName==='runMaintenanceDataRepairV79')args=[args[0],authToken];
  const api={
    getCoreBootstrapData:getCoreBootstrapData,
    getCorePageBundleV82:getCorePageBundleV82,getPageBundleV20:getPageBundleV20,getPageBundleV64:getPageBundleV64,
    saveUiFormV19:saveUiFormV19,saveUiFormV20:saveUiFormV20,
    saveUiFormV22:saveUiFormV22,saveUniversalEditV26:saveUniversalEditV26,approveProposal:approveProposal,
    getEmailAlertConfig:getEmailAlertConfig,saveEmailAlertConfig:saveEmailAlertConfig,saveRolePermissions:saveRolePermissions,
    runMaintenanceDataAuditV78:runMaintenanceDataAuditV78,runMaintenanceDataRepairV79:runMaintenanceDataRepairV79,
    getCamNangPageDataV865:getCamNangPageDataV865,
    setupCamNangSheetV865:setupCamNangSheetV865,
    setupCamNangSheet:setupCamNangSheet,
    saveCamNangRecordV865:saveCamNangRecordV865,
    updateCamNangRecordV865:updateCamNangRecordV865,
    getCamNangPageData:getCamNangPageData,
    saveCamNangRecord:saveCamNangRecord,
    updateCamNangRecord:updateCamNangRecord,
    uploadCamNangImageV865:uploadCamNangImageV865,
    uploadCamNangImage:uploadCamNangImage,
    getDevicePageDataV5443:getDevicePageDataV5443,
    getWindowsLicenseFullV5463:getWindowsLicenseFullV5463,
    resetAccountPermissionDataV5463:resetAccountPermissionDataV5463,
    resetPermissionDataV5466:resetPermissionDataV5466,
    saveUserAccount:saveUserAccount,
    saveRoleRecord:saveRoleRecord,
    saveDeviceRecordV543:saveDeviceRecordV543,
    getProposalPrintDataV548:getProposalPrintDataV548,
    exportProposalFileV8414:exportProposalFileV8414,
    runBackendSmokeTestV5410:runBackendSmokeTestV5410
  };
  const target=api[String(fn||'')];
  if(typeof target!=='function')throw new Error('API không được phép: '+fn);
  if(authToken)args=args.concat([{__authToken__:authToken}]);
  return target.apply(null,args);
}

function authNormalizeV5467_(value){return String(value||'').trim().toLowerCase();}
function authRoleNameV5467_(roleId){
  const role=safeReadRowsV513_('VAI_TRO').find(function(r){return String(r.ID_VAI_TRO||r.ID||'')===String(roleId||'');});
  return role?String(role.TEN_VAI_TRO||role.TEN||roleId||''):String(roleId||'');
}
function authIsAdminV5467_(roleId,roleName){
  const n=String(roleName||'').trim().toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/Đ/g,'D');
  return String(roleId||'')==='VR0001'||n==='ADMIN'||n==='QUAN TRI'||n==='QUAN TRI HE THONG';
}
function authIsRetiredSuperRoleV5467_(role){
  const roleId=String(role&& (role.ID_VAI_TRO||role.ID) ||'').trim();
  const roleName=String(role&&(role.TEN_VAI_TRO||role.TEN||role.VAI_TRO)||'').trim().toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/Đ/g,'D');
  return roleId==='VR0004'||roleName==='SUPER ADMIN';
}
function authActiveRoleRowsV5467_(){return safeReadRowsV513_('VAI_TRO').filter(function(role){return !authIsRetiredSuperRoleV5467_(role);});}
const AUTH_ADMIN_ONLY_PAGES_V5467_=Object.freeze(['users','roles','permissions','systemAudit','systemConfig','emailConfig','maintenanceDataTool']);
/* =========================================================
 * V5.4.70 - BẮT BUỘC ĐĂNG NHẬP Ở SERVER
 * Mọi hàm public mà giao diện gọi qua google.script.run đều phải có phiên hợp lệ.
 * Client (script philongAuthRunnerV5470 trong index.html) tự gắn {__authToken__:token}
 * vào cuối danh sách tham số của mọi lời gọi server.
 * ========================================================= */
const AUTH_ARG_KEY_V5470_='__authToken__';
var AUTH_TRUSTED_CONTEXT_V5470_=false;
/* V5.4.75: client gửi token dạng CHUỖI 'PLAUTH_V5475:<token>' ở cuối tham số
   (Apps Script không truyền nguyên vẹn object có key bắt đầu bằng '__').
   Object {__authToken__} vẫn được chấp nhận cho lời gọi nội bộ server. */
const AUTH_ARG_PREFIX_V5475_='PLAUTH_V5475:';
function authIsTokenArgV5470_(v){
  if(typeof v==='string')return v.indexOf(AUTH_ARG_PREFIX_V5475_)===0;
  return !!v&&typeof v==='object'&&!Array.isArray(v)&&typeof v[AUTH_ARG_KEY_V5470_]==='string';
}
function authTokenArgValueV5475_(v){return typeof v==='string'?v.slice(AUTH_ARG_PREFIX_V5475_.length):v[AUTH_ARG_KEY_V5470_];}
/** Lấy token: ưu tiên tham số tường minh (chuỗi token hoặc tham số token), sau đó tìm trong arguments. */
function authTokenFromArgsV5470_(args,explicit){
  if(authIsTokenArgV5470_(explicit))return authTokenArgValueV5475_(explicit);
  if(typeof explicit==='string'&&explicit)return explicit;
  for(var i=(args?args.length:0)-1;i>=0;i--){if(authIsTokenArgV5470_(args[i]))return authTokenArgValueV5475_(args[i]);}
  return '';
}
function authStripArgsV5470_(args){return Array.prototype.filter.call(args||[],function(v){return !authIsTokenArgV5470_(v);});}
function authRequireUserV5470_(authToken){
  if(AUTH_TRUSTED_CONTEXT_V5470_)return {id:'SYSTEM',email:'',name:'SYSTEM',isAdmin:true};
  var status=getLoginStatusV5467(authTokenFromArgsV5470_(null,authToken));
  if(!status||!status.authenticated)throw new Error('Phiên đăng nhập đã hết hạn hoặc chưa đăng nhập. Vui lòng đăng nhập lại.');
  return status.user;
}
/** Chủ sở hữu script chạy trực tiếp trong trình soạn Apps Script (không qua Web App của người khác). */
function authIsScriptOwnerV5470_(){
  try{var a=String(Session.getActiveUser().getEmail()||'').toLowerCase(),e=String(Session.getEffectiveUser().getEmail()||'').toLowerCase();return !!a&&a===e;}catch(err){return false;}
}
function authCallUserV5470_(impl,args){
  authRequireUserV5470_(authTokenFromArgsV5470_(args));
  return impl.apply(null,authStripArgsV5470_(args));
}
function authCallAdminOrOwnerV5470_(impl,args){
  if(!AUTH_TRUSTED_CONTEXT_V5470_&&!authIsScriptOwnerV5470_())authAssertSystemAdminV5467_(authTokenFromArgsV5470_(args));
  return impl.apply(null,authStripArgsV5470_(args));
}
/** Chạy fn trong ngữ cảnh hệ thống tin cậy (chỉ dùng cho công cụ quản trị đã qua kiểm tra quyền). */
function authRunTrustedV5470_(fn){
  var prev=AUTH_TRUSTED_CONTEXT_V5470_;AUTH_TRUSTED_CONTEXT_V5470_=true;
  try{return fn();}finally{AUTH_TRUSTED_CONTEXT_V5470_=prev;}
}
/* =========================================================
 * V5.4.71 - PHÂN QUYỀN THEO CHỨC NĂNG (bảng PHAN_QUYEN), CHỐNG DÒ MẬT KHẨU, KHÓA GHI
 * - Admin luôn đủ quyền. Vai trò khác theo ma trận PHAN_QUYEN (ID_VAI_TRO x CHUC_NANG x XEM/THEM/SUA/XOA/DUYET/XUAT_FILE).
 * - Tắt tạm kiểm tra quyền (không khuyến nghị): Script property RBAC_ENFORCE = false.
 * ========================================================= */
const RBAC_ACTION_LABEL_V5471_=Object.freeze({XEM:'xem',THEM:'thêm mới',SUA:'sửa',XOA:'xóa',DUYET:'duyệt',XUAT_FILE:'in / xuất file'});
const RBAC_MODULE_LABEL_V5471_=Object.freeze({THIET_BI:'Thiết bị',KHO_NHAP_XUAT_TON:'Kho nhập - xuất - tồn',THU_HOI_THANH_LY:'Thu hồi / Thanh lý',DE_XUAT_QUAN_LY:'Quản lý đề xuất',DE_XUAT_MUA_XUAT:'Đề xuất mua / xuất dùng',DE_XUAT_SUA_CHUA:'Đề xuất sửa chữa',DE_XUAT_THANH_LY:'Đề xuất thanh lý',DANH_MUC_THIET_BI:'Danh mục thiết bị',PHONG_BAN:'Phòng ban',CO_SO_TANG:'Cơ sở / Tầng',DANH_MUC_KHO:'Danh mục kho',NHAN_VIEN:'Nhân viên',TAI_KHOAN:'Tài khoản',PHAN_QUYEN:'Phân quyền',VAI_TRO:'Vai trò'});
const RBAC_PAGE_MODULE_V5471_=Object.freeze({
  equipment:'THIET_BI',warehouseDevice:'KHO_NHAP_XUAT_TON',materialWarehouse:'KHO_NHAP_XUAT_TON',allocation:'KHO_NHAP_XUAT_TON',
  recovery:'THU_HOI_THANH_LY',disposal:'THU_HOI_THANH_LY',maintenance:'DE_XUAT_SUA_CHUA',maintenanceLog:'DE_XUAT_SUA_CHUA',maintenancePlan:'DE_XUAT_SUA_CHUA',
  employees:'NHAN_VIEN',departments:'PHONG_BAN',locations:'CO_SO_TANG',floors:'CO_SO_TANG',buildingAreas:'CO_SO_TANG',
  warehouses:'DANH_MUC_KHO',maintenanceItems:'DANH_MUC_THIET_BI',users:'TAI_KHOAN',roles:'VAI_TRO',permissions:'PHAN_QUYEN'
});
function rbacEnforcedV5471_(){return String(PropertiesService.getScriptProperties().getProperty('RBAC_ENFORCE')||'true').trim().toLowerCase()!=='false';}
function authPermissionEnabledV5471_(value){
  var text=String(value==null?'':value).trim().toUpperCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/Đ/g,'D');
  return value===true||text==='TRUE'||text==='1'||text==='CO'||text==='YES'||text==='X';
}
function authHasPermissionV5471_(user,module,action){
  if(!module||AUTH_TRUSTED_CONTEXT_V5470_)return true;
  if(user&&user.isAdmin)return true;
  if(!rbacEnforcedV5471_())return true;
  var roleId=String(user&&user.roleId||''),key=String(action||'XEM').toUpperCase();
  var row=rbacMapV5477_()[roleId+'|'+module];
  return !!row&&row.indexOf(key)>=0;
}
/** V5.4.77: ma trận PHAN_QUYEN gọn {'ROLE|MODULE':['XEM','THEM',...]} lưu cache 10 phút; xóa ngay khi sửa quyền. */
function rbacMapV5477_(){
  var cache=CacheService.getScriptCache();
  try{var raw=cache.get('V5477_RBAC');if(raw)return JSON.parse(raw);}catch(e){}
  var map={};
  safeReadRowsV513_('PHAN_QUYEN').forEach(function(r){
    var k=String(r.ID_VAI_TRO||'')+'|'+String(r.CHUC_NANG||r.MODULE||'').trim().toUpperCase();
    map[k]=['XEM','THEM','SUA','XOA','DUYET','XUAT_FILE'].filter(function(a){return authPermissionEnabledV5471_(r[a]);});
  });
  try{cache.put('V5477_RBAC',JSON.stringify(map),600);}catch(e){}
  return map;
}
function rbacCacheClearV5477_(){try{CacheService.getScriptCache().remove('V5477_RBAC');}catch(e){}}
function authAssertPermissionV5471_(user,module,action){
  if(authHasPermissionV5471_(user,module,action))return true;
  throw new Error('Bạn không có quyền '+(RBAC_ACTION_LABEL_V5471_[action]||'thực hiện thao tác')+' ở mục '+(RBAC_MODULE_LABEL_V5471_[module]||module)+'. Liên hệ Admin để được cấp quyền.');
}
/** Gọi impl sau khi kiểm tra đăng nhập + quyền. action có thể là hàm(args) trả về mã quyền. */
function authCallPermV5471_(module,action,impl,args){
  var user=authRequireUserV5470_(authTokenFromArgsV5470_(args)),clean=authStripArgsV5470_(args);
  var mod=typeof module==='function'?module.apply(null,clean):module,act=typeof action==='function'?action.apply(null,clean):action;
  authAssertPermissionV5471_(user,mod,act);
  return impl.apply(null,clean);
}
/** So sánh chuỗi không dừng sớm (giảm rò rỉ thời gian khi so mật khẩu). */
function authSafeEqualV5471_(a,b){
  a=String(a==null?'':a);b=String(b==null?'':b);
  if(a.length!==b.length)return false;
  var diff=0;for(var i=0;i<a.length;i++)diff|=a.charCodeAt(i)^b.charCodeAt(i);
  return diff===0;
}
/** Khóa ghi toàn script cho các thao tác "đọc rồi ghi" (sinh mã, kiểm tra tồn). */
function withScriptLockV5471_(fn){
  var lock=LockService.getScriptLock();
  if(!lock.tryLock(30000))throw new Error('Hệ thống đang bận ghi dữ liệu. Vui lòng thử lại sau vài giây.');
  try{resetReadMemoV5433_();return fn();}finally{lock.releaseLock();}
}
/* Chống dò mật khẩu: tối đa 5 lần sai / 15 phút cho mỗi email. */
const AUTH_MAX_FAILS_V5471_=5,AUTH_FAIL_WINDOW_V5471_=15*60;
function authFailKeyV5471_(kind,email){return 'AUTH_'+kind+'_V5471_'+Utilities.base64EncodeWebSafe(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256,authNormalizeV5467_(email),Utilities.Charset.UTF_8)).slice(0,40);}
function authFailCountV5471_(kind,email){return Number(CacheService.getScriptCache().get(authFailKeyV5471_(kind,email))||0);}
function authFailBumpV5471_(kind,email){var c=CacheService.getScriptCache(),k=authFailKeyV5471_(kind,email),n=Number(c.get(k)||0)+1;c.put(k,String(n),AUTH_FAIL_WINDOW_V5471_);return n;}
function authFailClearV5471_(kind,email){CacheService.getScriptCache().remove(authFailKeyV5471_(kind,email));}
function authAssertSystemAdminV5467_(authToken){
  if(AUTH_TRUSTED_CONTEXT_V5470_)return true;
  const status=getLoginStatusV5467(authTokenFromArgsV5470_(null,authToken));
  if(!status||!status.authenticated)throw new Error('Phiên đăng nhập không hợp lệ.');
  const account=authFindAccountV5467_(status.user&&status.user.email),roleName=account?authRoleNameV5467_(account.ID_VAI_TRO):'';
  if(!account||!authIsAdminV5467_(account.ID_VAI_TRO,roleName))throw new Error('Bạn không có quyền truy cập mục Hệ thống.');
  return true;
}
function authAssertPageAccessV5467_(page,authToken,action){
  page=String(page||'').trim();
  const user=authRequireUserV5470_(authToken);
  if(AUTH_ADMIN_ONLY_PAGES_V5467_.indexOf(page)>=0)return authAssertSystemAdminV5467_(authToken);
  return authAssertPermissionV5471_(user,RBAC_PAGE_MODULE_V5471_[page]||'',action||'XEM');
}
function authPepperV5467_(){
  const p=PropertiesService.getScriptProperties();let value=p.getProperty('AUTH_PEPPER_V5467');
  if(!value){value=Utilities.getUuid()+Utilities.getUuid();p.setProperty('AUTH_PEPPER_V5467',value);}
  return value;
}
function authHashV5467_(password,salt){
  const bytes=Utilities.computeHmacSha256Signature(String(password||''),String(salt||'')+'|'+authPepperV5467_());
  return Utilities.base64Encode(bytes);
}
function authSafeUserV5467_(account){
  const roleName=authRoleNameV5467_(account.ID_VAI_TRO),employee=safeReadRowsV513_('NHAN_SU').find(function(r){return String(r.ID_NHAN_SU||r.ID||'')===String(account.ID_NHAN_SU||'');});
  return {
    id:String(account.ID_TAI_KHOAN||account.ID||''),email:String(account.EMAIL||''),employeeId:String(account.ID_NHAN_SU||''),
    employeeCode:String(employee&&(employee.MA_NHAN_VIEN||'')||''),name:String(employee&&(employee.HO_TEN||employee.TEN_NHAN_VIEN)||account.EMAIL||''),
    phone:String(employee&&(employee.SO_DIEN_THOAI||employee.DIEN_THOAI||'')||''),title:String(employee&&(employee.CHUC_VU||'')||''),
    departmentId:String(employee&&(employee.ID_PHONG_BAN||'')||''),photo:String(employee&&(employee.HINH_ANH||employee.ANH_DAI_DIEN||employee.AVATAR||employee.HINH_ANH_URL||'')||''),
    roleId:String(account.ID_VAI_TRO||''),roleName:roleName,isAdmin:authIsAdminV5467_(account.ID_VAI_TRO,roleName)
  };
}
function authFindAccountV5467_(email){
  const wanted=authNormalizeV5467_(email);if(!wanted)return null;
  return safeReadRowsV513_('TAI_KHOAN').find(function(r){return authNormalizeV5467_(r.EMAIL||r.EMAIL_DANG_NHAP)===wanted;})||null;
}
const AUTH_RESET_TTL_V5467_=15*60;
function authResetCacheKeyV5467_(token){return 'AUTH_RESET_V5467_'+Utilities.base64EncodeWebSafe(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256,String(token||''),Utilities.Charset.UTF_8)).slice(0,48);}
function authResetPayloadV5467_(token){
  token=String(token||'').trim();if(!token)return null;
  const raw=CacheService.getScriptCache().get(authResetCacheKeyV5467_(token));if(!raw)return null;
  try{return JSON.parse(raw)||null}catch(e){return null;}
}
function authValidPasswordV5467_(password){
  password=String(password||'');
  return password.length>=8&&/[A-Z]/.test(password)&&/[a-z]/.test(password)&&/[0-9]/.test(password);
}
function authEmailHtmlV5467_(value){return String(value||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');}
function requestPasswordResetV5467(email){
  email=authNormalizeV5467_(email);
  if(!email||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))throw new Error('Vui lòng nhập email hợp lệ.');
  const generic={ok:true,message:'Nếu email tồn tại, liên kết đặt lại mật khẩu đã được gửi. Vui lòng kiểm tra hộp thư.'};
  // Giới hạn 3 email đặt lại mật khẩu / 15 phút cho mỗi địa chỉ.
  if(authFailBumpV5471_('RESET',email)>3)return generic;
  const account=authFindAccountV5467_(email);if(!account)return generic;
  const status=String(account.TRANG_THAI||'').toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/Đ/g,'D');
  if(status.includes('KHOA')||status.includes('NGUNG'))return generic;
  const recipient=String(account.EMAIL||email).trim();if(!recipient)return generic;
  const token=Utilities.getUuid().replace(/-/g,'')+Utilities.getUuid().replace(/-/g,'');
  CacheService.getScriptCache().put(authResetCacheKeyV5467_(token),JSON.stringify({email:recipient,accountId:String(account.ID_TAI_KHOAN||account.ID||''),issuedAt:Date.now()}),AUTH_RESET_TTL_V5467_);
  const webAppUrl=ScriptApp.getService().getUrl();
  if(!webAppUrl){CacheService.getScriptCache().remove(authResetCacheKeyV5467_(token));throw new Error('Chưa xác định được địa chỉ Web App để tạo liên kết đặt lại mật khẩu.');}
  const resetUrl=webAppUrl+(webAppUrl.indexOf('?')>=0?'&':'?')+'resetToken='+encodeURIComponent(token);
  const safeName=authEmailHtmlV5467_(account.EMAIL||email);
  const subject='PHI LONG - Đặt lại mật khẩu';
  const body='Xin chào,\n\nHệ thống PHI LONG đã nhận yêu cầu đặt lại mật khẩu cho tài khoản '+(account.EMAIL||email)+'.\n\nMở liên kết sau trong vòng 15 phút để tạo mật khẩu mới:\n'+resetUrl+'\n\nNếu anh/chị không yêu cầu, hãy bỏ qua email này.';
  const html='<div style="font-family:Arial,sans-serif;color:#172033;line-height:1.55"><p>Xin chào <b>'+safeName+'</b>,</p><p>Hệ thống PHI LONG đã nhận yêu cầu đặt lại mật khẩu.</p><p><a href="'+authEmailHtmlV5467_(resetUrl)+'" style="display:inline-block;padding:11px 16px;border-radius:8px;background:#a71936;color:#fff;text-decoration:none;font-weight:bold">Đặt lại mật khẩu</a></p><p>Liên kết có hiệu lực trong <b>15 phút</b> và chỉ sử dụng một lần.</p><p>Nếu anh/chị không yêu cầu, hãy bỏ qua email này.</p></div>';
  MailApp.sendEmail({to:recipient,subject:subject,body:body,htmlBody:html});
  writeSystemLog_('REQUEST_PASSWORD_RESET',SHEET.TAI_KHOAN,account.ID_TAI_KHOAN||account.ID||'',recipient);
  return generic;
}
function getPasswordResetContextV5467(token){
  const payload=authResetPayloadV5467_(token);return {ok:true,valid:!!payload};
}
function resetPasswordV5467(token,newPassword){
  token=String(token||'').trim();const payload=authResetPayloadV5467_(token);if(!payload)throw new Error('Liên kết đặt lại mật khẩu đã hết hạn hoặc đã được sử dụng.');
  if(!authValidPasswordV5467_(newPassword))throw new Error('Mật khẩu mới phải từ 8 ký tự, có chữ hoa, chữ thường và số.');
  const account=authFindAccountV5467_(payload.email);if(!account||String(account.ID_TAI_KHOAN||account.ID||'')!==String(payload.accountId||''))throw new Error('Không tìm thấy tài khoản để đặt lại mật khẩu.');
  const status=String(account.TRANG_THAI||'').toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/Đ/g,'D');
  if(status.includes('KHOA')||status.includes('NGUNG'))throw new Error('Tài khoản đã bị khóa hoặc ngừng hoạt động.');
  authWritePasswordV5467_(account,newPassword);CacheService.getScriptCache().remove(authResetCacheKeyV5467_(token));writeSystemLog_('RESET_PASSWORD',SHEET.TAI_KHOAN,account.ID_TAI_KHOAN||account.ID||'','Đặt lại mật khẩu qua email');return {ok:true};
}
function authWritePasswordV5467_(account,password){
  const sh=getSheet_(SHEET.TAI_KHOAN),headers=getHeaders_(sh),data=sh.getDataRange().getValues(),idCol=headers.indexOf('ID_TAI_KHOAN'),emailCol=headers.indexOf('EMAIL');let rowIndex=-1;
  for(let i=1;i<data.length;i++){if((idCol>=0&&String(data[i][idCol])===String(account.ID_TAI_KHOAN||account.ID||''))||(emailCol>=0&&authNormalizeV5467_(data[i][emailCol])===authNormalizeV5467_(account.EMAIL))){rowIndex=i;break;}}
  if(rowIndex<1)throw new Error('Không tìm thấy tài khoản để cập nhật mật khẩu.');
  const salt=Utilities.getUuid().replace(/-/g,'')+Utilities.getUuid().replace(/-/g,''),hash=authHashV5467_(password,salt),now=nowText_(),row=rowArrayToObject_(headers,data[rowIndex]);
  row.MAT_KHAU_SALT=salt;row.MAT_KHAU_HASH=hash;row.MAT_KHAU_CAP_NHAT_LUC=now;if(headers.indexOf('NGAY_CAP_NHAT')>=0)row.NGAY_CAP_NHAT=now;
  sh.getRange(rowIndex+1,1,1,headers.length).setValues([headers.map(function(h){return normalizeWriteValue_(row[h]);})]);
  account.MAT_KHAU_SALT=salt;account.MAT_KHAU_HASH=hash;account.MAT_KHAU_CAP_NHAT_LUC=now;return account;
}
function authVerifyPasswordV5467_(account,password){return !!account&&!!account.MAT_KHAU_HASH&&authHashV5467_(password,account.MAT_KHAU_SALT)===String(account.MAT_KHAU_HASH);}
function authSessionKeyV5467_(token){return 'AUTH_V5467_'+Utilities.base64EncodeWebSafe(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256,String(token||''),Utilities.Charset.UTF_8)).slice(0,38);}
function authCreateSessionV5467_(account){
  const token=Utilities.getUuid().replace(/-/g,'')+Utilities.getUuid().replace(/-/g,''),user=authSafeUserV5467_(account),session={user:user,createdAt:Date.now(),refreshedAt:Date.now()};
  CacheService.getScriptCache().put(authSessionKeyV5467_(token),JSON.stringify(session),21600);return {token:token,user:user};
}
const AUTH_SESSION_REFRESH_MS_V5477_=5*60*1000;
function getLoginStatusV5467(token){
  if(authIsTokenArgV5470_(token))token=authTokenArgValueV5475_(token);
  token=String(token||'');if(!token)return {ok:true,authenticated:false};
  const raw=CacheService.getScriptCache().get(authSessionKeyV5467_(token));if(!raw)return {ok:true,authenticated:false,expired:true};
  try{
    const session=JSON.parse(raw);
    // V5.4.77: dùng thông tin người dùng lưu trong phiên; chỉ đọc lại TAI_KHOAN/NHAN_SU/VAI_TRO mỗi 5 phút
    // (đổi vai trò / khóa tài khoản có hiệu lực tối đa sau 5 phút). Phiên được gia hạn cùng lúc làm mới.
    if(!session.refreshedAt||Date.now()-Number(session.refreshedAt)>AUTH_SESSION_REFRESH_MS_V5477_){
      const account=authFindAccountV5467_(session&&session.user&&session.user.email);
      if(!account){CacheService.getScriptCache().remove(authSessionKeyV5467_(token));return {ok:true,authenticated:false,expired:true};}
      const st=String(account.TRANG_THAI||'').toUpperCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/Đ/g,'D');
      if(st.includes('KHOA')||st.includes('NGUNG')){CacheService.getScriptCache().remove(authSessionKeyV5467_(token));return {ok:true,authenticated:false,expired:true};}
      session.user=authSafeUserV5467_(account);session.refreshedAt=Date.now();
      CacheService.getScriptCache().put(authSessionKeyV5467_(token),JSON.stringify(session),21600);
    }
    return {ok:true,authenticated:true,user:session.user};
  }catch(e){return {ok:true,authenticated:false};}
}
function getUserAvatarV5471(token){
  const status=getLoginStatusV5467(token);if(!status.authenticated)throw new Error('Phiên đăng nhập đã hết hạn.');
  const source=String(status.user&&status.user.photo||'').trim(),match=source.match(/(?:\/d\/|[?&]id=)([-\w]{15,})/);
  if(!match)return {ok:true,photo:source,direct:true};
  const blob=DriveApp.getFileById(match[1]).getBlob(),mime=String(blob.getContentType()||'');
  if(!/^image\/(png|jpe?g|gif|webp)$/i.test(mime))throw new Error('File ảnh đại diện không đúng định dạng ảnh.');
  const bytes=blob.getBytes();if(bytes.length>2000000)throw new Error('Ảnh đại diện lớn hơn 2 MB. Vui lòng dùng ảnh nhỏ hơn.');
  return {ok:true,photo:'data:'+mime+';base64,'+Utilities.base64Encode(bytes),direct:false};
}
function loginAttemptV5471_(email,password){
  email=authNormalizeV5467_(email);password=String(password||'');if(!email||!password)throw new Error('Vui lòng nhập email và mật khẩu.');
  let account=authFindAccountV5467_(email);if(!account)throw new Error('Email hoặc mật khẩu không đúng.');
  const status=String(account.TRANG_THAI||'').toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/Đ/g,'D');if(status.includes('KHOA')||status.includes('NGUNG'))throw new Error('Tài khoản đã bị khóa hoặc ngừng hoạt động.');
  const roleName=authRoleNameV5467_(account.ID_VAI_TRO);let mustChangePassword=false;
  if(!account.MAT_KHAU_HASH){
    // V5.4.71: không còn mật khẩu mặc định trong mã; chỉ dùng Script property AUTH_BOOTSTRAP_PASSWORD_V5467 nếu Admin tự đặt.
    const bootstrap=String(PropertiesService.getScriptProperties().getProperty('AUTH_BOOTSTRAP_PASSWORD_V5467')||'');
    if(!bootstrap||!authIsAdminV5467_(account.ID_VAI_TRO,roleName)||!authSafeEqualV5471_(password,bootstrap))throw new Error('Tài khoản chưa được Admin cấp mật khẩu.');
    account=authWritePasswordV5467_(account,password);mustChangePassword=true;
  }else if(!authVerifyPasswordV5467_(account,password))throw new Error('Email hoặc mật khẩu không đúng.');
  const session=authCreateSessionV5467_(account);writeSystemLog_('LOGIN',SHEET.TAI_KHOAN,account.ID_TAI_KHOAN||'',account.EMAIL||email);
  return {ok:true,authenticated:true,token:session.token,user:session.user,mustChangePassword:mustChangePassword};
}
function loginV5467(email,password){
  const key=authNormalizeV5467_(email);
  if(key&&authFailCountV5471_('LOGIN',key)>=AUTH_MAX_FAILS_V5471_)throw new Error('Đăng nhập sai quá nhiều lần. Vui lòng thử lại sau 15 phút hoặc dùng "Quên mật khẩu".');
  try{const result=loginAttemptV5471_(email,password);if(key)authFailClearV5471_('LOGIN',key);return result;}
  catch(err){
    const msg=String(err&&err.message||err);
    if(key&&(msg==='Email hoặc mật khẩu không đúng.'||msg==='Tài khoản chưa được Admin cấp mật khẩu.')){
      const n=authFailBumpV5471_('LOGIN',key);
      if(n>=AUTH_MAX_FAILS_V5471_){writeSystemLog_('LOGIN_LOCKED',SHEET.TAI_KHOAN,'',key);throw new Error('Đăng nhập sai quá nhiều lần. Vui lòng thử lại sau 15 phút hoặc dùng "Quên mật khẩu".');}
    }
    throw err;
  }
}
function changePasswordV5467(token,currentPassword,newPassword){
  const status=getLoginStatusV5467(token);if(!status.authenticated)throw new Error('Phiên đăng nhập đã hết hạn.');newPassword=String(newPassword||'');
  if(newPassword.length<8||!/[A-Z]/.test(newPassword)||!/[a-z]/.test(newPassword)||!/[0-9]/.test(newPassword))throw new Error('Mật khẩu mới phải từ 8 ký tự, có chữ hoa, chữ thường và số.');
  const account=authFindAccountV5467_(status.user.email);
  if(authFailCountV5471_('CHANGE',status.user.email)>=AUTH_MAX_FAILS_V5471_)throw new Error('Nhập sai mật khẩu hiện tại quá nhiều lần. Vui lòng thử lại sau 15 phút.');
  if(!account||!authVerifyPasswordV5467_(account,currentPassword)){authFailBumpV5471_('CHANGE',status.user.email);throw new Error('Mật khẩu hiện tại không đúng.');}
  authFailClearV5471_('CHANGE',status.user.email);
  authWritePasswordV5467_(account,newPassword);writeSystemLog_('CHANGE_PASSWORD',SHEET.TAI_KHOAN,account.ID_TAI_KHOAN||'','Đổi mật khẩu');return {ok:true};
}
function logoutV5467(token){
  const status=getLoginStatusV5467(token);CacheService.getScriptCache().remove(authSessionKeyV5467_(token));if(status.authenticated)writeSystemLog_('LOGOUT',SHEET.TAI_KHOAN,status.user.id||'',status.user.email||'');return {ok:true};
}
function saveUserAccount(payload,authToken){
  authAssertPageAccessV5467_('users',authToken);
  payload=Object.assign({},payload||{});const password=String(payload.MAT_KHAU_MOI||'');delete payload.MAT_KHAU_MOI;
  if(String(payload.ID_VAI_TRO||'').trim()==='VR0004')throw new Error('Vai trò Super Admin đã được loại bỏ. Hãy chọn Admin.');
  payload.EMAIL=authNormalizeV5467_(payload.EMAIL);if(password&&(password.length<8||!/[A-Z]/.test(password)||!/[a-z]/.test(password)||!/[0-9]/.test(password)))throw new Error('Mật khẩu phải từ 8 ký tự, có chữ hoa, chữ thường và số.');
  const isNew=!String(payload.ID_TAI_KHOAN||'').trim();if(isNew&&!password)throw new Error('Tài khoản mới phải có mật khẩu tạm.');
  if(password){const salt=Utilities.getUuid().replace(/-/g,'')+Utilities.getUuid().replace(/-/g,'');payload.MAT_KHAU_SALT=salt;payload.MAT_KHAU_HASH=authHashV5467_(password,salt);payload.MAT_KHAU_CAP_NHAT_LUC=nowText_();}
  return saveRecordV53_('TAI_KHOAN',payload);
}
function saveRoleRecord(payload,authToken){authAssertPageAccessV5467_('roles',authToken);payload=payload||{};if(authIsRetiredSuperRoleV5467_(payload))throw new Error('Vai trò Super Admin đã được loại bỏ.');return saveRecordV53_('VAI_TRO',payload);}

// License Windows được bảo vệ bằng mật khẩu riêng, không gửi mật khẩu xuống HTML.
// V5.4.71: mật khẩu không còn nằm trong mã nguồn; đặt ở Script property WINDOWS_LICENSE_PASSWORD.
function windowsLicensePasswordV5471_() {
  const value = String(PropertiesService.getScriptProperties().getProperty('WINDOWS_LICENSE_PASSWORD') || '');
  if (!value) throw new Error('Chưa cấu hình mật khẩu xem license. Admin cần đặt Script property WINDOWS_LICENSE_PASSWORD.');
  return value;
}
function getWindowsLicenseFullV5463_(deviceCode,password){
  if(!authSafeEqualV5471_(String(password||''),windowsLicensePasswordV5471_()))throw new Error('Mật khẩu admin không đúng.');
  const db=getDb_();let sh=db.getSheetByName('License');
  if(!sh){sh=db.insertSheet('License');sh.getRange(1,1,1,6).setValues([['MA_THIET_BI','-','phien_ban_win','key_win','Phien_Ban_office','key_office']]);return {ok:false,found:false,message:'Đã tạo bảng License. Vui lòng nhập dữ liệu license.'};}
  const values=sh.getDataRange().getDisplayValues();if(!values.length)return {ok:false,found:false,message:'Bảng License chưa có dữ liệu.'};
  const headers=values[0].map(function(h){return String(h||'').trim();}),norm=function(h){return String(h||'').toLowerCase().replace(/[ _-]/g,'');},findIdx=function(names){for(let i=0;i<headers.length;i++)if(names.indexOf(norm(headers[i]))>=0)return i;return -1};
  const codeIdx=findIdx(['mathietbi','matb']),keyIdx=findIdx(['keywin','windowslicense']);
  if(codeIdx<0||keyIdx<0)throw new Error('Bảng License phải có cột MA_THIET_BI và key_win.');
  const wanted=String(deviceCode||'').trim().toUpperCase(),row=values.slice(1).find(function(r){return String(r[codeIdx]||'').trim().toUpperCase()===wanted;});
  if(!row)return {ok:false,found:false,message:'Không tìm thấy mã thiết bị '+String(deviceCode||'')+' trong bảng License.'};
  const key=String(row[keyIdx]||'').trim();if(!key)return {ok:false,found:false,message:'Mã thiết bị đã có nhưng chưa nhập Windows license.'};
  const winVerIdx=findIdx(['phienbanwin']),officeVerIdx=findIdx(['phienbanoffice']),officeKeyIdx=findIdx(['keyoffice','officelicense']);
  return {ok:true,found:true,MA_THIET_BI:String(row[codeIdx]||''),windowsVersion:winVerIdx>=0?String(row[winVerIdx]||''):'',windowsLicense:key,officeVersion:officeVerIdx>=0?String(row[officeVerIdx]||''):'',officeLicense:officeKeyIdx>=0?String(row[officeKeyIdx]||''):''};
}
function getWindowsLicenseFullV5463() { return authCallPermV5471_('THIET_BI','XEM',getWindowsLicenseFullV5463_,arguments); }

// Chạy một lần khi khởi tạo lại dữ liệu tài khoản/phân quyền từ đầu.
// Giữ hàng tiêu đề, xóa toàn bộ các dòng dữ liệu cũ.
function resetAccountPermissionDataV5463(confirmText,authToken){
  authAssertPageAccessV5467_('permissions',authToken);
  if(String(confirmText||'')!=='RESET_TAI_KHOAN_PHAN_QUYEN')throw new Error('Thiếu mã xác nhận reset dữ liệu.');
  const db=getDb_();
  const schemas={
    TAI_KHOAN:['ID_TAI_KHOAN','ID_NHAN_SU','EMAIL','ID_VAI_TRO','TRANG_THAI','MAT_KHAU_HASH','MAT_KHAU_SALT','MAT_KHAU_CAP_NHAT_LUC','NGAY_TAO','NGAY_CAP_NHAT','GHI_CHU'],
    PHAN_QUYEN:['ID','ID_VAI_TRO','CHUC_NANG','XEM','THEM','SUA','XOA','DUYET','XUAT_FILE']
  };
  Object.keys(schemas).forEach(function(name){let sh=db.getSheetByName(name);if(!sh)sh=db.insertSheet(name);const headers=schemas[name];if(sh.getMaxColumns()<headers.length)sh.insertColumnsAfter(sh.getMaxColumns(),headers.length-sh.getMaxColumns());if(sh.getLastRow()>0)sh.getRange(1,1,sh.getLastRow(),Math.max(sh.getLastColumn(),headers.length)).clearContent();sh.getRange(1,1,1,headers.length).setValues([headers]);});
  rbacCacheClearV5477_();
  return {ok:true,reset:['TAI_KHOAN','PHAN_QUYEN'],message:'Đã xóa dữ liệu cũ và khởi tạo lại hàng tiêu đề.'};
}

// V5.4.66 - Làm lại riêng dữ liệu PHAN_QUYEN theo danh sách VAI_TRO hiện có.
// Không thay đổi dữ liệu TAI_KHOAN hoặc VAI_TRO.
function resetPermissionDataV5466(confirmText,authToken){
  authAssertPageAccessV5467_('permissions',authToken);
  if(String(confirmText||'')!=='RESET_PHAN_QUYEN')throw new Error('Thiếu mã xác nhận làm lại bảng phân quyền.');
  const lock=LockService.getScriptLock();
  if(!lock.tryLock(30000))throw new Error('Hệ thống đang cập nhật dữ liệu. Vui lòng thử lại.');
  try{
    const roles=authActiveRoleRowsV5467_().filter(function(r){return String(r.ID_VAI_TRO||r.ID||'').trim();});
    if(!roles.length)throw new Error('Bảng VAI_TRO chưa có dữ liệu. Không thể tạo ma trận phân quyền.');
    const headers=['ID','ID_VAI_TRO','CHUC_NANG','XEM','THEM','SUA','XOA','DUYET','XUAT_FILE'];
    // Danh sách mới bám đúng menu đang hiện hành; không mang các module legacy
    // như Công việc, Bảo trì, Hợp đồng, Khách thuê, Báo cáo vào bảng mới.
    const modules=['THIET_BI','KHO_NHAP_XUAT_TON','THU_HOI_THANH_LY','DE_XUAT_QUAN_LY','DE_XUAT_MUA_XUAT','DE_XUAT_SUA_CHUA','DE_XUAT_THANH_LY','DANH_MUC_THIET_BI','PHONG_BAN','CO_SO_TANG','DANH_MUC_KHO','NHAN_VIEN','TAI_KHOAN','PHAN_QUYEN','VAI_TRO'];
    const actions=['XEM','THEM','SUA','XOA','DUYET','XUAT_FILE'];
    const normalize=function(v){return String(v||'').trim().toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/Đ/g,'D');};
    const stamp=Utilities.formatDate(new Date(),APP_CONFIG.TIMEZONE,'yyyyMMddHHmmss');
    const output=[];
    roles.forEach(function(role,roleIndex){
      const roleId=String(role.ID_VAI_TRO||role.ID||'').trim();
      const roleName=normalize(role.TEN_VAI_TRO||role.TEN||role.VAI_TRO||'');
      const isSuperAdmin=roleId==='VR0001'||roleName==='ADMIN'||roleName==='QUAN TRI'||roleName==='QUAN TRI HE THONG';
      modules.forEach(function(module,moduleIndex){
        const row={ID:'PQ-'+stamp+'-'+String(roleIndex+1).padStart(3,'0')+'-'+String(moduleIndex+1).padStart(2,'0'),ID_VAI_TRO:roleId,CHUC_NANG:module};
        // Chỉ Admin có quyền mặc định. Các vai trò khác để trống để Admin tự gán.
        actions.forEach(function(action){row[action]=isSuperAdmin;});
        output.push(headers.map(function(h){return normalizeWriteValue_(row[h]);}));
      });
    });
    const db=getDb_();let sh=db.getSheetByName(SHEET.PHAN_QUYEN);
    if(!sh)sh=db.insertSheet(SHEET.PHAN_QUYEN);
    if(sh.getMaxColumns()<headers.length)sh.insertColumnsAfter(sh.getMaxColumns(),headers.length-sh.getMaxColumns());
    const clearRows=Math.max(sh.getLastRow(),1),clearCols=Math.max(sh.getLastColumn(),headers.length);
    sh.getRange(1,1,clearRows,clearCols).clearContent();
    sh.getRange(1,1,1,headers.length).setValues([headers]);
    if(output.length)sh.getRange(2,1,output.length,headers.length).setValues(output);
    rbacCacheClearV5477_();memoForgetSheetV5477_(SHEET.PHAN_QUYEN);
    writeSystemLog_('RESET_PERMISSION',SHEET.PHAN_QUYEN,'','Làm lại '+output.length+' dòng quyền; giữ nguyên TAI_KHOAN và VAI_TRO');
    return {ok:true,sheet:SHEET.PHAN_QUYEN,roles:roles.length,modules:modules.length,rows:output.length,preserved:['TAI_KHOAN','VAI_TRO'],message:'Đã làm lại bảng PHAN_QUYEN.'};
  }finally{lock.releaseLock();}
}

// V5.4.63 - Xuất PDF/DOCX thật qua Google Docs, dùng cùng dữ liệu mẫu in V548.
function exportProposalFileV8414_(id,format){
  format=String(format||'pdf').toLowerCase()==='pdf'?'pdf':'docx';
  const data=getProposalPrintDataV548_(id),r=data.proposal||{},d=data.display||{};
  const doc=DocumentApp.create('PHIEU_DE_XUAT_'+(d.code||id)),body=doc.getBody();
  body.clear();body.setMarginTop(31).setMarginBottom(31).setMarginLeft(34).setMarginRight(34);
  const head=body.appendTable([['PHIẾU ĐỀ XUẤT','']]);head.setBorderWidth(0);head.setColumnWidth(0,320);head.setColumnWidth(1,200);
  const leftHead=head.getCell(0,0);leftHead.setVerticalAlignment(DocumentApp.VerticalAlignment.BOTTOM);leftHead.setPaddingBottom(0);const titleP=leftHead.getChild(0).asParagraph();titleP.clear();titleP.appendText('PHIẾU ĐỀ XUẤT');titleP.editAsText().setFontFamily('Arial').setFontSize(20).setBold(true);titleP.setSpacingBefore(0).setSpacingAfter(0);const codeP=leftHead.appendParagraph('Mã phiếu: '+String(d.code||id));codeP.editAsText().setFontFamily('Arial').setFontSize(10).setBold(true);codeP.setSpacingBefore(0).setSpacingAfter(0);
  const rightHead=head.getCell(0,1);rightHead.setVerticalAlignment(DocumentApp.VerticalAlignment.BOTTOM);rightHead.setPaddingBottom(0);const rightP=rightHead.getChild(0).asParagraph();rightP.clear();rightP.setAlignment(DocumentApp.HorizontalAlignment.RIGHT);const logoBlob=proposalLogoBlobExportV8414_();if(logoBlob){const im=rightP.appendInlineImage(logoBlob);im.setWidth(180);im.setHeight(56.25);}rightP.appendText('\n152 Hàm Nghi, Đà Nẵng\n52 Nguyễn Văn Linh, Đà Nẵng\nphilong@philong.com.vn');
  body.appendHorizontalRule();
  const to=body.appendTable([['Kính gửi:','- Giám đốc Công ty TNHH Công Nghệ Tin Học Phi Long\n- Bộ phận quản lý']]);to.setBorderWidth(0);to.setColumnWidth(0,70);to.setColumnWidth(1,450);
  const info=body.appendTable([['Ngày lập',dateTextExportV8414_(r.NGAY_DE_XUAT),'Người đề xuất',d.requester||''],['Phòng ban',d.department||'','Loại đề xuất',proposalTypeLabelExportV8414_(data)]]);info.setBorderWidth(.75);info.setColumnWidth(0,85);info.setColumnWidth(1,175);info.setColumnWidth(2,95);info.setColumnWidth(3,165);
  const contentTitle=body.appendParagraph('NỘI DUNG');contentTitle.setSpacingBefore(8);contentTitle.editAsText().setFontFamily('Arial').setFontSize(12).setBold(true).setForegroundColor('#b5121b');
  const contentBody=body.appendParagraph(String(r.NOI_DUNG_DE_XUAT||r.LY_DO_DE_XUAT||r.NOI_DUNG||''));contentBody.editAsText().setFontFamily('Arial').setFontSize(11).setBold(false).setForegroundColor('#222222');
  const detailTitle=body.appendParagraph('CHI TIẾT ĐỀ XUẤT');detailTitle.setSpacingBefore(28);detailTitle.editAsText().setFontFamily('Arial').setFontSize(12).setBold(true).setForegroundColor('#b5121b');
  const qty=toNumber_(r.SO_LUONG),price=toNumber_(r.DON_GIA_DU_KIEN||r.DON_GIA),amount=toNumber_(r.THANH_TIEN)||qty*price;
  const table=body.appendTable([['TT','Nội dung / Mặt hàng','Số lượng','Đơn giá','Thành tiền'],['1',String(r.TEN_THIET_BI||r.TEN_HANG||r.NOI_DUNG||''),String(r.SO_LUONG||''),exportMoneyV8414_(price),exportMoneyV8414_(amount)],['','','','TỔNG CỘNG',exportMoneyV8414_(amount)]]);table.setBorderWidth(.75);table.setColumnWidth(0,36);table.setColumnWidth(1,224);table.setColumnWidth(2,70);table.setColumnWidth(3,92);table.setColumnWidth(4,98);for(let ti=0;ti<3;ti++){for(let tj=0;tj<5;tj++){const tp=table.getCell(ti,tj).getChild(0).asParagraph();tp.editAsText().setFontFamily('Arial').setFontSize(10).setBold(false).setForegroundColor('#222222');}}
  const noteP=body.appendParagraph('Ghi chú: '+String(r.GHI_CHU||''));noteP.setSpacingBefore(8);noteP.editAsText().setFontFamily('Arial').setFontSize(10).setBold(false).setForegroundColor('#222222');
  const sign=body.appendTable([['NGƯỜI ĐỀ XUẤT','TRƯỞNG BỘ PHẬN','PHÊ DUYỆT'],['\n\n\n\n\n\n'+String(d.requester||''),'\n\n\n\n\n\n','\n\n\n\n\n\n']]);sign.setBorderWidth(0);sign.setColumnWidth(0,174);sign.setColumnWidth(1,174);sign.setColumnWidth(2,174);
  for(let si=0;si<3;si++){sign.getCell(0,si).setVerticalAlignment(DocumentApp.VerticalAlignment.TOP);sign.getCell(1,si).setVerticalAlignment(DocumentApp.VerticalAlignment.TOP);for(let sr=0;sr<2;sr++){const sc=sign.getCell(sr,si);for(let sp=0;sp<sc.getNumChildren();sp++){const child=sc.getChild(sp);if(child.getType()===DocumentApp.ElementType.PARAGRAPH){const para=child.asParagraph();para.setAlignment(DocumentApp.HorizontalAlignment.CENTER);para.editAsText().setFontFamily('Arial').setFontSize(sr===0?11:10).setBold(sr===0).setForegroundColor('#222222');}}}}
  const footer=doc.addFooter();footer.appendParagraph('Biểu mẫu có giá trị khi được ký duyệt đầy đủ.').setAlignment(DocumentApp.HorizontalAlignment.CENTER).editAsText().setFontFamily('Arial').setFontSize(9).setItalic(true).setForegroundColor('#555555');
  doc.saveAndClose();
  const file=DriveApp.getFileById(doc.getId());
  try{const mime=format==='pdf'?'application/pdf':'application/vnd.openxmlformats-officedocument.wordprocessingml.document';const blob=exportProposalBlobV8414_(doc.getId(),mime);return {ok:true,fileName:String(d.code||id)+(format==='pdf'?'.pdf':'.docx'),mimeType:mime,base64:Utilities.base64Encode(blob.getBytes())};}
  finally{try{file.setTrashed(true)}catch(e){}}
}
function exportProposalFileV8414() { return authCallPermV5471_('DE_XUAT_QUAN_LY','XUAT_FILE',exportProposalFileV8414_,arguments); }
const PROPOSAL_LOGO_BASE64_V8414 = "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";
function proposalLogoBlobExportV8414_(){try{return Utilities.newBlob(Utilities.base64Decode(PROPOSAL_LOGO_BASE64_V8414),'image/png','philong-logo.png')}catch(e){return null}}
function dateTextExportV8414_(v){if(!v)return '';const s=String(v).slice(0,10),m=s.match(/^(\d{4})-(\d{2})-(\d{2})$/);return m?m[3]+'/'+m[2]+'/'+m[1]:s}
function exportMoneyV8414_(v){const n=Number(v||0);return n?String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g,','):''}
function proposalTypeLabelExportV8414_(d){return d&&d.proposalType==='THANH_LY'?'Đề xuất thanh lý':d&&d.proposalType==='BAO_TRI'?'Đề xuất bảo trì':'Đề xuất mua thiết bị'}
function exportProposalBlobV8414_(id,mime){const url='https://www.googleapis.com/drive/v3/files/'+encodeURIComponent(id)+'/export?mimeType='+encodeURIComponent(mime),res=UrlFetchApp.fetch(url,{headers:{Authorization:'Bearer '+ScriptApp.getOAuthToken()},muteHttpExceptions:true});if(res.getResponseCode()<200||res.getResponseCode()>=300)throw new Error('EXPORT_FILE_FAILED:'+res.getResponseCode());return res.getBlob()}



/**
 * V5.4.10 - LOOKUPS FIX
 * Lookup dùng chung cho toàn bộ menu V5.4.x.
 * Chỉ đọc từ 19 sheet chuẩn hiện tại, không phụ thuộc sheet legacy.
 */
function getLookups_() {
  const employees   = safeReadRowsV513_('NHAN_SU');
  const departments = safeReadRowsV513_('DANH_MUC_PHONG_BAN');
  const sites       = safeReadRowsV513_('DANH_MUC_CO_SO');
  const floors      = safeReadRowsV513_('DANH_MUC_TANG');
  const categories  = safeReadRowsV513_('DANH_MUC_THIET_BI');
  const warehouses  = safeReadRowsV513_('DANH_MUC_KHO');
  const roles       = authActiveRoleRowsV5467_();

  // V5.4.77: chỉ giữ các khóa giao diện đang dùng. Đã bỏ bộ tên tiếng Việt trùng lặp
  // (nhanSu, phongBan, ...) và danh sách tài khoản (giao diện không dùng) → nhỏ ~3 lần.
  return {
    employees: employees,
    departments: departments,
    sites: sites,
    floors: floors,
    categories: categories,
    warehouses: warehouses,
    roles: roles
  };
}

/**
 * Kiểm tra các API trang chính mà không ghi dữ liệu.
 * Chạy trực tiếp trong Apps Script editor sau deploy nếu cần.
 */
function runBackendSmokeTestV5410_() {
  const tests = [
    ['bootstrap', function(){ return getCoreBootstrapData_(); }],
    ['equipment', function(){ return getPageBundleV64('equipment', false); }],
    ['warehouseDevice', function(){ return getPageBundleV64('warehouseDevice', false); }],
    ['materialWarehouse', function(){ return getPageBundleV64('materialWarehouse', false); }],
    ['proposalBundle', function(){ return getProposalBundleV5463_(); }],
    ['departments', function(){ return getPageBundleV64('departments', false); }],
    ['locations', function(){ return getPageBundleV64('locations', false); }],
    ['warehouses', function(){ return getPageBundleV64('warehouses', false); }],
    ['employees', function(){ return getPageBundleV64('employees', false); }],
    ['users', function(){ return getPageBundleV64('users', false); }],
    ['permissions', function(){ return getPageBundleV64('permissions', false); }],
    ['systemAudit', function(){ return getPageBundleV64('systemAudit', false); }],
    ['systemConfig', function(){ return getPageBundleV64('systemConfig', false); }]
  ];

  const results = [];
  tests.forEach(function(t) {
    const started = Date.now();
    try {
      const r = t[1]();
      results.push({
        name: t[0],
        ok: !!(r && r.ok !== false),
        elapsedMs: Date.now() - started,
        warningCount: r && r.warnings ? r.warnings.length : 0,
        moduleKeys: r && r.modules ? Object.keys(r.modules) : []
      });
    } catch (err) {
      results.push({
        name: t[0],
        ok: false,
        elapsedMs: Date.now() - started,
        error: String(err && err.stack ? err.stack : err)
      });
    }
  });

  return {
    ok: results.every(function(x){ return x.ok; }),
    version: '5.4.44-device-forms-single-controller',
    database: auditDatabaseSchemaV549_(),
    lookupCounts: (function(){
      const x = getLookups_();
      return {
        employees:x.employees.length,
        departments:x.departments.length,
        sites:x.sites.length,
        floors:x.floors.length,
        categories:x.categories.length,
        warehouses:x.warehouses.length,
        roles:x.roles.length
      };
    })(),
    results: results
  };
}
function runBackendSmokeTestV5410() { return authCallAdminOrOwnerV5470_(function(){ return authRunTrustedV5470_(runBackendSmokeTestV5410_); }, arguments); }


function getCoreBootstrapData_(keepReadMemo) {
  // Bootstrap độc lập bắt đầu request mới; bootstrap lồng trong page bundle
  // dùng lại memo của cùng request để tránh đọc lại toàn bộ sheet.
  if (!keepReadMemo) resetReadMemoV5433_();
  const t0 = Date.now();
  const devices = safeReadRowsV513_('THIET_BI');
  const maintenance = safeReadRowsV513_('BAO_TRI_THIET_BI');
  // Đề xuất dùng đúng một nguồn chuẩn hóa V5.4.63; bootstrap dùng chung một schema.
  const proposals = normalizeProposalRowsV5463_();
  const stock = safeReadRowsV513_('KHO_TON');

  return {
    ok: true,
    elapsedMs: Date.now() - t0,
    work: [],
    daily: [],
    proposals: proposals.slice(-20),
    asset: devices.slice(-100),
    stock: stock.slice(-100),
    maintenance: maintenance.slice(-100),
    lookups: getLookupsCachedV5433_()
  };
}
function getCoreBootstrapData() { return authCallUserV5470_(getCoreBootstrapData_, arguments); }

function getCorePageBundleV82(page,force,authToken) {
  authToken=authTokenFromArgsV5470_(arguments,authToken);
  const result=getPageBundleV64(page,force,authToken);result.core=getCoreBootstrapData_(true);
  if(page==='work')result.work=[];if(page==='daily')result.daily=[];return result;
}


function getPageBundleV20(group,authToken) {
  authToken=authTokenFromArgsV5470_(arguments,authToken);
  return getPageBundleV64(group, false, authToken);
}

/**
 * V5.4.77 - Khai báo "dst là bản sao của src" thay vì gửi 2 lần cùng dữ liệu.
 * Giao diện (PL_GS_RUN_V5472) tự dựng lại dst trước khi gọi hàm xử lý kết quả.
 */
function plAliasV5477_(obj,dst,src){obj.PL_ALIAS=obj.PL_ALIAS||{};obj.PL_ALIAS[dst]=src;}
const SYSTEM_AUDIT_LIMIT_V5477_=500;
/** Đọc n dòng cuối (mới nhất) của sheet — dùng cho Nhật ký hệ thống thay vì đọc toàn bộ. */
function readLastRowsV5477_(sheetName,n){
  try{
    const sh=getSheet_(physicalSheetNameV5477_(sheetName)),lastRow=sh.getLastRow(),lastCol=sh.getLastColumn();
    if(lastRow<2||lastCol<1)return [];
    const headers=sh.getRange(1,1,1,lastCol).getDisplayValues()[0].map(function(h){return String(h||'').trim();});
    const count=Math.min(n,lastRow-1),values=sh.getRange(lastRow-count+1,1,count,lastCol).getDisplayValues();
    // Giữ thứ tự như sheet (cũ → mới) để giao diện hiển thị giống trước.
    return values.filter(function(r){return r.some(function(v){return String(v||'').trim()!=='';});}).map(function(r){return rowArrayToObject_(headers,r);});
  }catch(e){return [];}
}
function getPageBundleV64(page,force,authToken) {
  authToken=authTokenFromArgsV5470_(arguments,authToken);
  resetReadMemoV5433_();
  const t0=Date.now(),route=getPageRouteV54_(page);
  authAssertPageAccessV5467_(page,authToken);
  const result={ok:true,page:page,elapsedMs:0,warnings:[],modules:{},lookups:getLookupsCachedV5433_()};

  if(page==='handbook'){
    const handbook=getCamNangPageDataV865_();
    result.modules.handbook={sheet:SHEET.CAM_NANG,rows:handbook.rows,headers:handbook.headers,count:handbook.count,returned:handbook.count,readonly:false};
    result.handbook=handbook;
    result.elapsedMs=Date.now()-t0;
    return result;
  }

  if(page==='materialWarehouse'){
    const ledger=safeReadRowsV513_('NHAP_XUAT_TON'),stock=safeReadRowsV513_('KHO_TON'),inbound=safeReadRowsV513_('KHO_NHAP'),recovery=safeReadRowsV513_('THU_HOI_THIET_BI'),disposal=safeReadRowsV513_('THANH_LY_THIET_BI');
    const materials=stock.map(function(r){return Object.assign({},r,{ID:r.ID_TON_KHO||'',TEN_VAT_TU:r.TEN_HANG||'',NHOM:r.ID_DANH_MUC||'',DVT:r.DON_VI_TINH||'',TON_DAU:0,TONG_NHAP:r.SO_LUONG_NHAP||0,TONG_XUAT:toNumber_(r.SO_LUONG_CAP_PHAT)+toNumber_(r.SO_LUONG_THANH_LY),TON_HIEN_TAI:r.SO_LUONG_TON||0,TON_TOI_THIEU:'',CANH_BAO:r.TINH_TRANG_TON||''});});
    const transactions=ledger.map(function(r){return Object.assign({},r,{ID:r.ID_GIAO_DICH||'',NGAY:r.NGAY_GIAO_DICH||'',TEN_VAT_TU:r.TEN_HANG||'',SO_LUONG:toNumber_(r.SO_LUONG_VAO)||toNumber_(r.SO_LUONG_RA),NGUOI_THUC_HIEN:r.ID_TAI_KHOAN_THUC_HIEN||'',NOI_DUNG:r.ID_CHUNG_TU||''});});
    result.modules.materialWarehouse={sheet:'NHAP_XUAT_TON',rows:ledger,headers:safeHeadersV513_('NHAP_XUAT_TON'),count:ledger.length,returned:ledger.length,readonly:true,materials:materials,transactions:transactions,recovery:recovery,disposal:disposal};
    // V5.4.77: ledger / stock / inbound là cùng một sheet → gửi 1 lần, giao diện tự dựng lại (PL_ALIAS).
    if(inbound===ledger)plAliasV5477_(result,'modules.materialWarehouse.inbound','modules.materialWarehouse.rows');else result.modules.materialWarehouse.inbound=inbound;
    if(stock===ledger){plAliasV5477_(result,'modules.materialWarehouse.stock','modules.materialWarehouse.rows');plAliasV5477_(result,'stock','modules.materialWarehouse.rows');}
    else{result.modules.materialWarehouse.stock=stock;plAliasV5477_(result,'stock','modules.materialWarehouse.stock');}
    plAliasV5477_(result,'transactions','modules.materialWarehouse.rows');
    plAliasV5477_(result,'recovery','modules.materialWarehouse.recovery');
    plAliasV5477_(result,'disposal','modules.materialWarehouse.disposal');
    result.elapsedMs=Date.now()-t0;return result;
  }

  if(page==='systemConfig'){
    const cfg=getSystemConfigV549(authToken);
    result.modules.systemConfig={sheet:'',rows:[cfg.company],headers:Object.keys(cfg.company),count:1,returned:1,readonly:false,storage:'SCRIPT_PROPERTIES'};
    result.systemConfig=[cfg.company];result.elapsedMs=Date.now()-t0;return result;
  }
  if(!route){result.warnings.push('Trang chưa khai báo route dữ liệu: '+page);result.elapsedMs=Date.now()-t0;return result;}
  if(!route.read){
    result.warnings.push('Trang "'+page+'" chưa có sheet nghiệp vụ chuẩn trong database master.');
    result.modules[page]={sheet:'',rows:[],headers:[],count:0,returned:0,readonly:true};
    result.elapsedMs=Date.now()-t0;return result;
  }
  // V5.4.77: Nhật ký hệ thống chỉ đọc 500 dòng mới nhất thay vì toàn bộ sheet.
  const rawRows=page==='systemAudit'?readLastRowsV5477_(route.read,SYSTEM_AUDIT_LIMIT_V5477_):safeReadRowsV513_(route.read);
  const rows=(page==='roles'||page==='permissions'?rawRows.filter(function(row){return !authIsRetiredSuperRoleV5467_(row);}):rawRows).map(safeRow_);
  result.modules[page]={sheet:route.read,rows:rows,headers:(rows.length?Object.keys(rows[0]):safeHeadersV513_(route.read)).filter(function(h){return SAFE_RESPONSE_HIDE_COLUMNS.indexOf(h)<0;}),count:rows.length,returned:rows.length,readonly:!route.write};
  // Trang Tài khoản cần đồng thời danh sách nhân sự và vai trò để mở form.
  // Trang Phân quyền cần danh sách vai trò để dựng ma trận ngay lần tải đầu.
  if(page==='users'){
    const employees=safeReadRowsV513_('NHAN_SU'),roles=authActiveRoleRowsV5467_();
    result.employeesAll=employees;
    result.roles=roles;
    result.modules.roles={sheet:'VAI_TRO',rows:roles,headers:roles.length?Object.keys(roles[0]):safeHeadersV513_('VAI_TRO'),count:roles.length,returned:roles.length,readonly:false};
  }
  if(page==='permissions'){
    const roles=authActiveRoleRowsV5467_();
    result.roles=roles;
    result.modules.roles={sheet:'VAI_TRO',rows:roles,headers:roles.length?Object.keys(roles[0]):safeHeadersV513_('VAI_TRO'),count:roles.length,returned:roles.length,readonly:false};
  }
  // V5.4.77: bỏ result.asset (trùng modules.equipment.rows; giao diện không dùng dạng mảng này).
  if(page==='warehouseDevice'||page==='materialWarehouse')plAliasV5477_(result,'stock','modules.'+page+'.rows');
  if(page==='allocation')result.allocation=rows;
  if(page==='recovery')result.recovery=rows;
  if(page==='maintenance'||page==='maintenanceLog'||page==='maintenancePlan')result.maintenance=rows;
  if(page==='employees')result.employeesAll=rows;
  if(page==='departments')result.departments=rows;
  if(page==='locations')result.locations=rows;
  if(page==='warehouses')result.warehouses=rows;
  if(page==='users')result.users=rows;
  if(page==='roles')result.roles=rows;
  if(page==='permissions')result.permissions=rows;
  if(page==='systemAudit')result.systemAudit=rows;
  if(page==='systemConfig')result.systemConfig=rows;
  if(page==='floors')result.floors=rows;
  if(page==='buildingAreas')result.buildingAreas=rows;
  if(page==='maintenanceItems')result.maintenanceItems=rows;
  result.elapsedMs=Date.now()-t0;return result;
}


function saveUiFormV19(request) {
  request=Object.assign({},request||{});request.authToken=authTokenFromArgsV5470_(arguments,request.authToken);
  return saveUiFormV20(request);
}

function saveUiFormV22(request) {
  request=Object.assign({},request||{});request.authToken=authTokenFromArgsV5470_(arguments,request.authToken);
  return saveUiFormV20(request);
}

function saveUiFormV20(request) {
  request=Object.assign({},request||{});request.authToken=authTokenFromArgsV5470_(arguments,request.authToken);const page=String(request.page||'').trim();
  const routeForPerm=getPageRouteV54_(page),pkForPerm=routeForPerm&&routeForPerm.write&&TABLES[routeForPerm.write]?TABLES[routeForPerm.write].pk:'';
  authAssertPageAccessV5467_(page,request.authToken,(request.editing||(pkForPerm&&String((request.payload||{})[pkForPerm]||'').trim()))?'SUA':'THEM');
  if(page==='systemConfig'){const saved=saveSystemConfigV549(request.payload||{},request.authToken);return {ok:true,persisted:true,page:page,sheet:'SCRIPT_PROPERTIES',result:saved};}
  if(page==='users'){const saved=saveUserAccount(request.payload||{},request.authToken);return {ok:true,persisted:true,page:page,sheet:SHEET.TAI_KHOAN,id:saved&&saved.id,action:saved&&saved.action,result:saved};}
  if(page==='handbook'){const hb=request.payload||{},saved=String(hb.STT==null?'':hb.STT).trim()?updateCamNangRecordV865_(hb):saveCamNangRecordV865_(hb);return {ok:true,persisted:true,page:page,sheet:SHEET.CAM_NANG,stt:saved&&saved.stt,result:saved};}
  const route=assertPageWritableV54_(page);
  const cfg=TABLES[route.write],normalized=normalizeUiPayloadV54_(page,route.write,request.payload||{});
  // V5.4.80: nhớ bản ghi nhân sự trước khi sửa để phát hiện đổi phòng ban / nghỉ việc.
  let empBefore=null;
  if(route.write==='NHAN_SU'&&String(normalized.ID_NHAN_SU||'').trim()){
    empBefore=safeReadRowsV513_('NHAN_SU').find(function(r){return String(r.ID_NHAN_SU||'')===String(normalized.ID_NHAN_SU).trim();})||null;
  }
  const res=saveRecordV53_(route.write,normalized);
  const out={ok:true,persisted:true,page:page,sheet:route.write,id:res&&res.id,action:res&&res.action,result:res};
  if(empBefore){
    try{const impact=employeeDeviceImpactV5480_(empBefore,Object.assign({},empBefore,normalized));if(impact)out.deviceImpactV5480=impact;}
    catch(e){console.warn('V5.4.80 deviceImpact: '+(e&&e.message?e.message:e));}
  }
  return out;
}


function saveUniversalEditV26(request) {
  request=Object.assign({},request||{});request.authToken=authTokenFromArgsV5470_(arguments,request.authToken);const page=UI_CONTAINER_PAGE[String(request.containerId||'')]||String(request.page||'');
  authAssertPageAccessV5467_(page,request.authToken,'SUA');
  const route=assertPageWritableV54_(page),cfg=TABLES[route.write],payload=Object.assign({},request.payload||{});
  if(request.id&&!payload[cfg.pk])payload[cfg.pk]=request.id;
  return saveUiFormV20({page:page,payload:payload,editing:true,authToken:request.authToken});
}


function runMaintenanceDataAuditV78(mode,authToken) {
  authToken=authTokenFromArgsV5470_(arguments,authToken);
  authAssertPageAccessV5467_('maintenanceDataTool',authToken);
  const rows=safeReadRowsV513_('BAO_TRI_THIET_BI');
  return {ok:true,readOnly:true,mode:mode||'PREVIEW',elapsedMs:0,totalIssues:0,returnedIssues:0,truncated:false,issues:[],checks:[],summary:{totalRows:rows.length,totalIssues:0,errors:0,warnings:0},message:'Kết nối BAO_TRI_THIET_BI hợp lệ.'};
}


function runMaintenanceDataRepairV79(mode,authToken) {
  authToken=authTokenFromArgsV5470_(arguments,authToken);
  authAssertPageAccessV5467_('maintenanceDataTool',authToken);
  return {
    ok: true,
    mode: mode || 'PREVIEW',
    totalChanges: 0,
    changes: [],
    afterSummary: { totalIssues: 0 },
    message: 'Không có dữ liệu cần sửa tự động.'
  };
}

function resolveSheetByUiPageV513_(page) { const r=getPageRouteV54_(page);return r?(r.write||r.read||''):''; }




/**
 * V5.4.3 - DEVICE DATA UI API
 */

/**
 * V5.4.16 - COPY MODULE THIẾT BỊ & KHO TỪ PHILONGMNGV3
 * Source concept: V5.3.12-kho-recode.
 * Adaptation for current 19-sheet DB:
 * - KHO_GIAO_DICH -> NHAP_XUAT_TON
 * - CAP_PHAT_THIET_BI no longer exists; allocation is derived from outbound ledger rows.
 */

/**
 * V5.4.20 - Kho thiết bị (nhập xuất tồn)
 * Tách rõ 3 luồng: Nhập kho / Xuất kho / Tồn kho.
 * Không trộn THIET_BI đang sử dụng vào tồn kho.
 */


/**
 * V5.4.25 - Sinh MA_THIET_BI tự động.
 * Format: [MA_TANG][MA_CO_SO][MA_BP_2][NN]
 * Ví dụ: T1HNKT01, T5HNTO01, T10NVLDA01.
 */
function departmentCode2V5425_(deptId) {
  const rows = safeReadRowsV513_('DANH_MUC_PHONG_BAN');
  const r = rows.find(function(x){ return String(x.ID_PHONG_BAN || '') === String(deptId || ''); });
  if (!r) return '';
  const ma = String(r.MA_PHONG_BAN || '').trim().toUpperCase();
  const fixed = {
    'QL':'QL','KT':'KT','KD':'KD','KTO':'TO','KTOHD':'HD',
    'KHO':'KH','MKT':'MK','DA':'DA','LTBH':'BH','LT':'LT',
    'DP':'DP','SC':'SC','SERVER':'SV','GX':'GX'
  };
  if (fixed[ma]) return fixed[ma];
  const clean = ma.replace(/[^A-Z0-9]/g,'');
  if (clean.length === 1) return (clean + 'X').slice(0,2);
  if (clean.length >= 2) return clean.slice(0,2);
  return 'XX';
}

function siteCodeV5425_(siteId) {
  const rows = safeReadRowsV513_('DANH_MUC_CO_SO');
  const r = rows.find(function(x){ return String(x.ID_CO_SO || '') === String(siteId || ''); });
  return r ? String(r.MA_CO_SO || '').trim().toUpperCase().replace(/[^A-Z0-9]/g,'') : '';
}

function floorCodeV5425_(floorId) {
  const rows = safeReadRowsV513_('DANH_MUC_TANG');
  const r = rows.find(function(x){ return String(x.ID_TANG || '') === String(floorId || ''); });
  return r ? String(r.MA_TANG || '').trim().toUpperCase().replace(/[^A-Z0-9]/g,'') : '';
}

function nextDeviceCodeV5425_(siteId, floorId, deptId) {
  const floor = floorCodeV5425_(floorId);
  const site = siteCodeV5425_(siteId);
  const dept = departmentCode2V5425_(deptId);
  if (!floor) throw new Error('Chưa chọn Tầng hợp lệ.');
  if (!site) throw new Error('Chưa chọn Cơ sở hợp lệ.');
  if (!dept) throw new Error('Chưa chọn Phòng ban hợp lệ.');

  const prefix = floor + site + dept;
  const rows = safeReadRowsV513_('THIET_BI');
  let maxNo = 0;

  rows.forEach(function(r){
    const code = String(r.MA_THIET_BI || '').trim().toUpperCase();
    if (code.indexOf(prefix) !== 0) return;
    const tail = code.slice(prefix.length);
    if (/^\d+$/.test(tail)) maxNo = Math.max(maxNo, Number(tail));
  });

  let no = maxNo + 1;
  let candidate = prefix + String(no).padStart(2,'0');
  const exists = function(c){
    return rows.some(function(r){
      return String(r.MA_THIET_BI || '').trim().toUpperCase() === c;
    });
  };

  while (exists(candidate)) {
    no++;
    candidate = prefix + String(no).padStart(2,'0');
  }
  return candidate;
}

function previewDeviceCodeV5425_(siteId, floorId, deptId) {
  try {
    return {ok:true, code:nextDeviceCodeV5425_(siteId, floorId, deptId)};
  } catch(e) {
    return {ok:false, code:'', message:e && e.message ? e.message : String(e)};
  }
}
function previewDeviceCodeV5425() { return authCallPermV5471_('THIET_BI','XEM',previewDeviceCodeV5425_,arguments); }

function prepareDevicePayloadV5425_(payload) {
  const out = Object.assign({}, payload || {});

  if (out.ID_DANH_MUC) {
    const cats = safeReadRowsV513_('DANH_MUC_THIET_BI');
    const cat = cats.find(function(r){
      return String(r.ID_DANH_MUC || '') === String(out.ID_DANH_MUC || '');
    });
    if (!cat) throw new Error('Danh mục thiết bị không hợp lệ.');
    out.TEN_THIET_BI = String(cat.TEN_DANH_MUC || '').trim();
    if (!out.LOAI_THIET_BI) out.LOAI_THIET_BI = String(cat.MA_DANH_MUC || '').trim();
  }

  if (!String(out.ID_THIET_BI || '').trim() && !String(out.MA_THIET_BI || '').trim()) {
    out.MA_THIET_BI = nextDeviceCodeV5425_(out.ID_CO_SO, out.ID_TANG, out.ID_PHONG_BAN);
  }
  return out;
}

function saveDeviceRecordV5425_(payload) {
  const incoming = Object.assign({}, payload || {});
  const deviceId = String(incoming.ID_THIET_BI || '').trim();
  let current = null;

  // V5.4.58: khi SỬA thiết bị, các trường dưới đây chỉ được xem.
  // Người dùng/vị trí chỉ thay đổi qua transferDeviceUserV5421_().
  const lockedEditFields = [
    'ID_DANH_MUC','TEN_THIET_BI','MA_THIET_BI','LOAI_THIET_BI','HANG_SAN_XUAT',
    'ID_NHAN_SU_SU_DUNG','ID_PHONG_BAN','ID_CO_SO','ID_TANG','VI_TRI',
    'CHI_TIET_THIET_BI','HE_DIEU_HANH','PHIEN_BAN_HE_DIEU_HANH',
    'WINDOWS_LICENSE','OFFICE_LICENSE','KIEU_SU_DUNG'
  ];

  if (deviceId) {
    current = safeReadRowsV513_('THIET_BI').find(function(r){
      return String(r.ID_THIET_BI || '').trim() === deviceId;
    }) || null;
    if (!current) throw new Error('Không tìm thấy thiết bị cần sửa: ' + deviceId);
    lockedEditFields.forEach(function(k){ incoming[k] = current[k] == null ? '' : current[k]; });
  }

  let usageWarning = '';
  if (!current) usageWarning = applyDeviceUsageV5480_(incoming, {confirmed:!!incoming.XAC_NHAN_LECH_PHONG_BAN});
  const prepared = prepareDevicePayloadV5425_(incoming);
  if (current) {
    lockedEditFields.forEach(function(k){ prepared[k] = current[k] == null ? '' : current[k]; });
  }
  ensureDeviceUsageColumnV5480_();
  const out = saveDeviceRecordV543_(prepared);
  if (usageWarning) out.warning = usageWarning;
  return out;
}
function saveDeviceRecordV5425() { return authCallPermV5471_('THIET_BI',function(p){return String((p||{}).ID_THIET_BI||'').trim()?'SUA':'THEM';},function(p){return withScriptLockV5471_(function(){return saveDeviceRecordV5425_(p);});},arguments); }


/**
 * V5.4.26 - Ghi nhật ký chuyển người dùng trực tiếp.
 * NHAT_KY_HE_THONG vẫn giữ editable:false để UI/CRUD không sửa trực tiếp.
 */
function appendDeviceTransferHistoryV5427_(payload) {
  const sh=getSheet_(SHEET.LICH_SU_CHUYEN_THIET_BI);
  const headers=getHeaders_(sh);
  if(!headers||!headers.length)throw new Error('LICH_SU_CHUYEN_THIET_BI chưa có header.');
  const row={
    ID_LICH_SU:'LSC-'+Utilities.formatDate(new Date(),APP_CONFIG.TIMEZONE,'yyyyMMddHHmmss')+'-'+Utilities.getUuid().slice(0,5).toUpperCase(),
    ID_THIET_BI:String(payload.ID_THIET_BI||''),
    MA_THIET_BI:String(payload.MA_THIET_BI||''),
    ID_NHAN_SU_CU:String(payload.ID_NHAN_SU_CU||''),
    ID_NHAN_SU_MOI:String(payload.ID_NHAN_SU_MOI||''),
    ID_PHONG_BAN_CU:String(payload.ID_PHONG_BAN_CU||''),
    ID_PHONG_BAN_MOI:String(payload.ID_PHONG_BAN_MOI||''),
    ID_CO_SO_CU:String(payload.ID_CO_SO_CU||''),
    ID_CO_SO_MOI:String(payload.ID_CO_SO_MOI||''),
    ID_TANG_CU:String(payload.ID_TANG_CU||''),
    ID_TANG_MOI:String(payload.ID_TANG_MOI||''),
    VI_TRI_CU:String(payload.VI_TRI_CU||''),
    VI_TRI_MOI:String(payload.VI_TRI_MOI||''),
    LY_DO:String(payload.LY_DO||''),
    THOI_GIAN_CHUYEN:new Date(),
    ID_TAI_KHOAN_THUC_HIEN:String(payload.ID_TAI_KHOAN_THUC_HIEN||''),
    EMAIL_THUC_HIEN:String(payload.EMAIL_THUC_HIEN||'')
  };
  sh.appendRow(headers.map(function(h){
    return normalizeWriteValue_(Object.prototype.hasOwnProperty.call(row,h)?row[h]:'');
  }));
  return {ok:true,id:row.ID_LICH_SU};
}

function transferDeviceUserV5421_(payload) {
  payload=payload||{};
  const deviceId=String(payload.ID_THIET_BI||'').trim();
  if(!deviceId)throw new Error('Thiếu ID_THIET_BI.');

  const devices=safeReadRowsV513_('THIET_BI');
  const current=devices.find(function(r){return String(r.ID_THIET_BI||'')===deviceId;});
  if(!current)throw new Error('Không tìm thấy thiết bị: '+deviceId);

  const oldUser=String(current.ID_NHAN_SU_SU_DUNG||'');
  const oldDept=String(current.ID_PHONG_BAN||'');
  const oldSite=String(current.ID_CO_SO||'');
  const oldFloor=String(current.ID_TANG||'');
  const oldPos=String(current.VI_TRI||'');

  const oldMode=deviceUsageModeV5480_(current);
  const usage={KIEU_SU_DUNG:payload.KIEU_SU_DUNG,ID_NHAN_SU_SU_DUNG:payload.ID_NHAN_SU_SU_DUNG,ID_PHONG_BAN:payload.ID_PHONG_BAN};
  const usageWarning=applyDeviceUsageV5480_(usage,{keepUserId:oldUser,confirmed:!!payload.XAC_NHAN_LECH_PHONG_BAN});
  const newMode=usage.KIEU_SU_DUNG;
  const newUser=String(usage.ID_NHAN_SU_SU_DUNG||'');
  const newDept=String(usage.ID_PHONG_BAN||'');
  const newSite=String(payload.ID_CO_SO||'');
  const newFloor=String(payload.ID_TANG||'');
  const newPos=String(payload.VI_TRI||'');

  if(oldUser===newUser&&oldDept===newDept&&oldSite===newSite&&oldFloor===newFloor&&oldPos===newPos&&oldMode===newMode)
    throw new Error('Thông tin người dùng/vị trí mới không thay đổi.');

  ensureDeviceUsageColumnV5480_();
  const saved=saveRecordV53_('THIET_BI',{
    ID_THIET_BI:deviceId,
    KIEU_SU_DUNG:newMode,
    ID_NHAN_SU_SU_DUNG:newUser,
    ID_PHONG_BAN:newDept,
    ID_CO_SO:newSite,
    ID_TANG:newFloor,
    VI_TRI:newPos,
    NGAY_CAP_NHAT:new Date()
  });

  let warning=usageWarning;
  try{
    appendDeviceTransferHistoryV5427_({
      ID_THIET_BI:deviceId,
      MA_THIET_BI:String(current.MA_THIET_BI||''),
      ID_NHAN_SU_CU:oldUser,
      ID_NHAN_SU_MOI:newUser,
      ID_PHONG_BAN_CU:oldDept,
      ID_PHONG_BAN_MOI:newDept,
      ID_CO_SO_CU:oldSite,
      ID_CO_SO_MOI:newSite,
      ID_TANG_CU:oldFloor,
      ID_TANG_MOI:newFloor,
      VI_TRI_CU:oldPos,
      VI_TRI_MOI:newPos,
      LY_DO:String(payload.LY_DO||''),
      ID_TAI_KHOAN_THUC_HIEN:String(payload.ID_TAI_KHOAN||''),
      EMAIL_THUC_HIEN:String(payload.EMAIL||'')
    });
  }catch(e){
    warning=(warning?warning+' ':'')+'Đã chuyển người dùng nhưng chưa ghi được lịch sử chuyển: '+(e&&e.message?e.message:e);
  }
  return {ok:true,warning:warning,result:saved,devicePatch:devicePatchV5484_([deviceId])};
}
function transferDeviceUserV5421(payload) {
  const user=authRequireUserV5470_(authTokenFromArgsV5470_(arguments));
  authAssertPermissionV5471_(user,'THIET_BI','SUA');
  return transferDeviceUserV5421_(Object.assign({},payload||{},{ID_TAI_KHOAN:user.id||'',EMAIL:user.email||''}));
}

/**
 * V5.4.80 - HÌNH THỨC SỬ DỤNG THIẾT BỊ (cột KIEU_SU_DUNG trong THIET_BI)
 *  - "Cá nhân"               : giao cho 1 người, bắt buộc có ID_NHAN_SU_SU_DUNG.
 *  - "Dùng chung phòng ban"  : không gán người, bắt buộc có ID_PHONG_BAN.
 *  Dữ liệu cũ chưa có cột / để trống được suy ra: có người dùng = Cá nhân, chỉ có phòng ban = Dùng chung.
 *  Giữ nhất quán: nhân sự đổi phòng ban / nghỉ việc → trả về danh sách máy cá nhân để giao diện HỎI trước khi chuyển.
 */
const DEVICE_USAGE_V5480={PERSONAL:'Cá nhân',SHARED:'Dùng chung phòng ban'};

function deviceUsageModeV5480_(r) {
  r=r||{};
  const t=normalizeTextV543_(r.KIEU_SU_DUNG).trim();
  if(t.indexOf('CHUNG')>=0)return DEVICE_USAGE_V5480.SHARED;
  if(t.indexOf('CA NHAN')>=0)return DEVICE_USAGE_V5480.PERSONAL;
  if(String(r.ID_NHAN_SU_SU_DUNG||'').trim())return DEVICE_USAGE_V5480.PERSONAL;
  if(String(r.ID_PHONG_BAN||'').trim())return DEVICE_USAGE_V5480.SHARED;
  return '';
}

function isEmployeeResignedV5480_(e) {
  const t=normalizeTextV543_(e&&e.TRANG_THAI);
  return /NGHI VIEC|THOI VIEC|DA NGHI|NGUNG LAM|KHONG CON LAM|INACTIVE/.test(t);
}

/** Chuẩn hóa KIEU_SU_DUNG / người dùng / phòng ban trên payload (sửa trực tiếp p). Trả về câu cảnh báo (không chặn) nếu có. */
function applyDeviceUsageV5480_(p, opt) {
  opt=opt||{};
  const explicit=String(p.KIEU_SU_DUNG||'').trim();
  const mode=deviceUsageModeV5480_(p);
  p.KIEU_SU_DUNG=mode;
  if(!explicit)return '';
  if(mode===DEVICE_USAGE_V5480.SHARED){
    p.ID_NHAN_SU_SU_DUNG='';
    if(!String(p.ID_PHONG_BAN||'').trim())throw new Error('Thiết bị dùng chung phải chọn Phòng ban.');
    return '';
  }
  const empId=String(p.ID_NHAN_SU_SU_DUNG||'').trim();
  if(!empId)throw new Error('Thiết bị cá nhân phải chọn Người sử dụng.');
  const emp=safeReadRowsV513_('NHAN_SU').find(function(r){return String(r.ID_NHAN_SU||'')===empId;});
  if(!emp)throw new Error('Không tìm thấy nhân sự: '+empId);
  if(isEmployeeResignedV5480_(emp)&&empId!==String(opt.keepUserId||''))throw new Error('Nhân sự '+String(emp.HO_TEN||empId)+' đã nghỉ việc, không giao thiết bị được.');
  if(!String(p.ID_PHONG_BAN||'').trim()&&emp.ID_PHONG_BAN)p.ID_PHONG_BAN=String(emp.ID_PHONG_BAN);
  if(!opt.confirmed&&emp.ID_PHONG_BAN&&String(emp.ID_PHONG_BAN)!==String(p.ID_PHONG_BAN||''))
    return 'Lưu ý: '+String(emp.HO_TEN||empId)+' thuộc phòng ban khác với phòng ban ghi trên thiết bị.';
  return '';
}

/** Thêm cột KIEU_SU_DUNG vào cuối sheet THIET_BI nếu chưa có (chỉ kiểm tra 1 lần / 6 giờ). */
function ensureDeviceUsageColumnV5480_() {
  const key='PL_V5480_USAGE_COL';
  try{if(CacheService.getScriptCache().get(key))return;}catch(e){}
  const sh=getSheet_(SHEET.THIET_BI),headers=getHeaders_(sh);
  if(headers.indexOf('KIEU_SU_DUNG')<0){
    sh.getRange(1,sh.getLastColumn()+1).setValue('KIEU_SU_DUNG');
    memoForgetSheetV5477_(SHEET.THIET_BI);
    afterSheetWriteV5477_(SHEET.THIET_BI);
  }
  try{CacheService.getScriptCache().put(key,'1',21600);}catch(e){}
}

/** Admin chạy 1 lần (tùy chọn): tạo cột KIEU_SU_DUNG và điền giá trị suy ra cho các dòng đang trống. */
function backfillDeviceUsageV5480_() {
  try{CacheService.getScriptCache().remove('PL_V5480_USAGE_COL');}catch(e){}
  ensureDeviceUsageColumnV5480_();
  const lock=LockService.getDocumentLock();lock.waitLock(30000);
  try{
    const sh=getSheet_(SHEET.THIET_BI),headers=getHeaders_(sh),last=sh.getLastRow();
    if(last<2)return {ok:true,updated:0};
    const col=headers.indexOf('KIEU_SU_DUNG')+1,values=sh.getRange(2,1,last-1,headers.length).getValues();
    let updated=0;
    const out=values.map(function(row){
      const r=rowArrayToObject_(headers,row),cur=String(r.KIEU_SU_DUNG||'').trim();
      if(cur)return [cur];
      const m=deviceUsageModeV5480_(r);if(m)updated++;return [m];
    });
    if(updated)sh.getRange(2,col,out.length,1).setValues(out);
    memoForgetSheetV5477_(SHEET.THIET_BI);afterSheetWriteV5477_(SHEET.THIET_BI);
    return {ok:true,updated:updated,total:values.length};
  }finally{lock.releaseLock();}
}
function backfillDeviceUsageV5480() { return authCallAdminOrOwnerV5470_(backfillDeviceUsageV5480_, arguments); }

function personalDevicesOfV5480_(employeeId, devices) {
  const id=String(employeeId||'').trim();if(!id)return [];
  return (devices||safeReadRowsV513_('THIET_BI')).filter(function(r){
    if(String(r.ID_NHAN_SU_SU_DUNG||'')!==id)return false;
    if(deviceUsageModeV5480_(r)!==DEVICE_USAGE_V5480.PERSONAL)return false;
    return normalizeTextV543_(r.TRANG_THAI).indexOf('THANH LY')<0;
  });
}

/** So sánh nhân sự trước / sau khi lưu; trả về null nếu không cần hỏi gì. */
function employeeDeviceImpactV5480_(before, after) {
  const id=String(after.ID_NHAN_SU||before.ID_NHAN_SU||'').trim();
  const oldDept=String(before.ID_PHONG_BAN||''),newDept=String(after.ID_PHONG_BAN||'');
  const deptChanged=!!newDept&&oldDept!==newDept;
  const resigned=!isEmployeeResignedV5480_(before)&&isEmployeeResignedV5480_(after);
  if(!deptChanged&&!resigned)return null;
  const list=personalDevicesOfV5480_(id);
  if(!list.length)return null;
  const depts=safeReadRowsV513_('DANH_MUC_PHONG_BAN');
  const dn=function(d){const r=depts.find(function(x){return String(x.ID_PHONG_BAN||'')===String(d||'');});return r?String(r.TEN_PHONG_BAN||d):String(d||'');};
  return {
    employeeId:id,employeeName:String(after.HO_TEN||before.HO_TEN||id),
    deptChanged:deptChanged,resigned:resigned,newStatus:String(after.TRANG_THAI||''),
    oldDeptId:oldDept,oldDeptName:dn(oldDept),newDeptId:newDept,newDeptName:dn(newDept),
    devices:list.map(function(r){return {
      ID_THIET_BI:String(r.ID_THIET_BI||''),MA_THIET_BI:String(r.MA_THIET_BI||''),TEN_THIET_BI:String(r.TEN_THIET_BI||''),
      HANG_SAN_XUAT:String(r.HANG_SAN_XUAT||''),ID_PHONG_BAN:String(r.ID_PHONG_BAN||''),TEN_PHONG_BAN:dn(r.ID_PHONG_BAN),
      TRANG_THAI:String(r.TRANG_THAI||''),LECH_PHONG_BAN:!!newDept&&String(r.ID_PHONG_BAN||'')!==newDept
    };})
  };
}

/**
 * Chuyển phòng ban của các máy CÁ NHÂN về đúng phòng ban hiện tại của người đang quản lý.
 * Dùng cho "Chuyển ngay" sau khi sửa nhân sự và "chuyển sau" từ bộ lọc Lệch phòng ban.
 * Phòng ban đích do server tự lấy từ NHAN_SU (client không tự chọn). Cơ sở / tầng / vị trí giữ nguyên.
 */

/* =========================================================
 * V5.4.84 - GHI HÀNG LOẠT: đọc sheet 1 lần, ghi các dòng đổi, nhật ký ghi 1 lần nhiều dòng.
 * ========================================================= */
/** updates: {pk: {COT: giá trị}}. Trả {updated:[pk], missing:[pk]}. NGAY_CAP_NHAT tự ghi. */
function batchUpdateRowsV5484_(tableKey, updates) {
  const cfg=TABLES[resolveTableKey_(tableKey)],ids=Object.keys(updates||{});
  if(!ids.length)return {updated:[],missing:[]};
  const lock=LockService.getDocumentLock();lock.waitLock(30000);
  try{
    const sh=getSheet_(cfg.sheet),headers=getHeaders_(sh),pk=headers.indexOf(cfg.pk),last=sh.getLastRow();
    if(pk<0||last<2)return {updated:[],missing:ids};
    const data=sh.getRange(2,1,last-1,headers.length).getValues(),now=nowText_(),upIdx=headers.indexOf('NGAY_CAP_NHAT'),seen={},updated=[];
    for(let i=0;i<data.length;i++){
      const id=String(data[i][pk]).trim(),u=updates[id];if(!u||seen[id])continue;seen[id]=1;
      const row=data[i].slice();Object.keys(u).forEach(function(k){const c=headers.indexOf(k);if(c>=0)row[c]=normalizeWriteValue_(u[k]);});
      if(upIdx>=0)row[upIdx]=now;
      sh.getRange(i+2,1,1,headers.length).setValues([row]);updated.push(id);
    }
    memoForgetSheetV5477_(cfg.sheet);afterSheetWriteV5477_(cfg.sheet);
    return {updated:updated,missing:ids.filter(function(k){return !seen[k];})};
  }finally{lock.releaseLock();}
}
/** Thêm nhiều dòng vào cuối sheet bằng 1 lần setValues. objs: [{COT: giá trị}] */
function batchAppendRowsV5484_(sheetName, objs) {
  if(!objs||!objs.length)return 0;
  const lock=LockService.getDocumentLock();lock.waitLock(30000);
  try{const sh=getSheet_(sheetName),headers=getHeaders_(sh);
    sh.getRange(sh.getLastRow()+1,1,objs.length,headers.length).setValues(objs.map(function(o){return headers.map(function(h){return normalizeWriteValue_(Object.prototype.hasOwnProperty.call(o,h)?o[h]:'');});}));
    memoForgetSheetV5477_(sheetName);afterSheetWriteV5477_(sheetName);return objs.length;
  }finally{lock.releaseLock();}
}
/** entries: [[HANH_DONG, SHEET, ID, GHI_CHU], …] */
function writeSystemLogsV5484_(entries) {
  try{
    if(!entries||!entries.length)return;
    const now=nowText_(),stamp=Utilities.formatDate(new Date(),APP_CONFIG.TIMEZONE,'yyyyMMddHHmmss');
    batchAppendRowsV5484_(SHEET.NHAT_KY_HE_THONG,entries.map(function(e){const id='LOG-'+stamp+'-'+Utilities.getUuid().slice(0,5).toUpperCase();
      return {ID_LOG:id,ID_NHAT_KY:id,THOI_GIAN:now,NGAY_TAO:now,HANH_DONG:e[0],SHEET_NAME:e[1],CHUC_NANG:e[1],DOI_TUONG:e[1],ID_BAN_GHI:e[2],ID_DOI_TUONG:e[2],NOI_DUNG:e[3]||'',KET_QUA:'OK',GHI_CHU:e[3]||''};}));
  }catch(err){console.warn('Không ghi được nhật ký:',err);}
}
function transferHistoryRowV5484_(p) {
  return {ID_LICH_SU:'LSC-'+Utilities.formatDate(new Date(),APP_CONFIG.TIMEZONE,'yyyyMMddHHmmss')+'-'+Utilities.getUuid().slice(0,5).toUpperCase(),
    ID_THIET_BI:p.ID_THIET_BI||'',MA_THIET_BI:p.MA_THIET_BI||'',ID_NHAN_SU_CU:p.ID_NHAN_SU_CU||'',ID_NHAN_SU_MOI:p.ID_NHAN_SU_MOI||'',
    ID_PHONG_BAN_CU:p.ID_PHONG_BAN_CU||'',ID_PHONG_BAN_MOI:p.ID_PHONG_BAN_MOI||'',ID_CO_SO_CU:p.ID_CO_SO_CU||'',ID_CO_SO_MOI:p.ID_CO_SO_MOI||'',
    ID_TANG_CU:p.ID_TANG_CU||'',ID_TANG_MOI:p.ID_TANG_MOI||'',VI_TRI_CU:p.VI_TRI_CU||'',VI_TRI_MOI:p.VI_TRI_MOI||'',LY_DO:p.LY_DO||'',
    THOI_GIAN_CHUYEN:nowText_(),ID_TAI_KHOAN_THUC_HIEN:p.ID_TAI_KHOAN_THUC_HIEN||'',EMAIL_THUC_HIEN:p.EMAIL_THUC_HIEN||''};
}

function syncDeviceDeptWithOwnerV5480_(payload) {
  payload=payload||{};
  const ids=(Array.isArray(payload.deviceIds)?payload.deviceIds:[]).map(function(x){return String(x||'').trim();}).filter(Boolean);
  if(!ids.length)throw new Error('Chưa chọn thiết bị cần chuyển.');
  if(ids.length>500)throw new Error('Mỗi lần chuyển tối đa 500 thiết bị.');
  ensureDeviceUsageColumnV5480_();
  const devices=safeReadRowsV513_('THIET_BI'),employees=safeReadRowsV513_('NHAN_SU');
  const moved=[],skipped=[],updates={},hist=[];let histFail=0;
  ids.forEach(function(id){
    const d=devices.find(function(r){return String(r.ID_THIET_BI||'')===id;});
    if(!d){skipped.push({id:id,reason:'Không tìm thấy'});return;}
    if(deviceUsageModeV5480_(d)!==DEVICE_USAGE_V5480.PERSONAL){skipped.push({id:id,reason:'Máy dùng chung'});return;}
    const emp=employees.find(function(e){return String(e.ID_NHAN_SU||'')===String(d.ID_NHAN_SU_SU_DUNG||'');});
    const target=emp?String(emp.ID_PHONG_BAN||''):'';
    if(!target){skipped.push({id:id,reason:'Người dùng chưa có phòng ban'});return;}
    if(String(d.ID_PHONG_BAN||'')===target){skipped.push({id:id,reason:'Đã đúng phòng ban'});return;}
    updates[id]={ID_PHONG_BAN:target,KIEU_SU_DUNG:DEVICE_USAGE_V5480.PERSONAL};
    hist.push(transferHistoryRowV5484_({ID_THIET_BI:id,MA_THIET_BI:String(d.MA_THIET_BI||''),ID_NHAN_SU_CU:String(d.ID_NHAN_SU_SU_DUNG||''),ID_NHAN_SU_MOI:String(d.ID_NHAN_SU_SU_DUNG||''),ID_PHONG_BAN_CU:String(d.ID_PHONG_BAN||''),ID_PHONG_BAN_MOI:target,ID_CO_SO_CU:String(d.ID_CO_SO||''),ID_CO_SO_MOI:String(d.ID_CO_SO||''),ID_TANG_CU:String(d.ID_TANG||''),ID_TANG_MOI:String(d.ID_TANG||''),VI_TRI_CU:String(d.VI_TRI||''),VI_TRI_MOI:String(d.VI_TRI||''),LY_DO:String(payload.LY_DO||'Người sử dụng chuyển phòng ban'),ID_TAI_KHOAN_THUC_HIEN:String(payload.ID_TAI_KHOAN||''),EMAIL_THUC_HIEN:String(payload.EMAIL||'')}));
    moved.push(id);
  });
  if(moved.length){batchUpdateRowsV5484_('THIET_BI',updates);try{batchAppendRowsV5484_(SHEET.LICH_SU_CHUYEN_THIET_BI,hist);}catch(e){histFail=hist.length;}writeSystemLogsV5484_([['UPDATE',SHEET.THIET_BI,moved.join(','),'Đồng bộ phòng ban theo người sử dụng ('+moved.length+' TB)']]);}
  return {ok:true,moved:moved,skipped:skipped,
    warning:histFail?('Đã chuyển nhưng '+histFail+' thiết bị chưa ghi được lịch sử.'):'',
    devicePatch:moved.length?devicePatchV5484_(moved):null};
}
function syncDeviceDeptWithOwnerV5480(payload) {
  const user=authRequireUserV5470_(authTokenFromArgsV5470_(arguments));
  authAssertPermissionV5471_(user,'THIET_BI','SUA');
  return withScriptLockV5471_(function(){
    return syncDeviceDeptWithOwnerV5480_(Object.assign({},payload||{},{ID_TAI_KHOAN:user.id||'',EMAIL:user.email||''}));
  });
}

/**
 * V5.4.81 - BÁO HỎNG / BẢO TRÌ từ thanh menu Kho thiết bị.
 * Ghi 1 dòng BAO_TRI_THIET_BI (chỉ các cột sheet đang có) và cập nhật Tình trạng / Trạng thái thiết bị nếu chọn.
 */
function reportDeviceIssueV5481_(p) {
  p=p||{};
  const id=String(p.ID_THIET_BI||'').trim();if(!id)throw new Error('Thiếu thiết bị.');
  const moTa=String(p.MO_TA_SU_CO||'').trim();if(!moTa)throw new Error('Vui lòng nhập mô tả sự cố / nội dung bảo trì.');
  const dev=safeReadRowsV513_('THIET_BI').find(function(r){return String(r.ID_THIET_BI||'')===id;});
  if(!dev)throw new Error('Không tìm thấy thiết bị: '+id);
  const now=new Date();
  const saved=saveRecordV53_('BAO_TRI_THIET_BI',{
    ID_THIET_BI:id,MA_THIET_BI:String(dev.MA_THIET_BI||''),TEN_THIET_BI:String(dev.TEN_THIET_BI||''),
    NGAY_BAO_LOI:p.NGAY_BAO_LOI?new Date(p.NGAY_BAO_LOI):now,LOAI_BAO_TRI:String(p.LOAI_BAO_TRI||'Báo hỏng'),
    MO_TA_SU_CO:moTa,ID_NHAN_SU_SU_DUNG:String(dev.ID_NHAN_SU_SU_DUNG||''),ID_PHONG_BAN:String(dev.ID_PHONG_BAN||''),
    TRANG_THAI:'Chờ xử lý',NGUOI_BAO:String(p.EMAIL||''),ID_TAI_KHOAN_THUC_HIEN:String(p.ID_TAI_KHOAN||''),GHI_CHU:String(p.GHI_CHU||'')
  });
  const upd={ID_THIET_BI:id,NGAY_CAP_NHAT:now};let changed=false;
  if(String(p.TINH_TRANG||'').trim()&&String(p.TINH_TRANG)!==String(dev.TINH_TRANG||'')){upd.TINH_TRANG=String(p.TINH_TRANG);changed=true;}
  if(p.CHUYEN_BAO_TRI&&normalizeTextV543_(dev.TRANG_THAI).indexOf('BAO TRI')<0){upd.TRANG_THAI='Bảo trì';changed=true;}
  if(changed)saveRecordV53_('THIET_BI',upd);
  return {ok:true,id:saved&&saved.id,devicePatch:changed?devicePatchV5484_([id]):null};
}
function reportDeviceIssueV5481(payload) {
  const user=authRequireUserV5470_(authTokenFromArgsV5470_(arguments));
  authAssertPermissionV5471_(user,'THIET_BI','SUA');
  return withScriptLockV5471_(function(){return reportDeviceIssueV5481_(Object.assign({},payload||{},{ID_TAI_KHOAN:user.id||'',EMAIL:user.email||''}));});
}

/**
 * V5.4.81 - NHẬP THIẾT BỊ TỪ EXCEL.
 * rows: [{DANH_MUC, KIEU_SU_DUNG, NGUOI_SU_DUNG, PHONG_BAN, CO_SO, TANG, VI_TRI, HANG_SAN_XUAT, CHI_TIET_THIET_BI,
 *         HE_DIEU_HANH, PHIEN_BAN_HE_DIEU_HANH, IP_ADDRESS, TINH_TRANG, TRANG_THAI, GHI_CHU}]
 * Danh mục / người / phòng / cơ sở / tầng nhận ID, mã hoặc tên (không phân biệt hoa thường, dấu).
 * dryRun=true: chỉ kiểm tra, trả lỗi từng dòng. Nhập thật chỉ khi mọi dòng hợp lệ; mã thiết bị tự sinh.
 */
function importDevicesV5481_(req) {
  req=req||{};
  const rows=Array.isArray(req.rows)?req.rows:[];
  if(!rows.length)throw new Error('File không có dòng dữ liệu.');
  if(rows.length>300)throw new Error('Mỗi lần nhập tối đa 300 thiết bị (file có '+rows.length+' dòng).');
  const L={cat:safeReadRowsV513_('DANH_MUC_THIET_BI'),emp:safeReadRowsV513_('NHAN_SU'),dept:safeReadRowsV513_('DANH_MUC_PHONG_BAN'),site:safeReadRowsV513_('DANH_MUC_CO_SO'),floor:safeReadRowsV513_('DANH_MUC_TANG')};
  const n=function(v){return normalizeTextV543_(v).replace(/\s+/g,' ').trim();};
  const pick=function(list,val,keys,filter){const t=n(val);if(!t)return null;return list.filter(filter||function(){return true;}).find(function(r){return keys.some(function(k){return n(r[k])===t;});})||null;};
  const results=[],payloads=[];
  rows.forEach(function(src,i){
    const errs=[],line=i+2,p={};
    const cat=pick(L.cat,src.DANH_MUC,['ID_DANH_MUC','MA_DANH_MUC','TEN_DANH_MUC']);
    if(!cat)errs.push(src.DANH_MUC?'Danh mục "'+src.DANH_MUC+'" không có':'Thiếu danh mục');else p.ID_DANH_MUC=String(cat.ID_DANH_MUC);
    const site=pick(L.site,src.CO_SO,['ID_CO_SO','MA_CO_SO','TEN_CO_SO']);
    if(!site)errs.push(src.CO_SO?'Cơ sở "'+src.CO_SO+'" không có':'Thiếu cơ sở');else p.ID_CO_SO=String(site.ID_CO_SO);
    const floor=pick(L.floor,src.TANG,['ID_TANG','MA_TANG','TEN_TANG'],function(r){return !site||!r.ID_CO_SO||String(r.ID_CO_SO)===String(site.ID_CO_SO);});
    if(!floor)errs.push(src.TANG?'Tầng "'+src.TANG+'" không có ở cơ sở này':'Thiếu tầng');else p.ID_TANG=String(floor.ID_TANG);
    if(String(src.NGUOI_SU_DUNG||'').trim()){
      const e=pick(L.emp,src.NGUOI_SU_DUNG,['ID_NHAN_SU','MA_NHAN_VIEN','EMAIL','HO_TEN']);
      if(!e)errs.push('Người sử dụng "'+src.NGUOI_SU_DUNG+'" không có');else p.ID_NHAN_SU_SU_DUNG=String(e.ID_NHAN_SU);
    }
    if(String(src.PHONG_BAN||'').trim()){
      const d=pick(L.dept,src.PHONG_BAN,['ID_PHONG_BAN','MA_PHONG_BAN','TEN_PHONG_BAN']);
      if(!d)errs.push('Phòng ban "'+src.PHONG_BAN+'" không có');else p.ID_PHONG_BAN=String(d.ID_PHONG_BAN);
    }
    p.KIEU_SU_DUNG=String(src.KIEU_SU_DUNG||'').trim()||(p.ID_NHAN_SU_SU_DUNG?DEVICE_USAGE_V5480.PERSONAL:DEVICE_USAGE_V5480.SHARED);
    ['VI_TRI','HANG_SAN_XUAT','CHI_TIET_THIET_BI','HE_DIEU_HANH','PHIEN_BAN_HE_DIEU_HANH','IP_ADDRESS','TINH_TRANG','TRANG_THAI','GHI_CHU'].forEach(function(k){if(String(src[k]==null?'':src[k]).trim())p[k]=String(src[k]).trim();});
    if(!errs.length){try{applyDeviceUsageV5480_(p,{confirmed:true});}catch(e){errs.push(e.message);}}
    if(!errs.length&&!p.ID_PHONG_BAN)errs.push('Thiếu phòng ban');
    if(!errs.length){try{departmentCode2V5425_(p.ID_PHONG_BAN)||errs.push('Phòng ban chưa có mã');}catch(e){errs.push(e.message);}}
    results.push({line:line,ok:!errs.length,errors:errs,name:cat?String(cat.TEN_DANH_MUC||''):String(src.DANH_MUC||'')});
    payloads.push(p);
  });
  const bad=results.filter(function(r){return !r.ok;}).length;
  if(req.dryRun||bad)return {ok:!bad,dryRun:true,total:rows.length,valid:rows.length-bad,invalid:bad,results:results};
  ensureDeviceUsageColumnV5480_();
  // V5.4.84: sinh mã cho cả lô trong bộ nhớ (không đọc lại THIET_BI mỗi dòng) rồi ghi 1 lần.
  const existing=safeReadRowsV513_('THIET_BI'),used={},maxBy={};
  existing.forEach(function(r){const c=String(r.MA_THIET_BI||'').trim().toUpperCase();if(c)used[c]=1;});
  const nextCode=function(site,floor,dept){
    const prefix=floorCodeV5425_(floor)+siteCodeV5425_(site)+departmentCode2V5425_(dept);
    if(!(prefix in maxBy)){let m=0;Object.keys(used).forEach(function(c){if(c.indexOf(prefix)===0&&/^\d+$/.test(c.slice(prefix.length)))m=Math.max(m,Number(c.slice(prefix.length)));});maxBy[prefix]=m;}
    let no=maxBy[prefix]+1,code=prefix+String(no).padStart(2,'0');while(used[code]){no++;code=prefix+String(no).padStart(2,'0');}
    maxBy[prefix]=no;used[code]=1;return code;};
  const cats=safeReadRowsV513_('DANH_MUC_THIET_BI'),created=[],objs=[],now=nowText_();
  payloads.forEach(function(p,i){
    const cat=cats.find(function(r){return String(r.ID_DANH_MUC||'')===String(p.ID_DANH_MUC||'');})||{};
    p.TEN_THIET_BI=String(cat.TEN_DANH_MUC||'').trim();if(!p.LOAI_THIET_BI)p.LOAI_THIET_BI=String(cat.MA_DANH_MUC||'').trim();
    p.MA_THIET_BI=nextCode(p.ID_CO_SO,p.ID_TANG,p.ID_PHONG_BAN);
    const row=normalizeDevicePayloadV543_(p);row.ID_THIET_BI=generateId_('THIET_BI');row.NGAY_TAO=now;row.NGAY_CAP_NHAT=now;
    objs.push(row);created.push({line:results[i].line,id:row.ID_THIET_BI,code:row.MA_THIET_BI});
  });
  batchAppendRowsV5484_(SHEET.THIET_BI,objs);
  writeSystemLogsV5484_([['IMPORT',SHEET.THIET_BI,created.map(function(x){return x.code;}).join(','),'Nhập '+created.length+' thiết bị từ Excel']]);
  return {ok:true,dryRun:false,total:rows.length,created:created,devicePatch:devicePatchV5484_(created.map(function(x){return x.id;}))};
}
function importDevicesV5481(req) { return authCallPermV5471_('THIET_BI','THEM',function(r){return withScriptLockV5471_(function(){return importDevicesV5481_(r);});},arguments); }


/* =========================================================
 * V5.4.82 - KHUNG TRANG CHUNG (giao diện desktop mới cho 12 trang, trừ Kho thiết bị đang dùng)
 *  - getMyPermissionsV5482   : giao diện biết quyền để ẩn / mờ nút.
 *  - getPageBundleV5482      : 1 gói dữ liệu cho mỗi trang (dòng + số đếm tính sẵn).
 *  - setRecordStatusV5482    : đổi trạng thái hàng loạt (Ngừng / Khóa / Hủy …) bắt buộc lý do, ghi nhật ký.
 *  - proposalStatusV5482     : Từ chối / Hủy đề xuất (bắt buộc lý do).
 *  - resignEmployeesV5482    : Nghỉ việc → khóa tài khoản → trả danh sách máy cần thu hồi.
 *  Script property UI_V2_OFF = "employees,proposal" → tắt giao diện mới của các trang đó (quay về giao diện cũ).
 * ========================================================= */
const PAGE_V5482_TABLE_={departments:'DANH_MUC_PHONG_BAN',locations:'DANH_MUC_CO_SO',floors:'DANH_MUC_TANG',warehouses:'DM_KHO',maintenanceItems:'DM_THIETBI',employees:'NHAN_SU',users:'TAI_KHOAN',roles:'VAI_TRO',recovery:'KHO_THUHOI',disposal:'THANH_LY_THIET_BI',handbook:'CAM_NANG'};
const STATUS_BATCH_MAX_V5482_=200;

function getMyPermissionsV5482_(user) {
  const map=rbacMapV5477_(),perms={};
  Object.keys(RBAC_MODULE_LABEL_V5471_).forEach(function(m){perms[m]=user.isAdmin?['XEM','THEM','SUA','XOA','DUYET','XUAT_FILE']:(map[String(user.roleId||'')+'|'+m]||[]);});
  const off=String(PropertiesService.getScriptProperties().getProperty('UI_V2_OFF')||'').split(',').map(function(x){return x.trim();}).filter(Boolean);
  return {ok:true,isAdmin:!!user.isAdmin,roleId:String(user.roleId||''),employeeId:String(user.employeeId||''),perms:perms,pageModule:RBAC_PAGE_MODULE_V5471_,adminPages:AUTH_ADMIN_ONLY_PAGES_V5467_,rbacOff:!rbacEnforcedV5471_(),uiOff:off,modules:RBAC_MODULE_LABEL_V5471_};
}
function getMyPermissionsV5482() { return getMyPermissionsV5482_(authRequireUserV5470_(authTokenFromArgsV5470_(arguments))); }

function deviceBriefV5482_() {
  return safeReadRowsV513_('THIET_BI').map(function(r){return {ID_THIET_BI:r.ID_THIET_BI,MA_THIET_BI:r.MA_THIET_BI,TEN_THIET_BI:r.TEN_THIET_BI,LOAI_THIET_BI:r.LOAI_THIET_BI,HANG_SAN_XUAT:r.HANG_SAN_XUAT,CHI_TIET_THIET_BI:r.CHI_TIET_THIET_BI,ID_DANH_MUC:r.ID_DANH_MUC,ID_NHAN_SU_SU_DUNG:r.ID_NHAN_SU_SU_DUNG,ID_PHONG_BAN:r.ID_PHONG_BAN,ID_CO_SO:r.ID_CO_SO,ID_TANG:r.ID_TANG,VI_TRI:r.VI_TRI,TRANG_THAI:r.TRANG_THAI,TINH_TRANG:r.TINH_TRANG,KIEU_SU_DUNG:deviceUsageModeV5480_(r),SO_LUONG:r.SO_LUONG||''};});
}


/** V5.4.84: sau khi ghi chỉ trả các dòng thiết bị vừa đổi (giao diện vá vào danh sách), thay vì cả danh sách (~370 KB / 800 TB). */
function devicePatchV5484_(ids) {
  const want={};(ids||[]).forEach(function(id){if(id)want[String(id)]=1;});
  const rows=safeReadRowsV513_('THIET_BI').filter(function(r){return want[String(r.ID_THIET_BI||'')];});
  return {rows:rows,version:lookupsVersionV5484_(),dataVersion:readVersionV5487_("equipment")};
}
/** Số phiên bản danh mục: đổi khi ghi NHAN_SU / phòng ban / cơ sở / tầng / danh mục TB / kho / vai trò. */
function lookupsVersionV5484_() {
  const c=CacheService.getScriptCache();let v=null;try{v=c.get('PL_LK_VER_V5484');}catch(e){}
  if(!v){v=String(Date.now());try{c.put('PL_LK_VER_V5484',v,21600);}catch(e){}}
  return v;
}
function bumpLookupsVersionV5484_(){try{CacheService.getScriptCache().put('PL_LK_VER_V5484',String(Date.now()),21600);}catch(e){}}
const LEDGER_DAYS_V5484_=90;
const LEDGER_FIELDS_V5484_=['ID_GIAO_DICH','SO_PHIEU','NGAY_GIAO_DICH','LOAI_GIAO_DICH','ID_KHO','ID_THIET_BI','ID_DANH_MUC','MO_TA_CHI_TIET','SO_LUONG_NHAP','SO_LUONG_XUAT','TON_SAU_GIAO_DICH','DON_GIA','THANH_TIEN','NHA_CUNG_CAP','ID_NHAN_SU_NHAN','TINH_TRANG','GHI_CHU','TRANG_THAI','ID_CHUNG_TU_LIEN_QUAN','ID_PHONG_BAN_NHAN','ID_THIET_BI_CAP'];
/** Đọc ngày dạng Date, dd/MM/yyyy[ HH:mm[:ss]] hoặc yyyy-MM-dd → mili giây (0 nếu không đọc được). */
function parseDateV5484_(v){if(v instanceof Date)return v.getTime();const t=String(v||'').trim();let m=t.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);if(m)return new Date(+m[3],+m[2]-1,+m[1]).getTime();m=t.match(/^(\d{4})-(\d{2})-(\d{2})/);if(m)return new Date(+m[1],+m[2]-1,+m[3]).getTime();const d=Date.parse(t);return isNaN(d)?0:d;}
/** Thẻ kho đầy đủ của 1 mặt hàng (không giới hạn 90 ngày). */
function getStockCardV5484_(idKho,idThietBi){const b=getWarehouseDeviceNXTBundleV5420_();return {ok:true,rows:compactRowsV5484_((b.ledger||[]).filter(function(r){return String(r.ID_KHO||'')===String(idKho||'')&&String(r.ID_THIET_BI||'')===String(idThietBi||'');}),LEDGER_FIELDS_V5484_)};}
function getStockCardV5484(){return authCallPermV5471_('KHO_NHAP_XUAT_TON','XEM',getStockCardV5484_,arguments);}
function compactRowsV5484_(rows,fields){return (rows||[]).map(function(r){const o={};fields.forEach(function(k){const v=r[k];if(v!==''&&v!=null)o[k]=v;});return o;});}

function getPageBundleV5482_(page,opts) {
  opts=opts||{};
  if(opts.forceFresh){clearLookupCacheV5433_();nxtCacheClearV5477_();}
  const dataVersion=readVersionV5487_(page);
  if(!opts.forceFresh&&!opts.ledgerOnly&&!opts.extrasOnly&&opts.knownVersion===dataVersion)return {ok:true,page:page,notModified:true,dataVersion:dataVersion};
  if(page==='materialWarehouse'&&opts.ledgerOnly){
    const all=warehouseLedgerRowsV5448_(),since=Date.now()-LEDGER_DAYS_V5484_*86400000;
    return {ok:true,page:page,dataVersion:dataVersion,ledger:compactRowsV5484_(all.filter(function(r){const t=parseDateV5484_(r.NGAY_GIAO_DICH);return !t||t>=since;}),LEDGER_FIELDS_V5484_),ledgerDays:LEDGER_DAYS_V5484_,ledgerTotal:all.length};
  }
  if(opts.extrasOnly)return pageExtrasV5487_(page,dataVersion);
  const l=getLookupsCachedV5433_(),out={ok:true,page:page,dataVersion:dataVersion,rows:[],lookups:{employees:l.employees||[],departments:l.departments||[],sites:l.sites||[],floors:l.floors||[],categories:l.categories||[],warehouses:l.warehouses||[],roles:l.roles||[]},headers:[]};
  const haveDevices=!!(!opts.forceFresh&&opts.haveDevices&&opts.devicesVersion===readVersionV5487_('equipment'));
  const hdr=function(sheet){try{return safeHeadersV513_(sheet);}catch(e){return [];}};
  if(['employees','departments','locations','maintenanceItems'].indexOf(page)>=0&&!haveDevices)out.devices=deviceBriefV5482_();
  if(page==='employees'){
    out.rows=safeReadRowsV513_('NHAN_SU').map(safeRow_);out.headers=hdr('NHAN_SU');
    out.accounts=safeReadRowsV513_('TAI_KHOAN').map(function(a){return {ID_TAI_KHOAN:a.ID_TAI_KHOAN,ID_NHAN_SU:a.ID_NHAN_SU,EMAIL:a.EMAIL,ID_VAI_TRO:a.ID_VAI_TRO,TRANG_THAI:a.TRANG_THAI};});
  } else if(page==='departments'){out.rows=safeReadRowsV513_('DANH_MUC_PHONG_BAN').map(safeRow_);out.headers=hdr('DANH_MUC_PHONG_BAN');}
  else if(page==='locations'){out.rows=safeReadRowsV513_('DANH_MUC_TANG').map(safeRow_);out.headers=hdr('DANH_MUC_TANG');out.siteHeaders=hdr('DANH_MUC_CO_SO');}
  else if(page==='warehouses'){
    out.rows=safeReadRowsV513_('DM_KHO').map(safeRow_);out.headers=hdr('DM_KHO');
    out.extrasPending=true;
  } else if(page==='maintenanceItems'){
    out.rows=safeReadRowsV513_('DM_THIETBI').map(safeRow_);out.headers=hdr('DM_THIETBI');
    out.extrasPending=true;
  } else if(page==='users'){
    out.rows=safeReadRowsV513_('TAI_KHOAN').map(function(a){const r=safeRow_(a);r._HAS_PW=!!String(a.MAT_KHAU_HASH||'').trim();delete r.MAT_KHAU_HASH;delete r.MAT_KHAU_SALT;return r;});out.headers=hdr('TAI_KHOAN').filter(function(h){return ['MAT_KHAU_HASH','MAT_KHAU_SALT','AUTH_UID'].indexOf(h)<0;});
  } else if(page==='roles'||page==='permissions'){
    out.rows=authActiveRoleRowsV5467_().map(safeRow_);out.headers=hdr('VAI_TRO');
    out.accounts=safeReadRowsV513_('TAI_KHOAN').map(function(a){return {ID_TAI_KHOAN:a.ID_TAI_KHOAN,ID_VAI_TRO:a.ID_VAI_TRO,ID_NHAN_SU:a.ID_NHAN_SU,EMAIL:a.EMAIL,TRANG_THAI:a.TRANG_THAI};});
    out.permissions=safeReadRowsV513_('PHAN_QUYEN').map(function(r){const o={ID_VAI_TRO:r.ID_VAI_TRO,CHUC_NANG:String(r.CHUC_NANG||r.MODULE||'').trim().toUpperCase()};['XEM','THEM','SUA','XOA','DUYET','XUAT_FILE'].forEach(function(k){o[k]=authPermissionEnabledV5471_(r[k]);});return o;});
    out.modules=RBAC_MODULE_LABEL_V5471_;
    out.adminRoles=out.rows.filter(function(r){return authIsAdminV5467_(r.ID_VAI_TRO,r.TEN_VAI_TRO);}).map(function(r){return r.ID_VAI_TRO;});
  } else if(page==='proposal'){out.rows=normalizeProposalRowsV5463_().map(safeRow_);out.extrasPending=true;}
  else if(page==='materialWarehouse'){
    const b=stockSummaryV5487_();
    out.rows=compactRowsV5484_(b.stock,['ID_TON_KHO','ID_KHO','ID_THIET_BI','ID_DANH_MUC','MO_TA_CHI_TIET','SO_LUONG_NHAP','SO_LUONG_XUAT','SO_LUONG_TON','DON_GIA_BINH_QUAN','GIA_TRI_TON','TINH_TRANG','SO_PHIEU_NHAP_CUOI','NGAY_NHAP_CUOI']);
    out.ledger=null;out.ledgerDays=LEDGER_DAYS_V5484_;out.ledgerTotal=b.ledgerTotal;
    if(opts.withLedger){const since=Date.now()-LEDGER_DAYS_V5484_*86400000;out.ledger=compactRowsV5484_(warehouseLedgerRowsV5448_().filter(function(r){const t=parseDateV5484_(r.NGAY_GIAO_DICH);return !t||t>=since;}),LEDGER_FIELDS_V5484_);}
    out.lookups.warehouses=ensureWarehouseLookupV5447_(out.lookups).warehouses;
    out.warehousesNXT=out.lookups.warehouses;out.pendingReceive=pendingReceiveV5485_();
  }
  else if(page==='recovery'){out.rows=safeReadRowsV513_('KHO_THUHOI').map(safeRow_);out.disposal=safeReadRowsV513_('THANH_LY_THIET_BI').map(safeRow_);out.disposalProposals=disposalProposalsReadyV5486_();if(!haveDevices)out.devices=deviceBriefV5482_();}
  else if(page==='handbook'){const h=getCamNangPageDataV865_();out.rows=h.rows||[];out.headers=h.headers||[];}
  else throw new Error('Trang chưa hỗ trợ giao diện mới: '+page);
  out.lookupsVersion=lookupsVersionV5484_();
  if(!opts.forceFresh&&opts.lookupsVersion&&String(opts.lookupsVersion)===out.lookupsVersion){out.lookups=null;out.lookupsCached=true;}
  return out;
}
function getPageBundleV5482(page,opts) {
  page=String(page||'').trim();
  const token=authTokenFromArgsV5470_(arguments);
  if(typeof opts==='string')opts={};
  if(page==='proposal')authAssertPermissionV5471_(authRequireUserV5470_(token),'DE_XUAT_QUAN_LY','XEM');
  else authAssertPageAccessV5467_(page,token,'XEM');
  return getPageBundleV5482_(page,opts);
}

/** Đổi trạng thái hàng loạt. status: chuỗi ghi vào TRANG_THAI. Lý do bắt buộc (≥ 5 ký tự). */
function setRecordStatusV5482_(page,ids,status,reason,user) {
  const table=PAGE_V5482_TABLE_[page];if(!table)throw new Error('Trang không hỗ trợ đổi trạng thái: '+page);
  ids=(Array.isArray(ids)?ids:[ids]).map(function(x){return String(x||'').trim();}).filter(Boolean);
  if(!ids.length)throw new Error('Chưa chọn dòng nào.');
  if(ids.length>STATUS_BATCH_MAX_V5482_)throw new Error('Mỗi lần tối đa '+STATUS_BATCH_MAX_V5482_+' dòng.');
  status=String(status||'').trim();if(!status)throw new Error('Thiếu trạng thái mới.');
  reason=String(reason||'').trim();if(reason.length<5)throw new Error('Vui lòng nhập lý do (ít nhất 5 ký tự).');
  const cfg=TABLES[resolveTableKey_(table)],pk=cfg.pk,headers=safeHeadersV513_(table),rows=safeReadRowsV513_(table);
  const stopping=/NGUNG|KHOA|HUY|NGHI/.test(normalizeTextV543_(status));
  const devices=stopping&&['departments','maintenanceItems','floors','locations'].indexOf(page)>=0?safeReadRowsV513_('THIET_BI').filter(function(d){return normalizeTextV543_(d.TRANG_THAI).indexOf('THANH LY')<0;}):[];
  const emps=stopping&&page==='departments'?safeReadRowsV513_('NHAN_SU').filter(function(e){return !isEmployeeResignedV5480_(e);}):[];
  const accounts=stopping&&page==='roles'?safeReadRowsV513_('TAI_KHOAN'):[];
  let stockByKho={};if(stopping&&page==='warehouses'){try{(getWarehouseDeviceNXTBundleV5420_().stock||[]).forEach(function(r){stockByKho[r.ID_KHO]=(stockByKho[r.ID_KHO]||0)+toNumber_(r.SO_LUONG_TON);});}catch(e){}}
  const results=[],updates={},logs=[];
  ids.forEach(function(id){
    const cur=rows.find(function(r){return String(r[pk]||'')===id;});
    if(!cur){results.push({id:id,ok:false,reason:'Không tìm thấy'});return;}
    let block='';
    if(page==='departments'){const ne=emps.filter(function(e){return String(e.ID_PHONG_BAN||'')===id;}).length,nd=devices.filter(function(d){return String(d.ID_PHONG_BAN||'')===id;}).length;if(ne||nd)block='Còn '+ne+' nhân viên, '+nd+' thiết bị';}
    if(page==='maintenanceItems'){const nd=devices.filter(function(d){return String(d.ID_DANH_MUC||'')===id;}).length;if(nd)block='Còn '+nd+' thiết bị đang dùng danh mục này';}
    if(page==='floors'){const nd=devices.filter(function(d){return String(d.ID_TANG||'')===id;}).length;if(nd)block='Còn '+nd+' thiết bị trên tầng';}
    if(page==='locations'){const nd=devices.filter(function(d){return String(d.ID_CO_SO||'')===id;}).length;if(nd)block='Còn '+nd+' thiết bị ở cơ sở';}
    if(page==='roles'){if(authIsAdminV5467_(id,cur.TEN_VAI_TRO))block='Không ngừng được vai trò Admin';else{const na=accounts.filter(function(a){return String(a.ID_VAI_TRO||'')===id&&normalizeTextV543_(a.TRANG_THAI).indexOf('KHOA')<0;}).length;if(na)block='Còn '+na+' tài khoản dùng vai trò này';}}
    if(page==='warehouses'&&stockByKho[id]>0)block='Kho còn tồn '+stockByKho[id];
    if(page==='users'&&String(user.id||'')===id&&stopping)block='Không tự khóa tài khoản đang đăng nhập';
    if(block){results.push({id:id,ok:false,reason:block});return;}
    const upd={};upd[pk]=id;upd.TRANG_THAI=status;
    if(headers.indexOf('NGAY_CAP_NHAT')>=0)
    if(/HUY/.test(normalizeTextV543_(status))){if(headers.indexOf('NGAY_HUY')>=0)upd.NGAY_HUY=nowText_();if(headers.indexOf('ID_TAI_KHOAN_HUY')>=0)upd.ID_TAI_KHOAN_HUY=String(user.id||'');if(headers.indexOf('LY_DO_HUY')>=0)upd.LY_DO_HUY=reason;}
    if(headers.indexOf('LY_DO_HUY')<0&&headers.indexOf('GHI_CHU')>=0)upd.GHI_CHU=(String(cur.GHI_CHU||'').trim()?String(cur.GHI_CHU).trim()+' | ':'')+'['+status+' '+nowText_()+'] '+reason;
    delete upd[pk];updates[id]=upd;logs.push(['STATUS',table,id,status+' · '+reason+' · '+String(user.email||'')]);
    results.push({id:id,ok:true});
  });
  const bu=batchUpdateRowsV5484_(table,updates);bu.missing.forEach(function(id){const r=results.find(function(x){return x.id===id;});if(r){r.ok=false;r.reason='Không ghi được';}});
  writeSystemLogsV5484_(logs.filter(function(l){return bu.updated.indexOf(l[2])>=0;}));
  if(page==='users'){try{CacheService.getScriptCache().remove('V5477_RBAC');}catch(e){}}
  return {ok:true,status:status,done:results.filter(function(r){return r.ok;}).length,results:results};
}
function setRecordStatusV5482(page,ids,status,reason) {
  const token=authTokenFromArgsV5470_(arguments),user=authRequireUserV5470_(token);
  authAssertPageAccessV5467_(page==='disposal'?'recovery':page,token,/HUY/.test(normalizeTextV543_(status))?'XOA':'SUA');
  return withScriptLockV5471_(function(){return setRecordStatusV5482_(page,ids,status,reason,user);});
}

/** Đề xuất: Từ chối / Hủy (tìm trong 3 sheet đề xuất như approveProposal_). */
function proposalStatusV5482_(ids,status,reason,user) {
  ids=(Array.isArray(ids)?ids:[ids]).map(function(x){return String(x||'').trim();}).filter(Boolean);
  if(!ids.length)throw new Error('Chưa chọn đề xuất.');if(ids.length>STATUS_BATCH_MAX_V5482_)throw new Error('Mỗi lần tối đa '+STATUS_BATCH_MAX_V5482_+' đề xuất.');
  reason=String(reason||'').trim();if(reason.length<5)throw new Error('Vui lòng nhập lý do (ít nhất 5 ký tự).');
  const targets=['DE_XUAT_MUA_THIET_BI','DE_XUAT_THANH_LY','BAO_TRI_THIET_BI'],results=[],pending={},logs=[];
  ids.forEach(function(id){
    let done=false;
    for(let t=0;t<targets.length&&!done;t++){
      const cfg=TABLES[targets[t]],headers=safeHeadersV513_(targets[t]);
      const row=safeReadRowsV513_(targets[t]).find(function(r){return String(r[cfg.pk]||'')===id||String(r.ID_DE_XUAT||'')===id||String(r.MA_PHIEU||'')===id;});
      if(!row)continue;
      const st=normalizeTextV543_(row.TRANG_THAI);
      if((targets[t]==='DE_XUAT_THANH_LY'&&/DA DUYET|HOAN THANH/.test(st))||(targets[t]==='BAO_TRI_THIET_BI'&&/DANG SUA|HOAN THANH/.test(st))){results.push({id:id,ok:false,reason:'Đề xuất đã duyệt – dùng “Hủy duyệt”'});done=true;break;}
      if(targets[t]==='DE_XUAT_MUA_THIET_BI'&&/HOAN THANH|CHO NHAP KHO|NHAP MOT PHAN|DA DUYET/.test(st)){results.push({id:id,ok:false,reason:'Đề xuất đã duyệt – dùng “Hủy duyệt”'});done=true;break;}
      if(/DA DUYET|HOAN THANH/.test(st)&&status!=='Đã hủy'){results.push({id:id,ok:false,reason:'Đề xuất đã duyệt'});done=true;break;}
      if(/HUY|TU CHOI/.test(st)){results.push({id:id,ok:false,reason:'Đề xuất đã '+row.TRANG_THAI});done=true;break;}
      const upd={};upd[cfg.pk]=row[cfg.pk];upd.TRANG_THAI=status;if(headers.indexOf('NGAY_CAP_NHAT')>=0)
      if(status==='Đã hủy'){if(headers.indexOf('NGAY_HUY')>=0)upd.NGAY_HUY=nowText_();if(headers.indexOf('ID_TAI_KHOAN_HUY')>=0)upd.ID_TAI_KHOAN_HUY=String(user.id||'');}
      if(headers.indexOf('LY_DO_HUY')>=0)upd.LY_DO_HUY=reason;else if(headers.indexOf('GHI_CHU')>=0)upd.GHI_CHU=(String(row.GHI_CHU||'').trim()?String(row.GHI_CHU).trim()+' | ':'')+'['+status+' '+nowText_()+'] '+reason;
      const pkv=String(row[cfg.pk]);delete upd[cfg.pk];(pending[targets[t]]=pending[targets[t]]||{})[pkv]=upd;logs.push([status==='Từ chối'?'REJECT':'CANCEL',cfg.sheet,pkv,reason+' · '+String(user.email||'')]);
      results.push({id:id,ok:true});done=true;
    }
    if(!done)results.push({id:id,ok:false,reason:'Không tìm thấy'});
  });
  Object.keys(pending).forEach(function(t){batchUpdateRowsV5484_(t,pending[t]);});writeSystemLogsV5484_(logs);
  return {ok:true,done:results.filter(function(r){return r.ok;}).length,results:results};
}
function proposalStatusV5482(ids,status,reason) {
  const token=authTokenFromArgsV5470_(arguments),user=authRequireUserV5470_(token);
  status=status==='Từ chối'?'Từ chối':'Đã hủy';
  authAssertPermissionV5471_(user,'DE_XUAT_QUAN_LY',status==='Từ chối'?'DUYET':'XOA');
  return withScriptLockV5471_(function(){return proposalStatusV5482_(ids,status,reason,user);});
}
function approveProposalsV5482(ids) {
  const token=authTokenFromArgsV5470_(arguments),user=authRequireUserV5470_(token);
  authAssertPermissionV5471_(user,'DE_XUAT_QUAN_LY','DUYET');
  ids=(Array.isArray(ids)?ids:[ids]).map(function(x){return String(x||'').trim();}).filter(Boolean).slice(0,STATUS_BATCH_MAX_V5482_);
  // V5.4.85: đề xuất Xuất dùng / Mua mới → duyệt là xuất kho + tạo thiết bị (SL đủ, lô cũ nhất, thiếu tồn thì bỏ qua).
  return withScriptLockV5471_(function(){
    // V5.4.86: Thanh lý → Chờ thanh lý (tự thu hồi); Sửa chữa → Đang sửa (máy Bảo trì).
    const G={DE_XUAT_MUA_THIET_BI:[],DE_XUAT_THANH_LY:[],BAO_TRI_THIET_BI:[]},results=[];
    ids.forEach(function(id){const l=proposalLocateV5486_(id);if(!l)results.push({id:id,ok:false,reason:'Không tìm thấy'});else G[l.table].push(l.id);});
    let extra={},touched=[];
    if(G.DE_XUAT_THANH_LY.length){const r=approveDisposalsV5486_(G.DE_XUAT_THANH_LY,user,'');results.push.apply(results,r.results);touched=touched.concat(r.touched);}
    if(G.BAO_TRI_THIET_BI.length){const r=approveMaintenanceV5486_(G.BAO_TRI_THIET_BI,user,'');results.push.apply(results,r.results);touched=touched.concat(r.touched);}
    if(G.DE_XUAT_MUA_THIET_BI.length){const r=approvePurchaseProposalsV5485_(G.DE_XUAT_MUA_THIET_BI.map(function(id){return {id:id};}),user);results.push.apply(results,r.results);extra={handover:r.handover};if(r.devicePatch)touched=touched.concat(r.devicePatch.rows.map(function(x){return String(x.ID_THIET_BI);}));}
    if(touched.length)extra.devicePatch=devicePatchV5484_(touched);
    return Object.assign({ok:true,done:results.filter(function(r){return r.ok;}).length,results:results},extra);
  });
}

/** Nghỉ việc: đổi trạng thái nhân sự, khóa tài khoản liên kết, trả danh sách máy cá nhân cần thu hồi. */
function resignEmployeesV5482_(ids,reason,user) {
  ids=(Array.isArray(ids)?ids:[ids]).map(function(x){return String(x||'').trim();}).filter(Boolean);
  if(!ids.length)throw new Error('Chưa chọn nhân viên.');
  reason=String(reason||'').trim();if(reason.length<5)throw new Error('Vui lòng nhập lý do (ít nhất 5 ký tự).');
  const emps=safeReadRowsV513_('NHAN_SU'),eh=safeHeadersV513_('NHAN_SU'),accs=safeReadRowsV513_('TAI_KHOAN'),results=[],impacts=[],upE={},upA={},logs=[];
  ids.forEach(function(id){
    const e=emps.find(function(x){return String(x.ID_NHAN_SU||'')===id;});
    if(!e){results.push({id:id,ok:false,reason:'Không tìm thấy'});return;}
    if(isEmployeeResignedV5480_(e)){results.push({id:id,ok:false,reason:'Đã nghỉ việc'});return;}
    if(String(user.employeeId||'')===id){results.push({id:id,ok:false,reason:'Không tự cho mình nghỉ việc'});return;}
    const upd={ID_NHAN_SU:id,TRANG_THAI:'Nghỉ việc'};
    if(eh.indexOf('NGAY_NGHI_VIEC')>=0)upd.NGAY_NGHI_VIEC=nowText_();
    if(eh.indexOf('LY_DO_NGHI')>=0)upd.LY_DO_NGHI=reason;else if(eh.indexOf('GHI_CHU')>=0)upd.GHI_CHU=(String(e.GHI_CHU||'').trim()?String(e.GHI_CHU).trim()+' | ':'')+'[Nghỉ việc '+nowText_()+'] '+reason;
    delete upd.ID_NHAN_SU;upE[id]=upd;
    let locked=0;
    accs.filter(function(a){return String(a.ID_NHAN_SU||'')===id&&normalizeTextV543_(a.TRANG_THAI).indexOf('KHOA')<0;}).forEach(function(a){upA[String(a.ID_TAI_KHOAN)]={TRANG_THAI:'Khóa'};locked++;});
    logs.push(['RESIGN','NHAN_SU',id,reason+' · khóa '+locked+' tài khoản · '+String(user.email||'')]);
    const imp=employeeDeviceImpactV5480_(Object.assign({},e),Object.assign({},e,{TRANG_THAI:'Nghỉ việc'}));
    if(imp)impacts.push(imp);
    results.push({id:id,ok:true,lockedAccounts:locked,devices:imp?imp.devices.length:0});
  });
  batchUpdateRowsV5484_('NHAN_SU',upE);batchUpdateRowsV5484_('TAI_KHOAN',upA);writeSystemLogsV5484_(logs);
  return {ok:true,done:results.filter(function(r){return r.ok;}).length,results:results,impacts:impacts};
}
function resignEmployeesV5482(ids,reason) {
  const token=authTokenFromArgsV5470_(arguments),user=authRequireUserV5470_(token);
  authAssertPageAccessV5467_('employees',token,'SUA');
  return withScriptLockV5471_(function(){return resignEmployeesV5482_(ids,reason,user);});
}

function getDeviceTransferHistoryV5428_(deviceId) {
  const id = String(deviceId || '').trim();
  if (!id) throw new Error('Thiếu ID thiết bị khi tải lịch sử.');

  // V5.4.84: chỉ đọc các dòng có ID_THIET_BI khớp (TextFinder) thay vì cả sheet lịch sử.
  const sh = getSheet_(SHEET.LICH_SU_CHUYEN_THIET_BI);
  const lastCol = sh.getLastColumn(), lastRow = sh.getLastRow();
  if (lastRow < 2 || lastCol < 1) return {ok:true,count:0,rows:[],sheet:'LICH_SU_CHUYEN_THIET_BI'};
  const headers = sh.getRange(1,1,1,lastCol).getDisplayValues()[0].map(function(h){ return String(h || '').trim(); });
  const col = headers.indexOf('ID_THIET_BI');
  if (col < 0) return {ok:true,count:0,rows:[],sheet:'LICH_SU_CHUYEN_THIET_BI'};
  const hits = sh.getRange(2,col+1,lastRow-1,1).createTextFinder(id).matchCase(true).matchEntireCell(true).findAll();
  const rows = hits.map(function(h){ return rowArrayToObject_(headers, sh.getRange(h.getRow(),1,1,lastCol).getDisplayValues()[0]); })
    .filter(function(r){ return String(r.ID_THIET_BI || '').trim() === id; });

  const employees = safeReadRowsV513_('NHAN_SU');
  const departments = safeReadRowsV513_('DANH_MUC_PHONG_BAN');
  const sites = safeReadRowsV513_('DANH_MUC_CO_SO');
  const floors = safeReadRowsV513_('DANH_MUC_TANG');

  function findName_(list,key,id,names) {
    const r = list.find(function(x){ return String(x[key] || '') === String(id || ''); });
    if (!r) return String(id || '');
    for (let i=0;i<names.length;i++) if (r[names[i]]) return String(r[names[i]]);
    return String(id || '');
  }

  rows.forEach(function(r){
    r.TEN_NHAN_SU_CU = findName_(employees,'ID_NHAN_SU',r.ID_NHAN_SU_CU,['HO_TEN']);
    r.TEN_NHAN_SU_MOI = findName_(employees,'ID_NHAN_SU',r.ID_NHAN_SU_MOI,['HO_TEN']);
    r.TEN_PHONG_BAN_CU = findName_(departments,'ID_PHONG_BAN',r.ID_PHONG_BAN_CU,['TEN_PHONG_BAN']);
    r.TEN_PHONG_BAN_MOI = findName_(departments,'ID_PHONG_BAN',r.ID_PHONG_BAN_MOI,['TEN_PHONG_BAN']);
    r.TEN_CO_SO_CU = findName_(sites,'ID_CO_SO',r.ID_CO_SO_CU,['TEN_CO_SO']);
    r.TEN_CO_SO_MOI = findName_(sites,'ID_CO_SO',r.ID_CO_SO_MOI,['TEN_CO_SO']);
    r.TEN_TANG_CU = findName_(floors,'ID_TANG',r.ID_TANG_CU,['TEN_TANG']);
    r.TEN_TANG_MOI = findName_(floors,'ID_TANG',r.ID_TANG_MOI,['TEN_TANG']);
  });

  rows.sort(function(a,b){
    return String(b.THOI_GIAN_CHUYEN || '').localeCompare(String(a.THOI_GIAN_CHUYEN || ''));
  });

  return {
    ok:true,
    count:rows.length,
    rows:rows,
    sheet:'LICH_SU_CHUYEN_THIET_BI'
  };
}
function getDeviceTransferHistoryV5428() { return authCallPermV5471_('THIET_BI','XEM',getDeviceTransferHistoryV5428_,arguments); }

/* Alias giữ tương thích nếu nơi khác còn gọi tên cũ. */
function warehouseLedgerRowsV5448_() {
  const rows = safeReadRowsV513_('KHO_NHAPXUATTON');
  return rows.map(function(r){
    const x = Object.assign({}, r);
    // compatibility aliases for existing UI renderer
    x.SO_LUONG_VAO = toNumber_(x.SO_LUONG_NHAP || 0);
    x.SO_LUONG_RA = toNumber_(x.SO_LUONG_XUAT || 0);
    x.ID_CHUNG_TU = x.SO_PHIEU || '';
    return x;
  });
}

function buildWarehouseStockV5448_(ledger, devices, categories) {
  const map = {};
  const devMap = {};
  const catMap = {};
  (devices || []).forEach(function(d){ devMap[String(d.ID_THIET_BI || '')] = d; });
  (categories || []).forEach(function(c){ catMap[String(c.ID_DANH_MUC || '')] = c; });
  (ledger || []).forEach(function(r){
    const st = String(r.TRANG_THAI || '').trim().toUpperCase();
    if (st === 'HUY' || st === 'ĐÃ HỦY' || st === 'DA HUY') return;
    const kho = String(r.ID_KHO || WAREHOUSE_DEFAULT_V5447.ID_KHO);
    const dev = String(r.ID_THIET_BI || '');
    if (!dev) return;
    const key = kho + '|' + dev;
    if (!map[key]) map[key] = {ID_TON_KHO:'TON-'+key,ID_KHO:kho,ID_THIET_BI:dev,ID_DANH_MUC:String(r.ID_DANH_MUC||''),MO_TA_CHI_TIET:'',SO_PHIEU_NHAP_CUOI:'',NGAY_NHAP_CUOI:'',SO_LUONG_NHAP_CUOI:0,TINH_TRANG:'',SO_LUONG_NHAP:0,SO_LUONG_XUAT:0,SO_LUONG_TON:0,DON_GIA_BINH_QUAN:0,GIA_TRI_TON:0,NGAY_CAP_NHAT:''};
    const x = map[key];
    if (!x.ID_DANH_MUC && r.ID_DANH_MUC) x.ID_DANH_MUC = String(r.ID_DANH_MUC);
    const qIn = toNumber_(r.SO_LUONG_NHAP || r.SO_LUONG_VAO || 0);
    const qOut = toNumber_(r.SO_LUONG_XUAT || r.SO_LUONG_RA || 0);
    x.SO_LUONG_NHAP += qIn;
    x.SO_LUONG_XUAT += qOut;
    x.SO_LUONG_TON += qIn - qOut;
    if (qIn > 0) {
      if (String(r.MO_TA_CHI_TIET || '').trim()) x.MO_TA_CHI_TIET = String(r.MO_TA_CHI_TIET || '').trim();
      x.SO_PHIEU_NHAP_CUOI = r.SO_PHIEU || r.ID_CHUNG_TU || x.SO_PHIEU_NHAP_CUOI;
      x.NGAY_NHAP_CUOI = r.NGAY_GIAO_DICH || r.NGAY_TAO || x.NGAY_NHAP_CUOI;
      x.SO_LUONG_NHAP_CUOI = qIn;
      if (String(r.TINH_TRANG || '').trim()) x.TINH_TRANG = String(r.TINH_TRANG || '').trim();
    }
    const price = toNumber_(r.DON_GIA || 0);
    if (qIn > 0 && price > 0) x.DON_GIA_BINH_QUAN = price;
    x.NGAY_CAP_NHAT = r.NGAY_GIAO_DICH || r.NGAY_CAP_NHAT || r.NGAY_TAO || x.NGAY_CAP_NHAT;
  });
  return Object.keys(map).map(function(k){
    const x = map[k], d = devMap[String(x.ID_THIET_BI || '')] || {};
    x.ID_DANH_MUC = x.ID_DANH_MUC || d.ID_DANH_MUC || '';
    const c = catMap[String(x.ID_DANH_MUC || '')] || {};
    x.MA_HANG = d.MA_THIET_BI || c.MA_DANH_MUC || '';
    x.TEN_HANG = d.TEN_THIET_BI || c.TEN_DANH_MUC || '';
    x.LOAI_THIET_BI = d.LOAI_THIET_BI || c.NHOM_THIET_BI || '';
    x.DON_VI_TINH = 'Cái';
    x.GIA_TRI_TON = x.SO_LUONG_TON * x.DON_GIA_BINH_QUAN;
    x.TINH_TRANG_TON = x.SO_LUONG_TON > 0 ? 'CÒN TỒN' : 'HẾT TỒN';
    return x;
  });
}

function currentWarehouseStockQtyV5448_(ledger, warehouseId, deviceId) {
  return (ledger || []).reduce(function(sum,r){
    if (String(r.ID_KHO || '') !== String(warehouseId || '')) return sum;
    if (String(r.ID_THIET_BI || '') !== String(deviceId || '')) return sum;
    const st = String(r.TRANG_THAI || '').trim().toUpperCase();
    if (st === 'HUY' || st === 'ĐÃ HỦY' || st === 'DA HUY') return sum;
    return sum + toNumber_(r.SO_LUONG_NHAP || r.SO_LUONG_VAO || 0) - toNumber_(r.SO_LUONG_XUAT || r.SO_LUONG_RA || 0);
  },0);
}

function appendWarehouseTxnV5448_(obj) {
  const sh = getSheet_(SHEET.KHO_NHAPXUATTON);
  const headers = getHeaders_(sh);
  sh.appendRow(headers.map(function(h){ return normalizeWriteValue_(obj[h]); }));
  afterSheetWriteV5477_(SHEET.KHO_NHAPXUATTON);
  return obj;
}

/* V5.4.77 - Cache kết quả Kho NXT (tồn kho tính từ sổ) 2 phút; xóa ngay khi sổ kho / thiết bị / danh mục thay đổi qua app. */
const NXT_CACHE_KEY_V5477_='V5477_NXT',NXT_CACHE_TTL_V5477_=120;
function nxtCacheClearV5477_(){cacheRemoveLargeV5477_(NXT_CACHE_KEY_V5477_);cacheRemoveLargeV5477_('V5487_STOCK_SUMMARY');}
function getWarehouseDeviceNXTBundleV5420_() {
  const hit=cacheGetLargeV5477_(NXT_CACHE_KEY_V5477_);
  if(hit){hit.cached=true;return hit;}
  const res=buildWarehouseDeviceNXTBundleV5477_();
  cachePutLargeV5477_(NXT_CACHE_KEY_V5477_,res,NXT_CACHE_TTL_V5477_);
  return res;
}
function buildWarehouseDeviceNXTBundleV5477_() {
  const ledger = warehouseLedgerRowsV5448_();
  const devices = safeReadRowsV513_('THIET_BI');
  const categories = safeReadRowsV513_('DM_THIETBI');
  const stockAll = buildWarehouseStockV5448_(ledger, devices, categories);
  // V5.4.53: tab TỒN KHO chỉ nhận các dòng còn tồn thực tế > 0.
  const stock = stockAll.filter(function(r){ return Number(r.SO_LUONG_TON || 0) > 0; });
  const lookups = ensureWarehouseLookupV5447_(getLookupsCachedV5433_());
  lookups.categories = categories;
  function norm(v){ return String(v || '').trim().toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/Đ/g,'D'); }
  const inbound = ledger.filter(function(r){ return norm(r.LOAI_GIAO_DICH).indexOf('NHAP') >= 0 || Number(r.SO_LUONG_NHAP || 0) > 0; });
  const outbound = ledger.filter(function(r){ return norm(r.LOAI_GIAO_DICH).indexOf('XUAT') >= 0 || Number(r.SO_LUONG_XUAT || 0) > 0; });
  // V5.4.77: inbound / outbound là phần lọc từ ledger → không gửi lại; giao diện tự lọc theo PL_DERIVE (cùng điều kiện ở trên).
  return {ok:true,version:'5.4.77-stock-positive-only',PL_DERIVE:{inbound:['ledger','NHAP'],outbound:['ledger','XUAT']},stock:stock,ledger:ledger,devices:devices,lookups:lookups,usingVirtualWarehouse:!!((lookups.warehouses||[])[0]&&(lookups.warehouses||[])[0]._VIRTUAL),defaultWarehouseId:WAREHOUSE_DEFAULT_V5447.ID_KHO,counts:{inbound:inbound.length,outbound:outbound.length,stockLines:stock.length,stockQty:stock.reduce(function(s,r){return s+Number(r.SO_LUONG_TON||0);},0)}};
}

/** V5.4.47 - Kho mặc định nội bộ khi DM_KHO chưa có dữ liệu. */
const WAREHOUSE_DEFAULT_V5447 = {
  ID_KHO: 'KHO-MAC-DINH', MA_KHO: 'KHO-MAC-DINH', TEN_KHO: 'KHO MẶC ĐỊNH', VI_TRI_KHO: '', TRANG_THAI: 'Hoạt động', _VIRTUAL: true
};
function ensureWarehouseLookupV5447_(lookups){ lookups=lookups||{}; const rows=Array.isArray(lookups.warehouses)?lookups.warehouses.slice():[]; if(!rows.length)rows.push(Object.assign({},WAREHOUSE_DEFAULT_V5447)); lookups.warehouses=rows; return lookups; }
function normalizeWarehouseIdV5447_(id){ const s=String(id||'').trim(); return s||WAREHOUSE_DEFAULT_V5447.ID_KHO; }

function getWarehouseDeviceNXTBundleV5446_() { return getWarehouseDeviceNXTBundleV5420_(); }
function getWarehouseDeviceNXTBundleV5446() { return authCallPermV5471_('KHO_NHAP_XUAT_TON','XEM',getWarehouseDeviceNXTBundleV5446_,arguments); }

function generateWarehouseDeviceIdV5452_() {
  const date = Utilities.formatDate(new Date(), APP_CONFIG.TIMEZONE, 'yyyyMMddHHmmss');
  return 'KTB-' + date + '-' + Utilities.getUuid().slice(0,5).toUpperCase();
}

function saveWarehouseInboundV5446_(payload) {
  payload=Object.assign({},payload||{});
  const kho=normalizeWarehouseIdV5447_(payload.ID_KHO), categoryId=String(payload.ID_DANH_MUC||'').trim(), qty=toNumber_(payload.SO_LUONG_NHAP||0);
  if(!categoryId) throw new Error('Vui lòng chọn thiết bị từ DM_THIETBI.');
  if(qty<=0) throw new Error('Số lượng nhập phải lớn hơn 0.');
  const cat=readTable_('DM_THIETBI').rows.find(function(r){return String(r.ID_DANH_MUC||'')===categoryId;});
  if(!cat) throw new Error('Không tìm thấy thiết bị trong DM_THIETBI: '+categoryId);
  const dev=generateWarehouseDeviceIdV5452_();
  const ledger=warehouseLedgerRowsV5448_(), before=currentWarehouseStockQtyV5448_(ledger,kho,dev), price=toNumber_(payload.DON_GIA||0), now=nowText_();
  const txnDate=String(payload.NGAY_GIAO_DICH||'').trim()||now;
  const warehouseDescription=String(payload.MO_TA_CHI_TIET===undefined?'':payload.MO_TA_CHI_TIET).trim();
  const allowed=['Tốt','Bình thường','Thiết bị mới','Thiết bị cũ','Hư hỏng','Cần kiểm tra'];
  const state=String(payload.TINH_TRANG||'').trim();
  if(state && allowed.indexOf(state)<0) throw new Error('Tình trạng khi nhập không hợp lệ.');
  const row={ID_GIAO_DICH:generateId_('KHO_NHAPXUATTON'),SO_PHIEU:nextDocumentNo_('NK'),NGAY_GIAO_DICH:txnDate,LOAI_GIAO_DICH:'NHAP',ID_KHO:kho,ID_THIET_BI:dev,ID_DANH_MUC:categoryId,MO_TA_CHI_TIET:warehouseDescription,SO_LUONG_NHAP:qty,SO_LUONG_XUAT:0,TON_SAU_GIAO_DICH:before+qty,DON_GIA:price,THANH_TIEN:qty*price,NHA_CUNG_CAP:payload.NHA_CUNG_CAP||'',ID_NHAN_SU_NHAN:'',TINH_TRANG:state,ID_CHUNG_TU_LIEN_QUAN:payload.ID_CHUNG_TU_LIEN_QUAN||'',ID_TAI_KHOAN_THUC_HIEN:payload.ID_TAI_KHOAN_THUC_HIEN||'',GHI_CHU:payload.GHI_CHU||'',TRANG_THAI:'HOAN_THANH',NGAY_TAO:now,NGAY_CAP_NHAT:now};
  appendWarehouseTxnV5448_(row);
  writeSystemLog_('NHAP_KHO',SHEET.KHO_NHAPXUATTON,row.ID_GIAO_DICH,'Nhập kho '+row.SO_PHIEU+' · '+String(cat.TEN_DANH_MUC||categoryId)+' · SL '+qty);
  return {ok:true,id:row.ID_GIAO_DICH,deviceId:dev,documentNo:row.SO_PHIEU,stockPatch:warehouseTxnPatchV5487_(row,ledger)};
}
function saveWarehouseInboundV5446() { return authCallPermV5471_('KHO_NHAP_XUAT_TON','THEM',function(p){return withScriptLockV5471_(function(){return saveWarehouseInboundV5446_(p);});},arguments); }

function saveWarehouseOutboundV5446_(payload) {
  payload=Object.assign({},payload||{});
  const stockId=String(payload.ID_TON_KHO||'').trim(), qty=toNumber_(payload.SO_LUONG||payload.SO_LUONG_XUAT||0);
  if(!stockId) throw new Error('Vui lòng chọn dòng tồn kho cần xuất.');
  if(qty<=0) throw new Error('Số lượng xuất phải lớn hơn 0.');
  const data=buildWarehouseDeviceNXTBundleV5477_() /* V5.4.77: kiểm tra tồn luôn tính mới từ sổ, không dùng cache */, stock=(data.stock||[]).find(function(r){return String(r.ID_TON_KHO||'')===stockId;});
  if(!stock) throw new Error('Không tìm thấy dòng tồn kho.');
  const remain=toNumber_(stock.SO_LUONG_TON||0); if(remain<qty) throw new Error('Tồn kho không đủ. Hiện còn '+remain+', yêu cầu xuất '+qty+'.');
  const price=toNumber_(payload.DON_GIA||stock.DON_GIA_BINH_QUAN||0), now=nowText_();
  const row={ID_GIAO_DICH:generateId_('KHO_NHAPXUATTON'),SO_PHIEU:nextDocumentNo_('XK'),NGAY_GIAO_DICH:now,LOAI_GIAO_DICH:'XUAT',ID_KHO:normalizeWarehouseIdV5447_(stock.ID_KHO),ID_THIET_BI:stock.ID_THIET_BI||'',ID_DANH_MUC:stock.ID_DANH_MUC||'',MO_TA_CHI_TIET:stock.MO_TA_CHI_TIET||'',SO_LUONG_NHAP:0,SO_LUONG_XUAT:qty,TON_SAU_GIAO_DICH:remain-qty,DON_GIA:price,THANH_TIEN:qty*price,NHA_CUNG_CAP:'',ID_NHAN_SU_NHAN:payload.ID_NHAN_SU_NHAN||'',TINH_TRANG:payload.TINH_TRANG||'',ID_CHUNG_TU_LIEN_QUAN:payload.ID_CHUNG_TU_LIEN_QUAN||'',ID_TAI_KHOAN_THUC_HIEN:payload.ID_TAI_KHOAN_THUC_HIEN||'',GHI_CHU:payload.GHI_CHU||payload.NOI_DUNG||'',TRANG_THAI:'HOAN_THANH',NGAY_TAO:now,NGAY_CAP_NHAT:now};
  appendWarehouseTxnV5448_(row); writeSystemLog_('XUAT_KHO',SHEET.KHO_NHAPXUATTON,row.ID_GIAO_DICH,'Xuất kho '+row.SO_PHIEU+' · SL '+qty); return {ok:true,id:row.ID_GIAO_DICH,documentNo:row.SO_PHIEU,stockPatch:warehouseTxnPatchV5487_(row,data.ledger||[])};
}
function saveWarehouseOutboundV5446() { return authCallPermV5471_('KHO_NHAP_XUAT_TON','THEM',function(p){return withScriptLockV5471_(function(){return saveWarehouseOutboundV5446_(p);});},arguments); }

function getDeviceKhoBundleV5416_() {
  const devices = safeReadRowsV513_('THIET_BI');
  const inbound = safeReadRowsV513_('KHO_NHAP');
  const stock = safeReadRowsV513_('KHO_TON');
  const ledger = safeReadRowsV513_('NHAP_XUAT_TON');
  const recovery = safeReadRowsV513_('THU_HOI_THIET_BI');
  const disposal = safeReadRowsV513_('THANH_LY_THIET_BI');
  const lookups = getLookupsCachedV5433_();

  function norm_(v) {
    return String(v || '').trim().toUpperCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/Đ/g,'D');
  }
  const allocation = ledger.filter(function(r) {
    const t = norm_(r.LOAI_GIAO_DICH);
    return t.indexOf('CAP_PHAT') >= 0 || t === 'XUAT' || t.indexOf('XUAT_KHO') >= 0 || t.indexOf('CAP PHAT') >= 0;
  });

  const out = {
    ok:true,
    version:'5.4.77-warehouse-dedup',
    devices:devices,
    warehouse:{
      allocation:allocation,
      recovery:recovery,
      stockLedger:ledger,
      disposal:disposal
    },
    lookups:lookups
  };
  // V5.4.77: stockIn / stock / stockLedger là cùng sheet KHO_NHAPXUATTON → gửi 1 lần, giao diện tự dựng lại.
  if (inbound === ledger) plAliasV5477_(out,'warehouse.stockIn','warehouse.stockLedger'); else out.warehouse.stockIn = inbound;
  if (stock === ledger) plAliasV5477_(out,'warehouse.stock','warehouse.stockLedger'); else out.warehouse.stock = stock;
  return out;
}
function getDeviceKhoBundleV5416() { return authCallPermV5471_('KHO_NHAP_XUAT_TON','XEM',getDeviceKhoBundleV5416_,arguments); }

function saveWarehouseRecordV5416_(kind, payload) {
  kind = String(kind || '').trim();
  payload = Object.assign({}, payload || {});
  const today = Utilities.formatDate(new Date(), APP_CONFIG.TIMEZONE, APP_CONFIG.DATE_FORMAT);

  if (kind === 'stockIn') {
    if (!payload.NGAY_NHAP) payload.NGAY_NHAP = today;
    if (!payload.SO_LUONG) payload.SO_LUONG = 1;
    if (!payload.DON_VI_TINH) payload.DON_VI_TINH = 'Cái';
    if (!payload.LOAI_QUAN_LY) payload.LOAI_QUAN_LY = payload.ID_THIET_BI ? 'THEO_TAI_SAN' : 'THEO_SO_LUONG';
    if (!payload.TRANG_THAI) payload.TRANG_THAI = 'Đã nhập';
    if (payload.SO_LUONG && payload.DON_GIA && !payload.THANH_TIEN) {
      payload.THANH_TIEN = toNumber_(payload.SO_LUONG) * toNumber_(payload.DON_GIA);
    }
    const r = saveRecordV53_('KHO_NHAP', payload);
    return {ok:true,kind:kind,result:r,data:getDeviceKhoBundleV5416_()};
  }

  if (kind === 'recovery') {
    if (!payload.NGAY_THU_HOI) payload.NGAY_THU_HOI = today;
    if (!payload.SO_LUONG_THU_HOI) payload.SO_LUONG_THU_HOI = 1;
    if (!payload.DON_VI_TINH) payload.DON_VI_TINH = 'Cái';
    const r = saveRecordV53_('THU_HOI_THIET_BI', payload);
    return {ok:true,kind:kind,result:r,data:getDeviceKhoBundleV5416_()};
  }

  if (kind === 'disposal') {
    if (!payload.NGAY_THANH_LY) payload.NGAY_THANH_LY = today;
    if (!payload.SO_LUONG_THANH_LY) payload.SO_LUONG_THANH_LY = 1;
    if (!payload.DON_VI_TINH) payload.DON_VI_TINH = 'Cái';
    if (!payload.TRANG_THAI) payload.TRANG_THAI = 'Hoàn thành';
    if (payload.SO_LUONG_THANH_LY && payload.GIA_THANH_LY && !payload.THANH_TIEN_THANH_LY) {
      payload.THANH_TIEN_THANH_LY = toNumber_(payload.SO_LUONG_THANH_LY) * toNumber_(payload.GIA_THANH_LY);
    }
    const r = saveRecordV53_('THANH_LY_THIET_BI', payload);
    return {ok:true,kind:kind,result:r,data:getDeviceKhoBundleV5416_()};
  }

  throw new Error('Nghiệp vụ kho không hỗ trợ ghi trực tiếp: ' + kind);
}
function saveWarehouseRecordV5416() {
  return authCallPermV5471_(function(kind){return String(kind||'').trim()==='stockIn'?'KHO_NHAP_XUAT_TON':'THU_HOI_THANH_LY';},
    function(kind,p){p=p||{};return String(p.ID_THU_HOI||p.ID_THANH_LY||p.ID_NHAP_KHO||'').trim()?'SUA':'THEM';},
    saveWarehouseRecordV5416_,arguments);
}

function getDevicePageDataV5443_(opts) {
  opts=opts&&typeof opts==='object'?opts:{};
  if(opts.forceFresh)clearLookupCacheV5433_();
  const dataVersion=readVersionV5487_('equipment');
  if(!opts.forceFresh&&opts.knownVersion===dataVersion)return {ok:true,notModified:true,dataVersion:dataVersion};
  const devices=safeReadRowsV513_('THIET_BI');
  const l=getLookupsCachedV5433_();
  return {
    ok:true,page:'equipment',sheet:'THIET_BI',count:devices.length,dataVersion:dataVersion,lookupsVersion:lookupsVersionV5484_(),
    headers:devices.length?Object.keys(devices[0]):safeHeadersV513_('THIET_BI'),
    devices:devices,
    lookups:{
      categories:l.categories||[],employees:l.employees||[],departments:l.departments||[],
      sites:l.sites||[],floors:l.floors||[],warehouses:l.warehouses||[]
    },
    stats:buildDeviceStatsV543_(devices)
  };
}
function getDevicePageDataV5443() { return authCallPermV5471_('THIET_BI','XEM',getDevicePageDataV5443_,arguments); }

function saveDeviceRecordV543_(payload) {
  const clean = normalizeDevicePayloadV543_(payload || {});
  const result = saveRecordV53_('THIET_BI', clean);
  return { ok:true, persisted:true, sheet:'THIET_BI', id:result && result.id, action:result && result.action, devicePatch:devicePatchV5484_([result && result.id]) };
}
function saveDeviceRecordV543() { return authCallPermV5471_('THIET_BI',function(p){return String((p||{}).ID_THIET_BI||'').trim()?'SUA':'THEM';},function(p){return withScriptLockV5471_(function(){return saveDeviceRecordV543_(p);});},arguments); }

function getDeviceSchemaV543_() {
  return ['ID_THIET_BI','ID_THIET_BI_CU','MA_THIET_BI','TEN_THIET_BI','ID_DANH_MUC','LOAI_THIET_BI','HANG_SAN_XUAT','CHI_TIET_THIET_BI','VI_TRI','HE_DIEU_HANH','PHIEN_BAN_HE_DIEU_HANH','WINDOWS_LICENSE','OFFICE_LICENSE','IP_ADDRESS','TINH_TRANG','TRANG_THAI','ID_NHAN_SU_SU_DUNG','ID_PHONG_BAN','ID_CO_SO','ID_TANG','HINH_ANH','GHI_CHU','NGAY_TAO','NGUOI_TAO','NGAY_CAP_NHAT','KIEU_SU_DUNG'];
}

function normalizeDevicePayloadV543_(payload) {
  const out = {};
  getDeviceSchemaV543_().forEach(function(k){ if (Object.prototype.hasOwnProperty.call(payload,k)) out[k]=payload[k]; });
  if (!String(out.MA_THIET_BI || '').trim()) throw new Error('Thiếu mã thiết bị.');
  if (!String(out.TEN_THIET_BI || '').trim()) throw new Error('Thiếu tên thiết bị.');
  if (!String(out.LOAI_THIET_BI || '').trim()) out.LOAI_THIET_BI = 'Desktop';
  if (!String(out.TINH_TRANG || '').trim()) out.TINH_TRANG = 'Tốt';
  if (!String(out.TRANG_THAI || '').trim()) out.TRANG_THAI = 'Đang sử dụng';
  return out;
}

function buildDeviceStatsV543_(rows) {
  rows = Array.isArray(rows) ? rows : [];
  const s = { total:rows.length, using:0, stock:0, repair:0, disposed:0, good:0, issue:0 };
  rows.forEach(function(r){
    const st = normalizeTextV543_(r.TRANG_THAI), tt = normalizeTextV543_(r.TINH_TRANG);
    if (st.indexOf('DANG SU DUNG') >= 0) s.using++;
    if (st.indexOf('KHO') >= 0) s.stock++;
    if (st.indexOf('BAO TRI') >= 0 || st.indexOf('SUA') >= 0) s.repair++;
    if (st.indexOf('THANH LY') >= 0) s.disposed++;
    if (tt.indexOf('TOT') >= 0) s.good++;
    if (tt.indexOf('LOI') >= 0 || tt.indexOf('HONG') >= 0 || tt.indexOf('KEM') >= 0) s.issue++;
  });
  return s;
}

function normalizeTextV543_(v) {
  return String(v || '').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').replace(/Đ/g,'D').toUpperCase();
}


/**
 * V5.4.8 - Mẫu in đề xuất PHILONGMNGV3.
 * Chỉ đọc dữ liệu thật từ các sheet chuẩn hiện tại.
 */

function getCompanyConfigV549_() {
  const fallback={TEN_CONG_TY:'PHI LONG TECHNOLOGY',DIA_CHI:'52 Nguyễn Văn Linh, Đà Nẵng',DIEN_THOAI:'(0236) 3 888 000',EMAIL:'philong@philong.com.vn',WEBSITE:'www.philong.com.vn'};
  try{
    const raw=PropertiesService.getScriptProperties().getProperty('COMPANY_CONFIG_V549');
    return Object.assign({},fallback,raw?JSON.parse(raw):{});
  }catch(e){return fallback;}
}
function getSystemConfigV549(authToken){authAssertPageAccessV5467_('systemConfig',authToken);return {ok:true,company:getCompanyConfigV549_(),storage:'SCRIPT_PROPERTIES'};}
function saveSystemConfigV549(payload,authToken){
  authAssertPageAccessV5467_('systemConfig',authToken);
  const allowed=['TEN_CONG_TY','DIA_CHI','DIEN_THOAI','EMAIL','WEBSITE'],clean={};
  allowed.forEach(function(k){if(payload&&Object.prototype.hasOwnProperty.call(payload,k))clean[k]=String(payload[k]||'').trim();});
  PropertiesService.getScriptProperties().setProperty('COMPANY_CONFIG_V549',JSON.stringify(clean));
  return getSystemConfigV549(authToken);
}
function auditDatabaseSchemaV549_(){
  const expected=Object.keys(SHEET).map(function(k){return SHEET[k];}).sort();
  const actual=getDb_().getSheets().map(function(s){return s.getName();}).sort();
  return {ok:expected.join('|')===actual.join('|'),expectedCount:expected.length,actualCount:actual.length,missing:expected.filter(function(x){return actual.indexOf(x)<0;}),unexpected:actual.filter(function(x){return expected.indexOf(x)<0;}),expected:expected,actual:actual};
}
function auditDatabaseSchemaV549() { return authCallAdminOrOwnerV5470_(auditDatabaseSchemaV549_, arguments); }

function getProposalPrintDataV548_(proposalId) {
  proposalId = String(proposalId || '').trim();
  if (!proposalId) throw new Error('Thiếu mã đề xuất.');

  const proposals = safeReadRowsV513_('DE_XUAT_MUA_THIET_BI');
  let proposal = proposals.find(function(r) {
    return String(r.ID_DE_XUAT || '') === proposalId ||
           String(r.MA_PHIEU || '') === proposalId;
  });

  // Cho phép in mẫu thanh lý nếu ID nằm ở DE_XUAT_THANH_LY.
  let proposalType = 'MUA';
  if (!proposal) {
    const disposal = safeReadRowsV513_('DE_XUAT_THANH_LY');
    proposal = disposal.find(function(r) {
      return String(r.ID_DE_XUAT || '') === proposalId ||
             String(r.MA_PHIEU || '') === proposalId;
    });
    if (proposal) proposalType = 'THANH_LY';
  }
  // Bảo trì cũng dùng chung bộ nút Xem / Sửa / Duyệt / PDF / Word.
  if (!proposal) {
    const maintenance = safeReadRowsV513_('BAO_TRI_THIET_BI');
    proposal = maintenance.find(function(r) {
      return String(r.ID_BAO_TRI || '') === proposalId ||
             String(r.ID_DE_XUAT || '') === proposalId;
    });
    if (proposal) {
      proposalType = 'BAO_TRI';
      const device = safeReadRowsV513_('THIET_BI').find(function(r) {
        return String(r.ID_THIET_BI || '') === String(proposal.ID_THIET_BI || '');
      }) || {};
      proposal = Object.assign({}, proposal, {
        ID_DE_XUAT: proposal.ID_DE_XUAT || proposal.ID_BAO_TRI || '',
        NGAY_DE_XUAT: proposal.NGAY_DE_XUAT || proposal.NGAY_BAO_LOI || '',
        NOI_DUNG_DE_XUAT: proposal.NOI_DUNG_DE_XUAT || proposal.MO_TA_SU_CO || '',
        MUC_DICH_SU_DUNG: proposal.MUC_DICH_SU_DUNG || proposal.PHUONG_AN_XU_LY || '',
        TEN_THIET_BI: proposal.TEN_THIET_BI || device.TEN_THIET_BI || '',
        ID_DANH_MUC: proposal.ID_DANH_MUC || device.ID_DANH_MUC || '',
        DON_GIA_DU_KIEN: proposal.DON_GIA_DU_KIEN || proposal.CHI_PHI || '',
        THANH_TIEN: proposal.THANH_TIEN || proposal.CHI_PHI || ''
      });
    }
  }
  if (!proposal) throw new Error('Không tìm thấy phiếu đề xuất: ' + proposalId);

  const employees = safeReadRowsV513_('NHAN_SU');
  const departments = safeReadRowsV513_('DANH_MUC_PHONG_BAN');
  const categories = safeReadRowsV513_('DANH_MUC_THIET_BI');
  const company = getCompanyConfigV549_();

  function employeeName(id) {
    const r = employees.find(function(x){ return String(x.ID_NHAN_SU || '') === String(id || ''); });
    return r ? String(r.HO_TEN || id || '') : String(id || '');
  }
  function departmentName(id) {
    const r = departments.find(function(x){ return String(x.ID_PHONG_BAN || '') === String(id || ''); });
    return r ? String(r.TEN_PHONG_BAN || r.TEN || id || '') : String(id || '');
  }
  function categoryName(id) {
    const r = categories.find(function(x){ return String(x.ID_DANH_MUC || '') === String(id || ''); });
    return r ? String(r.TEN_DANH_MUC || r.MA_DANH_MUC || id || '') : String(id || '');
  }

  return {
    ok: true,
    proposalType: proposalType,
    proposal: proposal,
    display: {
      code: proposal.MA_PHIEU || proposal.ID_DE_XUAT || proposalId,
      requester: employeeName(proposal.ID_NHAN_SU_DE_XUAT || proposal.ID_NHAN_SU || ''),
      department: departmentName(proposal.ID_PHONG_BAN || ''),
      category: categoryName(proposal.ID_DANH_MUC || ''),
      approver: employeeName(proposal.ID_NHAN_SU_DUYET || proposal.ID_NGUOI_DUYET || '')
    },
    company: {
      TEN_CONG_TY: company.TEN_CONG_TY || 'PHI LONG TECHNOLOGY',
      DIA_CHI: company.DIA_CHI || '52 Nguyễn Văn Linh, Đà Nẵng',
      DIEN_THOAI: company.DIEN_THOAI || '(0236) 3 888 000',
      EMAIL: company.EMAIL || 'philong@philong.com.vn',
      WEBSITE: company.WEBSITE || 'www.philong.com.vn'
    }
  };
}
function getProposalPrintDataV548() { return authCallPermV5471_('DE_XUAT_QUAN_LY','XEM',getProposalPrintDataV548_,arguments); }

function approveProposal_(id){
  id=String(id||'').trim();if(!id)throw new Error('Thiếu mã đề xuất.');
  const targets=['DE_XUAT_MUA_THIET_BI','DE_XUAT_THANH_LY','BAO_TRI_THIET_BI'];
  for(let t=0;t<targets.length;t++){
    const key=targets[t],cfg=TABLES[key],sh=getSheet_(cfg.sheet),headers=getHeaders_(sh);
    const cols=[cfg.pk,'ID_DE_XUAT','MA_PHIEU'];let sheetRow=-1;
    // V5.4.84: tìm bằng TextFinder, chỉ đọc 1 dòng (trước đây đọc cả 3 sheet cho mỗi đề xuất).
    for(let c=0;c<cols.length&&sheetRow<2;c++){const idx=headers.indexOf(cols[c]);if(idx>=0)sheetRow=findSheetRowByValueV5477_(sh,idx,id);}
    if(sheetRow>1){const row=rowArrayToObject_(headers,sh.getRange(sheetRow,1,1,headers.length).getValues()[0]);if(headers.indexOf('TRANG_THAI')>=0)row.TRANG_THAI='Đã duyệt';if(headers.indexOf('NGAY_CAP_NHAT')>=0)row.NGAY_CAP_NHAT=nowText_();sh.getRange(sheetRow,1,1,headers.length).setValues([headers.map(function(h){return normalizeWriteValue_(row[h]);})]);memoForgetSheetV5477_(cfg.sheet);writeSystemLog_('APPROVE',cfg.sheet,row[cfg.pk]||id,'Duyệt đề xuất');return{ok:true,id:id,status:'Đã duyệt'};}
  }
  throw new Error('Không tìm thấy đề xuất: '+id);
}
function approveProposal() { const user=authRequireUserV5470_(authTokenFromArgsV5470_(arguments));authAssertPermissionV5471_(user,'DE_XUAT_QUAN_LY','DUYET');const id=authStripArgsV5470_(arguments)[0];return withScriptLockV5471_(function(){return approveProposalRouteV5485_(id,user);}); }
function getEmailAlertConfig(authToken){authAssertPageAccessV5467_('emailConfig',authToken);const p=PropertiesService.getScriptProperties();let rows=[];try{rows=JSON.parse(p.getProperty('EMAIL_ALERT_CONFIG_V54')||'[]');}catch(e){rows=[];}if(!rows.length)rows=[{ID:'MAINTENANCE_DUE',BAT:'TẮT',SO_NGAY_BAO_TRUOC:7,GIO_GUI:'07:00',EMAIL_QUAN_TRI:''}];return{ok:true,rows:rows,logs:[]};}
function saveEmailAlertConfig(payload,authToken){authAssertPageAccessV5467_('emailConfig',authToken);payload=payload||{};const id=String(payload.ID||'').trim();if(!id)throw new Error('Thiếu ID cấu hình email.');const rows=getEmailAlertConfig(authToken).rows||[],i=rows.findIndex(function(r){return String(r.ID)===id;});if(i>=0)rows[i]=Object.assign({},rows[i],payload);else rows.push(payload);PropertiesService.getScriptProperties().setProperty('EMAIL_ALERT_CONFIG_V54',JSON.stringify(rows));return{ok:true,rows:rows,logs:[]};}
function saveRolePermissions(roleId,rows,authToken){try{return saveRolePermissionsV5477_(roleId,rows,authToken);}finally{rbacCacheClearV5477_();memoForgetSheetV5477_(SHEET.PHAN_QUYEN);}}
function saveRolePermissionsV5477_(roleId,rows,authToken){authAssertPageAccessV5467_('permissions',authToken);roleId=String(roleId||'').trim();rows=Array.isArray(rows)?rows:[];if(!roleId)throw new Error('Thiếu ID vai trò.');if(roleId==='VR0004')throw new Error('Vai trò Super Admin đã được loại bỏ.');
  // V5.4.84: không xóa từng dòng; giữ các dòng vai trò khác + thêm dòng mới rồi ghi lại vùng dữ liệu 1 lần.
  const lock=LockService.getDocumentLock();lock.waitLock(30000);
  try{const sh=getSheet_(SHEET.PHAN_QUYEN),headers=getHeaders_(sh),last=sh.getLastRow(),roleIdx=headers.indexOf('ID_VAI_TRO');if(roleIdx<0)throw new Error('PHAN_QUYEN thiếu ID_VAI_TRO.');
    const data=last>1?sh.getRange(2,1,last-1,headers.length).getValues():[],keep=data.filter(function(r){return String(r[roleIdx])!==roleId&&r.some(function(v){return String(v).trim()!=='';});});
    const stamp=Utilities.formatDate(new Date(),APP_CONFIG.TIMEZONE,'yyyyMMddHHmmss');
    const add=rows.map(function(src){const row={};row.ID=src.ID||('PQ-'+stamp+'-'+Utilities.getUuid().slice(0,5).toUpperCase());row.ID_VAI_TRO=roleId;row.CHUC_NANG=src.CHUC_NANG||src.MODULE||src.module||'';['XEM','THEM','SUA','XOA','DUYET','XUAT_FILE'].forEach(function(k){row[k]=src[k]===true||String(src[k]).toUpperCase()==='TRUE';});return row;}).filter(function(r){return r.CHUC_NANG;}).map(function(row){return headers.map(function(h){return normalizeWriteValue_(row[h]);});});
    const all=keep.concat(add);
    if(last>1)sh.getRange(2,1,last-1,headers.length).clearContent();
    if(all.length)sh.getRange(2,1,all.length,headers.length).setValues(all);
    memoForgetSheetV5477_(SHEET.PHAN_QUYEN);
  }finally{lock.releaseLock();}
  writeSystemLog_('UPDATE_PERMISSION',SHEET.PHAN_QUYEN,roleId,'Cập nhật ma trận quyền');return{ok:true,roleId:roleId,count:rows.length};}


/* V5.4.33 - FAST READ CACHE */
var V5433_REQUEST_MEMO_={};
function resetReadMemoV5433_(){V5433_REQUEST_MEMO_={};}
/** V5.4.77: nhớ theo tên sheet thật (KHO_NHAP / KHO_TON / NHAP_XUAT_TON cùng là KHO_NHAPXUATTON → chỉ đọc 1 lần). */
function physicalSheetNameV5477_(name){name=String(name||'');return TABLES[name]&&TABLES[name].sheet?TABLES[name].sheet:name;}
function memoForgetSheetV5477_(sheetName){const k=physicalSheetNameV5477_(sheetName);delete V5433_REQUEST_MEMO_[k];bumpReadVersionV5487_(k);}
/** Sau mỗi lần ghi: xóa cache liên quan (danh mục, phân quyền, tồn kho). */
function afterSheetWriteV5477_(sheetName){
  const k=physicalSheetNameV5477_(sheetName);
  memoForgetSheetV5477_(k);
  if(isLookupSheetV5433_(k)){clearLookupCacheV5433_();bumpLookupsVersionV5484_();}
  if(k===SHEET.PHAN_QUYEN||k===SHEET.VAI_TRO)rbacCacheClearV5477_();
  if(k===SHEET.KHO_NHAPXUATTON||k===SHEET.THIET_BI||k===SHEET.DM_THIETBI||k===SHEET.DM_KHO)nxtCacheClearV5477_();
}
function readRowsMemoV5433_(sheetName){
  const key=physicalSheetNameV5477_(sheetName);
  if(Object.prototype.hasOwnProperty.call(V5433_REQUEST_MEMO_,key))return V5433_REQUEST_MEMO_[key];
  const rows=readTable_(key).rows||[];V5433_REQUEST_MEMO_[key]=rows;return rows;
}
/* V5.4.77: CacheService giới hạn 100KB mỗi khóa → lưu JSON lớn thành nhiều khúc. */
const CACHE_CHUNK_V5477_=30000; // <=90KB UTF-8 even with Vietnamese/BMP text
function cachePutLargeV5477_(key,obj,ttl){
  try{
    const json=JSON.stringify(obj),n=Math.ceil(json.length/CACHE_CHUNK_V5477_)||1,map={};
    if(n>240)return false;
    for(let i=0;i<n;i++)map[key+'#'+i]=json.slice(i*CACHE_CHUNK_V5477_,(i+1)*CACHE_CHUNK_V5477_);
    const cache=CacheService.getScriptCache();cache.putAll(map,ttl);cache.put(key,String(n),ttl);return true;
  }catch(e){return false;}
}
function cacheGetLargeV5477_(key){
  try{
    const cache=CacheService.getScriptCache(),n=Number(cache.get(key)||0);if(!n)return null;
    const keys=[];for(let i=0;i<n;i++)keys.push(key+'#'+i);
    const parts=cache.getAll(keys);let json='';
    for(let i=0;i<n;i++){const part=parts[key+'#'+i];if(part==null)return null;json+=part;}
    return JSON.parse(json);
  }catch(e){return null;}
}
function cacheRemoveLargeV5477_(key){try{CacheService.getScriptCache().remove(key);}catch(e){}}
const LOOKUP_CACHE_KEY_V5477_='V5477_LOOKUPS',LOOKUP_CACHE_TTL_V5477_=300;
function getLookupsCachedV5433_(){
  const hit=cacheGetLargeV5477_(LOOKUP_CACHE_KEY_V5477_);if(hit)return hit;
  const x=getLookups_();cachePutLargeV5477_(LOOKUP_CACHE_KEY_V5477_,x,LOOKUP_CACHE_TTL_V5477_);return x;
}
function clearLookupCacheV5433_(){cacheRemoveLargeV5477_(LOOKUP_CACHE_KEY_V5477_);}
function isLookupSheetV5433_(s){return ['NHAN_SU','DANH_MUC_PHONG_BAN','DANH_MUC_CO_SO','DANH_MUC_TANG',SHEET.DM_THIETBI,SHEET.DM_KHO,'VAI_TRO'].indexOf(physicalSheetNameV5477_(s))>=0;}

function safeReadRowsV513_(sheetName) {
  try { return readRowsMemoV5433_(sheetName); } catch (err) { return []; }
}

function safeHeadersV513_(sheetName) {
  try {
    return getHeaders_(getSheet_(sheetName)) || [];
  } catch (err) {
    return [];
  }
}

/* =========================================================
   V5.4.63 - PROPOSAL CLEAN SINGLE PIPELINE
   Một bundle đọc + một API lưu + một lookup. Không còn page proposal legacy.
   ========================================================= */
function normalizeProposalRowsV5463_() {
  var purchase = safeReadRowsV513_('DE_XUAT_MUA_THIET_BI').map(function(r){
    var hv = String(r.HINH_THUC_DE_XUAT || '').toUpperCase(), type = hv === 'XUAT_DUNG' ? 'Xuất dùng' : hv === 'XUAT_MOI' ? 'Xuất mới' : 'Mua ngoài';
    return Object.assign({}, r, {
      ID:r.ID_DE_XUAT||'', LOAI_DE_XUAT:type,
      NOI_DUNG:r.NOI_DUNG_DE_XUAT||'',
      NGAY_DE_XUAT:r.NGAY_DE_XUAT||r.NGAY_TAO||''
    });
  });
  var disposal = safeReadRowsV513_('DE_XUAT_THANH_LY').map(function(r){
    return Object.assign({}, r, {
      ID:r.ID_DE_XUAT||'', LOAI_DE_XUAT:'Thanh lý',
      NOI_DUNG:r.LY_DO_DE_XUAT||'',
      NGAY_DE_XUAT:r.NGAY_DE_XUAT||r.NGAY_TAO||''
    });
  });
  var maintenance = safeReadRowsV513_('BAO_TRI_THIET_BI').map(function(r){
    return Object.assign({}, r, {
      ID:r.ID_BAO_TRI||'', ID_DE_XUAT:r.ID_BAO_TRI||'',
      NGAY_DE_XUAT:r.NGAY_BAO_LOI||r.NGAY_TAO||'',
      LOAI_DE_XUAT:'Bảo trì', NOI_DUNG:r.MO_TA_SU_CO||'',
      HIEN_TRANG:r.MO_TA_SU_CO||'', PHUONG_AN_DE_XUAT:r.PHUONG_AN_XU_LY||'',
      CHI_PHI_DU_KIEN:r.CHI_PHI||''
    });
  });
  return purchase.concat(disposal, maintenance).sort(function(a,b){
    return String(b.NGAY_DE_XUAT||b.NGAY_TAO||'').localeCompare(String(a.NGAY_DE_XUAT||a.NGAY_TAO||''));
  });
}

function getProposalBundleV5463_() {
  var rows = normalizeProposalRowsV5463_();
  return {ok:true,proposals:rows,count:rows.length};
}
function getProposalBundleV5463() { return authCallPermV5471_('DE_XUAT_QUAN_LY','XEM',getProposalBundleV5463_,arguments); }

function getProposalCreateLookupsV5463_() {
  var l = getLookupsCachedV5433_();
  return {
    ok:true,
    employees:l.employees||[],
    departments:l.departments||[],
    categories:l.categories||[],
    devices:safeReadRowsV513_('THIET_BI')
  };
}
function getProposalCreateLookupsV5463() { return authCallPermV5471_('DE_XUAT_QUAN_LY','XEM',getProposalCreateLookupsV5463_,arguments); }

function findDeviceV5463_(id) {
  id=String(id||'').trim();
  if(!id)return null;
  var rows=safeReadRowsV513_('THIET_BI');
  for(var i=0;i<rows.length;i++)if(String(rows[i].ID_THIET_BI||'')===id)return rows[i];
  return null;
}

function saveProposalV5463_(kind, payload) {
  kind=String(kind||'').trim().toLowerCase();
  var p=Object.assign({},payload||{}), key='';
  if(['buy','issue','new'].indexOf(kind)>=0){
    key='DE_XUAT_MUA_THIET_BI';
    p.HINH_THUC_DE_XUAT=kind==='issue'?'XUAT_DUNG':kind==='new'?'XUAT_MOI':'MUA_MOI';
    p.NGAY_DE_XUAT=p.NGAY_DE_XUAT||Utilities.formatDate(new Date(),APP_CONFIG.TIMEZONE,APP_CONFIG.DATE_FORMAT);
    p.NHOM_THIET_BI=p.NHOM_THIET_BI||'THIẾT BỊ';
    p.SO_LUONG=Math.max(1,toNumber_(p.SO_LUONG||1));
    p.DON_GIA_DU_KIEN=Math.max(0,toNumber_(p.DON_GIA_DU_KIEN));
    p.THANH_TIEN=p.SO_LUONG*p.DON_GIA_DU_KIEN;
    p.TRANG_THAI=p.TRANG_THAI||'Chờ duyệt';
    if(!p.MA_PHIEU){
      // V5.4.85: số phiếu theo giây có thể trùng khi lưu nhanh → thêm hậu tố -2, -3… (tránh ghi đè đề xuất khác theo khóa tự nhiên).
      var base=nextDocumentNo_(kind==='issue'?'DXXD':kind==='new'?'DXXM':'DXMM'),used={};safeReadRowsV513_('DE_XUAT_MUA_THIET_BI').forEach(function(r){used[String(r.MA_PHIEU||'')]=1;});
      var no=base,k=2;while(used[no])no=base+'-'+(k++);p.MA_PHIEU=no;
    }
  } else if(kind==='dispose'){
    key='DE_XUAT_THANH_LY';
    p.NGAY_DE_XUAT=p.NGAY_DE_XUAT||Utilities.formatDate(new Date(),APP_CONFIG.TIMEZONE,APP_CONFIG.DATE_FORMAT);
    p.TRANG_THAI=p.TRANG_THAI||'Chờ duyệt';
    p.MA_PHIEU=p.MA_PHIEU||nextDocumentNo_('DXTL');
    p.SO_LUONG=Math.max(1,toNumber_(p.SO_LUONG||1));
    p.CHI_PHI_SUA_DU_KIEN=Math.max(0,toNumber_(p.CHI_PHI_SUA_DU_KIEN));
    p.GIA_TRI_CON_LAI=Math.max(0,toNumber_(p.GIA_TRI_CON_LAI));
    p.GIA_DE_XUAT_THANH_LY=Math.max(0,toNumber_(p.GIA_DE_XUAT_THANH_LY));
    var d=findDeviceV5463_(p.ID_THIET_BI);
    if(d){
      p.ID_DANH_MUC=p.ID_DANH_MUC||d.ID_DANH_MUC||'';
      p.MA_HANG=p.MA_HANG||d.MA_THIET_BI||'';
      p.TEN_HANG=p.TEN_HANG||d.TEN_THIET_BI||'';
      p.LOAI_QUAN_LY=p.LOAI_QUAN_LY||d.LOAI_THIET_BI||'';
      p.DON_VI_TINH=p.DON_VI_TINH||'Cái';
    }
  } else if(kind==='maintenance'){
    key='BAO_TRI_THIET_BI';
    p.NGAY_BAO_LOI=p.NGAY_DE_XUAT||p.NGAY_BAO_LOI||Utilities.formatDate(new Date(),APP_CONFIG.TIMEZONE,APP_CONFIG.DATE_FORMAT);
    p.LOAI_BAO_TRI=p.LOAI_DE_XUAT||p.LOAI_BAO_TRI||'Sửa chữa';
    p.MO_TA_SU_CO=p.HIEN_TRANG||p.MO_TA_SU_CO||'';
    p.PHUONG_AN_XU_LY=p.PHUONG_AN_DE_XUAT||p.PHUONG_AN_XU_LY||'';
    p.CHI_PHI=Math.max(0,toNumber_(p.CHI_PHI_DU_KIEN||p.CHI_PHI));
    p.TRANG_THAI=p.TRANG_THAI||'Chờ xử lý';
    delete p.NGAY_DE_XUAT;delete p.LOAI_DE_XUAT;delete p.HIEN_TRANG;delete p.PHUONG_AN_DE_XUAT;delete p.CHI_PHI_DU_KIEN;
    prepareMaintenanceSaveV5486_(p);
  } else throw new Error('Loại đề xuất không hợp lệ: '+kind);
  if(key==='DE_XUAT_MUA_THIET_BI'){
    // V5.4.85: đối tượng sử dụng + danh mục; đề xuất đã duyệt không sửa được qua form.
    ensureColsV5485_(SHEET.DE_XUAT_MUA_THIET_BI,PROPOSAL_COLS_V5485_);
    var pid=String(p.ID_DE_XUAT||'').trim();
    ['SO_LUONG_DUYET','SO_LUONG_DA_XUAT','SO_LUONG_DA_NHAP','NGAY_DUYET','ID_TAI_KHOAN_DUYET','GHI_CHU_DUYET','SO_PHIEU_LIEN_QUAN','MA_THIET_BI_DA_CAP','NGAY_HOAN_THANH','ID_DE_XUAT_GOC','ID_THIET_BI_CAP'].forEach(function(k){delete p[k];});
    if(!pid)p.TRANG_THAI='Chờ duyệt';
    if(pid){var cur=safeReadRowsV513_('DE_XUAT_MUA_THIET_BI').find(function(r){return String(r.ID_DE_XUAT||'')===pid;});if(cur&&!proposalPendingV5485_(cur))throw new Error('Đề xuất đã duyệt / xử lý, không sửa được.');if(cur)p.TRANG_THAI=cur.TRANG_THAI||'Chờ duyệt';}
    var tg=normalizeTextV543_(p.DOI_TUONG_SU_DUNG);
    if(/PHONG BAN/.test(tg)){p.DOI_TUONG_SU_DUNG=TARGET_V5485_.DEPT;p.ID_NHAN_SU_NHAN='';}else if(/DU PHONG|KHO/.test(tg)){p.DOI_TUONG_SU_DUNG=TARGET_V5485_.STOCK;p.ID_NHAN_SU_NHAN='';p.ID_PHONG_BAN_NHAN='';}else if(/NHAN VIEN/.test(tg))p.DOI_TUONG_SU_DUNG=TARGET_V5485_.EMP;
    if(kind!=='buy'&&(p.DOI_TUONG_SU_DUNG===TARGET_V5485_.STOCK||!p.DOI_TUONG_SU_DUNG))throw new Error((kind==='new'?'Xuất mới':'Xuất dùng')+' phải chọn nhân viên hoặc phòng ban nhận.');
    if(kind==='new'&&!String(p.KHO_NGUON||'').trim())throw new Error('Vui lòng nhập kho ngoài (nguồn hàng).');
    if(kind==='new'&&!String(p.ID_DANH_MUC||'').trim())throw new Error('Vui lòng chọn danh mục thiết bị.');
    if(p.DOI_TUONG_SU_DUNG===TARGET_V5485_.EMP&&!String(p.ID_NHAN_SU_NHAN||'').trim())throw new Error('Vui lòng chọn nhân viên nhận.');
    if(p.DOI_TUONG_SU_DUNG===TARGET_V5485_.DEPT&&!String(p.ID_PHONG_BAN_NHAN||'').trim())throw new Error('Vui lòng chọn phòng ban nhận.');
    if(p.DOI_TUONG_SU_DUNG===TARGET_V5485_.EMP&&!String(p.ID_PHONG_BAN_NHAN||'').trim()){var e=safeReadRowsV513_('NHAN_SU').find(function(r){return String(r.ID_NHAN_SU||'')===String(p.ID_NHAN_SU_NHAN);});if(e)p.ID_PHONG_BAN_NHAN=String(e.ID_PHONG_BAN||'');}
    if(String(p.ID_DANH_MUC||'').trim()&&!String(p.TEN_THIET_BI||'').trim()){var c=safeReadRowsV513_('DM_THIETBI').find(function(r){return String(r.ID_DANH_MUC||'')===String(p.ID_DANH_MUC);});if(c)p.TEN_THIET_BI=String(c.TEN_DANH_MUC||'');}
  }
  var res=saveRecordV53_(key,p);
  return {ok:true,kind:kind,sheet:TABLES[key].sheet,id:res.id,action:res.action,row:res.row};
}
function saveProposalV5463() {
  return authCallPermV5471_(function(kind){kind=String(kind||'').trim().toLowerCase();return kind==='dispose'?'DE_XUAT_THANH_LY':kind==='maintenance'?'DE_XUAT_SUA_CHUA':'DE_XUAT_MUA_XUAT';},
    function(kind,p){p=p||{};return String(p.ID_DE_XUAT||p.ID_BAO_TRI||'').trim()?'SUA':'THEM';},
    saveProposalV5463_,arguments);
}

/* =========================================================
 * V5.4.77 - LƯU TRỮ NHẬT KÝ HỆ THỐNG
 * Chuyển các dòng cũ hơn N ngày (mặc định 90) từ NHAT_KY_HE_THONG sang NHAT_KY_LUU_TRU
 * để sheet nhật ký chính luôn nhỏ. Chạy tay (admin / chủ script) hoặc cài lịch hằng tháng.
 * ========================================================= */
const SYSTEM_LOG_ARCHIVE_SHEET_V5477_='NHAT_KY_LUU_TRU';
function parseLogTimeV5477_(v){
  if(v instanceof Date)return v.getTime();
  const m=String(v||'').match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:\s+(\d{1,2}):(\d{2})(?::(\d{2}))?)?/);
  if(m)return new Date(Number(m[3]),Number(m[2])-1,Number(m[1]),Number(m[4]||0),Number(m[5]||0),Number(m[6]||0)).getTime();
  const t=Date.parse(String(v||''));return isNaN(t)?NaN:t;
}
function archiveSystemLogV5477_(keepDays){
  keepDays=Math.max(7,Number(keepDays)||90);
  return withScriptLockV5471_(function(){
    const sh=getSheet_(SHEET.NHAT_KY_HE_THONG),headers=getHeaders_(sh),lastRow=sh.getLastRow(),width=headers.length;
    if(lastRow<2)return {ok:true,archived:0,remaining:0};
    let ti=headers.indexOf('THOI_GIAN');if(ti<0)ti=headers.indexOf('NGAY_TAO');
    if(ti<0)throw new Error('NHAT_KY_HE_THONG thiếu cột THOI_GIAN / NGAY_TAO.');
    const cutoff=Date.now()-keepDays*86400000,values=sh.getRange(2,1,lastRow-1,width).getValues();
    // Lọc theo thời gian từng dòng (không giả định thứ tự). Dòng không đọc được thời gian → giữ lại.
    const keep=[],old=[];
    values.forEach(function(r){const t=parseLogTimeV5477_(r[ti]);(!isNaN(t)&&t<cutoff?old:keep).push(r);});
    if(!old.length)return {ok:true,archived:0,remaining:keep.length};
    const db=getDb_();let arc=db.getSheetByName(SYSTEM_LOG_ARCHIVE_SHEET_V5477_);
    if(!arc){arc=db.insertSheet(SYSTEM_LOG_ARCHIVE_SHEET_V5477_);arc.getRange(1,1,1,width).setValues([headers]);}
    // Ghi sang sheet lưu trữ TRƯỚC, rồi mới ghi lại sheet chính (không mất dữ liệu nếu lỗi giữa chừng).
    arc.getRange(Math.max(arc.getLastRow(),1)+1,1,old.length,width).setValues(old);
    sh.getRange(2,1,lastRow-1,width).clearContent();
    if(keep.length)sh.getRange(2,1,keep.length,width).setValues(keep);
    if(lastRow-1>keep.length)sh.deleteRows(keep.length+2,lastRow-1-keep.length);
    memoForgetSheetV5477_(SHEET.NHAT_KY_HE_THONG);
    return {ok:true,archived:old.length,remaining:keep.length,archiveSheet:SYSTEM_LOG_ARCHIVE_SHEET_V5477_,keepDays:keepDays};
  });
}
function archiveSystemLogV5477() { return authCallAdminOrOwnerV5470_(archiveSystemLogV5477_, arguments); }
/** Hàm cho lịch chạy tự động (trigger) — chỉ admin / chủ script mới gọi được. */
function systemLogArchiveTriggerV5477() { return authCallAdminOrOwnerV5470_(function(){ return archiveSystemLogV5477_(90); }, []); }
/** Chạy 1 lần trong trình soạn Apps Script: cài lịch lưu trữ nhật ký vào ngày 1 hằng tháng, 2 giờ sáng. */
function installSystemLogArchiveTriggerV5477() {
  return authCallAdminOrOwnerV5470_(function(){
    ScriptApp.getProjectTriggers().forEach(function(t){ if(t.getHandlerFunction()==='systemLogArchiveTriggerV5477') ScriptApp.deleteTrigger(t); });
    ScriptApp.newTrigger('systemLogArchiveTriggerV5477').timeBased().onMonthDay(1).atHour(2).create();
    return {ok:true,message:'Đã cài lịch lưu trữ nhật ký: ngày 1 hằng tháng lúc 2 giờ sáng (giữ 90 ngày gần nhất).'};
  }, arguments);
}


/* =========================================================
 * V5.4.85 - XUẤT DÙNG / MUA MỚI nối với Kho NXT và Kho thiết bị đang dùng
 *  - Duyệt đề xuất Xuất dùng  = tự xuất kho (lô cũ nhất cùng danh mục) + tự tạo thiết bị cho nhân viên / phòng ban.
 *  - Duyệt đề xuất Mua mới     = "Chờ nhập kho"; hàng về → Nhập kho theo đề xuất (nhập nhiều lần);
 *                                đề xuất dùng cho nhân viên / phòng ban → nhập xong tự xuất cho người đó.
 *  - Danh mục "Vật tư" (DM_THIETBI.QUAN_LY_THEO_MAY) → 1 dòng thiết bị gộp có SO_LUONG; để trống = theo từng máy.
 *  - Hủy duyệt: phiếu XK đánh dấu ĐÃ HỦY (tồn tự cộng lại), thiết bị → "Đã hủy cấp" (chỉ khi chưa bị chuyển / sửa).
 *  Không giữ chỗ tồn kho; "đã hứa" = SL các đề xuất xuất dùng đang chờ duyệt.
 * ========================================================= */
const PROPOSAL_COLS_V5485_=['KHO_NGUON','MO_TA_CHI_TIET','ID_THIET_BI_CAP','NOI_DUNG_DE_XUAT','GHI_CHU','ID_PHONG_BAN','DON_GIA_DU_KIEN','THANH_TIEN','ID_DANH_MUC','ID_NHAN_SU_DE_XUAT','DOI_TUONG_SU_DUNG','ID_NHAN_SU_NHAN','ID_PHONG_BAN_NHAN','ID_KHO','SO_LUONG_DUYET','SO_LUONG_DA_XUAT','SO_LUONG_DA_NHAP','NGAY_DUYET','ID_TAI_KHOAN_DUYET','GHI_CHU_DUYET','SO_PHIEU_LIEN_QUAN','MA_THIET_BI_DA_CAP','ID_DE_XUAT_GOC','NGAY_HOAN_THANH'];
const DEVICE_COLS_V5485_=['KIEU_SU_DUNG','ID_DE_XUAT','SO_PHIEU_XUAT','NGAY_CAP_PHAT','NGUON','SO_LUONG'];
const LEDGER_COLS_V5485_=['ID_CHUNG_TU_LIEN_QUAN','ID_PHONG_BAN_NHAN','ID_THIET_BI_CAP','ID_TAI_KHOAN_THUC_HIEN'];
const CATEGORY_COLS_V5485_=['QUAN_LY_THEO_MAY'];
const PST_V5485_={WAIT:'Chờ duyệt',DONE:'Hoàn thành',WAIT_IN:'Chờ nhập kho',PART_IN:'Nhập một phần'};
const TARGET_V5485_={EMP:'Nhân viên',DEPT:'Phòng ban',STOCK:'Dự phòng kho'};
const ISSUE_BATCH_MAX_V5485_=50;

/** Thêm các cột còn thiếu vào cuối sheet (kiểm tra 1 lần / 6 giờ cho mỗi bộ cột). */
function ensureColsV5485_(sheetName,cols){
  const key='PL_V5485_COLS_'+sheetName+'_'+cols.length;
  try{if(CacheService.getScriptCache().get(key))return;}catch(e){}
  const sh=getSheet_(sheetName),headers=getHeaders_(sh),miss=cols.filter(function(c){return headers.indexOf(c)<0;});
  if(miss.length){sh.getRange(1,sh.getLastColumn()+1,1,miss.length).setValues([miss]);memoForgetSheetV5477_(sheetName);afterSheetWriteV5477_(sheetName);}
  try{CacheService.getScriptCache().put(key,'1',21600);}catch(e){}
}
function ensureAllColsV5485_(){
  ensureColsV5485_(SHEET.DE_XUAT_MUA_THIET_BI,PROPOSAL_COLS_V5485_);
  ensureColsV5485_(SHEET.THIET_BI,DEVICE_COLS_V5485_);
  ensureColsV5485_(SHEET.KHO_NHAPXUATTON,LEDGER_COLS_V5485_);
}
function isSupplyCategoryV5485_(cat){const t=normalizeTextV543_(cat&&cat.QUAN_LY_THEO_MAY);return /VAT TU|KHONG|FALSE|^0$|^N$/.test(t);}
function proposalKindV5485_(r){const h=String(r&&r.HINH_THUC_DE_XUAT||'').toUpperCase();return h==='XUAT_DUNG'?'issue':h==='XUAT_MOI'?'new':'buy';}
function proposalPendingV5485_(r){const t=normalizeTextV543_(r&&r.TRANG_THAI);return !t||/CHO DUYET|MOI TAO|CHUA DUYET/.test(t);}
function proposalQtyV5485_(r){return Math.max(0,toNumber_(r.SO_LUONG_DUYET)||toNumber_(r.SO_LUONG)||0);}
function appendNoteV5485_(old,text){old=String(old||'').trim();return (old?old+' | ':'')+text;}
function docNoV5485_(prefix,seq){return nextDocumentNo_(prefix)+(seq?'-'+String(seq).padStart(2,'0'):'');}
/** Số phiếu duy nhất trong sổ kho / sheet đề xuất (thêm hậu tố khi trùng). */
function uniqueDocV5485_(ctx,prefix){
  if(!ctx.usedDocs){ctx.usedDocs={};safeReadRowsV513_('KHO_NHAPXUATTON').forEach(function(r){ctx.usedDocs[String(r.SO_PHIEU||'')]=1;});safeReadRowsV513_('DE_XUAT_MUA_THIET_BI').forEach(function(r){ctx.usedDocs[String(r.MA_PHIEU||'')]=1;});}
  const base=nextDocumentNo_(prefix);let no=base,k=2;while(ctx.usedDocs[no])no=base+'-'+String(k++).padStart(2,'0');ctx.usedDocs[no]=1;return no;
}

/** Danh mục của đề xuất: ID_DANH_MUC, hoặc khớp tên thiết bị với tên / mã danh mục (đề xuất cũ). */
function proposalCategoryV5485_(r,cats){
  const id=String(r.ID_DANH_MUC||'').trim();
  if(id){const c=cats.find(function(x){return String(x.ID_DANH_MUC||'')===id;});if(c)return c;}
  const n=normalizeTextV543_(r.TEN_THIET_BI).trim();if(!n)return null;
  return cats.find(function(x){return normalizeTextV543_(x.TEN_DANH_MUC).trim()===n||normalizeTextV543_(x.MA_DANH_MUC).trim()===n;})||null;
}
/** Người / phòng nhận của đề xuất. */
function proposalTargetV5485_(r,emps){
  let t=String(r.DOI_TUONG_SU_DUNG||'').trim();const nt=normalizeTextV543_(t);
  let emp=String(r.ID_NHAN_SU_NHAN||'').trim(),dept=String(r.ID_PHONG_BAN_NHAN||'').trim();
  if(/PHONG BAN|DUNG CHUNG/.test(nt))t=TARGET_V5485_.DEPT;else if(/DU PHONG|KHO/.test(nt))t=TARGET_V5485_.STOCK;else if(/NHAN VIEN|CA NHAN/.test(nt))t=TARGET_V5485_.EMP;
  else if(emp)t=TARGET_V5485_.EMP;else if(dept)t=TARGET_V5485_.DEPT;
  else if(proposalKindV5485_(r)!=='buy'){emp=String(r.ID_NHAN_SU_DE_XUAT||r.ID_NHAN_SU||'').trim();t=emp?TARGET_V5485_.EMP:(String(r.ID_PHONG_BAN||'').trim()?TARGET_V5485_.DEPT:'');if(!emp)dept=String(r.ID_PHONG_BAN||'').trim();}
  else t=TARGET_V5485_.STOCK;
  const e=emp?emps.find(function(x){return String(x.ID_NHAN_SU||'')===emp;}):null;
  if(t===TARGET_V5485_.EMP&&!dept&&e)dept=String(e.ID_PHONG_BAN||'');
  return {type:t,empId:t===TARGET_V5485_.EMP?emp:'',deptId:t===TARGET_V5485_.STOCK?'':dept,emp:e};
}
/** Gợi ý Cơ sở / Tầng / Vị trí cho thiết bị mới: nơi đặt nhiều máy nhất của người (hoặc phòng ban) đó. */
function locationGuessV5485_(devices,floors,depts,empId,deptId){
  const live=function(d){return !/THANH LY|HUY CAP/.test(normalizeTextV543_(d.TRANG_THAI));};
  let pool=devices.filter(function(d){return live(d)&&(empId?String(d.ID_NHAN_SU_SU_DUNG||'')===empId:(String(d.ID_PHONG_BAN||'')===deptId&&!String(d.ID_NHAN_SU_SU_DUNG||'').trim()));});
  if(!pool.length&&deptId)pool=devices.filter(function(d){return live(d)&&String(d.ID_PHONG_BAN||'')===deptId;});
  const m={};pool.forEach(function(d){if(!String(d.ID_TANG||'').trim())return;const k=[d.ID_CO_SO||'',d.ID_TANG||'',d.VI_TRI||''].join('|');m[k]=(m[k]||0)+1;});
  let best='',n=0;Object.keys(m).forEach(function(k){if(m[k]>n){n=m[k];best=k;}});
  let loc=best?{ID_CO_SO:best.split('|')[0],ID_TANG:best.split('|')[1],VI_TRI:best.split('|')[2]}:{ID_CO_SO:'',ID_TANG:'',VI_TRI:''};
  if(!loc.ID_TANG){const d=depts.find(function(x){return String(x.ID_PHONG_BAN||'')===deptId;})||{};loc={ID_CO_SO:String(d.ID_CO_SO||''),ID_TANG:String(d.ID_TANG||''),VI_TRI:String(d.VI_TRI||d.TEN_PHONG_BAN||'')};}
  if(loc.ID_TANG&&!loc.ID_CO_SO){const f=floors.find(function(x){return String(x.ID_TANG||'')===loc.ID_TANG;});if(f)loc.ID_CO_SO=String(f.ID_CO_SO||'');}
  return loc;
}
/** Bộ sinh mã thiết bị trong bộ nhớ (cùng quy tắc nextDeviceCodeV5425_, không đọc lại sheet mỗi máy). */
function deviceCodeGenV5485_(devices){
  const used={},maxBy={};devices.forEach(function(r){const c=String(r.MA_THIET_BI||'').trim().toUpperCase();if(c)used[c]=1;});
  return function(site,floor,dept){
    const f=floorCodeV5425_(floor),s=siteCodeV5425_(site),d=departmentCode2V5425_(dept);
    if(!f||!s||!d)throw new Error('Chưa có '+(!s?'Cơ sở':!f?'Tầng':'Phòng ban')+' hợp lệ để sinh mã thiết bị.');
    const prefix=f+s+d;
    if(!(prefix in maxBy)){let mx=0;Object.keys(used).forEach(function(c){if(c.indexOf(prefix)===0&&/^\d+$/.test(c.slice(prefix.length)))mx=Math.max(mx,Number(c.slice(prefix.length)));});maxBy[prefix]=mx;}
    let no=maxBy[prefix]+1,code=prefix+String(no).padStart(2,'0');while(used[code]){no++;code=prefix+String(no).padStart(2,'0');}
    maxBy[prefix]=no;used[code]=1;return code;};
}
/** Ngữ cảnh đọc 1 lần cho cả lô duyệt / nhập. */
function issueCtxV5485_(user){
  ensureAllColsV5485_();
  const devices=safeReadRowsV513_('THIET_BI').map(function(r){return Object.assign({},r);});
  const ctx={user:user||{},devices:devices,cats:safeReadRowsV513_('DM_THIETBI'),emps:safeReadRowsV513_('NHAN_SU'),depts:safeReadRowsV513_('DANH_MUC_PHONG_BAN'),floors:safeReadRowsV513_('DANH_MUC_TANG'),
    stock:buildWarehouseDeviceNXTBundleV5477_().stock.map(function(r){return Object.assign({},r);}),code:deviceCodeGenV5485_(devices),
    ledgerAdd:[],ledgerUpd:{},devAdd:[],devUpd:{},hist:[],propUpd:{},propAdd:[],logs:[],touched:[],seq:0,now:nowText_()};
  return ctx;
}
/** Ghi tất cả thay đổi của ngữ cảnh (mỗi sheet 1 lần). */
function issueFlushV5485_(ctx){
  if(ctx.ledgerAdd.length)batchAppendRowsV5484_(SHEET.KHO_NHAPXUATTON,ctx.ledgerAdd);
  if(Object.keys(ctx.ledgerUpd).length)batchUpdateRowsV5484_('KHO_NHAPXUATTON',ctx.ledgerUpd);
  if(ctx.devAdd.length)batchAppendRowsV5484_(SHEET.THIET_BI,ctx.devAdd);
  if(Object.keys(ctx.devUpd).length)batchUpdateRowsV5484_('THIET_BI',ctx.devUpd);
  if(ctx.propAdd.length)batchAppendRowsV5484_(SHEET.DE_XUAT_MUA_THIET_BI,ctx.propAdd);
  if(Object.keys(ctx.propUpd).length)batchUpdateRowsV5484_('DE_XUAT_MUA_THIET_BI',ctx.propUpd);
  if(ctx.hist.length){try{batchAppendRowsV5484_(SHEET.LICH_SU_CHUYEN_THIET_BI,ctx.hist);}catch(e){}}
  writeSystemLogsV5484_(ctx.logs);
  nxtCacheClearV5477_();
}
/** Các lô tồn của danh mục, lô nhập cũ nhất trước; stockId (nếu có) được lấy trước tiên. */
function stockLinesForV5485_(ctx,catId,khoId,stockId){
  const lines=ctx.stock.filter(function(s){return String(s.ID_DANH_MUC||'')===String(catId)&&toNumber_(s.SO_LUONG_TON)>0&&(!khoId||String(s.ID_KHO||'')===String(khoId));});
  lines.sort(function(a,b){if(stockId){if(String(a.ID_TON_KHO)===String(stockId))return -1;if(String(b.ID_TON_KHO)===String(stockId))return 1;}return (parseDateV5484_(a.NGAY_NHAP_CUOI)||0)-(parseDateV5484_(b.NGAY_NHAP_CUOI)||0);});
  return lines;
}
/**
 * Xuất kho + tạo thiết bị cho 1 đề xuất (chỉ ghi vào ngữ cảnh). opt: {qty, stockId, ID_KHO, ID_CO_SO, ID_TANG, VI_TRI, allowPartial, lines(bắt buộc lô)}
 * Trả {issued, shortage, docNo, devices:[{id,code,name,qty}]}.
 */
function issueForProposalV5485_(ctx,prop,cat,target,opt){
  const want=Math.max(0,Math.floor(toNumber_(opt.qty)));if(!want)throw new Error('Số lượng xuất phải lớn hơn 0.');
  if(target.type===TARGET_V5485_.EMP){
    if(!target.empId)throw new Error('Đề xuất chưa chọn nhân viên nhận.');
    if(!target.emp)throw new Error('Không tìm thấy nhân viên nhận: '+target.empId);
    if(isEmployeeResignedV5480_(target.emp))throw new Error('Nhân viên '+String(target.emp.HO_TEN||target.empId)+' đã nghỉ việc.');
  } else if(target.type===TARGET_V5485_.DEPT){if(!target.deptId)throw new Error('Đề xuất chưa chọn phòng ban nhận.');}
  else throw new Error('Đề xuất không có người / phòng ban nhận.');
  const dept=ctx.depts.find(function(x){return String(x.ID_PHONG_BAN||'')===target.deptId;});
  if(!dept)throw new Error('Không tìm thấy phòng ban nhận: '+(target.deptId||'(trống)'));
  if(/NGUNG|HUY|KHOA/.test(normalizeTextV543_(dept.TRANG_THAI)))throw new Error('Phòng ban '+String(dept.TEN_PHONG_BAN||target.deptId)+' đã ngừng hoạt động.');
  const lines=opt.lines||stockLinesForV5485_(ctx,cat.ID_DANH_MUC,opt.ID_KHO||'',opt.stockId);
  const avail=lines.reduce(function(s,l){return s+toNumber_(l.SO_LUONG_TON);},0);
  if(avail<=0)throw new Error('Kho không còn '+String(cat.TEN_DANH_MUC||cat.ID_DANH_MUC)+'.');
  if(avail<want&&!opt.allowPartial)throw new Error('Tồn kho không đủ: còn '+avail+', cần '+want+'.');
  const qty=Math.min(want,avail);
  const guess=locationGuessV5485_(ctx.devices,ctx.floors,ctx.depts,target.empId,target.deptId);
  const loc={ID_CO_SO:String(opt.ID_CO_SO||guess.ID_CO_SO||''),ID_TANG:String(opt.ID_TANG||guess.ID_TANG||''),VI_TRI:String(opt.VI_TRI!=null&&opt.VI_TRI!==''?opt.VI_TRI:guess.VI_TRI||'')};
  if(loc.ID_TANG&&!loc.ID_CO_SO){const f=ctx.floors.find(function(x){return String(x.ID_TANG||'')===loc.ID_TANG;});if(f)loc.ID_CO_SO=String(f.ID_CO_SO||'');}
  if(!loc.ID_TANG||!loc.ID_CO_SO)throw new Error('Chưa có Cơ sở / Tầng đặt thiết bị (chọn trong hộp Duyệt trên máy tính).');
  if(!floorCodeV5425_(loc.ID_TANG)||!siteCodeV5425_(loc.ID_CO_SO)||!departmentCode2V5425_(target.deptId))throw new Error('Cơ sở / Tầng / Phòng ban chưa có mã hợp lệ để sinh mã thiết bị.');
  const supply=isSupplyCategoryV5485_(cat),mode=target.type===TARGET_V5485_.EMP?DEVICE_USAGE_V5480.PERSONAL:DEVICE_USAGE_V5480.SHARED;
  const docNo=opt.noLedger?String(prop.MA_PHIEU||prop.ID_DE_XUAT||''):uniqueDocV5485_(ctx,'XK'),email=String(ctx.user.email||''),propId=String(prop.ID_DE_XUAT||''),made=[];
  const base={TEN_THIET_BI:String(cat.TEN_DANH_MUC||prop.TEN_THIET_BI||'').trim(),ID_DANH_MUC:String(cat.ID_DANH_MUC||''),LOAI_THIET_BI:String(cat.MA_DANH_MUC||cat.NHOM_THIET_BI||'').trim()||'Khác',
    TRANG_THAI:'Đang sử dụng',ID_NHAN_SU_SU_DUNG:target.empId,ID_PHONG_BAN:target.deptId,ID_CO_SO:loc.ID_CO_SO,ID_TANG:loc.ID_TANG,VI_TRI:loc.VI_TRI,KIEU_SU_DUNG:mode,
    ID_DE_XUAT:propId,SO_PHIEU_XUAT:docNo,NGAY_CAP_PHAT:ctx.now,NGUON:opt.source||'Xuất kho',NGAY_TAO:ctx.now,NGAY_CAP_NHAT:ctx.now,NGUOI_TAO:email};
  const newDevice=function(extra){const d=Object.assign({},base,extra,{ID_THIET_BI:generateId_('THIET_BI'),MA_THIET_BI:ctx.code(loc.ID_CO_SO,loc.ID_TANG,target.deptId)});ctx.devAdd.push(d);ctx.devices.push(d);ctx.touched.push(d.ID_THIET_BI);
    ctx.hist.push(transferHistoryRowV5484_({ID_THIET_BI:d.ID_THIET_BI,MA_THIET_BI:d.MA_THIET_BI,ID_NHAN_SU_MOI:target.empId,ID_PHONG_BAN_MOI:target.deptId,ID_CO_SO_MOI:loc.ID_CO_SO,ID_TANG_MOI:loc.ID_TANG,VI_TRI_MOI:loc.VI_TRI,LY_DO:'Cấp phát theo đề xuất '+String(prop.MA_PHIEU||propId)+' · '+docNo,ID_TAI_KHOAN_THUC_HIEN:String(ctx.user.id||''),EMAIL_THUC_HIEN:email}));return d;};
  let left=qty;
  lines.forEach(function(l){
    if(left<=0)return;const ton=toNumber_(l.SO_LUONG_TON);if(ton<=0)return;const take=Math.min(ton,left);left-=take;l.SO_LUONG_TON=ton-take;
    const ids=[],info=String(l.MO_TA_CHI_TIET||'').trim(),state=String(l.TINH_TRANG||'').trim(),tt=/HONG|KIEM TRA/.test(normalizeTextV543_(state))?state:'Tốt';
    if(supply){
      const same=ctx.devices.find(function(d){return String(d.ID_DANH_MUC||'')===base.ID_DANH_MUC&&String(d.ID_NHAN_SU_SU_DUNG||'')===target.empId&&String(d.ID_PHONG_BAN||'')===target.deptId&&normalizeTextV543_(d.TRANG_THAI).indexOf('DANG SU DUNG')>=0&&deviceUsageModeV5480_(d)===mode&&/^(Xuất kho|Kho ngoài)/.test(String(d.NGUON||''));});
      if(same){const n=(toNumber_(same.SO_LUONG)||1)+take;same.SO_LUONG=n;if(ctx.devAdd.indexOf(same)<0){ctx.devUpd[String(same.ID_THIET_BI)]=Object.assign(ctx.devUpd[String(same.ID_THIET_BI)]||{},{SO_LUONG:n});ctx.touched.push(String(same.ID_THIET_BI));}ids.push(String(same.ID_THIET_BI));made.push({id:String(same.ID_THIET_BI),code:String(same.MA_THIET_BI||''),name:base.TEN_THIET_BI,detail:info,qty:take,added:true});}
      else{const d=newDevice({CHI_TIET_THIET_BI:info,TINH_TRANG:tt,SO_LUONG:take});ids.push(d.ID_THIET_BI);made.push({id:d.ID_THIET_BI,code:d.MA_THIET_BI,name:d.TEN_THIET_BI,detail:info,qty:take});}
    } else {
      for(let i=0;i<take;i++){const d=newDevice({CHI_TIET_THIET_BI:info,TINH_TRANG:tt});ids.push(d.ID_THIET_BI);made.push({id:d.ID_THIET_BI,code:d.MA_THIET_BI,name:d.TEN_THIET_BI,detail:info,qty:1});}
    }
    const price=toNumber_(l.DON_GIA_BINH_QUAN||0);
    if(!opt.noLedger)ctx.ledgerAdd.push({ID_GIAO_DICH:generateId_('KHO_NHAPXUATTON'),SO_PHIEU:docNo,NGAY_GIAO_DICH:ctx.now,LOAI_GIAO_DICH:'XUAT',ID_KHO:normalizeWarehouseIdV5447_(l.ID_KHO),ID_THIET_BI:String(l.ID_THIET_BI||''),ID_DANH_MUC:base.ID_DANH_MUC,MO_TA_CHI_TIET:info,
      SO_LUONG_NHAP:0,SO_LUONG_XUAT:take,TON_SAU_GIAO_DICH:ton-take,DON_GIA:price,THANH_TIEN:take*price,NHA_CUNG_CAP:'',ID_NHAN_SU_NHAN:target.empId,ID_PHONG_BAN_NHAN:target.deptId,TINH_TRANG:state,
      ID_CHUNG_TU_LIEN_QUAN:propId,ID_CHUNG_TU:propId,ID_THIET_BI_CAP:ids.filter(function(x,i,a){return a.indexOf(x)===i;}).join(','),ID_TAI_KHOAN_THUC_HIEN:String(ctx.user.id||''),
      GHI_CHU:'Xuất dùng theo đề xuất '+String(prop.MA_PHIEU||propId)+(target.type===TARGET_V5485_.EMP?' · cho '+String(target.emp&&target.emp.HO_TEN||target.empId):' · cho phòng '+String(dept.TEN_PHONG_BAN||target.deptId)),TRANG_THAI:'HOAN_THANH',NGAY_TAO:ctx.now,NGAY_CAP_NHAT:ctx.now});
  });
  return {issued:qty,shortage:want-qty,docNo:docNo,devices:made,loc:loc,dept:dept};
}
/** Thông tin in biên bản bàn giao. */
function handoverInfoV5485_(prop,target,res){
  return {proposal:String(prop.MA_PHIEU||prop.ID_DE_XUAT||''),docNo:res.docNo,date:nowText_(),type:target.type,
    empName:target.emp?String(target.emp.HO_TEN||''):'',empId:target.empId,deptName:String(res.dept&&res.dept.TEN_PHONG_BAN||target.deptId||''),deptId:target.deptId,
    items:res.devices.map(function(d){return {code:d.code,name:d.name,detail:d.detail,qty:d.qty,added:!!d.added};})};
}

/**
 * Duyệt đề xuất Xuất dùng / Mua mới.
 * items: [{id, qty?, stockId?, ID_KHO?, ID_CO_SO?, ID_TANG?, VI_TRI?, shortage:'partial'|'skip', note?}]
 */
function approvePurchaseProposalsV5485_(items,user){
  items=(Array.isArray(items)?items:[items]).map(function(x){return typeof x==='object'&&x?x:{id:x};}).filter(function(x){return String(x.id||'').trim();});
  if(!items.length)throw new Error('Chưa chọn đề xuất.');
  if(items.length>ISSUE_BATCH_MAX_V5485_)throw new Error('Mỗi lần duyệt tối đa '+ISSUE_BATCH_MAX_V5485_+' đề xuất.');
  user=user||{};const ctx=issueCtxV5485_(user),props=safeReadRowsV513_('DE_XUAT_MUA_THIET_BI'),results=[],handover=[];
  items.forEach(function(it){
    const id=String(it.id).trim(),prop=props.find(function(r){return String(r.ID_DE_XUAT||'')===id||String(r.MA_PHIEU||'')===id;});
    if(!prop){results.push({id:id,ok:false,reason:'Không tìm thấy đề xuất'});return;}
    const pid=String(prop.ID_DE_XUAT||id),code=String(prop.MA_PHIEU||pid);
    if(!proposalPendingV5485_(prop)){results.push({id:code,ok:false,reason:'Đề xuất đang ở trạng thái "'+String(prop.TRANG_THAI||'')+'"'});return;}
    if(!user.isAdmin&&user.employeeId&&String(prop.ID_NHAN_SU_DE_XUAT||'')===String(user.employeeId)){results.push({id:code,ok:false,reason:'Không tự duyệt đề xuất của mình'});return;}
    const kind=proposalKindV5485_(prop),qty=Math.max(1,Math.floor(toNumber_(it.qty)||toNumber_(prop.SO_LUONG)||1)),note=String(it.note||'').trim();
    if(toNumber_(prop.SO_LUONG)&&qty>toNumber_(prop.SO_LUONG)){results.push({id:code,ok:false,reason:'SL duyệt lớn hơn SL đề xuất ('+prop.SO_LUONG+')'});return;}
    const upd={SO_LUONG_DUYET:qty,NGAY_DUYET:ctx.now,ID_TAI_KHOAN_DUYET:String(user.id||user.email||''),GHI_CHU_DUYET:note};
    try{
      const cat=proposalCategoryV5485_(prop,ctx.cats),target=proposalTargetV5485_(prop,ctx.emps);
      if(cat&&!String(prop.ID_DANH_MUC||'').trim())upd.ID_DANH_MUC=String(cat.ID_DANH_MUC);
      if(kind==='buy'){
        upd.TRANG_THAI=PST_V5485_.WAIT_IN;upd.SO_LUONG_DA_NHAP=toNumber_(prop.SO_LUONG_DA_NHAP)||0;
        ctx.propUpd[pid]=upd;ctx.logs.push(['APPROVE',SHEET.DE_XUAT_MUA_THIET_BI,pid,'Duyệt mua mới '+code+' · SL '+qty+' → Chờ nhập kho · '+String(user.email||'')]);
        results.push({id:code,ok:true,kind:kind,status:upd.TRANG_THAI});return;
      }
      if(!cat)throw new Error('Đề xuất chưa chọn danh mục thiết bị.');
      const isNew=kind==='new';
      if(isNew&&target.type===TARGET_V5485_.STOCK)throw new Error('Xuất mới phải có nhân viên hoặc phòng ban nhận.');
      const newPrice=isNew?Math.max(0,toNumber_(it.price!=null&&it.price!==''?it.price:prop.DON_GIA_DU_KIEN)):0,newInfo=isNew?String(it.MO_TA_CHI_TIET!=null&&it.MO_TA_CHI_TIET!==''?it.MO_TA_CHI_TIET:(prop.MO_TA_CHI_TIET||'')).trim():'';
      const snapshot={la:ctx.ledgerAdd.length,da:ctx.devAdd.length,h:ctx.hist.length,du:JSON.stringify(ctx.devUpd),st:ctx.stock.map(function(s){return s.SO_LUONG_TON;}),dv:ctx.devices.length,t:ctx.touched.length};
      let res;
      const iopt=isNew?{qty:qty,noLedger:true,source:'Kho ngoài · '+String(prop.KHO_NGUON||'').trim(),lines:[{ID_KHO:'',ID_THIET_BI:'',ID_DANH_MUC:String(cat.ID_DANH_MUC),MO_TA_CHI_TIET:newInfo,SO_LUONG_TON:qty,DON_GIA_BINH_QUAN:newPrice,TINH_TRANG:'Thiết bị mới'}],ID_CO_SO:it.ID_CO_SO,ID_TANG:it.ID_TANG,VI_TRI:it.VI_TRI}
        :{qty:qty,stockId:it.stockId,ID_KHO:it.ID_KHO||prop.ID_KHO,ID_CO_SO:it.ID_CO_SO,ID_TANG:it.ID_TANG,VI_TRI:it.VI_TRI,allowPartial:it.shortage==='partial'};
      try{res=issueForProposalV5485_(ctx,prop,cat,target,iopt);}
      catch(e){ctx.ledgerAdd.length=snapshot.la;ctx.devAdd.length=snapshot.da;ctx.hist.length=snapshot.h;ctx.devUpd=JSON.parse(snapshot.du);ctx.stock.forEach(function(s,i){s.SO_LUONG_TON=snapshot.st[i];});ctx.devices.length=snapshot.dv;ctx.touched.length=snapshot.t;throw e;}
      upd.SO_LUONG_DUYET=res.issued;upd.SO_LUONG_DA_XUAT=res.issued;upd.TRANG_THAI=PST_V5485_.DONE;upd.NGAY_HOAN_THANH=ctx.now;
      if(!isNew)upd.SO_PHIEU_LIEN_QUAN=appendNoteV5485_(prop.SO_PHIEU_LIEN_QUAN,res.docNo).replace(/ \| /g,', ');
      else{upd.DON_GIA_DU_KIEN=newPrice;upd.THANH_TIEN=newPrice*res.issued;upd.MO_TA_CHI_TIET=newInfo;}
      upd.ID_THIET_BI_CAP=res.devices.map(function(d){return d.id+':'+d.qty;}).join(',');
      upd.MA_THIET_BI_DA_CAP=res.devices.map(function(d){return d.code+(d.qty>1?'×'+d.qty:'');}).join(', ');
      if(!String(prop.ID_PHONG_BAN_NHAN||'').trim())upd.ID_PHONG_BAN_NHAN=target.deptId;
      if(!String(prop.ID_NHAN_SU_NHAN||'').trim()&&target.empId)upd.ID_NHAN_SU_NHAN=target.empId;
      if(!String(prop.DOI_TUONG_SU_DUNG||'').trim())upd.DOI_TUONG_SU_DUNG=target.type;
      let buyId='';
      if(res.shortage>0){
        const nid=generateId_('DE_XUAT_MUA_THIET_BI'),price=toNumber_(prop.DON_GIA_DU_KIEN);buyId=uniqueDocV5485_(ctx,'DXMM');
        ctx.propAdd.push({ID_DE_XUAT:nid,MA_PHIEU:buyId,NGAY_DE_XUAT:Utilities.formatDate(new Date(),APP_CONFIG.TIMEZONE,APP_CONFIG.DATE_FORMAT),HINH_THUC_DE_XUAT:'MUA_MOI',NHOM_THIET_BI:prop.NHOM_THIET_BI||'THIẾT BỊ',
          TEN_THIET_BI:String(cat.TEN_DANH_MUC||prop.TEN_THIET_BI||''),ID_DANH_MUC:String(cat.ID_DANH_MUC),SO_LUONG:res.shortage,DON_GIA_DU_KIEN:price,THANH_TIEN:price*res.shortage,TRANG_THAI:PST_V5485_.WAIT,
          ID_NHAN_SU_DE_XUAT:prop.ID_NHAN_SU_DE_XUAT||'',ID_PHONG_BAN:prop.ID_PHONG_BAN||target.deptId,DOI_TUONG_SU_DUNG:target.type,ID_NHAN_SU_NHAN:target.empId,ID_PHONG_BAN_NHAN:target.deptId,ID_DE_XUAT_GOC:pid,
          NOI_DUNG_DE_XUAT:'Mua phần thiếu của đề xuất xuất dùng '+code,LY_DO_DE_XUAT:'Kho không đủ khi duyệt '+code,NGAY_TAO:ctx.now,NGAY_CAP_NHAT:ctx.now});
        upd.GHI_CHU_DUYET=appendNoteV5485_(note,'Xuất '+res.issued+'/'+qty+', phần thiếu '+res.shortage+' → đề xuất mua '+buyId);
      }
      ctx.propUpd[pid]=upd;
      ctx.logs.push(['ISSUE',SHEET.DE_XUAT_MUA_THIET_BI,pid,(isNew?'Duyệt xuất mới (kho ngoài) ':'Duyệt & xuất ')+code+' · '+res.docNo+' · '+res.issued+' cái · '+upd.MA_THIET_BI_DA_CAP+' · '+String(user.email||'')]);
      handover.push(handoverInfoV5485_(prop,target,res));
      results.push({id:code,ok:true,kind:kind,status:upd.TRANG_THAI,docNo:res.docNo,issued:res.issued,shortage:res.shortage,buyProposal:buyId,devices:res.devices.map(function(d){return d.code;})});
    }catch(e){results.push({id:code,ok:false,reason:e&&e.message?e.message:String(e)});}
  });
  issueFlushV5485_(ctx);
  const touched=ctx.touched.filter(function(x,i,a){return a.indexOf(x)===i;});
  return {ok:true,done:results.filter(function(r){return r.ok;}).length,results:results,handover:handover,devicePatch:touched.length?devicePatchV5484_(touched):null};
}
function approvePurchaseProposalsV5485(items){
  const user=authRequireUserV5470_(authTokenFromArgsV5470_(arguments));
  authAssertPermissionV5471_(user,'DE_XUAT_QUAN_LY','DUYET');
  return withScriptLockV5471_(function(){return approvePurchaseProposalsV5485_(items,user);});
}

/** Xem trước cho hộp Duyệt / Nhập kho: tồn khả dụng, đã hứa, lô sẽ lấy, người nhận, vị trí gợi ý. */
function getIssuePreviewV5485_(ids){
  ids=(Array.isArray(ids)?ids:[ids]).map(function(x){return String(x||'').trim();}).filter(Boolean).slice(0,ISSUE_BATCH_MAX_V5485_);
  const props=safeReadRowsV513_('DE_XUAT_MUA_THIET_BI'),cats=safeReadRowsV513_('DM_THIETBI'),emps=safeReadRowsV513_('NHAN_SU'),depts=safeReadRowsV513_('DANH_MUC_PHONG_BAN'),floors=safeReadRowsV513_('DANH_MUC_TANG'),devices=safeReadRowsV513_('THIET_BI');
  const stock=(getWarehouseDeviceNXTBundleV5420_().stock||[]).filter(function(s){return toNumber_(s.SO_LUONG_TON)>0;});
  const promised=promisedByCategoryV5485_(props,cats);
  const out=ids.map(function(id){
    const p=props.find(function(r){return String(r.ID_DE_XUAT||'')===id||String(r.MA_PHIEU||'')===id;});if(!p)return {id:id,missing:true};
    const cat=proposalCategoryV5485_(p,cats),t=proposalTargetV5485_(p,emps),mine=proposalPendingV5485_(p)&&proposalKindV5485_(p)==='issue'?proposalQtyV5485_(p):0;
    const lines=cat?stock.filter(function(s){return String(s.ID_DANH_MUC||'')===String(cat.ID_DANH_MUC);}).sort(function(a,b){return (parseDateV5484_(a.NGAY_NHAP_CUOI)||0)-(parseDateV5484_(b.NGAY_NHAP_CUOI)||0);}).map(function(s){return {ID_TON_KHO:s.ID_TON_KHO,ID_KHO:s.ID_KHO,SO_LUONG_TON:toNumber_(s.SO_LUONG_TON),MO_TA_CHI_TIET:s.MO_TA_CHI_TIET||'',NGAY_NHAP_CUOI:s.NGAY_NHAP_CUOI||'',DON_GIA:s.DON_GIA_BINH_QUAN||0,TINH_TRANG:s.TINH_TRANG||''};}):[];
    return {id:String(p.ID_DE_XUAT||id),code:String(p.MA_PHIEU||id),kind:proposalKindV5485_(p),status:String(p.TRANG_THAI||''),qty:toNumber_(p.SO_LUONG)||1,approved:toNumber_(p.SO_LUONG_DUYET),received:toNumber_(p.SO_LUONG_DA_NHAP),issuedQty:toNumber_(p.SO_LUONG_DA_XUAT),
      price:toNumber_(p.DON_GIA_DU_KIEN),khoNguon:String(p.KHO_NGUON||''),moTa:String(p.MO_TA_CHI_TIET||''),categoryId:cat?String(cat.ID_DANH_MUC):'',categoryName:cat?String(cat.TEN_DANH_MUC||''):String(p.TEN_THIET_BI||''),supply:cat?isSupplyCategoryV5485_(cat):false,
      target:t.type,empId:t.empId,empName:t.emp?String(t.emp.HO_TEN||''):'',deptId:t.deptId,deptName:(function(){const d=depts.find(function(x){return String(x.ID_PHONG_BAN||'')===t.deptId;});return d?String(d.TEN_PHONG_BAN||''):t.deptId;})(),
      empResigned:!!(t.emp&&isEmployeeResignedV5480_(t.emp)),lines:lines,available:lines.reduce(function(s,l){return s+l.SO_LUONG_TON;},0),promisedOthers:Math.max(0,(cat?promised[String(cat.ID_DANH_MUC)]||0:0)-mine),
      location:t.type===TARGET_V5485_.STOCK?null:locationGuessV5485_(devices,floors,depts,t.empId,t.deptId),khoId:String(p.ID_KHO||'')};
  });
  return {ok:true,items:out};
}
function getIssuePreviewV5485(){return authCallPermV5471_('DE_XUAT_QUAN_LY','XEM',getIssuePreviewV5485_,arguments);}
/** "Đã hứa": tổng SL các đề xuất xuất dùng đang chờ duyệt theo danh mục. */
function promisedByCategoryV5485_(props,cats){
  const m={};(props||[]).forEach(function(p){if(proposalKindV5485_(p)!=='issue'||!proposalPendingV5485_(p))return;const c=proposalCategoryV5485_(p,cats);if(!c)return;const k=String(c.ID_DANH_MUC);m[k]=(m[k]||0)+proposalQtyV5485_(p);});
  return m;
}
function stockByCategoryV5485_(props,cats){
  const out={};let stock=[];try{stock=stockSummaryV5487_().stock||[];}catch(e){}
  stock.forEach(function(s){const k=String(s.ID_DANH_MUC||'');if(!k)return;(out[k]=out[k]||{ton:0,promised:0}).ton+=toNumber_(s.SO_LUONG_TON);});
  const pr=promisedByCategoryV5485_(props,cats);Object.keys(pr).forEach(function(k){(out[k]=out[k]||{ton:0,promised:0}).promised=pr[k];});
  return out;
}

/** Hủy duyệt đề xuất Xuất dùng / Xuất mới (đảo phiếu XK, thiết bị → Đã hủy cấp) hoặc Mua ngoài chưa nhập kho. */
function cancelPurchaseApprovalV5485_(id,reason,user){
  id=String(id||'').trim();if(!id)throw new Error('Thiếu mã đề xuất.');
  reason=String(reason||'').trim();if(reason.length<5)throw new Error('Vui lòng nhập lý do (ít nhất 5 ký tự).');
  ensureAllColsV5485_();user=user||{};
  const prop=safeReadRowsV513_('DE_XUAT_MUA_THIET_BI').find(function(r){return String(r.ID_DE_XUAT||'')===id||String(r.MA_PHIEU||'')===id;});
  if(!prop)throw new Error('Không tìm thấy đề xuất: '+id);
  const pid=String(prop.ID_DE_XUAT),code=String(prop.MA_PHIEU||pid),st=normalizeTextV543_(prop.TRANG_THAI),now=nowText_(),kind=proposalKindV5485_(prop);
  const back={TRANG_THAI:PST_V5485_.WAIT,SO_LUONG_DUYET:'',NGAY_DUYET:'',ID_TAI_KHOAN_DUYET:'',NGAY_HOAN_THANH:'',GHI_CHU_DUYET:appendNoteV5485_(prop.GHI_CHU_DUYET,'[Hủy duyệt '+now+'] '+reason+' · '+String(user.email||''))};
  const ledger=safeReadRowsV513_('KHO_NHAPXUATTON').filter(function(r){return String(r.ID_CHUNG_TU_LIEN_QUAN||'')===pid&&!/HUY/.test(normalizeTextV543_(r.TRANG_THAI));});
  const nk=ledger.filter(function(r){return toNumber_(r.SO_LUONG_NHAP)>0;}),xk=ledger.filter(function(r){return toNumber_(r.SO_LUONG_XUAT)>0;});
  if(kind==='buy'&&nk.length)throw new Error('Đề xuất mua đã nhập kho '+nk.length+' phiếu — không hủy duyệt được. Muốn trả hàng hãy lập phiếu xuất / thanh lý.');
  if(kind==='buy'&&!/CHO NHAP KHO|DA DUYET/.test(st))throw new Error('Đề xuất đang ở trạng thái "'+String(prop.TRANG_THAI||'')+'".');
  if(kind!=='buy'&&!/HOAN THANH|DA DUYET|XUAT/.test(st))throw new Error('Đề xuất chưa được duyệt.');
  // Danh sách cấp phát cần đảo: phiếu XK (Xuất dùng) hoặc ID_THIET_BI_CAP "id:sl" (Xuất mới – không có phiếu kho).
  const allocs=[];
  if(kind==='new')String(prop.ID_THIET_BI_CAP||'').split(',').forEach(function(s){const m=s.trim().split(':');if(m[0])allocs.push({ids:[m[0]],q:toNumber_(m[1])||1,emp:String(prop.ID_NHAN_SU_NHAN||''),dept:String(prop.ID_PHONG_BAN_NHAN||'')});});
  else xk.forEach(function(x){allocs.push({ids:String(x.ID_THIET_BI_CAP||'').split(',').map(function(s){return s.trim();}).filter(Boolean),q:toNumber_(x.SO_LUONG_XUAT),emp:String(x.ID_NHAN_SU_NHAN||''),dept:String(x.ID_PHONG_BAN_NHAN||'')});});
  const devices=safeReadRowsV513_('THIET_BI'),hist=safeReadRowsV513_('LICH_SU_CHUYEN_THIET_BI'),devUpd={},blocked=[],touched=[];
  allocs.forEach(function(al){
    al.ids.forEach(function(did){
      const d=devices.find(function(r){return String(r.ID_THIET_BI||'')===did;});if(!d)return;
      const moved=String(d.ID_NHAN_SU_SU_DUNG||'')!==al.emp||String(d.ID_PHONG_BAN||'')!==String(al.dept||d.ID_PHONG_BAN||'')||normalizeTextV543_(d.TRANG_THAI).indexOf('DANG SU DUNG')<0;
      const later=hist.filter(function(h){return String(h.ID_THIET_BI||'')===did;}).length>1;
      if(moved||later){blocked.push(String(d.MA_THIET_BI||did));return;}
      const cur=devUpd[did]||{},n=(cur.SO_LUONG!=null?toNumber_(cur.SO_LUONG):(toNumber_(d.SO_LUONG)||1));
      if(toNumber_(d.SO_LUONG)>0&&n-al.q>0){devUpd[did]={SO_LUONG:n-al.q};}
      else devUpd[did]={TRANG_THAI:'Đã hủy cấp',GHI_CHU:appendNoteV5485_(d.GHI_CHU,'[Hủy cấp '+now+'] hủy duyệt '+code+': '+reason)};
      touched.push(did);
    });
  });
  if(blocked.length)throw new Error('Không hủy được: thiết bị '+blocked.slice(0,8).join(', ')+' đã được chuyển / sửa sau khi cấp. Hãy thu hồi các máy này như bình thường.');
  const ledUpd={};xk.forEach(function(x){ledUpd[String(x.ID_GIAO_DICH)]={TRANG_THAI:'ĐÃ HỦY',GHI_CHU:appendNoteV5485_(x.GHI_CHU,'[Hủy '+now+'] '+reason)};});
  back.SO_LUONG_DA_XUAT=0;back.MA_THIET_BI_DA_CAP='';back.ID_THIET_BI_CAP='';
  batchUpdateRowsV5484_('KHO_NHAPXUATTON',ledUpd);batchUpdateRowsV5484_('THIET_BI',devUpd);
  const pu={};pu[pid]=back;batchUpdateRowsV5484_('DE_XUAT_MUA_THIET_BI',pu);
  writeSystemLogsV5484_([['UNAPPROVE',SHEET.DE_XUAT_MUA_THIET_BI,pid,'Hủy duyệt '+code+' · '+xk.length+' phiếu XK · '+touched.length+' thiết bị · '+reason+' · '+String(user.email||'')]]);
  nxtCacheClearV5477_();
  return {ok:true,id:pid,code:code,reversed:xk.length,devices:touched.length,devicePatch:touched.length?devicePatchV5484_(touched):null};
}
function cancelPurchaseApprovalV5485(id,reason){
  const user=authRequireUserV5470_(authTokenFromArgsV5470_(arguments));
  authAssertPermissionV5471_(user,'DE_XUAT_QUAN_LY','DUYET');
  return withScriptLockV5471_(function(){return cancelPurchaseApprovalV5485_(id,reason,user);});
}

/** Nhập kho theo đề xuất mua (nhập nhiều lần). Dùng cho nhân viên / phòng ban → tự xuất ngay cho người đó. */
function receivePurchaseV5485_(p,user){
  p=Object.assign({},p||{});user=user||{};
  const id=String(p.id||p.ID_DE_XUAT||'').trim();if(!id)throw new Error('Thiếu mã đề xuất.');
  const ctx=issueCtxV5485_(user),prop=safeReadRowsV513_('DE_XUAT_MUA_THIET_BI').find(function(r){return String(r.ID_DE_XUAT||'')===id||String(r.MA_PHIEU||'')===id;});
  if(!prop)throw new Error('Không tìm thấy đề xuất: '+id);
  if(proposalKindV5485_(prop)!=='buy')throw new Error('Chỉ nhập kho cho đề xuất Mua mới.');
  const st=normalizeTextV543_(prop.TRANG_THAI);if(!/CHO NHAP KHO|NHAP MOT PHAN|DA DUYET/.test(st))throw new Error('Đề xuất đang ở trạng thái "'+String(prop.TRANG_THAI||'')+'" — chỉ nhập khi đã duyệt.');
  const pid=String(prop.ID_DE_XUAT),code=String(prop.MA_PHIEU||pid),need=proposalQtyV5485_(prop),got=toNumber_(prop.SO_LUONG_DA_NHAP),left=Math.max(0,need-got);
  const qty=Math.floor(toNumber_(p.qty||p.SO_LUONG_NHAP));if(qty<=0)throw new Error('Số lượng nhập phải lớn hơn 0.');
  if(left&&qty>left)throw new Error('Chỉ còn '+left+' cái chưa nhập theo đề xuất.');
  const catId=String(p.ID_DANH_MUC||'').trim()||String((proposalCategoryV5485_(prop,ctx.cats)||{}).ID_DANH_MUC||'');
  const cat=ctx.cats.find(function(c){return String(c.ID_DANH_MUC||'')===catId;});if(!cat)throw new Error('Vui lòng chọn danh mục thiết bị.');
  const allowed=['Tốt','Bình thường','Thiết bị mới','Thiết bị cũ','Hư hỏng','Cần kiểm tra'],state=String(p.TINH_TRANG||'Thiết bị mới').trim();
  if(allowed.indexOf(state)<0)throw new Error('Tình trạng khi nhập không hợp lệ.');
  const kho=normalizeWarehouseIdV5447_(p.ID_KHO||prop.ID_KHO),price=Math.max(0,toNumber_(p.DON_GIA!=null&&p.DON_GIA!==''?p.DON_GIA:prop.DON_GIA_DU_KIEN)),dev=generateWarehouseDeviceIdV5452_(),nk=uniqueDocV5485_(ctx,'NK');
  const info=String(p.MO_TA_CHI_TIET||'').trim(),date=String(p.NGAY_GIAO_DICH||'').trim()||ctx.now;
  ctx.ledgerAdd.push({ID_GIAO_DICH:generateId_('KHO_NHAPXUATTON'),SO_PHIEU:nk,NGAY_GIAO_DICH:date,LOAI_GIAO_DICH:'NHAP',ID_KHO:kho,ID_THIET_BI:dev,ID_DANH_MUC:catId,MO_TA_CHI_TIET:info,SO_LUONG_NHAP:qty,SO_LUONG_XUAT:0,TON_SAU_GIAO_DICH:qty,
    DON_GIA:price,THANH_TIEN:qty*price,NHA_CUNG_CAP:String(p.NHA_CUNG_CAP||''),ID_NHAN_SU_NHAN:'',TINH_TRANG:state,ID_CHUNG_TU_LIEN_QUAN:pid,ID_CHUNG_TU:pid,ID_TAI_KHOAN_THUC_HIEN:String(user.id||''),
    GHI_CHU:appendNoteV5485_(p.GHI_CHU,'Nhập kho theo đề xuất mua '+code),TRANG_THAI:'HOAN_THANH',NGAY_TAO:ctx.now,NGAY_CAP_NHAT:ctx.now});
  const line={ID_TON_KHO:'TON-'+kho+'|'+dev,ID_KHO:kho,ID_THIET_BI:dev,ID_DANH_MUC:catId,MO_TA_CHI_TIET:info,SO_LUONG_TON:qty,DON_GIA_BINH_QUAN:price,TINH_TRANG:state,NGAY_NHAP_CUOI:date};
  ctx.stock.push(line);
  const got2=got+qty,full=!need||got2>=need,target=proposalTargetV5485_(prop,ctx.emps);
  const upd={SO_LUONG_DA_NHAP:got2,TRANG_THAI:full?PST_V5485_.DONE:PST_V5485_.PART_IN,SO_PHIEU_LIEN_QUAN:[String(prop.SO_PHIEU_LIEN_QUAN||'').trim(),nk].filter(Boolean).join(', ')};
  if(!String(prop.ID_DANH_MUC||'').trim())upd.ID_DANH_MUC=catId;
  if(!String(prop.ID_KHO||'').trim())upd.ID_KHO=kho;
  let res=null,handover=null;
  if(target.type!==TARGET_V5485_.STOCK){
    res=issueForProposalV5485_(ctx,prop,cat,target,{qty:qty,lines:[line],ID_CO_SO:p.ID_CO_SO,ID_TANG:p.ID_TANG,VI_TRI:p.VI_TRI});
    upd.SO_LUONG_DA_XUAT=toNumber_(prop.SO_LUONG_DA_XUAT)+res.issued;upd.SO_PHIEU_LIEN_QUAN+=', '+res.docNo;
    upd.MA_THIET_BI_DA_CAP=[String(prop.MA_THIET_BI_DA_CAP||'').trim()].concat(res.devices.map(function(d){return d.code+(d.qty>1?'×'+d.qty:'');})).filter(Boolean).join(', ');
    handover=handoverInfoV5485_(prop,target,res);
  }
  if(full)upd.NGAY_HOAN_THANH=ctx.now;
  const pu={};pu[pid]=upd;ctx.propUpd=pu;
  ctx.logs.push(['RECEIVE',SHEET.DE_XUAT_MUA_THIET_BI,pid,'Nhập kho '+nk+' theo '+code+' · SL '+qty+(res?' · xuất '+res.docNo+' '+upd.MA_THIET_BI_DA_CAP:'')+' · '+String(user.email||'')]);
  issueFlushV5485_(ctx);
  const touched=ctx.touched.filter(function(x,i,a){return a.indexOf(x)===i;});
  return {ok:true,id:pid,code:code,documentNo:nk,received:qty,totalReceived:got2,need:need,status:upd.TRANG_THAI,issued:res?res.issued:0,issueDoc:res?res.docNo:'',devices:res?res.devices.map(function(d){return d.code;}):[],handover:handover,devicePatch:touched.length?devicePatchV5484_(touched):null};
}
function receivePurchaseV5485(p){
  const user=authRequireUserV5470_(authTokenFromArgsV5470_(arguments));
  authAssertPermissionV5471_(user,'KHO_NHAP_XUAT_TON','THEM');
  return withScriptLockV5471_(function(){return receivePurchaseV5485_(p,user);});
}

/** Đặt danh mục là "Theo từng máy" hoặc "Vật tư". */
function setCategoryModeV5485_(ids,mode,user){
  ids=(Array.isArray(ids)?ids:[ids]).map(function(x){return String(x||'').trim();}).filter(Boolean);
  if(!ids.length)throw new Error('Chưa chọn danh mục.');
  const val=/VAT TU/.test(normalizeTextV543_(mode))?'Vật tư':'Theo từng máy';
  ensureColsV5485_(SHEET.DM_THIETBI,CATEGORY_COLS_V5485_);
  const up={};ids.forEach(function(id){up[id]={QUAN_LY_THEO_MAY:val};});
  const r=batchUpdateRowsV5484_('DANH_MUC_THIET_BI',up);
  writeSystemLogsV5484_([['UPDATE',SHEET.DM_THIETBI,r.updated.join(','),'Đặt quản lý: '+val+' · '+String((user||{}).email||'')]]);
  return {ok:true,mode:val,done:r.updated.length,results:ids.map(function(id){return {id:id,ok:r.updated.indexOf(id)>=0,reason:r.updated.indexOf(id)>=0?'':'Không tìm thấy'};})};
}
function setCategoryModeV5485(ids,mode){
  const user=authRequireUserV5470_(authTokenFromArgsV5470_(arguments));
  authAssertPermissionV5471_(user,'DANH_MUC_THIET_BI','SUA');
  return withScriptLockV5471_(function(){return setCategoryModeV5485_(ids,mode,user);});
}

/** Đối chiếu dữ liệu cũ: phiếu XK có người / phòng nhận nhưng chưa có thiết bị tương ứng. */
function reconcileIssuedV5485_(){
  const ledger=safeReadRowsV513_('KHO_NHAPXUATTON'),devices=safeReadRowsV513_('THIET_BI'),emps=safeReadRowsV513_('NHAN_SU'),cats=safeReadRowsV513_('DM_THIETBI');
  const bySlip={};devices.forEach(function(d){const s=String(d.SO_PHIEU_XUAT||'').trim();if(s)bySlip[s]=1;});
  const rows=ledger.filter(function(x){return toNumber_(x.SO_LUONG_XUAT)>0&&!/HUY/.test(normalizeTextV543_(x.TRANG_THAI))&&(String(x.ID_NHAN_SU_NHAN||'').trim()||String(x.ID_PHONG_BAN_NHAN||'').trim())&&!String(x.ID_THIET_BI_CAP||'').trim()&&!bySlip[String(x.SO_PHIEU||'').trim()];})
    .map(function(x){const e=emps.find(function(r){return String(r.ID_NHAN_SU||'')===String(x.ID_NHAN_SU_NHAN||'');})||{},c=cats.find(function(r){return String(r.ID_DANH_MUC||'')===String(x.ID_DANH_MUC||'');})||{};
      const same=devices.filter(function(d){return String(d.ID_DANH_MUC||'')===String(x.ID_DANH_MUC||'')&&x.ID_NHAN_SU_NHAN&&String(d.ID_NHAN_SU_SU_DUNG||'')===String(x.ID_NHAN_SU_NHAN);}).length;
      return {ID_GIAO_DICH:x.ID_GIAO_DICH,SO_PHIEU:x.SO_PHIEU,NGAY_GIAO_DICH:x.NGAY_GIAO_DICH,ID_DANH_MUC:x.ID_DANH_MUC,TEN_DANH_MUC:c.TEN_DANH_MUC||'',SO_LUONG_XUAT:toNumber_(x.SO_LUONG_XUAT),ID_NHAN_SU_NHAN:x.ID_NHAN_SU_NHAN||'',HO_TEN:e.HO_TEN||'',ID_PHONG_BAN_NHAN:x.ID_PHONG_BAN_NHAN||e.ID_PHONG_BAN||'',MO_TA_CHI_TIET:x.MO_TA_CHI_TIET||'',SAME_CATEGORY_DEVICES:same};});
  return {ok:true,rows:rows};
}
function reconcileIssuedV5485(){return authCallPermV5471_('KHO_NHAP_XUAT_TON','XEM',reconcileIssuedV5485_,arguments);}
/** Tạo thiết bị cho các phiếu XK cũ đã chọn (không trừ kho lần nữa). items: [{ID_GIAO_DICH, ID_CO_SO?, ID_TANG?, VI_TRI?}] */
function createDevicesForOldIssuesV5485_(items,user){
  items=(Array.isArray(items)?items:[]).filter(function(x){return x&&x.ID_GIAO_DICH;}).slice(0,100);
  if(!items.length)throw new Error('Chưa chọn phiếu xuất.');
  const ctx=issueCtxV5485_(user||{}),ledger=safeReadRowsV513_('KHO_NHAPXUATTON'),results=[],handover=[];
  items.forEach(function(it){
    const x=ledger.find(function(r){return String(r.ID_GIAO_DICH||'')===String(it.ID_GIAO_DICH);});
    if(!x){results.push({id:it.ID_GIAO_DICH,ok:false,reason:'Không tìm thấy phiếu'});return;}
    if(String(x.ID_THIET_BI_CAP||'').trim()){results.push({id:x.SO_PHIEU,ok:false,reason:'Phiếu đã có thiết bị'});return;}
    try{
      const cat=ctx.cats.find(function(c){return String(c.ID_DANH_MUC||'')===String(x.ID_DANH_MUC||'');});if(!cat)throw new Error('Phiếu không có danh mục');
      const fake={ID_DE_XUAT:String(x.ID_CHUNG_TU_LIEN_QUAN||''),MA_PHIEU:String(x.SO_PHIEU||''),ID_NHAN_SU_NHAN:x.ID_NHAN_SU_NHAN||'',ID_PHONG_BAN_NHAN:x.ID_PHONG_BAN_NHAN||'',DOI_TUONG_SU_DUNG:x.ID_NHAN_SU_NHAN?TARGET_V5485_.EMP:TARGET_V5485_.DEPT,HINH_THUC_DE_XUAT:'XUAT_DUNG'};
      const target=proposalTargetV5485_(fake,ctx.emps),la=ctx.ledgerAdd.length;
      const line={ID_KHO:x.ID_KHO,ID_THIET_BI:x.ID_THIET_BI,ID_DANH_MUC:x.ID_DANH_MUC,MO_TA_CHI_TIET:x.MO_TA_CHI_TIET||'',SO_LUONG_TON:toNumber_(x.SO_LUONG_XUAT),DON_GIA_BINH_QUAN:x.DON_GIA||0,TINH_TRANG:x.TINH_TRANG||''};
      const res=issueForProposalV5485_(ctx,fake,cat,target,{qty:toNumber_(x.SO_LUONG_XUAT),lines:[line],ID_CO_SO:it.ID_CO_SO,ID_TANG:it.ID_TANG,VI_TRI:it.VI_TRI});
      const added=ctx.ledgerAdd.splice(la);// không ghi phiếu XK mới: phiếu cũ đã trừ kho
      ctx.devAdd.forEach(function(d){if(d.SO_PHIEU_XUAT===res.docNo){d.SO_PHIEU_XUAT=String(x.SO_PHIEU||'');d.NGUON='Đối chiếu phiếu xuất cũ';}});
      ctx.ledgerUpd[String(x.ID_GIAO_DICH)]={ID_THIET_BI_CAP:added.map(function(a){return a.ID_THIET_BI_CAP;}).join(','),ID_PHONG_BAN_NHAN:target.deptId};
      ctx.logs.push(['RECONCILE',SHEET.KHO_NHAPXUATTON,String(x.ID_GIAO_DICH),'Tạo thiết bị cho phiếu cũ '+x.SO_PHIEU+': '+res.devices.map(function(d){return d.code;}).join(', ')]);
      res.docNo=String(x.SO_PHIEU||'');handover.push(handoverInfoV5485_(fake,target,res));
      results.push({id:String(x.SO_PHIEU||x.ID_GIAO_DICH),ok:true,devices:res.devices.map(function(d){return d.code;})});
    }catch(e){results.push({id:String(x.SO_PHIEU||x.ID_GIAO_DICH),ok:false,reason:e&&e.message?e.message:String(e)});}
  });
  issueFlushV5485_(ctx);
  const touched=ctx.touched.filter(function(x,i,a){return a.indexOf(x)===i;});
  return {ok:true,done:results.filter(function(r){return r.ok;}).length,results:results,handover:handover,devicePatch:touched.length?devicePatchV5484_(touched):null};
}
function createDevicesForOldIssuesV5485(items){
  const user=authRequireUserV5470_(authTokenFromArgsV5470_(arguments));
  authAssertPermissionV5471_(user,'KHO_NHAP_XUAT_TON','THEM');authAssertPermissionV5471_(user,'THIET_BI','THEM');
  return withScriptLockV5471_(function(){return createDevicesForOldIssuesV5485_(items,user);});
}

/** Báo cáo chi phí cấp phát theo phòng ban: phiếu XK thật (Kho mình / Mua ngoài) + đề xuất Xuất mới đã hoàn thành (Kho ngoài). Bỏ phiếu / đề xuất đã hủy. */
function issueCostReportV5485_(from,to){
  const a=parseDateV5484_(from)||0,b=parseDateV5484_(to)||0,emps=safeReadRowsV513_('NHAN_SU'),depts=safeReadRowsV513_('DANH_MUC_PHONG_BAN'),cats=safeReadRowsV513_('DM_THIETBI'),m={};
  const props=safeReadRowsV513_('DE_XUAT_MUA_THIET_BI'),kindOf={};props.forEach(function(p){kindOf[String(p.ID_DE_XUAT||'')]=proposalKindV5485_(p);});
  const inRange=function(v){const t=parseDateV5484_(v);if(a&&t&&t<a)return false;if(b&&t&&t>b+86399999)return false;return true;};
  const add=function(src,empId,deptId,catId,qty,val){
    const e=emps.find(function(r){return String(r.ID_NHAN_SU||'')===String(empId||'');})||{},dId=String(deptId||e.ID_PHONG_BAN||''),d=depts.find(function(r){return String(r.ID_PHONG_BAN||'')===dId;})||{};
    const c=cats.find(function(r){return String(r.ID_DANH_MUC||'')===String(catId||'');})||{},k=dId+'|'+String(catId||'')+'|'+src;
    const o=m[k]=m[k]||{ID_PHONG_BAN:dId,TEN_PHONG_BAN:String(d.TEN_PHONG_BAN||dId||'(không rõ)'),ID_DANH_MUC:String(catId||''),TEN_DANH_MUC:String(c.TEN_DANH_MUC||''),NGUON:src,SO_PHIEU:0,SO_LUONG:0,GIA_TRI:0};
    o.SO_PHIEU++;o.SO_LUONG+=qty;o.GIA_TRI+=val;};
  safeReadRowsV513_('KHO_NHAPXUATTON').forEach(function(x){
    if(toNumber_(x.SO_LUONG_XUAT)<=0||/HUY/.test(normalizeTextV543_(x.TRANG_THAI))||!inRange(x.NGAY_GIAO_DICH))return;
    const src=kindOf[String(x.ID_CHUNG_TU_LIEN_QUAN||'')]==='buy'?'Mua ngoài':'Kho mình';
    add(src,x.ID_NHAN_SU_NHAN,x.ID_PHONG_BAN_NHAN,x.ID_DANH_MUC,toNumber_(x.SO_LUONG_XUAT),toNumber_(x.THANH_TIEN)||toNumber_(x.SO_LUONG_XUAT)*toNumber_(x.DON_GIA));
  });
  props.forEach(function(p){if(proposalKindV5485_(p)!=='new'||!/HOAN THANH/.test(normalizeTextV543_(p.TRANG_THAI))||!inRange(p.NGAY_HOAN_THANH||p.NGAY_DUYET))return;
    const q=toNumber_(p.SO_LUONG_DA_XUAT)||toNumber_(p.SO_LUONG_DUYET);add('Kho ngoài',p.ID_NHAN_SU_NHAN,p.ID_PHONG_BAN_NHAN,p.ID_DANH_MUC,q,q*toNumber_(p.DON_GIA_DU_KIEN));});
  return {ok:true,rows:Object.keys(m).map(function(k){return m[k];}).sort(function(x,y){return x.TEN_PHONG_BAN.localeCompare(y.TEN_PHONG_BAN)||x.TEN_DANH_MUC.localeCompare(y.TEN_DANH_MUC)||x.NGUON.localeCompare(y.NGUON);})};
}
function issueCostReportV5485(){return authCallPermV5471_('KHO_NHAP_XUAT_TON','XEM',issueCostReportV5485_,arguments);}

/** Đề xuất mua đã duyệt đang chờ nhập kho (tab "Chờ nhập" của Kho NXT). */
function pendingReceiveV5485_(){
  const cats=safeReadRowsV513_('DM_THIETBI'),emps=safeReadRowsV513_('NHAN_SU');
  return safeReadRowsV513_('DE_XUAT_MUA_THIET_BI').filter(function(p){return proposalKindV5485_(p)==='buy'&&/CHO NHAP KHO|NHAP MOT PHAN/.test(normalizeTextV543_(p.TRANG_THAI));})
    .map(function(p){const c=proposalCategoryV5485_(p,cats),t=proposalTargetV5485_(p,emps);return {ID_DE_XUAT:p.ID_DE_XUAT,MA_PHIEU:p.MA_PHIEU,NGAY_DE_XUAT:p.NGAY_DE_XUAT,NGAY_DUYET:p.NGAY_DUYET,TEN_THIET_BI:p.TEN_THIET_BI,ID_DANH_MUC:c?c.ID_DANH_MUC:(p.ID_DANH_MUC||''),
      SO_LUONG:proposalQtyV5485_(p),SO_LUONG_DA_NHAP:toNumber_(p.SO_LUONG_DA_NHAP),DON_GIA_DU_KIEN:p.DON_GIA_DU_KIEN,TRANG_THAI:p.TRANG_THAI,DOI_TUONG_SU_DUNG:t.type,ID_NHAN_SU_NHAN:t.empId,ID_PHONG_BAN_NHAN:t.deptId,ID_KHO:p.ID_KHO||'',NHA_CUNG_CAP:p.NHA_CUNG_CAP||'',SO_PHIEU_LIEN_QUAN:p.SO_PHIEU_LIEN_QUAN||''};});
}

/** Duyệt 1 đề xuất bất kỳ: Xuất dùng / Mua mới → luồng V5.4.85; Thanh lý / Bảo trì → như cũ. */
function isPurchaseProposalIdV5485_(id){id=String(id||'').trim();return !!id&&safeReadRowsV513_('DE_XUAT_MUA_THIET_BI').some(function(r){return String(r.ID_DE_XUAT||'')===id||String(r.MA_PHIEU||'')===id;});}
function approveProposalRouteV5485_(id,user){
  const loc=proposalLocateV5486_(id);if(!loc)throw new Error('Không tìm thấy đề xuất: '+id);
  if(loc.table!=='DE_XUAT_MUA_THIET_BI'){const rr=(loc.table==='DE_XUAT_THANH_LY'?approveDisposalsV5486_:approveMaintenanceV5486_)([loc.id],user,''),x=rr.results[0]||{};if(!x.ok)throw new Error(x.reason||'Không duyệt được.');return {ok:true,id:id,status:x.status,devicePatch:rr.touched.length?devicePatchV5484_(rr.touched):null};}
  const res=approvePurchaseProposalsV5485_([{id:id}],user),r=res.results[0]||{};
  if(!r.ok)throw new Error(r.reason||'Không duyệt được.');
  return {ok:true,id:id,status:r.status,docNo:r.docNo||'',devices:r.devices||[],devicePatch:res.devicePatch};
}


/* =========================================================
 * V5.4.86 - THANH LÝ và SỬA CHỮA / BẢO TRÌ (phương án B) + định tuyến duyệt / hủy duyệt chung
 *  Thanh lý: chọn nhiều máy từ Kho thiết bị đang dùng → Duyệt: máy "Chờ thanh lý" (tự thu hồi người dùng)
 *            → Lập phiếu thanh lý từ đề xuất: THANH_LY_THIET_BI + máy "Đã thanh lý". Hủy duyệt trả máy như cũ.
 *  Sửa chữa: chọn 1 máy → Duyệt: máy "Bảo trì", đề xuất "Đang sửa" → Hoàn tất: sửa xong (máy về trạng thái cũ)
 *            hoặc không sửa được (máy "Hỏng"). Hủy duyệt trả máy như cũ.
 * ========================================================= */
const DISPOSAL_COLS_V5486_=['ID_THIET_BI','MA_HANG','TEN_HANG','SO_LUONG','DS_THIET_BI','GIA_TRI_CON_LAI','GIA_DE_XUAT_THANH_LY','HINH_THUC_THANH_LY','LY_DO_DE_XUAT','ID_NHAN_SU_DE_XUAT','GHI_CHU','NGAY_DE_XUAT','TRANG_THAI_MAY_TRUOC','NGAY_DUYET','ID_TAI_KHOAN_DUYET','GHI_CHU_DUYET','SO_PHIEU_THANH_LY','NGAY_HOAN_THANH'];
const MAINT_COLS_V5486_=['ID_THIET_BI','MA_THIET_BI','TEN_THIET_BI','LOAI_BAO_TRI','MO_TA_SU_CO','NOI_SUA','CHI_PHI','ID_NHAN_SU_SU_DUNG','ID_PHONG_BAN','ID_NHAN_SU_DE_XUAT','GHI_CHU','TRANG_THAI_MAY_TRUOC','NGAY_DUYET','ID_TAI_KHOAN_DUYET','GHI_CHU_DUYET','KET_QUA','CHI_PHI_THUC_TE','NGAY_HOAN_TAT'];
const SLIP_COLS_V5486_=['ID_DE_XUAT','HINH_THUC_THANH_LY','GHI_CHU'];
function deviceGoneV5486_(d){return /THANH LY|HUY CAP/.test(normalizeTextV543_(d&&d.TRANG_THAI));}
function pendingGenericV5486_(r){const t=normalizeTextV543_(r&&r.TRANG_THAI);return !t||/CHO DUYET|CHO XU LY|MOI TAO|CHUA DUYET/.test(t);}
function parseJsonV5486_(s,def){try{const v=JSON.parse(String(s||''));return v==null?def:v;}catch(e){return def;}}
function disposalItemsV5486_(p){const a=parseJsonV5486_(p.DS_THIET_BI,null);if(Array.isArray(a)&&a.length)return a;return String(p.ID_THIET_BI||'').trim()?[{id:String(p.ID_THIET_BI),gtcl:toNumber_(p.GIA_TRI_CON_LAI),gia:toNumber_(p.GIA_DE_XUAT_THANH_LY)}]:[];}
function activeDisposalDevicesV5486_(exceptId){
  const m={};safeReadRowsV513_('DE_XUAT_THANH_LY').forEach(function(p){if(String(p.ID_DE_XUAT||'')===String(exceptId||''))return;const t=normalizeTextV543_(p.TRANG_THAI);if(/HUY|TU CHOI|HOAN THANH/.test(t))return;disposalItemsV5486_(p).forEach(function(x){m[String(x.id)]=String(p.MA_PHIEU||p.ID_DE_XUAT);});});
  return m;
}
function activeMaintDevicesV5486_(exceptId){
  const m={};safeReadRowsV513_('BAO_TRI_THIET_BI').forEach(function(p){if(String(p.ID_BAO_TRI||'')===String(exceptId||''))return;const t=normalizeTextV543_(p.TRANG_THAI);if(/HUY|TU CHOI|HOAN THANH/.test(t))return;const id=String(p.ID_THIET_BI||'').trim();if(id)m[id]=String(p.ID_BAO_TRI);});
  return m;
}
function uniqueProposalCodeV5486_(sheetKey,prefix){const used={};safeReadRowsV513_(sheetKey).forEach(function(r){used[String(r.MA_PHIEU||'')]=1;});const base=nextDocumentNo_(prefix);let no=base,k=2;while(used[no])no=base+'-'+(k++);return no;}
function assertModuleAnyV5486_(user,module,acts){for(let i=0;i<acts.length;i++){try{authAssertPermissionV5471_(user,module,acts[i]);return;}catch(e){if(i===acts.length-1)throw e;}}}

/** Danh sách máy chọn được cho đề xuất Thanh lý (kind='dispose') / Sửa chữa (kind='maintenance'). */
function listProposalDevicesV5486_(kind){
  const busy=kind==='maintenance'?activeMaintDevicesV5486_():activeDisposalDevicesV5486_(),emps=safeReadRowsV513_('NHAN_SU');
  const rows=safeReadRowsV513_('THIET_BI').filter(function(d){return !deviceGoneV5486_(d);}).map(function(d){
    const e=emps.find(function(x){return String(x.ID_NHAN_SU||'')===String(d.ID_NHAN_SU_SU_DUNG||'');})||{};let block=busy[String(d.ID_THIET_BI)]?'Đang nằm trong đề xuất '+busy[String(d.ID_THIET_BI)]:'';
    if(!block&&kind==='maintenance'&&/BAO TRI/.test(normalizeTextV543_(d.TRANG_THAI)))block='Đang bảo trì';
    if(!block&&kind==='dispose'&&/CHO THANH LY/.test(normalizeTextV543_(d.TRANG_THAI)))block='Đang chờ thanh lý';
    return {ID_THIET_BI:d.ID_THIET_BI,MA_THIET_BI:d.MA_THIET_BI,TEN_THIET_BI:d.TEN_THIET_BI,CHI_TIET_THIET_BI:d.CHI_TIET_THIET_BI,HANG_SAN_XUAT:d.HANG_SAN_XUAT,ID_DANH_MUC:d.ID_DANH_MUC,TRANG_THAI:d.TRANG_THAI,TINH_TRANG:d.TINH_TRANG,ID_PHONG_BAN:d.ID_PHONG_BAN,ID_NHAN_SU_SU_DUNG:d.ID_NHAN_SU_SU_DUNG,HO_TEN:e.HO_TEN||'',SO_LUONG:d.SO_LUONG||'',BLOCK:block};});
  return {ok:true,kind:kind,devices:rows,employees:emps.map(function(e){return {ID_NHAN_SU:e.ID_NHAN_SU,HO_TEN:e.HO_TEN,MA_NHAN_VIEN:e.MA_NHAN_VIEN,TRANG_THAI:e.TRANG_THAI,ID_PHONG_BAN:e.ID_PHONG_BAN};}),departments:safeReadRowsV513_('DANH_MUC_PHONG_BAN').map(function(d){return {ID_PHONG_BAN:d.ID_PHONG_BAN,TEN_PHONG_BAN:d.TEN_PHONG_BAN};})};
}
function listProposalDevicesV5486(kind){
  const user=authRequireUserV5470_(authTokenFromArgsV5470_(arguments));kind=String(kind||'')==='maintenance'?'maintenance':'dispose';
  assertModuleAnyV5486_(user,kind==='maintenance'?'DE_XUAT_SUA_CHUA':'DE_XUAT_THANH_LY',['THEM','SUA','XEM']);
  return listProposalDevicesV5486_(kind);
}

/** Lưu đề xuất thanh lý nhiều máy. p: {ID_DE_XUAT?, items:[{id,gtcl,gia}], HINH_THUC_THANH_LY, LY_DO_DE_XUAT, ID_NHAN_SU_DE_XUAT, GHI_CHU} */
function saveDisposalProposalV5486_(p){
  p=Object.assign({},p||{});ensureColsV5485_(SHEET.DE_XUAT_THANH_LY,DISPOSAL_COLS_V5486_);
  const pid=String(p.ID_DE_XUAT||'').trim(),rows=safeReadRowsV513_('DE_XUAT_THANH_LY'),cur=pid?rows.find(function(r){return String(r.ID_DE_XUAT||'')===pid;}):null;
  if(pid&&!cur)throw new Error('Không tìm thấy đề xuất: '+pid);
  if(cur&&!pendingGenericV5486_(cur))throw new Error('Đề xuất đã duyệt / xử lý, không sửa được.');
  const reason=String(p.LY_DO_DE_XUAT||'').trim();if(!reason)throw new Error('Vui lòng nhập lý do thanh lý.');
  const seen={},items=(Array.isArray(p.items)?p.items:[]).filter(function(x){const id=String(x&&x.id||'').trim();if(!id||seen[id])return false;seen[id]=1;return true;});
  if(!items.length)throw new Error('Chưa chọn thiết bị cần thanh lý.');if(items.length>100)throw new Error('Mỗi đề xuất tối đa 100 thiết bị.');
  const devices=safeReadRowsV513_('THIET_BI'),busy=activeDisposalDevicesV5486_(pid),out=[];
  items.forEach(function(x){const id=String(x.id).trim(),d=devices.find(function(r){return String(r.ID_THIET_BI||'')===id;});
    if(!d)throw new Error('Không tìm thấy thiết bị: '+id);
    if(deviceGoneV5486_(d))throw new Error('Thiết bị '+String(d.MA_THIET_BI||id)+' đã thanh lý / hủy cấp.');
    if(busy[id])throw new Error('Thiết bị '+String(d.MA_THIET_BI||id)+' đang nằm trong đề xuất thanh lý '+busy[id]+'.');
    out.push({id:id,code:String(d.MA_THIET_BI||''),name:String(d.TEN_THIET_BI||''),gtcl:Math.max(0,toNumber_(x.gtcl)),gia:Math.max(0,toNumber_(x.gia))});});
  const first=devices.find(function(r){return String(r.ID_THIET_BI||'')===out[0].id;})||{};
  const row={ID_DE_XUAT:pid||undefined,MA_PHIEU:cur?cur.MA_PHIEU:uniqueProposalCodeV5486_('DE_XUAT_THANH_LY','DXTL'),NGAY_DE_XUAT:cur?cur.NGAY_DE_XUAT:Utilities.formatDate(new Date(),APP_CONFIG.TIMEZONE,APP_CONFIG.DATE_FORMAT),
    ID_THIET_BI:out[0].id,ID_DANH_MUC:String(first.ID_DANH_MUC||''),MA_HANG:out.length>1?out.map(function(x){return x.code;}).join(', '):out[0].code,TEN_HANG:out.length>1?out.length+' thiết bị':out[0].name,LOAI_QUAN_LY:String(first.LOAI_THIET_BI||''),DON_VI_TINH:'Cái',
    SO_LUONG:out.length,DS_THIET_BI:JSON.stringify(out),GIA_TRI_CON_LAI:out.reduce(function(s,x){return s+x.gtcl;},0),GIA_DE_XUAT_THANH_LY:out.reduce(function(s,x){return s+x.gia;},0),
    HINH_THUC_THANH_LY:String(p.HINH_THUC_THANH_LY||'').trim(),LY_DO_DE_XUAT:reason,ID_NHAN_SU_DE_XUAT:String(p.ID_NHAN_SU_DE_XUAT||(cur&&cur.ID_NHAN_SU_DE_XUAT)||''),GHI_CHU:String(p.GHI_CHU||''),TRANG_THAI:cur?cur.TRANG_THAI||'Chờ duyệt':'Chờ duyệt'};
  if(!pid)delete row.ID_DE_XUAT;
  const res=saveRecordV53_('DE_XUAT_THANH_LY',row);
  return {ok:true,id:res.id,code:row.MA_PHIEU,count:out.length,row:res.row};
}
function saveDisposalProposalV5486(p){
  const user=authRequireUserV5470_(authTokenFromArgsV5470_(arguments));
  authAssertPermissionV5471_(user,'DE_XUAT_THANH_LY',String((p||{}).ID_DE_XUAT||'').trim()?'SUA':'THEM');
  return withScriptLockV5471_(function(){return saveDisposalProposalV5486_(Object.assign({},p||{},{ID_NHAN_SU_DE_XUAT:(p&&p.ID_NHAN_SU_DE_XUAT)||user.employeeId||''}));});
}

/** Chuẩn hóa khi lưu đề xuất sửa chữa (gọi trong saveProposalV5463_ nhánh maintenance). */
function prepareMaintenanceSaveV5486_(p){
  ensureColsV5485_(SHEET.BAO_TRI_THIET_BI,MAINT_COLS_V5486_);
  const pid=String(p.ID_BAO_TRI||'').trim();
  if(pid){const cur=safeReadRowsV513_('BAO_TRI_THIET_BI').find(function(r){return String(r.ID_BAO_TRI||'')===pid;});if(cur&&!pendingGenericV5486_(cur))throw new Error('Đề xuất đã duyệt / xử lý, không sửa được.');if(cur)p.TRANG_THAI=cur.TRANG_THAI||'Chờ xử lý';}
  else p.TRANG_THAI='Chờ xử lý';
  ['TRANG_THAI_MAY_TRUOC','NGAY_DUYET','ID_TAI_KHOAN_DUYET','GHI_CHU_DUYET','KET_QUA','CHI_PHI_THUC_TE','NGAY_HOAN_TAT'].forEach(function(k){delete p[k];});
  const id=String(p.ID_THIET_BI||'').trim();
  if(id){const d=safeReadRowsV513_('THIET_BI').find(function(r){return String(r.ID_THIET_BI||'')===id;});
    if(!d)throw new Error('Không tìm thấy thiết bị: '+id);if(deviceGoneV5486_(d))throw new Error('Thiết bị đã thanh lý / hủy cấp.');
    const busy=activeMaintDevicesV5486_(pid);if(busy[id])throw new Error('Thiết bị '+String(d.MA_THIET_BI||id)+' đang có đề xuất sửa chữa khác chưa xong.');
    p.MA_THIET_BI=String(d.MA_THIET_BI||'');p.TEN_THIET_BI=String(d.TEN_THIET_BI||'');p.ID_NHAN_SU_SU_DUNG=String(d.ID_NHAN_SU_SU_DUNG||'');p.ID_PHONG_BAN=String(d.ID_PHONG_BAN||'');}
  if(p.__V5486&&!id)throw new Error('Vui lòng chọn thiết bị cần sửa chữa / bảo trì.');
  if(p.__V5486&&!String(p.MO_TA_SU_CO||'').trim())throw new Error('Vui lòng nhập mô tả sự cố / nội dung bảo trì.');
  delete p.__V5486;
}

/** Tìm đề xuất ở 3 sheet. */
function proposalLocateV5486_(id){
  id=String(id||'').trim();if(!id)return null;
  const T=[['DE_XUAT_MUA_THIET_BI','ID_DE_XUAT'],['DE_XUAT_THANH_LY','ID_DE_XUAT'],['BAO_TRI_THIET_BI','ID_BAO_TRI']];
  for(let i=0;i<T.length;i++){const r=safeReadRowsV513_(T[i][0]).find(function(x){return String(x[T[i][1]]||'')===id||String(x.ID_DE_XUAT||'')===id||String(x.MA_PHIEU||'')===id;});if(r)return {table:T[i][0],pk:T[i][1],row:r,id:String(r[T[i][1]]||id)};}
  return null;
}

/** Duyệt thanh lý: máy → Chờ thanh lý, tự thu hồi người dùng. */
function approveDisposalsV5486_(ids,user,note){
  ensureColsV5485_(SHEET.DE_XUAT_THANH_LY,DISPOSAL_COLS_V5486_);user=user||{};
  const props=safeReadRowsV513_('DE_XUAT_THANH_LY'),devices=safeReadRowsV513_('THIET_BI'),now=nowText_(),results=[],devUpd={},propUpd={},hist=[],logs=[],touched=[];
  (ids||[]).forEach(function(id){
    const p=props.find(function(r){return String(r.ID_DE_XUAT||'')===String(id)||String(r.MA_PHIEU||'')===String(id);});if(!p){results.push({id:id,ok:false,reason:'Không tìm thấy'});return;}
    const code=String(p.MA_PHIEU||p.ID_DE_XUAT);
    if(!pendingGenericV5486_(p)){results.push({id:code,ok:false,reason:'Đề xuất đang ở trạng thái "'+String(p.TRANG_THAI||'')+'"'});return;}
    if(!user.isAdmin&&user.employeeId&&String(p.ID_NHAN_SU_DE_XUAT||'')===String(user.employeeId)){results.push({id:code,ok:false,reason:'Không tự duyệt đề xuất của mình'});return;}
    const items=disposalItemsV5486_(p);if(!items.length){results.push({id:code,ok:false,reason:'Đề xuất chưa chọn thiết bị'});return;}
    const prev={},bad=[],rec=[];
    items.forEach(function(x){const d=devices.find(function(r){return String(r.ID_THIET_BI||'')===String(x.id);});if(!d||deviceGoneV5486_(d)||devUpd[String(x.id)]){bad.push(d?String(d.MA_THIET_BI||x.id):String(x.id));return;}
      prev[String(x.id)]={TRANG_THAI:String(d.TRANG_THAI||''),ID_NHAN_SU_SU_DUNG:String(d.ID_NHAN_SU_SU_DUNG||''),ID_PHONG_BAN:String(d.ID_PHONG_BAN||''),KIEU_SU_DUNG:String(d.KIEU_SU_DUNG||'')};});
    if(bad.length){results.push({id:code,ok:false,reason:'Thiết bị không còn thanh lý được: '+bad.join(', ')});return;}
    items.forEach(function(x){const id2=String(x.id),d=devices.find(function(r){return String(r.ID_THIET_BI||'')===id2;});
      devUpd[id2]={TRANG_THAI:'Chờ thanh lý',ID_NHAN_SU_SU_DUNG:''};touched.push(id2);
      if(String(d.ID_NHAN_SU_SU_DUNG||'').trim()){rec.push(String(d.MA_THIET_BI||id2));hist.push(transferHistoryRowV5484_({ID_THIET_BI:id2,MA_THIET_BI:String(d.MA_THIET_BI||''),ID_NHAN_SU_CU:String(d.ID_NHAN_SU_SU_DUNG||''),ID_NHAN_SU_MOI:'',ID_PHONG_BAN_CU:String(d.ID_PHONG_BAN||''),ID_PHONG_BAN_MOI:String(d.ID_PHONG_BAN||''),ID_CO_SO_CU:String(d.ID_CO_SO||''),ID_CO_SO_MOI:String(d.ID_CO_SO||''),ID_TANG_CU:String(d.ID_TANG||''),ID_TANG_MOI:String(d.ID_TANG||''),VI_TRI_CU:String(d.VI_TRI||''),VI_TRI_MOI:String(d.VI_TRI||''),LY_DO:'Thu hồi để thanh lý theo đề xuất '+code,ID_TAI_KHOAN_THUC_HIEN:String(user.id||''),EMAIL_THUC_HIEN:String(user.email||'')}));}});
    propUpd[String(p.ID_DE_XUAT)]={TRANG_THAI:'Đã duyệt',NGAY_DUYET:now,ID_TAI_KHOAN_DUYET:String(user.id||user.email||''),TRANG_THAI_MAY_TRUOC:JSON.stringify(prev),GHI_CHU_DUYET:String(note||'')};
    logs.push(['APPROVE',SHEET.DE_XUAT_THANH_LY,String(p.ID_DE_XUAT),'Duyệt thanh lý '+code+' · '+items.length+' máy → Chờ thanh lý'+(rec.length?' · thu hồi '+rec.join(', '):'')+' · '+String(user.email||'')]);
    results.push({id:code,ok:true,kind:'dispose',status:'Đã duyệt',devices:items.length,recovered:rec});
  });
  batchUpdateRowsV5484_('THIET_BI',devUpd);batchUpdateRowsV5484_('DE_XUAT_THANH_LY',propUpd);if(hist.length){try{batchAppendRowsV5484_(SHEET.LICH_SU_CHUYEN_THIET_BI,hist);}catch(e){}}writeSystemLogsV5484_(logs);
  return {results:results,touched:touched};
}
/** Xem trước hộp Duyệt thanh lý: máy nào đang có người dùng sẽ bị thu hồi. */
function getDisposalPreviewV5486_(ids){
  const props=safeReadRowsV513_('DE_XUAT_THANH_LY'),devices=safeReadRowsV513_('THIET_BI'),emps=safeReadRowsV513_('NHAN_SU');
  return {ok:true,items:(ids||[]).map(function(id){const p=props.find(function(r){return String(r.ID_DE_XUAT||'')===String(id)||String(r.MA_PHIEU||'')===String(id);});if(!p)return {id:id,missing:true};
    return {id:String(p.ID_DE_XUAT),code:String(p.MA_PHIEU||''),devices:disposalItemsV5486_(p).map(function(x){const d=devices.find(function(r){return String(r.ID_THIET_BI||'')===String(x.id);})||{},e=emps.find(function(r){return String(r.ID_NHAN_SU||'')===String(d.ID_NHAN_SU_SU_DUNG||'');})||{};
      return {id:x.id,code:d.MA_THIET_BI||x.code||x.id,name:d.TEN_THIET_BI||x.name||'',status:d.TRANG_THAI||'(không còn)',user:e.HO_TEN||'',gone:!d.ID_THIET_BI||deviceGoneV5486_(d),gtcl:x.gtcl,gia:x.gia};})};})};
}
function getDisposalPreviewV5486(){return authCallPermV5471_('DE_XUAT_QUAN_LY','XEM',getDisposalPreviewV5486_,arguments);}

/** Lập phiếu thanh lý từ đề xuất đã duyệt. p: {prices:{id:gia}, NGAY_THANH_LY, GHI_CHU} */
function createDisposalSlipV5486_(id,p,user){
  p=p||{};user=user||{};ensureColsV5485_(SHEET.DE_XUAT_THANH_LY,DISPOSAL_COLS_V5486_);ensureColsV5485_(SHEET.THANH_LY_THIET_BI,SLIP_COLS_V5486_);
  const prop=safeReadRowsV513_('DE_XUAT_THANH_LY').find(function(r){return String(r.ID_DE_XUAT||'')===String(id)||String(r.MA_PHIEU||'')===String(id);});
  if(!prop)throw new Error('Không tìm thấy đề xuất: '+id);
  if(!/DA DUYET/.test(normalizeTextV543_(prop.TRANG_THAI)))throw new Error('Chỉ lập phiếu cho đề xuất thanh lý đã duyệt (hiện: "'+String(prop.TRANG_THAI||'')+'").');
  const code=String(prop.MA_PHIEU||prop.ID_DE_XUAT),items=disposalItemsV5486_(prop),devices=safeReadRowsV513_('THIET_BI'),now=nowText_(),date=String(p.NGAY_THANH_LY||'').trim()||Utilities.formatDate(new Date(),APP_CONFIG.TIMEZONE,APP_CONFIG.DATE_FORMAT),prices=p.prices||{};
  const bad=items.filter(function(x){const d=devices.find(function(r){return String(r.ID_THIET_BI||'')===String(x.id);});return !d||!/CHO THANH LY/.test(normalizeTextV543_(d.TRANG_THAI));}).map(function(x){return x.code||x.id;});
  if(bad.length)throw new Error('Thiết bị không còn ở trạng thái Chờ thanh lý: '+bad.join(', '));
  const slips=[],devUpd={},ids=[];
  items.forEach(function(x){const gia=Math.max(0,toNumber_(prices[x.id]!=null&&prices[x.id]!==''?prices[x.id]:x.gia)),sid=generateId_('THANH_LY_THIET_BI');ids.push(sid);
    slips.push({ID_THANH_LY:sid,NGAY_THANH_LY:date,ID_THIET_BI:String(x.id),SO_LUONG_THANH_LY:1,GIA_THANH_LY:gia,THANH_TIEN_THANH_LY:gia,DON_VI_TINH:'Cái',TRANG_THAI:'Hoàn thành',ID_DE_XUAT:String(prop.ID_DE_XUAT),HINH_THUC_THANH_LY:String(prop.HINH_THUC_THANH_LY||''),GHI_CHU:appendNoteV5485_(p.GHI_CHU,'Theo đề xuất '+code),NGAY_TAO:now,NGAY_CAP_NHAT:now});
    devUpd[String(x.id)]={TRANG_THAI:'Đã thanh lý'};});
  batchAppendRowsV5484_(SHEET.THANH_LY_THIET_BI,slips);batchUpdateRowsV5484_('THIET_BI',devUpd);
  const pu={};pu[String(prop.ID_DE_XUAT)]={TRANG_THAI:'Hoàn thành',SO_PHIEU_THANH_LY:ids.join(', '),NGAY_HOAN_THANH:now};batchUpdateRowsV5484_('DE_XUAT_THANH_LY',pu);
  writeSystemLogsV5484_([['DISPOSE',SHEET.THANH_LY_THIET_BI,ids.join(','),'Lập phiếu thanh lý theo '+code+' · '+items.length+' máy · '+String(user.email||'')]]);
  return {ok:true,code:code,slips:ids,devices:items.length,rows:slips,devicePatch:devicePatchV5484_(Object.keys(devUpd))};
}
function createDisposalSlipV5486(id,p){
  const user=authRequireUserV5470_(authTokenFromArgsV5470_(arguments));
  authAssertPermissionV5471_(user,'THU_HOI_THANH_LY','THEM');
  return withScriptLockV5471_(function(){return createDisposalSlipV5486_(id,p,user);});
}

/** Duyệt sửa chữa: máy → Bảo trì, đề xuất → Đang sửa. */
function approveMaintenanceV5486_(ids,user,note){
  ensureColsV5485_(SHEET.BAO_TRI_THIET_BI,MAINT_COLS_V5486_);user=user||{};
  const props=safeReadRowsV513_('BAO_TRI_THIET_BI'),devices=safeReadRowsV513_('THIET_BI'),now=nowText_(),results=[],devUpd={},propUpd={},logs=[],touched=[];
  (ids||[]).forEach(function(id){
    const p=props.find(function(r){return String(r.ID_BAO_TRI||'')===String(id)||String(r.MA_PHIEU||'')===String(id);});if(!p){results.push({id:id,ok:false,reason:'Không tìm thấy'});return;}
    const pid=String(p.ID_BAO_TRI);
    if(!pendingGenericV5486_(p)){results.push({id:pid,ok:false,reason:'Đề xuất đang ở trạng thái "'+String(p.TRANG_THAI||'')+'"'});return;}
    if(!user.isAdmin&&user.employeeId&&String(p.ID_NHAN_SU_DE_XUAT||'')===String(user.employeeId)){results.push({id:pid,ok:false,reason:'Không tự duyệt đề xuất của mình'});return;}
    const did=String(p.ID_THIET_BI||'').trim(),d=did?devices.find(function(r){return String(r.ID_THIET_BI||'')===did;}):null;
    if(did&&(!d||deviceGoneV5486_(d))){results.push({id:pid,ok:false,reason:'Thiết bị không còn (đã thanh lý / hủy cấp)'});return;}
    if(d&&devUpd[did]){results.push({id:pid,ok:false,reason:'Thiết bị đã có trong đề xuất khác vừa duyệt'});return;}
    const upd={TRANG_THAI:'Đang sửa',NGAY_DUYET:now,ID_TAI_KHOAN_DUYET:String(user.id||user.email||''),GHI_CHU_DUYET:String(note||'')};
    if(d){upd.TRANG_THAI_MAY_TRUOC=String(d.TRANG_THAI||'');if(!/BAO TRI/.test(normalizeTextV543_(d.TRANG_THAI))){devUpd[did]={TRANG_THAI:'Bảo trì'};touched.push(did);}}
    propUpd[pid]=upd;logs.push(['APPROVE',SHEET.BAO_TRI_THIET_BI,pid,'Duyệt sửa chữa '+(d?String(d.MA_THIET_BI||did):'')+' → Đang sửa · '+String(user.email||'')]);
    results.push({id:pid,ok:true,kind:'maintenance',status:'Đang sửa'});
  });
  batchUpdateRowsV5484_('THIET_BI',devUpd);batchUpdateRowsV5484_('BAO_TRI_THIET_BI',propUpd);writeSystemLogsV5484_(logs);
  return {results:results,touched:touched};
}
/** Hoàn tất sửa chữa. p: {KET_QUA:'Đã sửa xong'|'Không sửa được', CHI_PHI_THUC_TE, NGAY_HOAN_TAT, GHI_CHU} */
function completeMaintenanceV5486_(id,p,user){
  p=p||{};user=user||{};ensureColsV5485_(SHEET.BAO_TRI_THIET_BI,MAINT_COLS_V5486_);
  const prop=safeReadRowsV513_('BAO_TRI_THIET_BI').find(function(r){return String(r.ID_BAO_TRI||'')===String(id);});
  if(!prop)throw new Error('Không tìm thấy đề xuất: '+id);
  if(!/DANG SUA/.test(normalizeTextV543_(prop.TRANG_THAI)))throw new Error('Chỉ hoàn tất đề xuất đang sửa (hiện: "'+String(prop.TRANG_THAI||'')+'").');
  const ok=!/KHONG/.test(normalizeTextV543_(p.KET_QUA)),now=nowText_(),did=String(prop.ID_THIET_BI||'').trim(),touched=[];
  if(did){const d=safeReadRowsV513_('THIET_BI').find(function(r){return String(r.ID_THIET_BI||'')===did;});
    if(d&&!deviceGoneV5486_(d)){const prev=String(prop.TRANG_THAI_MAY_TRUOC||'').trim(),u={};u[did]=ok?{TRANG_THAI:prev&&!/BAO TRI|HONG/.test(normalizeTextV543_(prev))?prev:'Đang sử dụng',TINH_TRANG:'Tốt'}:{TRANG_THAI:'Hỏng',TINH_TRANG:'Hư hỏng'};batchUpdateRowsV5484_('THIET_BI',u);touched.push(did);}}
  const pu={};pu[String(prop.ID_BAO_TRI)]={TRANG_THAI:'Hoàn thành',KET_QUA:ok?'Đã sửa xong':'Không sửa được',CHI_PHI_THUC_TE:Math.max(0,toNumber_(p.CHI_PHI_THUC_TE)),NGAY_HOAN_TAT:String(p.NGAY_HOAN_TAT||'').trim()||now,GHI_CHU:appendNoteV5485_(prop.GHI_CHU,String(p.GHI_CHU||'').trim()?'[Hoàn tất] '+String(p.GHI_CHU).trim():'')};
  if(!String(p.GHI_CHU||'').trim())delete pu[String(prop.ID_BAO_TRI)].GHI_CHU;
  batchUpdateRowsV5484_('BAO_TRI_THIET_BI',pu);
  writeSystemLogsV5484_([['MAINT_DONE',SHEET.BAO_TRI_THIET_BI,String(prop.ID_BAO_TRI),(ok?'Sửa xong ':'Không sửa được ')+String(prop.MA_THIET_BI||did)+' · chi phí '+Math.max(0,toNumber_(p.CHI_PHI_THUC_TE))+' · '+String(user.email||'')]]);
  return {ok:true,id:String(prop.ID_BAO_TRI),result:ok?'Đã sửa xong':'Không sửa được',deviceId:did,devicePatch:touched.length?devicePatchV5484_(touched):null};
}
function completeMaintenanceV5486(id,p){
  const user=authRequireUserV5470_(authTokenFromArgsV5470_(arguments));
  assertModuleAnyV5486_(user,'DE_XUAT_SUA_CHUA',['SUA','DUYET']);
  return withScriptLockV5471_(function(){return completeMaintenanceV5486_(id,p,user);});
}

/** Hủy duyệt chung cho mọi loại đề xuất. */
function cancelApprovalV5486_(id,reason,user){
  const loc=proposalLocateV5486_(id);if(!loc)throw new Error('Không tìm thấy đề xuất: '+id);
  if(loc.table==='DE_XUAT_MUA_THIET_BI')return cancelPurchaseApprovalV5485_(loc.id,reason,user);
  reason=String(reason||'').trim();if(reason.length<5)throw new Error('Vui lòng nhập lý do (ít nhất 5 ký tự).');
  user=user||{};const p=loc.row,now=nowText_(),devices=safeReadRowsV513_('THIET_BI'),devUpd={},touched=[],note='[Hủy duyệt '+now+'] '+reason+' · '+String(user.email||'');
  if(loc.table==='DE_XUAT_THANH_LY'){
    if(!/DA DUYET/.test(normalizeTextV543_(p.TRANG_THAI)))throw new Error(/HOAN THANH/.test(normalizeTextV543_(p.TRANG_THAI))?'Đã lập phiếu thanh lý — không hủy duyệt được.':'Đề xuất chưa được duyệt.');
    const prev=parseJsonV5486_(p.TRANG_THAI_MAY_TRUOC,{}),blocked=[];
    disposalItemsV5486_(p).forEach(function(x){const d=devices.find(function(r){return String(r.ID_THIET_BI||'')===String(x.id);});if(!d)return;
      if(!/CHO THANH LY/.test(normalizeTextV543_(d.TRANG_THAI))||String(d.ID_NHAN_SU_SU_DUNG||'').trim()){blocked.push(String(d.MA_THIET_BI||x.id));return;}
      const pv=prev[String(x.id)]||{};devUpd[String(x.id)]={TRANG_THAI:pv.TRANG_THAI||'Đang sử dụng',ID_NHAN_SU_SU_DUNG:pv.ID_NHAN_SU_SU_DUNG||'',ID_PHONG_BAN:pv.ID_PHONG_BAN||d.ID_PHONG_BAN||'',KIEU_SU_DUNG:pv.KIEU_SU_DUNG||d.KIEU_SU_DUNG||''};touched.push(String(x.id));});
    if(blocked.length)throw new Error('Không hủy được: thiết bị '+blocked.join(', ')+' đã bị thay đổi sau khi duyệt.');
    batchUpdateRowsV5484_('THIET_BI',devUpd);
    const pu={};pu[loc.id]={TRANG_THAI:'Chờ duyệt',NGAY_DUYET:'',ID_TAI_KHOAN_DUYET:'',TRANG_THAI_MAY_TRUOC:'',GHI_CHU_DUYET:appendNoteV5485_(p.GHI_CHU_DUYET,note)};batchUpdateRowsV5484_('DE_XUAT_THANH_LY',pu);
  } else {
    if(!/DANG SUA/.test(normalizeTextV543_(p.TRANG_THAI)))throw new Error(/HOAN THANH/.test(normalizeTextV543_(p.TRANG_THAI))?'Đã hoàn tất sửa — không hủy duyệt được.':'Đề xuất chưa được duyệt.');
    const did=String(p.ID_THIET_BI||'').trim(),d=did?devices.find(function(r){return String(r.ID_THIET_BI||'')===did;}):null;
    if(d&&/BAO TRI/.test(normalizeTextV543_(d.TRANG_THAI))){devUpd[did]={TRANG_THAI:String(p.TRANG_THAI_MAY_TRUOC||'').trim()||'Đang sử dụng'};touched.push(did);batchUpdateRowsV5484_('THIET_BI',devUpd);}
    const pu={};pu[loc.id]={TRANG_THAI:'Chờ xử lý',NGAY_DUYET:'',ID_TAI_KHOAN_DUYET:'',TRANG_THAI_MAY_TRUOC:'',GHI_CHU_DUYET:appendNoteV5485_(p.GHI_CHU_DUYET,note)};batchUpdateRowsV5484_('BAO_TRI_THIET_BI',pu);
  }
  writeSystemLogsV5484_([['UNAPPROVE',SHEET[loc.table]||loc.table,loc.id,'Hủy duyệt · '+touched.length+' thiết bị · '+reason+' · '+String(user.email||'')]]);
  return {ok:true,id:loc.id,code:String(p.MA_PHIEU||loc.id),devices:touched.length,devicePatch:touched.length?devicePatchV5484_(touched):null};
}
function cancelApprovalV5486(id,reason){
  const user=authRequireUserV5470_(authTokenFromArgsV5470_(arguments));
  authAssertPermissionV5471_(user,'DE_XUAT_QUAN_LY','DUYET');
  return withScriptLockV5471_(function(){return cancelApprovalV5486_(id,reason,user);});
}
/** Đề xuất thanh lý đã duyệt, chờ lập phiếu (trang Thu hồi · Thanh lý). */
function disposalProposalsReadyV5486_(){
  return safeReadRowsV513_('DE_XUAT_THANH_LY').filter(function(p){return /DA DUYET/.test(normalizeTextV543_(p.TRANG_THAI));}).map(function(p){return {ID_DE_XUAT:p.ID_DE_XUAT,MA_PHIEU:p.MA_PHIEU,NGAY_DUYET:p.NGAY_DUYET,HINH_THUC_THANH_LY:p.HINH_THUC_THANH_LY||'',LY_DO_DE_XUAT:p.LY_DO_DE_XUAT||'',items:disposalItemsV5486_(p)};});
}


/* V5.4.87: lightweight freshness checks and stock summaries. Never used to authorize writes. */
const READ_DEPS_V5487_={
 equipment:['THIET_BI','NHAN_SU','DANH_MUC_PHONG_BAN','DANH_MUC_CO_SO','DANH_MUC_TANG','DM_THIETBI','DM_KHO'],
 employees:['NHAN_SU','TAI_KHOAN','THIET_BI','DANH_MUC_PHONG_BAN'],
 departments:['DANH_MUC_PHONG_BAN','NHAN_SU','THIET_BI'],
 locations:['DANH_MUC_CO_SO','DANH_MUC_TANG','THIET_BI'],
 maintenanceItems:['DM_THIETBI','THIET_BI','KHO_NHAPXUATTON'],
 warehouses:['DM_KHO','THIET_BI','KHO_NHAPXUATTON'],
 users:['TAI_KHOAN','NHAN_SU','VAI_TRO'],roles:['VAI_TRO','TAI_KHOAN','PHAN_QUYEN'],permissions:['VAI_TRO','TAI_KHOAN','PHAN_QUYEN'],
 proposal:['DE_XUAT_MUA_THIET_BI','DE_XUAT_THANH_LY','BAO_TRI_THIET_BI','KHO_NHAPXUATTON','THIET_BI','DM_THIETBI','NHAN_SU'],
 materialWarehouse:['KHO_NHAPXUATTON','THIET_BI','DM_THIETBI','DM_KHO','DE_XUAT_MUA_THIET_BI'],
 recovery:['KHO_THUHOI','THANH_LY_THIET_BI','DE_XUAT_THANH_LY','THIET_BI','NHAN_SU'],handbook:['CAM_NANG']
};
function bumpReadVersionV5487_(sheet){
  try{CacheService.getScriptCache().put('V5487_REV_'+physicalSheetNameV5477_(sheet),Utilities.getUuid(),21600);}catch(e){}
}
function readVersionV5487_(page){
  // Include lookups used across all frames, so labels/filters cannot retain a stale category.
  const sheets=(READ_DEPS_V5487_[page]||[]).concat(['NHAN_SU','DANH_MUC_PHONG_BAN','DANH_MUC_CO_SO','DANH_MUC_TANG','DM_THIETBI','DM_KHO','VAI_TRO','PHAN_QUYEN']);
  const keys=Array.from(new Set(sheets.map(function(s){return 'V5487_REV_'+physicalSheetNameV5477_(s);}))).sort();
  const c=CacheService.getScriptCache(),values=c.getAll(keys),missing={};
  keys.forEach(function(k){if(!values[k]){values[k]=Utilities.getUuid();missing[k]=values[k];}});
  if(Object.keys(missing).length)c.putAll(missing,21600);
  return keys.map(function(k){return values[k];}).join('|');
}
function stockSummaryV5487_(){
  const key='V5487_STOCK_SUMMARY',hit=cacheGetLargeV5477_(key);if(hit)return hit;
  const ledger=warehouseLedgerRowsV5448_();
  const stock=buildWarehouseStockV5448_(ledger,safeReadRowsV513_('THIET_BI'),safeReadRowsV513_('DM_THIETBI')).filter(function(r){return Number(r.SO_LUONG_TON||0)>0;});
  const out={stock:stock,ledgerTotal:ledger.length};
  cachePutLargeV5477_(key,out,NXT_CACHE_TTL_V5477_);return out;
}
function pageExtrasV5487_(page,version){
  const out={ok:true,page:page,dataVersion:version,extrasPending:false};
  if(page==='proposal')out.stockByCat=stockByCategoryV5485_(safeReadRowsV513_('DE_XUAT_MUA_THIET_BI'),safeReadRowsV513_('DM_THIETBI'));
  else if(page==='warehouses')out.stock=stockSummaryV5487_().stock.map(function(r){return {ID_KHO:r.ID_KHO,SO_LUONG_TON:r.SO_LUONG_TON,GIA_TRI_TON:r.GIA_TRI_TON,TEN_HANG:r.TEN_HANG};});
  else if(page==='maintenanceItems')out.stock=stockSummaryV5487_().stock.map(function(r){return {ID_DANH_MUC:r.ID_DANH_MUC,SO_LUONG_TON:r.SO_LUONG_TON};});
  else throw new Error('Trang không có dữ liệu bổ sung: '+page);
  return out;
}

function warehouseTxnPatchV5487_(row,previousLedger){
  const key=String(row.ID_KHO||'')+'|'+String(row.ID_THIET_BI||'');
  const tx=Object.assign({},row,{SO_LUONG_VAO:toNumber_(row.SO_LUONG_NHAP),SO_LUONG_RA:toNumber_(row.SO_LUONG_XUAT),ID_CHUNG_TU:row.SO_PHIEU||''});
  const ledger=(previousLedger||[]).filter(function(r){return String(r.ID_KHO||WAREHOUSE_DEFAULT_V5447.ID_KHO)+'|'+String(r.ID_THIET_BI||'')===key;}).concat([tx]);
  return {rows:buildWarehouseStockV5448_(ledger,safeReadRowsV513_('THIET_BI'),safeReadRowsV513_('DM_THIETBI')),transaction:tx,dataVersion:readVersionV5487_('materialWarehouse'),lookupsVersion:lookupsVersionV5484_()};
}

