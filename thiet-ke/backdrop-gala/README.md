# Backdrop (phông sân khấu) Gala – Nguyễn Hiền 2000 – 2003

File để **nhà hàng / tiệm in** in phông nền sân khấu, tỉ lệ **2 : 1** (ngang gấp đôi cao).

| File | Dùng khi |
|---|---|
| `backdrop-vector-2x1.pdf` | **Ưu tiên gửi file này.** Bản vector 300 × 150 cm – chữ, khung, hoa phượng là nét vẽ nên phóng 6 × 3 m, 8 × 4 m… vẫn sắc nét. |
| `backdrop-6x3m-12000x6000.jpg` | Tiệm chỉ nhận ảnh: 12000 × 6000 px (≈ 51 dpi ở khổ 6 × 3 m – đủ nét cho phông nhìn từ xa). |
| `backdrop-xem-truoc.png` | Ảnh nhỏ để xem trước / gửi Zalo duyệt mẫu. |

Lưu ý khi in:
- Khổ đề xuất **6 m × 3 m** hoặc **4 m × 2 m** (giữ tỉ lệ 2:1). Khung sân khấu khác tỉ lệ → báo để chỉnh lại file.
- Logo trường chỉ có bản gốc 400 px (đã phóng mịn lên 1600 px). Nếu trường có logo vector (AI/SVG/PDF) thì thay `logo-1600.png` rồi xuất lại cho nét hơn.
- Chất liệu thường dùng: bạt hiflex hoặc vải silk; in màu CMYK – đỏ có thể tối hơn trên màn hình một chút.

Sửa nội dung: mở `backdrop.html` (mọi kích thước theo `vw` nên tự giữ tỉ lệ), rồi chạy
`PLAYWRIGHT=/opt/node-tools/node_modules/playwright node render.js 1` (ảnh xem trước) và `… render.js 6` (PDF + ảnh lớn, sau đó đổi PNG sang JPG).
