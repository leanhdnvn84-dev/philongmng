// "Giấy báo tiền điện": one printable page per invoice (hoá đơn = a tenant's meters of one period).
import { COMPANY, CSS, PRINT_CSS, esc, money, dmy, moneyWords } from '@/lib/proposalDoc'

export interface MeterLine { code: string; name: string; floor: string; old: number | null; now: number | null; kwh: number; price: number; amount: number }
export interface Invoice { id: string; customerId: string; customer: string; lines: MeterLine[]; sub: number; vatRate: number; vat: number; total: number }

const dec = (n: number | null) => (n == null ? '' : String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.'))
const kyLabel = (ky: string) => `Tháng ${ky.slice(5, 7)}/${ky.slice(0, 4)}`

function page(inv: Invoice, ky: string, closeDate: string | null, logo: string) {
  const rows = inv.lines.map((l, i) => `<tr><td class="ctr">${i + 1}</td><td>${esc([l.floor, l.name].filter(Boolean).join(' · '))}<br><span style="font-size:8.5pt;color:#555">${esc(l.code)}</span></td><td class="num">${dec(l.old)}</td><td class="num">${dec(l.now)}</td><td class="num">${l.now == null ? '' : dec(l.kwh)}</td><td class="num">${money(l.price)}</td><td class="num">${l.now == null ? '' : money(l.amount)}</td></tr>`).join('')
  const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Ho_Chi_Minh' })
  const d = (closeDate || today)
  return `<section style="page-break-after:always">
  <table class="hd" width="100%"><tr><td width="60%" style="width:60%;vertical-align:bottom"><h1>GIẤY BÁO TIỀN ĐIỆN</h1><div class="code">${esc(kyLabel(ky))} · Mã hoá đơn: ${esc(inv.id)}</div></td>
    <td width="40%"><table width="100%"><tr><td align="right" style="text-align:right;border:0;padding:0">${logo}</td></tr></table><table class="contact" width="100%"><tr><td width="26%" style="width:26%"><b>Địa chỉ</b></td><td>: ${esc(COMPANY.address)}</td></tr><tr><td><b>Điện thoại</b></td><td>: ${esc(COMPANY.phone)}</td></tr><tr><td><b>Email</b></td><td>: ${esc(COMPANY.email)}</td></tr></table></td></tr></table>
  <hr>
  <table class="to" width="100%"><tr><td width="12%" style="width:12%">Kính gửi:</td><td>${esc(inv.customer)}</td></tr></table>
  <p style="font-size:10pt;margin:8px 0">Công ty TNHH Công Nghệ Tin Học Phi Long xin thông báo tiền điện ${esc(kyLabel(ky).toLowerCase())} của Quý khách như sau:</p>
  <table class="grid" width="100%"><tr class="head"><th style="width:5%">TT</th><th>Công tơ</th><th style="width:12%">Chỉ số cũ</th><th style="width:12%">Chỉ số mới</th><th style="width:10%">Số kWh</th><th style="width:11%">Đơn giá</th><th style="width:15%">Thành tiền</th></tr>${rows}
    <tr><th class="num" colspan="6">Cộng tiền điện</th><th class="num">${money(inv.sub)}</th></tr>
    <tr><th class="num" colspan="6">VAT ${Math.round(inv.vatRate * 100)}%</th><th class="num">${money(inv.vat)}</th></tr>
    <tr><th class="num" colspan="6">TỔNG THANH TOÁN</th><th class="num">${money(inv.total)}</th></tr></table>
  <div class="words"><b>Bằng chữ:</b> ${esc(moneyWords(inv.total))}</div>
  <p class="note">Đề nghị Quý khách thanh toán đúng hạn. Mọi thắc mắc xin liên hệ ${esc(COMPANY.phone)}.</p>
  <p style="text-align:right;font-size:10pt;margin:14px 0 0"><i>Đà Nẵng, ngày ${esc(dmy(d).slice(0, 2))} tháng ${esc(dmy(d).slice(3, 5))} năm ${esc(dmy(d).slice(6))}</i></p>
  <table class="sign" width="100%"><tr><td width="50%" style="width:50%">NGƯỜI LẬP<br><br><br><br><br></td><td width="50%" style="width:50%">XÁC NHẬN CỦA QUẢN LÝ</td></tr></table></section>`
}

export function giayBaoHtml(invoices: Invoice[], ky: string, closeDate: string | null, origin = '') {
  const logo = origin ? `<img src="${origin}/brand/philong-logo.png" alt="Phi Long Technology" width="141" height="44" style="width:141px;height:44px;margin-bottom:4px">` : '<b style="color:#d71920;font-size:15pt">PHI LONG TECHNOLOGY</b>'
  const title = invoices.length === 1 ? `Giấy báo tiền điện ${kyLabel(ky)} - ${invoices[0].customer}` : `Giấy báo tiền điện ${kyLabel(ky)}`
  return `<!doctype html><html lang="vi"><head><meta charset="utf-8"><title>${esc(title)}</title><style>${CSS}${PRINT_CSS}section:last-of-type{page-break-after:auto!important}</style></head><body>${invoices.map((i) => page(i, ky, closeDate, logo)).join('')}<div class="foot pfoot">Giấy báo có giá trị khi có xác nhận.</div></body></html>`
}
