import { redirect } from 'next/navigation'
import RolePerms from '@/components/RolePerms'
import { getAuth, can } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export default async function Page() {
  const auth = await getAuth()
  if (!auth) redirect('/login')
  if (!can(auth, 'VAI_TRO', 'view') && !can(auth, 'PHAN_QUYEN', 'view')) return <p className="p-4 text-red-600">Bạn không có quyền xem mục này.</p>
  return <RolePerms perms={{ roleCreate: can(auth, 'VAI_TRO', 'create'), roleEdit: can(auth, 'VAI_TRO', 'edit'), roleDelete: can(auth, 'VAI_TRO', 'delete'), permEdit: can(auth, 'PHAN_QUYEN', 'edit') }} />
}
