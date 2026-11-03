'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import { supabaseBrowser } from '@/lib/supabase/browser'

export interface NavItem { href: string; label: string; icon: string; group: string }

export default function Sidebar({ items, name, role }: { items: NavItem[]; name: string; role: string }) {
  const pathname = usePathname()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const groups = Array.from(new Set(items.map((i) => i.group)))

  async function logout() {
    await supabaseBrowser().auth.signOut()
    router.replace('/login')
    router.refresh()
  }

  return (
    <>
      <div className="md:hidden flex items-center justify-between bg-blue-700 text-white px-4 py-3">
        <span className="font-bold">Phi Long Building</span>
        <button onClick={() => setOpen(!open)} aria-label="Menu" className="text-2xl leading-none">☰</button>
      </div>
      <aside className={`${open ? 'block' : 'hidden'} md:block w-full md:w-64 md:min-h-screen bg-blue-800 text-white shrink-0`}>
        <div className="hidden md:block px-5 py-5 text-xl font-bold">Phi Long Building</div>
        <nav className="px-3 pb-4 space-y-4">
          <Link href="/" onClick={() => setOpen(false)}
            className={`block px-3 py-2 rounded ${pathname === '/' ? 'bg-blue-600' : 'hover:bg-blue-700'}`}>📊 Tổng quan</Link>
          {groups.map((g) => (
            <div key={g}>
              <div className="px-3 text-xs uppercase tracking-wide text-blue-300 mb-1">{g}</div>
              {items.filter((i) => i.group === g).map((i) => (
                <Link key={i.href} href={i.href} onClick={() => setOpen(false)}
                  className={`block px-3 py-2 rounded ${pathname === i.href ? 'bg-blue-600' : 'hover:bg-blue-700'}`}>
                  {i.icon} {i.label}
                </Link>
              ))}
            </div>
          ))}
        </nav>
        <div className="px-5 py-4 border-t border-blue-700 text-sm">
          <div className="font-medium truncate">{name}</div>
          <div className="text-blue-300 mb-2">{role}</div>
          <button onClick={logout} className="underline hover:text-blue-200">Đăng xuất</button>
        </div>
      </aside>
    </>
  )
}
