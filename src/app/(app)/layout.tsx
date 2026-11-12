import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import TopNav, { NavGroup } from '@/components/TopNav'
import { getAuth, can } from '@/lib/auth'
import { NAV } from '@/lib/resources'
import { supabaseServer } from '@/lib/supabase/server'
import AccountPage from '@/components/AccountPage'

export const dynamic = 'force-dynamic'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const auth = await getAuth()
  if (!auth) redirect('/login?error=no-access')

  // a password given by an administrator must be replaced first: every page shows the change-password form until it is
  const { data: me } = await supabaseServer().auth.getUser().catch(() => ({ data: { user: null } }))
  const mustChange = me.user?.user_metadata?.doi_mat_khau === true

  const groups: NavGroup[] = NAV
    .map((g) => ({ group: g.group, items: g.items.filter((i) => i.module === '*' || can(auth, i.module, 'view')).map(({ label, href }) => ({ label, href })) }))
    .filter((g) => g.items.length)

  return (
    <div className="min-h-screen lg:h-screen lg:overflow-hidden flex flex-col print:h-auto print:overflow-visible">
      <Suspense fallback={<div className="h-16 bg-navy-900" />}>
        <TopNav groups={groups} name={auth.name} role={auth.roleName} />
      </Suspense>
      <main className="flex-1 lg:min-h-0 w-full flex flex-col pb-20 lg:pb-0 print:pb-0">{mustChange ? <AccountPage name={auth.name} email={auth.email} role={auth.roleName} mustChange /> : children}</main>
      <footer className="shrink-0 flex flex-wrap items-center justify-between gap-x-4 gap-y-0.5 px-4 lg:px-5 py-1.5 bg-white border-t border-navy-200 text-[12px] text-ink-mute print:hidden">
        <span>© Phi Long Technology · Hệ thống quản lý vận hành tòa nhà</span>
        <span>Người dùng: <b className="text-navy-800">{auth.name}</b> · {auth.roleName}</span>
      </footer>
    </div>
  )
}
