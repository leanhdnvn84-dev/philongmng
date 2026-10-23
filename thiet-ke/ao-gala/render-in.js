/* Xuất lại file in logo áo (23/10): PNG nền trong 300 + 600 dpi (có ghi dpi) và PDF vector đúng kích thước.
   Chạy: PLAYWRIGHT=… node thiet-ke/ao-gala/render-in.js */
const {chromium}=require(process.env.PLAYWRIGHT||'playwright');const path=require('path');const D=__dirname,O=path.join(D,'in-lai');
const DS=[['truoc','logo-nguc-trai',10],['tay','huy-hieu-tay-trai',8]];
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
for(const [id,ten,cm] of DS){for(const dpi of [300,600]){const px=Math.round(cm/2.54*dpi);
  const p=await b.newPage({viewport:{width:400,height:400},deviceScaleFactor:px/400});
  await p.goto('file://'+D+'/ao.html');await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(800);
  const ok=await p.evaluate(()=>[document.fonts.check('900 20px "Playfair Display"'),document.fonts.check('800 20px "Be Vietnam Pro"')]);
  await p.evaluate(i=>{document.body.style.background='transparent';document.body.style.margin='0';const e=document.getElementById(i);document.body.innerHTML='';document.body.appendChild(e);e.style.display='block'},id);
  await (await p.$('#'+id)).screenshot({path:path.join(O,`${ten}-${cm}x${cm}cm-${dpi}dpi.png`),omitBackground:true});console.log(ten,dpi,px,ok);await p.close()}
 const p=await b.newPage();await p.goto('file://'+D+'/ao.html');await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(800);
 await p.evaluate(([i,cm])=>{const e=document.getElementById(i);document.head.insertAdjacentHTML('beforeend',`<style>@page{size:${cm}cm ${cm}cm;margin:0}html,body{margin:0;background:transparent}</style>`);document.body.innerHTML='';document.body.appendChild(e);e.setAttribute('width',cm+'cm');e.setAttribute('height',cm+'cm');e.style.display='block'},[id,cm]);
 await p.pdf({path:path.join(O,`${ten}-${cm}x${cm}cm-vector.pdf`),width:cm+'cm',height:cm+'cm',printBackground:false,pageRanges:'1'});await p.close()}
await b.close()})();
