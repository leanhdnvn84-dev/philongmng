import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: { default: 'PHILONG BUILDING', template: '%s · PHILONG BUILDING' },
  description: 'Hệ thống quản lý vận hành tòa nhà Phi Long',
}
export const viewport: Viewport = { themeColor: '#ED3237' }

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body className="min-h-screen font-sans">{children}</body>
    </html>
  )
}
