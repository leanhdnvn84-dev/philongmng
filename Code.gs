/** PHI LONG HR — bản R73 (workspace Biểu mẫu tinh gọn và xem trước A4 nhiều trang). */
const SPREADSHEET_ID = '11yGGO-mutg1y_0AE2Yyw_K6OglZdCWaiwsnYZoU-JKk';
const DATA_SHEETS = [
  'DM_NHAN_VIEN', 'DM_PHONG_BAN', 'DM_CHUC_VU',
  'DM_BO_PHAN',
  'DM_CHI_NHANH', 'DM_DIA_DIEM', 'DM_LOAI_HOP_DONG', 'DM_CHINH_SACH_PHEP',
  'DM_BIEU_MAU', 'PHIEU_BIEU_MAU',
  'LICH_SU_CONG_VIEC',
  'CC_CA_LAM_VIEC', 'CC_CHAM_CONG', 'CC_TANG_CA', 'CC_NGHI_PHEP', 'CC_BANG_CONG_THANG',
  'TUYEN_DUNG_NHU_CAU', 'TUYEN_DUNG_UNG_VIEN'
];
const APP_BOOTSTRAP_SHEETS = [
  'DM_NHAN_VIEN', 'DM_PHONG_BAN', 'DM_CHUC_VU', 'DM_BO_PHAN',
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
  'PHAM_VI_SU_DUNG', 'CAN_CU_PHAP_LY', 'MAU_CHUAN', 'LINK_MAU_GOC'
];

const FORM_REQUEST_HEADERS = [
  'ID_PHIEU', 'ID_BIEU_MAU', 'TEN_BIEU_MAU', 'MA_NHAN_VIEN', 'HO_VA_TEN',
  'NGAY_LAP', 'TIEU_DE', 'NOI_DUNG', 'TRANG_THAI', 'NGUOI_TAO', 'NGAY_TAO',
  'NGUOI_DUYET', 'NGAY_DUYET', 'GHI_CHU', 'DU_LIEU_MAU_JSON'
];

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
  ['FM_BHXH_14', '14-HSB', 'Mẫu 14-HSB - Đơn đề nghị BHXH', 'BHXH', 'Đơn đề nghị BHXH dùng theo đúng thủ tục áp dụng, không dùng như mẫu đề nghị chung.', 15]
];

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
function getSystemData(input) {
  input = input || {};
  var auth = requireAuth_(input._sessionToken), ss = SpreadsheetApp.openById(SPREADSHEET_ID), snapshot = authSnapshot_(ss);
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

function normalize_(value) {
  var str = String(value == null ? '' : value).normalize('NFC').trim().toLowerCase();
  var vietnameseDiacritics = {
    'á': 'a', 'à': 'a', 'ả': 'a', 'ã': 'a', 'ạ': 'a', 'ă': 'a', 'ắ': 'a', 'ằ': 'a', 'ẳ': 'a', 'ẵ': 'a', 'ặ': 'a',
    'â': 'a', 'ấ': 'a', 'ầ': 'a', 'ẩ': 'a', 'ẫ': 'a', 'ậ': 'a',
    'é': 'e', 'è': 'e', 'ẻ': 'e', 'ẽ': 'e', 'ẹ': 'e',
    'ê': 'e', 'ế': 'e', 'ề': 'e', 'ể': 'e', 'ễ': 'e', 'ệ': 'e',
    'í': 'i', 'ì': 'i', 'ỉ': 'i', 'ĩ': 'i', 'ị': 'i',
    'ó': 'o', 'ò': 'o', 'ỏ': 'o', 'õ': 'o', 'ọ': 'o',
    'ô': 'o', 'ố': 'o', 'ồ': 'o', 'ổ': 'o', 'ỗ': 'o', 'ộ': 'o',
    'ơ': 'o', 'ớ': 'o', 'ờ': 'o', 'ở': 'o', 'ỡ': 'o', 'ợ': 'o',
    'ú': 'u', 'ù': 'u', 'ủ': 'u', 'ũ': 'u', 'ụ': 'u',
    'ư': 'u', 'ứ': 'u', 'ừ': 'u', 'ử': 'u', 'ữ': 'u', 'ự': 'u',
    'ý': 'y', 'ỳ': 'y', 'ỷ': 'y', 'ỹ': 'y', 'ỵ': 'y',
    'đ': 'd'
  };
  return str.split('').map(function(c) { return vietnameseDiacritics[c] || c; }).join('');
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
    CAN_CU_PHAP_LY: legal.CAN_CU_PHAP_LY || '', MAU_CHUAN: legal.MAU_CHUAN || 'Không có mẫu bắt buộc chung', LINK_MAU_GOC: legal.LINK_MAU_GOC || ''
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
  var formDataJson = String(input.DU_LIEU_MAU_JSON || '').trim();
  if (formDataJson.length > 45000) throw new Error('Nội dung mẫu vượt quá giới hạn lưu trữ của một ô Google Sheets.');
  if (formDataJson) {
    try { JSON.parse(formDataJson); } catch (error) { throw new Error('Dữ liệu chi tiết biểu mẫu không hợp lệ.'); }
  }
  var sheet = ensureFormSheet_(ss, 'PHIEU_BIEU_MAU'), meta = headers_(sheet), now = new Date(), formDate = input.NGAY_LAP ? parseAttendanceDate_(input.NGAY_LAP, 'Ngày lập') : now;
  var record = {
    ID_PHIEU: 'PH_' + Utilities.getUuid(), ID_BIEU_MAU: template.ID_BIEU_MAU || template.MA_BIEU_MAU || '',
    TEN_BIEU_MAU: template.TEN_BIEU_MAU || '', MA_NHAN_VIEN: employeeCode, HO_VA_TEN: employee && employee.HO_VA_TEN || '',
    NGAY_LAP: formDate, TIEU_DE: String(input.TIEU_DE || '').trim() || template.TEN_BIEU_MAU || '',
    NOI_DUNG: String(input.NOI_DUNG || '').trim(), TRANG_THAI: 'Nháp', NGUOI_TAO: auth.username || auth.email || 'Hệ thống',
    NGAY_TAO: now, NGUOI_DUYET: '', NGAY_DUYET: '', GHI_CHU: String(input.GHI_CHU || '').trim(), DU_LIEU_MAU_JSON: formDataJson
  };
  var rowNumber = appendFormRecord_(sheet, meta, record);
  ['ID_PHIEU', 'ID_BIEU_MAU', 'MA_NHAN_VIEN'].forEach(function (field) { if (meta.columns[field]) sheet.getRange(rowNumber, meta.columns[field]).setNumberFormat('@'); });
  ['NGAY_LAP', 'NGAY_TAO'].forEach(function (field) { if (meta.columns[field]) sheet.getRange(rowNumber, meta.columns[field]).setNumberFormat('dd/MM/yyyy HH:mm'); });
  writeSystemLog_(ss, auth, 'BIEU_MAU', 'THEM', record.ID_PHIEU, null, record, 'Tạo phiếu biểu mẫu.');
  return { success: true, id: record.ID_PHIEU };
}

function updateFormRequestStatus(input) {
  input = input || {};
  var auth = requirePermission_(input._sessionToken, 'BIEU_MAU', 'DUYET'), id = String(input.ID_PHIEU || '').trim(), status = String(input.TRANG_THAI || '').trim();
  if (!id) throw new Error('Thiếu phiếu biểu mẫu cần xử lý.');
  if (['Đã duyệt', 'Từ chối', 'Đã hủy'].indexOf(status) === -1) throw new Error('Trạng thái phiếu không hợp lệ.');
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID), sheet = ensureFormSheet_(ss, 'PHIEU_BIEU_MAU'), meta = headers_(sheet);
  var values = sheet.getLastRow() > 1 ? sheet.getRange(2, 1, sheet.getLastRow() - 1, meta.headers.length).getDisplayValues() : [];
  var index = values.findIndex(function (row) { return key_(row[meta.columns.ID_PHIEU - 1]) === key_(id); });
  if (index === -1) throw new Error('Không tìm thấy phiếu biểu mẫu.');
  var rowNumber = index + 2, before = objectFromRow_(meta, values[index]), now = new Date();
  if (meta.columns.TRANG_THAI) sheet.getRange(rowNumber, meta.columns.TRANG_THAI).setValue(status);
  if (meta.columns.NGUOI_DUYET) sheet.getRange(rowNumber, meta.columns.NGUOI_DUYET).setValue(auth.username || auth.email || 'Hệ thống');
  if (meta.columns.NGAY_DUYET) sheet.getRange(rowNumber, meta.columns.NGAY_DUYET).setValue(now).setNumberFormat('dd/MM/yyyy HH:mm');
  if (meta.columns.GHI_CHU && Object.prototype.hasOwnProperty.call(input, 'GHI_CHU')) sheet.getRange(rowNumber, meta.columns.GHI_CHU).setValue(String(input.GHI_CHU || '').trim());
  var after = objectFromRow_(meta, sheet.getRange(rowNumber, 1, 1, meta.headers.length).getDisplayValues()[0]);
  writeSystemLog_(ss, auth, 'BIEU_MAU', 'DUYET', id, before, after, 'Cập nhật trạng thái phiếu biểu mẫu.');
  return { success: true };
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
      var status = normalize_(row.TRANG_THAI);
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
    if (normalize_(after.TRANG_THAI).indexOf('nghi viec') !== -1) return 'Nghỉ việc';
    if (normalize_(before.TRANG_THAI).indexOf('nghi viec') !== -1) return 'Quay lại làm việc';
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
  var actor = auth && (auth.username || auth.email) || Session.getActiveUser().getEmail() || 'Hệ thống';
  var record = {
    ID_LICH_SU: 'LS_' + Utilities.getUuid(),
    MA_NHAN_VIEN: after.MA_NHAN_VIEN || before.MA_NHAN_VIEN || '',
    HO_VA_TEN: after.HO_VA_TEN || before.HO_VA_TEN || '',
    NGAY_HIEU_LUC: now,
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
  var record = { ID_LICH_SU:'LS_'+Utilities.getUuid(), MA_NHAN_VIEN:before.MA_NHAN_VIEN, HO_VA_TEN:before.HO_VA_TEN, NGAY_HIEU_LUC:now, LOAI_BIEN_DONG:'Đề xuất điều chuyển', MA_PHONG_BAN_CU:before.MA_PHONG_BAN||'', MA_BO_PHAN_CU:before.MA_BO_PHAN||'', MA_NHOM_CU:before.MA_NHOM||'', MA_CHUC_VU_CU:before.MA_CHUC_VU||'', MA_PHONG_BAN_MOI:input.MA_PHONG_BAN||'', MA_BO_PHAN_MOI:input.MA_BO_PHAN||'', MA_NHOM_MOI:before.MA_NHOM||'', MA_CHUC_VU_MOI:input.MA_CHUC_VU||'', SO_QUYET_DINH:input.SO_QUYET_DINH||'', GHI_CHU:input.GHI_CHU_LICH_SU||'', NGUOI_TAO:auth.username||auth.email||'Hệ thống', NGAY_TAO:now, TRANG_THAI:'Chờ duyệt' };
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
  requirePermission_(sessionToken, 'NHAN_SU', 'XEM');
  var rows = readSheet_(SpreadsheetApp.openById(SPREADSHEET_ID), 'DM_NHAN_VIEN').rows;
  var wanted = key_(code);
  return rows.find(function (row) {
    return key_(row.MA_NHAN_VIEN) === wanted || key_(row.ID_NHAN_VIEN) === wanted;
  }) || null;
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
    if (Object.prototype.hasOwnProperty.call(input, 'MA_CHUC_VU')) {
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
      rowNumber = Math.max(2, lastRow + 1);
      rowValues = [];
      for (var blankIndex = 0; blankIndex < meta.headers.length; blankIndex++) rowValues.push('');
    }

    var fields = ['HO_VA_TEN', 'GIOI_TINH', 'NGAY_SINH', 'SO_CCCD', 'SO_DIEN_THOAI', 'EMAIL', 'DIA_CHI', 'MA_PHONG_BAN', 'MA_BO_PHAN', 'MA_NHOM', 'MA_CHUC_VU', 'NGAY_VAO_LAM', 'TRANG_THAI', 'ANH_DAI_DIEN'];
    var touchedFields = {};
    fields.forEach(function (field) {
      if (!Object.prototype.hasOwnProperty.call(input, field) || !meta.columns[field]) return;
      touchedFields[field] = true;
      var value = String(input[field] == null ? '' : input[field]).trim();
      if (field === 'ANH_DAI_DIEN') {
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
      rowValues[meta.columns[field] - 1] = value;
    });
    if (meta.columns.MA_NHAN_VIEN) rowValues[meta.columns.MA_NHAN_VIEN - 1] = code;
    if (!editing && meta.columns.ID_NHAN_VIEN) rowValues[meta.columns.ID_NHAN_VIEN - 1] = Utilities.getUuid();
    if (meta.columns.NGAY_CAP_NHAT) {
      touchedFields.NGAY_CAP_NHAT = true;
      rowValues[meta.columns.NGAY_CAP_NHAT - 1] = new Date();
    }
    if (editing && currentFormulas.length) currentFormulas.forEach(function (formula, index) {
      var header = meta.headers[index];
      if (formula && !touchedFields[header]) rowValues[index] = formula;
    });
    sheet.getRange(rowNumber, 1, 1, meta.headers.length).setValues([rowValues]);
    ['MA_NHAN_VIEN', 'ID_NHAN_VIEN', 'SO_CCCD', 'SO_DIEN_THOAI', 'MA_PHONG_BAN', 'MA_BO_PHAN', 'MA_NHOM', 'MA_CHUC_VU', 'ANH_DAI_DIEN'].forEach(function (field) {
      if (meta.columns[field]) sheet.getRange(rowNumber, meta.columns[field]).setNumberFormat('@');
    });
    ['NGAY_SINH', 'NGAY_VAO_LAM'].forEach(function (field) {
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
