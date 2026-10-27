/* node thiet-ke/tri-an-thay-co/render.js → anh/01..10.jpg (3840×2160) + tong-quan.jpg */
const {chromium}=require(process.env.PLAYWRIGHT||'/opt/node-tools/node_modules/playwright');const path=require('path'),fs=require('fs'),url=require('url');const D=__dirname;
(async()=>{const b=await chromium.launch();fs.mkdirSync(path.join(D,'anh'),{recursive:true});
const p=await b.newPage({viewport:{width:1920,height:1080},deviceScaleFactor:2});p.on('pageerror',e=>console.log('ERR',e.message));
for(let n=1;n<=10;n++){await p.goto(url.pathToFileURL(path.join(D,'canh.html')).href+'?n='+n);await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(700);
 await p.screenshot({path:path.join(D,'anh',String(n).padStart(2,'0')+'.jpg'),type:'jpeg',quality:92})}
await b.close()})();
