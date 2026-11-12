import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { sysGuard } from '@/lib/sysGuard'
import { audit } from '@/lib/crud'
import { RESOURCES } from '@/lib/resources'

export const dynamic = 'force-dynamic'
const DAYS = 30
const NO_RESTORE = new Set(['users', 'audit_logs', 'sao_luu'])
const title = (table: string) => RESOURCES.find((r) => r.table === table)?.title ?? table
const summary = (row: any) => String(row?.ten_thiet_bi ?? row?.ten_vat_tu ?? row?.noi_dung ?? row?.noi_dung_thuc_hien ?? row?.ho_ten ?? row?.ten_khach_thue ?? row?.ten_cong_ty ?? row?.ten_nha_cung_cap ?? row?.ten_khu_vuc ?? row?.ten_hang_muc ?? row?.ten ?? row?.ghi_chu ?? '').replace(/\s+/g, ' ').slice(0, 140)

/** Recycle bin: records deleted in the last 30 days (taken from the audit log, which keeps the whole row). Super Admin only. */
export async function GET() {
  const a = await sysGuard(true); if (a instanceof NextResponse) return a
  const db = supabaseAdmin(), since = new Date(Date.now() - DAYS * 86400_000).toISOString()
  const { data, error } = await db.from('audit_logs').select('id, created_at, user_email, table_name, record_id, changes').eq('action', 'delete').gte('created_at', since).order('created_at', { ascending: false }).limit(500)
  if (error) return NextResponse.json({ success: false, error: 'Lỗi cơ sở dữ liệu' }, { status: 500 })
  const rows = (data ?? []).filter((r: any) => !NO_RESTORE.has(r.table_name) && r.record_id && r.changes && typeof r.changes === 'object')
  // already restored, or the id is in use again → not restorable
  const { data: back } = await db.from('audit_logs').select('table_name, record_id, created_at').eq('action', 'restore').gte('created_at', since).limit(1000)
  const restored = new Set((back ?? []).map((r: any) => `${r.table_name}|${r.record_id}`))
  const byTable = new Map<string, string[]>()
  for (const r of rows as any[]) { if (!byTable.has(r.table_name)) byTable.set(r.table_name, []); byTable.get(r.table_name)!.push(r.record_id) }
  const alive = new Set<string>()
  await Promise.all(Array.from(byTable).map(async ([t, ids]) => { const { data: ex } = await db.from(t).select('id').in('id', ids); (ex ?? []).forEach((x: any) => alive.add(`${t}|${x.id}`)) }))
  return NextResponse.json({ success: true, days: DAYS, data: (rows as any[]).map((r) => ({
    id: r.id, at: r.created_at, by: r.user_email, table: r.table_name, module: title(r.table_name), record: r.record_id, summary: summary(r.changes),
    children: Object.values(r.changes._con ?? {}).reduce((s: number, l: any) => s + (Array.isArray(l) ? l.length : 0), 0),
    state: restored.has(`${r.table_name}|${r.record_id}`) || alive.has(`${r.table_name}|${r.record_id}`) ? 'restored' : 'deleted',
  })) })
}

export async function POST(req: NextRequest) {
  const a = await sysGuard(true); if (a instanceof NextResponse) return a
  const body = await req.json().catch(() => ({}))
  const logId = String(body.id ?? '')
  if (!/^[0-9a-f-]{36}$/.test(logId)) return NextResponse.json({ success: false, error: 'Không hợp lệ' }, { status: 400 })
  const db = supabaseAdmin()
  const { data: log } = await db.from('audit_logs').select('table_name, record_id, changes, created_at, action').eq('id', logId).maybeSingle()
  if (!log || log.action !== 'delete' || NO_RESTORE.has(log.table_name) || !log.changes) return NextResponse.json({ success: false, error: 'Không tìm thấy bản ghi đã xóa' }, { status: 404 })
  if (Date.parse(log.created_at) < Date.now() - DAYS * 86400_000) return NextResponse.json({ success: false, error: `Đã quá ${DAYS} ngày, không khôi phục được` }, { status: 410 })
  const { data: exists } = await db.from(log.table_name).select('id').eq('id', log.record_id).maybeSingle()
  if (exists) return NextResponse.json({ success: false, error: 'Mã này đang được dùng, không khôi phục được (có thể đã khôi phục trước đó)' }, { status: 409 })
  const clean = async (table: string, row: any) => {
    const { data: cols } = await db.rpc('import_table_columns', { p_table: table })
    const ok = new Set((cols ?? []).filter((c: any) => !c.is_generated).map((c: any) => c.column_name))
    return Object.fromEntries(Object.entries(row).filter(([k]) => ok.has(k)))
  }
  const { _con, ...row } = log.changes as any
  const { error } = await db.from(log.table_name).insert(await clean(log.table_name, row))
  if (error) return NextResponse.json({ success: false, error: /foreign key/i.test(error.message) ? 'Không khôi phục được: bản ghi liên quan (người, khu vực…) đã bị xóa' : 'Không khôi phục được: ' + error.message.slice(0, 120) }, { status: 409 })
  let kids = 0
  for (const [t, list] of Object.entries((_con ?? {}) as Record<string, any[]>)) {
    if (!Array.isArray(list) || !list.length) continue
    const rows = await Promise.all(list.map((r) => clean(t, r)))
    const { error: e2 } = await db.from(t).upsert(rows, { onConflict: 'id' }); if (!e2) kids += rows.length
  }
  await audit(a, log.table_name, log.record_id, 'restore', { from_log: logId, children: kids })
  return NextResponse.json({ success: true, data: { message: `Đã khôi phục ${log.record_id}${kids ? ` kèm ${kids} dòng liên quan` : ''}.` } })
}
