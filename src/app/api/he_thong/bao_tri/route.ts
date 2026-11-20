import { NextRequest, NextResponse } from 'next/server'
import { sysGuard } from '@/lib/sysGuard'
import { createBackup } from '@/lib/backup'
import { Ctx, GROUPS, findCheck, saveSummary, scanAll } from '@/lib/dataMaint'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

const fail = (m: string, s = 400) => NextResponse.json({ success: false, error: m }, { status: s })

/** scan every rule; also refreshes the summary the bell reads */
export async function GET() {
  const a = await sysGuard(false); if (a instanceof NextResponse) return a
  try {
    const checks = await scanAll()
    await saveSummary(checks).catch(() => {})
    return NextResponse.json({ success: true, data: { groups: GROUPS, checks, at: new Date().toISOString() } })
  } catch (e: any) { return fail('Không quét được: ' + String(e.message ?? e).slice(0, 150), 500) }
}

/** op = fix (bulk, backup first) | act (one row) | map_get | map_apply (backup first). Changes are Super Admin only. */
export async function POST(req: NextRequest) {
  const b = await req.json().catch(() => null)
  if (!b || typeof b !== 'object') return fail('Dữ liệu không hợp lệ')
  const op = String(b.op ?? ''), check = findCheck(String(b.key ?? ''))
  if (!check) return fail('Không có mục kiểm tra này')
  const a = await sysGuard(false); if (a instanceof NextResponse) return a
  if (op !== 'map_get' && !a.superAdmin) return fail('Chỉ Super Admin được sửa dữ liệu', 403)
  const c = new Ctx()
  try {
    if (op === 'map_get') {
      if (!check.mapping) return fail('Mục này không có bảng ghép')
      return NextResponse.json({ success: true, data: await check.mapping(c) })
    }
    if (op === 'act') {
      const act = String(b.act ?? ''), id = String(b.id ?? '')
      if (!check.act || !check.acts?.some((x) => x.key === act) || !id) return fail('Thao tác không hợp lệ')
      return NextResponse.json({ success: true, message: await check.act(c, a, id, act) })
    }
    if (op === 'fix' || op === 'map_apply') {
      const run = op === 'fix' ? check.fix : check.applyMap
      if (!run) return fail('Mục này không sửa tự động được')
      if (!(await check.scan(c)).length) return NextResponse.json({ success: true, message: 'Không còn dòng nào cần sửa.' })
      const map = op === 'map_apply' ? b.map : undefined
      if (op === 'map_apply' && (!map || typeof map !== 'object')) return fail('Thiếu bảng ghép')
      const backup = await createBackup(a.name, 'Tự động', `Trước khi bảo trì dữ liệu: ${check.title}`)
      const msg = op === 'fix' ? await check.fix!(c, a) : await check.applyMap!(c, a, map)
      return NextResponse.json({ success: true, message: `${msg} Bản sao lưu trước khi sửa: ${backup.id}.` })
    }
    return fail('Thao tác không hợp lệ')
  } catch (e: any) {
    console.error('[bao_tri]', e)
    return fail(String(e.message ?? e).slice(0, 200), 500)
  }
}
