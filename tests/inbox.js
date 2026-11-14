/* Kiểm thử v96: hộp thư tự động (bank.js + luật Firestore). Chạy: python3 -m http.server 8765  rồi  node tests/inbox.js */
const { chromium } = require('playwright');
const fs = require('fs');
const BASE = process.env.BASE || 'http://localhost:8765/index.html';
let pass = 0, fail = 0; const fails = [];
function ok(c, n, x) { if (c) pass++; else { fail++; fails.push(n + (x !== undefined ? ' → ' + JSON.stringify(x).slice(0, 600) : '')); } }
const W = [{ id: 1, name: 'Tiền mặt', type: 'cash', balance: 1000000 }, { id: 2, name: 'Apple Pay', type: 'bank', balance: 5000000 }];
async function page(browser, seed) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
  const p = await ctx.newPage(); p.errs = []; p.dialogs = []; p.on('pageerror', e => p.errs.push(e.message)); p.on('dialog', d => { p.dialogs.push(d.message().slice(0, 80)); d.accept(); });
  await p.addInitScript(s => { if (!sessionStorage.getItem('seeded')) { sessionStorage.setItem('seeded', '1'); localStorage.clear(); localStorage.setItem('tc_cloud_gate_skip', '1'); localStorage.setItem('tc_onboarded', '1'); localStorage.setItem('tc_swipe_hint', '1'); localStorage.setItem('tc_last_backup', String(Date.now()));
    Object.entries(s).forEach(([k, v]) => localStorage.setItem(k, typeof v === 'string' ? v : JSON.stringify(v))); } }, seed);
  await p.goto(BASE); await p.waitForTimeout(1300);
  await p.evaluate(() => { /* Cloud giả */
    window.__db = { owners: {}, items: [], deleted: [], fail: false };
    window.Cloud = { isLoggedIn: () => true, config: { projectId: 'proj-x', apiKey: 'KEY123' },
      inboxGetSecret: async () => Object.keys(window.__db.owners)[0] || '',
      inboxClaim: async s => { if (window.__db.failClaim) throw new Error('permission-denied'); window.__db.owners[s] = 1; },
      inboxRelease: async s => { delete window.__db.owners[s]; },
      inboxPull: async () => { if (window.__db.fail) throw new Error('offline'); return window.__db.items.slice(); },
      inboxDelete: async (s, ids) => { window.__db.deleted.push(...ids); window.__db.items = window.__db.items.filter(i => !ids.includes(i.id)); } };
  });
  p.ctx = ctx; return p;
}
(async () => {
  const browser = await chromium.launch();
  let p = await page(browser, { tc_wallets: W, tc_txs: [] });

  /* 1. bật hộp thư */
  await p.evaluate(() => bankInboxEnable()); await p.waitForTimeout(300);
  const r1 = await p.evaluate(() => { const s = localStorage.getItem('tc_inbox_secret'); return { s, fmt: /^[a-z0-9]{32}$/.test(s || ''), reg: Object.keys(window.__db.owners)[0] === s, url: document.getElementById('bkUrl') && document.getElementById('bkUrl').innerText }; });
  ok(r1.fmt && r1.reg && r1.url === 'https://firestore.googleapis.com/v1/projects/proj-x/databases/(default)/documents/inbox/' + r1.s + '/items?key=KEY123', '1 bật hộp thư: mã 32 ký tự, đã đăng ký, hiện đúng địa chỉ', r1);
  const r1b = await p.evaluate(() => JSON.stringify(buildCloudPayload ? buildCloudPayload() : {}).indexOf(localStorage.getItem('tc_inbox_secret')) < 0);
  ok(r1b, '1b mã bí mật không nằm trong dữ liệu sao lưu/đồng bộ');

  /* 2. Apple Pay: nhiều kiểu số tiền, quen/lạ */
  const feed = items => p.evaluate(async it => { window.__db.items = it; const r = await bankInboxPull(true); return { n: r && r.n, pend: bankDB.pend.map(x => ({ a: x.amount, n: x.name, b: x.bank })), txs: txs.length, left: window.__db.items.length }; }, items);
  const r2 = await feed([
    { id: 'a', t: 'APPLEPAY|262000|Co.opmart|Visa 5678' },
    { id: 'b', t: 'APPLEPAY|₫128.000|Phuc Long|Visa 5678' },
    { id: 'c', t: 'APPLEPAY|1,250,000.00|Tiki|Visa 5678' },
    { id: 'd', t: 'APPLEPAY|12.50|Netflix|Visa 5678|USD' }]);
  const amts = r2.pend.map(x => x.a).sort((x, y) => x - y);
  ok(JSON.stringify(amts) === '[128000,262000,1250000]' && r2.left === 0 && r2.pend.every(x => x.b === 'Apple Pay'), '2 Apple Pay: 3 kiểu số tiền đọc đúng, ngoại tệ bị bỏ qua, hộp thư được xoá', r2);

  /* 3. lỗi mạng → giữ nguyên tin */
  const r3 = await p.evaluate(async () => { window.__db.items = [{ id: 'z', t: 'APPLEPAY|50000|Highlands|Visa 5678' }]; window.__db.fail = true; await bankInboxPull(true); const kept = window.__db.items.length; window.__db.fail = false; return { kept, stat: JSON.parse(localStorage.getItem('tc_inbox_stat')).err }; });
  ok(r3.kept === 1 && /offline/.test(r3.stat), '3 lỗi mạng: tin vẫn còn trong hộp thư, ghi lỗi', r3);

  /* 4. tin lạ / HTML / quá dài không làm hỏng */
  const r4 = await feed([{ id: 'h', t: '<img src=x onerror=alert(1)>APPLEPAY|1000|<b>x</b>|Visa' }, { id: 'l', t: 'x'.repeat(5000) }, { id: 'e', t: '' }]);
  ok(await p.evaluate(() => !document.querySelector('img[src="x"]')) && p.errs.length === 0, '4 nội dung lạ/HTML/quá dài: không lỗi, không chèn mã', p.errs);

  /* 5. không có ví → giữ tin */
  const p2 = await page(browser, { tc_wallets: [], tc_txs: [] });
  await p2.evaluate(() => bankInboxEnable());
  const r5 = await p2.evaluate(async () => { window.__db.items = [{ id: 'q', t: 'APPLEPAY|50000|Shop|Visa' }]; await bankInboxPull(true); return window.__db.items.length; });
  ok(r5 === 1, '5 chưa có ví: giữ tin trong hộp thư, không xoá', r5);
  await p2.ctx.close();

  /* 6. đổi mã, tắt */
  const r6 = await p.evaluate(async () => { const old = localStorage.getItem('tc_inbox_secret'); await bankInboxRotate(); const s2 = localStorage.getItem('tc_inbox_secret'); const a = { diff: s2 && s2 !== old, oldGone: !(old in window.__db.owners), newReg: s2 in window.__db.owners }; await bankInboxOff(); a.off = !localStorage.getItem('tc_inbox_secret') && Object.keys(window.__db.owners).length === 0; return a; });
  ok(Object.values(r6).every(Boolean), '6 đổi mã (mã cũ bị huỷ) và tắt hộp thư', r6);
  await p.evaluate(() => { window.__db.failClaim = true; });
  await p.evaluate(() => bankInboxEnable());
  ok(p.dialogs.some(d => /luật Firebase/.test(d)) && !(await p.evaluate(() => localStorage.getItem('tc_inbox_secret'))), '6b chưa dán luật: báo lỗi dễ hiểu, không lưu mã');

  /* 7. hướng dẫn + luật */
  await p.evaluate(() => { window.__db.failClaim = false; return bankInboxEnable(); }); await p.waitForTimeout(200);
  const r7 = await p.evaluate(async () => { bankGuide('applepay'); const g = document.querySelector('.bk-steps').innerText; await bankRulesShow(); const pre = document.querySelector('.bk-pre').innerText; return { g: /APPLEPAY\|/.test(g) && /POST/.test(g), pre }; });
  ok(r7.g && /inboxOwners/.test(r7.pre) && /inbox\/\{secret\}\/items/.test(r7.pre) && !/users\/\{userId\}/.test(r7.pre), '7 hướng dẫn Apple Pay đủ bước; màn "Luật Firebase" hiện đúng khối luật mới', r7.pre.slice(0, 80));
  const rules = fs.readFileSync('firestore.rules', 'utf8');
  ok(rules.includes('// v96') && rules.includes('// Mọi thứ khác') && rules.indexOf('// v96') < rules.indexOf('// Mọi thứ khác') && /allow create:[\s\S]*hasOnly\(\['t','s'\]\)/.test(rules) && !/inbox\/\{secret\}\/items\/\{itemId\} \{[^}]*allow read, write/.test(rules), '7b firestore.rules: chỉ cho ghi, đọc/xoá chỉ chủ');

  ok(p.errs.length === 0, '8 không có lỗi JS', p.errs);
  await browser.close();
  console.log(`\nKết quả: ${pass} đạt, ${fail} lỗi`); fails.forEach(f => console.log('  ✗ ' + f)); process.exit(fail ? 1 : 0);
})();
