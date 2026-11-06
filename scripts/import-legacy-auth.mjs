// Carry V191 logins over: sets users.ten_dang_nhap and stores the old PBKDF2 hash (legacy_auth)
// so each person can sign in with their OLD password once; it is then moved to Supabase Auth.
//   node scripts/import-legacy-auth.mjs path/to/PHI_LONG.xlsx
import ExcelJS from 'exceljs'
import { createClient } from '@supabase/supabase-js'
const { NEXT_PUBLIC_SUPABASE_URL: url, SUPABASE_SERVICE_ROLE_KEY: key } = process.env
const file = process.argv.find((a) => a.endsWith('.xlsx'))
if (!file || !url || !key) { console.error('Thiếu file .xlsx hoặc biến môi trường Supabase'); process.exit(1) }
const db = createClient(url, key, { auth: { persistSession: false } })
const wb = new ExcelJS.Workbook(); await wb.xlsx.readFile(file)
const ws = wb.getWorksheet('NGUOI_SU_DUNG')
const head = []; ws.getRow(1).eachCell((c, i) => (head[i] = String(c.value)))
const val = (r, n) => { const v = r.getCell(head.indexOf(n)).value; return v && typeof v === 'object' ? String(v.text ?? v.result ?? '') : v == null ? '' : String(v) }
const { data: users } = await db.from('users').select('id,email')
const out = []
ws.eachRow((r, i) => { if (i > 1) out.push({ login: val(r, 'EMAIL_DANG_NHAP').trim().toLowerCase(), salt: val(r, 'AUTH_SALT'), iter: Number(val(r, 'AUTH_ITER')) || 100000, hash: val(r, 'AUTH_HASH') }) })
for (const o of out) {
  const email = o.login.includes('@') ? o.login : `${o.login}@philong.com.vn`
  const u = users.find((x) => x.email === email)
  if (!u) { console.log('không có tài khoản', email); continue }
  if (!o.login.includes('@')) await db.from('users').update({ ten_dang_nhap: o.login }).eq('id', u.id)
  else await db.from('users').update({ ten_dang_nhap: o.login.split('@')[0] }).eq('id', u.id)
  if (o.salt && o.hash) { const { error } = await db.from('legacy_auth').upsert({ user_id: u.id, salt: o.salt, iter: o.iter, hash: o.hash }); console.log(o.login, error?.message ?? 'OK') }
}
