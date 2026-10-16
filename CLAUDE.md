# Ghi nhớ dự án

## File chuẩn: `apps-script/Code.gs` + `apps-script/Index.html`

Đây là **bản chuẩn** (nguồn sự thật) của web app kỷ niệm **THPT Nguyễn Hiền · niên khoá 2000 – 2003**
chạy trên Google Apps Script. Mọi chỉnh sửa sau này phải dựa trên hai file này, giữ nguyên
cấu trúc, cách đặt tên và phong cách code (ES5-style `function`, helper có hậu tố `_`, chuỗi tiếng Việt).

> Phần Next.js/Supabase (`src/`, README "Phi Long Building Management System") là dự án cũ, không liên quan tới web app này.

### Kiến trúc
- **Backend** `Code.gs`: dữ liệu ở Google Sheet `NGUYENHIEN_DATA` (`DATA_SHEET_ID`), ảnh ở Drive
  (thư mục gốc `ROOT_FOLDER_ID`, ảnh lưu thư mục con `ANH`, id lưu trong Script Property `FOLDER_ID`).
- **Frontend** `Index.html`: một trang SPA, gọi server qua `api(fn, ...args)` (bọc `google.script.run`).
  Nhúng sẵn `const DEMO={...}` (dòng rất dài) để hiện ngay khi chưa có dữ liệu thật.
- Lần đầu: chạy `setup()` trong trình soạn thảo → tạo sheet + 12 lớp (12/1 → 12/12, `SO_LOP`) + tài khoản `banlienlac` (mật khẩu in ra Execution log).
- Quên mật khẩu `banlienlac`: chạy `datLaiMatKhauBanLienLac()` trong trình soạn thảo → mật khẩu mới dễ nhớ in ra Execution log (mở khoá luôn).

### Sheet (`SHEETS`)
`Lop`, `HocSinh`, `HoatDong`, `ThayCo`, `LuuBut`, `Anh`, `TaiKhoan`, `TinTuc`, `DangKy`, `NhatKy`, `CauHinh`, `LuotXem`.
Sheet thiếu (vd. `LuotXem` thêm ở bản sau) được `sh_` tự tạo (`taoSheet_`), không cần chạy lại `setup()`.
Cột đầu tiên là khoá chính. Mọi ô ghi dạng text (`@`), giá trị bắt đầu bằng `= + @` được thêm `'` (`safe_`).
Đọc/ghi theo **tên cột** ở hàng tiêu đề (`hdr_`), không theo vị trí: người dùng có thể chèn/đổi thứ tự/thêm cột riêng
trong Sheet; cột chuẩn còn thiếu được tự thêm ở cuối; `setup()` không ghi đè hàng tiêu đề. `clean_` bỏ dấu gõ lặp.
Trang công khai chỉ trả cột chuẩn (`pubOf_`), bỏ cột riêng tư `PRIVATE_COLS` (HocSinh.`sdt` – chỉ admin xem).

### Vai trò & phân quyền
- `super` (Ban liên lạc): toàn quyền. `class` (admin lớp): mỗi lớp đúng 1 admin, chỉ quản lý lớp mình (`canLop_`).
- Đăng nhập: SHA-256(salt|pw), phiên lưu CacheService 6 giờ (`SESSION_TTL`), khoá 10 phút sau 5 lần sai.
- Lỗi phiên có tiền tố `SESSION:` → frontend tự đăng xuất.
- Hoạt động do admin lớp đề xuất có `trangThai='pending'`, Ban liên lạc duyệt.
- Lưu bút công khai gửi vào `pending`; đăng ký họp lớp trạng thái `cho | xacnhan | huy`.
- Quản trị → **Đăng ký họp lớp**: super thấy ô 12 lớp (số xác nhận + số mới, `dkL` lọc lớp, "Tất cả" chia nhóm theo lớp); admin lớp chỉ thấy lớp mình (server lọc `mine` trong `getAdminData`). Lọc trạng thái `dkF` (cho/xacnhan/huy/all), "Sao chép danh sách" (`chepDk`, tab để dán Excel/Zalo).

### Hàm public gọi từ frontend
`login, logout, changePassword, getPublicData, submitNote, getAdminData, saveClass, deleteClass,
setClassAdmin, removeClassAdmin, saveStudent, deleteStudent, importStudents, saveEvent, setEventStatus,
deleteEvent, saveTeacher, deleteTeacher, moderateNote, deleteNote, uploadPhoto, updatePhoto, deletePhoto,
saveConfig, saveNews, deleteNews, submitRegistration, setRegistrationStatus, deleteRegistration,
updateMyContact, seedDemo, clearDemo, autoCreateClassAdmins, moveStudents, ghiLuotXem, getThongKe, dongBoAnhDrive, getLuuBut, getDuLieuMoi`. Chạy tay trong trình soạn thảo: `setup`, `datLaiMatKhauBanLienLac`, `lamMoiDuLieu`, `napDuLieuMau`, `xoaDuLieuMau`, `dongBoAnh`, `batDongBoAnhTuDong`, `xepLaiAnh`, `moQuyenAnh`, `batGiuAm`.
`getAdminData.hsLac` (super): học sinh có `lopId` không khớp lớp nào → nhóm "⚠ Chưa thuộc lớp nào" trong Quản trị → Học sinh, tick + Chuyển lớp.
Tài khoản dễ nhớ: tên đăng nhập admin lớp `lop12_1` (`lopUser_`), mật khẩu dạng `luubut-4827` (`easyPw_`, cũng dùng cho `banlienlac` ở setup).
Khi thêm/sửa hàm server, kiểm tra lại các lời gọi `api('...')` trong `Index.html` cho khớp.

Cấu hình `doanMoDau` (Cài đặt → "Đoạn giới thiệu dưới câu mở đầu", hoặc dòng key `doanMoDau` ở Sheet CauHinh): đoạn văn ở hero trang chủ, có chỗ thay `{namRaTruong} {tenTruong} {diaChi} {soNam} {soLop}` (`doanMoDau()` trong Index.html); để trống → mặc định.
Cấu hình `banLienLac` (Cài đặt): mỗi dòng "Họ tên | Điện thoại/Zalo | Vai trò" → cột Ban liên lạc ở chân trang + đầu danh bạ trang Kết nối.
Ô đăng nhập Quản trị (`renderLogin`) có thêm khối "Quên mật khẩu, cần cấp tài khoản? Liên hệ quản trị" – CHỈ một số cố định: Mr. Anh 0935 452 565 (viết thẳng trong `renderLogin`, không lấy từ `bll()`) và dòng bản quyền `.bq` (© năm hiện tại · Ban liên lạc khoá · tên trường).
Mặc định trong `CONFIG_DEFAULT.banLienLac` (Lê Trung Hiếu, Hoàng Diệu Thúy, Nguyễn Thị Tuyết Mai) – dòng trong Sheet CauHinh (nếu có) sẽ ghi đè.

Thư ngỏ (họp mặt 30 năm, 17h30 14/11/2026): hằng `THU` trong Index.html; tự mở sau màn chờ (trừ khi người xem tick "Không tự mở" – localStorage `nh_an_`+`THU.ma`), mở lại bằng phong thư ở trang chủ (`moThu()`). Đổi thư mới → đổi `THU.ma` để mọi người lại thấy. Nút "💌 Giấy mời" (`moGiayMoi(loai)`) lật thư thành giấy mời theo mẫu thiết kế A5 (canvas "Giấy mời Gala Nguyễn Hiền 2000–2003": "Về đi bạn ơi!" / "Thư mời" Thầy Cô), chuyển bằng nút "Mời các bạn" / "Mời Thầy/Cô" (`gmLoai`); thông tin ở hằng `GM` (giờ 17h00, nhà hàng, địa chỉ, đóng góp 700.000đ, hạn 25/10/2026); ghi tên + lớp người nhận (localStorage `nh_ten_moi`, `nh_lop_moi`, `nh_ten_thay`), "Sao chép lời mời" (`chepLoiMoi`), "Đăng ký tham dự" (`diDangKy`). Giấy mời Thầy/Cô ghi "Kính mời:" (người dùng tự ghi "Thầy …"/"Cô …" trong ô tên). Nút **"🖨️ In / Lưu thư mời"** (`xemInGm`): chép `.thu .gm` thành `.gmIn` (rộng 559px = A5, luôn kiểu máy tính vì các luật mobile của giấy mời có tiền tố `.thu`; `.gmIn .gm h2/p` dùng chung luật với `.thu .gm`) → xem trước `#snXem` → "In / Lưu PDF (A5)" dùng chung `inSn()`/`#snIn` (`--z` thu vừa trang) hoặc "Lưu ảnh JPG" (`luuAnhGm`, tải html2canvas 1.4.1 từ cdnjs khi cần, scale 2.6 ≈ 1450px, link tải + nhấn giữ ảnh để lưu trong Zalo). Khung `.snXem` z-index 190 (trên popup thư 175, dưới toast 200). Font Dancing Script. Class chữ ký là `kyb` (KHÔNG dùng `.ky` – trùng thư ngỏ).
**Ba popup sửa được ở Quản trị → tab "Thư ngỏ & Gala"** (super): lưu vào CauHinh `thuNgo` (JSON: ey,t1,t2,mo,doan [đoạn cách dòng trống, `@HEN` = ô hẹn, `*` = câu nổi bật],hen,gio,ngay,ky,kyTen,ma), `giayMoi` (JSON: gio,ngay,nhaHang,diaChi,dongGop,gom,han,web,tieuBan,loiBan,loiThay), `keHoach` (văn bản ký hiệu: `#` mục [số La Mã tự động], `## Phần | tên`, `-`, `+ Việc: mô tả`, `= Nhãn: nội dung`, `| ô | ô` bảng [dòng "Tổng" → thanh chia kinh phí], `!` ghi chú, `>` trích ` / ` xuống dòng, `**đậm**`, `{gio} {ngay} {nhaHang} {diaChi} {dongGop} {han}` lấy từ giayMoi). Ô trống/rỗng → mặc định trong Index.html (`THU0`, `GM0`, `KH_MAC_DINH`); `apDungPopup()` gộp cfg mỗi lần mở popup; `saveConfig` cho 3 khoá này tối đa 30000 ký tự. Admin: `luuPopup(k)`, `xemPopup(w)` (xem thử chưa lưu), `macDinhPopup(k)`; tick "Hiện lại thư" → đổi `ma`.
Thủ quỹ / chuyển khoản **chỉ hiện trong Kế hoạch** (KHÔNG đưa vào giấy mời, Kết nối, Ban liên lạc): dòng `@CK` trong `keHoach` → `ckHtml()` (mã QR Techcombank nhúng sẵn `<img id="qrTQ" hidden>` ngoài script, đã kiểm tra quét ra BIN 970407 · TK 9905516896; số TK + nút sao chép; nội dung CK tự điền theo cú pháp "Tên + lớp : tham gia gala 14/11" bỏ dấu, `ndCK`). Thông tin ở `GM.thuQuy/nganHang/soTK/chuTK/cuPhap/qr` (sửa ở Quản trị → Thư ngỏ & Gala → Giấy mời; `qr` = ảnh Drive thay ảnh nhúng).
Thư ngỏ có 4 nút: Để sau · 📋 Kế hoạch (`moKeHoach`, `.thu.kh-on .kh`, `khHtml`) · 💌 Giấy mời · Đăng ký tham dự (mobile: lưới 3 cột `.bt.bon`, Đăng ký cả hàng).

### Dữ liệu mẫu
Mọi dòng mẫu có id bắt đầu `mau_`. Nội dung mẫu viết trong `napDuLieuMau_()` (Code.gs); dòng `const DEMO=` trong Index.html
là bản chụp của nó, **tạo lại** bằng `node tools/build-demo.js` (chạy Code.gs trên Sheet giả lập) rồi build tai-ve. `autoSeed_()` tự nạp khi Sheet trống (một lần, cờ `DEMO_AUTO`).
`seedDemo/clearDemo` (Quản trị → Cài đặt) hoặc `napDuLieuMau/xoaDuLieuMau` (trình soạn thảo).

### Giao diện (Index.html)
8 trang, mỗi trang một chủ đề màu riêng qua `body[data-p=...]`:
Trang chủ (phượng vĩ) · Các lớp (vở ô ly) · Ngoại khoá (sông Hàn) · Kỷ yếu (album kraft) ·
Hình ảnh (bảng đen) · Kết nối (báo tường) · 🎂 Sinh nhật (hồng/tím, `p-sn`, `v-birthday`) · Quản trị.
Trang chủ: khung thư dùng class `goc-thu` (KHÔNG dùng `.thu` – tên đó là popup Thư ngỏ, dùng chung sẽ thành ô cuộn tràn ngang). Dưới thư là `dong-lb`: dải **vuốt ngang** (`#luoiLb`, scroll-snap, nút ‹ › `truotLb` trên máy tính) 12 lưu bút mới nhất, mỗi bài khung giấy cao tối đa ~7 dòng, bài dài cuộn dọc trong khung (`danhDauLbDai` thêm class `dai` + gợi ý "Kéo trong khung").
Kỷ yếu mở mặc định tab **Lưu bút** (`ybT=1`, cả khi bấm menu), thứ tự tab hiển thị Lưu bút · Thầy cô · Ngày ấy, bây giờ · Viết lưu bút (chỉ số `ybT` giữ nguyên: 0 thầy cô, 1 lưu bút, 2 ngày ấy, 3 viết).
Kỷ yếu → tab Lưu bút: `.notes` xếp kiểu gạch bằng CSS `columns:300px` (KHÔNG dùng grid – grid kéo ô ngắn cao bằng ô dài), mỗi `.ticket` cao theo nội dung, dấu “ lớn trang trí, đoạn cách dòng trống → `<p>`; bài dài > ~11 dòng thu gọn (`.nd` max-height, mờ dần) + nút "Đọc tiếp ▾ / Thu gọn ▴" (`gonLb()` đánh dấu `dai` sau khi vẽ, `moLb`); tên người viết in đậm, căn phải dưới vạch nét đứt.
Tìm kiếm (Kết nối → Tìm bạn cũ `findF`, ô tìm trang Các lớp `drawLabels`, `timCho`): dùng `khopTim(q, chuHs(s,c))` – không dấu (`chuanTim`), mọi từ đều phải có, tìm trên **mọi cột** của học sinh (trừ id/lopId/thuTu) + tên lớp; gõ có dấu thì ưu tiên kết quả đúng dấu.
Trang lớp → tab Danh sách lớp mặc định hiện **sơ đồ lớp học** (`soDoLop`, biến `cV='so'|'ds'`): bảng đen, bục giảng + bàn giáo viên (GVCN), các dãy bàn đôi theo thứ tự danh sách (tên to, họ đệm nhỏ, chức vụ, nơi ở; SĐT chỉ khi admin), ô "Tìm chỗ ngồi" (`timCho`); nút 📋 Danh sách trở về bảng cũ.
Cỡ chữ đã chốt (KHÔNG thu nhỏ lại – người dùng phàn nàn khi bản chuẩn 16/10 làm nhỏ): h1 trang chủ clamp(38px,4.7vw,72px), đoạn mở đầu 18px, h2 Hình ảnh clamp(40px,5vw,64px), nút lọc lớp/album Hình ảnh 18px/16px, h1 Kết nối clamp(50px,7.6vw,110px), tên lớp `.nhan .lop` 34px, `.diemdanh` 24px. Kiểm tra bằng cách so cỡ chữ tính ra (Playwright) với bản trước. Trang Sinh nhật rộng 80% màn hình trên máy tính (`.p-sn .w` width:80vw từ 900px). Cỡ chữ tối thiểu: khối "Chữ dễ đọc" cuối `<style>` (tiền tố `body`) nâng chữ phụ lên ≥14px (sơ đồ lớp ≥11–12px trên điện thoại); thêm chữ phụ mới thì đừng dưới 13px.
Chống tràn ngang mobile: `html{overflow-x:hidden}` + `body/main/section.view/footer{overflow-x:clip}` (không dùng `overflow-x:hidden` cho body vì làm hỏng header sticky); chữ to `nowrap` phải co theo `vw` ở ≤760px. Kiểm tra `scrollWidth` ở 320/360/390/430px.
Ảnh Drive chỉ hiện khi tệp để "Bất kỳ ai có đường liên kết": `taoPublicData_` gọi `moAnh_` tự mở quyền cho ảnh dán tay (ThayCo.anhId, HoatDong.anhId, Anh.fileId; nhớ trong Property `ANH_DA_MO`); `idAnh_`/`idAnh` nhận cả link Drive; `img()` lỗi thì ẩn, thầy cô hiện chữ cái đầu.
Ảnh từ thư mục Drive (`dongBoAnh_`): trong thư mục ANH (`folder_()`) **mỗi lớp 1 thư mục tên là lớp** (`12-4`, `thuMucAnh_`, chấp nhận cả "Lớp 12-4"), thư mục `Chung` (ảnh không thuộc lớp), `GVCN` (tên tệp có số lớp `12-4.jpg` hoặc tên thầy cô → ThayCo.anhId). Ảnh mới trong thư mục → dòng Anh `nguoiDang='Thư mục Drive'` (album "Ảnh lớp"/"Ảnh chung", tên có "ngày ấy"/"bây giờ" → album đó); chuyển tệp sang thư mục lớp khác → đổi lopId; xoá tệp → gỡ dòng. Lần đồng bộ đầu (`DA_XEP_ANH`) `xepAnhVaoThuMuc_` CHUYỂN ảnh cũ vào đúng thư mục (giữ mã ảnh). `uploadPhoto` lưu thẳng vào thư mục lớp, `saveTeacher` vào GVCN. Nút Quản trị → Hình ảnh → "Đồng bộ ảnh từ Drive" (`dongBoAnhDrive`), `batDongBoAnhTuDong()` bật trigger 30 phút, `xepLaiAnh()` xếp lại thủ công.
Trình chiếu ảnh (class `tchieu` – KHÔNG dùng `.tc`, trùng thẻ thầy cô `.p-yb .tc`; id `#tc`, `tcMo(list,i)`, trạng thái `TC`): ảnh luôn hiện trọn (max 96vw×96dvh, phóng từ .93 → 1, không cắt); **chữ nổi** `#tcNoi` (`tcChuNoi`, nút Aa `tcDoiChu`, localStorage `nh_tc_chu`): nhãn lớp·album + chú thích chữ Dancing Script hiện từng chữ, 5 vị trí `vt0–vt4` đổi lần lượt, ảnh không chú thích dùng câu `TC_CAU`, cứ 4 ảnh xen 1 trích lưu bút (≤220 ký tự, chữ Charm); nút "▶ Trình chiếu" ở trang Hình ảnh (theo lớp/album đang lọc, `GAL`) và trong ô xem ảnh lớn (`.lb .tcl`); chỉ ảnh có `fileId`; 2 lớp ảnh `tcA/tcB` mờ dần + phóng chậm (`tcKb`), nền mờ cùng ảnh, tự chuyển 3/5/8 giây (`tcDoiToc`), ngẫu nhiên (`tcDoiTron`), toàn màn hình (`tcToanMH`, lỗi trong Zalo thì bỏ qua), giữ màn hình sáng (wakeLock); chạm trái/phải/giữa = lùi/tới/dừng, vuốt, phím ← → Space Esc; nút tự ẩn sau 3 giây; ẩn trang thì tạm dừng. Khi chiếu thêm class `tc-mo` vào `<html>` (khoá cuộn html + body, ẩn thanh cuộn), `tcDong` gỡ ra – KHÔNG chỉ khoá `body` (thanh cuộn của html vẫn hiện bên phải khi toàn màn hình).
Trình chiếu **Kỷ yếu** (`tcMoKy`, nút ở tab Thầy cô/Lưu bút; dùng chung khung `#tc` với class `ky`, `TC.ky=true`): `tcXenKy(tron)` xếp lưu bút xen kẽ đều thầy cô (thầy cô dư nối cuối, nút 🔀 trộn từng danh sách rồi xen lại); `tcVeKy` vẽ vào `.the` của lớp `tcA/tcB`: thiệp lưu bút `.giay` (giấy kẻ dòng, băng dính, chữ Charm hiện từng chữ, cỡ chữ theo độ dài `ngan/vua/dai`, thời lượng `TC.tCur` = tốc độ + độ dài/38 giây, tối đa 16) và thiệp thầy cô `.thay` (khung polaroid ảnh trọn hoặc chữ cái đầu, tên Dancing Script vàng, vai trò, câu tri ân `TC_ON`); ẩn nút Aa.
**Menu Trình chiếu** (`tcMenu`, nút "▶ Trình chiếu" ở hero trang chủ; hộp `#tcMenu`): Chiếu hình thầy cô (`tcMoKy(tcChiThay)`) · lưu bút (`tcChiLb`, có QR + hỏi bài mới) · hình ảnh (`tcMo(D.anh,0)`) · tin tức (`tcChiTin`, thiệp báo `.tinb`) · **tất cả trừ tin tức** (`tcMoTatCa` → `tcMo(D.anh,0,true)`: `tcXenAnh` cứ 3 ảnh xen 1 thiệp toàn màn hình lưu bút/thầy cô luân phiên; chưa có ảnh → `tcMoKy()`). `tcMoKy(lam,tieu)` nhận hàm dựng danh sách (`TC.lam`), `TC.coLb` bật QR/hỏi bài mới (class `colb`). Thiệp/ảnh theo từng lớp `.lop.la-the` (ẩn img, hiện `.the`); ở chế độ ảnh nền thiệp = ảnh trước làm mờ (`TC.nenCu`). Chữ nổi không còn trích lưu bút; nhãn `.noi .ke` to clamp(15px,2.3vw,26px).
**Dữ liệu mới nhất khi trình chiếu (hội nghị):** mọi nút mở trình chiếu bọc `tcMoi(f)` → gọi `getDuLieuMoi` (server `pubBust_` + `pubJson_` = đọc thẳng Sheet, nhiều máy trong 20 giây dùng chung, cờ `PUB_MOI_T`), chờ tối đa 10 giây rồi chiếu; trong lúc chiếu `tcCapNhat` mỗi 3 phút (`TC.capNhat`) đọc lại, khác thì `setD` + dựng lại danh sách (`TC.lam` / `TC.layAnh` nhớ nguồn ảnh: cả khoá hoặc lọc lớp/album của trang Hình ảnh) và giữ thiệp đang chiếu theo khoá `tcKhoa_`; đóng trình chiếu thì vẽ lại trang (`TC.duLieuMoi`).
**Nhà tài trợ (popup):** CauHinh `taiTro` (≤30000 ký tự). Sửa ở **Quản trị → tab "Nhà tài trợ"** (super): bảng điền `TTE` (nạp 1 lần khi mở tab, `ttForm_`, mỗi dòng chọn hạng + tên + lời + logo + liên hệ, `ttThem`/`ttXoa`/`ttDoi`, khối "Cách cập nhật"), `ttVan_()` ghép lại văn bản, `luuTT`/`xemTT`/Điền mẫu, mỗi dòng `Hạng | Tên | Lời cảm ơn/đóng góp | Logo (link Drive) | Điện thoại/website`, dòng `#` bỏ qua; hạng `TT_HANG` Kim cương · Vàng · Bạc · Đồng · Đồng hành (chỉ hiện tên dạng chip). `ttDs()` (bản xem thử không có dữ liệu → `TT_MAU`); nút "🤝 Nhà tài trợ" ở trang chủ + chân trang **luôn hiện**, chưa có ai thì popup ghi "đang cập nhật" + mời đồng hành. Popup `#ttNen` (`moTT`/`dongTT`, thẻ căn giữa theo hạng, logo Drive hoặc chữ viết tắt `ttViet_`, cuối popup liên hệ người đầu tiên của `bll()`); mở từ nút "🤝 Nhà tài trợ" ở hero trang chủ và link ở chân trang; menu Trình chiếu có "Chiếu nhà tài trợ" (`tcChiTT`, thiệp `.taib`).
**Lưu bút tại Gala (quét QR):** mã QR nhúng sẵn `<img id="qrViet" hidden>` (ngoài script, trỏ `https://nguyenhien.philong.cloud/?viet=1`, đã kiểm tra quét được; đổi tên miền thì tạo lại ảnh) hiện ở góc trình chiếu kỷ yếu (`.tcQr`, class `qr`, nút QR `tcDoiQr`, bấm để phóng to). Trang khung chuyển tiếp `location.search` vào iframe → `doGet(e)` nhúng `window.THAM` (chỉ khoá `viet`,`trang`, giá trị `[\w-]{1,20}`) → frontend `VIET` mở thẳng Kỷ yếu → Viết lưu bút (`moViet`, bỏ thư ngỏ, màn chờ 3 giây, dòng `.viet-gala`). Cài đặt **Tự duyệt lưu bút** (`tuDuyetLb='1'`) → `submitNote` lưu `approved` (trả về trạng thái). Khi chiếu kỷ yếu trên Apps Script, `tcHoiLb` gọi `getLuuBut` (đệm `LB_MOI` 20 giây, `pubBust_('LuuBut')` xoá) mỗi 45 giây, bài mới chen ngay sau thiệp đang chiếu, nhãn "✨ Vừa gửi", thông báo `.moiVe`.
Ảnh hiển thị qua `https://drive.google.com/thumbnail?id=...&sz=w...`; ảnh tải lên được nén ≤1600px JPEG ở client (`readImg`).

### Tốc độ (mở trong Zalo)
- `doGet` nhúng sẵn dữ liệu công khai vào trang (`<script id="boot"></script>` → `window.BOOT=…`, thoát `/` và `<`); frontend thấy `BOOT_OK` thì bỏ lời gọi `getPublicData`; màn khởi động vẫn đọc đủ 4 câu `CAU` (1,5 giây/câu, ~6 giây, chạm để bỏ qua) rồi mở thư ngỏ.
- `pubJson_()` lưu đệm JSON công khai ở CacheService 7 phút (`PUB_TTL`=420, chia khúc `PUB_CHUNK`); mọi lần ghi qua `append_/update_/remove_…` gọi `pubBust_`. Sửa tay Sheet → chạy `lamMoiDuLieu()` hoặc chờ. **Giữ ấm**: chạy `batGiuAm()` một lần → trigger `giuAm` 5 phút/lần dựng sẵn bộ đệm (doGet không phải đọc Sheet, bớt màn trắng; sửa tay Sheet tự hiện sau ≤5 phút).
- **Tải mới khi bấm menu** (`taiMoi`, gọi cuối `go()` trừ Quản trị, và khi quay lại ứng dụng `visibilitychange`): chỉ khi `LIVE`, cách nhau ≥15 giây (`TM_T`), gọi `getPublicData` ở nền, so chuỗi JSON với lần trước (`TM_J`, khởi đầu từ BOOT) → chỉ khi khác mới `setD` + vẽ lại trang đang xem (`veLaiTrang_`, giữ vị trí cuộn, toast "Đã cập nhật nội dung mới"); trang đang gõ dở (`dangGo_`: ô nhập đang chọn hoặc có chữ) thì hoãn (`TM_CHO`) tới lần bấm sau.
- `tai-ve/Index.html` (bản dán Apps Script) bỏ dữ liệu mẫu trong `const DEMO` (chỉ giữ `cfg`), nhẹ hơn ~75KB.

### Thống kê lượt xem
- Frontend (`tk()`, `tkGui()`, chỉ khi `LIVE`): mã khách ngẫu nhiên `nh_khach` ở localStorage, thiết bị (iPhone/iPad · Android · Máy tính) và nguồn (Zalo · Facebook · Trình duyệt) đoán từ userAgent; gộp sự kiện `vao` (mở trang, `giaTri='1'` nếu khách mới) / `trang` (go) / `lop` (openCls), gửi 7 giây sau khi mở rồi 20 giây/lần, và khi ẩn trang.
- `ghiLuotXem` kiểm tra dữ liệu, giới hạn 3000 lần/phút, `tryLock` rồi `appendMany_('LuotXem')`; không lưu tên/SĐT/IP. `pubBust_` bỏ qua `LuotXem` và `NhatKy`.
- `getThongKe` (super): tổng hợp 30 ngày, giờ, thiết bị, nguồn, trang, lớp, người quay lại, đăng ký. Quản trị → tab **Thống kê** (`tkVe`, cột `tkCot`, thanh ngang `tkNgang`, tooltip `tkTip`).

### Logo & trang nhúng
- Logo trường: `assets/logo-nguyen-hien.png` (bản gốc, nền ngoài hình thoi trong suốt). Index.html nhúng bản 128px dạng
  data URI ở `#hLogo` (header) + favicon; footer và trang chủ dùng lại `$('hLogo').src`. **Không** đặt data URI trong `<script>`
  (base64 có thể chứa `//`).
- `tai-ve/NguyenHien-iframe.html`: trang khung toàn màn hình nhúng web app (link `/exec`), có favicon logo, màn chờ.
  Đặt lên hosting/Google Sites để có link gọn, không hiện dải "Ứng dụng này do một người dùng Google Apps Script tạo".
- `cloudflare/worker.js` + `cloudflare/index.html` tạo từ trang khung bằng `node tools/build-cloudflare.js` (Worker
  `nguyenhien.leanhdnvn84.workers.dev` trả trang khung cho mọi đường dẫn). Trang khung có màn chờ `.cho` nằm **DƯỚI** iframe (z-index 0, iframe z-index 1 nền trong suốt): hiện logo trong lúc Apps Script chạy doGet, web app vẽ xong tự che – KHÔNG đặt màn chờ đè lên iframe (từng bị kẹt vì sự kiện `load` không tới trong Zalo iOS); đã bỏ link "Trang mở chậm?". Script nhỏ gán `src` iframe = `/exec` + `location.search`. Chữ "THPT Nguyễn Hiền" ở màn chờ dùng phông `PFNH` = Playfair Display 600 nhúng base64 (cắt chỉ còn các chữ cần, ~4KB, từ @fontsource, 2 khối unicode-range latin + vietnamese) – KHÔNG dùng Georgia (iPhone thiếu dấu tiếng Việt, chữ vỡ).

### Lưu ý Apps Script (quan trọng)
Khi phục vụ trang, Apps Script cắt `//…` tới hết dòng và `/* … */` trong `<script>` **kể cả khi nằm trong chuỗi/template/regex**
→ trang trắng, lỗi kiểu `Unexpected identifier 'src'`. Trong script chỉ dùng `/* */` cho dòng chú thích thật; viết
`https:\/\/…` trong chuỗi, regex dùng `[/]` thay cho `\/`, `accept="image/\*"`. `tools/build-tai-ve.js` tự kiểm tra và báo lỗi.

### Bản tải về (`tai-ve/`)
- `tai-ve/NguyenHien-2000-2003.html` là bản **tạo ra** từ `apps-script/Index.html`, không sửa tay.
  Sau mỗi lần sửa Index.html, chạy lại: `PLAYWRIGHT=/opt/node-tools/node_modules/playwright node tools/build-tai-ve.js`.
  Script vẽ sẵn nội dung các trang vào HTML, vì trình xem tệp trên điện thoại (iPhone…) không chạy JavaScript.
- Script cũng ghi `tai-ve/Index.html` = bản gốc (đã kiểm tra `//`) để **dán vào Apps Script**, KHÔNG vẽ sẵn nội dung mẫu.
  Nếu JS lỗi, dòng đỏ ở cuối trang báo lỗi + số dòng (bắt lỗi ở `<script>` đầu `<head>`).
- Trên Apps Script (`LIVE`) trang không bao giờ dùng `DEMO`: luôn hiện màn khởi động (logo + 4 câu) tới khi có dữ liệu Sheet.
  `DEMO` chỉ dùng cho bản xem thử/tải về. `xoaDuLieuMau_` giữ thầy cô mẫu đã bị sửa tên, dọn giới thiệu/GVCN mẫu của lớp.
- `tai-ve/Code.gs` + `tai-ve/NguyenHien-AppsScript.zip` (Code.gs + Index.html bản dựng): đóng gói lại sau mỗi lần build.

### Bản chuẩn 16/10/2026 (nhận từ người dùng)
- HocSinh thêm cột `ngaySinh` (dd/mm/yyyy, nhận cả tên cột `namsinh`/"Ngày sinh"/"Ngày tháng năm sinh") và `nu` (checkbox TRUE/FALSE); `importStudents` thêm 2 cột tuỳ chọn Ngày sinh, Nữ; frontend `hsLaNu_`, `hsNgay_`, `dsHocSinh_`.
- Trình chiếu đọc dữ liệu qua `getSlideData(force)` (`taoTrinhChieuData_`, đệm `TC_DATA` 12 giây) + `getSlideRevision()` (`TC_REV`, đổi trong `pubBust_`); frontend `tcHopData_`, `tcLayMoi_`, `tcApDungSlide_`, `tcChuKy_`. `PUB_KEY='PUB_STUDENT_V3_'`.
- `login` trả kèm `adminData`; `setClassAdmin(..., lienHe)`, lớp có `adminLienHe`.
- Cấu hình liên hệ cuối popup nhà tài trợ: `anhien` (1 hiện/0 ẩn), `ttLoiMoi`, `ttNguoiLienHe`, `ttSoLienHe`.
- Hoa phượng trang chủ: ảnh nền webp nhúng trong CSS `.canh-moi` (bỏ `phuongSvg`).
- Bản nhận về là bản dán Apps Script (`DEMO` chỉ có `cfg`); cần chạy lại `node tools/build-demo.js` + `build-tai-ve.js` để có dữ liệu mẫu và bản `tai-ve/`.
- **Sinh nhật** (đọc `HocSinh.ngaySinh`, `snNgay_` nhận dd/mm/yyyy, dd/mm, yyyy-mm-dd; 29/2 năm không nhuận tính 28/2): `snDs(lopId)` → {s,c,n,ngay,con (ngày tới sinh nhật, 0 = hôm nay),tuoi}; `snKhoi(ds,coLop,lai)` vẽ 3 khối Hôm nay · Sắp tới (30 ngày) · Theo tháng (12 nút `.sn-thang`, biến chung `snThang`, mặc định tháng hiện tại). Trang lớp: tab thứ 4 `cT=3` "🎂 Sinh nhật" (có 🎉 khi hôm nay có người). Trang `birthday` (`renderSn`/`veSn`, chọn lớp `snLop`, tìm tên `snQ` bằng `khopTim`). Bấm tên → thiệp `#snNen`/`#snThiep` (`moSn(id)`, `dongSn`, lời chúc `SN_LOI` đổi bằng "Lời chúc khác", sao chép, viết lưu bút lớp). Trang chủ: nút `.sn-hom` (`snHom()`, 2 dòng: "Hôm nay sinh nhật · bấm gửi lời chúc" + tối đa 2 tên "và N bạn") nằm **cùng hàng** với phong thư trong `.hang-thu` (flex-wrap) khi hôm nay có sinh nhật. Hero trang chủ máy tính chỉ đặt `min-height` (KHÔNG cố định `height` – nội dung dài bị cắt và đè lên dòng "Kéo xuống…"). Class `thiep` (KHÔNG trùng `.thu`/`.the`). **In thiệp**: nút "🖨️ In thiệp sinh nhật" trong thiệp → `xemInSn()` mở xem trước `#snXem` (thu nhỏ theo màn hình) → `inSn()` thêm class `in-sn` vào `<html>` + `window.print()` (`@media print`: `@page` A5 dọc, chỉ hiện `#snIn`, gỡ class khi `afterprint`). Thiệp in `snTrangIn_(x)` (khung `.snThe .tr` 148×209mm, viền vàng + nét đứt, hoa phượng/lá SVG `snHoa_`/`snLa_` ở 2 góc, bóng bay `snBong_`, logo, "Happy Birthday", tên Dancing Script, băng lớp + ngày, khung lời chúc kẻ dòng chữ Charm (lấy lời đang chọn ở `#snLoi`), huy hiệu "Tròn N tuổi", ký "Các bạn lớp …"). SVG trong script KHÔNG ghi `xmlns` (có `//`).
- **Menu dưới điện thoại**: chỉ 5 nút `NAV_BOT` (Trang chủ · Các lớp · Sinh nhật · Kỷ yếu · Hình ảnh) + nút "Thêm" (`#nbThem`, `moThem`/`dongThem`) mở bảng `#navThem` gồm `NAV_THEM` (Ngoại khoá · Kết nối · Quản trị); nút Thêm sáng khi đang ở các trang đó. Menu trên máy tính đủ 8 nút (co padding ≤1180px/≤900px).
