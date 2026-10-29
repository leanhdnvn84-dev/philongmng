/* node render.js [hệ số=1.92] [giây=300] → vong-lap-20-giay.mp4 (3840×1920, 30 khung/giây) rồi lặp liền mạch thành backdrop-5-phut.mp4 */
const {chromium}=require(process.env.PLAYWRIGHT||'/opt/node-tools/node_modules/playwright');const path=require('path'),url=require('url'),{spawn,execFileSync}=require('child_process');
const D=__dirname,FPS=30,VONG=20,HS=+(process.argv[2]||1.92),TONG=+(process.argv[3]||300);
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:2000,height:1000},deviceScaleFactor:HS});p.on('pageerror',e=>console.log('ERR',e.message));
await p.goto(url.pathToFileURL(path.join(D,'clip.html')).href);await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(1500);
await p.evaluate(()=>document.getAnimations().forEach(a=>a.pause()));
const vong=path.join(D,'vong-lap-20-giay.mp4');
const ff=spawn('ffmpeg',['-y','-loglevel','error','-f','image2pipe','-framerate',String(FPS),'-c:v','mjpeg','-i','-','-c:v','libx264','-preset','slow','-crf','18','-pix_fmt','yuv420p','-movflags','+faststart',vong]);
for(let f=0;f<FPS*VONG;f++){await p.evaluate(t=>document.getAnimations().forEach(a=>{a.currentTime=t}),20000+f*1000/FPS);const buf=await p.screenshot({type:'jpeg',quality:93,timeout:0});
 if(f===0)require('fs').writeFileSync(path.join(D,'khung-dau.jpg'),buf);if(!ff.stdin.write(buf))await new Promise(r=>ff.stdin.once('drain',r));if(f%60===0)console.log('khung',f)}
ff.stdin.end();await new Promise(r=>ff.on('close',r));await b.close();
execFileSync('ffmpeg',['-y','-loglevel','error','-stream_loop',String(Math.ceil(TONG/VONG)-1),'-i',vong,'-c','copy','-t',String(TONG),'-movflags','+faststart',path.join(D,'backdrop-5-phut.mp4')]);console.log('xong')})();
