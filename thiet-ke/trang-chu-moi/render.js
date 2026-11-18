/* node render.js → A/B/kn × máy tính (1366) + điện thoại (390), toàn trang + màn đầu */
const {chromium}=require(process.env.PLAYWRIGHT||'/opt/node-tools/node_modules/playwright');const path=require('path'),url=require('url');
(async()=>{const b=await chromium.launch();
for(const v of ['A','B','kn'])for(const [w,h,t,s] of [[1366,768,'may-tinh',1],[390,844,'dien-thoai',2]]){const p=await b.newPage({viewport:{width:w,height:h},deviceScaleFactor:s});
await p.goto(url.pathToFileURL(path.join(__dirname,'demo.html')).href+'?v='+v);await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(1200);
const sw=await p.evaluate(()=>document.documentElement.scrollWidth);if(sw>w)console.log('TRAN NGANG',v,t,sw);
await p.screenshot({path:path.join(__dirname,`${v}-${t}.jpg`),fullPage:true,type:'jpeg',quality:78});await p.screenshot({path:path.join(__dirname,`${v}-${t}-man-dau.jpg`),type:'jpeg',quality:85});await p.close()}
await b.close()})();
