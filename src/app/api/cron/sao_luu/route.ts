import { NextRequest, NextResponse } from 'next/server'
import { createBackup } from '@/lib/backup'
import { buildV27Workbook } from '@/lib/v27Export'
import { driveConfigured, saveBackupToDrive } from '@/lib/driveUpload'
import { saveSummary, scanAll } from '@/lib/dataMaint'
import { r2Configured } from '@/lib/r2'
import { copyBackupToR2 } from '@/lib/r2Backup'

const XLSX = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

/** Vercel Cron (01:00 Việt Nam): daily automatic backup. */
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET
  if (!secret || req.headers.get('authorization') !== `Bearer ${secret}`) return NextResponse.json({ success: false, error: 'Không hợp lệ' }, { status: 401 })
  try {
    const b = await createBackup('Hệ thống', 'TU_DONG', 'Sao lưu tự động hằng ngày')
    // also keep a V27-shaped Excel copy outside the database; a Drive problem must not fail the backup itself
    // (and in R2 when it is configured)
    let v27: string | null = null, v27r2: unknown = null
    if (driveConfigured() || r2Configured()) {
      let w: Awaited<ReturnType<typeof buildV27Workbook>> | null = null
      try { w = await buildV27Workbook() } catch (e: any) { console.error('[cron v27]', e); v27 = 'LỖI: ' + String(e.message ?? e).slice(0, 120) }
      if (w && driveConfigured()) {
        try { await saveBackupToDrive(w.name, XLSX, w.buffer); v27 = w.name }
        catch (e: any) { console.error('[cron v27]', e); v27 = 'LỖI: ' + String(e.message ?? e).slice(0, 120) }
      }
      if (w) v27r2 = await copyBackupToR2(w.name, w.buffer, XLSX)
    }
    // nightly data-maintenance scan: the bell shows what needs fixing the next morning
    let scan: unknown = null
    try { scan = await saveSummary(await scanAll()) } catch (e: any) { console.error('[cron scan]', e); scan = 'LỖI: ' + String(e.message ?? e).slice(0, 120) }
    return NextResponse.json({ success: true, data: b, v27, v27r2, scan })
  } catch (e: any) { return NextResponse.json({ success: false, error: e.message }, { status: 500 }) }
}
