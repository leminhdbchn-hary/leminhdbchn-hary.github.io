/* Kiểm thử trường hợp biên v74–v78 + giữ nguyên dữ liệu khi nâng cấp/sao lưu. Chạy: python3 -m http.server 8765  rồi  node tests/edge.js */
const { chromium } = require('playwright');
const BASE = 'http://localhost:8765/index.html';
let pass = 0, fail = 0; const fails = [];
function ok(c, n, x) { if (c) pass++; else { fail++; fails.push(n + (x !== undefined ? ' → ' + JSON.stringify(x).slice(0, 400) : '')); } }
const D = (off) => { const d = new Date(); d.setDate(d.getDate() + off); return d.toISOString().slice(0, 10); };

/* Dữ liệu "cũ" như người dùng đang có (kiểu v73: không có noCF, txTemplates, advOf…) */
const OLD = {
  tc_wallets: [{ id: 1, name: 'Tiền mặt', type: 'cash', balance: 3000000 }, { id: 2, name: 'VCB', type: 'bank', balance: 20000000 }, { id: 3, name: 'Thẻ TD', type: 'credit', balance: -500000, limit: 10000000 },
    { id: 4, name: 'Sổ TK', type: 'saving', balance: 50000000, rate: 5, termMonths: 6, depositDate: D(-30) }],
  tc_txs: [
    { id: 101, type: 'chi', amount: 50000, group: 'Ăn uống', item: 'Ăn trưa', icon: 'e:🍜', walletId: 1, note: 'cơm', date: D(0), time: '12:00' },
    { id: 102, type: 'thu', amount: 15000000, group: 'Lương', item: 'Lương', icon: 'e:💰', walletId: 2, note: '', date: D(-3), time: '09:00' },
    { id: 103, type: 'chi', amount: 2000000, group: 'Khác', item: 'Cho vay', icon: 'khac', walletId: 2, person: 'Nam', note: 'Cho vay: Nam', date: D(-2), time: '10:00', debtId: 501 },
    { id: 104, type: 'transfer', amount: 1000000, fromName: 'VCB', toName: 'Tiền mặt', note: '', date: D(-1), time: '08:00' },
    { id: 105, type: 'chi', amount: 300000, group: 'Đi lại', item: 'Xăng xe', icon: 'e:⛽', walletId: 3, note: 'đổ xăng', date: D(-1), time: '18:00' },
    { id: 106, type: 'family', amount: 500000, dir: 'out', person: 'Vợ', walletId: 1, note: '', date: D(-5), time: '07:00' },
    { id: 107, type: 'chi', amount: 120000, group: 'Ăn uống', item: 'Cafe', icon: 'e:☕', walletId: 1, note: 'cafe sáng', date: D(-40), time: '07:30' }],
  tc_debts: [{ id: 501, dir: 'out', person: 'Nam', amount: 2000000, date: D(-2), dueDate: D(5), note: '', status: 'pending', sourceWalletId: 2, outTxId: 103, paidDate: null, paidWalletId: null }],
  tc_loans: [{ v: 2, id: 601, type: 'consumer', name: 'Vay mua xe', principal: 120000000, paidBefore: 0, balance: 120000000, startDate: D(-60), termMonths: 24, rate: 10, interestDay: 15, iPaid: 1, note: '', status: 'active', history: [], disburseTxId: null }],
  tc_budgets: { 'Ăn uống': 3000000 }, tc_recurring: [], tc_goals: [{ id: 1, name: 'Du lịch', target: 10000000, saved: 2000000, emoji: '✈️' }],
  tc_custom_cats: { chi: { groups: [{ name: 'Thú cưng', emoji: '🐶', items: [['Thức ăn', '🦴']] }], add: {}, hidden: [] } },
  tc_reward_profile: { total_points: 120, current_streak: 3, longest_streak: 9, last_reward_date: D(-1) }
};

async function page(browser, seed, vp) {
  const ctx = await browser.newContext({ viewport: vp || { width: 390, height: 844 } });
  const p = await ctx.newPage(); p.errs = [];
  p.on('pageerror', e => p.errs.push(e.message)); p.on('dialog', d => d.accept(d.type() === 'prompt' ? '' : undefined));
  await p.addInitScript(s => { if (!sessionStorage.getItem('seeded')) { sessionStorage.setItem('seeded', '1'); localStorage.clear(); localStorage.setItem('tc_cloud_gate_skip', '1');
    Object.entries(s).forEach(([k, v]) => localStorage.setItem(k, JSON.stringify(v))); } }, seed);
  await p.goto(BASE); await p.waitForTimeout(1200); return p;
}

(async () => {
  const browser = await chromium.launch();

  /* ===== A. Nâng cấp từ dữ liệu cũ: giữ nguyên ===== */
  let p = await page(browser, OLD);
  const A = await p.evaluate(() => ({ n: txs.length, w: wallets.map(w => w.balance), d: debts.length, l: loans.length, g: goals.length, pts: rewardProfile.total_points,
    cc: !!(customCats.chi && customCats.chi.groups.length), b: budgets['Ăn uống'], ids: txs.map(t => t.id).join() }));
  ok(A.n === 7 && A.w.join() === '3000000,20000000,-500000,50000000' && A.d === 1 && A.l === 1 && A.g === 1 && A.pts >= 120 && A.cc && A.b === 3000000, 'A1 nâng cấp: mọi dữ liệu cũ còn nguyên', A);
  await p.reload(); await p.waitForTimeout(1000);
  const A2 = await p.evaluate(() => ({ n: txs.length, w: wallets.map(w => w.balance).join(), ids: txs.map(t => t.id).join(), ls: ['tc_txs', 'tc_wallets', 'tc_debts', 'tc_loans', 'tc_goals', 'tc_custom_cats'].every(k => localStorage.getItem(k)) }));
  ok(A2.n === 7 && A2.w === '3000000,20000000,-500000,50000000' && A2.ids === A.ids && A2.ls, 'A2 tải lại vẫn nguyên dữ liệu', A2);
  const A3 = await p.evaluate(() => { const w = txs.filter(t => t.type === 'chi' && isCashFlow(t) && t.date.slice(0, 7) === todayStr().slice(0, 7)).reduce((s, t) => s + t.amount, 0); renderHome(); return { home: document.getElementById('mChi').textContent, exp: fmtShort(w) }; });
  ok(A3.home === A3.exp, 'A3 tổng chi tháng không gồm Cho vay', A3);
  ok(p.errs.length === 0, 'A4 không lỗi JS khi mở dữ liệu cũ', p.errs);

  /* ===== B. Sao lưu ↔ khôi phục: không mất gì ===== */
  const B = await p.evaluate(async () => {
    txTemplates.push({ id: 9, name: 'Cafe 30k', type: 'chi', group: 'Ăn uống', item: 'Cafe', amount: 30000, walletId: '1', note: '', person: '', noCF: false }); saveAll();
    let file = null; const orig = window.downloadFile; window.downloadFile = async (c) => { file = c; return true; };
    await exportJSON(); window.downloadFile = orig;
    const snap = JSON.stringify(buildCloudPayload());
    const data = JSON.parse(file);
    /* xoá sạch rồi khôi phục */
    txs = []; wallets = []; debts = []; loans = []; goals = []; customCats = {}; txTemplates = []; saveAll();
    const blob = new Blob([file], { type: 'application/json' }); const f = new File([blob], 'bk.json');
    const inp = document.getElementById('importFileInput'); const dt = new DataTransfer(); dt.items.add(f); inp.files = dt.files; inp.dispatchEvent(new Event('change'));
    await new Promise(r => setTimeout(r, 500));
    const after = JSON.stringify(buildCloudPayload());
    return { keys: Object.keys(data).sort().join(), same: after === snap, n: txs.length, tpl: txTemplates.length, cc: !!(customCats.chi), g: goals.length };
  });
  ok(B.same && B.n === 7 && B.tpl === 1 && B.cc && B.g === 1, 'B1 sao lưu rồi khôi phục: dữ liệu giống hệt (kể cả hạng mục tự tạo, mục tiêu, mẫu)', B);
  const B2 = await p.evaluate(() => { const old = { txs: [{ id: 1, type: 'chi', amount: 1, group: 'Khác', item: 'Khác', date: todayStr() }], wallets: [{ id: 1, name: 'A', type: 'cash', balance: 0 }] };
    const n0 = txTemplates.length; applyCloudPayload(old); return { tpl: txTemplates.length === n0, cats: customCats && typeof customCats === 'object' }; });
  ok(B2.tpl && B2.cats, 'B2 bản đồng bộ từ máy chưa cập nhật (thiếu mẫu) không xoá mẫu đang có', B2);
  await p.close();

  /* ===== C. Không tính thu chi (noCF) ===== */
  p = await page(browser, OLD);
  const C = await p.evaluate(() => {
    const r = {}; const b0 = wallets[0].balance;
    showScreen('add'); setType('chi'); pickCat('Ăn uống', 'Ăn trưa'); document.getElementById('amountInput').value = '80.000'; document.getElementById('accSelect').value = '1'; document.getElementById('noCfChk').checked = true; saveTx();
    const t = txs[0]; r.flag = t.noCF === true; r.bal = wallets[0].balance === b0 - 80000;
    openEditTx(t.id); r.editChk = document.getElementById('noCfChk').checked; document.getElementById('amountInput').value = '90.000'; saveTx();
    r.keep = txs.find(x => x.id === t.id).noCF === true && wallets[0].balance === b0 - 90000;
    openEditTx(t.id); document.getElementById('noCfChk').checked = false; saveTx(); r.off = !txs.find(x => x.id === t.id).noCF;
    deleteTx(t.id); r.del = wallets[0].balance === b0;
    /* chuyển sang Chuyển ví: không còn ô noCF; về lại Chi thì ô hiện */
    showScreen('add'); setType('transfer'); r.hideX = document.getElementById('noCfRow').style.display === 'none'; setType('chi'); r.showC = document.getElementById('noCfRow').style.display !== 'none';
    /* Tạm ứng: ô bị khoá tích; đổi sang hạng mục khác thì bỏ khoá + bỏ tích */
    pickCat('Khác', 'Tạm ứng ăn chung'); const c = document.getElementById('noCfChk'); r.fixed = c.checked && c.disabled; pickCat('Ăn uống', 'Ăn trưa'); r.unfixed = !c.checked && !c.disabled;
    /* tích tay rồi đổi hạng mục: vẫn giữ tích */
    c.checked = true; pickCat('Ăn uống', 'Cafe'); r.keepManual = c.checked;
    return r;
  });
  ok(Object.values(C).every(Boolean), 'C1 ô Không tính thu chi: thêm, sửa, bỏ tích, xoá, khoá với Tạm ứng', C);
  const C2 = await p.evaluate(() => { showScreen('add'); setType('thu'); pickCat('Lương', 'Lương'); document.getElementById('amountInput').value = '1.000.000'; document.getElementById('accSelect').value = '2'; document.getElementById('noCfChk').checked = true; saveTx();
    renderHome(); return { thu: document.getElementById('mThu').textContent, tag: txItemHTML(txs[0]).includes('không tính thu chi') }; });
  ok(C2.thu === '15.000.000' && C2.tag, 'C2 khoản thu đánh dấu không tính: tổng thu không đổi, có nhãn', C2);
  ok(p.errs.length === 0, 'C3 không lỗi JS', p.errs);
  await p.close();

  /* ===== D. Mẫu ghi nhanh ===== */
  p = await page(browser, OLD);
  const Dd = await p.evaluate(() => {
    const r = {};
    txTemplates = [{ id: 1, name: 'Ăn trưa 50k', type: 'chi', group: 'Ăn uống', item: 'Ăn trưa', amount: 50000, walletId: '1', note: 'cơm', person: '', noCF: false },
      { id: 2, name: 'Mẫu ví đã xoá', type: 'chi', group: 'Ăn uống', item: 'Cafe', amount: 20000, walletId: '999', note: '', person: '', noCF: false },
      { id: 3, name: 'Mẫu hạng mục mất', type: 'chi', group: 'Không tồn tại', item: 'Abc', amount: 10000, walletId: '1', note: '', person: '', noCF: false },
      { id: 4, name: 'Thu tạm ứng', type: 'chi', group: 'Khác', item: 'Tạm ứng ăn chung', amount: 300000, walletId: '2', note: 'lẩu', person: '', noCF: true },
      { id: 5, name: 'Chưa số tiền', type: 'thu', group: 'Thưởng', item: 'Thưởng', amount: 0, walletId: '2', note: '', person: '', noCF: false }];
    saveAll(); showScreen('add');
    let n = txs.length; useTpl(1); r.t1 = txs.length === n + 1 && txs[0].note === 'cơm' && txs[0].walletId === '1';
    showScreen('add'); n = txs.length; useTpl(2); r.t2 = txs.length === n + 1 && !!wallets.find(w => String(w.id) === String(txs[0].walletId));
    showScreen('add'); n = txs.length; useTpl(3); r.t3 = txs.length === n;
    showScreen('add'); n = txs.length; useTpl(4); r.t4 = txs.length === n + 1 && !isCashFlow(txs[0]);
    showScreen('add'); n = txs.length; useTpl(5); r.t5 = txs.length === n && currentType === 'thu' && selectedItem === 'Thưởng' && document.getElementById('amountInput').value === '';
    /* đang sửa giao dịch thì không dùng mẫu */
    openEditTx(101); n = txs.length; const before = JSON.stringify(txs.find(t => t.id === 101)); useTpl(1); r.t6 = txs.length === n && JSON.stringify(txs.find(t => t.id === 101)) === before; cancelEditTx();
    /* lưu mẫu khi chưa chọn hạng mục: không lưu */
    showScreen('add'); setType('chi'); const m = txTemplates.length; saveCurAsTpl(); r.t7 = txTemplates.length === m;
    /* mẫu với Chuyển ví: thanh mẫu ẩn */
    setType('transfer'); r.t8 = document.getElementById('tplBar').style.display === 'none';
    return r;
  });
  ok(Object.values(Dd).every(Boolean), 'D1 mẫu: ví đã xoá, hạng mục mất, tạm ứng, chưa số tiền, đang sửa, chưa chọn mục', Dd);
  ok(p.errs.length === 0, 'D2 không lỗi JS', p.errs);
  await p.close();

  /* ===== E. Tạm ứng chờ thu ===== */
  p = await page(browser, OLD);
  const E = await p.evaluate(() => {
    const r = {}; showScreen('add'); setType('chi'); pickCat('Khác', 'Tạm ứng ăn chung'); document.getElementById('amountInput').value = '500.000'; document.getElementById('accSelect').value = '1'; saveTx();
    const adv = txs[0]; const b0 = wallets[0].balance;
    openAdvances(); document.getElementById('advAmt_0').value = '200.000'; document.getElementById('advW_0').value = '2'; advCollect(0);
    const back = txs.find(t => t.advOf === adv.id); r.partial = advPending()[0].t.amount - advPending()[0].back === 300000 && wallets[1].balance === 20200000;
    /* xoá giao dịch thu lại → khoản tạm ứng quay về chờ đủ 500k */
    deleteTx(back.id); r.undoBack = advPending()[0].back === 0 && wallets[1].balance === 20000000;
    /* sửa khoản tạm ứng nhỏ hơn số đã thu → hết chờ */
    openAdvances(); advCollect(0); r.full = advPending().length === 0;
    /* xoá khoản tạm ứng gốc: không lỗi, danh sách trống */
    deleteTx(adv.id); r.delOrig = advPending().length === 0;
    /* Không thu nữa */
    showScreen('add'); setType('chi'); pickCat('Khác', 'Tạm ứng ăn chung'); document.getElementById('amountInput').value = '100.000'; saveTx(); openAdvances(); advWaive(0); r.waive = advPending().length === 0;
    closeAppModal(); renderHome(); r.mini = document.getElementById('advMini').style.display === 'none';
    /* thu nhập thu lại không tính thu chi, không làm đổi báo cáo */
    r.cf = txs.filter(t => t.item === 'Thu lại tạm ứng').every(t => !isCashFlow(t));
    return r;
  });
  ok(Object.values(E).every(Boolean), 'E1 tạm ứng: thu một phần, xoá khoản thu lại, thu đủ, xoá gốc, không thu nữa', E);
  ok(p.errs.length === 0, 'E2 không lỗi JS', p.errs);
  await p.close();

  /* ===== F. Báo cáo: chi tiết, bỏ khỏi thu chi, lọc ví, tiết kiệm ===== */
  p = await page(browser, OLD);
  const F = await p.evaluate(() => {
    const r = {}; showScreen('report'); setPeriod('month', document.createElement('button')); renderReport();
    r.chi = repChi.textContent; r.thu = repThu.textContent;
    toggleRepDetail('chi'); r.detail = /Ăn trưa/.test(document.getElementById('repDetail').innerText) && !/Cho vay/.test(document.getElementById('repDetail').innerText);
    /* lọc ví Tiền mặt + chi tiết vẫn mở */
    const sel = document.getElementById('repWallet'); sel.value = '1'; sel.dispatchEvent(new Event('change'));
    r.w1 = repChi.textContent === '50.000' && /Ăn trưa/.test(document.getElementById('repDetail').innerText) && !/Xăng/.test(document.getElementById('repDetail').innerText);
    /* ví đã xoá đang được chọn → tự về Tất cả ví */
    sel.value = '3'; sel.dispatchEvent(new Event('change')); wallets = wallets.filter(w => w.id !== 3); renderReport(); r.wGone = repWalletId === '' && sel.value === '';
    wallets.push({ id: 3, name: 'Thẻ TD', type: 'credit', balance: -500000 });
    /* bỏ khỏi thu chi */
    sel.value = ''; sel.dispatchEvent(new Event('change')); const before = repChi.textContent; repExclude([101], true); r.excl = repChi.textContent !== before && txs.find(t => t.id === 101).noCF === true;
    /* tiết kiệm: thu 15tr, chi 300k (xăng) → 98% */
    r.sv = document.querySelector('.sv-now b').textContent;
    /* điều hướng kỳ trước/sau không lỗi */
    navPeriod(-1); navPeriod(-1); navPeriod(2); setPeriod('year', document.createElement('button')); setPeriod('day', document.createElement('button')); setPeriod('week', document.createElement('button'));
    r.svNoThu = !!document.querySelector('.sv-now');
    return r;
  });
  ok(F.detail && F.w1 && F.wGone && F.excl && F.sv === '98%' && F.svNoThu, 'F1 báo cáo: chi tiết, lọc ví, ví đã xoá, bỏ khỏi thu chi, tỷ lệ tiết kiệm', F);
  ok(p.errs.length === 0, 'F2 không lỗi JS', p.errs);
  await p.close();

  /* ===== G. Lãi suất vay + nhắc ===== */
  p = await page(browser, OLD);
  const G = await p.evaluate(async () => {
    const r = {}; const l = loans[0];
    const i0 = nextInterestDue(l).amount;
    openLoanRateChange(l.id); await new Promise(x => setTimeout(x, 500));
    document.getElementById('loanRateNew').value = '15'; document.getElementById('loanRateNewDate').value = loanSchedule(l)[0].due; saveLoan();
    r.saved = loans[0].rateChanges.length === 1; r.changed = nextInterestDue(loans[0]).amount > i0;
    /* bấm Cập nhật lần nữa không nhân đôi */
    openEditLoan(l.id); saveLoan(); r.noDup = loans[0].rateChanges.length === 1;
    /* nhắc: khoản đã tất toán không nhắc */
    loans.push({ v: 2, id: 602, type: 'consumer', name: 'Đã xong', principal: 1000000, paidBefore: 1000000, balance: 0, startDate: '2025-01-01', termMonths: 12, rate: 10, interestDay: 1, iPaid: 12, status: 'closed', history: [] });
    localStorage.removeItem('tc_loan_notified'); localStorage.setItem('tc_loan_notify', '3'); checkLoanNotify(); await new Promise(x => setTimeout(x, 300));
    const sent = Object.keys(JSON.parse(localStorage.getItem('tc_loan_notified') || '{}'));
    r.noClosed = !sent.some(k => k.startsWith('602|'));
    const n1 = sent.length; checkLoanNotify(); await new Promise(x => setTimeout(x, 300)); r.dedupe = Object.keys(JSON.parse(localStorage.getItem('tc_loan_notified') || '{}')).length === n1;
    localStorage.setItem('tc_loan_notify', '0'); showScreen('loans'); r.ui = document.getElementById('loanNotifySel').value === '0';
    return r;
  });
  ok(Object.values(G).every(Boolean), 'G1 đổi lãi suất bằng nút Cập nhật, không nhân đôi, nhắc không trùng/không nhắc khoản đã xong', G);
  ok(p.errs.length === 0, 'G2 không lỗi JS', p.errs);
  await p.close();

  /* ===== H. Gợi ý hạng mục ===== */
  p = await page(browser, OLD);
  const H = await p.evaluate(async () => {
    const r = {}; const w = () => new Promise(x => setTimeout(x, 350)); const n = document.getElementById('noteInput');
    showScreen('add'); setType('chi'); n.value = 'đổ xăng sáng'; n.dispatchEvent(new Event('input')); await w(); r.learn = selectedItem === 'Xăng xe';
    n.value = ''; n.dispatchEvent(new Event('input')); await w(); r.empty = document.getElementById('noteSug').innerHTML === '';
    /* đang sửa giao dịch: không tự đổi hạng mục */
    openEditTx(101); n.value = 'đổ xăng'; n.dispatchEvent(new Event('input')); await w(); r.edit = selectedItem === 'Ăn trưa'; cancelEditTx();
    /* khoản thu */
    showScreen('add'); setType('thu'); n.value = 'nhận lương tháng'; n.dispatchEvent(new Event('input')); await w(); r.thu = selectedItem === 'Lương';
    /* ký tự đặc biệt không lỗi */
    n.value = '"<b>\'\\%$#@!'; n.dispatchEvent(new Event('input')); await w(); r.special = true;
    /* nhập nhanh vẫn chạy cùng gợi ý */
    showScreen('add'); setType('chi'); const q = document.getElementById('qeInput'); q.value = 'cafe 35k'; qeRun(); r.qe = selectedItem === 'Cafe' && document.getElementById('amountInput').value === '35.000';
    return r;
  });
  ok(Object.values(H).every(Boolean), 'H1 gợi ý: học, ghi chú trống, đang sửa, khoản thu, ký tự lạ, nhập nhanh', H);
  ok(p.errs.length === 0, 'H2 không lỗi JS', p.errs);
  await p.close();

  /* ===== I. Chia tiền & cho vay vẫn đúng số dư ===== */
  p = await page(browser, OLD);
  const I = await p.evaluate(async () => {
    const r = {}; const b0 = wallets[0].balance;
    openSplitBill(); document.getElementById('spTotal').value = '900.000'; document.getElementById('spNames').value = 'An, Bình'; splitPreview(); document.getElementById('spWallet').value = '1'; saveSplitBill();
    r.bal = wallets[0].balance === b0 - 900000; r.cf = txs.filter(t => t.split || t.debtId).every(t => !isCashFlow(t));
    const d = debts.find(x => x.person === 'An'); renderDebts && (debtDir = 'out', renderDebts());
    const sel = document.getElementById('payWallet_' + d.id); if (sel) sel.value = '1'; markDebtPaid(d.id); r.paid = wallets[0].balance === b0 - 600000;
    r.recoverCf = !isCashFlow(txs[0]);
    return r;
  });
  ok(Object.values(I).every(Boolean), 'I1 chia tiền/thu nợ: số dư đúng, không tính thu chi', I);
  ok(p.errs.length === 0, 'I2 không lỗi JS', p.errs);
  await p.close();

  /* ===== J. Mở mọi màn hình, mọi giao diện màu, điện thoại + máy tính ===== */
  for (const vp of [{ width: 390, height: 844 }, { width: 1400, height: 900 }]) {
    for (const skin of ['gold', 'sky', 'red', 'mono']) {
      p = await page(browser, Object.assign({}, OLD, { tc_skin: skin }), vp);
      await p.evaluate(s => localStorage.setItem('tc_skin', s), skin);
      const screens = ['home', 'accounts', 'add', 'history', 'report', 'budget', 'recurring', 'family', 'debts', 'loans', 'goals', 'cats', 'more', 'cloud'];
      const overflow = await p.evaluate(async (sc) => { const bad = []; for (const s of sc) { try { showScreen(s); } catch (e) { bad.push(s + ':' + e.message); } await new Promise(x => setTimeout(x, 120));
        if (document.documentElement.scrollWidth > window.innerWidth + 1) bad.push(s + ':tràn ngang ' + document.documentElement.scrollWidth); }
        try { showScreen('report'); toggleRepDetail('chi'); openAdvances(); closeAppModal(); openTplMgr(); closeAppModal(); } catch (e) { bad.push('modal:' + e.message); }
        return bad; }, screens);
      ok(overflow.length === 0 && p.errs.length === 0, 'J ' + vp.width + 'px / ' + skin + ': mọi màn hình mở được, không tràn, không lỗi', { overflow, errs: p.errs });
      await p.close();
    }
  }

  console.log((fail ? fails.map(f => '✘ ' + f).join('\n') + '\n' : '') + '✔ Đạt: ' + pass + '   ✘ Lỗi: ' + fail);
  await browser.close(); process.exit(fail ? 1 : 0);
})();
