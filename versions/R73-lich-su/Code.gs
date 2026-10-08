/** PHI LONG HR — bản R73 (Lịch sử công việc gọn; dọn CSS trùng/chồng chéo; giữ toàn bộ thay đổi R72). */
const SPREADSHEET_ID = '11yGGO-mutg1y_0AE2Yyw_K6OglZdCWaiwsnYZoU-JKk';
const DATA_SHEETS = [
  'DM_NHAN_VIEN', 'DM_PHONG_BAN', 'DM_CHUC_VU',
  'DM_BO_PHAN', 'DM_NHOM',
  'DM_CHI_NHANH', 'DM_DIA_DIEM', 'DM_LOAI_HOP_DONG', 'DM_CHINH_SACH_PHEP',
  'DM_BIEU_MAU', 'PHIEU_BIEU_MAU', 'DM_DIEU_KHOAN', 'DM_CONG_TY',
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

/** Điều khoản hợp đồng mẫu (sửa trực tiếp trên sheet DM_DIEU_KHOAN; app chỉ bổ sung dòng còn thiếu, không ghi đè). */
const CONTRACT_CLAUSE_HEADERS = ['ID_DIEU_KHOAN', 'MA_MAU', 'LOAI', 'THU_TU', 'TIEU_DE', 'NOI_DUNG', 'TRANG_THAI', 'NGAY_CAP_NHAT'];
const CONTRACT_CLAUSE_SEEDS = [["DK_HOP_DONG_CHUNG_01", "FM_HOP_DONG", "", 1, "Công việc và địa điểm làm việc", "1. Chức danh chuyên môn: {CHUC_DANH}.\n2. Công việc phải làm: {CONG_VIEC}.\n3. Địa điểm làm việc: {DIA_DIEM}."], ["DK_HOP_DONG_CHUNG_02", "FM_HOP_DONG", "", 2, "Loại và thời hạn hợp đồng", "1. Loại hợp đồng: {LOAI_HD}.\n2. Thời hạn: từ ngày {TU_NGAY}{?DEN_NGAY_TEXT}."], ["DK_HOP_DONG_CHUNG_03", "FM_HOP_DONG", "", 3, "Tiền lương, phụ cấp và hình thức trả lương", "1. Mức lương theo công việc hoặc chức danh: {LUONG} ({LUONG_CHU}).\n2. Phụ cấp lương và các khoản bổ sung khác: {PHU_CAP}.\n3. Hình thức trả lương: {HINH_THUC_TRA}; kỳ hạn trả lương: {KY_TRA}.\n4. Chế độ nâng bậc, nâng lương: {NANG_LUONG}."], ["DK_HOP_DONG_CHUNG_04", "FM_HOP_DONG", "", 4, "Thời giờ làm việc, thời giờ nghỉ ngơi", "1. Thời giờ làm việc: {GIO_LAM}.\n2. Thời giờ nghỉ ngơi: {NGHI_NGOI}.\n3. Nghỉ hằng năm, nghỉ lễ, tết, nghỉ việc riêng và nghỉ không hưởng lương theo Bộ luật Lao động 2019 và nội quy lao động của Công ty."], ["DK_HOP_DONG_CHUNG_05", "FM_HOP_DONG", "", 5, "Trang bị bảo hộ lao động", "Người lao động được trang bị phương tiện bảo vệ cá nhân phù hợp với công việc theo quy định về an toàn, vệ sinh lao động: {BHLD}."], ["DK_HOP_DONG_CHUNG_06", "FM_HOP_DONG", "", 6, "Bảo hiểm xã hội, bảo hiểm y tế, bảo hiểm thất nghiệp", "Hai bên tham gia bảo hiểm xã hội bắt buộc, bảo hiểm y tế, bảo hiểm thất nghiệp theo Luật Bảo hiểm xã hội 2024 và quy định hiện hành. {?BAO_HIEM}"], ["DK_HOP_DONG_CHUNG_07", "FM_HOP_DONG", "", 7, "Đào tạo, bồi dưỡng, nâng cao trình độ", "Người lao động được đào tạo, bồi dưỡng theo kế hoạch và quy chế của Công ty. {?DAO_TAO}"], ["DK_HOP_DONG_CHUNG_08", "FM_HOP_DONG", "", 8, "Quyền và nghĩa vụ của người lao động", "1. Được bố trí công việc, trả lương đầy đủ, đúng hạn và hưởng các chế độ theo hợp đồng và quy định của pháp luật.\n2. Hoàn thành công việc được giao; chấp hành nội quy lao động, quy chế của Công ty và sự điều hành hợp pháp của người sử dụng lao động.\n3. {?NGHIA_VU_NLD}"], ["DK_HOP_DONG_CHUNG_09", "FM_HOP_DONG", "", 9, "Quyền và nghĩa vụ của người sử dụng lao động", "1. Bảo đảm việc làm, điều kiện làm việc; trả lương và thực hiện các chế độ theo hợp đồng.\n2. Điều hành, kiểm tra, khen thưởng và xử lý kỷ luật lao động theo quy định của pháp luật và nội quy lao động.\n3. {?NGHIA_VU_NSDLD}"], ["DK_HOP_DONG_CHUNG_10", "FM_HOP_DONG", "", 10, "Bảo vệ bí mật kinh doanh, bí mật công nghệ", "Người lao động có trách nhiệm bảo vệ bí mật kinh doanh, bí mật công nghệ của Công ty theo khoản 2 Điều 21 Bộ luật Lao động 2019. {?BAO_MAT}"], ["DK_HOP_DONG_CHUNG_11", "FM_HOP_DONG", "", 11, "Điều khoản thi hành", "1. Những vấn đề về lao động không ghi trong hợp đồng này thì áp dụng theo nội quy lao động, thỏa ước lao động tập thể (nếu có) và quy định của pháp luật lao động.\n2. Việc sửa đổi, bổ sung hợp đồng được thực hiện bằng phụ lục hợp đồng lao động.\n3. Hợp đồng có hiệu lực từ ngày {TU_NGAY}, được lập thành 02 bản có giá trị như nhau, mỗi bên giữ 01 bản."], ["DK_V_HOP_DONG_THU_VIEC_CHUNG_01", "FMV_HOP_DONG_THU_VIEC", "", 1, "Công việc thử việc", "1. Chức danh chuyên môn: {CHUC_DANH}.\n2. Công việc phải làm: {CONG_VIEC}.\n3. Địa điểm làm việc: {DIA_DIEM}."], ["DK_V_HOP_DONG_THU_VIEC_CHUNG_02", "FMV_HOP_DONG_THU_VIEC", "", 2, "Thời gian thử việc", "Từ ngày {TU_NGAY} đến ngày {DEN_NGAY}. Thời gian thử việc không quá 180 ngày với công việc của người quản lý doanh nghiệp; 60 ngày với chức danh cần trình độ cao đẳng trở lên; 30 ngày với chức danh cần trình độ trung cấp, công nhân kỹ thuật, nhân viên nghiệp vụ; 06 ngày làm việc với công việc khác (Điều 25 Bộ luật Lao động 2019)."], ["DK_V_HOP_DONG_THU_VIEC_CHUNG_03", "FMV_HOP_DONG_THU_VIEC", "", 3, "Tiền lương thử việc", "1. Mức lương thử việc: {LUONG} ({LUONG_CHU}), không thấp hơn 85% mức lương của công việc đó (Điều 26 Bộ luật Lao động 2019).\n2. Hình thức trả lương: {HINH_THUC_TRA}; kỳ hạn trả lương: {KY_TRA}."], ["DK_V_HOP_DONG_THU_VIEC_CHUNG_04", "FMV_HOP_DONG_THU_VIEC", "", 4, "Thời giờ làm việc, thời giờ nghỉ ngơi", "1. Thời giờ làm việc: {GIO_LAM}.\n2. Thời giờ nghỉ ngơi: {NGHI_NGOI}."], ["DK_V_HOP_DONG_THU_VIEC_CHUNG_05", "FMV_HOP_DONG_THU_VIEC", "", 5, "Kết thúc thời gian thử việc", "1. Khi kết thúc thời gian thử việc, người sử dụng lao động thông báo kết quả thử việc cho người lao động.\n2. Trường hợp đạt yêu cầu, hai bên tiếp tục giao kết hợp đồng lao động; trường hợp không đạt thì chấm dứt thỏa thuận thử việc.\n3. Trong thời gian thử việc, mỗi bên có quyền hủy bỏ thỏa thuận thử việc mà không cần báo trước và không phải bồi thường (Điều 27 Bộ luật Lao động 2019)."], ["DK_V_HOP_DONG_THU_VIEC_CHUNG_06", "FMV_HOP_DONG_THU_VIEC", "", 6, "Quyền và nghĩa vụ của các bên", "Người lao động thực hiện công việc theo sự phân công, chấp hành nội quy lao động; người sử dụng lao động bố trí công việc, trả lương đầy đủ, đúng hạn và hướng dẫn công việc trong thời gian thử việc."], ["DK_V_HOP_DONG_THU_VIEC_CHUNG_07", "FMV_HOP_DONG_THU_VIEC", "", 7, "Điều khoản thi hành", "Hợp đồng thử việc có hiệu lực từ ngày {TU_NGAY}, được lập thành 02 bản có giá trị như nhau, mỗi bên giữ 01 bản."], ["DK_HD_KINH_TE_MUA_BAN_01", "FM_HD_KINH_TE", "Mua bán", 1, "Hàng hóa", "Bên A đồng ý bán và Bên B đồng ý mua hàng hóa sau: {DOI_TUONG}.\nHàng hóa mới 100%, đúng chủng loại, xuất xứ và tiêu chuẩn kỹ thuật đã thỏa thuận."], ["DK_HD_KINH_TE_MUA_BAN_02", "FM_HD_KINH_TE", "Mua bán", 2, "Giá trị hợp đồng và phương thức thanh toán", "1. Tổng giá trị hợp đồng: {SO_TIEN} ({SO_TIEN_CHU}), đã bao gồm thuế GTGT (nếu có).\n2. Phương thức thanh toán: {THANH_TOAN}.\n3. Thời hạn và điều kiện thanh toán: {GIA_THANH_TOAN}."], ["DK_HD_KINH_TE_MUA_BAN_03", "FM_HD_KINH_TE", "Mua bán", 3, "Giao nhận và kiểm tra hàng hóa", "1. Thời gian, địa điểm, phương thức giao hàng: {THUC_HIEN}.\n2. Hai bên lập biên bản giao nhận khi bàn giao. Bên nhận kiểm tra số lượng, chất lượng và thông báo sai sót bằng văn bản trong vòng 03 ngày làm việc kể từ ngày nhận hàng."], ["DK_HD_KINH_TE_MUA_BAN_04", "FM_HD_KINH_TE", "Mua bán", 4, "Bảo hành", "Hàng hóa được bảo hành theo tiêu chuẩn của nhà sản xuất, thời hạn …… tháng kể từ ngày giao hàng."], ["DK_HD_KINH_TE_NGUYEN_TAC_01", "FM_HD_KINH_TE", "Nguyên tắc", 1, "Phạm vi hợp tác", "Hai bên thống nhất nguyên tắc mua bán, cung cấp: {DOI_TUONG}.\nSố lượng, đơn giá, thời gian giao hàng của từng lần được xác định theo đơn đặt hàng hoặc phụ lục được hai bên xác nhận; đơn đặt hàng là bộ phận không tách rời của hợp đồng này."], ["DK_HD_KINH_TE_NGUYEN_TAC_02", "FM_HD_KINH_TE", "Nguyên tắc", 2, "Giá và thanh toán", "1. Giá theo báo giá, bảng giá được hai bên xác nhận tại từng thời điểm.\n2. Phương thức thanh toán: {THANH_TOAN}; thời hạn: {GIA_THANH_TOAN}.\n3. Hai bên đối chiếu công nợ định kỳ hằng tháng."], ["DK_HD_KINH_TE_NGUYEN_TAC_03", "FM_HD_KINH_TE", "Nguyên tắc", 3, "Giao nhận hàng hóa", "Thời gian, địa điểm giao hàng theo từng đơn đặt hàng: {THUC_HIEN}. Mỗi lần giao nhận có biên bản hoặc phiếu giao hàng có chữ ký của hai bên."], ["DK_HD_KINH_TE_DICH_VU_01", "FM_HD_KINH_TE", "Dịch vụ", 1, "Nội dung dịch vụ", "Bên B cung cấp cho Bên A dịch vụ: {DOI_TUONG}.\nPhạm vi, tiêu chuẩn chất lượng theo đề xuất kỹ thuật hoặc phụ lục đính kèm."], ["DK_HD_KINH_TE_DICH_VU_02", "FM_HD_KINH_TE", "Dịch vụ", 2, "Thời gian, địa điểm thực hiện", "{THUC_HIEN}."], ["DK_HD_KINH_TE_DICH_VU_03", "FM_HD_KINH_TE", "Dịch vụ", 3, "Giá trị hợp đồng và phương thức thanh toán", "1. Tổng giá trị hợp đồng: {SO_TIEN} ({SO_TIEN_CHU}), đã bao gồm thuế GTGT (nếu có).\n2. Phương thức thanh toán: {THANH_TOAN}.\n3. Thời hạn và điều kiện thanh toán: {GIA_THANH_TOAN}."], ["DK_HD_KINH_TE_DICH_VU_04", "FM_HD_KINH_TE", "Dịch vụ", 4, "Nghiệm thu", "Kết quả dịch vụ được nghiệm thu bằng biên bản có xác nhận của hai bên; biên bản nghiệm thu là căn cứ thanh toán."], ["DK_HD_KINH_TE_THUE_01", "FM_HD_KINH_TE", "Thuê", 1, "Tài sản thuê", "Bên A (bên thuê) thuê của Bên B (bên cho thuê) tài sản: {DOI_TUONG} (mô tả, số lượng, hiện trạng khi bàn giao)."], ["DK_HD_KINH_TE_THUE_02", "FM_HD_KINH_TE", "Thuê", 2, "Thời hạn thuê", "Từ ngày {NGAY_HIEU_LUC} đến ngày {NGAY_HET_HAN}."], ["DK_HD_KINH_TE_THUE_03", "FM_HD_KINH_TE", "Thuê", 3, "Giá thuê, đặt cọc và thanh toán", "1. Giá thuê: {SO_TIEN} ({SO_TIEN_CHU}) mỗi kỳ ……, đã bao gồm thuế (nếu có).\n2. Phương thức thanh toán: {THANH_TOAN}; thời hạn: {GIA_THANH_TOAN}.\n3. Tiền đặt cọc (nếu có): …… đồng, được hoàn trả khi kết thúc hợp đồng sau khi trừ các khoản còn phải trả."], ["DK_HD_KINH_TE_THUE_04", "FM_HD_KINH_TE", "Thuê", 4, "Bảo quản, sửa chữa và trả lại tài sản", "Bên thuê bảo quản, sử dụng tài sản đúng công dụng và sửa chữa hư hỏng nhỏ; bên cho thuê sửa chữa hư hỏng lớn không do lỗi của bên thuê. Khi hết hạn, bên thuê trả lại tài sản đúng hiện trạng, trừ hao mòn tự nhiên (Điều 472–483 Bộ luật Dân sự 2015)."], ["DK_HD_KINH_TE_CHO_THUE_01", "FM_HD_KINH_TE", "Cho thuê", 1, "Tài sản cho thuê", "Bên A (bên cho thuê) cho Bên B (bên thuê) thuê tài sản: {DOI_TUONG} (mô tả, số lượng, hiện trạng khi bàn giao)."], ["DK_HD_KINH_TE_CHO_THUE_02", "FM_HD_KINH_TE", "Cho thuê", 2, "Thời hạn thuê", "Từ ngày {NGAY_HIEU_LUC} đến ngày {NGAY_HET_HAN}."], ["DK_HD_KINH_TE_CHO_THUE_03", "FM_HD_KINH_TE", "Cho thuê", 3, "Giá thuê, đặt cọc và thanh toán", "1. Giá thuê: {SO_TIEN} ({SO_TIEN_CHU}) mỗi kỳ ……, đã bao gồm thuế (nếu có).\n2. Phương thức thanh toán: {THANH_TOAN}; thời hạn: {GIA_THANH_TOAN}.\n3. Tiền đặt cọc (nếu có): …… đồng, được hoàn trả khi kết thúc hợp đồng sau khi trừ các khoản còn phải trả."], ["DK_HD_KINH_TE_CHO_THUE_04", "FM_HD_KINH_TE", "Cho thuê", 4, "Bảo quản, sửa chữa và trả lại tài sản", "Bên thuê bảo quản, sử dụng tài sản đúng công dụng và sửa chữa hư hỏng nhỏ; bên cho thuê sửa chữa hư hỏng lớn không do lỗi của bên thuê. Khi hết hạn, bên thuê trả lại tài sản đúng hiện trạng, trừ hao mòn tự nhiên (Điều 472–483 Bộ luật Dân sự 2015)."], ["DK_HD_KINH_TE_THI_CONG_01", "FM_HD_KINH_TE", "Thi công", 1, "Nội dung và khối lượng công việc", "{DOI_TUONG}, theo hồ sơ thiết kế và bảng khối lượng đính kèm."], ["DK_HD_KINH_TE_THI_CONG_02", "FM_HD_KINH_TE", "Thi công", 2, "Tiến độ thi công", "{THUC_HIEN}. Bên thi công lập tiến độ chi tiết và thông báo kịp thời khi có thay đổi."], ["DK_HD_KINH_TE_THI_CONG_03", "FM_HD_KINH_TE", "Thi công", 3, "Giá trị hợp đồng và phương thức thanh toán", "1. Tổng giá trị hợp đồng: {SO_TIEN} ({SO_TIEN_CHU}), đã bao gồm thuế GTGT (nếu có).\n2. Phương thức thanh toán: {THANH_TOAN}.\n3. Thời hạn và điều kiện thanh toán: {GIA_THANH_TOAN}."], ["DK_HD_KINH_TE_THI_CONG_04", "FM_HD_KINH_TE", "Thi công", 4, "An toàn lao động, phòng cháy và vệ sinh môi trường", "Bên thi công chịu trách nhiệm về an toàn lao động, phòng cháy chữa cháy và vệ sinh môi trường tại nơi thi công theo Luật An toàn, vệ sinh lao động 2015 và Luật Phòng cháy, chữa cháy và cứu nạn, cứu hộ 2024."], ["DK_HD_KINH_TE_THI_CONG_05", "FM_HD_KINH_TE", "Thi công", 5, "Nghiệm thu, bàn giao và bảo hành", "Nghiệm thu từng hạng mục và toàn bộ công việc bằng biên bản; thời hạn bảo hành …… tháng kể từ ngày nghiệm thu bàn giao."], ["DK_HD_KINH_TE_BAO_TRI_01", "FM_HD_KINH_TE", "Bảo trì", 1, "Đối tượng bảo trì", "{DOI_TUONG}."], ["DK_HD_KINH_TE_BAO_TRI_02", "FM_HD_KINH_TE", "Bảo trì", 2, "Nội dung và tần suất bảo trì", "Bảo trì định kỳ …… lần/……; xử lý sự cố trong vòng …… giờ kể từ khi nhận thông báo. Lịch thực hiện: {THUC_HIEN}."], ["DK_HD_KINH_TE_BAO_TRI_03", "FM_HD_KINH_TE", "Bảo trì", 3, "Giá trị hợp đồng và phương thức thanh toán", "1. Tổng giá trị hợp đồng: {SO_TIEN} ({SO_TIEN_CHU}), đã bao gồm thuế GTGT (nếu có).\n2. Phương thức thanh toán: {THANH_TOAN}.\n3. Thời hạn và điều kiện thanh toán: {GIA_THANH_TOAN}."], ["DK_HD_KINH_TE_BAO_TRI_04", "FM_HD_KINH_TE", "Bảo trì", 4, "Nghiệm thu", "Sau mỗi lần bảo trì, hai bên lập biên bản xác nhận công việc đã thực hiện và tình trạng thiết bị."], ["DK_HD_KINH_TE_VAN_CHUYEN_01", "FM_HD_KINH_TE", "Vận chuyển", 1, "Hàng hóa và tuyến vận chuyển", "{DOI_TUONG}."], ["DK_HD_KINH_TE_VAN_CHUYEN_02", "FM_HD_KINH_TE", "Vận chuyển", 2, "Thời gian, địa điểm giao nhận", "{THUC_HIEN}."], ["DK_HD_KINH_TE_VAN_CHUYEN_03", "FM_HD_KINH_TE", "Vận chuyển", 3, "Cước phí và thanh toán", "1. Cước vận chuyển: {SO_TIEN} ({SO_TIEN_CHU}).\n2. Phương thức thanh toán: {THANH_TOAN}; thời hạn: {GIA_THANH_TOAN}."], ["DK_HD_KINH_TE_VAN_CHUYEN_04", "FM_HD_KINH_TE", "Vận chuyển", 4, "Trách nhiệm đối với hàng hóa", "Bên vận chuyển chịu trách nhiệm về hàng hóa từ khi nhận đến khi giao; bồi thường mất mát, hư hỏng do lỗi của mình theo Bộ luật Dân sự 2015 và Luật Thương mại 2005."], ["DK_HD_KINH_TE_HOP_TAC_01", "FM_HD_KINH_TE", "Hợp tác", 1, "Mục đích và phạm vi hợp tác", "{DOI_TUONG}."], ["DK_HD_KINH_TE_HOP_TAC_02", "FM_HD_KINH_TE", "Hợp tác", 2, "Đóng góp của các bên", "Bên A đóng góp: ……\nBên B đóng góp: ……"], ["DK_HD_KINH_TE_HOP_TAC_03", "FM_HD_KINH_TE", "Hợp tác", 3, "Phân chia kết quả, chi phí", "Lợi nhuận, chi phí và rủi ro được phân chia theo tỷ lệ: Bên A ……%, Bên B ……% (Điều 504–512 Bộ luật Dân sự 2015)."], ["DK_HD_KINH_TE_HOP_TAC_04", "FM_HD_KINH_TE", "Hợp tác", 4, "Thời hạn hợp tác", "Từ ngày {NGAY_HIEU_LUC} đến ngày {NGAY_HET_HAN}."], ["DK_HD_KINH_TE_DAI_LY_01", "FM_HD_KINH_TE", "Đại lý", 1, "Hình thức đại lý và hàng hóa", "Bên A giao cho Bên B làm đại lý …… (bao tiêu/độc quyền/hoa hồng) đối với hàng hóa: {DOI_TUONG} (Điều 166–177 Luật Thương mại 2005)."], ["DK_HD_KINH_TE_DAI_LY_02", "FM_HD_KINH_TE", "Đại lý", 2, "Giá bán và thù lao đại lý", "Giá bán do Bên A quy định; thù lao đại lý/hoa hồng: ……% doanh số."], ["DK_HD_KINH_TE_DAI_LY_03", "FM_HD_KINH_TE", "Đại lý", 3, "Thanh toán và đối chiếu", "Phương thức thanh toán: {THANH_TOAN}; thời hạn: {GIA_THANH_TOAN}. Hai bên đối chiếu số lượng, doanh số và công nợ hằng tháng."], ["DK_HD_KINH_TE_PHAN_PHOI_01", "FM_HD_KINH_TE", "Phân phối", 1, "Sản phẩm và khu vực phân phối", "Sản phẩm: {DOI_TUONG}. Khu vực phân phối: ……"], ["DK_HD_KINH_TE_PHAN_PHOI_02", "FM_HD_KINH_TE", "Phân phối", 2, "Chỉ tiêu doanh số", "Bên B cam kết doanh số tối thiểu …… /tháng (quý)."], ["DK_HD_KINH_TE_PHAN_PHOI_03", "FM_HD_KINH_TE", "Phân phối", 3, "Giá, chiết khấu và thanh toán", "Giá theo bảng giá của Bên A tại từng thời điểm; chiết khấu ……%. Phương thức thanh toán: {THANH_TOAN}; thời hạn: {GIA_THANH_TOAN}."], ["DK_HD_KINH_TE_PHAN_PHOI_04", "FM_HD_KINH_TE", "Phân phối", 4, "Hỗ trợ bán hàng và bảo hành", "Bên A hỗ trợ tài liệu, đào tạo sản phẩm và thực hiện bảo hành theo chính sách của nhà sản xuất."], ["DK_HD_KINH_TE_GIA_CONG_01", "FM_HD_KINH_TE", "Gia công", 1, "Sản phẩm gia công", "{DOI_TUONG} (quy cách, số lượng, tiêu chuẩn chất lượng theo mẫu được hai bên xác nhận)."], ["DK_HD_KINH_TE_GIA_CONG_02", "FM_HD_KINH_TE", "Gia công", 2, "Nguyên vật liệu", "Nguyên vật liệu do …… cung cấp; bên nhận gia công quản lý, sử dụng đúng mục đích và hoàn trả phần còn thừa (Điều 178–184 Luật Thương mại 2005)."], ["DK_HD_KINH_TE_GIA_CONG_03", "FM_HD_KINH_TE", "Gia công", 3, "Thời hạn giao sản phẩm", "{THUC_HIEN}."], ["DK_HD_KINH_TE_GIA_CONG_04", "FM_HD_KINH_TE", "Gia công", 4, "Giá trị hợp đồng và phương thức thanh toán", "1. Tổng giá trị hợp đồng: {SO_TIEN} ({SO_TIEN_CHU}), đã bao gồm thuế GTGT (nếu có).\n2. Phương thức thanh toán: {THANH_TOAN}.\n3. Thời hạn và điều kiện thanh toán: {GIA_THANH_TOAN}."], ["DK_HD_KINH_TE_GIA_CONG_05", "FM_HD_KINH_TE", "Gia công", 5, "Kiểm tra chất lượng", "Sản phẩm được kiểm tra, nghiệm thu khi giao; sản phẩm không đạt được sửa chữa hoặc làm lại bằng chi phí của bên nhận gia công."], ["DK_HD_KINH_TE_TU_VAN_01", "FM_HD_KINH_TE", "Tư vấn", 1, "Phạm vi tư vấn", "{DOI_TUONG}."], ["DK_HD_KINH_TE_TU_VAN_02", "FM_HD_KINH_TE", "Tư vấn", 2, "Sản phẩm tư vấn và tiến độ", "{THUC_HIEN}."], ["DK_HD_KINH_TE_TU_VAN_03", "FM_HD_KINH_TE", "Tư vấn", 3, "Giá trị hợp đồng và phương thức thanh toán", "1. Tổng giá trị hợp đồng: {SO_TIEN} ({SO_TIEN_CHU}), đã bao gồm thuế GTGT (nếu có).\n2. Phương thức thanh toán: {THANH_TOAN}.\n3. Thời hạn và điều kiện thanh toán: {GIA_THANH_TOAN}."], ["DK_HD_KINH_TE_TU_VAN_04", "FM_HD_KINH_TE", "Tư vấn", 4, "Bảo mật thông tin", "Bên tư vấn không tiết lộ thông tin, tài liệu của bên được tư vấn cho bên thứ ba khi chưa có sự đồng ý bằng văn bản."], ["DK_HD_KINH_TE_VAY_01", "FM_HD_KINH_TE", "Vay", 1, "Số tiền vay và mục đích", "1. Số tiền vay: {SO_TIEN} ({SO_TIEN_CHU}).\n2. Mục đích sử dụng: {DOI_TUONG}."], ["DK_HD_KINH_TE_VAY_02", "FM_HD_KINH_TE", "Vay", 2, "Thời hạn vay", "Từ ngày {NGAY_HIEU_LUC} đến ngày {NGAY_HET_HAN}."], ["DK_HD_KINH_TE_VAY_03", "FM_HD_KINH_TE", "Vay", 3, "Lãi suất", "Lãi suất: {LAI_SUAT}%/năm, không vượt quá 20%/năm theo Điều 468 Bộ luật Dân sự 2015. Lãi chậm trả theo Điều 466 Bộ luật Dân sự 2015."], ["DK_HD_KINH_TE_VAY_04", "FM_HD_KINH_TE", "Vay", 4, "Phương thức trả nợ", "Trả gốc và lãi theo phương thức: {THANH_TOAN}; kỳ hạn: {GIA_THANH_TOAN}."], ["DK_HD_KINH_TE_VAY_05", "FM_HD_KINH_TE", "Vay", 5, "Tài sản bảo đảm", "Tài sản bảo đảm (nếu có): ……"], ["DK_HD_KINH_TE_PHAN_MEM_01", "FM_HD_KINH_TE", "Phần mềm", 1, "Phạm vi phần mềm", "{DOI_TUONG} (chức năng, yêu cầu kỹ thuật theo tài liệu đặc tả đính kèm)."], ["DK_HD_KINH_TE_PHAN_MEM_02", "FM_HD_KINH_TE", "Phần mềm", 2, "Tiến độ triển khai và đào tạo", "{THUC_HIEN}."], ["DK_HD_KINH_TE_PHAN_MEM_03", "FM_HD_KINH_TE", "Phần mềm", 3, "Giá trị hợp đồng và phương thức thanh toán", "1. Tổng giá trị hợp đồng: {SO_TIEN} ({SO_TIEN_CHU}), đã bao gồm thuế GTGT (nếu có).\n2. Phương thức thanh toán: {THANH_TOAN}.\n3. Thời hạn và điều kiện thanh toán: {GIA_THANH_TOAN}."], ["DK_HD_KINH_TE_PHAN_MEM_04", "FM_HD_KINH_TE", "Phần mềm", 4, "Nghiệm thu, bảo hành và bảo trì", "Nghiệm thu theo kịch bản kiểm thử được hai bên thống nhất; bảo hành lỗi …… tháng kể từ ngày nghiệm thu."], ["DK_HD_KINH_TE_PHAN_MEM_05", "FM_HD_KINH_TE", "Phần mềm", 5, "Quyền sở hữu trí tuệ", "Quyền tác giả và quyền sở hữu mã nguồn thuộc về ……; bên sử dụng được cấp quyền sử dụng theo phạm vi tại hợp đồng này (Luật Sở hữu trí tuệ)."], ["DK_HD_KINH_TE_BAN_QUYEN_01", "FM_HD_KINH_TE", "Bản quyền", 1, "Đối tượng bản quyền", "{DOI_TUONG}."], ["DK_HD_KINH_TE_BAN_QUYEN_02", "FM_HD_KINH_TE", "Bản quyền", 2, "Phạm vi cho phép sử dụng", "Hình thức: …… (độc quyền/không độc quyền); lãnh thổ: ……; thời hạn: từ ngày {NGAY_HIEU_LUC} đến ngày {NGAY_HET_HAN}."], ["DK_HD_KINH_TE_BAN_QUYEN_03", "FM_HD_KINH_TE", "Bản quyền", 3, "Giá trị hợp đồng và phương thức thanh toán", "1. Tổng giá trị hợp đồng: {SO_TIEN} ({SO_TIEN_CHU}), đã bao gồm thuế GTGT (nếu có).\n2. Phương thức thanh toán: {THANH_TOAN}.\n3. Thời hạn và điều kiện thanh toán: {GIA_THANH_TOAN}."], ["DK_HD_KINH_TE_BAN_QUYEN_04", "FM_HD_KINH_TE", "Bản quyền", 4, "Cam kết của bên chuyển giao", "Bên chuyển giao cam kết là chủ sở hữu hợp pháp và việc chuyển giao không xâm phạm quyền của bên thứ ba."], ["DK_HD_KINH_TE_CHUYEN_GIAO_01", "FM_HD_KINH_TE", "Chuyển giao", 1, "Đối tượng chuyển giao", "{DOI_TUONG}."], ["DK_HD_KINH_TE_CHUYEN_GIAO_02", "FM_HD_KINH_TE", "Chuyển giao", 2, "Phương thức chuyển giao", "Chuyển giao tài liệu kỹ thuật, đào tạo, hỗ trợ kỹ thuật theo Luật Chuyển giao công nghệ 2017. Thời gian, địa điểm: {THUC_HIEN}."], ["DK_HD_KINH_TE_CHUYEN_GIAO_03", "FM_HD_KINH_TE", "Chuyển giao", 3, "Giá trị hợp đồng và phương thức thanh toán", "1. Tổng giá trị hợp đồng: {SO_TIEN} ({SO_TIEN_CHU}), đã bao gồm thuế GTGT (nếu có).\n2. Phương thức thanh toán: {THANH_TOAN}.\n3. Thời hạn và điều kiện thanh toán: {GIA_THANH_TOAN}."], ["DK_HD_KINH_TE_CHUYEN_GIAO_04", "FM_HD_KINH_TE", "Chuyển giao", 4, "Cam kết chất lượng", "Bên chuyển giao bảo đảm công nghệ đạt các chỉ tiêu đã thỏa thuận và hỗ trợ khắc phục khi không đạt."], ["DK_HD_KINH_TE_CHUNG_50", "FM_HD_KINH_TE", "", 50, "Quyền và nghĩa vụ của các bên", "1. Bên A thực hiện đúng, đầy đủ nghĩa vụ đã cam kết; phối hợp, cung cấp thông tin cần thiết cho Bên B.\n2. Bên B thực hiện đúng, đầy đủ nghĩa vụ đã cam kết; thông báo kịp thời cho Bên A khi có vướng mắc.\n3. {?QUYEN_NGHIA_VU}"], ["DK_HD_KINH_TE_CHUNG_51", "FM_HD_KINH_TE", "", 51, "Phạt vi phạm và bồi thường thiệt hại", "1. Bên vi phạm nghĩa vụ phải chịu phạt {PHAT}% giá trị phần nghĩa vụ hợp đồng bị vi phạm (không vượt quá 8% theo Điều 301 Luật Thương mại 2005) và bồi thường thiệt hại thực tế phát sinh.\n2. Bên chậm thanh toán phải trả lãi trên số tiền chậm trả theo Điều 306 Luật Thương mại 2005."], ["DK_HD_KINH_TE_CHUNG_52", "FM_HD_KINH_TE", "", 52, "Bất khả kháng", "Sự kiện bất khả kháng là sự kiện xảy ra một cách khách quan, không thể lường trước và không thể khắc phục được mặc dù đã áp dụng mọi biện pháp cần thiết (Điều 156 Bộ luật Dân sự 2015). Bên gặp sự kiện bất khả kháng phải thông báo bằng văn bản cho bên kia trong vòng 07 ngày và được miễn trách nhiệm trong phạm vi bị ảnh hưởng."], ["DK_HD_KINH_TE_CHUNG_53", "FM_HD_KINH_TE", "", 53, "Giải quyết tranh chấp", "Tranh chấp phát sinh được giải quyết trên tinh thần thương lượng, hòa giải. Trường hợp không thương lượng được: {TRANH_CHAP}."], ["DK_HD_KINH_TE_CHUNG_54", "FM_HD_KINH_TE", "", 54, "Điều khoản chung", "1. Hợp đồng có hiệu lực từ ngày {NGAY_HIEU_LUC}{?DEN_HET_HAN_TEXT}.\n2. Mọi sửa đổi, bổ sung phải lập thành phụ lục có chữ ký của hai bên; phụ lục là bộ phận không tách rời của hợp đồng.\n3. Hợp đồng được lập thành 02 bản có giá trị pháp lý như nhau, mỗi bên giữ 01 bản."], ["DK_PHU_LUC_HD_CHUNG_01", "FM_PHU_LUC_HD", "", 1, "Căn cứ lập phụ lục", "Phụ lục này được lập căn cứ Hợp đồng số {HOP_DONG_GOC} và là bộ phận không tách rời của hợp đồng."], ["DK_PHU_LUC_HD_CHUNG_02", "FM_PHU_LUC_HD", "", 2, "Nội dung sửa đổi, bổ sung", "{NOI_DUNG_SUA_DOI}"], ["DK_PHU_LUC_HD_CHUNG_03", "FM_PHU_LUC_HD", "", 3, "Điều khoản thi hành", "Các điều khoản khác của hợp đồng không được sửa đổi tại phụ lục này giữ nguyên hiệu lực. Phụ lục có hiệu lực từ ngày {NGAY_HIEU_LUC}, được lập thành 02 bản, mỗi bên giữ 01 bản."], ["DK_BB_HOP_DONG_MAC_DINH_01", "FM_BB_HOP_DONG", "*", 1, "Căn cứ", "Căn cứ Hợp đồng số {HOP_DONG_GOC} giữa hai bên."], ["DK_BB_HOP_DONG_MAC_DINH_02", "FM_BB_HOP_DONG", "*", 2, "Nội dung xác nhận", "{NOI_DUNG}"], ["DK_BB_HOP_DONG_MAC_DINH_03", "FM_BB_HOP_DONG", "*", 3, "Kết luận", "{KET_LUAN}"], ["DK_BB_HOP_DONG_MAC_DINH_04", "FM_BB_HOP_DONG", "*", 4, "Hiệu lực", "Biên bản được lập thành 02 bản có giá trị như nhau, mỗi bên giữ 01 bản."], ["DK_BB_HOP_DONG_THANH_LY_HOP_DONG_01", "FM_BB_HOP_DONG", "Thanh lý hợp đồng", 1, "Xác nhận thực hiện hợp đồng", "Hai bên xác nhận đã thực hiện xong các nghĩa vụ theo Hợp đồng số {HOP_DONG_GOC}. {?KET_LUAN}"], ["DK_BB_HOP_DONG_THANH_LY_HOP_DONG_02", "FM_BB_HOP_DONG", "Thanh lý hợp đồng", 2, "Giá trị quyết toán", "1. Giá trị quyết toán: {SO_TIEN} ({SO_TIEN_CHU}).\n2. Số tiền đã thanh toán: …… đồng.\n3. Số tiền còn phải thanh toán: …… đồng, thanh toán trong vòng …… ngày kể từ ngày ký biên bản."], ["DK_BB_HOP_DONG_THANH_LY_HOP_DONG_03", "FM_BB_HOP_DONG", "Thanh lý hợp đồng", 3, "Thanh lý hợp đồng", "Kể từ ngày ký biên bản này, hợp đồng được thanh lý; hai bên không còn nghĩa vụ nào khác, trừ nghĩa vụ bảo hành, bảo mật (nếu có). Biên bản được lập thành 02 bản, mỗi bên giữ 01 bản."], ["DK_THOA_THUAN_BAO_MAT_THONG_TIN_NDA_01", "FM_THOA_THUAN", "Bảo mật thông tin (NDA)", 1, "Thông tin bảo mật", "Thông tin bảo mật gồm: {PHAM_VI}, và mọi thông tin kinh doanh, kỹ thuật, dữ liệu cá nhân mà một bên tiếp cận được trong quá trình hợp tác."], ["DK_THOA_THUAN_BAO_MAT_THONG_TIN_NDA_02", "FM_THOA_THUAN", "Bảo mật thông tin (NDA)", 2, "Nghĩa vụ bảo mật", "Bên nhận thông tin không tiết lộ, sao chép hoặc sử dụng thông tin bảo mật cho mục đích khác ngoài mục đích hợp tác; chỉ cung cấp cho nhân sự cần biết và ràng buộc họ cùng nghĩa vụ bảo mật."], ["DK_THOA_THUAN_BAO_MAT_THONG_TIN_NDA_03", "FM_THOA_THUAN", "Bảo mật thông tin (NDA)", 3, "Trường hợp ngoại lệ", "Không áp dụng với thông tin đã được công khai hợp pháp hoặc phải cung cấp theo yêu cầu của cơ quan nhà nước có thẩm quyền."], ["DK_THOA_THUAN_BAO_MAT_THONG_TIN_NDA_04", "FM_THOA_THUAN", "Bảo mật thông tin (NDA)", 4, "Thời hạn bảo mật", "Trong thời gian hợp tác và …… năm kể từ khi chấm dứt; hết thời hạn hoặc khi được yêu cầu, bên nhận trả lại hoặc hủy tài liệu chứa thông tin bảo mật."], ["DK_THOA_THUAN_BAO_MAT_THONG_TIN_NDA_05", "FM_THOA_THUAN", "Bảo mật thông tin (NDA)", 5, "Vi phạm và bồi thường", "{VI_PHAM}"], ["DK_THOA_THUAN_BAO_MAT_THONG_TIN_NDA_06", "FM_THOA_THUAN", "Bảo mật thông tin (NDA)", 6, "Hiệu lực", "Thỏa thuận có hiệu lực từ ngày {NGAY_HIEU_LUC}, được lập thành 02 bản, mỗi bên giữ 01 bản."], ["DK_THOA_THUAN_BIEN_BAN_GHI_NHO_MOU_01", "FM_THOA_THUAN", "Biên bản ghi nhớ (MOU)", 1, "Nội dung ghi nhớ", "{PHAM_VI}"], ["DK_THOA_THUAN_BIEN_BAN_GHI_NHO_MOU_02", "FM_THOA_THUAN", "Biên bản ghi nhớ (MOU)", 2, "Tính chất của biên bản", "Biên bản ghi nhớ thể hiện ý định hợp tác của hai bên; các nghĩa vụ cụ thể sẽ được xác lập bằng hợp đồng riêng. Điều khoản bảo mật có hiệu lực ràng buộc kể từ ngày ký."], ["DK_THOA_THUAN_BIEN_BAN_GHI_NHO_MOU_03", "FM_THOA_THUAN", "Biên bản ghi nhớ (MOU)", 3, "Hiệu lực", "Từ ngày {NGAY_HIEU_LUC} đến ngày {NGAY_HET_HAN}."], ["DK_THOA_THUAN_MAC_DINH_01", "FM_THOA_THUAN", "*", 1, "Nội dung cam kết, thỏa thuận", "{PHAM_VI}"], ["DK_THOA_THUAN_MAC_DINH_02", "FM_THOA_THUAN", "*", 2, "Thời hạn", "Từ ngày {NGAY_HIEU_LUC} đến ngày {NGAY_HET_HAN}."], ["DK_THOA_THUAN_MAC_DINH_03", "FM_THOA_THUAN", "*", 3, "Trách nhiệm khi vi phạm", "{VI_PHAM}"], ["DK_THOA_THUAN_MAC_DINH_04", "FM_THOA_THUAN", "*", 4, "Hiệu lực", "Văn bản được lập thành 02 bản có giá trị như nhau, mỗi bên giữ 01 bản."]];

/** Thông tin công ty dùng cho mọi biểu mẫu (sửa trên sheet DM_CONG_TY, cột GIA_TRI). */
const COMPANY_INFO_HEADERS = ['KHOA', 'GIA_TRI', 'MO_TA'];
const COMPANY_INFO_SEEDS = [["TEN_DON_VI", "Công ty TNHH Công nghệ Tin học Phi Long", "Tên đầy đủ (in trong hợp đồng, căn cứ)"], ["TEN_DAU_TRANG", "CÔNG TY TNHH CÔNG NGHỆ\nTIN HỌC PHI LONG", "Tên in ở góc trái đầu trang Quốc hiệu (xuống dòng bằng Alt+Enter)"], ["DIA_CHI", "152-158 Hàm Nghi, Phường Thanh Khê, TP. Đà Nẵng, Việt Nam", "Địa chỉ đầy đủ"], ["DIA_CHI_NGAN", "152-158 Hàm Nghi, TP. Đà Nẵng", "Địa chỉ ngắn in dưới logo"], ["MA_SO_THUE", "0400127402", "Mã số thuế"], ["NGUOI_DAI_DIEN", "Nguyễn Khoa Long", "Người đại diện theo pháp luật"], ["CHUC_VU", "Giám đốc", "Chức vụ người đại diện"], ["SO_TAI_KHOAN", "10201 0000 618 243", "Số tài khoản"], ["NGAN_HANG", "Ngân hàng Công Thương Việt Nam – CN Đà Nẵng", "Ngân hàng"], ["DIEN_THOAI", "(0236) 3 888 000", "Điện thoại (cần xác nhận)"], ["EMAIL", "philong@philong.com.vn", "Email (cần xác nhận)"], ["WEBSITE", "www.philong.com.vn", "Website (cần xác nhận)"], ["NOI_BAN_HANH", "Đà Nẵng", "Địa danh ghi ngày tháng"]];

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
  ["FMV_HOP_DONG_THU_VIEC", "BM-01-01", "Hợp đồng thử việc", "Hợp đồng", "Hợp đồng lao động, phụ lục và các nội dung thỏa thuận liên quan.", 101],
  ["FMV_HOP_DONG_MUA_BAN", "BM-01-02", "Hợp đồng mua bán", "Hợp đồng", "Hợp đồng mua bán, nguyên tắc, dịch vụ, thuê, thi công, bảo trì, vận chuyển, hợp tác, đại lý, gia công, tư vấn, phần mềm.", 102],
  ["FMV_HOP_DONG_NGUYEN_TAC", "BM-01-03", "Hợp đồng nguyên tắc", "Hợp đồng", "Hợp đồng mua bán, nguyên tắc, dịch vụ, thuê, thi công, bảo trì, vận chuyển, hợp tác, đại lý, gia công, tư vấn, phần mềm.", 103],
  ["FMV_HOP_DONG_DICH_VU", "BM-01-04", "Hợp đồng dịch vụ", "Hợp đồng", "Hợp đồng mua bán, nguyên tắc, dịch vụ, thuê, thi công, bảo trì, vận chuyển, hợp tác, đại lý, gia công, tư vấn, phần mềm.", 104],
  ["FMV_HOP_DONG_THUE", "BM-01-05", "Hợp đồng thuê", "Hợp đồng", "Hợp đồng mua bán, nguyên tắc, dịch vụ, thuê, thi công, bảo trì, vận chuyển, hợp tác, đại lý, gia công, tư vấn, phần mềm.", 105],
  ["FMV_HOP_DONG_CHO_THUE", "BM-01-06", "Hợp đồng cho thuê", "Hợp đồng", "Hợp đồng mua bán, nguyên tắc, dịch vụ, thuê, thi công, bảo trì, vận chuyển, hợp tác, đại lý, gia công, tư vấn, phần mềm.", 106],
  ["FMV_HOP_DONG_THI_CONG", "BM-01-07", "Hợp đồng thi công", "Hợp đồng", "Hợp đồng mua bán, nguyên tắc, dịch vụ, thuê, thi công, bảo trì, vận chuyển, hợp tác, đại lý, gia công, tư vấn, phần mềm.", 107],
  ["FMV_HOP_DONG_BAO_TRI", "BM-01-08", "Hợp đồng bảo trì", "Hợp đồng", "Hợp đồng mua bán, nguyên tắc, dịch vụ, thuê, thi công, bảo trì, vận chuyển, hợp tác, đại lý, gia công, tư vấn, phần mềm.", 108],
  ["FMV_HOP_DONG_VAN_CHUYEN", "BM-01-09", "Hợp đồng vận chuyển", "Hợp đồng", "Hợp đồng mua bán, nguyên tắc, dịch vụ, thuê, thi công, bảo trì, vận chuyển, hợp tác, đại lý, gia công, tư vấn, phần mềm.", 109],
  ["FMV_HOP_DONG_HOP_TAC", "BM-01-10", "Hợp đồng hợp tác", "Hợp đồng", "Hợp đồng mua bán, nguyên tắc, dịch vụ, thuê, thi công, bảo trì, vận chuyển, hợp tác, đại lý, gia công, tư vấn, phần mềm.", 110],
  ["FMV_HOP_DONG_DAI_LY", "BM-01-11", "Hợp đồng đại lý", "Hợp đồng", "Hợp đồng mua bán, nguyên tắc, dịch vụ, thuê, thi công, bảo trì, vận chuyển, hợp tác, đại lý, gia công, tư vấn, phần mềm.", 111],
  ["FMV_HOP_DONG_PHAN_PHOI", "BM-01-12", "Hợp đồng phân phối", "Hợp đồng", "Hợp đồng mua bán, nguyên tắc, dịch vụ, thuê, thi công, bảo trì, vận chuyển, hợp tác, đại lý, gia công, tư vấn, phần mềm.", 112],
  ["FMV_HOP_DONG_GIA_CONG", "BM-01-13", "Hợp đồng gia công", "Hợp đồng", "Hợp đồng mua bán, nguyên tắc, dịch vụ, thuê, thi công, bảo trì, vận chuyển, hợp tác, đại lý, gia công, tư vấn, phần mềm.", 113],
  ["FMV_HOP_DONG_TU_VAN", "BM-01-14", "Hợp đồng tư vấn", "Hợp đồng", "Hợp đồng mua bán, nguyên tắc, dịch vụ, thuê, thi công, bảo trì, vận chuyển, hợp tác, đại lý, gia công, tư vấn, phần mềm.", 114],
  ["FMV_HOP_DONG_VAY", "BM-01-15", "Hợp đồng vay", "Hợp đồng", "Hợp đồng mua bán, nguyên tắc, dịch vụ, thuê, thi công, bảo trì, vận chuyển, hợp tác, đại lý, gia công, tư vấn, phần mềm.", 115],
  ["FMV_HOP_DONG_PHAN_MEM", "BM-01-16", "Hợp đồng phần mềm", "Hợp đồng", "Hợp đồng mua bán, nguyên tắc, dịch vụ, thuê, thi công, bảo trì, vận chuyển, hợp tác, đại lý, gia công, tư vấn, phần mềm.", 116],
  ["FMV_HOP_DONG_BAN_QUYEN", "BM-01-17", "Hợp đồng bản quyền", "Hợp đồng", "Hợp đồng mua bán, nguyên tắc, dịch vụ, thuê, thi công, bảo trì, vận chuyển, hợp tác, đại lý, gia công, tư vấn, phần mềm.", 117],
  ["FMV_HOP_DONG_CHUYEN_GIAO", "BM-01-18", "Hợp đồng chuyển giao", "Hợp đồng", "Hợp đồng mua bán, nguyên tắc, dịch vụ, thuê, thi công, bảo trì, vận chuyển, hợp tác, đại lý, gia công, tư vấn, phần mềm.", 118],
  ["FMV_PHU_LUC_GIA_HAN_HOP_DONG", "BM-02-01", "Phụ lục gia hạn hợp đồng", "Phụ lục hợp đồng", "Gia hạn, điều chỉnh giá trị, khối lượng, thời gian, phạm vi công việc hoặc thông tin các bên.", 119],
  ["FMV_PHU_LUC_DIEU_CHINH_GIA_TRI_HOP_DONG", "BM-02-02", "Phụ lục điều chỉnh giá trị hợp đồng", "Phụ lục hợp đồng", "Gia hạn, điều chỉnh giá trị, khối lượng, thời gian, phạm vi công việc hoặc thông tin các bên.", 120],
  ["FMV_PHU_LUC_DIEU_CHINH_KHOI_LUONG", "BM-02-03", "Phụ lục điều chỉnh khối lượng", "Phụ lục hợp đồng", "Gia hạn, điều chỉnh giá trị, khối lượng, thời gian, phạm vi công việc hoặc thông tin các bên.", 121],
  ["FMV_PHU_LUC_DIEU_CHINH_THOI_GIAN", "BM-02-04", "Phụ lục điều chỉnh thời gian", "Phụ lục hợp đồng", "Gia hạn, điều chỉnh giá trị, khối lượng, thời gian, phạm vi công việc hoặc thông tin các bên.", 122],
  ["FMV_PHU_LUC_DIEU_CHINH_PHAM_VI_CONG_VIEC", "BM-02-05", "Phụ lục điều chỉnh phạm vi công việc", "Phụ lục hợp đồng", "Gia hạn, điều chỉnh giá trị, khối lượng, thời gian, phạm vi công việc hoặc thông tin các bên.", 123],
  ["FMV_PHU_LUC_THAY_DOI_THONG_TIN_CAC_BEN", "BM-02-06", "Phụ lục thay đổi thông tin các bên", "Phụ lục hợp đồng", "Gia hạn, điều chỉnh giá trị, khối lượng, thời gian, phạm vi công việc hoặc thông tin các bên.", 124],
  ["FMV_BIEN_BAN_NGHIEM_THU_HOP_DONG", "BM-03-01", "Biên bản nghiệm thu hợp đồng", "Biên bản hợp đồng", "Biên bản nghiệm thu, bàn giao, đối chiếu, xác nhận khối lượng, thanh lý hợp đồng.", 125],
  ["FMV_BIEN_BAN_BAN_GIAO_THEO_HOP_DONG", "BM-03-02", "Biên bản bàn giao theo hợp đồng", "Biên bản hợp đồng", "Biên bản nghiệm thu, bàn giao, đối chiếu, xác nhận khối lượng, thanh lý hợp đồng.", 126],
  ["FMV_BIEN_BAN_DOI_CHIEU_HOP_DONG", "BM-03-03", "Biên bản đối chiếu hợp đồng", "Biên bản hợp đồng", "Biên bản nghiệm thu, bàn giao, đối chiếu, xác nhận khối lượng, thanh lý hợp đồng.", 127],
  ["FMV_BIEN_BAN_XAC_NHAN_KHOI_LUONG", "BM-03-04", "Biên bản xác nhận khối lượng", "Biên bản hợp đồng", "Biên bản nghiệm thu, bàn giao, đối chiếu, xác nhận khối lượng, thanh lý hợp đồng.", 128],
  ["FMV_BIEN_BAN_THANH_LY_HOP_DONG", "BM-03-05", "Biên bản thanh lý hợp đồng", "Biên bản hợp đồng", "Biên bản nghiệm thu, bàn giao, đối chiếu, xác nhận khối lượng, thanh lý hợp đồng.", 129],
  ["FMV_BAN_CAM_KET", "BM-16-01", "Bản cam kết", "Cam kết – Thỏa thuận", "Cam kết, bảo mật (NDA), biên bản ghi nhớ (MOU), thỏa thuận nguyên tắc, trách nhiệm, sử dụng tài sản.", 130],
  ["FMV_THOA_THUAN_BAO_MAT_THONG_TIN_NDA", "BM-16-02", "Thỏa thuận bảo mật thông tin (NDA)", "Cam kết – Thỏa thuận", "Cam kết, bảo mật (NDA), biên bản ghi nhớ (MOU), thỏa thuận nguyên tắc, trách nhiệm, sử dụng tài sản.", 131],
  ["FMV_BIEN_BAN_GHI_NHO_MOU", "BM-16-03", "Biên bản ghi nhớ (MOU)", "Cam kết – Thỏa thuận", "Cam kết, bảo mật (NDA), biên bản ghi nhớ (MOU), thỏa thuận nguyên tắc, trách nhiệm, sử dụng tài sản.", 132],
  ["FMV_THOA_THUAN_NGUYEN_TAC", "BM-16-04", "Thỏa thuận nguyên tắc", "Cam kết – Thỏa thuận", "Cam kết, bảo mật (NDA), biên bản ghi nhớ (MOU), thỏa thuận nguyên tắc, trách nhiệm, sử dụng tài sản.", 133],
  ["FMV_CAM_KET_TRACH_NHIEM", "BM-16-05", "Cam kết trách nhiệm", "Cam kết – Thỏa thuận", "Cam kết, bảo mật (NDA), biên bản ghi nhớ (MOU), thỏa thuận nguyên tắc, trách nhiệm, sử dụng tài sản.", 134],
  ["FMV_CAM_KET_SU_DUNG_TAI_SAN", "BM-16-06", "Cam kết sử dụng tài sản", "Cam kết – Thỏa thuận", "Cam kết, bảo mật (NDA), biên bản ghi nhớ (MOU), thỏa thuận nguyên tắc, trách nhiệm, sử dụng tài sản.", 135],
  ["FMV_DON_XIN_NGHI_KHONG_LUONG", "BM-04-01", "Đơn xin nghỉ không lương", "Mẫu đơn", "Đơn xin nghỉ không lương, nghỉ việc, xin việc, điều chuyển, xác nhận, đề nghị, khiếu nại, giải trình.", 136],
  ["FMV_DON_XIN_NGHI_VIEC", "BM-04-02", "Đơn xin nghỉ việc", "Mẫu đơn", "Đơn xin nghỉ không lương, nghỉ việc, xin việc, điều chuyển, xác nhận, đề nghị, khiếu nại, giải trình.", 137],
  ["FMV_DON_XIN_VIEC", "BM-04-03", "Đơn xin việc", "Mẫu đơn", "Đơn xin nghỉ không lương, nghỉ việc, xin việc, điều chuyển, xác nhận, đề nghị, khiếu nại, giải trình.", 138],
  ["FMV_DON_XIN_DIEU_CHUYEN", "BM-04-04", "Đơn xin điều chuyển", "Mẫu đơn", "Đơn xin nghỉ không lương, nghỉ việc, xin việc, điều chuyển, xác nhận, đề nghị, khiếu nại, giải trình.", 139],
  ["FMV_DON_XIN_XAC_NHAN", "BM-04-05", "Đơn xin xác nhận", "Mẫu đơn", "Đơn xin nghỉ không lương, nghỉ việc, xin việc, điều chuyển, xác nhận, đề nghị, khiếu nại, giải trình.", 140],
  ["FMV_DON_DE_NGHI", "BM-04-06", "Đơn đề nghị", "Mẫu đơn", "Đơn xin nghỉ không lương, nghỉ việc, xin việc, điều chuyển, xác nhận, đề nghị, khiếu nại, giải trình.", 141],
  ["FMV_DON_KHIEU_NAI", "BM-04-07", "Đơn khiếu nại", "Mẫu đơn", "Đơn xin nghỉ không lương, nghỉ việc, xin việc, điều chuyển, xác nhận, đề nghị, khiếu nại, giải trình.", 142],
  ["FMV_BAN_GIAI_TRINH", "BM-04-08", "Bản giải trình", "Mẫu đơn", "Đơn xin nghỉ không lương, nghỉ việc, xin việc, điều chuyển, xác nhận, đề nghị, khiếu nại, giải trình.", 143],
  ["FMV_DE_NGHI_THANH_TOAN_NHA_CUNG_CAP", "BM-05-01", "Đề nghị thanh toán nhà cung cấp", "Đề nghị thanh toán", "Đề nghị thanh toán chi phí, công tác phí hoặc khoản phải trả.", 144],
  ["FMV_DE_NGHI_THANH_TOAN_HOP_DONG", "BM-05-02", "Đề nghị thanh toán hợp đồng", "Đề nghị thanh toán", "Đề nghị thanh toán chi phí, công tác phí hoặc khoản phải trả.", 145],
  ["FMV_DE_NGHI_HOAN_UNG", "BM-05-03", "Đề nghị hoàn ứng", "Đề nghị thanh toán", "Đề nghị thanh toán chi phí, công tác phí hoặc khoản phải trả.", 146],
  ["FMV_DE_NGHI_THANH_TOAN_CHI_PHI", "BM-05-04", "Đề nghị thanh toán chi phí", "Đề nghị thanh toán", "Đề nghị thanh toán chi phí, công tác phí hoặc khoản phải trả.", 147],
  ["FMV_DE_NGHI_THANH_TOAN_CONG_TAC_PHI", "BM-05-05", "Đề nghị thanh toán công tác phí", "Đề nghị thanh toán", "Đề nghị thanh toán chi phí, công tác phí hoặc khoản phải trả.", 148],
  ["FMV_DE_NGHI_TAM_UNG_MUA_HANG", "BM-06-01", "Đề nghị tạm ứng mua hàng", "Đề nghị tạm ứng", "Đề nghị tạm ứng chi phí công tác, mua sắm hoặc thực hiện công việc được giao.", 149],
  ["FMV_DE_NGHI_TAM_UNG_CONG_TAC", "BM-06-02", "Đề nghị tạm ứng công tác", "Đề nghị tạm ứng", "Đề nghị tạm ứng chi phí công tác, mua sắm hoặc thực hiện công việc được giao.", 150],
  ["FMV_DE_NGHI_TAM_UNG_THI_CONG", "BM-06-03", "Đề nghị tạm ứng thi công", "Đề nghị tạm ứng", "Đề nghị tạm ứng chi phí công tác, mua sắm hoặc thực hiện công việc được giao.", 151],
  ["FMV_DE_NGHI_TAM_UNG_SU_KIEN", "BM-06-04", "Đề nghị tạm ứng sự kiện", "Đề nghị tạm ứng", "Đề nghị tạm ứng chi phí công tác, mua sắm hoặc thực hiện công việc được giao.", 152],
  ["FMV_DE_NGHI_TAM_UNG_CHI_PHI_HOAT_DONG", "BM-06-05", "Đề nghị tạm ứng chi phí hoạt động", "Đề nghị tạm ứng", "Đề nghị tạm ứng chi phí công tác, mua sắm hoặc thực hiện công việc được giao.", 153],
  ["FMV_DE_NGHI_MUA_VAT_TU", "BM-07-01", "Đề nghị mua vật tư", "Đề nghị mua hàng", "Đề nghị mua vật tư, thiết bị, công cụ dụng cụ, hàng hóa, dịch vụ.", 154],
  ["FMV_DE_NGHI_MUA_THIET_BI", "BM-07-02", "Đề nghị mua thiết bị", "Đề nghị mua hàng", "Đề nghị mua vật tư, thiết bị, công cụ dụng cụ, hàng hóa, dịch vụ.", 155],
  ["FMV_DE_NGHI_MUA_CONG_CU_DUNG_CU", "BM-07-03", "Đề nghị mua công cụ dụng cụ", "Đề nghị mua hàng", "Đề nghị mua vật tư, thiết bị, công cụ dụng cụ, hàng hóa, dịch vụ.", 156],
  ["FMV_DE_NGHI_MUA_HANG_HOA", "BM-07-04", "Đề nghị mua hàng hóa", "Đề nghị mua hàng", "Đề nghị mua vật tư, thiết bị, công cụ dụng cụ, hàng hóa, dịch vụ.", 157],
  ["FMV_DE_NGHI_MUA_DICH_VU", "BM-07-05", "Đề nghị mua dịch vụ", "Đề nghị mua hàng", "Đề nghị mua vật tư, thiết bị, công cụ dụng cụ, hàng hóa, dịch vụ.", 158],
  ["FMV_DE_XUAT_MUA_SAM", "BM-08-01", "Đề xuất mua sắm", "Đề xuất", "Đề xuất công việc, mua sắm, điều chuyển hoặc xử lý nghiệp vụ.", 159],
  ["FMV_DE_XUAT_SUA_CHUA", "BM-08-02", "Đề xuất sửa chữa", "Đề xuất", "Đề xuất công việc, mua sắm, điều chuyển hoặc xử lý nghiệp vụ.", 160],
  ["FMV_DE_XUAT_DAU_TU", "BM-08-03", "Đề xuất đầu tư", "Đề xuất", "Đề xuất công việc, mua sắm, điều chuyển hoặc xử lý nghiệp vụ.", 161],
  ["FMV_DE_XUAT_THAY_THE_THIET_BI", "BM-08-04", "Đề xuất thay thế thiết bị", "Đề xuất", "Đề xuất công việc, mua sắm, điều chuyển hoặc xử lý nghiệp vụ.", 162],
  ["FMV_DE_XUAT_CAP_NGAN_SACH", "BM-08-05", "Đề xuất cấp ngân sách", "Đề xuất", "Đề xuất công việc, mua sắm, điều chuyển hoặc xử lý nghiệp vụ.", 163],
  ["FMV_DE_XUAT_CAI_TIEN_CONG_VIEC", "BM-08-06", "Đề xuất cải tiến công việc", "Đề xuất", "Đề xuất công việc, mua sắm, điều chuyển hoặc xử lý nghiệp vụ.", 164],
  ["FMV_TO_TRINH_XIN_CHU_TRUONG", "BM-09-01", "Tờ trình xin chủ trương", "Tờ trình", "Xin chủ trương, phê duyệt mua sắm, thanh toán, đầu tư, nhân sự, ngân sách, sửa chữa.", 165],
  ["FMV_TO_TRINH_PHE_DUYET_MUA_SAM", "BM-09-02", "Tờ trình phê duyệt mua sắm", "Tờ trình", "Xin chủ trương, phê duyệt mua sắm, thanh toán, đầu tư, nhân sự, ngân sách, sửa chữa.", 166],
  ["FMV_TO_TRINH_PHE_DUYET_THANH_TOAN", "BM-09-03", "Tờ trình phê duyệt thanh toán", "Tờ trình", "Xin chủ trương, phê duyệt mua sắm, thanh toán, đầu tư, nhân sự, ngân sách, sửa chữa.", 167],
  ["FMV_TO_TRINH_DAU_TU", "BM-09-04", "Tờ trình đầu tư", "Tờ trình", "Xin chủ trương, phê duyệt mua sắm, thanh toán, đầu tư, nhân sự, ngân sách, sửa chữa.", 168],
  ["FMV_TO_TRINH_NHAN_SU", "BM-09-05", "Tờ trình nhân sự", "Tờ trình", "Xin chủ trương, phê duyệt mua sắm, thanh toán, đầu tư, nhân sự, ngân sách, sửa chữa.", 169],
  ["FMV_TO_TRINH_NGAN_SACH", "BM-09-06", "Tờ trình ngân sách", "Tờ trình", "Xin chủ trương, phê duyệt mua sắm, thanh toán, đầu tư, nhân sự, ngân sách, sửa chữa.", 170],
  ["FMV_TO_TRINH_SUA_CHUA", "BM-09-07", "Tờ trình sửa chữa", "Tờ trình", "Xin chủ trương, phê duyệt mua sắm, thanh toán, đầu tư, nhân sự, ngân sách, sửa chữa.", 171],
  ["FMV_BIEN_BAN_HOP", "BM-10-01", "Biên bản họp", "Biên bản", "Biên bản họp, làm việc, xác nhận, kiểm tra.", 172],
  ["FMV_BIEN_BAN_LAM_VIEC", "BM-10-02", "Biên bản làm việc", "Biên bản", "Biên bản họp, làm việc, xác nhận, kiểm tra.", 173],
  ["FMV_BIEN_BAN_XAC_NHAN", "BM-10-03", "Biên bản xác nhận", "Biên bản", "Biên bản họp, làm việc, xác nhận, kiểm tra.", 174],
  ["FMV_BIEN_BAN_NGHIEM_THU", "BM-10-04", "Biên bản nghiệm thu", "Biên bản", "Nghiệm thu hàng hóa, thiết bị, dịch vụ, công việc, thi công, khối lượng.", 175],
  ["FMV_BIEN_BAN_KIEM_KE", "BM-10-05", "Biên bản kiểm kê", "Biên bản", "Kiểm kê hàng hóa, kho, tài sản, thiết bị, công cụ dụng cụ.", 176],
  ["FMV_BIEN_BAN_DOI_CHIEU", "BM-10-06", "Biên bản đối chiếu", "Biên bản", "Biên bản họp, làm việc, xác nhận, kiểm tra.", 177],
  ["FMV_BIEN_BAN_SU_CO", "BM-10-07", "Biên bản sự cố", "Biên bản", "Biên bản sự cố, vi phạm, mất tài sản, hư hỏng, bồi thường, giải trình.", 178],
  ["FMV_BIEN_BAN_VI_PHAM", "BM-10-08", "Biên bản vi phạm", "Biên bản", "Biên bản sự cố, vi phạm, mất tài sản, hư hỏng, bồi thường, giải trình.", 179],
  ["FMV_BIEN_BAN_MAT_HONG_TAI_SAN", "BM-10-09", "Biên bản mất / hỏng tài sản", "Biên bản", "Biên bản sự cố, vi phạm, mất tài sản, hư hỏng, bồi thường, giải trình.", 180],
  ["FMV_QUYET_DINH_BO_NHIEM", "BM-11-01", "Quyết định bổ nhiệm", "Quyết định", "Bổ nhiệm, miễn nhiệm, điều chuyển, tiếp nhận, tăng lương, khen thưởng, kỷ luật, thành lập tổ/ban, phân công.", 181],
  ["FMV_QUYET_DINH_MIEN_NHIEM", "BM-11-02", "Quyết định miễn nhiệm", "Quyết định", "Bổ nhiệm, miễn nhiệm, điều chuyển, tiếp nhận, tăng lương, khen thưởng, kỷ luật, thành lập tổ/ban, phân công.", 182],
  ["FMV_QUYET_DINH_DIEU_CHUYEN", "BM-11-03", "Quyết định điều chuyển", "Quyết định", "Bổ nhiệm, miễn nhiệm, điều chuyển, tiếp nhận, tăng lương, khen thưởng, kỷ luật, thành lập tổ/ban, phân công.", 183],
  ["FMV_QUYET_DINH_TIEP_NHAN", "BM-11-04", "Quyết định tiếp nhận", "Quyết định", "Bổ nhiệm, miễn nhiệm, điều chuyển, tiếp nhận, tăng lương, khen thưởng, kỷ luật, thành lập tổ/ban, phân công.", 184],
  ["FMV_QUYET_DINH_TANG_LUONG", "BM-11-05", "Quyết định tăng lương", "Quyết định", "Bổ nhiệm, miễn nhiệm, điều chuyển, tiếp nhận, tăng lương, khen thưởng, kỷ luật, thành lập tổ/ban, phân công.", 185],
  ["FMV_QUYET_DINH_KHEN_THUONG", "BM-11-06", "Quyết định khen thưởng", "Quyết định", "Bổ nhiệm, miễn nhiệm, điều chuyển, tiếp nhận, tăng lương, khen thưởng, kỷ luật, thành lập tổ/ban, phân công.", 186],
  ["FMV_QUYET_DINH_KY_LUAT", "BM-11-07", "Quyết định kỷ luật", "Quyết định", "Bổ nhiệm, miễn nhiệm, điều chuyển, tiếp nhận, tăng lương, khen thưởng, kỷ luật, thành lập tổ/ban, phân công.", 187],
  ["FMV_QUYET_DINH_THANH_LAP_TO_BAN", "BM-11-08", "Quyết định thành lập tổ/ban", "Quyết định", "Bổ nhiệm, miễn nhiệm, điều chuyển, tiếp nhận, tăng lương, khen thưởng, kỷ luật, thành lập tổ/ban, phân công.", 188],
  ["FMV_QUYET_DINH_PHAN_CONG_NHIEM_VU", "BM-11-09", "Quyết định phân công nhiệm vụ", "Quyết định", "Bổ nhiệm, miễn nhiệm, điều chuyển, tiếp nhận, tăng lương, khen thưởng, kỷ luật, thành lập tổ/ban, phân công.", 189],
  ["FMV_THONG_BAO_NOI_BO", "BM-12-01", "Thông báo nội bộ", "Thông báo", "Thông báo nội bộ, nghỉ lễ, lịch làm việc, nhân sự, chính sách, sự kiện, thay đổi quy định.", 190],
  ["FMV_THONG_BAO_NGHI_LE", "BM-12-02", "Thông báo nghỉ lễ", "Thông báo", "Thông báo nội bộ, nghỉ lễ, lịch làm việc, nhân sự, chính sách, sự kiện, thay đổi quy định.", 191],
  ["FMV_THONG_BAO_LICH_LAM_VIEC", "BM-12-03", "Thông báo lịch làm việc", "Thông báo", "Thông báo nội bộ, nghỉ lễ, lịch làm việc, nhân sự, chính sách, sự kiện, thay đổi quy định.", 192],
  ["FMV_THONG_BAO_NHAN_SU", "BM-12-04", "Thông báo nhân sự", "Thông báo", "Thông báo nội bộ, nghỉ lễ, lịch làm việc, nhân sự, chính sách, sự kiện, thay đổi quy định.", 193],
  ["FMV_THONG_BAO_CHINH_SACH", "BM-12-05", "Thông báo chính sách", "Thông báo", "Thông báo nội bộ, nghỉ lễ, lịch làm việc, nhân sự, chính sách, sự kiện, thay đổi quy định.", 194],
  ["FMV_THONG_BAO_SU_KIEN", "BM-12-06", "Thông báo sự kiện", "Thông báo", "Thông báo nội bộ, nghỉ lễ, lịch làm việc, nhân sự, chính sách, sự kiện, thay đổi quy định.", 195],
  ["FMV_THONG_BAO_THAY_DOI_QUY_DINH", "BM-12-07", "Thông báo thay đổi quy định", "Thông báo", "Thông báo nội bộ, nghỉ lễ, lịch làm việc, nhân sự, chính sách, sự kiện, thay đổi quy định.", 196],
  ["FMV_CONG_VAN_DI", "BM-13-01", "Công văn đi", "Công văn", "Công văn đi, đến, đề nghị, trả lời, phúc đáp, giải trình, xác nhận.", 197],
  ["FMV_CONG_VAN_DEN", "BM-13-02", "Công văn đến", "Công văn", "Công văn đi, đến, đề nghị, trả lời, phúc đáp, giải trình, xác nhận.", 198],
  ["FMV_CONG_VAN_DE_NGHI", "BM-13-03", "Công văn đề nghị", "Công văn", "Công văn đi, đến, đề nghị, trả lời, phúc đáp, giải trình, xác nhận.", 199],
  ["FMV_CONG_VAN_TRA_LOI", "BM-13-04", "Công văn trả lời", "Công văn", "Công văn đi, đến, đề nghị, trả lời, phúc đáp, giải trình, xác nhận.", 200],
  ["FMV_CONG_VAN_PHUC_DAP", "BM-13-05", "Công văn phúc đáp", "Công văn", "Công văn đi, đến, đề nghị, trả lời, phúc đáp, giải trình, xác nhận.", 201],
  ["FMV_CONG_VAN_GIAI_TRINH", "BM-13-06", "Công văn giải trình", "Công văn", "Công văn đi, đến, đề nghị, trả lời, phúc đáp, giải trình, xác nhận.", 202],
  ["FMV_CONG_VAN_XAC_NHAN", "BM-13-07", "Công văn xác nhận", "Công văn", "Công văn đi, đến, đề nghị, trả lời, phúc đáp, giải trình, xác nhận.", 203],
  ["FMV_GIAY_UY_QUYEN_KY", "BM-14-01", "Giấy ủy quyền ký", "Giấy ủy quyền", "Ủy quyền nội bộ, giao nhận hồ sơ hoặc thay mặt xử lý công việc.", 204],
  ["FMV_GIAY_UY_QUYEN_GIAO_DICH", "BM-14-02", "Giấy ủy quyền giao dịch", "Giấy ủy quyền", "Ủy quyền nội bộ, giao nhận hồ sơ hoặc thay mặt xử lý công việc.", 205],
  ["FMV_GIAY_UY_QUYEN_NHAN_HANG", "BM-14-03", "Giấy ủy quyền nhận hàng", "Giấy ủy quyền", "Ủy quyền nội bộ, giao nhận hồ sơ hoặc thay mặt xử lý công việc.", 206],
  ["FMV_GIAY_UY_QUYEN_LAM_VIEC_NGAN_HANG_CO_QUAN", "BM-14-04", "Giấy ủy quyền làm việc ngân hàng / cơ quan", "Giấy ủy quyền", "Ủy quyền nội bộ, giao nhận hồ sơ hoặc thay mặt xử lý công việc.", 207],
  ["FMV_GIAY_UY_QUYEN_THUC_HIEN_THU_TUC", "BM-14-05", "Giấy ủy quyền thực hiện thủ tục", "Giấy ủy quyền", "Ủy quyền nội bộ, giao nhận hồ sơ hoặc thay mặt xử lý công việc.", 208],
  ["FMV_GIAY_GIOI_THIEU_DI_CONG_TAC", "BM-15-01", "Giấy giới thiệu đi công tác", "Giấy giới thiệu", "Giới thiệu đi công tác, liên hệ đối tác, ngân hàng, cơ quan nhà nước.", 209],
  ["FMV_GIAY_GIOI_THIEU_LIEN_HE_DOI_TAC", "BM-15-02", "Giấy giới thiệu liên hệ đối tác", "Giấy giới thiệu", "Giới thiệu đi công tác, liên hệ đối tác, ngân hàng, cơ quan nhà nước.", 210],
  ["FMV_GIAY_GIOI_THIEU_LAM_VIEC_NGAN_HANG", "BM-15-03", "Giấy giới thiệu làm việc ngân hàng", "Giấy giới thiệu", "Giới thiệu đi công tác, liên hệ đối tác, ngân hàng, cơ quan nhà nước.", 211],
  ["FMV_GIAY_GIOI_THIEU_LAM_VIEC_CO_QUAN_NHA_NUOC", "BM-15-04", "Giấy giới thiệu làm việc cơ quan nhà nước", "Giấy giới thiệu", "Giới thiệu đi công tác, liên hệ đối tác, ngân hàng, cơ quan nhà nước.", 212],
  ["FMV_DE_NGHI_DI_CONG_TAC", "BM-28-01", "Đề nghị đi công tác", "Công tác", "Đề nghị công tác, kế hoạch công tác, quyết toán công tác phí.", 213],
  ["FMV_KE_HOACH_CONG_TAC", "BM-28-02", "Kế hoạch công tác", "Công tác", "Đề nghị công tác, kế hoạch công tác, quyết toán công tác phí.", 214],
  ["FMV_QUYET_TOAN_CONG_TAC_PHI", "BM-28-03", "Quyết toán công tác phí", "Công tác", "Đề nghị công tác, kế hoạch công tác, quyết toán công tác phí.", 215],
  ["FMV_KE_HOACH_NGAY", "BM-29-01", "Kế hoạch ngày", "Kế hoạch", "Kế hoạch ngày, tuần, tháng, năm; kinh doanh, nhân sự, mua sắm, bảo trì, ngân sách.", 216],
  ["FMV_KE_HOACH_TUAN", "BM-29-02", "Kế hoạch tuần", "Kế hoạch", "Kế hoạch ngày, tuần, tháng, năm; kinh doanh, nhân sự, mua sắm, bảo trì, ngân sách.", 217],
  ["FMV_KE_HOACH_THANG", "BM-29-03", "Kế hoạch tháng", "Kế hoạch", "Kế hoạch ngày, tuần, tháng, năm; kinh doanh, nhân sự, mua sắm, bảo trì, ngân sách.", 218],
  ["FMV_KE_HOACH_NAM", "BM-29-04", "Kế hoạch năm", "Kế hoạch", "Kế hoạch ngày, tuần, tháng, năm; kinh doanh, nhân sự, mua sắm, bảo trì, ngân sách.", 219],
  ["FMV_KE_HOACH_KINH_DOANH", "BM-29-05", "Kế hoạch kinh doanh", "Kế hoạch", "Kế hoạch ngày, tuần, tháng, năm; kinh doanh, nhân sự, mua sắm, bảo trì, ngân sách.", 220],
  ["FMV_KE_HOACH_NHAN_SU", "BM-29-06", "Kế hoạch nhân sự", "Kế hoạch", "Kế hoạch ngày, tuần, tháng, năm; kinh doanh, nhân sự, mua sắm, bảo trì, ngân sách.", 221],
  ["FMV_KE_HOACH_MUA_SAM", "BM-29-07", "Kế hoạch mua sắm", "Kế hoạch", "Kế hoạch ngày, tuần, tháng, năm; kinh doanh, nhân sự, mua sắm, bảo trì, ngân sách.", 222],
  ["FMV_KE_HOACH_BAO_TRI", "BM-29-08", "Kế hoạch bảo trì", "Kế hoạch", "Kế hoạch ngày, tuần, tháng, năm; kinh doanh, nhân sự, mua sắm, bảo trì, ngân sách.", 223],
  ["FMV_KE_HOACH_NGAN_SACH", "BM-29-09", "Kế hoạch ngân sách", "Kế hoạch", "Kế hoạch ngày, tuần, tháng, năm; kinh doanh, nhân sự, mua sắm, bảo trì, ngân sách.", 224],
  ["FMV_BAO_CAO_CONG_VIEC", "BM-30-01", "Báo cáo công việc", "Báo cáo", "Báo cáo công việc, kinh doanh, tài chính, nhân sự, kho, kỹ thuật, bảo trì, sự cố.", 225],
  ["FMV_BAO_CAO_KINH_DOANH", "BM-30-02", "Báo cáo kinh doanh", "Báo cáo", "Báo cáo công việc, kinh doanh, tài chính, nhân sự, kho, kỹ thuật, bảo trì, sự cố.", 226],
  ["FMV_BAO_CAO_TAI_CHINH", "BM-30-03", "Báo cáo tài chính", "Báo cáo", "Báo cáo công việc, kinh doanh, tài chính, nhân sự, kho, kỹ thuật, bảo trì, sự cố.", 227],
  ["FMV_BAO_CAO_NHAN_SU", "BM-30-04", "Báo cáo nhân sự", "Báo cáo", "Báo cáo công việc, kinh doanh, tài chính, nhân sự, kho, kỹ thuật, bảo trì, sự cố.", 228],
  ["FMV_BAO_CAO_KHO", "BM-30-05", "Báo cáo kho", "Báo cáo", "Báo cáo công việc, kinh doanh, tài chính, nhân sự, kho, kỹ thuật, bảo trì, sự cố.", 229],
  ["FMV_BAO_CAO_KY_THUAT", "BM-30-06", "Báo cáo kỹ thuật", "Báo cáo", "Báo cáo công việc, kinh doanh, tài chính, nhân sự, kho, kỹ thuật, bảo trì, sự cố.", 230],
  ["FMV_BAO_CAO_BAO_TRI", "BM-30-07", "Báo cáo bảo trì", "Báo cáo", "Báo cáo công việc, kinh doanh, tài chính, nhân sự, kho, kỹ thuật, bảo trì, sự cố.", 231],
  ["FMV_BAO_CAO_SU_CO", "BM-30-08", "Báo cáo sự cố", "Báo cáo", "Báo cáo công việc, kinh doanh, tài chính, nhân sự, kho, kỹ thuật, bảo trì, sự cố.", 232],
  ["FMV_BIEN_BAN_BAN_GIAO_CONG_VIEC", "BM-37-01", "Biên bản bàn giao công việc", "Bàn giao", "Bàn giao công việc, hồ sơ và tài sản khi thay đổi vị trí hoặc nghỉ việc.", 233],
  ["FMV_BIEN_BAN_BAN_GIAO_TAI_SAN", "BM-37-02", "Biên bản bàn giao tài sản", "Bàn giao", "Bàn giao công việc, hồ sơ và tài sản khi thay đổi vị trí hoặc nghỉ việc.", 234],
  ["FMV_BIEN_BAN_BAN_GIAO_THIET_BI", "BM-37-03", "Biên bản bàn giao thiết bị", "Bàn giao", "Bàn giao công việc, hồ sơ và tài sản khi thay đổi vị trí hoặc nghỉ việc.", 235],
  ["FMV_BIEN_BAN_BAN_GIAO_HO_SO", "BM-37-04", "Biên bản bàn giao hồ sơ", "Bàn giao", "Bàn giao công việc, hồ sơ và tài sản khi thay đổi vị trí hoặc nghỉ việc.", 236],
  ["FMV_BIEN_BAN_BAN_GIAO_MAT_BANG", "BM-37-05", "Biên bản bàn giao mặt bằng", "Bàn giao", "Bàn giao công việc, hồ sơ và tài sản khi thay đổi vị trí hoặc nghỉ việc.", 237],
  ["FMV_BIEN_BAN_BAN_GIAO_TAI_KHOAN", "BM-37-06", "Biên bản bàn giao tài khoản", "Bàn giao", "Bàn giao công việc, hồ sơ và tài sản khi thay đổi vị trí hoặc nghỉ việc.", 238],
  ["FMV_BIEN_BAN_BAN_GIAO_CHUC_VU", "BM-37-07", "Biên bản bàn giao chức vụ", "Bàn giao", "Bàn giao công việc, hồ sơ và tài sản khi thay đổi vị trí hoặc nghỉ việc.", 239],
  ["FMV_BIEN_BAN_MAT_TAI_SAN", "BM-40-01", "Biên bản mất tài sản", "Sự cố – vi phạm", "Biên bản sự cố, vi phạm, mất tài sản, hư hỏng, bồi thường, giải trình.", 240],
  ["FMV_BIEN_BAN_HU_HONG_TAI_SAN", "BM-40-02", "Biên bản hư hỏng tài sản", "Sự cố – vi phạm", "Biên bản sự cố, vi phạm, mất tài sản, hư hỏng, bồi thường, giải trình.", 241],
  ["FMV_BIEN_BAN_BOI_THUONG", "BM-40-03", "Biên bản bồi thường", "Sự cố – vi phạm", "Biên bản sự cố, vi phạm, mất tài sản, hư hỏng, bồi thường, giải trình.", 242],
  ["FMV_PHIEU_THONG_TIN_NHAN_VIEN", "BM-22-01", "Phiếu thông tin nhân viên", "Nhân sự", "Phiếu thông tin nhân viên, tiếp nhận, đánh giá thử việc, đánh giá định kỳ, tăng lương, nghỉ việc.", 243],
  ["FMV_PHIEU_TIEP_NHAN_NHAN_SU", "BM-22-02", "Phiếu tiếp nhận nhân sự", "Nhân sự", "Phiếu thông tin nhân viên, tiếp nhận, đánh giá thử việc, đánh giá định kỳ, tăng lương, nghỉ việc.", 244],
  ["FMV_PHIEU_DANH_GIA_THU_VIEC", "BM-22-03", "Phiếu đánh giá thử việc", "Nhân sự", "Phiếu thông tin nhân viên, tiếp nhận, đánh giá thử việc, đánh giá định kỳ, tăng lương, nghỉ việc.", 245],
  ["FMV_PHIEU_DANH_GIA_NHAN_VIEN_DINH_KY", "BM-22-04", "Phiếu đánh giá nhân viên định kỳ", "Nhân sự", "Phiếu thông tin nhân viên, tiếp nhận, đánh giá thử việc, đánh giá định kỳ, tăng lương, nghỉ việc.", 246],
  ["FMV_DE_NGHI_TANG_LUONG", "BM-22-05", "Đề nghị tăng lương", "Nhân sự", "Bảng lương, phụ cấp, thưởng, đề nghị tăng lương, xác nhận thu nhập.", 247],
  ["FMV_PHIEU_THU_TUC_NGHI_VIEC", "BM-22-06", "Phiếu thủ tục nghỉ việc", "Nhân sự", "Phiếu thông tin nhân viên, tiếp nhận, đánh giá thử việc, đánh giá định kỳ, tăng lương, nghỉ việc.", 248],
  ["FMV_PHIEU_DANG_KY_TANG_CA", "BM-23-01", "Phiếu đăng ký tăng ca", "Chấm công – nghỉ phép", "Đăng ký tăng ca, đi muộn/về sớm, công tác, điều chỉnh chấm công.", 249],
  ["FMV_PHIEU_GIAI_TRINH_DI_MUON_VE_SOM", "BM-23-02", "Phiếu giải trình đi muộn / về sớm", "Chấm công – nghỉ phép", "Đăng ký tăng ca, đi muộn/về sớm, công tác, điều chỉnh chấm công.", 250],
  ["FMV_PHIEU_DANG_KY_DI_CONG_TAC", "BM-23-03", "Phiếu đăng ký đi công tác", "Chấm công – nghỉ phép", "Đăng ký tăng ca, đi muộn/về sớm, công tác, điều chỉnh chấm công.", 251],
  ["FMV_PHIEU_DIEU_CHINH_CHAM_CONG", "BM-23-04", "Phiếu điều chỉnh chấm công", "Chấm công – nghỉ phép", "Đăng ký tăng ca, đi muộn/về sớm, công tác, điều chỉnh chấm công.", 252],
  ["FMV_BANG_LUONG", "BM-24-01", "Bảng lương", "Lương – chế độ", "Bảng lương, phụ cấp, thưởng, đề nghị tăng lương, xác nhận thu nhập.", 253],
  ["FMV_DE_NGHI_PHU_CAP", "BM-24-02", "Đề nghị phụ cấp", "Lương – chế độ", "Bảng lương, phụ cấp, thưởng, đề nghị tăng lương, xác nhận thu nhập.", 254],
  ["FMV_DE_NGHI_THUONG", "BM-24-03", "Đề nghị thưởng", "Lương – chế độ", "Bảng lương, phụ cấp, thưởng, đề nghị tăng lương, xác nhận thu nhập.", 255],
  ["FMV_GIAY_XAC_NHAN_THU_NHAP", "BM-24-04", "Giấy xác nhận thu nhập", "Lương – chế độ", "Bảng lương, phụ cấp, thưởng, đề nghị tăng lương, xác nhận thu nhập.", 256],
  ["FMV_BAN_MO_TA_CONG_VIEC_JD", "BM-25-01", "Bản mô tả công việc (JD)", "Tuyển dụng", "Mô tả công việc (JD), đánh giá phỏng vấn, thư mời nhận việc.", 257],
  ["FMV_PHIEU_DANH_GIA_PHONG_VAN", "BM-25-02", "Phiếu đánh giá phỏng vấn", "Tuyển dụng", "Mô tả công việc (JD), đánh giá phỏng vấn, thư mời nhận việc.", 258],
  ["FMV_THU_MOI_NHAN_VIEC", "BM-25-03", "Thư mời nhận việc", "Tuyển dụng", "Mô tả công việc (JD), đánh giá phỏng vấn, thư mời nhận việc.", 259],
  ["FMV_KE_HOACH_DAO_TAO", "BM-26-01", "Kế hoạch đào tạo", "Đào tạo", "Kế hoạch đào tạo, danh sách học viên, đánh giá kết quả, chứng nhận.", 260],
  ["FMV_DANH_SACH_HOC_VIEN_DAO_TAO", "BM-26-02", "Danh sách học viên đào tạo", "Đào tạo", "Kế hoạch đào tạo, danh sách học viên, đánh giá kết quả, chứng nhận.", 261],
  ["FMV_PHIEU_DANH_GIA_KET_QUA_DAO_TAO", "BM-26-03", "Phiếu đánh giá kết quả đào tạo", "Đào tạo", "Kế hoạch đào tạo, danh sách học viên, đánh giá kết quả, chứng nhận.", 262],
  ["FMV_GIAY_CHUNG_NHAN_DAO_TAO", "BM-26-04", "Giấy chứng nhận đào tạo", "Đào tạo", "Kế hoạch đào tạo, danh sách học viên, đánh giá kết quả, chứng nhận.", 263],
  ["FMV_DE_XUAT_KHEN_THUONG", "BM-27-01", "Đề xuất khen thưởng", "Khen thưởng – kỷ luật", "Đề xuất khen thưởng, đề xuất kỷ luật, biên bản, bản giải trình.", 264],
  ["FMV_DE_XUAT_KY_LUAT", "BM-27-02", "Đề xuất kỷ luật", "Khen thưởng – kỷ luật", "Đề xuất khen thưởng, đề xuất kỷ luật, biên bản, bản giải trình.", 265],
  ["FMV_BIEN_BAN_VI_PHAM_KY_LUAT", "BM-27-03", "Biên bản vi phạm kỷ luật", "Khen thưởng – kỷ luật", "Đề xuất khen thưởng, đề xuất kỷ luật, biên bản, bản giải trình.", 266],
  ["FMV_PHIEU_THU", "BM-19-01", "Phiếu thu", "Phiếu thu – chi", "Phiếu thu, phiếu chi, đề nghị chi, xác nhận thu/chi.", 267],
  ["FMV_PHIEU_CHI", "BM-19-02", "Phiếu chi", "Phiếu thu – chi", "Phiếu thu, phiếu chi, đề nghị chi, xác nhận thu/chi.", 268],
  ["FMV_DE_NGHI_CHI", "BM-19-03", "Đề nghị chi", "Phiếu thu – chi", "Phiếu thu, phiếu chi, đề nghị chi, xác nhận thu/chi.", 269],
  ["FMV_GIAY_XAC_NHAN_THU_CHI", "BM-19-04", "Giấy xác nhận thu / chi", "Phiếu thu – chi", "Phiếu thu, phiếu chi, đề nghị chi, xác nhận thu/chi.", 270],
  ["FMV_BANG_KE_HOA_DON_CHUNG_TU", "BM-41-01", "Bảng kê hóa đơn, chứng từ", "Tài chính – kế toán", "Hóa đơn, chứng từ, ủy nhiệm chi (UNC), đối chiếu công nợ, quyết toán.", 271],
  ["FMV_UY_NHIEM_CHI_UNC", "BM-41-02", "Ủy nhiệm chi (UNC)", "Tài chính – kế toán", "Hóa đơn, chứng từ, ủy nhiệm chi (UNC), đối chiếu công nợ, quyết toán.", 272],
  ["FMV_BIEN_BAN_DOI_CHIEU_CONG_NO", "BM-41-03", "Biên bản đối chiếu công nợ", "Tài chính – kế toán", "Hóa đơn, chứng từ, ủy nhiệm chi (UNC), đối chiếu công nợ, quyết toán.", 273],
  ["FMV_BIEN_BAN_XAC_NHAN_CONG_NO", "BM-41-04", "Biên bản xác nhận công nợ", "Tài chính – kế toán", "Hóa đơn, chứng từ, ủy nhiệm chi (UNC), đối chiếu công nợ, quyết toán.", 274],
  ["FMV_BANG_QUYET_TOAN", "BM-41-05", "Bảng quyết toán", "Tài chính – kế toán", "Hóa đơn, chứng từ, ủy nhiệm chi (UNC), đối chiếu công nợ, quyết toán.", 275],
  ["FMV_THU_XAC_NHAN_CONG_NO_KHACH_HANG", "BM-42-01", "Thư xác nhận công nợ khách hàng", "Khách hàng – công nợ", "Xác nhận công nợ, đề nghị thanh toán, cam kết thanh toán, gia hạn công nợ.", 276],
  ["FMV_DE_NGHI_THANH_TOAN_GUI_KHACH_HANG", "BM-42-02", "Đề nghị thanh toán gửi khách hàng", "Khách hàng – công nợ", "Xác nhận công nợ, đề nghị thanh toán, cam kết thanh toán, gia hạn công nợ.", 277],
  ["FMV_CAM_KET_THANH_TOAN", "BM-42-03", "Cam kết thanh toán", "Khách hàng – công nợ", "Xác nhận công nợ, đề nghị thanh toán, cam kết thanh toán, gia hạn công nợ.", 278],
  ["FMV_DE_NGHI_GIA_HAN_CONG_NO", "BM-42-04", "Đề nghị gia hạn công nợ", "Khách hàng – công nợ", "Xác nhận công nợ, đề nghị thanh toán, cam kết thanh toán, gia hạn công nợ.", 279],
  ["FMV_DON_DAT_HANG_PO", "BM-18-01", "Đơn đặt hàng (PO)", "Đơn đặt hàng", "PO mua hàng, đặt dịch vụ, đặt vật tư, thiết bị.", 280],
  ["FMV_DON_DAT_DICH_VU", "BM-18-02", "Đơn đặt dịch vụ", "Đơn đặt hàng", "PO mua hàng, đặt dịch vụ, đặt vật tư, thiết bị.", 281],
  ["FMV_DON_DAT_VAT_TU", "BM-18-03", "Đơn đặt vật tư", "Đơn đặt hàng", "PO mua hàng, đặt dịch vụ, đặt vật tư, thiết bị.", 282],
  ["FMV_DON_DAT_THIET_BI", "BM-18-04", "Đơn đặt thiết bị", "Đơn đặt hàng", "PO mua hàng, đặt dịch vụ, đặt vật tư, thiết bị.", 283],
  ["FMV_HO_SO_NHA_CUNG_CAP", "BM-43-01", "Hồ sơ nhà cung cấp", "Nhà cung cấp", "Hồ sơ nhà cung cấp, đánh giá NCC, báo giá, so sánh giá.", 284],
  ["FMV_PHIEU_DANH_GIA_NHA_CUNG_CAP", "BM-43-02", "Phiếu đánh giá nhà cung cấp", "Nhà cung cấp", "Hồ sơ nhà cung cấp, đánh giá NCC, báo giá, so sánh giá.", 285],
  ["FMV_BAO_GIA_MUA_HANG", "BM-43-03", "Báo giá mua hàng", "Nhà cung cấp", "Hồ sơ nhà cung cấp, đánh giá NCC, báo giá, so sánh giá.", 286],
  ["FMV_BANG_SO_SANH_GIA", "BM-43-04", "Bảng so sánh giá", "Nhà cung cấp", "Hồ sơ nhà cung cấp, đánh giá NCC, báo giá, so sánh giá.", 287],
  ["FMV_BIEN_BAN_NGHIEM_THU_HANG_HOA", "BM-36-01", "Biên bản nghiệm thu hàng hóa", "Nghiệm thu", "Nghiệm thu hàng hóa, thiết bị, dịch vụ, công việc, thi công, khối lượng.", 288],
  ["FMV_BIEN_BAN_NGHIEM_THU_THIET_BI", "BM-36-02", "Biên bản nghiệm thu thiết bị", "Nghiệm thu", "Nghiệm thu hàng hóa, thiết bị, dịch vụ, công việc, thi công, khối lượng.", 289],
  ["FMV_BIEN_BAN_NGHIEM_THU_DICH_VU", "BM-36-03", "Biên bản nghiệm thu dịch vụ", "Nghiệm thu", "Nghiệm thu hàng hóa, thiết bị, dịch vụ, công việc, thi công, khối lượng.", 290],
  ["FMV_BIEN_BAN_NGHIEM_THU_CONG_VIEC", "BM-36-04", "Biên bản nghiệm thu công việc", "Nghiệm thu", "Nghiệm thu hàng hóa, thiết bị, dịch vụ, công việc, thi công, khối lượng.", 291],
  ["FMV_BIEN_BAN_NGHIEM_THU_THI_CONG", "BM-36-05", "Biên bản nghiệm thu thi công", "Nghiệm thu", "Nghiệm thu hàng hóa, thiết bị, dịch vụ, công việc, thi công, khối lượng.", 292],
  ["FMV_BIEN_BAN_NGHIEM_THU_KHOI_LUONG", "BM-36-06", "Biên bản nghiệm thu khối lượng", "Nghiệm thu", "Nghiệm thu hàng hóa, thiết bị, dịch vụ, công việc, thi công, khối lượng.", 293],
  ["FMV_PHIEU_NHAP_KHO", "BM-20-01", "Phiếu nhập kho", "Kho – vật tư", "Phiếu nhập kho, xuất kho, chuyển kho, trả hàng, điều chỉnh tồn.", 294],
  ["FMV_PHIEU_XUAT_KHO", "BM-20-02", "Phiếu xuất kho", "Kho – vật tư", "Phiếu nhập kho, xuất kho, chuyển kho, trả hàng, điều chỉnh tồn.", 295],
  ["FMV_PHIEU_CHUYEN_KHO", "BM-20-03", "Phiếu chuyển kho", "Kho – vật tư", "Phiếu nhập kho, xuất kho, chuyển kho, trả hàng, điều chỉnh tồn.", 296],
  ["FMV_PHIEU_TRA_HANG", "BM-20-04", "Phiếu trả hàng", "Kho – vật tư", "Phiếu nhập kho, xuất kho, chuyển kho, trả hàng, điều chỉnh tồn.", 297],
  ["FMV_BIEN_BAN_KIEM_KE_KHO", "BM-20-05", "Biên bản kiểm kê kho", "Kho – vật tư", "Kiểm kê hàng hóa, kho, tài sản, thiết bị, công cụ dụng cụ.", 298],
  ["FMV_PHIEU_DIEU_CHINH_TON_KHO", "BM-20-06", "Phiếu điều chỉnh tồn kho", "Kho – vật tư", "Phiếu nhập kho, xuất kho, chuyển kho, trả hàng, điều chỉnh tồn.", 299],
  ["FMV_BIEN_BAN_KIEM_KE_HANG_HOA", "BM-38-01", "Biên bản kiểm kê hàng hóa", "Kiểm kê", "Kiểm kê hàng hóa, kho, tài sản, thiết bị, công cụ dụng cụ.", 300],
  ["FMV_BIEN_BAN_KIEM_KE_TAI_SAN", "BM-38-02", "Biên bản kiểm kê tài sản", "Kiểm kê", "Kiểm kê hàng hóa, kho, tài sản, thiết bị, công cụ dụng cụ.", 301],
  ["FMV_BIEN_BAN_KIEM_KE_THIET_BI", "BM-38-03", "Biên bản kiểm kê thiết bị", "Kiểm kê", "Kiểm kê hàng hóa, kho, tài sản, thiết bị, công cụ dụng cụ.", 302],
  ["FMV_BIEN_BAN_KIEM_KE_CONG_CU_DUNG_CU", "BM-38-04", "Biên bản kiểm kê công cụ dụng cụ", "Kiểm kê", "Kiểm kê hàng hóa, kho, tài sản, thiết bị, công cụ dụng cụ.", 303],
  ["FMV_PHIEU_THU_HOI_TAI_SAN", "BM-21-01", "Phiếu thu hồi tài sản", "Tài sản – thiết bị", "Thu hồi, điều chuyển, sửa chữa, bảo hành, bảo trì tài sản và thiết bị.", 304],
  ["FMV_PHIEU_DIEU_CHUYEN_TAI_SAN", "BM-21-02", "Phiếu điều chuyển tài sản", "Tài sản – thiết bị", "Thu hồi, điều chuyển, sửa chữa, bảo hành, bảo trì tài sản và thiết bị.", 305],
  ["FMV_PHIEU_DE_NGHI_SUA_CHUA_TAI_SAN", "BM-21-03", "Phiếu đề nghị sửa chữa tài sản", "Tài sản – thiết bị", "Thu hồi, điều chuyển, sửa chữa, bảo hành, bảo trì tài sản và thiết bị.", 306],
  ["FMV_PHIEU_BAO_HANH_THIET_BI", "BM-21-04", "Phiếu bảo hành thiết bị", "Tài sản – thiết bị", "Thu hồi, điều chuyển, sửa chữa, bảo hành, bảo trì tài sản và thiết bị.", 307],
  ["FMV_PHIEU_BAO_TRI_THIET_BI", "BM-21-05", "Phiếu bảo trì thiết bị", "Tài sản – thiết bị", "Thu hồi, điều chuyển, sửa chữa, bảo hành, bảo trì tài sản và thiết bị.", 308],
  ["FMV_BIEN_BAN_THANH_LY_TAI_SAN", "BM-21-06", "Biên bản thanh lý tài sản", "Tài sản – thiết bị", "Thanh lý tài sản, thiết bị, hàng hóa, công cụ dụng cụ.", 309],
  ["FMV_BIEN_BAN_THANH_LY_THIET_BI", "BM-39-01", "Biên bản thanh lý thiết bị", "Thanh lý", "Thanh lý tài sản, thiết bị, hàng hóa, công cụ dụng cụ.", 310],
  ["FMV_BIEN_BAN_THANH_LY_HANG_HOA", "BM-39-02", "Biên bản thanh lý hàng hóa", "Thanh lý", "Thanh lý tài sản, thiết bị, hàng hóa, công cụ dụng cụ.", 311],
  ["FMV_BIEN_BAN_THANH_LY_CONG_CU_DUNG_CU", "BM-39-03", "Biên bản thanh lý công cụ dụng cụ", "Thanh lý", "Thanh lý tài sản, thiết bị, hàng hóa, công cụ dụng cụ.", 312],
  ["FMV_BAO_GIA_BAN_HANG", "BM-17-01", "Báo giá bán hàng", "Báo giá", "Báo giá bán hàng, dịch vụ, thi công, sửa chữa.", 313],
  ["FMV_BAO_GIA_DICH_VU", "BM-17-02", "Báo giá dịch vụ", "Báo giá", "Báo giá bán hàng, dịch vụ, thi công, sửa chữa.", 314],
  ["FMV_BAO_GIA_THI_CONG", "BM-17-03", "Báo giá thi công", "Báo giá", "Báo giá bán hàng, dịch vụ, thi công, sửa chữa.", 315],
  ["FMV_BAO_GIA_SUA_CHUA", "BM-17-04", "Báo giá sửa chữa", "Báo giá", "Báo giá bán hàng, dịch vụ, thi công, sửa chữa.", 316],
  ["FMV_DE_XUAT_GIA_BAN", "BM-44-01", "Đề xuất giá bán", "Kinh doanh", "Đề xuất giá, chính sách giá, chiết khấu, đơn hàng, xác nhận đơn hàng.", 317],
  ["FMV_CHINH_SACH_GIA", "BM-44-02", "Chính sách giá", "Kinh doanh", "Đề xuất giá, chính sách giá, chiết khấu, đơn hàng, xác nhận đơn hàng.", 318],
  ["FMV_DE_XUAT_CHIET_KHAU", "BM-44-03", "Đề xuất chiết khấu", "Kinh doanh", "Đề xuất giá, chính sách giá, chiết khấu, đơn hàng, xác nhận đơn hàng.", 319],
  ["FMV_DON_HANG_BAN", "BM-44-04", "Đơn hàng bán", "Kinh doanh", "Đề xuất giá, chính sách giá, chiết khấu, đơn hàng, xác nhận đơn hàng.", 320],
  ["FMV_XAC_NHAN_DON_HANG", "BM-44-05", "Xác nhận đơn hàng", "Kinh doanh", "Đề xuất giá, chính sách giá, chiết khấu, đơn hàng, xác nhận đơn hàng.", 321],
  ["FMV_KE_HOACH_MARKETING_SU_KIEN", "BM-45-01", "Kế hoạch marketing – sự kiện", "Marketing – sự kiện", "Kế hoạch, đề xuất ngân sách, duyệt nội dung, nghiệm thu, quyết toán sự kiện.", 322],
  ["FMV_DE_XUAT_NGAN_SACH_MARKETING", "BM-45-02", "Đề xuất ngân sách marketing", "Marketing – sự kiện", "Kế hoạch, đề xuất ngân sách, duyệt nội dung, nghiệm thu, quyết toán sự kiện.", 323],
  ["FMV_PHIEU_DUYET_NOI_DUNG_TRUYEN_THONG", "BM-45-03", "Phiếu duyệt nội dung truyền thông", "Marketing – sự kiện", "Kế hoạch, đề xuất ngân sách, duyệt nội dung, nghiệm thu, quyết toán sự kiện.", 324],
  ["FMV_BIEN_BAN_NGHIEM_THU_SU_KIEN", "BM-45-04", "Biên bản nghiệm thu sự kiện", "Marketing – sự kiện", "Kế hoạch, đề xuất ngân sách, duyệt nội dung, nghiệm thu, quyết toán sự kiện.", 325],
  ["FMV_QUYET_TOAN_SU_KIEN", "BM-45-05", "Quyết toán sự kiện", "Marketing – sự kiện", "Kế hoạch, đề xuất ngân sách, duyệt nội dung, nghiệm thu, quyết toán sự kiện.", 326],
  ["FMV_PHIEU_YEU_CAU_IT_SUPPORT", "BM-35-01", "Phiếu yêu cầu IT Support", "Phiếu yêu cầu", "Yêu cầu IT Support, sửa chữa, bảo trì, cấp quyền, cấp thiết bị, vật tư, dịch vụ.", 327],
  ["FMV_PHIEU_YEU_CAU_SUA_CHUA", "BM-35-02", "Phiếu yêu cầu sửa chữa", "Phiếu yêu cầu", "Yêu cầu IT Support, sửa chữa, bảo trì, cấp quyền, cấp thiết bị, vật tư, dịch vụ.", 328],
  ["FMV_PHIEU_YEU_CAU_BAO_TRI", "BM-35-03", "Phiếu yêu cầu bảo trì", "Phiếu yêu cầu", "Yêu cầu IT Support, sửa chữa, bảo trì, cấp quyền, cấp thiết bị, vật tư, dịch vụ.", 329],
  ["FMV_PHIEU_YEU_CAU_CAP_QUYEN", "BM-35-04", "Phiếu yêu cầu cấp quyền", "Phiếu yêu cầu", "Yêu cầu IT Support, sửa chữa, bảo trì, cấp quyền, cấp thiết bị, vật tư, dịch vụ.", 330],
  ["FMV_PHIEU_YEU_CAU_CAP_THIET_BI", "BM-35-05", "Phiếu yêu cầu cấp thiết bị", "Phiếu yêu cầu", "Yêu cầu IT Support, sửa chữa, bảo trì, cấp quyền, cấp thiết bị, vật tư, dịch vụ.", 331],
  ["FMV_PHIEU_YEU_CAU_VAT_TU", "BM-35-06", "Phiếu yêu cầu vật tư", "Phiếu yêu cầu", "Yêu cầu IT Support, sửa chữa, bảo trì, cấp quyền, cấp thiết bị, vật tư, dịch vụ.", 332],
  ["FMV_PHIEU_YEU_CAU_DICH_VU", "BM-35-07", "Phiếu yêu cầu dịch vụ", "Phiếu yêu cầu", "Yêu cầu IT Support, sửa chữa, bảo trì, cấp quyền, cấp thiết bị, vật tư, dịch vụ.", 333],
  ["FMV_NHAT_KY_BAO_TRI", "BM-49-01", "Nhật ký bảo trì", "Bảo trì – kỹ thuật", "Kế hoạch bảo trì, nhật ký, biên bản sửa chữa, nghiệm thu.", 334],
  ["FMV_BIEN_BAN_SUA_CHUA", "BM-49-02", "Biên bản sửa chữa", "Bảo trì – kỹ thuật", "Kế hoạch bảo trì, nhật ký, biên bản sửa chữa, nghiệm thu.", 335],
  ["FMV_BIEN_BAN_NGHIEM_THU_BAO_TRI", "BM-49-03", "Biên bản nghiệm thu bảo trì", "Bảo trì – kỹ thuật", "Kế hoạch bảo trì, nhật ký, biên bản sửa chữa, nghiệm thu.", 336],
  ["FMV_PHIEU_CAP_TAI_KHOAN", "BM-48-01", "Phiếu cấp tài khoản", "CNTT – hệ thống", "Cấp tài khoản, cấp quyền, thay đổi quyền, bàn giao tài khoản, thu hồi quyền.", 337],
  ["FMV_PHIEU_CAP_QUYEN_HE_THONG", "BM-48-02", "Phiếu cấp quyền hệ thống", "CNTT – hệ thống", "Cấp tài khoản, cấp quyền, thay đổi quyền, bàn giao tài khoản, thu hồi quyền.", 338],
  ["FMV_PHIEU_THAY_DOI_QUYEN", "BM-48-03", "Phiếu thay đổi quyền", "CNTT – hệ thống", "Cấp tài khoản, cấp quyền, thay đổi quyền, bàn giao tài khoản, thu hồi quyền.", 339],
  ["FMV_PHIEU_THU_HOI_QUYEN", "BM-48-04", "Phiếu thu hồi quyền", "CNTT – hệ thống", "Cấp tài khoản, cấp quyền, thay đổi quyền, bàn giao tài khoản, thu hồi quyền.", 340],
  ["FMV_CHECKLIST_KIEM_TRA_CONG_VIEC", "BM-34-01", "Checklist kiểm tra công việc", "Checklist", "Kiểm tra công việc, thiết bị, bảo trì, vệ sinh, an toàn, bàn giao.", 341],
  ["FMV_CHECKLIST_KIEM_TRA_THIET_BI", "BM-34-02", "Checklist kiểm tra thiết bị", "Checklist", "Kiểm tra công việc, thiết bị, bảo trì, vệ sinh, an toàn, bàn giao.", 342],
  ["FMV_CHECKLIST_KIEM_TRA_BAO_TRI", "BM-34-03", "Checklist kiểm tra bảo trì", "Checklist", "Kiểm tra công việc, thiết bị, bảo trì, vệ sinh, an toàn, bàn giao.", 343],
  ["FMV_CHECKLIST_KIEM_TRA_VE_SINH", "BM-34-04", "Checklist kiểm tra vệ sinh", "Checklist", "Kiểm tra công việc, thiết bị, bảo trì, vệ sinh, an toàn, bàn giao.", 344],
  ["FMV_CHECKLIST_KIEM_TRA_AN_TOAN", "BM-34-05", "Checklist kiểm tra an toàn", "Checklist", "Kiểm tra công việc, thiết bị, bảo trì, vệ sinh, an toàn, bàn giao.", 345],
  ["FMV_CHECKLIST_KIEM_TRA_BAN_GIAO", "BM-34-06", "Checklist kiểm tra bàn giao", "Checklist", "Kiểm tra công việc, thiết bị, bảo trì, vệ sinh, an toàn, bàn giao.", 346],
  ["FMV_BIEN_BAN_KIEM_TRA_AN_TOAN_PCCC", "BM-47-01", "Biên bản kiểm tra an toàn – PCCC", "An toàn – PCCC", "Biên bản kiểm tra, checklist, kế hoạch, hồ sơ huấn luyện, xử lý sự cố an toàn – PCCC.", 347],
  ["FMV_CHECKLIST_AN_TOAN_PCCC", "BM-47-02", "Checklist an toàn – PCCC", "An toàn – PCCC", "Biên bản kiểm tra, checklist, kế hoạch, hồ sơ huấn luyện, xử lý sự cố an toàn – PCCC.", 348],
  ["FMV_KE_HOACH_AN_TOAN_PCCC", "BM-47-03", "Kế hoạch an toàn – PCCC", "An toàn – PCCC", "Biên bản kiểm tra, checklist, kế hoạch, hồ sơ huấn luyện, xử lý sự cố an toàn – PCCC.", 349],
  ["FMV_HO_SO_HUAN_LUYEN_AN_TOAN_PCCC", "BM-47-04", "Hồ sơ huấn luyện an toàn – PCCC", "An toàn – PCCC", "Biên bản kiểm tra, checklist, kế hoạch, hồ sơ huấn luyện, xử lý sự cố an toàn – PCCC.", 350],
  ["FMV_BIEN_BAN_XU_LY_SU_CO_AN_TOAN_PCCC", "BM-47-05", "Biên bản xử lý sự cố an toàn – PCCC", "An toàn – PCCC", "Biên bản kiểm tra, checklist, kế hoạch, hồ sơ huấn luyện, xử lý sự cố an toàn – PCCC.", 351],
  ["FMV_QUY_TRINH_MUA_HANG", "BM-31-01", "Quy trình mua hàng", "Quy trình", "Quy trình mua hàng, bán hàng, thanh toán, kho, nhân sự, tài sản, bảo trì, phê duyệt.", 352],
  ["FMV_QUY_TRINH_BAN_HANG", "BM-31-02", "Quy trình bán hàng", "Quy trình", "Quy trình mua hàng, bán hàng, thanh toán, kho, nhân sự, tài sản, bảo trì, phê duyệt.", 353],
  ["FMV_QUY_TRINH_THANH_TOAN", "BM-31-03", "Quy trình thanh toán", "Quy trình", "Quy trình mua hàng, bán hàng, thanh toán, kho, nhân sự, tài sản, bảo trì, phê duyệt.", 354],
  ["FMV_QUY_TRINH_KHO", "BM-31-04", "Quy trình kho", "Quy trình", "Quy trình mua hàng, bán hàng, thanh toán, kho, nhân sự, tài sản, bảo trì, phê duyệt.", 355],
  ["FMV_QUY_TRINH_NHAN_SU", "BM-31-05", "Quy trình nhân sự", "Quy trình", "Quy trình mua hàng, bán hàng, thanh toán, kho, nhân sự, tài sản, bảo trì, phê duyệt.", 356],
  ["FMV_QUY_TRINH_TAI_SAN", "BM-31-06", "Quy trình tài sản", "Quy trình", "Quy trình mua hàng, bán hàng, thanh toán, kho, nhân sự, tài sản, bảo trì, phê duyệt.", 357],
  ["FMV_QUY_TRINH_BAO_TRI", "BM-31-07", "Quy trình bảo trì", "Quy trình", "Quy trình mua hàng, bán hàng, thanh toán, kho, nhân sự, tài sản, bảo trì, phê duyệt.", 358],
  ["FMV_QUY_TRINH_PHE_DUYET", "BM-31-08", "Quy trình phê duyệt", "Quy trình", "Quy trình mua hàng, bán hàng, thanh toán, kho, nhân sự, tài sản, bảo trì, phê duyệt.", 359],
  ["FMV_NOI_QUY_CONG_TY", "BM-32-01", "Nội quy công ty", "Quy định – Quy chế", "Nội quy, quy định nhân sự, tài chính, lương thưởng, tài sản, bảo mật, sử dụng hệ thống.", 360],
  ["FMV_QUY_DINH_NHAN_SU", "BM-32-02", "Quy định nhân sự", "Quy định – Quy chế", "Nội quy, quy định nhân sự, tài chính, lương thưởng, tài sản, bảo mật, sử dụng hệ thống.", 361],
  ["FMV_QUY_CHE_TAI_CHINH", "BM-32-03", "Quy chế tài chính", "Quy định – Quy chế", "Nội quy, quy định nhân sự, tài chính, lương thưởng, tài sản, bảo mật, sử dụng hệ thống.", 362],
  ["FMV_QUY_CHE_LUONG_THUONG", "BM-32-04", "Quy chế lương thưởng", "Quy định – Quy chế", "Nội quy, quy định nhân sự, tài chính, lương thưởng, tài sản, bảo mật, sử dụng hệ thống.", 363],
  ["FMV_QUY_DINH_QUAN_LY_TAI_SAN", "BM-32-05", "Quy định quản lý tài sản", "Quy định – Quy chế", "Nội quy, quy định nhân sự, tài chính, lương thưởng, tài sản, bảo mật, sử dụng hệ thống.", 364],
  ["FMV_QUY_DINH_BAO_MAT_THONG_TIN", "BM-32-06", "Quy định bảo mật thông tin", "Quy định – Quy chế", "Nội quy, quy định nhân sự, tài chính, lương thưởng, tài sản, bảo mật, sử dụng hệ thống.", 365],
  ["FMV_QUY_DINH_SU_DUNG_HE_THONG", "BM-32-07", "Quy định sử dụng hệ thống", "Quy định – Quy chế", "Nội quy, quy định nhân sự, tài chính, lương thưởng, tài sản, bảo mật, sử dụng hệ thống.", 366],
  ["FMV_HUONG_DAN_NGHIEP_VU", "BM-33-01", "Hướng dẫn nghiệp vụ", "Hướng dẫn", "Hướng dẫn nghiệp vụ, vận hành, sử dụng thiết bị/phần mềm, xử lý sự cố.", 367],
  ["FMV_HUONG_DAN_VAN_HANH", "BM-33-02", "Hướng dẫn vận hành", "Hướng dẫn", "Hướng dẫn nghiệp vụ, vận hành, sử dụng thiết bị/phần mềm, xử lý sự cố.", 368],
  ["FMV_HUONG_DAN_SU_DUNG_THIET_BI", "BM-33-03", "Hướng dẫn sử dụng thiết bị", "Hướng dẫn", "Hướng dẫn nghiệp vụ, vận hành, sử dụng thiết bị/phần mềm, xử lý sự cố.", 369],
  ["FMV_HUONG_DAN_SU_DUNG_PHAN_MEM", "BM-33-04", "Hướng dẫn sử dụng phần mềm", "Hướng dẫn", "Hướng dẫn nghiệp vụ, vận hành, sử dụng thiết bị/phần mềm, xử lý sự cố.", 370],
  ["FMV_HUONG_DAN_XU_LY_SU_CO", "BM-33-05", "Hướng dẫn xử lý sự cố", "Hướng dẫn", "Hướng dẫn nghiệp vụ, vận hành, sử dụng thiết bị/phần mềm, xử lý sự cố.", 371],
  ["FMV_HO_SO_DANG_KY_KINH_DOANH", "BM-46-01", "Hồ sơ đăng ký kinh doanh", "Pháp lý doanh nghiệp", "Đăng ký kinh doanh, giấy phép, chứng nhận, đăng ký, hồ sơ thay đổi doanh nghiệp.", 372],
  ["FMV_HO_SO_GIAY_PHEP", "BM-46-02", "Hồ sơ giấy phép", "Pháp lý doanh nghiệp", "Đăng ký kinh doanh, giấy phép, chứng nhận, đăng ký, hồ sơ thay đổi doanh nghiệp.", 373],
  ["FMV_HO_SO_CHUNG_NHAN", "BM-46-03", "Hồ sơ chứng nhận", "Pháp lý doanh nghiệp", "Đăng ký kinh doanh, giấy phép, chứng nhận, đăng ký, hồ sơ thay đổi doanh nghiệp.", 374],
  ["FMV_HO_SO_DANG_KY_THUE_BAO_HIEM_NHAN_HIEU", "BM-46-04", "Hồ sơ đăng ký (thuế, bảo hiểm, nhãn hiệu…)", "Pháp lý doanh nghiệp", "Đăng ký kinh doanh, giấy phép, chứng nhận, đăng ký, hồ sơ thay đổi doanh nghiệp.", 375],
  ["FMV_HO_SO_THAY_DOI_DOANH_NGHIEP", "BM-46-05", "Hồ sơ thay đổi doanh nghiệp", "Pháp lý doanh nghiệp", "Đăng ký kinh doanh, giấy phép, chứng nhận, đăng ký, hồ sơ thay đổi doanh nghiệp.", 376],
  ["FMV_THU_MOI", "BM-50-01", "Thư mời", "Văn bản khác", "Thư mời, thư xác nhận, thư cảm ơn, thư đề nghị, thư trao đổi, hồ sơ khác.", 377],
  ["FMV_THU_XAC_NHAN", "BM-50-02", "Thư xác nhận", "Văn bản khác", "Thư mời, thư xác nhận, thư cảm ơn, thư đề nghị, thư trao đổi, hồ sơ khác.", 378],
  ["FMV_THU_CAM_ON", "BM-50-03", "Thư cảm ơn", "Văn bản khác", "Thư mời, thư xác nhận, thư cảm ơn, thư đề nghị, thư trao đổi, hồ sơ khác.", 379],
  ["FMV_THU_DE_NGHI", "BM-50-04", "Thư đề nghị", "Văn bản khác", "Thư mời, thư xác nhận, thư cảm ơn, thư đề nghị, thư trao đổi, hồ sơ khác.", 380],
  ["FMV_THU_TRAO_DOI", "BM-50-05", "Thư trao đổi", "Văn bản khác", "Thư mời, thư xác nhận, thư cảm ơn, thư đề nghị, thư trao đổi, hồ sơ khác.", 381],
  ["FMV_HO_SO_KHAC", "BM-50-06", "Hồ sơ khác", "Văn bản khác", "Thư mời, thư xác nhận, thư cảm ơn, thư đề nghị, thư trao đổi, hồ sơ khác.", 382]
];

/** Phân hệ (10 nhóm lớn) của từng biểu mẫu; app dùng cột PHAN_HE để gom menu. */
const FORM_TEMPLATE_MODULES = {"FM_HOP_DONG": "Hợp đồng", "FM_UY_QUYEN": "Hành chính", "FM_DE_XUAT": "Hành chính", "FM_BAN_GIAO": "Hành chính", "FM_NGHI_PHEP": "Nhân sự", "FM_DE_NGHI_TUYEN_DUNG": "Nhân sự", "FM_DIEU_CHUYEN_NHAN_SU": "Nhân sự", "FM_XAC_NHAN_CONG_TAC": "Hành chính", "FM_DE_NGHI_DAO_TAO": "Nhân sự", "FM_BHXH_01B": "Nhân sự", "FM_BHXH_13": "Nhân sự", "FM_BHXH_14": "Nhân sự", "FM_DE_NGHI_THANH_TOAN": "Tài chính – Kế toán", "FM_DE_NGHI_TAM_UNG": "Tài chính – Kế toán", "FM_CAP_PHAT_TAI_SAN": "Tài sản – Thiết bị", "FM_HD_KINH_TE": "Hợp đồng", "FM_PHU_LUC_HD": "Hợp đồng", "FM_BB_HOP_DONG": "Hợp đồng", "FM_THOA_THUAN": "Hợp đồng", "FM_TO_TRINH": "Hành chính", "FM_BIEN_BAN": "Hành chính", "FM_QUYET_DINH": "Hành chính", "FM_THONG_BAO": "Hành chính", "FM_CONG_VAN": "Hành chính", "FM_GIAY_GIOI_THIEU": "Hành chính", "FM_CONG_TAC": "Hành chính", "FM_SU_CO": "Hành chính", "FM_KE_HOACH": "Hành chính", "FM_BAO_CAO": "Hành chính", "FM_DON_KHAC": "Nhân sự", "FM_NHAN_SU": "Nhân sự", "FM_CHAM_CONG": "Nhân sự", "FM_LUONG": "Nhân sự", "FM_TUYEN_DUNG_HS": "Nhân sự", "FM_DAO_TAO": "Nhân sự", "FM_KHEN_THUONG_KY_LUAT": "Nhân sự", "FM_PHIEU_THU_CHI": "Tài chính – Kế toán", "FM_KE_TOAN": "Tài chính – Kế toán", "FM_CONG_NO": "Tài chính – Kế toán", "FM_DE_NGHI_MUA_HANG": "Mua hàng – NCC", "FM_DON_DAT_HANG": "Mua hàng – NCC", "FM_NHA_CUNG_CAP": "Mua hàng – NCC", "FM_NGHIEM_THU": "Mua hàng – NCC", "FM_KHO": "Kho", "FM_KIEM_KE": "Kho", "FM_TAI_SAN": "Tài sản – Thiết bị", "FM_THANH_LY": "Tài sản – Thiết bị", "FM_BAO_GIA": "Kinh doanh", "FM_KINH_DOANH": "Kinh doanh", "FM_MARKETING": "Kinh doanh", "FM_PHIEU_YEU_CAU": "Kỹ thuật – Bảo trì", "FM_BAO_TRI": "Kỹ thuật – Bảo trì", "FM_CNTT": "Kỹ thuật – Bảo trì", "FM_CHECKLIST": "Kỹ thuật – Bảo trì", "FM_AN_TOAN": "Kỹ thuật – Bảo trì", "FM_QUY_TRINH": "Pháp lý & văn bản khác", "FM_QUY_DINH": "Pháp lý & văn bản khác", "FM_HUONG_DAN": "Pháp lý & văn bản khác", "FM_PHAP_LY_DN": "Pháp lý & văn bản khác", "FM_THU": "Pháp lý & văn bản khác", "FMV_HOP_DONG_THU_VIEC": "Hợp đồng", "FMV_HOP_DONG_MUA_BAN": "Hợp đồng", "FMV_HOP_DONG_NGUYEN_TAC": "Hợp đồng", "FMV_HOP_DONG_DICH_VU": "Hợp đồng", "FMV_HOP_DONG_THUE": "Hợp đồng", "FMV_HOP_DONG_CHO_THUE": "Hợp đồng", "FMV_HOP_DONG_THI_CONG": "Hợp đồng", "FMV_HOP_DONG_BAO_TRI": "Hợp đồng", "FMV_HOP_DONG_VAN_CHUYEN": "Hợp đồng", "FMV_HOP_DONG_HOP_TAC": "Hợp đồng", "FMV_HOP_DONG_DAI_LY": "Hợp đồng", "FMV_HOP_DONG_PHAN_PHOI": "Hợp đồng", "FMV_HOP_DONG_GIA_CONG": "Hợp đồng", "FMV_HOP_DONG_TU_VAN": "Hợp đồng", "FMV_HOP_DONG_VAY": "Hợp đồng", "FMV_HOP_DONG_PHAN_MEM": "Hợp đồng", "FMV_HOP_DONG_BAN_QUYEN": "Hợp đồng", "FMV_HOP_DONG_CHUYEN_GIAO": "Hợp đồng", "FMV_PHU_LUC_GIA_HAN_HOP_DONG": "Hợp đồng", "FMV_PHU_LUC_DIEU_CHINH_GIA_TRI_HOP_DONG": "Hợp đồng", "FMV_PHU_LUC_DIEU_CHINH_KHOI_LUONG": "Hợp đồng", "FMV_PHU_LUC_DIEU_CHINH_THOI_GIAN": "Hợp đồng", "FMV_PHU_LUC_DIEU_CHINH_PHAM_VI_CONG_VIEC": "Hợp đồng", "FMV_PHU_LUC_THAY_DOI_THONG_TIN_CAC_BEN": "Hợp đồng", "FMV_BIEN_BAN_NGHIEM_THU_HOP_DONG": "Hợp đồng", "FMV_BIEN_BAN_BAN_GIAO_THEO_HOP_DONG": "Hợp đồng", "FMV_BIEN_BAN_DOI_CHIEU_HOP_DONG": "Hợp đồng", "FMV_BIEN_BAN_XAC_NHAN_KHOI_LUONG": "Hợp đồng", "FMV_BIEN_BAN_THANH_LY_HOP_DONG": "Hợp đồng", "FMV_BAN_CAM_KET": "Hợp đồng", "FMV_THOA_THUAN_BAO_MAT_THONG_TIN_NDA": "Hợp đồng", "FMV_BIEN_BAN_GHI_NHO_MOU": "Hợp đồng", "FMV_THOA_THUAN_NGUYEN_TAC": "Hợp đồng", "FMV_CAM_KET_TRACH_NHIEM": "Hợp đồng", "FMV_CAM_KET_SU_DUNG_TAI_SAN": "Hợp đồng", "FMV_DON_XIN_NGHI_KHONG_LUONG": "Nhân sự", "FMV_DON_XIN_NGHI_VIEC": "Nhân sự", "FMV_DON_XIN_VIEC": "Nhân sự", "FMV_DON_XIN_DIEU_CHUYEN": "Nhân sự", "FMV_DON_XIN_XAC_NHAN": "Nhân sự", "FMV_DON_DE_NGHI": "Nhân sự", "FMV_DON_KHIEU_NAI": "Nhân sự", "FMV_BAN_GIAI_TRINH": "Nhân sự", "FMV_DE_NGHI_THANH_TOAN_NHA_CUNG_CAP": "Tài chính – Kế toán", "FMV_DE_NGHI_THANH_TOAN_HOP_DONG": "Tài chính – Kế toán", "FMV_DE_NGHI_HOAN_UNG": "Tài chính – Kế toán", "FMV_DE_NGHI_THANH_TOAN_CHI_PHI": "Tài chính – Kế toán", "FMV_DE_NGHI_THANH_TOAN_CONG_TAC_PHI": "Tài chính – Kế toán", "FMV_DE_NGHI_TAM_UNG_MUA_HANG": "Tài chính – Kế toán", "FMV_DE_NGHI_TAM_UNG_CONG_TAC": "Tài chính – Kế toán", "FMV_DE_NGHI_TAM_UNG_THI_CONG": "Tài chính – Kế toán", "FMV_DE_NGHI_TAM_UNG_SU_KIEN": "Tài chính – Kế toán", "FMV_DE_NGHI_TAM_UNG_CHI_PHI_HOAT_DONG": "Tài chính – Kế toán", "FMV_DE_NGHI_MUA_VAT_TU": "Mua hàng – NCC", "FMV_DE_NGHI_MUA_THIET_BI": "Mua hàng – NCC", "FMV_DE_NGHI_MUA_CONG_CU_DUNG_CU": "Mua hàng – NCC", "FMV_DE_NGHI_MUA_HANG_HOA": "Mua hàng – NCC", "FMV_DE_NGHI_MUA_DICH_VU": "Mua hàng – NCC", "FMV_DE_XUAT_MUA_SAM": "Hành chính", "FMV_DE_XUAT_SUA_CHUA": "Hành chính", "FMV_DE_XUAT_DAU_TU": "Hành chính", "FMV_DE_XUAT_THAY_THE_THIET_BI": "Hành chính", "FMV_DE_XUAT_CAP_NGAN_SACH": "Hành chính", "FMV_DE_XUAT_CAI_TIEN_CONG_VIEC": "Hành chính", "FMV_TO_TRINH_XIN_CHU_TRUONG": "Hành chính", "FMV_TO_TRINH_PHE_DUYET_MUA_SAM": "Hành chính", "FMV_TO_TRINH_PHE_DUYET_THANH_TOAN": "Hành chính", "FMV_TO_TRINH_DAU_TU": "Hành chính", "FMV_TO_TRINH_NHAN_SU": "Hành chính", "FMV_TO_TRINH_NGAN_SACH": "Hành chính", "FMV_TO_TRINH_SUA_CHUA": "Hành chính", "FMV_BIEN_BAN_HOP": "Hành chính", "FMV_BIEN_BAN_LAM_VIEC": "Hành chính", "FMV_BIEN_BAN_XAC_NHAN": "Hành chính", "FMV_BIEN_BAN_NGHIEM_THU": "Hành chính", "FMV_BIEN_BAN_KIEM_KE": "Hành chính", "FMV_BIEN_BAN_DOI_CHIEU": "Hành chính", "FMV_BIEN_BAN_SU_CO": "Hành chính", "FMV_BIEN_BAN_VI_PHAM": "Hành chính", "FMV_BIEN_BAN_MAT_HONG_TAI_SAN": "Hành chính", "FMV_QUYET_DINH_BO_NHIEM": "Hành chính", "FMV_QUYET_DINH_MIEN_NHIEM": "Hành chính", "FMV_QUYET_DINH_DIEU_CHUYEN": "Hành chính", "FMV_QUYET_DINH_TIEP_NHAN": "Hành chính", "FMV_QUYET_DINH_TANG_LUONG": "Hành chính", "FMV_QUYET_DINH_KHEN_THUONG": "Hành chính", "FMV_QUYET_DINH_KY_LUAT": "Hành chính", "FMV_QUYET_DINH_THANH_LAP_TO_BAN": "Hành chính", "FMV_QUYET_DINH_PHAN_CONG_NHIEM_VU": "Hành chính", "FMV_THONG_BAO_NOI_BO": "Hành chính", "FMV_THONG_BAO_NGHI_LE": "Hành chính", "FMV_THONG_BAO_LICH_LAM_VIEC": "Hành chính", "FMV_THONG_BAO_NHAN_SU": "Hành chính", "FMV_THONG_BAO_CHINH_SACH": "Hành chính", "FMV_THONG_BAO_SU_KIEN": "Hành chính", "FMV_THONG_BAO_THAY_DOI_QUY_DINH": "Hành chính", "FMV_CONG_VAN_DI": "Hành chính", "FMV_CONG_VAN_DEN": "Hành chính", "FMV_CONG_VAN_DE_NGHI": "Hành chính", "FMV_CONG_VAN_TRA_LOI": "Hành chính", "FMV_CONG_VAN_PHUC_DAP": "Hành chính", "FMV_CONG_VAN_GIAI_TRINH": "Hành chính", "FMV_CONG_VAN_XAC_NHAN": "Hành chính", "FMV_GIAY_UY_QUYEN_KY": "Hành chính", "FMV_GIAY_UY_QUYEN_GIAO_DICH": "Hành chính", "FMV_GIAY_UY_QUYEN_NHAN_HANG": "Hành chính", "FMV_GIAY_UY_QUYEN_LAM_VIEC_NGAN_HANG_CO_QUAN": "Hành chính", "FMV_GIAY_UY_QUYEN_THUC_HIEN_THU_TUC": "Hành chính", "FMV_GIAY_GIOI_THIEU_DI_CONG_TAC": "Hành chính", "FMV_GIAY_GIOI_THIEU_LIEN_HE_DOI_TAC": "Hành chính", "FMV_GIAY_GIOI_THIEU_LAM_VIEC_NGAN_HANG": "Hành chính", "FMV_GIAY_GIOI_THIEU_LAM_VIEC_CO_QUAN_NHA_NUOC": "Hành chính", "FMV_DE_NGHI_DI_CONG_TAC": "Hành chính", "FMV_KE_HOACH_CONG_TAC": "Hành chính", "FMV_QUYET_TOAN_CONG_TAC_PHI": "Hành chính", "FMV_KE_HOACH_NGAY": "Hành chính", "FMV_KE_HOACH_TUAN": "Hành chính", "FMV_KE_HOACH_THANG": "Hành chính", "FMV_KE_HOACH_NAM": "Hành chính", "FMV_KE_HOACH_KINH_DOANH": "Hành chính", "FMV_KE_HOACH_NHAN_SU": "Hành chính", "FMV_KE_HOACH_MUA_SAM": "Hành chính", "FMV_KE_HOACH_BAO_TRI": "Hành chính", "FMV_KE_HOACH_NGAN_SACH": "Hành chính", "FMV_BAO_CAO_CONG_VIEC": "Hành chính", "FMV_BAO_CAO_KINH_DOANH": "Hành chính", "FMV_BAO_CAO_TAI_CHINH": "Hành chính", "FMV_BAO_CAO_NHAN_SU": "Hành chính", "FMV_BAO_CAO_KHO": "Hành chính", "FMV_BAO_CAO_KY_THUAT": "Hành chính", "FMV_BAO_CAO_BAO_TRI": "Hành chính", "FMV_BAO_CAO_SU_CO": "Hành chính", "FMV_BIEN_BAN_BAN_GIAO_CONG_VIEC": "Hành chính", "FMV_BIEN_BAN_BAN_GIAO_TAI_SAN": "Hành chính", "FMV_BIEN_BAN_BAN_GIAO_THIET_BI": "Hành chính", "FMV_BIEN_BAN_BAN_GIAO_HO_SO": "Hành chính", "FMV_BIEN_BAN_BAN_GIAO_MAT_BANG": "Hành chính", "FMV_BIEN_BAN_BAN_GIAO_TAI_KHOAN": "Hành chính", "FMV_BIEN_BAN_BAN_GIAO_CHUC_VU": "Hành chính", "FMV_BIEN_BAN_MAT_TAI_SAN": "Hành chính", "FMV_BIEN_BAN_HU_HONG_TAI_SAN": "Hành chính", "FMV_BIEN_BAN_BOI_THUONG": "Hành chính", "FMV_PHIEU_THONG_TIN_NHAN_VIEN": "Nhân sự", "FMV_PHIEU_TIEP_NHAN_NHAN_SU": "Nhân sự", "FMV_PHIEU_DANH_GIA_THU_VIEC": "Nhân sự", "FMV_PHIEU_DANH_GIA_NHAN_VIEN_DINH_KY": "Nhân sự", "FMV_DE_NGHI_TANG_LUONG": "Nhân sự", "FMV_PHIEU_THU_TUC_NGHI_VIEC": "Nhân sự", "FMV_PHIEU_DANG_KY_TANG_CA": "Nhân sự", "FMV_PHIEU_GIAI_TRINH_DI_MUON_VE_SOM": "Nhân sự", "FMV_PHIEU_DANG_KY_DI_CONG_TAC": "Nhân sự", "FMV_PHIEU_DIEU_CHINH_CHAM_CONG": "Nhân sự", "FMV_BANG_LUONG": "Nhân sự", "FMV_DE_NGHI_PHU_CAP": "Nhân sự", "FMV_DE_NGHI_THUONG": "Nhân sự", "FMV_GIAY_XAC_NHAN_THU_NHAP": "Nhân sự", "FMV_BAN_MO_TA_CONG_VIEC_JD": "Nhân sự", "FMV_PHIEU_DANH_GIA_PHONG_VAN": "Nhân sự", "FMV_THU_MOI_NHAN_VIEC": "Nhân sự", "FMV_KE_HOACH_DAO_TAO": "Nhân sự", "FMV_DANH_SACH_HOC_VIEN_DAO_TAO": "Nhân sự", "FMV_PHIEU_DANH_GIA_KET_QUA_DAO_TAO": "Nhân sự", "FMV_GIAY_CHUNG_NHAN_DAO_TAO": "Nhân sự", "FMV_DE_XUAT_KHEN_THUONG": "Nhân sự", "FMV_DE_XUAT_KY_LUAT": "Nhân sự", "FMV_BIEN_BAN_VI_PHAM_KY_LUAT": "Nhân sự", "FMV_PHIEU_THU": "Tài chính – Kế toán", "FMV_PHIEU_CHI": "Tài chính – Kế toán", "FMV_DE_NGHI_CHI": "Tài chính – Kế toán", "FMV_GIAY_XAC_NHAN_THU_CHI": "Tài chính – Kế toán", "FMV_BANG_KE_HOA_DON_CHUNG_TU": "Tài chính – Kế toán", "FMV_UY_NHIEM_CHI_UNC": "Tài chính – Kế toán", "FMV_BIEN_BAN_DOI_CHIEU_CONG_NO": "Tài chính – Kế toán", "FMV_BIEN_BAN_XAC_NHAN_CONG_NO": "Tài chính – Kế toán", "FMV_BANG_QUYET_TOAN": "Tài chính – Kế toán", "FMV_THU_XAC_NHAN_CONG_NO_KHACH_HANG": "Tài chính – Kế toán", "FMV_DE_NGHI_THANH_TOAN_GUI_KHACH_HANG": "Tài chính – Kế toán", "FMV_CAM_KET_THANH_TOAN": "Tài chính – Kế toán", "FMV_DE_NGHI_GIA_HAN_CONG_NO": "Tài chính – Kế toán", "FMV_DON_DAT_HANG_PO": "Mua hàng – NCC", "FMV_DON_DAT_DICH_VU": "Mua hàng – NCC", "FMV_DON_DAT_VAT_TU": "Mua hàng – NCC", "FMV_DON_DAT_THIET_BI": "Mua hàng – NCC", "FMV_HO_SO_NHA_CUNG_CAP": "Mua hàng – NCC", "FMV_PHIEU_DANH_GIA_NHA_CUNG_CAP": "Mua hàng – NCC", "FMV_BAO_GIA_MUA_HANG": "Mua hàng – NCC", "FMV_BANG_SO_SANH_GIA": "Mua hàng – NCC", "FMV_BIEN_BAN_NGHIEM_THU_HANG_HOA": "Mua hàng – NCC", "FMV_BIEN_BAN_NGHIEM_THU_THIET_BI": "Mua hàng – NCC", "FMV_BIEN_BAN_NGHIEM_THU_DICH_VU": "Mua hàng – NCC", "FMV_BIEN_BAN_NGHIEM_THU_CONG_VIEC": "Mua hàng – NCC", "FMV_BIEN_BAN_NGHIEM_THU_THI_CONG": "Mua hàng – NCC", "FMV_BIEN_BAN_NGHIEM_THU_KHOI_LUONG": "Mua hàng – NCC", "FMV_PHIEU_NHAP_KHO": "Kho", "FMV_PHIEU_XUAT_KHO": "Kho", "FMV_PHIEU_CHUYEN_KHO": "Kho", "FMV_PHIEU_TRA_HANG": "Kho", "FMV_BIEN_BAN_KIEM_KE_KHO": "Kho", "FMV_PHIEU_DIEU_CHINH_TON_KHO": "Kho", "FMV_BIEN_BAN_KIEM_KE_HANG_HOA": "Kho", "FMV_BIEN_BAN_KIEM_KE_TAI_SAN": "Kho", "FMV_BIEN_BAN_KIEM_KE_THIET_BI": "Kho", "FMV_BIEN_BAN_KIEM_KE_CONG_CU_DUNG_CU": "Kho", "FMV_PHIEU_THU_HOI_TAI_SAN": "Tài sản – Thiết bị", "FMV_PHIEU_DIEU_CHUYEN_TAI_SAN": "Tài sản – Thiết bị", "FMV_PHIEU_DE_NGHI_SUA_CHUA_TAI_SAN": "Tài sản – Thiết bị", "FMV_PHIEU_BAO_HANH_THIET_BI": "Tài sản – Thiết bị", "FMV_PHIEU_BAO_TRI_THIET_BI": "Tài sản – Thiết bị", "FMV_BIEN_BAN_THANH_LY_TAI_SAN": "Tài sản – Thiết bị", "FMV_BIEN_BAN_THANH_LY_THIET_BI": "Tài sản – Thiết bị", "FMV_BIEN_BAN_THANH_LY_HANG_HOA": "Tài sản – Thiết bị", "FMV_BIEN_BAN_THANH_LY_CONG_CU_DUNG_CU": "Tài sản – Thiết bị", "FMV_BAO_GIA_BAN_HANG": "Kinh doanh", "FMV_BAO_GIA_DICH_VU": "Kinh doanh", "FMV_BAO_GIA_THI_CONG": "Kinh doanh", "FMV_BAO_GIA_SUA_CHUA": "Kinh doanh", "FMV_DE_XUAT_GIA_BAN": "Kinh doanh", "FMV_CHINH_SACH_GIA": "Kinh doanh", "FMV_DE_XUAT_CHIET_KHAU": "Kinh doanh", "FMV_DON_HANG_BAN": "Kinh doanh", "FMV_XAC_NHAN_DON_HANG": "Kinh doanh", "FMV_KE_HOACH_MARKETING_SU_KIEN": "Kinh doanh", "FMV_DE_XUAT_NGAN_SACH_MARKETING": "Kinh doanh", "FMV_PHIEU_DUYET_NOI_DUNG_TRUYEN_THONG": "Kinh doanh", "FMV_BIEN_BAN_NGHIEM_THU_SU_KIEN": "Kinh doanh", "FMV_QUYET_TOAN_SU_KIEN": "Kinh doanh", "FMV_PHIEU_YEU_CAU_IT_SUPPORT": "Kỹ thuật – Bảo trì", "FMV_PHIEU_YEU_CAU_SUA_CHUA": "Kỹ thuật – Bảo trì", "FMV_PHIEU_YEU_CAU_BAO_TRI": "Kỹ thuật – Bảo trì", "FMV_PHIEU_YEU_CAU_CAP_QUYEN": "Kỹ thuật – Bảo trì", "FMV_PHIEU_YEU_CAU_CAP_THIET_BI": "Kỹ thuật – Bảo trì", "FMV_PHIEU_YEU_CAU_VAT_TU": "Kỹ thuật – Bảo trì", "FMV_PHIEU_YEU_CAU_DICH_VU": "Kỹ thuật – Bảo trì", "FMV_NHAT_KY_BAO_TRI": "Kỹ thuật – Bảo trì", "FMV_BIEN_BAN_SUA_CHUA": "Kỹ thuật – Bảo trì", "FMV_BIEN_BAN_NGHIEM_THU_BAO_TRI": "Kỹ thuật – Bảo trì", "FMV_PHIEU_CAP_TAI_KHOAN": "Kỹ thuật – Bảo trì", "FMV_PHIEU_CAP_QUYEN_HE_THONG": "Kỹ thuật – Bảo trì", "FMV_PHIEU_THAY_DOI_QUYEN": "Kỹ thuật – Bảo trì", "FMV_PHIEU_THU_HOI_QUYEN": "Kỹ thuật – Bảo trì", "FMV_CHECKLIST_KIEM_TRA_CONG_VIEC": "Kỹ thuật – Bảo trì", "FMV_CHECKLIST_KIEM_TRA_THIET_BI": "Kỹ thuật – Bảo trì", "FMV_CHECKLIST_KIEM_TRA_BAO_TRI": "Kỹ thuật – Bảo trì", "FMV_CHECKLIST_KIEM_TRA_VE_SINH": "Kỹ thuật – Bảo trì", "FMV_CHECKLIST_KIEM_TRA_AN_TOAN": "Kỹ thuật – Bảo trì", "FMV_CHECKLIST_KIEM_TRA_BAN_GIAO": "Kỹ thuật – Bảo trì", "FMV_BIEN_BAN_KIEM_TRA_AN_TOAN_PCCC": "Kỹ thuật – Bảo trì", "FMV_CHECKLIST_AN_TOAN_PCCC": "Kỹ thuật – Bảo trì", "FMV_KE_HOACH_AN_TOAN_PCCC": "Kỹ thuật – Bảo trì", "FMV_HO_SO_HUAN_LUYEN_AN_TOAN_PCCC": "Kỹ thuật – Bảo trì", "FMV_BIEN_BAN_XU_LY_SU_CO_AN_TOAN_PCCC": "Kỹ thuật – Bảo trì", "FMV_QUY_TRINH_MUA_HANG": "Pháp lý & văn bản khác", "FMV_QUY_TRINH_BAN_HANG": "Pháp lý & văn bản khác", "FMV_QUY_TRINH_THANH_TOAN": "Pháp lý & văn bản khác", "FMV_QUY_TRINH_KHO": "Pháp lý & văn bản khác", "FMV_QUY_TRINH_NHAN_SU": "Pháp lý & văn bản khác", "FMV_QUY_TRINH_TAI_SAN": "Pháp lý & văn bản khác", "FMV_QUY_TRINH_BAO_TRI": "Pháp lý & văn bản khác", "FMV_QUY_TRINH_PHE_DUYET": "Pháp lý & văn bản khác", "FMV_NOI_QUY_CONG_TY": "Pháp lý & văn bản khác", "FMV_QUY_DINH_NHAN_SU": "Pháp lý & văn bản khác", "FMV_QUY_CHE_TAI_CHINH": "Pháp lý & văn bản khác", "FMV_QUY_CHE_LUONG_THUONG": "Pháp lý & văn bản khác", "FMV_QUY_DINH_QUAN_LY_TAI_SAN": "Pháp lý & văn bản khác", "FMV_QUY_DINH_BAO_MAT_THONG_TIN": "Pháp lý & văn bản khác", "FMV_QUY_DINH_SU_DUNG_HE_THONG": "Pháp lý & văn bản khác", "FMV_HUONG_DAN_NGHIEP_VU": "Pháp lý & văn bản khác", "FMV_HUONG_DAN_VAN_HANH": "Pháp lý & văn bản khác", "FMV_HUONG_DAN_SU_DUNG_THIET_BI": "Pháp lý & văn bản khác", "FMV_HUONG_DAN_SU_DUNG_PHAN_MEM": "Pháp lý & văn bản khác", "FMV_HUONG_DAN_XU_LY_SU_CO": "Pháp lý & văn bản khác", "FMV_HO_SO_DANG_KY_KINH_DOANH": "Pháp lý & văn bản khác", "FMV_HO_SO_GIAY_PHEP": "Pháp lý & văn bản khác", "FMV_HO_SO_CHUNG_NHAN": "Pháp lý & văn bản khác", "FMV_HO_SO_DANG_KY_THUE_BAO_HIEM_NHAN_HIEU": "Pháp lý & văn bản khác", "FMV_HO_SO_THAY_DOI_DOANH_NGHIEP": "Pháp lý & văn bản khác", "FMV_THU_MOI": "Pháp lý & văn bản khác", "FMV_THU_XAC_NHAN": "Pháp lý & văn bản khác", "FMV_THU_CAM_ON": "Pháp lý & văn bản khác", "FMV_THU_DE_NGHI": "Pháp lý & văn bản khác", "FMV_THU_TRAO_DOI": "Pháp lý & văn bản khác", "FMV_HO_SO_KHAC": "Pháp lý & văn bản khác"};

/** Mẫu tổng hợp đời trước đã tách thành từng biểu mẫu riêng; giữ để đọc phiếu cũ nhưng ngừng hiển thị. */
const FORM_TEMPLATE_RETIRED = ["FM_HD_KINH_TE", "FM_PHU_LUC_HD", "FM_BB_HOP_DONG", "FM_THOA_THUAN", "FM_TO_TRINH", "FM_BIEN_BAN", "FM_QUYET_DINH", "FM_THONG_BAO", "FM_CONG_VAN", "FM_GIAY_GIOI_THIEU", "FM_CONG_TAC", "FM_SU_CO", "FM_KE_HOACH", "FM_BAO_CAO", "FM_DON_KHAC", "FM_NHAN_SU", "FM_CHAM_CONG", "FM_LUONG", "FM_TUYEN_DUNG_HS", "FM_DAO_TAO", "FM_KHEN_THUONG_KY_LUAT", "FM_PHIEU_THU_CHI", "FM_KE_TOAN", "FM_CONG_NO", "FM_DE_NGHI_MUA_HANG", "FM_DON_DAT_HANG", "FM_NHA_CUNG_CAP", "FM_NGHIEM_THU", "FM_KHO", "FM_KIEM_KE", "FM_TAI_SAN", "FM_THANH_LY", "FM_BAO_GIA", "FM_KINH_DOANH", "FM_MARKETING", "FM_PHIEU_YEU_CAU", "FM_BAO_TRI", "FM_CNTT", "FM_CHECKLIST", "FM_AN_TOAN", "FM_QUY_TRINH", "FM_QUY_DINH", "FM_HUONG_DAN", "FM_PHAP_LY_DN", "FM_THU"];

/** Mẫu nền của từng biểu mẫu tách theo loại (dùng chung căn cứ pháp lý, cấu hình trường). */
const FORM_TEMPLATE_BASES = {"FMV_HOP_DONG_THU_VIEC": "FM_HOP_DONG", "FMV_HOP_DONG_MUA_BAN": "FM_HD_KINH_TE", "FMV_HOP_DONG_NGUYEN_TAC": "FM_HD_KINH_TE", "FMV_HOP_DONG_DICH_VU": "FM_HD_KINH_TE", "FMV_HOP_DONG_THUE": "FM_HD_KINH_TE", "FMV_HOP_DONG_CHO_THUE": "FM_HD_KINH_TE", "FMV_HOP_DONG_THI_CONG": "FM_HD_KINH_TE", "FMV_HOP_DONG_BAO_TRI": "FM_HD_KINH_TE", "FMV_HOP_DONG_VAN_CHUYEN": "FM_HD_KINH_TE", "FMV_HOP_DONG_HOP_TAC": "FM_HD_KINH_TE", "FMV_HOP_DONG_DAI_LY": "FM_HD_KINH_TE", "FMV_HOP_DONG_PHAN_PHOI": "FM_HD_KINH_TE", "FMV_HOP_DONG_GIA_CONG": "FM_HD_KINH_TE", "FMV_HOP_DONG_TU_VAN": "FM_HD_KINH_TE", "FMV_HOP_DONG_VAY": "FM_HD_KINH_TE", "FMV_HOP_DONG_PHAN_MEM": "FM_HD_KINH_TE", "FMV_HOP_DONG_BAN_QUYEN": "FM_HD_KINH_TE", "FMV_HOP_DONG_CHUYEN_GIAO": "FM_HD_KINH_TE", "FMV_PHU_LUC_GIA_HAN_HOP_DONG": "FM_PHU_LUC_HD", "FMV_PHU_LUC_DIEU_CHINH_GIA_TRI_HOP_DONG": "FM_PHU_LUC_HD", "FMV_PHU_LUC_DIEU_CHINH_KHOI_LUONG": "FM_PHU_LUC_HD", "FMV_PHU_LUC_DIEU_CHINH_THOI_GIAN": "FM_PHU_LUC_HD", "FMV_PHU_LUC_DIEU_CHINH_PHAM_VI_CONG_VIEC": "FM_PHU_LUC_HD", "FMV_PHU_LUC_THAY_DOI_THONG_TIN_CAC_BEN": "FM_PHU_LUC_HD", "FMV_BIEN_BAN_NGHIEM_THU_HOP_DONG": "FM_BB_HOP_DONG", "FMV_BIEN_BAN_BAN_GIAO_THEO_HOP_DONG": "FM_BB_HOP_DONG", "FMV_BIEN_BAN_DOI_CHIEU_HOP_DONG": "FM_BB_HOP_DONG", "FMV_BIEN_BAN_XAC_NHAN_KHOI_LUONG": "FM_BB_HOP_DONG", "FMV_BIEN_BAN_THANH_LY_HOP_DONG": "FM_BB_HOP_DONG", "FMV_BAN_CAM_KET": "FM_THOA_THUAN", "FMV_THOA_THUAN_BAO_MAT_THONG_TIN_NDA": "FM_THOA_THUAN", "FMV_BIEN_BAN_GHI_NHO_MOU": "FM_THOA_THUAN", "FMV_THOA_THUAN_NGUYEN_TAC": "FM_THOA_THUAN", "FMV_CAM_KET_TRACH_NHIEM": "FM_THOA_THUAN", "FMV_CAM_KET_SU_DUNG_TAI_SAN": "FM_THOA_THUAN", "FMV_DON_XIN_NGHI_KHONG_LUONG": "FM_DON_KHAC", "FMV_DON_XIN_NGHI_VIEC": "FM_DON_KHAC", "FMV_DON_XIN_VIEC": "FM_DON_KHAC", "FMV_DON_XIN_DIEU_CHUYEN": "FM_DON_KHAC", "FMV_DON_XIN_XAC_NHAN": "FM_DON_KHAC", "FMV_DON_DE_NGHI": "FM_DON_KHAC", "FMV_DON_KHIEU_NAI": "FM_DON_KHAC", "FMV_BAN_GIAI_TRINH": "FM_DON_KHAC", "FMV_DE_NGHI_THANH_TOAN_NHA_CUNG_CAP": "FM_DE_NGHI_THANH_TOAN", "FMV_DE_NGHI_THANH_TOAN_HOP_DONG": "FM_DE_NGHI_THANH_TOAN", "FMV_DE_NGHI_HOAN_UNG": "FM_DE_NGHI_THANH_TOAN", "FMV_DE_NGHI_THANH_TOAN_CHI_PHI": "FM_DE_NGHI_THANH_TOAN", "FMV_DE_NGHI_THANH_TOAN_CONG_TAC_PHI": "FM_DE_NGHI_THANH_TOAN", "FMV_DE_NGHI_TAM_UNG_MUA_HANG": "FM_DE_NGHI_TAM_UNG", "FMV_DE_NGHI_TAM_UNG_CONG_TAC": "FM_DE_NGHI_TAM_UNG", "FMV_DE_NGHI_TAM_UNG_THI_CONG": "FM_DE_NGHI_TAM_UNG", "FMV_DE_NGHI_TAM_UNG_SU_KIEN": "FM_DE_NGHI_TAM_UNG", "FMV_DE_NGHI_TAM_UNG_CHI_PHI_HOAT_DONG": "FM_DE_NGHI_TAM_UNG", "FMV_DE_NGHI_MUA_VAT_TU": "FM_DE_NGHI_MUA_HANG", "FMV_DE_NGHI_MUA_THIET_BI": "FM_DE_NGHI_MUA_HANG", "FMV_DE_NGHI_MUA_CONG_CU_DUNG_CU": "FM_DE_NGHI_MUA_HANG", "FMV_DE_NGHI_MUA_HANG_HOA": "FM_DE_NGHI_MUA_HANG", "FMV_DE_NGHI_MUA_DICH_VU": "FM_DE_NGHI_MUA_HANG", "FMV_DE_XUAT_MUA_SAM": "FM_DE_XUAT", "FMV_DE_XUAT_SUA_CHUA": "FM_DE_XUAT", "FMV_DE_XUAT_DAU_TU": "FM_DE_XUAT", "FMV_DE_XUAT_THAY_THE_THIET_BI": "FM_DE_XUAT", "FMV_DE_XUAT_CAP_NGAN_SACH": "FM_DE_XUAT", "FMV_DE_XUAT_CAI_TIEN_CONG_VIEC": "FM_DE_XUAT", "FMV_TO_TRINH_XIN_CHU_TRUONG": "FM_TO_TRINH", "FMV_TO_TRINH_PHE_DUYET_MUA_SAM": "FM_TO_TRINH", "FMV_TO_TRINH_PHE_DUYET_THANH_TOAN": "FM_TO_TRINH", "FMV_TO_TRINH_DAU_TU": "FM_TO_TRINH", "FMV_TO_TRINH_NHAN_SU": "FM_TO_TRINH", "FMV_TO_TRINH_NGAN_SACH": "FM_TO_TRINH", "FMV_TO_TRINH_SUA_CHUA": "FM_TO_TRINH", "FMV_BIEN_BAN_HOP": "FM_BIEN_BAN", "FMV_BIEN_BAN_LAM_VIEC": "FM_BIEN_BAN", "FMV_BIEN_BAN_XAC_NHAN": "FM_BIEN_BAN", "FMV_BIEN_BAN_NGHIEM_THU": "FM_NGHIEM_THU", "FMV_BIEN_BAN_KIEM_KE": "FM_KIEM_KE", "FMV_BIEN_BAN_DOI_CHIEU": "FM_BIEN_BAN", "FMV_BIEN_BAN_SU_CO": "FM_SU_CO", "FMV_BIEN_BAN_VI_PHAM": "FM_SU_CO", "FMV_BIEN_BAN_MAT_HONG_TAI_SAN": "FM_SU_CO", "FMV_QUYET_DINH_BO_NHIEM": "FM_QUYET_DINH", "FMV_QUYET_DINH_MIEN_NHIEM": "FM_QUYET_DINH", "FMV_QUYET_DINH_DIEU_CHUYEN": "FM_QUYET_DINH", "FMV_QUYET_DINH_TIEP_NHAN": "FM_QUYET_DINH", "FMV_QUYET_DINH_TANG_LUONG": "FM_QUYET_DINH", "FMV_QUYET_DINH_KHEN_THUONG": "FM_QUYET_DINH", "FMV_QUYET_DINH_KY_LUAT": "FM_QUYET_DINH", "FMV_QUYET_DINH_THANH_LAP_TO_BAN": "FM_QUYET_DINH", "FMV_QUYET_DINH_PHAN_CONG_NHIEM_VU": "FM_QUYET_DINH", "FMV_THONG_BAO_NOI_BO": "FM_THONG_BAO", "FMV_THONG_BAO_NGHI_LE": "FM_THONG_BAO", "FMV_THONG_BAO_LICH_LAM_VIEC": "FM_THONG_BAO", "FMV_THONG_BAO_NHAN_SU": "FM_THONG_BAO", "FMV_THONG_BAO_CHINH_SACH": "FM_THONG_BAO", "FMV_THONG_BAO_SU_KIEN": "FM_THONG_BAO", "FMV_THONG_BAO_THAY_DOI_QUY_DINH": "FM_THONG_BAO", "FMV_CONG_VAN_DI": "FM_CONG_VAN", "FMV_CONG_VAN_DEN": "FM_CONG_VAN", "FMV_CONG_VAN_DE_NGHI": "FM_CONG_VAN", "FMV_CONG_VAN_TRA_LOI": "FM_CONG_VAN", "FMV_CONG_VAN_PHUC_DAP": "FM_CONG_VAN", "FMV_CONG_VAN_GIAI_TRINH": "FM_CONG_VAN", "FMV_CONG_VAN_XAC_NHAN": "FM_CONG_VAN", "FMV_GIAY_UY_QUYEN_KY": "FM_UY_QUYEN", "FMV_GIAY_UY_QUYEN_GIAO_DICH": "FM_UY_QUYEN", "FMV_GIAY_UY_QUYEN_NHAN_HANG": "FM_UY_QUYEN", "FMV_GIAY_UY_QUYEN_LAM_VIEC_NGAN_HANG_CO_QUAN": "FM_UY_QUYEN", "FMV_GIAY_UY_QUYEN_THUC_HIEN_THU_TUC": "FM_UY_QUYEN", "FMV_GIAY_GIOI_THIEU_DI_CONG_TAC": "FM_GIAY_GIOI_THIEU", "FMV_GIAY_GIOI_THIEU_LIEN_HE_DOI_TAC": "FM_GIAY_GIOI_THIEU", "FMV_GIAY_GIOI_THIEU_LAM_VIEC_NGAN_HANG": "FM_GIAY_GIOI_THIEU", "FMV_GIAY_GIOI_THIEU_LAM_VIEC_CO_QUAN_NHA_NUOC": "FM_GIAY_GIOI_THIEU", "FMV_DE_NGHI_DI_CONG_TAC": "FM_CONG_TAC", "FMV_KE_HOACH_CONG_TAC": "FM_CONG_TAC", "FMV_QUYET_TOAN_CONG_TAC_PHI": "FM_CONG_TAC", "FMV_KE_HOACH_NGAY": "FM_KE_HOACH", "FMV_KE_HOACH_TUAN": "FM_KE_HOACH", "FMV_KE_HOACH_THANG": "FM_KE_HOACH", "FMV_KE_HOACH_NAM": "FM_KE_HOACH", "FMV_KE_HOACH_KINH_DOANH": "FM_KE_HOACH", "FMV_KE_HOACH_NHAN_SU": "FM_KE_HOACH", "FMV_KE_HOACH_MUA_SAM": "FM_KE_HOACH", "FMV_KE_HOACH_BAO_TRI": "FM_KE_HOACH", "FMV_KE_HOACH_NGAN_SACH": "FM_KE_HOACH", "FMV_BAO_CAO_CONG_VIEC": "FM_BAO_CAO", "FMV_BAO_CAO_KINH_DOANH": "FM_BAO_CAO", "FMV_BAO_CAO_TAI_CHINH": "FM_BAO_CAO", "FMV_BAO_CAO_NHAN_SU": "FM_BAO_CAO", "FMV_BAO_CAO_KHO": "FM_BAO_CAO", "FMV_BAO_CAO_KY_THUAT": "FM_BAO_CAO", "FMV_BAO_CAO_BAO_TRI": "FM_BAO_CAO", "FMV_BAO_CAO_SU_CO": "FM_BAO_CAO", "FMV_BIEN_BAN_BAN_GIAO_CONG_VIEC": "FM_BAN_GIAO", "FMV_BIEN_BAN_BAN_GIAO_TAI_SAN": "FM_BAN_GIAO", "FMV_BIEN_BAN_BAN_GIAO_THIET_BI": "FM_BAN_GIAO", "FMV_BIEN_BAN_BAN_GIAO_HO_SO": "FM_BAN_GIAO", "FMV_BIEN_BAN_BAN_GIAO_MAT_BANG": "FM_BAN_GIAO", "FMV_BIEN_BAN_BAN_GIAO_TAI_KHOAN": "FM_BAN_GIAO", "FMV_BIEN_BAN_BAN_GIAO_CHUC_VU": "FM_BAN_GIAO", "FMV_BIEN_BAN_MAT_TAI_SAN": "FM_SU_CO", "FMV_BIEN_BAN_HU_HONG_TAI_SAN": "FM_SU_CO", "FMV_BIEN_BAN_BOI_THUONG": "FM_SU_CO", "FMV_PHIEU_THONG_TIN_NHAN_VIEN": "FM_NHAN_SU", "FMV_PHIEU_TIEP_NHAN_NHAN_SU": "FM_NHAN_SU", "FMV_PHIEU_DANH_GIA_THU_VIEC": "FM_NHAN_SU", "FMV_PHIEU_DANH_GIA_NHAN_VIEN_DINH_KY": "FM_NHAN_SU", "FMV_DE_NGHI_TANG_LUONG": "FM_LUONG", "FMV_PHIEU_THU_TUC_NGHI_VIEC": "FM_NHAN_SU", "FMV_PHIEU_DANG_KY_TANG_CA": "FM_CHAM_CONG", "FMV_PHIEU_GIAI_TRINH_DI_MUON_VE_SOM": "FM_CHAM_CONG", "FMV_PHIEU_DANG_KY_DI_CONG_TAC": "FM_CHAM_CONG", "FMV_PHIEU_DIEU_CHINH_CHAM_CONG": "FM_CHAM_CONG", "FMV_BANG_LUONG": "FM_LUONG", "FMV_DE_NGHI_PHU_CAP": "FM_LUONG", "FMV_DE_NGHI_THUONG": "FM_LUONG", "FMV_GIAY_XAC_NHAN_THU_NHAP": "FM_LUONG", "FMV_BAN_MO_TA_CONG_VIEC_JD": "FM_TUYEN_DUNG_HS", "FMV_PHIEU_DANH_GIA_PHONG_VAN": "FM_TUYEN_DUNG_HS", "FMV_THU_MOI_NHAN_VIEC": "FM_TUYEN_DUNG_HS", "FMV_KE_HOACH_DAO_TAO": "FM_DAO_TAO", "FMV_DANH_SACH_HOC_VIEN_DAO_TAO": "FM_DAO_TAO", "FMV_PHIEU_DANH_GIA_KET_QUA_DAO_TAO": "FM_DAO_TAO", "FMV_GIAY_CHUNG_NHAN_DAO_TAO": "FM_DAO_TAO", "FMV_DE_XUAT_KHEN_THUONG": "FM_KHEN_THUONG_KY_LUAT", "FMV_DE_XUAT_KY_LUAT": "FM_KHEN_THUONG_KY_LUAT", "FMV_BIEN_BAN_VI_PHAM_KY_LUAT": "FM_KHEN_THUONG_KY_LUAT", "FMV_PHIEU_THU": "FM_PHIEU_THU_CHI", "FMV_PHIEU_CHI": "FM_PHIEU_THU_CHI", "FMV_DE_NGHI_CHI": "FM_PHIEU_THU_CHI", "FMV_GIAY_XAC_NHAN_THU_CHI": "FM_PHIEU_THU_CHI", "FMV_BANG_KE_HOA_DON_CHUNG_TU": "FM_KE_TOAN", "FMV_UY_NHIEM_CHI_UNC": "FM_KE_TOAN", "FMV_BIEN_BAN_DOI_CHIEU_CONG_NO": "FM_KE_TOAN", "FMV_BIEN_BAN_XAC_NHAN_CONG_NO": "FM_KE_TOAN", "FMV_BANG_QUYET_TOAN": "FM_KE_TOAN", "FMV_THU_XAC_NHAN_CONG_NO_KHACH_HANG": "FM_CONG_NO", "FMV_DE_NGHI_THANH_TOAN_GUI_KHACH_HANG": "FM_CONG_NO", "FMV_CAM_KET_THANH_TOAN": "FM_CONG_NO", "FMV_DE_NGHI_GIA_HAN_CONG_NO": "FM_CONG_NO", "FMV_DON_DAT_HANG_PO": "FM_DON_DAT_HANG", "FMV_DON_DAT_DICH_VU": "FM_DON_DAT_HANG", "FMV_DON_DAT_VAT_TU": "FM_DON_DAT_HANG", "FMV_DON_DAT_THIET_BI": "FM_DON_DAT_HANG", "FMV_HO_SO_NHA_CUNG_CAP": "FM_NHA_CUNG_CAP", "FMV_PHIEU_DANH_GIA_NHA_CUNG_CAP": "FM_NHA_CUNG_CAP", "FMV_BAO_GIA_MUA_HANG": "FM_NHA_CUNG_CAP", "FMV_BANG_SO_SANH_GIA": "FM_NHA_CUNG_CAP", "FMV_BIEN_BAN_NGHIEM_THU_HANG_HOA": "FM_NGHIEM_THU", "FMV_BIEN_BAN_NGHIEM_THU_THIET_BI": "FM_NGHIEM_THU", "FMV_BIEN_BAN_NGHIEM_THU_DICH_VU": "FM_NGHIEM_THU", "FMV_BIEN_BAN_NGHIEM_THU_CONG_VIEC": "FM_NGHIEM_THU", "FMV_BIEN_BAN_NGHIEM_THU_THI_CONG": "FM_NGHIEM_THU", "FMV_BIEN_BAN_NGHIEM_THU_KHOI_LUONG": "FM_NGHIEM_THU", "FMV_PHIEU_NHAP_KHO": "FM_KHO", "FMV_PHIEU_XUAT_KHO": "FM_KHO", "FMV_PHIEU_CHUYEN_KHO": "FM_KHO", "FMV_PHIEU_TRA_HANG": "FM_KHO", "FMV_BIEN_BAN_KIEM_KE_KHO": "FM_KIEM_KE", "FMV_PHIEU_DIEU_CHINH_TON_KHO": "FM_KHO", "FMV_BIEN_BAN_KIEM_KE_HANG_HOA": "FM_KIEM_KE", "FMV_BIEN_BAN_KIEM_KE_TAI_SAN": "FM_KIEM_KE", "FMV_BIEN_BAN_KIEM_KE_THIET_BI": "FM_KIEM_KE", "FMV_BIEN_BAN_KIEM_KE_CONG_CU_DUNG_CU": "FM_KIEM_KE", "FMV_PHIEU_THU_HOI_TAI_SAN": "FM_TAI_SAN", "FMV_PHIEU_DIEU_CHUYEN_TAI_SAN": "FM_TAI_SAN", "FMV_PHIEU_DE_NGHI_SUA_CHUA_TAI_SAN": "FM_TAI_SAN", "FMV_PHIEU_BAO_HANH_THIET_BI": "FM_TAI_SAN", "FMV_PHIEU_BAO_TRI_THIET_BI": "FM_TAI_SAN", "FMV_BIEN_BAN_THANH_LY_TAI_SAN": "FM_THANH_LY", "FMV_BIEN_BAN_THANH_LY_THIET_BI": "FM_THANH_LY", "FMV_BIEN_BAN_THANH_LY_HANG_HOA": "FM_THANH_LY", "FMV_BIEN_BAN_THANH_LY_CONG_CU_DUNG_CU": "FM_THANH_LY", "FMV_BAO_GIA_BAN_HANG": "FM_BAO_GIA", "FMV_BAO_GIA_DICH_VU": "FM_BAO_GIA", "FMV_BAO_GIA_THI_CONG": "FM_BAO_GIA", "FMV_BAO_GIA_SUA_CHUA": "FM_BAO_GIA", "FMV_DE_XUAT_GIA_BAN": "FM_KINH_DOANH", "FMV_CHINH_SACH_GIA": "FM_KINH_DOANH", "FMV_DE_XUAT_CHIET_KHAU": "FM_KINH_DOANH", "FMV_DON_HANG_BAN": "FM_KINH_DOANH", "FMV_XAC_NHAN_DON_HANG": "FM_KINH_DOANH", "FMV_KE_HOACH_MARKETING_SU_KIEN": "FM_MARKETING", "FMV_DE_XUAT_NGAN_SACH_MARKETING": "FM_MARKETING", "FMV_PHIEU_DUYET_NOI_DUNG_TRUYEN_THONG": "FM_MARKETING", "FMV_BIEN_BAN_NGHIEM_THU_SU_KIEN": "FM_MARKETING", "FMV_QUYET_TOAN_SU_KIEN": "FM_MARKETING", "FMV_PHIEU_YEU_CAU_IT_SUPPORT": "FM_PHIEU_YEU_CAU", "FMV_PHIEU_YEU_CAU_SUA_CHUA": "FM_PHIEU_YEU_CAU", "FMV_PHIEU_YEU_CAU_BAO_TRI": "FM_PHIEU_YEU_CAU", "FMV_PHIEU_YEU_CAU_CAP_QUYEN": "FM_PHIEU_YEU_CAU", "FMV_PHIEU_YEU_CAU_CAP_THIET_BI": "FM_PHIEU_YEU_CAU", "FMV_PHIEU_YEU_CAU_VAT_TU": "FM_PHIEU_YEU_CAU", "FMV_PHIEU_YEU_CAU_DICH_VU": "FM_PHIEU_YEU_CAU", "FMV_NHAT_KY_BAO_TRI": "FM_BAO_TRI", "FMV_BIEN_BAN_SUA_CHUA": "FM_BAO_TRI", "FMV_BIEN_BAN_NGHIEM_THU_BAO_TRI": "FM_BAO_TRI", "FMV_PHIEU_CAP_TAI_KHOAN": "FM_CNTT", "FMV_PHIEU_CAP_QUYEN_HE_THONG": "FM_CNTT", "FMV_PHIEU_THAY_DOI_QUYEN": "FM_CNTT", "FMV_PHIEU_THU_HOI_QUYEN": "FM_CNTT", "FMV_CHECKLIST_KIEM_TRA_CONG_VIEC": "FM_CHECKLIST", "FMV_CHECKLIST_KIEM_TRA_THIET_BI": "FM_CHECKLIST", "FMV_CHECKLIST_KIEM_TRA_BAO_TRI": "FM_CHECKLIST", "FMV_CHECKLIST_KIEM_TRA_VE_SINH": "FM_CHECKLIST", "FMV_CHECKLIST_KIEM_TRA_AN_TOAN": "FM_CHECKLIST", "FMV_CHECKLIST_KIEM_TRA_BAN_GIAO": "FM_CHECKLIST", "FMV_BIEN_BAN_KIEM_TRA_AN_TOAN_PCCC": "FM_AN_TOAN", "FMV_CHECKLIST_AN_TOAN_PCCC": "FM_AN_TOAN", "FMV_KE_HOACH_AN_TOAN_PCCC": "FM_AN_TOAN", "FMV_HO_SO_HUAN_LUYEN_AN_TOAN_PCCC": "FM_AN_TOAN", "FMV_BIEN_BAN_XU_LY_SU_CO_AN_TOAN_PCCC": "FM_AN_TOAN", "FMV_QUY_TRINH_MUA_HANG": "FM_QUY_TRINH", "FMV_QUY_TRINH_BAN_HANG": "FM_QUY_TRINH", "FMV_QUY_TRINH_THANH_TOAN": "FM_QUY_TRINH", "FMV_QUY_TRINH_KHO": "FM_QUY_TRINH", "FMV_QUY_TRINH_NHAN_SU": "FM_QUY_TRINH", "FMV_QUY_TRINH_TAI_SAN": "FM_QUY_TRINH", "FMV_QUY_TRINH_BAO_TRI": "FM_QUY_TRINH", "FMV_QUY_TRINH_PHE_DUYET": "FM_QUY_TRINH", "FMV_NOI_QUY_CONG_TY": "FM_QUY_DINH", "FMV_QUY_DINH_NHAN_SU": "FM_QUY_DINH", "FMV_QUY_CHE_TAI_CHINH": "FM_QUY_DINH", "FMV_QUY_CHE_LUONG_THUONG": "FM_QUY_DINH", "FMV_QUY_DINH_QUAN_LY_TAI_SAN": "FM_QUY_DINH", "FMV_QUY_DINH_BAO_MAT_THONG_TIN": "FM_QUY_DINH", "FMV_QUY_DINH_SU_DUNG_HE_THONG": "FM_QUY_DINH", "FMV_HUONG_DAN_NGHIEP_VU": "FM_HUONG_DAN", "FMV_HUONG_DAN_VAN_HANH": "FM_HUONG_DAN", "FMV_HUONG_DAN_SU_DUNG_THIET_BI": "FM_HUONG_DAN", "FMV_HUONG_DAN_SU_DUNG_PHAN_MEM": "FM_HUONG_DAN", "FMV_HUONG_DAN_XU_LY_SU_CO": "FM_HUONG_DAN", "FMV_HO_SO_DANG_KY_KINH_DOANH": "FM_PHAP_LY_DN", "FMV_HO_SO_GIAY_PHEP": "FM_PHAP_LY_DN", "FMV_HO_SO_CHUNG_NHAN": "FM_PHAP_LY_DN", "FMV_HO_SO_DANG_KY_THUE_BAO_HIEM_NHAN_HIEU": "FM_PHAP_LY_DN", "FMV_HO_SO_THAY_DOI_DOANH_NGHIEP": "FM_PHAP_LY_DN", "FMV_THU_MOI": "FM_THU", "FMV_THU_XAC_NHAN": "FM_THU", "FMV_THU_CAM_ON": "FM_THU", "FMV_THU_DE_NGHI": "FM_THU", "FMV_THU_TRAO_DOI": "FM_THU", "FMV_HO_SO_KHAC": "FM_THU"};

/** Căn cứ pháp lý của các mẫu nền (cập nhật theo văn bản đang có hiệu lực). */
const FORM_TEMPLATE_BASE_LEGAL = {"FM_HD_KINH_TE": {"LOAI_MAU": "Hợp đồng dân sự – thương mại", "PHAM_VI_SU_DUNG": "Soạn hợp đồng giữa Công ty và đối tác; phải có đủ nội dung chủ yếu theo Điều 398 BLDS và được người có thẩm quyền ký, đóng dấu.", "CAN_CU_PHAP_LY": "Bộ luật Dân sự số 91/2015/QH13 (Điều 385–408 về hợp đồng); Luật Thương mại số 36/2005/QH11 (sửa đổi 2017, 2019), Điều 300–302 về phạt vi phạm (tối đa 8%) và bồi thường thiệt hại; Điều 463–471 BLDS về hợp đồng vay (lãi suất không quá 20%/năm); Luật Sở hữu trí tuệ (sửa đổi 2022) cho hợp đồng phần mềm, bản quyền, chuyển giao"}, "FM_PHU_LUC_HD": {"LOAI_MAU": "Phụ lục hợp đồng", "PHAM_VI_SU_DUNG": "Sửa đổi, bổ sung hợp đồng đã ký; không được trái với hợp đồng gốc (trừ khi là nội dung sửa đổi).", "CAN_CU_PHAP_LY": "Bộ luật Dân sự 2015, Điều 403 (phụ lục hợp đồng); Bộ luật Lao động 2019, Điều 22 (phụ lục hợp đồng lao động không được sửa đổi thời hạn hợp đồng)"}, "FM_BB_HOP_DONG": {"LOAI_MAU": "Biên bản thực hiện hợp đồng", "PHAM_VI_SU_DUNG": "Ghi nhận nghiệm thu, bàn giao, đối chiếu, thanh lý; là căn cứ thanh toán và chấm dứt nghĩa vụ.", "CAN_CU_PHAP_LY": "Bộ luật Dân sự số 91/2015/QH13 (Điều 385–408 về hợp đồng); Luật Thương mại số 36/2005/QH11 (sửa đổi 2017, 2019), Điều 300–302 về phạt vi phạm (tối đa 8%) và bồi thường thiệt hại; Luật Kế toán 2015 (chứng từ kèm theo thanh toán)"}, "FM_THOA_THUAN": {"LOAI_MAU": "Cam kết – thỏa thuận", "PHAM_VI_SU_DUNG": "Cam kết, NDA, MOU, thỏa thuận nguyên tắc; NDA với người lao động có thể ký kèm hợp đồng lao động.", "CAN_CU_PHAP_LY": "Bộ luật Dân sự 2015; Bộ luật Lao động 2019, Điều 21 khoản 2 (thỏa thuận bảo vệ bí mật kinh doanh, bí mật công nghệ); Luật Sở hữu trí tuệ (bí mật kinh doanh); Luật Bảo vệ dữ liệu cá nhân số 91/2025/QH15"}, "FM_TO_TRINH": {"LOAI_MAU": "Văn bản hành chính nội bộ", "PHAM_VI_SU_DUNG": "Trình cấp có thẩm quyền xin chủ trương hoặc phê duyệt.", "CAN_CU_PHAP_LY": "Nghị định 30/2020/NĐ-CP về công tác văn thư (thể thức văn bản; doanh nghiệp áp dụng tham khảo); Luật Doanh nghiệp số 59/2020/QH14 và Điều lệ công ty về thẩm quyền ký"}, "FM_BIEN_BAN": {"LOAI_MAU": "Biên bản", "PHAM_VI_SU_DUNG": "Ghi lại diễn biến, kết luận cuộc họp/làm việc; phải có chữ ký chủ trì và thư ký.", "CAN_CU_PHAP_LY": "Nghị định 30/2020/NĐ-CP về công tác văn thư (thể thức văn bản; doanh nghiệp áp dụng tham khảo); Luật Doanh nghiệp số 59/2020/QH14 và Điều lệ công ty về thẩm quyền ký"}, "FM_QUYET_DINH": {"LOAI_MAU": "Quyết định", "PHAM_VI_SU_DUNG": "Quyết định nhân sự, khen thưởng, kỷ luật, tổ chức; ký bởi người có thẩm quyền.", "CAN_CU_PHAP_LY": "Nghị định 30/2020/NĐ-CP về công tác văn thư (thể thức văn bản; doanh nghiệp áp dụng tham khảo); Luật Doanh nghiệp số 59/2020/QH14 và Điều lệ công ty về thẩm quyền ký; Bộ luật Lao động 2019: Điều 29 (điều chuyển tối đa 60 ngày/năm nếu không có sự đồng ý), Điều 122–125 (trình tự, hình thức kỷ luật), Điều 123 (thời hiệu 06 tháng; 12 tháng với vi phạm về tài chính, tài sản, bí mật)"}, "FM_THONG_BAO": {"LOAI_MAU": "Thông báo", "PHAM_VI_SU_DUNG": "Thông báo nội bộ; ngày nghỉ lễ, tết theo Điều 112 BLLĐ.", "CAN_CU_PHAP_LY": "Nghị định 30/2020/NĐ-CP về công tác văn thư (thể thức văn bản; doanh nghiệp áp dụng tham khảo); Luật Doanh nghiệp số 59/2020/QH14 và Điều lệ công ty về thẩm quyền ký; Bộ luật Lao động 2019, Điều 112 (nghỉ lễ, tết 11 ngày)"}, "FM_CONG_VAN": {"LOAI_MAU": "Công văn", "PHAM_VI_SU_DUNG": "Văn bản giao dịch với cơ quan, đối tác.", "CAN_CU_PHAP_LY": "Nghị định 30/2020/NĐ-CP về công tác văn thư (thể thức văn bản; doanh nghiệp áp dụng tham khảo); Luật Doanh nghiệp số 59/2020/QH14 và Điều lệ công ty về thẩm quyền ký"}, "FM_GIAY_GIOI_THIEU": {"LOAI_MAU": "Giấy giới thiệu", "PHAM_VI_SU_DUNG": "Giới thiệu người đi liên hệ công tác; ghi rõ thời hạn giá trị.", "CAN_CU_PHAP_LY": "Nghị định 30/2020/NĐ-CP về công tác văn thư (thể thức văn bản; doanh nghiệp áp dụng tham khảo); Luật Doanh nghiệp số 59/2020/QH14 và Điều lệ công ty về thẩm quyền ký"}, "FM_CONG_TAC": {"LOAI_MAU": "Nội bộ doanh nghiệp", "PHAM_VI_SU_DUNG": "Đề nghị, kế hoạch, quyết toán công tác.", "CAN_CU_PHAP_LY": "Luật Kế toán số 88/2015/QH13 (Điều 16 nội dung chứng từ); Nghị định 174/2016/NĐ-CP; chế độ kế toán doanh nghiệp đang áp dụng (Thông tư 99/2025/TT-BTC từ 01/01/2026 hoặc Thông tư 133/2016/TT-BTC); Luật Thuế GTGT số 48/2024/QH15 (thanh toán từ 5 triệu đồng phải không dùng tiền mặt để khấu trừ thuế); quy chế công tác phí của Công ty"}, "FM_SU_CO": {"LOAI_MAU": "Biên bản sự cố – vi phạm", "PHAM_VI_SU_DUNG": "Ghi nhận sự cố, vi phạm, thiệt hại; làm căn cứ xử lý kỷ luật, bồi thường.", "CAN_CU_PHAP_LY": "Bộ luật Lao động số 45/2019/QH14; Nghị định 145/2020/NĐ-CP; Thông tư 10/2020/TT-BLĐTBXH: Điều 122 (lập biên bản), Điều 129 (bồi thường thiệt hại; sơ suất gây thiệt hại không nghiêm trọng dưới 10 tháng lương tối thiểu vùng thì bồi thường tối đa 03 tháng lương)"}, "FM_KE_HOACH": {"LOAI_MAU": "Nội bộ doanh nghiệp", "PHAM_VI_SU_DUNG": "Kế hoạch công việc nội bộ.", "CAN_CU_PHAP_LY": "Quy chế quản trị nội bộ của Công ty"}, "FM_BAO_CAO": {"LOAI_MAU": "Nội bộ doanh nghiệp", "PHAM_VI_SU_DUNG": "Báo cáo nội bộ.", "CAN_CU_PHAP_LY": "Quy chế quản trị nội bộ của Công ty"}, "FM_DON_KHAC": {"LOAI_MAU": "Đơn của người lao động", "PHAM_VI_SU_DUNG": "Đơn cá nhân gửi Công ty; đơn xin nghỉ việc phải báo trước theo Điều 35 BLLĐ.", "CAN_CU_PHAP_LY": "Bộ luật Lao động số 45/2019/QH14; Nghị định 145/2020/NĐ-CP; Thông tư 10/2020/TT-BLĐTBXH: Điều 35 (báo trước 45 ngày với HĐ không xác định thời hạn, 30 ngày với HĐ 12–36 tháng, 03 ngày làm việc với HĐ dưới 12 tháng), Điều 115 (nghỉ không lương); Luật Bảo vệ dữ liệu cá nhân số 91/2025/QH15"}, "FM_NHAN_SU": {"LOAI_MAU": "Hồ sơ nhân sự", "PHAM_VI_SU_DUNG": "Thông tin, đánh giá, tiếp nhận, nghỉ việc; thông tin cá nhân phải có sự đồng ý của chủ thể dữ liệu.", "CAN_CU_PHAP_LY": "Bộ luật Lao động số 45/2019/QH14; Nghị định 145/2020/NĐ-CP; Thông tư 10/2020/TT-BLĐTBXH: Điều 27 (thông báo kết quả thử việc), Điều 48 (thanh toán trong 14 ngày khi chấm dứt HĐ); Luật Bảo vệ dữ liệu cá nhân số 91/2025/QH15"}, "FM_CHAM_CONG": {"LOAI_MAU": "Nội bộ doanh nghiệp", "PHAM_VI_SU_DUNG": "Đăng ký làm thêm giờ, điều chỉnh công.", "CAN_CU_PHAP_LY": "Bộ luật Lao động số 45/2019/QH14; Nghị định 145/2020/NĐ-CP; Thông tư 10/2020/TT-BLĐTBXH: Điều 107 (làm thêm giờ phải được NLĐ đồng ý; không quá 50% giờ làm việc bình thường/ngày, 40 giờ/tháng, 200 giờ/năm – 300 giờ với một số ngành); Điều 98 (trả lương làm thêm)"}, "FM_LUONG": {"LOAI_MAU": "Tiền lương – chế độ", "PHAM_VI_SU_DUNG": "Bảng lương, phụ cấp, thưởng, xác nhận thu nhập.", "CAN_CU_PHAP_LY": "Bộ luật Lao động số 45/2019/QH14; Nghị định 145/2020/NĐ-CP; Thông tư 10/2020/TT-BLĐTBXH: Điều 90–104; Nghị định 293/2025/NĐ-CP lương tối thiểu vùng từ 01/01/2026 (vùng I 5.310.000đ, II 4.730.000đ, III 4.140.000đ, IV 3.700.000đ); Luật Thuế TNCN (xác nhận thu nhập)"}, "FM_TUYEN_DUNG_HS": {"LOAI_MAU": "Hồ sơ tuyển dụng", "PHAM_VI_SU_DUNG": "JD, đánh giá phỏng vấn, thư mời nhận việc; không phân biệt đối xử; thử việc theo Điều 24–27 BLLĐ.", "CAN_CU_PHAP_LY": "Bộ luật Lao động số 45/2019/QH14; Nghị định 145/2020/NĐ-CP; Thông tư 10/2020/TT-BLĐTBXH: Điều 8 (cấm phân biệt đối xử), Điều 25 (thử việc tối đa 180/60/30/06 ngày tùy công việc), Điều 26 (lương thử việc ít nhất 85%); Luật Việc làm số 74/2025/QH15; Luật Bảo vệ dữ liệu cá nhân số 91/2025/QH15"}, "FM_DAO_TAO": {"LOAI_MAU": "Nội bộ doanh nghiệp", "PHAM_VI_SU_DUNG": "Hồ sơ đào tạo; nếu Công ty chịu chi phí phải ký hợp đồng đào tạo.", "CAN_CU_PHAP_LY": "Bộ luật Lao động số 45/2019/QH14; Nghị định 145/2020/NĐ-CP; Thông tư 10/2020/TT-BLĐTBXH: Điều 59–62 (hợp đồng đào tạo nghề, hoàn trả chi phí)"}, "FM_KHEN_THUONG_KY_LUAT": {"LOAI_MAU": "Khen thưởng – kỷ luật lao động", "PHAM_VI_SU_DUNG": "Đề xuất, biên bản, giải trình; kỷ luật phải theo nội quy đã đăng ký và trình tự Điều 122.", "CAN_CU_PHAP_LY": "Bộ luật Lao động số 45/2019/QH14; Nghị định 145/2020/NĐ-CP; Thông tư 10/2020/TT-BLĐTBXH: Điều 104 (thưởng), Điều 117–127 (kỷ luật lao động); Nghị định 145/2020/NĐ-CP Điều 70"}, "FM_PHIEU_THU_CHI": {"LOAI_MAU": "Chứng từ kế toán", "PHAM_VI_SU_DUNG": "Phiếu thu, phiếu chi; phải có đủ nội dung chứng từ theo Điều 16 Luật Kế toán và chữ ký các bên.", "CAN_CU_PHAP_LY": "Luật Kế toán số 88/2015/QH13 (Điều 16 nội dung chứng từ); Nghị định 174/2016/NĐ-CP; chế độ kế toán doanh nghiệp đang áp dụng (Thông tư 99/2025/TT-BTC từ 01/01/2026 hoặc Thông tư 133/2016/TT-BTC); Luật Thuế GTGT số 48/2024/QH15 (thanh toán từ 5 triệu đồng phải không dùng tiền mặt để khấu trừ thuế)"}, "FM_KE_TOAN": {"LOAI_MAU": "Chứng từ kế toán", "PHAM_VI_SU_DUNG": "UNC, đối chiếu, xác nhận công nợ, quyết toán.", "CAN_CU_PHAP_LY": "Luật Kế toán số 88/2015/QH13 (Điều 16 nội dung chứng từ); Nghị định 174/2016/NĐ-CP; chế độ kế toán doanh nghiệp đang áp dụng (Thông tư 99/2025/TT-BTC từ 01/01/2026 hoặc Thông tư 133/2016/TT-BTC); Luật Thuế GTGT số 48/2024/QH15 (thanh toán từ 5 triệu đồng phải không dùng tiền mặt để khấu trừ thuế); Nghị định 123/2020/NĐ-CP (sửa đổi bởi Nghị định 70/2025/NĐ-CP) về hóa đơn, chứng từ"}, "FM_CONG_NO": {"LOAI_MAU": "Công nợ", "PHAM_VI_SU_DUNG": "Xác nhận, đề nghị thanh toán, cam kết, gia hạn công nợ với khách hàng.", "CAN_CU_PHAP_LY": "Bộ luật Dân sự số 91/2015/QH13 (Điều 385–408 về hợp đồng); Luật Thương mại số 36/2005/QH11 (sửa đổi 2017, 2019), Điều 300–302 về phạt vi phạm (tối đa 8%) và bồi thường thiệt hại; Bộ luật Dân sự Điều 429 (thời hiệu khởi kiện tranh chấp hợp đồng 03 năm) – xác nhận nợ giúp tính lại thời hiệu"}, "FM_DE_NGHI_MUA_HANG": {"LOAI_MAU": "Nội bộ doanh nghiệp", "PHAM_VI_SU_DUNG": "Đề nghị mua hàng theo quy chế mua sắm.", "CAN_CU_PHAP_LY": "Quy chế mua sắm của Công ty; Luật Kế toán số 88/2015/QH13 (Điều 16 nội dung chứng từ); Nghị định 174/2016/NĐ-CP; chế độ kế toán doanh nghiệp đang áp dụng (Thông tư 99/2025/TT-BTC từ 01/01/2026 hoặc Thông tư 133/2016/TT-BTC); Luật Thuế GTGT số 48/2024/QH15 (thanh toán từ 5 triệu đồng phải không dùng tiền mặt để khấu trừ thuế)"}, "FM_DON_DAT_HANG": {"LOAI_MAU": "Đơn đặt hàng", "PHAM_VI_SU_DUNG": "PO có giá trị như hợp đồng khi nhà cung cấp xác nhận.", "CAN_CU_PHAP_LY": "Bộ luật Dân sự số 91/2015/QH13 (Điều 385–408 về hợp đồng); Luật Thương mại số 36/2005/QH11 (sửa đổi 2017, 2019), Điều 300–302 về phạt vi phạm (tối đa 8%) và bồi thường thiệt hại"}, "FM_NHA_CUNG_CAP": {"LOAI_MAU": "Nội bộ doanh nghiệp", "PHAM_VI_SU_DUNG": "Hồ sơ, đánh giá, so sánh giá nhà cung cấp.", "CAN_CU_PHAP_LY": "Quy chế mua sắm của Công ty"}, "FM_NGHIEM_THU": {"LOAI_MAU": "Biên bản nghiệm thu", "PHAM_VI_SU_DUNG": "Nghiệm thu hàng hóa, dịch vụ, công việc; căn cứ thanh toán.", "CAN_CU_PHAP_LY": "Bộ luật Dân sự số 91/2015/QH13 (Điều 385–408 về hợp đồng); Luật Thương mại số 36/2005/QH11 (sửa đổi 2017, 2019), Điều 300–302 về phạt vi phạm (tối đa 8%) và bồi thường thiệt hại; Luật Kế toán số 88/2015/QH13 (Điều 16 nội dung chứng từ); Nghị định 174/2016/NĐ-CP; chế độ kế toán doanh nghiệp đang áp dụng (Thông tư 99/2025/TT-BTC từ 01/01/2026 hoặc Thông tư 133/2016/TT-BTC); Luật Thuế GTGT số 48/2024/QH15 (thanh toán từ 5 triệu đồng phải không dùng tiền mặt để khấu trừ thuế)"}, "FM_KHO": {"LOAI_MAU": "Chứng từ kế toán", "PHAM_VI_SU_DUNG": "Phiếu nhập, xuất, chuyển kho; ghi đủ số lượng, đơn giá, thành tiền và chữ ký.", "CAN_CU_PHAP_LY": "Luật Kế toán số 88/2015/QH13 (Điều 16 nội dung chứng từ); Nghị định 174/2016/NĐ-CP; chế độ kế toán doanh nghiệp đang áp dụng (Thông tư 99/2025/TT-BTC từ 01/01/2026 hoặc Thông tư 133/2016/TT-BTC); Luật Thuế GTGT số 48/2024/QH15 (thanh toán từ 5 triệu đồng phải không dùng tiền mặt để khấu trừ thuế)"}, "FM_KIEM_KE": {"LOAI_MAU": "Biên bản kiểm kê", "PHAM_VI_SU_DUNG": "Kiểm kê định kỳ, cuối năm; xử lý chênh lệch.", "CAN_CU_PHAP_LY": "Luật Kế toán 2015, Điều 40 (kiểm kê tài sản); Luật Kế toán số 88/2015/QH13 (Điều 16 nội dung chứng từ); Nghị định 174/2016/NĐ-CP; chế độ kế toán doanh nghiệp đang áp dụng (Thông tư 99/2025/TT-BTC từ 01/01/2026 hoặc Thông tư 133/2016/TT-BTC); Luật Thuế GTGT số 48/2024/QH15 (thanh toán từ 5 triệu đồng phải không dùng tiền mặt để khấu trừ thuế)"}, "FM_TAI_SAN": {"LOAI_MAU": "Nội bộ doanh nghiệp", "PHAM_VI_SU_DUNG": "Thu hồi, điều chuyển, sửa chữa, bảo hành tài sản.", "CAN_CU_PHAP_LY": "Quy chế quản lý tài sản của Công ty; Thông tư 45/2013/TT-BTC (sửa đổi) về quản lý tài sản cố định"}, "FM_THANH_LY": {"LOAI_MAU": "Biên bản thanh lý", "PHAM_VI_SU_DUNG": "Thanh lý tài sản, hàng hóa, công cụ; ghi giá trị còn lại và thu hồi.", "CAN_CU_PHAP_LY": "Thông tư 45/2013/TT-BTC (sửa đổi) về tài sản cố định; Luật Kế toán số 88/2015/QH13 (Điều 16 nội dung chứng từ); Nghị định 174/2016/NĐ-CP; chế độ kế toán doanh nghiệp đang áp dụng (Thông tư 99/2025/TT-BTC từ 01/01/2026 hoặc Thông tư 133/2016/TT-BTC); Luật Thuế GTGT số 48/2024/QH15 (thanh toán từ 5 triệu đồng phải không dùng tiền mặt để khấu trừ thuế)"}, "FM_BAO_GIA": {"LOAI_MAU": "Báo giá", "PHAM_VI_SU_DUNG": "Báo giá gửi khách hàng; ghi rõ hiệu lực và thuế GTGT.", "CAN_CU_PHAP_LY": "Luật Thương mại 2005; Luật Thuế GTGT số 48/2024/QH15"}, "FM_KINH_DOANH": {"LOAI_MAU": "Nội bộ doanh nghiệp", "PHAM_VI_SU_DUNG": "Đề xuất giá, chính sách bán hàng.", "CAN_CU_PHAP_LY": "Quy chế kinh doanh của Công ty; Luật Cạnh tranh số 23/2018/QH14"}, "FM_MARKETING": {"LOAI_MAU": "Nội bộ doanh nghiệp", "PHAM_VI_SU_DUNG": "Kế hoạch, ngân sách, nội dung quảng cáo.", "CAN_CU_PHAP_LY": "Luật Quảng cáo số 16/2012/QH13 (sửa đổi 2025); quy chế nội bộ"}, "FM_PHIEU_YEU_CAU": {"LOAI_MAU": "Nội bộ doanh nghiệp", "PHAM_VI_SU_DUNG": "Yêu cầu hỗ trợ, sửa chữa, cấp phát.", "CAN_CU_PHAP_LY": "Quy trình nội bộ của Công ty"}, "FM_BAO_TRI": {"LOAI_MAU": "Nội bộ doanh nghiệp", "PHAM_VI_SU_DUNG": "Bảo trì, sửa chữa thiết bị.", "CAN_CU_PHAP_LY": "Quy trình bảo trì của Công ty; Luật An toàn, vệ sinh lao động số 84/2015/QH13 (thiết bị có yêu cầu nghiêm ngặt)"}, "FM_CNTT": {"LOAI_MAU": "Nội bộ doanh nghiệp", "PHAM_VI_SU_DUNG": "Cấp, thu hồi tài khoản và quyền truy cập.", "CAN_CU_PHAP_LY": "Luật An ninh mạng số 24/2018/QH14; Luật Bảo vệ dữ liệu cá nhân số 91/2025/QH15; quy định bảo mật nội bộ"}, "FM_CHECKLIST": {"LOAI_MAU": "Nội bộ doanh nghiệp", "PHAM_VI_SU_DUNG": "Danh mục kiểm tra.", "CAN_CU_PHAP_LY": "Quy trình nội bộ của Công ty"}, "FM_AN_TOAN": {"LOAI_MAU": "An toàn – PCCC", "PHAM_VI_SU_DUNG": "Kiểm tra, huấn luyện, xử lý sự cố an toàn lao động, phòng cháy chữa cháy.", "CAN_CU_PHAP_LY": "Luật An toàn, vệ sinh lao động số 84/2015/QH13; Nghị định 44/2016/NĐ-CP (huấn luyện); Luật Phòng cháy, chữa cháy và cứu nạn, cứu hộ số 55/2024/QH15 (từ 01/07/2025)"}, "FM_QUY_TRINH": {"LOAI_MAU": "Nội bộ doanh nghiệp", "PHAM_VI_SU_DUNG": "Quy trình nội bộ.", "CAN_CU_PHAP_LY": "Điều lệ và quy chế quản trị của Công ty"}, "FM_QUY_DINH": {"LOAI_MAU": "Quy định – quy chế", "PHAM_VI_SU_DUNG": "Nội quy, quy chế; nội quy lao động phải đăng ký khi sử dụng từ 10 lao động.", "CAN_CU_PHAP_LY": "Bộ luật Lao động số 45/2019/QH14; Nghị định 145/2020/NĐ-CP; Thông tư 10/2020/TT-BLĐTBXH: Điều 118–121 (nội quy lao động, đăng ký tại cơ quan chuyên môn về lao động cấp tỉnh); Điều 93 (thang lương, bảng lương), Điều 104 (quy chế thưởng) – phải tham khảo ý kiến tổ chức đại diện NLĐ"}, "FM_HUONG_DAN": {"LOAI_MAU": "Nội bộ doanh nghiệp", "PHAM_VI_SU_DUNG": "Hướng dẫn nghiệp vụ.", "CAN_CU_PHAP_LY": "Quy trình nội bộ của Công ty"}, "FM_PHAP_LY_DN": {"LOAI_MAU": "Hồ sơ pháp lý", "PHAM_VI_SU_DUNG": "Hồ sơ đăng ký, giấy phép, thay đổi doanh nghiệp.", "CAN_CU_PHAP_LY": "Luật Doanh nghiệp số 59/2020/QH14 (sửa đổi bởi Luật số 76/2025/QH15); Nghị định 168/2025/NĐ-CP về đăng ký doanh nghiệp"}, "FM_THU": {"LOAI_MAU": "Thư giao dịch", "PHAM_VI_SU_DUNG": "Thư mời, xác nhận, cảm ơn, đề nghị.", "CAN_CU_PHAP_LY": "Thông lệ giao dịch thương mại"}};

function formLegalProfile_(id) {
  return FORM_TEMPLATE_LEGAL_PROFILES[id] || FORM_TEMPLATE_BASE_LEGAL[FORM_TEMPLATE_BASES[id]] || FORM_TEMPLATE_BASE_LEGAL[id] || {};
}

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
  VAI_TRO: ['MA_VAI_TRO', 'TEN_VAI_TRO', 'TRANG_THAI', 'GHI_CHU', 'CAP_BAO_MAT'],
  PHAN_QUYEN: ['ID_QUYEN', 'MA_VAI_TRO', 'MA_CHUC_NANG', 'TEN_CHUC_NANG', 'XEM', 'THEM', 'SUA', 'XOA', 'DUYET', 'XUAT_FILE', 'GHI_CHU'],
  NHAT_KY_DANG_NHAP: ['ID_NHAT_KY', 'THOI_GIAN', 'TEN_DANG_NHAP', 'MA_NHAN_VIEN', 'KET_QUA', 'LY_DO', 'THIET_BI'],
  NHAT_KY_HE_THONG: ['ID_NHAT_KY', 'THOI_GIAN', 'TEN_DANG_NHAP', 'MA_NHAN_VIEN', 'CHUC_NANG', 'HANH_DONG', 'KHOA_BAN_GHI', 'DU_LIEU_TRUOC', 'DU_LIEU_SAU', 'GHI_CHU']
};

const AUTH_MAX_FAILED_ATTEMPTS = 5;
const AUTH_LOCK_MINUTES = 15;
const AUTH_MIN_PASSWORD_LENGTH = 8;
/** Phiên đăng nhập: hết hạn khi không thao tác 8 giờ hoặc tối đa 7 ngày; mỗi tài khoản giữ tối đa 5 phiên. */
const AUTH_SESSION_PREFIX = 'PHI_LONG_LOCAL_SESSION_';
const AUTH_SESSION_IDLE_HOURS = 8;
const AUTH_SESSION_MAX_DAYS = 7;
const AUTH_SESSION_MAX_PER_USER = 5;
const AUTH_SESSION_CHECK_MINUTES = 5;
const AUTH_VERSION_KEY = 'PHI_LONG_AUTH_VERSION';
const AUTH_SESSION_ENDED = 'Phiên đăng nhập đã hết hạn hoặc không còn khả dụng. Vui lòng đăng nhập lại.';
/** Mật khẩu lưu dạng băm: pbk1$<số vòng>$<salt>$<HMAC-SHA256 lặp>. */
const AUTH_HASH_PREFIX = 'pbk1';
const AUTH_HASH_ROUNDS = 300;
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
/**
 * Mục con trong menu, phân quyền XEM riêng từng mục. Nhãn phải trùng data-page-label ở Index.html.
 * Thêm chức năng mới: thêm 1 dòng vào AUTH_MODULE_SEEDS (và mục con ở đây nếu có) — dòng quyền
 * cho mọi vai trò được tự tạo khi Quản trị mở trang Hệ thống, mặc định Không.
 */
const AUTH_MODULE_CHILDREN = {
  HO_SO: ['Hồ sơ nhân viên', 'Nhân viên nghỉ việc'],
  TUYEN_DUNG: ['Vị trí tuyển dụng', 'Ứng viên', 'Phỏng vấn', 'Tiếp nhận nhân viên'],
  BIEU_MAU: ['Biểu mẫu Hợp đồng', 'Biểu mẫu Hành chính', 'Biểu mẫu Nhân sự', 'Biểu mẫu Tài chính – Kế toán', 'Biểu mẫu Mua hàng – NCC', 'Biểu mẫu Kho', 'Biểu mẫu Tài sản – Thiết bị', 'Biểu mẫu Kinh doanh', 'Biểu mẫu Kỹ thuật – Bảo trì', 'Biểu mẫu Pháp lý & văn bản khác'],
  BAO_CAO: ['Báo cáo nhân sự', 'Báo cáo biến động', 'Báo cáo chấm công', 'Báo cáo lương'],
  DANH_MUC: ['Phòng ban', 'Chức vụ', 'Chi nhánh – địa điểm', 'Loại hợp đồng', 'Chính sách phép'],
  HE_THONG: ['Tài khoản', 'Vai trò – phân quyền', 'Cấu hình hệ thống', 'Nhật ký thao tác']
};
/** Sheet thuộc chức năng nào: phải có quyền XEM ở ít nhất một chức năng mới được tải. '*' = bất kỳ chức năng nào. Sheet không có ở đây là danh mục dùng chung. */
const AUTH_SHEET_MODULES = {
  DM_NHAN_VIEN: '*',
  LICH_SU_CONG_VIEC: ['LUAN_CHUYEN', 'HO_SO', 'BAO_CAO'],
  CC_CA_LAM_VIEC: ['NGHI_PHEP', 'BAO_CAO'], CC_CHAM_CONG: ['NGHI_PHEP', 'BAO_CAO'], CC_TANG_CA: ['NGHI_PHEP', 'BAO_CAO'],
  CC_NGHI_PHEP: ['NGHI_PHEP', 'BAO_CAO'], CC_BANG_CONG_THANG: ['NGHI_PHEP', 'BAO_CAO'],
  DM_BIEU_MAU: ['BIEU_MAU'], PHIEU_BIEU_MAU: ['BIEU_MAU'], DM_DIEU_KHOAN: ['BIEU_MAU'],
  TUYEN_DUNG_NHU_CAU: ['TUYEN_DUNG'], TUYEN_DUNG_UNG_VIEN: ['TUYEN_DUNG']
};
/** Mức xem dữ liệu nhạy cảm mặc định: 0 = không CCCD/BHXH/hợp đồng/lương; 1 = có CCCD/BHXH/hợp đồng; 2 = có cả lương. */
const AUTH_DEFAULT_LEVELS = { 'ROLE-ADMIN': 2, 'ROLE-MANAGER': 1 };
const SYSTEM_PERMISSION_ACTIONS = ['XEM', 'THEM', 'SUA', 'XOA', 'DUYET', 'XUAT_FILE'];
const SYSTEM_SHEET_NAMES = ['NGUOI_DUNG', 'VAI_TRO', 'PHAN_QUYEN', 'NHAT_KY_DANG_NHAP', 'NHAT_KY_HE_THONG'];
/** Trang Hệ thống chỉ tải tối đa ngần này dòng mỗi loại nhật ký; nhật ký cũ hơn SYSTEM_LOG_KEEP_DAYS ngày được chuyển sang NHAT_KY_LUU_TRU. */
const SYSTEM_LOG_LIMIT = 500;
const SYSTEM_LOG_KEEP_DAYS = 90;
const SYSTEM_LOG_ARCHIVE_HEADERS = ['NGUON', 'ID_NHAT_KY', 'THOI_GIAN', 'TEN_DANG_NHAP', 'MA_NHAN_VIEN', 'CHUC_NANG', 'HANH_DONG', 'KHOA_BAN_GHI', 'KET_QUA', 'LY_DO', 'THIET_BI', 'DU_LIEU_TRUOC', 'DU_LIEU_SAU', 'GHI_CHU'];

/** R72: cột nhạy cảm của DM_NHAN_VIEN. Cấp 0 không thấy pháp lý/hợp đồng; cấp 1 thấy pháp lý/hợp đồng; cấp 2 thấy cả lương. */
const EMPLOYEE_LEGAL_FIELDS = ['SO_CCCD', 'NGAY_CAP', 'MA_SO_BHXH', 'NGAY_THAM_GIA_BHXH', 'LOAI_HD', 'NOI_LAM_VIEC', 'THOI_DIEM_CHAM_DUT_HD_VA_LY_DO'];
const EMPLOYEE_SALARY_FIELDS = ['LUONG_CO_BAN'];
const EMPLOYEE_STATUS_VALUES = ['Đang hoạt động', 'Thử việc', 'Tạm nghỉ', 'Nghỉ việc'];

/** So khớp không dấu: dùng cho trạng thái/tiêu đề cột có dấu tiếng Việt. */
function plain_(value) {
  return String(value == null ? '' : value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase().trim();
}

function sensitiveLevel_(roleCode, snapshot) {
  var role = key_(roleCode);
  if (role === 'role-admin') return 2;
  var row = snapshot && snapshot.roleByKey ? snapshot.roleByKey[role] : readSheet_(SpreadsheetApp.openById(SPREADSHEET_ID), 'VAI_TRO').rows.find(function (item) { return key_(item.MA_VAI_TRO) === role; });
  if (!row || !authActive_(row.TRANG_THAI || 'Đang hoạt động')) return 0;
  var level = parseInt(row.CAP_BAO_MAT, 10);
  if (isNaN(level)) level = AUTH_DEFAULT_LEVELS[String(roleCode).trim().toUpperCase()] || 0;
  return Math.max(0, Math.min(2, level));
}

/** Mức bảo mật của người đang gọi: lấy từ phiên (được làm mới 5 phút/lần). */
function authLevel_(auth) {
  return auth && auth.sensitiveLevel != null ? Number(auth.sensitiveLevel) : sensitiveLevel_(auth && auth.roleCode);
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

/** appendRow là thao tác nguyên tử: hai người ghi cùng lúc không đè lên nhau. */
function appendAuthRecord_(sheet, record, suppliedMeta) {
  var meta = suppliedMeta || headers_(sheet);
  sheet.appendRow(meta.headers.map(function (header) {
    return header ? (record[header] == null ? '' : record[header]) : '';
  }));
  return sheet.getLastRow();
}

function authHashRaw_(password, salt, rounds) {
  var key = Utilities.newBlob(String(salt)).getBytes(), bytes = Utilities.computeHmacSha256Signature(Utilities.newBlob(String(password)).getBytes(), key);
  for (var i = 1; i < rounds; i++) bytes = Utilities.computeHmacSha256Signature(bytes, key);
  return Utilities.base64Encode(bytes);
}

function authIsHashed_(stored) {
  return /^pbk1\$\d+\$[0-9a-f]+\$[A-Za-z0-9+\/=]+$/.test(String(stored || ''));
}

function authPasswordHash_(password) {
  var salt = Utilities.getUuid().replace(/-/g, '');
  return [AUTH_HASH_PREFIX, AUTH_HASH_ROUNDS, salt, authHashRaw_(password, salt, AUTH_HASH_ROUNDS)].join('$');
}

/** Hỗ trợ cả mật khẩu cũ chưa băm để chuyển đổi dần, không bắt người dùng đổi mật khẩu. */
function authPasswordMatches_(stored, password) {
  stored = String(stored || ''); password = String(password || '');
  if (!stored || !password) return false;
  if (!authIsHashed_(stored)) return stored === password;
  var parts = stored.split('$'), expected = parts[3], actual = authHashRaw_(password, parts[2], Number(parts[1]) || AUTH_HASH_ROUNDS), diff = expected.length ^ actual.length;
  for (var i = 0; i < Math.min(expected.length, actual.length); i++) diff |= expected.charCodeAt(i) ^ actual.charCodeAt(i);
  return diff === 0;
}

/**
 * Hàm cài đặt/bảo trì chỉ được chạy trong trình soạn thảo Apps Script.
 * Mọi hàm không kết thúc bằng "_" đều gọi được từ trình duyệt qua google.script.run,
 * nên phải chặn: người chạy phải chính là chủ dự án.
 */
function requireEditorRun_() {
  var active = '', owner = '';
  try { active = Session.getActiveUser().getEmail(); owner = Session.getEffectiveUser().getEmail(); } catch (error) {}
  if (!active || !owner || key_(active) !== key_(owner)) throw new Error('Chỉ chạy hàm này trong trình soạn thảo Apps Script (Run).');
}

/** Hàm chạy theo lịch: cho phép trigger (có triggerUid) hoặc chạy tay trong trình soạn thảo. */
function requireEditorOrTrigger_(event) {
  if (event && event.triggerUid) return;
  requireEditorRun_();
}

function authIsAdmin_(user) {
  return key_(user && user.roleCode) === 'role-admin';
}

function authActiveAdminCount_(ss, exceptRow) {
  return authAccountRows_(ss).filter(function (item) {
    return item.rowNumber !== exceptRow && key_(item.data.MA_VAI_TRO) === 'role-admin' && authActive_(item.data.TRANG_THAI);
  }).length;
}

/** Băm mọi mật khẩu còn ở dạng chữ thường. Trả về số tài khoản đã chuyển. */
function authMigratePasswords_(ss) {
  var sheet = ss.getSheetByName('NGUOI_DUNG');
  if (!sheet) return 0;
  var meta = headers_(sheet), count = 0;
  authAccountRows_(ss).forEach(function (item) {
    var stored = String(item.data.MAT_KHAU || '');
    if (!stored || authIsHashed_(stored)) return;
    authWriteField_(sheet, meta, item.rowNumber, 'MAT_KHAU', authPasswordHash_(stored), '@');
    count++;
  });
  if (count) SpreadsheetApp.flush();
  return count;
}

/** Chạy thủ công một lần trong Apps Script để băm toàn bộ mật khẩu cũ ngay. */
function hashLocalPasswords() {
  requireEditorRun_();
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID), lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try { return { success: true, hashed: authMigratePasswords_(ss) }; } finally { lock.releaseLock(); }
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
  data.forEach(function (row, index) { result.push({ data: row, rowNumber: row.__row || index + 2 }); });
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
    roleByKey: {},
    permissionsByKey: {}
  };
  snapshot.roles.forEach(function (item) {
    snapshot.roleNames[key_(item.MA_VAI_TRO)] = item.TEN_VAI_TRO || item.MA_VAI_TRO || '';
    snapshot.roleByKey[key_(item.MA_VAI_TRO)] = item;
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
  var role = snapshot && snapshot.roleByKey ? snapshot.roleByKey[key_(roleCode)] : null;
  if (role && !authActive_(role.TRANG_THAI || 'Đang hoạt động')) return false;
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
    sensitiveLevel: sensitiveLevel_(roleCode, snapshot),
    menuAccess: {},
    permissions: {},
    menuDenied: []
  };
  // Gọn để phiên nhỏ: permissions[MÃ] = chuỗi 0/1 theo SYSTEM_PERMISSION_ACTIONS; menuDenied = mục con bị ẩn ('view|nhãn').
  authModuleList_().forEach(function (module) {
    if (module.parent) {
      var row = snapshot && snapshot.permissionsByKey && snapshot.permissionsByKey[key_(roleCode) + '|' + key_(module.code)];
      if (context.menuAccess[module.view] && row && !authFlag_(row.XEM) && key_(roleCode) !== 'role-admin') context.menuDenied.push(module.view + '|' + module.label);
      return;
    }
    context.permissions[module.code] = SYSTEM_PERMISSION_ACTIONS.map(function (action) { return authCan_(ss, roleCode, module.code, action, snapshot) ? '1' : '0'; }).join('');
    context.menuAccess[module.view] = context.permissions[module.code].charAt(0) === '1';
  });
  return context;
}

function authSessionKey_(token) {
  return AUTH_SESSION_PREFIX + String(token || '');
}

function authSessionExpired_(session, now) {
  var created = Date.parse(session && session.createdAt || ''), last = Date.parse(session && (session.lastActivityAt || session.createdAt) || '');
  if (!created || !last) return true;
  return now - last > AUTH_SESSION_IDLE_HOURS * 3600000 || now - created > AUTH_SESSION_MAX_DAYS * 86400000;
}

/** Xoá phiên hết hạn và phiên cũ vượt số lượng cho phép của một tài khoản; tránh đầy Script Properties (500KB). */
function authPurgeSessions_(store, username, reserve) {
  var all = store.getProperties(), now = Date.now(), mine = [], removed = 0;
  Object.keys(all).forEach(function (key) {
    if (key.indexOf(AUTH_SESSION_PREFIX) !== 0) return;
    var session = null;
    try { session = JSON.parse(all[key]); } catch (error) {}
    if (!session || authSessionExpired_(session, now)) { store.deleteProperty(key); removed++; return; }
    if (username && key_(session.user && session.user.username) === key_(username)) mine.push({ key: key, last: Date.parse(session.lastActivityAt || session.createdAt) || 0 });
  });
  mine.sort(function (a, b) { return b.last - a.last; }).slice(Math.max(0, AUTH_SESSION_MAX_PER_USER - (reserve || 0))).forEach(function (item) { store.deleteProperty(item.key); removed++; });
  return removed;
}

/** Kết thúc mọi phiên của một tài khoản (khi khoá, reset/đổi mật khẩu), trừ phiên đang dùng. */
function authRevokeUserSessions_(username, exceptToken) {
  var store = PropertiesService.getScriptProperties(), all = store.getProperties(), keep = exceptToken ? authSessionKey_(exceptToken) : '';
  Object.keys(all).forEach(function (key) {
    if (key.indexOf(AUTH_SESSION_PREFIX) !== 0 || key === keep) return;
    try { if (key_(JSON.parse(all[key]).user.username) === key_(username)) store.deleteProperty(key); } catch (error) { store.deleteProperty(key); }
  });
}

/** Báo cho mọi phiên kiểm tra lại tài khoản/quyền ở lần gọi kế tiếp. */
function authBumpVersion_() {
  PropertiesService.getScriptProperties().setProperty(AUTH_VERSION_KEY, String(Date.now()));
}

function authSession_(token) {
  var value = String(token || '').trim();
  if (!value) throw new Error(AUTH_SESSION_ENDED);
  // Không dùng CacheService cho phiên đăng nhập: CacheService có thể tự xoá
  // sau thời gian giới hạn dù người dùng vẫn đang làm việc.
  var store = PropertiesService.getScriptProperties(), key = authSessionKey_(value), raw = store.getProperty(key), now = Date.now();
  if (!raw) throw new Error(AUTH_SESSION_ENDED);
  var session;
  try { session = JSON.parse(raw); } catch (error) { store.deleteProperty(key); throw new Error(AUTH_SESSION_ENDED); }
  if (authSessionExpired_(session, now)) { store.deleteProperty(key); throw new Error(AUTH_SESSION_ENDED); }
  var version = store.getProperty(AUTH_VERSION_KEY) || '0', changed = false;
  if (session.authVersion !== version || now - (Date.parse(session.checkedAt || '') || 0) > AUTH_SESSION_CHECK_MINUTES * 60000) {
    // Đọc lại tài khoản: khoá/đổi vai trò/đổi quyền có hiệu lực ngay, không chờ đăng xuất.
    var ss = SpreadsheetApp.openById(SPREADSHEET_ID), snapshot = authSnapshot_(ss), wanted = key_(session.user && session.user.id), found = authAccountRows_(ss, snapshot).find(function (item) {
      return wanted ? key_(item.data.ID_NGUOI_DUNG) === wanted : key_(item.data.TEN_DANG_NHAP) === key_(session.user && session.user.username);
    }), lockedUntil = found && authDate_(found.data.KHOA_DEN);
    if (!found || !authActive_(found.data.TRANG_THAI) || (lockedUntil && lockedUntil.getTime() > now)) {
      store.deleteProperty(key);
      throw new Error('Phiên đăng nhập đã kết thúc vì tài khoản đã bị khóa hoặc ngừng hoạt động.');
    }
    session.user = authContext_(ss, found.data, snapshot);
    session.authVersion = version;
    session.checkedAt = new Date(now).toISOString();
    changed = true;
  }
  if (changed || now - (Date.parse(session.lastActivityAt || '') || 0) > AUTH_SESSION_CHECK_MINUTES * 60000) {
    session.lastActivityAt = new Date(now).toISOString();
    store.setProperty(key, JSON.stringify(session));
  }
  return session;
}

/** Chạy thủ công (hoặc gắn trigger hằng ngày) để dọn phiên hết hạn. */
function cleanupLocalSessions() {
  requireEditorRun_();
  return { success: true, removed: authPurgeSessions_(PropertiesService.getScriptProperties(), '', 0) };
}

function requireAuth_(token) {
  return authSession_(token).user;
}

function authUserCan_(user, moduleCode, action) {
  if (key_(user.roleCode) === 'role-admin') return true;
  var flags = user.permissions && user.permissions[moduleCode], index = SYSTEM_PERMISSION_ACTIONS.indexOf(action);
  if (typeof flags === 'string' && index !== -1) return flags.charAt(index) === '1';
  return authCan_(SpreadsheetApp.openById(SPREADSHEET_ID), user.roleCode, moduleCode, action);
}

function requirePermission_(token, moduleCode, action) {
  var user = requireAuth_(token);
  if (key_(user.roleCode) === 'role-admin') return user;
  if (!authUserCan_(user, moduleCode, action)) {
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
    appendAuthRecord_(sheet, { MA_VAI_TRO: seed[0], TEN_VAI_TRO: seed[1], TRANG_THAI: 'Đang hoạt động', GHI_CHU: '', CAP_BAO_MAT: AUTH_DEFAULT_LEVELS[seed[0]] || 0 });
  });
}

function authChildCode_(moduleCode, label) {
  return moduleCode + '.' + plain_(label).toUpperCase().replace(/[^A-Z0-9]+/g, '_').replace(/^_+|_+$/g, '');
}

/** Toàn bộ chức năng theo thứ tự hiển thị, mục con đứng sau chức năng cha. */
function authModuleList_() {
  var list = [];
  AUTH_MODULE_SEEDS.forEach(function (module) {
    list.push({ code: module[0], name: module[1], view: module[2], parent: '' });
    (AUTH_MODULE_CHILDREN[module[0]] || []).forEach(function (label) {
      list.push({ code: authChildCode_(module[0], label), name: label, view: module[2], parent: module[0], label: label });
    });
  });
  return list;
}

/** Quyền mặc định cho 5 vai trò gốc; vai trò tự tạo mặc định không có quyền. */
function authSeedDefault_(roleCode, moduleCode) {
  var role = String(roleCode).trim().toUpperCase(), admin = role === 'ROLE-ADMIN', flags = { XEM: admin, THEM: admin, SUA: admin, XOA: admin, DUYET: admin, XUAT_FILE: admin };
  if (role === 'ROLE-MANAGER') {
    flags.XEM = moduleCode !== 'HE_THONG'; flags.THEM = ['NHAN_SU', 'LUAN_CHUYEN', 'NGHI_PHEP', 'BIEU_MAU'].indexOf(moduleCode) !== -1;
    flags.SUA = flags.THEM; flags.DUYET = ['LUAN_CHUYEN', 'NGHI_PHEP', 'BIEU_MAU'].indexOf(moduleCode) !== -1; flags.XUAT_FILE = moduleCode !== 'HE_THONG';
  } else if (role === 'ROLE-IT') {
    flags.XEM = true; flags.SUA = ['HE_THONG', 'DANH_MUC'].indexOf(moduleCode) !== -1; flags.XUAT_FILE = true;
  } else if (role === 'ROLE-USER') {
    flags.XEM = ['TONG_QUAN', 'NHAN_SU', 'HO_SO', 'LUAN_CHUYEN', 'NGHI_PHEP', 'BIEU_MAU'].indexOf(moduleCode) !== -1;
    flags.THEM = ['NGHI_PHEP', 'BIEU_MAU'].indexOf(moduleCode) !== -1;
  } else if (role === 'ROLE-VIEW') {
    flags.XEM = ['TONG_QUAN', 'HO_SO', 'BAO_CAO'].indexOf(moduleCode) !== -1; flags.XUAT_FILE = moduleCode === 'BAO_CAO';
  }
  return flags;
}

/**
 * Đồng bộ PHAN_QUYEN với danh sách chức năng và mọi vai trò trong VAI_TRO (kể cả vai trò thêm tay).
 * Dòng thiếu được thêm: chức năng mới mặc định theo vai trò gốc / Không; mục con mới kế thừa quyền XEM của cha.
 * Điền CAP_BAO_MAT còn trống. Trả về số dòng quyền đã thêm.
 */
function authSyncPermissions_(ss) {
  var sheet = ensureAuthSheet_(ss, 'PHAN_QUYEN'), roleSheet = ensureAuthSheet_(ss, 'VAI_TRO'), meta = headers_(sheet), roleMeta = headers_(roleSheet);
  var roles = readSheet_(ss, 'VAI_TRO').rows, existing = readSheet_(ss, 'PHAN_QUYEN').rows, have = {}, rows = [], newModules = {}, store = PropertiesService.getScriptProperties();
  if (!store.getProperty('PHI_LONG_PERM_V2')) {
    // Một lần: Quản lý không còn mặc định thấy menu Hệ thống.
    existing.forEach(function (row) {
      if (key_(row.MA_VAI_TRO) !== 'role-manager' || key_(row.MA_CHUC_NANG) !== 'he_thong') return;
      SYSTEM_PERMISSION_ACTIONS.forEach(function (action) { authWriteField_(sheet, meta, row.__row, action, 'Không', '@'); row[action] = 'Không'; });
    });
    store.setProperty('PHI_LONG_PERM_V2', '1');
  }
  existing.forEach(function (row) { have[key_(row.MA_VAI_TRO) + '|' + key_(row.MA_CHUC_NANG)] = row; });
  var modules = authModuleList_();
  roles.forEach(function (role) {
    var roleCode = String(role.MA_VAI_TRO || '').trim();
    if (!roleCode) return;
    if (String(role.CAP_BAO_MAT == null ? '' : role.CAP_BAO_MAT).trim() === '' && roleMeta.columns.CAP_BAO_MAT) authWriteField_(roleSheet, roleMeta, role.__row, 'CAP_BAO_MAT', AUTH_DEFAULT_LEVELS[roleCode.toUpperCase()] || 0, '@');
    modules.forEach(function (module) {
      var k = key_(roleCode) + '|' + key_(module.code);
      if (have[k]) return;
      var record = { ID_QUYEN: 'PERM_' + Utilities.getUuid(), MA_VAI_TRO: roleCode, MA_CHUC_NANG: module.code, TEN_CHUC_NANG: module.parent ? '↳ ' + module.name : module.name, GHI_CHU: '' };
      if (module.parent) {
        var parent = have[key_(roleCode) + '|' + key_(module.parent)];
        SYSTEM_PERMISSION_ACTIONS.forEach(function (action) { record[action] = action === 'XEM' ? (key_(roleCode) === 'role-admin' || (parent && authFlag_(parent.XEM)) ? 'Có' : 'Không') : ''; });
      } else {
        var flags = authSeedDefault_(roleCode, module.code);
        SYSTEM_PERMISSION_ACTIONS.forEach(function (action) { record[action] = flags[action] ? 'Có' : 'Không'; });
        newModules[module.name] = true;
      }
      have[k] = record;
      rows.push(meta.headers.map(function (header) { return header ? (record[header] == null ? '' : record[header]) : ''; }));
    });
  });
  if (rows.length) sheet.getRange(Math.max(2, sheet.getLastRow() + 1), 1, rows.length, meta.headers.length).setNumberFormat('@').setValues(rows);
  return { added: rows.length, modules: Object.keys(newModules) };
}

function ensureAuthData_(ss) {
  Object.keys(AUTH_SHEET_HEADERS).forEach(function (name) { ensureAuthSheet_(ss, name); });
  authSeedRoles_(ss);
  return authSyncPermissions_(ss);
}

/** Chạy một lần trong Apps Script để tạo danh mục quyền và tài khoản admin tạm thời. */
function setupLocalAuth() {
  requireEditorRun_();
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  ensureAuthData_(ss);
  var accounts = authAccountRows_(ss);
  if (accounts.length) return authOutput_({ success: true, created: false, hashed: authMigratePasswords_(ss), removedSessions: authPurgeSessions_(PropertiesService.getScriptProperties(), '', 0), message: 'Dữ liệu xác thực đã tồn tại; không tạo lại tài khoản. Nếu quên mật khẩu, chạy resetLocalAdminPassword().' });
  var temporaryPassword = authTemporaryPassword_(), sheet = ensureAuthSheet_(ss, 'NGUOI_DUNG');
  appendAuthRecord_(sheet, {
    ID_NGUOI_DUNG: 'USR_' + Utilities.getUuid(), TEN_DANG_NHAP: 'admin', TEN_HIEN_THI: 'Admin', EMAIL: '', MA_NHAN_VIEN: '',
    MA_VAI_TRO: 'ROLE-ADMIN', TRANG_THAI: 'Đang hoạt động', MAT_KHAU: authPasswordHash_(temporaryPassword),
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
  requireEditorRun_();
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  ensureAuthData_(ss);
  var found = authFindAccount_(ss, 'admin');
  if (!found) throw new Error('Chưa có tài khoản admin. Hãy chạy setupLocalAuth() trước.');
  var sheet = ensureAuthSheet_(ss, 'NGUOI_DUNG'), meta = headers_(sheet), now = new Date();
  var temporaryPassword = authTemporaryPassword_();
  authWriteField_(sheet, meta, found.rowNumber, 'MAT_KHAU', authPasswordHash_(temporaryPassword), '@');
  authWriteField_(sheet, meta, found.rowNumber, 'MAT_KHAU_CAP_NHAT_LUC', now, 'dd/MM/yyyy HH:mm:ss');
  authWriteField_(sheet, meta, found.rowNumber, 'BAT_DOI_MAT_KHAU', 'Có', '@');
  authWriteField_(sheet, meta, found.rowNumber, 'SO_LAN_SAI', 0, '@');
  authWriteField_(sheet, meta, found.rowNumber, 'KHOA_DEN', '', '@');
  authWriteField_(sheet, meta, found.rowNumber, 'NGAY_CAP_NHAT', now, 'dd/MM/yyyy HH:mm:ss');
  authWriteField_(sheet, meta, found.rowNumber, 'GHI_CHU', 'Đã reset mật khẩu; bắt buộc đổi mật khẩu sau khi đăng nhập.', '@');
  writeSystemLog_(ss, { username: 'Hệ thống', employeeCode: '' }, 'HE_THONG', 'DAT_LAI_MAT_KHAU', found.data.ID_NGUOI_DUNG || 'admin', null, null, 'Reset mật khẩu tài khoản admin thủ công.');
  authRevokeUserSessions_(found.data.TEN_DANG_NHAP || 'admin');
  authBumpVersion_();
  SpreadsheetApp.flush();
  return authOutput_({ success: true, reset: true, username: found.data.TEN_DANG_NHAP || 'admin', temporaryPassword: temporaryPassword, message: 'Đã reset mật khẩu admin. Đăng nhập bằng mật khẩu tạm và đổi mật khẩu ngay.' });
}

function getLocalAuthStatus() {
  requireEditorRun_();
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

/**
 * Tài khoản phải gắn một nhân viên có thật, chưa nghỉ việc.
 * Một nhân viên được có nhiều tài khoản (mỗi tài khoản một vai trò để chia việc), nhưng không trùng vai trò.
 */
function systemCheckEmployeeLink_(ss, employee, employeeCode, exceptId, roleCode) {
  if (!employee) throw new Error('Mã nhân viên ' + employeeCode + ' không có trong DM_NHAN_VIEN.');
  if (plain_(employee.TRANG_THAI) === 'nghi viec') throw new Error('Nhân viên ' + employeeCode + ' đã nghỉ việc, không tạo tài khoản được.');
  var same = authAccountRows_(ss).find(function (item) { return key_(item.data.MA_NHAN_VIEN) === key_(employeeCode) && key_(item.data.MA_VAI_TRO) === key_(roleCode) && key_(item.data.ID_NGUOI_DUNG) !== key_(exceptId); });
  if (same) throw new Error('Nhân viên ' + employeeCode + ' đã có tài khoản "' + (same.data.TEN_DANG_NHAP || '') + '" với vai trò ' + authRoleName_(ss, roleCode) + '. Hãy chọn vai trò khác.');
}

function systemStatus_(value) {
  var status = String(value || 'Đang hoạt động').trim();
  if (['Đang hoạt động', 'Tạm khóa', 'Ngừng hoạt động'].indexOf(status) === -1) {
    throw new Error('Trạng thái tài khoản không hợp lệ.');
  }
  return status;
}

/** Kiểm tra thật: sheet khai báo có tồn tại không, sheet lạ chưa khai báo, dung lượng phiên đăng nhập. */
function systemSheetHealth_(ss) {
  var result = [], known = {};
  DATA_SHEETS.concat(SYSTEM_SHEET_NAMES, ['NHAT_KY_LUU_TRU']).forEach(function (name) {
    if (known[name]) return;
    known[name] = true;
    var sheet = ss.getSheetByName(name);
    if (!sheet && name === 'NHAT_KY_LUU_TRU') return;
    result.push({ name: name, group: SYSTEM_SHEET_NAMES.indexOf(name) !== -1 ? 'Hệ thống' : 'Dữ liệu', rows: sheet ? Math.max(0, sheet.getLastRow() - 1) : 0, status: sheet ? 'Sẵn sàng' : 'Thiếu' });
  });
  ss.getSheets().forEach(function (sheet) {
    var name = sheet.getName();
    if (!known[name]) result.push({ name: name, group: 'Khác', rows: Math.max(0, sheet.getLastRow() - 1), status: 'Chưa khai báo' });
  });
  var props = PropertiesService.getScriptProperties().getProperties(), count = 0, bytes = 0;
  Object.keys(props).forEach(function (key) { bytes += key.length + String(props[key]).length; if (key.indexOf(AUTH_SESSION_PREFIX) === 0) count++; });
  result.push({ name: 'Phiên đăng nhập (Script Properties)', group: 'Hệ thống', rows: count, status: bytes > 400000 ? 'Gần đầy' : 'Sẵn sàng', note: Math.round(bytes / 1024) + ' / 500 KB' });
  var handlers = {};
  try { ScriptApp.getProjectTriggers().forEach(function (trigger) { handlers[trigger.getHandlerFunction()] = true; }); } catch (error) {}
  [['remindFormExpiry', 'Lịch nhắc hạn biểu mẫu', 'setupFormReminderTrigger'], ['archiveSystemLogs', 'Lịch lưu trữ nhật ký hằng tháng', 'setupSystemLogArchiveTrigger']].forEach(function (item) {
    result.push({ name: item[1], group: 'Lịch chạy', rows: handlers[item[0]] ? 1 : 0, status: handlers[item[0]] ? 'Sẵn sàng' : 'Chưa cài', note: handlers[item[0]] ? '' : 'Chạy ' + item[2] + '() trong Apps Script' });
  });
  return result;
}

/** Dữ liệu cho trang Hệ thống; tuyệt đối không trả MAT_KHAU về trình duyệt. */
/** Đọc nhật ký từ cuối sheet lên (mới nhất trước), dừng khi đủ limit hoặc qua mốc from. */
function systemReadLogs_(ss, name, limit, from, to) {
  var sheet = ss.getSheetByName(name), result = { rows: [], total: 0, truncated: false };
  if (!sheet || sheet.getLastRow() < 2) return result;
  var meta = headers_(sheet), end = sheet.getLastRow(), stop = false;
  result.total = end - 1;
  while (end >= 2 && !stop && result.rows.length < limit) {
    var start = Math.max(2, end - 999), values = sheet.getRange(start, 1, end - start + 1, meta.headers.length).getDisplayValues();
    for (var i = values.length - 1; i >= 0; i--) {
      if (!values[i].some(function (value) { return String(value || '').trim() !== ''; })) continue;
      var row = objectFromRow_(meta, values[i]), time = authDate_(row.THOI_GIAN), stamp = time ? time.getTime() : 0;
      if (to && stamp && stamp > to) continue;
      if (from && stamp && stamp < from) { stop = true; break; }
      if (result.rows.length >= limit) { result.truncated = true; stop = true; break; }
      result.rows.push(row);
    }
    end = start - 1;
  }
  if (!stop && end >= 2) result.truncated = true;
  if (result.rows.length >= limit && end >= 2) result.truncated = true;
  return result;
}

function systemDateInput_(value, endOfDay) {
  var text = String(value || '').trim(), match = text.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return 0;
  return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]), endOfDay ? 23 : 0, endOfDay ? 59 : 0, endOfDay ? 59 : 0).getTime();
}

function getSystemData(input) {
  var options = input && typeof input === 'object' ? input : { _sessionToken: input };
  var auth = requireAuth_(options._sessionToken), ss = SpreadsheetApp.openById(SPREADSHEET_ID), snapshot = authSnapshot_(ss);
  if (key_(auth.roleCode) !== 'role-admin' && !authCan_(ss, auth.roleCode, 'HE_THONG', 'XEM', snapshot)) {
    throw new Error('Tài khoản không có quyền XEM tại chức năng này.');
  }
  var permissionSync = { added: 0, modules: [] }, resignedLocked = 0;
  if (authIsAdmin_(auth)) {
    var adminLock = LockService.getScriptLock();
    if (adminLock.tryLock(10000)) {
      try {
        if (snapshot.accounts.some(function (row) { return row.MAT_KHAU && !authIsHashed_(row.MAT_KHAU); })) authMigratePasswords_(ss);
        permissionSync = ensureAuthData_(ss);
        resignedLocked = authLockResignedAccounts_(ss, auth, '');
        if (permissionSync.added) { SpreadsheetApp.flush(); authBumpVersion_(); }
        if (permissionSync.added || resignedLocked) snapshot = authSnapshot_(ss);
      } finally { adminLock.releaseLock(); }
    }
  }
  var rawAccounts = snapshot.accounts;
  var accounts = rawAccounts.map(function (row) { return systemSafeAccount_(ss, row, snapshot); });
  var roles = snapshot.roles;
  var order = {};
  authModuleList_().forEach(function (module, index) { order[key_(module.code)] = index; });
  var permissions = snapshot.permissions.slice().sort(function (a, b) {
    var ra = key_(a.MA_VAI_TRO) === 'role-admin' ? 0 : 1, rb = key_(b.MA_VAI_TRO) === 'role-admin' ? 0 : 1;
    if (ra !== rb) return ra - rb;
    if (key_(a.MA_VAI_TRO) !== key_(b.MA_VAI_TRO)) return key_(a.MA_VAI_TRO) < key_(b.MA_VAI_TRO) ? -1 : 1;
    var oa = order[key_(a.MA_CHUC_NANG)], ob = order[key_(b.MA_CHUC_NANG)];
    return (oa == null ? 9999 : oa) - (ob == null ? 9999 : ob);
  }).map(function (row) { var copy = Object.assign({}, row); copy.LA_MUC_CON = String(row.MA_CHUC_NANG || '').indexOf('.') !== -1; return copy; });
  var logFrom = systemDateInput_(options.logFrom, false), logTo = systemDateInput_(options.logTo, true), logLimit = Math.max(50, Math.min(2000, Number(options.logLimit) || SYSTEM_LOG_LIMIT));
  var loginRead = systemReadLogs_(ss, 'NHAT_KY_DANG_NHAP', logLimit, logFrom, logTo), systemRead = systemReadLogs_(ss, 'NHAT_KY_HE_THONG', logLimit, logFrom, logTo);
  var loginLogs = loginRead.rows, systemLogs = systemRead.rows;
  return {
    success: true,
    accounts: { headers: ['ID_NGUOI_DUNG', 'TEN_DANG_NHAP', 'TEN_HIEN_THI', 'EMAIL', 'MA_NHAN_VIEN', 'MA_VAI_TRO', 'TEN_VAI_TRO', 'TRANG_THAI', 'BAT_DOI_MAT_KHAU', 'SO_LAN_SAI', 'KHOA_DEN', 'LAN_DANG_NHAP_CUOI', 'NGAY_CAP_NHAT', 'GHI_CHU'], rows: accounts },
    roles: { headers: ['MA_VAI_TRO', 'TEN_VAI_TRO', 'TRANG_THAI', 'GHI_CHU', 'CAP_BAO_MAT'], rows: roles },
    permissionSync: permissionSync,
    permissions: { headers: AUTH_SHEET_HEADERS.PHAN_QUYEN.slice(), rows: permissions },
    loginLogs: { headers: AUTH_SHEET_HEADERS.NHAT_KY_DANG_NHAP.slice(), rows: loginLogs },
    systemLogs: { headers: AUTH_SHEET_HEADERS.NHAT_KY_HE_THONG.slice(), rows: systemLogs },
    sheets: systemSheetHealth_(ss),
    summary: {
      accounts: accounts.length,
      activeAccounts: accounts.filter(function (row) { return authActive_(row.TRANG_THAI); }).length,
      roles: roles.length,
      permissions: permissions.length,
      loginLogs: loginRead.total,
      systemLogs: systemRead.total,
      logShown: loginLogs.length + systemLogs.length,
      logTruncated: loginRead.truncated || systemRead.truncated,
      logLimit: logLimit,
      logKeepDays: SYSTEM_LOG_KEEP_DAYS,
      resignedLocked: resignedLocked
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
  if (!employeeCode) throw new Error('Vui lòng chọn nhân viên cho tài khoản (lấy từ DM_NHAN_VIEN).');
  if (password && password.length < AUTH_MIN_PASSWORD_LENGTH) throw new Error('Mật khẩu phải có ít nhất ' + AUTH_MIN_PASSWORD_LENGTH + ' ký tự.');
  if (key_(roleCode) === 'role-admin' && !authIsAdmin_(auth)) throw new Error('Chỉ Quản trị hệ thống được tạo tài khoản có vai trò Quản trị.');
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID), lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try {
  ensureAuthData_(ss);
  if (authFindAccount_(ss, username)) throw new Error('Tên đăng nhập hoặc email đã tồn tại.');
  if (email && authFindAccount_(ss, email)) throw new Error('Tên đăng nhập hoặc email đã tồn tại.');
  if (!systemRole_(ss, roleCode)) throw new Error('Vai trò đã chọn không tồn tại.');
  var employee = masterRowByCode_(ss, 'DM_NHAN_VIEN', 'MA_NHAN_VIEN', employeeCode);
  systemCheckEmployeeLink_(ss, employee, employeeCode, '', roleCode);
  // Tên hiển thị và email để trống thì lấy từ hồ sơ nhân viên.
  if (!displayName) displayName = String(employee.HO_VA_TEN || '').trim();
  if (!email && /^[^@\s,]+@[^@\s,]+\.[A-Za-z.]{2,}$/.test(String(employee.EMAIL || '').trim()) && !authFindAccount_(ss, String(employee.EMAIL).trim())) email = String(employee.EMAIL).trim();
  if (!displayName) throw new Error('Vui lòng nhập tên nhân viên hiển thị.');
  var generatedPassword = !password, temporaryPassword = generatedPassword ? authTemporaryPassword_() : '';
  var sheet = ensureAuthSheet_(ss, 'NGUOI_DUNG'), now = new Date();
  var record = {
    ID_NGUOI_DUNG: 'USR_' + Utilities.getUuid(), TEN_DANG_NHAP: username, TEN_HIEN_THI: displayName, EMAIL: email,
    MA_NHAN_VIEN: employeeCode, MA_VAI_TRO: roleCode, TRANG_THAI: systemStatus_(input.TRANG_THAI || 'Đang hoạt động'),
    MAT_KHAU: authPasswordHash_(password || temporaryPassword), MAT_KHAU_CAP_NHAT_LUC: now, BAT_DOI_MAT_KHAU: 'Có', SO_LAN_SAI: 0,
    KHOA_DEN: '', LAN_DANG_NHAP_CUOI: '', NGAY_CAP_NHAT: now, GHI_CHU: generatedPassword ? 'Tài khoản tạo mới; dùng mật khẩu tạm và đổi sau lần đăng nhập đầu tiên.' : ''
  };
  appendAuthRecord_(sheet, record);
  writeSystemLog_(ss, auth, 'HE_THONG', 'THEM', record.ID_NGUOI_DUNG, null, systemSafeAccount_(ss, record), 'Tạo tài khoản hệ thống.');
  SpreadsheetApp.flush();
  var result = { success: true, created: true, id: record.ID_NGUOI_DUNG, username: username, message: 'Đã tạo tài khoản.' };
  if (generatedPassword) result.temporaryPassword = temporaryPassword;
  // Không ghi mật khẩu tạm vào Execution log; chỉ trả về cho người tạo.
  return result;
  } finally {
    lock.releaseLock();
  }
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
  var self = key_(found.data.TEN_DANG_NHAP) === key_(auth.username), targetAdmin = key_(found.data.MA_VAI_TRO) === 'role-admin';
  if (status && self && status !== 'Đang hoạt động') throw new Error('Không thể tự khóa tài khoản đang đăng nhập.');
  var roleCode = String(input.MA_VAI_TRO || '').trim();
  if (roleCode && !systemRole_(ss, roleCode)) throw new Error('Vai trò đã chọn không tồn tại.');
  var roleChanged = !!roleCode && key_(roleCode) !== key_(found.data.MA_VAI_TRO);
  if (!authIsAdmin_(auth) && (targetAdmin || key_(roleCode) === 'role-admin')) throw new Error('Chỉ Quản trị hệ thống được sửa tài khoản Quản trị hoặc gán vai trò Quản trị.');
  if (self && roleChanged) throw new Error('Không thể tự đổi vai trò của tài khoản đang đăng nhập.');
  if (targetAdmin && ((roleChanged && key_(roleCode) !== 'role-admin') || (status && status !== 'Đang hoạt động')) && !authActiveAdminCount_(ss, found.rowNumber)) throw new Error('Phải còn ít nhất một tài khoản Quản trị đang hoạt động.');
  var email = String(input.EMAIL || '').trim();
  if (email) {
    var emailFound = authFindAccount_(ss, email);
    if (emailFound && emailFound.rowNumber !== found.rowNumber) throw new Error('Email đã được dùng cho tài khoản khác.');
  }
  var employeeCode = String(input.MA_NHAN_VIEN || '').trim();
  var linkCode = employeeCode || String(found.data.MA_NHAN_VIEN || '').trim(), linkRole = roleCode || found.data.MA_VAI_TRO;
  var codeChanged = !!employeeCode && key_(employeeCode) !== key_(found.data.MA_NHAN_VIEN), linkEmployee = linkCode ? masterRowByCode_(ss, 'DM_NHAN_VIEN', 'MA_NHAN_VIEN', linkCode) : null;
  // Chỉ đổi vai trò của tài khoản gắn mã nhân viên cũ đã xóa khỏi danh bạ: không chặn.
  if (linkCode && (codeChanged || (roleChanged && linkEmployee))) systemCheckEmployeeLink_(ss, linkEmployee, linkCode, found.data.ID_NGUOI_DUNG, linkRole);
  var password = String(input.MAT_KHAU || ''), sheet = ensureAuthSheet_(ss, 'NGUOI_DUNG'), meta = headers_(sheet), before = systemSafeAccount_(ss, found.data), now = new Date();
  if (password && password.length < AUTH_MIN_PASSWORD_LENGTH) throw new Error('Mật khẩu mới phải có ít nhất ' + AUTH_MIN_PASSWORD_LENGTH + ' ký tự.');
  [['TEN_HIEN_THI', String(input.TEN_HIEN_THI || '').trim()], ['EMAIL', email], ['MA_NHAN_VIEN', employeeCode], ['MA_VAI_TRO', roleCode], ['TRANG_THAI', status]].forEach(function (pair) {
    if (pair[1] !== '') authWriteField_(sheet, meta, found.rowNumber, pair[0], pair[1], '@');
  });
  if (password) {
    authWriteField_(sheet, meta, found.rowNumber, 'MAT_KHAU', authPasswordHash_(password), '@');
    authWriteField_(sheet, meta, found.rowNumber, 'MAT_KHAU_CAP_NHAT_LUC', now, 'dd/MM/yyyy HH:mm:ss');
    authWriteField_(sheet, meta, found.rowNumber, 'BAT_DOI_MAT_KHAU', 'Có', '@');
  }
  authWriteField_(sheet, meta, found.rowNumber, 'NGAY_CAP_NHAT', now, 'dd/MM/yyyy HH:mm:ss');
  var after = systemSafeAccount_(ss, Object.assign({}, found.data, { TEN_HIEN_THI: String(input.TEN_HIEN_THI || found.data.TEN_HIEN_THI), EMAIL: email || found.data.EMAIL, MA_NHAN_VIEN: employeeCode || found.data.MA_NHAN_VIEN, MA_VAI_TRO: roleCode || found.data.MA_VAI_TRO, TRANG_THAI: status || found.data.TRANG_THAI }));
  writeSystemLog_(ss, auth, 'HE_THONG', 'SUA', id, before, after, password ? 'Cập nhật tài khoản và đặt mật khẩu mới.' : 'Cập nhật thông tin tài khoản.');
  SpreadsheetApp.flush();
  if (!self && (password || (status && status !== 'Đang hoạt động'))) authRevokeUserSessions_(found.data.TEN_DANG_NHAP);
  authBumpVersion_();
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
  if (key_(found.data.MA_VAI_TRO) === 'role-admin' && !authIsAdmin_(auth)) throw new Error('Chỉ Quản trị hệ thống được reset mật khẩu tài khoản Quản trị.');
  var sheet = ensureAuthSheet_(ss, 'NGUOI_DUNG'), meta = headers_(sheet), now = new Date(), temporaryPassword = authTemporaryPassword_();
  authWriteField_(sheet, meta, found.rowNumber, 'MAT_KHAU', authPasswordHash_(temporaryPassword), '@');
  authWriteField_(sheet, meta, found.rowNumber, 'MAT_KHAU_CAP_NHAT_LUC', now, 'dd/MM/yyyy HH:mm:ss');
  authWriteField_(sheet, meta, found.rowNumber, 'BAT_DOI_MAT_KHAU', 'Có', '@');
  authWriteField_(sheet, meta, found.rowNumber, 'SO_LAN_SAI', 0, '@');
  authWriteField_(sheet, meta, found.rowNumber, 'KHOA_DEN', '', '@');
  authWriteField_(sheet, meta, found.rowNumber, 'NGAY_CAP_NHAT', now, 'dd/MM/yyyy HH:mm:ss');
  authWriteField_(sheet, meta, found.rowNumber, 'GHI_CHU', 'Đã reset mật khẩu; bắt buộc đổi sau lần đăng nhập tiếp theo.', '@');
  writeSystemLog_(ss, auth, 'HE_THONG', 'DAT_LAI_MAT_KHAU', id, null, null, 'Reset mật khẩu tài khoản.');
  SpreadsheetApp.flush();
  if (key_(found.data.TEN_DANG_NHAP) !== key_(auth.username)) authRevokeUserSessions_(found.data.TEN_DANG_NHAP);
  authBumpVersion_();
  return { success: true, reset: true, username: found.data.TEN_DANG_NHAP || '', temporaryPassword: temporaryPassword, message: 'Đã reset mật khẩu. Đăng nhập bằng mật khẩu tạm và đổi ngay.' };
}

function saveSystemPermissions(input) {
  input = input || {};
  var auth = requirePermission_(input._sessionToken, 'HE_THONG', 'SUA'), items = Array.isArray(input.items) ? input.items : [];
  if (!authIsAdmin_(auth)) throw new Error('Chỉ Quản trị hệ thống được thay đổi phân quyền.');
  if (!items.length) throw new Error('Chưa có quyền nào để lưu.');
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  ensureAuthData_(ss);
  var sheet = ensureAuthSheet_(ss, 'PHAN_QUYEN'), meta = headers_(sheet), lastRow = sheet.getLastRow();
  var values = lastRow > 1 ? sheet.getRange(2, 1, lastRow - 1, meta.headers.length).getDisplayValues() : [], updated = 0;
  items.forEach(function (item) {
    var roleCode = String(item.MA_VAI_TRO || '').trim(), moduleCode = String(item.MA_CHUC_NANG || '').trim();
    if (!roleCode || !moduleCode || key_(roleCode) === 'role-admin') return;
    var index = values.findIndex(function (row) { return key_(row[meta.columns.MA_VAI_TRO - 1]) === key_(roleCode) && key_(row[meta.columns.MA_CHUC_NANG - 1]) === key_(moduleCode); });
    if (index === -1) return;
    var rowNumber = index + 2, child = moduleCode.indexOf('.') !== -1;
    SYSTEM_PERMISSION_ACTIONS.forEach(function (action) {
      if (!Object.prototype.hasOwnProperty.call(item, action) || (child && action !== 'XEM')) return;
      authWriteField_(sheet, meta, rowNumber, action, authFlag_(item[action]) ? 'Có' : 'Không', '@');
    });
    updated++;
  });
  writeSystemLog_(ss, auth, 'HE_THONG', 'SUA', 'PHAN_QUYEN', null, { rows: updated }, 'Cập nhật ma trận phân quyền.');
  SpreadsheetApp.flush();
  authBumpVersion_();
  return { success: true, updated: updated };
}

/** Chuyển nhật ký cũ hơn SYSTEM_LOG_KEEP_DAYS ngày (khối dòng đầu sheet) sang NHAT_KY_LUU_TRU. */
function systemArchiveLogs_(ss) {
  var cutoff = Date.now() - SYSTEM_LOG_KEEP_DAYS * 86400000, archive = ss.getSheetByName('NHAT_KY_LUU_TRU'), moved = {};
  if (!archive) archive = ss.insertSheet('NHAT_KY_LUU_TRU');
  ensureColumns_(archive, SYSTEM_LOG_ARCHIVE_HEADERS);
  archive.setFrozenRows(1);
  var archiveMeta = headers_(archive);
  [['NHAT_KY_DANG_NHAP', 'Đăng nhập'], ['NHAT_KY_HE_THONG', 'Hệ thống']].forEach(function (pair) {
    var sheet = ss.getSheetByName(pair[0]);
    moved[pair[0]] = 0;
    if (!sheet || sheet.getLastRow() < 2) return;
    var meta = headers_(sheet), values = sheet.getRange(2, 1, sheet.getLastRow() - 1, meta.headers.length).getValues(), count = 0;
    // Nhật ký ghi theo thời gian: chỉ chuyển khối liên tục ở đầu sheet để không xáo trộn dòng mới.
    while (count < values.length) {
      var time = values[count][meta.columns.THOI_GIAN - 1], date = time instanceof Date ? time : authDate_(time);
      if (!date || date.getTime() >= cutoff) break;
      count++;
    }
    if (!count) return;
    var rows = values.slice(0, count).map(function (row) {
      var item = objectFromRow_(meta, row);
      item.NGUON = pair[1];
      return archiveMeta.headers.map(function (header) { return header ? (item[header] == null ? '' : item[header]) : ''; });
    });
    archive.getRange(archive.getLastRow() + 1, 1, rows.length, archiveMeta.headers.length).setValues(rows);
    sheet.deleteRows(2, count);
    moved[pair[0]] = count;
  });
  SpreadsheetApp.flush();
  return moved;
}

/** Chạy theo lịch hằng tháng (setupSystemLogArchiveTrigger) hoặc chạy tay trong trình soạn thảo. */
function archiveSystemLogs(event) {
  requireEditorOrTrigger_(event);
  var lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try { return { success: true, moved: systemArchiveLogs_(SpreadsheetApp.openById(SPREADSHEET_ID)) }; } finally { lock.releaseLock(); }
}

/** Nút "Lưu trữ nhật ký cũ" trên trang Hệ thống (chỉ Quản trị). */
function archiveSystemLogsNow(input) {
  input = input || {};
  var auth = requirePermission_(input._sessionToken, 'HE_THONG', 'SUA');
  if (!authIsAdmin_(auth)) throw new Error('Chỉ Quản trị hệ thống được lưu trữ nhật ký.');
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID), lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    var moved = systemArchiveLogs_(ss);
    writeSystemLog_(ss, auth, 'HE_THONG', 'LUU_TRU', 'NHAT_KY', null, moved, 'Lưu trữ nhật ký cũ hơn ' + SYSTEM_LOG_KEEP_DAYS + ' ngày.');
    return { success: true, moved: moved, keepDays: SYSTEM_LOG_KEEP_DAYS };
  } finally { lock.releaseLock(); }
}

/** Chạy một lần: lưu trữ nhật ký tự động ngày 1 hằng tháng lúc 2 giờ sáng. */
function setupSystemLogArchiveTrigger() {
  requireEditorRun_();
  ScriptApp.getProjectTriggers().forEach(function (trigger) { if (trigger.getHandlerFunction() === 'archiveSystemLogs') ScriptApp.deleteTrigger(trigger); });
  ScriptApp.newTrigger('archiveSystemLogs').timeBased().onMonthDay(1).atHour(2).create();
  return { success: true, message: 'Đã cài lịch lưu trữ nhật ký ngày 1 hằng tháng.' };
}

/**
 * Khóa tài khoản gắn với nhân viên đã "Nghỉ việc" (onlyCode: chỉ xét một mã nhân viên).
 * Không khóa nếu đó là Quản trị đang hoạt động cuối cùng. Trả về số tài khoản đã khóa.
 */
function authLockResignedAccounts_(ss, auth, onlyCode) {
  var resigned = {}, locked = 0;
  // Đã biết đúng người vừa nghỉ thì không cần đọc lại cả danh bạ.
  if (onlyCode) resigned[key_(onlyCode)] = true;
  else readSheet_(ss, 'DM_NHAN_VIEN').rows.forEach(function (row) { if (plain_(row.TRANG_THAI) === 'nghi viec' && row.MA_NHAN_VIEN) resigned[key_(row.MA_NHAN_VIEN)] = true; });
  var sheet = ss.getSheetByName('NGUOI_DUNG');
  if (!sheet) return 0;
  var meta = headers_(sheet), now = new Date();
  authAccountRows_(ss).forEach(function (item) {
    var code = key_(item.data.MA_NHAN_VIEN);
    if (!code || !resigned[code] || (onlyCode && code !== key_(onlyCode)) || !authActive_(item.data.TRANG_THAI)) return;
    if (key_(item.data.MA_VAI_TRO) === 'role-admin' && !authActiveAdminCount_(ss, item.rowNumber)) return;
    authWriteField_(sheet, meta, item.rowNumber, 'TRANG_THAI', 'Ngừng hoạt động', '@');
    authWriteField_(sheet, meta, item.rowNumber, 'NGAY_CAP_NHAT', now, 'dd/MM/yyyy HH:mm:ss');
    authWriteField_(sheet, meta, item.rowNumber, 'GHI_CHU', 'Tự khóa: nhân viên ' + item.data.MA_NHAN_VIEN + ' đã nghỉ việc.', '@');
    writeSystemLog_(ss, auth, 'HE_THONG', 'KHOA_TU_DONG', item.data.ID_NGUOI_DUNG || item.data.TEN_DANG_NHAP, null, { TRANG_THAI: 'Ngừng hoạt động' }, 'Tự khóa tài khoản vì nhân viên đã nghỉ việc.');
    authRevokeUserSessions_(item.data.TEN_DANG_NHAP);
    locked++;
  });
  if (locked) { SpreadsheetApp.flush(); authBumpVersion_(); }
  return locked;
}

/** Thêm/sửa vai trò; vai trò mới được tự tạo dòng quyền (mặc định Không). Chỉ Quản trị. */
function saveSystemRole(input) {
  input = input || {};
  var auth = requirePermission_(input._sessionToken, 'HE_THONG', 'SUA');
  if (!authIsAdmin_(auth)) throw new Error('Chỉ Quản trị hệ thống được thêm hoặc sửa vai trò.');
  var name = String(input.TEN_VAI_TRO || '').trim(), level = Number(input.CAP_BAO_MAT), status = String(input.TRANG_THAI || 'Đang hoạt động').trim(), note = String(input.GHI_CHU || '').trim();
  if (!name) throw new Error('Vui lòng nhập tên vai trò.');
  if ([0, 1, 2].indexOf(level) === -1) throw new Error('Mức bảo mật không hợp lệ.');
  if (['Đang hoạt động', 'Ngừng hoạt động'].indexOf(status) === -1) throw new Error('Trạng thái vai trò không hợp lệ.');
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID), lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try {
    ensureAuthData_(ss);
    var sheet = ensureAuthSheet_(ss, 'VAI_TRO'), meta = headers_(sheet), roles = readSheet_(ss, 'VAI_TRO').rows, isNew = !!input.isNew;
    var code = String(input.MA_VAI_TRO || '').trim().toUpperCase();
    if (isNew) {
      if (!code) code = 'ROLE-' + plain_(name).toUpperCase().replace(/[^A-Z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 30);
      if (!/^ROLE-[A-Z0-9-]{2,30}$/.test(code)) throw new Error('Mã vai trò phải có dạng ROLE-XXX (chữ không dấu, số, gạch ngang).');
      if (roles.some(function (row) { return key_(row.MA_VAI_TRO) === key_(code); })) throw new Error('Mã vai trò đã tồn tại.');
      appendAuthRecord_(sheet, { MA_VAI_TRO: code, TEN_VAI_TRO: name, TRANG_THAI: status, GHI_CHU: note, CAP_BAO_MAT: level }, meta);
    } else {
      var row = roles.find(function (item) { return key_(item.MA_VAI_TRO) === key_(code); });
      if (!row) throw new Error('Không tìm thấy vai trò.');
      if (key_(code) === 'role-admin' && (status !== 'Đang hoạt động' || level !== 2)) throw new Error('Không thể ngừng hoặc hạ mức bảo mật của vai trò Quản trị hệ thống.');
      [['TEN_VAI_TRO', name], ['TRANG_THAI', status], ['CAP_BAO_MAT', level], ['GHI_CHU', note]].forEach(function (pair) { authWriteField_(sheet, meta, row.__row, pair[0], pair[1], '@'); });
    }
    SpreadsheetApp.flush();
    var sync = authSyncPermissions_(ss), users = authAccountRows_(ss).filter(function (item) { return key_(item.data.MA_VAI_TRO) === key_(code) && authActive_(item.data.TRANG_THAI); }).length;
    writeSystemLog_(ss, auth, 'HE_THONG', isNew ? 'THEM' : 'SUA', code, null, { TEN_VAI_TRO: name, TRANG_THAI: status, CAP_BAO_MAT: level }, isNew ? 'Thêm vai trò.' : 'Sửa vai trò.');
    SpreadsheetApp.flush();
    authBumpVersion_();
    return { success: true, code: code, created: isNew, addedPermissions: sync.added, activeUsers: users };
  } finally {
    lock.releaseLock();
  }
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
    var valid = authPasswordMatches_(account.MAT_KHAU, password), failed = Number(account.SO_LAN_SAI || 0);
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
    if (!authIsHashed_(account.MAT_KHAU)) authWriteField_(sheet, meta, found.rowNumber, 'MAT_KHAU', authPasswordHash_(password), '@');
    var store = PropertiesService.getScriptProperties(), user = authContext_(ss, account, authData), token = Utilities.getUuid() + Utilities.getUuid().replace(/-/g, '');
    var session = { user: user, createdAt: now.toISOString(), lastActivityAt: now.toISOString(), checkedAt: now.toISOString(), authVersion: store.getProperty(AUTH_VERSION_KEY) || '0' };
    // Phiên hết hạn sau AUTH_SESSION_IDLE_HOURS giờ không thao tác hoặc AUTH_SESSION_MAX_DAYS ngày;
    // dọn phiên cũ trước khi tạo phiên mới để Script Properties không bị đầy.
    authPurgeSessions_(store, username, 1);
    store.setProperty(authSessionKey_(token), JSON.stringify(session));
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
  if (!authPasswordMatches_(found.data.MAT_KHAU, current)) throw new Error('Mật khẩu hiện tại không đúng.');
  var sheet = ensureAuthSheet_(ss, 'NGUOI_DUNG'), meta = headers_(sheet);
  authWriteField_(sheet, meta, found.rowNumber, 'MAT_KHAU', authPasswordHash_(next), '@');
  authWriteField_(sheet, meta, found.rowNumber, 'MAT_KHAU_CAP_NHAT_LUC', new Date(), 'dd/MM/yyyy HH:mm:ss');
  authWriteField_(sheet, meta, found.rowNumber, 'BAT_DOI_MAT_KHAU', 'Không', '@');
  authWriteField_(sheet, meta, found.rowNumber, 'NGAY_CAP_NHAT', new Date(), 'dd/MM/yyyy HH:mm:ss');
  writeSystemLog_(ss, user, 'HE_THONG', 'SUA', found.data.ID_NGUOI_DUNG || user.username, null, null, 'Đổi mật khẩu local.');
  SpreadsheetApp.flush();
  // Đổi mật khẩu: đăng xuất các thiết bị khác, phiên hiện tại đọc lại tài khoản ở lần gọi kế tiếp.
  authRevokeUserSessions_(user.username, input._sessionToken);
  var store = PropertiesService.getScriptProperties(), key = authSessionKey_(input._sessionToken), raw = store.getProperty(key);
  if (raw) { try { var session = JSON.parse(raw); session.checkedAt = ''; store.setProperty(key, JSON.stringify(session)); } catch (error) {} }
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
  var data = readMasterCached_(ss, sheetName);
  if (data.missing) throw new Error('Không tìm thấy danh mục ' + sheetName + '.');
  if (!data.meta || !data.meta.columns[codeHeader]) throw new Error(sheetName + ' chưa có cột ' + codeHeader + '.');
  var found = data.rows.some(function (row) { return key_(row[codeHeader]) === key_(code); });
  if (!found) throw new Error(label + ' đã chọn không tồn tại trong ' + sheetName + '.');
  return code;
}

function masterRowByCode_(ss, sheetName, codeHeader, value) {
  var wanted = key_(value);
  return readMasterCached_(ss, sheetName).rows.find(function (row) {
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
  var sheet = ss.getSheetByName('LICH_SU_CONG_VIEC'), created = !sheet;
  if (created) sheet = ss.insertSheet('LICH_SU_CONG_VIEC');
  ensureColumns_(sheet, WORK_HISTORY_HEADERS);
  if (created) sheet.setFrozenRows(1);
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
    PHIEU_BIEU_MAU: FORM_REQUEST_HEADERS,
    DM_DIEU_KHOAN: CONTRACT_CLAUSE_HEADERS,
    DM_CONG_TY: COMPANY_INFO_HEADERS
  };
  if (!definitions[name]) throw new Error('Không xác định được bảng biểu mẫu: ' + name + '.');
  var sheet = ss.getSheetByName(name), created = !sheet;
  if (created) sheet = ss.insertSheet(name);
  ensureColumns_(sheet, definitions[name]);
  if (created) sheet.setFrozenRows(1);
  return sheet;
}

function formTemplateRecord_(seed) {
  var legal = formLegalProfile_(seed[0]);
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
  var sheet = ensureFormSheet_(ss, 'DM_BIEU_MAU'), meta = headers_(sheet), existing = readSheet_(ss, 'DM_BIEU_MAU').rows, added = 0, updated = 0, pending = [];
  var known = {};
  existing.forEach(function (row, index) { known[key_(row.ID_BIEU_MAU)] = index; if (row.MA_BIEU_MAU) known['ma:' + key_(row.MA_BIEU_MAU)] = index; });
  FORM_TEMPLATE_RETIRED.forEach(function (id) {
    var index = known[key_(id)];
    if (index === undefined || !meta.columns.TRANG_THAI || key_(existing[index].TRANG_THAI) === key_('Ngừng sử dụng')) return;
    sheet.getRange(index + 2, meta.columns.TRANG_THAI).setValue('Ngừng sử dụng');
    existing[index].TRANG_THAI = 'Ngừng sử dụng';
    updated++;
  });
  FORM_TEMPLATE_SEEDS.forEach(function (seed) {
    var existingIndex = known[key_(seed[0])] !== undefined ? known[key_(seed[0])] : known['ma:' + key_(seed[1])] !== undefined ? known['ma:' + key_(seed[1])] : -1;
    if (existingIndex !== -1) {
      var legal = formLegalProfile_(seed[0]), placeholders = { LOAI_MAU: 'Nội bộ doanh nghiệp', PHAM_VI_SU_DUNG: seed[4] };
      ['LOAI_MAU', 'PHAM_VI_SU_DUNG', 'CAN_CU_PHAP_LY', 'MAU_CHUAN', 'LINK_MAU_GOC'].forEach(function (field) {
        var current = String(existing[existingIndex][field] || '').trim();
        if (meta.columns[field] && legal[field] && current !== legal[field] && (!current || (FORM_TEMPLATE_BASES[seed[0]] && current === placeholders[field]))) {
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
    pending.push(meta.headers.map(function (header) { return header ? (formRecord[header] == null ? '' : formRecord[header]) : ''; }));
    known[key_(seed[0])] = existing.length;
    existing.push(formRecord);
    added++;
  });
  // Ghi một lần cho hàng trăm mẫu mới thay vì từng dòng.
  if (pending.length) sheet.getRange(Math.max(2, sheet.getLastRow() + 1), 1, pending.length, meta.headers.length).setValues(pending);
  if (added) {
    ['ID_BIEU_MAU', 'MA_BIEU_MAU'].forEach(function (field) {
      if (meta.columns[field]) sheet.getRange(2, meta.columns[field], Math.max(1, sheet.getLastRow() - 1), 1).setNumberFormat('@');
    });
  }
  return { sheet: sheet, added: added, updated: updated };
}

function ensureCompanyInfo_(ss) {
  var sheet = ensureFormSheet_(ss, 'DM_CONG_TY'), meta = headers_(sheet), known = {}, pending = [];
  readSheet_(ss, 'DM_CONG_TY').rows.forEach(function (row) { known[key_(row.KHOA)] = true; });
  var keyCol = meta.headers.indexOf('KHOA'), valueCol = meta.headers.indexOf('GIA_TRI');
  if (keyCol >= 0 && valueCol >= 0 && sheet.getLastRow() > 1) sheet.getRange(2, 1, sheet.getLastRow() - 1, meta.headers.length).getDisplayValues().forEach(function (values, index) {
    if (key_(values[keyCol]) === key_('DIA_CHI_NGAN') && String(values[valueCol]).trim() === '152-158 Hàm Nghi, P. Thanh Khê, TP. Đà Nẵng') sheet.getRange(index + 2, valueCol + 1).setValue('152-158 Hàm Nghi, TP. Đà Nẵng');
  });
  COMPANY_INFO_SEEDS.forEach(function (seed) {
    if (known[key_(seed[0])]) return;
    var record = { KHOA: seed[0], GIA_TRI: seed[1], MO_TA: seed[2] };
    pending.push(meta.headers.map(function (header) { return header ? (record[header] == null ? '' : record[header]) : ''; }));
  });
  if (pending.length) {
    var start = Math.max(2, sheet.getLastRow() + 1);
    sheet.getRange(start, 1, pending.length, meta.headers.length).setNumberFormat('@').setValues(pending);
  }
  return pending.length;
}

function ensureContractClauses_(ss) {
  var sheet = ensureFormSheet_(ss, 'DM_DIEU_KHOAN'), meta = headers_(sheet), known = {}, pending = [], now = new Date();
  readSheet_(ss, 'DM_DIEU_KHOAN').rows.forEach(function (row) { known[key_(row.ID_DIEU_KHOAN)] = true; });
  CONTRACT_CLAUSE_SEEDS.forEach(function (seed) {
    if (known[key_(seed[0])]) return;
    var record = { ID_DIEU_KHOAN: seed[0], MA_MAU: seed[1], LOAI: seed[2], THU_TU: seed[3], TIEU_DE: seed[4], NOI_DUNG: seed[5], TRANG_THAI: 'Đang sử dụng', NGAY_CAP_NHAT: now };
    pending.push(meta.headers.map(function (header) { return header ? (record[header] == null ? '' : record[header]) : ''; }));
  });
  if (pending.length) sheet.getRange(Math.max(2, sheet.getLastRow() + 1), 1, pending.length, meta.headers.length).setValues(pending);
  return pending.length;
}

/** Chạy một lần để tạo danh mục biểu mẫu dùng chung và bảng lưu phiếu. */
function setupFormCatalog() {
  requireEditorRun_();
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID), result = ensureDefaultFormTemplates_(ss), templateSheet = result.sheet;
  ensureContractClauses_(ss);
  ensureCompanyInfo_(ss);
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
  ensureFormSeeds_(ss, ['DM_BIEU_MAU']);
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
    NOI_DUNG: String(input.NOI_DUNG || '').trim().slice(0, 2000), TRANG_THAI: 'Nháp', NGUOI_TAO: auth.username || auth.email || 'Hệ thống',
    NGAY_TAO: now, NGUOI_DUYET: '', NGAY_DUYET: '', GHI_CHU: String(input.GHI_CHU || '').trim(), DU_LIEU_MAU_JSON: formDataJson
  };
  Object.keys(shared).forEach(function (field) { record[field] = shared[field]; });
  record.LICH_SU = JSON.stringify([formHistoryEntry_(auth, 'Tạo phiếu', 'Lưu nháp')]);
  var rowNumber = appendFormRecord_(sheet, meta, record);
  ['ID_PHIEU', 'ID_BIEU_MAU', 'MA_NHAN_VIEN'].forEach(function (field) { if (meta.columns[field]) sheet.getRange(rowNumber, meta.columns[field]).setNumberFormat('@'); });
  ['NGAY_LAP', 'NGAY_TAO'].forEach(function (field) { if (meta.columns[field]) sheet.getRange(rowNumber, meta.columns[field]).setNumberFormat('dd/MM/yyyy HH:mm'); });
  ['NGAY_HIEU_LUC', 'NGAY_HET_HAN'].forEach(function (field) { if (meta.columns[field] && record[field]) sheet.getRange(rowNumber, meta.columns[field]).setNumberFormat('dd/MM/yyyy'); });
  ['SO_VAN_BAN', 'PHONG_BAN'].forEach(function (field) { if (meta.columns[field]) sheet.getRange(rowNumber, meta.columns[field]).setNumberFormat('@'); });
  writeSystemLog_(ss, auth, 'BIEU_MAU', 'THEM', record.ID_PHIEU, null, formLogSlim_(record), 'Tạo phiếu biểu mẫu.');
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

/** Nhật ký hệ thống chỉ giữ thông tin quản lý; dữ liệu chi tiết đã nằm trong PHIEU_BIEU_MAU. */
function formLogSlim_(row) {
  if (!row) return row;
  var slim = {};
  Object.keys(row).forEach(function (field) { if (field !== 'DU_LIEU_MAU_JSON' && field !== 'LICH_SU') slim[field] = row[field]; });
  if (slim.NOI_DUNG) slim.NOI_DUNG = String(slim.NOI_DUNG).slice(0, 200);
  return slim;
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
/** Ảnh nhân viên dạng data URL để vẽ thiệp sinh nhật (tránh lỗi CORS của ảnh Drive). */
function getEmployeePhotoData(input) {
  input = input || {};
  requireAuth_(input._sessionToken);
  try {
    var id = driveFileId_(input.id);
    if (!id) return '';
    var file = DriveApp.getFileById(id), mimeType = String(file.getMimeType() || '');
    if (!/^image\//i.test(mimeType)) return '';
    var blob = file.getSize() > 1500000 ? file.getThumbnail() : file.getBlob();
    if (!blob) return '';
    return 'data:' + (blob.getContentType() || mimeType) + ';base64,' + Utilities.base64Encode(blob.getBytes());
  } catch (error) {
    return '';
  }
}

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
  writeSystemLog_(ss, auth, 'BIEU_MAU', rule.action, id, formLogSlim_(before), formLogSlim_(after), rule.label + (reason ? ': ' + reason : '') + '.');
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
  writeSystemLog_(ss, auth, 'BIEU_MAU', 'THEM', id, formLogSlim_(row), { LINK_PDF: file.getUrl() }, 'Lưu PDF phiếu biểu mẫu vào Google Drive.');
  return { success: true, url: file.getUrl(), name: file.getName() };
}

/** Chạy hằng ngày (cài bằng setupFormReminderTrigger): email nhắc phiếu sắp/đã hết hạn, mỗi phiếu nhắc 1 lần/ngày hết hạn. */
function remindFormExpiry(event) {
  requireEditorOrTrigger_(event);
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
  requireEditorRun_();
  ScriptApp.getProjectTriggers().forEach(function (trigger) { if (trigger.getHandlerFunction() === 'remindFormExpiry') ScriptApp.deleteTrigger(trigger); });
  ScriptApp.newTrigger('remindFormExpiry').timeBased().everyDays(1).atHour(8).create();
  return { success: true, message: 'Đã cài nhắc hạn biểu mẫu lúc 8 giờ sáng hằng ngày.' };
}

function setupAttendanceData() {
  requireEditorRun_();
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

/** Ghi nhiều dòng lịch sử bằng 1 lệnh ghi + 2 lệnh định dạng. */
function appendWorkHistoryRows_(sheet, meta, records) {
  if (!records.length) return;
  var rowNumber = Math.max(2, sheet.getLastRow() + 1), n = records.length;
  setFormats_(sheet, ['ID_LICH_SU', 'MA_NHAN_VIEN', 'SO_QUYET_DINH'].map(function (field) { return [rowNumber, meta.columns[field], n]; }), '@');
  setFormats_(sheet, ['NGAY_HIEU_LUC', 'NGAY_TAO'].map(function (field) { return [rowNumber, meta.columns[field], n]; }), 'dd/MM/yyyy HH:mm');
  sheet.getRange(rowNumber, 1, n, meta.headers.length).setValues(records.map(function (record) {
    return meta.headers.map(function (header) { return header ? (record[header] == null ? '' : record[header]) : ''; });
  }));
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
  appendWorkHistoryRows_(sheet, meta, [record]);
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
  requireEditorRun_();
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

/** Danh mục (DM_*) đọc một lần cho mỗi lần gọi máy chủ: một lần lưu hồ sơ trước đây đọc lại phòng ban/bộ phận/chức vụ 7–8 lần. */
var READ_CACHE_ = {};
/** Tăng khi sửa nội dung mẫu ngoài các mảng seed (vd: căn cứ pháp lý) để buộc bổ sung lại một lần. */
var SEED_REVISION = 'R73-1';
function readMasterCached_(ss, name) {
  if (!/^DM_/.test(name) || name === 'DM_NHAN_VIEN') return readSheet_(ss, name);
  if (!READ_CACHE_[name]) READ_CACHE_[name] = readSheet_(ss, name);
  return READ_CACHE_[name];
}

function columnLetter_(column) {
  var text = '';
  for (var n = column; n > 0; n = Math.floor((n - 1) / 26)) text = String.fromCharCode(65 + (n - 1) % 26) + text;
  return text;
}

/** Đặt định dạng cho nhiều ô/cột rời nhau bằng 1 lệnh. cells: [[row, column, rowCount?]]. */
function setFormats_(sheet, cells, format) {
  var list = cells.filter(function (cell) { return cell && cell[1]; }).map(function (cell) {
    var count = cell[2] || 1, letter = columnLetter_(cell[1]);
    return count > 1 ? letter + cell[0] + ':' + letter + (cell[0] + count - 1) : letter + cell[0];
  });
  if (list.length) sheet.getRangeList(list).setNumberFormat(format);
}

/** Chỉ chạy bổ sung dữ liệu mẫu khi mã nguồn đổi (theo dấu vân tay) hoặc sheet chưa có, không quét lại mỗi lần mở trang. */
function seedOnce_(ss, name, seeds, fn) {
  var store = PropertiesService.getScriptProperties(), key = 'SEED_' + name;
  var digest = Utilities.base64Encode(Utilities.computeDigest(Utilities.DigestAlgorithm.MD5, JSON.stringify(seeds)));
  if (store.getProperty(key) === digest && ss.getSheetByName(name)) return false;
  fn(ss);
  store.setProperty(key, digest);
  return true;
}

function ensureFormSeeds_(ss, names) {
  if (names.indexOf('DM_BIEU_MAU') !== -1 || names.indexOf('PHIEU_BIEU_MAU') !== -1) {
    seedOnce_(ss, 'DM_BIEU_MAU', [SEED_REVISION, FORM_TEMPLATE_SEEDS, FORM_TEMPLATE_RETIRED, FORM_TEMPLATE_MODULES, FORM_TEMPLATE_HEADERS], ensureDefaultFormTemplates_);
    seedOnce_(ss, 'PHIEU_BIEU_MAU', FORM_REQUEST_HEADERS, function (book) { ensureFormSheet_(book, 'PHIEU_BIEU_MAU'); });
  }
  if (names.indexOf('DM_DIEU_KHOAN') !== -1) seedOnce_(ss, 'DM_DIEU_KHOAN', [CONTRACT_CLAUSE_SEEDS, CONTRACT_CLAUSE_HEADERS], ensureContractClauses_);
  if (names.indexOf('DM_CONG_TY') !== -1) seedOnce_(ss, 'DM_CONG_TY', [COMPANY_INFO_SEEDS, COMPANY_INFO_HEADERS], ensureCompanyInfo_);
}

function readSheet_(ss, name) {
  var sheet = ss.getSheetByName(name);
  if (!sheet) return { headers: [], rows: [], missing: true };
  var values = sheet.getDataRange().getDisplayValues();
  if (!values.length) return { headers: [], rows: [], meta: { headers: [], columns: {} } };
  var meta = headersFromRow_(values[0]);
  if (values.length < 2) return { headers: meta.headers.filter(String), rows: [], meta: meta };
  var rows = [];
  values.slice(1).forEach(function (row, offset) {
    if (!row.some(function (value) { return String(value || '').trim() !== ''; })) return;
    var item = {};
    meta.headers.forEach(function (header, index) {
      if (header) item[header] = row[index] || '';
    });
    Object.defineProperty(item, '__row', { value: offset + 2, enumerable: false });
    rows.push(item);
  });
  return { headers: meta.headers.filter(String), rows: rows, meta: meta };
}

function authCanSheet_(auth, name) {
  if (authIsAdmin_(auth)) return true;
  var modules = AUTH_SHEET_MODULES[name], perms = auth && auth.permissions;
  if (!modules) return true;
  if (!perms) return false;
  var list = modules === '*' ? Object.keys(perms) : modules;
  return list.some(function (code) { return String(perms[code] || '').charAt(0) === '1'; });
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
  // Máy chủ lọc theo quyền XEM: ẩn menu thôi chưa đủ, sheet không được phép trả về rỗng.
  requested = requested.filter(function (name) {
    if (authCanSheet_(auth, name)) return true;
    data[name] = { headers: [], rows: [], denied: true };
    return false;
  });
  try {
    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    // Bổ sung mẫu mặc định (không phá dữ liệu cũ) – chỉ khi mã nguồn có mẫu mới, không quét lại mỗi lần mở trang.
    ensureFormSeeds_(ss, requested);
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
  var level = authLevel_(auth);
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
  requireEditorRun_();
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
  return stripEmployeeRow_(found, authLevel_(auth));
}

/**
 * Nhập danh sách nhân viên từ Excel (trình duyệt đã đọc file, đổi tên phòng ban/chức vụ sang mã).
 * Mỗi dòng đi qua writeEmployee_ như khi thêm/sửa tay: cùng kiểm quyền, kiểm dữ liệu, nhật ký.
 * Dòng có code = cập nhật nhân viên đó; không có code = thêm mới (mã tự cấp). Tối đa 25 dòng mỗi lần gọi.
 */
/** ===== Văn bản nhân sự: cấp số quyết định tăng dần theo năm, lưu PHIEU_BIEU_MAU, ghi ngược hồ sơ khi được chọn ===== */
const HR_DOC_TYPES = {
  raise: { id: 'FMV_QUYET_DINH_TANG_LUONG', name: 'Quyết định nâng lương', numbered: true },
  terminate: { id: 'FMV_QUYET_DINH_CHAM_DUT_HDLD', name: 'Quyết định chấm dứt hợp đồng lao động', numbered: true },
  unpaid: { id: 'FMV_QUYET_DINH_NGHI_KHONG_LUONG', name: 'Quyết định nghỉ không hưởng lương', numbered: true },
  sunday: { id: 'FMV_CAM_KET_LAM_CHU_NHAT', name: 'Cam kết làm việc ngày Chủ nhật', numbered: false }
};
const HR_DOC_SUFFIX = '/QĐ-PL';

function hrDocAuth_(token) {
  var user = requireAuth_(token);
  if (key_(user.roleCode) === 'role-admin') return user;
  if (authUserCan_(user, 'HO_SO', 'XUAT_FILE') || authUserCan_(user, 'NHAN_SU', 'XUAT_FILE')) return user;
  throw new Error('Tài khoản không có quyền in văn bản nhân sự.');
}

/** Số lớn nhất đã dùng trong năm (dạng 25/2026/QĐ-PL), tính trên PHIEU_BIEU_MAU. */
function hrDocLastNumber_(sheet, meta, year) {
  var column = meta.columns.SO_VAN_BAN, last = sheet.getLastRow(), max = 0;
  if (!column || last < 2) return 0;
  var pattern = new RegExp('^\\s*(\\d+)\\s*/\\s*' + year + '\\s*/\\s*QĐ-PL\\s*$', 'i');
  sheet.getRange(2, column, last - 1, 1).getDisplayValues().forEach(function (row) {
    var match = String(row[0] || '').match(pattern);
    if (match) max = Math.max(max, Number(match[1]));
  });
  return max;
}

/**
 * input: { kind, signDate (yyyy-mm-dd), effectiveDate, docs: [{ codes: [], names: '', payload: {...} }],
 *          writeBack: bool, salaries: [{ code, salary }], termination: { code, endDate, reason } }
 * Trả về số đã cấp cho từng văn bản (theo thứ tự docs) và kết quả ghi hồ sơ.
 */
function issueHrDocuments(input) {
  input = input || {};
  var auth = hrDocAuth_(input._sessionToken), type = HR_DOC_TYPES[input.kind];
  if (!type) throw new Error('Loại văn bản không hợp lệ.');
  var docs = Array.isArray(input.docs) ? input.docs.slice(0, 200) : [];
  if (!docs.length) throw new Error('Chưa có văn bản nào để in.');
  if (input.kind === 'raise' && authLevel_(auth) < 2) throw new Error('Quyết định nâng lương cần quyền xem lương (mức 2).');
  var signDate = parseAttendanceDate_(input.signDate, 'Ngày ký'), year = signDate.getFullYear();
  var effective = input.effectiveDate ? parseAttendanceDate_(input.effectiveDate, 'Ngày hiệu lực') : '';
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID), numbers = [], ids = [], now = new Date();
  var lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try {
    var sheet = ensureFormSheet_(ss, 'PHIEU_BIEU_MAU'), meta = headers_(sheet), next = type.numbered ? hrDocLastNumber_(sheet, meta, year) : 0;
    var records = docs.map(function (doc) {
      var number = type.numbered ? (++next) + '/' + year + HR_DOC_SUFFIX : '', codes = (doc.codes || []).map(function (code) { return String(code || '').trim(); }).filter(Boolean);
      var payload = JSON.stringify({ hrDoc: input.kind, number: number, signDate: input.signDate, payload: doc.payload || {} });
      if (payload.length > 45000) throw new Error('Nội dung văn bản quá dài để lưu.');
      numbers.push(number);
      return {
        ID_PHIEU: 'PH_' + Utilities.getUuid(), ID_BIEU_MAU: type.id, TEN_BIEU_MAU: type.name,
        MA_NHAN_VIEN: codes.length === 1 ? codes[0] : codes.slice(0, 20).join(', '), HO_VA_TEN: String(doc.names || '').slice(0, 300),
        NGAY_LAP: signDate, TIEU_DE: type.name + (doc.names ? ' – ' + String(doc.names).slice(0, 120) : ''), NOI_DUNG: '',
        TRANG_THAI: 'Đã in', NGUOI_TAO: auth.username || auth.email || 'Hệ thống', NGAY_TAO: now, NGUOI_DUYET: '', NGAY_DUYET: '',
        GHI_CHU: codes.length > 1 ? codes.length + ' nhân viên' : '', DU_LIEU_MAU_JSON: payload,
        SO_VAN_BAN: number, LOAI_VAN_BAN: type.numbered ? 'Quyết định' : 'Cam kết', NGAY_HIEU_LUC: effective || '',
        LICH_SU: JSON.stringify([formHistoryEntry_(auth, 'In văn bản', number || type.name)])
      };
    });
    // Ghi tất cả văn bản bằng 1 lệnh, định dạng theo khối cột.
    var start = Math.max(2, sheet.getLastRow() + 1), n = records.length, block = function (fields) { return fields.map(function (field) { return [start, meta.columns[field], n]; }); };
    setFormats_(sheet, block(['ID_PHIEU', 'ID_BIEU_MAU', 'MA_NHAN_VIEN', 'SO_VAN_BAN']), '@');
    setFormats_(sheet, block(['NGAY_LAP', 'NGAY_TAO']), 'dd/MM/yyyy HH:mm');
    if (effective) setFormats_(sheet, block(['NGAY_HIEU_LUC']), 'dd/MM/yyyy');
    sheet.getRange(start, 1, n, meta.headers.length).setValues(records.map(function (record) { return meta.headers.map(function (header) { return header ? (record[header] == null ? '' : record[header]) : ''; }); }));
    records.forEach(function (record) { ids.push(record.ID_PHIEU); });
  } finally {
    lock.releaseLock();
  }
  writeSystemLog_(ss, auth, 'HO_SO', 'XUAT_FILE', ids.join(','), null, { loai: type.name, so: numbers.join(', ') }, 'In văn bản nhân sự.');
  var applied = { salaries: 0, resigned: 0, lockedAccounts: 0, errors: [] };
  if (input.writeBack) hrDocWriteBack_(ss, auth, input, numbers[0] || '', applied);
  return { success: true, numbers: numbers, ids: ids, applied: applied };
}

/**
 * Ghi lương mới cho nhiều người trong 1 lượt: đọc danh bạ 1 lần, ghi từng ô lương (không đọc lại),
 * lịch sử “Nâng lương” 1 lệnh ghi, nhật ký 1 dòng. Trước đây mỗi người là 1 lần lưu hồ sơ đầy đủ (~15 lần đọc/người).
 */
function hrBatchSalaries_(ss, auth, input, number, applied) {
  if (!authUserCan_(auth, 'NHAN_SU', 'SUA')) { applied.errors.push('Tài khoản không có quyền sửa hồ sơ nhân viên.'); return; }
  if (authLevel_(auth) < 2) { applied.errors.push('Cần quyền xem lương (mức 2) để ghi lương.'); return; }
  var items = (input.salaries || []).slice(0, 300), effective = input.effectiveDate ? parseAttendanceDate_(input.effectiveDate, 'Ngày hiệu lực') : new Date(), now = new Date();
  var lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try {
    var sheet = ss.getSheetByName('DM_NHAN_VIEN');
    if (!sheet) { applied.errors.push('Không tìm thấy sheet DM_NHAN_VIEN.'); return; }
    var range = sheet.getDataRange(), values = range.getValues(), display = range.getDisplayValues(), meta = headersFromRow_(display[0] || []);
    var codeCol = meta.columns.MA_NHAN_VIEN, salaryCol = meta.columns.LUONG_CO_BAN, updatedCol = meta.columns.NGAY_CAP_NHAT;
    if (!codeCol || !salaryCol) { applied.errors.push('DM_NHAN_VIEN chưa có cột MA_NHAN_VIEN hoặc LUONG_CO_BAN.'); return; }
    var formulas = sheet.getRange(1, salaryCol, values.length, 1).getFormulas(), byCode = {};
    for (var r = 1; r < values.length; r++) { var key = key_(display[r][codeCol - 1]); if (key) byCode[key] = byCode[key] ? -1 : r; }
    var history = [], changed = {}, rows = [], level = authLevel_(auth);
    items.forEach(function (item) {
      var code = String(item && item.code || '').trim(), r = byCode[key_(code)], salary = String(item && item.salary || '').replace(/[^\d]/g, '');
      if (!salary || r === undefined) { applied.errors.push((code || '?') + ': không tìm thấy nhân viên hoặc thiếu lương mới.'); return; }
      if (r === -1) { applied.errors.push(code + ': mã nhân viên bị trùng trong danh bạ.'); return; }
      if (formulas[r][0]) { applied.errors.push(code + ': ô lương đang là công thức, không ghi đè.'); return; }
      var row = display[r], get = function (field) { return meta.columns[field] ? row[meta.columns[field] - 1] : ''; }, old = get('LUONG_CO_BAN');
      sheet.getRange(r + 1, salaryCol).setValue(Number(salary));
      if (updatedCol) sheet.getRange(r + 1, updatedCol).setValue(now);
      changed[code] = { cu: old, moi: Number(salary) };
      history.push({
        ID_LICH_SU: 'LS_' + Utilities.getUuid(), MA_NHAN_VIEN: get('MA_NHAN_VIEN'), HO_VA_TEN: get('HO_VA_TEN'), NGAY_HIEU_LUC: effective, LOAI_BIEN_DONG: 'Nâng lương',
        MA_PHONG_BAN_CU: get('MA_PHONG_BAN'), MA_BO_PHAN_CU: get('MA_BO_PHAN'), MA_NHOM_CU: get('MA_NHOM'), MA_CHUC_VU_CU: get('MA_CHUC_VU'),
        MA_PHONG_BAN_MOI: get('MA_PHONG_BAN'), MA_BO_PHAN_MOI: get('MA_BO_PHAN'), MA_NHOM_MOI: get('MA_NHOM'), MA_CHUC_VU_MOI: get('MA_CHUC_VU'),
        TRANG_THAI_CU: get('TRANG_THAI'), TRANG_THAI_MOI: get('TRANG_THAI'), SO_QUYET_DINH: number,
        GHI_CHU: 'Lương cơ bản: ' + (old || '—') + ' → ' + Number(salary).toLocaleString('vi-VN'), NGUOI_TAO: auth.username || auth.email || 'Hệ thống', NGAY_TAO: now, TRANG_THAI: 'Đã ghi nhận'
      });
      var copy = {};
      meta.headers.forEach(function (header, index) { if (header) copy[header] = row[index] || ''; });
      copy.LUONG_CO_BAN = Number(salary).toLocaleString('vi-VN');
      rows.push(stripEmployeeRow_(copy, level));
      applied.salaries++;
    });
    if (history.length) {
      if (updatedCol) setFormats_(sheet, [[2, updatedCol, values.length - 1]], 'dd/MM/yyyy HH:mm');
      var historySheet = ensureWorkHistorySheet_(ss);
      appendWorkHistoryRows_(historySheet, headers_(historySheet), history);
      writeSystemLog_(ss, auth, 'NHAN_SU', 'SUA', Object.keys(changed).join(','), null, { LUONG_CO_BAN: changed, SO_QUYET_DINH: number }, 'Nâng lương theo quyết định ' + number + '.');
    }
    applied.rows = rows;
  } finally {
    lock.releaseLock();
  }
}

/** Ghi ngược hồ sơ: lương mới (+ lịch sử “Nâng lương”) hoặc chuyển “Nghỉ việc” (lịch sử + khóa tài khoản do writeEmployee_ lo). */
function hrDocWriteBack_(ss, auth, input, number, applied) {
  if (input.kind === 'raise') {
    hrBatchSalaries_(ss, auth, input, number, applied);
  } else if (input.kind === 'terminate') {
    var employees = readSheet_(ss, 'DM_NHAN_VIEN').rows, find = function (code) { return employees.find(function (row) { return key_(row.MA_NHAN_VIEN) === key_(code); }); };
    var t = input.termination || {}, person = find(t.code);
    if (!person) { applied.errors.push('Không tìm thấy nhân viên cần chuyển nghỉ việc.'); return; }
    try {
      var end = parseAttendanceDate_(t.endDate, 'Ngày chấm dứt'), text = Utilities.formatDate(end, Session.getScriptTimeZone(), 'dd/MM/yyyy') + ' – ' + String(t.reason || '').trim();
      var result = writeEmployee_({ _sessionToken: input._sessionToken, _originalCode: person.MA_NHAN_VIEN, HO_VA_TEN: person.HO_VA_TEN, TRANG_THAI: 'Nghỉ việc', THOI_DIEM_CHAM_DUT_HD_VA_LY_DO: text, NGAY_HIEU_LUC: t.endDate, SO_QUYET_DINH: number, GHI_CHU_LICH_SU: String(t.reason || '').trim() }, true);
      applied.resigned = 1; applied.lockedAccounts = result.lockedAccounts || 0; applied.rows = result.row ? [result.row] : [];
    } catch (error) { applied.errors.push(person.MA_NHAN_VIEN + ': ' + (error && error.message || error)); }
  }
}

function importEmployees(input) {
  input = input || {};
  requireAuth_(input._sessionToken);
  var items = Array.isArray(input.items) ? input.items.slice(0, 25) : [], results = [];
  if (!items.length) throw new Error('Không có dòng nào để nhập.');
  items.forEach(function (item) {
    var data = Object.assign({}, item && item.data || {}), code = String(item && item.code || '').trim();
    data._sessionToken = input._sessionToken;
    if (code) data._originalCode = code;
    try {
      var result = writeEmployee_(data, !!code);
      results.push({ line: item.line, ok: true, code: result.code, updated: !!code, lockedAccounts: result.lockedAccounts || 0 });
    } catch (error) {
      results.push({ line: item.line, ok: false, error: String(error && error.message || error) });
    }
  });
  return { success: true, results: results };
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
  hiddenEmployeeFields_(authLevel_(auth)).forEach(function (field) { delete input[field]; });
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

    // Chỉ đối chiếu danh mục khi mã thay đổi so với hồ sơ đang có (sửa SĐT, ảnh… không cần đọc lại danh mục).
    var changedMaster = function (field) { return Object.prototype.hasOwnProperty.call(input, field) && (!editing || !before || key_(before[field]) !== key_(input[field])); };
    if (changedMaster('MA_PHONG_BAN') || (Object.prototype.hasOwnProperty.call(input, 'MA_PHONG_BAN') && !editing)) {
      input.MA_PHONG_BAN = requireMasterCode_(ss, 'DM_PHONG_BAN', 'MA_PHONG_BAN', input.MA_PHONG_BAN, 'phòng ban');
    }
    if (changedMaster('MA_CHUC_VU') && String(input.MA_CHUC_VU || '').trim()) {
      input.MA_CHUC_VU = requireMasterCode_(ss, 'DM_CHUC_VU', 'MA_CHUC_VU', input.MA_CHUC_VU, 'chức vụ');
    }
    if (changedMaster('MA_BO_PHAN') && String(input.MA_BO_PHAN || '').trim()) {
      input.MA_BO_PHAN = requireMasterCode_(ss, 'DM_BO_PHAN', 'MA_BO_PHAN', input.MA_BO_PHAN, 'bộ phận');
    }
    if (changedMaster('MA_NHOM') && String(input.MA_NHOM || '').trim()) {
      input.MA_NHOM = requireMasterCode_(ss, 'DM_NHOM', 'MA_NHOM', input.MA_NHOM, 'nhóm');
    }
    if (input.MA_BO_PHAN && input.MA_PHONG_BAN && (changedMaster('MA_BO_PHAN') || changedMaster('MA_PHONG_BAN'))) {
      var unit = masterRowByCode_(ss, 'DM_BO_PHAN', 'MA_BO_PHAN', input.MA_BO_PHAN);
      if (!unit || key_(unit.MA_PHONG_BAN) !== key_(input.MA_PHONG_BAN)) {
        throw new Error('Bộ phận đã chọn không thuộc phòng ban đã chọn.');
      }
    }
    if (input.MA_NHOM && input.MA_BO_PHAN && (changedMaster('MA_NHOM') || changedMaster('MA_BO_PHAN'))) {
      var team = masterRowByCode_(ss, 'DM_NHOM', 'MA_NHOM', input.MA_NHOM);
      if (!team || key_(team.MA_BO_PHAN) !== key_(input.MA_BO_PHAN)) {
        throw new Error('Nhóm đã chọn không thuộc bộ phận đã chọn.');
      }
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
      if (editing && before && !changedMaster(map[0]) && String(before[map[1]] || '').trim()) return;
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
    // Đặt định dạng trước khi ghi (giữ số 0 đầu của CCCD, điện thoại, mã BHXH) – gộp thành 3 lệnh thay vì ~15.
    var cell = function (field) { return meta.columns[field] ? [rowNumber, meta.columns[field]] : null; };
    setFormats_(sheet, ['MA_NHAN_VIEN', 'ID_NHAN_VIEN', 'SO_CCCD', 'SO_DIEN_THOAI', 'MA_PHONG_BAN', 'MA_BO_PHAN', 'MA_NHOM', 'MA_CHUC_VU', 'ANH_DAI_DIEN', 'MA_SO_BHXH'].map(cell), '@');
    setFormats_(sheet, ['NGAY_SINH', 'NGAY_VAO_LAM', 'NGAY_CAP', 'NGAY_THAM_GIA_BHXH'].map(cell), 'dd/MM/yyyy');
    setFormats_(sheet, [cell('NGAY_CAP_NHAT')], 'dd/MM/yyyy HH:mm');
    sheet.getRange(rowNumber, 1, 1, meta.headers.length).setValues([rowValues]);
    var after = objectFromRow_(meta, sheet.getRange(rowNumber, 1, 1, meta.headers.length).getDisplayValues()[0]);
    if (editing && before) appendWorkHistory_(ss, before, after, input, auth);
    writeSystemLog_(ss, auth, 'NHAN_SU', editing ? 'SUA' : 'THEM', code, before, after, editing ? 'Cập nhật hồ sơ nhân viên.' : 'Tạo hồ sơ nhân viên.');
    var lockedAccounts = plain_(after && after.TRANG_THAI) === 'nghi viec' && plain_(before && before.TRANG_THAI) !== 'nghi viec' ? authLockResignedAccounts_(ss, auth, code) : 0;
    return { success: true, code: code, lockedAccounts: lockedAccounts, row: stripEmployeeRow_(after, authLevel_(auth)) };
  } finally {
    lock.releaseLock();
  }
}
