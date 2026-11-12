'use client'
// V191 "Bộ lọc vật tư" box + "Thống kê đang hiển thị" for the stock page.
import { dedupeGet } from '@/lib/getDedupe'
import { useEffect, useMemo, useState } from 'react'
import { Search } from 'lucide-react'

const getJson = (u: string) => dedupeGet(u, () => fetch(u).then((r) => r.json())).then((j) => (j.success ? (j.data as any[]) : []))
const n0 = (n: number) => new Intl.NumberFormat('vi-VN').format(n)

export default function StockSide({ params, version, pf, setPf, search, setSearch }: {
  params: string; version: number; pf: Record<string, string>; setPf: (f: (o: Record<string, string>) => Record<string, string>) => void
  search: string; setSearch: (s: string) => void
}) {
  const [all, setAll] = useState<any[]>([])
  const [shown, setShown] = useState<any[]>([])
  const [moves, setMoves] = useState<any[]>([])
  useEffect(() => { getJson('/api/vat_tu?pageSize=2000').then(setAll).catch(() => {}); getJson('/api/nhap_xuat_kho?loai_giao_dich=NHAP&pageSize=2000').then(setMoves).catch(() => {}) }, [version])
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
  const ids = new Set(shown.map((r) => r.id))
  const value = moves.filter((m) => ids.has(m.id_vat_tu)).reduce((s, m) => s + (Number(m.thanh_tien) || 0), 0)
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
        <div className="mt-1.5 rounded-lg border border-navy-200 bg-white px-2 py-1.5 text-center"><div className="text-[10.5px] font-semibold text-ink-mute">Giá trị đã nhập (đ)</div><div className="text-[16px] font-extrabold tabular-nums text-navy-900">{n0(Math.round(value))}</div></div>
      </div>
    </>
  )
}

/** "Lịch sử nhập từng đợt" inside the item popup: one row per stock-in with unit, quantity, price and amount. */
export function StockBatches({ id, dvt, version = 0 }: { id: string; dvt?: string | null; version?: number }) {
  const [rows, setRows] = useState<any[] | null>(null)
  useEffect(() => {
    let alive = true; setRows(null)
    getJson(`/api/nhap_xuat_kho?id_vat_tu=${encodeURIComponent(id)}&loai_giao_dich=NHAP&pageSize=500`).then((d) => { if (alive) setRows(d) }).catch(() => alive && setRows([]))
    return () => { alive = false }
  }, [id, version])
  const dmy = (s?: string | null) => (s ? `${s.slice(8, 10)}/${s.slice(5, 7)}/${s.slice(0, 4)}` : '—')
  const list = [...(rows ?? [])].sort((a, b) => String(b.ngay ?? '').localeCompare(String(a.ngay ?? '')) || String(b.id).localeCompare(String(a.id)))
  const qty = list.reduce((s, r) => s + (Number(r.so_luong) || 0), 0), amount = list.reduce((s, r) => s + (Number(r.thanh_tien) || 0), 0)
  const th = 'th3d px-2.5 py-2.5 text-[12.5px] font-extrabold whitespace-nowrap', td = 'px-2.5 py-2 border-b border-navy-200/70'
  return (
    <div>
      <h3 className="mb-2 text-[15px] font-extrabold text-navy-900">Lịch sử nhập từng đợt</h3>
      <div className="overflow-x-auto rounded-[14px] border border-navy-200">
        <table className="w-full min-w-[640px] border-separate border-spacing-0 text-[13px]">
          <thead><tr>
            <th className={`${th} text-left`}>Ngày</th><th className={`${th} text-center`}>ĐVT</th><th className={`${th} text-right`}>Số lượng</th>
            <th className={`${th} text-right`}>Đơn giá</th><th className={`${th} text-right`}>Thành tiền</th><th className={`${th} text-left`}>Nội dung</th><th className={`${th} text-left`}>Chứng từ</th>
          </tr></thead>
          <tbody>
            {rows === null ? <tr><td colSpan={7} className="px-3 py-6 text-center text-ink-mute">Đang tải…</td></tr>
              : list.length === 0 ? <tr><td colSpan={7} className="px-3 py-6 text-center text-ink-mute">Chưa có lần nhập nào.</td></tr>
              : list.map((r) => (
                <tr key={r.id}>
                  <td className={`${td} whitespace-nowrap tabular-nums`}>{dmy(r.ngay)}</td>
                  <td className={`${td} text-center`}>{dvt || '—'}</td>
                  <td className={`${td} text-right font-bold tabular-nums`}>{n0(Number(r.so_luong) || 0)}</td>
                  <td className={`${td} text-right tabular-nums`}>{Number(r.don_gia) ? n0(Number(r.don_gia)) : <span className="text-navy-300">chưa có</span>}</td>
                  <td className={`${td} text-right font-bold tabular-nums`}>{Number(r.thanh_tien) ? n0(Number(r.thanh_tien)) : <span className="text-navy-300">—</span>}</td>
                  <td className={`${td} max-w-[280px] truncate`} title={r.noi_dung ?? ''}>{r.noi_dung || '—'}</td>
                  <td className={`${td} whitespace-nowrap`}>{r.id_chung_tu || '—'}</td>
                </tr>
              ))}
          </tbody>
          {list.length > 0 && (
            <tfoot><tr className="bg-navy-50 font-extrabold text-navy-900">
              <td className="px-2.5 py-2.5" colSpan={2}>Tổng {list.length} đợt</td>
              <td className="px-2.5 py-2.5 text-right tabular-nums">{n0(qty)}</td><td />
              <td className="px-2.5 py-2.5 text-right tabular-nums">{n0(amount)}</td><td colSpan={2} />
            </tr></tfoot>
          )}
        </table>
      </div>
    </div>
  )
}
