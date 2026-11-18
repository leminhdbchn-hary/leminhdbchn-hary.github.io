/* Sổ Thu Chi – linh vật "Mèo Xu" (v98): mèo con vẽ bằng SVG, nói vài câu theo tình hình thu chi.
   - Thẻ Mèo Xu ở Tổng quan (bấm vào để mèo kêu "meo" và nói câu khác)
   - Thay biểu tượng ở các màn trống    - Window.Mascot.svg(mood,size) cho nơi khác dùng */
(function(){
const $=id=>document.getElementById(id);
const MOODS=['happy','sleepy','worry','wow'];
function svg(mood,size,peek){
  mood=MOODS.indexOf(mood)>=0?mood:'happy';size=size||96;
  const eyes={
    happy:'<ellipse cx="46" cy="58" rx="5.2" ry="6.4" fill="#3b2a20"/><ellipse cx="74" cy="58" rx="5.2" ry="6.4" fill="#3b2a20"/><circle cx="47.8" cy="55.6" r="1.9" fill="#fff"/><circle cx="75.8" cy="55.6" r="1.9" fill="#fff"/>',
    wow:'<circle cx="46" cy="58" r="7" fill="#3b2a20"/><circle cx="74" cy="58" r="7" fill="#3b2a20"/><circle cx="48.4" cy="55.2" r="2.6" fill="#fff"/><circle cx="76.4" cy="55.2" r="2.6" fill="#fff"/>',
    sleepy:'<path d="M40 59q6 6 12 0M68 59q6 6 12 0" fill="none" stroke="#3b2a20" stroke-width="3" stroke-linecap="round"/><text x="88" y="38" font-size="13" font-weight="700" fill="#8a9bb0" font-family="sans-serif">z</text><text x="96" y="28" font-size="10" font-weight="700" fill="#8a9bb0" font-family="sans-serif">z</text>',
    worry:'<ellipse cx="46" cy="59" rx="5" ry="6" fill="#3b2a20"/><ellipse cx="74" cy="59" rx="5" ry="6" fill="#3b2a20"/><circle cx="47.6" cy="56.8" r="1.8" fill="#fff"/><circle cx="75.6" cy="56.8" r="1.8" fill="#fff"/><path d="M38 47l12 3M82 47l-12 3" stroke="#3b2a20" stroke-width="2.4" stroke-linecap="round"/><path d="M92 50q4 6 0 10q-4-4 0-10z" fill="#7cc4f2"/>'
  }[mood];
  const mouth=mood==='worry'?'<path d="M55 73q5-4 10 0" fill="none" stroke="#3b2a20" stroke-width="2.4" stroke-linecap="round"/>':
    mood==='wow'?'<ellipse cx="60" cy="74" rx="3.4" ry="4" fill="#c0504d"/>':
    '<path d="M54 70q3 5 6 0q3 5 6 0" fill="none" stroke="#3b2a20" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>';
  const defs='<defs><radialGradient id="mxF" cx="42%" cy="28%" r="80%"><stop offset="0" stop-color="#ffd9a6"/><stop offset=".55" stop-color="#f7b36a"/><stop offset="1" stop-color="#e58f3f"/></radialGradient>'+
    '<radialGradient id="mxB" cx="50%" cy="30%" r="80%"><stop offset="0" stop-color="#fffaf0"/><stop offset="1" stop-color="#ffe6c4"/></radialGradient>'+
    '<radialGradient id="mxC" cx="35%" cy="30%" r="75%"><stop offset="0" stop-color="#ffe98a"/><stop offset=".6" stop-color="#f5c542"/><stop offset="1" stop-color="#d9981c"/></radialGradient></defs>';
  const coin='<g class="mx-coin"><circle cx="97" cy="90" r="12" fill="url(#mxC)" stroke="#c98a14" stroke-width="2"/><circle cx="97" cy="90" r="8.4" fill="none" stroke="#e0a82a" stroke-width="1.2"/><text x="97" y="95" text-anchor="middle" font-size="13" font-weight="800" fill="#a96f0a" font-family="sans-serif">₫</text><path d="M90 84q3-4 8-4" stroke="#fff6c8" stroke-width="2" stroke-linecap="round" fill="none"/></g>';
  const paws='<g><ellipse cx="40" cy="97" rx="12" ry="8" fill="url(#mxB)" stroke="#ecc79a" stroke-width="1"/><ellipse cx="78" cy="97" rx="12" ry="8" fill="url(#mxB)" stroke="#ecc79a" stroke-width="1"/><path d="M36 93v5M41 92v6M46 93v5M74 93v5M79 92v6M84 93v5" stroke="#e3b583" stroke-width="1.3" stroke-linecap="round"/></g>';
  const body=peek?'':'<path class="mx-tail" d="M88 104q26-2 22-26q-2-10-9-8" fill="none" stroke="#f2a65a" stroke-width="9" stroke-linecap="round"/><ellipse cx="60" cy="100" rx="30" ry="18" fill="url(#mxF)"/><ellipse cx="60" cy="104" rx="19" ry="12" fill="url(#mxB)"/><ellipse cx="46" cy="114" rx="9" ry="5.5" fill="url(#mxB)"/><ellipse cx="74" cy="114" rx="9" ry="5.5" fill="url(#mxB)"/>';
  return '<svg class="mx-svg" viewBox="'+(peek?'0 6 120 98':'0 0 120 120')+'" width="'+size+'" height="'+(peek?Math.round(size*98/120):size)+'" role="img" aria-label="Mèo Xu" xmlns="http://www.w3.org/2000/svg">'+defs+body+
    '<ellipse cx="60" cy="'+(peek?100:118)+'" rx="38" ry="4" fill="#000" opacity=".12"/>'+
    '<path d="M24 52L22 20q-1-6 5-3l22 14z" fill="url(#mxF)"/><path d="M96 52l2-32q1-6-5-3L71 31z" fill="url(#mxF)"/>'+
    '<path d="M28 40l-1-14 12 8z" fill="#ffb7b7"/><path d="M92 40l1-14-12 8z" fill="#ffb7b7"/>'+
    '<ellipse cx="60" cy="62" rx="40" ry="34" fill="url(#mxF)"/><ellipse cx="44" cy="40" rx="14" ry="7" fill="#fff" opacity=".22" transform="rotate(-20 44 40)"/>'+
    '<path d="M60 30v10M50 32l2 8M70 32l-2 8" stroke="#e08e3c" stroke-width="3.2" stroke-linecap="round"/>'+
    '<path d="M20 60h7M21 68l7-2M100 60h-7M99 68l-7-2" stroke="#e08e3c" stroke-width="3" stroke-linecap="round"/>'+
    '<ellipse cx="60" cy="72" rx="17" ry="13" fill="url(#mxB)"/>'+eyes+
    '<ellipse cx="35" cy="70" rx="6.5" ry="4" fill="#ff9d9d" opacity=".7"/><ellipse cx="85" cy="70" rx="6.5" ry="4" fill="#ff9d9d" opacity=".7"/>'+
    '<path d="M56.5 65.5h7l-3.5 4z" fill="#ff7e8b"/>'+mouth+
    '<path d="M30 74l-14-3M30 78l-14 2M90 74l14-3M90 78l14 2" stroke="#8a6a4a" stroke-width="1.4" stroke-linecap="round" opacity=".6"/>'+
    (peek?paws:'')+((mood==='happy'||mood==='wow')?(peek?coin:coin.replace(/cx="97" cy="90"/g,'cx="90" cy="96"').replace('x="97" y="95"','x="90" y="101"')):'')+'</svg>';
}
window.Mascot={svg:svg,name:'Mèo Xu'};

/* --------- lời nhắn theo tình hình --------- */
const fmt=v=>Math.round(v).toLocaleString('vi-VN')+'đ';
function todayStr(){const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');}
function stats(){
  let T=[];try{T=Array.isArray(txs)?txs:[];}catch(e){}
  const td=todayStr(),mo=td.slice(0,7);let chi=0,thu=0,today=0;
  T.forEach(t=>{if(!t)return;let cf=true;try{if(typeof isCashFlow==='function')cf=isCashFlow(t);}catch(e){}
    if(t.date===td)today++;
    if(!cf||String(t.date||'').slice(0,7)!==mo)return;
    if(t.type==='chi')chi+=+t.amount||0;else if(t.type==='thu')thu+=+t.amount||0;});
  return {all:T.length,today,chi,thu,hour:new Date().getHours()};
}
function lines(){
  const s=stats(),L=[];
  if(!s.all){return {mood:'happy',msgs:['Meo~ Mình là Mèo Xu! Ghi khoản đầu tiên cùng mình nhé.','Bấm nút ＋ bên dưới để ghi khoản thu chi đầu tiên nha!']};}
  if(!s.today&&s.hour>=18)L.push(['worry','Tối rồi mà hôm nay chưa ghi khoản nào. Ghi nhanh kẻo quên nhé!']);
  else if(!s.today&&s.hour<9)L.push(['sleepy','Meo… sáng sớm quá. Có chi tiêu gì thì nhớ ghi nha.']);
  else if(!s.today)L.push(['happy','Hôm nay bạn chưa ghi khoản nào. Có gì thì ghi cho Mèo Xu nhé!']);
  else L.push(['happy','Hôm nay bạn đã ghi '+s.today+' khoản. Giỏi quá, meo!']);
  if(s.thu>0&&s.chi>s.thu)L.push(['worry','Tháng này chi nhiều hơn thu '+fmt(s.chi-s.thu)+'. Mình cùng cân đối lại nhé.']);
  else if(s.thu>0&&s.chi>0)L.push(['wow','Tháng này bạn dư '+fmt(s.thu-s.chi)+'. Tiết kiệm giỏi ghê!']);
  else if(s.chi>0)L.push(['happy','Tháng này bạn đã chi '+fmt(s.chi)+'. Cứ ghi đều là được nha.']);
  L.push(['happy','Ghi đều mỗi ngày, cuối tháng nhìn lại sẽ thấy rõ tiền đi đâu.']);
  return {mood:L[0][0],msgs:L.map(x=>x[1]),moods:L.map(x=>x[0])};
}

/* --------- thẻ ở Tổng quan --------- */
let idx=0,lastKey='';
function card(){
  const home=$('screen-home');if(!home)return null;
  let c=$('mascotCard');
  if(!c){const head=home.querySelector('.balance-card')||home.querySelector('.home-head');if(!head)return null;
    c=document.createElement('div');c.id='mascotCard';c.className='mx-card normal-only';c.setAttribute('role','button');c.tabIndex=0;c.setAttribute('aria-label','Mèo Xu, bấm để nghe câu khác');
    c.innerHTML='<div class="mx-pic" id="mxPic"></div><div class="mx-bubble"><b class="mx-name">Mèo Xu</b><span id="mxMsg"></span></div>';
    head.parentNode.insertBefore(c,head.nextSibling);
    const go=()=>{idx++;paint(true);};
    c.addEventListener('click',go);c.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();go();}});}
  return c;
}
function paint(bounce){
  const c=card();if(!c)return;const L=lines(),i=idx%L.msgs.length,mood=(L.moods||[L.mood])[i]||L.mood;
  const key=mood+'|'+L.msgs[i];
  if(key!==lastKey){lastKey=key;$('mxPic').innerHTML=svg(mood,104,true);$('mxMsg').textContent=L.msgs[i];}
  if(bounce){c.classList.remove('mx-hop');void c.offsetWidth;c.classList.add('mx-hop');}
}
/* --------- màn trống: thay emoji bằng mèo --------- */
function emptyCats(){document.querySelectorAll('.empty-rich .er-ic:not([data-mx])').forEach(e=>{e.dataset.mx='1';e.innerHTML=svg('sleepy',72);});}
function update(){paint(false);emptyCats();}
let raf=0;const mo=new MutationObserver(()=>{if(raf)return;raf=requestAnimationFrame(()=>{raf=0;update();});});
function start(){update();mo.observe(document.body,{childList:true,subtree:true});
  const r=window.renderHome;if(typeof r==='function'&&!r.__mx){const w=function(){const v=r.apply(this,arguments);try{update();}catch(e){}return v;};w.__mx=1;window.renderHome=w;}
  document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')update();});}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(start,0));else setTimeout(start,0);
})();
