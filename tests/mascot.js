/* Kiểm thử v98: linh vật Mèo Xu. Chạy: python3 -m http.server 8765  rồi  node tests/mascot.js */
const { chromium } = require('playwright');
const BASE = process.env.BASE || 'http://localhost:8765/index.html';
let pass = 0, fail = 0; const fails = [];
function ok(c, n, x) { if (c) pass++; else { fail++; fails.push(n + (x !== undefined ? ' → ' + JSON.stringify(x).slice(0, 400) : '')); } }
(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.addInitScript(() => { if (!sessionStorage.getItem('s')) { sessionStorage.setItem('s', '1'); localStorage.clear(); ['tc_cloud_gate_skip', 'tc_onboarded', 'tc_swipe_hint'].forEach(k => localStorage.setItem(k, '1')); localStorage.setItem('tc_last_backup', String(Date.now())); } });
  await p.goto(BASE); await p.waitForTimeout(1500);
  const r1 = await p.evaluate(() => ({ card: !!document.getElementById('mascotCard'), svg: !!document.querySelector('#mxPic svg'), msg: document.getElementById('mxMsg').textContent, moods: ['happy', 'sleepy', 'worry', 'wow'].every(m => /<svg/.test(Mascot.svg(m, 50))) }));
  ok(r1.card && r1.svg && /Mèo Xu/.test(r1.msg) && r1.moods, '1 thẻ Mèo Xu hiện ở Tổng quan, 4 tâm trạng đều vẽ được', r1);
  const r2 = await p.evaluate(() => { const a = document.getElementById('mxMsg').textContent; document.getElementById('mascotCard').click(); return { a, b: document.getElementById('mxMsg').textContent }; });
  ok(r2.a !== r2.b, '2 bấm vào mèo: đổi câu khác', r2);
  const r3 = await p.evaluate(() => { wallets.push({ id: 9, name: 'Ví', type: 'cash', balance: 0 }); const ds = new Date().toISOString().slice(0, 10); txs.unshift({ id: 99, type: 'thu', amount: 5000000, group: 'Lương', item: 'Lương', walletId: 9, date: ds }, { id: 98, type: 'chi', amount: 100000, group: 'Ăn uống', item: 'Ăn', walletId: 9, date: ds }); renderHome(); return document.getElementById('mxMsg').textContent; });
  ok(/dư|chi|Hôm nay/.test(r3), '3 lời nhắn đổi theo dữ liệu thu chi', r3);
  const r4 = await p.evaluate(() => { const c = document.getElementById('mascotCard').getBoundingClientRect(), n = document.querySelector('.balance-card').getBoundingClientRect(); return c.top >= n.bottom - 1 && c.width > 200; });
  ok(r4, '4 thẻ nằm dưới thẻ tổng số dư, không đè');
  ok(errs.length === 0, '5 không lỗi JS', errs);
  await browser.close();
  console.log('✔ Đạt: ' + pass + '   ✘ Lỗi: ' + fail); fails.forEach(f => console.log('  ✗ ' + f)); process.exit(fail ? 1 : 0);
})();
