/* Kiểm thử more.js (v78): mẫu ghi nhanh, gợi ý hạng mục, tạm ứng chờ thu, lọc báo cáo theo ví, tỷ lệ tiết kiệm, nhắc vay, nhắc sao lưu.
   Chạy: python3 -m http.server 8765  rồi  node tests/more.js */
const { chromium } = require('playwright');
const BASE = process.env.BASE || 'http://localhost:8765/index.html';
let pass = 0, fail = 0; const fails = [];
function ok(c, n, x) { if (c) pass++; else { fail++; fails.push(n + (x !== undefined ? ' → ' + JSON.stringify(x) : '')); } }
(async () => {
  const browser = await chromium.launch();
  const p = await (await browser.newContext({ viewport: { width: 390, height: 844 } })).newPage(); const errs = [];
  p.on('pageerror', e => errs.push(e.message)); p.on('dialog', d => d.accept(d.type() === 'prompt' ? '' : undefined));
  await p.addInitScript(() => { if (!sessionStorage.getItem('seeded')) { sessionStorage.setItem('seeded', '1'); localStorage.clear(); localStorage.setItem('tc_cloud_gate_skip', '1');
    localStorage.setItem('tc_wallets', JSON.stringify([{ id: 1, name: 'Tiền mặt', type: 'cash', balance: 10000000 }, { id: 2, name: 'VCB', type: 'bank', balance: 5000000 }])); } });
  await p.goto(BASE); await p.waitForTimeout(1000);

  const tpl = await p.evaluate(() => { showScreen('add'); setType('chi'); pickCat('Ăn uống', 'Ăn trưa'); document.getElementById('amountInput').value = '35.000'; document.getElementById('accSelect').value = '2';
    saveCurAsTpl(); const t = txTemplates[0]; showScreen('add'); const n0 = txs.length; useTpl(t.id); return { name: t.name, added: txs.length - n0, item: txs[0].item, amt: txs[0].amount, bal: wallets[1].balance }; });
  ok(tpl.name === 'Ăn trưa 35k' && tpl.added === 1 && tpl.item === 'Ăn trưa' && tpl.amt === 35000 && tpl.bal === 4965000, 'mẫu: lưu và bấm 1 lần là ghi đúng ví', tpl);
  ok(await p.evaluate(() => JSON.parse(localStorage.getItem('tc_templates')).length === 1 && buildCloudPayload().txTemplates.length === 1), 'mẫu được lưu và đồng bộ');

  const sug = await p.evaluate(() => { const g = GROUPS.chi.find(x => x.name === 'Đi lại'); for (let i = 0; i < 3; i++) txs.unshift({ id: Date.now() + i + Math.random(), type: 'chi', amount: 50000, group: g.name, item: g.items[0], note: 'grab đi làm', date: todayStr(), walletId: 1 });
    showScreen('add'); setType('chi'); const n = document.getElementById('noteInput'); n.value = 'grab về nhà'; n.dispatchEvent(new Event('input'));
    return new Promise(r => setTimeout(() => r({ sel: selectedGroup + '|' + selectedItem, want: g.name + '|' + g.items[0] }), 400)); });
  ok(sug.sel === sug.want, 'gợi ý hạng mục học từ ghi chú cũ', sug);
  ok(await p.evaluate(() => { const s = suggestCat('cafe sáng', 'chi'); return s && s.it === 'Cafe'; }), 'gợi ý từ từ điển khi chưa có lịch sử');
  ok(await p.evaluate(() => { showScreen('add'); setType('chi'); pickCat('Ăn uống', 'Ăn tối'); const n = document.getElementById('noteInput'); n.value = 'grab'; n.dispatchEvent(new Event('input'));
    return new Promise(r => setTimeout(() => r(selectedItem === 'Ăn tối' && !!document.querySelector('#noteSug .sug-btn')), 400)); }), 'đã tự chọn hạng mục thì chỉ gợi ý, không tự đổi');

  const adv = await p.evaluate(() => { showScreen('add'); setType('chi'); pickCat('Khác', 'Tạm ứng ăn chung'); document.getElementById('amountInput').value = '600.000'; document.getElementById('accSelect').value = '1'; saveTx();
    const b0 = wallets[0].balance; openAdvances(); document.getElementById('advAmt_0').value = '200.000'; advCollect(0); const left = advPending()[0].t.amount - advPending()[0].back;
    advCollect(0); closeAppModal(); return { b0, b1: wallets[0].balance, left, rest: advPending().length, cf: txs.filter(t => t.advOf).every(t => !isCashFlow(t)) }; });
  ok(adv.left === 400000 && adv.rest === 0 && adv.b1 === adv.b0 + 600000 && adv.cf, 'tạm ứng: thu một phần, thu đủ, không tính thu chi', adv);

  const rep = await p.evaluate(() => { showScreen('report'); renderReport(); const all = repChi.textContent; const sel = document.getElementById('repWallet'); sel.value = '2'; sel.dispatchEvent(new Event('change'));
    const w2 = repChi.textContent; sel.value = ''; sel.dispatchEvent(new Event('change')); return { all, w2, sv: !!document.querySelector('.sv-now') }; });
  ok(rep.w2 === '35.000' && rep.all !== rep.w2 && rep.sv, 'báo cáo lọc theo ví + thẻ tỷ lệ tiết kiệm', rep);

  const nt = await p.evaluate(async () => { const s = new Date(); s.setMonth(s.getMonth() - 1);
    loans.push({ v: 2, id: 7, type: 'consumer', name: 'Vay', principal: 12000000, paidBefore: 0, balance: 12000000, startDate: s.toISOString().slice(0, 10), termMonths: 12, rate: 10, rateChanges: [], interestDay: new Date(addDays(todayStr(), 2) + 'T00:00:00').getDate(), iPaid: 0, status: 'active', history: [] });
    showScreen('loans'); setLoanNotify('3'); await new Promise(r => setTimeout(r, 600)); return { sent: Object.keys(JSON.parse(localStorage.getItem('tc_loan_notified') || '{}')).length, ui: !!document.getElementById('loanNotifySel') }; });
  ok(nt.ui && nt.sent >= 1, 'nhắc trả nợ vay: có cài đặt và nhắc khoản sắp đến hạn', nt);

  const bk = await p.evaluate(() => { localStorage.setItem('tc_last_backup', String(Date.now() - 10 * 864e5)); localStorage.removeItem('tc_backup_snooze'); renderHome();
    return { shown: document.getElementById('backupWarn').style.display, btn: !!document.getElementById('bwCloudBtn') }; });
  ok(bk.shown === 'flex' && bk.btn, 'nhắc sao lưu kèm nút Đồng bộ Google khi chưa đăng nhập', bk);
  ok(await p.evaluate(() => { const real = window.Cloud; window.Cloud = { isLoggedIn: () => true, isDirty: () => false }; renderHome(); const h = document.getElementById('backupWarn').style.display; window.Cloud = real; return h === 'none'; }), 'đã đồng bộ Google thì không nhắc sao lưu');
  ok(errs.length === 0, 'không lỗi JS', errs);

  console.log((fail ? fails.map(f => '✘ ' + f).join('\n') + '\n' : '') + '✔ Đạt: ' + pass + '   ✘ Lỗi: ' + fail);
  await browser.close(); process.exit(fail ? 1 : 0);
})();
