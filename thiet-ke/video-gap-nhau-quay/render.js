/* node render.js [nhac.mp3] [fps=25] [hệ số=1] → video-nguyen-hien-oi.mp4 (1920×1080) + loi.srt; có mp3 thì ghép nhạc (-shortest) */
const {chromium}=require(process.env.PLAYWRIGHT||'/opt/node-tools/node_modules/playwright');const path=require('path'),url=require('url'),fs=require('fs'),{spawn,execFileSync}=require('child_process');
const D=__dirname,MP3=process.argv[2]&&process.argv[2]!=='-'?path.resolve(process.argv[2]):'',FPS=+(process.argv[3]||25),HS=+(process.argv[4]||1);
const gio=s=>{const ms=Math.round(s*1000),h=Math.floor(ms/3600000),m=Math.floor(ms/60000)%60,ss=Math.floor(ms/1000)%60;return [h,m,ss].map(x=>String(x).padStart(2,'0')).join(':')+','+String(ms%1000).padStart(3,'0')};
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1920,height:1080},deviceScaleFactor:HS});p.on('pageerror',e=>console.log('ERR',e.message));
await p.goto(url.pathToFileURL(path.join(D,'video.html')).href);await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(1500);
const {LOI,TONG}=await p.evaluate(()=>({LOI:window.LOI,TONG:window.TONG}));
fs.writeFileSync(path.join(D,'loi.srt'),LOI.map((x,i)=>`${i+1}\n${gio(x.a)} --> ${gio(x.b)}\n${x.c}\n`).join('\n'));
const ra=path.join(D,MP3?'_hinh.mp4':'video-nguyen-hien-oi.mp4');
const ff=spawn('ffmpeg',['-y','-loglevel','error','-f','image2pipe','-framerate',String(FPS),'-c:v','mjpeg','-i','-','-c:v','libx264','-preset','medium','-crf','19','-pix_fmt','yuv420p','-movflags','+faststart',ra]);
const N=Math.ceil(TONG*FPS);for(let f=0;f<N;f++){await p.evaluate(t=>window.ve(t),f/FPS);const buf=await p.screenshot({type:'jpeg',quality:92,timeout:0});
 if(!ff.stdin.write(buf))await new Promise(r=>ff.stdin.once('drain',r));if(f%250===0)console.log('khung',f,'/',N)}
ff.stdin.end();await new Promise(r=>ff.on('close',r));await b.close();
if(MP3){execFileSync('ffmpeg',['-y','-loglevel','error','-i',ra,'-i',MP3,'-c:v','copy','-c:a','aac','-b:a','192k','-shortest','-movflags','+faststart',path.join(D,'video-nguyen-hien-oi.mp4')]);fs.unlinkSync(ra)}
console.log('xong',TONG.toFixed(1),'giây')})();
