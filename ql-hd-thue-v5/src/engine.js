/*
 * QL-HD-THUE v5 — lõi tính toán (không phụ thuộc trình duyệt).
 * Dùng chung cho app (trình duyệt) và kiểm thử (Node).
 *
 * Quy ước:
 *  - Ngày được biểu diễn bằng "số ngày" tính từ 1970-01-01 (UTC) để tránh lệch múi giờ.
 *  - Tiền là số đồng nguyên, thuế suất là tỷ lệ (0.1 = 10%).
 *  - Mọi hàm đều thuần (không ghi dữ liệu nguồn).
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.QLHD = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  const DAY = 86400000;

  // ---------- Ngày ----------
  function toDay(iso) {
    if (iso === null || iso === undefined || iso === '') return null;
    const m = String(iso).match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (!m) return null;
    const t = Date.UTC(+m[1], +m[2] - 1, +m[3]);
    return Number.isFinite(t) ? t / DAY : null;
  }
  function toIso(day) {
    if (day === null || day === undefined) return null;
    const d = new Date(day * DAY);
    return d.toISOString().slice(0, 10);
  }
  function ymd(day) {
    const d = new Date(day * DAY);
    return { y: d.getUTCFullYear(), m: d.getUTCMonth(), d: d.getUTCDate() };
  }
  function daysInMonth(y, m) { return new Date(Date.UTC(y, m + 1, 0)).getUTCDate(); }
  function mk(y, m, d) { return Date.UTC(y, m, d) / DAY; }
  function addMonthsSafe(day, months) {
    const { y, m, d } = ymd(day);
    const first = new Date(Date.UTC(y, m + months, 1));
    const ny = first.getUTCFullYear(), nm = first.getUTCMonth();
    return mk(ny, nm, Math.min(d, daysInMonth(ny, nm)));
  }
  // Ngày đến hạn trong tháng của periodStart, không sớm hơn periodStart.
  function dueDateFor(dueDay, periodStart) {
    const { y, m } = ymd(periodStart);
    let due = mk(y, m, Math.min(dueDay, daysInMonth(y, m)));
    if (due < periodStart) {
      const nd = new Date(Date.UTC(y, m + 1, 1));
      const ny = nd.getUTCFullYear(), nm = nd.getUTCMonth();
      due = mk(ny, nm, Math.min(dueDay, daysInMonth(ny, nm)));
    }
    return due;
  }
  function monthFraction(start, end) {
    let cur = start, total = 0;
    while (cur <= end) {
      const { y, m } = ymd(cur);
      const dim = daysInMonth(y, m);
      const monthEnd = mk(y, m, dim);
      const segEnd = monthEnd < end ? monthEnd : end;
      total += (segEnd - cur + 1) / dim;
      cur = segEnd + 1;
    }
    return Math.round(total * 1e6) / 1e6;
  }

  // ---------- Chuẩn hóa ----------
  function num(v) {
    if (typeof v === 'number') return Number.isFinite(v) ? v : 0;
    if (v === null || v === undefined || v === '') return 0;
    const n = Number(String(v).replace(/\s/g, '').replace(/\./g, '').replace(',', '.'));
    return Number.isFinite(n) ? n : 0;
  }
  function taxRate(v) {
    if (v === null || v === undefined || v === '') return 0.1;
    let r = Number(v);
    if (!Number.isFinite(r)) return 0.1;
    if (r > 1) r /= 100;
    return r;
  }
  function cycleMonths(v) {
    const m = String(v || '').match(/[1-6]/);
    return m ? Number(m[0]) : 3;
  }
  function noticeDays(v) {
    const n = Number(v);
    return Number.isFinite(n) && v !== '' && v !== null ? Math.round(n) : 15;
  }

  // ---------- Hiệu lực hợp đồng ----------
  // Hạn hiệu lực = max(Ngày kết thúc gốc, Đến ngày của mọi phụ lục "Gia hạn hợp đồng" chưa hủy).
  // Không phụ thuộc ngày hôm nay, nên sinh kỳ có thể tái lập.
  function effectiveEnd(contract, appendices) {
    let end = toDay(contract['Ngày kết thúc']);
    (appendices || []).forEach(a => {
      if (a['Loại thay đổi'] !== 'Gia hạn hợp đồng') return;
      if (a['Trạng thái'] === 'Hủy') return;
      const to = toDay(a['Đến ngày hiệu lực']);
      if (to !== null && (end === null || to > end)) end = to;
    });
    return end;
  }

  // ---------- Sinh kỳ ----------
  function paymentPeriodWindow(contract, periodStart, cycle, rents) {
    const dueDay = contract._dueDay || ymd(periodStart).d;
    const anchors = (rents || []).filter(r => r._from !== null && r._from <= periodStart &&
      (r['Nguồn giá'] === 'Phụ lục' || r['Mã phụ lục'])).map(r => r._from).sort((a, b) => b - a);
    const inAppendixCycle = anchors.length > 0;
    const aligned = ymd(periodStart).d === dueDay;
    const nextDue = dueDateFor(dueDay, periodStart);
    // Kỳ đầu lệch: kết thúc ngay trước ngày đến hạn kế tiếp.
    const end = (inAppendixCycle || aligned)
      ? addMonthsSafe(periodStart, cycle) - 1
      : (nextDue > periodStart ? nextDue - 1 : addMonthsSafe(periodStart, cycle) - 1);
    const dueDate = inAppendixCycle ? periodStart : dueDateFor(dueDay, periodStart);
    return { end, dueDate };
  }

  function earliestBoundary(rows, periodStart, proposedEnd) {
    let end = proposedEnd;
    rows.forEach(r => {
      const from = r._from;
      if (from === null || from <= periodStart || from > proposedEnd) return;
      if (from - 1 < end) end = from - 1;
    });
    return end;
  }

  function buildDetails(rows, contractId, pStart, pEnd, type, cycle) {
    const out = [];
    rows.forEach(r => {
      const from = r._from !== null ? r._from : pStart;
      const to = r._to !== null ? r._to : pEnd;
      const start = Math.max(from, pStart);
      const end = Math.min(to, pEnd);
      if (start > end) return;
      const full = cycle && start === pStart && end === pEnd && end === addMonthsSafe(pStart, cycle) - 1;
      const factor = full ? cycle : monthFraction(start, end);
      out.push({
        'Mã HĐ': contractId, 'Loại': type,
        'Từ ngày': start, 'Đến ngày': end,
        'Số tháng': factor, 'Số ngày': end - start + 1,
        'Đơn giá trước thuế': r._price, 'Thuế suất': r._tax,
        'Mã nguồn': r._id, 'Ghi chú': type === 'Phí dịch vụ' ? (r['Loại phí'] || '') : ''
      });
    });
    return out;
  }

  function covered(details, pStart, pEnd) {
    if (!details.length) return false;
    const ranges = details.map(d => [d['Từ ngày'], d['Đến ngày']]).sort((a, b) => a[0] - b[0]);
    let cursor = pStart;
    for (const [f, t] of ranges) {
      if (f > cursor) return false;
      if (t >= cursor) cursor = t + 1;
      if (cursor > pEnd) return true;
    }
    return cursor > pEnd;
  }

  function sumDetails(details) {
    return details.reduce((s, d) => {
      const before = d['Đơn giá trước thuế'] * d['Số tháng'];
      const tax = before * d['Thuế suất'];
      s.before += before; s.tax += tax; s.after += before + tax;
      return s;
    }, { before: 0, tax: 0, after: 0 });
  }

  // Chuẩn hóa dòng giá/phí đầu vào: thêm _from, _to, _price, _tax, _id.
  function prepRows(rows, priceField, idField) {
    return rows.map(r => ({
      ...r,
      _from: toDay(r['Từ ngày']),
      _to: toDay(r['Đến ngày']),
      _price: num(r[priceField]),
      _tax: taxRate(r['Thuế suất']),
      _id: r[idField] || ''
    }));
  }

  /**
   * Sinh kỳ thanh toán cho một hợp đồng.
   * @param contract  bản ghi hopdong (chuỗi ISO)
   * @param appendices phụ lục của hợp đồng
   * @param rents     giá thuê (giathue) của hợp đồng
   * @param fees      phí dịch vụ của hợp đồng
   * @returns {periods, details, requests, errors}
   */
  function generatePeriods(contract, appendices, rents, fees) {
    const id = contract['Mã HĐ'];
    const errors = [];
    const start = toDay(contract['Ngày bắt đầu']);
    const end = effectiveEnd(contract, appendices);
    if (start === null || end === null) {
      return { periods: [], details: [], requests: [], errors: [{ type: 'thiếu-ngày', message: 'Hợp đồng thiếu Ngày bắt đầu hoặc Ngày kết thúc.' }] };
    }
    if (end < start) {
      return { periods: [], details: [], requests: [], errors: [{ type: 'ngày-sai', message: 'Ngày kết thúc trước Ngày bắt đầu.' }] };
    }
    const activeRents = prepRows(rents.filter(r => r['Trạng thái'] !== 'Hủy'), 'Giá trước thuế', 'Mã giá');
    const activeFees = prepRows(fees.filter(r => r['Trạng thái'] !== 'Hủy'), 'Đơn giá trước thuế', 'Mã phí');
    if (!activeRents.length) {
      return { periods: [], details: [], requests: [], errors: [{ type: 'thiếu-giá', message: 'Hợp đồng chưa có giá thuê đang áp dụng.' }] };
    }
    const cycle = cycleMonths(contract['Chu kỳ thanh toán (tháng)']);
    const dueDay = contract['Ngày đến hạn'] ? ymd(toDay(contract['Ngày đến hạn'])).d : null;
    const ctx = { ...contract, _dueDay: dueDay };

    const periods = [];
    const details = [];
    let pStart = start;
    let no = 1;
    // Ngày kết thúc là ngày cuối cùng được tính tiền (bao gồm), nên vòng lặp chạy khi còn ít nhất một ngày.
    while (no <= 240 && pStart <= end) {
      const win = paymentPeriodWindow(ctx, pStart, cycle, activeRents);
      const nominal = earliestBoundary(activeRents.concat(activeFees), pStart, win.end);
      let pEnd = nominal > end ? end : nominal;
      const rentD = buildDetails(activeRents, id, pStart, pEnd, 'Tiền thuê', cycle);
      const feeD = buildDetails(activeFees, id, pStart, pEnd, 'Phí dịch vụ', cycle);
      if (!covered(rentD, pStart, pEnd)) {
        errors.push({ type: 'thiếu-phủ-giá', message: `Lịch giá chưa phủ kỳ ${toIso(pStart)} – ${toIso(pEnd)}.` });
        break;
      }
      const rt = sumDetails(rentD), ft = sumDetails(feeD);
      periods.push({
        'Mã HĐ': id, 'Kỳ số': no,
        'Từ ngày': pStart, 'Đến ngày': pEnd, 'Ngày đến hạn': win.dueDate,
        'Tiền thuê trước thuế': rt.before, 'Thuế tiền thuê': rt.tax, 'Tiền thuê sau thuế': rt.after,
        'Phí dịch vụ trước thuế': ft.before, 'Thuế phí dịch vụ': ft.tax, 'Phí dịch vụ sau thuế': ft.after,
        'Tổng trước thuế': rt.before + ft.before, 'Tổng thuế': rt.tax + ft.tax, 'Tổng sau thuế': rt.after + ft.after,
        'Ghi chú': pEnd < nominal ? 'Kỳ lẻ cuối theo ngày kết thúc' : ''
      });
      details.push(...rentD, ...feeD);
      pStart = pEnd + 1;
      no++;
    }
    // Đề nghị thanh toán: một đề nghị Nháp cho mỗi kỳ.
    const lead = noticeDays(contract['Báo trước (ngày)']);
    const requests = periods.map(p => ({
      'Mã HĐ': id, 'Từ ngày': p['Từ ngày'], 'Đến ngày': p['Đến ngày'],
      'Ngày đề nghị': p['Ngày đến hạn'] !== null ? p['Ngày đến hạn'] - lead : null,
      'Tổng đề nghị': p['Tổng sau thuế'], 'Trạng thái': 'Nháp'
    }));
    return { periods, details, requests, errors };
  }

  return {
    DAY, toDay, toIso, ymd, addMonthsSafe, monthFraction, num, taxRate, cycleMonths, noticeDays,
    effectiveEnd, generatePeriods
  };
});
