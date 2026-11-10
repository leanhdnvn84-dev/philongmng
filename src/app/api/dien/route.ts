import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { getAuth, can, AuthContext, TransientAuthError } from '@/lib/auth'
import { getResource } from '@/lib/resources'
import { audit } from '@/lib/crud'
import { runAction, ActionError } from '@/lib/actions'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

const COLS = 'id, ky, ngay_chot, id_khach_thue, ten_khach_thue, id_tang, tang, ma_cong_to, ten_cong_to, nhom_hoa_don, chi_so_cu, chi_so_moi, so_kwh, don_gia, thanh_tien, vat, trang_thai, ghi_chu'
const err = (m: string, s = 400) => NextResponse.json({ success: false, error: m }, { status: s })
const ID = /^[A-Za-z0-9_.-]{1,64}$/
const MONTH = /^\d{4}-(0[1-9]|1[0-2])$/
const seqOf = (n: string | null) => Number(/-(\d+)$/.exec(n ?? '')?.[1] ?? 0)

async function who(perm: 'view' | 'create' | 'edit' | 'delete' | 'approve'): Promise<AuthContext | NextResponse> {
  let auth: AuthContext | null
  try { auth = await getAuth() } catch (e) { if (e instanceof TransientAuthError) return err('Máy chủ đang bận, đang thử lại…', 503); throw e }
  if (!auth) return err('Chưa đăng nhập hoặc tài khoản bị khóa', 401)
  if (!can(auth, 'TIEN_DIEN', perm)) return err('Bạn không có quyền thực hiện thao tác này', 403)
  return auth
}

export async function GET(req: NextRequest) {
  const a = await who('view'); if (a instanceof NextResponse) return a
  const db = supabaseAdmin()
  if (req.nextUrl.searchParams.get('history')) {
    const { data, error } = await db.from('audit_logs').select('user_email, action, record_id, changes, created_at').eq('table_name', 'tien_dien').order('created_at', { ascending: false }).limit(150)
    if (error) return err('Lỗi cơ sở dữ liệu', 500)
    return NextResponse.json({ success: true, data })
  }
  const rows: any[] = []
  for (let from = 0; ; from += 1000) {
    const { data, error } = await db.from('tien_dien').select(COLS).order('ky', { ascending: false }).order('id', { ascending: true }).range(from, from + 999)
    if (error) return err('Lỗi cơ sở dữ liệu', 500)
    rows.push(...(data ?? []))
    if (!data || data.length < 1000) break
  }
  const { data: kt } = await db.from('khach_thue').select('id, ten_khach_thue, id_tang, trang_thai').order('ten_khach_thue')
  return NextResponse.json({ success: true, data: rows, customers: kt ?? [], at: new Date().toISOString() })
}

async function periodOpen(ky: string) {
  const { data } = await supabaseAdmin().from('tien_dien').select('id, trang_thai, nhom_hoa_don, don_gia, vat').eq('ky', ky)
  if (!data?.length) return { error: `Kỳ ${ky} chưa có dữ liệu` as string | null, rows: [] as any[] }
  if (data.some((r) => r.trang_thai === 'Đã chốt')) return { error: `Kỳ ${ky} đã chốt, hãy mở lại kỳ để sửa`, rows: data }
  return { error: null, rows: data }
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)
  if (!body || typeof body !== 'object') return err('Dữ liệu không hợp lệ')
  const op = String(body.op ?? '')
  const db = supabaseAdmin()
  try {
    switch (op) {
      case 'save': {
        const a = await who('edit'); if (a instanceof NextResponse) return a
        const items = Array.isArray(body.items) ? body.items.slice(0, 500) : []
        if (!items.length) return err('Không có thay đổi')
        const ids = items.map((i: any) => String(i.id)); if (ids.some((i: string) => !ID.test(i))) return err('Mã không hợp lệ')
        const { data: cur } = await db.from('tien_dien').select('id, ky, ma_cong_to, chi_so_cu, trang_thai').in('id', ids)
        const byId = new Map((cur ?? []).map((r) => [r.id, r]))
        const upd: { id: string; v: number | null }[] = []
        for (const it of items) {
          const r = byId.get(String(it.id)); if (!r) return err('Công tơ không tồn tại')
          if (r.trang_thai === 'Đã chốt') return err(`Kỳ ${r.ky} đã chốt, không thể sửa`)
          const raw = it.chi_so_moi === '' || it.chi_so_moi == null ? null : Number(String(it.chi_so_moi).replace(/\s/g, '').replace(',', '.'))
          if (raw !== null && !Number.isFinite(raw)) return err(`Chỉ số của ${r.ma_cong_to} không hợp lệ`)
          if (raw !== null && r.chi_so_cu != null && raw < Number(r.chi_so_cu)) return err(`${r.ma_cong_to}: chỉ số mới không được nhỏ hơn chỉ số cũ`)
          upd.push({ id: r.id, v: raw })
        }
        const res = await Promise.all(upd.map((u) => db.from('tien_dien').update({ chi_so_moi: u.v, nguoi_cap_nhat: a.name, updated_at: new Date().toISOString() }).eq('id', u.id)))
        if (res.some((r) => r.error)) return err('Lỗi cơ sở dữ liệu khi lưu', 500)
        await audit(a, 'tien_dien', null, 'save_readings', { count: upd.length, ky: cur?.[0]?.ky })
        return NextResponse.json({ success: true, data: { saved: upd.length } })
      }
      case 'add_meter':
      case 'add_customer': {
        const a = await who('create'); if (a instanceof NextResponse) return a
        const ky = String(body.ky ?? ''); if (!MONTH.test(ky)) return err('Kỳ không hợp lệ')
        let ma = String(body.ma_cong_to ?? '').trim().slice(0, 40)
        const cu = body.chi_so_cu === '' || body.chi_so_cu == null ? 0 : Number(body.chi_so_cu)
        if (!Number.isFinite(cu) || cu < 0) return err('Chỉ số cũ không hợp lệ')
        const p = await periodOpen(ky); if (p.error) return err(p.error)
        // meter codes of the period: a blank code gets the next free one for that floor (CT17-03…), a taken one is refused with a suggestion
        const { data: codes } = await db.from('tien_dien').select('ma_cong_to').eq('ky', ky)
        const taken = new Set((codes ?? []).map((c: any) => String(c.ma_cong_to).toUpperCase()))
        const floor = /\d+/.exec(String(body.tang ?? ''))?.[0]
        const prefix = (/^([A-Za-z]+\d*)-\d+$/.exec(ma)?.[1] ?? (floor ? `CT${floor.padStart(2, '0')}` : 'CT')).toUpperCase()
        const nextFree = () => { for (let i = 1; i < 500; i++) { const c = `${prefix}-${String(i).padStart(2, '0')}`; if (!taken.has(c)) return c } return `${prefix}-${Date.now() % 100000}` }
        if (!ma) ma = nextFree()
        else if (taken.has(ma.toUpperCase())) return err(`Công tơ ${ma} đã có trong kỳ ${ky}. Mã còn trống gần nhất: ${nextFree()} (hoặc để trống ô mã để hệ thống tự tạo)`)
        const price = p.rows[0]?.don_gia ?? null, vat = p.rows[0]?.vat ?? 0.08
        let base: any
        if (op === 'add_meter') {
          const nhom = String(body.nhom_hoa_don ?? '')
          const { data: g } = await db.from('tien_dien').select('id_khach_thue, ten_khach_thue, id_tang, tang, nhom_hoa_don').eq('ky', ky).eq('nhom_hoa_don', nhom).limit(1)
          if (!g?.length) return err('Không tìm thấy hóa đơn')
          base = g[0]
        } else {
          const kid = String(body.id_khach_thue ?? ''); if (!ID.test(kid)) return err('Chọn khách thuê')
          const { data: k } = await db.from('khach_thue').select('id, ten_khach_thue, id_tang').eq('id', kid).maybeSingle()
          if (!k) return err('Khách thuê không tồn tại')
          const day = (p.rows.map((r) => String(r.nhom_hoa_don ?? '')).find((n) => /^\d{8}-/.test(n)) ?? '').slice(0, 8) || (ky.replace('-', '') + '22')
          const next = Math.max(0, ...p.rows.map((r) => seqOf(r.nhom_hoa_don))) + 1
          base = { id_khach_thue: k.id, ten_khach_thue: k.ten_khach_thue, id_tang: k.id_tang, tang: null, nhom_hoa_don: `${day}-${k.id}-${next}` }
        }
        const rec = {
          ky, id_khach_thue: base.id_khach_thue, ten_khach_thue: base.ten_khach_thue, id_tang: base.id_tang, tang: String(body.tang ?? '').trim().slice(0, 60) || base.tang,
          ma_cong_to: ma, ten_cong_to: String(body.ten_cong_to ?? '').trim().slice(0, 100) || null, nhom_hoa_don: base.nhom_hoa_don,
          chi_so_cu: cu, don_gia: price, vat, trang_thai: 'Nháp', nguon: 'Thêm thủ công', nguoi_cap_nhat: a.name,
        }
        const { data, error } = await db.from('tien_dien').insert(rec).select('id').single()
        if (error) return err('Không thêm được công tơ', 500)
        await audit(a, 'tien_dien', data.id, op, { ky, ma_cong_to: ma, nhom_hoa_don: rec.nhom_hoa_don })
        return NextResponse.json({ success: true, data: { id: data.id, ma_cong_to: ma, nhom_hoa_don: rec.nhom_hoa_don } })
      }
      case 'set_price': {
        const a = await who('edit'); if (a instanceof NextResponse) return a
        const ky = String(body.ky ?? ''); if (!MONTH.test(ky)) return err('Kỳ không hợp lệ')
        const to = Number(String(body.don_gia ?? '').replace(/[\s.]/g, '').replace(',', '.'))
        if (!Number.isFinite(to) || to <= 0 || to > 1_000_000) return err('Giá điện không hợp lệ')
        const p = await periodOpen(ky); if (p.error) return err(p.error)
        const nhom = body.nhom_hoa_don ? String(body.nhom_hoa_don).slice(0, 80) : null
        const scope = nhom ? p.rows.filter((r) => r.nhom_hoa_don === nhom) : p.rows
        if (!scope.length) return err('Không tìm thấy hóa đơn')
        const from = Array.from(new Set(scope.map((r) => Number(r.don_gia ?? 0))))
        let q = db.from('tien_dien').update({ don_gia: to, nguoi_cap_nhat: a.name, updated_at: new Date().toISOString() }).eq('ky', ky)
        if (nhom) q = q.eq('nhom_hoa_don', nhom)
        const { data, error } = await q.select('id')
        if (error) return err('Lỗi cơ sở dữ liệu', 500)
        await audit(a, 'tien_dien', null, 'set_price', { ky, tu: from.join(', '), den: to, pham_vi: nhom ? `hóa đơn ${nhom}` : 'cả kỳ', so_cong_to: data?.length ?? 0, ly_do: String(body.ly_do ?? '').slice(0, 200) || undefined })
        return NextResponse.json({ success: true, data: { message: `Đã đổi giá điện ${nhom ? 'của hóa đơn' : 'cả kỳ'} thành ${new Intl.NumberFormat('vi-VN').format(to)} đ/kWh (${data?.length ?? 0} công tơ)` } })
      }
      case 'remove_meter': {
        const a = await who('delete'); if (a instanceof NextResponse) return a
        const id = String(body.id ?? ''); if (!ID.test(id)) return err('Mã không hợp lệ')
        const { data: r } = await db.from('tien_dien').select('id, ky, ma_cong_to, trang_thai').eq('id', id).maybeSingle()
        if (!r) return err('Công tơ không tồn tại', 404)
        if (r.trang_thai === 'Đã chốt') return err('Kỳ đã chốt, không thể xóa')
        const { error } = await db.from('tien_dien').delete().eq('id', id)
        if (error) return err('Không xóa được', 500)
        await audit(a, 'tien_dien', id, 'remove_meter', { ky: r.ky, ma_cong_to: r.ma_cong_to })
        return NextResponse.json({ success: true })
      }
      case 'reopen': {
        const a = await who('approve'); if (a instanceof NextResponse) return a
        const ky = String(body.ky ?? ''); if (!MONTH.test(ky)) return err('Kỳ không hợp lệ')
        const { count: later } = await db.from('tien_dien').select('id', { count: 'exact', head: true }).gt('ky', ky)
        if (later) return err('Chỉ mở lại được kỳ mới nhất (đã có kỳ sau)')
        const { data, error } = await db.from('tien_dien').update({ trang_thai: 'Nháp', ngay_chot: null, nguoi_cap_nhat: a.name }).eq('ky', ky).eq('trang_thai', 'Đã chốt').select('id')
        if (error) return err('Lỗi cơ sở dữ liệu', 500)
        if (!data?.length) return err('Kỳ này chưa chốt')
        await audit(a, 'tien_dien', null, 'reopen_period', { ky, rows: data.length })
        return NextResponse.json({ success: true, data: { message: `Đã mở lại kỳ ${ky}` } })
      }
      case 'tao_ky':
      case 'chot_ky': {
        const a = await who(op === 'chot_ky' ? 'approve' : 'create'); if (a instanceof NextResponse) return a
        const res = getResource('tien_dien')!
        const r = await runAction(res, op, '_', a, body)
        return NextResponse.json({ success: true, data: r })
      }
      default: return err('Thao tác không tồn tại', 404)
    }
  } catch (e: any) {
    if (e instanceof ActionError) return err(e.message, e.status)
    console.error('[dien]', e)
    return err('Lỗi máy chủ', 500)
  }
}
