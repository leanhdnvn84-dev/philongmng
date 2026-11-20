// Tạo hai bản từ cùng một mã nguồn:
//  - dist/ql-hd-thue-v5.html : mở trực tiếp, dữ liệu nhúng sẵn
//  - apps-script/            : project Apps Script (Code.gs đọc Google Sheet, index.html giao diện, appsscript.json)
const fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..');
const read = p => fs.readFileSync(path.join(root, p), 'utf8');
const write = (p, s) => { fs.mkdirSync(path.dirname(path.join(root, p)), { recursive: true }); fs.writeFileSync(path.join(root, p), s, 'utf8'); };
const template = read('src/index.template.html');
const libs = { '/*__ENGINE__*/': read('src/engine.js'), '/*__RECON__*/': read('src/reconcile.js'), '/*__APP__*/': read('src/app.js') };
function assemble(boot) {
  let html = template;
  for (const [k, v] of Object.entries({ ...libs, '/*__BOOT__*/': boot })) {
    if (!html.includes(k)) throw new Error('Thiếu placeholder ' + k);
    html = html.replace(k, () => v);
  }
  return html;
}
// 1) Bản mở trực tiếp: dữ liệu nhúng sẵn.
const legacy = read('data/legacy.json').replace(/<\/script/gi, '<\\/script');
write('dist/ql-hd-thue-v5.html', assemble(`window.__LEGACY__ = ${legacy}; startApp();`));
// 2) Bản Apps Script: dữ liệu lấy từ máy chủ qua google.script.run.
const boot = `(function () {
  var box = document.getElementById('app');
  function fail(msg) { box.innerHTML = '<main><h1>Không đọc được dữ liệu</h1><p class="lede">' + String(msg).replace(/[<>&]/g, '') + '</p></main>'; }
  if (!window.google || !google.script) { fail('Trang này cần chạy trong Apps Script (Web App).'); return; }
  google.script.run
    .withSuccessHandler(function (data) { window.__LEGACY__ = data; startApp(); })
    .withFailureHandler(function (e) { fail(e && e.message ? e.message : e); })
    .getLegacyData();
})();`;
write('apps-script/index.html', assemble(boot));
write('apps-script/appsscript.json', JSON.stringify({
  timeZone: 'Asia/Ho_Chi_Minh', dependencies: {}, exceptionLogging: 'STACKDRIVER', runtimeVersion: 'V8',
  oauthScopes: ['https://www.googleapis.com/auth/spreadsheets.readonly', 'https://www.googleapis.com/auth/script.container.ui'],
  webapp: { executeAs: 'USER_DEPLOYING', access: 'MYSELF' }
}, null, 2) + '\n');
console.log('built dist/ql-hd-thue-v5.html and apps-script/ (index.html, appsscript.json)');
