'use client'
// V191 extras on the proposal page: "Thống kê riêng" strip (month / year totals) and the "Vật tư thiếu" list.
import { useEffect, useMemo, useState } from 'react'
import { X } from 'lucide-react'
import Portal from '@/components/Portal'

const vnd = (n: number) => `${new Intl.NumberFormat('vi-VN').format(Math.round(n))} đ`
const getJson = (u: string) => fetch(u).then((r) => r.json()).then((j) => (j.success ? (j.data as any[]) : []))

export function ProposalStats({ kind, title, version }: { kind: string; title: string; version: number }) {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [rows, setRows] = useState<any[]>([])
  useEffect(() => {
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
export function ShortageDialog({ onClose }: { onClose: () => void }) {
  const [rows, setRows] = useState<any[] | null>(null)
  useEffect(() => {
    getJson('/api/vat_tu?pageSize=2000').then(setRows).catch(() => setRows([]))
    const k = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', k)
    return () => window.removeEventListener('keydown', k)
  }, [onClose])
  const list = useMemo(() => (rows ?? [])
    .filter((r) => Number(r.ton_toi_thieu || 0) > 0 && Number(r.ton_hien_tai || 0) < Number(r.ton_toi_thieu))
    .map((r) => ({ ...r, thieu: Number(r.ton_toi_thieu) - Number(r.ton_hien_tai || 0) }))
    .sort((a, b) => b.thieu - a.thieu), [rows])
  return (
    <Portal>
      <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/45 p-3" role="dialog" aria-modal="true" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
        <div className="flex max-h-[88vh] w-full max-w-[860px] lg:w-[80vw] lg:max-w-none flex-col overflow-hidden rounded-xl bg-white shadow-2xl">
          <div className="flex items-center justify-between border-b border-navy-200 bg-navy-50 px-4 py-3">
            <div className="text-[16px] font-extrabold text-navy-900">Vật tư thiếu <span className="ml-1 text-[13px] font-semibold text-ink-mute">(tồn dưới mức tối thiểu)</span></div>
            <button className="btn-ghost btn-sm" onClick={onClose} aria-label="Đóng"><X className="h-4 w-4" /></button>
          </div>
          <div className="min-h-0 flex-1 overflow-auto">
            {rows === null ? <div className="p-6 text-center text-ink-mute">Đang tải…</div> : list.length === 0 ? (
              <div className="p-6 text-center text-ink-mute">Không có vật tư nào dưới mức tồn tối thiểu. (Muốn theo dõi, nhập “Tồn tối thiểu” cho vật tư trong Kho vật tư.)</div>
            ) : (
              <table className="w-full text-[13.5px]">
                <thead className="sticky top-0 bg-white text-left text-[12px] uppercase text-ink-mute shadow-[0_1px_0_#d5deee]">
                  <tr><th className="px-3 py-2">Mã</th><th className="px-3 py-2">Tên vật tư</th><th className="px-3 py-2">ĐVT</th>
                    <th className="px-3 py-2 text-right">Tồn</th><th className="px-3 py-2 text-right">Tối thiểu</th><th className="px-3 py-2 text-right">Cần mua</th></tr>
                </thead>
                <tbody>
                  {list.map((r) => (
                    <tr key={r.id} className="border-t border-navy-100">
                      <td className="px-3 py-2 font-bold">{r.id}</td><td className="px-3 py-2">{r.ten_vat_tu}</td><td className="px-3 py-2">{r.dvt ?? '—'}</td>
                      <td className="px-3 py-2 text-right tabular-nums">{r.ton_hien_tai ?? 0}</td>
                      <td className="px-3 py-2 text-right tabular-nums">{r.ton_toi_thieu}</td>
                      <td className="px-3 py-2 text-right font-extrabold tabular-nums text-red-600">{r.thieu}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          <div className="border-t border-navy-200 px-4 py-2 text-[12.5px] text-ink-soft">{rows === null ? '' : `${list.length} vật tư thiếu`}</div>
        </div>
      </div>
    </Portal>
  )
}
