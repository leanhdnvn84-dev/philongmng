import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import TopNav, { NavGroup } from '@/components/TopNav'
import { getAuth, can } from '@/lib/auth'
import { NAV } from '@/lib/resources'

export const dynamic = 'force-dynamic'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const auth = await getAuth()
  if (!auth) redirect('/login?error=no-access')

  const groups: NavGroup[] = NAV
    .map((g) => ({ group: g.group, items: g.items.filter((i) => can(auth, i.module, 'view')).map(({ label, href }) => ({ label, href })) }))
    .filter((g) => g.items.length)

  return (
    <div className="min-h-screen flex flex-col">
      <Suspense fallback={<div className="h-16 bg-navy-900" />}>
        <TopNav groups={groups} name={auth.name} role={auth.roleName} />
      </Suspense>
      <main className="flex-1 w-full px-4 lg:px-5 py-5">{children}</main>
      <footer className="py-4 text-center text-xs text-ink-mute print:hidden">© Phi Long Technology · Hệ thống quản lý vận hành tòa nhà</footer>
    </div>
  )
}
