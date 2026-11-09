/* Kiểm thử v86 (ux3.js + lọc lịch sử). Chạy: python3 -m http.server 8765  rồi  node tests/ux3.js */
const { chromium } = require('playwright');
const BASE = process.env.BASE || 'http://localhost:8765/index.html';
let pass = 0, fail = 0; const fails = [];
function ok(c, n, x) { if (c) pass++; else { fail++; fails.push(n + (x !== undefined ? ' → ' + JSON.stringify(x).slice(0, 500) : '')); } }
const D = (d) => { const t = new Date(); t.setDate(t.getDate() + d); return t.toISOString().slice(0, 10); };
const M = (mo) => { const t = new Date(); t.setDate(3); t.setMonth(t.getMonth() + mo); return t.toISOString().slice(0, 10); };
(async () => {
  const browser = await chromium.launch(); const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('dialog', d => d.accept());
  const seed = { tc_wallets: [{ id: 1, name: 'Tiền mặt', type: 'cash', balance: 3000000 }, { id: 2, name: 'VCB', type: 'bank', balance: 20000000 }, { id: 3, name: 'Thẻ TD', type: 'credit', balance: -1000000, limit: 10000000 },
      { id: 4, name: 'Sổ TK', type: 'saving', balance: 50000000, rate: 5, termMonths: 6, depositDate: D(-30), maturityDate: D(150), payTiming: 'end', maturityAction: 'renew_all' }],
    tc_budgets: { 'Ăn uống': 3000000 },
    tc_txs: [{ id: 1, type: 'chi', amount: 85000, group: 'Ăn uống', item: 'Ăn trưa', walletId: 1, date: D(0), time: '12:00' },
      { id: 2, type: 'chi', amount: 900000, group: 'Dịch vụ sinh hoạt', item: 'Điện', walletId: 2, date: M(0), time: '09:00' },
      { id: 3, type: 'chi', amount: 400000, group: 'Ăn uống', item: 'Cafe', walletId: 2, date: M(0), time: '08:00' },
      { id: 4, type: 'chi', amount: 2000000, group: 'Ăn uống', item: 'Ăn trưa', walletId: 1, date: M(-1), time: '12:00' },
      { id: 5, type: 'thu', amount: 15000000, group: 'Lương', item: 'Lương', walletId: 2, date: M(0) },
      { id: 6, type: 'transfer', amount: 500000, fromName: 'VCB', toName: 'Tiền mặt', date: D(0), time: '07:00' },
      { id: 7, type: 'chi', amount: 300000, group: 'Đi lại', item: 'Xăng xe', walletId: 3, date: M(-3) }] };
  await p.addInitScript(s => { if (!sessionStorage.getItem('seeded')) { sessionStorage.setItem('seeded', '1'); localStorage.clear(); localStorage.setItem('tc_cloud_gate_skip', '1'); localStorage.setItem('tc_swipe_hint', '1');
    Object.entries(s).forEach(([k, v]) => localStorage.setItem(k, JSON.stringify(v))); } }, seed);
  await p.goto(BASE); await p.waitForTimeout(1300);

  /* 8 dòng Hôm nay */
  const T = await p.evaluate(() => document.getElementById('todayLine').innerText);
  ok(/Hôm nay đã chi 85k/.test(T) && /theo ngân sách|vượt|hết ngân sách/.test(T), '8 dòng Hôm nay: đã chi + so với ngân sách', T);
  ok(await p.evaluate(() => { document.getElementById('todayLine').click(); return currentScreen() === 'history' && histRes.length === 2 && histRes.every(t => t.date === todayStr()); }), '8b bấm dòng Hôm nay → lịch sử chỉ hôm nay');

  /* 6 lọc ví + khoảng ngày */
  const F = await p.evaluate(() => { clearHistF(); setHistF('wallet', '1'); const a = histRes.map(t => t.id).sort().join(); setHistF('wallet', ''); setHistF('month', 'range');
    const rangeShown = document.getElementById('hfRange').style.display; setHistF('from', addDays(todayStr(), -40)); setHistF('to', addDays(todayStr(), -1)); const b = histRes.length; clearHistF(); return { a, rangeShown, b, all: histRes.length }; });
  ok(F.a === '1,4,6' && F.rangeShown === 'flex' && F.all === 7 && F.b >= 1 && F.b < 7, '6 lọc theo ví (gồm cả chuyển ví) và khoảng ngày', F);

  /* 7 chọn nhiều */
  const S = await p.evaluate(() => { showScreen('history'); setSelMode(true); const rows = [...document.querySelectorAll('#historyList .tx-item')];
    const pick = it => rows.find(r => r.innerText.includes(it)); pick('Cafe').click(); pick('Điện').click();
    const r = { cnt: document.getElementById('selCount').textContent, bar: document.getElementById('selBar').classList.contains('show'), notEdit: currentScreen() === 'history' };
    selNoCF(); r.nocf = txs.find(t => t.id === 3).noCF && txs.find(t => t.id === 2).noCF && !document.getElementById('selBar').classList.contains('show');
    setSelMode(true); [...document.querySelectorAll('#historyList .tx-item')].find(x => x.innerText.includes('Cafe')).click(); selRecat(); document.getElementById('selCat').value = 'Ăn uống|||Ăn tiệm'; selRecatApply(); r.recat = txs.find(t => t.id === 3).item === 'Ăn tiệm';
    const b1 = wallets[0].balance; setSelMode(true); [...document.querySelectorAll('#historyList .tx-item')].filter(x => /Ăn trưa/.test(x.innerText)).forEach(x => x.click()); selDelete();
    r.del = !txs.some(t => t.item === 'Ăn trưa') && wallets[0].balance === b1 + 2085000;
    setSelMode(true); selAll(); r.all = document.getElementById('selCount').textContent === 'Đã chọn ' + histRes.length; setSelMode(false); return r; });
  ok(S.cnt === 'Đã chọn 2' && S.bar && S.notEdit && S.nocf && S.recat && S.del && S.all, '7 chọn nhiều: không tính thu chi, đổi hạng mục, xoá (hoàn ví), chọn tất cả', S);
  ok(await p.evaluate(() => { setSelMode(true); showScreen('home'); return !document.getElementById('selBar').classList.contains('show') && !document.body.classList.contains('hist-selecting'); }), '7b rời Lịch sử thì tự thoát chế độ chọn');

  /* 1 + 2 báo cáo */
  const R = await p.evaluate(() => { txs.forEach(t => delete t.noCF); saveAll(); showScreen('report'); setPeriod('month', document.createElement('button'));
    const r = { delta: document.querySelector('#repChi').parentNode.querySelector('.rep-delta').textContent, cmpHidden: document.getElementById('repCompare').style.display === 'none' };
    const leg = document.querySelector('#repDonut .leg-tap'); r.g = leg.dataset.g; leg.click(); r.detail = repDetailType === 'chi' && repOpenItems.size > 0;
    const cols = document.querySelectorAll('#repTrend .trend-tap'); cols[cols.length - 2].click(); r.month = document.getElementById('rangeLabel').textContent; return r; });
  ok(/kỳ trước|mới/.test(R.delta) && R.cmpHidden && R.detail && /Tháng/.test(R.month), '1–2 báo cáo: nhãn ▲▼ trong ô Chi, bấm tên nhóm mở chi tiết, bấm cột → tháng trước', R);
  const lbl0 = await p.evaluate(() => { setPeriod('month', document.createElement('button')); return document.getElementById('rangeLabel').textContent; });
  await p.evaluate(() => { const el = document.querySelector('#screen-report .summary-row'); const r = el.getBoundingClientRect(), y = r.top + 5;
    const T = (t, x) => new TouchEvent(t, { bubbles: true, touches: t === 'touchend' ? [] : [new Touch({ identifier: 2, target: el, clientX: x, clientY: y })], changedTouches: [new Touch({ identifier: 2, target: el, clientX: x, clientY: y })] });
    el.dispatchEvent(T('touchstart', 300)); el.dispatchEvent(T('touchend', 150)); });
  const lbl1 = await p.evaluate(() => document.getElementById('rangeLabel').textContent);
  ok(lbl0 !== lbl1, '1b vuốt trên Báo cáo đổi kỳ', { lbl0, lbl1 });
  ok(await p.evaluate(() => { setPeriod('month', document.createElement('button')); const d = document.querySelector('#repDonut .donut'); const r = d.getBoundingClientRect(); repDetailType = null; d.dispatchEvent(new MouseEvent('click', { bubbles: true, clientX: r.left + r.width / 2 + 2, clientY: r.top + 4 })); return repDetailType === 'chi'; }), '1c bấm lát bánh mở chi tiết');

  /* 3 + 4 ví tiền */
  const A = await p.evaluate(() => { showScreen('accounts'); const g = [...document.querySelectorAll('.acc-gh span')].map(x => x.textContent); const rows = document.querySelectorAll('.acc-row').length;
    document.querySelector('.acc-row').click(); const r = { g, rows, modal: document.getElementById('appModal').classList.contains('show'), txt: document.getElementById('appModalBody').innerText };
    closeAppModal(); setAccView('card'); r.card = document.querySelectorAll('.wcard').length === 4; setAccView('list'); r.back = document.querySelectorAll('.acc-row').length === 4; return r; });
  ok(A.g.join() === 'Tiền mặt & ngân hàng,Thẻ tín dụng,Tiết kiệm' && A.rows === 4 && A.modal && /Thu tháng này/.test(A.txt) && A.card && A.back, '3–4 ví: danh sách chia nhóm, bấm ví xem nhanh, chuyển dạng thẻ/danh sách', A);
  ok(await p.evaluate(() => { openWalletQuick(2); walletQuickXfer(2); return currentScreen() === 'add' && currentType === 'transfer' && document.getElementById('xferFrom').value === '2' && document.getElementById('xferTo').value !== '2'; }), '4b Chuyển tiền từ ví đã chọn');
  ok(await p.evaluate(() => { openWalletQuick(2); walletQuickAll ? walletQuickAll(2) : 0; return currentScreen() === 'history' && histF.wallet === '2' && histRes.every(t => String(t.walletId) === '2' || t.fromName === 'VCB' || t.toName === 'VCB'); }), '4c Xem tất cả giao dịch của ví');
  ok(await p.evaluate(() => { openWalletQuick(3); const t = document.getElementById('appModalBody').innerText; closeAppModal(); return /Trả nợ thẻ/.test(t) && /Dư nợ thẻ/.test(t); }), '4d thẻ tín dụng: hiện dư nợ + nút Trả nợ thẻ');

  /* 5 cài đặt chia nhóm */
  const C = await p.evaluate(() => { showScreen('more'); const secs = [...document.querySelectorAll('#screen-more .more-sec')].filter(h => h.style.display !== 'none').map(h => h.textContent);
    const s = document.getElementById('moreSearch'); s.value = 'vay ngân'; s.dispatchEvent(new Event('input', { bubbles: true })); return new Promise(res => setTimeout(() => { const vis = [...document.querySelectorAll('#screen-more .more-sec')].filter(h => h.style.display !== 'none').map(h => h.textContent); s.value = ''; s.dispatchEvent(new Event('input', { bubbles: true })); res({ secs, vis }); }, 100)); });
  ok(C.secs.join() === 'Ghi chép,Tiền & ví,Vay & nợ,Dữ liệu & bảo mật,Giao diện' && C.vis.join() === 'Vay & nợ', '5 cài đặt chia 5 nhóm; khi tìm chỉ hiện tiêu đề nhóm có kết quả', C);
  ok(errs.length === 0, 'không lỗi JS', errs);
  console.log((fail ? fails.map(f => '✘ ' + f).join('\n') + '\n' : '') + '✔ Đạt: ' + pass + '   ✘ Lỗi: ' + fail);
  await browser.close(); process.exit(fail ? 1 : 0);
})();
