'use client'
import { useEffect, useState } from 'react'
import { Loader2, Eye, EyeOff } from 'lucide-react'
import AuthCard from '@/components/AuthCard'

export default function ResetPassword() {
  const [token, setToken] = useState('')
  const [pw, setPw] = useState(''), [again, setAgain] = useState(''), [show, setShow] = useState(false)
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)
  useEffect(() => { setToken(new URLSearchParams(window.location.search).get('t') ?? '') }, [])
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setMsg(null)
    if (pw.length < 8) return setMsg({ ok: false, text: 'Mật khẩu tối thiểu 8 ký tự' })
    if (pw !== again) return setMsg({ ok: false, text: 'Hai lần nhập chưa giống nhau' })
    setBusy(true)
    const j = await fetch('/api/auth/dat_lai_mat_khau', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token, password: pw }) }).then((r) => r.json()).catch(() => null)
    setMsg(j?.success ? { ok: true, text: 'Đã đặt mật khẩu mới. Bạn có thể đăng nhập ngay.' } : { ok: false, text: j?.error || 'Mất kết nối mạng, vui lòng thử lại' })
    setBusy(false)
  }
  const inp = 'mt-1.5 h-[52px] w-full rounded-2xl border border-white/20 bg-[#081226]/55 px-4 text-[16px] text-white outline-none focus:border-[#ff6a6f] focus:ring-4 focus:ring-[#ED3237]/25'
  return (
    <AuthCard title="Đặt mật khẩu mới">
      {!token ? <p className="mt-3 text-[14px] text-[#ffb4b7]">Đường dẫn không hợp lệ. Hãy mở đúng đường dẫn trong email, hoặc <a href="/quen-mat-khau" className="font-bold underline">gửi lại</a>.</p>
        : msg?.ok ? (<><p role="status" className="mt-4 rounded-xl bg-emerald-500/15 px-3.5 py-2.5 text-[14px] text-emerald-200 ring-1 ring-emerald-400/40">{msg.text}</p>
          <a href="/login" className="mt-5 inline-flex h-[52px] w-full items-center justify-center rounded-2xl bg-gradient-to-b from-[#f5565b] to-[#ED3237] text-[16px] font-extrabold text-white">Đăng nhập</a></>)
        : (
          <form onSubmit={submit} className="mt-4">
            <label htmlFor="pw" className="text-[13px] font-bold text-[#c9d5ec]">Mật khẩu mới (tối thiểu 8 ký tự)</label>
            <div className="relative"><input id="pw" type={show ? 'text' : 'password'} autoComplete="new-password" required minLength={8} value={pw} onChange={(e) => setPw(e.target.value)} className={`${inp} pr-12`} />
              <button type="button" onClick={() => setShow((v) => !v)} aria-label={show ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'} className="absolute right-3 top-1/2 mt-[3px] -translate-y-1/2 text-[#8fa3c7]">{show ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}</button></div>
            <label htmlFor="pw2" className="mt-4 block text-[13px] font-bold text-[#c9d5ec]">Nhập lại mật khẩu mới</label>
            <input id="pw2" type={show ? 'text' : 'password'} autoComplete="new-password" required value={again} onChange={(e) => setAgain(e.target.value)} className={inp} />
            {msg && <p role="alert" className="mt-4 rounded-xl bg-red-500/15 px-3.5 py-2.5 text-[13.5px] text-[#ffb4b7] ring-1 ring-red-400/40">{msg.text}</p>}
            <button disabled={busy} className="mt-5 inline-flex h-[52px] w-full items-center justify-center rounded-2xl bg-gradient-to-b from-[#f5565b] to-[#ED3237] text-[16px] font-extrabold text-white disabled:opacity-60">
              {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Lưu mật khẩu mới'}
            </button>
          </form>
        )}
    </AuthCard>
  )
}
