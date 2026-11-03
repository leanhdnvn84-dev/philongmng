import 'server-only'
import { supabaseAdmin } from '@/lib/supabase/admin'
import type { AuthContext } from '@/lib/auth'
import type { Resource } from '@/lib/resources'

// ---------- Vietnam time helpers ----------
const vnParts = () => {
  const p = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Ho_Chi_Minh', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false,
  }).formatToParts(new Date())
  const g = (t: string) => p.find((x) => x.type === t)?.value ?? ''
  return { y: g('year'), m: g('month'), d: g('day'), hh: g('hour') === '24' ? '00' : g('hour'), mm: g('minute') }
}
export const todayVN = () => { const p = vnParts(); return `${p.y}-${p.m}-${p.d}` }
export const timeVN = () => { const p = vnParts(); return `${p.hh}:${p.mm}` }
export const dayMonthVN = () => { const p = vnParts(); return `${p.d}/${p.m}` }

const DATE = /^\d{4}-\d{2}-\d{2}$/
const MONTH = /^\d{4}-(0[1-9]|1[0-2])$/

/** Keep only declared, writable columns and normalise form values. */
export function sanitize(res: Resource, body: any, creating: boolean) {
  const out: Record<string, any> = {}
  const errors: string[] = []
  for (const f of res.fields) {
    if (f.createOnly || f.ro || f.inForm === false) continue
    if (!(f.name in (body ?? {}))) {
      if (creating && f.required && f.default === undefined) errors.push(`${f.label} là bắt buộc`)
      continue
    }
    let v = body[f.name]
    if (f.type === 'bool') { out[f.name] = v === true || v === 'true' || v === 'on' || v === 1 || v === '1'; continue }
    if (typeof v === 'string') v = v.trim()
    if (v === '' || v === undefined) v = null
    if (v === null) { if (f.required) errors.push(`${f.label} là bắt buộc`); else out[f.name] = null; continue }
    if (f.type === 'number' || f.type === 'money') {
      v = Number(v)
      if (!Number.isFinite(v)) { errors.push(`${f.label} phải là số`); continue }
    } else if (f.type === 'date') {
      if (!DATE.test(String(v))) { errors.push(`${f.label} không đúng định dạng ngày`); continue }
    } else if (f.type === 'month') {
      if (!MONTH.test(String(v))) { errors.push(`${f.label} phải có dạng YYYY-MM`); continue }
    } else {
      v = String(v).slice(0, f.type === 'textarea' ? 20000 : 500)
      // block spreadsheet formula injection when data is exported back to Sheets/Excel
      if (/^[=+@]/.test(v)) { errors.push(`${f.label} không được bắt đầu bằng = + @`); continue }
    }
    out[f.name] = v
  }
  if (creating) for (const f of res.fields) {
    if (out[f.name] === undefined && f.default !== undefined && !f.ro && !f.createOnly) out[f.name] = f.default
  }
  return { data: out, errors }
}

export async function audit(auth: AuthContext, table: string, recordId: string | null, action: string, changes: unknown) {
  await supabaseAdmin().from('audit_logs').insert({
    user_id: auth.userId, user_email: auth.email, table_name: table, record_id: recordId, action, changes,
  })
}

const isDone = (s: unknown) => /hoàn thành/i.test(String(s ?? '')) && !/chưa/i.test(String(s ?? ''))

/** Per-module business rules. May fill derived fields in `data`. Returns an error to reject. */
export async function validate(
  res: Resource, data: Record<string, any>, existing: any | null, auth: AuthContext
): Promise<string | null> {
  const admin = supabaseAdmin()
  const merged = { ...existing, ...data }

  switch (res.key) {
    case 'cong_viec':
    case 'cong_viec_hang_ngay':
      if (isDone(data.trang_thai) && !merged.ngay_hoan_thanh) data.ngay_hoan_thanh = todayVN()
      if (res.key === 'cong_viec' && merged.ngay_giao && merged.deadline && merged.deadline < merged.ngay_giao)
        return 'Hạn hoàn thành không được trước ngày giao'
      if (!existing && res.key === 'cong_viec' && !data.ngay_giao) data.ngay_giao = todayVN()
      break

    case 'khach_ra_vao':
      if (!existing) {
        data.ngay ??= todayVN()
        if (data.trang_thai !== 'Hẹn trước') data.gio_vao ??= timeVN()
        data.nguoi_dang_ky = auth.name
      }
      break

    case 'nhat_ky_bao_tri': {
      // every area + item pair has exactly one schedule; logs link to it (as in V191)
      const { data: lich } = await admin.from('lich_bao_tri').select('id')
        .eq('id_khu_vuc', merged.id_khu_vuc).eq('id_hang_muc', merged.id_hang_muc).maybeSingle()
      if (lich) data.id_lich = lich.id
      else {
        const { data: created, error } = await admin.from('lich_bao_tri')
          .insert({ id_khu_vuc: merged.id_khu_vuc, id_hang_muc: merged.id_hang_muc }).select('id').single()
        if (error) return 'Không tạo được lịch bảo trì cho khu vực + hạng mục này'
        data.id_lich = created.id
      }
      if (merged.ngay_thuc_hien > todayVN()) return 'Ngày thực hiện không được ở tương lai'
      break
    }

    case 'de_xuat_chi_tiet': {
      const { data: dx } = await admin.from('de_xuat').select('trang_thai, loai_de_xuat').eq('id', merged.id_de_xuat).maybeSingle()
      if (!dx) return 'Đề xuất không tồn tại'
      if (dx.trang_thai === 'Đã duyệt') return 'Đề xuất đã duyệt, không thể thay đổi chi tiết'
      if (!merged.id_vat_tu && !merged.id_thiet_bi && !merged.ten) return 'Chọn vật tư / thiết bị hoặc nhập tên'
      if (dx.loai_de_xuat === 'MUA_VAT_TU' && !merged.id_vat_tu) return 'Đề xuất mua vật tư phải chọn vật tư trong danh mục'
      break
    }

    case 'thiet_bi':
      if (data.serial) {
        let q = admin.from('thiet_bi').select('id').eq('serial', data.serial)
        if (existing) q = q.neq('id', existing.id)
        const { data: dup } = await q.limit(1)
        if (dup?.length) return `Serial đã tồn tại ở thiết bị ${dup[0].id}`
      }
      break

    case 'tien_dien':
      if (merged.chi_so_cu != null && merged.chi_so_moi != null && Number(merged.chi_so_moi) < Number(merged.chi_so_cu))
        return 'Chỉ số mới không được nhỏ hơn chỉ số cũ'
      data.nguoi_cap_nhat = auth.name
      break

    case 'vai_tro':
      if (!auth.superAdmin && ('sieu_quan_tri' in data) && data.sieu_quan_tri !== !!existing?.sieu_quan_tri)
        return 'Chỉ Super Admin được cấp quyền toàn hệ thống'
      if (!auth.superAdmin && existing?.sieu_quan_tri) return 'Chỉ Super Admin được sửa vai trò này'
      break

    case 'users':
      if (data.id_vai_tro && data.id_vai_tro !== existing?.id_vai_tro && !auth.superAdmin) {
        const { data: r } = await admin.from('vai_tro').select('sieu_quan_tri').eq('id', data.id_vai_tro).maybeSingle()
        if (r?.sieu_quan_tri) return 'Chỉ Super Admin được gán vai trò Super Admin'
      }
      break

    case 'phan_quyen':
      if (!auth.superAdmin && merged.id_vai_tro === auth.roleId) return 'Không thể tự sửa quyền của vai trò mình đang dùng'
      break
  }
  return null
}

/** Rules that must also run before deleting. */
export async function validateDelete(res: Resource, existing: any): Promise<string | null> {
  if (res.key === 'de_xuat_chi_tiet') {
    const { data: dx } = await supabaseAdmin().from('de_xuat').select('trang_thai').eq('id', existing.id_de_xuat).maybeSingle()
    if (dx?.trang_thai === 'Đã duyệt') return 'Đề xuất đã duyệt, không thể xóa dòng'
  }
  return res.locked?.(existing) ?? null
}
