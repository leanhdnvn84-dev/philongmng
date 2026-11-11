import { NextResponse } from 'next/server'
import { buildV27Workbook } from '@/lib/v27Export'
import { sysGuard } from '@/lib/sysGuard'
import { audit } from '@/lib/crud'
import { driveConfigured, uploadToDrive } from '@/lib/driveUpload'

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

/** Same workbook, saved into the Google Drive folder used for photos (what the nightly job also does). */
export async function POST() {
  const a = await sysGuard(true); if (a instanceof NextResponse) return a
  if (!driveConfigured()) return NextResponse.json({ success: false, error: 'Chưa cấu hình Google Drive cho hệ thống' }, { status: 400 })
  try {
    const { buffer, name } = await buildV27Workbook()
    const id = await uploadToDrive(name, XLSX, buffer)
    await audit(a, 'sao_luu', null, 'luu_v27_len_drive', { file_id: id, name })
    return NextResponse.json({ success: true, data: { id, name, message: `Đã lưu ${name} lên Google Drive.` } })
  } catch (e: any) {
    console.error('[v27-drive]', e)
    return NextResponse.json({ success: false, error: 'Không lưu được lên Google Drive: ' + String(e.message ?? e).slice(0, 150) }, { status: 500 })
  }
}
