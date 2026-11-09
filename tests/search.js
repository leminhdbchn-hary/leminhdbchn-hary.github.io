/* Kiểm thử v81: tìm kiếm giao dịch (thanh tìm ở Tổng quan, gợi ý hạng mục, tổng hợp từ trước đến nay). Chạy: python3 -m http.server 8765  rồi  node tests/search.js */
const { chromium } = require('playwright');
const BASE = process.env.BASE || 'http://localhost:8765/index.html';
let pass = 0, fail = 0; const fails = [];
function ok(c, n, x) { if (c) pass++; else { fail++; fails.push(n + (x !== undefined ? ' → ' + JSON.stringify(x).slice(0, 500) : '')); } }
const M = (mo, d) => { const t = new Date(); t.setDate(d || 5); t.setMonth(t.getMonth() + mo); return t.toISOString().slice(0, 10); };
(async () => {
  const browser = await chromium.launch(); const p = await (await browser.newContext({ viewport: { width: 390, height: 844 } })).newPage(); const errs = [];
  p.on('pageerror', e => errs.push(e.message)); p.on('dialog', d => d.accept());
  const txs = []; let id = 1;
  for (let i = 0; i < 8; i++) txs.push({ id: id++, type: 'chi', amount: 3000000, group: 'Nhà cửa', item: 'Giúp việc', walletId: 1, note: 'lương giúp việc', date: M(-i), time: '09:00' });
  txs.push({ id: id++, type: 'chi', amount: 500000, group: 'Nhà cửa', item: 'Giúp việc', walletId: 1, note: 'thưởng tết', date: M(-2, 20), time: '09:00' });
  txs.push({ id: id++, type: 'chi', amount: 100000, group: 'Ăn uống', item: 'Ăn trưa', walletId: 1, note: '', date: M(0), time: '12:00' });
  await p.addInitScript(s => { if (!sessionStorage.getItem('seeded')) { sessionStorage.setItem('seeded', '1'); localStorage.clear(); localStorage.setItem('tc_cloud_gate_skip', '1');
    localStorage.setItem('tc_wallets', JSON.stringify([{ id: 1, name: 'Tiền mặt', type: 'cash', balance: 0 }])); localStorage.setItem('tc_txs', JSON.stringify(s));
    localStorage.setItem('tc_custom_cats', JSON.stringify({ chi: { groups: [], add: { 'Nhà cửa': [['Giúp việc', '🧹']] }, hidden: [] } })); } }, txs);
  await p.goto(BASE); await p.waitForTimeout(1200);
  ok(await p.isVisible('#homeSearch'), 'có thanh tìm kiếm ở Tổng quan');
  await p.click('#homeSearch'); await p.waitForTimeout(400);
  ok(await p.evaluate(() => currentScreen() === 'history' && document.activeElement && document.activeElement.id === 'hfQ'), 'bấm thanh tìm → mở Lịch sử, con trỏ ở ô tìm');
  ok(await p.evaluate(() => [...document.querySelectorAll('#hfQList option')].some(o => o.value === 'Giúp việc')), 'gợi ý có tên hạng mục tự tạo "Giúp việc"');
  await p.fill('#hfQ', 'giup viec'); await p.waitForTimeout(300);
  const r = await p.evaluate(() => ({ n: histRes.length, items: [...new Set(histRes.map(t => t.item))], sum: document.getElementById('histQSum').innerText, months: document.querySelectorAll('#histQSum .hq-m').length }));
  ok(r.n === 9 && r.items.join() === 'Giúp việc', 'gõ không dấu "giup viec" → đủ 9 khoản giúp việc mọi tháng', r);
  ok(/Đã chi\s*24\.500\.000/.test(r.sum) && /9 lần/.test(r.sum) && r.months === 8, 'tổng hợp: tổng đã chi, số lần, theo từng tháng', r);
  ok(await p.evaluate(() => { histF.month = todayStr().slice(0, 7); renderHistory(true); const n = histRes.length; openHistSearch('Giúp việc'); return n === 1 && histRes.length === 9 && histF.month === ''; }), 'mở từ hạng mục: bỏ lọc tháng, hiện từ trước đến nay');
  ok(await p.evaluate(() => { showScreen('report'); setPeriod('month', document.createElement('button')); if (repDetailType !== 'chi') toggleRepDetail('chi'); const row = [...document.querySelectorAll('.rep-cat')].find(e => e.innerText.includes('Giúp việc')); row.click();
    document.querySelector('.rep-all').click(); return currentScreen() === 'history' && histF.q === 'Giúp việc' && histRes.length === 9; }), 'Báo cáo › hạng mục › "Xem tất cả" → lịch sử từ trước đến nay');
  ok(await p.evaluate(() => { clearHistF(); return document.getElementById('histQSum').style.display === 'none'; }), 'xoá lọc thì ẩn bảng tổng hợp');
  ok(errs.length === 0, 'không lỗi JS', errs);
  await p.evaluate(() => openHistSearch('giúp việc')); await p.waitForTimeout(300);
  await p.screenshot({ path: process.env.SHOT || '/dev/null' }).catch(() => {});
  console.log((fail ? fails.map(f => '✘ ' + f).join('\n') + '\n' : '') + '✔ Đạt: ' + pass + '   ✘ Lỗi: ' + fail);
  await browser.close(); process.exit(fail ? 1 : 0);
})();
