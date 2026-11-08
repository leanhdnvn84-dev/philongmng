'use client'

// "Thêm / Sửa đề xuất" popup (V191 layout): header fields + a table of items, saved together.
import { useEffect, useMemo, useRef, useState } from 'react'
import { Loader2, Plus, X } from 'lucide-react'
import Portal from '@/components/Portal'
import { PROPOSAL_KINDS } from '@/lib/resources'

interface Opt { value: string; label: string; sub?: string; dvt?: string }
interface Line { id_vat_tu: string | null; id_thiet_bi: string | null; ten: string; dvt: string; so_luong: string; don_gia: string; nha_cung_cap: string }
type Row = Record<string, any>

const fold = (v: unknown) => String(v ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/gi, 'd').toLowerCase()
const vnd = (n: number) => new Intl.NumberFormat('vi-VN').format(Math.round(n))
const blank = (): Line => ({ id_vat_tu: null, id_thiet_bi: null, ten: '', dvt: '', so_luong: '1', don_gia: '0', nha_cung_cap: '' })

async function get(url: string) {
  const r = await fetch(url, { cache: 'no-store' }); const j = await r.json().catch(() => null)
  return j?.success ? j : null
}

/** type-ahead picker: click to open, type to filter, arrows + Enter to choose */
function Picker({ options, value, text, onPick, onText, onCreate, placeholder, ariaLabel, invalid }: {
  options: Opt[]; value: string | null; text: string; onPick: (o: Opt | null) => void; onText?: (t: string) => void; onCreate?: (name: string) => void; placeholder: string; ariaLabel: string; invalid?: boolean
}) {
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState('')
  const [hi, setHi] = useState(0)
  const [box, setBox] = useState<{ left: number; width: number; top?: number; bottom?: number; max: number } | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const shown = useMemo(() => {
    const k = fold(q); const list = k ? options.filter((o) => fold(`${o.value} ${o.label} ${o.sub ?? ''}`).includes(k)) : options
    return list.slice(0, 60)
  }, [options, q])
  const label = value ? options.find((o) => o.value === value)?.label ?? text : text
  const canCreate = !!onCreate && q.trim().length > 0
  const choose = (o: Opt) => { onPick(o); setQ(''); setOpen(false) }
  const create = () => { onCreate?.(q.trim()); setQ(''); setOpen(false) }

  // place the list under (or above) the input using the visible viewport, so the phone keyboard never hides it
  useEffect(() => {
    if (!open) return
    const place = () => {
      const el = inputRef.current; if (!el) return
      const r = el.getBoundingClientRect(), vv = window.visualViewport
      const visBottom = (vv ? vv.height + vv.offsetTop : window.innerHeight) - 8, visTop = (vv ? vv.offsetTop : 0) + 8
      const below = visBottom - r.bottom - 4, above = r.top - visTop - 4
      const w = Math.max(r.width, Math.min(320, window.innerWidth - 16)), left = Math.max(8, Math.min(r.left, window.innerWidth - w - 8))
      if (below >= 150 || below >= above) setBox({ left, width: w, top: r.bottom + 4, max: Math.max(100, Math.min(260, below)) })
      else setBox({ left, width: w, bottom: window.innerHeight - r.top + 4, max: Math.max(100, Math.min(260, above)) })
    }
    place()
    const vv = window.visualViewport
    window.addEventListener('scroll', place, true); window.addEventListener('resize', place); vv?.addEventListener('resize', place); vv?.addEventListener('scroll', place)
    return () => { window.removeEventListener('scroll', place, true); window.removeEventListener('resize', place); vv?.removeEventListener('resize', place); vv?.removeEventListener('scroll', place) }
  }, [open, shown.length])

  return (
    <div className="relative">
      <input ref={inputRef} aria-label={ariaLabel} className={`input w-full ${invalid ? '!border-red-400' : ''}`} placeholder={placeholder} value={open ? q : label} autoComplete="off"
        onFocus={() => { setQ(onText ? label : ''); setOpen(true); setHi(0); setTimeout(() => inputRef.current?.scrollIntoView({ block: 'center', behavior: 'smooth' }), 250) }}
        onChange={(e) => { setQ(e.target.value); setOpen(true); setHi(0); if (onText) { onText(e.target.value); if (value) onPick(null) } }}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        onKeyDown={(e) => {
          if (e.key === 'ArrowDown') { e.preventDefault(); setHi((h) => Math.min(shown.length - 1 + (canCreate ? 1 : 0), h + 1)) }
          else if (e.key === 'ArrowUp') { e.preventDefault(); setHi((h) => Math.max(0, h - 1)) }
          else if (e.key === 'Enter' && open && shown[hi]) { e.preventDefault(); choose(shown[hi]) }
          else if (e.key === 'Enter' && open && canCreate && hi === shown.length) { e.preventDefault(); create() }
          else if (e.key === 'Escape' && open) { e.stopPropagation(); setOpen(false) }
        }} />
      {open && box && (
        <Portal>
          <ul role="listbox" className="fixed z-[120] overflow-y-auto overscroll-contain rounded-xl border border-navy-200 bg-white py-1 shadow-pop"
            style={{ left: box.left, width: box.width, top: box.top, bottom: box.bottom, maxHeight: box.max }}>
            {shown.map((o, i) => (
              <li key={o.value} role="option" aria-selected={i === hi} onPointerDown={(e) => { e.preventDefault(); choose(o) }} onMouseEnter={() => setHi(i)}
                className={`cursor-pointer px-3 py-2 text-[14px] ${i === hi ? 'bg-blue-50' : ''}`}>
                <div className="font-semibold text-navy-900">{o.label}</div>{o.sub && <div className="text-[12px] text-ink-mute">{o.sub}</div>}
              </li>
            ))}
            {shown.length === 0 && !canCreate && <li className="px-3 py-3 text-sm text-ink-mute">Không có mục nào{options.length === 0 ? ' (đang tải…)' : ''}</li>}
            {canCreate && (
              <li role="option" aria-selected={hi === shown.length} onPointerDown={(e) => { e.preventDefault(); create() }} onMouseEnter={() => setHi(shown.length)}
                className={`cursor-pointer border-t border-navy-100 px-3 py-2 text-[14px] font-bold text-blue-700 ${hi === shown.length ? 'bg-blue-50' : ''}`}>
                + Thêm vật tư “{q.trim()}” vào danh mục{shown.length === 0 ? ' (chưa có trong kho)' : ''}
              </li>
            )}
          </ul>
        </Portal>
      )}
    </div>
  )
}

export default function ProposalForm({ kind: kindIn, row, onClose, onSaved }: { kind?: string; row?: Row | null; onClose: () => void; onSaved: (id: string) => void }) {
  const isEdit = !!row?.id
  const [kind, setKind] = useState(row?.loai_de_xuat ?? kindIn ?? 'MUA_VAT_TU')
  const [date, setDate] = useState<string>(row?.ngay_de_xuat ?? new Date(Date.now() + 7 * 36e5).toISOString().slice(0, 10))
  const [who, setWho] = useState<string>(row?.id_nguoi_de_xuat ?? '')
  const [purpose, setPurpose] = useState<string>(row?.muc_dich_ly_do ?? '')
  const [note, setNote] = useState<string>(row?.ghi_chu ?? '')
  const [lines, setLines] = useState<Line[]>([blank()])
  const [staff, setStaff] = useState<(Opt & { phong_ban?: string })[]>([])
  const [items, setItems] = useState<Opt[]>([])
  const [devices, setDevices] = useState<Opt[]>([])
  const [busy, setBusy] = useState(false)
  const [loading, setLoading] = useState(isEdit)
  const [error, setError] = useState('')
  const bodyRef = useRef<HTMLDivElement>(null)
  const [fresh, setFresh] = useState<null | { line: number; ten: string; dvt: string; nhom: string; busy: boolean; err: string }>(null)

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    const k = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', k)
    return () => { window.removeEventListener('keydown', k); document.body.style.overflow = '' }
  }, [onClose])

  useEffect(() => {
    let dead = false
    ;(async () => {
      const [nv, vt, tb] = await Promise.all([get('/api/nhan_vien?pageSize=1000'), get('/api/vat_tu?pageSize=2000'), get('/api/thiet_bi?pageSize=1500')])
      if (dead) return
      if (nv) setStaff((nv.data as Row[]).map((r) => ({ value: r.id, label: r.ho_ten, sub: [r.phong_ban, r.chuc_vu, r.trang_thai === 'Ngưng hoạt động' ? 'ngưng hoạt động' : ''].filter(Boolean).join(' · '), phong_ban: r.phong_ban })))
      else { const o = await get('/api/nhan_vien?options=1'); if (o && !dead) setStaff(o.data) }
      if (vt) setItems((vt.data as Row[]).map((r) => ({ value: r.id, label: r.ten_vat_tu, dvt: r.dvt ?? '', sub: `${r.id}${r.dvt ? ` · ${r.dvt}` : ''}${r.ton_hien_tai != null ? ` · tồn ${r.ton_hien_tai}` : ''}` })))
      else { const o = await get('/api/vat_tu?options=1'); if (o && !dead) setItems(o.data) }
      if (tb) setDevices((tb.data as Row[]).map((r) => ({ value: r.id, label: r.ten_thiet_bi, sub: `${r.id}${r.serial ? ` · ${r.serial}` : ''}` })))
      else { const o = await get('/api/thiet_bi?options=1'); if (o && !dead) setDevices(o.data) }
    })()
    return () => { dead = true }
  }, [])

  useEffect(() => {
    if (!isEdit) return
    let dead = false
    get(`/api/de_xuat_chi_tiet?id_de_xuat=${encodeURIComponent(row!.id)}&pageSize=200`).then((j) => {
      if (dead) return
      const ls = (j?.data ?? []) as Row[]
      setLines(ls.length ? ls.map((l) => ({ id_vat_tu: l.id_vat_tu ?? null, id_thiet_bi: l.id_thiet_bi ?? null, ten: l.ten ?? '', dvt: l.dvt ?? '', so_luong: String(l.so_luong ?? 1), don_gia: String(l.don_gia ?? 0), nha_cung_cap: l.nha_cung_cap ?? '' })) : [blank()])
      setLoading(false)
    })
    return () => { dead = true }
  }, [isEdit, row])

  const dept = staff.find((s) => s.value === who)?.phong_ban ?? ''
  const total = lines.reduce((a, l) => a + (Number(l.so_luong) || 0) * (Number(l.don_gia) || 0), 0)
  const word = kind === 'MUA_VAT_TU' ? 'vật tư' : 'thiết bị'
  const title = `${isEdit ? 'Sửa' : 'Thêm'} đề xuất ${(PROPOSAL_KINDS[kind] ?? '').toLowerCase()}`
  const upd = (i: number, p: Partial<Line>) => setLines((ls) => ls.map((l, x) => (x === i ? { ...l, ...p } : l)))
  const addLine = () => { setLines((ls) => [...ls, blank()]); setTimeout(() => bodyRef.current?.scrollTo({ top: 99999, behavior: 'smooth' }), 50) }

  const lineTotal = (l: Line) => (Number(l.so_luong) || 0) * (Number(l.don_gia) || 0)
  const itemInput = (l: Line, i: number) => (<>
    {kind === 'MUA_VAT_TU'
      ? <Picker options={items} value={l.id_vat_tu} text={l.ten} onPick={(o) => upd(i, o ? { id_vat_tu: o.value, ten: o.label, dvt: o.dvt ?? '' } : { id_vat_tu: null })} onCreate={(t) => openNew(i, t)} placeholder="Chọn vật tư trong danh mục kho…" ariaLabel={`Vật tư dòng ${i + 1}`} />
      : kind === 'MUA_THIET_BI'
        ? <input className="input" aria-label={`Thiết bị dòng ${i + 1}`} placeholder="Tên thiết bị cần mua…" value={l.ten} onChange={(e) => upd(i, { ten: e.target.value })} />
        : <Picker options={devices} value={l.id_thiet_bi} text={l.ten} onPick={(o) => upd(i, o ? { id_thiet_bi: o.value, ten: o.label } : { id_thiet_bi: null })} onText={(t) => upd(i, { ten: t })} placeholder="Gõ mã hoặc tên thiết bị…" ariaLabel={`Thiết bị dòng ${i + 1}`} />}
    {l.dvt && kind === 'MUA_VAT_TU' && <div className="mt-0.5 text-[11.5px] text-ink-mute">ĐVT: {l.dvt}</div>}
  </>)
  const nccInput = (l: Line, i: number) => <input className="input" aria-label={`Nhà cung cấp dòng ${i + 1}`} value={l.nha_cung_cap} onChange={(e) => upd(i, { nha_cung_cap: e.target.value })} />
  const qtyInput = (l: Line, i: number) => <input className="input text-center" inputMode="decimal" aria-label={`Số lượng dòng ${i + 1}`} value={l.so_luong} onChange={(e) => upd(i, { so_luong: e.target.value.replace(',', '.') })} />
  const priceInput = (l: Line, i: number) => <input className="input text-right" inputMode="numeric" aria-label={`Đơn giá dòng ${i + 1}`} value={l.don_gia} onChange={(e) => upd(i, { don_gia: e.target.value.replace(/[^\d.]/g, '') })} />
  const delBtn = (i: number) => <button type="button" aria-label={`Xóa dòng ${i + 1}`} onClick={() => setLines((ls) => (ls.length > 1 ? ls.filter((_, x) => x !== i) : [blank()]))} className="grid h-9 w-9 place-items-center rounded-lg border border-red-200 text-red-600 hover:bg-red-50"><X className="h-4 w-4" /></button>
  const openNew = (line: number, ten = '') => setFresh({ line, ten, dvt: '', nhom: '', busy: false, err: '' })
  const saveNew = async () => {
    if (!fresh) return
    const name = fresh.ten.trim(), dvt = fresh.dvt.trim()
    if (!name) return setFresh({ ...fresh, err: 'Nhập tên vật tư' })
    if (!dvt) return setFresh({ ...fresh, err: 'Nhập đơn vị tính' })
    const dup = items.find((o) => fold(o.label) === fold(name))
    const apply = (o: Opt) => {
      setLines((ls) => { const copy = [...ls]; const at = fresh.line >= 0 && fresh.line < copy.length ? fresh.line : copy.findIndex((l) => !l.id_vat_tu && !l.ten.trim()); const row = { ...blank(), id_vat_tu: o.value, ten: o.label, dvt: o.dvt ?? '' }
        if (at >= 0) copy[at] = { ...copy[at], id_vat_tu: o.value, ten: o.label, dvt: o.dvt ?? '' }; else copy.push(row); return copy })
      setFresh(null)
    }
    if (dup) return apply(dup) // already in the catalogue: just select it
    setFresh({ ...fresh, busy: true, err: '' })
    try {
      const r = await fetch('/api/vat_tu', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ten_vat_tu: name, dvt, nhom: fresh.nhom.trim() || undefined, ton_dau: 0, trang_thai: 'Hoạt động' }) })
      const j = await r.json().catch(() => ({ success: false, error: 'Lỗi mạng' }))
      if (!j.success) throw new Error(r.status === 403 ? 'Bạn không có quyền thêm vật tư vào danh mục kho' : j.error || 'Không thêm được vật tư')
      const o: Opt = { value: j.data.id, label: name, dvt, sub: `${j.data.id} · ${dvt} · tồn 0` }
      setItems((list) => [...list, o].sort((a, b) => a.label.localeCompare(b.label, 'vi')))
      apply(o)
    } catch (e: any) { setFresh((f) => (f ? { ...f, busy: false, err: e.message } : f)) }
  }

  const save = async () => {
    setError('')
    if (!who) return setError('Chọn người đề xuất')
    const clean = lines.filter((l) => l.id_vat_tu || l.id_thiet_bi || l.ten.trim())
    if (!clean.length) return setError(`Thêm ít nhất một ${word}`)
    if (kind === 'MUA_VAT_TU' && clean.some((l) => !l.id_vat_tu)) return setError('Mỗi dòng phải chọn vật tư trong danh mục kho')
    setBusy(true)
    try {
      const r = await fetch('/api/de_xuat/luu', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({
        id: isEdit ? row!.id : undefined, loai_de_xuat: kind, ngay_de_xuat: date, id_nguoi_de_xuat: who, muc_dich_ly_do: purpose, ghi_chu: note,
        lines: clean.map((l) => ({ ...l, so_luong: Number(l.so_luong), don_gia: Number(l.don_gia || 0) })),
      }) })
      const j = await r.json().catch(() => ({ success: false, error: 'Lỗi mạng' }))
      if (!j.success) throw new Error(j.error || 'Không lưu được')
      onSaved(j.data.id)
    } catch (e: any) { setError(e.message); setBusy(false) }
  }

  return (
    <Portal>
      <div className="fixed inset-0 z-[90] flex items-center justify-center p-3 sm:p-6 print:hidden" role="dialog" aria-modal="true" aria-label={title}>
        <div className="pl-fade absolute inset-0 bg-navy-950/50" onClick={onClose} />
        <div className="pl-sheet relative flex max-h-[92dvh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-pop">
          <div className="flex items-center gap-3 bg-blue-700 px-4 py-3 text-white lg:px-5">
            <div className="min-w-0 flex-1"><h2 className="truncate text-[17px] font-extrabold">{title}</h2>{isEdit && <div className="text-xs opacity-80">{row!.id}</div>}</div>
            <button onClick={onClose} aria-label="Đóng" className="grid h-9 w-9 place-items-center rounded-full bg-white/15 hover:bg-white/25"><X className="h-5 w-5" /></button>
          </div>

          <div ref={bodyRef} className="min-h-0 flex-1 overflow-y-auto px-4 py-3 lg:px-5">
            <p className="mb-3 rounded-lg border border-navy-200 border-l-4 border-l-[#e11d2e] bg-navy-50 px-3 py-2 text-[13px] text-ink-soft">Phòng ban tự lấy theo người đề xuất. Có thể thêm nhiều {word} trong cùng một đề xuất.</p>

            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              <label className="block"><span className="label">Ngày lập</span><input type="date" className="input" value={date} onChange={(e) => setDate(e.target.value)} /></label>
              <div className="col-span-2 lg:col-span-1"><span className="label">Người đề xuất <b className="text-red-500">*</b></span>
                <Picker options={staff} value={who || null} text="" onPick={(o) => setWho(o?.value ?? '')} placeholder="Bấm để chọn hoặc gõ để tìm…" ariaLabel="Người đề xuất" invalid={!who && !!error} /></div>
              <label className="block"><span className="label">Phòng ban</span><input className="input bg-navy-50" value={dept} readOnly tabIndex={-1} aria-label="Phòng ban" /></label>
              {kindIn && !isEdit ? <label className="block"><span className="label">Trạng thái</span><input className="input bg-navy-50" value="Chờ duyệt" readOnly tabIndex={-1} /></label>
                : <label className="block"><span className="label">{isEdit ? 'Trạng thái' : 'Loại đề xuất'}</span>
                  {isEdit ? <input className="input bg-navy-50" value={row!.trang_thai ?? 'Chờ duyệt'} readOnly tabIndex={-1} />
                    : <select className="input" value={kind} onChange={(e) => { setKind(e.target.value); setLines([blank()]) }}>{Object.entries(PROPOSAL_KINDS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>}</label>}
              <label className="col-span-2 block"><span className="label">Mục đích / lý do</span><textarea className="input" rows={2} value={purpose} onChange={(e) => setPurpose(e.target.value)} maxLength={1000} /></label>
              <label className="col-span-2 block"><span className="label">Ghi chú</span><textarea className="input" rows={2} value={note} onChange={(e) => setNote(e.target.value)} maxLength={1000} /></label>
            </div>

            <div className="mt-4 flex items-center gap-2"><h3 className="text-[15px] font-extrabold text-navy-900">Danh sách {word}</h3><span className="h-px flex-1 bg-navy-200" /></div>
            {loading ? <p className="py-8 text-center text-sm text-ink-mute"><Loader2 className="mr-1 inline h-4 w-4 animate-spin" />Đang tải các dòng…</p> : (<>
              {/* phone / narrow: one card per line, nothing scrolls sideways */}
              <div className="mt-2 space-y-2.5 md:hidden">
                {lines.map((l, i) => (
                  <div key={i} className="rounded-xl border border-navy-200 bg-white p-3">
                    <div className="mb-2 flex items-center gap-2"><b className="flex-1 text-[13px] text-navy-900">{kind === 'MUA_VAT_TU' ? 'Vật tư' : 'Thiết bị'} {i + 1}</b>{delBtn(i)}</div>
                    {itemInput(l, i)}
                    {kind === 'MUA_THIET_BI' && <label className="mt-2 block"><span className="label">Nhà cung cấp</span>{nccInput(l, i)}</label>}
                    <div className="mt-2 grid grid-cols-3 gap-2">
                      <label className="block"><span className="label">Số lượng</span>{qtyInput(l, i)}</label>
                      <label className="block"><span className="label">Đơn giá</span>{priceInput(l, i)}</label>
                      <div><span className="label">Thành tiền</span><div className="flex h-9 items-center justify-end text-[13px] font-extrabold tabular-nums text-navy-900">{vnd(lineTotal(l))}</div></div>
                    </div>
                  </div>
                ))}
              </div>
              {/* tablet / desktop: the V191 table */}
              <div className="mt-2 hidden rounded-xl border border-navy-200 md:block">
                <table className="w-full border-separate border-spacing-0 text-[13px]">
                  <thead className="bg-navy-100 text-[12.5px] font-extrabold text-navy-800">
                    <tr><th className="w-12 rounded-tl-xl px-2 py-2">STT</th><th className="px-2 py-2 text-left">{kind === 'MUA_VAT_TU' ? 'Vật tư' : 'Thiết bị'}</th>
                      {kind === 'MUA_THIET_BI' && <th className="w-[150px] px-2 py-2 text-left">Nhà cung cấp</th>}
                      <th className="w-[92px] px-2 py-2">Số lượng</th><th className="w-[120px] px-2 py-2 text-right">Đơn giá</th><th className="w-[120px] px-2 py-2 text-right">Thành tiền</th><th className="w-14 rounded-tr-xl px-2 py-2">Xóa</th></tr>
                  </thead>
                  <tbody>
                    {lines.map((l, i) => (
                      <tr key={i}>
                        <td className="border-t border-navy-100 px-2 py-2 text-center font-semibold">{i + 1}</td>
                        <td className="border-t border-navy-100 px-2 py-2">{itemInput(l, i)}</td>
                        {kind === 'MUA_THIET_BI' && <td className="border-t border-navy-100 px-2 py-2">{nccInput(l, i)}</td>}
                        <td className="border-t border-navy-100 px-2 py-2">{qtyInput(l, i)}</td>
                        <td className="border-t border-navy-100 px-2 py-2">{priceInput(l, i)}</td>
                        <td className="border-t border-navy-100 px-2 py-2 text-right font-bold tabular-nums">{vnd(lineTotal(l))} đ</td>
                        <td className="border-t border-navy-100 px-2 py-2 text-center">{delBtn(i)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>)}
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <button type="button" className="btn-secondary" onClick={addLine}><Plus className="h-4 w-4" />Thêm {word}</button>
              {kind === 'MUA_VAT_TU' && <button type="button" className="btn-secondary !border-blue-300 !text-blue-700" onClick={() => openNew(-1)} title="Vật tư chưa có trong danh mục kho"><Plus className="h-4 w-4" />Vật tư mới (chưa có trong kho)</button>}
              <span className="ml-auto text-[14px] text-ink-soft">Tổng cộng: <b className="text-[18px] text-[#e11d2e] tabular-nums">{vnd(total)} đ</b></span>
            </div>
            {error && <p role="alert" className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">{error}</p>}
          </div>

          <div className="flex justify-end gap-2 border-t border-navy-200 bg-navy-50 px-4 py-2.5 lg:px-5 lg:py-3">
            <button type="button" className="btn-secondary h-11 flex-1 sm:flex-none lg:h-9" onClick={onClose}>Hủy</button>
            <button type="button" className="btn-primary h-11 flex-1 sm:min-w-[110px] sm:flex-none lg:h-9" disabled={busy || loading} onClick={save}>{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Lưu & đóng'}</button>
          </div>
        </div>
      </div>
      {fresh && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3" role="dialog" aria-modal="true" aria-label="Thêm vật tư mới vào danh mục">
          <div className="absolute inset-0 bg-navy-950/50" onClick={() => setFresh(null)} />
          <div className="relative w-full max-w-md rounded-2xl bg-white p-5 shadow-pop">
            <div className="mb-3 flex items-center"><h2 className="flex-1 text-[17px] font-extrabold text-navy-900">Thêm vật tư vào danh mục</h2>
              <button onClick={() => setFresh(null)} aria-label="Đóng" className="grid h-9 w-9 place-items-center rounded-full bg-navy-100"><X className="h-4 w-4" /></button></div>
            <p className="mb-3 text-[12.5px] text-ink-mute">Vật tư mới được thêm vào Kho vật tư với tồn 0; khi đề xuất được duyệt sẽ tự nhập kho.</p>
            <label className="mb-3 block"><span className="label">Tên vật tư <b className="text-red-500">*</b></span><input className="input" autoFocus value={fresh.ten} maxLength={150} onChange={(e) => setFresh({ ...fresh, ten: e.target.value })} /></label>
            <div className="mb-3 grid grid-cols-2 gap-3">
              <label className="block"><span className="label">Đơn vị tính <b className="text-red-500">*</b></span><input className="input" placeholder="Cái, Cuộn, Mét…" value={fresh.dvt} maxLength={30} onChange={(e) => setFresh({ ...fresh, dvt: e.target.value })} /></label>
              <label className="block"><span className="label">Nhóm</span><input className="input" placeholder="Điện, Nước, PCCC…" value={fresh.nhom} maxLength={60} onChange={(e) => setFresh({ ...fresh, nhom: e.target.value })} /></label>
            </div>
            {fresh.err && <p role="alert" className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">{fresh.err}</p>}
            <div className="flex justify-end gap-2"><button className="btn-secondary" onClick={() => setFresh(null)}>Hủy</button><button className="btn-primary" disabled={fresh.busy} onClick={saveNew}>{fresh.busy ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Thêm vào danh mục'}</button></div>
          </div>
        </div>
      )}
    </Portal>
  )
}
