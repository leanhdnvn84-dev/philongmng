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

/** Sends an e-mail through the same Apps Script web app (MailApp, from the owner's Gmail). */
export async function sendMailViaScript(to: string[], subject: string, html: string): Promise<void> {
  const url = process.env.DRIVE_UPLOAD_URL, token = process.env.DRIVE_UPLOAD_TOKEN
  if (!url || !token) throw new Error('Chưa cấu hình gửi email (DRIVE_UPLOAD_URL / DRIVE_UPLOAD_TOKEN)')
  const res = await fetch(url, {
    method: 'POST', redirect: 'follow', headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({ token, action: 'mail', to, subject, html }), signal: AbortSignal.timeout(45000),
  })
  let j: any = null
  try { j = JSON.parse(await res.text()) } catch { /* html error page */ }
  if (!res.ok || !j?.ok) throw new Error(j?.error ? `Gửi mail: ${j.error}` : 'Script gửi email chưa được cập nhật hoặc không phản hồi')
}

/** Google Drive folder that receives the V27 Excel backups (owner's choice); DRIVE_BACKUP_FOLDER overrides it. */
export const BACKUP_FOLDER = process.env.DRIVE_BACKUP_FOLDER || '1AQKcVuQJGOdT-Mryqsl6JdhlgC0Nsmw2'

async function script(body: Record<string, unknown>) {
  const url = process.env.DRIVE_UPLOAD_URL, token = process.env.DRIVE_UPLOAD_TOKEN
  if (!url || !token) throw new Error('Chưa cấu hình Google Drive cho hệ thống')
  const res = await fetch(url, { method: 'POST', redirect: 'follow', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify({ token, ...body }), signal: AbortSignal.timeout(50000) })
  try { return JSON.parse(await res.text()) } catch { return null }
}

/** Saves a private file into a given Drive folder. Photos are shared by link, a backup must never be:
 *  the script is asked first whether it knows the private "file" action, so an old script cannot publish the data. */
export async function saveBackupToDrive(name: string, mime: string, bytes: Buffer, folder = BACKUP_FOLDER): Promise<string> {
  const ping = await script({ action: 'ping' })
  if (!ping?.ok || !(Number(ping.v) >= 2)) throw new Error('Apps Script chưa được cập nhật để lưu file sao lưu vào thư mục riêng')
  const j = await script({ action: 'file', folder, name, mime, data: bytes.toString('base64') })
  if (!j?.ok || !j.id) throw new Error(j?.error ? `Google Drive: ${j.error}` : 'Không lưu được file lên Google Drive')
  return String(j.id)
}
