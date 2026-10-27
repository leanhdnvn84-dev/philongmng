/* Demo (chưa áp vào web app): thay phần chữ đầu trang chủ bằng thơ, giữ nút + thư ngỏ + sinh nhật + câu xoay.
   node thiet-ke/hero-tho/render.js → a-*.jpg (Mười hai lớp lại sum vầy), b-*.jpg (Một thời để nhớ – mở đầu bài thơ) */
const {chromium}=require(process.env.PLAYWRIGHT||'/opt/node-tools/node_modules/playwright');const path=require('path'),url=require('url');
const R=path.join(__dirname,'..','..'),O=__dirname;
const CSS=`
.p-home .hero .l .hTho{font-family:'Noto Serif',serif;color:#3A2A22;margin-bottom:22px}
.p-home .hero .hTho .ey{font:600 13px 'Noto Serif',serif;letter-spacing:2.4px;text-transform:uppercase;color:#9B7B3E;margin:0}
.hTho .tt{font:400 clamp(54px,5.4vw,84px)/1.12 'Great Vibes',cursive;color:#B3261E;margin:2px 0 0;letter-spacing:0}
.hTho .tt2{font:700 clamp(30px,3vw,46px)/1 'Playfair Display',serif;letter-spacing:.32em;color:#8E1F17;margin:6px 0 0}
.p-home .hero .hTho .phu{font:600 13px 'Noto Serif',serif;letter-spacing:3px;text-transform:uppercase;color:#1F6B3F;margin:4px 0 12px}
.hTho .tang{font:italic 17px/1.5 'Noto Serif',serif;color:#5B4336;margin:6px 0 14px}.hTho .tang b{font-style:normal;color:#7A2A20}
.hTho .hl12{display:flex;flex-wrap:wrap;gap:8px;margin:0 0 16px}
.hTho .hl12 button{font:600 14px 'Noto Serif',serif;color:#1F6B3F;border:1px solid rgba(46,125,79,.5);border-radius:14px;padding:3px 11px;background:rgba(255,255,255,.7);cursor:pointer}
.hTho .htk{display:grid;grid-template-columns:repeat(2,max-content);column-gap:clamp(28px,4vw,64px);row-gap:6px;padding:16px 0 4px;border-top:1px dashed rgba(179,38,30,.3)}
.hTho .kho{font-size:clamp(17px,1.25vw,21px);line-height:1.72;margin:0 0 10px}
.hTho .kho p{margin:0;white-space:nowrap}.hTho .kho p:nth-child(odd){padding-left:1.4em}
.hTho .kho:before{content:'✿';display:block;color:#C8102E;opacity:.55;font-size:12px;line-height:1;margin:0 0 4px 1.6em}
.hTho.a .kho:before{content:'📍';margin-left:0;opacity:1}
.hTho.a .kho:nth-child(3){grid-column:1/-1}
@media(min-width:1500px){.hTho.a .htk{grid-template-columns:repeat(3,max-content)}.hTho.a .kho:nth-child(3){grid-column:auto}.hTho.a .kho{font-size:clamp(17px,1.1vw,20px)}}
.hTho .dd{font-weight:600;color:#8E1F17}
.hTho .doc{font:600 15px 'Be Vietnam Pro',sans-serif;color:#B3261E;background:none;border:0;padding:0;cursor:pointer;text-decoration:underline;text-underline-offset:4px;margin-top:2px}
@media(max-width:760px){.hTho .htk{grid-template-columns:1fr}.hTho .kho p{white-space:normal}.hTho .tt{font-size:clamp(44px,12vw,56px)}.hTho .tt2{font-size:26px;letter-spacing:.2em}}`;
const A=`(()=>{const K=thoKho_();return '<div class="hTho a"><p class="ey">Trích thơ · Nguyễn Hiền – Một thời để nhớ</p><h1 class="tt">Mười hai lớp lại sum vầy</h1><p class="phu">Bạn bè từ mọi miền quê về chung một mái</p><div class="hl12">'+(D.lop.length?D.lop.map(l=>l.ten):Array.from({length:12},(_,i)=>'12/'+(i+1))).map(t=>'<button>'+esc(t)+'</button>').join('')+'</div><div class="htk">'+thoVe_(K.slice(14,17),1)+'</div><button class="doc" onclick="moTho()">📜 Đọc trọn bài thơ →</button></div>'})()`;
const B=`(()=>{const K=thoKho_();return '<div class="hTho b"><p class="ey">Thân tặng thầy cô và bạn bè niên khóa 2000 – 2003</p><p class="tt2">NGUYỄN HIỀN</p><h1 class="tt">Một thời để nhớ</h1><div class="htk">'+thoVe_(K.slice(0,4))+'</div><button class="doc" onclick="moTho()">📜 Đọc trọn bài thơ (22 khổ) →</button></div>'})()`;
(async()=>{const b=await chromium.launch();
for(const [k,H] of [['a',A],['b',B]])for(const [w,h,t,s] of [[1866,912,'may-tinh',1],[1366,768,'laptop',1],[390,844,'dien-thoai',2]]){
 const p=await b.newPage({viewport:{width:w,height:h},deviceScaleFactor:s});p.on('pageerror',e=>console.log('ERR',e.message));
 await p.goto(url.pathToFileURL(path.join(R,'tai-ve/NguyenHien-2000-2003.html')).href);await p.waitForTimeout(3300);
 const r=await p.evaluate(([css,H])=>{const n=document.getElementById('thuNen');if(n)n.classList.remove('on');window._heroDaHien=1;renderHome();
  const st=document.createElement('style');st.textContent=css;document.head.appendChild(st);
  const l=document.querySelector('#v-home .hero .l');l.querySelectorAll(':scope>.goi,:scope>h1,:scope>p.intro').forEach(e=>e.remove());
  l.insertAdjacentHTML('afterbegin',eval(H));const t=document.querySelector('.tho12');if(t)t.remove();vuaHero_();scrollTo(0,0);
  return {zoom:l.style.zoom||1,cao:document.querySelector('#v-home .hero').style.height||'1 màn',tran:document.documentElement.scrollWidth-innerWidth}},[CSS,H]);
 await p.waitForTimeout(1500);console.log(k,t,JSON.stringify(r));
 await p.screenshot({path:path.join(O,`${k}-${t}.jpg`),type:'jpeg',quality:80});await p.close()}
await b.close()})();
