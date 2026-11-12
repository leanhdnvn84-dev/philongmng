'use client'
import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import AuthCard from '@/components/AuthCard'

export default function ForgotPassword() {
  const [ident, setIdent] = useState('')
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setMsg(null)
    const j = await fetch('/api/auth/quen_mat_khau', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ identifier: ident }) }).then((r) => r.json()).catch(() => null)
    setMsg(j?.success ? { ok: true, text: j.message } : { ok: false, text: j?.error || 'Mất kết nối mạng, vui lòng thử lại' })
    setBusy(false)
  }
  return (
    <AuthCard title="Quên mật khẩu">
      <p className="mt-2 text-[14px] leading-relaxed text-[#c9d5ec]">Nhập tên đăng nhập hoặc email. Hệ thống gửi đường dẫn đặt lại mật khẩu tới email của tài khoản, có hiệu lực 30 phút.</p>
      <form onSubmit={submit} className="mt-5">
        <label htmlFor="ident" className="text-[13px] font-bold text-[#c9d5ec]">Tên đăng nhập hoặc email</label>
        <input id="ident" required autoFocus autoCapitalize="none" spellCheck={false} autoComplete="username" value={ident} onChange={(e) => setIdent(e.target.value)}
          className="mt-1.5 h-[52px] w-full rounded-2xl border border-white/20 bg-[#081226]/55 px-4 text-[16px] text-white outline-none focus:border-[#ff6a6f] focus:ring-4 focus:ring-[#ED3237]/25" />
        {msg && <p role="status" className={`mt-4 rounded-xl px-3.5 py-2.5 text-[13.5px] ring-1 ${msg.ok ? 'bg-emerald-500/15 text-emerald-200 ring-emerald-400/40' : 'bg-red-500/15 text-[#ffb4b7] ring-red-400/40'}`}>{msg.text}</p>}
        <button disabled={busy} className="mt-5 inline-flex h-[52px] w-full items-center justify-center rounded-2xl bg-gradient-to-b from-[#f5565b] to-[#ED3237] text-[16px] font-extrabold text-white disabled:opacity-60">
          {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Gửi đường dẫn đặt lại'}
        </button>
        <p className="mt-4 text-center text-[13px]"><a href="/login" className="font-bold text-[#ffb4b7] hover:underline">← Quay lại đăng nhập</a></p>
      </form>
    </AuthCard>
  )
}
