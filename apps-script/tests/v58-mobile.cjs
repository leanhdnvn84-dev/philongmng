// V5.8 – Giao diện điện thoại: 1 bộ code duy nhất + Apps Script khai báo viewport.
const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
const code=fs.readFileSync(__dirname+'/../Code.gs','utf8'),html=fs.readFileSync(__dirname+'/../index.html','utf8');
// 1. doGet phải gắn thẻ viewport (Apps Script bỏ qua <meta viewport> trong file HTML → điện thoại hiện giao diện máy tính)
const meta=[];const out={setTitle(){return this},addMetaTag(n,c){meta.push([n,c]);return this},setXFrameOptionsMode(){return this}};
const ctx={console,HtmlService:{createHtmlOutputFromFile(){return out},XFrameOptionsMode:{ALLOWALL:1}},Utilities:{formatDate(){return''},getUuid(){return'x'}}};
vm.createContext(ctx);vm.runInContext(code,ctx);vm.runInContext('doGet()',ctx);
assert.equal(meta.length,1);assert.equal(meta[0][0],'viewport');assert.match(meta[0][1],/width=device-width/);
// 2. CSS: một khối mobile duy nhất, không còn @media 849px rải rác, không còn bản vá chồng
const css=html.slice(html.indexOf('<style>'),html.indexOf('</style>'));
assert.equal((css.match(/MOBILE · BỘ GIAO DIỆN ĐIỆN THOẠI DUY NHẤT/g)||[]).length,1);
assert.ok(!/@media \(max-width: 849/.test(css),'còn @media 849px');
assert.ok(!/V5\.7\.4/.test(css),'còn bản vá CSS v5.7.4');
const sel={};css.replace(/(^|\n)([^{}@\n][^{}\n]*)\{/g,(m,a,s)=>{s=s.trim();sel[s]=(sel[s]||0)+1});
const dup=Object.keys(sel).filter(s=>/\.m-|is-mobile|m-fhide/.test(s)&&sel[s]>1);assert.deepEqual(dup,[],'selector mobile bị khai báo lặp: '+dup.join(', '));
for(const k of ['mUp','mPop','mFade'])assert.equal((css.match(new RegExp('@keyframes '+k+' '),'g')||[]).length,1,'keyframes '+k);
// 3. JS: mỗi hàm mobile khai báo đúng 1 lần, nằm trong khối mobile; hàm cũ đã xóa
const js=html.slice(html.indexOf('<script>'),html.lastIndexOf('</script>')),a=js.indexOf('MOBILE · BỘ GIAO DIỆN ĐIỆN THOẠI DUY NHẤT'),b=js.indexOf('HẾT KHỐI MOBILE');
assert.ok(a>0&&b>a);
for(const f of ['isPhone_','mOn_','mOff_','renderMobileUI','mTop_','mobileCard_','mLtnNav_','renderMobileModule_','mDock_','mTuck_','mPeek_','mWatchScroll_','mActiveFilters_','mFilterPills_','mBindPills_','openMobileFilter_']){
 const re=new RegExp('function '+f+'\\(','g'),all=[...js.matchAll(re)];assert.equal(all.length,1,f);assert.ok(all[0].index>a&&all[0].index<b,f+' nằm ngoài khối mobile')}
for(const f of ['clearMobileUI_','clearMShell_','mShell_','mMenu_','filterStart_','mFilterAuto_','ltnMobileNav_','mBindFilters_','FUNNEL_SVG','sidebarOpen'])assert.ok(!js.includes(f),'còn code cũ: '+f);
assert.ok(js.trimEnd().endsWith('loadData();'),'loadData() phải chạy sau cùng');
assert.match(js,/function detectDevice\(\)\{const newDevice=isPhone_\(\)/);
// V5.9.1: đã bỏ hẳn trang Khởi động, mặc định mở Lịch trả nợ
for(const f of ['renderStart_','openStart_','mStartFilter_',"'START'",'KHỞI ĐỘNG','LAST_MODULE_KEY'])assert.ok(!html.includes(f),'còn trang khởi động: '+f);
assert.match(html,/module:'LICH_TRA_NO'/);assert.match(html,/api\('getInitialAppData',\['LICH_TRA_NO'/);
console.log('PASS V5.8: mobile 1 bộ code duy nhất (CSS/JS gom 1 khối, không trùng lặp) + doGet khai báo viewport cho điện thoại.');
