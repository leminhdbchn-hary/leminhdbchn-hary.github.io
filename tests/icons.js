/* Kiểm thử v88: bộ biểu tượng Fluent Emoji + Solar. Chạy: python3 -m http.server 8765  rồi  node tests/icons.js */
const { chromium } = require('playwright');
const BASE = process.env.BASE || 'http://localhost:8765/index.html';
let pass = 0, fail = 0; const fails = [];
function ok(c, n, x) { if (c) pass++; else { fail++; fails.push(n + (x !== undefined ? ' → ' + JSON.stringify(x).slice(0, 400) : '')); } }
(async () => {
  const browser = await chromium.launch(); const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } }); const p = await ctx.newPage(); const errs = [];
  p.on('pageerror', e => errs.push(e.message)); p.on('dialog', d => d.accept());
  await p.addInitScript(() => { if (!sessionStorage.getItem('seeded')) { sessionStorage.setItem('seeded', '1'); localStorage.clear(); localStorage.setItem('tc_cloud_gate_skip', '1'); localStorage.setItem('tc_icon_style', 'flat');
    localStorage.setItem('tc_wallets', JSON.stringify([{ id: 1, name: 'Tiền mặt', type: 'cash', balance: 100000 }]));
    localStorage.setItem('tc_custom_cats', JSON.stringify({ chi: { groups: [{ name: 'Thú cưng', emoji: '🐶', items: [['Thức ăn', '🦴'], ['Lạ', '🫎']] }], add: {}, hidden: [] } }));
    localStorage.setItem('tc_txs', JSON.stringify([{ id: 1, type: 'chi', amount: 50000, group: 'Ăn uống', item: 'Ăn trưa', icon: 'e:🍜', walletId: 1, date: new Date().toISOString().slice(0, 10) }])); } });
  await p.goto(BASE); await p.waitForTimeout(1200);
  const r = await p.evaluate(() => ({ nav: !!document.querySelector('#nav-home svg.si,.tab svg.si'), tx: !!document.querySelector('#recentList .tx-icon svg.fe'),
    sizeOk: (() => { const s = document.querySelector('#recentList .tx-icon svg.fe'); const b = s && s.getBoundingClientRect(); return b && b.width >= 16 && b.width <= 30; })(),
    count: Object.keys(window.FLUENT_EMOJI).length, solar: Object.keys(window.SOLAR_ICONS).length }));
  ok(r.nav && r.tx && r.sizeOk && r.count >= 140 && r.solar >= 26, 'icon giao diện (Solar) và icon hạng mục (Fluent) hiện, đúng cỡ', r);
  const c = await p.evaluate(() => { showScreen('add'); openCatSheet(); const sheet = document.getElementById('catSheet').innerHTML; closeCatSheet();
    return { custom: sheet.includes('Thú cưng'), bone: /Thức ăn/.test(sheet), fallback: (() => { const t = icon('e:🫎', '#000', 20); return /🫎/.test(t) && !/svg/.test(t); })(), sheetSvg: (sheet.match(/svg class="fe"/g) || []).length }; });
  ok(c.custom && c.bone && c.fallback, 'hạng mục tự tạo vẫn hiện; emoji không có trong bộ thì giữ emoji gốc', c);
  await p.waitForTimeout(100);
  ok(await p.evaluate(async () => { showScreen('add'); openCatSheet(); await new Promise(r => setTimeout(r, 50)); const n = document.querySelectorAll('#catSheet .emo-ic svg.fe').length; closeCatSheet(); return n > 20; }), 'bảng chọn hạng mục dùng icon Fluent');
  ok(await p.evaluate(async () => { openCatGroupAdd(); await new Promise(r => setTimeout(r, 50)); const n = document.querySelectorAll('.emo-pick button svg.fe').length; closeAppModal(); return n > 10; }), 'bảng chọn emoji khi tạo hạng mục cũng dùng icon mới');
  ok(await p.evaluate(() => /Fluent Emoji/.test(document.querySelector('.icon-credits').textContent) && /CC BY 4.0/.test(document.querySelector('.icon-credits').textContent)), 'có ghi công tác giả biểu tượng theo giấy phép');
  /* chuyển về emoji của máy */
  ok(await p.evaluate(() => { toggleIconStyle(); const n = document.querySelectorAll('.is-opt').length; closeAppModal(); return n === 3; }), 'bấm Kiểu biểu tượng → bảng chọn 3 kiểu có xem trước');
  /* kiểu 3D: ảnh tải được, mất mạng vẫn hiện */
  await p.evaluate(() => setIconStyle('3d')); await p.waitForTimeout(1500);
  const d3 = await p.evaluate(async () => { const img = document.querySelector('#recentList img.fe3d'); if (!img) return { img: false }; await (img.decode ? img.decode().catch(() => {}) : 0);
    return { img: true, w: img.naturalWidth, size: Math.round(img.getBoundingClientRect().width), sub: document.getElementById('more-iconstyle').innerText }; });
  ok(d3.img && d3.w === 96 && d3.size >= 16 && d3.size <= 34 && /3D/.test(d3.sub), 'kiểu 3D: ảnh 3D hiện đúng cỡ', d3);
  await p.waitForTimeout(4500); await ctx.setOffline(true); await p.reload(); await p.waitForTimeout(1500);
  ok(await p.evaluate(async () => { showScreen('add'); openCatSheet(); await new Promise(r => setTimeout(r, 300)); const imgs = [...document.querySelectorAll('#catSheet img.fe3d')]; await Promise.all(imgs.slice(0, 30).map(i => i.decode().catch(() => {}))); const bad = imgs.slice(0, 30).filter(i => !i.naturalWidth).length; closeCatSheet(); return imgs.length > 20 && bad === 0; }), 'kiểu 3D: mất mạng vẫn hiện đủ ảnh (đã lưu sẵn)');
  await ctx.setOffline(false);
  await p.evaluate(() => setIconStyle('native')); await p.waitForTimeout(1300);
  const n = await p.evaluate(() => ({ native: iconNative(), noFe: !document.querySelector('svg.fe'), noSi: !document.querySelector('svg.si'), emoji: /🍜/.test(document.getElementById('recentList').innerText), sub: document.getElementById('more-iconstyle').innerText }));
  ok(n.native && n.noFe && !n.noSi && n.emoji && /Emoji của máy/.test(n.sub), 'Emoji của máy: hạng mục dùng emoji gốc, icon giao diện vẫn là Solar', n);
  await p.evaluate(() => setIconStyle('flat')); await p.waitForTimeout(1300);
  ok(await p.evaluate(() => !iconNative() && !!document.querySelector('svg.fe')), 'chọn lại kiểu Phẳng → dùng bộ mới');
  /* offline vẫn có icon */
  await p.evaluate(() => navigator.serviceWorker.ready); await p.reload(); await p.waitForTimeout(1000); await ctx.setOffline(true); await p.reload(); await p.waitForTimeout(1300);
  ok(await p.evaluate(() => !!window.FLUENT_EMOJI && !!document.querySelector('svg.fe')), 'tắt mạng vẫn có icon mới'); await ctx.setOffline(false);
  /* giao diện Tối giản / sáng không lỗi */
  for (const sk of ['mono', 'sky']) { await p.evaluate(s => chooseSkin(s), sk); await p.waitForTimeout(200); ok(await p.evaluate(() => { showScreen('home'); return !!document.querySelector('svg.fe'); }), 'giao diện ' + sk + ' vẫn hiện icon'); }
  ok(errs.length === 0, 'không lỗi JS', errs);
  /* mặc định (chưa chọn gì) = emoji của máy */
  const p3 = await (await browser.newContext()).newPage(); await p3.addInitScript(() => { if (!sessionStorage.getItem('seeded')) { sessionStorage.setItem('seeded', '1'); localStorage.clear(); localStorage.setItem('tc_cloud_gate_skip', '1');
    localStorage.setItem('tc_wallets', JSON.stringify([{ id: 1, name: 'A', type: 'cash', balance: 0 }])); localStorage.setItem('tc_txs', JSON.stringify([{ id: 1, type: 'chi', amount: 1, group: 'Ăn uống', item: 'Ăn trưa', icon: 'e:🍜', walletId: 1, date: new Date().toISOString().slice(0, 10) }])); } });
  await p3.goto(BASE); await p3.waitForTimeout(1200);
  ok(await p3.evaluate(() => iconStyle() === 'native' && !document.querySelector('svg.fe,img.fe') && /🍜/.test(document.getElementById('recentList').innerText) && !!document.querySelector('svg.si')), 'mặc định: emoji của máy cho hạng mục, icon giao diện Solar');
  console.log((fail ? fails.map(f => '✘ ' + f).join('\n') + '\n' : '') + '✔ Đạt: ' + pass + '   ✘ Lỗi: ' + fail);
  await browser.close(); process.exit(fail ? 1 : 0);
})();
