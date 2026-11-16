/* node render.js → anh-bia.png (1640×624, ×2 = 3280×1248) + anh-dai-dien.png (1080×1080) + xem thử khung tròn/điện thoại */
const {chromium}=require(process.env.PLAYWRIGHT||'/opt/node-tools/node_modules/playwright');const path=require('path'),url=require('url');
(async()=>{const b=await chromium.launch();const u=m=>url.pathToFileURL(path.join(__dirname,'fanpage.html')).href+'?m='+m;
for(const [m,w,h,s,ra] of [['bia',1640,624,2,'anh-bia.png'],['dd',1080,1080,1,'anh-dai-dien.png']]){const p=await b.newPage({viewport:{width:w,height:h},deviceScaleFactor:s});
await p.goto(u(m));await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(1500);await p.screenshot({path:path.join(__dirname,ra)});await p.close()}
await b.close()})();
