// Usage: npm run create-admin   (reads ADMIN_EMAIL / ADMIN_PASSWORD from .env.local)
import { createClient } from '@supabase/supabase-js'

const { NEXT_PUBLIC_SUPABASE_URL: url, SUPABASE_SERVICE_ROLE_KEY: key, ADMIN_EMAIL: email, ADMIN_PASSWORD: password } = process.env
if (!url || !key || !email || !password) {
  console.error('Thiếu NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, ADMIN_EMAIL hoặc ADMIN_PASSWORD'); process.exit(1)
}
if (password.length < 8) { console.error('ADMIN_PASSWORD tối thiểu 8 ký tự'); process.exit(1) }
const db = createClient(url, key, { auth: { persistSession: false } })

const { data: role, error: roleErr } = await db.from('vai_tro').select('id').eq('sieu_quan_tri', true).order('id').limit(1).maybeSingle()
if (roleErr || !role) { console.error('Chưa có vai trò Super Admin. Đã chạy src/db/schema.sql chưa?', roleErr?.message ?? ''); process.exit(1) }

let userId
const created = await db.auth.admin.createUser({ email, password, email_confirm: true })
if (created.error) {
  if (!/already|registered|exists/i.test(created.error.message)) { console.error(created.error.message); process.exit(1) }
  const list = await db.auth.admin.listUsers({ perPage: 1000 })
  userId = list.data.users.find((u) => u.email === email)?.id
  if (!userId) { console.error('Không tìm thấy tài khoản hiện có'); process.exit(1) }
  await db.auth.admin.updateUserById(userId, { password })
} else userId = created.data.user.id

const { error } = await db.from('users').upsert({ id: userId, email, ho_ten: 'Quản trị viên', id_vai_tro: role.id, trang_thai: 'Hoạt động' }, { onConflict: 'id' })
if (error) { console.error(error.message); process.exit(1) }
console.log(`OK: ${email} có vai trò ${role.id} (Super Admin). Hãy đổi mật khẩu sau khi đăng nhập.`)
