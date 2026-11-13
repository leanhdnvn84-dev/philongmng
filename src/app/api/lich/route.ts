import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { getAuth, can } from '@/lib/auth'

export const dynamic = 'force-dynamic'

/** One month of dated things from every module the user may see: work deadlines, maintenance due, booked visitors, leases ending. */
type Ev = { date: string; kind: 'viec' | 'bao_tri' | 'khach' | 'hop_dong'; title: string; sub: string; href: string; done?: boolean; late?: boolean }
const cut = (s: unknown, n = 90) => { const t = String(s ?? '').replace(/\s+/g, ' ').trim(); return t.length > n ? t.slice(0, n - 1) + '…' : t }

export async function GET(req: NextRequest) {
  const auth = await getAuth().catch(() => null)
  if (!auth) return NextResponse.json({ success: false, error: 'Chưa đăng nhập' }, { status: 401 })
  const m = /^(\d{4})-(0[1-9]|1[0-2])$/.exec(req.nextUrl.searchParams.get('thang') ?? '')
  if (!m) return NextResponse.json({ success: false, error: 'Tháng không hợp lệ' }, { status: 400 })
  const from = `${m[1]}-${m[2]}-01`, to = `${m[1]}-${m[2]}-${String(new Date(Number(m[1]), Number(m[2]), 0).getDate()).padStart(2, '0')}`
  const db = supabaseAdmin(), out: Ev[] = [], jobs: Promise<void>[] = []
  const { data: nvs } = await db.from('nhan_vien').select('id, ho_ten').limit(2000)
  const nv = new Map((nvs ?? []).map((r: any) => [r.id, r.ho_ten as string]))

  if (can(auth, 'CONG_VIEC', 'view')) jobs.push((async () => {
    const { data } = await db.from('v_cong_viec').select('id,noi_dung,deadline,canh_bao,id_nguoi_thuc_hien').gte('deadline', from).lte('deadline', to).limit(2000)
    for (const r of (data ?? []) as any[]) out.push({ date: r.deadline, kind: 'viec', title: cut(r.noi_dung), sub: `${r.id} · ${nv.get(r.id_nguoi_thuc_hien) ?? 'chưa giao'} · ${String(r.canh_bao ?? '').toLowerCase()}`, href: `/cong_viec?q=${r.id}`, done: r.canh_bao === 'HOÀN THÀNH', late: r.canh_bao === 'QUÁ HẠN' })
  })())
  if (can(auth, 'BAO_TRI', 'view')) jobs.push((async () => {
    const { data } = await db.from('v_lich_bao_tri').select('id,ten_khu_vuc,ten_hang_muc,ngay_ke_tiep,canh_bao,tang').gte('ngay_ke_tiep', from).lte('ngay_ke_tiep', to).limit(2000)
    for (const r of (data ?? []) as any[]) out.push({ date: r.ngay_ke_tiep, kind: 'bao_tri', title: cut(r.ten_hang_muc), sub: `${[r.tang, r.ten_khu_vuc].filter(Boolean).join(' · ')} · ${String(r.canh_bao ?? '').toLowerCase()}`, href: `/lich_bao_tri?q=${r.id}`, late: r.canh_bao === 'TRỄ LỊCH' })
  })())
  if (can(auth, 'KHACH_RA_VAO', 'view')) jobs.push((async () => {
    const { data } = await db.from('khach_ra_vao').select('id,ho_ten,cong_ty,ngay_hen,gio_hen,nguoi_can_gap,trang_thai').gte('ngay_hen', from).lte('ngay_hen', to).limit(2000)
    for (const r of (data ?? []) as any[]) out.push({ date: r.ngay_hen, kind: 'khach', title: `${r.gio_hen ? r.gio_hen + ' · ' : ''}${cut(r.ho_ten, 40)}`, sub: [r.cong_ty, r.nguoi_can_gap && `gặp ${r.nguoi_can_gap}`, r.trang_thai].filter(Boolean).map((x) => cut(x, 40)).join(' · '), href: '/khach_ra_vao', done: r.trang_thai !== 'Hẹn trước' })
  })())
  if (can(auth, 'KHACH_THUE', 'view')) jobs.push((async () => {
    const { data } = await db.from('khach_thue').select('id,ten_khach_thue,ngay_ket_thuc,trang_thai').gte('ngay_ket_thuc', from).lte('ngay_ket_thuc', to).limit(500)
    for (const r of (data ?? []) as any[]) out.push({ date: r.ngay_ket_thuc, kind: 'hop_dong', title: `Hết hạn thuê: ${cut(r.ten_khach_thue, 60)}`, sub: `${r.id} · ${r.trang_thai ?? ''}`, href: '/mat-bang', done: r.trang_thai !== 'Đang thuê' })
  })())
  const errors: string[] = []
  await Promise.all(jobs.map((j) => j.catch((e) => { errors.push(String(e?.message ?? e)) })))
  out.sort((a, b) => a.date.localeCompare(b.date) || a.kind.localeCompare(b.kind))
  return NextResponse.json({ success: true, data: out, errors })
}
