/**
 * PHI LONG MANAGEMENT - V22 BACKEND CORE
 * Database: PHI_LONG_MANAGEMENT_DATABASE_V27
 *
 * Nguyên tắc:
 * 1) ID bất biến và cấp qua SYS_ID_SEQUENCE + LockService.
 * 2) Frontend không tự tính dữ liệu nghiệp vụ quan trọng.
 * 3) Bảo trì: nhiều nhật ký, MAX(NGAY_THUC_HIEN) của ID_KHU_VUC + ID_HANG_MUC là mốc hiện tại.
 * 4) DM_LICH_BAO_TRI giữ một lịch đang hoạt động cho mỗi cặp khu vực + hạng mục.
 * 5) Cảnh báo / số ngày còn lại tính động, không ghi cố định vào Sheet.
 * 6) RBAC kiểm tra tại backend. Super Admin bypass.
 */

const V22 = Object.freeze({
  VERSION: '137.0-system-lock-20260924',
  SPREADSHEET_ID: '1X5r0kIWvSUXsQSf13-TDxYMROOeKGIHzICA6yj11oFQ',
  TZ: 'Asia/Ho_Chi_Minh',
  SUPER_ADMIN_ROLE: 'VR0004',
  SHEETS: {
    employees: 'DM_NHAN_VIEN',
    contractors: 'DM_NHA_THAU',
    suppliers: 'DM_NHA_CUNG_CAP',
    users: 'NGUOI_SU_DUNG',
    roles: 'VAI_TRO',
    permissions: 'PHAN_QUYEN',

    work: 'CONG_VIEC',
    daily: 'CVHN_2026',

    assets: 'THIET_BI',
    materials: 'VAT_TU',
    stockTxn: 'NHAP_XUAT_KHO',
    recoveries: 'THU_HOI',
    deviceTransfers: 'LICH_SU_CHUYEN_THIET_BI',

    maintenanceLogs: 'NHAT_KY_BAO_TRI',
    maintenancePlans: 'KE_HOACH_BAO_TRI',
    maintenanceChecks: 'KTDK',
    maintenanceItems: 'DM_HANG_MUC_BAO_TRI',
    maintenanceSchedules: 'DM_LICH_BAO_TRI',
    buildingAreas: 'DM_KHU_VUC_TOA_NHA',
    operationDetails: 'CHI_TIET_VAN_HANH',

    proposals: 'DE_XUAT',
    proposalBuyMaterial: 'DE_XUAT_MUA_VAT_TU',
    proposalBuy: 'DE_XUAT_MUA',
    proposalDispose: 'DE_XUAT_THANH_LY',
    proposalMaintenance: 'DE_XUAT_BAO_TRI',

    contracts: 'HOP_DONG',
    tenants: 'KHACH_THUE',
    floors: 'QUAN_LY_TANG',
    prospects: 'KHACH_HANG_TIEM_NANG',

    audit: 'DATA_AUDIT_ARCHIVE',
    sequences: 'SYS_ID_SEQUENCE',
    emailConfig: 'CAU_HINH_EMAIL_CANH_BAO',
    emailLog: 'NHAT_KY_EMAIL_CANH_BAO'
  }
});

const MODULES = Object.freeze({
  DASHBOARD: 'DASHBOARD',
  WORK: 'CONG_VIEC',
  DAILY: 'CVHN',
  MAINTENANCE: 'BAO_TRI',
  ASSET: 'THIET_BI',
  WAREHOUSE: 'KHO',
  ALLOCATION: 'CAP_PHAT',
  RECOVERY: 'THU_HOI',
  PROPOSAL: 'DE_XUAT',
  CONTRACT: 'HOP_DONG',
  TENANT: 'KHACH_THUE',
  FLOOR: 'QUAN_LY_TANG',
  PROSPECT: 'KHACH_HANG_TIEM_NANG',
  REPORT: 'BAO_CAO',
  CONTACT: 'DANH_MUC',
  USER: 'NGUOI_SU_DUNG',
  ROLE: 'VAI_TRO',
  PERMISSION: 'PHAN_QUYEN'
});

const CRUD_CONFIG = Object.freeze({
  work:        {sheet:'CONG_VIEC', id:'ID', prefix:'CV', module:MODULES.WORK},
  daily:       {sheet:'CVHN_2026', id:'ID', prefix:'HN', module:MODULES.DAILY},
  asset:       {sheet:'THIET_BI', id:'ID', prefix:'TB', module:MODULES.ASSET},
  material:    {sheet:'VAT_TU', id:'ID', prefix:'VT', module:MODULES.WAREHOUSE},
  proposal:    {sheet:'DE_XUAT', id:'ID', prefix:'DX', module:MODULES.PROPOSAL},
  proposalBuyMaterial:{sheet:'DE_XUAT_MUA_VAT_TU', id:'ID', prefix:'DXVT', module:MODULES.PROPOSAL},
  proposalBuy: {sheet:'DE_XUAT_MUA', id:'ID', prefix:'DXM', module:MODULES.PROPOSAL},
  proposalDispose:{sheet:'DE_XUAT_THANH_LY', id:'ID', prefix:'DXTL', module:MODULES.PROPOSAL},
  proposalMaintenance:{sheet:'DE_XUAT_BAO_TRI', id:'ID', prefix:'DXBT', module:MODULES.PROPOSAL},
  contract:    {sheet:'HOP_DONG', id:'ID', prefix:'HD', module:MODULES.CONTRACT},
  tenant:      {sheet:'KHACH_THUE', id:'ID', prefix:'KT', module:MODULES.TENANT},
  floor:       {sheet:'QUAN_LY_TANG', id:'ID', prefix:'TANG', module:MODULES.FLOOR},
  prospect:    {sheet:'KHACH_HANG_TIEM_NANG', id:'ID', prefix:'KHTN', module:MODULES.PROSPECT},
  contact:     {sheet:'DM_NHAN_VIEN', id:'ID', prefix:'NV', module:MODULES.CONTACT}
});

// Chạy thủ công đúng một lần trước khi triển khai Web App V84.
// Các thao tác đồng bộ nặng được tách khỏi luồng mở trang để không làm chậm bảng.
function setupV84(){
  beginFastRequestV20_({bypassCache:true});
  return {
    ok:true,
    version:V22.VERSION,
    catalogs:ensureCatalogsV70_(),
    inspectionRemoval:ensureInspectionRemovalV80_(),
    maintenanceSchema:ensureMaintenanceSchemaV76_(),
    dailySchema:ensureDailySchemaV80_(),
    proposalSchema:ensureProposalSchemaV81_(),
    assetSchema:ensureAssetWarehouseSchemaV83_(),
    assetRelations:syncAssetWarehouseRelationsV83_(),
    rentalSchema:ensureRentalSchemaV85_(),
    maintenanceDuplicateIds:repairDuplicateMaintenanceScheduleIdsV84_(),
    maintenanceSchedules:syncMissingMaintenanceSchedulesV75_(),
    emailAlerts:ensureEmailAlertSchemaV84_(true),
    faviconUrl:ensurePhilongFaviconUrlV63_(),
    completedAt:nowStamp_()
  };
}

// ===== WEB APP =====
const V62_FAVICON_DATA_URI = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAMAAACdt4HsAAAARVBMVEX+/f39+vr63t/0qq3ucHXrTFLoLDPnHCPlBQnwfID40tTqOkH78fHxi4/znaH2vsDNzMy9np+vr68uLi50dHROTk6SkpLbvw4fAAADCElEQVRYw61Xi3qrIAwm4RYRHYcq7/+oJ4HadtW2Vpdvs4LkTwi5odSaQB6ojXWemLyzncbbh4/EqyB0PTVepopCfRdgDwSviIMTBqMDRuGJGLQRQDfEHRBxYIl2xOd5HC1rJBDvxY+evAl1cJcF7T0Y/ji+UQIUshSD2+aSKTSsHb5CAKU92fBWggqWvN5eAaojGj5YiT8ORN32N0M+PO58exWo4MnAWg5YcrjHVdhSjux6oaE+7nM1ULEn8zxnyO3krwiOEeBxRpPfpf9tF55+nUV4Gn9G+KkWv01YPr8v+AVhIHsfjPfBfrI0LkKjp/A9QCAfb9qY7zbQ2Myyb/Qev2V/4DuowIMK4I5YQAACOajGOHAEjWwVbdpxQE07LRhB7UufYw0JR4dMWM1ITh59HYRx0FFpLWlZa86h4qlVLViUW+eKnoXrdgYgqdxWyDrV3f3s7Tno+i8rneeMqr0LyEUp8NkKQDBmAH4YzsWaf/AJQESJJRuAYEkVGoI3FUB8nNPXyPWAtJby9ByycoKLDZ0HAfADOcGtACibspohaTAUzApAtuyvIeFYjEPvlPsFECsAVoBuBRC9V82bBMAMGHm0AhgXDdYAbHpV7V63EK8qXQGctRyxZtlCR9at09YKwPfK9Q2ADQhcaF2oAF203r8AaHNYQ5OfiBGjiogy014j8Nw49JtbWIz4wlUefMY/F4NmRLedTTClmJLi55XwH/cbiidUzIn1vB3j4khPlC5TmnOaSy6plDmXMk1pUmmes7zkSbWMYJXZrAigpsQAubKUPDMHClfJuUwY8yXdXFlvJrQGIH95Yun5kqcyZRlN8hbnezAt4bzaQ4wlQy4otkDedklQSsxFpcK2aYsknNvjGLXofx35NZnczrONoDWLLemNtVc5nVSPpnV1TevnC8vZ0vYHxfVQeYd7ef+DBuNsi6Nqk/Vzpsk63+adbTQbwplWV+1vtuFVs72z3VdLu79FJy8cp6885y9dq2vf3U92Xvsqfbx4fjDz+avv2cv3Yq7d1///to4irhYbbM0AAAAASUVORK5CYII=';

const V63_FAVICON_URL_PROPERTY = 'PHILONG_BUILDING_FAVICON_URL';
const V63_FAVICON_FILE_PROPERTY = 'PHILONG_BUILDING_FAVICON_FILE_ID';
var V64_FAVICON_URL_MEMORY_ = '';

// HtmlOutput chỉ chấp nhận favicon từ URL HTTPS. Hàm này tạo đúng một file
// PNG công khai trong Drive của tài khoản triển khai và lưu URL để tái sử dụng.
function ensurePhilongFaviconUrlV63_() {
  if(V64_FAVICON_URL_MEMORY_)return V64_FAVICON_URL_MEMORY_;
  const properties=PropertiesService.getScriptProperties();
  let url=properties.getProperty(V63_FAVICON_URL_PROPERTY);
  if(url){V64_FAVICON_URL_MEMORY_=url;return url;}
  const lock=LockService.getScriptLock();lock.waitLock(20000);
  try{
    url=properties.getProperty(V63_FAVICON_URL_PROPERTY);
    if(url){V64_FAVICON_URL_MEMORY_=url;return url;}
    const payload=V62_FAVICON_DATA_URI.substring(V62_FAVICON_DATA_URI.indexOf(',')+1);
    let file=null;
    try{
      const blob=Utilities.newBlob(Utilities.base64Decode(payload),'image/png','PHILONG_BUILDING_FAVICON.png');
      file=DriveApp.createFile(blob);
      file.setDescription('Favicon công khai của PHILONG BUILDING Web App.');
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK,DriveApp.Permission.VIEW);
      url='https://drive.google.com/uc?export=download&id='+encodeURIComponent(file.getId());
      properties.setProperties({
        [V63_FAVICON_URL_PROPERTY]:url,
        [V63_FAVICON_FILE_PROPERTY]:file.getId()
      });
      V64_FAVICON_URL_MEMORY_=url;
      return url;
    }catch(error){
      if(file){try{file.setTrashed(true)}catch(ignore){}}
      throw error;
    }
  }finally{lock.releaseLock()}
}

// Chạy hàm này thủ công nếu file favicon trên Drive đã bị xóa hoặc đổi quyền.
function resetPhilongFaviconV63(){
  const properties=PropertiesService.getScriptProperties();
  properties.deleteProperty(V63_FAVICON_URL_PROPERTY);
  properties.deleteProperty(V63_FAVICON_FILE_PROPERTY);
  V64_FAVICON_URL_MEMORY_='';
  return ensurePhilongFaviconUrlV63_();
}

function doGet() {
  try {
    const output = HtmlService.createTemplateFromFile('index')
      .evaluate()
      .setTitle('PHILONG BUILDING')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
    try {
      const faviconUrl=PropertiesService.getScriptProperties().getProperty(V63_FAVICON_URL_PROPERTY);
      if(faviconUrl)output.setFaviconUrl(faviconUrl);
    } catch (faviconError) {
      console.warn('Chưa thể gắn favicon HTTPS đã thiết lập.',faviconError);
    }
    return output;
  } catch (e) {
    return HtmlService.createHtmlOutput(
      '<h3>PHILONG BUILDING</h3><p>Backend đã hoạt động. Chưa gắn index.html.</p>'
    );
  }
}

// V80: xóa hẳn sheet KTDK một lần theo yêu cầu loại bỏ phân hệ kiểm tra định kỳ.
function removeInspectionDataV80() {
  return removeInspectionDataV80_();
}

function ensureInspectionRemovalV80_(){
  const props=PropertiesService.getScriptProperties();
  if(props.getProperty('V80_INSPECTION_DATA_REMOVED_AT'))return {ok:true,removed:false};
  return removeInspectionDataV80_();
}

function removeInspectionDataV80_(){
  const props=PropertiesService.getScriptProperties();
  let removed=false,found=false;
  try {
    const ss=SpreadsheetApp.openById(V22.SPREADSHEET_ID);
    const sh=ss.getSheetByName(V22.SHEETS.maintenanceChecks);found=!!sh;
    if(sh){ss.deleteSheet(sh);removed=true;}
    invalidateSheetV20_(V22.SHEETS.maintenanceChecks,true);
  } catch(e) { if(String(e&&e.message||e).indexOf('SHEET_NOT_FOUND')<0)throw e; }
  props.setProperty('V80_INSPECTION_DATA_REMOVED_AT',nowStamp_());
  return {ok:true,sheetRemoved:removed,sheetFound:found,version:'V80-REMOVE-INSPECTION'};
}

// ===== RBAC =====
function requirePermission_(user, module, action) {
  if (user && user.isSuperAdmin) return true;

  const rows = readObjects_(V22.SHEETS.permissions);
  const activeRules = rows.filter(r => {
    if(String(r.ID_VAI_TRO || '') !== String(user.roleId || ''))return false;
    const configured=norm_(r.MODULE),requested=norm_(module);
    return configured===requested||(requested==='DANH_MUC'&&configured==='DANH_BA');
  });

  // PHAN_QUYEN hiện có thể chưa được cấu hình: fallback tránh khóa toàn bộ hệ thống.
  if (!activeRules.length) {
    if (fallbackPermission_(user.roleId, module, action)) return true;
    throw new Error('PERMISSION_DENIED:' + module + ':' + action);
  }

  const rule = activeRules[0];
  if (truthy_(rule[action])) return true;
  throw new Error('PERMISSION_DENIED:' + module + ':' + action);
}

function fallbackPermission_(roleId, module, action) {
  // Quản trị
  if (roleId === 'VR0001') return true;

  // Quản lý
  if (roleId === 'VR0002') {
    if (['XEM','THEM','SUA','IN_XUAT','DUYET'].indexOf(action) < 0) return false;
    return [MODULES.USER, MODULES.ROLE, MODULES.PERMISSION].indexOf(module) < 0;
  }

  // Nhân viên
  if (roleId === 'VR0003') {
    if (action === 'XEM') return true;
    if (action === 'THEM' || action === 'SUA') {
      return [MODULES.WORK, MODULES.DAILY, MODULES.MAINTENANCE, MODULES.ASSET, MODULES.WAREHOUSE, MODULES.PROPOSAL].indexOf(module) >= 0;
    }
  }
  return false;
}

// ===== MAINTENANCE =====
/**
 * Lưu nhật ký:
 * - Cho phép nhập kỳ cũ hoặc mới.
 * - Sau khi lưu, rebuild lịch của đúng cặp ID_KHU_VUC + ID_HANG_MUC.
 * - MAX(NGAY_THUC_HIEN) là mốc duy nhất.
 */
function maintenanceAreaLabel_(area, fallback) {
  area = area || {};
  const names = [area.TANG, area.KHU_VUC]
    .map(v => String(v || '').trim())
    .filter((v, i, list) => v && list.findIndex(x => norm_(x) === norm_(v)) === i);
  return names.join(' · ') || String(fallback || '').trim();
}

function saveMaintenanceLog_(user, input) {
  const areaId = String(input.ID_KHU_VUC || '').trim();
  const itemId = String(input.ID_HANG_MUC || '').trim();
  const performed = dateOnly_(input.NGAY_THUC_HIEN);

  if (!areaId) throw new Error('ID_KHU_VUC_REQUIRED');
  if (!itemId) throw new Error('ID_HANG_MUC_REQUIRED');
  if (!performed) throw new Error('NGAY_THUC_HIEN_INVALID');

  const area = findById_(V22.SHEETS.buildingAreas, 'ID', areaId);
  const item = findById_(V22.SHEETS.maintenanceItems, 'ID_HANG_MUC', itemId);
  const employeeId = String(input.ID_NGUOI_THUC_HIEN || user.employeeId || '').trim();
  const employee = employeeId ? findById_(V22.SHEETS.employees, 'ID', employeeId) : null;
  if (!area || !isActive_(area.TRANG_THAI)) throw new Error('KHU_VUC_NOT_FOUND_OR_INACTIVE');
  if (!item || !isActive_(item.TRANG_THAI)) throw new Error('HANG_MUC_NOT_FOUND_OR_INACTIVE');
  if (!employee || !isActive_(employee.TRANG_THAI)) throw new Error('Vui lòng chọn Nhân viên đang hoạt động.');
  const employeeName=String(employee.HO_TEN||employee.TEN_GOI_KHAC||employee.TEN_NHAN_VIEN||'').trim();
  const unitInput=String(input.DON_VI_THUC_HIEN||'').trim();
  const unitRows=readObjects_(V22.SHEETS.contractors);
  const unit=unitRows.find(function(x){
    return String(x.ID||'').trim()===unitInput || norm_(x.DON_VI||x.HO_TEN)===norm_(unitInput);
  });
  const unitName=unit?String(unit.DON_VI||unit.HO_TEN||unitInput).trim():unitInput;

  const requestedScheduleId=String(input.ID_LICH||'').trim();
  let linkedSchedule=requestedScheduleId?findById_(V22.SHEETS.maintenanceSchedules,'ID_LICH',requestedScheduleId):findMaintenanceScheduleByPair_(areaId,itemId);
  if(requestedScheduleId){
    if(!linkedSchedule)throw new Error('Lịch bảo trì liên quan không tồn tại.');
    if(String(linkedSchedule.ID_KHU_VUC||'')!==areaId||String(linkedSchedule.ID_HANG_MUC||'')!==itemId)throw new Error('Lịch bảo trì không khớp Khu vực và Hạng mục đã chọn.');
  }
  const scheduleId=requestedScheduleId||String((linkedSchedule&&linkedSchedule.ID_LICH)||'');
  const cycle=maintenanceCycleV77_((linkedSchedule&&linkedSchedule.CHU_KY_NGAY),item.CHU_KY_MAC_DINH);

  const record = {
    ID: input.ID || nextId_(V22.SHEETS.maintenanceLogs, 'NB'),
    KHU_VUC_SNAPSHOT: maintenanceAreaLabel_(area),
    TEN_CONG_TY_SNAPSHOT: area.TEN_CONG_TY || '',
    HANG_MUC_SNAPSHOT: item.TEN_HANG_MUC || '',
    NGAY_THUC_HIEN: performed,
    NGAY_KE_TIEP: cycle?addDays_(performed,cycle):'',
    ID_THIET_BI: input.ID_THIET_BI || '',
    ID_NGUOI_THUC_HIEN: employeeId,
    NGUOI_THUC_HIEN: employeeName,
    DON_VI_THUC_HIEN: unitName,
    NOI_DUNG_THUC_HIEN: input.NOI_DUNG_THUC_HIEN || '',
    KET_QUA: input.KET_QUA || '',
    GHI_CHU: input.GHI_CHU || '',
    ID_LICH: scheduleId,
    ID_KHU_VUC: areaId,
    ID_HANG_MUC: itemId
  };

  let oldRecord = null;
  if (input.ID) {
    oldRecord = findById_(V22.SHEETS.maintenanceLogs, 'ID', input.ID);
    if (!oldRecord) throw new Error('MAINTENANCE_LOG_NOT_FOUND');
    // ID không đổi.
    record.ID = oldRecord.ID;
  }

  upsertObject_(V22.SHEETS.maintenanceLogs, 'ID', record);

  // Rebuild cả cặp mới, và nếu sửa chuyển khu vực/hạng mục thì rebuild cặp cũ.
  if (oldRecord && oldRecord.ID_KHU_VUC && oldRecord.ID_HANG_MUC &&
      (oldRecord.ID_KHU_VUC !== areaId || oldRecord.ID_HANG_MUC !== itemId)) {
    rebuildMaintenancePair_(oldRecord.ID_KHU_VUC, oldRecord.ID_HANG_MUC, user);
  }
  const result = rebuildMaintenancePair_(areaId, itemId, user);
  const finalSchedule=(result&&result.schedule)||{};
  const finalLink=String(finalSchedule.ID_LICH||scheduleId||'');
  const finalCycle=maintenanceCycleV77_(finalSchedule.CHU_KY_NGAY,cycle);
  updateById_(V22.SHEETS.maintenanceLogs,'ID',record.ID,{
    ID_LICH:finalLink,
    NGAY_KE_TIEP:finalCycle?addDays_(performed,finalCycle):''
  });
  return ok_({record:findById_(V22.SHEETS.maintenanceLogs, 'ID', record.ID), maintenance:result});
}

function deleteMaintenanceLog_(user, input) {
  const id = String(input.ID || input.id || '').trim();
  if (!id) throw new Error('MISSING_ID');
  const old = findById_(V22.SHEETS.maintenanceLogs, 'ID', id);
  if (!old) throw new Error('MAINTENANCE_LOG_NOT_FOUND');

  archiveAndDeleteById_(V22.SHEETS.maintenanceLogs, 'ID', id, user, 'MAINTENANCE_LOG_DELETE');
  const result = rebuildMaintenancePair_(old.ID_KHU_VUC, old.ID_HANG_MUC, user);
  return ok_({deletedId:id, maintenance:result});
}

function saveMaintenanceSchedule_(user, input) {
  const areaId = String(input.ID_KHU_VUC || '').trim();
  const itemId = String(input.ID_HANG_MUC || '').trim();
  if (!areaId || !itemId) throw new Error('AREA_AND_ITEM_REQUIRED');

  const area = findById_(V22.SHEETS.buildingAreas, 'ID', areaId);
  const item = findById_(V22.SHEETS.maintenanceItems, 'ID_HANG_MUC', itemId);
  if (!area || !item) throw new Error('MASTER_DATA_NOT_FOUND');

  const existing = findMaintenanceScheduleByPair_(areaId, itemId);
  const schedule = Object.assign({}, existing || {}, {
    ID_LICH: (existing && existing.ID_LICH) || input.ID_LICH || nextId_(V22.SHEETS.maintenanceSchedules, 'LB'),
    ID_KHU_VUC: areaId,
    ID_HANG_MUC: itemId,
    CHU_KY_NGAY: maintenanceCycleV77_(input.CHU_KY_NGAY,(existing&&existing.CHU_KY_NGAY),item.CHU_KY_MAC_DINH)||'',
    CANH_BAO_TRUOC_NGAY: nonNegativeInt_(input.CANH_BAO_TRUOC_NGAY || (existing && existing.CANH_BAO_TRUOC_NGAY) || item.CANH_BAO_TRUOC_NGAY || 7),
    ID_NGUOI_PHU_TRACH: input.ID_NGUOI_PHU_TRACH || (existing && existing.ID_NGUOI_PHU_TRACH) || '',
    TRANG_THAI: input.TRANG_THAI || (existing && existing.TRANG_THAI) || 'Hoạt động',
    GHI_CHU: input.GHI_CHU !== undefined ? input.GHI_CHU : ((existing && existing.GHI_CHU) || '')
  });

  upsertObject_(V22.SHEETS.maintenanceSchedules, 'ID_LICH', schedule);
  return ok_({maintenance:rebuildMaintenancePair_(areaId, itemId, user)});
}

function rebuildMaintenancePair_(areaId, itemId, user) {
  if (!areaId || !itemId) return {status:'SKIP_NO_PAIR'};

  const area = findById_(V22.SHEETS.buildingAreas, 'ID', areaId);
  const item = findById_(V22.SHEETS.maintenanceItems, 'ID_HANG_MUC', itemId);
  if (!area || !item) throw new Error('MASTER_DATA_NOT_FOUND_FOR_PAIR');

  const logs = readObjects_(V22.SHEETS.maintenanceLogs)
    .filter(r => String(r.ID_KHU_VUC || '') === areaId && String(r.ID_HANG_MUC || '') === itemId)
    .filter(r => !!dateOnly_(r.NGAY_THUC_HIEN));

  logs.sort((a,b) => dateOnly_(a.NGAY_THUC_HIEN).localeCompare(dateOnly_(b.NGAY_THUC_HIEN)));
  const latest = logs.length ? logs[logs.length - 1] : null;

  let schedule = findMaintenanceScheduleByPair_(areaId, itemId);
  if (!schedule) {
    schedule = {
      ID_LICH: nextId_(V22.SHEETS.maintenanceSchedules, 'LB'),
      ID_KHU_VUC: areaId,
      ID_HANG_MUC: itemId,
      CHU_KY_NGAY: maintenanceCycleV77_(item.CHU_KY_MAC_DINH)||'',
      CANH_BAO_TRUOC_NGAY: nonNegativeInt_(item.CANH_BAO_TRUOC_NGAY || 7),
      ID_NGUOI_PHU_TRACH: '',
      GHI_CHU: 'Tạo tự động bởi V22 backend'
    };
  }

  const cycle = maintenanceCycleV77_(schedule.CHU_KY_NGAY,item.CHU_KY_MAC_DINH);
  schedule.CHU_KY_NGAY = cycle||'';
  schedule.CANH_BAO_TRUOC_NGAY = nonNegativeInt_(schedule.CANH_BAO_TRUOC_NGAY || item.CANH_BAO_TRUOC_NGAY || 7);

  if (latest) {
    const baseDate = dateOnly_(latest.NGAY_THUC_HIEN);
    schedule.NGAY_GOC_GAN_NHAT = baseDate;
    schedule.NGAY_KE_TIEP = cycle?addDays_(baseDate, cycle):'';
    schedule.ID_NHAT_KY_GAN_NHAT = latest.ID;
    schedule.TRANG_THAI = cycle?'Hoạt động':'Thiếu chu kỳ';
  } else {
    schedule.NGAY_GOC_GAN_NHAT = '';
    schedule.NGAY_KE_TIEP = '';
    schedule.ID_NHAT_KY_GAN_NHAT = '';
    schedule.TRANG_THAI = 'Chờ ngày gốc';
  }

  upsertObject_(V22.SHEETS.maintenanceSchedules, 'ID_LICH', schedule);

  return {
    schedule: computeScheduleFields_(schedule),
    currentPlan: null,
    latestLog: latest || null,
    historyCount: logs.length
  };
}

function findMaintenanceScheduleByPair_(areaId, itemId) {
  return readObjects_(V22.SHEETS.maintenanceSchedules).find(r =>
    String(r.ID_KHU_VUC || '') === String(areaId) &&
    String(r.ID_HANG_MUC || '') === String(itemId)
  ) || null;
}

// V75: DM_LICH_BAO_TRI đồng thời là nguồn dữ liệu của Kế hoạch bảo trì.
// Mỗi cặp khu vực + hạng mục phù hợp chỉ được tạo tối đa một lịch.
function maintenanceItemAppliesToAreaV75_(area,item){
  if(!area||!item||!isActive_(area.TRANG_THAI)||!isActive_(item.TRANG_THAI))return false;
  const areaType=norm_(area.LOAI_KHU_VUC),areaName=norm_(String(area.KHU_VUC||'')+' '+String(area.TANG||''));
  const applies=norm_(item.AP_DUNG_LOAI_KHU_VUC),itemName=norm_(item.TEN_HANG_MUC);
  if(['TAT_CA','ALL','MOI_KHU_VUC'].indexOf(applies)>=0)return true;
  if(areaType.indexOf('VAN_PHONG')>=0)return applies.indexOf('VAN_PHONG')>=0;
  if(areaName.indexOf('THANG_MAY')>=0)return itemName.indexOf('THANG_MAY')>=0;
  if(areaName.indexOf('THANG_CUON')>=0)return itemName.indexOf('THANG_CUON')>=0;
  if(areaName.indexOf('MAY_PHAT')>=0)return itemName.indexOf('MAY_PHAT')>=0;
  return !applies||applies===areaType||applies.indexOf(areaType)>=0||applies.indexOf('THIET_BI_CHUNG')>=0;
}

function syncMissingMaintenanceSchedulesV75_(){
  const lock=LockService.getScriptLock();
  lock.waitLock(30000);
  try{
    // Bỏ cache trong vùng khóa để hai lượt tải đồng thời không cùng thấy một cặp bị thiếu.
    invalidateSheetV20_(V22.SHEETS.maintenanceSchedules,false);
    invalidateSheetV20_(V22.SHEETS.buildingAreas,false);
    invalidateSheetV20_(V22.SHEETS.maintenanceItems,false);
    const areas=readObjects_(V22.SHEETS.buildingAreas).filter(r=>r.ID&&isActive_(r.TRANG_THAI));
    const items=readObjects_(V22.SHEETS.maintenanceItems).filter(r=>r.ID_HANG_MUC&&isActive_(r.TRANG_THAI));
    const existing=readObjects_(V22.SHEETS.maintenanceSchedules);
    const pairRows={},expected=[],expectedKeys={};
    existing.forEach(function(s){
      const key=String(s.ID_KHU_VUC||'')+'|'+String(s.ID_HANG_MUC||'');
      if(!pairRows[key])pairRows[key]=[];
      pairRows[key].push(s);
    });
    areas.forEach(function(area){
      items.forEach(function(item){
        if(!maintenanceItemAppliesToAreaV75_(area,item))return;
        const key=String(area.ID||'')+'|'+String(item.ID_HANG_MUC||'');
        if(expectedKeys[key])return;
        expectedKeys[key]=true;
        expected.push({key:key,area:area,item:item});
      });
    });
    const missing=expected.filter(x=>!pairRows[x.key]||!pairRows[x.key].length);
    const duplicatePairs=Object.keys(pairRows).filter(k=>pairRows[k].length>1).length;
    let refreshedWaiting=0;
    if(!missing.length){
      // Rà lại các lịch đang chờ ngày gốc. Trước đây đồng bộ thoát sớm khi
      // không có lịch mới nên trạng thái cũ không đổi sau khi nhật ký được thêm.
      Object.keys(pairRows).forEach(function(key){
        const row=pairRows[key][0];
        if(norm_(row.TRANG_THAI)!=='CHO_NGAY_GOC')return;
        const parts=key.split('|');
        const result=rebuildMaintenancePair_(parts[0],parts[1],null);
        if(result&&result.latestLog)refreshedWaiting++;
      });
      return {ok:true,expected:expected.length,existingPairs:Object.keys(pairRows).length,added:0,refreshedWaiting:refreshedWaiting,duplicatePairs:duplicatePairs};
    }

    const logsByPair={};
    invalidateSheetV20_(V22.SHEETS.maintenanceLogs,false);
    readObjects_(V22.SHEETS.maintenanceLogs).forEach(function(log){
      const performed=dateOnly_(log.NGAY_THUC_HIEN);if(!performed)return;
      const key=String(log.ID_KHU_VUC||'')+'|'+String(log.ID_HANG_MUC||'');
      const old=logsByPair[key];
      if(!old||performed>dateOnly_(old.NGAY_THUC_HIEN)||
         (performed===dateOnly_(old.NGAY_THUC_HIEN)&&String(log.ID||'')>String(old.ID||'')))logsByPair[key]=log;
    });
    const ids=reserveMaintenanceScheduleIdsV75_(missing.length,existing);
    const created=missing.map(function(x,i){
      const cycle=maintenanceCycleV77_(x.item.CHU_KY_MAC_DINH),latest=logsByPair[x.key]||null;
      const base=latest?dateOnly_(latest.NGAY_THUC_HIEN):'';
      return {
        ID_LICH:ids[i],ID_KHU_VUC:x.area.ID,ID_HANG_MUC:x.item.ID_HANG_MUC,
        CHU_KY_NGAY:cycle||'',CANH_BAO_TRUOC_NGAY:nonNegativeInt_(x.item.CANH_BAO_TRUOC_NGAY||7,7),
        NGAY_GOC_GAN_NHAT:base,NGAY_KE_TIEP:base&&cycle?addDays_(base,cycle):'',
        ID_NHAT_KY_GAN_NHAT:latest?latest.ID:'',ID_NGUOI_PHU_TRACH:'',
        TRANG_THAI:latest?(cycle?'Hoạt động':'Thiếu chu kỳ'):'Chờ ngày gốc',GHI_CHU:'Tự tạo khi đồng bộ Kế hoạch bảo trì V77'
      };
    });
    const sh=getSheet_(V22.SHEETS.maintenanceSchedules),headers=getHeaders_(V22.SHEETS.maintenanceSchedules);
    const start=Math.max(2,sh.getLastRow()+1),matrix=created.map(r=>headers.map(h=>r[h]!==undefined?r[h]:''));
    sh.getRange(start,1,matrix.length,headers.length).setValues(matrix);
    invalidateSheetV20_(V22.SHEETS.maintenanceSchedules,false);
    return {ok:true,expected:expected.length,existingPairs:Object.keys(pairRows).length,added:created.length,duplicatePairs:duplicatePairs};
  }finally{lock.releaseLock()}
}

// Cấp một dải ID trong cùng khóa đồng bộ, tránh gọi nextId_ lồng LockService.
function reserveMaintenanceScheduleIdsV75_(count,existing){
  if(count<=0)return[];
  const seq=getSheet_(V22.SHEETS.sequences),data=seq.getDataRange().getValues(),headers=(data[0]||[]).map(v=>String(v||'').trim());
  const ie=headers.indexOf('ENTITY'),ip=headers.indexOf('PREFIX'),il=headers.indexOf('LAST_NUMBER'),iu=headers.indexOf('UPDATED_AT');
  if([ie,ip,il,iu].some(i=>i<0))throw new Error('SYS_ID_SEQUENCE_SCHEMA_INVALID');
  if(!data||!Array.isArray(data)||data.length<1)throw new Error('INVALID_DATA_ARRAY');
  let rowIndex=-1,row,last=0;
  for(let i=1;i<data.length;i++){
    if(data[i]&&Array.isArray(data[i])&&String(data[i][ie])===String(V22.SHEETS.maintenanceSchedules)){
      rowIndex=i;break;
    }
  }
  if(rowIndex>=1){row=data[rowIndex].slice();last=Number(row[il]||0)}
  else{
    rowIndex=data.length;row=new Array(headers.length).fill('');row[ie]=V22.SHEETS.maintenanceSchedules;row[ip]='LB';
  }
  (existing||[]).forEach(function(r){const m=String(r.ID_LICH||'').match(/^LB(\d+)$/i);if(m)last=Math.max(last,Number(m[1]||0))});
  const ids=[];
  for(let n=1;n<=count;n++){const value=last+n,width=value<10000?4:String(value).length;ids.push('LB'+String(value).padStart(width,'0'))}
  row[il]=last+count;row[iu]=today_();seq.getRange(rowIndex+1,1,1,headers.length).setValues([row]);
  invalidateSheetV20_(V22.SHEETS.sequences,true);
  return ids;
}

function getMaintenanceSchedulesComputed_() {
  return readObjects_(V22.SHEETS.maintenanceSchedules).map(computeScheduleFields_);
}

// V84: sửa mã lịch bị trùng trước khi form liên kết dữ liệu.
// Mỗi ID_LICH phải duy nhất; khi đổi mã, nhật ký cùng cặp khu vực + hạng mục
// được nối sang mã mới để không làm mất quan hệ.
function repairDuplicateMaintenanceScheduleIdsV84_(){
  const rows=readObjectsWithRow_(V22.SHEETS.maintenanceSchedules),groups={};
  rows.forEach(function(x){const id=String(x.obj.ID_LICH||'').trim();if(id)(groups[id]||(groups[id]=[])).push(x);});
  const duplicateRows=[];Object.keys(groups).forEach(function(id){groups[id].slice(1).forEach(function(x){duplicateRows.push({oldId:id,row:x.row,obj:x.obj});});});
  if(!duplicateRows.length)return {ok:true,updated:0,logLinksUpdated:0};
  const ids=reserveMaintenanceScheduleIdsV75_(duplicateRows.length,rows),logs=readObjectsWithRow_(V22.SHEETS.maintenanceLogs);let links=0;

  // V84.16: gom patch theo dòng rồi ghi hàng loạt (getValues/setValues theo block)
  // thay vì gọi updateRowFields_ (1 getValues + 1 setValues) cho từng dòng riêng lẻ.
  const schedulePatchByRow={}, logPatchByRow={};
  duplicateRows.forEach(function(x,i){
    const newId=ids[i];
    schedulePatchByRow[x.row]=newId;
    logs.forEach(function(log){
      if(String(log.obj.ID_LICH||'')!==x.oldId)return;
      if(String(log.obj.ID_KHU_VUC||'')===String(x.obj.ID_KHU_VUC||'')&&String(log.obj.ID_HANG_MUC||'')===String(x.obj.ID_HANG_MUC||'')){
        logPatchByRow[log.row]=newId;
        links++;
      }
    });
  });

  batchPatchColumn_(V22.SHEETS.maintenanceSchedules,'ID_LICH',schedulePatchByRow);
  batchPatchColumn_(V22.SHEETS.maintenanceLogs,'ID_LICH',logPatchByRow);

  invalidateSheetV20_(V22.SHEETS.maintenanceSchedules,false);invalidateSheetV20_(V22.SHEETS.maintenanceLogs,false);
  return {ok:true,updated:duplicateRows.length,logLinksUpdated:links};
}

// V84.16: ghi hàng loạt 1 cột cho nhiều dòng bằng 1 getValues + 1 setValues theo block liên tiếp,
// thay vì lặp getRange().getValues()/setValues() cho từng dòng (nguồn gây lag chính khi có nhiều bản ghi).
function batchPatchColumn_(sheetName,fieldName,patchByRow){
  const rowNumbers=Object.keys(patchByRow).map(Number).filter(function(n){return n>0});
  if(!rowNumbers.length)return;
  const sh=getSheet_(sheetName),headers=getHeaders_(sheetName),colIndex=headers.indexOf(fieldName);
  if(colIndex<0)return;
  const lastRow=sh.getLastRow();
  const minRow=Math.max(2,Math.min.apply(null,rowNumbers)),maxRow=Math.min(lastRow,Math.max.apply(null,rowNumbers));
  if(maxRow<minRow)return;
  const range=sh.getRange(minRow,1,maxRow-minRow+1,headers.length);
  const values=range.getValues();
  rowNumbers.forEach(function(r){
    if(r<minRow||r>maxRow)return;
    values[r-minRow][colIndex]=patchByRow[r];
  });
  range.setValues(values);
}

function computeScheduleFields_(r) {
  const out = Object.assign({}, r);
  const due = dateOnly_(r.NGAY_KE_TIEP);
  // Lịch chưa có lần thực hiện đầu tiên là một trạng thái nghiệp vụ riêng,
  // không xem là một deadline rỗng thông thường.
  if (!due && norm_(r.TRANG_THAI) === 'CHO_NGAY_GOC') {
    out.SO_NGAY_CON_LAI = '';
    out.CANH_BAO = 'CHỜ NGÀY GỐC';
    out.NGAY_CANH_BAO = '';
    return out;
  }
  if (!due && !maintenanceCycleV77_(r.CHU_KY_NGAY)) {
    out.SO_NGAY_CON_LAI = '';
    out.CANH_BAO = 'THIẾU CHU KỲ';
    out.NGAY_CANH_BAO = '';
    return out;
  }
  const alert = alertForDate_(due, nonNegativeInt_(r.CANH_BAO_TRUOC_NGAY || 7, 7));
  out.SO_NGAY_CON_LAI = alert.days;
  out.CANH_BAO = alert.label;
  out.NGAY_CANH_BAO = due ? addDays_(due, -nonNegativeInt_(r.CANH_BAO_TRUOC_NGAY || 7, 7)) : '';
  return out;
}

// ===== ASSET / ALLOCATION / RECOVERY =====
function ensureAssetWarehouseSchemaV83_() {
  const props=PropertiesService.getScriptProperties();
  const schemaReadyKey='V841432_ASSET_WAREHOUSE_SCHEMA_READY_AT';
  if(props.getProperty(schemaReadyKey))return {ok:true,cached:true};
  const specs={
    THIET_BI:['ID','TEN_THIET_BI','LOAI_THIET_BI','HANG','MODEL','SERIAL','THONG_SO','DOI_TUONG_SU_DUNG','ID_KHU_VUC','PHONG_BAN','ID_NGUOI_SU_DUNG','ID_NGUOI_QUAN_LY','MUC_DICH_SU_DUNG','NGAY_BAN_GIAO','NGAY_DU_KIEN_THU_HOI','SO_BIEN_BAN','LINK_BIEN_BAN','NGAY_MUA','HAN_BAO_HANH','NGAY_NHAP_KHO','TINH_TRANG','TRANG_THAI','GHI_CHU'],
    THU_HOI:['ID','NGAY_THU_HOI','ID_THIET_BI','ID_NGUOI_TRA','ID_NGUOI_NHAN_THU_HOI','TINH_TRANG_KHI_TRA','TRANG_THAI_SAU_THU_HOI','ID_KHU_VUC_SAU_THU_HOI','HUONG_XU_LY','GHI_CHU'],
    VAT_TU:['ID','TEN_VAT_TU','NHOM','DVT','TON_DAU','TON_TOI_THIEU','TRANG_THAI','GHI_CHU'],
    NHAP_XUAT_KHO:['ID','NGAY','LOAI_GIAO_DICH','ID_VAT_TU','SO_LUONG','ID_NGUOI_THUC_HIEN','NOI_DUNG','GHI_CHU','NGUON_GIAO_DICH','ID_CHUNG_TU','ID_CHI_TIET_NGUON','ID_GIAO_DICH_GOC','LY_DO_DIEU_CHINH','NGUOI_SUA','NGAY_SUA']
  };
  const added={};
  Object.keys(specs).forEach(function(sheetName){
    const sh=getSheet_(sheetName),headers=getHeaders_(sheetName).slice(),missing=specs[sheetName].filter(function(h){return headers.indexOf(h)<0;});
    if(!missing.length)return;
    sh.getRange(1,headers.length+1,1,missing.length).setValues([missing]);
    invalidateSheetV20_(sheetName,false);added[sheetName]=missing;
  });
  props.setProperty(schemaReadyKey,nowStamp_());
  return {ok:true,cached:false,added:added};
}

// V96 — Nút "Chuyển" / "Lịch sử" của Thiết bị đang dùng: tạo sheet
// LICH_SU_CHUYEN_THIET_BI nếu chưa có, cấp phát header đúng chuẩn.
function ensureDeviceTransferSchemaV96_() {
  const sheetName = V22.SHEETS.deviceTransfers;
  const props = PropertiesService.getScriptProperties();
  const key = 'V96_DEVICE_TRANSFER_SCHEMA_READY_AT';
  if (props.getProperty(key)) return { ok: true, cached: true };
  const headers = ['ID','NGAY_CHUYEN','ID_THIET_BI','TEN_THIET_BI','TU_KHU_VUC','DEN_KHU_VUC','TU_NGUOI_DUNG','DEN_NGUOI_DUNG','ID_NGUOI_THUC_HIEN','LY_DO','GHI_CHU'];
  let sh = ss_().getSheetByName(sheetName);
  if (!sh) {
    sh = ss_().insertSheet(sheetName);
    sh.getRange(1, 1, 1, headers.length).setValues([headers]);
  } else {
    const existing = getHeaders_(sheetName).slice();
    const missing = headers.filter(function(h){ return existing.indexOf(h) < 0; });
    if (missing.length) sh.getRange(1, existing.length + 1, 1, missing.length).setValues([missing]);
  }
  invalidateSheetV20_(sheetName, false);
  props.setProperty(key, nowStamp_());
  return { ok: true, cached: false };
}

// Ghi 1 lượt chuyển thiết bị: cập nhật vị trí/người dùng hiện tại của THIET_BI,
// đồng thời chèn 1 dòng lịch sử vào LICH_SU_CHUYEN_THIET_BI (trước → sau).
function transferAsset_(user, input) {
  ensureDeviceTransferSchemaV96_();
  requirePermission_(user, MODULES.ASSET, 'SUA');
  const assetId = String(input.ID_THIET_BI || '').trim();
  const asset = findById_(V22.SHEETS.assets, 'ID', assetId);
  if (!asset) throw new Error('ASSET_NOT_FOUND');

  const denKhuVuc = String(input.DEN_KHU_VUC || '').trim();
  if (denKhuVuc && !findById_(V22.SHEETS.buildingAreas, 'ID', denKhuVuc)) throw new Error('KHU_VUC_KHONG_TON_TAI');
  const denNguoiDung = String(input.DEN_NGUOI_DUNG || '').trim();
  if (denNguoiDung && !findById_(V22.SHEETS.employees, 'ID', denNguoiDung)) throw new Error('NGUOI_DUNG_KHONG_TON_TAI');
  if (input.ID_NGUOI_THUC_HIEN && !findById_(V22.SHEETS.employees, 'ID', input.ID_NGUOI_THUC_HIEN)) throw new Error('NGUOI_THUC_HIEN_KHONG_TON_TAI');
  if (!denKhuVuc && !denNguoiDung) throw new Error('CAN_CHON_KHU_VUC_HOAC_NGUOI_DUNG_MOI');

  const record = {
    ID: nextId_(V22.SHEETS.deviceTransfers, 'CT'),
    NGAY_CHUYEN: dateOnly_(input.NGAY_CHUYEN) || today_(),
    ID_THIET_BI: assetId,
    TEN_THIET_BI: asset.TEN_THIET_BI || '',
    TU_KHU_VUC: asset.ID_KHU_VUC || '',
    DEN_KHU_VUC: denKhuVuc || asset.ID_KHU_VUC || '',
    TU_NGUOI_DUNG: asset.ID_NGUOI_SU_DUNG || '',
    DEN_NGUOI_DUNG: denNguoiDung || asset.ID_NGUOI_SU_DUNG || '',
    ID_NGUOI_THUC_HIEN: input.ID_NGUOI_THUC_HIEN || '',
    LY_DO: input.LY_DO || '',
    GHI_CHU: input.GHI_CHU || ''
  };
  upsertObject_(V22.SHEETS.deviceTransfers, 'ID', record);

  const patch = {};
  if (denKhuVuc) patch.ID_KHU_VUC = denKhuVuc;
  if (denNguoiDung) patch.ID_NGUOI_SU_DUNG = denNguoiDung;
  if (Object.keys(patch).length) updateById_(V22.SHEETS.assets, 'ID', assetId, patch);

  return record;
}

// Danh sách lịch sử chuyển của 1 thiết bị, mới nhất trước.
function getDeviceTransferHistory_(assetId) {
  ensureDeviceTransferSchemaV96_();
  const id = String(assetId || '').trim();
  const rows = readObjects_(V22.SHEETS.deviceTransfers);
  const filtered = id ? rows.filter(function(r){ return String(r.ID_THIET_BI || '') === id; }) : rows;
  return filtered.sort(function(a, b){ return String(b.NGAY_CHUYEN || '').localeCompare(String(a.NGAY_CHUYEN || '')) || String(b.ID || '').localeCompare(String(a.ID || '')); });
}

// Sửa 1 dòng lịch sử chuyển: chỉ cho sửa Ngày/Lý do/Ghi chú để giữ nguyên
// vẹn dấu vết trước→sau (không cho đổi thiết bị hay khu vực/người dùng đã ghi).
function updateDeviceTransferNote_(user, id, patch) {
  ensureDeviceTransferSchemaV96_();
  requirePermission_(user, MODULES.ASSET, 'SUA');
  const row = findById_(V22.SHEETS.deviceTransfers, 'ID', id);
  if (!row) throw new Error('DEVICE_TRANSFER_NOT_FOUND:' + id);
  const allowed = {};
  if (patch.NGAY_CHUYEN !== undefined) allowed.NGAY_CHUYEN = dateOnly_(patch.NGAY_CHUYEN) || row.NGAY_CHUYEN;
  if (patch.LY_DO !== undefined) allowed.LY_DO = patch.LY_DO;
  if (patch.GHI_CHU !== undefined) allowed.GHI_CHU = patch.GHI_CHU;
  updateById_(V22.SHEETS.deviceTransfers, 'ID', id, allowed);
  return findById_(V22.SHEETS.deviceTransfers, 'ID', id);
}

function employeeNameV83_(r,fallback){
  return r ? String(r.HO_TEN||r.TEN_NHAN_VIEN||r.TEN_GOI_KHAC||fallback||'') : String(fallback||'');
}

// Danh sách đội PCCC: chỉ lấy nhân viên thật (NV...) có trạng thái DOI_PCCC hoạt động.
function pcccEmployeesV85_(){
  return readObjects_(V22.SHEETS.employees).filter(function(r){
    return /^NV/i.test(String(r.ID||'').trim()) && norm_(r.DOI_PCCC)==='HOAT_DONG';
  });
}

function deviceNameV83_(r,fallback){
  if(!r)return String(fallback||'');
  return [r.TEN_THIET_BI||r.LOAI_THIET_BI||fallback||'',r.SERIAL||''].filter(Boolean).join(' · ');
}

function assetCustomerLabelV841432_(area, fallback){
  area=area||{};
  return [area.ID||fallback||'',area.TANG||'',area.TEN_CONG_TY||''].map(function(v){return String(v||'').trim();}).filter(Boolean).join(' · ');
}

function normalizeAssetUsageV841432_(record){
  record=Object.assign({},record||{});
  const usage=norm_(record.DOI_TUONG_SU_DUNG||'TOA_NHA');
  if(['TOA_NHA','KHACH_HANG'].indexOf(usage)<0)throw new Error('DOI_TUONG_SU_DUNG_KHONG_HOP_LE');
  record.DOI_TUONG_SU_DUNG=usage;

  const areaId=String(record.ID_KHU_VUC||'').trim();
  const area=areaId?findById_(V22.SHEETS.buildingAreas,'ID',areaId):null;
  if(areaId&&!area)throw new Error('KHU_VUC_THIET_BI_KHONG_TON_TAI');

  const managerId=String(record.ID_NGUOI_QUAN_LY||'').trim();
  if(!managerId)throw new Error('NGUOI_QUAN_LY_BAT_BUOC');
  const manager=findById_(V22.SHEETS.employees,'ID',managerId);
  if(!manager)throw new Error('NGUOI_QUAN_LY_KHONG_TON_TAI');

  const userId=String(record.ID_NGUOI_SU_DUNG||'').trim();
  if(userId&&!findById_(V22.SHEETS.employees,'ID',userId))throw new Error('NGUOI_SU_DUNG_KHONG_TON_TAI');

  if(usage==='KHACH_HANG'){
    if(!area)throw new Error('KHU_VUC_KHACH_HANG_BAT_BUOC');
    const company=String(area.TEN_CONG_TY||'').trim();
    if(!company||norm_(company)==='PHI_LONG_TECHNOLOGY')throw new Error('KHU_VUC_KHONG_PHAI_KHACH_HANG');
    record.PHONG_BAN='';
    record.ID_NGUOI_SU_DUNG='';
  }else if(!String(record.PHONG_BAN||'').trim()){
    record.PHONG_BAN=manager.PHONG_BAN||manager.DON_VI||'';
  }

  record.ID_KHU_VUC=areaId;
  record.ID_NGUOI_QUAN_LY=managerId;
  record.ID_NGUOI_SU_DUNG=usage==='KHACH_HANG'?'':userId;
  record.MUC_DICH_SU_DUNG=String(record.MUC_DICH_SU_DUNG||'').trim();
  record.SO_BIEN_BAN=String(record.SO_BIEN_BAN||'').trim();
  record.LINK_BIEN_BAN=String(record.LINK_BIEN_BAN||'').trim();
  if(record.LINK_BIEN_BAN&&!/^https?:\/\//i.test(record.LINK_BIEN_BAN))throw new Error('LINK_BIEN_BAN_KHONG_HOP_LE');
  record.NGAY_BAN_GIAO=dateOnly_(record.NGAY_BAN_GIAO||'');
  record.NGAY_DU_KIEN_THU_HOI=dateOnly_(record.NGAY_DU_KIEN_THU_HOI||'');
  if(record.NGAY_BAN_GIAO&&record.NGAY_DU_KIEN_THU_HOI&&record.NGAY_DU_KIEN_THU_HOI<record.NGAY_BAN_GIAO)throw new Error('NGAY_THU_HOI_TRUOC_NGAY_BAN_GIAO');
  return record;
}

function assetWarehouseRelationBundleV83_(scope){
  scope=String(scope||'all');
  const rawDevices=readObjects_(V22.SHEETS.assets),rawRecoveries=(scope==='all'||scope==='recovery')?readObjects_(V22.SHEETS.recoveries):[];
  const statusKey=function(value){return norm_(value).replace(/\s+/g,'_');};
  const employees=indexBy_(readObjects_(V22.SHEETS.employees),'ID'),areas=indexBy_(readObjects_(V22.SHEETS.buildingAreas),'ID'),devicesById=indexBy_(rawDevices,'ID');
  const areaText=function(id,fallback){return maintenanceAreaLabel_(areas[String(id||'')]||{},fallback||id||'');};
  const devices=rawDevices.map(function(d){
    const userId=d.ID_NGUOI_SU_DUNG||'',managerId=d.ID_NGUOI_QUAN_LY||'',areaId=d.ID_KHU_VUC,area=areas[String(areaId||'')]||{},usage=norm_(d.DOI_TUONG_SU_DUNG||'TOA_NHA');
    const customerLabel=assetCustomerLabelV841432_(area,areaId),usageLabel=usage==='KHACH_HANG'?'Khách hàng':'Tòa nhà';
    const placeLabel=usage==='KHACH_HANG'?customerLabel:areaText(areaId,d.KHU_VUC||d.VI_TRI);
    const usedBy=usage==='KHACH_HANG'?customerLabel:(employeeNameV83_(employees[String(userId||'')],userId)||d.PHONG_BAN||placeLabel||'Tòa nhà');
    return Object.assign({},d,{
      DOI_TUONG_SU_DUNG:usage,DOI_TUONG_SU_DUNG_HIEN_THI:usageLabel,
      KHACH_HANG_HIEN_THI:usage==='KHACH_HANG'?customerLabel:'',DON_VI_SU_DUNG_HIEN_THI:usedBy,NOI_SU_DUNG_HIEN_THI:placeLabel,
      ID_NGUOI_SU_DUNG:userId||'',NGUOI_SU_DUNG:employeeNameV83_(employees[String(userId||'')],userId),
      ID_NGUOI_QUAN_LY:managerId||'',NGUOI_QUAN_LY:employeeNameV83_(employees[String(managerId||'')],managerId),
      KHU_VUC_HIEN_THI:areaText(areaId,d.KHU_VUC||d.VI_TRI),VI_TRI:areaText(areaId,d.VI_TRI||d.KHU_VUC),
      TRANG_THAI_HIEN_TAI:d.TRANG_THAI
    });
  });
  const recoveries=rawRecoveries.map(function(r){const d=devicesById[String(r.ID_THIET_BI||'')];return Object.assign({},r,{
    THIET_BI:deviceNameV83_(d,r.ID_THIET_BI),TEN_THIET_BI:d&&d.TEN_THIET_BI||'',SERIAL_THIET_BI:d&&d.SERIAL||'',
    NGUOI_TRA:employeeNameV83_(employees[String(r.ID_NGUOI_TRA||'')],r.ID_NGUOI_TRA),NGUOI_NHAN_THU_HOI:employeeNameV83_(employees[String(r.ID_NGUOI_NHAN_THU_HOI||'')],r.ID_NGUOI_NHAN_THU_HOI),
    KHU_VUC_SAU_THU_HOI:areaText(r.ID_KHU_VUC_SAU_THU_HOI,r.VI_TRI_SAU_THU_HOI),VI_TRI_SAU_THU_HOI:areaText(r.ID_KHU_VUC_SAU_THU_HOI,r.VI_TRI_SAU_THU_HOI)
  })});
  return {
    devices:devices,
    usedDevices:devices.filter(function(d){return statusKey(d.TRANG_THAI_HIEN_TAI||d.TRANG_THAI)==='DANG_SU_DUNG';}),
    warehouseDevices:devices.filter(function(d){return statusKey(d.TRANG_THAI_HIEN_TAI||d.TRANG_THAI)==='TRONG_KHO';}),
    allocations:[],recoveries:recoveries
  };
}

function syncAssetWarehouseRelationsV83_(){
  ensureAssetWarehouseSchemaV83_();
  return {ok:true,cached:true,updatedAssets:0,closedAllocations:0,mode:'DIRECT_MANAGER_IN_THIET_BI'};
}

function allocateAsset_(){
  throw new Error('CAP_PHAT_MODULE_REMOVED_USE_THIET_BI_MANAGER');
}

function recoverAsset_(user, input) {
  ensureAssetWarehouseSchemaV83_();
  const assetId = String(input.ID_THIET_BI || '').trim();
  const asset = findById_(V22.SHEETS.assets, 'ID', assetId);
  if (!asset) throw new Error('ASSET_NOT_FOUND');
  const statusAfter = norm_(input.TRANG_THAI_SAU_THU_HOI || 'TRONG_KHO');
  if(['TRONG_KHO','BAO_TRI','CHO_THANH_LY','DA_THANH_LY'].indexOf(statusAfter)<0)throw new Error('TRANG_THAI_SAU_THU_HOI_KHONG_HOP_LE');
  const areaId=String(input.ID_KHU_VUC_SAU_THU_HOI||'').trim();
  if(areaId&&!findById_(V22.SHEETS.buildingAreas,'ID',areaId))throw new Error('KHU_VUC_SAU_THU_HOI_KHONG_TON_TAI');
  if(input.ID_NGUOI_TRA&&!findById_(V22.SHEETS.employees,'ID',input.ID_NGUOI_TRA))throw new Error('NGUOI_TRA_KHONG_TON_TAI');
  if(input.ID_NGUOI_NHAN_THU_HOI&&!findById_(V22.SHEETS.employees,'ID',input.ID_NGUOI_NHAN_THU_HOI))throw new Error('NGUOI_NHAN_THU_HOI_KHONG_TON_TAI');
  const record = {
    ID: nextId_(V22.SHEETS.recoveries, 'TH'),
    NGAY_THU_HOI: dateOnly_(input.NGAY_THU_HOI || today_()),
    ID_THIET_BI: assetId,
    ID_NGUOI_TRA: input.ID_NGUOI_TRA || asset.ID_NGUOI_SU_DUNG || asset.ID_NGUOI_QUAN_LY || '',
    ID_NGUOI_NHAN_THU_HOI: input.ID_NGUOI_NHAN_THU_HOI || user.employeeId || '',
    TINH_TRANG_KHI_TRA: input.TINH_TRANG_KHI_TRA || asset.TINH_TRANG || '',
    HUONG_XU_LY: input.HUONG_XU_LY || '',
    GHI_CHU: input.GHI_CHU || '',
    TRANG_THAI_SAU_THU_HOI: statusAfter,
    ID_KHU_VUC_SAU_THU_HOI: areaId
  };
  appendObject_(V22.SHEETS.recoveries, record);
  updateById_(V22.SHEETS.assets, 'ID', assetId, {
    ID_NGUOI_SU_DUNG: '',
    ID_KHU_VUC: areaId || asset.ID_KHU_VUC || '',
    PHONG_BAN: '',
    TRANG_THAI: statusAfter
  });
  return ok_({recovery:record, asset:findById_(V22.SHEETS.assets,'ID',assetId)});
}

// ===== WAREHOUSE =====
function stockSourceMetaV841430_(record){
  record=record||{};
  const note=String(record.GHI_CHU||''),content=String(record.NOI_DUNG||''),id=String(record.ID||'');
  const proposalMatch=note.match(/ID\s*đề\s*xuất\s*:\s*([^|]+)/i)||content.match(/đề\s*xuất\s+([^|\s]+)/i);
  const detailMatch=note.match(/ID\s*chi\s*tiết\s*:\s*([^|]+)/i);
  let source=String(record.NGUON_GIAO_DICH||'').trim();
  if(!source){
    if(/^NX_/i.test(id)||proposalMatch)source='DE_XUAT_MUA_VAT_TU';
    else if(String(record.ID_GIAO_DICH_GOC||'').trim())source='DIEU_CHINH_KHO';
    else source=norm_(record.LOAI_GIAO_DICH)==='XUAT'?'XUAT_SU_DUNG':'NHAP_THU_CONG';
  }
  return {
    source:source,
    documentId:String(record.ID_CHUNG_TU||proposalMatch&&proposalMatch[1]||'').trim(),
    detailId:String(record.ID_CHI_TIET_NGUON||detailMatch&&detailMatch[1]||'').trim(),
    originalId:String(record.ID_GIAO_DICH_GOC||'').trim()
  };
}

function stockSourceLabelV841430_(record){
  const source=stockSourceMetaV841430_(record).source;
  return ({DE_XUAT_MUA_VAT_TU:'Đề xuất mua vật tư',DIEU_CHINH_KHO:'Điều chỉnh kho',XUAT_SU_DUNG:'Xuất sử dụng',NHAP_THU_CONG:'Nhập thủ công'})[source]||source||'Nhập thủ công';
}

function appendWarehouseAuditV841430_(user,action,id,before,after,note){
  const auditLock=LockService.getScriptLock();
  try{
    auditLock.waitLock(5000);
    const auditId=nextIdUnlocked_(V22.SHEETS.audit,'AUD');
    const auditRecord={ID_AUDIT:auditId,THOI_GIAN:nowStamp_(),EMAIL:user&&user.email||'',MODULE:'KHO_VAT_TU',HANH_DONG:action,ID_BAN_GHI:id,KET_QUA:'OK',NOI_DUNG:String(note||'')+' | Trước: '+JSON.stringify(before||{})+' | Sau: '+JSON.stringify(after||{})};
    appendObject_(V22.SHEETS.audit,auditRecord);
  }catch(e){
    Logger.log('AUDIT_WRITE_ERROR: '+String(e));
  }finally{
    auditLock.releaseLock();
  }
}

function saveStockTransaction_(user, input) {
  ensureAssetWarehouseSchemaV83_();
  const lock=LockService.getScriptLock();lock.waitLock(30000);let record=null;
  try{
    const type = norm_(input.LOAI_GIAO_DICH);
    if (['NHAP','XUAT'].indexOf(type) < 0) throw new Error('LOAI_GIAO_DICH_MUST_BE_NHAP_OR_XUAT');
    const qty = Number(input.SO_LUONG || 0);
    if (!(qty > 0)) throw new Error('SO_LUONG_INVALID');
    const material = findById_(V22.SHEETS.materials, 'ID', input.ID_VAT_TU);
    if (!material) throw new Error('VAT_TU_NOT_FOUND');
    if(input.ID_NGUOI_THUC_HIEN&&!findById_(V22.SHEETS.employees,'ID',input.ID_NGUOI_THUC_HIEN))throw new Error('NGUOI_THUC_HIEN_KHONG_TON_TAI');
    if (type === 'XUAT') {
      const snapshot = getInventorySnapshot_().find(x => String(x.ID) === String(input.ID_VAT_TU));
      if (!snapshot || Number(snapshot.TON_HIEN_TAI) < qty) throw new Error('TON_KHO_KHONG_DU');
    }
    record = {
      ID: nextIdUnlocked_(V22.SHEETS.stockTxn, 'NX'),NGAY: dateOnly_(input.NGAY || today_()),LOAI_GIAO_DICH: type,ID_VAT_TU: input.ID_VAT_TU,SO_LUONG: qty,
      ID_NGUOI_THUC_HIEN: input.ID_NGUOI_THUC_HIEN || user.employeeId || '',NOI_DUNG: input.NOI_DUNG || '',GHI_CHU: input.GHI_CHU || '',
      NGUON_GIAO_DICH:type==='XUAT'?'XUAT_SU_DUNG':'NHAP_THU_CONG',ID_CHUNG_TU:'',ID_CHI_TIET_NGUON:'',ID_GIAO_DICH_GOC:'',LY_DO_DIEU_CHINH:'',NGUOI_SUA:'',NGAY_SUA:''
    };
    appendObject_(V22.SHEETS.stockTxn, record);
  }finally{lock.releaseLock();}
  appendWarehouseAuditV841430_(user,'THEM_GIAO_DICH',record.ID,null,record,'Tạo phiếu nhập/xuất kho');
  // Trang Kho tự đồng bộ nền sau khi form đóng. Không đọc lại toàn bộ tồn kho
  // trong RPC lưu vì lượt đọc này vừa nặng vừa bị lặp bởi refresh của giao diện.
  return ok_({transaction:record});
}

function saveStockInfoEditV841430_(user,id,input){
  ensureAssetWarehouseSchemaV83_();
  const lock=LockService.getScriptLock();lock.waitLock(30000);let old=null,persisted=null;
  try{
    old=findById_(V22.SHEETS.stockTxn,'ID',id);if(!old)throw new Error('STOCK_TRANSACTION_NOT_FOUND:'+id);
    const employeeId=String(input.ID_NGUOI_THUC_HIEN!==undefined?input.ID_NGUOI_THUC_HIEN:old.ID_NGUOI_THUC_HIEN||'').trim();
    if(employeeId&&!findById_(V22.SHEETS.employees,'ID',employeeId))throw new Error('NGUOI_THUC_HIEN_KHONG_TON_TAI');
    const source=stockSourceMetaV841430_(old);
    const patch={
      NGAY:dateOnly_(input.NGAY||old.NGAY||today_()),ID_NGUOI_THUC_HIEN:employeeId,
      NOI_DUNG:String(input.NOI_DUNG!==undefined?input.NOI_DUNG:old.NOI_DUNG||'').trim(),GHI_CHU:String(input.GHI_CHU!==undefined?input.GHI_CHU:old.GHI_CHU||'').trim(),
      NGUON_GIAO_DICH:source.source,ID_CHUNG_TU:source.documentId,ID_CHI_TIET_NGUON:source.detailId,ID_GIAO_DICH_GOC:source.originalId,
      NGUOI_SUA:String(user&&user.employeeId||user&&user.email||''),NGAY_SUA:nowStamp_()
    };
    updateById_(V22.SHEETS.stockTxn,'ID',id,patch);persisted=readVerifiedLastWriteV64_(V22.SHEETS.stockTxn,'ID',id);
  }finally{lock.releaseLock();}
  appendWarehouseAuditV841430_(user,'SUA_THONG_TIN_PIEU_KHO',id,old,persisted,'Chỉ sửa ngày, người thực hiện, nội dung và ghi chú');
  return persisted;
}

function createStockAdjustmentV841430_(user,originalId,input){
  ensureAssetWarehouseSchemaV83_();
  const reason=String(input.LY_DO_DIEU_CHINH||'').trim();if(!reason)throw new Error('LY_DO_DIEU_CHINH_BAT_BUOC');
  const lock=LockService.getScriptLock();lock.waitLock(30000);let original=null,record=null;
  try{
    original=findById_(V22.SHEETS.stockTxn,'ID',originalId);if(!original)throw new Error('STOCK_TRANSACTION_NOT_FOUND:'+originalId);
    const type=norm_(input.LOAI_GIAO_DICH),qty=Number(input.SO_LUONG||0),materialId=String(input.ID_VAT_TU||'').trim();
    if(['NHAP','XUAT'].indexOf(type)<0)throw new Error('LOAI_GIAO_DICH_MUST_BE_NHAP_OR_XUAT');if(!(qty>0))throw new Error('SO_LUONG_INVALID');
    if(!findById_(V22.SHEETS.materials,'ID',materialId))throw new Error('VAT_TU_NOT_FOUND:'+materialId);
    const employeeId=String(input.ID_NGUOI_THUC_HIEN||user&&user.employeeId||'').trim();if(employeeId&&!findById_(V22.SHEETS.employees,'ID',employeeId))throw new Error('NGUOI_THUC_HIEN_KHONG_TON_TAI');
    if(type==='XUAT'){
      const snapshot=getInventorySnapshot_().find(function(x){return String(x.ID||'')===materialId;});
      if(!snapshot||Number(snapshot.TON_HIEN_TAI)<qty)throw new Error('TON_KHO_KHONG_DU');
    }
    const source=stockSourceMetaV841430_(original);
    record={
      ID:nextIdUnlocked_(V22.SHEETS.stockTxn,'NX'),NGAY:dateOnly_(input.NGAY||today_()),LOAI_GIAO_DICH:type,ID_VAT_TU:materialId,SO_LUONG:qty,ID_NGUOI_THUC_HIEN:employeeId,
      NOI_DUNG:'Điều chỉnh kho từ phiếu '+originalId,GHI_CHU:'Phiếu gốc: '+originalId+' | Lý do: '+reason,NGUON_GIAO_DICH:'DIEU_CHINH_KHO',
      ID_CHUNG_TU:source.documentId,ID_CHI_TIET_NGUON:source.detailId,ID_GIAO_DICH_GOC:originalId,LY_DO_DIEU_CHINH:reason,NGUOI_SUA:String(user&&user.employeeId||user&&user.email||''),NGAY_SUA:nowStamp_()
    };
    appendObject_(V22.SHEETS.stockTxn,record);
  }finally{lock.releaseLock();}
  appendWarehouseAuditV841430_(user,'DIEU_CHINH_KHO',record.ID,original,record,'Tạo giao dịch điều chỉnh; giữ nguyên phiếu gốc '+originalId);
  return readVerifiedLastWriteV64_(V22.SHEETS.stockTxn,'ID',record.ID);
}

function getInventorySnapshot_() {
  const materials = readObjects_(V22.SHEETS.materials);
  const txns = readObjects_(V22.SHEETS.stockTxn);
  const movement={},totals={};
  txns.forEach(function(t){
    const id=String(t.ID_VAT_TU||'').trim(),type=norm_(t.LOAI_GIAO_DICH),q=Number(t.SO_LUONG||0);
    if(!id||!(q>0))return;
    if(!totals[id])totals[id]={NHAP:0,XUAT:0};
    if(type==='NHAP'||/^NHAP_/.test(type)){totals[id].NHAP+=q;movement[id]=(movement[id]||0)+q;}
    else if(type==='XUAT'||/^XUAT_/.test(type)){totals[id].XUAT+=q;movement[id]=(movement[id]||0)-q;}
  });
  return materials.map(m => {
    const id=String(m.ID||''),a=totals[id]||{NHAP:0,XUAT:0},stock = Number(m.TON_DAU || 0)+(movement[id]||0);
    return Object.assign({}, m, {
      TONG_NHAP:a.NHAP,
      TONG_XUAT:a.XUAT,
      TON_HIEN_TAI:stock,
      CANH_BAO_TON: stock <= Number(m.TON_TOI_THIEU || 0) ? 'SẮP HẾT' : 'BÌNH THƯỜNG'
    });
  });
}

// ===== SYSTEM AUDIT =====
function systemAudit_() {
  const required = {
    NHAT_KY_BAO_TRI:['ID','KHU_VUC_SNAPSHOT','TEN_CONG_TY_SNAPSHOT','HANG_MUC_SNAPSHOT','NGAY_THUC_HIEN','NGAY_KE_TIEP','ID_THIET_BI','ID_NGUOI_THUC_HIEN','NGUOI_THUC_HIEN','DON_VI_THUC_HIEN','NOI_DUNG_THUC_HIEN','KET_QUA','GHI_CHU','ID_LICH','ID_KHU_VUC','ID_HANG_MUC'],
    DM_LICH_BAO_TRI:['ID_LICH','ID_KHU_VUC','ID_HANG_MUC','CHU_KY_NGAY','CANH_BAO_TRUOC_NGAY','NGAY_GOC_GAN_NHAT','NGAY_KE_TIEP','ID_NHAT_KY_GAN_NHAT','ID_NGUOI_PHU_TRACH','TRANG_THAI','GHI_CHU'],
    DM_HANG_MUC_BAO_TRI:['ID_HANG_MUC','TEN_HANG_MUC','NHOM','CHU_KY_MAC_DINH','CANH_BAO_TRUOC_NGAY','AP_DUNG_LOAI_KHU_VUC','TRANG_THAI','GHI_CHU'],
    DM_KHU_VUC_TOA_NHA:['ID','MA_KHU_VUC','TANG','KHU_VUC','TEN_CONG_TY','LOAI_KHU_VUC','TRANG_THAI','GHI_CHU'],
    DM_NHAN_VIEN:['ID','HO_TEN','TEN_GOI_KHAC','CHUC_VU','PHONG_BAN','DON_VI','DIEN_THOAI','EMAIL','DOI_PCCC','NHIEM_VU_PCCC','TRANG_THAI','GHI_CHU'],
    DM_NHA_THAU:['ID','DON_VI','HO_TEN','CHUC_VU','LINH_VUC','DIEN_THOAI','EMAIL','DIA_CHI','TRANG_THAI','GHI_CHU'],
    DM_NHA_CUNG_CAP:['ID','TEN_NHA_CUNG_CAP','MA_SO_THUE','NHOM_CUNG_CAP','SAN_PHAM_DICH_VU','NGUOI_LIEN_HE','CHUC_VU','DIEN_THOAI','EMAIL','DIA_CHI','DIEU_KHOAN_THANH_TOAN','SO_TAI_KHOAN','NGAN_HANG','TRANG_THAI','GHI_CHU'],
    NGUOI_SU_DUNG:['ID','ID_NHAN_VIEN','EMAIL_DANG_NHAP','ID_VAI_TRO','MAT_KHAU_HE_THONG','TRANG_THAI','DANG_NHAP_CUOI','NGAY_TAO','NGAY_CAP_NHAT']
  };

  const schema = [];
  Object.keys(required).forEach(sheet => {
    const headers = getHeaders_(sheet);
    const missing = required[sheet].filter(h => headers.indexOf(h) < 0);
    schema.push({sheet:sheet, ok:missing.length===0, missing:missing, headers:headers});
  });

  const areas = indexBy_(readObjects_(V22.SHEETS.buildingAreas), 'ID');
  const items = indexBy_(readObjects_(V22.SHEETS.maintenanceItems), 'ID_HANG_MUC');
  const logs = readObjects_(V22.SHEETS.maintenanceLogs);
  const schedules = readObjects_(V22.SHEETS.maintenanceSchedules);

  const orphanLogs = logs.filter(r => !areas[r.ID_KHU_VUC] || !items[r.ID_HANG_MUC]).map(r => r.ID);
  const orphanSchedules = schedules.filter(r => !areas[r.ID_KHU_VUC] || !items[r.ID_HANG_MUC]).map(r => r.ID_LICH);

  const pairCounts = {};
  schedules.forEach(r => {
    const key = String(r.ID_KHU_VUC||'') + '|' + String(r.ID_HANG_MUC||'');
    pairCounts[key] = (pairCounts[key] || 0) + 1;
  });
  const duplicateSchedulePairs = Object.keys(pairCounts).filter(k => pairCounts[k] > 1);

  return {
    version:V22.VERSION,
    generatedAt:nowStamp_(),
    schema:schema,
    orphanLogs:orphanLogs,
    orphanSchedules:orphanSchedules,
    duplicateSchedulePairs:duplicateSchedulePairs,
    ok:schema.every(x=>x.ok) && !orphanLogs.length && !orphanSchedules.length && !duplicateSchedulePairs.length
  };
}

// ===== V78: CÔNG CỤ KIỂM TRA DỮ LIỆU BẢO TRÌ (CHỈ ĐỌC) =====
// Hàm này không gọi setValue/setValues/append/upsert/delete và không tự đồng bộ lịch.
function runMaintenanceDataAuditV78(systemToken) {
  requireSystemUnlockV137_(systemToken);
  beginFastRequestV20_({bypassCache:true});
  const user=getNoLoginTestUser_();
  requirePermission_(user,MODULES.MAINTENANCE,'XEM');
  return maintenanceDataAuditV78_();
}

function maintenanceDataAuditV78_() {
  const started=Date.now(),today=today_(),MAX_RETURNED_ISSUES=1000;
  const checks=[
    ['SCHEMA_MISSING','Thiếu cột bắt buộc'],
    ['LOG_ID_MISSING','Nhật ký thiếu ID'],
    ['LOG_ID_DUPLICATE','Nhật ký trùng ID'],
    ['SCHEDULE_ID_MISSING','Lịch thiếu ID_LICH'],
    ['SCHEDULE_ID_DUPLICATE','Lịch trùng ID_LICH'],
    ['SCHEDULE_PAIR_DUPLICATE','Trùng cặp khu vực + hạng mục'],
    ['AREA_NOT_FOUND','Không tìm thấy khu vực'],
    ['ITEM_NOT_FOUND','Không tìm thấy hạng mục'],
    ['LOG_DATE_INVALID','Ngày thực hiện không hợp lệ'],
    ['LOG_DATE_FUTURE','Nhật ký có ngày thực hiện tương lai'],
    ['LOG_SCHEDULE_ID_MISSING','Nhật ký thiếu ID_LICH'],
    ['LOG_SCHEDULE_NOT_FOUND','ID_LICH của nhật ký không tồn tại'],
    ['LOG_SCHEDULE_PAIR_MISMATCH','Nhật ký không khớp cặp của lịch'],
    ['CYCLE_MISSING','Thiếu chu kỳ bảo trì'],
    ['LOG_NEXT_DATE_INVALID','Ngày kế tiếp của nhật ký chưa đúng'],
    ['SCHEDULE_LATEST_LOG_INVALID','Nhật ký gần nhất trên lịch chưa đúng'],
    ['SCHEDULE_BASE_DATE_INVALID','Ngày gốc gần nhất trên lịch chưa đúng'],
    ['SCHEDULE_NEXT_DATE_INVALID','Ngày kế tiếp trên lịch chưa đúng'],
    ['EMPLOYEE_ID_MISSING','Nhật ký thiếu ID người thực hiện'],
    ['EMPLOYEE_NOT_FOUND','Không tìm thấy nhân viên'],
    ['EMPLOYEE_NAME_MISMATCH','Tên người thực hiện chưa đồng bộ'],
    ['SEQUENCE_MISSING','Thiếu bộ đếm ID'],
    ['SEQUENCE_BEHIND','Bộ đếm ID thấp hơn dữ liệu thực tế']
  ];
  const checkMap={},issues=[];let issueTotal=0,errorCount=0,warningCount=0;
  checks.forEach(function(x){checkMap[x[0]]={MA_KIEM_TRA:x[0],NHOM_KIEM_TRA:x[1],SO_LOI:0,TRANG_THAI:'ĐẠT'}});
  function add(code,severity,sheet,row,id,message,action){
    const c=checkMap[code]||{MA_KIEM_TRA:code,NHOM_KIEM_TRA:code,SO_LOI:0,TRANG_THAI:'ĐẠT'};
    if(!checkMap[code])checkMap[code]=c;
    c.SO_LOI++;c.TRANG_THAI='CẦN KIỂM TRA';issueTotal++;
    if(severity==='LỖI')errorCount++;else warningCount++;
    if(issues.length<MAX_RETURNED_ISSUES)issues.push({
      MUC_DO:severity,MA_KIEM_TRA:code,NHOM_KIEM_TRA:c.NHOM_KIEM_TRA,
      BANG_DU_LIEU:sheet,DONG:String(row||''),MA_DONG:String(id||''),
      NOI_DUNG_LOI:message,HUONG_XU_LY:action
    });
  }
  function rows(sheet){return readObjectsWithRow_(sheet)}
  function text(v){return String(v===undefined||v===null?'':v).trim()}
  function validCycle(v){const n=parseInt(v,10);return Number.isFinite(n)&&n>0?n:null}
  function duplicateGroups(source,field){
    const m={};source.forEach(function(x){const key=text(x.obj[field]);if(!key)return;(m[key]||(m[key]=[])).push(x)});
    return Object.keys(m).filter(function(k){return m[k].length>1}).map(function(k){return {key:k,rows:m[k]}})
  }
  function maxIdNumber(source,field,prefix){
    let max=0;const re=new RegExp('^'+prefix+'(\\d+)$','i');
    source.forEach(function(x){const m=text(x.obj[field]).match(re);if(m)max=Math.max(max,Number(m[1]||0))});return max
  }

  const required={
    NHAT_KY_BAO_TRI:['ID','ID_LICH','ID_KHU_VUC','ID_HANG_MUC','NGAY_THUC_HIEN','NGAY_KE_TIEP','ID_NGUOI_THUC_HIEN','NGUOI_THUC_HIEN'],
    DM_LICH_BAO_TRI:['ID_LICH','ID_KHU_VUC','ID_HANG_MUC','CHU_KY_NGAY','NGAY_GOC_GAN_NHAT','NGAY_KE_TIEP','ID_NHAT_KY_GAN_NHAT'],
    DM_KHU_VUC_TOA_NHA:['ID','TANG','KHU_VUC'],
    DM_HANG_MUC_BAO_TRI:['ID_HANG_MUC','TEN_HANG_MUC','CHU_KY_MAC_DINH'],
    DM_NHAN_VIEN:['ID','HO_TEN'],
    SYS_ID_SEQUENCE:['ENTITY','PREFIX','LAST_NUMBER']
  };
  Object.keys(required).forEach(function(sheet){
    const headers=getHeaders_(sheet);
    required[sheet].forEach(function(h){if(headers.indexOf(h)<0)add('SCHEMA_MISSING','LỖI',sheet,1,h,'Thiếu cột '+h+'.','Bổ sung đúng tiêu đề cột ở hàng 1 trước khi sửa dữ liệu.')});
  });

  const areaRows=rows(V22.SHEETS.buildingAreas),itemRows=rows(V22.SHEETS.maintenanceItems),employeeRows=rows(V22.SHEETS.employees);
  const logRows=rows(V22.SHEETS.maintenanceLogs),scheduleRows=rows(V22.SHEETS.maintenanceSchedules),sequenceRows=rows(V22.SHEETS.sequences);
  const areas={},items={},employees={},schedulesById={},schedulesByPair={};
  areaRows.forEach(function(x){const id=text(x.obj.ID);if(id)areas[id]=x.obj});
  itemRows.forEach(function(x){const id=text(x.obj.ID_HANG_MUC);if(id)items[id]=x.obj});
  employeeRows.forEach(function(x){const id=text(x.obj.ID);if(id)employees[id]=x.obj});

  logRows.forEach(function(x){if(!text(x.obj.ID))add('LOG_ID_MISSING','LỖI',V22.SHEETS.maintenanceLogs,x.row,'','Dòng nhật ký chưa có ID.','Cấp ID NBxxxx duy nhất cho dòng này.')});
  duplicateGroups(logRows,'ID').forEach(function(g){add('LOG_ID_DUPLICATE','LỖI',V22.SHEETS.maintenanceLogs,g.rows.map(function(x){return x.row}).join(', '),g.key,'ID '+g.key+' xuất hiện '+g.rows.length+' lần.','Giữ một ID và cấp ID mới cho các dòng còn lại; cập nhật khóa tham chiếu nếu có.')});
  scheduleRows.forEach(function(x){
    const r=x.obj,id=text(r.ID_LICH),areaId=text(r.ID_KHU_VUC),itemId=text(r.ID_HANG_MUC),pair=areaId+'|'+itemId;
    if(!id)add('SCHEDULE_ID_MISSING','LỖI',V22.SHEETS.maintenanceSchedules,x.row,'','Dòng lịch chưa có ID_LICH.','Cấp ID LBxxxx duy nhất cho lịch.')
    else if(!schedulesById[id])schedulesById[id]=x;
    if(areaId&&itemId&&!schedulesByPair[pair])schedulesByPair[pair]=x;
  });
  duplicateGroups(scheduleRows,'ID_LICH').forEach(function(g){add('SCHEDULE_ID_DUPLICATE','LỖI',V22.SHEETS.maintenanceSchedules,g.rows.map(function(x){return x.row}).join(', '),g.key,'ID_LICH '+g.key+' xuất hiện '+g.rows.length+' lần.','Đổi ID lịch trùng và đồng bộ lại NHAT_KY_BAO_TRI.ID_LICH.')});
  const pairGroups={};scheduleRows.forEach(function(x){const a=text(x.obj.ID_KHU_VUC),i=text(x.obj.ID_HANG_MUC);if(a&&i)(pairGroups[a+'|'+i]||(pairGroups[a+'|'+i]=[])).push(x)});
  Object.keys(pairGroups).filter(function(k){return pairGroups[k].length>1}).forEach(function(k){const g=pairGroups[k];add('SCHEDULE_PAIR_DUPLICATE','LỖI',V22.SHEETS.maintenanceSchedules,g.map(function(x){return x.row}).join(', '),k,'Cặp '+k+' có '+g.length+' lịch.','Chọn một lịch chuẩn, chuyển các nhật ký về lịch đó rồi lưu trữ lịch trùng.')});

  const latestByPair={};
  logRows.forEach(function(x){
    const r=x.obj,id=text(r.ID),areaId=text(r.ID_KHU_VUC),itemId=text(r.ID_HANG_MUC),pair=areaId+'|'+itemId;
    if(!areaId||!areas[areaId])add('AREA_NOT_FOUND','LỖI',V22.SHEETS.maintenanceLogs,x.row,id,areaId?'ID_KHU_VUC '+areaId+' không có trong danh mục.':'Nhật ký chưa có ID_KHU_VUC.','Khôi phục ID từ snapshot và DM_KHU_VUC_TOA_NHA.')
    if(!itemId||!items[itemId])add('ITEM_NOT_FOUND','LỖI',V22.SHEETS.maintenanceLogs,x.row,id,itemId?'ID_HANG_MUC '+itemId+' không có trong danh mục.':'Nhật ký chưa có ID_HANG_MUC.','Khôi phục ID từ snapshot và DM_HANG_MUC_BAO_TRI.')
    const performed=dateOnly_(r.NGAY_THUC_HIEN);
    if(!performed)add('LOG_DATE_INVALID','LỖI',V22.SHEETS.maintenanceLogs,x.row,id,'NGAY_THUC_HIEN đang trống hoặc sai định dạng.','Nhập ngày thực hiện thực tế theo dd/mm/yyyy.')
    else if(performed>today)add('LOG_DATE_FUTURE','LỖI',V22.SHEETS.maintenanceLogs,x.row,id,'Ngày thực hiện '+performed+' nằm trong tương lai.','Không dùng nhật ký để lưu công việc chờ thực hiện; chuyển về lịch/kế hoạch.')
    if(performed&&performed<=today&&areaId&&itemId){const old=latestByPair[pair];if(!old||performed>old.date||(performed===old.date&&id>old.id))latestByPair[pair]={date:performed,id:id,row:x.row,obj:r}}

    const scheduleId=text(r.ID_LICH),scheduleEntry=scheduleId?schedulesById[scheduleId]:schedulesByPair[pair];
    if(!scheduleId)add('LOG_SCHEDULE_ID_MISSING','CẢNH BÁO',V22.SHEETS.maintenanceLogs,x.row,id,'Nhật ký chưa có ID_LICH.','Gắn ID_LICH theo đúng cặp ID_KHU_VUC + ID_HANG_MUC.')
    else if(!schedulesById[scheduleId])add('LOG_SCHEDULE_NOT_FOUND','LỖI',V22.SHEETS.maintenanceLogs,x.row,id,'ID_LICH '+scheduleId+' không tồn tại.','Khôi phục hoặc chuyển nhật ký sang lịch đúng.')
    else {const s=schedulesById[scheduleId].obj;if(text(s.ID_KHU_VUC)!==areaId||text(s.ID_HANG_MUC)!==itemId)add('LOG_SCHEDULE_PAIR_MISMATCH','LỖI',V22.SHEETS.maintenanceLogs,x.row,id,'Nhật ký và lịch '+scheduleId+' không cùng khu vực + hạng mục.','Sửa ID_LICH hoặc cặp ID_KHU_VUC + ID_HANG_MUC theo dữ liệu thực tế.')}
    const schedule=scheduleEntry?scheduleEntry.obj:{},item=items[itemId]||{},cycle=validCycle(schedule.CHU_KY_NGAY)||validCycle(item.CHU_KY_MAC_DINH);
    if(!cycle)add('CYCLE_MISSING','CẢNH BÁO',V22.SHEETS.maintenanceLogs,x.row,id,'Không xác định được chu kỳ để tính ngày kế tiếp.','Bổ sung CHU_KY_NGAY trong lịch hoặc CHU_KY_MAC_DINH trong danh mục hạng mục.')
    else if(performed){const expected=addDays_(performed,cycle),actual=dateOnly_(r.NGAY_KE_TIEP);if(actual!==expected)add('LOG_NEXT_DATE_INVALID','CẢNH BÁO',V22.SHEETS.maintenanceLogs,x.row,id,'Ngày kế tiếp hiện tại '+(actual||'đang trống')+', đúng phải là '+expected+'.','Tính lại NGAY_KE_TIEP từ ngày thực hiện + '+cycle+' ngày.')}

    const employeeId=text(r.ID_NGUOI_THUC_HIEN),employee=employees[employeeId];
    if(!employeeId)add('EMPLOYEE_ID_MISSING','CẢNH BÁO',V22.SHEETS.maintenanceLogs,x.row,id,'Chưa có ID_NGUOI_THUC_HIEN.','Chọn nhân viên từ DM_NHAN_VIEN.')
    else if(!employee)add('EMPLOYEE_NOT_FOUND','LỖI',V22.SHEETS.maintenanceLogs,x.row,id,'Không tìm thấy nhân viên '+employeeId+'.','Sửa ID theo DM_NHAN_VIEN hoặc bổ sung nhân viên còn thiếu.')
    else {const expectedName=text(employee.HO_TEN||employee.TEN_NHAN_VIEN||employee.TEN_GOI_KHAC),actualName=text(r.NGUOI_THUC_HIEN);if(norm_(actualName)!==norm_(expectedName))add('EMPLOYEE_NAME_MISMATCH','CẢNH BÁO',V22.SHEETS.maintenanceLogs,x.row,id,'Tên đang lưu: '+(actualName||'trống')+'; tên danh mục: '+expectedName+'.','Điền lại NGUOI_THUC_HIEN theo ID '+employeeId+'.')}
  });

  scheduleRows.forEach(function(x){
    const r=x.obj,id=text(r.ID_LICH),areaId=text(r.ID_KHU_VUC),itemId=text(r.ID_HANG_MUC),pair=areaId+'|'+itemId,item=items[itemId]||{},cycle=validCycle(r.CHU_KY_NGAY);
    if(!areaId||!areas[areaId])add('AREA_NOT_FOUND','LỖI',V22.SHEETS.maintenanceSchedules,x.row,id,areaId?'ID_KHU_VUC '+areaId+' không có trong danh mục.':'Lịch chưa có ID_KHU_VUC.','Sửa theo DM_KHU_VUC_TOA_NHA.')
    if(!itemId||!items[itemId])add('ITEM_NOT_FOUND','LỖI',V22.SHEETS.maintenanceSchedules,x.row,id,itemId?'ID_HANG_MUC '+itemId+' không có trong danh mục.':'Lịch chưa có ID_HANG_MUC.','Sửa theo DM_HANG_MUC_BAO_TRI.')
    if(!cycle)add('CYCLE_MISSING','CẢNH BÁO',V22.SHEETS.maintenanceSchedules,x.row,id,'Lịch chưa có CHU_KY_NGAY hợp lệ.','Lấy chu kỳ chuẩn từ hạng mục hoặc nhập chu kỳ lớn hơn 0.')
    const latest=latestByPair[pair];
    if(latest){
      if(text(r.ID_NHAT_KY_GAN_NHAT)!==latest.id)add('SCHEDULE_LATEST_LOG_INVALID','CẢNH BÁO',V22.SHEETS.maintenanceSchedules,x.row,id,'ID_NHAT_KY_GAN_NHAT hiện tại '+(text(r.ID_NHAT_KY_GAN_NHAT)||'trống')+', đúng phải là '+latest.id+'.','Rebuild lịch theo lần bảo trì thực tế mới nhất.')
      if(dateOnly_(r.NGAY_GOC_GAN_NHAT)!==latest.date)add('SCHEDULE_BASE_DATE_INVALID','CẢNH BÁO',V22.SHEETS.maintenanceSchedules,x.row,id,'NGAY_GOC_GAN_NHAT chưa khớp '+latest.date+'.','Cập nhật ngày gốc từ nhật ký mới nhất.')
      const resolvedCycle=cycle||validCycle(item.CHU_KY_MAC_DINH),expected=resolvedCycle?addDays_(latest.date,resolvedCycle):'',actual=dateOnly_(r.NGAY_KE_TIEP);
      if(actual!==expected)add('SCHEDULE_NEXT_DATE_INVALID','CẢNH BÁO',V22.SHEETS.maintenanceSchedules,x.row,id,'Ngày kế tiếp hiện tại '+(actual||'đang trống')+', đúng phải là '+(expected||'trống do thiếu chu kỳ')+'.','Tính lại lịch từ ngày gốc và chu kỳ chuẩn.')
    }
  });

  const sequenceByEntity={};sequenceRows.forEach(function(x){const e=text(x.obj.ENTITY);if(e)sequenceByEntity[e]=x});
  [[V22.SHEETS.maintenanceLogs,'ID','NB'],[V22.SHEETS.maintenanceSchedules,'ID_LICH','LB']].forEach(function(spec){
    const source=spec[0]===V22.SHEETS.maintenanceLogs?logRows:scheduleRows,max=maxIdNumber(source,spec[1],spec[2]),entry=sequenceByEntity[spec[0]];
    if(!entry)add('SEQUENCE_MISSING','CẢNH BÁO',V22.SHEETS.sequences,'',spec[0],'Chưa có bộ đếm cho '+spec[0]+'.','Tạo bộ đếm '+spec[2]+' với LAST_NUMBER='+max+'.')
    else {const last=Number(entry.obj.LAST_NUMBER||0);if(last<max)add('SEQUENCE_BEHIND','CẢNH BÁO',V22.SHEETS.sequences,entry.row,spec[0],'LAST_NUMBER='+last+' nhưng ID lớn nhất là '+max+'.','Cập nhật LAST_NUMBER lên '+max+'; không reset về 0.')}
  });

  const affected={};issues.forEach(function(i){affected[i.BANG_DU_LIEU+'|'+i.DONG]=true});
  const checkResults=Object.keys(checkMap).map(function(k){return checkMap[k]}).sort(function(a,b){return b.SO_LOI-a.SO_LOI||a.NHOM_KIEM_TRA.localeCompare(b.NHOM_KIEM_TRA)});
  return {
    ok:true,readOnly:true,version:'V78-MAINTENANCE-DATA-AUDIT',generatedAt:nowStamp_(),elapsedMs:Date.now()-started,
    summary:{logs:logRows.length,schedules:scheduleRows.length,areas:areaRows.length,items:itemRows.length,employees:employeeRows.length,totalIssues:issueTotal,errors:errorCount,warnings:warningCount,affectedRows:Object.keys(affected).length},
    checks:checkResults,issues:issues,truncated:issueTotal>issues.length,returnedIssues:issues.length,maxReturnedIssues:MAX_RETURNED_ISSUES
  };
}

// ===== V79: SỬA DỮ LIỆU BẢO TRÌ CÓ XEM TRƯỚC =====
function runMaintenanceDataRepairV79(mode, systemToken) {
  requireSystemUnlockV137_(systemToken);
  beginFastRequestV20_({bypassCache:true});
  const user=getNoLoginTestUser_();
  requirePermission_(user,MODULES.MAINTENANCE,'SUA');
  return runMaintenanceDataRepairV79_(mode);
}

function runMaintenanceDataRepairV79_(mode) {
  mode=String(mode||'PREVIEW').toUpperCase()==='REPAIR'?'REPAIR':'PREVIEW';
  if(mode!=='REPAIR')return maintenanceDataRepairV79_('PREVIEW');
  const lock=LockService.getScriptLock();lock.waitLock(30000);
  try{return maintenanceDataRepairV79_('REPAIR')}finally{lock.releaseLock()}
}

function maintenanceDataRepairV79_(mode) {
  const started=Date.now(),today=today_(),changes=[],skipped=[],MAX_RETURNED=1000;
  const patches={};let totalChanges=0;
  const text=v=>String(v===undefined||v===null?'':v).trim();
  const cycleOf=v=>{const n=parseInt(v,10);return Number.isFinite(n)&&n>0?n:null};
  const rows=sheet=>readObjectsWithRow_(sheet);
  const areaRows=rows(V22.SHEETS.buildingAreas),itemRows=rows(V22.SHEETS.maintenanceItems),employeeRows=rows(V22.SHEETS.employees),logRows=rows(V22.SHEETS.maintenanceLogs),scheduleRows=rows(V22.SHEETS.maintenanceSchedules),sequenceRows=rows(V22.SHEETS.sequences);
  const areas={},items={},employees={},schedulesById={},schedulesByPair={};
  areaRows.forEach(x=>{const id=text(x.obj.ID);if(id)areas[id]=x.obj});
  itemRows.forEach(x=>{const id=text(x.obj.ID_HANG_MUC);if(id)items[id]=x.obj});
  employeeRows.forEach(x=>{const id=text(x.obj.ID);if(id)employees[id]=x.obj});
  scheduleRows.forEach(x=>{const id=text(x.obj.ID_LICH),pair=text(x.obj.ID_KHU_VUC)+'|'+text(x.obj.ID_HANG_MUC);if(id&&!schedulesById[id])schedulesById[id]=x;if(text(x.obj.ID_KHU_VUC)&&text(x.obj.ID_HANG_MUC))(schedulesByPair[pair]||(schedulesByPair[pair]=[])).push(x)});
  function addSkip(sheet,row,id,message){if(skipped.length<MAX_RETURNED)skipped.push({BANG_DU_LIEU:sheet,DONG:String(row||''),MA_DONG:String(id||''),LY_DO:message})}
  function queue(sheet,row,field,next,reason){
    const current=patches[sheet]||(patches[sheet]={}),entry=current[row]||(current[row]={}),old=entry[field];
    if(old!==undefined&&String(old)===String(next))return;
    entry[field]=next;totalChanges++;
    if(changes.length<MAX_RETURNED)changes.push({BANG_DU_LIEU:sheet,DONG:String(row),TRUONG:field,GIA_TRI_CU:old===undefined?'(đọc từ Sheet)':old,GIA_TRI_MOI:next,LY_DO:reason});
  }
  function uniqueArea(snapshot){
    const n=norm_(snapshot);if(!n)return null;const found=areaRows.filter(x=>{const a=x.obj;return [maintenanceAreaLabel_(a),a.KHU_VUC,a.MA_KHU_VUC].some(v=>norm_(v)===n)});return found.length===1?found[0]:null;
  }
  function uniqueItem(snapshot){
    const n=norm_(snapshot);if(!n)return null;const found=itemRows.filter(x=>norm_(x.obj.TEN_HANG_MUC)===n);return found.length===1?found[0]:null;
  }
  const resolvedLogs=[];
  logRows.forEach(x=>{
    const r=x.obj,id=text(r.ID);let areaId=text(r.ID_KHU_VUC),itemId=text(r.ID_HANG_MUC);
    if(!areas[areaId]){const hit=uniqueArea(r.KHU_VUC_SNAPSHOT||r.KHU_VUC);if(hit){areaId=text(hit.obj.ID);queue(V22.SHEETS.maintenanceLogs,x.row,'ID_KHU_VUC',areaId,'Khôi phục khu vực duy nhất từ snapshot.')}else if(areaId||r.KHU_VUC_SNAPSHOT)addSkip(V22.SHEETS.maintenanceLogs,x.row,id,'Không xác định duy nhất khu vực từ snapshot; không tự đổi ID_KHU_VUC.')}
    if(!items[itemId]){const hit=uniqueItem(r.HANG_MUC_SNAPSHOT||r.HANG_MUC);if(hit){itemId=text(hit.obj.ID_HANG_MUC);queue(V22.SHEETS.maintenanceLogs,x.row,'ID_HANG_MUC',itemId,'Khôi phục hạng mục duy nhất từ snapshot.')}else if(itemId||r.HANG_MUC_SNAPSHOT)addSkip(V22.SHEETS.maintenanceLogs,x.row,id,'Không xác định duy nhất hạng mục từ snapshot; không tự đổi ID_HANG_MUC.')}
    const performed=dateOnly_(r.NGAY_THUC_HIEN);if(!performed||performed>today)return;
    const pair=areaId+'|'+itemId,scheduleId=text(r.ID_LICH),linked=scheduleId?schedulesById[scheduleId]:null,pairSchedules=schedulesByPair[pair]||[];
    let schedule=linked;
    if(!schedule&&!scheduleId&&pairSchedules.length===1){schedule=pairSchedules[0];queue(V22.SHEETS.maintenanceLogs,x.row,'ID_LICH',text(schedule.obj.ID_LICH),'Gắn lịch duy nhất theo cặp khu vực + hạng mục.')}
    if(linked&&(text(linked.obj.ID_KHU_VUC)!==areaId||text(linked.obj.ID_HANG_MUC)!==itemId)){addSkip(V22.SHEETS.maintenanceLogs,x.row,id,'ID_LICH đang có không khớp cặp; không tự chuyển lịch.')}
    const item=items[itemId]||{},cycle=cycleOf(schedule&&schedule.obj.CHU_KY_NGAY)||cycleOf(item.CHU_KY_MAC_DINH);
    if(cycle){const expected=addDays_(performed,cycle);if(dateOnly_(r.NGAY_KE_TIEP)!==expected)queue(V22.SHEETS.maintenanceLogs,x.row,'NGAY_KE_TIEP',expected,'Tính lại từ NGAY_THUC_HIEN + CHU_KY_NGAY.')}
    else if(r.NGAY_KE_TIEP)queue(V22.SHEETS.maintenanceLogs,x.row,'NGAY_KE_TIEP','','Xóa ngày kế tiếp không có chu kỳ xác định.')
    const employee=employees[text(r.ID_NGUOI_THUC_HIEN)];if(employee){const name=text(employee.HO_TEN||employee.TEN_NHAN_VIEN||employee.TEN_GOI_KHAC);if(norm_(r.NGUOI_THUC_HIEN)!==norm_(name))queue(V22.SHEETS.maintenanceLogs,x.row,'NGUOI_THUC_HIEN',name,'Đồng bộ tên từ DM_NHAN_VIEN theo ID.')}
    resolvedLogs.push({row:x.row,obj:r,areaId:areaId,itemId:itemId,date:performed,id:id,pair:pair});
  });
  const latestByPair={};resolvedLogs.forEach(x=>{const old=latestByPair[x.pair];if(!old||x.date>old.date||(x.date===old.date&&x.id>old.id))latestByPair[x.pair]=x});
  scheduleRows.forEach(x=>{
    const r=x.obj,id=text(r.ID_LICH),areaId=text(r.ID_KHU_VUC),itemId=text(r.ID_HANG_MUC),pair=areaId+'|'+itemId,item=items[itemId]||{},pairSchedules=schedulesByPair[pair]||[];
    if(pairSchedules.length!==1){if(pairSchedules.length>1)addSkip(V22.SHEETS.maintenanceSchedules,x.row,id,'Cặp lịch bị trùng; giữ nguyên để người quản trị chọn lịch chuẩn.');return}
    let cycle=cycleOf(r.CHU_KY_NGAY);if(!cycle&&cycleOf(item.CHU_KY_MAC_DINH)){cycle=cycleOf(item.CHU_KY_MAC_DINH);queue(V22.SHEETS.maintenanceSchedules,x.row,'CHU_KY_NGAY',cycle,'Lấy chu kỳ chuẩn từ DM_HANG_MUC_BAO_TRI.')}
    const latest=latestByPair[pair];
    if(latest){
      if(text(r.ID_NHAT_KY_GAN_NHAT)!==latest.id)queue(V22.SHEETS.maintenanceSchedules,x.row,'ID_NHAT_KY_GAN_NHAT',latest.id,'Đồng bộ nhật ký thực tế mới nhất, bỏ qua ngày tương lai.');
      if(dateOnly_(r.NGAY_GOC_GAN_NHAT)!==latest.date)queue(V22.SHEETS.maintenanceSchedules,x.row,'NGAY_GOC_GAN_NHAT',latest.date,'Đồng bộ ngày thực hiện thực tế mới nhất.');
      const expected=cycle?addDays_(latest.date,cycle):'';if(dateOnly_(r.NGAY_KE_TIEP)!==expected)queue(V22.SHEETS.maintenanceSchedules,x.row,'NGAY_KE_TIEP',expected,cycle?'Tính lại ngày kế tiếp theo chu kỳ.':'Xóa ngày kế tiếp vì lịch thiếu chu kỳ.');
      const status=cycle?'Hoạt động':'Thiếu chu kỳ';if(text(r.TRANG_THAI)!==status)queue(V22.SHEETS.maintenanceSchedules,x.row,'TRANG_THAI',status,'Cập nhật trạng thái theo chu kỳ và nhật ký thực tế.');
    }else if(!cycle&&r.NGAY_KE_TIEP)queue(V22.SHEETS.maintenanceSchedules,x.row,'NGAY_KE_TIEP','','Xóa ngày kế tiếp không có ngày gốc và chu kỳ.')
  });
  const maxNum=(source,field,prefix)=>{let max=0;const re=new RegExp('^'+prefix+'(\\d+)$','i');source.forEach(x=>{const m=text(x.obj[field]).match(re);if(m)max=Math.max(max,Number(m[1]||0))});return max};
  const sequenceByEntity={};sequenceRows.forEach(x=>{const e=text(x.obj.ENTITY);if(e)sequenceByEntity[e]=x});
  [[V22.SHEETS.maintenanceLogs,'ID','NB'],[V22.SHEETS.maintenanceSchedules,'ID_LICH','LB']].forEach(spec=>{
    const source=spec[0]===V22.SHEETS.maintenanceLogs?logRows:scheduleRows,max=maxNum(source,spec[1],spec[2]),entry=sequenceByEntity[spec[0]];
    if(entry){const last=Number(entry.obj.LAST_NUMBER||0);if(last<max){queue(V22.SHEETS.sequences,entry.row,'LAST_NUMBER',max,'Cập nhật theo ID lớn nhất đang tồn tại.');if(getHeaders_(V22.SHEETS.sequences).indexOf('UPDATED_AT')>=0)queue(V22.SHEETS.sequences,entry.row,'UPDATED_AT',today_(),'Ghi thời điểm đồng bộ bộ đếm.')}}
    else if(getHeaders_(V22.SHEETS.sequences).length){totalChanges++;if(changes.length<MAX_RETURNED)changes.push({BANG_DU_LIEU:V22.SHEETS.sequences,DONG:'(mới)',TRUONG:'ENTITY/LAST_NUMBER',GIA_TRI_CU:'(thiếu)',GIA_TRI_MOI:spec[0]+' / '+max,LY_DO:'Tạo bộ đếm còn thiếu để cấp ID an toàn.'});if(mode==='REPAIR')appendObject_(V22.SHEETS.sequences,{ENTITY:spec[0],PREFIX:spec[2],LAST_NUMBER:max,UPDATED_AT:today_()})}
  });
  if(mode==='REPAIR'){
    // V84.16: đọc/ghi theo block (1 getValues + 1 setValues mỗi sheet) thay vì
    // getValues/setValues riêng lẻ cho từng dòng trong Object.keys(byRow).forEach.
    Object.keys(patches).forEach(function(sheet){
      const byRow=patches[sheet],sh=getSheet_(sheet),headers=getHeaders_(sheet),lastRow=sh.getLastRow();
      const rowNumbers=Object.keys(byRow).map(Number).filter(function(n){return n>0&&n<=lastRow});
      if(!rowNumbers.length){invalidateSheetV20_(sheet,true);return;}

      const minRow=Math.min.apply(null,rowNumbers),maxRow=Math.max.apply(null,rowNumbers);
      const range=sh.getRange(minRow,1,maxRow-minRow+1,headers.length);
      const values=range.getValues();

      rowNumbers.forEach(function(row){
        const n=Number(row),current=values[n-minRow];
        Object.keys(byRow[row]).forEach(function(field){
          const i=headers.indexOf(field);
          if(i>=0)current[i]=byRow[row][field];
        });
      });

      range.setValues(values);
      invalidateSheetV20_(sheet,true);
    });
  }
  const after=mode==='REPAIR'?maintenanceDataAuditV78_():null;
  return {ok:true,mode:mode,readOnly:mode!=='REPAIR',version:'V79-MAINTENANCE-DATA-REPAIR',generatedAt:nowStamp_(),elapsedMs:Date.now()-started,totalChanges:totalChanges,returnedChanges:changes.length,changes:changes,skipped:skipped,afterSummary:after?after.summary:null,afterIssues:after?after.issues:[]};
}

// ===== ID SEQUENCE =====
function maxExistingNumber_(sheetName, prefix) {
  const rows = readObjects_(sheetName);
  let max = 0;
  rows.forEach(r => {
    Object.keys(r).some(k => {
      const v = String(r[k] || '');
      if (v.indexOf(prefix) === 0) {
        const n = Number(v.slice(prefix.length));
        if (Number.isFinite(n)) max = Math.max(max, n);
        return true;
      }
      return false;
    });
  });
  return max;
}

// ===== SHEET HELPERS =====
// Chạy một lần trước khi triển khai V70. Hàm tạo ba Sheet danh mục độc lập
// và chuyển dữ liệu DANH_BA cũ theo LOAI nhưng giữ nguyên ID để không đứt liên kết.
function setupCatalogsV70() {
  const specs={};
  specs[V22.SHEETS.employees]=['ID','HO_TEN','TEN_GOI_KHAC','CHUC_VU','PHONG_BAN','DON_VI','DIEN_THOAI','EMAIL','DOI_PCCC','NHIEM_VU_PCCC','TRANG_THAI','GHI_CHU'];
  specs[V22.SHEETS.contractors]=['ID','DON_VI','HO_TEN','CHUC_VU','LINH_VUC','DIEN_THOAI','EMAIL','DIA_CHI','TRANG_THAI','GHI_CHU'];
  specs[V22.SHEETS.suppliers]=['ID','TEN_NHA_CUNG_CAP','MA_SO_THUE','NHOM_CUNG_CAP','SAN_PHAM_DICH_VU','NGUOI_LIEN_HE','CHUC_VU','DIEN_THOAI','EMAIL','DIA_CHI','DIEU_KHOAN_THANH_TOAN','SO_TAI_KHOAN','NGAN_HANG','TRANG_THAI','GHI_CHU'];
  const book=ss_();
  Object.keys(specs).forEach(name=>{
    let sh=book.getSheetByName(name);
    if(!sh)sh=book.insertSheet(name);
    if(sh.getLastRow()===0)sh.getRange(1,1,1,specs[name].length).setValues([specs[name]]);
    else{
      const current=sh.getRange(1,1,1,Math.max(1,sh.getLastColumn())).getValues()[0].map(v=>String(v||'').trim());
      const missing=specs[name].filter(h=>current.indexOf(h)<0);
      if(missing.length)sh.getRange(1,current.length+1,1,missing.length).setValues([missing]);
    }
  });
  const old=book.getSheetByName('DANH_BA');
  const moved={employees:0,contractors:0,suppliers:0};
  if(old){
    const rows=readObjects_('DANH_BA');
    rows.forEach(source=>{
      const type=norm_(source.LOAI),target=type==='NHA_THAU'?V22.SHEETS.contractors:(type==='NHA_CUNG_CAP'?V22.SHEETS.suppliers:V22.SHEETS.employees);
      if(findById_(target,'ID',source.ID))return;
      const x=Object.assign({},source);delete x.LOAI;
      if(target===V22.SHEETS.suppliers){x.TEN_NHA_CUNG_CAP=x.TEN_NHA_CUNG_CAP||x.DON_VI||x.HO_TEN||'';x.NGUOI_LIEN_HE=x.NGUOI_LIEN_HE||x.HO_TEN||''}
      appendObject_(target,x);
      if(target===V22.SHEETS.contractors)moved.contractors++;else if(target===V22.SHEETS.suppliers)moved.suppliers++;else moved.employees++;
    });
  }
  Object.keys(specs).forEach(name=>invalidateSheetV20_(name,true));
  PropertiesService.getScriptProperties().setProperty('V70_CATALOG_MIGRATED_AT',nowStamp_());
  return {ok:true,sheets:Object.keys(specs),moved:moved,legacySheetFound:!!old,version:V22.VERSION};
}

function ensureCatalogsV70_(){
  const properties=PropertiesService.getScriptProperties();
  if(properties.getProperty('V70_CATALOG_MIGRATED_AT'))return {ok:true,created:false,migrated:true};
  return setupCatalogsV70();
}

function ensureMaintenanceSchemaV76_(){
  const props=PropertiesService.getScriptProperties();
  if(props.getProperty('V76_SCHEMA_READY_AT')&&getHeaders_(V22.SHEETS.maintenanceLogs).indexOf('DON_VI_THUC_HIEN')>=0)return {ok:true,sheet:V22.SHEETS.maintenanceLogs,cached:true};
  const sheetName=V22.SHEETS.maintenanceLogs,sh=getSheet_(sheetName);
  const headers=getHeaders_(sheetName).slice();
  ['ID_LICH','NGAY_KE_TIEP','NGUOI_THUC_HIEN','DON_VI_THUC_HIEN'].forEach(function(name){
    if(headers.indexOf(name)>=0)return;
    headers.push(name);
    sh.getRange(1,headers.length).setValue(name);
  });
  invalidateSheetV20_(sheetName,false);

  let nextDateUpdated=0,employeeNameUpdated=0;
  if(!props.getProperty('V74_LOG_NEXT_DATE_BACKFILLED_AT')){
    nextDateUpdated=backfillMaintenanceLogNextDateV74_(sh,headers).updated;
    props.setProperty('V74_LOG_NEXT_DATE_BACKFILLED_AT',nowStamp_());
  }
  if(!props.getProperty('V76_LOG_EMPLOYEE_NAME_BACKFILLED_AT')){
    employeeNameUpdated=backfillMaintenanceLogEmployeeNameV76_(sh,headers).updated;
    props.setProperty('V76_LOG_EMPLOYEE_NAME_BACKFILLED_AT',nowStamp_());
  }
  props.setProperty('V76_SCHEMA_READY_AT',nowStamp_());
  return {ok:true,sheet:sheetName,nextDateUpdated:nextDateUpdated,employeeNameUpdated:employeeNameUpdated};
}

// V80: mở rộng dữ liệu Công việc hằng ngày cho người làm cùng và nhà thầu.
function ensureDailySchemaV80_(){
  const props=PropertiesService.getScriptProperties();
  const sheetName=V22.SHEETS.daily,sh=getSheet_(sheetName),headers=getHeaders_(sheetName).slice();
  // Các trường bổ sung phục vụ form chung; không xóa hoặc đổi các cột cũ.
  const required=['ID_NHA_THAU','CACH_THUC_HIEN','TIEN_DO','TRANG_THAI','NGAY_HOAN_THANH','GHI_CHU'];
  let added=0;
  required.forEach(function(name){
    if(headers.indexOf(name)>=0)return;
    headers.push(name);sh.getRange(1,headers.length).setValue(name);added++;
  });
  if(!added&&props.getProperty('V80_DAILY_SCHEMA_READY_AT'))return {ok:true,sheet:sheetName,cached:true};
  invalidateSheetV20_(sheetName,false);
  props.setProperty('V80_DAILY_SCHEMA_READY_AT',nowStamp_());
  return {ok:true,sheet:sheetName,added:added};
}

// V81: tách chi tiết đề xuất mua vật tư khỏi chi tiết mua thiết bị.
function ensureProposalSchemaV81_(){
  const props=PropertiesService.getScriptProperties();
  const sheetName=V22.SHEETS.proposalBuyMaterial;
  if(props.getProperty('V81_PROPOSAL_SCHEMA_READY_AT'))return {ok:true,sheet:sheetName,cached:true};
  let sh=ss_().getSheetByName(sheetName);
  const headers=['ID','ID_DE_XUAT','ID_VAT_TU','SO_LUONG','DON_GIA','THANH_TIEN','NHA_CUNG_CAP','MUC_DICH_LY_DO','TRANG_THAI','GHI_CHU'];
  if(!sh)sh=ss_().insertSheet(sheetName);
  const current=getHeaders_(sheetName);
  if(!current.length)sh.getRange(1,1,1,headers.length).setValues([headers]);
  else{
    const missing=headers.filter(h=>current.indexOf(h)<0);
    if(missing.length)sh.getRange(1,current.length+1,1,missing.length).setValues([missing]);
  }
  invalidateSheetV20_(sheetName,false);
  props.setProperty('V81_PROPOSAL_SCHEMA_READY_AT',nowStamp_());
  return {ok:true,sheet:sheetName,created:!current.length};
}

// V85 - CHO THUÊ: chuẩn hóa 2 bảng cũ và tạo bảng khách hàng tiềm năng.
// Không xóa dữ liệu cũ; chỉ bổ sung cột liên kết và cấp mã còn thiếu cho tầng.
const RENTAL_PROSPECT_HEADERS_V85 = Object.freeze([
  'ID','TEN_KHACH_HANG','NGUOI_LIEN_HE','DIEN_THOAI','EMAIL','ID_KHU_VUC_QUAN_TAM',
  'DIEN_TICH_QUAN_TAM','NGAY_TIEP_NHAN','NGAY_HEN_LIEN_HE','NGUON_KHACH_HANG',
  'TRANG_THAI','MUC_DO_TIEM_NANG','ID_NGUOI_PHU_TRACH','GHI_CHU'
]);

function ensureRentalSheetHeadersV85_(sheetName, requiredHeaders){
  let sh=ss_().getSheetByName(sheetName),created=false;
  if(!sh){
    sh=ss_().insertSheet(sheetName);
    sh.getRange(1,1,1,requiredHeaders.length).setValues([requiredHeaders]);
    created=true;
  }else{
    const current=getHeaders_(sheetName),missing=requiredHeaders.filter(h=>current.indexOf(h)<0);
    if(missing.length)sh.getRange(1,current.length+1,1,missing.length).setValues([missing]);
  }
  invalidateSheetV20_(sheetName,false);
  return {sheet:sheetName,created:created,headers:getHeaders_(sheetName)};
}

function ensureRentalSchemaV85_(){
  const floors=ensureRentalSheetHeadersV85_(V22.SHEETS.floors,[
    'ID','MA_TANG_KHU_VUC','TEN_TANG','DIEN_TICH','BAO_GIA','TRANG_THAI_SU_DUNG',
    'ID_KHACH_DANG_THUE','NGAY_BAT_DAU_THUE','NGAY_KET_THUC_THUE','GHI_CHU'
  ]);
  const tenants=ensureRentalSheetHeadersV85_(V22.SHEETS.tenants,[
    'ID','TEN_KHACH_THUE','ID_KHU_VUC','TANG_KHU_VUC','DIEN_TICH','NGUOI_LIEN_HE',
    'DIEN_THOAI','EMAIL','NGAY_BAT_DAU','NGAY_KET_THUC','TRANG_THAI','GHI_CHU'
  ]);
  const prospects=ensureRentalSheetHeadersV85_(V22.SHEETS.prospects,RENTAL_PROSPECT_HEADERS_V85);
  let floorIdsAssigned=0;
  const floorSh=getSheet_(V22.SHEETS.floors),headers=getHeaders_(V22.SHEETS.floors),idIndex=headers.indexOf('ID');
  if(idIndex>=0){
    const rows=readObjectsWithRow_(V22.SHEETS.floors);
    rows.forEach(entry=>{
      if(String(entry.obj.ID||'').trim())return;
      const id=nextId_(V22.SHEETS.floors,'TANG');
      floorSh.getRange(entry.row,idIndex+1).setValue(id);
      floorIdsAssigned++;
    });
    if(floorIdsAssigned)invalidateSheetV20_(V22.SHEETS.floors,true);
  }
  PropertiesService.getScriptProperties().setProperty('V85_RENTAL_SCHEMA_READY_AT',nowStamp_());
  return {ok:true,version:'V85-CHO-THUE',floors:floors,tenants:tenants,prospects:prospects,floorIdsAssigned:floorIdsAssigned};
}

function rentalAreaLabelV85_(area, fallback){
  area=area||{};
  const parts=[area.TANG,area.KHU_VUC].map(v=>String(v||'').trim()).filter(Boolean);
  return parts.length?parts.filter((v,i,a)=>a.findIndex(x=>norm_(x)===norm_(v))===i).join(' · '):String(fallback||area.ID||'');
}

function normalizeRentalRecordV85_(sheetName, record){
  const x=Object.assign({},record||{});
  if(sheetName===V22.SHEETS.tenants){
    if(!String(x.TEN_KHACH_THUE||'').trim())throw new Error('TEN_KHACH_THUE_BAT_BUOC');
    if(x.ID_KHU_VUC){
      const area=findById_(V22.SHEETS.buildingAreas,'ID',x.ID_KHU_VUC);
      if(area)x.TANG_KHU_VUC=rentalAreaLabelV85_(area,x.ID_KHU_VUC);
    }
    if(!String(x.TRANG_THAI||'').trim())x.TRANG_THAI='Đang thuê';
  }
  if(sheetName===V22.SHEETS.prospects){
    if(!String(x.TEN_KHACH_HANG||'').trim())throw new Error('TEN_KHACH_HANG_BAT_BUOC');
    if(!String(x.NGUOI_LIEN_HE||'').trim())throw new Error('NGUOI_LIEN_HE_BAT_BUOC');
    x.NGAY_TIEP_NHAN=dateOnly_(x.NGAY_TIEP_NHAN||today_())||today_();
    if(!String(x.TRANG_THAI||'').trim())x.TRANG_THAI='Mới tiếp cận';
    if(!String(x.MUC_DO_TIEM_NANG||'').trim())x.MUC_DO_TIEM_NANG='Trung bình';
  }
  return x;
}

// Tự điền NGAY_KE_TIEP cho dữ liệu cũ còn trống bằng chu kỳ lịch;
// nếu chưa có lịch thì dùng chu kỳ mặc định của hạng mục.
function backfillMaintenanceLogNextDateV74_(sh,headers){
  const lastRow=sh.getLastRow();
  if(lastRow<2)return {updated:0};
  const values=sh.getRange(2,1,lastRow-1,headers.length).getValues();
  const idx={
    date:headers.indexOf('NGAY_THUC_HIEN'),next:headers.indexOf('NGAY_KE_TIEP'),
    schedule:headers.indexOf('ID_LICH'),area:headers.indexOf('ID_KHU_VUC'),item:headers.indexOf('ID_HANG_MUC')
  };
  if(idx.date<0||idx.next<0)return {updated:0};
  const schedules=readObjects_(V22.SHEETS.maintenanceSchedules),items=indexBy_(readObjects_(V22.SHEETS.maintenanceItems),'ID_HANG_MUC');
  const byId=indexBy_(schedules,'ID_LICH'),byPair={};
  schedules.forEach(function(s){byPair[String(s.ID_KHU_VUC||'')+'|'+String(s.ID_HANG_MUC||'')]=s});
  let updated=0;
  values.forEach(function(row){
    if(dateOnly_(row[idx.next]))return;
    const performed=dateOnly_(row[idx.date]);
    if(!performed)return;
    const scheduleId=idx.schedule>=0?String(row[idx.schedule]||''):'';
    const areaId=idx.area>=0?String(row[idx.area]||''):'';
    const itemId=idx.item>=0?String(row[idx.item]||''):'';
    const schedule=byId[scheduleId]||byPair[areaId+'|'+itemId]||{};
    const item=items[itemId]||{};
    const cycle=parseInt(schedule.CHU_KY_NGAY||item.CHU_KY_MAC_DINH,10);
    if(!Number.isFinite(cycle)||cycle<=0)return;
    row[idx.next]=addDays_(performed,cycle);
    updated++;
  });
  if(updated){
    sh.getRange(2,idx.next+1,values.length,1).setValues(values.map(function(row){return [row[idx.next]||'']}));
    invalidateSheetV20_(V22.SHEETS.maintenanceLogs,false);
  }
  return {updated:updated};
}

// Điền tên nhân viên theo ID_NGUOI_THUC_HIEN và chuẩn hóa khoảng trắng của ID.
function backfillMaintenanceLogEmployeeNameV76_(sh,headers){
  const lastRow=sh.getLastRow();
  if(lastRow<2)return {updated:0};
  const idIndex=headers.indexOf('ID_NGUOI_THUC_HIEN'),nameIndex=headers.indexOf('NGUOI_THUC_HIEN');
  if(idIndex<0||nameIndex<0)return {updated:0};
  const employees={};
  readObjects_(V22.SHEETS.employees).forEach(function(e){
    const id=String(e.ID||'').trim();if(!id)return;
    employees[id]=String(e.HO_TEN||e.TEN_GOI_KHAC||e.TEN_NHAN_VIEN||'').trim();
  });
  const values=sh.getRange(2,1,lastRow-1,headers.length).getValues();
  let updated=0;
  values.forEach(function(row){
    const id=String(row[idIndex]||'').trim(),name=employees[id]||'';
    if(!name||String(row[nameIndex]||'').trim()===name)return;
    row[nameIndex]=name;updated++;
  });
  if(updated){
    sh.getRange(2,nameIndex+1,values.length,1).setValues(values.map(function(row){return [row[nameIndex]||'']}));
    invalidateSheetV20_(V22.SHEETS.maintenanceLogs,false);
  }
  return {updated:updated};
}

function catalogSheetV70_(type){
  type=norm_(type);
  if(type==='NHA_THAU')return V22.SHEETS.contractors;
  if(type==='NHA_CUNG_CAP')return V22.SHEETS.suppliers;
  return V22.SHEETS.employees;
}
function catalogPrefixV70_(type){type=norm_(type);return type==='NHA_THAU'?'NT':(type==='NHA_CUNG_CAP'?'NCC':'NV')}

function normalizeSheetValue_(v) {
  if (v instanceof Date) return Utilities.formatDate(v, V22.TZ, 'yyyy-MM-dd');
  return v;
}

function archiveAndDeleteById_(sheetName, idField, id, user, reason) {
  const rows = readObjectsWithRow_(sheetName);
  const found = rows.find(x => String(x.obj[idField] || '') === String(id));
  if (!found) throw new Error('ROW_NOT_FOUND:' + sheetName + ':' + id);

  const archive = {
    ID_AUDIT: nextId_(V22.SHEETS.audit, 'AUD'),
    NGAY_XU_LY: today_(),
    SHEET_NGUON: sheetName,
    ID_GOC: id,
    LOAI_LOI: reason || 'DELETE',
    LY_DO: 'Lưu vết trước khi xóa bởi V22 backend; user=' + ((user && user.email) || ''),
    DATA_GOC: JSON.stringify(found.obj),
    TRANG_THAI: 'Đã lưu trữ'
  };
  appendObject_(V22.SHEETS.audit, archive);
  getSheet_(sheetName).deleteRow(found.row);
  invalidateSheetV20_(sheetName,true);
}

function indexBy_(rows, field) {
  const out = {};
  rows.forEach(r => { if (r[field]) out[String(r[field])] = r; });
  return out;
}

// ===== UTILITIES =====
function ok_(data) { return {ok:true, data:data}; }

// Tên đăng nhập hiện lưu trong cột EMAIL_DANG_NHAP. Chuẩn hóa ở một điểm
// để việc đăng nhập/kiểm tra trùng không phụ thuộc chữ hoa, chữ thường hay
// khoảng trắng thừa ở đầu/cuối.
function normalizeLoginName_(s) { return String(s ?? '').trim().toLowerCase(); }
function normalizeEmail_(s) { return normalizeLoginName_(s); }
function norm_(s) {
  return String(s || '').trim().toUpperCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g,'')
    .replace(/Đ/g,'D').replace(/đ/g,'d')
    .replace(/\s+/g,'_');
}
function truthy_(v) {
  const s = norm_(v);
  return v === true || v === 1 || s === 'TRUE' || s === '1' || s === 'YES' || s === 'CO' || s === 'X';
}
function isActive_(v) {
  const s = norm_(v);
  return ['HOAT_DONG','DANG_HOAT_DONG','SU_DUNG','ACTIVE','TRUE','1'].indexOf(s) >= 0;
}
function isCompletedStatus_(v) {
  const s = norm_(v);
  return ['HOAN_THANH','DA_HOAN_THANH','DA_XONG','COMPLETED','DONE'].indexOf(s) >= 0;
}
// Chu kỳ bảo trì không hợp lệ phải để trống để giao diện báo THIẾU CHU KỲ;
// tuyệt đối không tự thay bằng 1 ngày.
function maintenanceCycleV77_() {
  for (let i=0;i<arguments.length;i++) {
    const n=parseInt(arguments[i],10);
    if (Number.isFinite(n) && n>0) return n;
  }
  return null;
}
function nonNegativeInt_(v, fallback) {
  const n = parseInt(v,10);
  return Number.isFinite(n) && n >= 0 ? n : (fallback || 0);
}
function nowStamp_() { return Utilities.formatDate(new Date(), V22.TZ, 'yyyy-MM-dd HH:mm:ss'); }
function today_() { return Utilities.formatDate(new Date(), V22.TZ, 'yyyy-MM-dd'); }

function dateOnly_(value) {
  if (!value) return '';
  if (value instanceof Date) return Utilities.formatDate(value, V22.TZ, 'yyyy-MM-dd');
  const s = String(value).trim();
  let m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (m) return m[1]+'-'+m[2]+'-'+m[3];
  m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (m) return m[3]+'-'+String(m[2]).padStart(2,'0')+'-'+String(m[1]).padStart(2,'0');
  const d = new Date(s);
  if (!isNaN(d.getTime())) return Utilities.formatDate(d, V22.TZ, 'yyyy-MM-dd');
  return '';
}

function addDays_(iso, days) {
  const s = dateOnly_(iso);
  if (!s) return '';
  const parts = s.split('-').map(Number);
  const d = new Date(parts[0], parts[1]-1, parts[2], 12,0,0);
  d.setDate(d.getDate() + Number(days || 0));
  return Utilities.formatDate(d, V22.TZ, 'yyyy-MM-dd');
}

function daysBetween_(fromIso, toIso) {
  const a = dateOnly_(fromIso), b = dateOnly_(toIso);
  if (!a || !b) return null;
  const ap = a.split('-').map(Number), bp = b.split('-').map(Number);
  const au = Date.UTC(ap[0],ap[1]-1,ap[2]);
  const bu = Date.UTC(bp[0],bp[1]-1,bp[2]);
  return Math.round((bu-au)/86400000);
}

function alertForDate_(dueIso, warningDays) {
  const due = dateOnly_(dueIso);
  if (!due) return {days:null,label:'CHƯA CÓ LỊCH'};
  const days = daysBetween_(today_(), due);
  const w = warningDays === undefined ? 7 : nonNegativeInt_(warningDays,7);
  let label = 'CÒN LỊCH';
  if (days < 0) label = 'TRỄ LỊCH';
  else if (days === 0) label = 'ĐẾN HẠN HÔM NAY';
  else if (days <= w) label = 'SẮP ĐẾN HẠN';
  return {days:days,label:label};
}


function legacyVerifyUser_(user) {
  const emp = user.employeeId ? (findById_(V22.SHEETS.employees,'ID',user.employeeId) || {}) : {};
  return {ok:true,user:{
    ID:user.id, ID_NHAN_VIEN:user.employeeId, EMAIL_DANG_NHAP:user.email,
    EMAIL:user.email, ID_VAI_TRO:user.roleId, VAI_TRO:user.roleName,
    SUPER_ADMIN:!!user.isSuperAdmin, employee:emp
  }};
}

function legacyCoreBootstrap_(user) {
  requirePermission_(user,MODULES.DASHBOARD,'XEM');
  const employees = readObjects_(V22.SHEETS.employees);
  const contractors = readObjects_(V22.SHEETS.contractors);
  const work = legacyWorkRows_();
  const daily = legacyDailyRows_();
  return {
    ok:true, coreOk:true, serverTime:today_(),
    employees:employees, contractors:contractors, work:work, daily:daily,
    dashboard:legacyDashboard_(work)
  };
}

function legacySupplementalBootstrap_(user) {
  requirePermission_(user,MODULES.DASHBOARD,'XEM');
  const contacts = readObjects_(V22.SHEETS.employees);
  return {
    ok:true, errors:[],
    employeesAll:contacts,
    employeeAccess:legacyEmployeeAccess_(),
    proposals:legacyProposalList_(),
    users:legacyUsers_(),
    asset:legacyAssetBootstrap_(),
    modules:{
      maintenanceLog:legacyMaintenanceLogs_(),
      maintenanceCycles:readObjects_(V22.SHEETS.maintenanceItems).map(x=>({
        ID:x.ID_HANG_MUC,HANG_MUC:x.TEN_HANG_MUC,CHU_KY_NGAY:x.CHU_KY_MAC_DINH,
        DON_VI_CHU_KY:'Ngày',TRANG_THAI:x.TRANG_THAI
      })),
      maintenancePlan:legacyMaintenancePlans_(),
      maintenanceSchedules:getMaintenanceSchedulesComputed_(),
      proposalBuy:legacyGetModuleDataUnsafe_('DE_XUAT_MUA'),
      proposalBuyMaterial:legacyGetModuleDataUnsafe_(V22.SHEETS.proposalBuyMaterial),
      proposalDispose:legacyGetModuleDataUnsafe_('DE_XUAT_THANH_LY'),
      proposalMaintenance:legacyGetModuleDataUnsafe_('DE_XUAT_BAO_TRI'),
      equipment:legacyGetModuleDataUnsafe_('THIET_BI'),
      warehouseDevice:legacyGetModuleDataUnsafe_('THIET_BI').filter(x=>norm_(x.TRANG_THAI)==='TRONG KHO'||norm_(x.TRANG_THAI)==='TRONG_KHO'),
      allocation:[],
      recovery:legacyGetModuleDataUnsafe_('THU_HOI'),
      materialWarehouse:legacyWarehouse_(),
      contracts:legacyGetModuleDataUnsafe_('HOP_DONG'),
      tenants:legacyGetModuleDataUnsafe_('KHACH_THUE'),
      floors:legacyGetModuleDataUnsafe_('QUAN_LY_TANG'),
      employees:contacts,
      contractors:readObjects_(V22.SHEETS.contractors),
      suppliers:readObjects_(V22.SHEETS.suppliers),
      buildingAreas:readObjects_(V22.SHEETS.buildingAreas),
      maintenanceItems:readObjects_(V22.SHEETS.maintenanceItems),
      maintenanceSchedulesRaw:readObjects_(V22.SHEETS.maintenanceSchedules),
      roles:readObjects_(V22.SHEETS.roles),
      permissions:readObjects_(V22.SHEETS.permissions),
      auditArchive:readObjects_(V22.SHEETS.audit)
    },
    systemAudit:systemAudit_(),
    systemConfig:{version:V22.VERSION,databaseId:V22.SPREADSHEET_ID,timezone:V22.TZ,mode:'NO LOGIN TEST'},
    preloadedAt:nowStamp_()
  };
}

function workIsCompleted_(r) {
  if (!r) return false;
  return isCompletedStatus_(r.TRANG_THAI) || isCompletedStatus_(r.KET_QUA);
}

// Giữ cùng nghĩa với bộ lọc “Đang xử lý” ở màn hình Công việc để số trên
// lớp khởi động luôn khớp với các dòng được mở sau khi người dùng bấm nút.
function workIsProcessing_(r) {
  const state=norm_(r&&r.TRANG_THAI);
  return /(^|_)DANG_(XU_LY|THUC_HIEN)(_|$)/.test(state);
}

// V138/V140 — các hàm phụ dùng chung cho legacyDashboard_ (xem quy tắc ở đó).
// V139: so khớp nguyên giá trị (không so chuỗi con) để "Chưa hoàn thành"
// không bị tính là đã xong; dùng chung danh sách với isCompletedStatus_.
function workIsDoneForTableV138_(r){
  return workDoneV148_(r);
}
function workDaysLeftV138_(r){
  const raw=String(r&&r.SO_NGAY_CON_LAI!=null?r.SO_NGAY_CON_LAI:'').trim().replace(',','.');
  if(raw!==''&&isFinite(Number(raw)))return Math.trunc(Number(raw));
  const d=dateOnly_(r&&r.DEADLINE);return d?daysBetween_(today_(),d):null;
}
// V147 — cùng quy tắc với bảng Công việc (index.html):
//   2 ô trạng thái chia trọn việc chưa xong: Đang xử lý / Chưa thực hiện (còn lại)
//   3 ô hạn là cảnh báo chồng lên: Quá hạn / Đến hạn hôm nay / Sắp đến hạn (1–3 ngày)
function legacyDashboard_(rows) {
  let done=0,doing=0,overdue=0,dueToday=0,dueSoon=0,notStarted=0;
  const urgent=[];
  (rows||[]).forEach(r=>{
    if(workIsDoneForTableV138_(r)){done++;return;}
    if(workIsProcessing_(r))doing++;else notStarted++;
    const left=workDaysLeftV138_(r);
    if(left!==null&&left<0){overdue++;urgent.push(r);}
    else if(left===0){dueToday++;urgent.push(r);}
    else if(left!==null&&left>=1&&left<=3){dueSoon++;urgent.push(r);}
  });
  urgent.sort((a,b)=>String(a.DEADLINE||'').localeCompare(String(b.DEADLINE||'')));
  return {total:(rows||[]).length,done:done,open:(rows||[]).length-done,doing:doing,overdue:overdue,dueToday:dueToday,dueSoon:dueSoon,pending:notStarted,notStarted:notStarted,urgent:urgent.slice(0,8)};
}

// ============================================================================
// V141 — BỎ TRẠNG THÁI "TẠM HOÃN"
// Công việc (CONG_VIEC) và Công việc hằng ngày (CVHN) chỉ còn 3 trạng thái:
// Chưa thực hiện / Đang thực hiện / Hoàn thành. Mọi giá trị "Tạm hoãn" cũ được
// hiểu và ghi thành "Chưa thực hiện" (khi đọc, khi lưu, và bằng hàm dọn Sheet).
// ============================================================================
function normalizeWorkStateV141_(value){
  return norm_(value)==='TAM_HOAN'?'Chưa thực hiện':value;
}
function normalizeWorkRecordV141_(record){
  if(record&&Object.prototype.hasOwnProperty.call(record,'TRANG_THAI'))record.TRANG_THAI=normalizeWorkStateV141_(record.TRANG_THAI);
  return record;
}
// Chạy MỘT LẦN trong trình soạn thảo Apps Script để đổi hẳn dữ liệu trên Sheet.
function migrateTamHoanToChuaThucHienV141(){
  const lock=LockService.getScriptLock();lock.waitLock(30000);
  try{
    const result={};
    [V22.SHEETS.work,V22.SHEETS.daily].forEach(function(sheetName){
      const sh=getSheet_(sheetName),lastRow=sh.getLastRow(),headers=getHeaders_(sheetName),col=headers.indexOf('TRANG_THAI')+1;
      if(lastRow<2||col<1){result[sheetName]=0;return}
      const range=sh.getRange(2,col,lastRow-1,1),values=range.getValues();let changed=0;
      values.forEach(function(row){if(norm_(row[0])==='TAM_HOAN'){row[0]='Chưa thực hiện';changed++}});
      if(changed){range.setValues(values);invalidateSheetV20_(sheetName,true);try{v124InvalidateDomainsForSheet_(sheetName)}catch(ignore){}}
      result[sheetName]=changed;
    });
    console.log('V141 đã đổi Tạm hoãn -> Chưa thực hiện:',JSON.stringify(result));
    return result;
  }finally{lock.releaseLock()}
}

// ============================================================================
// V148 — CÔNG VIỆC BỎ CỘT "KẾT QUẢ" (KET_QUA)
// Hoàn thành chỉ còn theo Trạng thái. Dòng cũ có Kết quả "Đã xong" được hiểu
// là Trạng thái "Hoàn thành"; mỗi lần lưu, KET_QUA được xóa trống để Trạng thái
// là nguồn duy nhất. CVHN (công việc hằng ngày) vẫn giữ Kết quả như cũ.
// ============================================================================
function normalizeWorkResultV148_(x){
  if(!x)return x;
  if(isCompletedStatus_(x.KET_QUA)&&!isCompletedStatus_(x.TRANG_THAI))x.TRANG_THAI='Hoàn thành';
  delete x.KET_QUA;
  return x;
}
function workDoneV148_(r){return isCompletedStatus_(r&&r.TRANG_THAI)}
// Chạy MỘT LẦN trong trình soạn thảo: chuyển "Đã xong" sang Trạng thái rồi
// xóa trống cột KET_QUA của CONG_VIEC (giữ tiêu đề cột, không xóa cột).
function migrateWorkRemoveKetQuaV148(){
  const lock=LockService.getScriptLock();lock.waitLock(30000);
  try{
    const sheetName=V22.SHEETS.work,sh=getSheet_(sheetName),lastRow=sh.getLastRow(),headers=getHeaders_(sheetName);
    const kq=headers.indexOf('KET_QUA'),tt=headers.indexOf('TRANG_THAI');
    if(lastRow<2||kq<0||tt<0){console.log('V148: không có gì để đổi');return {changedStatus:0,cleared:0}}
    const range=sh.getRange(2,1,lastRow-1,headers.length),values=range.getValues();let changedStatus=0,cleared=0;
    values.forEach(function(row){
      if(isCompletedStatus_(row[kq])&&!isCompletedStatus_(row[tt])){row[tt]='Hoàn thành';changedStatus++}
      if(String(row[kq]||'')!==''){row[kq]='';cleared++}
    });
    if(changedStatus||cleared){range.setValues(values);invalidateSheetV20_(sheetName,true)}
    const result={changedStatus:changedStatus,cleared:cleared};
    console.log('V148 CONG_VIEC:',JSON.stringify(result));return result;
  }finally{lock.releaseLock()}
}

// ============================================================================
// V157 — CỘT "SỐ NGÀY" BẢNG CÔNG VIỆC (thay cho "Còn lại" khi hiển thị)
// Một hàm DUY NHẤT tính các trường thời gian cho 1 dòng Công việc, dùng chung
// cho legacyWorkRows_ (bảng) và v89DashboardWorkRow_ (khởi động).
//  • SO_NGAY_CON_LAI = Hạn − Hôm nay  → GIỮ NGUYÊN, chỉ dùng nội bộ cho Cảnh báo,
//    5 nút cảnh báo, màu dòng, email. KHÔNG hiển thị ở cột nữa.
//  • SO_NGAY (hiển thị, đếm mọi ngày, giao và xong cùng ngày = 0):
//      Hoàn thành              → Ngày hoàn thành − Ngày giao
//      Chưa xong, đã quá hạn   → Hôm nay − Hạn hoàn thành  (= số ngày quá hạn)
//      Chưa xong, chưa quá hạn → Hôm nay − Ngày giao        (= số ngày đã làm)
//  • __SO_NGAY_LOAI / __SO_NGAY_GHI_CHU: loại + chú thích cho giao diện (tô màu,
//    chữ khi rê chuột); tiền tố "__" để không bị đưa vào file Xuất dữ liệu.
// ============================================================================
function workTimingV157_(x,todayIso){
  const giao=dateOnly_(x.NGAY_GIAO),han=dateOnly_(x.DEADLINE),xong=dateOnly_(x.NGAY_HOAN_THANH),done=workDoneV148_(x);
  const diff=han?daysBetween_(todayIso,han):null;
  x.SO_NGAY_CON_LAI=diff;
  if(done) x.CANH_BAO='HOÀN THÀNH';
  else if(!han) x.CANH_BAO='CHƯA CÓ DEADLINE';
  else if(diff<0) x.CANH_BAO='QUÁ HẠN';
  else if(diff===0) x.CANH_BAO='ĐẾN HẠN HÔM NAY';
  else if(diff<=3) x.CANH_BAO='SẮP ĐẾN HẠN';
  else x.CANH_BAO='BÌNH THƯỜNG';
  let n=null,kind='',note='';
  if(done){
    if(!xong){kind='missing';note='Đã hoàn thành nhưng chưa có Ngày hoàn thành'}
    else if(!giao){kind='missing';note='Thiếu Ngày giao'}
    else{
      n=daysBetween_(giao,xong);
      if(n<0){n=null;kind='bad';note='Ngày hoàn thành trước Ngày giao'}
      else if(han&&xong>han){kind='done-late';note='Hoàn thành sau '+n+' ngày · trễ hạn '+daysBetween_(han,xong)+' ngày'}
      else{kind='done';note='Hoàn thành sau '+n+' ngày'}
    }
  }else if(han&&diff<0){n=-diff;kind='overdue';note='Quá hạn '+n+' ngày'}
  else if(giao){
    n=daysBetween_(giao,todayIso);
    if(n<0){n=null;kind='future';note='Ngày giao ở tương lai'}
    else{kind='doing';note='Đã làm '+n+' ngày'+(han?(diff===0?' · hạn hôm nay':' · còn '+diff+' ngày tới hạn'):'')}
  }else{kind='missing';note='Thiếu Ngày giao'}
  x.SO_NGAY=n;x.__SO_NGAY_LOAI=kind;x.__SO_NGAY_GHI_CHU=note;
  return x;
}
// V157 — chuyển Trạng thái sang Hoàn thành mà Ngày hoàn thành trống → tự điền
// hôm nay. Bản ghi gửi lên thiếu hẳn trường này (lưu từng phần) thì giữ ngày
// đang có trên Sheet, chỉ điền khi Sheet cũng trống.
function autoFillWorkDoneDateV157_(x){
  if(!x||!isCompletedStatus_(x.TRANG_THAI))return x;
  if(Object.prototype.hasOwnProperty.call(x,'NGAY_HOAN_THANH')){
    if(!dateOnly_(x.NGAY_HOAN_THANH))x.NGAY_HOAN_THANH=today_();
    return x;
  }
  const id=String(x.ID||'').trim();
  const old=id?findById_(V22.SHEETS.work,'ID',id):null;
  if(!old||!dateOnly_(old.NGAY_HOAN_THANH))x.NGAY_HOAN_THANH=today_();
  return x;
}

function legacyWorkRows_() {
  const contacts=indexBy_(readObjects_(V22.SHEETS.employees),'ID');
  // V119 — today_() gọi Utilities.formatDate (API Apps Script, không phải JS
  // thuần) nhưng trước đây bị gọi lại bên trong .map() cho MỖI dòng dù kết
  // quả luôn giống nhau trong cùng 1 request — với sheet nhiều dòng, đây là
  // hàng trăm/nghìn lệnh gọi API thừa, cộng dồn thành chậm rõ rệt. Tính 1 lần.
  const todayIso=today_();
  return readObjects_(V22.SHEETS.work).map(r=>{
    const x=normalizeWorkResultV148_(normalizeWorkRecordV141_(Object.assign({},r)));
    x.NGUOI_GIAO=(contacts[x.ID_NGUOI_GIAO]||{}).HO_TEN||x.ID_NGUOI_GIAO||'';
    x.NGUOI_THUC_HIEN=(contacts[x.ID_NGUOI_THUC_HIEN]||{}).HO_TEN||x.DON_VI_THUC_HIEN||x.ID_NGUOI_THUC_HIEN||'';
    return workTimingV157_(x,todayIso);
  });
}

function legacyDailyRows_() {
  const contacts=indexBy_(readObjects_(V22.SHEETS.employees),'ID');
  const contractors=indexBy_(readObjects_(V22.SHEETS.contractors),'ID');
  return mapDailyRowsV82_(readObjects_(V22.SHEETS.daily),contacts,contractors);
}

function mapDailyRowsV82_(records,contacts,contractors){
  // V119 — cùng lỗi như legacyWorkRows_: today_() từng bị gọi lại mỗi dòng.
  const todayIso=today_();
  return (records||[]).map(r=>{
    const x=normalizeWorkRecordV141_(Object.assign({},r));
    x.NGUOI_GIAO=(contacts[x.ID_NGUOI_GIAO]||{}).HO_TEN||x.ID_NGUOI_GIAO||'';
    x.NGUOI_THUC_HIEN=(contacts[x.ID_NGUOI_THUC_HIEN]||{}).HO_TEN||x.DON_VI_THUC_HIEN||x.ID_NGUOI_THUC_HIEN||'';
    const coTokens=String(x.NGUOI_LAM_CUNG||'').split(/[,+;\n]/).map(v=>String(v||'').trim()).filter(Boolean);
    x.NGUOI_LAM_CUNG=coTokens.map(token=>{
      const person=contacts[token];
      return person ? (person.HO_TEN||person.TEN_GOI_KHAC||token) : token;
    }).join(', ');
    if(x.ID_NHA_THAU){const contractor=contractors[String(x.ID_NHA_THAU).trim()];if(contractor)x.DON_VI_THUC_HIEN=contractor.DON_VI||contractor.HO_TEN||x.ID_NHA_THAU;}
    const workDate=dateOnly_(x.NGAY);
    const today=todayIso;
    if(workIsCompleted_(x)) x.CANH_BAO='HOÀN THÀNH';
    else if(!workDate) x.CANH_BAO='CHƯA CÓ NGÀY';
    else if(workDate<today) x.CANH_BAO='CÔNG VIỆC CŨ CHƯA XONG';
    else if(workDate===today) x.CANH_BAO='TRONG NGÀY';
    else x.CANH_BAO='CHƯA ĐẾN NGÀY';
    return x;
  });
}

// Chỉ đọc phần cuối bảng Công việc hằng ngày cho Tổng quan. Dữ liệu được
// ghi nối tiếp nên các dòng cuối là dữ liệu mới nhất; trang chi tiết vẫn đọc đủ.
function legacyDailyRecentV82_(limit){
  const sh=getSheet_(V22.SHEETS.daily),headers=getHeaders_(V22.SHEETS.daily),lastRow=sh.getLastRow();
  if(lastRow<2||!headers.length)return [];
  const count=Math.min(Math.max(1,Number(limit)||60),lastRow-1),start=lastRow-count+1;
  const values=sh.getRange(start,1,count,headers.length).getValues(),records=[];
  values.forEach(row=>{const obj={};let has=false;headers.forEach((h,i)=>{if(h){obj[h]=normalizeSheetValue_(row[i]);if(row[i]!==''&&row[i]!==null)has=true}});if(has)records.push(obj)});
  const contacts=indexBy_(readObjects_(V22.SHEETS.employees),'ID'),contractors=indexBy_(readObjects_(V22.SHEETS.contractors),'ID');
  return mapDailyRowsV82_(records,contacts,contractors);
}

function legacyMaintenanceLogs_() {
  const schedules=readObjects_(V22.SHEETS.maintenanceSchedules);
  const employees={};readObjects_(V22.SHEETS.employees).forEach(function(e){const id=String(e.ID||'').trim();if(id)employees[id]=e});
  const sm={}; schedules.forEach(s=>sm[String(s.ID_KHU_VUC)+'|'+String(s.ID_HANG_MUC)]=s);
  return readObjects_(V22.SHEETS.maintenanceLogs).map(r=>{
    const x=Object.assign({},r);
    const s=sm[String(x.ID_KHU_VUC)+'|'+String(x.ID_HANG_MUC)]||{};
    x.KHU_VUC=x.KHU_VUC_SNAPSHOT||'';
    x.TEN_CONG_TY=x.TEN_CONG_TY_SNAPSHOT||'';
    x.HANG_MUC=x.HANG_MUC_SNAPSHOT||'';
    const employee=employees[String(x.ID_NGUOI_THUC_HIEN||'').trim()]||{};
    x.NGUOI_THUC_HIEN=employee.HO_TEN||employee.TEN_GOI_KHAC||employee.TEN_NHAN_VIEN||x.NGUOI_THUC_HIEN||'Chưa khai báo';
    x.CHU_KY_NGAY=s.CHU_KY_NGAY||'';
    const storedNext=dateOnly_(x.NGAY_KE_TIEP)||'';
    const latest=String(s.ID_NHAT_KY_GAN_NHAT||'')===String(x.ID||'');
    x.NGAY_KE_TIEP=latest?(dateOnly_(s.NGAY_KE_TIEP)||storedNext):storedNext;
    x.CANH_BAO=maintenanceLogAlertV77_(x.NGAY_KE_TIEP,x.NGAY_THUC_HIEN,latest);
    return x;
  });
}

function legacyGetModuleData_(user,sheetName) {
  const module=legacyModuleForSheet_(sheetName);
  if(module) requirePermission_(user,module,'XEM');
  return legacyGetModuleDataUnsafe_(sheetName);
}

function legacyGetModuleDataUnsafe_(sheetName) {
  sheetName=String(sheetName||'');
  if(sheetName==='NHAT_KY_BAO_TRI') return legacyMaintenanceLogs_();
  if(sheetName==='KE_HOACH_BAO_TRI') return legacyMaintenancePlans_();
  if(sheetName==='KTDK') throw new Error('INSPECTION_MODULE_REMOVED_V80');
  if(sheetName==='THIET_BI')return assetWarehouseRelationBundleV83_().devices;
  if(sheetName==='CAP_PHAT')return [];
  if(sheetName==='THU_HOI')return assetWarehouseRelationBundleV83_().recoveries;
  let rows=readObjects_(sheetName);
  const areaSheets=['THIET_BI','THU_HOI','DE_XUAT_BAO_TRI','KHACH_THUE','KHACH_HANG_TIEM_NANG'];
  let areaMap={};
  if(areaSheets.indexOf(sheetName)>=0){try{areaMap=indexBy_(readObjects_(V22.SHEETS.buildingAreas),'ID')}catch(e){areaMap={}}}
  const areaLabel=(id,fallback)=>maintenanceAreaLabel_(areaMap[String(id||'')]||{},fallback||id||'');
  if(sheetName==='NGUOI_SU_DUNG') return legacyUsers_();
  if(sheetName==='DE_XUAT_BAO_TRI') rows=rows.map(x=>Object.assign({},x,{KHU_VUC:areaLabel(x.ID_KHU_VUC,x.KHU_VUC)}));
  if(sheetName==='KHACH_THUE') rows=rows.map(x=>Object.assign({},x,{TANG_KHU_VUC_HIEN_THI:areaLabel(x.ID_KHU_VUC||x.TANG_KHU_VUC,x.TANG_KHU_VUC)}));
  if(sheetName===V22.SHEETS.prospects){
    const employees=indexBy_(readObjects_(V22.SHEETS.employees),'ID');
    rows=rows.map(x=>{
      const area=areaMap[String(x.ID_KHU_VUC_QUAN_TAM||'')]||{};
      const followUp=dateOnly_(x.NGAY_HEN_LIEN_HE),days=followUp?daysBetween_(today_(),followUp):null;
      let alert='CHƯA HẸN';
      if(days!==null){if(days<0)alert='QUÁ HẸN';else if(days===0)alert='ĐẾN HẠN HÔM NAY';else if(days<=7)alert='SẮP ĐẾN HẠN';else alert='ĐANG THEO DÕI'}
      return Object.assign({},x,{
        KHU_VUC_QUAN_TAM_HIEN_THI:areaLabel(x.ID_KHU_VUC_QUAN_TAM,x.TANG_KHU_VUC_QUAN_TAM),
        NGUOI_PHU_TRACH_HIEN_THI:(employees[String(x.ID_NGUOI_PHU_TRACH||'')]||{}).HO_TEN||x.ID_NGUOI_PHU_TRACH||'',
        SO_NGAY_DEN_HAN:days===null?'':days,
        CANH_BAO:alert
      });
    });
  }
  if(sheetName==='DE_XUAT_MUA'){
    let materials={};try{materials=indexBy_(readObjects_(V22.SHEETS.materials),'ID')}catch(e){materials={}}
    let suppliers={};try{suppliers=indexBy_(readObjects_(V22.SHEETS.suppliers),'ID')}catch(e){suppliers={}}
    let proposals={};try{proposals=indexBy_(readObjects_(V22.SHEETS.proposals),'ID')}catch(e){proposals={}}
    let employees={};try{employees=indexBy_(readObjects_(V22.SHEETS.employees),'ID')}catch(e){employees={}}
    rows=rows.map(x=>{
      const material=materials[String(x.ID_DANH_MUC||'')]||{},master=proposals[String(x.ID_DE_XUAT||x.ID||'')]||{},employeeId=master.ID_NGUOI_DE_XUAT||x.ID_NGUOI_DE_XUAT||'',employee=employees[String(employeeId)]||{};
      return Object.assign({},x,{
        TEN_DANH_MUC:material.TEN_VAT_TU||material.TEN||x.TEN_DANH_MUC||x.ID_DANH_MUC||'',
        DVT:material.DVT||x.DVT||'',
        NHA_CUNG_CAP_HIEN_THI:(suppliers[String(x.NHA_CUNG_CAP||'')]||{}).TEN_NHA_CUNG_CAP||x.NHA_CUNG_CAP||'',
        NGAY_DE_XUAT:master.NGAY_DE_XUAT||master.NGAY_TAO||x.NGAY_DE_XUAT||'',
        ID_NGUOI_DE_XUAT:employeeId,
        NGUOI_DE_XUAT:master.NGUOI_DE_XUAT||x.NGUOI_DE_XUAT||employeeNameV83_(employee,employeeId),
        PHONG_BAN:master.PHONG_BAN||employee.PHONG_BAN||employee.DON_VI||x.PHONG_BAN||''
      });
    });
  }
  if(sheetName===V22.SHEETS.proposalBuyMaterial){
    let materials={};try{materials=indexBy_(readObjects_(V22.SHEETS.materials),'ID')}catch(e){materials={}}
    let suppliers={};try{suppliers=indexBy_(readObjects_(V22.SHEETS.suppliers),'ID')}catch(e){suppliers={}}
    let proposals={};try{proposals=indexBy_(readObjects_(V22.SHEETS.proposals),'ID')}catch(e){proposals={}}
    let employees={};try{employees=indexBy_(readObjects_(V22.SHEETS.employees),'ID')}catch(e){employees={}}
    rows=rows.map(x=>{const master=proposals[String(x.ID_DE_XUAT||'')]||{},employeeId=master.ID_NGUOI_DE_XUAT||x.ID_NGUOI_DE_XUAT||'',employee=employees[String(employeeId)]||{},material=materials[String(x.ID_VAT_TU||'')]||{};return Object.assign({},x,{TEN_VAT_TU:material.TEN_VAT_TU||x.ID_VAT_TU||'',DVT:material.DVT||x.DVT||'',NHA_CUNG_CAP_HIEN_THI:(suppliers[String(x.NHA_CUNG_CAP||'')]||{}).TEN_NHA_CUNG_CAP||x.NHA_CUNG_CAP||'',NGAY_DE_XUAT:master.NGAY_DE_XUAT||master.NGAY_TAO||x.NGAY_DE_XUAT||'',ID_NGUOI_DE_XUAT:employeeId,NGUOI_DE_XUAT:master.NGUOI_DE_XUAT||x.NGUOI_DE_XUAT||employeeNameV83_(employee,employeeId),PHONG_BAN:master.PHONG_BAN||employee.PHONG_BAN||employee.DON_VI||x.PHONG_BAN||''})});
  }
  if(sheetName==='HOP_DONG'){
    const tenants=indexBy_(readObjects_(V22.SHEETS.tenants),'ID');
    rows=rows.map(x=>Object.assign({},x,{DOI_TAC:(tenants[x.ID_KHACH_THUE]||{}).TEN_KHACH_THUE||x.ID_KHACH_THUE||''}));
  }
  return rows;
}

function legacyModuleForSheet_(s) {
  const map={
    CONG_VIEC:MODULES.WORK,CVHN_2026:MODULES.DAILY,NHAT_KY_BAO_TRI:MODULES.MAINTENANCE,
    KE_HOACH_BAO_TRI:MODULES.MAINTENANCE,THIET_BI:MODULES.ASSET,
    VAT_TU:MODULES.WAREHOUSE,NHAP_XUAT_KHO:MODULES.WAREHOUSE,CAP_PHAT:MODULES.ALLOCATION,
    THU_HOI:MODULES.RECOVERY,DE_XUAT:MODULES.PROPOSAL,DE_XUAT_MUA:MODULES.PROPOSAL,DE_XUAT_MUA_VAT_TU:MODULES.PROPOSAL,
    DE_XUAT_THANH_LY:MODULES.PROPOSAL,DE_XUAT_BAO_TRI:MODULES.PROPOSAL,HOP_DONG:MODULES.CONTRACT,
    KHACH_THUE:MODULES.TENANT,QUAN_LY_TANG:MODULES.FLOOR,KHACH_HANG_TIEM_NANG:MODULES.PROSPECT,DM_NHAN_VIEN:MODULES.CONTACT,
    DM_NHA_THAU:MODULES.CONTACT,DM_NHA_CUNG_CAP:MODULES.CONTACT,
    DM_KHU_VUC_TOA_NHA:MODULES.FLOOR,DM_HANG_MUC_BAO_TRI:MODULES.MAINTENANCE,
    NGUOI_SU_DUNG:MODULES.USER,VAI_TRO:MODULES.ROLE,PHAN_QUYEN:MODULES.PERMISSION
  };
  return map[String(s||'')]||null;
}

function legacyDeleteModule_(user,sheetName,id,systemPassword) {
  sheetName=String(sheetName||'');
  const module=legacyModuleForSheet_(sheetName);
  if(module) requirePermission_(user,module,'XOA');
  requireDeletePasswordV144_(systemPassword); // V144: mọi sheet đều cần mật khẩu, không riêng VAT_TU
  if(sheetName==='NHAT_KY_BAO_TRI') return deleteMaintenanceLog_(user,{ID:id}).data;
  if(sheetName==='KE_HOACH_BAO_TRI') throw new Error('Không xóa kế hoạch trực tiếp trong V22; dùng trạng thái Hủy/Đã thay thế.');
  archiveAndDeleteById_(sheetName,'ID',id,user,'MODULE_DELETE');
  return {ok:true};
}

function legacyProposalList_(){
  const contacts=indexBy_(readObjects_(V22.SHEETS.employees),'ID');
  return readObjects_(V22.SHEETS.proposals).map(x=>Object.assign({},x,{
    NGUOI_DE_XUAT:x.NGUOI_DE_XUAT||(contacts[x.ID_NGUOI_DE_XUAT]||{}).HO_TEN||x.ID_NGUOI_DE_XUAT||'',
    NGUOI_DUYET:(contacts[x.ID_NGUOI_DUYET]||{}).HO_TEN||x.ID_NGUOI_DUYET||''
  }));
}
function approveProposal_(user,id){
  id=String(id||'').trim();if(!id)throw new Error('PROPOSAL_ID_REQUIRED');
  const lock=LockService.getScriptLock();lock.waitLock(30000);let row=null,patch=null,stockImport={created:0,skipped:0,transactions:[]},targetSheet=V22.SHEETS.proposals;
  try{
    row=findById_(V22.SHEETS.proposals,'ID',id);
    if(row){
      const materialLines=readObjects_(V22.SHEETS.proposalBuyMaterial).filter(function(x){return String(x.ID_DE_XUAT||'')===id;});
      const isMaterial=norm_(row.LOAI_DE_XUAT).indexOf('MUA_VAT_TU')>=0||materialLines.length>0;
      if(isMaterial){
        if(!materialLines.length)throw new Error('PROPOSAL_MATERIAL_LINE_REQUIRED');
        ensureAssetWarehouseSchemaV83_();
        const stockRows=readObjects_(V22.SHEETS.stockTxn),approverId=String(user&&user.employeeId||'').trim();
        const executorId=(approverId&&findById_(V22.SHEETS.employees,'ID',approverId))?approverId:String(row.ID_NGUOI_DE_XUAT||'').trim();
        materialLines.forEach(function(line,index){
          const detailId=String(line.ID||'').trim(),materialId=String(line.ID_VAT_TU||'').trim(),qty=Number(line.SO_LUONG||0);
          if(!detailId||!materialId||!(qty>0))throw new Error('PROPOSAL_MATERIAL_INVALID_LINE:'+(index+1));
          if(!findById_(V22.SHEETS.materials,'ID',materialId))throw new Error('VAT_TU_NOT_FOUND:'+materialId);
          const transactionId='NX_'+detailId,existing=stockRows.find(function(x){return String(x.ID||'')===transactionId;});
          if(existing){stockImport.skipped++;stockImport.transactions.push(existing);}
          else{
            const transaction={ID:transactionId,NGAY:today_(),LOAI_GIAO_DICH:'NHAP',ID_VAT_TU:materialId,SO_LUONG:qty,ID_NGUOI_THUC_HIEN:executorId,NOI_DUNG:'Nhập kho tự động từ đề xuất '+id,GHI_CHU:'ID đề xuất: '+id+' | ID chi tiết: '+detailId,NGUON_GIAO_DICH:'DE_XUAT_MUA_VAT_TU',ID_CHUNG_TU:id,ID_CHI_TIET_NGUON:detailId,ID_GIAO_DICH_GOC:'',LY_DO_DIEU_CHINH:'',NGUOI_SUA:'',NGAY_SUA:''};
            appendObject_(V22.SHEETS.stockTxn,transaction);stockRows.push(transaction);stockImport.created++;stockImport.transactions.push(transaction);
          }
          updateById_(V22.SHEETS.proposalBuyMaterial,'ID',detailId,{TRANG_THAI:'Đã duyệt'});
        });
      }
    }else{
      // V107 — DE_XUAT_MUA / DE_XUAT_THANH_LY / DE_XUAT_BAO_TRI được lưu trực
      // tiếp qua CRUD chung, không tạo dòng DE_XUAT gốc, nên trước đây nút
      // Duyệt cho 2 loại đề xuất này luôn báo PROPOSAL_NOT_FOUND. Nay tìm
      // thẳng trên sheet chứa bản ghi và duyệt tại chỗ, không có nhập kho.
      const directSheets=[V22.SHEETS.proposalBuy,V22.SHEETS.proposalDispose,V22.SHEETS.proposalMaintenance];
      for(let i=0;i<directSheets.length;i++){
        const hit=findById_(directSheets[i],'ID',id);
        if(hit){row=hit;targetSheet=directSheets[i];break;}
      }
      if(!row)throw new Error('PROPOSAL_NOT_FOUND:'+id);
    }
    patch={TRANG_THAI:'Đã duyệt',ID_NGUOI_DUYET:user&&user.employeeId||user&&user.email||'',NGAY_DUYET:today_()};
    updateById_(targetSheet,'ID',id,patch);
  }finally{lock.releaseLock();}
  try{appendObject_(V22.SHEETS.audit,{ID_AUDIT:nextId_(V22.SHEETS.audit,'AUD'),THOI_GIAN:nowStamp_(),EMAIL:user&&user.email||'',MODULE:'DE_XUAT',HANH_DONG:'DUYET',ID_BAN_GHI:id,KET_QUA:'OK',NOI_DUNG:'Duyệt đề xuất '+id});}catch(e){}
  return Object.assign({},row,patch,{stockImport:stockImport});
}

function legacyReport_(f){
  let rows=legacyWorkRows_();
  if(f.assigner)rows=rows.filter(x=>String(x.ID_NGUOI_GIAO)===String(f.assigner));
  if(f.executor)rows=rows.filter(x=>String(x.ID_NGUOI_THUC_HIEN)===String(f.executor));
  if(f.status)rows=rows.filter(x=>String(x.TRANG_THAI)===String(f.status));
  if(f.result)rows=rows.filter(x=>String(x.KET_QUA)===String(f.result));
  if(f.from)rows=rows.filter(x=>!dateOnly_(x.NGAY_GIAO)||dateOnly_(x.NGAY_GIAO)>=dateOnly_(f.from));
  if(f.to)rows=rows.filter(x=>!dateOnly_(x.NGAY_GIAO)||dateOnly_(x.NGAY_GIAO)<=dateOnly_(f.to));
  const d=legacyDashboard_(rows);
  return {rows:rows,stats:{total:d.total,done:d.done,doing:d.doing,overdue:d.overdue}};
}

function legacyAssetBootstrap_(){
  const rel=assetWarehouseRelationBundleV83_();
  return {
    devices:rel.devices,
    employees:readObjects_(V22.SHEETS.employees),
    allocations:[],
    recoveries:rel.recoveries
  };
}
function legacyCreateWarehouseDevice_(p){
  ensureAssetWarehouseSchemaV83_();
  const serial=String(p.SERIAL||'').trim();
  if(serial&&readObjects_(V22.SHEETS.assets).some(function(d){return norm_(d.SERIAL)===norm_(serial)}))throw new Error('SERIAL_THIET_BI_DA_TON_TAI');
  const normalized=normalizeAssetUsageV841432_(p);
  const x=Object.assign({},normalized,{ID:nextId_(V22.SHEETS.assets,'TB'),ID_NGUOI_SU_DUNG:'',NGAY_NHAP_KHO:dateOnly_(normalized.NGAY_NHAP_KHO||today_()),TRANG_THAI:'TRONG_KHO'});
  appendObject_(V22.SHEETS.assets,x);
  return {ok:true,message:'Đã nhập thiết bị vào kho',record:x};
}
function legacyAllocationPayload_(p){
  return Object.assign({},p,{ID_KHU_VUC_SU_DUNG:p.ID_KHU_VUC_SU_DUNG||p.VI_TRI_SU_DUNG||''});
}
function legacyRecoveryPayload_(p){
  return Object.assign({},p,{ID_KHU_VUC_SAU_THU_HOI:p.ID_KHU_VUC_SAU_THU_HOI||p.VI_TRI_SAU_THU_HOI||''});
}

function legacyUsers_(){
  const contacts=indexBy_(readObjects_(V22.SHEETS.employees),'ID');
  const roles=indexBy_(readObjects_(V22.SHEETS.roles),'ID');
  return readObjects_(V22.SHEETS.users).map(x=>{
    const e=contacts[x.ID_NHAN_VIEN]||{}, r=roles[x.ID_VAI_TRO]||{};
    return Object.assign({},x,{
      HO_TEN:e.HO_TEN||x.ID_NHAN_VIEN||'',
      EMAIL:x.EMAIL_DANG_NHAP||'',
      PHONG_BAN:e.PHONG_BAN||e.DON_VI||'',
      VAI_TRO:r.TEN_VAI_TRO||x.ID_VAI_TRO||''
    });
  });
}
function legacyEmployeeAccess_(){
  const byEmp={}; readObjects_(V22.SHEETS.users).forEach(u=>byEmp[String(u.ID_NHAN_VIEN||'')]=u);
  return readObjects_(V22.SHEETS.employees).map(e=>{
    const u=byEmp[String(e.ID||'')];
    return {ID_NHAN_VIEN:e.ID,HO_TEN:e.HO_TEN||'',HAS_ACCOUNT:!!u,ID_USER:u?u.ID:'',EMAIL:u?u.EMAIL_DANG_NHAP:'',ID_VAI_TRO:u?u.ID_VAI_TRO:''};
  });
}
function legacyToggleUser_(id){
  const x=findById_(V22.SHEETS.users,'ID',id); if(!x)throw new Error('USER_NOT_FOUND');
  const next=isActive_(x.TRANG_THAI)?'Đã khóa':'Đang hoạt động';
  updateById_(V22.SHEETS.users,'ID',id,{TRANG_THAI:next,NGAY_CAP_NHAT:nowStamp_()});
  return {ID:id,TRANG_THAI:next};
}
function saveCatalogContactV70_(p){
  const type=norm_(p&&p.LOAI),sheet=catalogSheetV70_(type),prefix=catalogPrefixV70_(type),x=Object.assign({},p||{});delete x.LOAI;
  const main=type==='NHA_CUNG_CAP'?String(x.TEN_NHA_CUNG_CAP||'').trim():(type==='NHA_THAU'?String(x.DON_VI||x.HO_TEN||'').trim():String(x.HO_TEN||'').trim());
  if(!main)throw new Error(type==='NHA_CUNG_CAP'?'Vui lòng nhập Tên nhà cung cấp.':(type==='NHA_THAU'?'Vui lòng nhập Đơn vị nhà thầu.':'Vui lòng nhập Họ và tên nhân viên.'));
  if(x.EMAIL)x.EMAIL=normalizeEmail_(x.EMAIL);
  const rows=readObjects_(sheet),id=String(x.ID||'');
  if(x.EMAIL&&rows.some(r=>String(r.ID||'')!==id&&normalizeEmail_(r.EMAIL)===x.EMAIL))throw new Error('Email đã tồn tại trong danh mục này.');
  if(type==='NHA_CUNG_CAP'&&x.MA_SO_THUE&&rows.some(r=>String(r.ID||'')!==id&&norm_(r.MA_SO_THUE)===norm_(x.MA_SO_THUE)))throw new Error('Mã số thuế nhà cung cấp đã tồn tại.');
  if(!x.ID)x.ID=nextId_(sheet,prefix);
  if(!x.TRANG_THAI)x.TRANG_THAI='Hoạt động';
  upsertObject_(sheet,'ID',x);return findById_(sheet,'ID',x.ID);
}
function legacyToggleContact_(id){
  const sheets=[V22.SHEETS.employees,V22.SHEETS.contractors,V22.SHEETS.suppliers];let sheet='',x=null;
  for(const s of sheets){x=findById_(s,'ID',id);if(x){sheet=s;break}}
  if(!x)throw new Error('CATALOG_RECORD_NOT_FOUND');
  const next=isActive_(x.TRANG_THAI)?'Ngưng':'Hoạt động';updateById_(sheet,'ID',id,{TRANG_THAI:next});return {ID:id,TRANG_THAI:next};
}
function legacySavePermissions_(roleId,rows,user){
  const sh=getSheet_(V22.SHEETS.permissions);
  // Xóa các rule cũ của role từ dưới lên, sau đó ghi mới.
  const data=readObjectsWithRow_(V22.SHEETS.permissions).filter(x=>String(x.obj.ID_VAI_TRO||'')===String(roleId)).sort((a,b)=>b.row-a.row);
  data.forEach(x=>sh.deleteRow(x.row));
  if(data.length)invalidateSheetV20_(V22.SHEETS.permissions,true);
  (rows||[]).forEach(r=>{
    const x=Object.assign({},r,{ID:r.ID||nextId_(V22.SHEETS.permissions,'PQ'),ID_VAI_TRO:roleId});
    appendObject_(V22.SHEETS.permissions,x);
  });
  try{appendObject_(V22.SHEETS.audit,{ID_AUDIT:nextId_(V22.SHEETS.audit,'AUD'),THOI_GIAN:nowStamp_(),EMAIL:user&&user.email||'',MODULE:'PHAN_QUYEN',HANH_DONG:'CAP_NHAT_MA_TRAN',ID_BAN_GHI:roleId,KET_QUA:'OK',NOI_DUNG:'Cập nhật ma trận phân quyền; số dòng='+((rows||[]).length)});}catch(e){}
  return {ok:true,count:(rows||[]).length};
}

function legacyAreaIdFromSnapshot_(floor,company){
  floor=norm_(floor);company=norm_(company);
  const rows=readObjects_(V22.SHEETS.buildingAreas);
  const x=rows.find(r=>norm_(r.TANG)===floor && (!company || norm_(r.TEN_CONG_TY)===company));
  if(!x)throw new Error('Không xác định được ID_KHU_VUC từ form cũ. Vui lòng chọn khu vực theo V22.');
  return x.ID;
}
function legacyItemIdFromName_(name){
  const n=norm_(name);const x=readObjects_(V22.SHEETS.maintenanceItems).find(r=>norm_(r.TEN_HANG_MUC)===n);
  if(!x)throw new Error('Không xác định được ID_HANG_MUC từ form cũ.');
  return x.ID_HANG_MUC;
}
function legacyPrefixForSheet_(s){
  const m={THIET_BI:'TB',VAT_TU:'VT',CAP_PHAT:'CP',THU_HOI:'TH',HOP_DONG:'HD',KHACH_THUE:'KT',KHACH_HANG_TIEM_NANG:'KHTN',QUAN_LY_TANG:'TANG',
    DE_XUAT_MUA_VAT_TU:'DXVT',DE_XUAT_MUA:'DXM',DE_XUAT_THANH_LY:'DXTL',DE_XUAT_BAO_TRI:'DXBT',NGUOI_SU_DUNG:'US',VAI_TRO:'VR',PHAN_QUYEN:'PQ',
    DM_NHAN_VIEN:'NV',DM_NHA_THAU:'NT',DM_NHA_CUNG_CAP:'NCC',DM_KHU_VUC_TOA_NHA:'KV',DM_HANG_MUC_BAO_TRI:'HM'};
  return m[String(s||'')]||'ID';
}


// ============================================================================
// V22.1 NO LOGIN TEST MODE
// WARNING: Anyone with the deployed Web App URL can access according to the
// fallback role returned here. Use only for internal testing.
// ============================================================================
function legacyV22NoLogin(fn, args, systemToken) {
  beginFastRequestV20_();
  const user = getNoLoginTestUser_();
  fn = String(fn || '');
  args = Array.isArray(args) ? args : [];

  // Keep Firebase-specific calls harmless in no-login mode.
  if (fn === 'getPublicAuthConfig') {
    return {firebaseApiKey:'', authReady:false, version:'V22.1-NO-LOGIN-TEST'};
  }
  if (fn === 'verifyFirebaseTokenFinal') {
    return legacyVerifyUser_(user);
  }

  // V137: các RPC thuộc Hệ thống bắt buộc có mã phiên mở khóa hợp lệ.
  guardSystemRpcV137_(fn, args, systemToken);

  // Dispatch through the same action branches, using this local test user
  // instead of a real Firebase-authenticated user.
  return legacyV22DispatchNoAuth_(fn, args, user);
}

function getNoLoginTestUser_() {
  // Nguoi dung no-login thay doi rat it. Cache ket qua de moi RPC chi-doc
  // khong phai mo NGUOI_SU_DUNG va VAI_TRO lap lai.
  try{
    const cached=CacheService.getScriptCache().get('PL121:NO_LOGIN_USER');
    if(cached)return JSON.parse(cached);
  }catch(ignore){}
  const users = readObjects_(V22.SHEETS.users);
  const appUser = users.find(u => String(u.ID_VAI_TRO || '') === V22.SUPER_ADMIN_ROLE && isActive_(u.TRANG_THAI))
               || users.find(u => String(u.ID_VAI_TRO || '') === 'VR0001' && isActive_(u.TRANG_THAI));
  if (!appUser) throw new Error('NO_ACTIVE_ADMIN_FOR_NO_LOGIN_MODE');

  const role = findById_(V22.SHEETS.roles, 'ID', appUser.ID_VAI_TRO) || {};
  const result={
    id: appUser.ID,
    employeeId: appUser.ID_NHAN_VIEN || '',
    email: appUser.EMAIL_DANG_NHAP || 'no-login-test@local',
    roleId: appUser.ID_VAI_TRO || '',
    roleName: role.TEN_VAI_TRO || 'No Login Test',
    isSuperAdmin: appUser.ID_VAI_TRO === V22.SUPER_ADMIN_ROLE
  };
  try{CacheService.getScriptCache().put('PL121:NO_LOGIN_USER',JSON.stringify(result),21600)}catch(ignore){}
  return result;
}

// Cac RPC chi-doc cua Web App hien chay o NO LOGIN TEST va luon dung quyen
// quan tri. Dung doi tuong nhe nay de khong doc 2-3 sheet quyen moi lan mo bang.
function fastReadUserV121_(){
  return {id:'V121_READ',employeeId:'',email:'no-login-read@local',roleId:V22.SUPER_ADMIN_ROLE,roleName:'Fast read',isSuperAdmin:true};
}

// Mật khẩu riêng của khu vực HỆ THỐNG, lưu thô tại NGUOI_SU_DUNG.MAT_KHAU_HE_THONG.
// ============================================================================
// V137 — KHÓA HỆ THỐNG PHÍA MÁY CHỦ
// Mở khóa bằng mật khẩu riêng (NGUOI_SU_DUNG.MAT_KHAU_HE_THONG của Super Admin /
// VR0001). Máy chủ cấp một mã phiên ngẫu nhiên lưu trong CacheService 30 phút.
// Mọi RPC đọc/ghi dữ liệu của các trang Hệ thống phải gửi kèm mã phiên này, nên
// không thể mở dữ liệu Hệ thống chỉ bằng cách vượt giao diện (console, sửa JS...).
// ============================================================================
const SYSTEM_LOCK_V137=Object.freeze({
  TTL_SECONDS:1800,
  CACHE_PREFIX:'PL137:SYSLOCK:',
  FAIL_KEY:'PL137:SYSLOCK_FAILS',
  MAX_FAILS:10,
  FAIL_WINDOW_SECONDS:300,
  PAGES:['users','roles','permissions','systemAudit','maintenanceDataTool','systemConfig','emailConfig'],
  FNS:['getSupplementalBootstrapData','getEmailAlertConfig','saveEmailAlertConfig','previewEmailAlerts','sendTestEmailAlert','saveEmailAlertConfigAll','sendEmailAlertsNow','saveRoleRecord','saveRolePermissions','saveUserAccount','toggleUserStatus','approveProposal'],
  SHEET_FNS:['getModuleData','saveModuleRecord','deleteModuleRecord','deleteRecordV142'],
  SAVE_MODES:['role','user'],
  CONTAINERS:['permissionsTable','usersTable','rolesTable']
});
function systemLockSheetsV137_(){
  return [V22.SHEETS.users,V22.SHEETS.roles,V22.SHEETS.permissions,V22.SHEETS.audit,V22.SHEETS.sequences,V22.SHEETS.emailConfig,V22.SHEETS.emailLog];
}
function isSystemPageV137_(page){return SYSTEM_LOCK_V137.PAGES.indexOf(String(page||'').trim())>=0}
function isSystemSheetV137_(sheet){return systemLockSheetsV137_().indexOf(String(sheet||'').trim())>=0}

// So khớp mật khẩu + chặn dò mật khẩu (tối đa 10 lần sai / 5 phút).
function checkSystemLockPasswordV137_(password){
  const input=String(password??'');
  if(!input)return {ok:false,code:'SYSTEM_PASSWORD_REQUIRED'};
  const cache=CacheService.getScriptCache();
  const fails=Number(cache.get(SYSTEM_LOCK_V137.FAIL_KEY)||0);
  if(fails>=SYSTEM_LOCK_V137.MAX_FAILS)return {ok:false,code:'SYSTEM_PASSWORD_TOO_MANY_ATTEMPTS'};
  const users=readObjects_(V22.SHEETS.users);
  const admin=users.find(u=>isActive_(u.TRANG_THAI)&&[V22.SUPER_ADMIN_ROLE,'VR0001'].includes(String(u.ID_VAI_TRO||''))&&String(u.MAT_KHAU_HE_THONG??'')!==''&&String(u.MAT_KHAU_HE_THONG??'')===input);
  if(!admin){
    cache.put(SYSTEM_LOCK_V137.FAIL_KEY,String(fails+1),SYSTEM_LOCK_V137.FAIL_WINDOW_SECONDS);
    Utilities.sleep(400);
    return {ok:false,code:'SYSTEM_PASSWORD_INVALID'};
  }
  return {ok:true,userId:admin.ID,roleId:admin.ID_VAI_TRO};
}

// Giao diện gọi hàm này khi bấm 🔒 HỆ THỐNG. Thành công -> trả mã phiên.
function verifySystemLockPassword(password){
  const result=checkSystemLockPasswordV137_(password);
  if(!result.ok)return result;
  const token=Utilities.getUuid().replace(/-/g,'')+Utilities.getUuid().replace(/-/g,'');
  CacheService.getScriptCache().put(SYSTEM_LOCK_V137.CACHE_PREFIX+token,JSON.stringify({userId:result.userId,roleId:result.roleId,at:nowStamp_()}),SYSTEM_LOCK_V137.TTL_SECONDS);
  return {ok:true,userId:result.userId,roleId:result.roleId,token:token,expiresInMs:SYSTEM_LOCK_V137.TTL_SECONDS*1000};
}

// Nút "Khóa Hệ thống" trên giao diện: hủy mã phiên ngay lập tức.
function lockSystemV137(systemToken){
  const token=String(systemToken||'').trim();
  if(token)try{CacheService.getScriptCache().remove(SYSTEM_LOCK_V137.CACHE_PREFIX+token)}catch(ignore){}
  return {ok:true};
}
function isSystemUnlockedV137_(systemToken){
  const token=String(systemToken||'').trim();
  if(!/^[A-Za-z0-9]{32,80}$/.test(token))return false;
  try{return !!CacheService.getScriptCache().get(SYSTEM_LOCK_V137.CACHE_PREFIX+token)}catch(e){return false}
}
function requireSystemUnlockV137_(systemToken){
  if(!isSystemUnlockedV137_(systemToken))throw new Error('SYSTEM_LOCKED: Hệ thống đang khóa hoặc phiên mở khóa đã hết hạn. Hãy bấm 🔒 HỆ THỐNG và nhập mật khẩu.');
}
function guardSystemRpcV137_(fn,args,systemToken){
  fn=String(fn||'');args=Array.isArray(args)?args:[];
  if(SYSTEM_LOCK_V137.FNS.indexOf(fn)>=0)return requireSystemUnlockV137_(systemToken);
  if(SYSTEM_LOCK_V137.SHEET_FNS.indexOf(fn)>=0&&isSystemSheetV137_(args[0]))return requireSystemUnlockV137_(systemToken);
}

// Danh mục VAT_TU là dữ liệu nền; Sửa/Xóa phải qua đúng mật khẩu riêng của Hệ thống.
// Mật khẩu chỉ dùng để xác thực trong request, tuyệt đối không ghi vào VAT_TU.
function requireMaterialCatalogSystemPassword_(password){
  const result=checkSystemLockPasswordV137_(password);
  if(!result||result.ok!==true)throw new Error(result&&result.code||'SYSTEM_PASSWORD_INVALID');
  return result;
}

// V132 — Chặn ghi TRANG_THAI="Đã duyệt" cho các sheet đề xuất qua form Sửa/CRUD chung.
// Duyệt đề xuất chỉ được phép qua approveProposal_ (yêu cầu quyền DUYET + mở khóa Hệ thống ở
// giao diện). Nếu không có chặn này, người có quyền Sửa đề xuất có thể tự đặt trạng thái
// "Đã duyệt" trực tiếp, bỏ qua mật khẩu khóa hệ thống, quyền DUYET riêng, dấu vết người/ngày
// duyệt và (với đề xuất mua vật tư) việc tự động nhập kho.
const LEGACY_PROPOSAL_STATUS_SHEETS_V132_=[V22.SHEETS.proposals,V22.SHEETS.proposalBuy,V22.SHEETS.proposalDispose,V22.SHEETS.proposalMaintenance,V22.SHEETS.proposalBuyMaterial];
function legacyBlockDirectApprovalV132_(sheetName,record){
  if(LEGACY_PROPOSAL_STATUS_SHEETS_V132_.indexOf(String(sheetName||''))<0)return;
  if(norm_(record&&record.TRANG_THAI)==='DA_DUYET'){
    throw new Error('KHONG_DUOC_DUYET_QUA_FORM_SUA_HAY_DUNG_NUT_DUYET_SAU_KHI_MO_KHOA_HE_THONG');
  }
}

// ============================================================================
// V142 — NÚT "XÓA" TRÊN THANH CÔNG CỤ CÁC TRANG
// Một cổng xóa duy nhất, có danh sách trắng sheet + cột khóa phía máy chủ
// (không tin tên cột do giao diện gửi lên). Luôn đọc Sheet mới nhất (bỏ cache)
// trong khóa LockService, lưu vết từng dòng vào DATA_AUDIT_ARCHIVE rồi mới xóa.
// ============================================================================
function deleteConfigV142_(sheetName){
  const S=V22.SHEETS,C={};
  C[S.work]={idField:'ID',module:MODULES.WORK,label:'công việc'};
  C[S.daily]={idField:'ID',module:MODULES.DAILY,label:'công việc hằng ngày'};
  C[S.maintenanceLogs]={idField:'ID',module:MODULES.MAINTENANCE,special:'maintenanceLog',label:'nhật ký bảo trì'};
  C[S.assets]={idField:'ID',module:MODULES.ASSET,label:'thiết bị'};
  C[S.recoveries]={idField:'ID',module:MODULES.RECOVERY,label:'phiếu thu hồi'};
  C[S.proposalBuyMaterial]={group:true,module:MODULES.PROPOSAL,label:'đề xuất mua vật tư'};
  C[S.proposalBuy]={group:true,module:MODULES.PROPOSAL,label:'đề xuất mua thiết bị'};
  C[S.proposalDispose]={group:true,module:MODULES.PROPOSAL,label:'đề xuất thanh lý'};
  C[S.proposalMaintenance]={group:true,module:MODULES.PROPOSAL,label:'đề xuất bảo trì'};
  C[S.operationDetails]={idField:'ID_HANG_MUC',module:MODULES.CONTACT,byRow:true,label:'chi tiết vận hành'};
  C[S.employees]={idField:'ID',module:MODULES.CONTACT,label:'nhân viên'};
  C[S.contractors]={idField:'ID',module:MODULES.CONTACT,label:'nhà thầu'};
  C[S.suppliers]={idField:'ID',module:MODULES.CONTACT,label:'nhà cung cấp'};
  C[S.maintenanceItems]={idField:'ID_HANG_MUC',module:MODULES.MAINTENANCE,label:'hạng mục bảo trì'};
  C[S.buildingAreas]={idField:'ID',module:MODULES.FLOOR,label:'khu vực tòa nhà'};
  C[S.tenants]={idField:'ID',module:MODULES.TENANT,label:'khách thuê'};
  C[S.prospects]={idField:'ID',module:MODULES.PROSPECT,label:'khách hàng tiềm năng'};
  C[S.floors]={idField:'ID',module:MODULES.FLOOR,label:'tầng'};
  C[S.contracts]={idField:'ID',module:MODULES.CONTRACT,label:'hợp đồng'};
  C[S.roles]={idField:'ID',module:MODULES.ROLE,label:'vai trò'};
  C[S.users]={idField:'ID',module:MODULES.USER,label:'tài khoản'};
  C[S.permissions]={idField:'ID',module:MODULES.PERMISSION,label:'dòng phân quyền'};
  C[S.audit]={idField:'ID_AUDIT',module:MODULES.PERMISSION,label:'bản ghi nhật ký hệ thống'};
  return C[String(sheetName||'')]||null;
}
function freshRowsV142_(sheetName){
  invalidateSheetV20_(sheetName,true);
  return readObjectsWithRow_(sheetName);
}
function archiveRowsV142_(sheetName,entries,user,reason){
  entries.forEach(function(entry){
    appendObject_(V22.SHEETS.audit,{
      ID_AUDIT:nextId_(V22.SHEETS.audit,'AUD'),NGAY_XU_LY:today_(),SHEET_NGUON:sheetName,
      ID_GOC:String(entry.obj.ID||entry.obj.ID_HANG_MUC||('DONG_'+entry.row)),LOAI_LOI:reason||'DELETE',
      LY_DO:'Lưu vết trước khi xóa (V142); user='+((user&&user.email)||''),DATA_GOC:JSON.stringify(entry.obj),TRANG_THAI:'Đã lưu trữ'
    });
  });
  const sh=getSheet_(sheetName);
  entries.slice().sort(function(a,b){return b.row-a.row}).forEach(function(entry){sh.deleteRow(entry.row)});
  invalidateSheetV20_(sheetName,true);
}
// V144 — MỌI thao tác xóa phải nhập mật khẩu Hệ thống (tạm thời thay cho
// phân quyền theo người dùng). Mật khẩu được kiểm tra tại máy chủ, có chặn dò
// mật khẩu (checkSystemLockPasswordV137_), không bao giờ được ghi vào Sheet.
function requireDeletePasswordV144_(password){
  const result=checkSystemLockPasswordV137_(password);
  if(result&&result.ok===true)return result;
  const code=result&&result.code||'SYSTEM_PASSWORD_INVALID';
  if(code==='SYSTEM_PASSWORD_REQUIRED')throw new Error('Cần nhập mật khẩu để xóa.');
  if(code==='SYSTEM_PASSWORD_TOO_MANY_ATTEMPTS')throw new Error('Nhập sai mật khẩu quá nhiều lần. Vui lòng thử lại sau 5 phút.');
  throw new Error('Mật khẩu không đúng. Chưa xóa dữ liệu nào.');
}
function deleteRecordV142_(user,sheetName,id,extra){
  sheetName=String(sheetName||'').trim();id=String(id??'').trim();extra=Object.assign({},extra||{});
  const password=extra.password;delete extra.password;
  requireDeletePasswordV144_(password);
  const cfg=deleteConfigV142_(sheetName);
  if(sheetName===V22.SHEETS.materials)throw new Error('Danh mục vật tư phải xóa qua mật khẩu Hệ thống.');
  if(sheetName===V22.SHEETS.maintenanceSchedules||sheetName===V22.SHEETS.maintenancePlans)throw new Error('Lịch/kế hoạch bảo trì được hệ thống tự sinh, không xóa trực tiếp. Hãy đổi Trạng thái sang Tạm ngưng.');
  if(!cfg)throw new Error('KHONG_HO_TRO_XOA:'+sheetName);
  requirePermission_(user,cfg.module,'XOA');
  if(!id&&!cfg.byRow)throw new Error('MISSING_ID');
  if(cfg.special==='maintenanceLog'){deleteMaintenanceLog_(user,{ID:id});return {ok:true,deleted:1,sheet:sheetName,id:id}}
  // V143: "Xóa" ở trang Đội PCCC chỉ đưa nhân viên RA KHỎI đội (DOI_PCCC),
  // không xóa nhân viên khỏi Danh bạ nhân viên.
  if(sheetName===V22.SHEETS.employees&&extra.pcccOnly){
    requirePermission_(user,MODULES.CONTACT,'SUA');
    const lockP=LockService.getScriptLock();lockP.waitLock(30000);
    try{
      beginFastRequestV20_({bypassCache:true});
      const entry=freshRowsV142_(sheetName).find(function(e){return String(e.obj.ID||'').trim()===id});
      if(!entry)throw new Error('Không tìm thấy nhân viên '+id+'. Hãy bấm Làm mới.');
      ensureSheetColumnV8427_(sheetName,'DOI_PCCC');
      updateRowFields_(sheetName,entry.row,{DOI_PCCC:'Ngừng hoạt động'});
      invalidateSheetV20_(sheetName,true);
      return {ok:true,deleted:1,sheet:sheetName,id:id,pccc:true};
    }finally{lockP.releaseLock()}
  }
  const lock=LockService.getScriptLock();lock.waitLock(30000);
  try{
    beginFastRequestV20_({bypassCache:true});
    if(cfg.group){
      const rows=freshRowsV142_(sheetName).filter(function(e){return String(e.obj.ID_DE_XUAT||'').trim()===id||String(e.obj.ID||'').trim()===id});
      const master=freshRowsV142_(V22.SHEETS.proposals).filter(function(e){return String(e.obj.ID||'').trim()===id});
      if(!rows.length&&!master.length)throw new Error('Không tìm thấy đề xuất '+id+' (có thể đã bị xóa).');
      if(rows.concat(master).some(function(e){return norm_(e.obj.TRANG_THAI)==='DA_DUYET'}))throw new Error('Đề xuất '+id+' đã được duyệt, không thể xóa.');
      if(rows.length)archiveRowsV142_(sheetName,rows,user,'PROPOSAL_DELETE_V142');
      let masterDeleted=0;
      if(master.length){
        const others=[V22.SHEETS.proposalBuyMaterial,V22.SHEETS.proposalBuy,V22.SHEETS.proposalDispose,V22.SHEETS.proposalMaintenance].some(function(name){
          try{return freshRowsV142_(name).some(function(e){return String(e.obj.ID_DE_XUAT||'').trim()===id})}catch(e){return false}
        });
        if(!others){archiveRowsV142_(V22.SHEETS.proposals,freshRowsV142_(V22.SHEETS.proposals).filter(function(e){return String(e.obj.ID||'').trim()===id}),user,'PROPOSAL_DELETE_V142');masterDeleted=1}
      }
      return {ok:true,deleted:rows.length,masterDeleted:masterDeleted,sheet:sheetName,id:id};
    }
    const entries=freshRowsV142_(sheetName);let found=null;
    if(cfg.byRow&&Number(extra.row)>0){
      found=entries.find(function(e){return Number(e.row)===Number(extra.row)})||null;
      if(found){
        const sameId=id&&String(found.obj[cfg.idField]||'').trim()===id;
        const sameName=!id&&extra.name&&String(found.obj.HANG_MUC_THIET_BI||'').trim()===String(extra.name).trim();
        if(!sameId&&!sameName)found=null;
      }
    }
    if(!found&&id)found=entries.find(function(e){return String(e.obj[cfg.idField]||'').trim()===id})||null;
    if(!found)throw new Error('Không tìm thấy '+cfg.label+' '+(id||'')+' (có thể đã bị xóa hoặc Sheet vừa thay đổi). Hãy bấm Làm mới.');
    if(sheetName===V22.SHEETS.roles){
      if(String(found.obj.ID)===V22.SUPER_ADMIN_ROLE)throw new Error('Không thể xóa vai trò Super Admin.');
      if(readObjects_(V22.SHEETS.users).some(function(u){return String(u.ID_VAI_TRO||'')===String(found.obj.ID)}))throw new Error('Vai trò đang được gán cho người dùng, không thể xóa.');
    }
    if(sheetName===V22.SHEETS.users){
      const admins=['VR0001',V22.SUPER_ADMIN_ROLE];
      const isAdmin=admins.indexOf(String(found.obj.ID_VAI_TRO||''))>=0&&isActive_(found.obj.TRANG_THAI);
      const remaining=entries.filter(function(e){return e!==found&&admins.indexOf(String(e.obj.ID_VAI_TRO||''))>=0&&isActive_(e.obj.TRANG_THAI)}).length;
      if(isAdmin&&!remaining)throw new Error('Không thể xóa tài khoản quản trị cuối cùng.');
    }
    archiveRowsV142_(sheetName,[found],user,'MODULE_DELETE_V142');
    return {ok:true,deleted:1,sheet:sheetName,id:id||String(found.obj[cfg.idField]||'')};
  }finally{lock.releaseLock()}
}

function legacyV22DispatchNoAuth_(fn, args, user) {
  switch (fn) {
    case 'getCoreBootstrapData':
    case 'getBootstrapData': return legacyCoreBootstrap_(user);
    case 'getSupplementalBootstrapData': return legacySupplementalBootstrap_(user);
    case 'getDailyWork': requirePermission_(user,MODULES.DAILY,'XEM'); return legacyDailyRows_();
    case 'getEmailAlertConfig': requirePermission_(user,MODULES.PERMISSION,'XEM'); return getEmailAlertConfigV84_();
    case 'saveEmailAlertConfig': requirePermission_(user,MODULES.PERMISSION,'SUA'); return saveEmailAlertConfigV84_(args[0]||{});
    case 'previewEmailAlerts': requirePermission_(user,MODULES.PERMISSION,'XEM'); return previewEmailAlertsV84();
    case 'sendTestEmailAlert': requirePermission_(user,MODULES.PERMISSION,'SUA'); return sendTestEmailAlertV84_(args[0]||{});
    case 'saveEmailAlertConfigAll': requirePermission_(user,MODULES.PERMISSION,'SUA'); return saveEmailAlertConfigAllV84_(args[0]||{});
    case 'sendEmailAlertsNow': requirePermission_(user,MODULES.PERMISSION,'SUA'); return sendEmailAlertsV84({now:true});

    case 'getModuleData': return legacyGetModuleData_(user, args[0]);
    case 'saveModuleRecord': return legacySaveModule_(user, args[0], args[1] || {});
    case 'deleteModuleRecord': return legacyDeleteModule_(user, args[0], args[1], args[2]);
    case 'deleteRecordV142': return deleteRecordV142_(user, args[0], args[1], args[2]||{});

    case 'getMaintenancePlans': requirePermission_(user,MODULES.MAINTENANCE,'XEM'); return legacyMaintenancePlans_();

    case 'saveWork': requirePermission_(user,MODULES.WORK,(args[0]&&args[0].ID)?'SUA':'THEM'); return legacySaveWork_(args[0]||{});
    case 'deleteWork': requireDeletePasswordV144_(args[1]); requirePermission_(user,MODULES.WORK,'XOA'); archiveAndDeleteById_(V22.SHEETS.work,'ID',args[0],user,'WORK_DELETE'); return {ok:true};
    case 'saveDailyWork': requirePermission_(user,MODULES.DAILY,(args[0]&&args[0].ID)?'SUA':'THEM'); return legacySaveDaily_(args[0]||{});
    case 'deleteDailyWork': requireDeletePasswordV144_(args[1]); requirePermission_(user,MODULES.DAILY,'XOA'); archiveAndDeleteById_(V22.SHEETS.daily,'ID',args[0],user,'DAILY_DELETE'); return {ok:true};

    case 'getProposalList': requirePermission_(user,MODULES.PROPOSAL,'XEM'); return legacyProposalList_();
    case 'exportProposalFileV8414': requirePermission_(user,MODULES.PROPOSAL,'IN_XUAT'); return exportProposalFileV8414_(user,args[0],args[1]);
    case 'saveProposalMaterialBundleV84149': return saveProposalMaterialBundleV84149_(user,args[0]||{});
    case 'saveOperationDetailV841531': return saveOperationDetailV841531_(user,args[0]||{});
    case 'saveProposal': requirePermission_(user,MODULES.PROPOSAL,(args[0]&&args[0].ID)?'SUA':'THEM'); return legacySaveProposal_(args[0]||{});
    case 'approveProposal': requirePermission_(user,MODULES.PROPOSAL,'DUYET'); return approveProposal_(user,args[0]);
    case 'deleteProposal': requireDeletePasswordV144_(args[1]); requirePermission_(user,MODULES.PROPOSAL,'XOA'); archiveAndDeleteById_(V22.SHEETS.proposals,'ID',args[0],user,'PROPOSAL_DELETE'); return {ok:true};

    case 'getWarehouse': requirePermission_(user,MODULES.WAREHOUSE,'XEM'); return legacyWarehouse_();
    case 'saveStockTransaction': return saveStockTransaction_(user,args[0]||{}).data.transaction;
    case 'getReport': requirePermission_(user,MODULES.REPORT,'XEM'); return legacyReport_(args[0]||{});

    case 'getAssetBootstrap': requirePermission_(user,MODULES.ASSET,'XEM'); return legacyAssetBootstrap_();
    case 'createWarehouseDevice': requirePermission_(user,MODULES.ASSET,'THEM'); return legacyCreateWarehouseDevice_(args[0]||{});
    case 'allocateDevice': return allocateAsset_(user, legacyAllocationPayload_(args[0]||{})).data;
    case 'recoverDevice': return recoverAsset_(user, legacyRecoveryPayload_(args[0]||{})).data;
    case 'transferAsset': return transferAsset_(user, args[0]||{});
    case 'getDeviceTransferHistory': return getDeviceTransferHistory_(args[0]||'');
    case 'updateDeviceTransferNote': return updateDeviceTransferNote_(user, args[0]||'', args[1]||{});

    case 'saveContactRecord': requirePermission_(user,MODULES.CONTACT,(args[0]&&args[0].ID)?'SUA':'THEM'); return legacySaveContact_(args[0]||{});
    case 'toggleContactStatus': requirePermission_(user,MODULES.CONTACT,'SUA'); return legacyToggleContact_(args[0]);

    case 'saveRoleRecord': requirePermission_(user,MODULES.ROLE,(args[0]&&args[0].ID)?'SUA':'THEM'); return legacySaveRole_(args[0]||{});
    case 'saveRolePermissions': requirePermission_(user,MODULES.PERMISSION,'SUA'); return legacySavePermissions_(args[0],args[1]||[]);

    case 'saveUserAccount': requirePermission_(user,MODULES.USER,'SUA'); return legacySaveUser_(args[0]||{});
    case 'toggleUserStatus': requirePermission_(user,MODULES.USER,'SUA'); return legacyToggleUser_(args[0]);

    // Firebase account operations are deliberately disabled in no-login test mode.
    case 'createUserAndSendReset':
    case 'resendUserResetEmail':
    case 'sendFirebasePasswordResetFinal':
      throw new Error('Firebase user-management disabled in NO LOGIN TEST mode.');

    default: throw new Error('NO_LOGIN_ACTION_NOT_ALLOWED:' + fn);
  }
}


// ============================================================================
// V19 - UI SAVE BRIDGE: lưu thật + đọc kiểm tra lại trước khi báo thành công.
// Frontend V19 gọi trực tiếp hàm này thay vì phụ thuộc nhiều lớp RPC cũ.
// ============================================================================
function saveUiFormV19(request) {
  request = request || {};
  const mode = String(request.mode || '').trim();
  const sheet = String(request.sheet || '').trim();
  const payload = Object.assign({}, request.payload || {});
  // V137: lưu Người dùng / Vai trò / sheet Hệ thống phải mở khóa Hệ thống.
  if (SYSTEM_LOCK_V137.SAVE_MODES.indexOf(mode) >= 0 || (mode === 'module' && isSystemSheetV137_(sheet))) requireSystemUnlockV137_(request.systemToken);
  const user = getNoLoginTestUser_();
  let result;
  let verifySheet = '';
  let verifyField = 'ID';
  let verifyId = '';

  switch (mode) {
    case 'work':
      requirePermission_(user, MODULES.WORK, payload.ID ? 'SUA' : 'THEM');
      result = legacySaveWork_(payload);
      verifySheet = V22.SHEETS.work; verifyId = result.ID;
      break;
    case 'daily':
      requirePermission_(user, MODULES.DAILY, payload.ID ? 'SUA' : 'THEM');
      result = legacySaveDaily_(payload);
      verifySheet = V22.SHEETS.daily; verifyId = result.ID;
      break;
    case 'proposal':
      requirePermission_(user, MODULES.PROPOSAL, payload.ID ? 'SUA' : 'THEM');
      result = legacySaveProposal_(payload);
      verifySheet = V22.SHEETS.proposals; verifyId = result.ID;
      break;
    case 'module':
      if (!sheet) throw new Error('V19_SHEET_REQUIRED');
      result = legacySaveModule_(user, sheet, payload);
      verifySheet = sheet;
      verifyField = sheet === 'DM_HANG_MUC_BAO_TRI' ? 'ID_HANG_MUC' : (sheet === 'DM_LICH_BAO_TRI' ? 'ID_LICH' : 'ID');
      verifyId = result && result[verifyField];
      break;
    case 'warehouseDevice':
      if (payload.ID) {
        result = legacySaveModule_(user, V22.SHEETS.assets, payload);
        verifyId = result.ID;
      } else {
        result = legacyCreateWarehouseDevice_(payload).record;
        verifyId = result.ID;
      }
      verifySheet = V22.SHEETS.assets;
      break;
    case 'allocation':
      throw new Error('CAP_PHAT_MODULE_REMOVED_USE_THIET_BI_MANAGER');
    case 'recovery':
      result = recoverAsset_(user, legacyRecoveryPayload_(payload)).data.recovery;
      verifySheet = V22.SHEETS.recoveries; verifyId = result.ID;
      break;
    case 'stock':
      result = saveStockTransaction_(user, payload).data.transaction;
      verifySheet = V22.SHEETS.stockTxn; verifyId = result.ID;
      break;
    case 'contact':
      requirePermission_(user, MODULES.CONTACT, payload.ID ? 'SUA' : 'THEM');
      result = legacySaveContact_(payload);
      verifySheet = catalogSheetV70_(payload.LOAI); verifyId = result.ID;
      break;
    case 'role':
      requirePermission_(user, MODULES.ROLE, payload.ID ? 'SUA' : 'THEM');
      result = legacySaveRole_(payload);
      verifySheet = V22.SHEETS.roles; verifyId = result.ID;
      break;
    case 'user':
      requirePermission_(user, MODULES.USER, payload.ID ? 'SUA' : 'THEM');
      result = legacySaveUser_(payload);
      verifySheet = V22.SHEETS.users; verifyId = result.ID;
      break;
    default:
      throw new Error('V19_SAVE_MODE_NOT_SUPPORTED:' + mode);
  }

  if (!verifySheet || !verifyId) throw new Error('V19_SAVE_VERIFY_TARGET_MISSING:' + mode);
  const writtenRow=v20ctx_().lastWriteRows[verifySheet]||0;
  let persisted=writtenRow?readRowObjectV20_(verifySheet,writtenRow):null;
  if(!persisted||String(persisted[verifyField]||'')!==String(verifyId))persisted=findById_(verifySheet,verifyField,verifyId);
  if (!persisted) throw new Error('V19_SAVE_NOT_PERSISTED:' + verifySheet + ':' + verifyId);

  return {
    ok: true,
    persisted: true,
    mode: mode,
    sheet: verifySheet,
    idField: verifyField,
    id: verifyId,
    record: persisted,
    savedAt: nowStamp_()
  };
}

function uiSaveDiagnosticsV19() {
  const targets = [
    'CONG_VIEC','CVHN_2026','DE_XUAT','NHAT_KY_BAO_TRI','DE_XUAT_MUA_VAT_TU','DE_XUAT_MUA',
    'DE_XUAT_THANH_LY','DE_XUAT_BAO_TRI','THIET_BI','CAP_PHAT','THU_HOI',
    'VAT_TU','NHAP_XUAT_KHO','HOP_DONG','KHACH_THUE','QUAN_LY_TANG','DM_NHAN_VIEN','DM_NHA_THAU','DM_NHA_CUNG_CAP','CHI_TIET_VAN_HANH',
    'DM_KHU_VUC_TOA_NHA','DM_HANG_MUC_BAO_TRI','KHACH_HANG_TIEM_NANG','NGUOI_SU_DUNG','VAI_TRO'
  ];
  return {
    ok:true,
    version:V22.VERSION,
    targets:targets.map(name=>({sheet:name,headers:getHeaders_(name)})),
    serverTime:nowStamp_()
  };
}


// ============================================================================
// V20 - FAST I/O + LAZY BUNDLE LOADING
// Mục tiêu:
// 1) Mỗi RPC chỉ đọc mỗi sheet tối đa một lần bằng cache theo request.
// 2) Tìm ID chỉ đọc cột ID, không quét toàn sheet nếu chưa có cache.
// 3) Ghi/Sửa một dòng bằng 1 setValues thay vì nhiều setValue.
// 4) Khởi động chỉ tải CORE; module khác tải theo nhóm khi người dùng mở trang.
// 5) Sau khi lưu chỉ tải lại nhóm liên quan, không reload toàn hệ thống.
// ============================================================================
var V20_CTX_ = null;

function beginFastRequestV20_(options) {
  options=options||{};
  V20_CTX_ = {
    ss:null,sheets:{},headers:{},rows:{},objects:{},idRows:{},lastWriteRows:{},
    bypassCache:!!options.bypassCache,cacheHits:0,cacheMisses:0
  };
  return V20_CTX_;
}
function v20ctx_(){ return V20_CTX_ || beginFastRequestV20_(); }
const V64_SHEET_CACHE_SECONDS=900;
function v64SheetCacheKey_(sheetName){return 'PL64:SHEET:'+String(sheetName||'').replace(/[^A-Za-z0-9_-]/g,'_')}
function v64RemoveSheetCache_(sheetName){
  try{
    const cache=CacheService.getScriptCache(),base=v64SheetCacheKey_(sheetName),meta=cache.get(base+':META'),keys=[base,base+':META'];
    if(meta){const m=JSON.parse(meta);for(let i=0;i<Number(m.parts||0);i++)keys.push(base+':P'+i)}
    cache.removeAll(keys);
  }catch(ignore){}
}
function v84ReadSheetCache_(sheetName){
  const cache=CacheService.getScriptCache(),base=v64SheetCacheKey_(sheetName),single=cache.get(base);
  if(single)return JSON.parse(single);
  const metaText=cache.get(base+':META');if(!metaText)return null;
  const meta=JSON.parse(metaText),keys=[];for(let i=0;i<Number(meta.parts||0);i++)keys.push(base+':P'+i);
  const values=cache.getAll(keys),rows=[];for(const key of keys){if(!values[key])return null;const part=JSON.parse(values[key]);if(!part||!Array.isArray(part.rows))return null;Array.prototype.push.apply(rows,part.rows)}
  return {headers:meta.headers||[],rows:rows};
}
function v84WriteSheetCache_(sheetName,headers,rows){
  const cache=CacheService.getScriptCache(),base=v64SheetCacheKey_(sheetName),payload=JSON.stringify({headers:headers,rows:rows});
  if(payload.length<=30000){cache.put(base,payload,V64_SHEET_CACHE_SECONDS);return}
  const parts=[];let current=[];
  (rows||[]).forEach(function(row){const next=current.concat([row]);if(current.length&&JSON.stringify({rows:next}).length>30000){parts.push(current);current=[row]}else current=next;});if(current.length)parts.push(current);
  if(!parts.length||parts.length>25)return;
  const values={};parts.forEach(function(part,i){values[base+':P'+i]=JSON.stringify({rows:part})});values[base+':META']=JSON.stringify({headers:headers,parts:parts.length});cache.putAll(values,V64_SHEET_CACHE_SECONDS);
}
function invalidateSheetV20_(sheetName, keepHeaders){
  const c=v20ctx_();
  delete c.rows[sheetName]; delete c.objects[sheetName];
  Object.keys(c.idRows).forEach(k=>{ if(k.indexOf(sheetName+'|')===0) delete c.idRows[k]; });
  if(!keepHeaders) delete c.headers[sheetName];
  v64RemoveSheetCache_(sheetName);
  v124InvalidateDomainsForSheet_(sheetName);
}

// V124: cache theo miền nghiệp vụ. Khóa cache luôn mang thế hệ nên một thao tác
// ghi chỉ vô hiệu hóa các trang liên quan, không xóa cache của toàn hệ thống.
function v124DomainGeneration_(domain){
  const key='PL124_GEN_'+String(domain||'common').toUpperCase();
  const value=Number(PropertiesService.getScriptProperties().getProperty(key)||1);
  return {key:key,value:isFinite(value)&&value>0?value:1};
}
function v124InvalidateDomainsForSheet_(sheetName){
  const name=String(sheetName||'').toUpperCase(),domains=[];
  const add=function(x){if(domains.indexOf(x)<0)domains.push(x)};
  if(/BAO_TRI|LICH_BAO_TRI|HANG_MUC_BAO_TRI/.test(name))add('maintenance');
  if(/VAT_TU|NHAP_XUAT_KHO|KHO_VAT_TU/.test(name))add('inventory');
  if(/THIET_BI|CAP_PHAT|THU_HOI/.test(name))add('asset');
  if(/DE_XUAT/.test(name))add('proposal');
  if(/KHACH_THUE|HOP_DONG|TIEM_NANG|QUAN_LY_TANG/.test(name))add('rental');
  if(/NHAN_VIEN|NHA_THAU|NHA_CUNG_CAP|KHU_VUC/.test(name))add('directory');
  if(/VAI_TRO|PHAN_QUYEN|NGUOI_SU_DUNG|AUDIT/.test(name))add('system');
  if(!domains.length)add('common');
  // Mỗi miền chỉ cần tăng thế hệ MỘT lần trong một request (một lần lưu gọi hàm này nhiều lần).
  const ctx=v20ctx_(),bumped=ctx.bumpedDomains||(ctx.bumpedDomains={}),todo=domains.filter(function(d){return !bumped[d]});
  if(!todo.length)return;
  const props=PropertiesService.getScriptProperties(),updates={};
  todo.forEach(function(domain){bumped[domain]=true;const g=v124DomainGeneration_(domain);updates[g.key]=String(g.value+1)});
  props.setProperties(updates,false);
}

// Override helpers: cache within ONE server request only.
function ss_(){
  const c=v20ctx_();
  if(!c.ss)c.ss=SpreadsheetApp.openById(V22.SPREADSHEET_ID);
  return c.ss;
}

function getSheet_(name){
  const c=v20ctx_();
  if(!c.sheets[name]){
    const sh=ss_().getSheetByName(name);
    if(!sh)throw new Error('SHEET_NOT_FOUND:'+name);
    c.sheets[name]=sh;
  }
  return c.sheets[name];
}
function getHeaders_(sheetName){
  const c=v20ctx_();
  if(c.headers[sheetName])return c.headers[sheetName];
  // Neu snapshot sheet da co trong CacheService thi lay header tu snapshot,
  // khong mo Spreadsheet chi de doc dong 1.
  if(!c.bypassCache){
    try{
      const parsed=v84ReadSheetCache_(sheetName);
      if(parsed&&Array.isArray(parsed.headers)){
        c.headers[sheetName]=parsed.headers;
        if(Array.isArray(parsed.rows)){
          c.rows[sheetName]=parsed.rows;
          c.objects[sheetName]=parsed.rows.map(function(x){return x.obj});
        }
        c.cacheHits++;
        return c.headers[sheetName];
      }
    }catch(ignore){}
  }
  const sh=getSheet_(sheetName), lastCol=sh.getLastColumn();
  const h=lastCol?sh.getRange(1,1,1,lastCol).getValues()[0].map(v=>String(v||'').trim()):[];
  c.headers[sheetName]=h;
  return h;
}
function readObjectsWithRow_(sheetName){
  const c=v20ctx_();
  if(c.rows[sheetName])return c.rows[sheetName];
  if(!c.bypassCache){
    try{
      const parsed=v84ReadSheetCache_(sheetName);
      if(parsed){
        if(parsed&&Array.isArray(parsed.headers)&&Array.isArray(parsed.rows)){
          c.headers[sheetName]=parsed.headers;c.rows[sheetName]=parsed.rows;
          c.objects[sheetName]=parsed.rows.map(x=>x.obj);c.cacheHits++;
          return c.rows[sheetName];
        }
      }
    }catch(ignore){}
  }
  c.cacheMisses++;
  const sh=getSheet_(sheetName), lastRow=sh.getLastRow(), lastCol=sh.getLastColumn();
  if(lastRow<1||lastCol<1){c.rows[sheetName]=[];c.objects[sheetName]=[];return c.rows[sheetName];}
  const values=sh.getRange(1,1,lastRow,lastCol).getValues();
  const headers=values[0].map(v=>String(v||'').trim());
  c.headers[sheetName]=headers;
  const out=[];
  for(let r=1;r<values.length;r++){
    let nonEmpty=false;
    for(let q=0;q<values[r].length;q++){if(values[r][q]!==''&&values[r][q]!==null){nonEmpty=true;break;}}
    if(!nonEmpty)continue;
    const obj={};
    headers.forEach((h,col)=>{if(h)obj[h]=normalizeSheetValue_(values[r][col]);});
    out.push({row:r+1,obj:obj});
  }
  c.rows[sheetName]=out;
  c.objects[sheetName]=out.map(x=>x.obj);
  try{v84WriteSheetCache_(sheetName,headers,out)}catch(ignore){}
  return out;
}
function readObjects_(sheetName){
  const c=v20ctx_();
  if(c.objects[sheetName])return c.objects[sheetName];
  readObjectsWithRow_(sheetName);
  return c.objects[sheetName]||[];
}
function findRowNumberByIdV20_(sheetName,idField,id){
  const c=v20ctx_(), key=sheetName+'|'+idField+'|'+String(id||'');
  if(Object.prototype.hasOwnProperty.call(c.idRows,key))return c.idRows[key];
  if(c.rows[sheetName]){
    const hit=c.rows[sheetName].find(x=>String(x.obj[idField]||'')===String(id||''));
    const n=hit?hit.row:0;c.idRows[key]=n;return n;
  }
  const headers=getHeaders_(sheetName), idx=headers.indexOf(idField), sh=getSheet_(sheetName), lastRow=sh.getLastRow();
  if(idx<0||lastRow<2){c.idRows[key]=0;return 0;}
  const range=sh.getRange(2,idx+1,lastRow-1,1);
  const cell=range.createTextFinder(String(id||'')).matchEntireCell(true).findNext();
  const n=cell?cell.getRow():0;c.idRows[key]=n;return n;
}
function readRowObjectV20_(sheetName,rowNumber){
  if(!rowNumber)return null;
  const headers=getHeaders_(sheetName), sh=getSheet_(sheetName);
  const vals=sh.getRange(rowNumber,1,1,headers.length).getValues()[0];
  const obj={};headers.forEach((h,i)=>{if(h)obj[h]=normalizeSheetValue_(vals[i]);});
  return obj;
}
function findById_(sheetName,idField,id){
  const c=v20ctx_();
  if(c.rows[sheetName]){
    const hit=c.rows[sheetName].find(x=>String(x.obj[idField]||'')===String(id||''));
    return hit?hit.obj:null;
  }
  const row=findRowNumberByIdV20_(sheetName,idField,id);
  return row?readRowObjectV20_(sheetName,row):null;
}
function readVerifiedLastWriteV64_(sheetName,idField,id){
  const row=v20ctx_().lastWriteRows[sheetName]||0;
  const obj=row?readRowObjectV20_(sheetName,row):null;
  if(obj&&String(obj[idField]||'')===String(id||''))return obj;
  return findById_(sheetName,idField,id);
}
// V84.14.27 - Bảo đảm cột lưu họ tên người đề xuất tồn tại trên Sheet gốc.
function ensureSheetColumnV8427_(sheetName,columnName){
  const name=String(columnName||'').trim();if(!name)return;
  const headers=getHeaders_(sheetName);if(headers.indexOf(name)>=0)return;
  const sh=getSheet_(sheetName),column=Math.max(1,sh.getLastColumn()+1);
  sh.getRange(1,column).setValue(name);
  invalidateSheetV20_(sheetName,false);
}
function appendObject_(sheetName,obj){
  const sh=getSheet_(sheetName), headers=getHeaders_(sheetName), row=headers.map(h=>obj[h]!==undefined?obj[h]:'');
  const target=Math.max(2,sh.getLastRow()+1);
  sh.getRange(target,1,1,headers.length).setValues([row]);
  invalidateSheetV20_(sheetName,true);
  v20ctx_().lastWriteRows[sheetName]=target;
  return obj;
}
function updateRowFields_(sheetName,rowNumber,fields){
  const sh=getSheet_(sheetName), headers=getHeaders_(sheetName);
  const row=sh.getRange(rowNumber,1,1,headers.length).getValues()[0];
  Object.keys(fields||{}).forEach(k=>{const i=headers.indexOf(k);if(i>=0)row[i]=fields[k];});
  sh.getRange(rowNumber,1,1,headers.length).setValues([row]);
  invalidateSheetV20_(sheetName,true);
  v20ctx_().lastWriteRows[sheetName]=rowNumber;
}
function updateById_(sheetName,idField,id,fields){
  const row=findRowNumberByIdV20_(sheetName,idField,id);
  if(!row)throw new Error('ROW_NOT_FOUND:'+sheetName+':'+id);
  updateRowFields_(sheetName,row,fields);
}
function upsertObject_(sheetName,idField,obj){
  const id=String(obj[idField]||'').trim();
  if(!id)throw new Error('UPSERT_ID_REQUIRED:'+idField);
  const row=findRowNumberByIdV20_(sheetName,idField,id);
  if(!row)return appendObject_(sheetName,obj);
  updateRowFields_(sheetName,row,obj);
  return obj;
}

// Sequence: một lần đọc + một lần ghi dòng sequence.
function nextIdUnlocked_(sheetName,prefix){
    const sh=getSheet_(V22.SHEETS.sequences), lastRow=sh.getLastRow(), lastCol=sh.getLastColumn();
    const data=(lastRow&&lastCol)?sh.getRange(1,1,lastRow,lastCol).getValues():[];
    const headers=(data[0]||[]).map(v=>String(v||'').trim());
    const ie=headers.indexOf('ENTITY'),ip=headers.indexOf('PREFIX'),il=headers.indexOf('LAST_NUMBER'),iu=headers.indexOf('UPDATED_AT');
    if([ie,ip,il,iu].some(i=>i<0))throw new Error('SYS_ID_SEQUENCE_SCHEMA_INVALID');
    let rowIndex=-1;
    for(let i=1;i<data.length;i++){if(String(data[i][ie])===String(sheetName)){rowIndex=i;break;}}
    let lastNum=0,rowArr;
    if(rowIndex>=1){rowArr=data[rowIndex].slice();lastNum=Number(rowArr[il]||0);}
    else{
      lastNum=maxExistingNumber_(sheetName,prefix);
      rowIndex=data.length;
      rowArr=new Array(headers.length).fill('');rowArr[ie]=sheetName;rowArr[ip]=prefix;
    }
    const next=lastNum+1, width=next<10000?4:String(next).length, id=prefix+String(next).padStart(width,'0');
    rowArr[il]=next;rowArr[iu]=today_();
    sh.getRange(rowIndex+1,1,1,headers.length).setValues([rowArr]);
    invalidateSheetV20_(V22.SHEETS.sequences,true);
    return id;
}

function nextId_(sheetName,prefix){
  const lock=LockService.getScriptLock();lock.waitLock(20000);
  try{return nextIdUnlocked_(sheetName,prefix)}finally{lock.releaseLock();}
}

// Giảm N+1 trong kho: tổng hợp nhập/xuất chỉ bằng một vòng lặp.
function legacyWarehouse_(){
  const mats=readObjects_(V22.SHEETS.materials), txns=readObjects_(V22.SHEETS.stockTxn);
  const agg={};
  txns.forEach(t=>{
    const id=String(t.ID_VAT_TU||'');if(!agg[id])agg[id]={NHAP:0,XUAT:0};
    const typ=norm_(t.LOAI_GIAO_DICH),q=Number(t.SO_LUONG||0);if(!(q>0))return;
    if(typ==='NHAP'||/^NHAP_/.test(typ))agg[id].NHAP+=q;
    else if(typ==='XUAT'||/^XUAT_/.test(typ))agg[id].XUAT+=q;
  });
  const allMaterials=mats.map(m=>{
    const a=agg[String(m.ID||'')]||{NHAP:0,XUAT:0}, stock=Number(m.TON_DAU||0)+a.NHAP-a.XUAT;
    return Object.assign({},m,{TONG_NHAP:a.NHAP,TONG_XUAT:a.XUAT,TON_HIEN_TAI:stock,CANH_BAO:stock<=0?'HẾT HÀNG':stock<=Number(m.TON_TOI_THIEU||0)?'SẮP HẾT':'BÌNH THƯỜNG'});
  });
  // Trả đầy đủ danh mục vật tư; giao diện phân trang 30 dòng và cảnh báo cả mặt hàng tồn 0/1.
  const materials=allMaterials;
  const contacts=indexBy_(readObjects_(V22.SHEETS.employees),'ID');
  const materialsById=indexBy_(mats,'ID');
  const transactions=txns.map(x=>Object.assign({},x,{TEN_VAT_TU:(materialsById[x.ID_VAT_TU]||{}).TEN_VAT_TU||x.ID_VAT_TU||'',NGUOI_THUC_HIEN:(contacts[x.ID_NGUOI_THUC_HIEN]||{}).HO_TEN||x.ID_NGUOI_THUC_HIEN||'',NGUON_GIAO_DICH_HIEN_THI:stockSourceLabelV841430_(x),TON_HIEN_TAI:(allMaterials.find(m=>String(m.ID||'')===String(x.ID_VAT_TU||''))||{}).TON_HIEN_TAI||0}));
  return {materials:materials,transactions:transactions};
}

// Tên API cũ được giữ để tương thích, dữ liệu lấy từ lịch bảo trì V75.
function legacyMaintenancePlans_(){
  return maintenancePlanRowsFromSchedulesV75_();
}

// Các hàm save chỉ trả record vừa ghi; V20 verify một lần sau cùng.
function legacySaveWork_(r){const x=autoFillWorkDoneDateV157_(normalizeWorkRecordV141_(Object.assign({},r)));x.KET_QUA='';if(!x.ID)x.ID=nextId_(V22.SHEETS.work,'CV');upsertObject_(V22.SHEETS.work,'ID',x);return x;}
function legacySaveDaily_(r){const x=normalizeWorkRecordV141_(Object.assign({},r));if(!x.ID)x.ID=nextId_(V22.SHEETS.daily,'HN');upsertObject_(V22.SHEETS.daily,'ID',x);return x;}
function legacySaveProposal_(r){const x=Object.assign({},r);legacyBlockDirectApprovalV132_(V22.SHEETS.proposals,x);ensureSheetColumnV8427_(V22.SHEETS.proposals,'NGUOI_DE_XUAT');if(x.ID_NGUOI_DE_XUAT){const employee=findById_(V22.SHEETS.employees,'ID',x.ID_NGUOI_DE_XUAT);if(employee)x.NGUOI_DE_XUAT=employeeNameV83_(employee,x.ID_NGUOI_DE_XUAT);}if(!x.ID)x.ID=nextId_(V22.SHEETS.proposals,'DX');if(!x.NGAY_TAO)x.NGAY_TAO=today_();upsertObject_(V22.SHEETS.proposals,'ID',x);return x;}
function legacySaveContact_(p){return saveCatalogContactV70_(p)}
function legacySaveRole_(p){const x=Object.assign({},p);if(!x.ID)x.ID=nextId_(V22.SHEETS.roles,'VR');upsertObject_(V22.SHEETS.roles,'ID',x);return x;}
function legacySaveUser_(p){
  ensureSheetColumnV8427_(V22.SHEETS.users,'MAT_KHAU_HE_THONG');
  const x=Object.assign({},p);if(x.EMAIL&&!x.EMAIL_DANG_NHAP)x.EMAIL_DANG_NHAP=x.EMAIL;
  if(x.EMAIL_DANG_NHAP)x.EMAIL_DANG_NHAP=normalizeLoginName_(x.EMAIL_DANG_NHAP);
  delete x.EMAIL;delete x.HO_TEN;delete x.VAI_TRO;delete x.PHONG_BAN;
  if(!x.ID)x.ID=nextId_(V22.SHEETS.users,'US');if(!x.NGAY_TAO)x.NGAY_TAO=nowStamp_();x.NGAY_CAP_NHAT=nowStamp_();upsertObject_(V22.SHEETS.users,'ID',x);return x;
}
function legacySaveModule_(user,sheetName,record){
  sheetName=String(sheetName||'');const module=legacyModuleForSheet_(sheetName);if(module)requirePermission_(user,module,record&&record.ID?'SUA':'THEM');
  legacyBlockDirectApprovalV132_(sheetName,record);
  if(sheetName===V22.SHEETS.work||sheetName===V22.SHEETS.daily)record=normalizeWorkRecordV141_(Object.assign({},record||{}));
  if(sheetName===V22.SHEETS.work){record.KET_QUA='';autoFillWorkDoneDateV157_(record);}
  if(sheetName===V22.SHEETS.prospects||sheetName===V22.SHEETS.tenants){
    ensureRentalSchemaV85_();
    record=normalizeRentalRecordV85_(sheetName,record||{});
  }
  if(sheetName===V22.SHEETS.materials){
    record=Object.assign({},record||{});
    if(String(record.ID||'').trim()) requireMaterialCatalogSystemPassword_(record.SYSTEM_PASSWORD);
    delete record.SYSTEM_PASSWORD;
    delete record.MAT_KHAU_HE_THONG;
    if(!String(record.TEN_VAT_TU||'').trim())throw new Error('TEN_VAT_TU_BAT_BUOC');
    if(!String(record.NHOM||'').trim())throw new Error('NHOM_VAT_TU_BAT_BUOC');
    if(!String(record.DVT||'').trim())throw new Error('DVT_VAT_TU_BAT_BUOC');
    const rawStatus=String(record.TRANG_THAI||'').trim();
    // VAT_TU có Data validation theo đúng nhãn tiếng Việt; không ghi mã nội bộ vào ô này.
    const statusMap={'Sử dụng':'Sử dụng','Ngừng sử dụng':'Ngừng sử dụng','HOAT_DONG':'Sử dụng','NGUNG_SU_DUNG':'Ngừng sử dụng'};
    const status=statusMap[rawStatus]||rawStatus;
    if(['Sử dụng','Ngừng sử dụng'].indexOf(status)<0)throw new Error('TRANG_THAI_VAT_TU_KHONG_HOP_LE');
    record.TRANG_THAI=status;
  }
  if(sheetName===V22.SHEETS.proposalBuy){
    record=Object.assign({},record||{});
    const materialId=String(record.ID_DANH_MUC||'').trim();
    const material=findById_(V22.SHEETS.materials,'ID',materialId);
    if(!materialId||!material)throw new Error('DANH_MUC_VAT_TU_BAT_BUOC');
    record.ID_DANH_MUC=materialId;
    record.TEN_DANH_MUC=material.TEN_VAT_TU||material.TEN||materialId;
    record.DVT=material.DVT||record.DVT||'';
    if(!String(record.ID_DE_XUAT||'').trim()){
      const requesterId=String(record.ID_NGUOI_DE_XUAT||'').trim();
      const requester=requesterId?findById_(V22.SHEETS.employees,'ID',requesterId):null;
      const requesterName=requester?employeeNameV83_(requester,requesterId):String(record.NGUOI_DE_XUAT||'').trim();
      const masterId=nextId_(V22.SHEETS.proposals,'DX');
      upsertObject_(V22.SHEETS.proposals,'ID',{
        ID:masterId,
        NGAY_TAO:today_(),
        NGAY_DE_XUAT:dateOnly_(record.NGAY_DE_XUAT)||today_(),
        LOAI_DE_XUAT:'MUA_THIET_BI',
        ID_NGUOI_DE_XUAT:requesterId,
        NGUOI_DE_XUAT:requesterName,
        PHONG_BAN:String(record.PHONG_BAN||requester?.PHONG_BAN||requester?.DON_VI||'').trim(),
        NOI_DUNG:'Đề xuất mua thiết bị: '+String(material.TEN_VAT_TU||material.TEN||materialId),
        TRANG_THAI:String(record.TRANG_THAI||'Chờ duyệt').trim(),
        GHI_CHU:String(record.GHI_CHU||'').trim()
      });
      record.ID_DE_XUAT=masterId;
    }
  }
  if(sheetName===V22.SHEETS.proposalDispose){
    record=Object.assign({},record||{});
    const assetId=String(record.ID_THIET_BI||'').trim();
    const asset=assetId?findById_(V22.SHEETS.assets,'ID',assetId):null;
    if(!asset||norm_(asset.TRANG_THAI)!=='DANG_SU_DUNG')throw new Error('THIET_BI_THANH_LY_PHAI_DANG_SU_DUNG');
    delete record.TEN_THIET_BI;
    delete record.SO_LUONG_TON;
  }
  if(sheetName==='NHAT_KY_BAO_TRI'){
    const p=Object.assign({},record,{ID_KHU_VUC:record.ID_KHU_VUC||legacyAreaIdFromSnapshot_(record.KHU_VUC,record.TEN_CONG_TY),ID_HANG_MUC:record.ID_HANG_MUC||legacyItemIdFromName_(record.HANG_MUC)});
    return saveMaintenanceLog_(user,p).data.record;
  }
  if(sheetName==='KTDK')throw new Error('INSPECTION_MODULE_REMOVED_V80');
  if(sheetName==='KE_HOACH_BAO_TRI')throw new Error('Kế hoạch bảo trì V22 được sinh từ Lịch/Nhật ký, không nhập trực tiếp bằng form cũ.');
  if(sheetName===V22.SHEETS.assets){
    ensureAssetWarehouseSchemaV83_();record=Object.assign({},record||{});
    if(!String(record.TEN_THIET_BI||'').trim())throw new Error('TEN_THIET_BI_BAT_BUOC');
    const serial=String(record.SERIAL||'').trim();
    if(serial&&readObjects_(V22.SHEETS.assets).some(function(d){return String(d.ID||'')!==String(record.ID||'')&&norm_(d.SERIAL)===norm_(serial)}))throw new Error('SERIAL_THIET_BI_DA_TON_TAI');
    record=normalizeAssetUsageV841432_(record);
    if(!record.ID){record.ID_NGUOI_SU_DUNG='';record.TRANG_THAI='TRONG_KHO';record.NGAY_NHAP_KHO=dateOnly_(record.NGAY_NHAP_KHO||today_());}
  }
  const idField=sheetName==='DM_LICH_BAO_TRI'?'ID_LICH':(sheetName==='DM_HANG_MUC_BAO_TRI'?'ID_HANG_MUC':'ID'),prefix=legacyPrefixForSheet_(sheetName);
  if(!record[idField])record[idField]=nextId_(sheetName,prefix);
  upsertObject_(sheetName,idField,record);
  if(sheetName===V22.SHEETS.buildingAreas||sheetName===V22.SHEETS.maintenanceItems)syncMissingMaintenanceSchedulesV75_();
  return record;
}

// ============================================================================
// V64 - ĐỌC ĐÚNG TRANG + CACHE SHEET NGẮN HẠN
// Không còn tải cả nhóm lớn khi người dùng chỉ mở một trang con.
// force=true (nút Làm mới / sau khi ghi) bỏ qua cache và đọc trực tiếp Sheet.
// ============================================================================

/*
 * V84.15.89-FIX: các hàm đọc nhẹ cho lần khởi động đầu.
 *
 * Dashboard chỉ cần số liệu tổng hợp và một ít dòng gần nhất. Bản cũ gọi
 * readObjects_() cho toàn bộ THIET_BI/DE_XUAT trước khi trả HTML, khiến cold
 * start chậm và popup tải không thoát. Luồng này chỉ đọc các cột cần thiết;
 * trang Công việc vẫn dùng getWorkPageBundleV89() để đọc đủ dữ liệu khi mở.
 */
function v89DashboardColumn_(sheetName, field, startRow, count) {
  if (count <= 0) return [];
  const headers=getHeaders_(sheetName), index=headers.indexOf(String(field||''));
  if (index < 0) return [];
  const values=getSheet_(sheetName).getRange(startRow,index+1,count,1).getValues();
  return values.map(function(row){return normalizeSheetValue_(row[0]);});
}

function v89DashboardRows_(sheetName, startRow, count) {
  if (count <= 0) return [];
  const sh=getSheet_(sheetName), headers=getHeaders_(sheetName), lastCol=sh.getLastColumn();
  if (!lastCol) return [];
  const values=sh.getRange(startRow,1,count,lastCol).getValues(),out=[];
  values.forEach(function(row){
    const obj={};let nonEmpty=false;
    headers.forEach(function(header,index){
      if (!header) return;
      const value=row[index];
      if (value!==''&&value!==null) nonEmpty=true;
      obj[header]=normalizeSheetValue_(value);
    });
    if(nonEmpty)out.push(obj);
  });
  return out;
}

function v89DashboardRecentRows_(sheetName, limit) {
  const sh=getSheet_(sheetName), lastRow=sh.getLastRow();
  if(lastRow<2)return [];
  const count=Math.min(Math.max(1,Number(limit)||30),lastRow-1);
  return v89DashboardRows_(sheetName,lastRow-count+1,count);
}

function v89DashboardWorkRow_(record, contacts) {
  const x=normalizeWorkResultV148_(normalizeWorkRecordV141_(Object.assign({},record||{}))),people=contacts||{};
  x.NGUOI_GIAO=(people[x.ID_NGUOI_GIAO]||{}).HO_TEN||x.NGUOI_GIAO||x.ID_NGUOI_GIAO||'';
  x.NGUOI_THUC_HIEN=(people[x.ID_NGUOI_THUC_HIEN]||{}).HO_TEN||x.NGUOI_THUC_HIEN||x.DON_VI_THUC_HIEN||x.ID_NGUOI_THUC_HIEN||'';
  return workTimingV157_(x,today_());
}

function v89DashboardWorkFast_(contacts) {
  const sh=getSheet_(V22.SHEETS.work),lastRow=sh.getLastRow(),headers=getHeaders_(V22.SHEETS.work);
  if(lastRow<2||!headers.length)return {rows:[],dashboard:legacyDashboard_([])};
  const count=lastRow-1,fields=['ID','NGAY_GIAO','NOI_DUNG','CACH_THUC_HIEN','ID_NGUOI_GIAO','NGUOI_GIAO','ID_NGUOI_THUC_HIEN','NGUOI_THUC_HIEN','NGUOI_LAM_CUNG','DON_VI_THUC_HIEN','DEADLINE','SO_NGAY_CON_LAI','MUC_DO','TIEN_DO','TRANG_THAI','KET_QUA','NGAY_HOAN_THANH'];
  // Dữ liệu vận hành thông thường nhỏ: đọc một range duy nhất sẽ nhanh hơn
  // nhiều lần getRange theo từng cột. Chỉ dùng đường đọc theo cột khi bảng
  // rất lớn để tránh kéo cả bảng vào lần khởi động.
  if(count<=2000){
    const all=v89DashboardRows_(V22.SHEETS.work,2,count).map(function(row){return v89DashboardWorkRow_(row,contacts)});
    // Startup da phai doc toan bo CONG_VIEC de tinh KPI. Tra lai chinh tap
    // du lieu nay de trang Cong viec mo ngay, tranh doc lai Sheet lan thu hai.
    return {rows:all.slice().sort(function(a,b){return String(b.NGAY_GIAO||'').localeCompare(String(a.NGAY_GIAO||''))}),dashboard:legacyDashboard_(all)};
  }
  const columns={};
  fields.forEach(function(field){columns[field]=v89DashboardColumn_(V22.SHEETS.work,field,2,count)});
  const all=[];
  for(let i=0;i<count;i++){
    const row={};let nonEmpty=false;
    fields.forEach(function(field){
      const value=columns[field][i];
      if(value!==''&&value!==null&&value!==undefined)nonEmpty=true;
      if(headers.indexOf(field)>=0)row[field]=value;
    });
    if(nonEmpty)all.push(v89DashboardWorkRow_(row,contacts));
  }
  const sorted=all.slice().sort(function(a,b){return String(b.NGAY_GIAO||'').localeCompare(String(a.NGAY_GIAO||''))});
  return {rows:sorted,dashboard:legacyDashboard_(all)};
}

function v89DashboardDailyFast_(contacts, contractors) {
  try {
    const raw=v89DashboardRecentRows_(V22.SHEETS.daily,60);
    return mapDailyRowsV82_(raw,contacts||{},contractors||{}).sort(function(a,b){return String(b.NGAY||'').localeCompare(String(a.NGAY||''))}).slice(0,30);
  } catch(error) { return []; }
}

function v89DashboardStatsFast_() {
  const result={assetTotal:0,assetMaintenance:0,proposalPending:0,proposals:[]};
  try {
    const assetSheet=getSheet_(V22.SHEETS.assets),assetRows=Math.max(0,assetSheet.getLastRow()-1),assetStatus=v89DashboardColumn_(V22.SHEETS.assets,'TRANG_THAI',2,assetRows);
    result.assetTotal=assetStatus.filter(function(value){return String(value||'').trim()!==''}).length;
    result.assetMaintenance=assetStatus.filter(function(value){return norm_(value)==='BAO_TRI'}).length;
  } catch(ignore) {}
  try {
    const proposalSheet=getSheet_(V22.SHEETS.proposals),proposalRows=Math.max(0,proposalSheet.getLastRow()-1),proposalStatus=v89DashboardColumn_(V22.SHEETS.proposals,'TRANG_THAI',2,proposalRows);
    result.proposalPending=proposalStatus.filter(function(value){const state=norm_(value);return state.indexOf('CHO')>=0&&state.indexOf('DUYET')>=0}).length;
    result.proposals=v89DashboardRecentRows_(V22.SHEETS.proposals,80).filter(function(row){const state=norm_(row.TRANG_THAI);return state.indexOf('CHO')>=0||state.indexOf('PENDING')>=0}).slice(0,6);
  } catch(ignore) {}
  return result;
}

function dashboardCoreV891_(user) {
  requirePermission_(user,MODULES.DASHBOARD,'XEM');
  const employees=readObjects_(V22.SHEETS.employees),contacts=indexBy_(employees,'ID');
  // Lop chao chi dung thong ke Cong viec. CVHN, thiet bi va de xuat se duoc
  // tai dung luc nguoi dung mo tung trang, khong chen vao cold start.
  const work=v89DashboardWorkFast_(contacts);
  return {
    ok:true,coreOk:true,serverTime:today_(),employees:employees,contractors:[],work:work.rows,daily:[],
    dashboard:work.dashboard,dashboardStats:{assetTotal:0,assetMaintenance:0,proposalPending:0},
    proposals:[]
  };
}

function getFastStartupV64(force){
  beginFastRequestV20_({bypassCache:!!force});
  const started=Date.now(),user=getNoLoginTestUser_(),core=dashboardCoreV891_(user),ctx=v20ctx_();
  return {ok:true,core:core,version:'V89-FAST-FIRST-LOAD',elapsedMs:Date.now()-started,cacheHits:ctx.cacheHits,cacheMisses:ctx.cacheMisses,serverTime:nowStamp_()};
}

// V82: trang Tổng quan chỉ nhận số dòng cần hiển thị. Trang Công việc/
// Công việc hằng ngày tải toàn bộ dữ liệu khi người dùng thực sự mở trang.
function getCorePageBundleV82(page,force){
  beginFastRequestV20_({bypassCache:!!force});
  const started=Date.now(),user=fastReadUserV121_(),ctx=v20ctx_();
  requirePermission_(user,MODULES.DASHBOARD,'XEM');
  page=String(page||'').trim();
  const core={ok:true,coreOk:true,serverTime:today_()};
  if(page==='work'){
    core.employees=readObjects_(V22.SHEETS.employees);
    core.work=legacyWorkRows_();core.dashboard=legacyDashboard_(core.work);
  }else if(page==='daily'){
    core.employees=readObjects_(V22.SHEETS.employees);
    core.contractors=readObjects_(V22.SHEETS.contractors);
    core.daily=legacyDailyRows_();
  }else throw new Error('V82_UNKNOWN_CORE_PAGE:'+page);
  return {ok:true,page:page,core:core,version:'V82-CORE-PAGE',elapsedMs:Date.now()-started,cacheHits:ctx.cacheHits,cacheMisses:ctx.cacheMisses,serverTime:nowStamp_()};
}

/**
 * V84.15.89 - cổng dữ liệu riêng cho bảng Công việc.
 *
 * Nguồn hiện tại vẫn là Google Sheets qua Apps Script:
 *   CONG_VIEC       : dữ liệu công việc
 *   DM_NHAN_VIEN    : đổi ID người giao/người thực hiện thành tên
 *
 * Tách cổng này khỏi bundle CORE cũ để sau này có thể đổi sang Firestore /
 * Supabase ở đúng một điểm, không phải sửa lại renderer và bộ lọc giao diện.
 */
function getWorkPageBundleV89(force){
  beginFastRequestV20_({bypassCache:!!force});
  const started=Date.now(),user=getNoLoginTestUser_(),ctx=v20ctx_();
  requirePermission_(user,MODULES.WORK,'XEM');

  const headers=getHeaders_(V22.SHEETS.work);
  const required=['ID','NGAY_GIAO','NOI_DUNG','ID_NGUOI_THUC_HIEN','DEADLINE'];
  const missing=required.filter(h=>headers.indexOf(h)<0);
  if(missing.length)throw new Error('CONG_VIEC_THIEU_COT:'+missing.join(','));

  const work=legacyWorkRows_();
  const employees=readObjects_(V22.SHEETS.employees);
  return {
    ok:true,
    page:'work',
    core:{ok:true,coreOk:true,serverTime:today_(),employees:employees,work:work,dashboard:legacyDashboard_(work)},
    source:{
      provider:'google-sheets',
      transport:'apps-script',
      spreadsheetId:V22.SPREADSHEET_ID,
      sheet:V22.SHEETS.work,
      employeeSheet:V22.SHEETS.employees,
      returnedRows:work.length,
      cacheSeconds:V64_SHEET_CACHE_SECONDS,
      readFields:required,
      writeMethod:'legacySaveWork_',
      authMode:'legacy no-login bridge (no real authentication in this deployment)'
    },
    warnings:missing,
    version:'V89-WORK-DATA-BOUNDARY',
    elapsedMs:Date.now()-started,
    cacheHits:ctx.cacheHits,
    cacheMisses:ctx.cacheMisses,
    serverTime:nowStamp_()
  };
}

/**
 * V120 - duong doc nhanh rieng cho trang Cong viec trong che do Web App
 * khong dang nhap. Khong doc NGUOI_SU_DUNG, VAI_TRO, PHAN_QUYEN truoc khi
 * doc du lieu; cac thao tac ghi van giu nguyen kiem tra quyen hien co.
 */
function getWorkPageBundleFastV120(force){
  beginFastRequestV20_({bypassCache:!!force});
  const started=Date.now(),ctx=v20ctx_();
  const headers=getHeaders_(V22.SHEETS.work);
  const required=['ID','NGAY_GIAO','NOI_DUNG','ID_NGUOI_THUC_HIEN','DEADLINE'];
  const missing=required.filter(function(h){return headers.indexOf(h)<0});
  if(missing.length)throw new Error('CONG_VIEC_THIEU_COT:'+missing.join(','));
  const work=legacyWorkRows_();
  const employees=readObjects_(V22.SHEETS.employees);
  return {
    ok:true,page:'work',
    core:{ok:true,coreOk:true,serverTime:today_(),employees:employees,work:work,dashboard:legacyDashboard_(work)},
    source:{provider:'google-sheets',transport:'apps-script',sheet:V22.SHEETS.work,returnedRows:work.length,cacheSeconds:V64_SHEET_CACHE_SECONDS,readMode:'V120_FAST_NO_LOGIN_READ'},
    warnings:missing,version:'V120-WORK-5S-FAST',elapsedMs:Date.now()-started,
    cacheHits:ctx.cacheHits,cacheMisses:ctx.cacheMisses,serverTime:nowStamp_()
  };
}

// ============================================================================
// V84.15.31 - CHI TIẾT VẬN HÀNH, KIỂM TRA THIẾT BỊ VÀ 5 HÌNH ẢNH
// - Đọc đúng tab CHI_TIET_VAN_HANH qua lớp cache Sheet dùng chung (TTL 5 phút).
// - Kiểm tra schema trước khi trả dữ liệu để lỗi một cột không bị hiểu nhầm là
//   danh sách rỗng.
// - Xem dùng quyền XEM; sửa dữ liệu và ảnh dùng quyền SUA của phân hệ DANH_MUC.
// ============================================================================
const OPERATION_DETAIL_HEADERS_V841420=Object.freeze([
  'ID_NHOM','STT_NHOM','NHOM_HE_THONG','ID_HANG_MUC','HANG_MUC_THIET_BI',
  'NOI_DUNG_KIEM_TRA','TAN_SUAT','CHU_KY_NGAY','VAN_BAN_THEO_DOI','TRANG_THAI','GHI_CHU',
  'HINH_ANH_1','HINH_ANH_2','HINH_ANH_3','HINH_ANH_4','HINH_ANH_5'
]);

const OPERATION_DETAIL_IMAGE_FOLDER_V841531='1fidIqplXmkbA9yeAKrgybhKZD_3hvt27';
const OPERATION_DETAIL_IMAGE_MAX_V841531=5;
const OPERATION_DETAIL_IMAGE_MAX_BYTES_V841531=4*1024*1024;
const OPERATION_DETAIL_IMAGE_COLUMNS_V841531=Object.freeze(['HINH_ANH_1','HINH_ANH_2','HINH_ANH_3','HINH_ANH_4','HINH_ANH_5']);

function operationDetailRowsV841420_(user){
  requirePermission_(user,MODULES.CONTACT,'XEM');
  const sheetName=V22.SHEETS.operationDetails;
  OPERATION_DETAIL_IMAGE_COLUMNS_V841531.forEach(function(column){ensureSheetColumnV8427_(sheetName,column)});
  const entries=readObjectsWithRow_(sheetName),headers=v20ctx_().headers[sheetName]||[],missing=OPERATION_DETAIL_HEADERS_V841420.filter(function(h){return headers.indexOf(h)<0});
  if(missing.length)throw new Error('CHI_TIET_VAN_HANH_THIEU_COT:'+missing.join(','));
  return entries.map(function(entry,index){
    const source=entry.obj||{},row={};
    OPERATION_DETAIL_HEADERS_V841420.forEach(function(h){row[h]=source[h]===undefined?'':source[h]});
    row.ID=String(row.ID_HANG_MUC||'').trim()||('VH-DONG-'+String(entry.row||index+2));
    row.__ROW=entry.row||index+2;
    const issues=[];
    if(!String(row.ID_NHOM||'').trim())issues.push('Thiếu mã nhóm');
    if(!String(row.NHOM_HE_THONG||'').trim())issues.push('Thiếu nhóm hệ thống');
    if(!String(row.ID_HANG_MUC||'').trim())issues.push('Thiếu mã hạng mục');
    if(!String(row.HANG_MUC_THIET_BI||'').trim())issues.push('Thiếu hạng mục thiết bị');
    if(!String(row.NOI_DUNG_KIEM_TRA||'').trim())issues.push('Thiếu nội dung kiểm tra');
    if(!String(row.TAN_SUAT||'').trim()&&!String(row.CHU_KY_NGAY||'').trim())issues.push('Thiếu tần suất/chu kỳ');
    row.CANH_BAO_DU_LIEU=issues.join('; ');
    if(issues.length&&!String(row.TRANG_THAI||'').trim())row.TRANG_THAI='Thiếu dữ liệu';
    return row;
  }).sort(function(a,b){
    const ga=Number(a.STT_NHOM||999999),gb=Number(b.STT_NHOM||999999);
    return ga-gb||String(a.ID_HANG_MUC||'').localeCompare(String(b.ID_HANG_MUC||''),'vi',{numeric:true});
  });
}

function operationImageIdV841531_(value){
  const text=String(value||'').trim(),match=text.match(/\/d\/([^/?#]+)/)||text.match(/[?&]id=([^&#]+)/);return match?decodeURIComponent(match[1]):'';
}

function operationImagesV841531_(record){
  const seen={};return OPERATION_DETAIL_IMAGE_COLUMNS_V841531.map(function(column,index){
    const url=String(record&&record[column]||'').trim(),id=operationImageIdV841531_(url);if(!url||!id||seen[id])return null;seen[id]=true;
    return {slot:index,id:id,name:'Hình ảnh '+(index+1),url:'https://drive.google.com/file/d/'+id+'/view',thumbnailUrl:'https://drive.google.com/thumbnail?id='+encodeURIComponent(id)+'&sz=w1200'};
  }).filter(Boolean);
}

function operationImageFromDataUrlV841531_(folder,data,index,recordId){
  const raw=String(data&&data.dataUrl||'');
  const match=/^data:(image\/(?:png|jpe?g|webp|gif));base64,([A-Za-z0-9+/=\s]+)$/i.exec(raw);
  if(!match)throw new Error('HINH_ANH_KHONG_HOP_LE');
  const bytes=Utilities.base64Decode(match[2].replace(/\s/g,''));
  if(!bytes.length||bytes.length>OPERATION_DETAIL_IMAGE_MAX_BYTES_V841531)throw new Error('HINH_ANH_VUOT_QUA_4MB');
  const mime=match[1].toLowerCase(),ext=({"image/png":"png","image/jpeg":"jpg","image/webp":"webp","image/gif":"gif"})[mime]||'img';
  const safe=String(recordId||'CHI_TIET_VAN_HANH').replace(/[^A-Za-z0-9_-]/g,'_');
  const file=folder.createFile(Utilities.newBlob(bytes,mime,safe+'_'+Date.now()+'_'+(index+1)+'.'+ext));
  try{file.setSharing(DriveApp.Access.ANYONE_WITH_LINK,DriveApp.Permission.VIEW)}catch(ignore){}
  const id=file.getId();return {id:id,name:file.getName(),url:'https://drive.google.com/file/d/'+id+'/view',thumbnailUrl:'https://drive.google.com/thumbnail?id='+encodeURIComponent(id)+'&sz=w1200'};
}

function saveOperationDetailV841531_(user,input){
  requirePermission_(user,MODULES.CONTACT,'SUA');
  input=input||{};const sheetName=V22.SHEETS.operationDetails;
  OPERATION_DETAIL_IMAGE_COLUMNS_V841531.forEach(function(column){ensureSheetColumnV8427_(sheetName,column)});
  const lock=LockService.getScriptLock();lock.waitLock(30000);
  try{
    const rowNumber=Number(input.__ROW||0),entries=readObjectsWithRow_(sheetName);
    const entry=entries.find(function(x){return Number(x.row)===rowNumber})||entries.find(function(x){return String(x.obj.ID_HANG_MUC||'')===String(input.ID_HANG_MUC||'')});
    if(!entry)throw new Error('CHI_TIET_VAN_HANH_KHONG_TON_TAI');
    const editable=['ID_NHOM','STT_NHOM','NHOM_HE_THONG','ID_HANG_MUC','HANG_MUC_THIET_BI','NOI_DUNG_KIEM_TRA','TAN_SUAT','CHU_KY_NGAY','VAN_BAN_THEO_DOI','TRANG_THAI','GHI_CHU'];
    const patch={};editable.forEach(function(k){if(Object.prototype.hasOwnProperty.call(input,k))patch[k]=String(input[k]??'').trim()});
    if(!patch.ID_HANG_MUC)patch.ID_HANG_MUC=String(entry.obj.ID_HANG_MUC||'').trim();
    if(!patch.HANG_MUC_THIET_BI)throw new Error('HANG_MUC_THIET_BI_BAT_BUOC');
    if(!patch.NHOM_HE_THONG)throw new Error('NHOM_HE_THONG_BAT_BUOC');
    const oldImages=operationImagesV841531_(entry.obj),oldById={};oldImages.forEach(function(x){oldById[x.id]=x});
    const requested=Array.isArray(input.HINH_ANH)?input.HINH_ANH:oldImages;
    if(requested.length>OPERATION_DETAIL_IMAGE_MAX_V841531)throw new Error('TOI_DA_5_HINH_ANH');
    const folder=DriveApp.getFolderById(OPERATION_DETAIL_IMAGE_FOLDER_V841531),images=new Array(OPERATION_DETAIL_IMAGE_MAX_V841531),kept={};
    requested.forEach(function(image,index){
      const slot=Number(image&&image.slot);const imageSlot=Number.isInteger(slot)&&slot>=0&&slot<OPERATION_DETAIL_IMAGE_MAX_V841531?slot:index;
      if(images[imageSlot])throw new Error('HINH_ANH_TRUNG_VI_TRI');
      const oldId=String(image&&image.id||'').trim();
      if(oldId&&oldById[oldId]){if(!kept[oldId]){images[imageSlot]=Object.assign({},oldById[oldId],{slot:imageSlot});kept[oldId]=true}return}
      images[imageSlot]=operationImageFromDataUrlV841531_(folder,image,imageSlot,patch.ID_HANG_MUC||entry.obj.ID_HANG_MUC);
    });
    if(images.filter(Boolean).length>OPERATION_DETAIL_IMAGE_MAX_V841531)throw new Error('TOI_DA_5_HINH_ANH');
    OPERATION_DETAIL_IMAGE_COLUMNS_V841531.forEach(function(column,index){patch[column]=images[index]?images[index].url:''});
    updateRowFields_(sheetName,entry.row,patch);
    oldImages.forEach(function(image){if(kept[image.id])return;try{DriveApp.getFileById(image.id).setTrashed(true)}catch(ignore){}});
    const saved=operationDetailRowsV841420_(user).find(function(row){return Number(row.__ROW)===Number(entry.row)});
    return {ok:true,persisted:true,row:saved||Object.assign({},entry.obj,patch,{__ROW:entry.row}),imageCount:images.filter(Boolean).length};
  }finally{lock.releaseLock()}
}

function getOperationDetailV841420(force){
  beginFastRequestV20_({bypassCache:!!force});
  const started=Date.now(),user=getNoLoginTestUser_(),rows=operationDetailRowsV841420_(user),ctx=v20ctx_();
  return {
    ok:true,version:'V84.15.31-OPERATION-DETAIL',rows:rows,total:rows.length,
    invalidRows:rows.filter(function(r){return !!r.CANH_BAO_DU_LIEU}).length,
    elapsedMs:Date.now()-started,cacheHits:ctx.cacheHits,cacheMisses:ctx.cacheMisses,loadedAt:nowStamp_()
  };
}

function getPageBundleV64(page,force,systemToken){
  page=String(page||'').trim();
  if(isSystemPageV137_(page))requireSystemUnlockV137_(systemToken);
  beginFastRequestV20_({bypassCache:!!force});
  const started=Date.now(),user=fastReadUserV121_();
  requirePermission_(user,MODULES.DASHBOARD,'XEM');
  const out={ok:true,page:page,modules:{}},warns=[],timings={};
  const safe=(name,fn,fallback)=>{const mark=Date.now();try{if(typeof fn!=='function')throw new Error('INVALID_FUNCTION');return fn()}catch(e){warns.push(name+': '+String(e&&e.message?e.message:e));return fallback}finally{timings[name]=Date.now()-mark}};
  const equipment=()=>legacyGetModuleDataUnsafe_('THIET_BI');
  let assetRelations=null;
  const relations=(scope)=>assetRelations||(assetRelations=assetWarehouseRelationBundleV83_(scope));
  const areas=()=>readObjects_(V22.SHEETS.buildingAreas);
  const items=()=>readObjects_(V22.SHEETS.maintenanceItems);
  const proposals=()=>legacyProposalList_();
  const contacts=()=>readObjects_(V22.SHEETS.employees);
  const loadEmployees=()=>{
    out.employeesAll=safe('DM_NHAN_VIEN',contacts,[]);
  };

  if(page==='maintenance'){
    out.maintenanceSync={ok:true,skipped:true,reason:'V84_SYNC_ONLY_AFTER_WRITE'};
    const logs=safe('NHAT_KY_BAO_TRI',()=>maintenanceLogsViewV22_(),[]),schedules=safe('DM_LICH_BAO_TRI',()=>maintenanceSchedulesViewV22_(),[]);
    out.modules.maintenanceLog=logs;out.modules.maintenanceSchedules=schedules;out.modules.maintenancePlan=maintenancePlanRowsFromComputedV84_(schedules);out.modules.maintenanceStats=maintenanceStatsFromRowsV84_(schedules,logs);
    out.modules.buildingAreas=safe('DM_KHU_VUC_TOA_NHA',areas,[]);
    out.modules.maintenanceItems=safe('DM_HANG_MUC_BAO_TRI',items,[]);
    out.modules.equipment=safe('THIET_BI',equipment,[]);
  }else if(page==='maintenanceLog'){
    out.modules.maintenanceLog=safe('NHAT_KY_BAO_TRI',()=>maintenanceLogsViewV22_(),[]);
    const schedules=safe('DM_LICH_BAO_TRI',()=>maintenanceSchedulesViewV22_(),[]);
    out.modules.maintenanceSchedules=schedules;
    out.modules.maintenancePlan=maintenancePlanRowsFromComputedV84_(schedules);
    out.modules.buildingAreas=safe('DM_KHU_VUC_TOA_NHA',areas,[]);
    out.modules.maintenanceItems=safe('DM_HANG_MUC_BAO_TRI',items,[]);
    out.modules.equipment=safe('THIET_BI',equipment,[]);
  }else if(page==='maintenancePlan'){
    out.maintenanceSync={ok:true,skipped:true,reason:'V84_SYNC_ONLY_AFTER_WRITE'};
    const schedules=safe('DM_LICH_BAO_TRI',()=>maintenanceSchedulesViewV22_(),[]);out.modules.maintenanceSchedules=schedules;out.modules.maintenancePlan=maintenancePlanRowsFromComputedV84_(schedules);
    out.modules.buildingAreas=safe('DM_KHU_VUC_TOA_NHA',areas,[]);
    out.modules.maintenanceItems=safe('DM_HANG_MUC_BAO_TRI',items,[]);
  }else if(page==='inspection'){
    throw new Error('INSPECTION_MODULE_REMOVED_V80');
  }else if(page==='proposal'){
    out.proposals=safe('DE_XUAT',proposals,[]);
  }else if(page==='proposalBuy'){
    out.proposals=safe('DE_XUAT',proposals,[]);
    out.modules.proposalBuy=safe('DE_XUAT_MUA',()=>legacyGetModuleDataUnsafe_('DE_XUAT_MUA'),[]);
    out.modules.suppliers=safe('DM_NHA_CUNG_CAP',()=>readObjects_(V22.SHEETS.suppliers),[]);
    // Bộ chọn Danh mục vật tư của Đề xuất mua thiết bị lấy trực tiếp từ VAT_TU
    // và dùng tồn hiện tại đã tính từ VAT_TU + NHAP_XUAT_KHO.
    out.modules.materials=safe('DANH_MUC_VAT_TU',()=>getInventorySnapshot_(),[]);
  }else if(page==='proposalBuyMaterial'){
    out.proposals=safe('DE_XUAT',proposals,[]);
    out.modules.proposalBuyMaterial=safe(V22.SHEETS.proposalBuyMaterial,()=>legacyGetModuleDataUnsafe_(V22.SHEETS.proposalBuyMaterial),[]);
    out.modules.suppliers=safe('DM_NHA_CUNG_CAP',()=>readObjects_(V22.SHEETS.suppliers),[]);
    out.modules.materials=safe('VAT_TU',()=>legacyGetModuleDataUnsafe_(V22.SHEETS.materials),[]);
  }else if(page==='proposalDispose'){
    out.proposals=safe('DE_XUAT',proposals,[]);
    const rel=safe('THIET_BI_DANG_SU_DUNG',()=>assetWarehouseRelationBundleV83_('equipment'),{usedDevices:[]});
    const usedDevices=Array.isArray(rel.usedDevices)?rel.usedDevices:[];
    const usedById=indexBy_(usedDevices,'ID');
    out.modules.proposalDispose=safe('DE_XUAT_THANH_LY',()=>legacyGetModuleDataUnsafe_('DE_XUAT_THANH_LY'),[]).map(function(row){
      const device=usedById[String(row.ID_THIET_BI||'')]||{};
      return Object.assign({},row,{TEN_THIET_BI:device.TEN_THIET_BI||device.LOAI_THIET_BI||row.TEN_THIET_BI||row.ID_THIET_BI||'',SO_LUONG_TON:device.ID?1:0});
    });
    out.modules.equipment=usedDevices;
  }else if(page==='proposalMaintenance'){
    out.proposals=safe('DE_XUAT',proposals,[]);
    out.modules.proposalMaintenance=safe('DE_XUAT_BAO_TRI',()=>legacyGetModuleDataUnsafe_('DE_XUAT_BAO_TRI'),[]);
    out.modules.equipment=safe('THIET_BI',equipment,[]);out.modules.buildingAreas=safe('DM_KHU_VUC_TOA_NHA',areas,[]);
  }else if(page==='equipment'){
    const rel=safe('LIEN_KET_THIET_BI_KHO',()=>relations('equipment'),{devices:[],usedDevices:[],warehouseDevices:[],allocations:[],recoveries:[]});out.asset={devices:rel.devices};out.modules.equipment=rel.usedDevices;
    out.modules.buildingAreas=safe('DM_KHU_VUC_TOA_NHA',areas,[]);
  }else if(page==='warehouseDevice'){
    const rel=safe('LIEN_KET_THIET_BI_KHO',()=>relations('warehouse'),{devices:[],usedDevices:[],warehouseDevices:[],allocations:[],recoveries:[]});out.asset={devices:rel.devices};out.modules.equipment=rel.devices;
    out.modules.warehouseDevice=rel.warehouseDevices;
    out.modules.buildingAreas=safe('DM_KHU_VUC_TOA_NHA',areas,[]);
  }else if(page==='allocation'){
    const rel=safe('LIEN_KET_THIET_BI_KHO',()=>relations('allocation'),{devices:[],usedDevices:[],warehouseDevices:[],allocations:[],recoveries:[]});out.modules.equipment=rel.devices;
    out.modules.warehouseDevice=rel.warehouseDevices;out.modules.allocation=rel.allocations;
    out.modules.buildingAreas=safe('DM_KHU_VUC_TOA_NHA',areas,[]);
  }else if(page==='recovery'){
    const rel=safe('LIEN_KET_THIET_BI_KHO',()=>relations('recovery'),{devices:[],usedDevices:[],warehouseDevices:[],allocations:[],recoveries:[]});out.asset={devices:rel.devices};out.modules.equipment=rel.devices;
    out.modules.recovery=rel.recoveries;
    out.modules.buildingAreas=safe('DM_KHU_VUC_TOA_NHA',areas,[]);
  }else if(page==='materialWarehouse'){
    const materialCatalog=safe('DANH_MUC_VAT_TU',()=>getInventorySnapshot_(),[]);
    out.modules.materialCatalog=materialCatalog;
    out.modules.materials=materialCatalog;
    const warehouse=safe('KHO_VAT_TU',()=>legacyWarehouse_(),{materials:[],transactions:[]});
    // Danh mục VAT_TU là nguồn số lượng mặt hàng chính thức; dữ liệu kho chỉ bổ sung số nhập/xuất/tồn.
    // Nhờ vậy trang kho không thể co lại còn vài dòng nếu một kết quả kho/cache cũ từng lọc theo tồn.
    const warehouseById=indexBy_(warehouse.materials||[],'ID');
    warehouse.materials=materialCatalog.map(function(m){return Object.assign({},m,warehouseById[String(m.ID||'')]||{});});
    out.modules.materialWarehouse=warehouse;
  }else if(page==='materials'){
    // Danh mục vật tư chỉ đọc trực tiếp từ VAT_TU; không ghép tồn kho hay dữ liệu bảng khác.
    requirePermission_(user,MODULES.WAREHOUSE,'XEM');
    out.modules.materialCatalog=safe('VAT_TU',()=>legacyGetModuleDataUnsafe_(V22.SHEETS.materials),[]);
  }else if(page==='contracts'){
    out.modules.tenants=safe('KHACH_THUE',()=>legacyGetModuleDataUnsafe_('KHACH_THUE'),[]);
    out.modules.contracts=safe('HOP_DONG',()=>legacyGetModuleDataUnsafe_('HOP_DONG'),[]);
  }else if(page==='tenants'){
    out.modules.tenants=safe('KHACH_THUE',()=>legacyGetModuleDataUnsafe_('KHACH_THUE'),[]);
    out.modules.buildingAreas=safe('DM_KHU_VUC_TOA_NHA',areas,[]);
  }else if(page==='prospects'){
    out.modules.prospects=safe(V22.SHEETS.prospects,()=>legacyGetModuleDataUnsafe_(V22.SHEETS.prospects),[]);
    out.modules.buildingAreas=safe('DM_KHU_VUC_TOA_NHA',areas,[]);
    out.modules.employees=safe('DM_NHAN_VIEN',contacts,[]);
  }else if(page==='floors'){
    out.modules.tenants=safe('KHACH_THUE',()=>legacyGetModuleDataUnsafe_('KHACH_THUE'),[]);
    out.modules.floors=safe('QUAN_LY_TANG',()=>legacyGetModuleDataUnsafe_('QUAN_LY_TANG'),[]);
  }else if(page==='employees'){
    const all=safe('DM_NHAN_VIEN',contacts,[]);out.employeesAll=all;out.modules.employees=all;
  }else if(page==='pcccEmployees'){
    out.modules.pcccEmployees=safe('ĐỘI PCCC',()=>pcccEmployeesV85_(),[]);
  }else if(page==='contractors'){
    out.modules.contractors=safe('DM_NHA_THAU',()=>readObjects_(V22.SHEETS.contractors),[]);
  }else if(page==='suppliers'){
    out.modules.suppliers=safe('DM_NHA_CUNG_CAP',()=>readObjects_(V22.SHEETS.suppliers),[]);
  }else if(page==='buildingAreas'){
    out.modules.buildingAreas=safe('DM_KHU_VUC_TOA_NHA',areas,[]);
  }else if(page==='maintenanceItems'){
    out.modules.maintenanceItems=safe('DM_HANG_MUC_BAO_TRI',items,[]);
  }else if(page==='operationDetail'){
    requirePermission_(user,MODULES.CONTACT,'XEM');
    out.modules.operationDetails=safe('CHI_TIET_VAN_HANH',()=>operationDetailRowsV841420_(user),[]);
  }else if(page==='users'){
    out.employeesAll=safe('DM_NHAN_VIEN',contacts,[]);out.employeeAccess=safe('QUYEN_NHAN_VIEN',()=>legacyEmployeeAccess_(),[]);
    out.modules.roles=safe('VAI_TRO',()=>readObjects_(V22.SHEETS.roles),[]);out.users=safe('NGUOI_SU_DUNG',()=>legacyUsers_(),[]);
  }else if(page==='roles'){
    out.modules.roles=safe('VAI_TRO',()=>readObjects_(V22.SHEETS.roles),[]);
  }else if(page==='permissions'){
    out.modules.roles=safe('VAI_TRO',()=>readObjects_(V22.SHEETS.roles),[]);
    out.modules.permissions=safe('PHAN_QUYEN',()=>readObjects_(V22.SHEETS.permissions),[]);
  }else if(page==='systemAudit'){
    out.modules.auditArchive=safe('DATA_AUDIT_ARCHIVE',()=>readObjects_(V22.SHEETS.audit),[]);
    out.systemAudit=safe('SYSTEM_AUDIT',()=>systemAudit_(),{});
  }else if(page==='systemConfig'){
    out.systemConfig={version:V22.VERSION,databaseId:V22.SPREADSHEET_ID,timezone:V22.TZ,mode:'NO LOGIN TEST'};
  }else if(page==='emailConfig'){
    out.emailConfig=safe('CAU_HINH_EMAIL_CANH_BAO',()=>getEmailAlertConfigV84_(),{ok:false,rows:[],logs:[],serverTime:nowStamp_()});
  }else if(page==='maintenanceDataTool'){
    out.maintenanceDataTool={ready:true,readOnly:false,version:'V79-MAINTENANCE-DATA-REPAIR'};
  }else{
    throw new Error('V64_UNKNOWN_PAGE:'+page);
  }
  if(['maintenance','maintenanceLog','proposal','equipment','warehouseDevice','allocation','recovery','materialWarehouse','contracts'].indexOf(page)>=0){
    loadEmployees();
  }
  const ctx=v20ctx_();if(warns.length)out.warnings=warns;
  out.timings=timings;
  out.elapsedMs=Date.now()-started;out.cacheHits=ctx.cacheHits;out.cacheMisses=ctx.cacheMisses;out.loadedAt=nowStamp_();
  return out;
}

// ================= V124 FAST PAGE LIST =================
const V124_PAGE_SPECS={
  maintenanceLog:{domain:'maintenance',path:'modules.maintenanceLog',columns:['ID','KHU_VUC','HANG_MUC','NGAY_THUC_HIEN','NGUOI_THUC_HIEN','DON_VI_THUC_HIEN','NOI_DUNG_THUC_HIEN','KET_QUA','NGAY_KE_TIEP','CANH_BAO']},
  maintenancePlan:{domain:'maintenance',path:'modules.maintenancePlan',columns:['ID_LICH','HANG_MUC','KHU_VUC','TEN_CONG_TY','NGAY_GOC_GAN_NHAT','NGAY_KE_HOACH','CHU_KY_NGAY','NGUOI_PHU_TRACH','TRANG_THAI','CANH_BAO','GHI_CHU']},
  proposal:{domain:'proposal',path:'proposals',columns:['ID','NGAY_DE_XUAT','LOAI_DE_XUAT','NOI_DUNG','NGUOI_DE_XUAT','TRANG_THAI','GHI_CHU']},
  proposalBuyMaterial:{domain:'proposal',path:'modules.proposalBuyMaterial',columns:['ID','ID_DE_XUAT','NGAY_DE_XUAT','NGAY_TAO','ID_NGUOI_DE_XUAT','PHONG_BAN','TEN_VAT_TU','NHA_CUNG_CAP_HIEN_THI','NGUOI_DE_XUAT','DON_GIA','SO_LUONG','DVT','THANH_TIEN','TRANG_THAI','GHI_CHU']},
  proposalBuy:{domain:'proposal',path:'modules.proposalBuy',columns:['ID','ID_DE_XUAT','NGAY_DE_XUAT','NGAY_TAO','ID_NGUOI_DE_XUAT','PHONG_BAN','ID_DANH_MUC','TEN_DANH_MUC','TEN_THIET_BI','NHA_CUNG_CAP_HIEN_THI','NGUOI_DE_XUAT','DON_GIA','SO_LUONG','DVT','THANH_TIEN','TRANG_THAI','GHI_CHU']},
  proposalDispose:{domain:'proposal',path:'modules.proposalDispose',columns:['ID','ID_DE_XUAT','NGAY_DE_XUAT','NGAY_TAO','ID_NGUOI_DE_XUAT','NGUOI_DE_XUAT','PHONG_BAN','ID_THIET_BI','TEN_THIET_BI','SO_LUONG_TON','TINH_TRANG','CHI_PHI_SUA_DU_KIEN','GIA_TRI_CON_LAI','GIA_DE_XUAT_THANH_LY','LY_DO','TRANG_THAI','GHI_CHU']},
  proposalMaintenance:{domain:'proposal',path:'modules.proposalMaintenance',columns:['ID','ID_DE_XUAT','NGAY_DE_XUAT','NGAY_TAO','ID_NGUOI_DE_XUAT','NGUOI_DE_XUAT','PHONG_BAN','ID_THIET_BI','KHU_VUC','LOAI_DE_XUAT','CHI_PHI_DU_KIEN','HIEN_TRANG','PHUONG_AN_DE_XUAT','TRANG_THAI','GHI_CHU']},
  equipment:{domain:'asset',path:'modules.equipment',columns:['ID','TEN_THIET_BI','LOAI_THIET_BI','THONG_SO','NGUOI_QUAN_LY','NGUOI_SU_DUNG','KHU_VUC_HIEN_THI','TINH_TRANG','TRANG_THAI_HIEN_TAI']},
  warehouseDevice:{domain:'asset',path:'modules.warehouseDevice',columns:['ID','TEN_THIET_BI','LOAI_THIET_BI','HANG','MODEL','SERIAL','KHU_VUC_HIEN_THI','NGAY_NHAP_KHO','TINH_TRANG','TRANG_THAI']},
  allocation:{domain:'asset',path:'modules.allocation',columns:['ID','NGAY_CAP','THIET_BI','NGUOI_NHAN','NGUOI_CAP','KHU_VUC_SU_DUNG','TINH_TRANG_KHI_CAP','NGAY_DU_KIEN_TRA','TRANG_THAI','GHI_CHU']},
  recovery:{domain:'asset',path:'modules.recovery',columns:['ID','NGAY_THU_HOI','THIET_BI','NGUOI_TRA','NGUOI_NHAN_THU_HOI','KHU_VUC_SAU_THU_HOI','TINH_TRANG_KHI_TRA','TRANG_THAI_SAU_THU_HOI','HUONG_XU_LY','GHI_CHU']},
  materialWarehouse:{domain:'inventory',path:'modules.materialWarehouse.materials',columns:['ID','TEN_VAT_TU','NHOM','DVT','TONG_NHAP','TONG_XUAT','TON_HIEN_TAI','TRANG_THAI','CANH_BAO']},
  materials:{domain:'inventory',path:'modules.materialCatalog',columns:['ID','TEN_VAT_TU','NHOM','DVT','TRANG_THAI','GHI_CHU']},
  contracts:{domain:'rental',path:'modules.contracts'},tenants:{domain:'rental',path:'modules.tenants'},prospects:{domain:'rental',path:'modules.prospects'},floors:{domain:'rental',path:'modules.floors'},
  employees:{domain:'directory',path:'modules.employees'},pcccEmployees:{domain:'directory',path:'modules.pcccEmployees'},contractors:{domain:'directory',path:'modules.contractors'},suppliers:{domain:'directory',path:'modules.suppliers'},buildingAreas:{domain:'directory',path:'modules.buildingAreas'},maintenanceItems:{domain:'maintenance',path:'modules.maintenanceItems'},
  users:{domain:'system',path:'users'},roles:{domain:'system',path:'modules.roles'},permissions:{domain:'system',path:'modules.permissions'},systemAudit:{domain:'system',path:'modules.auditArchive'}
};
function v124PathGet_(obj,path){return String(path||'').split('.').reduce(function(value,key){return value&&value[key]},obj)}
function v124PathSet_(obj,path,value){const keys=String(path||'').split('.');let target=obj;keys.forEach(function(key,index){if(index===keys.length-1)target[key]=value;else target=target[key]||(target[key]={})})}
function v124ProjectRows_(rows,columns){if(!Array.isArray(columns)||!columns.length)return rows;return (rows||[]).map(function(row){const out={};columns.forEach(function(key){if(Object.prototype.hasOwnProperty.call(row||{},key))out[key]=row[key]});return out})}
function v124Text_(value){return String(value==null?'':value).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'')}
function v124FilterRows_(rows,query){const q=v124Text_(query).trim();if(!q)return rows;return rows.filter(function(row){return Object.keys(row||{}).some(function(key){return v124Text_(row[key]).indexOf(q)>=0})})}
function v124PageCacheKey_(page,request){const spec=V124_PAGE_SPECS[page]||{domain:'common'},g=v124DomainGeneration_(spec.domain).value,raw=JSON.stringify([page,g,request.page,request.pageSize,request.query||'',request.sortKey||'',request.sortDir||'']);const digest=Utilities.base64EncodeWebSafe(Utilities.computeDigest(Utilities.DigestAlgorithm.MD5,raw)).replace(/=+$/,'');return 'PL124:'+page+':'+digest}
function v124DirectListBundle_(page,force){
  // Các trang dưới đây chỉ cần một sheet để dựng bảng. Không gọi bundle cũ,
  // vì bundle cũ còn đọc đề xuất tổng, nhà cung cấp và danh mục vật tư.
  const sheets={
    proposalBuyMaterial:V22.SHEETS.proposalBuyMaterial,
    proposalBuy:'DE_XUAT_MUA',
    proposalMaintenance:'DE_XUAT_BAO_TRI'
  };
  if(!sheets[page])return null;
  beginFastRequestV20_({bypassCache:!!force});
  const started=Date.now(),user=fastReadUserV121_();
  requirePermission_(user,MODULES.PROPOSAL,'XEM');
  const rows=legacyGetModuleDataUnsafe_(sheets[page])||[],ctx=v20ctx_(),modules={};modules[page]=rows;
  return {ok:true,page:page,modules:modules,referencesDeferred:true,
    elapsedMs:Date.now()-started,cacheHits:ctx.cacheHits,cacheMisses:ctx.cacheMisses,loadedAt:nowStamp_()};
}
function getPageListV124(request){
  request=request||{};const started=Date.now(),page=String(request.pageName||request.page||'').trim(),spec=V124_PAGE_SPECS[page];
  // V137: kiểm tra khóa TRƯỚC khi đọc cache để bản cache không bị lộ.
  if(isSystemPageV137_(page))requireSystemUnlockV137_(request.systemToken);
  if(!spec)return getPageBundleV64(page,!!request.force,request.systemToken);
  // V145: all=true -> trả TOÀN BỘ dòng (giao diện tự chia 50 dòng/trang). Trước
  // đây luôn cắt 100 dòng đầu nên các bảng trên 100 dòng bị thiếu dữ liệu.
  const wantAll=request.all===true;
  let number=Math.max(1,Number(request.pageNumber||request.number||1)),size=Math.min(100,Math.max(10,Number(request.pageSize||50)));const cache=CacheService.getScriptCache(),cacheKey=v124PageCacheKey_(page,{page:wantAll?'ALL':number,pageSize:wantAll?'ALL':size,query:request.query,sortKey:request.sortKey,sortDir:request.sortDir});
  if(!request.force){const hit=cache.get(cacheKey);if(hit){const parsed=JSON.parse(hit);parsed.cacheHits=Number(parsed.cacheHits||0)+1;parsed.elapsedMs=Date.now()-started;return parsed}}
  const bundle=v124DirectListBundle_(page,!!request.force)||getPageBundleV64(page,!!request.force,request.systemToken),source=v124PathGet_(bundle,spec.path)||[];let filtered=v124FilterRows_(source,request.query);
  if(request.sortKey){const key=String(request.sortKey),dir=String(request.sortDir||'asc').toLowerCase()==='desc'?-1:1;filtered=filtered.slice().sort(function(a,b){return v124Text_(a&&a[key]).localeCompare(v124Text_(b&&b[key]),'vi',{numeric:true})*dir})}
  if(wantAll){number=1;size=Math.max(1,filtered.length)}
  const total=filtered.length,pages=Math.max(1,Math.ceil(total/size)),current=Math.min(number,pages),start=(current-1)*size,rows=v124ProjectRows_(filtered.slice(start,start+size),spec.columns);
  v124PathSet_(bundle,spec.path,rows);bundle.pagination={page:current,pageSize:size,total:total,totalPages:pages,hasNext:current<pages};bundle.listColumns=spec.columns||[];bundle.elapsedMs=Date.now()-started;bundle.serverPaged=true;bundle.cacheScope=spec.domain;
  // CacheService giới hạn 100KB tính theo BYTE (tiếng Việt UTF-8 tới 3 byte/ký tự). Ghi cache lỗi
  // không được làm hỏng lượt tải (trước đây Nhật ký hệ thống lớn làm cache.put ném lỗi -> trang trống).
  try{const text=JSON.stringify(bundle);if(text.length<90000&&Utilities.newBlob(text).getBytes().length<90000)cache.put(cacheKey,text,spec.domain==='inventory'||spec.domain==='maintenance'?300:180)}catch(ignore){}
  return bundle;
}
function getPageReferencesV124(page,force){
  page=String(page||'');beginFastRequestV20_({bypassCache:!!force});
  const user=fastReadUserV121_();requirePermission_(user,MODULES.PROPOSAL,'XEM');
  if(page==='proposalBuyMaterial')return {ok:true,page:page,modules:{
    suppliers:readObjects_(V22.SHEETS.suppliers),
    materials:legacyGetModuleDataUnsafe_(V22.SHEETS.materials)
  }};
  if(page==='proposalBuy')return {ok:true,page:page,modules:{
    suppliers:readObjects_(V22.SHEETS.suppliers),
    materials:getInventorySnapshot_()
  }};
  if(page==='proposalMaintenance')return {ok:true,page:page,modules:{
    equipment:legacyGetModuleDataUnsafe_('THIET_BI'),
    buildingAreas:readObjects_(V22.SHEETS.buildingAreas)
  }};
  return {ok:true,page:page,modules:{}};
}
function getPageRecordV124(page,id,systemToken){
  const spec=V124_PAGE_SPECS[String(page||'')];if(!spec)throw new Error('PAGE_NOT_SUPPORTED');
  const bundle=getPageBundleV64(String(page),false,systemToken),rows=v124PathGet_(bundle,spec.path)||[],wanted=String(id||'');
  return rows.find(function(row){return String(row.ID||row.ID_LICH||row.ID_DE_XUAT||'')===wanted})||null;
}

// V20 save: fast request context + verify đúng một lần.

// ============================================================================
// V21 - FORM REOPEN + KPI FIX
// ============================================================================

// ============================================================================
// V22 - MAINTENANCE MODEL SYNC
// Nhật ký: lịch sử thực tế. Lịch: nguồn deadline duy nhất. Kế hoạch: hành động.
// ============================================================================
function maintenanceLogsViewV22_(){
  const contacts={};
  readObjects_(V22.SHEETS.employees).forEach(function(e){const id=String(e.ID||'').trim();if(id)contacts[id]=e});
  const areas=indexBy_(readObjects_(V22.SHEETS.buildingAreas),'ID');
  const schedules=readObjects_(V22.SHEETS.maintenanceSchedules);
  const schedulesById=indexBy_(schedules,'ID_LICH');
  const schedulesByPair={};
  schedules.forEach(function(s){
    schedulesByPair[String(s.ID_KHU_VUC||'')+'|'+String(s.ID_HANG_MUC||'')]=s;
  });
  return readObjects_(V22.SHEETS.maintenanceLogs)
    .filter(r=>!!dateOnly_(r.NGAY_THUC_HIEN))
    .map(r=>{
      const x=Object.assign({},r);
      const area=areas[x.ID_KHU_VUC]||{};
      const areaName=maintenanceAreaLabel_(area,x.KHU_VUC_SNAPSHOT||x.KHU_VUC);
      const employee=contacts[String(x.ID_NGUOI_THUC_HIEN||'').trim()]||{};
      const schedule=schedulesById[String(x.ID_LICH||'')]||schedulesByPair[String(x.ID_KHU_VUC||'')+'|'+String(x.ID_HANG_MUC||'')]||{};
      const isLatest=String(schedule.ID_NHAT_KY_GAN_NHAT||'')===String(x.ID||'');
      x.KHU_VUC_SNAPSHOT=areaName;
      x.KHU_VUC=areaName;
      x.HANG_MUC=x.HANG_MUC_SNAPSHOT||'';
      x.NGUOI_THUC_HIEN=employee.HO_TEN||employee.TEN_NHAN_VIEN||employee.TEN_GOI_KHAC||x.NGUOI_THUC_HIEN||'Chưa khai báo';
      const storedNext=dateOnly_(x.NGAY_KE_TIEP)||'';
      x.NGAY_KE_TIEP=isLatest?(dateOnly_(schedule.NGAY_KE_TIEP)||storedNext):storedNext;
      x.CANH_BAO=maintenanceLogAlertV77_(x.NGAY_KE_TIEP,x.NGAY_THUC_HIEN,isLatest);
      return x;
    })
    .sort((a,b)=>dateOnly_(b.NGAY_THUC_HIEN).localeCompare(dateOnly_(a.NGAY_THUC_HIEN)) || String(b.ID||'').localeCompare(String(a.ID||'')));
}

// Dòng mới nhất mang cảnh báo hạn. Dòng lịch sử quá 15 ngày được chốt ĐÃ BẢO TRÌ.
function maintenanceLogAlertV77_(dueDate,performedDate,isLatest){
  const performed=dateOnly_(performedDate);
  if(!isLatest&&performed&&daysBetween_(performed,today_())>15)return'ĐÃ BẢO TRÌ';
  const due=dateOnly_(dueDate);
  if(!due)return'THIẾU CHU KỲ';
  const days=daysBetween_(today_(),due);
  if(days<0)return'TRỄ HẠN';
  if(days===0)return'ĐẾN HẠN';
  if(days<=7)return'SẮP ĐẾN HẠN';
  return'MỚI BẢO TRÌ';
}

function maintenanceSchedulesViewV22_(){
  const areas=indexBy_(readObjects_(V22.SHEETS.buildingAreas),'ID');
  const items=indexBy_(readObjects_(V22.SHEETS.maintenanceItems),'ID_HANG_MUC');
  const contacts=indexBy_(readObjects_(V22.SHEETS.employees),'ID');
  return getMaintenanceSchedulesComputed_().map(r=>{
    const x=Object.assign({},r),a=areas[x.ID_KHU_VUC]||{},i=items[x.ID_HANG_MUC]||{};
    x.KHU_VUC=maintenanceAreaLabel_(a,x.ID_KHU_VUC);
    x.CHI_TIET_KHU_VUC=a.KHU_VUC||'';
    x.TEN_CONG_TY=a.TEN_CONG_TY||'';
    x.HANG_MUC=i.TEN_HANG_MUC||x.ID_HANG_MUC||'';
    x.NGUOI_PHU_TRACH=(contacts[x.ID_NGUOI_PHU_TRACH]||{}).HO_TEN||x.ID_NGUOI_PHU_TRACH||'';
    return x;
  }).sort((a,b)=>{
    const rank=v=>v==='TRỄ LỊCH'?0:v==='ĐẾN HẠN HÔM NAY'?1:v==='SẮP ĐẾN HẠN'?2:v==='CÒN LỊCH'?3:v==='CHỜ NGÀY GỐC'?4:5;
    return rank(a.CANH_BAO)-rank(b.CANH_BAO) || String(a.NGAY_KE_TIEP||'9999').localeCompare(String(b.NGAY_KE_TIEP||'9999'));
  });
}

// V75: Kế hoạch bảo trì là một cách trình bày của chính DM_LICH_BAO_TRI.
// Giữ các bí danh cũ ở lớp hiển thị để bộ lọc/thao tác hiện có tiếp tục hoạt động,
// nhưng không đọc hoặc ghi KE_HOACH_BAO_TRI.
function maintenancePlanRowsFromSchedulesV75_(){
  return maintenanceSchedulesViewV22_().map(function(s){
    return Object.assign({},s,{
      ID:s.ID_LICH,
      KHU_VUC_SNAPSHOT:s.KHU_VUC||'',
      TEN_CONG_TY_SNAPSHOT:s.TEN_CONG_TY||'',
      HANG_MUC_SNAPSHOT:s.HANG_MUC||'',
      NGAY_KE_HOACH:s.NGAY_KE_TIEP||'',
      NGUOI_PHU_TRACH:s.NGUOI_PHU_TRACH||'',
      CHU_KY:s.CHU_KY_NGAY||'',
      ID_NHAT_KY_GOC:s.ID_NHAT_KY_GAN_NHAT||'',
      DATA_SOURCE:'DM_LICH_BAO_TRI'
    });
  });
}

function maintenancePlanRowsFromComputedV84_(schedules){
  return (schedules||[]).map(function(s){return Object.assign({},s,{ID:s.ID_LICH,KHU_VUC_SNAPSHOT:s.KHU_VUC||'',TEN_CONG_TY_SNAPSHOT:s.TEN_CONG_TY||'',HANG_MUC_SNAPSHOT:s.HANG_MUC||'',NGAY_KE_HOACH:s.NGAY_KE_TIEP||'',NGUOI_PHU_TRACH:s.NGUOI_PHU_TRACH||'',CHU_KY:s.CHU_KY_NGAY||'',ID_NHAT_KY_GOC:s.ID_NHAT_KY_GAN_NHAT||'',DATA_SOURCE:'DM_LICH_BAO_TRI'});});
}

function maintenanceStatsFromRowsV84_(schedules,logs){
  schedules=schedules||[];logs=logs||[];
  const active=schedules.filter(function(s){return norm_(s.TRANG_THAI)==='HOAT_DONG';}),waitBase=schedules.filter(function(s){return norm_(s.TRANG_THAI)==='CHO_NGAY_GOC'||s.CANH_BAO==='CHỜ NGÀY GỐC';});
  return {activeSchedules:active.length,overdue:active.filter(function(s){return s.CANH_BAO==='TRỄ LỊCH';}).length,dueToday:active.filter(function(s){return s.CANH_BAO==='ĐẾN HẠN HÔM NAY';}).length,dueSoon:active.filter(function(s){return s.CANH_BAO==='SẮP ĐẾN HẠN';}).length,waitBase:waitBase.length,historyCount:logs.length,historyAreas:new Set(logs.map(function(r){return String(r.ID_KHU_VUC||'');}).filter(Boolean)).size};
}

function saveUiFormV22(request){
  // Dùng cache cho quyền và danh mục trong lúc lưu. Mỗi hàm ghi vẫn xóa cache
  // đúng sheet; dòng vừa ghi vẫn được đọc trực tiếp để xác nhận thành công.
  beginFastRequestV20_({bypassCache:false});
  const started=Date.now();
  const res=saveUiFormV19(request);
  res.version='V23-MAINTENANCE-FILTER-SORT';
  res.saveElapsedMs=Date.now()-started;
  return res;
}


// ============================================================================
// V26 - UNIVERSAL SAFE EDIT BRIDGE
// Bổ sung nút Sửa cho các bảng nghiệp vụ trước đây chỉ xem / thao tác đặc thù.
// Các bảng workflow chỉ cho sửa trường an toàn, không cho đổi khóa thiết bị/liên kết.
// ============================================================================
function saveUniversalEditV26(request) {
  beginFastRequestV20_({bypassCache:true});
  request = request || {};
  const user = getNoLoginTestUser_();
  const containerId = String(request.containerId || '').trim();
  if (SYSTEM_LOCK_V137.CONTAINERS.indexOf(containerId) >= 0) requireSystemUnlockV137_(request.systemToken);
  const id = String(request.id || '').trim();
  const p = Object.assign({}, request.payload || {});
  let persisted = null;
  let outId = id;

  function pick_(src, keys) {
    const o = {};
    keys.forEach(function(k){ if (Object.prototype.hasOwnProperty.call(src,k)) o[k]=src[k]; });
    return o;
  }

  if (containerId === 'maintenanceScheduleTable') {
    requirePermission_(user, MODULES.MAINTENANCE, 'SUA');
    const old = findById_(V22.SHEETS.maintenanceSchedules, 'ID_LICH', id);
    if (!old) throw new Error('MAINTENANCE_SCHEDULE_NOT_FOUND:' + id);
    const patch = pick_(p,['CHU_KY_NGAY','CANH_BAO_TRUOC_NGAY','ID_NGUOI_PHU_TRACH','TRANG_THAI','GHI_CHU']);
    saveMaintenanceSchedule_(user, Object.assign({}, old, patch));
    persisted = readVerifiedLastWriteV64_(V22.SHEETS.maintenanceSchedules, 'ID_LICH', id);
  }
  else if (containerId === 'maintenancePlanTable') {
    requirePermission_(user, MODULES.MAINTENANCE, 'SUA');
    const old = findById_(V22.SHEETS.maintenanceSchedules, 'ID_LICH', id);
    if (!old) throw new Error('MAINTENANCE_SCHEDULE_NOT_FOUND:' + id);
    const patch = pick_(p,['CHU_KY_NGAY','CANH_BAO_TRUOC_NGAY','ID_NGUOI_PHU_TRACH','TRANG_THAI','GHI_CHU']);
    saveMaintenanceSchedule_(user, Object.assign({}, old, patch));
    persisted = readVerifiedLastWriteV64_(V22.SHEETS.maintenanceSchedules, 'ID_LICH', id);
  }
  else if (containerId === 'allocationTable') {
    throw new Error('CAP_PHAT_MODULE_REMOVED_USE_THIET_BI_MANAGER');
  }
  else if (containerId === 'deviceTransferTable') {
    requirePermission_(user, MODULES.ASSET, 'SUA');
    if (norm_(request.mode) === 'TRANSFER') {
      const rec = transferAsset_(user, Object.assign({}, p, { ID_THIET_BI: id }));
      persisted = rec; outId = rec.ID;
    } else {
      const patch = pick_(p, ['NGAY_CHUYEN','LY_DO','GHI_CHU']);
      updateDeviceTransferNote_(user, id, patch);
      persisted = readVerifiedLastWriteV64_(V22.SHEETS.deviceTransfers, 'ID', id);
    }
  }
  else if (containerId === 'recoveryTable') {
    requirePermission_(user, MODULES.RECOVERY, 'SUA');
    const old = findById_(V22.SHEETS.recoveries, 'ID', id);
    if (!old) throw new Error('RECOVERY_NOT_FOUND:' + id);
    // Không cho sửa ID_THIET_BI / TRANG_THAI_SAU_THU_HOI tại đây để tránh lệch THIET_BI.
    const patch = pick_(p,['NGAY_THU_HOI','ID_NGUOI_TRA','ID_NGUOI_NHAN_THU_HOI','TINH_TRANG_KHI_TRA','HUONG_XU_LY','GHI_CHU']);
    updateById_(V22.SHEETS.recoveries, 'ID', id, patch);
    persisted = readVerifiedLastWriteV64_(V22.SHEETS.recoveries, 'ID', id);
    const recoveries=readObjects_(V22.SHEETS.recoveries);
    if(recoveries&&Array.isArray(recoveries)){
      const filtered=recoveries.filter(function(r){return String(r.ID_THIET_BI||'')===String(persisted.ID_THIET_BI||'');});
      if(filtered&&filtered.length>0){
        const sorted=filtered.sort(function(a,b){return String(dateOnly_(a.NGAY_THU_HOI)||'').localeCompare(String(dateOnly_(b.NGAY_THU_HOI)||''))||String(a.ID||'').localeCompare(String(b.ID||''));});
        const latestRecovery=sorted[sorted.length-1];
        if(latestRecovery&&String(latestRecovery.ID)===String(id))updateById_(V22.SHEETS.assets,'ID',persisted.ID_THIET_BI,{ID_NGUOI_SU_DUNG:'',ID_KHU_VUC:persisted.ID_KHU_VUC_SAU_THU_HOI||'',PHONG_BAN:'',TRANG_THAI:persisted.TRANG_THAI_SAU_THU_HOI||'TRONG_KHO'});
      }
    }
  }
  else if (containerId === 'stockTxnTable') {
    requirePermission_(user, MODULES.WAREHOUSE, 'SUA');
    if(norm_(request.mode)==='ADJUST'){
      persisted=createStockAdjustmentV841430_(user,id,p);outId=persisted.ID;
    }else{
      persisted=saveStockInfoEditV841430_(user,id,p);
    }
  }
  else if (containerId === 'permissionsTable') {
    requirePermission_(user, MODULES.PERMISSION, 'SUA');
    const old = findById_(V22.SHEETS.permissions, 'ID', id);
    if (!old) throw new Error('PERMISSION_NOT_FOUND:' + id);
    const patch = pick_(p,['ID_VAI_TRO','MODULE','XEM','THEM','SUA','XOA','IN_XUAT','DUYET']);
    const merged = Object.assign({}, old, patch, {ID:id});
    legacySaveModule_(user, V22.SHEETS.permissions, merged);
    persisted = readVerifiedLastWriteV64_(V22.SHEETS.permissions, 'ID', id);
  }
  else {
    throw new Error('V26_EDIT_NOT_SUPPORTED:' + containerId);
  }

  if (!persisted) throw new Error('V26_SAVE_NOT_PERSISTED:' + containerId + ':' + id);
  return {ok:true,persisted:true,id:outId,containerId:containerId,mode:String(request.mode||'info'),record:persisted,version:'V84.14.30-STOCK-SAFE-EDIT'};
}


// ============================================================================
// V38 - MAINTENANCE LOG LOAD DIAGNOSTIC
// ============================================================================
function getMaintenanceLogDiagnosticV38(){
  beginFastRequestV20_();
  const user=getNoLoginTestUser_();
  requirePermission_(user,MODULES.MAINTENANCE,'XEM');
  const raw=readObjects_(V22.SHEETS.maintenanceLogs);
  const rows=maintenanceLogsViewV22_();
  return {
    ok:true,
    sheet:V22.SHEETS.maintenanceLogs,
    rawRows:raw.length,
    validDatedRows:rows.length,
    firstId:rows.length?rows[0].ID:'',
    lastId:rows.length?rows[rows.length-1].ID:'',
    serverTime:nowStamp_(),
    version:'V38-MAINTENANCE-LOG-LOAD-FIX'
  };
}


// ============================================================================
// V75 - MAINTENANCE PLAN DIRECT LOAD + AUTO SYNC
// Tên hàm V44 được giữ để tương thích frontend cũ; nguồn thật là DM_LICH_BAO_TRI.
// ============================================================================
// ============================================================================
// V84 - EMAIL ALERTS (CONFIG-DRIVEN, OFF BY DEFAULT)
// Cấu hình tại CAU_HINH_EMAIL_CANH_BAO; nhật ký gửi tại NHAT_KY_EMAIL_CANH_BAO.
// Không gửi nếu BAT khác BẬT/TRUE/1/X, không gửi khi không có người nhận hợp lệ,
// và chống gửi lặp theo MA_CANH_BAO + ID_BAN_GHI + ngày hiện tại.
// ============================================================================
const EMAIL_ALERT_DEFAULTS_V84_ = Object.freeze([
  {ID:'EMAIL001',MA_CANH_BAO:'CONG_VIEC_QUA_HAN',TEN_CANH_BAO:'Công việc quá hạn',BAT:'TẮT',SO_NGAY_BAO_TRUOC:0,GIO_GUI:'07:00',EMAIL_QUAN_TRI:'',GHI_CHU:'Cảnh báo công việc đã quá hạn.'},
  {ID:'EMAIL002',MA_CANH_BAO:'CONG_VIEC_CU_CHUA_XONG',TEN_CANH_BAO:'Công việc cũ chưa xong',BAT:'TẮT',SO_NGAY_BAO_TRUOC:0,GIO_GUI:'07:00',EMAIL_QUAN_TRI:'',GHI_CHU:'Cảnh báo công việc giao từ ngày trước nhưng chưa hoàn thành.'},
  {ID:'EMAIL003',MA_CANH_BAO:'CVHN_CHUA_XONG',TEN_CANH_BAO:'Công việc hằng ngày chưa xong',BAT:'TẮT',SO_NGAY_BAO_TRUOC:0,GIO_GUI:'07:00',EMAIL_QUAN_TRI:'',GHI_CHU:'Cảnh báo công việc hằng ngày chưa hoàn thành.'},
  {ID:'EMAIL004',MA_CANH_BAO:'BAO_TRI_SAP_HAN',TEN_CANH_BAO:'Bảo trì sắp đến hạn',BAT:'TẮT',SO_NGAY_BAO_TRUOC:7,GIO_GUI:'07:00',EMAIL_QUAN_TRI:'',GHI_CHU:'Báo trước theo số ngày cấu hình.'},
  {ID:'EMAIL005',MA_CANH_BAO:'BAO_TRI_DEN_HAN',TEN_CANH_BAO:'Bảo trì đến hoặc trễ hạn',BAT:'TẮT',SO_NGAY_BAO_TRUOC:0,GIO_GUI:'07:00',EMAIL_QUAN_TRI:'',GHI_CHU:'Cảnh báo lịch bảo trì đến hạn hoặc trễ hạn.'},
  {ID:'EMAIL006',MA_CANH_BAO:'NHAT_KY_BAO_TRI',TEN_CANH_BAO:'Nhật ký bảo trì cần theo dõi',BAT:'TẮT',SO_NGAY_BAO_TRUOC:7,GIO_GUI:'07:00',EMAIL_QUAN_TRI:'',GHI_CHU:'Theo dõi ngày kế tiếp trong nhật ký bảo trì.'},
  {ID:'EMAIL007',MA_CANH_BAO:'DE_XUAT_CHO_DUYET',TEN_CANH_BAO:'Đề xuất đang chờ duyệt',BAT:'TẮT',SO_NGAY_BAO_TRUOC:0,GIO_GUI:'07:00',EMAIL_QUAN_TRI:'',GHI_CHU:'Cảnh báo đề xuất đang chờ xử lý.'},
  {ID:'EMAIL008',MA_CANH_BAO:'KHO_VAT_TU_SAP_HET',TEN_CANH_BAO:'Vật tư sắp hết',BAT:'TẮT',SO_NGAY_BAO_TRUOC:0,GIO_GUI:'07:00',EMAIL_QUAN_TRI:'',GHI_CHU:'Cảnh báo tồn kho bằng hoặc thấp hơn tồn tối thiểu.'},
  {ID:'EMAIL009',MA_CANH_BAO:'DU_LIEU_LOI',TEN_CANH_BAO:'Dữ liệu cần kiểm tra',BAT:'TẮT',SO_NGAY_BAO_TRUOC:0,GIO_GUI:'07:00',EMAIL_QUAN_TRI:'',GHI_CHU:'Cảnh báo khi kiểm tra hệ thống phát hiện lỗi dữ liệu.'},
  {ID:'EMAIL010',MA_CANH_BAO:'KHACH_THUE_SAP_HET_HAN',TEN_CANH_BAO:'Khách đang thuê sắp hết hạn',BAT:'TẮT',SO_NGAY_BAO_TRUOC:30,GIO_GUI:'07:00',EMAIL_QUAN_TRI:'',GHI_CHU:'Báo trước ngày kết thúc thuê.'},
  {ID:'EMAIL011',MA_CANH_BAO:'KHACH_TIEM_NANG_DEN_HAN_LIEN_HE',TEN_CANH_BAO:'Khách hàng tiềm năng đến hạn liên hệ',BAT:'TẮT',SO_NGAY_BAO_TRUOC:0,GIO_GUI:'07:00',EMAIL_QUAN_TRI:'',GHI_CHU:'Cảnh báo đúng ngày hẹn liên hệ.'},
  {ID:'EMAIL012',MA_CANH_BAO:'KHACH_TIEM_NANG_QUA_HAN_LIEN_HE',TEN_CANH_BAO:'Khách hàng tiềm năng quá hạn liên hệ',BAT:'TẮT',SO_NGAY_BAO_TRUOC:0,GIO_GUI:'07:00',EMAIL_QUAN_TRI:'',GHI_CHU:'Cảnh báo khi đã quá ngày hẹn liên hệ.'}
]);

// Kiểm tra cấu trúc sheet email tối đa 1 lần/6 giờ (CacheService) và 1 lần/lượt chạy.
let EMAIL_SCHEMA_OK_V84_=false;
function ensureEmailAlertSchemaV84_(force){
  if(EMAIL_SCHEMA_OK_V84_&&!force)return {ok:true,cached:true};
  const flagKey='PL86:EMAIL_SCHEMA_OK',cache=CacheService.getScriptCache();
  if(!force&&cache.get(flagKey)){EMAIL_SCHEMA_OK_V84_=true;return {ok:true,cached:true};}
  const specs={
    CAU_HINH_EMAIL_CANH_BAO:['ID','MA_CANH_BAO','TEN_CANH_BAO','BAT','SO_NGAY_BAO_TRUOC','GIO_GUI','EMAIL_QUAN_TRI','GHI_CHU','EMAIL_GUI','EMAIL_NHAN','GUI_NGUOI_THUC_HIEN','GUI_NGUOI_LAM_CUNG','GUI_NGUOI_GIAO'],
    NHAT_KY_EMAIL_CANH_BAO:['ID_EMAIL','NGAY_GUI','MA_CANH_BAO','MODULE','ID_BAN_GHI','NGUOI_NHAN','TIEU_DE','TRANG_THAI','SO_NGAY_CON_LAI','NOI_DUNG']
  };
  const added={};
  Object.keys(specs).forEach(function(name){
    let sh=ss_().getSheetByName(name);
    if(!sh)sh=ss_().insertSheet(name);
    const current=getHeaders_(name), missing=specs[name].filter(function(h){return current.indexOf(h)<0;});
    if(!current.length)sh.getRange(1,1,1,specs[name].length).setValues([specs[name]]);
    else if(missing.length)sh.getRange(1,current.length+1,1,missing.length).setValues([missing]);
    if(!current.length||missing.length)invalidateSheetV20_(name,false);
    added[name]=missing;
  });
  const removed=removeEmailAlertConfigCodesV84_(['HOP_DONG_SAP_HET_HAN']);
  const existing=readObjects_(V22.SHEETS.emailConfig),byCode=indexBy_(existing,'MA_CANH_BAO'),created=[];
  EMAIL_ALERT_DEFAULTS_V84_.forEach(function(def){
    if(byCode[def.MA_CANH_BAO])return;
    appendObject_(V22.SHEETS.emailConfig,def);
    created.push(def.MA_CANH_BAO);
  });
  EMAIL_SCHEMA_OK_V84_=true;try{cache.put(flagKey,'1',21600)}catch(ignore){}
  return {ok:true,added:added,removed:removed,defaultsCreated:created,configCount:readObjects_(V22.SHEETS.emailConfig).length};
}

function removeEmailAlertConfigCodesV84_(codes){
  const wanted=(Array.isArray(codes)?codes:[]).map(function(x){return String(x||'').trim();}).filter(Boolean);
  if(!wanted.length)return [];
  const entries=readObjectsWithRow_(V22.SHEETS.emailConfig).filter(function(entry){return wanted.indexOf(String(entry.obj.MA_CANH_BAO||'').trim())>=0;}).sort(function(a,b){return b.row-a.row;});
  const sh=getSheet_(V22.SHEETS.emailConfig);
  entries.forEach(function(entry){sh.deleteRow(entry.row);});
  if(entries.length)invalidateSheetV20_(V22.SHEETS.emailConfig,false);
  return entries.map(function(entry){return {row:entry.row,MA_CANH_BAO:entry.obj.MA_CANH_BAO,ID:entry.obj.ID};});
}

function emailAlertEnabledV84_(row){
  const s=norm_(row&&row.BAT);
  return ['BAT','TRUE','1','X','YES','CO'].indexOf(s)>=0;
}

// Đọc bảng cấu hình (nhỏ) bằng giá trị hiển thị để GIO_GUI giữ đúng giờ (Sheets hay đổi "07:00" thành kiểu thời gian).
function emailConfigV84_(){
  ensureEmailAlertSchemaV84_();
  const sh=getSheet_(V22.SHEETS.emailConfig),lastRow=sh.getLastRow(),lastCol=sh.getLastColumn();
  if(lastRow<2||lastCol<1)return [];
  const vals=sh.getRange(1,1,lastRow,lastCol).getDisplayValues(),headers=vals[0].map(function(h){return String(h||'').trim();});
  return vals.slice(1).filter(function(r){return r.some(function(v){return v!=='';});}).map(function(r){
    const o={};headers.forEach(function(h,i){if(h)o[h]=r[i];});o.GIO_GUI=normalizeEmailTimeV84_(o.GIO_GUI,'07:00');return o;
  });
}

// Người nhận: nhân viên (theo mã hoặc họ tên; ô "người làm cùng" có thể chứa nhiều người, cách nhau , ;)
// + danh sách email nhận thêm của cấu hình.
function emailRecipientsV84_(ids, admin){
  const out=[],list=readObjects_(V22.SHEETS.employees),emps=indexBy_(list,'ID'),byName={};
  list.forEach(function(e){const n=norm_(e.HO_TEN||e.TEN_NHAN_VIEN||'');if(n&&!byName[n])byName[n]=e;});
  const add=function(email){email=normalizeEmail_(email);if(email&&/^\S+@\S+\.\S+$/.test(email)&&out.indexOf(email)<0)out.push(email);};
  (Array.isArray(ids)?ids:[ids]).forEach(function(v){
    String(v==null?'':v).split(/\s*[,;]\s*/).forEach(function(id){id=String(id||'').trim();if(!id)return;
      if(/@/.test(id))return add(id);
      const e=emps[id]||byName[norm_(id)];if(e)add(e.EMAIL);});
  });
  String(admin||'').split(/[;,\s]+/).forEach(add);
  return out;
}
// Cờ gửi cho nhân viên theo vai trò (ô trống = mặc định: người thực hiện BẬT, người giao việc BẬT, người làm cùng TẮT).
function emailFlagV86_(cfg,key,def){const v=String(cfg&&cfg[key]||'').trim();return v?emailAlertEnabledV84_({BAT:v}):def;}
function emailPeopleV86_(cfg,roles){
  const out=[];
  if(emailFlagV86_(cfg,'GUI_NGUOI_THUC_HIEN',true))(roles.thucHien||[]).forEach(function(x){out.push(x)});
  if(emailFlagV86_(cfg,'GUI_NGUOI_LAM_CUNG',false))(roles.lamCung||[]).forEach(function(x){out.push(x)});
  if(emailFlagV86_(cfg,'GUI_NGUOI_GIAO',true))(roles.giao||[]).forEach(function(x){out.push(x)});
  return out;
}
function emailAdminListV86_(cfg){return String(cfg&&(cfg.EMAIL_NHAN||cfg.EMAIL_QUAN_TRI)||'');}

function normalizeEmailTimeV84_(value, fallback){
  const m=String(value||'').trim().match(/^([01]?\d|2[0-3]):([0-5]\d)/);
  if(m)return String(m[1]).padStart(2,'0')+':'+m[2];
  const f=String(fallback||'').trim().match(/^([01]?\d|2[0-3]):([0-5]\d)/);
  return f?String(f[1]).padStart(2,'0')+':'+f[2]:'07:00';
}

// Đã tới (hoặc qua) giờ gửi trong ngày — việc "chỉ 1 lần/ngày" do sendEmailAlertsV84 giữ.
function emailConfigDueNowV84_(value){
  const hm=normalizeEmailTimeV84_(value,'07:00').split(':').map(Number),now=new Date();
  return Number(Utilities.formatDate(now,V22.TZ,'H'))*60+Number(Utilities.formatDate(now,V22.TZ,'m'))>=hm[0]*60+hm[1];
}

function emailAlertRowsV84_(code, admin, before, cfg){
  cfg=cfg||{};
  const employees=readObjects_(V22.SHEETS.employees), empById=indexBy_(employees,'ID');
  const out=[], today=today_(), limit=addDays_(today,Number(before||0));
  // Chỉ gửi khi cảnh báo là trễ hạn / quá hạn / sắp đến hạn (han=true) hoặc trạng thái "Chưa thực hiện".
  const push=function(module,id,recipients,title,days,body,han,status){
    if(!han&&norm_(status)!=='CHUA_THUC_HIEN')return;
    out.push({MA_CANH_BAO:code,MODULE:module,ID_BAN_GHI:String(id||''),NGUOI_NHAN:emailRecipientsV84_(recipients,admin).join(', '),TIEU_DE:title,SO_NGAY_CON_LAI:days===null||days===undefined?'':days,NOI_DUNG:body});
  };
  if(code==='CONG_VIEC_QUA_HAN'||code==='CONG_VIEC_CU_CHUA_XONG'){
    readObjects_(V22.SHEETS.work).forEach(function(r){
      if(workIsCompleted_(r))return;
      const due=dateOnly_(r.DEADLINE), old=dateOnly_(r.NGAY_GIAO);
      const isOverdue=due&&due<today_();
      const isOldAndIncomplete=old&&old<today_()&&!workIsCompleted_(r);
      const hit=code==='CONG_VIEC_QUA_HAN'?isOverdue:isOldAndIncomplete;
      if(!hit)return;
      const days=due?daysBetween_(today_(),due):null;
      push('CONG_VIEC',r.ID,emailPeopleV86_(cfg,{thucHien:[r.ID_NGUOI_THUC_HIEN],lamCung:[r.NGUOI_LAM_CUNG,r.ID_NGUOI_LAM_CUNG],giao:[r.ID_NGUOI_GIAO]}),code==='CONG_VIEC_QUA_HAN'?'Công việc quá hạn':'Công việc cũ chưa xong',days,'Nội dung: '+String(r.NOI_DUNG||'')+'\nHạn: '+(due||'Chưa có hạn'),days!==null&&days<=Number(before||0),r.TRANG_THAI||r.KET_QUA);
    });
  } else if(code==='CVHN_CHUA_XONG'){
    readObjects_(V22.SHEETS.daily).forEach(function(r){if(isCompletedStatus_(r.KET_QUA)||isCompletedStatus_(r.TRANG_THAI))return;push('CVHN_2026',r.ID,emailPeopleV86_(cfg,{thucHien:[r.ID_NGUOI_THUC_HIEN],lamCung:[r.NGUOI_LAM_CUNG,r.ID_NGUOI_LAM_CUNG],giao:[r.ID_NGUOI_GIAO]}),'Công việc hằng ngày chưa xong',null,'Nội dung: '+String(r.NOI_DUNG||'')+'\nNgày: '+(dateOnly_(r.NGAY)||''),false,r.TRANG_THAI||r.KET_QUA);});
  } else if(code==='BAO_TRI_SAP_HAN'||code==='BAO_TRI_DEN_HAN'){
    getMaintenanceSchedulesComputed_().forEach(function(r){const d=Number(r.SO_NGAY_CON_LAI);if(!Number.isFinite(d))return;const hit=code==='BAO_TRI_SAP_HAN'?(d>=0&&d<=Number(before||7)):(d<=0);if(!hit)return;push('DM_LICH_BAO_TRI',r.ID_LICH,emailPeopleV86_(cfg,{thucHien:[r.ID_NGUOI_PHU_TRACH]}),'Bảo trì '+(d<0?'trễ hạn':d===0?'đến hạn':'sắp đến hạn'),d,'Khu vực: '+String(r.KHU_VUC_HIEN_THI||r.ID_KHU_VUC||'')+'\nHạng mục: '+String(r.HANG_MUC||r.ID_HANG_MUC||'')+'\nNgày kế tiếp: '+String(r.NGAY_KE_TIEP||''),true);});
  } else if(code==='NHAT_KY_BAO_TRI'){
    readObjects_(V22.SHEETS.maintenanceLogs).forEach(function(r){const due=dateOnly_(r.NGAY_KE_TIEP),d=due?daysBetween_(today_(),due):null;if(d===null||d>Number(before||7))return;push('NHAT_KY_BAO_TRI',r.ID,emailPeopleV86_(cfg,{thucHien:[r.ID_NGUOI_THUC_HIEN],lamCung:[r.NGUOI_LAM_CUNG]}),'Nhật ký bảo trì cần theo dõi',d,'Hạng mục: '+String(r.HANG_MUC_SNAPSHOT||'')+'\nNgày kế tiếp: '+due,true);});
  } else if(code==='DE_XUAT_CHO_DUYET'){
    readObjects_(V22.SHEETS.proposals).forEach(function(r){if(!['CHO_DUYET','CHO_DUYET'].includes(norm_(r.TRANG_THAI)))return;push('DE_XUAT',r.ID,[],'Đề xuất đang chờ duyệt',null,'Nội dung: '+String(r.NOI_DUNG||r.TEN_DE_XUAT||''));});
  } else if(code==='KHO_VAT_TU_SAP_HET'){
    getInventorySnapshot_().forEach(function(r){if(Number(r.TON_HIEN_TAI)>Number(r.TON_TOI_THIEU||0))return;push('VAT_TU',r.ID,[],'Vật tư sắp hết hoặc dưới tồn tối thiểu',null,'Vật tư: '+String(r.TEN_VAT_TU||'')+'\nTồn hiện tại: '+r.TON_HIEN_TAI+'\nTồn tối thiểu: '+r.TON_TOI_THIEU);});
  } else if(code==='DU_LIEU_LOI'){
    const audit=systemAudit_(); if(!audit.ok||audit.errors&&audit.errors.length)push('DATA_AUDIT_ARCHIVE','SYSTEM',[],'Cảnh báo lỗi dữ liệu',null,JSON.stringify(audit));
  } else if(code==='KHACH_THUE_SAP_HET_HAN'){
    readObjects_(V22.SHEETS.tenants).forEach(function(r){
      const due=dateOnly_(r.NGAY_KET_THUC),d=due?daysBetween_(today_(),due):null;
      if(d===null||d<0||d>Number(before||30))return;
      push('KHACH_THUE',r.ID,emailPeopleV86_(cfg,{thucHien:[r.ID_NGUOI_PHU_TRACH,r.ID_NGUOI_QUAN_LY]}),'Khách đang thuê sắp hết hạn',d,
        'Khách thuê: '+String(r.TEN_KHACH_THUE||r.ID||'')+'\nNgày kết thúc thuê: '+due+'\nKhu vực: '+String(r.TANG_KHU_VUC||r.ID_KHU_VUC||''),true);
    });
  } else if(code==='KHACH_TIEM_NANG_DEN_HAN_LIEN_HE'||code==='KHACH_TIEM_NANG_QUA_HAN_LIEN_HE'){
    readObjects_(V22.SHEETS.prospects).forEach(function(r){
      const due=dateOnly_(r.NGAY_HEN_LIEN_HE),d=due?daysBetween_(today_(),due):null;
      if(d===null||(code==='KHACH_TIEM_NANG_DEN_HAN_LIEN_HE'?d!==0:d>=0))return;
      push('KHACH_HANG_TIEM_NANG',r.ID,emailPeopleV86_(cfg,{thucHien:[r.ID_NGUOI_PHU_TRACH]}),
        code==='KHACH_TIEM_NANG_DEN_HAN_LIEN_HE'?'Khách hàng tiềm năng đến hạn liên hệ':'Khách hàng tiềm năng quá hạn liên hệ',d,
        'Khách hàng: '+String(r.TEN_KHACH_HANG||r.ID||'')+'\nNgười liên hệ: '+String(r.NGUOI_LIEN_HE||'')+'\nNgày hẹn liên hệ: '+due,true);
    });
  }
  return out;
}

// ---------------------------------------------------------------------------
// V85 EMAIL — đơn giản, nhanh:
//  - Mỗi lượt chỉ gửi MỘT email tổng hợp cho mỗi người nhận (không còn 1 email/1 bản ghi).
//  - Chống gửi lặp theo MODULE + ID_BAN_GHI trong ngày (bản ghi khớp nhiều cảnh báo chỉ gửi 1 lần) (đọc nhật ký 1 lần).
//  - Nhật ký ghi 1 lần (setValues), không khóa/sinh mã từng dòng.
//  - Không lỡ giờ: đến giờ cấu hình mà hôm nay chưa chạy thì chạy ở lượt trigger kế tiếp.
//  - "Gửi ngay" trên giao diện; trigger 15 phút tự tạo khi lưu có cảnh báo đang bật.
// ---------------------------------------------------------------------------
const EMAIL_TRIGGER_HANDLER_V84_='sendEmailAlertsV84';

function escHtmlV84_(v){return String(v==null?'':v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}

function emailSentTodayKeysV84_(){
  const day=today_(),keys={};
  readObjects_(V22.SHEETS.emailLog).forEach(function(x){
    const st=norm_(x.TRANG_THAI);
    // CHO_GUI: nhật ký bản cũ ghi nhầm trạng thái cho email đã gửi.
    if(!String(x.NGAY_GUI||'').startsWith(day)||(st!=='DA_GUI'&&st!=='CHO_GUI'))return;
    keys[String(x.MODULE||'')+'|'+String(x.ID_BAN_GHI||'')]=true;
  });
  return keys;
}

function emailTriggerActiveV84_(){
  try{return ScriptApp.getProjectTriggers().some(function(t){return t.getHandlerFunction()===EMAIL_TRIGGER_HANDLER_V84_;});}catch(e){return false;}
}
function ensureEmailTriggerV84_(){
  if(emailTriggerActiveV84_())return true;
  try{ScriptApp.newTrigger(EMAIL_TRIGGER_HANDLER_V84_).timeBased().everyMinutes(15).create();return true;}catch(e){return false;}
}

function appendEmailLogsV84_(logs){
  if(!logs.length)return;
  const sh=getSheet_(V22.SHEETS.emailLog),headers=getHeaders_(V22.SHEETS.emailLog),base='EM'+Utilities.formatDate(new Date(),V22.TZ,'yyMMddHHmmss');
  const rows=logs.map(function(l,i){
    l.ID_EMAIL=base+'-'+String(i+1).padStart(3,'0');
    l.NOI_DUNG=String(l.NOI_DUNG||'').slice(0,2000);
    return headers.map(function(h){return l[h]!==undefined?l[h]:'';});
  });
  sh.getRange(Math.max(2,sh.getLastRow()+1),1,rows.length,headers.length).setValues(rows);
  invalidateSheetV20_(V22.SHEETS.emailLog,true);
}

function emailDigestHtmlV84_(list){
  const groups={};list.forEach(function(x){(groups[x.name]=groups[x.name]||[]).push(x.item);});
  const td='padding:6px 8px;border:1px solid #d9dee5;vertical-align:top;font-size:13px';
  let html='<div style="font-family:Arial,sans-serif;color:#172033"><h2 style="color:#a71936;margin:0 0 4px">PHILONG BUILDING</h2><p style="margin:0 0 14px">'+list.length+' cảnh báo cần xử lý · '+escHtmlV84_(nowStamp_())+'</p>';
  Object.keys(groups).forEach(function(name){
    html+='<h3 style="margin:16px 0 6px;font-size:15px">'+escHtmlV84_(name)+' ('+groups[name].length+')</h3><table style="border-collapse:collapse;width:100%"><tr style="background:#f1f4f8"><th style="'+td+'">Mã</th><th style="'+td+'">Cảnh báo</th><th style="'+td+'">Còn (ngày)</th><th style="'+td+'">Chi tiết</th></tr>';
    groups[name].forEach(function(it){
      html+='<tr><td style="'+td+'">'+escHtmlV84_(it.ID_BAN_GHI)+'</td><td style="'+td+'">'+escHtmlV84_(it.TIEU_DE)+'</td><td style="'+td+';text-align:center">'+escHtmlV84_(it.SO_NGAY_CON_LAI)+'</td><td style="'+td+'">'+escHtmlV84_(String(it.NOI_DUNG||'').slice(0,1000)).replace(/\n/g,'<br>')+'</td></tr>';
    });
    html+='</table>';
  });
  return html+'<p style="margin-top:16px;color:#64748b;font-size:12px">Email tự động từ mục Cấu hình gửi email.</p></div>';
}
function emailDigestTextV84_(list){
  return list.map(function(x){return '['+x.name+'] '+x.item.TIEU_DE+' · '+x.item.ID_BAN_GHI+'\n'+String(x.item.NOI_DUNG||'').slice(0,1000);}).join('\n\n')+'\n\nThời gian: '+nowStamp_();
}

function previewEmailAlertsV84(){
  const out=[];
  emailConfigV84_().forEach(function(c){if(!emailAlertEnabledV84_(c))return;emailAlertRowsV84_(c.MA_CANH_BAO,emailAdminListV86_(c),Number(c.SO_NGAY_BAO_TRUOC||0),c).forEach(function(x){out.push(x);});});
  return {ok:true,count:out.length,rows:out,serverTime:nowStamp_()};
}

function getEmailAlertConfigV84_(){
  let quota='';try{quota=MailApp.getRemainingDailyQuota();}catch(e){}
  return {ok:true,rows:emailConfigV84_(),logs:readObjects_(V22.SHEETS.emailLog).slice(-50).reverse(),
    triggerActive:emailTriggerActiveV84_(),quota:quota,serverTime:nowStamp_()};
}

// Lưu nhiều dòng cấu hình bằng 1 lần đọc + 1 lần ghi. GIO_GUI lưu dạng chữ để Sheets không đổi thành ngày.
function saveEmailAlertConfigAllV84_(input){
  ensureEmailAlertSchemaV84_();
  const byId={};(Array.isArray(input&&input.rows)?input.rows:[]).forEach(function(r){const id=String(r&&r.ID||'').trim();if(id)byId[id]=r;});
  if(!Object.keys(byId).length)throw new Error('EMAIL_CONFIG_EMPTY');
  const sh=getSheet_(V22.SHEETS.emailConfig),lastRow=sh.getLastRow(),lastCol=sh.getLastColumn();
  if(lastRow<2)throw new Error('EMAIL_CONFIG_NOT_FOUND');
  const range=sh.getRange(1,1,lastRow,lastCol),values=range.getValues(),shown=range.getDisplayValues();
  const headers=values[0].map(function(h){return String(h||'').trim();}),ix=function(h){return headers.indexOf(h);};
  const iId=ix('ID'),iBat=ix('BAT'),iDays=ix('SO_NGAY_BAO_TRUOC'),iTime=ix('GIO_GUI'),iMail=ix('EMAIL_QUAN_TRI'),iSend=ix('EMAIL_GUI'),iRecv=ix('EMAIL_NHAN'),iTh=ix('GUI_NGUOI_THUC_HIEN'),iLc=ix('GUI_NGUOI_LAM_CUNG'),iGiao=ix('GUI_NGUOI_GIAO');
  const onOff=function(v){return String(v||'').trim()==='BẬT'?'BẬT':'TẮT'};
  let saved=0;
  for(let r=1;r<values.length;r++){
    if(iTime>=0)values[r][iTime]=normalizeEmailTimeV84_(shown[r][iTime],'07:00');
    const inp=byId[String(values[r][iId]||'').trim()];if(!inp)continue;
    if(iBat>=0)values[r][iBat]=String(inp.BAT||'').trim()==='BẬT'?'BẬT':'TẮT';
    if(iDays>=0)values[r][iDays]=inp.SO_NGAY_BAO_TRUOC===''||inp.SO_NGAY_BAO_TRUOC==null?'':Math.max(0,parseInt(inp.SO_NGAY_BAO_TRUOC,10)||0);
    if(iTime>=0)values[r][iTime]=normalizeEmailTimeV84_(inp.GIO_GUI,values[r][iTime]);
    if(iRecv>=0&&inp.EMAIL_NHAN!==undefined)values[r][iRecv]=String(inp.EMAIL_NHAN||'').trim();
    if(iMail>=0&&inp.EMAIL_NHAN!==undefined)values[r][iMail]=String(inp.EMAIL_NHAN||'').trim();
    else if(iMail>=0&&inp.EMAIL_QUAN_TRI!==undefined)values[r][iMail]=String(inp.EMAIL_QUAN_TRI||'').trim();
    if(iSend>=0&&inp.EMAIL_GUI!==undefined)values[r][iSend]=String(inp.EMAIL_GUI||'').trim();
    if(iTh>=0&&inp.GUI_NGUOI_THUC_HIEN!==undefined)values[r][iTh]=onOff(inp.GUI_NGUOI_THUC_HIEN);
    if(iLc>=0&&inp.GUI_NGUOI_LAM_CUNG!==undefined)values[r][iLc]=onOff(inp.GUI_NGUOI_LAM_CUNG);
    if(iGiao>=0&&inp.GUI_NGUOI_GIAO!==undefined)values[r][iGiao]=onOff(inp.GUI_NGUOI_GIAO);
    saved++;
  }
  if(!saved)throw new Error('EMAIL_CONFIG_NOT_FOUND');
  if(iTime>=0)sh.getRange(2,iTime+1,lastRow-1,1).setNumberFormat('@');
  sh.getRange(2,1,lastRow-1,lastCol).setValues(values.slice(1));
  invalidateSheetV20_(V22.SHEETS.emailConfig,true);
  const anyOn=emailConfigV84_().some(emailAlertEnabledV84_);
  if(anyOn)ensureEmailTriggerV84_();
  return Object.assign(getEmailAlertConfigV84_(),{saved:saved});
}
function saveEmailAlertConfigV84_(input){return saveEmailAlertConfigAllV84_({rows:[input||{}]});}

function sendTestEmailAlertV84_(input){
  const recipients=emailRecipientsV84_([],String(input&&(input.EMAIL_NHAN||input.EMAIL_QUAN_TRI)||''));
  if(!recipients.length)throw new Error('EMAIL_TEST_RECIPIENT_REQUIRED');
  const sender=String(input&&input.EMAIL_GUI||'').trim();
  const mail={to:recipients.join(', '),name:'PHILONG BUILDING',subject:'[PHILONG BUILDING] Email kiểm tra',
    htmlBody:'<div style="font-family:Arial,sans-serif"><h3 style="color:#a71936">PHILONG BUILDING</h3><p>Email kiểm tra từ mục Cấu hình gửi email. Nếu bạn nhận được thư này, việc gửi cảnh báo đã hoạt động.</p><p style="color:#64748b">'+escHtmlV84_(nowStamp_())+'</p></div>',
    body:'Email kiểm tra từ mục Cấu hình gửi email.\nThời gian: '+nowStamp_()};
  if(/^\S+@\S+\.\S+$/.test(sender))mail.replyTo=sender;
  MailApp.sendEmail(mail);
  return {ok:true,recipients:recipients,serverTime:nowStamp_()};
}

// Chạy một lần trong Apps Script Editor để cấp quyền gửi email cho tài khoản triển khai.
function authorizeEmailAlertsV84(){
  return {ok:true,remainingDailyQuota:MailApp.getRemainingDailyQuota(),trigger:ensureEmailTriggerV84_(),serverTime:nowStamp_()};
}

// Trigger 15 phút gọi hàm này (không đối số). Giao diện "Gửi ngay" gọi với {now:true}.
function sendEmailAlertsV84(opts){
  const now=!!(opts&&opts.now===true),lock=LockService.getScriptLock();
  if(!lock.tryLock(5000))return {ok:false,busy:true,sent:0,serverTime:nowStamp_()};
  try{
    ensureEmailAlertSchemaV84_();
    const props=PropertiesService.getScriptProperties(),day=today_(),sentKeys=emailSentTodayKeysV84_(),byTo={},logs=[],summary=[],stamp=nowStamp_();
    emailConfigV84_().forEach(function(c){
      const code=String(c.MA_CANH_BAO||''),runKey='PL85_EMAIL_RUN_'+code;
      if(!emailAlertEnabledV84_(c)){summary.push({code:code,status:'TAT'});return;}
      if(!now&&(!emailConfigDueNowV84_(c.GIO_GUI)||props.getProperty(runKey)===day)){summary.push({code:code,status:'CHO_GIO',gio:c.GIO_GUI});return;}
      let n=0;
      emailAlertRowsV84_(code,emailAdminListV86_(c),Number(c.SO_NGAY_BAO_TRUOC||0),c).forEach(function(item){
        item.EMAIL_GUI=String(c.EMAIL_GUI||'').trim();
        const key=item.MODULE+'|'+item.ID_BAN_GHI;if(sentKeys[key])return;sentKeys[key]=true;
        const log={NGAY_GUI:stamp,MA_CANH_BAO:code,MODULE:item.MODULE,ID_BAN_GHI:item.ID_BAN_GHI,NGUOI_NHAN:item.NGUOI_NHAN,TIEU_DE:item.TIEU_DE,
          TRANG_THAI:item.NGUOI_NHAN?'DA_GUI':'BO_QUA_THIEU_EMAIL',SO_NGAY_CON_LAI:item.SO_NGAY_CON_LAI,NOI_DUNG:item.NOI_DUNG};
        logs.push(log);n++;
        if(item.NGUOI_NHAN)item.NGUOI_NHAN.split(/\s*,\s*/).forEach(function(to){if(to)(byTo[to]=byTo[to]||[]).push({item:item,log:log,name:c.TEN_CANH_BAO||code});});
      });
      if(!now)props.setProperty(runKey,day);
      summary.push({code:code,status:'DA_QUET',items:n});
    });
    let mails=0,quota=0;try{quota=MailApp.getRemainingDailyQuota();}catch(e){}
    Object.keys(byTo).forEach(function(to){
      const list=byTo[to];
      if(mails>=quota){list.forEach(function(x){x.log.TRANG_THAI='HET_HAN_MUC';});return;}
      try{
        const sender=(list.find(function(x){return x.item.EMAIL_GUI})||{item:{}}).item.EMAIL_GUI;
        const mail={to:to,name:'PHILONG BUILDING',subject:'[PHILONG BUILDING] '+list.length+' cảnh báo cần xử lý · '+day,htmlBody:emailDigestHtmlV84_(list),body:emailDigestTextV84_(list)};
        // Email gửi: Apps Script luôn gửi từ tài khoản triển khai; địa chỉ "Email gửi" dùng làm địa chỉ trả lời (Reply-To).
        if(sender&&/^\S+@\S+\.\S+$/.test(sender))mail.replyTo=sender;
        MailApp.sendEmail(mail);
        mails++;
      }catch(e){list.forEach(function(x){x.log.TRANG_THAI='LOI';});}
    });
    appendEmailLogsV84_(logs);
    return {ok:true,sent:mails,items:logs.length,recipients:Object.keys(byTo).length,summary:summary,serverTime:nowStamp_()};
  }finally{lock.releaseLock();}
}

// Chạy tay (tùy chọn): tạo lại trigger 15 phút. Lưu cấu hình có dòng BẬT cũng tự tạo.
function setupEmailAlertTriggerV84(){
  ScriptApp.getProjectTriggers().forEach(function(t){if(t.getHandlerFunction()===EMAIL_TRIGGER_HANDLER_V84_)ScriptApp.deleteTrigger(t);});
  ScriptApp.newTrigger(EMAIL_TRIGGER_HANDLER_V84_).timeBased().everyMinutes(15).create();
  return {ok:true,handler:EMAIL_TRIGGER_HANDLER_V84_,frequency:'every 15 minutes',timezone:V22.TZ};
}

// ============================================================================
// V84.14.4 - Xuất Phiếu đề xuất thành PDF/DOCX thật qua Google Docs.
// PDF được tải trực tiếp; DOCX không còn là HTML đổi đuôi nên không bể bố cục.
// ============================================================================
const PROPOSAL_TEMPLATE_DOC_ID_V8414='1y8HJn4sTrmmsEyJ80F2kx3guX18s7KjciDtTT5r0_ys';

function proposalExportDataV8414_(user,id){
  id=String(id||'').trim();if(!id)throw new Error('PROPOSAL_ID_REQUIRED');
  const masterRows=readObjects_(V22.SHEETS.proposals),masters=indexBy_(masterRows,'ID');
  const specs=[
    {sheet:'DE_XUAT_MUA_VAT_TU',kind:'material',label:'Đề xuất mua vật tư'},
    {sheet:'DE_XUAT_MUA',kind:'purchase',label:'Đề xuất mua thiết bị'},
    {sheet:'DE_XUAT_BAO_TRI',kind:'maintenance',label:'Đề xuất bảo trì'},
    {sheet:'DE_XUAT_THANH_LY',kind:'dispose',label:'Đề xuất thanh lý'}
  ];
  let spec=null,detail=null,rows=[];
  for(let i=0;i<specs.length;i++){
    const list=readObjects_(specs[i].sheet),hit=list.find(function(x){return String(x.ID||'')===id||String(x.ID_DE_XUAT||'')===id});
    if(hit){spec=specs[i];detail=hit;const parent=String(hit.ID_DE_XUAT||'').trim();rows=parent?list.filter(function(x){return String(x.ID_DE_XUAT||'')===parent}):[hit];break;}
  }
  let master=masters[id]||null;
  if(!master&&detail&&detail.ID_DE_XUAT)master=masters[String(detail.ID_DE_XUAT)]||null;
  if(!detail&&master){
    for(let j=0;j<specs.length;j++){
      const list=readObjects_(specs[j].sheet),matches=list.filter(function(x){return String(x.ID_DE_XUAT||'')===String(master.ID)});
      if(matches.length){spec=specs[j];detail=matches[0];rows=matches;break;}
    }
  }
  if(!detail&&!master)throw new Error('PROPOSAL_NOT_FOUND:'+id);
  const rawType=norm_(master&&master.LOAI_DE_XUAT||detail&&detail.LOAI_DE_XUAT||'');
  if(!spec){
    if(/THANH_LY/.test(rawType))spec=specs[3];else if(/BAO_TRI/.test(rawType))spec=specs[2];else if(/VAT_TU/.test(rawType))spec=specs[0];else spec=specs[1];
    rows=detail?[detail]:[];
  }
  master=master||{};detail=detail||{};
  const employees=indexBy_(readObjects_(V22.SHEETS.employees),'ID'),employeeId=String(master.ID_NGUOI_DE_XUAT||detail.ID_NGUOI_DE_XUAT||user&&user.employeeId||'').trim(),employee=employees[employeeId]||{};
  const materials=indexBy_(readObjects_(V22.SHEETS.materials),'ID'),devices=indexBy_(readObjects_(V22.SHEETS.assets),'ID'),categories={};
  const itemName=function(x){const source=materials[String(x.ID_VAT_TU||'')]||devices[String(x.ID_THIET_BI||'')]||categories[String(x.ID_DANH_MUC||'')]||{};return x.TEN_VAT_TU||x.TEN_THIET_BI||x.TEN_DANH_MUC||source.TEN_VAT_TU||source.TEN_THIET_BI||source.TEN_DANH_MUC||source.TEN_DANH_MUC_THIET_BI||x.ID_VAT_TU||x.ID_THIET_BI||x.ID_DANH_MUC||master.NOI_DUNG||spec.label};
  return {
    code:String(master.ID||detail.ID_DE_XUAT||detail.ID||id),kind:spec.kind,typeLabel:spec.label,
    date:dateOnly_(master.NGAY_DE_XUAT||master.NGAY_TAO||detail.NGAY_DE_XUAT)||today_(),
    requester:master.NGUOI_DE_XUAT||employee.HO_TEN||employee.TEN_GOI_KHAC||employeeId||'Chưa xác định',
    department:master.PHONG_BAN||detail.PHONG_BAN||employee.PHONG_BAN||employee.DON_VI||'Chưa xác định',
    content:master.NOI_DUNG||detail.MUC_DICH_LY_DO||detail.PHUONG_AN_DE_XUAT||detail.LY_DO||detail.HIEN_TRANG||spec.label,
    note:master.GHI_CHU||detail.GHI_CHU||'',detail:detail,lines:rows.length?rows:[detail],itemName:itemName
  };
}

function proposalDateTextV8414_(value){const ymd=dateOnly_(value);if(!ymd)return String(value||'');const p=ymd.split('-');return p[2]+'/'+p[1]+'/'+p[0];}
function proposalMoneyV8414_(value){const n=Number(value||0);return Number.isFinite(n)&&n!==0?String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g,','):'';}
function proposalMoneyWordsV8414_(value){
  let n=Math.round(Math.abs(Number(value)||0));if(!n)return 'Không đồng';
  const d=['không','một','hai','ba','bốn','năm','sáu','bảy','tám','chín'],u=['','nghìn','triệu','tỷ','nghìn tỷ','triệu tỷ'];
  const three=function(v,full){const h=Math.floor(v/100),t=Math.floor(v%100/10),o=v%10,a=[];if(h||full)a.push(d[h]+' trăm');if(t>1){a.push(d[t]+' mươi');if(o===1)a.push('mốt');else if(o===5)a.push('lăm');else if(o)a.push(d[o]);}else if(t===1){a.push('mười');if(o===5)a.push('lăm');else if(o)a.push(d[o]);}else if(o){if(h||full)a.push('lẻ');a.push(d[o]);}return a.join(' ');};
  const groups=[];while(n){groups.push(n%1000);n=Math.floor(n/1000);}const out=[];for(let i=groups.length-1;i>=0;i--)if(groups[i])out.push((three(groups[i],i<groups.length-1&&groups[i]<100)+' '+u[i]).trim());const s=out.join(' ').replace(/\s+/g,' ').trim();return s.charAt(0).toUpperCase()+s.slice(1)+' đồng';
}

function firstInlineImageBlobV8414_(element){
  try{if(element.getType&&element.getType()===DocumentApp.ElementType.INLINE_IMAGE)return element.asInlineImage().getBlob();}catch(e){}
  if(element&&element.getNumChildren)for(let i=0;i<element.getNumChildren();i++){const found=firstInlineImageBlobV8414_(element.getChild(i));if(found)return found;}
  return null;
}
// Logo in phiếu: ưu tiên file ảnh trên Drive (Thuộc tính tập lệnh PRINT_LOGO_FILE_ID), mặc định dùng
// logo PhiLong Technology nhúng sẵn (PNG 640x200, cùng logo hệ thống PHI LONG HR).
function proposalLogoBlobV8414_(){
  try{const id=String(PropertiesService.getScriptProperties().getProperty('PRINT_LOGO_FILE_ID')||'').trim();if(id)return DriveApp.getFileById(id).getBlob();}catch(e){}
  try{return Utilities.newBlob(Utilities.base64Decode(PRINT_LOGO_PNG_B64_V90),'image/png','logo-philong.png');}catch(e){}
  try{return firstInlineImageBlobV8414_(DocumentApp.openById(PROPOSAL_TEMPLATE_DOC_ID_V8414).getBody());}catch(e){return null;}
}
const PRINT_LOGO_PNG_B64_V90='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';
// Mọi cỡ chữ trong phiếu đề xuất được cộng thêm 1 (PROPOSAL_FONT_PLUS_V90) để dễ đọc khi in.
const PROPOSAL_FONT_PLUS_V90=1;
function styleTextV8414_(element,size,bold,color){
  const t=element.editAsText(),length=t.getText().length;if(!length)return element;t.setFontFamily('Arial').setFontSize((size||10)+PROPOSAL_FONT_PLUS_V90).setForegroundColor(color||'#222222');if(bold!==undefined)t.setBold(!!bold);return element;
}
function styleCellV8414_(cell,size,bold,background,align){
  if(background)cell.setBackgroundColor(background);cell.setVerticalAlignment(DocumentApp.VerticalAlignment.CENTER);
  const p=cell.getChild(0).asParagraph();if(align)p.setAlignment(align);styleTextV8414_(p,size,bold);return cell;
}

function buildProposalDocV8414_(data){
  const doc=DocumentApp.create('PHIEU_DE_XUAT_'+data.code),body=doc.getBody();body.clear();body.setMarginTop(31).setMarginBottom(31).setMarginLeft(34).setMarginRight(34);
  const header=body.appendTable([['','']]);header.setBorderWidth(0);header.setColumnWidth(0,310);header.setColumnWidth(1,210);
  const left=header.getCell(0,0),right=header.getCell(0,1),title=left.getChild(0).asParagraph();left.setVerticalAlignment(DocumentApp.VerticalAlignment.BOTTOM);title.appendText('PHIẾU ĐỀ XUẤT');title.setSpacingBefore(0).setSpacingAfter(1);styleTextV8414_(title,20,true);const code=left.appendParagraph('Mã phiếu: '+data.code);code.setSpacingBefore(0).setSpacingAfter(0);styleTextV8414_(code,10,true);
  right.setVerticalAlignment(DocumentApp.VerticalAlignment.TOP);
  const logo=proposalLogoBlobV8414_(),brand=right.getChild(0).asParagraph();brand.setAlignment(DocumentApp.HorizontalAlignment.LEFT).setSpacingAfter(3);if(logo){const image=brand.appendInlineImage(logo),w=image.getWidth()||640,h=image.getHeight()||200;image.setWidth(183);image.setHeight(Math.round(h*183/w));}else{brand.appendText('PHI LONG TECHNOLOGY');styleTextV8414_(brand,15,true,'#D71920');}
  // Thông tin công ty: bảng 3 cột "Tên : Nội dung" (Địa chỉ / Điện thoại / Email / Website)
  const contact=[['Địa chỉ','52 Nguyễn Văn Linh, Đà Nẵng'],['Điện thoại','(0236) 3 888 000'],['Email','philong@philong.com.vn'],['Website','www.philong.com.vn','https://www.philong.com.vn']];
  const contactTbl=right.appendTable(contact.map(function(r){return [r[0],':',r[1]];}));contactTbl.setBorderWidth(0);contactTbl.setColumnWidth(0,54);contactTbl.setColumnWidth(1,8);contactTbl.setColumnWidth(2,148);
  contact.forEach(function(r,i){for(let c=0;c<3;c++){const cell=contactTbl.getCell(i,c);cell.setPaddingTop(0).setPaddingBottom(0).setPaddingLeft(c===1?1:0).setPaddingRight(c===1?1:0);const q=cell.getChild(0).asParagraph();q.setSpacingBefore(0).setSpacingAfter(0);styleTextV8414_(q,8,c<2,c<2?'#111111':'#4B5B6B');q.editAsText().setFontFamily('Times New Roman');if(c===2&&r[2])q.editAsText().setLinkUrl(r[2]).setForegroundColor('#4B5B6B').setUnderline(false);}});
  body.appendHorizontalRule();
  const recipient=body.appendTable([['Kính gửi:','- Giám đốc Công ty TNHH Công Nghệ Tin Học Phi Long\n- Bộ phận quản lý']]);recipient.setBorderWidth(0);recipient.setColumnWidth(0,70);recipient.setColumnWidth(1,450);styleCellV8414_(recipient.getCell(0,0),10,true,'#FFFFFF',DocumentApp.HorizontalAlignment.LEFT);styleCellV8414_(recipient.getCell(0,1),10,true,'#FFFFFF',DocumentApp.HorizontalAlignment.LEFT);recipient.getCell(0,0).setVerticalAlignment(DocumentApp.VerticalAlignment.TOP);recipient.getCell(0,1).setVerticalAlignment(DocumentApp.VerticalAlignment.TOP);
  const info=body.appendTable([['Ngày lập',proposalDateTextV8414_(data.date),'Người đề xuất',data.requester],['Phòng ban',data.department,'Loại đề xuất',data.typeLabel]]);info.setBorderWidth(.75);info.setColumnWidth(0,85);info.setColumnWidth(1,175);info.setColumnWidth(2,95);info.setColumnWidth(3,165);
  for(let r=0;r<2;r++)for(let c=0;c<4;c++)styleCellV8414_(info.getCell(r,c),9,c%2===0,c%2===0?'#F2F2F2':null,DocumentApp.HorizontalAlignment.LEFT);
  let section=body.appendParagraph('NỘI DUNG');section.setSpacingBefore(7).setSpacingAfter(3);styleTextV8414_(section,11,true,'#9E1730');const contentTable=body.appendTable([[String(data.content||'')]]);contentTable.setBorderWidth(0).setBorderColor('#FFFFFF');contentTable.getCell(0,0).setBackgroundColor('#FFFFFF');styleCellV8414_(contentTable.getCell(0,0),9,false,'#FFFFFF',DocumentApp.HorizontalAlignment.LEFT);
  section=body.appendParagraph('CHI TIẾT ĐỀ XUẤT');section.setSpacingBefore(7).setSpacingAfter(3);styleTextV8414_(section,11,true,'#9E1730');
  if(data.kind==='material'||data.kind==='purchase'){
    const matrix=[['TT','Nội dung / Mặt hàng','Số lượng','Đơn giá','Thành tiền']];let total=0;
    data.lines.forEach(function(x,i){const qty=Number(x.SO_LUONG||0),price=Number(x.DON_GIA||0),amount=Number(x.THANH_TIEN||0)||qty*price;total+=amount;matrix.push([String(i+1),String(data.itemName(x)||''),String(x.SO_LUONG||''),proposalMoneyV8414_(price),proposalMoneyV8414_(amount)]);});
    matrix.push(['','','','TỔNG CỘNG',proposalMoneyV8414_(total)]);
    const table=body.appendTable(matrix);table.setBorderWidth(.75);table.setColumnWidth(0,36);table.setColumnWidth(1,224);table.setColumnWidth(2,70);table.setColumnWidth(3,92);table.setColumnWidth(4,98);
    for(let r=0;r<table.getNumRows();r++)for(let c=0;c<5;c++){const head=r===0;styleCellV8414_(table.getCell(r,c),9,head,head?'#EEEEEE':'#FFFFFF',c===1?DocumentApp.HorizontalAlignment.LEFT:(c>=3?DocumentApp.HorizontalAlignment.RIGHT:DocumentApp.HorizontalAlignment.CENTER));}
    const words=body.appendTable([['Tổng cộng bằng chữ: '+proposalMoneyWordsV8414_(total)]]);words.setBorderWidth(0).setBorderColor('#FFFFFF');words.setColumnWidth(0,520);words.getCell(0,0).setBackgroundColor('#FFFFFF');styleCellV8414_(words.getCell(0,0),9,false,'#FFFFFF',DocumentApp.HorizontalAlignment.LEFT);words.getCell(0,0).editAsText().setBold(0,'Tổng cộng bằng chữ:'.length-1,true);
  }else{
    const x=data.detail,rows=data.kind==='maintenance'?[['Thiết bị',data.itemName(x)],['Khu vực',x.KHU_VUC||x.ID_KHU_VUC||''],['Hiện trạng',x.HIEN_TRANG||x.TINH_TRANG||''],['Phương án đề xuất',x.PHUONG_AN_DE_XUAT||''],['Chi phí dự kiến',proposalMoneyV8414_(x.CHI_PHI_DU_KIEN)]]:[['Thiết bị',data.itemName(x)],['Tình trạng',x.TINH_TRANG||x.HIEN_TRANG||''],['Lý do thanh lý',x.LY_DO||''],['Chi phí sửa dự kiến',proposalMoneyV8414_(x.CHI_PHI_SUA_DU_KIEN)],['Giá trị còn lại',proposalMoneyV8414_(x.GIA_TRI_CON_LAI)],['Giá đề xuất thanh lý',proposalMoneyV8414_(x.GIA_DE_XUAT_THANH_LY)]];
    const table=body.appendTable(rows);table.setBorderWidth(.75);table.setColumnWidth(0,145);table.setColumnWidth(1,375);for(let r=0;r<rows.length;r++){styleCellV8414_(table.getCell(r,0),9,true,'#F2F2F2',DocumentApp.HorizontalAlignment.LEFT);styleCellV8414_(table.getCell(r,1),9,false,null,DocumentApp.HorizontalAlignment.LEFT);}
  }
  const note=body.appendParagraph('Ghi chú: '+String(data.note||''));note.setSpacingBefore(7).setSpacingAfter(7);styleTextV8414_(note,9,false);note.editAsText().setBold(0,'Ghi chú:'.length-1,true);
  const sign=body.appendTable([['','','']]);sign.setBorderWidth(0).setBorderColor('#FFFFFF');sign.setColumnWidth(0,173);sign.setColumnWidth(1,173);sign.setColumnWidth(2,174);
  ['NGƯỜI ĐỀ XUẤT','TRƯỞNG BỘ PHẬN','PHÊ DUYỆT'].forEach(function(label,c){
    const cell=sign.getCell(0,c);cell.setBackgroundColor('#FFFFFF').setVerticalAlignment(DocumentApp.VerticalAlignment.TOP);
    const titleLine=cell.getChild(0).asParagraph();titleLine.appendText(label);titleLine.setAlignment(DocumentApp.HorizontalAlignment.CENTER).setSpacingAfter(0);styleTextV8414_(titleLine,9,true);
    for(let blank=0;blank<5;blank++){const blankLine=cell.appendParagraph('\u00A0');blankLine.setAlignment(DocumentApp.HorizontalAlignment.CENTER).setSpacingBefore(0).setSpacingAfter(0);styleTextV8414_(blankLine,9,false);}
    if(c===0){const requesterLine=cell.appendParagraph(String(data.requester||''));requesterLine.setAlignment(DocumentApp.HorizontalAlignment.CENTER).setSpacingBefore(0).setSpacingAfter(0);styleTextV8414_(requesterLine,9,true);}
  });
  const footer=doc.addFooter();footer.setText('Biểu mẫu có giá trị khi được ký duyệt đầy đủ.');const footerParagraph=footer.getChild(0).asParagraph();footerParagraph.setAlignment(DocumentApp.HorizontalAlignment.CENTER);styleTextV8414_(footerParagraph,8,false);
  doc.saveAndClose();return doc.getId();
}

function exportGoogleDocBlobV8414_(fileId,mimeType){
  const url='https://www.googleapis.com/drive/v3/files/'+encodeURIComponent(fileId)+'/export?mimeType='+encodeURIComponent(mimeType),options={headers:{Authorization:'Bearer '+ScriptApp.getOAuthToken()},muteHttpExceptions:true};
  let response=null;for(let attempt=0;attempt<3;attempt++){if(attempt)Utilities.sleep(350);response=UrlFetchApp.fetch(url,options);if(response.getResponseCode()>=200&&response.getResponseCode()<300)return response.getBlob();}
  throw new Error('EXPORT_FILE_FAILED:'+(response&&response.getResponseCode()));
}

function exportProposalFileV8414_(user,id,format){
  format=String(format||'pdf').toLowerCase()==='pdf'?'pdf':'docx';const data=proposalExportDataV8414_(user,id),docId=buildProposalDocV8414_(data),file=DriveApp.getFileById(docId);
  try{
    const mime=format==='pdf'?'application/pdf':'application/vnd.openxmlformats-officedocument.wordprocessingml.document',blob=exportGoogleDocBlobV8414_(docId,mime),extension=format==='pdf'?'.pdf':'.docx';
    return {ok:true,fileName:String(data.code||'de-xuat')+extension,mimeType:mime,base64:Utilities.base64Encode(blob.getBytes())};
  }finally{try{file.setTrashed(true);}catch(e){}}
}

// V84.14.9 - Lưu một đề xuất mua vật tư gồm một hồ sơ tổng và nhiều dòng chi tiết.
function saveProposalMaterialBundleV84149_(user,input){
  input=input||{};const requestedMasterId=String(input.ID_DE_XUAT||'').trim(),action=requestedMasterId?'SUA':'THEM';requirePermission_(user,MODULES.PROPOSAL,action);
  legacyBlockDirectApprovalV132_(V22.SHEETS.proposals,input);
  const date=dateOnly_(input.NGAY_DE_XUAT)||today_(),employeeId=String(input.ID_NGUOI_DE_XUAT||'').trim(),rawLines=Array.isArray(input.LINES)?input.LINES:[];
  if(!employeeId)throw new Error('PROPOSAL_REQUESTER_REQUIRED');if(!rawLines.length)throw new Error('PROPOSAL_MATERIAL_LINE_REQUIRED');
  const employee=findById_(V22.SHEETS.employees,'ID',employeeId);if(!employee)throw new Error('PROPOSAL_REQUESTER_NOT_FOUND:'+employeeId);
  const employeeName=employeeNameV83_(employee,employeeId);
  ensureSheetColumnV8427_(V22.SHEETS.proposals,'NGUOI_DE_XUAT');
  ensureSheetColumnV8427_(V22.SHEETS.proposalBuyMaterial,'NGUOI_DE_XUAT');
  const materials=indexBy_(readObjects_(V22.SHEETS.materials),'ID'),seen={};
  const lines=rawLines.map(function(row,index){
    const materialId=String(row.ID_VAT_TU||'').trim(),qty=Number(row.SO_LUONG),price=Number(row.DON_GIA);
    if(!materialId||!materials[materialId])throw new Error('PROPOSAL_MATERIAL_INVALID_LINE:'+(index+1));
    if(seen[materialId])throw new Error('PROPOSAL_MATERIAL_DUPLICATE:'+materialId);seen[materialId]=true;
    if(!Number.isFinite(qty)||qty<=0)throw new Error('PROPOSAL_MATERIAL_QUANTITY_INVALID_LINE:'+(index+1));
    if(!Number.isFinite(price)||price<0)throw new Error('PROPOSAL_MATERIAL_PRICE_INVALID_LINE:'+(index+1));
    return {ID:String(row.ID||'').trim(),ID_VAT_TU:materialId,SO_LUONG:qty,DON_GIA:price,THANH_TIEN:qty*price};
  });
  const lock=LockService.getScriptLock();lock.waitLock(30000);
  try{
    let master=requestedMasterId?findById_(V22.SHEETS.proposals,'ID',requestedMasterId):null,masterId=requestedMasterId;
    if(requestedMasterId&&!master)throw new Error('PROPOSAL_MASTER_NOT_FOUND:'+requestedMasterId);
    if(!masterId)masterId=nextIdUnlocked_(V22.SHEETS.proposals,'DX');
    const masterRecord=Object.assign({},master||{},input.ID_DE_XUAT?{}:{ID:masterId,NGAY_TAO:today_()},{
      ID:masterId,NGAY_DE_XUAT:date,LOAI_DE_XUAT:'MUA_VAT_TU',ID_NGUOI_DE_XUAT:employeeId,NGUOI_DE_XUAT:employeeName,
      PHONG_BAN:employee.PHONG_BAN||employee.DON_VI||'',NOI_DUNG:String(input.MUC_DICH_LY_DO||'Đề xuất mua vật tư').trim(),
      TRANG_THAI:String(input.TRANG_THAI||'Chờ duyệt').trim(),GHI_CHU:String(input.GHI_CHU||'').trim()
    });
    upsertObject_(V22.SHEETS.proposals,'ID',masterRecord);
    const sheet=V22.SHEETS.proposalBuyMaterial,existing=readObjects_(sheet).filter(function(x){return String(x.ID_DE_XUAT||'')===masterId}),existingById=indexBy_(existing,'ID'),kept={};
    const saved=lines.map(function(row){
      let detailId=row.ID;if(detailId&&(!existingById[detailId]))throw new Error('PROPOSAL_MATERIAL_LINE_NOT_IN_MASTER:'+detailId);
      if(!detailId)detailId=nextIdUnlocked_(sheet,'DXVT');kept[detailId]=true;
      const detail=Object.assign({},existingById[detailId]||{},row,{ID:detailId,ID_DE_XUAT:masterId,NGUOI_DE_XUAT:employeeName,NHA_CUNG_CAP:String(input.NHA_CUNG_CAP||'').trim(),MUC_DICH_LY_DO:String(input.MUC_DICH_LY_DO||'').trim(),TRANG_THAI:String(input.TRANG_THAI||'Chờ duyệt').trim(),GHI_CHU:String(input.GHI_CHU||'').trim()});
      upsertObject_(sheet,'ID',detail);return detail;
    });
    existing.forEach(function(row){if(!kept[String(row.ID||'')])archiveAndDeleteById_(sheet,'ID',row.ID,user,'PROPOSAL_MATERIAL_LINE_REMOVE');});
    return {ok:true,ID_DE_XUAT:masterId,master:masterRecord,lines:saved,total:saved.reduce(function(sum,x){return sum+Number(x.THANH_TIEN||0);},0)};
  }finally{lock.releaseLock();}
}
// ============================================================================
// V90 — CÔNG CỤ BẢO TRÌ DỮ LIỆU (trang Hệ thống › Công cụ bảo trì dữ liệu)
// Một cổng RPC dataToolV90(action,args,systemToken), bắt buộc mở khóa Hệ thống.
//  - sheets  : danh sách bảng theo khu vực menu
//  - read    : đọc bảng có tìm kiếm + phân trang (cột mật khẩu bị ẩn)
//  - save/add/delete : sửa, thêm, xóa một dòng (kiểm tra mã dòng; lưu vết DATA_AUDIT_ARCHIVE)
//  - distinct/replace/trim : liệt kê giá trị, đồng nhất giá trị, xóa khoảng trắng thừa
//  - scan/fixSpaces : liệt kê dữ liệu lỗi, sửa tự động khoảng trắng
//  - backupYear/backupAll/backups : sao lưu theo năm / toàn bộ, lịch sử sao lưu
// ============================================================================
const DT90_GROUPS=[
  ['CÔNG VIỆC',/^(CONG_VIEC|CVHN)/],
  ['BẢO TRÌ',/(BAO_TRI|^KTDK$)/],
  ['ĐỀ XUẤT',/^DE_XUAT/],
  ['THIẾT BỊ & KHO',/(THIET_BI|VAT_TU|KHO|THU_HOI|CAP_PHAT)/],
  ['CHO THUÊ',/(HOP_DONG|KHACH_THUE|QUAN_LY_TANG|TIEM_NANG)/],
  ['DANH MỤC',/^(DM_|CHI_TIET_VAN_HANH)/],
  ['HỆ THỐNG',/(NGUOI_SU_DUNG|VAI_TRO|PHAN_QUYEN|AUDIT|SYS_|EMAIL)/]
];
const DT90_SECRET=/(MAT_KHAU|PASSWORD|TOKEN|SECRET)/i;
const DT90_REFS={ID_NGUOI_THUC_HIEN:'DM_NHAN_VIEN',ID_NGUOI_GIAO:'DM_NHAN_VIEN',ID_NGUOI_PHU_TRACH:'DM_NHAN_VIEN',ID_NGUOI_QUAN_LY:'DM_NHAN_VIEN',ID_NHAN_VIEN:'DM_NHAN_VIEN',ID_KHU_VUC:'DM_KHU_VUC_TOA_NHA',ID_HANG_MUC:'DM_HANG_MUC_BAO_TRI',ID_VAI_TRO:'VAI_TRO',ID_LICH:'DM_LICH_BAO_TRI'};

function dataToolV90(action,args,systemToken){
  requireSystemUnlockV137_(systemToken);
  beginFastRequestV20_({bypassCache:true});
  args=args||{};
  const fn={sheets:dt90Sheets_,read:dt90Read_,save:dt90Save_,add:dt90Add_,'delete':dt90Delete_,distinct:dt90Distinct_,replace:dt90Replace_,trim:dt90Trim_,scan:dt90Scan_,fixSpaces:dt90FixSpaces_,backupYear:dt90BackupYear_,backupAll:dt90BackupAll_,backups:dt90Backups_}[String(action||'')];
  if(!fn)throw new Error('DATA_TOOL_ACTION_INVALID:'+action);
  const write=['save','add','delete','replace','trim','fixSpaces','backupYear','backupAll'].indexOf(action)>=0;
  if(!write)return fn(args);
  const lock=LockService.getScriptLock();lock.waitLock(30000);
  try{return fn(args)}finally{lock.releaseLock()}
}

function dt90GroupOf_(name){for(let i=0;i<DT90_GROUPS.length;i++)if(DT90_GROUPS[i][1].test(name))return DT90_GROUPS[i][0];return 'KHÁC';}
function dt90Sheets_(){
  const list=ss_().getSheets().map(function(sh){const n=sh.getName();return {name:n,group:dt90GroupOf_(n),rows:Math.max(0,sh.getLastRow()-1),cols:sh.getLastColumn()};});
  return {ok:true,groups:DT90_GROUPS.map(function(g){return g[0]}).concat(['KHÁC']),sheets:list};
}
function dt90SheetName_(name){name=String(name||'');if(!ss_().getSheetByName(name))throw new Error('SHEET_NOT_FOUND:'+name);return name;}
// Đọc thô toàn bảng: headers + values (Date → yyyy-MM-dd), bỏ dòng trống.
function dt90Table_(name){
  const sh=getSheet_(name),lr=sh.getLastRow(),lc=sh.getLastColumn();
  if(lr<1||lc<1)return {sh:sh,headers:[],rows:[]};
  const v=sh.getRange(1,1,lr,lc).getValues(),headers=v[0].map(function(h){return String(h||'').trim()}),rows=[];
  for(let r=1;r<v.length;r++){
    if(!v[r].some(function(x){return x!==''&&x!==null}))continue;
    rows.push({row:r+1,values:v[r].map(normalizeSheetValue_)});
  }
  return {sh:sh,headers:headers,rows:rows};
}
function dt90IdCol_(headers){let i=headers.indexOf('ID');if(i<0)i=headers.findIndex(function(h){return /^ID_/.test(h)});return i;}
function dt90Mask_(headers,values){return values.map(function(x,i){return DT90_SECRET.test(headers[i])&&x!==''?'••••••':x});}
function dt90Read_(a){
  const name=dt90SheetName_(a.sheet),t=dt90Table_(name),q=norm_(a.q||''),col=String(a.col||'');
  const ci=col?t.headers.indexOf(col):-1;
  let rows=t.rows;
  if(q)rows=rows.filter(function(x){return norm_(ci>=0?x.values[ci]:x.values.join(' ')).indexOf(q)>=0;});
  if(a.rows&&a.rows.length){const set={};a.rows.forEach(function(r){set[r]=1});rows=t.rows.filter(function(x){return set[x.row]});}
  const size=Math.min(200,Math.max(10,Number(a.size)||50)),total=rows.length,pages=Math.max(1,Math.ceil(total/size)),page=Math.min(pages,Math.max(1,Number(a.page)||1));
  if(a.desc)rows=rows.slice().reverse();
  return {ok:true,sheet:name,group:dt90GroupOf_(name),headers:t.headers,idCol:dt90IdCol_(t.headers),secret:t.headers.map(function(h){return DT90_SECRET.test(h)}),total:total,page:page,pages:pages,size:size,
    rows:rows.slice((page-1)*size,page*size).map(function(x){return {row:x.row,values:dt90Mask_(t.headers,x.values)}})};
}
function dt90LoadRow_(name,row,expectId){
  const sh=getSheet_(name),lc=sh.getLastColumn(),headers=getHeaders_(name);row=Number(row);
  if(!(row>=2&&row<=sh.getLastRow()))throw new Error('ROW_INVALID:'+row);
  const values=sh.getRange(row,1,1,lc).getValues()[0],ic=dt90IdCol_(headers);
  if(ic>=0&&String(expectId==null?'':expectId)!==String(normalizeSheetValue_(values[ic])))throw new Error('ROW_CHANGED: Dòng '+row+' đã thay đổi (mã không khớp). Hãy tải lại bảng.');
  return {sh:sh,headers:headers,values:values,row:row,lc:lc};
}
function dt90Archive_(name,id,type,obj,note){
  try{appendObject_(V22.SHEETS.audit,{ID_AUDIT:nextIdUnlocked_(V22.SHEETS.audit,'AUD'),NGAY_XU_LY:today_(),SHEET_NGUON:name,ID_GOC:String(id||''),LOAI_LOI:type,LY_DO:note||'Công cụ bảo trì dữ liệu',DATA_GOC:JSON.stringify(obj).slice(0,45000),TRANG_THAI:'Đã lưu trữ'});}catch(ignore){}
}
function dt90Obj_(headers,values){const o={};headers.forEach(function(h,i){if(h&&!DT90_SECRET.test(h))o[h]=normalizeSheetValue_(values[i])});return o;}
function dt90Save_(a){
  const name=dt90SheetName_(a.sheet),r=dt90LoadRow_(name,a.row,a.id),input=a.values||{},next=r.values.slice(),changed={};
  r.headers.forEach(function(h,i){
    if(!h||DT90_SECRET.test(h)||!Object.prototype.hasOwnProperty.call(input,h))return;
    const nv=String(input[h]==null?'':input[h]),ov=String(normalizeSheetValue_(r.values[i])==null?'':normalizeSheetValue_(r.values[i]));
    if(nv!==ov){next[i]=nv;changed[h]={cu:ov,moi:nv};}
  });
  if(!Object.keys(changed).length)return {ok:true,changed:0};
  r.sh.getRange(r.row,1,1,r.lc).setValues([next]);
  invalidateSheetV20_(name,true);
  dt90Archive_(name,a.id,'DATA_TOOL_EDIT',changed,'Sửa dòng '+r.row+' bằng Công cụ bảo trì dữ liệu');
  return {ok:true,changed:Object.keys(changed).length};
}
function dt90Add_(a){
  const name=dt90SheetName_(a.sheet),headers=getHeaders_(name),input=a.values||{},ic=dt90IdCol_(headers),obj={};
  headers.forEach(function(h){if(h&&!DT90_SECRET.test(h)&&input[h]!==undefined&&input[h]!=='')obj[h]=String(input[h])});
  if(ic>=0&&!obj[headers[ic]]){
    const counts={};dt90Table_(name).rows.forEach(function(x){const m=String(x.values[ic]||'').match(/^([A-Za-z]+)\d+$/);if(m)counts[m[1]]=(counts[m[1]]||0)+1});
    const prefix=Object.keys(counts).sort(function(p,q){return counts[q]-counts[p]})[0];
    if(prefix)obj[headers[ic]]=nextIdUnlocked_(name,prefix);
  }
  appendObject_(name,obj);invalidateSheetV20_(name,true);
  return {ok:true,id:ic>=0?obj[headers[ic]]||'':''};
}
function dt90Delete_(a){
  const name=dt90SheetName_(a.sheet),r=dt90LoadRow_(name,a.row,a.id);
  dt90Archive_(name,a.id,'DATA_TOOL_DELETE',dt90Obj_(r.headers,r.values),'Xóa dòng '+r.row+' bằng Công cụ bảo trì dữ liệu');
  r.sh.deleteRow(r.row);invalidateSheetV20_(name,true);
  return {ok:true};
}
function dt90Distinct_(a){
  const name=dt90SheetName_(a.sheet),t=dt90Table_(name),ci=t.headers.indexOf(String(a.col||''));
  if(ci<0||DT90_SECRET.test(t.headers[ci]))throw new Error('COLUMN_INVALID');
  const map={};t.rows.forEach(function(x){const v=String(x.values[ci]==null?'':x.values[ci]);map[v]=(map[v]||0)+1});
  const values=Object.keys(map).map(function(v){return {value:v,count:map[v],key:norm_(v).replace(/_+/g,' ').replace(/[^A-Z0-9 ]/g,'').trim()}}).sort(function(p,q){return q.count-p.count});
  // Nhóm gợi ý: các giá trị khác nhau nhưng giống nhau khi bỏ dấu/hoa thường/khoảng trắng.
  const byKey={};values.forEach(function(x){(byKey[x.key]=byKey[x.key]||[]).push(x.value)});
  return {ok:true,sheet:name,col:t.headers[ci],total:t.rows.length,values:values.slice(0,1000),truncated:values.length>1000,
    suggest:Object.keys(byKey).filter(function(k){return byKey[k].length>1}).map(function(k){return byKey[k]})};
}
function dt90Replace_(a){
  const name=dt90SheetName_(a.sheet),t=dt90Table_(name),ci=t.headers.indexOf(String(a.col||'')),from={},to=String(a.to==null?'':a.to);
  if(ci<0||DT90_SECRET.test(t.headers[ci]))throw new Error('COLUMN_INVALID');
  (a.from||[]).forEach(function(v){from[String(v)]=1});
  const hits=t.rows.filter(function(x){const v=String(x.values[ci]==null?'':x.values[ci]);return from[v]&&v!==to});
  if(a.apply&&hits.length){
    const rng=t.sh.getRange(2,ci+1,t.sh.getLastRow()-1,1),col=rng.getValues();
    hits.forEach(function(x){col[x.row-2][0]=to});rng.setValues(col);invalidateSheetV20_(name,true);
    dt90Archive_(name,t.headers[ci],'DATA_TOOL_NORMALIZE',{cot:t.headers[ci],tu:Object.keys(from),thanh:to,dong:hits.map(function(x){return x.row})},'Đồng nhất '+hits.length+' ô');
  }
  return {ok:true,count:hits.length,applied:!!a.apply};
}
function dt90Clean_(v){return typeof v==='string'?v.replace(/[ \t]/g,' ').replace(/ {2,}/g,' ').trim():v;}
// Xóa khoảng trắng thừa (đầu/cuối/đôi) trên cả bảng hoặc cả khu vực menu.
function dt90Trim_(a){
  const names=a.group?dt90Sheets_().sheets.filter(function(s){return s.group===a.group}).map(function(s){return s.name}):[dt90SheetName_(a.sheet)];
  let total=0;const per=[];
  names.forEach(function(name){
    const sh=getSheet_(name),lr=sh.getLastRow(),lc=sh.getLastColumn();if(lr<2||lc<1)return;
    const rng=sh.getRange(2,1,lr-1,lc),v=rng.getValues(),headers=getHeaders_(name);let n=0;
    v.forEach(function(row){row.forEach(function(x,i){if(DT90_SECRET.test(headers[i]||''))return;const c=dt90Clean_(x);if(c!==x){row[i]=c;n++}})});
    if(n){per.push({sheet:name,count:n});total+=n;if(a.apply){rng.setValues(v);invalidateSheetV20_(name,true)}}
  });
  return {ok:true,count:total,sheets:per,applied:!!a.apply};
}
function dt90FixSpaces_(a){return dt90Trim_({group:a.group||'',sheet:a.sheet||'',apply:true});}
// Quét lỗi: tiêu đề trống/trùng, thiếu mã, trùng mã, ngày sai, tham chiếu không tồn tại, khoảng trắng thừa.
function dt90Scan_(a){
  const started=Date.now(),all=dt90Sheets_().sheets,names=all.filter(function(s){return (!a.group||s.group===a.group)&&(!a.sheet||s.name===a.sheet)}).map(function(s){return s.name});
  const issues=[],count={},MAX=3000,refIds={};
  const add=function(sheet,row,id,col,type,level,value,msg,fix){count[type]=(count[type]||0)+1;if(issues.length<MAX)issues.push({sheet:sheet,group:dt90GroupOf_(sheet),row:row,id:id,col:col,type:type,level:level,value:String(value==null?'':value).slice(0,120),msg:msg,fix:!!fix})};
  const refSet=function(sheet){
    if(refIds[sheet])return refIds[sheet];const set={};
    try{const t=dt90Table_(sheet),ic=sheet==='DM_HANG_MUC_BAO_TRI'?t.headers.indexOf('ID_HANG_MUC'):sheet==='DM_LICH_BAO_TRI'?t.headers.indexOf('ID_LICH'):t.headers.indexOf('ID');if(ic>=0)t.rows.forEach(function(x){set[String(x.values[ic]).trim()]=1});else return refIds[sheet]=null;}catch(e){return refIds[sheet]=null}
    return refIds[sheet]=set;
  };
  names.forEach(function(name){
    const t=dt90Table_(name),H=t.headers,ic=dt90IdCol_(H),seen={},hc={};
    H.forEach(function(h,i){if(!h&&i<H.length-1&&H.slice(i+1).some(Boolean))add(name,1,'',('Cột '+(i+1)),'HEADER_EMPTY','CẢNH BÁO','','Tiêu đề cột trống giữa bảng.');if(h){if(hc[h])add(name,1,'',h,'HEADER_DUP','LỖI',h,'Tiêu đề cột bị trùng.');hc[h]=1}});
    const dateCols=[],refCols=[];
    H.forEach(function(h,i){if(/^(NGAY|DEADLINE|HAN_)/.test(h)&&!/SO_NGAY|NGAY_TRONG|_SNAPSHOT$/.test(h))dateCols.push(i);if(DT90_REFS[h]&&DT90_REFS[h]!==name)refCols.push(i)});
    t.rows.forEach(function(x){
      const id=ic>=0?String(x.values[ic]==null?'':x.values[ic]).trim():'';
      if(ic>=0){if(!id)add(name,x.row,'',H[ic],'ID_MISSING','LỖI','','Dòng thiếu mã '+H[ic]+'.');else if(seen[id])add(name,x.row,id,H[ic],'ID_DUP','LỖI',id,'Trùng mã với dòng '+seen[id]+'.');else seen[id]=x.row;}
      dateCols.forEach(function(i){const v=x.values[i];if(v===''||v==null)return;const s=String(v).trim();if(!/^\d{4}-\d{2}-\d{2}/.test(s)&&!/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(s))add(name,x.row,id,H[i],'DATE_INVALID','LỖI',s,'Ngày không đúng định dạng.')});
      refCols.forEach(function(i){const v=String(x.values[i]==null?'':x.values[i]).trim();if(!v)return;const set=refSet(DT90_REFS[H[i]]);if(!set)return;v.split(/\s*[,;]\s*/).forEach(function(p){if(p&&!set[p])add(name,x.row,id,H[i],'REF_MISSING','LỖI',p,'Mã tham chiếu không tồn tại trong '+DT90_REFS[H[i]]+'.')})});
      x.values.forEach(function(v,i){if(typeof v==='string'&&!DT90_SECRET.test(H[i]||'')&&dt90Clean_(v)!==v)add(name,x.row,id,H[i]||('Cột '+(i+1)),'SPACES','CẢNH BÁO',v,'Khoảng trắng thừa.',true)});
    });
  });
  return {ok:true,scanned:names.length,issues:issues,count:count,total:Object.keys(count).reduce(function(s,k){return s+count[k]},0),truncated:issues.length>=MAX,elapsedMs:Date.now()-started};
}
// Năm của một dòng: lấy cột ngày ưu tiên đầu tiên có giá trị.
function dt90YearCols_(headers){
  const pref=['NGAY_TAO','NGAY','NGAY_GIAO','NGAY_THUC_HIEN','NGAY_DE_XUAT','NGAY_BAT_DAU','NGAY_XU_LY','NGAY_GUI'],out=[];
  pref.forEach(function(p){const i=headers.indexOf(p);if(i>=0)out.push(i)});
  headers.forEach(function(h,i){if(/^NGAY/.test(h)&&out.indexOf(i)<0)out.push(i)});
  return out;
}
function dt90RowYear_(row,cols){
  for(let k=0;k<cols.length;k++){const v=row[cols[k]];if(v instanceof Date)return v.getFullYear();const s=String(v||'');let m=s.match(/^(\d{4})-\d{2}-\d{2}/)||s.match(/\d{1,2}\/\d{1,2}\/(\d{4})/);if(m)return Number(m[1]);}
  return null;
}
function dt90NewBackup_(title){
  const file=SpreadsheetApp.create(title);
  try{const parent=DriveApp.getFileById(V22.SPREADSHEET_ID).getParents();if(parent.hasNext())DriveApp.getFileById(file.getId()).moveTo(parent.next())}catch(ignore){}
  return file;
}
function dt90Remember_(item){
  const props=PropertiesService.getScriptProperties();let list=[];try{list=JSON.parse(props.getProperty('PL90_BACKUPS')||'[]')}catch(e){}
  list.unshift(item);props.setProperty('PL90_BACKUPS',JSON.stringify(list.slice(0,40)));return list;
}
function dt90BackupYear_(a){
  const year=Number(a.year);if(!(year>=2000&&year<=2100))throw new Error('YEAR_INVALID');
  const stamp=Utilities.formatDate(new Date(),V22.TZ,'yyyyMMdd-HHmm'),out=dt90NewBackup_('PHILONG BACKUP '+year+' ('+stamp+')'),blank=out.getSheets()[0],per=[];let total=0;
  const names=dt90Sheets_().sheets.filter(function(s){return !a.group||s.group===a.group}).map(function(s){return s.name});
  names.forEach(function(name){
    const sh=getSheet_(name),lr=sh.getLastRow(),lc=sh.getLastColumn();if(lr<1||lc<1)return;
    const v=sh.getRange(1,1,lr,lc).getValues(),headers=v[0].map(function(h){return String(h||'').trim()}),cols=dt90YearCols_(headers);
    let rows;
    if(cols.length)rows=v.slice(1).filter(function(r){return dt90RowYear_(r,cols)===year});
    else if(a.withCatalogs!==false)rows=v.slice(1).filter(function(r){return r.some(function(x){return x!==''&&x!==null})});
    else return;
    if(!rows.length&&cols.length)return;
    const dst=out.insertSheet(name);dst.getRange(1,1,rows.length+1,lc).setValues([v[0]].concat(rows));dst.setFrozenRows(1);
    per.push({sheet:name,rows:rows.length,byYear:!!cols.length});total+=rows.length;
  });
  if(per.length)out.deleteSheet(blank);
  const item={type:'YEAR',year:year,group:a.group||'',name:out.getName(),url:out.getUrl(),rows:total,sheets:per.length,at:nowStamp_()};
  dt90Remember_(item);
  return {ok:true,backup:item,sheets:per};
}
function dt90BackupAll_(){
  const stamp=Utilities.formatDate(new Date(),V22.TZ,'yyyyMMdd-HHmm'),src=DriveApp.getFileById(V22.SPREADSHEET_ID);
  const copy=src.makeCopy('PHILONG BACKUP TOAN BO ('+stamp+')');
  const item={type:'ALL',year:'',group:'',name:copy.getName(),url:copy.getUrl(),rows:'',sheets:ss_().getSheets().length,at:nowStamp_()};
  dt90Remember_(item);
  return {ok:true,backup:item};
}
function dt90Backups_(){
  let list=[];try{list=JSON.parse(PropertiesService.getScriptProperties().getProperty('PL90_BACKUPS')||'[]')}catch(e){}
  const years={},now=new Date().getFullYear();for(let y=now;y>=now-6;y--)years[y]=1;
  return {ok:true,list:list,years:Object.keys(years).map(Number).sort(function(p,q){return q-p})};
}
