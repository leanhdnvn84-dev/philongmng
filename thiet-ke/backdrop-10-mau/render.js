/* node render.js [hệ số=1.92] → 01..10-*.jpg (3840×1920) + tong-quan.jpg */
const {chromium}=require(process.env.PLAYWRIGHT||'/opt/node-tools/node_modules/playwright');const path=require('path'),url=require('url'),{execFileSync}=require('child_process');
const D=__dirname,HS=+(process.argv[2]||1.92),TEN=['doi-xung','san-trai','san-phai','the-giay','khung-vang','o-cua-vom','nang-chieu','dai-lua','vong-12-lop','toi-gian'];
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:2000,height:1000},deviceScaleFactor:HS});p.on('pageerror',e=>console.log('ERR',e.message));
for(let m=1;m<=10;m++){await p.goto(url.pathToFileURL(path.join(D,'mau.html')).href+'?m='+m);await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(900);
 await p.screenshot({path:path.join(D,String(m).padStart(2,'0')+'-'+TEN[m-1]+'.jpg'),type:'jpeg',quality:92,timeout:0})}
await b.close();
execFileSync('python3',['-c',`import glob
from PIL import Image
f=sorted(glob.glob('${D}/[01][0-9]-*.jpg'));W,H=760,380;g=Image.new('RGB',(W*2+30,H*5+60),'#333')
for i,x in enumerate(f):g.paste(Image.open(x).resize((W,H)),(10+(i%2)*(W+10),10+(i//2)*(H+10)))
g.save('${D}/tong-quan.jpg',quality=85)`])})();
