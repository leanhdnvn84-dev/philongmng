/* node render-anh12.js [hệ số=2] → anh-12-lop/NN-lop-12-n.jpg (3840×2160, chụp lúc chữ đã hiện đủ) + anh-12-lop.zip */
const {chromium}=require(process.env.PLAYWRIGHT||'/opt/node-tools/node_modules/playwright');const path=require('path'),fs=require('fs'),url=require('url'),{execFileSync}=require('child_process');
const D=__dirname,HS=+(process.argv[2]||2),RA=path.join(D,'anh-12-lop');
(async()=>{fs.mkdirSync(RA,{recursive:true});const b=await chromium.launch();const p=await b.newPage({viewport:{width:1920,height:1080},deviceScaleFactor:HS});p.on('pageerror',e=>console.log('ERR',e.message));
for(let n=1;n<=12;n++){await p.goto(url.pathToFileURL(path.join(D,'canh12.html')).href+'?n='+n);await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(700);
 await p.evaluate(()=>document.getAnimations().forEach(a=>{a.pause();a.currentTime=8000}));
 await p.screenshot({path:path.join(RA,String(n).padStart(2,'0')+'-lop-12-'+n+'.jpg'),type:'jpeg',quality:95});console.log('ảnh',n)}
await b.close();execFileSync('zip',['-qj',path.join(D,'anh-12-lop.zip'),...fs.readdirSync(RA).sort().map(f=>path.join(RA,f))]);console.log('xong')})();
