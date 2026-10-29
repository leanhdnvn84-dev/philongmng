/* node render-clip.js [n…] → clip/NN.mp4 (1920×1080, 30 khung/giây, 10 giây) + clip/tat-ca.mp4 (ghép 10 cảnh) */
const {chromium}=require(process.env.PLAYWRIGHT||'/opt/node-tools/node_modules/playwright');const path=require('path'),fs=require('fs'),url=require('url'),{spawn,execFileSync}=require('child_process');const D=__dirname,FPS=30,DAI=11;
const ds=process.argv.slice(2).map(Number);const CANH=ds.length?ds:[1,2,3,4,5,6,7,8,9,10];
(async()=>{fs.mkdirSync(path.join(D,'clip'),{recursive:true});const b=await chromium.launch();const p=await b.newPage({viewport:{width:1920,height:1080}});p.on('pageerror',e=>console.log('ERR',e.message));
for(const n of CANH){await p.goto(url.pathToFileURL(path.join(D,'canh.html')).href+'?n='+n+'&dong=1');await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(600);
 await p.evaluate(()=>document.getAnimations().forEach(a=>a.pause()));
 const ra=path.join(D,'clip',String(n).padStart(2,'0')+'.mp4');
 const ff=spawn('ffmpeg',['-y','-loglevel','error','-f','image2pipe','-framerate',String(FPS),'-c:v','mjpeg','-i','-','-c:v','libx264','-preset','slow','-crf','18','-pix_fmt','yuv420p','-movflags','+faststart',ra]);
 for(let f=0;f<FPS*DAI;f++){await p.evaluate(t=>document.getAnimations().forEach(a=>{a.currentTime=t}),f*1000/FPS);const buf=await p.screenshot({type:'jpeg',quality:93});if(!ff.stdin.write(buf))await new Promise(r=>ff.stdin.once('drain',r))}
 ff.stdin.end();await new Promise(r=>ff.on('close',r));console.log('xong',ra)}
await b.close();
const all=[1,2,3,4,5,6,7,8,9,10].map(n=>path.join(D,'clip',String(n).padStart(2,'0')+'.mp4'));if(all.every(f=>fs.existsSync(f))){fs.writeFileSync(path.join(D,'clip','ds.txt'),all.map(f=>`file '${f}'`).join('\n'));execFileSync('ffmpeg',['-y','-loglevel','error','-f','concat','-safe','0','-i',path.join(D,'clip','ds.txt'),'-c','copy',path.join(D,'clip','tat-ca-1-phut-50-giay.mp4')]);fs.unlinkSync(path.join(D,'clip','ds.txt'));console.log('ghép xong')}})();
