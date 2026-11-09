import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getAuth } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { audit } from '@/lib/crud'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
const fail = (error: string, status = 400) => NextResponse.json({ success: false, error }, { status })

// per-user throttle for wrong current passwords (best effort, per server instance)
const wrong = new Map<string, { n: number; until: number }>()

/** A signed-in user changes their own password (the current one must be confirmed). */
export async function POST(req: Request) {
  const auth = await getAuth()
  if (!auth) return fail('Chưa đăng nhập', 401)
  const body = await req.json().catch(() => ({}))
  const cur = String(body.current ?? ''), next = String(body.next ?? '')
  if (!cur) return fail('Nhập mật khẩu hiện tại')
  if (next.length < 8) return fail('Mật khẩu mới tối thiểu 8 ký tự')
  if (next.length > 128) return fail('Mật khẩu mới quá dài')
  if (next === cur) return fail('Mật khẩu mới phải khác mật khẩu hiện tại')
  if (!/[A-Za-z]/.test(next) || !/\d/.test(next)) return fail('Mật khẩu mới cần có cả chữ và số')

  const w = wrong.get(auth.userId)
  if (w && w.until > Date.now()) return fail('Nhập sai nhiều lần, thử lại sau 5 phút', 429)

  // confirm the current password with a throw-away client (does not touch the user's session cookies)
  const probe = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, { auth: { persistSession: false, autoRefreshToken: false } })
  const { error: signErr } = await probe.auth.signInWithPassword({ email: auth.email, password: cur })
  if (signErr) {
    const c = w ?? { n: 0, until: 0 }; c.n += 1; if (c.n >= 5) { c.until = Date.now() + 5 * 60_000; c.n = 0 }
    wrong.set(auth.userId, c)
    return fail('Mật khẩu hiện tại không đúng', 401)
  }
  wrong.delete(auth.userId)
  const { error } = await supabaseAdmin().auth.admin.updateUserById(auth.userId, { password: next })
  if (error) return fail('Không đổi được mật khẩu, thử lại sau', 500)
  await audit(auth, 'users', auth.userId, 'password', {}).catch(() => {})
  return NextResponse.json({ success: true })
}
