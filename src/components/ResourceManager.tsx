'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Plus, Search, Download, X, Pencil, Trash2, ChevronLeft, ChevronRight, Inbox, Loader2, Lock, Zap } from 'lucide-react'
import Portal from '@/components/Portal'
import { Action, Field, getResource, visibleInList, formatMoney, formatDate, PROPOSAL_KINDS } from '@/lib/resources'

type Row = Record<string, any>
type Option = { value: string; label: string }
export type UiPerms = { create: boolean; edit: boolean; delete: boolean; approve: boolean }

const RED = /QUÁ HẠN|TRỄ|HẾT HẠN|DƯỚI TỒN|Từ chối|Hủy|Đã thanh lý|THIẾU/i
const AMBER = /SẮP|ĐẾN HẠN|CẦN LÀM|Chờ duyệt|Nháp|Bảo trì|Hẹn|Chờ thanh lý|Đang thực hiện|ĐANG LÀM/i
const GREEN = /HOÀN THÀNH|CÒN LỊCH|Hoàn thành|Đã duyệt|Đã chốt|Hoạt động|Trong kho|Đã ra|Trống|Đang sử dụng|Đang thuê/i
const BLUE = /CHỜ NGÀY GỐC|CHƯA BẮT ĐẦU|Chưa thực hiện|Đang trong tòa nhà|Mới/i
const pill = (v: string) =>
  RED.test(v) ? 'pill-red' : AMBER.test(v) ? 'pill-amber' : BLUE.test(v) ? 'pill-blue' : GREEN.test(v) ? 'pill-green' : 'pill-gray'
const STATUS_FIELDS = new Set(['canh_bao', 'trang_thai', 'trang_thai_su_dung', 'muc_do', 'muc_do_tiem_nang'])

async function api(url: string, init?: RequestInit) {
  const r = await fetch(url, { ...init, headers: { 'Content-Type': 'application/json' } })
  const j = await r.json().catch(() => ({ success: false, error: 'Phản hồi không hợp lệ' }))
  if (r.status === 401) { window.location.href = '/login'; throw new Error('Phiên đăng nhập đã hết') }
  if (!j.success) throw new Error(j.error || 'Có lỗi xảy ra')
  return j
}

/** Loads dropdown options for every ref field in the given field lists. */
function useRefOptions(fieldLists: Field[][]) {
  const [refs, setRefs] = useState<Record<string, Option[]>>({})
  const keys = useMemo(
    () => Array.from(new Set(fieldLists.flat().filter((f) => f.type === 'ref').map((f) => f.ref!))).sort().join(','),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [fieldLists.map((l) => l.map((f) => f.name).join()).join('|')]
  )
  useEffect(() => {
    keys.split(',').filter(Boolean).forEach((k) =>
      api(`/api/${k}?options=1`).then((j) => setRefs((r) => ({ ...r, [k]: j.data }))).catch(() => {}))
  }, [keys])
  const labels = useMemo(() => {
    const m: Record<string, Map<string, string>> = {}
    for (const [k, list] of Object.entries(refs)) m[k] = new Map(list.map((o) => [o.value, o.label]))
    return m
  }, [refs])
  return { refs, labels }
}

function display(f: Field, v: any, labels: Record<string, Map<string, string>>) {
  if (v === null || v === undefined || v === '') return <span className="text-navy-200">—</span>
  if (f.type === 'ref') return labels[f.ref!]?.get(v) ?? v
  if (f.name === 'loai_de_xuat') return PROPOSAL_KINDS[v] ?? v
  if (f.name === 'loai_giao_dich') return <span className={v === 'NHAP' ? 'pill-green' : 'pill-amber'}>{v === 'NHAP' ? 'Nhập' : v === 'XUAT' ? 'Xuất' : v}</span>
  if (f.type === 'bool') return v ? <span className="pill-green">Có</span> : <span className="text-navy-200">—</span>
  if (f.type === 'date') return <span className="tabular-nums">{formatDate(v)}</span>
  if (f.type === 'money') return <span className="tabular-nums font-medium">{formatMoney(v)}</span>
  if (f.type === 'number') {
    const n = Number(v)
    const neg = f.name === 'so_ngay_con_lai' && n < 0
    return <span className={`tabular-nums ${neg ? 'text-red-600 font-semibold' : ''}`}>{new Intl.NumberFormat('vi-VN').format(n)}</span>
  }
  if (STATUS_FIELDS.has(f.name)) return <span className={pill(String(v))}>{String(v)}</span>
  return String(v)
}

export default function ResourceManager({
  resourceKey, title, filters = {}, perms, compact = false,
}: { resourceKey: string; title?: string; filters?: Record<string, string>; perms: UiPerms; compact?: boolean }) {
  const res = getResource(resourceKey)!
  const [rows, setRows] = useState<Row[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(true)
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)
  const [editing, setEditing] = useState<Row | null>(null)
  const [viewing, setViewing] = useState<Row | null>(null)
  const [acting, setActing] = useState<{ action: Action; row: Row | null } | null>(null)
  const pageSize = compact ? 200 : 50

  const statusField = res.fields.find((f) => f.name === 'trang_thai' && f.type === 'select' && !filters.trang_thai)
  const listFields = res.fields.filter((f) => visibleInList(f) && !(f.name in filters))
  const { refs, labels } = useRefOptions([res.fields, ...(res.actions ?? []).map((a) => a.fields ?? [])])
  const allowed = (a: Action) => a.perm === 'view' || perms[a.perm as keyof UiPerms]
  const rowActions = (res.actions ?? []).filter((a) => (a.scope ?? 'row') === 'row' && allowed(a))
  const pageActions = (res.actions ?? []).filter((a) => a.scope === 'page' && allowed(a))
  const filterKey = JSON.stringify(filters)

  const params = useCallback((p: number, size: number) => {
    const sp = new URLSearchParams({ page: String(p), pageSize: String(size), ...JSON.parse(filterKey) })
    if (query) sp.set('search', query)
    if (status) sp.set('trang_thai', status)
    return sp
  }, [filterKey, query, status])

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const j = await api(`/api/${res.key}?${params(page, pageSize)}`)
      setRows(j.data)
      setTotal(j.total)
    } catch (e: any) { setMsg({ type: 'err', text: e.message }) } finally { setLoading(false) }
  }, [res.key, params, page, pageSize])
  useEffect(() => { load() }, [load])

  // search as you type (debounced)
  useEffect(() => {
    const t = setTimeout(() => { setPage(1); setQuery(search.trim()) }, 350)
    return () => clearTimeout(t)
  }, [search])

  useEffect(() => { if (msg?.type === 'ok') { const t = setTimeout(() => setMsg(null), 3500); return () => clearTimeout(t) } }, [msg])
  const flash = (text: string, type: 'ok' | 'err' = 'ok') => setMsg({ type, text })

  async function refreshViewing(id: string) {
    try { const j = await api(`/api/${res.key}/${id}`); setViewing(j.data) } catch { setViewing(null) }
  }

  async function remove(row: Row) {
    if (!confirm(`Xóa ${res.singular} ${row.id}? Bản sao dữ liệu được lưu trong nhật ký hệ thống.`)) return
    try { await api(`/api/${res.key}/${row.id}`, { method: 'DELETE' }); flash('Đã xóa'); setViewing(null); load() }
    catch (e: any) { flash(e.message, 'err') }
  }

  async function run(action: Action, row: Row | null, input: Row = {}) {
    if (!action.fields?.length && action.confirm && !confirm(action.confirm)) return
    try {
      const j = await api(`/api/${res.key}/${row?.id ?? '_'}/${action.key}`, { method: 'POST', body: JSON.stringify(input) })
      flash(j.data?.message ?? `${action.label}: đã xong`)
      setActing(null)
      load()
      if (row) refreshViewing(row.id)
    } catch (e: any) { if (!action.fields?.length) flash(e.message, 'err'); throw e }
  }

  async function exportCsv() {
    try {
      const j = await api(`/api/${res.key}?${params(1, 2000)}`)
      const cols = res.fields.filter((f) => f.type !== 'password')
      const esc = (s: unknown) => {
        let t = String(s ?? '')
        if (/^[=+\-@\t\r]/.test(t)) t = "'" + t // neutralise formula injection in Excel/Sheets
        return `"${t.replace(/"/g, '""')}"`
      }
      const body = (j.data as Row[]).map((r) => ['id', ...cols.map((f) => f.name)].map((n) => {
        const f = cols.find((c) => c.name === n)
        const v = r[n]
        return esc(f?.type === 'ref' ? labels[f.ref!]?.get(v) ?? v : v)
      }).join(','))
      const blob = new Blob(['﻿' + ['Mã', ...cols.map((f) => f.label)].map(esc).join(',') + '\n' + body.join('\n')], { type: 'text/csv;charset=utf-8' })
      const a = document.createElement('a')
      a.href = URL.createObjectURL(blob)
      a.download = `${res.key}.csv`
      a.click()
      URL.revokeObjectURL(a.href)
    } catch (e: any) { flash(e.message, 'err') }
  }

  const pages = Math.max(1, Math.ceil(total / pageSize))
  const canCreate = perms.create && !res.noCreate
  const canEdit = perms.edit && !res.noEdit
  const canDelete = perms.delete && !res.noDelete
  const from = total ? (page - 1) * pageSize + 1 : 0
  const to = Math.min(total, page * pageSize)

  return (
    <div className={compact ? 'space-y-3' : 'space-y-5'}>
      {/* page header */}
      <div className="flex flex-wrap items-end gap-3 justify-between">
        <div>
          {compact ? <h3 className="text-base font-semibold text-ink">{title ?? res.title}</h3> : <>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-gold-600 mb-1">{res.title !== title ? res.title : 'Quản lý'}</p>
            <h1 className="text-2xl md:text-[28px] font-bold tracking-tight text-navy-900">{title ?? res.title}</h1>
          </>}
        </div>
        <div className="flex flex-wrap gap-2">
          {pageActions.map((a) => (
            <button key={a.key} className="btn-secondary" onClick={() => setActing({ action: a, row: null })}><Zap className="h-4 w-4 text-gold-500" />{a.label}</button>
          ))}
          {!compact && <button className="btn-secondary" onClick={exportCsv}><Download className="h-4 w-4" />Xuất CSV</button>}
          {canCreate && <button className={compact ? 'btn-secondary btn-sm' : 'btn-primary'} onClick={() => setEditing({})}><Plus className="h-4 w-4" />Thêm {compact ? 'dòng' : res.singular}</button>}
        </div>
      </div>

      {msg && (
        <div role="status" className={`flex items-start justify-between gap-3 rounded-xl px-4 py-3 text-sm ring-1 ${msg.type === 'ok' ? 'bg-emerald-50 text-emerald-800 ring-emerald-200' : 'bg-red-50 text-red-800 ring-red-200'}`}>
          <span>{msg.text}</span>
          <button onClick={() => setMsg(null)} aria-label="Đóng" className="opacity-60 hover:opacity-100"><X className="h-4 w-4" /></button>
        </div>
      )}

      <div className="card overflow-hidden">
        {!compact && (
          <div className="flex flex-wrap items-center gap-3 px-4 py-3 border-b border-navy-50">
            {res.searchFields.length > 0 && (
              <div className="relative flex-1 min-w-[220px] max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-mute" />
                <input className="input pl-9 bg-canvas border-transparent focus:bg-white" type="search" placeholder="Tìm kiếm…" value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
            )}
            {statusField && (
              <div className="flex flex-wrap gap-1.5">
                {['', ...statusField.options!].map((o) => (
                  <button key={o || 'all'} onClick={() => { setPage(1); setStatus(o) }}
                    className={`h-8 px-3 rounded-full text-xs font-semibold transition-colors ${status === o ? 'bg-navy-800 text-white' : 'bg-canvas text-ink-soft hover:bg-navy-50'}`}>
                    {o || 'Tất cả'}
                  </button>
                ))}
              </div>
            )}
            <span className="ml-auto text-xs text-ink-mute tabular-nums">{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : `${total.toLocaleString('vi-VN')} bản ghi`}</span>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-canvas/60">
              <tr className="text-left text-[11px] font-semibold uppercase tracking-wider text-ink-mute">
                {res.key !== 'users' && <th className="px-4 py-3 whitespace-nowrap">Mã</th>}
                {listFields.map((f) => <th key={f.name} className="px-4 py-3 whitespace-nowrap">{f.label}</th>)}
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-50">
              {loading && rows.length === 0 ? (
                [...Array(compact ? 2 : 6)].map((_, i) => (
                  <tr key={i}><td colSpan={listFields.length + 1} className="px-4 py-3.5"><div className="h-4 rounded bg-navy-50 animate-pulse" style={{ width: `${60 + ((i * 13) % 35)}%` }} /></td></tr>
                ))
              ) : rows.length === 0 ? (
                <tr><td colSpan={listFields.length + 1} className="px-4 py-14 text-center text-ink-mute">
                  <Inbox className="h-8 w-8 mx-auto mb-2 text-navy-200" />Chưa có dữ liệu
                </td></tr>
              ) : rows.map((r) => (
                <tr key={r.id} onClick={() => setViewing(r)} className={`group cursor-pointer transition-colors hover:bg-gold-50/60 ${loading ? 'opacity-60' : ''}`}>
                  {res.key !== 'users' && <td className="px-4 py-3 font-mono text-xs text-ink-mute whitespace-nowrap group-hover:text-navy-700">{r.id}</td>}
                  {listFields.map((f) => (
                    <td key={f.name} className={`px-4 py-3 align-top ${f.type === 'textarea' || f.name === 'noi_dung' ? 'min-w-[18rem] max-w-md' : 'whitespace-nowrap'}`}>
                      <div className={f.type === 'textarea' || f.name === 'noi_dung' ? 'line-clamp-2 text-ink' : ''}>{display(f, r[f.name], labels)}</div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {!compact && pages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-navy-50 text-sm text-ink-soft">
            <span className="tabular-nums">{from}–{to} / {total.toLocaleString('vi-VN')}</span>
            <div className="flex items-center gap-1">
              <button className="btn-ghost btn-sm" disabled={page <= 1} onClick={() => setPage(page - 1)} aria-label="Trang trước"><ChevronLeft className="h-4 w-4" /></button>
              <span className="px-2 tabular-nums">Trang {page}/{pages}</span>
              <button className="btn-ghost btn-sm" disabled={page >= pages} onClick={() => setPage(page + 1)} aria-label="Trang sau"><ChevronRight className="h-4 w-4" /></button>
            </div>
          </div>
        )}
      </div>

      {viewing && (
        <Drawer onClose={() => setViewing(null)}>
          <div className="sticky top-0 z-10 bg-white/95 backdrop-blur border-b border-navy-50 px-6 py-4 flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-gold-600">{res.singular}</p>
              <h2 className="text-lg font-bold text-navy-900 truncate">{res.key === 'users' ? viewing.ho_ten : viewing.id}</h2>
            </div>
            <button onClick={() => setViewing(null)} className="btn-ghost h-9 w-9 px-0" aria-label="Đóng"><X className="h-5 w-5" /></button>
          </div>

          <div className="px-6 py-5">
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
              {res.fields.filter((f) => f.type !== 'password').map((f) => (
                <div key={f.name} className={f.type === 'textarea' ? 'sm:col-span-2' : ''}>
                  <dt className="label">{f.label}</dt>
                  <dd className={f.type === 'textarea' && viewing[f.name] ? 'whitespace-pre-wrap text-sm leading-relaxed bg-canvas rounded-lg p-3 max-h-80 overflow-y-auto' : 'text-sm text-ink'}>{display(f, viewing[f.name], labels)}</dd>
                </div>
              ))}
            </dl>

            {res.key === 'de_xuat' && (
              <div className="mt-6 pt-5 border-t border-navy-50">
                <ResourceManager compact resourceKey="de_xuat_chi_tiet" title="Chi tiết đề xuất" filters={{ id_de_xuat: viewing.id }}
                  perms={viewing.trang_thai === 'Đã duyệt' ? { create: false, edit: false, delete: false, approve: false } : perms} />
              </div>
            )}
          </div>

          <div className="sticky bottom-0 bg-white/95 backdrop-blur border-t border-navy-50 px-6 py-3 flex flex-wrap items-center gap-2">
            {rowActions.filter((a) => !a.show || a.show(viewing)).map((a) => (
              <button key={a.key} className="btn-gold" onClick={() => a.fields?.length ? setActing({ action: a, row: viewing }) : run(a, viewing).catch(() => {})}>
                <Zap className="h-4 w-4" />{a.label}
              </button>
            ))}
            {canEdit && !res.locked?.(viewing) && <button className="btn-secondary" onClick={() => setEditing(viewing)}><Pencil className="h-4 w-4" />Sửa</button>}
            {canDelete && !res.locked?.(viewing) && <button className="btn-danger ml-auto" onClick={() => remove(viewing)}><Trash2 className="h-4 w-4" />Xóa</button>}
            {res.locked?.(viewing) && <span className="flex items-center gap-1.5 text-sm text-ink-mute"><Lock className="h-4 w-4" />{res.locked(viewing)}</span>}
          </div>
        </Drawer>
      )}

      {editing && (
        <FormModal title={`${editing.id ? 'Sửa' : 'Thêm'} ${res.singular}`} subtitle={editing.id && res.key !== 'users' ? editing.id : undefined}
          fields={res.fields.filter((f) => !f.ro && f.inForm !== false && (!editing.id || !f.createOnly || f.type === 'password'))}
          initial={editing.id ? editing : { ...filters }} isNew={!editing.id} refs={refs} onClose={() => setEditing(null)}
          onSubmit={async (payload) => {
            if (editing.id && !payload.password) delete payload.password // blank = keep password
            await api(editing.id ? `/api/${res.key}/${editing.id}` : `/api/${res.key}`, {
              method: editing.id ? 'PATCH' : 'POST', body: JSON.stringify({ ...filters, ...payload }),
            })
            setEditing(null); flash('Đã lưu'); load()
            if (editing.id) refreshViewing(editing.id)
          }} />
      )}

      {acting && (
        <FormModal title={acting.action.label} subtitle={acting.row?.id} fields={acting.action.fields ?? []} initial={{}} isNew refs={refs}
          submitLabel={acting.action.label} onClose={() => setActing(null)}
          onSubmit={async (payload) => { await run(acting.action, acting.row, payload) }} />
      )}
    </div>
  )
}

function useEscape(onClose: () => void) {
  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', k)
    document.body.style.overflow = 'hidden'
    return () => { window.removeEventListener('keydown', k); document.body.style.overflow = '' }
  }, [onClose])
}

function Drawer({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  useEscape(onClose)
  return (<Portal>
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-navy-950/40 backdrop-blur-[2px]" onClick={onClose} />
      <div className="absolute right-0 top-0 h-full w-full sm:max-w-2xl bg-white shadow-pop overflow-y-auto flex flex-col animate-[slidein_.2s_ease-out]">
        {children}
      </div>
      <style>{'@keyframes slidein{from{transform:translateX(24px);opacity:.6}to{transform:none;opacity:1}}'}</style>
    </div>
  </Portal>)
}

function FormModal({ title, subtitle, fields, initial, isNew, refs, onClose, onSubmit, submitLabel = 'Lưu' }: {
  title: string; subtitle?: string; fields: Field[]; initial: Row; isNew: boolean; refs: Record<string, Option[]>
  onClose: () => void; onSubmit: (payload: Row) => Promise<void>; submitLabel?: string
}) {
  useEscape(onClose)
  const [form, setForm] = useState<Row>(() => {
    const v: Row = {}
    for (const f of fields) v[f.name] = f.type === 'password' ? '' : initial[f.name] ?? (isNew ? f.default ?? (f.type === 'bool' ? false : '') : f.type === 'bool' ? false : '')
    return v
  })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const wide = (f: Field) => f.type === 'textarea' || f.name === 'noi_dung' || f.type === 'bool'

  return (<Portal>
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center sm:p-6" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-navy-950/50 backdrop-blur-[2px]" onClick={onClose} />
      <form onSubmit={async (e) => {
        e.preventDefault(); setBusy(true); setError('')
        try { await onSubmit({ ...form }) } catch (err: any) { setError(err.message); setBusy(false) }
      }} className="relative w-full sm:max-w-2xl max-h-[92vh] flex flex-col bg-white rounded-t-2xl sm:rounded-2xl shadow-pop">
        <div className="flex items-start justify-between gap-3 px-6 pt-5 pb-4 border-b border-navy-50">
          <div>
            <h2 className="text-lg font-bold text-navy-900">{title}</h2>
            {subtitle && <p className="text-xs font-mono text-ink-mute mt-0.5">{subtitle}</p>}
          </div>
          <button type="button" onClick={onClose} className="btn-ghost h-9 w-9 px-0" aria-label="Đóng"><X className="h-5 w-5" /></button>
        </div>

        <div className="px-6 py-5 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-4">
          {fields.map((f) => {
            const required = !!f.required && !(f.type === 'password' && !isNew)
            const set = (v: any) => setForm((s) => ({ ...s, [f.name]: v }))
            const common = { id: `f-${f.name}`, className: 'input', required, value: form[f.name] ?? '', onChange: (e: React.ChangeEvent<any>) => set(e.target.value) }
            if (f.type === 'bool') return (
              <label key={f.name} className="sm:col-span-2 flex items-center gap-3 rounded-lg border border-navy-100 px-3 py-2.5 cursor-pointer hover:bg-canvas">
                <input type="checkbox" className="h-4 w-4 accent-navy-800" checked={!!form[f.name]} onChange={(e) => set(e.target.checked)} />
                <span className="text-sm font-medium text-ink">{f.label}</span>
              </label>
            )
            return (
              <div key={f.name} className={wide(f) ? 'sm:col-span-2' : ''}>
                <label htmlFor={`f-${f.name}`} className="label">{f.label}{required && <span className="text-red-500 normal-case"> *</span>}</label>
                {f.type === 'textarea' ? <textarea rows={4} {...common} />
                  : f.type === 'select' ? (
                    <select {...common}>
                      {!required && <option value="">—</option>}
                      {required && !form[f.name] && <option value="">— Chọn —</option>}
                      {/* keep legacy values imported from the sheet selectable */}
                      {form[f.name] && !f.options!.includes(form[f.name]) && <option value={form[f.name]}>{form[f.name]}</option>}
                      {f.options!.map((o) => <option key={o} value={o}>{f.name === 'loai_de_xuat' ? PROPOSAL_KINDS[o] ?? o : o}</option>)}
                    </select>
                  ) : f.type === 'ref' ? (
                    <select {...common}>
                      <option value="">— Chọn —</option>
                      {(refs[f.ref!] ?? []).map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  ) : f.type === 'password' ? (
                    <input type="password" autoComplete="new-password" minLength={8} placeholder={isNew ? '' : 'Để trống nếu không đổi'} {...common} />
                  ) : (
                    <input type={f.type === 'money' ? 'number' : f.type} step={f.type === 'number' || f.type === 'money' ? 'any' : undefined} {...common} />
                  )}
              </div>
            )
          })}
        </div>

        {error && <p className="mx-6 mb-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 ring-1 ring-red-200" role="alert">{error}</p>}
        <div className="flex justify-end gap-2 px-6 py-4 border-t border-navy-50 bg-canvas/50 rounded-b-2xl">
          <button type="button" className="btn-secondary" onClick={onClose}>Hủy</button>
          <button className="btn-primary min-w-[96px]" disabled={busy}>{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : submitLabel}</button>
        </div>
      </form>
    </div>
  </Portal>)
}
