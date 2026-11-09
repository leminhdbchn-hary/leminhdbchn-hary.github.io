/* Sổ Thu Chi – tính năng thêm (v78):
   1. Giao dịch mẫu (bấm 1 lần là ghi)        2. Gợi ý hạng mục theo ghi chú (học từ lịch sử)
   3. Tạm ứng ăn chung chờ thu lại            4. Lọc báo cáo theo ví
   5. Tỷ lệ tiết kiệm (kỳ này + 12 tháng)     6. Thông báo nhắc trước ngày trả gốc/lãi vay
   7. Nhắc sao lưu: đã đồng bộ Google thì không nhắc, chưa đăng nhập thì gợi ý đăng nhập */
(function(){
function lsGet(k){try{return localStorage.getItem(k);}catch(e){return null;}}
function lsSet(k,v){try{localStorage.setItem(k,v);}catch(e){}}
function kfmt(v){v=+v||0;if(v>=1e6)return (Math.round(v/1e5)/10).toString().replace('.',',')+'tr';if(v>=1000)return Math.round(v/1000)+'k';return String(v);}

/* =====================================================================
   1. GIAO DỊCH MẪU
   ===================================================================== */
function tplAmount(){return parseInt((document.getElementById('amountInput').value||'').replace(/\D/g,''))||0;}
window.renderTplBar=function(){
  const bar=document.getElementById('tplBar');if(!bar)return;
  const normal=currentType==='chi'||currentType==='thu';
  bar.style.display=normal?'':'none';if(!normal)return;
  const chips=txTemplates.map(t=>'<button type="button" class="tpl-chip '+(t.type==='thu'?'thu':'chi')+'" onclick="useTpl('+t.id+')" title="'+escH(t.item+(t.amount?' · '+fmt(t.amount):''))+'">'+escH(itemEmoji(t.type,t.group,t.item)||'⚡')+' '+escH(t.name)+'</button>').join('');
  bar.innerHTML='<div class="tpl-head"><span>Mẫu ghi nhanh</span>'+(txTemplates.length?'<button type="button" onclick="openTplMgr()">Sửa mẫu</button>':'')+'</div>'+
    '<div class="tpl-scroll">'+chips+'<button type="button" class="tpl-chip add" onclick="saveCurAsTpl()">＋ Lưu thành mẫu</button></div>'+
    (txTemplates.length?'':'<div class="tpl-hint">Lưu sẵn khoản hay dùng, lần sau bấm 1 lần là ghi xong.</div>');
};
window.saveCurAsTpl=function(){
  if(currentType!=='chi'&&currentType!=='thu'){alert('Mẫu chỉ dùng cho khoản Thu hoặc Chi');return;}
  if(!selectedItem){alert('Hãy chọn hạng mục trước rồi bấm "Lưu thành mẫu"');return;}
  const amount=tplAmount();const def=selectedItem+(amount?' '+kfmt(amount):'');
  const name=prompt('Tên mẫu (hiện trên nút)'+(amount?'':'\n\nChưa nhập số tiền: bấm mẫu sẽ điền sẵn, bạn chỉ cần nhập số tiền rồi Lưu.'),def);
  if(name===null)return;
  const acc=document.getElementById('accSelect'),nc=document.getElementById('noCfChk');
  txTemplates.push({id:Date.now(),name:(name.trim()||def).slice(0,30),type:currentType,group:selectedGroup,item:selectedItem,amount,
    walletId:acc&&acc.value?acc.value:null,note:(document.getElementById('noteInput').value||'').trim(),person:(document.getElementById('personInput').value||'').trim(),noCF:!!(nc&&nc.checked)});
  saveAll();renderTplBar();showMiniToast('✓ Đã lưu mẫu "'+(name.trim()||def)+'"');
};
window.useTpl=function(id){
  const t=txTemplates.find(x=>x.id===id);if(!t)return;
  if(editingTxId){showMiniToast('Đang sửa giao dịch – hãy lưu hoặc huỷ trước khi dùng mẫu',true);return;}
  if(!catValid(t.type,t.group,t.item)){alert('Hạng mục «'+t.item+'» của mẫu không còn. Hãy vào "Sửa mẫu" để xoá rồi tạo lại.');return;}
  setType(t.type);selectedGroup=t.group;selectedItem=t.item;renderCatPicker();
  try{fxSet('VND');}catch(e){}
  document.getElementById('amountInput').value=t.amount?fmtShort(t.amount):'';
  const acc=document.getElementById('accSelect');
  if(acc&&t.walletId&&[...acc.options].some(o=>o.value===String(t.walletId)))acc.value=String(t.walletId);
  document.getElementById('noteInput').value=t.note||'';document.getElementById('personInput').value=t.person||'';
  document.getElementById('dateInput').value=todayStr();document.getElementById('timeInput').value=nowTime();
  receiptData=null;{const rp=document.getElementById('receiptPreview');if(rp)rp.style.display='none';}
  syncNoCfChk(!!t.noCF);
  if(!t.amount){const a=document.getElementById('amountInput');a.focus();showMiniToast('Nhập số tiền rồi bấm Lưu');return;}
  saveTx();showMiniToast('✓ Đã ghi theo mẫu: '+t.name+' · '+fmt(t.amount));
};
window.openTplMgr=function(){
  const rows=txTemplates.map((t,i)=>'<div class="tpl-mrow"><span class="tpl-mn">'+escH(t.name)+'<small>'+(t.type==='thu'?'Thu':'Chi')+' · '+escH(t.item)+(t.amount?' · '+fmt(t.amount):' · chưa có số tiền')+(t.noCF?' · không tính thu chi':'')+'</small></span>'+
    '<button class="ms-btn" '+(i===0?'disabled':'')+' onclick="moveTpl('+i+',-1)" aria-label="Lên">▲</button><button class="ms-btn" '+(i===txTemplates.length-1?'disabled':'')+' onclick="moveTpl('+i+',1)" aria-label="Xuống">▼</button>'+
    '<button class="icon-btn" style="color:var(--red)" onclick="delTpl('+i+')" aria-label="Xoá">✕</button></div>').join('');
  openModal('<h3>⚡ Mẫu ghi nhanh</h3>'+(rows||'<div class="empty">Chưa có mẫu nào.</div>')+'<div class="edit-modal-actions"><button class="edit-modal-save" onclick="closeAppModal()">Xong</button></div>');
};
window.moveTpl=function(i,d){const j=i+d;if(j<0||j>=txTemplates.length)return;const a=txTemplates[i];txTemplates[i]=txTemplates[j];txTemplates[j]=a;saveAll();renderTplBar();openTplMgr();};
window.delTpl=function(i){const t=txTemplates[i];if(!t||!confirm('Xoá mẫu "'+t.name+'"?'))return;txTemplates.splice(i,1);saveAll();renderTplBar();openTplMgr();};

/* =====================================================================
   2. GỢI Ý HẠNG MỤC THEO GHI CHÚ – học từ các giao dịch đã ghi
   ===================================================================== */
const SUG_STOP=new Set(['va','cho','tien','o','tai','cua','voi','the','la','ve','mot','cac','nhung','hom','nay','qua','thang','ngay','k','tr','vnd','d','dong']);
function sugTokens(s){
  const w=normKeepLen(String(s||'')).replace(/[^a-z0-9 ]/g,' ').split(/\s+/).filter(x=>x.length>=2&&!/^\d+$/.test(x)&&!SUG_STOP.has(x));
  const out=w.map(x=>[x,1]);for(let i=0;i+1<w.length;i++)out.push([w[i]+' '+w[i+1],2]);return out;
}
let sugIdx=null,sugSig='';
function sugIndex(){
  const sig=txs.length+'|'+(txs[0]&&txs[0].id);if(sugIdx&&sig===sugSig)return sugIdx;
  const idx={};
  txs.forEach(t=>{
    if((t.type!=='chi'&&t.type!=='thu')||!t.note||t.debtId||t.split||t.loanId||t.advOf)return;
    const key=t.type+'|'+t.group+'|'+t.item;
    sugTokens(t.note).forEach(([w])=>{const m=idx[w]||(idx[w]={});m[key]=(m[key]||0)+1;});
  });
  sugIdx=idx;sugSig=sig;return idx;
}
function suggestCat(note,type){
  const idx=sugIndex(),score={};
  sugTokens(note).forEach(([w,wt])=>{const m=idx[w];if(!m)return;const keys=Object.keys(m),tot=keys.reduce((s,k)=>s+m[k],0);
    keys.forEach(k=>{score[k]=(score[k]||0)+wt*m[k]/tot*Math.min(3,tot);});});
  let best=null;
  Object.keys(score).forEach(k=>{const [ty,g,it]=k.split('|');if(ty!==type||!catValid(ty,g,it))return;if(!best||score[k]>best.s)best={s:score[k],g,it};});
  if(best&&best.s>=0.9)return {g:best.g,it:best.it,learned:true};
  /* chưa có lịch sử: dùng từ điển nhập nhanh (cafe, xăng, grab...) */
  try{const r=qeParse(note);if(r.item&&r.type===type&&catValid(r.type,r.group,r.item))return {g:r.group,it:r.item,learned:false};}catch(e){}
  return null;
}
let sugAuto=null,sugTimer=null;
function noteSugEl(){return document.getElementById('noteSug');}
function runNoteSug(){
  const box=noteSugEl();if(!box)return;
  const note=(document.getElementById('noteInput').value||'').trim();
  if((currentType!=='chi'&&currentType!=='thu')||note.length<2){box.innerHTML='';return;}
  const s=suggestCat(note,currentType);
  if(!s){box.innerHTML='';return;}
  const key=s.g+'|'+s.it,cur=selectedGroup+'|'+selectedItem;
  if(cur===key){box.innerHTML=sugAuto===key?'💡 Đã tự chọn «'+escH(s.it)+'» theo ghi chú'+(s.learned?' (học từ các lần trước)':'')+'. Chọn hạng mục khác nếu sai.':'';return;}
  const userPicked=!!selectedItem&&cur!==sugAuto;
  if(!userPicked&&!editingTxId){selectedGroup=s.g;selectedItem=s.it;sugAuto=key;renderCatPicker();
    box.innerHTML='💡 Đã tự chọn «'+escH(s.it)+'» theo ghi chú'+(s.learned?' (học từ các lần trước)':'')+'. Chọn hạng mục khác nếu sai.';return;}
  box.innerHTML='💡 Gợi ý: <button type="button" class="sug-btn" data-g="'+escH(s.g)+'" data-it="'+escH(s.it)+'" onclick="applyNoteSug(this)">'+escH(s.it)+'</button>';
}
window.applyNoteSug=function(b){selectedGroup=b.dataset.g;selectedItem=b.dataset.it;sugAuto=selectedGroup+'|'+selectedItem;renderCatPicker();runNoteSug();};
window.suggestCat=suggestCat;

/* =====================================================================
   3. TẠM ỨNG ĂN CHUNG CHỜ THU LẠI
   ===================================================================== */
const ADV_ITEM='Tạm ứng ăn chung',ADV_BACK='Thu lại tạm ứng';
function advBack(t){return txs.filter(x=>x.advOf===t.id).reduce((s,x)=>s+(x.amount||0),0);}
function advPending(){return txs.filter(t=>t.type==='chi'&&t.item===ADV_ITEM&&!t.advWaived).map(t=>({t,back:advBack(t)})).filter(o=>o.back<o.t.amount)
  .sort((a,b)=>(a.t.date||'').localeCompare(b.t.date||''));}
window.advPending=advPending;
/* Thẻ "Cho vay & vay nợ" ở Tổng quan: cho vay, tạm ứng chờ thu, vay ngân hàng, nợ người khác + hạn gần nhất */
function renderDebtCard(){
  const el=document.getElementById('debtCard');if(!el)return;
  const today=todayStr(),rows=[],sum=a=>a.reduce((s,d)=>s+(d.amount||0),0);
  const soon=list=>{const s=list.filter(d=>d.dueDate).sort((a,b)=>a.dueDate.localeCompare(b.dueDate))[0];if(!s)return null;const k=daysBetween(today,s.dueDate);
    return {t:escH(s.person)+(k<0?' quá hạn '+(-k)+' ngày':k===0?' hẹn hôm nay':k===1?' hẹn ngày mai':' hẹn '+dmy(s.dueDate)),od:k<=0};};
  const out=debts.filter(d=>d.status==='pending'&&!debtIsIn(d)),inn=debts.filter(d=>d.status==='pending'&&debtIsIn(d));
  if(out.length){const s=soon(out);rows.push({ic:'🤝',lb:'Đang cho vay',v:sum(out),sub:out.length+' người'+(s?' · '+s.t:''),od:s&&s.od,go:"openDebts('out')",sign:1});}
  const adv=advPending();
  if(adv.length)rows.push({ic:'🍻',lb:'Tạm ứng chờ thu',v:adv.reduce((s,o)=>s+o.t.amount-o.back,0),sub:adv.length+' khoản ăn chung chưa được trả',go:'openAdvances()',sign:1});
  const al=loans.filter(l=>{try{ensureLoanV2(l);}catch(e){}return l.status!=='closed';});
  if(al.length){const ms=loanNextSummary(),nx=ms.rows[0];
    rows.push({ic:'🏦',lb:'Dư nợ vay ngân hàng',v:al.reduce((s,l)=>s+(l.balance||0),0),sub:(al.length>1?al.length+' khoản · ':'')+(nx?(ms.overdue?'Quá hạn, cần trả ':'Kỳ tới '+dmy(nx.date).slice(0,5)+': ')+fmtShort(ms.p+ms.i):'Không có kỳ sắp đến hạn'),od:ms.overdue||(nx&&daysBetween(today,nx.date)<=1),go:"showScreen('loans')",sign:-1});}
  if(inn.length){const s=soon(inn);rows.push({ic:'💳',lb:'Đang nợ người khác',v:sum(inn),sub:inn.length+' người'+(s?' · '+s.t:''),od:s&&s.od,go:"openDebts('in')",sign:-1});}
  if(!rows.length){el.style.display='none';el.innerHTML='';return;}
  const net=rows.reduce((s,r)=>s+r.sign*r.v,0);
  el.style.display='block';
  el.innerHTML='<div class="dc-head"><span>Cho vay &amp; vay nợ</span>'+(rows.some(r=>r.sign>0)&&rows.some(r=>r.sign<0)?'<span class="dc-net" title="Tiền người khác nợ bạn trừ tiền bạn đang nợ">Ròng <b class="'+(net>=0?'pos':'neg')+'">'+(net>=0?'+':'−')+fmtShort(Math.abs(net))+'</b></span>':'')+'</div>'+
    rows.map(r=>'<button type="button" class="dc-row'+(r.od?' od':'')+'" onclick="'+r.go+'"><span class="dc-ic">'+r.ic+'</span><span class="dc-txt"><span class="dc-lb">'+r.lb+'</span><small>'+(r.od?'⚠ ':'')+r.sub+'</small></span><span class="dc-v '+(r.sign>0?'pos':'neg')+'">'+fmtShort(r.v)+'</span><span class="dc-go">›</span></button>').join('');
}
window.renderDebtCard=renderDebtCard;
/* Bấm ô Thu / Chi của tháng ở Tổng quan → Báo cáo tháng này, mở sẵn bảng chi tiết */
window.openMonthDetail=function(type){
  showScreen('report');const b=[...document.querySelectorAll('#screen-report .period-tabs button')].find(x=>/Tháng/.test(x.textContent))||document.createElement('button');
  repWalletId='';setPeriod('month',b);if(repDetailType!==type)toggleRepDetail(type);
  const d=document.getElementById('repDetail');if(d)setTimeout(()=>d.scrollIntoView({behavior:'smooth',block:'start'}),200);
};
let advList=[];
window.openAdvances=function(){
  advList=advPending();
  const wl=getSpendableWallets();
  const wOpts=sel=>wl.map(w=>'<option value="'+w.id+'"'+(String(w.id)===String(sel)?' selected':'')+'>'+escH(w.name)+'</option>').join('')||'<option value="">Chưa có ví</option>';
  const rows=advList.map((o,i)=>{const t=o.t,rem=t.amount-o.back;
    return '<div class="adv-row"><div class="adv-top"><b>'+fmt(rem)+'</b><span>'+dmy(t.date)+(t.person?' • '+escH(t.person):'')+(t.note?' • '+escH(t.note):'')+'</span></div>'+
      (o.back?'<small class="adv-sub">Đã thu '+fmt(o.back)+' / '+fmt(t.amount)+'</small>':'')+
      '<div class="adv-act"><input id="advAmt_'+i+'" type="tel" inputmode="numeric" value="'+fmtShort(rem)+'" oninput="fmtInput(this)" aria-label="Số tiền thu lại"><select id="advW_'+i+'" aria-label="Nhận vào ví">'+wOpts(t.walletId)+'</select></div>'+
      '<div class="adv-act"><button class="adv-ok" onclick="advCollect('+i+')">✓ Đã thu lại</button><button class="adv-skip" onclick="advWaive('+i+')">Không thu nữa</button></div></div>';}).join('');
  const total=advList.reduce((s,o)=>s+o.t.amount-o.back,0);
  openModal('<h3>🍻 Tạm ứng chờ thu</h3>'+
    (advList.length?'<p class="bk-p">Tổng còn chờ thu: <b>'+fmt(total)+'</b>. Khi bạn bè trả lại, bấm "Đã thu lại" để cộng vào ví (không tính vào thu chi). Trả một phần thì sửa số tiền trước khi bấm.</p>'+rows
      :'<div class="empty">Không có khoản tạm ứng nào đang chờ thu.<br><small>Ghi khoản chi với hạng mục Khác › Tạm ứng ăn chung để theo dõi ở đây.</small></div>')+
    '<div class="edit-modal-actions"><button class="edit-modal-save" onclick="closeAppModal()">Đóng</button></div>');
};
window.advCollect=function(i){
  const o=advList[i];if(!o)return;const t=o.t;
  const amt=numFromText(document.getElementById('advAmt_'+i).value),walletId=document.getElementById('advW_'+i).value;
  if(amt<=0){alert('Vui lòng nhập số tiền đã thu lại');return;}
  if(!walletId){alert('Vui lòng chọn ví nhận tiền');return;}
  const tx={id:Date.now()+Math.random(),type:'thu',amount:amt,group:ADV_BACK,item:ADV_BACK,icon:'e:🍻',accent:'#c9860b',bg:CAT_TINTS[1],walletId,person:t.person||'',
    note:'Thu lại tạm ứng'+(t.note?': '+t.note:'')+' ('+dmy(t.date)+')',date:todayStr(),time:nowTime(),noCF:true,advOf:t.id};
  txs.unshift(tx);applyTxBalance(tx);saveAll();
  showMiniToast(amt>=t.amount-o.back?'✓ Đã thu đủ khoản tạm ứng':'✓ Đã ghi thu lại '+fmt(amt)+', còn '+fmt(t.amount-o.back-amt));
  try{renderHome();}catch(e){}openAdvances();
};
window.advWaive=function(i){
  const o=advList[i];if(!o||!confirm('Không thu lại khoản tạm ứng này nữa? Khoản này sẽ không còn hiện trong danh sách chờ thu (vẫn không tính vào chi).'))return;
  o.t.advWaived=true;saveAll();try{renderHome();}catch(e){}openAdvances();
};

/* =====================================================================
   4 + 5. BÁO CÁO: LỌC THEO VÍ, TỶ LỆ TIẾT KIỆM
   ===================================================================== */
function fillRepWallet(){
  let sel=document.getElementById('repWallet');
  if(!sel){const nav=document.querySelector('#screen-report .range-nav');if(!nav)return;
    const w=document.createElement('div');w.className='rep-wallet';
    w.innerHTML='<label for="repWallet">Ví</label><select id="repWallet" onchange="repWalletId=this.value;renderReport()"></select>';
    nav.parentNode.insertBefore(w,nav.nextSibling);sel=document.getElementById('repWallet');}
  if(repWalletId&&!wallets.some(w=>String(w.id)===repWalletId))repWalletId='';
  sel.innerHTML='<option value="">Tất cả ví</option>'+wallets.filter(w=>w.type!=='saving').map(w=>'<option value="'+w.id+'">'+escH(w.name)+'</option>').join('');
  sel.value=repWalletId;sel.classList.toggle('on',!!repWalletId);
}
function savingsCard(inRange){
  const thu=inRange.filter(t=>t.type==='thu'&&isCashFlow(t)).reduce((s,t)=>s+t.amount,0),chi=inRange.filter(t=>t.type==='chi'&&isCashFlow(t)).reduce((s,t)=>s+t.amount,0);
  const rate=(a,b)=>a>0?Math.round((a-b)/a*100):null;const r=rate(thu,chi);
  const base=new Date(reportRef),cols=[];
  for(let i=11;i>=0;i--){const a=new Date(base.getFullYear(),base.getMonth()-i,1),b=new Date(base.getFullYear(),base.getMonth()-i+1,0);const t=sumRange(a,b,'thu'),c=sumRange(a,b,'chi');cols.push({lb:'T'+(a.getMonth()+1),r:rate(t,c),t,c});}
  const vals=cols.filter(c=>c.r!==null).map(c=>c.r);const avg=vals.length?Math.round(vals.reduce((s,v)=>s+v,0)/vals.length):null;
  const col=v=>v===null?'var(--sub)':v>=20?'var(--green)':v>=0?'#e0a000':'var(--red)';
  const bars=cols.map(c=>{const h=c.r===null?0:Math.max(3,Math.min(100,Math.abs(c.r)));
    return '<div class="bh-col" title="'+c.lb+': '+(c.r===null?'chưa có thu':c.r+'% (thu '+fmtShort(c.t)+', chi '+fmtShort(c.c)+')')+'"><span class="bh-v" style="color:'+col(c.r)+'">'+(c.r===null?'—':c.r+'%')+'</span><span class="bh-bar">'+(c.r===null?'':'<i class="'+(c.r<0?'neg':'')+'" style="height:'+h+'%;'+(c.r>=0?'background:'+col(c.r):'')+'"></i>')+'</span><span class="bh-l">'+c.lb+'</span></div>';}).join('');
  return '<div class="rep-card"><div class="rep-card-t">Tỷ lệ tiết kiệm</div>'+
    '<div class="sv-now"><b style="color:'+col(r)+'">'+(r===null?'—':r+'%')+'</b><span>'+(r===null?'Kỳ này chưa có khoản thu nên chưa tính được.':'Kỳ này để dành được '+fmt(thu-chi)+' trên tổng thu '+fmt(thu)+'.')+'</span></div>'+
    '<div class="bh-chart sv-chart">'+bars+'</div>'+
    '<div class="loan-hint" style="margin:8px 0 0;">Tỷ lệ tiết kiệm = (thu − chi) ÷ thu, không tính cho vay, tạm ứng, chia tiền. '+(avg!==null?'Trung bình 12 tháng: <b>'+avg+'%</b>. ':'')+'Nên giữ từ 20% trở lên.</div></div>';
}
const _repExtras=window.reportExtras;
window.reportExtras=function(inRange,start,end){
  fillRepWallet();
  if(_repExtras)_repExtras(inRange,start,end);
  const el=document.getElementById('repExtras');if(el)el.insertAdjacentHTML('afterbegin',savingsCard(inRange));
};

/* =====================================================================
   6. THÔNG BÁO NHẮC TRƯỚC NGÀY TRẢ GỐC/LÃI VAY
   ===================================================================== */
function notifyDays(){return +lsGet('tc_loan_notify')||0;}
function notifPerm(){return 'Notification' in window?Notification.permission:'unsupported';}
function renderLoanNotify(){
  let box=document.getElementById('loanNotify');
  if(!box){const ref=document.querySelector('#screen-loans .loan-summary');if(!ref)return;box=document.createElement('div');box.id='loanNotify';box.className='loan-notify';ref.parentNode.insertBefore(box,ref.nextSibling);}
  const n=notifyDays(),p=notifPerm();
  let hint='';
  if(n){
    if(p==='granted')hint='✓ Sẽ báo trước '+n+' ngày và vào đúng ngày đến hạn.';
    else if(p==='denied')hint='⚠ Bạn đã chặn thông báo của app. Hãy bật lại trong Cài đặt của điện thoại/trình duyệt. Tạm thời app sẽ nhắc bằng dòng chữ khi bạn mở app.';
    else if(p==='unsupported')hint='⚠ Máy này chưa hỗ trợ thông báo. Trên iPhone, hãy Thêm vào Màn hình chính và mở app từ icon (iOS 16.4 trở lên). Tạm thời app sẽ nhắc bằng dòng chữ khi bạn mở app.';
    else hint='<button type="button" class="sug-btn" onclick="askNotifyPerm()">Cho phép thông báo</button>';
    hint+='<br><small>Thông báo được kiểm tra mỗi khi bạn mở app hoặc app đang chạy.</small>';
  }
  box.innerHTML='<div class="ln-row"><span>🔔 Nhắc trước ngày trả gốc/lãi</span><select id="loanNotifySel" onchange="setLoanNotify(this.value)">'+
    [0,1,2,3].map(d=>'<option value="'+d+'"'+(d===n?' selected':'')+'>'+(d?d+' ngày':'Tắt')+'</option>').join('')+'</select></div>'+(hint?'<div class="loan-hint" style="margin:6px 0 0;">'+hint+'</div>':'');
}
window.setLoanNotify=function(v){lsSet('tc_loan_notify',String(+v||0));if(+v&&notifPerm()==='default')askNotifyPerm();else{renderLoanNotify();checkLoanNotify();}};
window.askNotifyPerm=function(){
  if(!('Notification' in window)){renderLoanNotify();return;}
  try{Promise.resolve(Notification.requestPermission()).then(()=>{renderLoanNotify();checkLoanNotify();});}catch(e){renderLoanNotify();}
};
function showNotif(title,body){
  if(notifPerm()!=='granted')return Promise.resolve(false);
  const opt={body,icon:'icon-192.png',badge:'favicon.png',tag:'stc-loan'};
  const viaSW=('serviceWorker' in navigator)?navigator.serviceWorker.getRegistration().then(r=>r?r.showNotification(title,opt).then(()=>true):false):Promise.resolve(false);
  return viaSW.catch(()=>false).then(ok=>{if(ok)return true;try{new Notification(title,opt);return true;}catch(e){return false;}});
}
function checkLoanNotify(){
  const n=notifyDays();if(!n||!Array.isArray(loans)||!loans.length)return;
  const today=todayStr(),lim=addDays(today,n);
  let sent={};try{sent=JSON.parse(lsGet('tc_loan_notified')||'{}')||{};}catch(e){}
  Object.keys(sent).forEach(k=>{if(sent[k]<addDays(today,-60))delete sent[k];});
  const msgs=[];
  loans.forEach(l=>{try{ensureLoanV2(l);}catch(e){}if(l.status==='closed'||!l.termMonths)return;
    const d=loanDueUntil(l,lim);
    Object.keys(d.items).forEach(dt=>{if(dt<today)return;const it=d.items[dt];if(!it.p&&!it.i)return;
      const key=l.id+'|'+dt+(dt===today?'|0':'');if(sent[key])return;msgs.push({key,name:l.name,dt,p:it.p,i:it.i});});});
  if(!msgs.length)return;
  const when=dt=>{const k=daysBetween(today,dt);return k===0?'hôm nay':k===1?'ngày mai':'còn '+k+' ngày';};
  const lines=msgs.map(m=>m.name+': '+[m.p?'gốc '+fmtShort(m.p):'',m.i?'lãi '+fmtShort(m.i):''].filter(Boolean).join(' + ')+' – '+when(m.dt)+' ('+dmy(m.dt)+')');
  const title=msgs.some(m=>m.dt===today)?'🏦 Hôm nay đến hạn trả nợ vay':'🏦 Sắp đến hạn trả nợ vay';
  showNotif(title,lines.join('\n')).then(ok=>{
    if(!ok)showMiniToast(title.replace('🏦 ','🏦 ')+': '+lines.join(' · '),true);
    msgs.forEach(m=>sent[m.key]=today);lsSet('tc_loan_notified',JSON.stringify(sent));
  });
}
window.checkLoanNotify=checkLoanNotify;

/* =====================================================================
   7. NHẮC SAO LƯU / ĐỒNG BỘ
   ===================================================================== */
function cloudOk(){try{return !!(window.Cloud&&Cloud.isLoggedIn()&&!Cloud.isDirty());}catch(e){return false;}}
const _cbr=window.checkBackupReminder;
window.checkBackupReminder=function(){
  const el=document.getElementById('backupWarn');
  /* đã đăng nhập Google và dữ liệu đã đồng bộ lên mây → không cần nhắc sao lưu tay */
  if(cloudOk()){if(el)el.style.display='none';try{updateBackupInfo();}catch(e){}return;}
  if(_cbr)_cbr();
  if(!el||el.style.display==='none')return;
  let b=document.getElementById('bwCloudBtn');
  const loggedIn=!!(window.Cloud&&Cloud.isLoggedIn&&Cloud.isLoggedIn());
  if(!loggedIn&&!b){b=document.createElement('button');b.id='bwCloudBtn';b.textContent='Đồng bộ Google';b.onclick=e=>{e.stopPropagation();cloudDoGoogleLogin(b);};
    const x=el.querySelector('.bw-x');el.insertBefore(b,x);}
  if(b)b.style.display=loggedIn?'none':'';
  if(!loggedIn){const t=document.getElementById('backupWarnTxt');if(t&&!/Google/.test(t.textContent))t.textContent+=' Hoặc đăng nhập Google để tự đồng bộ.';}
};

/* =====================================================================
   8. TÌM KIẾM GIAO DỊCH: thanh tìm ở Tổng quan, gợi ý tên hạng mục, tổng hợp kết quả từ trước đến nay
   ===================================================================== */
window.openHistSearch=function(q){
  if(typeof q==='string'){histF.q=q;histF.type='';histF.month='';histF.group='';histF.wallet='';histF.from='';histF.to='';}
  showScreen('history');
  const i=document.getElementById('hfQ');if(i){i.value=histF.q;['hfType','hfMonth','hfGroup'].forEach(id=>{const e=document.getElementById(id);if(e)e.value=histF[{hfType:'type',hfMonth:'month',hfGroup:'group'}[id]];});}
  renderHistory(true);
  if(typeof q!=='string'&&i)setTimeout(()=>i.focus(),250);
};
function fillHistList(){
  let dl=document.getElementById('hfQList');
  if(!dl){dl=document.createElement('datalist');dl.id='hfQList';document.body.appendChild(dl);}
  const names=new Set();
  ['chi','thu'].forEach(ty=>(GROUPS[ty]||[]).forEach(G=>visibleItems(ty,G).forEach(it=>names.add(it))));
  txs.forEach(t=>{if(t.item)names.add(t.item);});
  dl.innerHTML=[...names].sort((a,b)=>a.localeCompare(b,'vi')).map(n=>'<option value="'+escH(n)+'">').join('');
}
function renderHistQSum(){
  const fb=document.getElementById('historyFilters');if(!fb)return;
  let box=document.getElementById('histQSum');
  if(!box){box=document.createElement('div');box.id='histQSum';box.className='hq-sum';fb.appendChild(box);}
  const q=(histF.q||'').trim(),res=window.histRes||[];
  if(!q||!res.length){box.innerHTML='';box.style.display='none';return;}
  const chi=res.filter(t=>t.type==='chi'),thu=res.filter(t=>t.type==='thu');
  const sum=a=>a.reduce((s,t)=>s+(t.amount||0),0);
  const dates=res.map(t=>t.date).filter(Boolean).sort(),first=dates[0],last=dates[dates.length-1];
  const main=chi.length>=thu.length?chi:thu,isChi=main===chi;
  const byM={};main.forEach(t=>{const m=(t.date||'').slice(0,7);if(!m)return;const o=byM[m]||(byM[m]={v:0,n:0});o.v+=t.amount||0;o.n++;});
  const months=Object.keys(byM).sort().reverse(),mx=Math.max(1,...months.map(m=>byM[m].v));
  const span=first?Math.max(1,(+last.slice(0,4)-+first.slice(0,4))*12+(+last.slice(5,7)-+first.slice(5,7))+1):1;
  const nocf=main.some(t=>!isCashFlow(t));
  box.style.display='block';
  box.innerHTML='<div class="hq-t">«'+escH(q)+'» từ trước đến nay</div>'+
    '<div class="hq-grid">'+
      (chi.length?'<div><span>Đã chi</span><b class="neg">'+fmt(sum(chi))+'</b><small>'+chi.length+' lần</small></div>':'')+
      (thu.length?'<div><span>Đã thu</span><b class="pos">'+fmt(sum(thu))+'</b><small>'+thu.length+' lần</small></div>':'')+
      '<div><span>Trung bình mỗi tháng</span><b>'+fmt(Math.round(sum(main)/span))+'</b><small>'+span+' tháng</small></div>'+
    '</div>'+
    '<div class="hq-sub">Từ '+dmy(first)+' đến '+dmy(last)+(nocf?' · gồm cả khoản không tính thu chi':'')+'</div>'+
    '<div class="hq-months">'+months.map((m,i)=>'<div class="hq-m'+(i>=6?' more':'')+'"><span class="hq-ml">T'+(+m.slice(5,7))+'/'+m.slice(0,4)+'</span><span class="hb-bar"><i style="width:'+Math.max(3,Math.round(byM[m].v/mx*100))+'%;'+(isChi?'':'background:var(--green)')+'"></i></span><span class="hq-mv">'+fmtShort(byM[m].v)+(byM[m].n>1?' <small>('+byM[m].n+' lần)</small>':'')+'</span></div>').join('')+'</div>'+
    (months.length>6?'<button class="hq-toggle" onclick="this.parentNode.classList.toggle(\'open\');this.textContent=this.parentNode.classList.contains(\'open\')?\'Thu gọn\':\'Xem cả '+months.length+' tháng\'">Xem cả '+months.length+' tháng</button>':'');
}
function renderHomeSearch(){
  if(document.getElementById('homeSearch'))return;
  const ref=document.getElementById('backupWarn');if(!ref)return;
  const b=document.createElement('button');b.type='button';b.id='homeSearch';b.className='home-search';
  b.innerHTML='<span>🔍</span><span>Tìm giao dịch… <small>vd. giúp việc, tiền điện</small></span>';
  b.onclick=()=>openHistSearch();ref.parentNode.insertBefore(b,ref);
}

/* =====================================================================
   GẮN VÀO APP
   ===================================================================== */
const _renderHome=window.renderHome;
window.renderHome=function(){_renderHome.apply(this,arguments);try{renderDebtCard();}catch(e){console.error(e);}};
const _renderHistory=window.renderHistory;
window.renderHistory=function(){_renderHistory.apply(this,arguments);try{renderHistQSum();if(!arguments[0])fillHistList();}catch(e){console.error(e);}};
const _renderLoans=window.renderLoans;
window.renderLoans=function(){_renderLoans.apply(this,arguments);try{renderLoanNotify();}catch(e){console.error(e);}};
const _onType=window.onTypeExtras;
window.onTypeExtras=function(t){if(_onType)_onType(t);try{renderTplBar();runNoteSug();}catch(e){}};
const _addHook=window.screenHooks&&window.screenHooks.add;
if(window.screenHooks)window.screenHooks.add=function(){if(_addHook)_addHook();sugAuto=null;const b=noteSugEl();if(b)b.innerHTML='';try{renderTplBar();}catch(e){}};

(function init(){
  const card=document.querySelector('#screen-add .amount-card');
  if(card&&!document.getElementById('tplBar')){const bar=document.createElement('div');bar.id='tplBar';bar.className='tpl-bar';card.parentNode.insertBefore(bar,card);}
  const note=document.getElementById('noteInput');
  if(note&&!noteSugEl()){const s=document.createElement('div');s.id='noteSug';s.className='note-sug';note.parentNode.appendChild(s);
    note.addEventListener('input',()=>{clearTimeout(sugTimer);sugTimer=setTimeout(runNoteSug,250);});}
  const ma=document.getElementById('more-adv');if(ma)ma.innerHTML='<span>'+icon('wallet','#c29a5c',20)+'</span><span>Tạm ứng chờ thu<small class="more-sub">Tiền ăn chung bạn trả trước, chờ bạn bè trả lại</small></span>';
  try{renderTplBar();renderDebtCard();renderHomeSearch();fillHistList();}catch(e){}
  setTimeout(()=>{try{checkLoanNotify();}catch(e){}},2500);
  document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')try{checkLoanNotify();}catch(e){}});
  setInterval(()=>{try{checkLoanNotify();}catch(e){}},30*60*1000);
})();
})();
