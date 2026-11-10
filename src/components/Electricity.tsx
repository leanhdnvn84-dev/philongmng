'use client'

// Tiền điện — layout and workflow follow V191: period list | readings grouped by invoice | selected invoice panel.
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Coins, History, Lock, LockOpen, Plus, Printer, RefreshCw, Save, User, X, Zap } from 'lucide-react'
import Portal from '@/components/Portal'
import { useConfirm } from '@/components/ConfirmDialog'
import { printHtml } from '@/lib/proposalDoc'
import { giayBaoHtml, type Invoice } from '@/lib/electricityDoc'

interface Row {
  id: string; ky: string; ngay_chot: string | null; id_khach_thue: string | null; ten_khach_thue: string | null; id_tang: string | null; tang: string | null
  ma_cong_to: string; ten_cong_to: string | null; nhom_hoa_don: string | null; chi_so_cu: number | null; chi_so_moi: number | null
  so_kwh: number | null; don_gia: number | null; thanh_tien: number | null; vat: number | null; trang_thai: string | null
}
interface Customer { id: string; ten_khach_thue: string; id_tang: string | null; trang_thai: string | null }
interface Perms { create: boolean; edit: boolean; delete: boolean; approve: boolean }

const vnd = (n: number) => new Intl.NumberFormat('vi-VN').format(Math.round(n))
const num3 = (n: number) => new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 3 }).format(n)
const kyText = (ky: string) => `Tháng ${ky.slice(5, 7)}/${ky.slice(0, 4)}`
const nextKy = (ky: string) => { const y = +ky.slice(0, 4), m = +ky.slice(5, 7); return m === 12 ? `${y + 1}-01` : `${y}-${String(m + 1).padStart(2, '0')}` }
const toNum = (v: string) => { let s = v.replace(/\s/g, ''); if (/^\d{1,3}(\.\d{3})+$/.test(s)) s = s.replace(/\./g, ''); s = s.replace(',', '.'); return s === '' ? null : Number(s) }
const closeDateOf = (rows: Row[]) => {
  const c = rows.find((r) => r.ngay_chot)?.ngay_chot; if (c) return c
  const n = rows.map((r) => r.nhom_hoa_don ?? '').find((x) => /^\d{8}-/.test(x)); return n ? `${n.slice(0, 4)}-${n.slice(4, 6)}-${n.slice(6, 8)}` : null
}
const dmy = (iso: string | null) => (iso ? `${iso.slice(8, 10)}/${iso.slice(5, 7)}/${iso.slice(0, 4)}` : '')

async function api(url: string, init?: RequestInit) {
  const r = await fetch(url, init), j = await r.json().catch(() => ({ success: false, error: 'Lỗi mạng' }))
  if (!j.success) throw new Error(j.error || 'Có lỗi xảy ra')
  return j
}
const post = (body: object) => api('/api/dien', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  useEffect(() => { const k = (e: KeyboardEvent) => e.key === 'Escape' && onClose(); document.addEventListener('keydown', k); return () => document.removeEventListener('keydown', k) }, [onClose])
  return (
    <Portal>
      <div className="fixed inset-0 z-[90] flex items-center justify-center p-3" role="dialog" aria-modal="true" aria-label={title}>
        <div className="absolute inset-0 bg-black/45" onClick={onClose} />
        <div className="relative z-10 w-full max-w-md max-h-[90dvh] overflow-y-auto rounded-2xl bg-white p-5 shadow-pop">
          <div className="mb-3 flex items-center"><h2 className="flex-1 text-[17px] font-extrabold text-navy-900">{title}</h2>
            <button onClick={onClose} aria-label="Đóng" className="grid h-9 w-9 place-items-center rounded-full bg-navy-100"><X className="h-4 w-4" /></button></div>
          {children}
        </div>
      </div>
    </Portal>
  )
}
const Field = ({ label, children }: { label: string; children: React.ReactNode }) => <label className="mb-3 block"><span className="mb-1 block text-[13px] font-bold text-ink-soft">{label}</span>{children}</label>

type Check = { text: string; cls: string; bad: boolean }

export default function Electricity({ perms }: { perms: Perms }) {
  const [rows, setRows] = useState<Row[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loaded, setLoaded] = useState(false)
  const [syncAt, setSyncAt] = useState<Date | null>(null)
  const [ky, setKy] = useState('')
  const [sel, setSel] = useState<string | null>(null)
  const [edits, setEdits] = useState<Record<string, string>>({})
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)
  const [modal, setModal] = useState<null | { kind: 'ky' } | { kind: 'meter'; nhom?: string } | { kind: 'customer' } | { kind: 'history' } | { kind: 'price' }>(null)
  const [hist, setHist] = useState<any[] | null>(null)
  const [form, setForm] = useState<Record<string, string>>({})
  const [confirm, dialog] = useConfirm()
  const inputs = useRef<Record<string, HTMLInputElement | null>>({})

  const load = useCallback(async (keep = true) => {
    try {
      const j = await api('/api/dien', { cache: 'no-store' })
      setRows(j.data); setCustomers(j.customers ?? []); setSyncAt(new Date(j.at)); setLoaded(true)
      setKy((cur) => (keep && cur && j.data.some((r: Row) => r.ky === cur) ? cur : j.data[0]?.ky ?? ''))
    } catch (e: any) { setMsg({ ok: false, text: e.message }); setLoaded(true) }
  }, [])
  useEffect(() => { load(false) }, [load])

  // ── derived data ──
  const periods = useMemo(() => {
    const m = new Map<string, Row[]>()
    for (const r of rows) m.set(r.ky, [...(m.get(r.ky) ?? []), r])
    return [...m.entries()].sort((a, b) => (a[0] < b[0] ? 1 : -1)).map(([k, rs]) => {
      const g = new Map<string, number>()
      for (const r of rs) g.set(r.nhom_hoa_don ?? r.id, (g.get(r.nhom_hoa_don ?? r.id) ?? 0) + Number(r.thanh_tien ?? 0))
      const vat = Number(rs.find((r) => r.vat != null)?.vat ?? 0)
      let total = 0; g.forEach((s) => { total += s + Math.round(s * vat) })
      return { ky: k, rows: rs, total, closed: !rs.some((r) => r.trang_thai !== 'Đã chốt') }
    })
  }, [rows])
  const period = periods.find((p) => p.ky === ky)
  const latest = periods[0]
  const locked = !period || period.closed
  const prevOf = useMemo(() => {
    // kWh of the same meter in the nearest earlier period
    const idx = periods.findIndex((p) => p.ky === ky)
    const map = new Map<string, number>()
    for (const p of periods.slice(idx + 1)) for (const r of p.rows) if (!map.has(r.ma_cong_to) && r.so_kwh != null) map.set(r.ma_cong_to, Number(r.so_kwh))
    return map
  }, [periods, ky])

  const calc = useCallback((r: Row) => {
    const raw = edits[r.id]
    const now = raw !== undefined ? toNum(raw) : r.chi_so_moi
    const old = r.chi_so_cu == null ? null : Number(r.chi_so_cu)
    const price = Number(r.don_gia ?? 0)
    const kwh = now != null && old != null ? Math.round((now - old) * 1000) / 1000 : 0
    return { now, old, price, kwh, amount: now != null && old != null ? Math.round((now - old) * price) : 0 }
  }, [edits])

  const check = useCallback((r: Row): Check => {
    const c = calc(r)
    if (c.now == null || Number.isNaN(c.now)) return { text: 'Chưa nhập', cls: 'bg-amber-100 text-amber-800', bad: true }
    if (c.old != null && c.now < c.old) return { text: 'Nhỏ hơn chỉ số cũ', cls: 'bg-red-100 text-red-700', bad: true }
    const prev = prevOf.get(r.ma_cong_to)
    if (prev && prev > 0 && c.kwh > prev * 1.5) return { text: 'Tăng bất thường', cls: 'bg-red-100 text-red-700', bad: true }
    if (prev && prev > 0 && c.kwh < prev * 0.5) return { text: 'Giảm mạnh', cls: 'bg-amber-100 text-amber-800', bad: true }
    if (c.kwh === 0) return { text: '0 kWh', cls: 'bg-amber-100 text-amber-800', bad: true }
    return { text: 'OK', cls: 'bg-green-100 text-green-700', bad: false }
  }, [calc, prevOf])

  const invoices = useMemo(() => {
    const m = new Map<string, Row[]>()
    for (const r of period?.rows ?? []) { const k = r.nhom_hoa_don ?? r.id; m.set(k, [...(m.get(k) ?? []), r]) }
    return [...m.entries()].map(([id, rs]) => {
      const lines = rs.map((r) => ({ r, c: calc(r) }))
      const vatRate = Number(rs.find((r) => r.vat != null)?.vat ?? 0)
      const sub = lines.reduce((a, l) => a + l.c.amount, 0), vat = Math.round(sub * vatRate)
      return { id, rows: rs, lines, vatRate, sub, vat, total: sub + vat, name: rs[0].ten_khach_thue ?? '—', khach: rs[0].id_khach_thue ?? '' }
    })
  }, [period, calc])

  useEffect(() => { if (!invoices.some((i) => i.id === sel)) setSel(invoices[0]?.id ?? null) }, [invoices, sel])
  const cur = invoices.find((i) => i.id === sel)

  const totals = useMemo(() => {
    let kwh = 0, sub = 0, vat = 0, bad = 0, n = 0
    for (const i of invoices) { sub += i.sub; vat += i.vat; for (const l of i.lines) { kwh += l.c.kwh; n++; if (check(l.r).bad) bad++ } }
    return { kwh, sub, vat, total: sub + vat, bad, n, vatRate: invoices[0]?.vatRate ?? 0 }
  }, [invoices, check])
  const price = period?.rows.find((r) => r.don_gia != null)?.don_gia

  const chart = useMemo(() => {
    if (!cur?.khach) return []
    const idx = periods.findIndex((p) => p.ky === ky)
    return periods.slice(idx, idx + 12).reverse().map((p) => ({
      ky: p.ky, kwh: p.rows.filter((r) => r.id_khach_thue === cur.khach).reduce((a, r) => a + (p.ky === ky ? calc(r).kwh : Number(r.so_kwh ?? 0)), 0),
    }))
  }, [periods, ky, cur, calc])

  const dirty = Object.keys(edits).length
  const flash = (ok: boolean, text: string) => setMsg({ ok, text })
  const run = async (fn: () => Promise<string | void>, after = true) => {
    setBusy(true); setMsg(null)
    try { const t = await fn(); if (after) await load(); if (t) flash(true, t) } catch (e: any) { flash(false, e.message) } finally { setBusy(false) }
  }

  const setEdit = (r: Row, v: string) => setEdits((e) => {
    const n = { ...e }; const orig = r.chi_so_moi == null ? '' : String(r.chi_so_moi)
    if (v.trim() === orig) delete n[r.id]; else n[r.id] = v
    return n
  })
  const save = () => run(async () => {
    const items = Object.entries(edits).map(([id, v]) => ({ id, chi_so_moi: v.trim() === '' ? null : toNum(v) }))
    if (items.some((i) => i.chi_so_moi !== null && !Number.isFinite(i.chi_so_moi))) throw new Error('Có chỉ số không phải số')
    const j = await post({ op: 'save', items }); setEdits({}); return `Đã lưu ${j.data.saved} chỉ số`
  })
  const chot = async () => {
    if (dirty) { flash(false, 'Hãy lưu chỉ số trước khi chốt kỳ'); return }
    if (!(await confirm(`Chốt ${kyText(ky)}?\n\nSau khi chốt, chỉ số của kỳ bị khóa. Chỉ người có quyền duyệt mới mở lại được.`, { okLabel: 'Chốt kỳ' }))) return
    run(async () => { const j = await post({ op: 'chot_ky', ky }); return j.data?.message })
  }
  const reopen = async () => {
    if (!(await confirm(`Mở lại ${kyText(ky)} để sửa chỉ số?`, { okLabel: 'Mở lại kỳ' }))) return
    run(async () => (await post({ op: 'reopen', ky })).data.message)
  }
  const removeMeter = async (r: Row) => {
    if (!(await confirm(`Xóa công tơ ${r.ma_cong_to} khỏi ${kyText(r.ky)}?`, { danger: true, okLabel: 'Xóa' }))) return
    run(async () => { await post({ op: 'remove_meter', id: r.id }); setEdits((e) => { const n = { ...e }; delete n[r.id]; return n }); return `Đã xóa ${r.ma_cong_to}` })
  }
  const openHistory = () => { setModal({ kind: 'history' }); setHist(null); api('/api/dien?history=1').then((j) => setHist(j.data)).catch((e) => flash(false, e.message)) }

  const toInvoice = (i: (typeof invoices)[number]): Invoice => ({
    id: i.id, customerId: i.khach, customer: i.name, sub: i.sub, vatRate: i.vatRate, vat: i.vat, total: i.total,
    lines: i.lines.map(({ r, c }) => ({ code: r.ma_cong_to, name: r.ten_cong_to ?? '', floor: r.tang ?? '', old: c.old, now: c.now ?? null, kwh: c.kwh, price: c.price, amount: c.amount })),
  })
  const print = (list: typeof invoices) => {
    if (!list.length) return
    const hasMissing = list.some((i) => i.lines.some((l) => l.c.now == null))
    if (hasMissing) flash(false, 'Có công tơ chưa nhập chỉ số mới: giấy báo sẽ để trống phần đó')
    printHtml(giayBaoHtml(list.map(toInvoice), ky, closeDateOf(period?.rows ?? []), window.location.origin))
  }

  const submitModal = () => {
    if (!modal) return
    if (modal.kind === 'ky') return run(async () => { const j = await post({ op: 'tao_ky', ky: form.ky, don_gia: form.don_gia ?? '' }); setModal(null); const k = form.ky; setTimeout(() => setKy(k), 400); return j.data?.message })
    if (modal.kind === 'meter') return run(async () => { await post({ op: 'add_meter', ky, nhom_hoa_don: form.nhom, ma_cong_to: form.ma, ten_cong_to: form.ten, tang: form.tang, chi_so_cu: form.cu }); setModal(null); return 'Đã thêm công tơ' })
    if (modal.kind === 'customer') return run(async () => { const j = await post({ op: 'add_customer', ky, id_khach_thue: form.khach, ma_cong_to: form.ma, ten_cong_to: form.ten, tang: form.tang, chi_so_cu: form.cu }); setModal(null); if (j.data?.nhom_hoa_don) setTimeout(() => setSel(j.data.nhom_hoa_don), 600); return `Đã thêm khách và công tơ ${j.data?.ma_cong_to ?? ''}` })
    if (modal.kind === 'price') return run(async () => { const j = await post({ op: 'set_price', ky, don_gia: form.gia, nhom_hoa_don: form.pham_vi === 'hd' ? cur?.id : '', ly_do: form.ly_do }); setModal(null); return j.data?.message })
  }
  const open = (m: NonNullable<typeof modal>, init: Record<string, string> = {}) => { setForm(init); setModal(m); setMsg(null) }

  const btn = 'inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg border bg-white px-3 text-[12.5px] font-bold transition disabled:cursor-not-allowed disabled:opacity-40'
  const nextPeriod = latest ? nextKy(latest.ky) : ''
  const canNew = perms.create && !!latest && latest.closed

  const panel = cur && (
    <div className="space-y-3">
      <div className="text-[11px] font-extrabold uppercase tracking-[.12em] text-ink-soft">Hoá đơn đang chọn</div>
      <div><div className="text-[18px] font-extrabold leading-snug text-navy-900">{cur.name}</div><div className="mt-0.5 text-[12.5px] text-ink-mute">{cur.khach} · {kyText(ky)}</div></div>
      <ul className="rounded-lg border border-navy-200 text-[13px]">
        {cur.lines.map(({ r, c }) => (
          <li key={r.id} className="flex items-center gap-2 border-b border-navy-100 px-3 py-1.5 last:border-0"><span className="flex-1 truncate">{[r.tang, r.ten_cong_to].filter(Boolean).join(' · ')}</span><span className="tabular-nums">{c.now == null ? '—' : vnd(c.amount)}</span></li>
        ))}
      </ul>
      <dl className="space-y-1.5 text-[13.5px]">
        <div className="flex"><dt className="flex-1 text-ink-soft">Tiền điện chưa VAT</dt><dd className="font-bold tabular-nums">{vnd(cur.sub)}</dd></div>
        <div className="flex"><dt className="flex-1 text-ink-soft">VAT {Math.round(cur.vatRate * 100)}%</dt><dd className="font-bold tabular-nums">{vnd(cur.vat)}</dd></div>
        <div className="flex items-baseline"><dt className="flex-1 text-ink-soft">Tổng thanh toán</dt><dd className="text-[22px] font-extrabold tabular-nums text-[#e11d2e]">{vnd(cur.total)} đ</dd></div>
      </dl>
      <div className="pt-1 text-[11px] font-extrabold uppercase tracking-[.12em] text-ink-soft">Điện năng của khách 12 kỳ gần nhất</div>
      <div className="flex h-24 items-end gap-1 rounded-lg bg-brand-50 p-2" role="img" aria-label="Biểu đồ điện năng 12 kỳ">
        {(() => { const mx = Math.max(1, ...chart.map((x) => x.kwh)); return chart.map((x) => (
          <div key={x.ky} title={`${kyText(x.ky)}: ${num3(x.kwh)} kWh`} className={`min-h-[2px] flex-1 rounded-t ${x.ky === ky ? 'bg-[#e11d2e]' : 'bg-red-300'}`} style={{ height: `${Math.max(2, (x.kwh / mx) * 100)}%` }} />
        )) })()}
      </div>
      <div className="flex gap-2 pt-1">
        <button onClick={() => print([cur])} className="inline-flex h-10 flex-1 items-center justify-center gap-1.5 rounded-lg bg-[#e11d2e] text-[13.5px] font-bold text-white shadow-[0_4px_10px_rgba(225,29,46,.3)]"><Printer className="h-4 w-4" />In giấy báo này</button>
        <button onClick={() => print(invoices)} className="inline-flex h-10 items-center rounded-lg border border-[#e11d2e] px-4 text-[13.5px] font-bold text-[#e11d2e]">In cả kỳ</button>
      </div>
    </div>
  )

  return (
    <div className="flex flex-1 flex-col lg:min-h-0">
      {dialog}
      {/* title + toolbar */}
      <div className="flex shrink-0 flex-wrap items-center gap-x-4 gap-y-2 border-b border-navy-200 bg-white px-4 py-2.5 lg:px-5">
        <div className="min-w-0">
          <h1 className="inline text-[22px] font-extrabold text-navy-900">Tiền điện</h1>
          {period && <span className="ml-2 text-[12.5px] text-ink-mute">{kyText(ky)}{closeDateOf(period.rows) ? ` · chốt ngày ${dmy(closeDateOf(period.rows))}` : ''} · {period.closed ? 'Đã chốt' : 'Đang nhập chỉ số'}</span>}
        </div>
        <div className="-mx-1 flex max-w-full flex-1 gap-1.5 lg:justify-end overflow-x-auto px-1 pb-0.5 lg:flex-none">
          <button className={`${btn} border-navy-200 text-navy-900`} disabled={!canNew || busy} onClick={() => open({ kind: 'ky' }, { ky: nextPeriod, don_gia: '' })}><Plus className="h-4 w-4" />Tạo kỳ mới</button>
          <button className={`${btn} border-navy-200 text-navy-900`} disabled={locked || !perms.create || busy} onClick={() => open({ kind: 'customer' }, { khach: '', ma: '', ten: '', tang: '', cu: '' })}><User className="h-4 w-4" />Thêm khách</button>
          <button className={`${btn} border-amber-300 text-amber-700`} disabled={locked || !perms.create || busy} onClick={() => open({ kind: 'meter' }, { nhom: cur?.id ?? '', ma: '', ten: '', tang: '', cu: '' })}><Zap className="h-4 w-4" />Thêm công tơ</button>
          <button className={`${btn} border-teal-300 text-teal-700`} disabled={locked || !perms.edit || busy || !period} onClick={() => open({ kind: 'price' }, { gia: price != null ? String(price) : '', pham_vi: 'ky', ly_do: '' })}><Coins className="h-4 w-4" />Giá điện</button>
          <button className={`${btn} ${dirty ? 'border-blue-600 bg-blue-600 text-white' : 'border-navy-200 text-navy-900'}`} disabled={!dirty || busy || !perms.edit} onClick={save}><Save className="h-4 w-4" />Lưu chỉ số{dirty ? ` (${dirty})` : ''}</button>
          <button className={`${btn} border-[#e11d2e] text-[#e11d2e]`} disabled={locked || !perms.approve || busy} onClick={chot}><Lock className="h-4 w-4" />Chốt kỳ</button>
          <button className={`${btn} border-navy-200 text-navy-900`} disabled={!period?.closed || ky !== latest?.ky || !perms.approve || busy} onClick={reopen}><LockOpen className="h-4 w-4" />Mở lại kỳ</button>
          <button className={`${btn} border-violet-300 text-violet-700`} disabled={!period} onClick={() => print(invoices)}><Printer className="h-4 w-4" />In giấy báo</button>
          <button className={`${btn} border-green-300 text-green-700`} onClick={openHistory}><History className="h-4 w-4" />Lịch sử</button>
          <button className={`${btn} border-navy-200 text-navy-900`} disabled={busy} onClick={() => load()}><RefreshCw className={`h-4 w-4 ${busy ? 'animate-spin' : ''}`} />Làm mới</button>
        </div>
      </div>
      {msg && <p role="status" className={`shrink-0 border-b px-4 py-2 text-sm font-semibold lg:px-5 ${msg.ok ? 'border-green-200 bg-green-50 text-green-700' : 'border-red-200 bg-red-50 text-red-700'}`}>{msg.text}</p>}

      <div className="grid flex-1 grid-cols-1 gap-3 p-3 lg:min-h-0 lg:grid-cols-[190px_minmax(0,1fr)_280px] lg:px-5 2xl:grid-cols-[210px_minmax(0,1fr)_320px]">
        {/* period list */}
        <aside className="rounded-xl border border-navy-200 bg-white lg:flex lg:min-h-0 lg:flex-col">
          <div className="hidden px-3 pb-1 pt-3 text-[11px] font-extrabold uppercase tracking-[.12em] text-ink-soft lg:block">Kỳ tính tiền</div>
          <div className="flex gap-2 overflow-x-auto p-2 lg:flex-1 lg:flex-col lg:gap-0 lg:overflow-y-auto lg:p-0">
            {periods.map((p) => (
              <button key={p.ky} onClick={() => { setKy(p.ky); setEdits({}) }} aria-current={p.ky === ky}
                className={`flex shrink-0 items-center gap-2 rounded-lg border-l-[3px] px-3 py-2.5 text-left lg:rounded-none lg:border-b lg:border-b-navy-100 ${p.ky === ky ? 'border-l-[#e11d2e] bg-brand-50' : 'border-l-transparent bg-navy-50 lg:bg-white lg:hover:bg-navy-50'}`}>
                <span className="min-w-0 flex-1"><span className="block text-[13.5px] font-bold text-navy-900">{kyText(p.ky)}</span><span className="block text-[12px] text-ink-mute">{vnd(p.total)} đ</span></span>
                <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${p.closed ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-800'}`}>{p.closed ? 'Đã chốt' : 'Nháp'}</span>
              </button>
            ))}
            {loaded && !periods.length && <p className="p-3 text-sm text-ink-mute">Chưa có kỳ nào.</p>}
          </div>
        </aside>

        {/* center */}
        <section className="flex min-w-0 flex-col gap-3 lg:min-h-0">
          <div className="grid shrink-0 grid-cols-2 gap-1.5 sm:grid-cols-3 lg:grid-cols-5">
            {[
              ['Tổng điện năng', `${num3(totals.kwh)} kWh`, ''], ['Chưa VAT', vnd(totals.sub), ''], [`VAT ${Math.round(totals.vatRate * 100)}%`, vnd(totals.vat), ''],
              ['Tổng tiền', vnd(totals.total), ''], ['Cần kiểm tra (công tơ)', `${totals.bad} / ${totals.n}`, totals.bad ? 'text-[#c4121f]' : 'text-green-700'],
            ].map(([l, v, c]) => (
              <div key={l} className="min-w-0 rounded-lg border border-navy-200 border-l-[3px] border-l-[#e11d2e] bg-white px-2.5 py-1"><div className="truncate text-[11px] leading-tight text-ink-mute">{l}</div><div className={`truncate text-[14px] font-extrabold leading-tight tabular-nums text-navy-900 ${c}`}>{v}</div></div>
            ))}
          </div>

          <div className="overflow-hidden rounded-xl border border-navy-200 bg-white lg:flex lg:min-h-0 lg:flex-1 lg:flex-col">
            {!loaded && <p className="p-6 text-center text-sm text-ink-mute">Đang tải…</p>}
            {loaded && !invoices.length && <p className="p-6 text-center text-sm text-ink-mute">Chọn một kỳ để xem công tơ.</p>}
            {invoices.length > 0 && (
              <div className="min-h-0 flex-1 overflow-auto">
                <table className="w-full min-w-[620px] border-collapse text-[13px] max-lg:hidden">
                  <thead className="sticky top-0 z-10 bg-navy-100 text-[11.5px] font-extrabold uppercase tracking-wide text-ink-soft">
                    <tr><th className="px-2 py-2 text-left">Công tơ</th><th className="px-2 py-2 text-right">Chỉ số cũ</th><th className="w-32 px-2 py-2 text-right">Chỉ số mới</th><th className="px-2 py-2 text-right">Số kWh</th><th className="px-2 py-2 text-right">Đơn giá</th><th className="px-2 py-2 text-right">Thành tiền</th><th className="px-2 py-2 text-left">Kiểm tra</th></tr>
                  </thead>
                  <tbody>
                    {invoices.map((inv) => (
                      <GroupRows key={inv.id} inv={inv} active={inv.id === sel} onSelect={() => setSel(inv.id)} locked={locked} perms={perms}
                        onAdd={() => open({ kind: 'meter', nhom: inv.id }, { nhom: inv.id, ma: '', ten: '', tang: '', cu: '' })}
                        edits={edits} setEdit={setEdit} check={check} remove={removeMeter} inputs={inputs} />
                    ))}
                  </tbody>
                </table>
                {/* phone: invoice cards */}
                <div className="space-y-2.5 p-2.5 lg:hidden">
                  {invoices.map((inv) => (
                    <article key={inv.id} onClick={() => setSel(inv.id)} className={`overflow-hidden rounded-xl border ${inv.id === sel ? 'border-[#e11d2e]' : 'border-navy-200'}`}>
                      <div className="flex items-center gap-2 bg-navy-50 px-3 py-2"><div className="min-w-0 flex-1"><div className="truncate text-[13.5px] font-extrabold text-navy-900">{inv.name}</div><div className="text-[12px] text-ink-mute">{inv.khach} · {inv.lines.length} công tơ · gồm VAT {Math.round(inv.vatRate * 100)}%</div></div><div className="text-[14px] font-extrabold tabular-nums">{vnd(inv.total)}</div></div>
                      {inv.lines.map(({ r, c }) => { const k = check(r); return (
                        <div key={r.id} className="border-t border-navy-100 px-3 py-2">
                          <div className="flex items-center gap-2"><span className="flex-1 text-[13.5px] font-semibold">{[r.tang, r.ten_cong_to].filter(Boolean).join(' · ')}</span><span className="font-mono text-[11.5px] text-ink-mute">{r.ma_cong_to}</span></div>
                          <div className="mt-1.5 grid grid-cols-[1fr_1.3fr] items-end gap-2.5">
                            <div><div className="text-[11.5px] text-ink-mute">Chỉ số cũ</div><div className="flex h-11 items-center text-[15px] font-semibold tabular-nums">{c.old == null ? '—' : num3(c.old)}</div></div>
                            <div><div className="text-[11.5px] text-ink-mute">Chỉ số mới</div>
                              {locked ? <div className="flex h-11 items-center justify-end text-[15px] font-bold tabular-nums">{c.now == null ? '—' : num3(c.now)}</div>
                                : <input aria-label={`Chỉ số mới ${r.ma_cong_to}`} inputMode="decimal" placeholder="Nhập…" value={edits[r.id] ?? (r.chi_so_moi ?? '')} onChange={(e) => setEdit(r, e.target.value)} className="h-11 w-full rounded-[10px] border-[1.5px] border-navy-200 px-3 text-right text-[17px] font-bold text-navy-900 focus:border-blue-500 focus:outline-none" />}</div>
                          </div>
                          <div className="mt-1.5 flex items-center gap-2 text-[12.5px]"><span className={`rounded-full px-2 py-0.5 font-bold ${k.cls}`}>{k.text}</span><span className="text-ink-mute">{c.now == null ? '' : `${num3(c.kwh)} kWh · ${vnd(c.amount)} đ`}</span>
                            {!locked && perms.delete && <button onClick={(e) => { e.stopPropagation(); removeMeter(r) }} aria-label={`Xóa ${r.ma_cong_to}`} className="ml-auto grid h-8 w-8 place-items-center rounded-full border border-navy-200 text-ink-mute"><X className="h-3.5 w-3.5" /></button>}</div>
                        </div>
                      ) })}
                    </article>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="lg:hidden">{cur && <div className="rounded-xl border border-navy-200 bg-white p-4">{panel}</div>}</div>
        </section>

        {/* selected invoice panel (desktop) */}
        <aside className="hidden overflow-y-auto rounded-xl border border-navy-200 bg-white p-4 lg:block lg:min-h-0">{panel}</aside>
      </div>

      <footer className="flex shrink-0 flex-wrap items-center gap-x-3 gap-y-0.5 border-t border-navy-200 bg-white px-4 py-2 text-[12.5px] text-ink-soft lg:px-5">
        <span className="font-bold text-green-700">● Đã đồng bộ</span>
        {period && <span><b className="text-navy-900">{kyText(ky)}</b> · {invoices.length} hoá đơn · {totals.n} công tơ · Đơn giá {price != null ? vnd(Number(price)) : '—'} đ/kWh · Tổng <b className="text-navy-900">{vnd(totals.total)} đ</b></span>}
        {syncAt && <span className="ml-auto">Đã đồng bộ lúc {syncAt.toLocaleTimeString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh', hour: '2-digit', minute: '2-digit', hour12: false })}</span>}
      </footer>

      {modal?.kind === 'ky' && (
        <Modal title="Tạo kỳ mới" onClose={() => setModal(null)}>
          <p className="mb-3 text-[13px] text-ink-soft">Sao chép toàn bộ công tơ từ kỳ trước; chỉ số cũ = chỉ số mới của kỳ trước.</p>
          <Field label="Kỳ mới (YYYY-MM)"><input className="input" value={form.ky ?? ''} onChange={(e) => setForm({ ...form, ky: e.target.value })} placeholder="2026-12" /></Field>
          <Field label="Đơn giá (để trống = giữ như kỳ trước)"><input className="input" inputMode="decimal" value={form.don_gia ?? ''} onChange={(e) => setForm({ ...form, don_gia: e.target.value })} /></Field>
          <button className="btn-primary w-full" disabled={busy} onClick={submitModal}>Tạo kỳ</button>
        </Modal>
      )}
      {modal?.kind === 'meter' && (
        <Modal title="Thêm công tơ" onClose={() => setModal(null)}>
          <Field label="Hoá đơn"><select className="input" value={form.nhom ?? ''} onChange={(e) => setForm({ ...form, nhom: e.target.value })}>{invoices.map((i) => <option key={i.id} value={i.id}>{i.name} ({i.id})</option>)}</select></Field>
          <Field label="Mã công tơ"><input className="input" value={form.ma ?? ''} onChange={(e) => setForm({ ...form, ma: e.target.value })} placeholder="CT02-04" /></Field>
          <Field label="Tên công tơ"><input className="input" value={form.ten ?? ''} onChange={(e) => setForm({ ...form, ten: e.target.value })} /></Field>
          <Field label="Tầng"><input className="input" value={form.tang ?? ''} onChange={(e) => setForm({ ...form, tang: e.target.value })} placeholder="Tầng 2" /></Field>
          <Field label="Chỉ số cũ"><input className="input" inputMode="decimal" value={form.cu ?? ''} onChange={(e) => setForm({ ...form, cu: e.target.value })} /></Field>
          <button className="btn-primary w-full" disabled={busy} onClick={submitModal}>Thêm công tơ</button>
        </Modal>
      )}
      {modal?.kind === 'customer' && (
        <Modal title="Thêm khách" onClose={() => setModal(null)}>
          <Field label="Khách thuê"><select className="input" value={form.khach ?? ''} onChange={(e) => setForm({ ...form, khach: e.target.value })}><option value="">— chọn —</option>{customers.map((c) => <option key={c.id} value={c.id}>{c.ten_khach_thue}</option>)}</select></Field>
          <Field label="Mã công tơ đầu tiên (để trống = hệ thống tự tạo)"><input className="input" value={form.ma ?? ''} onChange={(e) => setForm({ ...form, ma: e.target.value })} placeholder="Tự tạo theo tầng, ví dụ CT10-01" /></Field>
          <Field label="Tên công tơ"><input className="input" value={form.ten ?? ''} onChange={(e) => setForm({ ...form, ten: e.target.value })} /></Field>
          <Field label="Tầng"><input className="input" value={form.tang ?? ''} onChange={(e) => setForm({ ...form, tang: e.target.value })} /></Field>
          <Field label="Chỉ số cũ"><input className="input" inputMode="decimal" value={form.cu ?? ''} onChange={(e) => setForm({ ...form, cu: e.target.value })} /></Field>
          <button className="btn-primary w-full" disabled={busy} onClick={submitModal}>Thêm khách</button>
        </Modal>
      )}
      {modal?.kind === 'price' && (
        <Modal title={`Giá điện · ${kyText(ky)}`} onClose={() => setModal(null)}>
          <p className="mb-2 text-[13px] text-ink-soft">Giá hiện tại: <b className="text-navy-900">{price != null ? vnd(Number(price)) : '—'} đ/kWh</b>. Tiền điện của các công tơ được tính lại ngay theo giá mới. Mọi lần đổi giá đều được ghi vào Lịch sử.</p>
          <Field label="Giá mới (đ/kWh, chưa VAT)"><input className="input" inputMode="decimal" autoFocus value={form.gia ?? ''} onChange={(e) => setForm({ ...form, gia: e.target.value })} placeholder="3909" /></Field>
          <Field label="Áp dụng cho"><select className="input" value={form.pham_vi ?? 'ky'} onChange={(e) => setForm({ ...form, pham_vi: e.target.value })}><option value="ky">Tất cả công tơ của kỳ này</option>{cur && <option value="hd">Chỉ hóa đơn đang chọn: {cur.name}</option>}</select></Field>
          <Field label="Lý do / ghi chú (không bắt buộc)"><input className="input" value={form.ly_do ?? ''} onChange={(e) => setForm({ ...form, ly_do: e.target.value })} placeholder="Ví dụ: EVN điều chỉnh giá từ 01/11" /></Field>
          <button className="btn-primary w-full" disabled={busy || !form.gia} onClick={submitModal}>Lưu giá điện</button>
        </Modal>
      )}
      {modal?.kind === 'history' && (
        <Modal title="Lịch sử thao tác tiền điện" onClose={() => setModal(null)}>
          {!hist && <p className="py-6 text-center text-sm text-ink-mute">Đang tải…</p>}
          {hist && !hist.length && <p className="py-6 text-center text-sm text-ink-mute">Chưa có thao tác nào.</p>}
          <ul className="divide-y divide-navy-100">
            {hist?.map((h, i) => (
              <li key={i} className="py-2 text-[13px]"><div className="flex gap-2"><b className="flex-1 text-navy-900">{ACTION_LABEL[h.action] ?? h.action}</b><span className="text-ink-mute">{new Date(h.created_at).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh', hour12: false, day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}</span></div>
                <div className="text-ink-soft">{h.user_email}{h.changes?.ky ? ` · kỳ ${h.changes.ky}` : ''}{h.changes?.count ? ` · ${h.changes.count} chỉ số` : ''}{h.changes?.ma_cong_to ? ` · ${h.changes.ma_cong_to}` : ''}{h.action === 'set_price' ? ` · ${h.changes?.tu} → ${new Intl.NumberFormat('vi-VN').format(Number(h.changes?.den))} đ/kWh · ${h.changes?.pham_vi}${h.changes?.ly_do ? ` · ${h.changes.ly_do}` : ''}` : ''}</div></li>
            ))}
          </ul>
        </Modal>
      )}
    </div>
  )
}

const ACTION_LABEL: Record<string, string> = {
  create_period: 'Tạo kỳ mới', lock_period: 'Chốt kỳ', reopen_period: 'Mở lại kỳ', save_readings: 'Lưu chỉ số', add_meter: 'Thêm công tơ',
  add_customer: 'Thêm khách', remove_meter: 'Xóa công tơ', set_price: 'Đổi giá điện', create: 'Thêm', update: 'Sửa', delete: 'Xóa',
}

function GroupRows({ inv, active, onSelect, locked, perms, onAdd, edits, setEdit, check, remove, inputs }: {
  inv: { id: string; name: string; khach: string; lines: { r: Row; c: { now: number | null; old: number | null; price: number; kwh: number; amount: number } }[]; total: number; vatRate: number }
  active: boolean; onSelect: () => void; locked: boolean; perms: Perms; onAdd: () => void; edits: Record<string, string>
  setEdit: (r: Row, v: string) => void; check: (r: Row) => Check; remove: (r: Row) => void; inputs: React.MutableRefObject<Record<string, HTMLInputElement | null>>
}) {
  const focusNext = (i: number) => { const nx = inv.lines[i + 1]?.r.id; if (nx) inputs.current[nx]?.focus() }
  return (
    <>
      <tr onClick={onSelect} className={`cursor-pointer border-y border-navy-200 ${active ? 'bg-brand-50' : 'bg-navy-50'}`}>
        <td colSpan={5} className="px-2 py-2"><span className="font-extrabold text-navy-900">{inv.name}</span> <span className="text-[12px] text-ink-mute">· {inv.khach} · {inv.lines.length} công tơ</span>
          {!locked && perms.create && <button onClick={(e) => { e.stopPropagation(); onAdd() }} className="ml-2 rounded-full border border-amber-400 px-2.5 py-0.5 text-[12px] font-bold text-amber-700 hover:bg-amber-50">+ Công tơ</button>}</td>
        <td className="px-2 py-2 text-right font-extrabold tabular-nums">{vnd(inv.total)}</td>
        <td className="px-2 py-2 text-[12px] text-ink-mute">gồm VAT {Math.round(inv.vatRate * 100)}%</td>
      </tr>
      {inv.lines.map(({ r, c }, i) => { const k = check(r); return (
        <tr key={r.id} onClick={onSelect} className="border-b border-navy-100 hover:bg-navy-50/60">
          <td className="px-2 py-2"><span className="font-semibold">{[r.tang, r.ten_cong_to].filter(Boolean).join(' · ')}</span> <span className="font-mono text-[11.5px] text-ink-mute">{r.ma_cong_to}</span></td>
          <td className="px-2 py-2 text-right tabular-nums">{c.old == null ? '—' : num3(c.old)}</td>
          <td className="px-2 py-1.5 text-right">
            {locked ? <span className="tabular-nums">{c.now == null ? '—' : num3(c.now)}</span> : (
              <input ref={(el) => { inputs.current[r.id] = el }} aria-label={`Chỉ số mới ${r.ma_cong_to}`} inputMode="decimal" placeholder="Nhập…" value={edits[r.id] ?? (r.chi_so_moi ?? '')} disabled={!perms.edit}
                onChange={(e) => setEdit(r, e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); focusNext(i) } }}
                className={`h-9 w-full rounded-lg border px-2.5 text-right font-semibold tabular-nums text-navy-900 focus:border-blue-500 focus:outline-none ${edits[r.id] !== undefined ? 'border-blue-400 bg-blue-50' : 'border-navy-200 bg-white'}`} />
            )}
          </td>
          <td className="px-2 py-2 text-right tabular-nums">{c.now == null ? '–' : num3(c.kwh)}</td>
          <td className="px-2 py-2 text-right tabular-nums">{vnd(c.price)}</td>
          <td className="px-2 py-2 text-right tabular-nums">{c.now == null ? '–' : vnd(c.amount)}</td>
          <td className="px-2 py-2"><span className="inline-flex items-center gap-1.5"><span className={`rounded-full px-2 py-0.5 text-[11.5px] font-bold ${k.cls}`}>{k.text}</span>
            {!locked && perms.delete && <button onClick={(e) => { e.stopPropagation(); remove(r) }} aria-label={`Xóa công tơ ${r.ma_cong_to}`} title="Xóa công tơ khỏi kỳ" className="grid h-6 w-6 place-items-center rounded-full border border-navy-200 text-ink-mute hover:bg-red-50 hover:text-red-600"><X className="h-3 w-3" /></button>}</span></td>
        </tr>
      ) })}
    </>
  )
}
