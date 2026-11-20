import 'server-only'
import { r2Configured, r2Delete, r2List, r2Put, type R2Object } from '@/lib/r2'

/** Backups copied to R2: sao-luu/<YYYY-MM-DD (giờ VN)>/<file>. The newest KEEP of each kind are kept. */
export const R2_BACKUP_PREFIX = 'sao-luu/'
export const R2_KEEP = 30
const KINDS = ['.json.gz', '.xlsx'] as const

const dayVN = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Ho_Chi_Minh', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date())
const newestFirst = (a: R2Object, b: R2Object) => (b.lastModified || '').localeCompare(a.lastModified || '') || b.key.localeCompare(a.key)

export type R2Copy = { ok: true; key: string } | { ok: false; error: string }

/** Copies one backup file to R2 and trims old copies. Never throws: R2 must not break the main backup. */
export async function copyBackupToR2(name: string, bytes: Uint8Array, type: string): Promise<R2Copy | null> {
  if (!r2Configured()) return null
  try {
    const key = `${R2_BACKUP_PREFIX}${dayVN()}/${name}`
    await r2Put(key, bytes, type)
    try {
      const kind = KINDS.find((k) => name.endsWith(k))
      if (kind) {
        const old = (await r2List(R2_BACKUP_PREFIX)).filter((o) => o.key.endsWith(kind)).sort(newestFirst).slice(R2_KEEP)
        for (const o of old) await r2Delete(o.key)
      }
    } catch (e) { console.error('[r2 prune]', e) }
    return { ok: true, key }
  } catch (e: any) {
    console.error('[r2 backup]', e)
    return { ok: false, error: String(e?.message ?? e).slice(0, 150) }
  }
}

export type R2Status =
  | { bat: false }
  | { bat: true; loi?: string; soBan?: number; soV27?: number; dungLuong?: number; moiNhat?: R2Object | null; v27MoiNhat?: R2Object | null }

/** What the "Bảo trì dữ liệu & sao lưu" page shows about R2. */
export async function r2BackupStatus(): Promise<R2Status> {
  if (!r2Configured()) return { bat: false }
  try {
    const all = (await r2List(R2_BACKUP_PREFIX)).sort(newestFirst)
    const gz = all.filter((o) => o.key.endsWith('.json.gz')), xl = all.filter((o) => o.key.endsWith('.xlsx'))
    return { bat: true, soBan: gz.length, soV27: xl.length, dungLuong: all.reduce((s, o) => s + o.size, 0), moiNhat: gz[0] ?? null, v27MoiNhat: xl[0] ?? null }
  } catch (e: any) {
    return { bat: true, loi: String(e?.message ?? e).slice(0, 150) }
  }
}
