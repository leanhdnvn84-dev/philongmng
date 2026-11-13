import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { getAuth, can, AuthContext } from '@/lib/auth'
import { audit, todayVN } from '@/lib/crud'

export const dynamic = 'force-dynamic'

/** "Mặt bằng cho thuê": buildings, floors, tenants and leases behind one screen.
 *  Floors / buildings need the QUAN_LY_TANG permission, tenants and leases need KHACH_THUE. */
const err = (m: string, s = 400) => NextResponse.json({ success: false, error: m }, { status: s })
const DATE = /^\d{4}-\d{2}-\d{2}$/
const txt = (v: unknown, n = 300) => { const t = String(v ?? '').replace(/\s+/g, ' ').trim().slice(0, n); return t || null }
const num = (v: unknown) => { if (v === '' || v == null) return null; const n = Number(String(v).replace(/,/g, '.')); return Number.isFinite(n) && n >= 0 ? n : NaN }
const date = (v: unknown) => { const t = String(v ?? '').trim(); return !t ? null : DATE.test(t) ? t : undefined }
const ACTIVE = 'Đang thuê', ENDED = 'Đã kết thúc'

export async function GET() {
  const a = await getAuth().catch(() => null)
  if (!a) return err('Chưa đăng nhập', 401)
  if (!can(a, 'QUAN_LY_TANG', 'view') && !can(a, 'KHACH_THUE', 'view')) return err('Bạn không có quyền xem mục này', 403)
  const db = supabaseAdmin()
  const [b, f, t, l] = await Promise.all([
    db.from('toa_nha').select('id, ten_toa_nha, dia_chi_toa_nha').order('ten_toa_nha'),
    db.from('tang').select('id, id_toa_nha, ten_tang, ma_tang_khu_vuc, dien_tich, trang_thai_su_dung, bao_gia, ghi_chu').order('id'),
    db.from('khach_thue').select('id, ten_khach_thue, nguoi_lien_he, dien_thoai, email, dia_chi, ma_so_thue, trang_thai, ghi_chu').order('ten_khach_thue'),
    db.from('thue_mat_bang').select('*').order('created_at'),
  ])
  const e = b.error || f.error || t.error || l.error
  if (e) return err('Lỗi cơ sở dữ liệu', 500)
  return NextResponse.json({ success: true, buildings: b.data, floors: f.data, tenants: t.data, leases: l.data, today: todayVN(),
    perms: { floor: can(a, 'QUAN_LY_TANG', 'edit'), floorAdd: can(a, 'QUAN_LY_TANG', 'create'), lease: can(a, 'KHACH_THUE', 'edit'), tenantAdd: can(a, 'KHACH_THUE', 'create'), admin: a.superAdmin } })
}

/** keeps the tenant row in step with its leases, so alerts, the bell and the calendar (which read khach_thue) stay right */
async function syncTenant(id: string) {
  const db = supabaseAdmin()
  const { data: act } = await db.from('thue_mat_bang').select('id_tang, ngay_bat_dau, ngay_ket_thuc, dien_tich').eq('id_khach_thue', id).eq('trang_thai', ACTIVE).order('created_at')
  const rows = act ?? []
  if (!rows.length) { await db.from('khach_thue').update({ trang_thai: 'Đã rời đi', id_tang: null }).eq('id', id); return }
  const starts = rows.map((r: any) => r.ngay_bat_dau).filter(Boolean).sort(), ends = rows.map((r: any) => r.ngay_ket_thuc).filter(Boolean).sort()
  const area = rows.reduce((s: number, r: any) => s + (Number(r.dien_tich) || 0), 0)
  await db.from('khach_thue').update({ trang_thai: ACTIVE, id_tang: rows[0].id_tang, ngay_bat_dau: starts[0] ?? null, ngay_ket_thuc: ends[0] ?? null, ...(area ? { dien_tich: area } : {}) }).eq('id', id)
}

export async function POST(req: NextRequest) {
  const a = await getAuth().catch(() => null) as AuthContext | null
  if (!a) return err('Chưa đăng nhập', 401)
  const b = await req.json().catch(() => null)
  if (!b || typeof b !== 'object') return err('Dữ liệu không hợp lệ')
  const db = supabaseAdmin(), op = String(b.op ?? '')
  const need = (m: string, p: 'create' | 'edit' | 'delete') => (can(a, m, p) ? null : err('Bạn không có quyền thực hiện thao tác này', 403))

  if (op === 'thue') { // lease a floor to an existing tenant, or to a new one typed in the form
    const no = need('KHACH_THUE', 'edit'); if (no) return no
    const from = date(b.ngay_bat_dau), to = date(b.ngay_ket_thuc), area = num(b.dien_tich)
    if (from === undefined || to === undefined) return err('Ngày không đúng định dạng')
    if (from && to && to < from) return err('Ngày kết thúc phải sau ngày bắt đầu')
    if (Number.isNaN(area)) return err('Diện tích phải là số không âm')
    const { data: floor } = await db.from('tang').select('id, ten_tang, trang_thai_su_dung').eq('id', String(b.id_tang ?? '')).maybeSingle()
    if (!floor) return err('Tầng không tồn tại')
    if (floor.trang_thai_su_dung === 'Không cho thuê') return err('Tầng này đang đặt là “Không cho thuê”')
    let tenantId = txt(b.id_khach_thue, 40)
    if (!tenantId) {
      const name = txt(b.ten_khach_thue, 200); if (!name) return err('Chọn khách thuê hoặc nhập tên khách mới')
      const mk = need('KHACH_THUE', 'create'); if (mk) return mk
      const { data: nk, error } = await db.from('khach_thue').insert({ ten_khach_thue: name, nguoi_lien_he: txt(b.nguoi_lien_he), dien_thoai: txt(b.dien_thoai, 30), email: txt(b.email, 120), ma_so_thue: txt(b.ma_so_thue, 30), trang_thai: ACTIVE }).select('id').single()
      if (error) return err('Không tạo được khách thuê: ' + error.message.slice(0, 100), 500)
      tenantId = nk.id; await audit(a, 'khach_thue', nk.id, 'create', { ten_khach_thue: name })
    } else {
      const { data: k } = await db.from('khach_thue').select('id').eq('id', tenantId).maybeSingle(); if (!k) return err('Khách thuê không tồn tại')
    }
    const { data: lease, error } = await db.from('thue_mat_bang').insert({ id_tang: floor.id, id_khach_thue: tenantId, ngay_bat_dau: from, ngay_ket_thuc: to, dien_tich: area, gia_thue: txt(b.gia_thue, 100), ghi_chu: txt(b.ghi_chu), trang_thai: ACTIVE, nguoi_tao: a.name }).select('id').single()
    if (error) return err(/ux_thue_dang|duplicate/i.test(error.message) ? 'Khách này đang thuê tầng này rồi' : 'Không lưu được: ' + error.message.slice(0, 100), 409)
    await db.from('tang').update({ trang_thai_su_dung: ACTIVE }).eq('id', floor.id)
    await syncTenant(tenantId!)
    await audit(a, 'khach_thue', tenantId, 'lease', { tang: floor.ten_tang, tu: from, den: to })
    return NextResponse.json({ success: true, message: `Đã ghi nhận cho thuê ${floor.ten_tang}.`, id: lease.id })
  }

  if (op === 'gia_han' || op === 'tra' || op === 'sua_thue' || op === 'xoa_thue') {
    const no = need('KHACH_THUE', op === 'xoa_thue' ? 'delete' : 'edit'); if (no) return no
    const { data: l } = await db.from('thue_mat_bang').select('*').eq('id', String(b.id ?? '')).maybeSingle()
    if (!l) return err('Không tìm thấy lượt thuê', 404)
    const { data: floor } = await db.from('tang').select('ten_tang').eq('id', l.id_tang).maybeSingle()
    if (op === 'xoa_thue') { // a lease entered by mistake (Super Admin): removed without leaving history
      if (!a.superAdmin) return err('Chỉ Super Admin được xóa lượt thuê; dùng “Trả mặt bằng” để kết thúc', 403)
      await db.from('thue_mat_bang').delete().eq('id', l.id)
      await audit(a, 'khach_thue', l.id_khach_thue, 'lease_delete', l)
    } else if (op === 'tra') {
      if (l.trang_thai !== ACTIVE) return err('Lượt thuê này đã kết thúc')
      const d = date(b.ngay_tra) ?? todayVN(); if (d === undefined) return err('Ngày trả không đúng định dạng')
      await db.from('thue_mat_bang').update({ trang_thai: ENDED, ngay_tra: d, ghi_chu: txt(b.ghi_chu) ?? l.ghi_chu, updated_at: new Date().toISOString() }).eq('id', l.id)
      await audit(a, 'khach_thue', l.id_khach_thue, 'lease_end', { tang: floor?.ten_tang, ngay_tra: d })
    } else {
      const from = op === 'sua_thue' ? date(b.ngay_bat_dau) : l.ngay_bat_dau, to = date(b.ngay_ket_thuc), area = op === 'sua_thue' ? num(b.dien_tich) : l.dien_tich
      if (from === undefined || to === undefined) return err('Ngày không đúng định dạng')
      if (op === 'gia_han' && !to) return err('Nhập ngày kết thúc mới')
      if (from && to && to < from) return err('Ngày kết thúc phải sau ngày bắt đầu')
      if (Number.isNaN(area)) return err('Diện tích phải là số không âm')
      const patch: Record<string, any> = { ngay_ket_thuc: to, updated_at: new Date().toISOString() }
      if (op === 'sua_thue') Object.assign(patch, { ngay_bat_dau: from, dien_tich: area, gia_thue: txt(b.gia_thue, 100), ghi_chu: txt(b.ghi_chu) })
      await db.from('thue_mat_bang').update(patch).eq('id', l.id)
      await audit(a, 'khach_thue', l.id_khach_thue, op === 'gia_han' ? 'lease_extend' : 'lease_edit', { tang: floor?.ten_tang, truoc: l.ngay_ket_thuc, sau: to })
    }
    // the floor is free again once nobody rents it (unless it was set aside by hand)
    const { count } = await db.from('thue_mat_bang').select('*', { count: 'exact', head: true }).eq('id_tang', l.id_tang).eq('trang_thai', ACTIVE)
    const { data: fl } = await db.from('tang').select('trang_thai_su_dung').eq('id', l.id_tang).maybeSingle()
    if (!count && fl?.trang_thai_su_dung === ACTIVE) await db.from('tang').update({ trang_thai_su_dung: 'Trống' }).eq('id', l.id_tang)
    if (count && fl?.trang_thai_su_dung !== ACTIVE) await db.from('tang').update({ trang_thai_su_dung: ACTIVE }).eq('id', l.id_tang)
    await syncTenant(l.id_khach_thue)
    return NextResponse.json({ success: true, message: op === 'tra' ? `Đã trả ${floor?.ten_tang ?? 'mặt bằng'}.` : op === 'gia_han' ? 'Đã gia hạn.' : op === 'xoa_thue' ? 'Đã xóa lượt thuê.' : 'Đã lưu.' })
  }

  if (op === 'sua_khach') {
    const no = need('KHACH_THUE', 'edit'); if (no) return no
    const name = txt(b.ten_khach_thue, 200); if (!name) return err('Tên khách thuê là bắt buộc')
    const { data: old } = await db.from('khach_thue').select('*').eq('id', String(b.id ?? '')).maybeSingle(); if (!old) return err('Khách thuê không tồn tại', 404)
    const patch = { ten_khach_thue: name, nguoi_lien_he: txt(b.nguoi_lien_he), dien_thoai: txt(b.dien_thoai, 30), email: txt(b.email, 120), dia_chi: txt(b.dia_chi), ma_so_thue: txt(b.ma_so_thue, 30), ghi_chu: txt(b.ghi_chu, 2000) }
    const { error } = await db.from('khach_thue').update(patch).eq('id', old.id); if (error) return err('Không lưu được', 500)
    await audit(a, 'khach_thue', old.id, 'update', { before: old, after: patch })
    return NextResponse.json({ success: true, message: 'Đã lưu thông tin khách.' })
  }

  if (op === 'sua_tang' || op === 'them_tang') {
    const no = need('QUAN_LY_TANG', op === 'them_tang' ? 'create' : 'edit'); if (no) return no
    const name = txt(b.ten_tang, 100); if (!name) return err('Tên tầng / khu là bắt buộc')
    const area = num(b.dien_tich); if (Number.isNaN(area)) return err('Diện tích phải là số không âm')
    const st = String(b.trang_thai_su_dung ?? 'Trống'); if (!['Trống', 'Đang thuê', 'Giữ chỗ', 'Không cho thuê'].includes(st)) return err('Trạng thái không hợp lệ')
    let building = txt(b.id_toa_nha, 60)
    if (!building && txt(b.ten_toa_nha_moi, 120)) { // a new building is just a name typed here
      const nm = txt(b.ten_toa_nha_moi, 120)!, id = nm.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/gi, 'd').toLowerCase().replace(/[^a-z0-9]+/g, '').slice(0, 40) || `tn${Date.now()}`
      const { error } = await db.from('toa_nha').upsert({ id, ten_toa_nha: nm, dia_chi_toa_nha: txt(b.dia_chi_toa_nha) }, { onConflict: 'id' }); if (error) return err('Không tạo được tòa nhà', 500)
      building = id; await audit(a, 'toa_nha', id, 'create', { ten_toa_nha: nm })
    }
    const patch: Record<string, any> = { id_toa_nha: building, ten_tang: name, ma_tang_khu_vuc: txt(b.ma_tang_khu_vuc, 40), dien_tich: area, bao_gia: txt(b.bao_gia, 200), ghi_chu: txt(b.ghi_chu, 2000) }
    if (op === 'them_tang') {
      const id = txt(b.ma_moi, 30)?.toUpperCase().replace(/[^A-Z0-9-]/g, '') || `TG${Date.now().toString(36).toUpperCase()}`
      const { error } = await db.from('tang').insert({ id, ...patch, trang_thai_su_dung: st === ACTIVE ? 'Trống' : st }); if (error) return err(/duplicate/i.test(error.message) ? 'Mã tầng đã tồn tại' : 'Không tạo được tầng', 409)
      await audit(a, 'tang', id, 'create', patch)
      return NextResponse.json({ success: true, message: `Đã thêm ${name}.` })
    }
    const { data: old } = await db.from('tang').select('*').eq('id', String(b.id ?? '')).maybeSingle(); if (!old) return err('Tầng không tồn tại', 404)
    const { count } = await db.from('thue_mat_bang').select('*', { count: 'exact', head: true }).eq('id_tang', old.id).eq('trang_thai', ACTIVE)
    // the rented state follows the leases; only the "set aside" states are chosen by hand
    patch.trang_thai_su_dung = count ? ACTIVE : st === ACTIVE ? 'Trống' : st
    const { error } = await db.from('tang').update(patch).eq('id', old.id); if (error) return err('Không lưu được', 500)
    await audit(a, 'tang', old.id, 'update', { before: old, after: patch })
    return NextResponse.json({ success: true, message: 'Đã lưu thông tin tầng.' })
  }
  return err('Thao tác không hợp lệ')
}
