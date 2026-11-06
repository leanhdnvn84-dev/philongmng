'use client'

import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { ArrowUp, ChevronDown, LogOut, Menu, MessageCircle, Search, X } from 'lucide-react'
import { supabaseBrowser } from '@/lib/supabase/browser'
import Portal from '@/components/Portal'
import Logo from '@/components/Logo'
import ChatPanel from '@/components/ChatPanel'
import { useDockSide } from '@/lib/dock'

export interface NavGroup { group: string; items: { label: string; href: string }[] }

const ICONS: Record<string, string> = {
  'Công việc': '🗂️', 'Bảo trì': '🔧', 'Đề xuất': '📝', 'Thiết bị & kho': '📦', 'Cho thuê': '🏠', 'Danh mục': '📁', 'Hệ thống': '🔒',
}

function Brand() {
  return (
    <Link href="/" className="shrink-0" aria-label="Trang tổng quan">
      <Logo variant="white" height={40} />
    </Link>
  )
}

function TodayTile() {
  const now = new Date()
  const p = (o: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh', ...o }).format(now)
  const day = p({ day: '2-digit' }), month = p({ month: 'numeric' }), weekday = p({ weekday: 'long' }), full = p({ day: '2-digit', month: '2-digit', year: 'numeric' })
  return (
    <div className="hidden 2xl:flex items-center gap-2 h-11 pl-1.5 pr-3 rounded-[9px] bg-white shadow-[0_2px_6px_rgba(0,0,0,.12)]">
      <div className="w-9 overflow-hidden rounded-md border border-brand-200 text-center leading-none">
        <div className="bg-brand-400 text-white text-[9px] font-black py-0.5">T{month}</div>
        <div className="text-[15px] font-black text-navy-900 py-0.5">{day}</div>
      </div>
      <div className="leading-tight">
        <div className="text-[9.5px] font-black uppercase tracking-wide text-brand-400">Lịch hôm nay</div>
        <div className="text-[12px] font-bold text-navy-900 first-letter:uppercase">{weekday} · {full}</div>
      </div>
    </div>
  )
}

// Menu style 3 ("Đỏ thương hiệu cao cấp"): frosted pills on a red gradient bar; the open/active one lifts to white
const navBtn = (on: boolean) =>
  `flex items-center gap-1 h-[40px] px-3 2xl:px-4 rounded-full border text-[12px] 2xl:text-[12.5px] font-extrabold uppercase tracking-[.05em] whitespace-nowrap transition active:translate-y-px ${
    on ? 'bg-white text-brand-600 border-white shadow-[0_6px_16px_rgba(0,0,0,.2),inset_0_-2px_0_rgba(237,50,55,.18)]' : 'bg-white/[.14] text-white border-white/25 shadow-[inset_0_1px_0_rgba(255,255,255,.28),0_2px_6px_rgba(120,10,14,.22)] hover:bg-white/25 hover:border-white/40'}`

export default function TopNav({ groups, name, role }: { groups: NavGroup[]; name: string; role: string }) {
  const pathname = usePathname()
  const search = useSearchParams()
  const router = useRouter()
  const [open, setOpen] = useState<string | null>(null)
  const [mobile, setMobile] = useState(false)
  const [userMenu, setUserMenu] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const [pageSearch, setPageSearch] = useState('')
  const [showTop, setShowTop] = useState(false)
  const [unread, setUnread] = useState(0)
  const [chatOpen, setChatOpen] = useState(false)
  const [dock, setDock] = useDockSide()
  useEffect(() => {
    let dead = false
    const tick = () => { if (document.hidden) return; fetch('/api/chat/unread', { cache: 'no-store' }).then((r) => r.json()).then((j) => !dead && j.success && setUnread(j.unread)).catch(() => {}) }
    tick(); const t = setInterval(tick, 20000)
    return () => { dead = true; clearInterval(t) }
  }, [pathname, chatOpen])
  const onPageSearch = (v: string) => { setPageSearch(v); window.dispatchEvent(new CustomEvent('pl-search', { detail: v })) }

  const here = decodeURIComponent(pathname + (search.toString() ? '?' + search.toString() : ''))
  const isActive = (href: string) => here === decodeURIComponent(href)
  const groupActive = (g: NavGroup) => g.items.some((i) => isActive(i.href))
  const initials = name.split(/\s+/).filter(Boolean).slice(-2).map((w) => w[0]).join('').toUpperCase()

  useEffect(() => { setOpen(null); setMobile(false); setUserMenu(false); setPageSearch('') }, [here])
  useEffect(() => {
    const on = () => setShowTop(window.scrollY > 240)
    on(); window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [])
  useEffect(() => {
    const click = (e: MouseEvent) => { if ((e.target as Element | null)?.closest?.('[data-drawer]')) return; if (ref.current && !ref.current.contains(e.target as Node)) { setOpen(null); setUserMenu(false) } }
    const key = (e: KeyboardEvent) => { if (e.key === 'Escape') { setOpen(null); setUserMenu(false); setMobile(false) } }
    document.addEventListener('mousedown', click); document.addEventListener('keydown', key)
    return () => { document.removeEventListener('mousedown', click); document.removeEventListener('keydown', key) }
  }, [])

  async function logout() {
    await supabaseBrowser().auth.signOut()
    router.replace('/login')
    router.refresh()
  }

  return (
    <header ref={ref} className="print:hidden sticky top-0 z-40 bg-[linear-gradient(135deg,#f5565b_0%,#ED3237_45%,#c4161b_100%)] border-b border-brand-600/40 shadow-[inset_0_1px_0_rgba(255,255,255,.35),0_10px_26px_rgba(196,22,27,.3)]">
      {/* phone: red bar with logo + page search (menu and filters live in the floating buttons) */}
      <div className="lg:hidden flex items-center gap-3 px-3 py-2">
        <Link href="/" className="shrink-0" aria-label="Trang tổng quan"><Logo variant="white" height={40} /></Link>
        <label className="relative flex-1 min-w-0">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-mute" />
          <input type="search" value={pageSearch} onChange={(e) => onPageSearch(e.target.value)} placeholder="Tìm trang này…" aria-label="Tìm trang này"
            className="h-11 w-full rounded-full border border-white/30 bg-white/95 pl-9 pr-3 text-[16px] shadow-[0_2px_8px_rgba(120,10,14,.2)] outline-none focus:ring-2 focus:ring-white/70" />
        </label>
      </div>
      <div className="hidden lg:flex h-[62px] px-4 lg:px-5 items-center gap-3 2xl:gap-5">
        <Brand />

        <nav className="hidden lg:flex items-center gap-1 2xl:gap-1.5 flex-1 min-w-0" aria-label="Menu chính">
          <Link href="/" className={navBtn(pathname === '/')}>Tổng quan</Link>
          {groups.map((g) => (
            <div key={g.group} className="relative" onMouseEnter={() => setOpen(g.group)} onMouseLeave={() => setOpen((o) => (o === g.group ? null : o))}>
              <button type="button" aria-expanded={open === g.group} onClick={() => setOpen(open === g.group ? null : g.group)}
                className={navBtn(open === g.group || groupActive(g))}>
                {g.group} <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open === g.group ? 'rotate-180' : ''}`} />
              </button>
              {open === g.group && (
                <div className="absolute left-0 top-full pt-2 min-w-[280px]">
                  <div className="overflow-hidden rounded-[18px] bg-white shadow-[0_26px_60px_rgba(16,26,45,.28),0_0_0_1px_rgba(16,26,45,.05)]">
                    <div className="border-b border-blue-100 bg-gradient-to-br from-blue-50 to-blue-100 px-4 py-3">
                      <div className="text-[11px] font-extrabold uppercase tracking-[.12em] text-blue-700">{g.group}</div>
                      <div className="text-[12.5px] text-ink-mute">{g.items.length} mục</div>
                    </div>
                    <div className="p-2">
                      {g.items.map((i) => (
                        <Link key={i.href} href={i.href}
                          className={`flex items-center rounded-xl px-3.5 py-2.5 text-[14px] font-bold transition-colors ${isActive(i.href) ? 'bg-blue-50 text-blue-700' : 'text-navy-900 hover:bg-navy-100'}`}>
                          {i.label}<span className={`ml-auto text-[19px] leading-none ${isActive(i.href) ? 'text-blue-600' : 'text-navy-300'}`}>›</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </nav>

        <div className="ml-auto relative flex items-center gap-3 shrink-0">
          <TodayTile />
          <button type="button" onClick={() => setChatOpen((o) => !o)} aria-label="Trao đổi nội bộ" title="Trao đổi nội bộ" aria-expanded={chatOpen} className="relative hidden lg:grid h-10 w-10 place-items-center rounded-full border border-white/35 bg-white/[.16] text-white shadow-[inset_0_1px_0_rgba(255,255,255,.3)] hover:bg-white/25">
            <MessageCircle className="h-5 w-5" />
            {unread > 0 && <span className="absolute -right-1 -top-1 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-white px-1 text-[10px] font-black text-brand-500">{unread > 99 ? '99+' : unread}</span>}
          </button>
          <button type="button" onClick={() => setUserMenu(!userMenu)} aria-expanded={userMenu} className="flex items-center gap-2 text-left text-white">
            <span className="grid place-items-center h-10 w-10 rounded-full bg-white text-brand-500 text-[12px] font-black shadow-[0_0_0_3px_rgba(255,255,255,.4)]">{initials || 'U'}</span>
            <span className="hidden 2xl:block leading-tight">
              <span className="block text-[13px] font-extrabold max-w-[150px] truncate">{name}</span>
              <span className="block text-[11px] font-semibold text-white/85">{role}</span>
            </span>
          </button>
          <button onClick={logout} className="hidden lg:inline-flex h-[38px] items-center px-4 rounded-full bg-white text-[12.5px] font-extrabold text-navy-900 shadow-[0_4px_12px_rgba(0,0,0,.16)] transition hover:bg-navy-50 active:translate-y-px">Đăng xuất</button>
          {userMenu && (
            <div className="absolute right-0 top-full mt-2 w-60 rounded-[9px] bg-white border border-navy-200 shadow-pop p-[7px]">
              <div className="px-3 py-2 border-b border-navy-200 mb-1">
                <div className="text-sm font-bold text-ink truncate">{name}</div>
                <div className="text-xs text-ink-mute">{role}</div>
              </div>
              <button onClick={logout} className="w-full flex items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold text-brand-500 hover:bg-brand-50">
                <LogOut className="h-4 w-4" /> Đăng xuất
              </button>
            </div>
          )}
        </div>
      </div>

      <Portal>
        <div className="lg:hidden print:hidden">
          <button type="button" onClick={() => setMobile(true)} aria-label="Mở menu"
            className={`fixed ${dock === 'left' ? 'left-4' : 'right-4'} bottom-4 z-30 grid h-14 w-14 place-items-center rounded-full bg-gradient-to-b from-blue-500 to-blue-700 text-white shadow-[0_6px_18px_rgba(37,99,235,.45)] active:scale-95`}>
            <Menu className="h-6 w-6" />
            {unread > 0 && <span className="absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-brand-400 px-1 text-[11px] font-black text-white ring-2 ring-white">{unread > 99 ? '99+' : unread}</span>}
          </button>
          {showTop && (
            <button type="button" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} aria-label="Lên đầu trang"
              className={`fixed ${dock === 'left' ? 'right-4' : 'left-4'} bottom-4 z-30 grid h-14 w-14 place-items-center rounded-full border border-navy-200 bg-white text-navy-900 shadow-[0_6px_18px_rgba(16,24,40,.2)] active:scale-95`}>
              <ArrowUp className="h-6 w-6" />
            </button>
          )}
        </div>
      </Portal>

      {chatOpen && (<Portal>
        <div className="print:hidden fixed inset-0 z-[60] flex flex-col overflow-hidden bg-white shadow-pop sm:inset-auto sm:bottom-4 sm:right-4 sm:h-[min(620px,calc(100dvh-6rem))] sm:w-[400px] sm:rounded-2xl sm:border sm:border-navy-200" role="dialog" aria-label="Trao đổi nội bộ">
          <ChatPanel popup onClose={() => setChatOpen(false)} />
        </div>
      </Portal>)}

      {mobile && (<Portal>
        <div data-drawer className="lg:hidden fixed inset-0 z-50" role="dialog" aria-modal="true">
          <div className="pl-fade absolute inset-0 bg-black/45" onClick={() => setMobile(false)} />
          <div className="pl-sheet absolute inset-x-3 bottom-3 flex max-h-[84vh] flex-col overflow-hidden rounded-2xl bg-white shadow-pop">
            <div className="flex shrink-0 items-center gap-3 bg-blue-50 px-4 py-3">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-blue-600 text-sm font-black text-white">{initials || 'U'}</span>
              <div className="min-w-0 flex-1 leading-tight">
                <div className="truncate text-[17px] font-extrabold text-navy-900">{name}</div>
                <div className="text-[13px] text-ink-mute">{role}</div>
              </div>
              <button onClick={() => setMobile(false)} className="grid h-10 w-10 place-items-center rounded-full bg-white text-navy-900 shadow-sm" aria-label="Đóng menu"><X className="h-5 w-5" /></button>
            </div>
            <nav className="overflow-y-auto overscroll-contain px-3 py-2">
              <Link href="/" className={`flex items-center gap-3 rounded-[10px] px-3 py-3.5 text-[16px] font-extrabold uppercase ${pathname === '/' ? 'bg-blue-50 text-blue-700' : 'text-navy-900'}`}><span className="w-7 text-center text-[22px]">📊</span>Tổng quan</Link>
              <button type="button" onClick={() => { setMobile(false); setChatOpen(true) }} className="flex w-full items-center gap-3 rounded-[10px] px-3 py-3.5 text-left text-[16px] font-extrabold uppercase text-navy-900"><span className="w-7 text-center text-[22px]">💬</span><span className="flex-1">Trao đổi</span>{unread > 0 && <span className="grid h-6 min-w-6 place-items-center rounded-full bg-brand-400 px-1.5 text-[12px] font-black text-white">{unread}</span>}</button>
              {groups.map((g) => {
                const expanded = open === g.group || (open === null && groupActive(g))
                return (
                  <div key={g.group} className="border-t border-navy-100">
                    <button onClick={() => setOpen(expanded ? '' : g.group)} aria-expanded={expanded} className="flex w-full items-center gap-3 rounded-[10px] px-3 py-3.5 text-left text-[16px] font-extrabold uppercase text-navy-900 active:bg-navy-50">
                      <span className="w-7 text-center text-[22px]">{ICONS[g.group] ?? '📁'}</span>
                      <span className="flex-1">{g.group}</span>
                      <span className={`text-[12px] text-ink-mute transition-transform ${expanded ? 'rotate-180' : ''}`}>▼</span>
                    </button>
                    {expanded && (
                      <div className="mb-2 ml-6 border-l-2 border-blue-200 pl-2">
                        {g.items.map((i) => (
                          <Link key={i.href} href={i.href} className={`block rounded-lg px-3 py-3 text-[15px] font-semibold ${isActive(i.href) ? 'bg-blue-50 text-blue-700' : 'text-ink-soft active:bg-navy-50'}`}>{i.label}</Link>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
              <div className="border-t border-navy-100 px-1 py-3">
                <div className="mb-3 flex items-center gap-3 px-2">
                  <span className="flex-1 text-[13.5px] font-bold text-navy-900">Vị trí nút menu</span>
                  <div className="inline-flex rounded-full bg-navy-100 p-0.5" role="group" aria-label="Vị trí nút menu">
                    {(['left', 'right'] as const).map((sd) => (
                      <button key={sd} type="button" aria-pressed={dock === sd} onClick={() => setDock(sd)}
                        className={`h-8 rounded-full px-4 text-[13px] font-bold ${dock === sd ? 'bg-blue-600 text-white shadow' : 'text-ink-soft'}`}>{sd === 'left' ? 'Trái' : 'Phải'}</button>
                    ))}
                  </div>
                </div>
                <button onClick={logout} className="btn-danger w-full h-12 text-[15px]"><LogOut className="h-4 w-4" />Đăng xuất</button>
              </div>
            </nav>
          </div>
        </div>
      </Portal>)}
    </header>
  )
}
