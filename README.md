# PHILONG BUILDING 2.0

Phần mềm quản lý vận hành tòa nhà trên web, nâng cấp từ bản Google Apps Script **V191**.
Next.js 14 + Supabase (PostgreSQL), TypeScript, Tailwind.

## Vì sao nhanh hơn bản V191
| | V191 (Apps Script + Google Sheets) | 2.0 (Next.js + PostgreSQL) |
|---|---|---|
| Đọc dữ liệu | đọc cả sheet rồi lọc, có bộ nhớ đệm | truy vấn có chỉ mục, phân trang trên máy chủ |
| Cảnh báo (trễ lịch, quá hạn, tồn kho) | tính lại bằng JavaScript mỗi lần mở | view SQL tính trực tiếp trong database |
| Cấp mã ID | `SYS_ID_SEQUENCE` + LockService | hàm `next_id()` trong database, giữ đúng dạng mã cũ (CV0001…) |
| Ghi đồng thời | khóa script toàn cục | ràng buộc + khóa theo từng vật tư; nối tiến độ không mất dòng |
| Giới hạn | 6 phút/lần chạy, quota Google | không giới hạn kiểu Apps Script |

## Chức năng (giữ menu như V191)
- **Công việc**: công việc, công việc hằng ngày, khách ra/vào (cho ra một chạm), **báo cáo tiến độ** (đếm "Khảo sát ×3", thanh thời gian Giao → Hạn → Hôm nay, lọc diễn biến, ghi nhận nhanh theo đúng định dạng `- dd/mm [Giai đoạn]: nội dung`)
- **Bảo trì**: nhật ký bảo trì (tự gắn/tạo lịch theo khu vực + hạng mục), kế hoạch bảo trì (TRỄ LỊCH / ĐẾN HẠN / SẮP ĐẾN HẠN / CHỜ NGÀY GỐC tính tự động)
- **Đề xuất**: mua vật tư, mua thiết bị, bảo trì, thanh lý. Có dòng chi tiết, tổng tiền, duyệt/từ chối; đã duyệt thì khóa; duyệt đề xuất mua vật tư thì **tự nhập kho**
- **Thiết bị & kho**: kho vật tư (tồn hiện tại, cảnh báo dưới tồn tối thiểu, nhập/xuất không cho âm kho), sổ nhập xuất chỉ ghi thêm, thiết bị (chuyển, thu hồi), thu hồi/thanh lý, lịch sử chuyển
- **Cho thuê**: tòa nhà, tầng/khu, khách đang thuê (cảnh báo sắp hết hạn), khách tiềm năng, **tiền điện** (kWh và thành tiền tự tính, *Tạo kỳ mới* chép chỉ số cũ, *Chốt kỳ* khóa sửa)
- **Danh mục**: đội PCCC, nhân viên, nhà thầu, nhà cung cấp, chu kỳ bảo trì, khu vực, chi tiết vận hành
- **Hệ thống**: người dùng, vai trò, phân quyền (Xem / Thêm / Sửa / Xóa / Duyệt theo module, cùng mã module V191; Super Admin bỏ qua kiểm tra)
- Tổng quan: gom mọi cảnh báo, mỗi người chỉ thấy phần mình có quyền
- Tìm kiếm, lọc trạng thái, xuất CSV, giao diện điện thoại; mọi thay đổi và bản ghi bị xóa được lưu trong `audit_logs`

## Cài đặt
1. Tạo project trên [supabase.com](https://supabase.com) → **SQL Editor** → dán toàn bộ `src/db/schema.sql` → **Run** (chạy lại nhiều lần vẫn an toàn).
2. `cp .env.local.example .env.local` rồi điền URL, anon key và service role key (Project Settings → API).
3. Chạy:
   ```bash
   npm install
   npm run create-admin   # tạo tài khoản Super Admin từ ADMIN_EMAIL / ADMIN_PASSWORD
   npm run dev            # http://localhost:3000
   ```

## Chuyển dữ liệu từ Google Sheet V191
1. Mở Google Sheet → **Tệp → Tải xuống → Microsoft Excel (.xlsx)**.
2. Chạy thử, chưa ghi gì: `npm run import -- ~/Downloads/PHI_LONG.xlsx --dry-run`
3. Nhập thật: `npm run import -- ~/Downloads/PHI_LONG.xlsx`

Script giữ nguyên mã ID và hiểu được các định dạng sau:
- ngày `dd/mm/yyyy`
- số kiểu `1.234.567`
- ô giờ
- `x` / `TRUE` / `Có`

Cột không có trong bảng mới được giữ trong cột `extra`, không bị mất. Liên kết tới bản ghi đã xóa (ví dụ nhân viên đã nghỉ) cũng được ghi lại trong `extra`, nên việc nhập không bị dừng. Chạy lại nhiều lần thì chỉ cập nhật, không nhân đôi dữ liệu. Cuối cùng script in bảng báo cáo cho từng sheet.

> Mật khẩu cũ không chuyển được, vì cách mã hóa khác. Super Admin tạo lại tài khoản trong **Hệ thống → Người dùng** và gán vai trò. Vai trò và phân quyền cũ đã được nhập sẵn.

## Kiến trúc
- `src/lib/resources.ts`: khai báo mọi module (trường, cột, quyền, thao tác, menu). Thêm module mới = thêm 1 mục ở đây + bảng SQL.
- `src/app/api/[resource]`: API CRUD chung. Kiểm tra đăng nhập và quyền, chỉ nhận trường đã khai báo, ghi audit.
- `src/lib/actions.ts`: các thao tác nghiệp vụ (ghi nhận tiến độ, duyệt, nhập/xuất kho, chuyển/thu hồi thiết bị, tạo/chốt kỳ tiền điện).
- `src/db/schema.sql`: bảng, view cảnh báo, hàm nguyên tử (`kho_giao_dich`, `ghi_tien_do`), khóa quyền.
- Trình duyệt không truy cập database trực tiếp: RLS bật, `anon`/`authenticated` bị thu hồi quyền; mọi dữ liệu đi qua API dùng service role ở máy chủ.

## Chưa có so với V191 (làm tiếp được)
- Ảnh tiến độ công việc và ảnh chi tiết vận hành (dự kiến dùng Supabase Storage)
- Email cảnh báo bảo trì hằng ngày (dự kiến dùng Supabase cron + Edge Function)
- In/xuất đề xuất ra Google Docs/PDF theo mẫu
- Công cụ dữ liệu (`dataToolV90`), sao lưu theo năm

## Triển khai
```bash
docker compose up --build   # đặt các biến môi trường như .env.local
```
Hoặc deploy lên Vercel: thêm 3 biến môi trường Supabase.

## Bảo mật
`SUPABASE_SERVICE_ROLE_KEY` chỉ dùng ở máy chủ, không bao giờ commit hay đưa lên trình duyệt.
