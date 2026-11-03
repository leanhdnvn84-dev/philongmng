import 'server-only'
import { cache } from 'react'
import { supabaseServer } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import type { Perm } from '@/lib/resources'

export type Perms = Record<string, Record<Perm, boolean>>

export interface AuthContext {
  userId: string
  email: string
  name: string
  roleId: string
  roleName: string
  superAdmin: boolean
  perms: Perms
}

const ACTIVE = new Set(['hoạt động', 'hoat dong', 'hoat_dong', 'active', 'đang hoạt động'])

/** Logged-in, active user + role permissions (memoised per request). */
export const getAuth = cache(async (): Promise<AuthContext | null> => {
  const { data } = await supabaseServer().auth.getUser()
  if (!data.user) return null

  const admin = supabaseAdmin()
  const { data: u } = await admin
    .from('users')
    .select('id, email, ho_ten, trang_thai, id_vai_tro, vai_tro(ten_vai_tro, sieu_quan_tri)')
    .eq('id', data.user.id)
    .maybeSingle()
  if (!u || !ACTIVE.has(String(u.trang_thai ?? '').toLowerCase()) || !u.id_vai_tro) return null

  const role = u.vai_tro as any
  const perms: Perms = {}
  if (!role?.sieu_quan_tri) {
    const { data: rows } = await admin.from('phan_quyen').select('*').eq('id_vai_tro', u.id_vai_tro)
    for (const p of rows ?? []) {
      perms[p.module] = { view: p.xem, create: p.them, edit: p.sua, delete: p.xoa, approve: p.duyet }
    }
  }
  return {
    userId: u.id, email: u.email, name: u.ho_ten || u.email,
    roleId: u.id_vai_tro, roleName: role?.ten_vai_tro ?? u.id_vai_tro,
    superAdmin: !!role?.sieu_quan_tri, perms,
  }
})

export const can = (auth: AuthContext, module: string, action: Perm) =>
  auth.superAdmin || auth.perms[module]?.[action] === true
