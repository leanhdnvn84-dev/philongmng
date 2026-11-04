import type { Metadata, Viewport } from 'next'
import { Be_Vietnam_Pro } from 'next/font/google'
import './globals.css'

const font = Be_Vietnam_Pro({
  subsets: ['latin', 'vietnamese'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-sans',
  display: 'swap',
})

export const metadata: Metadata = {
  title: { default: 'PHILONG BUILDING', template: '%s · PHILONG BUILDING' },
  description: 'Hệ thống quản lý vận hành tòa nhà Phi Long',
}
export const viewport: Viewport = { themeColor: '#0f1a30' }

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" className={font.variable}>
      <body className="min-h-screen font-sans">{children}</body>
    </html>
  )
}
