'use client'

import { useEffect } from 'react'

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error) }, [error])
  return (
    <div className="flex flex-1 items-center justify-center p-6">
      <div className="card max-w-sm p-6 text-center space-y-3">
        <h2 className="text-lg font-bold text-navy-900">Không tải được trang</h2>
        <p className="text-sm text-ink-mute">Kết nối đang chậm hoặc máy chủ bận. Bạn thử tải lại nhé.</p>
        <div className="flex justify-center gap-2">
          <button className="btn-primary" onClick={() => reset()}>Thử lại</button>
          <button className="btn-secondary" onClick={() => (window.location.href = '/')}>Về trang chủ</button>
        </div>
      </div>
    </div>
  )
}
