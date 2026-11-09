/* Quét độ tương phản chữ/nền ở mọi màn hình theo từng giao diện (mặc định: apple). Chạy: node tests/contrast.js [skin ...] */
const { chromium } = require('playwright');
const BASE = process.env.BASE || 'http://localhost:8765/index.html';
const SKINS = process.argv.slice(2).length ? process.argv.slice(2) : ['apple'];
const D = (d) => { const t = new Date(); t.setDate(t.getDate() + d); return t.toISOString().slice(0, 10); };
const SEED = {
  tc_wallets: [{ id: 1, name: 'Tiền mặt', type: 'cash', balance: 3000000 }, { id: 2, name: 'VCB', type: 'bank', balance: 20000000, code: 'VCB' }, { id: 3, name: 'Thẻ TD', type: 'credit', balance: -500000, limit: 10000000, stmtDay: 20, dueDay: 5 },
    { id: 4, name: 'Sổ TK', type: 'saving', balance: 50000000, rate: 5, termMonths: 6, depositDate: D(-30), maturityDate: D(150), payTiming: 'end', maturityAction: 'renew_all' }],
  tc_txs: [{ id: 1, type: 'chi', amount: 50000, group: 'Ăn uống', item: 'Ăn trưa', walletId: 1, note: 'cơm', date: D(0), time: '12:00' }, { id: 2, type: 'thu', amount: 15000000, group: 'Lương', item: 'Lương', walletId: 2, date: D(0) },
    { id: 3, type: 'transfer', amount: 1000000, fromName: 'VCB', toName: 'Tiền mặt', date: D(-1) }, { id: 4, type: 'chi', amount: 600000, group: 'Khác', item: 'Tạm ứng ăn chung', walletId: 1, date: D(-1) },
    { id: 5, type: 'family', amount: 500000, dir: 'out', person: 'Vợ', walletId: 1, date: D(-5), repay: true, dueDate: D(3) }],
  tc_debts: [{ id: 501, dir: 'out', person: 'Nam', amount: 2000000, date: D(-2), dueDate: D(5), status: 'pending' }, { id: 502, dir: 'in', person: 'Tuấn', amount: 500000, date: D(-3), dueDate: D(-1), status: 'pending' }],
  tc_loans: [{ v: 2, id: 601, type: 'consumer', name: 'Vay xe', principal: 120000000, paidBefore: 0, balance: 120000000, startDate: D(-60), termMonths: 24, rate: 10, interestDay: 15, iPaid: 1, status: 'active', history: [] }],
  tc_budgets: { 'Ăn uống': 3000000 }, tc_goals: [{ id: 1, name: 'Du lịch', target: 10000000, saved: 2000000, emoji: '✈️' }], tc_recurring: [{ id: 1, name: 'Tiền nhà', type: 'chi', amount: 5000000, day: 10, group: 'Nhà cửa', item: 'Thuê nhà', walletId: 2 }]
};
(async () => {
  const browser = await chromium.launch(); let total = 0;
  for (const skin of SKINS) for (const vp of [{ width: 390, height: 844 }, { width: 1400, height: 900 }]) {
    const ctx = await browser.newContext({ viewport: vp, hasTouch: vp.width < 800, isMobile: vp.width < 800 }); const p = await ctx.newPage(); p.on('dialog', d => d.accept());
    await p.addInitScript(([s, k]) => { if (!sessionStorage.getItem('seeded')) { sessionStorage.setItem('seeded', '1'); localStorage.clear(); localStorage.setItem('tc_cloud_gate_skip', '1'); localStorage.setItem('tc_onboarded', '1'); localStorage.setItem('tc_swipe_hint', '1'); localStorage.setItem('tc_skin', k);
      Object.entries(s).forEach(([a, v]) => localStorage.setItem(a, JSON.stringify(v))); } }, [SEED, skin]);
    await p.goto(BASE); await p.waitForTimeout(1500);
    const bad = await p.evaluate(async () => {
      const lum = c => { const m = c.match(/[\d.]+/g).map(Number); const f = v => { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); }; return { l: .2126 * f(m[0]) + .7152 * f(m[1]) + .0722 * f(m[2]), a: m.length > 3 ? m[3] : 1, r: m[0], g: m[1], b: m[2] }; };
      const blend = (top, bot) => ({ r: top.r * top.a + bot.r * (1 - top.a), g: top.g * top.a + bot.g * (1 - top.a), b: top.b * top.a + bot.b * (1 - top.a), a: 1 });
      const toL = o => { const f = v => { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); }; return .2126 * f(o.r) + .7152 * f(o.g) + .0722 * f(o.b); };
      const parse = c => { const x = lum(c); return { r: x.r, g: x.g, b: x.b, a: x.a }; };
      const bgOf = el => { const layers = []; let e = el; while (e) { const cs = getComputedStyle(e); if (cs.backgroundImage !== 'none' && !/^(url)/.test(cs.backgroundImage) && /gradient/.test(cs.backgroundImage)) return null; const b = parse(cs.backgroundColor); if (b.a > 0) { layers.push(b); if (b.a >= .99) break; } e = e.parentElement; }
        let base = { r: 255, g: 255, b: 255, a: 1 }; for (let i = layers.length - 1; i >= 0; i--) base = blend(layers[i], base); return base; };
      const out = []; const seen = new Set();
      for (const s of [...document.querySelectorAll('.screen')].map(x => x.id.slice(7)).filter(x => !['admin', 'cloud', 'reward', 'chars'].includes(x))) {
        try { showScreen(s); } catch (e) {} await new Promise(r => setTimeout(r, 150));
        const root = document.getElementById('screen-' + s);
        root.querySelectorAll('*').forEach(el => { if (!el.offsetParent && getComputedStyle(el).position !== 'fixed') return; const t = [...el.childNodes].filter(n => n.nodeType === 3).map(n => n.nodeValue.trim()).join('');
          if (!t) return; const cs = getComputedStyle(el); if (cs.visibility === 'hidden' || +cs.opacity < .3) return; const fg = parse(cs.color), bg = bgOf(el); if (!bg) return;
          const f = fg.a < 1 ? blend(fg, bg) : fg; const L1 = toL(f), L2 = toL(bg), ratio = (Math.max(L1, L2) + .05) / (Math.min(L1, L2) + .05);
          const k = s + '|' + el.className + '|' + t.slice(0, 20); if (ratio < 2.4 && !seen.has(k)) { seen.add(k); out.push(s + ' › ' + (el.className || el.tagName) + ' "' + t.slice(0, 28) + '" ' + ratio.toFixed(2)); } });
      }
      return out; });
    console.log((skin + ' ' + vp.width + 'px: ' + (bad.length ? bad.length + ' chỗ khó đọc\n  ' + bad.join('\n  ') : 'OK')));
    total += bad.length; await ctx.close();
  }
  await browser.close(); process.exit(total ? 1 : 0);
})();
