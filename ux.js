/* Sổ Thu Chi – v72: trải nghiệm dùng (nhớ ví theo hạng mục, hoàn tác khi xoá, gợi ý ghi chú,
   tìm trong Cài đặt, báo mất mạng, thanh Cho vay/Vay nợ ở màn Thêm giao dịch). */
(function(){
'use strict';
function $(id){return document.getElementById(id);}
function lsGet(k){try{return localStorage.getItem(k);}catch(e){return null;}}
function lsSet(k,v){try{localStorage.setItem(k,v);}catch(e){}}
function strip(s){return String(s||'').normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/đ/g,'d').replace(/Đ/g,'d').toLowerCase();}
function toast(m,w){if(typeof showMiniToast==='function')showMiniToast(m,w);}
function wrap(name,after,before){
  var o=window[name];if(typeof o!=='function')return;
  window[name]=function(){
    if(before){try{before.apply(this,arguments);}catch(e){console.error(e);}}
    var r=o.apply(this,arguments);
    if(after){try{after.apply(this,arguments);}catch(e){console.error(e);}}
    return r;
  };
}

/* ---------- CSS ---------- */
var st=document.createElement('style');
st.textContent=
'.debt-quick{margin:-6px 0 14px;}'+
'.debt-quick button{border:1px dashed rgba(194,154,92,.45);background:transparent;color:var(--text);}'+
'#undoBar{position:fixed;left:50%;bottom:calc(122px + env(safe-area-inset-bottom,0px));transform:translate(-50%,16px);max-width:92vw;min-width:240px;display:flex;align-items:center;justify-content:space-between;gap:14px;background:var(--card);color:var(--text);border:1px solid rgba(194,154,92,.5);border-radius:14px;padding:10px 12px 10px 16px;font-size:13px;font-weight:500;z-index:4100;opacity:0;pointer-events:none;transition:opacity .2s,transform .2s;box-shadow:0 6px 20px rgba(0,0,0,.35);}'+
'#undoBar.show{opacity:1;transform:translate(-50%,0);pointer-events:auto;}'+
'#undoBar button{border:none;background:none;color:var(--blue);font-family:inherit;font-weight:700;font-size:13.5px;padding:6px 4px;}'+
'#moreSearch{width:100%;box-sizing:border-box;padding:11px 14px;border-radius:12px;border:1px solid rgba(194,154,92,.3);background:var(--card);color:var(--text);font-family:inherit;font-size:14.5px;margin:0 0 10px;}'+
'.ux-hide{display:none!important;}'+
'.ux-empty{text-align:center;color:var(--sub);font-size:13px;padding:18px 0;}';
document.head.appendChild(st);

/* ---------- 1) Nhớ ví theo hạng mục ---------- */
var WK='tc_lastwallet',lastKey='';
function wmap(){try{return JSON.parse(lsGet(WK)||'{}')||{};}catch(e){return {};}}
function wkey(){return currentType+'|'+(selectedGroup||'')+'|'+(selectedItem||'');}
function applyRemembered(){
  if(editingTxId||!selectedItem||(currentType!=='chi'&&currentType!=='thu'))return;
  var sel=$('accSelect');if(!sel)return;
  var id=wmap()[wkey()];
  if(id&&Array.prototype.some.call(sel.options,function(o){return o.value===String(id);}))sel.value=String(id);
}
var cp=$('catPicker');
if(cp&&window.MutationObserver){
  new MutationObserver(function(){var k=wkey();if(k!==lastKey){lastKey=k;applyRemembered();}}).observe(cp,{childList:true});
}
wrap('saveTx',null,function(){
  if(editingTxId||(currentType!=='chi'&&currentType!=='thu')||!selectedItem)return;
  var sel=$('accSelect');if(!sel||!sel.value)return;
  var m=wmap();m[wkey()]=sel.value;lsSet(WK,JSON.stringify(m));
});

/* ---------- 2) Hoàn tác khi xoá giao dịch ---------- */
var bar=document.createElement('div');bar.id='undoBar';bar.innerHTML='<span id="undoMsg"></span><button type="button" id="undoBtn">Hoàn tác</button>';
document.body.appendChild(bar);
var undoT=null,undoSnap=null;
function clone(x){try{return typeof structuredClone==='function'?structuredClone(x):JSON.parse(JSON.stringify(x));}catch(e){return JSON.parse(JSON.stringify(x));}}
function hideUndo(){bar.classList.remove('show');undoSnap=null;clearTimeout(undoT);}
function showUndo(msg,snap){
  undoSnap=snap;$('undoMsg').textContent=msg;bar.classList.add('show');
  clearTimeout(undoT);undoT=setTimeout(hideUndo,7000);
}
$('undoBtn').addEventListener('click',function(){
  var s=undoSnap;if(!s)return;
  txs=s.txs.map(function(t){return t.id===s.id?s.target:t;});
  wallets=s.wallets;debts=s.debts;loans=s.loans;rewardProfile=s.rp;rewardHistory=s.rh;userAchievements=s.ua;
  saveAll();
  ['renderHistory','renderHome','renderAccounts','renderDebts','renderLoans','renderReport'].forEach(function(f){
    if(typeof window[f]==='function'){try{window[f]();}catch(e){}}
  });
  hideUndo();toast('✓ Đã khôi phục giao dịch');
});
(function(){
  var o=window.deleteTx;if(typeof o!=='function')return;
  window.deleteTx=function(id){
    var t=txs.find(function(x){return x.id===id;});
    var snap=t?{id:id,target:clone(t),txs:txs.slice(),wallets:clone(wallets),debts:clone(debts),loans:clone(loans),rp:clone(rewardProfile),rh:clone(rewardHistory),ua:clone(userAchievements)}:null;
    var n=txs.length;
    var r=o.apply(this,arguments);
    if(snap&&txs.length<n)showUndo('Đã xoá giao dịch',snap);
    return r;
  };
})();

/* ---------- 3) Gợi ý ghi chú → tự điền hạng mục, số tiền, ví ---------- */
var ni=$('noteInput');
if(ni){
  var dl=document.createElement('datalist');dl.id='noteList';document.body.appendChild(dl);
  ni.setAttribute('list','noteList');
  var noteIdx={};
  function buildNotes(){
    var cnt={};
    (txs||[]).slice(0,800).forEach(function(t){
      if(t.type!=='chi'&&t.type!=='thu')return;
      var n=(t.note||'').trim();if(!n||n.length>40)return;
      var k=t.type+'|'+strip(n);
      var e=cnt[k]||(cnt[k]={n:n,c:0,t:t});e.c++;
    });
    noteIdx=cnt;
    var arr=Object.keys(cnt).map(function(k){return cnt[k];})
      .filter(function(e){return e.t.type===currentType;})
      .sort(function(a,b){return b.c-a.c;}).slice(0,40);
    dl.innerHTML=arr.map(function(e){return '<option value="'+e.n.replace(/"/g,'&quot;')+'"></option>';}).join('');
  }
  ni.addEventListener('focus',buildNotes);
  ni.addEventListener('change',function(){
    if(editingTxId||(currentType!=='chi'&&currentType!=='thu'))return;
    var e=noteIdx[currentType+'|'+strip(ni.value.trim())];if(!e)return;
    var t=e.t,ai=$('amountInput');
    if(ai&&!(parseInt((ai.value||'').replace(/\D/g,''))||0)&&t.amount){ai.value=typeof fmtShort==='function'?fmtShort(t.amount):String(t.amount);}
    if(!selectedItem&&t.group&&t.item&&typeof pickCat==='function'){
      pickCat(t.group,t.item);
      setTimeout(function(){
        var sel=$('accSelect');
        if(t.walletId&&sel&&Array.prototype.some.call(sel.options,function(o){return o.value===String(t.walletId);}))sel.value=String(t.walletId);
      },0);
    }
  });
}

/* ---------- 4) Tìm trong Cài đặt ---------- */
(function(){
  var inner=document.querySelector('#screen-more .inner');if(!inner||$('moreSearch'))return;
  var head=inner.querySelector('.more-head');
  var inp=document.createElement('input');inp.id='moreSearch';inp.type='search';inp.placeholder='Tìm trong Cài đặt…';inp.setAttribute('aria-label','Tìm trong Cài đặt');inp.autocomplete='off';
  var empty=document.createElement('div');empty.className='ux-empty ux-hide';empty.id='moreSearchEmpty';empty.textContent='Không tìm thấy mục nào.';
  if(head&&head.nextSibling)inner.insertBefore(inp,head.nextSibling);else inner.insertBefore(inp,inner.firstChild);
  inner.appendChild(empty);
  function items(){return Array.prototype.filter.call(inner.children,function(e){return e!==head&&e!==inp&&e!==empty&&e.id!=='moreSort'&&(e.classList.contains('more-item')||e.classList.contains('mode-card')||e.classList.contains('more-group'));});}
  inp.addEventListener('input',function(){
    var q=strip(inp.value.trim()),shown=0;
    items().forEach(function(e){
      var ok=!q||strip(e.textContent).indexOf(q)>=0;
      e.classList.toggle('ux-hide',!ok);
      if(ok&&q&&e.classList.contains('more-group'))e.classList.add('open');
      if(ok)shown++;
    });
    empty.classList.toggle('ux-hide',!(q&&shown===0));
  });
})();

/* ---------- 5) Báo mất mạng / có mạng ---------- */
window.addEventListener('offline',function(){toast('📴 Mất mạng – dữ liệu vẫn lưu trên máy, sẽ đồng bộ khi có mạng',true);});
window.addEventListener('online',function(){toast('✓ Đã có mạng trở lại');});
window.addEventListener('cloud-sync-error',function(e){
  if(e&&e.detail&&e.detail.offline)toast('☁️ Chưa đồng bộ được (mất mạng) – dữ liệu vẫn an toàn trên máy',true);
});
})();
