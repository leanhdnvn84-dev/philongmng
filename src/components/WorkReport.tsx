'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { X } from 'lucide-react'
import { formatDate } from '@/lib/resources'

interface Work {
  id: string; noi_dung: string | null; ngay_giao: string | null; deadline: string | null; ngay_hoan_thanh: string | null
  trang_thai: string | null; canh_bao?: string; id_nguoi_thuc_hien: string | null; nguoi_lam_cung: string | null; tien_do?: string | null
}
interface Daily {
  id: string; noi_dung: string | null; ngay: string | null; trang_thai: string | null
  id_nguoi_thuc_hien: string | null; nguoi_lam_cung: string | null
}

const SOON = 3
const fold = (v: unknown) => String(v ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toUpperCase().trim()
const toDate = (k: string) => { const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(k); return m ? new Date(+m[1], +m[2] - 1, +m[3]) : null }
const diff = (a: string, b: string) => { const x = toDate(a), y = toDate(b); return x && y ? Math.round((y.getTime() - x.getTime()) / 864e5) : null }
const ymd = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
const addDays = (k: string, n: number) => { const d = toDate(k)!; d.setDate(d.getDate() + n); return ymd(d) }
const todayVn = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Ho_Chi_Minh' }).format(new Date())
const show = (k: string | null) => (k ? formatDate(k) : '—')
const pct = (a: number, b: number) => (b ? Math.round((a / b) * 100) : 0)

type Period = 'week' | 'month' | 'lastMonth' | 'quarter' | 'year' | 'custom'
function range(period: Period, from: string, to: string) {
  const t = todayVn(), d = toDate(t)!
  if (period === 'week') { const w = (d.getDay() + 6) % 7, f = addDays(t, -w); return { from: f, to: addDays(f, 6) } }
  if (period === 'month') return { from: t.slice(0, 8) + '01', to: ymd(new Date(d.getFullYear(), d.getMonth() + 1, 0)) }
  if (period === 'lastMonth') return { from: ymd(new Date(d.getFullYear(), d.getMonth() - 1, 1)), to: ymd(new Date(d.getFullYear(), d.getMonth(), 0)) }
  if (period === 'quarter') { const q = Math.floor(d.getMonth() / 3) * 3; return { from: ymd(new Date(d.getFullYear(), q, 1)), to: ymd(new Date(d.getFullYear(), q + 3, 0)) } }
  if (period === 'year') return { from: t.slice(0, 4) + '-01-01', to: t.slice(0, 4) + '-12-31' }
  return { from: from || t.slice(0, 8) + '01', to: to || t }
}

export default function WorkReport() {
  const [works, setWorks] = useState<Work[]>([])
  const [dailies, setDailies] = useState<Daily[]>([])
  const [staff, setStaff] = useState<Record<string, string>>({})
  const [period, setPeriod] = useState<Period>('month')
  const [cFrom, setCFrom] = useState('')
  const [cTo, setCTo] = useState('')
  const [source, setSource] = useState<'all' | 'work' | 'daily'>('all')
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(true)
  const [pop, setPop] = useState<string | null>(null)

  const { from, to } = useMemo(() => range(period, cFrom, cTo), [period, cFrom, cTo])

  const loadStatic = useCallback(async () => {
    try {
      const [w, n] = await Promise.all([fetch('/api/cong_viec?pageSize=2000').then((r) => r.json()), fetch('/api/nhan_vien?pageSize=500').then((r) => r.json())])
      if (!w.success) throw new Error(w.error)
      setWorks(w.data)
      setStaff(Object.fromEntries((n.data ?? []).map((x: any) => [x.id, x.ho_ten])))
    } catch (e: any) { setErr(e.message || 'Không tải được dữ liệu') }
  }, [])
  useEffect(() => { loadStatic() }, [loadStatic])

  // daily jobs are many (1,000+): only fetch the selected period
  useEffect(() => {
    if (source === 'work') { setDailies([]); setLoading(false); return }
    let dead = false
    setLoading(true)
    fetch(`/api/cong_viec_hang_ngay?pageSize=2000&from=${from}&to=${to}&dateField=ngay`).then((r) => r.json()).then((j) => {
      if (dead) return
      if (!j.success) throw new Error(j.error)
      setDailies(j.data)
    }).catch((e) => !dead && setErr(e.message || 'Không tải được việc hằng ngày')).finally(() => !dead && setLoading(false))
    return () => { dead = true }
  }, [from, to, source])

  const model = useMemo(() => {
    const t = todayVn(), inR = (k: string | null) => !!k && k >= from && k <= to
    const byId = new Map(Object.entries(staff).map(([id, n]) => [fold(id), n]))
    const byName = new Map(Object.values(staff).map((n) => [fold(n), n]))
    const person = (r: { id_nguoi_thuc_hien: string | null }) => (r.id_nguoi_thuc_hien && staff[r.id_nguoi_thuc_hien]) || (r.id_nguoi_thuc_hien ?? '') || '(Chưa giao)'
    const members = (r: { id_nguoi_thuc_hien: string | null; nguoi_lam_cung: string | null }) => {
      const main = person(r), out = [{ p: main, co: false }], seen = new Set([fold(main)])
      const add = (tok: string) => { const v = tok.trim(); if (!v) return; const name = byId.get(fold(v)) ?? byName.get(fold(v)) ?? v, k = fold(name); if (!seen.has(k)) { seen.add(k); out.push({ p: name, co: true }) } }
      String(r.nguoi_lam_cung ?? '').split(/[,;+/|\n]+/).forEach((tok) => {
        tok = tok.trim(); if (!tok) return
        const parts = tok.split(/\s+/)
        if (!byId.get(fold(tok)) && !byName.get(fold(tok)) && parts.length > 1 && parts.every((x) => byId.get(fold(x)))) parts.forEach(add); else add(tok)
      })
      return out
    }
    const info = (r: Work) => {
      const giao = r.ngay_giao, han = r.deadline, xong = r.ngay_hoan_thanh, done = r.canh_bao === 'HOÀN THÀNH' || fold(r.trang_thai) === 'HOAN THANH'
      const left = han && !done ? diff(t, han) : null
      const late = done ? !!(han && xong && (diff(han, xong) ?? 0) > 0) : left !== null && left < 0
      return { giao, han, xong, done, late, left }
    }
    const W = source === 'daily' ? [] : works.map((r) => ({ r, i: info(r) })).filter((x) => inR(x.i.giao) || inR(x.i.xong))
    const D = source === 'work' ? [] : dailies.map((r) => ({ r, k: r.ngay, done: fold(r.trang_thai) === 'HOAN THANH' })).filter((x) => inR(x.k))
    const wAssigned = W.filter((x) => inR(x.i.giao)), wDone = W.filter((x) => x.i.done && inR(x.i.xong))
    const wLate = wDone.filter((x) => x.i.late), wOpen = wAssigned.filter((x) => !x.i.done), dDone = D.filter((x) => x.done)
    const days = wDone.map((x) => diff(x.i.giao!, x.i.xong!)).filter((n): n is number => n !== null && n >= 0)
    const avg = days.length ? (days.reduce((s, n) => s + n, 0) / days.length).toFixed(1) : '—'
    const total = wAssigned.length + D.length, doneAll = wDone.length + dDone.length

    type Row = { p: string; wa: number; wd: number; ok: number; late: number; open: number; dd: number; dn: number; co: number }
    const byP = new Map<string, Row>()
    const get = (p: string) => { let o = byP.get(p); if (!o) { o = { p, wa: 0, wd: 0, ok: 0, late: 0, open: 0, dd: 0, dn: 0, co: 0 }; byP.set(p, o) } return o }
    wAssigned.forEach((x) => members(x.r).forEach((m) => { const o = get(m.p); o.wa++; if (!x.i.done) o.open++; if (m.co) o.co++ }))
    wDone.forEach((x) => members(x.r).forEach((m) => { const o = get(m.p); o.wd++; if (x.i.late) o.late++; else o.ok++; if (m.co && !(inR(x.i.giao))) o.co++ }))
    D.forEach((x) => members(x.r).forEach((m) => { const o = get(m.p); if (x.done) o.dd++; else o.dn++; if (m.co) o.co++ }))
    const rows = Array.from(byP.values()).sort((a, b) => (b.wd + b.dd) - (a.wd + a.dd) || a.p.localeCompare(b.p, 'vi'))
    return { W, D, members, rows, kpi: { total, nW: wAssigned.length, nD: D.length, doneAll, ok: wDone.length - wLate.length, late: wLate.length, open: wOpen.length + (D.length - dDone.length), avg } }
  }, [works, dailies, staff, source, from, to])

  const k = model.kpi
  if (err) return <p className="p-4 text-red-600">{err}</p>
  const sel = 'input w-auto'

  return (
    <div className="flex flex-col flex-1 lg:min-h-0">
      <div className="shrink-0 flex flex-wrap items-baseline gap-x-5 gap-y-1 px-4 lg:px-5 py-2 bg-white border-b border-navy-200">
        <span className="text-[12.5px] text-ink-mute">PHI LONG / <b className="text-navy-800">Báo cáo công việc</b></span>
        <h1 className="text-[22px] font-black text-navy-900">Báo cáo công việc</h1>
      </div>
      <div className="flex flex-col gap-3 px-4 lg:px-5 py-3 lg:flex-1 lg:min-h-0">
        <div className="card shrink-0 flex flex-wrap items-center gap-3 px-4 py-2.5 print:hidden">
          <h2 className="text-[15px] font-black text-blue-700 mr-1">BÁO CÁO CÔNG VIỆC</h2>
          <select className={sel} value={period} onChange={(e) => setPeriod(e.target.value as Period)} aria-label="Kỳ báo cáo">
            <option value="week">Tuần này</option><option value="month">Tháng này</option><option value="lastMonth">Tháng trước</option>
            <option value="quarter">Quý này</option><option value="year">Năm nay</option><option value="custom">Tuỳ chọn</option>
          </select>
          <input type="date" className={sel} value={period === 'custom' ? cFrom || from : from} disabled={period !== 'custom'} onChange={(e) => setCFrom(e.target.value)} aria-label="Từ ngày" />
          <input type="date" className={sel} value={period === 'custom' ? cTo || to : to} disabled={period !== 'custom'} onChange={(e) => setCTo(e.target.value)} aria-label="Đến ngày" />
          <select className={sel} value={source} onChange={(e) => setSource(e.target.value as any)} aria-label="Nguồn">
            <option value="all">Công việc + Hằng ngày</option><option value="work">Chỉ Công việc</option><option value="daily">Chỉ Công việc hằng ngày</option>
          </select>
          <button className="btn-secondary ml-auto" onClick={() => window.print()}>In báo cáo</button>
        </div>

        <div className="shrink-0 grid grid-cols-2 gap-2 md:grid-cols-3 xl:grid-cols-6">
          <Kpi label="Tổng việc trong kỳ" value={k.total} tone="text-blue-700" note={`${k.nW} công việc · ${k.nD} hằng ngày`} />
          <Kpi label="Hoàn thành" value={k.doneAll} tone="text-green-700" note={k.total ? `${pct(k.doneAll, k.total)}%` : '—'} />
          <Kpi label="Đúng hạn" value={k.ok} tone="text-green-700" note="Công việc có hạn, xong trong kỳ" />
          <Kpi label="Trễ hạn" value={k.late} tone="text-red-600" />
          <Kpi label="Còn tồn" value={k.open} tone="text-amber-600" />
          <Kpi label="TB ngày hoàn thành" value={k.avg} tone="text-navy-900" note="từ ngày giao tới xong" />
        </div>

        <section className="card flex flex-col overflow-hidden lg:flex-1 lg:min-h-0">
          <div className="shrink-0 px-4 py-2.5 border-b text-[13px] font-black uppercase text-blue-700">
            Theo nhân viên · {show(from)} – {show(to)} <span className="font-normal normal-case text-ink-mute">· bấm vào nhân viên để xem thống kê</span>
          </div>
          <div className="overflow-auto max-h-[70vh] lg:max-h-none lg:flex-1 lg:min-h-0">
            {loading && !model.rows.length ? <p className="p-6 text-center text-ink-mute">Đang tải…</p> : model.rows.length === 0 ? <p className="p-6 text-center text-ink-mute">Không có công việc trong kỳ đã chọn.</p> : (<>
              <div className="space-y-2.5 p-3 lg:hidden">
                {model.rows.map((o) => {
                  const tot = o.wa + o.dd + o.dn, dn = o.wd + o.dd, p = tot ? Math.round(Math.min(dn, tot) / tot * 100) : 0
                  const stat = (l: string, v: number | string, c = '') => <div className="rounded-lg bg-canvas px-2 py-1.5 text-center"><div className={`text-[16px] font-extrabold tabular-nums ${c}`}>{v || 0}</div><div className="text-[10.5px] leading-tight text-ink-mute">{l}</div></div>
                  return (
                    <button key={o.p} type="button" onClick={() => setPop(o.p)} className="block w-full rounded-2xl border border-navy-200 bg-white p-3.5 text-left shadow-[0_1px_2px_rgba(16,24,40,.06)] active:bg-navy-50">
                      <div className="flex items-center gap-2"><span className="text-[15px] font-extrabold text-navy-900">{o.p}</span><span className="ml-auto text-[12px] font-bold text-blue-700">{tot ? `${p}%` : '—'}</span></div>
                      <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-gray-200"><div className={`h-full ${p >= 80 ? 'bg-green-600' : p >= 50 ? 'bg-blue-500' : 'bg-amber-500'}`} style={{ width: `${p}%` }} /></div>
                      <div className="mt-2.5 grid grid-cols-4 gap-1.5">
                        {stat('Được giao', o.wa)}{stat('Đã xong', o.wd, 'text-green-700')}{stat('Trễ hạn', o.late, o.late ? 'text-red-600' : '')}{stat('Còn tồn', o.open)}
                        {stat('Hằng ngày xong', o.dd)}{stat('Hằng ngày chưa', o.dn)}{stat('Làm cùng', o.co, 'text-blue-700')}{stat('Đúng hạn', o.ok, 'text-green-700')}
                      </div>
                    </button>
                  )
                })}
              </div>
              <table className="hidden w-full text-sm lg:table">
                <thead className="sticky top-0 z-10 bg-navy-50 text-[12.5px] font-bold text-navy-800">
                  <tr>
                    <th className="px-3 py-2 text-left">Nhân viên</th>
                    {['Công việc được giao', 'Công việc đã hoàn thành', 'Hoàn thành đúng hạn', 'Hoàn thành trễ hạn', 'Công việc còn tồn', 'Việc hằng ngày đã xong', 'Việc hằng ngày chưa xong', 'Số việc làm cùng'].map((h) => <th key={h} className="px-2 py-2 text-right align-bottom min-w-[96px] leading-tight">{h}</th>)}
                    <th className="px-3 py-2 text-left min-w-[120px]">% hoàn thành</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {model.rows.map((o) => {
                    const tot = o.wa + o.dd + o.dn, dn = o.wd + o.dd, p = tot ? Math.round(Math.min(dn, tot) / tot * 100) : 0
                    return (
                      <tr key={o.p} onClick={() => setPop(o.p)} className="cursor-pointer hover:bg-select" title={`Bấm để xem thống kê công việc của ${o.p}`}>
                        <td className="px-3 py-2 font-bold whitespace-nowrap">{o.p}</td>
                        <td className="px-2 py-2 text-right">{o.wa}</td><td className="px-2 py-2 text-right">{o.wd}</td>
                        <td className="px-2 py-2 text-right text-green-700">{o.ok}</td><td className="px-2 py-2 text-right text-red-600">{o.late || ''}</td>
                        <td className="px-2 py-2 text-right">{o.open || ''}</td><td className="px-2 py-2 text-right">{o.dd}</td>
                        <td className="px-2 py-2 text-right">{o.dn || ''}</td><td className="px-2 py-2 text-right text-blue-700">{o.co || ''}</td>
                        <td className="px-3 py-2">
                          <div className="h-2 rounded-full bg-gray-200 overflow-hidden"><div className={`h-full ${p >= 80 ? 'bg-green-600' : p >= 50 ? 'bg-blue-500' : 'bg-amber-500'}`} style={{ width: `${p}%` }} /></div>
                          <div className="text-[11px] text-ink-mute mt-0.5">{tot ? `${p}%` : '—'}</div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </>)}
          </div>
        </section>
      </div>
      {pop && <StaffPopup name={pop} model={model} from={from} to={to} onClose={() => setPop(null)} />}
    </div>
  )
}

function Kpi({ label, value, tone, note }: { label: string; value: number | string; tone: string; note?: string }) {
  return (
    <div className="rounded-[9px] border border-navy-200 bg-white px-4 py-2">
      <div className="text-[11.5px] font-bold uppercase text-ink-mute">{label}</div>
      <div className={`text-[26px] font-bold leading-tight ${tone}`}>{value}</div>
      {note && <div className="text-[11.5px] text-ink-mute">{note}</div>}
    </div>
  )
}

function StaffPopup({ name, model, from, to, onClose }: { name: string; model: any; from: string; to: string; onClose: () => void }) {
  useEffect(() => { const h = (e: KeyboardEvent) => e.key === 'Escape' && onClose(); window.addEventListener('keydown', h); return () => window.removeEventListener('keydown', h) }, [onClose])
  const inR = (k: string | null) => !!k && k >= from && k <= to
  const role = (r: any) => { const m = model.members(r).find((x: any) => x.p === name); return m ? (m.co ? 'Làm cùng' : 'Chính') : '' }
  const W = model.W.filter((x: any) => role(x.r)), D = model.D.filter((x: any) => role(x.r))
  const wa = W.filter((x: any) => inR(x.i.giao)), wd = W.filter((x: any) => x.i.done && inR(x.i.xong)), late = wd.filter((x: any) => x.i.late)
  const open = wa.filter((x: any) => !x.i.done), openLate = open.filter((x: any) => x.i.late), dd = D.filter((x: any) => x.done)
  const co = W.filter((x: any) => role(x.r) === 'Làm cùng').length + D.filter((x: any) => role(x.r) === 'Làm cùng').length
  const days = wd.map((x: any) => diff(x.i.giao, x.i.xong)).filter((n: any) => n !== null && n >= 0) as number[]
  const avg = days.length ? (days.reduce((a, b) => a + b, 0) / days.length).toFixed(1) : '—'
  const tot = wa.length + D.length, dn = wd.length + dd.length, p = tot ? Math.round(Math.min(dn, tot) / tot * 100) : 0
  const rank = (x: any) => (x.i.done ? 3 : x.i.late ? 0 : x.i.left !== null && x.i.left <= SOON ? 1 : 2)
  const tag = (x: any) => x.i.done ? (x.i.late ? <span className="pill-red">Xong trễ</span> : <span className="pill-green">Xong đúng hạn</span>)
    : x.i.late ? <span className="pill-red">Trễ {-x.i.left} ngày</span> : x.i.left !== null && x.i.left <= SOON ? <span className="pill-amber">Còn {x.i.left} ngày</span> : <span className="pill-blue">{x.r.trang_thai || '—'}</span>
  const sorted = W.slice().sort((a: any, b: any) => rank(a) - rank(b) || String(b.i.giao ?? '').localeCompare(String(a.i.giao ?? '')))
  const dSorted = D.slice().sort((a: any, b: any) => Number(a.done) - Number(b.done) || String(b.k).localeCompare(String(a.k)))

  const K = ({ l, v, c = '', n }: { l: string; v: string | number; c?: string; n?: string }) => (
    <div className="rounded-lg border border-navy-200 px-3 py-2"><div className={`text-[22px] font-bold leading-tight ${c}`}>{v}</div><div className="text-[11.5px] font-semibold text-ink-mute">{l}</div>{n && <div className="text-[11px] text-ink-mute">{n}</div>}</div>
  )
  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/45 p-3 print:hidden" onMouseDown={(e) => e.target === e.currentTarget && onClose()} role="dialog" aria-modal="true">
      <div className="flex max-h-[94vh] w-full max-w-5xl flex-col overflow-hidden rounded-xl bg-white shadow-pop">
        <header className="flex shrink-0 items-start justify-between bg-blue-700 px-5 py-3 text-white">
          <div><div className="text-xs">Thống kê công việc · {show(from)} – {show(to)}</div><h2 className="text-[19px] font-bold">{name}</h2></div>
          <button onClick={onClose} aria-label="Đóng"><X className="h-6 w-6" /></button>
        </header>
        <div className="grid shrink-0 grid-cols-2 gap-2 px-5 py-3 md:grid-cols-4 xl:grid-cols-7">
          <K l="Việc trong kỳ" v={tot} n={`${wa.length} công việc · ${D.length} hằng ngày`} />
          <K l="Đã hoàn thành" v={dn} c="text-green-700" n={`${p}%`} />
          <K l="Xong đúng hạn" v={wd.length - late.length} c="text-green-700" />
          <K l="Xong trễ hạn" v={late.length} c={late.length ? 'text-red-600' : ''} />
          <K l="Còn tồn" v={open.length + (D.length - dd.length)} c={open.length ? 'text-amber-600' : ''} n={openLate.length ? `${openLate.length} việc đang trễ` : ''} />
          <K l="Làm cùng" v={co} c="text-blue-700" />
          <K l="TB ngày hoàn thành" v={avg} n="từ ngày giao tới xong" />
        </div>
        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 pb-4">
          <h4 className="text-[13px] font-black uppercase text-blue-700">Công việc · {W.length}</h4>
          {W.length ? (
            <div className="overflow-x-auto"><table className="w-full text-sm">
              <thead className="bg-navy-50 text-[12.5px] font-bold"><tr><th className="px-2 py-1.5 text-left">Nội dung / tiến độ mới nhất</th><th className="px-2">Vai trò</th><th className="px-2">Ngày giao</th><th className="px-2">Hạn</th><th className="px-2">Ngày xong</th><th className="px-2">Kết quả</th></tr></thead>
              <tbody className="divide-y">{sorted.map((x: any) => (
                <tr key={x.r.id}><td className="px-2 py-1.5 min-w-[240px]">{x.r.noi_dung || '—'}{x.r.tien_do && <div className="text-[11.5px] text-ink-mute line-clamp-1">{String(x.r.tien_do).split('\n').pop()}</div>}</td>
                  <td className="px-2 text-center">{role(x.r)}</td><td className="px-2 text-center whitespace-nowrap">{show(x.i.giao)}</td><td className="px-2 text-center whitespace-nowrap">{show(x.i.han)}</td>
                  <td className="px-2 text-center whitespace-nowrap">{show(x.i.xong)}</td><td className="px-2 text-center">{tag(x)}</td></tr>
              ))}</tbody></table></div>
          ) : <p className="text-sm text-ink-mute">Không có công việc trong kỳ.</p>}
          {D.length > 0 && (<>
            <h4 className="text-[13px] font-black uppercase text-blue-700">Công việc hằng ngày · {D.length}</h4>
            <div className="overflow-x-auto"><table className="w-full text-sm">
              <thead className="bg-navy-50 text-[12.5px] font-bold"><tr><th className="px-2 py-1.5 text-left">Nội dung</th><th className="px-2">Vai trò</th><th className="px-2">Ngày</th><th className="px-2">Kết quả</th></tr></thead>
              <tbody className="divide-y">{dSorted.map((x: any) => (
                <tr key={x.r.id}><td className="px-2 py-1.5 min-w-[240px]">{x.r.noi_dung || '—'}</td><td className="px-2 text-center">{role(x.r)}</td>
                  <td className="px-2 text-center whitespace-nowrap">{show(x.k)}</td><td className="px-2 text-center">{x.done ? <span className="pill-green">Đã xong</span> : <span className="pill-amber">Chưa xong</span>}</td></tr>
              ))}</tbody></table></div>
          </>)}
        </div>
        <footer className="shrink-0 flex justify-end border-t px-5 py-3"><button className="btn-primary" onClick={onClose}>Đóng</button></footer>
      </div>
    </div>
  )
}
