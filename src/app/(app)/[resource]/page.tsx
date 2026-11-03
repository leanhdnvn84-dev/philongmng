import { notFound, redirect } from 'next/navigation'
import ResourceManager from '@/components/ResourceManager'
import { getAuth, can } from '@/lib/auth'
import { getResource } from '@/lib/resources'

export const dynamic = 'force-dynamic'

export default async function ResourcePage({ params }: { params: { resource: string } }) {
  const res = getResource(params.resource)
  if (!res || res.nav === false) notFound()
  const auth = await getAuth()
  if (!auth) redirect('/login')
  if (!can(auth, res.module, 'view')) {
    return <p className="text-red-600">Bạn không có quyền xem mục này.</p>
  }
  return (
    <ResourceManager
      resourceKey={res.key}
      canCreate={can(auth, res.module, 'create')}
      canEdit={can(auth, res.module, 'edit')}
      canDelete={can(auth, res.module, 'delete')}
    />
  )
}
