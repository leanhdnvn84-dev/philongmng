'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { Database, Download, History, Loader2, RotateCcw, Trash2 } from 'lucide-react'
import { useConfirm } from '@/components/ConfirmDialog'
import DataMaint from '@/components/DataMaint'

interface Backup { id: string; thoi_gian: string; nguoi_tao: string | null; loai: string; ghi_chu: string | null; so_bang: number; so_dong: number; kich_thuoc: number; chi_tiet: Record<string, number> }

const LABEL: Record<string, string> = {
  vai_tro: 'Vai trò', phan_quyen: 'Phân quyền', users: 'Người dùng', nhan_vien: 'Nhân viên', nha_thau: 'Nhà thầu', nha_cung_cap: 'Nhà cung cấp',
  khu_vuc: 'Khu vực', hang_muc_bao_tri: 'Chu kỳ bảo trì', chi_tiet_van_hanh: 'Chi tiết vận hành', lich_bao_tri: 'Kế hoạch bảo trì',
  nhat_ky_bao_tri: 'Nhật ký bảo trì', cong_viec: 'Công việc', cong_viec_hang_ngay: 'Công việc hằng ngày', khach_ra_vao: 'Khách ra/vào',
  vat_tu: 'Vật tư', nhap_xuat_kho: 'Nhập xuất kho', thiet_bi: 'Thiết bị', thu_hoi: 'Thu hồi / thanh lý', lich_su_chuyen_thiet_bi: 'Lịch sử chuyển',
  de_xuat: 'Đề xuất', de_xuat_chi_tiet: 'Chi tiết đề xuất', toa_nha: 'Toà nhà', tang: 'Tầng', khach_thue: 'Khách thuê',
  khach_hang_tiem_nang: 'Khách tiềm năng', tien_dien: 'Tiền điện', danh_muc: 'Danh mục giá trị', lich_su_in: 'Lịch sử in',
  lich_su_dang_nhap: 'Lịch sử đăng nhập', cau_hinh_email_canh_bao: 'Cấu hình email', nhat_ky_email_canh_bao: 'Nhật ký email',
  data_audit_archive: 'Lưu trữ kiểm tra', hinh_anh_tien_do: 'Hình ảnh tiến độ', tin_nhan: 'Tin nhắn', audit_logs: 'Nhật ký thao tác', tep_dinh_kem: 'Tệp đính kèm', thanh_toan_dien: 'Thanh toán tiền điện', thue_mat_bang: 'Thuê mặt bằng', cau_hinh_he_thong: 'Cài đặt hệ thống',
}
const KIND: Record<string, string> = { TU_DONG: 'Tự động', TRUOC_NHAP_V27: 'Trước khi nhập V27' }
const kindOf = (k: string) => KIND[k] ?? k
const fmtTime = (iso: string) => new Date(iso).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh', hour12: false, day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
const fmtSize = (b: number) => (b > 1048576 ? (b / 1048576).toFixed(1) + ' MB' : Math.max(1, Math.round(b / 1024)) + ' KB')
async function api(url: string, init?: RequestInit) {
  const r = await fetch(url, init), j = await r.json().catch(() => ({ success: false, error: 'Lỗi mạng' }))
  if (!j.success) throw new Error(j.error || 'Có lỗi xảy ra')
  return j
}

export default function DataCheck({ isAdmin }: { isAdmin: boolean }) {
  const [counts, setCounts] = useState<Record<string, number>>({})
  const [sum, setSum] = useState<{ loi: number; canh_bao: number } | null>(null)
  const [backups, setBackups] = useState<Backup[]>([])
  const [open, setOpen] = useState<string | null>(null)
  const [note, setNote] = useState('')
  const [busy, setBusy] = useState<string | null>(null)
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)
  const [confirm, dialog] = useConfirm()

  const loadCheck = useCallback(async () => {
    try { const j = await api('/api/he_thong/kiem_tra'); setCounts(j.data.counts) } catch (e: any) { setMsg({ ok: false, text: e.message }) }
  }, [])
  const loadBackups = useCallback(async () => {
    try { const j = await api('/api/he_thong/sao_luu'); setBackups(j.data) } catch (e: any) { setMsg({ ok: false, text: e.message }) }
  }, [])
  useEffect(() => { loadCheck(); loadBackups() }, [loadCheck, loadBackups])

  const run = async (key: string, fn: () => Promise<string>) => {
    setBusy(key); setMsg(null)
    try { setMsg({ ok: true, text: await fn() }) } catch (e: any) { setMsg({ ok: false, text: e.message }) } finally { setBusy(null) }
  }
  const create = () => run('create', async () => {
    const j = await api('/api/he_thong/sao_luu', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ghi_chu: note }) })
    setNote(''); await loadBackups(); return `Đã tạo bản sao lưu ${j.data.id} (${j.data.so_dong.toLocaleString('vi-VN')} dòng, ${fmtSize(j.data.kich_thuoc)}).`
  })
  const toDrive = () => run('drive', async () => (await api('/api/he_thong/sao_luu/v27', { method: 'POST' })).data.message)
  const restore = async (b: Backup, tables?: string[]) => {
    const what = tables ? `bảng "${LABEL[tables[0]] ?? tables[0]}"` : 'TẤT CẢ các bảng'
    const okay = await confirm(`Khôi phục ${what} từ bản ${b.id} (${fmtTime(b.thoi_gian)})?\n\nDữ liệu đã sửa hoặc xoá sau thời điểm đó sẽ được đưa về như lúc sao lưu. Dòng mới tạo sau đó được giữ nguyên. Hệ thống tự tạo thêm một bản sao lưu an toàn trước khi khôi phục.`, { danger: true, okLabel: 'Khôi phục' })
    if (!okay) return
    run('restore' + b.id, async () => {
      const j = await api(`/api/he_thong/sao_luu/${b.id}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ tables }) })
      await Promise.all([loadBackups(), loadCheck()])
      return `Đã khôi phục ${Object.keys(j.data.tables).length} bảng. Bản an toàn trước đó: ${j.data.safety}.`
    })
  }
  const remove = async (b: Backup) => {
    if (!(await confirm(`Xoá bản sao lưu ${b.id}? Không thể hoàn tác.`, { danger: true, okLabel: 'Xoá' }))) return
    run('del' + b.id, async () => { await api(`/api/he_thong/sao_luu/${b.id}`, { method: 'DELETE' }); await loadBackups(); return `Đã xoá ${b.id}.` })
  }
  const archive = () => run('archive', async () => {
    const j = await api('/api/he_thong/kiem_tra', { method: 'POST' }); return `Đã lưu ${j.data.saved} nhóm vấn đề vào "Lưu trữ kiểm tra".`
  })

  const totalRows = Object.values(counts).reduce((a, b) => a + b, 0)
  const errs = sum?.loi ?? 0, warns = sum?.canh_bao ?? 0
  const last = backups[0]
  const lastAge = last ? Math.floor((Date.now() - new Date(last.thoi_gian).getTime()) / 864e5) : null

  return (
    <div className="relative space-y-4 px-4 lg:px-5 py-4 lg:min-h-0 lg:flex-1 lg:overflow-y-auto">
      {dialog}
      <div className="flex flex-wrap items-center gap-2">
        <h1 className="text-xl font-extrabold text-navy-900 flex-1 min-w-[200px]">Bảo trì dữ liệu &amp; sao lưu</h1>
        {isAdmin && <button className="btn-secondary" onClick={archive} disabled={!!busy || !(errs + warns)} title="Lưu kết quả quét hiện tại vào Lưu trữ kiểm tra">Lưu kết quả quét</button>}
        <Link href="/data_audit_archive" className="btn-secondary"><History size={15} />Lưu trữ kiểm tra</Link>
      </div>

      {msg && <p role="status" className={`rounded-lg border px-3 py-2 text-sm font-semibold ${msg.ok ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}>{msg.text}</p>}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { l: 'Tổng số bảng', v: Object.keys(counts).length || '—', c: 'text-navy-900' },
          { l: 'Tổng số dòng dữ liệu', v: totalRows ? totalRows.toLocaleString('vi-VN') : '—', c: 'text-navy-900' },
          { l: 'Mục cần xử lý', v: sum ? `${errs + warns}` : '—', c: errs ? 'text-red-600' : warns ? 'text-orange-600' : 'text-green-600', n: sum ? `${errs} lỗi · ${warns} cảnh báo` : '' },
          { l: 'Sao lưu gần nhất', v: last ? (lastAge === 0 ? 'Hôm nay' : `${lastAge} ngày trước`) : 'Chưa có', c: last ? (lastAge! > 7 ? 'text-orange-600' : 'text-green-600') : 'text-red-600', n: last ? fmtTime(last.thoi_gian) : 'Nên tạo ngay' },
        ].map((k) => (
          <div key={k.l} className="card px-4 py-3">
            <div className="text-xs font-bold text-ink-soft">{k.l}</div>
            <div className={`mt-1 text-2xl font-extrabold leading-none ${k.c}`}>{k.v}</div>
            {k.n && <div className="mt-1.5 text-xs text-ink-mute">{k.n}</div>}
          </div>
        ))}
      </div>

      <DataMaint isAdmin={isAdmin} onSummary={setSum} onChanged={() => { loadBackups(); loadCheck() }} />

      <div className="grid gap-4 items-start">
        {/* ── Backup ── */}
        <section className="card">
          <header className="flex items-center gap-2 px-4 py-3 border-b border-navy-100"><Database size={17} className="text-blue-600" /><h2 className="font-extrabold text-navy-900 flex-1">Sao lưu dữ liệu</h2>
            <span className="text-xs text-ink-mute">Giữ 30 bản mới nhất</span></header>
          <div className="p-4 space-y-3">
            {isAdmin ? (
              <div className="flex flex-wrap gap-2">
                <input className="input flex-1 min-w-[160px]" placeholder="Ghi chú (tuỳ chọn)" maxLength={300} value={note} onChange={(e) => setNote(e.target.value)} />
                <button className="btn-primary" onClick={create} disabled={busy === 'create'}>
                  {busy === 'create' ? <Loader2 size={15} className="animate-spin" /> : <Database size={15} />}Tạo bản sao lưu
                </button>
                <a className="btn-secondary" href="/api/he_thong/sao_luu/v27" download title="Toàn bộ dữ liệu hiện tại, cùng sheet và cột như file Google Sheet V27"><Download size={15} />Tải file V27 (Excel)</a>
                <button className="btn-secondary" onClick={toDrive} disabled={busy === 'drive'} title="Lưu file V27 vào thư mục sao lưu trên Google Drive (việc này cũng tự chạy mỗi đêm)">
                  {busy === 'drive' ? <Loader2 size={15} className="animate-spin" /> : <Database size={15} />}Lưu file V27 lên Drive
                </button>
              </div>
            ) : <p className="text-sm text-ink-soft">Chỉ quản trị viên cao nhất được tạo, tải và khôi phục bản sao lưu.</p>}
            <p className="text-xs text-ink-mute leading-relaxed">Bản sao lưu gồm toàn bộ bảng dữ liệu (không gồm mật khẩu). Khi khôi phục, hệ thống tự tạo thêm một bản an toàn trước đó. Tải về dưới dạng .json.gz để cất giữ riêng. Nút “Tải file V27” xuất dữ liệu hiện tại ra file Excel có cùng sheet và cột như file V27 của hệ thống cũ; mỗi đêm một bản như vậy cũng tự lưu lên Google Drive.</p>
            <ul className="divide-y divide-navy-100 border border-navy-100 rounded-lg">
              {backups.length === 0 && <li className="px-3 py-6 text-center text-sm text-ink-mute">Chưa có bản sao lưu nào.</li>}
              {backups.map((b) => (
                <li key={b.id}>
                  <div className="px-3 py-2.5 flex flex-wrap items-center gap-x-3 gap-y-1">
                    <button className="flex-1 min-w-[170px] text-left" onClick={() => setOpen(open === b.id ? null : b.id)} aria-expanded={open === b.id}>
                      <div className="text-sm font-bold text-navy-900">{b.id} · {fmtTime(b.thoi_gian)} <span className={kindOf(b.loai) === 'Thủ công' ? 'pill-blue' : 'pill-gray'}>{kindOf(b.loai)}</span></div>
                      <div className="text-xs text-ink-mute">{b.so_dong.toLocaleString('vi-VN')} dòng · {fmtSize(b.kich_thuoc)} · {b.nguoi_tao ?? '—'}{b.ghi_chu ? ` · ${b.ghi_chu}` : ''}</div>
                    </button>
                    {isAdmin && <div className="flex gap-1">
                      <a className="btn-secondary btn-sm" href={`/api/he_thong/sao_luu/${b.id}`} download><Download size={14} />Tải</a>
                      <button className="btn-secondary btn-sm" onClick={() => restore(b)} disabled={!!busy}>{busy === 'restore' + b.id ? <Loader2 size={14} className="animate-spin" /> : <RotateCcw size={14} />}Khôi phục</button>
                      <button className="btn-danger btn-sm" onClick={() => remove(b)} disabled={!!busy} aria-label={`Xoá ${b.id}`}><Trash2 size={14} /></button>
                    </div>}
                  </div>
                  {open === b.id && (
                    <div className="px-3 pb-3 grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                      {Object.entries(b.chi_tiet).filter(([, n]) => n > 0).map(([t, n]) => (
                        <div key={t} className="flex items-center gap-1 rounded-md bg-navy-50 px-2 py-1 text-xs">
                          <span className="flex-1 truncate text-ink-soft">{LABEL[t] ?? t}</span><b className="tabular-nums">{n.toLocaleString('vi-VN')}</b>
                          {isAdmin && t !== 'users' && <button className="text-blue-600 hover:underline" title="Chỉ khôi phục bảng này" onClick={() => restore(b, [t])}><RotateCcw size={12} /></button>}
                        </div>
                      ))}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </section>

      </div>

      <section className="card">
        <header className="px-4 py-3 border-b border-navy-100"><h2 className="font-extrabold text-navy-900">Số dòng theo bảng</h2></header>
        <div className="p-4 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-1.5">
          {Object.entries(counts).map(([t, n]) => (
            <div key={t} className="flex items-center gap-1 rounded-md bg-navy-50 px-2 py-1.5 text-xs"><span className="flex-1 truncate text-ink-soft">{LABEL[t] ?? t}</span><b className="tabular-nums">{n.toLocaleString('vi-VN')}</b></div>
          ))}
        </div>
      </section>
    </div>
  )
}
