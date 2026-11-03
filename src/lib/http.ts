import { NextResponse } from 'next/server'
import { getAuth, can, Action, AuthContext } from '@/lib/auth'
import { getResource, Resource } from '@/lib/resources'

export const fail = (error: string, status = 400) => NextResponse.json({ success: false, error }, { status })
export const ok = (body: Record<string, unknown> = {}) => NextResponse.json({ success: true, ...body })

export function dbError(e: { message: string; code?: string }) {
  // Postgres unique / FK violations get readable messages; everything else is generic
  if (e.code === '23505') return fail('Dữ liệu bị trùng (đã tồn tại)', 409)
  if (e.code === '23503') return fail('Dữ liệu đang được liên kết hoặc tham chiếu không tồn tại', 409)
  if (e.code === '22P02') return fail('Giá trị không hợp lệ')
  console.error('[db]', e)
  return fail('Lỗi cơ sở dữ liệu', 500)
}

/** Shared guard: resolves auth + resource, checks permission. */
export async function guard(
  resourceKey: string,
  action: Action,
  opts: { skipPermission?: boolean } = {}
): Promise<{ auth: AuthContext; res: Resource } | NextResponse> {
  const res = getResource(resourceKey)
  if (!res) return fail('Không tìm thấy', 404)
  const auth = await getAuth()
  if (!auth) return fail('Chưa đăng nhập hoặc tài khoản bị khóa', 401)
  if (!opts.skipPermission && !can(auth, res.module, action)) return fail('Bạn không có quyền thực hiện thao tác này', 403)
  if (res.readonly && action !== 'view') return fail('Không hỗ trợ', 405)
  return { auth, res }
}
