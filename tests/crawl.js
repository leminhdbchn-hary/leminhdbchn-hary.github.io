/* Bấm thử mọi nút trên mọi màn hình (dữ liệu mẫu đầy đủ), ghi lại lỗi JS. Bỏ qua thao tác xoá/đăng xuất/tải file.
   Chạy: python3 -m http.server 8765  rồi  node tests/crawl.js */
const { chromium } = require('playwright');
const BASE = process.env.BASE || 'http://localhost:8765/index.html';
const D = (d) => { const t = new Date(); t.setDate(t.getDate() + d); return t.toISOString().slice(0, 10); };
const SEED = {
  tc_wallets: [{ id: 1, name: 'Tiền mặt', type: 'cash', balance: 3000000 }, { id: 2, name: 'VCB', type: 'bank', balance: 20000000, code: 'VCB' }, { id: 3, name: 'Thẻ TD', type: 'credit', balance: -500000, limit: 10000000, stmtDay: 20, dueDay: 5 },
    { id: 4, name: 'Sổ TK', type: 'saving', balance: 50000000, rate: 5, termMonths: 6, depositDate: D(-30), maturityDate: D(150), payTiming: 'monthly', maturityAction: 'renew_principal', payoutWalletId: '2', lastInterestDate: D(-30) }],
  tc_txs: [
    { id: 101, type: 'chi', amount: 50000, group: 'Ăn uống', item: 'Ăn trưa', walletId: 1, note: 'cơm', date: D(0), time: '12:00' },
    { id: 102, type: 'thu', amount: 15000000, group: 'Lương', item: 'Lương', walletId: 2, date: D(0), time: '09:00' },
    { id: 103, type: 'chi', amount: 2000000, group: 'Khác', item: 'Cho vay', walletId: 2, person: 'Nam', date: D(-2), debtId: 501 },
    { id: 104, type: 'transfer', amount: 1000000, fromName: 'VCB', toName: 'Tiền mặt', date: D(-1) },
    { id: 105, type: 'chi', amount: 300000, group: 'Đi lại', item: 'Xăng xe', walletId: 3, note: 'đổ xăng', date: D(-1) },
    { id: 106, type: 'family', amount: 500000, dir: 'out', person: 'Vợ', walletId: 1, date: D(-5), repay: true, dueDate: D(3) },
    { id: 107, type: 'chi', amount: 600000, group: 'Khác', item: 'Tạm ứng ăn chung', walletId: 1, note: 'lẩu', date: D(-1) },
    { id: 108, type: 'chi', amount: 120000, group: 'Ăn uống', item: 'Cafe', walletId: 1, note: 'cafe', date: D(-40), noCF: true }],
  tc_debts: [{ id: 501, dir: 'out', person: 'Nam', amount: 2000000, date: D(-2), dueDate: D(5), status: 'pending', sourceWalletId: 2, outTxId: 103 }, { id: 502, dir: 'in', person: 'Tuấn', amount: 500000, date: D(-3), dueDate: D(-1), status: 'pending' }],
  tc_loans: [{ v: 2, id: 601, type: 'consumer', name: 'Vay xe', principal: 120000000, paidBefore: 0, balance: 120000000, startDate: D(-60), termMonths: 24, rate: 10, rateChanges: [{ date: D(-10), rate: 11 }], interestDay: 15, iPaid: 1, status: 'active', history: [] },
    { v: 2, id: 602, type: 'overdraft', name: 'Thấu chi', principal: 50000000, paidBefore: 0, balance: 50000000, startDate: D(-20), termMonths: 12, rate: 12, interestDay: 25, iPaid: 0, status: 'active', history: [] }],
  tc_budgets: { 'Ăn uống': 3000000 }, tc_recurring: [{ id: 1, name: 'Tiền nhà', type: 'chi', amount: 5000000, day: 10, group: 'Nhà cửa', item: 'Thuê nhà', walletId: 2 }],
  tc_goals: [{ id: 1, name: 'Du lịch', target: 10000000, saved: 2000000, emoji: '✈️' }],
  tc_templates: [{ id: 1, name: 'Cafe 30k', type: 'chi', group: 'Ăn uống', item: 'Cafe', amount: 30000, walletId: '1' }]
};
const SKIP = /clearAll|deleteWallet|deleteAccount|deleteLoan\b|deleteDebt|deleteTx|deleteGoal|delTpl|deleteLoanHist|logout|Logout|cloudDoGoogleLogin|cloudGoogleLoginUI|cloudGateLoginUI|signIn|exportJSON|exportCSV|downloadFile|triggerImport|location|reload|checkUpdate|forceUpdate|lockNow|adminList|removeLoanRateChange|openSmsImport|qeVoice|ocr/i;
(async () => {
  const browser = await chromium.launch(); const problems = []; let clicks = 0;
  for (const vp of [{ width: 390, height: 844 }, { width: 1400, height: 900 }]) {
    const ctx = await browser.newContext({ viewport: vp, acceptDownloads: false }); const p = await ctx.newPage();
    let where = ''; p.on('pageerror', e => problems.push(vp.width + 'px ' + where + ' → ' + e.message));
    p.on('console', m => { if (m.type() === 'error' && !/gstatic|firebase|Failed to load resource|net::|ERR_/i.test(m.text())) problems.push(vp.width + 'px ' + where + ' (console) → ' + m.text().slice(0, 200)); });
    p.on('dialog', d => d.dismiss().catch(() => {}));
    await p.addInitScript(s => { if (!sessionStorage.getItem('seeded')) { sessionStorage.setItem('seeded', '1'); localStorage.clear(); localStorage.setItem('tc_cloud_gate_skip', '1');
      Object.entries(s).forEach(([k, v]) => localStorage.setItem(k, JSON.stringify(v))); } }, SEED);
    await p.goto(BASE); await p.waitForTimeout(1500);
    await p.evaluate(() => { try { closeAppModal(); } catch (e) {} });
    const screens = await p.evaluate(() => [...document.querySelectorAll('.screen')].map(s => s.id.replace('screen-', '')).filter(s => !['admin', 'cloud'].includes(s)));
    for (const sc of screens) {
      where = sc;
      await p.evaluate(s => { try { closeAppModal(); } catch (e) {} showScreen(s); }, sc); await p.waitForTimeout(250);
      const n = await p.evaluate(s => { const root = document.getElementById('screen-' + s); const els = [...root.querySelectorAll('[onclick],button,select,summary')].filter(e => e.offsetParent !== null);
        els.forEach((e, i) => e.setAttribute('data-crawl', s + i)); return els.length; }, sc);
      for (let i = 0; i < n; i++) {
        const info = await p.evaluate(([s, i]) => { const e = document.querySelector('[data-crawl="' + s + i + '"]'); if (!e || e.offsetParent === null) return null;
          return { oc: e.getAttribute('onclick') || '', tag: e.tagName, txt: (e.innerText || '').trim().slice(0, 40), sel: e.tagName === 'SELECT' }; }, [sc, i]);
        if (!info) continue; if (SKIP.test(info.oc) || /Xoá|Xóa|Đăng xuất|Sao lưu|Tải|Khôi phục/.test(info.txt)) continue;
        where = sc + ' › ' + (info.txt || info.oc.slice(0, 40));
        try {
          if (info.sel) await p.evaluate(([s, i]) => { const e = document.querySelector('[data-crawl="' + s + i + '"]'); if (e.options.length > 1) { e.selectedIndex = e.options.length - 1; e.dispatchEvent(new Event('change', { bubbles: true })); } }, [sc, i]);
          else await p.evaluate(([s, i]) => document.querySelector('[data-crawl="' + s + i + '"]').click(), [sc, i]);
          clicks++;
        } catch (e) { problems.push(vp.width + 'px ' + where + ' → ' + e.message.split('\n')[0]); }
        await p.waitForTimeout(60);
        /* bấm thử cả các nút trong hộp thoại vừa mở (trừ Lưu/Xoá) */
        await p.evaluate(() => { const m = document.getElementById('appModal'); if (m && m.classList.contains('show')) { [...m.querySelectorAll('button')].filter(b => !/Xoá|Xóa|Lưu|Đã thu|Không thu|Sao lưu|Cập nhật/.test(b.innerText) && !/del|save|Collect|Waive|exportJSON|confirm/i.test(b.getAttribute('onclick') || '')).slice(0, 6).forEach(b => { try { b.click(); } catch (e) {} }); }
          try { closeAppModal(); } catch (e) {} document.querySelectorAll('.sheet.show,#catSheet.show').forEach(x => x.classList.remove('show')); });
        const cur = await p.evaluate(() => currentScreen()); if (cur !== sc) { await p.evaluate(s => showScreen(s), sc); await p.waitForTimeout(120); }
      }
      const ov = await p.evaluate(() => document.documentElement.scrollWidth - window.innerWidth); if (ov > 1) problems.push(vp.width + 'px ' + sc + ' → tràn ngang ' + ov + 'px');
    }
    /* dữ liệu vẫn hợp lệ sau khi bấm khắp nơi */
    const sane = await p.evaluate(() => ({ nan: wallets.some(w => !Number.isFinite(w.balance)) || txs.some(t => !Number.isFinite(t.amount)), tx: txs.length }));
    if (sane.nan) problems.push(vp.width + 'px → số dư/số tiền bị NaN sau khi bấm thử');
    await ctx.close();
  }
  console.log('Đã bấm ' + clicks + ' nút/ô chọn.');
  console.log(problems.length ? [...new Set(problems)].map(x => '✘ ' + x).join('\n') : '✔ Không phát hiện lỗi JS nào');
  await browser.close(); process.exit(problems.length ? 1 : 0);
})();
