'use client'
import { useCallback, useEffect, useState } from 'react'
import { Loader2, RotateCcw, Trash2, RotateCw } from 'lucide-react'
import { useConfirm } from '@/components/ConfirmDialog'

type Item = { id: string; at: string; by: string | null; table: string; module: string; record: string; summary: string; children: number; state: 'deleted' | 'restored' }
const when = (iso: string) => new Intl.DateTimeFormat('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh', day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(iso))
const left = (iso: string, days: number) => Math.max(0, Math.ceil((Date.parse(iso) + days * 86400_000 - Date.now()) / 86400_000))

export default function RecycleBin() {
  const [items, setItems] = useState<Item[] | null>(null)
  const [days, setDays] = useState(30)
  const [busy, setBusy] = useState('')
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)
  const [mod, setMod] = useState('')
  const [confirm, dialog] = useConfirm()
  const load = useCallback(() => {
    fetch('/api/he_thong/thung_rac').then((r) => r.json()).then((j) => { if (j?.success) { setItems(j.data); setDays(j.days) } else setMsg({ ok: false, text: j?.error || 'Không tải được' }) }).catch(() => setMsg({ ok: false, text: 'Mất kết nối' }))
  }, [])
  useEffect(() => { load() }, [load])
  async function restore(it: Item) {
    if (!(await confirm(`Khôi phục ${it.module} ${it.record}?${it.children ? `\n\nKèm ${it.children} dòng liên quan đã bị xóa cùng.` : ''}`, { title: 'Khôi phục', okLabel: 'Khôi phục' }))) return
    setBusy(it.id); setMsg(null)
    const j = await fetch('/api/he_thong/thung_rac', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: it.id }) }).then((r) => r.json()).catch(() => null)
    setMsg(j?.success ? { ok: true, text: j.data.message } : { ok: false, text: j?.error || 'Không khôi phục được' })
    setBusy(''); if (j?.success) load()
  }
  const mods = Array.from(new Set((items ?? []).map((i) => i.module))).sort((a, b) => a.localeCompare(b, 'vi'))
  const list = (items ?? []).filter((i) => !mod || i.module === mod)
  return (
    <div className="flex flex-1 flex-col lg:min-h-0">
      {dialog}
      <div className="flex shrink-0 flex-wrap items-baseline gap-x-5 gap-y-1 border-b border-navy-200 bg-white px-4 py-2 lg:px-5">
        <span className="text-[12.5px] text-ink-mute">PHI LONG / <b className="text-navy-800">Thùng rác</b></span>
        <h1 className="text-[22px] font-black text-navy-900">Thùng rác</h1>
        <span className="text-[13px] text-ink-mute">Bản ghi đã xóa trong {days} ngày gần nhất; quá hạn thì không khôi phục được.</span>
      </div>
      <div className="flex flex-col gap-3 px-4 py-3 lg:min-h-0 lg:flex-1 lg:px-5">
        <div className="flex flex-wrap items-center gap-2">
          <select className="input h-10 w-auto" value={mod} onChange={(e) => setMod(e.target.value)} aria-label="Lọc theo mục"><option value="">Tất cả mục ({items?.length ?? 0})</option>{mods.map((m) => <option key={m}>{m}</option>)}</select>
          <button className="btn-secondary h-10" onClick={load}><RotateCw className="h-4 w-4" />Làm mới</button>
        </div>
        {msg && <p role="status" className={`rounded-[9px] border px-3 py-2 text-[13.5px] font-semibold ${msg.ok ? 'border-green-200 bg-green-50 text-green-800' : 'border-red-200 bg-red-50 text-red-800'}`}>{msg.text}</p>}
        <div className="card overflow-hidden lg:min-h-0 lg:flex-1 lg:overflow-y-auto">
          {!items && <p className="p-8 text-center text-ink-mute"><Loader2 className="mr-2 inline h-4 w-4 animate-spin" />Đang tải…</p>}
          {items && !list.length && <p className="p-10 text-center text-ink-mute"><Trash2 className="mx-auto mb-2 h-8 w-8 text-navy-300" />Thùng rác trống.</p>}
          {list.map((it) => (
            <div key={it.id} className="flex flex-wrap items-center gap-x-4 gap-y-1 border-b border-navy-100 px-4 py-3 last:border-0">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-baseline gap-x-2"><span className="rounded-md bg-navy-100 px-2 py-0.5 text-[12px] font-bold text-navy-800">{it.module}</span><b className="text-[14px] text-navy-900">{it.record}</b>
                  {it.children > 0 && <span className="text-[12px] text-ink-mute">+{it.children} dòng liên quan</span>}</div>
                <div className="mt-0.5 truncate text-[13px] text-ink-soft">{it.summary || '—'}</div>
                <div className="text-[12px] text-ink-mute">Xóa lúc {when(it.at)}{it.by ? ` bởi ${it.by}` : ''}{it.state === 'deleted' ? ` · còn ${left(it.at, days)} ngày` : ''}</div>
              </div>
              {it.state === 'restored' ? <span className="pill-green">Đã khôi phục</span>
                : <button className="btn-secondary" disabled={!!busy} onClick={() => restore(it)}>{busy === it.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <RotateCcw className="h-4 w-4" />}Khôi phục</button>}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
