// Phi Long Building - quản lý tòa nhà. Zero dependency: Node >= 22.13 (node:sqlite).
import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { DatabaseSync } from 'node:sqlite'
import { fileURLToPath } from 'node:url'

const ROOT = path.dirname(fileURLToPath(import.meta.url))
const PORT = Number(process.env.PORT) || 3000
const DB_FILE = process.env.DB_FILE || path.join(ROOT, 'data', 'app.db')
fs.mkdirSync(path.dirname(DB_FILE), { recursive: true })
const db = new DatabaseSync(DB_FILE)
db.exec('PRAGMA foreign_keys = ON; PRAGMA journal_mode = WAL;')

db.exec(`
CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, username TEXT NOT NULL UNIQUE, password_hash TEXT NOT NULL,
  full_name TEXT NOT NULL, role TEXT NOT NULL DEFAULT 'staff' CHECK (role IN ('admin','staff')), active INTEGER NOT NULL DEFAULT 1);
CREATE TABLE IF NOT EXISTS sessions (token_hash TEXT PRIMARY KEY, user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE, expires_at INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS buildings (id INTEGER PRIMARY KEY, name TEXT NOT NULL, address TEXT NOT NULL, floors INTEGER);
CREATE TABLE IF NOT EXISTS rooms (id INTEGER PRIMARY KEY, building_id INTEGER NOT NULL REFERENCES buildings(id), room_no TEXT NOT NULL,
  floor INTEGER, area REAL, price REAL NOT NULL DEFAULT 0, status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available','occupied','maintenance')),
  UNIQUE(building_id, room_no));
CREATE TABLE IF NOT EXISTS tenants (id INTEGER PRIMARY KEY, name TEXT NOT NULL, phone TEXT, email TEXT, id_number TEXT, note TEXT);
CREATE TABLE IF NOT EXISTS contracts (id INTEGER PRIMARY KEY, tenant_id INTEGER NOT NULL REFERENCES tenants(id), room_id INTEGER NOT NULL REFERENCES rooms(id),
  start_date TEXT NOT NULL, end_date TEXT NOT NULL, monthly_fee REAL NOT NULL CHECK (monthly_fee >= 0), deposit REAL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','expired','terminated')), CHECK (end_date > start_date));
CREATE UNIQUE INDEX IF NOT EXISTS uq_one_active_contract ON contracts(room_id) WHERE status = 'active';
CREATE TABLE IF NOT EXISTS invoices (id INTEGER PRIMARY KEY, contract_id INTEGER NOT NULL REFERENCES contracts(id), period TEXT NOT NULL,
  amount REAL NOT NULL CHECK (amount >= 0), paid_amount REAL NOT NULL DEFAULT 0, due_date TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'unpaid' CHECK (status IN ('unpaid','partial','paid')), UNIQUE(contract_id, period));
CREATE TABLE IF NOT EXISTS maintenance (id INTEGER PRIMARY KEY, room_id INTEGER REFERENCES rooms(id), title TEXT NOT NULL, description TEXT,
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low','medium','high')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','in_progress','completed')), cost REAL DEFAULT 0, created_at TEXT DEFAULT CURRENT_TIMESTAMP, completed_at TEXT);
CREATE TABLE IF NOT EXISTS equipment (id INTEGER PRIMARY KEY, name TEXT NOT NULL, category TEXT, quantity INTEGER NOT NULL DEFAULT 1, location TEXT,
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available','in_use','damaged')));
CREATE TABLE IF NOT EXISTS audit (id INTEGER PRIMARY KEY, at TEXT DEFAULT CURRENT_TIMESTAMP, user_id INTEGER, entity TEXT, record_id INTEGER, action TEXT, data TEXT);
`)

// ---------- entity config (drives API + UI) ----------
const o = (...p) => p.map(([v, l]) => [v, l])
const ACTIVE = o(['active', 'Hiệu lực'], ['expired', 'Hết hạn'], ['terminated', 'Đã chấm dứt'])
const ENT = {
  buildings: { title: 'Tòa nhà', icon: '🏢', search: ['name', 'address'], order: 'name', label: 'name', fields: [
    { n: 'name', l: 'Tên tòa nhà', t: 'text', req: 1 }, { n: 'address', l: 'Địa chỉ', t: 'text', req: 1 }, { n: 'floors', l: 'Số tầng', t: 'number' }] },
  rooms: { title: 'Phòng', icon: '🚪', search: ['room_no'], order: 'room_no', label: `(SELECT name FROM buildings b WHERE b.id=building_id)||' / P.'||room_no`, fields: [
    { n: 'building_id', l: 'Tòa nhà', t: 'ref', ref: 'buildings', req: 1 }, { n: 'room_no', l: 'Số phòng', t: 'text', req: 1 },
    { n: 'floor', l: 'Tầng', t: 'number' }, { n: 'area', l: 'Diện tích (m²)', t: 'number' }, { n: 'price', l: 'Giá thuê (VND/tháng)', t: 'money', req: 1 },
    { n: 'status', l: 'Trạng thái', t: 'select', opts: o(['available', 'Trống'], ['occupied', 'Đang thuê'], ['maintenance', 'Bảo trì']), def: 'available' }] },
  tenants: { title: 'Khách thuê', icon: '👥', search: ['name', 'phone', 'email', 'id_number'], order: 'name', label: 'name', fields: [
    { n: 'name', l: 'Họ tên / Công ty', t: 'text', req: 1 }, { n: 'phone', l: 'Điện thoại', t: 'text' }, { n: 'email', l: 'Email', t: 'text' },
    { n: 'id_number', l: 'CCCD / MST', t: 'text' }, { n: 'note', l: 'Ghi chú', t: 'textarea', nolist: 1 }] },
  contracts: { title: 'Hợp đồng', icon: '📋', search: [], order: 'end_date', label: `'HĐ#'||id||' '||(SELECT name FROM tenants t WHERE t.id=tenant_id)`, fields: [
    { n: 'tenant_id', l: 'Khách thuê', t: 'ref', ref: 'tenants', req: 1 }, { n: 'room_id', l: 'Phòng', t: 'ref', ref: 'rooms', req: 1 },
    { n: 'start_date', l: 'Bắt đầu', t: 'date', req: 1 }, { n: 'end_date', l: 'Kết thúc', t: 'date', req: 1 },
    { n: 'monthly_fee', l: 'Phí thuê / tháng', t: 'money', req: 1 }, { n: 'deposit', l: 'Tiền cọc', t: 'money' },
    { n: 'status', l: 'Trạng thái', t: 'select', opts: ACTIVE, def: 'active' }] },
  invoices: { title: 'Hóa đơn', icon: '💰', search: ['period'], order: 'due_date DESC', label: `'HĐơn '||period`, actions: ['pay'], fields: [
    { n: 'contract_id', l: 'Hợp đồng', t: 'ref', ref: 'contracts', req: 1 }, { n: 'period', l: 'Kỳ (YYYY-MM)', t: 'month', req: 1 },
    { n: 'amount', l: 'Số tiền', t: 'money', req: 1 }, { n: 'due_date', l: 'Hạn thanh toán', t: 'date', req: 1 },
    { n: 'paid_amount', l: 'Đã thu', t: 'money', ro: 1 },
    { n: 'status', l: 'Trạng thái', t: 'select', opts: o(['unpaid', 'Chưa thu'], ['partial', 'Thu một phần'], ['paid', 'Đã thu đủ']), ro: 1 }] },
  maintenance: { title: 'Bảo trì', icon: '🔧', search: ['title', 'description'], order: 'created_at DESC', label: 'title', fields: [
    { n: 'title', l: 'Tiêu đề', t: 'text', req: 1 }, { n: 'room_id', l: 'Phòng', t: 'ref', ref: 'rooms' },
    { n: 'priority', l: 'Ưu tiên', t: 'select', opts: o(['low', 'Thấp'], ['medium', 'Trung bình'], ['high', 'Cao']), def: 'medium' },
    { n: 'status', l: 'Trạng thái', t: 'select', opts: o(['pending', 'Chờ xử lý'], ['in_progress', 'Đang làm'], ['completed', 'Hoàn thành']), def: 'pending' },
    { n: 'cost', l: 'Chi phí', t: 'money' }, { n: 'description', l: 'Mô tả', t: 'textarea', nolist: 1 }] },
  equipment: { title: 'Thiết bị', icon: '⚙️', search: ['name', 'category', 'location'], order: 'name', label: 'name', fields: [
    { n: 'name', l: 'Tên thiết bị', t: 'text', req: 1 }, { n: 'category', l: 'Nhóm', t: 'text' }, { n: 'quantity', l: 'Số lượng', t: 'number', def: 1 },
    { n: 'location', l: 'Vị trí', t: 'text' }, { n: 'status', l: 'Trạng thái', t: 'select', opts: o(['available', 'Sẵn sàng'], ['in_use', 'Đang dùng'], ['damaged', 'Hỏng']), def: 'available' }] },
  users: { title: 'Người dùng', icon: '👤', search: ['username', 'full_name'], order: 'username', label: 'full_name', adminOnly: 1, fields: [
    { n: 'username', l: 'Tên đăng nhập', t: 'text', req: 1 }, { n: 'full_name', l: 'Họ tên', t: 'text', req: 1 },
    { n: 'role', l: 'Vai trò', t: 'select', opts: o(['staff', 'Nhân viên'], ['admin', 'Quản trị']), def: 'staff' },
    { n: 'active', l: 'Hoạt động', t: 'select', opts: o(['1', 'Có'], ['0', 'Khóa']), def: '1' },
    { n: 'password', l: 'Mật khẩu (tối thiểu 8 ký tự)', t: 'password', nolist: 1 }] },
}

// ---------- helpers ----------
const today = () => new Date().toISOString().slice(0, 10)
const hashToken = (t) => crypto.createHash('sha256').update(t).digest('hex')
function hashPw(pw) { const s = crypto.randomBytes(16); return s.toString('hex') + ':' + crypto.scryptSync(pw, s, 64).toString('hex') }
function checkPw(pw, stored) {
  const [s, h] = stored.split(':'); const x = crypto.scryptSync(pw, Buffer.from(s, 'hex'), 64)
  return crypto.timingSafeEqual(x, Buffer.from(h, 'hex'))
}
class HttpError extends Error { constructor(code, msg) { super(msg); this.code = code } }
const bad = (m, c = 400) => { throw new HttpError(c, m) }
const audit = (u, entity, id, action, data) =>
  db.prepare('INSERT INTO audit (user_id,entity,record_id,action,data) VALUES (?,?,?,?,?)').run(u?.id ?? null, entity, id ?? null, action, data ? JSON.stringify(data).slice(0, 4000) : null)

function syncRoom(roomId) {
  if (!roomId) return
  const r = db.prepare('SELECT status FROM rooms WHERE id=?').get(roomId)
  if (!r || r.status === 'maintenance') return
  const n = db.prepare("SELECT COUNT(*) c FROM contracts WHERE room_id=? AND status='active'").get(roomId).c
  db.prepare('UPDATE rooms SET status=? WHERE id=?').run(n ? 'occupied' : 'available', roomId)
}
function expireContracts() {
  const rows = db.prepare("SELECT id, room_id FROM contracts WHERE status='active' AND end_date < ?").all(today())
  for (const c of rows) { db.prepare("UPDATE contracts SET status='expired' WHERE id=?").run(c.id); syncRoom(c.room_id) }
}
function invoiceStatus(amount, paid) { return paid >= amount && amount > 0 ? 'paid' : paid > 0 ? 'partial' : 'unpaid' }

// clean + validate a payload against the entity's fields
function clean(name, body, creating) {
  const out = {}
  for (const f of ENT[name].fields) {
    if (f.t === 'password') continue // handled by savePassword
    if (f.ro || !(f.n in body)) { if (creating && f.req && f.def === undefined && !f.ro) bad(`${f.l} là bắt buộc`); continue }
    let v = body[f.n]
    if (v === '' || v === undefined) v = null
    if (v === null) { if (f.req) bad(`${f.l} là bắt buộc`); out[f.n] = null; continue }
    if (['number', 'money', 'ref'].includes(f.t)) { v = Number(v); if (!Number.isFinite(v)) bad(`${f.l} phải là số`); if (f.t === 'money' && v < 0) bad(`${f.l} không được âm`) }
    else if (f.t === 'select') { v = String(v); if (!f.opts.some(([x]) => x === v)) bad(`${f.l} không hợp lệ`) }
    else if (f.t === 'date') { if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) bad(`${f.l} sai định dạng`) }
    else if (f.t === 'month') { if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(v)) bad(`${f.l} phải dạng YYYY-MM`) }
    else v = String(v).slice(0, 2000)
    out[f.n] = v
  }
  if (creating) for (const f of ENT[name].fields) if (out[f.n] === undefined && f.def !== undefined) out[f.n] = f.def
  return out
}

function rules(name, d, existing, user) {
  if (name === 'contracts') {
    const m = { ...existing, ...d }
    if (m.status === 'active') {
      const c = db.prepare("SELECT id FROM contracts WHERE room_id=? AND status='active' AND id IS NOT ?").get(m.room_id, existing?.id ?? null)
      if (c) bad('Phòng này đã có hợp đồng đang hiệu lực', 409)
    }
  }
  if (name === 'maintenance' && d.status) d.completed_at = d.status === 'completed' ? (existing?.completed_at || new Date().toISOString()) : null
  if (name === 'users') {
    if (d.username && !/^[a-zA-Z0-9_.@-]{3,40}$/.test(d.username)) bad('Tên đăng nhập 3-40 ký tự (chữ, số, _ . @ -)')
    if (d.active !== undefined) d.active = Number(d.active)
    if (existing && existing.id === user.id && (d.active === 0 || (d.role && d.role !== 'admin'))) bad('Không thể tự khóa hoặc hạ quyền chính mình')
  }
}
function savePassword(d, body, creating) {
  const pw = body.password
  if (creating && (!pw || String(pw).length < 8)) bad('Mật khẩu tối thiểu 8 ký tự')
  if (pw) { if (String(pw).length < 8) bad('Mật khẩu tối thiểu 8 ký tự'); d.password_hash = hashPw(String(pw)) }
}

function dbErr(e) {
  if (e instanceof HttpError) throw e
  const m = String(e.message)
  if (/UNIQUE/.test(m)) bad('Dữ liệu bị trùng (đã tồn tại)', 409)
  if (/FOREIGN KEY/.test(m)) bad('Dữ liệu đang được liên kết hoặc tham chiếu không tồn tại', 409)
  if (/CHECK|NOT NULL/.test(m)) bad('Dữ liệu không hợp lệ')
  throw e
}

// ---------- auth ----------
function currentUser(req) {
  const m = /(?:^|; )sid=([a-f0-9]{64})/.exec(req.headers.cookie || '')
  if (!m) return null
  const row = db.prepare(`SELECT u.id, u.username, u.full_name, u.role, u.active FROM sessions s JOIN users u ON u.id=s.user_id
    WHERE s.token_hash=? AND s.expires_at>?`).get(hashToken(m[1]), Date.now())
  return row && row.active ? row : null
}
const attempts = new Map()
function throttle(ip, ok) {
  const now = Date.now(); let a = attempts.get(ip)
  if (!a || now - a.t > 15 * 60e3) a = { n: 0, t: now }
  if (ok === undefined) { if (a.n >= 10) bad('Thử quá nhiều lần, vui lòng đợi 15 phút', 429); return }
  if (ok) attempts.delete(ip); else { a.n++; attempts.set(ip, a) }
}

// ---------- routes ----------
async function readBody(req) {
  let size = 0; const chunks = []
  for await (const c of req) { size += c.length; if (size > 1e6) bad('Dữ liệu quá lớn', 413); chunks.push(c) }
  if (!chunks.length) return {}
  if (!/application\/json/.test(req.headers['content-type'] || '')) bad('Content-Type phải là application/json', 415)
  try { return JSON.parse(Buffer.concat(chunks).toString()) } catch { bad('JSON không hợp lệ') }
}

async function api(req, url, user) {
  const seg = url.pathname.split('/').filter(Boolean).slice(1) // after "api"
  const method = req.method
  const [a, b, c] = seg

  if (a === 'login' && method === 'POST') {
    const ip = req.socket.remoteAddress || '?'; throttle(ip)
    const { username, password } = await readBody(req)
    const u = db.prepare('SELECT * FROM users WHERE username=?').get(String(username || ''))
    const ok = u && u.active && checkPw(String(password || ''), u.password_hash)
    throttle(ip, !!ok)
    if (!ok) bad('Sai tên đăng nhập hoặc mật khẩu', 401)
    const token = crypto.randomBytes(32).toString('hex')
    db.prepare('DELETE FROM sessions WHERE expires_at<?').run(Date.now())
    db.prepare('INSERT INTO sessions VALUES (?,?,?)').run(hashToken(token), u.id, Date.now() + 7 * 864e5)
    return { body: { ok: true }, cookie: `sid=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${7 * 86400}` }
  }
  if (!user) bad('Chưa đăng nhập', 401)
  if (a === 'logout' && method === 'POST') {
    const m = /sid=([a-f0-9]{64})/.exec(req.headers.cookie || ''); if (m) db.prepare('DELETE FROM sessions WHERE token_hash=?').run(hashToken(m[1]))
    return { body: { ok: true }, cookie: 'sid=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0' }
  }
  if (a === 'me') return { body: { user, entities: Object.fromEntries(Object.entries(ENT).filter(([, e]) => !e.adminOnly || user.role === 'admin')) } }

  if (a === 'dashboard') {
    expireContracts()
    const n = (sql, ...p) => db.prepare(sql).get(...p).c
    const rooms = n('SELECT COUNT(*) c FROM rooms'), occ = n("SELECT COUNT(*) c FROM rooms WHERE status='occupied'")
    return { body: {
      buildings: n('SELECT COUNT(*) c FROM buildings'), rooms, occupied: occ, available: n("SELECT COUNT(*) c FROM rooms WHERE status='available'"),
      occupancy: rooms ? Math.round(occ / rooms * 100) : 0, tenants: n('SELECT COUNT(*) c FROM tenants'),
      monthlyRevenue: db.prepare("SELECT COALESCE(SUM(monthly_fee),0) c FROM contracts WHERE status='active'").get().c,
      receivable: db.prepare("SELECT COALESCE(SUM(amount-paid_amount),0) c FROM invoices WHERE status!='paid'").get().c,
      overdue: n("SELECT COUNT(*) c FROM invoices WHERE status!='paid' AND due_date<?", today()),
      openJobs: n("SELECT COUNT(*) c FROM maintenance WHERE status!='completed'"),
      urgentJobs: n("SELECT COUNT(*) c FROM maintenance WHERE status!='completed' AND priority='high'"),
      expiring: db.prepare(`SELECT c.id, c.end_date, t.name tenant, r.room_no room FROM contracts c JOIN tenants t ON t.id=c.tenant_id JOIN rooms r ON r.id=c.room_id
        WHERE c.status='active' AND c.end_date BETWEEN ? AND ? ORDER BY c.end_date LIMIT 10`).all(today(), new Date(Date.now() + 30 * 864e5).toISOString().slice(0, 10)),
    } }
  }

  if (a === 'invoices' && b === 'generate' && method === 'POST') {
    const { period } = await readBody(req)
    if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(period || '')) bad('Kỳ phải dạng YYYY-MM')
    expireContracts()
    const cs = db.prepare("SELECT id, monthly_fee FROM contracts WHERE status='active' AND substr(start_date,1,7)<=? AND substr(end_date,1,7)>=?").all(period, period)
    let created = 0
    for (const k of cs) created += db.prepare('INSERT OR IGNORE INTO invoices (contract_id,period,amount,due_date) VALUES (?,?,?,?)').run(k.id, period, k.monthly_fee, period + '-10').changes
    audit(user, 'invoices', null, 'generate', { period, created })
    return { body: { created, skipped: cs.length - created } }
  }
  if (a === 'invoices' && c === 'pay' && method === 'POST') {
    const { amount } = await readBody(req); const amt = Number(amount)
    const inv = db.prepare('SELECT * FROM invoices WHERE id=?').get(Number(b)); if (!inv) bad('Không tìm thấy', 404)
    if (!(amt > 0)) bad('Số tiền phải lớn hơn 0')
    if (inv.paid_amount + amt > inv.amount) bad('Số tiền thu vượt quá số còn nợ')
    const paid = inv.paid_amount + amt
    db.prepare('UPDATE invoices SET paid_amount=?, status=? WHERE id=?').run(paid, invoiceStatus(inv.amount, paid), inv.id)
    audit(user, 'invoices', inv.id, 'pay', { amount: amt })
    return { body: { ok: true } }
  }

  const name = a, e = ENT[name]
  if (!e) bad('Không tìm thấy', 404)
  if (e.adminOnly && user.role !== 'admin') bad('Bạn không có quyền', 403)

  if (b === 'options' && method === 'GET') {
    return { body: db.prepare(`SELECT id, ${e.label} AS label FROM ${name} ORDER BY label LIMIT 3000`).all() }
  }
  if (!b && method === 'GET') {
    const p = url.searchParams; const where = []; const args = []
    const q = (p.get('q') || '').trim()
    if (q && e.search.length) { where.push('(' + e.search.map((f) => `${f} LIKE ? ESCAPE '\\'`).join(' OR ') + ')'); e.search.forEach(() => args.push('%' + q.replace(/[\\%_]/g, '\\$&') + '%')) }
    for (const f of e.fields) { const v = p.get(f.n); if (v && ['select', 'ref'].includes(f.t)) { where.push(`${f.n}=?`); args.push(v) } }
    const W = where.length ? 'WHERE ' + where.join(' AND ') : ''
    const size = Math.min(1000, Math.max(1, +p.get('size') || 20)), page = Math.max(1, +p.get('page') || 1)
    const total = db.prepare(`SELECT COUNT(*) c FROM ${name} ${W}`).get(...args).c
    const cols = ['id', ...e.fields.filter((f) => f.t !== 'password').map((f) => f.n)].join(',')
    const rows = db.prepare(`SELECT ${cols} FROM ${name} ${W} ORDER BY ${e.order} LIMIT ? OFFSET ?`).all(...args, size, (page - 1) * size)
    return { body: { rows, total } }
  }
  if (adminOnlyWrite(user, method) ) bad('Chỉ quản trị viên được xóa', 403)

  if (!b && method === 'POST') {
    const body = await readBody(req); const d = clean(name, body, true)
    try {
      rules(name, d, null, user)
      if (name === 'users') savePassword(d, body, true)
      if (name === 'rooms' && d.status === 'occupied') bad('Trạng thái "Đang thuê" được đặt tự động khi tạo hợp đồng')
      const keys = Object.keys(d)
      const r = db.prepare(`INSERT INTO ${name} (${keys.join(',')}) VALUES (${keys.map(() => '?').join(',')})`).run(...keys.map((k) => d[k]))
      if (name === 'contracts') syncRoom(d.room_id)
      audit(user, name, r.lastInsertRowid, 'create', { ...d, password_hash: undefined })
      return { body: { id: Number(r.lastInsertRowid) } }
    } catch (x) { dbErr(x) }
  }
  const id = Number(b)
  if (!Number.isInteger(id)) bad('ID không hợp lệ')
  const existing = db.prepare(`SELECT * FROM ${name} WHERE id=?`).get(id)
  if (!existing) bad('Không tìm thấy', 404)

  if (method === 'PUT') {
    const body = await readBody(req); const d = clean(name, body, false)
    try {
      rules(name, d, existing, user)
      if (name === 'users') savePassword(d, body, false)
      if (name === 'invoices') { d.status = invoiceStatus(d.amount ?? existing.amount, existing.paid_amount); if ((d.amount ?? existing.amount) < existing.paid_amount) bad('Số tiền nhỏ hơn số đã thu') }
      const keys = Object.keys(d); if (!keys.length) return { body: { ok: true } }
      db.prepare(`UPDATE ${name} SET ${keys.map((k) => k + '=?').join(',')} WHERE id=?`).run(...keys.map((k) => d[k]), id)
      if (name === 'contracts') { syncRoom(existing.room_id); syncRoom(d.room_id ?? existing.room_id) }
      audit(user, name, id, 'update', { ...d, password_hash: undefined })
      return { body: { ok: true } }
    } catch (x) { dbErr(x) }
  }
  if (method === 'DELETE') {
    if (name === 'users' && id === user.id) bad('Không thể xóa chính mình')
    try {
      db.prepare(`DELETE FROM ${name} WHERE id=?`).run(id)
      if (name === 'contracts') syncRoom(existing.room_id)
      audit(user, name, id, 'delete', { ...existing, password_hash: undefined })
      return { body: { ok: true } }
    } catch (x) { dbErr(x) }
  }
  bad('Không hỗ trợ', 405)
}
const adminOnlyWrite = (user, method) => method === 'DELETE' && user.role !== 'admin'

// ---------- server ----------
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml' }
const SEC = { 'X-Content-Type-Options': 'nosniff', 'X-Frame-Options': 'DENY', 'Referrer-Policy': 'same-origin',
  'Content-Security-Policy': "default-src 'self'; style-src 'self' 'unsafe-inline'; frame-ancestors 'none'" }

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://x')
  try {
    if (url.pathname.startsWith('/api/')) {
      const r = await api(req, url, currentUser(req))
      const h = { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', ...SEC }
      if (r.cookie) h['Set-Cookie'] = r.cookie
      res.writeHead(200, h).end(JSON.stringify(r.body))
      return
    }
    const rel = url.pathname === '/' ? 'index.html' : decodeURIComponent(url.pathname).replace(/^\/+/, '')
    const file = path.resolve(ROOT, 'public', rel)
    if (!file.startsWith(path.join(ROOT, 'public') + path.sep) || !fs.existsSync(file) || !fs.statSync(file).isFile()) {
      res.writeHead(404, SEC).end('Not found'); return
    }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream', ...SEC }).end(fs.readFileSync(file))
  } catch (e) {
    const code = e instanceof HttpError ? e.code : 500
    if (code === 500) console.error(e)
    res.writeHead(code, { 'Content-Type': 'application/json', ...SEC }).end(JSON.stringify({ error: code === 500 ? 'Lỗi máy chủ' : e.message }))
  }
})

// ---------- bootstrap ----------
if (!db.prepare('SELECT 1 FROM users').get()) {
  const pw = process.env.ADMIN_PASSWORD || crypto.randomBytes(9).toString('base64url')
  db.prepare("INSERT INTO users (username,password_hash,full_name,role) VALUES ('admin',?,'Quản trị viên','admin')").run(hashPw(pw))
  console.log(`\n  Tạo tài khoản đầu tiên:  admin / ${pw}\n  (hãy đổi mật khẩu trong mục Người dùng)\n`)
}
if (process.argv.includes('--seed') && !db.prepare('SELECT 1 FROM buildings').get()) {
  const ins = (t, o2) => Number(db.prepare(`INSERT INTO ${t} (${Object.keys(o2)}) VALUES (${Object.keys(o2).map(() => '?')})`).run(...Object.values(o2)).lastInsertRowid)
  const b = ins('buildings', { name: 'Phi Long Tower', address: '12 Nguyễn Huệ, Q1, TP.HCM', floors: 5 })
  const rooms = []; for (let f = 1; f <= 3; f++) for (let i = 1; i <= 3; i++) rooms.push(ins('rooms', { building_id: b, room_no: `${f}0${i}`, floor: f, area: 30 + i * 5, price: 6e6 + f * 5e5 }))
  const t1 = ins('tenants', { name: 'Công ty ABC', phone: '0901234567', email: 'abc@example.com' }), t2 = ins('tenants', { name: 'Nguyễn Văn An', phone: '0912345678' })
  ins('contracts', { tenant_id: t1, room_id: rooms[0], start_date: '2026-01-01', end_date: '2026-12-31', monthly_fee: 6.5e6, deposit: 13e6 }); syncRoom(rooms[0])
  ins('contracts', { tenant_id: t2, room_id: rooms[1], start_date: '2026-03-01', end_date: new Date(Date.now() + 20 * 864e5).toISOString().slice(0, 10), monthly_fee: 7e6, deposit: 14e6 }); syncRoom(rooms[1])
  ins('maintenance', { room_id: rooms[0], title: 'Thay bóng đèn hành lang', priority: 'low' })
  ins('maintenance', { title: 'Sửa thang máy', priority: 'high', status: 'in_progress' })
  ins('equipment', { name: 'Máy bơm nước', category: 'Cơ điện', location: 'Tầng hầm' })
  console.log('Đã nạp dữ liệu mẫu.')
}
expireContracts()
if (process.argv[1] === fileURLToPath(import.meta.url)) server.listen(PORT, () => console.log(`Phi Long Building: http://localhost:${PORT}`))
export { server }
