/* Sổ Thu Chi – Tin ngân hàng: dán tin → khoản quen tự ghi, khoản lạ vào "Chờ xác nhận" (chạm 1 nút chọn hạng mục, máy nhớ).
   Dùng bộ đọc tin có sẵn (sms.js · SmsParse). Mọi xử lý chạy trên máy, không gửi nội dung tin đi đâu.
   Dữ liệu: bankDB = { merch: {khoá nơi chi → hạng mục}, wal: {ngân hàng → ví}, pend: [khoản chờ], auto: bật/tắt tự ghi }.
   Cách đưa tin vào: nút "📋 Dán tin ngân hàng" ở Tổng quan, mục Dán SMS, hoặc mở link ...?sms=<nội dung> (Phím tắt iPhone / MacroDroid). */
(function(){
if(typeof document==='undefined'||typeof SmsParse==='undefined'||typeof bankDB==='undefined')return;
const $=id=>document.getElementById(id);
const E=s=>escH(s);
const nzl=s=>String(s==null?'':s).toLowerCase().split('').map(ch=>{if(ch==='đ')return 'd';const b=ch.normalize('NFD')[0];return b&&b.length===1?b:ch;}).join('');
const classicImport=window.openSmsImport;
let sugCache={},shownAuto=[],lastNote='';

/* ---------- nhận diện nơi chi ---------- */
function skey(raw){let h=5381;const t=stripVN(raw).replace(/\s+/g,' ');for(let i=0;i<t.length;i++)h=((h<<5)+h+t.charCodeAt(i))|0;return 'h'+(h>>>0).toString(36);}
function merchantOf(r){
  const raw=r.raw,n=nzl(raw);let s='';
  const pats=[/\btai\s+(?!khoan\b|ngan hang\b|atm\b)/,/(?:\bnd\b|noi dung|content|remark|merchant)\s*[:.]?\s*/];
  for(const p of pats){const mm=n.match(p);if(mm){s=raw.slice(mm.index+mm[0].length);const cut=nzl(s).search(/\s(?:luc|vao luc|vao|ngay|hmkd|so du|sd|balance|ref|ma gd|tai khoan|tk)\b|\.\s+[a-z]|\.\s*$|;|\bsd\s*[:.]/);if(cut>1)s=s.slice(0,cut);break;}}
  if(!s.trim())s=r.note||'';
  s=s.replace(/^\s*(?:gd\s+the\s+tai|gd\s+the|gd|thanh\s+toan\s+tai|thanh\s+toan|tt|the|tai)\s+/i,'').replace(/^\s*(?:gd\s+the|gd|thanh\s+toan|tt)\s+/i,'');
  s=s.replace(/\*+/g,' ').replace(/\s+/g,' ').replace(/[\s.,;:\-]+$/,'').trim();
  if(s&&s===s.toUpperCase())s=s.replace(/\S+/g,w=>w.length>1?w[0]+w.slice(1).toLowerCase():w);
  return s.slice(0,60);
}
const STOP=['the','tai','gd','tt','ck','chuyen','khoan','thanh','toan','qr','pos'];
function keyOf(name){return nzl(name).replace(/[^a-z0-9]+/g,' ').split(' ').filter(t=>t.length>1&&!/\d{4,}/.test(t)&&!STOP.includes(t)).slice(0,3).join(' ');}
function bankKey(bank){return bank||'khac';}
/* che số tài khoản / số thẻ / số dư trước khi lưu nội dung tin trên máy (mã chống trùng tính từ bản gốc, không lưu) */
function maskRaw(s){
  return String(s||'').replace(/\b\d{8,}\b/g,m=>'••••'+m.slice(-4)).replace(/((?:so du|số dư|\bsd\b|balance)\s*[:.]?\s*)[+\-]?\d[\d.,]*(\s*(?:vnd|vnđ|đ|d)\b)?/gi,'$1••••');
}
function walletFor(bank){
  const sp=getSpendableWallets();const m=bankDB.wal[bankKey(bank)];
  if(m&&sp.some(w=>String(w.id)===String(m)))return m;
  if(bank){const k=SmsParse.BANKS.find(b=>b[1]===bank);const key=k?k[0]:'';const w=sp.find(w=>stripVN(w.name).replace(/\s/g,'').includes(key)||(w.bankName&&stripVN(String(w.bankName)).replace(/\s/g,'').includes(key)));if(w)return w.id;}
  const b=sp.find(w=>w.type==='bank');return (b||sp[0]||{}).id||null;
}
function dateLabel(p){const t=todayStr();const d=p.date===t?'hôm nay':p.date===addDays(t,-1)?'hôm qua':dmy(p.date).slice(0,5);return d+(p.time?' · '+p.time:'');}

/* ---------- gợi ý hạng mục ---------- */
function topCats(type){
  const from=addDays(todayStr(),-90),m={};
  txs.forEach(t=>{if(t.type!==type||t.debtId||t.loanId||t.split||t.advOf||t.noCF||(t.date||'')<from)return;const k=t.group+'|||'+t.item;m[k]=(m[k]||0)+1;});
  return Object.entries(m).sort((a,b)=>b[1]-a[1]).map(x=>x[0].split('|||'));
}
function sugs(p){
  const out=[];const add=(g,it)=>{if(g&&it&&catValid(p.type,g,it)&&!out.some(x=>x.g===g&&x.item===it))out.push({g,item:it});};
  const name=p.name||'';
  try{const q=qeParse(name);if(q&&q.type===p.type)add(q.group,q.item);}catch(e){}
  try{if(window.suggestCat){const s=suggestCat(name,p.type);if(s)add(s.g,s.it);}}catch(e){}
  topCats(p.type).forEach(([g,i])=>add(g,i));
  if(!out.length)add('Khác',p.type==='thu'?'Khác':'Khác');
  return out.slice(0,3);
}

/* ---------- ghi giao dịch + nhớ ---------- */
function record(p,g,item,o){
  o=o||{};const G=(GROUPS[p.type]||[]).find(x=>x.name===g);if(!G)return null;
  const wl=getSpendableWallets();const wid=wl.some(w=>String(w.id)===String(p.walletId))?p.walletId:walletFor(p.bank);
  const tx={id:Date.now()+Math.random(),type:p.type,amount:p.amount,group:G.name,item,icon:'e:'+(item===G.name&&!G.single?G.emoji:itemEmoji(p.type,G.name,item)),accent:G.accent,bg:item===G.name?G.bg:itemTint(p.type,G.name,item),
    walletId:wid||null,person:'',note:p.name||'Giao dịch ngân hàng',receipt:null,date:p.date,time:p.time||nowTime(),smsKey:p.smsKey||skey(p.raw)};
  if(o.nocf)tx.noCF=true;if(o.auto)tx.bankAuto=true;
  txs.unshift(tx);applyTxBalance(tx);try{awardBaseLinhThach(tx);}catch(e){}return tx;
}
function learn(p,g,item,nocf){
  if(!p.key)return;const old=bankDB.merch[p.key];
  bankDB.merch[p.key]={t:p.type,g,i:item,nocf:!!nocf,name:p.name||old&&old.name||p.key,n:(old&&old.t===p.type&&old.g===g&&old.i===item?old.n||0:0)+1,last:Date.now()};
}
function newId(){return 'b'+Date.now().toString(36)+Math.random().toString(36).slice(2,6);}
function dupState(p){
  if(txs.some(t=>t.smsKey&&t.smsKey===p.smsKey)||bankDB.pend.some(x=>x.smsKey===p.smsKey))return 'hard';
  if(txs.some(t=>t.type===p.type&&t.amount===p.amount&&t.date===p.date))return 'maybe';
  return '';
}
function refresh(){try{renderHome();}catch(e){}try{if(currentScreen()==='history')renderHistory();}catch(e){}try{renderBar();}catch(e){}}

/* ---------- nhận tin ---------- */
window.bankIngest=function(text){
  if(!getSpendableWallets().length){alert('Hãy tạo ví trước (Ví tiền → Thêm ví) rồi dán lại tin ngân hàng nhé.');return null;}
  const all=SmsParse.parseBankSms(String(text||''));
  const rows=all.filter(r=>r.ok&&!r.otp);
  const rep={auto:[],pend:0,skip:all.length-rows.length,dup:0};
  rows.forEach(r=>{
    const name=merchantOf(r),p={id:newId(),raw:maskRaw(r.raw),type:r.type,amount:r.amount,date:r.date,time:r.time||'',bank:r.bank||'',name,key:keyOf(name),smsKey:skey(r.raw),uncertain:!!r.uncertain};
    p.walletId=walletFor(p.bank);
    const d=dupState(p);if(d==='hard'){rep.dup++;return;}
    const known=p.key&&bankDB.merch[p.key];
    if(known&&bankDB.auto&&!d&&!p.uncertain&&known.t===p.type&&catValid(p.type,known.g,known.i)){
      const tx=record(p,known.g,known.i,{auto:true,nocf:known.nocf});
      if(tx){known.n=(known.n||0)+1;known.last=Date.now();rep.auto.push({txId:tx.id,p,label:known.i});return;}
    }
    if(d==='maybe')p.maybeDup=true;
    bankDB.pend.unshift(p);rep.pend++;
  });
  if(bankDB.pend.length>100)bankDB.pend.length=100;
  saveAll();refresh();
  const parts=[];if(rep.auto.length)parts.push('tự ghi '+rep.auto.length+' khoản quen');if(rep.pend)parts.push(rep.pend+' khoản chờ xác nhận');
  if(rep.dup)parts.push('bỏ '+rep.dup+' tin đã nhập');if(rep.skip)parts.push(rep.skip+' tin không phải giao dịch (OTP…)');
  lastNote=parts.length?'Đã nhận: '+parts.join(' · ')+'.':'Không có giao dịch nào trong nội dung đã dán.';
  shownAuto=rep.auto;
  if(rep.pend||rep.auto.length)openBankInbox();else showMiniToast(lastNote,true);
  return rep;
};

/* ---------- hộp "Chờ xác nhận" ---------- */
function otherOpts(type){return '<option value="">Hạng mục khác…</option>'+(GROUPS[type]||[]).map(G=>'<optgroup label="'+E(G.name)+'">'+visibleItems(type,G).map(it=>'<option value="'+E(G.name+'|||'+it)+'">'+E(itemEmoji(type,G.name,it)+' '+it)+'</option>').join('')+'</optgroup>').join('');}
function cardHtml(p){
  const sg=sugs(p);sugCache[p.id]=sg;const wl=getSpendableWallets();
  const chips=sg.map((s,i)=>'<button type="button" class="bk-chip'+(i===0?' star':'')+'" onclick="bankPick(\''+p.id+'\','+i+')">'+(i===0?'★ ':'')+E(itemEmoji(p.type,s.g,s.item))+' '+E(s.item)+'</button>').join('');
  return '<div class="bk-card'+(p.maybeDup?' dup':'')+'" id="bk_'+p.id+'"><div class="bk-top"><span class="bk-tag">'+E((p.bank||'Ngân hàng')+' · '+dateLabel(p))+'</span><b class="bk-amt '+p.type+'">'+(p.type==='thu'?'+':'−')+fmtShort(p.amount)+' đ</b></div>'+
    '<div class="bk-name">'+E(p.name||'Giao dịch ngân hàng')+'</div>'+
    (p.maybeDup?'<div class="bk-warn">⚠️ Đã có khoản cùng số tiền và ngày. Kiểm tra trước khi ghi.</div>':'')+(p.uncertain?'<div class="bk-warn">ℹ️ Máy chưa chắc đây là khoản '+(p.type==='thu'?'thu':'chi')+'. Bấm "⇄" nếu sai.</div>':'')+
    '<div class="bk-sub"><label>Ví <select onchange="bankWallet(\''+p.id+'\',this.value)">'+wl.map(w=>'<option value="'+w.id+'"'+(String(w.id)===String(p.walletId)?' selected':'')+'>'+E(w.name)+'</option>').join('')+'</select></label><button type="button" class="bk-link" onclick="bankType(\''+p.id+'\')">'+(p.type==='thu'?'Thu':'Chi')+' ⇄</button></div>'+
    '<details class="bk-raw"><summary>Thông báo gốc</summary><div>'+E(p.raw)+'</div></details>'+
    '<div class="bk-chips">'+chips+'<select class="bk-chip other" onchange="bankOther(\''+p.id+'\',this.value)">'+otherOpts(p.type)+'</select>'+
    '<button type="button" class="bk-chip ghost" onclick="bankNoCount(\''+p.id+'\')">🚫 Không tính thu chi</button><button type="button" class="bk-chip ghost" onclick="bankSkip(\''+p.id+'\')">Bỏ qua</button></div></div>';
}
window.openBankInbox=function(){
  const body=$('appModalBody'),top=body?body.scrollTop:0,n=bankDB.pend.length;sugCache={};
  const auto=shownAuto.filter(a=>txs.some(t=>t.id===a.txId));
  openModal('<div class="bk-box"><div class="bk-head"><h3>📩 Chờ xác nhận ('+n+')</h3>'+(n?'<button type="button" class="bk-approve" onclick="bankApprove()">Duyệt gợi ý</button>':'')+'</div>'+
    (lastNote?'<div class="bk-sum">'+E(lastNote)+'</div>':'')+
    (auto.length?'<div class="bk-sec">Đã tự ghi (khoản quen)</div>'+auto.map(a=>'<div class="bk-auto"><span><b>'+E(a.p.name||'Giao dịch')+'</b> · '+(a.p.type==='thu'?'+':'−')+fmtShort(a.p.amount)+' đ → '+E(a.label)+'</span><button type="button" onclick="bankUndoAuto(\''+a.p.id+'\')">Sai? Hoàn tác</button></div>').join(''):'')+
    (n?'<div class="bk-hint">Khoản máy chưa chắc mới nằm đây. Chạm một nút là xong; lần sau cùng nơi chi máy ghi thẳng.</div>'+bankDB.pend.map(cardHtml).join(''):'<div class="empty empty-rich"><div class="er-ic">✅</div><div class="er-t">Không còn khoản nào chờ</div><div class="er-d">Tin ngân hàng mới dán vào sẽ hiện ở đây nếu là nơi chi lạ.</div></div>')+
    '<div class="bk-foot"><button type="button" class="save-btn ghost-btn" onclick="openSmsImport()">📋 Dán thêm</button><button type="button" class="save-btn" onclick="closeAppModal()">Xong</button></div></div>');
  const b2=$('appModalBody');if(b2&&top)b2.scrollTop=top;
};
const find=id=>bankDB.pend.find(p=>p.id===id);
const drop=id=>{bankDB.pend=bankDB.pend.filter(p=>p.id!==id);};
function commit(p,g,item,nocf,quiet){
  if(!getSpendableWallets().length){alert('Hãy tạo ví trước (Ví tiền → Thêm ví).');return false;}
  const tx=record(p,g,item,{nocf});if(!tx){showMiniToast('Không ghi được khoản này',true);return false;}
  learn(p,g,item,nocf);drop(p.id);
  if(!quiet){saveAll();refresh();showMiniToast('✓ Đã ghi'+(p.key?' · lần sau tự ghi «'+(p.name||'').slice(0,24)+'»':''));if($('appModal')&&$('appModal').classList.contains('show'))openBankInbox();}
  return true;
}
window.bankPick=function(id,i){const p=find(id),s=(sugCache[id]||[])[i];if(p&&s)commit(p,s.g,s.item,false);};
window.bankOther=function(id,v){const p=find(id);if(!p||!v)return;const [g,it]=v.split('|||');if(g&&it)commit(p,g,it,false);};
window.bankNoCount=function(id){const p=find(id);if(p)commit(p,'Khác','Khác',true);};
window.bankSkip=function(id){drop(id);saveAll();refresh();openBankInbox();};
window.bankType=function(id){const p=find(id);if(!p)return;p.type=p.type==='thu'?'chi':'thu';p.uncertain=false;saveAll();openBankInbox();};
window.bankWallet=function(id,w){const p=find(id);if(!p)return;p.walletId=w;bankDB.wal[bankKey(p.bank)]=w;saveAll();};
window.bankApprove=function(){
  let n=0;bankDB.pend.slice().forEach(p=>{if(p.maybeDup)return;const s=sugs(p)[0];if(s&&commit(p,s.g,s.item,false,true))n++;});
  saveAll();refresh();showMiniToast(n?'✓ Đã ghi '+n+' khoản theo gợi ý':'Không có khoản nào để duyệt tự động',!n);openBankInbox();
};
window.bankUndoAuto=function(pid){
  const a=shownAuto.find(x=>x.p.id===pid);if(!a)return;const t=txs.find(x=>x.id===a.txId);
  if(t){reverseTxBalance(t);try{revokeTxLinhLuc(t,false);}catch(e){}txs=txs.filter(x=>x!==t);}
  if(a.p.key)delete bankDB.merch[a.p.key];
  const p=Object.assign({},a.p,{maybeDup:false});bankDB.pend.unshift(p);shownAuto=shownAuto.filter(x=>x!==a);
  saveAll();refresh();showMiniToast('Đã hoàn tác. Lần sau máy sẽ hỏi lại nơi chi này.');openBankInbox();
};

/* ---------- dán tin ---------- */
const looksBank=t=>/\d{3}/.test(t)&&/vnd|tk|so du|sd|otp|gd|d\b/i.test(stripVN(t));
window.bankPasteClip=async function(){
  let t='';try{t=await navigator.clipboard.readText();}catch(e){}
  if(t&&looksBank(t))return window.bankIngest(t);
  window.openSmsImport();showMiniToast(t?'Bộ nhớ tạm chưa có tin ngân hàng':'Hãy dán tin vào ô bên dưới',true);
};
window.openSmsImport=function(preset){
  openModal('<div class="sms-box"><h3 style="margin:0 0 6px">📩 Tin ngân hàng</h3><div class="sms-sub">Dán 1 hoặc nhiều tin báo biến động số dư. Nơi chi quen thì <b>tự ghi</b>, nơi chi lạ chờ bạn chạm 1 nút chọn hạng mục. Mã OTP không được lưu.</div>'+
    '<textarea id="bkText" rows="6" placeholder="VD: VCB: TK 0071xxxx1234 -128,000 VND luc 11/11/2026 10:18. ND: GD THE TAI PHUC LONG"></textarea>'+
    '<div class="sms-acts"><button type="button" class="save-btn" onclick="bankGo()">Ghi nhanh</button><button type="button" class="save-btn ghost-btn" onclick="bankClassic()">Xem trước kỹ</button></div>'+
    (bankDB.pend.length?'<button type="button" class="hq-toggle" onclick="openBankInbox()">Chờ xác nhận ('+bankDB.pend.length+') ›</button>':'')+
    '<button type="button" class="hq-toggle" onclick="openBankSettings()">⚙ Cài đặt tin ngân hàng</button></div>');
  const ta=$('bkText');if(!ta)return;
  if(typeof preset==='string')ta.value=preset;
  else{try{if(navigator.clipboard&&navigator.clipboard.readText)navigator.clipboard.readText().then(t=>{if(t&&looksBank(t)&&!ta.value)ta.value=t;}).catch(()=>{});}catch(x){}}
};
window.bankGo=function(){const t=($('bkText')||{}).value||'';if(!t.trim()){showMiniToast('Hãy dán tin nhắn vào ô phía trên',true);return;}closeAppModal();window.bankIngest(t);};
window.bankClassic=function(){const t=($('bkText')||{}).value||'';closeAppModal();if(classicImport)classicImport(t||undefined);};

/* ---------- cài đặt ---------- */
window.openBankSettings=function(){
  const rows=Object.entries(bankDB.merch).sort((a,b)=>(b[1].last||0)-(a[1].last||0));
  const site=location.origin+location.pathname;
  openModal('<div class="bk-box"><h3 style="margin:0 0 8px">📩 Tin ngân hàng</h3>'+
    '<div class="bk-set"><div><b>Tự ghi khoản quen</b><small>Nơi chi đã chọn hạng mục một lần thì lần sau ghi thẳng, không hỏi lại.</small></div><div class="switch'+(bankDB.auto?' on':'')+'" onclick="bankToggleAuto()" role="switch" aria-checked="'+(bankDB.auto?'true':'false')+'"><span></span></div></div>'+
    '<div class="bk-sec">Nơi chi đã nhớ ('+rows.length+')</div>'+
    (rows.length?rows.map(([k,m])=>'<div class="bk-mem"><span><b>'+E(m.name||k)+'</b><small>→ '+(m.nocf?'Không tính thu chi':E(m.i||''))+' · '+(m.n||1)+' lần</small></span><button type="button" data-k="'+encodeURIComponent(k)+'" onclick="bankForget(this.dataset.k)" aria-label="Quên">✕</button></div>').join('')+'<button type="button" class="hq-toggle" onclick="bankForgetAll()">Xoá tất cả nơi chi đã nhớ</button>':'<div class="bk-hint">Chưa nhớ nơi chi nào. Khi bạn chọn hạng mục cho một khoản ở "Chờ xác nhận", nơi chi đó sẽ hiện ở đây.</div>')+
    '<div class="bk-sec">Đưa tin vào app nhanh hơn</div>'+
    '<div class="bk-tip"><b>iPhone</b> (Phím tắt): Tự động hoá → Tin nhắn → chọn người gửi hoặc nội dung chứa "VND" → <i>Chạy ngay</i> → thêm "Sao chép vào bộ nhớ tạm" với <i>Nội dung tin nhắn</i>. Khi mở Sổ Thu Chi, bấm <b>📋 Dán tin ngân hàng</b>. (iPhone chỉ đọc được SMS, không đọc được thông báo trong app ngân hàng.)</div>'+
    '<div class="bk-tip"><b>Android</b> (MacroDroid / Tasker): khi có thông báo từ app ngân hàng → mở link <code>'+E(site)+'?sms=</code> kèm nội dung thông báo. App tự nhận tin ngay khi mở.</div>'+
    '<div class="bk-foot"><button type="button" class="save-btn" onclick="closeAppModal()">Xong</button></div></div>');
};
window.bankToggleAuto=function(){bankDB.auto=!bankDB.auto;saveAll();openBankSettings();};
window.bankForget=function(k){delete bankDB.merch[decodeURIComponent(k)];saveAll();openBankSettings();};
window.bankForgetAll=function(){if(!confirm('Xoá tất cả nơi chi đã nhớ? Lần sau máy sẽ hỏi lại từng nơi.'))return;bankDB.merch={};saveAll();openBankSettings();};

/* ---------- thanh ở Tổng quan + menu ---------- */
function renderBar(){
  let el=$('bankBar');
  if(!el){const ref=$('debtCard');if(!ref)return;el=document.createElement('div');el.id='bankBar';el.className='bank-bar';ref.parentNode.insertBefore(el,ref.nextSibling);}
  const n=bankDB.pend.length;
  el.innerHTML='<button type="button" class="bb-paste" onclick="bankPasteClip()">📋 Dán tin ngân hàng</button>'+(n?'<button type="button" class="bb-pend" onclick="openBankInbox()">Chờ xác nhận <b>'+n+'</b> ›</button>':'');
  const m=$('more-bank');if(m)m.innerHTML='<span>'+icon('bank','#c29a5c',20)+'</span><span>Tin ngân hàng & nơi chi đã nhớ<small class="more-sub">'+(n?n+' khoản chờ xác nhận':'Đã nhớ '+Object.keys(bankDB.merch).length+' nơi chi')+'</small></span>';
}
const _rh=window.renderHome;
window.renderHome=function(){const r=_rh.apply(this,arguments);try{renderBar();}catch(e){console.error(e);}return r;};
renderBar();
/* mở link ...?sms=<nội dung> (Phím tắt iPhone / MacroDroid) */
try{const u=new URL(location.href),t=u.searchParams.get('sms');if(t){u.searchParams.delete('sms');history.replaceState(null,'',u.pathname+(u.search||'')+u.hash);setTimeout(()=>window.bankIngest(t),1200);}}catch(e){}
})();
