'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import Logo from '@/components/Logo'

export default function LoginPage() {
  const router = useRouter()
  const [account, setAccount] = useState('')
  const [password, setPassword] = useState('')
  const [show, setShow] = useState(false)
  const [remember, setRemember] = useState(true)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [greet, setGreet] = useState('Xin chào')
  const [today, setToday] = useState('')
  const [clock, setClock] = useState('')

  useEffect(() => {
    const hour = Number(new Intl.DateTimeFormat('en-GB', { hour: 'numeric', timeZone: 'Asia/Ho_Chi_Minh' }).format(new Date()))
    setGreet(hour < 11 ? 'Xin chào buổi sáng' : hour < 14 ? 'Xin chào buổi trưa' : hour < 18 ? 'Xin chào buổi chiều' : 'Xin chào buổi tối')
    const f = (o: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh', ...o }).format(new Date())
    setToday(`${f({ weekday: 'long' })}, ngày ${f({ day: '2-digit' })} tháng ${f({ month: 'numeric' })} năm ${f({ year: 'numeric' })}`)
    const tick = () => setClock(new Intl.DateTimeFormat('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }).format(new Date()))
    tick()
    const t = setInterval(tick, 1000)
    return () => clearInterval(t)
  }, [])

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError('')
    const res = await fetch('/api/auth/login', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: account, password, remember }),
    }).catch(() => null)
    const j = await res?.json().catch(() => ({}))
    if (!res || !res.ok || !j?.success) {
      setError(!res ? 'Mất kết nối mạng, vui lòng thử lại' : j?.error || 'Tên đăng nhập / email hoặc mật khẩu không đúng')
      setBusy(false)
      return
    }
    router.replace('/')
    router.refresh()
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[linear-gradient(160deg,#0b1830_0%,#13274a_60%,#0b1830_100%)] px-4 py-8 text-white lg:px-14 lg:py-12">
      <div aria-hidden className="pointer-events-none absolute -left-32 -top-36 h-[560px] w-[560px] rounded-full bg-[#ED3237] opacity-35 blur-[120px]" />
      <div aria-hidden className="pointer-events-none absolute -bottom-40 -right-36 h-[520px] w-[520px] rounded-full bg-blue-500 opacity-20 blur-[130px]" />
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.04)_1px,transparent_1px)] bg-[size:48px_48px]" />

      <div className="relative mx-auto grid min-h-[calc(100vh-4rem)] w-full max-w-[1240px] items-center gap-10 lg:grid-cols-[minmax(0,1fr)_440px] lg:gap-16 lg:min-h-[calc(100vh-6rem)]">
        {/* left: brand, greeting, date/time and what the system does */}
        <section className="flex flex-col items-center text-center lg:items-start lg:text-left">
          <Logo variant="white" height={56} />

          <div className="mt-8 lg:mt-14">
            <h1 className="bg-gradient-to-b from-white to-[#ffd9da] bg-clip-text font-soft text-[36px] font-extrabold leading-[1.12] tracking-[.005em] text-transparent drop-shadow-[0_4px_24px_rgba(255,138,142,.35)] sm:text-[46px] lg:text-[54px]">{greet}</h1>
            <p className="mt-3 text-[15px] font-semibold text-[#b3c0da] first-letter:uppercase sm:text-[17px]">{today || '\u00a0'}</p>
            <p className="mt-1 text-[38px] font-extrabold tabular-nums leading-none tracking-wide sm:text-[48px]" aria-label="Giờ hiện tại">{clock || '--:--:--'}</p>
          </div>

          <p className="mt-14 hidden text-[12.5px] text-[#8fa3c7] lg:block">Designed &amp; Developed by <b className="text-[#c9d5ec]">Phi Long Technology</b> © 2026</p>
        </section>

        {/* right: sign in */}
        <div className="mx-auto w-full max-w-[440px]">
          <form onSubmit={submit} className="w-full rounded-[28px] border border-white/20 bg-white/[.08] p-6 shadow-[0_40px_90px_rgba(0,0,0,.45),inset_0_1px_0_rgba(255,255,255,.2)] backdrop-blur-xl sm:p-9">
            <h2 className="text-center text-[24px] font-black">Đăng nhập</h2>
            <p className="mb-6 mt-1 text-center text-[13.5px] text-[#a9b8d6]">Dùng tên đăng nhập hoặc email được quản trị cấp</p>

            <label htmlFor="account" className="block text-[12.5px] font-bold text-[#c9d5ec]">Tài khoản</label>
            <input id="account" className="mt-1.5 h-[52px] w-full rounded-2xl border border-white/20 bg-[#081226]/55 px-4 text-[16px] text-white outline-none placeholder:text-[#8fa3c7] focus:border-[#ff6a6f] focus:ring-4 focus:ring-[#ED3237]/25"
              placeholder="Tên đăng nhập hoặc email" autoFocus required autoCapitalize="none" spellCheck={false} autoComplete="username" value={account} onChange={(e) => setAccount(e.target.value)} />

            <label htmlFor="password" className="mt-4 block text-[12.5px] font-bold text-[#c9d5ec]">Mật khẩu</label>
            <div className="relative mt-1.5">
              <input id="password" className="h-[52px] w-full rounded-2xl border border-white/20 bg-[#081226]/55 pl-4 pr-12 text-[16px] text-white outline-none placeholder:text-[#8fa3c7] focus:border-[#ff6a6f] focus:ring-4 focus:ring-[#ED3237]/25"
                type={show ? 'text' : 'password'} placeholder="Nhập mật khẩu" required autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
              <button type="button" onClick={() => setShow((v) => !v)} aria-label={show ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'} aria-pressed={show}
                className="absolute right-1.5 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-lg text-[#a9b8d6] hover:text-white">
                {show ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>

            <label className="mt-4 flex items-center gap-2 text-[13.5px] text-[#c9d5ec]">
              <input type="checkbox" className="h-[18px] w-[18px] accent-[#ED3237]" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
              Ghi nhớ đăng nhập 7 ngày
            </label>
            {error && <p role="alert" className="mt-4 rounded-xl bg-red-500/15 px-3.5 py-2.5 text-[13.5px] text-[#ffb4b7] ring-1 ring-red-400/40">{error}</p>}
            <button disabled={busy} className="mt-5 inline-flex h-[54px] w-full items-center justify-center rounded-2xl bg-gradient-to-b from-[#f5565b] to-[#ED3237] text-[16px] font-extrabold text-white shadow-[0_14px_28px_rgba(237,50,55,.45),inset_0_1px_0_rgba(255,255,255,.35)] transition active:translate-y-px disabled:opacity-60">
              {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Đăng nhập'}
            </button>
            <p className="mt-4 text-center text-[12.5px] text-[#8fa3c7]">Quên mật khẩu? Liên hệ quản trị để cấp lại.</p>
          </form>
          <p className="mt-6 text-center text-[12.5px] text-[#8fa3c7] lg:hidden">Designed &amp; Developed by <b className="text-[#c9d5ec]">Phi Long Technology</b> © 2026</p>
        </div>
      </div>
    </main>
  )
}
