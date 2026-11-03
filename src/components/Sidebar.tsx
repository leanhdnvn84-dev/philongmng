'use client'

import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { supabaseBrowser } from '@/lib/supabase/browser'

export interface SideGroup { group: string; items: { label: string; href: string }[] }

export default function Sidebar({ groups, name, role }: { groups: SideGroup[]; name: string; role: string }) {
  const pathname = usePathname()
  const search = useSearchParams()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const here = pathname + (search.toString() ? '?' + search.toString() : '')
  const isActive = (href: string) => decodeURIComponent(here) === decodeURIComponent(href)
  const activeGroup = groups.find((g) => g.items.some((i) => isActive(i.href)))?.group
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})
  useEffect(() => { if (activeGroup) setExpanded((e) => ({ ...e, [activeGroup]: true })) }, [activeGroup])

  async function logout() {
    await supabaseBrowser().auth.signOut()
    router.replace('/login')
    router.refresh()
  }

  return (
    <>
      <div className="md:hidden sticky top-0 z-40 flex items-center justify-between bg-blue-800 text-white px-4 py-3">
        <span className="font-bold">PHILONG BUILDING</span>
        <button onClick={() => setOpen(!open)} aria-label="Menu" aria-expanded={open} className="text-2xl leading-none">☰</button>
      </div>
      <aside className={`${open ? 'block' : 'hidden'} md:block w-full md:w-64 md:h-screen md:sticky md:top-0 md:overflow-y-auto bg-blue-900 text-white shrink-0`}>
        <div className="hidden md:block px-5 pt-5 pb-3 text-lg font-bold tracking-wide">PHILONG BUILDING</div>
        <nav className="px-2 pb-4 text-sm">
          <Link href="/" onClick={() => setOpen(false)}
            className={`block px-3 py-2 rounded ${pathname === '/' ? 'bg-blue-600' : 'hover:bg-blue-800'}`}>Tổng quan</Link>
          {groups.map((g) => (
            <div key={g.group} className="mt-1">
              <button onClick={() => setExpanded((e) => ({ ...e, [g.group]: !e[g.group] }))} aria-expanded={!!expanded[g.group]}
                className="w-full flex justify-between items-center px-3 py-2 text-xs uppercase tracking-wider text-blue-200 hover:text-white">
                {g.group} <span>{expanded[g.group] ? '▾' : '▸'}</span>
              </button>
              {expanded[g.group] && g.items.map((i) => (
                <Link key={i.href} href={i.href} onClick={() => setOpen(false)}
                  className={`block pl-5 pr-3 py-1.5 rounded ${isActive(i.href) ? 'bg-blue-600' : 'hover:bg-blue-800'}`}>{i.label}</Link>
              ))}
            </div>
          ))}
        </nav>
        <div className="px-5 py-4 border-t border-blue-800 text-sm">
          <div className="font-medium truncate">{name}</div>
          <div className="text-blue-300 mb-2">{role}</div>
          <button onClick={logout} className="underline hover:text-blue-200">Đăng xuất</button>
        </div>
      </aside>
    </>
  )
}
