// V5.9.10 – Nguồn vốn: cột Tổng CP khác & thuế (nhập), Tổng trả nợ = Dư nợ phải trả + CP khác & thuế, Tổng nguồn dư = Có thể giải ngân − Tổng trả nợ.
const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
const code=fs.readFileSync(__dirname+'/../Code.gs','utf8'),html=fs.readFileSync(__dirname+'/../index.html','utf8');
const store={},cache={get:k=>store[k]??null,put:(k,v)=>{store[k]=String(v)},remove:k=>{delete store[k]},getAll:ks=>{const o={};ks.forEach(k=>{if(store[k]!=null)o[k]=store[k]});return o},putAll:o=>Object.assign(store,o)};
const sheets={};let VD;
function sheet(name){const t=sheets[name];if(!t)return null;const v=()=>[t.h].concat(t.rows);return{getDataRange:()=>({getValues:v}),getLastColumn:()=>t.h.length,getLastRow:()=>t.rows.length+1,getMaxColumns:()=>t.h.length,getMaxRows:()=>t.rows.length+1,
 insertColumnsAfter(){},getRange:(r,c,nr,nc)=>({getDisplayValues:()=>v().slice(r-1,r-1+(nr||1)).map(x=>x.slice(c-1,c-1+(nc||1)).map(String)),getValues:()=>v().slice(r-1,r-1+(nr||1)).map(x=>x.slice(c-1,c-1+(nc||1))),setValue(x){t.rows[r-2][c-1]=x},setValues(a){if(r===1){a[0].forEach((x,j)=>{t.h[c-1+j]=x;t.rows.forEach(row=>{while(row.length<t.h.length)row.push('')})});return}a.forEach((row,i)=>row.forEach((x,j)=>t.rows[r-2+i][c-1+j]=x))},setNumberFormat(){},copyFormatToRange(){}}),appendRow:a=>t.rows.push(a)}}
const ctx={console:{log(){},error(){}},CacheService:{getScriptCache:()=>cache},SpreadsheetApp:{openById:()=>({getSheetByName:sheet}),flush(){}},Session:{getActiveUser:()=>({getEmail:()=>'a@x.vn'}),getEffectiveUser:()=>({getEmail:()=>'a@x.vn'})},LockService:{getScriptLock:()=>({waitLock(){},tryLock(){return true},releaseLock(){}})},
 Utilities:{formatDate:(d,tz,f)=>{const p=n=>String(n).padStart(2,'0');return f==='yyyy-MM'?d.getFullYear()+'-'+p(d.getMonth()+1):d.getFullYear()+'-'+p(d.getMonth()+1)+'-'+p(d.getDate())},getUuid:()=>Math.random().toString(16).slice(2)}};
vm.createContext(ctx);vm.runInContext(code,ctx);const run=s=>vm.runInContext(s,ctx),J=s=>JSON.parse(run('JSON.stringify('+s+')'));VD=run('Date');const D=(y,m,d)=>new VD(y,m-1,d,12);
store['USER_V51_a@x.vn']=JSON.stringify({email:'a@x.vn',role:'ADMIN'});
const put=(k,h,rows)=>{sheets[k]={h,rows:rows.map(o=>h.map(f=>o[f]==null?'':o[f]))}};
['NHAT_KY'].forEach(k=>put(k,['MA_NHAT_KY','THOI_GIAN','EMAIL_NGUOI_DUNG','CHUC_NANG','MA_BAN_GHI','HANH_DONG','NOI_DUNG_THAY_DOI'],[]));
put('NGUON_VON',['MA_NGUON_VON','KY_DU_KIEN','LOAI_NGUON','CO_THE_GIAI_NGAN','DU_NO_PHAI_TRA','TRANG_THAI'],[
 {MA_NGUON_VON:'NV1',KY_DU_KIEN:'2026-10',LOAI_NGUON:'VAY',CO_THE_GIAI_NGAN:1000,DU_NO_PHAI_TRA:600,TRANG_THAI:'DU_KIEN'},
 {MA_NGUON_VON:'NV2',KY_DU_KIEN:'2026-10',LOAI_NGUON:'VAY',CO_THE_GIAI_NGAN:100,DU_NO_PHAI_TRA:50,TRANG_THAI:'DU_KIEN'},
 {MA_NGUON_VON:'NV3',KY_DU_KIEN:'2026-10',LOAI_NGUON:'VAY',CO_THE_GIAI_NGAN:999,DU_NO_PHAI_TRA:1,TRANG_THAI:'KHONG_THUC_HIEN'}]);
// sheet cũ chưa có cột → tự thêm cột CHI_PHI_KHAC_THUE; công thức khi chưa nhập CP = như cũ
let d=J("getModuleData('NGUON_VON','',false)");assert.ok(sheets.NGUON_VON.h.includes('CHI_PHI_KHAC_THUE'));assert.ok(!sheets.NGUON_VON.h.includes('TONG_TRA_NO'),'cột tính – không ghi sheet');
assert.deepEqual(d.rows.map(r=>[r.TONG_TRA_NO,r.TONG_NGUON_DU]),[[600,400],[50,50],[1,998]]);
// nhập CP khác & thuế qua form
J("saveRecord('NGUON_VON',{MA_NGUON_VON:'NV1',KY_DU_KIEN:'2026-10',LOAI_NGUON:'VAY',CO_THE_GIAI_NGAN:'1000',DU_NO_PHAI_TRA:'600',CHI_PHI_KHAC_THUE:'250',TRANG_THAI:'DU_KIEN'})");
J("saveRecord('NGUON_VON',{MA_NGUON_VON:'NV2',KY_DU_KIEN:'2026-10',LOAI_NGUON:'VAY',CO_THE_GIAI_NGAN:'100',DU_NO_PHAI_TRA:'50',CHI_PHI_KHAC_THUE:'80',TRANG_THAI:'DU_KIEN'})");
d=J("getModuleData('NGUON_VON','',false)");const nv1=d.rows.find(r=>r.MA_NGUON_VON==='NV1'),nv2=d.rows.find(r=>r.MA_NGUON_VON==='NV2');
assert.deepEqual([nv1.CHI_PHI_KHAC_THUE,nv1.TONG_TRA_NO,nv1.TONG_NGUON_DU],[250,850,150]);assert.deepEqual([nv2.TONG_TRA_NO,nv2.TONG_NGUON_DU],[130,-30]);
assert.throws(()=>run("saveRecord('NGUON_VON',{MA_NGUON_VON:'NV2',KY_DU_KIEN:'2026-10',LOAI_NGUON:'VAY',TONG_TRA_NO:'1',CHI_PHI_KHAC_THUE:'-5'})"),/không được âm/);
// chỉ số chân bảng (bỏ Không thực hiện)
const m=J("computeMetrics_(getModuleData('NGUON_VON','',false).rows,UI_MODULES.NGUON_VON.metrics)"),v=l=>m.find(x=>x.label===l).value;
assert.deepEqual([v('Tổng CP khác & thuế'),v('Tổng trả nợ'),v('Tổng nguồn dư')],[330,980,120]);assert.equal(m.find(x=>x.label==='Tổng nguồn dư').gap,true);
// bảng + form
const cols=J("APP_MODULES.NGUON_VON.columns");assert.deepEqual(cols.slice(cols.indexOf('DU_NO_PHAI_TRA'),cols.indexOf('DU_NO_PHAI_TRA')+4),['DU_NO_PHAI_TRA','CHI_PHI_KHAC_THUE','TONG_TRA_NO','TONG_NGUON_DU']);
assert.ok(J("FORM_LAYOUT_.NGUON_VON[2][1]").includes('CHI_PHI_KHAC_THUE'));assert.ok(!J("getBootstrapData().modules.NGUON_VON").fields.includes('TONG_TRA_NO'),'Tổng trả nợ không nhập tay');
assert.match(html,/CHI_PHI_KHAC_THUE:'Tổng CP khác & thuế',TONG_TRA_NO:'Tổng trả nợ'/);
console.log('PASS V5.9.10: Nguồn vốn – Tổng CP khác & thuế, Tổng trả nợ = Dư nợ phải trả + CP khác & thuế, Tổng nguồn dư = Có thể giải ngân − Tổng trả nợ.');
