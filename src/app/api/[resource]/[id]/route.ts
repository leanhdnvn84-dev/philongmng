import { NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { guard, ok, fail, dbError, validId } from '@/lib/http'
import { sanitize, validate, validateDelete, audit } from '@/lib/crud'

type Ctx = { params: { resource: string; id: string } }

export async function GET(_req: NextRequest, { params }: Ctx) {
  const g = await guard(params.resource, 'view')
  if (g instanceof Response) return g
  const { res } = g
  if (!validId(res, params.id)) return fail('Mã không hợp lệ')
  const { data, error } = await supabaseAdmin().from(res.view ?? res.table).select('*').eq('id', params.id).maybeSingle()
  if (error) return dbError(error)
  return data ? ok({ data }) : fail('Không tìm thấy', 404)
}

export async function PATCH(req: NextRequest, { params }: Ctx) {
  const g = await guard(params.resource, 'edit')
  if (g instanceof Response) return g
  const { res, auth } = g
  if (!validId(res, params.id)) return fail('Mã không hợp lệ')
  const body = await req.json().catch(() => null)
  if (!body || typeof body !== 'object') return fail('Dữ liệu không hợp lệ')

  const db = supabaseAdmin()
  const { data: existing } = await db.from(res.table).select('*').eq('id', params.id).maybeSingle()
  if (!existing) return fail('Không tìm thấy', 404)
  const locked = res.locked?.(existing)
  if (locked) return fail(locked, 409)

  const { data, errors } = sanitize(res, body, false)
  if (errors.length) return fail(errors.join('; '))

  if (res.key === 'users') {
    if (params.id === auth.userId && ((data.trang_thai && data.trang_thai !== 'Hoạt động') || (data.id_vai_tro && data.id_vai_tro !== existing.id_vai_tro)))
      return fail('Không thể tự khóa hoặc đổi vai trò của chính mình')
  }
  const bad = await validate(res, data, existing, auth)
  if (bad) return fail(bad)

  if (res.key === 'users') {
    if (data.email && data.email !== existing.email) {
      const { error: e } = await db.auth.admin.updateUserById(params.id, { email: data.email, email_confirm: true })
      if (e) return fail('Không cập nhật được email', 409)
    }
    if (body.password) {
      if (String(body.password).length < 8) return fail('Mật khẩu tối thiểu 8 ký tự')
      const { error: e } = await db.auth.admin.updateUserById(params.id, { password: String(body.password) })
      if (e) return fail('Không đổi được mật khẩu')
    }
  }
  if (!Object.keys(data).length) return ok({ data: existing })

  const { data: rows, error } = await db.from(res.table).update(data).eq('id', params.id).select()
  if (error) return dbError(error)
  await audit(auth, res.table, params.id, 'update', { before: existing, after: data })
  return ok({ data: rows[0] })
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const g = await guard(params.resource, 'delete')
  if (g instanceof Response) return g
  const { res, auth } = g
  if (!validId(res, params.id)) return fail('Mã không hợp lệ')
  if (res.key === 'users' && params.id === auth.userId) return fail('Không thể xóa chính mình')

  const db = supabaseAdmin()
  const { data: existing } = await db.from(res.table).select('*').eq('id', params.id).maybeSingle()
  if (!existing) return fail('Không tìm thấy', 404)
  const bad = await validateDelete(res, existing)
  if (bad) return fail(bad, 409)

  if (res.key === 'users') {
    const { error } = await db.auth.admin.deleteUser(params.id) // cascades to public.users
    if (error) return fail('Không xóa được tài khoản', 409)
  } else {
    const { error } = await db.from(res.table).delete().eq('id', params.id)
    if (error) return dbError(error)
  }
  // the deleted row is kept in the audit log (like DATA_AUDIT_ARCHIVE)
  await audit(auth, res.table, params.id, 'delete', existing)
  return ok()
}
