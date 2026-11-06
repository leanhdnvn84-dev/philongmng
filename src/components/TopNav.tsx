'use client'

import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { ChevronDown, LogOut, Menu, X } from 'lucide-react'
import { supabaseBrowser } from '@/lib/supabase/browser'
import Portal from '@/components/Portal'
import Logo from '@/components/Logo'

export interface NavGroup { group: string; items: { label: string; href: string }[] }

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

// V191 menu button: translucent white outline on the red bar; the open/active one turns white
const navBtn = (on: boolean) =>
  `flex items-center gap-1 h-[38px] px-2 2xl:px-3 rounded-[7px] border text-[12px] 2xl:text-[13px] font-extrabold uppercase whitespace-nowrap transition-colors ${
    on ? 'bg-white text-brand-400 border-white shadow-[0_2px_8px_rgba(0,0,0,.18)]' : 'bg-[#25324a] text-white border-white/20 shadow-[0_2px_4px_rgba(0,0,0,.18)] hover:bg-[#34445f] hover:border-white/35'}`

export default function TopNav({ groups, name, role }: { groups: NavGroup[]; name: string; role: string }) {
  const pathname = usePathname()
  const search = useSearchParams()
  const router = useRouter()
  const [open, setOpen] = useState<string | null>(null)
  const [mobile, setMobile] = useState(false)
  const [userMenu, setUserMenu] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const here = decodeURIComponent(pathname + (search.toString() ? '?' + search.toString() : ''))
  const isActive = (href: string) => here === decodeURIComponent(href)
  const groupActive = (g: NavGroup) => g.items.some((i) => isActive(i.href))
  const initials = name.split(/\s+/).filter(Boolean).slice(-2).map((w) => w[0]).join('').toUpperCase()

  useEffect(() => { setOpen(null); setMobile(false); setUserMenu(false) }, [here])
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
    <header ref={ref} className="print:hidden sticky top-0 z-40 bg-brand-400 border-b border-brand-500 shadow-[inset_0_1px_0_rgba(255,255,255,.22),0_4px_13px_rgba(237,50,55,.25)]">
      <div className="h-[62px] px-4 lg:px-5 flex items-center gap-3 2xl:gap-5">
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
                <div className="absolute left-0 top-full pt-2 min-w-[230px]">
                  <div className="rounded-[9px] bg-white border border-navy-200 shadow-pop p-[7px]">
                    {g.items.map((i) => (
                      <Link key={i.href} href={i.href}
                        className={`block rounded-md px-3 py-2 text-[13.5px] font-semibold transition-colors ${isActive(i.href) ? 'bg-brand-50 text-brand-500' : 'text-ink hover:bg-navy-100'}`}>
                        {i.label}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </nav>

        <div className="ml-auto relative flex items-center gap-3 shrink-0">
          <TodayTile />
          <button type="button" onClick={() => setUserMenu(!userMenu)} aria-expanded={userMenu} className="flex items-center gap-2 text-left text-white">
            <span className="grid place-items-center h-9 w-9 rounded-full bg-white text-brand-400 text-[12px] font-black ring-2 ring-white/60">{initials || 'U'}</span>
            <span className="hidden 2xl:block leading-tight">
              <span className="block text-[13px] font-extrabold max-w-[150px] truncate">{name}</span>
              <span className="block text-[11px] font-semibold text-white/85">{role}</span>
            </span>
          </button>
          <button onClick={logout} className="hidden lg:inline-flex h-[34px] items-center px-3 rounded-[7px] bg-white text-[12.5px] font-extrabold text-navy-900 shadow-[0_2px_6px_rgba(0,0,0,.12)] hover:bg-navy-50">Đăng xuất</button>
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
          <button type="button" className="lg:hidden grid place-items-center h-9 w-9 rounded-[7px] border border-white/25 bg-white/10 text-white" onClick={() => setMobile(true)} aria-label="Mở menu">
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>

      {mobile && (<Portal>
        <div data-drawer className="lg:hidden fixed inset-0 z-50" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobile(false)} />
          <div className="absolute right-0 top-0 h-full w-[86%] max-w-sm bg-white overflow-y-auto">
            <div className="h-[62px] px-4 flex items-center justify-between bg-brand-400">
              <Brand />
              <button onClick={() => setMobile(false)} className="grid place-items-center h-9 w-9 rounded-[7px] text-white hover:bg-white/15" aria-label="Đóng menu"><X className="h-5 w-5" /></button>
            </div>
            <nav className="p-3 space-y-1">
              <Link href="/" className={`block rounded-[7px] px-3 py-2.5 text-sm font-bold uppercase ${pathname === '/' ? 'bg-brand-50 text-brand-500' : 'text-ink'}`}>Tổng quan</Link>
              {groups.map((g) => {
                const expanded = open === g.group || (open === null && groupActive(g))
                return (
                  <div key={g.group}>
                    <button onClick={() => setOpen(expanded ? '' : g.group)} className="w-full flex items-center justify-between rounded-[7px] px-3 py-2.5 text-sm font-bold uppercase text-ink hover:bg-navy-100">
                      {g.group} <ChevronDown className={`h-4 w-4 transition-transform ${expanded ? 'rotate-180' : ''}`} />
                    </button>
                    {expanded && (
                      <div className="ml-3 border-l-2 border-brand-200 pl-2 py-1">
                        {g.items.map((i) => (
                          <Link key={i.href} href={i.href} className={`block rounded-md px-3 py-2 text-sm font-semibold ${isActive(i.href) ? 'bg-brand-50 text-brand-500' : 'text-ink-soft hover:bg-navy-100'}`}>{i.label}</Link>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </nav>
            <div className="m-3 mt-4 rounded-[9px] border border-navy-200 p-3">
              <div className="text-sm font-bold text-ink">{name}</div>
              <div className="text-xs text-ink-mute mb-2">{role}</div>
              <button onClick={logout} className="btn-danger w-full"><LogOut className="h-4 w-4" />Đăng xuất</button>
            </div>
          </div>
        </div>
      </Portal>)}
    </header>
  )
}
