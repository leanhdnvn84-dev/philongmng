# Ghi nhớ dự án

## File chuẩn: `apps-script/Code.gs` + `apps-script/Index.html`

Đây là **bản chuẩn** (nguồn sự thật) của web app kỷ niệm **THPT Nguyễn Hiền · niên khoá 2000 – 2003**
chạy trên Google Apps Script. Mọi chỉnh sửa sau này phải dựa trên hai file này, giữ nguyên
cấu trúc, cách đặt tên và phong cách code (ES5-style `function`, helper có hậu tố `_`, chuỗi tiếng Việt).

> Phần Next.js/Supabase (`src/`, README "Phi Long Building Management System") là dự án cũ, không liên quan tới web app này.

### Kiến trúc
- **Backend** `Code.gs`: dữ liệu ở Google Sheet `NGUYENHIEN_DATA` (`DATA_SHEET_ID`), ảnh ở Drive
  (thư mục gốc `ROOT_FOLDER_ID`, ảnh lưu thư mục con `ANH`, id lưu trong Script Property `FOLDER_ID`).
- **Frontend** `Index.html`: một trang SPA, gọi server qua `api(fn, ...args)` (bọc `google.script.run`).
  Nhúng sẵn `const DEMO={...}` (dòng rất dài) để hiện ngay khi chưa có dữ liệu thật.
- Lần đầu: chạy `setup()` trong trình soạn thảo → tạo sheet + 12 lớp (12/1 → 12/12, `SO_LOP`) + tài khoản `banlienlac` (mật khẩu in ra Execution log).
- Quên mật khẩu `banlienlac`: chạy `datLaiMatKhauBanLienLac()` trong trình soạn thảo → mật khẩu mới dễ nhớ in ra Execution log (mở khoá luôn).

### Sheet (`SHEETS`)
`Lop`, `HocSinh`, `HoatDong`, `ThayCo`, `LuuBut`, `Anh`, `TaiKhoan`, `TinTuc`, `DangKy`, `NhatKy`, `CauHinh`.
Cột đầu tiên là khoá chính. Mọi ô ghi dạng text (`@`), giá trị bắt đầu bằng `= + @` được thêm `'` (`safe_`).
Đọc/ghi theo **tên cột** ở hàng tiêu đề (`hdr_`), không theo vị trí: người dùng có thể chèn/đổi thứ tự/thêm cột riêng
trong Sheet; cột chuẩn còn thiếu được tự thêm ở cuối; `setup()` không ghi đè hàng tiêu đề. `clean_` bỏ dấu gõ lặp.
Trang công khai chỉ trả cột chuẩn (`pubOf_`), bỏ cột riêng tư `PRIVATE_COLS` (HocSinh.`sdt` – chỉ admin xem).

### Vai trò & phân quyền
- `super` (Ban liên lạc): toàn quyền. `class` (admin lớp): mỗi lớp đúng 1 admin, chỉ quản lý lớp mình (`canLop_`).
- Đăng nhập: SHA-256(salt|pw), phiên lưu CacheService 6 giờ (`SESSION_TTL`), khoá 10 phút sau 5 lần sai.
- Lỗi phiên có tiền tố `SESSION:` → frontend tự đăng xuất.
- Hoạt động do admin lớp đề xuất có `trangThai='pending'`, Ban liên lạc duyệt.
- Lưu bút công khai gửi vào `pending`; đăng ký họp lớp trạng thái `cho | xacnhan | huy`.

### Hàm public gọi từ frontend
`login, logout, changePassword, getPublicData, submitNote, getAdminData, saveClass, deleteClass,
setClassAdmin, removeClassAdmin, saveStudent, deleteStudent, importStudents, saveEvent, setEventStatus,
deleteEvent, saveTeacher, deleteTeacher, moderateNote, deleteNote, uploadPhoto, updatePhoto, deletePhoto,
saveConfig, saveNews, deleteNews, submitRegistration, setRegistrationStatus, deleteRegistration,
updateMyContact, seedDemo, clearDemo, autoCreateClassAdmins, moveStudents`.
`getAdminData.hsLac` (super): học sinh có `lopId` không khớp lớp nào → nhóm "⚠ Chưa thuộc lớp nào" trong Quản trị → Học sinh, tick + Chuyển lớp.
Tài khoản dễ nhớ: tên đăng nhập admin lớp `lop12_1` (`lopUser_`), mật khẩu dạng `luubut-4827` (`easyPw_`, cũng dùng cho `banlienlac` ở setup).
Khi thêm/sửa hàm server, kiểm tra lại các lời gọi `api('...')` trong `Index.html` cho khớp.

Cấu hình `doanMoDau` (Cài đặt → "Đoạn giới thiệu dưới câu mở đầu", hoặc dòng key `doanMoDau` ở Sheet CauHinh): đoạn văn ở hero trang chủ, có chỗ thay `{namRaTruong} {tenTruong} {diaChi} {soNam} {soLop}` (`doanMoDau()` trong Index.html); để trống → mặc định.
Cấu hình `banLienLac` (Cài đặt): mỗi dòng "Họ tên | Điện thoại/Zalo | Vai trò" → cột Ban liên lạc ở chân trang + đầu danh bạ trang Kết nối.
Mặc định trong `CONFIG_DEFAULT.banLienLac` (Lê Trung Hiếu, Hoàng Diệu Thúy, Nguyễn Thị Tuyết Mai) – dòng trong Sheet CauHinh (nếu có) sẽ ghi đè.

Thư ngỏ (họp mặt 30 năm, 17h30 14/11/2026): hằng `THU` trong Index.html; tự mở sau màn chờ (trừ khi người xem tick "Không tự mở" – localStorage `nh_an_`+`THU.ma`), mở lại bằng phong thư ở trang chủ (`moThu()`). Đổi thư mới → đổi `THU.ma` để mọi người lại thấy.

### Dữ liệu mẫu
Mọi dòng mẫu có id bắt đầu `mau_`. Nội dung mẫu viết trong `napDuLieuMau_()` (Code.gs); dòng `const DEMO=` trong Index.html
là bản chụp của nó, **tạo lại** bằng `node tools/build-demo.js` (chạy Code.gs trên Sheet giả lập) rồi build tai-ve. `autoSeed_()` tự nạp khi Sheet trống (một lần, cờ `DEMO_AUTO`).
`seedDemo/clearDemo` (Quản trị → Cài đặt) hoặc `napDuLieuMau/xoaDuLieuMau` (trình soạn thảo).

### Giao diện (Index.html)
7 trang, mỗi trang một chủ đề màu riêng qua `body[data-p=...]`:
Trang chủ (phượng vĩ) · Các lớp (vở ô ly) · Ngoại khoá (sông Hàn) · Kỷ yếu (album kraft) ·
Hình ảnh (bảng đen) · Kết nối (báo tường) · Quản trị.
Trang lớp → tab Danh sách lớp mặc định hiện **sơ đồ lớp học** (`soDoLop`, biến `cV='so'|'ds'`): bảng đen, bục giảng + bàn giáo viên (GVCN), các dãy bàn đôi theo thứ tự danh sách (tên to, họ đệm nhỏ, chức vụ, nơi ở; SĐT chỉ khi admin), ô "Tìm chỗ ngồi" (`timCho`); nút 📋 Danh sách trở về bảng cũ.
Chống tràn ngang mobile: `html{overflow-x:hidden}` + `body/main/section.view/footer{overflow-x:clip}` (không dùng `overflow-x:hidden` cho body vì làm hỏng header sticky); chữ to `nowrap` phải co theo `vw` ở ≤760px. Kiểm tra `scrollWidth` ở 320/360/390/430px.
Ảnh hiển thị qua `https://drive.google.com/thumbnail?id=...&sz=w...`; ảnh tải lên được nén ≤1600px JPEG ở client (`readImg`).

### Logo & trang nhúng
- Logo trường: `assets/logo-nguyen-hien.png` (bản gốc, nền ngoài hình thoi trong suốt). Index.html nhúng bản 128px dạng
  data URI ở `#hLogo` (header) + favicon; footer và trang chủ dùng lại `$('hLogo').src`. **Không** đặt data URI trong `<script>`
  (base64 có thể chứa `//`).
- `tai-ve/NguyenHien-iframe.html`: trang khung toàn màn hình nhúng web app (link `/exec`), có favicon logo, màn chờ.
  Đặt lên hosting/Google Sites để có link gọn, không hiện dải "Ứng dụng này do một người dùng Google Apps Script tạo".
- `cloudflare/worker.js` + `cloudflare/index.html` tạo từ trang khung bằng `node tools/build-cloudflare.js` (Worker
  `nguyenhien.leanhdnvn84.workers.dev` trả trang khung cho mọi đường dẫn). Màn chờ `.cho` phải có z-index cao hơn iframe.

### Lưu ý Apps Script (quan trọng)
Khi phục vụ trang, Apps Script cắt `//…` tới hết dòng và `/* … */` trong `<script>` **kể cả khi nằm trong chuỗi/template/regex**
→ trang trắng, lỗi kiểu `Unexpected identifier 'src'`. Trong script chỉ dùng `/* */` cho dòng chú thích thật; viết
`https:\/\/…` trong chuỗi, regex dùng `[/]` thay cho `\/`, `accept="image/\*"`. `tools/build-tai-ve.js` tự kiểm tra và báo lỗi.

### Bản tải về (`tai-ve/`)
- `tai-ve/NguyenHien-2000-2003.html` là bản **tạo ra** từ `apps-script/Index.html`, không sửa tay.
  Sau mỗi lần sửa Index.html, chạy lại: `PLAYWRIGHT=/opt/node-tools/node_modules/playwright node tools/build-tai-ve.js`.
  Script vẽ sẵn nội dung các trang vào HTML, vì trình xem tệp trên điện thoại (iPhone…) không chạy JavaScript.
- Script cũng ghi `tai-ve/Index.html` = bản gốc (đã kiểm tra `//`) để **dán vào Apps Script**, KHÔNG vẽ sẵn nội dung mẫu.
  Nếu JS lỗi, dòng đỏ ở cuối trang báo lỗi + số dòng (bắt lỗi ở `<script>` đầu `<head>`).
- Trên Apps Script (`LIVE`) trang không bao giờ dùng `DEMO`: hiện màn "Đang mở trang kỷ niệm…" tới khi có dữ liệu Sheet.
  `DEMO` chỉ dùng cho bản xem thử/tải về. `xoaDuLieuMau_` giữ thầy cô mẫu đã bị sửa tên, dọn giới thiệu/GVCN mẫu của lớp.
- `tai-ve/Code.gs` + `tai-ve/NguyenHien-AppsScript.zip` (Code.gs + Index.html bản dựng): đóng gói lại sau mỗi lần build.
