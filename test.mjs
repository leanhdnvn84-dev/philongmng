// Smoke test: node test.mjs   (uses a throwaway DB)
import { mkdtempSync } from 'node:fs'; import { tmpdir } from 'node:os'; import path from 'node:path'
process.env.DB_FILE = path.join(mkdtempSync(path.join(tmpdir(), 'plb-')), 't.db'); process.env.ADMIN_PASSWORD = 'test-password-1'
const { server } = await import('./server.js')
await new Promise((r) => server.listen(0, r)); const base = `http://localhost:${server.address().port}`
let cookie = ''; let fails = 0
const call = async (m, u, b) => { const r = await fetch(base + u, { method: m, headers: { 'Content-Type': 'application/json', cookie }, body: b ? JSON.stringify(b) : undefined })
  const sc = r.headers.get('set-cookie'); if (sc) cookie = sc.split(';')[0]; return { s: r.status, j: await r.json().catch(() => ({})) } }
const t = (name, ok) => { console.log(ok ? 'ok  ' : 'FAIL', name); if (!ok) fails++ }

t('unauth -> 401', (await call('GET', '/api/buildings')).s === 401)
t('bad login -> 401', (await call('POST', '/api/login', { username: 'admin', password: 'x' })).s === 401)
t('login', (await call('POST', '/api/login', { username: 'admin', password: 'test-password-1' })).s === 200)
const b = (await call('POST', '/api/buildings', { name: 'T1', address: 'A' })).j.id
const r = (await call('POST', '/api/rooms', { building_id: b, room_no: '101', price: 5e6 })).j.id
t('duplicate room -> 409', (await call('POST', '/api/rooms', { building_id: b, room_no: '101', price: 1 })).s === 409)
t('missing required -> 400', (await call('POST', '/api/rooms', { building_id: b })).s === 400)
const tn = (await call('POST', '/api/tenants', { name: 'X' })).j.id
const c = await call('POST', '/api/contracts', { tenant_id: tn, room_id: r, start_date: '2026-01-01', end_date: '2030-01-01', monthly_fee: 5e6 })
t('contract created', c.s === 200)
t('room occupied', (await call('GET', '/api/rooms')).j.rows[0].status === 'occupied')
t('2nd active contract rejected', (await call('POST', '/api/contracts', { tenant_id: tn, room_id: r, start_date: '2026-01-01', end_date: '2030-01-01', monthly_fee: 1 })).s === 409)
t('bad dates rejected', (await call('POST', '/api/contracts', { tenant_id: tn, room_id: r, start_date: '2030-01-01', end_date: '2026-01-01', monthly_fee: 1, status: 'terminated' })).s === 400)
const g = await call('POST', '/api/invoices/generate', { period: '2026-05' })
t('generate invoice', g.j.created === 1)
t('generate idempotent', (await call('POST', '/api/invoices/generate', { period: '2026-05' })).j.created === 0)
const inv = (await call('GET', '/api/invoices')).j.rows[0]
t('partial pay', (await call('POST', `/api/invoices/${inv.id}/pay`, { amount: 2e6 })).s === 200 && (await call('GET', '/api/invoices')).j.rows[0].status === 'partial')
t('overpay rejected', (await call('POST', `/api/invoices/${inv.id}/pay`, { amount: 9e6 })).s === 400)
await call('POST', `/api/invoices/${inv.id}/pay`, { amount: 3e6 })
t('fully paid', (await call('GET', '/api/invoices')).j.rows[0].status === 'paid')
t('contract with invoices cannot be deleted', (await call('DELETE', `/api/contracts/${c.j.id}`)).s === 409)
await call('PUT', `/api/contracts/${c.j.id}`, { status: 'terminated' })
t('room freed after contract terminated', (await call('GET', '/api/rooms')).j.rows[0].status === 'available')
t('dashboard', (await call('GET', '/api/dashboard')).j.rooms === 1)
t('sql-ish search safe', (await call('GET', "/api/tenants?q=%25'%3B--")).s === 200)
await call('POST', '/api/users', { username: 'nv1', full_name: 'NV', role: 'staff', password: 'password123' })
const admin = cookie; cookie = ''
await call('POST', '/api/login', { username: 'nv1', password: 'password123' })
t('staff cannot delete', (await call('DELETE', `/api/tenants/${tn}`)).s === 403)
t('staff cannot see users', (await call('GET', '/api/users')).s === 403)
t('path traversal blocked', (await fetch(base + '/..%2fserver.js')).status === 404)
server.close(); console.log(fails ? `\n${fails} FAILED` : '\nall passed'); process.exit(fails ? 1 : 0)
