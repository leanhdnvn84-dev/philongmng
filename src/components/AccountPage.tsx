'use client'
import { useState } from 'react'
import { KeyRound, ShieldCheck, Loader2, Eye, EyeOff } from 'lucide-react'

export default function AccountPage({ name, email, role, mustChange = false }: { name: string; email: string; role: string; mustChange?: boolean }) {
  const [cur, setCur] = useState(''), [next, setNext] = useState(''), [again, setAgain] = useState('')
  const [show, setShow] = useState(false), [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)
  const strength = (() => { let s = 0; if (next.length >= 8) s++; if (next.length >= 12) s++; if (/[A-Z]/.test(next) && /[a-z]/.test(next)) s++; if (/\d/.test(next)) s++; if (/[^A-Za-z0-9]/.test(next)) s++; return Math.min(4, s) })()
  const label = ['Rất yếu', 'Yếu', 'Trung bình', 'Khá', 'Mạnh'][strength]
  const color = ['bg-red-500', 'bg-red-500', 'bg-amber-500', 'bg-lime-500', 'bg-green-600'][strength]

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setMsg(null)
    if (next !== again) return setMsg({ ok: false, text: 'Hai lần nhập mật khẩu mới chưa giống nhau' })
    setBusy(true)
    try {
      const r = await fetch('/api/auth/doi_mat_khau', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ current: cur, next }) })
      const j = await r.json().catch(() => ({}))
      if (!r.ok || !j.success) throw new Error(j.error || 'Không đổi được mật khẩu')
      setMsg({ ok: true, text: 'Đã đổi mật khẩu. Lần đăng nhập sau dùng mật khẩu mới.' }); setCur(''); setNext(''); setAgain('')
      if (mustChange) setTimeout(() => { window.location.href = '/' }, 1200)
    } catch (err: any) { setMsg({ ok: false, text: err.message }) } finally { setBusy(false) }
  }
  const field = 'input h-11 text-[16px] lg:h-10 lg:text-sm'
  return (
    <div className="flex flex-1 flex-col">
      <div className="flex shrink-0 flex-wrap items-baseline gap-x-5 gap-y-1 border-b border-navy-200 bg-white px-4 py-2 lg:px-5">
        <span className="text-[12.5px] text-ink-mute">PHI LONG / <b className="text-navy-800">Tài khoản</b></span>
        <h1 className="text-[22px] font-black text-navy-900">Tài khoản của tôi</h1>
      </div>
      <div className="p-4 lg:p-5">
        {mustChange && <p role="alert" className="mx-auto mb-4 max-w-4xl rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-[14px] font-semibold text-amber-900">Mật khẩu này do quản trị viên đặt. Hãy đổi sang mật khẩu của riêng bạn để tiếp tục dùng hệ thống.</p>}
    <div className="mx-auto grid max-w-4xl gap-4 lg:grid-cols-[300px_minmax(0,1fr)]">
      <div className="card p-5">
        <div className="grid h-16 w-16 place-items-center rounded-full bg-navy-900 text-[20px] font-black text-white">{(name.match(/\S+/g) ?? ['U']).slice(-2).map((w) => w[0]).join('').toUpperCase()}</div>
        <div className="mt-3 text-[17px] font-extrabold text-navy-900">{name}</div>
        <div className="text-[13px] text-ink-mute break-all">{email}</div>
        <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-[12px] font-bold text-blue-700"><ShieldCheck className="h-4 w-4" />{role}</div>
        <p className="mt-4 text-[12.5px] leading-relaxed text-ink-mute">Quyền hạn do quản trị viên cấp theo vai trò. Muốn đổi tên hoặc email, nhờ quản trị viên cập nhật trong mục Người dùng.</p>
      </div>
      <form onSubmit={submit} className="card p-5">
        <div className="flex items-center gap-2 text-[16px] font-extrabold text-navy-900"><KeyRound className="h-5 w-5 text-blue-600" />Đổi mật khẩu</div>
        <div className="mt-4 grid gap-3 sm:max-w-md">
          <label className="text-[12.5px] font-bold text-ink-mute">Mật khẩu hiện tại
            <input type={show ? 'text' : 'password'} autoComplete="current-password" className={`${field} mt-1`} value={cur} onChange={(e) => setCur(e.target.value)} required />
          </label>
          <label className="text-[12.5px] font-bold text-ink-mute">Mật khẩu mới (tối thiểu 8 ký tự, có chữ và số)
            <input type={show ? 'text' : 'password'} autoComplete="new-password" minLength={8} className={`${field} mt-1`} value={next} onChange={(e) => setNext(e.target.value)} required />
          </label>
          {next && <div><div className="h-1.5 overflow-hidden rounded-full bg-navy-100"><div className={`h-full ${color} transition-all`} style={{ width: `${(strength + 1) * 20}%` }} /></div><div className="mt-1 text-[11.5px] text-ink-mute">Độ mạnh: <b>{label}</b></div></div>}
          <label className="text-[12.5px] font-bold text-ink-mute">Nhập lại mật khẩu mới
            <input type={show ? 'text' : 'password'} autoComplete="new-password" className={`${field} mt-1`} value={again} onChange={(e) => setAgain(e.target.value)} required />
          </label>
          <button type="button" onClick={() => setShow((s) => !s)} className="inline-flex w-fit items-center gap-1.5 text-[12.5px] font-bold text-blue-700">{show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}{show ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}</button>
        </div>
        {msg && <p role="alert" className={`mt-3 rounded-lg border px-3 py-2 text-[13px] font-semibold sm:max-w-md ${msg.ok ? 'border-green-200 bg-green-50 text-green-800' : 'border-red-200 bg-red-50 text-red-700'}`}>{msg.text}</p>}
        <button className="btn-primary mt-4 h-11 min-w-[160px]" disabled={busy}>{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Đổi mật khẩu'}</button>
      </form>
    </div>
      </div>
    </div>
  )
}
