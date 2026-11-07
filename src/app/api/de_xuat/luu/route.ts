import { NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { guard, ok, fail } from '@/lib/http'
import { PROPOSAL_KINDS } from '@/lib/resources'
import { audit } from '@/lib/crud'

export const dynamic = 'force-dynamic'
const ID = /^[A-Za-z0-9_.-]{1,64}$/
const DATE = /^\d{4}-\d{2}-\d{2}$/
const txt = (v: unknown, n: number) => String(v ?? '').replace(/\s+/g, ' ').trim().slice(0, n)

/** Create or update a proposal together with all its lines in one request (the "Thêm / Sửa đề xuất" popup). */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)
  if (!body || typeof body !== 'object') return fail('Dữ liệu không hợp lệ')
  const editId = body.id ? String(body.id) : null
  const g = await guard('de_xuat', editId ? 'edit' : 'create')
  if (g instanceof Response) return g
  const { auth } = g
  const db = supabaseAdmin()

  const kind = String(body.loai_de_xuat ?? ''); if (!PROPOSAL_KINDS[kind]) return fail('Loại đề xuất không hợp lệ')
  const who = String(body.id_nguoi_de_xuat ?? ''); if (!ID.test(who)) return fail('Chọn người đề xuất')
  const { data: nv } = await db.from('nhan_vien').select('id').eq('id', who).maybeSingle(); if (!nv) return fail('Người đề xuất không tồn tại')
  const ngay = body.ngay_de_xuat ? String(body.ngay_de_xuat) : null; if (ngay && !DATE.test(ngay)) return fail('Ngày lập không đúng định dạng')
  const raw = Array.isArray(body.lines) ? body.lines.slice(0, 100) : []
  if (!raw.length) return fail('Thêm ít nhất một dòng')

  let existing: any = null
  if (editId) {
    if (!ID.test(editId)) return fail('Mã không hợp lệ')
    const { data } = await db.from('de_xuat').select('id, trang_thai, loai_de_xuat').eq('id', editId).maybeSingle()
    existing = data; if (!existing) return fail('Không tìm thấy đề xuất', 404)
    if (existing.trang_thai === 'Đã duyệt') return fail('Đề xuất đã duyệt, không thể sửa')
  }

  // resolve catalogue names / units
  const vtIds = [...new Set(raw.map((l: any) => String(l.id_vat_tu ?? '')).filter(Boolean))], tbIds = [...new Set(raw.map((l: any) => String(l.id_thiet_bi ?? '')).filter(Boolean))]
  const [vt, tb] = await Promise.all([
    vtIds.length ? db.from('vat_tu').select('id, ten_vat_tu, dvt').in('id', vtIds) : Promise.resolve({ data: [] as any[] }),
    tbIds.length ? db.from('thiet_bi').select('id, ten_thiet_bi').in('id', tbIds) : Promise.resolve({ data: [] as any[] }),
  ])
  const vtMap = new Map((vt.data ?? []).map((x: any) => [x.id, x])), tbMap = new Map((tb.data ?? []).map((x: any) => [x.id, x]))
  const lines: any[] = []
  for (let i = 0; i < raw.length; i++) {
    const l = raw[i], n = i + 1
    const qty = Number(l.so_luong), price = Number(l.don_gia ?? 0)
    if (!Number.isFinite(qty) || qty <= 0) return fail(`Dòng ${n}: số lượng phải lớn hơn 0`)
    if (!Number.isFinite(price) || price < 0) return fail(`Dòng ${n}: đơn giá không hợp lệ`)
    const idVt = l.id_vat_tu ? String(l.id_vat_tu) : null, idTb = l.id_thiet_bi ? String(l.id_thiet_bi) : null
    if (idVt && !vtMap.has(idVt)) return fail(`Dòng ${n}: vật tư không có trong kho`)
    if (idTb && !tbMap.has(idTb)) return fail(`Dòng ${n}: thiết bị không tồn tại`)
    if (kind === 'MUA_VAT_TU' && !idVt) return fail(`Dòng ${n}: chọn vật tư trong danh mục kho`)
    const name = txt(l.ten, 200) || (idVt ? vtMap.get(idVt).ten_vat_tu : idTb ? tbMap.get(idTb).ten_thiet_bi : '')
    if (!name) return fail(`Dòng ${n}: nhập tên ${kind === 'MUA_VAT_TU' ? 'vật tư' : 'thiết bị'}`)
    lines.push({ id_vat_tu: idVt, id_thiet_bi: idTb, ten: name, dvt: txt(l.dvt, 30) || (idVt ? vtMap.get(idVt).dvt : null), so_luong: qty, don_gia: price, nha_cung_cap: txt(l.nha_cung_cap, 150) || null, ghi_chu: txt(l.ghi_chu, 300) || null })
  }
  const head = {
    loai_de_xuat: kind, id_nguoi_de_xuat: who, ngay_de_xuat: ngay ?? undefined,
    noi_dung: lines.map((l) => l.ten).join(', ').slice(0, 500), muc_dich_ly_do: txt(body.muc_dich_ly_do, 1000) || null, ghi_chu: txt(body.ghi_chu, 1000) || null,
  }
  if (!head.ngay_de_xuat) delete (head as any).ngay_de_xuat

  let id = editId
  if (!editId) {
    const { data, error } = await db.from('de_xuat').insert(head).select('id').single()
    if (error) return fail('Không tạo được đề xuất', 500)
    id = data.id
  } else {
    const { error } = await db.from('de_xuat').update({ ...head, updated_at: new Date().toISOString() }).eq('id', editId)
    if (error) return fail('Không lưu được đề xuất', 500)
  }
  // new lines first, then drop the old ones, so a failure never leaves the proposal without lines
  const { data: oldLines } = editId ? await db.from('de_xuat_chi_tiet').select('id').eq('id_de_xuat', id!) : { data: [] as any[] }
  const { error: le } = await db.from('de_xuat_chi_tiet').insert(lines.map((l) => ({ ...l, id_de_xuat: id })))
  if (le) {
    if (!editId) await db.from('de_xuat').delete().eq('id', id!)
    console.error('[de_xuat/luu]', le)
    return fail('Không lưu được các dòng vật tư: ' + (le.code === '23514' ? 'số lượng / đơn giá không hợp lệ' : 'lỗi cơ sở dữ liệu'), 500)
  }
  if (oldLines?.length) await db.from('de_xuat_chi_tiet').delete().in('id', oldLines.map((o: any) => o.id))
  await audit(auth, 'de_xuat', id, editId ? 'update' : 'create', { lines: lines.length, loai: kind })
  return ok({ data: { id } })
}
