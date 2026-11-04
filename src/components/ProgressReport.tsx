'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { STAGES, formatDate } from '@/lib/resources'

interface Work {
  id: string; noi_dung: string; ngay_giao: string | null; deadline: string | null; ngay_hoan_thanh: string | null
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

export default function ProgressReport({ canEdit }: { canEdit: boolean }) {
  const [works, setWorks] = useState<Work[]>([])
  const [q, setQ] = useState('')
  const [showDone, setShowDone] = useState(false)
  const [sel, setSel] = useState<string | null>(null)
  const [filter, setFilter] = useState<string | null>(null)
  const [err, setErr] = useState('')
  const [sheet, setSheet] = useState(false)

  const load = useCallback(async () => {
    const r = await fetch('/api/cong_viec?pageSize=2000')
    const j = await r.json()
    if (!j.success) { setErr(j.error); return }
    setWorks(j.data)
  }, [])
  useEffect(() => { load() }, [load])

  const list = useMemo(() => works
    .filter((w) => showDone || !isDone(w))
    .filter((w) => !q || `${w.id} ${w.noi_dung} ${w.tien_do ?? ''}`.toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => (a.deadline ?? '9999').localeCompare(b.deadline ?? '9999')), [works, q, showDone])
  const work = works.find((w) => w.id === sel) ?? null
  const entries = useMemo(() => parse(work?.tien_do ?? null), [work])
  const counts = useMemo(() => {
    const c: Record<string, number> = {}
    for (const e of entries) if (e.stage) c[e.stage] = (c[e.stage] ?? 0) + 1
    return c
  }, [entries])
  const latest = [...entries].reverse().find((e) => e.stage)

  if (err) return <p className="text-red-600">{err}</p>

  return (
    <div className="space-y-3">
      <div><p className="text-[11px] font-bold uppercase tracking-[0.2em] text-gold-600 mb-1">Công việc</p><h1 className="text-2xl md:text-[28px] font-bold tracking-tight text-navy-900">Báo cáo tiến độ</h1></div>
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,22rem)_1fr] gap-4">
        <div className="card flex flex-col overflow-hidden lg:h-[calc(100vh-8rem)]">
          <div className="p-3 border-b space-y-2">
            <input className="input" type="search" placeholder="Tìm công việc…" value={q} onChange={(e) => setQ(e.target.value)} />
            <label className="text-sm flex items-center gap-2"><input type="checkbox" checked={showDone} onChange={(e) => setShowDone(e.target.checked)} /> Hiện cả việc đã hoàn thành</label>
          </div>
          <ul className="overflow-y-auto divide-y text-sm max-h-80 lg:max-h-none">
            {list.map((w) => (
              <li key={w.id}>
                <button onClick={() => { setSel(w.id); setFilter(null) }} className={`w-full text-left px-3 py-2 hover:bg-gold-50/60 ${sel === w.id ? "bg-navy-50 border-l-2 border-gold-400" : "border-l-2 border-transparent"}`}>
                  <div className="flex justify-between gap-2"><span className="font-mono text-xs text-ink-mute">{w.id}</span>
                    <span className={`text-xs ${w.canh_bao === 'QUÁ HẠN' ? 'text-red-600' : 'text-ink-mute'}`}>{w.canh_bao}</span></div>
                  <div className="line-clamp-2">{w.noi_dung}</div>
                </button>
              </li>
            ))}
            {list.length === 0 && <li className="p-4 text-ink-mute">Không có công việc.</li>}
          </ul>
        </div>

        {!work ? <div className="card p-10 text-center text-ink-mute">Chọn một công việc để xem phân tích tiến độ.</div> : (
          <div className="card p-6 space-y-5 min-w-0">
            <div className="flex flex-wrap justify-between gap-2 items-start">
              <div className="min-w-0">
                <span className={`inline-block text-xs font-bold px-2 py-1 rounded mb-1 ${isDone(work) ? 'bg-green-100 text-green-800' : latest?.stage === 'Chờ' ? 'bg-gray-200 text-gray-800' : 'bg-orange-100 text-orange-800'}`}>
                  {isDone(work) ? 'HOÀN THÀNH' : latest?.stage === 'Chờ' ? 'ĐANG CHỜ' : 'ĐANG THI CÔNG'}
                </span>
                <h2 className="font-semibold"><span className="font-mono text-ink-mute">{work.id}</span> {work.noi_dung}</h2>
              </div>
              {canEdit && !isDone(work) && <button className="btn-primary" onClick={() => setSheet(true)}>+ Ghi nhận</button>}
            </div>

            <TimeBar work={work} />

            <div className="grid sm:grid-cols-2 gap-3 text-sm">
              <div className="bg-canvas rounded-xl p-4"><div className="text-xs text-ink-mute">Hoạt động gần nhất</div>
                <div className="font-medium">{latest ? `${latest.stage} lần ${latest.n} · ${latest.day}` : 'Chưa có mốc nào được gắn thẻ'}</div></div>
              <div className="bg-canvas rounded-xl p-4"><div className="text-xs text-ink-mute">Nhận xét</div>
                <div>{comment(work, entries, counts)}</div></div>
            </div>

            <div>
              <div className="text-xs text-ink-mute mb-1">Các đợt hoạt động (bấm để lọc)</div>
              <div className="flex flex-wrap gap-2">
                {STAGES.filter((s) => counts[s]).map((s) => (
                  <button key={s} onClick={() => setFilter(filter === s ? null : s)}
                    className={`px-3 py-1 rounded-full text-sm ${COLORS[s]} ${filter === s ? 'ring-2 ring-gold-400' : ''}`}>{s} ×{counts[s]}</button>
                ))}
                {!Object.keys(counts).length && <span className="text-sm text-navy-200">—</span>}
              </div>
            </div>

            <div>
              <div className="text-xs text-ink-mute mb-1">Diễn biến theo ngày</div>
              <ol className="border-l-2 border-gold-200 pl-5 space-y-2 text-sm">
                {entries.filter((e) => !filter || e.stage === filter).map((e, i) => (
                  <li key={i}>
                    <span className="text-ink-mute mr-2">{e.day}</span>
                    {e.stage && <span className={`text-xs px-2 py-0.5 rounded-full mr-2 ${COLORS[e.stage]}`}>{e.stage} lần {e.n}</span>}
                    <span className="whitespace-pre-wrap">{e.text}</span>
                  </li>
                ))}
                {!entries.length && <li className="text-navy-200">Chưa có tiến độ.</li>}
              </ol>
            </div>

            <details className="text-sm">
              <summary className="cursor-pointer text-ink-soft">Nội dung gốc ô tiến độ</summary>
              <pre className="whitespace-pre-wrap bg-canvas rounded-xl p-4 mt-2 font-sans">{work.tien_do || '—'}</pre>
              <button className="btn-secondary mt-2" onClick={() => navigator.clipboard?.writeText(work.tien_do ?? '')}>Sao chép</button>
            </details>
          </div>
        )}
      </div>

      {sheet && work && <RecordSheet work={work} counts={counts} onClose={() => setSheet(false)} onSaved={() => { setSheet(false); load() }} />}
    </div>
  )
}

function TimeBar({ work }: { work: Work }) {
  const start = work.ngay_giao, due = work.deadline, now = work.ngay_hoan_thanh ?? todayIso()
  if (!start || !due) return <p className="text-sm text-ink-mute">Giao {formatDate(start) || '?'} · Hạn {formatDate(due) || 'chưa đặt'}</p>
  const total = Math.max(1, days(start, due)), used = days(start, now)
  const pct = Math.round((used / total) * 100), over = used > total
  const width = Math.min(100, Math.max(0, over ? (total / used) * 100 : pct))
  return (
    <div>
      <div className="flex justify-between text-xs text-ink-mute mb-1">
        <span>Giao {formatDate(start)}</span><span>Hạn {formatDate(due)}</span><span>{work.ngay_hoan_thanh ? 'Xong' : 'Hôm nay'} {formatDate(now)}</span>
      </div>
      <div className="h-3 rounded-full bg-gray-200 overflow-hidden flex" role="img" aria-label={`Đã dùng ${pct}% thời gian`}>
        <div className="bg-gradient-to-r from-navy-700 to-navy-500 h-full" style={{ width: `${width}%` }} />
        {over && <div className="bg-red-500 h-full flex-1" />}
      </div>
      <div className={`text-xs mt-1 ${over ? 'text-red-600 font-medium' : 'text-ink-soft'}`}>
        {over ? `Quá hạn ${used - total} ngày (${pct}% thời gian)` : `Đã dùng ${pct}% thời gian · còn ${total - used} ngày`}
      </div>
    </div>
  )
}

function comment(w: Work, entries: Entry[], counts: Record<string, number>) {
  if (isDone(w)) return `Hoàn thành ${formatDate(w.ngay_hoan_thanh)}${w.deadline && w.ngay_hoan_thanh && w.ngay_hoan_thanh > w.deadline ? ' (trễ hạn)' : ''}.`
  const parts: string[] = []
  if (w.canh_bao === 'QUÁ HẠN') parts.push(`Quá hạn ${Math.abs(w.so_ngay_con_lai ?? 0)} ngày.`)
  if ((counts['Khảo sát'] ?? 0) >= 3 && !counts['Thi công']) parts.push('Khảo sát nhiều lần nhưng chưa thi công.')
  if ((counts['Chờ'] ?? 0) >= 2) parts.push(`Đã phải chờ ${counts['Chờ']} lần.`)
  if (!entries.length) parts.push('Chưa ghi nhận tiến độ nào.')
  return parts.join(' ') || 'Đang tiến triển bình thường.'
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
    <div className="fixed inset-0 bg-black/40 z-50 flex items-end justify-center" onMouseDown={(e) => e.target === e.currentTarget && onClose()} role="dialog" aria-modal="true">
      <div className="bg-white w-full max-w-2xl rounded-t-2xl p-6 space-y-4 shadow-pop">
        <h2 className="font-bold">Ghi nhận tiến độ · {work.id}</h2>
        <div className="flex flex-wrap gap-2">
          {STAGES.map((s) => (
            <button key={s} type="button" onClick={() => setStage(stage === s ? '' : s)}
              className={`px-3 py-1.5 rounded-full text-sm ${COLORS[s]} ${stage === s ? 'ring-2 ring-gold-400' : ''}`}>{s} · lần {(counts[s] ?? 0) + 1}</button>
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
