/* node render.js → kich-ban-ky-niem-25-nam-ngay-ra-truong.pdf (khổ 9:16, liên kết bấm được) + xem-truoc-*.jpg */
const {chromium}=require(process.env.PLAYWRIGHT||'/opt/node-tools/node_modules/playwright');const path=require('path'),url=require('url');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:540,height:960}});
await p.goto(url.pathToFileURL(path.join(__dirname,'kich-ban.html')).href);await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(1500);
await p.pdf({path:path.join(__dirname,'kich-ban-ky-niem-25-nam-ngay-ra-truong.pdf'),width:'540px',height:'960px',printBackground:true});
const n=await p.evaluate(()=>document.querySelectorAll('.tr').length);console.log('trang',n);
for(const id of ['bia','phan','hop','d2','lich','ss']){const el=await p.$('#'+id);await el.screenshot({path:path.join(__dirname,'xem-truoc-'+id+'.jpg'),type:'jpeg',quality:85})}
await b.close()})();
