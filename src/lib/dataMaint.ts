import 'server-only'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { AuthContext } from '@/lib/auth'
import { audit, todayVN } from '@/lib/crud'
import { BACKUP_TABLES, KEY_OF } from '@/lib/backup'

/* "Bảo trì dữ liệu": every cross-table rule of the system in one place.
 * A check scans live data and lists the rows that break the rule. Depending on its mode it can then
 *  - auto: be repaired in bulk (the API takes a full backup first),
 *  - map:  have hand-typed names matched to catalogue codes through a mapping table,
 *  - act:  offer per-row buttons for cases that need a person's decision (old row kept in the audit log),
 *  - xem:  only point to the page where the row is fixed by hand. */

export type Level = 'loi' | 'canh_bao' | 'thong_tin'
export type Mode = 'auto' | 'map' | 'act' | 'xem'
export interface Item { id: string; label: string; detail?: string; href?: string }
export interface Act { key: string; label: string; danger?: boolean; confirm: string }
export interface MapRow { text: string; count: number; suggest: string }
export interface MapInfo { what: string; rows: MapRow[]; options: { value: string; label: string }[] }

type Rows = any[]
export class Ctx {
  private cache = new Map<string, Promise<Rows>>()
  today = todayVN()
  get(table: string): Promise<Rows> {
    if (!this.cache.has(table)) this.cache.set(table, fetchAll(table))
    return this.cache.get(table)!
  }
}
async function fetchAll(table: string): Promise<Rows> {
  const db = supabaseAdmin(), rows: Rows = []
  for (let from = 0; ; from += 1000) {
    const { data, error } = await db.from(table).select('*').range(from, from + 999)
    if (error) throw new Error(`${table}: ${error.message}`)
    rows.push(...(data ?? []))
    if (!data || data.length < 1000) break
  }
  return rows
}

interface Check {
  key: string; group: string; title: string; level: Level; mode: Mode; hint: string; href?: string
  scan: (c: Ctx) => Promise<Item[]>
  fix?: (c: Ctx, a: AuthContext) => Promise<string>
  acts?: Act[]
  act?: (c: Ctx, a: AuthContext, id: string, act: string) => Promise<string>
  mapping?: (c: Ctx) => Promise<MapInfo>
  applyMap?: (c: Ctx, a: AuthContext, map: Record<string, string>) => Promise<string>
}

/* ── helpers ── */
const nfc = (s: unknown) => String(s ?? '').normalize('NFC').trim()
const keyOf = (s: unknown) => nfc(s).toLowerCase().replace(/\s+/g, ' ')
const list = (v: unknown) => String(v ?? '').split(/\s*,\s*/).map((x) => x.trim()).filter(Boolean)
const isDone = (s: unknown) => /^hoàn thành$/i.test(nfc(s))
const vnDate = (iso?: string | null) => (iso ? new Date(iso).toLocaleDateString('en-CA', { timeZone: 'Asia/Ho_Chi_Minh' }) : null)
const n0 = (n: number) => new Intl.NumberFormat('vi-VN').format(n)
const cut = (s: unknown, n = 70) => { const t = String(s ?? '').replace(/\s+/g, ' ').trim(); return t.length > n ? t.slice(0, n - 1) + '…' : t }
const WORK = [{ t: 'cong_viec', href: '/cong_viec' }, { t: 'cong_viec_hang_ngay', href: '/cong_viec_hang_ngay' }]
const KEEP = '__giu__', NOTE = '__ghichu__'
const ACTIVE = 'Đang thuê'

/** run updates a few at a time: fast enough for hundreds of rows inside one request */
async function each<T>(items: T[], fn: (x: T) => Promise<unknown>, width = 12) {
  for (let i = 0; i < items.length; i += width) await Promise.all(items.slice(i, i + width).map(fn))
}
async function update(table: string, id: string, patch: Record<string, unknown>, keyCol = 'id') {
  const { error } = await supabaseAdmin().from(table).update(patch).eq(keyCol, id)
  if (error) throw new Error(`${table} ${id}: ${error.message}`)
}
const one = async (table: string, id: string) => (await supabaseAdmin().from(table).select('*').eq('id', id).maybeSingle()).data

/* name → code matching used by the mapping checks */
const STRIP = /\b(công ty tnhh|công ty|cty|tnhh|mtv|một thành viên)\b/g
const core = (s: string) => keyOf(s).replace(STRIP, '').replace(/[^\p{L}\p{N} ]/gu, ' ').replace(/\s+/g, ' ').trim()
function suggestFor(text: string, cands: { value: string; names: string[] }[], loose: boolean) {
  const k = keyOf(text), c = core(text)
  const exact = cands.filter((o) => o.names.some((n) => keyOf(n) === k))
  if (exact.length === 1) return exact[0].value
  if (!loose || c.length < 3) return ''
  const near = cands.filter((o) => o.names.some((n) => { const m = core(n); return m.length >= 3 && (m === c || m.includes(c) || c.includes(m)) }))
  return near.length === 1 ? near[0].value : ''
}

/** turns the free-text tokens of one multi-value column into catalogue codes */
function multiMapCheck(o: { key: string; title: string; col: 'nguoi_lam_cung' | 'don_vi_thuc_hien'; ref: 'nhan_vien' | 'nha_thau'; what: string; hint: string; loose: boolean; drop?: string[] }): Check {
  const codes = async (c: Ctx) => new Set((await c.get(o.ref)).map((r) => r.id))
  const rowsWithText = async (c: Ctx) => {
    const ok = await codes(c), out: { t: string; href: string; r: any; bad: string[] }[] = []
    for (const w of WORK) for (const r of await c.get(w.t)) { const bad = list(r[o.col]).filter((x) => !ok.has(x)); if (bad.length) out.push({ t: w.t, href: w.href, r, bad }) }
    return out
  }
  return {
    key: o.key, group: 'Liên kết giữa các bảng', title: o.title, level: 'canh_bao', mode: 'map', hint: o.hint,
    scan: async (c) => (await rowsWithText(c)).map(({ r, href, bad }) => ({ id: r.id, label: `${r.id} · ${cut(r.noi_dung, 60)}`, detail: `Đang ghi: ${bad.join(', ')}`, href: `${href}?xem=${r.id}` })),
    mapping: async (c) => {
      const counts = new Map<string, { text: string; count: number }>()
      for (const x of await rowsWithText(c)) for (const b of x.bad) { const k = keyOf(b); const e = counts.get(k) ?? { text: b, count: 0 }; e.count++; counts.set(k, e) }
      const ref = await c.get(o.ref)
      const cands = ref.map((r) => ({ value: r.id, names: o.ref === 'nhan_vien' ? [r.ho_ten, r.ten_goi_khac].filter(Boolean) : [r.ten_cong_ty].filter(Boolean) }))
      const rows = [...counts.values()].sort((a, b) => b.count - a.count).map((e) => ({
        text: e.text, count: e.count, suggest: (o.drop ?? []).includes(keyOf(e.text)) ? '' : suggestFor(e.text, cands, o.loose) || KEEP,
      }))
      const options = ref.map((r) => ({ value: r.id, label: `${o.ref === 'nhan_vien' ? r.ho_ten : r.ten_cong_ty} (${r.id})` }))
        .sort((a, b) => a.label.localeCompare(b.label, 'vi'))
      return { what: o.what, rows, options }
    },
    applyMap: async (c, a, map) => {
      const ok = await codes(c), m = new Map(Object.entries(map).map(([k, v]) => [keyOf(k), v]))
      const todo: { t: string; id: string; patch: Record<string, unknown>; before: unknown }[] = []
      for (const x of await rowsWithText(c)) {
        const kept: string[] = [], notes: string[] = []
        for (const tok of list(x.r[o.col])) {
          if (ok.has(tok)) { kept.push(tok); continue }
          const to = m.get(keyOf(tok))
          if (to === undefined || to === KEEP) kept.push(tok)
          else if (to === NOTE) notes.push(tok)
          else if (to && ok.has(to)) kept.push(to)
        }
        // only rows where a name really changes are written: spacing of untouched lists is left as typed
        const orig = list(x.r[o.col]), uniq = Array.from(new Set(kept))
        if (!notes.length && uniq.length === orig.length && uniq.every((k, i) => k === orig[i])) continue
        const value = uniq.join(',') || null
        const patch: Record<string, unknown> = { [o.col]: value }
        if (notes.length) patch.ghi_chu = [x.r.ghi_chu, `${o.what}: ${notes.join(', ')}`].filter(Boolean).join('\n')
        if (o.col === 'don_vi_thuc_hien') { const first = kept.find((k) => ok.has(k)); if (first) patch.id_nha_thau = first }
        todo.push({ t: x.t, id: x.r.id, patch, before: { [o.col]: x.r[o.col], id_nha_thau: x.r.id_nha_thau } })
      }
      await each(todo, (d) => update(d.t, d.id, d.patch))
      await audit(a, 'bao_tri_du_lieu', o.key, 'map', { rows: todo.length, map })
      return `Đã cập nhật ${todo.length} công việc.`
    },
  }
}

/* text columns that are codes or machine values and must never be rewritten */
const SKIP_COL = /^(id|id_.*|file_id|thumb_id|created_at|updated_at|thoi_gian|email|user_email|user_id|record_id|table_name|du_lieu|ma_.*|serial)$/
const TEXT_TABLES = BACKUP_TABLES.filter((t) => !['audit_logs', 'users', 'cau_hinh_he_thong', 'sao_luu'].includes(t))
async function textFixes(c: Ctx) {
  const out: { t: string; key: string; id: string; patch: Record<string, string>; sample: string }[] = []
  for (const t of TEXT_TABLES) {
    const keyCol = KEY_OF[t] ?? 'id'
    for (const r of await c.get(t)) {
      if (r[keyCol] == null) continue
      const patch: Record<string, string> = {}
      for (const [k, v] of Object.entries(r)) if (typeof v === 'string' && !SKIP_COL.test(k)) { const n = v.normalize('NFC').trim(); if (n !== v) patch[k] = n }
      if (Object.keys(patch).length) out.push({ t, key: keyCol, id: String(r[keyCol]), patch, sample: Object.keys(patch).join(', ') })
    }
  }
  return out
}
/* category columns where "Quản lý" and "Quản Lý" must become one value */
const CATEGORY: [string, string][] = [['vat_tu', 'nhom'], ['vat_tu', 'dvt'], ['thiet_bi', 'loai_thiet_bi'], ['thiet_bi', 'nhom'], ['thiet_bi', 'phong_ban'],
  ['nhan_vien', 'phong_ban'], ['nhan_vien', 'chuc_vu'], ['khu_vuc', 'loai_khu_vuc'], ['tien_dien', 'nhom_hoa_don'], ['nha_thau', 'linh_vuc'], ['de_xuat_chi_tiet', 'dvt']]
async function categoryFixes(c: Ctx) {
  const out: { t: string; col: string; from: string; to: string; ids: string[] }[] = []
  for (const [t, col] of CATEGORY) {
    const groups = new Map<string, Map<string, string[]>>()
    for (const r of await c.get(t)) {
      const v = r[col]; if (typeof v !== 'string' || !v.trim()) continue
      const g = groups.get(keyOf(v)) ?? new Map<string, string[]>(); g.set(v, [...(g.get(v) ?? []), r.id]); groups.set(keyOf(v), g)
    }
    for (const g of groups.values()) {
      if (g.size < 2) continue
      // keep the spelling most rows already use; on a tie the one starting with a capital letter
      const best = [...g.entries()].sort((a, b) => b[1].length - a[1].length || Number(/^\p{Lu}/u.test(b[0])) - Number(/^\p{Lu}/u.test(a[0])))[0][0]
      for (const [v, ids] of g) if (v !== best) out.push({ t, col, from: v, to: nfc(best), ids })
    }
  }
  return out
}

async function activeLeases(c: Ctx) { return (await c.get('thue_mat_bang')).filter((l) => l.trang_thai === ACTIVE) }

/* ───────────────────────── the checks ───────────────────────── */
export const CHECKS: Check[] = [
  // ── Liên kết giữa các bảng ──
  multiMapCheck({ key: 'lk_don_vi', title: 'Đơn vị thực hiện ghi bằng chữ, chưa gắn nhà thầu', col: 'don_vi_thuc_hien', ref: 'nha_thau', what: 'Đơn vị thực hiện', loose: true,
    drop: ['chưa cập nhật'], hint: 'Ghép từng tên với danh mục nhà thầu để lọc, thống kê và báo cáo theo nhà thầu được đúng.' }),
  multiMapCheck({ key: 'lk_nguoi_lam_cung', title: 'Người làm cùng ghi bằng chữ, chưa gắn nhân viên', col: 'nguoi_lam_cung', ref: 'nhan_vien', what: 'Người làm cùng', loose: false,
    hint: 'Ghép tên với danh sách nhân viên để "việc của tôi", chuông thông báo và báo cáo tính đúng người.' }),
  {
    key: 'lk_nha_thau_chinh', group: 'Liên kết giữa các bảng', title: 'Nhà thầu chính không khớp đơn vị đầu tiên', level: 'canh_bao', mode: 'auto',
    hint: 'Nhà thầu chính (dùng cho lọc và cảnh báo) phải là đơn vị đầu tiên trong danh sách đơn vị thực hiện.',
    scan: async (c) => {
      const nt = new Set((await c.get('nha_thau')).map((r) => r.id)), out: Item[] = []
      for (const w of WORK) for (const r of await c.get(w.t)) { const f = list(r.don_vi_thuc_hien).find((x) => nt.has(x)); if (f && r.id_nha_thau !== f) out.push({ id: r.id, label: `${r.id} · ${cut(r.noi_dung, 60)}`, detail: `${r.id_nha_thau ?? 'trống'} → ${f}`, href: `${w.href}?xem=${r.id}` }) }
      return out
    },
    fix: async (c, a) => {
      const nt = new Set((await c.get('nha_thau')).map((r) => r.id)), todo: [string, string, string][] = []
      for (const w of WORK) for (const r of await c.get(w.t)) { const f = list(r.don_vi_thuc_hien).find((x) => nt.has(x)); if (f && r.id_nha_thau !== f) todo.push([w.t, r.id, f]) }
      await each(todo, ([t, id, f]) => update(t, id, { id_nha_thau: f }))
      await audit(a, 'bao_tri_du_lieu', 'lk_nha_thau_chinh', 'fix', { rows: todo.length })
      return `Đã đồng bộ nhà thầu chính cho ${todo.length} công việc.`
    },
  },
  {
    key: 'lk_dang_nhap', group: 'Liên kết giữa các bảng', title: 'Lịch sử đăng nhập gắn tài khoản cũ', level: 'thong_tin', mode: 'auto', href: '/lich_su_dang_nhap',
    hint: 'Gắn lại theo email với tài khoản hiện tại. Dòng cũ không có email (từ V191) được giữ nguyên làm lịch sử.',
    scan: async (c) => {
      const us = await c.get('users'), ids = new Set(us.map((u) => u.id)), byMail = new Map(us.map((u) => [String(u.email).toLowerCase(), u]))
      return (await c.get('lich_su_dang_nhap')).filter((r) => r.id_nguoi_dung && !ids.has(r.id_nguoi_dung) && r.email && byMail.has(String(r.email).toLowerCase()))
        .map((r) => ({ id: r.id, label: `${r.email} · ${r.thoi_gian ? new Date(r.thoi_gian).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' }) : ''}` }))
    },
    fix: async (c, a) => {
      const us = await c.get('users'), ids = new Set(us.map((u) => u.id)), byMail = new Map(us.map((u) => [String(u.email).toLowerCase(), u]))
      const todo = (await c.get('lich_su_dang_nhap')).filter((r) => r.id_nguoi_dung && !ids.has(r.id_nguoi_dung) && r.email && byMail.has(String(r.email).toLowerCase()))
      await each(todo, (r) => update('lich_su_dang_nhap', r.id, { id_nguoi_dung: byMail.get(String(r.email).toLowerCase())!.id }))
      await audit(a, 'bao_tri_du_lieu', 'lk_dang_nhap', 'fix', { rows: todo.length })
      return `Đã gắn lại ${todo.length} lượt đăng nhập.`
    },
  },
  {
    key: 'lk_tai_khoan_nghi', group: 'Liên kết giữa các bảng', title: 'Tài khoản còn hoạt động nhưng nhân viên đã nghỉ', level: 'canh_bao', mode: 'xem', href: '/users',
    hint: 'Khóa tài khoản để người đã nghỉ không đăng nhập được.',
    scan: async (c) => {
      const nv = new Map((await c.get('nhan_vien')).map((r) => [r.id, r]))
      return (await c.get('users')).filter((u) => u.trang_thai === 'Hoạt động' && u.id_nhan_vien && /nghỉ|ngưng/i.test(nv.get(u.id_nhan_vien)?.trang_thai ?? ''))
        .map((u) => ({ id: u.id, label: `${u.email} · ${nv.get(u.id_nhan_vien)?.ho_ten}` }))
    },
  },
  {
    key: 'lk_tai_khoan_khong_nv', group: 'Liên kết giữa các bảng', title: 'Tài khoản chưa gắn với nhân viên', level: 'thong_tin', mode: 'xem', href: '/users',
    hint: 'Gắn nhân viên để lọc "việc của tôi" và chat đúng người.',
    scan: async (c) => (await c.get('users')).filter((u) => !u.id_nhan_vien).map((u) => ({ id: u.id, label: u.email })),
  },

  // ── Công việc ──
  {
    key: 'cv_ht_thieu_ngay', group: 'Công việc', title: 'Công việc "Hoàn thành" nhưng thiếu ngày hoàn thành', level: 'canh_bao', mode: 'auto',
    hint: 'Điền ngày hoàn thành: công việc hằng ngày lấy ngày của việc, công việc lấy ngày cập nhật cuối.',
    scan: async (c) => { const out: Item[] = []; for (const w of WORK) for (const r of await c.get(w.t)) if (isDone(r.trang_thai) && !r.ngay_hoan_thanh) out.push({ id: r.id, label: `${r.id} · ${cut(r.noi_dung, 60)}`, href: `${w.href}?xem=${r.id}` }); return out },
    fix: async (c, a) => {
      const todo: [string, string, string][] = []
      for (const w of WORK) for (const r of await c.get(w.t)) if (isDone(r.trang_thai) && !r.ngay_hoan_thanh) { const d = (w.t === 'cong_viec_hang_ngay' ? r.ngay : null) ?? vnDate(r.updated_at) ?? vnDate(r.created_at) ?? c.today; todo.push([w.t, r.id, d]) }
      await each(todo, ([t, id, d]) => update(t, id, { ngay_hoan_thanh: d }))
      await audit(a, 'bao_tri_du_lieu', 'cv_ht_thieu_ngay', 'fix', { rows: todo.length })
      return `Đã điền ngày hoàn thành cho ${todo.length} công việc.`
    },
  },
  {
    key: 'cv_ngay_chua_ht', group: 'Công việc', title: 'Có ngày hoàn thành nhưng chưa ghi "Hoàn thành"', level: 'canh_bao', mode: 'act',
    hint: 'Chọn: chuyển sang Hoàn thành, hoặc xóa ngày hoàn thành nếu việc chưa xong.',
    acts: [{ key: 'hoan_thanh', label: 'Đánh dấu Hoàn thành', confirm: 'Chuyển công việc này sang "Hoàn thành"?' }, { key: 'xoa_ngay', label: 'Xóa ngày hoàn thành', confirm: 'Xóa ngày hoàn thành, giữ trạng thái hiện tại?' }],
    scan: async (c) => { const out: Item[] = []; for (const w of WORK) for (const r of await c.get(w.t)) if (!isDone(r.trang_thai) && r.ngay_hoan_thanh) out.push({ id: r.id, label: `${r.id} · ${cut(r.noi_dung, 60)}`, detail: `${r.trang_thai ?? 'Chưa có trạng thái'} · ngày HT ${r.ngay_hoan_thanh}`, href: `${w.href}?xem=${r.id}` }); return out },
    act: async (_c, a, id, act) => {
      const t = id.startsWith('HN') ? 'cong_viec_hang_ngay' : 'cong_viec', row = await one(t, id); if (!row) throw new Error('Không tìm thấy công việc')
      const patch = act === 'hoan_thanh' ? { trang_thai: 'Hoàn thành' } : { ngay_hoan_thanh: null }
      await update(t, id, patch); await audit(a, t, id, 'update', { before: row, after: patch, nguon: 'Bảo trì dữ liệu' })
      return act === 'hoan_thanh' ? `${id} đã chuyển sang Hoàn thành.` : `Đã xóa ngày hoàn thành của ${id}.`
    },
  },
  {
    key: 'cv_khong_nguoi', group: 'Công việc', title: 'Công việc chưa giao cho ai', level: 'canh_bao', mode: 'xem', href: '/cong_viec',
    hint: 'Chọn người thực hiện hoặc đơn vị thực hiện.',
    scan: async (c) => (await c.get('cong_viec')).filter((r) => !isDone(r.trang_thai) && !r.id_nguoi_thuc_hien && !r.id_nha_thau && !list(r.don_vi_thuc_hien).length)
      .map((r) => ({ id: r.id, label: `${r.id} · ${cut(r.noi_dung, 60)}`, href: `/cong_viec?xem=${r.id}` })),
  },

  // ── Kho & đề xuất ──
  {
    key: 'kho_trung', group: 'Kho & đề xuất', title: 'Một dòng đề xuất bị nhập kho nhiều lần', level: 'loi', mode: 'act', href: '/nhap_xuat_kho',
    hint: 'Cùng đề xuất, cùng vật tư được nhập kho hai lần làm tồn kho bị cộng dư. Xóa phiếu thừa, giữ phiếu đã duyệt trong phần mềm.',
    acts: [{ key: 'xoa', label: 'Xóa phiếu thừa', danger: true, confirm: 'Xóa phiếu nhập kho thừa này? Tồn kho sẽ giảm tương ứng. Nội dung phiếu được lưu trong Nhật ký thao tác.' }],
    scan: async (c) => {
      const vt = new Map((await c.get('vat_tu')).map((r) => [r.id, r])), g = new Map<string, any[]>()
      for (const r of await c.get('nhap_xuat_kho')) if (r.loai_giao_dich === 'NHAP' && r.id_chung_tu && /^DX/.test(r.id_chung_tu) && r.id_vat_tu) g.set(`${r.id_chung_tu}|${r.id_vat_tu}`, [...(g.get(`${r.id_chung_tu}|${r.id_vat_tu}`) ?? []), r])
      const out: Item[] = []
      for (const rows of g.values()) {
        if (rows.length < 2) continue
        const keep = rows.find((r) => r.nguon_giao_dich === 'DE_XUAT') ?? [...rows].sort((a, b) => String(a.created_at).localeCompare(String(b.created_at)))[0]
        for (const r of rows) if (r !== keep) out.push({ id: r.id, label: `${r.id_chung_tu} · ${vt.get(r.id_vat_tu)?.ten_vat_tu ?? r.id_vat_tu}`, detail: `Phiếu thừa ${r.id} (+${n0(r.so_luong)}, ngày ${r.ngay}) · giữ ${keep.id}`, href: `/vat_tu?xem=${r.id_vat_tu}` })
      }
      return out
    },
    act: async (c, a, id) => {
      const items = await CHECKS.find((x) => x.key === 'kho_trung')!.scan(c)
      if (!items.some((i) => i.id === id)) throw new Error('Phiếu này không còn là phiếu thừa, hãy quét lại')
      const row = await one('nhap_xuat_kho', id)
      const { error } = await supabaseAdmin().from('nhap_xuat_kho').delete().eq('id', id); if (error) throw new Error(error.message)
      await audit(a, 'nhap_xuat_kho', id, 'delete', { before: row, nguon: 'Bảo trì dữ liệu: phiếu nhập trùng' })
      return `Đã xóa phiếu thừa ${id}.`
    },
  },
  {
    key: 'dx_mat_duyet', group: 'Kho & đề xuất', title: 'Đề xuất đã duyệt nhưng trạng thái bị trả về "Chờ duyệt"', level: 'loi', mode: 'act', href: '/de_xuat',
    hint: 'Đề xuất có người duyệt, ngày duyệt và hàng đã vào kho nhưng trạng thái lại là chờ duyệt (bị ghi đè khi chép dữ liệu cũ). Khôi phục trạng thái "Đã duyệt".',
    acts: [{ key: 'khoi_phuc', label: 'Khôi phục "Đã duyệt"', confirm: 'Đặt lại trạng thái "Đã duyệt" cho đề xuất này? Kho không thay đổi.' }],
    scan: async (c) => {
      const stock = new Set((await c.get('nhap_xuat_kho')).map((r) => r.id_chung_tu).filter(Boolean))
      return (await c.get('de_xuat')).filter((r) => ['Chờ duyệt', 'Chờ duyệt cấp 2'].includes(r.trang_thai) && r.nguoi_duyet && r.ngay_duyet && stock.has(r.id))
        .map((r) => ({ id: r.id, label: `${r.id} · ${cut(r.noi_dung, 60)}`, detail: `Duyệt bởi ${r.nguoi_duyet} ngày ${r.ngay_duyet} · đang ghi "${r.trang_thai}"`, href: `/de_xuat?xem=${r.id}` }))
    },
    act: async (_c, a, id) => {
      const row = await one('de_xuat', id); if (!row) throw new Error('Không tìm thấy đề xuất')
      await update('de_xuat', id, { trang_thai: 'Đã duyệt' }); await audit(a, 'de_xuat', id, 'update', { before: { trang_thai: row.trang_thai }, after: { trang_thai: 'Đã duyệt' }, nguon: 'Bảo trì dữ liệu' })
      return `${id} đã về "Đã duyệt".`
    },
  },
  {
    key: 'dx_chua_nhap', group: 'Kho & đề xuất', title: 'Đề xuất mua vật tư đã duyệt nhưng chưa nhập kho', level: 'canh_bao', mode: 'act', href: '/de_xuat',
    hint: 'Hàng đã về thì "Nhập kho bù"; nếu đã nhập bằng phiếu khác hoặc không mua nữa thì "Bỏ qua".',
    acts: [{ key: 'nhap_bu', label: 'Nhập kho bù', confirm: 'Tạo phiếu nhập kho theo dòng đề xuất này (ngày hôm nay)?' }, { key: 'bo_qua', label: 'Bỏ qua', confirm: 'Đánh dấu dòng này không cần nhập kho? Dòng sẽ không còn hiện ở đây.' }],
    scan: async (c) => {
      const dx = new Map((await c.get('de_xuat')).map((r) => [r.id, r])), vt = new Map((await c.get('vat_tu')).map((r) => [r.id, r]))
      const done = new Set((await c.get('nhap_xuat_kho')).filter((r) => r.loai_giao_dich === 'NHAP' && r.id_chung_tu).map((r) => `${r.id_chung_tu}|${r.id_vat_tu}`))
      return (await c.get('de_xuat_chi_tiet')).filter((l) => { const d = dx.get(l.id_de_xuat); return d?.loai_de_xuat === 'MUA_VAT_TU' && d.trang_thai === 'Đã duyệt' && l.id_vat_tu && !done.has(`${l.id_de_xuat}|${l.id_vat_tu}`) && !l.extra?.BO_QUA_NHAP })
        .map((l) => ({ id: l.id, label: `${l.id_de_xuat} · ${vt.get(l.id_vat_tu)?.ten_vat_tu ?? l.id_vat_tu}`, detail: `Số lượng ${n0(Number(l.so_luong) || 0)} ${vt.get(l.id_vat_tu)?.dvt ?? ''}`, href: `/de_xuat?xem=${l.id_de_xuat}` }))
    },
    act: async (c, a, id, act) => {
      const items = await CHECKS.find((x) => x.key === 'dx_chua_nhap')!.scan(c)
      if (!items.some((i) => i.id === id)) throw new Error('Dòng này đã được xử lý, hãy quét lại')
      const l = await one('de_xuat_chi_tiet', id); if (!l) throw new Error('Không tìm thấy dòng đề xuất')
      if (act === 'bo_qua') {
        await update('de_xuat_chi_tiet', id, { extra: { ...(l.extra ?? {}), BO_QUA_NHAP: { nguoi: a.name, ngay: c.today } } })
        await audit(a, 'de_xuat_chi_tiet', id, 'update', { bo_qua_nhap: true, nguon: 'Bảo trì dữ liệu' })
        return `Đã bỏ qua dòng ${l.id_de_xuat} · ${l.id_vat_tu}.`
      }
      const { data, error } = await supabaseAdmin().rpc('kho_giao_dich', {
        p_vat_tu: l.id_vat_tu, p_loai: 'NHAP', p_so_luong: l.so_luong, p_ngay: c.today, p_noi_dung: `Nhập bù theo đề xuất ${l.id_de_xuat}`,
        p_nguon: 'DE_XUAT', p_chung_tu: l.id_de_xuat, p_nguoi_tao: a.name, p_don_gia: Number(l.don_gia) || 0, p_ghi_chu: 'Tạo từ Bảo trì dữ liệu',
      })
      if (error) throw new Error(error.message)
      await audit(a, 'nhap_xuat_kho', data as string, 'create', { id_vat_tu: l.id_vat_tu, qty: l.so_luong, chung_tu: l.id_de_xuat, nguon: 'Bảo trì dữ liệu' })
      return `Đã nhập kho bù ${n0(Number(l.so_luong))} theo ${l.id_de_xuat}.`
    },
  },
  {
    key: 'dx_dong_chua_chon_vt', group: 'Kho & đề xuất', title: 'Đề xuất mua vật tư đã duyệt có dòng chưa chọn vật tư', level: 'thong_tin', mode: 'xem', href: '/de_xuat',
    hint: 'Dòng không gắn vật tư trong danh mục nên không tự vào kho. Nhập kho tay nếu hàng đã về.',
    scan: async (c) => {
      const dx = new Map((await c.get('de_xuat')).map((r) => [r.id, r]))
      return (await c.get('de_xuat_chi_tiet')).filter((l) => dx.get(l.id_de_xuat)?.loai_de_xuat === 'MUA_VAT_TU' && dx.get(l.id_de_xuat)?.trang_thai === 'Đã duyệt' && !l.id_vat_tu)
        .map((l) => ({ id: l.id, label: `${l.id_de_xuat} · ${l.ten ?? 'không có tên'}`, href: `/de_xuat?xem=${l.id_de_xuat}` }))
    },
  },
  {
    key: 'dx_khong_chi_tiet', group: 'Kho & đề xuất', title: 'Đề xuất không có dòng chi tiết', level: 'canh_bao', mode: 'xem', href: '/de_xuat',
    hint: 'Bổ sung chi tiết để duyệt và in phiếu được.',
    scan: async (c) => { const has = new Set((await c.get('de_xuat_chi_tiet')).map((l) => l.id_de_xuat)); return (await c.get('de_xuat')).filter((r) => !has.has(r.id)).map((r) => ({ id: r.id, label: `${r.id} · ${cut(r.noi_dung, 60)}`, href: `/de_xuat?xem=${r.id}` })) },
  },
  {
    key: 'kho_ton_am', group: 'Kho & đề xuất', title: 'Vật tư có tồn kho âm', level: 'loi', mode: 'xem', href: '/nhap_xuat_kho',
    hint: 'Xuất nhiều hơn nhập: kiểm tra lịch sử nhập xuất, dùng "Điều chỉnh" để cân lại.',
    scan: async (c) => (await c.get('v_vat_tu')).filter((r) => Number(r.ton_hien_tai) < 0).map((r) => ({ id: r.id, label: `${r.ten_vat_tu} · tồn ${r.ton_hien_tai}`, href: `/vat_tu?xem=${r.id}` })),
  },
  {
    key: 'kho_duoi_toi_thieu', group: 'Kho & đề xuất', title: 'Vật tư dưới tồn tối thiểu', level: 'thong_tin', mode: 'xem', href: '/vat_tu',
    hint: 'Lập đề xuất mua vật tư.',
    scan: async (c) => (await c.get('v_vat_tu')).filter((r) => r.canh_bao).map((r) => ({ id: r.id, label: `${r.ten_vat_tu} · tồn ${r.ton_hien_tai}/${r.ton_toi_thieu}`, href: `/vat_tu?xem=${r.id}` })),
  },

  // ── Cho thuê & tiền điện ──
  {
    key: 'thue_lech', group: 'Cho thuê & tiền điện', title: 'Trạng thái tầng / khách lệch với lượt thuê', level: 'canh_bao', mode: 'auto', href: '/mat-bang',
    hint: 'Tầng có khách đang thuê phải ghi "Đang thuê"; khách đang có lượt thuê phải ghi "Đang thuê".',
    scan: async (c) => {
      const act = await activeLeases(c)
      return [...(await c.get('tang')).filter((f) => f.trang_thai_su_dung !== ACTIVE && act.some((l) => l.id_tang === f.id)).map((f) => ({ id: f.id, label: `${f.ten_tang} · đang ghi "${f.trang_thai_su_dung ?? 'trống'}"` })),
        ...(await c.get('khach_thue')).filter((k) => k.trang_thai !== ACTIVE && act.some((l) => l.id_khach_thue === k.id)).map((k) => ({ id: k.id, label: `${k.ten_khach_thue} · đang ghi "${k.trang_thai ?? 'trống'}"` }))]
    },
    fix: async (c, a) => {
      const act = await activeLeases(c)
      const f = (await c.get('tang')).filter((x) => x.trang_thai_su_dung !== ACTIVE && act.some((l) => l.id_tang === x.id))
      const k = (await c.get('khach_thue')).filter((x) => x.trang_thai !== ACTIVE && act.some((l) => l.id_khach_thue === x.id))
      await each(f, (x) => update('tang', x.id, { trang_thai_su_dung: ACTIVE })); await each(k, (x) => update('khach_thue', x.id, { trang_thai: ACTIVE }))
      await audit(a, 'bao_tri_du_lieu', 'thue_lech', 'fix', { tang: f.map((x) => x.id), khach: k.map((x) => x.id) })
      return `Đã đồng bộ ${f.length} tầng và ${k.length} khách.`
    },
  },
  {
    key: 'tang_khong_khach', group: 'Cho thuê & tiền điện', title: 'Tầng ghi "Đang thuê" nhưng không có khách nào', level: 'canh_bao', mode: 'act', href: '/mat-bang',
    hint: 'Nếu tầng còn khách thì vào "Mặt bằng cho thuê" bấm "Cho thuê"; nếu không thì chuyển về "Trống".',
    acts: [{ key: 'trong', label: 'Chuyển "Trống"', confirm: 'Chuyển tầng này về "Trống"?' }],
    scan: async (c) => { const act = await activeLeases(c); return (await c.get('tang')).filter((f) => f.trang_thai_su_dung === ACTIVE && !act.some((l) => l.id_tang === f.id)).map((f) => ({ id: f.id, label: f.ten_tang, href: '/mat-bang' })) },
    act: async (_c, a, id) => { await update('tang', id, { trang_thai_su_dung: 'Trống' }); await audit(a, 'tang', id, 'update', { after: { trang_thai_su_dung: 'Trống' }, nguon: 'Bảo trì dữ liệu' }); return 'Đã chuyển tầng về "Trống".' },
  },
  {
    key: 'khach_khong_tang', group: 'Cho thuê & tiền điện', title: 'Khách ghi "Đang thuê" nhưng không thuê tầng nào', level: 'canh_bao', mode: 'act', href: '/mat-bang',
    hint: 'Nếu khách còn thuê thì bấm "Cho thuê" ở trang Mặt bằng; nếu đã đi thì chuyển "Đã rời đi" (hồ sơ và tiền điện vẫn giữ).',
    acts: [{ key: 'roi_di', label: 'Chuyển "Đã rời đi"', confirm: 'Chuyển khách này sang "Đã rời đi"? Hồ sơ và tiền điện vẫn giữ.' }],
    scan: async (c) => { const act = await activeLeases(c); return (await c.get('khach_thue')).filter((k) => k.trang_thai === ACTIVE && !act.some((l) => l.id_khach_thue === k.id)).map((k) => ({ id: k.id, label: k.ten_khach_thue, detail: k.ngay_ket_thuc ? `Hợp đồng hết ${k.ngay_ket_thuc}` : undefined, href: '/mat-bang' })) },
    act: async (_c, a, id) => { await update('khach_thue', id, { trang_thai: 'Đã rời đi', id_tang: null }); await audit(a, 'khach_thue', id, 'update', { after: { trang_thai: 'Đã rời đi' }, nguon: 'Bảo trì dữ liệu' }); return 'Đã chuyển khách sang "Đã rời đi".' },
  },
  {
    key: 'thue_het_han', group: 'Cho thuê & tiền điện', title: 'Lượt thuê đã quá ngày kết thúc hợp đồng', level: 'canh_bao', mode: 'xem', href: '/mat-bang',
    hint: 'Gia hạn hoặc trả mặt bằng ở trang "Mặt bằng cho thuê".',
    scan: async (c) => {
      const kt = new Map((await c.get('khach_thue')).map((r) => [r.id, r])), tg = new Map((await c.get('tang')).map((r) => [r.id, r]))
      return (await activeLeases(c)).filter((l) => l.ngay_ket_thuc && l.ngay_ket_thuc < c.today).map((l) => ({ id: l.id, label: `${kt.get(l.id_khach_thue)?.ten_khach_thue ?? l.id_khach_thue} · ${tg.get(l.id_tang)?.ten_tang ?? ''}`, detail: `Hết hạn ${l.ngay_ket_thuc}`, href: '/mat-bang' }))
    },
  },
  {
    key: 'dien_lech', group: 'Cho thuê & tiền điện', title: 'Tiền điện: số kWh không khớp chỉ số công tơ', level: 'loi', mode: 'xem', href: '/tien_dien',
    hint: 'kWh phải bằng chỉ số mới − chỉ số cũ và chỉ số mới không nhỏ hơn chỉ số cũ. Kiểm tra lại phiếu chốt.',
    scan: async (c) => (await c.get('tien_dien')).filter((r) => {
      const has = (v: unknown) => v !== null && v !== undefined && v !== ''
      const k = has(r.chi_so_moi) && has(r.chi_so_cu) && has(r.so_kwh) && Math.abs(Number(r.so_kwh) - (Number(r.chi_so_moi) - Number(r.chi_so_cu))) > 0.5
      return k || (has(r.chi_so_moi) && has(r.chi_so_cu) && Number(r.chi_so_moi) < Number(r.chi_so_cu))
    }).map((r) => ({ id: r.id, label: `${r.id} · ${r.ky ?? ''} · ${cut(r.ten_khach_thue, 40)}` })),
  },

  // ── Thiết bị & bảo trì ──
  {
    key: 'tb_chua_tach', group: 'Thiết bị & bảo trì', title: 'Dòng thiết bị gộp nhiều cái chưa tách', level: 'thong_tin', mode: 'xem', href: '/thiet_bi',
    hint: 'Super Admin bấm "Tách tất cả" ở trang Thiết bị để mỗi máy một dòng (có mã QR, lịch sử riêng).',
    scan: async (c) => (await c.get('thiet_bi')).filter((r) => Number(r.so_luong) > 1).map((r) => ({ id: r.id, label: `${r.id} · ${cut(r.ten_thiet_bi, 50)} × ${r.so_luong}`, href: `/thiet_bi?xem=${r.id}` })),
  },
  {
    key: 'tb_trung_serial', group: 'Thiết bị & bảo trì', title: 'Thiết bị trùng số serial', level: 'loi', mode: 'xem', href: '/thiet_bi',
    hint: 'Kiểm tra có nhập trùng một thiết bị hai lần không.',
    scan: async (c) => { const g = new Map<string, any[]>(); for (const r of await c.get('thiet_bi')) if (r.serial && nfc(r.serial)) { const k = nfc(r.serial).toUpperCase(); g.set(k, [...(g.get(k) ?? []), r]) } return [...g.values()].filter((a) => a.length > 1).flat().map((r) => ({ id: r.id, label: `${r.id} · serial ${r.serial}`, href: `/thiet_bi?xem=${r.id}` })) },
  },
  {
    key: 'tb_kho_co_nguoi', group: 'Thiết bị & bảo trì', title: 'Thiết bị "Trong kho" nhưng vẫn gắn người sử dụng', level: 'canh_bao', mode: 'auto', href: '/thiet_bi',
    hint: 'Thiết bị đã về kho thì bỏ người sử dụng.',
    scan: async (c) => (await c.get('thiet_bi')).filter((r) => r.trang_thai === 'Trong kho' && r.id_nguoi_su_dung).map((r) => ({ id: r.id, label: `${r.id} · ${cut(r.ten_thiet_bi, 50)}`, href: `/thiet_bi?xem=${r.id}` })),
    fix: async (c, a) => { const t = (await c.get('thiet_bi')).filter((r) => r.trang_thai === 'Trong kho' && r.id_nguoi_su_dung); await each(t, (r) => update('thiet_bi', r.id, { id_nguoi_su_dung: null })); await audit(a, 'bao_tri_du_lieu', 'tb_kho_co_nguoi', 'fix', { rows: t.map((r) => [r.id, r.id_nguoi_su_dung]) }); return `Đã bỏ người sử dụng của ${t.length} thiết bị trong kho.` },
  },
  {
    key: 'bt_gan_ke_hoach', group: 'Thiết bị & bảo trì', title: 'Nhật ký bảo trì chưa gắn kế hoạch', level: 'canh_bao', mode: 'auto', href: '/nhat_ky_bao_tri',
    hint: 'Gắn nhật ký vào kế hoạch có cùng khu vực và hạng mục để ngày bảo trì kế tiếp tính đúng.',
    scan: async (c) => { const l = await c.get('lich_bao_tri'); return (await c.get('nhat_ky_bao_tri')).filter((n) => !n.id_lich && l.some((p) => p.id_khu_vuc === n.id_khu_vuc && p.id_hang_muc === n.id_hang_muc)).map((n) => ({ id: n.id, label: `${n.id} · ${n.ngay_thuc_hien ?? ''}`, href: `/nhat_ky_bao_tri?xem=${n.id}` })) },
    fix: async (c, a) => {
      const l = await c.get('lich_bao_tri'), todo = (await c.get('nhat_ky_bao_tri')).flatMap((n) => { const p = !n.id_lich && l.find((p) => p.id_khu_vuc === n.id_khu_vuc && p.id_hang_muc === n.id_hang_muc); return p ? [[n.id, p.id] as [string, string]] : [] })
      await each(todo, ([id, lich]) => update('nhat_ky_bao_tri', id, { id_lich: lich })); await audit(a, 'bao_tri_du_lieu', 'bt_gan_ke_hoach', 'fix', { rows: todo })
      return `Đã gắn ${todo.length} nhật ký vào kế hoạch.`
    },
  },
  {
    key: 'bt_khong_ke_hoach', group: 'Thiết bị & bảo trì', title: 'Nhật ký bảo trì không thuộc kế hoạch nào', level: 'thong_tin', mode: 'xem', href: '/lich_bao_tri',
    hint: 'Nếu việc này lặp lại theo chu kỳ, thêm kế hoạch bảo trì cho khu vực và hạng mục đó.',
    scan: async (c) => {
      const l = await c.get('lich_bao_tri'), kv = new Map((await c.get('khu_vuc')).map((r) => [r.id, r])), hm = new Map((await c.get('hang_muc_bao_tri')).map((r) => [r.id, r]))
      return (await c.get('nhat_ky_bao_tri')).filter((n) => !l.some((p) => p.id_khu_vuc === n.id_khu_vuc && p.id_hang_muc === n.id_hang_muc))
        .map((n) => ({ id: n.id, label: `${n.id} · ${hm.get(n.id_hang_muc)?.ten_hang_muc ?? n.id_hang_muc} · ${kv.get(n.id_khu_vuc)?.ten_khu_vuc ?? n.id_khu_vuc}`, href: `/nhat_ky_bao_tri?xem=${n.id}` }))
    },
  },

  // ── Danh mục & trùng lặp ──
  {
    key: 'chu_unicode', group: 'Chuẩn hóa & trùng lặp', title: 'Chữ lệch chuẩn (kiểu gõ dấu khác nhau, khoảng trắng thừa đầu/cuối)', level: 'thong_tin', mode: 'auto',
    hint: 'Đưa về một kiểu gõ dấu tiếng Việt và bỏ khoảng trắng thừa ở đầu, cuối. Mặt chữ không đổi; giúp tìm kiếm và lọc không bị sót.',
    scan: async (c) => (await textFixes(c)).map((x) => ({ id: `${x.t}:${x.id}`, label: `${x.t} · ${x.id}`, detail: `Cột: ${x.sample}` })),
    fix: async (c, a) => {
      const todo = await textFixes(c)
      await each(todo, (x) => update(x.t, x.id, x.patch, x.key), 16)
      await audit(a, 'bao_tri_du_lieu', 'chu_unicode', 'fix', { rows: todo.length, cells: todo.reduce((s, x) => s + Object.keys(x.patch).length, 0) })
      return `Đã chuẩn hóa ${todo.reduce((s, x) => s + Object.keys(x.patch).length, 0)} ô trong ${todo.length} dòng.`
    },
  },
  {
    key: 'chu_bien_the', group: 'Chuẩn hóa & trùng lặp', title: 'Cùng một giá trị nhưng viết hoa / thường khác nhau', level: 'thong_tin', mode: 'auto',
    hint: 'Ví dụ "Quản lý" và "Quản Lý", "cái" và "Cái": gộp về cách viết đang dùng nhiều nhất để bộ lọc không hiện hai lần.',
    scan: async (c) => (await categoryFixes(c)).map((x) => ({ id: `${x.t}.${x.col}:${x.from}`, label: `"${x.from}" → "${x.to}"`, detail: `${x.t}.${x.col} · ${x.ids.length} dòng` })),
    fix: async (c, a) => {
      const todo = await categoryFixes(c), rows = todo.flatMap((x) => x.ids.map((id) => [x.t, id, { [x.col]: x.to }] as [string, string, Record<string, string>]))
      await each(rows, ([t, id, p]) => update(t, id, p)); await audit(a, 'bao_tri_du_lieu', 'chu_bien_the', 'fix', { changes: todo.map((x) => `${x.t}.${x.col}: ${x.from} → ${x.to} (${x.ids.length})`) })
      return `Đã gộp ${todo.length} cách viết (${rows.length} dòng).`
    },
  },
  {
    key: 'nv_trung_email', group: 'Chuẩn hóa & trùng lặp', title: 'Nhân viên trùng email', level: 'loi', mode: 'xem', href: '/nhan_vien',
    hint: 'Mỗi người nên có một email riêng để nhận cảnh báo đúng người.',
    scan: async (c) => { const g = new Map<string, any[]>(); for (const r of await c.get('nhan_vien')) if (r.email) g.set(keyOf(r.email), [...(g.get(keyOf(r.email)) ?? []), r]); return [...g.values()].filter((a) => a.length > 1).flat().map((r) => ({ id: r.id, label: `${r.ho_ten} · ${r.email}` })) },
  },
  {
    key: 'kv_trung', group: 'Chuẩn hóa & trùng lặp', title: 'Khu vực trùng tên trên cùng một tầng', level: 'canh_bao', mode: 'xem', href: '/khu_vuc',
    hint: 'Gộp hoặc đặt tên khác nhau để chọn khu vực không nhầm.',
    scan: async (c) => { const g = new Map<string, any[]>(); for (const r of await c.get('khu_vuc')) { const k = `${keyOf(r.tang)}|${keyOf(r.ten_khu_vuc)}`; g.set(k, [...(g.get(k) ?? []), r]) } return [...g.values()].filter((a) => a.length > 1).flat().map((r) => ({ id: r.id, label: `${r.id} · ${r.ten_khu_vuc} · ${r.tang ?? ''}` })) },
  },

  // ── Dọn dẹp ──
  {
    key: 'don_nhat_ky_cu', group: 'Dọn dẹp', title: 'Nhật ký đăng nhập và email cảnh báo cũ hơn 12 tháng', level: 'thong_tin', mode: 'auto',
    hint: 'Xóa bớt nhật ký quá cũ cho cơ sở dữ liệu gọn và nhanh. Nhật ký thao tác (ai sửa gì) luôn được giữ.',
    scan: async (c) => {
      const lim = new Date(Date.now() - 365 * 864e5).toISOString()
      return [...(await c.get('lich_su_dang_nhap')).filter((r) => r.thoi_gian && r.thoi_gian < lim).map((r) => ({ id: `dn:${r.id}`, label: `Đăng nhập ${vnDate(r.thoi_gian)} · ${r.email ?? ''}` })),
        ...(await c.get('nhat_ky_email_canh_bao')).filter((r) => r.ngay_gui && String(r.ngay_gui) < lim).map((r) => ({ id: `em:${r.id}`, label: `Email ${String(r.ngay_gui).slice(0, 10)} · ${cut(r.tieu_de, 50)}` }))]
    },
    fix: async (_c, a) => {
      const lim = new Date(Date.now() - 365 * 864e5).toISOString(), db = supabaseAdmin()
      const x = await db.from('lich_su_dang_nhap').delete().lt('thoi_gian', lim).select('id'), y = await db.from('nhat_ky_email_canh_bao').delete().lt('ngay_gui', lim).select('id')
      if (x.error || y.error) throw new Error((x.error ?? y.error)!.message)
      await audit(a, 'bao_tri_du_lieu', 'don_nhat_ky_cu', 'fix', { dang_nhap: x.data?.length, email: y.data?.length })
      return `Đã xóa ${x.data?.length ?? 0} lượt đăng nhập và ${y.data?.length ?? 0} email cảnh báo cũ.`
    },
  },
]

export const GROUPS = ['Kho & đề xuất', 'Liên kết giữa các bảng', 'Công việc', 'Cho thuê & tiền điện', 'Thiết bị & bảo trì', 'Chuẩn hóa & trùng lặp', 'Dọn dẹp']

export interface ScanResult {
  key: string; group: string; title: string; level: Level; mode: Mode; hint: string; href?: string; count: number; items: Item[]; acts?: Act[]; error?: string
}
export async function scanAll(c = new Ctx()): Promise<ScanResult[]> {
  return Promise.all(CHECKS.map(async (k) => {
    const base = { key: k.key, group: k.group, title: k.title, level: k.level, mode: k.mode, hint: k.hint, href: k.href, acts: k.acts }
    try { const items = await k.scan(c); return { ...base, count: items.length, items: items.slice(0, 300) } }
    catch (e: any) { return { ...base, count: 0, items: [], error: String(e?.message ?? e).slice(0, 160) } }
  }))
}
export const findCheck = (key: string) => CHECKS.find((k) => k.key === key)

/** what the bell and the nightly job remember about the last scan */
export const SUMMARY_KEY = 'bao_tri_du_lieu'
export async function saveSummary(rs: ScanResult[]) {
  const open = rs.filter((r) => r.count > 0 && r.level !== 'thong_tin')
  // counted in checks (not rows) so 140 typed names do not flood the bell
  const s = { at: new Date().toISOString(), loi: open.filter((r) => r.level === 'loi').length, canh_bao: open.filter((r) => r.level === 'canh_bao').length,
    top: open.sort((a, b) => (a.level === 'loi' ? 0 : 1) - (b.level === 'loi' ? 0 : 1) || b.count - a.count).slice(0, 4).map((r) => `${r.title} (${r.count})`) }
  await supabaseAdmin().from('cau_hinh_he_thong').upsert({ khoa: SUMMARY_KEY, gia_tri: JSON.stringify(s), nguoi_sua: 'Hệ thống', updated_at: new Date().toISOString() }, { onConflict: 'khoa' })
  return s
}
