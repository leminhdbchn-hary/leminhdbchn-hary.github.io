/* Sổ Thu Chi – tối ưu trải nghiệm (v84):
   1. Màn Thêm giao dịch: Số tiền + Hạng mục lên đầu, công cụ phụ gom thành hàng nút nhỏ
   2. Gợi ý số tiền nhanh (20k…500k, 000)      3. "Lưu & ghi tiếp" + hoàn tác
   5. Danh sách giao dịch: bấm dòng để sửa, vuốt sang trái để xoá (máy tính vẫn có nút)
   6. Thanh ngân sách tháng ở Tổng quan        9. Giữ nháp khi lỡ thoát màn Thêm */
(function(){
function $(id){return document.getElementById(id);}
function lsGet(k){try{return localStorage.getItem(k);}catch(e){return null;}}
function lsSet(k,v){try{if(v==null)localStorage.removeItem(k);else localStorage.setItem(k,v);}catch(e){}}
function kfmt(v){v=+v||0;if(v>=1e6)return (Math.round(v/1e5)/10).toString().replace('.',',')+'tr';if(v>=1000)return Math.round(v/1000)+'k';return String(v);}

/* =====================================================================
   1. SẮP XẾP LẠI MÀN THÊM GIAO DỊCH
   ===================================================================== */
function layoutAdd(){
  const scr=$('screen-add');if(!scr||scr.dataset.ux2)return;scr.dataset.ux2='1';
  const inner=scr.querySelector('.inner'),tabs=inner.querySelector('.type-tabs'),amount=inner.querySelector('.amount-card'),normal=$('normalFields');
  const qe=$('qeBar'),qh=$('qeHint'),debtQ=$('debtQuick'),sms=inner.querySelector('.sms-open'),nocf=$('noCfRow'),tpl=$('tplBar');
  /* hàng công cụ nhỏ ngay dưới tab Chi/Thu */
  const tools=document.createElement('div');tools.className='add-tools';tools.id='addTools';
  tools.innerHTML='<button type="button" id="atQe" onclick="toggleQuickEntry()">⚡ Nhập nhanh</button><button type="button" onclick="openSmsImport()">📩 Dán SMS</button>'+
    '<button type="button" onclick="openDebts(\'out\',true)">🤝 Cho vay</button><button type="button" onclick="openDebts(\'in\',true)">💳 Vay nợ</button>';
  tabs.parentNode.insertBefore(tools,tabs.nextSibling);
  /* ô nhập nhanh: thu gọn, bấm "⚡ Nhập nhanh" mới hiện (nhớ lựa chọn) */
  if(qe){tools.parentNode.insertBefore(qe,tools.nextSibling);if(qh)qe.parentNode.insertBefore(qh,qe.nextSibling);}
  if(debtQ)debtQ.classList.add('ux2-hide');if(sms)sms.classList.add('ux2-hide');
  /* mẫu → số tiền → gợi ý số tiền → ví + hạng mục → không tính thu chi */
  const anchor=qh||qe||tools;
  if(tpl)anchor.parentNode.insertBefore(tpl,anchor.nextSibling);
  (tpl||anchor).parentNode.insertBefore(amount,(tpl||anchor).nextSibling);
  const chips=document.createElement('div');chips.className='amt-chips';chips.id='amtChips';
  chips.innerHTML=[20000,50000,100000,200000,500000].map(v=>'<button type="button" onclick="setQuickAmount('+v+')">'+kfmt(v)+'</button>').join('')+'<button type="button" class="amt-000" onclick="appendZeros()" aria-label="Thêm 000">000</button>';
  amount.appendChild(chips);
  if(normal)amount.parentNode.insertBefore(normal,amount.nextSibling);
  if(nocf&&normal)normal.parentNode.insertBefore(nocf,normal.nextSibling);
  if(nocf)nocf.classList.add('nocf-compact');
  setQeOpen(lsGet('tc_qe_open')==='1');
  /* "Lưu & ghi tiếp" cạnh nút Lưu */
  const save=$('saveTxBtn');
  if(save&&!$('saveNextBtn')){const row=document.createElement('div');row.className='save-row';save.parentNode.insertBefore(row,save);row.appendChild(save);
    const nx=document.createElement('button');nx.className='save-btn ghost-btn';nx.id='saveNextBtn';nx.type='button';nx.textContent='Lưu & ghi tiếp';nx.onclick=()=>saveAndNext();row.appendChild(nx);}
  /* thông báo vừa lưu (hoàn tác) + nháp */
  const bar=document.createElement('div');bar.id='addInfo';bar.className='add-info';tabs.parentNode.insertBefore(bar,tabs);
}
function setQeOpen(open){const qe=$('qeBar'),qh=$('qeHint'),b=$('atQe');if(qe)qe.classList.toggle('qe-collapsed',!open);if(qh)qh.classList.toggle('qe-collapsed',!open);if(b)b.classList.toggle('on',open);}
window.toggleQuickEntry=function(){const open=$('qeBar').classList.contains('qe-collapsed');setQeOpen(open);lsSet('tc_qe_open',open?'1':'0');if(open)setTimeout(()=>{const i=$('qeInput');if(i)i.focus();},50);};

/* =====================================================================
   2. GỢI Ý SỐ TIỀN
   ===================================================================== */
function amtEl(){return $('amountInput');}
function setAmt(v){const a=amtEl();a.value=v>0?fmtShort(v):'';a.dispatchEvent(new Event('input',{bubbles:true}));saveDraftSoon();}
window.setQuickAmount=function(v){setAmt(v);};
window.appendZeros=function(){const a=amtEl(),cur=parseInt((a.value||'').replace(/\D/g,''))||0;if(!cur){a.focus();return;}if(cur>=1e11)return;setAmt(cur*1000);};

/* =====================================================================
   3. LƯU & GHI TIẾP (+ hoàn tác)
   ===================================================================== */
function showAddInfo(html){const b=$('addInfo');if(!b)return;b.innerHTML=html;b.style.display=html?'flex':'none';}
let lastSavedId=null;
window.saveAndNext=function(){
  if(editingTxId){saveTx();return;}
  const type=currentType,acc=$('accSelect')?$('accSelect').value:'',date=$('dateInput').value,n=txs.length,ids=new Set(txs.map(t=>t.id));
  saveTx();
  if(txs.length<=n)return; /* chưa lưu được (thiếu số tiền / hạng mục…) */
  const t=txs.find(x=>!ids.has(x.id));lastSavedId=t?t.id:null;
  showScreen('add');setType(type);
  if(acc&&$('accSelect')&&[...$('accSelect').options].some(o=>o.value===acc))$('accSelect').value=acc;
  if(date)$('dateInput').value=date;
  const label=t?(t.item||(t.type==='transfer'?'Chuyển ví':t.person||'Giao dịch'))+' '+fmt(t.amount):'';
  showAddInfo('<span>✓ Đã lưu '+escH(label)+'</span>'+(t?'<button type="button" onclick="undoLastSaved()">Hoàn tác</button>':''));
  setTimeout(()=>{const a=amtEl();if(a&&currentScreen()==='add')a.focus();},80);
};
window.undoLastSaved=function(){if(!lastSavedId)return;const id=lastSavedId;lastSavedId=null;deleteTx(id);showAddInfo('');showMiniToast('Đã hoàn tác giao dịch vừa lưu');if(currentScreen()!=='add')showScreen('add');};

/* =====================================================================
   5. VUỐT SANG TRÁI ĐỂ XOÁ
   ===================================================================== */
let sw=null;
function rowOf(e){const r=e.target.closest&&e.target.closest('.tx-item');return r&&r.querySelector('.icon-btn[aria-label="Xoá"]')?r:null;}
function unswipeAll(except){document.querySelectorAll('.tx-item.swiped').forEach(r=>{if(r!==except)r.classList.remove('swiped');});}
document.addEventListener('touchstart',e=>{const r=rowOf(e);if(!r){unswipeAll();return;}sw={r,x:e.touches[0].clientX,y:e.touches[0].clientY,done:false};},{passive:true});
document.addEventListener('touchmove',e=>{if(!sw||sw.done)return;const dx=e.touches[0].clientX-sw.x,dy=e.touches[0].clientY-sw.y;if(Math.abs(dy)>30){sw=null;return;}
  if(dx<-45){unswipeAll(sw.r);sw.r.classList.add('swiped');sw.done=true;swipeHintDone();}else if(dx>35){sw.r.classList.remove('swiped');sw.done=true;}},{passive:true});
document.addEventListener('touchend',()=>{sw=null;},{passive:true});
/* đang hiện nút Xoá mà bấm vào dòng → chỉ thu lại, không mở sửa */
document.addEventListener('click',e=>{const r=e.target.closest&&e.target.closest('.tx-item.swiped');if(r&&!e.target.closest('button')){r.classList.remove('swiped');e.stopPropagation();e.preventDefault();}},true);
function swipeHintDone(){lsSet('tc_swipe_hint','1');}
function maybeSwipeHint(){if(lsGet('tc_swipe_hint')||!('ontouchstart' in window)||!txs.length)return;lsSet('tc_swipe_hint','1');setTimeout(()=>showMiniToast('Mẹo: bấm vào giao dịch để sửa, vuốt sang trái để xoá'),900);}

/* =====================================================================
   6. THANH NGÂN SÁCH THÁNG Ở TỔNG QUAN
   ===================================================================== */
function renderBudgetBar(){
  let el=$('homeBudget');
  if(!el){const ref=document.querySelector('#screen-home .month-row');if(!ref)return;el=document.createElement('div');el.id='homeBudget';el.className='home-budget';el.onclick=()=>showScreen('budget');ref.parentNode.insertBefore(el,ref.nextSibling);}
  const total=GROUPS.chi.reduce((s,g)=>s+(budgets[g.name]||0),0);
  if(!total){el.style.display='none';return;}
  const now=new Date(),ymv=todayStr().slice(0,7),dim=new Date(now.getFullYear(),now.getMonth()+1,0).getDate(),day=now.getDate();
  const spent=txs.filter(t=>t.type==='chi'&&isCashFlow(t)&&(t.date||'').slice(0,7)===ymv).reduce((s,t)=>s+(t.amount||0),0);
  const pct=Math.round(spent/total*100),timePct=Math.round(day/dim*100),left=total-spent,daysLeft=dim-day+1;
  const st=spent>total?'over':pct>timePct+10?'warn':'ok';
  const msg=st==='over'?'Đã vượt ngân sách '+fmtShort(spent-total)+' · '+daysLeft+' ngày nữa hết tháng'
    :'Còn '+fmtShort(left)+' cho '+daysLeft+' ngày → mỗi ngày nên chi tối đa <b>'+kfmt(Math.floor(left/daysLeft))+'</b>'+(st==='warn'?' · đang chi nhanh hơn kế hoạch':'');
  el.style.display='block';el.className='home-budget '+st;
  el.innerHTML='<div class="hb-top"><span>Ngân sách tháng</span><span><b>'+pct+'%</b> · '+fmtShort(spent)+' / '+fmtShort(total)+'</span></div>'+
    '<div class="hb-track"><i style="width:'+Math.min(100,pct)+'%"></i><em style="left:'+timePct+'%" title="Hôm nay"></em></div><div class="hb-msg">'+msg+'</div>';
}

/* =====================================================================
   9. GIỮ NHÁP MÀN THÊM GIAO DỊCH
   ===================================================================== */
const DK='tc_add_draft';let draftT=null,restoring=false;
function readForm(){const v=id=>{const e=$(id);return e?e.value:'';};
  return {type:currentType,amount:v('amountInput'),note:v('noteInput'),person:v('personInput'),wallet:v('accSelect'),date:v('dateInput'),group:selectedGroup,item:selectedItem,at:Date.now()};}
function saveDraftSoon(){if(restoring)return;clearTimeout(draftT);draftT=setTimeout(saveDraft,300);}
function saveDraft(){
  if(editingTxId||currentScreen()!=='add')return;
  const f=readForm();if(!(parseInt((f.amount||'').replace(/\D/g,''))>0)&&!f.note.trim()){lsSet(DK,null);return;}
  lsSet(DK,JSON.stringify(f));
}
function clearDraft(){clearTimeout(draftT);lsSet(DK,null);}
function restoreDraft(){
  let d=null;try{d=JSON.parse(lsGet(DK)||'null');}catch(e){}
  if(!d||Date.now()-(d.at||0)>864e5||editingTxId){if(d&&Date.now()-(d.at||0)>864e5)clearDraft();return;}
  restoring=true;
  try{
    if(d.type&&d.type!==currentType)setType(d.type);
    if(d.group&&d.item&&catValid(d.type,d.group,d.item)){selectedGroup=d.group;selectedItem=d.item;renderCatPicker();}
    const set=(id,v)=>{const e=$(id);if(e&&v!=null&&v!=='')e.value=v;};
    set('amountInput',d.amount);set('noteInput',d.note);set('personInput',d.person);set('dateInput',d.date);
    const acc=$('accSelect');if(acc&&d.wallet&&[...acc.options].some(o=>o.value===d.wallet))acc.value=d.wallet;
  }finally{restoring=false;}
  showAddInfo('<span>📝 Đã khôi phục khoản đang nhập dở</span><button type="button" onclick="discardDraft()">Bỏ nháp</button>');
}
window.discardDraft=function(){clearDraft();showScreen('add');['amountInput','noteInput','personInput'].forEach(id=>{const e=$(id);if(e)e.value='';});selectedItem=null;try{renderCatPicker();syncNoCfChk(false);}catch(e){}showAddInfo('');};

/* =====================================================================
   GẮN VÀO APP
   ===================================================================== */
const _saveTx=window.saveTx;
window.saveTx=function(){const n=txs.length,ed=editingTxId;const r=_saveTx.apply(this,arguments);if(txs.length>n||(ed&&!editingTxId))clearDraft();return r;};
const _addHook=window.screenHooks&&window.screenHooks.add;
if(window.screenHooks)window.screenHooks.add=function(){if(_addHook)_addHook();layoutAdd();showAddInfo('');restoreDraft();};
const _rh=window.renderHome;
window.renderHome=function(){_rh.apply(this,arguments);try{renderBudgetBar();maybeSwipeHint();}catch(e){console.error(e);}};
const _onType=window.onTypeExtras;
window.onTypeExtras=function(t){if(_onType)_onType(t);const c=$('amtChips');if(c)c.style.display='';saveDraftSoon();};
['input','change'].forEach(ev=>document.addEventListener(ev,e=>{if(e.target&&e.target.closest&&e.target.closest('#screen-add'))saveDraftSoon();}));
document.addEventListener('click',e=>{if(e.target&&e.target.closest&&e.target.closest('#screen-add .cat-picker,#catSheet'))saveDraftSoon();});
layoutAdd();
try{renderBudgetBar();}catch(e){}
})();
