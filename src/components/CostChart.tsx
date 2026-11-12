'use client'
import { useEffect, useState } from 'react'

/** 12-month stacked bars of spending: approved proposals by kind + maintenance cost. */
export type ChartRow = { thang: string; parts: Record<string, number> }
const COLORS: Record<string, string> = { 'Mua vật tư': '#1d4ed8', 'Mua thiết bị': '#0f766e', 'Bảo trì': '#d97706', 'Thanh lý': '#7c3aed', 'Chi phí bảo trì': '#e11d2e' }
const color = (k: string) => COLORS[k] ?? '#64748b'
const short = (n: number) => (n >= 1e9 ? `${(n / 1e9).toFixed(1)} tỷ` : n >= 1e6 ? `${Math.round(n / 1e6)} tr` : n >= 1e3 ? `${Math.round(n / 1e3)} k` : String(n))
const money = (n: number) => new Intl.NumberFormat('vi-VN').format(Math.round(n))

export function CostBars({ data, height = 150 }: { data: ChartRow[]; height?: number }) {
  const keys = Array.from(new Set(data.flatMap((d) => Object.keys(d.parts))))
  const totals = data.map((d) => Object.values(d.parts).reduce((a, b) => a + b, 0))
  const max = Math.max(1, ...totals), sum = totals.reduce((a, b) => a + b, 0)
  return (
    <div>
      <div className="flex items-end gap-1.5" style={{ height }} role="img" aria-label={`Chi phí 12 tháng, tổng ${money(sum)} đồng`}>
        {data.map((d, i) => (
          <div key={d.thang} className="group relative flex h-full min-w-0 flex-1 flex-col justify-end">
            <div className="flex w-full flex-col-reverse overflow-hidden rounded-t-md" style={{ height: `${(totals[i] / max) * 100}%`, minHeight: totals[i] ? 2 : 0 }}>
              {keys.map((k) => d.parts[k] ? <span key={k} style={{ height: `${(d.parts[k] / totals[i]) * 100}%`, background: color(k) }} /> : null)}
            </div>
            <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1 hidden w-max max-w-[220px] -translate-x-1/2 rounded-lg bg-navy-900 px-2.5 py-1.5 text-[11.5px] text-white shadow-lg group-hover:block">
              <b>Tháng {d.thang.slice(5)}/{d.thang.slice(0, 4)}: {money(totals[i])} đ</b>
              {keys.filter((k) => d.parts[k]).map((k) => <div key={k}>{k}: {money(d.parts[k])}</div>)}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-1 flex gap-1.5 text-center text-[10.5px] text-ink-mute">{data.map((d) => <span key={d.thang} className="min-w-0 flex-1">{Number(d.thang.slice(5))}</span>)}</div>
      <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[11.5px] text-ink-soft">
        {keys.map((k) => <span key={k} className="inline-flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-sm" style={{ background: color(k) }} />{k}</span>)}
        {!keys.length && <span>Chưa có chi phí nào trong 12 tháng.</span>}
      </div>
      <div className="sr-only">{data.map((d, i) => `${d.thang}: ${short(totals[i])}`).join(', ')}</div>
    </div>
  )
}

/** Dashboard card: loads its own data. */
export default function CostChartCard() {
  const [data, setData] = useState<ChartRow[] | null>(null)
  useEffect(() => {
    const t = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Ho_Chi_Minh' }).format(new Date()).slice(0, 7)
    fetch(`/api/bao_cao_thang?thang=${t}&chart=1`).then((r) => r.json()).then((j) => j?.success && setData(j.chart)).catch(() => {})
  }, [])
  if (!data) return null
  const sum = data.reduce((s, d) => s + Object.values(d.parts).reduce((a, b) => a + b, 0), 0)
  return (
    <div className="bento px-5 py-4">
      <div className="flex items-baseline justify-between"><h2 className="text-[14px] font-extrabold text-navy-900">Chi phí 12 tháng</h2><a href="/bao-cao-thang" className="text-[12px] font-bold text-blue-700 hover:underline">Báo cáo tháng →</a></div>
      <div className="mt-0.5 text-[22px] font-black leading-tight tabular-nums text-navy-900">{money(sum)} <span className="text-[12.5px] font-semibold text-ink-mute">đ</span></div>
      <div className="mt-2"><CostBars data={data} height={110} /></div>
    </div>
  )
}
