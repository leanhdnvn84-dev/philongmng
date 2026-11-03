import { supabaseAdmin } from '@/lib/supabase/admin'
import { getAuth, can } from '@/lib/auth'
import { ok, fail } from '@/lib/http'
import { todayVN } from '@/lib/crud'

export const dynamic = 'force-dynamic'

export async function GET() {
  const auth = await getAuth()
  if (!auth) return fail('Chưa đăng nhập', 401)
  const db = supabaseAdmin()
  const today = todayVN()

  const count = async (table: string, f: (q: any) => any = (q) => q) => {
    const { count: c } = await f(db.from(table).select('id', { count: 'exact', head: true }))
    return c ?? 0
  }
  const tasks: Record<string, PromiseLike<any>> = {}

  if (can(auth, 'CONG_VIEC', 'view')) {
    tasks.cv = Promise.all([
      count('v_cong_viec', (q) => q.eq('canh_bao', 'QUÁ HẠN')),
      count('v_cong_viec', (q) => q.eq('canh_bao', 'ĐẾN HẠN HÔM NAY')),
      count('v_cong_viec', (q) => q.in('canh_bao', ['CẦN LÀM NGAY', 'SẮP ĐẾN HẠN'])),
      count('v_cong_viec', (q) => q.neq('canh_bao', 'HOÀN THÀNH')),
      db.from('v_cong_viec').select('id, noi_dung, deadline, so_ngay_con_lai, canh_bao, giai_doan_hien_tai')
        .in('canh_bao', ['QUÁ HẠN', 'ĐẾN HẠN HÔM NAY', 'CẦN LÀM NGAY', 'SẮP ĐẾN HẠN']).order('deadline').limit(8),
    ]).then(([overdue, dueToday, soon, open, list]) => ({ overdue, dueToday, soon, open, list: list.data ?? [] }))
  }
  if (can(auth, 'CVHN', 'view')) {
    tasks.hn = Promise.all([
      count('cong_viec_hang_ngay', (q) => q.eq('ngay', today)),
      count('cong_viec_hang_ngay', (q) => q.eq('ngay', today).ilike('trang_thai', '%hoàn thành%')),
    ]).then(([total, done]) => ({ total, done }))
  }
  if (can(auth, 'KHACH_RA_VAO', 'view')) {
    tasks.krv = Promise.all([
      count('khach_ra_vao', (q) => q.eq('trang_thai', 'Đang trong tòa nhà')),
      count('khach_ra_vao', (q) => q.eq('ngay', today)),
    ]).then(([inside, todayTotal]) => ({ inside, today: todayTotal }))
  }
  if (can(auth, 'BAO_TRI', 'view')) {
    tasks.bt = Promise.all([
      count('v_lich_bao_tri', (q) => q.eq('canh_bao', 'TRỄ LỊCH')),
      count('v_lich_bao_tri', (q) => q.eq('canh_bao', 'ĐẾN HẠN HÔM NAY')),
      count('v_lich_bao_tri', (q) => q.eq('canh_bao', 'SẮP ĐẾN HẠN')),
      count('v_lich_bao_tri', (q) => q.eq('canh_bao', 'CHỜ NGÀY GỐC')),
      db.from('v_lich_bao_tri').select('id, tang, ten_khu_vuc, ten_hang_muc, ngay_ke_tiep, so_ngay_con_lai, canh_bao')
        .in('canh_bao', ['TRỄ LỊCH', 'ĐẾN HẠN HÔM NAY', 'SẮP ĐẾN HẠN']).order('ngay_ke_tiep').limit(8),
    ]).then(([late, dueToday, soon, waiting, list]) => ({ late, dueToday, soon, waiting, list: list.data ?? [] }))
  }
  if (can(auth, 'DE_XUAT', 'view')) {
    tasks.dx = db.from('v_de_xuat').select('tong_tien').eq('trang_thai', 'Chờ duyệt').limit(5000)
      .then(({ data }) => ({ pending: data?.length ?? 0, amount: (data ?? []).reduce((s, r) => s + Number(r.tong_tien || 0), 0) }))
  }
  if (can(auth, 'KHO', 'view')) {
    tasks.kho = db.from('v_vat_tu').select('id, ten_vat_tu, dvt, ton_hien_tai, ton_toi_thieu').neq('canh_bao', '').order('ten_vat_tu').limit(50)
      .then(({ data }) => ({ low: data ?? [] }))
  }
  if (can(auth, 'THIET_BI', 'view')) {
    tasks.tb = db.from('thiet_bi').select('trang_thai').limit(20000).then(({ data }) => {
      const by: Record<string, number> = {}
      for (const r of data ?? []) by[r.trang_thai || '(trống)'] = (by[r.trang_thai || '(trống)'] ?? 0) + 1
      return { total: data?.length ?? 0, by }
    })
  }
  if (can(auth, 'KHACH_THUE', 'view')) {
    tasks.kt = Promise.all([
      count('khach_thue', (q) => q.eq('trang_thai', 'Đang thuê')),
      db.from('v_khach_thue').select('id, ten_khach_thue, ngay_ket_thuc, so_ngay_con_lai, canh_bao')
        .eq('trang_thai', 'Đang thuê').in('canh_bao', ['SẮP HẾT HẠN', 'ĐÃ HẾT HẠN']).order('ngay_ket_thuc').limit(8),
    ]).then(([renting, list]) => ({ renting, expiring: list.data ?? [] }))
  }
  if (can(auth, 'QUAN_LY_TANG', 'view')) {
    tasks.tang = Promise.all([count('tang'), count('tang', (q) => q.eq('trang_thai_su_dung', 'Trống'))])
      .then(([total, empty]) => ({ total, empty }))
  }

  const keys = Object.keys(tasks)
  const values = await Promise.all(Object.values(tasks))
  return ok({ data: Object.fromEntries(keys.map((k, i) => [k, values[i]])), today })
}
