// "Giấy báo tiền điện": one printable A4 page per invoice (hoá đơn = a tenant's meters of one period),
// laid out like the company's DNTT_Dien form (title left, logo + contact right, cost table, two signatures, print date at the bottom).
import { esc, money, dmy, moneyWords } from '@/lib/proposalDoc'

export interface MeterLine { code: string; name: string; floor: string; old: number | null; now: number | null; kwh: number; price: number; amount: number }
export interface Invoice { id: string; customerId: string; customer: string; address?: string; lines: MeterLine[]; sub: number; vatRate: number; vat: number; total: number; paid?: number }

const kyLabel = (ky: string) => `Tháng ${ky.slice(5, 7)}/${ky.slice(0, 4)}`
/** meter readings and kWh: thousands with ",", up to 3 decimals (same style as the amounts) */
const reading = (n: number | null) => {
  if (n == null || !Number.isFinite(n)) return ''
  const [i, f] = String(Math.round(n * 1000) / 1000).split('.')
  return i.replace(/\B(?=(\d{3})+(?!\d))/g, ',') + (f ? '.' + f : '')
}

const CSS = `
@page{size:A4;margin:12mm 12mm 14mm}
*{box-sizing:border-box}
body{font-family:"Segoe UI","Noto Sans",Arial,sans-serif;color:#111;font-size:10pt;margin:0}
table{border-collapse:collapse;width:100%}
section{position:relative;min-height:268mm;page-break-after:always}
section:last-of-type{page-break-after:auto}
.hd td{border:0;padding:0;vertical-align:bottom}
h1{margin:0 0 4px;font-size:17pt;font-weight:700;letter-spacing:.2px}
.co{text-align:right;font-size:9pt;line-height:1.55}
.co img{display:block;margin:0 0 6px auto}
.to{margin:26px 0 0;font-size:10pt;line-height:1.6}.to small{font-size:9pt}
.grid{margin-top:14px}
.grid td,.grid th{border:.75pt solid #222;padding:6px 6px;font-size:9.5pt;vertical-align:middle}
.grid th{font-weight:700;font-size:8.5pt;text-align:center;white-space:nowrap}
.num{text-align:right}.ctr{text-align:center}.b{font-weight:700}
.per{font-style:italic;font-size:8pt;margin-bottom:3px}
.sum td{padding:9px 6px}
.words td{font-style:italic;padding:10px 12px}
.sign{margin-top:22px}.sign td{border:0;font-weight:700;font-size:10pt;padding:0 8px;vertical-align:top}
.date{position:absolute;right:0;bottom:0;font-size:9pt}
`

function page(inv: Invoice, ky: string, from: string | null, to: string | null, printed: string, logo: string) {
  const period = from && to ? `Tiêu thụ điện năng từ ${dmy(from)} đến ${dmy(to)}`
    : to ? `Tiêu thụ điện năng ${kyLabel(ky).toLowerCase()} (đến ${dmy(to)})` : `Tiêu thụ điện năng ${kyLabel(ky).toLowerCase()}`
  const rows = inv.lines.map((l, i) => {
    const where = [l.floor, l.name && l.name !== l.floor ? l.name : ''].filter(Boolean).join(' · ') || l.code
    return `<tr><td class="ctr">${i + 1}</td><td><div class="per">${esc(period)}</div>${esc(where)}</td>`
      + `<td class="num">${reading(l.now)}</td><td class="num">${reading(l.old)}</td><td class="num b">${l.now == null ? '' : reading(l.kwh)}</td>`
      + `<td class="num">${money(l.price)}</td><td class="num b">${l.now == null ? '' : money(l.amount)}</td></tr>`
  }).join('')
  const paid = inv.paid && inv.paid > 0 ? `
    <tr class="sum"><td class="num" colspan="6">Đã thanh toán</td><td class="num">${money(inv.paid)}</td></tr>
    <tr class="sum"><td class="num" colspan="6">Còn phải thanh toán</td><td class="num b">${money(Math.max(0, inv.total - inv.paid)) || '0'}</td></tr>` : ''
  return `<section>
  <table class="hd"><tr><td><h1>GIẤY BÁO TIỀN ĐIỆN</h1></td>
    <td class="co" style="width:52%">${logo}52 Nguyễn Văn Linh, Đà Nẵng<br>Tel : 3888000&nbsp;&nbsp;&nbsp;Email : philong@philong.com.vn</td></tr></table>
  <div class="to">Kính gửi: <b>${esc(inv.customer)}</b>${inv.address ? `<br><small>Địa chỉ: ${esc(inv.address)}</small>` : ''}</div>
  <table class="grid">
    <tr><th style="width:5%">STT</th><th>Nội dung chi phí</th><th style="width:10%">Chỉ số mới</th><th style="width:10%">Chỉ số cũ</th><th style="width:10%">Điện năng<br>tiêu thụ</th><th style="width:10%">Đơn giá</th><th style="width:13%">Thành tiền</th></tr>
    ${rows}
    <tr class="sum"><td class="num" colspan="6">Thuế GTGT ${Math.round(inv.vatRate * 100)}%</td><td class="num b">${money(inv.vat) || '0'}</td></tr>
    <tr class="sum"><td class="num" colspan="6" style="font-size:10pt">Tổng cộng tiền thanh toán</td><td class="num b" style="font-size:10pt">${money(inv.total) || '0'}</td></tr>${paid}
    <tr class="words"><td colspan="7">Bằng chữ : ${esc(moneyWords(inv.total))}</td></tr>
  </table>
  <table class="sign"><tr><td>Đại diện công ty Phi Long</td><td style="text-align:right;padding-right:60px">Xác nhận của Khách Hàng</td></tr></table>
  <div class="date">${esc(dmy(printed))}</div></section>`
}

/** `from` = first day of the period (day after the previous close), `to` = close date; both optional. */
export function giayBaoHtml(invoices: Invoice[], ky: string, closeDate: string | null, origin = '', from: string | null = null) {
  const logo = origin ? `<img src="${origin}/brand/philong-logo.png" alt="Phi Long Technology" width="210" height="65" style="width:210px;height:65px">` : '<b style="color:#d71920;font-size:16pt;display:block;margin-bottom:6px">Phi Long TECHNOLOGY</b>'
  const printed = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Ho_Chi_Minh' })
  const title = invoices.length === 1 ? `Giấy báo tiền điện ${kyLabel(ky)} - ${invoices[0].customer}` : `Giấy báo tiền điện ${kyLabel(ky)}`
  return `<!doctype html><html lang="vi"><head><meta charset="utf-8"><title>${esc(title)}</title><style>${CSS}</style></head><body>${invoices.map((i) => page(i, ky, from, closeDate, printed, logo)).join('')}</body></html>`
}
