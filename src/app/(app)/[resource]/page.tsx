import { notFound, redirect } from 'next/navigation'
import ResourceManager from '@/components/ResourceManager'
import VisitorsPage from '@/components/VisitorsPage'
import Electricity from '@/components/Electricity'
import { getAuth, can } from '@/lib/auth'
import { getResource, NAV, PROPOSAL_KINDS } from '@/lib/resources'

export const dynamic = 'force-dynamic'

export default async function ResourcePage({ params, searchParams }: {
  params: { resource: string }; searchParams: Record<string, string | string[] | undefined>
}) {
  const res = getResource(params.resource)
  if (!res || res.key === 'de_xuat_chi_tiet') notFound()
  const auth = await getAuth()
  if (!auth) redirect('/login')
  if (!can(auth, res.module, 'view')) return <p className="text-red-600">Bạn không có quyền xem mục này.</p>

  // the visitors desk has its own screen (register form + live lists), like V191
  if (res.key === 'khach_ra_vao') {
    return <VisitorsPage userName={auth.name} perms={{ create: can(auth, res.module, 'create'), edit: can(auth, res.module, 'edit') }} />
  }

  // electricity has its own screen (period list | readings by invoice | invoice panel), like V191
  if (res.key === 'tien_dien') {
    return <Electricity perms={{ create: can(auth, res.module, 'create'), edit: can(auth, res.module, 'edit'), delete: can(auth, res.module, 'delete'), approve: can(auth, res.module, 'approve') }} />
  }

  // fixed filters from the menu link (e.g. ?loai_de_xuat=MUA_VAT_TU); only declared fields pass
  const filters: Record<string, string> = {}
  for (const f of res.fields) {
    const v = searchParams[f.name]
    if (typeof v === 'string' && v) filters[f.name] = v
  }
  const qs = new URLSearchParams(filters).toString()
  const navLabel = NAV.flatMap((g) => g.items).find((i) => decodeURIComponent(i.href) === `/${res.key}${qs ? '?' + decodeURIComponent(qs.replace(/\+/g, ' ')) : ''}`)?.label
  const title = navLabel ?? (filters.loai_de_xuat ? `Đề xuất ${PROPOSAL_KINDS[filters.loai_de_xuat]?.toLowerCase() ?? ''}` : res.title)

  return (
    <ResourceManager key={res.key + qs} resourceKey={res.key} title={title} filters={filters}
      perms={{ create: can(auth, res.module, 'create'), edit: can(auth, res.module, 'edit'), delete: can(auth, res.module, 'delete'), approve: can(auth, res.module, 'approve') }} />
  )
}
