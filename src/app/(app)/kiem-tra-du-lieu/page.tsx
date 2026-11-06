import { redirect } from 'next/navigation'
import DataCheck from '@/components/DataCheck'
import { getAuth, can } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export default async function Page() {
  const auth = await getAuth()
  if (!auth) redirect('/login')
  if (!can(auth, 'NGUOI_SU_DUNG', 'view')) return <p className="p-4 text-red-600">Bạn không có quyền xem mục này.</p>
  return <DataCheck isAdmin={auth.superAdmin} />
}
