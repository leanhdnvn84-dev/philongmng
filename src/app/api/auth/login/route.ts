import { NextResponse } from 'next/server'
import crypto from 'node:crypto'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { supabaseServer } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { REMEMBER_COOKIE, maxAgeFor } from '@/lib/session'

export const runtime = 'nodejs'
const BAD = 'Tên đăng nhập / email hoặc mật khẩu không đúng'

// account lock: 5 wrong passwords within 15 minutes locks that login name for 15 minutes (kept in the database, so it holds on every server)
const LIMIT = 5, WINDOW_MIN = 15

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

  const admin = supabaseAdmin()
  const since = new Date(Date.now() - WINDOW_MIN * 60_000).toISOString()
  const { data: recent } = await admin.from('dang_nhap_sai').select('at').eq('ident', ident).gte('at', since).order('at', { ascending: false }).limit(LIMIT)
  if ((recent?.length ?? 0) >= LIMIT) {
    const left = Math.max(1, Math.ceil((Date.parse(recent![LIMIT - 1].at) + WINDOW_MIN * 60_000 - Date.now()) / 60_000))
    return NextResponse.json({ success: false, error: `Tài khoản tạm khóa do nhập sai ${LIMIT} lần. Thử lại sau ${left} phút, hoặc dùng “Quên mật khẩu”.` }, { status: 429 })
  }

  const { data: u } = await admin.from('users').select('id, email, trang_thai')
    .or(`email.eq.${ident.replace(/[,()]/g, '')},ten_dang_nhap.eq.${ident.replace(/[,()]/g, '')}`).limit(2)
  const user = u?.length === 1 ? u[0] : null

  const miss = async () => {
    const ip = (req.headers.get('x-forwarded-for') ?? '').split(',')[0].trim() || null
    await admin.from('dang_nhap_sai').insert({ ident, ip }).then(() => {}, () => {})
    const left = LIMIT - 1 - (recent?.length ?? 0)
    return NextResponse.json({ success: false, error: left > 0 && left <= 2 ? `${BAD}. Còn ${left} lần thử trước khi tài khoản bị khóa ${WINDOW_MIN} phút.` : left <= 0 ? `${BAD}. Tài khoản tạm khóa ${WINDOW_MIN} phút.` : BAD }, { status: 401 })
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
  await admin.from('dang_nhap_sai').delete().eq('ident', ident).then(() => {}, () => {})
  // login history (V191 LICH_SU_DANG_NHAP): never blocks the sign-in
  try {
    const ua = req.headers.get('user-agent') ?? ''
    const browser = /Edg\//.test(ua) ? 'Edge' : /OPR\/|Opera/.test(ua) ? 'Opera' : /Firefox\//.test(ua) ? 'Firefox' : /Chrome\/|CriOS/.test(ua) ? 'Chrome' : /Safari\//.test(ua) ? 'Safari' : 'Khác'
    const os = /Windows/.test(ua) ? 'Windows' : /iPhone|iPad|iPod/.test(ua) ? 'iOS' : /Android/.test(ua) ? 'Android' : /Mac OS X|Macintosh/.test(ua) ? 'macOS' : /Linux/.test(ua) ? 'Linux' : 'Khác'
    const ip = (req.headers.get('x-forwarded-for') ?? '').split(',')[0].trim() || 'Không xác định'
    const { data: me } = await admin.from('users').select('id_nhan_vien').eq('id', user.id).maybeSingle()
    await admin.from('lich_su_dang_nhap').insert({ id_nguoi_dung: me?.id_nhan_vien ?? user.id, email: user.email, ip_cong_cong: ip,
      vi_tri_gan_dung: 'Không xác định', ten_thiet_bi: /Mobile|iPhone|Android/.test(ua) ? 'Điện thoại' : 'Máy tính', trinh_duyet: browser, he_dieu_hanh: os, nguon_thong_tin: 'Máy chủ (User-Agent, IP)' })
  } catch { /* ignore */ }
  return NextResponse.json({ success: true })
}
