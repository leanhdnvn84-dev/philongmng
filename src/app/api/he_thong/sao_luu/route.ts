import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { createBackup } from '@/lib/backup'
import { sysGuard } from '@/lib/sysGuard'
import { audit } from '@/lib/crud'
import { driveConfigured } from '@/lib/driveUpload'
import { r2BackupStatus } from '@/lib/r2Backup'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

export async function GET() {
  const a = await sysGuard(false); if (a instanceof NextResponse) return a
  const [{ data, error }, r2] = await Promise.all([
    supabaseAdmin().from('sao_luu').select('id, thoi_gian, nguoi_tao, loai, ghi_chu, so_bang, so_dong, kich_thuoc, chi_tiet').order('thoi_gian', { ascending: false }).limit(50),
    r2BackupStatus(),
  ])
  if (error) return NextResponse.json({ success: false, error: 'Lỗi cơ sở dữ liệu' }, { status: 500 })
  return NextResponse.json({ success: true, data, canManage: a.superAdmin, kho: { drive: driveConfigured(), r2 } })
}

export async function POST(req: NextRequest) {
  const a = await sysGuard(true); if (a instanceof NextResponse) return a
  const body = await req.json().catch(() => ({}))
  const note = String(body.ghi_chu ?? '').trim().slice(0, 300) || null
  try {
    const r = await createBackup(a.name, 'Thủ công', note)
    await audit(a, 'sao_luu', r?.id ?? null, 'tao_sao_luu', { so_dong: r?.so_dong, r2: r?.r2 ? (r.r2.ok ? r.r2.key : 'LỖI') : undefined })
    return NextResponse.json({ success: true, data: r })
  } catch (e: any) {
    console.error('[backup]', e)
    return NextResponse.json({ success: false, error: 'Không tạo được bản sao lưu: ' + String(e.message ?? e).slice(0, 150) }, { status: 500 })
  }
}
