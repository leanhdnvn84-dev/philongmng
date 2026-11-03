// Single source of truth for every managed entity. Used by the API (whitelisting,
// search, permissions) and by the UI (tables, forms, navigation).

export type FieldType = 'text' | 'email' | 'number' | 'date' | 'textarea' | 'select' | 'ref' | 'password'

export interface Field {
  name: string
  label: string
  type: FieldType
  required?: boolean
  options?: { value: string; label: string }[] // for 'select'
  ref?: string // for 'ref': resource key whose rows are the choices
  default?: string | number
  createOnly?: boolean // shown only when creating (e.g. password); never stored in the table
  inList?: boolean // show as column (default true except textarea/password)
}

export interface Resource {
  key: string
  table: string
  module: string
  title: string
  singular: string
  icon: string
  group: string
  nav?: boolean
  readonly?: boolean
  searchFields: string[]
  orderBy: { column: string; ascending: boolean }
  fields: Field[]
  /** PostgREST select used to build dropdown labels */
  optionSelect?: string
  optionLabel: (row: any) => string
}

export const MODULES: { key: string; label: string }[] = [
  { key: 'buildings', label: 'Tòa nhà & phòng' },
  { key: 'tenants', label: 'Khách thuê' },
  { key: 'contracts', label: 'Hợp đồng' },
  { key: 'maintenance', label: 'Bảo trì' },
  { key: 'equipment', label: 'Thiết bị & kho' },
  { key: 'personnel', label: 'Nhà thầu & NCC' },
  { key: 'system', label: 'Hệ thống' },
]

const opts = (pairs: [string, string][]) => pairs.map(([value, label]) => ({ value, label }))

export const RESOURCES: Resource[] = [
  {
    key: 'buildings', table: 'buildings', module: 'buildings', title: 'Tòa nhà', singular: 'tòa nhà',
    icon: '🏢', group: 'Tòa nhà',
    searchFields: ['name', 'address', 'city'],
    orderBy: { column: 'name', ascending: true },
    fields: [
      { name: 'name', label: 'Tên tòa nhà', type: 'text', required: true },
      { name: 'address', label: 'Địa chỉ', type: 'text', required: true },
      { name: 'city', label: 'Thành phố', type: 'text' },
      { name: 'phone', label: 'Điện thoại', type: 'text' },
      { name: 'total_floors', label: 'Số tầng', type: 'number' },
      { name: 'manager_id', label: 'Quản lý', type: 'ref', ref: 'users' },
    ],
    optionLabel: (r) => r.name,
  },
  {
    key: 'floors', table: 'floors', module: 'buildings', title: 'Tầng', singular: 'tầng',
    icon: '🪜', group: 'Tòa nhà',
    searchFields: [],
    orderBy: { column: 'floor_no', ascending: true },
    fields: [
      { name: 'building_id', label: 'Tòa nhà', type: 'ref', ref: 'buildings', required: true },
      { name: 'floor_no', label: 'Tầng số', type: 'number', required: true },
      { name: 'total_rooms', label: 'Số phòng', type: 'number' },
    ],
    optionSelect: '*, buildings(name)',
    optionLabel: (r) => `${r.buildings?.name ?? '?'} - Tầng ${r.floor_no}`,
  },
  {
    key: 'rooms', table: 'rooms', module: 'buildings', title: 'Phòng', singular: 'phòng',
    icon: '🚪', group: 'Tòa nhà',
    searchFields: ['room_no', 'type'],
    orderBy: { column: 'room_no', ascending: true },
    fields: [
      { name: 'floor_id', label: 'Tầng', type: 'ref', ref: 'floors', required: true },
      { name: 'room_no', label: 'Số phòng', type: 'text', required: true },
      { name: 'size', label: 'Diện tích (m²)', type: 'number' },
      { name: 'type', label: 'Loại', type: 'text' },
      {
        name: 'status', label: 'Trạng thái', type: 'select', default: 'available',
        options: opts([['available', 'Trống'], ['occupied', 'Đang thuê'], ['maintenance', 'Bảo trì']]),
      },
    ],
    optionSelect: '*, floors(floor_no, buildings(name))',
    optionLabel: (r) => `${r.floors?.buildings?.name ?? '?'} - T${r.floors?.floor_no ?? '?'} - P.${r.room_no}`,
  },
  {
    key: 'tenants', table: 'tenants', module: 'tenants', title: 'Khách thuê', singular: 'khách thuê',
    icon: '👥', group: 'Khách thuê & hợp đồng',
    searchFields: ['name', 'phone', 'email', 'id_number'],
    orderBy: { column: 'name', ascending: true },
    fields: [
      { name: 'name', label: 'Họ tên / Công ty', type: 'text', required: true },
      { name: 'phone', label: 'Điện thoại', type: 'text' },
      { name: 'email', label: 'Email', type: 'email' },
      { name: 'id_number', label: 'CCCD / MST', type: 'text' },
      { name: 'status', label: 'Trạng thái', type: 'select', default: 'active', options: opts([['active', 'Hoạt động'], ['inactive', 'Ngừng']]) },
    ],
    optionLabel: (r) => r.name,
  },
  {
    key: 'contracts', table: 'contracts', module: 'contracts', title: 'Hợp đồng', singular: 'hợp đồng',
    icon: '📋', group: 'Khách thuê & hợp đồng',
    searchFields: [],
    orderBy: { column: 'end_date', ascending: true },
    fields: [
      { name: 'tenant_id', label: 'Khách thuê', type: 'ref', ref: 'tenants', required: true },
      { name: 'room_id', label: 'Phòng', type: 'ref', ref: 'rooms', required: true },
      { name: 'start_date', label: 'Ngày bắt đầu', type: 'date', required: true },
      { name: 'end_date', label: 'Ngày kết thúc', type: 'date', required: true },
      { name: 'monthly_fee', label: 'Phí thuê / tháng (VND)', type: 'number', required: true },
      { name: 'deposit', label: 'Tiền cọc (VND)', type: 'number' },
      { name: 'status', label: 'Trạng thái', type: 'select', default: 'active', options: opts([['active', 'Hiệu lực'], ['expired', 'Hết hạn'], ['terminated', 'Đã chấm dứt']]) },
    ],
    optionLabel: (r) => r.id,
  },
  {
    key: 'maintenance', table: 'maintenance_jobs', module: 'maintenance', title: 'Bảo trì', singular: 'công việc bảo trì',
    icon: '🔧', group: 'Vận hành',
    searchFields: ['title', 'description'],
    orderBy: { column: 'created_at', ascending: false },
    fields: [
      { name: 'title', label: 'Tiêu đề', type: 'text', required: true },
      { name: 'room_id', label: 'Phòng', type: 'ref', ref: 'rooms' },
      { name: 'assigned_to', label: 'Người phụ trách', type: 'ref', ref: 'users' },
      { name: 'priority', label: 'Ưu tiên', type: 'select', default: 'medium', options: opts([['low', 'Thấp'], ['medium', 'Trung bình'], ['high', 'Cao']]) },
      { name: 'status', label: 'Trạng thái', type: 'select', default: 'pending', options: opts([['pending', 'Chờ xử lý'], ['in_progress', 'Đang làm'], ['completed', 'Hoàn thành']]) },
      { name: 'description', label: 'Mô tả', type: 'textarea' },
    ],
    optionLabel: (r) => r.title,
  },
  {
    key: 'equipment', table: 'equipment', module: 'equipment', title: 'Thiết bị', singular: 'thiết bị',
    icon: '⚙️', group: 'Vận hành',
    searchFields: ['name', 'category', 'serial_number', 'location'],
    orderBy: { column: 'name', ascending: true },
    fields: [
      { name: 'name', label: 'Tên thiết bị', type: 'text', required: true },
      { name: 'category', label: 'Nhóm', type: 'text' },
      { name: 'quantity', label: 'Số lượng', type: 'number', default: 1 },
      { name: 'unit', label: 'Đơn vị', type: 'text' },
      { name: 'location', label: 'Vị trí', type: 'text' },
      { name: 'serial_number', label: 'Số serial', type: 'text' },
      { name: 'purchase_date', label: 'Ngày mua', type: 'date' },
      { name: 'status', label: 'Trạng thái', type: 'select', default: 'available', options: opts([['available', 'Sẵn sàng'], ['in_use', 'Đang dùng'], ['damaged', 'Hỏng']]) },
    ],
    optionLabel: (r) => r.name,
  },
  {
    key: 'contractors', table: 'contractors', module: 'personnel', title: 'Nhà thầu', singular: 'nhà thầu',
    icon: '🧰', group: 'Đối tác',
    searchFields: ['name', 'phone', 'email', 'specialty'],
    orderBy: { column: 'name', ascending: true },
    fields: [
      { name: 'name', label: 'Tên', type: 'text', required: true },
      { name: 'specialty', label: 'Chuyên môn', type: 'text' },
      { name: 'phone', label: 'Điện thoại', type: 'text' },
      { name: 'email', label: 'Email', type: 'email' },
      { name: 'status', label: 'Trạng thái', type: 'select', default: 'active', options: opts([['active', 'Hoạt động'], ['inactive', 'Ngừng']]) },
    ],
    optionLabel: (r) => r.name,
  },
  {
    key: 'suppliers', table: 'suppliers', module: 'personnel', title: 'Nhà cung cấp', singular: 'nhà cung cấp',
    icon: '🚚', group: 'Đối tác',
    searchFields: ['name', 'phone', 'email', 'address'],
    orderBy: { column: 'name', ascending: true },
    fields: [
      { name: 'name', label: 'Tên', type: 'text', required: true },
      { name: 'phone', label: 'Điện thoại', type: 'text' },
      { name: 'email', label: 'Email', type: 'email' },
      { name: 'address', label: 'Địa chỉ', type: 'text' },
      { name: 'status', label: 'Trạng thái', type: 'select', default: 'active', options: opts([['active', 'Hoạt động'], ['inactive', 'Ngừng']]) },
    ],
    optionLabel: (r) => r.name,
  },
  {
    key: 'users', table: 'users', module: 'system', title: 'Người dùng', singular: 'người dùng',
    icon: '👤', group: 'Hệ thống',
    searchFields: ['full_name', 'email', 'phone'],
    orderBy: { column: 'full_name', ascending: true },
    fields: [
      { name: 'full_name', label: 'Họ tên', type: 'text', required: true },
      { name: 'email', label: 'Email', type: 'email', required: true },
      { name: 'password', label: 'Mật khẩu (tối thiểu 8 ký tự)', type: 'password', required: true, createOnly: true },
      { name: 'phone', label: 'Điện thoại', type: 'text' },
      { name: 'role_id', label: 'Vai trò', type: 'ref', ref: 'roles', required: true },
      { name: 'status', label: 'Trạng thái', type: 'select', default: 'active', options: opts([['active', 'Hoạt động'], ['inactive', 'Khóa']]) },
    ],
    optionLabel: (r) => r.full_name || r.email,
  },
  {
    key: 'roles', table: 'roles', module: 'system', title: 'Vai trò', singular: 'vai trò',
    icon: '🔑', group: 'Hệ thống', nav: false, readonly: true,
    searchFields: ['name'],
    orderBy: { column: 'name', ascending: true },
    fields: [
      { name: 'name', label: 'Tên', type: 'text', required: true },
      { name: 'description', label: 'Mô tả', type: 'text' },
    ],
    optionLabel: (r) => r.name,
  },
]

export const getResource = (key: string) => RESOURCES.find((r) => r.key === key)

export const visibleInList = (f: Field) => f.inList ?? !(f.type === 'textarea' || f.type === 'password')

export const formatMoney = (n: number | null | undefined) =>
  n == null ? '' : new Intl.NumberFormat('vi-VN').format(Number(n)) + ' ₫'
