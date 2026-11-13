import 'server-only'
import zlib from 'node:zlib'
import { supabaseAdmin } from '@/lib/supabase/admin'

/** Parents first, so a restore satisfies foreign keys. `users` is saved for reference only (it is tied to Supabase Auth). */
export const BACKUP_TABLES = [
  'vai_tro', 'phan_quyen', 'users', 'nhan_vien', 'nha_thau', 'nha_cung_cap', 'khu_vuc', 'hang_muc_bao_tri', 'chi_tiet_van_hanh',
  'lich_bao_tri', 'nhat_ky_bao_tri', 'cong_viec', 'cong_viec_hang_ngay', 'khach_ra_vao', 'vat_tu', 'nhap_xuat_kho', 'thiet_bi',
  'thu_hoi', 'lich_su_chuyen_thiet_bi', 'de_xuat', 'de_xuat_chi_tiet', 'toa_nha', 'tang', 'khach_thue', 'thue_mat_bang', 'khach_hang_tiem_nang',
  'tien_dien', 'thanh_toan_dien', 'danh_muc', 'lich_su_in', 'lich_su_dang_nhap', 'cau_hinh_email_canh_bao', 'nhat_ky_email_canh_bao',
  'data_audit_archive', 'hinh_anh_tien_do', 'tep_dinh_kem', 'cau_hinh_he_thong', 'tin_nhan', 'audit_logs',
]
const NO_RESTORE = new Set(['users'])
/** tables whose key column is not `id` */
export const KEY_OF: Record<string, string> = { cau_hinh_he_thong: 'khoa' }
export const KEEP_BACKUPS = 30

async function fetchAll(table: string) {
  const db = supabaseAdmin(), rows: any[] = []
  for (let from = 0; ; from += 1000) {
    const { data, error } = await db.from(table).select('*').range(from, from + 999)
    if (error) throw new Error(`${table}: ${error.message}`)
    rows.push(...(data ?? []))
    if (!data || data.length < 1000) break
  }
  return rows
}

export async function createBackup(by: string, kind: string, note: string | null) {
  const tables: Record<string, any[]> = {}
  await Promise.all(BACKUP_TABLES.map(async (t) => { tables[t] = await fetchAll(t) }))
  const chiTiet: Record<string, number> = {}
  let total = 0
  for (const t of BACKUP_TABLES) { chiTiet[t] = tables[t].length; total += tables[t].length }
  const gz = zlib.gzipSync(Buffer.from(JSON.stringify({ version: 1, created: new Date().toISOString(), tables })))
  const db = supabaseAdmin()
  const { data, error } = await db.from('sao_luu').insert({
    nguoi_tao: by, loai: kind, ghi_chu: note, so_bang: BACKUP_TABLES.length, so_dong: total, kich_thuoc: gz.length,
    chi_tiet: chiTiet, du_lieu: gz.toString('base64'),
  }).select('id, thoi_gian, so_dong, kich_thuoc').single()
  if (error) throw new Error(error.message)
  // keep only the newest backups
  const { data: old } = await db.from('sao_luu').select('id').order('thoi_gian', { ascending: false }).range(KEEP_BACKUPS, KEEP_BACKUPS + 200)
  if (old?.length) await db.from('sao_luu').delete().in('id', old.map((o) => o.id))
  return data
}

export async function loadBackup(id: string) {
  const { data, error } = await supabaseAdmin().from('sao_luu').select('du_lieu, thoi_gian').eq('id', id).maybeSingle()
  if (error || !data) return null
  return { gz: Buffer.from(data.du_lieu, 'base64'), thoi_gian: data.thoi_gian as string }
}

/** Non-destructive restore: puts the saved rows back (insert or overwrite by id). Rows created after the backup are kept. */
export async function restoreBackup(id: string, only?: string[]) {
  const b = await loadBackup(id)
  if (!b) throw new Error('Không tìm thấy bản sao lưu')
  const snap = JSON.parse(zlib.gunzipSync(b.gz).toString('utf8')) as { tables: Record<string, any[]> }
  const db = supabaseAdmin(), report: Record<string, number> = {}
  for (const t of BACKUP_TABLES) {
    if (NO_RESTORE.has(t) || (only?.length && !only.includes(t))) continue
    const rows = snap.tables[t] ?? []
    if (!rows.length) continue
    const { data: cols } = await db.rpc('import_table_columns', { p_table: t })
    const skip = new Set((cols ?? []).filter((c: any) => c.is_generated).map((c: any) => c.column_name))
    const clean = skip.size ? rows.map((r) => Object.fromEntries(Object.entries(r).filter(([k]) => !skip.has(k)))) : rows
    for (let i = 0; i < clean.length; i += 500) {
      const { error } = await db.from(t).upsert(clean.slice(i, i + 500), { onConflict: KEY_OF[t] ?? 'id' })
      if (error) throw new Error(`${t}: ${error.message}`)
    }
    report[t] = rows.length
  }
  await db.rpc('sync_id_sequences')
  return report
}
