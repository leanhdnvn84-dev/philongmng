'use client'
// "Bảo trì dữ liệu": scan all cross-table rules, repair in bulk (backup first), decide row by row, match typed names to codes.
import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { AlertTriangle, CheckCircle2, ChevronDown, Info, Link2, Loader2, ScanSearch, Wand2, X, XCircle } from 'lucide-react'
import { useConfirm } from '@/components/ConfirmDialog'

type Level = 'loi' | 'canh_bao' | 'thong_tin'
interface Item { id: string; label: string; detail?: string; href?: string }
interface Act { key: string; label: string; danger?: boolean; confirm: string }
interface Check { key: string; group: string; title: string; level: Level; mode: 'auto' | 'map' | 'act' | 'xem'; hint: string; href?: string; count: number; items: Item[]; acts?: Act[]; error?: string }
interface MapInfo { what: string; rows: { text: string; count: number; suggest: string }[]; options: { value: string; label: string }[] }

const LEVEL = {
  loi: { icon: XCircle, cls: 'border-red-200 bg-red-50', ic: 'text-red-600', label: 'Lỗi' },
  canh_bao: { icon: AlertTriangle, cls: 'border-orange-200 bg-orange-50', ic: 'text-orange-600', label: 'Cảnh báo' },
  thong_tin: { icon: Info, cls: 'border-blue-200 bg-blue-50', ic: 'text-blue-600', label: 'Lưu ý' },
}
const RANK: Record<Level, number> = { loi: 0, canh_bao: 1, thong_tin: 2 }
const KEEP = '__giu__', NOTE = '__ghichu__'
const fmtTime = (iso: string) => new Date(iso).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh', hour12: false, day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })

async function api(url: string, body?: unknown) {
  const r = await fetch(url, body ? { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) } : undefined)
  const j = await r.json().catch(() => ({ success: false, error: 'Lỗi mạng' }))
  if (!j.success) throw new Error(j.error || 'Có lỗi xảy ra')
  return j
}

export default function DataMaint({ isAdmin, onSummary, onChanged }: { isAdmin: boolean; onSummary?: (s: { loi: number; canh_bao: number }) => void; onChanged?: () => void }) {
  const [checks, setChecks] = useState<Check[] | null>(null)
  const [groups, setGroups] = useState<string[]>([])
  const [at, setAt] = useState('')
  const [busy, setBusy] = useState<string | null>(null)
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)
  const [open, setOpen] = useState<string | null>(null)
  const [mapFor, setMapFor] = useState<{ check: Check; info: MapInfo; map: Record<string, string> } | null>(null)
  const [confirm, dialog] = useConfirm()

  const scan = useCallback(async (quiet = false) => {
    if (!quiet) setBusy('scan')
    try {
      const j = await api('/api/he_thong/bao_tri')
      setChecks(j.data.checks); setGroups(j.data.groups); setAt(j.data.at)
      const open = (j.data.checks as Check[]).filter((c) => c.count > 0)
      onSummary?.({ loi: open.filter((c) => c.level === 'loi').length, canh_bao: open.filter((c) => c.level === 'canh_bao').length })
    } catch (e: any) { setMsg({ ok: false, text: e.message }) } finally { if (!quiet) setBusy(null) }
  }, [onSummary])
  useEffect(() => { scan() }, [scan])

  const done = async (text: string) => { setMsg({ ok: true, text }); await scan(true); onChanged?.() }
  const fix = async (c: Check) => {
    if (!(await confirm(`Sửa tự động "${c.title}" (${c.count} dòng)?\n\nHệ thống tạo một bản sao lưu toàn bộ dữ liệu trước khi sửa; nếu cần có thể khôi phục ở phần Sao lưu bên dưới.`, { okLabel: 'Sửa tự động' }))) return
    setBusy('fix' + c.key); setMsg(null)
    try { await done((await api('/api/he_thong/bao_tri', { op: 'fix', key: c.key })).message) } catch (e: any) { setMsg({ ok: false, text: e.message }) } finally { setBusy(null) }
  }
  const act = async (c: Check, it: Item, a: Act) => {
    if (!(await confirm(`${it.label}\n\n${a.confirm}`, { danger: a.danger, okLabel: a.label }))) return
    setBusy(`act${c.key}${it.id}`); setMsg(null)
    try { await done((await api('/api/he_thong/bao_tri', { op: 'act', key: c.key, id: it.id, act: a.key })).message) } catch (e: any) { setMsg({ ok: false, text: e.message }) } finally { setBusy(null) }
  }
  const openMap = async (c: Check) => {
    setBusy('map' + c.key); setMsg(null)
    try {
      const info: MapInfo = (await api('/api/he_thong/bao_tri', { op: 'map_get', key: c.key })).data
      setMapFor({ check: c, info, map: Object.fromEntries(info.rows.map((r) => [r.text, r.suggest])) })
    } catch (e: any) { setMsg({ ok: false, text: e.message }) } finally { setBusy(null) }
  }
  const applyMap = async () => {
    if (!mapFor) return
    const n = Object.values(mapFor.map).filter((v) => v !== KEEP).length
    if (!n) { setMapFor(null); return }
    if (!(await confirm(`Áp dụng ${n} cách ghép cho "${mapFor.check.title}"?\n\nHệ thống tạo bản sao lưu trước khi sửa.`, { okLabel: 'Áp dụng' }))) return
    setBusy('apply'); setMsg(null)
    try { const j = await api('/api/he_thong/bao_tri', { op: 'map_apply', key: mapFor.check.key, map: mapFor.map }); setMapFor(null); await done(j.message) }
    catch (e: any) { setMsg({ ok: false, text: e.message }) } finally { setBusy(null) }
  }

  const byGroup = useMemo(() => groups.map((g) => ({ g, list: (checks ?? []).filter((c) => c.group === g).sort((a, b) => Number(b.count > 0) - Number(a.count > 0) || RANK[a.level] - RANK[b.level]) })), [groups, checks])
  const openChecks = (checks ?? []).filter((c) => c.count > 0)
  const tally = (l: Level) => openChecks.filter((c) => c.level === l).length

  return (
    <section className="card">
      {dialog}
      <header className="flex flex-wrap items-center gap-2 border-b border-navy-100 px-4 py-3">
        <ScanSearch size={18} className="text-blue-600" />
        <h2 className="flex-1 font-extrabold text-navy-900">Bảo trì dữ liệu</h2>
        {checks && <div className="flex flex-wrap gap-1.5 text-xs font-bold">
          <span className="rounded-full bg-red-50 px-2 py-0.5 text-red-700">{tally('loi')} lỗi</span>
          <span className="rounded-full bg-orange-50 px-2 py-0.5 text-orange-700">{tally('canh_bao')} cảnh báo</span>
          <span className="rounded-full bg-blue-50 px-2 py-0.5 text-blue-700">{tally('thong_tin')} lưu ý</span>
          <span className="rounded-full bg-green-50 px-2 py-0.5 text-green-700">{(checks.length - openChecks.length)} mục đạt</span>
        </div>}
        <button className="btn-primary btn-sm" onClick={() => scan()} disabled={!!busy}>{busy === 'scan' ? <Loader2 size={14} className="animate-spin" /> : <ScanSearch size={14} />}Quét toàn hệ thống</button>
      </header>
      <div className="space-y-3 p-4">
        <p className="text-xs leading-relaxed text-ink-mute">
          Quét {checks?.length ?? '…'} quy tắc liên kết và đồng bộ giữa các phần mềm (công việc, kho, đề xuất, cho thuê, thiết bị, bảo trì). Mỗi đêm hệ thống tự quét và báo lên chuông.
          <b className="text-ink-soft"> Sửa tự động</b> và <b className="text-ink-soft">Ghép tên</b> tạo bản sao lưu toàn bộ trước khi sửa; các nút xử lý từng dòng ghi dữ liệu cũ vào Nhật ký thao tác.
          {!isAdmin && ' Chỉ Super Admin được sửa; bạn đang xem.'}
        </p>
        {msg && <p role="status" className={`rounded-lg border px-3 py-2 text-sm font-semibold ${msg.ok ? 'border-green-200 bg-green-50 text-green-700' : 'border-red-200 bg-red-50 text-red-700'}`}>{msg.text}</p>}
        {checks === null && <p className="py-6 text-center text-sm text-ink-mute"><Loader2 size={16} className="mr-1 inline animate-spin" />Đang quét dữ liệu…</p>}
        {checks && !openChecks.length && <p className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-3 py-3 text-sm font-bold text-green-700"><CheckCircle2 size={17} />Dữ liệu đồng bộ, không phát hiện vấn đề nào.</p>}

        {checks && byGroup.map(({ g, list }) => {
          const bad = list.filter((c) => c.count > 0), ok = list.filter((c) => c.count === 0 && !c.error)
          return (
            <div key={g} className="rounded-xl border border-navy-100">
              <div className="flex items-center gap-2 border-b border-navy-100 bg-navy-50/60 px-3 py-2">
                <h3 className="flex-1 text-[13.5px] font-extrabold text-navy-900">{g}</h3>
                <span className="text-xs text-ink-mute">{bad.length ? `${bad.length} mục cần xem` : 'Đạt'}</span>
              </div>
              <div className="space-y-2 p-2.5">
                {list.filter((c) => c.count > 0 || c.error).map((c) => {
                  const L = LEVEL[c.level], Icon = L.icon, isOpen = open === c.key
                  return (
                    <div key={c.key} className={`rounded-lg border ${L.cls}`}>
                      <div className="flex flex-wrap items-start gap-2 px-3 py-2.5">
                        <Icon size={16} className={`mt-0.5 shrink-0 ${L.ic}`} />
                        <div className="min-w-[200px] flex-1">
                          <div className="text-sm font-extrabold text-navy-900">{c.title} <span className="tabular-nums">({c.count})</span></div>
                          <div className="text-xs text-ink-soft">{c.error ? `Không quét được: ${c.error}` : c.hint}</div>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {c.count > 0 && <button className="btn-secondary btn-sm" onClick={() => setOpen(isOpen ? null : c.key)} aria-expanded={isOpen}>Xem<ChevronDown size={14} className={isOpen ? 'rotate-180' : ''} /></button>}
                          {isAdmin && c.mode === 'auto' && c.count > 0 && <button className="btn-primary btn-sm" disabled={!!busy} onClick={() => fix(c)}>{busy === 'fix' + c.key ? <Loader2 size={14} className="animate-spin" /> : <Wand2 size={14} />}Sửa tự động</button>}
                          {c.mode === 'map' && c.count > 0 && <button className="btn-primary btn-sm" disabled={!!busy} onClick={() => openMap(c)}>{busy === 'map' + c.key ? <Loader2 size={14} className="animate-spin" /> : <Link2 size={14} />}Ghép tên</button>}
                          {c.href && <Link href={c.href} className="btn-secondary btn-sm">Mở trang</Link>}
                        </div>
                      </div>
                      {isOpen && (
                        <ul className="mx-2 mb-2 max-h-[340px] divide-y divide-navy-100 overflow-y-auto rounded-lg border border-navy-100 bg-white">
                          {c.items.map((it) => (
                            <li key={it.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 px-3 py-2 text-[13px]">
                              <div className="min-w-[180px] flex-1">
                                {it.href ? <Link href={it.href} className="font-bold text-navy-900 hover:underline">{it.label}</Link> : <b className="text-navy-900">{it.label}</b>}
                                {it.detail && <div className="text-xs text-ink-mute">{it.detail}</div>}
                              </div>
                              {isAdmin && c.acts?.map((a) => (
                                <button key={a.key} className={a.danger ? 'btn-danger btn-sm' : 'btn-secondary btn-sm'} disabled={!!busy} onClick={() => act(c, it, a)}>
                                  {busy === `act${c.key}${it.id}` ? <Loader2 size={13} className="animate-spin" /> : null}{a.label}
                                </button>
                              ))}
                            </li>
                          ))}
                          {c.count > c.items.length && <li className="px-3 py-2 text-xs text-ink-mute">… còn {c.count - c.items.length} dòng nữa</li>}
                        </ul>
                      )}
                    </div>
                  )
                })}
                {ok.length > 0 && <div className="flex flex-wrap gap-1.5 pt-0.5">{ok.map((c) => <span key={c.key} className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-[11.5px] font-semibold text-green-700"><CheckCircle2 size={12} />{c.title}</span>)}</div>}
              </div>
            </div>
          )
        })}
        {at && <p className="text-xs text-ink-mute">Quét lúc {fmtTime(at)}</p>}
      </div>

      {mapFor && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-3 sm:p-6" role="dialog" aria-modal="true" aria-label="Ghép tên">
          <div className="absolute inset-0 bg-[#0b1b40]/50" onClick={() => !busy && setMapFor(null)} />
          <div className="relative flex max-h-[92dvh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-pop lg:w-[80vw] lg:max-w-[1100px]">
            <div className="flex items-center justify-between gap-3 bg-[#0b1b40] px-4 py-3 text-white">
              <div className="min-w-0"><h2 className="truncate text-[16px] font-extrabold">Ghép tên · {mapFor.info.what}</h2><p className="text-[12px] text-white/75">Chọn mục trong danh mục cho từng cách ghi; gợi ý sẵn theo tên giống nhau</p></div>
              <button onClick={() => setMapFor(null)} aria-label="Đóng" className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white/15 hover:bg-white/25"><X size={16} /></button>
            </div>
            <div className="overflow-y-auto p-4">
              <table className="w-full border-separate border-spacing-0 text-[13.5px]">
                <thead><tr className="text-left text-xs font-extrabold uppercase text-ink-mute"><th className="pb-2">Đang ghi</th><th className="pb-2 text-right">Số việc</th><th className="pb-2 pl-3">Ghép với</th></tr></thead>
                <tbody>
                  {mapFor.info.rows.map((r) => (
                    <tr key={r.text}>
                      <td className="border-t border-navy-100 py-2 pr-2 font-bold text-navy-900">{r.text}</td>
                      <td className="border-t border-navy-100 py-2 text-right tabular-nums">{r.count}</td>
                      <td className="border-t border-navy-100 py-2 pl-3">
                        <select className={`input !h-9 !py-0 ${mapFor.map[r.text] === KEEP ? 'text-ink-mute' : ''}`} value={mapFor.map[r.text] ?? KEEP} aria-label={`Ghép "${r.text}"`}
                          onChange={(e) => setMapFor((m) => (m ? { ...m, map: { ...m.map, [r.text]: e.target.value } } : m))}>
                          <option value={KEEP}>— Giữ nguyên, chưa ghép —</option>
                          <option value="">— Bỏ (xóa khỏi công việc) —</option>
                          <option value={NOTE}>— Chuyển vào ghi chú —</option>
                          {mapFor.info.options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex flex-wrap items-center justify-end gap-2 border-t border-navy-100 px-4 py-3">
              <span className="mr-auto text-xs text-ink-mute">{Object.values(mapFor.map).filter((v) => v !== KEEP).length}/{mapFor.info.rows.length} cách ghi sẽ được ghép</span>
              <button className="btn-ghost" onClick={() => setMapFor(null)} disabled={!!busy}>Hủy</button>
              {isAdmin && <button className="btn-primary min-w-[110px]" onClick={applyMap} disabled={!!busy}>{busy === 'apply' ? <Loader2 size={15} className="animate-spin" /> : 'Áp dụng'}</button>}
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
