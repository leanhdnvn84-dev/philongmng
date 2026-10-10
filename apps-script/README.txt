PHI LONG V5.4.93 — BỘ MÃ THIẾT BỊ / THANH CÔNG CỤ

Tệp ứng dụng: Code.gs, index.html, iframe.html, logo.png.
Nền: V5.4.92 đã gỡ ping, giữ logo PNG trong suốt và bản quyền đăng nhập © 2026.

Bố cục:
- Hàng trên: thao tác căn phải, thông tin thiết bị chọn bên trái.
- Hàng dưới: bộ lọc căn trái, có Phòng ban, Vị trí, Lọc thêm và nhãn bộ lọc đang chọn.
- 4 thao tác chính: Xem, Sửa, Chuyển, Thu hồi.
- Thêm thao tác: Sửa chữa/Bảo trì, Đề xuất thanh lý, Lịch sử, In tem.
- Excel giữ đủ: xuất danh sách, xuất theo phòng ban, nhập Excel, tải mẫu nhập.
- Màn hình hẹp cho phép các nhóm xuống hàng, không cắt mất nút.

CSS:
- Chỉnh trực tiếp stylesheet desktop hiện có; không chèn thêm một stylesheet ghi đè mới.
- Tách CSS menu một hàng cũ và quy tắc responsive ẩn nút/lọc sang phạm vi .plp-page.
- Trang Thiết bị dùng một nhóm quy tắc #equipment riêng cho thanh công cụ hai hàng.
- Giữ CSS dùng chung, CSS mobile, CSS dark mode và các khác biệt có chủ ý.
- Rà trùng hoàn toàn không tìm thấy quy tắc/khai báo có thể xóa tự động an toàn; không xóa hàng loạt theo tên selector.

Kiểm tra:
- 54 script nhúng và Code.gs: cú pháp đạt.
- Kiểm tra sinh menu: đủ 12 chức năng, 2 bộ chọn lọc, 3 bộ lọc phụ, trạng thái chọn thiết bị và chip lọc: đạt.
- 16 kiểm tra hồi quy về dữ liệu, cache, quyền truy cập và kho: đạt.
- Không còn mô-đun/API ping.
- Chưa xác nhận trực quan bằng trình duyệt tự động: Edge không khởi chạy được trong môi trường kiểm tra Windows hiện tại.

TRIỂN KHAI:
Bộ mã này CHƯA được cập nhật lên Web App đang chạy.
Sao lưu dự án Apps Script trước khi thay Code.gs và index.html, sau đó tạo phiên bản mới trong đúng hoạt động triển khai hiện tại.
iframe.html là tệp khung tham khảo đi kèm, không cần thêm vào dự án nếu dự án hiện chỉ dùng code.gs và index.html.