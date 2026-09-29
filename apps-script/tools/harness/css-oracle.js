// Tìm khai báo CSS "chết do bị đè" và "!important thừa" bằng cách dựng lại mọi trạng thái giao diện đã chụp
// (run.js với STYLES=1) rồi thử trên CSSOM: bỏ khai báo / bỏ !important → so giá trị style đã tính (computed)
// của mọi phần tử khớp luật. Chỉ nhận thay đổi KHÔNG làm đổi giá trị nào ở BẤT KỲ trạng thái nào,
// sau đó kiểm lại khi áp dụng tất cả cùng lúc (tránh 2 khai báo giống nhau cùng bị coi là thừa).
//   node tools/harness/css-oracle.js <index.html> <thư_mục_run_STYLES> [--apply]
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const postcss = require(path.join(__dirname, '..', 'node_modules', 'postcss'));
const { chromium } = require(path.join(__dirname, '..', 'node_modules', 'playwright'));

const [htmlPath, runDir] = process.argv.slice(2).map(p => path.resolve(p));
const APPLY = process.argv.includes('--apply');
const LIMIT = Number(process.env.SNAP_LIMIT || 0);
let html = fs.readFileSync(htmlPath, 'utf8');
// Che nội dung <script> (có chuỗi "<style>" trong JS) trước khi tìm khối <style> thật.
const scripts = [];
html = html.replace(/(<script\b[^>]*>)([\s\S]*?)(<\/script>)/g, (m, o, body, c) => { scripts.push(body); return o + '\u0000S' + (scripts.length - 1) + '\u0000' + c; });
const unmask = t => t.replace(/\u0000S(\d+)\u0000/g, (m, k) => scripts[+k]);

// ---- 1) Luật + khai báo ứng viên trong các khối <style> tĩnh ----
const DYN_PSEUDO = /:(hover|focus|focus-within|focus-visible|active|visited|target|checked|indeterminate|placeholder-shown|autofill|invalid|valid|default|user-invalid|open|modal|fullscreen|popover-open)\b|::|:-webkit-|:-moz-|placeholder|selection/i;
const SKIP_PROP = /^(--|transition|animation|will-change|content$|counter-|outline)/i;
const blocks = [];
html.replace(/(<style[^>]*>)([\s\S]*?)(<\/style>)/g, (m, open, css) => { blocks.push(css); return m; });
const rules = []; // {b, node, sel}
const cands = []; // {i, r, prop, imp, node}
const roots = blocks.map((css, b) => {
  const root = postcss.parse(css);
  root.walkRules(rule => {
    for (let p = rule.parent; p && p.type !== 'root'; p = p.parent) if (p.type === 'atrule' && /keyframes|font-face|page/i.test(p.name)) return;
    let ctxBad = false;
    for (let p = rule.parent; p && p.type !== 'root'; p = p.parent) if (p.type === 'atrule' && (/print|prefers-color-scheme|hover|pointer/i.test(p.params) || !/^(media|supports)$/i.test(p.name))) ctxBad = true;
    const r = rules.length; rules.push({ b, node: rule });
    const seen = {};
    rule.each(d => { if (d.type === 'decl') seen[d.prop.toLowerCase()] = (seen[d.prop.toLowerCase()] || 0) + 1; });
    if (ctxBad || DYN_PSEUDO.test(rule.selector) || /dark|theme/i.test(rule.selector)) { rule.append({ prop: '--plr', value: String(r) }); return; }
    rule.each(d => {
      if (d.type !== 'decl' || SKIP_PROP.test(d.prop) || seen[d.prop.toLowerCase()] > 1 || /var\(|env\(|attr\(|calc\(.*%/i.test(d.value)) return;
      // Khai báo khác trong cùng luật (để phát hiện chồng dạng viết tắt/đầy đủ, vd. font:inherit + font-weight:400).
      const sib = []; rule.each(o => { if (o !== d && o.type === 'decl') sib.push(o.prop + ':' + o.value); });
      cands.push({ i: cands.length, r, prop: d.prop.toLowerCase(), imp: !!d.important, node: d, self: d.prop + ':' + d.value, sib });
    });
    rule.append({ prop: '--plr', value: String(r) });
  });
  return root;
});
const instr = roots.map(r => r.toString());
console.error(`blocks ${blocks.length}, rules ${rules.length}, candidates ${cands.length} (important ${cands.filter(c => c.imp).length})`);

// ---- 2) Trạng thái đã chụp ----
const files = fs.readdirSync(runDir).filter(f => /^(desktop|mobile)-\d+-.*\.html$/.test(f)).sort();
const seenHash = new Set(), snaps = [];
for (const f of files) {
  const body = fs.readFileSync(path.join(runDir, f), 'utf8');
  const rootFile = path.join(runDir, f.replace(/\.html$/, '.root.json.txt'));
  const rootAttrs = fs.existsSync(rootFile) ? JSON.parse(fs.readFileSync(rootFile, 'utf8')) : [];
  const vp = f.startsWith('mobile') ? 'mobile' : 'desktop';
  const h = crypto.createHash('md5').update(vp + JSON.stringify(rootAttrs) + body).digest('hex');
  if (seenHash.has(h)) continue; seenHash.add(h);
  snaps.push({ f, vp, body, rootAttrs });
}
if (LIMIT) snaps.splice(LIMIT);
const dyn = {};
for (const vp of ['desktop', 'mobile']) {
  const p = path.join(runDir, 'styles-' + vp + '.json.txt');
  const list = fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, 'utf8')) : blocks;
  // Khối tĩnh → bản có đánh dấu --plr; khối do JS chèn → giữ nguyên (đúng thứ tự trong trang).
  dyn[vp] = list.map(t => { const k = blocks.indexOf(t); return k >= 0 ? instr[k] : t; });
  const missing = blocks.filter((b, k) => !list.includes(b)).length;
  if (missing) console.error(`${vp}: ${missing} khối tĩnh không thấy trong trang lúc chạy — thêm vào cuối`), blocks.forEach((b, k) => { if (!list.includes(b)) dyn[vp].push(instr[k]); });
}
console.error(`snapshots ${snaps.length} (unique of ${files.length})`);

const esc = s => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;');
function docFor(s) {
  const attrs = s.rootAttrs.map(([k, v]) => ` ${k}="${esc(v)}"`).join('');
  // Tắt transition/animation: nếu không, getComputedStyle ngay sau khi sửa CSSOM vẫn trả giá trị CŨ (đang chuyển tiếp) → tưởng khai báo vô tác dụng.
  const still = '<style>*,*::before,*::after{transition:none!important;animation:none!important}</style>';
  return `<!doctype html><html${attrs}><head><meta charset="utf-8">${dyn[s.vp].map(t => '<style>' + t + '</style>').join('')}${still}</head>${s.body}</html>`;
}

// ---- 3) Hàm chạy trong trang ----
function inPage(arg) {
  const { cands, mode, removed, dropped, seen } = arg; // mode 'test' | 'verify'
  const R = {};
  const walk = list => { for (const cr of list) { if (cr.style && cr.selectorText !== undefined) { const id = cr.style.getPropertyValue('--plr').trim(); if (id) R[id] = cr; } if (cr.cssRules) walk(cr.cssRules); } };
  for (const sh of document.styleSheets) { try { walk(sh.cssRules); } catch (e) {} }
  const matchCache = {};
  const els = r => { if (matchCache[r]) return matchCache[r]; let m = []; try { m = [...document.querySelectorAll(R[r].selectorText)]; } catch (e) { m = null; } return (matchCache[r] = m); };
  const longhands = st => { const o = {}; for (let k = 0; k < st.length; k++) o[st[k]] = st.getPropertyValue(st[k]) + '|' + st.getPropertyPriority(st[k]); return o; };
  const cs = new Map(); const comp = el => { let c = cs.get(el); if (!c) { c = getComputedStyle(el); cs.set(el, c); } return c; };
  const out = { live: [], needRemove: [], needImp: [], diffs: [], keys: [] };
  // Khóa cascade của phần tử = tập luật khớp + style inline. Phần tử có khóa đã thử ở trạng thái trước → bỏ qua.
  const ruleOf = new Map();
  for (const id in R) { let m; try { m = document.querySelectorAll(R[id].selectorText); } catch (e) { continue; } for (const el of m) { let a = ruleOf.get(el); if (!a) ruleOf.set(el, a = []); a.push(id); } }
  // + ngữ cảnh kế thừa từ phần tử cha (màu, font, line-height…, biến CSS): cùng tập luật nhưng cha khác → phản ứng khác khi bỏ khai báo.
  const INH = ['color','font-family','font-size','font-style','font-weight','font-variant','font-stretch','line-height','letter-spacing','word-spacing','text-align','text-indent','text-transform','white-space','visibility','cursor','direction','list-style-type','list-style-position','border-collapse','border-spacing','caption-side','empty-cells','quotes','text-shadow','writing-mode','-webkit-text-fill-color','-webkit-text-stroke-width','tab-size','hyphens','overflow-wrap','word-break','text-rendering','pointer-events','color-scheme','accent-color','caret-color','orphans','widows','font-feature-settings','font-kerning','-webkit-font-smoothing','text-underline-position','paint-order','image-rendering','text-wrap','user-select','-webkit-user-select'];
  const psig = new Map();
  const parentSig = el => { const p = el.parentElement; if (!p) return ''; let v = psig.get(p); if (v !== undefined) return v; const c = getComputedStyle(p); const parts = INH.map(k => c.getPropertyValue(k)); for (let i = c.length - 1; i >= 0; i--) { const k = c[i]; if (k.startsWith('--')) parts.push(k + ':' + c.getPropertyValue(k)); else break; } v = parts.join('\u0001'); psig.set(p, v); return v; };
  const fresh = new Set(), seenSet = new Set(seen || []);
  for (const [el, a] of ruleOf) { const k = a.join(',') + '|' + (el.getAttribute('style') || '') + '|' + parentSig(el); if (!seenSet.has(k)) { seenSet.add(k); fresh.add(el); out.keys.push(k); } }
  // Thuộc tính đầy đủ (longhand) mà 1 khai báo đặt ra — dùng phần tử nháp.
  const lhMemo = {}; const scratch = document.createElement('div');
  const lh = text => { if (lhMemo[text]) return lhMemo[text]; scratch.style.cssText = text; const o = []; for (let k = 0; k < scratch.style.length; k++) o.push(scratch.style[k]); return (lhMemo[text] = o); };
  out.overlap = [];
  if (mode === 'test') {
    for (const c of cands) {
      if (c.sib) { const mine = new Set(lh(c.self)); if (!mine.size || c.sib.some(t => lh(t).some(k => mine.has(k)))) { out.overlap.push(c.i); continue; } }
      const rule = R[c.r]; if (!rule) continue;
      const all = els(c.r); if (!all || !all.length) continue;
      out.live.push(c.i);
      const m = all.filter(el => fresh.has(el)); if (!m.length) continue;
      const st = rule.style, saved = st.cssText, before = longhands(st);
      const snap = props => m.map(el => props.map(p => comp(el).getPropertyValue(p)).join('\u0001'));
      if (c.testRemove) {
        st.removeProperty(c.prop); const after = longhands(st);
        const props = Object.keys(before).filter(k => !(k in after));
        st.cssText = saved; const a = snap(props);
        st.removeProperty(c.prop); const b = snap(props); st.cssText = saved;
        if (a.join('\u0002') !== b.join('\u0002')) out.needRemove.push(c.i);
      }
      if (c.testImp) {
        const props = Object.keys(before).filter(k => before[k].endsWith('|important'));
        const val = st.getPropertyValue(c.prop);
        const a = snap(props);
        st.setProperty(c.prop, val, ''); const b = snap(props); st.cssText = saved;
        if (a.join('\u0002') !== b.join('\u0002')) out.needImp.push(c.i);
      }
    }
  } else {
    // Áp dụng TẤT CẢ cùng lúc; so từng phần tử khớp luật bị đụng, trên các thuộc tính bị đụng.
    const touched = [];
    const byRule = {};
    for (const c of cands) (byRule[c.r] = byRule[c.r] || []).push(c);
    const plan = [];
    for (const r in byRule) {
      const rule = R[r]; if (!rule) continue; const m = els(r); if (!m || !m.length) continue;
      const st = rule.style, before = longhands(st), saved = st.cssText;
      for (const c of byRule[r]) { if (removed.includes(c.i)) st.removeProperty(c.prop); else if (dropped.includes(c.i)) st.setProperty(c.prop, st.getPropertyValue(c.prop), ''); }
      const after = longhands(st); st.cssText = saved;
      const props = Object.keys(before).filter(k => before[k] !== after[k]);
      if (props.length) plan.push({ r, m, props, saved, cands: byRule[r] });
    }
    const snapAll = () => plan.map(p => p.m.map(el => p.props.map(k => getComputedStyle(el).getPropertyValue(k)).join('\u0001')));
    const A = snapAll();
    for (const p of plan) { const st = R[p.r].style; for (const c of p.cands) { if (removed.includes(c.i)) st.removeProperty(c.prop); else if (dropped.includes(c.i)) st.setProperty(c.prop, st.getPropertyValue(c.prop), ''); } }
    const B = snapAll();
    plan.forEach((p, k) => { p.m.forEach((el, j) => { if (A[k][j] !== B[k][j]) { const va = A[k][j].split('\u0001'), vb = B[k][j].split('\u0001'); p.props.forEach((prop, q) => { if (va[q] !== vb[q]) out.diffs.push({ el: j, r: p.r, prop, cands: p.cands.map(c => c.i) }); }); } }); });
    for (const p of plan) R[p.r].style.cssText = p.saved;
  }
  return out;
}

(async () => {
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM || undefined });
  const ctxs = {
    desktop: await browser.newContext({ viewport: { width: 1440, height: 900 } }),
    mobile: await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true }),
  };
  const pages = {};
  for (const vp in ctxs) { pages[vp] = await ctxs[vp].newPage(); await pages[vp].route('**/*', r => r.request().url().startsWith('data:') ? r.continue() : r.abort()); }
  const load = async s => { const p = pages[s.vp]; await p.setContent(docFor(s), { waitUntil: 'domcontentloaded' }); return p; };
  const live = new Set(), needRemove = new Set(), needImp = new Set(); const seen = []; const useful = [];
  const t0 = Date.now();
  for (let k = 0; k < snaps.length; k++) {
    const s = snaps[k], p = await load(s);
    const todo = cands.filter(c => !needRemove.has(c.i) || (c.imp && !needImp.has(c.i))).map(c => ({ i: c.i, r: c.r, prop: c.prop, testRemove: !needRemove.has(c.i), testImp: c.imp && !needImp.has(c.i), self: c.self, sib: c.sib }));
    const o = await p.evaluate(inPage, { cands: todo, mode: 'test', removed: [], dropped: [], seen });
    if (o.keys.length) { seen.push(...o.keys); useful.push(s); }
    o.live.forEach(i => live.add(i)); o.needRemove.forEach(i => needRemove.add(i)); o.needImp.forEach(i => needImp.add(i));
    o.overlap.forEach(i => { needRemove.add(i); needImp.add(i); });
    if (k % 25 === 0) console.error(`[${k + 1}/${snaps.length}] ${Math.round((Date.now() - t0) / 1000)}s useful ${useful.length} keys ${seen.length} live ${live.size} needRemove ${needRemove.size} needImp ${needImp.size}`);
  }
  let removed = cands.filter(c => live.has(c.i) && !needRemove.has(c.i)).map(c => c.i);
  let dropped = cands.filter(c => c.imp && live.has(c.i) && needRemove.has(c.i) && !needImp.has(c.i)).map(c => c.i);
  console.error(`độc lập: bỏ được ${removed.length} khai báo, bỏ !important ${dropped.length}`);
  // Kiểm lại khi áp dụng cùng lúc; khác ở đâu thì trả lại mọi ứng viên của luật chạm (phần tử, thuộc tính) đó.
  for (let round = 0; round < 12; round++) {
    let bad = new Set();
    for (const s of snaps) {
      const p = await load(s);
      const sub = cands.filter(c => removed.includes(c.i) || dropped.includes(c.i)).map(c => ({ i: c.i, r: c.r, prop: c.prop }));
      const o = await p.evaluate(inPage, { cands: sub, mode: 'verify', removed, dropped, seen: [] });
      o.diffs.forEach(d => d.cands.forEach(i => { const c = cands[i]; if (c.prop === d.prop || d.prop.startsWith(c.prop + '-') || c.prop.startsWith(d.prop.split('-')[0])) bad.add(i); }));
    }
    console.error(`vòng kiểm ${round + 1}: trả lại ${bad.size}`);
    if (!bad.size) break;
    removed = removed.filter(i => !bad.has(i)); dropped = dropped.filter(i => !bad.has(i));
  }
  await browser.close();
  const bytes = removed.reduce((n, i) => n + cands[i].node.toString().length + 1, 0);
  const report = { candidates: cands.length, live: live.size, removed: removed.length, dropped: dropped.length, bytes };
  console.log(JSON.stringify(report));
  if (APPLY) {
    const rm = new Set(removed), dp = new Set(dropped);
    cands.forEach(c => { if (rm.has(c.i)) c.node.remove(); else if (dp.has(c.i)) c.node.important = false; });
    roots.forEach(root => { root.walkDecls('--plr', d => d.remove()); root.walkRules(r => { if (!r.nodes.length) r.remove(); }); });
    let k = 0;
    html = html.replace(/(<style[^>]*>)([\s\S]*?)(<\/style>)/g, (m, open, css, close) => open + roots[k++].toString() + close);
    fs.writeFileSync(htmlPath, unmask(html));
    console.error('đã ghi ' + htmlPath);
  }
})();
