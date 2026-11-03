# Phi Long Building – Hệ thống quản lý tòa nhà

Next.js 14 (App Router) + Supabase (Postgres + Auth) + TypeScript + Tailwind.

## Chức năng
- Đăng nhập (Supabase Auth), phân quyền theo vai trò × module (xem / tạo / sửa / xóa)
- Quản lý: tòa nhà, tầng, phòng, khách thuê, hợp đồng, **hóa đơn & thu tiền**, bảo trì, thiết bị, nhà thầu, nhà cung cấp, người dùng
- Tìm kiếm, lọc trạng thái, phân trang, xuất CSV
- Quy tắc nghiệp vụ: 1 phòng chỉ có 1 hợp đồng hiệu lực; phòng tự chuyển Đang thuê/Trống theo hợp đồng; hợp đồng quá hạn tự chuyển Hết hạn; công việc bảo trì tự ghi thời điểm hoàn thành
- Hóa đơn: nút "Tạo hóa đơn tháng" tạo hóa đơn cho mọi hợp đồng hiệu lực (không tạo trùng); thu tiền từng phần, không cho thu vượt số nợ
- Nhật ký thao tác (`audit_logs`)
- Dashboard: tỷ lệ lấp đầy, doanh thu thuê/tháng, công nợ, hóa đơn quá hạn, hợp đồng sắp hết hạn, bảo trì tồn đọng

## Cài đặt
1. Supabase → SQL Editor, chạy `src/db/schema.sql` (một file duy nhất, chạy lại an toàn).
2. `cp .env.local.example .env.local` và điền khóa Supabase của bạn.
3. ```bash
   npm install
   npm run create-admin   # tạo tài khoản admin từ ADMIN_EMAIL / ADMIN_PASSWORD
   npm run dev            # http://localhost:3000
   ```
4. Đăng nhập, đổi mật khẩu admin, tạo người dùng khác ở mục **Người dùng**.

## Phân quyền mặc định
| Vai trò | Quyền |
|---|---|
| admin | Toàn quyền |
| manager | Xem/tạo/sửa mọi module (xóa chỉ ở Bảo trì), chỉ xem Hệ thống |
| technician | Xem tòa nhà; xem/sửa bảo trì và thiết bị |
| staff | Xem tòa nhà, hợp đồng, thiết bị; khách thuê và hóa đơn (xem/tạo/sửa); bảo trì (xem/tạo) |

Chỉnh ở bảng `permissions`.

## Kiến trúc
- `src/lib/resources.ts` – khai báo mọi thực thể (trường, cột, quyền). **Thêm thực thể mới = thêm 1 mục ở đây** + bảng SQL.
- `src/app/api/[resource]` – CRUD chung: kiểm tra đăng nhập + quyền, chỉ nhận các trường khai báo, ghi audit log.
- Trình duyệt không truy cập bảng trực tiếp (RLS bật, không có policy); toàn bộ dữ liệu đi qua API dùng service-role key ở server.

## Triển khai
```bash
docker compose up --build   # cần biến môi trường như .env.local
```

## Bảo mật
`SUPABASE_SERVICE_ROLE_KEY` chỉ dùng phía server, không bao giờ commit.
