import 'server-only'
import { supabaseServer } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export type Action = 'view' | 'create' | 'edit' | 'delete'
export type Perms = Record<string, { view: boolean; create: boolean; edit: boolean; delete: boolean }>

export interface AuthContext {
  userId: string
  email: string
  fullName: string
  role: string
  perms: Perms
}

/** Resolves the logged-in, active user with their role permissions; null if not allowed in. */
export async function getAuth(): Promise<AuthContext | null> {
  const { data } = await supabaseServer().auth.getUser()
  if (!data.user) return null

  const admin = supabaseAdmin()
  const { data: profile } = await admin
    .from('users')
    .select('id, email, full_name, status, role_id, roles(name)')
    .eq('id', data.user.id)
    .maybeSingle()
  if (!profile || profile.status !== 'active' || !profile.role_id) return null

  const { data: rows } = await admin.from('permissions').select('*').eq('role_id', profile.role_id)
  const perms: Perms = {}
  for (const p of rows ?? []) {
    perms[p.module] = { view: p.can_view, create: p.can_create, edit: p.can_edit, delete: p.can_delete }
  }
  const roleName = (profile.roles as any)?.name ?? ''
  return { userId: profile.id, email: profile.email, fullName: profile.full_name ?? profile.email, role: roleName, perms }
}

export const can = (auth: AuthContext, module: string, action: Action) =>
  auth.perms[module]?.[action] === true
