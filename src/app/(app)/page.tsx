'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  AlertTriangle, CalendarClock, ClipboardList, ListChecks, Users, Wrench, Hourglass, FileSignature,
  Wallet, PackageX, Building2, LayoutGrid, Cpu, ArrowUpRight,
} from 'lucide-react'
import { formatDate, formatMoney } from '@/lib/resources'

type Tone = 'red' | 'amber' | 'navy' | 'gold' | 'green'
const TONES: Record<Tone, string> = {
  red: 'bg-red-50 text-red-600 ring-red-100', amber: 'bg-amber-50 text-amber-600 ring-amber-100',
  navy: 'bg-navy-50 text-navy-700 ring-navy-100', gold: 'bg-gold-50 text-gold-600 ring-gold-100', green: 'bg-emerald-50 text-emerald-600 ring-emerald-100',
}

function Kpi({ label, value, icon: Icon, tone = 'navy', href, hint }: {
  label: string; value: React.ReactNode; icon: React.ComponentType<{ className?: string }>; tone?: Tone; href?: string; hint?: string
}) {
  const body = (
    <div className="card group h-full p-4 transition-all hover:-translate-y-0.5 hover:shadow-pop">
      <div className="flex items-start justify-between gap-2">
        <span className={`grid place-items-center h-9 w-9 rounded-lg ring-1 ${TONES[tone]}`}><Icon className="h-[18px] w-[18px]" /></span>
        {href && <ArrowUpRight className="h-4 w-4 text-navy-200 group-hover:text-gold-500 transition-colors" />}
      </div>
      <div className="mt-3 text-[26px] leading-none font-bold tracking-tight text-navy-900 tabular-nums">{value}</div>
      <div className="mt-1.5 text-xs font-medium text-ink-mute">{label}</div>
      {hint && <div className="mt-0.5 text-[11px] text-ink-mute/80">{hint}</div>}
    </div>
  )
  return href ? <Link href={href} className="block h-full">{body}</Link> : body
}

function Panel({ title, href, children, count }: { title: string; href: string; children: React.ReactNode; count?: number }) {
  return (
    <section className="card overflow-hidden">
      <header className="flex items-center justify-between px-5 py-3.5 border-b border-navy-50">
        <h2 className="text-sm font-semibold text-navy-900">{title}{count ? <span className="ml-2 pill-gray">{count}</span> : null}</h2>
        <Link href={href} className="text-xs font-semibold text-gold-600 hover:text-gold-700">Xem tất cả →</Link>
      </header>
      {children}
    </section>
  )
}
const Empty = ({ text }: { text: string }) => <p className="px-5 py-8 text-center text-sm text-ink-mute">{text}</p>

export default function Dashboard() {
  const [d, setD] = useState<any>(null)
  const [err, setErr] = useState('')
  useEffect(() => {
    fetch('/api/dashboard').then((r) => r.json()).then((j) => (j.success ? setD(j) : setErr(j.error))).catch(() => setErr('Không tải được dữ liệu'))
  }, [])
  if (err) return <p className="text-red-600">{err}</p>
  if (!d) return (
    <div className="space-y-6">
      <div className="h-16 w-72 rounded-xl bg-white animate-pulse" />
      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-4">{[...Array(12)].map((_, i) => <div key={i} className="h-32 rounded-xl bg-white animate-pulse" />)}</div>
    </div>
  )
  const { cv, hn, krv, bt, dx, kho, tb, kt, tang } = d.data
  const hour = Number(new Intl.DateTimeFormat('en-GB', { hour: 'numeric', timeZone: 'Asia/Ho_Chi_Minh' }).format(new Date()))
  const greet = hour < 11 ? 'Chào buổi sáng' : hour < 14 ? 'Chào buổi trưa' : hour < 18 ? 'Chào buổi chiều' : 'Chào buổi tối'
  const weekday = new Intl.DateTimeFormat('vi-VN', { weekday: 'long', timeZone: 'Asia/Ho_Chi_Minh' }).format(new Date())

  return (
    <div className="space-y-7">
      {/* hero */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-navy-900 via-navy-800 to-navy-700 px-6 py-7 md:px-8 text-white shadow-card">
        <div className="absolute -right-16 -top-20 h-64 w-64 rounded-full bg-gold-400/10 blur-2xl" />
        <div className="absolute right-10 bottom-0 h-24 w-24 rounded-full bg-gold-400/10 blur-xl" />
        <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-gold-300">Tổng quan vận hành</p>
        <h1 className="mt-1 text-2xl md:text-3xl font-bold tracking-tight">{greet}</h1>
        <p className="mt-1 text-sm text-navy-200 first-letter:uppercase">{weekday}, {formatDate(d.today)}</p>
        {(cv?.overdue || bt?.late) ? (
          <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5 text-sm ring-1 ring-white/15">
            <AlertTriangle className="h-4 w-4 text-gold-300" />
            Cần xử lý: {cv?.overdue ? `${cv.overdue} công việc quá hạn` : ''}{cv?.overdue && bt?.late ? ' · ' : ''}{bt?.late ? `${bt.late} hạng mục bảo trì trễ lịch` : ''}
          </div>
        ) : <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5 text-sm ring-1 ring-white/15">Mọi việc đang đúng tiến độ</div>}
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-4">
        {cv && <>
          <Kpi label="Công việc quá hạn" value={cv.overdue} icon={AlertTriangle} tone={cv.overdue ? 'red' : 'green'} href="/cong_viec" />
          <Kpi label="Đến hạn hôm nay" value={cv.dueToday} icon={CalendarClock} tone={cv.dueToday ? 'amber' : 'navy'} href="/cong_viec" />
          <Kpi label="Công việc đang mở" value={cv.open} icon={ClipboardList} href="/cong_viec" />
        </>}
        {hn && <Kpi label="Việc hằng ngày hôm nay" value={`${hn.done}/${hn.total}`} icon={ListChecks} tone="green" href="/cong_viec_hang_ngay" />}
        {krv && <Kpi label="Khách đang trong tòa nhà" value={krv.inside} icon={Users} tone="gold" href="/khach_ra_vao?trang_thai=Đang trong tòa nhà" hint={`${krv.today} lượt hôm nay`} />}
        {bt && <>
          <Kpi label="Bảo trì trễ lịch" value={bt.late} icon={Wrench} tone={bt.late ? 'red' : 'green'} href="/lich_bao_tri" />
          <Kpi label="Bảo trì sắp đến hạn" value={bt.soon + bt.dueToday} icon={CalendarClock} tone={bt.soon + bt.dueToday ? 'amber' : 'navy'} href="/lich_bao_tri" />
          <Kpi label="Lịch chờ ngày gốc" value={bt.waiting} icon={Hourglass} href="/lich_bao_tri" />
        </>}
        {dx && <>
          <Kpi label="Đề xuất chờ duyệt" value={dx.pending} icon={FileSignature} tone={dx.pending ? 'amber' : 'navy'} href="/de_xuat?loai_de_xuat=MUA_VAT_TU" />
          <Kpi label="Giá trị chờ duyệt" value={<span className="text-xl">{formatMoney(dx.amount)}</span>} icon={Wallet} tone="gold" />
        </>}
        {kho && <Kpi label="Vật tư dưới tồn tối thiểu" value={kho.low.length} icon={PackageX} tone={kho.low.length ? 'red' : 'green'} href="/vat_tu" />}
        {kt && <Kpi label="Khách đang thuê" value={kt.renting} icon={Building2} href="/khach_thue" />}
        {tang && <Kpi label="Tầng / khu còn trống" value={`${tang.empty}/${tang.total}`} icon={LayoutGrid} tone="green" href="/tang" />}
        {tb && <Kpi label="Thiết bị quản lý" value={tb.total} icon={Cpu} href="/thiet_bi" />}
      </div>

      {/* lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {cv && <Panel title="Công việc cần chú ý" href="/cong_viec" count={cv.list.length}>
          {cv.list.length === 0 ? <Empty text="Không có công việc nào cần chú ý." /> : (
            <ul className="divide-y divide-navy-50">{cv.list.map((r: any) => (
              <li key={r.id} className="flex items-center gap-3 px-5 py-3">
                <span className="font-mono text-[11px] text-ink-mute w-14 shrink-0">{r.id}</span>
                <span className="flex-1 min-w-0 truncate text-sm text-ink">{r.noi_dung}</span>
                <span className={r.canh_bao === 'QUÁ HẠN' ? 'pill-red' : 'pill-amber'}>{r.canh_bao}</span>
              </li>))}
            </ul>)}
        </Panel>}
        {bt && <Panel title="Bảo trì đến hạn" href="/lich_bao_tri" count={bt.list.length}>
          {bt.list.length === 0 ? <Empty text="Không có hạng mục nào sắp đến hạn." /> : (
            <ul className="divide-y divide-navy-50">{bt.list.map((r: any) => (
              <li key={r.id} className="flex items-center gap-3 px-5 py-3">
                <div className="flex-1 min-w-0">
                  <div className="truncate text-sm font-medium text-ink">{r.ten_hang_muc}</div>
                  <div className="truncate text-xs text-ink-mute">{r.tang ? `${r.tang} · ` : ''}{r.ten_khu_vuc}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs tabular-nums text-ink-soft">{formatDate(r.ngay_ke_tiep)}</div>
                  <span className={r.canh_bao === 'TRỄ LỊCH' ? 'pill-red' : 'pill-amber'}>{r.so_ngay_con_lai < 0 ? `trễ ${-r.so_ngay_con_lai} ngày` : `còn ${r.so_ngay_con_lai} ngày`}</span>
                </div>
              </li>))}
            </ul>)}
        </Panel>}
        {kt && <Panel title="Hợp đồng thuê sắp hết hạn (60 ngày)" href="/khach_thue" count={kt.expiring.length}>
          {kt.expiring.length === 0 ? <Empty text="Không có hợp đồng nào sắp hết hạn." /> : (
            <ul className="divide-y divide-navy-50">{kt.expiring.map((r: any) => (
              <li key={r.id} className="flex items-center gap-3 px-5 py-3">
                <span className="flex-1 truncate text-sm text-ink">{r.ten_khach_thue}</span>
                <span className={r.so_ngay_con_lai < 0 ? 'pill-red' : 'pill-amber'}>{formatDate(r.ngay_ket_thuc)}</span>
              </li>))}
            </ul>)}
        </Panel>}
        {tb && <Panel title="Thiết bị theo trạng thái" href="/thiet_bi">
          <div className="px-5 py-4 space-y-3">
            {Object.entries(tb.by as Record<string, number>).sort((a, b) => b[1] - a[1]).map(([k, v]) => (
              <Link key={k} href={k === '(trống)' ? '/thiet_bi' : `/thiet_bi?trang_thai=${encodeURIComponent(k)}`} className="block group">
                <div className="flex justify-between text-sm mb-1"><span className="text-ink group-hover:text-navy-700">{k}</span><span className="tabular-nums text-ink-soft">{v}</span></div>
                <div className="h-1.5 rounded-full bg-navy-50 overflow-hidden"><div className="h-full rounded-full bg-gradient-to-r from-navy-600 to-gold-400" style={{ width: `${(v / Math.max(1, tb.total)) * 100}%` }} /></div>
              </Link>
            ))}
          </div>
        </Panel>}
        {kho && kho.low.length > 0 && <Panel title="Vật tư cần bổ sung" href="/vat_tu" count={kho.low.length}>
          <ul className="divide-y divide-navy-50">{kho.low.slice(0, 8).map((r: any) => (
            <li key={r.id} className="flex items-center gap-3 px-5 py-3">
              <span className="flex-1 truncate text-sm text-ink">{r.ten_vat_tu}</span>
              <span className="pill-red">tồn {r.ton_hien_tai}{r.dvt ? ` ${r.dvt}` : ''} / {r.ton_toi_thieu}</span>
            </li>))}
          </ul>
        </Panel>}
      </div>
    </div>
  )
}
