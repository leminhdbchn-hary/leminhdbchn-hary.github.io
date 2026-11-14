/* Kiểm thử v95: tin ngân hàng (bank.js) – hàng chờ xác nhận, nhớ nơi chi, tự ghi. Chạy: python3 -m http.server 8765  rồi  node tests/bank.js */
const { chromium } = require('playwright');
const BASE = process.env.BASE || 'http://localhost:8765/index.html';
let pass = 0, fail = 0; const fails = [];
function ok(c, n, x) { if (c) pass++; else { fail++; fails.push(n + (x !== undefined ? ' → ' + JSON.stringify(x).slice(0, 600) : '')); } }
const VIB = 'VIB: The 5138***5678 vua giao dich 262,000VND tai CO.OPMART NGUYEN DINH CHIEU luc 17:42. HMKD: ***';
const VCB = 'VCB: TK 0071xxxx1234 -128,000 VND luc 11/11/2026 10:18. ND: GD THE TAI PHUC LONG. SD: ***';
const VCB2 = 'VCB: TK 0071xxxx1234 -95,000 VND luc 12/11/2026 08:05. ND: GD THE TAI PHUC LONG. SD: ***';
const W = [{ id: 1, name: 'Tiền mặt', type: 'cash', balance: 1000000 }, { id: 2, name: 'VIB', type: 'bank', balance: 5000000 }, { id: 3, name: 'Vietcombank', type: 'bank', balance: 20000000 }];
const TX = [{ id: 1, type: 'chi', amount: 40000, group: 'Ăn uống', item: 'Ăn trưa', walletId: 1, date: new Date().toISOString().slice(0, 10), note: 'cơm' }];
async function page(browser, seed, opts) {
  const ctx = await browser.newContext(Object.assign({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true }, opts || {}));
  const p = await ctx.newPage(); p.errs = []; p.dialogs = []; p.on('pageerror', e => p.errs.push(e.message)); p.on('dialog', d => { p.dialogs.push(d.message().slice(0, 80)); d.accept(); });
  await p.addInitScript(s => { if (!sessionStorage.getItem('seeded')) { sessionStorage.setItem('seeded', '1'); localStorage.clear(); localStorage.setItem('tc_cloud_gate_skip', '1'); localStorage.setItem('tc_onboarded', '1'); localStorage.setItem('tc_swipe_hint', '1'); localStorage.setItem('tc_last_backup', String(Date.now()));
    Object.entries(s).forEach(([k, v]) => localStorage.setItem(k, typeof v === 'string' ? v : JSON.stringify(v))); } }, seed);
  const url = (opts && opts.url) || BASE; await p.goto(url); await p.waitForTimeout(1300); p.ctx = ctx; return p;
}
(async () => {
  const browser = await chromium.launch();
  let p = await page(browser, { tc_wallets: W, tc_txs: TX });

  /* 1. hai tin trong ảnh → cả hai vào Chờ xác nhận (chưa nhớ gì) */
  const r1 = await p.evaluate(t => { const rep = bankIngest(t); return { rep: { a: rep.auto.length, p: rep.pend }, pend: bankDB.pend.map(x => ({ n: x.name, a: x.amount, t: x.type, bank: x.bank, w: x.walletId, k: x.key })), modal: document.getElementById('appModal').classList.contains('show'), title: document.querySelector('.bk-head h3').innerText, cards: document.querySelectorAll('.bk-card').length }; }, VIB + '\n\n' + VCB);
  ok(r1.rep.a === 0 && r1.rep.p === 2 && r1.cards === 2 && /Chờ xác nhận \(2\)/.test(r1.title), '1 dán 2 tin trong ảnh: cả hai vào Chờ xác nhận', r1);
  const byBank = Object.fromEntries(r1.pend.map(x => [x.bank, x]));
  ok(byBank.VIB && byBank.VIB.a === 262000 && byBank.VIB.t === 'chi' && byBank.VIB.n === 'Co.opmart Nguyen Dinh Chieu' && byBank.VIB.w === 2, '1b tin VIB: 262.000, chi, nơi chi "Co.opmart Nguyen Dinh Chieu", ví VIB', byBank.VIB);
  ok(r1.pend.some(x => x.a === 128000 && x.n === 'Phuc Long' && x.t === 'chi' && x.w === 3), '1c tin VCB: 128.000, chi, nơi chi "Phuc Long", ví Vietcombank', r1.pend);
  ok(await p.evaluate(() => { const c = document.querySelector('.bk-card'); return !!c.querySelector('.bk-raw') && c.querySelectorAll('.bk-chip').length >= 4 && !!c.querySelector('.bk-chip.star'); }), '1d thẻ có "Thông báo gốc", gợi ý (★ đầu tiên), Khác…, Không tính, Bỏ qua');

  /* 2. chạm một nút → ghi, nhớ nơi chi; lần sau tự ghi */
  const r2 = await p.evaluate(() => { const p0 = bankDB.pend.find(x => x.name === 'Phuc Long'); const b0 = wallets.find(w => w.id === 3).balance; const n0 = txs.length;
    document.querySelector('#bk_' + p0.id + ' select.bk-chip.other').value = 'Ăn uống|||Cafe'; bankOther(p0.id, 'Ăn uống|||Cafe');
    const t = txs[0]; return { added: txs.length === n0 + 1, item: t.item, w: t.walletId, bal: wallets.find(w => w.id === 3).balance === b0 - 128000, note: t.note, mem: bankDB.merch['phuc long'], left: bankDB.pend.length, smsKey: !!t.smsKey, date: t.date }; });
  ok(r2.added && r2.item === 'Cafe' && r2.w === 3 && r2.bal && r2.note === 'Phuc Long' && r2.mem && r2.mem.i === 'Cafe' && r2.left === 1 && r2.smsKey && r2.date === '2026-11-11', '2 chọn hạng mục Cafe: ghi đúng ví/ngày/ghi chú, trừ ví, nhớ "Phuc Long" → Cafe', r2);
  const r3 = await p.evaluate(t => { const b0 = wallets.find(w => w.id === 3).balance; const rep = bankIngest(t); const tx = txs[0]; return { a: rep.auto.length, p: rep.pend, item: tx.item, amt: tx.amount, auto: tx.bankAuto, bal: wallets.find(w => w.id === 3).balance === b0 - 95000, pend: bankDB.pend.length, tag: txItemHTML(tx).includes('tự ghi'), n: bankDB.merch['phuc long'].n, toast: document.getElementById('appModal').classList.contains('show') }; }, VCB2);
  ok(r3.a === 1 && r3.p === 0 && r3.item === 'Cafe' && r3.amt === 95000 && r3.auto && r3.bal && r3.tag && r3.n === 2, '3 lần sau cùng nơi chi "Phuc Long" khác số tiền: TỰ GHI vào Cafe, có nhãn "tự ghi"', r3);

  /* 4. dán lại đúng tin cũ → bỏ qua (trùng) */
  const r4 = await p.evaluate(t => { const n0 = txs.length, p0 = bankDB.pend.length; const rep = bankIngest(t); return { dup: rep.dup, same: txs.length === n0 && bankDB.pend.length === p0 }; }, VCB2);
  ok(r4.dup === 1 && r4.same, '4 dán lại tin đã nhập: bỏ qua, không ghi trùng', r4);

  /* 5. nơi chi quen nhưng cùng số tiền + ngày với khoản đã có → không tự ghi, chờ kiểm tra */
  const r5 = await p.evaluate(() => { const t = 'VCB: TK 0071xxxx1234 -95,000 VND luc 12/11/2026 09:30. ND: GD THE TAI PHUC LONG. SD: ***'; const rep = bankIngest(t); const p0 = bankDB.pend[0]; return { a: rep.auto.length, p: rep.pend, maybe: p0.maybeDup, warn: /cùng số tiền và ngày/.test(document.querySelector('.bk-card').innerText) }; });
  ok(r5.a === 0 && r5.p === 1 && r5.maybe && r5.warn, '5 trùng số tiền + ngày với khoản có sẵn: không tự ghi, cảnh báo chờ xác nhận', r5);
  const r5b = await p.evaluate(() => { bankApprove(); return { skipped: !txs.some(t => t.time === '09:30' && t.amount === 95000 && t.date === '2026-11-12'), still: bankDB.pend.some(x => x.maybeDup) }; });
  ok(r5b.skipped && r5b.still, '5b "Duyệt gợi ý" bỏ qua khoản nghi trùng (phải tự bạn quyết)', r5b);
  await p.evaluate(() => { bankDB.pend = bankDB.pend.filter(x => !x.maybeDup); saveAll(); });

  /* 6. Duyệt gợi ý cho khoản thường, đổi Thu/Chi, đổi ví nhớ theo ngân hàng, Bỏ qua, Không tính thu chi */
  const r6 = await p.evaluate(() => { const out = {}; const t1 = 'MB: TK 9999 +500,000 VND luc 13/11/2026 07:00. ND: NGUYEN VAN A chuyen tien an trua'; const rep = bankIngest(t1); const p1 = bankDB.pend[0]; out.income = p1.type === 'thu' && p1.amount === 500000;
    bankType(p1.id); out.toggled = bankDB.pend[0].type === 'chi'; bankType(p1.id); bankWallet(p1.id, '1'); out.walMem = bankDB.wal['MB Bank'] === '1' || bankDB.wal['MB Bank'] === 1;
    const rep2 = bankIngest('MB: TK 9999 -30,000 VND luc 13/11/2026 07:10. ND: GRAB'); const p2 = bankDB.pend[0]; out.walOK = String(p2.walletId) === '1';
    const n0 = txs.length; bankApprove(); out.approved = txs.length >= n0 + 2 && bankDB.pend.length === 0;
    const rep3 = bankIngest('VCB: TK 1 -700,000 VND luc 13/11/2026 09:00. ND: Chuyen tien ve vi cua minh'); const p3 = bankDB.pend[0]; bankNoCount(p3.id); const tx = txs[0]; out.nocf = tx.noCF === true && !isCashFlow(tx);
    const rep4 = bankIngest('VCB: TK 1 -800,000 VND luc 13/11/2026 09:30. ND: Chuyen tien ve vi cua minh'); out.nocfAuto = rep4.auto.length === 1 && txs[0].noCF === true;
    const rep5 = bankIngest('VCB: TK 1 -11,000 VND luc 13/11/2026 10:00. ND: Tiem la la'); bankSkip(bankDB.pend[0].id); out.skipped = bankDB.pend.length === 0;
    return out; });
  ok(Object.values(r6).every(Boolean), '6 khoản thu, đổi Thu/Chi, ví nhớ theo ngân hàng, Duyệt gợi ý, Không tính thu chi (nhớ), Bỏ qua', r6);

  /* 7. hoàn tác khoản tự ghi → xoá, trả số dư, quên nơi chi, quay lại chờ xác nhận */
  const r7 = await p.evaluate(() => { const rep = bankIngest('VCB: TK 0071xxxx1234 -60,000 VND luc 13/11/2026 11:00. ND: GD THE TAI PHUC LONG. SD: ***'); const a = rep.auto[0]; const b0 = wallets.find(w => w.id === 3).balance; const n0 = txs.length;
    bankUndoAuto(a.p.id); return { removed: txs.length === n0 - 1 && !txs.some(t => t.id === a.txId), bal: wallets.find(w => w.id === 3).balance === b0 + 60000, forgot: !bankDB.merch['phuc long'], back: bankDB.pend.some(x => x.key === 'phuc long') }; });
  ok(Object.values(r7).every(Boolean), '7 "Sai? Hoàn tác": xoá khoản, trả số dư, quên nơi chi, đưa về Chờ xác nhận', r7);
  await p.evaluate(() => { bankDB.pend = []; saveAll(); });

  /* 8. cài đặt: tắt tự ghi, quên 1 nơi, xoá tất cả */
  const r8 = await p.evaluate(() => { const o = {}; bankIngest('VIB: The 1***2 vua giao dich 50,000VND tai HIGHLANDS COFFEE luc 08:00.'); bankPick(bankDB.pend[0].id, 0); o.learned = !!bankDB.merch['highlands coffee'];
    openBankSettings(); o.list = document.querySelectorAll('.bk-mem').length >= 2; bankToggleAuto(); o.off = bankDB.auto === false;
    const rep = bankIngest('VIB: The 1***2 vua giao dich 55,000VND tai HIGHLANDS COFFEE luc 09:00.'); o.offPend = rep.auto.length === 0 && rep.pend === 1; bankDB.pend = []; bankToggleAuto(); o.on = bankDB.auto === true;
    openBankSettings(); const k = encodeURIComponent('highlands coffee'); bankForget(k); o.forgot = !bankDB.merch['highlands coffee'];
    return o; });
  ok(Object.values(r8).every(Boolean), '8 cài đặt: danh sách nơi chi đã nhớ, tắt/bật tự ghi, quên từng nơi', r8);
  await p.evaluate(() => { bankForgetAll(); }); await p.waitForTimeout(100);
  ok(await p.evaluate(() => Object.keys(bankDB.merch).length === 0), '8b "Xoá tất cả nơi chi đã nhớ"');

  /* 9. OTP / không phải giao dịch / rỗng / chưa có ví */
  const r9b = await p.evaluate(t => { const o = {}; const rep = bankIngest('VCB: Ma OTP 482913 de thanh toan 150,000 VND. Khong chia se ma nay.'); o.otp = rep.pend === 0 && rep.auto.length === 0 && rep.skip === 1 && !JSON.stringify(bankDB).includes('482913');
    const rep2 = bankIngest('Xin chao, khuyen mai cuoi nam giam 50%'); o.promo = rep2.pend === 0 && rep2.skip === 1; closeAppModal();
    const w0 = wallets; wallets = []; const n = bankDB.pend.length; const rep3 = bankIngest(t); wallets = w0; o.nowallet = rep3 === null && bankDB.pend.length === n; return o; }, VIB);
  ok(Object.values(r9b).every(Boolean), '9 tin OTP (mã không được lưu), tin quảng cáo bị bỏ qua; chưa có ví thì nhắc tạo ví, không mất tin', r9b);
  ok(p.dialogs.some(d => /tạo ví/.test(d)), '9b nhắc "Hãy tạo ví trước"', p.dialogs);

  /* 9c. che số tài khoản và số dư khi lưu nội dung tin */
  const r9c = await p.evaluate(() => { bankDB.pend = []; bankIngest('VCB: TK 0123456789 -20,000 VND luc 12/11/2026 05:00. ND: Test Mask. SD: 1,234,567 VND'); const raw = bankDB.pend[0].raw; const html = document.getElementById('appModalBody').innerHTML; closeAppModal();
    const dup = bankIngest('VCB: TK 0123456789 -20,000 VND luc 12/11/2026 05:00. ND: Test Mask. SD: 1,234,567 VND'); return { raw, hidden: !/0123456789|1,234,567/.test(raw + html + JSON.stringify(bankDB)), keepAmt: /20,000/.test(raw), dupStill: dup.dup === 1 }; });
  ok(r9c.hidden && /••••6789/.test(r9c.raw) && r9c.keepAmt && r9c.dupStill, '9c số tài khoản / số dư được che khi lưu; số tiền giao dịch giữ nguyên; chống trùng vẫn đúng', r9c);
  await p.evaluate(() => { bankDB.pend = []; saveAll(); });

  /* 10. an toàn: tin chứa mã HTML */
  const r10 = await p.evaluate(() => { bankDB.pend = []; bankIngest('VIB: The 1***2 vua giao dich 70,000VND tai <img src=x onerror="window.__x=1">QUAN AN luc 08:00.'); const html = document.getElementById('appModalBody').innerHTML; const x = !!window.__x; closeAppModal(); return { x, esc: !/<img src=x/.test(html) }; });
  ok(!r10.x && r10.esc, '10 tin chứa mã HTML: hiển thị an toàn, không bị chạy', r10);
  await p.evaluate(() => { bankDB.pend = []; saveAll(); });

  /* 11. thanh ở Tổng quan + menu Cài đặt */
  const r11 = await p.evaluate(() => { bankIngest('VCB: TK 1 -21,000 VND luc 13/11/2026 12:00. ND: Quan Lạ Một'); closeAppModal(); showScreen('home'); const bar = document.getElementById('bankBar'); showScreen('more');
    return { paste: !!bar.querySelector('.bb-paste'), pend: bar.querySelector('.bb-pend') && bar.querySelector('.bb-pend').innerText, menu: document.getElementById('more-bank').innerText, inSec: [...document.querySelectorAll('#screen-more .more-sec')].some(h => h.textContent === 'Ghi chép') }; });
  ok(r11.paste && /Chờ xác nhận\s*1/.test(r11.pend) && /1 khoản chờ xác nhận/.test(r11.menu), '11 Tổng quan có nút "📋 Dán tin ngân hàng" + "Chờ xác nhận 1"; menu Cài đặt hiện số khoản chờ', r11);
  await p.evaluate(() => { bankDB.pend = []; saveAll(); });

  /* 12. nút dán nhanh đọc bộ nhớ tạm; không có tin thì mở ô dán */
  await p.ctx.grantPermissions(['clipboard-read', 'clipboard-write'], { origin: new URL(BASE).origin });
  await p.evaluate(t => navigator.clipboard.writeText(t), 'VCB: TK 7 -45,000 VND luc 09/11/2026 06:00. ND: GD THE TAI SHOP MOI. SD: ***');
  await p.evaluate(() => showScreen('home')); await p.click('.bb-paste'); await p.waitForTimeout(500);
  ok(await p.evaluate(() => bankDB.pend.length === 1 && /Chờ xác nhận/.test(document.querySelector('.bk-head h3').innerText)), '12 bấm "Dán tin ngân hàng": đọc bộ nhớ tạm và nhận tin');
  await p.evaluate(() => { closeAppModal(); bankDB.pend = []; saveAll(); navigator.clipboard.writeText('xin chao ban'); }); await p.click('.bb-paste'); await p.waitForTimeout(500);
  ok(await p.evaluate(() => !!document.getElementById('bkText') && bankDB.pend.length === 0), '12b bộ nhớ tạm không có tin ngân hàng: mở ô dán thủ công'); await p.evaluate(() => closeAppModal());
  /* ô dán + "Xem trước kỹ" vẫn dùng được luồng cũ */
  const r12 = await p.evaluate(t => { openSmsImport(); document.getElementById('bkText').value = t; bankClassic(); const ta = document.getElementById('smsText'); const v = ta && ta.value; closeAppModal(); return v; }, VCB);
  ok(r12 === VCB, '12c "Xem trước kỹ" mở màn xem trước cũ kèm nội dung đã dán');
  const r12b = await p.evaluate(t => { openSmsImport(); document.getElementById('bkText').value = t; bankGo(); return { m: bankDB.pend.length }; }, 'VIB: The 1***2 vua giao dich 81,000VND tai TIEM BANH XYZ luc 08:00.');
  ok(r12b.m === 1, '12d "Ghi nhanh" từ ô dán'); await p.evaluate(() => { closeAppModal(); bankDB.pend = []; saveAll(); });

  /* 13. lưu / tải lại / đồng bộ / sao lưu / xoá sạch */
  const r13 = await p.evaluate(async t => { bankDB.pend = []; bankDB.merch = {}; bankIngest(t); closeAppModal(); bankPick(bankDB.pend[0].id, 0); bankIngest('VIB: The 1***2 vua giao dich 70,000VND tai QUAN LA luc 08:00.'); closeAppModal();
    const payload = JSON.parse(JSON.stringify(buildCloudPayload())); const hasPayload = !!payload.bankDB && Object.keys(payload.bankDB.merch).length === 1 && payload.bankDB.pend.length === 1;
    let file = null; const orig = window.downloadFile; window.downloadFile = async c => { file = c; return true; }; await exportJSON(); window.downloadFile = orig; const hasBackup = !!JSON.parse(file).bankDB && JSON.parse(file).bankDB.pend.length === 1;
    const snap = JSON.stringify(bankDB); bankDB = bankDBFix(null); applyCloudPayload(payload); const sync = JSON.stringify(bankDB) === snap;
    bankDB = bankDBFix(null); const f = new File([file], 'bk.json'); const inp = document.getElementById('importFileInput'); const dt = new DataTransfer(); dt.items.add(f); inp.files = dt.files; inp.dispatchEvent(new Event('change')); await new Promise(r => setTimeout(r, 400));
    const restored = JSON.stringify(bankDB) === snap; return { hasPayload, hasBackup, sync, restored, ls: !!localStorage.getItem('tc_bankdb') }; }, 'VCB: TK 7 -33,000 VND luc 10/11/2026 06:00. ND: GD THE TAI PHUC LONG. SD: ***');
  ok(Object.values(r13).every(Boolean), '13 dữ liệu nhớ + chờ xác nhận có trong đồng bộ Google, sao lưu JSON, khôi phục và bộ nhớ máy', r13);
  await p.reload(); await p.waitForTimeout(1200);
  ok(await p.evaluate(() => bankDB.pend.length === 1 && Object.keys(bankDB.merch).length === 1 && document.querySelector('.bb-pend b').textContent === '1'), '13b tải lại trang vẫn còn nơi chi đã nhớ và khoản đang chờ');
  ok(await p.evaluate(() => { const old = bankDBFix(null); return old.auto === true && Array.isArray(old.pend) && bankDBFix({ merch: 5, pend: 'x', auto: false }).auto === false && bankDBFix({ merch: 5, pend: 'x' }).pend.length === 0; }), '13c dữ liệu hỏng/thiếu được chuẩn hoá, không gây lỗi');
  ok(p.errs.length === 0, 'không lỗi JS (điện thoại)', p.errs); await p.ctx.close();

  /* 14. mở link ?sms=… (Phím tắt iPhone / MacroDroid) */
  p = await page(browser, { tc_wallets: W, tc_txs: TX }, { url: BASE + '?sms=' + encodeURIComponent(VCB) });
  await p.waitForTimeout(800);
  const r14 = await p.evaluate(() => ({ pend: bankDB.pend.length, url: location.search, modal: document.getElementById('appModal').classList.contains('show') }));
  ok(r14.pend === 1 && r14.url === '' && r14.modal, '14 mở link ?sms=…: tự nhận tin, xoá tham số khỏi địa chỉ, hiện Chờ xác nhận', r14);
  ok(p.errs.length === 0, '14b không lỗi JS', p.errs); await p.ctx.close();

  /* 15. người dùng cũ chưa có bankDB + giao diện sáng + máy tính */
  p = await page(browser, { tc_wallets: W, tc_txs: TX, tc_skin: 'apple' }, { viewport: { width: 1400, height: 900 }, hasTouch: false, isMobile: false });
  const r15 = await p.evaluate(t => { const ok1 = bankDB.auto === true && bankDB.pend.length === 0; bankIngest(t); const card = document.querySelector('.bk-card'); const cs = getComputedStyle(card); const chip = getComputedStyle(document.querySelector('.bk-chip.star'));
    return { ok1, bg: cs.backgroundColor, star: chip.backgroundColor, w: Math.round(document.querySelector('.bk-box').getBoundingClientRect().width) }; }, VIB);
  ok(r15.ok1 && /255, 255, 255/.test(r15.bg) && r15.w > 200, '15 người dùng cũ (chưa có dữ liệu mới) + giao diện Apple + máy tính: hiện đúng, không lỗi', r15);
  ok(p.errs.length === 0, '15b không lỗi JS (máy tính)', p.errs); await p.ctx.close();

  console.log((fail ? fails.map(f => '✘ ' + f).join('\n') + '\n' : '') + '✔ Đạt: ' + pass + '   ✘ Lỗi: ' + fail);
  await browser.close(); process.exit(fail ? 1 : 0);
})();
