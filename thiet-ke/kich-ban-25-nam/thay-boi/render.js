/* node render.js → thay-boi-chon-ngay-18-8-2028.jpg (921×1880 ×2) */
const {chromium}=require(process.env.PLAYWRIGHT||'/opt/node-tools/node_modules/playwright');const path=require('path'),url=require('url');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:921,height:1880},deviceScaleFactor:2});
await p.goto(url.pathToFileURL(path.join(__dirname,'thay-boi.html')).href);await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(1200);
await p.screenshot({path:path.join(__dirname,'thay-boi-chon-ngay-18-8-2028.jpg'),type:'jpeg',quality:90});await b.close()})();
