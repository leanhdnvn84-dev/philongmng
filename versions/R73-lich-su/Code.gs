/** PHI LONG HR — bản R73 (Lịch sử công việc gọn; dọn CSS trùng/chồng chéo; giữ toàn bộ thay đổi R72). */
const SPREADSHEET_ID = '11yGGO-mutg1y_0AE2Yyw_K6OglZdCWaiwsnYZoU-JKk';
const DATA_SHEETS = [
  'DM_NHAN_VIEN', 'DM_PHONG_BAN', 'DM_CHUC_VU',
  'DM_BO_PHAN', 'DM_NHOM',
  'DM_CHI_NHANH', 'DM_DIA_DIEM', 'DM_LOAI_HOP_DONG', 'DM_CHINH_SACH_PHEP',
  'DM_BIEU_MAU', 'PHIEU_BIEU_MAU',
  'LICH_SU_CONG_VIEC',
  'CC_CA_LAM_VIEC', 'CC_CHAM_CONG', 'CC_TANG_CA', 'CC_NGHI_PHEP', 'CC_BANG_CONG_THANG',
  'TUYEN_DUNG_NHU_CAU', 'TUYEN_DUNG_UNG_VIEN'
];
const APP_BOOTSTRAP_SHEETS = [
  'DM_NHAN_VIEN', 'DM_PHONG_BAN', 'DM_CHUC_VU', 'DM_BO_PHAN', 'DM_NHOM',
  'TUYEN_DUNG_NHU_CAU', 'TUYEN_DUNG_UNG_VIEN'
];

const WORK_HISTORY_HEADERS = [
  'ID_LICH_SU', 'MA_NHAN_VIEN', 'HO_VA_TEN', 'NGAY_HIEU_LUC', 'LOAI_BIEN_DONG',
  'MA_PHONG_BAN_CU', 'MA_BO_PHAN_CU', 'MA_NHOM_CU', 'MA_CHUC_VU_CU',
  'MA_PHONG_BAN_MOI', 'MA_BO_PHAN_MOI', 'MA_NHOM_MOI', 'MA_CHUC_VU_MOI',
  'TRANG_THAI_CU', 'TRANG_THAI_MOI', 'SO_QUYET_DINH', 'GHI_CHU',
  'NGUOI_TAO', 'NGAY_TAO', 'TRANG_THAI'
];

const FORM_TEMPLATE_HEADERS = [
  'ID_BIEU_MAU', 'MA_BIEU_MAU', 'TEN_BIEU_MAU', 'NHOM_BIEU_MAU',
  'MO_TA', 'TRANG_THAI', 'THU_TU', 'NGAY_CAP_NHAT', 'LOAI_MAU',
  'PHAM_VI_SU_DUNG', 'CAN_CU_PHAP_LY', 'MAU_CHUAN', 'LINK_MAU_GOC', 'PHAN_HE'
];

const FORM_REQUEST_HEADERS = [
  'ID_PHIEU', 'ID_BIEU_MAU', 'TEN_BIEU_MAU', 'MA_NHAN_VIEN', 'HO_VA_TEN',
  'NGAY_LAP', 'TIEU_DE', 'NOI_DUNG', 'TRANG_THAI', 'NGUOI_TAO', 'NGAY_TAO',
  'NGUOI_DUYET', 'NGAY_DUYET', 'GHI_CHU', 'DU_LIEU_MAU_JSON',
  'SO_VAN_BAN', 'LOAI_VAN_BAN', 'PHONG_BAN', 'DOI_TAC', 'NGAY_HIEU_LUC', 'NGAY_HET_HAN', 'GIA_TRI', 'MUC_BAO_MAT', 'LINK_FILE',
  'LINK_PDF', 'NGAY_LUU_PDF', 'LICH_SU', 'DA_NHAC_HAN'
];

const FORM_REMIND_DAYS = 7;
const FORM_DRIVE_FOLDER_NAME = 'PHI LONG HR - Văn bản biểu mẫu';

const FORM_TEMPLATE_SEEDS = [
  ['FM_UY_QUYEN', 'BM-UQ-01', 'Mẫu ủy quyền', 'Ủy quyền', 'Ủy quyền nội bộ, giao nhận hồ sơ hoặc thay mặt xử lý công việc.', 1],
  ['FM_HOP_DONG', 'BM-HD-01', 'Mẫu hợp đồng', 'Lao động', 'Hợp đồng lao động, phụ lục và các nội dung thỏa thuận liên quan.', 2],
  ['FM_DE_NGHI_THANH_TOAN', 'BM-TT-01', 'Mẫu đề nghị thanh toán', 'Thanh toán', 'Đề nghị thanh toán chi phí, công tác phí hoặc khoản phải trả.', 3],
  ['FM_DE_XUAT', 'BM-DX-01', 'Mẫu đề xuất', 'Đề xuất', 'Đề xuất công việc, mua sắm, điều chuyển hoặc xử lý nghiệp vụ.', 4],
  ['FM_NGHI_PHEP', 'BM-NP-01', 'Mẫu đơn nghỉ phép', 'Nghỉ phép', 'Đăng ký nghỉ phép năm, nghỉ ốm, nghỉ thai sản hoặc nghỉ việc riêng từ ngày đến ngày.', 5],
  ['FM_DE_NGHI_TUYEN_DUNG', 'BM-NS-01', 'Mẫu đề nghị tuyển dụng', 'Nhân sự', 'Đề nghị bổ sung nhân sự theo phòng ban, bộ phận, vị trí và số lượng cần tuyển.', 6],
  ['FM_DIEU_CHUYEN_NHAN_SU', 'BM-LC-01', 'Mẫu đề xuất điều chuyển nhân sự', 'Điều chuyển', 'Đề xuất điều chuyển phòng ban, bộ phận, nhóm hoặc chức vụ của nhân viên.', 7],
  ['FM_BAN_GIAO', 'BM-BG-01', 'Mẫu biên bản bàn giao', 'Hành chính', 'Bàn giao công việc, hồ sơ và tài sản khi thay đổi vị trí hoặc nghỉ việc.', 8],
  ['FM_DE_NGHI_TAM_UNG', 'BM-TA-01', 'Mẫu đề nghị tạm ứng', 'Thanh toán', 'Đề nghị tạm ứng chi phí công tác, mua sắm hoặc thực hiện công việc được giao.', 9],
  ['FM_XAC_NHAN_CONG_TAC', 'BM-CT-01', 'Mẫu xác nhận công tác', 'Hành chính', 'Xác nhận quá trình công tác, vị trí và nội dung công việc của nhân viên.', 10],
  ['FM_DE_NGHI_DAO_TAO', 'BM-DT-01', 'Mẫu đề nghị đào tạo', 'Đào tạo', 'Đề nghị tham gia khóa đào tạo, bồi dưỡng chuyên môn hoặc phát triển năng lực.', 11],
  ['FM_CAP_PHAT_TAI_SAN', 'BM-TS-01', 'Mẫu cấp phát tài sản', 'Tài sản', 'Ghi nhận cấp phát, bàn giao hoặc thu hồi tài sản, công cụ làm việc.', 12],
  ['FM_BHXH_01B', '01B-HSB', 'Mẫu 01B-HSB - Danh sách đề nghị BHXH', 'BHXH', 'Danh sách do đơn vị sử dụng lao động lập để đề nghị giải quyết chế độ ốm đau, thai sản, dưỡng sức phục hồi sức khỏe.', 13],
  ['FM_BHXH_13', '13-HSB', 'Mẫu 13-HSB - Giấy ủy quyền BHXH', 'BHXH', 'Giấy ủy quyền lĩnh thay hoặc thực hiện thủ tục BHXH; không dùng thay mẫu ủy quyền nội bộ.', 14],
  ['FM_BHXH_14', '14-HSB', 'Mẫu 14-HSB - Đơn đề nghị BHXH', 'BHXH', 'Đơn đề nghị BHXH dùng theo đúng thủ tục áp dụng, không dùng như mẫu đề nghị chung.', 15],
  ["FM_HD_KINH_TE", "BM-HD-02", "Hợp đồng kinh tế – dịch vụ", "Hợp đồng", "Hợp đồng mua bán, nguyên tắc, dịch vụ, thuê, thi công, bảo trì, vận chuyển, hợp tác, đại lý, gia công, tư vấn, phần mềm.", 16],
  ["FM_PHU_LUC_HD", "BM-HD-03", "Phụ lục hợp đồng", "Phụ lục hợp đồng", "Gia hạn, điều chỉnh giá trị, khối lượng, thời gian, phạm vi công việc hoặc thông tin các bên.", 17],
  ["FM_BB_HOP_DONG", "BM-HD-04", "Biên bản nghiệm thu – thanh lý hợp đồng", "Biên bản hợp đồng", "Biên bản nghiệm thu, bàn giao, đối chiếu, xác nhận khối lượng, thanh lý hợp đồng.", 18],
  ["FM_THOA_THUAN", "BM-HD-05", "Cam kết – Thỏa thuận", "Cam kết – Thỏa thuận", "Cam kết, bảo mật (NDA), biên bản ghi nhớ (MOU), thỏa thuận nguyên tắc, trách nhiệm, sử dụng tài sản.", 19],
  ["FM_TO_TRINH", "BM-HC-01", "Tờ trình", "Tờ trình", "Xin chủ trương, phê duyệt mua sắm, thanh toán, đầu tư, nhân sự, ngân sách, sửa chữa.", 20],
  ["FM_BIEN_BAN", "BM-HC-02", "Biên bản họp – làm việc", "Biên bản", "Biên bản họp, làm việc, xác nhận, kiểm tra.", 21],
  ["FM_QUYET_DINH", "BM-HC-03", "Quyết định", "Quyết định", "Bổ nhiệm, miễn nhiệm, điều chuyển, tiếp nhận, tăng lương, khen thưởng, kỷ luật, thành lập tổ/ban, phân công.", 22],
  ["FM_THONG_BAO", "BM-HC-04", "Thông báo", "Thông báo", "Thông báo nội bộ, nghỉ lễ, lịch làm việc, nhân sự, chính sách, sự kiện, thay đổi quy định.", 23],
  ["FM_CONG_VAN", "BM-HC-05", "Công văn", "Công văn", "Công văn đi, đến, đề nghị, trả lời, phúc đáp, giải trình, xác nhận.", 24],
  ["FM_GIAY_GIOI_THIEU", "BM-HC-06", "Giấy giới thiệu", "Giấy giới thiệu", "Giới thiệu đi công tác, liên hệ đối tác, ngân hàng, cơ quan nhà nước.", 25],
  ["FM_CONG_TAC", "BM-HC-07", "Đề nghị công tác", "Công tác", "Đề nghị công tác, kế hoạch công tác, quyết toán công tác phí.", 26],
  ["FM_SU_CO", "BM-HC-08", "Biên bản sự cố – vi phạm", "Sự cố – vi phạm", "Biên bản sự cố, vi phạm, mất tài sản, hư hỏng, bồi thường, giải trình.", 27],
  ["FM_KE_HOACH", "BM-HC-09", "Kế hoạch", "Kế hoạch", "Kế hoạch ngày, tuần, tháng, năm; kinh doanh, nhân sự, mua sắm, bảo trì, ngân sách.", 28],
  ["FM_BAO_CAO", "BM-HC-10", "Báo cáo", "Báo cáo", "Báo cáo công việc, kinh doanh, tài chính, nhân sự, kho, kỹ thuật, bảo trì, sự cố.", 29],
  ["FM_DON_KHAC", "BM-NS-02", "Đơn (các loại)", "Mẫu đơn", "Đơn xin nghỉ không lương, nghỉ việc, xin việc, điều chuyển, xác nhận, đề nghị, khiếu nại, giải trình.", 30],
  ["FM_NHAN_SU", "BM-NS-03", "Phiếu nhân sự", "Nhân sự", "Phiếu thông tin nhân viên, tiếp nhận, đánh giá thử việc, đánh giá định kỳ, tăng lương, nghỉ việc.", 31],
  ["FM_CHAM_CONG", "BM-NS-04", "Đăng ký chấm công – tăng ca", "Chấm công – nghỉ phép", "Đăng ký tăng ca, đi muộn/về sớm, công tác, điều chỉnh chấm công.", 32],
  ["FM_LUONG", "BM-NS-05", "Lương – chế độ", "Lương – chế độ", "Bảng lương, phụ cấp, thưởng, đề nghị tăng lương, xác nhận thu nhập.", 33],
  ["FM_TUYEN_DUNG_HS", "BM-NS-06", "Hồ sơ tuyển dụng", "Tuyển dụng", "Mô tả công việc (JD), đánh giá phỏng vấn, thư mời nhận việc.", 34],
  ["FM_DAO_TAO", "BM-NS-07", "Hồ sơ đào tạo", "Đào tạo", "Kế hoạch đào tạo, danh sách học viên, đánh giá kết quả, chứng nhận.", 35],
  ["FM_KHEN_THUONG_KY_LUAT", "BM-NS-08", "Khen thưởng – kỷ luật", "Khen thưởng – kỷ luật", "Đề xuất khen thưởng, đề xuất kỷ luật, biên bản, bản giải trình.", 36],
  ["FM_PHIEU_THU_CHI", "BM-TC-01", "Phiếu thu – chi", "Phiếu thu – chi", "Phiếu thu, phiếu chi, đề nghị chi, xác nhận thu/chi.", 37],
  ["FM_KE_TOAN", "BM-TC-02", "Chứng từ kế toán", "Tài chính – kế toán", "Hóa đơn, chứng từ, ủy nhiệm chi (UNC), đối chiếu công nợ, quyết toán.", 38],
  ["FM_CONG_NO", "BM-TC-03", "Công nợ khách hàng", "Khách hàng – công nợ", "Xác nhận công nợ, đề nghị thanh toán, cam kết thanh toán, gia hạn công nợ.", 39],
  ["FM_DE_NGHI_MUA_HANG", "BM-MH-01", "Đề nghị mua hàng", "Đề nghị mua hàng", "Đề nghị mua vật tư, thiết bị, công cụ dụng cụ, hàng hóa, dịch vụ.", 40],
  ["FM_DON_DAT_HANG", "BM-MH-02", "Đơn đặt hàng (PO)", "Đơn đặt hàng", "PO mua hàng, đặt dịch vụ, đặt vật tư, thiết bị.", 41],
  ["FM_NHA_CUNG_CAP", "BM-MH-03", "Hồ sơ nhà cung cấp", "Nhà cung cấp", "Hồ sơ nhà cung cấp, đánh giá NCC, báo giá, so sánh giá.", 42],
  ["FM_NGHIEM_THU", "BM-MH-04", "Biên bản nghiệm thu", "Nghiệm thu", "Nghiệm thu hàng hóa, thiết bị, dịch vụ, công việc, thi công, khối lượng.", 43],
  ["FM_KHO", "BM-KO-01", "Phiếu kho", "Kho – vật tư", "Phiếu nhập kho, xuất kho, chuyển kho, trả hàng, điều chỉnh tồn.", 44],
  ["FM_KIEM_KE", "BM-KO-02", "Biên bản kiểm kê", "Kiểm kê", "Kiểm kê hàng hóa, kho, tài sản, thiết bị, công cụ dụng cụ.", 45],
  ["FM_TAI_SAN", "BM-TS-02", "Phiếu tài sản – thiết bị", "Tài sản – thiết bị", "Thu hồi, điều chuyển, sửa chữa, bảo hành, bảo trì tài sản và thiết bị.", 46],
  ["FM_THANH_LY", "BM-TS-03", "Biên bản thanh lý", "Thanh lý", "Thanh lý tài sản, thiết bị, hàng hóa, công cụ dụng cụ.", 47],
  ["FM_BAO_GIA", "BM-KD-01", "Báo giá", "Báo giá", "Báo giá bán hàng, dịch vụ, thi công, sửa chữa.", 48],
  ["FM_KINH_DOANH", "BM-KD-02", "Đề xuất kinh doanh", "Kinh doanh", "Đề xuất giá, chính sách giá, chiết khấu, đơn hàng, xác nhận đơn hàng.", 49],
  ["FM_MARKETING", "BM-KD-03", "Marketing – sự kiện", "Marketing – sự kiện", "Kế hoạch, đề xuất ngân sách, duyệt nội dung, nghiệm thu, quyết toán sự kiện.", 50],
  ["FM_PHIEU_YEU_CAU", "BM-KT-01", "Phiếu yêu cầu", "Phiếu yêu cầu", "Yêu cầu IT Support, sửa chữa, bảo trì, cấp quyền, cấp thiết bị, vật tư, dịch vụ.", 51],
  ["FM_BAO_TRI", "BM-KT-02", "Bảo trì – kỹ thuật", "Bảo trì – kỹ thuật", "Kế hoạch bảo trì, nhật ký, biên bản sửa chữa, nghiệm thu.", 52],
  ["FM_CNTT", "BM-KT-03", "CNTT – tài khoản hệ thống", "CNTT – hệ thống", "Cấp tài khoản, cấp quyền, thay đổi quyền, bàn giao tài khoản, thu hồi quyền.", 53],
  ["FM_CHECKLIST", "BM-KT-04", "Checklist kiểm tra", "Checklist", "Kiểm tra công việc, thiết bị, bảo trì, vệ sinh, an toàn, bàn giao.", 54],
  ["FM_AN_TOAN", "BM-KT-05", "An toàn – PCCC", "An toàn – PCCC", "Biên bản kiểm tra, checklist, kế hoạch, hồ sơ huấn luyện, xử lý sự cố an toàn – PCCC.", 55],
  ["FM_QUY_TRINH", "BM-PL-01", "Quy trình", "Quy trình", "Quy trình mua hàng, bán hàng, thanh toán, kho, nhân sự, tài sản, bảo trì, phê duyệt.", 56],
  ["FM_QUY_DINH", "BM-PL-02", "Quy định – Quy chế", "Quy định – Quy chế", "Nội quy, quy định nhân sự, tài chính, lương thưởng, tài sản, bảo mật, sử dụng hệ thống.", 57],
  ["FM_HUONG_DAN", "BM-PL-03", "Hướng dẫn", "Hướng dẫn", "Hướng dẫn nghiệp vụ, vận hành, sử dụng thiết bị/phần mềm, xử lý sự cố.", 58],
  ["FM_PHAP_LY_DN", "BM-PL-04", "Hồ sơ pháp lý doanh nghiệp", "Pháp lý doanh nghiệp", "Đăng ký kinh doanh, giấy phép, chứng nhận, đăng ký, hồ sơ thay đổi doanh nghiệp.", 59],
  ["FM_THU", "BM-PL-05", "Thư (các loại)", "Văn bản khác", "Thư mời, thư xác nhận, thư cảm ơn, thư đề nghị, thư trao đổi, hồ sơ khác.", 60]
];

/** Phân hệ (10 nhóm lớn) của từng biểu mẫu; app dùng cột PHAN_HE để gom menu. */
const FORM_TEMPLATE_MODULES = {"FM_HOP_DONG": "Hợp đồng", "FM_UY_QUYEN": "Hành chính", "FM_DE_XUAT": "Hành chính", "FM_BAN_GIAO": "Hành chính", "FM_NGHI_PHEP": "Nhân sự", "FM_DE_NGHI_TUYEN_DUNG": "Nhân sự", "FM_DIEU_CHUYEN_NHAN_SU": "Nhân sự", "FM_XAC_NHAN_CONG_TAC": "Nhân sự", "FM_DE_NGHI_DAO_TAO": "Nhân sự", "FM_BHXH_01B": "Nhân sự", "FM_BHXH_13": "Nhân sự", "FM_BHXH_14": "Nhân sự", "FM_DE_NGHI_THANH_TOAN": "Tài chính – Kế toán", "FM_DE_NGHI_TAM_UNG": "Tài chính – Kế toán", "FM_CAP_PHAT_TAI_SAN": "Tài sản – Thiết bị", "FM_HD_KINH_TE": "Hợp đồng", "FM_PHU_LUC_HD": "Hợp đồng", "FM_BB_HOP_DONG": "Hợp đồng", "FM_THOA_THUAN": "Hợp đồng", "FM_TO_TRINH": "Hành chính", "FM_BIEN_BAN": "Hành chính", "FM_QUYET_DINH": "Hành chính", "FM_THONG_BAO": "Hành chính", "FM_CONG_VAN": "Hành chính", "FM_GIAY_GIOI_THIEU": "Hành chính", "FM_CONG_TAC": "Hành chính", "FM_SU_CO": "Hành chính", "FM_KE_HOACH": "Hành chính", "FM_BAO_CAO": "Hành chính", "FM_DON_KHAC": "Nhân sự", "FM_NHAN_SU": "Nhân sự", "FM_CHAM_CONG": "Nhân sự", "FM_LUONG": "Nhân sự", "FM_TUYEN_DUNG_HS": "Nhân sự", "FM_DAO_TAO": "Nhân sự", "FM_KHEN_THUONG_KY_LUAT": "Nhân sự", "FM_PHIEU_THU_CHI": "Tài chính – Kế toán", "FM_KE_TOAN": "Tài chính – Kế toán", "FM_CONG_NO": "Tài chính – Kế toán", "FM_DE_NGHI_MUA_HANG": "Mua hàng – NCC", "FM_DON_DAT_HANG": "Mua hàng – NCC", "FM_NHA_CUNG_CAP": "Mua hàng – NCC", "FM_NGHIEM_THU": "Mua hàng – NCC", "FM_KHO": "Kho", "FM_KIEM_KE": "Kho", "FM_TAI_SAN": "Tài sản – Thiết bị", "FM_THANH_LY": "Tài sản – Thiết bị", "FM_BAO_GIA": "Kinh doanh", "FM_KINH_DOANH": "Kinh doanh", "FM_MARKETING": "Kinh doanh", "FM_PHIEU_YEU_CAU": "Kỹ thuật – Bảo trì", "FM_BAO_TRI": "Kỹ thuật – Bảo trì", "FM_CNTT": "Kỹ thuật – Bảo trì", "FM_CHECKLIST": "Kỹ thuật – Bảo trì", "FM_AN_TOAN": "Kỹ thuật – Bảo trì", "FM_QUY_TRINH": "Pháp lý & văn bản khác", "FM_QUY_DINH": "Pháp lý & văn bản khác", "FM_HUONG_DAN": "Pháp lý & văn bản khác", "FM_PHAP_LY_DN": "Pháp lý & văn bản khác", "FM_THU": "Pháp lý & văn bản khác"};

/** Hồ sơ pháp lý chỉ dùng để phân biệt mẫu nội bộ và mẫu cơ quan nhà nước. */
const FORM_TEMPLATE_LEGAL_PROFILES = {
  FM_UY_QUYEN: { LOAI_MAU: 'Nội bộ doanh nghiệp', PHAM_VI_SU_DUNG: 'Ủy quyền nội bộ, giao nhận hồ sơ hoặc thay mặt xử lý công việc.', CAN_CU_PHAP_LY: 'Bộ luật Dân sự số 91/2015/QH13; quy định nội bộ về thẩm quyền ký.', MAU_CHUAN: 'Không có mẫu bắt buộc chung' },
  FM_HOP_DONG: { LOAI_MAU: 'Nội bộ doanh nghiệp - khung hợp đồng', PHAM_VI_SU_DUNG: 'Khung soạn thảo hợp đồng lao động/phụ lục; phải rà soát trước khi ký.', CAN_CU_PHAP_LY: 'Bộ luật Lao động số 45/2019/QH14, Điều 21; Thông tư 10/2020/TT-BLĐTBXH; Nghị định 293/2025/NĐ-CP về lương tối thiểu từ 01/01/2026.', MAU_CHUAN: 'Không có một mẫu A4 duy nhất' },
  FM_DE_NGHI_THANH_TOAN: { LOAI_MAU: 'Nội bộ doanh nghiệp - chứng từ hỗ trợ', PHAM_VI_SU_DUNG: 'Đề nghị thanh toán nội bộ; đính kèm hóa đơn, hợp đồng, nghiệm thu hoặc chứng từ liên quan.', CAN_CU_PHAP_LY: 'Luật Kế toán số 88/2015/QH13, Điều 16-20; chế độ kế toán doanh nghiệp đang áp dụng.', MAU_CHUAN: 'Không có mẫu bắt buộc chung' },
  FM_DE_XUAT: { LOAI_MAU: 'Nội bộ doanh nghiệp', PHAM_VI_SU_DUNG: 'Xin chủ trương, phê duyệt phương án hoặc xử lý một công việc nội bộ.', CAN_CU_PHAP_LY: 'Quy chế quản trị và phân quyền của doanh nghiệp.', MAU_CHUAN: 'Không có mẫu bắt buộc chung' },
  FM_NGHI_PHEP: { LOAI_MAU: 'Nội bộ doanh nghiệp', PHAM_VI_SU_DUNG: 'Đơn xin nghỉ nội bộ từ ngày đến ngày; không thay thế hồ sơ hưởng chế độ BHXH.', CAN_CU_PHAP_LY: 'Bộ luật Lao động số 45/2019/QH14 về nghỉ hằng năm, nghỉ việc riêng; Luật BHXH số 41/2024/QH15 khi phát sinh hồ sơ chế độ; quy chế phép của doanh nghiệp. Hồ sơ BHXH dùng mẫu riêng theo quy trình hiện hành.', MAU_CHUAN: 'Không có mẫu A4 duy nhất' },
  FM_DE_NGHI_TUYEN_DUNG: { LOAI_MAU: 'Nội bộ doanh nghiệp', PHAM_VI_SU_DUNG: 'Đề nghị bổ sung nhân sự, làm căn cứ phê duyệt nhu cầu và tuyển dụng.', CAN_CU_PHAP_LY: 'Luật Việc làm số 74/2025/QH15; Nghị định 318/2025/NĐ-CP về đăng ký lao động và thông tin thị trường lao động.', MAU_CHUAN: 'Không có mẫu bắt buộc chung' },
  FM_DIEU_CHUYEN_NHAN_SU: { LOAI_MAU: 'Nội bộ doanh nghiệp', PHAM_VI_SU_DUNG: 'Đề xuất thay đổi phòng ban, bộ phận, nhóm, chức vụ; cập nhật DM_NHAN_VIEN và LICH_SU_CONG_VIEC sau khi duyệt.', CAN_CU_PHAP_LY: 'Bộ luật Lao động số 45/2019/QH14; trường hợp thay đổi nội dung hợp đồng phải lập thỏa thuận/phụ lục phù hợp.', MAU_CHUAN: 'Không có mẫu bắt buộc chung' },
  FM_BAN_GIAO: { LOAI_MAU: 'Nội bộ doanh nghiệp', PHAM_VI_SU_DUNG: 'Bàn giao công việc, hồ sơ, tài sản khi điều chuyển, thay đổi vị trí hoặc nghỉ việc.', CAN_CU_PHAP_LY: 'Quy chế quản lý tài sản, hồ sơ và bàn giao của doanh nghiệp; Luật Kế toán số 88/2015/QH13 khi là tài liệu làm căn cứ ghi sổ.', MAU_CHUAN: 'Không có mẫu bắt buộc chung' },
  FM_DE_NGHI_TAM_UNG: { LOAI_MAU: 'Nội bộ doanh nghiệp - chứng từ hỗ trợ', PHAM_VI_SU_DUNG: 'Đề nghị tạm ứng và theo dõi hoàn ứng; không thay thế phiếu thu, phiếu chi hoặc chứng từ kế toán bắt buộc nếu phát sinh.', CAN_CU_PHAP_LY: 'Luật Kế toán số 88/2015/QH13, Điều 16-20; chế độ kế toán doanh nghiệp đang áp dụng.', MAU_CHUAN: 'Không có mẫu bắt buộc chung' },
  FM_XAC_NHAN_CONG_TAC: { LOAI_MAU: 'Nội bộ doanh nghiệp', PHAM_VI_SU_DUNG: 'Xác nhận quá trình, vị trí và nội dung công tác theo dữ liệu hồ sơ nhân sự.', CAN_CU_PHAP_LY: 'Hồ sơ nhân sự và quy chế xác nhận của doanh nghiệp.', MAU_CHUAN: 'Không có mẫu bắt buộc chung' },
  FM_DE_NGHI_DAO_TAO: { LOAI_MAU: 'Nội bộ doanh nghiệp', PHAM_VI_SU_DUNG: 'Đề nghị đào tạo; nếu có cam kết chi phí đào tạo phải lập thỏa thuận phù hợp.', CAN_CU_PHAP_LY: 'Bộ luật Lao động số 45/2019/QH14 về đào tạo, bồi dưỡng và chi phí đào tạo.', MAU_CHUAN: 'Không có mẫu bắt buộc chung' },
  FM_CAP_PHAT_TAI_SAN: { LOAI_MAU: 'Nội bộ doanh nghiệp', PHAM_VI_SU_DUNG: 'Cấp phát, bàn giao, thu hồi tài sản và công cụ làm việc.', CAN_CU_PHAP_LY: 'Quy chế quản lý tài sản của doanh nghiệp; Luật Kế toán số 88/2015/QH13 khi dùng làm căn cứ kế toán.', MAU_CHUAN: 'Không có mẫu bắt buộc chung' },
  FM_BHXH_01B: { LOAI_MAU: 'Biểu mẫu nghiệp vụ BHXH', PHAM_VI_SU_DUNG: 'Đơn vị sử dụng lao động lập danh sách đề nghị giải quyết chế độ ốm đau, thai sản, dưỡng sức phục hồi sức khỏe.', CAN_CU_PHAP_LY: 'Luật BHXH số 41/2024/QH15; Nghị định 158/2025/NĐ-CP; Quyết định 2222/QĐ-BHXH ngày 29/07/2025, được sửa đổi bởi Quyết định 313/QĐ-BHXH ngày 27/03/2026.', MAU_CHUAN: '01B-HSB', LINK_MAU_GOC: 'https://baohiemxahoi.gov.vn/thu-tuc-hanh-chinh/Pages/default.aspx?ItemID=47' },
  FM_BHXH_13: { LOAI_MAU: 'Biểu mẫu nghiệp vụ BHXH', PHAM_VI_SU_DUNG: 'Giấy ủy quyền lĩnh thay hoặc thực hiện thủ tục BHXH theo thủ tục tương ứng.', CAN_CU_PHAP_LY: 'Luật BHXH số 41/2024/QH15; quy trình giải quyết hưởng chế độ BHXH theo Quyết định 2222/QĐ-BHXH và văn bản sửa đổi hiện hành.', MAU_CHUAN: '13-HSB', LINK_MAU_GOC: 'https://baohiemxahoi.gov.vn/thu-tuc-hanh-chinh/Pages/default.aspx?ItemID=47' },
  FM_BHXH_14: { LOAI_MAU: 'Biểu mẫu nghiệp vụ BHXH', PHAM_VI_SU_DUNG: 'Đơn đề nghị BHXH dùng theo đúng thủ tục, ví dụ hưởng BHXH một lần, chuyển nơi hưởng hoặc điều chỉnh; không dùng như mẫu đề nghị chung.', CAN_CU_PHAP_LY: 'Luật BHXH số 41/2024/QH15; Nghị định 158/2025/NĐ-CP; Quyết định 2222/QĐ-BHXH và Quyết định 313/QĐ-BHXH ngày 27/03/2026.', MAU_CHUAN: '14-HSB', LINK_MAU_GOC: 'https://baohiemxahoi.gov.vn/thu-tuc-hanh-chinh/Pages/default.aspx?ItemID=49' }
};

const ATTENDANCE_SHEET_HEADERS = {
  CC_CA_LAM_VIEC: ['ID_CA', 'TEN_CA', 'GIO_VAO', 'GIO_RA', 'SO_GIO_CONG', 'TRANG_THAI', 'GHI_CHU', 'NGAY_CAP_NHAT'],
  CC_CHAM_CONG: ['ID_CHAM_CONG', 'MA_NHAN_VIEN', 'HO_VA_TEN', 'NGAY_CONG', 'CA_LAM_VIEC', 'GIO_VAO', 'GIO_RA', 'SO_CONG', 'TRANG_THAI', 'GHI_CHU', 'NGUOI_TAO', 'NGAY_TAO'],
  CC_TANG_CA: ['ID_TANG_CA', 'MA_NHAN_VIEN', 'HO_VA_TEN', 'NGAY_TANG_CA', 'TU_GIO', 'DEN_GIO', 'SO_GIO', 'LY_DO', 'TRANG_THAI', 'NGUOI_TAO', 'NGAY_TAO', 'NGUOI_DUYET', 'NGAY_DUYET', 'GHI_CHU_DUYET'],
  CC_NGHI_PHEP: ['ID_DON_NGHI', 'MA_NHAN_VIEN', 'HO_VA_TEN', 'LOAI_NGHI', 'TU_NGAY', 'DEN_NGAY', 'BUOI_NGHI', 'SO_NGAY_NGHI', 'LY_DO', 'TEP_DINH_KEM', 'TRANG_THAI', 'NGUOI_TAO', 'NGAY_TAO', 'NGUOI_DUYET', 'NGAY_DUYET', 'GHI_CHU_DUYET'],
  CC_BANG_CONG_THANG: ['ID_BANG_CONG', 'THANG', 'NAM', 'MA_NHAN_VIEN', 'HO_VA_TEN', 'CONG_THUONG', 'NGAY_NGHI', 'GIO_TANG_CA', 'TONG_CONG', 'TRANG_THAI', 'NGAY_CHOT', 'GHI_CHU']
};

/** Xác thực nội bộ: lưu mật khẩu dạng text trong MAT_KHAU theo yêu cầu bản nội bộ/test. */
const AUTH_SHEET_HEADERS = {
  NGUOI_DUNG: ['ID_NGUOI_DUNG', 'TEN_DANG_NHAP', 'TEN_HIEN_THI', 'EMAIL', 'MA_NHAN_VIEN', 'MA_VAI_TRO', 'TRANG_THAI', 'MAT_KHAU', 'MAT_KHAU_CAP_NHAT_LUC', 'BAT_DOI_MAT_KHAU', 'SO_LAN_SAI', 'KHOA_DEN', 'LAN_DANG_NHAP_CUOI', 'NGAY_CAP_NHAT', 'GHI_CHU'],
  VAI_TRO: ['MA_VAI_TRO', 'TEN_VAI_TRO', 'TRANG_THAI', 'GHI_CHU'],
  PHAN_QUYEN: ['ID_QUYEN', 'MA_VAI_TRO', 'MA_CHUC_NANG', 'TEN_CHUC_NANG', 'XEM', 'THEM', 'SUA', 'XOA', 'DUYET', 'XUAT_FILE', 'GHI_CHU'],
  NHAT_KY_DANG_NHAP: ['ID_NHAT_KY', 'THOI_GIAN', 'TEN_DANG_NHAP', 'MA_NHAN_VIEN', 'KET_QUA', 'LY_DO', 'THIET_BI'],
  NHAT_KY_HE_THONG: ['ID_NHAT_KY', 'THOI_GIAN', 'TEN_DANG_NHAP', 'MA_NHAN_VIEN', 'CHUC_NANG', 'HANH_DONG', 'KHOA_BAN_GHI', 'DU_LIEU_TRUOC', 'DU_LIEU_SAU', 'GHI_CHU']
};

const AUTH_MAX_FAILED_ATTEMPTS = 5;
const AUTH_LOCK_MINUTES = 15;
const AUTH_MIN_PASSWORD_LENGTH = 8;
const AUTH_ROLE_SEEDS = [
  ['ROLE-ADMIN', 'Quản trị hệ thống'],
  ['ROLE-MANAGER', 'Quản lý'],
  ['ROLE-IT', 'Kỹ thuật hệ thống'],
  ['ROLE-USER', 'Người sử dụng'],
  ['ROLE-VIEW', 'Chỉ xem']
];
const AUTH_MODULE_SEEDS = [
  ['TONG_QUAN', 'Tổng quan', 'dashboard'],
  ['NHAN_SU', 'Danh bạ nhân viên', 'employees'],
  ['HO_SO', 'Hồ sơ nhân sự', 'profiles'],
  ['LUAN_CHUYEN', 'Lịch sử công việc', 'workhistory'],
  ['NGHI_PHEP', 'Chấm công – Nghỉ phép', 'attendance'],
  ['TUYEN_DUNG', 'Tuyển dụng', 'recruitment'],
  ['BIEU_MAU', 'Biểu mẫu', 'forms'],
  ['BAO_CAO', 'Báo cáo', 'reports'],
  ['DANH_MUC', 'Danh mục', 'catalog'],
  ['HE_THONG', 'Hệ thống', 'system']
];
const SYSTEM_PERMISSION_ACTIONS = ['XEM', 'THEM', 'SUA', 'XOA', 'DUYET', 'XUAT_FILE'];
const SYSTEM_SHEET_NAMES = ['NGUOI_DUNG', 'VAI_TRO', 'PHAN_QUYEN', 'NHAT_KY_DANG_NHAP', 'NHAT_KY_HE_THONG'];

/** R72: cột nhạy cảm của DM_NHAN_VIEN. Cấp 0 không thấy pháp lý/hợp đồng; cấp 1 thấy pháp lý/hợp đồng; cấp 2 thấy cả lương. */
const EMPLOYEE_LEGAL_FIELDS = ['SO_CCCD', 'NGAY_CAP', 'MA_SO_BHXH', 'NGAY_THAM_GIA_BHXH', 'LOAI_HD', 'NOI_LAM_VIEC', 'THOI_DIEM_CHAM_DUT_HD_VA_LY_DO'];
const EMPLOYEE_SALARY_FIELDS = ['LUONG_CO_BAN'];
const EMPLOYEE_STATUS_VALUES = ['Đang hoạt động', 'Thử việc', 'Tạm nghỉ', 'Nghỉ việc'];

/** So khớp không dấu: dùng cho trạng thái/tiêu đề cột có dấu tiếng Việt. */
function plain_(value) {
  return String(value == null ? '' : value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase().trim();
}

function sensitiveLevel_(roleCode) {
  var role = key_(roleCode);
  if (role === 'role-admin') return 2;
  if (role === 'role-manager' || role === 'role-user') return 1;
  return 0;
}

function hiddenEmployeeFields_(level) {
  if (level >= 2) return [];
  return level >= 1 ? EMPLOYEE_SALARY_FIELDS.slice() : EMPLOYEE_LEGAL_FIELDS.concat(EMPLOYEE_SALARY_FIELDS);
}

function isFieldInList_(header, list) {
  var wanted = plain_(header);
  return list.some(function (field) { return plain_(field) === wanted; });
}

/** Bỏ cột nhạy cảm trước khi trả dữ liệu nhân viên về trình duyệt. */
function stripEmployeeRow_(row, level) {
  var hidden = hiddenEmployeeFields_(level);
  if (!row || !hidden.length) return row;
  var result = {};
  Object.keys(row).forEach(function (header) { if (!isFieldInList_(header, hidden)) result[header] = row[header]; });
  return result;
}

/** Tìm cột theo tên, chấp nhận khác dấu (ví dụ NOI_LAM_VIẸC). */
function headerColumn_(meta, name) {
  if (meta.columns[name]) return meta.columns[name];
  var wanted = plain_(name), found = 0;
  Object.keys(meta.columns).forEach(function (header) { if (!found && plain_(header) === wanted) found = meta.columns[header]; });
  return found;
}

function ensureAuthSheet_(ss, name) {
  var sheet = ss.getSheetByName(name);
  if (!sheet) sheet = ss.insertSheet(name);
  ensureColumns_(sheet, AUTH_SHEET_HEADERS[name]);
  sheet.setFrozenRows(1);
  return sheet;
}

function appendAuthRecord_(sheet, record, suppliedMeta) {
  var meta = suppliedMeta || headers_(sheet), rowNumber = Math.max(2, sheet.getLastRow() + 1);
  sheet.getRange(rowNumber, 1, 1, meta.headers.length).setValues([meta.headers.map(function (header) {
    return header ? (record[header] == null ? '' : record[header]) : '';
  })]);
  return rowNumber;
}

function authFlag_(value) {
  return ['1', 'true', 'yes', 'y', 'co', 'x', 'có'].indexOf(key_(value)) !== -1;
}

function authTemporaryPassword_() {
  return Utilities.getUuid().replace(/-/g, '').slice(0, 12) + 'aA1!';
}

/** Ghi kết quả có mật khẩu tạm vào Execution log; không lưu mật khẩu rõ vào Sheet. */
function authOutput_(result) {
  Logger.log(JSON.stringify(result));
  return result;
}

function authActive_(value) {
  return ['đang hoạt động', 'hoạt động', 'dang hoat dong', 'hoat dong', 'active', 'enabled'].indexOf(key_(value)) !== -1;
}

function authDate_(value) {
  if (value instanceof Date && !isNaN(value.getTime())) return value;
  var text = String(value || '').trim(), match = text.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:\s+(\d{1,2}):(\d{2}))?/);
  if (match) return new Date(Number(match[3]), Number(match[2]) - 1, Number(match[1]), Number(match[4] || 0), Number(match[5] || 0));
  var parsed = new Date(text);
  return isNaN(parsed.getTime()) ? null : parsed;
}

function authWriteField_(sheet, meta, rowNumber, field, value, format) {
  if (!meta.columns[field]) return;
  var cell = sheet.getRange(rowNumber, meta.columns[field]);
  if (format) cell.setNumberFormat(format);
  cell.setValue(value == null ? '' : value);
}

function authAccountRows_(ss, snapshot) {
  var result = [], data = snapshot && snapshot.accounts || readSheet_(ss, 'NGUOI_DUNG').rows;
  data.forEach(function (row, index) { result.push({ data: row, rowNumber: index + 2 }); });
  return result;
}

function authFindAccount_(ss, username, snapshot) {
  var wanted = key_(username);
  return authAccountRows_(ss, snapshot).find(function (item) {
    return key_(item.data.TEN_DANG_NHAP) === wanted || key_(item.data.EMAIL) === wanted;
  }) || null;
}

function authSnapshot_(ss) {
  var accountData = readSheet_(ss, 'NGUOI_DUNG');
  var roleData = readSheet_(ss, 'VAI_TRO');
  var permissionData = readSheet_(ss, 'PHAN_QUYEN');
  if (accountData.missing || roleData.missing || permissionData.missing) {
    throw new Error('Dữ liệu đăng nhập chưa được khởi tạo. Hãy chạy setupLocalAuth() một lần trong Apps Script.');
  }
  var snapshot = {
    accounts: accountData.rows,
    accountMeta: accountData.meta,
    roles: roleData.rows,
    permissions: permissionData.rows,
    roleNames: {},
    permissionsByKey: {}
  };
  snapshot.roles.forEach(function (item) {
    snapshot.roleNames[key_(item.MA_VAI_TRO)] = item.TEN_VAI_TRO || item.MA_VAI_TRO || '';
  });
  snapshot.permissions.forEach(function (item) {
    snapshot.permissionsByKey[key_(item.MA_VAI_TRO) + '|' + key_(item.MA_CHUC_NANG)] = item;
  });
  return snapshot;
}

function authRoleName_(ss, roleCode, snapshot) {
  if (snapshot && snapshot.roleNames) return snapshot.roleNames[key_(roleCode)] || roleCode || 'Chưa gán vai trò';
  var row = readSheet_(ss, 'VAI_TRO').rows.find(function (item) { return key_(item.MA_VAI_TRO) === key_(roleCode); });
  return row ? (row.TEN_VAI_TRO || roleCode) : (roleCode || 'Chưa gán vai trò');
}

function authCan_(ss, roleCode, moduleCode, action, snapshot) {
  if (key_(roleCode) === 'role-admin') return true;
  var row = snapshot && snapshot.permissionsByKey
    ? snapshot.permissionsByKey[key_(roleCode) + '|' + key_(moduleCode)]
    : readSheet_(ss, 'PHAN_QUYEN').rows.find(function (item) {
      return key_(item.MA_VAI_TRO) === key_(roleCode) && key_(item.MA_CHUC_NANG) === key_(moduleCode);
    });
  return !!(row && authFlag_(row[action]));
}

function authEmployeeName_(ss, employeeCode) {
  if (!employeeCode) return '';
  var employee = masterRowByCode_(ss, 'DM_NHAN_VIEN', 'MA_NHAN_VIEN', employeeCode);
  return employee ? (employee.HO_VA_TEN || '') : '';
}

function authContext_(ss, account, snapshot) {
  var roleCode = account.MA_VAI_TRO || 'ROLE-VIEW', context = {
    id: account.ID_NGUOI_DUNG || '',
    username: account.TEN_DANG_NHAP || '',
    displayName: account.TEN_HIEN_THI || authEmployeeName_(ss, account.MA_NHAN_VIEN) || account.TEN_DANG_NHAP || 'Người dùng',
    email: account.EMAIL || '',
    employeeCode: account.MA_NHAN_VIEN || '',
    roleCode: roleCode,
    roleName: authRoleName_(ss, roleCode, snapshot),
    forcePasswordChange: authFlag_(account.BAT_DOI_MAT_KHAU),
    sensitiveLevel: sensitiveLevel_(roleCode),
    menuAccess: {}
  };
  AUTH_MODULE_SEEDS.forEach(function (module) {
    context.menuAccess[module[2]] = authCan_(ss, roleCode, module[0], 'XEM', snapshot);
  });
  return context;
}

function authSessionKey_(token) {
  return 'PHI_LONG_LOCAL_SESSION_' + String(token || '');
}

function authSession_(token) {
  var value = String(token || '').trim();
  if (!value) throw new Error('Phiên đăng nhập không hợp lệ.');
  // Không dùng CacheService cho phiên đăng nhập: CacheService có thể tự xoá
  // sau thời gian giới hạn dù người dùng vẫn đang làm việc.
  var store = PropertiesService.getScriptProperties(), raw = store.getProperty(authSessionKey_(value));
  if (!raw) throw new Error('Phiên làm việc không còn khả dụng. Vui lòng tải lại trang.');
  var session;
  try { session = JSON.parse(raw); } catch (error) { throw new Error('Phiên đăng nhập không hợp lệ.'); }
  return session;
}

function requireAuth_(token) {
  return authSession_(token).user;
}

function requirePermission_(token, moduleCode, action) {
  var user = requireAuth_(token);
  if (key_(user.roleCode) === 'role-admin') return user;
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  if (!authCan_(ss, user.roleCode, moduleCode, action)) {
    throw new Error('Tài khoản không có quyền ' + action + ' tại chức năng này.');
  }
  return user;
}

function writeLoginLog_(ss, username, employeeCode, result, reason, device) {
  var sheet = ss.getSheetByName('NHAT_KY_DANG_NHAP');
  if (!sheet) sheet = ensureAuthSheet_(ss, 'NHAT_KY_DANG_NHAP');
  var meta = headers_(sheet), rowNumber = appendAuthRecord_(sheet, {
    ID_NHAT_KY: 'LOGIN_' + Utilities.getUuid(), THOI_GIAN: new Date(), TEN_DANG_NHAP: username || '',
    MA_NHAN_VIEN: employeeCode || '', KET_QUA: result || '', LY_DO: reason || '', THIET_BI: device || ''
  }, meta);
  if (meta.columns.THOI_GIAN) sheet.getRange(rowNumber, meta.columns.THOI_GIAN).setNumberFormat('dd/MM/yyyy HH:mm:ss');
}

function writeSystemLog_(ss, user, moduleCode, action, recordKey, before, after, note) {
  var sheet = ss.getSheetByName('NHAT_KY_HE_THONG');
  if (!sheet) sheet = ensureAuthSheet_(ss, 'NHAT_KY_HE_THONG');
  var meta = headers_(sheet), rowNumber = appendAuthRecord_(sheet, {
    ID_NHAT_KY: 'SYS_' + Utilities.getUuid(), THOI_GIAN: new Date(), TEN_DANG_NHAP: user && user.username || 'Hệ thống',
    MA_NHAN_VIEN: user && user.employeeCode || '', CHUC_NANG: moduleCode || '', HANH_DONG: action || '',
    KHOA_BAN_GHI: recordKey || '', DU_LIEU_TRUOC: before ? JSON.stringify(before) : '', DU_LIEU_SAU: after ? JSON.stringify(after) : '', GHI_CHU: note || ''
  }, meta);
  if (meta.columns.THOI_GIAN) sheet.getRange(rowNumber, meta.columns.THOI_GIAN).setNumberFormat('dd/MM/yyyy HH:mm:ss');
}

function authSeedRoles_(ss) {
  var sheet = ensureAuthSheet_(ss, 'VAI_TRO'), existing = readSheet_(ss, 'VAI_TRO').rows;
  AUTH_ROLE_SEEDS.forEach(function (seed) {
    if (existing.some(function (row) { return key_(row.MA_VAI_TRO) === key_(seed[0]); })) return;
    appendAuthRecord_(sheet, { MA_VAI_TRO: seed[0], TEN_VAI_TRO: seed[1], TRANG_THAI: 'Đang hoạt động', GHI_CHU: '' });
  });
}

function authSeedPermissions_(ss) {
  var sheet = ensureAuthSheet_(ss, 'PHAN_QUYEN'), existing = readSheet_(ss, 'PHAN_QUYEN').rows;
  AUTH_ROLE_SEEDS.forEach(function (role) {
    AUTH_MODULE_SEEDS.forEach(function (module) {
      if (existing.some(function (row) { return key_(row.MA_VAI_TRO) === key_(role[0]) && key_(row.MA_CHUC_NANG) === key_(module[0]); })) return;
      var admin = role[0] === 'ROLE-ADMIN', view = admin, add = admin, edit = admin, remove = admin, approve = admin, exportFile = admin;
      if (role[0] === 'ROLE-MANAGER') {
        view = true; add = ['NHAN_SU', 'LUAN_CHUYEN', 'NGHI_PHEP', 'BIEU_MAU'].indexOf(module[0]) !== -1;
        edit = add; approve = ['LUAN_CHUYEN', 'NGHI_PHEP', 'BIEU_MAU'].indexOf(module[0]) !== -1; exportFile = true;
      } else if (role[0] === 'ROLE-IT') {
        view = true; edit = ['HE_THONG', 'DANH_MUC'].indexOf(module[0]) !== -1; exportFile = true;
      } else if (role[0] === 'ROLE-USER') {
        view = ['TONG_QUAN', 'NHAN_SU', 'HO_SO', 'LUAN_CHUYEN', 'NGHI_PHEP', 'BIEU_MAU'].indexOf(module[0]) !== -1;
        add = ['NGHI_PHEP', 'BIEU_MAU'].indexOf(module[0]) !== -1; edit = false; exportFile = false;
      } else if (role[0] === 'ROLE-VIEW') {
        view = ['TONG_QUAN', 'HO_SO', 'BAO_CAO'].indexOf(module[0]) !== -1; exportFile = module[0] === 'BAO_CAO';
      }
      appendAuthRecord_(sheet, {
        ID_QUYEN: 'PERM_' + Utilities.getUuid(), MA_VAI_TRO: role[0], MA_CHUC_NANG: module[0], TEN_CHUC_NANG: module[1],
        XEM: view ? 'Có' : 'Không', THEM: add ? 'Có' : 'Không', SUA: edit ? 'Có' : 'Không', XOA: remove ? 'Có' : 'Không',
        DUYET: approve ? 'Có' : 'Không', XUAT_FILE: exportFile ? 'Có' : 'Không', GHI_CHU: ''
      });
    });
  });
}

function ensureAuthData_(ss) {
  Object.keys(AUTH_SHEET_HEADERS).forEach(function (name) { ensureAuthSheet_(ss, name); });
  authSeedRoles_(ss);
  authSeedPermissions_(ss);
}

/** Chạy một lần trong Apps Script để tạo danh mục quyền và tài khoản admin tạm thời. */
function setupLocalAuth() {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  ensureAuthData_(ss);
  var accounts = authAccountRows_(ss);
  if (accounts.length) return authOutput_({ success: true, created: false, message: 'Dữ liệu xác thực đã tồn tại; không tạo lại tài khoản. Nếu quên mật khẩu, chạy resetLocalAdminPassword().' });
  var temporaryPassword = authTemporaryPassword_(), sheet = ensureAuthSheet_(ss, 'NGUOI_DUNG');
  appendAuthRecord_(sheet, {
    ID_NGUOI_DUNG: 'USR_' + Utilities.getUuid(), TEN_DANG_NHAP: 'admin', TEN_HIEN_THI: 'Admin', EMAIL: '', MA_NHAN_VIEN: '',
    MA_VAI_TRO: 'ROLE-ADMIN', TRANG_THAI: 'Đang hoạt động', MAT_KHAU: temporaryPassword,
    MAT_KHAU_CAP_NHAT_LUC: new Date(), BAT_DOI_MAT_KHAU: 'Có', SO_LAN_SAI: 0, KHOA_DEN: '', LAN_DANG_NHAP_CUOI: '', NGAY_CAP_NHAT: new Date(), GHI_CHU: 'Tài khoản khởi tạo; bắt buộc đổi mật khẩu.'
  });
  SpreadsheetApp.flush();
  return authOutput_({ success: true, created: true, username: 'admin', temporaryPassword: temporaryPassword, message: 'Đã tạo tài khoản tạm thời. Đổi mật khẩu ngay sau lần đăng nhập đầu tiên.' });
}

/**
 * Chạy thủ công trong Apps Script khi quên mật khẩu admin.
 * Mật khẩu mới được lưu vào MAT_KHAU và trả về trong Execution log.
 */
function resetLocalAdminPassword() {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  ensureAuthData_(ss);
  var found = authFindAccount_(ss, 'admin');
  if (!found) throw new Error('Chưa có tài khoản admin. Hãy chạy setupLocalAuth() trước.');
  var sheet = ensureAuthSheet_(ss, 'NGUOI_DUNG'), meta = headers_(sheet), now = new Date();
  var temporaryPassword = authTemporaryPassword_();
  authWriteField_(sheet, meta, found.rowNumber, 'MAT_KHAU', temporaryPassword, '@');
  authWriteField_(sheet, meta, found.rowNumber, 'MAT_KHAU_CAP_NHAT_LUC', now, 'dd/MM/yyyy HH:mm:ss');
  authWriteField_(sheet, meta, found.rowNumber, 'BAT_DOI_MAT_KHAU', 'Có', '@');
  authWriteField_(sheet, meta, found.rowNumber, 'SO_LAN_SAI', 0, '@');
  authWriteField_(sheet, meta, found.rowNumber, 'KHOA_DEN', '', '@');
  authWriteField_(sheet, meta, found.rowNumber, 'NGAY_CAP_NHAT', now, 'dd/MM/yyyy HH:mm:ss');
  authWriteField_(sheet, meta, found.rowNumber, 'GHI_CHU', 'Đã reset mật khẩu; bắt buộc đổi mật khẩu sau khi đăng nhập.', '@');
  writeSystemLog_(ss, { username: 'Hệ thống', employeeCode: '' }, 'HE_THONG', 'DAT_LAI_MAT_KHAU', found.data.ID_NGUOI_DUNG || 'admin', null, null, 'Reset mật khẩu tài khoản admin thủ công.');
  SpreadsheetApp.flush();
  return authOutput_({ success: true, reset: true, username: found.data.TEN_DANG_NHAP || 'admin', temporaryPassword: temporaryPassword, message: 'Đã reset mật khẩu admin. Đăng nhập bằng mật khẩu tạm và đổi mật khẩu ngay.' });
}

function getLocalAuthStatus() {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  ensureAuthData_(ss);
  return { initialized: true, accountCount: authAccountRows_(ss).length };
}

function systemSafeAccount_(ss, row, snapshot) {
  return {
    ID_NGUOI_DUNG: row.ID_NGUOI_DUNG || '',
    TEN_DANG_NHAP: row.TEN_DANG_NHAP || '',
    TEN_HIEN_THI: row.TEN_HIEN_THI || '',
    EMAIL: row.EMAIL || '',
    MA_NHAN_VIEN: row.MA_NHAN_VIEN || '',
    MA_VAI_TRO: row.MA_VAI_TRO || '',
    TEN_VAI_TRO: authRoleName_(ss, row.MA_VAI_TRO, snapshot),
    TRANG_THAI: row.TRANG_THAI || '',
    BAT_DOI_MAT_KHAU: row.BAT_DOI_MAT_KHAU || '',
    SO_LAN_SAI: row.SO_LAN_SAI || 0,
    KHOA_DEN: row.KHOA_DEN || '',
    LAN_DANG_NHAP_CUOI: row.LAN_DANG_NHAP_CUOI || '',
    NGAY_CAP_NHAT: row.NGAY_CAP_NHAT || '',
    GHI_CHU: row.GHI_CHU || ''
  };
}

function systemFindAccount_(ss, idOrUsername) {
  var wanted = key_(idOrUsername);
  return authAccountRows_(ss).find(function (item) {
    return key_(item.data.ID_NGUOI_DUNG) === wanted || key_(item.data.TEN_DANG_NHAP) === wanted;
  }) || null;
}

function systemRole_(ss, roleCode) {
  var wanted = key_(roleCode);
  return readSheet_(ss, 'VAI_TRO').rows.find(function (row) {
    return key_(row.MA_VAI_TRO) === wanted;
  }) || null;
}

function systemStatus_(value) {
  var status = String(value || 'Đang hoạt động').trim();
  if (['Đang hoạt động', 'Tạm khóa', 'Ngừng hoạt động'].indexOf(status) === -1) {
    throw new Error('Trạng thái tài khoản không hợp lệ.');
  }
  return status;
}

function systemSheetSnapshot_(ss, name) {
  var result = readSheet_(ss, name);
  return { name: name, rows: result.rows.length, status: result.missing ? 'Thiếu' : 'Sẵn sàng' };
}

/** Dữ liệu cho trang Hệ thống; tuyệt đối không trả MAT_KHAU về trình duyệt. */
function getSystemData(sessionToken) {
  var auth = requireAuth_(sessionToken), ss = SpreadsheetApp.openById(SPREADSHEET_ID), snapshot = authSnapshot_(ss);
  if (key_(auth.roleCode) !== 'role-admin' && !authCan_(ss, auth.roleCode, 'HE_THONG', 'XEM', snapshot)) {
    throw new Error('Tài khoản không có quyền XEM tại chức năng này.');
  }
  var rawAccounts = snapshot.accounts;
  var accounts = rawAccounts.map(function (row) { return systemSafeAccount_(ss, row, snapshot); });
  var roles = snapshot.roles;
  var permissions = snapshot.permissions;
  var loginLogs = readSheet_(ss, 'NHAT_KY_DANG_NHAP').rows;
  var systemLogs = readSheet_(ss, 'NHAT_KY_HE_THONG').rows;
  var sheetRows = {
    NGUOI_DUNG: rawAccounts.length,
    VAI_TRO: roles.length,
    PHAN_QUYEN: permissions.length,
    NHAT_KY_DANG_NHAP: loginLogs.length,
    NHAT_KY_HE_THONG: systemLogs.length
  };
  return {
    success: true,
    accounts: { headers: ['ID_NGUOI_DUNG', 'TEN_DANG_NHAP', 'TEN_HIEN_THI', 'EMAIL', 'MA_NHAN_VIEN', 'MA_VAI_TRO', 'TEN_VAI_TRO', 'TRANG_THAI', 'BAT_DOI_MAT_KHAU', 'SO_LAN_SAI', 'KHOA_DEN', 'LAN_DANG_NHAP_CUOI', 'NGAY_CAP_NHAT', 'GHI_CHU'], rows: accounts },
    roles: { headers: ['MA_VAI_TRO', 'TEN_VAI_TRO', 'TRANG_THAI', 'GHI_CHU'], rows: roles },
    permissions: { headers: AUTH_SHEET_HEADERS.PHAN_QUYEN.slice(), rows: permissions },
    loginLogs: { headers: AUTH_SHEET_HEADERS.NHAT_KY_DANG_NHAP.slice(), rows: loginLogs },
    systemLogs: { headers: AUTH_SHEET_HEADERS.NHAT_KY_HE_THONG.slice(), rows: systemLogs },
    sheets: SYSTEM_SHEET_NAMES.map(function (name) { return { name: name, rows: sheetRows[name] || 0, status: 'Sẵn sàng' }; }),
    summary: {
      accounts: accounts.length,
      activeAccounts: accounts.filter(function (row) { return authActive_(row.TRANG_THAI); }).length,
      roles: roles.length,
      permissions: permissions.length,
      loginLogs: loginLogs.length,
      systemLogs: systemLogs.length
    }
  };
}

function saveSystemAccount(input) {
  input = input || {};
  var auth = requirePermission_(input._sessionToken, 'HE_THONG', 'THEM');
  var username = String(input.TEN_DANG_NHAP || '').trim(), displayName = String(input.TEN_HIEN_THI || '').trim();
  var email = String(input.EMAIL || '').trim(), employeeCode = String(input.MA_NHAN_VIEN || '').trim();
  var password = String(input.MAT_KHAU || ''), roleCode = String(input.MA_VAI_TRO || 'ROLE-VIEW').trim();
  if (!username) throw new Error('Vui lòng nhập tên đăng nhập.');
  if (!displayName) throw new Error('Vui lòng nhập tên hiển thị.');
  if (password && password.length < AUTH_MIN_PASSWORD_LENGTH) throw new Error('Mật khẩu phải có ít nhất ' + AUTH_MIN_PASSWORD_LENGTH + ' ký tự.');
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  ensureAuthData_(ss);
  if (authFindAccount_(ss, username)) throw new Error('Tên đăng nhập hoặc email đã tồn tại.');
  if (email && authFindAccount_(ss, email)) throw new Error('Tên đăng nhập hoặc email đã tồn tại.');
  if (!systemRole_(ss, roleCode)) throw new Error('Vai trò đã chọn không tồn tại.');
  if (employeeCode && !masterRowByCode_(ss, 'DM_NHAN_VIEN', 'MA_NHAN_VIEN', employeeCode)) throw new Error('Mã nhân viên đã chọn không tồn tại.');
  var generatedPassword = !password, temporaryPassword = generatedPassword ? authTemporaryPassword_() : '';
  var sheet = ensureAuthSheet_(ss, 'NGUOI_DUNG'), now = new Date();
  var record = {
    ID_NGUOI_DUNG: 'USR_' + Utilities.getUuid(), TEN_DANG_NHAP: username, TEN_HIEN_THI: displayName, EMAIL: email,
    MA_NHAN_VIEN: employeeCode, MA_VAI_TRO: roleCode, TRANG_THAI: systemStatus_(input.TRANG_THAI || 'Đang hoạt động'),
    MAT_KHAU: password || temporaryPassword, MAT_KHAU_CAP_NHAT_LUC: now, BAT_DOI_MAT_KHAU: 'Có', SO_LAN_SAI: 0,
    KHOA_DEN: '', LAN_DANG_NHAP_CUOI: '', NGAY_CAP_NHAT: now, GHI_CHU: generatedPassword ? 'Tài khoản tạo mới; dùng mật khẩu tạm và đổi sau lần đăng nhập đầu tiên.' : ''
  };
  appendAuthRecord_(sheet, record);
  writeSystemLog_(ss, auth, 'HE_THONG', 'THEM', record.ID_NGUOI_DUNG, null, systemSafeAccount_(ss, record), 'Tạo tài khoản hệ thống.');
  SpreadsheetApp.flush();
  var result = { success: true, created: true, id: record.ID_NGUOI_DUNG, username: username, message: 'Đã tạo tài khoản.' };
  if (generatedPassword) result.temporaryPassword = temporaryPassword;
  return authOutput_(result);
}

function updateSystemAccount(input) {
  input = input || {};
  var auth = requirePermission_(input._sessionToken, 'HE_THONG', 'SUA'), id = String(input.ID_NGUOI_DUNG || '').trim();
  if (!id) throw new Error('Thiếu tài khoản cần cập nhật.');
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  ensureAuthData_(ss);
  var found = systemFindAccount_(ss, id);
  if (!found) throw new Error('Không tìm thấy tài khoản.');
  var status = Object.prototype.hasOwnProperty.call(input, 'TRANG_THAI') ? systemStatus_(input.TRANG_THAI) : '';
  if (status && key_(found.data.TEN_DANG_NHAP) === key_(auth.username) && status !== 'Đang hoạt động') throw new Error('Không thể tự khóa tài khoản đang đăng nhập.');
  var roleCode = String(input.MA_VAI_TRO || '').trim();
  if (roleCode && !systemRole_(ss, roleCode)) throw new Error('Vai trò đã chọn không tồn tại.');
  var email = String(input.EMAIL || '').trim();
  if (email) {
    var emailFound = authFindAccount_(ss, email);
    if (emailFound && emailFound.rowNumber !== found.rowNumber) throw new Error('Email đã được dùng cho tài khoản khác.');
  }
  var employeeCode = String(input.MA_NHAN_VIEN || '').trim();
  if (employeeCode && !masterRowByCode_(ss, 'DM_NHAN_VIEN', 'MA_NHAN_VIEN', employeeCode)) throw new Error('Mã nhân viên đã chọn không tồn tại.');
  var password = String(input.MAT_KHAU || ''), sheet = ensureAuthSheet_(ss, 'NGUOI_DUNG'), meta = headers_(sheet), before = systemSafeAccount_(ss, found.data), now = new Date();
  if (password && password.length < AUTH_MIN_PASSWORD_LENGTH) throw new Error('Mật khẩu mới phải có ít nhất ' + AUTH_MIN_PASSWORD_LENGTH + ' ký tự.');
  [['TEN_HIEN_THI', String(input.TEN_HIEN_THI || '').trim()], ['EMAIL', email], ['MA_NHAN_VIEN', employeeCode], ['MA_VAI_TRO', roleCode], ['TRANG_THAI', status]].forEach(function (pair) {
    if (pair[1] !== '') authWriteField_(sheet, meta, found.rowNumber, pair[0], pair[1], '@');
  });
  if (password) {
    authWriteField_(sheet, meta, found.rowNumber, 'MAT_KHAU', password, '@');
    authWriteField_(sheet, meta, found.rowNumber, 'MAT_KHAU_CAP_NHAT_LUC', now, 'dd/MM/yyyy HH:mm:ss');
    authWriteField_(sheet, meta, found.rowNumber, 'BAT_DOI_MAT_KHAU', 'Có', '@');
  }
  authWriteField_(sheet, meta, found.rowNumber, 'NGAY_CAP_NHAT', now, 'dd/MM/yyyy HH:mm:ss');
  var after = systemSafeAccount_(ss, Object.assign({}, found.data, { TEN_HIEN_THI: String(input.TEN_HIEN_THI || found.data.TEN_HIEN_THI), EMAIL: email || found.data.EMAIL, MA_NHAN_VIEN: employeeCode || found.data.MA_NHAN_VIEN, MA_VAI_TRO: roleCode || found.data.MA_VAI_TRO, TRANG_THAI: status || found.data.TRANG_THAI }));
  writeSystemLog_(ss, auth, 'HE_THONG', 'SUA', id, before, after, password ? 'Cập nhật tài khoản và đặt mật khẩu mới.' : 'Cập nhật thông tin tài khoản.');
  SpreadsheetApp.flush();
  return { success: true, updated: true };
}

function resetSystemAccountPassword(input) {
  input = input || {};
  var auth = requirePermission_(input._sessionToken, 'HE_THONG', 'SUA'), id = String(input.ID_NGUOI_DUNG || '').trim();
  if (!id) throw new Error('Thiếu tài khoản cần reset.');
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  ensureAuthData_(ss);
  var found = systemFindAccount_(ss, id);
  if (!found) throw new Error('Không tìm thấy tài khoản.');
  var sheet = ensureAuthSheet_(ss, 'NGUOI_DUNG'), meta = headers_(sheet), now = new Date(), temporaryPassword = authTemporaryPassword_();
  authWriteField_(sheet, meta, found.rowNumber, 'MAT_KHAU', temporaryPassword, '@');
  authWriteField_(sheet, meta, found.rowNumber, 'MAT_KHAU_CAP_NHAT_LUC', now, 'dd/MM/yyyy HH:mm:ss');
  authWriteField_(sheet, meta, found.rowNumber, 'BAT_DOI_MAT_KHAU', 'Có', '@');
  authWriteField_(sheet, meta, found.rowNumber, 'SO_LAN_SAI', 0, '@');
  authWriteField_(sheet, meta, found.rowNumber, 'KHOA_DEN', '', '@');
  authWriteField_(sheet, meta, found.rowNumber, 'NGAY_CAP_NHAT', now, 'dd/MM/yyyy HH:mm:ss');
  authWriteField_(sheet, meta, found.rowNumber, 'GHI_CHU', 'Đã reset mật khẩu; bắt buộc đổi sau lần đăng nhập tiếp theo.', '@');
  writeSystemLog_(ss, auth, 'HE_THONG', 'DAT_LAI_MAT_KHAU', id, null, null, 'Reset mật khẩu tài khoản.');
  SpreadsheetApp.flush();
  return authOutput_({ success: true, reset: true, username: found.data.TEN_DANG_NHAP || '', temporaryPassword: temporaryPassword, message: 'Đã reset mật khẩu. Đăng nhập bằng mật khẩu tạm và đổi ngay.' });
}

function saveSystemPermissions(input) {
  input = input || {};
  var auth = requirePermission_(input._sessionToken, 'HE_THONG', 'SUA'), items = Array.isArray(input.items) ? input.items : [];
  if (!items.length) throw new Error('Chưa có quyền nào để lưu.');
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  ensureAuthData_(ss);
  var sheet = ensureAuthSheet_(ss, 'PHAN_QUYEN'), meta = headers_(sheet), lastRow = sheet.getLastRow();
  var values = lastRow > 1 ? sheet.getRange(2, 1, lastRow - 1, meta.headers.length).getDisplayValues() : [], updated = 0;
  items.forEach(function (item) {
    var roleCode = String(item.MA_VAI_TRO || '').trim(), moduleCode = String(item.MA_CHUC_NANG || '').trim();
    if (!roleCode || !moduleCode) return;
    var index = values.findIndex(function (row) { return key_(row[meta.columns.MA_VAI_TRO - 1]) === key_(roleCode) && key_(row[meta.columns.MA_CHUC_NANG - 1]) === key_(moduleCode); });
    if (index === -1) return;
    var rowNumber = index + 2;
    SYSTEM_PERMISSION_ACTIONS.forEach(function (action) { authWriteField_(sheet, meta, rowNumber, action, authFlag_(item[action]) ? 'Có' : 'Không', '@'); });
    updated++;
  });
  writeSystemLog_(ss, auth, 'HE_THONG', 'SUA', 'PHAN_QUYEN', null, { rows: updated }, 'Cập nhật ma trận phân quyền.');
  SpreadsheetApp.flush();
  return { success: true, updated: updated };
}

function loginLocal(input) {
  input = input || {};
  var username = String(input.username || '').trim(), password = String(input.password || ''), device = String(input.device || '').trim();
  if (!username || !password) throw new Error('Vui lòng nhập tên đăng nhập và mật khẩu.');
  var lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try {
    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    // Các sheet xác thực phải được khởi tạo trước bằng setupLocalAuth().
    // Login chỉ đọc một snapshot thay vì kiểm tra/đọc lại từng sheet nhiều lần.
    var authData = authSnapshot_(ss), found = authFindAccount_(ss, username, authData);
    if (!found) { writeLoginLog_(ss, username, '', 'Thất bại', 'Không tồn tại tài khoản', device); throw new Error('Tên đăng nhập hoặc mật khẩu không đúng.'); }
    var account = found.data, sheet = ss.getSheetByName('NGUOI_DUNG'), meta = authData.accountMeta || headers_(sheet), now = new Date(), lockedUntil = authDate_(account.KHOA_DEN);
    if (lockedUntil && lockedUntil.getTime() > now.getTime()) {
      writeLoginLog_(ss, username, account.MA_NHAN_VIEN, 'Thất bại', 'Tài khoản đang bị khóa tạm thời', device);
      throw new Error('Tài khoản đang bị khóa tạm thời. Vui lòng thử lại sau.');
    }
    if (!authActive_(account.TRANG_THAI)) {
      writeLoginLog_(ss, username, account.MA_NHAN_VIEN, 'Thất bại', 'Tài khoản đã bị khóa hoặc ngừng hoạt động', device);
      throw new Error('Tài khoản đã bị khóa hoặc ngừng hoạt động.');
    }
    var valid = String(account.MAT_KHAU || '') === password, failed = Number(account.SO_LAN_SAI || 0);
    if (!valid) {
      failed += 1;
      authWriteField_(sheet, meta, found.rowNumber, 'SO_LAN_SAI', failed, '@');
      if (failed >= AUTH_MAX_FAILED_ATTEMPTS) authWriteField_(sheet, meta, found.rowNumber, 'KHOA_DEN', new Date(now.getTime() + AUTH_LOCK_MINUTES * 60000), 'dd/MM/yyyy HH:mm');
      writeLoginLog_(ss, username, account.MA_NHAN_VIEN, 'Thất bại', failed >= AUTH_MAX_FAILED_ATTEMPTS ? 'Vượt số lần nhập sai; khóa tạm thời' : 'Mật khẩu không đúng', device);
      throw new Error(failed >= AUTH_MAX_FAILED_ATTEMPTS ? 'Nhập sai quá số lần cho phép. Tài khoản đã bị khóa tạm thời.' : 'Tên đăng nhập hoặc mật khẩu không đúng.');
    }
    authWriteField_(sheet, meta, found.rowNumber, 'SO_LAN_SAI', 0, '@');
    authWriteField_(sheet, meta, found.rowNumber, 'KHOA_DEN', '');
    authWriteField_(sheet, meta, found.rowNumber, 'LAN_DANG_NHAP_CUOI', now, 'dd/MM/yyyy HH:mm:ss');
    var user = authContext_(ss, account, authData), token = Utilities.getUuid() + Utilities.getUuid().replace(/-/g, ''), session = { user: user, createdAt: now.toISOString(), lastActivityAt: now.toISOString() };
    // Phiên được giữ đến khi logout hoặc bị xoá thủ công; không tự hết hạn
    // trong lúc trang hiện tại vẫn đang được sử dụng.
    PropertiesService.getScriptProperties().setProperty(authSessionKey_(token), JSON.stringify(session));
    writeLoginLog_(ss, username, account.MA_NHAN_VIEN, 'Thành công', 'Đăng nhập hợp lệ', device);
    return { success: true, token: token, user: user };
  } finally {
    lock.releaseLock();
  }
}

function getSessionContext(token) {
  var user = requireAuth_(token);
  return { success: true, user: user };
}

function logoutLocal(token) {
  var value = String(token || '').trim();
  if (!value) return { success: true };
  var store = PropertiesService.getScriptProperties(), raw = store.getProperty(authSessionKey_(value));
  if (raw) {
    try {
      var session = JSON.parse(raw), ss = SpreadsheetApp.openById(SPREADSHEET_ID);
      writeLoginLog_(ss, session.user && session.user.username || '', session.user && session.user.employeeCode || '', 'Đăng xuất', 'Người dùng đăng xuất', '');
    } catch (error) {}
  }
  store.deleteProperty(authSessionKey_(value));
  return { success: true };
}

function changeLocalPassword(input) {
  input = input || {};
  var user = requireAuth_(input._sessionToken), current = String(input.currentPassword || ''), next = String(input.newPassword || '');
  if (next.length < AUTH_MIN_PASSWORD_LENGTH) throw new Error('Mật khẩu mới phải có ít nhất ' + AUTH_MIN_PASSWORD_LENGTH + ' ký tự.');
  if (!current || !next) throw new Error('Vui lòng nhập đầy đủ mật khẩu hiện tại và mật khẩu mới.');
  if (current === next) throw new Error('Mật khẩu mới phải khác mật khẩu hiện tại.');
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID), found = authFindAccount_(ss, user.username);
  if (!found) throw new Error('Không tìm thấy tài khoản.');
  if (String(found.data.MAT_KHAU || '') !== current) throw new Error('Mật khẩu hiện tại không đúng.');
  var sheet = ensureAuthSheet_(ss, 'NGUOI_DUNG'), meta = headers_(sheet);
  authWriteField_(sheet, meta, found.rowNumber, 'MAT_KHAU', next, '@');
  authWriteField_(sheet, meta, found.rowNumber, 'MAT_KHAU_CAP_NHAT_LUC', new Date(), 'dd/MM/yyyy HH:mm:ss');
  authWriteField_(sheet, meta, found.rowNumber, 'BAT_DOI_MAT_KHAU', 'Không', '@');
  authWriteField_(sheet, meta, found.rowNumber, 'NGAY_CAP_NHAT', new Date(), 'dd/MM/yyyy HH:mm:ss');
  writeSystemLog_(ss, user, 'HE_THONG', 'SUA', found.data.ID_NGUOI_DUNG || user.username, null, null, 'Đổi mật khẩu local.');
  SpreadsheetApp.flush();
  return { success: true };
}

function doGet() {
  return HtmlService.createTemplateFromFile('Index')
    .evaluate()
    .setTitle('PHI LONG HR')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function key_(value) {
  return String(value == null ? '' : value).normalize('NFC').trim().toLowerCase();
}

/** Trả về ID tệp Drive từ ID thuần hoặc liên kết chia sẻ tệp. */
function driveFileId_(value) {
  var raw = String(value == null ? '' : value).trim();
  if (!raw) return '';
  var match = raw.match(/(?:\/d\/|[?&]id=)([A-Za-z0-9_-]{15,})/i);
  if (match) return match[1];
  if (/^[A-Za-z0-9_-]{15,}$/.test(raw)) return raw;
  throw new Error('Ảnh đại diện phải là ID hoặc liên kết tệp Google Drive hợp lệ.');
}

/** Kiểm tra ảnh trước khi lưu và trả về ID chuẩn để giao diện luôn dùng một định dạng. */
function normalizeEmployeeImage_(value) {
  var id = driveFileId_(value);
  if (!id) return '';
  var file;
  try {
    file = DriveApp.getFileById(id);
  } catch (error) {
    throw new Error('Không tìm thấy tệp ảnh trên Google Drive hoặc ứng dụng chưa được cấp quyền xem tệp này.');
  }
  var mimeType = String(file.getMimeType() || '');
  if (!/^image\//i.test(mimeType)) {
    throw new Error('Tệp đã chọn không phải là hình ảnh (' + (mimeType || 'không xác định') + ').');
  }
  try {
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  } catch (error) {
    throw new Error('Không thể cấp quyền xem ảnh bằng liên kết. Hãy kiểm tra quyền chia sẻ của tệp Drive.');
  }
  return id;
}

/** Bắt buộc mã liên kết phải tồn tại trong danh mục nguồn. */
function requireMasterCode_(ss, sheetName, codeHeader, value, label) {
  var code = String(value == null ? '' : value).trim();
  if (!code) throw new Error('Vui lòng chọn ' + label + ' từ danh mục.');
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) throw new Error('Không tìm thấy danh mục ' + sheetName + '.');
  var meta = headers_(sheet);
  if (!meta.columns[codeHeader]) throw new Error(sheetName + ' chưa có cột ' + codeHeader + '.');
  var lastRow = sheet.getLastRow();
  var values = lastRow > 1
    ? sheet.getRange(2, meta.columns[codeHeader], lastRow - 1, 1).getDisplayValues()
    : [];
  var found = values.some(function (row) { return key_(row[0]) === key_(code); });
  if (!found) throw new Error(label + ' đã chọn không tồn tại trong ' + sheetName + '.');
  return code;
}

function masterRowByCode_(ss, sheetName, codeHeader, value) {
  var wanted = key_(value);
  return readSheet_(ss, sheetName).rows.find(function (row) {
    return key_(row[codeHeader]) === wanted;
  }) || null;
}

function headersFromRow_(source) {
  var used = {};
  var columns = {};
  var headers = source.map(function (value, index) {
    var header = String(value || '').replace(/^\uFEFF/, '').trim().toUpperCase();
    if (!header || used[header]) return '';
    used[header] = true;
    columns[header] = index + 1;
    return header;
  });
  return { headers: headers, columns: columns };
}

function headers_(sheet) {
  var width = Math.max(1, sheet.getLastColumn());
  return headersFromRow_(sheet.getRange(1, 1, 1, width).getDisplayValues()[0]);
}

function ensureColumns_(sheet, requiredHeaders) {
  var existing = headers_(sheet).headers.filter(String);
  if (!existing.length) {
    sheet.getRange(1, 1, 1, requiredHeaders.length).setValues([requiredHeaders]);
    return requiredHeaders.slice();
  }
  var known = {};
  existing.forEach(function (header) { known[String(header).toUpperCase()] = true; });
  var missing = requiredHeaders.filter(function (header) { return !known[header]; });
  if (missing.length) sheet.getRange(1, sheet.getLastColumn() + 1, 1, missing.length).setValues([missing]);
  return existing.concat(missing);
}

function objectFromRow_(meta, row) {
  var result = {};
  meta.headers.forEach(function (header, index) {
    if (header) result[header] = row[index] || '';
  });
  return result;
}

function ensureWorkHistorySheet_(ss) {
  var sheet = ss.getSheetByName('LICH_SU_CONG_VIEC');
  if (!sheet) sheet = ss.insertSheet('LICH_SU_CONG_VIEC');
  ensureColumns_(sheet, WORK_HISTORY_HEADERS);
  sheet.setFrozenRows(1);
  return sheet;
}

function ensureAttendanceSheet_(ss, name) {
  var headers = ATTENDANCE_SHEET_HEADERS[name];
  if (!headers) throw new Error('Không xác định được dữ liệu chấm công: ' + name + '.');
  var sheet = ss.getSheetByName(name);
  if (!sheet) sheet = ss.insertSheet(name);
  ensureColumns_(sheet, headers);
  sheet.setFrozenRows(1);
  return sheet;
}

function ensureFormSheet_(ss, name) {
  var definitions = {
    DM_BIEU_MAU: FORM_TEMPLATE_HEADERS,
    PHIEU_BIEU_MAU: FORM_REQUEST_HEADERS
  };
  if (!definitions[name]) throw new Error('Không xác định được bảng biểu mẫu: ' + name + '.');
  var sheet = ss.getSheetByName(name);
  if (!sheet) sheet = ss.insertSheet(name);
  ensureColumns_(sheet, definitions[name]);
  sheet.setFrozenRows(1);
  return sheet;
}

function formTemplateRecord_(seed) {
  var legal = FORM_TEMPLATE_LEGAL_PROFILES[seed[0]] || {};
  return {
    ID_BIEU_MAU: seed[0], MA_BIEU_MAU: seed[1], TEN_BIEU_MAU: seed[2], NHOM_BIEU_MAU: seed[3],
    MO_TA: seed[4], TRANG_THAI: 'Đang sử dụng', THU_TU: seed[5], NGAY_CAP_NHAT: new Date(),
    LOAI_MAU: legal.LOAI_MAU || 'Nội bộ doanh nghiệp', PHAM_VI_SU_DUNG: legal.PHAM_VI_SU_DUNG || seed[4],
    CAN_CU_PHAP_LY: legal.CAN_CU_PHAP_LY || '', MAU_CHUAN: legal.MAU_CHUAN || 'Không có mẫu bắt buộc chung', LINK_MAU_GOC: legal.LINK_MAU_GOC || '',
    PHAN_HE: FORM_TEMPLATE_MODULES[seed[0]] || ''
  };
}

function appendFormRecord_(sheet, meta, record) {
  var rowNumber = Math.max(2, sheet.getLastRow() + 1);
  sheet.getRange(rowNumber, 1, 1, meta.headers.length).setValues([meta.headers.map(function (header) {
    return header ? (record[header] == null ? '' : record[header]) : '';
  })]);
  return rowNumber;
}

function ensureDefaultFormTemplates_(ss) {
  var sheet = ensureFormSheet_(ss, 'DM_BIEU_MAU'), meta = headers_(sheet), existing = readSheet_(ss, 'DM_BIEU_MAU').rows, added = 0, updated = 0;
  FORM_TEMPLATE_SEEDS.forEach(function (seed) {
    var existingIndex = existing.findIndex(function (row) {
      return key_(row.ID_BIEU_MAU) === key_(seed[0]) || key_(row.MA_BIEU_MAU) === key_(seed[1]);
    });
    if (existingIndex !== -1) {
      var legal = FORM_TEMPLATE_LEGAL_PROFILES[seed[0]] || {};
      ['LOAI_MAU', 'PHAM_VI_SU_DUNG', 'CAN_CU_PHAP_LY', 'MAU_CHUAN', 'LINK_MAU_GOC'].forEach(function (field) {
        if (meta.columns[field] && legal[field] && !String(existing[existingIndex][field] || '').trim()) {
          sheet.getRange(existingIndex + 2, meta.columns[field]).setValue(legal[field]);
          existing[existingIndex][field] = legal[field];
          updated++;
        }
      });
      if (meta.columns.PHAN_HE && FORM_TEMPLATE_MODULES[seed[0]] && !String(existing[existingIndex].PHAN_HE || '').trim()) {
        sheet.getRange(existingIndex + 2, meta.columns.PHAN_HE).setValue(FORM_TEMPLATE_MODULES[seed[0]]);
        existing[existingIndex].PHAN_HE = FORM_TEMPLATE_MODULES[seed[0]];
        updated++;
      }
      return;
    }
    var formRecord = formTemplateRecord_(seed);
    appendFormRecord_(sheet, meta, formRecord);
    existing.push(formRecord);
    added++;
  });
  if (added) {
    ['ID_BIEU_MAU', 'MA_BIEU_MAU'].forEach(function (field) {
      if (meta.columns[field]) sheet.getRange(2, meta.columns[field], Math.max(1, sheet.getLastRow() - 1), 1).setNumberFormat('@');
    });
  }
  return { sheet: sheet, added: added, updated: updated };
}

/** Chạy một lần để tạo danh mục biểu mẫu dùng chung và bảng lưu phiếu. */
function setupFormCatalog() {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID), result = ensureDefaultFormTemplates_(ss), templateSheet = result.sheet;
  var requestSheet = ensureFormSheet_(ss, 'PHIEU_BIEU_MAU'), added = result.added;
  SpreadsheetApp.flush();
  return { success: true, added: added, updated: result.updated || 0, templates: Math.max(0, templateSheet.getLastRow() - 1), requests: Math.max(0, requestSheet.getLastRow() - 1), message: 'Đã sẵn sàng DM_BIEU_MAU và PHIEU_BIEU_MAU cùng căn cứ biểu mẫu.' };
}

function formTemplateById_(ss, value) {
  var wanted = key_(value);
  return readSheet_(ss, 'DM_BIEU_MAU').rows.find(function (row) {
    return key_(row.ID_BIEU_MAU) === wanted || key_(row.MA_BIEU_MAU) === wanted;
  }) || null;
}

function saveFormRequest(input) {
  input = input || {};
  var auth = requirePermission_(input._sessionToken, 'BIEU_MAU', 'THEM'), ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  ensureDefaultFormTemplates_(ss);
  var template = formTemplateById_(ss, input.ID_BIEU_MAU);
  if (!template) throw new Error('Biểu mẫu đã chọn không tồn tại trong DM_BIEU_MAU.');
  var employeeCode = String(input.MA_NHAN_VIEN || '').trim(), employee = null;
  if (employeeCode) {
    employee = masterRowByCode_(ss, 'DM_NHAN_VIEN', 'MA_NHAN_VIEN', employeeCode);
    if (!employee) throw new Error('Không tìm thấy nhân viên liên quan.');
  }
  var formDataJson = String(input.DU_LIEU_MAU_JSON || '').trim(), detail = {};
  if (formDataJson.length > 45000) throw new Error('Nội dung mẫu vượt quá giới hạn lưu trữ của một ô Google Sheets.');
  if (formDataJson) {
    try { detail = JSON.parse(formDataJson) || {}; } catch (error) { throw new Error('Dữ liệu chi tiết biểu mẫu không hợp lệ.'); }
  }
  var shared = formSharedFields_(detail.fields || {});
  var sheet = ensureFormSheet_(ss, 'PHIEU_BIEU_MAU'), meta = headers_(sheet), now = new Date(), formDate = input.NGAY_LAP ? parseAttendanceDate_(input.NGAY_LAP, 'Ngày lập') : now;
  var record = {
    ID_PHIEU: 'PH_' + Utilities.getUuid(), ID_BIEU_MAU: template.ID_BIEU_MAU || template.MA_BIEU_MAU || '',
    TEN_BIEU_MAU: template.TEN_BIEU_MAU || '', MA_NHAN_VIEN: employeeCode, HO_VA_TEN: employee && employee.HO_VA_TEN || '',
    NGAY_LAP: formDate, TIEU_DE: String(input.TIEU_DE || '').trim() || template.TEN_BIEU_MAU || '',
    NOI_DUNG: String(input.NOI_DUNG || '').trim(), TRANG_THAI: 'Nháp', NGUOI_TAO: auth.username || auth.email || 'Hệ thống',
    NGAY_TAO: now, NGUOI_DUYET: '', NGAY_DUYET: '', GHI_CHU: String(input.GHI_CHU || '').trim(), DU_LIEU_MAU_JSON: formDataJson
  };
  Object.keys(shared).forEach(function (field) { record[field] = shared[field]; });
  record.LICH_SU = JSON.stringify([formHistoryEntry_(auth, 'Tạo phiếu', 'Lưu nháp')]);
  var rowNumber = appendFormRecord_(sheet, meta, record);
  ['ID_PHIEU', 'ID_BIEU_MAU', 'MA_NHAN_VIEN'].forEach(function (field) { if (meta.columns[field]) sheet.getRange(rowNumber, meta.columns[field]).setNumberFormat('@'); });
  ['NGAY_LAP', 'NGAY_TAO'].forEach(function (field) { if (meta.columns[field]) sheet.getRange(rowNumber, meta.columns[field]).setNumberFormat('dd/MM/yyyy HH:mm'); });
  ['NGAY_HIEU_LUC', 'NGAY_HET_HAN'].forEach(function (field) { if (meta.columns[field] && record[field]) sheet.getRange(rowNumber, meta.columns[field]).setNumberFormat('dd/MM/yyyy'); });
  ['SO_VAN_BAN', 'PHONG_BAN'].forEach(function (field) { if (meta.columns[field]) sheet.getRange(rowNumber, meta.columns[field]).setNumberFormat('@'); });
  writeSystemLog_(ss, auth, 'BIEU_MAU', 'THEM', record.ID_PHIEU, null, record, 'Tạo phiếu biểu mẫu.');
  return { success: true, id: record.ID_PHIEU };
}

/** Tách bộ trường quản lý dùng chung từ dữ liệu biểu mẫu để lọc, nhắc hạn và báo cáo trên Sheet. */
function formSharedFields_(fields) {
  var text = function (key) { var value = fields[key]; if (value && typeof value === 'object') value = value.label || value.value; return String(value == null ? '' : value).trim(); };
  var date = function (key) { var match = text(key).match(/^(\d{4})-(\d{2})-(\d{2})$/); return match ? new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3])) : ''; };
  var amount = Number(text('amount').replace(/[^\d.-]/g, ''));
  return {
    SO_VAN_BAN: text('docNumber'), LOAI_VAN_BAN: text('docType'), PHONG_BAN: text('department'), DOI_TAC: text('partner'),
    NGAY_HIEU_LUC: date('effectiveDate'), NGAY_HET_HAN: date('expiryDate'), GIA_TRI: text('amount') && isFinite(amount) ? amount : '',
    MUC_BAO_MAT: text('confidentiality'), LINK_FILE: text('attachment')
  };
}

function formHistoryEntry_(auth, action, note) {
  return { t: Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'dd/MM/yyyy HH:mm'), u: auth && (auth.username || auth.email) || 'Hệ thống', a: action, n: note || '' };
}

function formRequestFind_(ss, id) {
  var sheet = ensureFormSheet_(ss, 'PHIEU_BIEU_MAU'), meta = headers_(sheet);
  var values = sheet.getLastRow() > 1 ? sheet.getRange(2, 1, sheet.getLastRow() - 1, meta.headers.length).getDisplayValues() : [];
  var index = values.findIndex(function (row) { return key_(row[meta.columns.ID_PHIEU - 1]) === key_(id); });
  if (index === -1) throw new Error('Không tìm thấy phiếu biểu mẫu.');
  return { sheet: sheet, meta: meta, rowNumber: index + 2, data: objectFromRow_(meta, values[index]) };
}

function formHistoryWrite_(found, entry) {
  if (!found.meta.columns.LICH_SU) return;
  var list = [];
  try { list = JSON.parse(String(found.data.LICH_SU || '[]')) || []; } catch (error) { list = []; }
  list.push(entry);
  found.sheet.getRange(found.rowNumber, found.meta.columns.LICH_SU).setValue(JSON.stringify(list.slice(-60)));
}

/** Email: người tạo phiếu và/hoặc các tài khoản có quyền duyệt BIEU_MAU. Lỗi gửi mail không chặn nghiệp vụ. */
function formNotifyEmails_(ss, options) {
  var emails = [];
  authAccountRows_(ss).forEach(function (item) {
    var row = item.data, email = String(row.EMAIL || '').trim();
    if (!email || key_(row.TRANG_THAI) === key_('Ngừng hoạt động')) return;
    if (options.usernames && options.usernames.some(function (name) { return key_(name) === key_(row.TEN_DANG_NHAP) || key_(name) === key_(email); })) emails.push(email);
    else if (options.approvers && (key_(row.MA_VAI_TRO) === 'role-admin' || authCan_(ss, row.MA_VAI_TRO, 'BIEU_MAU', 'DUYET'))) emails.push(email);
  });
  return emails.filter(function (email, index) { return emails.indexOf(email) === index; });
}

function formSendMail_(emails, subject, body) {
  if (!emails.length) return 0;
  try { MailApp.sendEmail({ to: emails.join(','), subject: subject, body: body }); return emails.length; } catch (error) { return 0; }
}

/**
 * Quy trình phiếu: Nháp → Chờ duyệt (trình duyệt) → Đã duyệt / Từ chối; Nháp/Chờ duyệt/Từ chối → Đã hủy.
 * Trình duyệt và hủy cần quyền THEM; duyệt và từ chối cần quyền DUYET.
 */
function updateFormRequestStatus(input) {
  input = input || {};
  var id = String(input.ID_PHIEU || '').trim(), status = String(input.TRANG_THAI || '').trim(), reason = String(input.LY_DO || '').trim();
  var rules = {
    'Chờ duyệt': { action: 'THEM', from: ['Nháp', 'Từ chối'], label: 'Trình duyệt' },
    'Đã duyệt': { action: 'DUYET', from: ['Nháp', 'Chờ duyệt'], label: 'Duyệt / ký' },
    'Từ chối': { action: 'DUYET', from: ['Nháp', 'Chờ duyệt'], label: 'Từ chối' },
    'Đã hủy': { action: 'THEM', from: ['Nháp', 'Chờ duyệt', 'Từ chối'], label: 'Hủy phiếu' }
  }, rule = rules[status];
  if (!id) throw new Error('Thiếu phiếu biểu mẫu cần xử lý.');
  if (!rule) throw new Error('Trạng thái phiếu không hợp lệ.');
  var auth = requirePermission_(input._sessionToken, 'BIEU_MAU', rule.action), ss = SpreadsheetApp.openById(SPREADSHEET_ID), found = formRequestFind_(ss, id);
  var current = String(found.data.TRANG_THAI || 'Nháp').trim() || 'Nháp';
  if (rule.from.map(key_).indexOf(key_(current)) === -1) throw new Error('Phiếu đang ở trạng thái "' + current + '", không thể chuyển sang "' + status + '".');
  var sheet = found.sheet, meta = found.meta, rowNumber = found.rowNumber, before = found.data, now = new Date();
  if (meta.columns.TRANG_THAI) sheet.getRange(rowNumber, meta.columns.TRANG_THAI).setValue(status);
  if (rule.action === 'DUYET') {
    if (meta.columns.NGUOI_DUYET) sheet.getRange(rowNumber, meta.columns.NGUOI_DUYET).setValue(auth.username || auth.email || 'Hệ thống');
    if (meta.columns.NGAY_DUYET) sheet.getRange(rowNumber, meta.columns.NGAY_DUYET).setValue(now).setNumberFormat('dd/MM/yyyy HH:mm');
  }
  if (meta.columns.GHI_CHU && Object.prototype.hasOwnProperty.call(input, 'GHI_CHU')) sheet.getRange(rowNumber, meta.columns.GHI_CHU).setValue(String(input.GHI_CHU || '').trim());
  formHistoryWrite_(found, formHistoryEntry_(auth, rule.label, reason));
  var after = objectFromRow_(meta, sheet.getRange(rowNumber, 1, 1, meta.headers.length).getDisplayValues()[0]);
  writeSystemLog_(ss, auth, 'BIEU_MAU', rule.action, id, before, after, rule.label + (reason ? ': ' + reason : '') + '.');
  var title = (before.TIEU_DE || before.TEN_BIEU_MAU || 'Phiếu biểu mẫu') + (before.SO_VAN_BAN ? ' (' + before.SO_VAN_BAN + ')' : ''), sent = 0;
  if (status === 'Chờ duyệt') sent = formSendMail_(formNotifyEmails_(ss, { approvers: true }), '[PHI LONG HR] Phiếu chờ duyệt: ' + title, (auth.displayName || auth.username || 'Người dùng') + ' đã trình duyệt phiếu "' + title + '".\nVui lòng mở PHI LONG HR > Biểu mẫu để xem và duyệt.');
  if (status === 'Đã duyệt' || status === 'Từ chối') sent = formSendMail_(formNotifyEmails_(ss, { usernames: [before.NGUOI_TAO] }), '[PHI LONG HR] Phiếu ' + status.toLowerCase() + ': ' + title, 'Phiếu "' + title + '" đã được ' + status.toLowerCase() + ' bởi ' + (auth.displayName || auth.username || '') + '.' + (reason ? '\nLý do: ' + reason : ''));
  return { success: true, notified: sent };
}

function formDriveFolder_(moduleName) {
  var store = PropertiesService.getScriptProperties(), rootId = store.getProperty('FORM_DRIVE_FOLDER_ID'), root = null;
  if (rootId) { try { root = DriveApp.getFolderById(rootId); } catch (error) { root = null; } }
  if (!root) { root = DriveApp.createFolder(FORM_DRIVE_FOLDER_NAME); store.setProperty('FORM_DRIVE_FOLDER_ID', root.getId()); }
  var name = String(moduleName || 'Khác').trim() || 'Khác', folders = root.getFoldersByName(name);
  return folders.hasNext() ? folders.next() : root.createFolder(name);
}

/** Ký → PDF → lưu Drive: chỉ cho phiếu đã duyệt; HTML do trình duyệt dựng từ đúng mẫu in. */
function saveFormPdf(input) {
  input = input || {};
  var auth = requirePermission_(input._sessionToken, 'BIEU_MAU', 'THEM'), id = String(input.ID_PHIEU || '').trim(), html = String(input.HTML || '');
  if (!id) throw new Error('Thiếu phiếu biểu mẫu cần lưu PDF.');
  if (!html || html.length > 2000000) throw new Error('Nội dung in không hợp lệ hoặc quá lớn.');
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID), found = formRequestFind_(ss, id), row = found.data;
  if (key_(row.TRANG_THAI) !== key_('Đã duyệt')) throw new Error('Chỉ lưu PDF cho phiếu đã duyệt.');
  var template = formTemplateById_(ss, row.ID_BIEU_MAU) || {}, folder = formDriveFolder_(template.PHAN_HE || FORM_TEMPLATE_MODULES[row.ID_BIEU_MAU]);
  var name = [row.SO_VAN_BAN, row.TIEU_DE || row.TEN_BIEU_MAU, row.NGAY_LAP].filter(function (part) { return String(part || '').trim(); }).join(' - ').replace(/[\\/:*?"<>|]+/g, '-').slice(0, 150) || id;
  var pdf = Utilities.newBlob(html, 'text/html', name + '.html').getAs('application/pdf').setName(name + '.pdf'), file = folder.createFile(pdf), now = new Date();
  if (found.meta.columns.LINK_PDF) found.sheet.getRange(found.rowNumber, found.meta.columns.LINK_PDF).setValue(file.getUrl());
  if (found.meta.columns.NGAY_LUU_PDF) found.sheet.getRange(found.rowNumber, found.meta.columns.NGAY_LUU_PDF).setValue(now).setNumberFormat('dd/MM/yyyy HH:mm');
  formHistoryWrite_(found, formHistoryEntry_(auth, 'Lưu PDF Drive', folder.getName() + '/' + file.getName()));
  writeSystemLog_(ss, auth, 'BIEU_MAU', 'THEM', id, row, { LINK_PDF: file.getUrl() }, 'Lưu PDF phiếu biểu mẫu vào Google Drive.');
  return { success: true, url: file.getUrl(), name: file.getName() };
}

/** Chạy hằng ngày (cài bằng setupFormReminderTrigger): email nhắc phiếu sắp/đã hết hạn, mỗi phiếu nhắc 1 lần/ngày hết hạn. */
function remindFormExpiry() {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID), sheet = ensureFormSheet_(ss, 'PHIEU_BIEU_MAU'), meta = headers_(sheet);
  if (sheet.getLastRow() < 2 || !meta.columns.NGAY_HET_HAN) return { success: true, reminded: 0 };
  var values = sheet.getRange(2, 1, sheet.getLastRow() - 1, meta.headers.length).getValues(), today = new Date(), reminded = 0;
  today.setHours(0, 0, 0, 0);
  values.forEach(function (values_, index) {
    var row = objectFromRow_(meta, values_), expiry = row.NGAY_HET_HAN instanceof Date ? row.NGAY_HET_HAN : null;
    if (!expiry || ['Đã hủy', 'Từ chối'].map(key_).indexOf(key_(row.TRANG_THAI)) !== -1) return;
    var left = Math.round((new Date(expiry.getFullYear(), expiry.getMonth(), expiry.getDate()) - today) / 86400000), marker = Utilities.formatDate(expiry, Session.getScriptTimeZone(), 'dd/MM/yyyy');
    if (left > FORM_REMIND_DAYS || String(row.DA_NHAC_HAN || '').indexOf(marker) !== -1) return;
    var title = (row.TIEU_DE || row.TEN_BIEU_MAU || 'Phiếu') + (row.SO_VAN_BAN ? ' (' + row.SO_VAN_BAN + ')' : '');
    var sent = formSendMail_(formNotifyEmails_(ss, { usernames: [row.NGUOI_TAO], approvers: true }), '[PHI LONG HR] Nhắc hạn: ' + title, 'Văn bản "' + title + '" ' + (left < 0 ? 'đã hết hạn ' + (-left) + ' ngày' : left === 0 ? 'hết hạn hôm nay' : 'còn ' + left + ' ngày nữa hết hạn') + ' (ngày hết hạn ' + marker + ').' + (row.DOI_TAC ? '\nĐối tác: ' + row.DOI_TAC : ''));
    if (!sent) return;
    var found = { sheet: sheet, meta: meta, rowNumber: index + 2, data: row };
    if (meta.columns.DA_NHAC_HAN) sheet.getRange(index + 2, meta.columns.DA_NHAC_HAN).setValue(marker + ' · ' + Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'dd/MM/yyyy HH:mm'));
    formHistoryWrite_(found, formHistoryEntry_(null, 'Nhắc hạn', 'Đã gửi email cho ' + sent + ' người'));
    reminded++;
  });
  return { success: true, reminded: reminded };
}

/** Chạy một lần trong trình sửa Apps Script để cài lịch nhắc hạn lúc 8 giờ sáng mỗi ngày. */
function setupFormReminderTrigger() {
  ScriptApp.getProjectTriggers().forEach(function (trigger) { if (trigger.getHandlerFunction() === 'remindFormExpiry') ScriptApp.deleteTrigger(trigger); });
  ScriptApp.newTrigger('remindFormExpiry').timeBased().everyDays(1).atHour(8).create();
  return { success: true, message: 'Đã cài nhắc hạn biểu mẫu lúc 8 giờ sáng hằng ngày.' };
}

function setupAttendanceData() {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  Object.keys(ATTENDANCE_SHEET_HEADERS).forEach(function (name) { ensureAttendanceSheet_(ss, name); });
  SpreadsheetApp.flush();
  return { success: true, message: 'Đã sẵn sàng dữ liệu Chấm công – Nghỉ phép.' };
}

function parseAttendanceDate_(value, label) {
  var text = String(value == null ? '' : value).trim();
  var match = text.match(/^(\d{4})-(\d{2})-(\d{2})$/) || text.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!match) throw new Error((label || 'Ngày') + ' không hợp lệ.');
  var year = match.length === 4 && match[1].length === 4 ? Number(match[1]) : Number(match[3]);
  var month = match.length === 4 && match[1].length === 4 ? Number(match[2]) : Number(match[2]);
  var day = match.length === 4 && match[1].length === 4 ? Number(match[3]) : Number(match[1]);
  var date = new Date(year, month - 1, day);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) throw new Error((label || 'Ngày') + ' không tồn tại.');
  return date;
}

function dateKey_(value) {
  var date = value instanceof Date ? value : parseAttendanceDate_(value, 'Ngày');
  return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, '0'), String(date.getDate()).padStart(2, '0')].join('-');
}

function saveLeaveRequest(input) {
  input = input || {};
  var auth = requirePermission_(input._sessionToken, 'NGHI_PHEP', 'THEM');
  var employeeCode = String(input.MA_NHAN_VIEN || '').trim();
  var leaveType = String(input.LOAI_NGHI || '').trim();
  var halfDay = String(input.BUOI_NGHI || 'Cả ngày').trim();
  if (!employeeCode) throw new Error('Vui lòng chọn nhân viên.');
  if (!leaveType) throw new Error('Vui lòng chọn loại nghỉ.');
  var fromDate = parseAttendanceDate_(input.TU_NGAY, 'Từ ngày');
  var toDate = parseAttendanceDate_(input.DEN_NGAY, 'Đến ngày');
  if (toDate.getTime() < fromDate.getTime()) throw new Error('Đến ngày phải bằng hoặc sau Từ ngày.');
  if (halfDay !== 'Cả ngày' && dateKey_(fromDate) !== dateKey_(toDate)) throw new Error('Nghỉ buổi chỉ áp dụng cho một ngày.');
  var lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try {
    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    var employee = masterRowByCode_(ss, 'DM_NHAN_VIEN', 'MA_NHAN_VIEN', employeeCode);
    if (!employee) throw new Error('Không tìm thấy nhân viên đã chọn.');
    var sheet = ensureAttendanceSheet_(ss, 'CC_NGHI_PHEP');
    var existing = readSheet_(ss, 'CC_NGHI_PHEP').rows;
    var fromKey = dateKey_(fromDate), toKey = dateKey_(toDate);
    var overlap = existing.some(function (row) {
      var status = plain_(row.TRANG_THAI);
      if (key_(row.MA_NHAN_VIEN) !== key_(employeeCode) || status.indexOf('tu choi') !== -1 || status.indexOf('huy') !== -1) return false;
      try {
        var rowFrom = dateKey_(row.TU_NGAY), rowTo = dateKey_(row.DEN_NGAY);
        return rowFrom <= toKey && rowTo >= fromKey;
      } catch (error) {
        return false;
      }
    });
    if (overlap) throw new Error('Nhân viên đã có đơn nghỉ trong khoảng thời gian này.');
    var meta = headers_(sheet), days = Math.round((toDate.getTime() - fromDate.getTime()) / 86400000) + 1;
    if (halfDay !== 'Cả ngày') days = 0.5;
    var actor = auth.username || auth.email || 'Hệ thống';
    var record = { ID_DON_NGHI:'NP_'+Utilities.getUuid(), MA_NHAN_VIEN:employeeCode, HO_VA_TEN:employee.HO_VA_TEN||'', LOAI_NGHI:leaveType, TU_NGAY:fromDate, DEN_NGAY:toDate, BUOI_NGHI:halfDay, SO_NGAY_NGHI:days, LY_DO:String(input.LY_DO||'').trim(), TEP_DINH_KEM:String(input.TEP_DINH_KEM||'').trim(), TRANG_THAI:'Chờ duyệt', NGUOI_TAO:actor, NGAY_TAO:new Date(), NGUOI_DUYET:'', NGAY_DUYET:'', GHI_CHU_DUYET:'' };
    var rowNumber = Math.max(2, sheet.getLastRow() + 1);
    sheet.getRange(rowNumber, 1, 1, meta.headers.length).setValues([meta.headers.map(function (header) { return header ? (record[header] == null ? '' : record[header]) : ''; })]);
    ['ID_DON_NGHI', 'MA_NHAN_VIEN'].forEach(function (field) { if (meta.columns[field]) sheet.getRange(rowNumber, meta.columns[field]).setNumberFormat('@'); });
    ['TU_NGAY', 'DEN_NGAY'].forEach(function (field) { if (meta.columns[field]) sheet.getRange(rowNumber, meta.columns[field]).setNumberFormat('dd/MM/yyyy'); });
    if (meta.columns.NGAY_TAO) sheet.getRange(rowNumber, meta.columns.NGAY_TAO).setNumberFormat('dd/MM/yyyy HH:mm');
    writeSystemLog_(ss, auth, 'NGHI_PHEP', 'THEM', record.ID_DON_NGHI, null, record, 'Tạo đơn nghỉ.');
    return { success:true, id:record.ID_DON_NGHI };
  } finally {
    lock.releaseLock();
  }
}

function updateLeaveRequestStatus(input) {
  input = input || {};
  var auth = requirePermission_(input._sessionToken, 'NGHI_PHEP', 'DUYET');
  var id = String(input.ID_DON_NGHI || '').trim(), status = String(input.TRANG_THAI || '').trim();
  if (!id) throw new Error('Thiếu đơn nghỉ cần xử lý.');
  if (['Đã duyệt', 'Từ chối', 'Đã hủy'].indexOf(status) === -1) throw new Error('Trạng thái đơn nghỉ không hợp lệ.');
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID), sheet = ensureAttendanceSheet_(ss, 'CC_NGHI_PHEP'), meta = headers_(sheet);
  var values = sheet.getLastRow() > 1 ? sheet.getRange(2, 1, sheet.getLastRow() - 1, meta.headers.length).getDisplayValues() : [];
  var index = values.findIndex(function (row) { return key_(row[meta.columns.ID_DON_NGHI - 1]) === key_(id); });
  if (index === -1) throw new Error('Không tìm thấy đơn nghỉ.');
  var rowNumber = index + 2, actor = auth.username || auth.email || 'Hệ thống', before = objectFromRow_(meta, values[index]);
  sheet.getRange(rowNumber, meta.columns.TRANG_THAI).setValue(status);
  if (meta.columns.NGUOI_DUYET) sheet.getRange(rowNumber, meta.columns.NGUOI_DUYET).setValue(actor);
  if (meta.columns.NGAY_DUYET) sheet.getRange(rowNumber, meta.columns.NGAY_DUYET).setValue(new Date()).setNumberFormat('dd/MM/yyyy HH:mm');
  if (meta.columns.GHI_CHU_DUYET) sheet.getRange(rowNumber, meta.columns.GHI_CHU_DUYET).setValue(String(input.GHI_CHU_DUYET || '').trim());
  var after = objectFromRow_(meta, sheet.getRange(rowNumber, 1, 1, meta.headers.length).getDisplayValues()[0]);
  writeSystemLog_(ss, auth, 'NGHI_PHEP', 'DUYET', id, before, after, 'Cập nhật trạng thái đơn nghỉ.');
  return { success:true };
}

function workHistoryType_(before, after) {
  if (key_(before.MA_PHONG_BAN) !== key_(after.MA_PHONG_BAN)) return 'Điều chuyển phòng ban';
  if (key_(before.MA_BO_PHAN) !== key_(after.MA_BO_PHAN)) return 'Điều chuyển bộ phận';
  if (key_(before.MA_NHOM) !== key_(after.MA_NHOM)) return 'Điều chuyển nhóm';
  if (key_(before.MA_CHUC_VU) !== key_(after.MA_CHUC_VU)) return 'Thay đổi chức vụ';
  if (key_(before.TRANG_THAI) !== key_(after.TRANG_THAI)) {
    if (plain_(after.TRANG_THAI).indexOf('nghi viec') !== -1) return 'Nghỉ việc';
    if (plain_(before.TRANG_THAI).indexOf('nghi viec') !== -1) return 'Quay lại làm việc';
    if (plain_(after.TRANG_THAI).indexOf('tam nghi') !== -1) return 'Tạm nghỉ';
    return 'Cập nhật trạng thái';
  }
  return '';
}

function appendWorkHistory_(ss, before, after, input, auth) {
  var type = workHistoryType_(before, after);
  if (!type) return false;
  var sheet = ensureWorkHistorySheet_(ss);
  var meta = headers_(sheet);
  var now = new Date();
  var effective = String(input.NGAY_HIEU_LUC || '').trim() ? parseAttendanceDate_(input.NGAY_HIEU_LUC, 'Ngày hiệu lực') : now;
  var actor = auth && (auth.username || auth.email) || Session.getActiveUser().getEmail() || 'Hệ thống';
  var record = {
    ID_LICH_SU: 'LS_' + Utilities.getUuid(),
    MA_NHAN_VIEN: after.MA_NHAN_VIEN || before.MA_NHAN_VIEN || '',
    HO_VA_TEN: after.HO_VA_TEN || before.HO_VA_TEN || '',
    NGAY_HIEU_LUC: effective,
    LOAI_BIEN_DONG: type,
    MA_PHONG_BAN_CU: before.MA_PHONG_BAN || '', MA_BO_PHAN_CU: before.MA_BO_PHAN || '',
    MA_NHOM_CU: before.MA_NHOM || '', MA_CHUC_VU_CU: before.MA_CHUC_VU || '',
    MA_PHONG_BAN_MOI: after.MA_PHONG_BAN || '', MA_BO_PHAN_MOI: after.MA_BO_PHAN || '',
    MA_NHOM_MOI: after.MA_NHOM || '', MA_CHUC_VU_MOI: after.MA_CHUC_VU || '',
    TRANG_THAI_CU: before.TRANG_THAI || '', TRANG_THAI_MOI: after.TRANG_THAI || '',
    SO_QUYET_DINH: String(input.SO_QUYET_DINH || '').trim(),
    GHI_CHU: String(input.GHI_CHU_LICH_SU || '').trim(),
    NGUOI_TAO: actor, NGAY_TAO: now, TRANG_THAI: 'Đã ghi nhận'
  };
  var rowNumber = Math.max(2, sheet.getLastRow() + 1);
  var values = meta.headers.map(function (header) { return header ? (record[header] == null ? '' : record[header]) : ''; });
  sheet.getRange(rowNumber, 1, 1, meta.headers.length).setValues([values]);
  ['ID_LICH_SU', 'MA_NHAN_VIEN', 'SO_QUYET_DINH'].forEach(function (field) {
    if (meta.columns[field]) sheet.getRange(rowNumber, meta.columns[field]).setNumberFormat('@');
  });
  ['NGAY_HIEU_LUC', 'NGAY_TAO'].forEach(function (field) {
    if (meta.columns[field]) sheet.getRange(rowNumber, meta.columns[field]).setNumberFormat('dd/MM/yyyy HH:mm');
  });
  return true;
}

function saveTransferProposal(input) {
  input = input || {};
  var auth = requirePermission_(input._sessionToken, 'LUAN_CHUYEN', 'THEM');
  var code = String(input.MA_NHAN_VIEN || '').trim();
  if (!code) throw new Error('Vui lòng chọn nhân viên.');
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var employeeSheet = ss.getSheetByName('DM_NHAN_VIEN');
  if (!employeeSheet) throw new Error('Không tìm thấy sheet DM_NHAN_VIEN.');
  var employeeMeta = headers_(employeeSheet);
  var values = employeeSheet.getDataRange().getDisplayValues();
  var row = values.slice(1).map(function (r, i) { return { row: r, number: i + 2 }; }).filter(function (item) { return key_(item.row[employeeMeta.columns.MA_NHAN_VIEN - 1]) === key_(code); })[0];
  if (!row) throw new Error('Không tìm thấy nhân viên.');
  var before = objectFromRow_(employeeMeta, row.row), sheet = ensureWorkHistorySheet_(ss), meta = headers_(sheet), now = new Date();
  var record = { ID_LICH_SU:'LS_'+Utilities.getUuid(), MA_NHAN_VIEN:before.MA_NHAN_VIEN, HO_VA_TEN:before.HO_VA_TEN, NGAY_HIEU_LUC:(String(input.NGAY_HIEU_LUC||'').trim()?parseAttendanceDate_(input.NGAY_HIEU_LUC,'Ngày hiệu lực'):now), LOAI_BIEN_DONG:'Đề xuất điều chuyển', MA_PHONG_BAN_CU:before.MA_PHONG_BAN||'', MA_BO_PHAN_CU:before.MA_BO_PHAN||'', MA_NHOM_CU:before.MA_NHOM||'', MA_CHUC_VU_CU:before.MA_CHUC_VU||'', MA_PHONG_BAN_MOI:input.MA_PHONG_BAN||'', MA_BO_PHAN_MOI:input.MA_BO_PHAN||'', MA_NHOM_MOI:before.MA_NHOM||'', MA_CHUC_VU_MOI:input.MA_CHUC_VU||'', SO_QUYET_DINH:input.SO_QUYET_DINH||'', GHI_CHU:input.GHI_CHU_LICH_SU||'', NGUOI_TAO:auth.username||auth.email||'Hệ thống', NGAY_TAO:now, TRANG_THAI:'Chờ duyệt' };
  sheet.getRange(Math.max(2,sheet.getLastRow()+1),1,1,meta.headers.length).setValues([meta.headers.map(function(h){return h ? (record[h]||'') : '';})]);
  writeSystemLog_(ss, auth, 'LUAN_CHUYEN', 'THEM', record.ID_LICH_SU, null, record, 'Tạo đề xuất điều chuyển.');
  return { success:true };
}

/** Chạy một lần để tạo danh mục Phòng ban → Bộ phận → Nhóm, không xóa dữ liệu cũ. */
function setupOrganizationHierarchy() {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var definitions = {
    DM_BO_PHAN: ['ID_BO_PHAN', 'MA_BO_PHAN', 'TEN_BO_PHAN', 'MA_PHONG_BAN', 'TRANG_THAI', 'GHI_CHU', 'NGAY_CAP_NHAT'],
    DM_NHOM: ['ID_NHOM', 'MA_NHOM', 'TEN_NHOM', 'MA_BO_PHAN', 'TRANG_THAI', 'GHI_CHU', 'NGAY_CAP_NHAT']
  };
  var created = [];
  Object.keys(definitions).forEach(function (name) {
    var sheet = ss.getSheetByName(name);
    if (!sheet) {
      sheet = ss.insertSheet(name);
      created.push(name);
    }
    ensureColumns_(sheet, definitions[name]);
    sheet.setFrozenRows(1);
  });
  var employees = ss.getSheetByName('DM_NHAN_VIEN');
  if (!employees) throw new Error('Không tìm thấy sheet DM_NHAN_VIEN.');
  ensureColumns_(employees, ['MA_BO_PHAN', 'MA_NHOM']);
  SpreadsheetApp.flush();
  return {
    success: true,
    createdSheets: created,
    message: 'Đã sẵn sàng danh mục DM_BO_PHAN, DM_NHOM và hai cột liên kết trong DM_NHAN_VIEN.'
  };
}

function readSheet_(ss, name) {
  var sheet = ss.getSheetByName(name);
  if (!sheet) return { headers: [], rows: [], missing: true };
  var values = sheet.getDataRange().getDisplayValues();
  if (!values.length) return { headers: [], rows: [], meta: { headers: [], columns: {} } };
  var meta = headersFromRow_(values[0]);
  if (values.length < 2) return { headers: meta.headers.filter(String), rows: [], meta: meta };
  var rows = values.slice(1).filter(function (row) {
    return row.some(function (value) { return String(value || '').trim() !== ''; });
  }).map(function (row) {
    var item = {};
    meta.headers.forEach(function (header, index) {
      if (header) item[header] = row[index] || '';
    });
    return item;
  });
  return { headers: meta.headers.filter(String), rows: rows, meta: meta };
}

function requestedDataSheets_(names) {
  if (!Array.isArray(names) || !names.length) return APP_BOOTSTRAP_SHEETS.slice();
  var allowed = {}, seen = {}, result = [];
  DATA_SHEETS.forEach(function (name) { allowed[name] = true; });
  names.forEach(function (name) {
    var value = String(name || '').trim();
    if (allowed[value] && !seen[value]) { seen[value] = true; result.push(value); }
  });
  return result.length ? result : APP_BOOTSTRAP_SHEETS.slice();
}

function getAppData(input) {
  var isRequest = input && typeof input === 'object', sessionToken = isRequest ? input._sessionToken : input;
  var auth = requireAuth_(sessionToken), requested = isRequest ? requestedDataSheets_(input.sheets) : DATA_SHEETS.slice();
  var data = {};
  try {
    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    if (requested.indexOf('DM_BIEU_MAU') !== -1 || requested.indexOf('PHIEU_BIEU_MAU') !== -1) {
      // Bổ sung mẫu mặc định theo kiểu không phá dữ liệu cũ khi mở chức năng Biểu mẫu.
      ensureDefaultFormTemplates_(ss);
      ensureFormSheet_(ss, 'PHIEU_BIEU_MAU');
    }
    requested.forEach(function (name) {
      try {
        data[name] = readSheet_(ss, name);
      } catch (error) {
        // Một danh mục lỗi không được làm danh bạ nhân viên ngừng chạy.
        data[name] = { headers: [], rows: [], error: String(error && error.message || error) };
      }
    });
  } catch (error) {
    var message = String(error && error.message || error);
    data.DM_NHAN_VIEN = {
      headers: [],
      rows: [],
      error: 'Không mở được bảng dữ liệu. Hãy triển khai Web App với mục “Thực thi ứng dụng với tư cách: Tôi” và cấp quyền cho Apps Script. Chi tiết: ' + message
    };
  }
  var level = sensitiveLevel_(auth.roleCode);
  if (data.DM_NHAN_VIEN && Array.isArray(data.DM_NHAN_VIEN.rows) && level < 2) {
    var hidden = hiddenEmployeeFields_(level);
    data.DM_NHAN_VIEN.rows = data.DM_NHAN_VIEN.rows.map(function (row) { return stripEmployeeRow_(row, level); });
    if (Array.isArray(data.DM_NHAN_VIEN.headers)) data.DM_NHAN_VIEN.headers = data.DM_NHAN_VIEN.headers.filter(function (header) { return !isFieldInList_(header, hidden); });
    delete data.DM_NHAN_VIEN.meta;
  }
  if (key_(auth.roleCode) === 'role-user' && auth.employeeCode) {
    Object.keys(data).forEach(function (name) {
      if (!data[name] || !Array.isArray(data[name].rows)) return;
      data[name].rows = data[name].rows.filter(function (row) {
        return !Object.prototype.hasOwnProperty.call(row, 'MA_NHAN_VIEN') || key_(row.MA_NHAN_VIEN) === key_(auth.employeeCode);
      });
    });
  }
  return data;
}

/** Chạy hàm này một lần trong Apps Script để kiểm tra kết nối bảng dữ liệu. */
function testConnection() {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ss.getSheetByName('DM_NHAN_VIEN');
  if (!sheet) throw new Error('Không tìm thấy sheet DM_NHAN_VIEN trong bảng dữ liệu.');
  return {
    success: true,
    spreadsheet: ss.getName(),
    sheet: sheet.getName(),
    rows: Math.max(0, sheet.getLastRow() - 1),
    message: 'Kết nối dữ liệu thành công.'
  };
}

function getEmployeeByKey(code, sessionToken) {
  var auth = requirePermission_(sessionToken, 'NHAN_SU', 'XEM');
  var rows = readSheet_(SpreadsheetApp.openById(SPREADSHEET_ID), 'DM_NHAN_VIEN').rows;
  var wanted = key_(code);
  var found = rows.find(function (row) {
    return key_(row.MA_NHAN_VIEN) === wanted || key_(row.ID_NHAN_VIEN) === wanted;
  }) || null;
  return stripEmployeeRow_(found, sensitiveLevel_(auth.roleCode));
}

function saveEmployee(input) {
  return writeEmployee_(input, false);
}

function updateEmployee(input) {
  return writeEmployee_(input, true);
}

function writeEmployee_(input, editing) {
  input = input || {};
  var auth = requirePermission_(input._sessionToken, 'NHAN_SU', editing ? 'SUA' : 'THEM');
  if (!String(input.HO_VA_TEN || '').trim()) throw new Error('Vui lòng nhập họ và tên.');
  // R72: tài khoản không đủ cấp thì bỏ qua cột nhạy cảm, giữ nguyên giá trị đang có trong Sheet.
  hiddenEmployeeFields_(sensitiveLevel_(auth.roleCode)).forEach(function (field) { delete input[field]; });
  if (Object.prototype.hasOwnProperty.call(input, 'TRANG_THAI') && String(input.TRANG_THAI || '').trim() && EMPLOYEE_STATUS_VALUES.indexOf(String(input.TRANG_THAI).trim()) === -1) {
    throw new Error('Trạng thái nhân viên không hợp lệ.');
  }
  if (String(input.EMAIL || '').trim() && !/^[^@\s,]+@[^@\s,]+\.[A-Za-z.]{2,}$/.test(String(input.EMAIL).trim())) throw new Error('Email chưa đúng định dạng.');
  var lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try {
    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    var sheet = ss.getSheetByName('DM_NHAN_VIEN');
    if (!sheet) throw new Error('Không tìm thấy sheet DM_NHAN_VIEN.');
    var meta = headers_(sheet);
    if (!meta.columns.MA_NHAN_VIEN || !meta.columns.HO_VA_TEN) {
      throw new Error('DM_NHAN_VIEN phải có cột MA_NHAN_VIEN và HO_VA_TEN.');
    }
    if (Object.prototype.hasOwnProperty.call(input, 'ANH_DAI_DIEN') && !meta.columns.ANH_DAI_DIEN) {
      throw new Error('DM_NHAN_VIEN chưa có cột ANH_DAI_DIEN để lưu ảnh đại diện.');
    }
    if (Object.prototype.hasOwnProperty.call(input, 'MA_PHONG_BAN')) {
      input.MA_PHONG_BAN = requireMasterCode_(ss, 'DM_PHONG_BAN', 'MA_PHONG_BAN', input.MA_PHONG_BAN, 'phòng ban');
    }
    if (Object.prototype.hasOwnProperty.call(input, 'MA_CHUC_VU') && String(input.MA_CHUC_VU || '').trim()) {
      input.MA_CHUC_VU = requireMasterCode_(ss, 'DM_CHUC_VU', 'MA_CHUC_VU', input.MA_CHUC_VU, 'chức vụ');
    }
    if (Object.prototype.hasOwnProperty.call(input, 'MA_BO_PHAN') && String(input.MA_BO_PHAN || '').trim()) {
      input.MA_BO_PHAN = requireMasterCode_(ss, 'DM_BO_PHAN', 'MA_BO_PHAN', input.MA_BO_PHAN, 'bộ phận');
    }
    if (Object.prototype.hasOwnProperty.call(input, 'MA_NHOM') && String(input.MA_NHOM || '').trim()) {
      input.MA_NHOM = requireMasterCode_(ss, 'DM_NHOM', 'MA_NHOM', input.MA_NHOM, 'nhóm');
    }
    if (input.MA_BO_PHAN && input.MA_PHONG_BAN) {
      var unit = masterRowByCode_(ss, 'DM_BO_PHAN', 'MA_BO_PHAN', input.MA_BO_PHAN);
      if (!unit || key_(unit.MA_PHONG_BAN) !== key_(input.MA_PHONG_BAN)) {
        throw new Error('Bộ phận đã chọn không thuộc phòng ban đã chọn.');
      }
    }
    if (input.MA_NHOM && input.MA_BO_PHAN) {
      var team = masterRowByCode_(ss, 'DM_NHOM', 'MA_NHOM', input.MA_NHOM);
      if (!team || key_(team.MA_BO_PHAN) !== key_(input.MA_BO_PHAN)) {
        throw new Error('Nhóm đã chọn không thuộc bộ phận đã chọn.');
      }
    }
    var code = String(input._originalCode || '').trim();
    var rowNumber;
    var before = null;
    var rowValues;
    var currentFormulas = [];
    var lastRow = sheet.getLastRow();
    var displayCodes = lastRow > 1
      ? sheet.getRange(2, meta.columns.MA_NHAN_VIEN, lastRow - 1, 1).getDisplayValues().map(function (row) { return row[0]; })
      : [];

    if (editing) {
      if (!code) throw new Error('Thiếu mã nhân viên cần sửa.');
      var matches = [];
      displayCodes.forEach(function (item, index) {
        if (key_(item) === key_(code)) matches.push(index + 2);
      });
      if (matches.length !== 1) {
        throw new Error(matches.length ? 'Mã nhân viên bị trùng, không thể xác định bản ghi cần sửa.' : 'Không tìm thấy nhân viên cần sửa.');
      }
      rowNumber = matches[0];
      var currentRange = sheet.getRange(rowNumber, 1, 1, meta.headers.length);
      before = objectFromRow_(meta, currentRange.getDisplayValues()[0]);
      rowValues = currentRange.getValues()[0];
      currentFormulas = currentRange.getFormulas()[0];
    } else {
      var max = displayCodes.reduce(function (current, item) {
        var match = String(item).match(/^NV(\d+)$/i);
        return match ? Math.max(current, Number(match[1])) : current;
      }, 0);
      code = 'NV' + String(max + 1).padStart(3, '0');
      var newIdNumber = max + 1;
      rowNumber = Math.max(2, lastRow + 1);
      rowValues = [];
      for (var blankIndex = 0; blankIndex < meta.headers.length; blankIndex++) rowValues.push('');
    }

    var fields = ['HO_VA_TEN', 'GIOI_TINH', 'NGAY_SINH', 'QUOC_TICH', 'SO_CCCD', 'NGAY_CAP', 'SO_DIEN_THOAI', 'EMAIL', 'DIA_CHI', 'GHI_CHU', 'MA_PHONG_BAN', 'MA_BO_PHAN', 'MA_NHOM', 'MA_CHUC_VU', 'NGAY_VAO_LAM', 'TRANG_THAI', 'ANH_DAI_DIEN', 'LOAI_HD', 'NOI_LAM_VIEC', 'MA_SO_BHXH', 'NGAY_THAM_GIA_BHXH', 'LUONG_CO_BAN', 'THOI_DIEM_CHAM_DUT_HD_VA_LY_DO'];
    var touchedFields = {};
    fields.forEach(function (field) {
      var column = headerColumn_(meta, field);
      if (!Object.prototype.hasOwnProperty.call(input, field) || !column) return;
      touchedFields[meta.headers[column - 1]] = true;
      var value = String(input[field] == null ? '' : input[field]).trim();
      if (field === 'LUONG_CO_BAN') {
        var digits = value.replace(/[^\d]/g, '');
        value = digits ? Number(digits) : '';
      } else if (field === 'ANH_DAI_DIEN') {
        value = normalizeEmployeeImage_(value);
      } else if (/^NGAY_/.test(field) && value) {
        var parts = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
        if (!parts) throw new Error('Ngày không hợp lệ: ' + field + '.');
        var date = new Date(Number(parts[1]), Number(parts[2]) - 1, Number(parts[3]));
        if (date.getFullYear() !== Number(parts[1]) || date.getMonth() !== Number(parts[2]) - 1 || date.getDate() !== Number(parts[3])) throw new Error('Ngày không tồn tại: ' + field + '.');
        value = date;
      } else {
        value = value.charAt(0) === '=' ? "'" + value : value;
      }
      rowValues[column - 1] = value;
    });
    // R72: đồng bộ các cột tên (TEN_*) theo mã danh mục vừa chọn, không ghi đè nếu cột đó là công thức.
    [['MA_PHONG_BAN', 'TEN_PHONG_BAN', 'DM_PHONG_BAN', 'TEN_PHONG_BAN'], ['MA_BO_PHAN', 'TEN_MA_BO_PHAN', 'DM_BO_PHAN', 'TEN_BO_PHAN'], ['MA_CHUC_VU', 'TEN_MA_CHUC_VU', 'DM_CHUC_VU', 'TEN_CHUC_VU'], ['MA_NHOM', 'TEN_MA_NHOM', 'DM_NHOM', 'TEN_NHOM']].forEach(function (map) {
      var codeColumn = meta.columns[map[0]], nameColumn = meta.columns[map[1]];
      if (!touchedFields[map[0]] || !codeColumn || !nameColumn || currentFormulas[nameColumn - 1]) return;
      var selectedCode = String(rowValues[codeColumn - 1] || '').trim(), master = selectedCode ? masterRowByCode_(ss, map[2], map[0], selectedCode) : null;
      rowValues[nameColumn - 1] = master ? (master[map[3]] || '') : '';
      touchedFields[map[1]] = true;
    });
    if (meta.columns.MA_NHAN_VIEN) rowValues[meta.columns.MA_NHAN_VIEN - 1] = code;
    if (!editing && meta.columns.ID_NHAN_VIEN) rowValues[meta.columns.ID_NHAN_VIEN - 1] = 'NV_' + String(newIdNumber).padStart(6, '0');
    if (meta.columns.NGAY_CAP_NHAT) {
      touchedFields.NGAY_CAP_NHAT = true;
      rowValues[meta.columns.NGAY_CAP_NHAT - 1] = new Date();
    }
    if (editing && currentFormulas.length) currentFormulas.forEach(function (formula, index) {
      var header = meta.headers[index];
      if (formula && !touchedFields[header]) rowValues[index] = formula;
    });
    // Đặt định dạng văn bản trước khi ghi để không mất số 0 đầu (CCCD, điện thoại, mã BHXH).
    ['SO_CCCD', 'SO_DIEN_THOAI', 'MA_SO_BHXH'].forEach(function (field) {
      if (meta.columns[field] && touchedFields[field]) sheet.getRange(rowNumber, meta.columns[field]).setNumberFormat('@');
    });
    sheet.getRange(rowNumber, 1, 1, meta.headers.length).setValues([rowValues]);
    ['MA_NHAN_VIEN', 'ID_NHAN_VIEN', 'SO_CCCD', 'SO_DIEN_THOAI', 'MA_PHONG_BAN', 'MA_BO_PHAN', 'MA_NHOM', 'MA_CHUC_VU', 'ANH_DAI_DIEN', 'MA_SO_BHXH'].forEach(function (field) {
      if (meta.columns[field]) sheet.getRange(rowNumber, meta.columns[field]).setNumberFormat('@');
    });
    ['NGAY_SINH', 'NGAY_VAO_LAM', 'NGAY_CAP', 'NGAY_THAM_GIA_BHXH'].forEach(function (field) {
      if (meta.columns[field]) sheet.getRange(rowNumber, meta.columns[field]).setNumberFormat('dd/MM/yyyy');
    });
    if (meta.columns.NGAY_CAP_NHAT) sheet.getRange(rowNumber, meta.columns.NGAY_CAP_NHAT).setNumberFormat('dd/MM/yyyy HH:mm');
    var after = objectFromRow_(meta, sheet.getRange(rowNumber, 1, 1, meta.headers.length).getDisplayValues()[0]);
    if (editing && before) appendWorkHistory_(ss, before, after, input, auth);
    writeSystemLog_(ss, auth, 'NHAN_SU', editing ? 'SUA' : 'THEM', code, before, after, editing ? 'Cập nhật hồ sơ nhân viên.' : 'Tạo hồ sơ nhân viên.');
    return { success: true, code: code };
  } finally {
    lock.releaseLock();
  }
}
