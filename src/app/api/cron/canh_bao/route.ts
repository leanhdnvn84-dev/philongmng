import { NextRequest, NextResponse } from 'next/server'
import { runAlerts } from '@/lib/alerts'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

/** Vercel Cron (08:00 Việt Nam): sends the enabled e-mail alerts. */
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET
  if (!secret || req.headers.get('authorization') !== `Bearer ${secret}`) return NextResponse.json({ success: false, error: 'Không hợp lệ' }, { status: 401 })
  const r = await runAlerts({ send: true })
  return NextResponse.json({ success: true, data: r })
}
