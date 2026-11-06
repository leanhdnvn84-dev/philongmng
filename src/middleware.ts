import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request })
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll(list) {
          list.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          list.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
        },
      },
    }
  )

  const { data, error } = await supabase.auth.getUser()
  // a network blip while checking the session is not a logout: let the page load and show its own retry instead of bouncing to /login
  if (!data.user && error && (error.status === undefined || error.status === 0 || error.status >= 500 || /fetch|network|timeout/i.test(error.message))) return response
  const isLogin = request.nextUrl.pathname === '/login'

  if (!data.user && !isLogin) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.search = ''
    return NextResponse.redirect(url)
  }
  if (data.user && isLogin) {
    const url = request.nextUrl.clone()
    url.pathname = '/'
    return NextResponse.redirect(url)
  }
  return response
}

export const config = {
  // API routes do their own auth and return JSON 401 instead of redirecting
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|icon.png|apple-icon.png|brand/).*)'],
}
