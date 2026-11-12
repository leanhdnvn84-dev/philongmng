import { redirect } from 'next/navigation'
import RecycleBin from '@/components/RecycleBin'
import { getAuth } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export default async function Page() {
  const auth = await getAuth()
  if (!auth) redirect('/login')
  if (!auth.superAdmin) return <p className="p-6 text-red-600">Chỉ Super Admin xem được thùng rác.</p>
  return <RecycleBin />
}
