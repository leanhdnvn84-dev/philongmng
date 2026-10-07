// V5.9.8 – Tổng nguồn dư (Nguồn vốn), Chênh lệch Đủ/Đang hụt, Kế hoạch thu chi tự lấy gốc lãi theo ngày từ Lịch trả nợ
// và chi trả công nợ từ Phân bổ công nợ (tách từ công nợ phải trả), cột Thu/Chi tách riêng.
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
// ---- 1. Nguồn vốn: Tổng nguồn dư = Có thể giải ngân − Dư nợ phải trả; KPI bỏ Không thực hiện
put('NGUON_VON',['MA_NGUON_VON','KY_DU_KIEN','LOAI_NGUON','NOI_DUNG_PHUONG_AN','TONG_DU_KIEN','SO_TIEN_DA_DUYET','SO_TIEN_DA_GIAI_NGAN','CO_THE_GIAI_NGAN','KHONG_THE_GIAI_NGAN','DU_NO_PHAI_TRA','NGAY_DU_KIEN','TRANG_THAI','GHI_CHU'],
 [{MA_NGUON_VON:'NV1',KY_DU_KIEN:'2026-10',LOAI_NGUON:'VAY',CO_THE_GIAI_NGAN:128542702000,DU_NO_PHAI_TRA:97710176182,TRANG_THAI:'DU_KIEN'},{MA_NGUON_VON:'NV2',KY_DU_KIEN:'2026-10',LOAI_NGUON:'VAY',CO_THE_GIAI_NGAN:10,DU_NO_PHAI_TRA:30,TRANG_THAI:'DU_KIEN'},{MA_NGUON_VON:'NV3',KY_DU_KIEN:'2026-10',LOAI_NGUON:'VAY',CO_THE_GIAI_NGAN:999,TRANG_THAI:'KHONG_THUC_HIEN'}]);
const nv=J("getModuleData('NGUON_VON','',false)");assert.equal(nv.rows.find(r=>r.MA_NGUON_VON==='NV1').TONG_NGUON_DU,30832525818);assert.equal(nv.rows.find(r=>r.MA_NGUON_VON==='NV2').TONG_NGUON_DU,-20);
assert.ok(nv.meta.headers.includes('TONG_NGUON_DU'));assert.ok(!sheets.NGUON_VON.h.includes('TONG_NGUON_DU'),'cột tính – không ghi vào sheet');
const km=J("computeMetrics_(getModuleData('NGUON_VON','',false).rows,UI_MODULES.NGUON_VON.metrics)"),tn=km.find(m=>m.label==='Tổng nguồn dư');assert.equal(tn.value,30832525818-20);assert.equal(tn.gap,true);
// ---- 2. Chênh lệch có cờ Đủ/Đang hụt (Kế hoạch + Giao dịch)
assert.equal(J("computeMetrics_([{LOAI_THU_CHI:'THU',SO_TIEN_DU_KIEN:5,TRANG_THAI:'NHAP'},{LOAI_THU_CHI:'CHI',SO_TIEN_DU_KIEN:8,TRANG_THAI:'NHAP'}],UI_MODULES.KE_HOACH_THU_CHI.metrics)[2]").value,-3);
assert.equal(J("UI_MODULES.KE_HOACH_THU_CHI.metrics[2].gap"),1);assert.equal(J("UI_MODULES.GIAO_DICH_TIEN.metrics[3]").l,'Chênh lệch');
// ---- 3. Kế hoạch: gốc lãi theo ngày từ Lịch trả nợ (bỏ kỳ Hủy; đã trả hết → Đã thực hiện)
put('KHOAN_VAY',['MA_KHOAN_VAY','TEN_KHOAN_VAY','HAN_MUC_VAY','TRANG_THAI','DU_NO_GOC_BAN_DAU'],[{MA_KHOAN_VAY:'KV1',TEN_KHOAN_VAY:'A',HAN_MUC_VAY:1,TRANG_THAI:'DANG_VAY',DU_NO_GOC_BAN_DAU:1000}]);
put('PHAN_BO_TRA_NO',['MA_PHAN_BO','MA_LICH_TRA','NGAY_THANH_TOAN','GOC_DA_TRA'],[]);
put('LICH_TRA_NO',['MA_LICH_TRA','MA_KHOAN_VAY','KY_TRA_NO','NGAY_DEN_HAN','GOC_PHAI_TRA','LAI_PHAI_TRA','PHI_PHAI_TRA','DIEU_CHINH_TANG_GIAM','TRANG_THAI'],[
 {MA_LICH_TRA:'L1',MA_KHOAN_VAY:'KV1',KY_TRA_NO:'2026-10',NGAY_DEN_HAN:D(2026,10,10),GOC_PHAI_TRA:100,LAI_PHAI_TRA:10,TRANG_THAI:'DU_KIEN'},{MA_LICH_TRA:'L2',MA_KHOAN_VAY:'KV1',KY_TRA_NO:'2026-10',NGAY_DEN_HAN:D(2026,10,10),GOC_PHAI_TRA:50,LAI_PHAI_TRA:5,PHI_PHAI_TRA:1,TRANG_THAI:'DU_KIEN'},
 {MA_LICH_TRA:'L3',MA_KHOAN_VAY:'KV1',KY_TRA_NO:'2026-10',NGAY_DEN_HAN:D(2026,10,25),GOC_PHAI_TRA:7,LAI_PHAI_TRA:3,TRANG_THAI:'DA_THANH_TOAN'},{MA_LICH_TRA:'L4',MA_KHOAN_VAY:'KV1',KY_TRA_NO:'2026-10',NGAY_DEN_HAN:D(2026,10,25),GOC_PHAI_TRA:999,TRANG_THAI:'HUY'}]);
put('KE_HOACH_THU_CHI',['MA_KE_HOACH','KY_BAO_CAO','LOAI_THU_CHI','NOI_DUNG','NGAY_DU_KIEN','SO_TIEN_DU_KIEN','TRANG_THAI'],[{MA_KE_HOACH:'KH1',KY_BAO_CAO:'2026-10',LOAI_THU_CHI:'THU',NOI_DUNG:'Doanh thu',NGAY_DU_KIEN:D(2026,10,30),SO_TIEN_DU_KIEN:500,TRANG_THAI:'NHAP'}]);
// ---- 4. Công nợ phải trả → tách kỳ (Kế hoạch) → lên Kế hoạch thu chi; xác nhận đã trả → công nợ cập nhật
put('CONG_NO',['MA_CONG_NO','LOAI_CONG_NO','MA_DOI_TAC','SO_HOA_DON','NGAY_PHAT_SINH','HAN_THANH_TOAN','SO_TIEN_GOC','TRANG_THAI','NOI_DUNG'],[{MA_CONG_NO:'CN1',LOAI_CONG_NO:'PHAI_TRA',MA_DOI_TAC:'NCC Điện',SO_HOA_DON:'0012',NGAY_PHAT_SINH:D(2026,9,1),HAN_THANH_TOAN:D(2026,10,31),SO_TIEN_GOC:1000,TRANG_THAI:'MOI'},{MA_CONG_NO:'CN2',LOAI_CONG_NO:'PHAI_THU',MA_DOI_TAC:'KH',NGAY_PHAT_SINH:D(2026,9,1),HAN_THANH_TOAN:D(2099,1,1),SO_TIEN_GOC:50,TRANG_THAI:'MOI'}]);
put('PHAN_BO_CONG_NO',['MA_PHAN_BO','MA_CONG_NO','MA_GIAO_DICH','SO_TIEN_PHAN_BO','NGAY_PHAN_BO','GHI_CHU','NGUOI_TAO','TAO_LUC'],[]);
assert.throws(()=>run("splitPayable('CN2',{n:2,first:'2026-10-31',months:1})"),/phải trả/);
assert.deepEqual(J("(r=>[r.created,r.total])(splitPayable('CN1',{n:3,first:'2026-10-31',months:1}))"),[3,1000]);
const pb=J("readSheet_(openFinanceSpreadsheet_(),'PHAN_BO_CONG_NO',APP_MODULES.PHAN_BO_CONG_NO).rows");assert.deepEqual(pb.map(x=>[x.SO_TIEN_PHAN_BO,x.NGAY_PHAN_BO,x.TRANG_THAI]),[[333,'2026-10-31','KE_HOACH'],[333,'2026-11-30','KE_HOACH'],[334,'2026-12-31','KE_HOACH']]);
assert.equal(sheets.CONG_NO.rows[0][7],'MOI','kỳ kế hoạch chưa làm đổi trạng thái công nợ');assert.throws(()=>run("splitPayable('CN1',{n:2,first:'2027-01-31'})"),/phân bổ hết/);
const kh=J("getModuleData('KE_HOACH_THU_CHI','',true)").rows,auto=kh.filter(r=>r._AUTO);
assert.deepEqual(auto.filter(r=>r._AUTO==='LICH_TRA_NO').map(r=>[r.NGAY_DU_KIEN,r.SO_TIEN_DU_KIEN,r.TRANG_THAI,r.LOAI_THU_CHI]),[['2026-10-10',166,'DA_DUYET','CHI'],['2026-10-25',10,'DA_THUC_HIEN','CHI']]);
assert.match(auto[0].NOI_DUNG,/^Gốc lãi ngày 10\/10 \(2 kỳ trả nợ\)$/);
const cnRows=auto.filter(r=>r._AUTO==='PHAN_BO_CONG_NO');assert.equal(cnRows.length,3);assert.match(cnRows[0].NOI_DUNG,/Trả công nợ NCC Điện · HĐ 0012 · Kỳ 1\/3/);assert.equal(cnRows[0].KY_BAO_CAO,'2026-10');
// tổng chi kế hoạch tháng 10 = gốc lãi 176 + công nợ kỳ 1 (333); chênh lệch 500 − 509 = −9 → Đang hụt
const oct=kh.filter(r=>r.KY_BAO_CAO==='2026-10'),mk=J(`computeMetrics_(${JSON.stringify(oct)},UI_MODULES.KE_HOACH_THU_CHI.metrics)`);assert.deepEqual(mk.slice(0,3).map(m=>m.value),[500,509,-9]);
// xác nhận đã trả kỳ 1 → công nợ Thanh toán một phần; dòng kế hoạch thành Đã thực hiện
assert.equal(J(`confirmAllocationPaid('${pb[0].MA_PHAN_BO}',{date:'2026-10-30'})`).status,'THANH_TOAN_MOT_PHAN');assert.throws(()=>run(`confirmAllocationPaid('${pb[0].MA_PHAN_BO}',{date:'2026-10-30'})`),/đã ghi nhận/);
assert.equal(J("getModuleData('KE_HOACH_THU_CHI','',true)").rows.find(r=>r._SRC===pb[0].MA_PHAN_BO).TRANG_THAI,'DA_THUC_HIEN');
// dữ liệu nguồn đổi → phiên bản Kế hoạch đổi (trình duyệt tải lại)
const v1=J("getModuleData('KE_HOACH_THU_CHI','',false)").ver;assert.match(v1,/LICH_TRA_NO:.*PHAN_BO_CONG_NO:.*CONG_NO:/);
// ---- giao diện: cột Thu/Chi, nhãn Đủ/Đang hụt, dòng tự động chỉ xem
assert.match(html,/const SPLIT_COLS=\{KE_HOACH_THU_CHI:\{type:'LOAI_THU_CHI',amt:'SO_TIEN_DU_KIEN'/);assert.match(html,/\(v<0\?'Đang hụt':'Đủ'\)/);assert.match(html,/if\(r\._AUTO\)return\['VIEW_SOURCE'\]/);
console.log('PASS V5.9.8: Tổng nguồn dư, Chênh lệch Đủ/Đang hụt, Kế hoạch thu chi tự lấy gốc lãi theo ngày + trả công nợ phải trả (tách kỳ), cột Thu/Chi.');
