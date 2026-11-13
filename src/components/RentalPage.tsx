'use client'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Building2, DoorOpen, Handshake, CalendarClock, Pencil, Plus, RotateCw, UserRound, History, X, Loader2, Search, Trash2 } from 'lucide-react'
import Portal from '@/components/Portal'
import Attachments from '@/components/Attachments'
import { useConfirm } from '@/components/ConfirmDialog'

/** "Mặt bằng cho thuê": buildings, floors, tenants and leases on one screen (one row per floor, one line per tenant on it). */
type Building = { id: string; ten_toa_nha: string; dia_chi_toa_nha: string | null }
type Floor = { id: string; id_toa_nha: string | null; ten_tang: string; ma_tang_khu_vuc: string | null; dien_tich: number | null; trang_thai_su_dung: string | null; bao_gia: string | null; ghi_chu: string | null }
type Tenant = { id: string; ten_khach_thue: string; nguoi_lien_he: string | null; dien_thoai: string | null; email: string | null; dia_chi: string | null; ma_so_thue: string | null; trang_thai: string | null; ghi_chu: string | null }
type Lease = { id: string; id_tang: string; id_khach_thue: string; ngay_bat_dau: string | null; ngay_ket_thuc: string | null; dien_tich: number | null; gia_thue: string | null; trang_thai: string; ngay_tra: string | null; ghi_chu: string | null }
type Perms = { floor: boolean; floorAdd: boolean; lease: boolean; tenantAdd: boolean; admin: boolean }
type Modal = null | { kind: 'thue'; floor: Floor } | { kind: 'tra' | 'gia_han' | 'sua_thue'; lease: Lease } | { kind: 'tang'; floor: Floor | null } | { kind: 'khach'; tenant: Tenant } | { kind: 'lich_su'; floor: Floor }

const ACTIVE = 'Đang thuê'
const dmy = (iso?: string | null) => (iso ? `${iso.slice(8, 10)}/${iso.slice(5, 7)}/${iso.slice(0, 4)}` : '—')
const num = (n: number | null | undefined) => (n == null ? '—' : new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 1 }).format(Number(n)))
const days = (to: string | null, today: string) => (to ? Math.round((Date.parse(to) - Date.parse(today)) / 864e5) : null)
const PILL: Record<string, string> = { 'Đang thuê': 'pill-green', 'Trống': 'pill-blue', 'Giữ chỗ': 'pill-amber', 'Không cho thuê': 'pill bg-navy-100 text-navy-700' }
const natural = (a: string, b: string) => a.localeCompare(b, 'vi', { numeric: true })

export default function RentalPage() {
  const [d, setD] = useState<{ buildings: Building[]; floors: Floor[]; tenants: Tenant[]; leases: Lease[]; today: string; perms: Perms } | null>(null)
  const [loading, setLoading] = useState(true)
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)
  const [fBuilding, setFBuilding] = useState(''), [fState, setFState] = useState(''), [q, setQ] = useState('')
  const [sel, setSel] = useState<{ floor: string; lease: string | null } | null>(null)
  const [modal, setModal] = useState<Modal>(null)
  const [form, setForm] = useState<Record<string, string>>({})
  const [busy, setBusy] = useState(false)
  const [confirm, dialog] = useConfirm()

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const j = await fetch('/api/mat_bang').then((r) => r.json())
      if (!j?.success) throw new Error(j?.error || 'Không tải được')
      setD(j)
    } catch (e: any) { setMsg({ ok: false, text: e.message }) } finally { setLoading(false) }
  }, [])
  useEffect(() => { load() }, [load])
  useEffect(() => { if (msg?.ok) { const t = setTimeout(() => setMsg(null), 4000); return () => clearTimeout(t) } }, [msg])

  const today = d?.today ?? ''
  const tenantOf = useMemo(() => new Map((d?.tenants ?? []).map((t) => [t.id, t])), [d])
  const buildingOf = useMemo(() => new Map((d?.buildings ?? []).map((b) => [b.id, b])), [d])
  const active = useMemo(() => (d?.leases ?? []).filter((l) => l.trang_thai === ACTIVE), [d])
  const stateOf = useCallback((f: Floor) => (active.some((l) => l.id_tang === f.id) ? ACTIVE : f.trang_thai_su_dung === ACTIVE ? 'Trống' : f.trang_thai_su_dung || 'Trống'), [active])
  const alertOf = (l: Lease) => { const n = days(l.ngay_ket_thuc, today); return n == null ? null : n < 0 ? { t: `Quá hạn ${-n} ngày`, c: 'text-[#c4121f]' } : n <= 60 ? { t: `Còn ${n} ngày`, c: 'text-amber-700' } : { t: `Còn ${n} ngày`, c: 'text-ink-mute' } }

  const stats = useMemo(() => {
    const fs = d?.floors ?? [], rentable = fs.filter((f) => stateOf(f) !== 'Không cho thuê')
    const rented = rentable.filter((f) => stateOf(f) === ACTIVE).length
    const soon = active.filter((l) => { const n = days(l.ngay_ket_thuc, today); return n != null && n <= 60 }).length
    return { total: fs.length, rented, empty: rentable.filter((f) => stateOf(f) === 'Trống').length, hold: fs.filter((f) => stateOf(f) === 'Giữ chỗ').length, rate: rentable.length ? Math.round((rented / rentable.length) * 100) : 0, soon, tenants: new Set(active.map((l) => l.id_khach_thue)).size }
  }, [d, active, stateOf, today])

  const groups = useMemo(() => {
    const term = q.trim().toLowerCase()
    const fs = (d?.floors ?? []).filter((f) => {
      const ls = active.filter((l) => l.id_tang === f.id)
      if (fBuilding && (f.id_toa_nha ?? '__none') !== fBuilding) return false
      if (fState === '__soon') { if (!ls.some((l) => { const n = days(l.ngay_ket_thuc, today); return n != null && n <= 60 })) return false } else if (fState && stateOf(f) !== fState) return false
      if (term && ![f.ten_tang, f.ma_tang_khu_vuc, ...ls.flatMap((l) => { const t = tenantOf.get(l.id_khach_thue); return [t?.ten_khach_thue, t?.nguoi_lien_he, t?.dien_thoai] })].some((v) => String(v ?? '').toLowerCase().includes(term))) return false
      return true
    })
    const m = new Map<string, Floor[]>()
    for (const f of fs) { const k = f.id_toa_nha ?? '__none'; m.set(k, [...(m.get(k) ?? []), f]) }
    return [...m.entries()].map(([k, list]) => ({ id: k, name: buildingOf.get(k)?.ten_toa_nha ?? 'Chưa gắn tòa nhà', address: buildingOf.get(k)?.dia_chi_toa_nha ?? '', floors: list.sort((a, b) => natural(a.ten_tang, b.ten_tang)) }))
      .sort((a, b) => (a.id === '__none' ? 1 : b.id === '__none' ? -1 : natural(a.name, b.name)))
  }, [d, active, fBuilding, fState, q, stateOf, tenantOf, buildingOf, today])

  const selFloor = d?.floors.find((f) => f.id === sel?.floor) ?? null
  const selLease = active.find((l) => l.id === sel?.lease) ?? (selFloor && active.filter((l) => l.id_tang === selFloor.id).length === 1 ? active.find((l) => l.id_tang === selFloor.id)! : null)
  const open = (m: Modal, init: Record<string, string> = {}) => { setForm(init); setModal(m) }
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setForm((s) => ({ ...s, [k]: e.target.value }))

  async function post(body: Record<string, unknown>) {
    setBusy(true); setMsg(null)
    try {
      const j = await fetch('/api/mat_bang', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }).then((r) => r.json())
      if (!j?.success) throw new Error(j?.error || 'Có lỗi xảy ra')
      setModal(null); setMsg({ ok: true, text: j.message ?? 'Đã lưu' }); await load()
    } catch (e: any) { setMsg({ ok: false, text: e.message }) } finally { setBusy(false) }
  }
  const submit = () => {
    if (!modal) return
    if (modal.kind === 'thue') return post({ op: 'thue', id_tang: modal.floor.id, ...form })
    if (modal.kind === 'tra') return post({ op: 'tra', id: modal.lease.id, ...form })
    if (modal.kind === 'gia_han') return post({ op: 'gia_han', id: modal.lease.id, ...form })
    if (modal.kind === 'sua_thue') return post({ op: 'sua_thue', id: modal.lease.id, ...form })
    if (modal.kind === 'tang') return post({ op: modal.floor ? 'sua_tang' : 'them_tang', id: modal.floor?.id, ...form })
    if (modal.kind === 'khach') return post({ op: 'sua_khach', id: modal.tenant.id, ...form })
  }
  const leaseInit = (l: Lease) => ({ ngay_bat_dau: l.ngay_bat_dau ?? '', ngay_ket_thuc: l.ngay_ket_thuc ?? '', dien_tich: l.dien_tich == null ? '' : String(l.dien_tich), gia_thue: l.gia_thue ?? '', ghi_chu: l.ghi_chu ?? '' })
  const tenantInit = (t: Tenant) => ({ ten_khach_thue: t.ten_khach_thue, nguoi_lien_he: t.nguoi_lien_he ?? '', dien_thoai: t.dien_thoai ?? '', email: t.email ?? '', dia_chi: t.dia_chi ?? '', ma_so_thue: t.ma_so_thue ?? '', ghi_chu: t.ghi_chu ?? '' })
  const floorInit = (f: Floor | null) => ({ id_toa_nha: f?.id_toa_nha ?? (fBuilding && fBuilding !== '__none' ? fBuilding : d?.buildings[0]?.id ?? ''), ten_tang: f?.ten_tang ?? '', ma_tang_khu_vuc: f?.ma_tang_khu_vuc ?? '', dien_tich: f?.dien_tich == null ? '' : String(f.dien_tich), trang_thai_su_dung: f ? stateOf(f) : 'Trống', bao_gia: f?.bao_gia ?? '', ghi_chu: f?.ghi_chu ?? '' })

  const p = d?.perms
  const tile = 'inline-flex h-[54px] min-w-[76px] flex-col items-center justify-center gap-0.5 rounded-[13px] border border-navy-200 bg-white px-3 text-[12.5px] font-bold text-navy-900 shadow-[0_3px_0_#d5deee] transition hover:-translate-y-px disabled:opacity-40 disabled:hover:translate-y-0'
  const inp = 'input h-10 lg:h-9'
  const F = ({ label, children, full }: { label: string; children: React.ReactNode; full?: boolean }) => <label className={`block ${full ? 'sm:col-span-2' : ''}`}><span className="label !mb-1">{label}</span>{children}</label>

  return (
    <div className="flex flex-1 flex-col lg:min-h-0">
      {dialog}
      <div className="flex shrink-0 flex-wrap items-baseline gap-x-5 gap-y-1 border-b border-navy-200 bg-white px-4 py-2 lg:px-5">
        <span className="text-[12.5px] text-ink-mute">PHI LONG / <b className="text-navy-800">Mặt bằng cho thuê</b></span>
        <h1 className="text-[22px] font-black text-navy-900">Mặt bằng cho thuê</h1>
      </div>

      <div className="flex flex-col gap-3 px-4 py-3 lg:min-h-0 lg:flex-1 lg:px-5">
        <div className="flex flex-wrap items-stretch gap-2">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {p?.lease && <button className={tile} disabled={!selFloor || stateOf(selFloor) === 'Không cho thuê'} onClick={() => selFloor && open({ kind: 'thue', floor: selFloor }, { id_khach_thue: '', ngay_bat_dau: today, dien_tich: selFloor.dien_tich == null ? '' : String(selFloor.dien_tich), gia_thue: selFloor.bao_gia ?? '' })}><Handshake className="h-[18px] w-[18px] text-green-700" />Cho thuê</button>}
            {p?.lease && <button className={tile} disabled={!selLease} onClick={() => selLease && open({ kind: 'gia_han', lease: selLease }, { ngay_ket_thuc: selLease.ngay_ket_thuc ?? '' })}><CalendarClock className="h-[18px] w-[18px] text-blue-700" />Gia hạn</button>}
            {p?.lease && <button className={tile} disabled={!selLease} onClick={() => selLease && open({ kind: 'tra', lease: selLease }, { ngay_tra: today })}><DoorOpen className="h-[18px] w-[18px] text-[#c4121f]" />Trả mặt bằng</button>}
            {p?.lease && <button className={tile} disabled={!selLease} onClick={() => selLease && open({ kind: 'sua_thue', lease: selLease }, leaseInit(selLease))}><Pencil className="h-[18px] w-[18px] text-orange-600" />Sửa thuê</button>}
            <button className={tile} disabled={!selLease} onClick={() => { const t = selLease && tenantOf.get(selLease.id_khach_thue); if (t) open({ kind: 'khach', tenant: t }, tenantInit(t)) }}><UserRound className="h-[18px] w-[18px] text-teal-700" />Hồ sơ khách</button>
            {p?.floor && <button className={tile} disabled={!selFloor} onClick={() => selFloor && open({ kind: 'tang', floor: selFloor }, floorInit(selFloor))}><Building2 className="h-[18px] w-[18px] text-violet-700" />Sửa tầng</button>}
            <button className={tile} disabled={!selFloor} onClick={() => selFloor && open({ kind: 'lich_su', floor: selFloor })}><History className="h-[18px] w-[18px] text-slate-600" />Lịch sử tầng</button>
            {p?.floorAdd && <button className={tile} onClick={() => open({ kind: 'tang', floor: null }, floorInit(null))}><Plus className="h-[18px] w-[18px] text-green-700" />Thêm tầng</button>}
            <button className={tile} onClick={load}><RotateCw className={`h-[18px] w-[18px] text-blue-700 ${loading ? 'animate-spin' : ''}`} />Làm mới</button>
          </div>
          <div className="grid w-full grid-cols-2 gap-2 sm:grid-cols-4 xl:ml-auto xl:w-auto">
            {[['Tầng / khu', String(stats.total), `${stats.tenants} khách đang thuê`, 'border-b-navy-700'], ['Đang thuê', String(stats.rented), `lấp đầy ${stats.rate}%`, 'border-b-green-600'], ['Còn trống', String(stats.empty), stats.hold ? `${stats.hold} giữ chỗ` : 'sẵn sàng cho thuê', 'border-b-blue-600'], ['Sắp / quá hạn', String(stats.soon), 'trong 60 ngày', 'border-b-[#e11d2e]']].map(([l, v, s, c]) => (
              <div key={l} className={`min-w-[128px] rounded-[13px] border border-navy-200 border-b-[3px] bg-white px-3 py-1.5 ${c}`}><div className="text-[11.5px] font-extrabold uppercase text-ink-mute">{l}</div><div className="text-[20px] font-black leading-tight tabular-nums text-navy-900">{v}</div><div className="truncate text-[11.5px] text-ink-mute">{s}</div></div>
            ))}
          </div>
        </div>

        {msg && <p role="status" className={`rounded-[9px] border px-3 py-2 text-[13.5px] font-semibold ${msg.ok ? 'border-green-200 bg-green-50 text-green-800' : 'border-red-200 bg-red-50 text-red-800'}`}>{msg.text}</p>}

        <div className="card flex flex-col overflow-hidden lg:min-h-0 lg:flex-1">
          <div className="flex shrink-0 flex-wrap items-center gap-2 border-b border-navy-100 p-2.5">
            <select className="input h-9 min-w-0 flex-1 sm:w-auto sm:flex-none" value={fBuilding} onChange={(e) => setFBuilding(e.target.value)} aria-label="Tòa nhà"><option value="">Tất cả tòa nhà</option>{d?.buildings.map((b) => <option key={b.id} value={b.id}>{b.ten_toa_nha}</option>)}<option value="__none">Chưa gắn tòa nhà</option></select>
            <select className="input h-9 min-w-0 flex-1 sm:w-auto sm:flex-none" value={fState} onChange={(e) => setFState(e.target.value)} aria-label="Trạng thái"><option value="">Tất cả trạng thái</option>{['Đang thuê', 'Trống', 'Giữ chỗ', 'Không cho thuê'].map((s) => <option key={s}>{s}</option>)}<option value="__soon">Sắp / quá hạn hợp đồng</option></select>
            <label className="relative w-full sm:w-auto sm:min-w-[200px] sm:flex-1"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-mute" /><input className="input h-9 pl-9" placeholder="Tìm tầng, khách thuê, người liên hệ, điện thoại…" value={q} onChange={(e) => setQ(e.target.value)} /></label>
            <span className="text-[12.5px] text-ink-mute">Bấm một dòng để chọn, rồi dùng các nút phía trên</span>
          </div>

          {/* desktop table */}
          <div className="tbl-scroll hidden lg:block lg:min-h-0 lg:flex-1 lg:overflow-y-auto">
            <table className="w-full table-fixed border-separate border-spacing-0 text-[13px]">
              <colgroup>{[9, 6, 9, 22, 12, 9, 8, 8, 9, 8].map((w, i) => <col key={i} style={{ width: `${w}%` }} />)}</colgroup>
              <thead><tr className="text-[12.5px] font-extrabold">{['Tầng / khu', 'Diện tích', 'Trạng thái', 'Khách thuê', 'Người liên hệ', 'Điện thoại', 'Bắt đầu', 'Kết thúc', 'Thời hạn', 'Báo giá'].map((h) => <th key={h} className="th3d sticky top-0 z-[1] border-b px-2.5 py-2.5 text-left">{h}</th>)}</tr></thead>
              <tbody>
                {loading && !d && <tr><td colSpan={10} className="px-4 py-12 text-center text-ink-mute"><Loader2 className="mr-2 inline h-4 w-4 animate-spin" />Đang tải…</td></tr>}
                {d && !groups.length && <tr><td colSpan={10} className="px-4 py-12 text-center text-ink-mute">Không có tầng nào khớp bộ lọc.</td></tr>}
                {groups.map((g) => (<FragmentRows key={g.id}>
                  <tr><td colSpan={10} className="border-b border-navy-200 bg-navy-50 px-3 py-1.5 text-[13px] font-extrabold text-navy-900"><Building2 className="mr-1.5 inline h-4 w-4 text-navy-500" />{g.name}{g.address && <span className="ml-2 font-semibold text-ink-mute">{g.address}</span>}<span className="ml-2 font-semibold text-ink-mute">· {g.floors.length} tầng / khu</span></td></tr>
                  {g.floors.map((f) => {
                    const ls = active.filter((l) => l.id_tang === f.id), st = stateOf(f), rows: (Lease | null)[] = ls.length ? ls : [null]
                    return rows.map((l, i) => {
                      const t = l ? tenantOf.get(l.id_khach_thue) : null, al = l ? alertOf(l) : null
                      const on = sel?.floor === f.id && (ls.length <= 1 || sel.lease === l?.id)
                      const cell = `border-b border-navy-100 px-2.5 py-2 align-middle ${on ? 'bg-select' : ''}`
                      return (
                        <tr key={f.id + (l?.id ?? '')} tabIndex={0} aria-selected={on} onClick={() => setSel(on ? null : { floor: f.id, lease: l?.id ?? null })}
                          onDoubleClick={() => { if (t) open({ kind: 'khach', tenant: t }, tenantInit(t)); else if (p?.lease && st !== 'Không cho thuê') open({ kind: 'thue', floor: f }, { id_khach_thue: '', ngay_bat_dau: today, dien_tich: f.dien_tich == null ? '' : String(f.dien_tich), gia_thue: f.bao_gia ?? '' }) }}
                          className="cursor-pointer outline-none hover:brightness-[.98]">
                          {i === 0 && <td rowSpan={rows.length} className={`border-b border-navy-100 px-2.5 py-2 align-middle font-extrabold text-navy-900 ${sel?.floor === f.id ? 'bg-select shadow-[inset_3px_0_0_#2189e6]' : ''}`}>{f.ten_tang}{f.ma_tang_khu_vuc && <span className="block text-[11.5px] font-semibold text-ink-mute">{f.ma_tang_khu_vuc}</span>}</td>}
                          {i === 0 && <td rowSpan={rows.length} className={`border-b border-navy-100 px-2.5 py-2 align-middle tabular-nums ${sel?.floor === f.id ? 'bg-select' : ''}`}>{f.dien_tich == null ? '—' : `${num(f.dien_tich)} m²`}</td>}
                          {i === 0 && <td rowSpan={rows.length} className={`border-b border-navy-100 px-2.5 py-2 align-middle ${sel?.floor === f.id ? 'bg-select' : ''}`}><span className={PILL[st] ?? 'pill-blue'}>{st}</span></td>}
                          <td className={cell}>{t ? <><span className="line-clamp-2 font-semibold text-navy-900" title={t.ten_khach_thue}>{t.ten_khach_thue}</span>{l?.dien_tich != null && <span className="text-[11.5px] text-ink-mute">thuê {num(l.dien_tich)} m²</span>}</> : <span className="text-navy-300">—</span>}</td>
                          <td className={`${cell} truncate`}>{t?.nguoi_lien_he || <span className="text-navy-300">—</span>}</td>
                          <td className={`${cell} truncate tabular-nums`}>{t?.dien_thoai || <span className="text-navy-300">—</span>}</td>
                          <td className={`${cell} tabular-nums`}>{l ? dmy(l.ngay_bat_dau) : <span className="text-navy-300">—</span>}</td>
                          <td className={`${cell} tabular-nums`}>{l ? dmy(l.ngay_ket_thuc) : <span className="text-navy-300">—</span>}</td>
                          <td className={`${cell} font-bold ${al?.c ?? ''}`}>{al ? al.t : l ? <span className="font-normal text-navy-300">chưa có hạn</span> : <span className="font-normal text-navy-300">—</span>}</td>
                          {i === 0 && <td rowSpan={rows.length} className={`border-b border-navy-100 px-2.5 py-2 align-middle ${sel?.floor === f.id ? 'bg-select' : ''}`}><span className="line-clamp-2" title={f.bao_gia ?? ''}>{f.bao_gia || <span className="text-navy-300">—</span>}</span></td>}
                        </tr>
                      )
                    })
                  })}
                </FragmentRows>))}
              </tbody>
            </table>
          </div>

          {/* phone cards */}
          <div className="space-y-3 p-3 lg:hidden">
            {loading && !d && <p className="py-10 text-center text-ink-mute">Đang tải…</p>}
            {groups.map((g) => (
              <div key={g.id}>
                <div className="mb-1.5 text-[13px] font-extrabold text-navy-900"><Building2 className="mr-1 inline h-4 w-4 text-navy-500" />{g.name}</div>
                <div className="space-y-2">
                  {g.floors.map((f) => {
                    const ls = active.filter((l) => l.id_tang === f.id), st = stateOf(f), on = sel?.floor === f.id
                    return (
                      <div key={f.id} className={`rounded-2xl border p-3 ${on ? 'border-[#2189e6] bg-select' : 'border-navy-200 bg-white'}`}>
                        <button type="button" className="flex w-full items-center gap-2 text-left" onClick={() => setSel(on ? null : { floor: f.id, lease: ls.length === 1 ? ls[0].id : null })}>
                          <b className="flex-1 text-[15px] text-navy-900">{f.ten_tang}</b>{f.dien_tich != null && <span className="text-[12.5px] text-ink-mute">{num(f.dien_tich)} m²</span>}<span className={PILL[st] ?? 'pill-blue'}>{st}</span>
                        </button>
                        {ls.map((l) => { const t = tenantOf.get(l.id_khach_thue), al = alertOf(l); return (
                          <button key={l.id} type="button" onClick={() => setSel({ floor: f.id, lease: l.id })} className={`mt-2 block w-full rounded-xl border px-2.5 py-2 text-left ${sel?.lease === l.id ? 'border-[#2189e6] bg-white' : 'border-navy-100 bg-navy-50'}`}>
                            <div className="text-[13.5px] font-bold text-navy-900">{t?.ten_khach_thue ?? l.id_khach_thue}</div>
                            <div className="text-[12.5px] text-ink-soft">{[t?.nguoi_lien_he, t?.dien_thoai].filter(Boolean).join(' · ') || 'Chưa có liên hệ'}</div>
                            <div className="text-[12.5px] text-ink-mute">{l.ngay_bat_dau || l.ngay_ket_thuc ? `${dmy(l.ngay_bat_dau)} → ${dmy(l.ngay_ket_thuc)}` : "Chưa nhập thời hạn hợp đồng"}{al && <b className={`ml-2 ${al.c}`}>{al.t}</b>}</div>
                          </button>) })}
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── dialogs ── */}
      {modal && modal.kind !== 'khach' && modal.kind !== 'lich_su' && (
        <Sheet title={modal.kind === 'thue' ? `Cho thuê · ${modal.floor.ten_tang}` : modal.kind === 'tra' ? 'Trả mặt bằng' : modal.kind === 'gia_han' ? 'Gia hạn hợp đồng' : modal.kind === 'sua_thue' ? 'Sửa lượt thuê' : modal.kind === 'tang' && modal.floor ? `Sửa ${modal.floor.ten_tang}` : 'Thêm tầng / khu'} onClose={() => setModal(null)}>
          {(modal.kind === 'tra' || modal.kind === 'gia_han' || modal.kind === 'sua_thue') && <p className="mb-3 text-[13.5px] text-ink-soft"><b className="text-navy-900">{tenantOf.get(modal.lease.id_khach_thue)?.ten_khach_thue}</b> · {d?.floors.find((f) => f.id === modal.lease.id_tang)?.ten_tang} · {dmy(modal.lease.ngay_bat_dau)} → {dmy(modal.lease.ngay_ket_thuc)}</p>}
          <div className="grid gap-3 sm:grid-cols-2">
            {modal.kind === 'thue' && <>
              <F label="Khách thuê" full><select className={inp} value={form.id_khach_thue ?? ''} onChange={set('id_khach_thue')}><option value="">+ Khách mới (nhập bên dưới)</option>{d?.tenants.map((t) => <option key={t.id} value={t.id}>{t.ten_khach_thue}{t.trang_thai !== ACTIVE ? ' (đã rời)' : ''}</option>)}</select></F>
              {!form.id_khach_thue && <>
                <F label="Tên khách mới *" full><input className={inp} value={form.ten_khach_thue ?? ''} onChange={set('ten_khach_thue')} autoFocus /></F>
                <F label="Người liên hệ"><input className={inp} value={form.nguoi_lien_he ?? ''} onChange={set('nguoi_lien_he')} /></F>
                <F label="Điện thoại"><input className={inp} inputMode="tel" value={form.dien_thoai ?? ''} onChange={set('dien_thoai')} /></F>
                <F label="Email"><input className={inp} type="email" value={form.email ?? ''} onChange={set('email')} /></F>
                <F label="Mã số thuế"><input className={inp} value={form.ma_so_thue ?? ''} onChange={set('ma_so_thue')} /></F>
              </>}
            </>}
            {(modal.kind === 'thue' || modal.kind === 'sua_thue') && <>
              <F label="Ngày bắt đầu"><input type="date" className={inp} value={form.ngay_bat_dau ?? ''} onChange={set('ngay_bat_dau')} /></F>
              <F label="Ngày kết thúc"><input type="date" className={inp} value={form.ngay_ket_thuc ?? ''} onChange={set('ngay_ket_thuc')} /></F>
              <F label="Diện tích thuê (m²)"><input className={inp} inputMode="decimal" value={form.dien_tich ?? ''} onChange={set('dien_tich')} /></F>
              <F label="Giá thuê"><input className={inp} value={form.gia_thue ?? ''} onChange={set('gia_thue')} placeholder="vd 18 USD/m²/tháng" /></F>
              <F label="Ghi chú" full><input className={inp} value={form.ghi_chu ?? ''} onChange={set('ghi_chu')} /></F>
            </>}
            {modal.kind === 'gia_han' && <F label="Ngày kết thúc mới *" full><input type="date" className={inp} value={form.ngay_ket_thuc ?? ''} onChange={set('ngay_ket_thuc')} autoFocus /></F>}
            {modal.kind === 'tra' && <>
              <F label="Ngày trả mặt bằng"><input type="date" className={inp} value={form.ngay_tra ?? ''} onChange={set('ngay_tra')} /></F>
              <F label="Ghi chú"><input className={inp} value={form.ghi_chu ?? ''} onChange={set('ghi_chu')} /></F>
              <p className="text-[12.5px] text-ink-mute sm:col-span-2">Tầng sẽ về “Trống” nếu không còn khách nào khác. Khách chuyển “Đã rời đi” khi không còn thuê tầng nào; hồ sơ và tiền điện vẫn giữ.</p>
            </>}
            {modal.kind === 'tang' && <>
              <F label="Tòa nhà"><select className={inp} value={form.id_toa_nha ?? ''} onChange={set('id_toa_nha')}>{d?.buildings.map((b) => <option key={b.id} value={b.id}>{b.ten_toa_nha}</option>)}<option value="">+ Tòa nhà mới…</option></select></F>
              {!form.id_toa_nha ? <F label="Tên tòa nhà mới"><input className={inp} value={form.ten_toa_nha_moi ?? ''} onChange={set('ten_toa_nha_moi')} /></F> : <span className="hidden sm:block" />}
              <F label="Tầng / khu *"><input className={inp} value={form.ten_tang ?? ''} onChange={set('ten_tang')} placeholder="vd Tầng 19" /></F>
              <F label="Mã (không bắt buộc)"><input className={inp} value={form.ma_tang_khu_vuc ?? ''} onChange={set('ma_tang_khu_vuc')} /></F>
              <F label="Diện tích (m²)"><input className={inp} inputMode="decimal" value={form.dien_tich ?? ''} onChange={set('dien_tich')} /></F>
              <F label="Trạng thái"><select className={inp} value={form.trang_thai_su_dung ?? 'Trống'} onChange={set('trang_thai_su_dung')} disabled={form.trang_thai_su_dung === ACTIVE}>{form.trang_thai_su_dung === ACTIVE && <option>Đang thuê</option>}{['Trống', 'Giữ chỗ', 'Không cho thuê'].map((s) => <option key={s}>{s}</option>)}</select></F>
              <F label="Báo giá" full><input className={inp} value={form.bao_gia ?? ''} onChange={set('bao_gia')} /></F>
              <F label="Ghi chú" full><input className={inp} value={form.ghi_chu ?? ''} onChange={set('ghi_chu')} /></F>
              {form.trang_thai_su_dung === ACTIVE && <p className="text-[12.5px] text-ink-mute sm:col-span-2">Trạng thái “Đang thuê” tự đặt theo khách đang thuê; muốn đổi thì dùng “Trả mặt bằng”.</p>}
            </>}
          </div>
          <div className="mt-4 flex justify-end gap-2">
            {modal.kind === 'sua_thue' && p?.admin && <button className="btn-danger mr-auto" disabled={busy} onClick={async () => { if (await confirm('Xóa hẳn lượt thuê này (nhập nhầm)? Không lưu lại lịch sử.', { title: 'Xóa lượt thuê', okLabel: 'Xóa', danger: true })) post({ op: 'xoa_thue', id: modal.lease.id }) }}><Trash2 className="h-4 w-4" />Xóa lượt thuê</button>}
            <button className="btn-secondary" onClick={() => setModal(null)}>Hủy</button>
            <button className="btn-primary min-w-[96px]" disabled={busy} onClick={submit}>{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : modal.kind === 'tra' ? 'Xác nhận trả' : 'Lưu'}</button>
          </div>
        </Sheet>
      )}

      {modal?.kind === 'lich_su' && (
        <Sheet title={`Lịch sử thuê · ${modal.floor.ten_tang}`} onClose={() => setModal(null)}>
          {(() => { const ls = (d?.leases ?? []).filter((l) => l.id_tang === modal.floor.id).sort((a, b) => String(b.ngay_bat_dau ?? '').localeCompare(String(a.ngay_bat_dau ?? ''))); return ls.length ? (
            <ul className="divide-y divide-navy-100 rounded-xl border border-navy-200 text-[13.5px]">{ls.map((l) => (
              <li key={l.id} className="flex flex-wrap items-center gap-x-3 gap-y-0.5 px-3 py-2"><b className="min-w-0 flex-1 text-navy-900">{tenantOf.get(l.id_khach_thue)?.ten_khach_thue ?? l.id_khach_thue}</b><span className="tabular-nums text-ink-soft">{dmy(l.ngay_bat_dau)} → {dmy(l.trang_thai === ACTIVE ? l.ngay_ket_thuc : l.ngay_tra)}</span><span className={l.trang_thai === ACTIVE ? 'pill-green' : 'pill bg-navy-100 text-navy-700'}>{l.trang_thai === ACTIVE ? 'Đang thuê' : 'Đã trả'}</span></li>))}</ul>
          ) : <p className="py-6 text-center text-ink-mute">Tầng này chưa có lượt thuê nào được ghi.</p> })()}
        </Sheet>
      )}

      {modal?.kind === 'khach' && (
        <Sheet wide title={modal.tenant.ten_khach_thue} sub={`${modal.tenant.id} · ${modal.tenant.trang_thai ?? ''}`} onClose={() => setModal(null)}>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <F label="Tên khách thuê *" full><input className={inp} value={form.ten_khach_thue ?? ''} onChange={set('ten_khach_thue')} disabled={!p?.lease} /></F>
            <F label="Mã số thuế"><input className={inp} value={form.ma_so_thue ?? ''} onChange={set('ma_so_thue')} disabled={!p?.lease} /></F>
            <F label="Người liên hệ"><input className={inp} value={form.nguoi_lien_he ?? ''} onChange={set('nguoi_lien_he')} disabled={!p?.lease} /></F>
            <F label="Điện thoại"><input className={inp} value={form.dien_thoai ?? ''} onChange={set('dien_thoai')} disabled={!p?.lease} /></F>
            <F label="Email"><input className={inp} type="email" value={form.email ?? ''} onChange={set('email')} disabled={!p?.lease} /></F>
            <F label="Địa chỉ" full><input className={inp} value={form.dia_chi ?? ''} onChange={set('dia_chi')} disabled={!p?.lease} /></F>
            <F label="Ghi chú"><input className={inp} value={form.ghi_chu ?? ''} onChange={set('ghi_chu')} disabled={!p?.lease} /></F>
          </div>
          {p?.lease && <div className="mt-3 flex justify-end"><button className="btn-primary min-w-[96px]" disabled={busy} onClick={submit}>{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Lưu thông tin'}</button></div>}
          <h3 className="mb-1.5 mt-4 text-[13px] font-black uppercase text-[#c4121f]">Mặt bằng đã và đang thuê</h3>
          <ul className="divide-y divide-navy-100 rounded-xl border border-navy-200 text-[13.5px]">
            {(d?.leases ?? []).filter((l) => l.id_khach_thue === modal.tenant.id).map((l) => { const f = d?.floors.find((x) => x.id === l.id_tang), al = l.trang_thai === ACTIVE ? alertOf(l) : null; return (
              <li key={l.id} className="flex flex-wrap items-center gap-x-3 gap-y-0.5 px-3 py-2"><b className="text-navy-900">{f?.ten_tang ?? l.id_tang}</b><span className="text-ink-mute">{buildingOf.get(f?.id_toa_nha ?? '')?.ten_toa_nha}</span>{l.dien_tich != null && <span>{num(l.dien_tich)} m²</span>}<span className="ml-auto tabular-nums text-ink-soft">{dmy(l.ngay_bat_dau)} → {dmy(l.trang_thai === ACTIVE ? l.ngay_ket_thuc : l.ngay_tra)}</span>{al && <b className={al.c}>{al.t}</b>}<span className={l.trang_thai === ACTIVE ? 'pill-green' : 'pill bg-navy-100 text-navy-700'}>{l.trang_thai === ACTIVE ? 'Đang thuê' : 'Đã trả'}</span></li>) })}
            {!(d?.leases ?? []).some((l) => l.id_khach_thue === modal.tenant.id) && <li className="px-3 py-4 text-center text-ink-mute">Chưa ghi nhận mặt bằng nào.</li>}
          </ul>
          <div className="mt-3 flex flex-wrap gap-2 text-[13px]"><a className="btn-secondary btn-sm" href="/tien_dien">Tiền điện và công nợ →</a><a className="btn-secondary btn-sm" href={`/khach_ra_vao?q=${encodeURIComponent(modal.tenant.ten_khach_thue)}`}>Khách ra vào →</a></div>
          <Attachments resource="khach_thue" id={modal.tenant.id} canEdit={!!p?.lease} />
        </Sheet>
      )}
    </div>
  )
}

const FragmentRows = ({ children }: { children: React.ReactNode }) => <>{children}</>

function Sheet({ title, sub, children, onClose, wide }: { title: string; sub?: string; children: React.ReactNode; onClose: () => void; wide?: boolean }) {
  useEffect(() => { const k = (e: KeyboardEvent) => e.key === 'Escape' && onClose(); window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k) }, [onClose])
  return (
    <Portal>
      <div className="fixed inset-0 z-[90] flex items-center justify-center p-3 sm:p-6" role="dialog" aria-modal="true" aria-label={title}>
        <div className="absolute inset-0 bg-navy-950/50" onClick={onClose} />
        <div className={`relative flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-2xl bg-white shadow-pop ${wide ? 'max-w-3xl lg:w-[80vw] lg:max-w-[1100px]' : 'max-w-2xl'}`}>
          <div className="flex items-center justify-between gap-3 bg-[#0b1b40] px-4 py-3 text-white"><div className="min-w-0"><h2 className="truncate text-[16px] font-extrabold">{title}</h2>{sub && <p className="text-[12px] text-white/75">{sub}</p>}</div><button onClick={onClose} aria-label="Đóng" className="grid h-8 w-8 shrink-0 place-items-center rounded-md hover:bg-white/15"><X className="h-5 w-5" /></button></div>
          <div className="overflow-y-auto p-4 lg:p-5">{children}</div>
        </div>
      </div>
    </Portal>
  )
}
