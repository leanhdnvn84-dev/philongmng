// V5.9 – Tải nhanh: mở bảng tính "lười", dấu phiên bản dữ liệu, cache chia mảnh an toàn tiếng Việt, ghi + trả dữ liệu 1 lần.
const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
const code=fs.readFileSync(__dirname+'/../Code.gs','utf8');
const store={};let opens=0;
const cache={get:k=>store[k]??null,put:(k,v)=>{if(Buffer.byteLength(String(v))>100*1024)throw new Error('quá 100KB');store[k]=String(v)},remove:k=>{delete store[k]},getAll:ks=>{const o={};ks.forEach(k=>{if(store[k]!=null)o[k]=store[k]});return o},putAll:o=>Object.keys(o).forEach(k=>cache.put(k,o[k]))};
const sheets={};
function fakeSheet(name){const t=sheets[name];if(!t)return null;const v=()=>[t.h].concat(t.rows.map(r=>t.h.map(h=>r[h]==null?'':r[h])));
 return{getDataRange:()=>({getValues:v}),getLastColumn:()=>t.h.length,getLastRow:()=>t.rows.length+1,getMaxColumns:()=>t.h.length,getRange:(r,c,nr,nc)=>({getDisplayValues:()=>v().slice(r-1,r-1+(nr||1)).map(x=>x.slice(c-1,c-1+(nc||1)).map(String)),getValues:()=>v().slice(r-1,r-1+(nr||1)).map(x=>x.slice(c-1,c-1+(nc||1)))}),appendRow:a=>{const o={};t.h.forEach((h,i)=>o[h]=a[i]);t.rows.push(o)}}}
const ctx={console,Buffer,CacheService:{getScriptCache:()=>cache},SpreadsheetApp:{openById:()=>{opens++;return{getSheetByName:fakeSheet}},flush(){}},Session:{getActiveUser:()=>({getEmail:()=>'a@x.vn'}),getEffectiveUser:()=>({getEmail:()=>'a@x.vn'})},LockService:{getScriptLock:()=>({waitLock(){},releaseLock(){}})},Utilities:{formatDate:(d)=>d.toISOString().slice(0,10),getUuid:()=>'u'},HtmlService:{createHtmlOutputFromFile(){return{setTitle(){return this},addMetaTag(){return this},setXFrameOptionsMode(){return this}}},XFrameOptionsMode:{ALLOWALL:1}}};
vm.createContext(ctx);vm.runInContext(code,ctx);const run=s=>vm.runInContext(s,ctx),J=s=>JSON.parse(run('JSON.stringify('+s+')'));
// Dữ liệu: KHOAN_VAY 40 dòng có ghi chú tiếng Việt dài (buộc chia nhiều mảnh cache)
const KV=J("(c=>[c.idField].concat(c.required||[],c.columns||[],c.autoColumns||[],Object.keys(c.enums||{}),c.amounts||[],c.dates||[]).filter((x,i,a)=>a.indexOf(x)===i))(APP_MODULES.KHOAN_VAY)");
const note='Khoản vay đầu tư dự án nhà ở xã hội – điều chỉnh lãi suất định kỳ 6 tháng; ';
sheets.KHOAN_VAY={h:KV.concat(KV.includes('GHI_CHU')?[]:['GHI_CHU']),rows:Array.from({length:40},(_,i)=>({MA_KHOAN_VAY:'KV'+i,TEN_KHOAN_VAY:'Vay số '+i,MA_NGAN_HANG:'VCB',TRANG_THAI:'DANG_VAY',HAN_MUC_VAY:1000,GHI_CHU:note.repeat(60)}))};
store['USER_V51_a@x.vn']=JSON.stringify({email:'a@x.vn',name:'A',role:'ADMIN'});
// 1. Lần đầu: đọc sheet (mở bảng tính 1 lần), có dấu phiên bản
const r1=J("getModuleData('KHOAN_VAY','',false)");assert.equal(r1.rows.length,40);assert.equal(opens,1);assert.match(r1.ver,/^KHOAN_VAY:\d+$/);
assert.ok(Object.keys(store).some(k=>/^DATA_V593_KHOAN_VAY__\d+$/.test(k)),'dữ liệu lớn phải được chia mảnh và vẫn cache được');
// 2. Hỏi "có gì mới không": không đổi → chỉ trả same, KHÔNG mở bảng tính, không gửi dòng
const r2=J(`getModuleData('KHOAN_VAY','${r1.ver}',false)`);assert.equal(r2.same,true);assert.equal(r2.rows,undefined);assert.equal(opens,1);
// 3. Tải lại toàn bộ khi cache còn: lấy từ cache, không mở bảng tính; nội dung tiếng Việt nguyên vẹn
const r3=J("getModuleData('KHOAN_VAY','',false)");assert.equal(opens,1);assert.equal(r3.rows[5].GHI_CHU,note.repeat(60));assert.equal(r3.ver,r1.ver);
// 4. Có ghi dữ liệu (xóa cache) → phiên bản cũ không còn khớp → trả dữ liệu mới
run("invalidateModuleCache_('KHOAN_VAY')");sheets.KHOAN_VAY.rows[0].TEN_KHOAN_VAY='Đã sửa';
const r4=J(`getModuleData('KHOAN_VAY','${r1.ver}',false)`);assert.equal(r4.same,undefined);assert.equal(r4.rows[0].TEN_KHOAN_VAY,'Đã sửa');assert.equal(opens,2);
// 5. Tải lại bắt buộc (nút "Tải lại dữ liệu") luôn đọc sheet
J("getModuleData('KHOAN_VAY','',true)");assert.equal(opens,3);
// 6. Nhật ký vẫn tải theo trang; mutateAndFetch chỉ cho các thao tác ghi đã khai báo
assert.throws(()=>run("getModuleData('NHAT_KY','',false)"),/tải theo trang/);
assert.throws(()=>run("mutateAndFetch('getAllLookups',[],'KHOAN_VAY')"),/không hợp lệ/);
// 7. Cache: chuỗi tiếng Việt 300.000 ký tự ghi/đọc nguyên vẹn, mỗi mảnh ≤100KB
const big='Ừ ầ ẫ ữ đ '.repeat(30000);run(`cachePutJson_(CacheService.getScriptCache(),'T',{s:${JSON.stringify(big)}},60)`);assert.equal(J("cacheGetJson_(CacheService.getScriptCache(),'T').s"),big);
// 8. Nhật ký: nội dung quá dài được rút gọn trong danh sách
sheets.NHAT_KY={h:['MA_NHAT_KY','THOI_GIAN','EMAIL_NGUOI_DUNG','CHUC_NANG','MA_BAN_GHI','HANH_DONG','NOI_DUNG_THAY_DOI'],rows:[{MA_NHAT_KY:'NK1',THOI_GIAN:'2026-10-01',NOI_DUNG_THAY_DOI:'x'.repeat(40000)}]};
const nk=J("readSheet_(openFinanceSpreadsheet_(),'NHAT_KY',APP_MODULES.NHAT_KY).rows[0].NOI_DUNG_THAY_DOI");assert.ok(nk.length<2100&&/xem đầy đủ/.test(nk));
console.log('PASS V5.9: tải nhanh – mở bảng tính lười, phiên bản dữ liệu (same), cache chia mảnh tiếng Việt, tải lại bắt buộc, Nhật ký theo trang.');
