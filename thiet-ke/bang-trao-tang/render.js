/* node render.js [hệ số=1] [so] [cho1] [cho2] [tên tệp] [người trao] → <tên>.png (1500×1000 × hệ số); hệ số > 1 thêm <tên>-60x40cm.pdf */
const {chromium}=require(process.env.PLAYWRIGHT||'/opt/node-tools/node_modules/playwright');const path=require('path'),url=require('url');
const D=__dirname,[HS='1',SO='10000000',C1='Cho học sinh Trường',C2='Trung học phổ thông Nguyễn Hiền',TEN='bang-trao-tang',NG='']=process.argv.slice(2);
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1500,height:1000},deviceScaleFactor:+HS});p.on('pageerror',e=>console.log('ERR',e.message));
await p.goto(url.pathToFileURL(path.join(D,'bang.html')).href+'?'+new URLSearchParams({so:SO,cho1:C1,cho2:C2,ten:NG}));await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(1200);
await p.screenshot({path:path.join(D,TEN+'.png'),timeout:0});
if(+HS>1){await p.emulateMedia({media:'print'});await p.pdf({path:path.join(D,TEN+'-60x40cm.pdf'),width:'60cm',height:'40cm',printBackground:true,pageRanges:'1'})}
await b.close()})();
