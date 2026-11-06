'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Lock, Mail, ShieldCheck, Wrench, ClipboardList } from 'lucide-react'
import { supabaseBrowser } from '@/lib/supabase/browser'
import Logo from '@/components/Logo'

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
      <div className="relative hidden lg:flex flex-col justify-between overflow-hidden bg-gradient-to-br from-brand-400 via-brand-500 to-brand-700 p-12 text-white">
        <div className="absolute -left-24 -bottom-24 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute right-0 top-0 h-72 w-72 rounded-full bg-black/10 blur-3xl" />
        <div className="relative">
          <Logo variant="white" height={64} />
        </div>
        <div className="relative max-w-md">
          <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-white/80">Hệ thống quản lý vận hành</p>
          <h1 className="mt-3 text-4xl font-bold leading-tight tracking-tight">Vận hành tòa nhà<br />chuẩn mực, minh bạch.</h1>
          <ul className="mt-8 space-y-3 text-sm text-white/90">
            <li className="flex items-center gap-3"><ClipboardList className="h-4 w-4 text-white/80" />Theo dõi công việc và tiến độ theo từng giai đoạn</li>
            <li className="flex items-center gap-3"><Wrench className="h-4 w-4 text-white/80" />Lịch bảo trì tự cảnh báo trước hạn</li>
            <li className="flex items-center gap-3"><ShieldCheck className="h-4 w-4 text-white/80" />Phân quyền chặt chẽ, lưu vết mọi thay đổi</li>
          </ul>
        </div>
        <p className="relative text-xs text-white/70">© Phi Long Technology</p>
      </div>

      {/* form */}
      <div className="flex items-center justify-center px-6 py-12 bg-canvas">
        <form onSubmit={submit} className="w-full max-w-sm">
          <div className="mb-8">
            <Logo variant="color" height={52} />
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
