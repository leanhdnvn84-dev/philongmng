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
function Picker({ options, value, text, onPick, onText, placeholder, ariaLabel, invalid }: {
  options: Opt[]; value: string | null; text: string; onPick: (o: Opt | null) => void; onText?: (t: string) => void; placeholder: string; ariaLabel: string; invalid?: boolean
}) {
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState('')
  const [hi, setHi] = useState(0)
  const shown = useMemo(() => {
    const k = fold(q); const list = k ? options.filter((o) => fold(`${o.value} ${o.label} ${o.sub ?? ''}`).includes(k)) : options
    return list.slice(0, 8)
  }, [options, q])
  const label = value ? options.find((o) => o.value === value)?.label ?? text : text
  const choose = (o: Opt) => { onPick(o); setQ(''); setOpen(false) }
  return (
    <div className="relative">
      <input aria-label={ariaLabel} className={`input w-full ${invalid ? '!border-red-400' : ''}`} placeholder={placeholder} value={open ? q : label}
        onFocus={() => { setQ(onText ? label : ''); setOpen(true); setHi(0) }}
        onChange={(e) => { setQ(e.target.value); setOpen(true); setHi(0); if (onText) { onText(e.target.value); if (value) onPick(null) } }}
        onBlur={() => setTimeout(() => setOpen(false), 120)}
        onKeyDown={(e) => {
          if (e.key === 'ArrowDown') { e.preventDefault(); setHi((h) => Math.min(shown.length - 1, h + 1)) }
          else if (e.key === 'ArrowUp') { e.preventDefault(); setHi((h) => Math.max(0, h - 1)) }
          else if (e.key === 'Enter' && open && shown[hi]) { e.preventDefault(); choose(shown[hi]) }
          else if (e.key === 'Escape' && open) { e.stopPropagation(); setOpen(false) }
        }} />
      {open && shown.length > 0 && (
        <ul role="listbox" className="absolute left-0 top-full z-20 mt-1 max-h-56 w-full min-w-[220px] overflow-y-auto rounded-lg border border-navy-200 bg-white py-1 shadow-pop">
          {shown.map((o, i) => (
            <li key={o.value} role="option" aria-selected={i === hi} onMouseDown={(e) => { e.preventDefault(); choose(o) }} onMouseEnter={() => setHi(i)}
              className={`cursor-pointer px-3 py-1.5 text-[13px] ${i === hi ? 'bg-blue-50' : ''}`}>
              <div className="font-semibold text-navy-900">{o.label}</div>{o.sub && <div className="text-[11.5px] text-ink-mute">{o.sub}</div>}
            </li>
          ))}
        </ul>
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
      if (nv) setStaff((nv.data as Row[]).filter((r) => r.trang_thai !== 'Ngưng hoạt động').map((r) => ({ value: r.id, label: r.ho_ten, sub: [r.phong_ban, r.chuc_vu].filter(Boolean).join(' · '), phong_ban: r.phong_ban })))
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
            {loading ? <p className="py-8 text-center text-sm text-ink-mute"><Loader2 className="mr-1 inline h-4 w-4 animate-spin" />Đang tải các dòng…</p> : (
              <div className="mt-2 overflow-x-auto rounded-xl border border-navy-200">
                <table className="w-full min-w-[640px] border-separate border-spacing-0 text-[13px]">
                  <thead className="bg-navy-100 text-[12.5px] font-extrabold text-navy-800">
                    <tr><th className="w-12 px-2 py-2">STT</th><th className="px-2 py-2 text-left">{kind === 'MUA_VAT_TU' ? 'Vật tư' : 'Thiết bị'}</th>
                      {kind === 'MUA_THIET_BI' && <th className="w-[150px] px-2 py-2 text-left">Nhà cung cấp</th>}
                      <th className="w-[92px] px-2 py-2">Số lượng</th><th className="w-[120px] px-2 py-2 text-right">Đơn giá</th><th className="w-[120px] px-2 py-2 text-right">Thành tiền</th><th className="w-14 px-2 py-2">Xóa</th></tr>
                  </thead>
                  <tbody>
                    {lines.map((l, i) => (
                      <tr key={i}>
                        <td className="border-t border-navy-100 px-2 py-2 text-center font-semibold">{i + 1}</td>
                        <td className="border-t border-navy-100 px-2 py-2">
                          {kind === 'MUA_VAT_TU'
                            ? <Picker options={items} value={l.id_vat_tu} text={l.ten} onPick={(o) => upd(i, o ? { id_vat_tu: o.value, ten: o.label, dvt: o.dvt ?? '' } : { id_vat_tu: null })} placeholder="Gõ mã hoặc tên vật tư…" ariaLabel={`Vật tư dòng ${i + 1}`} />
                            : kind === 'MUA_THIET_BI'
                              ? <input className="input" aria-label={`Thiết bị dòng ${i + 1}`} placeholder="Tên thiết bị cần mua…" value={l.ten} onChange={(e) => upd(i, { ten: e.target.value })} />
                              : <Picker options={devices} value={l.id_thiet_bi} text={l.ten} onPick={(o) => upd(i, o ? { id_thiet_bi: o.value, ten: o.label } : { id_thiet_bi: null })} onText={(t) => upd(i, { ten: t })} placeholder="Gõ mã hoặc tên thiết bị…" ariaLabel={`Thiết bị dòng ${i + 1}`} />}
                          {l.dvt && kind === 'MUA_VAT_TU' && <div className="mt-0.5 text-[11.5px] text-ink-mute">ĐVT: {l.dvt}</div>}
                        </td>
                        {kind === 'MUA_THIET_BI' && <td className="border-t border-navy-100 px-2 py-2"><input className="input" aria-label={`Nhà cung cấp dòng ${i + 1}`} value={l.nha_cung_cap} onChange={(e) => upd(i, { nha_cung_cap: e.target.value })} /></td>}
                        <td className="border-t border-navy-100 px-2 py-2"><input className="input text-center" inputMode="decimal" aria-label={`Số lượng dòng ${i + 1}`} value={l.so_luong} onChange={(e) => upd(i, { so_luong: e.target.value.replace(',', '.') })} /></td>
                        <td className="border-t border-navy-100 px-2 py-2"><input className="input text-right" inputMode="numeric" aria-label={`Đơn giá dòng ${i + 1}`} value={l.don_gia} onChange={(e) => upd(i, { don_gia: e.target.value.replace(/[^\d.]/g, '') })} /></td>
                        <td className="border-t border-navy-100 px-2 py-2 text-right font-bold tabular-nums">{vnd((Number(l.so_luong) || 0) * (Number(l.don_gia) || 0))} đ</td>
                        <td className="border-t border-navy-100 px-2 py-2 text-center"><button type="button" aria-label={`Xóa dòng ${i + 1}`} onClick={() => setLines((ls) => (ls.length > 1 ? ls.filter((_, x) => x !== i) : [blank()]))} className="grid h-9 w-9 place-items-center rounded-lg border border-red-200 text-red-600 hover:bg-red-50"><X className="h-4 w-4" /></button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <button type="button" className="btn-secondary" onClick={addLine}><Plus className="h-4 w-4" />Thêm {word}</button>
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
    </Portal>
  )
}
