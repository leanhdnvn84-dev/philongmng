// V5.9.3 – dò lại: CSV xuất đủ kết quả lọc, tìm theo tên khoản vay/ngân hàng/công ty, Nhật ký giữ dòng mới nhất, đổi phân hệ bỏ khoảng ngày cũ, CSS không chồng chéo.
const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
const code=fs.readFileSync(__dirname+'/../Code.gs','utf8'),html=fs.readFileSync(__dirname+'/../index.html','utf8');
const store={},cache={get:k=>store[k]??null,put:(k,v)=>{store[k]=String(v)},remove:k=>{delete store[k]},getAll:ks=>{const o={};ks.forEach(k=>{if(store[k]!=null)o[k]=store[k]});return o},putAll:o=>Object.assign(store,o)};
const sheets={};
function fakeSheet(name){const t=sheets[name];if(!t)return null;const v=()=>[t.h].concat(t.rows.map(r=>t.h.map(h=>r[h]==null?'':r[h])));
 return{getDataRange:()=>({getValues:v}),getLastColumn:()=>t.h.length,getLastRow:()=>t.rows.length+1,getMaxColumns:()=>t.h.length,getRange:(r,c,nr,nc)=>({getDisplayValues:()=>v().slice(r-1,r-1+(nr||1)).map(x=>x.slice(c-1,c-1+(nc||1)).map(String)),getValues:()=>v().slice(r-1,r-1+(nr||1)).map(x=>x.slice(c-1,c-1+(nc||1)))})}}
const ctx={console,CacheService:{getScriptCache:()=>cache},SpreadsheetApp:{openById:()=>({getSheetByName:fakeSheet}),flush(){}},Session:{getActiveUser:()=>({getEmail:()=>'a@x.vn'}),getEffectiveUser:()=>({getEmail:()=>'a@x.vn'})},LockService:{getScriptLock:()=>({waitLock(){},releaseLock(){}})},Utilities:{formatDate:d=>new Date(d).toISOString().slice(0,10),getUuid:()=>'u'}};
vm.createContext(ctx);vm.runInContext(code,ctx);const run=s=>vm.runInContext(s,ctx),J=s=>JSON.parse(run('JSON.stringify('+s+')'));
store['USER_V51_a@x.vn']=JSON.stringify({email:'a@x.vn',name:'A',role:'ADMIN'});
// 1. Nhật ký vượt giới hạn: giữ các dòng MỚI NHẤT (dòng cuối sheet), hiện mới nhất lên đầu
const NK=['MA_NHAT_KY','THOI_GIAN','EMAIL_NGUOI_DUNG','CHUC_NANG','MA_BAN_GHI','HANH_DONG','NOI_DUNG_THAY_DOI'];
sheets.NHAT_KY={h:NK,rows:Array.from({length:2500},(_,i)=>({MA_NHAT_KY:'NK'+i,THOI_GIAN:new Date(Date.UTC(2026,8,1)+i*600000).toISOString().slice(0,19),HANH_DONG:'X'}))};
const nk=J("readSheet_(openFinanceSpreadsheet_(),'NHAT_KY',APP_MODULES.NHAT_KY).rows.map(r=>r.MA_NHAT_KY)");
assert.equal(nk.length,2000);assert.equal(nk[nk.length-1],'NK2499','dòng nhật ký mới nhất phải còn');assert.equal(nk[0],'NK500');
assert.equal(J("listRecords('NHAT_KY',{},{},1,25).rows[0].MA_NHAT_KY"),'NK2499','Nhật ký mới nhất lên đầu');
// phân hệ khác: tới 5.000 dòng
assert.equal(run("APP_CONFIG.maxRowsPerModule"),5000);
// 2. Lịch trả nợ: tìm theo tên khoản vay / công ty / ngân hàng gắn kèm từ Khoản vay
const KV=['MA_KHOAN_VAY','TEN_KHOAN_VAY','HAN_MUC_VAY','MA_NGAN_HANG','SO_HOP_DONG','MA_CONG_TY_VAY','TRANG_THAI','DU_NO_GOC_BAN_DAU','NGAY_GOC_BAN_DAU','DU_NO_GOC_DAU_KY','NGAY_CHOT_DU_NO_DAU_KY'];
sheets.KHOAN_VAY={h:KV,rows:[{MA_KHOAN_VAY:'KV1',TEN_KHOAN_VAY:'Vietinbank Villa',HAN_MUC_VAY:10,MA_NGAN_HANG:'VTB',SO_HOP_DONG:'HD-77',MA_CONG_TY_VAY:'CÔNG TY KDL VINACAPITAL',TRANG_THAI:'DANG_VAY',DU_NO_GOC_BAN_DAU:1000}]};
sheets.LICH_TRA_NO={h:['MA_LICH_TRA','MA_KHOAN_VAY','KY_TRA_NO','NGAY_DEN_HAN','GOC_PHAI_TRA','TRANG_THAI'],rows:[{MA_LICH_TRA:'LT1',MA_KHOAN_VAY:'KV1',KY_TRA_NO:'2026-10',NGAY_DEN_HAN:'2026-10-25',GOC_PHAI_TRA:100,TRANG_THAI:'DU_KIEN'}]};
sheets.PHAN_BO_TRA_NO={h:['MA_PHAN_BO','MA_LICH_TRA','MA_GIAO_DICH','NGAY_THANH_TOAN'],rows:[]};
const data=J("getModuleData('LICH_TRA_NO','',false)");assert.equal(data.rows[0]._CONG_TY_VAY,'CÔNG TY KDL VINACAPITAL');
// chạy localList_ của index.html trên đúng dữ liệu máy chủ trả về
const m=html.match(/function localList_\(k,filters,sort,page,pageSize,all\)\{[\s\S]*?\n\}/);assert.ok(m,'thiếu localList_');
const lm=html.match(/function lMetrics_[\s\S]*?\n\}/)[0],lp=html.match(/function lPeriod_[^\n]*/)[0];
const S={store:{LICH_TRA_NO:{rows:data.rows,meta:data.meta}},data:{uiModules:J('UI_MODULES')}};
const localList_=new Function('S',lp+'\n'+lm+'\n'+m[0]+';return localList_')(S);
['villa','vinacapital','hd-77','vtb'].forEach(q=>assert.equal(localList_('LICH_TRA_NO',{q},{},1,25).total,1,'tìm "'+q+'"'));
assert.equal(localList_('LICH_TRA_NO',{q:'khong-co'},{},1,25).total,0);
// 3. CSV: localList_(…, all=true) trả toàn bộ, không cắt trang
S.store.GIAO_DICH_TIEN={rows:Array.from({length:60},(_,i)=>({MA_GIAO_DICH:'G'+i,SO_TIEN:1})),meta:{headers:['MA_GIAO_DICH','SO_TIEN'],amounts:['SO_TIEN']}};
assert.equal(localList_('GIAO_DICH_TIEN',{},{},1,25).rows.length,25);assert.equal(localList_('GIAO_DICH_TIEN',{},{},1,25,true).rows.length,60);
assert.match(html,/function exportCsv\(\)\{const k=S\.module,full=isLocal_\(k\)&&S\.store\[k\]/);
// 4. đổi phân hệ bỏ khoảng ngày cũ
assert.match(html,/function openModule_\(key\)\{[^\n]*S\.dateFrom='';S\.dateTo='';/);
// 5. CSS: không còn lớp/quy tắc cũ, không làm mờ cả trang khi tải
const css=html.split('<style>')[1].split('</style>')[0];
assert.doesNotMatch(css,/nav-direct|m-menu-home|start-group|view-loading|\{\s*\}/);
assert.doesNotMatch(html,/class="[^"]*(m-menu-home|start-group)/);
console.log('PASS V5.9.3: CSV đủ kết quả lọc, tìm theo tên khoản vay/công ty/ngân hàng, Nhật ký giữ dòng mới nhất & mới lên đầu, đổi phân hệ bỏ khoảng ngày, CSS sạch.');
