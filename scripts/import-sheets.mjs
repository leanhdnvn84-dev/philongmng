// Import the V191 Google Sheet into Supabase.
//   1. Google Sheets → File → Download → Microsoft Excel (.xlsx)
//   2. npm run import -- path/to/PHI_LONG.xlsx            (add --dry-run to only report)
// Safe to re-run: rows are upserted by their original ID (CV0001, TB0012…).
import ExcelJS from 'exceljs'
import { createClient } from '@supabase/supabase-js'

const file = process.argv.find((a) => a.endsWith('.xlsx'))
const DRY = process.argv.includes('--dry-run')
const { NEXT_PUBLIC_SUPABASE_URL: url, SUPABASE_SERVICE_ROLE_KEY: key } = process.env
if (!file) { console.error('Dùng: npm run import -- duong_dan/file.xlsx [--dry-run]'); process.exit(1) }
if (!url || !key) { console.error('Thiếu NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY trong .env.local'); process.exit(1) }
const db = createClient(url, key, { auth: { persistSession: false } })

// sheet → table. idCol = the sheet column holding the record ID. rename = sheet header → db column.
const MAP = [
  { sheet: 'VAI_TRO', table: 'vai_tro' },
  { sheet: 'PHAN_QUYEN', table: 'phan_quyen', dedupe: ['id_vai_tro', 'module'] },
  { sheet: 'DM_NHAN_VIEN', table: 'nhan_vien', rename: { SDT: 'dien_thoai', DIEN_THOAI_LIEN_HE: 'dien_thoai' } },
  { sheet: 'DM_NHA_THAU', table: 'nha_thau', rename: { DON_VI: 'ten_cong_ty', TEN_NHA_THAU: 'ten_cong_ty', HO_TEN: 'nguoi_lien_he', SDT: 'dien_thoai', CHUYEN_MON: 'linh_vuc' } },
  { sheet: 'DM_NHA_CUNG_CAP', table: 'nha_cung_cap', rename: { TEN_CONG_TY: 'ten_nha_cung_cap', SDT: 'dien_thoai' } },
  { sheet: 'DM_KHU_VUC_TOA_NHA', table: 'khu_vuc', rename: { KHU_VUC: 'ten_khu_vuc', TEN_KHU_VUC: 'ten_khu_vuc' } },
  { sheet: 'DM_HANG_MUC_BAO_TRI', table: 'hang_muc_bao_tri', idCol: 'ID_HANG_MUC', rename: { HANG_MUC: 'ten_hang_muc' } },
  { sheet: 'CHI_TIET_VAN_HANH', table: 'chi_tiet_van_hanh', idCol: 'ID_HANG_MUC' },
  { sheet: 'DM_LICH_BAO_TRI', table: 'lich_bao_tri', idCol: 'ID_LICH' },
  { sheet: 'NHAT_KY_BAO_TRI', table: 'nhat_ky_bao_tri', rename: { NOI_DUNG: 'noi_dung_thuc_hien' } },
  { sheet: 'CONG_VIEC', table: 'cong_viec' },
  { sheet: /^CVHN(_\d{4})?$/, table: 'cong_viec_hang_ngay' },
  { sheet: 'KHACH_RA_VAO', table: 'khach_ra_vao' },
  { sheet: 'VAT_TU', table: 'vat_tu', rename: { DON_VI_TINH: 'dvt' } },
  { sheet: 'NHAP_XUAT_KHO', table: 'nhap_xuat_kho' },
  { sheet: 'THIET_BI', table: 'thiet_bi' },
  { sheet: 'THU_HOI', table: 'thu_hoi' },
  { sheet: 'LICH_SU_CHUYEN_THIET_BI', table: 'lich_su_chuyen_thiet_bi' },
  { sheet: 'DE_XUAT', table: 'de_xuat' },
  { sheet: 'DE_XUAT_MUA_VAT_TU', table: 'de_xuat_chi_tiet', kind: 'MUA_VAT_TU' },
  { sheet: 'DE_XUAT_MUA', table: 'de_xuat_chi_tiet', kind: 'MUA_THIET_BI', rename: { TEN_THIET_BI: 'ten' } },
  { sheet: 'DE_XUAT_BAO_TRI', table: 'de_xuat_chi_tiet', kind: 'BAO_TRI', rename: { HANG_MUC: 'ten', NOI_DUNG: 'ten' } },
  { sheet: 'DE_XUAT_THANH_LY', table: 'de_xuat_chi_tiet', kind: 'THANH_LY', rename: { TEN_THIET_BI: 'ten' } },
  { sheet: 'QUAN_LY_TOA_NHA', table: 'toa_nha', rename: { TEN: 'ten_toa_nha', DIA_CHI: 'dia_chi_toa_nha' } },
  { sheet: 'QUAN_LY_TANG', table: 'tang', rename: { TANG_KHU_VUC: 'ten_tang', TANG: 'ten_tang' } },
  { sheet: 'KHACH_THUE', table: 'khach_thue', rename: { NGAY_BAT_DAU_THUE: 'ngay_bat_dau', NGAY_KET_THUC_THUE: 'ngay_ket_thuc' } },
  { sheet: 'KHACH_HANG_TIEM_NANG', table: 'khach_hang_tiem_nang' },
  { sheet: 'TIEN_DIEN', table: 'tien_dien' },
]
// order matters for foreign keys: parents first (same order as MAP)
const ORDER = [...new Set(MAP.map((m) => m.table))]

const TRUE = new Set(['true', '1', 'x', 'có', 'co', 'yes', 'y', 'v', '✓', 'đúng', 'hoạt động', 'hoat dong', 'hoat_dong'])
const norm = (s) => String(s ?? '').trim().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/gi, 'd').toUpperCase().replace(/[^A-Z0-9]+/g, '_').replace(/^_|_$/g, '')

function cellValue(v) {
  if (v == null) return null
  if (v instanceof Date) return v
  if (typeof v === 'object') {
    if ('result' in v) return cellValue(v.result)          // formula
    if ('richText' in v) return v.richText.map((t) => t.text).join('')
    if ('text' in v) return v.text                         // hyperlink
    if ('error' in v) return null
  }
  return v
}
function toDate(v) {
  if (v instanceof Date) return isNaN(v) ? null : v.toISOString().slice(0, 10)
  const s = String(v).trim()
  let m = /^(\d{4})-(\d{1,2})-(\d{1,2})/.exec(s)
  if (m) return `${m[1]}-${m[2].padStart(2, '0')}-${m[3].padStart(2, '0')}`
  m = /^(\d{1,2})[/.-](\d{1,2})[/.-](\d{2,4})/.exec(s) // dd/mm/yyyy (Vietnamese)
  if (m) { const y = m[3].length === 2 ? '20' + m[3] : m[3]; return `${y}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}` }
  return undefined
}
function toNum(v) {
  if (typeof v === 'number') return v
  let s = String(v).replace(/\s|₫|đ|vnd/gi, '')
  if (/^-?\d{1,3}(\.\d{3})+(,\d+)?$/.test(s)) s = s.replace(/\./g, '').replace(',', '.') // 1.234.567,5
  else if (/^-?\d+,\d+$/.test(s)) s = s.replace(',', '.')
  const n = Number(s)
  return Number.isFinite(n) ? n : undefined
}
function toTime(v) {
  if (v instanceof Date) return `${String(v.getUTCHours()).padStart(2, '0')}:${String(v.getUTCMinutes()).padStart(2, '0')}`
  return String(v).trim()
}

async function columns(table) {
  const { data, error } = await db.rpc('import_table_columns', { p_table: table })
  if (error) throw new Error(`Không đọc được cấu trúc bảng ${table}. Đã chạy src/db/schema.sql chưa? ${error.message}`)
  return new Map(data.map((c) => [c.column_name, c]))
}

const wb = new ExcelJS.Workbook()
await wb.xlsx.readFile(file)
const known = new Map() // table -> Set(ids) for FK checks
const report = []

for (const table of ORDER) {
  const cols = await columns(table)
  const ids = new Set()
  if (!known.has(table)) {
    // existing rows also satisfy foreign keys
    const { data } = await db.from(table).select('id').limit(100000)
    for (const r of data ?? []) ids.add(String(r.id))
  }
  for (const m of MAP.filter((x) => x.table === table)) {
    const sheets = wb.worksheets.filter((ws) => (m.sheet instanceof RegExp ? m.sheet.test(ws.name) : ws.name === m.sheet))
    for (const ws of sheets) {
      const header = (ws.getRow(1).values ?? []).map((h) => norm(cellValue(h)))
      const rows = []
      let skipped = 0, movedToExtra = 0
      ws.eachRow({ includeEmpty: false }, (row, n) => {
        if (n === 1) return
        const rec = { extra: {} }
        header.forEach((h, i) => {
          if (!h) return
          let v = cellValue(row.getCell(i).value)
          if (v === null || v === '') return
          let col = (m.rename?.[h] ?? (h === (m.idCol ?? 'ID') ? 'id' : h.toLowerCase()))
          if (h === 'ID' && m.idCol && m.idCol !== 'ID') col = 'id_cu' // the real id is idCol
          const meta = cols.get(col)
          if (!meta || meta.is_generated || col === 'extra' || col === 'created_at' || col === 'updated_at') { rec.extra[h] = v instanceof Date ? v.toISOString() : v; return }
          const t = meta.data_type
          let out
          if (t === 'date') out = toDate(v)
          else if (t === 'numeric' || t === 'integer' || t === 'bigint') { out = toNum(v); if (out !== undefined && t !== 'numeric') out = Math.round(out) }
          else if (t === 'boolean') out = TRUE.has(String(v).trim().toLowerCase())
          else if (col.startsWith('gio')) out = toTime(v)
          else out = v instanceof Date ? v.toISOString().slice(0, 10) : String(v).trim()
          if (out === undefined) { rec.extra[h] = String(v); movedToExtra++; return }
          if (rec[col] === undefined) rec[col] = out
        })
        if (!rec.id) { skipped++; return }
        rec.id = String(rec.id).trim()
        if (m.kind) { rec.extra.LOAI_DE_XUAT = m.kind; rec.ten ??= null }
        // V191 value variants → the values the new app uses
        const ext = (k) => rec.extra[k] ?? ''
        if (table === 'khach_ra_vao' && rec.trang_thai) {
          const t = norm(rec.trang_thai)
          rec.trang_thai = t.includes('HUY') ? 'Hủy' : t.includes('HEN') ? 'Hẹn trước' : (t.includes('DANG') || t.includes('TRONG')) ? 'Đang trong tòa nhà' : t.includes('RA') ? 'Đã ra' : rec.trang_thai
        }
        if (table === 'tien_dien' && rec.trang_thai) {
          const t = norm(rec.trang_thai)
          rec.trang_thai = t === 'DA_CHOT' ? 'Đã chốt' : t === 'NHAP' ? 'Nháp' : rec.trang_thai
        }
        if (table === 'cong_viec_hang_ngay' && !rec.trang_thai && norm(ext('KET_QUA')) === 'DA_XONG') rec.trang_thai = 'Hoàn thành'
        if ((table === 'cong_viec' || table === 'cong_viec_hang_ngay') && /^NT\d+$/.test(String(rec.id_nguoi_thuc_hien ?? '')) && !known.get('nhan_vien')?.has(String(rec.id_nguoi_thuc_hien))) {
          rec.id_nha_thau ??= rec.id_nguoi_thuc_hien // V191 sometimes stored a contractor code as the performer
          rec.id_nguoi_thuc_hien = null
        }
        if (table === 'nhap_xuat_kho' && rec.loai_giao_dich) rec.loai_giao_dich = norm(rec.loai_giao_dich).startsWith('NHAP') ? 'NHAP' : 'XUAT'
        if (table === 'de_xuat' && rec.loai_de_xuat) rec.loai_de_xuat = norm(rec.loai_de_xuat).replace(/^DE_XUAT_/, '').replace(/^MUA$/, 'MUA_THIET_BI')
        // dangling references (deleted employee, area…) → keep the value in extra instead of failing
        for (const [c, meta] of cols) {
          if (!meta.fk_table || rec[c] == null || meta.fk_table === 'users') continue
          const target = known.get(meta.fk_table)
          if (target && !target.has(String(rec[c]))) { rec.extra[`${c.toUpperCase()}_KHONG_TON_TAI`] = rec[c]; rec[c] = null; movedToExtra++ }
        }
        // NOT NULL columns without a value get a readable placeholder
        if (table === 'de_xuat' && !rec.loai_de_xuat) rec.loai_de_xuat = 'MUA_VAT_TU'
        rows.push(rec)
      })
      // drop rows whose required parent is missing (e.g. log for a deleted area)
      const required = { nhat_ky_bao_tri: ['id_khu_vuc', 'id_hang_muc', 'ngay_thuc_hien'], lich_bao_tri: ['id_khu_vuc', 'id_hang_muc'],
        de_xuat_chi_tiet: ['id_de_xuat'], nhap_xuat_kho: ['id_vat_tu', 'loai_giao_dich', 'so_luong'], thu_hoi: ['id_thiet_bi'],
        lich_su_chuyen_thiet_bi: ['id_thiet_bi'], phan_quyen: ['id_vai_tro', 'module'], tien_dien: ['ky', 'ma_cong_to'] }[table] ?? []
      let good = rows.filter((r) => required.every((c) => r[c] != null && r[c] !== ''))
      if (m.dedupe) { // keep the last row for each natural key (later edits win)
        const byKey = new Map(); for (const r of good) byKey.set(m.dedupe.map((c) => r[c]).join('|'), r); good = [...byKey.values()]
      }
      const dropped = rows.length - good.length
      let saved = good
      if (!DRY) {
        // send rows grouped by their exact set of columns: a column that is blank in the sheet is
        // left out, so new rows get the database default and re-imports never blank existing data
        const groups = new Map()
        for (const r of good) {
          const sig = Object.keys(r).sort().join(',')
          if (!groups.has(sig)) groups.set(sig, [])
          groups.get(sig).push(r)
        }
        saved = []
        for (const batch of groups.values()) {
          for (let i = 0; i < batch.length; i += 500) {
            const part = batch.slice(i, i + 500)
            const { error } = await db.from(table).upsert(part, { onConflict: 'id' })
            if (error) { console.error(`✗ ${ws.name} → ${table}: ${error.message}`); process.exitCode = 1; continue }
            saved.push(...part)
          }
        }
      }
      saved.forEach((r) => ids.add(r.id)) // only rows really stored satisfy later foreign keys
      report.push({ sheet: ws.name, table, rows: saved.length, skipped_no_id: skipped, dropped_missing_parent: dropped, values_to_extra: movedToExtra })
    }
  }
  known.set(table, ids)
}

const mapped = new Set(report.map((r) => r.sheet))
const unmapped = wb.worksheets.map((w) => w.name).filter((n) => !mapped.has(n))
if (!DRY) { const { error } = await db.rpc('sync_id_sequences'); if (error) console.error('sync_id_sequences:', error.message) }
console.table(report)
if (unmapped.length) console.log('Sheet không nhập (không có bảng tương ứng):', unmapped.join(', '))
console.log(DRY ? 'Chạy thử xong, chưa ghi gì.' : 'Nhập xong. Tài khoản đăng nhập cần tạo lại trong mục Người dùng (mật khẩu cũ không chuyển được).')
