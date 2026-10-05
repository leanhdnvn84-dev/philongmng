// V5.9.4 – hàm ghi Dư nợ gốc ban đầu (báo cáo gốc lãi T10/2026): xem trước không ghi, ghi đúng 88 mã + ngày 31/08/2026, chạy lại không ghi thêm, giữ nguyên cột khác.
const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
const code=fs.readFileSync(__dirname+'/../Code.gs','utf8');
const store={},cache={get:k=>store[k]??null,put:(k,v)=>{store[k]=String(v)},remove:k=>{delete store[k]},getAll:ks=>{const o={};ks.forEach(k=>{if(store[k]!=null)o[k]=store[k]});return o},putAll:o=>Object.assign(store,o)};
const sheets={};let writes=0;
function sheet(name){const t=sheets[name];if(!t)return null;const v=()=>[t.h].concat(t.rows);
 return{getDataRange:()=>({getValues:v}),getLastColumn:()=>t.h.length,getLastRow:()=>t.rows.length+1,getMaxColumns:()=>t.h.length,getMaxRows:()=>t.rows.length+1,
  getRange:(r,c,nr,nc)=>({getDisplayValues:()=>v().slice(r-1,r-1+(nr||1)).map(x=>x.slice(c-1,c-1+(nc||1)).map(String)),getValues:()=>v().slice(r-1,r-1+(nr||1)).map(x=>x.slice(c-1,c-1+(nc||1))),setValue(x){writes++;t.rows[r-2][c-1]=x},setNumberFormat(){}}),appendRow:a=>t.rows.push(a)}}
const ctx={console:{log(){}},CacheService:{getScriptCache:()=>cache},SpreadsheetApp:{openById:()=>({getSheetByName:sheet}),flush(){}},Session:{getActiveUser:()=>({getEmail:()=>'a@x.vn'}),getEffectiveUser:()=>({getEmail:()=>'a@x.vn'})},LockService:{getScriptLock:()=>({waitLock(){},releaseLock(){}})},Utilities:{formatDate:(d,tz,f)=>{const p=n=>String(n).padStart(2,'0');return d.getFullYear()+'-'+p(d.getMonth()+1)+(f==='yyyy-MM'?'':'-'+p(d.getDate()))},getUuid:()=>'u'}};
vm.createContext(ctx);vm.runInContext(code,ctx);const run=s=>vm.runInContext(s,ctx);
store['USER_V51_a@x.vn']=JSON.stringify({email:'a@x.vn',role:'ADMIN'});
const SO=JSON.parse(run('JSON.stringify(DU_NO_GOC_T10_2026_)'));
assert.equal(SO.NGAY,'2026-08-31','dư nợ ban đầu tháng 8');assert.equal(Object.keys(SO.SO).length,88);
assert.equal(Object.values(SO.SO).reduce((a,b)=>a+b,0),4470657239339,'tổng phải bằng tổng cột Dư nợ còn lại của báo cáo');
['KV-T9-019','KV-T9-023','KV-T9-054','KV-T9-055','KV-T9-058','KV-T9-080'].forEach(id=>assert.ok(!(id in SO.SO),id+' không có trong báo cáo – không được ghi'));
const H=['MA_KHOAN_VAY','TEN_KHOAN_VAY','HAN_MUC_VAY','DU_NO_GOC_BAN_DAU','NGAY_GOC_BAN_DAU','DU_NO_GOC_DAU_KY','NGAY_CHOT_DU_NO_DAU_KY'];
sheets.KHOAN_VAY={h:H,rows:[['KV-T9-006','Khu A',1,6000000000,'',6000000000,''],['KV-T9-019','Ngoài file',1,5,'',5,''],['KV-T9-001','Villa',1,SO.SO['KV-T9-001'],'','','']]};
sheets.NHAT_KY={h:['MA_NHAT_KY','THOI_GIAN','EMAIL_NGUOI_DUNG','CHUC_NANG','MA_BAN_GHI','HANH_DONG','NOI_DUNG_THAY_DOI'],rows:[]};
// xem trước: không ghi; báo mã không có trên sheet
const pv=run('xemTruoc_DuNoGocBanDau_T10()');assert.equal(writes,0);assert.match(pv,/^Sẽ cập nhật 2 khoản vay \(ngày gốc ban đầu → 31\/08\/2026\)/);assert.match(pv,/KHÔNG tìm thấy mã: .*KV-T9-002/);assert.match(pv,/KV-T9-006: 6\.000\.000\.000 → 161\.283\.343\.483/);
// ghi
run('capNhatDataGoc_DuNoGocBanDau_T10()');
const r=sheets.KHOAN_VAY.rows;assert.equal(r[0][3],161283343483);assert.equal(run('serializeCell_')(r[0][4],'NGAY_GOC_BAN_DAU'),'2026-08-31');
assert.equal(r[0][5],6000000000,'không đụng Dư nợ gốc đầu kỳ');assert.deepEqual(r[1],['KV-T9-019','Ngoài file',1,5,'',5,''],'khoản ngoài file giữ nguyên');
assert.equal(r[2][3],SO.SO['KV-T9-001']);assert.ok(r[2][4],'đúng số nhưng thiếu ngày → vẫn ghi ngày');
assert.equal(sheets.NHAT_KY.rows.length,1);assert.equal(sheets.NHAT_KY.rows[0][5],'CAP_NHAT_DATA_GOC');
// chạy lại: không ghi thêm
const w=writes;run('capNhatDataGoc_DuNoGocBanDau_T10()');assert.equal(writes,w);assert.match(run('xemTruoc_DuNoGocBanDau_T10()'),/^Sẽ cập nhật 0/);
console.log('PASS V5.9.4: ghi Dư nợ gốc ban đầu 88 khoản (31/08/2026) – xem trước không ghi, chạy lại an toàn, giữ nguyên khoản ngoài file và cột khác.');
