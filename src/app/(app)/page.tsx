'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { formatMoney } from '@/lib/resources'

interface Stats {
  buildings: number; rooms: number; occupied: number; available: number; tenants: number
  openJobs: number; urgentJobs: number; damaged: number; activeContracts: number
  occupancyRate: number; monthlyRevenue: number
  expiring: { id: string; endDate: string; fee: number; tenant: string; room: string }[]
}

function Stat({ label, value, tone = 'text-gray-900' }: { label: string; value: string | number; tone?: string }) {
  return (
    <div className="card">
      <div className="text-sm text-gray-500">{label}</div>
      <div className={`text-3xl font-bold mt-1 ${tone}`}>{value}</div>
    </div>
  )
}

export default function Dashboard() {
  const [s, setS] = useState<Stats | null>(null)
  const [err, setErr] = useState('')

  useEffect(() => {
    fetch('/api/dashboard').then((r) => r.json()).then((j) => (j.success ? setS(j.data) : setErr(j.error)))
      .catch(() => setErr('Không tải được dữ liệu'))
  }, [])

  if (err) return <p className="text-red-600">{err}</p>
  if (!s) return <p className="text-gray-500">Đang tải…</p>

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Tổng quan</h1>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat label="Tòa nhà" value={s.buildings} />
        <Stat label="Tổng số phòng" value={s.rooms} />
        <Stat label="Tỷ lệ lấp đầy" value={`${s.occupancyRate}%`} tone="text-blue-700" />
        <Stat label="Phòng trống" value={s.available} tone="text-green-700" />
        <Stat label="Khách thuê đang hoạt động" value={s.tenants} />
        <Stat label="Hợp đồng hiệu lực" value={s.activeContracts} />
        <Stat label="Doanh thu thuê / tháng" value={formatMoney(s.monthlyRevenue)} tone="text-blue-700" />
        <Stat label="Thiết bị hỏng" value={s.damaged} tone={s.damaged ? 'text-red-600' : 'text-gray-900'} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="card lg:col-span-2">
          <h2 className="font-semibold mb-3">Hợp đồng sắp hết hạn (30 ngày)</h2>
          {s.expiring.length === 0 ? <p className="text-gray-500 text-sm">Không có hợp đồng nào sắp hết hạn.</p> : (
            <div className="table-responsive">
              <table className="table text-sm">
                <thead><tr><th>Khách thuê</th><th>Phòng</th><th>Hết hạn</th><th>Phí / tháng</th></tr></thead>
                <tbody>{s.expiring.map((c) => (
                  <tr key={c.id}><td>{c.tenant}</td><td>{c.room}</td><td>{c.endDate}</td><td>{formatMoney(c.fee)}</td></tr>
                ))}</tbody>
              </table>
            </div>
          )}
        </div>
        <div className="card">
          <h2 className="font-semibold mb-3">Bảo trì</h2>
          <p className="text-3xl font-bold">{s.openJobs}</p>
          <p className="text-sm text-gray-500 mb-2">công việc chưa hoàn thành</p>
          <p className={s.urgentJobs ? 'text-red-600 font-medium' : 'text-gray-500'}>{s.urgentJobs} ưu tiên cao</p>
          <Link href="/maintenance" className="text-blue-600 underline text-sm mt-3 inline-block">Xem công việc →</Link>
        </div>
      </div>
    </div>
  )
}
