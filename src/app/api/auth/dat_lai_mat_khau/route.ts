import { NextResponse } from 'next/server'
import crypto from 'node:crypto'
import { supabaseAdmin } from '@/lib/supabase/admin'

export const runtime = 'nodejs'

/** Sets a new password from the e-mailed link (single use, 30 minutes). */
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}))
  const token = String(body.token ?? ''), password = String(body.password ?? '')
  if (!/^[A-Za-z0-9_-]{30,80}$/.test(token)) return NextResponse.json({ success: false, error: 'Đường dẫn không hợp lệ' }, { status: 400 })
  if (password.length < 8 || password.length > 128) return NextResponse.json({ success: false, error: 'Mật khẩu từ 8 đến 128 ký tự' }, { status: 400 })
  const db = supabaseAdmin(), hash = crypto.createHash('sha256').update(token).digest('hex')
  // claim the link first (only one request can flip used_at), then change the password
  const { data: claimed } = await db.from('dat_lai_mat_khau').update({ used_at: new Date().toISOString() }).eq('token_hash', hash).is('used_at', null).gt('expires_at', new Date().toISOString()).select('user_id').maybeSingle()
  if (!claimed) return NextResponse.json({ success: false, error: 'Đường dẫn đã hết hạn hoặc đã dùng. Hãy gửi lại yêu cầu.' }, { status: 400 })
  const { error } = await db.auth.admin.updateUserById(claimed.user_id, { password, user_metadata: { doi_mat_khau: false } })
  if (error) return NextResponse.json({ success: false, error: 'Không đặt được mật khẩu, thử lại' }, { status: 500 })
  await db.from('legacy_auth').delete().eq('user_id', claimed.user_id).then(() => {}, () => {})
  const { data: u } = await db.from('users').select('email, ten_dang_nhap').eq('id', claimed.user_id).maybeSingle()
  // a successful reset also lifts a temporary lock
  if (u) await db.from('dang_nhap_sai').delete().in('ident', [u.email, u.ten_dang_nhap].filter(Boolean).map((x: string) => x.toLowerCase())).then(() => {}, () => {})
  await db.from('audit_logs').insert({ user_id: claimed.user_id, user_email: u?.email ?? null, table_name: 'users', record_id: claimed.user_id, action: 'password_reset', changes: {} }).then(() => {}, () => {})
  return NextResponse.json({ success: true })
}
