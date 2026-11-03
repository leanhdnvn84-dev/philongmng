import { supabaseAdmin } from '@/lib/supabase/admin'
import { getAuth } from '@/lib/auth'
import { ok, fail, dbError } from '@/lib/http'
import { syncRoom } from '@/lib/crud'

export const dynamic = 'force-dynamic'

export async function GET() {
  const auth = await getAuth()
  if (!auth) return fail('Chưa đăng nhập', 401)
  const admin = supabaseAdmin()
  const today = new Date().toISOString().slice(0, 10)
  const in30 = new Date(Date.now() + 30 * 864e5).toISOString().slice(0, 10)

  // lazily expire contracts whose end date has passed, and free their rooms
  const { data: expired } = await admin.from('contracts').update({ status: 'expired' })
    .eq('status', 'active').lt('end_date', today).select('room_id')
  for (const roomId of new Set((expired ?? []).map((c) => c.room_id))) await syncRoom(roomId)

  const count = async (table: string, f?: (q: any) => any) => {
    let q: any = admin.from(table).select('id', { count: 'exact', head: true })
    if (f) q = f(q)
    const { count: c } = await q
    return c ?? 0
  }
  const [buildings, rooms, occupied, available, tenants, openJobs, urgentJobs, damaged] = await Promise.all([
    count('buildings'),
    count('rooms'),
    count('rooms', (q) => q.eq('status', 'occupied')),
    count('rooms', (q) => q.eq('status', 'available')),
    count('tenants', (q) => q.eq('status', 'active')),
    count('maintenance_jobs', (q) => q.neq('status', 'completed')),
    count('maintenance_jobs', (q) => q.neq('status', 'completed').eq('priority', 'high')),
    count('equipment', (q) => q.eq('status', 'damaged')),
  ])

  const { data: active, error } = await admin.from('contracts').select('monthly_fee').eq('status', 'active')
  if (error) return dbError(error)
  const monthlyRevenue = (active ?? []).reduce((s, c) => s + Number(c.monthly_fee || 0), 0)

  const { data: unpaid } = await admin.from('invoices').select('amount, paid_amount, due_date').neq('status', 'paid')
  const receivable = (unpaid ?? []).reduce((t, i) => t + Number(i.amount) - Number(i.paid_amount), 0)
  const overdue = (unpaid ?? []).filter((i) => i.due_date < today).length

  const { data: expiring } = await admin.from('contracts')
    .select('id, end_date, monthly_fee, tenants(name), rooms(room_no)')
    .eq('status', 'active').gte('end_date', today).lte('end_date', in30).order('end_date').limit(10)

  return ok({
    data: {
      buildings, rooms, occupied, available, tenants, openJobs, urgentJobs, damaged,
      activeContracts: active?.length ?? 0,
      occupancyRate: rooms ? Math.round((occupied / rooms) * 100) : 0,
      monthlyRevenue, receivable, overdue,
      expiring: (expiring ?? []).map((c: any) => ({
        id: c.id, endDate: c.end_date, fee: c.monthly_fee, tenant: c.tenants?.name, room: c.rooms?.room_no,
      })),
    },
  })
}
