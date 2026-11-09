import 'server-only'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { ALERT_CODES, ALERT_MODULES } from '@/lib/resources'
import { todayVN } from '@/lib/crud'
import { driveConfigured, sendMailViaScript } from '@/lib/driveUpload'

// Email alerts (V191 "Cảnh báo email"): one digest per enabled rule, one log row per record.
interface Item { id: string; line: string; days: number | null }
interface Found { module: string; items: Item[] }

const dmy = (iso?: string | null) => (iso ? `${iso.slice(8, 10)}/${iso.slice(5, 7)}/${iso.slice(0, 4)}` : '—')
const addDays = (iso: string, n: number) => { const d = new Date(iso + 'T00:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10) }
const cut = (s: unknown, n = 110) => { const t = String(s ?? '').replace(/\s+/g, ' ').trim(); return t.length > n ? t.slice(0, n - 1) + '…' : t }

async function staffNames() {
  const { data } = await supabaseAdmin().from('nhan_vien').select('id, ho_ten').limit(2000)
  return new Map((data ?? []).map((r: any) => [r.id, r.ho_ten as string]))
}

const RULES: Record<string, (cfg: { days: number }) => Promise<Found>> = {
  async CONG_VIEC_QUA_HAN() {
    const [{ data }, nv] = await Promise.all([supabaseAdmin().from('v_cong_viec').select('id,noi_dung,deadline,so_ngay_con_lai,id_nguoi_thuc_hien').eq('canh_bao', 'QUÁ HẠN').order('deadline').limit(500), staffNames()])
    return { module: 'CONG_VIEC', items: (data ?? []).map((r: any) => ({ id: r.id, days: r.so_ngay_con_lai, line: `${r.id} · ${cut(r.noi_dung)} · hạn ${dmy(r.deadline)} (trễ ${Math.abs(r.so_ngay_con_lai ?? 0)} ngày) · ${nv.get(r.id_nguoi_thuc_hien) ?? 'chưa giao'}` })) }
  },
  async CONG_VIEC_CU_CHUA_XONG() {
    const old = addDays(todayVN(), -30)
    const [{ data }, nv] = await Promise.all([supabaseAdmin().from('v_cong_viec').select('id,noi_dung,ngay_giao,deadline,so_ngay_con_lai,canh_bao,id_nguoi_thuc_hien').not('canh_bao', 'in', '("HOÀN THÀNH","QUÁ HẠN")').lt('ngay_giao', old).order('ngay_giao').limit(500), staffNames()])
    return { module: 'CONG_VIEC', items: (data ?? []).map((r: any) => ({ id: r.id, days: r.so_ngay_con_lai, line: `${r.id} · ${cut(r.noi_dung)} · giao ${dmy(r.ngay_giao)} · ${nv.get(r.id_nguoi_thuc_hien) ?? 'chưa giao'}` })) }
  },
  async CVHN_CHUA_XONG() {
    const [{ data }, nv] = await Promise.all([supabaseAdmin().from('cong_viec_hang_ngay').select('id,ngay,noi_dung,trang_thai,id_nguoi_thuc_hien').or('trang_thai.is.null,trang_thai.neq.Hoàn thành').lt('ngay', todayVN()).order('ngay', { ascending: false }).limit(300), staffNames()])
    return { module: 'CVHN', items: (data ?? []).map((r: any) => ({ id: r.id, days: null, line: `${r.id} · ${dmy(r.ngay)} · ${cut(r.noi_dung)} · ${r.trang_thai || 'chưa cập nhật'} · ${nv.get(r.id_nguoi_thuc_hien) ?? '—'}` })) }
  },
  async BAO_TRI_SAP_HAN() {
    const { data } = await supabaseAdmin().from('v_lich_bao_tri').select('id,ten_khu_vuc,ten_hang_muc,ngay_ke_tiep,so_ngay_con_lai').eq('trang_thai', 'Hoạt động').gte('so_ngay_con_lai', 1).lte('so_ngay_con_lai', 7).order('ngay_ke_tiep').limit(300)
    return { module: 'DM_LICH_BAO_TRI', items: (data ?? []).map((r: any) => ({ id: r.id, days: r.so_ngay_con_lai, line: `${r.id} · ${cut(r.ten_hang_muc)} · ${cut(r.ten_khu_vuc)} · đến hạn ${dmy(r.ngay_ke_tiep)} (còn ${r.so_ngay_con_lai} ngày)` })) }
  },
  async BAO_TRI_DEN_HAN() {
    const { data } = await supabaseAdmin().from('v_lich_bao_tri').select('id,ten_khu_vuc,ten_hang_muc,ngay_ke_tiep,so_ngay_con_lai').eq('trang_thai', 'Hoạt động').lte('so_ngay_con_lai', 0).order('ngay_ke_tiep').limit(300)
    return { module: 'DM_LICH_BAO_TRI', items: (data ?? []).map((r: any) => ({ id: r.id, days: r.so_ngay_con_lai, line: `${r.id} · ${cut(r.ten_hang_muc)} · ${cut(r.ten_khu_vuc)} · hạn ${dmy(r.ngay_ke_tiep)} (${r.so_ngay_con_lai < 0 ? `trễ ${-r.so_ngay_con_lai} ngày` : 'đến hạn hôm nay'})` })) }
  },
  async DE_XUAT_CHO_DUYET() {
    const { data } = await supabaseAdmin().from('v_de_xuat').select('id,noi_dung,ngay_de_xuat,tong_tien,loai_de_xuat').eq('trang_thai', 'Chờ duyệt').order('ngay_de_xuat').limit(200)
    return { module: 'DE_XUAT', items: (data ?? []).map((r: any) => ({ id: r.id, days: null, line: `${r.id} · ${cut(r.noi_dung)} · ngày ${dmy(r.ngay_de_xuat)}${Number(r.tong_tien) ? ` · ${new Intl.NumberFormat('vi-VN').format(Number(r.tong_tien))} đ` : ''}` })) }
  },
  async KHO_VAT_TU_SAP_HET() {
    const { data } = await supabaseAdmin().from('v_vat_tu').select('id,ten_vat_tu,dvt,ton_hien_tai,ton_toi_thieu').gt('ton_toi_thieu', 0).limit(1000)
    return { module: 'VAT_TU', items: (data ?? []).filter((r: any) => Number(r.ton_hien_tai) <= Number(r.ton_toi_thieu)).map((r: any) => ({ id: r.id, days: null, line: `${r.id} · ${cut(r.ten_vat_tu)} · tồn ${r.ton_hien_tai} / tối thiểu ${r.ton_toi_thieu} ${r.dvt ?? ''}` })) }
  },
  async KHACH_THUE_SAP_HET_HAN({ days }) {
    const t = todayVN()
    const { data } = await supabaseAdmin().from('khach_thue').select('id,ten_khach_thue,ngay_ket_thuc').eq('trang_thai', 'Đang thuê').gte('ngay_ket_thuc', t).lte('ngay_ket_thuc', addDays(t, days)).order('ngay_ket_thuc').limit(200)
    return { module: 'KHACH_THUE', items: (data ?? []).map((r: any) => ({ id: r.id, days: Math.round((Date.parse(r.ngay_ket_thuc) - Date.parse(t)) / 864e5), line: `${r.id} · ${cut(r.ten_khach_thue)} · hết hạn ${dmy(r.ngay_ket_thuc)}` })) }
  },
}

const MAIL = /^[^\s@,;]+@[^\s@,;]+\.[^\s@,;]+$/
const recipients = (cfg: any) => Array.from(new Set(`${cfg.email_nhan ?? ''};${cfg.email_quan_tri ?? ''}`.split(/[;,\s]+/).map((x) => x.trim().toLowerCase()).filter((x) => MAIL.test(x))))
const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]!))

export interface AlertResult { code: string; name: string; count: number; to: number; status: 'GUI' | 'XEM_TRUOC' | 'DA_GUI_TRUOC' | 'LOI' | 'KHONG_CO' | 'CHUA_HO_TRO'; note?: string }

/** Evaluate every enabled alert; with send=true also mails the digest and writes the log (once per day per alert). */
export async function runAlerts({ send, onlyCode }: { send: boolean; onlyCode?: string }): Promise<AlertResult[]> {
  const db = supabaseAdmin()
  const { data: cfgs } = await db.from('cau_hinh_email_canh_bao').select('*').eq('bat', true)
  const out: AlertResult[] = []
  const startToday = new Date(`${todayVN()}T00:00:00+07:00`).toISOString()
  for (const cfg of (cfgs ?? []).filter((c: any) => !onlyCode || c.ma_canh_bao === onlyCode)) {
    const code = String(cfg.ma_canh_bao), name = ALERT_CODES[code] ?? cfg.ten_canh_bao ?? code
    const rule = RULES[code]
    if (!rule) { out.push({ code, name, count: 0, to: 0, status: 'CHUA_HO_TRO', note: 'Loại cảnh báo này chưa có bộ kiểm tra' }); continue }
    let found: Found
    try { found = await rule({ days: Number(cfg.so_ngay_bao_truoc) || 7 }) } catch (e: any) { out.push({ code, name, count: 0, to: 0, status: 'LOI', note: e.message }); continue }
    const to = recipients(cfg)
    if (!found.items.length) { out.push({ code, name, count: 0, to: to.length, status: 'KHONG_CO' }); continue }
    if (!send) { out.push({ code, name, count: found.items.length, to: to.length, status: 'XEM_TRUOC' }); continue }
    const { count: already } = await db.from('nhat_ky_email_canh_bao').select('*', { count: 'exact', head: true }).eq('ma_canh_bao', code).eq('trang_thai', 'DA_GUI').gte('ngay_gui', startToday)
    if ((already ?? 0) > 0) { out.push({ code, name, count: found.items.length, to: to.length, status: 'DA_GUI_TRUOC', note: 'Hôm nay đã gửi' }); continue }
    if (!to.length) { out.push({ code, name, count: found.items.length, to: 0, status: 'LOI', note: 'Chưa có email người nhận' }); continue }
    const subject = `[Phi Long] ${name} — ${found.items.length} mục`
    const html = `<div style="font-family:Arial,sans-serif;font-size:14px;color:#111"><h2 style="margin:0 0 8px;color:#b4121f">${esc(name)}</h2><p style="margin:0 0 10px">Có <b>${found.items.length}</b> mục cần xử lý (${ALERT_MODULES[found.module] ?? found.module}):</p><ol style="padding-left:20px;line-height:1.6">${found.items.slice(0, 60).map((i) => `<li>${esc(i.line)}</li>`).join('')}</ol>${found.items.length > 60 ? `<p>… và ${found.items.length - 60} mục khác trong hệ thống.</p>` : ''}<p style="color:#666;font-size:12px;margin-top:14px">Email tự động từ hệ thống quản lý Phi Long Technology.</p></div>`
    try {
      if (!driveConfigured()) throw new Error('Chưa cấu hình gửi email')
      await sendMailViaScript(to, subject, html)
      await db.from('nhat_ky_email_canh_bao').insert(found.items.map((i) => ({ ngay_gui: new Date().toISOString(), ma_canh_bao: code, module: found.module, id_ban_ghi: i.id, nguoi_nhan: to.join('; '), tieu_de: subject, trang_thai: 'DA_GUI', so_ngay_con_lai: i.days, noi_dung: i.line })))
      out.push({ code, name, count: found.items.length, to: to.length, status: 'GUI' })
    } catch (e: any) {
      await db.from('nhat_ky_email_canh_bao').insert({ ngay_gui: new Date().toISOString(), ma_canh_bao: code, module: found.module, id_ban_ghi: '—', nguoi_nhan: to.join('; '), tieu_de: subject, trang_thai: 'LOI', noi_dung: String(e.message).slice(0, 500) })
      out.push({ code, name, count: found.items.length, to: to.length, status: 'LOI', note: e.message })
    }
  }
  return out
}

export const summarize = (r: AlertResult[], send: boolean) => {
  const lab: Record<string, string> = { GUI: 'đã gửi', XEM_TRUOC: 'sẽ gửi', DA_GUI_TRUOC: 'đã gửi hôm nay', LOI: 'lỗi', KHONG_CO: 'không có mục nào', CHUA_HO_TRO: 'chưa hỗ trợ' }
  if (!r.length) return 'Chưa bật cảnh báo nào'
  return `${send ? 'Kết quả gửi' : 'Xem trước (chưa gửi)'}: ` + r.map((x) => `${x.name}: ${x.count} mục → ${lab[x.status]}${x.note && x.status === 'LOI' ? ` (${x.note})` : ''}`).join(' · ')
}
