# Phi Long Management – Google Apps Script (bản 137.0-system-lock-20260924)

Mã nguồn Web App Apps Script được lưu ở đây để phân tích / sửa lỗi sau này.
Tách biệt với ứng dụng Next.js ở thư mục gốc.

## Tệp
| Tệp | Kích thước | Vai trò |
|---|---|---|
| `Code.gs` | ~5.150 dòng, ~376 hàm | Backend: đọc/ghi Google Sheet, RBAC, cấp ID, email cảnh báo, xuất đề xuất, công cụ dữ liệu |
| `index.html` | ~12.380 dòng, 1,2 MB, ~91 khối `<script>` | Toàn bộ frontend (CSS + JS nội tuyến, không dùng template `<? ?>`) |
| `appsscript.json` | | V8, TZ Asia/Ho_Chi_Minh, `executeAs: USER_DEPLOYING`, `access: ANYONE_ANONYMOUS` |

## Backend – điểm chính
- Cấu hình `V22` (dòng ~14): `SPREADSHEET_ID`, `SUPER_ADMIN_ROLE='VR0004'`, bảng tên sheet `V22.SHEETS`.
- `MODULES`, `CRUD_CONFIG` (sheet / tiền tố ID theo module).
- `setupV84()`: chạy tay một lần – tạo schema, danh mục, đồng bộ lịch bảo trì, email trigger, favicon.
- `doGet()`: `createHtmlOutputFromFile('index')` + meta viewport / PWA + favicon URL từ Script Properties.
- RPC chính từ frontend: `server(fn,args)` → `legacyV22NoLogin(fn,args,systemToken)` → `guardSystemRpcV137_` → `legacyV22DispatchNoAuth_` (switch theo tên hàm).
- Các RPC gọi thẳng khác: `getFastStartupV64`, `getPageBundleV64`, `getCorePageBundleV82`, `getWorkPageBundleFastV120`, `getPageListV124`/`getPageReferencesV124`/`getPageRecordV124`, `saveUiFormV19/V22`, `saveUniversalEditV26`, `dataToolV90`, `runMaintenanceDataAuditV78`, `runMaintenanceDataRepairV79`, `verifySystemLockPassword`, `lockSystemV137`, `getVisitorBundleV165`, `getWorkReportBundleV90`.
- Phân quyền: `requirePermission_(user,module,action)` đọc `PHAN_QUYEN`; Super Admin bỏ qua; nếu chưa cấu hình → `fallbackPermission_` (VR0001 quản trị, VR0002 quản lý, VR0003 nhân viên).
- **Chế độ NO-LOGIN**: `getNoLoginTestUser_()` luôn trả về người dùng Super Admin (VR0004) đang hoạt động (cache 6h) → mọi người truy cập đều là Super Admin.
- Khóa Hệ thống V137 (`SYSTEM_LOCK_V137`, dòng ~2351): mật khẩu ở cột `NGUOI_SU_DUNG.MAT_KHAU_HE_THONG` (lưu thô), token 30 phút trong CacheService, tối đa 10 lần sai/5 phút. Xóa bản ghi cũng cần mật khẩu này (`requireDeletePasswordV144_`).
- Cấp ID: `nextId_` = LockService + sheet `SYS_ID_SEQUENCE` (ENTITY, PREFIX, LAST_NUMBER, UPDATED_AT); ID dạng tiền tố + 4 chữ số.
- Cache đọc sheet: `beginFastRequestV20_`, `v84ReadSheetCache_`, `invalidateSheetV20_`, thế hệ domain `v124*`.
- Bảo trì: nhiều nhật ký (`NHAT_KY_BAO_TRI`); mốc hiện tại = MAX(NGAY_THUC_HIEN) theo cặp khu vực + hạng mục; `DM_LICH_BAO_TRI` một lịch/cặp; cảnh báo tính động.
- Công việc: giai đoạn (`*V162_`), ảnh công việc lưu Drive (`*WorkPhotoV163_`, trigger dọn ảnh chờ), khách ra vào (`*VisitorV165..171_`).
- Kho / thiết bị: cấp phát, thu hồi, chuyển thiết bị, nhập xuất kho, điều chỉnh tồn (`*V83_`, `*V841430_`, `*V96_`).
- Đề xuất: xuất Google Doc/PDF (`*V8414_`, `*V90_`), vật tư đề xuất (`*V170_`, `*V84149_`).
- Email cảnh báo: `*V84_`/`*V86_`, trigger thời gian, nhật ký gửi.
- Công cụ dữ liệu `dataToolV90(action,…)`: sheets/read/save/add/delete/distinct/replace/trim/fixSpaces/scan/backupYear/backupAll/backups.

## Frontend – trang (section id)
work, workProgress, workReport, visitors, daily, equipment, maintenanceLog, maintenancePlan,
proposalBuyMaterial, proposalBuy, proposalDispose, proposalMaintenance, warehouseDevice, recovery,
materialWarehouse, tenants, prospects, floors, employees, pcccEmployees, contractors, suppliers,
materials, buildingAreas, maintenanceItems, operationDetail, users, roles, permissions,
systemAudit, maintenanceDataTool, systemConfig, emailConfig.
Trang Hệ thống (cần mở khóa): users, roles, permissions, systemAudit, maintenanceDataTool, systemConfig, emailConfig.

- Trạng thái chung `APP` và cơ chế mở rộng `PL_STEPS` / `plDefineSteps_` / `plStep_` (dòng ~3925).
- Nhiều lớp vá theo phiên bản (V64 → V841xxx) chồng lên nhau trong các khối `<script>`/`<style>` riêng.

## Vấn đề cần lưu ý khi sửa sau
1. Web App `ANYONE_ANONYMOUS` + chạy dưới quyền người triển khai + no-login Super Admin → ai có link đều đọc/sửa được dữ liệu nghiệp vụ; chỉ khu Hệ thống/xóa có mật khẩu.
2. Mật khẩu hệ thống lưu dạng văn bản thô trong sheet, so sánh `===` trực tiếp.
3. Một số RPC không gọi `requirePermission_` (ví dụ `saveStockTransaction`, `allocateDevice`, `recoverDevice`, `transferAsset`, `getDeviceTransferHistory`, `saveOperationDetailV841531`, `saveProposalMaterialBundleV84149`) – cần kiểm tra bên trong hàm.
4. `requirePermission_` chỉ lấy luật đầu tiên khớp (`activeRules[0]`).
5. `index.html` 1,2 MB với nhiều lớp vá trùng lặp → dễ xung đột CSS/JS, tải chậm.
