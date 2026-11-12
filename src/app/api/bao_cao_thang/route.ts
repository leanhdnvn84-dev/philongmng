import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { getAuth, can } from '@/lib/auth'
import { PROPOSAL_KINDS } from '@/lib/resources'

export const dynamic = 'force-dynamic'
export const maxDuration = 30

const monthEnd = (y: number, m: number) => `${y}-${String(m).padStart(2, '0')}-${String(new Date(Date.UTC(y, m, 0)).getUTCDate()).padStart(2, '0')}`
const shift = (y: number, m: number, n: number) => { const d = new Date(Date.UTC(y, m - 1 + n, 1)); return [d.getUTCFullYear(), d.getUTCMonth() + 1] as const }
const ymKey = (y: number, m: number) => `${y}-${String(m).padStart(2, '0')}`
async function all(q: () => any) { const out: any[] = []; for (let f = 0; ; f += 1000) { const { data, error } = await q().range(f, f + 999); if (error) throw error; out.push(...(data ?? [])); if (!data || data.length < 1000) break } return out }

/** Monthly summary (one page) + 12-month cost chart. `?chart=1` returns only the chart (dashboard). */
export async function GET(req: NextRequest) {
  const auth = await getAuth().catch(() => null)
  if (!auth) return NextResponse.json({ success: false, error: 'Chưa đăng nhập' }, { status: 401 })
  const mm = /^(\d{4})-(0[1-9]|1[0-2])$/.exec(req.nextUrl.searchParams.get('thang') ?? '')
  if (!mm) return NextResponse.json({ success: false, error: 'Tháng không hợp lệ' }, { status: 400 })
  const y = Number(mm[1]), m = Number(mm[2]), from = `${mm[1]}-${mm[2]}-01`, to = monthEnd(y, m)
  const db = supabaseAdmin()
  const [cy, cm] = shift(y, m, -11), chartFrom = `${ymKey(cy, cm)}-01`
  const canDx = can(auth, 'DE_XUAT', 'view'), canBt = can(auth, 'BAO_TRI', 'view')

  // 12 months of costs: approved proposals by kind (approval date) + maintenance cost
  const months = Array.from({ length: 12 }, (_, i) => ymKey(...shift(cy, cm, i)))
  const chart = months.map((k) => ({ thang: k, parts: {} as Record<string, number> }))
  const put = (k: string, part: string, v: number) => { const c = chart.find((x) => x.thang === k); if (c && v) c.parts[part] = (c.parts[part] ?? 0) + v }
  if (canDx) {
    const dx = await all(() => db.from('v_de_xuat').select('id, loai_de_xuat, tong_tien, ngay_duyet, ngay_de_xuat').eq('trang_thai', 'Đã duyệt').gte('ngay_duyet', chartFrom).lte('ngay_duyet', to).order('id'))
    for (const r of dx) put(String(r.ngay_duyet).slice(0, 7), PROPOSAL_KINDS[r.loai_de_xuat] ?? r.loai_de_xuat, Number(r.tong_tien) || 0)
  }
  if (canBt) {
    const bt = await all(() => db.from('nhat_ky_bao_tri').select('id, ngay_thuc_hien, chi_phi').gt('chi_phi', 0).gte('ngay_thuc_hien', chartFrom).lte('ngay_thuc_hien', to).order('id'))
    for (const r of bt) put(String(r.ngay_thuc_hien).slice(0, 7), 'Chi phí bảo trì', Number(r.chi_phi) || 0)
  }
  if (req.nextUrl.searchParams.get('chart')) return NextResponse.json({ success: true, chart })

  const out: Record<string, any> = { thang: ymKey(y, m), chart }
  const jobs: Promise<void>[] = []
  if (can(auth, 'CONG_VIEC', 'view')) jobs.push((async () => {
    const giao = await all(() => db.from('v_cong_viec').select('id, canh_bao').gte('ngay_giao', from).lte('ngay_giao', to).order('id'))
    const xong = await all(() => db.from('cong_viec').select('id').gte('ngay_hoan_thanh', from).lte('ngay_hoan_thanh', to).order('id'))
    const late = await all(() => db.from('v_cong_viec').select('id, noi_dung, deadline, id_nguoi_thuc_hien').eq('canh_bao', 'QUÁ HẠN').order('deadline'))
    out.cong_viec = { giao: giao.length, xong: xong.length, qua_han: late.length, qua_han_ds: late.slice(0, 8).map((r) => ({ id: r.id, noi_dung: r.noi_dung, deadline: r.deadline })) }
  })())
  if (can(auth, 'CVHN', 'view')) jobs.push((async () => {
    const rows = await all(() => db.from('cong_viec_hang_ngay').select('id, trang_thai, id_nguoi_thuc_hien').gte('ngay', from).lte('ngay', to).order('id'))
    const { data: nv } = await db.from('nhan_vien').select('id, ho_ten')
    const names = new Map((nv ?? []).map((x: any) => [x.id, x.ho_ten]))
    const by = new Map<string, number>(); for (const r of rows) { const n = names.get(r.id_nguoi_thuc_hien) ?? 'Chưa ghi người'; by.set(n, (by.get(n) ?? 0) + 1) }
    out.cvhn = { tong: rows.length, xong: rows.filter((r) => r.trang_thai === 'Hoàn thành').length, theo_nguoi: [...by].sort((a, b) => b[1] - a[1]).slice(0, 8).map(([ten, so]) => ({ ten, so })) }
  })())
  if (canBt) jobs.push((async () => {
    const rows = await all(() => db.from('v_nhat_ky_bao_tri').select('id, id_hang_muc, chi_phi').gte('ngay_thuc_hien', from).lte('ngay_thuc_hien', to).order('id'))
    const { data: hm } = await db.from('hang_muc_bao_tri').select('id, ten_hang_muc')
    const names = new Map((hm ?? []).map((x: any) => [x.id, x.ten_hang_muc]))
    const by = new Map<string, number>(); for (const r of rows) { const n = names.get(r.id_hang_muc) ?? r.id_hang_muc; by.set(n, (by.get(n) ?? 0) + 1) }
    const { count: tre } = await db.from('v_lich_bao_tri').select('*', { count: 'exact', head: true }).eq('canh_bao', 'TRỄ LỊCH')
    out.bao_tri = { lan: rows.length, chi_phi: rows.reduce((s, r) => s + (Number(r.chi_phi) || 0), 0), tre_lich: tre ?? 0, theo_hang_muc: [...by].sort((a, b) => b[1] - a[1]).slice(0, 8).map(([ten, so]) => ({ ten, so })) }
  })())
  if (canDx) jobs.push((async () => {
    const rows = await all(() => db.from('v_de_xuat').select('id, loai_de_xuat, trang_thai, tong_tien, ngay_duyet').gte('ngay_de_xuat', from).lte('ngay_de_xuat', to).order('id'))
    const duyet = await all(() => db.from('v_de_xuat').select('id, loai_de_xuat, tong_tien').eq('trang_thai', 'Đã duyệt').gte('ngay_duyet', from).lte('ngay_duyet', to).order('id'))
    const st: Record<string, number> = {}; for (const r of rows) st[r.trang_thai ?? '—'] = (st[r.trang_thai ?? '—'] ?? 0) + 1
    const loai: Record<string, number> = {}; for (const r of duyet) { const k = PROPOSAL_KINDS[r.loai_de_xuat] ?? r.loai_de_xuat; loai[k] = (loai[k] ?? 0) + (Number(r.tong_tien) || 0) }
    out.de_xuat = { lap: rows.length, trang_thai: st, duyet_so: duyet.length, duyet_tien: duyet.reduce((s, r) => s + (Number(r.tong_tien) || 0), 0), theo_loai: loai }
  })())
  if (can(auth, 'KHO', 'view')) jobs.push((async () => {
    const rows = await all(() => db.from('nhap_xuat_kho').select('id, loai_giao_dich, so_luong, thanh_tien').gte('ngay', from).lte('ngay', to).order('id'))
    const n = rows.filter((r) => r.loai_giao_dich === 'NHAP'), x = rows.filter((r) => r.loai_giao_dich === 'XUAT')
    out.kho = { nhap_phieu: n.length, nhap_tien: n.reduce((s, r) => s + (Number(r.thanh_tien) || 0), 0), xuat_phieu: x.length }
  })())
  if (can(auth, 'TIEN_DIEN', 'view')) jobs.push((async () => {
    const rows = await all(() => db.from('tien_dien').select('id, nhom_hoa_don, so_kwh, thanh_tien, vat, trang_thai').eq('ky', ymKey(y, m)).order('id'))
    const inv = new Map<string, { sub: number; vat: number }>()
    for (const r of rows) { const k = r.nhom_hoa_don ?? r.id; const e = inv.get(k) ?? { sub: 0, vat: Number(r.vat) || 0 }; e.sub += Number(r.thanh_tien) || 0; inv.set(k, e) }
    let tong = 0; inv.forEach((e) => { tong += e.sub + Math.round(e.sub * e.vat) })
    const { data: pays } = await db.from('thanh_toan_dien').select('so_tien').eq('ky', ymKey(y, m))
    out.tien_dien = { kwh: rows.reduce((s, r) => s + (Number(r.so_kwh) || 0), 0), tong, da_thu: (pays ?? []).reduce((s: number, p: any) => s + Number(p.so_tien || 0), 0), da_chot: rows.length > 0 && rows.every((r) => r.trang_thai === 'Đã chốt'), hoa_don: inv.size }
  })())
  if (can(auth, 'KHACH_RA_VAO', 'view')) jobs.push((async () => {
    const { count } = await db.from('khach_ra_vao').select('*', { count: 'exact', head: true }).gte('ngay', from).lte('ngay', to)
    out.khach = { luot: count ?? 0 }
  })())
  const errors: string[] = []
  await Promise.all(jobs.map((j) => j.catch((e) => { errors.push(String(e?.message ?? e)) })))
  return NextResponse.json({ success: true, data: out, errors })
}
