import { NextRequest, NextResponse } from 'next/server'
import { createBackup } from '@/lib/backup'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

/** Vercel Cron (01:00 Việt Nam): daily automatic backup. */
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET
  if (!secret || req.headers.get('authorization') !== `Bearer ${secret}`) return NextResponse.json({ success: false, error: 'Không hợp lệ' }, { status: 401 })
  try {
    const b = await createBackup('Hệ thống', 'TU_DONG', 'Sao lưu tự động hằng ngày')
    return NextResponse.json({ success: true, data: b })
  } catch (e: any) { return NextResponse.json({ success: false, error: e.message }, { status: 500 }) }
}
