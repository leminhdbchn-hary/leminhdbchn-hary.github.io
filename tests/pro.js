/* Kiểm thử v93 (pro.js + giao diện chuyên nghiệp). Chạy: python3 -m http.server 8765  rồi  node tests/pro.js */
const { chromium } = require('playwright');
const BASE = process.env.BASE || 'http://localhost:8765/index.html';
let pass = 0, fail = 0; const fails = [];
function ok(c, n, x) { if (c) pass++; else { fail++; fails.push(n + (x !== undefined ? ' → ' + JSON.stringify(x).slice(0, 500) : '')); } }
const D = (d) => { const t = new Date(); t.setDate(t.getDate() + d); return t.toISOString().slice(0, 10); };
async function page(browser, seed, opts) {
  const ctx = await browser.newContext(Object.assign({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true }, opts || {}));
  const p = await ctx.newPage(); p.errs = []; p.native = 0; p.on('pageerror', e => p.errs.push(e.message)); p.on('dialog', d => { p.native++; d.accept(); });
  await p.addInitScript(s => { window.__proOn = true; if (!sessionStorage.getItem('seeded')) { sessionStorage.setItem('seeded', '1'); localStorage.clear(); localStorage.setItem('tc_cloud_gate_skip', '1'); localStorage.setItem('tc_swipe_hint', '1');
    Object.entries(s).forEach(([k, v]) => localStorage.setItem(k, typeof v === 'string' ? v : JSON.stringify(v))); } }, seed);
  await p.goto(BASE); await p.waitForTimeout(1300); p.ctx = ctx; return p;
}
(async () => {
  const browser = await chromium.launch();
  const W = [{ id: 1, name: 'Tiền mặt', type: 'cash', balance: 3000000 }, { id: 2, name: 'VCB', type: 'bank', balance: 20000000 }];
  const TX = []; for (let i = 0; i < 30; i++) TX.push({ id: i + 1, type: 'chi', amount: 50000 + i * 1000, group: i % 2 ? 'Ăn uống' : 'Đi lại', item: i % 2 ? 'Ăn trưa' : 'Xăng xe', walletId: 1, date: D(-i), time: '12:00' });
  TX.push({ id: 99, type: 'thu', amount: 15000000, group: 'Lương', item: 'Lương', walletId: 2, date: D(0) });
  let p = await page(browser, { tc_wallets: W, tc_txs: TX, tc_onboarded: '1' });

  /* 12 màn khởi động tự ẩn */
  ok(await p.evaluate(() => { const s = document.getElementById('splash'); return !!s && getComputedStyle(s).visibility === 'hidden' && getComputedStyle(s).pointerEvents === 'none'; }), '12 màn khởi động hiện rồi tự ẩn, không chặn thao tác');
  /* 2 số tiền: VND nhỏ, chữ số đều */
  ok(await p.evaluate(() => { const a = document.querySelector('#recentList .tx-amt'); return !!a.querySelector('.cur-u') && /VND$/.test(a.textContent.trim()) && getComputedStyle(document.body).fontVariantNumeric.includes('tabular-nums'); }), '2 số tiền: chữ "VND" tách nhỏ, chữ số đều nhau');
  /* 11 hộp thoại của app: xác nhận xoá ví */
  await p.evaluate(() => { showScreen('accounts'); setAccView('card'); }); await p.waitForTimeout(200);
  await p.evaluate(() => openWalletEdit(2)); await p.click('.we-del'); await p.waitForTimeout(150);
  const d1 = await p.evaluate(() => ({ shown: document.getElementById('appDlg').classList.contains('show'), msg: document.querySelector('.app-dlg-msg').innerText, still: wallets.some(w => w.id === 2), danger: document.querySelector('.app-dlg-ok').classList.contains('danger') }));
  ok(d1.shown && /Xoá ví/.test(d1.msg) && d1.still && d1.danger && p.native === 0, '11 xoá ví: hiện hộp xác nhận kiểu app (nút đỏ), chưa xoá', d1);
  await p.click('#appDlgNo'); await p.waitForTimeout(100);
  ok(await p.evaluate(() => wallets.some(w => w.id === 2) && !document.getElementById('appDlg').classList.contains('show')), '11b bấm Huỷ: không xoá');
  await p.evaluate(() => openWalletEdit(2)); await p.click('.we-del'); await p.waitForTimeout(150); await p.click('#appDlgOk'); await p.waitForTimeout(200);
  ok(await p.evaluate(() => !wallets.some(w => w.id === 2)) && p.native === 0, '11c bấm Đồng ý: xoá đúng ví, không hiện hộp của trình duyệt');
  /* 11 nhập liệu: lưu mẫu */
  await p.evaluate(() => { showScreen('add'); setType('chi'); pickCat('Ăn uống', 'Cafe'); setQuickAmount(30000); }); await p.waitForTimeout(100);
  await p.click('#tplBar .tpl-chip.add'); await p.waitForTimeout(150);
  await p.fill('#appDlgIn', 'Cà phê sáng'); await p.click('#appDlgOk'); await p.waitForTimeout(200);
  ok(await p.evaluate(() => txTemplates.length === 1 && txTemplates[0].name === 'Cà phê sáng') && p.native === 0, '11d nhập tên mẫu bằng hộp nhập của app');
  /* 11 thông báo */
  await p.evaluate(() => { localStorage.removeItem('tc_add_draft'); showScreen('add'); setType('chi'); document.getElementById('amountInput').value = ''; }); await p.click('#saveTxBtn'); await p.waitForTimeout(150);
  ok(await p.evaluate(() => document.getElementById('appDlg').classList.contains('show') && /số tiền/i.test(document.querySelector('.app-dlg-msg').innerText)) && p.native === 0, '11e thông báo lỗi dùng hộp của app');
  await p.click('#appDlgOk');
  /* 11 không có thao tác bấm gần đây → dùng hộp trình duyệt cho an toàn */
  await p.waitForTimeout(4200); const n0 = p.native; const r0 = await p.evaluate(() => confirm('test?')); ok(p.native === n0 + 1 && r0 === true, '11f gọi tự động (không có thao tác bấm) → dùng hộp trình duyệt, vẫn chạy đúng');
  /* 3 tiêu đề dính + thu nhỏ khi cuộn */
  await p.evaluate(() => showScreen('history')); await p.waitForTimeout(300); await p.evaluate(() => window.scrollTo(0, 900)); await p.waitForTimeout(250);
  const st = await p.evaluate(() => { const h = document.querySelector('#screen-history .scr-head'); const r = h.getBoundingClientRect(); return { scrolled: document.body.classList.contains('scrolled'), top: Math.round(r.top), fs: getComputedStyle(h.querySelector('.screen-title')).fontSize }; });
  ok(st.scrolled && st.top <= 2 && st.fs === '17px', '3 cuộn xuống: tiêu đề dính trên cùng, thu nhỏ', st);
  /* 4 biểu đồ tông vàng */
  const g = await p.evaluate(async () => { showScreen('report'); setPeriod('month', document.createElement('button')); await new Promise(r => setTimeout(r, 30)); const dots = [...document.querySelectorAll('#repDonut .donut-legend i')].map(i => i.style.background); return { dots, bg: document.querySelector('#repDonut .donut').style.background }; });
  ok(g.dots.length >= 2 && g.dots.every(c => /226, 194, 139|201, 164, 106|176, 136, 80|#e2c28b|#c9a46a/.test(c)) && /226, 194, 139|#e2c28b/.test(g.bg), '4 biểu đồ cơ cấu chi tiêu dùng tông vàng', g);
  /* 7 số tiền chạy */
  const c = await p.evaluate(async () => { showScreen('home'); const before = document.getElementById('mChi').textContent; txs.unshift({ id: 500, type: 'chi', amount: 1000000, group: 'Ăn uống', item: 'Ăn trưa', walletId: 1, date: todayStr() }); renderHome();
    await new Promise(r => setTimeout(r, 120)); const mid = document.getElementById('mChi').textContent; await new Promise(r => setTimeout(r, 600)); return { before, mid, end: document.getElementById('mChi').textContent }; });
  ok(c.mid !== c.end && c.end !== c.before && parseInt(c.end.replace(/\D/g, '')) - parseInt(c.before.replace(/\D/g, '')) === 1000000, '7 số tiền "chạy" tới giá trị mới', c);
  /* 8 kéo xuống để làm mới */
  await p.evaluate(() => { window.scrollTo(0, 0); window.__t = document.getElementById('miniToast').textContent; });
  await p.evaluate(() => { const el = document.querySelector('#screen-home .balance-card'); const r = el.getBoundingClientRect(); const T = (t, y) => new TouchEvent(t, { bubbles: true, touches: t === 'touchend' ? [] : [new Touch({ identifier: 7, target: el, clientX: 200, clientY: y })] });
    el.dispatchEvent(T('touchstart', r.top + 10)); el.dispatchEvent(T('touchmove', r.top + 120)); el.dispatchEvent(T('touchmove', r.top + 260)); el.dispatchEvent(T('touchend', r.top + 260)); });
  const busy = await p.evaluate(() => document.body.classList.contains('is-refreshing')); await p.waitForTimeout(900);
  ok(busy && await p.evaluate(() => /Đã cập nhật|đồng bộ/.test(document.getElementById('miniToast').textContent) && !document.body.classList.contains('is-refreshing')), '8 kéo xuống ở Tổng quan → khung chờ → "Đã cập nhật"');
  /* 13 tự khoá + 14 giới thiệu */
  const a = await p.evaluate(() => { localStorage.setItem('tc_pin_hash', 'x'); renderHome(); showScreen('more'); const vis = getComputedStyle(document.getElementById('more-autolock')).display !== 'none';
    openAutoLock(); const n = document.querySelectorAll('#appModalBody .is-opt').length; setAutoLock(5); const ms = autoLockMs(); openAbout(); return { vis, n, ms }; });
  await p.waitForTimeout(200); const ab = await p.evaluate(() => document.getElementById('appModalBody').innerText); await p.evaluate(() => { closeAppModal(); localStorage.removeItem('tc_pin_hash'); });
  const ver = await p.evaluate(() => APP_VERSION);
  ok(a.vis && a.n === 4 && a.ms === 300000 && ab.includes('Phiên bản ' + ver) && /Dữ liệu của bạn ở đâu/.test(ab) && /Tự khoá: sau 5 phút/.test(ab), '13–14 tự khoá chọn được 4 mức; trang Giới thiệu & Bảo mật', { a, ab: ab.slice(0, 200) });
  ok(await p.evaluate(() => { showScreen('more'); return [...document.querySelectorAll('#screen-more .more-sec')].map(h => h.textContent).includes('Dữ liệu & bảo mật') && !!document.getElementById('more-about').offsetParent; }), '14b mục Giới thiệu nằm trong nhóm Dữ liệu & bảo mật');
  ok(p.errs.length === 0, 'không lỗi JS', p.errs); await p.ctx.close();

  /* 9 + 10 người dùng mới: màn chào 3 bước, màn trống có hướng dẫn */
  p = await page(browser, {});
  await p.waitForFunction(() => document.getElementById('onb') && document.getElementById('onb').classList.contains('show'), null, { timeout: 6000 }).catch(() => {});
  ok(await p.evaluate(() => document.getElementById('onb').classList.contains('show')), '10 người dùng mới: hiện màn chào');
  await p.fill('#onbName', 'Ví chính'); await p.fill('#onbBal', '2500000'); await p.click('.onb-next'); await p.waitForTimeout(100);
  const picks = await p.evaluate(() => document.querySelectorAll('.onb-pick.on').length); await p.click('.onb-pick:not(.on)'); await p.click('.onb-next'); await p.waitForTimeout(100);
  await p.fill('.onb-bud[data-g="Ăn uống"]', '3000000'); await p.click('.onb-next'); await p.waitForTimeout(200);
  const o = await p.evaluate(() => ({ w: wallets.map(w => w.name + ':' + w.balance).join(), fav: JSON.parse(localStorage.getItem('tc_fav_chi') || '[]').length, bud: budgets['Ăn uống'], done: localStorage.getItem('tc_onboarded'), hidden: !document.getElementById('onb').classList.contains('show') }));
  ok(o.w === 'Ví chính:2500000' && o.fav === picks + 1 && o.bud === 3000000 && o.done === '1' && o.hidden, '10b hoàn tất 3 bước: tạo ví, hạng mục hay dùng, ngân sách', o);
  const e = await p.evaluate(async () => { showScreen('home'); await new Promise(r => setTimeout(r, 30)); const r = document.querySelector('#recentList .empty-rich'); return { rich: !!r, cta: r && r.querySelector('.er-cta').textContent }; });
  ok(e.rich && e.cta === 'Ghi giao dịch', '9 màn trống có hình, hướng dẫn và nút hành động', e);
  ok(await p.evaluate(() => { document.querySelector('#recentList .er-cta').click(); return currentScreen() === 'add'; }), '9b bấm nút ở màn trống → mở đúng màn');
  ok(await p.evaluate(async () => { showScreen('loans'); await new Promise(r => setTimeout(r, 30)); const r = document.querySelector('#loanList .empty-rich'); return !!r && /Thêm khoản vay/.test(r.innerText); }), '9c màn trống ở Vay ngân hàng');
  await p.reload(); await p.waitForTimeout(2000);
  ok(await p.evaluate(() => { const o = document.getElementById('onb'); return !o || !o.classList.contains('show'); }), '10c đã xong thì không hiện lại màn chào');
  ok(p.errs.length === 0, 'không lỗi JS (người mới)', p.errs); await p.ctx.close();

  /* bỏ qua màn chào */
  p = await page(browser, {}); await p.waitForSelector('#onb.show', { timeout: 6000 }); await p.click('.onb-skip'); await p.waitForTimeout(100);
  ok(await p.evaluate(() => localStorage.getItem('tc_onboarded') === '1' && wallets.length === 0), '10d bấm "Để sau": đóng, không tạo gì'); await p.ctx.close();

  /* giao diện sáng + máy tính: không lỗi, tiêu đề dính có nền */
  p = await page(browser, { tc_wallets: W, tc_txs: TX, tc_onboarded: '1', tc_skin: 'sky' }, { viewport: { width: 1400, height: 900 }, hasTouch: false, isMobile: false });
  ok(await p.evaluate(async () => { showScreen('history'); window.scrollTo(0, 700); await new Promise(r => setTimeout(r, 300)); return document.body.classList.contains('scrolled'); }) && p.errs.length === 0, 'máy tính + giao diện sáng: không lỗi', p.errs);
  await p.ctx.close();
  console.log((fail ? fails.map(f => '✘ ' + f).join('\n') + '\n' : '') + '✔ Đạt: ' + pass + '   ✘ Lỗi: ' + fail);
  await browser.close(); process.exit(fail ? 1 : 0);
})();
