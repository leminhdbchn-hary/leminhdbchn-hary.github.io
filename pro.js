/* Sổ Thu Chi – chuyên nghiệp hoá (v93):
    2. Số tiền: chữ "VND" nhỏ, mờ            3. Tiêu đề màn hình thu nhỏ khi cuộn
    4. Biểu đồ: tông vàng                      6. Khung chờ khi đang làm mới
    7. Phản hồi khi bấm, số tiền "chạy"        8. Kéo xuống để làm mới / đồng bộ (Tổng quan)
    9. Màn trống có hướng dẫn                 10. Màn chào người mới (3 bước)
   11. Hộp thông báo / xác nhận / nhập kiểu của app (thay hộp mặc định của trình duyệt)
   12. Màn khởi động                          13. Tự khoá sau N phút                14. Giới thiệu & Bảo mật
   (1, 5 và phần lớn giao diện nằm trong app.css) */
(function(){
function $(id){return document.getElementById(id);}
function lsGet(k){try{return localStorage.getItem(k);}catch(e){return null;}}
function lsSet(k,v){try{localStorage.setItem(k,v);}catch(e){}}
function H(s){return String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
const AUTO=()=>!!navigator.webdriver&&!window.__proOn; /* chạy kiểm thử tự động: giữ hành vi cũ trừ khi bật cờ */

/* =====================================================================
   11. HỘP THÔNG BÁO / XÁC NHẬN / NHẬP CỦA APP
   confirm/prompt của trình duyệt chặn luồng chạy. Cách làm: lần đầu trả về "huỷ" và hiện hộp của app;
   bấm Đồng ý → ghi nhận rồi bấm lại đúng nút người dùng vừa bấm, lần này trả về "đồng ý".
   Không có thao tác bấm gần đây (gọi tự động) thì dùng hộp của trình duyệt cho an toàn.
   ===================================================================== */
const NATIVE={alert:window.alert.bind(window),confirm:window.confirm.bind(window),prompt:window.prompt.bind(window)};
let gesture={el:null,t:0,type:''},replaying=0,openedInReplay=false;const tokens=[];const queue=[];
document.addEventListener('click',e=>{if(!e.target.closest||!e.target.closest('#appDlg'))gesture={el:e.target,t:Date.now(),type:'click'};},true);
document.addEventListener('change',e=>{if(!e.target.closest||!e.target.closest('#appDlg'))gesture={el:e.target,t:Date.now(),type:'change'};},true);
function dlgRoot(){let r=$('appDlg');if(!r){r=document.createElement('div');r.id='appDlg';r.className='app-dlg';document.body.appendChild(r);}return r;}
function showDlg(d){queue.push(d);if(queue.length===1)renderDlg();if(replaying)openedInReplay=true;}
function renderDlg(){
  const d=queue[0],r=dlgRoot();if(!d){r.classList.remove('show');r.innerHTML='';return;}
  const danger=/xoá|xóa|huỷ|hủy|ghi đè|mất/i.test(d.msg);
  const lines=H(d.msg).replace(/\n/g,'<br>');
  r.innerHTML='<div class="app-dlg-card" role="dialog" aria-modal="true"><div class="app-dlg-ic">'+(d.kind==='alert'?(/✓|thành công|đã /i.test(d.msg)?'✅':'ℹ️'):danger?'⚠️':'❓')+'</div>'+
    '<div class="app-dlg-msg">'+lines+'</div>'+(d.kind==='prompt'?'<input id="appDlgIn" class="app-dlg-in" type="text" value="'+H(d.def||'')+'">':'')+
    '<div class="app-dlg-acts">'+(d.kind==='alert'?'':'<button type="button" class="app-dlg-cancel" id="appDlgNo">Huỷ</button>')+
    '<button type="button" class="app-dlg-ok'+(danger&&d.kind==='confirm'?' danger':'')+'" id="appDlgOk">'+(d.kind==='alert'?'Đã hiểu':danger&&d.kind==='confirm'?'Đồng ý':'OK')+'</button></div></div>';
  r.classList.add('show');
  const close=ok=>{const cur=queue.shift();const v=ok&&cur.kind==='prompt'?$('appDlgIn').value:null;renderDlg();if(ok&&cur.onOk)cur.onOk(v);};
  $('appDlgOk').onclick=()=>close(true);if($('appDlgNo'))$('appDlgNo').onclick=()=>close(false);
  r.onclick=e=>{if(e.target===r&&d.kind!=='alert')close(false);};
  setTimeout(()=>{const i=$('appDlgIn');if(i){i.focus();i.select();}else $('appDlgOk').focus();},30);
}
function replay(g){
  replaying++;openedInReplay=false;
  try{if(g.type==='change')g.el.dispatchEvent(new Event('change',{bubbles:true}));else g.el.dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true}));}
  finally{replaying--;if(!replaying&&!openedInReplay)tokens.length=0;}
}
function recentGesture(){const g=gesture;return g.el&&Date.now()-g.t<4000&&document.contains(g.el)?g:null;}
window.alert=function(msg){if(AUTO())return NATIVE.alert(msg);showDlg({kind:'alert',msg:String(msg==null?'':msg)});};
window.confirm=function(msg){
  if(AUTO())return NATIVE.confirm(msg);msg=String(msg==null?'':msg);
  if(tokens.some(t=>t.kind==='confirm'&&t.msg===msg))return true;
  const g=recentGesture();if(!g)return NATIVE.confirm(msg);
  showDlg({kind:'confirm',msg,onOk:()=>{tokens.push({kind:'confirm',msg});replay(g);}});return false;
};
window.prompt=function(msg,def){
  if(AUTO())return NATIVE.prompt(msg,def);msg=String(msg==null?'':msg);
  const t=tokens.find(t=>t.kind==='prompt'&&t.msg===msg);if(t)return t.val;
  const g=recentGesture();if(!g)return NATIVE.prompt(msg,def);
  showDlg({kind:'prompt',msg,def:def==null?'':String(def),onOk:v=>{tokens.push({kind:'prompt',msg,val:v});replay(g);}});return null;
};

/* =====================================================================
   2. SỐ TIỀN: tách chữ "VND" để làm nhỏ, mờ
   ===================================================================== */
const VND_SEL='.tx-amt,.dc-v,.acc-b,.hq-grid b,.wq-bal b,.debt-amt,.ls-grid b,.ls-total b,.month-box .v,.summary-box .v,.hb-v,.cmp-v,.sv-now span b';
function splitVnd(root){
  (root||document).querySelectorAll(VND_SEL).forEach(el=>{
    if(el.dataset.vnd===el.textContent)return;
    for(const n of [...el.childNodes]){if(n.nodeType===3&&/\sVND\s*$/.test(n.nodeValue)){const s=document.createElement('span');s.className='cur-u';s.textContent='VND';n.nodeValue=n.nodeValue.replace(/\s*VND\s*$/,' ');n.after(s);}}
    el.dataset.vnd=el.textContent;
  });
}

/* =====================================================================
   9. MÀN TRỐNG CÓ HƯỚNG DẪN
   ===================================================================== */
const EMPTY={
  recentList:()=>txs.length?null:['🧾','Chưa có giao dịch nào','Ghi khoản thu chi đầu tiên để bắt đầu theo dõi tiền của bạn.','Ghi giao dịch',"showScreen('add')"],
  historyList:()=>txs.length?['🔍','Không tìm thấy giao dịch','Thử từ khoá khác, hoặc xoá bộ lọc đang chọn.','Xoá bộ lọc','clearHistF()']:['🧾','Chưa có giao dịch nào','Các khoản bạn ghi sẽ hiện ở đây, sắp theo ngày.','Ghi giao dịch',"showScreen('add')"],
  accList:()=>wallets.length?null:['👛','Chưa có ví nào','Thêm ví tiền mặt, tài khoản ngân hàng, thẻ tín dụng hoặc sổ tiết kiệm để theo dõi số dư.','Thêm ví','toggleAccForm()'],
  debtList:()=>['🤝',debtDir==='in'?'Chưa có khoản vay nợ nào':'Chưa có khoản cho vay nào',debtDir==='in'?'Ghi khoản bạn vay của người khác để nhớ hạn trả.':'Ghi khoản bạn cho người khác vay, app sẽ nhắc khi đến hẹn.','Thêm khoản','toggleDebtForm()'],
  loanList:()=>['🏦','Chưa có khoản vay ngân hàng','Thêm khoản vay để theo dõi dư nợ, lịch trả gốc lãi và nhận nhắc trước hạn.','Thêm khoản vay','toggleLoanForm(true)'],
  topSpendList:()=>['📊','Chưa có chi tiêu tháng này','Các nhóm chi nhiều nhất sẽ hiện ở đây.',null,null]
};
function richEmpty(){
  Object.keys(EMPTY).forEach(id=>{const box=$(id);if(!box)return;const e=box.querySelector(':scope > .empty:not([data-rich])');if(!e)return;
    let spec=null;try{spec=EMPTY[id]();}catch(x){}e.dataset.rich='1';if(!spec)return;
    const [ic,t,d,cta,go]=spec;e.classList.add('empty-rich');
    e.innerHTML='<div class="er-ic">'+ic+'</div><div class="er-t">'+H(t)+'</div><div class="er-d">'+H(d)+'</div>'+(cta?'<button type="button" class="er-cta" onclick="'+go+'">'+H(cta)+'</button>':'');});
}

/* =====================================================================
   4. BIỂU ĐỒ TÔNG VÀNG (cơ cấu chi tiêu)
   ===================================================================== */
const GOLD=['#e2c28b','#c9a46a','#b08850','#97713e','#7d5d33','#f0dcb4','#d8b67c','#a98549','#8a6a3a','#6e532c'];
function goldDonut(){
  const dn=document.querySelector('#repDonut .donut');if(!dn||dn.dataset.gold)return;
  const leg=[...document.querySelectorAll('#repDonut .donut-legend > div')];
  const m=(dn.getAttribute('style')||'').match(/conic-gradient\((.*)\)/);if(!m)return;
  let i=0;const seg=m[1].replace(/(#[0-9a-fA-F]{3,8}|rgba?\([^)]*\))(\s+[\d.]+deg\s+[\d.]+deg)/g,(_,c,rest)=>GOLD[(i++)%GOLD.length]+rest);
  dn.style.background='conic-gradient('+seg+')';dn.dataset.gold='1';
  leg.forEach((l,k)=>{const d=l.querySelector('i');if(d)d.style.background=GOLD[k%GOLD.length];});
}

/* =====================================================================
   7. SỐ TIỀN "CHẠY" KHI THAY ĐỔI + PHẢN HỒI KHI BẤM
   ===================================================================== */
const COUNT_IDS=['mThu','mChi','mNet','repThu','repChi'];
function numOf(t){if(/\*/.test(t))return null;const neg=/^[−-]/.test(t.trim());const n=parseInt(t.replace(/\D/g,''))||0;return neg?-n:n;}
function snapCounts(){const o={};COUNT_IDS.forEach(id=>{const e=$(id);if(e)o[id]=e.textContent;});return o;}
function runCounts(before){
  if(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  COUNT_IDS.forEach(id=>{const e=$(id);if(!e||before[id]==null)return;const a=numOf(before[id]),fin=e.textContent,b=numOf(fin);if(a===null||b===null||a===b)return;
    const plus=/^\+/.test(fin.trim()),t0=performance.now(),D=450;
    const step=now=>{const k=Math.min(1,(now-t0)/D),v=Math.round(a+(b-a)*(1-Math.pow(1-k,3)));if(k<1){e.textContent=(v<0?'-':plus&&v>0?'+':'')+fmtShort(Math.abs(v));requestAnimationFrame(step);}else e.textContent=fin;};
    requestAnimationFrame(step);});
}
function buzz(ms){try{if(navigator.vibrate)navigator.vibrate(ms||10);}catch(e){}}

/* =====================================================================
   8. KÉO XUỐNG ĐỂ LÀM MỚI (Tổng quan)
   ===================================================================== */
let pull=null;
function ptrEl(){let e=$('ptr');if(!e){e=document.createElement('div');e.id='ptr';e.className='ptr';e.innerHTML='<span class="ptr-spin"></span><span class="ptr-t">Kéo để làm mới</span>';document.body.appendChild(e);}return e;}
document.addEventListener('touchstart',e=>{if(currentScreen()!=='home'||window.scrollY>2||e.touches.length>1||(e.target.closest&&e.target.closest('.tx-item,.qa-row,.app-dlg,#appModal,.tpl-scroll')))return;pull={y:e.touches[0].clientY,x:e.touches[0].clientX,d:0};},{passive:true});
document.addEventListener('touchmove',e=>{if(!pull)return;const dy=e.touches[0].clientY-pull.y,dx=e.touches[0].clientX-pull.x;if(dy<0||Math.abs(dx)>Math.abs(dy)){if(pull.d)ptrReset();pull=null;return;}
  pull.d=dy;const el=ptrEl(),h=Math.min(90,dy*.5);el.style.transform='translate(-50%,'+(h-50)+'px)';el.style.opacity=Math.min(1,dy/80);el.classList.toggle('ready',dy>90);el.querySelector('.ptr-t').textContent=dy>90?'Thả để làm mới':'Kéo để làm mới';},{passive:true});
document.addEventListener('touchend',()=>{if(!pull)return;const d=pull.d;pull=null;if(d>90)refreshNow();else ptrReset();},{passive:true});
function ptrReset(){const el=$('ptr');if(el){el.style.transform='translate(-50%,-60px)';el.style.opacity='0';el.classList.remove('ready','busy');}}
window.refreshNow=async function(){
  const el=ptrEl();el.classList.add('busy');el.style.transform='translate(-50%,24px)';el.style.opacity='1';el.querySelector('.ptr-t').textContent='Đang làm mới…';
  document.body.classList.add('is-refreshing');buzz(8);
  const t0=Date.now();let synced=false;
  try{if(window.Cloud&&Cloud.isLoggedIn&&Cloud.isLoggedIn()&&navigator.onLine&&typeof cloudAutoSync==='function'){await cloudAutoSync(true);synced=true;}}catch(e){}
  try{checkMaturedSavings();checkMonthlyInterestAccrual();checkNoTermAccrual();if(window.checkLoanNotify)checkLoanNotify();}catch(e){}
  await new Promise(r=>setTimeout(r,Math.max(0,600-(Date.now()-t0))));
  try{renderHome();}catch(e){}
  document.body.classList.remove('is-refreshing');ptrReset();
  showMiniToast(synced?'✓ Đã đồng bộ và cập nhật':'✓ Đã cập nhật');
};

/* =====================================================================
   10. MÀN CHÀO NGƯỜI MỚI (3 bước)
   ===================================================================== */
const ONB_PICK=[['Ăn uống','Ăn trưa'],['Ăn uống','Cafe'],['Ăn uống','Đi chợ/siêu thị'],['Đi lại','Xăng xe'],['Đi lại','Taxi/thuê xe'],['Dịch vụ sinh hoạt','Điện'],['Dịch vụ sinh hoạt','Nước'],
  ['Dịch vụ sinh hoạt','Internet'],['Dịch vụ sinh hoạt','Điện thoại di động'],['Nhà cửa','Thuê nhà'],['Con cái','Học phí'],['Sức khỏe','Thuốc men'],['Trang phục','Quần áo'],['Hưởng thụ','Du lịch'],['Hưởng thụ','Vui chơi giải trí'],['Hiếu hỉ','Cưới xin']];
let onb={step:0,picks:new Set()};
function onbShouldShow(){if(AUTO())return false;if(lsGet('tc_onboarded'))return false;if((wallets&&wallets.length)||(txs&&txs.length))return false;
  const g=$('cloudGateScreen');if(g&&getComputedStyle(g).display!=='none'&&g.offsetParent!==null)return false;if(document.documentElement.classList.contains('is-locked'))return false;return true;}
function onbRoot(){let r=$('onb');if(!r){r=document.createElement('div');r.id='onb';r.className='onb';document.body.appendChild(r);}return r;}
window.onbStart=function(force){if(!force&&!onbShouldShow())return;onb={step:1,picks:new Set(ONB_PICK.slice(0,6).filter(([g,i])=>catValid('chi',g,i)).map(x=>x.join('|')))};onbRender();};
function onbRender(){
  const r=onbRoot(),s=onb.step,dots='<div class="onb-dots">'+[1,2,3].map(i=>'<i class="'+(i<=s?'on':'')+'"></i>').join('')+'</div>';
  let body='';
  if(s===1)body='<div class="onb-ic">👛</div><h2>Chào mừng đến Sổ Thu Chi</h2><p>Bước 1/3 · Tạo ví đầu tiên để ghi thu chi.</p>'+
    '<label>Tên ví</label><input id="onbName" class="we-in" value="Tiền mặt" maxlength="30"><label>Loại</label><select id="onbType" class="we-in"><option value="cash">Tiền mặt</option><option value="bank">Tài khoản ngân hàng</option><option value="ewallet">Ví điện tử</option></select>'+
    '<label>Số dư hiện có (VND)</label><input id="onbBal" class="we-in" type="tel" inputmode="numeric" placeholder="0" oninput="fmtInput(this)">';
  else if(s===2)body='<div class="onb-ic">⭐</div><h2>Bạn hay chi cho gì?</h2><p>Bước 2/3 · Chọn hạng mục hay dùng, chúng sẽ hiện sẵn ở màn Thêm giao dịch.</p><div class="onb-picks">'+
    ONB_PICK.filter(([g,i])=>catValid('chi',g,i)).map(([g,i])=>{const k=g+'|'+i;return '<button type="button" class="onb-pick'+(onb.picks.has(k)?' on':'')+'" data-k="'+H(k)+'" onclick="onbToggle(this)"><span>'+H(itemEmoji('chi',g,i))+'</span>'+H(i)+'</button>';}).join('')+'</div>';
  else body='<div class="onb-ic">🎯</div><h2>Đặt ngân sách tháng</h2><p>Bước 3/3 · Không bắt buộc. App sẽ báo khi bạn chi gần hết.</p>'+
    [['Ăn uống','🍜'],['Đi lại','🛵'],['Hưởng thụ','🎉']].filter(([g])=>GROUPS.chi.some(x=>x.name===g)).map(([g,e])=>'<label>'+e+' '+g+' (VND/tháng)</label><input class="we-in onb-bud" data-g="'+H(g)+'" type="tel" inputmode="numeric" placeholder="Bỏ trống nếu chưa cần" oninput="fmtInput(this)">').join('');
  r.innerHTML='<div class="onb-card">'+dots+body+'<div class="onb-acts"><button type="button" class="onb-skip" onclick="onbSkip()">'+(s===3?'Bỏ qua':'Để sau')+'</button><button type="button" class="onb-next" onclick="onbNext()">'+(s===3?'Bắt đầu dùng':'Tiếp tục')+'</button></div></div>';
  r.classList.add('show');
}
window.onbToggle=function(b){const k=b.dataset.k;if(onb.picks.has(k))onb.picks.delete(k);else onb.picks.add(k);b.classList.toggle('on');};
window.onbNext=function(){
  if(onb.step===1){const name=($('onbName').value||'').trim()||'Tiền mặt',type=$('onbType').value,bal=parseInt(($('onbBal').value||'').replace(/\D/g,''))||0;
    if(!wallets.some(w=>w.name===name)){const wt=WTYPES.find(t=>t.id===type)||WTYPES[0];wallets.push({id:Date.now(),type:wt.id,name,code:name.slice(0,3).toUpperCase(),color:wt.color,balance:bal});saveAll();}
    onb.step=2;onbRender();return;}
  if(onb.step===2){if(onb.picks.size)lsSet('tc_fav_chi',JSON.stringify([...onb.picks]));onb.step=3;onbRender();return;}
  document.querySelectorAll('.onb-bud').forEach(i=>{const v=parseInt((i.value||'').replace(/\D/g,''))||0;if(v>0)budgets[i.dataset.g]=v;});saveAll();onbDone();
};
window.onbSkip=function(){if(onb.step<3){onbDone();return;}onbDone();};
function onbDone(){lsSet('tc_onboarded','1');const r=$('onb');if(r){r.classList.remove('show');r.innerHTML='';}try{renderHome();}catch(e){}showMiniToast('✓ Đã sẵn sàng! Bấm nút + để ghi khoản đầu tiên');}

/* =====================================================================
   13. TỰ KHOÁ SAU N PHÚT
   ===================================================================== */
const AL_OPTS=[[0,'Ngay khi rời app'],[1,'Sau 1 phút'],[5,'Sau 5 phút'],[15,'Sau 15 phút']];
let lastAct=Date.now();['click','touchstart','keydown','scroll'].forEach(ev=>document.addEventListener(ev,()=>{lastAct=Date.now();},{passive:true,capture:true}));
setInterval(()=>{try{if(!lockOn()||document.hidden||document.documentElement.classList.contains('is-locked'))return;const ms=Math.max(60000,autoLockMs());
  if(Date.now()-lastAct>ms){document.documentElement.classList.add('is-locked');pinShow('unlock');lastAct=Date.now();}}catch(e){}},15000);
function renderAutoLock(){const e=$('more-autolock');if(!e)return;let on=false;try{on=lockOn();}catch(x){}e.style.display=on?'':'none';
  const m=autoLockMin();e.innerHTML='<span>'+icon('clock','#c29a5c',20)+'</span><span>Tự khoá<small class="more-sub">'+(AL_OPTS.find(o=>o[0]===m)||AL_OPTS[1])[1]+' (khi rời app hoặc không dùng)</small></span>';}
window.openAutoLock=function(){const m=autoLockMin();
  openModal('<h3>Tự khoá app</h3><p class="bk-p">Khoá lại (cần mật khẩu / Face ID) khi bạn rời app hoặc không dùng quá thời gian này.</p><div class="is-opts">'+
    AL_OPTS.map(([v,t])=>'<button type="button" class="is-opt'+(v===m?' on':'')+'" onclick="setAutoLock('+v+')"><span class="is-name">'+t+(v===m?' ✓':'')+'</span></button>').join('')+
    '</div><div class="edit-modal-actions"><button class="edit-modal-cancel" onclick="closeAppModal()">Đóng</button></div>');};
window.setAutoLock=function(v){lsSet('tc_autolock',String(v));closeAppModal();renderAutoLock();showMiniToast('✓ Tự khoá: '+(AL_OPTS.find(o=>o[0]===v)||[0,''])[1].toLowerCase());};

/* =====================================================================
   14. GIỚI THIỆU & BẢO MẬT
   ===================================================================== */
window.openAbout=async function(){
  let used='';try{if(navigator.storage&&navigator.storage.estimate){const e=await navigator.storage.estimate();used=(e.usage/1048576).toFixed(1)+' MB';}}catch(e){}
  const cloudOn=!!(window.Cloud&&Cloud.isLoggedIn&&Cloud.isLoggedIn()),email=cloudOn&&Cloud.currentEmail?Cloud.currentEmail():'';
  let lastBk=0;try{lastBk=+localStorage.getItem('tc_last_backup')||0;}catch(e){}
  openModal('<div class="about-hd"><img src="icon-192.png" alt="" class="about-logo"><div><h3 style="margin:0">Sổ Thu Chi</h3><small>Phiên bản '+APP_VERSION+'</small></div></div>'+
    '<div class="about-sec"><b>🔒 Dữ liệu của bạn ở đâu?</b><p>Toàn bộ dữ liệu lưu ngay trên máy này (bộ nhớ trình duyệt'+(used?', đang dùng '+used:'')+'). App không gửi dữ liệu đi đâu, trừ khi bạn đăng nhập Google để đồng bộ.</p></div>'+
    '<div class="about-sec"><b>☁️ Đồng bộ Google</b><p>'+(cloudOn?'Đang bật'+(email?' ('+H(email)+')':'')+'. Dữ liệu được lưu riêng cho tài khoản của bạn, dùng chung được trên nhiều máy.':'Chưa bật. Vào Cài đặt › Sao lưu và đồng bộ để đăng nhập Google, dùng chung dữ liệu trên nhiều máy và không lo mất.')+'</p></div>'+
    '<div class="about-sec"><b>💾 Sao lưu & khôi phục</b><p>Lần sao lưu gần nhất: '+(lastBk?new Date(lastBk).toLocaleDateString('vi-VN'):'chưa có')+'. Sao lưu tạo một tệp .json, cất vào Tệp/iCloud hoặc gửi cho chính mình. Khi đổi máy, chọn "Khôi phục dữ liệu" và mở tệp đó.</p></div>'+
    '<div class="about-sec"><b>🛡️ Khoá app</b><p>'+(lockOn()?'Đang bật mật khẩu'+(bioIsSet()?' và Face ID / vân tay':'')+'. Tự khoá: '+((AL_OPTS.find(o=>o[0]===autoLockMin())||AL_OPTS[1])[1]).toLowerCase()+'.':'Chưa bật. Nên đặt mật khẩu hoặc Face ID tại Cài đặt › Tên đăng nhập & mật khẩu.')+'</p></div>'+
    '<div class="about-sec"><b>🎨 Thiết kế</b><p class="about-small">Biểu tượng giao diện: Solar Icons © 480 Design (CC BY 4.0). Kiểu biểu tượng Phẳng/3D: Fluent Emoji © Microsoft (MIT).</p></div>'+
    '<div class="edit-modal-actions"><button class="edit-modal-cancel" onclick="closeAppModal();checkUpdate(true)">Kiểm tra cập nhật</button><button class="edit-modal-save" onclick="closeAppModal()">Đóng</button></div>');
};

/* =====================================================================
   3. TIÊU ĐỀ THU NHỎ KHI CUỘN · 12. MÀN KHỞI ĐỘNG · GẮN VÀO APP
   ===================================================================== */
let scT=0;window.addEventListener('scroll',()=>{if(scT)return;scT=requestAnimationFrame(()=>{scT=0;document.body.classList.toggle('scrolled',window.scrollY>28);});},{passive:true});
let mq=false;const mo=new MutationObserver(()=>{if(mq)return;mq=true;Promise.resolve().then(()=>{mq=false;try{splitVnd();richEmpty();goldDonut();}catch(e){}});});
function start(){mo.observe(document.body,{childList:true,subtree:true,characterData:true});splitVnd();richEmpty();goldDonut();}
const _rh=window.renderHome;window.renderHome=function(){const b=snapCounts();const r=_rh.apply(this,arguments);try{runCounts(b);renderAutoLock();}catch(e){}return r;};
const _rr=window.renderReport;window.renderReport=function(){const b=snapCounts();const r=_rr.apply(this,arguments);try{runCounts(b);}catch(e){}return r;};
const _st=window.saveTx;window.saveTx=function(){const n=txs.length,ed=editingTxId;const r=_st.apply(this,arguments);if(txs.length>n||(ed&&!editingTxId))buzz(12);return r;};
const _ul=window.updateLockMenu;if(_ul)window.updateLockMenu=function(){const r=_ul.apply(this,arguments);try{renderAutoLock();}catch(e){}return r;};
(function init(){
  const set=(id,ic,txt,sub)=>{const e=$(id);if(e)e.innerHTML='<span>'+icon(ic,'#c29a5c',20)+'</span><span>'+txt+(sub?'<small class="more-sub">'+sub+'</small>':'')+'</span>';};
  set('more-about','lock','Giới thiệu & Bảo mật','Phiên bản '+APP_VERSION+', dữ liệu lưu ở đâu, sao lưu');
  renderAutoLock();start();
  const sp=$('splash');if(sp)setTimeout(()=>sp.classList.add('gone'),350);
  setTimeout(()=>{try{onbStart();}catch(e){console.error(e);}},1400);
})();
})();
