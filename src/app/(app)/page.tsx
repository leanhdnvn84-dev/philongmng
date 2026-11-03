'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { formatDate, formatMoney } from '@/lib/resources'

function Tile({ label, value, href, tone = '' }: { label: string; value: React.ReactNode; href?: string; tone?: string }) {
  const body = (
    <div className={`bg-white rounded-lg border p-4 h-full ${href ? 'hover:border-blue-400' : ''}`}>
      <div className="text-xs text-gray-500">{label}</div>
      <div className={`text-2xl font-bold mt-1 ${tone}`}>{value}</div>
    </div>
  )
  return href ? <Link href={href}>{body}</Link> : body
}
const red = (n: number) => (n ? 'text-red-600' : '')
const amber = (n: number) => (n ? 'text-amber-600' : '')

function List({ title, href, rows, render }: { title: string; href: string; rows: any[]; render: (r: any) => React.ReactNode }) {
  return (
    <div className="bg-white rounded-lg border p-4">
      <div className="flex justify-between items-center mb-2">
        <h2 className="font-semibold">{title}</h2>
        <Link href={href} className="text-sm text-blue-600 hover:underline">Xem tất cả →</Link>
      </div>
      {rows.length === 0 ? <p className="text-sm text-gray-500">Không có mục nào.</p> : (
        <ul className="divide-y text-sm">{rows.map((r) => <li key={r.id} className="py-2 flex justify-between gap-3">{render(r)}</li>)}</ul>
      )}
    </div>
  )
}

export default function Dashboard() {
  const [d, setD] = useState<any>(null)
  const [err, setErr] = useState('')
  useEffect(() => {
    fetch('/api/dashboard').then((r) => r.json()).then((j) => (j.success ? setD(j) : setErr(j.error))).catch(() => setErr('Không tải được dữ liệu'))
  }, [])
  if (err) return <p className="text-red-600">{err}</p>
  if (!d) return <p className="text-gray-500">Đang tải…</p>
  const { cv, hn, krv, bt, dx, kho, tb, kt, tang } = d.data

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Tổng quan</h1>
        <p className="text-sm text-gray-500">Hôm nay {formatDate(d.today)}</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-3">
        {cv && <>
          <Tile label="Công việc quá hạn" value={cv.overdue} tone={red(cv.overdue)} href="/cong_viec" />
          <Tile label="Đến hạn hôm nay" value={cv.dueToday} tone={amber(cv.dueToday)} href="/cong_viec" />
          <Tile label="Công việc đang mở" value={cv.open} href="/cong_viec" />
        </>}
        {hn && <Tile label="Việc hằng ngày hôm nay" value={`${hn.done}/${hn.total}`} href="/cong_viec_hang_ngay" />}
        {krv && <Tile label="Khách đang trong tòa nhà" value={krv.inside} href="/khach_ra_vao?trang_thai=Đang trong tòa nhà" />}
        {bt && <>
          <Tile label="Bảo trì trễ lịch" value={bt.late} tone={red(bt.late)} href="/lich_bao_tri" />
          <Tile label="Bảo trì sắp đến hạn" value={bt.soon + bt.dueToday} tone={amber(bt.soon + bt.dueToday)} href="/lich_bao_tri" />
          <Tile label="Lịch chờ ngày gốc" value={bt.waiting} href="/lich_bao_tri" />
        </>}
        {dx && <Tile label="Đề xuất chờ duyệt" value={dx.pending} tone={amber(dx.pending)} href="/de_xuat?loai_de_xuat=MUA_VAT_TU" />}
        {dx && <Tile label="Giá trị chờ duyệt" value={formatMoney(dx.amount)} />}
        {kho && <Tile label="Vật tư dưới tồn tối thiểu" value={kho.low.length} tone={red(kho.low.length)} href="/vat_tu" />}
        {kt && <Tile label="Khách đang thuê" value={kt.renting} href="/khach_thue" />}
        {tang && <Tile label="Tầng / khu trống" value={`${tang.empty}/${tang.total}`} href="/tang" />}
        {tb && <Tile label="Thiết bị" value={tb.total} href="/thiet_bi" />}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {cv && <List title="Công việc cần chú ý" href="/cong_viec" rows={cv.list} render={(r) => <>
          <span className="truncate"><span className="font-mono text-xs text-gray-500">{r.id}</span> {r.noi_dung}</span>
          <span className={`whitespace-nowrap ${r.canh_bao === 'QUÁ HẠN' ? 'text-red-600' : 'text-amber-600'}`}>{r.canh_bao}{r.deadline ? ` · ${formatDate(r.deadline)}` : ''}</span>
        </>} />}
        {bt && <List title="Bảo trì đến hạn" href="/lich_bao_tri" rows={bt.list} render={(r) => <>
          <span className="truncate">{r.tang ? `${r.tang} · ` : ''}{r.ten_khu_vuc} — {r.ten_hang_muc}</span>
          <span className={`whitespace-nowrap ${r.canh_bao === 'TRỄ LỊCH' ? 'text-red-600' : 'text-amber-600'}`}>{formatDate(r.ngay_ke_tiep)} ({r.so_ngay_con_lai} ngày)</span>
        </>} />}
        {kt && <List title="Hợp đồng thuê sắp hết hạn (60 ngày)" href="/khach_thue" rows={kt.expiring} render={(r) => <>
          <span className="truncate">{r.ten_khach_thue}</span>
          <span className={`whitespace-nowrap ${r.so_ngay_con_lai < 0 ? 'text-red-600' : 'text-amber-600'}`}>{formatDate(r.ngay_ket_thuc)}</span>
        </>} />}
        {kho && kho.low.length > 0 && <List title="Vật tư cần bổ sung" href="/vat_tu" rows={kho.low.slice(0, 8)} render={(r) => <>
          <span className="truncate">{r.ten_vat_tu}</span>
          <span className="whitespace-nowrap text-red-600">tồn {r.ton_hien_tai}{r.dvt ? ` ${r.dvt}` : ''} / tối thiểu {r.ton_toi_thieu}</span>
        </>} />}
        {tb && <div className="bg-white rounded-lg border p-4">
          <h2 className="font-semibold mb-2">Thiết bị theo trạng thái</h2>
          <ul className="text-sm divide-y">{Object.entries(tb.by as Record<string, number>).map(([k, v]) => (
            <li key={k} className="py-1.5 flex justify-between"><Link className="hover:underline" href={`/thiet_bi?trang_thai=${encodeURIComponent(k)}`}>{k}</Link><span>{v}</span></li>
          ))}</ul>
        </div>}
      </div>
    </div>
  )
}
