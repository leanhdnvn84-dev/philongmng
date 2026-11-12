import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { REMEMBER_COOKIE, maxAgeFor } from '@/lib/session'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request })
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookieOptions: { maxAge: maxAgeFor(request.cookies.get(REMEMBER_COOKIE)?.value === '1') },
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll(list) {
          list.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          list.forEach(({ name, value, options }) => response.cookies.set(name, value, { ...options, ...(options?.maxAge === 0 ? {} : { maxAge: maxAgeFor(request.cookies.get(REMEMBER_COOKIE)?.value === '1') }) }))
        },
      },
    }
  )

  // verifies the session token locally with the public signing key (and refreshes it when expired); no auth-server round trip per page
  const { data: cl, error } = await supabase.auth.getClaims()
  const claims = cl?.claims
  const data = { user: claims?.sub ? { id: claims.sub, user_metadata: (claims.user_metadata ?? {}) as Record<string, unknown> } : null }
  // a network blip while checking the session is not a logout: let the page load and show its own retry instead of bouncing to /login
  if (!data.user && error && (error.status === undefined || error.status === 0 || error.status >= 500 || /fetch|network|timeout/i.test(error.message))) return response
  const path = request.nextUrl.pathname
  const isLogin = path === '/login'
  // password pages work without a session (the reset link carries its own one-time token)
  if (path === '/quen-mat-khau' || path === '/dat-lai-mat-khau') return response

  if (!data.user && !isLogin) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    // remember where the user was going (e.g. a device QR label) so login can return there; same-site paths only
    const back = request.nextUrl.pathname + request.nextUrl.search
    url.search = back !== '/' && back.length < 300 ? `?next=${encodeURIComponent(back)}` : ''
    return NextResponse.redirect(url)
  }
  if (data.user && isLogin) {
    const url = request.nextUrl.clone()
    url.pathname = '/'
    return NextResponse.redirect(url)
  }
  // a password given by an administrator must be replaced at first sign-in
  // the token may still carry an old flag after the password was changed: confirm with the auth server only in that rare case
  if (data.user?.user_metadata?.doi_mat_khau === true && path !== '/tai-khoan' && (await supabase.auth.getUser()).data.user?.user_metadata?.doi_mat_khau === true) {
    const url = request.nextUrl.clone()
    url.pathname = '/tai-khoan'; url.search = '?bat_buoc=1'
    return NextResponse.redirect(url)
  }
  return response
}

export const config = {
  // API routes do their own auth and return JSON 401 instead of redirecting
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|icon.png|apple-icon.png|manifest.webmanifest|brand/).*)'],
}
