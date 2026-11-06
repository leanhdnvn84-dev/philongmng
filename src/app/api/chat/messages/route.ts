import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { GROUP, KEY, chatAuth, directory } from '@/lib/chat'

export const dynamic = 'force-dynamic'
const fail = (error: string, status = 400) => NextResponse.json({ success: false, error }, { status })

export async function GET(req: NextRequest) {
  const a = await chatAuth(); if (a instanceof NextResponse) return a
  const url = new URL(req.url)
  const withKey = url.searchParams.get('with') ?? ''
  if (withKey !== GROUP && !KEY.test(withKey)) return fail('Cuộc trò chuyện không hợp lệ')
  const after = url.searchParams.get('after')
  const db = supabaseAdmin()
  let q = db.from('tin_nhan').select('id, thoi_gian, id_nguoi_gui, id_nguoi_nhan, noi_dung')
  q = withKey === GROUP ? q.eq('id_nguoi_nhan', GROUP)
    : q.or(`and(id_nguoi_gui.eq.${a.me},id_nguoi_nhan.eq.${withKey}),and(id_nguoi_gui.eq.${withKey},id_nguoi_nhan.eq.${a.me})`)
  if (after && !Number.isNaN(Date.parse(after))) q = q.gt('thoi_gian', after).order('thoi_gian', { ascending: true }).limit(200)
  else q = q.order('thoi_gian', { ascending: false }).limit(200)
  const { data, error } = await q
  if (error) return fail('Lỗi cơ sở dữ liệu', 500)
  const rows = (after ? data : (data ?? []).reverse()) ?? []
  const dir = await directory()
  if (url.searchParams.get('mark') === '1')
    await db.from('chat_doc').upsert({ user_key: a.me, conv: withKey, doc_den: new Date().toISOString() }, { onConflict: 'user_key,conv' })
  return NextResponse.json({
    success: true,
    data: rows.map((m: any) => ({ id: m.id, at: m.thoi_gian, mine: m.id_nguoi_gui === a.me, from: dir.names.get(m.id_nguoi_gui) ?? m.id_nguoi_gui, text: m.noi_dung })),
  })
}

export async function POST(req: NextRequest) {
  const a = await chatAuth(); if (a instanceof NextResponse) return a
  const body = await req.json().catch(() => null)
  const to = String(body?.to ?? ''), text = String(body?.text ?? '').trim()
  if (!text) return fail('Nội dung trống')
  if (text.length > 2000) return fail('Tin nhắn tối đa 2000 ký tự')
  const dir = await directory()
  if (to !== GROUP && !dir.contacts.some((c) => c.key === to && c.key !== a.me)) return fail('Người nhận không hợp lệ')
  const { data, error } = await supabaseAdmin().from('tin_nhan').insert({ id_nguoi_gui: a.me, id_nguoi_nhan: to, noi_dung: text }).select('id, thoi_gian').single()
  if (error) return fail('Không gửi được tin nhắn', 500)
  await supabaseAdmin().from('chat_doc').upsert({ user_key: a.me, conv: to, doc_den: data.thoi_gian }, { onConflict: 'user_key,conv' })
  return NextResponse.json({ success: true, id: data.id, at: data.thoi_gian })
}
