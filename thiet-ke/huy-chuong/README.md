# Huy chương vui – "Đội năng nổ trong công tác Bia · Rượu · Đá · Mồi"

- `huy-chuong-in-300dpi.png`: file in, nền trong suốt, 3000×4200 px (≈ 25×35 cm ở 300 dpi; thu nhỏ tuỳ ý, phần huy chương tròn chiếm ~82% bề ngang).
- `huy-chuong-xem-truoc.png`: ảnh xem trước trên nền tối.
- `huy-chuong.html`: bản vẽ SVG, phông Be Vietnam Pro / Playfair Display / Dancing Script nhúng sẵn (không cần mạng).
- Sửa chữ trong `tao.py` rồi dựng lại:
  1. Lấy phông: `npm pack @fontsource/be-vietnam-pro@5 @fontsource/playfair-display@5 @fontsource/dancing-script@5` rồi giải nén vào một thư mục.
  2. `python3 tao.py <thư mục phông>`
  3. `PLAYWRIGHT=/opt/node-tools/node_modules/playwright node render.js $PWD`

Màu: vàng kim #E9C25A · xanh đậm #14315C · đỏ #B3261E · dây đeo đỏ–trắng–xanh.
