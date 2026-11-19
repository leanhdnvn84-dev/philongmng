/* Tạo ban-do-vn.svg: cần npm i world-atlas@2 topojson-client@3 d3-geo@3 (Natural Earth 10m/50m); node tao-ban-do.mjs ban-do-vn.svg
   Hoàng Sa: lấy các đảo Natural Earth gán cho TQ (vĩ độ <17.6, kinh độ >110.5) tô màu Việt Nam; Trường Sa: "Spratly Is." + chấm đảo. */
import fs from 'fs';import {feature} from 'topojson-client';import {geoMercator,geoPath,geoCentroid,geoGraticule} from 'd3-geo';
const t=JSON.parse(fs.readFileSync('node_modules/world-atlas/countries-10m.json'));
const fc=feature(t,t.objects.countries);
const W=620,H=760;
const box={type:'Feature',geometry:{type:'MultiPoint',coordinates:[[101.8,23.6],[117.2,7.3]]}};
const pj=geoMercator().fitExtent([[10,10],[W-10,H-10]],box).clipExtent([[-5,-5],[W+5,H+5]]);
const t5=JSON.parse(fs.readFileSync('node_modules/world-atlas/countries-50m.json'));const fc5=feature(t5,t5.objects.countries);
const path=geoPath(pj).digits(0);
const P=(lon,lat)=>pj([lon,lat]).map(v=>+v.toFixed(1));
const VN=fc.features.find(f=>f.id==='704');
const SP=fc.features.find(f=>f.properties.name==='Spratly Is.');
const CN=fc5.features.find(f=>f.id==='156');const CN10=fc.features.find(f=>f.id==='156');
// tách quần đảo Hoàng Sa khỏi dữ liệu (Natural Earth gán sai) -> màu Việt Nam
const cnKeep=[],hs=[];
for(const poly of CN.geometry.coordinates){const c=geoCentroid({type:'Polygon',coordinates:poly});if(!(c[1]<17.6&&c[0]>110.5))cnKeep.push(poly);}
for(const poly of CN10.geometry.coordinates){const c=geoCentroid({type:'Polygon',coordinates:poly});if(c[1]<17.6&&c[0]>110.5)hs.push(poly);}
const cn={type:'Feature',geometry:{type:'MultiPolygon',coordinates:cnKeep}};
const ben=['418','116','764','608','458','360','096','158','344','446','104'].map(id=>fc5.features.find(f=>f.id===id)).filter(Boolean);
let s=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" class="bdvn" role="img" aria-label="Bản đồ Việt Nam có quần đảo Hoàng Sa và Trường Sa">`;
s+=`<defs><linearGradient id="bien" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#CFEAF6"/><stop offset="1" stop-color="#9FD3EC"/></linearGradient>
<linearGradient id="dat" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7CC66A"/><stop offset=".5" stop-color="#5DB860"/><stop offset="1" stop-color="#3FA45B"/></linearGradient>
<filter id="bong" x="-10%" y="-10%" width="120%" height="120%"><feDropShadow dx="0" dy="3" stdDeviation="3" flood-color="#1E5B82" flood-opacity=".35"/></filter>
<pattern id="song" width="22" height="12" patternUnits="userSpaceOnUse"><path d="M0 8 q5.5 -5 11 0 t11 0" fill="none" stroke="#fff" stroke-opacity=".28" stroke-width="1"/></pattern><clipPath id="khung"><rect width="${W}" height="${H}" rx="26"/></clipPath></defs><g clip-path="url(#khung)">`;
s+=`<rect width="${W}" height="${H}" rx="26" fill="url(#bien)"/><rect width="${W}" height="${H}" rx="26" fill="url(#song)"/>`;
s+=`<path d="${geoPath(pj).digits(0)(geoGraticule().step([2,2])())}" fill="none" stroke="#fff" stroke-opacity=".35" stroke-width=".6"/>`;
s+=`<g fill="#F4EBD9" stroke="#D8C9AB" stroke-width=".7">`+ben.map(f=>path(f)).filter(Boolean).map(d=>`<path d="${d}"/>`).join('')+`<path d="${path(cn)}"/></g>`;
s+=`<g filter="url(#bong)"><path d="${path(VN)}" fill="url(#dat)" stroke="#fff" stroke-width="1.6" stroke-linejoin="round"/></g>`;
// biên giới mảnh
if(process.argv[3]!=='app')s+=`<path d="${path(VN)}" fill="none" stroke="#2C7F4A" stroke-width=".5" stroke-opacity=".6"/>`;
// đảo: Hoàng Sa (dữ liệu) + Trường Sa (dữ liệu) + chấm đảo
const dao=(lon,lat,r=2.6)=>{const [x,y]=P(lon,lat);return `<circle cx="${x}" cy="${y}" r="${r}" fill="#3FA45B" stroke="#fff" stroke-width="1"/>`};
const HS=[[112.34,16.83],[111.6,16.53],[111.2,15.78],[112.73,16.67],[111.71,16.45],[112.26,16.97],[111.5,16.45],[111.76,16.58]];
const TS=[[111.92,8.64],[114.33,11.43],[114.33,9.88],[114.36,10.18],[114.48,10.37],[112.91,7.89],[113.85,8.85],[114.22,11.06],[112.6,9.0],[115.0,10.1],[114.9,8.9],[113.3,8.4]];
const KHAC=[[107.73,20.13,'Bạch Long Vĩ'],[107.34,17.16,'Cồn Cỏ'],[109.12,15.38,'Lý Sơn'],[108.94,10.52,'Phú Quý'],[106.6,8.69,'Côn Đảo'],[103.47,9.3,'Thổ Chu'],[103.96,10.22,'Phú Quốc']];
const vong=(pts,pad)=>{const xy=pts.map(p=>P(p[0],p[1]));const xs=xy.map(p=>p[0]),ys=xy.map(p=>p[1]);const cx=(Math.min(...xs)+Math.max(...xs))/2,cy=(Math.min(...ys)+Math.max(...ys))/2,rx=(Math.max(...xs)-Math.min(...xs))/2+pad,ry=(Math.max(...ys)-Math.min(...ys))/2+pad;return {cx,cy,rx,ry}};
const v1=vong(HS,14),v2=vong(TS,16);
for(const v of [v1,v2])s+=`<ellipse cx="${v.cx}" cy="${v.cy}" rx="${v.rx}" ry="${v.ry}" fill="#fff" fill-opacity=".35" stroke="#2C7F4A" stroke-width="1.2" stroke-dasharray="4 4"/>`;
s+=`<path d="${geoPath(pj).digits(0)({type:'MultiPolygon',coordinates:hs})}" fill="#3FA45B"/><path d="${path(SP)}" fill="#3FA45B"/>`;
s+=HS.map(p=>dao(p[0],p[1])).join('')+TS.map(p=>dao(p[0],p[1])).join('')+KHAC.map(p=>dao(p[0],p[1],2.4)).join('');
const nhan=(x,y,t,anchor='start',size=13,w=700,col='#1E5B82')=>`<text x="${x}" y="${y}" text-anchor="${anchor}" font-family="Be Vietnam Pro" font-size="${size}" font-weight="${w}" fill="${col}" paint-order="stroke" stroke="#fff" stroke-width="3" stroke-linejoin="round">${t}</text>`;
s+=nhan(v1.cx,v1.cy-v1.ry-18,'QUẦN ĐẢO','middle',11,700,'#2C7F4A')+nhan(v1.cx,v1.cy-v1.ry-4,'HOÀNG SA','middle',14,800,'#17462E')+nhan(v1.cx,v1.cy+v1.ry+14,'(Đà Nẵng)','middle',11,600,'#2C7F4A');
s+=nhan(v2.cx,v2.cy-v2.ry-18,'QUẦN ĐẢO','middle',11,700,'#2C7F4A')+nhan(v2.cx,v2.cy-v2.ry-4,'TRƯỜNG SA','middle',14,800,'#17462E')+nhan(v2.cx,v2.cy+v2.ry+14,'(Khánh Hòa)','middle',11,600,'#2C7F4A');
{const [x,y]=P(112.2,13.4);s+=`<text x="${x}" y="${y}" text-anchor="middle" font-family="Baloo 2, sans-serif" font-size="26" font-weight="700" fill="#2E86C1" fill-opacity=".75" letter-spacing="3">BIỂN ĐÔNG</text>`;}
{const [x,y]=P(101.6,8.6);s+=nhan(x,y,'Vịnh Thái Lan','start',11,600,'#4A86A8');}
{const [x,y]=P(106.6,19.2);s+=nhan(x,y,'Vịnh Bắc Bộ','start',11,600,'#4A86A8');}
s+=KHAC.map(p=>{const [x,y]=P(p[0],p[1]);return p[2]=='Phú Quốc'?nhan(x-6,y+12,p[2],'end',10,600,'#2C5A46'):nhan(x+6,y+4,p[2],'start',10,600,'#2C5A46')}).join('');
{const [x,y]=P(104.2,18.6);s+=`<text x="${x}" y="${y}" font-family="Be Vietnam Pro" font-size="11" fill="#A8977A" font-weight="600">LÀO</text>`;const [a,b]=P(104.3,12.9);s+=`<text x="${a}" y="${b}" font-family="Be Vietnam Pro" font-size="11" fill="#A8977A" font-weight="600">CAMPUCHIA</text>`;const [c,d]=P(102.0,15.6);s+=`<text x="${c}" y="${d}" font-family="Be Vietnam Pro" font-size="11" fill="#A8977A" font-weight="600">THÁI LAN</text>`;const [e,g]=P(107.4,22.95);s+=`<text x="${e}" y="${g}" font-family="Be Vietnam Pro" font-size="11" fill="#A8977A" font-weight="600">TRUNG QUỐC</text>`;}
// thành phố + số bạn
const APP=process.argv[3]==='app';const TP=APP?[]:[[105.85,21.03,'Hà Nội',14,'#9B7FD4','e'],[108.22,16.07,'Đà Nẵng',186,'#FF9F43','e'],[106.7,10.78,'TP. Hồ Chí Minh',58,'#FF8FA3','w'],[107.59,16.46,'Huế',5,'#4DB6E8','w'],[108.8,15.12,'Quảng Ngãi',6,'#4DB6E8','e'],[109.19,12.24,'Nha Trang',7,'#4DB6E8','e'],[105.78,10.03,'Cần Thơ',3,'#4DB6E8','w'],[108.44,11.94,'Đà Lạt',4,'#4DB6E8','w']];
for(const c of TP){const [x,y]=P(c[0],c[1]);const r=Math.max(5,Math.sqrt(c[3])*1.5);
 s+=`<circle cx="${x}" cy="${y}" r="${(r+8).toFixed(1)}" fill="${c[4]}" fill-opacity=".25"/><circle cx="${x}" cy="${y}" r="${r.toFixed(1)}" fill="${c[4]}" stroke="#fff" stroke-width="2.5"/>`;
 if(c[3]>=10){const tx=c[5]=='e'?x+r+10:x-r-10,an=c[5]=='e'?'start':'end';const lbl=`${c[2]} · ${c[3]}`;const wdt=lbl.length*7.4+18;const rx0=c[5]=='e'?tx-6:tx-wdt+6;
  s+=`<rect x="${rx0}" y="${y-13}" width="${wdt}" height="26" rx="13" fill="#17462E"/><text x="${c[5]=='e'?tx+3:tx-3}" y="${y+5}" text-anchor="${an}" font-family="Be Vietnam Pro" font-size="13" font-weight="700" fill="#fff">${lbl}</text>`;}}
// la bàn
s+=`<g transform="translate(${W-46} 46)"><circle r="22" fill="#fff" fill-opacity=".85"/><path d="M0 -16 L5 0 L0 16 L-5 0Z" fill="#17462E"/><path d="M0 -16 L5 0 L-5 0Z" fill="#D93A2B"/><text y="-25" text-anchor="middle" font-family="Baloo 2, sans-serif" font-weight="800" font-size="12" fill="#17462E">B</text></g>`;
s+='</g></svg>';
if(APP)s=s.replace(' xmlns="http://www.w3.org/2000/svg"','').replace('<svg ','<svg id="bdSvg" ');fs.writeFileSync(process.argv[2],s);console.log('scale',pj.scale(),'translate',pj.translate());console.log(s.length);
