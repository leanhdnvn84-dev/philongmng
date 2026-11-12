'use client'
import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'

/** "Lịch tổng": one month grid with every dated thing in the system (work deadlines, maintenance due, booked visitors, leases ending). */
type Ev = { date: string; kind: 'viec' | 'bao_tri' | 'khach' | 'hop_dong'; title: string; sub: string; href: string; done?: boolean; late?: boolean }
const KIND: Record<Ev['kind'], { label: string; chip: string; dot: string }> = {
  viec: { label: 'Hạn công việc', chip: 'bg-blue-50 text-blue-800 border-blue-200', dot: 'bg-blue-500' },
  bao_tri: { label: 'Bảo trì đến hạn', chip: 'bg-amber-50 text-amber-900 border-amber-200', dot: 'bg-amber-500' },
  khach: { label: 'Khách hẹn', chip: 'bg-emerald-50 text-emerald-800 border-emerald-200', dot: 'bg-emerald-500' },
  hop_dong: { label: 'Hết hạn thuê', chip: 'bg-rose-50 text-rose-800 border-rose-200', dot: 'bg-rose-500' },
}
const todayVn = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Ho_Chi_Minh' }).format(new Date())
const iso = (y: number, m: number, d: number) => `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`
const DOW = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN']

export default function MasterCalendar() {
  const today = todayVn()
  const [ym, setYm] = useState(() => ({ y: Number(today.slice(0, 4)), m: Number(today.slice(5, 7)) }))
  const [events, setEvents] = useState<Ev[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [day, setDay] = useState(today)
  const [show, setShow] = useState<Record<Ev['kind'], boolean>>({ viec: true, bao_tri: true, khach: true, hop_dong: true })

  useEffect(() => {
    let dead = false; setLoading(true); setError('')
    fetch(`/api/lich?thang=${ym.y}-${String(ym.m).padStart(2, '0')}`).then((r) => r.json()).then((j) => {
      if (dead) return
      if (!j?.success) setError(j?.error || 'Không tải được lịch'); else { setEvents(j.data); if (j.errors?.length) setError('Một phần dữ liệu chưa tải được: ' + j.errors[0]) }
    }).catch(() => !dead && setError('Mất kết nối, bấm chuyển tháng để thử lại')).finally(() => !dead && setLoading(false))
    return () => { dead = true }
  }, [ym])

  const byDay = useMemo(() => {
    const m = new Map<string, Ev[]>()
    for (const e of events) if (show[e.kind]) { if (!m.has(e.date)) m.set(e.date, []); m.get(e.date)!.push(e) }
    return m
  }, [events, show])
  const cells = useMemo(() => {
    const first = new Date(Date.UTC(ym.y, ym.m - 1, 1)), lead = (first.getUTCDay() + 6) % 7, dim = new Date(Date.UTC(ym.y, ym.m, 0)).getUTCDate()
    const out: (string | null)[] = Array(lead).fill(null)
    for (let d = 1; d <= dim; d++) out.push(iso(ym.y, ym.m, d))
    while (out.length % 7) out.push(null)
    return out
  }, [ym])
  const move = (n: number) => setYm(({ y, m }) => { const d = new Date(Date.UTC(y, m - 1 + n, 1)); return { y: d.getUTCFullYear(), m: d.getUTCMonth() + 1 } })
  const counts = useMemo(() => { const c = { viec: 0, bao_tri: 0, khach: 0, hop_dong: 0 }; for (const e of events) c[e.kind]++; return c }, [events])
  const list = byDay.get(day) ?? []
  const dayLabel = `${day.slice(8, 10)}/${day.slice(5, 7)}/${day.slice(0, 4)}`

  return (
    <div className="flex flex-1 flex-col lg:min-h-0">
      <div className="flex shrink-0 flex-wrap items-baseline gap-x-5 gap-y-1 border-b border-navy-200 bg-white px-4 py-2 lg:px-5">
        <span className="text-[12.5px] text-ink-mute">PHI LONG / <b className="text-navy-800">Lịch tổng</b></span>
        <h1 className="text-[22px] font-black text-navy-900">Lịch tổng</h1>
      </div>
      <div className="grid flex-1 grid-cols-1 gap-4 px-4 py-3 lg:min-h-0 lg:grid-cols-[minmax(0,1fr)_360px] lg:px-5">
        <section className="card flex flex-col overflow-hidden lg:min-h-0">
          <div className="flex shrink-0 flex-wrap items-center gap-2 border-b border-navy-100 px-3 py-2.5">
            <button className="btn-secondary h-9 w-9 !px-0" aria-label="Tháng trước" onClick={() => move(-1)}><ChevronLeft className="h-4 w-4" /></button>
            <div className="min-w-[132px] text-center text-[16px] font-black text-navy-900">Tháng {ym.m} / {ym.y}</div>
            <button className="btn-secondary h-9 w-9 !px-0" aria-label="Tháng sau" onClick={() => move(1)}><ChevronRight className="h-4 w-4" /></button>
            <button className="btn-secondary h-9 text-[13px]" onClick={() => { setYm({ y: Number(today.slice(0, 4)), m: Number(today.slice(5, 7)) }); setDay(today) }}>Hôm nay</button>
            {loading && <Loader2 className="h-4 w-4 animate-spin text-ink-mute" />}
            <div className="ml-auto flex flex-wrap gap-1.5">
              {(Object.keys(KIND) as Ev['kind'][]).map((k) => (
                <button key={k} type="button" aria-pressed={show[k]} onClick={() => setShow((s) => ({ ...s, [k]: !s[k] }))}
                  className={`inline-flex h-8 items-center gap-1.5 rounded-full border px-2.5 text-[12px] font-bold ${show[k] ? KIND[k].chip : 'border-navy-200 bg-white text-navy-300 line-through'}`}>
                  <span className={`h-2 w-2 rounded-full ${show[k] ? KIND[k].dot : 'bg-navy-200'}`} />{KIND[k].label} <span className="tabular-nums">{counts[k]}</span>
                </button>
              ))}
            </div>
          </div>
          {error && <p role="alert" className="shrink-0 border-b border-red-200 bg-red-50 px-3 py-2 text-[13px] font-semibold text-red-800">{error}</p>}
          <div className="grid shrink-0 grid-cols-7 border-b border-navy-200 bg-navy-50 text-center text-[12px] font-extrabold text-navy-800">
            {DOW.map((d, i) => <div key={d} className={`py-1.5 ${i === 6 ? 'text-[#c4121f]' : ''}`}>{d}</div>)}
          </div>
          <div className="grid flex-1 grid-cols-7 lg:min-h-0 lg:overflow-y-auto" style={{ gridAutoRows: 'minmax(84px, 1fr)' }}>
            {cells.map((d, i) => {
              if (!d) return <div key={i} className="border-b border-r border-navy-100 bg-navy-50/50" />
              const ev = byDay.get(d) ?? [], on = d === day, isToday = d === today
              return (
                <button key={d} type="button" onClick={() => setDay(d)} aria-pressed={on} aria-label={`Ngày ${d.slice(8, 10)}/${d.slice(5, 7)}, ${ev.length} mục`}
                  className={`flex min-w-0 flex-col gap-0.5 border-b border-r border-navy-100 p-1 text-left align-top transition-colors ${on ? 'bg-select ring-2 ring-inset ring-[#2189e6]' : 'bg-white hover:bg-navy-50'}`}>
                  <span className={`inline-grid h-6 min-w-6 place-items-center self-start rounded-full px-1 text-[12.5px] font-extrabold tabular-nums ${isToday ? 'bg-[#d91828] text-white' : i % 7 === 6 ? 'text-[#c4121f]' : 'text-navy-900'}`}>{Number(d.slice(8, 10))}</span>
                  {/* desktop: up to three titles; phone: just coloured dots */}
                  <span className="hidden min-w-0 flex-col gap-0.5 lg:flex">
                    {ev.slice(0, 3).map((e, k) => <span key={k} className={`truncate rounded border px-1 text-[11px] font-semibold leading-[17px] ${KIND[e.kind].chip} ${e.done ? 'opacity-50 line-through' : ''} ${e.late ? '!border-red-400' : ''}`}>{e.title}</span>)}
                    {ev.length > 3 && <span className="px-1 text-[11px] font-bold text-ink-mute">+{ev.length - 3} mục nữa</span>}
                  </span>
                  <span className="flex flex-wrap gap-0.5 lg:hidden">
                    {ev.slice(0, 6).map((e, k) => <span key={k} className={`h-1.5 w-1.5 rounded-full ${KIND[e.kind].dot}`} />)}
                    {ev.length > 6 && <span className="text-[9px] font-bold leading-none text-ink-mute">+{ev.length - 6}</span>}
                  </span>
                </button>
              )
            })}
          </div>
        </section>

        <aside className="card flex flex-col overflow-hidden lg:min-h-0">
          <h2 className="shrink-0 border-b border-navy-100 px-4 py-3 text-[15px] font-extrabold text-navy-900">Ngày {dayLabel} <span className="ml-1 text-[12.5px] font-semibold text-ink-mute">{list.length} mục</span></h2>
          <div className="lg:min-h-0 lg:flex-1 lg:overflow-y-auto">
            {!list.length && <p className="px-4 py-10 text-center text-[13.5px] text-ink-mute">Không có gì trong ngày này.</p>}
            {list.map((e, i) => (
              <Link key={i} href={e.href} className="block border-b border-navy-100 px-4 py-3 last:border-0 hover:bg-navy-50">
                <span className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11.5px] font-bold ${KIND[e.kind].chip}`}><span className={`h-1.5 w-1.5 rounded-full ${KIND[e.kind].dot}`} />{KIND[e.kind].label}{e.late ? ' · trễ' : e.done ? ' · đã xong' : ''}</span>
                <div className={`mt-1 text-[14px] font-bold leading-snug text-navy-900 ${e.done ? 'line-through opacity-60' : ''}`}>{e.title}</div>
                <div className="mt-0.5 text-[12.5px] text-ink-soft">{e.sub}</div>
              </Link>
            ))}
          </div>
        </aside>
      </div>
    </div>
  )
}
