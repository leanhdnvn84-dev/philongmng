# QL-HD-THUE v5 — tính lại và đối chiếu

Ứng dụng mới, chạy hoàn toàn trên trình duyệt (một file HTML, không cần máy chủ, không cần Google Apps Script).
Đọc dữ liệu cũ (`data/legacy.json`, xuất từ file xlsx QL-HD-THUE), tính lại kỳ thanh toán, chi tiết kỳ và đề nghị từ hợp đồng, phụ lục và giá thuê, rồi đối chiếu với dữ liệu cũ. Không ghi gì vào dữ liệu cũ.

## Cấu trúc
- `src/engine.js` — lõi tính toán (sinh kỳ, chi tiết, đề nghị). Thuần, không phụ thuộc trình duyệt.
- `src/reconcile.js` — đối chiếu cũ/mới và bộ kiểm tra dữ liệu (mã C01–C22).
- `src/app.js`, `src/index.template.html` — giao diện.
- `tools/export_legacy.py` — chuyển xlsx sang JSON (không sửa số liệu).
- `tools/build.js` — gộp thành `dist/ql-hd-thue-v5.html`.
- `tools/test.js` — 11 kiểm thử (bất biến của lõi và kết quả đối chiếu).
- `tools/smoke.js`, `tools/shots.js` — kiểm thử giao diện bằng Chromium.

## Chạy
```bash
python3 tools/export_legacy.py <file.xlsx> data/legacy.json   # khi có dữ liệu mới
node tools/build.js                                          # tạo dist/
node tools/test.js                                           # kiểm thử
```
Mở `dist/ql-hd-thue-v5.html` bằng trình duyệt.

## Quy tắc khác với bản cũ
- Hạn hiệu lực = max(Ngày kết thúc, Đến ngày phụ lục gia hạn chưa hủy). Không phụ thuộc ngày hôm nay.
- Ngày kết thúc là ngày cuối cùng được tính tiền (bao gồm).
- Kỳ được cắt trước ngày đổi giá (đúng quy tắc đã ghi trong Code.gs; bản cũ đôi khi không cắt).
- Chỉ giao dịch có Số chứng từ mới được tính là đã thu.
- Lịch giá trống hoặc khoảng hở giá được báo lỗi, không im lặng dừng như bản cũ.
- Mỗi kỳ có chi tiết một lần, không nhân đôi dòng.

## Chưa làm
- Chưa kết nối Google Sheet hay Apps Script. Dữ liệu là bản chụp từ file xlsx.
- Chưa có chức năng lưu/sửa dữ liệu trong app. Đây là bản đọc và đối chiếu.
- Chưa tái tạo giao dịch thanh toán. Việc này cần sao kê ngân hàng.
