// V5.9.9 – Nhắc hạn trả gốc: mốc nhắc nhập tay theo từng khoản vay (15/10/5… ngày), gửi email + Telegram gộp theo người nhận,
// không gửi lặp mốc đã nhắc, quá hạn nhắc 1 lần, tự dừng khi kỳ trả đã thanh toán, đồng bộ Google Calendar, tạo từ Lịch trả nợ.
const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
const code=fs.readFileSync(__dirname+'/../Code.gs','utf8'),html=fs.readFileSync(__dirname+'/../index.html','utf8'),manifest=JSON.parse(fs.readFileSync(__dirname+'/../appsscript.json','utf8'));
const store={},cache={get:k=>store[k]??null,put:(k,v)=>{store[k]=String(v)},remove:k=>{delete store[k]},getAll:ks=>{const o={};ks.forEach(k=>{if(store[k]!=null)o[k]=store[k]});return o},putAll:o=>Object.assign(store,o)};
const sheets={},props={},mails=[],tg=[],events={},triggers=[];let evSeq=0;
function sheet(name){const t=sheets[name];if(!t)return null;const v=()=>[t.h].concat(t.rows);return{getDataRange:()=>({getValues:v}),getLastColumn:()=>t.h.length,getLastRow:()=>t.rows.length+1,getMaxColumns:()=>t.h.length,getMaxRows:()=>t.rows.length+1,setFrozenRows(){},
 insertColumnsAfter(){},getRange:(r,c,nr,nc)=>({getDisplayValues:()=>v().slice(r-1,r-1+(nr||1)).map(x=>x.slice(c-1,c-1+(nc||1)).map(String)),getValues:()=>v().slice(r-1,r-1+(nr||1)).map(x=>x.slice(c-1,c-1+(nc||1))),setValue(x){t.rows[r-2][c-1]=x},setFontWeight(){},
  setValues(a){if(r===1){a[0].forEach((x,j)=>{t.h[c-1+j]=x;t.rows.forEach(row=>{while(row.length<t.h.length)row.push('')})});return}a.forEach((row,i)=>{if(!t.rows[r-2+i])t.rows[r-2+i]=new Array(t.h.length).fill('');row.forEach((x,j)=>t.rows[r-2+i][c-1+j]=x)})},setNumberFormat(){},copyFormatToRange(){}}),appendRow:a=>t.rows.push(a)}}
const book={getSheetByName:sheet,insertSheet:n=>{sheets[n]={h:[],rows:[]};return sheet(n)}};
const cal={createEvent(title,start,end,o){const id='EV'+(++evSeq),e={id,title,start,end,desc:o.description,pops:[],getId:()=>id,removeAllReminders(){e.pops=[]},addPopupReminder(m){e.pops.push(m)},deleteEvent(){delete events[id]}};events[id]=e;return e},getEventById:id=>events[id]||null};
const ctx={console:{log(){},error(){}},CacheService:{getScriptCache:()=>cache},SpreadsheetApp:{openById:()=>book,flush(){}},Session:{getActiveUser:()=>({getEmail:()=>'a@x.vn'}),getEffectiveUser:()=>({getEmail:()=>'a@x.vn'})},LockService:{getScriptLock:()=>({waitLock(){},tryLock(){return true},releaseLock(){}})},
 PropertiesService:{getScriptProperties:()=>({getProperty:k=>props[k]??null,setProperty:(k,v)=>{props[k]=String(v)},deleteProperty:k=>{delete props[k]}})},
 MailApp:{sendEmail:o=>mails.push(o)},UrlFetchApp:{fetch:(url,o)=>{if(/getUpdates/.test(url))return{getResponseCode:()=>200,getContentText:()=>JSON.stringify({ok:true,result:[{message:{chat:{id:555,first_name:'Sếp',type:'private'}}}]})};tg.push(Object.assign({url},JSON.parse(o.payload)));return{getResponseCode:()=>200,getContentText:()=>'{"ok":true}'}}},
 CalendarApp:{getDefaultCalendar:()=>cal,getCalendarById:()=>cal},
 ScriptApp:{getService:()=>({getUrl:()=>'https://script.google.com/macros/s/X/exec'}),getProjectTriggers:()=>triggers.slice(),deleteTrigger:t=>triggers.splice(triggers.indexOf(t),1),newTrigger:fn=>{const t={fn,getHandlerFunction:()=>fn};const b={timeBased:()=>b,everyDays:()=>b,atHour:h=>{t.hour=h;return b},inTimezone:()=>b,create:()=>{triggers.push(t);return t}};return b}},
 Utilities:{formatDate:(d,tz,f)=>{const p=n=>String(n).padStart(2,'0');return f==='yyyy-MM'?d.getFullYear()+'-'+p(d.getMonth()+1):d.getFullYear()+'-'+p(d.getMonth()+1)+'-'+p(d.getDate())},getUuid:()=>Math.random().toString(16).slice(2)}};
vm.createContext(ctx);vm.runInContext(code,ctx);const run=s=>vm.runInContext(s,ctx),J=s=>JSON.parse(run('JSON.stringify('+s+')'));const VD=run('Date'),D=(y,m,d)=>new VD(y,m-1,d,12);
let TODAY='2026-10-01';ctx.__today=()=>TODAY;run("todayKey_=function(){return __today();}");
store['USER_V51_a@x.vn']=JSON.stringify({email:'a@x.vn',role:'ADMIN'});
const put=(k,h,rows)=>{sheets[k]={h,rows:rows.map(o=>h.map(f=>o[f]==null?'':o[f]))}};
put('NHAT_KY',['MA_NHAT_KY','THOI_GIAN','EMAIL_NGUOI_DUNG','CHUC_NANG','MA_BAN_GHI','HANH_DONG','NOI_DUNG_THAY_DOI'],[]);
put('KHOAN_VAY',['MA_KHOAN_VAY','MA_CONG_TY_VAY','TEN_KHOAN_VAY','MA_NGAN_HANG','SO_HOP_DONG','HAN_MUC_VAY','TRANG_THAI'],[{MA_KHOAN_VAY:'KV1',MA_CONG_TY_VAY:'RCG',TEN_KHOAN_VAY:'Vay BIDV 1',MA_NGAN_HANG:'BIDV',SO_HOP_DONG:'01/HĐ',HAN_MUC_VAY:1,TRANG_THAI:'DANG_VAY'},{MA_KHOAN_VAY:'KV2',TEN_KHOAN_VAY:'Vay VCB',MA_NGAN_HANG:'VCB',HAN_MUC_VAY:1,TRANG_THAI:'DANG_VAY'}]);
put('PHAN_BO_TRA_NO',['MA_PHAN_BO','MA_LICH_TRA','NGAY_THANH_TOAN','GOC_DA_TRA'],[]);
put('LICH_TRA_NO',['MA_LICH_TRA','MA_KHOAN_VAY','KY_TRA_NO','NGAY_DEN_HAN','GOC_PHAI_TRA','LAI_PHAI_TRA','TRANG_THAI'],[
 {MA_LICH_TRA:'L1',MA_KHOAN_VAY:'KV1',KY_TRA_NO:'2026-10',NGAY_DEN_HAN:D(2026,10,16),GOC_PHAI_TRA:5000000000,LAI_PHAI_TRA:10,TRANG_THAI:'DU_KIEN'},
 {MA_LICH_TRA:'L2',MA_KHOAN_VAY:'KV2',KY_TRA_NO:'2026-11',NGAY_DEN_HAN:D(2026,11,20),GOC_PHAI_TRA:700,TRANG_THAI:'DU_KIEN'},
 {MA_LICH_TRA:'L3',MA_KHOAN_VAY:'KV2',KY_TRA_NO:'2026-10',NGAY_DEN_HAN:D(2026,10,20),GOC_PHAI_TRA:0,LAI_PHAI_TRA:9,TRANG_THAI:'DU_KIEN'},
 {MA_LICH_TRA:'L4',MA_KHOAN_VAY:'KV2',KY_TRA_NO:'2026-12',NGAY_DEN_HAN:D(2026,12,20),GOC_PHAI_TRA:80,TRANG_THAI:'HUY'}]);
// ---- 1. sheet tự tạo khi mở phân hệ lần đầu; cấu hình + quyền OAuth
assert.equal(sheets.NHAC_HAN_TRA_GOC,undefined);const m0=J("getModuleData('NHAC_HAN_TRA_GOC','',false)");assert.equal(m0.rows.length,0);
assert.deepEqual(sheets.NHAC_HAN_TRA_GOC.h.slice(0,4),['MA_NHAC_HAN','MA_KHOAN_VAY','NGAY_DEN_HAN_GOC','MA_LICH_TRA']);assert.ok(sheets.NHAC_HAN_TRA_GOC.h.includes('DA_NHAC'));
['script.send_mail','script.external_request','calendar','script.scriptapp'].forEach(s=>assert.ok(manifest.oauthScopes.includes('https://www.googleapis.com/auth/'+s),s));
assert.ok(J("getBootstrapData().modules.NHAC_HAN_TRA_GOC").fields.includes('MOC_NHAC'));assert.ok(!J("getBootstrapData().modules.NHAC_HAN_TRA_GOC").fields.includes('DA_NHAC'),'mốc đã nhắc do hệ thống ghi');
// ---- 2. nhập tay: chuẩn hóa mốc, mặc định, kiểm tra email / chat id / trùng
assert.throws(()=>run("saveRecord('NHAC_HAN_TRA_GOC',{MA_KHOAN_VAY:'KV1',NGAY_DEN_HAN_GOC:'2026-10-16',MOC_NHAC:'15,abc'})"),/Mốc nhắc không hợp lệ/);
assert.throws(()=>run("saveRecord('NHAC_HAN_TRA_GOC',{MA_KHOAN_VAY:'KV1',NGAY_DEN_HAN_GOC:'2026-10-16',EMAIL_NHAN:'sai-email'})"),/Email nhận không hợp lệ/);
const id1=J("saveRecord('NHAC_HAN_TRA_GOC',{MA_KHOAN_VAY:'KV1',MA_LICH_TRA:'L1',NGAY_DEN_HAN_GOC:'2026-10-16',SO_TIEN_GOC:'5000000000',MOC_NHAC:'5, 15 10 15',EMAIL_NHAN:'sep@x.vn; kt@x.vn',NGUOI_PHU_TRACH:'Lan'})").id;
assert.match(id1,/^NH-/);let r1=J("getModuleData('NHAC_HAN_TRA_GOC','',false)").rows[0];assert.equal(r1.MOC_NHAC,'15,10,5');assert.equal(r1.EMAIL_NHAN,'sep@x.vn, kt@x.vn');assert.equal(r1.TRANG_THAI,'DANG_THEO_DOI');
assert.throws(()=>run("saveRecord('NHAC_HAN_TRA_GOC',{MA_KHOAN_VAY:'KV1',NGAY_DEN_HAN_GOC:'2026-10-16'})"),/đã có nhắc hạn ngày 16\/10\/2026/);
const id2=J("saveRecord('NHAC_HAN_TRA_GOC',{MA_KHOAN_VAY:'KV2',NGAY_DEN_HAN_GOC:'2026-10-11',SO_TIEN_GOC:'300',TELEGRAM_CHAT_ID:'-100123'})").id;
assert.equal(J(`getModuleData('NHAC_HAN_TRA_GOC','',false).rows.find(r=>r.MA_NHAC_HAN==='${id2}')`).MOC_NHAC,'15,10,5,3,1,0','bỏ trống → mốc mặc định');
// cột tính: 01/10 → KV1 còn 15 ngày (Sắp đến, nhắc hôm nay), KV2 còn 10 ngày
r1=J(`getModuleData('NHAC_HAN_TRA_GOC','',false).rows.find(r=>r.MA_NHAC_HAN==='${id1}')`);assert.deepEqual([r1.SO_NGAY_CON_LAI,r1.MUC_CANH_BAO,r1.MOC_NHAC_TIEP],[15,'SAP_DEN','2026-10-01']);
// ---- 3. gửi hằng ngày: gộp theo người nhận; chưa có Telegram token → chỉ email; dòng KV2 không có email → người tạo
let res=J("runReminders_(openFinanceSpreadsheet_(),{})");assert.equal(res.due,2);assert.equal(res.sent,2);
assert.deepEqual(mails.map(m=>m.to).sort(),['a@x.vn','kt@x.vn','sep@x.vn']);assert.match(mails.find(m=>m.to==='sep@x.vn').htmlBody,/16\/10\/2026 – còn 15 ngày/);assert.match(mails[0].htmlBody,/5\.000\.000\.000 đ|300 đ/);assert.equal(tg.length,0);
let st=J("readSheet_(openFinanceSpreadsheet_(),'NHAC_HAN_TRA_GOC',APP_MODULES.NHAC_HAN_TRA_GOC).rows");assert.equal(st.find(r=>r.MA_NHAC_HAN===id1).DA_NHAC,'15');assert.equal(st.find(r=>r.MA_NHAC_HAN===id2).DA_NHAC,'15,10','bỏ lỡ mốc 15 → gửi 1 lần, ghi cả 15 và 10');
// chạy lại cùng ngày → không gửi lặp
mails.length=0;res=J("runReminders_(openFinanceSpreadsheet_(),{})");assert.equal(res.due,0);assert.equal(mails.length,0);
// ---- 4. cài Telegram mặc định → ngày 06/10 KV1 còn 10 ngày: email + Telegram chat mặc định; KV2 còn 5 ngày → chat riêng -100123
J("saveReminderSettings({emails:'',tgToken:'123456789:AAHdqTcvCH1vGWJxfSeofSAs0K5PALDsaw',tgChat:'555',moc:'15,10,5,3,1,0',cal:true})");assert.equal(props.NH_TG_TOKEN,'123456789:AAHdqTcvCH1vGWJxfSeofSAs0K5PALDsaw');
assert.match(J("getReminderSettings()").tgToken,/^123456…saw$|^123456…/);assert.throws(()=>run("saveReminderSettings({tgToken:'abc'})"),/không đúng dạng/);
assert.deepEqual(J("findTelegramChats()"),[{id:'555',name:'Sếp',type:'private'}]);
TODAY='2026-10-06';mails.length=0;res=J("runReminders_(openFinanceSpreadsheet_(),{})");assert.equal(res.due,2);
assert.deepEqual(tg.map(x=>x.chat_id).sort(),['-100123','555']);assert.match(tg.find(x=>x.chat_id==='555').text,/còn 10 ngày/);assert.match(tg.find(x=>x.chat_id==='-100123').text,/🔴 .*còn 5 ngày/);assert.equal(tg[0].parse_mode,'HTML');
// ---- 5. kỳ trả L1 đã thanh toán → tự chuyển Đã xử lý, không gửi
sheets.LICH_TRA_NO.rows[0][6]='DA_THANH_TOAN';TODAY='2026-10-11';tg.length=0;mails.length=0;res=J("runReminders_(openFinanceSpreadsheet_(),{})");assert.equal(res.closed,1);
st=J("readSheet_(openFinanceSpreadsheet_(),'NHAC_HAN_TRA_GOC',APP_MODULES.NHAC_HAN_TRA_GOC).rows");assert.equal(st.find(r=>r.MA_NHAC_HAN===id1).TRANG_THAI,'DA_XU_LY');assert.ok(!mails.some(m=>m.to==='sep@x.vn'),'KV1 đã trả → không gửi');
assert.ok(tg.some(x=>/ĐẾN HẠN HÔM NAY/.test(x.text)),'KV2 đúng ngày đến hạn (mốc 0)');
// ---- 6. quá hạn: nhắc 1 lần duy nhất
TODAY='2026-10-12';tg.length=0;J("runReminders_(openFinanceSpreadsheet_(),{})");assert.equal(tg.length,1);assert.match(tg[0].text,/QUÁ HẠN 1 ngày/);
TODAY='2026-10-13';tg.length=0;J("runReminders_(openFinanceSpreadsheet_(),{})");assert.equal(tg.length,0);
// gửi tay vẫn gửi được, không đổi mốc
tg.length=0;J(`sendReminderFor('${id2}')`);assert.equal(tg.length,1);assert.match(tg[0].text,/gửi tay/);assert.throws(()=>run(`sendReminderFor('${id1}')`),/không còn ở trạng thái/);
// ---- 7. đổi ngày đến hạn → nhắc lại từ đầu
J(`saveRecord('NHAC_HAN_TRA_GOC',Object.assign(${JSON.stringify(st.find(r=>r.MA_NHAC_HAN===id2))},{NGAY_DEN_HAN_GOC:'2026-11-11'}))`);
assert.equal(J(`readSheet_(openFinanceSpreadsheet_(),'NHAC_HAN_TRA_GOC',APP_MODULES.NHAC_HAN_TRA_GOC).rows.find(r=>r.MA_NHAC_HAN==='${id2}')`).DA_NHAC,'');
let r2=J(`getModuleData('NHAC_HAN_TRA_GOC','',false).rows.find(r=>r.MA_NHAC_HAN==='${id2}')`);assert.deepEqual([r2.SO_NGAY_CON_LAI,r2.MUC_CANH_BAO,r2.MOC_NHAC_TIEP],[29,'THEO_DOI','2026-10-27']);
// ---- 8. Google Calendar: sự kiện 08:00 ngày đến hạn, popup theo mốc (≤ 28 ngày, tối đa 5); dòng đã xử lý không có sự kiện
assert.match(J("syncReminderCalendar_(openFinanceSpreadsheet_())"),/tạo\/cập nhật 1/);const ev=Object.values(events);assert.equal(ev.length,1);
assert.deepEqual(ev[0].pops,[21600,14400,7200,4320,1440]);assert.equal(ev[0].start.getHours(),8);assert.equal(ev[0].start.getDate(),11);assert.match(ev[0].title,/Trả gốc KV2 · 300 đ/);
assert.match(J("syncReminderCalendar_(openFinanceSpreadsheet_())"),/tạo\/cập nhật 0, gỡ 0/,'không đổi → không tạo lại');
J(`reminderDone('${id2}','Đã chuẩn bị nguồn')`);J("syncReminderCalendar_(openFinanceSpreadsheet_())");assert.equal(Object.keys(events).length,0,'đã xử lý → gỡ sự kiện');
assert.throws(()=>run(`reminderDone('${id2}')`),/không ở trạng thái Đang theo dõi/);assert.match(J(`readSheet_(openFinanceSpreadsheet_(),'NHAC_HAN_TRA_GOC',APP_MODULES.NHAC_HAN_TRA_GOC).rows.find(r=>r.MA_NHAC_HAN==='${id2}')`).GHI_CHU,/Đã xử lý 13\/10\/2026\] Đã chuẩn bị nguồn/);
// ---- 9. tạo từ Lịch trả nợ: chỉ kỳ có gốc > 0, chưa trả/hủy, trong N ngày; kỳ đã có nhắc → bỏ qua
const pv=J("getReminderSchedulePreview(60)");assert.deepEqual(pv.rows.map(x=>[x.id,x.exists]),[['L2',false]]);
const cr=J("createRemindersFromSchedule(['L2','L1'],{moc:'10,3',owner:'Hùng'})");assert.deepEqual([cr.created,cr.skipped],[1,1]);
const nl=J("getModuleData('NHAC_HAN_TRA_GOC','',false)").rows.find(r=>r.MA_LICH_TRA==='L2');assert.deepEqual([nl.MA_KHOAN_VAY,nl.NGAY_DEN_HAN_GOC,nl.SO_TIEN_GOC,nl.MOC_NHAC,nl.NGUOI_PHU_TRACH],['KV2','2026-11-20',700,'10,3','Hùng']);
assert.equal(J("getReminderSchedulePreview(60)").rows[0].exists,true);
// sắp xếp theo ngày đến hạn tăng dần + chỉ số
const lr=J("listRecords('NHAC_HAN_TRA_GOC',{},null,1,50)");assert.deepEqual(lr.rows.map(r=>r.NGAY_DEN_HAN_GOC),['2026-11-20','2026-10-16','2026-11-11'],'đang theo dõi lên trước, rồi theo ngày');assert.equal(lr.metrics.find(m=>m.label==='Đang theo dõi').value,1);
// ---- 10. trigger hằng ngày + hàm cài đặt chạy 1 lần
const msg=J("caiDatNhacHan()");assert.match(msg,/chạy hằng ngày lúc 7:00/);assert.equal(triggers.length,1);assert.equal(triggers[0].fn,'nhacHanTraGocHangNgay');J("caiDatNhacHan()");assert.equal(triggers.length,1,'cài lại không nhân đôi trigger');
assert.match(J("nhacHanTraGocHangNgay()"),/^Nhắc hạn: gửi/);
// ---- giao diện
assert.match(html,/'LICH_TRA_NO','NHAC_HAN_TRA_GOC','PHAN_BO_TRA_NO'/);assert.match(html,/REMIND:'⏰ Đặt nhắc hạn gốc'/);assert.match(html,/id="nhFromSchedule"/);assert.match(html,/id="nhSettings"/);assert.match(html,/function remindTimeline_/);
assert.ok(J("UI_MODULES.LICH_TRA_NO.actions").includes('REMIND')&&J("UI_MODULES.KHOAN_VAY.actions").includes('REMIND'));
console.log('PASS V5.9.9: Nhắc hạn trả gốc – mốc nhắc nhập tay, email + Telegram gộp theo người nhận, không gửi lặp, quá hạn, tự dừng khi đã trả, Google Calendar, tạo từ Lịch trả nợ, trigger hằng ngày.');
