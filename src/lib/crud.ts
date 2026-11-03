import 'server-only'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { Resource } from '@/lib/resources'

/** Keep only whitelisted columns and normalise form values ('' -> null, numbers). */
export function sanitize(res: Resource, body: any, creating: boolean) {
  const out: Record<string, any> = {}
  const errors: string[] = []
  for (const f of res.fields) {
    if (f.createOnly) continue
    if (!(f.name in (body ?? {}))) {
      if (creating && f.required && f.default === undefined) errors.push(`${f.label} là bắt buộc`)
      continue
    }
    let v = body[f.name]
    if (v === '' || v === undefined) v = null
    if (v !== null && f.type === 'number') {
      v = Number(v)
      if (!Number.isFinite(v)) { errors.push(`${f.label} phải là số`); continue }
    }
    if (v !== null && f.type === 'select' && !f.options?.some((o) => o.value === v)) {
      errors.push(`${f.label} không hợp lệ`); continue
    }
    if (v === null && f.required) { errors.push(`${f.label} là bắt buộc`); continue }
    out[f.name] = v
  }
  return { data: out, errors }
}

export async function audit(userId: string, table: string, recordId: string | null, action: string, changes: unknown) {
  await supabaseAdmin().from('audit_logs').insert({ user_id: userId, table_name: table, record_id: recordId, action, changes })
}

/** Room is 'occupied' iff it has an active contract (never overrides 'maintenance'). */
export async function syncRoom(roomId: string | null | undefined) {
  if (!roomId) return
  const admin = supabaseAdmin()
  const { count } = await admin.from('contracts').select('id', { count: 'exact', head: true }).eq('room_id', roomId).eq('status', 'active')
  const { data: room } = await admin.from('rooms').select('status').eq('id', roomId).maybeSingle()
  if (!room || room.status === 'maintenance') return
  const next = (count ?? 0) > 0 ? 'occupied' : 'available'
  if (room.status !== next) await admin.from('rooms').update({ status: next }).eq('id', roomId)
}

/** Business rules per resource. Returns an error message to reject the write. */
export async function validate(res: Resource, data: Record<string, any>, existing: any | null): Promise<string | null> {
  if (res.key === 'contracts') {
    const m = { ...existing, ...data }
    if (m.start_date && m.end_date && m.end_date <= m.start_date) return 'Ngày kết thúc phải sau ngày bắt đầu'
    if (m.monthly_fee != null && m.monthly_fee < 0) return 'Phí thuê không được âm'
    if (m.status === 'active' && m.room_id) {
      let q = supabaseAdmin().from('contracts').select('id', { count: 'exact', head: true }).eq('room_id', m.room_id).eq('status', 'active')
      if (existing?.id) q = q.neq('id', existing.id)
      const { count } = await q
      if (count) return 'Phòng này đã có hợp đồng đang hiệu lực'
    }
  }
  if (res.key === 'maintenance') {
    if (data.status === 'completed' && existing?.status !== 'completed') data.completed_at = new Date().toISOString()
    if (data.status && data.status !== 'completed') data.completed_at = null
  }
  if (res.key === 'rooms' && data.status === 'occupied' && !existing) return 'Trạng thái "Đang thuê" được đặt tự động khi tạo hợp đồng'
  return null
}

export async function afterWrite(res: Resource, row: any, previous: any | null) {
  if (res.key === 'contracts') {
    await syncRoom(row?.room_id)
    if (previous?.room_id && previous.room_id !== row?.room_id) await syncRoom(previous.room_id)
  }
}
