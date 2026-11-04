'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Lock, Mail, ShieldCheck, Wrench, ClipboardList } from 'lucide-react'
import { supabaseBrowser } from '@/lib/supabase/browser'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError('')
    const { error } = await supabaseBrowser().auth.signInWithPassword({ email, password })
    if (error) {
      setError('Email hoặc mật khẩu không đúng')
      setBusy(false)
      return
    }
    router.replace('/')
    router.refresh()
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-[1.1fr_1fr]">
      {/* brand panel */}
      <div className="relative hidden lg:flex flex-col justify-between overflow-hidden bg-gradient-to-br from-navy-950 via-navy-900 to-navy-700 p-12 text-white">
        <div className="absolute -left-24 -bottom-24 h-96 w-96 rounded-full bg-gold-400/10 blur-3xl" />
        <div className="absolute right-0 top-0 h-72 w-72 rounded-full bg-navy-500/20 blur-3xl" />
        <div className="relative flex items-center gap-3">
          <span className="grid place-items-center h-11 w-11 rounded-xl bg-gradient-to-br from-gold-300 to-gold-500 text-navy-950 font-bold">PL</span>
          <div className="leading-tight">
            <div className="text-lg font-bold tracking-[0.14em]">PHILONG</div>
            <div className="text-[11px] tracking-[0.36em] text-gold-300">BUILDING</div>
          </div>
        </div>
        <div className="relative max-w-md">
          <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-gold-300">Hệ thống quản lý vận hành</p>
          <h1 className="mt-3 text-4xl font-bold leading-tight tracking-tight">Vận hành tòa nhà<br />chuẩn mực, minh bạch.</h1>
          <ul className="mt-8 space-y-3 text-sm text-navy-100">
            <li className="flex items-center gap-3"><ClipboardList className="h-4 w-4 text-gold-300" />Theo dõi công việc và tiến độ theo từng giai đoạn</li>
            <li className="flex items-center gap-3"><Wrench className="h-4 w-4 text-gold-300" />Lịch bảo trì tự cảnh báo trước hạn</li>
            <li className="flex items-center gap-3"><ShieldCheck className="h-4 w-4 text-gold-300" />Phân quyền chặt chẽ, lưu vết mọi thay đổi</li>
          </ul>
        </div>
        <p className="relative text-xs text-navy-300">© PHILONG BUILDING</p>
      </div>

      {/* form */}
      <div className="flex items-center justify-center px-6 py-12 bg-canvas">
        <form onSubmit={submit} className="w-full max-w-sm">
          <div className="lg:hidden mb-8 flex items-center gap-3">
            <span className="grid place-items-center h-10 w-10 rounded-xl bg-navy-900 text-gold-300 font-bold">PL</span>
            <span className="font-bold tracking-[0.12em] text-navy-900">PHILONG BUILDING</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-navy-900">Đăng nhập</h2>
          <p className="mt-1 text-sm text-ink-mute">Sử dụng tài khoản được quản trị viên cấp.</p>

          <div className="mt-8 space-y-4">
            <div>
              <label htmlFor="email" className="label">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-mute" />
                <input id="email" className="input pl-9 h-11" type="email" required autoFocus autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
            </div>
            <div>
              <label htmlFor="password" className="label">Mật khẩu</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-mute" />
                <input id="password" className="input pl-9 h-11" type="password" required autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
            </div>
            {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 ring-1 ring-red-200" role="alert">{error}</p>}
            <button className="btn-primary w-full h-11" disabled={busy}>{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Đăng nhập'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}
