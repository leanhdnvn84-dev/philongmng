import { NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { guard, ok, fail, dbError } from '@/lib/http'
import { sanitize, validate, audit } from '@/lib/crud'

type Ctx = { params: { resource: string } }

export async function GET(req: NextRequest, { params }: Ctx) {
  const url = new URL(req.url)
  const optionsMode = url.searchParams.get('options') === '1'
  // dropdown labels are available to every active user; full lists need 'view'
  const g = await guard(params.resource, 'view', { skipPermission: optionsMode })
  if (g instanceof Response) return g
  const { res } = g
  const db = supabaseAdmin()

  if (optionsMode) {
    const { data, error } = await db.from(res.table).select(res.optionSelect ?? '*').limit(5000)
    if (error) return dbError(error)
    const options = (data as any[]).map((r) => ({ value: r.id, label: res.optionLabel(r) }))
      .sort((a, b) => String(a.label).localeCompare(String(b.label), 'vi'))
    return ok({ data: options })
  }

  const page = Math.max(1, parseInt(url.searchParams.get('page') || '1') || 1)
  const pageSize = Math.min(2000, Math.max(1, parseInt(url.searchParams.get('pageSize') || '50') || 50))
  let query = db.from(res.view ?? res.table).select('*', { count: 'exact' })

  // equality filters on declared fields only (column names never come from the client)
  for (const f of res.fields) {
    const v = url.searchParams.get(f.name)
    if (v === null || v === '' || f.type === 'password') continue
    query = f.type === 'bool' ? query.eq(f.name, v === 'true') : query.eq(f.name, v)
  }
  const search = (url.searchParams.get('search') || '').replace(/[,()%*\\"]/g, ' ').trim().slice(0, 100)
  if (search && res.searchFields.length) {
    query = query.or(res.searchFields.map((f) => `${f}.ilike.%${search}%`).join(','))
  }
  const { data, error, count } = await query
    .order(res.orderBy.column, { ascending: res.orderBy.ascending, nullsFirst: false })
    .order('id', { ascending: false })
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
  if (res.key === 'users' && (!body.password || String(body.password).length < 8)) errors.push('Mật khẩu tối thiểu 8 ký tự')
  if (errors.length) return fail(errors.join('; '))
  const bad = await validate(res, data, null, auth)
  if (bad) return fail(bad)

  const db = supabaseAdmin()
  let authUserId: string | null = null
  if (res.key === 'users') {
    const { data: created, error: e } = await db.auth.admin.createUser({ email: data.email, password: String(body.password), email_confirm: true })
    if (e) return fail(/already|registered|exists/i.test(e.message) ? 'Email đã tồn tại' : 'Không tạo được tài khoản', 409)
    authUserId = created.user.id
    data.id = authUserId
  }

  const { data: rows, error } = await db.from(res.table).insert(data).select()
  if (error) {
    if (authUserId) await db.auth.admin.deleteUser(authUserId) // no orphan login
    return dbError(error)
  }
  await audit(auth, res.table, rows[0].id, 'create', data)
  return ok({ data: rows[0] })
}
