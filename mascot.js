/* Sổ Thu Chi – linh vật Mèo Xu (v99): chỉ để trang trí, không có chữ.
   - Mèo ôm lịch + túi tiền ở góc trên bên phải thẻ chào (Tổng quan)
   - Các màn trống dùng tư thế phù hợp 
   Ảnh (người dùng gửi, đã tách nền): mascot/hug|wave|bag|hold.webp */
(function(){
const V='100';
const src=n=>'mascot/'+n+'.webp?v='+V;
const pick={accList:'bag',debtList:'wave',loanList:'hold',topSpendList:'wave'};
function img(n,cls){return '<img class="'+cls+'" src="'+src(n)+'" alt="" aria-hidden="true" decoding="async" draggable="false">';}
window.Mascot={src:src,img:img};
function head(){
  const h=document.querySelector('#screen-home .home-head');
  if(!h||h.querySelector('.mx-head'))return;
  h.classList.add('has-mx');h.insertAdjacentHTML('beforeend',img('hug','mx-head'));
}
function empties(){
  document.querySelectorAll('.empty-rich .er-ic:not([data-mx])').forEach(e=>{
    e.dataset.mx='1';const box=e.closest('[id]');const n=(box&&pick[box.id])||'hold';
    e.innerHTML=img(n,'mx-empty');e.classList.add('er-mx');});
}
function update(){try{head();empties();}catch(e){}}
let raf=0;const mo=new MutationObserver(()=>{if(raf)return;raf=requestAnimationFrame(()=>{raf=0;update();});});
function start(){update();mo.observe(document.body,{childList:true,subtree:true});}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(start,0));else setTimeout(start,0);
})();
