// Carry V191's CHATNOIBO messages over: node scripts/import-chat.mjs path/to/PHI_LONG.xlsx
import ExcelJS from 'exceljs'
import { createClient } from '@supabase/supabase-js'
const { NEXT_PUBLIC_SUPABASE_URL: url, SUPABASE_SERVICE_ROLE_KEY: key } = process.env
const file = process.argv.find((a) => a.endsWith('.xlsx'))
if (!file || !url || !key) { console.error('Thiếu file .xlsx hoặc biến môi trường Supabase'); process.exit(1) }
const db = createClient(url, key, { auth: { persistSession: false } })
const wb = new ExcelJS.Workbook(); await wb.xlsx.readFile(file)
const ws = wb.getWorksheet('CHATNOIBO'); if (!ws) { console.log('Không có sheet CHATNOIBO'); process.exit(0) }
const head = []; ws.getRow(1).eachCell((c, i) => (head[i] = String(c.value)))
const val = (r, n) => { const v = r.getCell(head.indexOf(n)).value; return v && typeof v === 'object' && !(v instanceof Date) ? String(v.text ?? v.result ?? '') : v }
const rows = []
ws.eachRow((r, i) => {
  if (i === 1) return
  const t = val(r, 'NGAY_GIO'), text = String(val(r, 'NOI_DUNG') ?? '').trim()
  if (!text) return
  rows.push({ id: String(val(r, 'ID')), thoi_gian: (t instanceof Date ? t : new Date(t)).toISOString(), id_nguoi_gui: String(val(r, 'ID_NGUOI_GUI')), id_nguoi_nhan: String(val(r, 'ID_NGUOI_NHAN')), noi_dung: text.slice(0, 2000) })
})
const { error } = await db.from('tin_nhan').upsert(rows, { onConflict: 'id' })
console.log(error ? error.message : `Đã nhập ${rows.length} tin nhắn`)
