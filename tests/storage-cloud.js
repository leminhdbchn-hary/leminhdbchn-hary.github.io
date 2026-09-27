/* Kiểm thử lưu trữ (localStorage đầy → IndexedDB) và nén dữ liệu Cloud (giả lập Firebase).
   Chạy: python3 -m http.server 8765  (ở thư mục gốc)  rồi  node tests/storage-cloud.js */
const { chromium } = require('playwright');
const BASE = process.env.BASE || 'http://localhost:8765/index.html';
let pass = 0, fail = 0; const fails = [];
const ok = (c, n, x) => { if (c) pass++; else { fail++; fails.push(n + (x !== undefined ? ' → ' + JSON.stringify(x).slice(0, 300) : '')); } };
const MOCK = {
  'firebase-app.js': `export function initializeApp(){return {};}`,
  'firebase-auth.js': `export function getAuth(){return {};}
    export class GoogleAuthProvider{setCustomParameters(){}}
    export async function signInWithPopup(){return {user:{uid:'u1',email:'t@x.vn'}};}
    export async function signInWithRedirect(){} export async function getRedirectResult(){return null;}
    export async function signOut(){}
    export function onAuthStateChanged(a,cb){setTimeout(()=>cb(window.__mockUser||null),0);}`,
  'firebase-firestore.js': `const S=window.__fs=window.__fs||{};
    export function getFirestore(){return {};}
    export function doc(db,...p){return {path:p.join('/')};}
    export async function getDoc(r){const d=S[r.path];return {exists:()=>!!d,data:()=>d};}
    export function writeBatch(){const ops=[];return {set(r,d){ops.push([r,d]);},async commit(){ops.forEach(([r,d])=>{S[r.path]=JSON.parse(JSON.stringify(d));});}};}`
};
(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  await ctx.route('https://www.gstatic.com/firebasejs/**', route => {
    const f = Object.keys(MOCK).find(k => route.request().url().endsWith(k));
    route.fulfill({ status: 200, contentType: 'application/javascript', body: f ? MOCK[f] : '' });
  });
  const p = await ctx.newPage(); const errs = [];
  p.on('pageerror', e => errs.push(e.message)); p.on('dialog', d => d.accept());
  await p.addInitScript(() => {
    if (sessionStorage.getItem('mu')) window.__mockUser = { uid: 'u1', email: 't@x.vn' };
    if (!sessionStorage.getItem('s')) { sessionStorage.setItem('s', '1'); localStorage.clear(); localStorage.setItem('tc_cloud_gate_skip', '1');
      localStorage.setItem('tc_wallets', JSON.stringify([{ id: 1, name: 'Tiền mặt', type: 'cash', balance: 1000000 }])); }
  });
  await p.goto(BASE); await p.waitForTimeout(1200);

  /* A. localStorage đầy → IndexedDB là bản chính */
  await p.evaluate(() => { for (let i = 0; i < 50; i++) txs.push({ id: i + 1, type: 'chi', amount: 1000, group: 'Ăn uống', item: 'Cafe', icon: 'e:☕', date: '2026-09-01', time: '08:00' }); saveAll(); });
  await p.evaluate(() => { const o = Storage.prototype.setItem; window.__o = o; Storage.prototype.setItem = function (k, v) { if (k === 'tc_txs') throw new DOMException('full', 'QuotaExceededError'); return o.call(this, k, v); }; });
  await p.evaluate(() => { txs.push({ id: 999, type: 'chi', amount: 5000, group: 'Ăn uống', item: 'Cafe', icon: 'e:☕', date: '2026-09-02', time: '09:00' }); saveAll(); });
  await p.waitForTimeout(400);
  ok(await p.evaluate(() => localStorage.getItem('tc_ls_partial') === '1' && localStorage.getItem('tc_txs') === null), 'đánh dấu localStorage đầy');
  await p.evaluate(() => { Storage.prototype.setItem = window.__o; });
  await p.reload(); await p.waitForTimeout(1500);
  ok(await p.evaluate(() => txs.length) === 51, 'tải lại lấy đủ dữ liệu từ IndexedDB', await p.evaluate(() => txs.length));
  ok(await p.evaluate(() => !document.documentElement.classList.contains('idb-wait')), 'đã tắt màn chờ tải');
  await p.evaluate(() => saveAll()); await p.waitForTimeout(300);
  ok(await p.evaluate(() => localStorage.getItem('tc_ls_partial') === null && JSON.parse(localStorage.getItem('tc_txs')).length === 51), 'localStorage trống chỗ lại → hết chế độ đầy');

  /* B. Cloud: nén khi dữ liệu lớn, đọc lại đúng */
  await p.evaluate(() => { sessionStorage.setItem('mu', '1'); });
  await p.reload(); await p.waitForTimeout(1500);
  const big = await p.evaluate(async () => {
    const note = 'Ghi chú tiếng Việt có dấu – '.repeat(8);
    for (let i = 0; i < 6000; i++) txs.push({ id: 100000 + i, type: 'chi', amount: 1000 + i, group: 'Ăn uống', item: 'Cafe', icon: 'e:☕', note, date: '2026-08-' + String(1 + i % 28).padStart(2, '0'), time: '08:00' });
    const raw = JSON.stringify(buildCloudPayload()).length;
    await Cloud.pushState(buildCloudPayload(), { force: true });
    const meta = window.__fs['users/u1'];
    const back = await Cloud.pullState();
    return { raw, z: meta.z, size: meta.size, n: meta.n, same: JSON.stringify(back.txs) === JSON.stringify(txs) };
  });
  ok(big.raw > 1000000 && big.z === 1 && big.size < big.raw / 3 && big.same, 'cloud nén + đọc lại đúng', big);
  const small = await p.evaluate(async () => { txs = txs.slice(0, 10); await Cloud.pushState(buildCloudPayload(), { force: true }); const m = window.__fs['users/u1']; const b = await Cloud.pullState(); return { z: m.z, same: b.txs.length === 10 }; });
  ok(small.z === 0 && small.same, 'cloud dữ liệu nhỏ không nén', small);
  ok(errs.length === 0, 'không lỗi JS', errs);
  await browser.close();
  console.log('✔ Đạt: ' + pass + '   ✘ Lỗi: ' + fail); fails.forEach(f => console.log('  ✘ ' + f));
  process.exit(fail ? 1 : 0);
})();
