// So sánh hai thư mục kết quả của run.js. Thoát mã 1 nếu có khác biệt.
//   node tools/harness/compare.js <dirA> <dirB>
'use strict';
const fs = require('fs');
const path = require('path');
const [a, b] = process.argv.slice(2).map(p => path.resolve(p));
const list = d => fs.readdirSync(d).filter(f => f !== 'report.json').sort();
const fa = list(a), fb = list(b);
let diffs = 0;
const all = [...new Set([...fa, ...fb])].sort();
for (const f of all) {
  if (!fa.includes(f) || !fb.includes(f)) { console.log('CHỈ CÓ Ở ' + (fa.includes(f) ? 'A' : 'B') + ': ' + f); diffs++; continue; }
  const x = fs.readFileSync(path.join(a, f), 'utf8'), y = fs.readFileSync(path.join(b, f), 'utf8');
  if (x === y) continue;
  diffs++;
  const lx = x.split('\n'), ly = y.split('\n');
  let i = 0; while (i < lx.length && i < ly.length && lx[i] === ly[i]) i++;
  let j = 0; while (j < lx.length - i && j < ly.length - i && lx[lx.length - 1 - j] === ly[ly.length - 1 - j]) j++;
  console.log(`KHÁC: ${f} (dòng ${i + 1}; A ${lx.length - i - j} dòng / B ${ly.length - i - j} dòng khác)`);
  const show = (arr) => arr.slice(i, Math.min(arr.length - j, i + 4)).map(s => '    ' + s.slice(0, 400)).join('\n');
  console.log('  A:\n' + show(lx) + '\n  B:\n' + show(ly));
}
console.log(diffs ? `${diffs} tệp khác nhau` : `Giống hệt nhau (${all.length} tệp)`);
process.exit(diffs ? 1 : 0);
