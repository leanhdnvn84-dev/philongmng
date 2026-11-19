/* node render.js → bang-mau.jpg, may-tinh(-man-dau).jpg, dien-thoai(-man-dau).jpg */
const {chromium}=require(process.env.PLAYWRIGHT||'/opt/node-tools/node_modules/playwright');const path=require('path'),url=require('url');
(async()=>{const b=await chromium.launch();const U=url.pathToFileURL(path.join(__dirname,'demo.html')).href;
for(const [m,w,h,t,s] of [['bang',1366,768,'bang-mau',1.5],['pc',1366,768,'may-tinh',1],['pc',390,844,'dien-thoai',2],['pc&t=bac',1366,768,'bac-may-tinh',1],['pc&t=bac',390,844,'bac-dien-thoai',2]]){const p=await b.newPage({viewport:{width:w,height:h},deviceScaleFactor:s});
p.on('pageerror',e=>console.log('LOI',e.message));
await p.goto(U+'?m='+m);await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(800);
const sw=await p.evaluate(()=>document.documentElement.scrollWidth);if(sw>w)console.log('TRAN NGANG',t,sw);
await p.screenshot({path:path.join(__dirname,t+'.jpg'),fullPage:true,type:'jpeg',quality:80});
if(m.startsWith('pc'))await p.screenshot({path:path.join(__dirname,t+'-man-dau.jpg'),type:'jpeg',quality:85});await p.close()}
await b.close()})();
