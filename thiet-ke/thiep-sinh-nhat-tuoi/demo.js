/* node demo.js → so-sanh.jpg: thiệp in sinh nhật với 3 kiểu thay huy hiệu "Tròn N tuổi" (A ngày sinh · B Mãi tuổi 18 · C N năm tình bạn) */
const {chromium}=require(process.env.PLAYWRIGHT||'/opt/node-tools/node_modules/playwright');const path=require('path'),url=require('url'),{execFileSync}=require('child_process');
const D=__dirname,APP=path.join(D,'../../tai-ve/NguyenHien-2000-2003.html');
const KIEU={
 a:['A · Ngày sinh',x=>`<span>Ngày</span><b>${String(x.n.d).padStart(2,'0')}</b><span>tháng ${x.n.m}</span>`,x=>`Sinh nhật ${x.n.d}/${x.n.m}`],
 b:['B · Mãi tuổi 18',x=>`<span>Mãi mãi</span><b>18</b><span>tuổi</span>`,x=>'Mãi mãi tuổi 18'],
 c:['C · Năm tình bạn',x=>`<b>${new Date().getFullYear()-2003}</b><span>năm</span><span>tình bạn</span>`,x=>(new Date().getFullYear()-2003)+' năm tình bạn Nguyễn Hiền']};
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1500,height:1900},deviceScaleFactor:1.5});p.on('pageerror',e=>console.log('ERR',e.message));
await p.goto(url.pathToFileURL(APP).href);await p.waitForTimeout(3500);
const ten=await p.evaluate(()=>{document.querySelectorAll('#loader,.thuNen,#thuNen').forEach(e=>e.remove&&e.classList.remove('on'));const h={id:'mau_sn',hoTen:'Nguyễn Thị Minh Thư',ngaySinh:'14/11/1985'};D.lop=[{id:'mau_l4',ten:'12/4',hs:[h]}];const x=snDs('').find(y=>y.s===h);moSn(x.s.id);return x.s.hoTen});console.log(ten);
const ds=[];for(const [k,[nhan,the,dong]] of Object.entries(KIEU)){
 await p.evaluate(([th,dg])=>{const x=snDs('').find(y=>String(y.s.id)===String(SN_ID));const fT=eval(th),fD=eval(dg);
  const t=document.querySelector('#snThiep .tuoi');t.textContent=t.textContent.replace(/ · tròn \d+ tuổi/,' · '+fD(x));
  document.getElementById('snXem')&&document.getElementById('snXem').remove();xemInSn();document.querySelector('#xemBao .snThe .tuoi').innerHTML=fT(x)},[the.toString(),dong.toString()]);
 await p.waitForTimeout(800);const f=path.join(D,'the-'+k+'.jpg');await (await p.$('#xemBao .snThe')).screenshot({path:f,type:'jpeg',quality:88});
 await p.evaluate(()=>document.getElementById('snXem').remove());const g=path.join(D,'popup-'+k+'.jpg');await (await p.$('#snThiep')).screenshot({path:g,type:'jpeg',quality:88});ds.push([k,nhan]);
 await p.evaluate(()=>moSn(SN_ID,1))}
const html='<body style="margin:0;background:#F3EEE6;font:700 26px sans-serif;color:#7A1E2A"><div id="g" style="display:flex;gap:26px;padding:26px">'+ds.map(([k,n])=>`<div style="width:440px;text-align:center"><div style="margin-bottom:12px">${n}</div><img src="the-${k}.jpg" style="width:440px;display:block;box-shadow:0 6px 18px rgba(0,0,0,.2)"><img src="popup-${k}.jpg" style="width:440px;display:block;margin-top:18px;border-radius:14px"></div>`).join('')+'</div></body>';
require('fs').writeFileSync(path.join(D,'_ss.html'),html);await p.goto(url.pathToFileURL(path.join(D,'_ss.html')).href);await p.waitForTimeout(600);
await (await p.$('#g')).screenshot({path:path.join(D,'so-sanh.jpg'),type:'jpeg',quality:86});require('fs').unlinkSync(path.join(D,'_ss.html'));await b.close()})();
