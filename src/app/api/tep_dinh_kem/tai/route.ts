import { NextRequest, NextResponse } from 'next/server'
import { guard, fail } from '@/lib/http'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { r2KeyOf, r2Serve } from '@/lib/r2'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

/** Opens / downloads one attachment kept in R2, for users allowed to view the record it belongs to.
 *  Older files still live in Google Drive: those are sent to their Drive page as before. */
export async function GET(req: NextRequest) {
  const fid = req.nextUrl.searchParams.get('id') ?? ''
  if (!/^[0-9a-f-]{36}$/.test(fid)) return fail('Không hợp lệ')
  const { data: f } = await supabaseAdmin().from('tep_dinh_kem').select('bang, ten, mime, file_id').eq('id', fid).maybeSingle()
  if (!f) return fail('Không tìm thấy tệp', 404)
  const g = await guard(f.bang, 'view'); if (g instanceof Response) return g
  const key = r2KeyOf(f.file_id)
  if (!key) return NextResponse.redirect(`https://drive.google.com/file/d/${encodeURIComponent(f.file_id)}/view`)
  try { return await r2Serve(key, f.ten, f.mime) } catch (e: any) {
    console.error('[tep r2]', e); return fail('Không đọc được tệp từ kho lưu trữ', 502)
  }
}
