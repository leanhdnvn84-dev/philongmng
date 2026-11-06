import type { Metadata, Viewport } from 'next'
import { Be_Vietnam_Pro } from 'next/font/google'
import './globals.css'

// Be Vietnam Pro: drawn for Vietnamese (stacked diacritics stay clear at small sizes), clean and a little premium
const font = Be_Vietnam_Pro({ subsets: ['latin', 'vietnamese'], weight: ['400', '500', '600', '700', '800', '900'], display: 'swap', variable: '--font-sans' })

export const metadata: Metadata = {
  title: { default: 'PhiLong Building', template: '%s · PhiLong Building' },
  description: 'Hệ thống quản lý vận hành tòa nhà Phi Long',
}
export const viewport: Viewport = { themeColor: '#ED3237' }

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" className={font.variable}>
      <body className="min-h-screen font-sans">{children}</body>
    </html>
  )
}
