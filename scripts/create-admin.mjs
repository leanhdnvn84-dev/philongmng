// Usage: npm run create-admin   (reads ADMIN_EMAIL / ADMIN_PASSWORD from .env.local)
import { createClient } from '@supabase/supabase-js'

const { NEXT_PUBLIC_SUPABASE_URL: url, SUPABASE_SERVICE_ROLE_KEY: key, ADMIN_EMAIL: email, ADMIN_PASSWORD: password } = process.env
if (!url || !key || !email || !password) {
  console.error('Thiếu NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, ADMIN_EMAIL hoặc ADMIN_PASSWORD')
  process.exit(1)
}
if (password.length < 8) { console.error('ADMIN_PASSWORD tối thiểu 8 ký tự'); process.exit(1) }

const admin = createClient(url, key, { auth: { persistSession: false } })

const { data: role, error: roleErr } = await admin.from('roles').select('id').eq('name', 'admin').single()
if (roleErr) { console.error('Chưa chạy schema.sql / 002_complete.sql?', roleErr.message); process.exit(1) }

let userId
const created = await admin.auth.admin.createUser({ email, password, email_confirm: true })
if (created.error) {
  if (!/already|registered/i.test(created.error.message)) { console.error(created.error.message); process.exit(1) }
  const list = await admin.auth.admin.listUsers({ perPage: 1000 })
  userId = list.data.users.find((u) => u.email === email)?.id
  if (!userId) { console.error('Không tìm thấy user hiện có'); process.exit(1) }
  await admin.auth.admin.updateUserById(userId, { password })
} else {
  userId = created.data.user.id
}

const { error } = await admin.from('users').upsert(
  { id: userId, email, full_name: 'Quản trị viên', role_id: role.id, status: 'active' },
  { onConflict: 'id' }
)
if (error) { console.error(error.message); process.exit(1) }
console.log(`OK: ${email} là admin. Hãy đổi mật khẩu sau khi đăng nhập.`)
