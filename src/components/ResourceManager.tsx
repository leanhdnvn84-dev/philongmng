'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Field, getResource, visibleInList, formatMoney, MONEY_FIELDS } from '@/lib/resources'

type Row = Record<string, any>
type Option = { value: string; label: string }

const BADGE: Record<string, string> = {
  active: 'badge-success', available: 'badge-success', completed: 'badge-success', in_use: 'badge-warning',
  occupied: 'badge-warning', in_progress: 'badge-warning', pending: 'badge-warning', medium: 'badge-warning',
  inactive: 'badge-danger', damaged: 'badge-danger', expired: 'badge-danger', terminated: 'badge-danger',
  high: 'badge-danger', maintenance: 'badge-danger', paid: 'badge-success', partial: 'badge-warning', unpaid: 'badge-danger',
}

async function api(url: string, init?: RequestInit) {
  const r = await fetch(url, { ...init, headers: { 'Content-Type': 'application/json' } })
  const j = await r.json().catch(() => ({ success: false, error: 'Phản hồi không hợp lệ' }))
  if (!j.success) throw new Error(j.error || 'Có lỗi xảy ra')
  return j
}

export default function ResourceManager({
  resourceKey, canCreate, canEdit, canDelete,
}: { resourceKey: string; canCreate: boolean; canEdit: boolean; canDelete: boolean }) {
  const res = getResource(resourceKey)!
  const [rows, setRows] = useState<Row[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)
  const [refs, setRefs] = useState<Record<string, Option[]>>({})
  const [editing, setEditing] = useState<Row | null>(null) // {} = new
  const pageSize = 20

  const statusField = res.fields.find((f) => f.name === 'status' && f.type === 'select')
  const listFields = res.fields.filter(visibleInList)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const p = new URLSearchParams({ page: String(page), pageSize: String(pageSize) })
      if (query) p.set('search', query)
      if (statusFilter) p.set('status', statusFilter)
      const j = await api(`/api/${res.key}?${p}`)
      setRows(j.data)
      setTotal(j.total)
    } catch (e: any) {
      setMsg({ type: 'err', text: e.message })
    } finally {
      setLoading(false)
    }
  }, [res.key, page, query, statusFilter])

  useEffect(() => { load() }, [load])

  // dropdown options for foreign keys
  useEffect(() => {
    const keys = Array.from(new Set(res.fields.filter((f) => f.type === 'ref').map((f) => f.ref!)))
    keys.forEach((k) =>
      api(`/api/${k}?options=1`).then((j) => setRefs((r) => ({ ...r, [k]: j.data }))).catch(() => {})
    )
  }, [res])

  const refLabel = useMemo(() => {
    const m: Record<string, Map<string, string>> = {}
    for (const [k, list] of Object.entries(refs)) m[k] = new Map(list.map((o) => [o.value, o.label]))
    return m
  }, [refs])

  function cell(f: Field, row: Row) {
    const v = row[f.name]
    if (v === null || v === undefined || v === '') return <span className="text-gray-400">—</span>
    if (f.type === 'ref') return refLabel[f.ref!]?.get(v) ?? '…'
    if (f.type === 'select') {
      const label = f.options?.find((o) => o.value === v)?.label ?? v
      return <span className={BADGE[v] ?? 'badge bg-gray-100 text-gray-800'}>{label}</span>
    }
    if (MONEY_FIELDS.includes(f.name)) return formatMoney(v)
    return String(v)
  }

  async function remove(row: Row) {
    if (!confirm(`Xóa ${res.singular} này? Thao tác không thể hoàn tác.`)) return
    try {
      await api(`/api/${res.key}/${row.id}`, { method: 'DELETE' })
      setMsg({ type: 'ok', text: 'Đã xóa' })
      load()
    } catch (e: any) { setMsg({ type: 'err', text: e.message }) }
  }

  async function pay(row: Row) {
    const left = Number(row.amount) - Number(row.paid_amount)
    const v = prompt(`Số tiền thu (còn nợ ${formatMoney(left)}):`, String(left))
    if (v === null) return
    try {
      await api(`/api/invoices/${row.id}/pay`, { method: 'POST', body: JSON.stringify({ amount: Number(v) }) })
      setMsg({ type: 'ok', text: 'Đã ghi nhận thanh toán' })
      load()
    } catch (e: any) { setMsg({ type: 'err', text: e.message }) }
  }

  async function generate() {
    const period = prompt('Tạo hóa đơn cho kỳ (YYYY-MM):', new Date().toISOString().slice(0, 7))
    if (!period) return
    try {
      const j = await api('/api/invoices/generate', { method: 'POST', body: JSON.stringify({ period }) })
      setMsg({ type: 'ok', text: `Đã tạo ${j.created} hóa đơn (bỏ qua ${j.skipped} đã có)` })
      load()
    } catch (e: any) { setMsg({ type: 'err', text: e.message }) }
  }

  async function exportCsv() {
    try {
      const p = new URLSearchParams({ page: '1', pageSize: '1000' })
      if (query) p.set('search', query)
      if (statusFilter) p.set('status', statusFilter)
      const j = await api(`/api/${res.key}?${p}`)
      const esc = (s: unknown) => {
        let t = String(s ?? '')
        if (/^[=+\-@\t\r]/.test(t)) t = "'" + t // neutralise spreadsheet formula injection
        return `"${t.replace(/"/g, '""')}"`
      }
      const head = listFields.map((f) => esc(f.label)).join(',')
      const body = (j.data as Row[]).map((r) =>
        listFields.map((f) => esc(f.type === 'ref' ? refLabel[f.ref!]?.get(r[f.name]) ?? '' : r[f.name])).join(',')).join('\n')
      const blob = new Blob(['﻿' + head + '\n' + body], { type: 'text/csv;charset=utf-8' })
      const a = document.createElement('a')
      a.href = URL.createObjectURL(blob)
      a.download = `${res.key}.csv`
      a.click()
      URL.revokeObjectURL(a.href)
    } catch (e: any) { setMsg({ type: 'err', text: e.message }) }
  }

  const pages = Math.max(1, Math.ceil(total / pageSize))

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2 justify-between">
        <h1 className="text-2xl font-bold">{res.icon} {res.title}</h1>
        <div className="flex gap-2">
          {res.key === 'invoices' && canCreate && <button className="btn-secondary" onClick={generate}>Tạo hóa đơn tháng</button>}
          <button className="btn-secondary" onClick={exportCsv}>Xuất CSV</button>
          {canCreate && !res.readonly && <button className="btn-primary" onClick={() => setEditing({})}>+ Thêm {res.singular}</button>}
        </div>
      </div>

      <form className="flex flex-wrap gap-2" onSubmit={(e) => { e.preventDefault(); setPage(1); setQuery(search.trim()) }}>
        {res.searchFields.length > 0 && (
          <input className="input max-w-xs" placeholder="Tìm kiếm…" value={search} onChange={(e) => setSearch(e.target.value)} />
        )}
        {statusField && (
          <select className="input max-w-[12rem]" value={statusFilter} onChange={(e) => { setPage(1); setStatusFilter(e.target.value) }}>
            <option value="">Mọi trạng thái</option>
            {statusField.options!.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        )}
        {res.searchFields.length > 0 && <button className="btn-secondary">Tìm</button>}
      </form>

      {msg && (
        <div role="status" className={`p-3 rounded text-sm ${msg.type === 'ok' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
          {msg.text} <button className="underline ml-2" onClick={() => setMsg(null)}>đóng</button>
        </div>
      )}

      <div className="card p-0 table-responsive">
        <table className="table text-sm">
          <thead>
            <tr>{listFields.map((f) => <th key={f.name}>{f.label}</th>)}{(canEdit || canDelete) && !res.readonly && <th></th>}</tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={listFields.length + 1} className="text-center text-gray-500 py-6">Đang tải…</td></tr>
            ) : rows.length === 0 ? (
              <tr><td colSpan={listFields.length + 1} className="text-center text-gray-500 py-6">Chưa có dữ liệu</td></tr>
            ) : rows.map((r) => (
              <tr key={r.id}>
                {listFields.map((f) => <td key={f.name}>{cell(f, r)}</td>)}
                {(canEdit || canDelete) && !res.readonly && (
                  <td className="whitespace-nowrap text-right space-x-3">
                    {res.key === 'invoices' && canEdit && r.status !== 'paid' && <button className="text-green-700 hover:underline" onClick={() => pay(r)}>Thu tiền</button>}
                    {canEdit && <button className="text-blue-600 hover:underline" onClick={() => setEditing(r)}>Sửa</button>}
                    {canDelete && <button className="text-red-600 hover:underline" onClick={() => remove(r)}>Xóa</button>}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between text-sm text-gray-600">
        <span>{total} bản ghi</span>
        <div className="space-x-2">
          <button className="btn-secondary" disabled={page <= 1} onClick={() => setPage(page - 1)}>‹</button>
          <span>{page} / {pages}</span>
          <button className="btn-secondary" disabled={page >= pages} onClick={() => setPage(page + 1)}>›</button>
        </div>
      </div>

      {editing && (
        <FormModal
          resourceKey={res.key}
          initial={editing}
          refs={refs}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); setMsg({ type: 'ok', text: 'Đã lưu' }); load() }}
        />
      )}
    </div>
  )
}

function FormModal({
  resourceKey, initial, refs, onClose, onSaved,
}: { resourceKey: string; initial: Row; refs: Record<string, Option[]>; onClose: () => void; onSaved: () => void }) {
  const res = getResource(resourceKey)!
  const isNew = !initial.id
  const fields = res.fields.filter((f) => !f.ro && (isNew || !f.createOnly || f.type === 'password'))
  const [form, setForm] = useState<Row>(() => {
    const v: Row = {}
    for (const f of fields) v[f.name] = initial[f.name] ?? (isNew ? f.default ?? '' : '')
    return v
  })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      const payload = { ...form }
      if (!isNew && !payload.password) delete payload.password // blank = keep current password
      await api(isNew ? `/api/${res.key}` : `/api/${res.key}/${initial.id}`, {
        method: isNew ? 'POST' : 'PATCH', body: JSON.stringify(payload),
      })
      onSaved()
    } catch (err: any) {
      setError(err.message)
      setBusy(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50" role="dialog" aria-modal="true">
      <form onSubmit={submit} className="card w-full max-w-lg max-h-[90vh] overflow-y-auto space-y-3">
        <h2 className="text-lg font-bold">{isNew ? 'Thêm' : 'Sửa'} {res.singular}</h2>
        {fields.map((f) => {
          const required = f.required && !(f.type === 'password' && !isNew)
          const common = {
            className: 'input mt-1', required,
            value: form[f.name] ?? '', onChange: (e: React.ChangeEvent<any>) => setForm({ ...form, [f.name]: e.target.value }),
          }
          return (
            <label key={f.name} className="block text-sm font-medium">
              {f.label}{required && <span className="text-red-500"> *</span>}
              {f.type === 'textarea' ? <textarea rows={3} {...common} />
                : f.type === 'select' ? (
                  <select {...common}>{f.options!.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</select>
                ) : f.type === 'ref' ? (
                  <select {...common}>
                    <option value="">— Chọn —</option>
                    {(refs[f.ref!] ?? []).map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                ) : f.type === 'password' ? (
                  <input type="password" autoComplete="new-password" minLength={8}
                    placeholder={isNew ? '' : 'Để trống nếu không đổi'} {...common} />
                ) : <input type={f.type} step={f.type === 'number' ? 'any' : undefined} {...common} />}
            </label>
          )
        })}
        {error && <p className="text-sm text-red-600" role="alert">{error}</p>}
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" className="btn-secondary" onClick={onClose}>Hủy</button>
          <button className="btn-primary" disabled={busy}>{busy ? 'Đang lưu…' : 'Lưu'}</button>
        </div>
      </form>
    </div>
  )
}
