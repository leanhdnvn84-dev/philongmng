/* node render.js [hệ số=2] → NN-ten.jpg (3840×2160) + tong-quan.jpg */
const {chromium}=require(process.env.PLAYWRIGHT||'/opt/node-tools/node_modules/playwright');const path=require('path'),url=require('url'),{execFileSync}=require('child_process');
const D=__dirname,HS=+(process.argv[2]||2),TEN=['chao-mung','kinh-chao-thay-co','chuong-trinh','khai-mac','tri-an-thay-co','mot-phut-hoai-niem','muoi-hai-lop','giao-luu-van-nghe','luu-but-gala','hen-gap-lai'];
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1920,height:1080},deviceScaleFactor:HS});p.on('pageerror',e=>console.log('ERR',e.message));
for(let n=1;n<=10;n++){await p.goto(url.pathToFileURL(path.join(D,'led.html')).href+'?n='+n);await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(800);
 await p.screenshot({path:path.join(D,String(n).padStart(2,'0')+'-'+TEN[n-1]+'.jpg'),type:'jpeg',quality:93,timeout:0});console.log(n)}
await b.close();
execFileSync('python3',['-c',`import glob
from PIL import Image
f=sorted(glob.glob('${D}/[01][0-9]-*.jpg'));W,H=640,360;g=Image.new('RGB',(W*5+60,H*2+30),'#333')
for i,x in enumerate(f):g.paste(Image.open(x).resize((W,H)),(10+(i%5)*(W+10),10+(i//5)*(H+10)))
g.save('${D}/tong-quan.jpg',quality=85)`])})();
