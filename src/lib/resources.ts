// Single source of truth for every module: drives the API (whitelisting, search,
// permissions), the tables, the forms and the sidebar. Mirrors the V191 menu.

export type FieldType =
  | 'text' | 'email' | 'number' | 'money' | 'date' | 'textarea' | 'select' | 'ref' | 'password' | 'bool' | 'month'

export interface Field {
  name: string
  label: string
  type: FieldType
  required?: boolean
  options?: string[] // for 'select' (stored value = label, like the sheet)
  ref?: string // for 'ref': resource key whose rows are the choices
  default?: string | number | boolean
  createOnly?: boolean // shown only when creating (password); never stored on the row
  ro?: boolean // computed / server-managed: listed, never accepted from the client
  inList?: boolean // force show/hide as a column
  inForm?: boolean // false = never in the edit form
  multiline?: boolean // keep line breaks in table cells (proposal line lists)
}

export type Perm = 'view' | 'create' | 'edit' | 'delete' | 'approve'

export interface Action {
  key: string
  label: string
  perm: Perm
  fields?: Field[] // inputs collected in a dialog before running
  confirm?: string
  scope?: 'row' | 'page' // page actions sit in the toolbar
  show?: (row: any) => boolean
}

export interface Resource {
  key: string
  table: string
  view?: string // read model with computed columns (alerts, stock…)
  module: string // permission module code (same codes as V191 PHAN_QUYEN)
  title: string
  singular: string
  searchFields: string[]
  orderBy: { column: string; ascending: boolean }
  fields: Field[]
  optionSelect?: string
  optionLabel: (row: any) => string
  actions?: Action[]
  noCreate?: boolean
  noEdit?: boolean
  noDelete?: boolean
  /** date column driving the month calendar in the left panel */
  dateField?: string
  /** extra date columns the calendar can count by (first = dateField) */
  calendarFields?: { name: string; label: string }[]
  /** ref/select column listed as quick filters in the left panel */
  sideFilter?: string
  /** rows matching this cannot be edited/deleted (approved proposal, locked period…) */
  locked?: (row: any) => string | null
}

export const MODULES: { key: string; label: string }[] = [
  { key: 'CONG_VIEC', label: 'Công việc' },
  { key: 'CVHN', label: 'Công việc hằng ngày' },
  { key: 'KHACH_RA_VAO', label: 'Khách ra/vào' },
  { key: 'BAO_TRI', label: 'Bảo trì' },
  { key: 'DE_XUAT', label: 'Đề xuất' },
  { key: 'THIET_BI', label: 'Thiết bị' },
  { key: 'KHO', label: 'Kho vật tư' },
  { key: 'THU_HOI', label: 'Thu hồi / thanh lý' },
  { key: 'QUAN_LY_TANG', label: 'Tòa nhà, tầng' },
  { key: 'KHACH_THUE', label: 'Khách thuê' },
  { key: 'KHACH_HANG_TIEM_NANG', label: 'Khách hàng tiềm năng' },
  { key: 'TIEN_DIEN', label: 'Tiền điện' },
  { key: 'DANH_MUC', label: 'Danh mục' },
  { key: 'BAO_CAO', label: 'Báo cáo' },
  { key: 'NGUOI_SU_DUNG', label: 'Người dùng' },
  { key: 'VAI_TRO', label: 'Vai trò' },
  { key: 'PHAN_QUYEN', label: 'Phân quyền' },
]

const ACTIVE = ['Hoạt động', 'Ngưng hoạt động']
const WORK_STATES = ['Chưa thực hiện', 'Đang thực hiện', 'Hoàn thành', 'Tạm hoãn']
export const STAGES = ['Khảo sát', 'Báo giá', 'Duyệt', 'Thi công', 'Chờ', 'Hoàn thành']
const ASSET_STATES = ['Trong kho', 'Đang sử dụng', 'Bảo trì', 'Chờ thanh lý', 'Đã thanh lý']
export const PROPOSAL_KINDS: Record<string, string> = {
  MUA_VAT_TU: 'Mua vật tư', MUA_THIET_BI: 'Mua thiết bị', BAO_TRI: 'Bảo trì', THANH_LY: 'Thanh lý',
}
const APPROVED = 'Đã duyệt'

const progressAction: Action = {
  key: 'tien_do', label: 'Ghi nhận', perm: 'edit',
  fields: [
    { name: 'giai_doan', label: 'Giai đoạn', type: 'select', options: STAGES },
    { name: 'noi_dung', label: 'Nội dung', type: 'textarea' },
  ],
}
const workFields = (dateField: Field): Field[] => [
  dateField,
  { name: 'noi_dung', label: 'Nội dung công việc', type: 'textarea', required: true, inList: true },
  { name: 'id_nguoi_giao', label: 'Người giao', type: 'ref', ref: 'nhan_vien' },
  { name: 'id_nguoi_thuc_hien', label: 'Người thực hiện', type: 'ref', ref: 'nhan_vien' },
  { name: 'nguoi_lam_cung', label: 'Người làm cùng', type: 'text', inList: false },
  { name: 'id_nha_thau', label: 'Nhà thầu', type: 'ref', ref: 'nha_thau', inList: false },
  { name: 'don_vi_thuc_hien', label: 'Đơn vị thực hiện', type: 'text', inList: false },
  { name: 'trang_thai', label: 'Trạng thái', type: 'select', options: WORK_STATES, default: 'Chưa thực hiện' },
  { name: 'giai_doan_hien_tai', label: 'Giai đoạn', type: 'text', ro: true },
  { name: 'ngay_hoan_thanh', label: 'Ngày hoàn thành', type: 'date', inList: false },
  { name: 'tien_do', label: 'Tiến độ', type: 'textarea', ro: true, inList: false },
  { name: 'ghi_chu', label: 'Ghi chú', type: 'textarea' },
]

export const RESOURCES: Resource[] = [
  // ───────── CÔNG VIỆC ─────────
  {
    key: 'cong_viec', table: 'cong_viec', view: 'v_cong_viec', module: 'CONG_VIEC', title: 'Công việc', singular: 'công việc',
    dateField: 'ngay_giao', sideFilter: 'id_nguoi_thuc_hien',
    calendarFields: [{ name: 'ngay_giao', label: 'Ngày giao' }, { name: 'deadline', label: 'Hạn' }, { name: 'ngay_hoan_thanh', label: 'Hoàn thành' }],
    searchFields: ['id', 'noi_dung', 'khu_vuc', 'tien_do'], orderBy: { column: 'ngay_giao', ascending: false },
    fields: [
      ...workFields({ name: 'ngay_giao', label: 'Ngày giao', type: 'date' }).slice(0, 2),
      { name: 'khu_vuc', label: 'Khu vực', type: 'text' },
      { name: 'cach_thuc_hien', label: 'Cách thực hiện', type: 'textarea', inList: false },
      { name: 'deadline', label: 'Hạn hoàn thành', type: 'date' },
      { name: 'muc_do', label: 'Mức độ', type: 'select', options: ['Bình thường', 'Gấp', 'Rất gấp'] },
      ...workFields({ name: 'ngay_giao', label: 'Ngày giao', type: 'date' }).slice(2),
      { name: 'so_ngay_con_lai', label: 'Còn (ngày)', type: 'number', ro: true },
      { name: 'canh_bao', label: 'Cảnh báo', type: 'text', ro: true },
    ],
    optionLabel: (r) => `${r.id} · ${String(r.noi_dung ?? '').slice(0, 60)}`,
    actions: [progressAction],
  },
  {
    key: 'cong_viec_hang_ngay', table: 'cong_viec_hang_ngay', module: 'CVHN', title: 'Công việc hằng ngày', singular: 'công việc',
    dateField: 'ngay', sideFilter: 'id_nguoi_thuc_hien',
    searchFields: ['id', 'noi_dung', 'cach_thuc_hien', 'tien_do'], orderBy: { column: 'ngay', ascending: false },
    fields: [
      ...workFields({ name: 'ngay', label: 'Ngày', type: 'date', required: true }).slice(0, 2),
      { name: 'cach_thuc_hien', label: 'Cách thực hiện', type: 'textarea', inList: false },
      ...workFields({ name: 'ngay', label: 'Ngày', type: 'date' }).slice(2),
    ],
    optionLabel: (r) => `${r.id} · ${String(r.noi_dung ?? '').slice(0, 60)}`,
    actions: [progressAction],
  },
  {
    key: 'khach_ra_vao', table: 'khach_ra_vao', module: 'KHACH_RA_VAO', title: 'Khách ra/vào', singular: 'lượt khách',
    dateField: 'ngay',
    searchFields: ['ho_ten', 'sdt', 'cong_ty', 'nguoi_can_gap', 'bien_so_xe'], orderBy: { column: 'created_at', ascending: false },
    fields: [
      { name: 'ngay', label: 'Ngày', type: 'date' },
      { name: 'gio_vao', label: 'Giờ vào', type: 'text' },
      { name: 'ho_ten', label: 'Họ tên', type: 'text', required: true },
      { name: 'sdt', label: 'Điện thoại', type: 'text', required: true },
      { name: 'giay_to', label: 'Giấy tờ', type: 'text', inList: false },
      { name: 'dia_chi', label: 'Địa chỉ', type: 'text', inList: false },
      { name: 'cong_ty', label: 'Công ty', type: 'text' },
      { name: 'nguoi_can_gap', label: 'Người cần gặp', type: 'text' },
      { name: 'phong_ban', label: 'Phòng ban', type: 'text', inList: false },
      { name: 'tang', label: 'Tầng', type: 'text' },
      { name: 'cong_ty_lien_he', label: 'Công ty liên hệ', type: 'text', inList: false },
      { name: 'noi_dung', label: 'Nội dung công việc', type: 'textarea', inList: false },
      { name: 'muc_dich', label: 'Mục đích', type: 'text', inList: false },
      { name: 'nguoi_di_cung', label: 'Người đi cùng', type: 'text', inList: false },
      { name: 'bien_so_xe', label: 'Biển số xe', type: 'text', inList: false },
      { name: 'ngay_hen', label: 'Ngày hẹn', type: 'date', inList: false },
      { name: 'gio_hen', label: 'Giờ hẹn', type: 'text', inList: false },
      { name: 'gio_ra', label: 'Giờ ra', type: 'text', ro: true },
      { name: 'trang_thai', label: 'Trạng thái', type: 'select', options: ['Đang trong tòa nhà', 'Đã ra', 'Hẹn trước', 'Hủy'], default: 'Đang trong tòa nhà' },
      { name: 'ghi_chu', label: 'Ghi chú', type: 'textarea', inList: false },
    ],
    optionLabel: (r) => r.ho_ten,
    actions: [
      { key: 'check_in', label: 'Check-in', perm: 'edit', confirm: 'Cho khách hẹn trước vào tòa nhà?', show: (r) => r.trang_thai === 'Hẹn trước' },
      { key: 'checkout', label: 'Check-out', perm: 'edit', confirm: 'Ghi nhận khách đã ra?', show: (r) => r.trang_thai === 'Đang trong tòa nhà' },
      { key: 'huy', label: 'Hủy lượt', perm: 'edit', confirm: 'Hủy lượt khách này?', show: (r) => r.trang_thai === 'Đang trong tòa nhà' || r.trang_thai === 'Hẹn trước' },
    ],
  },

  // ───────── BẢO TRÌ ─────────
  {
    key: 'nhat_ky_bao_tri', table: 'nhat_ky_bao_tri', module: 'BAO_TRI', title: 'Nhật ký bảo trì', singular: 'nhật ký',
    dateField: 'ngay_thuc_hien', sideFilter: 'id_hang_muc',
    searchFields: ['id', 'noi_dung_thuc_hien', 'ket_qua'], orderBy: { column: 'ngay_thuc_hien', ascending: false },
    fields: [
      { name: 'ngay_thuc_hien', label: 'Ngày thực hiện', type: 'date', required: true },
      { name: 'id_khu_vuc', label: 'Tầng · Khu vực', type: 'ref', ref: 'khu_vuc', required: true },
      { name: 'id_hang_muc', label: 'Hạng mục', type: 'ref', ref: 'hang_muc_bao_tri', required: true },
      { name: 'id_nguoi_thuc_hien', label: 'Người thực hiện/theo dõi', type: 'ref', ref: 'nhan_vien' },
      { name: 'id_nha_thau', label: 'Đơn vị bảo trì', type: 'ref', ref: 'nha_thau' },
      { name: 'don_vi_thuc_hien', label: 'Đơn vị (ghi tay)', type: 'text', inList: false },
      { name: 'noi_dung_thuc_hien', label: 'Nội dung thực hiện', type: 'textarea' },
      { name: 'ket_qua', label: 'Kết quả', type: 'text' },
      { name: 'ghi_chu', label: 'Ghi chú', type: 'textarea', inList: false },
    ],
    optionLabel: (r) => r.id,
  },
  {
    key: 'lich_bao_tri', table: 'lich_bao_tri', view: 'v_lich_bao_tri', module: 'BAO_TRI', title: 'Kế hoạch bảo trì', singular: 'lịch bảo trì',
    sideFilter: 'id_hang_muc',
    searchFields: ['ten_khu_vuc', 'ten_hang_muc', 'tang', 'nhom'], orderBy: { column: 'ngay_ke_tiep', ascending: true },
    noDelete: true, // generated per area + item; pause it instead (as in V191)
    fields: [
      { name: 'id_khu_vuc', label: 'Tầng · Khu vực', type: 'ref', ref: 'khu_vuc', required: true },
      { name: 'id_hang_muc', label: 'Hạng mục', type: 'ref', ref: 'hang_muc_bao_tri', required: true },
      { name: 'chu_ky_ngay', label: 'Chu kỳ riêng (ngày)', type: 'number', inList: false },
      { name: 'canh_bao_truoc_ngay', label: 'Cảnh báo trước (ngày)', type: 'number', inList: false },
      { name: 'chu_ky', label: 'Chu kỳ (ngày)', type: 'number', ro: true },
      { name: 'ngay_goc_gan_nhat', label: 'Lần gần nhất', type: 'date', ro: true },
      { name: 'ngay_ke_tiep', label: 'Ngày kế tiếp', type: 'date', ro: true },
      { name: 'so_ngay_con_lai', label: 'Còn (ngày)', type: 'number', ro: true },
      { name: 'canh_bao', label: 'Cảnh báo', type: 'text', ro: true },
      { name: 'id_nguoi_phu_trach', label: 'Người phụ trách', type: 'ref', ref: 'nhan_vien' },
      { name: 'trang_thai', label: 'Trạng thái', type: 'select', options: ['Hoạt động', 'Tạm ngưng'], default: 'Hoạt động' },
      { name: 'ghi_chu', label: 'Ghi chú', type: 'textarea', inList: false },
    ],
    optionSelect: 'id, khu_vuc(tang, ten_khu_vuc), hang_muc_bao_tri(ten_hang_muc)',
    optionLabel: (r) => `${r.khu_vuc?.tang ?? ''} · ${r.khu_vuc?.ten_khu_vuc ?? '?'} — ${r.hang_muc_bao_tri?.ten_hang_muc ?? '?'}`,
  },

  // ───────── ĐỀ XUẤT ─────────
  {
    key: 'de_xuat', table: 'de_xuat', view: 'v_de_xuat', module: 'DE_XUAT', title: 'Đề xuất', singular: 'đề xuất',
    dateField: 'ngay_de_xuat', sideFilter: 'id_nguoi_de_xuat',
    searchFields: ['id', 'noi_dung', 'muc_dich_ly_do'], orderBy: { column: 'ngay_de_xuat', ascending: false },
    fields: [
      { name: 'loai_de_xuat', label: 'Loại', type: 'select', options: Object.keys(PROPOSAL_KINDS), required: true },
      { name: 'ngay_de_xuat', label: 'Ngày đề xuất', type: 'date' },
      { name: 'id_nguoi_de_xuat', label: 'Người đề xuất', type: 'ref', ref: 'nhan_vien', required: true },
      { name: 'ds_ten', label: 'Tên vật tư / thiết bị', type: 'text', ro: true, multiline: true },
      { name: 'ds_nha_cung_cap', label: 'Nhà cung cấp', type: 'text', ro: true, multiline: true },
      { name: 'ds_don_gia', label: 'Đơn giá', type: 'text', ro: true, multiline: true },
      { name: 'ds_so_luong', label: 'Số lượng', type: 'text', ro: true, multiline: true },
      { name: 'ds_dvt', label: 'ĐVT', type: 'text', ro: true, multiline: true },
      { name: 'ds_thanh_tien', label: 'Thành tiền', type: 'text', ro: true, multiline: true },
      { name: 'noi_dung', label: 'Nội dung', type: 'textarea', required: true, inList: false },
      { name: 'muc_dich_ly_do', label: 'Mục đích / lý do', type: 'textarea', inList: false },
      { name: 'so_dong', label: 'Số dòng', type: 'number', ro: true, inList: false },
      { name: 'tong_tien', label: 'Tổng tiền', type: 'money', ro: true, inList: false },
      { name: 'trang_thai', label: 'Trạng thái', type: 'select', ro: true, options: ['Chờ duyệt', 'Đã duyệt', 'Từ chối'] },
      { name: 'nguoi_duyet', label: 'Người duyệt', type: 'text', ro: true, inList: false },
      { name: 'ngay_duyet', label: 'Ngày duyệt', type: 'date', ro: true, inList: false },
      { name: 'ghi_chu', label: 'Ghi chú', type: 'textarea', inList: true },
    ],
    optionLabel: (r) => `${r.id} · ${PROPOSAL_KINDS[r.loai_de_xuat] ?? r.loai_de_xuat} · ${String(r.noi_dung ?? '').slice(0, 40)}`,
    locked: (r) => (r?.trang_thai === APPROVED ? 'Đề xuất đã duyệt, không thể sửa hoặc xóa' : null),
    actions: [
      { key: 'duyet', label: 'Duyệt', perm: 'approve', confirm: 'Duyệt đề xuất này? Đề xuất mua vật tư sẽ tự nhập kho.', show: (r) => r.trang_thai !== APPROVED },
      { key: 'tu_choi', label: 'Từ chối', perm: 'approve', fields: [{ name: 'ly_do', label: 'Lý do', type: 'textarea', required: true }], show: (r) => r.trang_thai === 'Chờ duyệt' },
    ],
  },
  {
    key: 'de_xuat_chi_tiet', table: 'de_xuat_chi_tiet', module: 'DE_XUAT', title: 'Chi tiết đề xuất', singular: 'dòng đề xuất',
    searchFields: ['ten', 'nha_cung_cap'], orderBy: { column: 'id', ascending: true },
    fields: [
      { name: 'id_de_xuat', label: 'Đề xuất', type: 'ref', ref: 'de_xuat', required: true },
      { name: 'id_vat_tu', label: 'Vật tư', type: 'ref', ref: 'vat_tu' },
      { name: 'id_thiet_bi', label: 'Thiết bị', type: 'ref', ref: 'thiet_bi' },
      { name: 'ten', label: 'Tên (nếu chưa có trong danh mục)', type: 'text' },
      { name: 'dvt', label: 'ĐVT', type: 'text' },
      { name: 'so_luong', label: 'Số lượng', type: 'number', required: true, default: 1 },
      { name: 'don_gia', label: 'Đơn giá', type: 'money', default: 0 },
      { name: 'thanh_tien', label: 'Thành tiền', type: 'money', ro: true },
      { name: 'nha_cung_cap', label: 'Nhà cung cấp', type: 'text' },
      { name: 'ghi_chu', label: 'Ghi chú', type: 'text', inList: false },
    ],
    optionLabel: (r) => r.id,
  },

  // ───────── THIẾT BỊ & KHO ─────────
  {
    key: 'vat_tu', table: 'vat_tu', view: 'v_vat_tu', module: 'KHO', title: 'Kho vật tư', singular: 'vật tư',
    searchFields: ['id', 'ten_vat_tu', 'nhom', 'thong_so'], orderBy: { column: 'ten_vat_tu', ascending: true },
    fields: [
      { name: 'ten_vat_tu', label: 'Tên vật tư', type: 'text', required: true },
      { name: 'nhom', label: 'Nhóm', type: 'text' },
      { name: 'dvt', label: 'ĐVT', type: 'text' },
      { name: 'thong_so', label: 'Thông số', type: 'text', inList: false },
      { name: 'ton_dau', label: 'Tồn đầu', type: 'number', default: 0, inList: false },
      { name: 'tong_nhap', label: 'Nhập', type: 'number', ro: true },
      { name: 'tong_xuat', label: 'Xuất', type: 'number', ro: true },
      { name: 'ton_hien_tai', label: 'Tồn hiện tại', type: 'number', ro: true },
      { name: 'ton_toi_thieu', label: 'Tồn tối thiểu', type: 'number', inList: false },
      { name: 'canh_bao', label: 'Cảnh báo', type: 'text', ro: true },
      { name: 'vi_tri', label: 'Vị trí', type: 'text', inList: false },
      { name: 'trang_thai', label: 'Trạng thái', type: 'select', options: ACTIVE, default: 'Hoạt động', inList: false },
      { name: 'ghi_chu', label: 'Ghi chú', type: 'textarea', inList: false },
    ],
    optionLabel: (r) => `${r.ten_vat_tu}${r.dvt ? ` (${r.dvt})` : ''}`,
    actions: [{
      key: 'nhap_xuat', label: 'Nhập / Xuất', perm: 'edit',
      fields: [
        { name: 'loai_giao_dich', label: 'Loại', type: 'select', options: ['NHAP', 'XUAT'], required: true },
        { name: 'so_luong', label: 'Số lượng', type: 'number', required: true },
        { name: 'ngay', label: 'Ngày', type: 'date' },
        { name: 'noi_dung', label: 'Nội dung', type: 'text' },
      ],
    }],
  },
  {
    key: 'nhap_xuat_kho', table: 'nhap_xuat_kho', module: 'KHO', title: 'Lịch sử nhập xuất', singular: 'giao dịch kho',
    dateField: 'ngay',
    searchFields: ['id', 'noi_dung', 'id_chung_tu'], orderBy: { column: 'created_at', ascending: false },
    noCreate: true, noEdit: true, noDelete: true, // append-only ledger: correct with a new movement
    fields: [
      { name: 'ngay', label: 'Ngày', type: 'date' },
      { name: 'id_vat_tu', label: 'Vật tư', type: 'ref', ref: 'vat_tu' },
      { name: 'loai_giao_dich', label: 'Loại', type: 'select', options: ['NHAP', 'XUAT'] },
      { name: 'so_luong', label: 'Số lượng', type: 'number' },
      { name: 'noi_dung', label: 'Nội dung', type: 'text' },
      { name: 'nguon_giao_dich', label: 'Nguồn', type: 'text' },
      { name: 'id_chung_tu', label: 'Chứng từ', type: 'text' },
      { name: 'nguoi_tao', label: 'Người tạo', type: 'text' },
    ],
    optionLabel: (r) => r.id,
  },
  {
    key: 'thiet_bi', table: 'thiet_bi', module: 'THIET_BI', title: 'Thiết bị', singular: 'thiết bị',
    sideFilter: 'id_khu_vuc',
    searchFields: ['id', 'ten_thiet_bi', 'serial', 'model', 'hang', 'loai_thiet_bi'], orderBy: { column: 'ten_thiet_bi', ascending: true },
    fields: [
      { name: 'ten_thiet_bi', label: 'Tên thiết bị', type: 'text', required: true },
      { name: 'loai_thiet_bi', label: 'Loại', type: 'text' },
      { name: 'hang', label: 'Hãng', type: 'text', inList: false },
      { name: 'model', label: 'Model', type: 'text', inList: false },
      { name: 'serial', label: 'Serial', type: 'text' },
      { name: 'thong_so', label: 'Thông số', type: 'textarea', inList: false },
      { name: 'ngay_mua', label: 'Ngày mua', type: 'date', inList: false },
      { name: 'han_bao_hanh', label: 'Hạn bảo hành', type: 'date', inList: false },
      { name: 'id_khu_vuc', label: 'Tầng · Khu vực', type: 'ref', ref: 'khu_vuc' },
      { name: 'id_nguoi_su_dung', label: 'Người sử dụng', type: 'ref', ref: 'nhan_vien' },
      { name: 'id_nguoi_quan_ly', label: 'Người quản lý', type: 'ref', ref: 'nhan_vien', inList: false },
      { name: 'tinh_trang', label: 'Tình trạng', type: 'text', inList: false },
      { name: 'trang_thai', label: 'Trạng thái', type: 'select', options: ASSET_STATES, default: 'Trong kho' },
      { name: 'ghi_chu', label: 'Ghi chú', type: 'textarea', inList: false },
    ],
    optionLabel: (r) => `${r.ten_thiet_bi}${r.serial ? ` · ${r.serial}` : ''}`,
    actions: [
      {
        key: 'chuyen', label: 'Chuyển', perm: 'edit', show: (r) => r.trang_thai !== 'Đã thanh lý',
        fields: [
          { name: 'id_khu_vuc', label: 'Đến khu vực', type: 'ref', ref: 'khu_vuc' },
          { name: 'id_nguoi_su_dung', label: 'Đến người dùng', type: 'ref', ref: 'nhan_vien' },
          { name: 'ly_do', label: 'Lý do', type: 'text' },
        ],
      },
      {
        key: 'thu_hoi', label: 'Thu hồi', perm: 'edit', show: (r) => ['Đang sử dụng', 'Bảo trì'].includes(r.trang_thai),
        fields: [
          { name: 'id_nguoi_tra', label: 'Người trả', type: 'ref', ref: 'nhan_vien' },
          { name: 'id_nguoi_nhan_thu_hoi', label: 'Người nhận thu hồi', type: 'ref', ref: 'nhan_vien' },
          { name: 'tinh_trang_khi_tra', label: 'Tình trạng khi trả', type: 'text' },
          { name: 'trang_thai_sau_thu_hoi', label: 'Trạng thái sau thu hồi', type: 'select', options: ['Trong kho', 'Bảo trì', 'Chờ thanh lý', 'Đã thanh lý'], required: true },
          { name: 'id_khu_vuc_sau_thu_hoi', label: 'Khu vực sau thu hồi', type: 'ref', ref: 'khu_vuc' },
          { name: 'huong_xu_ly', label: 'Hướng xử lý', type: 'text' },
          { name: 'so_bien_ban', label: 'Số biên bản', type: 'text' },
        ],
      },
    ],
  },
  {
    key: 'thu_hoi', table: 'thu_hoi', module: 'THU_HOI', title: 'Thu hồi / thanh lý', singular: 'phiếu thu hồi',
    searchFields: ['id', 'so_bien_ban', 'huong_xu_ly'], orderBy: { column: 'ngay_thu_hoi', ascending: false },
    noCreate: true, // created by the "Thu hồi" action on Thiết bị
    fields: [
      { name: 'ngay_thu_hoi', label: 'Ngày thu hồi', type: 'date' },
      { name: 'id_thiet_bi', label: 'Thiết bị', type: 'ref', ref: 'thiet_bi', inForm: false },
      { name: 'id_nguoi_tra', label: 'Người trả', type: 'ref', ref: 'nhan_vien' },
      { name: 'id_nguoi_nhan_thu_hoi', label: 'Người nhận', type: 'ref', ref: 'nhan_vien' },
      { name: 'tinh_trang_khi_tra', label: 'Tình trạng khi trả', type: 'text' },
      { name: 'trang_thai_sau_thu_hoi', label: 'Sau thu hồi', type: 'text', ro: true },
      { name: 'huong_xu_ly', label: 'Hướng xử lý', type: 'text' },
      { name: 'so_bien_ban', label: 'Số biên bản', type: 'text' },
      { name: 'ghi_chu', label: 'Ghi chú', type: 'textarea', inList: false },
    ],
    optionLabel: (r) => r.id,
  },
  {
    key: 'lich_su_chuyen_thiet_bi', table: 'lich_su_chuyen_thiet_bi', module: 'THIET_BI', title: 'Lịch sử chuyển thiết bị', singular: 'lần chuyển',
    searchFields: ['ten_thiet_bi', 'tu_khu_vuc', 'den_khu_vuc', 'tu_nguoi_dung', 'den_nguoi_dung'], orderBy: { column: 'created_at', ascending: false },
    noCreate: true, noDelete: true,
    fields: [
      { name: 'ngay_chuyen', label: 'Ngày', type: 'date', ro: true },
      { name: 'ten_thiet_bi', label: 'Thiết bị', type: 'text', ro: true },
      { name: 'tu_khu_vuc', label: 'Từ khu vực', type: 'text', ro: true },
      { name: 'den_khu_vuc', label: 'Đến khu vực', type: 'text', ro: true },
      { name: 'tu_nguoi_dung', label: 'Từ người dùng', type: 'text', ro: true },
      { name: 'den_nguoi_dung', label: 'Đến người dùng', type: 'text', ro: true },
      { name: 'ly_do', label: 'Lý do', type: 'text' },
      { name: 'ghi_chu', label: 'Ghi chú', type: 'textarea', inList: false },
    ],
    optionLabel: (r) => r.id,
  },

  // ───────── CHO THUÊ ─────────
  {
    key: 'toa_nha', table: 'toa_nha', module: 'QUAN_LY_TANG', title: 'Toà nhà', singular: 'tòa nhà',
    searchFields: ['ten_toa_nha', 'dia_chi_toa_nha'], orderBy: { column: 'ten_toa_nha', ascending: true },
    fields: [
      { name: 'ten_toa_nha', label: 'Tên tòa nhà', type: 'text', required: true },
      { name: 'dia_chi_toa_nha', label: 'Địa chỉ', type: 'text' },
      { name: 'hinh_anh_toa_nha', label: 'Link ảnh (https)', type: 'text', inList: false },
    ],
    optionLabel: (r) => r.ten_toa_nha,
  },
  {
    key: 'tang', table: 'tang', module: 'QUAN_LY_TANG', title: 'Tầng / khu cho thuê', singular: 'tầng',
    searchFields: ['ten_tang', 'ma_tang_khu_vuc'], orderBy: { column: 'ten_tang', ascending: true },
    fields: [
      { name: 'id_toa_nha', label: 'Tòa nhà', type: 'ref', ref: 'toa_nha' },
      { name: 'ten_tang', label: 'Tầng / khu vực', type: 'text', required: true },
      { name: 'ma_tang_khu_vuc', label: 'Mã', type: 'text' },
      { name: 'dien_tich', label: 'Diện tích (m²)', type: 'number' },
      { name: 'trang_thai_su_dung', label: 'Trạng thái', type: 'select', options: ['Trống', 'Đang thuê', 'Giữ chỗ', 'Không cho thuê'], default: 'Trống' },
      { name: 'bao_gia', label: 'Báo giá', type: 'text' },
      { name: 'ghi_chu', label: 'Ghi chú', type: 'textarea', inList: false },
    ],
    optionSelect: 'id, ten_tang, toa_nha(ten_toa_nha)',
    optionLabel: (r) => `${r.toa_nha?.ten_toa_nha ? r.toa_nha.ten_toa_nha + ' · ' : ''}${r.ten_tang}`,
  },
  {
    key: 'khach_thue', table: 'khach_thue', view: 'v_khach_thue', module: 'KHACH_THUE', title: 'Khách đang thuê', singular: 'khách thuê',
    searchFields: ['ten_khach_thue', 'nguoi_lien_he', 'dien_thoai', 'email'], orderBy: { column: 'ten_khach_thue', ascending: true },
    fields: [
      { name: 'ten_khach_thue', label: 'Khách thuê', type: 'text', required: true },
      { name: 'nguoi_lien_he', label: 'Người liên hệ', type: 'text' },
      { name: 'dien_thoai', label: 'Điện thoại', type: 'text' },
      { name: 'email', label: 'Email', type: 'email', inList: false },
      { name: 'dia_chi', label: 'Địa chỉ', type: 'text', inList: false },
      { name: 'ma_so_thue', label: 'MST', type: 'text', inList: false },
      { name: 'id_tang', label: 'Tầng / khu vực', type: 'ref', ref: 'tang' },
      { name: 'dien_tich', label: 'Diện tích (m²)', type: 'number' },
      { name: 'ngay_bat_dau', label: 'Bắt đầu', type: 'date' },
      { name: 'ngay_ket_thuc', label: 'Kết thúc', type: 'date' },
      { name: 'canh_bao', label: 'Cảnh báo', type: 'text', ro: true },
      { name: 'trang_thai', label: 'Trạng thái', type: 'select', options: ['Đang thuê', 'Đã rời đi'], default: 'Đang thuê' },
      { name: 'ghi_chu', label: 'Ghi chú', type: 'textarea', inList: false },
    ],
    optionLabel: (r) => r.ten_khach_thue,
  },
  {
    key: 'khach_hang_tiem_nang', table: 'khach_hang_tiem_nang', module: 'KHACH_HANG_TIEM_NANG', title: 'Khách hàng tiềm năng', singular: 'khách hàng',
    dateField: 'ngay_tiep_nhan', sideFilter: 'id_nguoi_phu_trach',
    searchFields: ['ten_khach_hang', 'nguoi_lien_he', 'dien_thoai', 'email'], orderBy: { column: 'ngay_tiep_nhan', ascending: false },
    fields: [
      { name: 'ten_khach_hang', label: 'Tên khách hàng', type: 'text', required: true },
      { name: 'nguoi_lien_he', label: 'Người liên hệ', type: 'text' },
      { name: 'dien_thoai', label: 'Điện thoại', type: 'text' },
      { name: 'email', label: 'Email', type: 'email', inList: false },
      { name: 'id_khu_vuc_quan_tam', label: 'Khu vực quan tâm', type: 'ref', ref: 'tang' },
      { name: 'dien_tich_quan_tam', label: 'Diện tích quan tâm', type: 'number', inList: false },
      { name: 'ngay_tiep_nhan', label: 'Ngày tiếp nhận', type: 'date' },
      { name: 'ngay_hen_lien_he', label: 'Hẹn liên hệ', type: 'date' },
      { name: 'nguon_khach_hang', label: 'Nguồn', type: 'text', inList: false },
      { name: 'muc_do_tiem_nang', label: 'Mức độ', type: 'select', options: ['Cao', 'Trung bình', 'Thấp'] },
      { name: 'trang_thai', label: 'Trạng thái', type: 'select', options: ['Mới', 'Đang chăm sóc', 'Đã ký', 'Không thành công'], default: 'Mới' },
      { name: 'id_nguoi_phu_trach', label: 'Người phụ trách', type: 'ref', ref: 'nhan_vien' },
      { name: 'ghi_chu', label: 'Ghi chú', type: 'textarea', inList: false },
    ],
    optionLabel: (r) => r.ten_khach_hang,
  },
  {
    key: 'tien_dien', table: 'tien_dien', module: 'TIEN_DIEN', title: 'Tiền điện', singular: 'công tơ',
    sideFilter: 'id_khach_thue',
    searchFields: ['ma_cong_to', 'ten_cong_to', 'ten_khach_thue', 'tang'], orderBy: { column: 'ky', ascending: false },
    fields: [
      { name: 'ky', label: 'Kỳ', type: 'month', required: true },
      { name: 'ngay_chot', label: 'Ngày chốt', type: 'date', inList: false },
      { name: 'id_khach_thue', label: 'Khách thuê', type: 'ref', ref: 'khach_thue' },
      { name: 'id_tang', label: 'Tầng', type: 'ref', ref: 'tang', inList: false },
      { name: 'ma_cong_to', label: 'Mã công tơ', type: 'text', required: true },
      { name: 'ten_cong_to', label: 'Tên công tơ', type: 'text', inList: false },
      { name: 'nhom_hoa_don', label: 'Nhóm hóa đơn', type: 'text', inList: false },
      { name: 'chi_so_cu', label: 'Chỉ số cũ', type: 'number' },
      { name: 'chi_so_moi', label: 'Chỉ số mới', type: 'number' },
      { name: 'so_kwh', label: 'kWh', type: 'number', ro: true },
      { name: 'don_gia', label: 'Đơn giá', type: 'money' },
      { name: 'thanh_tien', label: 'Thành tiền', type: 'money', ro: true },
      { name: 'trang_thai', label: 'Trạng thái', type: 'text', ro: true },
      { name: 'ghi_chu', label: 'Ghi chú', type: 'text', inList: false },
    ],
    optionLabel: (r) => `${r.ky} · ${r.ma_cong_to}`,
    locked: (r) => (r?.trang_thai === 'Đã chốt' ? 'Kỳ đã chốt, không thể sửa hoặc xóa' : null),
    actions: [
      { key: 'tao_ky', label: 'Tạo kỳ mới', perm: 'create', scope: 'page',
        fields: [{ name: 'ky', label: 'Kỳ mới', type: 'month', required: true }, { name: 'don_gia', label: 'Đơn giá (để trống = giữ như kỳ trước)', type: 'money' }] },
      { key: 'chot_ky', label: 'Chốt kỳ', perm: 'approve', scope: 'page',
        fields: [{ name: 'ky', label: 'Kỳ cần chốt', type: 'month', required: true }] },
    ],
  },

  // ───────── DANH MỤC ─────────
  {
    key: 'nhan_vien', table: 'nhan_vien', module: 'DANH_MUC', title: 'Danh bạ nhân viên', singular: 'nhân viên',
    searchFields: ['id', 'ho_ten', 'ten_goi_khac', 'phong_ban', 'dien_thoai', 'email'], orderBy: { column: 'ho_ten', ascending: true },
    fields: [
      { name: 'ho_ten', label: 'Họ tên', type: 'text', required: true },
      { name: 'ten_goi_khac', label: 'Tên gọi khác', type: 'text', inList: false },
      { name: 'phong_ban', label: 'Phòng ban', type: 'text' },
      { name: 'chuc_vu', label: 'Chức vụ', type: 'text' },
      { name: 'dien_thoai', label: 'Điện thoại', type: 'text' },
      { name: 'email', label: 'Email', type: 'email' },
      { name: 'doi_pccc', label: 'Đội PCCC', type: 'bool', default: false },
      { name: 'nhiem_vu_pccc', label: 'Nhiệm vụ PCCC', type: 'text', inList: false },
      { name: 'trang_thai', label: 'Trạng thái', type: 'select', options: ACTIVE, default: 'Hoạt động' },
      { name: 'ghi_chu', label: 'Ghi chú', type: 'textarea', inList: false },
    ],
    optionLabel: (r) => r.ho_ten,
  },
  {
    key: 'nha_thau', table: 'nha_thau', module: 'DANH_MUC', title: 'Danh bạ nhà thầu', singular: 'nhà thầu',
    searchFields: ['ten_cong_ty', 'nguoi_lien_he', 'dien_thoai', 'linh_vuc'], orderBy: { column: 'ten_cong_ty', ascending: true },
    fields: [
      { name: 'ten_cong_ty', label: 'Tên công ty', type: 'text', required: true },
      { name: 'linh_vuc', label: 'Lĩnh vực', type: 'text' },
      { name: 'nguoi_lien_he', label: 'Người liên hệ', type: 'text' },
      { name: 'dien_thoai', label: 'Điện thoại', type: 'text' },
      { name: 'email', label: 'Email', type: 'email' },
      { name: 'ma_so_thue', label: 'MST', type: 'text', inList: false },
      { name: 'dia_chi', label: 'Địa chỉ', type: 'text', inList: false },
      { name: 'trang_thai', label: 'Trạng thái', type: 'select', options: ACTIVE, default: 'Hoạt động' },
      { name: 'ghi_chu', label: 'Ghi chú', type: 'textarea', inList: false },
    ],
    optionLabel: (r) => r.ten_cong_ty,
  },
  {
    key: 'nha_cung_cap', table: 'nha_cung_cap', module: 'DANH_MUC', title: 'Danh bạ nhà cung cấp', singular: 'nhà cung cấp',
    searchFields: ['ten_nha_cung_cap', 'nguoi_lien_he', 'dien_thoai'], orderBy: { column: 'ten_nha_cung_cap', ascending: true },
    fields: [
      { name: 'ten_nha_cung_cap', label: 'Tên nhà cung cấp', type: 'text', required: true },
      { name: 'nguoi_lien_he', label: 'Người liên hệ', type: 'text' },
      { name: 'dien_thoai', label: 'Điện thoại', type: 'text' },
      { name: 'email', label: 'Email', type: 'email' },
      { name: 'ma_so_thue', label: 'MST', type: 'text', inList: false },
      { name: 'dia_chi', label: 'Địa chỉ', type: 'text', inList: false },
      { name: 'trang_thai', label: 'Trạng thái', type: 'select', options: ACTIVE, default: 'Hoạt động' },
      { name: 'ghi_chu', label: 'Ghi chú', type: 'textarea', inList: false },
    ],
    optionLabel: (r) => r.ten_nha_cung_cap,
  },
  {
    key: 'hang_muc_bao_tri', table: 'hang_muc_bao_tri', module: 'DANH_MUC', title: 'Chu kỳ bảo trì', singular: 'hạng mục',
    searchFields: ['id', 'ten_hang_muc', 'nhom'], orderBy: { column: 'ten_hang_muc', ascending: true },
    fields: [
      { name: 'ten_hang_muc', label: 'Tên hạng mục', type: 'text', required: true },
      { name: 'nhom', label: 'Nhóm', type: 'text' },
      { name: 'chu_ky_mac_dinh', label: 'Chu kỳ mặc định (ngày)', type: 'number' },
      { name: 'canh_bao_truoc_ngay', label: 'Cảnh báo trước (ngày)', type: 'number', default: 7 },
      { name: 'ap_dung_loai_khu_vuc', label: 'Áp dụng loại khu vực', type: 'text' },
      { name: 'trang_thai', label: 'Trạng thái', type: 'select', options: ACTIVE, default: 'Hoạt động' },
      { name: 'ghi_chu', label: 'Ghi chú', type: 'textarea', inList: false },
    ],
    optionLabel: (r) => r.ten_hang_muc,
  },
  {
    key: 'khu_vuc', table: 'khu_vuc', module: 'DANH_MUC', title: 'Khu vực tòa nhà', singular: 'khu vực',
    searchFields: ['id', 'ma_khu_vuc', 'tang', 'ten_khu_vuc', 'loai_khu_vuc'], orderBy: { column: 'tang', ascending: true },
    fields: [
      { name: 'ma_khu_vuc', label: 'Mã khu vực', type: 'text' },
      { name: 'tang', label: 'Tầng', type: 'text' },
      { name: 'ten_khu_vuc', label: 'Khu vực', type: 'text', required: true },
      { name: 'loai_khu_vuc', label: 'Loại khu vực', type: 'text' },
      { name: 'trang_thai', label: 'Trạng thái', type: 'select', options: ACTIVE, default: 'Hoạt động' },
      { name: 'ghi_chu', label: 'Ghi chú', type: 'textarea', inList: false },
    ],
    optionLabel: (r) => `${r.tang ? r.tang + ' · ' : ''}${r.ten_khu_vuc}`,
  },
  {
    key: 'chi_tiet_van_hanh', table: 'chi_tiet_van_hanh', module: 'DANH_MUC', title: 'Chi tiết vận hành, kiểm tra thiết bị', singular: 'hạng mục vận hành',
    searchFields: ['nhom_he_thong', 'hang_muc_thiet_bi', 'noi_dung_kiem_tra'], orderBy: { column: 'stt_nhom', ascending: true },
    fields: [
      { name: 'stt_nhom', label: 'STT', type: 'number' },
      { name: 'nhom_he_thong', label: 'Nhóm hệ thống', type: 'text', required: true },
      { name: 'hang_muc_thiet_bi', label: 'Hạng mục thiết bị', type: 'text', required: true },
      { name: 'noi_dung_kiem_tra', label: 'Nội dung kiểm tra', type: 'textarea' },
      { name: 'tan_suat', label: 'Tần suất', type: 'text' },
      { name: 'chu_ky_ngay', label: 'Chu kỳ (ngày)', type: 'number', inList: false },
      { name: 'van_ban_theo_doi', label: 'Văn bản theo dõi', type: 'text', inList: false },
      { name: 'trang_thai', label: 'Trạng thái', type: 'select', options: ACTIVE, default: 'Hoạt động', inList: false },
      { name: 'ghi_chu', label: 'Ghi chú', type: 'textarea', inList: false },
    ],
    optionLabel: (r) => r.hang_muc_thiet_bi,
  },

  // ───────── HỆ THỐNG ─────────
  {
    key: 'users', table: 'users', module: 'NGUOI_SU_DUNG', title: 'Người dùng', singular: 'tài khoản',
    searchFields: ['ho_ten', 'email'], orderBy: { column: 'ho_ten', ascending: true },
    fields: [
      { name: 'ho_ten', label: 'Họ tên', type: 'text', required: true },
      { name: 'email', label: 'Email đăng nhập', type: 'email', required: true },
      { name: 'password', label: 'Mật khẩu (tối thiểu 8 ký tự)', type: 'password', required: true, createOnly: true },
      { name: 'id_nhan_vien', label: 'Nhân viên', type: 'ref', ref: 'nhan_vien' },
      { name: 'id_vai_tro', label: 'Vai trò', type: 'ref', ref: 'vai_tro', required: true },
      { name: 'trang_thai', label: 'Trạng thái', type: 'select', options: ['Hoạt động', 'Khóa'], default: 'Hoạt động' },
    ],
    optionLabel: (r) => r.ho_ten || r.email,
  },
  {
    key: 'vai_tro', table: 'vai_tro', module: 'VAI_TRO', title: 'Vai trò', singular: 'vai trò',
    searchFields: ['id', 'ten_vai_tro'], orderBy: { column: 'id', ascending: true },
    fields: [
      { name: 'ten_vai_tro', label: 'Tên vai trò', type: 'text', required: true },
      { name: 'mo_ta', label: 'Mô tả', type: 'text' },
      { name: 'sieu_quan_tri', label: 'Toàn quyền (Super Admin)', type: 'bool', default: false },
    ],
    optionLabel: (r) => `${r.id} · ${r.ten_vai_tro}`,
  },
  {
    key: 'phan_quyen', table: 'phan_quyen', module: 'PHAN_QUYEN', title: 'Phân quyền', singular: 'dòng phân quyền',
    searchFields: ['module'], orderBy: { column: 'id_vai_tro', ascending: true },
    fields: [
      { name: 'id_vai_tro', label: 'Vai trò', type: 'ref', ref: 'vai_tro', required: true },
      { name: 'module', label: 'Module', type: 'select', options: MODULES.map((m) => m.key), required: true },
      { name: 'xem', label: 'Xem', type: 'bool', default: true },
      { name: 'them', label: 'Thêm', type: 'bool', default: false },
      { name: 'sua', label: 'Sửa', type: 'bool', default: false },
      { name: 'xoa', label: 'Xóa', type: 'bool', default: false },
      { name: 'duyet', label: 'Duyệt', type: 'bool', default: false },
    ],
    optionLabel: (r) => r.id,
  },
]

export const getResource = (key: string) => RESOURCES.find((r) => r.key === key)

export interface NavItem { label: string; href: string; resource?: string; module: string }
export const NAV: { group: string; items: NavItem[] }[] = [
  { group: 'Công việc', items: [
    { label: 'Công việc', href: '/cong_viec', resource: 'cong_viec', module: 'CONG_VIEC' },
    { label: 'Công việc hằng ngày', href: '/cong_viec_hang_ngay', resource: 'cong_viec_hang_ngay', module: 'CVHN' },
    { label: 'Khách ra/vào', href: '/khach_ra_vao', resource: 'khach_ra_vao', module: 'KHACH_RA_VAO' },
    { label: 'Báo cáo tiến độ', href: '/bao-cao-tien-do', module: 'CONG_VIEC' },
  ] },
  { group: 'Bảo trì', items: [
    { label: 'Nhật ký bảo trì', href: '/nhat_ky_bao_tri', resource: 'nhat_ky_bao_tri', module: 'BAO_TRI' },
    { label: 'Kế hoạch bảo trì', href: '/lich_bao_tri', resource: 'lich_bao_tri', module: 'BAO_TRI' },
  ] },
  { group: 'Đề xuất', items: [
    { label: 'Đề xuất mua vật tư', href: '/de_xuat?loai_de_xuat=MUA_VAT_TU', resource: 'de_xuat', module: 'DE_XUAT' },
    { label: 'Đề xuất mua thiết bị', href: '/de_xuat?loai_de_xuat=MUA_THIET_BI', resource: 'de_xuat', module: 'DE_XUAT' },
    { label: 'Đề xuất bảo trì', href: '/de_xuat?loai_de_xuat=BAO_TRI', resource: 'de_xuat', module: 'DE_XUAT' },
    { label: 'Đề xuất thanh lý', href: '/de_xuat?loai_de_xuat=THANH_LY', resource: 'de_xuat', module: 'DE_XUAT' },
  ] },
  { group: 'Thiết bị & kho', items: [
    { label: 'Kho vật tư', href: '/vat_tu', resource: 'vat_tu', module: 'KHO' },
    { label: 'Lịch sử nhập xuất', href: '/nhap_xuat_kho', resource: 'nhap_xuat_kho', module: 'KHO' },
    { label: 'Thiết bị đang dùng', href: '/thiet_bi?trang_thai=Đang sử dụng', resource: 'thiet_bi', module: 'THIET_BI' },
    { label: 'Kho thiết bị', href: '/thiet_bi?trang_thai=Trong kho', resource: 'thiet_bi', module: 'THIET_BI' },
    { label: 'Tất cả thiết bị', href: '/thiet_bi', resource: 'thiet_bi', module: 'THIET_BI' },
    { label: 'Thu hồi / thanh lý', href: '/thu_hoi', resource: 'thu_hoi', module: 'THU_HOI' },
    { label: 'Lịch sử chuyển', href: '/lich_su_chuyen_thiet_bi', resource: 'lich_su_chuyen_thiet_bi', module: 'THIET_BI' },
  ] },
  { group: 'Cho thuê', items: [
    { label: 'Toà nhà', href: '/toa_nha', resource: 'toa_nha', module: 'QUAN_LY_TANG' },
    { label: 'Tầng / khu cho thuê', href: '/tang', resource: 'tang', module: 'QUAN_LY_TANG' },
    { label: 'Khách đang thuê', href: '/khach_thue', resource: 'khach_thue', module: 'KHACH_THUE' },
    { label: 'Khách hàng tiềm năng', href: '/khach_hang_tiem_nang', resource: 'khach_hang_tiem_nang', module: 'KHACH_HANG_TIEM_NANG' },
    { label: 'Tiền điện', href: '/tien_dien', resource: 'tien_dien', module: 'TIEN_DIEN' },
  ] },
  { group: 'Danh mục', items: [
    { label: 'Đội PCCC', href: '/nhan_vien?doi_pccc=true', resource: 'nhan_vien', module: 'DANH_MUC' },
    { label: 'Danh bạ nhân viên', href: '/nhan_vien', resource: 'nhan_vien', module: 'DANH_MUC' },
    { label: 'Danh bạ nhà thầu', href: '/nha_thau', resource: 'nha_thau', module: 'DANH_MUC' },
    { label: 'Danh bạ nhà cung cấp', href: '/nha_cung_cap', resource: 'nha_cung_cap', module: 'DANH_MUC' },
    { label: 'Chu kỳ bảo trì', href: '/hang_muc_bao_tri', resource: 'hang_muc_bao_tri', module: 'DANH_MUC' },
    { label: 'Khu vực tòa nhà', href: '/khu_vuc', resource: 'khu_vuc', module: 'DANH_MUC' },
    { label: 'Chi tiết vận hành', href: '/chi_tiet_van_hanh', resource: 'chi_tiet_van_hanh', module: 'DANH_MUC' },
  ] },
  { group: 'Hệ thống', items: [
    { label: 'Người dùng', href: '/users', resource: 'users', module: 'NGUOI_SU_DUNG' },
    { label: 'Vai trò', href: '/vai_tro', resource: 'vai_tro', module: 'VAI_TRO' },
    { label: 'Phân quyền', href: '/phan_quyen', resource: 'phan_quyen', module: 'PHAN_QUYEN' },
  ] },
]

export const visibleInList = (f: Field) =>
  f.inList ?? !(f.type === 'textarea' || f.type === 'password')

export const formatMoney = (n: number | string | null | undefined) =>
  n == null || n === '' ? '' : new Intl.NumberFormat('vi-VN').format(Number(n)) + ' ₫'

export const formatDate = (iso: string | null | undefined) => {
  if (!iso) return ''
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso)
  return m ? `${m[3]}/${m[2]}/${m[1]}` : iso
}
