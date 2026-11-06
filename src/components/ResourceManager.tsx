'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  Plus, Search, X, Pencil, Trash2, ChevronLeft, ChevronRight, Inbox, Loader2, Lock, Zap, Eye, List, Printer,
  RotateCw, CheckCircle2, Filter,
} from 'lucide-react'
import Portal from '@/components/Portal'
import { Action, Field, getResource, visibleInList, formatDate, PROPOSAL_KINDS } from '@/lib/resources'

type Row = Record<string, any>
type Option = { value: string; label: string }
export type UiPerms = { create: boolean; edit: boolean; delete: boolean; approve: boolean }

const RED = /QUÁ HẠN|TRỄ|HẾT HẠN|DƯỚI TỒN|Từ chối|Hủy|Đã thanh lý|THIẾU/i
const AMBER = /SẮP|ĐẾN HẠN|CẦN LÀM|Chờ duyệt|Nháp|Bảo trì|Hẹn|Chờ thanh lý|Đang thực hiện|ĐANG LÀM/i
const GREEN = /HOÀN THÀNH|CÒN LỊCH|Hoàn thành|Đã duyệt|Đã chốt|Hoạt động|Trong kho|Đã ra|Trống|Đang sử dụng|Đang thuê/i
const BLUE = /CHỜ NGÀY GỐC|CHƯA BẮT ĐẦU|Chưa thực hiện|Đang trong tòa nhà|Mới/i
const tone = (v: string) => (RED.test(v) ? 'red' : AMBER.test(v) ? 'amber' : BLUE.test(v) ? 'blue' : GREEN.test(v) ? 'green' : 'gray')
const pill = (v: string) => `pill-${tone(v)}`
const STATUS_FIELDS = new Set(['canh_bao', 'trang_thai', 'trang_thai_su_dung', 'muc_do', 'muc_do_tiem_nang'])
const RIGHT = /don_gia|so_luong|thanh_tien|tong_tien|so_kwh|chi_so|ton_|tong_nhap|tong_xuat|dien_tich|so_ngay/

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))
async function api(url: string, init?: RequestInit) {
  // reads retry on flaky mobile networks / busy server; writes are never repeated automatically
  const safe = !init?.method || init.method === 'GET'
  let r: Response | null = null
  for (let i = 0; i < (safe ? 3 : 1); i++) {
    try { r = await fetch(url, { ...init, headers: { 'Content-Type': 'application/json' } }) } catch { r = null }
    if (r && r.status < 500 && r.status !== 429) break
    if (i < 2 && safe) await sleep(500 * (i + 1))
  }
  if (!r) throw new Error('Mất kết nối mạng. Kiểm tra sóng rồi bấm Làm mới.')
  const j = await r.json().catch(() => ({ success: false, error: r!.status >= 500 ? 'Máy chủ đang bận, bấm Làm mới để thử lại' : 'Phản hồi không hợp lệ' }))
  if (r.status === 401) { window.location.href = '/login'; throw new Error('Phiên đăng nhập đã hết') }
  if (!j.success) throw new Error(j.error || 'Có lỗi xảy ra')
  return j
}

/** Loads dropdown options for every ref field in the given field lists. */
function useRefOptions(fieldLists: Field[][]) {
  const [refs, setRefs] = useState<Record<string, Option[]>>({})
  const keys = useMemo(
    () => Array.from(new Set(fieldLists.flat().filter((f) => f.type === 'ref').map((f) => f.ref!))).sort().join(','),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [fieldLists.map((l) => l.map((f) => f.name).join()).join('|')]
  )
  useEffect(() => {
    keys.split(',').filter(Boolean).forEach((k) =>
      api(`/api/${k}?options=1`).then((j) => setRefs((r) => ({ ...r, [k]: j.data }))).catch(() => {}))
  }, [keys])
  const labels = useMemo(() => {
    const m: Record<string, Map<string, string>> = {}
    for (const [k, list] of Object.entries(refs)) m[k] = new Map(list.map((o) => [o.value, o.label]))
    return m
  }, [refs])
  return { refs, labels }
}

function display(f: Field, v: any, labels: Record<string, Map<string, string>>) {
  if (v === null || v === undefined || v === '') return <span className="text-navy-300">—</span>
  if (f.type === 'ref') return labels[f.ref!]?.get(v) ?? v
  if (f.name === 'loai_de_xuat') return PROPOSAL_KINDS[v] ?? v
  if (f.name === 'loai_giao_dich') return <span className={v === 'NHAP' ? 'pill-green' : 'pill-amber'}>{v === 'NHAP' ? 'Nhập' : v === 'XUAT' ? 'Xuất' : v}</span>
  if (f.type === 'bool') return v ? <span className="pill-green">Có</span> : <span className="text-navy-300">—</span>
  if (f.type === 'date') return <span className="tabular-nums">{formatDate(v)}</span>
  if (f.type === 'money') return <span className="tabular-nums">{new Intl.NumberFormat('en-US').format(Number(v))}</span>
  if (f.type === 'number') {
    const n = Number(v)
    return <span className={`tabular-nums ${f.name === 'so_ngay_con_lai' && n < 0 ? 'text-red-600 font-bold' : ''}`}>{new Intl.NumberFormat('en-US').format(n)}</span>
  }
  if (STATUS_FIELDS.has(f.name)) return <span className={pill(String(v))}>{String(v)}</span>
  return String(v)
}

/* ── V191 building blocks ──────────────────────────────────────────── */
const TILE_COLORS = {
  blue: 'border-b-blue-600 [&_svg]:text-blue-600', green: 'border-b-green-600 [&_svg]:text-green-600', teal: 'border-b-teal-600 [&_svg]:text-teal-600',
  orange: 'border-b-orange-500 [&_svg]:text-orange-500', red: 'border-b-red-600 [&_svg]:text-red-600', navy: 'border-b-navy-700 [&_svg]:text-navy-700',
  slate: 'border-b-navy-500 [&_svg]:text-navy-600', violet: 'border-b-violet-600 [&_svg]:text-violet-600', amber: 'border-b-amber-500 [&_svg]:text-amber-600',
}
export function Tile({ icon: Icon, label, color, onClick, disabled, title }: {
  icon: React.ComponentType<{ className?: string }>; label: string; color: keyof typeof TILE_COLORS; onClick: () => void; disabled?: boolean; title?: string
}) {
  return (
    <button type="button" onClick={onClick} disabled={disabled} title={title ?? label}
      className={`shrink-0 flex flex-col items-center justify-center gap-0.5 min-w-[70px] h-[56px] px-1.5 rounded-[9px] bg-white border border-navy-200 border-b-[3px] shadow-[0_1px_2px_rgba(16,24,40,.06)] text-[12px] font-bold text-navy-900 transition hover:-translate-y-px hover:shadow-md disabled:opacity-35 disabled:hover:translate-y-0 disabled:hover:shadow-none disabled:cursor-not-allowed ${TILE_COLORS[color]}`}>
      <Icon className="h-5 w-5" />
      <span className="whitespace-nowrap">{label}</span>
    </button>
  )
}

const TAB_TONES: Record<string, string> = {
  amber: 'bg-orange-50 border-orange-300 text-orange-800', red: 'bg-red-50 border-red-300 text-red-700', green: 'bg-green-50 border-green-300 text-green-800',
  blue: 'bg-blue-50 border-blue-300 text-blue-800', gray: 'bg-navy-50 border-navy-300 text-navy-800',
}

function MonthCalendar({ month, setMonth, counts, day, setDay, unit, fields, field, setField, onLatest, loading }: {
  month: Date; setMonth: (d: Date) => void; counts: Record<string, number>; day: string | null; setDay: (d: string | null) => void
  unit: string; fields?: { name: string; label: string }[]; field: string; setField: (f: string) => void; onLatest: () => void; loading: boolean
}) {
  const monthTotal = Object.values(counts).reduce((a, b) => a + b, 0)
  const y = month.getFullYear(), m = month.getMonth()
  const startDow = (new Date(y, m, 1).getDay() + 6) % 7 // Monday first
  const daysIn = new Date(y, m + 1, 0).getDate()
  const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Ho_Chi_Minh' }).format(new Date())
  const cells: { d: Date; inMonth: boolean }[] = []
  for (let i = startDow; i > 0; i--) cells.push({ d: new Date(y, m, 1 - i), inMonth: false })
  for (let i = 1; i <= daysIn; i++) cells.push({ d: new Date(y, m, i), inMonth: true })
  for (let i = 1; cells.length % 7; i++) cells.push({ d: new Date(y, m + 1, i), inMonth: false })
  return (
    <div className="card overflow-hidden shrink-0">
      <div className="flex items-center justify-between bg-[#2189e6] text-white px-2 py-1.5">
        <button className="grid place-items-center h-7 w-7 rounded bg-white/15 hover:bg-white/25" onClick={() => setMonth(new Date(y, m - 1, 1))} aria-label="Tháng trước"><ChevronLeft className="h-4 w-4" /></button>
        <span className="text-[13px] font-extrabold">Tháng {m + 1} / {y}</span>
        <button className="grid place-items-center h-7 w-7 rounded bg-white/15 hover:bg-white/25" onClick={() => setMonth(new Date(y, m + 1, 1))} aria-label="Tháng sau"><ChevronRight className="h-4 w-4" /></button>
      </div>
      {fields && fields.length > 1 && (
        <div role="tablist" aria-label="Đếm theo ngày" className="flex gap-1 px-1.5 pt-1.5">
          {fields.map((f) => (
            <button key={f.name} role="tab" aria-selected={field === f.name} onClick={() => setField(f.name)}
              className={`flex-1 h-7 rounded-md text-[11.5px] font-bold ${field === f.name ? 'bg-[#2189e6] text-white' : 'bg-navy-100 text-navy-700 hover:bg-navy-200'}`}>{f.label}</button>
          ))}
        </div>
      )}
      <div className="grid grid-cols-7 px-1.5 pt-1.5 text-center text-[11px] font-semibold text-[#2189e6]">
        {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map((d) => <span key={d}>{d}</span>)}
      </div>
      <div className="grid grid-cols-7 gap-y-0.5 px-1.5 pb-1.5 text-center text-[12.5px]">
        {cells.map(({ d, inMonth }) => {
          const k = iso(d), n = counts[k] ?? 0, sel = day === k
          return (
            <button key={k} onClick={() => inMonth && setDay(sel ? null : k)} disabled={!inMonth}
              className={`relative mx-auto h-7 w-7 rounded-md tabular-nums ${!inMonth ? 'text-navy-300' : sel ? 'bg-[#2189e6] text-white font-bold' : k === today ? 'ring-1 ring-[#2189e6] font-bold text-navy-900' : 'text-navy-800 hover:bg-navy-100'}`}>
              {d.getDate()}
              {inMonth && n > 0 && <span className="absolute -top-1 -right-1.5 min-w-[15px] h-[15px] px-0.5 rounded-full bg-brand-400 text-white text-[9px] font-black leading-[15px]">{n > 99 ? '99+' : n}</span>}
            </button>
          )
        })}
      </div>
      <div className="border-t border-navy-200 px-2.5 py-1.5 text-[12px] text-navy-900">
        {loading ? <span className="text-ink-mute">Đang đếm…</span> : monthTotal > 0
          ? <span><b className="text-brand-400">{monthTotal.toLocaleString('vi-VN')}</b> {unit} trong tháng</span>
          : <span className="text-ink-mute">Tháng này chưa có {unit}. <button className="font-bold text-[#2189e6] underline" onClick={onLatest}>Đến tháng có dữ liệu</button></span>}
        <div className="font-bold mt-0.5">Hôm nay: {formatDate(today)}</div>
      </div>
    </div>
  )
}

/* ── main ──────────────────────────────────────────────────────────── */
export default function ResourceManager({
  resourceKey, title, filters = {}, perms, compact = false,
}: { resourceKey: string; title?: string; filters?: Record<string, string>; perms: UiPerms; compact?: boolean }) {
  const res = getResource(resourceKey)!
  const [rows, setRows] = useState<Row[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [query, setQuery] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const [filterOpen, setFilterOpen] = useState(false) // phone: V191-style filter sheet
  const [status, setStatus] = useState('')
  const [side, setSide] = useState('')
  const [day, setDay] = useState<string | null>(null)
  const [month, setMonth] = useState(() => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), 1) })
  const [calField, setCalField] = useState(res.dateField ?? '')
  const [calLoading, setCalLoading] = useState(false)
  const autoJumped = useRef(false)
  const [loading, setLoading] = useState(true)
  const [version, setVersion] = useState(0)
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)
  const [editing, setEditing] = useState<Row | null>(null)
  const [viewing, setViewing] = useState<Row | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null) // V191: select a row, then use the toolbar
  const [acting, setActing] = useState<{ action: Action; row: Row | null } | null>(null)
  const [statusCounts, setStatusCounts] = useState<Record<string, number>>({})
  const [dayCounts, setDayCounts] = useState<Record<string, number>>({})
  const [sideValues, setSideValues] = useState<string[]>([])
  const pageSize = compact ? 200 : 50

  const statusField = res.fields.find((f) => f.name === 'trang_thai' && f.type === 'select' && !filters.trang_thai)
  const sideField = !compact && res.sideFilter && !(res.sideFilter in filters) ? res.fields.find((f) => f.name === res.sideFilter) : undefined
  const hasCalendar = !compact && !!res.dateField
  const listFields = res.fields.filter((f) => visibleInList(f) && !(f.name in filters))
  const { refs, labels } = useRefOptions([res.fields, ...(res.actions ?? []).map((a) => a.fields ?? [])])
  const allowed = (a: Action) => a.perm === 'view' || perms[a.perm as keyof UiPerms]
  const rowActions = (res.actions ?? []).filter((a) => (a.scope ?? 'row') === 'row' && allowed(a))
  const pageActions = (res.actions ?? []).filter((a) => a.scope === 'page' && allowed(a))
  const filterKey = JSON.stringify(filters)
  const sideName = sideField?.name

  // every active filter, optionally leaving out the one being counted
  const baseParams = useCallback((omit: { status?: boolean; day?: boolean } = {}) => {
    const sp = new URLSearchParams(JSON.parse(filterKey))
    if (query) sp.set('search', query)
    if (status && !omit.status) sp.set('trang_thai', status)
    if (side && sideName) sp.set(sideName, side)
    if (day && !omit.day) { sp.set('from', day); sp.set('to', day); sp.set('dateField', calField) }
    return sp
  }, [filterKey, query, status, side, sideName, day, calField])

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const sp = baseParams(); sp.set('page', String(page)); sp.set('pageSize', String(pageSize))
      const j = await api(`/api/${res.key}?${sp}`)
      setRows(j.data); setTotal(j.total); setVersion((v) => v + 1)
    } catch (e: any) { setMsg({ type: 'err', text: e.message }) } finally { setLoading(false) }
  }, [res.key, baseParams, page, pageSize])
  useEffect(() => { load() }, [load])

  // status tab counts
  useEffect(() => {
    if (compact || !statusField) return
    const sp = baseParams({ status: true }); sp.set('countBy', 'trang_thai')
    api(`/api/${res.key}?${sp}`).then((j) => setStatusCounts(j.data)).catch(() => {})
  }, [version]) // eslint-disable-line react-hooks/exhaustive-deps

  // calendar badges for the visible month
  useEffect(() => {
    if (!hasCalendar) return
    const y = month.getFullYear(), m = month.getMonth(), mm = String(m + 1).padStart(2, '0')
    const sp = baseParams({ day: true })
    sp.set('dateField', calField)
    sp.set('from', `${y}-${mm}-01`); sp.set('to', `${y}-${mm}-${new Date(y, m + 1, 0).getDate()}`); sp.set('countBy', calField)
    setCalLoading(true)
    api(`/api/${res.key}?${sp}`).then((j) => {
      const c = j.data as Record<string, number>
      setDayCounts(c)
      // first open on an empty month: show the latest month that has records instead of a blank calendar
      if (!autoJumped.current) { autoJumped.current = true; if (!Object.keys(c).length) jumpLatest() }
    }).catch(() => {}).finally(() => setCalLoading(false))
  }, [version, month, calField]) // eslint-disable-line react-hooks/exhaustive-deps

  function jumpLatest() {
    const sp = baseParams({ day: true })
    sp.set('dateField', calField); sp.set('latest', '1'); sp.set('pageSize', '1')
    api(`/api/${res.key}?${sp}`).then((j) => {
      const v = j.data?.[0]?.[calField]
      if (v) { const [yy, mo] = String(v).split('-').map(Number); setMonth(new Date(yy, mo - 1, 1)) }
    }).catch(() => {})
  }

  useEffect(() => {
    if (!sideName) return
    api(`/api/${res.key}?distinct=${sideName}`).then((j) => setSideValues(j.data)).catch(() => {})
  }, [res.key, sideName])

  // phone header's "Tìm trang này…" box
  useEffect(() => {
    if (compact) return
    const on = (e: Event) => setSearch(String((e as CustomEvent).detail ?? ''))
    window.addEventListener('pl-search', on)
    return () => window.removeEventListener('pl-search', on)
  }, [compact])
  useEffect(() => { const t = setTimeout(() => { setPage(1); setQuery(search.trim()) }, 350); return () => clearTimeout(t) }, [search])
  useEffect(() => { if (msg?.type === 'ok') { const t = setTimeout(() => setMsg(null), 3500); return () => clearTimeout(t) } }, [msg])
  useEffect(() => { setPage(1) }, [status, side, day])
  const flash = (text: string, type: 'ok' | 'err' = 'ok') => setMsg({ type, text })

  async function refreshViewing(id: string) {
    try { const j = await api(`/api/${res.key}/${id}`); setViewing(j.data) } catch { setViewing(null) }
  }
  async function remove(row: Row) {
    if (!confirm(`Xóa ${res.singular} ${row.id}? Bản sao dữ liệu được lưu trong nhật ký hệ thống.`)) return
    try { await api(`/api/${res.key}/${row.id}`, { method: 'DELETE' }); flash('Đã xóa'); setViewing(null); setSelectedId(null); load() }
    catch (e: any) { flash(e.message, 'err') }
  }
  async function run(action: Action, row: Row | null, input: Row = {}) {
    if (!action.fields?.length && action.confirm && !confirm(action.confirm)) return
    try {
      const j = await api(`/api/${res.key}/${row?.id ?? '_'}/${action.key}`, { method: 'POST', body: JSON.stringify(input) })
      flash(j.data?.message ?? `${action.label}: đã xong`)
      setActing(null); load()
      if (row && viewing) refreshViewing(row.id)
    } catch (e: any) { if (!action.fields?.length) flash(e.message, 'err'); throw e }
  }
  function resetAll() { setStatus(''); setSide(''); setDay(null); setSearch(''); setQuery(''); setSearchOpen(false); setSelectedId(null) }

  const pages = Math.max(1, Math.ceil(total / pageSize))
  const canCreate = perms.create && !res.noCreate
  const canEdit = perms.edit && !res.noEdit
  const canDelete = perms.delete && !res.noDelete
  const from = total ? (page - 1) * pageSize + 1 : 0
  const to = Math.min(total, page * pageSize)
  const selected = rows.find((r) => r.id === selectedId) ?? null
  const lockedMsg = selected ? res.locked?.(selected) ?? null : null
  const withRow = (fn: (r: Row) => void) => () => { if (selected) fn(selected) }
  const doAction = (a: Action, r: Row | null) => (a.fields?.length ? setActing({ action: a, row: r }) : run(a, r).catch(() => {}))
  const refLabel = (f: Field | undefined, v: string) => (f?.type === 'ref' ? labels[f.ref!]?.get(v) ?? v : v)

  /* ── table (shared by full and compact views) ── */
  const table = (
    <div className={`overflow-auto print:max-h-none print:overflow-visible ${compact ? 'max-h-[360px]' : 'max-h-[70vh] min-h-[260px] lg:max-h-none lg:flex-1 lg:min-h-0'}`}>
      <table className="w-full text-[13.5px] border-separate border-spacing-0">
        <thead>
          <tr className="text-[13px] font-extrabold text-navy-900">
            {res.key !== 'users' && <th className="sticky top-0 z-[1] bg-navy-50 border-b border-navy-200 px-3 py-2.5 whitespace-nowrap text-center">Mã</th>}
            {listFields.map((f) => <th key={f.name} className="sticky top-0 z-[1] bg-navy-50 border-b border-l border-navy-200 px-3 py-2.5 whitespace-nowrap text-center">{f.label}</th>)}
          </tr>
        </thead>
        <tbody>
          {loading && rows.length === 0 ? (
            [...Array(compact ? 2 : 10)].map((_, i) => (
              <tr key={i}><td colSpan={listFields.length + 1} className="px-3 py-3 border-b border-navy-100"><div className="h-3.5 rounded bg-navy-100 animate-pulse" style={{ width: `${60 + ((i * 13) % 35)}%` }} /></td></tr>
            ))
          ) : rows.length === 0 ? (
            <tr><td colSpan={listFields.length + 1} className="px-4 py-16 text-center text-ink-mute"><Inbox className="h-8 w-8 mx-auto mb-2 text-navy-300" />Không có dữ liệu</td></tr>
          ) : rows.map((r) => {
            const sel = r.id === selectedId
            const t = tone(String(r.canh_bao || r.trang_thai || ''))
            const bg = sel ? 'bg-select' : t === 'amber' ? 'bg-[#fff6d9]' : t === 'red' && r.canh_bao ? 'bg-red-50/70' : 'bg-white'
            return (
              <tr key={r.id} tabIndex={0} aria-selected={sel}
                onClick={() => (window.matchMedia('(max-width: 1023px)').matches ? setViewing(r) : setSelectedId(sel ? null : r.id))} onDoubleClick={() => setViewing(r)}
                onKeyDown={(e) => { if (e.key === 'Enter') setViewing(r) }}
                className={`cursor-pointer outline-none ${bg} ${sel ? '' : 'hover:brightness-[.97]'} ${loading ? 'opacity-60' : ''}`}>
                {res.key !== 'users' && <td className={`px-3 py-2 border-b border-navy-200/70 text-center whitespace-nowrap tabular-nums ${sel ? 'text-select-accent font-extrabold shadow-[inset_3px_0_0_#2189e6]' : 'text-navy-800 font-semibold'}`}>{r.id}</td>}
                {listFields.map((f) => {
                  const right = RIGHT.test(f.name) || f.type === 'money' || f.type === 'number'
                  const wide = f.type === 'textarea' || f.name === 'noi_dung' || f.name === 'ghi_chu' || f.name === 'ds_ten'
                  return (
                    <td key={f.name} className={`px-3 py-2 border-b border-l border-navy-200/70 align-middle ${right ? 'text-right' : STATUS_FIELDS.has(f.name) ? 'text-center' : ''} ${wide ? 'min-w-[16rem] max-w-md' : 'whitespace-nowrap'}`}>
                      <div className={f.multiline ? 'whitespace-pre-line leading-snug' : wide ? 'line-clamp-2' : ''}>{display(f, r[f.name], labels)}</div>
                    </td>
                  )
                })}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )

  const overlays = (
    <>
      {viewing && (
        <Drawer onClose={() => setViewing(null)}>
          <div className="sticky top-0 z-10 bg-white border-b border-navy-200 px-6 py-4 flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[11px] font-black uppercase tracking-[0.16em] text-brand-400">{res.singular}</p>
              <h2 className="text-lg font-extrabold text-navy-900 truncate">{res.key === 'users' ? viewing.ho_ten : viewing.id}</h2>
            </div>
            <button onClick={() => setViewing(null)} className="btn-ghost h-9 w-9 px-0" aria-label="Đóng"><X className="h-5 w-5" /></button>
          </div>
          <div className="px-6 py-5">
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
              {res.fields.filter((f) => f.type !== 'password' && !f.name.startsWith('ds_')).map((f) => (
                <div key={f.name} className={f.type === 'textarea' ? 'sm:col-span-2' : ''}>
                  <dt className="label">{f.label}</dt>
                  <dd className={f.type === 'textarea' && viewing[f.name] ? 'whitespace-pre-wrap text-sm leading-relaxed bg-canvas rounded-[7px] border border-navy-200 p-3 max-h-80 overflow-y-auto' : 'text-sm text-ink'}>{display(f, viewing[f.name], labels)}</dd>
                </div>
              ))}
            </dl>
            {res.key === 'de_xuat' && (
              <div className="mt-6 pt-5 border-t border-navy-200">
                <ResourceManager compact resourceKey="de_xuat_chi_tiet" title="Chi tiết đề xuất" filters={{ id_de_xuat: viewing.id }}
                  perms={viewing.trang_thai === 'Đã duyệt' ? { create: false, edit: false, delete: false, approve: false } : perms} />
              </div>
            )}
          </div>
          <div className="sticky bottom-0 mt-auto bg-white border-t border-navy-200 px-6 py-3 flex flex-wrap items-center gap-2">
            {rowActions.filter((a) => !a.show || a.show(viewing)).map((a) => (
              <button key={a.key} className="btn-primary" onClick={() => doAction(a, viewing)}><Zap className="h-4 w-4" />{a.label}</button>
            ))}
            {canEdit && !res.locked?.(viewing) && <button className="btn-secondary" onClick={() => setEditing(viewing)}><Pencil className="h-4 w-4" />Sửa</button>}
            {canDelete && !res.locked?.(viewing) && <button className="btn-danger ml-auto" onClick={() => remove(viewing)}><Trash2 className="h-4 w-4" />Xóa</button>}
            {res.locked?.(viewing) && <span className="flex items-center gap-1.5 text-sm text-ink-mute"><Lock className="h-4 w-4" />{res.locked(viewing)}</span>}
          </div>
        </Drawer>
      )}
      {editing && (
        <FormModal title={`${editing.id ? 'Sửa' : 'Thêm'} ${res.singular}`} subtitle={editing.id && res.key !== 'users' ? editing.id : undefined}
          fields={res.fields.filter((f) => !f.ro && f.inForm !== false && (!editing.id || !f.createOnly || f.type === 'password'))}
          initial={editing.id ? editing : { ...filters }} isNew={!editing.id} refs={refs} onClose={() => setEditing(null)}
          onSubmit={async (payload) => {
            if (editing.id && !payload.password) delete payload.password // blank = keep password
            await api(editing.id ? `/api/${res.key}/${editing.id}` : `/api/${res.key}`, { method: editing.id ? 'PATCH' : 'POST', body: JSON.stringify({ ...filters, ...payload }) })
            setEditing(null); flash('Đã lưu'); load()
            if (editing.id && viewing) refreshViewing(editing.id)
          }} />
      )}
      {acting && (
        <FormModal title={acting.action.label} subtitle={acting.row?.id} fields={acting.action.fields ?? []} initial={{}} isNew refs={refs}
          submitLabel={acting.action.label} onClose={() => setActing(null)}
          onSubmit={async (payload) => { await run(acting.action, acting.row, payload) }} />
      )}
    </>
  )

  const message = msg && (
    <div role="status" className={`flex items-start justify-between gap-3 rounded-[9px] border px-4 py-2.5 text-sm font-semibold ${msg.type === 'ok' ? 'bg-green-50 text-green-800 border-green-200' : 'bg-red-50 text-red-800 border-red-200'}`}>
      <span>{msg.text}</span>
      <button onClick={() => setMsg(null)} aria-label="Đóng" className="opacity-60 hover:opacity-100"><X className="h-4 w-4" /></button>
    </div>
  )

  /* ── compact (nested lines inside a record) ── */
  if (compact) return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="text-[15px] font-extrabold text-navy-900 mr-auto">{title ?? res.title}</h3>
        {canCreate && <button className="btn-primary btn-sm" onClick={() => setEditing({})}><Plus className="h-4 w-4" />Thêm</button>}
        {canEdit && <button className="btn-secondary btn-sm" disabled={!selected || !!lockedMsg} onClick={withRow((r) => setEditing(r))}><Pencil className="h-4 w-4" />Sửa</button>}
        {canDelete && <button className="btn-secondary btn-sm" disabled={!selected || !!lockedMsg} onClick={withRow((r) => remove(r))}><Trash2 className="h-4 w-4" />Xóa</button>}
      </div>
      {message}
      <div className="rounded-[9px] border border-navy-200 overflow-hidden">{table}</div>
      {overlays}
    </div>
  )

  /* ── full page, laid out like V191 ── */
  const sideList = sideField ? ['', ...[...sideValues].sort((a, b) => String(refLabel(sideField, a)).localeCompare(String(refLabel(sideField, b)), 'vi'))] : []
  return (
    <div className="flex flex-col flex-1 lg:min-h-0">
      {/* breadcrumb + red title */}
      <div className="shrink-0 flex flex-wrap items-baseline gap-x-5 gap-y-1 px-4 lg:px-5 py-2 bg-white border-b border-navy-200">
        <span className="text-[12.5px] text-ink-mute">PHI LONG / <b className="text-navy-800">{title ?? res.title}</b></span>
        <h1 className="text-[22px] font-black text-brand-400">{title ?? res.title}</h1>
      </div>

      {/* tile toolbar + status tabs */}
      <div className={`shrink-0 flex-col gap-2 lg:flex lg:flex-row lg:flex-wrap lg:items-center px-4 lg:px-5 py-2 bg-white border-b border-navy-200 print:hidden ${statusField ? 'flex' : 'hidden'}`}>
        <div className="hidden lg:contents">
        <Tile icon={Search} label="Tìm" color="blue" onClick={() => setSearchOpen((o) => !o)} />
        {canCreate && <Tile icon={Plus} label="Thêm" color="green" onClick={() => setEditing({})} />}
        <Tile icon={Eye} label="Xem" color="teal" disabled={!selected} onClick={withRow((r) => setViewing(r))} />
        {canEdit && <Tile icon={Pencil} label="Sửa" color="orange" disabled={!selected || !!lockedMsg} title={lockedMsg ?? 'Sửa'} onClick={withRow((r) => setEditing(r))} />}
        {canDelete && <Tile icon={Trash2} label="Xóa" color="red" disabled={!selected || !!lockedMsg} title={lockedMsg ?? 'Xóa'} onClick={withRow((r) => remove(r))} />}
        <Tile icon={List} label="Tất cả" color="navy" onClick={resetAll} />
        {rowActions.map((a) => (
          <Tile key={a.key} icon={a.perm === 'approve' ? CheckCircle2 : Zap} label={a.label} color={a.perm === 'approve' ? 'green' : 'violet'}
            disabled={!selected || (a.show ? !a.show(selected) : false)} onClick={withRow((r) => doAction(a, r))} />
        ))}
        {pageActions.map((a) => <Tile key={a.key} icon={Zap} label={a.label} color="violet" onClick={() => doAction(a, null)} />)}
        <Tile icon={Printer} label="In" color="slate" onClick={() => window.print()} />
        <Tile icon={RotateCw} label="Làm mới" color="blue" onClick={() => load()} />
        </div>

        {statusField && (
          <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 lg:ml-auto lg:flex-wrap lg:overflow-visible lg:pb-0 lg:mx-0 lg:px-0">
            {statusField.options!.map((o) => {
              const on = status === o
              return (
                <button key={o} onClick={() => setStatus(on ? '' : o)}
                  className={`shrink-0 min-w-[112px] h-[56px] px-2.5 rounded-[9px] border-2 text-center transition ${on ? TAB_TONES[tone(o)] + ' shadow-[0_4px_12px_rgba(16,24,40,.12)]' : 'bg-white border-navy-200 text-navy-900 hover:border-navy-300'}`}>
                  <div className="text-[12px] font-black uppercase">{o}</div>
                  <div className="text-[12px] font-semibold opacity-80">{(statusCounts[o] ?? 0).toLocaleString('vi-VN')} {res.singular}</div>
                </button>
              )
            })}
          </div>
        )}
      </div>

      {searchOpen && (
        <div className="flex items-center gap-2 px-4 lg:px-5 py-2.5 bg-[#f8fbff] border-b border-navy-200 print:hidden">
          <Search className="h-4 w-4 text-[#2189e6]" />
          <input autoFocus className="input max-w-lg" type="search" placeholder={`Tìm trong ${(title ?? res.title).toLowerCase()}…`} value={search} onChange={(e) => setSearch(e.target.value)} />
          <button className="btn-ghost btn-sm" onClick={() => { setSearch(''); setSearchOpen(false) }} aria-label="Đóng tìm kiếm"><X className="h-4 w-4" /></button>
        </div>
      )}

      <div className="flex flex-col gap-3 px-4 lg:px-5 py-3 lg:flex-1 lg:min-h-0 print:block">
        {message}
        {(day || side || status || query) && (
          <div className="flex flex-wrap items-center gap-2 text-[12.5px] print:hidden">
            <span className="text-ink-mute font-semibold">Đang lọc:</span>
            {day && <button className="pill-blue" onClick={() => setDay(null)}>Ngày {formatDate(day)} <X className="h-3 w-3" /></button>}
            {side && sideField && <button className="pill-blue" onClick={() => setSide('')}>{sideField.label}: {refLabel(sideField, side)} <X className="h-3 w-3" /></button>}
            {status && <button className="pill-blue" onClick={() => setStatus('')}>{status} <X className="h-3 w-3" /></button>}
            {query && <button className="pill-blue" onClick={() => { setSearch(''); setQuery('') }}>“{query}” <X className="h-3 w-3" /></button>}
          </div>
        )}

        <div className={`grid grid-cols-1 gap-4 lg:flex-1 lg:min-h-0 lg:grid-rows-[minmax(0,1fr)] ${hasCalendar || sideField ? 'lg:grid-cols-[230px_minmax(0,1fr)]' : ''}`}>
          {(hasCalendar || sideField) && (
            <aside className="hidden lg:flex flex-col gap-3 lg:min-h-0 lg:overflow-y-auto print:hidden">
              {hasCalendar && <MonthCalendar month={month} setMonth={setMonth} counts={dayCounts} day={day} setDay={setDay}
                unit={res.singular} fields={res.calendarFields} field={calField} loading={calLoading}
                setField={(f) => { setCalField(f); setDay(null) }} onLatest={jumpLatest} />}
              {sideField && (
                <div className="card overflow-hidden flex flex-col lg:flex-1 lg:min-h-[168px]">
                  <div className="shrink-0 px-3 py-2 bg-navy-50 border-b border-navy-200 text-[13px] font-extrabold text-navy-900">{sideField.label}</div>
                  <div className="max-h-[320px] lg:max-h-none lg:flex-1 lg:min-h-0 overflow-y-auto">
                    {sideList.map((v) => {
                      const on = side === v
                      return (
                        <button key={v || 'all'} onClick={() => setSide(v)}
                          className={`w-full text-left px-3 py-2.5 text-[14px] border-b border-navy-100 last:border-0 ${on ? 'bg-select border-l-4 border-l-[#2189e6] font-extrabold text-navy-900' : 'text-navy-800 hover:bg-navy-50'}`}>
                          {v === '' ? 'Tất cả' : refLabel(sideField, v)}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}
            </aside>
          )}

          <div className="card overflow-hidden min-w-0 flex flex-col lg:min-h-0">
            {table}
            <div className="shrink-0 flex flex-wrap items-center justify-between gap-2 px-3 py-2 border-t border-navy-200 bg-navy-50 text-[13px] text-ink-soft">
              <span className="tabular-nums">{loading ? <Loader2 className="h-4 w-4 animate-spin" /> :
                <>Hiển thị {total ? `${from}–${to}` : '0'} / <b className="text-ink">{total.toLocaleString('vi-VN')}</b> {res.singular}{selected ? <> · đang chọn <b className="text-select-accent">{selected.id}</b></> : ' · bấm để chọn, bấm đúp để xem'}</>}</span>
              {pages > 1 && <div className="flex items-center gap-1 print:hidden">
                <button className="btn-ghost btn-sm" disabled={page <= 1} onClick={() => setPage(page - 1)} aria-label="Trang trước"><ChevronLeft className="h-4 w-4" /></button>
                <span className="px-2 tabular-nums font-semibold">Trang {page}/{pages}</span>
                <button className="btn-ghost btn-sm" disabled={page >= pages} onClick={() => setPage(page + 1)} aria-label="Trang sau"><ChevronRight className="h-4 w-4" /></button>
              </div>}
            </div>
          </div>
        </div>
      </div>
      {(hasCalendar || sideField) && (
        <Portal>
          <button type="button" onClick={() => setFilterOpen(true)} aria-label="Mở bộ lọc"
            className="lg:hidden print:hidden fixed left-0 top-[55%] z-30 grid h-16 w-11 place-items-center rounded-r-2xl bg-brand-400 text-white shadow-[0_4px_14px_rgba(237,50,55,.4)] active:brightness-90">
            <Filter className="h-5 w-5" />
            {(day || side) && <span className="absolute right-1.5 top-1.5 h-2.5 w-2.5 rounded-full bg-white ring-2 ring-brand-400" />}
          </button>
        </Portal>
      )}
      {filterOpen && (
        <FilterSheet onClose={() => setFilterOpen(false)}>
          <div className="grid grid-cols-4 gap-2 p-3">
            <Tile icon={Search} label="Tìm" color="blue" onClick={() => { setFilterOpen(false); setSearchOpen(true) }} />
            {canCreate ? <Tile icon={Plus} label={`Thêm`} color="green" onClick={() => { setFilterOpen(false); setEditing({}) }} /> : <span />}
            <Tile icon={List} label="Tất cả" color="teal" onClick={() => { resetAll(); setFilterOpen(false) }} />
            <Tile icon={RotateCw} label="Làm mới" color="violet" onClick={() => { load(); setFilterOpen(false) }} />
            {pageActions.map((a) => <Tile key={a.key} icon={Zap} label={a.label} color="violet" onClick={() => { setFilterOpen(false); doAction(a, null) }} />)}
          </div>
          {hasCalendar && <DatePick month={month} setMonth={setMonth} day={day} setDay={setDay} fields={res.calendarFields} field={calField} setField={(f) => { setCalField(f); setDay(null) }} />}
          {sideField && (
            <div className="mx-3 mb-3 overflow-hidden rounded-[9px] border border-navy-200">
              <div className="bg-navy-50 px-3 py-2 text-[14px] font-extrabold text-navy-900">{sideField.label}</div>
              {sideList.map((v) => {
                const on = side === v
                return (
                  <button key={v || 'all'} onClick={() => { setSide(v); setFilterOpen(false) }}
                    className={`block w-full border-b border-navy-100 px-3 py-3.5 text-left text-[16px] last:border-0 ${on ? 'border-l-4 border-l-[#2189e6] bg-select font-extrabold text-navy-900' : 'text-navy-800 active:bg-navy-50'}`}>
                    {v === '' ? `Tất cả ${sideField.label.toLowerCase()}`.replace('người thực hiện', 'nhân viên') : refLabel(sideField, v)}
                  </button>
                )
              })}
            </div>
          )}
        </FilterSheet>
      )}
      {overlays}
    </div>
  )
}

const todayVn = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Ho_Chi_Minh' }).format(new Date())

function FilterSheet({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  useEscape(onClose)
  return (<Portal>
    <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/45" onClick={onClose} />
      <div className="absolute inset-x-3 bottom-3 flex max-h-[82vh] flex-col overflow-hidden rounded-2xl bg-white shadow-pop">
        <div className="flex shrink-0 items-center justify-between bg-brand-400 px-4 py-3 text-white">
          <h2 className="text-[19px] font-extrabold">Bộ lọc</h2>
          <button onClick={onClose} aria-label="Đóng" className="grid h-9 w-9 place-items-center"><X className="h-6 w-6" /></button>
        </div>
        <div className="overflow-y-auto overscroll-contain">{children}</div>
      </div>
    </div>
  </Portal>)
}

/** Ngày / Tháng / Năm selectors + Hôm nay / Tất cả, as in V191's phone filter. */
function DatePick({ month, setMonth, day, setDay, fields, field, setField }: {
  month: Date; setMonth: (d: Date) => void; day: string | null; setDay: (d: string | null) => void
  fields?: { name: string; label: string }[]; field: string; setField: (f: string) => void
}) {
  const y = month.getFullYear(), m = month.getMonth() + 1
  const dim = new Date(y, m, 0).getDate()
  const d = day ? Number(day.slice(8, 10)) : 0
  const iso = (yy: number, mm: number, dd: number) => `${yy}-${String(mm).padStart(2, '0')}-${String(dd).padStart(2, '0')}`
  const years = Array.from({ length: 6 }, (_, i) => new Date().getFullYear() - 4 + i)
  const apply = (dd: number, mm: number, yy: number) => {
    setMonth(new Date(yy, mm - 1, 1))
    setDay(dd ? iso(yy, mm, Math.min(dd, new Date(yy, mm, 0).getDate())) : null)
  }
  const sel = 'h-11 w-full rounded-[8px] border border-navy-200 bg-white px-1 text-[15px] font-semibold text-navy-900'
  return (
    <div className="mx-3 mb-3 rounded-[9px] border border-navy-200 bg-white p-3">
      <div className="grid grid-cols-3 gap-2">
        <label className="text-[12px] font-extrabold uppercase text-ink-mute">Ngày
          <select className={sel} value={d} onChange={(e) => apply(Number(e.target.value), m, y)}>
            <option value={0}>Tất cả</option>{Array.from({ length: dim }, (_, i) => <option key={i + 1} value={i + 1}>{i + 1}</option>)}
          </select></label>
        <label className="text-[12px] font-extrabold uppercase text-ink-mute">Tháng
          <select className={sel} value={m} onChange={(e) => apply(d, Number(e.target.value), y)}>
            {Array.from({ length: 12 }, (_, i) => <option key={i + 1} value={i + 1}>Tháng {i + 1}</option>)}
          </select></label>
        <label className="text-[12px] font-extrabold uppercase text-ink-mute">Năm
          <select className={sel} value={y} onChange={(e) => apply(d, m, Number(e.target.value))}>
            {years.map((v) => <option key={v} value={v}>{v}</option>)}
          </select></label>
      </div>
      {fields && fields.length > 1 && (
        <label className="mt-2 block text-[12px] font-extrabold uppercase text-ink-mute">Lọc theo
          <select className={sel} value={field} onChange={(e) => setField(e.target.value)}>
            {fields.map((f) => <option key={f.name} value={f.name}>{f.label}</option>)}
          </select></label>
      )}
      <div className="mt-3 grid grid-cols-2 gap-2">
        <button className="h-11 rounded-[8px] border border-[#9cc7ee] bg-[#eef6ff] text-[15px] font-extrabold text-[#1769b8]" onClick={() => { const t = todayVn(); apply(Number(t.slice(8, 10)), Number(t.slice(5, 7)), Number(t.slice(0, 4))) }}>Hôm nay</button>
        <button className="h-11 rounded-[8px] border border-[#9ad7c9] bg-[#effaf6] text-[15px] font-extrabold text-[#0f766e]" onClick={() => setDay(null)}>Tất cả</button>
      </div>
    </div>
  )
}

function useEscape(onClose: () => void) {
  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', k)
    document.body.style.overflow = 'hidden'
    return () => { window.removeEventListener('keydown', k); document.body.style.overflow = '' }
  }, [onClose])
}

function Drawer({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  useEscape(onClose)
  return (<Portal>
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-navy-950/40" onClick={onClose} />
      <div className="absolute right-0 top-0 h-full w-full sm:max-w-2xl bg-white shadow-pop overflow-y-auto flex flex-col">{children}</div>
    </div>
  </Portal>)
}

function FormModal({ title, subtitle, fields, initial, isNew, refs, onClose, onSubmit, submitLabel = 'Lưu' }: {
  title: string; subtitle?: string; fields: Field[]; initial: Row; isNew: boolean; refs: Record<string, Option[]>
  onClose: () => void; onSubmit: (payload: Row) => Promise<void>; submitLabel?: string
}) {
  useEscape(onClose)
  const [form, setForm] = useState<Row>(() => {
    const v: Row = {}
    for (const f of fields) v[f.name] = f.type === 'password' ? '' : initial[f.name] ?? (isNew ? f.default ?? (f.type === 'bool' ? false : '') : f.type === 'bool' ? false : '')
    return v
  })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const wide = (f: Field) => f.type === 'textarea' || f.name === 'noi_dung' || f.type === 'bool'

  return (<Portal>
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center sm:p-6" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-navy-950/50" onClick={onClose} />
      <form onSubmit={async (e) => {
        e.preventDefault(); setBusy(true); setError('')
        try { await onSubmit({ ...form }) } catch (err: any) { setError(err.message); setBusy(false) }
      }} className="relative w-full sm:max-w-2xl max-h-[92vh] flex flex-col bg-white rounded-t-2xl sm:rounded-xl shadow-pop overflow-hidden">
        <div className="flex items-center justify-between gap-3 px-5 py-3 bg-brand-400 text-white">
          <div>
            <h2 className="text-[16px] font-extrabold">{title}</h2>
            {subtitle && <p className="text-xs font-semibold text-white/80">{subtitle}</p>}
          </div>
          <button type="button" onClick={onClose} className="grid place-items-center h-8 w-8 rounded-md hover:bg-white/15" aria-label="Đóng"><X className="h-5 w-5" /></button>
        </div>
        <div className="px-5 py-4 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3.5">
          {fields.map((f) => {
            const required = !!f.required && !(f.type === 'password' && !isNew)
            const set = (v: any) => setForm((s) => ({ ...s, [f.name]: v }))
            const common = { id: `f-${f.name}`, className: 'input', required, value: form[f.name] ?? '', onChange: (e: React.ChangeEvent<any>) => set(e.target.value) }
            if (f.type === 'bool') return (
              <label key={f.name} className="sm:col-span-2 flex items-center gap-3 rounded-[7px] border border-navy-200 px-3 py-2.5 cursor-pointer hover:bg-navy-50">
                <input type="checkbox" className="h-4 w-4 accent-brand-400" checked={!!form[f.name]} onChange={(e) => set(e.target.checked)} />
                <span className="text-sm font-bold text-ink">{f.label}</span>
              </label>
            )
            return (
              <div key={f.name} className={wide(f) ? 'sm:col-span-2' : ''}>
                <label htmlFor={`f-${f.name}`} className="label">{f.label}{required && <span className="text-brand-400"> *</span>}</label>
                {f.type === 'textarea' ? <textarea rows={4} {...common} />
                  : f.type === 'select' ? (
                    <select {...common}>
                      {!required && <option value="">—</option>}
                      {required && !form[f.name] && <option value="">— Chọn —</option>}
                      {form[f.name] && !f.options!.includes(form[f.name]) && <option value={form[f.name]}>{form[f.name]}</option>}
                      {f.options!.map((o) => <option key={o} value={o}>{f.name === 'loai_de_xuat' ? PROPOSAL_KINDS[o] ?? o : o}</option>)}
                    </select>
                  ) : f.type === 'ref' ? (
                    <select {...common}>
                      <option value="">— Chọn —</option>
                      {(refs[f.ref!] ?? []).map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  ) : f.type === 'password' ? (
                    <input type="password" autoComplete="new-password" minLength={8} placeholder={isNew ? '' : 'Để trống nếu không đổi'} {...common} />
                  ) : (
                    <input type={f.type === 'money' ? 'number' : f.type} step={f.type === 'number' || f.type === 'money' ? 'any' : undefined} {...common} />
                  )}
              </div>
            )
          })}
        </div>
        {error && <p className="mx-5 mb-2 rounded-[7px] bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 border border-red-200" role="alert">{error}</p>}
        <div className="flex justify-end gap-2 px-5 py-3 border-t border-navy-200 bg-navy-50">
          <button type="button" className="btn-secondary" onClick={onClose}>Hủy</button>
          <button className="btn-primary min-w-[96px]" disabled={busy}>{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : submitLabel}</button>
        </div>
      </form>
    </div>
  </Portal>)
}
