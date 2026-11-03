import { NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { guard, ok, fail, dbError } from '@/lib/http'
import { sanitize, validate, afterWrite, audit } from '@/lib/crud'

type Ctx = { params: { resource: string; id: string } }
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export async function GET(_req: NextRequest, { params }: Ctx) {
  const g = await guard(params.resource, 'view')
  if (g instanceof Response) return g
  if (!UUID.test(params.id)) return fail('ID không hợp lệ')
  const { data, error } = await supabaseAdmin().from(g.res.table).select('*').eq('id', params.id).maybeSingle()
  if (error) return dbError(error)
  return data ? ok({ data }) : fail('Không tìm thấy', 404)
}

export async function PATCH(req: NextRequest, { params }: Ctx) {
  const g = await guard(params.resource, 'edit')
  if (g instanceof Response) return g
  const { res, auth } = g
  if (!UUID.test(params.id)) return fail('ID không hợp lệ')
  const body = await req.json().catch(() => null)
  if (!body || typeof body !== 'object') return fail('Dữ liệu không hợp lệ')

  const admin = supabaseAdmin()
  const { data: existing } = await admin.from(res.table).select('*').eq('id', params.id).maybeSingle()
  if (!existing) return fail('Không tìm thấy', 404)

  const { data, errors } = sanitize(res, body, false)
  if (errors.length) return fail(errors.join('; '))
  if (res.key === 'users') {
    // keep auth + profile email aligned, and never let someone lock themselves out
    if (params.id === auth.userId && (data.status === 'inactive' || (data.role_id && data.role_id !== existing.role_id)))
      return fail('Không thể tự khóa hoặc đổi vai trò của chính mình')
    if (data.email && data.email !== existing.email) {
      const { error: e } = await admin.auth.admin.updateUserById(params.id, { email: data.email, email_confirm: true })
      if (e) return fail('Không cập nhật được email', 409)
    }
    if (body.password) {
      if (String(body.password).length < 8) return fail('Mật khẩu tối thiểu 8 ký tự')
      const { error: e } = await admin.auth.admin.updateUserById(params.id, { password: String(body.password) })
      if (e) return fail('Không đổi được mật khẩu')
    }
  }
  const bad = await validate(res, data, existing)
  if (bad) return fail(bad)
  if (!Object.keys(data).length) return ok({ data: existing })

  const { data: rows, error } = await admin.from(res.table).update(data).eq('id', params.id).select()
  if (error) return dbError(error)
  await afterWrite(res, rows[0], existing)
  await audit(auth.userId, res.table, params.id, 'update', data)
  return ok({ data: rows[0] })
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const g = await guard(params.resource, 'delete')
  if (g instanceof Response) return g
  const { res, auth } = g
  if (!UUID.test(params.id)) return fail('ID không hợp lệ')
  if (res.key === 'users' && params.id === auth.userId) return fail('Không thể xóa chính mình')

  const admin = supabaseAdmin()
  const { data: existing } = await admin.from(res.table).select('*').eq('id', params.id).maybeSingle()
  if (!existing) return fail('Không tìm thấy', 404)

  if (res.key === 'users') {
    const { error } = await admin.auth.admin.deleteUser(params.id) // cascades to public.users
    if (error) return fail('Không xóa được tài khoản', 409)
  } else {
    const { error } = await admin.from(res.table).delete().eq('id', params.id)
    if (error) return dbError(error)
  }
  await afterWrite(res, null, existing)
  await audit(auth.userId, res.table, params.id, 'delete', existing)
  return ok()
}
