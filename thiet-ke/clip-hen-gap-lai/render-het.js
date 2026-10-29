/* node render-het.js [hệ số=1] → ket-het-10-giay.mp4: cảnh kết "Một thời để nhớ · Một đời để thương" + chữ HẾT (canh.html?n=9), 10 giây, mờ dần ra đen ở giây cuối */
const {chromium}=require(process.env.PLAYWRIGHT||'/opt/node-tools/node_modules/playwright');const path=require('path'),url=require('url'),{spawn}=require('child_process');
const D=__dirname,FPS=30,DAI=10,HS=+(process.argv[2]||1);
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1920,height:1080},deviceScaleFactor:HS});p.on('pageerror',e=>console.log('ERR',e.message));
await p.goto(url.pathToFileURL(path.join(D,'canh.html')).href+'?n=9');await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(700);
await p.evaluate(()=>document.getAnimations().forEach(a=>a.pause()));
const ff=spawn('ffmpeg',['-y','-loglevel','error','-f','image2pipe','-framerate',String(FPS),'-c:v','mjpeg','-i','-','-vf',`fade=t=in:st=0:d=0.8,fade=t=out:st=${DAI-1}:d=1,format=yuv420p`,'-c:v','libx264','-preset','slow','-crf','16','-movflags','+faststart',path.join(D,'ket-het-10-giay.mp4')]);
for(let f=0;f<FPS*DAI;f++){await p.evaluate(t=>document.getAnimations().forEach(a=>{a.currentTime=t}),f*1000/FPS);const buf=await p.screenshot({type:'jpeg',quality:94});if(f===FPS*8)require('fs').writeFileSync(path.join(D,'ket-het.jpg'),buf);if(!ff.stdin.write(buf))await new Promise(r=>ff.stdin.once('drain',r))}
ff.stdin.end();await new Promise(r=>ff.on('close',r));await b.close();console.log('xong')})();
