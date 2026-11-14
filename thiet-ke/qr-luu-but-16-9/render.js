/* node render.js → qr-luu-but-16-9.png (3840×2160) + qr-luu-but-16-9.jpg */
const {chromium}=require(process.env.PLAYWRIGHT||'/opt/node-tools/node_modules/playwright');const path=require('path'),url=require('url');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1920,height:1080},deviceScaleFactor:2});
await p.goto(url.pathToFileURL(path.join(__dirname,'qr.html')).href);await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(1500);
await p.screenshot({path:path.join(__dirname,'qr-luu-but-16-9.png')});await p.screenshot({path:path.join(__dirname,'qr-luu-but-16-9.jpg'),type:'jpeg',quality:92});await b.close()})();
