const {chromium}=require(process.env.PLAYWRIGHT||'playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:794,height:1123},deviceScaleFactor:3.125});
await p.goto('file://'+__dirname+'/hashtag.html');await p.waitForTimeout(2500);await p.evaluate(()=>document.fonts.ready);
await (await p.$('#to')).screenshot({path:__dirname+'/hashtag-A4-300dpi.png'});
const tags=await p.$$('.tag');for(let i=0;i<tags.length;i++)await tags[i].screenshot({path:__dirname+'/the/'+String(i+1).padStart(2,'0')+'.png',omitBackground:true});
await p.setViewportSize({width:794,height:1123});const q=await b.newPage({viewport:{width:794,height:1123},deviceScaleFactor:1});await q.goto('file://'+__dirname+'/hashtag.html');await q.waitForTimeout(2500);await (await q.$('#to')).screenshot({path:__dirname+'/hashtag-xem-truoc.png'});
await b.close()})();
