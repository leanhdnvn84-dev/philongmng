// Gỡ khai báo sai trong các luật giao diện tối: nền SÁNG hoặc chữ TỐI dưới html[data-theme="dark"].
// Bảng màu tối chuẩn nằm ở khối "PL DARK THEME" cuối file và phủ lên toàn hệ thống.
// Dùng: node tools/dark-clean.js index.html
const fs=require('fs'),postcss=require('postcss');
const file=process.argv[2];let html=fs.readFileSync(file,'utf8');const stats={decls:0,rules:0};
function lum(v){
  v=String(v).trim().toLowerCase();let r,g,b,m;
  if(v==='#fff'||v==='white')return 1;if(v==='#000'||v==='black')return 0;
  if((m=v.match(/^#([0-9a-f]{3})$/)))[r,g,b]=m[1].split('').map(c=>parseInt(c+c,16));
  else if((m=v.match(/^#([0-9a-f]{6})$/)))[r,g,b]=[0,2,4].map(i=>parseInt(m[1].substr(i,2),16));
  else if((m=v.match(/^rgba?\((\d+)[ ,]+(\d+)[ ,]+(\d+)/)))[r,g,b]=[m[1],m[2],m[3]].map(Number);
  else return null;
  return (0.2126*r+0.7152*g+0.0722*b)/255;
}
const isDark=sel=>sel.split(',').every(p=>/data-theme="?dark"?\]/.test(p.replace(/:not\(\[data-theme="?dark"?\]\)/g,'')));
html=html.replace(/(<style[^>]*>)([\s\S]*?)(<\/style>)/g,(m,open,css,close)=>{
  let root;try{root=postcss.parse(css)}catch(e){return m}
  root.walkRules(rule=>{
    if(!isDark(rule.selector)||/pl-d1|plm-cards|pm-theme/.test(rule.selector))return; // bỏ qua khối màu tối chuẩn (có chủ đích dùng nền sáng cho nhãn)
    rule.each(d=>{
      if(d.type!=='decl')return;const p=d.prop.toLowerCase(),v=d.value.replace(/!important/,'').trim(),L=lum(v);
      if(L===null)return;
      if((p==='background'||p==='background-color')&&L>0.6){d.remove();stats.decls++}
      else if(p==='color'&&L<0.4){d.remove();stats.decls++}
    });
    if(!rule.nodes.some(n=>n.type==='decl')){rule.remove();stats.rules++}
  });
  return open+root.toString()+close;
});
fs.writeFileSync(file,html);console.log(JSON.stringify(stats));
