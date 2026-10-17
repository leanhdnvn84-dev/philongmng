// V5.9.11 – Bố cục chống tràn: bảng nhiều cột → khung chi tiết thành ngăn trượt; gộp cột phụ; cỡ chữ tiêu đề 11.5px; chi tiết không tràn.
const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
const code=fs.readFileSync(__dirname+'/../Code.gs','utf8'),html=fs.readFileSync(__dirname+'/../index.html','utf8');
const ctx={console,Utilities:{formatDate(){return''},getUuid(){return'A'}}};vm.createContext(ctx);vm.runInContext(code,ctx);const J=s=>JSON.parse(vm.runInContext('JSON.stringify('+s+')',ctx));
// cột bảng: Nguồn vốn bỏ Ngày dự kiến (có ở chi tiết), Khoản vay bỏ Ngày chốt dư nợ (cùng 1 ngày cho mọi khoản)
assert.ok(!J('APP_MODULES.NGUON_VON.columns').includes('NGAY_DU_KIEN'));assert.ok(!J('APP_MODULES.KHOAN_VAY.columns').includes('NGAY_CHOT_DU_NO_DAU_KY'));
assert.ok(J('APP_MODULES.NGUON_VON.columns').includes('GHI_CHU')&&J('APP_MODULES.KHOAN_VAY.columns').includes('DU_NO_GOC_DAU_KY'));
// Kỳ + Loại nguồn thành dòng nhỏ dưới Nội dung phương án
assert.match(html,/const STACK_COLS=\{NGUON_VON:\{NOI_DUNG_PHUONG_AN:\['KY_DU_KIEN','LOAI_NGUON'\]\}\}/);assert.match(html,/class="cell-stack"/);
// ngăn trượt chi tiết
assert.match(html,/function fitTable_\(w\)\{/);assert.match(html,/t\.scrollWidth>lp\.clientWidth\+2\)\{mb\.classList\.add\('drawer'\)/);assert.match(html,/w\.innerHTML=h;fitTable_\(w\);/);
assert.match(html,/\.module-body\.drawer \.detail-pane \{ position: absolute;/);assert.match(html,/e\.key==='Escape'/);assert.match(html,/data-drawer-close/);
// cỡ chữ & tràn
assert.match(html,/font-size: 11\.5px; font-weight: 700; letter-spacing: \.02em; text-transform: uppercase;/);assert.match(html,/td \{ height: 46px; font-size: 13px;/);
assert.match(html,/\.detail-row \{ display: grid; grid-template-columns: minmax\(0, 42%\) minmax\(0, 1fr\);/);
assert.match(html,/\.m-main b \{ font-size: 14px; font-weight: 600; line-height: 1\.3; white-space: normal; display: -webkit-box; -webkit-line-clamp: 2;/);
assert.match(html,/\.footer-summary\.lots \{ flex: 1 1 0; min-width: 0; flex-wrap: wrap;/);
console.log('PASS V5.9.11: bố cục chống tràn – ngăn trượt chi tiết cho bảng rộng, gộp cột phụ, tiêu đề 11.5px, chi tiết/thẻ mobile không tràn.');
