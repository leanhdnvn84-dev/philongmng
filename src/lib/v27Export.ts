import 'server-only'
import ExcelJS from 'exceljs'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { BACKUP_TABLES, KEY_OF } from '@/lib/backup'
import template from '@/lib/v27Template.json'

/**
 * Writes the current data back into a workbook shaped like the V191 sheet "PHI_LONG_MANAGEMENT_DATABASE_V27":
 * same sheets, same order, same header row. It is the reverse of scripts/import-sheets.mjs (keep the two maps in step).
 * Columns the new app added are appended after the V27 columns; tables V27 never had get their own sheet at the end.
 */
type M = { sheet: string; table: string; idCol?: string; rename?: Record<string, string>; kind?: string; unpivot?: boolean }
const MAP: M[] = [
  { sheet: 'VAI_TRO', table: 'vai_tro' },
  { sheet: 'PHAN_QUYEN', table: 'phan_quyen' },
  { sheet: 'DM_NHAN_VIEN', table: 'nhan_vien', rename: { SDT: 'dien_thoai', DIEN_THOAI_LIEN_HE: 'dien_thoai' } },
  { sheet: 'DM_NHA_THAU', table: 'nha_thau', rename: { DON_VI: 'ten_cong_ty', TEN_NHA_THAU: 'ten_cong_ty', HO_TEN: 'nguoi_lien_he', SDT: 'dien_thoai', CHUYEN_MON: 'linh_vuc' } },
  { sheet: 'DM_NHA_CUNG_CAP', table: 'nha_cung_cap', rename: { TEN_CONG_TY: 'ten_nha_cung_cap', SDT: 'dien_thoai' } },
  { sheet: 'DM_KHU_VUC_TOA_NHA', table: 'khu_vuc', rename: { KHU_VUC: 'ten_khu_vuc', TEN_KHU_VUC: 'ten_khu_vuc' } },
  { sheet: 'DM_HANG_MUC_BAO_TRI', table: 'hang_muc_bao_tri', idCol: 'ID_HANG_MUC', rename: { HANG_MUC: 'ten_hang_muc' } },
  { sheet: 'CHI_TIET_VAN_HANH', table: 'chi_tiet_van_hanh', idCol: 'ID_HANG_MUC' },
  { sheet: 'DM_LICH_BAO_TRI', table: 'lich_bao_tri', idCol: 'ID_LICH' },
  { sheet: 'NHAT_KY_BAO_TRI', table: 'nhat_ky_bao_tri', rename: { NOI_DUNG: 'noi_dung_thuc_hien' } },
  { sheet: 'CONG_VIEC', table: 'cong_viec' },
  { sheet: 'CVHN_2026', table: 'cong_viec_hang_ngay' },
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
  { sheet: 'LICH_SU_IN', table: 'lich_su_in' },
  { sheet: 'LICH_SU_DANG_NHAP', table: 'lich_su_dang_nhap' },
  { sheet: 'DM_DANH_MUC', table: 'danh_muc', unpivot: true },
  { sheet: 'CAU_HINH_EMAIL_CANH_BAO', table: 'cau_hinh_email_canh_bao' },
  { sheet: 'NHAT_KY_EMAIL_CANH_BAO', table: 'nhat_ky_email_canh_bao', idCol: 'ID_EMAIL' },
  { sheet: 'DATA_AUDIT_ARCHIVE', table: 'data_audit_archive', idCol: 'ID_AUDIT' },
  { sheet: 'HINH_ANH_TIEN_DO', table: 'hinh_anh_tien_do', idCol: 'ID_ANH' },
  // sheets the importer does not read; filled from the closest table (no passwords: they cannot be exported)
  { sheet: 'NGUOI_SU_DUNG', table: 'users', rename: { EMAIL_DANG_NHAP: 'email', NGAY_TAO: 'created_at', NGAY_CAP_NHAT: 'updated_at' } },
  { sheet: 'CHATNOIBO', table: 'tin_nhan', rename: { NGAY_GIO: 'thoi_gian' } },
]

const norm = (s: unknown) => String(s ?? '').trim().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/gi, 'd').toUpperCase().replace(/[^A-Z0-9]+/g, '_').replace(/^_|_$/g, '')
type Col = { column_name: string; data_type: string; is_generated: boolean }

async function fetchAll(table: string) {
  const db = supabaseAdmin(), rows: any[] = []
  for (let from = 0; ; from += 1000) {
    const { data, error } = await db.from(table).select('*').order(KEY_OF[table] ?? 'id').range(from, from + 999)
    if (error) throw new Error(`${table}: ${error.message}`)
    rows.push(...(data ?? []))
    if (!data || data.length < 1000) break
  }
  return rows
}

/** Sheet value + number format for one database value. Dates become real Excel dates (dd/MM/yyyy) like in V27. */
function cell(v: any, type: string): { v: any; fmt?: string } {
  if (v === null || v === undefined || v === '') return { v: null }
  if (type === 'date' && /^\d{4}-\d{2}-\d{2}/.test(String(v))) return { v: new Date(`${String(v).slice(0, 10)}T00:00:00.000Z`), fmt: 'dd/MM/yyyy' }
  if (type.startsWith('timestamp')) {
    const d = new Date(String(v))
    // sheets have no time zone: write Việt Nam wall-clock time
    return isNaN(d.getTime()) ? { v: String(v) } : { v: new Date(d.getTime() + 7 * 3600_000), fmt: 'dd/MM/yyyy HH:mm:ss' }
  }
  if (typeof v === 'object') return { v: JSON.stringify(v) }
  if (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$/.test(v)) { // a date kept as text in `extra`
    const d = new Date(v)
    return /T00:00:00/.test(v) ? { v: d, fmt: 'dd/MM/yyyy' } : { v: d, fmt: 'dd/MM/yyyy HH:mm:ss' }
  }
  return { v }
}

export async function buildV27Workbook() {
  const db = supabaseAdmin()
  const tables = Array.from(new Set([...MAP.map((m) => m.table), ...BACKUP_TABLES]))
  const data: Record<string, any[]> = {}, cols: Record<string, Map<string, Col>> = {}
  await Promise.all(tables.map(async (t) => {
    data[t] = await fetchAll(t)
    const { data: c } = await db.rpc('import_table_columns', { p_table: t })
    cols[t] = new Map(((c ?? []) as Col[]).map((x) => [x.column_name, x]))
  }))
  const names = { nha_thau: new Map(data.nha_thau.map((r) => [r.id, r.ten_cong_ty])), de_xuat: new Map(data.de_xuat.map((r) => [r.id, r.loai_de_xuat])) }

  const wb = new ExcelJS.Workbook()
  wb.creator = 'PHILONG BUILDING'; wb.created = new Date()
  const report: { sheet: string; rows: number }[] = []
  const head = (ws: ExcelJS.Worksheet) => { const r = ws.getRow(1); r.font = { bold: true }; ws.views = [{ state: 'frozen', ySplit: 1 }] }

  // highest number in use per id prefix (CV0098 → CV: 98)
  const maxId = new Map<string, number>()
  for (const tb of tables) for (const r of data[tb]) { const k = /^([A-Z]{1,4})(\d{3,})$/.exec(String(r.id ?? '')); if (k) maxId.set(k[1], Math.max(maxId.get(k[1]) ?? 0, Number(k[2]))) }

  for (const t of template as { sheet: string; headers: string[]; widths: number[]; seq?: [string, string, number][] }[]) {
    const ws = wb.addWorksheet(t.sheet)
    const m = MAP.find((x) => x.sheet === t.sheet)
    if (!m && t.seq) { // V191 id counters: same entities, last number taken from the ids in use now
      ws.addRow(t.headers)
      for (const [entity, prefix, last] of t.seq) ws.addRow([entity, prefix, Math.max(last, maxId.get(prefix) ?? 0), new Date()]).getCell(4).numFmt = 'dd/MM/yyyy'
      head(ws); report.push({ sheet: t.sheet, rows: t.seq.length }); continue
    }
    if (!m) { ws.addRow(t.headers); head(ws); report.push({ sheet: t.sheet, rows: 0 }); continue } // kept as an empty sheet with its headers
    const rows = data[m.table], meta = cols[m.table]

    if (m.unpivot) { // danh_muc rows (loai, gia_tri, thu_tu) → one column per category
      const lists = t.headers.map((h) => rows.filter((r) => r.loai === h).sort((a, b) => (a.thu_tu ?? 0) - (b.thu_tu ?? 0)).map((r) => r.gia_tri))
      const more = Array.from(new Set(rows.map((r) => r.loai))).filter((l) => l && !t.headers.includes(l))
      for (const l of more) lists.push(rows.filter((r) => r.loai === l).sort((a, b) => (a.thu_tu ?? 0) - (b.thu_tu ?? 0)).map((r) => r.gia_tri))
      ws.addRow([...t.headers, ...more])
      for (let i = 0; i < Math.max(0, ...lists.map((l) => l.length)); i++) ws.addRow(lists.map((l) => l[i] ?? null))
      head(ws); report.push({ sheet: t.sheet, rows: rows.length }); continue
    }

    // header → database column (same rule as the importer)
    const colOf = (h: string) => { const n = norm(h); return m.rename?.[n] ?? (n === (m.idCol ?? 'ID') ? 'id' : n === 'ID' && m.idCol ? 'id_cu' : n.toLowerCase()) }
    const used = new Set<string>(), plan = t.headers.map((h) => {
      const n = norm(h), c = colOf(h)
      const real = !!n && meta.has(c) && c !== 'extra'
      const first = real && !used.has(c); if (real) used.add(c) // two V27 headers can share one column: the value goes to the first
      return { h, n, c, real, first }
    })
    // columns only the new app has: appended after the V27 columns so nothing is lost
    const added = Array.from(meta.keys()).filter((c) => !used.has(c) && c !== 'extra' && !(m.table === 'users' && c === 'id_cu'))
    ws.addRow([...t.headers, ...added.map((c) => c.toUpperCase())])

    const list = m.kind ? rows.filter((r) => (r.extra?.LOAI_DE_XUAT ?? names.de_xuat.get(r.id_de_xuat)) === m.kind) : rows
    for (const r of list) {
      const ex = (r.extra ?? {}) as Record<string, any>
      const out: { v: any; fmt?: string }[] = plan.map((p) => {
        if (!p.n) return { v: null }
        if (p.n in ex) return cell(ex[p.n], '')                                       // kept exactly as it was in the sheet
        if (!p.real || !p.first) return { v: null }
        let v = r[p.c]
        if (v == null && ex[`${p.c.toUpperCase()}_KHONG_TON_TAI`] != null) v = ex[`${p.c.toUpperCase()}_KHONG_TON_TAI`] // dangling code set aside on import
        // contractor codes picked in the new app → names, as V27 holds them
        if (p.c === 'don_vi_thuc_hien' && v) v = String(v).split(',').map((x) => names.nha_thau.get(x.trim()) ?? x.trim()).join(', ')
        return cell(v, meta.get(p.c)!.data_type)
      })
      for (const c of added) out.push(cell(r[c], meta.get(c)!.data_type))
      const row = ws.addRow(out.map((o) => o.v))
      out.forEach((o, i) => { if (o.fmt) row.getCell(i + 1).numFmt = o.fmt })
    }
    t.widths.forEach((w, i) => { ws.getColumn(i + 1).width = Math.min(60, Math.max(8, w)) })
    head(ws); report.push({ sheet: t.sheet, rows: list.length })
  }

  // tables V27 never had (payments, audit log…): one sheet each, named after the table
  const mapped = new Set(MAP.map((m) => m.table))
  for (const tb of BACKUP_TABLES.filter((x) => !mapped.has(x))) {
    const meta = cols[tb], keys = Array.from(meta.keys())
    if (!keys.length) continue
    const ws = wb.addWorksheet(`MOI_${tb.toUpperCase()}`.slice(0, 31))
    ws.addRow(keys.map((k) => k.toUpperCase()))
    for (const r of data[tb]) {
      const out = keys.map((k) => cell(r[k], meta.get(k)!.data_type))
      const row = ws.addRow(out.map((o) => o.v))
      out.forEach((o, i) => { if (o.fmt) row.getCell(i + 1).numFmt = o.fmt })
    }
    head(ws); report.push({ sheet: ws.name, rows: data[tb].length })
  }

  const buffer = Buffer.from(await wb.xlsx.writeBuffer())
  return { buffer, report, name: `PHI_LONG_MANAGEMENT_DATABASE_V27_${new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Ho_Chi_Minh' }).format(new Date())}.xlsx` }
}
