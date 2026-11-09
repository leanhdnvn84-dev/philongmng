import { NextRequest } from 'next/server'
import { guard, ok, fail } from '@/lib/http'
import { uploadToDrive, driveConfigured } from '@/lib/driveUpload'

export const dynamic = 'force-dynamic'
export const maxDuration = 60
const ID = /^[A-Za-z0-9_.-]{1,64}$/

/** Upload one progress photo (already shrunk by the browser) to Google Drive; returns its Drive file id. */
export async function POST(req: NextRequest) {
  const form = await req.formData().catch(() => null)
  if (!form) return fail('Dữ liệu không hợp lệ')
  const bang = String(form.get('bang') ?? ''), id = String(form.get('id') ?? '')
  if (!['cong_viec', 'cong_viec_hang_ngay'].includes(bang) || !ID.test(id)) return fail('Công việc không hợp lệ')
  const g = await guard(bang, 'edit')
  if (g instanceof Response) return g
  if (!driveConfigured()) return fail('Chưa cấu hình lưu ảnh lên Google Drive. Liên hệ quản trị.', 503)
  const file = form.get('file')
  if (!(file instanceof File)) return fail('Chưa chọn ảnh')
  if (!/^image\//.test(file.type)) return fail('Chỉ nhận file ảnh')
  if (file.size > 4 * 1024 * 1024) return fail('Ảnh quá lớn (tối đa 4 MB sau khi nén)')
  try {
    const bytes = Buffer.from(await file.arrayBuffer())
    const fileId = await uploadToDrive(`${id}_${Date.now()}.jpg`, file.type || 'image/jpeg', bytes)
    return ok({ data: { file_id: fileId } })
  } catch (e: any) { return fail(e.message || 'Không tải được ảnh', 502) }
}
