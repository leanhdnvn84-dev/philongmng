const Q=require('../src/engine.js'); const L=require('../data/legacy.json');
const by=(r,k)=>{const m={}; r.forEach(x=>{(m[x[k]]=m[x[k]]||[]).push(x)}); return m;};
const R=by(L.giathue.rows,'Mã HĐ'),A=by(L.phuluc.rows,'Mã HĐ'),F=by(L.phidichvu.rows,'Mã HĐ'),K=by(L.kythanhtoan.rows,'Mã HĐ');
for (const id of process.argv.slice(2)) {
 const c=L.hopdong.rows.find(x=>x['Mã HĐ']===id);
 const g=Q.generatePeriods(c,A[id]||[],R[id]||[],F[id]||[]);
 console.log('==',id,'| HĐ',c['Ngày bắt đầu'],'→',c['Ngày kết thúc'],'| due',c['Ngày đến hạn'],'| chu kỳ',c['Chu kỳ thanh toán (tháng)']);
 console.log('NEW :\n  '+g.periods.map(p=>Q.toIso(p['Từ ngày'])+'>'+Q.toIso(p['Đến ngày'])+' due '+Q.toIso(p['Ngày đến hạn'])+' '+Math.round(p['Tổng sau thuế'])).join('\n  '));
 console.log('LEGA:\n  '+(K[id]||[]).map(p=>p['Từ ngày'].slice(0,10)+'>'+p['Đến ngày'].slice(0,10)+' due '+p['Ngày đến hạn'].slice(0,10)+' '+Math.round(p['Tổng sau thuế'])).join('\n  '));
}
