import { redirect } from 'next/navigation'
import Sidebar, { NavItem } from '@/components/Sidebar'
import { getAuth, can } from '@/lib/auth'
import { RESOURCES } from '@/lib/resources'

export const dynamic = 'force-dynamic'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const auth = await getAuth()
  if (!auth) redirect('/login?error=no-access')

  const items: NavItem[] = RESOURCES
    .filter((r) => r.nav !== false && can(auth, r.module, 'view'))
    .map((r) => ({ href: `/${r.key}`, label: r.title, icon: r.icon, group: r.group }))

  return (
    <div className="md:flex">
      <Sidebar items={items} name={auth.fullName} role={auth.role} />
      <main className="flex-1 p-4 md:p-8 min-w-0">{children}</main>
    </div>
  )
}
