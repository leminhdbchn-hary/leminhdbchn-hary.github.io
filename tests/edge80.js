/* Kiểm thử trường hợp biên v80: lãi tiết kiệm hàng tháng/đáo hạn, sửa lãi vay. Chạy: python3 -m http.server 8765  rồi  node tests/edge80.js */
const { chromium } = require('playwright');
const BASE = process.env.BASE || 'http://localhost:8765/index.html';
let pass = 0, fail = 0; const fails = [];
function ok(c, n, x) { if (c) pass++; else { fail++; fails.push(n + (x !== undefined ? ' → ' + JSON.stringify(x).slice(0, 500) : '')); } }
const D = (mo, d) => { const t = new Date(); t.setMonth(t.getMonth() + mo); if (d !== undefined) t.setDate(t.getDate() + d); return t.toISOString().slice(0, 10); };
async function page(browser, seed) {
  const p = await (await browser.newContext({ viewport: { width: 390, height: 844 } })).newPage(); p.errs = [];
  p.on('pageerror', e => p.errs.push(e.message)); p.on('dialog', d => { p.lastDialog = d.message(); d.accept(); });
  await p.addInitScript(s => { if (!sessionStorage.getItem('seeded')) { sessionStorage.setItem('seeded', '1'); localStorage.clear(); localStorage.setItem('tc_cloud_gate_skip', '1');
    Object.entries(s).forEach(([k, v]) => localStorage.setItem(k, JSON.stringify(v))); } }, seed);
  await p.goto(BASE); await p.waitForTimeout(1300); return p;
}
const bank = { id: 1, name: 'VCB', type: 'bank', balance: 1000000 };
const lai = () => txs.filter(t => t.item === 'Lãi tiết kiệm');
(async () => {
  const browser = await chromium.launch(); let p, r;

  /* S1 hàng tháng, chưa chọn tài khoản nhận lãi → cộng vào sổ (không mất tiền) */
  p = await page(browser, { tc_wallets: [bank, { id: 2, name: 'S1', type: 'saving', balance: 10000000, rate: 6, termMonths: 6, depositDate: D(-2, -1), maturityDate: D(4, -1), payTiming: 'monthly', maturityAction: 'renew_all', lastInterestDate: D(-2, -1) }] });
  r = await p.evaluate(() => ({ so: wallets[1].balance, vcb: wallets[0].balance, n: txs.filter(t => t.item === 'Lãi tiết kiệm' && String(t.walletId) === '2').length }));
  ok(r.n === 2 && r.so > 10000000 && r.vcb === 1000000, 'S1 chưa chọn tài khoản nhận lãi: lãi cộng vào sổ', r); await p.close();

  /* S2 ngày gửi 31: kỳ nhận lãi tháng thiếu ngày lấy ngày cuối tháng */
  p = await page(browser, { tc_wallets: [bank] });
  r = await p.evaluate(() => { const w = { depositDate: '2026-01-31', termMonths: 6 }; return [1, 2, 3].map(k => addMonths(w.depositDate, k)); });
  ok(r.join() === '2026-02-28,2026-03-31,2026-04-30', 'S2 gửi ngày 31: nhận lãi 28/2, 31/3, 30/4', r); await p.close();

  /* S3 hàng tháng + tái tục cả gốc lãi + có tài khoản nhận lãi: đáo hạn rồi kỳ mới vẫn trả hàng tháng về tài khoản */
  p = await page(browser, { tc_wallets: [bank, { id: 2, name: 'S3', type: 'saving', balance: 10000000, rate: 6, termMonths: 1, depositDate: D(-2, -1), maturityDate: D(-1, -1), payTiming: 'monthly', maturityAction: 'renew_all', payoutWalletId: '1', lastInterestDate: D(-2, -1) }] });
  r = await p.evaluate(() => ({ so: wallets[1].balance, n: txs.filter(t => t.item === 'Lãi tiết kiệm').length, toBank: txs.filter(t => t.item === 'Lãi tiết kiệm').every(t => String(t.walletId) === '1'), next: wallets[1].maturityDate > todayStr(), last: wallets[1].lastInterestDate, dep: wallets[1].depositDate }));
  ok(r.so === 10000000 && r.n === 2 && r.toBank && r.next && r.last === r.dep, 'S3 tái tục: lãi các kỳ đều về tài khoản, sổ giữ nguyên gốc', r); await p.close();

  /* S4 lâu không mở app (quá nhiều kỳ): tổng lãi đúng, không trùng */
  p = await page(browser, { tc_wallets: [bank, { id: 2, name: 'S4', type: 'saving', balance: 12000000, rate: 6, termMonths: 3, depositDate: D(-7, -1), maturityDate: D(-4, -1), payTiming: 'monthly', maturityAction: 'renew_principal', payoutWalletId: '1', dayBasis: 365, lastInterestDate: D(-7, -1) }] });
  r = await p.evaluate(() => { const w = wallets[1]; const tot = txs.filter(t => t.item === 'Lãi tiết kiệm').reduce((s, t) => s + t.amount, 0);
    const days = daysBetween(txs.filter(t => t.item === 'Lãi tiết kiệm').map(t => t.date).sort()[0] ? '' + '' : '', ''); return { tot, vcb: wallets[0].balance, so: w.balance, dep: w.depositDate, exp7m: Math.round(12000000 * 0.06 * daysBetween(addMonths(todayStr(), -7), todayStr()) / 365) }; });
  ok(r.so === 12000000 && Math.abs(r.tot - r.exp7m) < r.exp7m * 0.06 && r.vcb === 1000000 + r.tot, 'S4 7 tháng không mở app: tổng lãi ≈ 7 tháng, về tài khoản', r); await p.close();

  /* S5 đổi sổ từ Cuối kỳ sang Hàng tháng: không trả bù các tháng đã qua */
  p = await page(browser, { tc_wallets: [bank, { id: 2, name: 'S5', type: 'saving', balance: 10000000, rate: 6, termMonths: 6, depositDate: D(-3, -1), maturityDate: D(3, -1), payTiming: 'end', maturityAction: 'no_renew', payoutWalletId: '1' }] });
  r = await p.evaluate(() => { openWalletEdit(2); document.getElementById('wePay').value = 'monthly'; saveWalletEdit(); checkMonthlyInterestAccrual(); return { n: txs.length, last: wallets[1].lastInterestDate, want: savLastPaidAnniv(wallets[1]) }; });
  ok(r.n === 0 && r.last === r.want, 'S5 đổi sang trả hàng tháng: không trả bù tháng đã qua', r); await p.close();

  /* S6 tất toán khi chưa chọn tài khoản → hỏi chọn, không mất tiền */
  p = await page(browser, { tc_wallets: [bank, { id: 2, name: 'S6', type: 'saving', balance: 5000000, rate: 6, termMonths: 1, depositDate: D(-1, -2), maturityDate: D(0, -2), payTiming: 'end', maturityAction: 'no_renew' }] });
  r = await p.evaluate(() => ({ asked: document.getElementById('appModal').classList.contains('show'), so: wallets[1].balance, matured: !!wallets[1].matured, n: txs.length }));
  ok(r.asked && r.so === 5000000 && !r.matured && r.n === 0, 'S6 chưa có tài khoản nhận: hỏi chọn, chưa đụng tiền', r); await p.close();

  /* L: sửa lãi vay */
  const loan = { v: 2, id: 9, type: 'consumer', name: 'Vay nhà', principal: 120000000, paidBefore: 0, balance: 120000000, startDate: D(-2), termMonths: 24, rate: 10, interestDay: new Date().getDate(), iPaid: 0, status: 'active', history: [] };
  p = await page(browser, { tc_wallets: [bank], tc_loans: [loan], tc_txs: [{ id: 77, type: 'chi', amount: 300000, group: 'Ngân hàng', item: 'Trả lãi vay', walletId: 1, date: D(0), loanId: 9, note: 'bản cũ' }] });
  r = await p.evaluate(() => {
    const o = {}; const l = loans[0];
    /* L1 giao dịch lãi kiểu cũ không gắn lịch sử: không lỗi, báo vào mục Vay */
    openEditTx(77); o.old = currentScreen() === 'loans';
    payLoanCore(l, 2000000, 800000, '1', todayStr()); saveAll(); const h = l.history[0]; const ip = l.iPaid, cnt0 = h.iCount;
    /* L2 lãi về 0 (còn gốc): số kỳ lãi đã trả lùi lại */
    openEditTx(h.txI); document.getElementById('ltAmt').value = '0'; saveLoanTxEdit(h.txI); o.zero = l.history[0].interest === 0 && !h.txI && l.iPaid === ip - cnt0;
    /* L3 gốc lớn hơn dư nợ: từ chối */
    const tp = h.txP; openEditTx(tp); document.getElementById('ltAmt').value = '999.000.000'; saveLoanTxEdit(tp); o.big = l.history[0].principal === 2000000; closeAppModal();
    /* L4 đổi ngày: cả giao dịch gốc theo */
    openEditTx(tp); document.getElementById('ltDate').value = addDays(todayStr(), -1); saveLoanTxEdit(tp); o.date = txs.find(t => t.id === h.txP).date === addDays(todayStr(), -1) && l.history[0].date === addDays(todayStr(), -1);
    /* L5 xoá giao dịch lãi không tính chi phí → hoàn ví, rồi hoàn tác */
    payLoanCore(l, 0, 500000, '1', todayStr()); const h2 = l.history[0]; txs.find(t => t.id === h2.txI).noCF = true; saveAll();
    const b0 = wallets[0].balance; const tid = h2.txI, hid = h2.id; deleteTx(tid); o.del = wallets[0].balance === b0 + 500000 && !l.history.includes(h2) && !loans[0].history.some(x => x.id === hid);
    document.getElementById('undoBtn').click(); o.undo = wallets[0].balance === b0 && loans[0].history.some(x => x.id === hid) && txs.find(t => t.id === tid).noCF === true;
    /* L6 báo cáo: nút bỏ khỏi thu chi trên khoản lãi → lịch sử vay có nhãn */
    payLoanCore(loans[0], 0, 700000, '1', todayStr()); saveAll(); const h3 = loans[0].history[0]; repExclude([h3.txI], true); showScreen('loans');
    o.tag = document.getElementById('loanList').innerHTML.includes('lãi không tính chi phí');
    /* L7 người khác trả: không có giao dịch ví, không mở ô sửa */
    payLoanCore(loans[0], 0, 100000, '__ext', todayStr()); o.ext = loans[0].history[0].external && !loans[0].history[0].txI;
    return o; });
  ok(Object.values(r).every(Boolean), 'L1–L7 sửa lãi vay: bản cũ, lãi 0, gốc quá dư nợ, đổi ngày, xoá + hoàn tác, báo cáo, người khác trả', r);
  ok(p.errs.length === 0, 'không lỗi JS', p.errs); await p.close();

  console.log((fail ? fails.map(f => '✘ ' + f).join('\n') + '\n' : '') + '✔ Đạt: ' + pass + '   ✘ Lỗi: ' + fail);
  await browser.close(); process.exit(fail ? 1 : 0);
})();
