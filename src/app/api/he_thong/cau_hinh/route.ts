import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { getAuth } from '@/lib/auth'
import { audit } from '@/lib/crud'

export const dynamic = 'force-dynamic'
const KEYS = new Set(['nguong_duyet_2_cap'])

/** System settings (two-level approval threshold). Any signed-in user may read; only a Super Admin may change. */
export async function GET() {
  const a = await getAuth().catch(() => null); if (!a) return NextResponse.json({ success: false, error: 'Chưa đăng nhập' }, { status: 401 })
  const { data } = await supabaseAdmin().from('cau_hinh_he_thong').select('khoa, gia_tri, nguoi_sua, updated_at')
  return NextResponse.json({ success: true, data: Object.fromEntries((data ?? []).map((r: any) => [r.khoa, r])) })
}

export async function POST(req: NextRequest) {
  const a = await getAuth().catch(() => null)
  if (!a?.superAdmin) return NextResponse.json({ success: false, error: 'Chỉ Super Admin được đổi cài đặt' }, { status: 403 })
  const body = await req.json().catch(() => ({}))
  const khoa = String(body.khoa ?? ''), v = String(body.gia_tri ?? '').replace(/[.,\s]/g, '')
  if (!KEYS.has(khoa) || !/^\d{1,13}$/.test(v)) return NextResponse.json({ success: false, error: 'Giá trị không hợp lệ (nhập số tiền, 0 = tắt)' }, { status: 400 })
  const { error } = await supabaseAdmin().from('cau_hinh_he_thong').upsert({ khoa, gia_tri: v, nguoi_sua: a.name, updated_at: new Date().toISOString() }, { onConflict: 'khoa' })
  if (error) return NextResponse.json({ success: false, error: 'Lỗi cơ sở dữ liệu' }, { status: 500 })
  await audit(a, 'cau_hinh_he_thong', khoa, 'update', { gia_tri: v })
  return NextResponse.json({ success: true })
}
