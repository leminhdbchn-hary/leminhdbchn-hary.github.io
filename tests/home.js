/* Kiểm thử v82: Tổng quan – thẻ Cho vay & vay nợ, bỏ Insight, bấm ô Thu/Chi. Chạy: python3 -m http.server 8765  rồi  node tests/home.js */
const { chromium } = require('playwright');
const BASE = process.env.BASE || 'http://localhost:8765/index.html';
let pass = 0, fail = 0; const fails = [];
function ok(c, n, x) { if (c) pass++; else { fail++; fails.push(n + (x !== undefined ? ' → ' + JSON.stringify(x).slice(0, 500) : '')); } }
const D = (d) => { const t = new Date(); t.setDate(t.getDate() + d); return t.toISOString().slice(0, 10); };
async function page(browser, seed) {
  const p = await (await browser.newContext({ viewport: { width: 390, height: 844 } })).newPage(); p.errs = [];
  p.on('pageerror', e => p.errs.push(e.message)); p.on('dialog', d => d.accept());
  await p.addInitScript(s => { if (!sessionStorage.getItem('seeded')) { sessionStorage.setItem('seeded', '1'); localStorage.clear(); localStorage.setItem('tc_cloud_gate_skip', '1');
    Object.entries(s).forEach(([k, v]) => localStorage.setItem(k, JSON.stringify(v))); } }, seed);
  await p.goto(BASE); await p.waitForTimeout(1200); return p;
}
(async () => {
  const browser = await chromium.launch();
  const w = [{ id: 1, name: 'VCB', type: 'bank', balance: 20000000 }];
  let p = await page(browser, { tc_wallets: w });
  ok(await p.evaluate(() => !document.getElementById('insightList') && !/Insight/.test(document.getElementById('screen-home').innerText)), 'đã bỏ phần Insight');
  ok(await p.evaluate(() => document.getElementById('debtCard').style.display === 'none'), 'chưa có nợ thì ẩn thẻ');
  await p.close();
  p = await page(browser, { tc_wallets: w,
    tc_debts: [{ id: 1, dir: 'out', person: 'Nam', amount: 2000000, date: D(-10), dueDate: D(-1), status: 'pending' }, { id: 2, dir: 'out', person: 'Lan', amount: 1000000, date: D(-3), dueDate: D(5), status: 'pending' },
      { id: 3, dir: 'in', person: 'Anh Tuấn', amount: 500000, date: D(-3), dueDate: D(3), status: 'pending' }],
    tc_txs: [{ id: 5, type: 'chi', amount: 600000, group: 'Khác', item: 'Tạm ứng ăn chung', walletId: 1, date: D(0), note: 'lẩu' }, { id: 6, type: 'thu', amount: 15000000, group: 'Lương', item: 'Lương', walletId: 1, date: D(0) }],
    tc_loans: [{ v: 2, id: 9, type: 'consumer', name: 'Vay xe', principal: 120000000, paidBefore: 0, balance: 120000000, startDate: D(-40), termMonths: 24, rate: 10, interestDay: new Date(D(4) + 'T00:00:00').getDate(), iPaid: 1, status: 'active', history: [] }] });
  const r = await p.evaluate(() => { const c = document.getElementById('debtCard'); return { shown: c.style.display, rows: c.querySelectorAll('.dc-row').length, txt: c.innerText, od: c.querySelector('.dc-row.od') && c.querySelector('.dc-row.od').innerText }; });
  ok(r.shown === 'block' && r.rows === 4, 'thẻ có 4 dòng: cho vay, tạm ứng, vay ngân hàng, nợ người khác', r);
  ok(/3\.000\.000/.test(r.txt) && /Nam quá hạn 1 ngày/.test(r.txt) && /600\.000/.test(r.txt) && /120\.000\.000/.test(r.txt) && /Kỳ tới|Quá hạn, cần trả/.test(r.txt) && /Anh Tuấn/.test(r.txt), 'số tiền, người quá hạn, kỳ trả vay tới', r.txt);
  ok(/Ròng\s*−?\+?/.test(r.txt) && /−116\.900\.000/.test(r.txt), 'công nợ ròng = 3tr + 600k − 120tr − 500k', r.txt);
  ok(await p.evaluate(() => { document.querySelectorAll('#debtCard .dc-row')[0].click(); return currentScreen() === 'debts'; }), 'bấm dòng Cho vay → màn Cho vay');
  ok(await p.evaluate(() => { showScreen('home'); document.querySelectorAll('#debtCard .dc-row')[2].click(); return currentScreen() === 'loans'; }), 'bấm dòng Vay ngân hàng → màn Vay ngân hàng');
  ok(await p.evaluate(() => { showScreen('home'); document.querySelectorAll('#debtCard .dc-row')[1].click(); const okm = document.getElementById('appModal').classList.contains('show'); closeAppModal(); return okm; }), 'bấm dòng Tạm ứng → danh sách chờ thu');
  ok(await p.evaluate(() => { showScreen('home'); document.querySelector('.month-box.mb-tap').click(); return currentScreen() === 'report' && reportPeriod === 'month' && repDetailType === 'thu' && /Lương/.test(document.getElementById('repDetail').innerText); }), 'bấm ô Thu tháng này → Báo cáo tháng, mở chi tiết thu');
  ok(await p.evaluate(() => { showScreen('home'); markDebtPaid && (debtDir = 'out', renderDebts()); const sel = document.getElementById('payWallet_1'); if (sel) sel.value = '1'; markDebtPaid(1); renderDebts(); debtDir = 'out'; markDebtPaid(2); return !/Đang cho vay/.test(document.getElementById('debtCard').innerText); }), 'trả hết cho vay → dòng Cho vay tự ẩn');
  ok(p.errs.length === 0, 'không lỗi JS', p.errs);
  await p.evaluate(() => { showScreen('home'); }); await p.waitForTimeout(500);
  await p.evaluate(() => document.getElementById('debtCard').scrollIntoView()); await p.waitForTimeout(200);
  if (process.env.SHOT) await p.screenshot({ path: process.env.SHOT });
  console.log((fail ? fails.map(f => '✘ ' + f).join('\n') + '\n' : '') + '✔ Đạt: ' + pass + '   ✘ Lỗi: ' + fail);
  await browser.close(); process.exit(fail ? 1 : 0);
})();
