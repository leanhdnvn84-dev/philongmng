'use client'
import { useEffect, useState } from 'react'
import { History, ChevronDown } from 'lucide-react'
import type { Field } from '@/lib/resources'

/** "Lịch sử thay đổi" in a record's view popup: who created / edited / approved it and what changed. Loaded only when opened. */
type Item = { id: string; at: string; by: string; action: string; changes: any }
const ACTION: Record<string, string> = {
  create: 'Tạo mới', update: 'Sửa', delete: 'Xóa', approve: 'Duyệt', reject: 'Từ chối', progress: 'Ghi nhận tiến độ', cancel: 'Hủy', checkout: 'Check-out',
  transfer: 'Chuyển', recover: 'Thu hồi', split: 'Tách máy', in_phieu: 'In phiếu', restore: 'Khôi phục từ thùng rác', attach: 'Đính kèm tệp', detach: 'Gỡ tệp', password_reset: 'Đặt lại mật khẩu', stock_in: 'Nhập kho', stock_out: 'Xuất kho', adjust: 'Điều chỉnh tồn',
}
const when = (iso: string) => new Intl.DateTimeFormat('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh', day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(iso))
const SKIP = new Set(['id', 'extra', 'created_at', 'updated_at'])
const show = (v: unknown) => { if (v === null || v === undefined || v === '') return '(trống)'; const t = typeof v === 'object' ? JSON.stringify(v) : String(v); return t.length > 90 ? t.slice(0, 89) + '…' : t }

export default function RecordHistory({ resource, id, fields }: { resource: string; id: string; fields: Field[] }) {
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState<Item[] | null>(null)
  const [error, setError] = useState('')
  useEffect(() => { setOpen(false); setItems(null); setError('') }, [resource, id])
  useEffect(() => {
    if (!open || items) return
    let dead = false
    fetch(`/api/lich_su?bang=${encodeURIComponent(resource)}&id=${encodeURIComponent(id)}`).then((r) => r.json())
      .then((j) => { if (!dead) { if (j?.success) setItems(j.data); else setError(j?.error || 'Không tải được') } }).catch(() => !dead && setError('Mất kết nối'))
    return () => { dead = true }
  }, [open, items, resource, id])
  const label = (k: string) => fields.find((f) => f.name === k)?.label ?? k

  /** rows "field: before → after" for an edit; the stored values for anything else */
  const detail = (it: Item): [string, string][] => {
    const c = it.changes
    if (!c || typeof c !== 'object') return []
    if (c.after && typeof c.after === 'object') {
      const before = (c.before ?? {}) as Record<string, unknown>
      return Object.entries(c.after as Record<string, unknown>).filter(([k, v]) => !SKIP.has(k) && String(v ?? '') !== String(before[k] ?? '')).map(([k, v]) => [label(k), `${show(before[k])} → ${show(v)}`])
    }
    if (it.action === 'create') return []
    return Object.entries(c as Record<string, unknown>).filter(([k, v]) => !SKIP.has(k) && typeof v !== 'object' && v !== null && v !== '').slice(0, 6).map(([k, v]) => [label(k), show(v)])
  }

  return (
    <div className="mt-5 overflow-hidden rounded-xl border border-navy-200 print:hidden">
      <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} className="flex w-full items-center gap-2 bg-navy-50 px-3 py-2.5 text-left text-[13.5px] font-extrabold text-navy-900 hover:bg-navy-100">
        <History className="h-4 w-4 text-navy-500" />Lịch sử thay đổi{items ? ` (${items.length})` : ''}
        <ChevronDown className={`ml-auto h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="max-h-[320px] overflow-y-auto">
          {error && <p className="px-3 py-3 text-[13px] font-semibold text-red-700">{error}</p>}
          {!items && !error && <p className="px-3 py-4 text-center text-[13px] text-ink-mute">Đang tải…</p>}
          {items && !items.length && <p className="px-3 py-4 text-center text-[13px] text-ink-mute">Chưa ghi nhận thay đổi nào (dữ liệu nhập từ hệ thống cũ không có lịch sử).</p>}
          {items?.map((it) => {
            const d = detail(it)
            return (
              <div key={it.id} className="border-t border-navy-100 px-3 py-2 first:border-0">
                <div className="flex flex-wrap items-baseline gap-x-2 text-[13px]">
                  <span className="font-extrabold text-navy-900">{ACTION[it.action] ?? it.action}</span>
                  <span className="text-ink-soft">{it.by}</span>
                  <span className="ml-auto tabular-nums text-[12px] text-ink-mute">{when(it.at)}</span>
                </div>
                {d.length > 0 && <ul className="mt-1 space-y-0.5">{d.map(([k, v], i) => <li key={i} className="break-words text-[12.5px] text-ink-soft"><b className="font-semibold text-navy-800">{k}:</b> {v}</li>)}</ul>}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
