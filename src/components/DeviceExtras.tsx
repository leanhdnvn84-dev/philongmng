'use client'
import { useEffect, useState } from 'react'
import QRCode from 'qrcode'
import { Wrench, QrCode, Printer, X } from 'lucide-react'
import Portal from '@/components/Portal'

/** Device view: maintenance done on this machine (with cost) + its QR label. */
type Log = { id: string; ngay_thuc_hien: string; noi_dung_thuc_hien: string | null; ket_qua: string | null; chi_phi: number | null; id_nguoi_thuc_hien: string | null; don_vi_thuc_hien: string | null }
const money = (n: number) => new Intl.NumberFormat('vi-VN').format(n)
const dmy = (iso: string) => `${iso.slice(8, 10)}/${iso.slice(5, 7)}/${iso.slice(0, 4)}`

export function DeviceMaintenance({ id, names }: { id: string; names: Map<string, string> }) {
  const [logs, setLogs] = useState<Log[] | null>(null)
  useEffect(() => {
    let dead = false; setLogs(null)
    fetch(`/api/nhat_ky_bao_tri?id_thiet_bi=${encodeURIComponent(id)}&pageSize=300`).then((r) => r.json()).then((j) => !dead && setLogs(j?.success ? j.data : [])).catch(() => !dead && setLogs([]))
    return () => { dead = true }
  }, [id])
  const total = (logs ?? []).reduce((s, l) => s + (Number(l.chi_phi) || 0), 0)
  return (
    <div className="mt-5 overflow-hidden rounded-xl border border-navy-200">
      <div className="flex flex-wrap items-center gap-2 bg-navy-50 px-3 py-2.5 text-[13.5px] font-extrabold text-navy-900">
        <Wrench className="h-4 w-4 text-navy-500" />Lịch sử bảo trì máy này{logs ? ` (${logs.length})` : ''}
        {total > 0 && <span className="ml-auto text-[13px] font-bold text-navy-800">Tổng chi phí: <b className="text-[#c4121f]">{money(total)} đ</b></span>}
      </div>
      {!logs && <p className="px-3 py-4 text-center text-[13px] text-ink-mute">Đang tải…</p>}
      {logs && !logs.length && <p className="px-3 py-4 text-center text-[13px] text-ink-mute">Chưa có lần bảo trì nào gắn với máy này. Khi ghi nhận bảo trì, chọn ô “Thiết bị” để lưu vào đây.</p>}
      {logs && logs.length > 0 && (
        <table className="w-full table-fixed text-[13px]">
          <thead><tr className="bg-white text-left text-[12px] font-extrabold text-ink-mute"><th className="w-[92px] px-3 py-1.5">Ngày</th><th className="px-3 py-1.5">Nội dung</th><th className="hidden w-[22%] px-3 py-1.5 sm:table-cell">Người / đơn vị</th><th className="w-[100px] px-3 py-1.5 text-right">Chi phí</th></tr></thead>
          <tbody>
            {logs.map((l) => (
              <tr key={l.id} className="border-t border-navy-100 align-top">
                <td className="px-3 py-1.5 tabular-nums">{dmy(l.ngay_thuc_hien)}</td>
                <td className="px-3 py-1.5"><span className="line-clamp-2">{l.noi_dung_thuc_hien || '—'}</span>{l.ket_qua && <span className="text-[12px] text-ink-mute">{l.ket_qua}</span>}</td>
                <td className="hidden truncate px-3 py-1.5 sm:table-cell">{[names.get(l.id_nguoi_thuc_hien ?? '') ?? l.id_nguoi_thuc_hien, l.don_vi_thuc_hien].filter(Boolean).join(' · ') || '—'}</td>
                <td className="px-3 py-1.5 text-right tabular-nums">{l.chi_phi ? money(Number(l.chi_phi)) : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

export type QrDevice = { id: string; ten_thiet_bi: string; vi_tri?: string }
const link = (id: string) => `${window.location.origin}/thiet_bi?xem=${encodeURIComponent(id)}`
const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]!))

/** Print one sheet of QR labels (6.3 × 3.8 cm, 3 per row on A4) for the given devices. */
export async function printQrLabels(list: QrDevice[]) {
  const w = window.open('', '_blank'); if (!w) return
  w.document.write('<p style="font-family:sans-serif">Đang tạo nhãn…</p>')
  const svgs = await Promise.all(list.map((d) => QRCode.toString(link(d.id), { type: 'svg', margin: 0, errorCorrectionLevel: 'M' })))
  const cells = list.map((d, i) => `<div class="l"><div class="q">${svgs[i]}</div><div class="t"><b>${esc(d.id)}</b><span>${esc(d.ten_thiet_bi)}</span>${d.vi_tri ? `<i>${esc(d.vi_tri)}</i>` : ''}<em>PHILONG BUILDING</em></div></div>`).join('')
  w.document.open()
  w.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>Nhãn QR thiết bị</title><style>
    @page{size:A4;margin:8mm} body{margin:0;font-family:Arial,sans-serif} .g{display:grid;grid-template-columns:repeat(3,63mm);gap:2mm}
    .l{height:38mm;border:0.3mm dashed #999;border-radius:2mm;display:flex;gap:2mm;padding:2mm;box-sizing:border-box;break-inside:avoid}
    .q{width:32mm;height:32mm;flex:none}.q svg{width:100%;height:100%}.t{display:flex;flex-direction:column;min-width:0;font-size:8.5pt;line-height:1.25}
    .t b{font-size:11pt;color:#b4121f}.t span{font-weight:bold;overflow:hidden;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical}.t i{color:#444;font-style:normal;margin-top:1mm}.t em{margin-top:auto;font-style:normal;font-size:6.5pt;color:#666}
  </style></head><body><div class="g">${cells}</div><script>setTimeout(function(){window.print()},300)<\/script></body></html>`)
  w.document.close()
}

export function QrDialog({ device, onClose }: { device: QrDevice; onClose: () => void }) {
  const [svg, setSvg] = useState('')
  useEffect(() => { QRCode.toString(link(device.id), { type: 'svg', margin: 1, errorCorrectionLevel: 'M' }).then(setSvg).catch(() => setSvg('')) }, [device.id])
  useEffect(() => { const k = (e: KeyboardEvent) => e.key === 'Escape' && onClose(); window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k) }, [onClose])
  return (
    <Portal>
      <div className="fixed inset-0 z-[97] grid place-items-center bg-navy-950/55 p-4" role="dialog" aria-modal="true" aria-label="Mã QR thiết bị" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
        <div className="w-full max-w-[360px] rounded-2xl bg-white p-5 text-center shadow-pop">
          <div className="flex items-center justify-between"><span className="text-[15px] font-extrabold text-navy-900"><QrCode className="mr-1 inline h-4 w-4" />Mã QR thiết bị</span>
            <button className="btn-ghost h-8 w-8 px-0" onClick={onClose} aria-label="Đóng"><X className="h-5 w-5" /></button></div>
          <div className="mx-auto my-3 h-[220px] w-[220px] [&_svg]:h-full [&_svg]:w-full" dangerouslySetInnerHTML={{ __html: svg }} />
          <div className="text-[15px] font-black text-[#c4121f]">{device.id}</div>
          <div className="text-[14px] font-bold text-navy-900">{device.ten_thiet_bi}</div>
          {device.vi_tri && <div className="text-[12.5px] text-ink-soft">{device.vi_tri}</div>}
          <p className="mt-3 text-[12px] text-ink-mute">Quét bằng camera điện thoại để mở đúng thiết bị (cần đăng nhập).</p>
          <button className="btn-primary mt-3 w-full" onClick={() => printQrLabels([device])}><Printer className="h-4 w-4" />In nhãn</button>
        </div>
      </div>
    </Portal>
  )
}
