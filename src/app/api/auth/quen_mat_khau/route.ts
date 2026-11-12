import { NextResponse } from 'next/server'
import crypto from 'node:crypto'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { driveConfigured, sendMailViaScript } from '@/lib/driveUpload'

export const runtime = 'nodejs'
// the same answer whether or not the account exists, so the form cannot be used to find accounts
const SAME = 'Nếu tài khoản tồn tại và có email, đường dẫn đặt lại mật khẩu đã được gửi. Kiểm tra hộp thư (cả mục Spam) trong vài phút.'
const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]!))

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}))
  const ident = String(body.identifier ?? '').trim().toLowerCase().replace(/[,()]/g, '')
  if (!ident || ident.length > 200) return NextResponse.json({ success: false, error: 'Nhập tên đăng nhập hoặc email' }, { status: 400 })
  if (!driveConfigured()) return NextResponse.json({ success: false, error: 'Hệ thống chưa cấu hình gửi email. Liên hệ quản trị để cấp lại mật khẩu.' }, { status: 503 })
  const db = supabaseAdmin()
  const { data: u } = await db.from('users').select('id, email, ho_ten, trang_thai').or(`email.eq.${ident},ten_dang_nhap.eq.${ident}`).limit(2)
  const user = u?.length === 1 ? u[0] : null
  if (!user || user.trang_thai === 'Khóa' || !/@/.test(user.email ?? '')) return NextResponse.json({ success: true, message: SAME })
  // at most 3 links per account per hour
  const { count } = await db.from('dat_lai_mat_khau').select('*', { count: 'exact', head: true }).eq('user_id', user.id).gte('created_at', new Date(Date.now() - 3600_000).toISOString())
  if ((count ?? 0) >= 3) return NextResponse.json({ success: true, message: SAME })
  const token = crypto.randomBytes(32).toString('base64url')
  const { error } = await db.from('dat_lai_mat_khau').insert({ token_hash: crypto.createHash('sha256').update(token).digest('hex'), user_id: user.id, expires_at: new Date(Date.now() + 30 * 60_000).toISOString() })
  if (error) return NextResponse.json({ success: false, error: 'Lỗi hệ thống, thử lại sau' }, { status: 500 })
  const link = `${new URL(req.url).origin}/dat-lai-mat-khau?t=${token}`
  try {
    await sendMailViaScript([user.email], '[Phi Long] Đặt lại mật khẩu', `<div style="font-family:Arial,sans-serif;font-size:14px;color:#111">
      <p>Xin chào ${esc(user.ho_ten || '')},</p><p>Có yêu cầu đặt lại mật khẩu cho tài khoản PHILONG BUILDING của bạn. Bấm nút dưới đây trong 30 phút tới:</p>
      <p><a href="${link}" style="display:inline-block;background:#d91828;color:#fff;padding:10px 18px;border-radius:8px;text-decoration:none;font-weight:bold">Đặt mật khẩu mới</a></p>
      <p style="color:#555">Nếu bạn không yêu cầu, hãy bỏ qua thư này; mật khẩu hiện tại vẫn giữ nguyên.</p></div>`)
  } catch (e: any) {
    console.error('[quen_mat_khau]', e)
    return NextResponse.json({ success: false, error: 'Chưa gửi được email (hệ thống gửi thư đang lỗi). Liên hệ quản trị để cấp lại mật khẩu.' }, { status: 502 })
  }
  return NextResponse.json({ success: true, message: SAME })
}
