/* Demo phông trang chủ (24/10): chữ thường kiểu viết bút, chữ lớn kiểu thư pháp – chụp trên trang chủ thật (bản tai-ve), chưa sửa web app.
   Chạy: PLAYWRIGHT=… node thiet-ke/phong-chu-trang-chu/render.js */
const {chromium}=require(process.env.PLAYWRIGHT||'playwright');const path=require('path');const D=__dirname;
const PA={
 hien:null,
 a:{ten:'A · Dancing Script + Charm',lon:"'Dancing Script'",kl:700,hs:1.12,but:'Charm',bs:1.08,url:'Dancing+Script:wght@600;700&family=Charm:wght@400;700'},
 b:{ten:'B · Water Brush (bút lông) + Charm',lon:"'Water Brush'",kl:400,hs:1.3,but:'Charm',bs:1.08,url:'Water+Brush&family=Charm:wght@400;700'},
 c:{ten:'C · Great Vibes + Patrick Hand',lon:"'Great Vibes'",kl:400,hs:1.35,but:"'Patrick Hand'",bs:1.12,url:'Great+Vibes&family=Patrick+Hand'}};
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
for(const [w,h,t,sc] of [[1366,768,'may-tinh',1],[390,844,'dien-thoai',2]])for(const k of Object.keys(PA)){const o=PA[k];
 const p=await b.newPage({viewport:{width:w,height:h},deviceScaleFactor:sc});
 await p.goto('file://'+path.resolve(D,'../../tai-ve/NguyenHien-2000-2003.html'));await p.waitForTimeout(2200);
 await p.evaluate(()=>{dongThu();document.querySelectorAll('.bdemo,#tbNut').forEach(e=>e.remove())});
 if(o){await p.addStyleTag({url:'https://fonts.googleapis.com/css2?family='+o.url+'&display=swap'});await p.waitForTimeout(400);
  await p.evaluate(o=>{const lon=o.lon+',cursive';document.querySelectorAll('#v-home *').forEach(e=>{const s=getComputedStyle(e),f=s.fontFamily,tx=[...e.childNodes].filter(n=>n.nodeType===3).map(n=>n.textContent).join('').trim();if(!tx&&!e.classList.contains('w'))return;if(e.closest('button,.btn,a.btn'))return;const fs=parseFloat(s.fontSize);
   if(/Playfair/.test(f)){if(/^[\d.,\s–-]+$/.test(tx)){e.style.fontVariantNumeric='lining-nums tabular-nums';return}e.style.fontFamily=lon;e.style.fontWeight=o.kl;e.style.fontStyle='normal';e.style.fontSize=(fs*o.hs)+'px';e.style.lineHeight='1.2';e.style.letterSpacing='0'}
   else if(/Be Vietnam/.test(f)&&+s.fontWeight<600&&fs>=14&&fs<=20&&tx.length>20){e.style.fontFamily=o.but+',cursive';e.style.fontSize=(fs*o.bs)+'px';e.style.lineHeight='1.55'}
   else if(/Charm/.test(f)&&o.but!=='Charm'){e.style.fontFamily=o.but+',cursive'}})},o);
  await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(800);
  const ok=await p.evaluate(o=>[document.fonts.check('700 40px '+o.lon,'Mùa hè'),document.fonts.check('20px '+o.but,'Mùa hè')],o);console.log(t,k,ok)}
 await p.evaluate(()=>{scrollTo(0,0);if(window.vuaHero_)vuaHero_()});await p.waitForTimeout(500);
 await p.screenshot({path:path.join(D,`${k}-${t}.jpg`),type:'jpeg',quality:82,fullPage:true,clip:{x:0,y:0,width:w,height:t==='may-tinh'?1420:2300}});await p.close()}
await b.close()})();
