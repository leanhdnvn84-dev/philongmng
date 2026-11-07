/* node dung-lai-duoi.js <thư mục> <video cũ.mp4> [nhac.mp3]
   Dựng lại chỉ phần cuối (từ T_KET – 1 giây, thẻ kết) của video.html rồi ghép vào video cũ → <video cũ> (ghi đè) + bản -nhe 720p.
   Dùng khi chỉ sửa chữ ở thẻ kết (vd. dòng "Ý tưởng & thực hiện"), khỏi dựng lại cả bài. */
const {chromium}=require(process.env.PLAYWRIGHT||'/opt/node-tools/node_modules/playwright');const path=require('path'),url=require('url'),fs=require('fs'),{spawn,execFileSync}=require('child_process');
const D=path.resolve(process.argv[2]),CU=path.join(D,process.argv[3]),MP3=process.argv[4]?path.join(D,process.argv[4]):'',FPS=25;
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1920,height:1080}});p.on('pageerror',e=>console.log('ERR',e.message));
await p.goto(url.pathToFileURL(path.join(D,'video.html')).href);await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(1500);
const {TK,TONG}=await p.evaluate(()=>{const L=window.LOI;return {TK:L[L.length-1].b,TONG:window.TONG}});
const f0=Math.floor((TK-1)*FPS),N=Math.ceil(TONG*FPS),duoi=path.join(D,'_duoi.mp4');
const ff=spawn('ffmpeg',['-y','-loglevel','error','-f','image2pipe','-framerate',String(FPS),'-c:v','mjpeg','-i','-','-c:v','libx264','-preset','medium','-crf','19','-pix_fmt','yuv420p',duoi]);
for(let f=f0;f<N;f++){await p.evaluate(t=>window.ve(t),f/FPS);const buf=await p.screenshot({type:'jpeg',quality:92,timeout:0});if(!ff.stdin.write(buf))await new Promise(r=>ff.stdin.once('drain',r))}
ff.stdin.end();await new Promise(r=>ff.on('close',r));await b.close();
const moi=path.join(D,'_moi.mp4'),t0=(f0/FPS).toFixed(3);
const vao=['-y','-loglevel','error','-i',CU,'-i',duoi].concat(MP3?['-i',MP3]:[]);
const loc=`[0:v]trim=end=${t0},setpts=PTS-STARTPTS[a];[1:v]setpts=PTS-STARTPTS[b];[a][b]concat=n=2:v=1:a=0[v]`;
execFileSync('ffmpeg',vao.concat(['-filter_complex',loc,'-map','[v]'],MP3?['-map','2:a','-c:a','aac','-b:a','192k','-shortest']:[],['-c:v','libx264','-preset','medium','-crf','19','-pix_fmt','yuv420p','-movflags','+faststart',moi]));
fs.renameSync(moi,CU);fs.unlinkSync(duoi);
execFileSync('ffmpeg',['-y','-loglevel','error','-i',CU,'-c:v','libx264','-crf','27','-vf','scale=1280:-2','-pix_fmt','yuv420p'].concat(MP3?['-c:a','aac','-b:a','160k']:[],['-movflags','+faststart',CU.replace(/\.mp4$/,'-nhe.mp4')]));
console.log('xong',path.basename(CU),'từ giây',t0)})();
