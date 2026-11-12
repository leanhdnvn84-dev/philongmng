import { NextRequest } from 'next/server'
import { guard, ok, fail } from '@/lib/http'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { uploadToDrive, driveConfigured } from '@/lib/driveUpload'
import { audit } from '@/lib/crud'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

/** Files attached to a record (photos, PDF, Word/Excel): stored in the Google Drive photo folder, only the Drive id is kept here. */
const ATTACH_TABLES = ['thiet_bi', 'nhat_ky_bao_tri', 'lich_bao_tri', 'de_xuat', 'khach_thue', 'cong_viec', 'cong_viec_hang_ngay', 'khach_hang_tiem_nang', 'vat_tu'] as const
const ID = /^[A-Za-z0-9_.-]{1,64}$/
const TYPES = /^(image\/|application\/pdf$|application\/vnd\.openxmlformats-officedocument\.|application\/msword$|application\/vnd\.ms-excel$|text\/plain$)/
const MAX = 4 * 1024 * 1024

const target = (bang: string, id: string) => (ATTACH_TABLES as readonly string[]).includes(bang) && ID.test(id)

export async function GET(req: NextRequest) {
  const bang = req.nextUrl.searchParams.get('bang') ?? '', id = req.nextUrl.searchParams.get('id') ?? ''
  if (!target(bang, id)) return fail('Không hợp lệ')
  const g = await guard(bang, 'view'); if (g instanceof Response) return g
  const { data, error } = await supabaseAdmin().from('tep_dinh_kem').select('id, ten, mime, kich_thuoc, file_id, nguoi_tai, created_at').eq('bang', bang).eq('id_ban_ghi', id).order('created_at', { ascending: false }).limit(100)
  if (error) return fail('Lỗi cơ sở dữ liệu', 500)
  return ok({ data })
}

export async function POST(req: NextRequest) {
  const form = await req.formData().catch(() => null)
  if (!form) return fail('Dữ liệu không hợp lệ')
  const bang = String(form.get('bang') ?? ''), id = String(form.get('id') ?? '')
  if (!target(bang, id)) return fail('Không hợp lệ')
  const g = await guard(bang, 'edit'); if (g instanceof Response) return g
  if (!driveConfigured()) return fail('Chưa cấu hình Google Drive cho hệ thống', 503)
  const file = form.get('file')
  if (!(file instanceof File)) return fail('Chưa chọn tệp')
  if (!TYPES.test(file.type || '')) return fail('Chỉ nhận ảnh, PDF, Word, Excel hoặc tệp văn bản')
  if (file.size > MAX) return fail('Tệp quá lớn (tối đa 4 MB)')
  const name = String(file.name || 'tep').replace(/[\\/:*?"<>|\u0000-\u001f]+/g, '_').slice(0, 150)
  const db = supabaseAdmin()
  const { data: row } = await db.from(g.res.table).select('id').eq('id', id).maybeSingle()
  if (!row) return fail('Không tìm thấy bản ghi', 404)
  try {
    const fileId = await uploadToDrive(`${bang}_${id}_${Date.now()}_${name}`, file.type, Buffer.from(await file.arrayBuffer()))
    const { data, error } = await db.from('tep_dinh_kem').insert({ bang, id_ban_ghi: id, ten: name, mime: file.type, kich_thuoc: file.size, file_id: fileId, nguoi_tai: g.auth.name })
      .select('id, ten, mime, kich_thuoc, file_id, nguoi_tai, created_at').single()
    if (error) throw error
    await audit(g.auth, g.res.table, id, 'attach', { ten: name })
    return ok({ data })
  } catch (e: any) { return fail(e.message || 'Không tải được tệp', 502) }
}

export async function DELETE(req: NextRequest) {
  const fid = req.nextUrl.searchParams.get('id') ?? ''
  if (!/^[0-9a-f-]{36}$/.test(fid)) return fail('Không hợp lệ')
  const db = supabaseAdmin()
  const { data: f } = await db.from('tep_dinh_kem').select('id, bang, id_ban_ghi, ten').eq('id', fid).maybeSingle()
  if (!f) return fail('Không tìm thấy tệp', 404)
  const g = await guard(f.bang, 'edit'); if (g instanceof Response) return g
  // the file stays in Google Drive (nothing is lost by a wrong click); only the link to the record is removed
  const { error } = await db.from('tep_dinh_kem').delete().eq('id', fid)
  if (error) return fail('Lỗi cơ sở dữ liệu', 500)
  await audit(g.auth, g.res.table, f.id_ban_ghi, 'detach', { ten: f.ten })
  return ok({ data: { id: fid } })
}
