import { NextResponse } from 'next/server'
import { chatAuth, summary } from '@/lib/chat'

export const dynamic = 'force-dynamic'

export async function GET() {
  const a = await chatAuth(); if (a instanceof NextResponse) return a
  const conv = await summary(a.me)
  let n = 0; conv.forEach((c) => { n += c.unread })
  return NextResponse.json({ success: true, unread: n })
}
