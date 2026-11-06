'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import Logo from '@/components/Logo'

const CARDS = [
  { label: 'Chưa thực hiện', sub: 'Cần bắt đầu xử lý', bar: 'border-b-slate-400', dash: 'bg-slate-400' },
  { label: 'Quá hạn', sub: 'Cần ưu tiên xử lý', bar: 'border-b-red-400', dash: 'bg-red-400' },
  { label: 'Đến hạn hôm nay', sub: 'Cần xử lý trong ngày', bar: 'border-b-amber-400', dash: 'bg-amber-400' },
  { label: 'Sắp đến hạn', sub: 'Còn từ 1 đến 3 ngày', bar: 'border-b-yellow-500', dash: 'bg-yellow-500' },
  { label: 'Đang xử lý', sub: 'Theo dõi tiến độ thực hiện', bar: 'border-b-blue-400', dash: 'bg-blue-400' },
]

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

  useEffect(() => {
    const hour = Number(new Intl.DateTimeFormat('en-GB', { hour: 'numeric', timeZone: 'Asia/Ho_Chi_Minh' }).format(new Date()))
    setGreet(hour < 11 ? 'Xin chào buổi sáng' : hour < 14 ? 'Xin chào buổi trưa' : hour < 18 ? 'Xin chào buổi chiều' : 'Xin chào buổi tối')
    const f = (o: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh', ...o }).format(new Date())
    setToday(`Hôm nay, ${f({ weekday: 'long' })}, ngày ${f({ day: '2-digit' })} tháng ${f({ month: 'numeric' })} năm ${f({ year: 'numeric' })}`)
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
    <main className="relative min-h-screen overflow-hidden bg-[#f3f5f9] px-3 py-6 sm:px-6 sm:py-12 flex items-center justify-center">
      <div aria-hidden className="pointer-events-none absolute -left-40 -top-40 h-[560px] w-[560px] rounded-full bg-[#ED3237]/20 blur-[120px]" />
      <div aria-hidden className="pointer-events-none absolute -bottom-52 -right-40 h-[520px] w-[520px] rounded-full bg-slate-400/20 blur-[130px]" />

      <div className="relative w-full max-w-[1180px] rounded-[26px] border-t-[3px] border-t-[#ED3237] bg-white px-5 py-7 shadow-[0_30px_80px_rgba(16,26,45,.14)] sm:px-9 sm:py-9">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_350px]">
          <div className="flex flex-col">
            <div className="self-start"><Logo variant="color" height={72} /></div>
            <p className="mt-1 text-[13px] text-ink-mute">Hệ thống quản lý vận hành tòa nhà</p>
            <h1 className="mt-8 text-[30px] font-extrabold leading-tight tracking-tight text-navy-900 sm:text-[36px]">{greet}</h1>
            <p className="mt-3 text-[16px] font-semibold text-ink-soft">{today || ' '}</p>
          </div>

          <form onSubmit={submit} className="rounded-2xl border border-navy-200 bg-[#fafbfd] p-5">
            <h2 className="text-[22px] font-extrabold text-brand-500">Đăng nhập</h2>
            <p className="mt-0.5 text-[12.5px] text-ink-mute">Truy cập hệ thống quản lý PHI LONG</p>

            <label htmlFor="account" className="mt-4 block text-[12.5px] font-bold text-navy-900">Tài khoản</label>
            <input id="account" className="mt-1 h-11 w-full rounded-lg border border-navy-200 bg-white px-3 text-[16px] outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
              placeholder="Nhập tài khoản hoặc email" autoFocus required autoCapitalize="none" spellCheck={false} autoComplete="username" value={account} onChange={(e) => setAccount(e.target.value)} />

            <label htmlFor="password" className="mt-3 block text-[12.5px] font-bold text-navy-900">Mật khẩu</label>
            <div className="relative mt-1">
              <input id="password" className="h-11 w-full rounded-lg border border-navy-200 bg-white pl-3 pr-11 text-[16px] outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
                type={show ? 'text' : 'password'} placeholder="Nhập mật khẩu" required autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
              <button type="button" onClick={() => setShow((s) => !s)} aria-label={show ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'} aria-pressed={show}
                className="absolute right-1 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-md text-ink-mute hover:text-navy-900">
                {show ? <EyeOff className="h-[18px] w-[18px]" /> : <Eye className="h-[18px] w-[18px]" />}
              </button>
            </div>

            <label className="mt-3 flex items-center gap-2 text-[13px] text-ink-soft">
              <input type="checkbox" className="h-4 w-4 accent-[#ED3237]" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
              Ghi nhớ đăng nhập 7 ngày
            </label>
            <p className="mt-2 text-[12px] text-ink-mute">Quên mật khẩu? Liên hệ quản trị để cấp lại.</p>
            {error && <p role="alert" className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-[13px] text-red-700 ring-1 ring-red-200">{error}</p>}
            <button disabled={busy} className="mt-4 inline-flex h-11 w-full items-center justify-center rounded-lg bg-[#ED3237] text-[15px] font-extrabold text-white shadow-[0_6px_16px_rgba(237,50,55,.35)] transition hover:bg-brand-500 active:translate-y-px disabled:opacity-60">
              {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Đăng nhập'}
            </button>
          </form>
        </div>

        <div className="mt-8 border-t border-navy-100 pt-6">
          <h2 className="text-[20px] font-extrabold text-navy-900">Bạn đang có <span className="mx-1 inline-block h-[3px] w-4 rounded bg-[#ED3237] align-middle" /> công việc cần xử lý</h2>
          <p className="mt-1 text-[13px] font-semibold text-ink-mute">Chọn một cảnh báo để vào ngay bảng Công việc được lọc.</p>
          <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
            {CARDS.map((c) => (
              <div key={c.label} className={`rounded-xl border border-navy-200 border-b-[4px] bg-white px-4 py-3 shadow-[0_2px_8px_rgba(16,26,45,.06)] ${c.bar}`}>
                <div className="text-[13px] font-bold text-ink-mute">{c.label}</div>
                <span className={`my-2 block h-[3px] w-5 rounded ${c.dash}`} />
                <div className="text-[12px] text-ink-mute">{c.sub}</div>
              </div>
            ))}
          </div>
          <p className="mt-4 flex items-center gap-2 border-t border-navy-100 pt-3 text-[13px] font-semibold text-ink-soft">
            <span className="grid h-6 w-6 place-items-center rounded-full bg-brand-50 text-[10px] font-black text-brand-500">PL</span>Đăng nhập để tải dữ liệu công việc.
          </p>
          <p className="mt-3 text-right text-[13px] text-ink-mute">Designed &amp; Developed by <b className="text-navy-800">Phi Long Technology</b> © 2026</p>
        </div>
      </div>
    </main>
  )
}
