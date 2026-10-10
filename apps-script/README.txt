PHI LONG V5.4.95 — DÒ LẠI, SỬA CODE, DỌN CSS

Tệp ứng dụng: Code.gs, index.html, iframe.html, logo.png.
Nền: V5.4.93 (thanh công cụ Thiết bị) + V5.4.94 (chân trang chung).

Chân trang chung (V5.4.94):
- Trái: © <năm> Phi Long Technology · Hệ thống quản lý tài sản IT.
- Phải: Trang đang mở · Người dùng (Vai trò) · Thứ, dd/mm/yyyy.
- Desktop cố định đáy (30px), mobile nằm cuối nội dung. Ẩn ở màn đăng nhập và khi in.

Sửa code (V5.4.95):
- Gộp hai đối tượng APP (const APP và window.APP) thành một; gắn V17, V17_CONFIG, V16_TABLE_LABELS vào window.
  Hết lỗi: mở Đề xuất xong nút "+ Thêm" vẫn làm theo trang trước; nhãn ngắn nút Thêm; form Tài khoản tự điền email theo nhân viên.
- Trang Đề xuất: nút "+ Thêm" mở form đề xuất.
- Xóa 2 chuỗi chữ "\n" lọt ra màn hình mobile.
- Code.gs: so sánh mật khẩu băm bằng hàm thời gian hằng.

Dọn CSS:
- Bỏ bọc 19 khối @media luôn đúng; xóa 669 khai báo bị đè hoàn toàn (99 quy tắc rỗng); xóa 117 selector trỏ tới class/id không còn tồn tại.
- index.html giảm khoảng 33 KB.
- Không gộp/viết lại các quy tắc !important giữa các lớp phiên bản (đổi thứ tự cascade, rủi ro).

Kiểm tra:
- Code.gs và 57 khối script: cú pháp đạt; ESLint (no-undef, trùng khóa…) không còn lỗi thật.
- Mở 15 trang trên desktop và mobile (Chromium, chạy ngoài Web App): không lỗi JavaScript.
- So sánh getComputedStyle mọi phần tử trước/sau dọn CSS: 6 cỡ màn hình × sáng/tối × đăng nhập + 15 trang: không khác biệt.
- Chưa chạy với dữ liệu thật trong Web App.

TRIỂN KHAI:
Bộ mã này CHƯA được cập nhật lên Web App đang chạy.
Sao lưu dự án Apps Script trước khi thay Code.gs và index.html, sau đó tạo phiên bản mới trong đúng hoạt động triển khai hiện tại.
iframe.html là tệp khung tham khảo đi kèm, không cần thêm vào dự án nếu dự án hiện chỉ dùng code.gs và index.html.
