/* node render-clip.js [hệ số=1] → mo-dau-15-giay.mp4 (1920×1080 ×hệ số, 30 khung/giây, 15 giây) + xem-truoc-*.jpg */
const {chromium}=require(process.env.PLAYWRIGHT||'/opt/node-tools/node_modules/playwright');const path=require('path'),url=require('url'),{spawn}=require('child_process');const D=__dirname,FPS=30,DAI=15,HS=+(process.argv[2]||1);
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1920,height:1080},deviceScaleFactor:HS});p.on('pageerror',e=>console.log('ERR',e.message));
await p.goto(url.pathToFileURL(path.join(D,'canh.html')).href);await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(800);
await p.evaluate(()=>document.getAnimations().forEach(a=>a.pause()));
const ra=path.join(D,HS>1?'mo-dau-15-giay-4k.mp4':'mo-dau-15-giay.mp4');
const ff=spawn('ffmpeg',['-y','-loglevel','error','-f','image2pipe','-framerate',String(FPS),'-c:v','mjpeg','-i','-','-c:v','libx264','-preset','slow','-crf','17','-pix_fmt','yuv420p','-movflags','+faststart',ra]);
for(let f=0;f<FPS*DAI;f++){const t=f*1000/FPS;await p.evaluate(t=>document.getAnimations().forEach(a=>{a.currentTime=t}),t);const buf=await p.screenshot({type:'jpeg',quality:93});
 if(HS===1&&[1,3,5.5,8,10.5,14.6].some(s=>Math.round(s*FPS)===f))require('fs').writeFileSync(path.join(D,'xem-truoc-'+String(Math.round(t/100)/10).replace('.',',')+'s.jpg'),buf);
 if(!ff.stdin.write(buf))await new Promise(r=>ff.stdin.once('drain',r))}
ff.stdin.end();await new Promise(r=>ff.on('close',r));console.log('xong',ra);await b.close()})();
