'use client'
import { useEffect, useRef, useState } from 'react'
import { Loader2, Printer, FileDown, ChevronLeft, ChevronRight } from 'lucide-react'
import { CostBars, type ChartRow } from '@/components/CostChart'

/** "Báo cáo tháng": one printable page summing up work, maintenance, proposals, stock, electricity and visitors. */
const money = (n: number) => new Intl.NumberFormat('vi-VN').format(Math.round(n || 0))
const num = (n: number) => new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 1 }).format(n || 0)
const dmy = (iso?: string | null) => (iso ? `${iso.slice(8, 10)}/${iso.slice(5, 7)}/${iso.slice(0, 4)}` : '—')
const nowYm = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Ho_Chi_Minh' }).format(new Date()).slice(0, 7)
const move = (ym: string, n: number) => { const d = new Date(Date.UTC(Number(ym.slice(0, 4)), Number(ym.slice(5, 7)) - 1 + n, 1)); return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}` }

function Box({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="break-inside-avoid rounded-xl border border-navy-200 bg-white p-4"><h2 className="mb-2 text-[13px] font-black uppercase tracking-wide text-[#c4121f]">{title}</h2>{children}</section>
}
function Stat({ label, value, sub, tone = '' }: { label: string; value: string; sub?: string; tone?: string }) {
  return <div className="min-w-0"><div className="text-[12px] font-semibold text-ink-mute">{label}</div><div className={`text-[20px] font-black leading-tight tabular-nums ${tone || 'text-navy-900'}`}>{value}</div>{sub && <div className="text-[11.5px] text-ink-mute">{sub}</div>}</div>
}

export default function MonthReport() {
  const [ym, setYm] = useState(nowYm)
  const [d, setD] = useState<any>(null)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const paper = useRef<HTMLDivElement>(null)
  useEffect(() => {
    let dead = false; setD(null); setErr('')
    fetch(`/api/bao_cao_thang?thang=${ym}`).then((r) => r.json()).then((j) => { if (dead) return; if (j?.success) { setD(j.data); if (j.errors?.length) setErr('Một phần chưa tải được: ' + j.errors[0]) } else setErr(j?.error || 'Không tải được') }).catch(() => !dead && setErr('Mất kết nối'))
    return () => { dead = true }
  }, [ym])
  const label = `Tháng ${Number(ym.slice(5))}/${ym.slice(0, 4)}`

  async function pdf() {
    if (!paper.current) return
    setBusy(true)
    try {
      const [{ default: html2canvas }, { jsPDF }] = await Promise.all([import('html2canvas'), import('jspdf')])
      const c = await html2canvas(paper.current, { scale: 2, backgroundColor: '#ffffff', windowWidth: 1100 })
      const doc = new jsPDF({ unit: 'mm', format: 'a4' }), W = 190, H = (c.height * W) / c.width, pageH = 277
      if (H <= pageH) doc.addImage(c.toDataURL('image/jpeg', 0.92), 'JPEG', 10, 10, W, H)
      else { // long report: slice the image over several pages
        const per = Math.floor((pageH / H) * c.height)
        for (let y = 0, i = 0; y < c.height; y += per, i++) {
          const s = document.createElement('canvas'); s.width = c.width; s.height = Math.min(per, c.height - y)
          s.getContext('2d')!.drawImage(c, 0, y, c.width, s.height, 0, 0, c.width, s.height)
          if (i) doc.addPage(); doc.addImage(s.toDataURL('image/jpeg', 0.92), 'JPEG', 10, 10, W, (s.height * W) / c.width)
        }
      }
      doc.save(`Bao-cao-thang-${ym}.pdf`)
    } finally { setBusy(false) }
  }

  const cv = d?.cong_viec, hn = d?.cvhn, bt = d?.bao_tri, dx = d?.de_xuat, kho = d?.kho, td = d?.tien_dien, kh = d?.khach
  return (
    <div className="flex flex-1 flex-col lg:min-h-0">
      <div className="flex shrink-0 flex-wrap items-center gap-x-4 gap-y-2 border-b border-navy-200 bg-white px-4 py-2 lg:px-5 print:hidden">
        <span className="text-[12.5px] text-ink-mute">PHI LONG / <b className="text-navy-800">Báo cáo tháng</b></span>
        <h1 className="text-[22px] font-black text-navy-900">Báo cáo tháng</h1>
        <div className="flex items-center gap-1.5">
          <button className="btn-secondary h-9 w-9 !px-0" aria-label="Tháng trước" onClick={() => setYm((v) => move(v, -1))}><ChevronLeft className="h-4 w-4" /></button>
          <input type="month" className="input h-9 w-[190px]" value={ym} max={nowYm()} onChange={(e) => e.target.value && setYm(e.target.value)} aria-label="Chọn tháng" />
          <button className="btn-secondary h-9 w-9 !px-0" aria-label="Tháng sau" disabled={ym >= nowYm()} onClick={() => setYm((v) => move(v, 1))}><ChevronRight className="h-4 w-4" /></button>
        </div>
        <div className="ml-auto flex gap-2">
          <button className="btn-secondary h-9" disabled={!d} onClick={() => window.print()}><Printer className="h-4 w-4" />In</button>
          <button className="btn-primary h-9" disabled={!d || busy} onClick={pdf}>{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileDown className="h-4 w-4" />}Tải PDF</button>
        </div>
      </div>
      <div className="relative px-4 py-4 lg:min-h-0 lg:flex-1 lg:overflow-y-auto lg:px-5 print:overflow-visible print:p-0">
        {err && <p role="alert" className="mx-auto mb-3 max-w-[1100px] rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[13px] font-semibold text-red-800 print:hidden">{err}</p>}
        {!d && !err && <p className="py-16 text-center text-ink-mute"><Loader2 className="mr-2 inline h-4 w-4 animate-spin" />Đang tổng hợp…</p>}
        {d && (
          <div ref={paper} className="mx-auto max-w-[1100px] space-y-3 bg-[#f6f8fc] p-1 print:max-w-none print:bg-white">
            <div className="flex items-end justify-between rounded-xl bg-[#0b1b40] px-5 py-4 text-white">
              <div><div className="text-[12px] font-bold uppercase tracking-wide text-[#c3cde3]">PHILONG BUILDING · Báo cáo vận hành</div><div className="text-[24px] font-black">{label}</div></div>
              <div className="text-right text-[12px] text-[#c3cde3]">Lập ngày {dmy(new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Ho_Chi_Minh' }).format(new Date()))}</div>
            </div>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 print:grid-cols-2">
              {cv && <Box title="Công việc">
                <div className="grid grid-cols-3 gap-3"><Stat label="Giao trong tháng" value={num(cv.giao)} /><Stat label="Hoàn thành trong tháng" value={num(cv.xong)} tone="text-green-700" /><Stat label="Đang quá hạn" value={num(cv.qua_han)} tone={cv.qua_han ? 'text-[#c4121f]' : ''} /></div>
                {cv.qua_han_ds?.length > 0 && <ul className="mt-2 space-y-0.5 text-[12.5px] text-ink-soft">{cv.qua_han_ds.map((r: any) => <li key={r.id} className="truncate"><b className="text-navy-800">{r.id}</b> · {r.noi_dung} · hạn {dmy(r.deadline)}</li>)}</ul>}
              </Box>}
              {hn && <Box title="Công việc hằng ngày">
                <div className="grid grid-cols-2 gap-3"><Stat label="Số việc" value={num(hn.tong)} /><Stat label="Đã hoàn thành" value={num(hn.xong)} sub={hn.tong ? `${Math.round((hn.xong / hn.tong) * 100)}%` : ''} tone="text-green-700" /></div>
                {hn.theo_nguoi?.length > 0 && <ul className="mt-2 grid grid-cols-2 gap-x-4 text-[12.5px] text-ink-soft">{hn.theo_nguoi.map((r: any) => <li key={r.ten} className="flex justify-between gap-2"><span className="truncate">{r.ten}</span><b className="tabular-nums text-navy-800">{r.so}</b></li>)}</ul>}
              </Box>}
              {bt && <Box title="Bảo trì">
                <div className="grid grid-cols-3 gap-3"><Stat label="Lần bảo trì" value={num(bt.lan)} /><Stat label="Chi phí" value={`${money(bt.chi_phi)} đ`} /><Stat label="Lịch đang trễ" value={num(bt.tre_lich)} tone={bt.tre_lich ? 'text-[#c4121f]' : ''} /></div>
                {bt.theo_hang_muc?.length > 0 && <ul className="mt-2 grid grid-cols-2 gap-x-4 text-[12.5px] text-ink-soft">{bt.theo_hang_muc.map((r: any) => <li key={r.ten} className="flex justify-between gap-2"><span className="truncate">{r.ten}</span><b className="tabular-nums text-navy-800">{r.so}</b></li>)}</ul>}
              </Box>}
              {dx && <Box title="Đề xuất">
                <div className="grid grid-cols-3 gap-3"><Stat label="Lập trong tháng" value={num(dx.lap)} /><Stat label="Duyệt trong tháng" value={num(dx.duyet_so)} /><Stat label="Giá trị đã duyệt" value={`${money(dx.duyet_tien)} đ`} tone="text-[#c4121f]" /></div>
                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-0.5 text-[12.5px] text-ink-soft">{Object.entries(dx.trang_thai ?? {}).map(([k, v]) => <span key={k}>{k}: <b className="text-navy-800">{String(v)}</b></span>)}</div>
                {Object.keys(dx.theo_loai ?? {}).length > 0 && <div className="mt-1 flex flex-wrap gap-x-4 text-[12.5px] text-ink-soft">{Object.entries(dx.theo_loai).map(([k, v]) => <span key={k}>{k}: <b className="text-navy-800">{money(Number(v))} đ</b></span>)}</div>}
              </Box>}
              {kho && <Box title="Kho vật tư">
                <div className="grid grid-cols-3 gap-3"><Stat label="Phiếu nhập" value={num(kho.nhap_phieu)} /><Stat label="Giá trị nhập" value={`${money(kho.nhap_tien)} đ`} /><Stat label="Phiếu xuất" value={num(kho.xuat_phieu)} /></div>
              </Box>}
              {td && <Box title="Tiền điện">
                <div className="grid grid-cols-3 gap-3"><Stat label="Điện tiêu thụ" value={`${num(td.kwh)} kWh`} sub={`${td.hoa_don} hoá đơn · ${td.da_chot ? 'đã chốt' : 'chưa chốt'}`} /><Stat label="Phải thu" value={`${money(td.tong)} đ`} /><Stat label="Đã thu" value={`${money(td.da_thu)} đ`} sub={td.tong ? `còn ${money(Math.max(0, td.tong - td.da_thu))} đ` : ''} tone="text-green-700" /></div>
              </Box>}
              {kh && <Box title="Khách ra vào"><Stat label="Lượt khách trong tháng" value={num(kh.luot)} /></Box>}
            </div>
            <Box title="Chi phí 12 tháng (đề xuất đã duyệt và chi phí bảo trì)"><CostBars data={d.chart as ChartRow[]} height={150} /></Box>
          </div>
        )}
      </div>
    </div>
  )
}
