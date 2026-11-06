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
// profile + permissions rarely change: keep them for a few seconds so a burst of API calls (a page fires several) costs one lookup
const memo = new Map<string, { at: number; auth: AuthContext | null }>()
const TTL = 15_000
export class TransientAuthError extends Error {}

export const getAuth = cache(async (): Promise<AuthContext | null> => {
  const { data, error: authErr } = await supabaseServer().auth.getUser()
  if (!data.user) {
    // a network / 5xx failure is not "logged out": surface it as retryable instead of bouncing the user to /login
    if (authErr && ((authErr as any).status === undefined || (authErr as any).status >= 500 || (authErr as any).status === 0 || /fetch|network|timeout/i.test(authErr.message)))
      throw new TransientAuthError(authErr.message)
    return null
  }
  const hit = memo.get(data.user.id)
  if (hit && Date.now() - hit.at < TTL) return hit.auth
  const auth = await loadAuth(data.user.id)
  memo.set(data.user.id, { at: Date.now(), auth })
  if (memo.size > 500) memo.clear()
  return auth
})

async function loadAuth(userId: string): Promise<AuthContext | null> {
  const admin = supabaseAdmin()
  const { data: u, error: uErr } = await admin
    .from('users')
    .select('id, email, ho_ten, trang_thai, id_vai_tro, vai_tro(ten_vai_tro, sieu_quan_tri)')
    .eq('id', userId)
    .maybeSingle()
  if (uErr) throw new TransientAuthError(uErr.message)
  if (!u || !ACTIVE.has(String(u.trang_thai ?? '').toLowerCase()) || !u.id_vai_tro) return null

  const role = u.vai_tro as any
  const perms: Perms = {}
  if (!role?.sieu_quan_tri) {
    const { data: rows, error: pErr } = await admin.from('phan_quyen').select('*').eq('id_vai_tro', u.id_vai_tro)
    if (pErr) throw new TransientAuthError(pErr.message)
    for (const p of rows ?? []) {
      perms[p.module] = { view: p.xem, create: p.them, edit: p.sua, delete: p.xoa, approve: p.duyet }
    }
  }
  return {
    userId: u.id, email: u.email, name: u.ho_ten || u.email,
    roleId: u.id_vai_tro, roleName: role?.ten_vai_tro ?? u.id_vai_tro,
    superAdmin: !!role?.sieu_quan_tri, perms,
  }
}

export const can = (auth: AuthContext, module: string, action: Perm) =>
  auth.superAdmin || auth.perms[module]?.[action] === true
