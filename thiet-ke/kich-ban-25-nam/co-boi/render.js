/* node render.js → co-boi-thang-8-2028.jpg (1066×1333 ×1.5 ≈ 1600×2000) */
const {chromium}=require(process.env.PLAYWRIGHT||'/opt/node-tools/node_modules/playwright');const path=require('path'),url=require('url');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1066,height:1333},deviceScaleFactor:1.5});
await p.goto(url.pathToFileURL(path.join(__dirname,'co-boi.html')).href);await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(1200);
await p.screenshot({path:path.join(__dirname,'co-boi-thang-8-2028.jpg'),type:'jpeg',quality:90});await b.close()})();
