import { redirect } from 'next/navigation'
import MasterCalendar from '@/components/MasterCalendar'
import { getAuth } from '@/lib/auth'

export const dynamic = 'force-dynamic'

/** Open to every signed-in user: the API only returns the modules that user may view. */
export default async function Page() {
  const auth = await getAuth()
  if (!auth) redirect('/login')
  return <MasterCalendar />
}
