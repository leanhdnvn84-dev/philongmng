# Phi Long Building – Phần mềm quản lý tòa nhà

Node.js + SQLite. **Không cần cài thư viện, không cần dịch vụ ngoài.** Chỉ cần Node ≥ 22.13.

```bash
npm run demo     # chạy kèm dữ liệu mẫu (hoặc: npm start để chạy trống)
```
Mở http://localhost:3000. Lần chạy đầu tiên, tài khoản `admin` và mật khẩu ngẫu nhiên được in ra terminal
(hoặc đặt trước bằng biến `ADMIN_PASSWORD`). Dữ liệu lưu ở `data/app.db`.

## Chức năng
- Tòa nhà, phòng, khách thuê, hợp đồng, **hóa đơn & thu tiền**, bảo trì, thiết bị, người dùng
- Tìm kiếm, lọc trạng thái, phân trang
- Tổng quan: tỷ lệ lấp đầy, doanh thu thuê/tháng, công nợ, hóa đơn quá hạn, hợp đồng sắp hết hạn, bảo trì tồn
- Quy tắc: 1 phòng chỉ 1 hợp đồng hiệu lực (có ràng buộc ở DB); phòng tự Đang thuê/Trống theo hợp đồng; hợp đồng quá hạn tự Hết hạn; "Tạo hóa đơn tháng" tạo hóa đơn cho mọi hợp đồng hiệu lực, không tạo trùng; thu tiền từng phần, không cho thu vượt số nợ
- Vai trò: `admin` (toàn quyền, quản lý người dùng, xóa) và `staff` (không xóa, không vào Người dùng)
- Nhật ký thao tác trong bảng `audit`

## Cấu trúc
- `server.js` – toàn bộ backend (API, đăng nhập, quy tắc). Thêm thực thể mới = thêm bảng SQL + 1 mục trong `ENT`.
- `public/` – giao diện (HTML/JS thuần, không build)
- `test.mjs` – `npm test`, kiểm thử API trên DB tạm

## Docker
```bash
docker compose up --build   # dữ liệu ở volume ./data
```

## Bảo mật
Mật khẩu băm scrypt; phiên lưu băm SHA-256, cookie HttpOnly + SameSite=Strict; giới hạn đăng nhập sai; truy vấn tham số hóa; CSP chặn script ngoài.
Chạy sau HTTPS (reverse proxy) khi đưa ra Internet và sao lưu `data/app.db` định kỳ.
