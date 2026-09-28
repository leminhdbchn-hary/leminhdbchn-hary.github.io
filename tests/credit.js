/* Kiểm thử thẻ tín dụng. Chạy: python3 -m http.server 8765  rồi  node tests/credit.js */
const { chromium } = require('playwright');
const BASE = process.env.BASE || 'http://localhost:8765/index.html';
let pass = 0, fail = 0; const fails = [];
const ok = (c, n, x) => { if (c) pass++; else { fail++; fails.push(n + (x !== undefined ? ' → ' + JSON.stringify(x) : '')); } };
(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
  const p = await ctx.newPage(); const errs = [];
  p.on('pageerror', e => errs.push(e.message)); p.on('dialog', d => d.accept());
  await p.addInitScript(() => { if (!sessionStorage.getItem('s')) { sessionStorage.setItem('s', '1'); localStorage.clear(); localStorage.setItem('tc_cloud_gate_skip', '1');
    localStorage.setItem('tc_wallets', JSON.stringify([{ id: 1, name: 'Tiền mặt', type: 'cash', balance: 1000000 }, { id: 2, name: 'Ngân hàng', type: 'bank', balance: 5000000 }])); } });
  await p.goto(BASE); await p.waitForTimeout(900);
  // Thêm thẻ qua form
  await p.evaluate(() => { showScreen('accounts'); toggleAccForm(); selectWType('credit');
    document.getElementById('accNameInput').value = 'Visa'; document.getElementById('accBalInput').value = '0';
    document.getElementById('accLimitInput').value = '20.000.000'; document.getElementById('accDueDay').value = '15'; saveAccount(); });
  const card = await p.evaluate(() => wallets.find(w => w.type === 'credit'));
  ok(card && card.limit === 20000000 && card.dueDay === 15 && card.balance === 0, 'tạo thẻ', card);
  const total0 = await p.evaluate(() => walletTotal());
  ok(total0 === 6000000, 'tổng ví ban đầu', total0);
  // Chi bằng thẻ
  await p.evaluate(id => { showScreen('add'); setType('chi'); document.getElementById('amountInput').value = '700000'; selectedGroup = 'Ăn uống'; selectedItem = 'Cafe'; document.getElementById('accSelect').value = String(id); saveTx(); }, card.id);
  const r1 = await p.evaluate(id => ({ total: walletTotal(), card: wallets.find(w => w.id === id).balance, chi: txs.filter(t => t.type === 'chi').reduce((s, t) => s + t.amount, 0), nw: netWorth() }), card.id);
  ok(r1.total === 6000000, 'chi thẻ: tổng ví giữ nguyên', r1.total);
  ok(r1.card === -700000, 'chi thẻ: dư nợ tăng', r1.card);
  ok(r1.chi === 700000, 'chi thẻ: tổng chi tăng', r1.chi);
  ok(r1.nw.cardDebt === 700000 && r1.nw.ready === 6000000 && r1.nw.net === 5300000, 'tài sản ròng', r1.nw);
  const cardHtml = await p.evaluate(() => { showScreen('accounts'); return document.querySelector('.wcard-credit').innerText; });
  ok(/Dư nợ thẻ/.test(cardHtml) && /Trả nợ thẻ/.test(cardHtml), 'hiển thị thẻ', cardHtml);
  // Trả nợ thẻ một phần từ Ngân hàng
  await p.evaluate(id => { openCreditPay(id); document.getElementById('ccPaySrc').value = '2'; document.getElementById('ccPayAmt').value = '500.000'; saveCreditPay(id); }, card.id);
  const r2 = await p.evaluate(id => ({ total: walletTotal(), bank: wallets.find(w => w.id === 2).balance, card: wallets.find(w => w.id === id).balance, chi: txs.filter(t => t.type === 'chi').reduce((s, t) => s + t.amount, 0) }), card.id);
  ok(r2.total === 5500000 && r2.bank === 4500000 && r2.card === -200000 && r2.chi === 700000, 'trả nợ thẻ: ví giảm, chi không đổi', r2);
  // Xoá giao dịch trả nợ → hoàn lại
  await p.evaluate(() => deleteTx(txs.find(t => t.creditPay).id));
  const r3 = await p.evaluate(id => ({ total: walletTotal(), card: wallets.find(w => w.id === id).balance }), card.id);
  ok(r3.total === 6000000 && r3.card === -700000, 'xoá trả nợ hoàn tác', r3);
  // Sửa thẻ: dư nợ hiển thị dương, lưu lại giữ âm
  await p.evaluate(id => { openWalletEdit(id); saveWalletEdit(); }, card.id);
  ok(await p.evaluate(id => wallets.find(w => w.id === id).balance, card.id) === -700000, 'sửa thẻ giữ dư nợ');
  // Biểu đồ số dư tháng hiện tại khớp tổng ví
  const hist = await p.evaluate(() => walletBalanceHistory(2));
  ok(hist[hist.length - 1].v === 6000000, 'biểu đồ số dư', hist);
  for (const s of ['home', 'accounts', 'history', 'report']) await p.evaluate(s => { try { showScreen(s); } catch (e) {} }, s);
  ok(!errs.length, 'không lỗi JS', errs);
  await browser.close();
  console.log('✔ Đạt: ' + pass + '   ✘ Lỗi: ' + fail); fails.forEach(f => console.log('  ✘ ' + f)); process.exit(fail ? 1 : 0);
})();
