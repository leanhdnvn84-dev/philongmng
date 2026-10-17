# Thiệp mời "Ngày trở về" – Gala Nguyễn Hiền 2000 – 2003 (nền màu nước)

Khổ **A5 dọc 148 × 210 mm**. Nền là tranh màu nước "Ngày trở về" (hoa phượng + dãy lớp xanh ngọc), thông tin in vào vùng giấy trống.

| File | Dùng khi |
|---|---|
| `thiep-moi-A5-2-trang.pdf` | **Gửi tiệm in.** Trang 1 mời các bạn, trang 2 mời Thầy/Cô. |
| `moi-ban-A5-300dpi.png`, `moi-thay-co-A5-300dpi.png` | Tiệm chỉ nhận ảnh. |
| `*-xem-truoc.png` | Gửi Zalo duyệt mẫu. |

- Tranh nền gốc 1054 × 1492 px (≈180 dpi ở A5, đã phóng mịn ×2) – in thiệp đẹp; nếu có bản gốc lớn hơn thì thay `nen-2x.jpg` rồi xuất lại cho nét hơn nữa.
- Tên, lớp, địa điểm để dòng chấm ghi tay; có tên nhà hàng → điền `NHA_HANG` trong `thiep-moi.html`.
- Giấy gợi ý: mỹ thuật vân giấy / couché mờ 250–300 gsm (hợp chất màu nước).
- Xuất lại: `PLAYWRIGHT=/opt/node-tools/node_modules/playwright node render.js 1` (xem trước), `… render.js 3.125` (300 dpi + PDF).
