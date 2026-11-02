/* Kiểm thử v80: lãi tiết kiệm về đúng tài khoản; sửa tiền lãi vay + không tính vào chi phí.
   Chạy: python3 -m http.server 8765  rồi  node tests/savings-loanint.js */
const { chromium } = require('playwright');
const BASE = process.env.BASE || 'http://localhost:8765/index.html';
let pass = 0, fail = 0; const fails = [];
function ok(c, n, x) { if (c) pass++; else { fail++; fails.push(n + (x !== undefined ? ' → ' + JSON.stringify(x).slice(0, 500) : '')); } }
const D = (mo, d) => { const t = new Date(); t.setMonth(t.getMonth() + mo); if (d !== undefined) t.setDate(t.getDate() + d); return t.toISOString().slice(0, 10); };
async function page(browser, seed) {
  const p = await (await browser.newContext({ viewport: { width: 390, height: 844 } })).newPage(); p.errs = [];
  p.on('pageerror', e => p.errs.push(e.message)); p.on('dialog', d => d.accept());
  await p.addInitScript(s => { if (!sessionStorage.getItem('seeded')) { sessionStorage.setItem('seeded', '1'); localStorage.clear(); localStorage.setItem('tc_cloud_gate_skip', '1');
    Object.entries(s).forEach(([k, v]) => localStorage.setItem(k, JSON.stringify(v))); } }, seed);
  await p.goto(BASE); await p.waitForTimeout(1300); return p;
}
(async () => {
  const browser = await chromium.launch();
  const bank = { id: 1, name: 'VCB', type: 'bank', balance: 1000000 };
  /* 1. Trả lãi hàng tháng, gửi 3 tháng trước, kỳ 6 tháng, dữ liệu mới (đã có lastInterestDate = ngày gửi) → nhận 3 kỳ vào VCB */
  let p = await page(browser, { tc_wallets: [bank, { id: 2, name: 'Sổ A', type: 'saving', balance: 100000000, rate: 6, termMonths: 6, depositDate: D(-3, -1), maturityDate: D(3, -1), payTiming: 'monthly', maturityAction: 'renew_principal', payoutWalletId: '1', dayBasis: 365, lastInterestDate: D(-3, -1) }] });
  let r = await p.evaluate(() => ({ vcb: wallets[0].balance, so: wallets[1].balance, n: txs.filter(t => t.item === 'Lãi tiết kiệm').length, last: wallets[1].lastInterestDate, w: txs.map(t => t.walletId) }));
  ok(r.n === 3 && r.so === 100000000 && r.vcb > 1000000 + 1400000 && r.w.every(x => String(x) === '1'), '1 lãi hàng tháng chuyển vào tài khoản nhận lãi, không cộng vào sổ', r);
  await p.reload(); await p.waitForTimeout(1000);
  ok(await p.evaluate(() => txs.filter(t => t.item === 'Lãi tiết kiệm').length) === 3, '1b mở lại app không trả trùng');
  await p.close();

  /* 2. Dữ liệu bản cũ (chỉ có lastAccrualYm) → không trả bù/trùng, từ kỳ sau mới trả */
  p = await page(browser, { tc_wallets: [bank, { id: 2, name: 'Sổ B', type: 'saving', balance: 50000000, rate: 6, termMonths: 12, depositDate: D(-2, -3), maturityDate: D(10, -3), payTiming: 'monthly', maturityAction: 'renew_all', payoutWalletId: '1', lastAccrualYm: D(0).slice(0, 7) }] });
  r = await p.evaluate(() => ({ n: txs.length, last: wallets[1].lastInterestDate, want: savLastPaidAnniv(wallets[1]) }));
  ok(r.n === 0 && r.last === r.want, '2 dữ liệu cũ: không trả trùng tháng đã cộng', r);
  await p.close();

  /* 3. Đáo hạn sổ trả lãi hàng tháng: chỉ trả lãi tháng cuối (không trả lại cả kỳ) */
  p = await page(browser, { tc_wallets: [bank, { id: 2, name: 'Sổ C', type: 'saving', balance: 10000000, rate: 6, termMonths: 3, depositDate: D(-3, -2), maturityDate: D(0, -2), payTiming: 'monthly', maturityAction: 'no_renew', payoutWalletId: '1', dayBasis: 365, lastInterestDate: D(-1, -2) }] });
  r = await p.evaluate(() => ({ vcb: wallets[0].balance, so: wallets[1].balance, matured: wallets[1].matured, lai: txs.filter(t => t.item === 'Lãi tiết kiệm').map(t => t.amount) }));
  ok(r.matured && r.so === 0 && r.lai.length === 1 && r.lai[0] < 60000 && r.vcb === 1000000 + 10000000 + r.lai[0], '3 đáo hạn: gốc + lãi tháng cuối về tài khoản, không trả trùng cả kỳ', r);
  await p.close();

  /* 4. Cuối kỳ + tái tục gốc, lãi về tài khoản; cuối kỳ + tất toán; tái tục cả gốc và lãi (lãi vào sổ) */
  p = await page(browser, { tc_wallets: [bank,
    { id: 2, name: 'Sổ D', type: 'saving', balance: 20000000, rate: 5, termMonths: 1, depositDate: D(-1, -1), maturityDate: D(0, -1), payTiming: 'end', maturityAction: 'renew_principal', payoutWalletId: '1' },
    { id: 3, name: 'Sổ E', type: 'saving', balance: 20000000, rate: 5, termMonths: 1, depositDate: D(-1, -1), maturityDate: D(0, -1), payTiming: 'end', maturityAction: 'renew_all', payoutWalletId: '1' }] });
  r = await p.evaluate(() => ({ vcb: wallets[0].balance, d: wallets[1].balance, e: wallets[2].balance, dNext: wallets[1].maturityDate > todayStr(), lai: txs.filter(t => t.item === 'Lãi tiết kiệm').map(t => t.walletId + ':' + t.amount) }));
  ok(r.vcb > 1000000 && r.d === 20000000 && r.e > 20000000 && r.dNext, '4 cuối kỳ: tái tục gốc → lãi về tài khoản; tái tục cả gốc lãi → lãi vào sổ', r);
  await p.close();

  /* 5. Lãi đầu kỳ khi tạo sổ: về tài khoản nhận lãi */
  p = await page(browser, { tc_wallets: [bank, { id: 5, name: 'Tiền mặt', type: 'cash', balance: 0 }] });
  r = await p.evaluate(() => { showScreen('accounts'); toggleAccForm(); selectWType ? selectWType('saving') : (selectedWType = 'saving');
    const set = (i, v) => { const e = document.getElementById(i); if (e) e.value = v; };
    set('accNameInput', 'Sổ F'); set('accBalInput', '10.000.000'); set('savTerm', '6'); set('savRate', '6'); set('savPayTiming', 'start'); set('savMaturityAction', 'renew_principal');
    const po = document.getElementById('savPayoutWallet'); if (![...po.options].some(o => o.value === '5')) po.innerHTML += '<option value="5">Tiền mặt</option>'; po.value = '5'; set('savSourceWallet', '');
    saveAccount ? saveAccount() : addAccount();
    const f = wallets.find(w => w.name === 'Sổ F'); return { cash: wallets.find(w => w.id === 5).balance, so: f && f.balance }; });
  ok(r.cash > 0 && r.so === 10000000, '5 lãi đầu kỳ vào tài khoản nhận lãi', r);
  await p.close();

  /* 6. Sửa tiền lãi vay + không tính vào chi phí */
  p = await page(browser, { tc_wallets: [bank], tc_loans: [{ v: 2, id: 9, type: 'consumer', name: 'Vay nhà', principal: 120000000, paidBefore: 0, balance: 120000000, startDate: D(-2), termMonths: 24, rate: 10, interestDay: new Date().getDate(), iPaid: 0, status: 'active', history: [] }] });
  r = await p.evaluate(async () => {
    const out = {}; const l = loans[0]; payLoanCore(l, 5000000, 1000000, '1', todayStr()); saveAll(); renderHome();
    const ti = txs.find(t => t.item === 'Trả lãi vay'); const b0 = wallets[0].balance; const chi0 = document.getElementById('mChi').textContent;
    openEditTx(ti.id); out.modal = !!document.getElementById('ltAmt'); out.notAdd = currentScreen() !== 'add';
    document.getElementById('ltAmt').value = '1.200.000'; document.getElementById('ltNoCf').checked = true; saveLoanTxEdit(ti.id);
    const t2 = txs.find(t => t.id === l.history[0].txI);
    out.amt = t2.amount === 1200000 && l.history[0].interest === 1200000; out.bal = wallets[0].balance === b0 - 200000; out.nocf = t2.noCF === true;
    renderHome(); out.chi = document.getElementById('mChi').textContent; out.chi0 = chi0;
    /* sửa tiền gốc */
    const tp = txs.find(t => t.item === 'Trả nợ gốc vay'); openEditTx(tp.id); document.getElementById('ltAmt').value = '6.000.000'; saveLoanTxEdit(tp.id);
    out.princ = loans[0].balance === 114000000 && l.history[0].principal === 6000000;
    /* bỏ tích lại */
    openEditTx(t2.id); out.chk = document.getElementById('ltNoCf').checked; document.getElementById('ltNoCf').checked = false; saveLoanTxEdit(t2.id); out.off = !txs.find(t => t.id === l.history[0].txI).noCF;
    /* ô ở màn ghi nhận trả nợ */
    showScreen('loans'); const cb = document.getElementById('loanPayNoCf_9'); out.payBox = !!cb;
    document.getElementById('loanPayPrincipal_9').value = '0'; document.getElementById('loanPayInterest_9').value = '500.000'; document.getElementById('loanPayWallet_9').value = '1'; cb.checked = true; submitLoanPayment(9);
    const h = loans[0].history[0]; out.payNoCf = txs.find(t => t.id === h.txI).noCF === true;
    out.tag = document.getElementById('loanList').innerHTML.includes('lãi không tính chi phí');
    return out; });
  ok(r.modal && r.notAdd && r.amt && r.bal && r.nocf && r.chi !== r.chi0 && r.princ && r.chk && r.off && r.payBox && r.payNoCf && r.tag, '6 sửa tiền lãi/gốc vay, không tính vào chi phí, ô ở màn trả nợ', r);
  ok(p.errs.length === 0, '7 không lỗi JS', p.errs);
  await p.close();
  console.log((fail ? fails.map(f => '✘ ' + f).join('\n') + '\n' : '') + '✔ Đạt: ' + pass + '   ✘ Lỗi: ' + fail);
  await browser.close(); process.exit(fail ? 1 : 0);
})();
