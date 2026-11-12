import Logo from '@/components/Logo'

/** Dark card used by the password pages (same look as the login page). */
export default function AuthCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden bg-[linear-gradient(160deg,#0b1830_0%,#13274a_60%,#0b1830_100%)] px-4 py-10 text-white">
      <div className="w-full max-w-[420px] rounded-[26px] border border-white/15 bg-white/[.06] p-6 shadow-[0_30px_60px_rgba(0,0,0,.35)] backdrop-blur sm:p-8">
        <a href="/login" aria-label="Về trang đăng nhập"><Logo variant="white" height={44} /></a>
        <h1 className="mt-5 text-[22px] font-black">{title}</h1>
        {children}
      </div>
    </main>
  )
}
