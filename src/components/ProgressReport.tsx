'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { STAGES, formatDate } from '@/lib/resources'

interface Work {
  id: string; muc_do?: string | null; id_nguoi_thuc_hien?: string | null; noi_dung: string; ngay_giao: string | null; deadline: string | null; ngay_hoan_thanh: string | null
  trang_thai: string | null; tien_do: string | null; giai_doan_hien_tai: string | null; canh_bao: string; so_ngay_con_lai: number | null
}
interface Entry { day: string; stage: string | null; text: string; n: number | null; raw: string }

// "- 26/09 [Thi công]: nội dung"  — only explicit [tags] are counted (V191 rule)
const LINE = /^\s*-?\s*(\d{1,2}\/\d{1,2})(?:\/\d{2,4})?\s*(?:\[([^\]]+)\])?\s*:?\s*(.*)$/
function parse(text: string | null): Entry[] {
  const seen: Record<string, number> = {}
  return String(text ?? '').split('\n').filter((l) => l.trim()).map((raw) => {
    const m = LINE.exec(raw)
    if (!m) return { day: '', stage: null, text: raw.replace(/^\s*-\s*/, ''), n: null, raw }
    const stage = m[2] && STAGES.includes(m[2].trim()) ? m[2].trim() : null
    const n = stage ? (seen[stage] = (seen[stage] ?? 0) + 1) : null
    return { day: m[1], stage, text: m[3] || (m[2] && !stage ? `[${m[2]}]` : ''), n, raw }
  })
}
const COLORS: Record<string, string> = {
  'Khảo sát': 'bg-sky-100 text-sky-800', 'Báo giá': 'bg-violet-100 text-violet-800', 'Duyệt': 'bg-indigo-100 text-indigo-800',
  'Thi công': 'bg-orange-100 text-orange-800', 'Chờ': 'bg-gray-200 text-gray-800', 'Hoàn thành': 'bg-green-100 text-green-800',
}
const isDone = (w: Work) => w.canh_bao === 'HOÀN THÀNH'
const days = (a: string, b: string) => Math.round((Date.parse(b) - Date.parse(a)) / 864e5)
const todayIso = () => new Date(Date.now() + 7 * 36e5).toISOString().slice(0, 10) // Asia/Ho_Chi_Minh


const dmy = (iso: string | null) => (iso ? formatDate(iso) : '')
/** "26/10" lines carry no year: walk forward from the assignment date, rolling the year when the month wraps. */
function withDates(entries: Entry[], start: string | null): (Entry & { iso: string | null })[] {
  let y = Number((start ?? todayIso()).slice(0, 4)), lastM = start ? Number(start.slice(5, 7)) : 0
  return entries.map((e) => {
    const m = /^(\d{1,2})\/(\d{1,2})/.exec(e.day)
    if (!m) return { ...e, iso: null }
    const mo = Number(m[2]); if (mo < lastM - 6) y += 1; lastM = mo
    return { ...e, iso: `${y}-${String(mo).padStart(2, '0')}-${String(Number(m[1])).padStart(2, '0')}` }
  })
}
const levelCls = (l?: string | null) => /quan trọng|gấp/i.test(l ?? '') ? 'text-red-600' : 'text-ink-soft'
const stateCls = (w: Work) => isDone(w) ? 'text-green-700' : /đang/i.test(w.trang_thai ?? '') ? 'text-orange-600' : 'text-red-600'

interface Photo { id: string; ngay: string | null; gio: string | null; giai_doan: string | null; dong_tien_do: string | null; file_id: string | null; thumb_id: string | null; nguoi_tai: string | null }
const thumbUrl = (p: Photo, w = 240) => `https://drive.google.com/thumbnail?id=${encodeURIComponent(p.thumb_id || p.file_id || '')}&sz=w${w}`
const fullUrl = (p: Photo) => `https://drive.google.com/thumbnail?id=${encodeURIComponent(p.file_id || '')}&sz=w1600`
const driveUrl = (p: Photo) => `https://drive.google.com/file/d/${encodeURIComponent(p.file_id || '')}/view`
const batchOf = (id: string) => id.replace(/-\d+$/, '')
const plain = (t: string | null | undefined) => String(t ?? '').toLowerCase().replace(/^\s*-?\s*\d{1,2}\/\d{1,2}\s*(\[[^\]]*\])?\s*:?\s*/, '').replace(/\(\s*\d+\s*ảnh\s*\)/g, '').replace(/\s+/g, ' ').trim()

function Lightbox({ list, index, onClose, onGo }: { list: Photo[]; index: number; onClose: () => void; onGo: (i: number) => void }) {
  const p = list[index]
  useEffect(() => {
    const k = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); if (e.key === 'ArrowRight') onGo((index + 1) % list.length); if (e.key === 'ArrowLeft') onGo((index - 1 + list.length) % list.length) }
    document.addEventListener('keydown', k); return () => document.removeEventListener('keydown', k)
  }, [index, list.length, onClose, onGo])
  if (!p) return null
  return (
    <div className="fixed inset-0 z-[110] flex flex-col bg-black/90" role="dialog" aria-modal="true" aria-label="Xem ảnh">
      <div className="flex shrink-0 items-center gap-3 px-4 py-3 text-white">
        <div className="min-w-0 flex-1 text-sm"><b>{index + 1} / {list.length}</b> · {p.giai_doan ?? 'Cập nhật'} · {formatDate(p.ngay)}{p.gio ? ` ${p.gio}` : ''}<div className="truncate text-xs opacity-80">{plain(p.dong_tien_do)}</div></div>
        <a href={driveUrl(p)} target="_blank" rel="noopener noreferrer" className="rounded-lg border border-white/40 px-3 py-1.5 text-xs font-bold">Mở trên Drive</a>
        <button onClick={onClose} aria-label="Đóng" className="grid h-9 w-9 place-items-center rounded-full bg-white/15 text-xl">×</button>
      </div>
      <div className="relative flex min-h-0 flex-1 items-center justify-center" onClick={(e) => e.target === e.currentTarget && onClose()}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={fullUrl(p)} alt={p.giai_doan ?? 'Ảnh công trình'} referrerPolicy="no-referrer" className="max-h-full max-w-full object-contain" />
        {list.length > 1 && <>
          <button onClick={() => onGo((index - 1 + list.length) % list.length)} aria-label="Ảnh trước" className="absolute left-3 grid h-11 w-11 place-items-center rounded-full bg-white/20 text-2xl text-white">‹</button>
          <button onClick={() => onGo((index + 1) % list.length)} aria-label="Ảnh sau" className="absolute right-3 grid h-11 w-11 place-items-center rounded-full bg-white/20 text-2xl text-white">›</button>
        </>}
      </div>
    </div>
  )
}

export default function ProgressReport({ canEdit }: { canEdit: boolean }) {
  const [works, setWorks] = useState<Work[]>([])
  const [people, setPeople] = useState<Record<string, string>>({})
  const [who, setWho] = useState('')
  const [level, setLevel] = useState('')
  const [view, setView] = useState('open')
  const [sel, setSel] = useState<string | null>(null)
  const [err, setErr] = useState('')

  const load = useCallback(async () => {
    const [r, p] = await Promise.all([fetch('/api/cong_viec?pageSize=2000'), fetch('/api/nhan_vien?pageSize=500')])
    const j = await r.json(), pj = await p.json().catch(() => ({ data: [] }))
    if (!j.success) { setErr(j.error); return }
    setWorks(j.data)
    setPeople(Object.fromEntries((pj.data ?? []).map((n: any) => [n.id, n.ho_ten])))
  }, [])
  useEffect(() => { load() }, [load])

  const name = (w: Work) => (w.id_nguoi_thuc_hien && people[w.id_nguoi_thuc_hien]) || '—'
  const levels = useMemo(() => Array.from(new Set(works.map((w) => w.muc_do).filter(Boolean))) as string[], [works])
  const list = useMemo(() => works
    .filter((w) => view === 'all' || (view === 'done' ? isDone(w) : view === 'late' ? w.canh_bao === 'QUÁ HẠN' : !isDone(w)))
    .filter((w) => !who || w.id_nguoi_thuc_hien === who)
    .filter((w) => !level || w.muc_do === level)
    .sort((a, b) => (a.deadline ?? '9999').localeCompare(b.deadline ?? '9999')), [works, who, level, view])

  const load2 = useMemo(() => {
    const m: Record<string, { todo: number; doing: number; late: number }> = {}
    for (const w of works) {
      if (isDone(w)) continue
      const k = w.id_nguoi_thuc_hien ?? ''
      const c = (m[k] ??= { todo: 0, doing: 0, late: 0 })
      if (/đang/i.test(w.trang_thai ?? '')) c.doing++; else c.todo++
      if (w.canh_bao === 'QUÁ HẠN') c.late++
    }
    const rows = Object.entries(m).map(([k, c]) => ({ id: k, name: people[k] || 'Chưa phân công', ...c, total: c.todo + c.doing }))
    const max = Math.max(1, ...rows.map((r) => r.total))
    return rows.sort((a, b) => b.total - a.total).map((r) => ({ ...r, pct: Math.round((r.total / max) * 100) }))
  }, [works, people])

  const work = works.find((w) => w.id === sel) ?? null
  if (err) return <p className="p-4 text-red-600">{err}</p>

  return (
    <div className="flex flex-col flex-1 lg:min-h-0">
      <div className="shrink-0 flex flex-wrap items-baseline gap-x-5 gap-y-1 px-4 lg:px-5 py-2 bg-white border-b border-navy-200">
        <span className="text-[12.5px] text-ink-mute">PHI LONG / <b className="text-navy-800">Báo cáo tiến độ</b></span>
        <h1 className="text-[22px] font-black text-navy-900">Báo cáo tiến độ</h1>
      </div>
      <div className="flex flex-col gap-3 px-4 lg:px-5 py-3 lg:flex-1 lg:min-h-0">
        <div className="card shrink-0 flex flex-wrap items-center gap-3 px-4 py-2.5 print:hidden">
          <h2 className="text-[15px] font-black text-blue-700 mr-1">BÁO CÁO TIẾN ĐỘ</h2>
          <select className="input w-auto" value={who} onChange={(e) => setWho(e.target.value)} aria-label="Người thực hiện">
            <option value="">Tất cả người thực hiện</option>
            {Object.entries(people).map(([id, n]) => <option key={id} value={id}>{n}</option>)}
          </select>
          <select className="input w-auto" value={level} onChange={(e) => setLevel(e.target.value)} aria-label="Mức độ">
            <option value="">Mọi mức độ</option>
            {levels.map((l) => <option key={l}>{l}</option>)}
          </select>
          <select className="input w-auto" value={view} onChange={(e) => setView(e.target.value)} aria-label="Trạng thái">
            <option value="open">Việc chưa xong</option><option value="late">Việc quá hạn</option>
            <option value="done">Đã hoàn thành</option><option value="all">Tất cả</option>
          </select>
          <button className="btn-secondary ml-auto" onClick={() => window.print()}>In báo cáo</button>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:flex-1 lg:min-h-0 lg:grid-cols-[minmax(0,1fr)_minmax(0,25rem)] lg:grid-rows-[minmax(0,1fr)]">
          <div className="card flex flex-col overflow-hidden lg:min-h-0">
            <div className="shrink-0 px-4 py-2.5 text-[13px] font-black uppercase text-blue-700 border-b">Danh sách theo dõi · {list.length} việc</div>
            <div className="overflow-y-auto overflow-x-hidden max-h-[70vh] lg:max-h-none lg:flex-1 lg:min-h-0">
              <table className="hidden w-full text-sm lg:table">
                <thead className="sticky top-0 bg-navy-50 text-left text-[12.5px] font-bold text-navy-800 z-10">
                  <tr>{['Mức độ', 'Nội dung / tiến độ', 'Người thực hiện', 'Ngày giao', 'Hạn', 'Còn lại', 'Thời gian đã dùng', 'Trạng thái'].map((h) => <th key={h} className="px-2 py-2">{h}</th>)}</tr>
                </thead>
                <tbody className="divide-y">
                  {list.map((w) => {
                    const last = parse(w.tien_do).filter((e) => e.text).slice(-1)[0]
                    const tot = w.ngay_giao && w.deadline ? Math.max(1, days(w.ngay_giao, w.deadline)) : 0
                    const used = tot ? days(w.ngay_giao!, w.ngay_hoan_thanh ?? todayIso()) : 0
                    const pct = tot ? Math.round((used / tot) * 100) : 0
                    const left = w.so_ngay_con_lai
                    return (
                      <tr key={w.id} onClick={() => setSel(w.id)} className="cursor-pointer hover:bg-select">
                        <td className={`px-2 py-2 text-xs font-semibold ${levelCls(w.muc_do)}`}>{w.muc_do ?? ''}</td>
                        <td className="px-2 py-2 min-w-[180px]">
                          <div className="font-bold line-clamp-2">{w.noi_dung}</div>
                          {last && <div className="text-[11.5px] text-ink-mute line-clamp-2">Tiến độ: {last.day && `${last.day} `}{last.stage ? `[${last.stage}] ` : ''}{last.text}</div>}
                        </td>
                        <td className="px-2 py-2 break-words">{name(w)}</td>
                        <td className="px-2 py-2 whitespace-nowrap">{dmy(w.ngay_giao)}</td>
                        <td className="px-2 py-2 whitespace-nowrap">{dmy(w.deadline)}</td>
                        <td className="px-2 py-2 whitespace-nowrap">
                          {isDone(w) ? <span className="text-green-700 text-xs font-semibold">Xong</span>
                            : left == null ? '' : left < 0 ? <span className="rounded bg-red-50 px-1.5 py-0.5 text-xs font-semibold text-red-600">Trễ {-left} ngày</span>
                            : <span className="rounded bg-sky-50 px-1.5 py-0.5 text-xs font-semibold text-sky-700">Còn {left} ngày</span>}
                        </td>
                        <td className="px-2 py-2 min-w-[96px]">
                          {tot > 0 && <>
                            <div className="h-2 rounded-full bg-gray-200 overflow-hidden"><div className={`h-full ${pct > 100 ? 'bg-brand-400' : pct > 80 ? 'bg-amber-500' : 'bg-green-600'}`} style={{ width: `${Math.min(100, pct)}%` }} /></div>
                            <div className="text-[11px] text-ink-mute mt-0.5">{pct}% thời gian</div></>}
                        </td>
                        <td className={`px-2 py-2 whitespace-nowrap text-xs font-semibold ${stateCls(w)}`}>{w.trang_thai}</td>
                      </tr>
                    )
                  })}
                  {list.length === 0 && <tr><td colSpan={8} className="p-6 text-center text-ink-mute">Không có công việc.</td></tr>}
                </tbody>
              </table>
              {/* phone: one card per job */}
              <div className="space-y-2.5 p-3 lg:hidden">
                {list.length === 0 ? <p className="py-10 text-center text-ink-mute">Không có công việc.</p> : list.map((w) => {
                  const last = parse(w.tien_do).filter((e) => e.text).slice(-1)[0]
                  const tot = w.ngay_giao && w.deadline ? Math.max(1, days(w.ngay_giao, w.deadline)) : 0
                  const used = tot ? days(w.ngay_giao!, w.ngay_hoan_thanh ?? todayIso()) : 0
                  const pct = tot ? Math.round((used / tot) * 100) : 0
                  const left = w.so_ngay_con_lai
                  const edge = isDone(w) ? 'border-l-emerald-500' : left != null && left < 0 ? 'border-l-red-500' : 'border-l-blue-500'
                  return (
                    <button key={w.id} type="button" onClick={() => setSel(w.id)} className={`block w-full rounded-2xl border border-navy-200 border-l-4 ${edge} bg-white px-3 py-2.5 text-left shadow-[0_1px_2px_rgba(16,24,40,.06)] active:bg-navy-50`}>
                      <div className="flex items-center gap-2">
                        {w.muc_do && <span className={`text-[11.5px] font-extrabold ${levelCls(w.muc_do)}`}>{w.muc_do}</span>}
                        <span className={`ml-auto text-[12px] font-bold ${stateCls(w)}`}>{w.trang_thai}</span>
                      </div>
                      <div className="mt-1 text-[14.5px] font-extrabold leading-snug text-navy-900 line-clamp-2">{w.noi_dung}</div>
                      {last && <div className="mt-1 text-[12px] text-ink-mute line-clamp-2">Tiến độ: {last.day && `${last.day} `}{last.stage ? `[${last.stage}] ` : ''}{last.text}</div>}
                      <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12.5px] text-ink-soft">
                        <span className="font-semibold text-navy-800">{name(w)}</span>
                        <span>{dmy(w.ngay_giao)} → {dmy(w.deadline)}</span>
                        {isDone(w) ? <span className="text-xs font-semibold text-green-700">Xong</span>
                          : left == null ? null : left < 0 ? <span className="rounded bg-red-50 px-1.5 py-0.5 text-xs font-semibold text-red-600">Trễ {-left} ngày</span>
                          : <span className="rounded bg-sky-50 px-1.5 py-0.5 text-xs font-semibold text-sky-700">Còn {left} ngày</span>}
                      </div>
                      {tot > 0 && <div className="mt-2"><div className="h-2 overflow-hidden rounded-full bg-gray-200"><div className={`h-full ${pct > 100 ? 'bg-brand-400' : pct > 80 ? 'bg-amber-500' : 'bg-green-600'}`} style={{ width: `${Math.min(100, pct)}%` }} /></div>
                        <div className="mt-0.5 text-[11px] text-ink-mute">{pct}% thời gian</div></div>}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          <div className="card flex flex-col overflow-hidden lg:min-h-0 print:hidden">
            <div className="shrink-0 px-4 py-2.5 text-[13px] font-black uppercase text-blue-700 border-b">Khối lượng theo người</div>
            <div className="overflow-auto max-h-80 lg:max-h-none lg:flex-1 lg:min-h-0">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-navy-50 text-[12.5px] font-bold text-navy-800 z-10">
                  <tr><th className="px-3 py-2 text-left">Người thực hiện</th><th className="px-2 py-2 text-right">Chưa làm</th><th className="px-2 py-2 text-right">Đang làm</th><th className="px-2 py-2 text-right">Quá hạn</th></tr>
                </thead>
                <tbody className="divide-y">
                  {load2.map((r) => (
                    <tr key={r.id || 'none'} className="cursor-pointer hover:bg-select" onClick={() => setWho(who === r.id ? '' : r.id)}>
                      <td className="px-3 py-2"><div className={`font-bold ${who === r.id ? 'text-select-600' : ''}`}>{r.name}</div>
                        <div className="mt-1 h-1.5 rounded-full bg-gray-100"><div className={`h-full rounded-full ${r.late ? 'bg-brand-400' : 'bg-blue-500'}`} style={{ width: `${Math.max(4, r.pct)}%` }} /></div></td>
                      <td className="px-2 py-2 text-right">{r.todo}</td><td className="px-2 py-2 text-right">{r.doing}</td>
                      <td className={`px-2 py-2 text-right ${r.late ? 'font-bold text-red-600' : ''}`}>{r.late || ''}</td>
                    </tr>
                  ))}
                  {load2.length === 0 && <tr><td colSpan={4} className="p-6 text-center text-ink-mute">Không có việc đang mở.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {work && <Detail work={work} who={name(work)} canEdit={canEdit} onClose={() => setSel(null)} onChanged={load} />}
    </div>
  )
}

function Detail({ work, who, canEdit, onClose, onChanged }: { work: Work; who: string; canEdit: boolean; onClose: () => void; onChanged: () => void }) {
  const [filter, setFilter] = useState<string | null>(null)
  const [sheet, setSheet] = useState(false)
  const [fold, setFold] = useState(false)
  const [photos, setPhotos] = useState<Photo[]>([])
  const [pf, setPf] = useState<string | null>(null)
  const [view, setView] = useState<{ list: Photo[]; i: number } | null>(null)
  useEffect(() => {
    let dead = false
    fetch(`/api/hinh_anh_tien_do?id_cong_viec=${encodeURIComponent(work.id)}&pageSize=1000`, { cache: 'no-store' }).then((r) => r.json())
      .then((j) => { if (!dead && j.success) setPhotos((j.data as (Photo & { an?: boolean })[]).filter((p) => !p.an && p.file_id)) }).catch(() => {})
    return () => { dead = true }
  }, [work.id])
  const entries = useMemo(() => withDates(parse(work.tien_do), work.ngay_giao), [work])
  const counts = useMemo(() => { const c: Record<string, number> = {}; for (const e of entries) if (e.stage) c[e.stage] = (c[e.stage] ?? 0) + 1; return c }, [entries])
  const latest = [...entries].reverse().find((e) => e.stage)
  const dated = entries.filter((e) => e.iso)
  const lastUpd = dated[dated.length - 1]?.iso ?? null
  const sinceUpd = lastUpd ? Math.max(0, days(lastUpd, todayIso())) : null
  const today = work.ngay_hoan_thanh ?? todayIso()
  const tot = work.ngay_giao && work.deadline ? Math.max(1, days(work.ngay_giao, work.deadline)) : 0
  const used = tot ? days(work.ngay_giao!, today) : 0
  const pct = tot ? Math.round((used / tot) * 100) : 0
  const late = tot ? Math.max(0, used - tot) : 0
  // days spent waiting: each "Chờ" entry lasts until the next dated entry
  let wait = 0
  dated.forEach((e, i) => { if (e.stage === 'Chờ' && dated[i + 1]?.iso) wait += Math.max(0, days(e.iso!, dated[i + 1].iso!)) })
  const act = (s: string) => dated.filter((e) => e.stage === s).map((e) => e.iso!)
  const range = (s: string) => { const d = act(s); return d.length ? `${dmy2(d[0])} → ${dmy2(d[d.length - 1])}` : '' }
  const dmy2 = (iso: string) => iso.slice(8, 10) + '/' + iso.slice(5, 7)
  const tone = isDone(work) ? 'text-green-700' : late ? 'text-red-600' : 'text-ink'
  const rows = entries.filter((e) => !filter || e.stage === filter)
  const duePos = tot && used > tot ? (tot / used) * 100 : 100
  const photoStages = useMemo(() => { const c: Record<string, number> = {}; for (const p of photos) { const k = p.giai_doan && STAGES.includes(p.giai_doan) ? p.giai_doan : 'Khác'; c[k] = (c[k] ?? 0) + 1 } return c }, [photos])
  const shown = useMemo(() => photos.filter((p) => !pf || (pf === 'Khác' ? !(p.giai_doan && STAGES.includes(p.giai_doan)) : p.giai_doan === pf)), [photos, pf])
  const batches = useMemo(() => {
    const m = new Map<string, Photo[]>()
    for (const p of [...shown].sort((a, b) => `${b.ngay}${b.gio}${b.id}`.localeCompare(`${a.ngay}${a.gio}${a.id}`))) m.set(batchOf(p.id), [...(m.get(batchOf(p.id)) ?? []), p])
    for (const l of m.values()) l.sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }))
    return [...m.values()]
  }, [shown])
  // thumbnails under the timeline line they belong to (same day, same text)
  const byEntry = useMemo(() => {
    const out = new Map<number, Photo[]>()
    entries.forEach((e, i) => {
      const key = plain(e.text).slice(0, 28); if (!e.iso || key.length < 4) return
      const hit = photos.filter((p) => p.ngay === e.iso && plain(p.dong_tien_do).startsWith(key))
      if (hit.length) out.set(i, hit.slice(0, 8))
    })
    return out
  }, [entries, photos])

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/45 p-3" onMouseDown={(e) => e.target === e.currentTarget && onClose()} role="dialog" aria-modal="true">
      <div className="flex max-h-[94dvh] w-full max-w-[1500px] lg:w-[80vw] lg:max-w-none flex-col overflow-y-auto rounded-xl bg-white shadow-pop md:overflow-hidden">
        <div className="bg-[#0b1b40] px-4 py-3 text-white md:shrink-0 md:px-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                {work.muc_do && <span className="rounded-full bg-white px-2 py-0.5 font-bold text-blue-700">{work.muc_do}</span>}
                <span>Phân tích tiến độ · {who} · Giao {dmy2(work.ngay_giao ?? '0000-00-00')} → Hạn {dmy2(work.deadline ?? '0000-00-00')}</span>
              </div>
              <h2 className="mt-1 text-[17px] font-bold leading-snug">{work.noi_dung}</h2>
            </div>
            <button onClick={onClose} aria-label="Đóng" className="text-2xl leading-none">×</button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 px-4 pt-3 md:shrink-0 md:grid-cols-5 md:px-5">
          <Kpi big={String(entries.length)} sub={`lần cập nhật (${dated.length} có ngày)`} />
          <Kpi big={sinceUpd == null ? '—' : `${sinceUpd} ngày`} sub={lastUpd ? `từ lần cập nhật cuối (${dmy2(lastUpd)})` : 'chưa có cập nhật'} cls={sinceUpd != null && sinceUpd > 7 ? 'text-amber-600' : 'text-amber-600'} />
          <Kpi big={latest ? `${latest.stage} lần ${latest.n}` : '—'} sub={latest?.iso ? `hoạt động gần nhất · ${dmy2(latest.iso)}` : 'hoạt động gần nhất'} cls="text-blue-600" />
          <Kpi big={`${wait} ngày`} sub={`thời gian chờ (${tot ? Math.round((wait / Math.max(1, used)) * 100) : 0}% thời gian)`} />
          <Kpi big={isDone(work) ? 'Xong' : late ? `Trễ ${late} ngày` : `Còn ${Math.max(0, tot - used)} ngày`} sub={`đã dùng ${pct}% thời gian`} cls={late ? 'text-red-600' : 'text-green-700'} />
        </div>

        <div className="px-4 pt-3 md:shrink-0 md:px-5">
          <div className="flex flex-wrap items-center gap-3 md:flex-nowrap">
            <span className={`rounded-full px-3 py-1 text-xs font-bold ${isDone(work) ? 'bg-green-100 text-green-800' : latest?.stage === 'Chờ' ? 'bg-gray-200 text-gray-800' : 'bg-green-100 text-green-800'}`}>
              {isDone(work) ? 'HOÀN THÀNH' : latest?.stage === 'Chờ' ? 'ĐANG CHỜ' : 'ĐANG THI CÔNG'}</span>
            {tot > 0 && <div className="relative flex-1 pt-4 pb-4 max-md:hidden">
              <div className="h-2 overflow-hidden rounded-full bg-gray-200 flex">
                <div className="h-full bg-green-600" style={{ width: `${duePos}%` }} />
                {used > tot && <div className="h-full flex-1 bg-brand-400" />}
              </div>
              <span className="absolute -top-0.5 text-[11px]" style={{ left: `${duePos}%`, transform: 'translateX(-50%)' }}>Hạn <b>{dmy2(work.deadline!)}</b></span>
              <span className="absolute left-0 bottom-0 text-[11px] text-ink-mute">Giao {dmy2(work.ngay_giao!)}</span>
              <span className="absolute right-0 bottom-0 text-[11px] text-ink-mute">{isDone(work) ? 'Xong' : 'Hôm nay'} <b>{dmy2(today)}</b> · ngày {used}</span>
            </div>}
            {tot > 0 && <div className={`text-right text-sm font-bold max-md:ml-auto ${tone}`}>{pct}%<div className="text-[11px] font-normal text-ink-mute">thời gian</div></div>}
            {tot > 0 && <div className="w-full md:hidden">
              <div className="h-2 overflow-hidden rounded-full bg-gray-200 flex"><div className="h-full bg-green-600" style={{ width: `${duePos}%` }} />{used > tot && <div className="h-full flex-1 bg-brand-400" />}</div>
              <div className="mt-1 text-[11.5px] text-ink-mute">Giao <b>{dmy2(work.ngay_giao!)}</b> · Hạn <b>{dmy2(work.deadline!)}</b> · {isDone(work) ? 'Xong' : 'Hôm nay'} <b>{dmy2(today)}</b> · ngày {used}</div>
            </div>}
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-2 pb-2">
            <span className="text-[11px] font-bold uppercase text-ink-mute">Các đợt hoạt động</span>
            {STAGES.filter((s) => counts[s]).map((s) => (
              <button key={s} onClick={() => setFilter(filter === s ? null : s)} className={`rounded-full px-3 py-1 text-xs font-semibold ${COLORS[s]} ${filter === s ? 'ring-2 ring-blue-600' : ''}`}>
                {s} ×{counts[s]} <span className="font-normal opacity-70">{range(s)}</span></button>
            ))}
            {!Object.keys(counts).length && <span className="text-xs text-ink-mute">—</span>}
            {canEdit && !isDone(work) && <button className="rounded-full border border-dashed border-blue-600 px-3 py-1 text-xs font-bold text-blue-700" onClick={() => setSheet(true)}>+ Ghi nhận</button>}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-0 border-t md:min-h-0 md:flex-1 md:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] md:overflow-hidden">
          <div className="flex flex-col px-4 py-3 md:min-h-0 md:border-r md:px-5">
            <div className="shrink-0 text-[12px] font-black uppercase text-blue-700">Diễn biến theo ngày <span className="font-normal normal-case text-ink-mute">{entries.length} dòng</span></div>
            <ol className="mt-2 space-y-1 text-sm md:min-h-0 md:flex-1 md:overflow-y-auto">
              {rows.map((e, i) => {
                const prev = rows[i - 1]
                const gap = e.iso && prev?.iso ? days(prev.iso, e.iso) : 0
                return (
                  <li key={i}>
                    {gap > 0 && <div className="pl-14 text-[11px] text-ink-mute">↓ {gap} ngày</div>}
                    <div className="flex gap-2"><span className="w-12 shrink-0 text-xs font-semibold tabular-nums">{e.day}</span>
                      <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${e.stage ? 'bg-blue-500' : 'bg-gray-400'}`} />
                      <span className="whitespace-pre-wrap">{e.stage && <span className={`mr-2 rounded-full px-2 py-0.5 text-[11px] ${COLORS[e.stage]}`}>{e.stage} lần {e.n}</span>}{e.text}</span></div>
                    {(() => { const ph = byEntry.get(entries.indexOf(e)); return ph ? (
                      <div className="ml-16 mt-1 flex flex-wrap gap-1.5">{ph.map((p) => (
                        <button key={p.id} onClick={() => setView({ list: ph, i: ph.indexOf(p) })} aria-label="Xem ảnh" className="h-[54px] w-[72px] overflow-hidden rounded-md border bg-gray-100">
                          {/* eslint-disable-next-line @next/next/no-img-element */}<img src={thumbUrl(p, 160)} alt="" loading="lazy" referrerPolicy="no-referrer" className="h-full w-full object-cover" /></button>))}</div>) : null })()}
                  </li>
                )
              })}
              {!entries.length && <li className="text-ink-mute">Chưa có tiến độ.</li>}
            </ol>
          </div>
          <div className="space-y-4 border-t px-4 py-3 md:min-h-0 md:overflow-y-auto md:border-t-0 md:px-5">
            <section>
              <div className="text-[12px] font-black uppercase text-blue-700">Nhận xét tự động</div>
              <ul className="mt-2 list-disc space-y-1 rounded-lg border bg-canvas py-3 pl-8 pr-3 text-sm">
                {insights(work, counts, late, pct, sinceUpd, latest).map((t, i) => <li key={i}>{t}</li>)}
              </ul>
            </section>
            <section>
              <div className="text-[12px] font-black uppercase text-blue-700">Hình ảnh công trình <span className="font-normal normal-case text-ink-mute">· {photos.length} ảnh</span></div>
              {photos.length === 0 ? <p className="mt-2 rounded-lg border border-dashed bg-canvas p-3 text-xs text-ink-mute">Chưa có ảnh cho công việc này.</p> : (
                <div className="mt-2 rounded-lg border">
                  <div className="flex flex-wrap gap-1.5 border-b p-2">
                    {[['', 'Tất cả', photos.length] as const, ...Object.entries(photoStages).map(([k, n]) => [k, k, n] as const)].map(([k, label, n]) => (
                      <button key={k || 'all'} onClick={() => setPf(k || null)} className={`rounded-full border px-3 py-0.5 text-xs font-semibold ${(pf ?? '') === k ? 'border-gray-700 bg-gray-100' : 'border-gray-300 bg-white'}`}>{label} {n}</button>
                    ))}
                  </div>
                  <div className="max-h-[300px] space-y-2 overflow-y-auto p-2">
                    {batches.map((b) => (
                      <div key={batchOf(b[0].id)}>
                        <div className="mb-1 text-xs font-bold">{b[0].giai_doan ?? 'Cập nhật'} · {b[0].ngay ? `${b[0].ngay.slice(8, 10)}/${b[0].ngay.slice(5, 7)}` : '—'} · {b.length} ảnh</div>
                        <div className="flex flex-wrap gap-1.5">
                          {b.map((p) => (
                            <button key={p.id} onClick={() => setView({ list: shown, i: shown.indexOf(p) })} aria-label="Xem ảnh" className="h-[70px] w-[76px] overflow-hidden rounded-md border bg-gray-100">
                              {/* eslint-disable-next-line @next/next/no-img-element */}<img src={thumbUrl(p)} alt={p.giai_doan ?? 'Ảnh công trình'} loading="lazy" referrerPolicy="no-referrer" className="h-full w-full object-cover" /></button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>
            <section>
              <div className="flex items-center justify-between">
                <div className="text-[12px] font-black uppercase text-blue-700">Nội dung gốc ô tiến độ</div>
                <div className="flex gap-2">
                  <button className="btn-secondary !py-1 !text-xs" onClick={() => navigator.clipboard?.writeText(work.tien_do ?? '')}>Sao chép</button>
                  <button className="btn-secondary !py-1 !text-xs" onClick={() => setFold(!fold)}>{fold ? 'Mở rộng' : 'Thu gọn'}</button>
                </div>
              </div>
              <pre className={`mt-2 overflow-auto whitespace-pre-wrap rounded-lg border border-dashed bg-canvas p-3 font-sans text-xs ${fold ? 'max-h-16' : 'max-h-80'}`}>{work.tien_do || '—'}</pre>
            </section>
          </div>
        </div>

        <div className="sticky bottom-0 flex justify-end gap-2 border-t bg-white px-4 py-3 md:shrink-0 md:px-5">
          {canEdit && !isDone(work) && <button className="btn-secondary max-md:flex-1 max-md:px-2 max-md:text-[13px]" onClick={() => setSheet(true)}>+ Cập nhật<span className="max-md:hidden">&nbsp;tiến độ</span></button>}
          <a className="btn-secondary max-md:flex-1 max-md:px-2 max-md:text-[13px]" href="/cong_viec">Mở<span className="max-md:hidden">&nbsp;công</span>&nbsp;việc</a>
          <button className="btn-primary max-md:flex-1 max-md:px-2 max-md:text-[13px]" onClick={onClose}>Đóng</button>
        </div>
      </div>
      {view && <Lightbox list={view.list} index={view.i} onClose={() => setView(null)} onGo={(i) => setView((v) => (v ? { ...v, i } : v))} />}
      {sheet && <RecordSheet work={work} counts={counts} onClose={() => setSheet(false)} onSaved={() => { setSheet(false); onChanged() }} />}
    </div>
  )
}

function Kpi({ big, sub, cls = '' }: { big: string; sub: string; cls?: string }) {
  return <div className="rounded-lg border px-3 py-1.5 md:px-4 md:py-2"><div className={`text-[18px] font-bold leading-tight md:text-[22px] ${cls}`}>{big}</div><div className="text-[11.5px] text-ink-mute">{sub}</div></div>
}

function insights(w: Work, counts: Record<string, number>, late: number, pct: number, since: number | null, latest?: { stage: string | null; n: number | null; day: string }) {
  const out: string[] = []
  if (isDone(w)) out.push(`Hoàn thành ${formatDate(w.ngay_hoan_thanh)}${late ? ` (trễ ${late} ngày)` : ' đúng hạn'}.`)
  else if (late) out.push(`Quá hạn: đã dùng ${pct}% thời gian, trễ ${late} ngày — trạng thái ${String(w.trang_thai ?? '').toLowerCase()}.`)
  else if (w.deadline) out.push(`Trong hạn: đã dùng ${pct}% thời gian.`)
  const parts = STAGES.filter((s) => counts[s]).map((s) => `${s.toLowerCase()} ${counts[s]} lần`)
  if (parts.length) out.push(`Hoạt động: ${parts.join(', ')}.`)
  if (latest) out.push(`Gần nhất: ${latest.stage} lần ${latest.n} (${latest.day}).`)
  if ((counts['Khảo sát'] ?? 0) >= 3 && !counts['Thi công']) out.push('Khảo sát nhiều lần nhưng chưa thi công.')
  if ((counts['Chờ'] ?? 0) >= 2) out.push(`Đã phải chờ ${counts['Chờ']} lần.`)
  if (since != null && !isDone(w)) out.push(since > 7 ? `Chưa cập nhật ${since} ngày — cần nhắc người phụ trách.` : 'Cập nhật đều (≤ 7 ngày).')
  if (!out.length) out.push('Chưa ghi nhận tiến độ nào.')
  return out
}

function RecordSheet({ work, counts, onClose, onSaved }: { work: Work; counts: Record<string, number>; onClose: () => void; onSaved: () => void }) {
  const [stage, setStage] = useState('')
  const [text, setText] = useState('')
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  async function save() {
    setBusy(true); setErr('')
    const r = await fetch(`/api/cong_viec/${work.id}/tien_do`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ giai_doan: stage, noi_dung: text }) })
    const j = await r.json().catch(() => ({}))
    if (!j.success) { setErr(j.error || 'Không lưu được'); setBusy(false); return }
    onSaved()
  }
  return (
    <div className="fixed inset-0 bg-black/40 z-[100] flex items-center justify-center p-3" onMouseDown={(e) => e.target === e.currentTarget && onClose()} role="dialog" aria-modal="true">
      <div className="bg-white w-full max-w-2xl rounded-2xl p-6 space-y-4 shadow-pop max-h-[90dvh] overflow-y-auto">
        <h2 className="font-bold">Ghi nhận tiến độ · {work.id}</h2>
        <div className="flex flex-wrap gap-2">
          {STAGES.map((s) => (
            <button key={s} type="button" onClick={() => setStage(stage === s ? '' : s)}
              className={`px-3 py-1.5 rounded-full text-sm ${COLORS[s]} ${stage === s ? 'ring-2 ring-blue-600' : ''}`}>{s} · lần {(counts[s] ?? 0) + 1}</button>
          ))}
        </div>
        <textarea className="input" rows={3} placeholder="Nội dung…" value={text} onChange={(e) => setText(e.target.value)} autoFocus />
        {err && <p className="text-sm text-red-600">{err}</p>}
        <div className="flex justify-end gap-2">
          <button className="btn-secondary" onClick={onClose}>Hủy</button>
          <button className="btn-primary" disabled={busy || (!stage && !text.trim())} onClick={save}>{busy ? 'Đang lưu…' : 'Lưu'}</button>
        </div>
      </div>
    </div>
  )
}
