// "Phiếu đề xuất" template (ported from V191): builds the printable HTML, prints it from a hidden frame,
// and downloads it as a Word-compatible .doc. PDF = the browser's "Save as PDF" in the print dialog.

export interface PhieuLine { name: string; unit: string; qty: number | string | null; price: number | string | null; amount: number | string | null; supplier: string; reason: string; note: string; extra: Record<string, any> }
export interface Phieu { code: string; kind: string; date: string | null; requester: string; department: string; content: string; reason: string; note: string; status: string | null; printedBefore: number; lines: PhieuLine[] }

export const KIND_LABEL: Record<string, string> = {
  MUA_VAT_TU: 'Đề xuất mua vật tư', MUA_THIET_BI: 'Đề xuất mua thiết bị', BAO_TRI: 'Đề xuất bảo trì', THANH_LY: 'Đề xuất thanh lý',
}
export const COMPANY = { address: '52 Nguyễn Văn Linh, Đà Nẵng', phone: '(0236) 3 888 000', email: 'philong@philong.com.vn', web: 'www.philong.com.vn' }

export const esc = (v: unknown) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!))
export const nl = (v: unknown) => esc(v).replace(/\n/g, '<br>')
export const money = (v: unknown) => { const n = Number(v ?? 0); return Number.isFinite(n) && n !== 0 ? String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ',') : '' }
export const dmy = (iso: string | null) => (iso ? `${iso.slice(8, 10)}/${iso.slice(5, 7)}/${iso.slice(0, 4)}` : '')

/** Vietnamese amount in words, e.g. 1.250.000 → "Một triệu hai trăm năm mươi nghìn đồng". */
export function moneyWords(value: unknown) {
  let n = Math.round(Math.abs(Number(value) || 0))
  if (!n) return 'Không đồng'
  const d = ['không', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín'], u = ['', 'nghìn', 'triệu', 'tỷ', 'nghìn tỷ', 'triệu tỷ']
  const three = (v: number, full: boolean) => {
    const h = Math.floor(v / 100), t = Math.floor((v % 100) / 10), o = v % 10, a: string[] = []
    if (h || full) a.push(d[h] + ' trăm')
    if (t > 1) { a.push(d[t] + ' mươi'); if (o === 1) a.push('mốt'); else if (o === 5) a.push('lăm'); else if (o) a.push(d[o]) }
    else if (t === 1) { a.push('mười'); if (o === 5) a.push('lăm'); else if (o) a.push(d[o]) }
    else if (o) { if (h || full) a.push('lẻ'); a.push(d[o]) }
    return a.join(' ')
  }
  const groups: number[] = []
  while (n) { groups.push(n % 1000); n = Math.floor(n / 1000) }
  const out: string[] = []
  for (let i = groups.length - 1; i >= 0; i--) if (groups[i]) out.push((three(groups[i], i < groups.length - 1 && groups[i] < 100) + ' ' + u[i]).trim())
  const s = out.join(' ').replace(/\s+/g, ' ').trim()
  return s.charAt(0).toUpperCase() + s.slice(1) + ' đồng'
}

/** File name: code - requester - items (illegal characters removed, max 150). */
export function fileName(p: Phieu) {
  const items = Array.from(new Set(p.lines.map((l) => String(l.name || '').trim()).filter(Boolean)))
  const name = [p.code || 'de-xuat', p.requester, items.join(', ')].map((x) => String(x || '').replace(/[\\/:*?"<>|\r\n\t]+/g, ' ').replace(/\s+/g, ' ').trim()).filter(Boolean).join(' - ')
  return name.length > 150 ? name.slice(0, 150).trim() : name
}

export const CSS = `
@page{size:A4;margin:11mm 12mm}
@page WordSection1{size:21cm 29.7cm;margin:1.1cm 1.2cm 1.6cm 1.2cm;mso-header-margin:0;mso-footer-margin:.6cm;mso-footer:f1}
div.WordSection1{page:WordSection1}
*{box-sizing:border-box}
body{font-family:"Times New Roman",Times,serif;color:#111;font-size:11pt;margin:0}
table{border-collapse:collapse;width:100%}
td,th{vertical-align:top}
.hd td{border:0;padding:0}
h1{margin:0;font-size:20pt;letter-spacing:.5px}
.code{font-weight:bold;font-size:10pt}
.contact td{border:0;font-size:8pt;padding:1px 0}
hr{border:0;border-top:1.5px solid #111;margin:6px 0 8px}
.to td{border:0;padding:2px 0;font-weight:bold;font-size:10pt}
.grid td,.grid th{border:.75pt solid #222;padding:4px 6px;font-size:9.5pt}
.lab{background:#f2f2f2;font-weight:bold;width:15%}
.sec{margin:12px 0 5px;color:#9e1730;font-weight:bold;font-size:11pt}
.num{text-align:right}.ctr{text-align:center}
.head th{background:#eee;font-weight:bold}
.words{font-size:9.5pt;margin-top:6px}
.sign td{border:0;text-align:center;font-weight:bold;font-size:9.5pt;width:33.3%;height:105px}
.foot{text-align:center;font-size:8pt;color:#444}
.note{margin:10px 0;font-size:9.5pt}
`

// print: the footer sits at the bottom of every page; pdf: the page is exactly A4 with the footer at its bottom edge
export const PRINT_CSS = `.pfoot{position:fixed;left:0;right:0;bottom:0}body{padding-bottom:9mm}`
const PDF_CSS = `td,th{line-height:1.35;box-sizing:content-box}.grid td,.grid th{padding:3px 6px 9px}body{width:794px;margin:0;background:#fff}.WordSection1{position:relative;min-height:1122px;padding:42px 45px 64px}.pfoot{position:absolute;left:0;right:0;bottom:24px}`

/** Full HTML document of the proposal form (one template per kind, as in V191). */
export function phieuHtml(p: Phieu, origin = '', mode: 'print' | 'word' | 'pdf' = 'print') {
  const label = KIND_LABEL[p.kind] ?? 'Đề xuất'
  const money2 = p.kind === 'MUA_VAT_TU' || p.kind === 'MUA_THIET_BI'
  let detail = ''
  if (money2) {
    let total = 0
    const rows = p.lines.map((l, i) => {
      const amount = Number(l.amount ?? 0) || Number(l.qty ?? 0) * Number(l.price ?? 0)
      total += amount
      return `<tr><td class="ctr">${i + 1}</td><td>${esc(l.name)}${l.supplier ? `<br><span style="font-size:8.5pt;color:#555">NCC: ${esc(l.supplier)}</span>` : ''}</td><td class="ctr">${esc(l.unit)}</td><td class="ctr">${esc(l.qty)}</td><td class="num">${money(l.price)}</td><td class="num">${money(amount)}</td></tr>`
    }).join('')
    detail = `<table class="grid" width="100%"><tr class="head"><th style="width:6%">TT</th><th>Nội dung / Mặt hàng</th><th style="width:9%">ĐVT</th><th style="width:11%">Số lượng</th><th style="width:15%">Đơn giá</th><th style="width:17%">Thành tiền</th></tr>${rows}
      <tr><th colspan="5" class="num">TỔNG CỘNG</th><th class="num">${money(total)}</th></tr></table>
      <div class="words"><b>Tổng cộng bằng chữ:</b> ${esc(moneyWords(total))}</div>`
  } else {
    const l = p.lines[0] ?? ({ name: '', extra: {} } as PhieuLine), x = l.extra ?? {}
    const pick = (...ks: string[]) => { for (const k of ks) if (x[k] != null && x[k] !== '') return x[k]; return '' }
    const rows: [string, unknown][] = p.kind === 'BAO_TRI'
      ? [['Thiết bị', l.name], ['Khu vực', pick('KHU_VUC', 'ID_KHU_VUC')], ['Hiện trạng', pick('HIEN_TRANG', 'TINH_TRANG')], ['Phương án đề xuất', pick('PHUONG_AN_DE_XUAT') || l.reason], ['Chi phí dự kiến', money(pick('CHI_PHI_DU_KIEN') || l.amount)]]
      : [['Thiết bị', l.name], ['Tình trạng', pick('TINH_TRANG', 'HIEN_TRANG')], ['Lý do thanh lý', pick('LY_DO') || l.reason], ['Chi phí sửa dự kiến', money(pick('CHI_PHI_SUA_DU_KIEN'))], ['Giá trị còn lại', money(pick('GIA_TRI_CON_LAI'))], ['Giá đề xuất thanh lý', money(pick('GIA_DE_XUAT_THANH_LY') || l.price)]]
    detail = `<table class="grid" width="100%">${rows.map(([k, v]) => `<tr><td class="lab" style="width:32%">${esc(k)}</td><td>${nl(v)}</td></tr>`).join('')}</table>`
  }
  const logo = origin ? `<img src="${origin}/brand/philong-logo.png" alt="Phi Long Technology" width="200" height="62" style="width:200px;height:62px;margin-bottom:2px">` : '<b style="color:#d71920;font-size:15pt">PHI LONG TECHNOLOGY</b>'
  return `<!doctype html><html lang="vi" xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word"><head><meta charset="utf-8"><title>${esc(fileName(p))}</title><!--[if gte mso 9]><xml><w:WordDocument><w:View>Print</w:View><w:Zoom>100</w:Zoom></w:WordDocument></xml><![endif]--><style>${CSS}${mode === 'pdf' ? PDF_CSS : mode === 'print' ? PRINT_CSS : ''}</style></head><body><div class="WordSection1">
  <table class="hd" width="100%"><tr><td style="vertical-align:bottom"><h1>PHIẾU ĐỀ XUẤT</h1><div class="code">Mã phiếu: ${esc(p.code)}</div></td>
    <td width="200" style="width:200px"><table width="100%"><tr><td align="left" style="text-align:left;border:0;padding:0">${logo}</td></tr></table><table class="contact" width="100%"><tr><td width="26%" style="width:26%"><b>Địa chỉ</b></td><td>: ${esc(COMPANY.address)}</td></tr><tr><td><b>Điện thoại</b></td><td>: ${esc(COMPANY.phone)}</td></tr><tr><td><b>Email</b></td><td>: ${esc(COMPANY.email)}</td></tr><tr><td><b>Website</b></td><td>: ${esc(COMPANY.web)}</td></tr></table></td></tr></table>
  <hr>
  <table class="to" width="100%"><tr><td width="12%" style="width:12%">Kính gửi:</td><td>- Giám đốc Công ty TNHH Công Nghệ Tin Học Phi Long<br>- Bộ phận quản lý</td></tr></table>
  <table class="grid" width="100%" style="margin-top:6px"><tr><td class="lab">Ngày lập</td><td>${esc(dmy(p.date))}</td><td class="lab">Người đề xuất</td><td>${esc(p.requester)}</td></tr>
    <tr><td class="lab">Phòng ban</td><td>${esc(p.department)}</td><td class="lab">Loại đề xuất</td><td>${esc(label)}</td></tr></table>
  <div class="sec">NỘI DUNG</div><div style="font-size:9.5pt">${nl(p.content)}${p.reason && p.reason !== p.content ? `<br><br><b>Mục đích / lý do:</b> ${nl(p.reason)}` : ''}</div>
  <div class="sec">CHI TIẾT ĐỀ XUẤT</div>${detail}
  <div class="note"><b>Ghi chú:</b> ${nl(p.note)}</div>
  <table class="sign" width="100%"><tr><td width="33%">NGƯỜI ĐỀ XUẤT<br><br><br><br><br>${esc(p.requester)}</td><td width="34%">TRƯỞNG BỘ PHẬN</td><td width="33%">PHÊ DUYỆT</td></tr></table>
  ${mode === 'word'
    ? '</div><div style="mso-element:footer" id="f1"><p class="MsoFooter" align="center" style="text-align:center;font-size:8pt;color:#444">Biểu mẫu có giá trị khi được ký duyệt đầy đủ.</p></div>'
    : '<div class="foot pfoot">Biểu mẫu có giá trị khi được ký duyệt đầy đủ.</div></div>'}</body></html>`
}

/** Print from a hidden frame (no popup window). Used for both "In phiếu" and "PDF" (Save as PDF in the dialog). */
export function printHtml(html: string) {
  const f = document.createElement('iframe')
  f.setAttribute('aria-hidden', 'true')
  f.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0'
  f.srcdoc = html
  f.onload = () => {
    const w = f.contentWindow
    if (!w) return
    setTimeout(() => { w.focus(); w.print(); setTimeout(() => f.remove(), 3000) }, 400)
  }
  document.body.appendChild(f)
}

/** Word opens an HTML document saved as .doc, keeping the tables and styles. */
export function downloadWord(html: string, name: string) {
  const blob = new Blob(['﻿', html], { type: 'application/msword;charset=utf-8' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = `${name}.doc`
  document.body.appendChild(a); a.click(); a.remove()
  setTimeout(() => URL.revokeObjectURL(a.href), 4000)
}

/** Creates the PDF file directly (no print dialog): the form is drawn on A4 pages and saved. */
export async function downloadPdf(html: string, name: string) {
  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([import('html2canvas'), import('jspdf')])
  const f = document.createElement('iframe')
  f.setAttribute('aria-hidden', 'true')
  f.style.cssText = 'position:fixed;left:-10000px;top:0;width:794px;height:1123px;border:0;background:#fff'
  document.body.appendChild(f)
  try {
    await new Promise<void>((res) => { f.onload = () => res(); f.srcdoc = html })
    const doc = f.contentDocument!
    await Promise.all(Array.from(doc.images).map((im) => (im.complete ? Promise.resolve() : new Promise<void>((r) => { im.onload = im.onerror = () => r() }))))
    const target = (doc.querySelector('.WordSection1') as HTMLElement) ?? doc.body
    const canvas = await html2canvas(target, { scale: 2, backgroundColor: '#ffffff', useCORS: true, width: 794, windowWidth: 794 })
    const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' })
    const pageH = Math.floor((canvas.width * 297) / 210)
    for (let y = 0, first = true; y < canvas.height; y += pageH, first = false) {
      const h = Math.min(pageH, canvas.height - y)
      const part = document.createElement('canvas'); part.width = canvas.width; part.height = h
      const c = part.getContext('2d')!; c.fillStyle = '#fff'; c.fillRect(0, 0, part.width, part.height); c.drawImage(canvas, 0, y, canvas.width, h, 0, 0, canvas.width, h)
      if (!first) pdf.addPage()
      pdf.addImage(part.toDataURL('image/jpeg', 0.95), 'JPEG', 0, 0, 210, (h * 210) / canvas.width)
    }
    pdf.save(`${name}.pdf`)
  } finally { f.remove() }
}
