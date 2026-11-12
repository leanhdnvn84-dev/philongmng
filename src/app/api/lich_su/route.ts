import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { getAuth, can } from '@/lib/auth'
import { getResource } from '@/lib/resources'

export const dynamic = 'force-dynamic'

/** Change history of one record (who did what, when). Anyone who may view the record's module may read it. */
export async function GET(req: NextRequest) {
  const auth = await getAuth().catch(() => null)
  if (!auth) return NextResponse.json({ success: false, error: 'Chưa đăng nhập' }, { status: 401 })
  const res = getResource(req.nextUrl.searchParams.get('bang') ?? ''), id = req.nextUrl.searchParams.get('id') ?? ''
  if (!res || !/^[A-Za-z0-9_-]{1,64}$/.test(id)) return NextResponse.json({ success: false, error: 'Không hợp lệ' }, { status: 400 })
  if (!can(auth, res.module, 'view')) return NextResponse.json({ success: false, error: 'Bạn không có quyền' }, { status: 403 })
  const db = supabaseAdmin()
  const { data, error } = await db.from('audit_logs').select('id, created_at, user_id, user_email, action, changes').eq('table_name', res.table).eq('record_id', id).order('created_at', { ascending: false }).limit(100)
  if (error) return NextResponse.json({ success: false, error: 'Lỗi cơ sở dữ liệu' }, { status: 500 })
  const ids = Array.from(new Set((data ?? []).map((r: any) => r.user_id).filter(Boolean)))
  const { data: us } = ids.length ? await db.from('users').select('id, ho_ten').in('id', ids) : { data: [] as any[] }
  const name = new Map((us ?? []).map((u: any) => [u.id, u.ho_ten as string]))
  return NextResponse.json({ success: true, data: (data ?? []).map((r: any) => ({ id: r.id, at: r.created_at, by: name.get(r.user_id) || r.user_email || 'Hệ thống', action: r.action, changes: r.changes })) })
}
