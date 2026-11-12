'use client'
// V191 extras on the proposal page: "Thống kê riêng" strip (month / year totals) and the daily-work summary line.
import { dedupeGet } from '@/lib/getDedupe'
import { useEffect, useState } from 'react'

const vnd = (n: number) => `${new Intl.NumberFormat('vi-VN').format(Math.round(n))} đ`
const getJson = (u: string) => dedupeGet(u, () => fetch(u).then((r) => r.json())).then((j) => (j.success ? (j.data as any[]) : []))

export function ProposalStats({ kind, title, version }: { kind: string; title: string; version: number }) {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [rows, setRows] = useState<any[]>([])
  useEffect(() => {
    if (!version) return // the list page bumps version after its first load
    let alive = true
    getJson(`/api/de_xuat?loai_de_xuat=${kind}&from=${year}-01-01&to=${year}-12-31&pageSize=2000`).then((d) => { if (alive) setRows(d) }).catch(() => {})
    return () => { alive = false }
  }, [kind, year, version])
  const sum = (list: any[]) => ({
    tien: list.reduce((s, r) => s + Number(r.tong_tien || 0), 0),
    phieu: list.length,
    dong: list.reduce((s, r) => s + Number(r.so_dong || 0), 0),
  })
  const ok = rows.filter((r) => r.trang_thai !== 'Từ chối' && Number(r.so_dong || 0) > 0)
  const m = String(month).padStart(2, '0')
  const inMonth = ok.filter((r) => String(r.ngay_de_xuat ?? '').slice(0, 7) === `${year}-${m}`)
  const a = sum(inMonth), b = sum(ok)
  const years = [now.getFullYear() - 2, now.getFullYear() - 1, now.getFullYear()]
  const label = title.replace(/^Đề xuất /i, '').toLowerCase()
  return (
    <div className="card shrink-0 flex flex-wrap items-stretch gap-3 px-3 py-2 print:hidden">
      <div className="min-w-[110px] self-center">
        <div className="text-[10.5px] font-bold uppercase tracking-wide text-ink-mute">Thống kê riêng</div>
        <div className="text-[13px] font-extrabold text-navy-900">{title}</div>
      </div>
      <div className="flex items-center gap-2 self-center text-[12px] font-bold text-ink-mute">
        Tháng
        <select className="input !h-8 !w-auto !py-0 !text-[13px]" value={month} onChange={(e) => setMonth(+e.target.value)}>
          {Array.from({ length: 12 }, (_, i) => <option key={i} value={i + 1}>Tháng {String(i + 1).padStart(2, '0')}/{year}</option>)}
        </select>
        Năm
        <select className="input !h-8 !w-auto !py-0 !text-[13px]" value={year} onChange={(e) => setYear(+e.target.value)}>
          {years.map((y) => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>
      <Stat tone="blue" head={`Tổng tiền ${label} tháng ${m}/${year}`} value={vnd(a.tien)} sub={`${a.phieu} phiếu · ${a.dong} dòng`} />
      <Stat tone="green" head={`Tổng tiền ${label} năm ${year}`} value={vnd(b.tien)} sub={`${b.phieu} phiếu · ${b.dong} dòng`} />
    </div>
  )
}

function Stat({ head, value, sub, tone }: { head: string; value: string; sub: string; tone: 'blue' | 'green' }) {
  return (
    <div className={`min-w-[220px] flex-1 rounded-[9px] border border-navy-200 border-b-[3px] bg-white px-3 py-1.5 ${tone === 'blue' ? 'border-b-blue-600' : 'border-b-green-600'}`}>
      <div className="text-[10.5px] font-bold uppercase text-ink-mute">{head}</div>
      <div className="text-[20px] font-extrabold leading-tight tabular-nums text-navy-900">{value}</div>
      <div className="text-[11px] text-ink-mute">{sub}</div>
    </div>
  )
}

/** Items whose stock is below the minimum – what still needs to be proposed for purchase. */

export function DailyWorkSummary({ version, who = '', whoName = '' }: { version: number; who?: string; whoName?: string }) {
  const [n, setN] = useState<{ d: number; m: number; y: number } | null>(null)
  const now = new Date()
  useEffect(() => {
    if (!version) return // the list page bumps version after its first load
    let alive = true
    const vn = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Ho_Chi_Minh' }).format(new Date())
    const y = vn.slice(0, 4), m = vn.slice(5, 7), last = new Date(+y, +m, 0).getDate()
    const p = who ? `&id_nguoi_thuc_hien=${encodeURIComponent(who)}` : ''
    const total = (from: string, to: string) => { const u = `/api/cong_viec_hang_ngay?dateField=ngay&from=${from}&to=${to}&pageSize=1${p}`; return dedupeGet(u, () => fetch(u).then((r) => r.json())).then((j) => Number(j.total ?? 0)) }
    Promise.all([total(vn, vn), total(`${y}-${m}-01`, `${y}-${m}-${last}`), total(`${y}-01-01`, `${y}-12-31`)]).then(([d, mo, yr]) => { if (alive) setN({ d, m: mo, y: yr }) }).catch(() => {})
    return () => { alive = false }
  }, [version, who])
  if (!n) return null
  return (
    <div className="ml-auto hidden text-right text-[12.5px] leading-snug text-ink-soft lg:block print:hidden">
      <div><b className="text-navy-900">{who ? (whoName === '__NULL__' ? 'Chưa phân công' : whoName) : 'Tất cả nhân viên'}</b> · Hôm nay đã thực hiện <b className="text-[17px] text-navy-900">{n.d}</b> công việc</div>
      <div>Trong tháng {now.getMonth() + 1} <b className="text-[15px] text-navy-900">{n.m}</b> công việc · Trong năm {now.getFullYear()} <b className="text-[15px] text-navy-900">{n.y}</b> công việc</div>
    </div>
  )
}
