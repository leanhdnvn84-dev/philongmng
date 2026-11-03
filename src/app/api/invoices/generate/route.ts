import { NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { guard, ok, fail, dbError } from '@/lib/http'
import { audit, syncRoom } from '@/lib/crud'

// POST { period: "YYYY-MM" } -> one invoice per active contract covering that month; never duplicates.
export async function POST(req: NextRequest) {
  const g = await guard('invoices', 'create')
  if (g instanceof Response) return g
  const body = await req.json().catch(() => null)
  const period = String(body?.period ?? '')
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(period)) return fail('Kỳ phải có dạng YYYY-MM')

  const [y, m] = period.split('-').map(Number)
  const first = `${period}-01`
  const last = new Date(Date.UTC(y, m, 0)).toISOString().slice(0, 10)
  const admin = supabaseAdmin()

  // contracts past their end date are expired first so they are not billed
  const today = new Date().toISOString().slice(0, 10)
  const { data: expired } = await admin.from('contracts').update({ status: 'expired' }).eq('status', 'active').lt('end_date', today).select('room_id')
  for (const id of new Set((expired ?? []).map((c) => c.room_id))) await syncRoom(id)

  const { data: contracts, error } = await admin.from('contracts').select('id, monthly_fee')
    .eq('status', 'active').lte('start_date', last).gte('end_date', first)
  if (error) return dbError(error)
  if (!contracts?.length) return ok({ created: 0, skipped: 0 })

  const rows = contracts.map((c) => ({ contract_id: c.id, period, amount: c.monthly_fee, due_date: `${period}-10` }))
  const { data: inserted, error: e2 } = await admin.from('invoices')
    .upsert(rows, { onConflict: 'contract_id,period', ignoreDuplicates: true }).select('id')
  if (e2) return dbError(e2)
  const created = inserted?.length ?? 0
  await audit(g.auth.userId, 'invoices', null, 'generate', { period, created })
  return ok({ created, skipped: rows.length - created })
}
