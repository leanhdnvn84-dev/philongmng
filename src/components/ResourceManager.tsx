'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Action, Field, getResource, visibleInList, formatMoney, formatDate, PROPOSAL_KINDS } from '@/lib/resources'

type Row = Record<string, any>
type Option = { value: string; label: string }
export type UiPerms = { create: boolean; edit: boolean; delete: boolean; approve: boolean }

const RED = /QUÁ HẠN|TRỄ|HẾT HẠN|DƯỚI TỒN|Từ chối|Hủy|Đã thanh lý/i
const AMBER = /SẮP|ĐẾN HẠN|CẦN LÀM|CHỜ|Chờ|Đang|Nháp|Bảo trì|Hẹn/i
const GREEN = /HOÀN THÀNH|CÒN LỊCH|Hoàn thành|Đã duyệt|Đã chốt|Hoạt động|Trong kho|Đã ra|Trống/i
const tone = (v: string) =>
  RED.test(v) ? 'bg-red-100 text-red-800' : AMBER.test(v) ? 'bg-amber-100 text-amber-800' : GREEN.test(v) ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-700'

async function api(url: string, init?: RequestInit) {
  const r = await fetch(url, { ...init, headers: { 'Content-Type': 'application/json' } })
  const j = await r.json().catch(() => ({ success: false, error: 'Phản hồi không hợp lệ' }))
  if (r.status === 401) { window.location.href = '/login'; throw new Error('Phiên đăng nhập đã hết') }
  if (!j.success) throw new Error(j.error || 'Có lỗi xảy ra')
  return j
}

/** Loads dropdown options for every ref field in the given field lists (cached per page). */
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
  if (v === null || v === undefined || v === '') return <span className="text-gray-300">—</span>
  if (f.type === 'ref') return labels[f.ref!]?.get(v) ?? v
  if (f.name === 'loai_de_xuat') return PROPOSAL_KINDS[v] ?? v
  if (f.name === 'loai_giao_dich') return v === 'NHAP' ? 'Nhập' : v === 'XUAT' ? 'Xuất' : v
  if (f.type === 'bool') return v ? '✓' : ''
  if (f.type === 'date') return formatDate(v)
  if (f.type === 'money') return formatMoney(v)
  if (f.type === 'number') return new Intl.NumberFormat('vi-VN').format(Number(v))
  if (f.name === 'canh_bao' || f.name === 'trang_thai' || f.name === 'trang_thai_su_dung') {
    return <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${tone(String(v))}`}>{String(v)}</span>
  }
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
      flash(j.data?.message ?? `${action.label}: xong`)
      setActing(null)
      load()
      if (row) refreshViewing(row.id)
      return true
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

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2 justify-between">
        {compact ? <h3 className="font-semibold">{title ?? res.title}</h3> : <h1 className="text-xl md:text-2xl font-bold">{title ?? res.title}</h1>}
        <div className="flex flex-wrap gap-2">
          {pageActions.map((a) => <button key={a.key} className="btn-secondary" onClick={() => setActing({ action: a, row: null })}>{a.label}</button>)}
          {!compact && <button className="btn-secondary" onClick={exportCsv}>Xuất CSV</button>}
          {canCreate && <button className="btn-primary" onClick={() => setEditing({})}>+ Thêm</button>}
        </div>
      </div>

      {!compact && (
        <form className="flex flex-wrap gap-2" onSubmit={(e) => { e.preventDefault(); setPage(1); setQuery(search.trim()) }}>
          {res.searchFields.length > 0 && (
            <input className="input max-w-xs" type="search" placeholder="Tìm kiếm…" value={search}
              onChange={(e) => { setSearch(e.target.value); if (!e.target.value) { setPage(1); setQuery('') } }} />
          )}
          {statusField && (
            <select className="input max-w-[14rem]" value={status} onChange={(e) => { setPage(1); setStatus(e.target.value) }}>
              <option value="">Mọi trạng thái</option>
              {statusField.options!.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          )}
        </form>
      )}

      {msg && (
        <div role="status" className={`p-3 rounded text-sm ${msg.type === 'ok' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
          {msg.text} <button className="underline ml-2" onClick={() => setMsg(null)}>đóng</button>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600 text-xs uppercase">
            <tr>
              <th className="px-3 py-2 text-left whitespace-nowrap">Mã</th>
              {listFields.map((f) => <th key={f.name} className="px-3 py-2 text-left whitespace-nowrap">{f.label}</th>)}
            </tr>
          </thead>
          <tbody>
            {loading && rows.length === 0 ? (
              <tr><td colSpan={listFields.length + 1} className="text-center text-gray-500 py-8">Đang tải…</td></tr>
            ) : rows.length === 0 ? (
              <tr><td colSpan={listFields.length + 1} className="text-center text-gray-500 py-8">Chưa có dữ liệu</td></tr>
            ) : rows.map((r) => (
              <tr key={r.id} onClick={() => setViewing(r)} className={`border-t cursor-pointer hover:bg-blue-50 ${loading ? 'opacity-60' : ''}`}>
                <td className="px-3 py-2 font-mono text-xs text-gray-500 whitespace-nowrap">{res.key === 'users' ? '' : r.id}</td>
                {listFields.map((f) => (
                  <td key={f.name} className={`px-3 py-2 align-top ${f.type === 'textarea' || f.name === 'noi_dung' ? 'min-w-[16rem] max-w-md' : 'whitespace-nowrap'}`}>
                    <div className={f.type === 'textarea' || f.name === 'noi_dung' ? 'line-clamp-2' : ''}>{display(f, r[f.name], labels)}</div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {!compact && (
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>{total} bản ghi</span>
          <div className="flex items-center gap-2">
            <button className="btn-secondary" disabled={page <= 1} onClick={() => setPage(page - 1)}>‹</button>
            <span>{page} / {pages}</span>
            <button className="btn-secondary" disabled={page >= pages} onClick={() => setPage(page + 1)}>›</button>
          </div>
        </div>
      )}

      {viewing && (
        <Modal onClose={() => setViewing(null)} wide>
          <div className="flex items-start justify-between gap-3 mb-3">
            <h2 className="text-lg font-bold">{res.singular[0].toUpperCase() + res.singular.slice(1)} <span className="font-mono text-gray-500 text-base">{res.key === 'users' ? '' : viewing.id}</span></h2>
            <button onClick={() => setViewing(null)} className="text-2xl leading-none text-gray-400 hover:text-gray-700" aria-label="Đóng">×</button>
          </div>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
            {res.fields.filter((f) => f.type !== 'password').map((f) => (
              <div key={f.name} className={f.type === 'textarea' ? 'sm:col-span-2' : ''}>
                <dt className="text-gray-500 text-xs">{f.label}</dt>
                <dd className={f.type === 'textarea' ? 'whitespace-pre-wrap bg-gray-50 rounded p-2 mt-1 max-h-72 overflow-y-auto' : ''}>{display(f, viewing[f.name], labels)}</dd>
              </div>
            ))}
          </dl>
          <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t">
            {rowActions.filter((a) => !a.show || a.show(viewing)).map((a) => (
              <button key={a.key} className="btn-primary" onClick={() => a.fields?.length ? setActing({ action: a, row: viewing }) : run(a, viewing).catch(() => {})}>{a.label}</button>
            ))}
            {canEdit && !res.locked?.(viewing) && <button className="btn-secondary" onClick={() => setEditing(viewing)}>Sửa</button>}
            {canDelete && !res.locked?.(viewing) && <button className="btn-danger" onClick={() => remove(viewing)}>Xóa</button>}
            {res.locked?.(viewing) && <span className="text-sm text-gray-500 self-center">{res.locked(viewing)}</span>}
          </div>
          {res.key === 'de_xuat' && (
            <div className="mt-5 pt-4 border-t">
              <ResourceManager compact resourceKey="de_xuat_chi_tiet" title="Chi tiết đề xuất" filters={{ id_de_xuat: viewing.id }}
                perms={viewing.trang_thai === 'Đã duyệt' ? { create: false, edit: false, delete: false, approve: false } : perms} />
            </div>
          )}
        </Modal>
      )}

      {editing && (
        <FormModal title={`${editing.id ? 'Sửa' : 'Thêm'} ${res.singular}`} fields={res.fields.filter((f) => !f.ro && f.inForm !== false && (!editing.id || !f.createOnly || f.type === 'password'))}
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
        <FormModal title={acting.action.label + (acting.row ? ` · ${acting.row.id}` : '')} fields={acting.action.fields ?? []} initial={{}} isNew refs={refs}
          submitLabel={acting.action.label} onClose={() => setActing(null)}
          onSubmit={async (payload) => { await run(acting.action, acting.row, payload) }} />
      )}
    </div>
  )
}

function Modal({ children, onClose, wide }: { children: React.ReactNode; onClose: () => void; wide?: boolean }) {
  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', k)
    return () => window.removeEventListener('keydown', k)
  }, [onClose])
  return (
    <div className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center sm:p-4 z-50" role="dialog" aria-modal="true"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className={`bg-white w-full ${wide ? 'sm:max-w-3xl' : 'sm:max-w-lg'} max-h-[92vh] overflow-y-auto rounded-t-2xl sm:rounded-xl p-5 shadow-xl`}>
        {children}
      </div>
    </div>
  )
}

function FormModal({ title, fields, initial, isNew, refs, onClose, onSubmit, submitLabel = 'Lưu' }: {
  title: string; fields: Field[]; initial: Row; isNew: boolean; refs: Record<string, Option[]>
  onClose: () => void; onSubmit: (payload: Row) => Promise<void>; submitLabel?: string
}) {
  const [form, setForm] = useState<Row>(() => {
    const v: Row = {}
    for (const f of fields) v[f.name] = f.type === 'password' ? '' : initial[f.name] ?? (isNew ? f.default ?? (f.type === 'bool' ? false : '') : f.type === 'bool' ? false : '')
    return v
  })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  return (
    <Modal onClose={onClose}>
      <form onSubmit={async (e) => {
        e.preventDefault(); setBusy(true); setError('')
        try { await onSubmit({ ...form }) } catch (err: any) { setError(err.message); setBusy(false) }
      }} className="space-y-3">
        <h2 className="text-lg font-bold">{title}</h2>
        {fields.map((f) => {
          const required = !!f.required && !(f.type === 'password' && !isNew)
          const set = (v: any) => setForm((s) => ({ ...s, [f.name]: v }))
          const common = { className: 'input mt-1', required, value: form[f.name] ?? '', onChange: (e: React.ChangeEvent<any>) => set(e.target.value) }
          if (f.type === 'bool') return (
            <label key={f.name} className="flex items-center gap-2 text-sm font-medium">
              <input type="checkbox" className="h-4 w-4" checked={!!form[f.name]} onChange={(e) => set(e.target.checked)} /> {f.label}
            </label>
          )
          return (
            <label key={f.name} className="block text-sm font-medium">
              {f.label}{required && <span className="text-red-500"> *</span>}
              {f.type === 'textarea' ? <textarea rows={4} {...common} />
                : f.type === 'select' ? (
                  <select {...common}>
                    {!required && <option value="">—</option>}
                    {required && !form[f.name] && <option value="">— Chọn —</option>}
                    {/* keep legacy values imported from the sheet selectable */}
                    {form[f.name] && !f.options!.includes(form[f.name]) && <option value={form[f.name]}>{form[f.name]}</option>}
                    {f.options!.map((o) => <option key={o} value={o}>{o}</option>)}
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
            </label>
          )
        })}
        {error && <p className="text-sm text-red-600" role="alert">{error}</p>}
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" className="btn-secondary" onClick={onClose}>Hủy</button>
          <button className="btn-primary" disabled={busy}>{busy ? 'Đang lưu…' : submitLabel}</button>
        </div>
      </form>
    </Modal>
  )
}
