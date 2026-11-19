/* node render-cau-chuyen.js → cau-chuyen-*.jpg */
const {chromium}=require(process.env.PLAYWRIGHT||'/opt/node-tools/node_modules/playwright');const path=require('path'),url=require('url');
(async()=>{const b=await chromium.launch();const U=url.pathToFileURL(path.join(__dirname,'cau-chuyen.html')).href;
for(const [w,h,t,s] of [[1366,768,'cau-chuyen-may-tinh',1],[390,844,'cau-chuyen-dien-thoai',2]]){const p=await b.newPage({viewport:{width:w,height:h},deviceScaleFactor:s});
p.on('pageerror',e=>console.log('LOI',e.message));
await p.goto(U);await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(800);
const sw=await p.evaluate(()=>document.documentElement.scrollWidth);if(sw>w)console.log('TRAN NGANG',t,sw);
await p.evaluate(()=>{document.querySelector('.dau').style.position='absolute'});
await p.screenshot({path:path.join(__dirname,t+'.jpg'),fullPage:true,type:'jpeg',quality:78});
await p.screenshot({path:path.join(__dirname,t+'-man-dau.jpg'),type:'jpeg',quality:85});await p.close()}
await b.close()})();
