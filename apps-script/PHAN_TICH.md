# PHI LONG V5.4.93 (toolbar) — Ghi chú phân tích mã nguồn

Bản gốc: `PHILONG_V5.4.93_TOOLBAR_FULL.zip` (Code.gs, index.html, iframe.html, logo.png, README.txt, THAY_DOI.txt).
Ứng dụng Google Apps Script Web App, quản lý tài sản IT. `APP_CONFIG.VERSION = '5.4.93-toolbar'`.
CSDL: Google Sheet `1ggFuX2kHKmzJciIPuTVdIWIlyO4Ryn1fnUegdywK3lE`, múi giờ `Asia/Saigon`.

Kiểm tra cú pháp (node vm): Code.gs đạt; 54/54 khối `<script>` nội tuyến trong index.html đạt.

## 1. Code.gs (~4030 dòng, ~337 hàm)

| Vùng (dòng) | Nội dung |
|---|---|
| 1–145 | `APP_CONFIG`, `SHEET` (tên sheet), `TABLES` (pk, prefix ID, cột ẩn), `PAGE_DATA_ROUTES` (trang UI → sheet đọc/ghi + feature), `UI_CONTAINER_PAGE` |
| 148–216 | Định tuyến trang, `normalizeUiPayloadV54_` (đổi tên trường cũ → mới theo từng sheet), lọc payload theo header |
| 218 | `doGet` — trả `index`; chỉ cho nhúng iframe khi Script property `ALLOW_IFRAME_EMBED=true` |
| 246–365 | `saveRecordV53_`, `rebuildStockV53_`, `getDb_`, `getSheet_` |
| 416–655 | CẨM NANG (sheet `CAM_NANG`, tối đa 5 ảnh `HINH_ANH_1..5`, thư mục Drive `116gIdzEn1FdSJXybN4R7_jofeorvhhBb`) |
| 656–1010 | Tiện ích bảng: `readTable_`, `generateId_`, kho/tồn kho cũ, `writeSystemLog_` |
| 1060–1370 | **Xác thực V5467/V5470/V5475**: token gửi như tham số chuỗi `PLAUTH_V5475:<token>` cuối danh sách đối số; `authCallUserV5470_`, `authCallAdminOrOwnerV5470_`, `authCallPermV5471_`; RBAC theo bảng `PHAN_QUYEN` (XEM/THEM/SUA/XOA/DUYET/XUAT_FILE), tắt bằng `RBAC_ENFORCE=false`; chống dò mật khẩu (đếm lỗi), khóa ghi `withScriptLockV5471_`; hash mật khẩu + pepper; quên/đặt lại mật khẩu qua email |
| 1451–1490 | Xuất file đề xuất (V8414) |
| 1491–1775 | Lookups, bootstrap, `getPageBundleV64`, `saveUiFormV19/V20/V22`, bảo trì dữ liệu |
| 1804–2240 | **Thiết bị**: sinh mã thiết bị (`nextDeviceCodeV5425_` theo phòng ban/cơ sở/tầng), lưu, chuyển người dùng + lịch sử (`LICH_SU_CHUYEN_THIET_BI`), hình thức sử dụng Cá nhân/Dùng chung (V5480), đồng bộ phòng ban theo người dùng, nhân viên nghỉ việc |
| 2239–2340 | Báo sự cố, nhập thiết bị từ Excel (`importDevicesV5481`) |
| 2342–2560 | Quyền của tôi, `getPageBundleV5482` (khung trang mới), đổi trạng thái bản ghi, duyệt đề xuất, cho nhân viên nghỉ |
| 2615–2870 | Kho NXT (`KHO_NHAPXUATTON`): sổ cái, tính tồn, nhập/xuất kho |
| 2917–3040 | Cấu hình hệ thống, in phiếu đề xuất, cấu hình email |
| 3058–3110 | Cache (CacheService chia khối lớn, memo đọc sheet, phiên bản lookups) |
| 3119–3250 | Đề xuất (V5463) |
| 3252–3310 | Lưu trữ nhật ký hệ thống + trigger |
| 3312–3740 | **V5485 Xuất dùng / Mua mới**: duyệt, xuất kho theo đề xuất, hủy duyệt, nhận hàng, đối chiếu, báo cáo chi phí |
| 3766–3995 | **V5486 Thanh lý / Sửa chữa–bảo trì**: đề xuất, duyệt, lập phiếu thanh lý, hoàn tất sửa chữa |
| 3998–4032 | V5487: phiên bản đọc theo sheet (cache), tổng hợp tồn, dữ liệu bổ sung trang |

Quy ước: hàm có `_` cuối là nội bộ; hàm public tương ứng bọc qua `authCall*` (kiểm tra token/quyền rồi bỏ token khỏi đối số).

## 2. index.html (~2714 dòng, 1,37 MB — logo PNG base64 nhúng 3 lần ≈ 160 KB)

- Dòng 7–61: polyfill, **`PL_GS_RUN_V5472`** (thay `google.script.run`, gắn token, xếp hàng khi chưa đăng nhập, tự mở lại đăng nhập khi hết phiên), `PL_FIND_V5487` (tra cứu lookup bằng Map).
- Dòng 72–309: `#philongDesktopStyles` (media `not all and (max-width:1024px)`), dòng 313: `#philongMobileStyles` (≤1024px), 348–351: CSS mobile thiết bị, nút nổi, logo, bản quyền đăng nhập.
- Dòng 353–~545: HTML — cổng đăng nhập (đăng nhập / đổi mật khẩu lần đầu / quên / đặt lại), topbar + menu (THIẾT BỊ, CẨM NANG, KHO, ĐỀ XUẤT, DANH MỤC, HỆ THỐNG), subbar, các `section` trang.
- Dòng 546–1015: các lớp script cũ chồng lên nhau theo phiên bản (V17…V5464), bọc/ghi đè `window.showPage`, `loadLiveData`, `openAddForCurrentPage`, `v17OpenForm`…; trang thiết bị cơ sở `DEVICE_V5443` (`renderDeviceV5443`, nút ẩn `deviceAddV5443`, `deviceEditV5443`, `deviceTransferV5443`, `deviceViewV5443`, `deviceHistoryV5443`, `deviceReloadV5443`).
- Dòng 1016–1352: **`philongDeviceDesktopV5478`** — giao diện desktop “Kho thiết bị đang dùng” (lớp `.pld-*`), bọc `renderDeviceV5443`. Đây là phần V5.4.93 sửa:
  - Hàng trên `.pld-action-row`: “Đã chọn: …” bên trái; 4 thao tác chính (Xem, Sửa, Chuyển, Thu hồi); “Thêm thao tác ▾” (Sửa chữa/bảo trì, Đề xuất thanh lý, Lịch sử, In tem); “Excel ▾” (xuất đang xem, xuất theo phòng ban, nhập Excel, tải mẫu).
  - Hàng dưới `.pld-filter-row`: Tất cả, Phòng ban, Vị trí (cơ sở|tầng), “Lọc thêm ▾” (Dùng chung / Lệch phòng ban / Người đã nghỉ), chip bộ lọc đang chọn, chip “Máy của …”.
  - Trạng thái `P={page,view,owner,dept,loc,menu,...}`; 50 dòng/trang; ngăn chi tiết bên phải (người dùng, thông số, lịch sử chuyển qua `getDeviceTransferHistoryV5428`).
  - CSS toolbar nằm trong stylesheet desktop, phạm vi `#equipment .pld-action-row / .pld-filter-row …`, có `@media(max-width:1180px)` cho xuống hàng.
- Dòng 1353–1514: `philongUsageStylesV5480` + `philongUsageV5480` (`PL_USAGE_V5480`: hộp thoại `.pl80-*`, `askSync`, sự kiện `philong:device-impact`).
- Dòng 1515–1640: `philongDeviceToolsV5481` (`PL_DEVICE_TOOLS_V5481`: thu hồi, bảo trì, in tem QR — qrcodejs 1.0.0, nhập Excel — SheetJS 0.18.5 từ cdnjs).
- Dòng 1641–2709: **`philongPageFrameV5482`** (`PL_PAGE_FRAME_V5482`) — khung trang chung desktop (lớp `.plp-*`) cho 12 trang: employees, departments, locations, warehouses, maintenanceItems, users, roles, permissions (ma trận), proposal, materialWarehouse, recovery, handbook. Tắt từng trang bằng Script property `UI_V2_OFF="employees,proposal"`. Bao gồm V5485 (Xuất dùng/Mua mới, biên bản bàn giao, nhập kho theo đề xuất) và V5486 (5 loại đề xuất, `PL_PROPOSAL_V5486`).

## 3. Đối tượng toàn cục quan trọng (frontend)

`PL_GS_RUN_V5472`, `PL_FIND_V5487`, `DEVICE_V5443`, `renderDeviceV5443`, `PHILONG_DEVICE_DESKTOP_V5478`, `PL_USAGE_V5480`, `PL_DEVICE_TOOLS_V5481`, `PL_PAGE_FRAME_V5482`, `PL_LEGACY_GATE_V5483`, `PL_DEVICE_APPLY_V5484`, `PL_PROPOSAL_V5486`, `AUTH_GATE_V5467`, `v17Toast`.
localStorage: `PHI_LONG_AUTH_TOKEN_V5467` (token), `philong-theme` (sáng/tối).

## 4. Script properties

`ALLOW_IFRAME_EMBED`, `RBAC_ENFORCE`, `UI_V2_OFF`, cùng các khóa pepper/cấu hình mật khẩu dùng trong `authPepperV5467_`.

## 5. Lưu ý khi sửa sau này

- Nhiều lớp ghi đè theo phiên bản: luôn tìm định nghĩa **cuối cùng** của một hàm `window.*` (lớp sau bọc lớp trước).
- Desktop/mobile tách CSS bằng `media` trên thẻ `<style>`; trang Thiết bị desktop dùng `.pld-*`, các trang khác `.plp-*`.
- Header comment Code.gs vẫn ghi `V5.4.76-split-desktop-mobile`; phiên bản thật lấy ở `APP_CONFIG.VERSION`.
- README gốc: bản này **chưa** triển khai lên Web App đang chạy; chưa kiểm tra trực quan bằng trình duyệt.
- `iframe.html` là khung nhúng tham khảo trỏ tới deployment `AKfycbz87D2h…/exec`.
