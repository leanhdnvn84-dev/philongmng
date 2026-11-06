'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import {
  AlertTriangle, CalendarClock, ClipboardList, Users, Wrench, FileSignature, Building2, LayoutGrid, Cpu,
  ArrowUpRight, Plus, UserPlus, BarChart3, ListChecks, Inbox,
} from 'lucide-react'
import { formatDate, formatMoney } from '@/lib/resources'

type Tone = 'red' | 'amber' | 'blue' | 'green'
const BAR: Record<Tone, string> = { red: 'bg-red-500', amber: 'bg-amber-500', blue: 'bg-blue-500', green: 'bg-emerald-500' }
const ICON: Record<Tone, string> = { red: 'bg-red-50 text-red-600', amber: 'bg-amber-50 text-amber-600', blue: 'bg-blue-50 text-blue-600', green: 'bg-emerald-50 text-emerald-600' }

function Hero({ label, value, icon: Icon, tone, href, chips }: {
  label: string; value: React.ReactNode; icon: React.ComponentType<{ className?: string }>; tone: Tone; href: string
  chips: { text: string; hot?: boolean }[]
}) {
  return (
    <Link href={href} className="group relative block overflow-hidden rounded-2xl border border-navy-200 bg-white px-4 py-3 shadow-[0_1px_2px_rgba(16,24,40,.05)] transition hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(16,24,40,.12)]">
      <span className={`absolute inset-x-0 top-0 h-1 ${BAR[tone]}`} />
      <div className="flex items-center justify-between">
        <span className={`grid h-9 w-9 place-items-center rounded-xl ${ICON[tone]}`}><Icon className="h-[18px] w-[18px]" /></span>
        <ArrowUpRight className="h-4 w-4 text-navy-300 transition group-hover:text-brand-500" />
      </div>
      <div className="mt-2 text-[32px] font-black leading-none tabular-nums text-navy-900">{value}</div>
      <div className="mt-1 text-[13px] font-bold text-ink-soft">{label}</div>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {chips.map((c) => <span key={c.text} className={`rounded-md px-2 py-0.5 text-[11.5px] font-bold ${c.hot ? 'bg-red-50 text-red-600' : 'bg-navy-100 text-ink-soft'}`}>{c.text}</span>)}
      </div>
    </Link>
  )
}

const Row = ({ left, mid, right }: { left?: React.ReactNode; mid: React.ReactNode; right: React.ReactNode }) => (
  <li className="flex items-center gap-3 border-b border-navy-100 px-4 py-2.5 last:border-0">
    {left}<div className="min-w-0 flex-1">{mid}</div><div className="shrink-0 text-right">{right}</div>
  </li>
)

export default function Dashboard() {
  const [d, setD] = useState<any>(null)
  const [err, setErr] = useState('')
  const [tab, setTab] = useState('')
  useEffect(() => {
    fetch('/api/dashboard').then((r) => r.json()).then((j) => (j.success ? setD(j) : setErr(j.error))).catch(() => setErr('Không tải được dữ liệu'))
  }, [])

  const data = d?.data ?? {}
  const { cv, hn, krv, bt, dx, kho, tb, kt, tang } = data
  // the "needs attention" card shows one list at a time instead of five stacked panels
  const tabs = useMemo(() => [
    cv && { key: 'cv', label: 'Công việc', n: cv.list.length, href: '/cong_viec' },
    bt && { key: 'bt', label: 'Bảo trì', n: bt.list.length, href: '/lich_bao_tri' },
    kt && { key: 'kt', label: 'Hợp đồng thuê', n: kt.expiring.length, href: '/khach_thue' },
    kho && { key: 'kho', label: 'Vật tư', n: kho.low.length, href: '/vat_tu' },
  ].filter(Boolean) as { key: string; label: string; n: number; href: string }[], [cv, bt, kt, kho])
  const active = tabs.find((t) => t.key === tab) ?? tabs.find((t) => t.n > 0) ?? tabs[0]

  if (err) return <p className="px-5 py-4 text-red-600">{err}</p>
  if (!d) return (
    <div className="px-4 lg:px-5 py-4 space-y-4">
      <div className="h-10 w-72 rounded-xl bg-white animate-pulse" />
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">{[...Array(4)].map((_, i) => <div key={i} className="h-36 rounded-2xl bg-white animate-pulse" />)}</div>
      <div className="h-72 rounded-2xl bg-white animate-pulse" />
    </div>
  )

  const hour = Number(new Intl.DateTimeFormat('en-GB', { hour: 'numeric', timeZone: 'Asia/Ho_Chi_Minh' }).format(new Date()))
  const greet = hour < 11 ? 'Chào buổi sáng' : hour < 14 ? 'Chào buổi trưa' : hour < 18 ? 'Chào buổi chiều' : 'Chào buổi tối'
  const weekday = new Intl.DateTimeFormat('vi-VN', { weekday: 'long', timeZone: 'Asia/Ho_Chi_Minh' }).format(new Date())
  const urgent = (cv?.overdue ?? 0) + (bt?.late ?? 0)
  const dailyPct = hn?.total ? Math.round((hn.done / hn.total) * 100) : 0
  const tbColors = ['#13274a', '#ED3237', '#3b82f6', '#f59e0b', '#10b981', '#94a3b8']
  const tbEntries = tb ? Object.entries(tb.by as Record<string, number>).sort((a, b) => b[1] - a[1]) : []

  return (
    <div className="flex-1 lg:min-h-0 flex flex-col gap-4 px-4 lg:px-5 py-4 lg:overflow-y-auto">
      {/* greeting + alert + shortcuts */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
        <div className="min-w-[200px] flex-1">
          <h1 className="text-[22px] font-black leading-tight text-navy-900">{greet}</h1>
          <p className="text-[13px] text-ink-mute first-letter:uppercase">{weekday}, {formatDate(d.today)}</p>
        </div>
        {urgent > 0
          ? <span className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-3.5 py-1.5 text-[13px] font-bold text-red-600"><AlertTriangle className="h-4 w-4" />{urgent} việc cần xử lý ngay</span>
          : <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3.5 py-1.5 text-[13px] font-bold text-emerald-700">Mọi việc đang đúng tiến độ</span>}
        <div className="flex gap-2">
          {cv && <Link href="/cong_viec" className="btn-primary !rounded-full"><Plus className="h-4 w-4" />Công việc</Link>}
          {krv && <Link href="/khach_ra_vao" className="btn-secondary !rounded-full"><UserPlus className="h-4 w-4" />Khách vào</Link>}
          {cv && <Link href="/bao-cao-cong-viec" className="btn-secondary !rounded-full hidden sm:inline-flex"><BarChart3 className="h-4 w-4" />Báo cáo</Link>}
        </div>
      </div>

      {/* four headline numbers */}
      <div className="grid shrink-0 grid-cols-2 gap-3 xl:grid-cols-4 lg:gap-4">
        {cv && <Hero label="Công việc cần xử lý" value={cv.overdue + cv.dueToday} icon={ClipboardList} tone={cv.overdue ? 'red' : cv.dueToday ? 'amber' : 'green'} href="/cong_viec"
          chips={[{ text: `${cv.overdue} quá hạn`, hot: cv.overdue > 0 }, { text: `${cv.dueToday} hôm nay` }, { text: `${cv.open} đang mở` }]} />}
        {bt && <Hero label="Bảo trì cần chú ý" value={bt.late + bt.dueToday + bt.soon} icon={Wrench} tone={bt.late ? 'red' : bt.soon + bt.dueToday ? 'amber' : 'green'} href="/lich_bao_tri"
          chips={[{ text: `${bt.late} trễ lịch`, hot: bt.late > 0 }, { text: `${bt.soon + bt.dueToday} sắp đến hạn` }, { text: `${bt.waiting} chờ ngày gốc` }]} />}
        {krv && <Hero label="Khách trong tòa nhà" value={krv.inside} icon={Users} tone="blue" href="/khach_ra_vao"
          chips={[{ text: `${krv.today} lượt hôm nay` }]} />}
        {dx && <Hero label="Đề xuất chờ duyệt" value={dx.pending} icon={FileSignature} tone={dx.pending ? 'amber' : 'green'} href="/de_xuat?loai_de_xuat=MUA_VAT_TU"
          chips={[{ text: dx.amount ? formatMoney(dx.amount) : 'Không có khoản chờ' }]} />}
      </div>

      {/* attention list + today at a glance */}
      <div className="grid grid-cols-1 gap-4 lg:min-h-[300px] lg:flex-1 lg:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
        <section className="flex flex-col overflow-hidden rounded-2xl border border-navy-200 bg-white shadow-[0_1px_2px_rgba(16,24,40,.05)] lg:min-h-0">
          <header className="flex shrink-0 flex-wrap items-center gap-2 border-b border-navy-100 px-3 py-2.5">
            <h2 className="px-1 text-[14px] font-extrabold text-navy-900">Cần xử lý</h2>
            <div className="flex flex-wrap gap-1" role="tablist">
              {tabs.map((t) => (
                <button key={t.key} role="tab" aria-selected={active?.key === t.key} onClick={() => setTab(t.key)}
                  className={`rounded-full px-3 py-1 text-[12.5px] font-bold transition ${active?.key === t.key ? 'bg-navy-900 text-white' : 'bg-navy-100 text-ink-soft hover:bg-navy-200'}`}>
                  {t.label}{t.n > 0 && <span className={`ml-1.5 rounded-full px-1.5 text-[11px] ${active?.key === t.key ? 'bg-white/20' : 'bg-white'}`}>{t.n}</span>}
                </button>
              ))}
            </div>
            {active && <Link href={active.href} className="ml-auto px-1 text-[12.5px] font-bold text-brand-600 hover:text-brand-700">Xem tất cả →</Link>}
          </header>
          <ul className="max-h-[420px] min-h-[160px] overflow-y-auto lg:max-h-none lg:min-h-0 lg:flex-1">
            {active?.key === 'cv' && (cv.list.length === 0 ? <Empty text="Không có công việc nào cần chú ý." /> : cv.list.map((r: any) => (
              <Row key={r.id} left={<span className="w-14 shrink-0 font-mono text-[11px] text-ink-mute">{r.id}</span>}
                mid={<span className="block truncate text-[13.5px] font-semibold text-ink">{r.noi_dung}</span>}
                right={<span className={r.canh_bao === 'QUÁ HẠN' ? 'pill-red' : 'pill-amber'}>{r.canh_bao === 'QUÁ HẠN' && r.so_ngay_con_lai < 0 ? `trễ ${-r.so_ngay_con_lai} ngày` : r.canh_bao}</span>} />
            )))}
            {active?.key === 'bt' && (bt.list.length === 0 ? <Empty text="Không có hạng mục nào sắp đến hạn." /> : bt.list.map((r: any) => (
              <Row key={r.id}
                mid={<><span className="block truncate text-[13.5px] font-semibold text-ink">{r.ten_hang_muc}</span><span className="block truncate text-xs text-ink-mute">{r.tang ? `${r.tang} · ` : ''}{r.ten_khu_vuc}</span></>}
                right={<><span className="block text-xs tabular-nums text-ink-soft">{formatDate(r.ngay_ke_tiep)}</span><span className={r.canh_bao === 'TRỄ LỊCH' ? 'pill-red' : 'pill-amber'}>{r.so_ngay_con_lai < 0 ? `trễ ${-r.so_ngay_con_lai} ngày` : `còn ${r.so_ngay_con_lai} ngày`}</span></>} />
            )))}
            {active?.key === 'kt' && (kt.expiring.length === 0 ? <Empty text="Không có hợp đồng nào sắp hết hạn (60 ngày)." /> : kt.expiring.map((r: any) => (
              <Row key={r.id} mid={<span className="block truncate text-[13.5px] font-semibold text-ink">{r.ten_khach_thue}</span>}
                right={<span className={r.so_ngay_con_lai < 0 ? 'pill-red' : 'pill-amber'}>{formatDate(r.ngay_ket_thuc)}</span>} />
            )))}
            {active?.key === 'kho' && (kho.low.length === 0 ? <Empty text="Kho đủ vật tư." /> : kho.low.slice(0, 20).map((r: any) => (
              <Row key={r.id} mid={<span className="block truncate text-[13.5px] font-semibold text-ink">{r.ten_vat_tu}</span>}
                right={<span className="pill-red">tồn {r.ton_hien_tai}{r.dvt ? ` ${r.dvt}` : ''} / {r.ton_toi_thieu}</span>} />
            )))}
            {!active && <Empty text="Không có dữ liệu để hiển thị." />}
          </ul>
        </section>

        <section className="flex flex-col gap-4 lg:min-h-0 lg:overflow-y-auto">
          {hn && (
            <div className="rounded-2xl border border-navy-200 bg-white px-4 py-3 shadow-[0_1px_2px_rgba(16,24,40,.05)]">
              <div className="mb-2 flex items-center justify-between"><h2 className="text-[14px] font-extrabold text-navy-900">Việc hằng ngày hôm nay</h2>
                <Link href="/cong_viec_hang_ngay" className="text-[12.5px] font-bold text-brand-600">Mở →</Link></div>
              <div className="flex items-center gap-4">
                <div className="relative h-[68px] w-[68px] shrink-0">
                  <svg viewBox="0 0 36 36" className="h-full w-full -rotate-90" role="img" aria-label={`Hoàn thành ${dailyPct}%`}>
                    <circle cx="18" cy="18" r="15.5" fill="none" stroke="#eef1f5" strokeWidth="4" />
                    <circle cx="18" cy="18" r="15.5" fill="none" stroke="#10b981" strokeWidth="4" strokeLinecap="round" strokeDasharray={`${(dailyPct / 100) * 97.4} 97.4`} />
                  </svg>
                  <span className="absolute inset-0 grid place-items-center text-[14px] font-black tabular-nums text-navy-900">{dailyPct}%</span>
                </div>
                <div><div className="text-[26px] font-black leading-none tabular-nums text-navy-900">{hn.done}<span className="text-[16px] font-bold text-ink-mute">/{hn.total}</span></div>
                  <div className="mt-1 flex items-center gap-1.5 text-[12.5px] text-ink-mute"><ListChecks className="h-4 w-4" />việc đã xong</div></div>
              </div>
            </div>
          )}
          <div className="rounded-2xl border border-navy-200 bg-white px-4 py-3 shadow-[0_1px_2px_rgba(16,24,40,.05)]">
            <h2 className="mb-1 text-[14px] font-extrabold text-navy-900">Tòa nhà</h2>
            <ul className="divide-y divide-navy-100 text-[13.5px]">
              {kt && <li className="flex items-center gap-3 py-1.5"><Building2 className="h-4 w-4 text-ink-mute" /><span className="flex-1 text-ink-soft">Khách đang thuê</span><b className="tabular-nums">{kt.renting}</b></li>}
              {tang && <li className="flex items-center gap-3 py-1.5"><LayoutGrid className="h-4 w-4 text-ink-mute" /><span className="flex-1 text-ink-soft">Tầng / khu còn trống</span><b className="tabular-nums">{tang.empty}/{tang.total}</b></li>}
              {tb && <li className="flex items-center gap-3 py-1.5"><Cpu className="h-4 w-4 text-ink-mute" /><span className="flex-1 text-ink-soft">Thiết bị quản lý</span><b className="tabular-nums">{tb.total}</b></li>}
              {kho && <li className="flex items-center gap-3 py-1.5"><CalendarClock className="h-4 w-4 text-ink-mute" /><span className="flex-1 text-ink-soft">Vật tư dưới tồn tối thiểu</span><b className={`tabular-nums ${kho.low.length ? 'text-red-600' : ''}`}>{kho.low.length}</b></li>}
            </ul>
            {tb && tb.total > 0 && (
              <div className="mt-3">
                <div className="flex h-2.5 overflow-hidden rounded-full bg-navy-100" role="img" aria-label="Thiết bị theo trạng thái">
                  {tbEntries.map(([k, v], i) => <span key={k} style={{ width: `${(v / tb.total) * 100}%`, background: tbColors[i % tbColors.length] }} />)}
                </div>
                <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[11.5px] text-ink-mute">
                  {tbEntries.map(([k, v], i) => <span key={k} className="inline-flex items-center gap-1.5"><i className="h-2 w-2 rounded-full" style={{ background: tbColors[i % tbColors.length] }} />{k === '(trống)' ? 'Cần xử lý' : k} {v}</span>)}
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}

const Empty = ({ text }: { text: string }) => (
  <li className="grid place-items-center gap-2 px-5 py-12 text-center text-sm text-ink-mute"><Inbox className="h-6 w-6 text-navy-300" />{text}</li>
)
