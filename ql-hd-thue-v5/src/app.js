/* QL-HD-THUE v5 — giao diện. Chỉ đọc dữ liệu cũ, mọi kết quả là tính toán mới. */
(function () {
  const R = QLHD_RECON.run(window.__LEGACY__);
  const S = R.summary;
  const Q = QLHD;
  const app = document.getElementById('app');
  const money = v => (v === null || v === undefined || v === '' ? '—' : Math.round(Number(v)).toLocaleString('vi-VN') + ' đ');
  const num = v => (v === null || v === undefined ? '—' : Math.round(Number(v)).toLocaleString('vi-VN'));
  const fdate = v => { if (!v) return '—'; const [y, m, d] = String(v).slice(0, 10).split('-'); return `${d}/${m}/${y}`; };
  const esc = v => String(v === null || v === undefined ? '' : v).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const sevClass = s => ({ 'Nghiêm trọng': 'bad', 'Cao': 'warn', 'Trung bình': 'mid', 'Thấp': 'low', 'Thông tin': 'info' }[s] || '');
  const tabs = [['overview', 'Tổng quan'], ['contracts', 'Hợp đồng'], ['compare', 'Đối chiếu'], ['payments', 'Thanh toán'], ['issues', `Kiểm tra dữ liệu (${S.issueCount})`]];
  let current = 'overview';
  let detailId = null;

  function nav() {
    return `<nav class="tabs">${tabs.map(([k, l]) => `<button data-tab="${k}" class="${current === k ? 'on' : ''}">${esc(l)}</button>`).join('')}</nav>`;
  }
  function card(v, l, cls) { return `<div class="card ${cls || ''}"><div class="v">${v}</div><div class="l">${esc(l)}</div></div>`; }

  function overview() {
    const sev = {};
    R.issues.forEach(i => { sev[i.sev] = (sev[i.sev] || 0) + 1; });
    return `<section>
      <h2>Tổng quan dữ liệu cũ đã tính lại</h2>
      <p class="note">Kết quả được tính bằng lõi mới từ hợp đồng, phụ lục và giá thuê. Dữ liệu cũ không bị thay đổi. Ngày tham chiếu: ${fdate(new Date().toISOString().slice(0, 10))}.</p>
      <div class="cards">
        ${card(S.contracts, 'Hợp đồng')}
        ${card(S.contractsActive, 'Đang hiệu lực (tính lại)', 'ok')}
        ${card(S.legacyPeriods, 'Kỳ trong dữ liệu cũ')}
        ${card(S.newPeriods, 'Kỳ khi tính lại')}
        ${card(S.same, 'Kỳ khớp hoàn toàn', 'ok')}
        ${card(S.diffTotal, 'Kỳ khác số tiền/ngày', 'warn')}
        ${card(S.onlyLeg, 'Chỉ có trong dữ liệu cũ', 'warn')}
        ${card(S.onlyNew, 'Thiếu trong dữ liệu cũ', 'warn')}
      </div>
      <h3>Thanh toán</h3>
      <div class="cards">
        ${card(money(S.legacyPaidTotal), 'Tổng giao dịch ghi trong dữ liệu cũ')}
        ${card(money(S.verifiedPaidTotal), 'Giao dịch có số chứng từ', S.verifiedPaidTotal ? 'ok' : 'bad')}
      </div>
      <h3>Vấn đề theo mức độ</h3>
      <div class="cards">
        ${['Nghiêm trọng', 'Cao', 'Trung bình', 'Thấp', 'Thông tin'].map(s => card(sev[s] || 0, s, sevClass(s))).join('')}
      </div>
      <p class="note">Mỗi mục trong tab "Kiểm tra dữ liệu" có mã (C01–C19) và đề xuất sửa. Xuất ra CSV ở đó.</p>
    </section>`;
  }

  function contracts() {
    if (detailId) return contractDetail(detailId);
    const rows = R.contracts.map(c => `<tr class="click" data-open="${esc(c.id)}">
      <td><b>${esc(c.id)}</b></td><td>${esc(c.customer)}</td><td>${esc(c.office || '—')}</td>
      <td><span class="tag ${c.status === 'Đang hiệu lực' ? 'ok' : (c.status === 'Đã hết hạn' ? 'bad' : 'mid')}">${esc(c.status)}</span></td>
      <td>${fdate(c.effectiveEnd)}</td><td class="r">${c.newCount}</td><td class="r">${c.legacyCount}</td>
      <td class="r">${money(c.newTotal)}</td><td>${c.errors.length ? '<span class="tag bad">Thiếu giá</span>' : ''}</td></tr>`).join('');
    return `<section><h2>Hợp đồng (tính lại)</h2>
      <p class="note">Hạn hiệu lực = max(Ngày kết thúc, Đến ngày phụ lục gia hạn chưa hủy). Bấm một hợp đồng để xem kỳ, đề nghị và chi tiết.</p>
      <div class="scroll"><table><thead><tr><th>Mã HĐ</th><th>Khách thuê</th><th>Mã văn phòng</th><th>Trạng thái</th><th>Hết hạn hiệu lực</th><th class="r">Kỳ (mới)</th><th class="r">Kỳ (cũ)</th><th class="r">Tổng phải thu (mới)</th><th></th></tr></thead>
      <tbody>${rows}</tbody></table></div></section>`;
  }

  function contractDetail(id) {
    const c = R.contracts.find(x => x.id === id);
    const kp = c.periods.map(p => `<tr><td>${p['Kỳ số']}</td><td>${fdate(Q.toIso(p['Từ ngày']))}</td><td>${fdate(Q.toIso(p['Đến ngày']))}</td><td>${fdate(Q.toIso(p['Ngày đến hạn']))}</td>
      <td class="r">${money(p['Tiền thuê sau thuế'])}</td><td class="r">${money(p['Phí dịch vụ sau thuế'])}</td><td class="r"><b>${money(p['Tổng sau thuế'])}</b></td><td>${esc(p['Ghi chú'])}</td></tr>`).join('');
    const rq = c.requests.map(r => `<tr><td>${fdate(Q.toIso(r['Ngày đề nghị']))}</td><td>${fdate(Q.toIso(r['Từ ngày']))} – ${fdate(Q.toIso(r['Đến ngày']))}</td><td class="r">${money(r['Tổng đề nghị'])}</td><td>${esc(r['Trạng thái'])}</td></tr>`).join('');
    const dt = c.details.map(d => `<tr><td>${esc(d['Loại'])}</td><td>${fdate(Q.toIso(d['Từ ngày']))} – ${fdate(Q.toIso(d['Đến ngày']))}</td><td class="r">${d['Số tháng'].toFixed(4)}</td><td class="r">${money(d['Đơn giá trước thuế'])}</td><td>${esc(d['Mã nguồn'])}</td></tr>`).join('');
    return `<section>
      <button class="back" data-back>← Danh sách hợp đồng</button>
      <h2>${esc(c.id)} — ${esc(c.customer)}</h2>
      <p class="note">Văn phòng ${esc(c.office || '—')} · Trạng thái: <b>${esc(c.status)}</b> · Hết hạn hiệu lực: ${fdate(c.effectiveEnd)} · Kỳ mới ${c.newCount} / cũ ${c.legacyCount}</p>
      ${c.errors.length ? `<div class="alert bad">${c.errors.map(esc).join('<br>')}</div>` : ''}
      <h3>Kỳ thanh toán (tính lại)</h3>
      <div class="scroll"><table><thead><tr><th>Kỳ</th><th>Từ</th><th>Đến</th><th>Đến hạn</th><th class="r">Tiền thuê</th><th class="r">Phí DV</th><th class="r">Tổng</th><th>Ghi chú</th></tr></thead><tbody>${kp || '<tr><td colspan="8">Không có kỳ.</td></tr>'}</tbody></table></div>
      <h3>Đề nghị thanh toán (Nháp)</h3>
      <div class="scroll"><table><thead><tr><th>Ngày lập đề nghị</th><th>Kỳ</th><th class="r">Tổng</th><th>Trạng thái</th></tr></thead><tbody>${rq || '<tr><td colspan="4">Không có.</td></tr>'}</tbody></table></div>
      <h3>Chi tiết kỳ (tính lại)</h3>
      <div class="scroll"><table><thead><tr><th>Loại</th><th>Khoảng</th><th class="r">Số tháng</th><th class="r">Đơn giá</th><th>Nguồn giá</th></tr></thead><tbody>${dt || '<tr><td colspan="5">Không có.</td></tr>'}</tbody></table></div>
    </section>`;
  }

  function compare() {
    const rows = R.contracts.map(c => {
      const ok = c.diffTotal === 0 && c.onlyNew === 0 && c.onlyLeg === 0 && c.detailMismatch === 0 && !c.errors.length;
      return `<tr class="click" data-open="${esc(c.id)}" data-tab-to="compare">
        <td><b>${esc(c.id)}</b></td><td class="r">${c.legacyCount}</td><td class="r">${c.newCount}</td>
        <td class="r ok">${c.same}</td><td class="r ${c.diffTotal ? 'warn' : ''}">${c.diffTotal}</td>
        <td class="r ${c.onlyLeg ? 'warn' : ''}">${c.onlyLeg}</td><td class="r ${c.onlyNew ? 'warn' : ''}">${c.onlyNew}</td>
        <td class="r ${c.detailMismatch ? 'bad' : ''}">${c.detailMismatch}</td>
        <td class="r">${money(c.legacyTotal)}</td><td class="r">${money(c.newTotal)}</td><td>${ok ? '<span class="tag ok">Khớp</span>' : '<span class="tag warn">Có khác biệt</span>'}</td></tr>`;
    }).join('');
    const diffs = R.contracts.filter(c => c.rows.length).map(c => `<h3>${esc(c.id)} — chi tiết khác biệt</h3>
      <div class="scroll"><table><thead><tr><th>Loại</th><th>Từ</th><th>Đến (cũ)</th><th>Đến (mới)</th><th class="r">Tổng cũ</th><th class="r">Tổng mới</th><th class="r">Chênh</th></tr></thead><tbody>
      ${c.rows.map(r => `<tr><td><span class="tag ${r.kind === 'chỉ cũ' ? 'bad' : (r.kind === 'chỉ mới' ? 'mid' : 'warn')}">${esc(r.kind)}</span></td><td>${fdate(r.from)}</td><td>${fdate(r.legTo)}</td><td>${fdate(r.to)}</td><td class="r">${money(r.legTotal)}</td><td class="r">${money(r.newTotal)}</td><td class="r"><b>${money(r.diff)}</b></td></tr>`).join('')}
      </tbody></table></div>`).join('');
    return `<section><h2>Đối chiếu dữ liệu cũ và tính lại</h2>
      <p class="note">Kỳ được ghép theo "Từ ngày". "Chênh" = tổng mới − tổng cũ. Làm tròn ≤ ${R.TOL_MONEY} đ được coi là khớp.</p>
      <div class="scroll"><table><thead><tr><th>Mã HĐ</th><th class="r">Kỳ cũ</th><th class="r">Kỳ mới</th><th class="r">Khớp</th><th class="r">Lệch</th><th class="r">Chỉ cũ</th><th class="r">Chỉ mới</th><th class="r">Chi tiết lệch</th><th class="r">Tổng cũ</th><th class="r">Tổng mới</th><th></th></tr></thead><tbody>${rows}</tbody></table></div>
      ${diffs || '<p class="note">Không có khác biệt.</p>'}
    </section>`;
  }

  function payments() {
    const stFilter = window.__payFilter || '';
    const list = R.payment.filter(p => !stFilter || p.newStatus === stFilter);
    const statuses = [...new Set(R.payment.map(p => p.newStatus))];
    const rows = list.slice(0, 400).map(p => `<tr><td>${esc(p.periodId)}</td><td>${esc(p.contract)}</td><td>${fdate(p.from)} – ${fdate(p.to)}</td><td>${fdate(p.due)}</td>
      <td class="r">${money(p.total)}</td><td><span class="tag">${esc(p.legacyStatus)}</span></td><td class="r">${money(p.legacyPaid)}</td>
      <td class="r">${money(p.verifiedPaid)}</td><td class="r"><b>${money(p.outstanding)}</b></td><td><span class="tag ${p.newStatus.startsWith('Đã thu') ? 'ok' : (p.newStatus === 'Quá hạn' ? 'bad' : 'mid')}">${esc(p.newStatus)}</span></td></tr>`).join('');
    return `<section><h2>Thanh toán: cũ và đã kiểm chứng</h2>
      <p class="note">Mục "Đã thu" chỉ tính các giao dịch có Số chứng từ. Giao dịch không có chứng từ được ghi nhận riêng, không được coi là tiền đã thu.</p>
      <div class="filter"><label>Trạng thái mới: <select id="payFilter"><option value="">Tất cả</option>${statuses.map(s => `<option ${s === stFilter ? 'selected' : ''}>${esc(s)}</option>`).join('')}</select></label>
      <span class="note">${list.length} kỳ${list.length > 400 ? ' (hiển thị 400 dòng đầu)' : ''}</span></div>
      <div class="scroll"><table><thead><tr><th>Kỳ</th><th>HĐ</th><th>Khoảng</th><th>Đến hạn</th><th class="r">Tổng kỳ</th><th>Trạng thái cũ</th><th class="r">Đã ghi (cũ)</th><th class="r">Có chứng từ</th><th class="r">Còn phải thu</th><th>Trạng thái mới</th></tr></thead><tbody>${rows}</tbody></table></div></section>`;
  }

  function issues() {
    const sel = window.__sevFilter || '';
    const list = R.issues.filter(i => !sel || i.sev === sel);
    const rows = list.map(i => `<tr><td>${esc(i.code)}</td><td><span class="tag ${sevClass(i.sev)}">${esc(i.sev)}</span></td><td>${esc(i.sheet)}</td><td>${esc(i.key)}</td><td>${esc(i.message)}</td><td>${esc(i.fix)}</td></tr>`).join('');
    return `<section><h2>Kiểm tra dữ liệu</h2>
      <div class="filter"><label>Mức độ: <select id="sevFilter"><option value="">Tất cả</option>${['Nghiêm trọng', 'Cao', 'Trung bình', 'Thấp', 'Thông tin'].map(s => `<option ${s === sel ? 'selected' : ''}>${s}</option>`).join('')}</select></label>
      <button id="exportIssues">Xuất CSV vấn đề</button><button id="exportCompare">Xuất CSV đối chiếu</button></div>
      <div class="scroll"><table><thead><tr><th>Mã</th><th>Mức độ</th><th>Sheet</th><th>Khóa / dòng</th><th>Mô tả</th><th>Đề xuất</th></tr></thead><tbody>${rows}</tbody></table></div></section>`;
  }

  function csv(name, header, rows) {
    const body = [header, ...rows].map(r => r.map(v => `"${String(v === null || v === undefined ? '' : v).replace(/"/g, '""')}"`).join(',')).join('\r\n');
    const blob = new Blob(['﻿' + body], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; a.click();
  }

  function render() {
    const body = { overview, contracts, compare, payments, issues }[current]();
    app.innerHTML = `<header><h1>QL-HD-THUE v5</h1><span class="sub">Tính lại từ dữ liệu cũ · chỉ đọc</span></header>${nav()}<main>${body}</main>`;
  }

  app.addEventListener('click', e => {
    const t = e.target.closest('[data-tab]');
    if (t) { current = t.dataset.tab; detailId = null; render(); return; }
    const o = e.target.closest('[data-open]');
    if (o) { current = 'contracts'; detailId = o.dataset.open; render(); return; }
    if (e.target.closest('[data-back]')) { detailId = null; render(); return; }
    if (e.target.id === 'exportIssues') return csv('vi-pham-du-lieu.csv', ['Mã', 'Mức độ', 'Sheet', 'Khóa', 'Mô tả', 'Đề xuất'], R.issues.map(i => [i.code, i.sev, i.sheet, i.key, i.message, i.fix]));
    if (e.target.id === 'exportCompare') return csv('doi-chieu-ky.csv', ['Mã HĐ', 'Loại', 'Từ', 'Đến cũ', 'Đến mới', 'Tổng cũ', 'Tổng mới', 'Chênh'],
      R.contracts.flatMap(c => c.rows.map(r => [c.id, r.kind, r.from, r.legTo || '', r.to || '', r.legTotal ?? '', r.newTotal ?? '', r.diff])));
  });
  app.addEventListener('change', e => {
    if (e.target.id === 'payFilter') { window.__payFilter = e.target.value; render(); }
    if (e.target.id === 'sevFilter') { window.__sevFilter = e.target.value; render(); }
  });
  render();
})();
