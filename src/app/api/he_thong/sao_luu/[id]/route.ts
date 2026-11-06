import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { createBackup, loadBackup, restoreBackup } from '@/lib/backup'
import { sysGuard } from '@/lib/sysGuard'
import { audit } from '@/lib/crud'

export const dynamic = 'force-dynamic'
export const maxDuration = 60
const ID = /^[A-Za-z0-9_-]{1,32}$/

/** Download the backup as a .json.gz file */
export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const a = await sysGuard(true); if (a instanceof NextResponse) return a
  if (!ID.test(params.id)) return NextResponse.json({ success: false, error: 'Mã không hợp lệ' }, { status: 400 })
  const b = await loadBackup(params.id)
  if (!b) return NextResponse.json({ success: false, error: 'Không tìm thấy bản sao lưu' }, { status: 404 })
  const stamp = b.thoi_gian.slice(0, 19).replace(/[-:T]/g, '')
  await audit(a, 'sao_luu', params.id, 'tai_sao_luu', {})
  return new NextResponse(b.gz, { headers: { 'Content-Type': 'application/gzip', 'Content-Disposition': `attachment; filename="philong-sao-luu-${params.id}-${stamp}.json.gz"`, 'Cache-Control': 'no-store' } })
}

/** Restore (all tables or the listed ones); a safety backup is taken first. */
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const a = await sysGuard(true); if (a instanceof NextResponse) return a
  if (!ID.test(params.id)) return NextResponse.json({ success: false, error: 'Mã không hợp lệ' }, { status: 400 })
  const body = await req.json().catch(() => ({}))
  const only = Array.isArray(body.tables) ? body.tables.map(String).slice(0, 50) : undefined
  try {
    const safety = await createBackup(a.name, 'Tự động', `Trước khi khôi phục ${params.id}`)
    const report = await restoreBackup(params.id, only)
    await audit(a, 'sao_luu', params.id, 'khoi_phuc', { tables: Object.keys(report), safety: safety?.id })
    return NextResponse.json({ success: true, data: { tables: report, safety: safety?.id } })
  } catch (e: any) {
    console.error('[restore]', e)
    return NextResponse.json({ success: false, error: 'Khôi phục lỗi: ' + String(e.message ?? e).slice(0, 150) }, { status: 500 })
  }
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const a = await sysGuard(true); if (a instanceof NextResponse) return a
  if (!ID.test(params.id)) return NextResponse.json({ success: false, error: 'Mã không hợp lệ' }, { status: 400 })
  const { error } = await supabaseAdmin().from('sao_luu').delete().eq('id', params.id)
  if (error) return NextResponse.json({ success: false, error: 'Lỗi cơ sở dữ liệu' }, { status: 500 })
  await audit(a, 'sao_luu', params.id, 'xoa_sao_luu', {})
  return NextResponse.json({ success: true })
}
