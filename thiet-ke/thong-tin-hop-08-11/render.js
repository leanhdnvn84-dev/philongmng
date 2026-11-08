/* node render.js → thong-tin-hop-08-11.jpg (1080 rộng × 2 = 2160px, gửi Zalo) */
const {chromium}=require(process.env.PLAYWRIGHT||'/opt/node-tools/node_modules/playwright');const path=require('path'),url=require('url');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1080,height:1600},deviceScaleFactor:2});
await p.goto(url.pathToFileURL(path.join(__dirname,'thong-tin.html')).href);await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(1200);
await (await p.$('#k')).screenshot({path:path.join(__dirname,'thong-tin-hop-08-11.jpg'),type:'jpeg',quality:90});await b.close()})();
