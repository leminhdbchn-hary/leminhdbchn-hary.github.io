/* Kiểm thử v99: linh vật Mèo Xu (ảnh trang trí). Chạy: python3 -m http.server 8765  rồi  node tests/mascot.js */
const { chromium } = require('playwright');
const BASE = process.env.BASE || 'http://localhost:8765/index.html';
let pass = 0, fail = 0; const fails = [];
function ok(c, n, x) { if (c) pass++; else { fail++; fails.push(n + (x !== undefined ? ' → ' + JSON.stringify(x).slice(0, 400) : '')); } }
(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
  const p = await ctx.newPage(); const errs = [], bad = []; p.on('pageerror', e => errs.push(e.message)); p.on('response', r => { if (r.status() >= 400) bad.push(r.url()); });
  await p.addInitScript(() => { if (!sessionStorage.getItem('s')) { sessionStorage.setItem('s', '1'); localStorage.clear(); ['tc_cloud_gate_skip', 'tc_onboarded', 'tc_swipe_hint'].forEach(k => localStorage.setItem(k, '1')); localStorage.setItem('tc_last_backup', String(Date.now())); } });
  await p.goto(BASE); await p.waitForTimeout(2500);
  const r1 = await p.evaluate(() => { const i = document.querySelector('.home-head .mx-head'); const h = document.querySelector('.home-head'); if (!i) return null; const a = i.getBoundingClientRect(), b = h.getBoundingClientRect(); return { loaded: i.complete && i.naturalWidth > 0, inside: a.top >= b.top - 1 && a.right <= b.right + 1 && a.bottom <= b.bottom, card: !!document.getElementById('mascotCard'), pe: getComputedStyle(i).pointerEvents }; });
  ok(r1 && r1.loaded && r1.inside && !r1.card && r1.pe === 'none', '1 mèo nằm gọn trong thẻ chào, không có thẻ chữ, không chặn bấm', r1);
  await p.evaluate(() => showScreen('accounts')); await p.waitForTimeout(600);
  const r2 = await p.evaluate(() => { const i = document.querySelector('#accList .mx-empty'); return i && /bag\.webp/.test(i.src) && i.complete && i.naturalWidth > 0; });
  ok(r2, '2 màn Ví trống dùng mèo với túi tiền');
  ok(bad.filter(u => /mascot|icon/.test(u)).length === 0, '3 ảnh mèo và icon tải được', bad);
  ok(errs.length === 0, '4 không lỗi JS', errs);
  await browser.close();
  console.log('✔ Đạt: ' + pass + '   ✘ Lỗi: ' + fail); fails.forEach(f => console.log('  ✗ ' + f)); process.exit(fail ? 1 : 0);
})();
