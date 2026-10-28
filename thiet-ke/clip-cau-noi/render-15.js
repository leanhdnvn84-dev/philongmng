/* node render-15.js → cau-noi-15-giay.mp4 (cảnh 6, 15 giây, mở/kết màn đen) */
const {chromium}=require(process.env.PLAYWRIGHT||'/opt/node-tools/node_modules/playwright');const path=require('path'),fs=require('fs'),url=require('url'),{spawn}=require('child_process');const D=__dirname,FPS=30,DAI=15;
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1920,height:1080}});p.on('pageerror',e=>console.log('ERR',e.message));
await p.goto(url.pathToFileURL(path.join(D,'canh.html')).href+'?n='+(process.argv[2]||6));await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(700);
await p.evaluate(()=>document.getAnimations().forEach(a=>a.pause()));
const ff=spawn('ffmpeg',['-y','-loglevel','error','-f','image2pipe','-framerate',String(FPS),'-c:v','mjpeg','-i','-','-vf','fade=t=in:st=0:d=0.8,fade=t=out:st=14:d=1','-c:v','libx264','-preset','slow','-crf','16','-pix_fmt','yuv420p','-movflags','+faststart',path.join(D,process.argv[3]||'cau-noi-15-giay.mp4')]);
for(let f=0;f<FPS*DAI;f++){const t=f*1000/FPS;await p.evaluate(t=>document.getAnimations().forEach(a=>{a.currentTime=t}),t);const buf=await p.screenshot({type:'jpeg',quality:94});
 if([4,7,10,13].some(s=>s*FPS===f))fs.writeFileSync(path.join(D,'gon-'+(process.argv[2]||6)+'-'+f/FPS+'s.jpg'),buf);if(!ff.stdin.write(buf))await new Promise(r=>ff.stdin.once('drain',r))}
ff.stdin.end();await new Promise(r=>ff.on('close',r));await b.close();console.log('xong')})();
