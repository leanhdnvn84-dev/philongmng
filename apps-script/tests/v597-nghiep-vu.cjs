// V5.9.7 – kiểm soát nghiệp vụ & tác vụ mới: duyệt/hoàn thành đúng trạng thái, chống tự duyệt, thanh toán kỳ trả/công nợ, quá hạn tự động,
// giải ngân, tạo giao dịch từ kế hoạch, sao chép số dư, đồng bộ lãi suất, khóa trường do hệ thống ghi, danh mục chuẩn, chuẩn hóa Khoản vay.
const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
const code=fs.readFileSync(__dirname+'/../Code.gs','utf8');
const store={},cache={get:k=>store[k]??null,put:(k,v)=>{store[k]=String(v)},remove:k=>{delete store[k]},getAll:ks=>{const o={};ks.forEach(k=>{if(store[k]!=null)o[k]=store[k]});return o},putAll:o=>Object.assign(store,o)};
const sheets={};
function sheet(name){const t=sheets[name];if(!t)return null;const v=()=>[t.h].concat(t.rows);
 return{getDataRange:()=>({getValues:v}),getLastColumn:()=>t.h.length,getLastRow:()=>t.rows.length+1,getMaxColumns:()=>t.h.length,getMaxRows:()=>t.rows.length+1,insertColumnsAfter(){},deleteRow:r=>t.rows.splice(r-2,1),
  getRange:(r,c,nr,nc)=>({getDisplayValues:()=>v().slice(r-1,r-1+(nr||1)).map(x=>x.slice(c-1,c-1+(nc||1)).map(y=>y instanceof VD?y.toISOString():String(y))),getValues:()=>v().slice(r-1,r-1+(nr||1)).map(x=>x.slice(c-1,c-1+(nc||1))),setValue(x){t.rows[r-2][c-1]=x},setValues(a){a.forEach((row,i)=>{t.rows[r-2+i]=t.rows[r-2+i]||[];row.forEach((x,j)=>t.rows[r-2+i][c-1+j]=x)})},setNumberFormat(){},copyFormatToRange(){}}),
  appendRow:a=>t.rows.push(a)}}
let who='ketoan@x.vn';
const ctx={console:{log(){},error(){}},CacheService:{getScriptCache:()=>cache},SpreadsheetApp:{openById:()=>({getSheetByName:sheet}),flush(){}},Session:{getActiveUser:()=>({getEmail:()=>who}),getEffectiveUser:()=>({getEmail:()=>who})},LockService:{getScriptLock:()=>({waitLock(){},tryLock(){return true},releaseLock(){}})},
 Utilities:{formatDate:(d,tz,f)=>{const p=n=>String(n).padStart(2,'0');return f==='yyyy-MM'?d.getFullYear()+'-'+p(d.getMonth()+1):f.indexOf('HH')>=0?d.getFullYear()+'-'+p(d.getMonth()+1)+'-'+p(d.getDate())+'T'+p(d.getHours())+':'+p(d.getMinutes())+':00':d.getFullYear()+'-'+p(d.getMonth()+1)+'-'+p(d.getDate())},getUuid:()=>Math.random().toString(16).slice(2)}};
vm.createContext(ctx);vm.runInContext(code,ctx);const run=s=>vm.runInContext(s,ctx),J=s=>JSON.parse(run('JSON.stringify('+s+')'));const VD=run('Date'),D=(y,m,d)=>new VD(y,m-1,d,12);
const today=run('todayKey_()'),past=D(2020,1,10),future=D(2099,1,10);
const H=(k,extra)=>J(`(c=>[c.idField].concat(c.required||[],c.columns||[],c.autoColumns||[],Object.keys(c.enums||{}),c.amounts||[],c.dates||[],c.percents||[]).filter((x,i,a)=>a.indexOf(x)===i&&!(c.virtual||[]).includes(x)))(APP_MODULES.${k})`).concat(extra||[],['GHI_CHU','NGUOI_TAO','TAO_LUC','CAP_NHAT_LUC']).filter((x,i,a)=>a.indexOf(x)===i);
const put=(k,rows,extra)=>{const h=H(k,extra);sheets[k]={h,rows:rows.map(o=>h.map(f=>o[f]==null?'':o[f]))}};const get=(k,id)=>{const t=sheets[k],ii=t.h.indexOf(J(`APP_MODULES.${k}.idField`)),r=t.rows.find(x=>x[ii]===id);return r?Object.fromEntries(t.h.map((f,i)=>[f,r[i]])):null};
const users=[['ketoan@x.vn','Kế toán','KE_TOAN','HOAT_DONG'],['duyet@x.vn','Người duyệt','NGUOI_DUYET','HOAT_DONG'],['admin@x.vn','Quản trị','ADMIN','HOAT_DONG']];
sheets.NGUOI_DUNG={h:['EMAIL','HO_TEN','VAI_TRO','TRANG_THAI','GHI_CHU'],rows:users.map(u=>u.concat(['']))};sheets.NHAT_KY={h:['MA_NHAT_KY','THOI_GIAN','EMAIL_NGUOI_DUNG','CHUC_NANG','MA_BAN_GHI','HANH_DONG','NOI_DUNG_THAY_DOI'],rows:[]};sheets.PHE_DUYET={h:['MA_PHE_DUYET','THOI_GIAN','LOAI_BAN_GHI','MA_BAN_GHI','TRANG_THAI_TRUOC','TRANG_THAI_SAU','QUYET_DINH','LY_DO','EMAIL_NGUOI_DUYET'],rows:[]};
const as=e=>{who=e;Object.keys(store).filter(k=>k.startsWith('USER_')).forEach(k=>delete store[k])};
// ---- 1. Giao dịch: Duyệt chỉ khi Chờ duyệt; Hoàn thành chỉ sau Duyệt; người lập không tự duyệt; Quản trị tự duyệt có ghi vết; Đối soát → Hoàn thành
put('GIAO_DICH_TIEN',[{MA_GIAO_DICH:'G1',NGAY_THUC_TE:D(2026,10,1),LOAI_GIAO_DICH:'CHI',SO_TIEN:100,NOI_DUNG:'x',TRANG_THAI:'NHAP',NGUOI_TAO:'ketoan@x.vn'},{MA_GIAO_DICH:'G2',NGAY_THUC_TE:D(2026,10,1),LOAI_GIAO_DICH:'THU',SO_TIEN:50,NOI_DUNG:'y',TRANG_THAI:'CHO_DUYET',NGUOI_TAO:'admin@x.vn'}],['NGAY_DOI_SOAT']);
as('ketoan@x.vn');assert.throws(()=>run("transitionRecord('GIAO_DICH_TIEN','G1','COMPLETE',{})"),/Không thể complete khi bản ghi đang ở trạng thái NHAP/);
run("transitionRecord('GIAO_DICH_TIEN','G1','SUBMIT',{})");
as('duyet@x.vn');run("transitionRecord('GIAO_DICH_TIEN','G1','APPROVE',{})");assert.equal(get('GIAO_DICH_TIEN','G1').TRANG_THAI,'DA_DUYET');
as('ketoan@x.vn');run("transitionRecord('GIAO_DICH_TIEN','G1','COMPLETE',{})");assert.equal(get('GIAO_DICH_TIEN','G1').TRANG_THAI,'DA_THUC_HIEN');
run("transitionRecord('GIAO_DICH_TIEN','G1','RECONCILE',{})");const g1=get('GIAO_DICH_TIEN','G1');assert.equal(g1.TRANG_THAI,'HOAN_THANH');assert.ok(g1.NGAY_DOI_SOAT instanceof VD,'đối soát ghi ngày đối soát');
// người duyệt (không phải quản trị) tự lập rồi tự duyệt → chặn
sheets.GIAO_DICH_TIEN.rows.push(sheets.GIAO_DICH_TIEN.h.map(f=>({MA_GIAO_DICH:'G3',NGAY_THUC_TE:D(2026,10,1),LOAI_GIAO_DICH:'CHI',SO_TIEN:5,NOI_DUNG:'z',TRANG_THAI:'CHO_DUYET',NGUOI_TAO:'duyet@x.vn'})[f]??''));
as('duyet@x.vn');assert.throws(()=>run("transitionRecord('GIAO_DICH_TIEN','G3','APPROVE',{})"),/không được tự duyệt/);
as('admin@x.vn');run("transitionRecord('GIAO_DICH_TIEN','G2','APPROVE',{})");assert.match(sheets.PHE_DUYET.rows.slice(-1)[0][7],/^\[Tự duyệt\]/,'quản trị tự duyệt phải được ghi vết');
// ---- 2. Lịch trả nợ: thanh toán một phần → đủ; xóa phân bổ → trạng thái quay lại; quá hạn tự động
put('KHOAN_VAY',[{MA_KHOAN_VAY:'KV1',TEN_KHOAN_VAY:'Vay A',HAN_MUC_VAY:1000,DU_NO_GOC_BAN_DAU:900,DU_NO_GOC_DAU_KY:900,NGAY_CHOT_DU_NO_DAU_KY:D(2026,8,31),LAI_SUAT_NAM:9,TRANG_THAI:'DANG_VAY'}],['MA_CONG_TY_VAY']);
put('LICH_TRA_NO',[{MA_LICH_TRA:'LT1',MA_KHOAN_VAY:'KV1',KY_TRA_NO:'2099-01',NGAY_DEN_HAN:future,GOC_PHAI_TRA:100,LAI_PHAI_TRA:10,PHI_PHAI_TRA:0,DIEU_CHINH_TANG_GIAM:0,TRANG_THAI:'DU_KIEN'},{MA_LICH_TRA:'LT2',MA_KHOAN_VAY:'KV1',KY_TRA_NO:'2020-01',NGAY_DEN_HAN:past,GOC_PHAI_TRA:100,LAI_PHAI_TRA:10,TRANG_THAI:'DU_KIEN'},{MA_LICH_TRA:'LT3',MA_KHOAN_VAY:'KV1',KY_TRA_NO:'2020-01',NGAY_DEN_HAN:past,GOC_PHAI_TRA:1,TRANG_THAI:'HUY'}],['LY_DO_DIEU_CHINH']);
put('PHAN_BO_TRA_NO',[]);
as('ketoan@x.vn');assert.throws(()=>run("payDebtSchedule('LT1',{date:'2026-10-05'})"),/số tiền/);
assert.equal(J("payDebtSchedule('LT1',{date:'2026-10-05',goc:60,lai:0,phi:0})").status,'DA_TRA_MOT_PHAN');
const pay2=J("payDebtSchedule('LT1',{date:'2026-10-06',goc:40,lai:10,phi:0,gd:'G1',note:'đủ'})");assert.equal(pay2.status,'DA_THANH_TOAN');
assert.equal(sheets.PHAN_BO_TRA_NO.rows.length,2);assert.throws(()=>run("payDebtSchedule('LT1',{date:'2026-10-07',goc:1})"),/thanh toán đủ/);
assert.throws(()=>run("payDebtSchedule('LT3',{date:'2026-10-07',goc:1})"),/hủy/);
// xóa phân bổ cuối → còn 60/110 → Đã trả một phần
as('admin@x.vn');run(`deleteRecord('PHAN_BO_TRA_NO','${pay2.id}')`);assert.equal(get('LICH_TRA_NO','LT1').TRANG_THAI,'DA_TRA_MOT_PHAN');
// sửa phân bổ còn lại về 0 → quay lại Dự kiến (chưa đến hạn)
const pb1=sheets.PHAN_BO_TRA_NO.rows[0][0];as('admin@x.vn');run(`saveRecord('PHAN_BO_TRA_NO',{MA_PHAN_BO:'${pb1}',MA_LICH_TRA:'LT1',NGAY_THANH_TOAN:'2026-10-05',GOC_DA_TRA:0,LAI_DA_TRA:0,PHI_DA_TRA:0})`);assert.equal(get('LICH_TRA_NO','LT1').TRANG_THAI,'DU_KIEN');
// quá hạn tự động khi mở phân hệ (1 lần/ngày): LT2 quá hạn, LT3 (Hủy) giữ nguyên
J("getModuleData('LICH_TRA_NO','',false)");assert.equal(get('LICH_TRA_NO','LT2').TRANG_THAI,'QUA_HAN');assert.equal(get('LICH_TRA_NO','LT3').TRANG_THAI,'HUY');
assert.ok(store['OVERDUE_LICH_TRA_NO_'+today]);assert.ok(sheets.NHAT_KY.rows.some(r=>r[5]==='DANH_DAU_QUA_HAN'));
// tổng Lịch trả nợ không cộng kỳ Hủy
const m=J("computeMetrics_([{MA_KHOAN_VAY:'A',NGAY_DEN_HAN:'1',TONG_DU_NO:9,GOC_PHAI_TRA:5,DU_NO_SAU_KHI_TRA:4,LAI_PHAI_TRA:1,TRANG_THAI:'DU_KIEN'},{MA_KHOAN_VAY:'A',NGAY_DEN_HAN:'2',TONG_DU_NO:4,GOC_PHAI_TRA:4,DU_NO_SAU_KHI_TRA:0,LAI_PHAI_TRA:1,TRANG_THAI:'HUY'}],UI_MODULES.LICH_TRA_NO.metrics)").map(x=>x.value);
assert.deepEqual(m,[9,5,4,1,6]);
// Kỳ trả nợ tự theo ngày đến hạn khi để trống
as('ketoan@x.vn');const nid=J("saveRecord('LICH_TRA_NO',{MA_KHOAN_VAY:'KV1',NGAY_DEN_HAN:'2026-11-25',GOC_PHAI_TRA:5,TRANG_THAI:'DU_KIEN'})").id;assert.equal(get('LICH_TRA_NO',nid).KY_TRA_NO,'2026-11');
// ---- 3. Khoản vay: Dư nợ gốc đầu kỳ / Ngày chốt không sửa tay được khi sửa (chỉ Đồng bộ ghi)
run("saveRecord('KHOAN_VAY',{MA_KHOAN_VAY:'KV1',TEN_KHOAN_VAY:'Vay A',HAN_MUC_VAY:1000,DU_NO_GOC_DAU_KY:1,NGAY_CHOT_DU_NO_DAU_KY:'2026-01-01'})");assert.equal(get('KHOAN_VAY','KV1').DU_NO_GOC_DAU_KY,900);
// ---- 4. Lịch sử lãi suất là nguồn gốc: mức mới nhất đã áp dụng → Khoản vay
put('LICH_SU_LAI_SUAT',[]);run("saveRecord('LICH_SU_LAI_SUAT',{MA_KHOAN_VAY:'KV1',NGAY_AP_DUNG:'2026-01-01',LAI_SUAT_NAM:10.5})");assert.equal(get('KHOAN_VAY','KV1').LAI_SUAT_NAM,10.5);
run("saveRecord('LICH_SU_LAI_SUAT',{MA_KHOAN_VAY:'KV1',NGAY_AP_DUNG:'2099-01-01',LAI_SUAT_NAM:20})");assert.equal(get('KHOAN_VAY','KV1').LAI_SUAT_NAM,10.5,'mức tương lai chưa áp dụng');
// ---- 5. Công nợ: thanh toán + quá hạn
put('CONG_NO',[{MA_CONG_NO:'CN1',LOAI_CONG_NO:'PHAI_TRA',MA_DOI_TAC:'NCC A',NGAY_PHAT_SINH:D(2026,1,1),HAN_THANH_TOAN:future,SO_TIEN_GOC:500,TRANG_THAI:'MOI'},{MA_CONG_NO:'CN2',LOAI_CONG_NO:'PHAI_THU',MA_DOI_TAC:'KH B',NGAY_PHAT_SINH:D(2019,1,1),HAN_THANH_TOAN:past,SO_TIEN_GOC:10,TRANG_THAI:'MOI'}]);put('PHAN_BO_CONG_NO',[]);
assert.equal(J("payReceivable('CN1',{date:'2026-10-05',amount:200})").status,'THANH_TOAN_MOT_PHAN');assert.equal(J("payReceivable('CN1',{date:'2026-10-05',amount:300})").status,'DA_THANH_TOAN');
J("getModuleData('CONG_NO','',false)");assert.equal(get('CONG_NO','CN2').TRANG_THAI,'QUA_HAN');
// ---- 6. Kế hoạch đã duyệt → tạo giao dịch Nháp, kế hoạch Đã thực hiện
put('KE_HOACH_THU_CHI',[{MA_KE_HOACH:'KH1',KY_BAO_CAO:'2026-10',LOAI_THU_CHI:'CHI',NOI_DUNG:'Trả lương',NGAY_DU_KIEN:D(2026,10,10),SO_TIEN_DU_KIEN:777,TRANG_THAI:'DA_DUYET'},{MA_KE_HOACH:'KH2',KY_BAO_CAO:'2026-10',LOAI_THU_CHI:'THU',NOI_DUNG:'x',NGAY_DU_KIEN:D(2026,10,10),SO_TIEN_DU_KIEN:1,TRANG_THAI:'NHAP'}],['MA_CONG_TY','MA_DU_AN','MA_NHOM_THU_CHI','MA_DOI_TUONG','MA_TIEN_TE']);
sheets.GIAO_DICH_TIEN.h.push('MA_KE_HOACH');sheets.GIAO_DICH_TIEN.rows.forEach(r=>r.push(''));
assert.throws(()=>run("createTransactionFromPlan('KH2')"),/đã duyệt/);const gx=J("createTransactionFromPlan('KH1')").id,gr=get('GIAO_DICH_TIEN',gx);
assert.equal(gr.SO_TIEN,777);assert.equal(gr.LOAI_GIAO_DICH,'CHI');assert.equal(gr.TRANG_THAI,'NHAP');assert.equal(gr.MA_KE_HOACH,'KH1');assert.equal(get('KE_HOACH_THU_CHI','KH1').TRANG_THAI,'DA_THUC_HIEN');
// ---- 7. Nguồn vốn: giải ngân cộng dồn
put('NGUON_VON',[{MA_NGUON_VON:'NV1',LOAI_NGUON:'VAY',KY_DU_KIEN:'2026-10',TONG_DU_KIEN:1000,SO_TIEN_DA_DUYET:800,SO_TIEN_DA_GIAI_NGAN:0,TRANG_THAI:'DA_DUYET'}],['NGAY_THUC_NHAN']);
assert.equal(J("disburseFunding('NV1',{date:'2026-10-05',amount:300})").status,'GIAI_NGAN_MOT_PHAN');const d2=J("disburseFunding('NV1',{date:'2026-10-06',amount:500})");assert.equal(d2.status,'DA_GIAI_NGAN');assert.equal(get('NGUON_VON','NV1').SO_TIEN_DA_GIAI_NGAN,800);
assert.throws(()=>run("disburseFunding('NV1',{date:'2026-10-06',amount:1})"),/đã duyệt/);
// ---- 8. Số dư đầu kỳ: sao chép sang ngày chốt mới, bỏ qua tài khoản đã có
put('SO_DU_DAU_KY',[{MA_SO_DU:'SD1',MA_TAI_KHOAN:'TK1',NGAY_CHOT:D(2026,9,30),MA_TIEN_TE:'VND',SO_DU:100},{MA_SO_DU:'SD2',MA_TAI_KHOAN:'TK2',NGAY_CHOT:D(2026,9,30),SO_DU:200},{MA_SO_DU:'SD3',MA_TAI_KHOAN:'TK2',NGAY_CHOT:D(2026,10,31),SO_DU:250}]);
assert.deepEqual(J("(r=>[r.created,r.skipped])(copyOpeningBalances('2026-09-30','2026-10-31'))"),[1,1]);assert.equal(sheets.SO_DU_DAU_KY.rows.length,4);
// ---- 9. Danh mục chuẩn từ dữ liệu đang dùng (không trùng, chạy lại an toàn)
put('DANH_MUC',[]);sheets.KHOAN_VAY.rows[0][sheets.KHOAN_VAY.h.indexOf('MA_CONG_TY_VAY')]='CÔNG TY A';sheets.KHOAN_VAY.rows[0][sheets.KHOAN_VAY.h.indexOf('MA_NGAN_HANG')]='Vietinbank-Hội An';
assert.match(run('xemTruoc_TaoDanhMuc()'),/CONG_TY \| CÔNG TY A[\s\S]*NGAN_HANG \| Vietinbank-Hội An/);as('admin@x.vn');run('taoDanhMucTuDuLieu()');const n1=sheets.DANH_MUC.rows.length;assert.ok(n1>=3);run('taoDanhMucTuDuLieu()');assert.equal(sheets.DANH_MUC.rows.length,n1,'chạy lại không tạo trùng');
assert.equal(J("buildLookups_({DANH_MUC:readSheet_(openFinanceSpreadsheet_(),'DANH_MUC',APP_MODULES.DANH_MUC).rows}).DANH_MUC.find(x=>x.value==='CÔNG TY A').type"),'CONG_TY');
// ---- 10. Chuẩn hóa Khoản vay: ngày ký đảo, đáo hạn nằm nhầm ô giải ngân, hạn mức < dư nợ; chỉ điền ô trống
put('KHOAN_VAY',[{MA_KHOAN_VAY:'KV-T9-001',TEN_KHOAN_VAY:'Vietinbank Villa',NGAY_KY:D(2020,7,4),NGAY_GIAI_NGAN_DAU:D(2040,7,4),HAN_MUC_VAY:800,TONG_GOC_GIAI_NGAN:900,DU_NO_GOC_BAN_DAU:521,TRANG_THAI:'DANG_VAY'},{MA_KHOAN_VAY:'KV-T9-006',TEN_KHOAN_VAY:'Khu A',HAN_MUC_VAY:6,DU_NO_GOC_BAN_DAU:161,LAI_SUAT_NAM:11,TRANG_THAI:'DANG_VAY'},{MA_KHOAN_VAY:'KV-X',TEN_KHOAN_VAY:'Ngoài',HAN_MUC_VAY:1,TRANG_THAI:'DANG_VAY'}],['SO_HOP_DONG']);
const pv=run('xemTruoc_ChuanHoaKhoanVay()');assert.match(pv,/KV-T9-001: .*Ngày ký bị đảo ngày\/tháng 2020-07-04 → 2020-04-07/);assert.match(pv,/Ngày đáo hạn ← báo cáo/);assert.match(pv,/Xóa Ngày giải ngân đầu 2040-07-04/);assert.match(pv,/KV-T9-006: .*Xóa hạn mức 6/);assert.doesNotMatch(pv,/KV-X/);
run('chuanHoaDuLieuKhoanVay()');const a=get('KHOAN_VAY','KV-T9-001'),b=get('KHOAN_VAY','KV-T9-006');
assert.equal(run('serializeCell_')(a.NGAY_KY,'NGAY_KY'),'2020-04-07');assert.equal(run('serializeCell_')(a.NGAY_DAO_HAN,'NGAY_DAO_HAN'),'2027-04-06');assert.equal(a.NGAY_GIAI_NGAN_DAU,'');assert.equal(a.LAI_SUAT_NAM,12);assert.equal(a.SO_HOP_DONG,'809003937612 / 807003940868');assert.equal(a.HAN_MUC_VAY,800,'hạn mức ≥ dư nợ giữ nguyên');
assert.equal(b.HAN_MUC_VAY,'');assert.equal(b.LAI_SUAT_NAM,11,'không ghi đè lãi suất đã có');
assert.match(run('xemTruoc_ChuanHoaKhoanVay()'),/^Sẽ chuẩn hóa 0/,'chạy lại an toàn');
// ---- 11. Cấu hình giao diện
assert.equal(run("APP_MODULES.KHOAN_VAY.columns[0]"),'MA_CONG_TY_VAY');assert.equal(run("UI_MODULES.KHOAN_VAY.card.title"),'MA_CONG_TY_VAY');
assert.ok(!run("UI_MODULES.LICH_TRA_NO.actions.includes('ALLOCATE')||UI_MODULES.CHUNG_TU.actions.includes('REPLACE_FILE')"),'bỏ tác vụ trùng');
assert.ok(J("Object.keys(FORM_LAYOUT_)").includes('KHOAN_VAY'));assert.equal(run("APP_MODULES.THU_CHI.title"),'Thu chi (lưu trữ)');
console.log('PASS V5.9.7: duyệt/hoàn thành đúng trạng thái, chống tự duyệt, thanh toán kỳ trả & công nợ, quá hạn tự động, giải ngân, giao dịch từ kế hoạch, sao chép số dư, lãi suất theo lịch sử, khóa trường hệ thống, danh mục chuẩn, chuẩn hóa Khoản vay.');
