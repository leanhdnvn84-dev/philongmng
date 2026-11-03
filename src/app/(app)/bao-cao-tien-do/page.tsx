import { redirect } from 'next/navigation'
import ProgressReport from '@/components/ProgressReport'
import { getAuth, can } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export default async function Page() {
  const auth = await getAuth()
  if (!auth) redirect('/login')
  if (!can(auth, 'CONG_VIEC', 'view')) return <p className="text-red-600">Bạn không có quyền xem mục này.</p>
  return <ProgressReport canEdit={can(auth, 'CONG_VIEC', 'edit')} />
}
