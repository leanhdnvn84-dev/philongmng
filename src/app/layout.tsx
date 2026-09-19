import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Phi Long Building Management System',
  description: 'Hệ thống quản lý tòa nhà Phi Long',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="vi">
      <body className="bg-gray-50">
        <nav className="bg-blue-600 text-white shadow-lg">
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold">Phi Long Building</h1>
            <div className="space-x-4">
              <a href="/" className="hover:text-blue-200">Trang chủ</a>
              <a href="/buildings" className="hover:text-blue-200">Tòa nhà</a>
              <a href="/tenants" className="hover:text-blue-200">Khách thuê</a>
              <a href="/contracts" className="hover:text-blue-200">Hợp đồng</a>
              <a href="/maintenance" className="hover:text-blue-200">Bảo trì</a>
              <a href="/equipment" className="hover:text-blue-200">Thiết bị</a>
            </div>
          </div>
        </nav>

        <main className="container mx-auto px-4 py-8">
          {children}
        </main>

        <footer className="bg-gray-800 text-white text-center py-4 mt-8">
          <p>&copy; 2025 Phi Long Building Management System. All rights reserved.</p>
        </footer>
      </body>
    </html>
  )
}
