import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { getAuth, can, AuthContext, TransientAuthError } from '@/lib/auth'
import { MODULE_INFO } from '@/lib/resources'
import { audit } from '@/lib/crud'

export const dynamic = 'force-dynamic'
const err = (m: string, s = 400) => NextResponse.json({ success: false, error: m }, { status: s })
const COLS = ['xem', 'them', 'sua', 'xoa', 'duyet'] as const
const ID = /^[A-Za-z0-9_-]{1,32}$/

async function who(): Promise<AuthContext | NextResponse> {
  let a: AuthContext | null
  try { a = await getAuth() } catch (e) { if (e instanceof TransientAuthError) return err('Máy chủ đang bận, đang thử lại…', 503); throw e }
  if (!a) return err('Chưa đăng nhập hoặc tài khoản bị khóa', 401)
  if (!can(a, 'VAI_TRO', 'view') && !can(a, 'PHAN_QUYEN', 'view')) return err('Bạn không có quyền xem mục này', 403)
  return a
}

export async function GET() {
  const a = await who(); if (a instanceof NextResponse) return a
  const db = supabaseAdmin()
  const [{ data: roles }, { data: perms }, { data: users }] = await Promise.all([
    db.from('vai_tro').select('id, ten_vai_tro, mo_ta, sieu_quan_tri').order('id'),
    db.from('phan_quyen').select('id_vai_tro, module, xem, them, sua, xoa, duyet'),
    db.from('users').select('id_vai_tro'),
  ])
  const count: Record<string, number> = {}
  for (const u of users ?? []) count[u.id_vai_tro] = (count[u.id_vai_tro] ?? 0) + 1
  return NextResponse.json({
    success: true, me: { roleId: a.roleId, superAdmin: a.superAdmin },
    data: { roles: (roles ?? []).map((r) => ({ ...r, so_nguoi_dung: count[r.id] ?? 0 })), perms: perms ?? [], modules: MODULE_INFO },
  })
}

/** Save the whole permission matrix of one role. */
export async function POST(req: NextRequest) {
  const a = await who(); if (a instanceof NextResponse) return a
  if (!can(a, 'PHAN_QUYEN', 'edit')) return err('Bạn không có quyền sửa phân quyền', 403)
  const body = await req.json().catch(() => null)
  const roleId = String(body?.id_vai_tro ?? ''); if (!ID.test(roleId)) return err('Vai trò không hợp lệ')
  const input = body?.perms && typeof body.perms === 'object' ? body.perms as Record<string, Record<string, boolean>> : null
  if (!input) return err('Dữ liệu không hợp lệ')
  const db = supabaseAdmin()
  const { data: role } = await db.from('vai_tro').select('id, sieu_quan_tri').eq('id', roleId).maybeSingle()
  if (!role) return err('Không tìm thấy vai trò', 404)
  if (role.sieu_quan_tri) return err('Vai trò Super Admin luôn có toàn quyền, không cần phân quyền')
  if (!a.superAdmin && roleId === a.roleId) return err('Không thể tự sửa quyền của vai trò mình đang dùng')
  const { data: cur } = await db.from('phan_quyen').select('id, module, xem, them, sua, xoa, duyet').eq('id_vai_tro', roleId)
  const have = new Map((cur ?? []).map((r) => [r.module, r]))
  let changed = 0
  const ops: PromiseLike<any>[] = []
  for (const m of MODULE_INFO) {
    const p = input[m.key]; if (!p) continue
    const next: Record<string, boolean> = {}
    for (const c of COLS) next[c] = p[c] === true
    if (!m.approve) next.duyet = false
    if (COLS.some((c) => c !== 'xem' && next[c])) next.xem = true // any right implies viewing
    const old = have.get(m.key)
    if (old) {
      if (COLS.some((c) => !!old[c] !== next[c])) { changed++; ops.push(db.from('phan_quyen').update(next).eq('id', old.id).then((r) => r)) }
    } else if (COLS.some((c) => next[c])) { changed++; ops.push(db.from('phan_quyen').insert({ id_vai_tro: roleId, module: m.key, ...next }).then((r) => r)) }
  }
  const res = await Promise.all(ops)
  if (res.some((r: any) => r.error)) return err('Lỗi cơ sở dữ liệu khi lưu', 500)
  await audit(a, 'phan_quyen', roleId, 'save_permissions', { modules_changed: changed })
  return NextResponse.json({ success: true, data: { changed } })
}
