'use client'
// "Dữ liệu còn thiếu": pick a table, see how full each column is, and fill the empty cells in place.
// Every save goes through the normal edit API, so permissions, validation, locks and the audit log all apply.
import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { CheckCircle2, ClipboardList, ExternalLink, Loader2, Save } from 'lucide-react'
import { NAV, RESOURCES, type Field, type Resource } from '@/lib/resources'
import { useConfirm } from '@/components/ConfirmDialog'

type Opt = { value: string; label: string }
type RowState = { val: string; saving?: boolean; err?: string }

const SKIP_TYPES = new Set(['password', 'bool', 'files'])
const empty = (v: unknown) => v === null || v === undefined || (typeof v === 'string' && !v.trim())
const dmy = (s?: string | null) => (s && /^\d{4}-\d{2}-\d{2}/.test(s) ? `${s.slice(8, 10)}/${s.slice(5, 7)}/${s.slice(0, 4)}` : s ?? '')

async function getJson(url: string) {
  const r = await fetch(url), j = await r.json().catch(() => ({ success: false, error: 'Lỗi mạng' }))
  if (!j.success) throw new Error(j.error || 'Có lỗi xảy ra')
  return j
}
async function loadAll(key: string) {
  const out: any[] = []
  for (let page = 1; page < 30; page++) {
    const j = await getJson(`/api/${key}?pageSize=2000&page=${page}`)
    out.push(...j.data)
    if (out.length >= j.total || !j.data.length) break
  }
  return out
}
/** the columns a person fills in (not computed, not passwords or switches) */
const fillable = (r: Resource) => r.fields.filter((f) => !f.ro && f.inForm !== false && !f.createOnly && !f.calc && !SKIP_TYPES.has(f.type))
const refKey = (f: Field) => f.ref ?? f.multiRef ?? f.nameOf

function Input({ f, value, opts, onChange, onEnter, id }: { f: Field; value: string; opts?: Opt[]; onChange: (v: string) => void; onEnter?: () => void; id?: string }) {
  const cls = 'input !h-9 !py-0 !text-[13.5px] w-full'
  const key = (e: React.KeyboardEvent) => { if (e.key === 'Enter' && onEnter) { e.preventDefault(); onEnter() } }
  if (f.type === 'select' && f.options) return <select id={id} className={cls} value={value} onChange={(e) => onChange(e.target.value)}><option value="">— Chọn —</option>{f.options.map((o) => <option key={o}>{o}</option>)}</select>
  if (refKey(f) && opts) return <select id={id} className={cls} value={value} onChange={(e) => onChange(e.target.value)}><option value="">— Chọn —</option>{opts.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</select>
  const type = f.type === 'date' ? 'date' : f.type === 'datetime' ? 'datetime-local' : f.type === 'month' ? 'month' : f.type === 'number' || f.type === 'money' ? 'number' : f.type === 'email' ? 'email' : 'text'
  return <input id={id} className={cls} type={type} value={value} placeholder={f.place ?? `Nhập ${f.label.toLowerCase()}`} onChange={(e) => onChange(e.target.value)} onKeyDown={key} inputMode={type === 'number' ? 'decimal' : undefined} />
}

export default function MissingFields({ editable }: { editable: string[] }) {
  // tables in menu order, only those the user may edit
  const tables = useMemo(() => {
    const can = new Set(editable), seen = new Set<string>(), out: { group: string; res: Resource; label: string }[] = []
    for (const g of NAV) for (const it of g.items) {
      const res = it.resource ? RESOURCES.find((r) => r.key === it.resource) : undefined
      if (!res || seen.has(res.key) || !can.has(res.key) || res.noEdit || !fillable(res).length) continue
      seen.add(res.key); out.push({ group: g.group, res, label: it.label })
    }
    return out
  }, [editable])
  const [key, setKey] = useState('')
  const [rows, setRows] = useState<any[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')
  const [field, setField] = useState('')
  const [showFull, setShowFull] = useState(false)
  const [opts, setOpts] = useState<Record<string, Opt[]>>({})
  const [edit, setEdit] = useState<Record<string, RowState>>({})
  const [picked, setPicked] = useState<Set<string>>(new Set())
  const [bulk, setBulk] = useState('')
  const [busy, setBusy] = useState('')
  const [msg, setMsg] = useState('')
  const [confirm, dialog] = useConfirm()

  const res = tables.find((t) => t.res.key === key)?.res
  const load = useCallback(async (k: string) => {
    setLoading(true); setErr(''); setRows(null); setField(''); setEdit({}); setPicked(new Set()); setMsg('')
    try { setRows(await loadAll(k)) } catch (e: any) { setErr(e.message) } finally { setLoading(false) }
  }, [])
  useEffect(() => { if (key) load(key) }, [key, load])

  // completeness per column
  const stats = useMemo(() => {
    if (!res || !rows) return []
    return fillable(res).map((f) => ({ f, miss: rows.filter((r) => empty(r[f.name])).length }))
      .sort((a, b) => Number(!!b.f.required) - Number(!!a.f.required) || b.miss - a.miss)
  }, [res, rows])
  const totalMiss = stats.reduce((s, x) => s + x.miss, 0)
  const f = res?.fields.find((x) => x.name === field)
  const missing = useMemo(() => (f && rows ? rows.filter((r) => empty(r[f.name])) : []), [f, rows])

  // choices for ref / multi-ref columns
  useEffect(() => {
    const rk = f && refKey(f)
    if (!rk || opts[rk]) return
    getJson(`/api/${rk}?options=1`).then((j) => setOpts((o) => ({ ...o, [rk]: j.data }))).catch(() => setOpts((o) => ({ ...o, [rk]: [] })))
  }, [f, opts])
  const fOpts = f && refKey(f) ? opts[refKey(f)!] : undefined

  const pick = (k: string) => { setField(k); setEdit({}); setPicked(new Set()); setBulk(''); setMsg('') }
  const valueOut = (v: string) => (f && (f.type === 'number' || f.type === 'money') ? (v.trim() === '' ? null : Number(v)) : v)

  const saveOne = async (id: string, v: string) => {
    if (!res || !f) return false
    if (!v.trim()) { setEdit((e) => ({ ...e, [id]: { val: v, err: 'Chưa nhập giá trị' } })); return false }
    setEdit((e) => ({ ...e, [id]: { val: v, saving: true } }))
    try {
      const r = await fetch(`/api/${res.key}/${encodeURIComponent(id)}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ [f.name]: valueOut(v) }) })
      const j = await r.json().catch(() => ({ success: false, error: 'Lỗi mạng' }))
      if (!j.success) throw new Error(j.error || 'Không lưu được')
      setRows((rs) => rs?.map((x) => (x.id === id ? { ...x, ...(j.data ?? {}), [f.name]: j.data?.[f.name] ?? valueOut(v) } : x)) ?? rs)
      setEdit((e) => { const n = { ...e }; delete n[id]; return n })
      setPicked((p) => { const n = new Set(p); n.delete(id); return n })
      return true
    } catch (e: any) { setEdit((s) => ({ ...s, [id]: { val: v, err: e.message } })); return false }
  }
  const saveBulk = async () => {
    if (!f || !picked.size) return
    if (!bulk.trim()) { setMsg('Nhập giá trị cần điền trước.'); return }
    const shown = fOpts?.find((o) => o.value === bulk)?.label ?? bulk
    if (!(await confirm(`Điền "${shown}" vào cột "${f.label}" cho ${picked.size} dòng đã chọn?`, { okLabel: 'Điền' }))) return
    setBusy('bulk'); setMsg('')
    let ok = 0, bad = 0
    for (const id of Array.from(picked)) (await saveOne(id, bulk)) ? ok++ : bad++
    setBusy(''); setMsg(`Đã điền ${ok} dòng${bad ? `, ${bad} dòng không lưu được (xem lý do ở từng dòng)` : ''}.`)
  }

  // the catalogue label often starts with the code itself: show it once
  const labelOf = (r: any) => String(res?.optionLabel(r) ?? '').replace(/\s+/g, ' ').replace(new RegExp(`^${String(r.id).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*[·:-]?\\s*`), '').slice(0, 110)
  const hrefOf = (id: string) => (res ? `/${res.key}?xem=${encodeURIComponent(id)}` : '#')
  const dateOf = (r: any) => (res?.dateField ? dmy(r[res.dateField]) : '')
  const allPicked = missing.length > 0 && missing.every((r) => picked.has(r.id))

  return (
    <section className="card">
      {dialog}
      <header className="flex flex-wrap items-center gap-2 border-b border-navy-100 px-4 py-3">
        <ClipboardList size={18} className="text-blue-600" />
        <h2 className="flex-1 font-extrabold text-navy-900">Dữ liệu còn thiếu</h2>
        <label className="flex items-center gap-2 text-sm font-bold text-ink-soft" htmlFor="mf-table">Bảng
          <select id="mf-table" className="input !h-9 !py-0 min-w-[220px]" value={key} onChange={(e) => setKey(e.target.value)}>
            <option value="">— Chọn bảng cần rà —</option>
            {Array.from(new Set(tables.map((t) => t.group))).map((g) => (
              <optgroup key={g} label={g}>{tables.filter((t) => t.group === g).map((t) => <option key={t.res.key} value={t.res.key}>{t.label}</option>)}</optgroup>
            ))}
          </select>
        </label>
        {key && <button className="btn-secondary btn-sm" onClick={() => load(key)} disabled={loading}>{loading ? <Loader2 size={14} className="animate-spin" /> : null}Tải lại</button>}
      </header>
      <div className="space-y-3 p-4">
        {!key && <p className="text-sm text-ink-soft">Chọn một bảng để xem cột nào còn trống, bấm vào cột để điền ngay tại đây. Mỗi lần lưu đi qua kiểm tra quyền và dữ liệu như khi sửa bình thường, và được ghi vào Nhật ký thao tác.</p>}
        {err && <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">{err}</p>}
        {loading && <p className="py-4 text-center text-sm text-ink-mute"><Loader2 size={16} className="mr-1 inline animate-spin" />Đang tải dữ liệu…</p>}

        {res && rows && (
          <>
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <b className="text-navy-900">{res.title}</b><span className="text-ink-mute">· {rows.length.toLocaleString('vi-VN')} dòng · {totalMiss.toLocaleString('vi-VN')} ô trống</span>
              <label className="ml-auto flex items-center gap-1.5 text-xs font-semibold text-ink-soft"><input type="checkbox" checked={showFull} onChange={(e) => setShowFull(e.target.checked)} />Hiện cả cột đã đủ</label>
            </div>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
              {stats.filter((s) => showFull || s.miss > 0).map(({ f: c, miss }) => {
                const pct = rows.length ? Math.round(((rows.length - miss) / rows.length) * 100) : 100, on = c.name === field
                return (
                  <button key={c.name} onClick={() => pick(c.name)} disabled={!miss} aria-pressed={on}
                    className={`rounded-lg border px-3 py-2 text-left transition ${on ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200' : 'border-navy-200 bg-white hover:border-blue-300'} disabled:cursor-default disabled:opacity-70`}>
                    <div className="flex items-center gap-1.5 text-[13px] font-extrabold text-navy-900">
                      <span className="min-w-0 flex-1 truncate">{c.label}</span>
                      {c.required && <span className="rounded bg-red-100 px-1.5 text-[10.5px] font-bold text-red-700">Bắt buộc</span>}
                      {!miss && <CheckCircle2 size={14} className="text-green-600" />}
                    </div>
                    <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-navy-100"><div className={`h-full ${pct === 100 ? 'bg-green-500' : pct >= 70 ? 'bg-blue-500' : pct >= 30 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${pct}%` }} /></div>
                    <div className="mt-1 text-xs text-ink-mute">{miss ? `Thiếu ${miss.toLocaleString('vi-VN')} / ${rows.length.toLocaleString('vi-VN')}` : 'Đã đủ'} · {pct}%</div>
                  </button>
                )
              })}
            </div>
            {!stats.some((s) => s.miss) && <p className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm font-bold text-green-700"><CheckCircle2 size={16} />Bảng này không còn ô trống nào.</p>}

            {f && (
              <div className="rounded-xl border border-navy-200">
                <div className="flex flex-wrap items-center gap-2 border-b border-navy-100 bg-navy-50/60 px-3 py-2">
                  <h3 className="flex-1 text-[13.5px] font-extrabold text-navy-900">Điền “{f.label}” · còn {missing.length} dòng</h3>
                  {missing.length > 0 && <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
                    <div className="min-w-[180px] flex-1 sm:w-[240px] sm:flex-none"><Input f={f} value={bulk} opts={fOpts} onChange={setBulk} id="mf-bulk" /></div>
                    <button className="btn-primary btn-sm" disabled={!picked.size || !!busy} onClick={saveBulk}>{busy === 'bulk' ? <Loader2 size={14} className="animate-spin" /> : null}Điền cho {picked.size} dòng đã chọn</button>
                  </div>}
                </div>
                {msg && <p role="status" className="border-b border-navy-100 bg-green-50 px-3 py-2 text-sm font-semibold text-green-700">{msg}</p>}
                {missing.length === 0 ? <p className="flex items-center gap-2 px-3 py-4 text-sm font-bold text-green-700"><CheckCircle2 size={16} />Cột này đã điền đủ.</p> : (
                  <ul className="max-h-[480px] divide-y divide-navy-100 overflow-y-auto">
                    <li className="sticky top-0 z-[1] flex items-center gap-3 bg-white px-3 py-1.5 text-xs font-bold text-ink-mute">
                      <label className="flex items-center gap-2"><input type="checkbox" checked={allPicked} onChange={(e) => setPicked(e.target.checked ? new Set(missing.map((r) => r.id)) : new Set())} />Chọn tất cả</label>
                    </li>
                    {missing.slice(0, 500).map((r) => {
                      const st = edit[r.id] ?? { val: '' }
                      return (
                        <li key={r.id} className="flex flex-wrap items-center gap-x-3 gap-y-1.5 px-3 py-2">
                          <input type="checkbox" aria-label={`Chọn ${r.id}`} checked={picked.has(r.id)} onChange={(e) => setPicked((p) => { const n = new Set(p); e.target.checked ? n.add(r.id) : n.delete(r.id); return n })} />
                          <div className="min-w-[200px] flex-1">
                            <div className="text-[13.5px] font-bold text-navy-900"><span className="text-blue-700">{r.id}</span> · {labelOf(r)}</div>
                            {(dateOf(r) || st.err) && <div className="text-xs">{dateOf(r) && <span className="text-ink-mute">{dateOf(r)}</span>}{st.err && <span className="ml-2 font-semibold text-red-600">{st.err}</span>}</div>}
                          </div>
                          <div className="flex w-full items-center gap-2 sm:w-auto">
                            <div className="min-w-0 flex-1 sm:w-[260px] sm:flex-none"><Input f={f} value={st.val} opts={fOpts} onChange={(v) => setEdit((e) => ({ ...e, [r.id]: { val: v } }))} onEnter={() => saveOne(r.id, st.val)} /></div>
                            <button className="btn-primary btn-sm shrink-0" disabled={!!st.saving || !!busy} onClick={() => saveOne(r.id, st.val)} aria-label={`Lưu ${r.id}`}>{st.saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}Lưu</button>
                            <Link href={hrefOf(r.id)} className="btn-ghost btn-sm shrink-0" title="Mở bản ghi" aria-label={`Mở ${r.id}`}><ExternalLink size={14} /></Link>
                          </div>
                        </li>
                      )
                    })}
                    {missing.length > 500 && <li className="px-3 py-2 text-xs text-ink-mute">Hiện 500 dòng đầu; lưu xong sẽ hiện tiếp.</li>}
                  </ul>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </section>
  )
}
