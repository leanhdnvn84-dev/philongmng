# PHILONG BUILDING – Google Apps Script (bản gốc để phân tích/sửa)

Nguồn: 3 file người dùng tải lên ngày 2026-09-25 (backend `V22.VERSION = 137.0-system-lock-20260924`).

| File | Dòng | Vai trò |
|---|---|---|
| `appsscript.json` | 18 | Manifest: TZ Asia/Ho_Chi_Minh, V8, web app `executeAs: USER_DEPLOYING`, `access: ANYONE_ANONYMOUS` |
| `Code.gs` | 4511 | Backend (Spreadsheet `1X5r0kIWvSUXsQSf13-TDxYMROOeKGIHzICA6yj11oFQ`) |
| `index.html` | 12347 | Toàn bộ frontend (CSS ~4.1k dòng + hàng chục khối `<script>` vá theo phiên bản) |

## Backend – bản đồ Code.gs
- 14–100: `V22` (sheet names), `MODULES`, `CRUD_CONFIG` (prefix ID: CV, HN, TB, VT, DX, DXVT, DXM, DXTL, DXBT, HD, KT, TANG, KHTN, NV).
- 104 `setupV84()` – chạy tay 1 lần: đảm bảo schema, đồng bộ lịch bảo trì, email, favicon.
- 173 `doGet()` – render `index`.
- 218 RBAC: `requirePermission_` (sheet PHAN_QUYEN, Super Admin = VR0004 bypass), `fallbackPermission_` (VR0001/2/3).
- 266–640 Bảo trì: nhật ký, lịch (`rebuildMaintenancePair_`, MAX(NGAY_THUC_HIEN) theo cặp khu vực+hạng mục), đồng bộ lịch thiếu.
- 639–1240 Thiết bị/kho: chuyển thiết bị, thu hồi, nhập xuất kho, tồn kho.
- 1239–1540 Audit/repair dữ liệu bảo trì (V78/V79).
- 1558–1830 Đảm bảo schema các sheet (danh mục, bảo trì, CVHN, đề xuất, cho thuê).
- 1834–1920 Tiện ích: `norm_`, `today_`, `dateOnly_`, `addDays_`, `alertForDate_`…
- 1919–2470 Lớp `legacy*`: bootstrap, công việc (trạng thái V141/V148/V157), đề xuất + `approveProposal_`, báo cáo, người dùng/vai trò.
- 2493 **`legacyV22NoLogin(fn,args,systemToken)`** – cổng RPC duy nhất của frontend (chế độ NO LOGIN, dùng user admin đầu tiên).
- 2554 V137 khóa Hệ thống: mật khẩu `NGUOI_SU_DUNG.MAT_KHAU_HE_THONG` → token Cache 30 phút; `guardSystemRpcV137_`.
- 2632 V132 chặn duyệt đề xuất qua form sửa. 2645 V142 cổng xóa duy nhất `deleteRecordV142_` (whitelist, lưu DATA_AUDIT_ARCHIVE), V144 mọi xóa cần mật khẩu Hệ thống.
- 2769 `legacyV22DispatchNoAuth_` – switch các `fn`.
- 2845 `saveUiFormV19` (lưu + đọc kiểm tra). 2963–3210 V20 fast I/O: cache theo request, CacheService theo sheet, `nextId_` qua SYS_ID_SEQUENCE + Lock.
- 3348–3910 Bundle theo trang: `getFastStartupV64`, `getCorePageBundleV82`, `getWorkPageBundleFastV120`, `getPageBundleV64`, `getPageListV124` (phân trang/lọc/sắp xếp phía server).
- 3998 `saveUiFormV22`, 4015 `saveUniversalEditV26`.
- Email cảnh báo (V85, giữ tên hàm V84): `sendEmailAlertsV84` gửi 1 email tổng hợp/người nhận, chống lặp theo ngày, ghi nhật ký 1 lần; RPC `saveEmailAlertConfigAll`, `sendEmailAlertsNow`; trigger 15 phút tự tạo khi lưu có cảnh báo BẬT. 4356–4511 Xuất đề xuất ra Google Doc/PDF, lưu bundle đề xuất mua vật tư.

## Frontend – bản đồ index.html
- 31–4171 CSS (unified, bảng V206, cột danh mục V210, khung mobile V216).
- 4504 script lõi: `APP`, `server(fn,args,ok,fail)` → `google.script.run.legacyV22NoLogin(fn,args,plSystemTokenV137_())`, `esc`, `norm`, `fmtDate`, footer/pager V105–V106.
- Sau đó ~55 khối `<script id="pl-v…">` vá chồng (daily, work, proposal, equipment, maintenance, catalog, system-lock, pager, toolbar…).
- Trang (`showPage`): work, daily, maintenanceLog, maintenancePlan, maintenanceItems, maintenanceDataTool, equipment, warehouseDevice, materialWarehouse, materials, recovery, proposalBuyMaterial, proposalBuy, proposalMaintenance, proposalDispose, tenants, prospects, floors, buildingAreas, employees, pcccEmployees, contractors, suppliers, operationDetail, users, roles, permissions, systemAudit, systemConfig, emailConfig.
- RPC trực tiếp khác: `getFastStartupV64`, `getCorePageBundleV82`, `getWorkPageBundleFastV120`, `getPageListV124`, `getPageReferencesV124`, `saveUiFormV22`, `saveUniversalEditV26`, `verifySystemLockPassword`, `lockSystemV137`, `runMaintenanceDataAuditV78`, `runMaintenanceDataRepairV79`.

## Điểm cần lưu ý khi sửa sau này
- Web app `ANYONE_ANONYMOUS` + NO LOGIN: ai có URL đều chạy với quyền Super Admin (trừ các chức năng được khóa bằng mật khẩu Hệ thống).
- Mật khẩu Hệ thống lưu dạng thô trong sheet NGUOI_SU_DUNG.
- Các RPC chuyển thiết bị/kho trong dispatcher không gọi `requirePermission_`.
- Frontend: mỗi hàm toàn cục chỉ còn MỘT định nghĩa (đã gộp 32 chuỗi lớp vá, ngày 2026-09-25). Khối giao diện muốn chen vào hàm lõi thì khai báo bước `plDefineSteps_('khối',{bước:fn})`; hàm lõi gọi `plStep_('khối','bước',…)` theo thứ tự ghi trong thân hàm. Xem `PATCH_MAP.md` (sinh bằng `node tools/patch-map.js index.html > PATCH_MAP.md`; kiểm tra `--check`).
- Hành vi giữ nguyên có chủ đích (nghi là lỗi cũ, chưa sửa): `setStatus(text,type,page)` bỏ qua `page` từ khi V42 nạp. Trang Cấu hình email nay dựng từ bundle trang (`v82RenderLoadedPage`).
- Chức năng Chat (1-1, nhóm, định danh thiết bị) đã bị xóa hoàn toàn ở cả backend và frontend. Sheet `CHATNOIBO`, `PHIEN_CHAT_THIET_BI` trong Spreadsheet không còn được dùng — có thể xóa tay nếu muốn.

## Kiểm thử hồi quy giao diện (`tools/harness/`)
- `gas-mock.js`: chạy Code.gs trong Node với Google Sheet giả (dữ liệu mẫu tất định).
- `run.js`: mở index.html trong Chromium (desktop + mobile), đi qua mọi trang, bấm Xem/Sửa/Lưu/Thêm/Xóa/Tìm, mở khóa Hệ thống, chụp DOM đã chuẩn hóa.
- So sánh: `node tools/harness/run.js <bản_cũ.html> outA && node tools/harness/run.js index.html outB && node tools/harness/compare.js outA outB`.
- Khi so hai bản HTML khác nhau, đặt `SEED_HTML=<một file cố định>` để dữ liệu giả giống hệt nhau (dữ liệu giả sinh cột từ chữ trong HTML).
- Cần `npm --prefix tools install`; Chromium: đặt `CHROMIUM=/đường/dẫn/chrome` nếu Playwright không tự tìm thấy.
