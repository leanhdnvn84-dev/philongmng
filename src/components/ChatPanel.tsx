'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { ArrowLeft, Loader2, Send, Users, X } from 'lucide-react'

interface Conv { key: string; name: string; role: string; unread: number; last: { text: string; at: string; mine: boolean; from: string } | null }
interface Msg { id: string; at: string; mine: boolean; from: string; text: string }

const GROUP = '__GROUP__'
const hhmm = (iso: string) => new Intl.DateTimeFormat('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh', hour: '2-digit', minute: '2-digit' }).format(new Date(iso))
const dayKey = (iso: string) => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Ho_Chi_Minh' }).format(new Date(iso))
const dayLabel = (iso: string) => {
  const k = dayKey(iso), t = dayKey(new Date().toISOString())
  return k === t ? 'Hôm nay' : `${k.slice(8, 10)}/${k.slice(5, 7)}/${k.slice(0, 4)}`
}
const initials = (n: string) => n.split(/\s+/).filter(Boolean).slice(-2).map((w) => w[0]).join('').toUpperCase()

async function get(url: string) {
  const r = await fetch(url, { cache: 'no-store' })
  if (r.status === 401) { window.location.href = '/login'; throw new Error('401') }
  const j = await r.json().catch(() => ({ success: false }))
  if (!j.success) throw new Error(j.error || 'Lỗi')
  return j
}

export default function ChatPanel({ popup = false, onClose }: { popup?: boolean; onClose?: () => void }) {
  const [group, setGroup] = useState<Conv | null>(null)
  const [people, setPeople] = useState<Conv[]>([])
  const [active, setActive] = useState<string | null>(null) // phone: null = conversation list
  const [msgs, setMsgs] = useState<Msg[]>([])
  const [loadingMsgs, setLoadingMsgs] = useState(false)
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const [err, setErr] = useState('')
  const [q, setQ] = useState('')
  const bottom = useRef<HTMLDivElement>(null)
  const lastAt = useRef<string | null>(null)
  const activeRef = useRef<string | null>(null)
  activeRef.current = active

  const loadContacts = useCallback(async () => {
    try { const j = await get('/api/chat/contacts'); setGroup(j.group); setPeople(j.data); setErr('') } catch (e: any) { if (e.message !== '401') setErr('Không tải được danh sách. Đang thử lại…') }
  }, [])
  useEffect(() => { loadContacts(); const t = setInterval(() => !document.hidden && loadContacts(), 8000); return () => clearInterval(t) }, [loadContacts])

  // open a conversation: full history, then poll for newer messages
  useEffect(() => {
    if (!active) return
    let dead = false
    setMsgs([]); lastAt.current = null; setLoadingMsgs(true)
    const pull = async (first: boolean) => {
      try {
        const after = lastAt.current ? `&after=${encodeURIComponent(lastAt.current)}` : ''
        const j = await get(`/api/chat/messages?with=${encodeURIComponent(active)}${after}&mark=1`)
        if (dead) return
        if (j.data.length) {
          lastAt.current = j.data[j.data.length - 1].at
          setMsgs((m) => { const seen = new Set(m.map((x) => x.id)); return [...m, ...j.data.filter((x: Msg) => !seen.has(x.id))] })
          if (!first) loadContacts()
        }
      } catch { /* retried on the next tick */ } finally { if (first && !dead) setLoadingMsgs(false) }
    }
    pull(true)
    const t = setInterval(() => !document.hidden && pull(false), 3000)
    return () => { dead = true; clearInterval(t) }
  }, [active, loadContacts])

  useEffect(() => { bottom.current?.scrollIntoView({ block: 'end' }) }, [msgs])

  async function send() {
    const t = text.trim()
    if (!t || !active || sending) return
    setSending(true); setErr('')
    try {
      const r = await fetch('/api/chat/messages', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ to: active, text: t }) })
      const j = await r.json().catch(() => ({}))
      if (!r.ok || !j.success) throw new Error(j.error || 'Không gửi được')
      setText('')
      setMsgs((m) => [...m, { id: j.id, at: j.at, mine: true, from: 'Tôi', text: t }])
      lastAt.current = j.at
      loadContacts()
    } catch (e: any) { setErr(e.message) } finally { setSending(false) }
  }

  const list = [group, ...people.filter((p) => !q || p.name.toLowerCase().includes(q.toLowerCase()))].filter(Boolean) as Conv[]
  const current = list.find((c) => c.key === active) ?? (active === GROUP ? group : people.find((p) => p.key === active))

  const Row = (c: Conv) => (
    <button key={c.key} onClick={() => setActive(c.key)}
      className={`flex w-full items-center gap-3 border-b border-navy-100 px-3 py-3 text-left ${active === c.key ? 'bg-select' : 'hover:bg-navy-50'}`}>
      <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-full text-sm font-black ${c.key === GROUP ? 'bg-navy-900 text-white' : 'bg-blue-50 text-blue-700'}`}>
        {c.key === GROUP ? <Users className="h-5 w-5" /> : initials(c.name)}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-baseline justify-between gap-2">
          <span className={`truncate text-[15px] ${c.unread ? 'font-extrabold' : 'font-bold'} text-navy-900`}>{c.name}</span>
          {c.last && <span className="shrink-0 text-[11px] text-ink-mute">{hhmm(c.last.at)}</span>}
        </span>
        <span className="flex items-center justify-between gap-2">
          <span className={`truncate text-[13px] ${c.unread ? 'font-semibold text-navy-900' : 'text-ink-mute'}`}>
            {c.last ? `${c.last.mine ? 'Bạn: ' : c.key === GROUP ? `${c.last.from.split(' ').slice(-1)[0]}: ` : ''}${c.last.text}` : c.role || 'Chưa có tin nhắn'}
          </span>
          {c.unread > 0 && <span className="grid h-5 min-w-5 shrink-0 place-items-center rounded-full bg-brand-400 px-1.5 text-[11px] font-black text-white">{c.unread}</span>}
        </span>
      </span>
    </button>
  )

  let prevDay = ''
  return (
    <div className={popup ? 'flex h-full flex-col' : 'flex flex-col flex-1 lg:min-h-0'}>
      {!popup && (
        <div className="shrink-0 flex flex-wrap items-baseline gap-x-5 gap-y-1 px-4 lg:px-5 py-2 bg-white border-b border-navy-200">
          <span className="text-[12.5px] text-ink-mute">PHI LONG / <b className="text-navy-800">Trao đổi nội bộ</b></span>
          <h1 className="text-[22px] font-black text-navy-900">Trao đổi nội bộ</h1>
        </div>
      )}
      <div className={popup ? 'min-h-0 flex-1' : 'px-3 lg:px-5 py-3 lg:flex-1 lg:min-h-0'}>
        <div className={popup ? 'flex h-full overflow-hidden' : 'card flex h-[calc(100dvh-230px)] min-h-[420px] overflow-hidden lg:h-full'}>
          {/* conversations */}
          <aside className={popup ? `${active ? 'hidden' : 'flex'} w-full flex-col` : `${active ? 'hidden' : 'flex'} w-full flex-col lg:flex lg:w-[320px] lg:shrink-0 lg:border-r border-navy-200`}>
            {popup && (
              <div className="flex shrink-0 items-center justify-between bg-blue-700 px-4 py-3 text-white">
                <h2 className="text-[17px] font-extrabold">Trao đổi nội bộ</h2>
                <button onClick={onClose} aria-label="Đóng" className="grid h-8 w-8 place-items-center rounded-full hover:bg-white/15"><X className="h-5 w-5" /></button>
              </div>
            )}
            <div className="shrink-0 border-b p-2"><input className="input" type="search" placeholder="Tìm người…" value={q} onChange={(e) => setQ(e.target.value)} /></div>
            <div className="min-h-0 flex-1 overflow-y-auto">
              {list.map(Row)}
              {!group && <div className="p-6 text-center text-ink-mute"><Loader2 className="mx-auto h-5 w-5 animate-spin" /></div>}
            </div>
          </aside>

          {/* thread */}
          <section className={popup ? `${active ? 'flex' : 'hidden'} min-w-0 flex-1 flex-col` : `${active ? 'flex' : 'hidden'} min-w-0 flex-1 flex-col lg:flex`}>
            {!current ? (
              <div className="m-auto p-6 text-center text-ink-mute">Chọn một cuộc trò chuyện để bắt đầu.</div>
            ) : (<>
              <header className="flex shrink-0 items-center gap-3 border-b px-3 py-2.5">
                <button className={`${popup ? '' : 'lg:hidden '}grid h-9 w-9 place-items-center rounded-full hover:bg-navy-50`} onClick={() => setActive(null)} aria-label="Quay lại"><ArrowLeft className="h-5 w-5" /></button>
                <span className={`grid h-10 w-10 place-items-center rounded-full text-sm font-black ${current.key === GROUP ? 'bg-navy-900 text-white' : 'bg-blue-50 text-blue-700'}`}>
                  {current.key === GROUP ? <Users className="h-5 w-5" /> : initials(current.name)}</span>
                <div className="min-w-0 flex-1 leading-tight"><div className="truncate font-extrabold text-navy-900">{current.name}</div><div className="truncate text-xs text-ink-mute">{current.key === GROUP ? 'Tất cả mọi người trong hệ thống' : current.role}</div></div>
                {popup && <button onClick={onClose} aria-label="Đóng" className="grid h-9 w-9 place-items-center rounded-full hover:bg-navy-50"><X className="h-5 w-5" /></button>}
              </header>
              <div className="min-h-0 flex-1 space-y-1 overflow-y-auto bg-canvas px-3 py-3">
                {loadingMsgs && <div className="py-6 text-center text-ink-mute"><Loader2 className="mx-auto h-5 w-5 animate-spin" /></div>}
                {!loadingMsgs && !msgs.length && <div className="py-10 text-center text-sm text-ink-mute">Chưa có tin nhắn. Hãy gửi lời chào!</div>}
                {msgs.map((m) => {
                  const d = dayKey(m.at), head = d !== prevDay; prevDay = d
                  return (
                    <div key={m.id}>
                      {head && <div className="my-2 text-center text-[11px] font-semibold text-ink-mute">{dayLabel(m.at)}</div>}
                      <div className={`flex ${m.mine ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[82%] rounded-2xl px-3 py-2 text-[14.5px] shadow-sm ${m.mine ? 'rounded-br-md bg-blue-600 text-white' : 'rounded-bl-md bg-white text-navy-900'}`}>
                          {!m.mine && current.key === GROUP && <div className="text-[11.5px] font-extrabold text-blue-700">{m.from}</div>}
                          <div className="whitespace-pre-wrap break-words">{m.text}</div>
                          <div className={`mt-0.5 text-right text-[10.5px] ${m.mine ? 'text-white/80' : 'text-ink-mute'}`}>{hhmm(m.at)}</div>
                        </div>
                      </div>
                    </div>
                  )
                })}
                <div ref={bottom} />
              </div>
              {err && <p className="shrink-0 bg-red-50 px-3 py-1.5 text-sm text-red-700" role="alert">{err}</p>}
              <form className="flex shrink-0 items-end gap-2 border-t bg-white p-2" onSubmit={(e) => { e.preventDefault(); send() }}>
                <textarea className="input max-h-32 min-h-[44px] flex-1 resize-none py-2.5 text-[16px]" rows={1} maxLength={2000} placeholder="Nhập tin nhắn…" value={text}
                  onChange={(e) => setText(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey && !('ontouchstart' in window)) { e.preventDefault(); send() } }} />
                <button className="btn-primary h-11 w-11 shrink-0 px-0" disabled={sending || !text.trim()} aria-label="Gửi">{sending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}</button>
              </form>
            </>)}
          </section>
        </div>
      </div>
    </div>
  )
}
