/* Chụp demo màn 3 phần ở vài độ phân giải. Chạy: PLAYWRIGHT=… node thiet-ke/trinh-chieu-3-man/render.js */
const {chromium}=require(process.env.PLAYWRIGHT||'playwright');const path=require('path');const D=__dirname;
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
for(const [w,h] of [[1920,1080],[3840,1080]])for(const k of ['ngang','doc','lb','can']){const p=await b.newPage({viewport:{width:w,height:h}});
 await p.goto(require('url').pathToFileURL(path.join(D,'demo.html')).href+`?w=${w}&h=${h}&k=${k}`);await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(600);
 await p.screenshot({path:path.join(D,`${w}x${h}-${k}.jpg`),type:'jpeg',quality:80});await p.close()}
await b.close()})();
