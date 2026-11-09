import 'server-only'

/** Photos are stored in the owner's Google Drive through a small Apps Script web app (DRIVE_UPLOAD_URL + DRIVE_UPLOAD_TOKEN).
 *  The app only keeps the Drive file id, exactly like the V191 sheet did. */
export const driveConfigured = () => !!(process.env.DRIVE_UPLOAD_URL && process.env.DRIVE_UPLOAD_TOKEN)

export async function uploadToDrive(name: string, mime: string, bytes: Buffer): Promise<string> {
  const url = process.env.DRIVE_UPLOAD_URL, token = process.env.DRIVE_UPLOAD_TOKEN
  if (!url || !token) throw new Error('Chưa cấu hình lưu ảnh lên Google Drive (DRIVE_UPLOAD_URL / DRIVE_UPLOAD_TOKEN)')
  const res = await fetch(url, {
    method: 'POST', redirect: 'follow', headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({ token, name, mime, data: bytes.toString('base64') }),
    signal: AbortSignal.timeout(45000),
  })
  const txt = await res.text()
  let j: any = null
  try { j = JSON.parse(txt) } catch { /* html error page */ }
  if (!res.ok || !j?.ok || !j.id) throw new Error(j?.error ? `Google Drive: ${j.error}` : 'Không tải được ảnh lên Google Drive')
  return String(j.id)
}
