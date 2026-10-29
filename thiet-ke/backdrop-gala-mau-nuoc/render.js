const {chromium}=require(process.env.PLAYWRIGHT||'playwright');
(async()=>{const b=await chromium.launch();const f='file://'+__dirname+'/backdrop.html';const dsf=+(process.argv[2]||1);
const p=await b.newPage({viewport:{width:2000,height:1000},deviceScaleFactor:dsf});await p.goto(f);await p.waitForTimeout(2500);await p.evaluate(()=>document.fonts.ready);
await p.screenshot({path:__dirname+(dsf>1?'/backdrop-6x3m-12000x6000.png' /* đổi sang JPG bằng PIL sau khi chụp */:'/backdrop-xem-truoc.png'),timeout:0});
if(dsf>1){await p.emulateMedia({media:'print'});await p.pdf({path:__dirname+'/backdrop-vector-2x1.pdf',width:'300cm',height:'150cm',printBackground:true,pageRanges:'1',timeout:0})}
await b.close()})();
