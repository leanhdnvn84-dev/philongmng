import { NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { guard, ok, fail, dbError } from '@/lib/http'
import { audit, invoiceStatus } from '@/lib/crud'

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

// POST { amount } -> records a (partial) payment; never lets paid exceed the invoice amount.
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const g = await guard('invoices', 'edit')
  if (g instanceof Response) return g
  if (!UUID.test(params.id)) return fail('ID không hợp lệ')
  const body = await req.json().catch(() => null)
  const amount = Number(body?.amount)
  if (!Number.isFinite(amount) || amount <= 0) return fail('Số tiền phải lớn hơn 0')

  const admin = supabaseAdmin()
  const { data: inv } = await admin.from('invoices').select('*').eq('id', params.id).maybeSingle()
  if (!inv) return fail('Không tìm thấy', 404)
  const paid = Number(inv.paid_amount) + amount
  if (paid > Number(inv.amount)) return fail('Số tiền thu vượt quá số còn nợ')

  // optimistic lock on paid_amount: a concurrent payment makes this match 0 rows
  const { data: rows, error } = await admin.from('invoices')
    .update({ paid_amount: paid, status: invoiceStatus(Number(inv.amount), paid) })
    .eq('id', inv.id).eq('paid_amount', inv.paid_amount).select('id')
  if (error) return dbError(error)
  if (!rows?.length) return fail('Hóa đơn vừa được cập nhật bởi người khác, vui lòng tải lại', 409)
  await audit(g.auth.userId, 'invoices', inv.id, 'pay', { amount })
  return ok()
}
