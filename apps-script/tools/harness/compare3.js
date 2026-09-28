// So kết quả bản mới (C) với HAI lượt chạy bản gốc (A, B): chỉ báo tệp khác CẢ A lẫn B
// (bỏ qua nhiễu sẵn có giữa hai lượt chạy gốc — vd. độ rộng cột đo lẻ, vị trí giữa hiệu ứng).
//   node tools/harness/compare3.js <A> <B> <C>
'use strict';
const fs = require('fs');
const path = require('path');
const [a, b, c] = process.argv.slice(2).map(p => path.resolve(p));
const skip = f => /^(report|profile-|styles-)/.test(f);
const fc = fs.readdirSync(c).filter(f => !skip(f)).sort();
const fa = new Set(fs.readdirSync(a));
let diffs = 0;
for (const f of fc) {
  if (!fa.has(f)) { console.log('CHỈ CÓ Ở MỚI: ' + f); diffs++; continue; }
  const z = fs.readFileSync(path.join(c, f), 'utf8');
  const x = fs.readFileSync(path.join(a, f), 'utf8');
  if (z === x) continue;
  const yp = path.join(b, f), y = fs.existsSync(yp) ? fs.readFileSync(yp, 'utf8') : null;
  if (z === y) continue;
  // Từng dòng: dòng của C phải có mặt ở A hoặc B cùng vị trí.
  const lz = z.split('\n'), lx = x.split('\n'), ly = y ? y.split('\n') : [];
  const bad = [];
  if (lz.length !== lx.length && lz.length !== ly.length) bad.push(`số dòng ${lz.length} (gốc ${lx.length}/${ly.length})`);
  else lz.forEach((l, i) => { if (l !== lx[i] && l !== ly[i]) bad.push(`dòng ${i + 1}:\n    gốc: ${String(lx[i]).slice(0, 300)}\n    mới: ${l.slice(0, 300)}`); });
  if (!bad.length) continue;
  diffs++;
  console.log(`KHÁC: ${f} (${bad.length} dòng)\n  ` + bad.slice(0, 3).join('\n  '));
}
for (const f of fa) if (!skip(f) && !fc.includes(f)) { console.log('MẤT Ở MỚI: ' + f); diffs++; }
console.log(diffs ? `${diffs} tệp khác cả hai lượt gốc` : `Khớp (${fc.length} tệp)`);
process.exit(diffs ? 1 : 0);
