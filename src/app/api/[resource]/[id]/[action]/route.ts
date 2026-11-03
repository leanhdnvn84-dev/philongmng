import { NextRequest } from 'next/server'
import { guard, ok, fail, dbError, validId } from '@/lib/http'
import { runAction, ActionError } from '@/lib/actions'

type Ctx = { params: { resource: string; id: string; action: string } }

// POST /api/<resource>/<id>/<action>   (id "_" for toolbar/page actions)
export async function POST(req: NextRequest, { params }: Ctx) {
  const pre = await guard(params.resource, 'view')
  if (pre instanceof Response) return pre
  const action = pre.res.actions?.find((a) => a.key === params.action)
  if (!action) return fail('Thao tác không tồn tại', 404)
  const g = await guard(params.resource, action.perm === 'approve' ? 'approve' : action.perm === 'view' ? 'view' : action.perm)
  if (g instanceof Response) return g
  if ((action.scope ?? 'row') === 'row' && !validId(g.res, params.id)) return fail('Mã không hợp lệ')

  const input = await req.json().catch(() => ({}))
  try {
    const result = await runAction(g.res, params.action, params.id, g.auth, input && typeof input === 'object' ? input : {})
    return ok({ data: result ?? null })
  } catch (e: any) {
    if (e instanceof ActionError) return fail(e.message, e.status)
    if (e?.code) return dbError(e)
    console.error('[action]', e)
    return fail('Lỗi máy chủ', 500)
  }
}
