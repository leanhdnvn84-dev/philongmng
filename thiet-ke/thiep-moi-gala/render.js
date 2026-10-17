const {chromium}=require(process.env.PLAYWRIGHT||'playwright');
(async()=>{const b=await chromium.launch();const f='file://'+__dirname+'/thiep-moi.html';const dsf=+(process.argv[2]||1);
const p=await b.newPage({viewport:{width:640,height:1700},deviceScaleFactor:dsf});await p.goto(f);await p.waitForTimeout(2500);await p.evaluate(()=>document.fonts.ready);
const ten={ban:'moi-ban',thay:'moi-thay-co'};
for(const id of ['ban','thay'])await (await p.$('#'+id)).screenshot({path:__dirname+'/'+ten[id]+(dsf>1?'-A5-300dpi.png':'-xem-truoc.png')});
if(dsf>1){await p.emulateMedia({media:'print'});await p.pdf({path:__dirname+'/thiep-moi-A5-2-trang.pdf',width:'148mm',height:'210mm',printBackground:true})}
await b.close()})();
