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

### Sheet (`SHEETS`)
`Lop`, `HocSinh`, `HoatDong`, `ThayCo`, `LuuBut`, `Anh`, `TaiKhoan`, `TinTuc`, `DangKy`, `NhatKy`, `CauHinh`.
Cột đầu tiên là khoá chính. Mọi ô ghi dạng text (`@`), giá trị bắt đầu bằng `= + @` được thêm `'` (`safe_`).

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
updateMyContact, seedDemo, clearDemo`.
Khi thêm/sửa hàm server, kiểm tra lại các lời gọi `api('...')` trong `Index.html` cho khớp.

### Dữ liệu mẫu
Mọi dòng mẫu có id bắt đầu `mau_`. `autoSeed_()` tự nạp khi Sheet trống (một lần, cờ `DEMO_AUTO`).
`seedDemo/clearDemo` (Quản trị → Cài đặt) hoặc `napDuLieuMau/xoaDuLieuMau` (trình soạn thảo).

### Giao diện (Index.html)
7 trang, mỗi trang một chủ đề màu riêng qua `body[data-p=...]`:
Trang chủ (phượng vĩ) · Các lớp (vở ô ly) · Ngoại khoá (sông Hàn) · Kỷ yếu (album kraft) ·
Hình ảnh (bảng đen) · Kết nối (báo tường) · Quản trị.
Ảnh hiển thị qua `https://drive.google.com/thumbnail?id=...&sz=w...`; ảnh tải lên được nén ≤1600px JPEG ở client (`readImg`).

### Bản tải về (`tai-ve/`)
- `tai-ve/NguyenHien-2000-2003.html` là bản **tạo ra** từ `apps-script/Index.html`, không sửa tay.
  Sau mỗi lần sửa Index.html, chạy lại: `PLAYWRIGHT=/opt/node-tools/node_modules/playwright node tools/build-tai-ve.js`.
  Script vẽ sẵn nội dung các trang vào HTML, vì trình xem tệp trên điện thoại (iPhone…) không chạy JavaScript.
- `tai-ve/NguyenHien-AppsScript.zip`: gói `Code.gs` + `Index.html` để dán vào Apps Script (đóng gói lại khi sửa).
