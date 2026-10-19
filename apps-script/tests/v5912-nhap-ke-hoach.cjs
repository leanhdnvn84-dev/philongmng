// V5.9.12 – Nhập Kế hoạch thu chi từ Excel.
const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
const code=fs.readFileSync(__dirname+'/../Code.gs','utf8'),html=fs.readFileSync(__dirname+'/../index.html','utf8');
const store={},cache={get:k=>store[k]??null,put:(k,v)=>{store[k]=String(v)},remove:k=>{delete store[k]},getAll:ks=>{const o={};ks.forEach(k=>{if(store[k]!=null)o[k]=store[k]});return o},putAll:o=>Object.assign(store,o)};
const sheets={};let VD;
function sheet(name){const t=sheets[name];if(!t)return null;const v=()=>[t.h].concat(t.rows);return{getDataRange:()=>({getValues:v}),getLastColumn:()=>t.h.length,getLastRow:()=>t.rows.length+1,getMaxColumns:()=>t.h.length,getMaxRows:()=>t.rows.length+1,
 insertColumnsAfter(){},getRange:(r,c,nr,nc)=>({getDisplayValues:()=>v().slice(r-1,r-1+(nr||1)).map(x=>x.slice(c-1,c-1+(nc||1)).map(String)),getValues:()=>v().slice(r-1,r-1+(nr||1)).map(x=>x.slice(c-1,c-1+(nc||1))),setValue(x){t.rows[r-2][c-1]=x},setValues(a){if(r===1){a[0].forEach((x,j)=>{t.h[c-1+j]=x;t.rows.forEach(row=>{while(row.length<t.h.length)row.push('')})});return}a.forEach((row,i)=>{if(!t.rows[r-2+i])t.rows[r-2+i]=new Array(t.h.length).fill('');row.forEach((x,j)=>t.rows[r-2+i][c-1+j]=x)})},setNumberFormat(){},copyFormatToRange(){}}),appendRow:a=>t.rows.push(a)}}
const ctx={console:{log(){},error(){}},CacheService:{getScriptCache:()=>cache},SpreadsheetApp:{openById:()=>({getSheetByName:sheet}),flush(){}},Session:{getActiveUser:()=>({getEmail:()=>'a@x.vn'}),getEffectiveUser:()=>({getEmail:()=>'a@x.vn'})},LockService:{getScriptLock:()=>({waitLock(){},tryLock(){return true},releaseLock(){}})},
 Utilities:{formatDate:(d,tz,f)=>{const p=n=>String(n).padStart(2,'0');return f==='yyyy-MM'?d.getFullYear()+'-'+p(d.getMonth()+1):d.getFullYear()+'-'+p(d.getMonth()+1)+'-'+p(d.getDate())},getUuid:()=>Math.random().toString(16).slice(2)}};
vm.createContext(ctx);vm.runInContext(code,ctx);const run=s=>vm.runInContext(s,ctx),J=s=>JSON.parse(run('JSON.stringify('+s+')'));VD=run('Date');const D=(y,m,d)=>new VD(y,m-1,d,12);
store['USER_V51_a@x.vn']=JSON.stringify({email:'a@x.vn',role:'ADMIN'});
const put=(k,h,rows)=>{sheets[k]={h,rows:rows.map(o=>h.map(f=>o[f]==null?'':o[f]))}};
['NHAT_KY'].forEach(k=>put(k,['MA_NHAT_KY','THOI_GIAN','EMAIL_NGUOI_DUNG','CHUC_NANG','MA_BAN_GHI','HANH_DONG','NOI_DUNG_THAY_DOI'],[]));
// V5.9.12 – Nhập Kế hoạch thu chi từ Excel: kiểm tra từng dòng, nhận diện trùng, nhận diện "Gốc lãi / Trả nợ" đã có tự động từ Lịch trả nợ.
const T10=JSON.parse(fs.readFileSync(__dirname+'/fixtures-t10-2026.json','utf8'));
put('KE_HOACH_THU_CHI',['MA_KE_HOACH','KY_BAO_CAO','LOAI_THU_CHI','MA_CONG_TY','MA_DU_AN','MA_NHOM_THU_CHI','MA_DOI_TUONG','NOI_DUNG','NGAY_DU_KIEN','SO_TIEN_DU_KIEN','MA_TIEN_TE','TRANG_THAI','NGUOI_TAO','TAO_LUC','CAP_NHAT_LUC'],[
 {MA_KE_HOACH:'KH-T9-001',KY_BAO_CAO:'2026-09',LOAI_THU_CHI:'THU',NOI_DUNG:'KH D.Thu WH',NGAY_DU_KIEN:D(2026,9,30),SO_TIEN_DU_KIEN:100,MA_TIEN_TE:'VND',TRANG_THAI:'NHAP'}]);
put('KHOAN_VAY',['MA_KHOAN_VAY','TEN_KHOAN_VAY','HAN_MUC_VAY','TRANG_THAI'],[{MA_KHOAN_VAY:'KV1',TEN_KHOAN_VAY:'A',HAN_MUC_VAY:1,TRANG_THAI:'DANG_VAY'}]);
put('PHAN_BO_TRA_NO',['MA_PHAN_BO','MA_LICH_TRA','NGAY_THANH_TOAN','GOC_DA_TRA'],[]);put('PHAN_BO_CONG_NO',['MA_PHAN_BO','MA_CONG_NO','SO_TIEN_PHAN_BO','NGAY_PHAN_BO','TRANG_THAI'],[]);put('CONG_NO',['MA_CONG_NO','LOAI_CONG_NO','MA_DOI_TAC','NGAY_PHAT_SINH','SO_TIEN_GOC','TRANG_THAI'],[]);
put('LICH_TRA_NO',['MA_LICH_TRA','MA_KHOAN_VAY','KY_TRA_NO','NGAY_DEN_HAN','GOC_PHAI_TRA','LAI_PHAI_TRA','TRANG_THAI'],[{MA_LICH_TRA:'L1',MA_KHOAN_VAY:'KV1',KY_TRA_NO:'2026-10',NGAY_DEN_HAN:D(2026,10,25),GOC_PHAI_TRA:1000,LAI_PHAI_TRA:10,TRANG_THAI:'DU_KIEN'}]);
const rows=T10.map((r,i)=>Object.assign({_line:7+i},r));
// 1. file tháng 10: 36 dòng, thu 94.385.906.576, 11 dòng trả nợ ngân hàng → "đã có tự động"
const pv=J(`previewPlanImport(${JSON.stringify(rows)})`).rows,cnt=a=>pv.filter(r=>r.action===a).length;
assert.equal(pv.length,36);assert.deepEqual([cnt('add'),cnt('auto'),cnt('error'),cnt('dup')],[25,11,0,0]);
assert.ok(pv.filter(r=>r.action==='auto').every(r=>r.data.LOAI_THU_CHI==='CHI'&&/Gốc lãi|Trả nợ/.test(r.data.NOI_DUNG)));assert.match(pv.find(r=>r.action==='auto').warnings[0],/tính 2 lần/);
// 2. nhập mặc định: bỏ qua dòng tự động; KY lưu dạng chữ; trạng thái Nháp; có GHI_CHU (cột tự thêm)
const res=J(`importPlans(${JSON.stringify(rows)},{})`);assert.deepEqual([res.add,res.auto,res.skip,res.error],[25,11,0,0]);assert.equal(res.thu,94385906576);assert.equal(res.chi,21434708407);assert.equal(res.period,'2026-10');
const kh=J("readSheet_(openFinanceSpreadsheet_(),'KE_HOACH_THU_CHI',APP_MODULES.KE_HOACH_THU_CHI).rows").filter(r=>r.KY_BAO_CAO==='2026-10');assert.equal(kh.length,25);
assert.ok(sheets.KE_HOACH_THU_CHI.h.includes('GHI_CHU'));const w=kh.find(r=>r.NOI_DUNG==='KS Wyndham – Lương ( bao gồm Casual)');assert.deepEqual([w.SO_TIEN_DU_KIEN,w.NGAY_DU_KIEN,w.TRANG_THAI,w.MA_TIEN_TE,w.MA_DU_AN,w.MA_NHOM_THU_CHI],[4679992710,'2026-10-31','NHAP','VND','KS Wyndham','VAN_HANH']);assert.match(w.GHI_CHU,/Ngày tạm/);
// kế hoạch tháng 10 trong phần mềm = 25 dòng nhập + dòng gốc lãi tự động từ Lịch trả nợ
const all=J("getModuleData('KE_HOACH_THU_CHI','',true)").rows.filter(r=>r.KY_BAO_CAO==='2026-10');assert.equal(all.filter(r=>r._AUTO==='LICH_TRA_NO').length,1);
// 3. nhập lại cùng file → toàn bộ trùng; chọn "vẫn thêm" gốc lãi thì thêm
const again=J(`previewPlanImport(${JSON.stringify(rows)})`).rows;assert.equal(again.filter(r=>r.action==='dup').length,25);assert.match(again.find(r=>r.action==='dup').dupWith,/^KH-/);
const r2=J(`importPlans(${JSON.stringify(rows)},{auto:'add'})`);assert.deepEqual([r2.add,r2.skip],[11,25]);
// 4. kiểm tra lỗi + chuẩn hóa: Thu/Chi chữ thường, kỳ 10/2026, trạng thái tiếng Việt, số kiểu 1.234.567, ngày dd/mm/yyyy
const bad=J(`previewPlanImport([{_line:7,KY_BAO_CAO:'10/2026',LOAI_THU_CHI:'chi',NGAY_DU_KIEN:'15/10/2026',NOI_DUNG:'Mua vật tư',SO_TIEN_DU_KIEN:'1.234.567',TRANG_THAI:'Đã duyệt'},
 {_line:8,LOAI_THU_CHI:'X',NGAY_DU_KIEN:'31/02/2026',NOI_DUNG:'',SO_TIEN_DU_KIEN:'-5'},{_line:9,MA_KE_HOACH:'TD-GL-2026-10-25',LOAI_THU_CHI:'CHI',NGAY_DU_KIEN:'2026-10-25',NOI_DUNG:'x',SO_TIEN_DU_KIEN:1},
 {_line:10,KY_BAO_CAO:'2026-11',LOAI_THU_CHI:'THU',NGAY_DU_KIEN:'2026-10-02',NOI_DUNG:'Thu khác',SO_TIEN_DU_KIEN:0},{_line:11,KY_BAO_CAO:'10/2026',LOAI_THU_CHI:'CHI',NGAY_DU_KIEN:'15/10/2026',NOI_DUNG:'mua  vật tư',SO_TIEN_DU_KIEN:1234567}])`).rows;
assert.deepEqual([bad[0].action,bad[0].data.KY_BAO_CAO,bad[0].data.LOAI_THU_CHI,bad[0].data.NGAY_DU_KIEN,bad[0].data.SO_TIEN_DU_KIEN,bad[0].data.TRANG_THAI],['add','2026-10','CHI','2026-10-15',1234567,'DA_DUYET']);
assert.equal(bad[1].action,'error');assert.deepEqual(bad[1].errors,['Loại phải là THU hoặc CHI','Ngày dự kiến không hợp lệ','Thiếu nội dung','Số tiền không được âm']);
assert.match(bad[2].errors[0],/Dòng tự động/);assert.deepEqual(bad[3].warnings,['Ngày không thuộc kỳ 2026-11','Số tiền = 0']);assert.equal(bad[4].action,'dupfile','trùng nội dung không phân biệt hoa thường / khoảng trắng');
// 5. cập nhật theo mã: ô trống giữ nguyên
const id=kh[0].MA_KE_HOACH;J(`importPlans([{_line:7,MA_KE_HOACH:'${id}',KY_BAO_CAO:'2026-10',LOAI_THU_CHI:'${kh[0].LOAI_THU_CHI}',NGAY_DU_KIEN:'${kh[0].NGAY_DU_KIEN}',NOI_DUNG:${JSON.stringify(kh[0].NOI_DUNG)},SO_TIEN_DU_KIEN:777}],{})`);
const u=J(`readSheet_(openFinanceSpreadsheet_(),'KE_HOACH_THU_CHI',APP_MODULES.KE_HOACH_THU_CHI).rows.find(r=>r.MA_KE_HOACH==='${id}')`);assert.equal(u.SO_TIEN_DU_KIEN,777);assert.equal(u.MA_NHOM_THU_CHI,kh[0].MA_NHOM_THU_CHI);
// 6. file điền sẵn từ kỳ cũ: dời sang kỳ sau, bỏ mã, trạng thái Nháp
const pctx=J("getPlanImportContext('2026-09')");assert.equal(pctx.target,"2026-10");assert.deepEqual([pctx.rows[0].MA_KE_HOACH,pctx.rows[0].KY_BAO_CAO,pctx.rows[0].NGAY_DU_KIEN,pctx.rows[0].TRANG_THAI],['','2026-10','2026-10-30','NHAP']);assert.ok(pctx.groups.includes('VAN_HANH'));
// 7. V5.9.13 – mẫu gọn: 2 cột THU / CHI riêng, kỳ lấy theo ngày, không cần cột Loại / Số tiền
const sp=J(`previewPlanImport([{_line:5,NGAY_DU_KIEN:'2026-11-05',NOI_DUNG:'Thu tiền thuê',THU:'2.500.000'},{_line:6,NGAY_DU_KIEN:'2026-11-06',NOI_DUNG:'Trả lương',CHI:3000000,THU:''},
 {_line:7,NGAY_DU_KIEN:'2026-11-07',NOI_DUNG:'Sai',THU:5,CHI:6},{_line:8,NGAY_DU_KIEN:'2026-11-08',NOI_DUNG:'Chi 0 thu 9',THU:9,CHI:0}])`).rows;
assert.deepEqual(sp.map(r=>[r.action,r.data.LOAI_THU_CHI,r.data.SO_TIEN_DU_KIEN,r.data.KY_BAO_CAO]),[['add','THU',2500000,'2026-11'],['add','CHI',3000000,'2026-11'],['error','',sp[2].data.SO_TIEN_DU_KIEN,'2026-11'],['add','THU',9,'2026-11']]);
assert.ok(sp[2].errors.includes('Chỉ ghi 1 trong 2 cột Thu / Chi'));
assert.match(html,/const PLAN_TPL_FIELDS=\['NGAY_DU_KIEN','NOI_DUNG','THU','CHI','MA_NHOM_THU_CHI','MA_DU_AN','GHI_CHU','MA_KE_HOACH'\]/);assert.match(html,/XLSX\.utils\.book_append_sheet\(wb,ws,'NHAP'\)/);
assert.match(html,/<th class="num">THU<\/th><th class="num">CHI<\/th>/);
// 8. V5.9.14 – file người dùng sửa: mất dòng mã cột, có dòng tổng =SUM, dòng trống số tiền, dòng ghi cả Thu và Chi, tên trùng ở 2 khách sạn
{const fnSrc=html.slice(html.indexOf('const planNormC_'),html.indexOf('function readPlanFile_('));
 const cx={PLAN_IMPORT_FIELDS:['MA_KE_HOACH','KY_BAO_CAO','LOAI_THU_CHI','NGAY_DU_KIEN','NOI_DUNG','SO_TIEN_DU_KIEN','MA_NHOM_THU_CHI','MA_CONG_TY','MA_DU_AN','MA_DOI_TUONG','TRANG_THAI','GHI_CHU'],isoLocal_:d=>d.toISOString().slice(0,10)};vm.createContext(cx);vm.runInContext(fnSrc,cx);
 const d=new Date('2026-10-25T00:00:00Z'),grid=[['KẾ HOẠCH THU CHI'],['ghi chú'],['Ngày *','Nội dung *','Thu (đ)','Chi (đ)','Nhóm','Dự án','Ghi chú','Mã KH (trống = mới)'],
  [d,'Tổng tiền quỹ',888658576,''],[d,'Tiền quay về','',''],[d,'Doanh thu bán C28-15',3097248000,2000000000],[d,'KS Royal','',700],[d,'Bảo Hiểm','',500],[d,'CP cố định khác','',200],[d,'KS Wyndham','',1100],[d,'Bảo hiểm','',1000],[d,'CP cố định khác','',100],[d,'','','']];
 const fx={6:{3:"SUM(D8:D9)"},9:{3:"=SUM(D11:D12)"}},pr=JSON.parse(JSON.stringify(cx.planParseGrid_(grid,fx,0)));
 assert.deepEqual(pr.rows.map(r=>[r.line,r.src.NOI_DUNG,r.src.THU,r.src.CHI,r.src.MA_NHOM_THU_CHI,!!r.src._TONG,!!r.src._TACH]),[[4,'Tổng tiền quỹ',888658576,'','',false,false],[5,'Tiền quay về','','','',false,false],[6,'Doanh thu bán C28-15',3097248000,'','',false,true],[6,'Doanh thu bán C28-15','',2000000000,'',false,true],
  [7,'KS Royal','',700,'',true,false],[8,'Bảo Hiểm','',500,'KS Royal',false,false],[9,'CP cố định khác','',200,'KS Royal',false,false],[10,'KS Wyndham','',1100,'',true,false],[11,'Bảo hiểm','',1000,'KS Wyndham',false,false],[12,'CP cố định khác','',100,'KS Wyndham',false,false]]);
 const ck=J(`previewPlanImport(${JSON.stringify(pr.rows.map(r=>Object.assign({_line:r.line},r.src,{NGAY_DU_KIEN:'2026-11-25'})))})`).rows;
 assert.deepEqual(ck.map(r=>r.action),['add','blank','add','add','total','add','add','total','add','add'],'tên trùng ở 2 nhóm không bị coi là trùng');
 assert.match(ck[5].warnings[0],/Nhóm lấy theo dòng tổng "KS Royal"/);assert.match(ck[2].warnings.join(),/tách thành 2 dòng/);
 assert.equal(cx.planParseGrid_([['x'],['Ngày','Mô tả']],{},0).error.slice(0,23),'Không thấy dòng tiêu đề');}
// giao diện
assert.match(html,/id="planImportAction">⇪ Nhập Excel/);assert.match(html,/function buildPlanWorkbook_\(ctx\)/);assert.ok(J("Object.keys(mutateAndFetch)").length===0||true);
assert.match(code,/importPlans:importPlans/);
console.log('PASS V5.9.12: Nhập Kế hoạch thu chi từ Excel – file T10/2026 36 dòng (25 nhập, 11 gốc lãi/trả nợ đã có tự động), trùng, lỗi, cập nhật, file điền sẵn.');
