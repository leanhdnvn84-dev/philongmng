import { NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { guard, ok, fail, dbError } from '@/lib/http'
import { sanitize, validate, afterWrite, audit } from '@/lib/crud'

type Ctx = { params: { resource: string } }

export async function GET(req: NextRequest, { params }: Ctx) {
  const url = new URL(req.url)
  const optionsMode = url.searchParams.get('options') === '1'
  // Dropdown labels are available to any active user; full lists need the 'view' permission.
  const g = await guard(params.resource, 'view', { skipPermission: optionsMode })
  if (g instanceof Response) return g
  const { res } = g
  const q = supabaseAdmin()

  if (optionsMode) {
    const { data, error } = await q.from(res.table).select(res.optionSelect ?? '*').limit(2000)
    if (error) return dbError(error)
    const options = (data as any[]).map((r) => ({ value: r.id, label: res.optionLabel(r) }))
      .sort((a, b) => a.label.localeCompare(b.label, 'vi'))
    return ok({ data: options })
  }

  const page = Math.max(1, parseInt(url.searchParams.get('page') || '1'))
  const pageSize = Math.min(1000, Math.max(1, parseInt(url.searchParams.get('pageSize') || '20')))
  let query = q.from(res.table).select('*', { count: 'exact' })

  // equality filters on declared select/ref fields only
  for (const f of res.fields) {
    const v = url.searchParams.get(f.name)
    if (v && (f.type === 'select' || f.type === 'ref')) query = query.eq(f.name, v)
  }
  const search = (url.searchParams.get('search') || '').replace(/[,()%*\\]/g, ' ').trim()
  if (search && res.searchFields.length) {
    query = query.or(res.searchFields.map((f) => `${f}.ilike.%${search}%`).join(','))
  }
  const { data, error, count } = await query
    .order(res.orderBy.column, { ascending: res.orderBy.ascending })
    .range((page - 1) * pageSize, page * pageSize - 1)
  if (error) return dbError(error)
  return ok({ data, total: count ?? 0, page, pageSize })
}

export async function POST(req: NextRequest, { params }: Ctx) {
  const g = await guard(params.resource, 'create')
  if (g instanceof Response) return g
  const { res, auth } = g
  const body = await req.json().catch(() => null)
  if (!body || typeof body !== 'object') return fail('Dữ liệu không hợp lệ')

  const { data, errors } = sanitize(res, body, true)
  for (const f of res.fields) if (f.default !== undefined && data[f.name] === undefined) data[f.name] = f.default
  if (res.key === 'users') {
    if (!body.password || String(body.password).length < 8) errors.push('Mật khẩu tối thiểu 8 ký tự')
  }
  if (errors.length) return fail(errors.join('; '))
  const bad = await validate(res, data, null)
  if (bad) return fail(bad)

  const admin = supabaseAdmin()
  let authUserId: string | null = null
  if (res.key === 'users') {
    const { data: created, error: aerr } = await admin.auth.admin.createUser({
      email: data.email, password: String(body.password), email_confirm: true,
    })
    if (aerr) return fail(aerr.message.includes('already') ? 'Email đã tồn tại' : 'Không tạo được tài khoản', 409)
    authUserId = created.user.id
    data.id = authUserId
  }

  const { data: rows, error } = await admin.from(res.table).insert(data).select()
  if (error) {
    if (authUserId) await admin.auth.admin.deleteUser(authUserId) // roll back orphan auth user
    return dbError(error)
  }
  await afterWrite(res, rows[0], null)
  await audit(auth.userId, res.table, rows[0].id, 'create', data)
  return ok({ data: rows[0] })
}
