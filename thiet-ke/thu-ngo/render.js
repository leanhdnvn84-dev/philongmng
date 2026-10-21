/* Chụp demo B: man-chao-* và doc-thu-* (máy tính + điện thoại). Chạy: PLAYWRIGHT=… node thiet-ke/thu-ngo/render.js */
const {chromium}=require(process.env.PLAYWRIGHT||'playwright');const path=require('path');
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
for(const [w,h,ten,sc] of [[1366,768,'may-tinh',1],[390,844,'dien-thoai',2]]){const p=await b.newPage({viewport:{width:w,height:h},deviceScaleFactor:sc});
 for(const [q,f] of [['','man-chao'],['?thu=1','doc-thu'],['?o=1','o-noi'],['?o=1&thu=1','o-noi-doc-thu']]){await p.goto(require('url').pathToFileURL(path.join(__dirname,'demo.html')).href+q);await p.evaluate(()=>document.fonts.ready);if(q.includes('thu'))await p.evaluate(()=>moThu());await p.waitForTimeout(900);
  await p.screenshot({path:path.join(__dirname,f+'-'+ten+'.jpg'),type:'jpeg',quality:85})}
 if(ten==='dien-thoai'){await p.goto('file://'+path.join(__dirname,'demo.html'));await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(600);
  const H=await p.evaluate(()=>document.querySelector('.nd').getBoundingClientRect().bottom+document.querySelector('.chao').scrollTop);await p.setViewportSize({width:w,height:Math.ceil(H)});await p.waitForTimeout(300);
  await p.screenshot({path:path.join(__dirname,'man-chao-dien-thoai-ca-trang.jpg'),type:'jpeg',quality:85})}
 await p.close()}
await b.close()})();
