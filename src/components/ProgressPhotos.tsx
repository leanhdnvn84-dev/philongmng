'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { ExternalLink, ImageOff, Search } from 'lucide-react'
import { formatDate } from '@/lib/resources'

interface Photo { id: string; id_cong_viec: string | null; ngay: string | null; gio: string | null; giai_doan: string | null; dong_tien_do: string | null; file_id: string | null; thumb_id: string | null; nguoi_tai: string | null; an: boolean }

const thumb = (p: Photo) => `https://drive.google.com/thumbnail?id=${encodeURIComponent(p.thumb_id || p.file_id || '')}&sz=w400`
const view = (p: Photo) => `https://drive.google.com/file/d/${encodeURIComponent(p.file_id || '')}/view`

export default function ProgressPhotos() {
  const [rows, setRows] = useState<Photo[] | null>(null)
  const [err, setErr] = useState('')
  const [q, setQ] = useState('')
  const [bad, setBad] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetch('/api/hinh_anh_tien_do?pageSize=2000').then((r) => r.json()).then((j) => { if (j.success) setRows(j.data); else setErr(j.error || 'Lỗi tải dữ liệu') }).catch(() => setErr('Lỗi mạng'))
  }, [])

  const groups = useMemo(() => {
    const s = q.trim().toLowerCase(), m = new Map<string, Photo[]>()
    for (const p of rows ?? []) {
      if (p.an || !p.file_id) continue
      if (s && !`${p.id_cong_viec} ${p.giai_doan} ${p.dong_tien_do} ${p.nguoi_tai}`.toLowerCase().includes(s)) continue
      const k = p.id_cong_viec || 'Không rõ công việc'
      m.set(k, [...(m.get(k) ?? []), p])
    }
    return [...m.entries()]
  }, [rows, q])

  return (
    <div className="space-y-4 px-4 lg:px-5 py-4">
      <div className="flex flex-wrap items-center gap-2">
        <h1 className="text-xl font-extrabold text-navy-900 flex-1 min-w-[200px]">Hình ảnh tiến độ</h1>
        <div className="relative"><Search size={15} className="absolute left-2.5 top-2.5 text-ink-mute" />
          <input className="input pl-8 w-56" placeholder="Tìm công việc, giai đoạn…" value={q} onChange={(e) => setQ(e.target.value)} /></div>
        <Link href="/hinh_anh_tien_do" className="btn-secondary">Dạng bảng</Link>
      </div>
      <p className="text-xs text-ink-mute">Ảnh được lưu trên Google Drive; hệ thống chỉ giữ mã file. Nếu ảnh không hiện, hãy đăng nhập Google có quyền xem thư mục, hoặc chia sẻ thư mục "ai có liên kết đều xem được".</p>
      {err && <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">{err}</p>}
      {!rows && !err && <p className="py-8 text-center text-sm text-ink-mute">Đang tải…</p>}
      {rows && !groups.length && <p className="py-8 text-center text-sm text-ink-mute">Không có ảnh.</p>}
      {groups.map(([cv, list]) => (
        <section key={cv} className="card">
          <header className="flex items-center gap-2 px-4 py-2.5 border-b border-navy-100">
            <b className="text-navy-900">{cv}</b><span className="pill-gray">{list.length} ảnh</span>
          </header>
          <div className="p-3 grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2">
            {list.map((p) => (
              <a key={p.id} href={view(p)} target="_blank" rel="noopener noreferrer" className="group block rounded-lg overflow-hidden border border-navy-100 bg-navy-50">
                <div className="aspect-[4/3] grid place-items-center">
                  {bad.has(p.id) ? <ImageOff size={22} className="text-navy-300" />
                    : /* eslint-disable-next-line @next/next/no-img-element */ <img src={thumb(p)} alt={p.giai_doan || 'Ảnh tiến độ'} loading="lazy" referrerPolicy="no-referrer" className="h-full w-full object-cover" onError={() => setBad((s) => new Set(s).add(p.id))} />}
                </div>
                <div className="px-2 py-1 text-[11px] leading-tight text-ink-soft">
                  <div className="flex items-center gap-1"><b className="flex-1 truncate text-navy-900">{p.giai_doan || '—'}</b><ExternalLink size={11} className="opacity-0 group-hover:opacity-100" /></div>
                  <div>{formatDate(p.ngay)}{p.gio ? ` · ${p.gio}` : ''}</div>
                </div>
              </a>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
