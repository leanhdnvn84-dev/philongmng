import { redirect } from 'next/navigation'
import AccountPage from '@/components/AccountPage'
import { getAuth } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export default async function Page({ searchParams }: { searchParams: Record<string, string | string[] | undefined> }) {
  const auth = await getAuth()
  if (!auth) redirect('/login')
  return <AccountPage name={auth.name} email={auth.email} role={auth.roleName} mustChange={searchParams.bat_buoc === '1'} />
}
