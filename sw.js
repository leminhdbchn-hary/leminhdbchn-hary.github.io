/* Sổ Thu Chi – service worker: chạy khi mất mạng, tải nhanh hơn */
const CACHE='stc-v75';
const CORE=['./','index.html','app.css?v=75','app.js?v=75','cloud.js?v=75','skin.js?v=75','store.js?v=75','features.js?v=75','sms.js?v=75','ux.js?v=75','manifest.json','icon-192.png?v=75','icon-512.png?v=75','apple-touch-icon.png?v=75','favicon.png?v=75','pets/stage1.jpg','characters/char1.jpg'];
self.addEventListener('install',e=>{
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(c=>Promise.all(CORE.map(u=>c.add(u).catch(()=>{})))));
});
self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',e=>{
  const req=e.request;if(req.method!=='GET')return;
  const url=new URL(req.url);if(url.origin!==location.origin)return;
  if(/\.(mp4|webm|mov)$/i.test(url.pathname)||req.headers.get('range'))return; /* video: để trình duyệt tự xử lý */
  if(url.pathname.endsWith('version.json'))return;
  const isPage=req.mode==='navigate'||/\.(html|js|css|json)$/i.test(url.pathname)||url.pathname.endsWith('/');
  if(isPage){
    /* mạng trước (luôn lấy bản mới), mất mạng thì dùng bản đã lưu */
    e.respondWith(fetch(req.url,{cache:'no-store',credentials:'same-origin'}).then(r=>{if(r.ok){const cp=r.clone();caches.open(CACHE).then(c=>c.put(req,cp));}return r;})
      .catch(()=>caches.match(req,{ignoreSearch:req.mode==='navigate'}).then(r=>r||caches.match('index.html'))));
    return;
  }
  /* ảnh, icon: lấy từ bộ nhớ trước cho nhanh */
  e.respondWith(caches.match(req).then(hit=>hit||fetch(req).then(r=>{if(r.ok){const cp=r.clone();caches.open(CACHE).then(c=>c.put(req,cp));}return r;})));
});
