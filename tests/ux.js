/* Kiểm thử trải nghiệm: bố cục không tràn viền, ví mặc định khi trả nợ, nhớ ví, hoàn tác xoá,
   thanh Cho vay/Vay nợ, tìm trong Cài đặt.  Chạy: python3 -m http.server 8765  rồi  node tests/ux.js */
const { chromium } = require('playwright');
const BASE = process.env.BASE || 'http://localhost:8765/index.html';
let pass = 0, fail = 0; const fails = [];
function ok(c, n, x) { if (c) pass++; else { fail++; fails.push(n + (x !== undefined ? ' → ' + JSON.stringify(x) : '')); } }

async function fresh(browser, w) {
  const ctx = await browser.newContext({ viewport: { width: w || 390, height: 844 }, hasTouch: true, isMobile: true });
  const p = await ctx.newPage(); p.errors = [];
  p.on('pageerror', e => p.errors.push(e.message)); p.on('dialog', d => d.accept());
  await p.addInitScript(() => {
    if (!sessionStorage.getItem('seeded')) {
      sessionStorage.setItem('seeded', '1'); localStorage.clear();
      localStorage.setItem('tc_cloud_gate_skip', '1');
      localStorage.setItem('tc_wallets', JSON.stringify([
        { id: 1, name: 'Tiền mặt', type: 'cash', balance: 1000000 },
        { id: 2, name: 'Viettel Money', type: 'bank', balance: 5000000 }]));
    }
  });
  await p.goto(BASE); await p.waitForTimeout(900); return p;
}
const bal = (p, id) => p.evaluate(i => wallets.find(w => w.id === i).balance, id);

(async () => {
  const browser = await chromium.launch();

  /* 1. Không tràn viền ngang ở nhiều chiều rộng, mọi giao diện màu */
  for (const w of [360, 390, 430]) {
    const p = await fresh(browser, w);
    for (const skin of ['gold', 'sky', 'red', 'mono']) {
      await p.evaluate(s => setSkin(s), skin);
      for (const s of ['home', 'accounts', 'add', 'history', 'report', 'budget', 'recurring', 'family', 'debts', 'loans', 'more']) {
        await p.evaluate(s => showScreen(s), s);
        if (s === 'more') await p.evaluate(() => document.querySelectorAll('#screen-more .more-group').forEach(g => g.classList.add('open')));
        await p.waitForTimeout(60);
        const bad = await p.evaluate(() => {
          const W = document.documentElement.clientWidth, out = [];
          const scrolls = e => { for (let a = e.parentElement; a && !a.classList.contains('screen') && a !== document.body; a = a.parentElement) { const o = getComputedStyle(a).overflowX; if (o === 'auto' || o === 'scroll' || o === 'hidden' || o === 'clip') return true; } return false; };
          document.querySelectorAll('.screen.active *').forEach(e => {
            const r = e.getBoundingClientRect(), cs = getComputedStyle(e);
            if (r.width && cs.display !== 'none' && cs.visibility !== 'hidden' && (r.right > W + 1 || r.left < -1) && !scrolls(e)) out.push(e.tagName + '.' + e.className + ' R' + Math.round(r.right));
          });
          return { sw: document.documentElement.scrollWidth > W + 1, out: out.slice(0, 4) };
        });
        ok(!bad.sw && bad.out.length === 0, 'không tràn viền: ' + w + 'px · ' + skin + ' · ' + s, bad);
      }
    }
    ok(p.errors.length === 0, 'không lỗi JS ' + w + 'px', p.errors);
    await p.context().close();
  }

  const p = await fresh(browser);

  /* 2. Trả nợ: ô ví mặc định là ví đã chọn lúc ghi khoản vay */
  await p.evaluate(() => { openDebts('out'); toggleDebtForm(); document.getElementById('debtPerson').value = 'Lan'; document.getElementById('debtAmount').value = '100000'; document.getElementById('debtSourceWallet').value = '2'; saveDebt(); });
  const dId = await p.evaluate(() => debts[0].id);
  ok(await p.evaluate(id => { openDebts('out'); return document.getElementById('payWallet_' + id).value; }, dId) === '2', 'cho vay: ô ví mặc định = ví nguồn');
  await p.evaluate(id => markDebtPaid(id), dId);
  ok(await bal(p, 2) === 5000000 && await bal(p, 1) === 1000000, 'thu hồi nợ vào đúng ví nguồn', [await bal(p, 1), await bal(p, 2)]);

  /* 3. Thanh Cho vay / Vay nợ ở màn Thêm giao dịch */
  await p.evaluate(() => showScreen('add'));
  ok(await p.evaluate(() => document.querySelectorAll('#debtQuick button').length) === 2, 'có thanh Cho vay / Vay nợ');
  await p.evaluate(() => document.querySelectorAll('#debtQuick button')[1].click()); await p.waitForTimeout(400);
  ok(await p.evaluate(() => document.getElementById('screen-debts').classList.contains('active') && debtDir === 'in' && document.getElementById('addDebtForm').style.display === 'block'), 'bấm Vay nợ mở thẳng form khoản vay');
  await p.evaluate(() => { showScreen('add'); document.querySelectorAll('#debtQuick button')[0].click(); }); await p.waitForTimeout(400);
  ok(await p.evaluate(() => debtDir === 'out' && document.getElementById('addDebtForm').style.display === 'block'), 'bấm Cho vay mở thẳng form cho vay');

  /* 4. Nhớ ví theo hạng mục */
  await p.evaluate(() => { showScreen('add'); setType('chi'); document.getElementById('amountInput').value = '30000'; pickCat('Ăn uống', 'Cafe'); document.getElementById('accSelect').value = '2'; saveTx(); });
  await p.evaluate(() => { showScreen('add'); setType('chi'); pickCat('Ăn uống', 'Cafe'); }); await p.waitForTimeout(100);
  ok(await p.evaluate(() => document.getElementById('accSelect').value) === '2', 'nhớ ví đã dùng cho hạng mục Cafe');
  await p.evaluate(() => { pickCat('Ăn uống', 'Ăn trưa'); }); await p.waitForTimeout(100);
  ok(await p.evaluate(() => document.getElementById('accSelect').value) !== '', 'hạng mục khác vẫn có ví');

  /* 5. Gợi ý ghi chú tự điền */
  await p.evaluate(() => { showScreen('add'); setType('chi'); document.getElementById('amountInput').value = '45000'; pickCat('Ăn uống', 'Ăn trưa'); document.getElementById('noteInput').value = 'cơm gà'; document.getElementById('accSelect').value = '2'; saveTx(); });
  await p.evaluate(() => { showScreen('add'); setType('chi'); const n = document.getElementById('noteInput'); n.focus(); n.dispatchEvent(new Event('focus')); });
  ok(await p.evaluate(() => [...document.querySelectorAll('#noteList option')].some(o => o.value === 'cơm gà')), 'datalist có ghi chú đã dùng');
  await p.evaluate(() => { const n = document.getElementById('noteInput'); n.value = 'Cơm Gà'; n.dispatchEvent(new Event('change')); }); await p.waitForTimeout(100);
  const fill = await p.evaluate(() => ({ a: document.getElementById('amountInput').value, i: selectedItem, w: document.getElementById('accSelect').value }));
  ok(/45/.test(fill.a) && fill.i === 'Ăn trưa' && fill.w === '2', 'gõ ghi chú cũ tự điền số tiền/hạng mục/ví', fill);

  /* 6. Hoàn tác khi xoá giao dịch */
  const b0 = await bal(p, 2), tid = await p.evaluate(() => txs[0].id), n0 = await p.evaluate(() => txs.length);
  await p.evaluate(id => deleteTx(id), tid);
  ok(await p.evaluate(() => document.getElementById('undoBar').classList.contains('show')), 'hiện thanh Hoàn tác sau khi xoá');
  ok(await p.evaluate(() => txs.length) === n0 - 1 && await bal(p, 2) === b0 + 45000, 'xoá hoàn lại số dư', await bal(p, 2));
  await p.evaluate(() => document.getElementById('undoBtn').click());
  ok(await p.evaluate(() => txs.length) === n0 && await bal(p, 2) === b0, 'Hoàn tác khôi phục giao dịch và số dư', [await p.evaluate(() => txs.length), await bal(p, 2)]);
  await p.reload(); await p.waitForTimeout(900);
  ok(await p.evaluate(() => txs.length) === n0, 'hoàn tác được lưu lại sau khi tải lại');

  /* 7. Tìm trong Cài đặt */
  await p.evaluate(() => showScreen('more'));
  await p.evaluate(() => { const i = document.getElementById('moreSearch'); i.value = 'vay'; i.dispatchEvent(new Event('input')); });
  const vis = await p.evaluate(() => [...document.querySelectorAll('#screen-more .inner > .more-item, #screen-more .inner > .more-group')].filter(e => !e.classList.contains('ux-hide') && e.offsetParent !== null).map(e => e.id));
  ok(vis.includes('more-borrow') && vis.includes('more-loans') && !vis.includes('more-budget'), 'tìm "vay" lọc đúng mục', vis);
  await p.evaluate(() => { const i = document.getElementById('moreSearch'); i.value = 'zzzz'; i.dispatchEvent(new Event('input')); });
  ok(await p.evaluate(() => !document.getElementById('moreSearchEmpty').classList.contains('ux-hide')), 'hiện "Không tìm thấy" khi không khớp');
  await p.evaluate(() => { const i = document.getElementById('moreSearch'); i.value = ''; i.dispatchEvent(new Event('input')); });
  ok(await p.evaluate(() => document.querySelectorAll('#screen-more .ux-hide:not(#moreSearchEmpty)').length) === 0, 'xoá ô tìm thì hiện lại đủ mục');

  ok(p.errors.length === 0, 'không lỗi JS', p.errors);
  await browser.close();
  console.log('✔ Đạt: ' + pass + '   ✘ Lỗi: ' + fail); fails.forEach(f => console.log('  ✘ ' + f));
  process.exit(fail ? 1 : 0);
})();
