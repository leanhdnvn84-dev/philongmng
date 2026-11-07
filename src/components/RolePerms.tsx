'use client'

// Vai trò & phân quyền in one screen: roles on the left, the permission matrix of the selected role on the right.
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Copy, Loader2, Pencil, Plus, Save, ShieldCheck, Trash2, X } from 'lucide-react'
import Portal from '@/components/Portal'
import { useConfirm } from '@/components/ConfirmDialog'

interface Role { id: string; ten_vai_tro: string; mo_ta: string | null; sieu_quan_tri: boolean; so_nguoi_dung: number }
interface Mod { key: string; label: string; group: string; pages: string; approve?: string }
interface PermRow { id_vai_tro: string; module: string; xem: boolean; them: boolean; sua: boolean; xoa: boolean; duyet: boolean }
type Cell = { xem: boolean; them: boolean; sua: boolean; xoa: boolean; duyet: boolean }
type Draft = Record<string, Cell>
interface Perms { roleCreate: boolean; roleEdit: boolean; roleDelete: boolean; permEdit: boolean }

const COLS: { k: keyof Cell; label: string }[] = [{ k: 'xem', label: 'Xem' }, { k: 'them', label: 'Thêm' }, { k: 'sua', label: 'Sửa' }, { k: 'xoa', label: 'Xóa' }, { k: 'duyet', label: 'Duyệt' }]
const EMPTY: Cell = { xem: false, them: false, sua: false, xoa: false, duyet: false }

async function api(url: string, init?: RequestInit) {
  const r = await fetch(url, init), j = await r.json().catch(() => ({ success: false, error: 'Lỗi mạng' }))
  if (!j.success) throw new Error(j.error || 'Có lỗi xảy ra')
  return j
}
const send = (url: string, method: string, body?: object) => api(url, { method, headers: { 'Content-Type': 'application/json' }, body: body ? JSON.stringify(body) : undefined })

export default function RolePerms({ perms }: { perms: Perms }) {
  const [roles, setRoles] = useState<Role[]>([])
  const [mods, setMods] = useState<Mod[]>([])
  const [rows, setRows] = useState<PermRow[]>([])
  const [me, setMe] = useState<{ roleId: string; superAdmin: boolean } | null>(null)
  const [sel, setSel] = useState('')
  const [draft, setDraft] = useState<Draft>({})
  const [base, setBase] = useState<Draft>({})
  const [busy, setBusy] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)
  const [form, setForm] = useState<null | { id?: string; ten: string; mo_ta: string }>(null)
  const [confirm, dialog] = useConfirm()

  const load = useCallback(async () => {
    try {
      const j = await api('/api/he_thong/phan_quyen', { cache: 'no-store' })
      setRoles(j.data.roles); setMods(j.data.modules); setRows(j.data.perms); setMe(j.me)
      setSel((cur) => (cur && j.data.roles.some((r: Role) => r.id === cur) ? cur : j.data.roles[0]?.id ?? ''))
    } catch (e: any) { setMsg({ ok: false, text: e.message }) } finally { setLoaded(true) }
  }, [])
  useEffect(() => { load() }, [load])

  const role = roles.find((r) => r.id === sel)
  const fromRows = useCallback((rid: string): Draft => {
    const d: Draft = {}
    for (const m of mods) { const r = rows.find((x) => x.id_vai_tro === rid && x.module === m.key); d[m.key] = r ? { xem: !!r.xem, them: !!r.them, sua: !!r.sua, xoa: !!r.xoa, duyet: !!r.duyet } : { ...EMPTY } }
    return d
  }, [mods, rows])
  useEffect(() => { if (sel) { const d = fromRows(sel); setDraft(d); setBase(d) } }, [sel, fromRows])

  const has = (rid: string, m: string) => rows.some((x) => x.id_vai_tro === rid && x.module === m)
  const dirtyMods = mods.filter((m) => COLS.some((c) => draft[m.key]?.[c.k] !== base[m.key]?.[c.k]))
  const locked = !!role?.sieu_quan_tri || !perms.permEdit || (!me?.superAdmin && role?.id === me?.roleId)
  const lockWhy = role?.sieu_quan_tri ? 'Super Admin luôn có toàn quyền' : !perms.permEdit ? 'Bạn chỉ được xem phân quyền' : role?.id === me?.roleId && !me?.superAdmin ? 'Không thể tự sửa quyền của vai trò mình đang dùng' : ''

  const set = (mk: string, k: keyof Cell, v: boolean) => setDraft((d) => {
    const c = { ...d[mk], [k]: v }
    if (k !== 'xem' && v) c.xem = true      // any right implies viewing
    if (k === 'xem' && !v) { c.them = c.sua = c.xoa = c.duyet = false }
    return { ...d, [mk]: c }
  })
  const allowed = (m: Mod, k: keyof Cell) => k !== 'duyet' || !!m.approve
  const setRow = (m: Mod, on: boolean) => setDraft((d) => ({ ...d, [m.key]: { xem: on, them: on, sua: on, xoa: on, duyet: on && !!m.approve } }))
  const setCol = (k: keyof Cell, on: boolean) => setDraft((d) => { const n = { ...d }; for (const m of mods) if (allowed(m, k)) { const c = { ...n[m.key], [k]: on }; if (k !== 'xem' && on) c.xem = true; if (k === 'xem' && !on) { c.them = c.sua = c.xoa = c.duyet = false } n[m.key] = c } return n })
  const copyFrom = (rid: string) => { if (rid) { setDraft(fromRows(rid)); setMsg({ ok: true, text: `Đã sao chép quyền từ "${roles.find((r) => r.id === rid)?.ten_vai_tro}". Bấm Lưu để áp dụng.` }) } }

  const save = async () => {
    setBusy(true); setMsg(null)
    try { const j = await send('/api/he_thong/phan_quyen', 'POST', { id_vai_tro: sel, perms: draft }); await load(); setMsg({ ok: true, text: `Đã lưu phân quyền (${j.data.changed} module thay đổi). Quyền mới có hiệu lực trong vài giây.` }) }
    catch (e: any) { setMsg({ ok: false, text: e.message }) } finally { setBusy(false) }
  }
  const saveRole = async () => {
    if (!form) return
    setBusy(true); setMsg(null)
    try {
      if (form.id) await send(`/api/vai_tro/${form.id}`, 'PATCH', { ten_vai_tro: form.ten, mo_ta: form.mo_ta })
      else { const j = await send('/api/vai_tro', 'POST', { ten_vai_tro: form.ten, mo_ta: form.mo_ta, sieu_quan_tri: false }); setSel(j.data.id) }
      setForm(null); await load(); setMsg({ ok: true, text: form.id ? 'Đã cập nhật vai trò' : 'Đã thêm vai trò. Hãy tích quyền rồi bấm Lưu.' })
    } catch (e: any) { setMsg({ ok: false, text: e.message }) } finally { setBusy(false) }
  }
  const delRole = async (r: Role) => {
    if (!(await confirm(`Xóa vai trò "${r.ten_vai_tro}"?\n\nChỉ xóa được khi không còn người dùng nào đang dùng vai trò này.`, { danger: true, okLabel: 'Xóa' }))) return
    setBusy(true); setMsg(null)
    try { await send(`/api/vai_tro/${r.id}`, 'DELETE'); await load(); setMsg({ ok: true, text: `Đã xóa vai trò ${r.ten_vai_tro}` }) } catch (e: any) { setMsg({ ok: false, text: e.message }) } finally { setBusy(false) }
  }

  const groups = useMemo(() => { const g: [string, Mod[]][] = []; for (const m of mods) { const l = g.find((x) => x[0] === m.group); if (l) l[1].push(m); else g.push([m.group, [m]]) } return g }, [mods])
  const summary = (rid: string) => { const n = rows.filter((x) => x.id_vai_tro === rid && x.xem).length; return `${n}/${mods.length} mục được xem` }

  return (
    <div className="flex flex-1 flex-col lg:min-h-0">
      {dialog}
      <div className="flex shrink-0 flex-wrap items-center gap-2 border-b border-navy-200 bg-white px-4 py-2.5 lg:px-5">
        <ShieldCheck className="h-5 w-5 text-blue-600" />
        <h1 className="flex-1 text-[22px] font-extrabold text-navy-900">Vai trò &amp; phân quyền</h1>
        {perms.permEdit && !locked && <>
          <label className="flex items-center gap-1.5 text-[12.5px] text-ink-soft"><Copy className="h-4 w-4" />
            <select className="input !h-9 w-48" value="" onChange={(e) => copyFrom(e.target.value)} aria-label="Sao chép quyền từ vai trò khác">
              <option value="">Sao chép quyền từ…</option>{roles.filter((r) => r.id !== sel).map((r) => <option key={r.id} value={r.id}>{r.ten_vai_tro}</option>)}
            </select></label>
          <button className="btn-secondary" disabled={!dirtyMods.length || busy} onClick={() => { setDraft(base); setMsg(null) }}>Hoàn tác</button>
          <button className="btn-primary" disabled={!dirtyMods.length || busy} onClick={save}>{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}Lưu phân quyền{dirtyMods.length ? ` (${dirtyMods.length})` : ''}</button>
        </>}
      </div>
      {msg && <p role="status" className={`shrink-0 border-b px-4 py-2 text-sm font-semibold lg:px-5 ${msg.ok ? 'border-green-200 bg-green-50 text-green-700' : 'border-red-200 bg-red-50 text-red-700'}`}>{msg.text}</p>}

      <div className="grid flex-1 grid-cols-1 gap-3 p-3 lg:min-h-0 lg:grid-cols-[250px_minmax(0,1fr)] lg:px-5">
        {/* roles */}
        <aside className="rounded-xl border border-navy-200 bg-white lg:flex lg:min-h-0 lg:flex-col">
          <div className="flex items-center gap-2 px-3 pb-1 pt-3"><span className="flex-1 text-[11px] font-extrabold uppercase tracking-[.12em] text-ink-soft">Vai trò</span>
            {perms.roleCreate && <button className="btn-secondary btn-sm" onClick={() => setForm({ ten: '', mo_ta: '' })}><Plus className="h-3.5 w-3.5" />Thêm</button>}</div>
          <ul className="flex gap-2 overflow-x-auto p-2 lg:flex-1 lg:flex-col lg:gap-0 lg:overflow-y-auto lg:p-0">
            {!loaded && <li className="p-3 text-sm text-ink-mute">Đang tải…</li>}
            {roles.map((r) => (
              <li key={r.id} className="shrink-0">
                <button onClick={() => setSel(r.id)} aria-current={r.id === sel}
                  className={`w-full min-w-[170px] rounded-lg border-l-[3px] px-3 py-2.5 text-left lg:rounded-none lg:border-b lg:border-b-navy-100 ${r.id === sel ? 'border-l-[#e11d2e] bg-brand-50' : 'border-l-transparent bg-navy-50 lg:bg-white lg:hover:bg-navy-50'}`}>
                  <div className="flex items-center gap-1.5"><b className="truncate text-[14px] text-navy-900">{r.ten_vai_tro}</b>{r.sieu_quan_tri && <span className="pill-red">Toàn quyền</span>}</div>
                  <div className="text-[12px] text-ink-mute">{r.so_nguoi_dung} người dùng · {r.sieu_quan_tri ? 'tất cả mục' : summary(r.id)}</div>
                </button>
              </li>
            ))}
          </ul>
        </aside>

        {/* matrix */}
        <section className="min-w-0 rounded-xl border border-navy-200 bg-white lg:flex lg:min-h-0 lg:flex-col">
          {role && (
            <header className="flex flex-wrap items-center gap-2 border-b border-navy-200 px-4 py-3">
              <div className="min-w-0 flex-1"><div className="text-[16px] font-extrabold text-navy-900">{role.ten_vai_tro}</div><div className="text-[12.5px] text-ink-mute">{role.mo_ta || 'Chưa có mô tả'} · {role.so_nguoi_dung} người dùng</div></div>
              {perms.roleEdit && !role.sieu_quan_tri && <button className="btn-secondary btn-sm" onClick={() => setForm({ id: role.id, ten: role.ten_vai_tro, mo_ta: role.mo_ta ?? '' })}><Pencil className="h-3.5 w-3.5" />Sửa tên</button>}
              {perms.roleDelete && !role.sieu_quan_tri && <button className="btn-danger btn-sm" disabled={busy} onClick={() => delRole(role)}><Trash2 className="h-3.5 w-3.5" />Xóa</button>}
            </header>
          )}
          {lockWhy && <p className="border-b border-amber-200 bg-amber-50 px-4 py-2 text-[12.5px] font-semibold text-amber-800">{lockWhy}.</p>}
          <div className="min-h-0 flex-1 overflow-y-auto">
            <table className="w-full border-separate border-spacing-0 text-[13px]">
              <thead className="sticky top-0 z-10 bg-navy-50 text-[12px] font-extrabold text-navy-800">
                <tr>
                  <th className="px-3 py-2 text-left">Mục (theo menu)</th>
                  {COLS.map((c) => (
                    <th key={c.k} className="w-[64px] px-1 py-2 text-center">
                      <div>{c.label}</div>
                      {!locked && <button type="button" onClick={() => setCol(c.k, !mods.filter((m) => allowed(m, c.k)).every((m) => draft[m.key]?.[c.k]))} className="text-[10.5px] font-semibold text-blue-600 hover:underline">chọn cột</button>}
                    </th>
                  ))}
                  <th className="w-[58px] px-1 py-2" />
                </tr>
              </thead>
              <tbody>
                {groups.map(([g, list]) => (
                  <GroupBlock key={g} group={g} list={list} draft={draft} base={base} locked={locked} role={role} has={has} set={set} setRow={setRow} allowed={allowed} />
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {form && (
        <Portal>
          <div className="fixed inset-0 z-[90] flex items-center justify-center p-3" role="dialog" aria-modal="true" aria-label={form.id ? 'Sửa vai trò' : 'Thêm vai trò'}>
            <div className="absolute inset-0 bg-navy-950/50" onClick={() => setForm(null)} />
            <div className="relative w-full max-w-md rounded-2xl bg-white p-5 shadow-pop">
              <div className="mb-3 flex items-center"><h2 className="flex-1 text-[17px] font-extrabold text-navy-900">{form.id ? 'Sửa vai trò' : 'Thêm vai trò'}</h2>
                <button onClick={() => setForm(null)} aria-label="Đóng" className="grid h-9 w-9 place-items-center rounded-full bg-navy-100"><X className="h-4 w-4" /></button></div>
              <label className="mb-3 block"><span className="mb-1 block text-[13px] font-bold text-ink-soft">Tên vai trò *</span><input className="input" value={form.ten} onChange={(e) => setForm({ ...form, ten: e.target.value })} autoFocus maxLength={80} /></label>
              <label className="mb-4 block"><span className="mb-1 block text-[13px] font-bold text-ink-soft">Mô tả</span><input className="input" value={form.mo_ta} onChange={(e) => setForm({ ...form, mo_ta: e.target.value })} maxLength={200} /></label>
              <div className="flex justify-end gap-2"><button className="btn-secondary" onClick={() => setForm(null)}>Hủy</button><button className="btn-primary" disabled={busy || !form.ten.trim()} onClick={saveRole}>{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Lưu'}</button></div>
            </div>
          </div>
        </Portal>
      )}
    </div>
  )
}

function GroupBlock({ group, list, draft, base, locked, role, has, set, setRow, allowed }: {
  group: string; list: Mod[]; draft: Draft; base: Draft; locked: boolean; role?: Role; has: (r: string, m: string) => boolean
  set: (m: string, k: keyof Cell, v: boolean) => void; setRow: (m: Mod, on: boolean) => void; allowed: (m: Mod, k: keyof Cell) => boolean
}) {
  return (
    <>
      <tr><td colSpan={7} className="border-y border-navy-200 bg-navy-50/70 px-3 py-1.5 text-[11.5px] font-extrabold uppercase tracking-wide text-ink-soft">{group}</td></tr>
      {list.map((m) => {
        const d = draft[m.key] ?? EMPTY, changed = COLS.some((c) => d[c.k] !== base[m.key]?.[c.k])
        const full = role?.sieu_quan_tri
        return (
          <tr key={m.key} className={changed ? 'bg-blue-50/60' : ''}>
            <td className="border-b border-navy-100 px-3 py-2">
              <div className="font-bold text-navy-900">{m.label}{role && !full && !has(role.id, m.key) && <span className="ml-2 rounded bg-amber-100 px-1.5 py-px text-[10.5px] font-bold text-amber-800" title="Vai trò này chưa có dòng phân quyền cho mục này: mặc định không có quyền">chưa cấu hình</span>}</div>
              <div className="text-[11.5px] leading-snug text-ink-mute">{m.pages}</div>
            </td>
            {COLS.map((c) => (
              <td key={c.k} className="border-b border-navy-100 px-1 py-2 text-center">
                {!allowed(m, c.k) ? <span className="text-navy-300" title="Mục này không có thao tác duyệt">—</span>
                  : <input type="checkbox" className="h-[18px] w-[18px] accent-blue-600 disabled:opacity-60" checked={full ? true : d[c.k]} disabled={locked || !!full} onChange={(e) => set(m.key, c.k, e.target.checked)} aria-label={`${m.label}: ${c.label}`} title={c.k === 'duyet' ? m.approve : undefined} />}
              </td>
            ))}
            <td className="border-b border-navy-100 px-1 py-2 text-center">
              {!locked && <button type="button" className="text-[11px] font-semibold text-blue-600 hover:underline" onClick={() => setRow(m, !COLS.every((c) => !allowed(m, c.k) || d[c.k]))}>cả dòng</button>}
            </td>
          </tr>
        )
      })}
    </>
  )
}
