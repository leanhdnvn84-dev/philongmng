import 'server-only'
import { NextResponse } from 'next/server'
import { getAuth, can, AuthContext } from '@/lib/auth'
import { getResource, Resource, Perm } from '@/lib/resources'

export const fail = (error: string, status = 400) => NextResponse.json({ success: false, error }, { status })
export const ok = (body: Record<string, unknown> = {}) => NextResponse.json({ success: true, ...body })

const RAISED: Record<string, string> = {
  TON_KHO_KHONG_DU: 'Tồn kho không đủ để xuất',
  VAT_TU_KHONG_TON_TAI: 'Vật tư không tồn tại',
  SO_LUONG_KHONG_HOP_LE: 'Số lượng phải lớn hơn 0',
  LOAI_GIAO_DICH_KHONG_HOP_LE: 'Loại giao dịch không hợp lệ',
}

export function dbError(e: { message: string; code?: string; details?: string }) {
  if (e.code === 'P0001') {
    const key = e.message.split(':')[0]
    const extra = e.message.includes(':') ? ` (tồn hiện tại: ${e.message.split(':')[1]})` : ''
    return fail((RAISED[key] ?? 'Thao tác không hợp lệ') + extra, 409)
  }
  if (e.code === '23505') return fail('Dữ liệu bị trùng (đã tồn tại)', 409)
  if (e.code === '23503') return fail('Dữ liệu đang được dùng ở nơi khác hoặc tham chiếu không tồn tại', 409)
  if (e.code === '23514') return fail('Dữ liệu vi phạm ràng buộc (ví dụ: số âm, ngày kết thúc trước ngày bắt đầu)')
  if (e.code === '22P02' || e.code === '22007' || e.code === '22008') return fail('Giá trị không hợp lệ')
  console.error('[db]', e)
  return fail('Lỗi cơ sở dữ liệu', 500)
}

export const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const TEXT_ID = /^[A-Za-z0-9_.-]{1,64}$/
/** users are keyed by auth UUID, everything else by the V191 text code (CV0001…) */
export const validId = (res: Resource, id: string) => (res.key === 'users' ? UUID : TEXT_ID).test(id)

/** Resolve auth + resource and check one permission. */
export async function guard(
  resourceKey: string, perm: Perm, opts: { skipPermission?: boolean } = {}
): Promise<{ auth: AuthContext; res: Resource } | NextResponse> {
  const res = getResource(resourceKey)
  if (!res) return fail('Không tìm thấy', 404)
  const auth = await getAuth()
  if (!auth) return fail('Chưa đăng nhập hoặc tài khoản bị khóa', 401)
  if (!opts.skipPermission && !can(auth, res.module, perm)) return fail('Bạn không có quyền thực hiện thao tác này', 403)
  if ((perm === 'create' && res.noCreate) || (perm === 'edit' && res.noEdit) || (perm === 'delete' && res.noDelete))
    return fail('Thao tác này không được phép trên mục này', 405)
  return { auth, res }
}
