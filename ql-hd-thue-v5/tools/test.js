// Kiểm thử: bất biến của lõi mới + kết quả đối chiếu với dữ liệu cũ.
const assert = require('assert');
const Q = require('../src/engine.js');
const R = require('../src/reconcile.js');
const L = require('../data/legacy.json');
let passed = 0;
const t = (name, fn) => { fn(); passed++; console.log('  ✓', name); };

const res = R.run(L);
const byId = id => res.contracts.find(c => c.id === id);

console.log('Bất biến của lõi:');
t('mỗi kỳ có tổng = tiền thuê + phí dịch vụ (sau thuế)', () => {
  res.contracts.forEach(c => c.periods.forEach(p => {
    assert.ok(Math.abs(p['Tổng sau thuế'] - (p['Tiền thuê sau thuế'] + p['Phí dịch vụ sau thuế'])) < 1, c.id + ' ' + p['Kỳ số']);
  }));
});
t('tổng chi tiết kỳ = tổng kỳ (trước thuế)', () => {
  res.contracts.forEach(c => c.periods.forEach(p => {
    const dets = c.details.filter(d => Q.toIso(d['Từ ngày']) >= Q.toIso(p['Từ ngày']) && Q.toIso(d['Đến ngày']) <= Q.toIso(p['Đến ngày']) && d['Mã HĐ'] === c.id);
    const before = dets.reduce((s, d) => s + d['Đơn giá trước thuế'] * d['Số tháng'], 0);
    assert.ok(Math.abs(before - p['Tổng trước thuế']) < 1, `${c.id} kỳ ${p['Kỳ số']}: ${before} ≠ ${p['Tổng trước thuế']}`);
  }));
});
t('các kỳ liền nhau, không hở, không chồng (mỗi HĐ)', () => {
  res.contracts.forEach(c => {
    for (let i = 1; i < c.periods.length; i++) {
      assert.strictEqual(c.periods[i]['Từ ngày'], c.periods[i - 1]['Đến ngày'] + 1, `${c.id} kỳ ${i + 1} hở/chồng`);
    }
  });
});
t('sinh lại cho kết quả giống hệt (xác định)', () => {
  const c = L.hopdong.rows.find(x => x['Mã HĐ'] === 'HDT031');
  const by = id => L[id].rows.filter(r => r['Mã HĐ'] === 'HDT031');
  const a = Q.generatePeriods(c, by('phuluc'), by('giathue'), []).periods.map(p => p['Tổng sau thuế']);
  const b = Q.generatePeriods(c, by('phuluc'), by('giathue'), []).periods.map(p => p['Tổng sau thuế']);
  assert.deepStrictEqual(a, b);
});

console.log('Đối chiếu với dữ liệu cũ:');
t('HĐ rõ ràng (HDT021, HDT031, HDT090, HDT111) khớp 100% kỳ và tiền', () => {
  ['HDT021', 'HDT031', 'HDT090', 'HDT111'].forEach(id => {
    const c = byId(id);
    assert.strictEqual(c.diffTotal, 0, id); assert.strictEqual(c.onlyNew, 0, id); assert.strictEqual(c.onlyLeg, 0, id);
    assert.strictEqual(c.legacyCount, c.newCount, id);
  });
});
t('HDT183 (giá 0 4 năm) và HDT184 (kỳ cuối đúng 1 ngày) được tính đúng theo hợp đồng', () => {
  assert.strictEqual(byId('HDT183').newCount, 17);
  assert.strictEqual(byId('HDT183').legacyCount, 17);
  assert.strictEqual(byId('HDT184').newCount, byId('HDT184').legacyCount + 1); // kỳ cuối ngày 12/02/2023 được tính
});
t('HDT070: kỳ cũ bao trùm ngày đổi giá 23/02/2024 → bị báo C20 và lệch từ đó', () => {
  assert.ok(res.issues.some(i => i.code === 'C20' && i.key === 'KTT00102'));
  assert.ok(byId('HDT070').diffTotal + byId('HDT070').onlyNew > 0);
});
t('HDT060, HDT151, HDT181 báo thiếu giá (không im lặng)', () => {
  ['HDT060', 'HDT151', 'HDT181'].forEach(id => assert.ok(byId(id).errors.length, id));
});
t('không có HĐ nào làm chương trình lỗi', () => {
  assert.strictEqual(res.contracts.length, L.hopdong.rows.length);
});
t('dữ liệu cũ không bị sửa (đối chiếu chỉ đọc)', () => {
  const before = JSON.stringify(L);
  R.run(L);
  assert.strictEqual(JSON.stringify(L), before);
});
t('thanh toán: không có giao dịch nào có chứng từ → đã thu = 0', () => {
  assert.strictEqual(res.summary.verifiedPaidTotal, 0);
  assert.ok(res.payment.every(p => p.verifiedPaid === 0));
});
console.log(`\n${passed} kiểm thử đạt.`);
