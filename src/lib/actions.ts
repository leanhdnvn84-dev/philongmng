import 'server-only'
import { supabaseAdmin } from '@/lib/supabase/admin'
import type { AuthContext } from '@/lib/auth'
import type { Resource } from '@/lib/resources'
import { audit, dayMonthVN, timeVN, todayVN } from '@/lib/crud'

export class ActionError extends Error { constructor(msg: string, public status = 400) { super(msg) } }
const bad = (m: string, s = 400): never => { throw new ActionError(m, s) }
const one = (s: unknown) => String(s ?? '').replace(/\s+/g, ' ').trim()

type Handler = (ctx: { res: Resource; auth: AuthContext; id: string; row: any; input: Record<string, any> }) => Promise<any>

async function loadRow(res: Resource, id: string) {
  const { data } = await supabaseAdmin().from(res.table).select('*').eq('id', id).maybeSingle()
  if (!data) bad('Không tìm thấy', 404)
  return data
}

// ── Công việc: append "- dd/mm [Giai đoạn]: nội dung" (same format as the V191 sheet) ──
const ghiTienDo: Handler = async ({ res, auth, id, row, input }) => {
  const stage = one(input.giai_doan), text = one(input.noi_dung)
  if (!stage && !text) bad('Nhập nội dung hoặc chọn giai đoạn')
  const day = dayMonthVN()
  const line = `- ${day}${stage ? ` [${stage}]` : ''}${text ? `: ${text}` : ''}`
  const prev = row.giai_doan_hien_tai || ''
  const stageLine = stage && stage !== prev ? `- ${day} [${stage}] ← ${prev || '(chưa có)'}${text ? `: ${text}` : ''}` : null
  const db = supabaseAdmin()
  const { error } = await db.rpc('ghi_tien_do', {
    p_bang: res.table, p_id: id, p_dong: line, p_giai_doan: stageLine ? stage : null, p_dong_giai_doan: stageLine,
  })
  if (error) throw error
  const patch: Record<string, any> = {}
  if (stage === 'Hoàn thành') { patch.trang_thai = 'Hoàn thành'; if (!row.ngay_hoan_thanh) patch.ngay_hoan_thanh = todayVN() }
  else if (stage && (!row.trang_thai || row.trang_thai === 'Chưa thực hiện')) patch.trang_thai = 'Đang thực hiện'
  if (Object.keys(patch).length) await db.from(res.table).update(patch).eq('id', id)
  await audit(auth, res.table, id, 'progress', { line, ...patch })
  return { line }
}

const checkout: Handler = async ({ auth, id, row }) => {
  if (row.trang_thai !== 'Đang trong tòa nhà') bad('Khách không ở trạng thái đang trong tòa nhà')
  const patch = { gio_ra: timeVN(), trang_thai: 'Đã ra', nguoi_checkout: auth.name }
  const { data } = await supabaseAdmin().from('khach_ra_vao').update(patch).eq('id', id).eq('trang_thai', 'Đang trong tòa nhà').select('id')
  if (!data?.length) bad('Lượt khách vừa được cập nhật bởi người khác', 409)
  await audit(auth, 'khach_ra_vao', id, 'checkout', patch)
}

const checkIn: Handler = async ({ auth, id, row }) => {
  if (row.trang_thai !== 'Hẹn trước') bad('Chỉ khách hẹn trước mới check-in được')
  const patch = { ngay: todayVN(), gio_vao: timeVN(), trang_thai: 'Đang trong tòa nhà', nguoi_dang_ky: auth.name }
  const { data } = await supabaseAdmin().from('khach_ra_vao').update(patch).eq('id', id).eq('trang_thai', 'Hẹn trước').select('id')
  if (!data?.length) bad('Lượt khách vừa được cập nhật bởi người khác', 409)
  await audit(auth, 'khach_ra_vao', id, 'check_in', patch)
}

const huyLuot: Handler = async ({ auth, id, row }) => {
  if (!['Đang trong tòa nhà', 'Hẹn trước'].includes(row.trang_thai)) bad('Lượt khách này không hủy được')
  const { data } = await supabaseAdmin().from('khach_ra_vao').update({ trang_thai: 'Hủy' }).eq('id', id).eq('trang_thai', row.trang_thai).select('id')
  if (!data?.length) bad('Lượt khách vừa được cập nhật bởi người khác', 409)
  await audit(auth, 'khach_ra_vao', id, 'cancel', { from: row.trang_thai })
}

// ── Đề xuất ──
const duyet: Handler = async ({ auth, id, row }) => {
  const db = supabaseAdmin()
  const { data: lines } = await db.from('de_xuat_chi_tiet').select('*').eq('id_de_xuat', id)
  if (!lines?.length) bad('Đề xuất chưa có dòng chi tiết nào')
  // conditional update = only one approver wins; no double stock entry
  const { data: done } = await db.from('de_xuat')
    .update({ trang_thai: 'Đã duyệt', nguoi_duyet: auth.name, ngay_duyet: todayVN() })
    .eq('id', id).neq('trang_thai', 'Đã duyệt').select('id')
  if (!done?.length) bad('Đề xuất đã được duyệt trước đó', 409)
  let stocked = 0
  if (row.loai_de_xuat === 'MUA_VAT_TU') {
    try {
      for (const l of lines!) {
        if (!l.id_vat_tu) continue
        const { error } = await db.rpc('kho_giao_dich', {
          p_vat_tu: l.id_vat_tu, p_loai: 'NHAP', p_so_luong: l.so_luong, p_ngay: todayVN(),
          p_noi_dung: `Nhập theo đề xuất ${id}`, p_nguon: 'DE_XUAT', p_chung_tu: id, p_nguoi_tao: auth.name,
        })
        if (error) throw error
        stocked++
      }
    } catch (e) {
      // never leave a half-approved proposal: undo the stock entries and the approval
      await db.from('nhap_xuat_kho').delete().eq('id_chung_tu', id).eq('nguon_giao_dich', 'DE_XUAT')
      await db.from('de_xuat').update({ trang_thai: row.trang_thai ?? 'Chờ duyệt', nguoi_duyet: null, ngay_duyet: null }).eq('id', id)
      throw e
    }
  }
  await audit(auth, 'de_xuat', id, 'approve', { stocked })
  return { stocked }
}

const tuChoi: Handler = async ({ auth, id, row, input }) => {
  const reason = one(input.ly_do)
  if (!reason) bad('Nhập lý do từ chối')
  if (row.trang_thai === 'Đã duyệt') bad('Đề xuất đã duyệt', 409)
  const ghi_chu = [row.ghi_chu, `Từ chối ${dayMonthVN()} bởi ${auth.name}: ${reason}`].filter(Boolean).join('\n')
  await supabaseAdmin().from('de_xuat').update({ trang_thai: 'Từ chối', nguoi_duyet: auth.name, ngay_duyet: todayVN(), ghi_chu }).eq('id', id)
  await audit(auth, 'de_xuat', id, 'reject', { reason })
}

// ── Kho ──
const nhapXuat = (fixed?: 'NHAP' | 'XUAT'): Handler => async ({ auth, id: rowId, input }) => {
  const id = fixed ? String(input.id_vat_tu ?? '') : rowId
  const loai = fixed ?? String(input.loai_giao_dich ?? '')
  const qty = Number(input.so_luong)
  if (fixed && !id) bad('Chọn vật tư trong danh mục')
  if (!['NHAP', 'XUAT'].includes(loai)) bad('Chọn Nhập hoặc Xuất')
  if (!(qty > 0)) bad('Số lượng phải lớn hơn 0')
  if (input.ngay && !/^\d{4}-\d{2}-\d{2}$/.test(input.ngay)) bad('Ngày không hợp lệ')
  if (loai === 'XUAT') { // issue only what is in stock
    const { data: st } = await supabaseAdmin().from('v_vat_tu').select('ton_hien_tai, ten_vat_tu').eq('id', id).maybeSingle()
    if (!st) bad('Vật tư không tồn tại', 404)
    if (!(Number(st!.ton_hien_tai) > 0)) bad(`${st!.ten_vat_tu} đã hết hàng, không thể xuất`, 409)
    if (qty > Number(st!.ton_hien_tai)) bad(`Tồn kho không đủ để xuất (còn ${st!.ton_hien_tai})`, 409)
  }
  const { data, error } = await supabaseAdmin().rpc('kho_giao_dich', {
    p_vat_tu: id, p_loai: loai, p_so_luong: qty, p_ngay: input.ngay || todayVN(),
    p_noi_dung: one(input.noi_dung) || null, p_nguon: 'THU_CONG', p_chung_tu: null, p_nguoi_tao: auth.name,
  })
  if (error) throw error
  await audit(auth, 'nhap_xuat_kho', data as string, 'create', { id_vat_tu: id, loai, qty })
}

// ── Thiết bị ──
async function names(khuVucId?: string | null, nhanVienId?: string | null) {
  const db = supabaseAdmin()
  const kv = khuVucId ? (await db.from('khu_vuc').select('tang, ten_khu_vuc').eq('id', khuVucId).maybeSingle()).data : null
  const nv = nhanVienId ? (await db.from('nhan_vien').select('ho_ten').eq('id', nhanVienId).maybeSingle()).data : null
  if (khuVucId && !kv) bad('Khu vực không tồn tại')
  if (nhanVienId && !nv) bad('Nhân viên không tồn tại')
  return { kv: kv ? [kv.tang, kv.ten_khu_vuc].filter(Boolean).join(' · ') : '', nv: nv?.ho_ten ?? '' }
}

const chuyen: Handler = async ({ auth, id, row, input }) => {
  const toKv = input.id_khu_vuc || null, toNv = input.id_nguoi_su_dung || null
  if (!toKv && !toNv) bad('Chọn khu vực hoặc người dùng mới')
  if (row.trang_thai === 'Đã thanh lý') bad('Thiết bị đã thanh lý')
  const from = await names(row.id_khu_vuc, row.id_nguoi_su_dung)
  const to = await names(toKv ?? row.id_khu_vuc, toNv ?? row.id_nguoi_su_dung)
  const db = supabaseAdmin()
  await db.from('lich_su_chuyen_thiet_bi').insert({
    id_thiet_bi: id, ten_thiet_bi: row.ten_thiet_bi, tu_khu_vuc: from.kv, den_khu_vuc: to.kv,
    tu_nguoi_dung: from.nv, den_nguoi_dung: to.nv, ly_do: one(input.ly_do) || null, ngay_chuyen: todayVN(),
  })
  const patch: Record<string, any> = {}
  if (toKv) patch.id_khu_vuc = toKv
  if (toNv) patch.id_nguoi_su_dung = toNv
  if (row.trang_thai === 'Trong kho') patch.trang_thai = 'Đang sử dụng'
  await db.from('thiet_bi').update(patch).eq('id', id)
  await audit(auth, 'thiet_bi', id, 'transfer', { from, to })
}

const RECOVER_STATES = ['Trong kho', 'Bảo trì', 'Chờ thanh lý', 'Đã thanh lý']
const thuHoi: Handler = async ({ auth, id, row, input }) => {
  const after = String(input.trang_thai_sau_thu_hoi ?? '')
  if (!RECOVER_STATES.includes(after)) bad('Chọn trạng thái sau thu hồi')
  if (row.trang_thai === 'Đã thanh lý') bad('Thiết bị đã thanh lý')
  await names(input.id_khu_vuc_sau_thu_hoi, input.id_nguoi_tra)
  const db = supabaseAdmin()
  const rec = {
    id_thiet_bi: id, ngay_thu_hoi: todayVN(),
    id_nguoi_tra: input.id_nguoi_tra || row.id_nguoi_su_dung || null,
    id_nguoi_nhan_thu_hoi: input.id_nguoi_nhan_thu_hoi || null,
    tinh_trang_khi_tra: one(input.tinh_trang_khi_tra) || null, trang_thai_sau_thu_hoi: after,
    id_khu_vuc_sau_thu_hoi: input.id_khu_vuc_sau_thu_hoi || null,
    huong_xu_ly: one(input.huong_xu_ly) || null, so_bien_ban: one(input.so_bien_ban) || null,
  }
  const { data, error } = await db.from('thu_hoi').insert(rec).select('id').single()
  if (error) throw error
  await db.from('thiet_bi').update({
    trang_thai: after, id_nguoi_su_dung: null,
    ...(input.id_khu_vuc_sau_thu_hoi ? { id_khu_vuc: input.id_khu_vuc_sau_thu_hoi } : {}),
    ...(rec.tinh_trang_khi_tra ? { tinh_trang: rec.tinh_trang_khi_tra } : {}),
  }).eq('id', id)
  await audit(auth, 'thu_hoi', data.id, 'create', rec)
  return { id: data.id }
}

// ── Kế hoạch bảo trì: ghi nhận một lần bảo trì ──
const ghiNhanBaoTri: Handler = async ({ auth, id, row, input }) => {
  if (row.trang_thai === 'Tạm ngưng') bad('Lịch này đang tạm ngưng')
  const day = one(input.ngay_thuc_hien) || todayVN()
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) bad('Ngày thực hiện không đúng định dạng')
  if (day > todayVN()) bad('Ngày thực hiện không được ở tương lai')
  const rec = {
    id_lich: id, id_khu_vuc: row.id_khu_vuc, id_hang_muc: row.id_hang_muc, ngay_thuc_hien: day,
    id_nguoi_thuc_hien: one(input.id_nguoi_thuc_hien) || row.id_nguoi_phu_trach || null, id_nha_thau: one(input.id_nha_thau) || null,
    noi_dung_thuc_hien: one(input.noi_dung_thuc_hien) || null, ket_qua: one(input.ket_qua) || null, ghi_chu: one(input.ghi_chu) || null, trang_thai: 'Hoàn thành',
  }
  const { data, error } = await supabaseAdmin().from('nhat_ky_bao_tri').insert(rec).select('id').single()
  if (error) throw error
  await audit(auth, 'nhat_ky_bao_tri', data.id, 'create', rec)
  return { id: data.id, message: `Đã ghi nhận bảo trì ${data.id} ngày ${day.slice(8, 10)}/${day.slice(5, 7)}/${day.slice(0, 4)}` }
}

// ── Tiền điện ──
const MONTH = /^\d{4}-(0[1-9]|1[0-2])$/
const taoKy: Handler = async ({ auth, input }) => {
  const ky = String(input.ky ?? '')
  if (!MONTH.test(ky)) bad('Kỳ phải có dạng YYYY-MM')
  const price = input.don_gia === '' || input.don_gia == null ? null : Number(input.don_gia)
  if (price !== null && !(price >= 0)) bad('Đơn giá không hợp lệ')
  const db = supabaseAdmin()
  const { data: last } = await db.from('tien_dien').select('ky').lt('ky', ky).order('ky', { ascending: false }).limit(1)
  if (!last?.length) bad('Chưa có kỳ trước để sao chép công tơ. Hãy thêm công tơ bằng nút Thêm.')
  const { data: prev } = await db.from('tien_dien').select('*').eq('ky', last![0].ky)
  // a meter may have several readings in one period: continue from its latest one
  const latest = new Map<string, any>()
  for (const p of prev ?? []) {
    const cur = latest.get(p.ma_cong_to)
    const later = !cur || String(p.ngay_chot ?? '') > String(cur.ngay_chot ?? '') ||
      (String(p.ngay_chot ?? '') === String(cur.ngay_chot ?? '') && Number(p.chi_so_moi ?? 0) > Number(cur.chi_so_moi ?? 0))
    if (later) latest.set(p.ma_cong_to, p)
  }
  const { data: existing } = await db.from('tien_dien').select('ma_cong_to').eq('ky', ky)
  const have = new Set((existing ?? []).map((r) => r.ma_cong_to))
  // invoice groups of the new period: same day of month as the previous one, same order (V191: yyyymmdd-KTxxxx-seq)
  const seqOf = (n: string | null) => Number(/-(\d+)$/.exec(n ?? '')?.[1] ?? 0)
  const prevGroups = [...new Set([...latest.values()].map((p) => String(p.nhom_hoa_don ?? '')).filter(Boolean))].sort((a, b) => seqOf(a) - seqOf(b))
  const dayPart = /^\d{6}(\d{2})-/.exec(prevGroups[0] ?? '')?.[1] ?? '22'
  const newGroup = new Map(prevGroups.map((g, i) => [g, `${ky.replace('-', '')}${dayPart}-${g.split('-')[1] ?? 'KT'}-${i + 1}`]))
  const rows = [...latest.values()].filter((p) => !have.has(p.ma_cong_to)).map((p) => ({
    ky, id_khach_thue: p.id_khach_thue, ten_khach_thue: p.ten_khach_thue, id_tang: p.id_tang, tang: p.tang,
    ma_cong_to: p.ma_cong_to, ten_cong_to: p.ten_cong_to, nhom_hoa_don: newGroup.get(String(p.nhom_hoa_don ?? '')) ?? p.nhom_hoa_don,
    chi_so_cu: p.chi_so_moi, chi_so_moi: null, don_gia: price ?? p.don_gia, vat: p.vat, chu_ky_thang: p.chu_ky_thang,
    trang_thai: 'Nháp', nguon: `Tạo từ kỳ ${p.ky}`, nguoi_cap_nhat: auth.name,
  }))
  if (!rows.length) bad(`Kỳ ${ky} đã có đủ công tơ`)
  const { data, error } = await db.from('tien_dien').insert(rows).select('id')
  if (error) throw error
  await audit(auth, 'tien_dien', null, 'create_period', { ky, from: last![0].ky, created: data?.length ?? 0 })
  return { message: `Đã tạo ${data?.length ?? 0} công tơ cho kỳ ${ky} (sao chép từ ${last![0].ky})` }
}

const chotKy: Handler = async ({ auth, input }) => {
  const ky = String(input.ky ?? '')
  if (!MONTH.test(ky)) bad('Kỳ phải có dạng YYYY-MM')
  const db = supabaseAdmin()
  const { count: missing } = await db.from('tien_dien').select('id', { count: 'exact', head: true }).eq('ky', ky).is('chi_so_moi', null)
  if (missing) bad(`Còn ${missing} công tơ chưa nhập chỉ số mới`)
  const { data } = await db.from('tien_dien').update({ trang_thai: 'Đã chốt', ngay_chot: todayVN(), nguoi_cap_nhat: auth.name })
    .eq('ky', ky).neq('trang_thai', 'Đã chốt').select('id')
  const n = data?.length ?? 0
  if (!n) bad('Không có công tơ nào cần chốt trong kỳ này')
  await audit(auth, 'tien_dien', null, 'lock_period', { ky, rows: n })
  return { message: `Đã chốt ${n} công tơ kỳ ${ky}` }
}

const HANDLERS: Record<string, Record<string, Handler>> = {
  cong_viec: { tien_do: ghiTienDo },
  cong_viec_hang_ngay: { tien_do: ghiTienDo },
  khach_ra_vao: { checkout, check_in: checkIn, huy: huyLuot },
  de_xuat: { duyet, tu_choi: tuChoi },
  vat_tu: { nhap_xuat: nhapXuat(), nhap_kho: nhapXuat('NHAP'), xuat_kho: nhapXuat('XUAT') },
  thiet_bi: { chuyen, thu_hoi: thuHoi },
  tien_dien: { tao_ky: taoKy, chot_ky: chotKy },
  lich_bao_tri: { ghi_nhan: ghiNhanBaoTri },
}

export async function runAction(res: Resource, actionKey: string, id: string, auth: AuthContext, input: Record<string, any>) {
  const handler = HANDLERS[res.key]?.[actionKey]
  if (!handler) bad('Thao tác không tồn tại', 404)
  const scope = res.actions?.find((a) => a.key === actionKey)?.scope ?? 'row'
  const row = scope === 'row' ? await loadRow(res, id) : null
  return handler!({ res, auth, id, row, input })
}
