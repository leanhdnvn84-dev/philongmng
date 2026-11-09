'use client'
// Ctrl K: one search box for the whole system (work, daily work, stock, devices, tenants, proposals).
import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Loader2, ClipboardList, Boxes, Monitor, Building2, FileSignature, ListChecks } from 'lucide-react'
import Portal from '@/components/Portal'

interface Hit { key: string; group: string; title: string; sub: string; href: string; icon: React.ComponentType<{ className?: string }> }
const SOURCES: { res: string; group: string; icon: Hit['icon']; title: (r: any) => string; sub: (r: any) => string; href: (r: any) => string }[] = [
  { res: 'cong_viec', group: 'Công việc', icon: ClipboardList, title: (r) => r.noi_dung, sub: (r) => `${r.id} · ${r.trang_thai ?? ''}`, href: (r) => `/cong_viec?q=${r.id}` },
  { res: 'cong_viec_hang_ngay', group: 'Công việc hằng ngày', icon: ListChecks, title: (r) => r.noi_dung, sub: (r) => `${r.id} · ${String(r.ngay ?? '').split('-').reverse().join('/')}`, href: (r) => `/cong_viec_hang_ngay?q=${r.id}` },
  { res: 'vat_tu', group: 'Kho vật tư', icon: Boxes, title: (r) => r.ten_vat_tu, sub: (r) => `${r.id} · tồn ${r.ton_hien_tai ?? 0} ${r.dvt ?? ''}`, href: (r) => `/vat_tu?q=${r.id}` },
  { res: 'thiet_bi', group: 'Thiết bị', icon: Monitor, title: (r) => r.ten_thiet_bi, sub: (r) => `${r.id} · ${r.trang_thai ?? 'chưa cập nhật'}`, href: (r) => `/thiet_bi?q=${r.id}` },
  { res: 'khach_thue', group: 'Khách thuê', icon: Building2, title: (r) => r.ten_khach_thue, sub: (r) => `${r.id} · ${r.trang_thai ?? ''}`, href: (r) => `/khach_thue?q=${encodeURIComponent(r.ten_khach_thue ?? '')}` },
  { res: 'de_xuat', group: 'Đề xuất', icon: FileSignature, title: (r) => r.noi_dung, sub: (r) => `${r.id} · ${r.trang_thai ?? ''}`, href: (r) => `/de_xuat?loai_de_xuat=${r.loai_de_xuat}&q=${r.id}` },
]

export default function GlobalSearch() {
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState('')
  const [hits, setHits] = useState<Hit[]>([])
  const [busy, setBusy] = useState(false)
  const [at, setAt] = useState(0)
  const input = useRef<HTMLInputElement>(null)
  const router = useRouter()

  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setOpen((o) => !o) }
      else if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', k)
    return () => window.removeEventListener('keydown', k)
  }, [])
  useEffect(() => { if (open) { setQ(''); setHits([]); setAt(0); setTimeout(() => input.current?.focus(), 30) } }, [open])
  useEffect(() => {
    const term = q.trim()
    if (term.length < 2) { setHits([]); setBusy(false); return }
    let dead = false; setBusy(true)
    const t = setTimeout(async () => {
      const all = await Promise.all(SOURCES.map(async (s) => {
        try {
          const j = await fetch(`/api/${s.res}?search=${encodeURIComponent(term)}&pageSize=5`).then((r) => r.json())
          return j.success ? (j.data as any[]).map((r): Hit => ({ key: `${s.res}:${r.id}`, group: s.group, icon: s.icon, title: String(s.title(r) ?? r.id), sub: s.sub(r), href: s.href(r) })) : []
        } catch { return [] }
      }))
      if (!dead) { setHits(all.flat()); setAt(0); setBusy(false) }
    }, 280)
    return () => { dead = true; clearTimeout(t) }
  }, [q])

  const go = (h: Hit) => { setOpen(false); router.push(h.href) }
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} title="Tìm kiếm toàn hệ thống (Ctrl K)" aria-label="Tìm kiếm toàn hệ thống"
        className="hidden lg:flex h-10 items-center gap-2 rounded-full bg-white/10 pl-3 pr-2 text-[12.5px] font-semibold text-white/90 hover:bg-white/20">
        <Search className="h-4 w-4" /><span className="hidden xl:inline">Tìm kiếm</span>
        <kbd className="rounded-md bg-white/15 px-1.5 py-0.5 text-[10.5px] font-bold">Ctrl K</kbd>
      </button>
      {open && (
        <Portal>
          <div className="fixed inset-0 z-[95] flex items-start justify-center bg-navy-950/50 p-3 pt-[12vh]" role="dialog" aria-modal="true" aria-label="Tìm kiếm toàn hệ thống" onMouseDown={(e) => e.target === e.currentTarget && setOpen(false)}>
            <div className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-pop">
              <div className="flex items-center gap-3 border-b border-navy-200 px-4">
                {busy ? <Loader2 className="h-5 w-5 animate-spin text-blue-600" /> : <Search className="h-5 w-5 text-ink-mute" />}
                <input ref={input} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Tìm công việc, vật tư, thiết bị, khách thuê, đề xuất…"
                  className="h-14 flex-1 bg-transparent text-[16px] outline-none"
                  onKeyDown={(e) => {
                    if (e.key === 'ArrowDown') { e.preventDefault(); setAt((i) => Math.min(hits.length - 1, i + 1)) }
                    else if (e.key === 'ArrowUp') { e.preventDefault(); setAt((i) => Math.max(0, i - 1)) }
                    else if (e.key === 'Enter' && hits[at]) go(hits[at])
                  }} />
                <kbd className="rounded-md border border-navy-200 bg-navy-50 px-1.5 py-0.5 text-[11px] font-bold text-ink-mute">Esc</kbd>
              </div>
              <ul className="max-h-[52vh] overflow-y-auto py-1" role="listbox">
                {q.trim().length < 2 && <li className="px-5 py-8 text-center text-sm text-ink-mute">Gõ ít nhất 2 ký tự: tên, mã (CV0080, VT171…) hoặc nội dung.</li>}
                {q.trim().length >= 2 && !busy && hits.length === 0 && <li className="px-5 py-8 text-center text-sm text-ink-mute">Không tìm thấy kết quả cho “{q.trim()}”.</li>}
                {hits.map((h, i) => {
                  const Icon = h.icon, head = i === 0 || hits[i - 1].group !== h.group
                  return (
                    <li key={h.key} role="option" aria-selected={i === at}>
                      {head && <div className="px-4 pb-1 pt-2.5 text-[11px] font-black uppercase tracking-wide text-ink-mute">{h.group}</div>}
                      <button type="button" onMouseEnter={() => setAt(i)} onClick={() => go(h)} className={`flex w-full items-center gap-3 px-4 py-2 text-left ${i === at ? 'bg-blue-50' : ''}`}>
                        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-navy-100 text-navy-800"><Icon className="h-4 w-4" /></span>
                        <span className="min-w-0 flex-1"><span className="block truncate text-[14px] font-semibold text-ink">{h.title}</span><span className="block truncate text-[12px] text-ink-mute">{h.sub}</span></span>
                      </button>
                    </li>
                  )
                })}
              </ul>
            </div>
          </div>
        </Portal>
      )}
    </>
  )
}
