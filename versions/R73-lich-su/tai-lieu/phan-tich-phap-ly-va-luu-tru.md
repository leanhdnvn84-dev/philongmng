# Phân tích pháp lý biểu mẫu và nơi lưu dữ liệu – PHI LONG HR (R73)

Ngày rà soát: 03/10/2026. Căn cứ: văn bản đang có hiệu lực theo hiểu biết đến thời điểm này. Trước khi dùng chính thức, nên cho bộ phận pháp chế/luật sư rà lại, nhất là các văn bản mới ban hành năm 2025.

## A. Dữ liệu đang lưu ở đâu (không lưu HTML)

| Nơi lưu | Nội dung | Ghi chú |
|---|---|---|
| Sheet `DM_BIEU_MAU` | Danh mục mẫu: ID, mã, tên, nhóm, phân hệ (`PHAN_HE`), mô tả, loại mẫu, phạm vi, căn cứ pháp lý | ~340 dòng chữ ngắn |
| Sheet `PHIEU_BIEU_MAU` | Mỗi phiếu 1 dòng: số VB, loại, phòng ban, đối tác, ngày hiệu lực/hết hạn, giá trị, bảo mật, trạng thái, người duyệt, link PDF | Cột quản lý để lọc, nhắc hạn |
| ↳ cột `DU_LIEU_MAU_JSON` | Chỉ giá trị các ô đã nhập `{version, templateId, fields}` | Thường 0,3–3 KB/phiếu; giới hạn 45.000 ký tự |
| ↳ cột `NOI_DUNG` | Tóm tắt dạng chữ (cắt tối đa 2.000 ký tự) | Để đọc nhanh trên Sheet |
| ↳ cột `LICH_SU` | Nhật ký từng bước (tối đa 60 mục) | JSON ngắn |
| Google Drive | File PDF đã duyệt (thư mục "PHI LONG HR - Văn bản biểu mẫu/<phân hệ>") | Sheet chỉ lưu link |
| Sheet `NHAT_KY_HE_THONG` | Ai làm gì, khi nào | **Đã sửa**: trước đây chép lại toàn bộ JSON + lịch sử phiếu mỗi lần lưu/duyệt (trùng 2–3 lần dữ liệu); nay chỉ ghi thông tin quản lý |

HTML trang in **không lưu ở đâu cả**: mỗi lần xem/in/xuất Word, app dựng lại từ mẫu trong code + JSON của phiếu. Khi "Ký → PDF Drive", HTML chỉ gửi lên máy chủ để chuyển thành PDF rồi bỏ đi.
Đã gọn thêm: JSON không còn chép lại căn cứ pháp lý của mẫu (lấy từ `DM_BIEU_MAU` khi in).

## B. Phân tích pháp lý theo nhóm và phần đã bổ sung vào app

| Nhóm | Căn cứ chính | Nội dung bắt buộc đã thêm ô nhập | Kiểm tra tự động khi lưu/in |
|---|---|---|---|
| Hợp đồng lao động, thử việc | BLLĐ 45/2019/QH14 Điều 21, 24–27; NĐ 145/2020; TT 10/2020; NĐ 293/2025 (lương tối thiểu vùng từ 01/01/2026) | (đã có đủ nội dung Điều 21) | Thử việc > 180 ngày: chặn. Lương < 3.700.000đ (vùng IV): cảnh báo |
| Hợp đồng kinh tế – dịch vụ (17 loại) | BLDS 91/2015/QH13 Điều 385–408, 463–471; Luật TM 36/2005 Điều 300–302; Luật SHTT (sửa 2022) | Bên A, Bên B (MST, đại diện), đối tượng – số lượng – chất lượng, giá & thanh toán, thực hiện, quyền nghĩa vụ, % phạt, lãi suất, giải quyết tranh chấp | Phạt > 8%: cảnh báo. Lãi suất vay > 20%/năm: chặn |
| Phụ lục, biên bản HĐ | BLDS Điều 403; BLLĐ Điều 22 | Số/ngày HĐ gốc, điều khoản sửa đổi, thành phần, kết luận | Bắt buộc nhập HĐ gốc, kết luận |
| Cam kết, NDA, MOU | BLDS; BLLĐ Điều 21.2; Luật BVDLCN 91/2025/QH15 | Hai bên, phạm vi thông tin, trách nhiệm vi phạm | Bắt buộc 2 bên, phạm vi |
| Quyết định | NĐ 30/2020 (thể thức); BLLĐ Điều 29, 122–125 | Hình thức kỷ luật (4 hình thức), ngày vi phạm, biên bản họp, nơi nhận | QĐ kỷ luật thiếu hình thức/ngày vi phạm: chặn; quá 6 tháng: cảnh báo thời hiệu; chưa có biên bản họp: cảnh báo |
| Thông báo, công văn, tờ trình, giấy giới thiệu, biên bản | NĐ 30/2020; Luật Doanh nghiệp | Trích yếu, nơi nhận, người được giới thiệu – CCCD, thành phần, chủ trì, thư ký | – |
| Đơn (nghỉ việc, không lương…) | BLLĐ Điều 35, 115 | Loại HĐ, ngày nộp, ngày nghỉ, đồng ý xử lý dữ liệu cá nhân | Báo trước < 45/30/3 ngày theo loại HĐ: cảnh báo |
| Phiếu nhân sự, tuyển dụng | BLLĐ Điều 8, 25–27, 48; Luật Việc làm 74/2025/QH15; Luật BVDLCN 2025 | Kết quả thử việc, thời gian & % lương thử việc, đồng ý dữ liệu cá nhân | Thử việc > 180 ngày, lương thử việc < 85%: chặn; không đồng ý dữ liệu: cảnh báo |
| Tăng ca, chấm công | BLLĐ Điều 98, 107 | Số giờ, tổng giờ tháng, sự đồng ý NLĐ | Chưa đồng ý: chặn; > 40 giờ/tháng: chặn; > 4 giờ/ngày: cảnh báo |
| Lương – chế độ | BLLĐ Điều 90–104; NĐ 293/2025 | Vùng lương tối thiểu | – |
| Khen thưởng – kỷ luật | BLLĐ Điều 104, 117–127; NĐ 145/2020 Điều 70 | Ngày vi phạm, thành phần tham dự (tổ chức đại diện NLĐ) | – |
| Phiếu thu – chi, phiếu kho, chứng từ | Luật Kế toán 88/2015 Điều 16, 19, 40; NĐ 174/2016; TT 99/2025/TT-BTC (từ 01/01/2026) hoặc TT 133/2016; NĐ 123/2020 sửa bởi NĐ 70/2025 (hóa đơn); Luật Thuế GTGT 48/2024/QH15 | Người nộp/nhận tiền, địa chỉ, hình thức thanh toán, kèm chứng từ gốc, kho, người giao/nhận; **số tiền bằng chữ tự động**; chữ ký 5 bên (phiếu thu/chi), 4 bên (phiếu kho) | Tiền mặt ≥ 5.000.000đ: cảnh báo không được khấu trừ thuế GTGT |
| Công nợ | BLDS Điều 429 (thời hiệu 3 năm) | Số dư tính đến ngày | Bắt buộc ngày chốt số dư |
| Mua hàng, PO, nghiệm thu, kiểm kê, thanh lý | BLDS; Luật Kế toán Điều 40; TT 45/2013 (TSCĐ) | Hình thức thanh toán, điều kiện giao hàng, MST NCC, HĐ/PO tham chiếu, thành phần, kết luận | Bắt buộc kết luận nghiệm thu |
| Báo giá, kinh doanh, marketing | Luật TM; Luật Thuế GTGT 2024; Luật Cạnh tranh 2018; Luật Quảng cáo | Thuế GTGT đã/chưa gồm, hình thức thanh toán | – |
| An toàn – PCCC | Luật ATVSLĐ 84/2015; NĐ 44/2016; Luật PCCC và CNCH 55/2024/QH15 (từ 01/07/2025) | Thành phần kiểm tra | – |
| Quy định – nội quy | BLLĐ Điều 93, 104, 118–121 | Số lao động áp dụng, ngày tham khảo ý kiến tổ chức đại diện NLĐ | – |
| Pháp lý doanh nghiệp | Luật Doanh nghiệp 59/2020 (sửa bởi Luật 76/2025/QH15); NĐ 168/2025 | Cơ quan cấp, số giấy | – |
| CNTT – tài khoản | Luật An ninh mạng 2018; Luật BVDLCN 2025 | – | – |

"Chặn" = không cho in/lưu đến khi sửa; "cảnh báo" = hiện hộp xác nhận, người dùng vẫn có thể tiếp tục.

## C. Thay đổi khác
- Văn bản dùng Quốc hiệu không in khung "Căn cứ và phạm vi sử dụng" (thông tin nội bộ), mẫu nội bộ vẫn in.
- Phiếu thu/chi, phiếu kho, chứng từ, báo cáo, kế hoạch, quy trình… bỏ dòng "Kính gửi / Kính đề nghị".
- Căn cứ pháp lý của từng mẫu được ghi vào `DM_BIEU_MAU` (cột `LOAI_MAU`, `PHAM_VI_SU_DUNG`, `CAN_CU_PHAP_LY`) khi mở trang Biểu mẫu lần đầu.

## D. Cần xác nhận
1. Công ty áp dụng TT 99/2025/TT-BTC hay TT 133/2016/TT-BTC (ảnh hưởng mẫu phiếu thu/chi, nhập/xuất kho).
2. Vùng lương tối thiểu của địa điểm làm việc (sau sáp nhập hành chính 2025) để đặt ngưỡng kiểm tra đúng vùng thay vì vùng IV.
3. Số lao động (≥ 10 người phải đăng ký nội quy lao động).
