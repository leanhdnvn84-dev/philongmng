import { redirect } from 'next/navigation'
import MonthReport from '@/components/MonthReport'
import { getAuth, can } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export default async function Page() {
  const auth = await getAuth()
  if (!auth) redirect('/login')
  if (!can(auth, 'BAO_CAO', 'view')) return <p className="p-6 text-red-600">Bạn không có quyền xem mục này.</p>
  return <MonthReport />
}
