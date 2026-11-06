import { NextResponse } from 'next/server'
import { GROUP, chatAuth, directory, summary } from '@/lib/chat'

export const dynamic = 'force-dynamic'

export async function GET() {
  const a = await chatAuth(); if (a instanceof NextResponse) return a
  const [dir, conv] = await Promise.all([directory(), summary(a.me)])
  const row = (key: string, name: string, role: string) => {
    const c = conv.get(key)
    return { key, name, role, unread: c?.unread ?? 0, last: c ? { text: c.last.noi_dung, at: c.last.thoi_gian, mine: c.last.id_nguoi_gui === a.me, from: dir.names.get(c.last.id_nguoi_gui) ?? c.last.id_nguoi_gui } : null }
  }
  const people = dir.contacts.filter((c) => c.key !== a.me).map((c) => row(c.key, c.name, c.role))
    .sort((x, y) => (y.last?.at ?? '').localeCompare(x.last?.at ?? '') || x.name.localeCompare(y.name, 'vi'))
  return NextResponse.json({ success: true, me: a.me, group: row(GROUP, 'Cả nhóm', 'Kênh chung'), data: people })
}
