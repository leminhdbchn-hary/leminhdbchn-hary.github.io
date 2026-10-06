/* Kiểm thử điều chỉnh lãi suất khoản vay ngân hàng (lãi suất đổi theo ngày áp dụng).
   Chạy: python3 -m http.server 8765  rồi  node tests/loanrate.js */
const { chromium } = require('playwright');
const BASE = process.env.BASE || 'http://localhost:8765/index.html';
let pass = 0, fail = 0; const fails = [];
function ok(c, n, x) { if (c) pass++; else { fail++; fails.push(n + (x !== undefined ? ' → ' + JSON.stringify(x) : '')); } }

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
  const p = await ctx.newPage(); p.errors = [];
  p.on('pageerror', e => p.errors.push(e.message)); p.on('dialog', d => d.accept());
  await p.addInitScript(() => {
    if (!sessionStorage.getItem('seeded')) {
      sessionStorage.setItem('seeded', '1'); localStorage.clear(); localStorage.setItem('tc_cloud_gate_skip', '1');
      localStorage.setItem('tc_wallets', JSON.stringify([{ id: 1, name: 'Tiền mặt', type: 'cash', balance: 1000000 }]));
    }
  });
  await p.goto(BASE); await p.waitForTimeout(900);
  const calc = (rate, chg, from, to, bal) => p.evaluate(a => loanInterestFor({ rate: a.rate, rateChanges: a.chg }, a.bal, a.from, a.to), { rate, chg, from, to, bal });
  const B = 1000000;

  /* 1. Công thức: lãi cũ trước ngày đổi, lãi mới từ ngày đổi */
  let r = await calc(10, [], '2026-01-15', '2026-03-01', B);
  ok(r.amount === Math.round(B * 0.10 * 45 / 365) && r.segs.length === 1, 'không đổi lãi suất: một đoạn', r);
  r = await calc(10, [{ date: '2026-02-01', rate: 12 }], '2026-01-15', '2026-03-01', B);
  ok(r.amount === Math.round(B * 0.10 * 17 / 365 + B * 0.12 * 28 / 365) && r.segs.length === 2 && r.segs[0].rate === 10 && r.segs[1].rate === 12 && r.segs[1].from === '2026-02-01', 'đổi giữa kỳ: 17 ngày lãi cũ + 28 ngày lãi mới', r);
  r = await calc(10, [{ date: '2026-01-15', rate: 12 }], '2026-01-15', '2026-02-15', B);
  ok(r.amount === Math.round(B * 0.12 * 31 / 365) && r.segs.length === 1, 'đổi đúng ngày đầu kỳ: cả kỳ lãi mới', r);
  r = await calc(10, [{ date: '2026-02-15', rate: 12 }], '2026-01-15', '2026-02-15', B);
  ok(r.amount === Math.round(B * 0.10 * 31 / 365), 'đổi đúng ngày cuối kỳ: kỳ này vẫn lãi cũ', r);
  r = await calc(10, [{ date: '2026-03-01', rate: 12 }], '2026-01-15', '2026-02-15', B);
  ok(r.amount === Math.round(B * 0.10 * 31 / 365), 'đổi sau kỳ: không ảnh hưởng', r);
  r = await calc(10, [{ date: '2026-01-01', rate: 8 }], '2026-02-15', '2026-03-15', B);
  ok(r.amount === Math.round(B * 0.08 * 28 / 365), 'đổi trước kỳ: cả kỳ dùng lãi suất mới nhất đã có hiệu lực', r);
  r = await calc(10, [{ date: '2026-03-01', rate: 9 }, { date: '2026-02-01', rate: 12 }], '2026-01-15', '2026-04-01', B);
  ok(r.segs.length === 3 && r.segs.map(s => s.rate).join() === '10,12,9' && r.amount === Math.round(B * (0.10 * 17 + 0.12 * 28 + 0.09 * 31) / 365), 'nhiều lần đổi (nhập không theo thứ tự)', r);
  r = await calc(10, [{ date: '2026-02-01', rate: 0 }], '2026-01-15', '2026-03-01', B);
  ok(r.amount === Math.round(B * 0.10 * 17 / 365), 'lãi suất mới 0%', r);

  /* 2. Nhập qua form: thêm / xoá lần điều chỉnh, lưu, tải lại */
  await p.evaluate(() => {
    showScreen('loans'); toggleLoanForm(true);
    const set = (id, v) => { document.getElementById(id).value = v; };
    set('loanName', 'Vay mua xe'); set('loanPrincipal', '120000000'); set('loanStartDate', '2026-01-15');
    set('loanTerm', '12'); set('loanRate', '10'); set('loanInterestDay', '15');
    set('loanRateNew', '12'); set('loanRateNewDate', '2026-02-01'); addLoanRateChange();
    set('loanRateNew', '9'); set('loanRateNewDate', '2026-06-01'); addLoanRateChange();
    set('loanRateNew', '15'); set('loanRateNewDate', '2026-01-10'); addLoanRateChange(); /* trước ngày giải ngân: bị từ chối */
    saveLoan();
  });
  const L = await p.evaluate(() => loans[0]);
  ok(L && L.rate === 10 && L.rateChanges.length === 2 && L.rateChanges[0].date === '2026-02-01' && L.rateChanges[1].rate === 9, 'lưu khoản vay kèm các lần điều chỉnh (từ chối ngày trước giải ngân)', L && L.rateChanges);
  ok(await p.evaluate(() => loanRateAt(loans[0], '2026-01-31')) === 10 && await p.evaluate(() => loanRateAt(loans[0], '2026-02-01')) === 12 && await p.evaluate(() => loanRateAt(loans[0], '2026-06-01')) === 9, 'lãi suất theo ngày: 31/1 = 10%, 1/2 = 12%, 1/6 = 9%');
  const ni = await p.evaluate(() => { const l = loans[0]; l.iPaid = 0; return nextInterestDue(l); });
  const exp = await p.evaluate(() => { const l = loans[0]; const ni = nextInterestDue(l); return loanInterestFor(l, l.balance, ni.from, ni.due).amount; });
  ok(ni.amount === exp && ni.segs.length >= 1, 'nextInterestDue dùng lãi suất theo đoạn', ni);
  const sumPeriods = await p.evaluate(() => { const l = loans[0]; let a = 0, b = 0; const n = loanSchedule(l).length; for (let j = 0; j < n; j++) { a += loanPeriodInterest(l, j).amount; } const l2 = JSON.parse(JSON.stringify(l)); l2.rateChanges = []; for (let j = 0; j < n; j++) { b += loanPeriodInterest(l2, j).amount; } return { a, b }; });
  ok(sumPeriods.a !== sumPeriods.b, 'có điều chỉnh thì tổng lãi các kỳ khác khi không điều chỉnh', sumPeriods);

  await p.evaluate(() => { showScreen('loans'); renderLoans(); });
  const html = await p.evaluate(() => document.getElementById('loanList').innerText);
  ok(/Lịch sử lãi suất/.test(html) && /Ban đầu 10%/.test(html) && /12%/.test(html), 'thẻ khoản vay hiện lịch sử lãi suất', html.slice(0, 300));
  ok(/Đổi lãi suất/.test(html), 'có nút Đổi lãi suất');

  /* 3. Sửa khoản vay: các lần điều chỉnh được nạp lại, xoá được, thêm được */
  await p.evaluate(() => { openEditLoan(loans[0].id); });
  ok(await p.evaluate(() => document.querySelectorAll('#loanRateChgList .loan-hist-row').length) === 2, 'form sửa nạp lại 2 lần điều chỉnh');
  await p.evaluate(() => { removeLoanRateChange('2026-06-01'); const set = (id, v) => { document.getElementById(id).value = v; }; set('loanRateNew', '11.5'); set('loanRateNewDate', '2026-09-01'); addLoanRateChange(); saveLoan(); });
  const L2 = await p.evaluate(() => loans[0].rateChanges.map(c => c.date + ':' + c.rate).join());
  ok(L2 === '2026-02-01:12,2026-09-01:11.5', 'sau khi sửa: xoá 1 lần, thêm 1 lần', L2);
  await p.evaluate(() => { openLoanRateChange(loans[0].id); });
  await p.waitForTimeout(600);
  ok(await p.evaluate(() => document.getElementById('addLoanForm').style.display === 'block' && document.getElementById('loanRateNewDate').value !== ''), 'nút Đổi lãi suất mở form và điền sẵn ngày hôm nay');
  await p.evaluate(() => toggleLoanForm(false));

  /* 4. Lưu & tải lại; payload cloud khứ hồi giữ nguyên rateChanges */
  await p.reload(); await p.waitForTimeout(1000);
  ok(await p.evaluate(() => loans[0].rateChanges.length) === 2, 'tải lại trang vẫn còn các lần điều chỉnh');
  ok(await p.evaluate(() => { const a = JSON.stringify(buildCloudPayload()); applyCloudPayload(JSON.parse(a)); return loans[0].rateChanges.length === 2 && a === JSON.stringify(buildCloudPayload()); }), 'payload cloud khứ hồi giữ lịch sử lãi suất');

  /* 5. Khoản vay cũ (không có rateChanges) không đổi kết quả */
  const old = await p.evaluate(() => { const l = { v: 2, id: 99, type: 'consumer', principal: 12000000, balance: 12000000, paidBefore: 0, startDate: '2026-01-15', termMonths: 12, rate: 9.5, interestDay: 15, iPaid: 0, history: [], status: 'active' }; const ni = nextInterestDue(l); return { amount: ni.amount, expect: Math.round(12000000 * 9.5 / 100 * ni.days / 365) }; });
  ok(old.amount === old.expect, 'khoản vay cũ tính lãi như trước', old);

  ok(p.errors.length === 0, 'không lỗi JS', p.errors);
  await browser.close();
  console.log('✔ Đạt: ' + pass + '   ✘ Lỗi: ' + fail); fails.forEach(f => console.log('  ✘ ' + f));
  process.exit(fail ? 1 : 0);
})();
