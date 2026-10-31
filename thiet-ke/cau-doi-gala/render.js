/* node render.js [1] → xem-truoc-trai/phai.png + xem-truoc-ca-bo.jpg ; node render.js 3 → cau-doi-*-100x300cm.pdf + cau-doi-*-3000x9000.jpg + cau-doi-gala-in.zip */
const {chromium}=require(process.env.PLAYWRIGHT||'/opt/node-tools/node_modules/playwright');const path=require('path'),url=require('url'),{execFileSync}=require('child_process');
const D=__dirname,HS=+(process.argv[2]||1);
(async()=>{const b=await chromium.launch();
for(const k of ['trai','phai']){const p=await b.newPage({viewport:{width:1000,height:3000},deviceScaleFactor:HS});p.on('pageerror',e=>console.log('ERR',e.message));
 await p.goto(url.pathToFileURL(path.join(D,'cau-doi.html')).href+'?b='+k);await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(1500);
 if(HS>1){await p.screenshot({path:path.join(D,'cau-doi-'+k+'.png'),timeout:0});await p.emulateMedia({media:'print'});await p.pdf({path:path.join(D,'cau-doi-'+k+'-100x300cm.pdf'),width:'100cm',height:'300cm',printBackground:true,pageRanges:'1'})}
 else await p.screenshot({path:path.join(D,'xem-truoc-'+k+'.png')});await p.close()}
await b.close();
if(HS>1){execFileSync('python3',['-c',`from PIL import Image
Image.MAX_IMAGE_PIXELS=None
import os
for k in ['trai','phai']:
  f='${D}/cau-doi-'+k+'.png';Image.open(f).convert('RGB').save('${D}/cau-doi-'+k+'-3000x9000.jpg',quality=92,dpi=(76,76));os.remove(f)`]);
 execFileSync('zip',['-qj',path.join(D,'cau-doi-gala-in.zip'),...['trai','phai'].flatMap(k=>[path.join(D,'cau-doi-'+k+'-100x300cm.pdf'),path.join(D,'cau-doi-'+k+'-3000x9000.jpg')])])}
else execFileSync('python3',['-c',`from PIL import Image
a=Image.open('${D}/xem-truoc-trai.png').convert('RGB').resize((400,1200));b=Image.open('${D}/xem-truoc-phai.png').convert('RGB').resize((400,1200))
bd=Image.open('${D}/../backdrop-gala-mau-nuoc/backdrop-xem-truoc.png').convert('RGB').resize((2400,1200))
g=Image.new('RGB',(400+2400+400+80,1260),'#2A2320');g.paste(a,(20,30));g.paste(bd,(440,30));g.paste(b,(2860,30));g.save('${D}/xem-truoc-ca-bo.jpg',quality=88)`])})();
