'use client'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Loader2, RotateCw, Save, Send, Eye, CopyCheck } from 'lucide-react'
import { ALERT_CODES } from '@/lib/resources'
import { useConfirm } from '@/components/ConfirmDialog'

/** V191 "Cấu hình gửi email": every alert on one screen, edited in place, with the latest send log underneath. */
type Cfg = {
  id: string; ma_canh_bao: string; ten_canh_bao: string | null; bat: boolean; so_ngay_bao_truoc: number | null; gio_gui: string | null
  email_gui: string | null; email_nhan: string | null; gui_nguoi_thuc_hien: string | null; gui_nguoi_lam_cung: string | null; gui_nguoi_giao: string | null; ghi_chu: string | null
}
type Log = { id: string; ngay_gui: string | null; ma_canh_bao: string | null; nguoi_nhan: string | null; trang_thai: string | null; tieu_de: string | null; noi_dung: string | null }
const FLAGS = [['gui_nguoi_thuc_hien', 'Người thực hiện'], ['gui_nguoi_lam_cung', 'Người làm cùng'], ['gui_nguoi_giao', 'Người giao việc']] as const
const EDIT = ['bat', 'so_ngay_bao_truoc', 'gio_gui', 'email_gui', 'email_nhan', 'gui_nguoi_thuc_hien', 'gui_nguoi_lam_cung', 'gui_nguoi_giao'] as const
// only the work alerts know who is involved; the three boxes do nothing on the others
const HAS_STAFF = new Set(['CONG_VIEC_QUA_HAN', 'CONG_VIEC_CU_CHUA_XONG', 'CVHN_CHUA_XONG'])
// alerts the system can evaluate today (the rest are kept from V191 but not checked yet)
const SUPPORTED = new Set(['CONG_VIEC_QUA_HAN', 'CONG_VIEC_CU_CHUA_XONG', 'CVHN_CHUA_XONG', 'BAO_TRI_SAP_HAN', 'BAO_TRI_DEN_HAN', 'DE_XUAT_CHO_DUYET', 'KHO_VAT_TU_SAP_HET', 'KHACH_THUE_SAP_HET_HAN'])
const on = (v: unknown) => /^(bật|bat|true|1|có|co|x)$/i.test(String(v ?? '').trim())
const STATE: Record<string, [string, string]> = { DA_GUI: ['Đã gửi', 'pill-green'], LOI: ['Lỗi', 'pill-red'], GUI: ['Đã gửi', 'pill-green'] }
const when = (iso: string | null) => { if (!iso) return '—'; const d = new Date(iso); return isNaN(d.getTime()) ? iso : new Intl.DateTimeFormat('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh', day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(d) }

async function api(url: string, init?: RequestInit) {
  const r = await fetch(url, { ...init, headers: { 'Content-Type': 'application/json' } })
  const j = await r.json().catch(() => null)
  if (r.status === 401) { window.location.href = '/login'; throw new Error('Phiên đăng nhập đã hết') }
  if (!r.ok || !j?.success) throw new Error(j?.error || 'Có lỗi xảy ra')
  return j
}

export default function EmailAlerts({ canEdit }: { canEdit: boolean }) {
  const [saved, setSaved] = useState<Cfg[]>([])
  const [rows, setRows] = useState<Cfg[]>([])
  const [logs, setLogs] = useState<Log[]>([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState('')
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)
  const [from, setFrom] = useState(''), [to, setTo] = useState('')
  const [confirm, dialog] = useConfirm()

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [c, l] = await Promise.all([api('/api/cau_hinh_email_canh_bao?pageSize=200'), api('/api/nhat_ky_email_canh_bao?pageSize=30')])
      setSaved(c.data); setRows(c.data); setLogs(l.data)
      setFrom((f) => f || c.data[0]?.email_gui || ''); setTo((t) => t || c.data[0]?.email_nhan || '')
    } catch (e: any) { setMsg({ ok: false, text: e.message }) } finally { setLoading(false) }
  }, [])
  useEffect(() => { load() }, [load])

  const set = (id: string, k: keyof Cfg, v: any) => setRows((rs) => rs.map((r) => (r.id === id ? { ...r, [k]: v } : r)))
  const dirty = useMemo(() => rows.filter((r) => { const s = saved.find((x) => x.id === r.id); return !s || EDIT.some((k) => String(r[k] ?? '') !== String(s[k] ?? '')) }), [rows, saved])
  const onCount = rows.filter((r) => r.bat).length

  async function saveAll() {
    if (!dirty.length) { setMsg({ ok: true, text: 'Không có thay đổi nào cần lưu.' }); return true }
    setBusy('save'); setMsg(null)
    try {
      for (const r of dirty) {
        const s = saved.find((x) => x.id === r.id)!
        const patch: Record<string, any> = {}
        for (const k of EDIT) if (String(r[k] ?? '') !== String(s[k] ?? '')) patch[k] = r[k]
        await api(`/api/cau_hinh_email_canh_bao/${r.id}`, { method: 'PATCH', body: JSON.stringify(patch) })
      }
      setSaved(rows); setMsg({ ok: true, text: `Đã lưu ${dirty.length} cảnh báo.` }); return true
    } catch (e: any) { setMsg({ ok: false, text: 'Chưa lưu hết: ' + e.message }); await load(); return false } finally { setBusy('') }
  }
  async function run(send: boolean) {
    if (dirty.length && !(await saveAll())) return
    if (send && !(await confirm(`Gửi email ngay cho ${onCount} cảnh báo đang bật?\n\nMỗi cảnh báo chỉ gửi một lần trong ngày; cảnh báo đã gửi hôm nay sẽ được bỏ qua.`, { title: 'Gửi ngay', okLabel: 'Gửi ngay' }))) return
    setBusy(send ? 'send' : 'preview'); setMsg(null)
    try {
      const j = await api('/api/cau_hinh_email_canh_bao/_/chay_ngay', { method: 'POST', body: JSON.stringify({ che_do: send ? 'Gửi thật ngay bây giờ' : 'Xem trước (không gửi mail)' }) })
      setMsg({ ok: true, text: j.data?.message ?? 'Đã chạy.' }); if (send) await load()
    } catch (e: any) { setMsg({ ok: false, text: e.message }) } finally { setBusy('') }
  }
  const applyAll = () => { setRows((rs) => rs.map((r) => ({ ...r, email_gui: from.trim() || r.email_gui, email_nhan: to.trim() || r.email_nhan }))); setMsg({ ok: true, text: 'Đã điền email gửi và email nhận cho tất cả cảnh báo. Bấm “Lưu tất cả” để lưu.' }) }

  const inp = 'input h-9 lg:h-8 lg:!py-0 text-[13px] w-full'
  const btn = 'btn-secondary h-9 lg:h-8 whitespace-nowrap text-[13px]'
  const lastErr = logs.find((l) => l.trang_thai === 'LOI')
  const lastOk = logs.find((l) => l.trang_thai === 'DA_GUI')
  const failing = lastErr && (!lastOk || String(lastErr.ngay_gui) > String(lastOk.ngay_gui))

  return (
    <div className="flex flex-1 flex-col lg:min-h-0">
      {dialog}
      <div className="flex shrink-0 flex-wrap items-baseline gap-x-5 gap-y-1 border-b border-navy-200 bg-white px-4 py-2 lg:px-5">
        <span className="text-[12.5px] text-ink-mute">PHI LONG / <b className="text-navy-800">Cấu hình gửi email</b></span>
        <h1 className="text-[22px] font-black text-navy-900">Cấu hình gửi email</h1>
      </div>

      <div className="flex flex-col gap-3 px-4 py-3 lg:min-h-0 lg:flex-1 lg:px-5">
        <div className="card flex flex-col lg:min-h-0 lg:flex-[3]">
          <div className="shrink-0 space-y-2 border-b border-navy-100 p-3">
            <p className={`text-[13px] font-bold ${failing ? 'text-red-700' : 'text-green-700'}`}>
              ● Tự động gửi mỗi ngày lúc 08:00 · {onCount}/{rows.length} cảnh báo bật
              {failing && <span className="font-semibold"> · lần gửi gần nhất bị lỗi: {/cannot be null: data|chưa được cập nhật/i.test(String(lastErr!.noi_dung)) ? 'Apps Script chưa được cập nhật phần gửi thư nên thư chưa đi' : lastErr!.noi_dung || 'không rõ'}</span>}
            </p>
            <div className="grid grid-cols-1 gap-2 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]">
              <input className={inp} aria-label="Email gửi dùng chung" placeholder="Email gửi dùng chung" value={from} onChange={(e) => setFrom(e.target.value)} disabled={!canEdit} />
              <input className={inp} aria-label="Email nhận dùng chung" placeholder="Email nhận dùng chung (cách nhau dấu ;)" value={to} onChange={(e) => setTo(e.target.value)} disabled={!canEdit} />
              <div className="flex flex-wrap gap-2">
                {canEdit && <button className={btn} onClick={applyAll}><CopyCheck className="h-4 w-4" />Áp dụng cho tất cả</button>}
                {canEdit && <button className="btn-primary h-9 lg:h-8 whitespace-nowrap text-[13px]" onClick={saveAll} disabled={busy === 'save'}>{busy === 'save' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}Lưu tất cả{dirty.length ? ` (${dirty.length})` : ''}</button>}
                {canEdit && <button className={btn} onClick={() => run(true)} disabled={!!busy}>{busy === 'send' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}Gửi ngay</button>}
                {canEdit && <button className={btn} onClick={() => run(false)} disabled={!!busy}>{busy === 'preview' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Eye className="h-4 w-4" />}Xem trước</button>}
                <button className={btn} onClick={load} disabled={loading}><RotateCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />Làm mới</button>
              </div>
            </div>
            {msg && <p role="status" className={`rounded-[8px] border px-3 py-2 text-[13px] font-semibold ${msg.ok ? 'border-green-200 bg-green-50 text-green-800' : 'border-red-200 bg-red-50 text-red-800'}`}>{msg.text}</p>}
          </div>

          <div className="lg:min-h-0 lg:flex-1 lg:overflow-y-auto">
            {/* header row (desktop) */}
            <div className="sticky top-0 z-[1] hidden grid-cols-[44px_minmax(0,2.1fr)_84px_124px_minmax(0,1.3fr)_minmax(0,1.5fr)_minmax(0,2fr)] gap-x-3 border-b border-navy-200 bg-navy-50 px-3 py-2 text-[12.5px] font-extrabold text-navy-900 lg:grid">
              <span>Bật</span><span>Cảnh báo</span><span>Báo trước (ngày)</span><span>Giờ gửi</span><span>Email gửi</span><span>Email nhận</span><span>Gửi cho nhân viên</span>
            </div>
            {loading && !rows.length && <p className="p-6 text-center text-sm text-ink-mute"><Loader2 className="mr-2 inline h-4 w-4 animate-spin" />Đang tải…</p>}
            {rows.map((r) => {
              const changed = dirty.some((d) => d.id === r.id), name = r.ten_canh_bao || ALERT_CODES[r.ma_canh_bao] || r.ma_canh_bao
              return (
                <div key={r.id} className={`grid grid-cols-2 items-center gap-x-3 gap-y-2 border-b border-navy-100 px-3 py-2.5 lg:grid-cols-[44px_minmax(0,2.1fr)_84px_124px_minmax(0,1.3fr)_minmax(0,1.5fr)_minmax(0,2fr)] lg:py-1 ${changed ? 'bg-amber-50' : ''}`}>
                  <label className="col-span-2 flex items-center gap-3 lg:contents">
                    <input type="checkbox" className="h-[18px] w-[18px] accent-[#d91828]" aria-label={`Bật ${name}`} checked={!!r.bat} disabled={!canEdit} onChange={(e) => set(r.id, 'bat', e.target.checked)} />
                    <span className="min-w-0">
                      <span className="block text-[14.5px] font-extrabold leading-snug text-navy-900">{name}</span>
                      {!SUPPORTED.has(r.ma_canh_bao) ? <span className="block text-[12px] text-amber-700">Hệ thống mới chưa kiểm tra được loại này, bật cũng chưa gửi.</span>
                        : r.ghi_chu && <span className="block text-[12px] text-ink-mute">{r.ghi_chu}</span>}
                    </span>
                  </label>
                  <label className="min-w-0"><span className="mb-0.5 block text-[11px] font-bold uppercase text-ink-mute lg:hidden">Báo trước (ngày)</span>
                    <input type="number" min={0} max={365} className={inp} aria-label={`Báo trước (ngày) · ${name}`} value={r.so_ngay_bao_truoc ?? ''} disabled={!canEdit} onChange={(e) => set(r.id, 'so_ngay_bao_truoc', e.target.value === '' ? null : Number(e.target.value))} /></label>
                  <label className="min-w-0"><span className="mb-0.5 block text-[11px] font-bold uppercase text-ink-mute lg:hidden">Giờ gửi</span>
                    <input type="time" className={inp} aria-label={`Giờ gửi · ${name}`} value={(r.gio_gui ?? '').slice(0, 5)} disabled={!canEdit} onChange={(e) => set(r.id, 'gio_gui', e.target.value)} /></label>
                  <label className="col-span-2 min-w-0 lg:col-span-1"><span className="mb-0.5 block text-[11px] font-bold uppercase text-ink-mute lg:hidden">Email gửi</span>
                    <input className={inp} aria-label={`Email gửi · ${name}`} value={r.email_gui ?? ''} disabled={!canEdit} onChange={(e) => set(r.id, 'email_gui', e.target.value)} /></label>
                  <label className="col-span-2 min-w-0 lg:col-span-1"><span className="mb-0.5 block text-[11px] font-bold uppercase text-ink-mute lg:hidden">Email nhận</span>
                    <input className={inp} aria-label={`Email nhận · ${name}`} title={r.email_nhan ?? ''} value={r.email_nhan ?? ''} disabled={!canEdit} onChange={(e) => set(r.id, 'email_nhan', e.target.value)} /></label>
                  <div className="col-span-2 flex flex-wrap gap-x-4 gap-y-1.5 lg:col-span-1">
                    {FLAGS.map(([k, lab]) => (
                      <label key={k} className={`flex items-center gap-1.5 text-[12.5px] font-semibold ${HAS_STAFF.has(r.ma_canh_bao) ? 'text-navy-900' : 'text-navy-300'}`}>
                        <input type="checkbox" className="h-4 w-4 accent-[#2563eb]" checked={on(r[k])} disabled={!canEdit || !HAS_STAFF.has(r.ma_canh_bao)} onChange={(e) => set(r.id, k, e.target.checked ? 'BẬT' : 'TẮT')} />{lab}
                      </label>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
          <p className="shrink-0 border-t border-navy-100 px-3 py-2 text-[12px] leading-relaxed text-ink-mute">
            Hệ thống gửi một lần mỗi ngày lúc 08:00 cho mọi cảnh báo đang bật; ô “Giờ gửi” và “Email gửi” được giữ như V191 nhưng thư luôn đi từ hộp Gmail của hệ thống. “Gửi cho nhân viên” thêm email của người thực hiện, người làm cùng, người giao việc có trong các mục được báo.
          </p>
        </div>

        <div className="card flex flex-col lg:min-h-0 lg:flex-[2]">
          <h2 className="shrink-0 border-b border-navy-100 px-3 py-2 text-[14px] font-extrabold text-navy-900">Nhật ký gửi gần đây</h2>
          <div className="lg:min-h-0 lg:flex-1 lg:overflow-y-auto">
            <table className="w-full table-fixed text-[13px]">
              <thead className="hidden lg:table-header-group"><tr className="sticky top-0 bg-navy-50 text-left text-[12.5px] font-extrabold text-navy-900">
                <th className="w-[128px] px-3 py-2">Thời gian</th><th className="w-[19%] px-3 py-2">Cảnh báo</th><th className="px-3 py-2">Người nhận</th><th className="w-[84px] px-3 py-2">Trạng thái</th><th className="w-[24%] px-3 py-2">Tiêu đề</th>
              </tr></thead>
              <tbody>
                {!logs.length && <tr><td colSpan={5} className="px-3 py-6 text-center text-ink-mute">Chưa có lần gửi nào.</td></tr>}
                {logs.map((l) => {
                  const st = STATE[String(l.trang_thai)] ?? [l.trang_thai || '—', 'pill-amber']
                  return (
                    <tr key={l.id} className="block border-b border-navy-100 px-3 py-2 align-top lg:table-row lg:p-0">
                      <td className="block tabular-nums text-ink-mute lg:table-cell lg:px-3 lg:py-2">{when(l.ngay_gui)}</td>
                      <td className="block font-bold text-navy-900 lg:table-cell lg:px-3 lg:py-2">{ALERT_CODES[String(l.ma_canh_bao)] ?? l.ma_canh_bao}</td>
                      <td className="block break-words text-[12.5px] lg:table-cell lg:px-3 lg:py-2">{l.nguoi_nhan || '—'}</td>
                      <td className="block lg:table-cell lg:px-3 lg:py-2"><span className={st[1]}>{st[0]}</span></td>
                      <td className="block break-words lg:table-cell lg:px-3 lg:py-2">{l.tieu_de || '—'}{l.trang_thai === 'LOI' && l.noi_dung && <span className="block text-[12px] text-red-700">{l.noi_dung}</span>}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
