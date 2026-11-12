'use client'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Paperclip, Loader2, X, FileText, Image as ImageIcon, Upload } from 'lucide-react'

/** "Tệp đính kèm" in a record's view popup: photos, PDF, Word/Excel stored in Google Drive. */
type Tep = { id: string; ten: string; mime: string | null; kich_thuoc: number | null; file_id: string; nguoi_tai: string | null; created_at: string }
export const ATTACHABLE = new Set(['thiet_bi', 'nhat_ky_bao_tri', 'lich_bao_tri', 'de_xuat', 'khach_thue', 'cong_viec', 'cong_viec_hang_ngay', 'khach_hang_tiem_nang', 'vat_tu'])
const size = (n: number | null) => (!n ? '' : n > 1048576 ? `${(n / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1024))} KB`)
const when = (iso: string) => new Intl.DateTimeFormat('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh', day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(iso))
const isImg = (t: Tep) => /^image\//.test(t.mime ?? '')

async function shrink(file: File, max = 1600): Promise<File> {
  if (!/^image\/(jpeg|png|webp)$/.test(file.type)) return file
  const bmp = await createImageBitmap(file).catch(() => null)
  if (!bmp) return file
  const k = Math.min(1, max / Math.max(bmp.width, bmp.height))
  const c = document.createElement('canvas'); c.width = Math.round(bmp.width * k); c.height = Math.round(bmp.height * k)
  c.getContext('2d')!.drawImage(bmp, 0, 0, c.width, c.height)
  const blob = await new Promise<Blob | null>((res) => c.toBlob(res, 'image/jpeg', 0.82))
  return blob ? new File([blob], file.name.replace(/\.\w+$/, '') + '.jpg', { type: 'image/jpeg' }) : file
}

export default function Attachments({ resource, id, canEdit }: { resource: string; id: string; canEdit: boolean }) {
  const [list, setList] = useState<Tep[] | null>(null)
  const [busy, setBusy] = useState('')
  const [error, setError] = useState('')
  const input = useRef<HTMLInputElement>(null)
  const load = useCallback(() => {
    fetch(`/api/tep_dinh_kem?bang=${encodeURIComponent(resource)}&id=${encodeURIComponent(id)}`).then((r) => r.json())
      .then((j) => (j?.success ? setList(j.data) : setError(j?.error || 'Không tải được tệp'))).catch(() => setError('Mất kết nối'))
  }, [resource, id])
  useEffect(() => { setList(null); setError(''); load() }, [load])

  async function upload(files: File[]) {
    setError('')
    for (const [i, raw] of files.slice(0, 10).entries()) {
      setBusy(`Đang tải ${i + 1}/${Math.min(files.length, 10)}…`)
      const f = await shrink(raw)
      if (f.size > 4 * 1024 * 1024) { setError(`${raw.name}: quá 4 MB`); continue }
      const fd = new FormData(); fd.append('bang', resource); fd.append('id', id); fd.append('file', f)
      const j = await fetch('/api/tep_dinh_kem', { method: 'POST', body: fd }).then((r) => r.json()).catch(() => null)
      if (!j?.success) { setError(`${raw.name}: ${j?.error || 'không tải được'}`); continue }
      setList((l) => [j.data, ...(l ?? [])])
    }
    setBusy('')
  }
  async function remove(t: Tep) {
    setBusy('Đang gỡ…')
    const j = await fetch(`/api/tep_dinh_kem?id=${t.id}`, { method: 'DELETE' }).then((r) => r.json()).catch(() => null)
    if (j?.success) setList((l) => (l ?? []).filter((x) => x.id !== t.id)); else setError(j?.error || 'Không gỡ được')
    setBusy('')
  }

  return (
    <div className="mt-5 overflow-hidden rounded-xl border border-navy-200 print:hidden">
      <div className="flex items-center gap-2 bg-navy-50 px-3 py-2.5 text-[13.5px] font-extrabold text-navy-900">
        <Paperclip className="h-4 w-4 text-navy-500" />Tệp đính kèm{list ? ` (${list.length})` : ''}
        {busy && <span className="ml-2 inline-flex items-center gap-1 text-[12px] font-semibold text-ink-mute"><Loader2 className="h-3.5 w-3.5 animate-spin" />{busy}</span>}
        {canEdit && (
          <label className="btn-secondary btn-sm ml-auto cursor-pointer">
            <Upload className="h-4 w-4" />Thêm tệp
            <input ref={input} type="file" multiple className="hidden" accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx,.txt"
              onChange={(e) => { const f = Array.from(e.target.files ?? []); e.target.value = ''; if (f.length) upload(f) }} />
          </label>
        )}
      </div>
      {error && <p role="alert" className="border-t border-red-200 bg-red-50 px-3 py-2 text-[12.5px] font-semibold text-red-800">{error}</p>}
      {list && !list.length && <p className="px-3 py-4 text-center text-[13px] text-ink-mute">Chưa có tệp nào.{canEdit ? ' Ảnh, PDF, Word, Excel, tối đa 4 MB mỗi tệp.' : ''}</p>}
      {list && list.length > 0 && (
        <div className="grid grid-cols-2 gap-2 p-2.5 sm:grid-cols-3 lg:grid-cols-4">
          {list.map((t) => (
            <div key={t.id} className="group relative overflow-hidden rounded-lg border border-navy-200 bg-white">
              <a href={`https://drive.google.com/file/d/${encodeURIComponent(t.file_id)}/view`} target="_blank" rel="noopener noreferrer" className="block">
                {isImg(t)
                  // eslint-disable-next-line @next/next/no-img-element
                  ? <img src={`https://drive.google.com/thumbnail?id=${encodeURIComponent(t.file_id)}&sz=w400`} alt={t.ten} loading="lazy" className="h-28 w-full bg-navy-50 object-cover" />
                  : <div className="grid h-28 place-items-center bg-navy-50 text-navy-400"><FileText className="h-10 w-10" /></div>}
                <div className="px-2 py-1.5">
                  <div className="flex items-center gap-1 truncate text-[12.5px] font-bold text-navy-900">{isImg(t) ? <ImageIcon className="h-3.5 w-3.5 shrink-0 text-navy-400" /> : <FileText className="h-3.5 w-3.5 shrink-0 text-navy-400" />}<span className="truncate">{t.ten}</span></div>
                  <div className="truncate text-[11px] text-ink-mute">{[size(t.kich_thuoc), when(t.created_at), t.nguoi_tai].filter(Boolean).join(' · ')}</div>
                </div>
              </a>
              {canEdit && <button type="button" onClick={() => remove(t)} aria-label={`Gỡ ${t.ten}`} title="Gỡ khỏi bản ghi (tệp vẫn còn trong Google Drive)"
                className="absolute right-1 top-1 grid h-7 w-7 place-items-center rounded-full bg-black/55 text-white opacity-0 transition group-hover:opacity-100 focus:opacity-100 max-lg:opacity-100"><X className="h-4 w-4" /></button>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
