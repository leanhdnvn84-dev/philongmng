// Điểm vào của worker "philong" trên Cloudflare: phần web do OpenNext build (.open-next/worker.js),
// cộng thêm cron của Cloudflare thay cho Vercel Cron.
// Cron chỉ chạy khi biến CRON_ENABLED = "1" (đặt trên Cloudflare Dashboard), để không chạy trùng với Vercel
// trong lúc hai nơi cùng hoạt động. Cần thêm biến CRON_SECRET (giống Vercel).
import handler from '../.open-next/worker.js'

// lịch giờ UTC, giống vercel.json: 18:00 UTC = 01:00 VN (sao lưu), 01:00 UTC = 08:00 VN (email cảnh báo)
const JOBS = {
  '0 18 * * *': '/api/cron/sao_luu',
  '0 1 * * *': '/api/cron/canh_bao',
}

export default {
  fetch: handler.fetch,

  async scheduled(event, env, ctx) {
    const path = JOBS[event.cron]
    if (!path) return console.warn('[cron] lịch không xác định:', event.cron)
    if (env.CRON_ENABLED !== '1') return console.log('[cron] đang tắt (CRON_ENABLED khác "1"), bỏ qua', path)
    if (!env.CRON_SECRET) return console.error('[cron] thiếu CRON_SECRET, bỏ qua', path)
    const req = new Request(`https://cron.philong.internal${path}`, { headers: { authorization: `Bearer ${env.CRON_SECRET}` } })
    const res = await handler.fetch(req, env, ctx)
    const body = await res.text()
    console.log('[cron]', path, res.status, body.slice(0, 500))
    if (!res.ok) throw new Error(`[cron] ${path} lỗi ${res.status}`)
  },
}
