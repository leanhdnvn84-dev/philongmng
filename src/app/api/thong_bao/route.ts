import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { getAuth, can } from '@/lib/auth'
import { todayVN } from '@/lib/crud'

export const dynamic = 'force-dynamic'

/** Bell in the top bar: what needs this user's attention right now, worked out from live data (nothing is stored). */
type Note = { key: string; title: string; count: number; tone: 'red' | 'amber' | 'blue'; href: string; lines: string[] }
const dmy = (iso?: string | null) => (iso ? `${iso.slice(8, 10)}/${iso.slice(5, 7)}` : '')
const cut = (s: unknown, n = 70) => { const t = String(s ?? '').replace(/\s+/g, ' ').trim(); return t.length > n ? t.slice(0, n - 1) + '…' : t }
const addDays = (iso: string, n: number) => { const d = new Date(iso + 'T00:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10) }

export async function GET() {
  const auth = await getAuth().catch(() => null)
  if (!auth) return NextResponse.json({ success: false, error: 'Chưa đăng nhập' }, { status: 401 })
  const db = supabaseAdmin(), today = todayVN(), out: Note[] = []
  const { data: me } = await db.from('users').select('id_nhan_vien').eq('id', auth.userId).maybeSingle()
  const nv = me?.id_nhan_vien as string | null
  const jobs: Promise<void>[] = []

  if (can(auth, 'CONG_VIEC', 'view')) jobs.push((async () => {
    const { data } = await db.from('v_cong_viec').select('id,noi_dung,deadline,canh_bao,so_ngay_con_lai,id_nguoi_thuc_hien,nguoi_lam_cung')
      .in('canh_bao', ['QUÁ HẠN', 'ĐẾN HẠN HÔM NAY', 'SẮP ĐẾN HẠN', 'CẦN LÀM NGAY']).order('deadline').limit(500)
    const rows = (data ?? []) as any[]
    const mine = nv ? rows.filter((r) => r.id_nguoi_thuc_hien === nv || String(r.nguoi_lam_cung ?? '').split(/[,;]+/).map((x) => x.trim()).includes(nv)) : []
    const line = (r: any) => `${r.id} · ${cut(r.noi_dung)}${r.deadline ? ` · hạn ${dmy(r.deadline)}` : ''}`
    if (mine.length) out.push({ key: 'viec_cua_toi', title: 'Việc của bạn cần xử lý', count: mine.length, tone: mine.some((r) => r.canh_bao === 'QUÁ HẠN') ? 'red' : 'amber', href: `/cong_viec?id_nguoi_thuc_hien=${nv}`, lines: mine.slice(0, 4).map(line) })
    const late = rows.filter((r) => r.canh_bao === 'QUÁ HẠN')
    if (late.length) out.push({ key: 'viec_qua_han', title: 'Công việc quá hạn (toàn bộ)', count: late.length, tone: 'red', href: '/cong_viec', lines: late.slice(0, 3).map(line) })
    const due = rows.filter((r) => r.canh_bao === 'ĐẾN HẠN HÔM NAY')
    if (due.length) out.push({ key: 'viec_hom_nay', title: 'Công việc đến hạn hôm nay', count: due.length, tone: 'amber', href: '/cong_viec', lines: due.slice(0, 3).map(line) })
  })())

  if (can(auth, 'DE_XUAT', 'approve')) jobs.push((async () => {
    const { data } = await db.from('v_de_xuat').select('id,noi_dung,ngay_de_xuat,tong_tien,loai_de_xuat').in('trang_thai', auth.superAdmin ? ['Chờ duyệt', 'Chờ duyệt cấp 2'] : ['Chờ duyệt']).order('ngay_de_xuat').limit(200)
    if (data?.length) out.push({ key: 'de_xuat_cho_duyet', title: 'Đề xuất chờ bạn duyệt', count: data.length, tone: 'amber', href: `/de_xuat?loai_de_xuat=${(data[0] as any).loai_de_xuat}`,
      lines: (data as any[]).slice(0, 4).map((r) => `${r.id} · ${cut(r.noi_dung, 50)} · ${dmy(r.ngay_de_xuat)}${Number(r.tong_tien) ? ` · ${new Intl.NumberFormat('vi-VN').format(Number(r.tong_tien))} đ` : ''}`) })
  })())

  if (can(auth, 'BAO_TRI', 'view')) jobs.push((async () => {
    const { data } = await db.from('v_lich_bao_tri').select('id,ten_khu_vuc,ten_hang_muc,ngay_ke_tiep,so_ngay_con_lai,canh_bao').in('canh_bao', ['TRỄ LỊCH', 'ĐẾN HẠN HÔM NAY', 'SẮP ĐẾN HẠN']).order('ngay_ke_tiep').limit(300)
    const rows = (data ?? []) as any[], line = (r: any) => `${cut(r.ten_hang_muc, 40)} · ${cut(r.ten_khu_vuc, 26)} · ${dmy(r.ngay_ke_tiep)}`
    const late = rows.filter((r) => r.canh_bao !== 'SẮP ĐẾN HẠN'), soon = rows.filter((r) => r.canh_bao === 'SẮP ĐẾN HẠN')
    if (late.length) out.push({ key: 'bao_tri_tre', title: 'Bảo trì đến hạn hoặc trễ', count: late.length, tone: 'red', href: '/lich_bao_tri', lines: late.slice(0, 4).map(line) })
    if (soon.length) out.push({ key: 'bao_tri_sap', title: 'Bảo trì sắp đến hạn', count: soon.length, tone: 'blue', href: '/lich_bao_tri', lines: soon.slice(0, 3).map(line) })
  })())

  if (can(auth, 'KHACH_RA_VAO', 'view')) jobs.push((async () => {
    const { data } = await db.from('khach_ra_vao').select('id,ho_ten,cong_ty,gio_hen,nguoi_can_gap').eq('trang_thai', 'Hẹn trước').eq('ngay_hen', today).order('gio_hen').limit(100)
    if (data?.length) out.push({ key: 'khach_hen', title: 'Khách hẹn hôm nay', count: data.length, tone: 'blue', href: '/khach_ra_vao',
      lines: (data as any[]).slice(0, 4).map((r) => `${r.gio_hen ? r.gio_hen + ' · ' : ''}${cut(r.ho_ten, 30)}${r.cong_ty ? ` (${cut(r.cong_ty, 24)})` : ''}${r.nguoi_can_gap ? ` → ${cut(r.nguoi_can_gap, 26)}` : ''}`) })
  })())

  if (can(auth, 'KHACH_THUE', 'view')) jobs.push((async () => {
    const { data } = await db.from('khach_thue').select('id,ten_khach_thue,ngay_ket_thuc').eq('trang_thai', 'Đang thuê').gte('ngay_ket_thuc', today).lte('ngay_ket_thuc', addDays(today, 30)).order('ngay_ket_thuc').limit(100)
    if (data?.length) out.push({ key: 'hop_dong', title: 'Hợp đồng thuê hết hạn trong 30 ngày', count: data.length, tone: 'amber', href: '/mat-bang', lines: (data as any[]).slice(0, 4).map((r) => `${cut(r.ten_khach_thue, 46)} · ${dmy(r.ngay_ket_thuc)}`) })
  })())

  if (can(auth, 'KHO', 'view')) jobs.push((async () => {
    const { data } = await db.from('v_vat_tu').select('id,ten_vat_tu,dvt,ton_hien_tai,ton_toi_thieu').gt('ton_toi_thieu', 0).limit(2000)
    const low = ((data ?? []) as any[]).filter((r) => Number(r.ton_hien_tai) <= Number(r.ton_toi_thieu))
    if (low.length) out.push({ key: 'vat_tu', title: 'Vật tư dưới mức tồn tối thiểu', count: low.length, tone: 'amber', href: '/vat_tu', lines: low.slice(0, 4).map((r) => `${cut(r.ten_vat_tu, 40)} · tồn ${r.ton_hien_tai}/${r.ton_toi_thieu} ${r.dvt ?? ''}`) })
  })())

  await Promise.all(jobs.map((j) => j.catch(() => {})))
  const rank = { red: 0, amber: 1, blue: 2 }
  out.sort((a, b) => rank[a.tone] - rank[b.tone] || b.count - a.count)
  return NextResponse.json({ success: true, data: out, urgent: out.filter((n) => n.tone !== 'blue').reduce((s, n) => s + n.count, 0) })
}
