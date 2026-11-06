import 'server-only'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { REMEMBER_COOKIE, maxAgeFor } from '@/lib/session'

/** Supabase client bound to the current request's session cookies. */
export function supabaseServer(opts: { remember?: boolean } = {}) {
  const cookieStore = cookies()
  const remember = opts.remember ?? cookieStore.get(REMEMBER_COOKIE)?.value === '1'
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookieOptions: { maxAge: maxAgeFor(remember) },
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll(list) {
          try {
            list.forEach(({ name, value, options }) => cookieStore.set(name, value, { ...options, ...(options?.maxAge === 0 ? {} : { maxAge: maxAgeFor(remember) }) }))
          } catch {
            // called from a Server Component: middleware refreshes the session instead
          }
        },
      },
    }
  )
}
