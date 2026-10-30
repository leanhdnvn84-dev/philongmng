/* node render-mo-dau.js [hệ số=1.92] → mo-dau-15-giay.mp4 (3840×1920): clip.html?mo=1, khung cuối khớp khung đầu vong-lap-20-giay.mp4 để nối liền.
   Chuyển động lặp (vô hạn) tua tới 5000+t ms → ở giây 15 đúng pha 20000 = khung đầu vòng lặp; hiệu ứng mở đầu tua theo t */
const {chromium}=require(process.env.PLAYWRIGHT||'/opt/node-tools/node_modules/playwright');const path=require('path'),url=require('url'),{spawn}=require('child_process');
const D=__dirname,FPS=30,DAI=15,HS=+(process.argv[2]||1.92);
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:2000,height:1000},deviceScaleFactor:HS});p.on('pageerror',e=>console.log('ERR',e.message));
await p.goto(url.pathToFileURL(path.join(D,'clip.html')).href+'?mo=1');await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(1500);
await p.evaluate(()=>document.getAnimations().forEach(a=>a.pause()));
const ff=spawn('ffmpeg',['-y','-loglevel','error','-f','image2pipe','-framerate',String(FPS),'-c:v','mjpeg','-i','-','-c:v','libx264','-preset','slow','-crf','18','-pix_fmt','yuv420p','-movflags','+faststart',path.join(D,'mo-dau-15-giay.mp4')]);
for(let f=0;f<=FPS*DAI-1;f++){const t=f*1000/FPS;await p.evaluate(t=>document.getAnimations().forEach(a=>{a.currentTime=a.effect.getTiming().iterations===Infinity?5000+t:t}),t);
 const buf=await p.screenshot({type:'jpeg',quality:93,timeout:0});if([60,150,240,330,420].includes(f))require('fs').writeFileSync(path.join(D,'mo-dau-'+(f/30)+'s.jpg'),buf);if(!ff.stdin.write(buf))await new Promise(r=>ff.stdin.once('drain',r))}
ff.stdin.end();await new Promise(r=>ff.on('close',r));await b.close();console.log('xong')})();
