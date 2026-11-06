import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { sysGuard } from '@/lib/sysGuard'
import { BACKUP_TABLES } from '@/lib/backup'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

interface Issue { key: string; title: string; level: 'loi' | 'canh_bao' | 'thong_tin'; count: number; samples: string[]; hint: string; href?: string }

async function all(table: string, cols: string, f?: (q: any) => any) {
  const db = supabaseAdmin(), rows: any[] = []
  for (let from = 0; ; from += 1000) {
    let q: any = db.from(table).select(cols)
    if (f) q = f(q)
    const { data, error } = await q.range(from, from + 999)
    if (error) throw new Error(`${table}: ${error.message}`)
    rows.push(...(data ?? []))
    if (!data || data.length < 1000) break
  }
  return rows
}
const mk = (key: string, title: string, level: Issue['level'], ids: string[], hint: string, href?: string): Issue =>
  ({ key, title, level, count: ids.length, samples: ids.slice(0, 6), hint, href })
const dupes = (rows: any[], col: string, norm = (v: string) => v.trim().toLowerCase()) => {
  const m = new Map<string, string[]>()
  for (const r of rows) { const v = r[col] ? norm(String(r[col])) : ''; if (v) m.set(v, [...(m.get(v) ?? []), r.id]) }
  return [...m.values()].filter((x) => x.length > 1).flat()
}

async function runChecks() {
  const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Ho_Chi_Minh' })
  const [cv, tb, vt, dx, ct, kt, nv, us] = await Promise.all([
    all('v_cong_viec', 'id, canh_bao, id_nguoi_thuc_hien, id_nha_thau'),
    all('thiet_bi', 'id, trang_thai, serial'),
    all('v_vat_tu', 'id, canh_bao, ton_hien_tai'),
    all('de_xuat', 'id'),
    all('de_xuat_chi_tiet', 'id_de_xuat'),
    all('khach_thue', 'id, trang_thai, ngay_ket_thuc'),
    all('nhan_vien', 'id, email, dien_thoai'),
    all('users', 'id, email, id_nhan_vien, trang_thai'),
  ])
  const hasDetail = new Set(ct.map((c: any) => c.id_de_xuat))
  const issues: Issue[] = [
    mk('cv_qua_han', 'Công việc quá hạn chưa hoàn thành', 'canh_bao', cv.filter((r) => r.canh_bao === 'QUÁ HẠN').map((r) => r.id), 'Cập nhật tiến độ, gia hạn hoặc đóng công việc.', '/cong_viec'),
    mk('cv_khong_nguoi', 'Công việc chưa giao cho ai', 'canh_bao', cv.filter((r) => !r.id_nguoi_thuc_hien && !r.id_nha_thau && r.canh_bao !== 'HOÀN THÀNH').map((r) => r.id), 'Chọn người thực hiện hoặc nhà thầu.', '/cong_viec'),
    mk('tb_chua_phan_loai', 'Thiết bị chưa có trạng thái', 'canh_bao', tb.filter((r) => !r.trang_thai).map((r) => r.id), 'Chọn Trong kho / Đang sử dụng / Bảo trì…', '/thiet_bi'),
    mk('tb_trung_serial', 'Thiết bị trùng số serial', 'loi', dupes(tb, 'serial', (v) => v.trim().toUpperCase()), 'Kiểm tra có nhập trùng thiết bị không.', '/thiet_bi'),
    mk('vt_duoi_ton', 'Vật tư dưới tồn tối thiểu', 'canh_bao', vt.filter((r) => r.canh_bao).map((r) => r.id), 'Lập đề xuất mua vật tư.', '/vat_tu'),
    mk('vt_ton_am', 'Vật tư có tồn kho âm', 'loi', vt.filter((r) => Number(r.ton_hien_tai) < 0).map((r) => r.id), 'Xuất nhiều hơn nhập: kiểm tra lịch sử nhập xuất.', '/nhap_xuat_kho'),
    mk('dx_khong_chi_tiet', 'Đề xuất không có dòng chi tiết', 'canh_bao', dx.filter((r) => !hasDetail.has(r.id)).map((r) => r.id), 'Bổ sung chi tiết để in được phiếu đầy đủ.', '/de_xuat'),
    mk('kt_het_han', 'Khách vẫn "Đang thuê" nhưng hợp đồng đã hết hạn', 'canh_bao', kt.filter((r) => r.trang_thai === 'Đang thuê' && r.ngay_ket_thuc && r.ngay_ket_thuc < today).map((r) => r.id), 'Gia hạn hợp đồng hoặc chuyển "Đã rời đi".', '/khach_thue'),
    mk('nv_trung_email', 'Nhân viên trùng email', 'loi', dupes(nv, 'email'), 'Mỗi người nên có một email riêng.', '/nhan_vien'),
    mk('nv_trung_sdt', 'Nhân viên trùng số điện thoại', 'thong_tin', dupes(nv, 'dien_thoai', (v) => v.replace(/\D/g, '')), 'Có thể là nhập trùng hoặc dùng chung số.', '/nhan_vien'),
    mk('us_khong_nv', 'Tài khoản chưa gắn với nhân viên', 'thong_tin', us.filter((r) => !r.id_nhan_vien).map((r) => r.email), 'Gắn nhân viên để lọc "việc của tôi" và chat đúng người.', '/users'),
  ]
  return issues
}

export async function GET() {
  const a = await sysGuard(false); if (a instanceof NextResponse) return a
  try {
    const db = supabaseAdmin()
    const counts: Record<string, number> = {}
    await Promise.all(BACKUP_TABLES.map(async (t) => {
      const { count } = await db.from(t).select('*', { count: 'exact', head: true }); counts[t] = count ?? 0
    }))
    const issues = await runChecks()
    return NextResponse.json({ success: true, data: { counts, issues, at: new Date().toISOString() } })
  } catch (e: any) {
    console.error('[check]', e)
    return NextResponse.json({ success: false, error: 'Không kiểm tra được: ' + String(e.message ?? e).slice(0, 150) }, { status: 500 })
  }
}

/** Save the current findings to the archive (DATA_AUDIT_ARCHIVE). */
export async function POST(_: NextRequest) {
  const a = await sysGuard(true); if (a instanceof NextResponse) return a
  try {
    const issues = (await runChecks()).filter((i) => i.count > 0)
    const rows = issues.map((i) => ({ ngay_xu_ly: new Date().toISOString(), sheet_nguon: i.title, id_goc: i.samples.join(', '), loai_loi: i.level === 'loi' ? 'Lỗi' : i.level === 'canh_bao' ? 'Cảnh báo' : 'Thông tin',
      ly_do: `${i.count} bản ghi — ${i.hint}`, data_goc: i.samples.join('\n'), trang_thai: 'Chưa xử lý' }))
    if (rows.length) { const { error } = await supabaseAdmin().from('data_audit_archive').insert(rows); if (error) throw new Error(error.message) }
    return NextResponse.json({ success: true, data: { saved: rows.length } })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: 'Không lưu được: ' + String(e.message ?? e).slice(0, 150) }, { status: 500 })
  }
}
