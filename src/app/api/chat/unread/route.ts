import { NextResponse } from 'next/server'
import { chatAuth, summary, directory, GROUP } from '@/lib/chat'

export const dynamic = 'force-dynamic'

/** Unread total + the newest unread incoming message (for the floating bubble and the "new message" popup). */
export async function GET() {
  const a = await chatAuth(); if (a instanceof NextResponse) return a
  const conv = await summary(a.me)
  let n = 0, latest: any = null, where = ''
  conv.forEach((c, key) => {
    n += c.unread
    if (c.lastIn && (!latest || Date.parse(c.lastIn.thoi_gian) > Date.parse(latest.thoi_gian))) { latest = c.lastIn; where = key }
  })
  let last = null
  if (latest) {
    const { names } = await directory()
    last = { id: latest.id, from: names.get(latest.id_nguoi_gui) ?? 'Đồng nghiệp', group: where === GROUP, text: String(latest.noi_dung ?? '').slice(0, 140), at: latest.thoi_gian }
  }
  return NextResponse.json({ success: true, unread: n, last })
}
