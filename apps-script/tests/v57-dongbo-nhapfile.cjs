// V5.7 – Đồng bộ dư nợ (phương án ③, số theo gốc thực trả) + Nhập lịch trả nợ từ file.
const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
const code=fs.readFileSync(__dirname+'/../Code.gs','utf8');
const ctx={console,Utilities:{formatDate(d,tz,p){const z=n=>String(n).padStart(2,'0');return String(p).replace('yyyy',d.getFullYear()).replace('MM',z(d.getMonth()+1)).replace('dd',z(d.getDate()))},getUuid(){return 'ABCDE-0000'}},HtmlService:{createHtmlOutputFromFile(){return{setTitle(){return this},setXFrameOptionsMode(){return this}}},XFrameOptionsMode:{ALLOWALL:1}}};
vm.createContext(ctx);vm.runInContext(code,ctx);const run=s=>vm.runInContext(s,ctx),J=s=>JSON.parse(run('JSON.stringify('+s+')'));
// Tình huống: KV-VCB-01 gốc 12.500.000.000; T10: 6 kỳ × 10tr; 4 kỳ trả đủ, 1 kỳ trả 5tr, 1 kỳ quá hạn.
run(`var DB={KHOAN_VAY:[{MA_KHOAN_VAY:'KV1',TEN_KHOAN_VAY:'Vay A',MA_NGAN_HANG:'VCB',TRANG_THAI:'DANG_VAY',DU_NO_GOC_DAU_KY:12500000000,NGAY_CHOT_DU_NO_DAU_KY:'',DU_NO_GOC_BAN_DAU:'',NGAY_GOC_BAN_DAU:''},{MA_KHOAN_VAY:'KV2',TEN_KHOAN_VAY:'Đã trả hết',TRANG_THAI:'DANG_VAY',DU_NO_GOC_BAN_DAU:0,DU_NO_GOC_DAU_KY:0,TONG_GOC_GIAI_NGAN:3000000000,NGAY_CHOT_DU_NO_DAU_KY:''},{MA_KHOAN_VAY:'KV3',TRANG_THAI:'DA_TAT_TOAN',DU_NO_GOC_DAU_KY:0}],
 LICH_TRA_NO:[1,6,11,16,21,26].map((d,i)=>({MA_LICH_TRA:'L'+d,MA_KHOAN_VAY:'KV1',NGAY_DEN_HAN:'2026-10-'+String(d).padStart(2,'0'),GOC_PHAI_TRA:10000000,TRANG_THAI:['DA_THANH_TOAN','DA_THANH_TOAN','DA_THANH_TOAN','DA_THANH_TOAN','DA_TRA_MOT_PHAN','QUA_HAN'][i]})).concat([{MA_LICH_TRA:'N1',MA_KHOAN_VAY:'KV1',NGAY_DEN_HAN:'2026-11-05',GOC_PHAI_TRA:60000000,TRANG_THAI:'DU_KIEN'}]),
 PHAN_BO_TRA_NO:[1,6,11,16].map(d=>({MA_LICH_TRA:'L'+d,NGAY_THANH_TOAN:'2026-10-'+String(d).padStart(2,'0'),GOC_DA_TRA:10000000})).concat([{MA_LICH_TRA:'L21',NGAY_THANH_TOAN:'2026-10-21',GOC_DA_TRA:5000000}])};
 readSheet_=(ss,k)=>({rows:DB[k].map(r=>Object.assign({},r))});readSheetCached_=readSheet_;`);
const B=p=>J(`debtSyncCompute_({},'${p}').find(x=>x.id==='KV1')`);
// 1. Tính theo GỐC PHẢI TRẢ: kỳ cuối T10 = 12.500 − 60 triệu (kể cả kỳ quá hạn / trả một phần)
let r=B('2026-10');assert.equal(r.newBalance,12440000000);assert.equal(r.plan,60000000);assert.equal(r.planMonth,60000000);assert.equal(r.lastId,'L26');assert.equal(r.lastDate,'2026-10-26');
assert.deepEqual(r.warnings.map(w=>w[1]),['1 kỳ quá hạn','1 kỳ chưa trả đủ']);
// 2. Sau đồng bộ (mô phỏng ghi DU_NO_GOC_DAU_KY): bấm lại vẫn 12.440 – không trừ 2 lần vì lịch tính từ Dư nợ gốc ban đầu
run(`DB.KHOAN_VAY[0].DU_NO_GOC_BAN_DAU=12500000000;DB.KHOAN_VAY[0].DU_NO_GOC_DAU_KY=12440000000;DB.KHOAN_VAY[0].NGAY_CHOT_DU_NO_DAU_KY='2026-10-31'`);
assert.equal(B('2026-10').newBalance,12440000000);assert.equal(B('2026-10').diff,0);
// 3. Tháng sau: 12.440 − 60 (kỳ N1)
assert.equal(B('2026-11').newBalance,12380000000);assert.equal(B('2026-11').plan,120000000);
// 4. Kỳ HUY không trừ gốc; kỳ đến hạn ≤ ngày gốc ban đầu không trừ (đã nằm trong gốc ban đầu)
run(`DB.LICH_TRA_NO[5].TRANG_THAI='HUY'`);assert.equal(B('2026-10').newBalance,12450000000);assert.equal(B('2026-10').lastId,'L21');run(`DB.LICH_TRA_NO[5].TRANG_THAI='QUA_HAN'`);
run(`DB.KHOAN_VAY[0].NGAY_GOC_BAN_DAU='2026-10-10'`);assert.equal(B('2026-10').newBalance,12460000000);assert.equal(B('2026-10').plan,40000000);run(`DB.KHOAN_VAY[0].NGAY_GOC_BAN_DAU=''`);
// 5. Dư nợ gốc ban đầu = 0 vẫn là 0; khoản đã tất toán / không có kỳ trong tháng bị bỏ qua
assert.equal(run("loanBase_({DU_NO_GOC_BAN_DAU:0,TONG_GOC_GIAI_NGAN:3000000000})"),0);
assert.equal(J(`debtSyncCompute_({},'2026-10').find(x=>x.id==='KV3').skip`),'Đã tất toán');
assert.match(J(`debtSyncCompute_({},'2026-10').find(x=>x.id==='KV2').skip`),/Không có kỳ trả trong tháng 10\/2026/);
// 6. Danh sách tháng: mới nhất trước; mặc định = tháng mới nhất không vượt quá tháng hiện tại
const mm=J(`debtSyncMonths_([{NGAY_DEN_HAN:'2026-10-01'},{NGAY_DEN_HAN:'2099-01-05'},{NGAY_DEN_HAN:'2026-09-01',TRANG_THAI:'HUY'},{NGAY_DEN_HAN:'2026-08-01'}])`);
assert.deepEqual(mm.months,['2099-01','2026-10','2026-08']);assert.equal(mm.latest,'2026-10');
assert.equal(run("periodLastDay_('2026-02')"),'2026-02-28');assert.throws(()=>run("debtSyncCompute_({},'2026-13')"),/Kỳ tháng không hợp lệ/);
// ---- Nhập file
run(`DB.KHOAN_VAY[0].NGAY_GOC_BAN_DAU='';DB.LICH_TRA_NO=[{MA_LICH_TRA:'LT-OCT',MA_KHOAN_VAY:'KV1',NGAY_DEN_HAN:'2026-10-15',TRANG_THAI:'DU_KIEN'}]`);
const chk=J(`scheduleImportCheck_({},[
 {MA_KHOAN_VAY:'KV1',KY_TRA_NO:'2026-11',NGAY_DEN_HAN:'15/11/2026',GOC_PHAI_TRA:'10.000.000',LAI_PHAI_TRA:500000},
 {MA_KHOAN_VAY:'KV1',KY_TRA_NO:'2026-11',NGAY_DEN_HAN:'2026-11-20',GOC_PHAI_TRA:1},
 {MA_KHOAN_VAY:'KV1',KY_TRA_NO:'2026-10',NGAY_DEN_HAN:'2026-10-20',GOC_PHAI_TRA:1},
 {MA_LICH_TRA:'LT-OCT',MA_KHOAN_VAY:'KV1',KY_TRA_NO:'2026-10',NGAY_DEN_HAN:'2026-10-15',LAI_PHAI_TRA:750000},
 {MA_KHOAN_VAY:'KVX',KY_TRA_NO:'2026-11',NGAY_DEN_HAN:'2026-11-15'},
 {MA_KHOAN_VAY:'KV1',KY_TRA_NO:'2026-12',NGAY_DEN_HAN:'31/11/2026',GOC_PHAI_TRA:-5},
 {MA_KHOAN_VAY:'KV3',NGAY_DEN_HAN:'2026-12-01'},
 {MA_KHOAN_VAY:'KV1',NGAY_DEN_HAN:'46000'}
]).map(x=>[x.action,x.data.GOC_PHAI_TRA,x.data.KY_TRA_NO,x.errors.join('|'),x.dupWith])`);
assert.deepEqual(chk.map(x=>x[0]),['add','dupfile','dup','update','error','error','error','add']);
assert.equal(chk[0][1],10000000);assert.equal(chk[1][4],'dòng 1');assert.equal(chk[2][4],'LT-OCT');
assert.match(chk[5][3],/Ngày đến hạn không hợp lệ/);assert.match(chk[5][3],/Gốc phải trả không được âm/);assert.match(chk[6][3],/đã tất toán/);
assert.equal(chk[7][2],'2025-12');// số ngày Excel 46000 = 09/12/2025, kỳ tự suy ra từ ngày
assert.throws(()=>run("scheduleImportCheck_({},new Array(1001).fill({}))"),/tối đa 1.000 dòng/);
// ---- V5.7.1: bảng Khoản vay hiển thị tất cả dòng trên 1 trang
run(`openFinanceSpreadsheet_=()=>({});getCurrentUser_=()=>({role:'ADMIN'});readSheetCached_=(ss,k)=>({meta:{headers:['MA_KHOAN_VAY','NGAY_DAO_HAN','HAN_MUC_VAY','TRANG_THAI']},rows:k==='KHOAN_VAY'?Array.from({length:60},(_,i)=>({MA_KHOAN_VAY:'KV'+i,NGAY_DAO_HAN:'',HAN_MUC_VAY:100,TRANG_THAI:'DANG_VAY'})):[]})`);
const lr=J("(r=>({n:r.rows.length,pages:r.pages,page:r.page,total:r.total,m:r.metrics.find(x=>x.label==='Tổng hạn mức').value}))(listRecords('KHOAN_VAY',{},{},3,25))");
assert.deepEqual(lr,{n:60,pages:1,page:1,total:60,m:6000});
assert.equal(J("listRecords('LICH_SU_LAI_SUAT',{},{},1,25).pages")>=1,true);
// ---- V5.7.3: Lịch trả nợ theo tháng, không chia trang; tìm kiếm trên mọi tháng
run(`readSheetCached_=(ss,k)=>({meta:{headers:['MA_LICH_TRA','MA_KHOAN_VAY','NGAY_DEN_HAN','GOC_PHAI_TRA','TRANG_THAI']},rows:k==='LICH_TRA_NO'?Array.from({length:90},(_,i)=>({MA_LICH_TRA:'L'+i,MA_KHOAN_VAY:'KV'+(i%3),NGAY_DEN_HAN:'2026-'+String(8+(i%3)).padStart(2,'0')+'-'+String(1+(i%28)).padStart(2,'0'),GOC_PHAI_TRA:1,TRANG_THAI:i===0?'HUY':'DU_KIEN'})):[]})`);
const mc=J("monthCounts_([{NGAY_DEN_HAN:'2026-10-05'},{NGAY_DEN_HAN:'2026-10-09'},{NGAY_DEN_HAN:'2026-09-01'},{NGAY_DEN_HAN:'2026-09-02',TRANG_THAI:'HUY'},{NGAY_DEN_HAN:''}])");
assert.equal(JSON.stringify(mc),'[["2026-09",1],["2026-10",2]]');
const lt=J("(r=>({n:r.rows.length,pages:r.pages,months:r.months,first:r.rows[0].NGAY_DEN_HAN}))(listRecords('LICH_TRA_NO',{month:10,year:'2026',dateField:'NGAY_DEN_HAN'},{},2,25))");
assert.equal(lt.n,30);assert.equal(lt.pages,1);assert.equal(JSON.stringify(lt.months),'[["2026-08",29],["2026-09",30],["2026-10",30]]');
const all=J("(r=>({n:r.rows.length,pages:r.pages,d:r.rows.map(x=>x.NGAY_DEN_HAN)}))(listRecords('LICH_TRA_NO',{q:'KV1',dateField:'NGAY_DEN_HAN'},{},1,25))");
assert.equal(all.pages,1);assert.ok(all.n>=30);assert.equal(JSON.stringify(all.d),JSON.stringify(all.d.slice().sort()));
console.log('PASS V5.7.3: Lịch trả nợ theo tháng (không chia trang, đếm kỳ theo tháng, tìm mọi tháng). V5.7.2: đồng bộ dư nợ theo tháng chốt & gốc phải trả (kỳ cuối tháng, không trừ 2 lần, bỏ kỳ HUY, số 0) + kiểm tra file nhập (trùng theo khoản vay + kỳ tháng).');
