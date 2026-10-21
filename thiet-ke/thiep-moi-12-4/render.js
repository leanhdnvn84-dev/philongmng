/* Tạo thiệp mời "Ngày trở về" cho từng bạn trong ds.txt (lớp 12/4) từ giấy mời của web app.
   Chạy: PLAYWRIGHT=/opt/node-tools/node_modules/playwright node thiet-ke/thiep-moi-12-4/render.js [scale] [ds.txt] [thư mục ảnh] [số bắt đầu] [tên pdf]
   Mặc định: 3 ds.txt anh 1 thiep-moi-12-4 → anh/*.jpg + thiep-moi-12-4.pdf */
const {chromium}=require(process.env.PLAYWRIGHT||'playwright');const fs=require('fs'),path=require('path');
const D=__dirname,A=process.argv,SC=Number(A[2]||3),LOP='4',DS=A[3]||'ds.txt',THU=A[4]||'anh',BD=Number(A[5]||1),PDF=(A[6]||'thiep-moi-12-4')+'.pdf';
const GMOI={nhaHang:'Nhà hàng QUẢNG ĐẠI 2',diaChi:'Số: 190 Đường 30-4, Phường Hòa Cường, TP. Đà Nẵng.'};
const ten=fs.readFileSync(path.join(D,DS),'utf8').split('\n').map(x=>x.trim()).filter(Boolean);
const khongDau=s=>s.normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/đ/g,'d').replace(/Đ/g,'D');
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});const p=await b.newPage({viewport:{width:1200,height:1600},deviceScaleFactor:SC});
/* Nền giấy mời nay tải từ Cloudflare → dùng tệp có sẵn trong assets/ */
await p.route(/giay-moi-nen\.webp/,r=>r.fulfill({path:path.resolve(D,'../../assets/giay-moi-nen.webp'),contentType:'image/webp'}));
await p.goto('file://'+path.resolve(D,'../../apps-script/Index.html'));await p.waitForTimeout(7000);
await p.evaluate(g=>{D.cfg.giayMoi=JSON.stringify(Object.assign((()=>{try{return JSON.parse(D.cfg.giayMoi||'{}')}catch(e){return {}}})(),g));moThu();moGiayMoi('ban');document.querySelectorAll('.bdemo,#tbNut').forEach(e=>e.remove())},GMOI);
await p.evaluate(()=>document.fonts.ready);const out=path.join(D,THU);fs.mkdirSync(out,{recursive:true});const files=[];
for(const [i,t] of ten.entries()){await p.fill('#gmNhap',t);await p.fill('#gmLopNhap',LOP);await p.waitForTimeout(250);
 await p.evaluate(()=>{document.querySelector('.thu .gm').style.zoom='';$('gmZ').style.width=''});
 const f=path.join(out,String(i+BD).padStart(2,'0')+'-'+khongDau(t).toLowerCase().replace(/[^a-z0-9]+/g,'-')+'.jpg');
 await (await p.$('.thu .gm')).screenshot({path:f,type:'jpeg',quality:93});files.push(f);console.log(path.basename(f))}
const h='<html><head><style>@page{size:148mm 210mm;margin:0}body{margin:0}img{display:block;width:148mm;height:210mm;object-fit:cover;page-break-after:always}</style></head><body>'+files.map(f=>`<img src="file://${f}">`).join('')+'</body></html>';
const hf=path.join(D,'_in.html');fs.writeFileSync(hf,h);const q=await b.newPage();await q.goto('file://'+hf,{waitUntil:'load'});await q.pdf({path:path.join(D,PDF),width:'148mm',height:'210mm',printBackground:true});
fs.unlinkSync(hf);await b.close()})();
