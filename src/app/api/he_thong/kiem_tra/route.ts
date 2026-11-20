import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { sysGuard } from '@/lib/sysGuard'
import { BACKUP_TABLES } from '@/lib/backup'
import { scanAll } from '@/lib/dataMaint'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

export async function GET() {
  const a = await sysGuard(false); if (a instanceof NextResponse) return a
  try {
    const db = supabaseAdmin()
    const counts: Record<string, number> = {}
    await Promise.all(BACKUP_TABLES.map(async (t) => {
      const { count } = await db.from(t).select('*', { count: 'exact', head: true }); counts[t] = count ?? 0
    }))
    return NextResponse.json({ success: true, data: { counts, at: new Date().toISOString() } })
  } catch (e: any) {
    console.error('[check]', e)
    return NextResponse.json({ success: false, error: 'Không kiểm tra được: ' + String(e.message ?? e).slice(0, 150) }, { status: 500 })
  }
}

/** Save the current findings to the archive (DATA_AUDIT_ARCHIVE). */
export async function POST(_: NextRequest) {
  const a = await sysGuard(true); if (a instanceof NextResponse) return a
  try {
    const issues = (await scanAll()).filter((i) => i.count > 0)
    const rows = issues.map((i) => ({ ngay_xu_ly: new Date().toISOString(), sheet_nguon: i.title, id_goc: i.items.slice(0, 6).map((x) => x.id).join(', '), loai_loi: i.level === 'loi' ? 'Lỗi' : i.level === 'canh_bao' ? 'Cảnh báo' : 'Thông tin',
      ly_do: `${i.count} bản ghi — ${i.hint}`, data_goc: i.items.slice(0, 20).map((x) => x.label).join('\n'), trang_thai: 'Chưa xử lý' }))
    if (rows.length) { const { error } = await supabaseAdmin().from('data_audit_archive').insert(rows); if (error) throw new Error(error.message) }
    return NextResponse.json({ success: true, data: { saved: rows.length } })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: 'Không lưu được: ' + String(e.message ?? e).slice(0, 150) }, { status: 500 })
  }
}
