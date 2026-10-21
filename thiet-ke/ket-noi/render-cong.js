/* Chụp demo cổng trường: cong-hien-tai / cong-a / cong-b (máy tính + điện thoại). Chạy: PLAYWRIGHT=… node thiet-ke/ket-noi/render-cong.js */
const {chromium}=require(process.env.PLAYWRIGHT||'playwright');const path=require('path');
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
for(const [w,h,ten] of [[1366,700,'may-tinh'],[390,844,'dien-thoai']]){const p=await b.newPage({viewport:{width:w,height:h},deviceScaleFactor:ten==='dien-thoai'?2:1});
 await p.goto('file://'+path.resolve(__dirname,'../../tai-ve/NguyenHien-2000-2003.html'));await p.waitForTimeout(2500);
 await p.evaluate(()=>{try{dongThu()}catch(e){}menu('connect')});await p.waitForTimeout(1200);await p.evaluate(()=>document.querySelectorAll('.bdemo,#tbNut').forEach(e=>e.remove()));
 await (await p.$('.p-kn .kn-hero')).screenshot({path:path.join(__dirname,'cong-hien-tai-'+ten+'.jpg'),type:'jpeg',quality:85});
 for(const m of ['a','b','c']){await p.goto('file://'+path.join(__dirname,'cong-demo.html?m='+m));await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(500);
  await (await p.$('.hero')).screenshot({path:path.join(__dirname,'cong-'+m+'-'+ten+'.jpg'),type:'jpeg',quality:85})}
 await p.close()}
await b.close()})();
