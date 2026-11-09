/* Kiểm tra trước golive: tệp đủ, phiên bản khớp, chạy offline, người dùng mới (không dữ liệu). Chạy: python3 -m http.server 8765  rồi  node tests/golive.js */
const { chromium } = require('playwright'); const fs = require('fs'); const path = require('path');
const ROOT = path.join(__dirname, '..'); const BASE = process.env.BASE || 'http://localhost:8765/';
let pass = 0, fail = 0; const fails = [];
function ok(c, n, x) { if (c) pass++; else { fail++; fails.push(n + (x !== undefined ? ' → ' + JSON.stringify(x).slice(0, 400) : '')); } }
(async () => {
  /* 1. phiên bản khớp ở mọi chỗ */
  const v = JSON.parse(fs.readFileSync(path.join(ROOT, 'version.json'), 'utf8')).v;
  const app = fs.readFileSync(path.join(ROOT, 'app.js'), 'utf8'), sw = fs.readFileSync(path.join(ROOT, 'sw.js'), 'utf8'), html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  const vs = [...(sw + html).matchAll(/\?v=(\d+)/g)].map(m => m[1]);
  ok(app.includes("const APP_VERSION='" + v + "'") && sw.includes("const CACHE='stc-v" + v + "'") && vs.length > 10 && vs.every(x => x === v), 'phiên bản ' + v + ' khớp ở version.json, app.js, sw.js, index.html', [...new Set(vs)]);
  /* 2. mọi tệp trong danh sách offline + mọi script/css trong index.html đều tồn tại */
  const core = JSON.parse(sw.match(/const CORE=(\[[^\]]+\])/)[1].replace(/'/g, '"')).filter(u => u !== './');
  const refs = [...html.matchAll(/(?:src|href)="([^"#:]+?)(?:\?v=\d+)?"/g)].map(m => m[1]).filter(u => /\.(js|css|png|json|jpg)$/.test(u));
  const missing = [...new Set([...core.map(u => u.split('?')[0]), ...refs])].filter(f => !fs.existsSync(path.join(ROOT, f)));
  ok(missing.length === 0, 'mọi tệp app cần đều có', missing);
  const scripts = [...html.matchAll(/<script src="([^"?]+)/g)].map(m => m[1]).filter(s => !/^https?:/.test(s));
  const notOffline = scripts.filter(s => !core.some(c => c.split('?')[0] === s));
  ok(notOffline.length === 0, 'mọi script đều có trong bộ nhớ offline', notOffline);

  const browser = await chromium.launch();
  /* 3. offline */
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } }); const p = await ctx.newPage(); const errs = [];
  p.on('pageerror', e => errs.push(e.message)); p.on('dialog', d => d.accept());
  await p.addInitScript(() => { if (!sessionStorage.getItem('seeded')) { sessionStorage.setItem('seeded', '1'); localStorage.clear(); localStorage.setItem('tc_cloud_gate_skip', '1');
    localStorage.setItem('tc_wallets', JSON.stringify([{ id: 1, name: 'Tiền mặt', type: 'cash', balance: 100000 }])); } });
  await p.goto(BASE + 'index.html'); await p.waitForTimeout(800);
  await p.evaluate(() => navigator.serviceWorker.ready); await p.reload(); await p.waitForTimeout(1500);
  const cached = await p.evaluate(async () => { const ks = await caches.keys(); const c = await caches.open(ks.find(k => k.startsWith('stc-'))); return (await c.keys()).length; });
  await ctx.setOffline(true); await p.reload(); await p.waitForTimeout(1500);
  const off = await p.evaluate(() => ({ title: document.title, fns: ['renderHome', 'openWalletQuick', 'saveAndNext', 'openHistSearch', 'renderDebtCard'].every(f => typeof window[f] === 'function'), bal: document.getElementById('homeBalance').innerText }));
  ok(cached >= 15 && off.title === 'Sổ Thu Chi' && off.fns && /100/.test(off.bal), 'tắt mạng rồi mở lại: app vẫn chạy đủ chức năng, còn dữ liệu', { cached, off });
  await ctx.setOffline(false); ok(errs.length === 0, 'không lỗi JS khi offline', errs); await ctx.close();
  /* 4. người dùng mới, chưa có dữ liệu */
  for (const vp of [{ width: 390, height: 844 }, { width: 1400, height: 900 }]) {
    const c2 = await browser.newContext({ viewport: vp }); const p2 = await c2.newPage(); const e2 = [];
    p2.on('pageerror', e => e2.push(e.message)); p2.on('dialog', d => d.accept());
    await p2.addInitScript(() => { if (!sessionStorage.getItem('seeded')) { sessionStorage.setItem('seeded', '1'); localStorage.clear(); localStorage.setItem('tc_cloud_gate_skip', '1'); } });
    await p2.goto(BASE + 'index.html'); await p2.waitForTimeout(1200);
    const bad = await p2.evaluate(async () => { const out = []; for (const s of [...document.querySelectorAll('.screen')].map(x => x.id.slice(7)).filter(x => !['admin', 'cloud'].includes(x))) { try { showScreen(s); } catch (e) { out.push(s + ': ' + e.message); } await new Promise(r => setTimeout(r, 80)); }
      try { showScreen('report'); toggleRepDetail('chi'); openAdvances(); closeAppModal(); showScreen('history'); setSelMode(true); selAll(); setSelMode(false); openToday(); showScreen('add'); saveAndNext(); } catch (e) { out.push('thao tác: ' + e.message); } return out; });
    ok(bad.length === 0 && e2.length === 0, 'người dùng mới (' + vp.width + 'px): mở mọi màn hình, thao tác chính không lỗi', { bad, e2 });
    await c2.close();
  }
  console.log((fail ? fails.map(f => '✘ ' + f).join('\n') + '\n' : '') + '✔ Đạt: ' + pass + '   ✘ Lỗi: ' + fail);
  await browser.close(); process.exit(fail ? 1 : 0);
})();
