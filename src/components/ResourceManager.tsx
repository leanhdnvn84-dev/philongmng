'use client'

import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  Plus, Search, X, Pencil, Trash2, ChevronLeft, ChevronRight, Inbox, Loader2, Lock, Zap, Eye, List, Printer,
  RotateCw, CheckCircle2, Filter, History, Monitor, FileText, FileDown, PackageCheck, PackageX, Boxes, AlertTriangle,
} from 'lucide-react'
import Portal from '@/components/Portal'
import ProposalForm from '@/components/ProposalForm'
import { ProposalStats } from '@/components/ProposalExtras'
import RecordHistory from '@/components/RecordHistory'
import Attachments, { ATTACHABLE } from '@/components/Attachments'
import { DeviceMaintenance, QrDialog, printQrLabels, type QrDevice } from '@/components/DeviceExtras'
import { QrCode, Scale } from 'lucide-react'
import { PackagePlus } from 'lucide-react'
import StockSide, { StockBatches } from '@/components/StockSide'
import { DailyWorkSummary } from '@/components/ProposalExtras'
import { useConfirm } from '@/components/ConfirmDialog'
import FilterTab from '@/components/FilterTab'
import { phieuHtml, printHtml, downloadWord, downloadPdf, fileName, type Phieu } from '@/lib/proposalDoc'
import { ALERT_CODES, ALERT_MODULES, Action, Field, getResource, visibleInList, formatDate, PROPOSAL_KINDS } from '@/lib/resources'

type Row = Record<string, any>
type Option = { value: string; label: string }
export type UiPerms = { create: boolean; edit: boolean; delete: boolean; approve: boolean; admin?: boolean }

const RED = /QUÁ HẠN|TRỄ|HẾT HẠN|DƯỚI TỒN|Từ chối|Hủy|Đã thanh lý|THIẾU/i
const AMBER = /SẮP|ĐẾN HẠN|CẦN LÀM|Chờ duyệt|Nháp|Bảo trì|Hẹn|Chờ thanh lý|Đang thực hiện|ĐANG LÀM/i
const GREEN = /HOÀN THÀNH|CÒN LỊCH|Hoàn thành|Đã duyệt|Đã chốt|Hoạt động|Trong kho|Đã ra|Trống|Đang sử dụng|Đang thuê/i
const BLUE = /CHỜ NGÀY GỐC|CHƯA BẮT ĐẦU|Chưa thực hiện|Đang trong tòa nhà|Mới/i
const tone = (v: string) => (/ĐÃ BẢO TRÌ|MỚI BẢO TRÌ|^Đạt$/i.test(v) ? 'green' : RED.test(v) ? 'red' : AMBER.test(v) ? 'amber' : BLUE.test(v) ? 'blue' : GREEN.test(v) ? 'green' : 'gray')
const pill = (v: string) => `pill-${tone(v)}`
const vnDay = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Ho_Chi_Minh' }).format(new Date())
const dayDiff = (a: string, b: string) => Math.round((Date.parse(b) - Date.parse(a)) / 864e5)
const dm = (iso: string | null | undefined) => (iso ? `${String(iso).slice(8, 10)}/${String(iso).slice(5, 7)}` : '')
/** V191 "Số ngày": days late when overdue (red), days taken when done (green), days elapsed since assignment otherwise (blue). Only positive numbers show. */
function soNgay(r: any): { n: number; tone: 'red' | 'green' | 'blue'; lines: string[] } {
  const today = vnDay(), giao: string | null = r.ngay_giao ?? r.ngay ?? null, dl: string | null = r.deadline ?? null
  const done = r.canh_bao === 'HOÀN THÀNH', end = done ? (r.ngay_hoan_thanh ?? today) : today
  const used = giao ? Math.max(0, dayDiff(giao, end)) : 0
  const lines: string[] = []
  if (done) {
    lines.push(`Hoàn thành sau ${used} ngày (giao ${dm(giao)} → xong ${dm(end)})`)
    if (dl) { const late = dayDiff(dl, end); lines.push(late > 0 ? `Trễ ${late} ngày so với hạn ${dm(dl)}` : 'Đúng hạn') }
    return { n: used, tone: 'green', lines }
  }
  if (dl && dl < today) {
    const late = dayDiff(dl, today)
    lines.push(`Trễ ${late} ngày (hạn ${dm(dl)})`, `Đã thực hiện ${used} ngày kể từ ngày giao ${dm(giao)}`)
    return { n: late, tone: 'red', lines }
  }
  lines.push(`Đã thực hiện ${used} ngày (giao ${dm(giao)})`)
  if (dl) { const left = dayDiff(today, dl); lines.push(left === 0 ? `Đến hạn hôm nay (${dm(dl)})` : `Còn ${left} ngày đến hạn ${dm(dl)}`) } else lines.push('Chưa đặt hạn hoàn thành')
  return { n: used, tone: 'blue', lines }
}
/** list column sizing: short columns (dates, numbers, status…) keep a fixed width, text columns share what is left in proportion to their weight, so ALL columns show and the table never scrolls sideways */
const isFixedCol = (f: Field) => f.type === 'date' || f.type === 'datetime' || f.type === 'number' || f.type === 'money' || f.type === 'bool'
const fixedW = (f: Field, shortDate: boolean) => (f.type === 'date' ? (shortDate ? 64 : 96) : f.type === 'datetime' ? 124 : f.type === 'money' ? 88 : f.name === 'so_ngay' || f.name === 'so_ngay_con_lai' ? 58 : f.type === 'bool' ? 54 : 66)
// proposal list: number columns only as wide as their heading, the room goes to the name, the reason and the note
const TIGHT_W: Record<string, number> = { ds_ten: 130, ds_nha_cung_cap: 64, ds_don_gia: 88, ds_so_luong: 52, ds_dvt: 48, ds_thanh_tien: 96, id_nguoi_de_xuat: 114, muc_dich_ly_do: 130 }
const flexWeight = (f: Field) => TIGHT_W[f.name] ?? (f.type === 'textarea' || f.name === 'noi_dung' ? (f.name === 'tien_do' ? 140 : f.name === 'cach_thuc_hien' ? 120 : 170)
  : f.name === 'nguoi_lam_cung' ? 160 : f.name === 'don_vi_thuc_hien' ? 165 : f.type === 'email' ? 140 : STATUS_FIELDS_SET.has(f.name) ? 104 : /^id_nguoi/.test(f.name) ? 152 : f.type === 'ref' ? 108 : 100)
const SOFT_TIP = new Set(['tien_do', 'cach_thuc_hien', 'noi_dung'])

const STATUS_FIELDS = new Set(['canh_bao', 'trang_thai', 'trang_thai_su_dung', 'muc_do', 'muc_do_tiem_nang'])
const STATUS_FIELDS_SET = STATUS_FIELDS
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
const rk = (f: Field) => (f.refQuery ? `${f.ref}?${f.refQuery}` : f.ref!)
function useRefOptions(fieldLists: Field[][]) {
  const [refs, setRefs] = useState<Record<string, Option[]>>({})
  const keys = useMemo(
    () => Array.from(new Set(fieldLists.flat().flatMap((f) => [f.type === 'ref' ? rk(f) : '', f.multiRef ?? '', f.nameOf ?? '']).filter(Boolean))).sort().join(','),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [fieldLists.map((l) => l.map((f) => f.name).join()).join('|')]
  )
  useEffect(() => {
    keys.split(',').filter(Boolean).forEach((k) => {
      const [name, q] = k.split('?')
      if (!q) { api(`/api/${name}?options=1`).then((j) => setRefs((r) => ({ ...r, [k]: j.data }))).catch(() => {}); return }
      // filtered picker (e.g. only in-stock items): label shows the stock level
      const rs = getResource(name)
      api(`/api/${name}?pageSize=2000&${q}`).then((j) => {
        const list = (j.data as any[]).map((x) => ({ value: x.id as string, label: `${rs?.optionLabel(x) ?? x.id}${x.ton_hien_tai != null ? ` — tồn ${x.ton_hien_tai}` : ''}` }))
          .sort((p, q2) => p.label.localeCompare(q2.label, 'vi'))
        setRefs((r) => ({ ...r, [k]: list }))
      }).catch(() => {})
    })
  }, [keys])
  const labels = useMemo(() => {
    const m: Record<string, Map<string, string>> = {}
    for (const [k, list] of Object.entries(refs)) m[k] = new Map(list.map((o) => [o.value, o.label]))
    return m
  }, [refs])
  return { refs, labels }
}

/** codes kept in a text column → names, line by line (a line that is not a known code stays as typed) */
const named = (f: Field, v: unknown, labels: Record<string, Map<string, string>>) => String(v ?? '').split('\n').map((l) => labels[f.nameOf!]?.get(l.trim()) ?? l).join('\n')

function display(f: Field, v: any, labels: Record<string, Map<string, string>>) {
  if (v === null || v === undefined || v === '') return <span className="text-navy-300">—</span>
  if (f.type === 'ref') return labels[f.ref!]?.get(v) ?? v
  if (f.name === 'loai_de_xuat') return PROPOSAL_KINDS[v] ?? v
  // co-workers are stored as a list of staff / contractor codes (NV0010, NT0012…) or plain names: show names
  if (f.name === 'nguoi_lam_cung') return String(v).split(/\s*,\s*/).filter(Boolean).map((t) => labels.nhan_vien?.get(t) ?? labels.nha_thau?.get(t) ?? t).join(', ')
  if (f.multiRef) return String(v).split(/\s*,\s*/).filter(Boolean).map((t) => labels[f.multiRef!]?.get(t) ?? t).join(', ')
  if (f.nameOf) return named(f, v, labels)
  if (f.name === 'action' && AUDIT_ACTIONS[String(v)]) return AUDIT_ACTIONS[String(v)]
  if (f.name === 'changes' && typeof v === 'object') return <span className="font-mono text-[11.5px]">{JSON.stringify(v)}</span>
  if (f.name === 'ma_canh_bao') return ALERT_CODES[String(v)] ?? String(v)
  if (f.name === 'module' && ALERT_MODULES[String(v)]) return ALERT_MODULES[String(v)]
  if (f.name === 'trang_thai' && (v === 'DA_GUI' || v === 'LOI' || v === 'CHO_GUI')) return <span className={v === 'DA_GUI' ? 'pill-green' : v === 'LOI' ? 'pill-red' : 'pill-amber'}>{v === 'DA_GUI' ? 'Đã gửi' : v === 'LOI' ? 'Lỗi gửi' : 'Chờ gửi'}</span>
  if (f.name === 'nguon_giao_dich') {
    const L: Record<string, string> = { NHAP_THU_CONG: 'Nhập thủ công', XUAT_SU_DUNG: 'Xuất sử dụng', THU_CONG: 'Thủ công', DE_XUAT: 'Theo đề xuất', DIEU_CHINH: 'Điều chỉnh', DE_XUAT_MUA_VAT_TU: 'Đề xuất mua vật tư', NHAP_KHO: 'Nhập kho', XUAT_KHO: 'Xuất kho' }
    return L[String(v).toUpperCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^A-Z0-9]+/g, '_')] ?? String(v).replace(/_/g, ' ').toLowerCase().replace(/^./, (c) => c.toUpperCase())
  }
  if (f.name === 'loai_giao_dich') return <span className={v === 'NHAP' ? 'pill-green' : 'pill-amber'}>{v === 'NHAP' ? 'Nhập' : v === 'XUAT' ? 'Xuất' : v}</span>
  if (f.type === 'bool') return v ? <span className="pill-green">Có</span> : <span className="text-navy-300">—</span>
  if (f.type === 'date') return <span className="tabular-nums">{formatDate(v)}</span>
  if (f.type === 'datetime') {
    const d = new Date(v)
    return <span className="tabular-nums">{isNaN(d.getTime()) ? String(v) : d.toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh', hour12: false, day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
  }
  if (f.type === 'money') return <span className="tabular-nums">{new Intl.NumberFormat('en-US').format(Number(v))}</span>
  if (f.type === 'number') {
    const n = Number(v)
    return <span className={`tabular-nums ${f.name === 'so_ngay_con_lai' && n < 0 ? 'text-red-600 font-bold' : ''}`}>{new Intl.NumberFormat('en-US').format(n)}</span>
  }
  if (STATUS_FIELDS.has(f.name)) return <span className={pill(String(v))}>{String(v)}</span>
  return String(v)
}

const AUDIT_ACTIONS: Record<string, string> = { create: 'Thêm', update: 'Sửa', delete: 'Xóa', approve: 'Duyệt', progress: 'Ghi nhận tiến độ', cancel: 'Hủy', checkout: 'Check-out', password: 'Đổi mật khẩu', password_reset: 'Đặt lại mật khẩu qua email', restore: 'Khôi phục từ thùng rác', attach: 'Đính kèm tệp', detach: 'Gỡ tệp', split: 'Tách máy', split_all: 'Tách tất cả', transfer: 'Chuyển', recover: 'Thu hồi', in_phieu: 'In phiếu' }

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
      className={`shrink-0 flex flex-col items-center justify-center gap-0.5 min-w-[70px] h-[56px] px-1.5 rounded-[13px] bg-white shadow-[0_5px_0_#c5cfe3,0_10px_16px_rgba(11,27,64,.08)] text-[12px] font-bold text-navy-900 transition duration-100 hover:-translate-y-0.5 active:translate-y-[4px] active:shadow-[0_1px_0_#c5cfe3] disabled:opacity-40 disabled:hover:translate-y-0 disabled:active:translate-y-0 disabled:cursor-not-allowed ${TILE_COLORS[color]}`}>
      <Icon className="h-5 w-5" />
      <span className="whitespace-nowrap">{label}</span>
    </button>
  )
}

const TAB_TONES: Record<string, string> = {
  amber: 'bg-[#ffd98a] text-[#3d2a00] shadow-[0_5px_0_#d9a13a]', red: 'bg-[#e11d2e] text-white shadow-[0_5px_0_#8f0f1b]', green: 'bg-[#bfe8cf] text-[#0c3b20] shadow-[0_5px_0_#7cc49a]',
  blue: 'bg-[#cfe0ff] text-[#0b1b40] shadow-[0_5px_0_#93b1ee]', gray: 'bg-[#0b1b40] text-white shadow-[0_5px_0_#071230]',
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
      <div className="flex items-center justify-between bg-[#0b1b40] text-white px-2 py-1.5">
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
          ? <span><b className="text-blue-700">{monthTotal.toLocaleString('vi-VN')}</b> {unit} trong tháng</span>
          : <span className="text-ink-mute">Tháng này chưa có {unit}. <button className="font-bold text-[#2189e6] underline" onClick={onLatest}>Đến tháng có dữ liệu</button></span>}
        <div className="font-bold mt-0.5">Hôm nay: {formatDate(today)}</div>
      </div>
    </div>
  )
}

/* ── main ──────────────────────────────────────────────────────────── */
export default function ResourceManager({
  resourceKey, title, filters = {}, perms, compact = false, initialSearch, initialView,
}: { resourceKey: string; title?: string; filters?: Record<string, string>; perms: UiPerms; compact?: boolean; initialSearch?: string; initialView?: string }) {
  const res = getResource(resourceKey)!
  const [rows, setRows] = useState<Row[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState(initialSearch ?? '')
  const [query, setQuery] = useState(initialSearch ?? '')
  const [searchOpen, setSearchOpen] = useState(false)
  const [filterOpen, setFilterOpen] = useState(false) // phone: V191-style filter sheet
  const [status, setStatus] = useState('')
  const [alertSel, setAlertSel] = useState('')
  const [tip, setTip] = useState<{ x: number; y: number; up: boolean; text: string } | null>(null)
  const [quickSel, setQuickSel] = useState(initialSearch && res.quick ? 'all' : res.quick?.def ?? '')
  const [quickCounts, setQuickCounts] = useState<Record<string, number>>({})
  const [alertCounts, setAlertCounts] = useState<Record<string, number>>({})
  const [side, setSide] = useState('')
  const [shortOpen, setShortOpen] = useState(false)
  const [qr, setQr] = useState<QrDevice | null>(null)
  const [limitOpen, setLimitOpen] = useState<string | null>(null) // two-level approval threshold (Super Admin)
  // a QR label or a link (?xem=TB0001) opens that record straight away
  useEffect(() => {
    if (!initialView || compact) return
    api(`/api/${resourceKey}/${encodeURIComponent(initialView)}`).then((j) => j?.data && setViewing(j.data)).catch(() => {})
  }, [initialView, resourceKey, compact]) // eslint-disable-line react-hooks/exhaustive-deps
  const [histOpen, setHistOpen] = useState<Row | null>(null) // stock page: movements of the selected item
  const [pf, setPf] = useState<Record<string, string>>({}) // V191 "Bộ lọc" box: Tầng·Khu vực, Hạng mục…
  const [day, setDay] = useState<string | null>(() => (res.openToday && !compact && !initialSearch ? todayVn() : null))
  const todayTried = useRef(false)
  const [unfinished, setUnfinished] = useState(false) // daily work: "Chưa xong"
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
  const [confirm, confirmDialog] = useConfirm()
  // V191 "Thiết bị" screen: custom table, summary strip, filter panel and a detail pane
  const isDev = res.key === 'thiet_bi' && !compact
  const [devF, setDevF] = useState({ nql: '', loai: '', nsd: '' })
  const [devFilterOpen, setDevFilterOpen] = useState(false)
  const [devAll, setDevAll] = useState<Row[]>([])
  const [areas, setAreas] = useState<Record<string, Row>>({})
  const [staff, setStaff] = useState<Record<string, Row>>({})
  const pageSize = compact || isDev ? 200 : 50

  const statusField = res.fields.find((f) => f.name === 'trang_thai' && f.type === 'select' && !filters.trang_thai)
  const sideField = !compact && res.sideFilter && !(res.sideFilter in filters) ? res.fields.find((f) => f.name === res.sideFilter) : undefined
  const hasCalendar = !compact && !!res.dateField
  const vtSide = !compact && res.key === 'vat_tu'
  const [wrapW, setWrapW] = useState(0)
  const roRef = useRef<ResizeObserver | null>(null)
  const wrapRef = useCallback((el: HTMLDivElement | null) => {
    roRef.current?.disconnect()
    if (!el) return
    setWrapW(el.clientWidth)
    // --thh = header height: the scrollbar starts under the header and the strip beside the header is painted like it (see .tbl-scroll)
    const head = () => { const h = el.querySelector('thead'); if (h) el.style.setProperty('--thh', `${h.offsetHeight}px`) }
    head()
    roRef.current = new ResizeObserver(() => { setWrapW(el.clientWidth); head() }); roRef.current.observe(el)
    const th = el.querySelector('thead'); if (th) roRef.current.observe(th)
  }, [])
  const devRo = useRef<ResizeObserver | null>(null)
  const devWrapRef = useCallback((el: HTMLDivElement | null) => {
    devRo.current?.disconnect()
    const th = el?.querySelector('thead'); if (!el || !th) return
    const head = () => el.style.setProperty('--thh', `${th.offsetHeight}px`)
    head(); devRo.current = new ResizeObserver(head); devRo.current.observe(th)
  }, [])
  const listFields = res.listOrder
    ? res.listOrder.map((n) => res.fields.find((f) => f.name === n)).filter((f): f is Field => !!f && !(f.name in filters))
    : res.fields.filter((f) => visibleInList(f) && !(f.name in filters))
  // table layout (px): fixed columns first, the rest shared by weight; the tighter it gets, the smaller the text/padding and the dates
  const ID_W = Math.round(Math.min(116, Math.max(60, rows.reduce((m, r) => Math.max(m, String(r.id ?? '').length), 0) * 8.4 + 14)))
  const availW = Math.max(0, wrapW - 18)
  const layoutFor = (shortDate: boolean) => {
    const fixed = (res.key !== 'users' && res.key !== 'audit_logs' ? ID_W : 0) + listFields.filter(isFixedCol).reduce((a, f) => a + fixedW(f, shortDate), 0)
    const flex = listFields.filter((f) => !isFixedCol(f)), fw = flex.reduce((a, f) => a + flexWeight(f), 0)
    return { fixed, fw, per: fw ? (availW - fixed) / fw : 1 }
  }
  let shortDate = false
  let lay = layoutFor(false)
  if (availW && lay.per < 0.85) { shortDate = true; lay = layoutFor(true) }
  const colPx = (f: Field) => (isFixedCol(f) ? fixedW(f, shortDate) : Math.max(40, Math.floor(flexWeight(f) * lay.per)))
  const dense = !availW ? 0 : lay.per < 0.72 ? 2 : lay.per < 0.92 ? 1 : 0
  const { refs, labels } = useRefOptions([res.fields, ...(res.actions ?? []).map((a) => a.fields ?? [])])
  const isWork = res.key === 'cong_viec' || res.key === 'cong_viec_hang_ngay'
  // cell renderer: "Số ngày" is computed from the row; everything else uses the shared formatter
  const cellNode = (f: Field, r: any) => {
    if (f.name === 'ket_qua' && res.key === 'nhat_ky_bao_tri' && r.ket_qua) return <span className={/hoàn thành|đạt/i.test(r.ket_qua) && !/không|chưa/i.test(r.ket_qua) ? 'pill-green' : 'pill-amber'}>{r.ket_qua}</span>
    // V191 shows the contractor's company when no unit was typed by hand
    if (f.name === 'don_vi_thuc_hien' && !r.don_vi_thuc_hien && r.id_nha_thau) return labels.nha_thau?.get(r.id_nha_thau) ?? r.id_nha_thau
    if (f.name === 'so_ngay' && res.key === 'cong_viec') {
      const s = soNgay(r)
      if (s.n <= 0) return <span className="text-navy-300">—</span>
      const cls = s.tone === 'red' ? 'bg-red-600 text-white' : s.tone === 'green' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
      return <span className={`inline-flex min-w-[30px] justify-center rounded-md px-2 py-0.5 text-[13px] font-extrabold tabular-nums ${cls}`}>{s.n}</span>
    }
    if (f.type === 'date' && shortDate && r[f.name]) { const v = String(r[f.name]); return <span className="tabular-nums">{v.slice(8, 10)}/{v.slice(5, 7)}/{v.slice(2, 4)}</span> }
    return display(f, r[f.name], labels)
  }
  const cellTip = (f: Field, r: any): string | null => {
    if (f.name === 'so_ngay' && res.key === 'cong_viec') return soNgay(r).lines.join('\n')
    // any long text cell (clamped to 2-3 lines in the table) shows its full content on hover
    const long = f.type === 'textarea' || SOFT_TIP.has(f.name) || f.multiline
    if (!long) return null
    const t = (f.nameOf ? named(f, r[f.name], labels) : String(r[f.name] ?? '')).trim()
    return t && (f.name === 'tien_do' || t.length > 40 || t.split('\n').length > 3) ? t : null
  }
  const showTip = (e: React.MouseEvent<HTMLElement>, f: Field, r: any) => {
    const text = cellTip(f, r); if (!text) return
    const b = e.currentTarget.getBoundingClientRect(), up = b.bottom > window.innerHeight - 300
    setTip({ x: Math.max(8, Math.min(b.left, window.innerWidth - 448)), y: up ? b.top - 6 : b.bottom + 6, up, text })
  }
  const allowed = (a: Action) => (!a.adminOnly || !!perms.admin) && (a.perm === 'view' || perms[a.perm as keyof UiPerms])
  const rowActions = (res.actions ?? []).filter((a) => (a.scope ?? 'row') === 'row' && allowed(a))
  const pageActions = (res.actions ?? []).filter((a) => a.scope === 'page' && allowed(a))
  const filterKey = JSON.stringify(filters)
  const sideName = sideField?.name

  // every active filter, optionally leaving out the one being counted
  const baseParams = useCallback((omit: { status?: boolean; day?: boolean; alert?: boolean; quick?: boolean } = {}) => {
    const sp = new URLSearchParams(JSON.parse(filterKey))
    if (query) sp.set('search', query)
    if (status && !omit.status) sp.set('trang_thai', status)
    if (alertSel && res.urgency && !omit.alert) sp.set(res.urgency.field, alertSel)
    if (res.quick && !compact && !omit.quick) for (const [k, v] of Object.entries(res.quick.chips.find((c) => c.key === quickSel)?.params ?? {})) sp.set(k, v)
    if (isDev && devF.nql) sp.set('id_nguoi_quan_ly', devF.nql)
    if (isDev && devF.loai) sp.set('loai_thiet_bi', devF.loai)
    if (isDev && devF.nsd) sp.set('id_nguoi_su_dung', devF.nsd)
    if (side && sideName) sp.set(sideName, side)
    if (unfinished) sp.set('ne_trang_thai', 'Hoàn thành')
    for (const [k, v] of Object.entries(pf)) if (v) sp.set(k, v)
    if (day && !omit.day) { sp.set('from', day); sp.set('to', day); sp.set('dateField', calField) }
    return sp
  }, [filterKey, query, status, alertSel, res.urgency, res.quick, quickSel, compact, side, sideName, pf, day, calField, isDev, devF, unfinished])

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const sp = baseParams(); sp.set('page', String(page)); sp.set('pageSize', String(pageSize))
      const j = await api(`/api/${res.key}?${sp}`)
      setRows(j.data); setTotal(j.total); setVersion((v) => v + 1)
      // opened on today but nothing recorded yet: show the whole list instead of an empty table
      if (res.openToday && !todayTried.current) { todayTried.current = true; if (!j.total && day === todayVn()) setDay(null) }
    } catch (e: any) { setMsg({ type: 'err', text: e.message }) } finally { setLoading(false) }
  }, [res.key, baseParams, page, pageSize]) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { load() }, [load])

  // status tab counts
  useEffect(() => {
    if (compact || !statusField) return
    const sp = baseParams({ status: true }); sp.set('countBy', 'trang_thai')
    api(`/api/${res.key}?${sp}`).then((j) => setStatusCounts(j.data)).catch(() => {})
  }, [version]) // eslint-disable-line react-hooks/exhaustive-deps

  // alert chip counts (overdue / due today / soon …) respecting the other filters
  useEffect(() => {
    if (compact || !res.urgency) return
    const sp = baseParams({ alert: true }); sp.set('countBy', res.urgency.field)
    api(`/api/${res.key}?${sp}`).then((j) => setAlertCounts(j.data)).catch(() => {})
  }, [version]) // eslint-disable-line react-hooks/exhaustive-deps

  // quick chip counts (e.g. in stock / out of stock / all)
  useEffect(() => {
    if (compact || !res.quick) return
    let dead = false
    Promise.all(res.quick.chips.map((c) => { const sp = baseParams({ quick: true }); for (const [k, v] of Object.entries(c.params)) sp.set(k, v); sp.set('page', '1'); sp.set('pageSize', '1')
      return api(`/api/${res.key}?${sp}`).then((j) => [c.key, j.total as number] as const).catch(() => [c.key, 0] as const) }))
      .then((e) => { if (!dead) setQuickCounts(Object.fromEntries(e)) })
    return () => { dead = true }
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
    if (!isDev) return
    const grab = (u: string) => fetch(u).then((r) => r.json()).then((j) => (j.success ? (j.data as Row[]) : []))
    Promise.all([grab('/api/thiet_bi?pageSize=2000'), grab('/api/khu_vuc?pageSize=500'), grab('/api/nhan_vien?pageSize=500')]).then(([d, a, n]) => {
      setDevAll(d); setAreas(Object.fromEntries(a.map((x) => [x.id, x]))); setStaff(Object.fromEntries(n.map((x) => [x.id, x])))
    }).catch(() => {})
  }, [isDev, version]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!sideName) return
    api(`/api/${res.key}?distinct=${sideName}`).then((j) => setSideValues(j.data)).catch(() => {})
  }, [res.key, sideName])

  // a day is picked on the calendar: the side list only names the people who have records that day
  const [sideDay, setSideDay] = useState<Record<string, number> | null>(null)
  useEffect(() => {
    if (!sideName || !day) { setSideDay(null); return }
    let dead = false
    const sp = baseParams(); sp.delete(sideName); sp.set('countBy', sideName)
    api(`/api/${res.key}?${sp}`).then((j) => { if (!dead) setSideDay(j.data ?? {}) }).catch(() => { if (!dead) setSideDay(null) })
    return () => { dead = true }
  }, [version, day, sideName]) // eslint-disable-line react-hooks/exhaustive-deps

  // phone header's "Tìm trang này…" box
  useEffect(() => {
    if (compact) return
    const on = (e: Event) => setSearch(String((e as CustomEvent).detail ?? ''))
    window.addEventListener('pl-search', on)
    return () => window.removeEventListener('pl-search', on)
  }, [compact])
  useEffect(() => { const t = setTimeout(() => { setPage(1); setQuery(search.trim()) }, 350); return () => clearTimeout(t) }, [search])
  useEffect(() => { if (msg?.type === 'ok') { const t = setTimeout(() => setMsg(null), 3500); return () => clearTimeout(t) } }, [msg])
  useEffect(() => { setPage(1) }, [status, side, day, pf])
  const flash = (text: string, type: 'ok' | 'err' = 'ok') => setMsg({ type, text })

  async function refreshViewing(id: string) {
    try { const j = await api(`/api/${res.key}/${id}`); setViewing(j.data) } catch { setViewing(null) }
  }
  async function remove(row: Row) {
    if (!(await confirm(`Xóa ${res.singular} ${row.id}? Bản sao dữ liệu được lưu trong nhật ký hệ thống.`, { danger: true }))) return
    try { await api(`/api/${res.key}/${row.id}`, { method: 'DELETE' }); flash('Đã xóa'); setViewing(null); setSelectedId(null); load() }
    catch (e: any) { flash(e.message, 'err') }
  }
  async function run(action: Action, row: Row | null, input: Row = {}) {
    if (!action.fields?.length && action.confirm && !(await confirm(action.confirm, { title: action.label }))) return
    try {
      const j = await api(`/api/${res.key}/${row?.id ?? '_'}/${action.key}`, { method: 'POST', body: JSON.stringify(input) })
      flash(j.data?.message ?? `${action.label}: đã xong`)
      setActing(null); load()
      if (row && viewing) refreshViewing(row.id)
    } catch (e: any) { if (!action.fields?.length) flash(e.message, 'err'); throw e }
  }
  /** V191 "Phiếu đề xuất": print, PDF file (created directly) or Word. */
  async function phieu(row: Row, mode: 'print' | 'pdf' | 'word') {
    try {
      const j = await api(`/api/de_xuat/${row.id}/phieu`)
      const p = j.data as Phieu
      const name = fileName(p), origin = window.location.origin
      if (mode === 'word') { downloadWord(phieuHtml(p, origin, 'word'), name); flash(`Đã tải ${name}.doc`) }
      else if (mode === 'pdf') { flash('Đang tạo file PDF…'); await downloadPdf(phieuHtml(p, origin, 'pdf'), name); flash(`Đã tải ${name}.pdf`) }
      else {
        const old = document.title; document.title = name
        printHtml(phieuHtml(p, origin, 'print')); setTimeout(() => { document.title = old }, 5000)
        if (p.printedBefore > 0) flash(`Phiếu đã in ${p.printedBefore} lần trước đó`)
      }
    } catch (e: any) { flash(e.message, 'err') }
  }
  function resetAll() { setDevF({ nql: '', loai: '', nsd: '' }); setStatus(''); setAlertSel(''); if (res.quick) setQuickSel('all'); setSide(''); setPf({}); setUnfinished(false); setDay(null); setSearch(''); setQuery(''); setSearchOpen(false); setSelectedId(null) }

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
  const refLabel = (f: Field | undefined, v: string) => v === '__NULL__' ? (res.sideNone ?? 'Chưa cập nhật') : (f?.type === 'ref' ? labels[f.ref!]?.get(v) ?? v : v)


  /* ── V191 "Thiết bị" layout: device table, summary strip, filter panel and detail pane ── */
  const initialsOf = (n: string) => n.split(/\s+/).filter(Boolean).slice(-2).map((w) => w[0]).join('').toUpperCase()
  const Avatar = ({ name, size = 'h-8 w-8 text-[11px]' }: { name: string; size?: string }) => <span className={`grid shrink-0 place-items-center rounded-full bg-blue-600 font-black text-white ${size}`}>{initialsOf(name) || '?'}</span>
  const devState = (r: Row) => (r.trang_thai ? String(r.trang_thai) : 'Chưa cập nhật')
  const devStats = useMemo(() => {
    const by = (x: string) => devAll.filter((r) => r.trang_thai === x).length
    return { total: devAll.length, sl: devAll.reduce((a, r) => a + (Number(r.so_luong) || 1), 0), use: by('Đang sử dụng'), kho: by('Trong kho'), todo: devAll.filter((r) => !r.trang_thai).length }
  }, [devAll])
  // devices that are not in use (in store, under repair, no status yet…) first: they are the ones to deal with
  const devRows = useMemo(() => (isDev ? [...rows].sort((a, b) => Number(a.trang_thai === 'Đang sử dụng') - Number(b.trang_thai === 'Đang sử dụng')) : rows), [rows, isDev])
  const qrOf = (r: Row): QrDevice => { const a = areas[r.id_khu_vuc]; return { id: String(r.id), ten_thiet_bi: String(r.ten_thiet_bi ?? ''), vi_tri: a ? [a.tang, a.ten_khu_vuc].filter(Boolean).join(' · ') : undefined } }
  const devTypes = useMemo(() => Array.from(new Set(devAll.map((r) => r.loai_thiet_bi).filter(Boolean))).sort() as string[], [devAll])
  const devManagers = useMemo(() => Array.from(new Set(devAll.map((r) => r.id_nguoi_quan_ly).filter(Boolean))).map((id) => ({ id: id as string, name: staff[id as string]?.ho_ten ?? (id as string) })).sort((a, b) => a.name.localeCompare(b.name, 'vi')), [devAll, staff])
  const devTable = (
    <div data-dev-scroll ref={devWrapRef} className="tbl-scroll overflow-y-auto overflow-x-hidden print:max-h-none print:overflow-visible max-h-[70vh] min-h-[260px] lg:max-h-none lg:flex-1 lg:min-h-0">
      <table className="w-full table-fixed text-[12.5px] border-separate border-spacing-0">
        <colgroup>{[24, 9, 17, 8, 11, 7, 10, 14].map((w, i) => <col key={i} style={{ width: `${w}%` }} />)}</colgroup>
        <thead>
          <tr className="text-[11.5px] font-extrabold uppercase tracking-wide text-navy-800">
            {['Thiết bị', 'Hãng', 'Người quản lý', 'Tầng', 'Vị trí', 'Số lượng', 'Tình trạng', 'Trạng thái'].map((h, i) => (
              <th key={h} className={`sticky top-0 z-[1] th3d border-b px-2.5 py-3 ${i === 0 || i === 2 ? 'text-left' : 'text-center'}`}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading && rows.length === 0 ? [...Array(8)].map((_, i) => <tr key={i}><td colSpan={8} className="px-3 py-3 border-b border-navy-100"><div className="h-3.5 rounded bg-navy-100 animate-pulse" style={{ width: `${60 + ((i * 13) % 35)}%` }} /></td></tr>)
            : rows.length === 0 ? <tr><td colSpan={8} className="px-4 py-16 text-center text-ink-mute"><Inbox className="h-8 w-8 mx-auto mb-2 text-navy-300" />Không có thiết bị</td></tr>
            : devRows.map((r) => {
              const sel = r.id === selectedId, a = areas[r.id_khu_vuc], m = staff[r.id_nguoi_quan_ly]
              return (
                <tr key={r.id} tabIndex={0} aria-selected={sel}
                  onClick={() => (window.matchMedia('(max-width: 1023px)').matches ? setViewing(r) : setSelectedId(sel ? null : r.id))} onDoubleClick={() => setViewing(r)}
                  onKeyDown={(e) => { if (e.key === 'Enter') setViewing(r) }}
                  className={`cursor-pointer outline-none ${sel ? 'bg-select shadow-[inset_3px_0_0_#2189e6]' : 'bg-white hover:bg-navy-50'} ${loading ? 'opacity-60' : ''}`}>
                  <td className="px-2 py-2.5 border-b border-navy-100">
                    <div className="flex items-center gap-3">
                      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-blue-50 text-blue-600"><Monitor className="h-4 w-4" /></span>
                      <div className="min-w-0">
                        <div className="font-extrabold text-navy-900 truncate">{r.ten_thiet_bi}</div>
                        <div className="flex items-center gap-1.5 text-[12px] text-ink-mute"><span className="rounded bg-red-50 px-1.5 py-px font-bold text-red-600">{r.id}</span><span className="truncate">{r.thong_so || r.loai_thiet_bi || ''}</span></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-2 py-2.5 border-b border-navy-100 text-center text-ink-mute break-words">{r.hang || '—'}</td>
                  <td className="px-2 py-2.5 border-b border-navy-100">
                    {m ? <div className="flex items-center gap-2"><Avatar name={m.ho_ten} /><div className="leading-tight"><div className="font-bold text-navy-900 truncate">{m.ho_ten}</div><div className="text-[12px] text-ink-mute">{m.phong_ban || r.phong_ban || ''}</div></div></div> : <span className="text-ink-mute">—</span>}
                  </td>
                  <td className="px-2 py-2.5 border-b border-navy-100 break-words">{a?.tang || '—'}</td>
                  <td className="px-2 py-2.5 border-b border-navy-100 break-words">{a?.ten_khu_vuc || '—'}</td>
                  <td className="px-2 py-2.5 border-b border-navy-100 text-center font-extrabold tabular-nums">{r.so_luong ?? 1}</td>
                  <td className="px-2 py-2.5 border-b border-navy-100 text-center">{r.tinh_trang ? <span className={pill(String(r.tinh_trang))}>{r.tinh_trang}</span> : <span className="text-ink-mute">—</span>}</td>
                  <td className="px-2 py-2.5 border-b border-navy-100 text-center"><span className={r.trang_thai ? pill(String(r.trang_thai)) : 'pill-amber'}>{devState(r)}</span></td>
                </tr>
              )
            })}
        </tbody>
      </table>
    </div>
  )
  const devCards = (
    <div className="lg:hidden space-y-2.5 p-3">
      {loading && rows.length === 0 ? [...Array(5)].map((_, i) => <div key={i} className="h-28 animate-pulse rounded-2xl bg-navy-100" />)
        : rows.length === 0 ? <div className="px-4 py-14 text-center text-ink-mute"><Inbox className="mx-auto mb-2 h-8 w-8 text-navy-300" />Không có thiết bị</div>
        : devRows.map((r) => {
          const a = areas[r.id_khu_vuc], m = staff[r.id_nguoi_quan_ly]
          return (
            <button key={r.id} type="button" onClick={() => setViewing(r)} className={`block w-full rounded-2xl border border-navy-200 bg-white p-3.5 text-left shadow-[0_1px_2px_rgba(16,24,40,.06)] active:bg-navy-50 ${loading ? 'opacity-60' : ''}`}>
              <div className="flex items-start gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-blue-50 text-blue-600"><Monitor className="h-5 w-5" /></span>
                <div className="min-w-0 flex-1">
                  <div className="text-[15px] font-extrabold leading-snug text-navy-900">{r.ten_thiet_bi}</div>
                  <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-[12px] text-ink-mute"><span className="rounded bg-red-50 px-1.5 py-px font-bold text-red-600">{r.id}</span><span className="truncate">{r.thong_so || r.loai_thiet_bi || ''}</span></div>
                </div>
                <span className={`shrink-0 ${r.trang_thai ? pill(String(r.trang_thai)) : 'pill-amber'}`}>{devState(r)}</span>
              </div>
              <div className="mt-3 flex items-center gap-2.5 border-t border-navy-100 pt-3">
                {m ? <><Avatar name={m.ho_ten} /><div className="min-w-0 flex-1 leading-tight"><div className="truncate text-[13.5px] font-bold text-navy-900">{m.ho_ten}</div><div className="truncate text-[12px] text-ink-mute">{m.phong_ban || r.phong_ban || 'Người quản lý'}</div></div></> : <div className="flex-1 text-[13px] text-ink-mute">Chưa có người quản lý</div>}
                <div className="text-right text-[12px] text-ink-soft"><div className="font-semibold">{[a?.tang, a?.ten_khu_vuc].filter(Boolean).join(' · ') || '—'}</div>
                  <div>SL <b className="text-navy-900">{r.so_luong ?? 1}</b>{r.tinh_trang ? <> · <span className={pill(String(r.tinh_trang))}>{r.tinh_trang}</span></> : null}</div></div>
              </div>
            </button>
          )
        })}
    </div>
  )
  const devPanel = (() => {
    if (!isDev) return null
    const r = selected
    if (!r) return <aside className="hidden lg:flex card items-center justify-center p-6 text-center text-ink-mute print:hidden">Chọn một thiết bị để xem chi tiết.</aside>
    const a = areas[r.id_khu_vuc], user = staff[r.id_nguoi_su_dung], mgrRow = staff[r.id_nguoi_quan_ly]
    const mine = user ? devAll.filter((x) => x.id_nguoi_su_dung === user.id) : []
    const missing = [['Hãng', r.hang], ['Model', r.model], ['Serial', r.serial], ['Ngày bàn giao', r.ngay_ban_giao]].filter(([, v]) => !v).map(([k]) => k)
    const Info = ({ l, v }: { l: string; v: React.ReactNode }) => <div><div className="text-[11.5px] text-ink-mute">{l}</div><div className="text-[14px] font-bold text-navy-900">{v || '—'}</div></div>
    return (
      <aside className="hidden lg:flex card min-h-0 flex-col overflow-y-auto p-4 print:hidden">
        <div className="flex items-start gap-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-blue-50 text-blue-600"><Monitor className="h-5 w-5" /></span>
          <div className="min-w-0">
            <div className="text-[16px] font-extrabold text-navy-900">{r.ten_thiet_bi}</div>
            <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[12px]">
              <span className="rounded bg-red-50 px-1.5 py-px font-bold text-red-600">{r.id}</span>
              {r.loai_thiet_bi && <span className="text-ink-mute">{r.loai_thiet_bi}</span>}
              {r.tinh_trang && <span className={pill(String(r.tinh_trang))}>{r.tinh_trang}</span>}
              <span className={r.trang_thai ? pill(String(r.trang_thai)) : 'pill-amber'}>{devState(r)}</span>
            </div>
          </div>
        </div>
        <div className="my-3 border-t" />
        <div className="text-[11.5px] font-black uppercase tracking-wide text-ink-mute">Người sử dụng</div>
        {user ? (
          <div className="mt-2">
            <div className="flex items-center gap-3">
              <Avatar name={user.ho_ten} size="h-10 w-10 text-[13px]" />
              <div className="min-w-0 flex-1 leading-tight"><div className="font-extrabold text-navy-900">{user.ho_ten}</div><div className="text-[12.5px] text-ink-mute">{user.phong_ban || r.phong_ban || ''}</div></div>
              <button type="button" title="Bấm để xem danh sách thiết bị đang dùng của người này"
                onClick={() => { setDevF((f) => ({ ...f, nsd: user.id })); if (!filters.trang_thai) setStatus('Đang sử dụng'); setPage(1); document.querySelector('[data-dev-scroll]')?.scrollTo({ top: 0, behavior: 'smooth' }) }}
                className={`rounded-lg border px-3 py-1 text-center text-red-600 transition hover:bg-red-50 ${devF.nsd === user.id ? 'border-red-500 bg-red-50' : 'border-red-200'}`}><div className="text-[18px] font-black leading-none">{mine.filter((d) => d.trang_thai === 'Đang sử dụng').length}</div><div className="text-[10.5px]">đang dùng</div></button>
            </div>
            <div className="mt-2 text-[12px] text-ink-mute">Tổng {mine.length} thiết bị (SL {mine.reduce((x, d) => x + (Number(d.so_luong) || 1), 0)}) · {mine.filter((d) => d.trang_thai === 'Đang sử dụng').length} đang sử dụng · {mine.filter((d) => !d.trang_thai).length} chưa cập nhật</div>
          </div>
        ) : <p className="mt-2 text-sm text-ink-mute">Chưa gán người sử dụng.</p>}
        <div className="my-3 border-t" />
        <div className="text-[11.5px] font-black uppercase tracking-wide text-ink-mute">Thông tin kỹ thuật</div>
        {r.thong_so && <div className="mt-2 rounded-lg bg-canvas px-3 py-2 text-[13.5px]">{r.thong_so}</div>}
        <div className="mt-3 grid gap-3">
          <Info l="Tầng" v={a?.tang} /><Info l="Vị trí" v={a?.ten_khu_vuc} /><Info l="Số lượng" v={r.so_luong ?? 1} />
          <Info l="Người quản lý" v={mgrRow?.ho_ten} />
          {r.hang && <Info l="Hãng" v={r.hang} />}{r.model && <Info l="Model" v={r.model} />}{r.serial && <Info l="Serial" v={r.serial} />}
          {r.ngay_ban_giao && <Info l="Ngày bàn giao" v={formatDate(r.ngay_ban_giao)} />}
        </div>
        {missing.length > 0 && <div className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-[12.5px] text-amber-800"><b>Chưa cập nhật:</b> {missing.join(', ')}</div>}
        <a href={`/lich_su_chuyen_thiet_bi?id_thiet_bi=${r.id}`} className="btn-secondary mt-auto w-full justify-center">Lịch sử chuyển thiết bị ›</a>
      </aside>
    )
  })()


  /* ── phone: the same rows as cards (full-page lists only; the desktop table stays) ── */
  const titleField = listFields.find((f) => /^(noi_dung|ten_|ho_ten|ten$)/.test(f.name)) ?? listFields.find((f) => !STATUS_FIELDS.has(f.name))
  // at most two pills in the card header (alert + status); other status-like fields (e.g. mức độ) go into the body
  const allStatus = listFields.filter((f) => STATUS_FIELDS.has(f.name))
  const statusFields = [...allStatus].sort((a, b) => (a.name === 'canh_bao' ? 0 : a.name === 'trang_thai' ? 1 : 2) - (b.name === 'canh_bao' ? 0 : b.name === 'trang_thai' ? 1 : 2)).slice(0, 2)
  const bodyFields = listFields.filter((f) => f !== titleField && !statusFields.includes(f)).slice(0, 8)
  // urgency groups: header whenever the alert value changes in the (already sorted) list
  const urg = res.urgency && !alertSel && !compact ? res.urgency : null
  const pretty = (v: string) => v.charAt(0) + v.slice(1).toLowerCase()
  const groupHead = (r: any, i: number, cols?: number) => {
    if (!urg) return null
    const v = String(r[urg.field] ?? '')
    if (i > 0 && String(rows[i - 1][urg.field] ?? '') === v) return null
    const t = tone(v)
    const cls = t === 'red' ? 'bg-red-50 text-red-700' : t === 'amber' ? 'bg-amber-50 text-amber-800' : t === 'green' ? 'bg-emerald-50 text-emerald-700' : 'bg-blue-50 text-blue-700'
    const inner = <><span className="font-extrabold uppercase tracking-wide">{v || 'Khác'}</span><span className="ml-2 font-semibold opacity-80">{(alertCounts[v] ?? 0).toLocaleString('vi-VN')} {res.singular}</span></>
    return cols
      ? <tr key={`g-${v}`}><td colSpan={cols} className={`border-y border-navy-200 px-3 py-1.5 text-[12.5px] ${cls}`}>{inner}</td></tr>
      : <div key={`g-${v}`} className={`rounded-lg px-3 py-1.5 text-[12.5px] ${cls}`}>{inner}</div>
  }
  const cardList = (
    <div className="lg:hidden space-y-2 p-2.5">
      {loading && rows.length === 0 ? [...Array(5)].map((_, i) => <div key={i} className="h-20 animate-pulse rounded-2xl bg-navy-100" />)
        : rows.length === 0 ? <div className="px-4 py-14 text-center text-ink-mute"><Inbox className="mx-auto mb-2 h-8 w-8 text-navy-300" />Không có dữ liệu</div>
        : rows.map((r, i) => {
          const t = tone(String(r.canh_bao || r.trang_thai || ''))
          const edge = t === 'red' ? 'border-l-red-500' : t === 'amber' ? 'border-l-amber-400' : t === 'green' ? 'border-l-emerald-500' : t === 'blue' ? 'border-l-blue-500' : 'border-l-navy-300'
          const shown = bodyFields.filter((f) => f.name === 'so_ngay' || (r[f.name] !== null && r[f.name] !== undefined && r[f.name] !== ''))
          return (
            <Fragment key={r.id}>
            {groupHead(r, i)}
            <div className={`rounded-2xl border border-navy-200 border-l-4 ${edge} bg-white shadow-[0_1px_2px_rgba(16,24,40,.06)] ${loading ? 'opacity-60' : ''}`}>
            <button type="button" onClick={() => setViewing(r)} className="block w-full rounded-2xl px-3 py-2.5 text-left active:bg-navy-50">
              <div className="flex items-center gap-2">
                {res.key !== 'users' && res.key !== 'audit_logs' && <span className="rounded-md bg-blue-50 px-2 py-0.5 text-[11.5px] font-extrabold tabular-nums text-blue-700">{r.id}</span>}
                <span className="ml-auto flex flex-wrap justify-end gap-1">{statusFields.filter((f, i) => r[f.name] && !statusFields.slice(0, i).some((g) => String(r[g.name] ?? '').toLowerCase() === String(r[f.name]).toLowerCase())).map((f) => <span key={f.name}>{display(f, r[f.name], labels)}</span>)}</span>
              </div>
              {titleField && <div className={`mt-1.5 text-[14.5px] font-extrabold leading-snug text-navy-900 ${titleField.type === 'textarea' || titleField.name === 'noi_dung' ? 'line-clamp-2' : 'truncate'}`}>{display(titleField, r[titleField.name], labels)}</div>}
              {shown.length > 0 && (
                // label and value share one line; 2 columns on a phone, 4 on a tablet, 6 when wider
                <dl className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 sm:grid-cols-4 md:grid-cols-6">
                  {shown.map((f) => (
                    <div key={f.name} className={`flex min-w-0 items-baseline gap-1 text-[12.5px] ${f.type === 'textarea' ? 'col-span-2 sm:col-span-4 md:col-span-6' : ''}`}>
                      <dt className="shrink-0 text-ink-mute">{f.label}:</dt>
                      <dd className={`min-w-0 font-semibold text-ink ${f.type === 'textarea' ? 'line-clamp-2' : 'truncate'}`}>{cellNode(f, r)}</dd>
                    </div>
                  ))}
                </dl>
              )}
            </button>
            {res.key === 'de_xuat' && (() => {
              const lk = res.locked?.(r) ?? null
              const acts = rowActions.filter((a) => !a.show || a.show(r))
              if (!canEdit && !canDelete && !acts.length) return null
              return (
                <div className="flex flex-wrap gap-2 border-t border-navy-100 px-3 py-2">
                  {acts.map((a) => (
                    <button key={a.key} type="button" onClick={() => doAction(a, r)}
                      className={`h-9 flex-1 whitespace-nowrap rounded-lg border px-2 text-[12.5px] font-bold ${a.perm === 'approve' && a.key === 'duyet' ? 'border-green-600 bg-green-600 text-white' : 'border-navy-200 bg-white text-navy-900'}`}>
                      {a.key === 'duyet' ? '✓ ' : ''}{a.label}</button>
                  ))}
                  {canEdit && !lk && <button type="button" className="btn-secondary h-9 flex-1 whitespace-nowrap px-2 text-[12.5px]" onClick={() => setEditing(r)}><Pencil className="h-4 w-4" />Sửa</button>}
                  {canDelete && !lk && <button type="button" className="h-9 flex-1 whitespace-nowrap rounded-lg border border-red-300 bg-red-50 px-2 text-[12.5px] font-bold text-red-700" onClick={() => remove(r)}><Trash2 className="mr-1 inline h-4 w-4" />Xóa</button>}
                </div>
              )
            })()}
            {res.key === 'de_xuat' && (
              <div className="flex gap-2 border-t border-navy-100 px-3 py-2">
                <button type="button" className="btn-secondary h-9 flex-1 whitespace-nowrap px-1.5 text-[12.5px]" onClick={() => phieu(r, 'print')}><Printer className="h-4 w-4" />In</button>
                <button type="button" className="btn-secondary h-9 flex-1 whitespace-nowrap px-1.5 text-[12.5px]" onClick={() => phieu(r, 'pdf')}><FileDown className="h-4 w-4" />In PDF</button>
                <button type="button" className="btn-secondary h-9 flex-1 whitespace-nowrap px-1.5 text-[12.5px]" onClick={() => phieu(r, 'word')}><FileText className="h-4 w-4" />In Word</button>
              </div>
            )}
            </div>
            </Fragment>
          )
        })}
    </div>
  )

  /* ── table (shared by full and compact views) ── */
  const tableFields = listFields
  const pad = dense === 2 ? 'px-1.5' : dense === 1 ? 'px-2' : 'px-2.5'
  const table = (
    <div ref={wrapRef} className={`tbl-scroll overflow-y-auto overflow-x-hidden print:max-h-none print:overflow-visible ${compact ? 'max-h-[360px]' : 'max-h-[70vh] min-h-[260px] lg:max-h-none lg:flex-1 lg:min-h-0'}`}>
      <table className={`w-full table-fixed border-separate border-spacing-0 ${dense === 2 ? 'text-[12px]' : dense === 1 ? 'text-[12.5px]' : 'text-[13px]'} ${dense > 0 ? '[&_[class*=pill]]:!whitespace-normal [&_[class*=pill]]:text-center [&_[class*=pill]]:!leading-tight' : ''}`}>
        <colgroup>
          {res.key !== 'users' && res.key !== 'audit_logs' && <col style={{ width: ID_W }} />}
          {tableFields.map((f) => <col key={f.name} style={{ width: colPx(f) }} />)}
        </colgroup>
        <thead>
          <tr className="text-[13px] font-extrabold text-navy-900">
            {res.key !== 'users' && res.key !== 'audit_logs' && <th className="sticky top-0 z-[1] th3d border-b px-1 py-2.5 text-center">Mã</th>}
            {tableFields.map((f) => <th key={f.name} className={`sticky top-0 z-[1] th3d border-b border-l !border-l-white/15 ${pad} py-2.5 text-center leading-tight`}>{f.label}</th>)}
          </tr>
        </thead>
        <tbody>
          {loading && rows.length === 0 ? (
            [...Array(compact ? 2 : 10)].map((_, i) => (
              <tr key={i}><td colSpan={tableFields.length + 1} className="px-3 py-3 border-b border-navy-100"><div className="h-3.5 rounded bg-navy-100 animate-pulse" style={{ width: `${60 + ((i * 13) % 35)}%` }} /></td></tr>
            ))
          ) : rows.length === 0 ? (
            <tr><td colSpan={tableFields.length + 1} className="px-4 py-16 text-center text-ink-mute"><Inbox className="h-8 w-8 mx-auto mb-2 text-navy-300" />Không có dữ liệu</td></tr>
          ) : rows.map((r, i) => {
            const sel = r.id === selectedId
            const t = tone(String(r.canh_bao || r.trang_thai || ''))
            const bg = sel ? 'bg-select' : t === 'amber' ? 'bg-[#fff6d9]' : t === 'red' && r.canh_bao ? 'bg-red-50/70' : 'bg-white'
            return (<Fragment key={r.id}>
              {groupHead(r, i, tableFields.length + 1)}
              <tr tabIndex={0} aria-selected={sel}
                onClick={() => (window.matchMedia('(max-width: 1023px)').matches ? setViewing(r) : setSelectedId(sel ? null : r.id))} onDoubleClick={() => setViewing(r)}
                onKeyDown={(e) => { if (e.key === 'Enter') setViewing(r) }}
                className={`cursor-pointer outline-none ${bg} ${sel ? '' : 'hover:brightness-[.97]'} ${loading ? 'opacity-60' : ''}`}>
                {res.key !== 'users' && res.key !== 'audit_logs' && <td className={`px-1 py-2 border-b border-navy-200/70 text-center break-all tabular-nums ${sel ? 'text-select-accent font-extrabold shadow-[inset_3px_0_0_#2189e6]' : 'text-navy-800 font-semibold'}`}>{r.id}</td>}
                {tableFields.map((f) => {
                  const right = RIGHT.test(f.name) || f.type === 'money' || f.type === 'number'
                  const wide = f.type === 'textarea' || f.name === 'noi_dung' || f.name === 'ghi_chu' || f.name === 'ds_ten'
                  return (
                    <td key={f.name} onMouseEnter={(e) => showTip(e, f, r)} onMouseLeave={() => setTip(null)} className={`${/^ds_(don_gia|so_luong|thanh_tien|dvt)$/.test(f.name) ? 'px-1.5' : pad} py-2 border-b border-l border-navy-200/70 align-middle ${right ? 'text-right' : STATUS_FIELDS.has(f.name) ? 'text-center' : ''} ${f.type === 'date' || f.type === 'datetime' || f.type === 'number' || f.type === 'money' || f.type === 'bool' || /^id_nguoi/.test(f.name) || res.noWrap ? 'whitespace-nowrap overflow-hidden text-ellipsis' : 'break-words'}`}>
                      {f.multiline && typeof r[f.name] === 'string' ? (() => {
                        // one line per item, never wrapped, so the name / price / quantity columns stay side by side; at most three lines, the rest is in the hover box
                        const ls = (f.nameOf ? named(f, r[f.name], labels) : String(r[f.name])).split('\n'), show = ls.length > 3 ? ls.slice(0, 2) : ls
                        return (<div className="leading-snug">
                          {show.map((l, k) => <div key={k} className={/^ds_(don_gia|so_luong|thanh_tien)$/.test(f.name) ? 'whitespace-nowrap tabular-nums' : 'truncate'}>{l || '—'}</div>)}
                          {ls.length > 3 && <div className="truncate text-[11.5px] font-semibold text-ink-mute">{f.name === 'ds_ten' ? `+${ls.length - 2} dòng nữa…` : '…'}</div>}
                        </div>)
                      })() : <div className={f.name === 'tien_do' || res.key === 'de_xuat' ? 'line-clamp-3' : wide ? 'line-clamp-2' : ''}>{cellNode(f, r)}</div>}
                    </td>
                  )
                })}
              </tr>
            </Fragment>)
          })}
        </tbody>
      </table>
    </div>
  )

  const overlays = (
    <>
      {tip && (
        <Portal>
          <div className="pointer-events-none fixed z-[95] max-h-72 w-[min(440px,calc(100vw-16px))] overflow-hidden whitespace-pre-wrap rounded-lg border border-navy-200 bg-white p-3 text-[13px] leading-relaxed text-navy-900 shadow-pop print:hidden"
            style={{ left: tip.x, top: tip.y, transform: tip.up ? 'translateY(-100%)' : undefined }} role="tooltip">{tip.text}</div>
        </Portal>
      )}
      {confirmDialog}
      {viewing && (
        <Drawer onClose={() => setViewing(null)}>
          <div className="sticky top-0 z-10 bg-white border-b border-navy-200 px-4 py-3 lg:px-6 lg:py-4 flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[11px] font-black uppercase tracking-[0.16em] text-blue-700">{res.singular}</p>
              <h2 className="text-lg font-extrabold text-navy-900 truncate">{res.key === 'users' ? viewing.ho_ten : viewing.id}</h2>
            </div>
            <button onClick={() => setViewing(null)} className="btn-ghost h-9 w-9 px-0" aria-label="Đóng"><X className="h-5 w-5" /></button>
          </div>
          <div className="px-4 py-3 lg:px-6 lg:py-5">
            {/* 2 columns on a phone, 4 from 640px, 6 from 768px; desktop keeps the 2-column sheet. Label and value share a line. */}
            <dl className="grid grid-flow-dense grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-4 gap-x-3 gap-y-2 lg:gap-x-6 lg:gap-y-3.5">
              {res.fields.filter((f) => f.type !== 'password' && !f.name.startsWith('ds_')).map((f) => {
                const long = f.type === 'textarea' || f.name === 'noi_dung'
                const half = f.type === 'ref' || /^(ten|dia_chi|cong_ty|nguoi_)/.test(f.name)
                return (
                  <div key={f.name} className={`min-w-0 text-[13px] leading-snug ${long ? 'col-span-2 sm:col-span-4 md:col-span-6 lg:col-span-4' : half ? 'col-span-2 sm:col-span-2 md:col-span-3 lg:col-span-2' : ''}`}>
                    {long && viewing[f.name]
                      ? <><dt className="label !mb-0.5">{f.label}</dt><dd className="whitespace-pre-wrap text-[13px] leading-relaxed bg-canvas rounded-[7px] border border-navy-200 p-2.5 max-h-72 overflow-y-auto">{display(f, viewing[f.name], labels)}</dd></>
                      : <div className="flex flex-wrap items-baseline gap-x-1"><dt className="shrink-0 text-ink-mute">{f.label}:</dt><dd className="min-w-0 font-semibold text-ink break-words">{cellNode(f, viewing)}</dd></div>}
                  </div>
                )
              })}
            </dl>
            {res.key === 'vat_tu' && (
              <div className="mt-6 pt-5 border-t border-navy-200">
                <StockBatches id={viewing.id} dvt={viewing.dvt} version={version} />
              </div>
            )}
            {res.key === 'de_xuat' && (
              <div className="mt-6 pt-5 border-t border-navy-200">
                <ResourceManager compact resourceKey="de_xuat_chi_tiet" title="Chi tiết đề xuất" filters={{ id_de_xuat: viewing.id }}
                  perms={viewing.trang_thai === 'Đã duyệt' ? { create: false, edit: false, delete: false, approve: false } : perms} />
              </div>
            )}
            {!compact && res.key === 'thiet_bi' && viewing.id && <DeviceMaintenance id={String(viewing.id)} names={labels.nhan_vien ?? new Map()} />}
            {!compact && ATTACHABLE.has(res.key) && viewing.id && <Attachments resource={res.key} id={String(viewing.id)} canEdit={perms.edit} />}
            {!compact && res.key !== 'audit_logs' && res.key !== 'users' && viewing.id && <RecordHistory resource={res.key} id={String(viewing.id)} fields={res.fields} />}
          </div>
          <div className="sticky bottom-0 mt-auto bg-white border-t border-navy-200 px-4 py-2.5 lg:px-6 lg:py-3 flex flex-wrap items-center gap-2">
            {rowActions.filter((a) => !a.show || a.show(viewing)).map((a) => (
              <button key={a.key} className="btn-primary" onClick={() => doAction(a, viewing)}><Zap className="h-4 w-4" />{a.label}</button>
            ))}
            {res.key === 'thiet_bi' && <button className="btn-secondary" onClick={() => setQr(qrOf(viewing))}><QrCode className="h-4 w-4" />Mã QR</button>}
            {res.key === 'de_xuat' && <>
              <button className="btn-secondary" onClick={() => phieu(viewing, 'print')}><Printer className="h-4 w-4" />In</button>
              <button className="btn-secondary" onClick={() => phieu(viewing, 'pdf')}><FileDown className="h-4 w-4" />In PDF</button>
              <button className="btn-secondary" onClick={() => phieu(viewing, 'word')}><FileText className="h-4 w-4" />In Word</button>
            </>}
            {canEdit && !res.locked?.(viewing) && <button className="btn-secondary" onClick={() => setEditing(viewing)}><Pencil className="h-4 w-4" />Sửa</button>}
            {canDelete && !res.locked?.(viewing) && <button className="btn-danger ml-auto" onClick={() => remove(viewing)}><Trash2 className="h-4 w-4" />Xóa</button>}
            {res.locked?.(viewing) && <span className="flex items-center gap-1.5 text-sm text-ink-mute"><Lock className="h-4 w-4" />{res.locked(viewing)}</span>}
          </div>
        </Drawer>
      )}
      {editing && res.key === 'de_xuat' && (
        <ProposalForm kind={filters.loai_de_xuat} row={editing.id ? editing : null} onClose={() => setEditing(null)}
          onSaved={(id) => { setEditing(null); flash('Đã lưu đề xuất'); load(); if (viewing) refreshViewing(id) }} />
      )}
      {editing && res.key !== 'de_xuat' && (
        <FormModal title={`${editing.id ? 'Sửa' : 'Thêm'} ${res.singular}`} subtitle={editing.id && res.key !== 'users' ? editing.id : undefined}
          fields={[...res.fields.filter((f) => !f.ro && f.inForm !== false && (!editing.id || !f.createOnly || f.type === 'password')), ...(editing.id ? [] : res.firstProgress ?? [])]}
          sections={res.formSections}
          initial={editing.id ? (isWork && !editing.don_vi_thuc_hien && editing.id_nha_thau ? { ...editing, don_vi_thuc_hien: editing.id_nha_thau } : editing) : { ...(res.formSections && res.dateField ? { [res.dateField]: (res.openToday && day) || todayVn() } : {}), ...(String(filters.ne_trang_thai ?? '').includes('Trong kho') ? { trang_thai: 'Đang sử dụng' } : {}), ...filters }} isNew={!editing.id} refs={refs} onClose={() => setEditing(null)}
          onSubmit={async (payload) => {
            if (editing.id && !payload.password) delete payload.password // blank = keep password
            const first = { noi_dung: String(payload.noi_dung_tien_do ?? '').trim(), giai_doan: String(payload.giai_doan_tien_do ?? '') }
            for (const f of res.firstProgress ?? []) delete payload[f.name]
            const j = await api(editing.id ? `/api/${res.key}/${editing.id}` : `/api/${res.key}`, { method: editing.id ? 'PATCH' : 'POST', body: JSON.stringify({ ...filters, ...payload }) })
            let note = 'Đã lưu'
            if (!editing.id && res.firstProgress && (first.noi_dung || first.giai_doan) && j.data?.id) {
              // the row is saved; a failed progress line must not make the user save it twice
              try { await api(`/api/${res.key}/${j.data.id}/tien_do`, { method: 'POST', body: JSON.stringify(first) }) }
              catch { note = 'Đã lưu công việc, nhưng chưa ghi được tiến độ — bấm Ghi nhận để nhập lại' }
            }
            setEditing(null); flash(note); load()
            if (editing.id && viewing) refreshViewing(editing.id)
          }} />
      )}
      {acting && (
        <FormModal title={acting.action.label} subtitle={acting.row?.id} fields={acting.action.fields ?? []} initial={{}} isNew refs={refs}
          submitLabel={acting.action.label} onClose={() => setActing(null)}
          onSubmit={async (payload) => {
            const picked: File[] = Array.isArray(payload.anh) ? payload.anh : []
            if (picked.length && acting.row) payload.anh = await uploadPhotos(picked, res.key, acting.row.id)
            else delete payload.anh
            await run(acting.action, acting.row, payload)
          }} />
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
  const pfFields = (res.panelFilters ?? []).map((n) => res.fields.find((f) => f.name === n)).filter((f): f is Field => !!f && !(f.name in filters))
  const pfActive = Object.values(pf).some(Boolean)
  const filterBox = pfFields.length > 0 && (
    <div className="card shrink-0 overflow-hidden">
      <div className="px-3 pt-2.5 text-[12.5px] font-extrabold uppercase tracking-wide text-navy-900">{res.panelTitle ?? 'Bộ lọc'}</div>
      <div className="flex flex-col gap-1.5 px-3 pb-2.5 pt-1">
        {pfFields.map((f) => (
          <label key={f.name} className="text-[12px] font-bold text-ink-mute">{f.label}
            <select className="input mt-0.5 !h-8 !py-0 !text-[13px]" value={pf[f.name] ?? ''} onChange={(e) => setPf((o) => ({ ...o, [f.name]: e.target.value }))}>
              <option value="">{f.name === 'id_khu_vuc' ? 'Tất cả khu vực' : `Tất cả ${f.label.toLowerCase()}`}</option>
              {(refs[f.ref!] ?? []).map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </label>
        ))}
        <button className="btn-ghost btn-sm w-full !h-8" disabled={!pfActive} onClick={() => setPf({})}>Xóa bộ lọc</button>
      </div>
    </div>
  )
  const sideList = sideField ? ['', ...(res.sideNone ? ['__NULL__'] : []), ...[...sideValues].filter((v) => !sideDay || v === side || sideDay[v] > 0).sort((a, b) => String(refLabel(sideField, a)).localeCompare(String(refLabel(sideField, b)), 'vi'))] : []
  return (
    <div className="flex flex-col flex-1 lg:min-h-0">
      {/* breadcrumb + red title */}
      <div className="shrink-0 flex flex-wrap items-baseline gap-x-5 gap-y-1 px-4 lg:px-5 py-2 bg-white border-b border-navy-200">
        <span className="text-[12.5px] text-ink-mute">PHI LONG / <b className="text-navy-800">{title ?? res.title}</b></span>
        <h1 className="text-[22px] font-black text-navy-900">{title ?? res.title}</h1>
      </div>

      {/* tile toolbar + status tabs */}
      <div className={`shrink-0 flex-col gap-2 lg:flex lg:flex-row lg:flex-wrap lg:items-center px-4 lg:px-5 py-2 bg-white border-b border-navy-200 print:hidden hidden lg:flex`}>
        <div className="hidden lg:contents">
        <Tile icon={Search} label="Tìm" color="blue" onClick={() => setSearchOpen((o) => !o)} />
        {canCreate && <Tile icon={Plus} label={isDev ? 'Thêm TB' : 'Thêm'} color="green" onClick={() => setEditing({})} />}
        <Tile icon={Eye} label="Xem" color="teal" disabled={!selected} onClick={withRow((r) => setViewing(r))} />
        {canEdit && <Tile icon={Pencil} label="Sửa" color="orange" disabled={!selected || !!lockedMsg} title={lockedMsg ?? 'Sửa'} onClick={withRow((r) => setEditing(r))} />}
        {canDelete && <Tile icon={Trash2} label="Xóa" color="red" disabled={!selected || !!lockedMsg} title={lockedMsg ?? 'Xóa'} onClick={withRow((r) => remove(r))} />}
        <Tile icon={List} label="Tất cả" color="navy" onClick={resetAll} />
        {rowActions.map((a) => (
          <Tile key={a.key} icon={a.perm === 'approve' ? CheckCircle2 : Zap} label={a.label} color={a.perm === 'approve' ? 'green' : 'violet'}
            disabled={!selected || (a.show ? !a.show(selected) : false)} onClick={withRow((r) => doAction(a, r))} />
        ))}
        {pageActions.map((a) => <Tile key={a.key} icon={Zap} label={a.label} color="violet" onClick={() => doAction(a, null)} />)}
        {isDev && <Tile icon={QrCode} label="Mã QR" color="slate" disabled={!selected} title="Mã QR của thiết bị đang chọn" onClick={withRow((r) => setQr(qrOf(r)))} />}
        {isDev && <Tile icon={Printer} label="In nhãn QR" color="slate" disabled={!devRows.length} title="In nhãn QR cho các thiết bị đang hiện trong danh sách" onClick={() => printQrLabels(devRows.map(qrOf))} />}
        {isDev && <Tile icon={History} label="Lịch sử" color="slate" disabled={!selected} onClick={() => selected && (window.location.href = `/lich_su_chuyen_thiet_bi?id_thiet_bi=${selected.id}`)} />}
        {res.key === 'de_xuat' && <>
          <Tile icon={Printer} label="In" color="slate" disabled={!selected} onClick={withRow((r) => phieu(r, 'print'))} />
          <Tile icon={FileDown} label="In PDF" color="red" disabled={!selected} onClick={withRow((r) => phieu(r, 'pdf'))} />
          <Tile icon={FileText} label="In Word" color="blue" disabled={!selected} onClick={withRow((r) => phieu(r, 'word'))} />
        </>}
        <Tile icon={RotateCw} label="Làm mới" color="blue" onClick={() => load()} />
        {res.key === 'cong_viec_hang_ngay' && !compact && <Tile icon={AlertTriangle} label="Chưa xong" color="amber" title="Chỉ hiện các việc chưa hoàn thành (mọi ngày)" onClick={() => { setUnfinished((u) => !u); setDay(null); setPage(1) }} />}
        {vtSide && <Tile icon={History} label="Lịch sử" color="slate" disabled={!selected} onClick={withRow((r) => setHistOpen(r))} />}
        {res.key === 'de_xuat' && perms.admin && <Tile icon={Scale} label="Duyệt 2 cấp" color="violet" title="Ngưỡng tiền cần Super Admin duyệt cấp 2"
          onClick={() => api('/api/he_thong/cau_hinh').then((j) => setLimitOpen(j.data?.nguong_duyet_2_cap?.gia_tri ?? '0')).catch((e) => flash(e.message, 'err'))} />}
        {res.key === 'de_xuat' && filters.loai_de_xuat === 'MUA_VAT_TU' && <Tile icon={PackagePlus} label="Thêm vật tư" color="amber" title="Thêm vật tư chưa có trong danh mục, để chọn được khi lập đề xuất" onClick={() => setShortOpen(true)} />}
        </div>

        {res.key === 'cong_viec_hang_ngay' && !compact && <DailyWorkSummary version={version} who={side} whoName={side && sideField ? String(refLabel(sideField, side)) : ''} />}
        {isDev && (
          <div className="ml-auto hidden text-right text-[12.5px] leading-snug text-ink-soft lg:block">
            <div className="text-[15px] font-extrabold text-navy-900">{devStats.total} thiết bị · tổng SL {devStats.sl}</div>
            <div>{devStats.use} đang sử dụng · <b className={devStats.total - devStats.use ? 'text-orange-700' : ''}>{devStats.total - devStats.use} chưa sử dụng</b> ({devStats.kho} trong kho · {devStats.todo} chưa có trạng thái)</div>
          </div>
        )}

        {res.quick && !compact && (
          <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 lg:ml-auto lg:flex-wrap lg:overflow-visible lg:pb-0 lg:mx-0 lg:px-0" role="group" aria-label="Lọc nhanh">
            {res.quick.chips.map((c) => {
              const on = quickSel === c.key, Icon = c.key === 'con' ? PackageCheck : c.key === 'het' ? PackageX : Boxes
              const tn = c.key === 'con' ? 'green' : c.key === 'het' ? 'red' : 'blue'
              return (
                <button key={c.key} type="button" aria-pressed={on} onClick={() => setQuickSel(c.key)}
                  className={`shrink-0 min-w-[124px] h-[56px] px-3 rounded-[13px] flex items-center gap-2.5 text-left transition duration-100 active:translate-y-[3px] ${on ? TAB_TONES[tn] : 'bg-white text-navy-900 shadow-[0_5px_0_#c5cfe3] hover:-translate-y-0.5'}`}>
                  <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg ${tn === 'green' ? 'bg-green-100 text-green-700' : tn === 'red' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-700'}`}><Icon className="h-[18px] w-[18px]" /></span>
                  <span className="leading-tight"><span className="block text-[12px] font-black uppercase">{c.label}</span><span className="block text-[12px] font-semibold opacity-80">{quickCounts[c.key] == null ? '…' : quickCounts[c.key].toLocaleString('vi-VN')} {res.singular}</span></span>
                </button>
              )
            })}
          </div>
        )}
        {statusField && !isDev && !res.quick && res.key !== 'cong_viec_hang_ngay' && (
          <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 lg:ml-auto lg:flex-wrap lg:overflow-visible lg:pb-0 lg:mx-0 lg:px-0">
            {statusField.options!.map((o) => {
              const on = status === o
              return (
                <button key={o} onClick={() => setStatus(on ? '' : o)}
                  className={`shrink-0 min-w-[112px] h-[56px] px-2.5 rounded-[13px] text-center transition duration-100 active:translate-y-[3px] ${(statusCounts[o] ?? 0) > 0 && (tone(o) === 'red' || tone(o) === 'amber') ? 'pl-blink' : ''} ${on ? TAB_TONES[tone(o)] : 'bg-white text-navy-900 shadow-[0_5px_0_#c5cfe3] hover:-translate-y-0.5'}`}>
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
        {res.quick && !compact && (
          <div className="flex shrink-0 gap-2 overflow-x-auto pb-1 print:hidden lg:hidden" role="group" aria-label="Lọc nhanh">
            {res.quick.chips.map((c) => {
              const on = quickSel === c.key
              return (
                <button key={c.key} type="button" aria-pressed={on} onClick={() => setQuickSel(c.key)}
                  className={`shrink-0 rounded-full border-2 px-3.5 py-1.5 text-[12.5px] font-extrabold transition ${on ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-[0_4px_12px_rgba(16,24,40,.12)]' : 'border-navy-200 bg-white text-navy-900 hover:border-navy-300'}`}>
                  {c.label} <span className="font-semibold opacity-80">{quickCounts[c.key] == null ? '' : quickCounts[c.key].toLocaleString('vi-VN')}</span></button>
              )
            })}
          </div>
        )}
        {res.key === 'de_xuat' && filters.loai_de_xuat && !compact && <ProposalStats kind={filters.loai_de_xuat} title={title ?? res.title} version={version} />}
        {message}
        {(day || side || status || query || pfActive || devF.nsd || unfinished) && (
          <div className="flex flex-wrap items-center gap-2 text-[12.5px] print:hidden">
            <span className="text-ink-mute font-semibold">Đang lọc:</span>
            {day && <button className="pill-blue" onClick={() => setDay(null)}>Ngày {formatDate(day)} <X className="h-3 w-3" /></button>}
            {side && sideField && <button className="pill-blue" onClick={() => setSide('')}>{sideField.label}: {refLabel(sideField, side)} <X className="h-3 w-3" /></button>}
            {pfFields.map((f) => pf[f.name] ? <button key={f.name} className="pill-blue" onClick={() => setPf((o) => ({ ...o, [f.name]: '' }))}>{f.label}: {refLabel(f, pf[f.name])} <X className="h-3 w-3" /></button> : null)}
            {unfinished && <button className="pill-amber" onClick={() => setUnfinished(false)}>Chưa xong <X className="h-3 w-3" /></button>}
            {devF.nsd && <button className="pill-blue" onClick={() => setDevF((f) => ({ ...f, nsd: '' }))}>Người sử dụng: {staff[devF.nsd]?.ho_ten ?? devF.nsd} <X className="h-3 w-3" /></button>}
            {status && <button className="pill-blue" onClick={() => setStatus('')}>{status} <X className="h-3 w-3" /></button>}
            {query && <button className="pill-blue" onClick={() => { setSearch(''); setQuery('') }}>“{query}” <X className="h-3 w-3" /></button>}
          </div>
        )}

        {isDev && (
          <div className="card shrink-0 print:hidden">
            <button className="flex w-full items-center gap-2 px-3 py-2 text-left text-[13px] font-extrabold text-navy-900" onClick={() => setDevFilterOpen((o) => !o)} aria-expanded={devFilterOpen}>
              <span className={`text-[10px] transition-transform ${devFilterOpen ? 'rotate-90' : ''}`}>▶</span> Bộ lọc thiết bị
              {(status || side || devF.nql || devF.loai) && <span className="pill-blue">đang lọc</span>}
            </button>
            {devFilterOpen && (
              <div className="grid grid-cols-1 gap-3 border-t px-3 py-3 sm:grid-cols-2 xl:grid-cols-4">
                <label className="text-[12px] font-bold text-ink-mute">Trạng thái
                  <select className="input mt-1" value={status} onChange={(e) => setStatus(e.target.value)}>
                    <option value="">Tất cả</option>{['Đang sử dụng', 'Trong kho', 'Bảo trì', 'Chờ thanh lý', 'Đã thanh lý'].map((o) => <option key={o}>{o}</option>)}<option value="__NULL__">Chưa cập nhật (cần xử lý)</option>
                  </select></label>
                <label className="text-[12px] font-bold text-ink-mute">Tầng · Khu vực
                  <select className="input mt-1" value={side} onChange={(e) => setSide(e.target.value)}>
                    <option value="">Tất cả</option>{Object.values(areas).sort((a, b) => String(a.tang).localeCompare(String(b.tang), 'vi', { numeric: true })).map((a) => <option key={a.id} value={a.id}>{a.tang} · {a.ten_khu_vuc}</option>)}
                  </select></label>
                <label className="text-[12px] font-bold text-ink-mute">Người quản lý
                  <select className="input mt-1" value={devF.nql} onChange={(e) => setDevF((f) => ({ ...f, nql: e.target.value }))}>
                    <option value="">Tất cả</option>{devManagers.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
                  </select></label>
                <label className="text-[12px] font-bold text-ink-mute">Loại thiết bị
                  <select className="input mt-1" value={devF.loai} onChange={(e) => setDevF((f) => ({ ...f, loai: e.target.value }))}>
                    <option value="">Tất cả</option>{devTypes.map((t) => <option key={t}>{t}</option>)}
                  </select></label>
              </div>
            )}
          </div>
        )}

        <div className={`grid grid-cols-1 gap-4 lg:flex-1 lg:min-h-0 lg:grid-rows-[minmax(0,1fr)] ${isDev ? 'lg:grid-cols-[minmax(0,1fr)_340px]' : hasCalendar || sideField || vtSide ? 'lg:grid-cols-[230px_minmax(0,1fr)]' : ''}`}>
          {(hasCalendar || sideField || vtSide) && !isDev && (
            <aside className="hidden lg:flex flex-col gap-3 lg:min-h-0 lg:overflow-y-auto print:hidden">
              {hasCalendar && <MonthCalendar month={month} setMonth={setMonth} counts={dayCounts} day={day} setDay={setDay}
                unit={res.singular} fields={res.calendarFields} field={calField} loading={calLoading}
                setField={(f) => { setCalField(f); setDay(null) }} onLatest={jumpLatest} />}
              {filterBox}
              {vtSide && <StockSide params={baseParams().toString()} version={version} pf={pf} setPf={setPf} search={search} setSearch={setSearch} />}
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
                          {sideDay && v !== '' && sideDay[v] > 0 && <span className="float-right rounded-full bg-navy-100 px-2 text-[12px] font-bold text-navy-700">{sideDay[v]}</span>}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}
            </aside>
          )}

          <div className="card overflow-hidden min-w-0 flex flex-col lg:min-h-0">
            {isDev ? <div className="hidden lg:flex lg:min-h-0 lg:flex-1 lg:flex-col">{devTable}</div> : <div className="hidden lg:flex lg:min-h-0 lg:flex-1 lg:flex-col">{table}</div>}
            {isDev ? devCards : cardList}
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
          {devPanel}
        </div>
      </div>
      {(hasCalendar || sideField || vtSide) && (
        <FilterTab onOpen={() => setFilterOpen(true)} active={!!(day || side || pfActive || (vtSide && (search || pf.nhom || pf.dvt)))} />
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
          {pfFields.length > 0 && <div className="mx-3 mb-3 [&>.card]:shadow-none">{filterBox}</div>}
          {vtSide && <div className="mx-3 mb-3 flex flex-col gap-3"><StockSide params={baseParams().toString()} version={version} pf={pf} setPf={setPf} search={search} setSearch={setSearch} /></div>}
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
      {histOpen && (
        <Drawer wide onClose={() => setHistOpen(null)}>
          <div className="sticky top-0 z-10 flex items-start justify-between gap-3 border-b border-navy-200 bg-white px-4 py-3">
            <div className="min-w-0"><p className="text-[11px] font-black uppercase tracking-[0.16em] text-blue-700">Lịch sử nhập xuất</p>
              <h2 className="truncate text-lg font-extrabold text-navy-900">{histOpen.ten_vat_tu} <span className="text-[13px] font-semibold text-ink-mute">· {histOpen.id} · tồn {histOpen.ton_hien_tai}</span></h2></div>
            <button onClick={() => setHistOpen(null)} className="btn-ghost h-9 w-9 px-0" aria-label="Đóng"><X className="h-5 w-5" /></button>
          </div>
          <div className="px-4 py-3">
            <ResourceManager compact resourceKey="nhap_xuat_kho" title="Lịch sử nhập xuất" filters={{ id_vat_tu: histOpen.id }} perms={{ create: false, edit: false, delete: false, approve: false }} />
          </div>
        </Drawer>
      )}
      {qr && <QrDialog device={qr} onClose={() => setQr(null)} />}
      {limitOpen !== null && (
        <FormModal title="Duyệt đề xuất 2 cấp" subtitle="Đề xuất có tổng tiền lớn hơn ngưỡng này: người duyệt thường chỉ duyệt cấp 1, Super Admin duyệt cấp 2 mới hoàn tất (và mới nhập kho). Nhập 0 để tắt." isNew refs={refs}
          initial={{ gia_tri: Number(limitOpen) || 0 }} fields={[{ name: 'gia_tri', label: 'Ngưỡng (đồng)', type: 'money' }]} submitLabel="Lưu ngưỡng"
          onClose={() => setLimitOpen(null)}
          onSubmit={async (payload) => {
            await api('/api/he_thong/cau_hinh', { method: 'POST', body: JSON.stringify({ khoa: 'nguong_duyet_2_cap', gia_tri: String(Math.round(Number(payload.gia_tri) || 0)) }) })
            setLimitOpen(null); flash(Number(payload.gia_tri) > 0 ? `Đã đặt ngưỡng duyệt 2 cấp: ${new Intl.NumberFormat('vi-VN').format(Number(payload.gia_tri))} đ` : 'Đã tắt duyệt 2 cấp')
          }} />
      )}
      {shortOpen && (
        <FormModal title="Thêm vật tư mới" subtitle="Vật tư chưa có trong danh mục. Lưu xong là chọn được khi lập đề xuất." isNew initial={{}} refs={refs}
          fields={(getResource('vat_tu')?.fields ?? []).filter((f) => !f.ro && f.inForm !== false && !f.createOnly)}
          onClose={() => setShortOpen(false)}
          onSubmit={async (payload) => {
            const j = await api('/api/vat_tu', { method: 'POST', body: JSON.stringify(payload) })
            setShortOpen(false); flash(`Đã thêm vật tư ${j.data?.id ?? ''} · ${j.data?.ten_vat_tu ?? ''} vào danh mục`)
          }} />
      )}
    </div>
  )
}

const todayVn = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Ho_Chi_Minh' }).format(new Date())

export function FilterSheet({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  useEscape(onClose)
  return (<Portal>
    <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true">
      <div className="pl-fade absolute inset-0 bg-black/45" onClick={onClose} />
      <div className="pl-sheet absolute inset-x-3 bottom-3 flex max-h-[82vh] flex-col overflow-hidden rounded-2xl bg-white shadow-pop">
        <div className="flex shrink-0 items-center justify-between bg-[#0b1b40] px-4 py-3 text-white">
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

function Drawer({ children, onClose, wide }: { children: React.ReactNode; onClose: () => void; wide?: boolean }) {
  useEscape(onClose)
  return (<Portal>
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-3 sm:p-6 print:hidden" role="dialog" aria-modal="true">
      <div className="pl-fade absolute inset-0 bg-navy-950/50" onClick={onClose} />
      <div className={`pl-sheet relative flex max-h-[92dvh] w-full flex-col overflow-y-auto rounded-2xl bg-white shadow-pop lg:w-[80vw] lg:max-w-none ${wide ? "" : "max-w-3xl"}`}>{children}</div>
    </div>
  </Portal>)
}

function FormModal({ title, subtitle, fields, sections, initial, isNew, refs, onClose, onSubmit, submitLabel = 'Lưu' }: {
  title: string; subtitle?: string; fields: Field[]; sections?: { title: string; rows: string[][] }[]; initial: Row; isNew: boolean; refs: Record<string, Option[]>
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
  // phone/tablet grid: 2 columns, 4 from 640px, 6 from 768px; desktop keeps its 2-column form
  const FULL = 'col-span-2 sm:col-span-4 md:col-span-6 lg:col-span-4'
  const HALF = 'col-span-2 sm:col-span-2 md:col-span-3 lg:col-span-2'
  const span = (f: Field) => (f.type === 'textarea' || f.name === 'noi_dung' || f.type === 'bool' || f.type === 'password' ? FULL
    : f.type === 'ref' || f.type === 'email' || /^(ten|dia_chi|cong_ty|nguoi_)/.test(f.name) ? HALF : 'col-span-1')

  const cell = (f: Field, at?: string) => {
            const required = !!f.required && !(f.type === 'password' && !isNew)
            const set = (v: any) => setForm((s) => ({ ...s, [f.name]: v }))
            const common = { id: `f-${f.name}`, className: 'input h-11 text-[16px] lg:h-9 lg:text-sm', required, value: form[f.name] ?? '', onChange: (e: React.ChangeEvent<any>) => set(e.target.value) }
            if (f.multiRef) return (
              <div key={f.name} className={at ?? FULL}>
                <label htmlFor={`f-${f.name}`} className="label !mb-1">{f.label} <span className="font-semibold text-ink-mute">({f.multiRef === 'nhan_vien' ? 'chọn được nhiều người' : 'chọn được nhiều đơn vị'})</span></label>
                <MultiPick id={`f-${f.name}`} what={f.multiRef === 'nhan_vien' ? 'người làm cùng' : f.label.toLowerCase()} value={String(form[f.name] ?? '')} options={refs[f.multiRef] ?? []} onChange={(v) => set(v)} />
              </div>
            )
            if (f.type === 'files') return (
              <div key={f.name} className={at ?? FULL}>
                <label className="label !mb-1">{f.label}</label>
                <PhotoPicker files={Array.isArray(form[f.name]) ? form[f.name] : []} onChange={(v) => set(v)} />
              </div>
            )
            if (f.type === 'bool') return (
              <label key={f.name} className={`${at ?? FULL} flex items-center gap-3 rounded-[7px] border border-navy-200 px-3 py-2.5 cursor-pointer hover:bg-navy-50`}>
                <input type="checkbox" className="h-4 w-4 accent-blue-600" checked={!!form[f.name]} onChange={(e) => set(e.target.checked)} />
                <span className="text-sm font-bold text-ink">{f.label}</span>
              </label>
            )
            if (f.calc) return (
              <div key={f.name} className={`min-w-0 ${at ?? span(f)}`}>
                <label className="label !mb-0.5 truncate">{f.label}</label>
                <input readOnly tabIndex={-1} className="input h-11 text-[16px] lg:h-9 lg:text-sm bg-navy-50 font-bold tabular-nums" value={new Intl.NumberFormat('vi-VN').format((Number(form[f.calc[0]]) || 0) * (Number(form[f.calc[1]]) || 0))} />
              </div>
            )
            return (
              <div key={f.name} className={`min-w-0 ${at ?? span(f)}`}>
                <label htmlFor={`f-${f.name}`} className="label !mb-0.5 truncate">{f.label}{required && <span className="text-brand-400"> *</span>}</label>
                {f.type === 'textarea' ? <textarea rows={3} placeholder={f.place} {...common} />
                  : f.chips ? (
                    <div className="flex flex-wrap gap-1.5" role="group" aria-label={f.label}>
                      {f.options!.map((o) => (
                        <button key={o} type="button" aria-pressed={form[f.name] === o} onClick={() => set(form[f.name] === o ? '' : o)}
                          className={`h-9 rounded-full border px-3.5 text-[13px] font-bold transition-colors ${form[f.name] === o ? 'border-[#d91828] bg-[#d91828] text-white' : 'border-navy-200 bg-white text-navy-900 hover:bg-navy-50'}`}>{o}</button>
                      ))}
                    </div>
                  )
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
                      {(refs[rk(f)] ?? []).map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  ) : f.type === 'password' ? (
                    <input type="password" autoComplete="new-password" minLength={8} placeholder={isNew ? '' : 'Để trống nếu không đổi'} {...common} />
                  ) : (
                    <input type={f.type === 'money' ? 'number' : f.type} step={f.type === 'number' || f.type === 'money' ? 'any' : undefined} {...common} />
                  )}
              </div>
            )
  }
  // V191 blocks: only fields present in this form; anything not placed goes to the end of the last block
  const blocks = (sections ?? []).map((sec) => ({ title: sec.title, rows: sec.rows.map((r) => r.map((n) => fields.find((f) => f.name === n)).filter(Boolean) as Field[]).filter((r) => r.length) }))
  if (blocks.length) { const placed = new Set((sections ?? []).flatMap((x) => x.rows.flat())); for (const f of fields) if (!placed.has(f.name)) blocks[blocks.length - 1].rows.push([f]) }
  return (<Portal>
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-3 sm:p-6 print:hidden" role="dialog" aria-modal="true">
      <div className="pl-fade absolute inset-0 bg-navy-950/50" onClick={onClose} />
      <form onSubmit={async (e) => {
        e.preventDefault(); setBusy(true); setError('')
        try { await onSubmit({ ...form }) } catch (err: any) { setError(err.message); setBusy(false) }
      }} className="pl-sheet relative w-full sm:max-w-3xl lg:w-[80vw] lg:max-w-none max-h-[92dvh] flex flex-col bg-white rounded-2xl shadow-pop overflow-hidden">
        <div className="flex items-center justify-between gap-3 px-4 py-2.5 lg:px-5 lg:py-3 bg-[#0b1b40] text-white">
          <div>
            <h2 className="text-[16px] font-extrabold">{title}</h2>
            {subtitle && <p className="text-xs font-semibold text-white/80">{subtitle}</p>}
          </div>
          <button type="button" onClick={onClose} className="grid place-items-center h-8 w-8 rounded-md hover:bg-white/15" aria-label="Đóng"><X className="h-5 w-5" /></button>
        </div>
        {!sections ? (
          <div className="px-4 py-3 lg:px-5 lg:py-4 overflow-y-auto grid grid-flow-dense grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-4 gap-x-3 gap-y-2.5 lg:gap-x-4 lg:gap-y-3.5 content-start">
            {fields.map((f) => cell(f))}
          </div>
        ) : (
          <div className="grid content-start gap-x-5 gap-y-4 overflow-y-auto px-4 py-3 lg:grid-cols-2 lg:px-5 lg:py-4">
            {blocks.map((b) => (
              <section key={b.title} className="min-w-0">
                <h3 className="mb-2.5 rounded-[6px] border-l-4 border-[#d91828] bg-navy-50 px-3 py-1.5 text-[12.5px] font-extrabold uppercase tracking-wide text-navy-900">{b.title}</h3>
                <div className="grid gap-y-2.5 lg:gap-y-3">
                  {b.rows.map((row) => (
                    <div key={row[0].name} className="grid grid-cols-1 gap-x-3 gap-y-2.5 sm:[grid-template-columns:repeat(var(--n),minmax(0,1fr))]" style={{ ['--n' as any]: row.length }}>
                      {row.map((f) => cell(f, ''))}
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
        {error && <p className="mx-5 mb-2 rounded-[7px] bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 border border-red-200" role="alert">{error}</p>}
        <div className="flex justify-end gap-2 px-4 py-2.5 lg:px-5 lg:py-3 border-t border-navy-200 bg-navy-50">
          <button type="button" className="btn-secondary h-11 flex-1 sm:flex-none lg:h-9" onClick={onClose}>Hủy</button>
          <button className="btn-primary h-11 flex-1 sm:min-w-[96px] sm:flex-none lg:h-9" disabled={busy}>{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : submitLabel}</button>
        </div>
      </form>
    </div>
  </Portal>)
}

/* ── progress photos: pick / shoot, shrink in the browser, upload to Google Drive through the server ── */
async function shrink(file: File, max = 1600): Promise<Blob> {
  const bmp = await createImageBitmap(file).catch(() => null)
  if (!bmp) return file
  const k = Math.min(1, max / Math.max(bmp.width, bmp.height))
  const c = document.createElement('canvas'); c.width = Math.round(bmp.width * k); c.height = Math.round(bmp.height * k)
  c.getContext('2d')!.drawImage(bmp, 0, 0, c.width, c.height)
  return await new Promise<Blob>((res) => c.toBlob((b) => res(b ?? file), 'image/jpeg', 0.82))
}
async function uploadPhotos(files: File[], bang: string, id: string): Promise<string[]> {
  const ids: string[] = []
  for (const f of files) {
    const fd = new FormData()
    fd.append('file', new File([await shrink(f)], 'anh.jpg', { type: 'image/jpeg' })); fd.append('bang', bang); fd.append('id', id)
    const r = await fetch('/api/anh_tien_do', { method: 'POST', body: fd })
    const j = await r.json().catch(() => null)
    if (!r.ok || !j?.success) throw new Error(j?.error || j?.message || 'Không tải được ảnh lên')
    ids.push(j.data.file_id)
  }
  return ids
}
function PhotoPicker({ files, onChange }: { files: File[]; onChange: (f: File[]) => void }) {
  const urls = useMemo(() => files.map((f) => URL.createObjectURL(f)), [files])
  useEffect(() => () => urls.forEach((u) => URL.revokeObjectURL(u)), [urls])
  return (
    <div>
      <label className="btn-secondary h-10 cursor-pointer">
        <span>+ Thêm ảnh</span>
        <input type="file" accept="image/*" multiple className="hidden"
          onChange={(e) => { const add = Array.from(e.target.files ?? []); e.target.value = ''; onChange([...files, ...add].slice(0, 12)) }} />
      </label>
      {files.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {urls.map((u, i) => (
            <div key={u} className="relative h-20 w-20 overflow-hidden rounded-lg border border-navy-200">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={u} alt={`Ảnh ${i + 1}`} className="h-full w-full object-cover" />
              <button type="button" aria-label="Bỏ ảnh" onClick={() => onChange(files.filter((_, k) => k !== i))}
                className="absolute right-0.5 top-0.5 grid h-5 w-5 place-items-center rounded-full bg-black/60 text-[12px] leading-none text-white">×</button>
            </div>
          ))}
        </div>
      )}
      <p className="mt-1 text-[11.5px] text-ink-mute">Tối đa 12 ảnh, tự thu nhỏ trước khi tải lên Google Drive.</p>
    </div>
  )
}

/* ── several people from the staff list, stored as "NV0002,NV0010" (same format as the V191 sheet) ── */
function MultiPick({ id, what, value, options, onChange }: { id: string; what: string; value: string; options: Option[]; onChange: (v: string) => void }) {
  const picked = value.split(/\s*,\s*/).map((x) => x.trim()).filter(Boolean)
  const name = new Map(options.map((o) => [o.value, o.label]))
  const rest = options.filter((o) => !picked.includes(o.value))
  const put = (list: string[]) => onChange(Array.from(new Set(list)).join(','))
  return (
    <div className="rounded-[10px] border border-navy-200 bg-white p-2">
      <div className="flex flex-wrap items-center gap-1.5">
        {picked.map((v) => (
          <span key={v} className="inline-flex h-8 items-center gap-1 rounded-full bg-blue-50 pl-3 pr-1 text-[13px] font-bold text-blue-800">
            {name.get(v) ?? v}
            <button type="button" aria-label={`Bỏ ${name.get(v) ?? v}`} onClick={() => put(picked.filter((x) => x !== v))} className="grid h-6 w-6 place-items-center rounded-full hover:bg-blue-100"><X className="h-3.5 w-3.5" /></button>
          </span>
        ))}
        <select id={id} value="" onChange={(e) => { if (e.target.value) put([...picked, e.target.value]) }} disabled={!rest.length}
          className="h-9 min-w-[170px] flex-1 rounded-lg border-0 bg-navy-50 px-2 text-[14px] font-semibold text-navy-900 focus:outline-none focus:ring-2 focus:ring-select lg:h-8 lg:text-[13px]">
          <option value="">{rest.length ? (picked.length ? '+ Thêm…' : `— Chọn ${what} —`) : 'Đã chọn hết danh sách'}</option>
          {rest.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>
    </div>
  )
}
