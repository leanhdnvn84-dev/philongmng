'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function Home() {
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const checkConnection = async () => {
      try {
        const { data, error: err } = await supabase
          .from('buildings')
          .select('id')
          .limit(1)

        if (err) throw err
        setIsConnected(true)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Connection failed')
        setIsConnected(false)
      }
    }

    checkConnection()
  }, [])

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-lg p-8">
        <h1 className="text-4xl font-bold mb-2">Phi Long Building Management System</h1>
        <p className="text-blue-100">Hệ thống quản lý tòa nhà toàn diện</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <h3 className="text-xl font-bold mb-2">🏢 Tòa nhà</h3>
          <p className="text-gray-600 mb-4">Quản lý thông tin tòa nhà và tầng</p>
          <a href="/buildings" className="btn btn-primary">Xem chi tiết</a>
        </div>

        <div className="card">
          <h3 className="text-xl font-bold mb-2">👥 Khách thuê</h3>
          <p className="text-gray-600 mb-4">Quản lý thông tin khách hàng</p>
          <a href="/tenants" className="btn btn-primary">Xem chi tiết</a>
        </div>

        <div className="card">
          <h3 className="text-xl font-bold mb-2">📋 Hợp đồng</h3>
          <p className="text-gray-600 mb-4">Quản lý hợp đồng và thanh toán</p>
          <a href="/contracts" className="btn btn-primary">Xem chi tiết</a>
        </div>

        <div className="card">
          <h3 className="text-xl font-bold mb-2">🔧 Bảo trì</h3>
          <p className="text-gray-600 mb-4">Quản lý công việc bảo trì</p>
          <a href="/maintenance" className="btn btn-primary">Xem chi tiết</a>
        </div>

        <div className="card">
          <h3 className="text-xl font-bold mb-2">⚙️ Thiết bị</h3>
          <p className="text-gray-600 mb-4">Quản lý kho thiết bị</p>
          <a href="/equipment" className="btn btn-primary">Xem chi tiết</a>
        </div>

        <div className="card">
          <h3 className="text-xl font-bold mb-2">📊 Báo cáo</h3>
          <p className="text-gray-600 mb-4">Xem các báo cáo thống kê</p>
          <a href="/reports" className="btn btn-primary">Xem chi tiết</a>
        </div>
      </div>

      <div className="bg-blue-50 border-l-4 border-blue-600 p-6 rounded">
        <h2 className="text-xl font-bold mb-2">Database Connection</h2>
        {isConnected ? (
          <div className="flex items-center text-green-600">
            <span className="inline-block w-3 h-3 bg-green-600 rounded-full mr-2"></span>
            ✅ Connected to Supabase
          </div>
        ) : (
          <div className="flex items-center text-red-600">
            <span className="inline-block w-3 h-3 bg-red-600 rounded-full mr-2"></span>
            ❌ {error || 'Not connected'}
          </div>
        )}
      </div>

      <div className="bg-yellow-50 border-l-4 border-yellow-600 p-6 rounded">
        <h2 className="text-xl font-bold mb-2">⚠️ Next Steps</h2>
        <ol className="list-decimal list-inside space-y-2 text-gray-700">
          <li>Run SQL schema in Supabase dashboard</li>
          <li>Configure authentication</li>
          <li>Set up environment variables</li>
          <li>Test API endpoints</li>
          <li>Deploy to production</li>
        </ol>
      </div>
    </div>
  )
}
