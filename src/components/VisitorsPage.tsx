'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Search, Plus, Eye, Pencil, LogOut, Printer, Ban, RotateCw, X, Loader2, UserCheck, CalendarClock, Inbox } from 'lucide-react'
import Portal from '@/components/Portal'
import { useConfirm } from '@/components/ConfirmDialog'
import { Tile } from '@/components/ResourceManager'
import { formatDate } from '@/lib/resources'

type Row = Record<string, any>
const IN = 'Đang trong tòa nhà', BOOK = 'Hẹn trước', OUT = 'Đã ra', CANCEL = 'Hủy'
const PURPOSES = ['Làm việc', 'Giao hàng', 'Sửa chữa', 'Phỏng vấn', 'Khác']
type TabKey = 'in' | 'book' | 'out' | 'today' | 'history'

const EMPTY = {
  ho_ten: '', sdt: '', giay_to: '', nguoi_di_cung: '', cong_ty: '', dia_chi: '', nguoi_can_gap: '', phong_ban: '', tang: '',
  cong_ty_lien_he: '', noi_dung: '', muc_dich: 'Làm việc', ghi_chu: '', ngay_hen: '', gio_hen: '',
}

async function api(url: string, init?: RequestInit) {
  const r = await fetch(url, { ...init, headers: { 'Content-Type': 'application/json' } })
  const j = await r.json().catch(() => ({ success: false, error: 'Phản hồi không hợp lệ' }))
  if (r.status === 401) { window.location.href = '/login'; throw new Error('Phiên đăng nhập đã hết') }
  if (!j.success) throw new Error(j.error || 'Có lỗi xảy ra')
  return j
}

const vnToday = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Ho_Chi_Minh' }).format(new Date())
const vnClock = () => new Intl.DateTimeFormat('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh', hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date())
const mask = (v?: string | null) => (v ? '*'.repeat(Math.min(String(v).length, 12)) : '')
const people = (r: Row) => 1 + String(r.nguoi_di_cung ?? '').split(/[,;\n]/).filter((x) => x.trim()).length

/** minutes between check-in and now (or check-out); null when the time is unknown */
function minutesIn(r: Row, now = Date.now()): number | null {
  if (!r.ngay || !/^\d{1,2}:\d{2}/.test(r.gio_vao ?? '')) return null
  const start = Date.parse(`${r.ngay}T${String(r.gio_vao).padStart(5, '0').slice(0, 5)}:00+07:00`)
  if (Number.isNaN(start)) return null
  let end = now
  if (r.trang_thai === OUT && /^\d{1,2}:\d{2}/.test(r.gio_ra ?? '')) {
    const e = Date.parse(`${r.ngay}T${String(r.gio_ra).padStart(5, '0').slice(0, 5)}:00+07:00`)
    if (!Number.isNaN(e)) end = e
  }
  return Math.max(0, Math.round((end - start) / 60000))
}
const fmtMin = (m: number | null) => (m == null ? '—' : m < 60 ? `${m} phút` : `${Math.floor(m / 60)} giờ ${m % 60 ? `${m % 60} phút` : ''}`.trim())
const esc = (s: unknown) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!))

export default function VisitorsPage({ perms, userName }: { perms: { create: boolean; edit: boolean }; userName: string }) {
  const [inside, setInside] = useState<Row[]>([])
  const [booked, setBooked] = useState<Row[]>([])
  const [todayRows, setTodayRows] = useState<Row[]>([])
  const [history, setHistory] = useState<Row[]>([])
  const [tab, setTab] = useState<TabKey>('in')
  const [filter, setFilter] = useState('')
  const [only4h, setOnly4h] = useState(false)
  const [histQuery, setHistQuery] = useState('')
  const [selected, setSelected] = useState<string | null>(null)
  const [viewing, setViewing] = useState<Row | null>(null)
  const [mode, setMode] = useState<'in' | 'book'>('in')
  const [form, setForm] = useState<Record<string, string>>(EMPTY)
  const [editId, setEditId] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [confirm, confirmDialog] = useConfirm()
  const [loading, setLoading] = useState(true)
  const [synced, setSynced] = useState('')
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)
  const [tick, setTick] = useState(0)
  const formRef = useRef<HTMLFormElement>(null)
  const today = vnToday()

  const flash = (text: string, type: 'ok' | 'err' = 'ok') => setMsg({ type, text })
  useEffect(() => { if (msg?.type === 'ok') { const t = setTimeout(() => setMsg(null), 3500); return () => clearTimeout(t) } }, [msg])

  const load = useCallback(async () => {
    try {
      const q = (p: string) => api(`/api/khach_ra_vao?${p}&pageSize=500`).then((j) => j.data as Row[])
      const [a, b, c] = await Promise.all([
        q(`trang_thai=${encodeURIComponent(IN)}`), q(`trang_thai=${encodeURIComponent(BOOK)}`), q(`ngay=${vnToday()}`),
      ])
      setInside(a); setBooked(b); setTodayRows(c); setSynced(vnClock())
    } catch (e: any) { flash(e.message, 'err') } finally { setLoading(false) }
  }, [])
  useEffect(() => { load() }, [load])
  // refresh every minute (also re-computes the "Đã ở" durations)
  useEffect(() => { const t = setInterval(() => { load(); setTick((n) => n + 1) }, 60000); return () => clearInterval(t) }, [load])

  // history search (server side, debounced)
  useEffect(() => {
    if (tab !== 'history') return
    const t = setTimeout(() => {
      api(`/api/khach_ra_vao?pageSize=100${histQuery ? `&search=${encodeURIComponent(histQuery)}` : ''}`).then((j) => setHistory(j.data)).catch((e) => flash(e.message, 'err'))
    }, 300)
    return () => clearTimeout(t)
  }, [tab, histQuery])

  const dueToday = booked.filter((r) => r.ngay_hen === today)
  const allToday = useMemo(() => {
    const m = new Map<string, Row>()
    for (const r of [...todayRows, ...dueToday]) m.set(r.id, r)
    return [...m.values()]
  }, [todayRows, dueToday])
  const outToday = todayRows.filter((r) => r.trang_thai === OUT)
  const over4h = inside.filter((r) => (minutesIn(r) ?? 0) > 240)
  const insidePeople = inside.reduce((n, r) => n + people(r), 0)

  const list: Row[] = tab === 'in' ? inside : tab === 'book' ? booked : tab === 'out' ? outToday : tab === 'today' ? allToday : history
  const shown = useMemo(() => {
    const q = filter.trim().toLowerCase()
    if (tab === 'in' && only4h) return over4h.filter((r) => !q || JSON.stringify(r).toLowerCase().includes(q))
    if (!q || tab === 'history') return list
    return list.filter((r) => [r.ho_ten, r.sdt, r.giay_to, r.cong_ty, r.dia_chi, r.nguoi_can_gap, r.noi_dung].some((v) => String(v ?? '').toLowerCase().includes(q)))
  }, [list, filter, tab, only4h, over4h])
  const sel = [...inside, ...booked, ...todayRows, ...history].find((r) => r.id === selected) ?? null

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }))
  function resetForm() { setForm(EMPTY); setEditId(null); setMode('in') }

  async function lookupPhone() {
    const phone = form.sdt.trim()
    if (editId || phone.replace(/\D/g, '').length < 8) return
    try {
      const j = await api(`/api/khach_ra_vao?search=${encodeURIComponent(phone)}&pageSize=1`)
      const r = j.data?.[0] as Row | undefined
      if (!r) return
      setForm((f) => ({ ...f, ho_ten: f.ho_ten || r.ho_ten || '', cong_ty: f.cong_ty || r.cong_ty || '', giay_to: f.giay_to || r.giay_to || '', dia_chi: f.dia_chi || r.dia_chi || '' }))
      flash(`Khách quen: đã điền thông tin của ${r.ho_ten}`)
    } catch { /* lookup is a convenience only */ }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (mode === 'book' && !editId && !form.ngay_hen) { flash('Chọn ngày hẹn', 'err'); return }
    setBusy(true)
    try {
      const payload: Row = { ...form }
      if (editId) {
        delete payload.ngay_hen; delete payload.gio_hen
        await api(`/api/khach_ra_vao/${editId}`, { method: 'PATCH', body: JSON.stringify(payload) })
        flash('Đã lưu thay đổi')
      } else {
        payload.trang_thai = mode === 'in' ? IN : BOOK
        if (mode === 'in') { delete payload.ngay_hen; delete payload.gio_hen }
        await api('/api/khach_ra_vao', { method: 'POST', body: JSON.stringify(payload) })
        flash(mode === 'in' ? `Đã check-in ${form.ho_ten}` : `Đã đăng ký trước cho ${form.ho_ten}`)
        setTab(mode === 'in' ? 'in' : 'book')
      }
      resetForm(); load()
    } catch (err: any) { flash(err.message, 'err') } finally { setBusy(false) }
  }

  async function act(action: 'checkout' | 'check_in' | 'huy', r: Row, ask: string) {
    if (!(await confirm(ask, { title: action === 'huy' ? 'Hủy lượt khách' : action === 'check_in' ? 'Cho khách vào' : 'Check-out', danger: action === 'huy', okLabel: action === 'huy' ? 'Hủy lượt' : 'Đồng ý' }))) return
    try {
      await api(`/api/khach_ra_vao/${r.id}/${action}`, { method: 'POST', body: '{}' })
      flash(action === 'checkout' ? `${r.ho_ten} đã ra` : action === 'check_in' ? `${r.ho_ten} đã vào` : 'Đã hủy lượt')
      setSelected(null); load()
    } catch (err: any) { flash(err.message, 'err') }
  }

  function editRow(r: Row) {
    setEditId(r.id); setMode('in')
    setForm({ ...EMPTY, ...Object.fromEntries(Object.keys(EMPTY).map((k) => [k, r[k] ?? ''])) })
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  function printSlip(r: Row) {
    const line = (k: string, v: unknown) => (v ? `<tr><th>${esc(k)}</th><td>${esc(v)}</td></tr>` : '')
    const html = (`<!doctype html><html lang="vi"><head><meta charset="utf-8"><title>Phiếu khách ${esc(r.id)}</title><style>
      body{font:14px/1.5 Arial,sans-serif;margin:18px;color:#111}img{height:42px;display:block;margin:0 auto 8px}h1{font-size:17px;text-align:center;margin:4px 0 12px}
      table{width:100%;border-collapse:collapse}th{text-align:left;width:34%;padding:5px 6px;color:#555;font-weight:600;vertical-align:top}td{padding:5px 6px;font-weight:700}
      tr{border-bottom:1px dashed #ccc}.id{text-align:center;font-size:20px;font-weight:800;letter-spacing:2px;margin:8px 0}.foot{margin-top:14px;font-size:12px;color:#555;text-align:center}</style></head><body>
      <img src="${location.origin}/brand/philong-logo.png" alt="Phi Long Technology"><h1>PHIẾU KHÁCH RA/VÀO</h1><div class="id">${esc(r.id)}</div><table>
      ${line('Họ tên', r.ho_ten)}${line('Công ty', r.cong_ty)}${line('Người cần gặp', r.nguoi_can_gap)}${line('Phòng ban', r.phong_ban)}${line('Tầng', r.tang)}
      ${line('Mục đích', r.muc_dich)}${line('Ngày vào', formatDate(r.ngay))}${line('Giờ vào', r.gio_vao)}${line('Người đi cùng', r.nguoi_di_cung)}${line('Biển số xe', r.bien_so_xe)}</table>
      <div class="foot">Vui lòng trả phiếu khi ra về · Người trực: ${esc(r.nguoi_dang_ky || userName)}</div>
      </body></html>`)
    // print from a hidden frame inside the page: no new window, nothing for a popup blocker to stop
    const f = document.createElement('iframe')
    f.setAttribute('aria-hidden', 'true')
    f.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0'
    f.srcdoc = html
    f.onload = () => {
      const w = f.contentWindow
      if (!w) return
      setTimeout(() => { w.focus(); w.print(); setTimeout(() => f.remove(), 2000) }, 300)
    }
    document.body.appendChild(f)
  }

  const stat = (key: TabKey, label: string, value: React.ReactNode, sub?: string, tone = 'text-navy-900', ring = 'border-b-blue-600', long = false) => (
    <button type="button" onClick={() => { setTab(key); setOnly4h(long) }}
      className={`shrink-0 min-w-[132px] text-left rounded-[9px] bg-white px-3 py-1.5 border border-navy-200 border-b-[3px] shadow-[0_1px_2px_rgba(16,24,40,.06)] hover:-translate-y-px transition ${ring} ${tab === key && only4h === long ? 'ring-2 ring-green-600/60' : ''}`}>
      <div className="text-[11px] font-black uppercase tracking-wide text-navy-700">{label}</div>
      <div className={`text-[20px] leading-tight font-extrabold tabular-nums ${tone}`}>{value}{sub && <span className="ml-2 text-[11.5px] font-medium text-ink-mute">{sub}</span>}</div>
    </button>
  )

  const tabBtn = (key: TabKey, label: string, count?: number) => (
    <button key={key} onClick={() => { setTab(key); setOnly4h(false) }} role="tab" aria-selected={tab === key}
      className={`px-3 py-2.5 text-[13.5px] font-bold border-b-2 -mb-px whitespace-nowrap ${tab === key ? 'text-blue-700 border-blue-600' : 'text-navy-700 border-transparent hover:text-navy-900'}`}>
      {label}{count !== undefined ? ` (${count})` : ''}
    </button>
  )

  const label = 'block text-[10.5px] font-black uppercase tracking-wide text-navy-700 mb-1'
  const inp = 'input h-9'
  const req = <span className="text-brand-400"> *</span>

  return (
    <div className="flex flex-col flex-1 lg:min-h-0">
      {confirmDialog}
      <div className="shrink-0 flex flex-wrap items-baseline gap-x-5 gap-y-1 px-4 lg:px-5 py-2 bg-white border-b border-navy-200">
        <span className="text-[12.5px] text-ink-mute">PHI LONG / <b className="text-navy-800">Khách ra/vào tòa nhà</b></span>
        <h1 className="text-[22px] font-black text-navy-900">Khách ra/vào tòa nhà</h1>
      </div>

      <div className="shrink-0 flex flex-col gap-2 lg:flex-row lg:flex-wrap lg:items-center px-4 lg:px-5 py-2 bg-white border-b border-navy-200 print:hidden">
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 lg:contents lg:overflow-visible lg:pb-0 lg:mx-0 lg:px-0">
        <Tile icon={Search} label="Tìm" color="blue" onClick={() => setTab('history')} />
        {perms.create && <Tile icon={Plus} label="Khách vào" color="green" onClick={() => { resetForm(); formRef.current?.scrollIntoView({ behavior: 'smooth' }); (formRef.current?.elements.namedItem('ho_ten') as HTMLInputElement | null)?.focus() }} />}
        <Tile icon={Eye} label="Xem" color="teal" disabled={!sel} onClick={() => sel && setViewing(sel)} />
        {perms.edit && <Tile icon={Pencil} label="Sửa" color="orange" disabled={!sel} onClick={() => sel && editRow(sel)} />}
        {perms.edit && <Tile icon={LogOut} label={sel?.trang_thai === BOOK ? 'Check-in' : 'Check-out'} color="violet" disabled={!sel || ![IN, BOOK].includes(sel.trang_thai)}
          onClick={() => sel && (sel.trang_thai === BOOK ? act('check_in', sel, `Cho ${sel.ho_ten} vào tòa nhà?`) : act('checkout', sel, `Ghi nhận ${sel.ho_ten} đã ra?`))} />}
        <Tile icon={Printer} label="In phiếu" color="slate" disabled={!sel} onClick={() => sel && printSlip(sel)} />
        {perms.edit && <Tile icon={Ban} label="Hủy lượt" color="red" disabled={!sel || ![IN, BOOK].includes(sel.trang_thai)} onClick={() => sel && act('huy', sel, `Hủy lượt của ${sel.ho_ten}?`)} />}
        <Tile icon={RotateCw} label="Tải lại" color="violet" onClick={() => { setLoading(true); load() }} />

        </div>
        <div className="hidden lg:flex gap-2 lg:ml-auto lg:flex-wrap">
          {stat('in', 'Đang trong tòa nhà', inside.length, `lượt · ${insidePeople} người`, 'text-green-700', 'border-b-green-600')}
          {stat('book', 'Hẹn trước', booked.length, undefined, 'text-blue-700', 'border-b-blue-600')}
          {stat('out', 'Đã ra hôm nay', outToday.length, undefined, 'text-navy-900', 'border-b-navy-500')}
          {stat('in', 'Ở quá 4 giờ', over4h.length, undefined, over4h.length ? 'text-red-600' : 'text-navy-900', 'border-b-red-600', true)}
        </div>
      </div>

      <div className="flex flex-col gap-3 px-4 lg:px-5 py-3 lg:flex-1 lg:min-h-0 lg:overflow-y-auto xl:overflow-hidden">
        {msg && (
          <div role="status" className={`flex items-start justify-between gap-3 rounded-[9px] border px-4 py-2.5 text-sm font-semibold ${msg.type === 'ok' ? 'bg-green-50 text-green-800 border-green-200' : 'bg-red-50 text-red-800 border-red-200'}`}>
            <span>{msg.text}</span><button onClick={() => setMsg(null)} aria-label="Đóng" className="opacity-60 hover:opacity-100"><X className="h-4 w-4" /></button>
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-[360px_minmax(0,1fr)] gap-4 xl:flex-1 xl:min-h-0 xl:grid-rows-[minmax(0,1fr)]">
          {/* registration form */}
          <form ref={formRef} onSubmit={submit} className="card p-4 xl:h-full xl:overflow-y-auto print:hidden">
            <div className="flex items-baseline justify-between">
              <h2 className="text-[13px] font-black uppercase tracking-wide text-blue-700">{editId ? `Sửa ${editId}` : 'Đăng ký khách'}</h2>
              <span className="text-[11px] text-ink-mute">{editId ? 'Đang chỉnh sửa' : 'Giờ vào: tự lấy giờ máy chủ'}</span>
            </div>

            {!editId && (
              <div className="mt-3 grid grid-cols-2 gap-1 p-1 rounded-[9px] bg-navy-100" role="tablist" aria-label="Kiểu đăng ký">
                <button type="button" role="tab" aria-selected={mode === 'in'} onClick={() => setMode('in')}
                  className={`h-9 rounded-[7px] text-[13px] font-extrabold flex items-center justify-center gap-1.5 ${mode === 'in' ? 'bg-blue-600 text-white shadow' : 'text-navy-700'}`}><UserCheck className="h-4 w-4" />Check-in ngay</button>
                <button type="button" role="tab" aria-selected={mode === 'book'} onClick={() => setMode('book')}
                  className={`h-9 rounded-[7px] text-[13px] font-extrabold flex items-center justify-center gap-1.5 ${mode === 'book' ? 'bg-blue-600 text-white shadow' : 'text-navy-700'}`}><CalendarClock className="h-4 w-4" />Đăng ký trước</button>
              </div>
            )}

            {mode === 'book' && !editId && (
              <div className="mt-3 grid grid-cols-2 gap-3">
                <div><label className={label} htmlFor="v-ngay-hen">Ngày hẹn{req}</label><input id="v-ngay-hen" type="date" className={inp} value={form.ngay_hen} min={today} onChange={(e) => set('ngay_hen', e.target.value)} /></div>
                <div><label className={label} htmlFor="v-gio-hen">Giờ hẹn</label><input id="v-gio-hen" type="time" className={inp} value={form.gio_hen} onChange={(e) => set('gio_hen', e.target.value)} /></div>
              </div>
            )}

            <h3 className="mt-4 mb-2 pb-1 border-b border-navy-200 text-[12px] font-black uppercase text-blue-700">Thông tin khách</h3>
            <div className="grid grid-cols-2 gap-x-3 gap-y-2.5">
              <div><label className={label} htmlFor="v-ho-ten">Họ tên khách{req}</label><input id="v-ho-ten" name="ho_ten" required className={inp} value={form.ho_ten} onChange={(e) => set('ho_ten', e.target.value)} /></div>
              <div><label className={label} htmlFor="v-sdt">Số điện thoại{req}</label><input id="v-sdt" name="sdt" required inputMode="tel" placeholder="Khách quen tự điền" className={inp} value={form.sdt} onChange={(e) => set('sdt', e.target.value)} onBlur={lookupPhone} /></div>
              <div><label className={label} htmlFor="v-giay-to">CCCD / Giấy tờ</label><input id="v-giay-to" className={inp} value={form.giay_to} onChange={(e) => set('giay_to', e.target.value)} /></div>
              <div><label className={label} htmlFor="v-di-cung">Người đi cùng</label><input id="v-di-cung" placeholder="Nhiều người: cách nhau dấu phẩy" className={inp} value={form.nguoi_di_cung} onChange={(e) => set('nguoi_di_cung', e.target.value)} /></div>
              <div className="col-span-2"><label className={label} htmlFor="v-cong-ty">Công ty</label><input id="v-cong-ty" className={inp} value={form.cong_ty} onChange={(e) => set('cong_ty', e.target.value)} /></div>
              <div className="col-span-2"><label className={label} htmlFor="v-dia-chi">Địa chỉ</label><input id="v-dia-chi" className={inp} value={form.dia_chi} onChange={(e) => set('dia_chi', e.target.value)} /></div>
            </div>

            <h3 className="mt-4 mb-2 pb-1 border-b border-navy-200 text-[12px] font-black uppercase text-blue-700">Cần liên hệ</h3>
            <div className="grid grid-cols-2 gap-x-3 gap-y-2.5">
              <div><label className={label} htmlFor="v-gap">Người cần gặp</label><input id="v-gap" className={inp} value={form.nguoi_can_gap} onChange={(e) => set('nguoi_can_gap', e.target.value)} /></div>
              <div><label className={label} htmlFor="v-pb">Phòng ban</label><input id="v-pb" className={inp} value={form.phong_ban} onChange={(e) => set('phong_ban', e.target.value)} /></div>
              <div><label className={label} htmlFor="v-tang">Tầng</label><input id="v-tang" className={inp} value={form.tang} onChange={(e) => set('tang', e.target.value)} /></div>
              <div><label className={label} htmlFor="v-ct-lh">Công ty</label><input id="v-ct-lh" className={inp} value={form.cong_ty_lien_he} onChange={(e) => set('cong_ty_lien_he', e.target.value)} /></div>
              <div className="col-span-2"><label className={label} htmlFor="v-nd">Nội dung công việc</label><textarea id="v-nd" rows={2} className="input" value={form.noi_dung} onChange={(e) => set('noi_dung', e.target.value)} /></div>
            </div>

            <div className="mt-3">
              <span className={label}>Mục đích</span>
              <div className="flex flex-wrap gap-1.5">
                {PURPOSES.map((p) => (
                  <button key={p} type="button" aria-pressed={form.muc_dich === p} onClick={() => set('muc_dich', p)}
                    className={`h-7 px-3 rounded-full text-[12px] font-bold border ${form.muc_dich === p ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-navy-300 text-navy-800 hover:bg-navy-50'}`}>{p}</button>
                ))}
              </div>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-x-3">
              <div><label className={label} htmlFor="v-tr">Người đăng ký / trực</label><input id="v-tr" readOnly className={`${inp} bg-navy-50`} value={userName} /></div>
              <div><label className={label} htmlFor="v-ghichu">Ghi chú</label><input id="v-ghichu" className={inp} value={form.ghi_chu} onChange={(e) => set('ghi_chu', e.target.value)} /></div>
            </div>

            <div className="mt-4 flex gap-2 sticky -bottom-4 -mx-4 -mb-4 px-4 py-3 bg-white border-t border-navy-200">
              <button disabled={busy || !(editId ? perms.edit : perms.create)}
                className={`flex-1 h-11 rounded-[9px] text-white text-[14px] font-extrabold flex items-center justify-center gap-2 disabled:opacity-50 ${mode === 'in' || editId ? 'bg-green-700 hover:bg-green-800' : 'bg-blue-700 hover:bg-blue-800'}`}>
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : editId ? 'LƯU THAY ĐỔI' : mode === 'in' ? '→ CHECK-IN' : 'ĐĂNG KÝ TRƯỚC'}
              </button>
              {(editId || form.ho_ten || form.sdt) && <button type="button" onClick={resetForm} className="btn-secondary h-11">{editId ? 'Hủy sửa' : 'Xóa form'}</button>}
            </div>
          </form>

          {/* list */}
          <div className="card overflow-hidden min-w-0 flex flex-col xl:min-h-0">
            <div role="tablist" aria-label="Danh sách khách" className="shrink-0 flex overflow-x-auto px-3 border-b border-navy-200">
              {tabBtn('in', 'Đang trong tòa nhà', inside.length)}
              {tabBtn('book', 'Hẹn trước', booked.length)}
              {tabBtn('out', 'Đã ra hôm nay', outToday.length)}
              {tabBtn('today', 'Tất cả hôm nay', allToday.length)}
              {tabBtn('history', 'Tìm lịch sử')}
            </div>
            <div className="shrink-0 px-3 pt-3">
              <label className="flex items-center gap-2 h-10 px-3 rounded-[9px] border border-navy-200 bg-white focus-within:border-select-accent">
                <Search className="h-4 w-4 text-[#2189e6]" />
                <input aria-label="Tìm khách" className="flex-1 bg-transparent outline-none text-[13.5px]" value={tab === 'history' ? histQuery : filter}
                  onChange={(e) => (tab === 'history' ? setHistQuery(e.target.value) : setFilter(e.target.value))}
                  placeholder={tab === 'history' ? 'Tìm toàn bộ lịch sử: tên, SĐT, CCCD, công ty, địa chỉ, người cần gặp, nội dung…' : 'Tìm tên, SĐT, CCCD, công ty, địa chỉ, người cần gặp, nội dung…'} />
              </label>
            </div>

            <div className="overflow-auto max-h-[70vh] min-h-[260px] xl:max-h-none xl:flex-1 xl:min-h-0 p-2.5">
              <table className="hidden w-full text-[12.5px] border-separate border-spacing-0 rounded-[9px] overflow-hidden border border-navy-200 lg:table">
                <thead>
                  <tr className="text-[12.5px] font-extrabold text-navy-900">
                    {['Ngày vào', 'Giờ', 'Họ tên', 'Đi cùng', 'Công ty', 'SĐT', 'CCCD', 'Địa chỉ', 'Người cần gặp', 'Tầng', 'Mục đích', 'Nội dung', 'Đã ở', 'Trạng thái'].map((h) => (
                      <th key={h} className="sticky top-0 z-[1] bg-navy-50 border-b border-navy-200 px-2 py-2 text-left whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    [...Array(4)].map((_, i) => <tr key={i}><td colSpan={14} className="px-3 py-3 border-b border-navy-100"><div className="h-3.5 rounded bg-navy-100 animate-pulse" style={{ width: `${55 + i * 9}%` }} /></td></tr>)
                  ) : shown.length === 0 ? (
                    <tr><td colSpan={14} className="px-4 py-14 text-center text-ink-mute"><Inbox className="h-8 w-8 mx-auto mb-2 text-navy-300" />
                      {tab === 'in' ? 'Hiện không có khách trong tòa nhà' : tab === 'history' ? 'Không tìm thấy lượt khách nào' : 'Không có dữ liệu'}</td></tr>
                  ) : shown.map((r) => {
                    const on = r.id === selected
                    const mins = minutesIn(r)
                    const long = r.trang_thai === IN && (mins ?? 0) > 240
                    return (
                      <tr key={r.id} tabIndex={0} aria-selected={on} onClick={() => setSelected(on ? null : r.id)} onDoubleClick={() => setViewing(r)}
                        onKeyDown={(e) => { if (e.key === 'Enter') setViewing(r) }}
                        className={`cursor-pointer outline-none ${on ? 'bg-select' : long ? 'bg-red-50' : r.trang_thai === BOOK ? 'bg-[#f3f8ff]' : 'bg-white hover:bg-navy-50'}`}>
                        <td className={`px-2 py-2 border-b border-navy-100 whitespace-nowrap tabular-nums ${on ? 'shadow-[inset_3px_0_0_#2189e6]' : ''}`}>{formatDate(r.trang_thai === BOOK && r.ngay_hen ? r.ngay_hen : r.ngay)}</td>
                        <td className="px-2 py-2 border-b border-navy-100 tabular-nums">{r.trang_thai === BOOK ? r.gio_hen || '—' : r.gio_vao || '—'}</td>
                        <td className="px-2 py-2 border-b border-navy-100 font-extrabold whitespace-nowrap">{r.ho_ten}</td>
                        <td className="px-2 py-2 border-b border-navy-100 max-w-[90px] truncate">{r.nguoi_di_cung || '—'}</td>
                        <td className="px-2 py-2 border-b border-navy-100 max-w-[110px] truncate">{r.cong_ty || '—'}</td>
                        <td className="px-2 py-2 border-b border-navy-100 whitespace-nowrap tabular-nums">{r.sdt || '—'}</td>
                        <td className="px-2 py-2 border-b border-navy-100 font-mono text-xs text-ink-mute">{mask(r.giay_to) || '—'}</td>
                        <td className="px-2 py-2 border-b border-navy-100 max-w-[90px] truncate">{r.dia_chi || '—'}</td>
                        <td className="px-2 py-2 border-b border-navy-100 max-w-[110px] truncate">{r.nguoi_can_gap || '—'}</td>
                        <td className="px-2 py-2 border-b border-navy-100 max-w-[70px] truncate">{r.tang || '—'}</td>
                        <td className="px-2 py-2 border-b border-navy-100 whitespace-nowrap">{r.muc_dich || '—'}</td>
                        <td className="px-2 py-2 border-b border-navy-100 max-w-[150px] truncate">{r.noi_dung || '—'}</td>
                        <td className="px-2 py-2 border-b border-navy-100 whitespace-nowrap">
                          {r.trang_thai === BOOK ? <span className="text-ink-mute">—</span> : <span className={long ? 'pill-red' : 'pill-green'}>{fmtMin(mins)}</span>}
                        </td>
                        <td className="px-2 py-2 border-b border-navy-100 whitespace-nowrap">
                          <span className={r.trang_thai === IN ? 'pill-green' : r.trang_thai === BOOK ? 'pill-blue' : r.trang_thai === CANCEL ? 'pill-red' : 'pill-gray'}>
                            {r.trang_thai === IN ? 'Đang ở' : r.trang_thai === OUT ? `Đã ra${r.gio_ra ? ` ${r.gio_ra}` : ''}` : r.trang_thai}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
              {/* phone: one card per visit, with the actions inline */}
              <div className="space-y-2.5 lg:hidden">
                {loading ? [...Array(3)].map((_, i) => <div key={i} className="h-28 animate-pulse rounded-2xl bg-navy-100" />)
                  : shown.length === 0 ? <div className="px-4 py-12 text-center text-ink-mute"><Inbox className="mx-auto mb-2 h-8 w-8 text-navy-300" />{tab === 'in' ? 'Hiện không có khách trong tòa nhà' : 'Không có dữ liệu'}</div>
                  : shown.map((r) => {
                    const mins = minutesIn(r)
                    const long = r.trang_thai === IN && (mins ?? 0) > 240
                    const edge = long ? 'border-l-red-500' : r.trang_thai === IN ? 'border-l-emerald-500' : r.trang_thai === BOOK ? 'border-l-blue-500' : 'border-l-navy-300'
                    const info: [string, unknown][] = [['Công ty', r.cong_ty], ['SĐT', r.sdt], ['Người cần gặp', r.nguoi_can_gap], ['Tầng', r.tang], ['Mục đích', r.muc_dich], ['Đi cùng', r.nguoi_di_cung]]
                    return (
                      <div key={r.id} className={`rounded-2xl border border-navy-200 border-l-4 ${edge} bg-white px-3 py-2.5 shadow-[0_1px_2px_rgba(16,24,40,.06)]`}>
                        <button type="button" onClick={() => setViewing(r)} className="block w-full text-left">
                          <div className="flex items-center gap-2 text-[12px] text-ink-mute">
                            <span className="rounded-md bg-blue-50 px-2 py-0.5 font-extrabold tabular-nums text-blue-700">{formatDate(r.trang_thai === BOOK && r.ngay_hen ? r.ngay_hen : r.ngay)} · {r.trang_thai === BOOK ? r.gio_hen || '—' : r.gio_vao || '—'}</span>
                            <span className={`ml-auto ${r.trang_thai === IN ? 'pill-green' : r.trang_thai === BOOK ? 'pill-blue' : r.trang_thai === CANCEL ? 'pill-red' : 'pill-gray'}`}>
                              {r.trang_thai === IN ? 'Đang ở' : r.trang_thai === OUT ? `Đã ra${r.gio_ra ? ` ${r.gio_ra}` : ''}` : r.trang_thai}</span>
                          </div>
                          <div className="mt-1.5 flex items-center gap-2"><span className="text-[15px] font-extrabold text-navy-900">{r.ho_ten}</span>
                            {r.trang_thai === IN && <span className={long ? 'pill-red' : 'pill-green'}>{fmtMin(mins)}</span>}</div>
                          <dl className="mt-1.5 grid grid-cols-2 gap-x-3 gap-y-1 sm:grid-cols-4 md:grid-cols-6">
                            {info.filter(([, v]) => v).map(([k, v]) => (
                              <div key={k} className="flex min-w-0 items-baseline gap-1 text-[12.5px]"><dt className="shrink-0 text-ink-mute">{k}:</dt><dd className="min-w-0 truncate font-semibold text-ink">{String(v)}</dd></div>
                            ))}
                          </dl>
                        </button>
                        {perms.edit && (r.trang_thai === IN || r.trang_thai === BOOK) && (
                          <div className="mt-2 flex gap-2 border-t border-navy-100 pt-2">
                            {r.trang_thai === BOOK
                              ? <button className="btn-primary h-9 flex-1" onClick={() => act('check_in', r, `Cho ${r.ho_ten} vào tòa nhà?`)}>Check-in</button>
                              : <button className="btn-primary h-9 flex-1" onClick={() => act('checkout', r, `Ghi nhận ${r.ho_ten} đã ra?`)}>Check-out</button>}
                            <button className="btn-secondary h-9" onClick={() => printSlip(r)}>In phiếu</button>
                            <button className="btn-secondary h-9 text-red-600" onClick={() => act('huy', r, `Hủy lượt khách của ${r.ho_ten}?`)}>Hủy</button>
                          </div>
                        )}
                      </div>
                    )
                  })}
              </div>
            </div>
          </div>
        </div>

        <div className="shrink-0 flex flex-wrap items-center justify-between gap-2 rounded-[9px] bg-white border border-navy-200 px-4 py-2 text-[12.5px] print:hidden" data-tick={tick}>
          <span className="font-bold text-green-700">● Đã đồng bộ lúc {synced || '--:--'}</span>
          <span className="font-bold text-navy-900">{inside.length} khách đang trong tòa nhà · {booked.length} hẹn trước · {outToday.length} đã ra hôm nay</span>
          <span className="text-ink-mute">Tự cập nhật mỗi phút · Người trực: <b className="text-navy-900">{userName}</b></span>
        </div>
      </div>

      {viewing && (
        <Portal>
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="Chi tiết lượt khách">
            <div className="absolute inset-0 bg-navy-950/45" onClick={() => setViewing(null)} />
            <div className="relative w-full max-w-xl lg:max-w-xl sm:max-w-3xl max-h-[92dvh] overflow-y-auto rounded-xl bg-white shadow-pop">
              <div className="flex items-center justify-between px-5 py-3 bg-blue-700 text-white">
                <div><div className="text-[11px] font-black uppercase tracking-widest text-white/80">Lượt khách</div><h2 className="text-lg font-extrabold">{viewing.id} · {viewing.ho_ten}</h2></div>
                <button onClick={() => setViewing(null)} className="grid place-items-center h-8 w-8 rounded-md hover:bg-white/15" aria-label="Đóng"><X className="h-5 w-5" /></button>
              </div>
              <dl className="grid grid-flow-dense grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-2 gap-x-3 gap-y-2 p-4 text-[13px] leading-snug lg:gap-x-5 lg:gap-y-3 lg:p-5">
                {([['Ngày vào', formatDate(viewing.ngay)], ['Giờ vào', viewing.gio_vao], ['Giờ ra', viewing.gio_ra], ['Trạng thái', viewing.trang_thai], ['SĐT', viewing.sdt], ['CCCD / Giấy tờ', viewing.giay_to],
                  ['Công ty', viewing.cong_ty], ['Địa chỉ', viewing.dia_chi], ['Người đi cùng', viewing.nguoi_di_cung], ['Biển số xe', viewing.bien_so_xe], ['Người cần gặp', viewing.nguoi_can_gap], ['Phòng ban', viewing.phong_ban],
                  ['Tầng', viewing.tang], ['Công ty liên hệ', viewing.cong_ty_lien_he], ['Mục đích', viewing.muc_dich], ['Ngày hẹn', formatDate(viewing.ngay_hen)], ['Giờ hẹn', viewing.gio_hen],
                  ['Người đăng ký', viewing.nguoi_dang_ky], ['Người check-out', viewing.nguoi_checkout]] as [string, any][]).map(([k, v]) => (
                  <div key={k} className="flex min-w-0 flex-wrap items-baseline gap-x-1"><dt className="shrink-0 text-ink-mute">{k}:</dt><dd className="min-w-0 break-words font-semibold text-ink">{v || <span className="text-navy-300">—</span>}</dd></div>
                ))}
                <div className="col-span-2 sm:col-span-4 md:col-span-6 lg:col-span-2"><dt className="label !mb-0.5">Nội dung công việc</dt><dd className="whitespace-pre-wrap">{viewing.noi_dung || <span className="text-navy-300">—</span>}</dd></div>
                <div className="col-span-2 sm:col-span-4 md:col-span-6 lg:col-span-2"><dt className="label !mb-0.5">Ghi chú</dt><dd className="whitespace-pre-wrap">{viewing.ghi_chu || <span className="text-navy-300">—</span>}</dd></div>
              </dl>
              <div className="flex gap-2 px-4 py-2.5 lg:px-5 lg:py-3 border-t border-navy-200 bg-navy-50">
                <button className="btn-secondary h-10 lg:h-9" onClick={() => printSlip(viewing)}><Printer className="h-4 w-4" />In phiếu</button>
                <button className="btn-secondary ml-auto" onClick={() => setViewing(null)}>Đóng</button>
              </div>
            </div>
          </div>
        </Portal>
      )}
    </div>
  )
}
