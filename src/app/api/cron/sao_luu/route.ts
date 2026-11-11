import { NextRequest, NextResponse } from 'next/server'
import { createBackup } from '@/lib/backup'
import { buildV27Workbook } from '@/lib/v27Export'
import { driveConfigured, uploadToDrive } from '@/lib/driveUpload'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

/** Vercel Cron (01:00 Việt Nam): daily automatic backup. */
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET
  if (!secret || req.headers.get('authorization') !== `Bearer ${secret}`) return NextResponse.json({ success: false, error: 'Không hợp lệ' }, { status: 401 })
  try {
    const b = await createBackup('Hệ thống', 'TU_DONG', 'Sao lưu tự động hằng ngày')
    // also keep a V27-shaped Excel copy outside the database; a Drive problem must not fail the backup itself
    let v27: string | null = null
    if (driveConfigured()) {
      try { const w = await buildV27Workbook(); await uploadToDrive(w.name, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', w.buffer); v27 = w.name }
      catch (e: any) { console.error('[cron v27]', e); v27 = 'LỖI: ' + String(e.message ?? e).slice(0, 120) }
    }
    return NextResponse.json({ success: true, data: b, v27 })
  } catch (e: any) { return NextResponse.json({ success: false, error: e.message }, { status: 500 }) }
}
