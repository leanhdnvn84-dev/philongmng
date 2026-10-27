/* node render.js → xem-truoc-1..3.jpg + nguyen-hien-mot-thoi-de-nho.pdf (A4, 3 trang) */
const {chromium}=require(process.env.PLAYWRIGHT||'/opt/node-tools/node_modules/playwright');const path=require('path'),url=require('url');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:900,height:1200},deviceScaleFactor:2});
await p.goto(url.pathToFileURL(path.join(__dirname,'tho.html')).href);await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(800);
const tr=await p.$$('.trang');for(let i=0;i<tr.length;i++)await tr[i].screenshot({path:path.join(__dirname,`xem-truoc-${i+1}.jpg`),type:'jpeg',quality:85});
const tran=await p.evaluate(()=>[...document.querySelectorAll('.nd')].map(n=>{const r=n.getBoundingClientRect();return Math.max(...[...n.querySelectorAll('*')].map(e=>e.getBoundingClientRect().bottom))-r.bottom}));console.log('tràn (px, âm là còn chỗ):',tran.map(Math.round));
await p.emulateMedia({media:'print'});await p.pdf({path:path.join(__dirname,'nguyen-hien-mot-thoi-de-nho.pdf'),format:'A4',printBackground:true,preferCSSPageSize:true});
await b.close()})();
