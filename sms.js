/* Sổ Thu Chi – Dán SMS / tin nhắn OTP ngân hàng → giao dịch
   - Dán 1 hoặc nhiều tin nhắn, app tự nhận: chi/thu, số tiền, ngày giờ, nội dung, ngân hàng.
   - Hiện bản xem trước để bạn tick chọn rồi mới lưu. Mã OTP KHÔNG bao giờ được lưu.
   - Chạy hoàn toàn trong máy, không gửi nội dung tin nhắn đi đâu cả. */
(function(root){
  const nz=s=>String(s==null?'':s).toLowerCase().split('').map(ch=>{if(ch==='đ')return 'd';const b=ch.normalize('NFD')[0];return b&&b.length===1?b:ch;}).join(''); /* giữ nguyên độ dài chuỗi */
  const pad=n=>String(n).padStart(2,'0');
  const BANKS=[['vietcombank','Vietcombank',/vietcombank|vcb/],['techcombank','Techcombank',/techcombank|tcb/],['mbbank','MB Bank',/\bmb\b|mbbank|mb bank/],['bidv','BIDV',/bidv/],['vietinbank','VietinBank',/vietinbank|icb/],['agribank','Agribank',/agribank/],['acb','ACB',/\bacb\b/],['vpbank','VPBank',/vpbank/],['tpbank','TPBank',/tpbank/],['sacombank','Sacombank',/sacombank|stb/],['ocb','OCB',/\bocb\b/],['hdbank','HDBank',/hdbank/],['shb','SHB',/\bshb\b/],['vib','VIB',/\bvib\b/],['msb','MSB',/\bmsb\b/],['seabank','SeABank',/seabank/],['eximbank','Eximbank',/eximbank/],['momo','MoMo',/momo/],['zalopay','ZaloPay',/zalopay/],['viettelmoney','Viettel Money',/viettel money|viettelpay/]];
  const PREFIX=/^\s*(vietcombank|vcb|techcombank|tcb|mbbank|mb bank|mb|bidv|vietinbank|agribank|acb|vpbank|tpbank|sacombank|ocb|hdbank|shb|vib|msb|seabank|eximbank|momo|zalopay|viettel money)\b\s*[:\-\]]/i;

  /* tách nhiều tin nhắn: cách nhau dòng trống, hoặc mỗi tin bắt đầu bằng tên ngân hàng */
  function splitSms(text){
    let t=String(text||'').replace(/\r/g,'').trim();if(!t)return [];
    let parts=t.split(/\n\s*\n+/);
    const out=[];
    parts.forEach(p=>{
      const lines=p.split('\n');let cur=[];
      lines.forEach(l=>{if(cur.length&&PREFIX.test(l)){out.push(cur.join(' '));cur=[];}cur.push(l.trim());});
      if(cur.length)out.push(cur.join(' '));
    });
    return out.map(s=>s.replace(/\s+/g,' ').trim()).filter(Boolean);
  }
  function toAmount(tok){
    tok=String(tok).trim();
    if(/^\d{1,3}([.,]\d{3})+([.,]\d{1,2})?$/.test(tok))return parseInt(tok.replace(/([.,]\d{1,2})$/,m=>/^[.,]\d{3}$/.test(m)?m:'').replace(/[.,]/g,''),10);
    if(/^\d+$/.test(tok))return parseInt(tok,10);
    return 0;
  }
  function blank(s,a,b){return s.slice(0,a)+' '.repeat(b-a)+s.slice(b);}

  function parseOne(raw,opts){
    opts=opts||{};
    const text=raw.trim();const n=nz(text);let w=n;
    const res={raw:text,ok:false,otp:false,type:null,amount:0,date:null,time:null,note:'',bank:'',balance:null,uncertain:false,reason:''};
    for(const b of BANKS){if(b[2].test(n)){res.bank=b[1];break;}}
    res.otp=/\botp\b|ma xac thuc|ma xac nhan|mat khau dung 1 lan|mat khau dung mot lan|smart ?otp/.test(n);
    /* ngày giờ */
    const today=opts.today||(function(){const d=new Date();return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate());})();
    let m=w.match(/\b(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{4}|\d{2})\b/),dstr=null;
    if(m){let yy=+m[3];if(yy<100)yy+=2000;dstr=yy+'-'+pad(+m[2])+'-'+pad(+m[1]);w=blank(w,m.index,m.index+m[0].length);}
    else if((m=w.match(/\b(\d{4})-(\d{1,2})-(\d{1,2})\b/))){dstr=m[1]+'-'+pad(+m[2])+'-'+pad(+m[3]);w=blank(w,m.index,m.index+m[0].length);}
    else if((m=w.match(/\b(\d{1,2})\/(\d{1,2})\b(?!\d)/))&&+m[1]<=31&&+m[2]<=12){dstr=today.slice(0,4)+'-'+pad(+m[2])+'-'+pad(+m[1]);w=blank(w,m.index,m.index+m[0].length);}
    if(dstr){const chk=new Date(dstr+'T00:00:00');if(isNaN(chk)||chk.getDate()!==+dstr.slice(8))dstr=null;}
    m=w.match(/\b(\d{1,2}):(\d{2})(?::\d{2})?\b/);
    if(m&&+m[1]<24&&+m[2]<60){res.time=pad(+m[1])+':'+m[2];w=blank(w,m.index,m.index+m[0].length);}
    res.date=dstr||today;res.dateFound=!!dstr;
    /* các con số */
    const re=/\d[\d.,]*\d|\d/g;const nums=[];let x;
    while((x=re.exec(w))){
      const tok=x[0];const amt=toAmount(tok);if(!amt)continue;
      const before=w.slice(Math.max(0,x.index-18),x.index),after=w.slice(x.index+tok.length,x.index+tok.length+8);
      const prev=w.slice(Math.max(0,x.index-1),x.index);
      const hasCur=/^\s*(vnd|vnđ|d\b|dong)/.test(after);
      const sign=/(^|[\s:(])[+\-]\s*$/.test(before)?before.trim().slice(-1):'';
      const isBal=/(so du|sodu|\bsd\b|balance|con lai|kha dung)[^\d]{0,10}$/.test(before)||/\b(sd|so du)\s*[:.]?\s*$/.test(before);
      const isAcc=/(tk|stk|so tk|tai khoan|the|account|a\/c|\*|x{2,})\s*[:.]?\s*(so\s*)?$/.test(before)&&!hasCur&&!sign;
      const isOtpCode=/otp[^\d]{0,25}$/.test(before)&&!hasCur&&/^\d{4,8}$/.test(tok);
      const isPhone=/(lh|hotline|sdt|dt|goi|call|tel)\s*[:.]?\s*$/.test(before);
      const isPct=/^\s*%/.test(after);
      const kw=/(so tien|gd|giao dich|thanh toan|giam|tang|tru|cong|nhan|rut|chuyen khoan|chuyen|ck|ps)\s*[:.]?\s*(vnd|vnđ)?\s*$/.test(before);
      const plain=/^\d+$/.test(tok);
      if(isBal){res.balance=amt;continue;}
      if(isAcc||isOtpCode||isPhone||isPct)continue;
      if(plain&&!hasCur&&!sign&&!kw)continue;
      if(plain&&tok.length>9&&!hasCur&&!sign)continue;
      nums.push({amt,sign,idx:x.index,len:tok.length,hasCur,kw});
    }
    if(!nums.length){res.reason=res.otp?'Tin OTP, không có số tiền – chỉ có mã xác thực (mã không được lưu).':'Không tìm thấy số tiền giao dịch.';return res;}
    nums.sort((a,b)=>((b.sign?3:0)+(b.hasCur?2:0)+(b.kw?1:0))-((a.sign?3:0)+(a.hasCur?2:0)+(a.kw?1:0))||a.idx-b.idx);
    const pick=nums[0];res.amount=pick.amt;
    /* chi hay thu */
    let type=null;
    if(pick.sign==='+')type='thu';else if(pick.sign==='-')type='chi';
    if(!type){
      const win=n.slice(Math.max(0,pick.idx-40),pick.idx+pick.len+25);
      const thuRe=/\b(tang|cong|nhan|ghi co|\bcr\b|credit|chuyen den|tien ve|luong|hoan tien|hoan|\+)\b|ghi co|chuyen den|nhan duoc|tien vao/;
      const chiRe=/giam|tru tien|ghi no|\bdr\b|debit|thanh toan|\brut\b|rut tien|chuyen khoan di|chuyen di|da chuyen|chuyen tien|mua|\bphi\b|phi giao dich|tru tai khoan|payment|\bpos\b|tai\s+\S/;
      const t1=thuRe.test(win),c1=chiRe.test(win);
      if(t1&&!c1)type='thu';else if(c1&&!t1)type='chi';
      else if(t1&&c1){const ti=win.search(thuRe),ci=win.search(chiRe);type=ti<=ci?'thu':'chi';}
    }
    if(!type){type=res.otp?'chi':(/\+/.test(n)?'thu':'chi');res.uncertain=true;}
    res.type=type;
    /* nội dung */
    const orig=text;let note='';
    let nm=n.match(/(?:\bnd\b|noi dung|content|loi nhan|remark|\bref\b)\s*[:.]?\s*/);
    if(nm){note=orig.slice(nm.index+nm[0].length);const cut=nz(note).search(/\b(so du|sd:|sd\s|balance|vnd\s*$)/);if(cut>3)note=note.slice(0,cut);}
    else if((nm=n.match(/\b(?:tai|merchant|shop|cua hang|den|toi)\s+([a-z0-9][^.;]*)/))){note=orig.slice(nm.index,nm.index+nm[0].length);const cut=nz(note).search(/(\.|;|,\s*so du|\bso du\b|\bsd\b|\bvoi\b|\bma otp\b|\botp\b|\bkhong\b|\bvui long\b)/);if(cut>3)note=note.slice(0,cut);}
    note=note.replace(/\botp\b[^a-z]*\d{4,8}/gi,'').replace(/\d{4,8}\s*(?=\bla\s+ma\b)/gi,'').replace(/[\s.,;:\-]+$/,'').replace(/^[\s.,;:\-]+/,'').replace(/\s+/g,' ').trim();
    note=note.replace(/^(tai|merchant|shop|cua hang)\s+/i,'');
    if(note.length>80)note=note.slice(0,80).trim();
    res.note=note;
    if(res.otp){res.uncertain=true;res.reason='Tin OTP – chưa chắc giao dịch đã thành công, nên chỉ lưu khi bạn chắc chắn.';}
    res.ok=true;return res;
  }
  function parseBankSms(text,opts){return splitSms(text).map(s=>parseOne(s,opts));}
  const API={parseBankSms,parseOne,splitSms,BANKS};
  if(typeof module!=='undefined'&&module.exports)module.exports=API;
  root.SmsParse=API;
})(typeof window!=='undefined'?window:globalThis);

/* =====================  GIAO DIỆN (chỉ chạy trong trình duyệt)  ===================== */
(function(){
  if(typeof document==='undefined'||typeof txs==='undefined')return;
  let smsRows=[];
  const e=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const itemOpts=(type,sel)=>(GROUPS[type]||[]).map(G=>visibleItems(type,G).map(it=>{const v=G.name+'|'+it;return '<option value="'+e(v)+'"'+(v===sel?' selected':'')+'>'+e(G.name===it?it:G.name+' › '+it)+'</option>';}).join('')).join('');
  function guessCat(type,r){
    let g=null,it=null;
    try{const q=qeParse((r.note||'')+' '+r.raw.replace(/\d[\d.,:\/]*/g,' ').slice(0,200));if(q&&q.type===type&&q.group&&q.item&&catValid(type,q.group,q.item)){g=q.group;it=q.item;}}catch(x){}
    if(!g){const arr=GROUPS[type]||[];const G=arr.find(x=>x.name==='Khác')||arr[arr.length-1];if(G){g=G.name;it=G.items.includes('Khác')?'Khác':G.items[0];}}
    return g+'|'+it;
  }
  function pickWallet(bank){
    const sp=getSpendableWallets();
    if(bank){const k=SmsParse.BANKS.find(b=>b[1]===bank);const key=k?k[0]:'';const w=sp.find(w=>stripVN(w.name).replace(/\s/g,'').includes(key)||(w.bank&&stripVN(String(w.bank)).includes(key)));if(w)return w.id;}
    const b=sp.find(w=>w.type==='bank');return (b||sp[0]||{}).id;
  }
  function skey(raw){let h=5381;const t=stripVN(raw).replace(/\s+/g,' ');for(let i=0;i<t.length;i++)h=((h<<5)+h+t.charCodeAt(i))|0;return 'h'+(h>>>0).toString(36);}
  function isDup(r){
    const k=skey(r.raw);
    if(txs.some(t=>t.smsKey&&t.smsKey===k))return 'Tin này đã được nhập trước đó';
    if(txs.some(t=>t.type===r.type&&t.amount===r.amount&&t.date===r.date))return 'Đã có giao dịch cùng số tiền & ngày';
    return '';
  }
  window.openSmsImport=function(preset){
    smsRows=[];
    const wopts=getSpendableWallets().map(w=>'<option value="'+w.id+'">'+e(w.name)+'</option>').join('');
    openModal('<div class="sms-box"><h3 style="margin:0 0 6px">📩 Dán SMS ngân hàng</h3>'+
      '<div class="sms-sub">Dán 1 hoặc nhiều tin nhắn biến động số dư (hoặc tin OTP thanh toán). Mã OTP không được lưu.</div>'+
      '<textarea id="smsText" rows="6" placeholder="VD: Vietcombank: TK 0123456789 -85,000 VND 06/10/2026 12:30. ND: Grab. SD: 1,234,000 VND"></textarea>'+
      '<div class="sms-row"><label>Ví ghi nhận</label><select id="smsWallet">'+wopts+'</select></div>'+
      '<div class="sms-acts"><button class="save-btn" onclick="smsAnalyze()">Phân tích</button><button class="save-btn ghost-btn" onclick="closeAppModal()">Đóng</button></div>'+
      '<div id="smsOut"></div></div>');
    const ta=document.getElementById('smsText');
    if(typeof preset==='string')ta.value=preset;
    else{try{if(navigator.clipboard&&navigator.clipboard.readText){navigator.clipboard.readText().then(t=>{if(t&&/\d{3}/.test(t)&&/vnd|tk|so du|sd|otp|gd|d\b/i.test(stripVN(t))&&!ta.value){ta.value=t;}}).catch(()=>{});}}catch(x){}}
  };
  window.smsAnalyze=function(){
    const ta=document.getElementById('smsText');const out=document.getElementById('smsOut');if(!ta||!out)return;
    const rows=SmsParse.parseBankSms(ta.value);
    if(!rows.length){out.innerHTML='<div class="empty">Hãy dán nội dung tin nhắn vào ô phía trên.</div>';return;}
    smsRows=rows.map(r=>{
      if(!r.ok)return r;
      r.cat=guessCat(r.type,r);r.dup=isDup(r);r.checked=!r.dup&&!r.uncertain;
      r.walletAuto=pickWallet(r.bank);return r;
    });
    const wsel=document.getElementById('smsWallet');
    const first=smsRows.find(r=>r.ok&&r.walletAuto);if(first&&wsel)wsel.value=String(first.walletAuto);
    smsRender();
  };
  function smsRender(){
    const out=document.getElementById('smsOut');if(!out)return;
    out.innerHTML=smsRows.map((r,i)=>{
      if(!r.ok)return '<div class="sms-item bad"><div class="sms-t">⚠️ Không nhận ra giao dịch</div><div class="sms-raw">'+e(r.raw.replace(/\b\d{4,8}\b(?=[^\d]*$)/,'••••').slice(0,160))+'</div><div class="sms-w">'+e(r.reason)+'</div></div>';
      return '<div class="sms-item'+(r.checked?'':' off')+'"><label class="sms-hd"><input type="checkbox" '+(r.checked?'checked':'')+' onchange="smsRows_set('+i+',\'checked\',this.checked)"> <span class="sms-amt '+r.type+'">'+(r.type==='thu'?'+':'-')+fmtShort(r.amount)+'</span> <span class="sms-meta">'+e(dmy(r.date))+(r.time?' '+r.time:'')+(r.bank?' · '+e(r.bank):'')+'</span></label>'+
        '<div class="sms-ed"><select onchange="smsRows_set('+i+',\'type\',this.value)"><option value="chi"'+(r.type==='chi'?' selected':'')+'>Chi</option><option value="thu"'+(r.type==='thu'?' selected':'')+'>Thu</option></select>'+
        '<select onchange="smsRows_set('+i+',\'cat\',this.value)">'+itemOpts(r.type,r.cat)+'</select></div>'+
        '<input class="sms-note" value="'+e(r.note)+'" placeholder="Ghi chú" onchange="smsRows_set('+i+',\'note\',this.value)">'+
        (r.dup?'<div class="sms-w">⚠️ '+e(r.dup)+' – mặc định không lưu lại.</div>':'')+(r.uncertain&&r.reason?'<div class="sms-w">ℹ️ '+e(r.reason)+'</div>':(r.uncertain?'<div class="sms-w">ℹ️ Không chắc là chi hay thu – hãy kiểm tra lại.</div>':''))+'</div>';
    }).join('')+(smsRows.some(r=>r.ok)?'<button class="save-btn" onclick="smsSave()">Lưu '+smsRows.filter(r=>r.ok&&r.checked).length+' giao dịch</button>':'');
  }
  window.smsRows_set=function(i,k,v){
    const r=smsRows[i];if(!r)return;
    if(k==='type'){r.type=v;r.cat=guessCat(v,r);}else r[k]=v;
    if(k==='checked'||k==='type')smsRender();
  };
  window.smsSave=function(){
    const wid=document.getElementById('smsWallet').value;const list=smsRows.filter(r=>r.ok&&r.checked);
    if(!list.length){showMiniToast('Chưa chọn giao dịch nào',true);return;}
    let n=0;
    list.slice().reverse().forEach((r,k)=>{
      const [gName,item]=r.cat.split('|');const g=(GROUPS[r.type]||[]).find(x=>x.name===gName);if(!g)return;
      const tx={id:Date.now()+k+Math.random()*0.5,type:r.type,amount:r.amount,group:g.name,item,
        icon:'e:'+(item===g.name&&!g.single?g.emoji:itemEmoji(r.type,g.name,item)),accent:g.accent,bg:item===g.name?g.bg:itemTint(r.type,g.name,item),
        walletId:wid||null,person:'',note:r.note||(r.bank?'SMS '+r.bank:'SMS ngân hàng'),receipt:null,date:r.date,time:r.time||nowTime(),smsKey:skey(r.raw)};
      txs.unshift(tx);applyTxBalance(tx);try{awardBaseLinhThach(tx);}catch(x){}n++;
    });
    saveAll();closeAppModal();showMiniToast('✓ Đã thêm '+n+' giao dịch từ SMS');
    try{renderHome();}catch(x){}
    if(typeof currentScreen==='function'&&currentScreen()==='history')renderHistory();
  };
})();
