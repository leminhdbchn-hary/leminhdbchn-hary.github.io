/* Nhập dữ liệu "khó" vào các biểu mẫu: để trống, số rất lớn, ký tự đặc biệt/emoji, số âm. Không được lỗi JS hay làm hỏng số dư.
   Chạy: python3 -m http.server 8765  rồi  node tests/forms.js */
const { chromium } = require('playwright');
const BASE = process.env.BASE || 'http://localhost:8765/index.html';
let pass = 0, fail = 0; const fails = [];
function ok(c, n, x) { if (c) pass++; else { fail++; fails.push(n + (x !== undefined ? ' → ' + JSON.stringify(x).slice(0, 400) : '')); } }
(async () => {
  const browser = await chromium.launch(); const p = await (await browser.newContext({ viewport: { width: 390, height: 844 } })).newPage(); const errs = []; const alerts = [];
  p.on('pageerror', e => errs.push(e.message)); p.on('dialog', d => { alerts.push(d.message().slice(0, 60)); d.accept(d.type() === 'prompt' ? '' : undefined); });
  await p.addInitScript(() => { if (!sessionStorage.getItem('seeded')) { sessionStorage.setItem('seeded', '1'); localStorage.clear(); localStorage.setItem('tc_cloud_gate_skip', '1');
    localStorage.setItem('tc_wallets', JSON.stringify([{ id: 1, name: 'Tiền mặt', type: 'cash', balance: 1000000 }])); } });
  await p.goto(BASE); await p.waitForTimeout(1200);
  const set = (id, v) => `document.getElementById('${id}').value=${JSON.stringify(v)};`;
  const fin = () => p.evaluate(() => wallets.every(w => Number.isFinite(w.balance)) && txs.every(t => Number.isFinite(t.amount) && t.amount > 0));
  const XSS = '<img src=x onerror="window.__x=1">"\'&😀';

  /* giao dịch */
  const tx = await p.evaluate(() => { const r = {}; const n0 = txs.length;
    showScreen('add'); setType('chi'); saveTx(); r.empty = txs.length === n0;                              // trống
    document.getElementById('amountInput').value = '50.000'; saveTx(); r.noCat = txs.length === n0;           // chưa chọn mục
    pickCat('Ăn uống', 'Ăn trưa'); document.getElementById('amountInput').value = '-5000'; saveTx(); r.neg = txs.length === n0 + 1 && txs[0].amount === 5000; // dấu trừ bị bỏ
    showScreen('add'); setType('chi'); pickCat('Ăn uống', 'Ăn trưa'); document.getElementById('amountInput').value = '999.999.999.999'; saveTx(); r.big = Number.isFinite(wallets[0].balance);
    return r; });
  ok(tx.empty && tx.noCat && tx.neg && tx.big, 'giao dịch: trống / chưa chọn mục / số âm / số rất lớn', tx);
  await p.evaluate(x => { showScreen('add'); setType('chi'); pickCat('Ăn uống', 'Ăn trưa'); document.getElementById('amountInput').value = '10.000'; document.getElementById('noteInput').value = x; document.getElementById('personInput').value = x; saveTx(); showScreen('history'); showScreen('home'); showScreen('report'); renderReport(); toggleRepDetail('chi'); }, XSS);
  await p.waitForTimeout(300);
  ok(await p.evaluate(() => !window.__x), 'ghi chú chứa mã HTML không bị chạy (an toàn)');
  /* ví */
  await p.evaluate(x => { showScreen('accounts'); toggleAccForm(); selectWType('cash'); document.getElementById('accNameInput').value = ''; saveAccount(); document.getElementById('accNameInput').value = x; document.getElementById('accBalInput').value = 'abc'; saveAccount(); }, XSS);
  ok(await p.evaluate(() => wallets.length === 2 && wallets[1].balance === 0), 'ví: tên trống bị từ chối; số dư chữ → 0');
  /* cho vay */
  const debt = await p.evaluate(x => { openDebts('out'); toggleDebtForm(); const n = debts.length; document.getElementById('debtPerson').value = ''; document.getElementById('debtAmount').value = '1000'; saveDebt(); const a = debts.length === n;
    toggleDebtForm(); document.getElementById('debtPerson').value = x; document.getElementById('debtAmount').value = ''; saveDebt(); const b = debts.length === n;
    toggleDebtForm(); document.getElementById('debtPerson').value = x; document.getElementById('debtAmount').value = '200000'; saveDebt(); renderDebts(); showScreen('home'); return { a, b, c: debts.length === n + 1 }; }, XSS);
  ok(debt.a && debt.b && debt.c, 'cho vay: thiếu tên / thiếu tiền bị từ chối; tên lạ vẫn lưu', debt);
  /* vay ngân hàng */
  const ln = await p.evaluate(() => { showScreen('loans'); toggleLoanForm(true); const n = loans.length; saveLoan(); const a = loans.length === n;
    document.getElementById('loanName').value = 'X'; document.getElementById('loanPrincipal').value = '100.000.000'; document.getElementById('loanTerm').value = '0'; document.getElementById('loanInterestDay').value = '15'; saveLoan(); const b = loans.length === n;
    document.getElementById('loanTerm').value = '12'; document.getElementById('loanInterestDay').value = '45'; saveLoan(); const c = loans.length === n;
    document.getElementById('loanInterestDay').value = '31'; document.getElementById('loanPaid').value = '200.000.000'; saveLoan(); const d = loans.length === n;
    document.getElementById('loanPaid').value = ''; document.getElementById('loanRateNew').value = '-3'; saveLoan(); const e = loans.length === n;
    document.getElementById('loanRateNew').value = ''; saveLoan(); return { a, b, c, d, e, ok: loans.length === n + 1 }; });
  ok(Object.values(ln).every(Boolean), 'vay: trống / kỳ hạn 0 / ngày 45 / đã trả > vay / lãi suất âm bị từ chối; hợp lệ thì lưu', ln);
  /* định kỳ */
  ok(await p.evaluate(() => { showScreen('recurring'); const n = recurring.length; document.getElementById('recName').value = ''; document.getElementById('recAmount').value = ''; saveRecurring(); return recurring.length === n; }), 'định kỳ: trống bị từ chối');
  /* chia tiền */
  ok(await p.evaluate(() => { openSplitBill(); const n = txs.length; saveSplitBill(); document.getElementById('spTotal').value = '100.000'; saveSplitBill(); closeAppModal(); return txs.length === n; }), 'chia tiền: thiếu tổng / thiếu người bị từ chối');
  /* mẫu ghi nhanh với tên chứa mã HTML */
  await p.evaluate(x => { showScreen('add'); setType('chi'); pickCat('Ăn uống', 'Cafe'); document.getElementById('amountInput').value = '30.000'; window.prompt = () => x; saveCurAsTpl(); renderTplBar(); openTplMgr(); closeAppModal(); }, XSS);
  await p.waitForTimeout(200);
  ok(await p.evaluate(() => !window.__x), 'tên mẫu chứa mã HTML không bị chạy');
  ok(await fin(), 'số dư và số tiền luôn là số hợp lệ');
  ok(errs.length === 0, 'không lỗi JS', errs);
  /* dữ liệu cũ đã lưu sẵn mã HTML + tên ví có ký tự & */
  const p2 = await (await browser.newContext()).newPage(); const errs2 = []; p2.on('pageerror', e => errs2.push(e.message)); p2.on('dialog', d => d.accept());
  await p2.addInitScript(x => { if (!sessionStorage.getItem('seeded')) { sessionStorage.setItem('seeded', '1'); localStorage.clear(); localStorage.setItem('tc_cloud_gate_skip', '1');
    localStorage.setItem('tc_wallets', JSON.stringify([{ id: 1, name: 'A&B', type: 'bank', balance: 0 }, { id: 2, name: "Thẻ 'X'", type: 'credit', balance: 0 }]));
    localStorage.setItem('tc_txs', JSON.stringify([{ id: 1, type: 'chi', amount: 1000, group: 'Ăn uống', item: 'Ăn trưa', walletId: 1, note: x, person: x, date: new Date().toISOString().slice(0, 10) },
      { id: 2, type: 'transfer', amount: 500, fromName: 'A&B', toName: "Thẻ 'X'", date: new Date().toISOString().slice(0, 10) }])); } }, XSS);
  await p2.goto(BASE); await p2.waitForTimeout(1200);
  const r2 = await p2.evaluate(() => { showScreen('history'); return { x: !!window.__x, note: txs[0].note, lbl: document.getElementById('historyList').innerText.includes("Trả nợ thẻ: A&B → Thẻ 'X'") }; });
  ok(!r2.x && !/[<>]/.test(r2.note) && r2.lbl && errs2.length === 0, 'dữ liệu cũ chứa mã HTML được làm sạch khi mở app; tên ví có & và \' hiển thị đúng', { r2, errs2 });
  console.log((fail ? fails.map(f => '✘ ' + f).join('\n') + '\n' : '') + '✔ Đạt: ' + pass + '   ✘ Lỗi: ' + fail);
  await browser.close(); process.exit(fail ? 1 : 0);
})();
