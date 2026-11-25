/* Kiểm thử v104: nhập nhanh nhận ra ví (vcb, thẻ td, vikki…) + bấm Xong là lưu. Chạy: python3 -m http.server 8765  rồi  node tests/qewallet.js */
const { chromium } = require('playwright');
const BASE = process.env.BASE || 'http://localhost:8765/index.html';
let pass = 0, fail = 0; const fails = [];
function ok(c, n, x) { if (c) pass++; else { fail++; fails.push(n + (x !== undefined ? ' → ' + JSON.stringify(x).slice(0, 500) : '')); } }
const W = [{ id: 1, name: 'Tiền mặt', type: 'cash', balance: 1000000 }, { id: 2, name: 'Vietcombank', type: 'bank', balance: 5000000, bankCode: 'VCB', bankName: 'Vietcombank' },
  { id: 3, name: 'Thẻ TD VCB', type: 'credit', balance: 0, bankCode: 'VCB', limit: 50000000 }, { id: 4, name: 'Vikki', type: 'bank', balance: 2000000 },
  { id: 5, name: 'Techcombank', type: 'bank', balance: 3000000 }, { id: 6, name: 'MoMo', type: 'ewallet', balance: 500000 }, { id: 7, name: 'Sổ TK VCB', type: 'saving', balance: 9000000 }];
(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('dialog', d => d.accept());
  await p.addInitScript(w => { if (!sessionStorage.getItem('s')) { sessionStorage.setItem('s', '1'); localStorage.clear(); ['tc_cloud_gate_skip', 'tc_onboarded', 'tc_swipe_hint'].forEach(k => localStorage.setItem(k, '1')); localStorage.setItem('tc_last_backup', String(Date.now())); localStorage.setItem('tc_wallets', JSON.stringify(w)); localStorage.setItem('tc_txs', '[]'); } }, W);
  await p.goto(BASE); await p.waitForTimeout(1500);
  await p.evaluate(() => { showScreen('add'); setType('chi'); });
  const P = s => p.evaluate(s => { const r = qeParse(s); return { a: r.amount, t: r.type, it: r.item, w: r.walletId, wn: r.walletName, note: r.note }; }, s);
  let r = await P('10k cf VCB');
  ok(r.a === 10000 && r.it === 'Cafe' && r.w === 2 && r.note === '', '1 "10k cf VCB" → 10.000 · Cafe · ví Vietcombank, không ghi chú thừa', r);
  r = await P('50k xăng thẻ TD');
  ok(r.a === 50000 && r.it === 'Xăng xe' && r.w === 3, '2 "50k xăng thẻ TD" → ví Thẻ tín dụng', r);
  r = await P('35k cf thẻ td vcb');
  ok(r.w === 3, '3 "thẻ td vcb" → chọn thẻ tín dụng VCB, không phải tài khoản VCB', r);
  r = await P('200k ăn trưa vikki');
  ok(r.a === 200000 && r.w === 4 && r.it === 'Ăn trưa', '4 "200k ăn trưa vikki" → ví Vikki', r);
  r = await P('30k cf tcb'); ok(r.w === 5, '5 "tcb" → Techcombank', r);
  r = await P('45k grab momo'); ok(r.w === 6, '6 "momo" → ví MoMo', r);
  r = await P('20k bánh mì tiền mặt'); ok(r.w === 1 && r.a === 20000, '7 "tiền mặt" → ví Tiền mặt', r);
  r = await P('20k bánh mì tm'); ok(r.w === 1, '7b "tm" → Tiền mặt', r);
  r = await P('25k cafe'); ok(!r.w && r.it === 'Cafe', '8 không nhắc ví → giữ ví đang chọn', r);
  r = await P('lương 15tr vcb'); ok(r.t === 'thu' && r.a === 15000000 && r.w === 2, '9 "lương 15tr vcb" → Thu · Vietcombank', r);
  r = await P('100k gửi sổ tk vcb'); ok(r.w !== 7, '10 không chọn ví tiết kiệm', r);
  /* gõ vào ô rồi bấm Xong → lưu luôn */
  const s = await p.evaluate(async () => {
    if (document.getElementById('qeBar').classList.contains('qe-collapsed')) toggleQuickEntry();
    const i = document.getElementById('qeInput'); i.value = '10k cf VCB'; i.dispatchEvent(new Event('input')); await new Promise(r => setTimeout(r, 400));
    const shownW = document.getElementById('accSelect').value, hint = document.getElementById('qeHint').innerText;
    const n = txs.length, b0 = wallets.find(w => w.id === 2).balance;
    i.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true })); await new Promise(r => setTimeout(r, 300));
    const t = txs[0];
    return { shownW, hint, saved: txs.length === n + 1, amt: t && t.amount, item: t && t.item, wid: t && t.walletId, bal: wallets.find(w => w.id === 2).balance === b0 - 10000, cleared: i.value === '', undo: /Hoàn tác/.test(document.getElementById('addInfo').innerText), screen: currentScreen() };
  });
  ok(s.shownW === '2' && /ví Vietcombank/.test(s.hint), '11 gõ "10k cf VCB": tự chọn ví Vietcombank, gợi ý hiện "ví Vietcombank"', s);
  ok(s.saved && s.amt === 10000 && s.item === 'Cafe' && String(s.wid) === '2' && s.bal && s.cleared && s.undo && s.screen === 'add', '12 bấm Xong: lưu luôn, trừ ví VCB, xoá ô, có nút Hoàn tác, vẫn ở màn Thêm để ghi tiếp', s);
  const u = await p.evaluate(async () => { const n = txs.length; undoLastSaved(); return txs.length === n - 1; });
  ok(u, '13 Hoàn tác xoá khoản vừa lưu');
  const m = await p.evaluate(async () => { showScreen('add'); setType('chi'); if (document.getElementById('qeBar').classList.contains('qe-collapsed')) toggleQuickEntry(); const i = document.getElementById('qeInput'); i.value = 'cf vcb'; const n = txs.length; i.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true })); await new Promise(r => setTimeout(r, 300)); return { notSaved: txs.length === n, kept: i.value === 'cf vcb' }; });
  ok(m.notSaved && m.kept, '14 thiếu số tiền: bấm Xong KHÔNG lưu, chỉ điền sẵn', m);
  ok(errs.length === 0, '15 không lỗi JS', errs);
  await browser.close();
  console.log('✔ Đạt: ' + pass + '   ✘ Lỗi: ' + fail); fails.forEach(f => console.log('  ✗ ' + f)); process.exit(fail ? 1 : 0);
})();
