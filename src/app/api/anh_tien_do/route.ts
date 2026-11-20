import { NextRequest } from 'next/server'
import { guard, ok, fail } from '@/lib/http'
import { uploadToDrive, driveConfigured } from '@/lib/driveUpload'
import { progressPhotoKey, r2Configured, r2Put, r2Ref } from '@/lib/r2'

export const dynamic = 'force-dynamic'
export const maxDuration = 60
const ID = /^[A-Za-z0-9_.-]{1,64}$/

/** Upload one progress photo (already shrunk by the browser): to R2 when configured (file_id "r2/<key>"),
 *  otherwise to Google Drive (file_id = Drive id). */
export async function POST(req: NextRequest) {
  const form = await req.formData().catch(() => null)
  if (!form) return fail('Dữ liệu không hợp lệ')
  const bang = String(form.get('bang') ?? ''), id = String(form.get('id') ?? '')
  if (!['cong_viec', 'cong_viec_hang_ngay'].includes(bang) || !ID.test(id)) return fail('Công việc không hợp lệ')
  const g = await guard(bang, 'edit')
  if (g instanceof Response) return g
  const useR2 = r2Configured()
  if (!useR2 && !driveConfigured()) return fail('Chưa cấu hình lưu ảnh lên Google Drive. Liên hệ quản trị.', 503)
  const file = form.get('file')
  if (!(file instanceof File)) return fail('Chưa chọn ảnh')
  if (!/^image\//.test(file.type)) return fail('Chỉ nhận file ảnh')
  if (file.size > 4 * 1024 * 1024) return fail('Ảnh quá lớn (tối đa 4 MB sau khi nén)')
  try {
    const bytes = Buffer.from(await file.arrayBuffer())
    let fileId: string
    if (useR2) { const key = progressPhotoKey(bang, id); await r2Put(key, bytes, 'image/jpeg'); fileId = r2Ref(key) }
    else fileId = await uploadToDrive(`${id}_${Date.now()}.jpg`, file.type || 'image/jpeg', bytes)
    return ok({ data: { file_id: fileId } })
  } catch (e: any) { return fail(e.message || 'Không tải được ảnh', 502) }
}
