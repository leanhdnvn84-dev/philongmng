'use client'
import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { Bell, ChevronRight } from 'lucide-react'
import Portal from '@/components/Portal'

/** Bell: what needs the signed-in user's attention (their overdue work, proposals to approve, maintenance due…). Refreshes every minute. */
type Note = { key: string; title: string; count: number; tone: 'red' | 'amber' | 'blue'; href: string; lines: string[] }
const DOT = { red: 'bg-[#e11d2e]', amber: 'bg-amber-500', blue: 'bg-blue-500' }
const NUM = { red: 'bg-red-50 text-red-700', amber: 'bg-amber-50 text-amber-800', blue: 'bg-blue-50 text-blue-700' }

export default function NotificationBell({ className = '' }: { className?: string }) {
  const [notes, setNotes] = useState<Note[]>([])
  const [urgent, setUrgent] = useState(0)
  const [open, setOpen] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const box = useRef<HTMLDivElement>(null)
  const panel = useRef<HTMLDivElement>(null)
  const [pos, setPos] = useState<{ top: number; right: number } | null>(null)

  const load = useCallback(() => {
    fetch('/api/thong_bao').then((r) => r.json()).then((j) => { if (j?.success) { setNotes(j.data); setUrgent(j.urgent ?? 0); setLoaded(true) } }).catch(() => {})
  }, [])
  useEffect(() => {
    load()
    const t = setInterval(() => { if (document.visibilityState === 'visible') load() }, 60000)
    const vis = () => { if (document.visibilityState === 'visible') load() }
    document.addEventListener('visibilitychange', vis)
    return () => { clearInterval(t); document.removeEventListener('visibilitychange', vis) }
  }, [load])
  useEffect(() => {
    if (!open) return
    const out = (e: MouseEvent) => { const t = e.target as Node; if (!box.current?.contains(t) && !panel.current?.contains(t)) setOpen(false) }
    const place = () => { const r = box.current?.getBoundingClientRect(); if (r) setPos({ top: r.bottom + 10, right: Math.max(8, innerWidth - r.right) }) }
    place(); window.addEventListener('resize', place)
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('mousedown', out); document.addEventListener('keydown', esc)
    return () => { document.removeEventListener('mousedown', out); document.removeEventListener('keydown', esc); window.removeEventListener('resize', place) }
  }, [open])

  return (
    <div ref={box} className={`relative ${className}`}>
      <button type="button" onClick={() => { setOpen((o) => !o); if (!open) load() }} aria-expanded={open}
        aria-label={urgent ? `Thông báo, ${urgent} mục cần xử lý` : 'Thông báo'} title="Thông báo"
        className="relative grid h-[38px] w-[38px] place-items-center rounded-full bg-white/10 text-white ring-1 ring-white/25 transition hover:bg-white/20">
        <Bell className="h-[18px] w-[18px]" />
        {urgent > 0 && <span className="absolute -right-1 -top-1 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-white px-1 text-[10.5px] font-black text-[#c4121f] shadow">{urgent > 99 ? '99+' : urgent}</span>}
      </button>
      {open && pos && (<Portal>
        <div ref={panel} style={{ top: pos.top, ['--r' as any]: `${pos.right}px` }} className="fixed inset-x-2 z-[96] lg:left-auto lg:right-[var(--r)] lg:w-[400px]">
          <div className="flex max-h-[min(560px,calc(100dvh-90px))] flex-col overflow-hidden rounded-2xl border border-navy-200 bg-white text-left shadow-[0_18px_40px_rgba(11,31,69,.25)]">
            <div className="flex items-baseline justify-between border-b border-navy-100 px-4 py-3">
              <span className="text-[15px] font-extrabold text-navy-900">Thông báo</span>
              <span className="text-[12px] text-ink-mute">{urgent ? `${urgent} mục cần xử lý` : 'Tự cập nhật mỗi phút'}</span>
            </div>
            <div className="overflow-y-auto">
              {!loaded && <p className="px-4 py-8 text-center text-[13px] text-ink-mute">Đang tải…</p>}
              {loaded && !notes.length && <p className="px-4 py-10 text-center text-[13.5px] text-ink-mute">Không có gì cần xử lý lúc này.</p>}
              {notes.map((n) => (
                <Link key={n.key} href={n.href} onClick={() => setOpen(false)} className="block border-b border-navy-100 px-4 py-3 last:border-0 hover:bg-navy-50">
                  <div className="flex items-center gap-2">
                    <span className={`h-2 w-2 shrink-0 rounded-full ${DOT[n.tone]}`} />
                    <span className="min-w-0 flex-1 truncate text-[14px] font-extrabold text-navy-900">{n.title}</span>
                    <span className={`rounded-full px-2 py-0.5 text-[12px] font-black tabular-nums ${NUM[n.tone]}`}>{n.count}</span>
                    <ChevronRight className="h-4 w-4 shrink-0 text-navy-300" />
                  </div>
                  <ul className="mt-1.5 space-y-0.5 pl-4">
                    {n.lines.map((l, i) => <li key={i} className="truncate text-[12.5px] text-ink-soft">{l}</li>)}
                    {n.count > n.lines.length && <li className="text-[12px] font-semibold text-ink-mute">và {n.count - n.lines.length} mục khác…</li>}
                  </ul>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </Portal>)}
    </div>
  )
}
