/* Sổ Thu Chi – tối ưu trải nghiệm (v86):
   1. Báo cáo: bấm lát bánh / tên nhóm → chi tiết nhóm; bấm cột tháng → tới tháng đó; vuốt trái/phải đổi kỳ
   2. Báo cáo: nhãn ▲▼ % so với kỳ trước ngay trong ô Thu / Chi
   3. Ví tiền: dạng danh sách gọn chia nhóm (giữ được dạng thẻ)      4. Bấm ví → xem nhanh
   5. Cài đặt: chia nhóm có tiêu đề                                  7. Lịch sử: chọn nhiều giao dịch
   8. Tổng quan: dòng "Hôm nay"   (6. lọc theo ví + khoảng ngày nằm trong app.js renderHistory) */
(function(){
function $(id){return document.getElementById(id);}
function lsGet(k){try{return localStorage.getItem(k);}catch(e){return null;}}
function lsSet(k,v){try{localStorage.setItem(k,v);}catch(e){}}
function kfmt(v){v=+v||0;const s=v<0?'−':'';v=Math.abs(v);if(v>=1e6)return s+(Math.round(v/1e5)/10).toString().replace('.',',')+'tr';if(v>=1000)return s+Math.round(v/1000)+'k';return s+v;}
function hb(v){return (typeof hideBal!=='undefined'&&hideBal)?'******':fmtShort(v);}

/* =====================================================================
   1 + 2. BÁO CÁO
   ===================================================================== */
function repChiGroups(){
  const {start,end}=getRange();const by={};
  txs.forEach(t=>{if(t.type!=='chi'||!isCashFlow(t)||!repWalletOk(t))return;const d=new Date(t.date+'T00:00:00');if(d<start||d>end)return;const k=t.group||'Khác';by[k]=(by[k]||0)+t.amount;});
  return Object.entries(by).sort((a,b)=>b[1]-a[1]);
}
window.openRepGroup=function(g){
  const list=repInRange.filter(t=>t.type==='chi'&&isCashFlow(t)&&(t.group||'Khác')===g);
  repDetailType='chi';repOpenItems.clear();list.forEach(t=>repOpenItems.add(t.item||t.group||'Khác'));renderRepDetail(repInRange);
  const d=$('repDetail');if(d)d.scrollIntoView({behavior:'smooth',block:'start'});
};
function enhanceReport(){
  /* chú thích + lát bánh bấm được */
  const rows=repChiGroups(),tot=rows.reduce((s,r)=>s+r[1],0);
  const leg=document.querySelectorAll('#repDonut .donut-legend > div');
  leg.forEach((el,i)=>{if(!rows[i])return;el.classList.add('leg-tap');el.dataset.g=rows[i][0];el.onclick=()=>openRepGroup(rows[i][0]);});
  const dn=document.querySelector('#repDonut .donut');
  if(dn&&tot)dn.onclick=e=>{const r=dn.getBoundingClientRect(),x=e.clientX-r.left-r.width/2,y=e.clientY-r.top-r.height/2;
    let a=Math.atan2(x,-y)*180/Math.PI;if(a<0)a+=360;let acc=0;for(const [g,v] of rows){acc+=v/tot*360;if(a<=acc){openRepGroup(g);return;}}};
  /* cột tháng bấm được */
  const base=new Date(reportRef);
  document.querySelectorAll('#repTrend .trend-col').forEach((c,i,all)=>{const m=new Date(base.getFullYear(),base.getMonth()-(all.length-1-i),1);c.classList.add('trend-tap');c.title='Xem tháng '+(m.getMonth()+1)+'/'+m.getFullYear();
    c.onclick=()=>goReportMonth(m);});
  /* ▲▼ so với kỳ trước trong ô Thu / Chi */
  try{
    const P=prevRange(),cur=t=>repInRange.filter(x=>x.type===t&&isCashFlow(x)).reduce((s,x)=>s+x.amount,0);
    [['thu','repThu'],['chi','repChi']].forEach(([t,id])=>{
      const box=$(id);if(!box)return;let b=box.parentNode.querySelector('.rep-delta');if(!b){b=document.createElement('div');b.className='rep-delta';box.parentNode.appendChild(b);}
      const a=cur(t),p=sumRange(P.start,P.end,t);
      if(!p){b.textContent=a?'mới':'';b.className='rep-delta';return;}
      const d=Math.round((a-p)/p*100),good=t==='thu'?d>=0:d<=0;
      b.textContent=(d>0?'▲ ':d<0?'▼ ':'')+Math.abs(d)+'% kỳ trước';b.className='rep-delta '+(d===0?'':good?'good':'bad');b.title='Kỳ trước: '+fmt(p);
    });
    const cmp=$('repCompare');if(cmp)cmp.style.display='none';
  }catch(e){console.error(e);}
}
window.goReportMonth=function(m){
  reportPeriod='month';reportRef=new Date(m.getFullYear(),m.getMonth(),1);
  document.querySelectorAll('#screen-report .period-tabs button').forEach(b=>b.classList.toggle('active',/Tháng/.test(b.textContent)));
  renderReport();window.scrollTo({top:0,behavior:'smooth'});
};
/* vuốt trái/phải trên màn Báo cáo để đổi kỳ (bỏ qua khi vuốt trên dòng giao dịch / vùng cuộn ngang) */
let rs=null;
document.addEventListener('touchstart',e=>{const scr=e.target.closest&&e.target.closest('#screen-report');if(!scr||e.target.closest('.tx-item,select,input,.bh-chart,.add-tools')){rs=null;return;}rs={x:e.touches[0].clientX,y:e.touches[0].clientY};},{passive:true});
document.addEventListener('touchend',e=>{if(!rs)return;const t=e.changedTouches[0],dx=t.clientX-rs.x,dy=t.clientY-rs.y;rs=null;
  if(Math.abs(dx)>70&&Math.abs(dy)<45&&currentScreen()==='report'){navPeriod(dx<0?1:-1);showMiniToast(document.getElementById('rangeLabel').textContent);}},{passive:true});

/* =====================================================================
   3 + 4. VÍ TIỀN: DANH SÁCH GỌN + XEM NHANH
   ===================================================================== */
function accMode(){return lsGet('tc_acc_view')==='card'?'card':'list';}
window.setAccView=function(m){lsSet('tc_acc_view',m);renderAccounts();};
function walletSub(w){
  if(w.type==='saving'){const left=w.maturityDate?daysUntil(w.maturityDate):null;return (w.rate||0)+'%/năm · '+(w.termMonths||'?')+' tháng'+(w.matured?' · đã tất toán':left===null?'':left<0?' · đã đáo hạn':' · còn '+left+' ngày');}
  if(isCredit(w)){const d=creditDebt(w);return w.limit?'Còn hạn mức '+hb(Math.max(0,w.limit-d)):'Thẻ tín dụng';}
  return (WTYPES.find(t=>t.id===w.type)||{}).name||'';
}
function enhanceAccounts(){
  const list=$('accList');if(!list||!wallets.length)return;
  let sw=$('accViewSw');
  if(!sw){sw=document.createElement('div');sw.id='accViewSw';sw.className='acc-view-sw';list.parentNode.insertBefore(sw,list);}
  const m=accMode();
  sw.innerHTML='<button type="button" class="'+(m==='list'?'on':'')+'" onclick="setAccView(\'list\')">☰ Danh sách</button><button type="button" class="'+(m==='card'?'on':'')+'" onclick="setAccView(\'card\')">▭ Thẻ</button>';
  /* dạng thẻ: bấm vào thẻ (ngoài nút) cũng mở xem nhanh */
  if(m==='card'){list.querySelectorAll('.wcard').forEach((c,i)=>{const w=wallets[i];if(!w)return;c.style.cursor='pointer';c.onclick=e=>{if(!e.target.closest('button'))openWalletQuick(w.id);};});return;}
  const groups=[['Tiền mặt & ngân hàng',w=>!isCredit(w)&&w.type!=='saving'],['Thẻ tín dụng',w=>isCredit(w)],['Tiết kiệm',w=>w.type==='saving']];
  list.innerHTML=groups.map(([title,f])=>{const ws=wallets.filter(f);if(!ws.length)return '';
    const sum=ws.reduce((s,w)=>s+(isCredit(w)?-creditDebt(w):w.balance||0),0);
    return '<div class="acc-grp"><div class="acc-gh"><span>'+title+'</span><b class="'+(sum<0?'neg':'')+'">'+hb(sum)+'</b></div>'+
      ws.map(w=>{const cr=isCredit(w),bal=cr?creditDebt(w):w.balance||0;
        return '<button type="button" class="acc-row" onclick="openWalletQuick('+w.id+')"><span class="acc-ic">'+icon(w.type==='bank'?'bank':w.type==='saving'?'piggy':'wallet','#e2c28b',18)+'</span>'+
          '<span class="acc-t"><span class="acc-n">'+escH(w.name)+'</span><small>'+walletSub(w)+'</small></span>'+
          '<span class="acc-b'+((cr&&bal>0)||(!cr&&bal<0)?' neg':'')+'">'+(cr&&bal>0?'−':'')+hb(bal)+'</span><span class="acc-go">›</span></button>';}).join('')+'</div>';}).join('');
}
window.openWalletQuick=function(id){
  const w=wallets.find(x=>String(x.id)===String(id));if(!w)return;
  const ym=todayStr().slice(0,7),mine=t=>String(t.walletId)===String(w.id)||t.fromName===w.name||t.toName===w.name;
  const list=txs.filter(mine),m=list.filter(t=>(t.date||'').slice(0,7)===ym);
  const thu=m.filter(t=>t.type==='thu'&&isCashFlow(t)).reduce((s,t)=>s+t.amount,0),chi=m.filter(t=>t.type==='chi'&&isCashFlow(t)).reduce((s,t)=>s+t.amount,0);
  const cr=isCredit(w),bal=cr?creditDebt(w):w.balance||0;
  openModal('<h3>'+escH(w.name)+'</h3>'+
    '<div class="wq-bal"><span>'+(cr?'Dư nợ thẻ':'Số dư')+'</span><b class="'+((cr&&bal>0)||(!cr&&bal<0)?'neg':'')+'">'+hb(bal)+' VND</b><small>'+walletSub(w)+'</small></div>'+
    '<div class="wq-month"><div><span>Thu tháng này</span><b class="pos">'+fmtShort(thu)+'</b></div><div><span>Chi tháng này</span><b class="neg">'+fmtShort(chi)+'</b></div></div>'+
    '<div class="wq-acts">'+(w.type!=='saving'?'<button type="button" onclick="walletQuickXfer('+w.id+')">⇄ Chuyển tiền</button>':'')+(cr&&bal>0?'<button type="button" onclick="closeAppModal();openCreditPay('+w.id+')">💳 Trả nợ thẻ</button>':'')+
      '<button type="button" onclick="closeAppModal();openWalletEdit('+w.id+')">✎ Sửa ví</button></div>'+
    '<div class="wq-t">Giao dịch gần đây</div>'+(list.length?list.slice(0,6).map(txItemHTML).join(''):'<div class="empty">Chưa có giao dịch nào.</div>')+
    (list.length>6?'<button type="button" class="hq-toggle" onclick="walletQuickAll('+w.id+')">Xem tất cả '+list.length+' giao dịch ›</button>':'')+
    '<div class="edit-modal-actions"><button class="edit-modal-save" onclick="closeAppModal()">Đóng</button></div>');
  const body=$('appModalBody');if(body)body.querySelectorAll('.tx-item').forEach(r=>r.addEventListener('click',()=>closeAppModal(),true));
};
window.walletQuickXfer=function(id){closeAppModal();showScreen('add');setType('transfer');const f=$('xferFrom');if(f&&[...f.options].some(o=>o.value===String(id))){f.value=String(id);const t=$('xferTo');if(t&&t.value===String(id)){const o=[...t.options].find(o=>o.value!==String(id));if(o)t.value=o.value;}}};
window.walletQuickAll=function(id){closeAppModal();Object.assign(histF,{q:'',type:'',group:'',month:'',wallet:String(id),from:'',to:''});const q=$('hfQ');if(q)q.value='';showScreen('history');const hw=$('hfWallet');if(hw)hw.value=String(id);renderHistory(true);};

/* =====================================================================
   5. CÀI ĐẶT CHIA NHÓM
   ===================================================================== */
const MORE_SECS=[['Ghi chép',['more-sms','more-hist','more-recur','more-cats','more-split']],['Tiền & ví',['more-acc','more-budget','more-goals']],
  ['Vay & nợ',['more-loans','more-debts','more-borrow','more-adv','more-family']],['Dữ liệu & bảo mật',['grp-backup','more-lock','more-bio','more-admin','more-update']],
  ['Giao diện',['grp-skin','grp-fs','more-iconstyle','more-mode','more-reward','more-chars']]];
function groupMore(){
  const inner=document.querySelector('#screen-more .inner'),anchor=$('more-trash');if(!inner||!anchor)return;
  inner.querySelectorAll('.more-sec').forEach(h=>h.remove());
  const order=(typeof getMoreOrder==='function'?getMoreOrder():[]);
  MORE_SECS.forEach(([title,ids])=>{
    const els=ids.map(id=>$(id)).filter(Boolean).sort((a,b)=>order.indexOf(a.id)-order.indexOf(b.id));if(!els.length)return;
    const h=document.createElement('div');h.className='more-sec';h.textContent=title;inner.insertBefore(h,anchor);
    els.forEach(e=>inner.insertBefore(e,anchor));
  });
  syncMoreSecs();
}
function syncMoreSecs(){
  document.querySelectorAll('#screen-more .more-sec').forEach(h=>{let n=h.nextElementSibling,vis=false;
    while(n&&!n.classList.contains('more-sec')&&n.id!=='more-trash'){if(getComputedStyle(n).display!=='none'){vis=true;break;}n=n.nextElementSibling;}
    h.style.display=vis?'':'none';});
}

/* =====================================================================
   7. LỊCH SỬ: CHỌN NHIỀU
   ===================================================================== */
let selMode=false;const sel=new Set();
function rowId(r){const b=r.querySelector('.icon-btn[aria-label="Xoá"]');const m=b&&(b.getAttribute('onclick')||'').match(/deleteTx\(([\d.]+)\)/);return m?+m[1]:null;}
function ensureSelUI(){
  const head=document.querySelector('#screen-history .scr-head');
  if(head&&!$('histSelBtn')){const b=document.createElement('button');b.id='histSelBtn';b.type='button';b.className='hist-sel-btn';b.textContent='Chọn';b.onclick=()=>setSelMode(!selMode);head.appendChild(b);}
  if(!$('selBar')){const bar=document.createElement('div');bar.id='selBar';bar.className='sel-bar';
    bar.innerHTML='<span id="selCount">Đã chọn 0</span><button type="button" onclick="selAll()">Tất cả</button><button type="button" onclick="selNoCF()">Không tính thu chi</button><button type="button" onclick="selRecat()">Đổi hạng mục</button><button type="button" class="danger" onclick="selDelete()">Xoá</button><button type="button" onclick="setSelMode(false)">Huỷ</button>';
    document.body.appendChild(bar);}
}
window.setSelMode=function(on){selMode=!!on;sel.clear();document.querySelectorAll('.tx-item.swiped').forEach(r=>r.classList.remove('swiped'));const b=$('histSelBtn');if(b)b.textContent=selMode?'Xong':'Chọn';document.body.classList.toggle('hist-selecting',selMode);paintSel();};
function paintSel(){document.querySelectorAll('#historyList .tx-item').forEach(r=>{const id=rowId(r);r.classList.toggle('sel',selMode&&sel.has(id));r.classList.toggle('selectable',selMode);});
  const c=$('selCount');if(c)c.textContent='Đã chọn '+sel.size;const bar=$('selBar');if(bar)bar.classList.toggle('show',selMode);}
document.addEventListener('click',e=>{if(!selMode)return;const r=e.target.closest&&e.target.closest('#historyList .tx-item');if(!r)return;e.stopPropagation();e.preventDefault();
  const id=rowId(r);if(id==null)return;if(sel.has(id))sel.delete(id);else sel.add(id);paintSel();},true);
window.selAll=function(){(window.histRes||[]).forEach(t=>sel.add(t.id));paintSel();};
function selTx(){return [...sel].map(id=>txs.find(t=>t.id===id)).filter(Boolean);}
window.selDelete=function(){const l=selTx();if(!l.length)return;if(!confirm('Xoá '+l.length+' giao dịch đã chọn? Số dư ví sẽ được hoàn lại.'))return;
  const real=window.confirm;window.confirm=()=>true;try{l.forEach(t=>deleteTx(t.id));}finally{window.confirm=real;}
  const ub=$('undoBar');if(ub&&l.length>1)ub.classList.remove('show'); /* thanh Hoàn tác chỉ khôi phục được khoản cuối → ẩn khi xoá nhiều */
  showMiniToast('✓ Đã xoá '+l.length+' giao dịch');setSelMode(false);renderHistory(true);};
window.selNoCF=function(){const l=selTx().filter(t=>t.type==='chi'||t.type==='thu');if(!l.length){showMiniToast('Chỉ áp dụng cho khoản Thu/Chi',true);return;}
  l.forEach(t=>t.noCF=true);saveAll();showMiniToast('✓ '+l.length+' giao dịch không tính vào thu chi');setSelMode(false);renderHistory(true);};
window.selRecat=function(){
  const l=selTx().filter(t=>(t.type==='chi'||t.type==='thu')&&!t.loanId&&!t.debtId&&!t.advOf&&!t.split);
  if(!l.length){showMiniToast('Chọn các khoản Thu/Chi thường (không phải vay, cho vay) để đổi hạng mục',true);return;}
  const types=[...new Set(l.map(t=>t.type))];if(types.length>1){showMiniToast('Hãy chọn các khoản cùng loại (chỉ Chi hoặc chỉ Thu)',true);return;}
  const ty=types[0],opts=GROUPS[ty].flatMap(G=>visibleItems(ty,G).map(it=>'<option value="'+escH(G.name+'|||'+it)+'">'+escH(G.name===it?it:G.name+' • '+it)+'</option>')).join('');
  openModal('<h3>Đổi hạng mục cho '+l.length+' giao dịch</h3><div class="we-form"><select id="selCat" class="we-in">'+opts+'</select></div><div class="edit-modal-actions"><button class="edit-modal-cancel" onclick="closeAppModal()">Huỷ</button><button class="edit-modal-save" onclick="selRecatApply()">Đổi</button></div>');
  window.__selRecat=l.map(t=>t.id);
};
window.selRecatApply=function(){
  const [g,it]=$('selCat').value.split('|||'),ids=window.__selRecat||[];let n=0;
  ids.forEach(id=>{const t=txs.find(x=>x.id===id);if(!t)return;const G=GROUPS[t.type].find(x=>x.name===g);if(!G)return;
    Object.assign(t,{group:g,item:it,icon:'e:'+(it===g&&!G.single?G.emoji:itemEmoji(t.type,g,it)),accent:G.accent,bg:it===g?G.bg:itemTint(t.type,g,it)});n++;});
  saveAll();closeAppModal();showMiniToast('✓ Đã đổi hạng mục '+n+' giao dịch');setSelMode(false);renderHistory(true);
};

/* =====================================================================
   8. DÒNG "HÔM NAY" Ở TỔNG QUAN
   ===================================================================== */
function renderToday(){
  let el=$('todayLine');
  if(!el){const links=document.querySelector('#screen-home .bal-links');if(!links)return;el=document.createElement('button');el.type='button';el.id='todayLine';el.className='today-line';el.onclick=()=>openToday();links.parentNode.insertBefore(el,links);}
  const today=todayStr(),ymv=today.slice(0,7),isC=t=>t.type==='chi'&&isCashFlow(t);
  const spent=txs.filter(t=>isC(t)&&t.date===today).reduce((s,t)=>s+t.amount,0);
  const total=GROUPS.chi.reduce((s,g)=>s+(budgets[g.name]||0),0);let tail='';
  if(total){const now=new Date(),dim=new Date(now.getFullYear(),now.getMonth()+1,0).getDate(),daysLeft=dim-now.getDate()+1;
    const before=txs.filter(t=>isC(t)&&(t.date||'').slice(0,7)===ymv&&t.date<today).reduce((s,t)=>s+t.amount,0);
    const allow=Math.floor((total-before)/daysLeft),left=allow-spent;
    tail=allow<=0?' · đã hết ngân sách tháng':left>=0?' · còn <b>'+kfmt(left)+'</b> theo ngân sách':' · <span class="neg">vượt '+kfmt(-left)+'</span> mức hôm nay';}
  else{const from=addDays(today,-30),avg=Math.round(txs.filter(t=>isC(t)&&t.date>=from&&t.date<today).reduce((s,t)=>s+t.amount,0)/30);if(avg)tail=' · trung bình '+kfmt(avg)+'/ngày';}
  el.innerHTML='<span>Hôm nay đã chi <b>'+kfmt(spent)+'</b>'+tail+'</span><span class="tl-go">›</span>';
}
window.openToday=function(){const d=todayStr();Object.assign(histF,{q:'',type:'',group:'',month:'range',wallet:'',from:d,to:d});const q=$('hfQ');if(q)q.value='';showScreen('history');
  const f=$('hfFrom'),t=$('hfTo'),m=$('hfMonth');if(f)f.value=d;if(t)t.value=d;if(m)m.value='range';renderHistory(true);};

/* =====================================================================
   GẮN VÀO APP
   ===================================================================== */
const _rr=window.renderReport;window.renderReport=function(){const r=_rr.apply(this,arguments);try{enhanceReport();}catch(e){console.error(e);}return r;};
const _ra=window.renderAccounts;window.renderAccounts=function(){const r=_ra.apply(this,arguments);try{enhanceAccounts();}catch(e){console.error(e);}return r;};
const _rhm=window.renderHome;window.renderHome=function(){const r=_rhm.apply(this,arguments);try{renderToday();}catch(e){console.error(e);}return r;};
const _rhs=window.renderHistory;window.renderHistory=function(){const r=_rhs.apply(this,arguments);try{ensureSelUI();paintSel();}catch(e){console.error(e);}return r;};
const _amo=window.applyMoreOrder;if(_amo)window.applyMoreOrder=function(){const r=_amo.apply(this,arguments);try{groupMore();}catch(e){}return r;};
const _ss=window.showScreen;window.showScreen=function(n){if(selMode&&n!=='history')setSelMode(false);const r=_ss.apply(this,arguments);if(n==='more')try{syncMoreSecs();}catch(e){}return r;};
document.addEventListener('input',e=>{if(e.target&&e.target.id==='moreSearch')setTimeout(syncMoreSecs,0);});
try{groupMore();renderToday();ensureSelUI();}catch(e){console.error(e);}
})();
