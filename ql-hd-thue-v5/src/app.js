/* QL-HD-THUE v5 — giao diện. Chỉ đọc dữ liệu cũ; mọi kết quả là tính toán mới. */
window.startApp = function () {
  const R = QLHD_RECON.run(window.__LEGACY__);
  const S = R.summary;
  const Q = QLHD;
  const app = document.getElementById('app');
  const navEl = document.getElementById('nav');

  const money = v => (v === null || v === undefined || v === '' ? '—' : Math.round(Number(v)).toLocaleString('vi-VN') + ' đ');
  const fdate = v => { if (!v) return '—'; const [y, m, d] = String(v).slice(0, 10).split('-'); return `${d}/${m}/${y}`; };
  const esc = v => String(v === null || v === undefined ? '' : v).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const SEV = ['Nghiêm trọng', 'Cao', 'Trung bình', 'Thấp', 'Thông tin'];
  const sevTone = s => ({ 'Nghiêm trọng': 'bad', 'Cao': 'warn', 'Trung bình': 'mid', 'Thấp': 'plain', 'Thông tin': 'plain' }[s] || 'plain');
  const statusTone = s => ({ 'Đang hiệu lực': 'ok', 'Đã hết hạn': 'bad', 'Chưa hiệu lực': 'mid', 'Hủy': 'plain' }[s] || 'warn');

  const TABS = [['overview', 'Tổng quan'], ['contracts', 'Hợp đồng'], ['compare', 'Đối chiếu'], ['payments', 'Thanh toán'], ['issues', 'Kiểm tra dữ liệu']];
  const COUNTS = { contracts: R.contracts.length, issues: R.issues.length };
  let current = 'overview';
  let detailId = null;
  let payFilter = '';
  let sevFilter = '';

  function renderNav() {
    navEl.innerHTML = TABS.map(([k, l]) => {
      const cnt = COUNTS[k] !== undefined ? `<span class="count">${COUNTS[k]}</span>` : '';
      return `<button type="button" data-tab="${k}" ${current === k ? 'aria-current="page"' : ''}><span>${esc(l)}</span>${cnt}</button>`;
    }).join('');
  }

  function balance() {
    const parts = [
      ['Khớp', S.same, 'var(--match)'],
      ['Lệch số tiền hoặc ngày', S.diffTotal, 'var(--diff)'],
      ['Chỉ có trong dữ liệu cũ', S.onlyLeg, 'var(--old)'],
      ['Chỉ có khi tính lại', S.onlyNew, 'var(--new)']
    ];
    const total = parts.reduce((s, p) => s + p[1], 0) || 1;
    return `<div class="balance" role="img" aria-label="${parts.map(p => p[0] + ' ' + p[1]).join(', ')}">
      <div class="bar">${parts.map(p => `<span style="width:${(p[1] / total * 100).toFixed(2)}%;background:${p[2]}"></span>`).join('')}</div>
      <div class="legend">${parts.map(p => `<div><span class="sw" style="background:${p[2]}"></span>${esc(p[0])}<b>${p[1]}</b></div>`).join('')}</div>
    </div>`;
  }

  function overview() {
    const sev = {};
    R.issues.forEach(i => { sev[i.sev] = (sev[i.sev] || 0) + 1; });
    return `<header class="top"><h1>Tổng quan</h1></header>
      <p class="lede">Kỳ thanh toán được tính lại từ hợp đồng, phụ lục và giá thuê, sau đó so với dữ liệu cũ theo ngày bắt đầu của từng kỳ.</p>
      ${balance()}
      <div class="facts">
        <div><strong>${S.contracts}</strong><span>Hợp đồng</span></div>
        <div><strong>${S.contractsActive}</strong><span>Đang hiệu lực theo ngày hôm nay</span></div>
        <div><strong>${S.legacyPeriods}</strong><span>Kỳ trong dữ liệu cũ</span></div>
        <div><strong>${S.newPeriods}</strong><span>Kỳ khi tính lại</span></div>
      </div>
      <h3>Thanh toán</h3>
      <div class="facts">
        <div><strong>${money(S.legacyPaidTotal)}</strong><span>Giao dịch ghi trong dữ liệu cũ</span></div>
        <div><strong class="${S.verifiedPaidTotal ? '' : 'bad'}">${money(S.verifiedPaidTotal)}</strong><span>Có số chứng từ</span></div>
      </div>
      <h3>Vấn đề theo mức độ</h3>
      <div class="facts">${SEV.map(s => `<div><strong class="${sevTone(s) === 'bad' ? 'bad' : (sevTone(s) === 'warn' ? 'warn' : '')}">${sev[s] || 0}</strong><span>${esc(s)}</span></div>`).join('')}</div>
      <p class="note">Chi tiết từng mục nằm ở tab "Kiểm tra dữ liệu", có mã C01–C22 và đề xuất sửa.</p>`;
  }

  function contracts() {
    if (detailId) return contractDetail(detailId);
    const rows = R.contracts.map(c => `<tr class="click" tabindex="0" data-open="${esc(c.id)}">
      <td><b>${esc(c.id)}</b></td><td>${esc(c.customer)}</td><td>${esc(c.office || '—')}</td>
      <td><span class="tag ${statusTone(c.status)}">${esc(c.status)}</span></td>
      <td>${fdate(c.effectiveEnd)}</td><td class="r">${c.newCount}</td><td class="r">${c.legacyCount}</td>
      <td class="r">${money(c.newTotal)}</td><td class="flag">${c.errors.length ? '<span class="tag bad">Thiếu giá</span>' : ''}</td></tr>`).join('');
    return `<header class="top"><h1>Hợp đồng</h1></header>
      <p class="lede">Hạn hiệu lực là ngày kết thúc hoặc ngày gia hạn bằng phụ lục, lấy mốc muộn hơn. Bấm một dòng để xem kỳ, đề nghị và chi tiết.</p>
      <div class="scroll"><table><thead><tr><th>Mã HĐ</th><th>Khách thuê</th><th>Văn phòng</th><th>Trạng thái</th><th>Hết hạn hiệu lực</th><th class="r">Kỳ mới</th><th class="r">Kỳ cũ</th><th class="r">Tổng phải thu (mới)</th><th></th></tr></thead>
      <tbody>${rows}</tbody></table></div>`;
  }

  function contractDetail(id) {
    const c = R.contracts.find(x => x.id === id);
    const kp = c.periods.map(p => `<tr><td class="num">${p['Kỳ số']}</td><td>${fdate(Q.toIso(p['Từ ngày']))} – ${fdate(Q.toIso(p['Đến ngày']))}</td><td>${fdate(Q.toIso(p['Ngày đến hạn']))}</td>
      <td class="r">${money(p['Tiền thuê sau thuế'])}</td><td class="r">${money(p['Phí dịch vụ sau thuế'])}</td><td class="r"><b>${money(p['Tổng sau thuế'])}</b></td><td class="muted">${esc(p['Ghi chú'])}</td></tr>`).join('');
    const rq = c.requests.map(r => `<tr><td>${fdate(Q.toIso(r['Ngày đề nghị']))}</td><td>${fdate(Q.toIso(r['Từ ngày']))} – ${fdate(Q.toIso(r['Đến ngày']))}</td><td class="r">${money(r['Tổng đề nghị'])}</td><td><span class="tag plain">${esc(r['Trạng thái'])}</span></td></tr>`).join('');
    const dt = c.details.map(d => `<tr><td>${esc(d['Loại'])}</td><td>${fdate(Q.toIso(d['Từ ngày']))} – ${fdate(Q.toIso(d['Đến ngày']))}</td><td class="r num">${d['Số tháng'].toFixed(4)}</td><td class="r">${money(d['Đơn giá trước thuế'])}</td><td>${esc(d['Mã nguồn'])}</td></tr>`).join('');
    return `<button class="back" type="button" data-back>← Tất cả hợp đồng</button>
      <header class="top"><h1>${esc(c.id)} · ${esc(c.customer)}</h1></header>
      <div class="meta"><span>Văn phòng <b>${esc(c.office || '—')}</b></span><span>Trạng thái <b>${esc(c.status)}</b></span><span>Hết hạn hiệu lực <b>${fdate(c.effectiveEnd)}</b></span><span>Kỳ mới <b>${c.newCount}</b> / cũ <b>${c.legacyCount}</b></span></div>
      ${c.errors.length ? `<div class="alert">${c.errors.map(esc).join('<br>')}</div>` : ''}
      <h3>Kỳ thanh toán (tính lại)</h3>
      <div class="scroll"><table><thead><tr><th>Kỳ</th><th>Khoảng</th><th>Đến hạn</th><th class="r">Tiền thuê</th><th class="r">Phí DV</th><th class="r">Tổng</th><th>Ghi chú</th></tr></thead><tbody>${kp || '<tr><td colspan="7" class="muted">Không có kỳ.</td></tr>'}</tbody></table></div>
      <h3>Đề nghị thanh toán</h3>
      <div class="scroll"><table><thead><tr><th>Ngày lập</th><th>Kỳ</th><th class="r">Tổng</th><th>Trạng thái</th></tr></thead><tbody>${rq || '<tr><td colspan="4" class="muted">Không có.</td></tr>'}</tbody></table></div>
      <h3>Chi tiết kỳ (tính lại)</h3>
      <div class="scroll"><table><thead><tr><th>Loại</th><th>Khoảng</th><th class="r">Số tháng</th><th class="r">Đơn giá</th><th>Nguồn giá</th></tr></thead><tbody>${dt || '<tr><td colspan="5" class="muted">Không có.</td></tr>'}</tbody></table></div>`;
  }

  function compare() {
    const rows = R.contracts.map(c => {
      const ok = c.diffTotal === 0 && c.onlyNew === 0 && c.onlyLeg === 0 && c.detailMismatch === 0 && !c.errors.length;
      const cell = (n, tone) => `<td class="r ${n ? tone : ''}">${n}</td>`;
      return `<tr class="click" tabindex="0" data-open="${esc(c.id)}">
        <td><b>${esc(c.id)}</b></td><td class="r">${c.legacyCount}</td><td class="r">${c.newCount}</td>
        <td class="r ok">${c.same}</td>${cell(c.diffTotal, 'warn')}${cell(c.onlyLeg, 'bad')}${cell(c.onlyNew, 'warn')}${cell(c.detailMismatch, 'bad')}
        <td class="r">${money(c.legacyTotal)}</td><td class="r">${money(c.newTotal)}</td>
        <td><span class="tag ${ok ? 'ok' : 'warn'}">${ok ? 'Khớp' : 'Có khác biệt'}</span></td></tr>`;
    }).join('');
    const diffs = R.contracts.filter(c => c.rows.length).map(c => `<h3>${esc(c.id)} · khác biệt</h3>
      <div class="scroll"><table><thead><tr><th>Loại</th><th>Từ</th><th>Đến (cũ)</th><th>Đến (mới)</th><th class="r">Tổng cũ</th><th class="r">Tổng mới</th><th class="r">Chênh</th></tr></thead><tbody>
      ${c.rows.map(r => `<tr><td><span class="tag ${r.kind === 'chỉ cũ' ? 'bad' : (r.kind === 'chỉ mới' ? 'mid' : 'warn')}">${esc(r.kind)}</span></td><td>${fdate(r.from)}</td><td>${fdate(r.legTo)}</td><td>${fdate(r.to)}</td><td class="r">${money(r.legTotal)}</td><td class="r">${money(r.newTotal)}</td><td class="r"><b>${money(r.diff)}</b></td></tr>`).join('')}
      </tbody></table></div>`).join('');
    return `<header class="top"><h1>Đối chiếu</h1></header>
      <p class="lede">Kỳ được ghép theo ngày bắt đầu. "Chênh" là tổng mới trừ tổng cũ. Chênh lệch làm tròn từ ${R.TOL_MONEY} đ trở xuống được coi là khớp.</p>
      <div class="scroll"><table><thead><tr><th>Mã HĐ</th><th class="r">Kỳ cũ</th><th class="r">Kỳ mới</th><th class="r">Khớp</th><th class="r">Lệch</th><th class="r">Chỉ cũ</th><th class="r">Chỉ mới</th><th class="r">Chi tiết lệch</th><th class="r">Tổng cũ</th><th class="r">Tổng mới</th><th></th></tr></thead><tbody>${rows}</tbody></table></div>
      ${diffs || '<p class="note">Không có khác biệt.</p>'}`;
  }

  function payments() {
    const list = R.payment.filter(p => !payFilter || p.newStatus === payFilter);
    const statuses = [...new Set(R.payment.map(p => p.newStatus))];
    const rows = list.slice(0, 400).map(p => `<tr><td class="num">${esc(p.periodId)}</td><td>${esc(p.contract)}</td><td>${fdate(p.from)} – ${fdate(p.to)}</td><td>${fdate(p.due)}</td>
      <td class="r">${money(p.total)}</td><td><span class="tag plain">${esc(p.legacyStatus)}</span></td><td class="r">${money(p.legacyPaid)}</td>
      <td class="r">${money(p.verifiedPaid)}</td><td class="r"><b>${money(p.outstanding)}</b></td><td><span class="tag ${p.newStatus.startsWith('Đã thu') ? 'ok' : (p.newStatus === 'Quá hạn' ? 'bad' : 'mid')}">${esc(p.newStatus)}</span></td></tr>`).join('');
    return `<header class="top"><h1>Thanh toán</h1></header>
      <p class="lede">Chỉ giao dịch có số chứng từ mới được tính là đã thu. Giao dịch không có chứng từ được ghi riêng, không tính vào số đã thu.</p>
      <div class="toolbar"><label>Trạng thái mới <select id="payFilter"><option value="">Tất cả</option>${statuses.map(s => `<option ${s === payFilter ? 'selected' : ''}>${esc(s)}</option>`).join('')}</select></label>
      <span class="muted">${list.length} kỳ${list.length > 400 ? ' · hiển thị 400 dòng đầu' : ''}</span></div>
      <div class="scroll"><table><thead><tr><th>Kỳ</th><th>HĐ</th><th>Khoảng</th><th>Đến hạn</th><th class="r">Tổng kỳ</th><th>Trạng thái cũ</th><th class="r">Đã ghi (cũ)</th><th class="r">Có chứng từ</th><th class="r">Còn phải thu</th><th>Trạng thái mới</th></tr></thead><tbody>${rows}</tbody></table></div>`;
  }

  function issues() {
    const list = R.issues.filter(i => !sevFilter || i.sev === sevFilter);
    const rows = list.map(i => `<tr><td class="num">${esc(i.code)}</td><td><span class="tag ${sevTone(i.sev)}">${esc(i.sev)}</span></td><td>${esc(i.sheet)}</td><td>${esc(i.key)}</td><td>${esc(i.message)}</td><td class="muted">${esc(i.fix)}</td></tr>`).join('');
    return `<header class="top"><h1>Kiểm tra dữ liệu</h1></header>
      <div class="toolbar"><label>Mức độ <select id="sevFilter"><option value="">Tất cả</option>${SEV.map(s => `<option ${s === sevFilter ? 'selected' : ''}>${s}</option>`).join('')}</select></label>
      <button class="btn" id="exportIssues" type="button">Xuất CSV vấn đề</button><button class="btn" id="exportCompare" type="button">Xuất CSV đối chiếu</button></div>
      <div class="scroll"><table><thead><tr><th>Mã</th><th>Mức độ</th><th>Sheet</th><th>Khóa / dòng</th><th>Mô tả</th><th>Đề xuất</th></tr></thead><tbody>${rows}</tbody></table></div>`;
  }

  function csv(name, header, rows) {
    const body = [header, ...rows].map(r => r.map(v => `"${String(v === null || v === undefined ? '' : v).replace(/"/g, '""')}"`).join(',')).join('\r\n');
    const blob = new Blob(['﻿' + body], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; a.click();
  }

  function render() {
    renderNav();
    const body = { overview, contracts, compare, payments, issues }[current]();
    app.innerHTML = `<main>${body}</main>`;
    app.querySelector('main').focus?.({ preventScroll: true });
  }

  function go(tab, id) { current = tab; detailId = id || null; render(); window.scrollTo(0, 0); }

  navEl.addEventListener('click', e => { const t = e.target.closest('[data-tab]'); if (t) go(t.dataset.tab); });
  app.addEventListener('click', e => {
    const o = e.target.closest('[data-open]');
    if (o) return go('contracts', o.dataset.open);
    if (e.target.closest('[data-back]')) return go('contracts');
    if (e.target.id === 'exportIssues') return csv('vi-pham-du-lieu.csv', ['Mã', 'Mức độ', 'Sheet', 'Khóa', 'Mô tả', 'Đề xuất'], R.issues.map(i => [i.code, i.sev, i.sheet, i.key, i.message, i.fix]));
    if (e.target.id === 'exportCompare') return csv('doi-chieu-ky.csv', ['Mã HĐ', 'Loại', 'Từ', 'Đến cũ', 'Đến mới', 'Tổng cũ', 'Tổng mới', 'Chênh'],
      R.contracts.flatMap(c => c.rows.map(r => [c.id, r.kind, r.from, r.legTo || '', r.to || '', r.legTotal ?? '', r.newTotal ?? '', r.diff])));
  });
  app.addEventListener('keydown', e => { if (e.key === 'Enter' && e.target.matches('tr[data-open]')) go('contracts', e.target.dataset.open); });
  app.addEventListener('change', e => {
    if (e.target.id === 'payFilter') { payFilter = e.target.value; render(); }
    if (e.target.id === 'sevFilter') { sevFilter = e.target.value; render(); }
  });

  // Chuyển giao diện sáng/tối, nhớ lựa chọn trong trình duyệt (không ảnh hưởng dữ liệu).
  const root = document.documentElement;
  const KEY = 'qlhd5-theme';
  try { const saved = localStorage.getItem(KEY); if (saved) root.dataset.theme = saved; } catch (e) {}
  document.getElementById('themeBtn').addEventListener('click', () => {
    const dark = root.dataset.theme === 'dark' || (!root.dataset.theme && matchMedia('(prefers-color-scheme: dark)').matches);
    root.dataset.theme = dark ? 'light' : 'dark';
    try { localStorage.setItem(KEY, root.dataset.theme); } catch (e) {}
  });

  render();
};
