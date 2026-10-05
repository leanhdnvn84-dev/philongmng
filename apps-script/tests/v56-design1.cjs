// V5.6 – kiểm tra cấu hình Design 1 (card + metrics) và hàm tính chỉ số / gắn ngân hàng.
const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
const code=fs.readFileSync(__dirname+'/../Code.gs','utf8');
const ctx={console,Utilities:{formatDate(){return '261001-120000'},getUuid(){return 'ABCDE-0000'}},HtmlService:{createHtmlOutputFromFile(){return{setTitle(){return this},setXFrameOptionsMode(){return this}}},XFrameOptionsMode:{ALLOWALL:1}}};
vm.createContext(ctx);vm.runInContext(code,ctx);
const run=s=>vm.runInContext(s,ctx);
// 1. Mọi phân hệ đều có card + metrics, trường tham chiếu tồn tại trong cấu hình phân hệ
assert.equal(run("Object.keys(UI_MODULES).every(k=>UI_MODULES[k].card&&Array.isArray(UI_MODULES[k].metrics)&&UI_MODULES[k].metrics.length)"),true);
const bad=run(`Object.keys(UI_MODULES).flatMap(k=>{const c=APP_MODULES[k],h=new Set([c.idField].concat(c.columns||[],c.required||[],c.dates||[],c.amounts||[],c.percents||[],Object.keys(c.enums||{}),c.virtual||[],['TONG_THANH_TOAN']));const u=UI_MODULES[k],f=[u.card.title,u.card.amount,u.card.date,u.card.status,(u.card.lead||'').split(':')[1]].concat(u.card.sub||[]).concat(u.metrics.flatMap(m=>[].concat(m.sum||[],m.firstBy?m.firstBy.field:[],m.lastBy?m.lastBy.field:[],m.firstBy?m.firstBy.order:[],m.lastBy?m.lastBy.order:[])));return f.filter(x=>x&&!h.has(x)).map(x=>k+'.'+x)})`);
assert.equal(bad.length,0,'Trường không tồn tại: '+bad.join(', '));
// 2. computeMetrics_: where / not / diff / add / count
const rows=[{LOAI:'THU',SO:100,TRANG_THAI:'DA_DUYET'},{LOAI:'THU',SO:50,TRANG_THAI:'HUY'},{LOAI:'CHI',SO:30,TRANG_THAI:'CHO_DUYET'},{LOAI:'CHI',SO:20,TRANG_THAI:'DA_DUYET'}];
ctx.__rows=rows;
const m=run(`computeMetrics_(__rows,[{l:'Thu',sum:'SO',where:{LOAI:'THU'},not:{TRANG_THAI:['HUY']}},{l:'Chi',sum:'SO',where:{LOAI:'CHI'}},{l:'Chênh',diff:[0,1]},{l:'Tổng',add:[0,1]},{l:'Chờ',count:1,where:{TRANG_THAI:['CHO_DUYET','NHAP']}}])`);
assert.deepEqual(JSON.parse(JSON.stringify(m)),[{label:'Thu',value:100,money:true},{label:'Chi',value:50,money:true},{label:'Chênh',value:50,money:true},{label:'Tổng',value:150,money:true},{label:'Chờ',value:1,money:false}]);
assert.equal(run('computeMetrics_([],null)'),null);
// 3. LICH_TRA_NO: 5 KPI theo thứ tự yêu cầu V5.6.5; dư nợ đầu kỳ/sau trả lấy theo từng khoản vay (không cộng dồn các kỳ)
assert.deepEqual(JSON.parse(run("JSON.stringify(UI_MODULES.LICH_TRA_NO.metrics.map(x=>x.l))")),['Tổng dư nợ đầu kỳ','Tổng gốc phải trả','Tổng dư nợ sau khi trả','Lãi phải trả','Tổng thanh toán']);
ctx.__ltn=[{MA_KHOAN_VAY:'A',NGAY_DEN_HAN:'2026-10-20',TONG_DU_NO:90,GOC_PHAI_TRA:10,DU_NO_SAU_KHI_TRA:80,LAI_PHAI_TRA:1,PHI_PHAI_TRA:0,DIEU_CHINH_TANG_GIAM:0},{MA_KHOAN_VAY:'A',NGAY_DEN_HAN:'2026-10-05',TONG_DU_NO:100,GOC_PHAI_TRA:10,DU_NO_SAU_KHI_TRA:90,LAI_PHAI_TRA:1,PHI_PHAI_TRA:2,DIEU_CHINH_TANG_GIAM:0},{MA_KHOAN_VAY:'B',NGAY_DEN_HAN:'2026-10-10',TONG_DU_NO:50,GOC_PHAI_TRA:5,DU_NO_SAU_KHI_TRA:45,LAI_PHAI_TRA:0.5,PHI_PHAI_TRA:0,DIEU_CHINH_TANG_GIAM:-1}];
assert.equal(run("JSON.stringify(computeMetrics_(__ltn,UI_MODULES.LICH_TRA_NO.metrics).map(m=>m.value))"),'[150,25,125,2.5,28.5]');
// 4. enrichBankRefs_: gắn mã ngân hàng, không sửa dòng gốc, bỏ qua trường là khóa chính
run(`readSheetCached_=(ss,key)=>({rows:key==='KHOAN_VAY'?[{MA_KHOAN_VAY:'KV1',MA_NGAN_HANG:'VCB',TEN_KHOAN_VAY:'Vay A',SO_HOP_DONG:'HD1'}]:[{MA_TAI_KHOAN:'TK1',MA_NGAN_HANG:'BIDV',TEN_TAI_KHOAN:'TK chính'}]})`);
ctx.__src=[{MA_LICH_TRA:'L1',MA_KHOAN_VAY:'KV1'},{MA_LICH_TRA:'L2',MA_KHOAN_VAY:'KHONG_CO'}];
const e=run(`enrichBankRefs_({},'LICH_TRA_NO',APP_MODULES.LICH_TRA_NO,__src)`);
assert.equal(e[0]._NH_MA_KHOAN_VAY,'VCB');assert.equal(e[0]._TEN_KHOAN_VAY,'Vay A');assert.equal(e[0]._SO_HOP_DONG,'HD1');
assert.equal(e[1]._NH_MA_KHOAN_VAY,undefined);assert.equal(ctx.__src[0]._NH_MA_KHOAN_VAY,undefined,'không được sửa dòng gốc');
ctx.__g=[{MA_GIAO_DICH:'G1',MA_TAI_KHOAN_NGUON:'TK1',MA_TAI_KHOAN_DICH:''}];
const g=run(`enrichBankRefs_({},'GIAO_DICH_TIEN',APP_MODULES.GIAO_DICH_TIEN,__g)`);
assert.equal(g[0]._NH_MA_TAI_KHOAN_NGUON,'BIDV');assert.equal(g[0]._TEN_MA_TAI_KHOAN_NGUON,'TK chính');
ctx.__k=[{MA_KHOAN_VAY:'KV1',MA_NGAN_HANG:'VCB'}];
assert.equal(run(`enrichBankRefs_({},'KHOAN_VAY',APP_MODULES.KHOAN_VAY,__k)[0]._NH_MA_KHOAN_VAY`),undefined,'không tự tham chiếu khóa chính');
// 5. Cache bootstrap đổi khóa để nhận cấu hình mới ngay
assert.ok(code.includes("'BOOT_V596_'")&&code.includes("version:'5.9.6'"));
// 6. Nguồn vốn: cột Dư nợ phải trả (tiền, hiển thị trong bảng, tự tạo cột trên sheet, có chỉ số tổng)
assert.equal(run("APP_MODULES.NGUON_VON.amounts.includes('DU_NO_PHAI_TRA')&&APP_MODULES.NGUON_VON.columns.includes('DU_NO_PHAI_TRA')&&APP_MODULES.NGUON_VON.autoColumns.includes('DU_NO_PHAI_TRA')"),true);
assert.equal(run("UI_MODULES.NGUON_VON.metrics.map(m=>m.l).join('|')"),'Tổng dự kiến|Đã duyệt|Đã giải ngân|Có thể giải ngân|Không thể giải ngân');
assert.equal(run("['CO_THE_GIAI_NGAN','KHONG_THE_GIAI_NGAN','GHI_CHU'].every(k=>APP_MODULES.NGUON_VON.columns.includes(k)&&APP_MODULES.NGUON_VON.autoColumns.includes(k))"),true);
// mô phỏng sheet 3 cột, lưới chỉ có 3 cột → phải chèn thêm cột rồi ghi tiêu đề
run(`var __log=[],__hdr=['MA_NGUON_VON','KY_DU_KIEN','LOAI_NGUON'],__max=3;__sh={getLastColumn:()=>__hdr.length,getMaxColumns:()=>__max,getMaxRows:()=>10,getLastRow:()=>5,insertColumnsAfter:(a,n)=>{__max+=n;__log.push('insert'+n)},getRange:(r,c,nr,nc)=>({getDisplayValues:()=>[__hdr.slice()],copyFormatToRange:()=>__log.push('fmtHeader'),setValues:v=>{__hdr=__hdr.concat(v[0]);__log.push('set@'+c)},setNumberFormat:f=>__log.push('num@'+c+':'+f)})}`);
assert.equal(JSON.stringify(run("ensureAutoColumns_(__sh,APP_MODULES.NGUON_VON)")),'["CO_THE_GIAI_NGAN","KHONG_THE_GIAI_NGAN","DU_NO_PHAI_TRA","GHI_CHU"]');
assert.equal(run("__log.join(',')"),'insert4,fmtHeader,set@4');
assert.equal(JSON.stringify(run("ensureAutoColumns_(__sh,APP_MODULES.NGUON_VON)")),'[]','chạy lại không thêm trùng');
// hàm chạy 1 lần cập nhật dữ liệu gốc
run(`__log=[];openFinanceSpreadsheet_=()=>({});requireSheet_=()=>__sh;LockService={getScriptLock:()=>({waitLock(){},releaseLock(){}})};invalidateModuleCache_=k=>__log.push('cache:'+k);writeAudit_=(ss,k,id,a)=>__log.push('audit:'+a)`);
const msg=run('capNhatDataGoc_NguonVon()');
assert.match(msg,/không cần thêm cột · vị trí CO_THE_GIAI_NGAN@4, KHONG_THE_GIAI_NGAN@5, DU_NO_PHAI_TRA@6, GHI_CHU@7/);
assert.equal(run("__log.join(',')"),'num@4:#,##0,num@5:#,##0,num@6:#,##0,cache:NGUON_VON,audit:CAP_NHAT_CAU_TRUC');
console.log('PASS V5.6: card/metrics config for 17 modules, metric engine, bank enrichment, bootstrap cache key, NGUON_VON.DU_NO_PHAI_TRA.');
