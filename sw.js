/* Sổ Thu Chi – service worker: chạy khi mất mạng, tải nhanh hơn */
const CACHE='stc-v78';
const CORE=['./','index.html','app.css?v=78','app.js?v=78','cloud.js?v=78','skin.js?v=78','store.js?v=78','features.js?v=78','sms.js?v=78','ux.js?v=78','more.js?v=78','manifest.json','icon-192.png?v=78','icon-512.png?v=78','apple-touch-icon.png?v=78','favicon.png?v=78','pets/stage1.jpg','characters/char1.jpg'];
self.addEventListener('install',e=>{
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(c=>Promise.all(CORE.map(u=>c.add(u).catch(()=>{})))));
});
self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
/* bấm thông báo nhắc trả nợ vay → mở app */
self.addEventListener('notificationclick',e=>{
  e.notification.close();
  e.waitUntil(self.clients.matchAll({type:'window',includeUncontrolled:true}).then(cs=>{for(const c of cs){if('focus' in c)return c.focus();}return self.clients.openWindow('./');}));
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
