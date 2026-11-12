'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import {
  CalendarClock, Building2, LayoutGrid, Cpu,
  ArrowUpRight, Plus, UserPlus, BarChart3, ListChecks, Inbox,
} from 'lucide-react'
import { formatDate, formatMoney } from '@/lib/resources'
import CostChartCard from '@/components/CostChart'

type Tone = 'red' | 'amber' | 'blue' | 'green'

const TILE: Record<Tone, { box: string; num: string; sub: string; chip: string; hot: string }> = {
  red: { box: 'bg-[#e11d2e] text-white shadow-[0_8px_0_#8f0f1b,0_20px_32px_rgba(225,29,46,.26)]', num: 'text-white [text-shadow:0_4px_0_#8f0f1b]', sub: 'text-[#ffe3e6]', chip: 'bg-white/18 text-white', hot: 'bg-white text-[#a40f1c]' },
  amber: { box: 'bg-[#ffd98a] text-[#3d2a00] shadow-[0_8px_0_#d9a13a,0_20px_32px_rgba(217,161,58,.26)]', num: 'text-[#3d2a00]', sub: 'text-[#5a3f00]', chip: 'bg-[#fff7e3] text-[#3d2a00]', hot: 'bg-[#a40f1c] text-white' },
  blue: { box: 'bg-white text-navy-900 shadow-[0_8px_0_#c5cfe3,0_20px_32px_rgba(11,27,64,.12)]', num: 'text-[#1d4ed8] [text-shadow:0_4px_0_#c7d7fb]', sub: 'text-ink-soft', chip: 'bg-navy-100 text-ink-soft', hot: 'bg-red-50 text-red-600' },
  green: { box: 'bg-[#bfe8cf] text-[#0c3b20] shadow-[0_8px_0_#7cc49a,0_20px_32px_rgba(60,150,100,.22)]', num: 'text-[#0c3b20]', sub: 'text-[#14532d]', chip: 'bg-white/70 text-[#0c3b20]', hot: 'bg-[#a40f1c] text-white' },
}
function Hero({ label, value, tone, href, chips, className = '' }: {
  label: string; value: React.ReactNode; icon?: React.ComponentType<{ className?: string }>; tone: Tone; href: string
  chips: { text: string; hot?: boolean }[]; className?: string
}) {
  const t = TILE[tone]
  return (
    <Link href={href} className={`group flex flex-col rounded-[24px] px-5 py-4 transition duration-150 hover:-translate-y-1 ${t.box} ${className}`}>
      <div className={`flex items-center justify-between text-[13px] font-extrabold ${t.sub}`}>{label}<ArrowUpRight className="h-4 w-4 opacity-70" /></div>
      <div className={`mt-1 text-[56px] font-black leading-none tracking-tight tabular-nums lg:text-[64px] ${t.num}`}>{value}</div>
      <div className="mt-auto flex flex-wrap gap-1.5 pt-3">
        {chips.map((c) => <span key={c.text} className={`rounded-lg px-2 py-0.5 text-[11.5px] font-bold ${c.hot ? t.hot : t.chip}`}>{c.text}</span>)}
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
    dx && { key: 'dx', label: 'Đề xuất', n: dx.pending, href: '/de_xuat?loai_de_xuat=MUA_VAT_TU' },
    kho && { key: 'kho', label: 'Vật tư', n: kho.low.length, href: '/vat_tu' },
  ].filter(Boolean) as { key: string; label: string; n: number; href: string }[], [cv, bt, kt, kho, dx])
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
  const summary = [
    cv?.overdue ? { text: `${cv.overdue} công việc quá hạn`, hot: true } : null,
    bt && bt.late + bt.dueToday ? { text: `${bt.late + bt.dueToday} hạng mục bảo trì cần làm` } : null,
    dx?.pending ? { text: `${dx.pending} đề xuất chờ duyệt` } : null,
  ].filter(Boolean) as { text: string; hot?: boolean }[]
  const week: { day: string; n: number }[] = hn?.week ?? []
  const weekMax = Math.max(1, ...week.map((w) => w.n)), weekSum = week.reduce((s, w) => s + w.n, 0)
  const DOW = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7']
  const dailyPct = hn?.total ? Math.round((hn.done / hn.total) * 100) : 0
  const tbColors = ['#ffffff', '#ff8a8e', '#93c5fd', '#fcd34d', '#6ee7b7', '#cbd5e1']
  const tbEntries = tb ? Object.entries(tb.by as Record<string, number>).sort((a, b) => b[1] - a[1]) : []

  return (
    <div className="flex-1 lg:min-h-0 flex flex-col gap-5 px-4 lg:px-6 py-5 lg:overflow-y-auto">
      {/* bento row: greeting block + headline numbers */}
      <div className="grid shrink-0 grid-cols-2 gap-4 lg:grid-cols-12 lg:gap-5">
        <section className="col-span-2 flex flex-col gap-3 rounded-[24px] bg-[#0b1b40] px-6 py-5 text-white shadow-[0_8px_0_#071230,0_20px_32px_rgba(7,18,48,.26)] lg:col-span-4">
          <span className="text-[12px] font-bold uppercase tracking-wide text-[#c3cde3]">{weekday} · {formatDate(d.today)}</span>
          <h1 className="text-[26px] font-black leading-tight tracking-tight lg:text-[30px]">{greet}{d.name ? <>,<br />{String(d.name).trim().split(/\s+/).slice(-2).join(' ')}</> : ''}</h1>
          <p className="text-[13.5px] leading-relaxed text-[#dbe3f5]">{summary.length > 0 ? <>Hôm nay có {summary.map((x, i) => <span key={x.text}>{i > 0 && (i === summary.length - 1 ? ' và ' : ', ')}<b className={x.hot ? 'text-[#ff8a93]' : 'text-white'}>{x.text}</b></span>)}.</> : 'Mọi việc đang đúng tiến độ.'}</p>
          <div className="mt-auto flex flex-wrap gap-2.5 pt-1">
            {cv && <Link href="/cong_viec" className="inline-flex h-11 items-center gap-1.5 rounded-[13px] bg-[#e11d2e] px-4 text-[13.5px] font-extrabold text-white shadow-[0_5px_0_#8f0f1b] transition duration-100 active:translate-y-1 active:shadow-[0_1px_0_#8f0f1b]"><Plus className="h-4 w-4" />Công việc</Link>}
            {krv && <Link href="/khach_ra_vao" className="inline-flex h-11 items-center gap-1.5 rounded-[13px] bg-white px-4 text-[13.5px] font-extrabold text-[#0b1b40] shadow-[0_5px_0_#b9c4dc] transition duration-100 active:translate-y-1 active:shadow-[0_1px_0_#b9c4dc]"><UserPlus className="h-4 w-4" />Khách vào</Link>}
            {cv && <Link href="/bao-cao-cong-viec" className="inline-flex h-11 items-center gap-1.5 rounded-[13px] bg-[#1a2f63] px-4 text-[13.5px] font-extrabold text-white shadow-[0_5px_0_#071230] transition duration-100 active:translate-y-1 active:shadow-[0_1px_0_#071230]"><BarChart3 className="h-4 w-4" />Báo cáo</Link>}
          </div>
        </section>
        {cv && <Hero className="lg:col-span-2" label="Công việc quá hạn" value={cv.overdue} tone={cv.overdue ? 'red' : 'green'} href="/cong_viec"
          chips={[{ text: `${cv.dueToday} hôm nay` }, { text: `${cv.open} đang mở` }]} />}
        {dx && <Hero className="lg:col-span-2" label="Đề xuất chờ duyệt" value={dx.pending} tone="blue" href="/de_xuat?loai_de_xuat=MUA_VAT_TU"
          chips={[{ text: dx.amount ? formatMoney(dx.amount) : 'Không có khoản chờ' }]} />}
        {bt && <Hero className="lg:col-span-2" label="Bảo trì cần chú ý" value={bt.late + bt.dueToday + bt.soon} tone={bt.late + bt.dueToday + bt.soon ? 'amber' : 'green'} href="/lich_bao_tri"
          chips={[{ text: `${bt.late} trễ lịch`, hot: bt.late > 0 }, { text: `${bt.soon + bt.dueToday} sắp đến hạn` }]} />}
        {krv && <Hero className="lg:col-span-2" label="Khách trong tòa nhà" value={krv.inside} tone="blue" href="/khach_ra_vao"
          chips={[{ text: `${krv.today} lượt hôm nay` }]} />}
      </div>

      {/* attention list + today at a glance */}
      <div className="grid grid-cols-1 gap-5 pb-3 lg:min-h-[300px] lg:flex-1 lg:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
        <section className="flex flex-col overflow-hidden bento lg:min-h-0">
          <header className="flex shrink-0 flex-wrap items-center gap-2 border-b border-navy-100 px-3 py-2.5">
            <h2 className="px-1 text-[14px] font-extrabold text-navy-900">Cần xử lý</h2>
            <div className="flex flex-wrap gap-1" role="tablist">
              {tabs.map((t) => (
                <button key={t.key} role="tab" aria-selected={active?.key === t.key} onClick={() => setTab(t.key)}
                  className={`rounded-full px-3 py-1 text-[12.5px] font-bold transition ${active?.key === t.key ? 'bg-[#0b1b40] text-white shadow-[0_3px_0_#071230]' : 'bg-navy-100 text-navy-800 shadow-[0_3px_0_#c5cfe3] hover:bg-navy-200'}`}>
                  {t.label}{t.n > 0 && <span className={`ml-1.5 rounded-full px-1.5 text-[11px] ${active?.key === t.key ? 'bg-white/20' : 'bg-white'}`}>{t.n}</span>}
                </button>
              ))}
            </div>
            {active && <Link href={active.href} className="ml-auto px-1 text-[12.5px] font-bold text-blue-600 hover:text-blue-700">Xem tất cả →</Link>}
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
            {active?.key === 'dx' && (dx.list.length === 0 ? <Empty text="Không có đề xuất nào chờ duyệt." /> : dx.list.map((r: any) => (
              <Row key={r.id} left={<span className="w-14 shrink-0 font-mono text-[11px] text-ink-mute">{r.id}</span>}
                mid={<><span className="block truncate text-[13.5px] font-semibold text-ink">{r.noi_dung}</span><span className="block truncate text-xs text-ink-mute">{formatDate(r.ngay_de_xuat)}{Number(r.tong_tien) ? ` · ${formatMoney(r.tong_tien)}` : ''}</span></>}
                right={<Link href={`/de_xuat?loai_de_xuat=${r.loai_de_xuat}&q=${r.id}`} className="btn-secondary btn-sm">Mở</Link>} />
            )))}
            {active?.key === 'kho' && (kho.low.length === 0 ? <Empty text="Kho đủ vật tư." /> : kho.low.slice(0, 20).map((r: any) => (
              <Row key={r.id} mid={<span className="block truncate text-[13.5px] font-semibold text-ink">{r.ten_vat_tu}</span>}
                right={<span className="pill-red">tồn {r.ton_hien_tai}{r.dvt ? ` ${r.dvt}` : ''} / {r.ton_toi_thieu}</span>} />
            )))}
            {!active && <Empty text="Không có dữ liệu để hiển thị." />}
          </ul>
        </section>

        <section className="flex flex-col gap-5 lg:min-h-0 lg:overflow-y-auto lg:pb-3 lg:pr-1">
          {hn && (
            <div className="bento px-5 py-4">
              <div className="mb-2 flex items-center justify-between"><h2 className="text-[14px] font-extrabold text-navy-900">Việc hằng ngày hôm nay</h2>
                <Link href="/cong_viec_hang_ngay" className="text-[12.5px] font-bold text-blue-600">Mở →</Link></div>
              <div className="flex items-center gap-4">
                <div className="relative h-[68px] w-[68px] shrink-0">
                  <svg viewBox="0 0 36 36" className="h-full w-full -rotate-90" role="img" aria-label={`Hoàn thành ${dailyPct}%`}>
                    <circle cx="18" cy="18" r="15.5" fill="none" stroke="#e5ecf8" strokeWidth="4" />
                    <circle cx="18" cy="18" r="15.5" fill="none" stroke="#2563eb" strokeWidth="4" strokeLinecap="round" strokeDasharray={`${(dailyPct / 100) * 97.4} 97.4`} />
                  </svg>
                  <span className="absolute inset-0 grid place-items-center text-[14px] font-black tabular-nums text-navy-900">{dailyPct}%</span>
                </div>
                <div><div className="text-[26px] font-black leading-none tabular-nums text-navy-900">{hn.done}<span className="text-[16px] font-bold text-ink-mute">/{hn.total}</span></div>
                  <div className="mt-1 flex items-center gap-1.5 text-[12.5px] text-ink-mute"><ListChecks className="h-4 w-4" />việc đã xong</div></div>
              </div>
            </div>
          )}
          {hn && week.length > 0 && (
            <div className="bento px-5 py-4">
              <div className="flex items-baseline justify-between"><h2 className="text-[14px] font-extrabold text-navy-900">Công việc hằng ngày · 7 ngày</h2><span className="text-[12px] text-ink-mute">{hn.month} trong tháng</span></div>
              <div className="mt-0.5 text-[24px] font-black leading-tight tabular-nums text-navy-900">{weekSum} <span className="text-[12.5px] font-semibold text-ink-mute">việc</span></div>
              <div className="mt-2 grid h-[104px] grid-cols-7 items-end gap-2" role="img" aria-label={`Số công việc hằng ngày 7 ngày gần nhất: ${week.map((w) => w.n).join(', ')}`}>
                {week.map((w) => (
                  <div key={w.day} className="flex h-full flex-col items-center justify-end gap-1">
                    <span className="text-[11px] font-bold tabular-nums text-ink-soft">{w.n}</span>
                    <span className={`w-full rounded-lg ${w.n === weekMax && w.n > 0 ? 'bg-[#e11d2e] shadow-[0_5px_0_#8f0f1b]' : 'bg-blue-700 shadow-[0_5px_0_#12318f]'}`} style={{ height: `${Math.max(3, (w.n / weekMax) * 62)}px` }} />
                    <span className={`text-[11px] font-semibold ${w.day === d.today ? 'text-navy-900' : 'text-ink-mute'}`}>{DOW[new Date(w.day + 'T00:00:00Z').getUTCDay()]}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          <CostChartCard />
          {dx && (
            <div className="bento px-5 py-4">
              <div className="text-[12.5px] font-bold text-ink-mute">Đề xuất trong tháng</div>
              <div className="text-[24px] font-black leading-tight tabular-nums text-navy-900">{formatMoney(dx.monthAmount)}</div>
              <div className="mt-0.5 flex items-center justify-between gap-2 text-[12.5px] text-ink-mute"><span>{dx.monthCount} phiếu</span>{dx.pending > 0 && <Link href="/de_xuat?loai_de_xuat=MUA_VAT_TU" className="font-bold text-blue-600">Duyệt {dx.pending} phiếu đang chờ →</Link>}</div>
            </div>
          )}
          <div className="rounded-[22px] bg-[#0b1b40] px-5 py-4 text-white shadow-[0_7px_0_#071230,0_18px_30px_rgba(7,18,48,.22)]">
            <h2 className="mb-1 text-[12px] font-extrabold uppercase tracking-[.12em] text-blue-200">Tòa nhà</h2>
            <ul className="divide-y divide-white/15 text-[13.5px]">
              {kt && <li className="flex items-center gap-3 py-1.5"><Building2 className="h-4 w-4 text-blue-200" /><span className="flex-1 text-blue-100">Khách đang thuê</span><b className="tabular-nums">{kt.renting}</b></li>}
              {tang && <li className="flex items-center gap-3 py-1.5"><LayoutGrid className="h-4 w-4 text-blue-200" /><span className="flex-1 text-blue-100">Tầng / khu còn trống</span><b className="tabular-nums">{tang.empty}/{tang.total}</b></li>}
              {tb && <li className="flex items-center gap-3 py-1.5"><Cpu className="h-4 w-4 text-blue-200" /><span className="flex-1 text-blue-100">Thiết bị quản lý</span><b className="tabular-nums">{tb.total}</b></li>}
              {kho && <li className="flex items-center gap-3 py-1.5"><CalendarClock className="h-4 w-4 text-blue-200" /><span className="flex-1 text-blue-100">Vật tư dưới tồn tối thiểu</span><b className={`tabular-nums ${kho.low.length ? 'text-red-300' : ''}`}>{kho.low.length}</b></li>}
            </ul>
            {tb && tb.total > 0 && (
              <div className="mt-3">
                <div className="flex h-2.5 overflow-hidden rounded-full bg-white/20" role="img" aria-label="Thiết bị theo trạng thái">
                  {tbEntries.map(([k, v], i) => <span key={k} style={{ width: `${(v / tb.total) * 100}%`, background: tbColors[i % tbColors.length] }} />)}
                </div>
                <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[11.5px] text-blue-100">
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
