/* Kiểm thử v84 (ux2.js + giao diện tự động). Chạy: python3 -m http.server 8765  rồi  node tests/ux2.js */
const { chromium } = require('playwright');
const BASE = process.env.BASE || 'http://localhost:8765/index.html';
let pass = 0, fail = 0; const fails = [];
function ok(c, n, x) { if (c) pass++; else { fail++; fails.push(n + (x !== undefined ? ' → ' + JSON.stringify(x).slice(0, 500) : '')); } }
const D = (d) => { const t = new Date(); t.setDate(t.getDate() + d); return t.toISOString().slice(0, 10); };
async function page(browser, seed, opts) {
  const ctx = await browser.newContext(Object.assign({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true }, opts || {}));
  const p = await ctx.newPage(); p.errs = []; p.on('pageerror', e => p.errs.push(e.message)); p.on('dialog', d => d.accept());
  await p.addInitScript(s => { if (!sessionStorage.getItem('seeded')) { sessionStorage.setItem('seeded', '1'); localStorage.clear(); localStorage.setItem('tc_cloud_gate_skip', '1'); localStorage.setItem('tc_swipe_hint', '1');
    Object.entries(s).forEach(([k, v]) => localStorage.setItem(k, JSON.stringify(v))); } }, seed);
  await p.goto(BASE); await p.waitForTimeout(1200); p.ctx = ctx; return p;
}
(async () => {
  const browser = await chromium.launch();
  const W = [{ id: 1, name: 'Tiền mặt', type: 'cash', balance: 5000000 }, { id: 2, name: 'VCB', type: 'bank', balance: 20000000 }];
  let p = await page(browser, { tc_wallets: W, tc_budgets: { 'Ăn uống': 3000000, 'Đi lại': 1000000 },
    tc_txs: [{ id: 1, type: 'chi', amount: 1000000, group: 'Ăn uống', item: 'Ăn trưa', walletId: 2, date: D(0), time: '12:30' }, { id: 2, type: 'transfer', amount: 500000, fromName: 'VCB', toName: 'Tiền mặt', date: D(0), time: '08:00' }] });

  /* 1. bố cục màn Thêm */
  const L = await p.evaluate(() => { showScreen('add'); const kids = [...document.querySelector('#screen-add .inner').children].map(e => e.id || e.className.split(' ')[0]);
    const idx = k => kids.indexOf(k); return { kids, amountBeforeNote: document.querySelector('.amount-card').compareDocumentPosition(document.getElementById('noteInput')) & 4,
      order: idx('amount-card') < idx('normalFields') && idx('normalFields') < idx('noCfRow') && idx('addTools') < idx('amount-card'), qeHidden: getComputedStyle(document.getElementById('qeBar')).display === 'none',
      smsHidden: getComputedStyle(document.querySelector('.sms-open')).display === 'none', debtHidden: getComputedStyle(document.getElementById('debtQuick')).display === 'none' }; });
  ok(L.order && L.amountBeforeNote && L.qeHidden && L.smsHidden && L.debtHidden, '1 màn Thêm: công cụ gọn → số tiền → ví/hạng mục → không tính thu chi', L);
  ok(await p.evaluate(() => { toggleQuickEntry(); const a = getComputedStyle(document.getElementById('qeBar')).display !== 'none'; toggleQuickEntry(); return a && localStorage.getItem('tc_qe_open') === '0'; }), '1b bấm ⚡ Nhập nhanh: hiện/ẩn ô, nhớ lựa chọn');

  /* 2. gợi ý số tiền */
  ok(await p.evaluate(() => { setQuickAmount(50000); const a = document.getElementById('amountInput').value; document.getElementById('amountInput').value = '35'; appendZeros(); return a === '50.000' && document.getElementById('amountInput').value === '35.000'; }), '2 gợi ý 50k và nút 000');

  /* 3. Lưu & ghi tiếp + hoàn tác */
  const S = await p.evaluate(() => { showScreen('add'); setType('chi'); document.getElementById('accSelect').value = '2'; pickCat('Ăn uống', 'Cafe'); setQuickAmount(30000); const n = txs.length, b = wallets[1].balance;
    saveAndNext(); const r = { saved: txs.length === n + 1, stay: currentScreen() === 'add', type: currentType === 'chi', wallet: document.getElementById('accSelect').value === '2', empty: document.getElementById('amountInput').value === '', info: document.getElementById('addInfo').innerText };
    undoLastSaved(); r.undo = txs.length === n && wallets[1].balance === b; return r; });
  ok(S.saved && S.stay && S.type && S.wallet && S.empty && /Đã lưu Cafe/.test(S.info) && S.undo, '3 Lưu & ghi tiếp: ở lại, giữ ví, xoá ô; hoàn tác được', S);
  ok(await p.evaluate(() => { showScreen('add'); const n = txs.length; saveAndNext(); return txs.length === n && currentScreen() === 'add'; }), '3b thiếu số tiền thì không lưu, không lỗi');

  /* 4. dòng phụ: ví · giờ */
  const T = await p.evaluate(() => { showScreen('history'); return document.getElementById('historyList').innerText; });
  ok(/VCB · 12:30/.test(T) && !/\d{4}-\d{2}-\d{2}/.test(T), '4 dòng phụ hiện "VCB · 12:30", không còn ngày dạng 2026-11-09', T.slice(0, 300));

  /* 5. vuốt để xoá (điện thoại cảm ứng) */
  ok(await p.evaluate(() => { const r = document.querySelector('#historyList .tx-item'); return getComputedStyle(r.querySelector('.icon-btn[aria-label="Xoá"]')).display === 'none' && getComputedStyle(r.querySelector('.icon-btn[aria-label="Sửa"]')).display === 'none'; }), '5 điện thoại: ẩn nút ✎/🗑 trên mỗi dòng');
  const row = await p.$('#historyList .tx-item'); const bx = await row.boundingBox();
  await p.evaluate(([x, y]) => { const el = document.elementFromPoint(x, y); const mk = (t, cx) => new TouchEvent(t, { bubbles: true, touches: t === 'touchend' ? [] : [new Touch({ identifier: 1, target: el, clientX: cx, clientY: y })] });
    el.dispatchEvent(mk('touchstart', x)); el.dispatchEvent(mk('touchmove', x - 30)); el.dispatchEvent(mk('touchmove', x - 90)); el.dispatchEvent(mk('touchend', x - 90)); }, [bx.x + bx.width - 120, bx.y + bx.height / 2]);
  const sw = await p.evaluate(() => { const r = document.querySelector('#historyList .tx-item.swiped'); return r ? getComputedStyle(r.querySelector('.icon-btn[aria-label="Xoá"]')).display : null; });
  ok(sw === 'flex', '5b vuốt trái → hiện nút Xoá', sw);
  ok(await p.evaluate(() => { const r = document.querySelector('#historyList .tx-item.swiped'); r.querySelector('.tx-info').click(); return !r.classList.contains('swiped') && currentScreen() === 'history'; }), '5c đang hiện Xoá mà bấm dòng → chỉ thu lại, không mở sửa');
  ok(await p.evaluate(() => { const r = [...document.querySelectorAll('#historyList .tx-item')].find(x => /Chuyển/.test(x.innerText)); r.querySelector('.tx-info').click(); const ok = currentScreen() === 'add' && editingTxId === 2; cancelEditTx(); return ok; }), '5d bấm dòng chuyển ví → mở sửa');
  ok(await p.evaluate(() => { const n = txs.length; showScreen('history'); const r = document.querySelector('#historyList .tx-item'); r.classList.add('swiped'); r.querySelector('.icon-btn[aria-label="Xoá"]').click(); return txs.length === n - 1; }), '5e bấm Xoá → xoá giao dịch');

  /* 6. thanh ngân sách */
  const B = await p.evaluate(() => { showScreen('home'); const e = document.getElementById('homeBudget'); return { shown: e.style.display, cls: e.className, txt: e.innerText }; });
  ok(B.shown === 'block' && /Ngân sách tháng/.test(B.txt) && /mỗi ngày nên chi tối đa|Đã vượt/.test(B.txt), '6 thanh ngân sách tháng + gợi ý mỗi ngày', B);
  ok(await p.evaluate(() => { txs.unshift({ id: 99, type: 'chi', amount: 9000000, group: 'Ăn uống', item: 'Ăn trưa', walletId: 1, date: todayStr() }); renderHome(); const e = document.getElementById('homeBudget'); return /over/.test(e.className) && /Đã vượt/.test(e.innerText); }), '6b vượt ngân sách → đỏ, báo số vượt');
  ok(await p.evaluate(() => { const b = budgets; budgets = {}; renderHome(); const h = document.getElementById('homeBudget').style.display === 'none'; budgets = b; renderHome(); return h; }), '6c chưa đặt ngân sách thì ẩn');

  /* 7. Sắp đến hạn không nhắc lại khoản cho vay */
  ok(await p.evaluate(() => { debts.push({ id: 5, dir: 'out', person: 'Nam', amount: 2000000, date: todayStr(), dueDate: todayStr(), status: 'pending' }); renderHome();
    const rc = document.getElementById('remindCard'); return /Nam/.test(document.getElementById('debtCard').innerText) && !(rc.style.display !== 'none' && /Nam/.test(rc.innerText)); }), '7 khoản cho vay chỉ hiện ở thẻ Cho vay & vay nợ, không lặp ở Sắp đến hạn');

  /* 9. giữ nháp */
  await p.evaluate(() => { showScreen('add'); setType('chi'); pickCat('Đi lại', 'Xăng xe'); });
  await p.fill('#amountInput', '120000'); await p.fill('#noteInput', 'đổ xăng'); await p.waitForTimeout(450);
  await p.evaluate(() => showScreen('home')); await p.evaluate(() => showScreen('add')); await p.waitForTimeout(150);
  const Dr = await p.evaluate(() => ({ amt: document.getElementById('amountInput').value, note: document.getElementById('noteInput').value, item: selectedItem, info: document.getElementById('addInfo').innerText }));
  ok(/120/.test(Dr.amt) && Dr.note === 'đổ xăng' && Dr.item === 'Xăng xe' && /khôi phục/.test(Dr.info), '9 thoát ra rồi vào lại: còn số tiền, ghi chú, hạng mục', Dr);
  ok(await p.evaluate(() => { saveTx(); return !localStorage.getItem('tc_add_draft'); }), '9b lưu xong thì xoá nháp');
  await p.evaluate(() => showScreen('add')); await p.fill('#noteInput', 'nháp bỏ'); await p.waitForTimeout(450); await p.evaluate(() => { showScreen('home'); showScreen('add'); }); await p.waitForTimeout(100);
  ok(await p.evaluate(() => { discardDraft(); return !localStorage.getItem('tc_add_draft') && document.getElementById('noteInput').value === ''; }), '9c bấm Bỏ nháp → xoá sạch');
  ok(await p.evaluate(() => { openEditTx(txs[0].id); document.getElementById('noteInput').value = 'sửa'; document.getElementById('noteInput').dispatchEvent(new Event('input', { bubbles: true })); return new Promise(r => setTimeout(() => { const d = localStorage.getItem('tc_add_draft'); cancelEditTx(); r(!d); }, 400)); }), '9d đang sửa giao dịch cũ thì không lưu nháp');
  ok(p.errs.length === 0, 'không lỗi JS (điện thoại)', p.errs); await p.ctx.close();

  /* 5f máy tính: vẫn có nút ✎/🗑 */
  p = await page(browser, { tc_wallets: W, tc_txs: [{ id: 1, type: 'chi', amount: 1000, group: 'Ăn uống', item: 'Ăn trưa', walletId: 1, date: D(0) }] }, { viewport: { width: 1400, height: 900 }, hasTouch: false, isMobile: false });
  ok(await p.evaluate(() => { showScreen('history'); return getComputedStyle(document.querySelector('#historyList .tx-item .icon-btn[aria-label="Xoá"]')).display !== 'none'; }), '5f máy tính vẫn hiện nút sửa/xoá');
  ok(p.errs.length === 0, 'không lỗi JS (máy tính)', p.errs); await p.ctx.close();

  /* 8. giao diện tự động theo máy */
  for (const [scheme, want] of [['light', 'sky'], ['dark', 'gold']]) {
    p = await page(browser, { tc_wallets: W }, { colorScheme: scheme });
    const r = await p.evaluate(() => { chooseSkin('auto'); return { pref: getSkinPref(), skin: getSkin(), sky: document.documentElement.classList.contains('skin-sky'), active: document.querySelector('.skin-opt.active') && document.querySelector('.skin-opt.active').dataset.skin }; });
    ok(r.pref === 'auto' && r.skin === want && r.sky === (want === 'sky') && r.active === 'auto', '8 tự động theo máy (' + scheme + ' → ' + want + ')', r);
    if (scheme === 'light') { await p.emulateMedia({ colorScheme: 'dark' }); await p.waitForTimeout(200); ok(await p.evaluate(() => getSkin() === 'gold' && !document.documentElement.classList.contains('skin-sky')), '8b điện thoại đổi sang tối → app tự đổi theo'); }
    await p.ctx.close();
  }
  console.log((fail ? fails.map(f => '✘ ' + f).join('\n') + '\n' : '') + '✔ Đạt: ' + pass + '   ✘ Lỗi: ' + fail);
  await browser.close(); process.exit(fail ? 1 : 0);
})();
