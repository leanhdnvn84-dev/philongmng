/* Chụp 10 hình chèn clip: ngang 1920×1080 → ngang/NN.jpg, dọc 1080×1920 → doc/NN.jpg. Chạy: PLAYWRIGHT=… node thiet-ke/clip-ngay-tro-ve/render.js */
const {chromium}=require(process.env.PLAYWRIGHT||'playwright');const path=require('path'),fs=require('fs');const D=__dirname;
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
for(const [d,w,h] of [['ngang',1920,1080],['doc',1080,1920]]){fs.mkdirSync(path.join(D,d),{recursive:true});const p=await b.newPage({viewport:{width:w,height:h}});
 for(let n=1;n<=10;n++){await p.goto('file://'+path.join(D,'slides.html')+'?n='+n+'&d='+d);await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(500);
  await p.screenshot({path:path.join(D,d,String(n).padStart(2,'0')+'.jpg'),type:'jpeg',quality:90})}
 await p.close()}
await b.close()})();
