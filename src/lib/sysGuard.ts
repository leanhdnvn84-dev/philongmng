import 'server-only'
import { NextResponse } from 'next/server'
import { getAuth, can, AuthContext, TransientAuthError } from '@/lib/auth'

/** Auth for the system pages: `admin` = Super Admin only, otherwise the NGUOI_SU_DUNG view permission. */
export async function sysGuard(admin: boolean): Promise<AuthContext | NextResponse> {
  let auth: AuthContext | null
  try { auth = await getAuth() } catch (e) {
    if (e instanceof TransientAuthError) return NextResponse.json({ success: false, error: 'Máy chủ đang bận, đang thử lại…' }, { status: 503 })
    throw e
  }
  if (!auth) return NextResponse.json({ success: false, error: 'Chưa đăng nhập hoặc tài khoản bị khóa' }, { status: 401 })
  if (admin ? !auth.superAdmin : !can(auth, 'NGUOI_SU_DUNG', 'view'))
    return NextResponse.json({ success: false, error: admin ? 'Chỉ quản trị viên cao nhất được sao lưu / khôi phục' : 'Bạn không có quyền' }, { status: 403 })
  return auth
}
