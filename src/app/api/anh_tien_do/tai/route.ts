import { NextRequest, NextResponse } from 'next/server'
import { guard, fail } from '@/lib/http'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { r2KeyOf, r2Serve } from '@/lib/r2'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

/** One progress photo kept in R2, for users allowed to view progress photos (older photos stay on Google Drive). */
export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id') ?? ''
  if (!/^[A-Za-z0-9_.-]{1,64}$/.test(id)) return fail('Không hợp lệ')
  const g = await guard('hinh_anh_tien_do', 'view'); if (g instanceof Response) return g
  const { data: p } = await supabaseAdmin().from('hinh_anh_tien_do').select('id, file_id').eq('id', id).maybeSingle()
  if (!p?.file_id) return fail('Không tìm thấy ảnh', 404)
  const key = r2KeyOf(p.file_id)
  if (!key) return NextResponse.redirect(`https://drive.google.com/file/d/${encodeURIComponent(p.file_id)}/view`)
  try { return await r2Serve(key, `anh-tien-do-${p.id}.jpg`, 'image/jpeg') } catch (e: any) {
    console.error('[anh r2]', e); return fail('Không đọc được ảnh từ kho lưu trữ', 502)
  }
}
