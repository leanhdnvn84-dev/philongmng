import { NextResponse } from 'next/server'
import crypto from 'node:crypto'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { supabaseServer } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { REMEMBER_COOKIE, maxAgeFor } from '@/lib/session'

export const runtime = 'nodejs'
const BAD = 'Tên đăng nhập / email hoặc mật khẩu không đúng'

// best-effort throttle (per server instance) on top of Supabase's own rate limits
const fails = new Map<string, { n: number; until: number }>()

const same = (a: string, b: string) => {
  const x = Buffer.from(a), y = Buffer.from(b)
  return x.length === y.length && crypto.timingSafeEqual(x, y)
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}))
  const ident = String(body.identifier ?? '').trim().toLowerCase()
  const password = String(body.password ?? '')
  const remember = body.remember === true
  if (!ident || ident.length > 200 || !password || password.length > 256)
    return NextResponse.json({ success: false, error: BAD }, { status: 400 })

  const f = fails.get(ident)
  if (f && f.until > Date.now())
    return NextResponse.json({ success: false, error: 'Đăng nhập sai nhiều lần, thử lại sau 5 phút' }, { status: 429 })

  const admin = supabaseAdmin()
  const { data: u } = await admin.from('users').select('id, email, trang_thai')
    .or(`email.eq.${ident.replace(/[,()]/g, '')},ten_dang_nhap.eq.${ident.replace(/[,()]/g, '')}`).limit(2)
  const user = u?.length === 1 ? u[0] : null

  const miss = () => {
    const c = fails.get(ident) ?? { n: 0, until: 0 }
    c.n += 1; if (c.n >= 8) { c.until = Date.now() + 5 * 60_000; c.n = 0 }
    fails.set(ident, c)
    return NextResponse.json({ success: false, error: BAD }, { status: 401 })
  }
  if (!user || user.trang_thai === 'Khóa') { crypto.pbkdf2Sync(password, 'x', 100000, 32, 'sha256'); return miss() }

  // accounts carried over from V191: check the old PBKDF2 hash once, then move the password to Supabase Auth
  const { data: leg } = await admin.from('legacy_auth').select('salt, iter, hash').eq('user_id', user.id).maybeSingle()
  if (leg) {
    const h = crypto.pbkdf2Sync(password, leg.salt, leg.iter, 32, 'sha256').toString('hex')
    if (same(h, leg.hash)) {
      const up = await admin.auth.admin.updateUserById(user.id, { password })
      if (!up.error) await admin.from('legacy_auth').delete().eq('user_id', user.id)
    }
  }

  const { error } = await supabaseServer({ remember }).auth.signInWithPassword({ email: user.email, password })
  if (error) return miss()
  cookies().set(REMEMBER_COOKIE, remember ? '1' : '0', { maxAge: maxAgeFor(remember), path: '/', sameSite: 'lax', secure: process.env.NODE_ENV === 'production' })
  fails.delete(ident)
  return NextResponse.json({ success: true })
}
