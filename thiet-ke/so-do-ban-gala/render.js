/* node render.js → so-do-ban-gala.png (A4 ngang ~300 dpi) + so-do-ban-gala.pdf */
const {chromium}=require(process.env.PLAYWRIGHT||'/opt/node-tools/node_modules/playwright');const path=require('path'),url=require('url');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1123,height:794},deviceScaleFactor:3});
await p.goto(url.pathToFileURL(path.join(__dirname,'so-do.html')).href);await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(1000);
await p.screenshot({path:path.join(__dirname,'so-do-ban-gala.png')});
await p.pdf({path:path.join(__dirname,'so-do-ban-gala.pdf'),width:'297mm',height:'210mm',printBackground:true,pageRanges:'1'});await b.close()})();
