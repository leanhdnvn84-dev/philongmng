import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Phi Long Building',
  description: 'Hệ thống quản lý tòa nhà Phi Long',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body className="bg-gray-50 text-gray-900">{children}</body>
    </html>
  )
}
