import 'server-only'
import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { getAuth, TransientAuthError, AuthContext } from '@/lib/auth'

export const GROUP = '__GROUP__'
export const KEY = /^[A-Za-z0-9:_-]{1,80}$/

export interface Contact { key: string; name: string; role: string }

/** Chat identity: the linked employee code (NV0008…) so V191 history keeps working; accounts without one use USER:<uuid>. */
export const keyOf = (u: { id: string; id_nhan_vien: string | null }) => u.id_nhan_vien || `USER:${u.id}`

let cache: { at: number; contacts: Contact[]; names: Map<string, string> } | null = null

export async function directory() {
  if (cache && Date.now() - cache.at < 30_000) return cache
  const db = supabaseAdmin()
  const [{ data: users }, { data: nv }, { data: roles }] = await Promise.all([
    db.from('users').select('id, ho_ten, email, id_nhan_vien, id_vai_tro, trang_thai'),
    db.from('nhan_vien').select('id, ho_ten'),
    db.from('vai_tro').select('id, ten_vai_tro'),
  ])
  const roleName = new Map((roles ?? []).map((r: any) => [r.id, r.ten_vai_tro]))
  const names = new Map<string, string>((nv ?? []).map((n: any) => [n.id, n.ho_ten]))
  const contacts: Contact[] = []
  for (const u of users ?? []) {
    const key = keyOf(u as any), name = u.ho_ten || u.email
    names.set(key, name)
    if (/hoạt động/i.test(u.trang_thai ?? '')) contacts.push({ key, name, role: roleName.get(u.id_vai_tro) ?? '' })
  }
  cache = { at: Date.now(), contacts, names }
  return cache
}

export async function chatAuth(): Promise<{ auth: AuthContext; me: string } | NextResponse> {
  let auth: AuthContext | null
  try { auth = await getAuth() } catch (e) {
    if (e instanceof TransientAuthError) return NextResponse.json({ success: false, error: 'Máy chủ đang bận, đang thử lại…' }, { status: 503 })
    throw e
  }
  if (!auth) return NextResponse.json({ success: false, error: 'Chưa đăng nhập' }, { status: 401 })
  const { data: u } = await supabaseAdmin().from('users').select('id, id_nhan_vien').eq('id', auth.userId).maybeSingle()
  return { auth, me: u ? keyOf(u as any) : `USER:${auth.userId}` }
}

/** Last message + unread count per conversation for `me` (the team channel and every direct thread). */
export async function summary(me: string) {
  const db = supabaseAdmin()
  const [{ data: msgs }, { data: docs }] = await Promise.all([
    db.from('tin_nhan').select('id, thoi_gian, id_nguoi_gui, id_nguoi_nhan, noi_dung')
      .or(`id_nguoi_nhan.eq.${GROUP},id_nguoi_nhan.eq.${me},id_nguoi_gui.eq.${me}`)
      .order('thoi_gian', { ascending: false }).limit(3000),
    db.from('chat_doc').select('conv, doc_den').eq('user_key', me),
  ])
  const read = new Map((docs ?? []).map((d: any) => [d.conv, Date.parse(d.doc_den)]))
  const conv = new Map<string, { last: any; unread: number; lastIn?: any }>()
  for (const m of msgs ?? []) {
    const c = m.id_nguoi_nhan === GROUP ? GROUP : m.id_nguoi_gui === me ? m.id_nguoi_nhan : m.id_nguoi_gui
    const o: { last: any; unread: number; lastIn?: any } = conv.get(c) ?? { last: m, unread: 0 }
    if (m.id_nguoi_gui !== me && Date.parse(m.thoi_gian) > (read.get(c) ?? 0)) { o.unread++; if (!o.lastIn) o.lastIn = m } // rows come newest first
    conv.set(c, o)
  }
  return conv
}
