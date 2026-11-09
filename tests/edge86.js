/* Trường hợp biên v86. Chạy: python3 -m http.server 8765  rồi  node tests/edge86.js */
const { chromium } = require('playwright');
const BASE = process.env.BASE || 'http://localhost:8765/index.html';
let pass = 0, fail = 0; const fails = [];
function ok(c, n, x) { if (c) pass++; else { fail++; fails.push(n + (x !== undefined ? ' → ' + JSON.stringify(x).slice(0, 500) : '')); } }
const D = (d) => { const t = new Date(); t.setDate(t.getDate() + d); return t.toISOString().slice(0, 10); };
async function page(browser, seed, opts) {
  const ctx = await browser.newContext(Object.assign({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true }, opts || {}));
  const p = await ctx.newPage(); p.errs = []; p.on('pageerror', e => p.errs.push(e.message)); p.on('dialog', d => d.accept(d.type() === 'prompt' ? '' : undefined));
  await p.addInitScript(s => { if (!sessionStorage.getItem('seeded')) { sessionStorage.setItem('seeded', '1'); localStorage.clear(); localStorage.setItem('tc_cloud_gate_skip', '1'); localStorage.setItem('tc_swipe_hint', '1');
    Object.entries(s).forEach(([k, v]) => localStorage.setItem(k, typeof v === 'string' ? v : JSON.stringify(v))); } }, seed);
  await p.goto(BASE); await p.waitForTimeout(1200); p.ctx = ctx; return p;
}
(async () => {
  const browser = await chromium.launch();
  const W = [{ id: 1, name: 'Tiền mặt', type: 'cash', balance: 3000000 }, { id: 2, name: 'VCB & "Co"', type: 'bank', balance: 20000000 }, { id: 3, name: 'Thẻ', type: 'credit', balance: 0, limit: 5000000 }];
  const TX = [{ id: 1, type: 'chi', amount: 100000, group: 'Ăn uống', item: 'Ăn trưa', walletId: 1, date: D(0), time: '12:00' }, { id: 2, type: 'chi', amount: 200000, group: 'Ăn uống', item: 'Cafe', walletId: 2, date: D(0) },
    { id: 3, type: 'thu', amount: 9000000, group: 'Lương', item: 'Lương', walletId: 2, date: D(0) }, { id: 4, type: 'chi', amount: 50000, group: 'Đi lại', item: 'Xăng xe', walletId: 1, date: D(-1), loanId: 0 }];
  let p = await page(browser, { tc_wallets: W, tc_txs: TX, tc_loans: [{ v: 2, id: 9, type: 'consumer', name: 'Vay', principal: 10000000, paidBefore: 0, balance: 10000000, startDate: D(-40), termMonths: 12, rate: 10, interestDay: 15, iPaid: 0, status: 'active', history: [] }] });
  const r = await p.evaluate(() => { const o = {};
    /* chế độ chọn + đang vuốt: chọn vẫn đúng, không mở sửa, không xoá */
    closeAppModal(); showScreen('history'); const row = document.querySelector('#historyList .tx-item'); row.classList.add('swiped'); setSelMode(true); row.click(); o.selSwipe = currentScreen() === 'history' && txs.length === 4 && document.getElementById('selCount').textContent === 'Đã chọn 1';
    /* chọn tất cả rồi đổi hạng mục với cả Thu lẫn Chi → báo, không đổi */
    selAll(); const before = JSON.stringify(txs.map(t => t.item)); selRecat(); o.mixed = JSON.stringify(txs.map(t => t.item)) === before && !document.getElementById('appModal').classList.contains('show');
    /* xoá nhiều có khoản vay ngân hàng: không bị hỏi từng khoản, số dư đúng */
    const sum0 = walletTotal(); payLoanCore(loans[0], 1000000, 100000, '1', todayStr()); saveAll(); setSelMode(false); showScreen('history'); setSelMode(true); selAll(); selDelete();
    o.delAll = txs.length === 0 && Math.abs(walletTotal() - (sum0 - (100000 + 200000 + 50000) * -1 - 9000000 * 1) ) < 1 ? true : { left: txs.length, tot: walletTotal(), sum0 };
    o.loanRestored = loans[0].balance === 10000000 && loans[0].history.length === 0;
    /* thanh Hoàn tác bị ẩn khi xoá nhiều */
    o.undoHidden = !document.getElementById('undoBar').classList.contains('show');
    return o; });
  ok(r.selSwipe && r.mixed && r.delAll === true && r.loanRestored && r.undoHidden, 'chọn nhiều: dòng đang vuốt, đổi hạng mục Thu+Chi lẫn lộn, xoá gồm khoản trả vay', r);
  /* ẩn số dư: xem nhanh ví không lộ số */
  ok(await p.evaluate(() => { if (typeof toggleHideBal === 'function') toggleHideBal(); else hideBal = true; showScreen('accounts'); openWalletQuick(2); const t = document.getElementById('appModalBody').innerText; closeAppModal(); const ok2 = /\*\*\*\*/.test(t) && /\*\*\*\*/.test(document.getElementById('accList').innerText); hideBal = false; renderAccounts(); return ok2; }), 'bật ẩn số dư: danh sách ví và xem nhanh đều ẩn số');
  /* tên ví có ký tự đặc biệt: hiển thị đúng, lọc đúng */
  ok(await p.evaluate(() => { txs.push({ id: 11, type: 'chi', amount: 1000, group: 'Ăn uống', item: 'Cafe', walletId: 2, date: todayStr() }, { id: 12, type: 'transfer', amount: 500, fromName: 'VCB & "Co"', toName: 'Tiền mặt', date: todayStr() }); saveAll();
    showScreen('accounts'); const lst = document.getElementById('accList').innerText.includes('VCB & "Co"'); walletQuickAll(2); return lst && histRes.length === 2; }), 'ví tên có & và ": hiển thị đúng, Xem tất cả lọc đúng (gồm chuyển ví)');
  /* dòng Hôm nay: chưa có ngân sách, chưa chi gì */
  ok(await p.evaluate(() => { budgets = {}; txs = []; saveAll(); renderHome(); return /Hôm nay đã chi 0/.test(document.getElementById('todayLine').innerText); }), 'dòng Hôm nay khi chưa có ngân sách/giao dịch');
  /* sắp xếp Cài đặt rồi thoát: vẫn chia nhóm, không mất mục */
  ok(await p.evaluate(() => { showScreen('more'); const n0 = document.querySelectorAll('#screen-more .more-item').length; toggleMoreSort(); moveMoreItem('more-goals', -1); toggleMoreSort();
    return document.querySelectorAll('#screen-more .more-sec').length === 5 && document.querySelectorAll('#screen-more .more-item').length === n0; }), 'sắp xếp Cài đặt rồi thoát: vẫn 5 nhóm, đủ mục');
  ok(p.errs.length === 0, 'không lỗi JS', p.errs); await p.ctx.close();

  /* báo cáo: lọc ví + bấm nhóm + đổi kỳ năm */
  p = await page(browser, { tc_wallets: W, tc_txs: TX });
  ok(await p.evaluate(() => { showScreen('report'); setPeriod('month', document.createElement('button')); const s = document.getElementById('repWallet'); s.value = '1'; s.dispatchEvent(new Event('change'));
    const leg = [...document.querySelectorAll('#repDonut .leg-tap')].map(x => x.dataset.g); openRepGroup(leg[0]); const d = document.getElementById('repDetail').innerText;
    setPeriod('year', document.createElement('button')); const y = document.querySelectorAll('#repTrend .trend-tap').length; s.value = ''; s.dispatchEvent(new Event('change'));
    return leg.join() === 'Ăn uống,Đi lại' && /Ăn trưa/.test(d) && !/Cafe/.test(d) && y === 6; }), 'báo cáo lọc ví: nhóm, chi tiết đúng ví; kỳ năm vẫn bấm được cột');
  ok(p.errs.length === 0, 'không lỗi JS (báo cáo)', p.errs); await p.ctx.close();

  /* máy tính: chọn nhiều bằng chuột, thanh thao tác không che */
  p = await page(browser, { tc_wallets: W, tc_txs: TX }, { viewport: { width: 1400, height: 900 }, hasTouch: false, isMobile: false });
  ok(await p.evaluate(() => { showScreen('history'); setSelMode(true); document.querySelector('#historyList .tx-item').click(); const bar = document.getElementById('selBar').getBoundingClientRect(); const okb = document.getElementById('selCount').textContent === 'Đã chọn 1' && bar.width <= 560 && bar.right <= window.innerWidth; setSelMode(false); return okb; }), 'máy tính: chọn nhiều bằng chuột, thanh thao tác gọn bên phải');
  ok(p.errs.length === 0, 'không lỗi JS (máy tính)', p.errs); await p.ctx.close();

  /* giao diện sáng: chữ phần mới đủ tương phản */
  for (const sk of ['sky', 'red']) {
    p = await page(browser, { tc_wallets: W, tc_txs: TX, tc_skin: sk, tc_budgets: { 'Ăn uống': 1000000 } });
    const c = await p.evaluate(() => { const lum = c => { const m = c.match(/\d+(\.\d+)?/g).map(Number); const f = v => { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); }; return .2126 * f(m[0]) + .7152 * f(m[1]) + .0722 * f(m[2]); };
      const bgOf = el => { while (el) { const b = getComputedStyle(el).backgroundColor; if (b && !/rgba\(0, 0, 0, 0\)|transparent/.test(b)) { const a = b.match(/rgba\([^)]*,\s*([\d.]+)\)/); if (!a || +a[1] > .5) return b; } el = el.parentElement; } return 'rgb(255,255,255)'; };
      const ratio = el => { const a = lum(getComputedStyle(el).color), b = lum(bgOf(el)); return +((Math.max(a, b) + .05) / (Math.min(a, b) + .05)).toFixed(2); };
      const o = {}; showScreen('home'); o.today = ratio(document.querySelector('#todayLine span')); showScreen('accounts'); o.accN = ratio(document.querySelector('.acc-n')); o.accGh = ratio(document.querySelector('.acc-gh span'));
      showScreen('more'); o.sec = ratio(document.querySelector('.more-sec')); showScreen('history'); setSelMode(true); o.bar = ratio(document.querySelector('#selBar button')); setSelMode(false);
      showScreen('report'); setPeriod('month', document.createElement('button')); const dl = document.querySelector('.rep-delta'); o.delta = dl && dl.textContent ? ratio(dl) : 9; return o; });
    ok(Object.values(c).every(x => x >= 3), 'giao diện ' + sk + ': chữ phần mới v86 đủ tương phản (≥3:1)', c);
    ok(p.errs.length === 0, 'không lỗi JS (' + sk + ')', p.errs); await p.ctx.close();
  }
  console.log((fail ? fails.map(f => '✘ ' + f).join('\n') + '\n' : '') + '✔ Đạt: ' + pass + '   ✘ Lỗi: ' + fail);
  await browser.close(); process.exit(fail ? 1 : 0);
})();
