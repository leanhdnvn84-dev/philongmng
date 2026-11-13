import { redirect } from 'next/navigation'
import RentalPage from '@/components/RentalPage'
import { getAuth, can } from '@/lib/auth'

export const dynamic = 'force-dynamic'

/** One screen for buildings, floors and tenants. */
export default async function Page() {
  const auth = await getAuth()
  if (!auth) redirect('/login')
  if (!can(auth, 'QUAN_LY_TANG', 'view') && !can(auth, 'KHACH_THUE', 'view')) return <p className="p-6 text-red-600">Bạn không có quyền xem mục này.</p>
  return <RentalPage />
}
