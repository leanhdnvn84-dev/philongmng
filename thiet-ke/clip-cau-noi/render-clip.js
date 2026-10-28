/* node render-clip.js [hệ số=1] → doan/NN.mp4 (mỗi cảnh 15 giây) rồi ghép chuyển cảnh mờ chồng 1 giây → cau-noi-cuoi-doan-1.mp4 (~71 giây, mở/kết màn đen) */
const {chromium}=require(process.env.PLAYWRIGHT||'/opt/node-tools/node_modules/playwright');const path=require('path'),fs=require('fs'),url=require('url'),{spawn,execFileSync}=require('child_process');
const D=__dirname,FPS=30,DAI=15,XF=1,HS=+(process.argv[2]||1),N=5;
(async()=>{fs.mkdirSync(path.join(D,'doan'),{recursive:true});const b=await chromium.launch();const p=await b.newPage({viewport:{width:1920,height:1080},deviceScaleFactor:HS});p.on('pageerror',e=>console.log('ERR',e.message));
const CHI=(process.env.CANH||'').split(',').filter(Boolean).map(Number);for(let n=1;n<=N;n++){if(CHI.length&&!CHI.includes(n))continue;await p.goto(url.pathToFileURL(path.join(D,'canh.html')).href+'?n='+n);await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(700);
 await p.evaluate(()=>document.getAnimations().forEach(a=>a.pause()));
 const ra=path.join(D,'doan',String(n).padStart(2,'0')+'.mp4');
 const ff=spawn('ffmpeg',['-y','-loglevel','error','-f','image2pipe','-framerate',String(FPS),'-c:v','mjpeg','-i','-','-c:v','libx264','-preset','medium','-crf','14','-pix_fmt','yuv420p',ra]);
 for(let f=0;f<FPS*DAI;f++){await p.evaluate(t=>document.getAnimations().forEach(a=>{a.currentTime=t}),f*1000/FPS);const buf=await p.screenshot({type:'jpeg',quality:94});if(f===FPS*9)fs.writeFileSync(path.join(D,'doan',String(n).padStart(2,'0')+'.jpg'),buf);if(!ff.stdin.write(buf))await new Promise(r=>ff.stdin.once('drain',r))}
 ff.stdin.end();await new Promise(r=>ff.on('close',r));console.log('cảnh',n)}
await b.close();
const vao=[],loc=[];for(let n=1;n<=N;n++)vao.push('-i',path.join(D,'doan',String(n).padStart(2,'0')+'.mp4'));
let truoc='[0:v]';for(let k=1;k<N;k++){const ra=k===N-1?'[x]':`[v${k}]`;loc.push(`${truoc}[${k}:v]xfade=transition=fade:duration=${XF}:offset=${k*(DAI-XF)}${ra}`);truoc=ra}
const tong=N*DAI-(N-1)*XF;loc.push(`[x]fade=t=in:st=0:d=0.8,fade=t=out:st=${tong-1}:d=1,format=yuv420p[ra]`);
execFileSync('ffmpeg',['-y','-loglevel','error',...vao,'-filter_complex',loc.join(';'),'-map','[ra]','-c:v','libx264','-preset','slow','-crf','17','-movflags','+faststart',path.join(D,HS>1?'cau-noi-cuoi-doan-1-4k.mp4':'cau-noi-cuoi-doan-1.mp4')]);
console.log('xong',tong,'giây')})();
