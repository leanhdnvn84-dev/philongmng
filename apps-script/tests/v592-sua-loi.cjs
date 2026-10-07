// V5.9.2 – sửa lỗi: Đổi trạng thái (TOGGLE), khóa ghi transitionRecord, xóa cache quyền khi sửa Người dùng, đọc CSV có "", năm lọc theo năm hiện tại.
const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
const code=fs.readFileSync(__dirname+'/../Code.gs','utf8'),html=fs.readFileSync(__dirname+'/../index.html','utf8');
const store={};let locks=0,released=0;
const cache={get:k=>store[k]??null,put:(k,v)=>{store[k]=String(v)},remove:k=>{delete store[k]},getAll:ks=>{const o={};ks.forEach(k=>{if(store[k]!=null)o[k]=store[k]});return o},putAll:o=>Object.keys(o).forEach(k=>cache.put(k,o[k]))};
const sheets={};
function fakeSheet(name){const t=sheets[name];if(!t)return null;const v=()=>[t.h].concat(t.rows.map(r=>t.h.map(h=>r[h]==null?'':r[h])));
 return{getDataRange:()=>({getValues:v}),getLastColumn:()=>t.h.length,getLastRow:()=>t.rows.length+1,getMaxColumns:()=>t.h.length,
  getRange:(r,c,nr,nc)=>({getDisplayValues:()=>v().slice(r-1,r-1+(nr||1)).map(x=>x.slice(c-1,c-1+(nc||1)).map(String)),getValues:()=>v().slice(r-1,r-1+(nr||1)).map(x=>x.slice(c-1,c-1+(nc||1))),
   setValues:a=>{a.forEach((row,i)=>{const o=t.rows[r-2+i]||(t.rows[r-2+i]={});row.forEach((x,j)=>o[t.h[c-1+j]]=x)})}}),appendRow:a=>{const o={};t.h.forEach((h,i)=>o[h]=a[i]);t.rows.push(o)}}}
const ctx={console,CacheService:{getScriptCache:()=>cache},SpreadsheetApp:{openById:()=>({getSheetByName:fakeSheet}),flush(){}},Session:{getActiveUser:()=>({getEmail:()=>'a@x.vn'}),getEffectiveUser:()=>({getEmail:()=>'a@x.vn'})},
 LockService:{getScriptLock:()=>({waitLock(){locks++},releaseLock(){released++}})},Utilities:{formatDate:d=>new Date(d).toISOString().slice(0,10),getUuid:()=>'abcde'}};
vm.createContext(ctx);vm.runInContext(code,ctx);const run=s=>vm.runInContext(s,ctx);
store['USER_V51_a@x.vn']=JSON.stringify({email:'a@x.vn',name:'A',role:'ADMIN'});
sheets.TAI_KHOAN={h:['MA_TAI_KHOAN','TEN_TAI_KHOAN','LOAI_TAI_KHOAN','MA_TIEN_TE','TRANG_THAI','CAP_NHAT_LUC'],rows:[{MA_TAI_KHOAN:'TK1',TEN_TAI_KHOAN:'TK chính',LOAI_TAI_KHOAN:'NGAN_HANG',MA_TIEN_TE:'VND',TRANG_THAI:'HOAT_DONG'}]};
sheets.NGUOI_DUNG={h:['EMAIL','HO_TEN','VAI_TRO','TRANG_THAI','CAP_NHAT_LUC'],rows:[{EMAIL:'a@x.vn',HO_TEN:'A',VAI_TRO:'ADMIN',TRANG_THAI:'HOAT_DONG'},{EMAIL:'b@x.vn',HO_TEN:'B',VAI_TRO:'KE_TOAN',TRANG_THAI:'HOAT_DONG'}]};
sheets.NHAT_KY={h:['MA_NHAT_KY','THOI_GIAN','EMAIL_NGUOI_DUNG','CHUC_NANG','MA_BAN_GHI','HANH_DONG','NOI_DUNG_THAY_DOI'],rows:[]};
// 1. TOGGLE không còn lỗi "Assignment to constant variable", đổi qua lại 2 chiều, có khóa ghi
assert.equal(run("transitionRecord('TAI_KHOAN','TK1','TOGGLE',{}).status"),'NGUNG_HOAT_DONG');
assert.equal(sheets.TAI_KHOAN.rows[0].TRANG_THAI,'NGUNG_HOAT_DONG');
assert.equal(run("transitionRecord('TAI_KHOAN','TK1','TOGGLE',{}).status"),'HOAT_DONG');
assert.ok(locks>=2&&locks===released,'transitionRecord phải lấy và nhả khóa');
assert.throws(()=>run("transitionRecord('TAI_KHOAN','TK9','TOGGLE',{})"),/Không tìm thấy/);assert.equal(locks,released,'lỗi vẫn phải nhả khóa');
// 2. Khóa người dùng B qua app → xóa cache quyền + cache khởi động của B, không đụng cache của người khác
store['USER_V51_b@x.vn']=JSON.stringify({email:'b@x.vn',role:'KE_TOAN'});store['BOOT_V598_b@x.vn']='{"x":1}';store['BOOT_V598_c@x.vn']='{"x":1}';
assert.equal(run("transitionRecord('NGUOI_DUNG','b@x.vn','TOGGLE',{}).status"),'NGUNG_HOAT_DONG');
assert.equal(store['USER_V51_b@x.vn'],undefined);assert.equal(store['BOOT_V598_b@x.vn'],undefined);assert.equal(store['BOOT_V598_c@x.vn'],'{"x":1}');
// email viết hoa trong sheet vẫn xóa được khóa chữ thường
store['USER_V51_b@x.vn']='{"role":"X"}';run("invalidateUserCache_('B@X.vn')");assert.equal(store['USER_V51_b@x.vn'],undefined);
// cache khởi động: khóa mới, giữ 30 phút
assert.ok(code.includes("BOOT_KEY_='BOOT_V598_'")&&/cachePutJson_\(cache,key,out,1800\)/.test(code));
// 3. CSV: "" → ", dấu phẩy/chấm phẩy và xuống dòng trong ô có ngoặc kép, CRLF, BOM
const m=html.match(/function parseCsv_\(text\)\{[\s\S]*?return grid\}/);assert.ok(m,'thiếu parseCsv_');
const parseCsv_=new Function(m[0]+';return parseCsv_')();
assert.deepEqual(parseCsv_('﻿MA_KHOAN_VAY,GHI_CHU\r\nKV1,"Kỳ ""11"", trả; sớm"\r\nKV2,"dòng 1\ndòng 2"\n'),[['MA_KHOAN_VAY','GHI_CHU'],['KV1','Kỳ "11", trả; sớm'],['KV2','dòng 1\ndòng 2']]);
assert.deepEqual(parseCsv_('a;b\n1;'),[['a','b'],['1','']]);
// 4. Giao diện: năm theo năm hiện tại + "Tất cả năm"; form hiện nhãn tiếng Việt cho danh sách chọn
assert.doesNotMatch(html,/\[2024,2025,2026,2027,2028\]|year:'2026'|S\.year='2026'/);
assert.match(html,/function yearList_\(\)/);assert.equal((html.match(/>Tất cả năm<\/option>/g)||[]).length,2);
assert.match(html,/en\.map\(x=>'<option value="'\+esc\(x\)\+'" '\+\(x===v\?'selected':''\)\+'>'\+esc\(statusLabel_\(x\)\)/);
console.log('PASS V5.9.2: TOGGLE + khóa ghi transitionRecord, xóa cache quyền khi sửa Người dùng, CSV có "", năm lọc động, nhãn danh sách chọn.');
