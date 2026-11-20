import { NextResponse } from 'next/server'
import { buildV27Workbook } from '@/lib/v27Export'
import { sysGuard } from '@/lib/sysGuard'
import { audit } from '@/lib/crud'
import { driveConfigured, saveBackupToDrive } from '@/lib/driveUpload'
import { r2Configured } from '@/lib/r2'
import { copyBackupToR2 } from '@/lib/r2Backup'

const XLSX = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

/** Current data as an Excel workbook shaped like the V191 sheet (V27): Super Admin only. */
export async function GET() {
  const a = await sysGuard(true); if (a instanceof NextResponse) return a
  try {
    const { buffer, report, name } = await buildV27Workbook()
    await audit(a, 'sao_luu', null, 'tai_file_v27', { sheets: report.length, rows: report.reduce((s, r) => s + r.rows, 0) })
    return new NextResponse(buffer, { headers: {
      'Content-Type': XLSX,
      'Content-Disposition': `attachment; filename="${name}"`, 'Cache-Control': 'no-store',
    } })
  } catch (e: any) {
    console.error('[v27]', e)
    return NextResponse.json({ success: false, error: 'Không tạo được file V27: ' + String(e.message ?? e).slice(0, 150) }, { status: 500 })
  }
}

/** Same workbook, saved privately into the owner's backup folder on Google Drive and, when configured, into R2
 *  (what the nightly job also does). One store failing does not hide the other one's result. */
export async function POST() {
  const a = await sysGuard(true); if (a instanceof NextResponse) return a
  const drive = driveConfigured(), r2 = r2Configured()
  if (!drive && !r2) return NextResponse.json({ success: false, error: 'Chưa cấu hình Google Drive hoặc Cloudflare R2 cho hệ thống' }, { status: 400 })
  let w: Awaited<ReturnType<typeof buildV27Workbook>>
  try { w = await buildV27Workbook() } catch (e: any) {
    console.error('[v27-drive]', e)
    return NextResponse.json({ success: false, error: 'Không tạo được file V27: ' + String(e.message ?? e).slice(0, 150) }, { status: 500 })
  }
  const done: string[] = [], errs: string[] = []
  let id: string | null = null
  if (drive) {
    try { id = await saveBackupToDrive(w.name, XLSX, w.buffer); done.push('thư mục sao lưu trên Google Drive') }
    catch (e: any) { console.error('[v27-drive]', e); errs.push('Google Drive: ' + String(e.message ?? e).slice(0, 150)) }
  }
  const c = await copyBackupToR2(w.name, w.buffer, XLSX)
  if (c?.ok) done.push('Cloudflare R2')
  else if (c) errs.push('R2: ' + c.error)
  await audit(a, 'sao_luu', null, 'luu_v27_len_drive', { file_id: id, name: w.name, r2: c?.ok ? c.key : c ? 'LỖI' : undefined })
  if (!done.length) return NextResponse.json({ success: false, error: 'Không lưu được file V27. ' + errs.join(' · ') }, { status: 500 })
  return NextResponse.json({ success: true, data: { id, name: w.name, message: `Đã lưu ${w.name} vào ${done.join(' và ')}.${errs.length ? ' Lỗi: ' + errs.join(' · ') : ''}` } })
}
