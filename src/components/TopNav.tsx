'use client'

import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { ArrowLeftRight, ArrowUp, BadgeCheck, BarChart3, Boxes, Building2, CalendarClock, CalendarDays, ChevronDown, ClipboardCheck, Contact, Database, FileText, FolderOpen, Hammer, HardHat, KeyRound, Layers, LayoutGrid, ListChecks, Lock, LogIn, LogOut, Mail, MailCheck, MapPin, Menu, MessageCircle, Monitor, MonitorSmartphone, Printer, RefreshCw, Repeat, Search, ShieldAlert, ShoppingCart, Tags, Trash2, Truck, Undo2, User, UserPlus, Users, Warehouse, Wrench, X, Zap, type LucideIcon } from 'lucide-react'
import { supabaseBrowser } from '@/lib/supabase/browser'
import GlobalSearch from '@/components/GlobalSearch'
import NotificationBell from '@/components/NotificationBell'
import { ExternalLink, Link2 } from 'lucide-react'

/** other Phi Long sites (V191 "Liên kết"): opened in a new tab */
const LINKS = [
  { label: 'Quản lý thiết bị công ty', sub: 'kythuat.philong.cloud', href: 'https://kythuat.philong.cloud/' },
  { label: 'Hành Chính - Nhân Sự', sub: 'hcns.philong.cloud', href: 'https://hcns.philong.cloud/' },
  { label: 'Web Phi Long', sub: 'philong.com.vn', href: 'https://philong.com.vn/' },
]
import Portal from '@/components/Portal'
import Logo from '@/components/Logo'
import ChatPanel from '@/components/ChatPanel'
import { useDockSide } from '@/lib/dock'

export interface NavGroup { group: string; items: { label: string; href: string }[] }

const ICONS: Record<string, string> = {
  'Công việc': '🗂️', 'Bảo trì': '🔧', 'Đề xuất': '📝', 'Thiết bị & kho': '📦', 'Cho thuê': '🏠', 'Danh mục': '📁', 'Hệ thống': '🔒',
}

// icon + one-line hint for each menu entry (shown in the dropdown cards)
const META: Record<string, [LucideIcon, string]> = {
  'Công việc': [ClipboardCheck, 'Giao việc, theo dõi hạn'], 'Công việc hằng ngày': [CalendarClock, 'Việc lặp lại mỗi ngày'], 'Khách ra/vào': [Users, 'Đăng ký và theo dõi khách'],
  'Báo cáo tiến độ': [BarChart3, 'Tiến độ theo giai đoạn'], 'Báo cáo công việc': [FileText, 'Thống kê theo nhân sự'],
  'Nhật ký bảo trì': [Wrench, 'Việc đã bảo trì'], 'Kế hoạch bảo trì': [CalendarDays, 'Lịch và chu kỳ sắp tới'],
  'Đề xuất mua vật tư': [ShoppingCart, 'Phiếu mua vật tư'], 'Đề xuất mua thiết bị': [MonitorSmartphone, 'Phiếu mua thiết bị'], 'Đề xuất bảo trì': [Hammer, 'Phiếu sửa chữa, bảo trì'],
  'Đề xuất thanh lý': [Trash2, 'Phiếu thanh lý thiết bị'], 'Lịch sử in phiếu': [Printer, 'Các lần in phiếu đề xuất'], 'Lịch tổng': [CalendarDays, 'Hạn việc, bảo trì, khách hẹn, hợp đồng'], 'Thùng rác': [Trash2, 'Khôi phục bản ghi đã xóa trong 30 ngày'],
  'Kho vật tư': [Boxes, 'Tồn kho và cảnh báo'], 'Lịch sử nhập xuất': [ArrowLeftRight, 'Phiếu nhập, xuất kho'], 'Thiết bị đang dùng': [Monitor, 'Thiết bị đã bàn giao'],
  'Kho thiết bị': [Warehouse, 'Thiết bị trong kho'], 'Tất cả thiết bị': [LayoutGrid, 'Toàn bộ thiết bị'], 'Thu hồi / thanh lý': [Undo2, 'Thu hồi và thanh lý'], 'Lịch sử chuyển': [Repeat, 'Chuyển khu vực, người dùng'],
  'Toà nhà': [Building2, 'Thông tin toà nhà'], 'Tầng / khu cho thuê': [Layers, 'Diện tích và tình trạng'], 'Khách đang thuê': [KeyRound, 'Hợp đồng đang hiệu lực'], 'Khách hàng tiềm năng': [UserPlus, 'Khách quan tâm thuê'], 'Tiền điện': [Zap, 'Chốt điện theo kỳ'],
  'Đội PCCC': [ShieldAlert, 'Nhân sự phòng cháy'], 'Danh bạ nhân viên': [Contact, 'Thông tin nhân viên'], 'Danh bạ nhà thầu': [HardHat, 'Nhà thầu thi công'], 'Danh bạ nhà cung cấp': [Truck, 'Nhà cung cấp'],
  'Chu kỳ bảo trì': [RefreshCw, 'Hạng mục và chu kỳ'], 'Khu vực tòa nhà': [MapPin, 'Danh sách khu vực'], 'Chi tiết vận hành': [ListChecks, 'Nội dung kiểm tra'], 'Danh mục giá trị': [Tags, 'Trạng thái, mức độ, loại'],
  'Người dùng': [User, 'Tài khoản đăng nhập'], 'Vai trò': [BadgeCheck, 'Nhóm quyền'], 'Phân quyền': [Lock, 'Quyền theo module'], 'Lịch sử đăng nhập': [LogIn, 'Ai đăng nhập, khi nào'],
  'Cấu hình email cảnh báo': [Mail, 'Bật tắt, giờ gửi, người nhận'], 'Nhật ký email cảnh báo': [MailCheck, 'Email đã gửi'], 'Kiểm tra & sao lưu': [Database, 'Kiểm tra và sao lưu dữ liệu'],
}

// icon tile colours, cycled per entry so every dropdown reads at a glance
const TILE = [
  'bg-blue-50 text-blue-600', 'bg-emerald-50 text-emerald-600', 'bg-amber-50 text-amber-600', 'bg-violet-50 text-violet-600',
  'bg-rose-50 text-rose-600', 'bg-sky-50 text-sky-600', 'bg-teal-50 text-teal-600', 'bg-orange-50 text-orange-600',
]

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
    <div className="hidden min-[1760px]:flex items-center gap-2 h-11 pl-1.5 pr-3 rounded-[9px] bg-white shadow-[0_2px_6px_rgba(0,0,0,.12)]">
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

// Menu style B: navy bar, buttons sit in a dark tray, the open/active one is a red pill
/** Short two-tone chime for a new message (silently skipped when the browser blocks audio before the first click). */
function ping() {
  try {
    const AC = window.AudioContext || (window as any).webkitAudioContext
    if (!AC) return
    const ctx = new AC(), now = ctx.currentTime
    for (const [f, at] of [[880, 0], [1175, 0.14]] as const) {
      const o = ctx.createOscillator(), g = ctx.createGain()
      o.type = 'sine'; o.frequency.value = f; o.connect(g); g.connect(ctx.destination)
      g.gain.setValueAtTime(0.0001, now + at); g.gain.exponentialRampToValueAtTime(0.18, now + at + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, now + at + 0.22)
      o.start(now + at); o.stop(now + at + 0.25)
    }
    setTimeout(() => ctx.close().catch(() => {}), 800)
  } catch { /* no audio */ }
}

const navBtn = (on: boolean) =>
  `flex items-center gap-1 h-9 px-2.5 min-[1440px]:px-3 2xl:px-3.5 rounded-[10px] text-[12.5px] 2xl:text-[13px] font-semibold whitespace-nowrap transition active:translate-y-px ${
    on ? 'bg-white text-[#b4121f] font-extrabold shadow-[0_3px_0_#6e0a12]' : 'text-white hover:bg-white/15'}`

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
  const [toast, setToast] = useState<{ id: string; from: string; group: boolean; text: string } | null>(null)
  const seen = useRef<string | null | undefined>(undefined) // id of the newest unread message already announced
  const chatOpenRef = useRef(false)
  useEffect(() => { chatOpenRef.current = chatOpen; if (chatOpen) setToast(null) }, [chatOpen])
  const [dock, setDock] = useDockSide()
  useEffect(() => {
    let dead = false
    const tick = () => {
      fetch('/api/chat/unread', { cache: 'no-store' }).then((r) => r.json()).then((j) => {
        if (dead || !j.success) return
        setUnread(j.unread)
        const id: string | null = j.last?.id ?? null
        // announce only messages that arrive after the page was opened, and never while the chat is open
        if (seen.current !== undefined && id && id !== seen.current && !chatOpenRef.current) { setToast({ id, from: j.last.from, group: j.last.group, text: j.last.text }); ping() }
        seen.current = id
      }).catch(() => {})
    }
    tick(); const t = setInterval(tick, 10000)
    return () => { dead = true; clearInterval(t) }
  }, [pathname, chatOpen])
  // unread count in the browser tab title
  useEffect(() => { const base = document.title.replace(/^\(\d+\+?\)\s*/, ''); document.title = unread > 0 ? `(${unread > 99 ? '99+' : unread}) ${base}` : base }, [unread, pathname])
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
    <header ref={ref} className="print:hidden sticky top-0 z-40 bg-[#d91828] shadow-[0_5px_0_#8f0f1b,0_14px_26px_rgba(143,15,27,.28)]">
      {/* phone: red bar with logo + page search (menu and filters live in the floating buttons) */}
      <div className="lg:hidden flex items-center gap-3 px-3 py-2">
        <Link href="/" className="shrink-0" aria-label="Trang tổng quan"><Logo variant="white" height={40} /></Link>
        <label className="relative flex-1 min-w-0">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-mute" />
          <input type="search" value={pageSearch} onChange={(e) => onPageSearch(e.target.value)} placeholder="Tìm trang này…" aria-label="Tìm trang này"
            className="h-11 w-full rounded-full border border-white/30 bg-white/95 pl-9 pr-3 text-[16px] shadow-[0_2px_8px_rgba(0,0,0,.2)] outline-none focus:ring-2 focus:ring-white/70" />
        </label>
        <NotificationBell className="shrink-0" />
      </div>
      <div className="hidden lg:flex h-[62px] px-4 lg:px-5 items-center gap-3 min-[1880px]:gap-5">
        <Brand />

        <nav className="hidden lg:flex items-center gap-0.5 rounded-[14px] bg-[#6e0a12]/55 p-1 min-w-0 shadow-[inset_0_2px_4px_rgba(0,0,0,.28)]" aria-label="Menu chính">
          <Link href="/" className={navBtn(pathname === '/' && !open)}>Tổng quan</Link>
          {groups.map((g, gi) => (
            <div key={g.group} className="relative" onMouseEnter={() => setOpen(g.group)} onMouseLeave={() => setOpen((o) => (o === g.group ? null : o))}>
              <button type="button" aria-expanded={open === g.group} onClick={() => setOpen(open === g.group ? null : g.group)}
                className={navBtn(open === g.group || (!open && groupActive(g)))}>
                {g.group} <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open === g.group ? 'rotate-180' : ''}`} />
              </button>
              {open === g.group && (
                <div className={`absolute top-full pt-3 ${gi >= groups.length - 3 ? 'right-0' : 'left-0'}`}>
                  <div className="max-h-[calc(100dvh-84px)] w-[320px] space-y-0.5 overflow-y-auto rounded-2xl border border-navy-200 bg-white p-2 shadow-[0_18px_40px_rgba(11,31,69,.2)]">
                    {g.items.map((i, idx) => {
                      const [Icon, sub] = META[i.label] ?? [FolderOpen, '']
                      const on = isActive(i.href)
                      return (
                        <Link key={i.href} href={i.href} className={`flex items-center gap-3 rounded-xl px-2.5 py-2 transition-colors ${on ? 'bg-brand-50' : 'hover:bg-navy-50'}`}>
                          <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-[10px] ${on ? 'bg-[#fde7e9] text-[#c4121f]' : TILE[idx % TILE.length]}`}><Icon className="h-[18px] w-[18px]" strokeWidth={1.9} /></span>
                          <span className="min-w-0 flex-1">
                            <span className={`block truncate text-[14px] font-semibold ${on ? 'text-[#c4121f]' : 'text-navy-900'}`}>{i.label}</span>
                            {sub && <span className="block truncate text-[12px] text-ink-soft">{sub}</span>}
                          </span>
                        </Link>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          ))}
        </nav>

        <div className="ml-auto relative flex items-center gap-3 shrink-0">
          <div className="relative hidden lg:block" onMouseEnter={() => setOpen('__links')} onMouseLeave={() => setOpen((o) => (o === '__links' ? null : o))}>
            <button type="button" aria-expanded={open === '__links'} aria-label="Liên kết" title="Liên kết" onClick={() => setOpen(open === '__links' ? null : '__links')}
              className="inline-flex h-[38px] items-center gap-1.5 rounded-full bg-[#0b1b40] px-3 text-[12.5px] font-extrabold text-white shadow-[0_4px_12px_rgba(0,0,0,.16)] transition hover:bg-[#12285a]">
              <Link2 className="h-4 w-4" /><span className="hidden min-[1880px]:inline">Liên kết</span><ChevronDown className={`h-3.5 w-3.5 transition-transform ${open === '__links' ? 'rotate-180' : ''}`} />
            </button>
            {open === '__links' && (
              <div className="absolute right-0 top-full z-50 pt-3">
                <div className="w-[290px] space-y-0.5 rounded-2xl border border-navy-200 bg-white p-2 shadow-[0_18px_40px_rgba(11,31,69,.2)]">
                  {LINKS.map((l, idx) => (
                    <a key={l.href} href={l.href} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 rounded-xl px-2.5 py-2 transition-colors hover:bg-navy-50">
                      <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-[10px] ${TILE[idx % TILE.length]}`}><ExternalLink className="h-[18px] w-[18px]" strokeWidth={1.9} /></span>
                      <span className="min-w-0 flex-1"><span className="block truncate text-[14px] font-semibold text-navy-900">{l.label}</span><span className="block truncate text-[12px] text-ink-soft">{l.sub}</span></span>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
          <GlobalSearch />
          <TodayTile />
          <NotificationBell className="hidden lg:block" />
          <button type="button" onClick={() => setChatOpen((o) => !o)} aria-label="Trao đổi nội bộ" title="Trao đổi nội bộ" aria-expanded={chatOpen} className="relative hidden lg:grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20">
            <MessageCircle className="h-5 w-5" />
            {unread > 0 && <span className="absolute -right-1 -top-1 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-[#e11d2e] px-1 text-[10px] font-black text-white">{unread > 99 ? '99+' : unread}</span>}
          </button>
          <button type="button" onClick={() => setUserMenu(!userMenu)} aria-expanded={userMenu} className="flex items-center gap-2 text-left text-white">
            <span className="grid place-items-center h-10 w-10 rounded-full bg-white text-navy-900 text-[12px] font-black shadow-[0_0_0_3px_rgba(255,255,255,.25)]">{initials || 'U'}</span>
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
              <Link href="/tai-khoan" onClick={() => setUserMenu(false)} className="w-full flex items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold text-navy-900 hover:bg-navy-50">
                <KeyRound className="h-4 w-4" /> Tài khoản &amp; đổi mật khẩu
              </Link>
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
            className={`fixed ${dock === 'left' ? 'left-4' : 'right-4'} bottom-4 z-30 grid h-14 w-14 place-items-center rounded-full bg-gradient-to-b from-[#17386b] to-[#0b1f45] text-white shadow-[0_6px_18px_rgba(11,31,69,.5)] active:scale-95`}>
            <Menu className="h-6 w-6" />
          </button>
          {showTop && (
            <button type="button" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} aria-label="Lên đầu trang"
              className={`fixed ${dock === 'left' ? 'right-4' : 'left-4'} bottom-4 z-30 grid h-14 w-14 place-items-center rounded-full border border-navy-200 bg-white text-navy-900 shadow-[0_6px_18px_rgba(16,24,40,.2)] active:scale-95`}>
              <ArrowUp className="h-6 w-6" />
            </button>
          )}
        </div>
      </Portal>

      {/* always-on chat bubble + "new message" popup */}
      <Portal>
        <div className="print:hidden">
          {!chatOpen && (
            <button type="button" onClick={() => setChatOpen(true)} aria-label={unread > 0 ? `Trao đổi nội bộ, ${unread} tin nhắn chưa đọc` : 'Trao đổi nội bộ'} title="Trao đổi nội bộ"
              className={`fixed z-[55] grid h-14 w-14 lg:h-11 lg:w-11 place-items-center rounded-full bg-[#e11d2e] text-white shadow-[0_5px_0_#9f1220,0_14px_24px_rgba(159,18,32,.35)] transition duration-100 hover:-translate-y-0.5 active:translate-y-1 active:shadow-[0_1px_0_#9f1220] bottom-[84px] lg:bottom-[104px] ${dock === 'left' ? 'left-4 lg:left-auto' : 'right-4'} lg:right-1 ${unread > 0 ? 'pl-chat-fast' : 'pl-chat'}`}>
              <MessageCircle className="h-6 w-6" />
              {unread > 0 && <span className="absolute -right-1 -top-1 grid h-6 min-w-6 place-items-center rounded-full bg-[#0b1b40] px-1 text-[12px] font-black text-white ring-2 ring-white">{unread > 99 ? '99+' : unread}</span>}
            </button>
          )}
          {toast && !chatOpen && (
            <div role="alert" aria-live="assertive" className={`pl-sheet fixed z-[56] w-[min(340px,calc(100vw-2rem))] rounded-[18px] bg-white p-3.5 shadow-[0_6px_0_#c5cfe3,0_18px_34px_rgba(11,27,64,.28)] bottom-[152px] lg:bottom-[164px] ${dock === 'left' ? 'left-4 lg:left-auto' : 'right-4'} lg:right-5`}>
              <div className="flex items-start gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[12px] bg-[#e11d2e] text-white shadow-[0_3px_0_#8f0f1b]"><MessageCircle className="h-5 w-5" /></span>
                <div className="min-w-0 flex-1">
                  <div className="text-[13.5px] font-extrabold text-navy-900">Bạn có tin nhắn mới</div>
                  <div className="truncate text-[12.5px] font-bold text-ink-soft">{toast.from}{toast.group ? ' · Nhóm chung' : ''}</div>
                  <div className="mt-0.5 line-clamp-2 break-words text-[13px] text-ink">{toast.text}</div>
                </div>
                <button type="button" onClick={() => setToast(null)} aria-label="Đóng thông báo" className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-ink-mute hover:bg-navy-100"><X className="h-4 w-4" /></button>
              </div>
              <button type="button" onClick={() => { setToast(null); setChatOpen(true) }} className="btn-primary mt-3 h-10 w-full">Xem tin nhắn</button>
            </div>
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
              <div className="border-t border-navy-100">
                <div className="flex items-center gap-3 px-3 pt-3.5 text-[16px] font-extrabold uppercase text-navy-900"><span className="w-7 text-center text-[22px]">🔗</span>Liên kết</div>
                <div className="mb-2 ml-6 mt-1 border-l-2 border-blue-200 pl-2">
                  {LINKS.map((l) => <a key={l.href} href={l.href} target="_blank" rel="noopener noreferrer" className="block rounded-lg px-3 py-3 text-[15px] font-semibold text-ink-soft active:bg-navy-50">{l.label} ↗</a>)}
                </div>
              </div>
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
                <Link href="/tai-khoan" className="btn-secondary mb-2 w-full h-12 text-[15px]"><KeyRound className="h-4 w-4" />Tài khoản &amp; đổi mật khẩu</Link>
                <button onClick={logout} className="btn-danger w-full h-12 text-[15px]"><LogOut className="h-4 w-4" />Đăng xuất</button>
              </div>
            </nav>
          </div>
        </div>
      </Portal>)}
    </header>
  )
}
