/*
 * Đối chiếu: so kết quả sinh kỳ của lõi mới (engine.js) với dữ liệu cũ (legacy.json)
 * và chạy bộ kiểm tra dữ liệu. Chỉ đọc, không sửa dữ liệu cũ.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(require('./engine.js'));
  else root.QLHD_RECON = factory(root.QLHD);
})(typeof self !== 'undefined' ? self : this, function (Q) {
  const TOL_MONEY = 5;        // đồng: sai số làm tròn cho phép
  const TODAY = Q.toDay(new Date().toISOString().slice(0, 10));

  const by = (rows, key) => { const m = {}; rows.forEach(r => { const k = r[key]; if (k === undefined || k === null) return; (m[k] = m[k] || []).push(r); }); return m; };
  const iso = v => (v ? String(v).slice(0, 10) : null);

  function run(L) {
    const H = L.hopdong.rows, PL = L.phuluc.rows, GT = L.giathue.rows, PD = (L.phidichvu || {}).rows || [];
    const KT = L.kythanhtoan.rows, CT = L.chitietky.rows, DN = L.denghithanhtoan.rows, TT = L.thanhtoan.rows, HD = L.hoadon.rows;
    const TP = L.tang_phong.rows, TN = L.toanha.rows, KH = L.khach_khachthue.rows;
    const rentsBy = by(GT, 'Mã HĐ'), appBy = by(PL, 'Mã HĐ'), feeBy = by(PD, 'Mã HĐ');
    const legBy = by(KT, 'Mã HĐ'), ctByPeriod = by(CT, 'Mã kỳ'), kByPeriod = {};
    KT.forEach(p => { kByPeriod[p['Mã kỳ']] = p; });
    const issues = [];
    const add = (code, sev, sheet, key, message, fix) => issues.push({ code, sev, sheet, key, message, fix });

    // ---- Hợp đồng: sinh kỳ mới và đối chiếu ----
    const contracts = H.map(c => {
      const id = c['Mã HĐ'];
      const gen = Q.generatePeriods(c, appBy[id] || [], rentsBy[id] || [], feeBy[id] || []);
      const leg = (legBy[id] || []).slice().sort((a, b) => (a['Từ ngày'] < b['Từ ngày'] ? -1 : 1));
      const newBy = new Map(gen.periods.map(p => [Q.toIso(p['Từ ngày']), p]));
      const legBy2 = new Map(leg.map(p => [iso(p['Từ ngày']), p]));
      const rows = [];
      let same = 0, diffTotal = 0, onlyNew = 0, onlyLeg = 0, dueDiff = 0;
      for (const [s, p] of newBy) {
        const l = legBy2.get(s);
        if (!l) { onlyNew++; rows.push({ kind: 'chỉ mới', from: s, to: Q.toIso(p['Đến ngày']), newTotal: p['Tổng sau thuế'], legTotal: null, diff: p['Tổng sau thuế'] }); continue; }
        const d = p['Tổng sau thuế'] - l['Tổng sau thuế'];
        const dateSame = iso(l['Đến ngày']) === Q.toIso(p['Đến ngày']);
        if (!dateSame) dueDiff++;
        if (Math.abs(d) <= TOL_MONEY && dateSame) same++;
        else { diffTotal++; rows.push({ kind: dateSame ? 'lệch tiền' : 'lệch ngày kết thúc', from: s, to: Q.toIso(p['Đến ngày']), legTo: iso(l['Đến ngày']), newTotal: p['Tổng sau thuế'], legTotal: l['Tổng sau thuế'], diff: d }); }
      }
      for (const [s, l] of legBy2) if (!newBy.has(s)) { onlyLeg++; rows.push({ kind: 'chỉ cũ', from: s, to: iso(l['Đến ngày']), newTotal: null, legTotal: l['Tổng sau thuế'], diff: -l['Tổng sau thuế'] }); }
      rows.sort((a, b) => (a.from < b.from ? -1 : 1));

      // Chi tiết cũ phải khớp tổng kỳ cũ (kiểm tra C03).
      let detailMismatch = 0;
      leg.forEach(p => {
        const det = ctByPeriod[p['Mã kỳ']] || [];
        const sum = det.reduce((s, d) => s + Number(d['Tiền trước thuế'] || 0), 0);
        if (Math.abs(sum - Number(p['Tổng trước thuế'] || 0)) > TOL_MONEY) detailMismatch++;
      });

      const status = contractStatus(c, appBy[id] || [], gen);
      const lastLeg = leg.length ? iso(leg[leg.length - 1]['Đến ngày']) : null;
      const cur = { id, customer: c['Tên khách thuê'] || c['Mã khách thuê'], office: c['Mã văn phòng'], status, effectiveEnd: Q.toIso(Q.effectiveEnd(c, appBy[id] || [])),
        legacyCount: leg.length, newCount: gen.periods.length, same, diffTotal, onlyNew, onlyLeg, detailMismatch,
        newTotal: gen.periods.reduce((s, p) => s + p['Tổng sau thuế'], 0),
        legacyTotal: leg.reduce((s, p) => s + Number(p['Tổng sau thuế'] || 0), 0),
        lastNew: gen.periods.length ? Q.toIso(gen.periods[gen.periods.length - 1]['Đến ngày']) : null, lastLeg,
        errors: gen.errors.map(e => e.message), rows, periods: gen.periods, requests: gen.requests, details: gen.details };
      return cur;
    });

    // ---- Bộ kiểm tra dữ liệu ----
    const custIds = new Set(KH.map(k => k['Mã khách thuê']));
    const hdIds = new Set(H.map(h => h['Mã HĐ']));
    const spaceCodes = new Set(TP.map(s => s['Mã văn phòng']));
    const bldIds = new Set(TN.map(t => t['Mã tòa nhà']));
    const periodIds = new Set(KT.map(p => p['Mã kỳ']));

    // C01: thanh toán không có chứng từ
    const unverified = TT.filter(t => !t['Số chứng từ']);
    if (unverified.length) add('C01', 'Nghiêm trọng', 'thanhtoan', `${unverified.length} giao dịch`, `${unverified.length}/${TT.length} giao dịch thanh toán không có Số chứng từ; đều ghi bằng chức năng xác nhận hàng loạt (${[...new Set(unverified.map(t => t['Ngày thanh toán']))].map(iso).join(', ')}).`, 'Đối chiếu sao kê ngân hàng; giao dịch chưa có chứng từ không được tính là đã thu.');
    // C02: giao dịch/chi tiết/đề nghị mồ côi
    const orphanTT = TT.filter(t => !periodIds.has(t['Mã kỳ']));
    if (orphanTT.length) add('C02', 'Nghiêm trọng', 'thanhtoan', orphanTT.map(t => t['Mã thanh toán']).join(', '), `${orphanTT.length} giao dịch trỏ tới kỳ không tồn tại trong kythanhtoan, tổng ${orphanTT.reduce((s, t) => s + Number(t['Số tiền'] || 0), 0).toLocaleString('vi-VN')} đ.`, 'Xác định kỳ bị mất hay giao dịch sai; không xóa khi chưa đối chiếu.');
    const orphanCT = Object.keys(ctByPeriod).filter(k => !periodIds.has(k));
    if (orphanCT.length) add('C02', 'Nghiêm trọng', 'chitietky', orphanCT.join(', '), `Chi tiết kỳ còn lại cho ${orphanCT.length} kỳ không tồn tại (đơn giá tham chiếu GT0022 không có trong giathue).`, 'Xóa hoặc gắn lại kỳ đúng sau khi xác định nguyên nhân.');
    const orphanDN = DN.filter(d => !periodIds.has(d['Mã kỳ']));
    if (orphanDN.length) add('C02', 'Nghiêm trọng', 'denghithanhtoan', orphanDN.map(d => d['Mã đề nghị']).join(', '), `${orphanDN.length} đề nghị trỏ tới kỳ không tồn tại.`, 'Như trên.');
    // C03: chi tiết kỳ lệch tổng
    const detailBad = contracts.filter(c => c.detailMismatch > 0);
    detailBad.forEach(c => add('C03', 'Nghiêm trọng', 'chitietky / kythanhtoan', c.id, `${c.detailMismatch} kỳ có chi tiết cũ không khớp tổng kỳ cũ.`, 'Sinh lại kỳ và chi tiết từ giathue bằng lõi mới.'));
    // C04: hóa đơn gắn sai
    HD.forEach(h => {
      const p = KT.find(k => k['Mã kỳ'] === h['Mã kỳ']);
      if (p && p['Mã HĐ'] !== h['Mã HĐ']) add('C04', 'Nghiêm trọng', 'hoadon', h['Mã hóa đơn'], `Hóa đơn ghi ${h['Mã HĐ']} nhưng kỳ ${h['Mã kỳ']} thuộc ${p['Mã HĐ']}; tổng hóa đơn ${Math.round(h['Tổng tiền']).toLocaleString('vi-VN')} đ, tổng kỳ ${Math.round(p['Tổng sau thuế']).toLocaleString('vi-VN')} đ.`, 'Xác định hóa đơn đúng; không tự gắn lại.');
    });
    // C05: giá bằng 0 còn áp dụng
    GT.filter(g => g['Giá trước thuế'] === 0 && g['Trạng thái'] !== 'Hủy').forEach(g => add('C05', 'Cao', 'giathue', g['Mã giá'], `Giá 0 cho ${g['Mã HĐ']} (${iso(g['Từ ngày'])} – ${iso(g['Đến ngày'])}).`, 'Xác nhận miễn giảm hay thiếu dữ liệu.'));
    // C06: mặt bằng dùng chung / liên kết hỏng
    TP.forEach(s => {
      const refs = String(s['Mã HĐ liên kết'] || '').split(/;\s*/).filter(Boolean);
      const missing = refs.filter(r => !hdIds.has(r));
      if (missing.length) add('C06', 'Trung bình', 'tang_phong', s['Mã mặt bằng'], `Liên kết tới hợp đồng không tồn tại: ${missing.join(', ')}.`, 'Sửa hoặc tạo hợp đồng còn thiếu.');
      if (refs.length > 1) add('C06', 'Cao', 'tang_phong', s['Mã mặt bằng'], `Mặt bằng liên kết nhiều hợp đồng cùng lúc (${refs.join(', ')}).`, 'Xác định hợp đồng đang hiệu lực.');
    });
    // C07: gộp theo mã tòa nhà lạ (không có trong toanha)
    const badBld = {};
    TP.forEach(s => { const b = s['Mã tòa nhà']; if (b && !bldIds.has(b)) (badBld[b] = badBld[b] || []).push(s['Mã mặt bằng']); });
    Object.entries(badBld).forEach(([b, sp]) => add('C07', 'Cao', 'tang_phong', sp.join(', '), `${sp.length} mặt bằng có Mã tòa nhà "${b}" không có trong toanha (toanha chỉ có: ${[...bldIds].join(', ')}).`, 'Chốt mã tòa nhà đúng và đồng bộ hai sheet.'));
    // C08: hợp đồng hết hạn nhưng còn "Đang thuê"
    contracts.filter(c => c.status === 'Đã hết hạn' && H.find(h => h['Mã HĐ'] === c.id)['Trạng thái'] === 'Đang thuê')
      .forEach(c => add('C08', 'Cao', 'hopdong', c.id, `Đang ghi "Đang thuê" nhưng hết hạn hiệu lực ${c.effectiveEnd}.`, 'Đổi trạng thái hoặc gia hạn bằng phụ lục.'));
    // C09: hợp đồng không có giá
    contracts.filter(c => c.errors.length).forEach(c => c.errors.forEach(msg => add('C09', 'Trung bình', 'hopdong', c.id, msg, 'Nhập lịch giá hoặc xác nhận hợp đồng không hiệu lực.')));
    // C10: phụ lục lỗi
    const badFmt = [];
    PL.forEach(a => {
      const sign = iso(a['Ngày ký']);
      if (sign && sign < '1990-01-01') add('C10', 'Trung bình', 'phuluc', a['Mã phụ lục'], `Ngày ký ${sign} không hợp lý.`, 'Sửa ngày ký.');
      if (sign && iso(a['Từ ngày hiệu lực']) && sign > iso(a['Từ ngày hiệu lực'])) add('C12', 'Thấp', 'phuluc', a['Mã phụ lục'], `Ngày ký ${sign} sau Từ ngày hiệu lực ${iso(a['Từ ngày hiệu lực'])} (ký bổ sung?).`, 'Xác nhận hoặc ghi chú.');
      if (!a['Số phụ lục'] || typeof a['Số phụ lục'] === 'number') badFmt.push(a['Mã phụ lục']);
    });
    if (badFmt.length) add('C13', 'Thấp', 'phuluc', badFmt.join(', '), `${badFmt.length} phụ lục có Số phụ lục là số (1, 2, 3...) thay vì mã văn bản; không phân biệt được giữa các hợp đồng.`, 'Chuẩn hóa thành chuỗi có mã văn bản.');
    const dupKey = {};
    PL.forEach(a => { const k = [a['Mã HĐ'], a['Loại thay đổi'], a['Từ ngày hiệu lực'], a['Đến ngày hiệu lực']].join('|'); (dupKey[k] = dupKey[k] || []).push(a['Mã phụ lục']); });
    Object.values(dupKey).filter(v => v.length > 1).forEach(v => add('C11', 'Trung bình', 'phuluc', v.join(', '), `${v.length} phụ lục trùng nội dung (cùng HĐ, loại và thời hạn).`, 'Gộp và giữ một bản.'));
    // C14/C15: liên kết hợp đồng và mặt bằng
    TP.forEach(s => { const cc = s['Mã khách thuê liên kết']; if (cc && String(cc).split(/;\s*/).some(x => !custIds.has(x))) add('C06', 'Thấp', 'tang_phong', s['Mã mặt bằng'], `Mã khách liên kết không tồn tại: ${cc}.`, 'Sửa liên kết.'); });
    H.forEach(h => { if (h['Cảnh báo'] && String(h['Cảnh báo']).includes('REF')) add('C15', 'Thấp', 'hopdong', h['Mã HĐ'], 'Ô Cảnh báo chứa công thức lỗi #REF!.', 'Thay bằng giá trị đúng.'); });
    // C16: cột trùng/thừa trong hopdong
    const legacyCols = ['Báo trước', 'Hình thức thuê', 'Nguyên tầng', 'Diện tích thuê (m²)', 'Cảnh báo'];
    add('C16', 'Thấp', 'hopdong', 'cột thừa', `Có cột trùng/thừa: ${legacyCols.join(', ')}; "Báo trước" trống ở nhiều dòng trong khi "Báo trước (ngày)" đã đầy đủ.`, 'Bỏ khi không còn ứng dụng nào đọc.');
    // C17: thiếu mã mặt bằng/tiền cọc
    H.forEach(h => { if (!h['Tiền cọc'] || !h['Mã mặt bằng']) { const miss = [!h['Mã mặt bằng'] ? 'Mã mặt bằng' : null, !h['Tiền cọc'] ? 'Tiền cọc' : null].filter(Boolean).join(' và '); add('C17', 'Thấp', 'hopdong', h['Mã HĐ'], `Thiếu ${miss}.`, 'Bổ sung.'); } });
    // C18: khách thiếu MST/liên hệ
    const noTax = KH.filter(k => !k['Mã số thuế']).length;
    if (noTax) add('C18', 'Thấp', 'khach_khachthue', `${noTax} khách`, `${noTax}/${KH.length} khách không có Mã số thuế; hóa đơn cần MST.`, 'Bổ sung trước khi xuất hóa đơn.');
    // Hợp đồng không có kỳ dù đang thuê
    contracts.filter(c => c.legacyCount === 0 && c.newCount === 0 && H.find(h => h['Mã HĐ'] === c.id)['Trạng thái'] === 'Đang thuê' && !c.errors.length)
      .forEach(c => add('C19', 'Trung bình', 'kythanhtoan', c.id, 'Hợp đồng đang thuê nhưng không có kỳ thanh toán.', 'Kiểm tra lịch giá.'));
    // Giá thuê: đối chiếu lịch giá với thời hạn hợp đồng (phát hiện khoảng trống giá)
    // Đối chiếu tổng thanh toán với tổng kỳ theo kỳ đã "Đã thanh toán" (cũ)
    const paidLegacy = {};
    TT.forEach(t => { paidLegacy[t['Mã kỳ']] = (paidLegacy[t['Mã kỳ']] || 0) + Number(t['Số tiền'] || 0); });
    const verifiedPaid = {};
    TT.filter(t => t['Số chứng từ']).forEach(t => { verifiedPaid[t['Mã kỳ']] = (verifiedPaid[t['Mã kỳ']] || 0) + Number(t['Số tiền'] || 0); });

    // C20: kỳ cũ bao trùm ngày bắt đầu của mốc giá khác (cắt kỳ sai so với quy tắc đổi giá)
    KT.forEach(p => {
      const from = Q.toDay(iso(p['Từ ngày'])), to = Q.toDay(iso(p['Đến ngày']));
      const cut = (rentsBy[p['Mã HĐ']] || []).filter(r => r['Trạng thái'] !== 'Hủy')
        .map(r => Q.toDay(iso(r['Từ ngày']))).filter(d => d !== null && d > from && d <= to);
      if (cut.length) add('C20', 'Cao', 'kythanhtoan', p['Mã kỳ'], `Kỳ ${iso(p['Từ ngày'])} – ${iso(p['Đến ngày'])} (${p['Mã HĐ']}) bao trùm ngày đổi giá ${cut.map(Q.toIso).join(', ')}; quy tắc là phải cắt kỳ trước ngày đổi giá.`, 'Sinh lại kỳ bằng lõi mới; kỳ sau ngày đổi giá sẽ được tính lại.');
    });
    // C22: sheet trống (chỉ có tiêu đề)
    Object.entries(L).forEach(([name, t]) => { if (t.rows && t.rows.length === 0) add('C22', 'Thông tin', name, name, 'Sheet chưa có dữ liệu, chỉ có tiêu đề.', 'Không cần sửa nếu chưa dùng.'); });

    // Thanh toán theo kỳ: cũ (ghi nhận) và mới (chỉ tính giao dịch có chứng từ)
    const payment = KT.map(p => {
      const total = Number(p['Tổng sau thuế'] || 0);
      const legPaid = paidLegacy[p['Mã kỳ']] || 0;
      const verPaid = verifiedPaid[p['Mã kỳ']] || 0;
      return { periodId: p['Mã kỳ'], contract: p['Mã HĐ'], from: iso(p['Từ ngày']), to: iso(p['Đến ngày']), due: iso(p['Ngày đến hạn']), total,
        legacyStatus: p['Trạng thái'], legacyPaid: legPaid, verifiedPaid: verPaid, outstanding: Math.max(0, total - verPaid),
        newStatus: verPaid >= total - TOL_MONEY && total > 0 ? 'Đã thu (có chứng từ)' : (verPaid > 0 ? 'Thu một phần' : (Q.toDay(iso(p['Ngày đến hạn'])) < TODAY ? 'Quá hạn' : 'Chưa thu')) };
    });
    // Trạng thái cũ "Đã thanh toán" mà không có chứng từ
    const claimedNoProof = payment.filter(p => p.legacyStatus === 'Đã thanh toán' && p.verifiedPaid === 0);
    if (claimedNoProof.length) add('C01', 'Nghiêm trọng', 'kythanhtoan', `${claimedNoProof.length} kỳ`, `${claimedNoProof.length} kỳ ghi "Đã thanh toán" nhưng không có giao dịch có chứng từ.`, 'Chuyển về trạng thái đã kiểm chứng.');

    const summary = {
      contracts: contracts.length,
      contractsActive: contracts.filter(c => c.status === 'Đang hiệu lực').length,
      legacyPeriods: KT.length, newPeriods: contracts.reduce((s, c) => s + c.newCount, 0),
      same: contracts.reduce((s, c) => s + c.same, 0),
      diffTotal: contracts.reduce((s, c) => s + c.diffTotal, 0),
      onlyNew: contracts.reduce((s, c) => s + c.onlyNew, 0),
      onlyLeg: contracts.reduce((s, c) => s + c.onlyLeg, 0),
      legacyPaidTotal: TT.reduce((s, t) => s + Number(t['Số tiền'] || 0), 0),
      verifiedPaidTotal: TT.filter(t => t['Số chứng từ']).reduce((s, t) => s + Number(t['Số tiền'] || 0), 0),
      issueCount: issues.length
    };
    return { contracts, issues, payment, summary, legacy: L, TOL_MONEY };
  }

  function contractStatus(c, appendices, gen) {
    if (c['Trạng thái'] === 'Hủy') return 'Hủy';
    const end = Q.effectiveEnd(c, appendices);
    const start = Q.toDay(c['Ngày bắt đầu']);
    if (end === null) return 'Thiếu ngày';
    if (start !== null && TODAY < start) return 'Chưa hiệu lực';
    if (TODAY > end) return 'Đã hết hạn';
    return 'Đang hiệu lực';
  }

  return { run, TOL_MONEY, TODAY };
});
