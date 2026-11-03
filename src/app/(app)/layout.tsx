import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import Sidebar, { SideGroup } from '@/components/Sidebar'
import { getAuth, can } from '@/lib/auth'
import { NAV } from '@/lib/resources'

export const dynamic = 'force-dynamic'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const auth = await getAuth()
  if (!auth) redirect('/login?error=no-access')

  const groups: SideGroup[] = NAV
    .map((g) => ({ group: g.group, items: g.items.filter((i) => can(auth, i.module, 'view')).map(({ label, href }) => ({ label, href })) }))
    .filter((g) => g.items.length)

  return (
    <div className="md:flex">
      <Suspense><Sidebar groups={groups} name={auth.name} role={auth.roleName} /></Suspense>
      <main className="flex-1 p-3 md:p-6 min-w-0">{children}</main>
    </div>
  )
}
