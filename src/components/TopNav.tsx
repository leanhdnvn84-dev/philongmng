'use client'

import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import {
  LayoutDashboard, ClipboardList, Wrench, FileSignature, Boxes, Building2, BookUser, ShieldCheck,
  ChevronDown, LogOut, Menu, X,
} from 'lucide-react'
import { supabaseBrowser } from '@/lib/supabase/browser'
import Portal from '@/components/Portal'

export interface NavGroup { group: string; items: { label: string; href: string }[] }

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  'Công việc': ClipboardList, 'Bảo trì': Wrench, 'Đề xuất': FileSignature, 'Thiết bị & kho': Boxes,
  'Cho thuê': Building2, 'Danh mục': BookUser, 'Hệ thống': ShieldCheck,
}

function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2.5 shrink-0 group" aria-label="Trang tổng quan">
      <span className="grid place-items-center h-9 w-9 rounded-lg bg-gradient-to-br from-gold-300 to-gold-500 text-navy-950 font-bold text-sm shadow-inner">PL</span>
      <span className="leading-tight">
        <span className="block text-[15px] font-bold tracking-[0.12em] text-white">PHILONG</span>
        <span className="block text-[10px] font-medium tracking-[0.32em] text-gold-300">BUILDING</span>
      </span>
    </Link>
  )
}

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

  // close menus on navigation, outside click and Escape
  useEffect(() => { setOpen(null); setMobile(false); setUserMenu(false) }, [here])
  useEffect(() => {
    const click = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) { setOpen(null); setUserMenu(false) } }
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
    <header ref={ref} className="sticky top-0 z-40 bg-navy-900/95 backdrop-blur supports-[backdrop-filter]:bg-navy-900/90 border-b border-white/5 shadow-[0_1px_0_rgba(207,165,72,.25)]">
      <div className="mx-auto max-w-[1440px] h-16 px-4 lg:px-6 flex items-center gap-6">
        <Logo />

        {/* desktop menu */}
        <nav className="hidden lg:flex items-center gap-0.5 flex-1 min-w-0" aria-label="Menu chính">
          <Link href="/" className={`relative flex items-center gap-2 h-16 px-2.5 text-[13px] font-medium whitespace-nowrap transition-colors ${pathname === '/' ? 'text-white' : 'text-navy-200 hover:text-white'}`}>
            <LayoutDashboard className="hidden 2xl:block h-4 w-4" /> Tổng quan
            {pathname === '/' && <span className="absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-gold-400" />}
          </Link>
          {groups.map((g) => {
            const Icon = ICONS[g.group] ?? ClipboardList
            const active = groupActive(g)
            return (
              <div key={g.group} className="relative" onMouseEnter={() => setOpen(g.group)} onMouseLeave={() => setOpen((o) => (o === g.group ? null : o))}>
                <button type="button" aria-expanded={open === g.group} onClick={() => setOpen(open === g.group ? null : g.group)}
                  className={`relative flex items-center gap-1.5 h-16 px-2.5 text-[13px] font-medium whitespace-nowrap transition-colors ${active || open === g.group ? 'text-white' : 'text-navy-200 hover:text-white'}`}>
                  <Icon className="hidden 2xl:block h-4 w-4" /> {g.group}
                  <ChevronDown className={`h-3.5 w-3.5 opacity-60 transition-transform ${open === g.group ? 'rotate-180' : ''}`} />
                  {active && <span className="absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-gold-400" />}
                </button>
                {open === g.group && (
                  <div className="absolute left-0 top-full pt-2 min-w-[250px]">
                    <div className="rounded-xl bg-white shadow-pop ring-1 ring-navy-900/5 p-1.5">
                      <div className="px-3 pt-2 pb-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-gold-600">{g.group}</div>
                      {g.items.map((i) => (
                        <Link key={i.href} href={i.href}
                          className={`flex items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${isActive(i.href) ? 'bg-navy-50 text-navy-900 font-semibold' : 'text-ink-soft hover:bg-navy-50 hover:text-navy-900'}`}>
                          {i.label}
                          {isActive(i.href) && <span className="h-1.5 w-1.5 rounded-full bg-gold-400" />}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </nav>

        {/* user */}
        <div className="ml-auto relative flex items-center gap-2 shrink-0">
          <button type="button" onClick={() => setUserMenu(!userMenu)} aria-expanded={userMenu}
            className="flex items-center gap-2.5 rounded-full pl-1 pr-2 py-1 hover:bg-white/5 transition-colors">
            <span className="grid place-items-center h-8 w-8 rounded-full bg-gold-400/15 text-gold-300 ring-1 ring-gold-400/40 text-xs font-bold">{initials || 'U'}</span>
            <span className="hidden 2xl:block text-left leading-tight">
              <span className="block text-[13px] font-medium text-white max-w-[160px] truncate">{name}</span>
              <span className="block text-[11px] text-navy-300">{role}</span>
            </span>
            <ChevronDown className="hidden 2xl:block h-3.5 w-3.5 text-navy-300" />
          </button>
          {userMenu && (
            <div className="absolute right-0 top-full mt-2 w-60 rounded-xl bg-white shadow-pop ring-1 ring-navy-900/5 p-1.5">
              <div className="px-3 py-2.5 border-b border-navy-50 mb-1">
                <div className="text-sm font-semibold text-ink truncate">{name}</div>
                <div className="text-xs text-ink-mute">{role}</div>
              </div>
              <button onClick={logout} className="w-full flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50">
                <LogOut className="h-4 w-4" /> Đăng xuất
              </button>
            </div>
          )}
          <button type="button" className="lg:hidden grid place-items-center h-10 w-10 rounded-lg text-white hover:bg-white/10" onClick={() => setMobile(true)} aria-label="Mở menu">
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* mobile drawer */}
      {mobile && (<Portal>
        <div className="lg:hidden fixed inset-0 z-50" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-navy-950/60 backdrop-blur-sm" onClick={() => setMobile(false)} />
          <div className="absolute right-0 top-0 h-full w-[86%] max-w-sm bg-navy-900 text-white overflow-y-auto">
            <div className="h-16 px-4 flex items-center justify-between border-b border-white/10">
              <Logo />
              <button onClick={() => setMobile(false)} className="grid place-items-center h-10 w-10 rounded-lg hover:bg-white/10" aria-label="Đóng menu"><X className="h-5 w-5" /></button>
            </div>
            <nav className="p-3 space-y-1">
              <Link href="/" className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm ${pathname === '/' ? 'bg-white/10 text-white' : 'text-navy-100'}`}>
                <LayoutDashboard className="h-4 w-4 text-gold-300" /> Tổng quan
              </Link>
              {groups.map((g) => {
                const Icon = ICONS[g.group] ?? ClipboardList
                const expanded = open === g.group || (open === null && groupActive(g))
                return (
                  <div key={g.group}>
                    <button onClick={() => setOpen(expanded ? '' : g.group)} className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-navy-100 hover:bg-white/5">
                      <Icon className="h-4 w-4 text-gold-300" /> <span className="flex-1 text-left">{g.group}</span>
                      <ChevronDown className={`h-4 w-4 transition-transform ${expanded ? 'rotate-180' : ''}`} />
                    </button>
                    {expanded && (
                      <div className="ml-6 border-l border-white/10 pl-3 py-1">
                        {g.items.map((i) => (
                          <Link key={i.href} href={i.href} className={`block rounded-md px-3 py-2 text-sm ${isActive(i.href) ? 'text-gold-300 font-semibold' : 'text-navy-200 hover:text-white'}`}>{i.label}</Link>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </nav>
          </div>
        </div>
      </Portal>)}
    </header>
  )
}
