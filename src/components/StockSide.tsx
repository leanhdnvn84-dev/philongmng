'use client'
// V191 "Bộ lọc vật tư" box + "Thống kê đang hiển thị" for the stock page.
import { useEffect, useMemo, useState } from 'react'
import { Search } from 'lucide-react'

const getJson = (u: string) => fetch(u).then((r) => r.json()).then((j) => (j.success ? (j.data as any[]) : []))
const n0 = (n: number) => new Intl.NumberFormat('vi-VN').format(n)

export default function StockSide({ params, version, pf, setPf, search, setSearch }: {
  params: string; version: number; pf: Record<string, string>; setPf: (f: (o: Record<string, string>) => Record<string, string>) => void
  search: string; setSearch: (s: string) => void
}) {
  const [all, setAll] = useState<any[]>([])
  const [shown, setShown] = useState<any[]>([])
  useEffect(() => { getJson('/api/vat_tu?pageSize=2000').then(setAll).catch(() => {}) }, [version])
  useEffect(() => {
    let alive = true
    getJson(`/api/vat_tu?${params}&pageSize=2000`).then((d) => { if (alive) setShown(d) }).catch(() => {})
    return () => { alive = false }
  }, [params, version])
  const uniq = (k: string) => Array.from(new Set(all.map((r) => String(r[k] ?? '').trim()).filter(Boolean))).sort((a, b) => a.localeCompare(b, 'vi'))
  const nhom = useMemo(() => uniq('nhom'), [all]) // eslint-disable-line react-hooks/exhaustive-deps
  const dvt = useMemo(() => uniq('dvt'), [all]) // eslint-disable-line react-hooks/exhaustive-deps
  const sum = (k: string) => shown.reduce((s, r) => s + (Number(r[k]) || 0), 0)
  const low = shown.filter((r) => Number(r.ton_hien_tai) > 0 && Number(r.ton_toi_thieu) > 0 && Number(r.ton_hien_tai) <= Number(r.ton_toi_thieu)).length
  const out = shown.filter((r) => !(Number(r.ton_hien_tai) > 0)).length
  const active = !!(pf.nhom || pf.dvt || search)
  const Sel = ({ k, label, opts, all: allLabel }: { k: string; label: string; opts: string[]; all: string }) => (
    <label className="text-[11.5px] font-bold text-ink-mute">{label}
      <select className="input mt-0.5 !h-8 !py-0 !text-[13px]" value={pf[k] ?? ''} onChange={(e) => setPf((o) => ({ ...o, [k]: e.target.value }))}>
        <option value="">{allLabel}</option>{opts.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </label>
  )
  const T = ({ label, value, tone }: { label: string; value: number; tone?: 'amber' | 'red' }) => (
    <div className="rounded-lg border border-navy-200 bg-white px-2 py-1.5 text-center">
      <div className="text-[10.5px] font-semibold text-ink-mute">{label}</div>
      <div className={`text-[17px] font-extrabold tabular-nums ${tone === 'red' && value ? 'text-red-600' : tone === 'amber' && value ? 'text-amber-600' : 'text-navy-900'}`}>{n0(value)}</div>
    </div>
  )
  return (
    <>
      <div className="card shrink-0 p-3">
        <div className="text-[12.5px] font-extrabold uppercase tracking-wide text-navy-900">Bộ lọc vật tư</div>
        <div className="mb-2 text-[11px] text-ink-mute">Chọn một hoặc nhiều điều kiện</div>
        <label className="text-[11.5px] font-bold text-ink-mute">Tìm tên vật tư
          <div className="relative mt-0.5">
            <Search className="pointer-events-none absolute left-2 top-2 h-4 w-4 text-ink-mute" />
            <input className="input !h-8 !py-0 !pl-8 !text-[13px]" placeholder="Nhập tên vật tư cần tìm…" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </label>
        <div className="mt-2 flex flex-col gap-2">
          <Sel k="nhom" label="Nhóm" opts={nhom} all="Tất cả nhóm" />
          <Sel k="dvt" label="Đơn vị tính" opts={dvt} all="Tất cả đơn vị tính" />
        </div>
        <button className="btn-ghost btn-sm mt-2 w-full !h-8" disabled={!active} onClick={() => { setPf((o) => ({ ...o, nhom: '', dvt: '' })); setSearch('') }}>Xóa bộ lọc</button>
      </div>
      <div className="card shrink-0 p-3">
        <div className="text-[12.5px] font-extrabold uppercase tracking-wide text-navy-900">Thống kê đang hiển thị</div>
        <div className="mb-2 text-[11px] text-ink-mute">Theo bộ lọc hiện tại</div>
        <div className="grid grid-cols-2 gap-1.5">
          <T label="Mặt hàng" value={shown.length} /><T label="Tổng tồn" value={sum('ton_hien_tai')} />
          <T label="Tổng nhập" value={sum('tong_nhap')} /><T label="Tổng xuất" value={sum('tong_xuat')} />
          <T label="Sắp hết" value={low} tone="amber" /><T label="Hết hàng" value={out} tone="red" />
        </div>
      </div>
    </>
  )
}
