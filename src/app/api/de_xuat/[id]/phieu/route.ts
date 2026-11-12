import { NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { guard, ok, fail, validId } from '@/lib/http'
import { getResource, PROPOSAL_KINDS } from '@/lib/resources'
import { audit } from '@/lib/crud'

export const dynamic = 'force-dynamic'

/** Data for the printed "Phiếu đề xuất" (V191 template): header, requester, lines and how many times it was printed. */
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const g = await guard('de_xuat', 'view')
  if (g instanceof Response) return g
  const res = getResource('de_xuat')!
  if (!validId(res, params.id)) return fail('Mã đề xuất không hợp lệ')
  const db = supabaseAdmin()

  const { data: dx, error } = await db.from('de_xuat').select('*').eq('id', params.id).maybeSingle()
  if (error) return fail('Lỗi cơ sở dữ liệu', 500)
  if (!dx) return fail('Không tìm thấy đề xuất', 404)

  const [{ data: nv }, { data: lines }] = await Promise.all([
    dx.id_nguoi_de_xuat ? db.from('nhan_vien').select('ho_ten, ten_goi_khac, phong_ban').eq('id', dx.id_nguoi_de_xuat).maybeSingle() : Promise.resolve({ data: null }),
    db.from('de_xuat_chi_tiet').select('*').eq('id_de_xuat', params.id).order('id'),
  ])
  const vtIds = Array.from(new Set((lines ?? []).map((l: any) => l.id_vat_tu).filter(Boolean)))
  const tbIds = Array.from(new Set((lines ?? []).map((l: any) => l.id_thiet_bi).filter(Boolean)))
  const [{ data: vt }, { data: tb }] = await Promise.all([
    vtIds.length ? db.from('vat_tu').select('id, ten_vat_tu, dvt').in('id', vtIds) : Promise.resolve({ data: [] as any[] }),
    tbIds.length ? db.from('thiet_bi').select('id, ten_thiet_bi').in('id', tbIds) : Promise.resolve({ data: [] as any[] }),
  ])
  const vtMap = new Map((vt ?? []).map((x: any) => [x.id, x])), tbMap = new Map((tb ?? []).map((x: any) => [x.id, x]))
  // old rows keep the supplier as a code (NCC0001): print the supplier's name
  const nccIds = Array.from(new Set((lines ?? []).map((l: any) => String(l.nha_cung_cap ?? '').trim()).filter((x: string) => /^NCC\d+$/.test(x))))
  const { data: ncc } = nccIds.length ? await db.from('nha_cung_cap').select('id, ten_nha_cung_cap').in('id', nccIds) : { data: [] as any[] }
  const nccMap = new Map((ncc ?? []).map((x: any) => [x.id as string, x.ten_nha_cung_cap as string]))

  const { count: auditCount } = await db.from('audit_logs').select('id', { count: 'exact', head: true })
    .eq('table_name', 'de_xuat').eq('record_id', params.id).eq('action', 'in_phieu')
  const { data: lastPrint } = await db.from('lich_su_in').select('lan_in').eq('id_de_xuat', params.id).order('lan_in', { ascending: false }).limit(1)
  const count = Math.max(lastPrint?.[0]?.lan_in ?? 0, auditCount ?? 0)
  await db.from('lich_su_in').insert({ id_de_xuat: params.id, loai_de_xuat: PROPOSAL_KINDS[dx.loai_de_xuat] ?? dx.loai_de_xuat, nguoi_in: g.auth.name, lan_in: count + 1 })
  await audit(g.auth, 'de_xuat', params.id, 'in_phieu', { by: g.auth.name })

  return ok({
    data: {
      code: dx.id, kind: dx.loai_de_xuat, date: dx.ngay_de_xuat,
      requester: nv?.ho_ten || nv?.ten_goi_khac || dx.id_nguoi_de_xuat || 'Chưa xác định',
      department: nv?.phong_ban || 'Chưa xác định',
      content: dx.noi_dung || dx.muc_dich_ly_do || '', reason: dx.muc_dich_ly_do || '', note: dx.ghi_chu || '',
      status: dx.trang_thai, printedBefore: count ?? 0,
      lines: (lines ?? []).map((l: any) => ({
        name: l.ten || vtMap.get(l.id_vat_tu)?.ten_vat_tu || tbMap.get(l.id_thiet_bi)?.ten_thiet_bi || l.id_vat_tu || l.id_thiet_bi || dx.noi_dung || '',
        unit: l.dvt || vtMap.get(l.id_vat_tu)?.dvt || '', qty: l.so_luong, price: l.don_gia, amount: l.thanh_tien,
        supplier: nccMap.get(String(l.nha_cung_cap ?? '').trim()) ?? l.nha_cung_cap ?? '', reason: l.muc_dich_ly_do || '', note: l.ghi_chu || '', extra: l.extra ?? {},
      })),
    },
  })
}
