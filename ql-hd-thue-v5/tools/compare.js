// So sánh kết quả sinh kỳ của lõi mới với dữ liệu cũ (kythanhtoan), theo từng hợp đồng.
const Q = require('../src/engine.js');
const L = require('../data/legacy.json');
const byHD = (rows, key) => rows.reduce((m, r) => ((m[r[key]] = m[r[key]] || []).push(r), m), {});
const contracts = L.hopdong.rows;
const rentsBy = byHD(L.giathue.rows, 'Mã HĐ');
const appBy = byHD(L.phuluc.rows, 'Mã HĐ');
const feeBy = byHD(L.phidichvu.rows, 'Mã HĐ');
const legacyBy = byHD(L.kythanhtoan.rows, 'Mã HĐ');
const out = [];
for (const c of contracts) {
  const id = c['Mã HĐ'];
  const gen = Q.generatePeriods(c, appBy[id] || [], rentsBy[id] || [], feeBy[id] || []);
  const leg = (legacyBy[id] || []).sort((a, b) => a['Từ ngày'] < b['Từ ngày'] ? -1 : 1);
  const newStarts = new Map(gen.periods.map(p => [Q.toIso(p['Từ ngày']), p]));
  const legStarts = new Map(leg.map(p => [p['Từ ngày'], p]));
  let same = 0, totalDiff = 0, onlyNew = [], onlyLeg = [];
  for (const [s, p] of newStarts) {
    const l = legStarts.get(s);
    if (!l) { onlyNew.push(s); continue; }
    if (Math.abs(l['Tổng sau thuế'] - p['Tổng sau thuế']) <= 2) same++; else totalDiff++;
  }
  for (const s of legStarts.keys()) if (!newStarts.has(s)) onlyLeg.push(s);
  out.push({ id, legacy: leg.length, generated: gen.periods.length, same, totalDiff,
    onlyNew: onlyNew.length, onlyLeg: onlyLeg.length, errors: gen.errors.map(e => e.message).join(' | '),
    lastNew: gen.periods.length ? Q.toIso(gen.periods[gen.periods.length - 1]['Đến ngày']) : '',
    lastLeg: leg.length ? leg[leg.length - 1]['Đến ngày'].slice(0, 10) : '' });
}
console.table(out);
