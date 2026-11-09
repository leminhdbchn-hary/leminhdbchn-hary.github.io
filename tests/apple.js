/* Kiểm thử v94: giao diện Apple. Chạy: python3 -m http.server 8765  rồi  node tests/apple.js */
const { chromium } = require('playwright');
const BASE = process.env.BASE || 'http://localhost:8765/index.html';
let pass = 0, fail = 0; const fails = [];
function ok(c, n, x) { if (c) pass++; else { fail++; fails.push(n + (x !== undefined ? ' → ' + JSON.stringify(x).slice(0, 500) : '')); } }
const D = (d) => { const t = new Date(); t.setDate(t.getDate() + d); return t.toISOString().slice(0, 10); };
const W = [{ id: 1, name: 'Tiền mặt', type: 'cash', balance: 3000000 }, { id: 2, name: 'VCB', type: 'bank', balance: 20000000 }, { id: 3, name: 'Thẻ', type: 'credit', balance: -500000, limit: 5000000 }];
const TX = [{ id: 1, type: 'chi', amount: 50000, group: 'Ăn uống', item: 'Ăn trưa', walletId: 1, date: D(0), time: '12:00' }, { id: 2, type: 'chi', amount: 90000, group: 'Đi lại', item: 'Xăng xe', walletId: 1, date: D(0), time: '13:00' },
  { id: 3, type: 'thu', amount: 15000000, group: 'Lương', item: 'Lương', walletId: 2, date: D(-1) }];
async function page(browser, vp, skin) {
  const ctx = await browser.newContext({ viewport: vp, hasTouch: vp.width < 800, isMobile: vp.width < 800 }); const p = await ctx.newPage(); p.errs = [];
  p.on('pageerror', e => p.errs.push(e.message)); p.on('dialog', d => d.accept());
  await p.addInitScript(([w, t, s]) => { window.__proOn = true; if (!sessionStorage.getItem('seeded')) { sessionStorage.setItem('seeded', '1'); localStorage.clear(); localStorage.setItem('tc_cloud_gate_skip', '1'); localStorage.setItem('tc_onboarded', '1'); localStorage.setItem('tc_swipe_hint', '1');
    localStorage.setItem('tc_wallets', JSON.stringify(w)); localStorage.setItem('tc_txs', JSON.stringify(t)); if (s) localStorage.setItem('tc_skin', s); } }, [W, TX, skin]);
  await p.goto(BASE); await p.waitForTimeout(1300); p.ctx = ctx; return p;
}
(async () => {
  const browser = await chromium.launch();
  let p = await page(browser, { width: 390, height: 844 });
  /* chọn giao diện Apple trong Cài đặt */
  const sel = await p.evaluate(() => { showScreen('more'); const btn = document.querySelector('.skin-opt[data-skin="apple"]'); const exists = !!btn; chooseSkin('apple');
    return { exists, cls: document.documentElement.classList.contains('skin-apple'), skin: getSkin(), pref: getSkinPref(), css: !!document.getElementById('skinCss-apple'), meta: document.querySelector('meta[name="theme-color"]').content, active: document.querySelector('.skin-opt.active').dataset.skin, label: document.getElementById('more-skin').innerText }; });
  ok(sel.exists && sel.cls && sel.skin === 'apple' && sel.css && sel.meta === '#f2f2f7' && sel.active === 'apple' && /Apple/.test(sel.label), 'chọn Apple trong Cài đặt: áp dụng, có ô chọn, tên hiện đúng', sel);
  await p.reload(); await p.waitForTimeout(1200);
  ok(await p.evaluate(() => getSkin() === 'apple' && document.documentElement.classList.contains('skin-apple')), 'tải lại vẫn giữ giao diện Apple');
  /* nền, chữ, phông */
  const st = await p.evaluate(() => { const c = el => getComputedStyle(el); const body = c(document.body);
    showScreen('home'); const card = c(document.querySelector('.balance-card')); const amount = c(document.querySelector('.balance-card .amount'));
    return { bg: body.backgroundColor, font: body.fontFamily.slice(0, 40), card: card.backgroundColor, amt: amount.color, vars: ['--blue', '--green', '--red'].map(k => c(document.documentElement).getPropertyValue(k).trim().replace(/\s/g, '').toLowerCase()) }; });
  ok(st.bg === 'rgb(242, 242, 247)' && /apple-system/.test(st.font) && st.card === 'rgb(255, 255, 255)' && st.amt === 'rgb(0, 0, 0)' && /^(#007aff|rgb\(0,122,255\)),(#248a3d|rgb\(36,138,61\)),(#ff3b30|rgb\(255,59,48\))$/.test(st.vars.join()), 'nền xám iOS, thẻ trắng, chữ đen, phông hệ thống, màu hệ thống iOS', st);
  /* thanh tab kính mờ, sát đáy, tab chọn màu xanh */
  const tb = await p.evaluate(() => { const t = document.querySelector('.tabbar'), c = getComputedStyle(t), r = t.getBoundingClientRect(); const act = getComputedStyle(document.querySelector('.tab.active .tab-label')).color, off = getComputedStyle(document.querySelector('.tab:not(.active) .tab-label')).color;
    return { w: Math.round(r.width), bottom: Math.round(window.innerHeight - r.bottom), blur: (c.backdropFilter || c.webkitBackdropFilter || '').includes('blur'), radius: c.borderTopLeftRadius, act, off, fab: getComputedStyle(document.querySelector('.tab .fab')).backgroundColor }; });
  ok(tb.w === 390 && tb.bottom === 0 && tb.blur && tb.radius === '0px' && tb.act === 'rgb(0, 122, 255)' && tb.off === 'rgb(142, 142, 147)' && tb.fab === 'rgb(0, 122, 255)', 'thanh tab: sát đáy, kính mờ, tab chọn xanh iOS, nút + xanh', tb);
  /* segmented control */
  const sg = await p.evaluate(() => { showScreen('add'); const track = getComputedStyle(document.querySelector('.type-tabs:not(.debt-quick)')), act = getComputedStyle(document.querySelector('.type-tabs button.active'));
    return { track: track.backgroundColor, trackR: track.borderRadius, actBg: act.backgroundColor, actColor: act.color }; });
  ok(/118, 118, 128/.test(sg.track) && sg.trackR === '9px' && sg.actBg === 'rgb(255, 255, 255)' && sg.actColor === 'rgb(255, 59, 48)', 'Chi/Thu: thanh chọn dạng segmented (nền xám, mục chọn trắng, chữ đỏ khi Chi)', sg);
  /* nút lưu xanh, nút phụ nhạt */
  const bt = await p.evaluate(() => ({ save: getComputedStyle(document.getElementById('saveTxBtn')).backgroundColor, next: getComputedStyle(document.getElementById('saveNextBtn')).backgroundColor, nextC: getComputedStyle(document.getElementById('saveNextBtn')).color }));
  ok(bt.save === 'rgb(0, 122, 255)' && /0, 122, 255/.test(bt.next) && bt.nextC === 'rgb(0, 122, 255)', 'nút Lưu xanh iOS, nút phụ nền xanh nhạt', bt);
  /* công tắc xanh lá */
  const sw = await p.evaluate(() => { const s = document.createElement('div'); s.className = 'switch on'; document.body.appendChild(s); const c = getComputedStyle(s).backgroundColor; s.remove(); return c; });
  ok(sw === 'rgb(52, 199, 89)', 'công tắc bật = xanh lá iOS', sw);
  /* Cài đặt: danh sách nhóm liền khối, icon xanh */
  const ms = await p.evaluate(() => { showScreen('more'); const first = document.querySelector('#screen-more .more-sec + .more-item'), c = getComputedStyle(first); const ic = getComputedStyle(document.querySelector('#more-acc svg.si')).color;
    const secs = [...document.querySelectorAll('#screen-more .more-sec')].filter(s => s.style.display !== 'none').length;
    const prof = getComputedStyle(document.getElementById('more-profile')).borderTopLeftRadius; return { tl: c.borderTopLeftRadius, bl: c.borderBottomLeftRadius, ic, secs, prof }; });
  ok(ms.tl === '14px' && ms.bl === '0px' && ms.ic === 'rgb(0, 122, 255)' && ms.secs === 5 && ms.prof === '14px', 'Cài đặt: danh sách liền khối bo góc đầu/cuối, icon xanh, hồ sơ bo tròn', ms);
  /* lịch sử: nhóm theo ngày liền khối */
  const hs = await p.evaluate(() => { showScreen('history'); const g = document.querySelector('#historyList .day-group'); const items = [...g.querySelectorAll('.tx-item')]; const f = getComputedStyle(items[0]), l = getComputedStyle(items[items.length - 1]);
    return { n: items.length, ftl: f.borderTopLeftRadius, fbl: f.borderBottomLeftRadius, lbl: l.borderBottomLeftRadius, mb: f.marginBottom }; });
  ok(hs.n === 2 && hs.ftl === '14px' && hs.fbl === '0px' && hs.lbl === '14px' && hs.mb === '0px', 'lịch sử: giao dịch cùng ngày thành một khối liền, bo góc đầu/cuối', hs);
  /* biểu đồ dùng bảng màu iOS */
  const dn = await p.evaluate(async () => { showScreen('report'); setPeriod('month', document.createElement('button')); await new Promise(r => setTimeout(r, 60)); return document.querySelector('#repDonut .donut').style.background; });
  ok(/0, 122, 255|#007aff/.test(dn), 'biểu đồ cơ cấu chi tiêu dùng màu hệ thống iOS', dn);
  /* tiêu đề lớn + cuộn thu nhỏ */
  const tt = await p.evaluate(async () => { showScreen('history'); await new Promise(r => setTimeout(r, 100)); const big = getComputedStyle(document.querySelector('#screen-history .screen-title')).fontSize; return big; });
  ok(tt === '32px', 'tiêu đề màn hình lớn kiểu iOS (32px)', tt);
  /* hộp thoại kiểu iOS */
  const dl = await p.evaluate(() => { showScreen('accounts'); openWalletEdit(2); document.querySelector('.we-del').click(); const card = getComputedStyle(document.querySelector('.app-dlg-card')), ok2 = getComputedStyle(document.querySelector('.app-dlg-ok'));
    const r = { r: card.borderRadius, okBg: ok2.backgroundColor }; document.getElementById('appDlgNo').click(); closeAppModal(); return r; });
  ok(dl.r === '18px' && dl.okBg === 'rgb(255, 59, 48)', 'hộp xác nhận xoá: bo 18px, nút xoá đỏ iOS', dl);
  /* mở mọi màn hình, không tràn ngang */
  const bad = await p.evaluate(async () => { const out = []; for (const s of [...document.querySelectorAll('.screen')].map(x => x.id.slice(7)).filter(x => !['admin', 'cloud'].includes(x))) { try { showScreen(s); } catch (e) { out.push(s + ': ' + e.message); } await new Promise(r => setTimeout(r, 80)); if (document.documentElement.scrollWidth > innerWidth + 1) out.push(s + ' tràn ngang'); } return out; });
  ok(bad.length === 0 && p.errs.length === 0, 'mở mọi màn hình ở giao diện Apple: không lỗi, không tràn ngang', { bad, errs: p.errs });
  /* quay lại giao diện cũ sạch sẽ */
  const back = await p.evaluate(() => { chooseSkin('gold'); const c = getComputedStyle(document.body).backgroundColor, tab = getComputedStyle(document.querySelector('.tabbar')).borderRadius; return { c, skin: getSkin(), has: document.documentElement.classList.contains('skin-apple'), tab }; });
  ok(back.skin === 'gold' && !back.has && back.c !== 'rgb(242, 242, 247)', 'đổi lại Vàng đen: không còn dấu vết Apple', back);
  await p.ctx.close();
  /* máy tính */
  p = await page(browser, { width: 1400, height: 900 }, 'apple');
  const dk = await p.evaluate(async () => { const out = []; for (const s of [...document.querySelectorAll('.screen')].map(x => x.id.slice(7)).filter(x => !['admin', 'cloud'].includes(x))) { try { showScreen(s); } catch (e) { out.push(s + ': ' + e.message); } await new Promise(r => setTimeout(r, 80)); }
    const tb = getComputedStyle(document.querySelector('.tabbar')); return { out, border: tb.borderRightWidth, bg: tb.backgroundColor }; });
  ok(dk.out.length === 0 && p.errs.length === 0 && parseFloat(dk.border) > 0, 'máy tính + Apple: mọi màn hình chạy, thanh bên kính mờ có viền mảnh', { dk, errs: p.errs }); await p.ctx.close();
  /* chế độ Tự động vẫn dùng Xanh trắng (không đổi hành vi cũ) */
  p = await page(browser, { width: 390, height: 844 });
  ok(await p.evaluate(() => { chooseSkin('auto'); return getSkinPref() === 'auto' && ['gold', 'sky'].includes(getSkin()); }), 'chế độ Tự động theo máy vẫn như cũ (Vàng đen / Xanh trắng)'); await p.ctx.close();
  console.log((fail ? fails.map(f => '✘ ' + f).join('\n') + '\n' : '') + '✔ Đạt: ' + pass + '   ✘ Lỗi: ' + fail);
  await browser.close(); process.exit(fail ? 1 : 0);
})();
