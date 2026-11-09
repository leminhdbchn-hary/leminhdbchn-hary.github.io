/* Trường hợp biên v84: Lưu & ghi tiếp, nháp, mẫu, vuốt xoá, ngoại tệ, giao diện sáng. Chạy: python3 -m http.server 8765  rồi  node tests/edge84.js */
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
  const W = [{ id: 1, name: 'Tiền mặt', type: 'cash', balance: 5000000 }, { id: 2, name: 'VCB', type: 'bank', balance: 20000000 }];
  let p = await page(browser, { tc_wallets: W, tc_txs: [{ id: 1, type: 'chi', amount: 100000, group: 'Ăn uống', item: 'Ăn trưa', walletId: 1, date: D(0), time: '12:00' }],
    tc_templates: [{ id: 7, name: 'Cafe 30k', type: 'chi', group: 'Ăn uống', item: 'Cafe', amount: 30000, walletId: '2', note: '', person: '' }] });
  const r = await p.evaluate(() => { const o = {};
    /* E1 Lưu & ghi tiếp với Chuyển ví và Gia đình */
    showScreen('add'); setType('transfer'); document.getElementById('xferFrom').value = '2'; document.getElementById('xferTo').value = '1'; document.getElementById('amountInput').value = '1.000.000';
    let n = txs.length; saveAndNext(); o.xfer = txs.length === n + 1 && currentScreen() === 'add' && currentType === 'transfer' && wallets[0].balance === 6000000;
    setType('family'); document.getElementById('amountInput').value = '200.000'; n = txs.length; saveAndNext(); o.fam = txs.length === n + 1 && currentType === 'family';
    /* E2 đang sửa: Lưu & ghi tiếp = cập nhật, không tạo mới */
    openEditTx(1); document.getElementById('amountInput').value = '150.000'; n = txs.length; saveAndNext(); o.edit = txs.length === n && txs.find(t => t.id === 1).amount === 150000;
    /* E5 nháp trỏ tới ví/hạng mục đã xoá → bỏ qua, không lỗi */
    localStorage.setItem('tc_add_draft', JSON.stringify({ type: 'chi', amount: '77.000', note: 'x', wallet: '999', group: 'Không có', item: 'Abc', date: todayStr(), at: Date.now() }));
    showScreen('add'); o.badDraft = document.getElementById('amountInput').value === '77.000' && selectedItem === null && !!document.getElementById('accSelect').value;
    /* E3 có nháp mà bấm mẫu → ghi đúng mẫu, nháp bị xoá */
    n = txs.length; useTpl(7); o.tpl = txs.length === n + 1 && txs[0].amount === 30000 && txs[0].note === '' && !localStorage.getItem('tc_add_draft');
    /* E4 nháp của khoản Chuyển ví */
    showScreen('add'); setType('transfer'); document.getElementById('amountInput').value = '500.000'; document.getElementById('amountInput').dispatchEvent(new Event('input', { bubbles: true }));
    return o; });
  await p.waitForTimeout(400);
  r.xferDraft = await p.evaluate(() => { showScreen('home'); showScreen('add'); return currentType === 'transfer' && document.getElementById('amountInput').value === '500.000'; });
  await p.evaluate(() => discardDraft());
  ok(Object.values(r).every(Boolean), 'E1–E5 Lưu & ghi tiếp (chuyển ví, gia đình, đang sửa), nháp hỏng, nháp + mẫu, nháp chuyển ví', r);

  /* E10 ngoại tệ: ẩn nút số tiền nhanh để không lệch với số ngoại tệ */
  const fx = await p.evaluate(() => { showScreen('add'); setType('chi'); fxSet('USD', 10, 26000); const hid = getComputedStyle(document.getElementById('amtChips')).display === 'none'; fxSet('VND'); const back = getComputedStyle(document.getElementById('amtChips')).display !== 'none'; return { hid, back }; });
  ok(fx.hid && fx.back, 'E10 chọn ngoại tệ thì ẩn nút số tiền nhanh, về VND thì hiện lại', fx);
  /* E11 nút 000 không vượt giới hạn */
  ok(await p.evaluate(() => { const a = document.getElementById('amountInput'); a.value = '999.999.999'; appendZeros(); appendZeros(); return parseInt(a.value.replace(/\D/g, '')) <= 999999999999; }), 'E11 nút 000 có giới hạn');
  /* E6 vuốt xoá trong bảng chi tiết Báo cáo: nút "Không tính thu chi" vẫn hiện; xoá được */
  const rp = await p.evaluate(() => { showScreen('report'); setPeriod('month', document.createElement('button')); if (repDetailType !== 'chi') toggleRepDetail('chi');
    const row = document.querySelector('#repDetail .rep-top .tx-item'); const nocf = document.querySelector('#repDetail .rep-nocf'); const n = txs.length;
    row.classList.add('swiped'); row.querySelector('.icon-btn[aria-label="Xoá"]').click(); return { nocfVis: !!nocf && getComputedStyle(nocf).display !== 'none', deleted: txs.length === n - 1 }; });
  ok(rp.nocfVis && rp.deleted, 'E6 Báo cáo: nút Không tính thu chi vẫn hiện; vuốt xoá được', rp);
  /* vuốt xoá ở danh sách Tổng quan */
  ok(await p.evaluate(() => { showScreen('home'); const row = document.querySelector('#recentList .tx-item'); if (!row) return false; const n = txs.length; row.classList.add('swiped'); row.querySelector('.icon-btn[aria-label="Xoá"]').click(); return txs.length === n - 1; }), 'E6b vuốt xoá ở danh sách Tổng quan');
  ok(p.errs.length === 0, 'không lỗi JS', p.errs); await p.ctx.close();

  /* E7–E8 giao diện sáng (Xanh trắng, Đỏ trắng, tự động) với các phần mới: đọc được chữ */
  for (const sk of ['sky', 'red', 'auto']) {
    p = await page(browser, { tc_wallets: W, tc_skin: sk, tc_budgets: { 'Ăn uống': 1000000 }, tc_txs: [{ id: 1, type: 'chi', amount: 300000, group: 'Ăn uống', item: 'Ăn trưa', walletId: 1, date: D(0) }],
      tc_debts: [{ id: 1, dir: 'out', person: 'Nam', amount: 1000000, date: D(-1), dueDate: D(2), status: 'pending' }] }, { colorScheme: 'light' });
    const c = await p.evaluate(() => { const lum = c => { const m = c.match(/\d+(\.\d+)?/g).map(Number); const f = v => { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); }; return .2126 * f(m[0]) + .7152 * f(m[1]) + .0722 * f(m[2]); };
      const bgOf = el => { while (el) { const b = getComputedStyle(el).backgroundColor; if (b && !/rgba\(0, 0, 0, 0\)|transparent/.test(b)) return b; el = el.parentElement; } return 'rgb(255,255,255)'; };
      const ratio = el => { const a = lum(getComputedStyle(el).color), b = lum(bgOf(el)); return (Math.max(a, b) + .05) / (Math.min(a, b) + .05); };
      const out = {}; showScreen('home'); out.budget = ratio(document.querySelector('#homeBudget .hb-top')); out.debt = ratio(document.querySelector('#debtCard .dc-lb'));
      showScreen('add'); out.tool = ratio(document.querySelector('#addTools button')); out.chip = ratio(document.querySelector('#amtChips button')); out.light = !document.documentElement.classList.contains('skin-gold') && getSkin() !== 'gold';
      return out; });
    ok(c.light && ['budget', 'debt', 'tool', 'chip'].every(k => c[k] >= 3), 'E7 giao diện ' + sk + ': chữ phần mới đủ tương phản (≥3:1)', c);
    ok(p.errs.length === 0, 'không lỗi JS (' + sk + ')', p.errs); await p.ctx.close();
  }
  console.log((fail ? fails.map(f => '✘ ' + f).join('\n') + '\n' : '') + '✔ Đạt: ' + pass + '   ✘ Lỗi: ' + fail);
  await browser.close(); process.exit(fail ? 1 : 0);
})();
