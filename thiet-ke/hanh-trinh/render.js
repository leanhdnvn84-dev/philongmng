/* Chụp demo luồng "Hành trình trở về": buoc-1…7.jpg (khung điện thoại) + tong-quan.jpg + trang-demo.jpg
   Chạy: PLAYWRIGHT=/opt/node-tools/node_modules/playwright node thiet-ke/hanh-trinh/render.js */
const {chromium}=require(process.env.PLAYWRIGHT||'playwright');const path=require('path');
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});const u='file://'+path.join(__dirname,'demo.html');
const p=await b.newPage({viewport:{width:1280,height:980},deviceScaleFactor:2});
await p.goto(u);await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(800);
await p.screenshot({path:path.join(__dirname,'trang-demo.jpg'),type:'jpeg',quality:85});
for(let i=0;i<7;i++){await p.evaluate(k=>den(k),i);await p.waitForTimeout(i===3?2200:900);await (await p.$('.dt')).screenshot({path:path.join(__dirname,'buoc-'+(i+1)+'.jpg'),type:'jpeg',quality:88})}
const q=await b.newPage({viewport:{width:1820,height:900},deviceScaleFactor:1.5});await q.goto(u+'?all=1');await q.evaluate(()=>document.fonts.ready);await q.waitForTimeout(1500);
await (await q.$('.san')).screenshot({path:path.join(__dirname,'tong-quan.jpg'),type:'jpeg',quality:82});await b.close()})();
