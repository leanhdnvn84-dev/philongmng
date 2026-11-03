const $ = (s, r = document) => r.querySelector(s)
const app = $('#app')
const state = { me: null, ents: {}, refs: {}, msg: null }

function h(tag, props = {}, ...kids) {
  const el = document.createElement(tag)
  for (const [k, v] of Object.entries(props)) {
    if (k.startsWith('on')) el.addEventListener(k.slice(2), v)
    else if (k === 'class') el.className = v
    else if (v !== false && v != null) el.setAttribute(k, v === true ? '' : v)
  }
  for (const k of kids.flat()) if (k != null && k !== false) el.append(k.nodeType ? k : document.createTextNode(k))
  return el
}
const money = (n) => (n == null ? '' : new Intl.NumberFormat('vi-VN').format(n) + ' ₫')
const TONE = { active: 'ok', available: 'ok', completed: 'ok', paid: 'ok', in_use: 'warn', occupied: 'warn', in_progress: 'warn', pending: 'warn', medium: 'warn', partial: 'warn',
  expired: 'bad', terminated: 'bad', damaged: 'bad', high: 'bad', unpaid: 'bad', maintenance: 'bad', '0': 'bad', '1': 'ok' }

async function api(url, method = 'GET', body) {
  const r = await fetch('/api/' + url, { method, headers: body ? { 'Content-Type': 'application/json' } : {}, body: body ? JSON.stringify(body) : undefined })
  const j = await r.json().catch(() => ({}))
  if (r.status === 401 && url !== 'login') { state.me = null; route(); throw new Error('Phiên đăng nhập đã hết') }
  if (!r.ok) throw new Error(j.error || 'Có lỗi xảy ra')
  return j
}
function flash(type, text) { state.msg = { type, text }; const m = $('#msg'); if (m) m.replaceWith(msgEl()) }
const msgEl = () => h('div', { id: 'msg' }, state.msg && h('div', { class: 'msg ' + state.msg.type }, state.msg.text, ' ', h('a', { href: '#', onclick: (e) => { e.preventDefault(); state.msg = null; $('#msg').replaceWith(msgEl()) } }, '✕')))

async function boot() {
  try { const j = await api('me'); state.me = j.user; state.ents = j.entities } catch { state.me = null }
  route()
}

function route() {
  if (!state.me) return loginView()
  const page = location.hash.slice(2) || 'dashboard'
  layout(page)
}

function loginView() {
  const err = h('p', { style: 'color:var(--bad)' })
  const u = h('input', { required: true, autofocus: true, autocomplete: 'username' }), p = h('input', { type: 'password', required: true, autocomplete: 'current-password' })
  app.replaceChildren(h('form', { class: 'card login', onsubmit: async (e) => {
    e.preventDefault(); err.textContent = ''
    try { await api('login', 'POST', { username: u.value, password: p.value }); await boot() } catch (x) { err.textContent = x.message }
  } }, h('h2', {}, '🏢 Phi Long Building'), h('label', {}, 'Tên đăng nhập', u), h('label', {}, 'Mật khẩu', p), err, h('div', { class: 'acts' }, h('button', {}, 'Đăng nhập'))))
}

function layout(page) {
  const nav = h('aside', {}, h('h1', {}, '🏢 Phi Long'),
    h('a', { href: '#/dashboard', class: page === 'dashboard' ? 'on' : '' }, '📊 Tổng quan'),
    Object.entries(state.ents).map(([k, e]) => h('a', { href: '#/' + k, class: page === k ? 'on' : '' }, `${e.icon} ${e.title}`)),
    h('div', { class: 'who' }, state.me.full_name, ` (${state.me.role})`, h('br'),
      h('a', { href: '#', style: 'padding:0;display:inline', onclick: async (e) => { e.preventDefault(); await api('logout', 'POST'); state.me = null; route() } }, 'Đăng xuất')))
  const main = h('main')
  app.replaceChildren(h('div', { class: 'layout' }, nav, main))
  main.append(msgEl())
  if (page === 'dashboard') dashboard(main)
  else if (state.ents[page]) list(main, page)
  else main.append('Không tìm thấy trang')
}

async function dashboard(main) {
  const d = await api('dashboard')
  const S = (v, l) => h('div', { class: 'card stat' }, h('b', {}, v), h('span', {}, l))
  main.append(h('h2', {}, 'Tổng quan'),
    h('div', { class: 'grid' }, S(d.buildings, 'Tòa nhà'), S(d.rooms, 'Tổng số phòng'), S(d.occupancy + '%', 'Tỷ lệ lấp đầy'), S(d.available, 'Phòng trống'),
      S(d.tenants, 'Khách thuê'), S(money(d.monthlyRevenue), 'Doanh thu thuê / tháng'), S(money(d.receivable), 'Công nợ phải thu'), S(d.overdue, 'Hóa đơn quá hạn'),
      S(d.openJobs, 'Việc bảo trì tồn'), S(d.urgentJobs, 'Bảo trì ưu tiên cao')),
    h('div', { class: 'card' }, h('h3', { style: 'margin-top:0' }, 'Hợp đồng sắp hết hạn (30 ngày)'),
      d.expiring.length ? h('div', { class: 'tw' }, h('table', {}, h('thead', {}, h('tr', {}, ['Khách thuê', 'Phòng', 'Hết hạn'].map((x) => h('th', {}, x)))),
        h('tbody', {}, d.expiring.map((c) => h('tr', {}, h('td', {}, c.tenant), h('td', {}, c.room), h('td', {}, c.end_date)))))) : h('p', { style: 'color:var(--mut)' }, 'Không có.')))
}

async function loadRefs(e) {
  await Promise.all(e.fields.filter((f) => f.t === 'ref').map(async (f) => {
    state.refs[f.ref] = new Map((await api(f.ref + '/options')).map((o) => [o.id, o.label]))
  }))
}

async function list(main, name) {
  const e = state.ents[name]; const st = { page: 1, q: '', status: '' }; const size = 20
  await loadRefs(e)
  const statusF = e.fields.find((f) => f.n === 'status' && f.t === 'select')
  const cols = e.fields.filter((f) => !f.nolist)
  const body = h('tbody'), pager = h('div', { class: 'pg' })
  const canDel = state.me.role === 'admin'

  const cell = (f, r) => {
    const v = r[f.n]; if (v == null || v === '') return h('span', { style: 'color:var(--mut)' }, '—')
    if (f.t === 'ref') return state.refs[f.ref]?.get(v) ?? '…'
    if (f.t === 'select') return h('span', { class: 'tag ' + (TONE[v] || '') }, f.opts.find(([x]) => x === String(v))?.[1] ?? v)
    if (f.t === 'money') return money(v)
    return String(v)
  }
  async function load() {
    const p = new URLSearchParams({ page: st.page, size, q: st.q }); if (st.status) p.set('status', st.status)
    const { rows, total } = await api(name + '?' + p)
    body.replaceChildren(...(rows.length ? rows.map((r) => h('tr', {},
      cols.map((f) => h('td', {}, cell(f, r))),
      h('td', { style: 'text-align:right' },
        e.actions?.includes('pay') && r.status !== 'paid' && h('button', { class: 'link', onclick: () => pay(r) }, 'Thu tiền'),
        h('button', { class: 'link', onclick: () => form(r) }, 'Sửa'),
        canDel && h('button', { class: 'link del', onclick: () => del(r) }, 'Xóa'))))
      : [h('tr', {}, h('td', { colspan: cols.length + 1, style: 'text-align:center;color:var(--mut)' }, 'Chưa có dữ liệu'))]))
    const pages = Math.max(1, Math.ceil(total / size))
    pager.replaceChildren(`${total} bản ghi`, h('button', { class: 'sec', disabled: st.page <= 1, onclick: () => { st.page--; load() } }, '‹'), `${st.page}/${pages}`,
      h('button', { class: 'sec', disabled: st.page >= pages, onclick: () => { st.page++; load() } }, '›'))
  }
  const guard = (fn) => async (...a) => { try { await fn(...a) } catch (x) { flash('err', x.message) } }
  const del = guard(async (r) => { if (!confirm('Xóa bản ghi này?')) return; await api(`${name}/${r.id}`, 'DELETE'); flash('ok', 'Đã xóa'); await load() })
  const pay = guard(async (r) => {
    const v = prompt(`Số tiền thu (còn nợ ${money(r.amount - r.paid_amount)}):`, r.amount - r.paid_amount); if (v == null) return
    await api(`invoices/${r.id}/pay`, 'POST', { amount: Number(v) }); flash('ok', 'Đã ghi nhận thanh toán'); await load()
  })

  function form(row) {
    const isNew = !row; const vals = {}
    const inputs = e.fields.filter((f) => !f.ro).map((f) => {
      let el
      if (f.t === 'textarea') el = h('textarea', { rows: 3 })
      else if (f.t === 'select') el = h('select', {}, f.opts.map(([v, l]) => h('option', { value: v }, l)))
      else if (f.t === 'ref') el = h('select', {}, h('option', { value: '' }, '— Chọn —'), [...(state.refs[f.ref] ?? [])].map(([v, l]) => h('option', { value: v }, l)))
      else el = h('input', { type: f.t === 'password' ? 'password' : f.t === 'date' ? 'date' : f.t === 'month' ? 'month' : f.t === 'text' ? 'text' : 'number', step: 'any', autocomplete: 'off', placeholder: f.t === 'password' && !isNew ? 'Để trống nếu không đổi' : '' })
      el.value = row ? (f.t === 'password' ? '' : row[f.n] ?? '') : f.def ?? ''
      el.required = !!f.req && !(f.t === 'password' && !isNew) || (f.t === 'password' && isNew)
      vals[f.n] = el
      return h('label', {}, f.l + (el.required ? ' *' : ''), el)
    })
    const err = h('div', { style: 'color:var(--bad);font-size:13px' })
    const ov = h('div', { class: 'ov', role: 'dialog' }, h('form', { class: 'modal', onsubmit: async (ev) => {
      ev.preventDefault(); err.textContent = ''
      const payload = {}; for (const [k, el] of Object.entries(vals)) if (!(k === 'password' && !el.value && !isNew)) payload[k] = el.value
      try { await api(isNew ? name : `${name}/${row.id}`, isNew ? 'POST' : 'PUT', payload); ov.remove(); flash('ok', 'Đã lưu'); await load() } catch (x) { err.textContent = x.message }
    } }, h('h3', { style: 'margin-top:0' }, (isNew ? 'Thêm ' : 'Sửa ') + e.title.toLowerCase()), inputs, err,
      h('div', { class: 'acts' }, h('button', { type: 'button', class: 'sec', onclick: () => ov.remove() }, 'Hủy'), h('button', {}, 'Lưu'))))
    document.body.append(ov)
  }

  const search = h('input', { placeholder: 'Tìm kiếm…', onchange: (ev) => { st.q = ev.target.value; st.page = 1; guard(load)() } })
  const sel = statusF && h('select', { onchange: (ev) => { st.status = ev.target.value; st.page = 1; guard(load)() } }, h('option', { value: '' }, 'Mọi trạng thái'), statusF.opts.map(([v, l]) => h('option', { value: v }, l)))
  main.append(h('h2', {}, `${e.icon} ${e.title}`),
    h('div', { class: 'bar' }, e.search.length ? search : null, sel, h('span', { class: 'sp' }),
      name === 'invoices' && h('button', { class: 'sec', onclick: guard(async () => {
        const p = prompt('Tạo hóa đơn cho kỳ (YYYY-MM):', new Date().toISOString().slice(0, 7)); if (!p) return
        const r = await api('invoices/generate', 'POST', { period: p }); flash('ok', `Đã tạo ${r.created} hóa đơn (bỏ qua ${r.skipped} đã có)`); await load()
      }) }, 'Tạo hóa đơn tháng'),
      h('button', { onclick: () => form(null) }, `+ Thêm ${e.title.toLowerCase()}`)),
    h('div', { class: 'card', style: 'padding:0' }, h('div', { class: 'tw' }, h('table', {}, h('thead', {}, h('tr', {}, cols.map((f) => h('th', {}, f.l)), h('th'))), body))), pager)
  await guard(load)()
}

window.addEventListener('hashchange', route)
boot()
