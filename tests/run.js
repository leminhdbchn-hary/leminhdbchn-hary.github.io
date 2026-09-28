/* Bộ kiểm thử tự động cho Sổ Thu Chi.
   Chạy: (1) mở máy chủ tĩnh ở thư mục gốc repo:  python3 -m http.server 8765
         (2) node tests/run.js        (cần Playwright + Chromium)
   Kiểm tra: số dư ví khi thêm/sửa/xoá giao dịch, chuyển ví, cho vay, vay nợ khác,
   tài sản ròng, lưu & tải lại, sao lưu/khôi phục, nhập nhanh, các màn hình không lỗi. */
const { chromium } = require('playwright');
const BASE = process.env.BASE || 'http://localhost:8765/index.html';
let pass = 0, fail = 0; const fails = [];
function ok(cond, name, extra) { if (cond) { pass++; } else { fail++; fails.push(name + (extra !== undefined ? ' → ' + JSON.stringify(extra) : '')); } }

async function fresh(browser, opts) {
  const ctx = await browser.newContext(Object.assign({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true }, opts || {}));
  const p = await ctx.newPage();
  p.errors = [];
  p.on('pageerror', e => p.errors.push(e.message));
  p.on('dialog', d => d.accept());
  await p.addInitScript(() => {
    if (!sessionStorage.getItem('seeded')) {
      sessionStorage.setItem('seeded', '1');
      localStorage.clear();
      localStorage.setItem('tc_cloud_gate_skip', '1');
      localStorage.setItem('tc_wallets', JSON.stringify([
        { id: 1, name: 'Tiền mặt', type: 'cash', balance: 1000000 },
        { id: 2, name: 'Ngân hàng', type: 'bank', balance: 5000000 }]));
    }
  });
  await p.goto(BASE); await p.waitForTimeout(900);
  return p;
}
const bal = (p, id) => p.evaluate(i => wallets.find(w => w.id === i).balance, id);

async function addTx(p, type, amount, group, item, walletId) {
  await p.evaluate(({ type, amount, group, item, walletId }) => {
    showScreen('add'); setType(type);
    document.getElementById('amountInput').value = String(amount);
    selectedGroup = group; selectedItem = item;
    document.getElementById('accSelect').value = String(walletId);
    saveTx();
  }, { type, amount, group, item, walletId });
}

(async () => {
  const browser = await chromium.launch();

  /* 1. Thu/chi/sửa/xoá */
  let p = await fresh(browser);
  await addTx(p, 'chi', 50000, 'Ăn uống', 'Cafe', 1);
  ok(await bal(p, 1) === 950000, 'chi trừ ví', await bal(p, 1));
  await addTx(p, 'thu', 300000, 'Lương', 'Lương', 2);
  ok(await bal(p, 2) === 5300000, 'thu cộng ví', await bal(p, 2));
  const chiId = await p.evaluate(() => txs.find(t => t.item === 'Cafe').id);
  await p.evaluate(id => { openEditTx(id); document.getElementById('amountInput').value = '80000'; saveTx(); }, chiId);
  ok(await bal(p, 1) === 920000, 'sửa số tiền chi', await bal(p, 1));
  await p.evaluate(id => { openEditTx(id); document.getElementById('accSelect').value = '2'; saveTx(); }, chiId);
  ok(await bal(p, 1) === 1000000 && await bal(p, 2) === 5220000, 'sửa đổi ví', [await bal(p, 1), await bal(p, 2)]);
  await p.evaluate(id => deleteTx(id), chiId);
  ok(await bal(p, 2) === 5300000, 'xoá giao dịch hoàn tiền', await bal(p, 2));
  ok(await p.evaluate(() => txs.every(t => t.icon && String(t.icon).startsWith('e:'))), 'icon hạng mục');

  /* 2. Chuyển ví */
  await p.evaluate(() => { showScreen('add'); setType('transfer'); document.getElementById('amountInput').value = '200000'; document.getElementById('xferFrom').value = '2'; document.getElementById('xferTo').value = '1'; saveTx(); });
  ok(await bal(p, 1) === 1200000 && await bal(p, 2) === 5100000, 'chuyển ví', [await bal(p, 1), await bal(p, 2)]);

  /* 2b. Tiền gia đình: thêm & sửa */
  await p.evaluate(() => { showScreen('add'); setType('family'); setFamDir('in'); document.getElementById('amountInput').value = '500000'; document.getElementById('famWallet').value = '1'; saveTx(); });
  ok(await bal(p, 1) === 1700000, 'gia đình: nhận tiền cộng ví', await bal(p, 1));
  const famId = await p.evaluate(() => txs.find(t => t.type === 'family').id);
  ok(await p.evaluate(id => { showScreen('family'); return !!document.querySelector('#screen-family [onclick*="openEditTx(' + id + ')"][aria-label="Sửa"]'); }, famId), 'gia đình: có nút sửa');
  await p.evaluate(id => { openEditTx(id); document.getElementById('amountInput').value = '300000'; saveTx(); }, famId);
  ok(await bal(p, 1) === 1500000 && await p.evaluate(id => txs.find(t => t.id === id).amount, famId) === 300000, 'gia đình: sửa số tiền', await bal(p, 1));
  await p.evaluate(id => { openEditTx(id); setFamDir('out'); saveTx(); }, famId);
  ok(await bal(p, 1) === 900000, 'gia đình: đổi nhận → đưa', await bal(p, 1));
  await p.evaluate(id => deleteTx(id), famId);
  ok(await bal(p, 1) === 1200000, 'gia đình: xoá hoàn ví', await bal(p, 1));

  /* 3. Cho vay & Vay nợ khác */
  await p.evaluate(() => { openDebts('out'); toggleDebtForm(); document.getElementById('debtPerson').value = 'Lan'; document.getElementById('debtAmount').value = '100000'; document.getElementById('debtSourceWallet').value = '1'; saveDebt(); });
  ok(await bal(p, 1) === 1100000, 'cho vay trừ ví', await bal(p, 1));
  await p.evaluate(() => { openDebts('in'); toggleDebtForm(); document.getElementById('debtPerson').value = 'Hùng'; document.getElementById('debtAmount').value = '400000'; document.getElementById('debtSourceWallet').value = '1'; saveDebt(); });
  ok(await bal(p, 1) === 1500000, 'vay nợ khác cộng ví', await bal(p, 1));
  let nw = await p.evaluate(() => netWorth());
  ok(nw.lent === 100000 && nw.personalOwe === 400000 && nw.net === 1500000 + 5100000 + 100000 - 400000, 'tài sản ròng', nw);
  const inId = await p.evaluate(() => debts.find(d => d.dir === 'in').id);
  await p.evaluate(id => { openDebts('in'); document.getElementById('payWallet_' + id).value = '1'; markDebtPaid(id); }, inId);
  ok(await bal(p, 1) === 1100000, 'trả nợ trừ ví', await bal(p, 1));
  await p.evaluate(id => undoDebtPaid(id), inId);
  ok(await bal(p, 1) === 1500000, 'huỷ trả nợ', await bal(p, 1));
  await p.evaluate(id => deleteDebt(id), inId);
  ok(await bal(p, 1) === 1100000, 'xoá khoản vay hoàn ví', await bal(p, 1));

  /* 4. Lưu & tải lại */
  const before = await p.evaluate(() => JSON.stringify({ t: txs.length, w: wallets.map(w => w.balance), d: debts.length }));
  await p.reload(); await p.waitForTimeout(1200);
  const after = await p.evaluate(() => JSON.stringify({ t: txs.length, w: wallets.map(w => w.balance), d: debts.length }));
  ok(before === after, 'dữ liệu còn sau khi tải lại', [before, after]);

  /* 5. Sao lưu cloud (payload) khứ hồi */
  const rt = await p.evaluate(() => { const a = JSON.stringify(buildCloudPayload()); applyCloudPayload(JSON.parse(a)); return a === JSON.stringify(buildCloudPayload()); });
  ok(rt, 'payload cloud khứ hồi');

  /* 6. Mọi màn hình mở không lỗi (điện thoại) */
  for (const s of ['home', 'accounts', 'add', 'history', 'report', 'budget', 'recurring', 'family', 'debts', 'loans', 'more', 'cloud'])
    await p.evaluate(s => showScreen(s), s);
  for (const sk of ['sky', 'red', 'gold']) await p.evaluate(s => { if (window.setSkin) setSkin(s); }, sk);
  ok(p.errors.length === 0, 'không có lỗi JS (điện thoại)', p.errors);

  /* 7. Máy tính */
  const d = await fresh(browser, { viewport: { width: 1440, height: 900 }, hasTouch: false, isMobile: false });
  for (const s of ['home', 'accounts', 'add', 'history', 'report', 'more']) await d.evaluate(s => showScreen(s), s);
  ok(d.errors.length === 0, 'không có lỗi JS (máy tính)', d.errors);

  /* 8. Kiểm thử bổ sung của các tính năng mới (nếu có) */
  if (await p.evaluate(() => typeof window.__extraTests === 'function')) {
    const r = await p.evaluate(async () => await window.__extraTests());
    r.forEach(x => ok(x.ok, x.name, x.extra));
  }

  await browser.close();
  console.log('✔ Đạt: ' + pass + '   ✘ Lỗi: ' + fail);
  fails.forEach(f => console.log('  ✘ ' + f));
  process.exit(fail ? 1 : 0);
})();
