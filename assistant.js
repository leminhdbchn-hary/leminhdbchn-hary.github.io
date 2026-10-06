/* Sổ Thu Chi – Trợ lý hỏi đáp
   Chạy hoàn toàn trong máy: hiểu câu hỏi tiếng Việt (có dấu hoặc không dấu) rồi trả lời từ dữ liệu của bạn.
   Không gửi dữ liệu ra ngoài, không tốn phí. Phạm vi: tra cứu thu chi · nợ/lãi vay/thẻ tín dụng · hướng dẫn dùng app · gợi ý tiết kiệm. */
(function(root){
  const N=s=>stripVN(String(s||'')).replace(/[^a-z0-9\/\s.,%-]/g,' ').replace(/\s+/g,' ').trim();
  const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const pad=n=>String(n).padStart(2,'0');
  const ymd=d=>d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate());
  const money=n=>'<b>'+fmt(n)+'</b>';
  const reEsc=s=>s.replace(/[.*+?^${}()|[\]\\\/]/g,'\\$&');
  const hasW=(q,k)=>new RegExp('(^|[^a-z0-9])'+reEsc(k)+'($|[^a-z0-9])').test(q);
  const has=(q,re)=>re.test(q);

  /* ---------- khoảng thời gian ---------- */
  function monthRange(y,m,label){const d=new Date(y,m,1);y=d.getFullYear();m=d.getMonth();return {from:y+'-'+pad(m+1)+'-01',to:ymd(new Date(y,m+1,0)),label:label||('tháng '+(m+1)+'/'+y),kind:'month',y,m};}
  function parseRange(q){
    const now=new Date(),y=now.getFullYear(),m=now.getMonth(),today=ymd(now);let r;
    if(has(q,/\bhom nay\b/))return {from:today,to:today,label:'hôm nay',kind:'day'};
    if(has(q,/\bhom qua\b/)){const d=addDays(today,-1);return {from:d,to:d,label:'hôm qua',kind:'day'};}
    const dow=(now.getDay()+6)%7,mon=addDays(today,-dow);
    if(has(q,/tuan (truoc|roi|qua)/))return {from:addDays(mon,-7),to:addDays(mon,-1),label:'tuần trước',kind:'week'};
    if(has(q,/tuan (nay|toi)|tuan hien tai/))return {from:mon,to:addDays(mon,6),label:'tuần này',kind:'week'};
    if(has(q,/thang (truoc|roi|qua)/))return monthRange(y,m-1,'tháng trước');
    if(has(q,/thang nay|thang hien tai/))return monthRange(y,m,'tháng này');
    if(has(q,/nam (ngoai|truoc)/))return {from:(y-1)+'-01-01',to:(y-1)+'-12-31',label:'năm '+(y-1),kind:'year',y:y-1};
    if(has(q,/nam nay/))return {from:y+'-01-01',to:y+'-12-31',label:'năm nay',kind:'year',y};
    if((r=q.match(/(\d+) ngay (qua|gan day|vua qua|truoc|gan nhat)/))){const n=Math.max(1,+r[1]);return {from:addDays(today,-(n-1)),to:today,label:n+' ngày qua',kind:'days',n};}
    if((r=q.match(/(\d+) thang (qua|gan day|gan nhat)/))){const n=Math.max(1,+r[1]);const f=monthRange(y,m-(n-1));return {from:f.from,to:today,label:n+' tháng qua',kind:'months',n};}
    if((r=q.match(/quy (\d)\b/))&&+r[1]>=1&&+r[1]<=4){const k=+r[1],f=monthRange(y,(k-1)*3),t=monthRange(y,(k-1)*3+2);return {from:f.from,to:t.to,label:'quý '+k+'/'+y,kind:'quarter'};}
    if((r=q.match(/thang (\d{1,2})(?:\s*(?:\/|nam)\s*(\d{4}))?(?!\d)/))&&+r[1]>=1&&+r[1]<=12)return monthRange(r[2]?+r[2]:y,+r[1]-1);
    if((r=q.match(/\b(\d{1,2})\/(\d{4})\b/))&&+r[1]>=1&&+r[1]<=12)return monthRange(+r[2],+r[1]-1);
    if(has(q,/tat ca|tong cong|toan bo|tu truoc den nay|tu dau|tu khi dung/))return {from:'0000-01-01',to:'9999-12-31',label:'từ trước đến nay',kind:'all'};
    return null;
  }
  function prevRange(r){
    const now=new Date();
    if(r.kind==='month')return monthRange(r.y,r.m-1);
    if(r.kind==='week')return {from:addDays(r.from,-7),to:addDays(r.from,-1),label:'tuần trước',kind:'week'};
    if(r.kind==='day'){const d=addDays(r.from,-1);return {from:d,to:d,label:'hôm trước',kind:'day'};}
    if(r.kind==='year')return {from:(r.y-1)+'-01-01',to:(r.y-1)+'-12-31',label:'năm '+(r.y-1),kind:'year',y:r.y-1};
    if(r.kind==='days'){const t=addDays(r.from,-1);return {from:addDays(t,-(r.n-1)),to:t,label:r.n+' ngày trước đó',kind:'days',n:r.n};}
    return null;
  }
  /* "tháng này" đang dở: so sánh công bằng với cùng số ngày của kỳ trước */
  function sameSpan(cur,prev){
    const today=ymd(new Date());if(!prev||cur.to<=today)return prev;
    const days=Math.max(1,daysBetween(cur.from,today)+1);return Object.assign({},prev,{to:addDays(prev.from,days-1)<prev.to?addDays(prev.from,days-1):prev.to,partial:true});
  }

  /* ---------- hạng mục ---------- */
  function findCat(q){
    const c=[];
    ['chi','thu'].forEach(type=>(GROUPS[type]||[]).forEach(G=>{
      const add=(name,it)=>{const base=N(name);[base].concat(base.indexOf('/')>=0?base.split('/').map(x=>x.trim()):[]).forEach(k=>{if(k.length>=3&&k!=='khac'&&k!=='khac.')c.push({k,type,g:G.name,it,label:it||G.name});});};
      add(G.name,null);(G.items||[]).forEach(it=>{if(it!==G.name)add(it,it);});
    }));
    c.sort((a,b)=>b.k.length-a.k.length);
    for(const x of c)if(hasW(q,x.k))return x;
    try{for(const [kws,type,g,it] of QE_SYN){for(const k of kws.slice().sort((a,b)=>b.length-a.length)){if(k.length>=3&&hasW(q,k)&&catValid(type,g,it))return {type,g,it,label:it};}}}catch(e){}
    return null;
  }
  const inCat=(t,c)=>!c||(c.it?(t.item===c.it&&t.group===c.g):t.group===c.g);
  const sel=(r,type,c)=>txs.filter(t=>t.type===type&&(!r||(t.date>=r.from&&t.date<=r.to))&&inCat(t,c));
  const sum=l=>l.reduce((s,t)=>s+(t.amount||0),0);
  function by(list,key){const m={};list.forEach(t=>{const k=key(t)||'Khác';m[k]=(m[k]||0)+t.amount;});return Object.entries(m).sort((a,b)=>b[1]-a[1]);}
  const pct=(a,b)=>b?Math.round(a/b*100):0;
  const li=a=>a.length?'<ul class="as-ul">'+a.map(x=>'<li>'+x+'</li>').join('')+'</ul>':'';
  const btn=(label,js)=>({label,js});

  /* ---------- trả lời: tra cứu thu chi ---------- */
  function ansSum(q,type,r,cat){
    r=r||monthRange(new Date().getFullYear(),new Date().getMonth());
    const L=sel(r,type,cat),total=sum(L),word=type==='chi'?'chi':'thu';
    const what=cat?(' cho <b>'+esc(cat.label)+'</b>'):'';
    if(!L.length)return {html:'Trong '+esc(r.label)+' bạn chưa có khoản '+word+what+' nào được ghi.'+(cat?'':' Hãy thử hỏi thời gian khác, ví dụ “tháng trước”.')};
    let h='Trong '+esc(r.label)+', bạn đã '+word+what+' '+money(total)+' ('+L.length+' giao dịch).';
    const days=r.kind==='all'?0:Math.max(1,daysBetween(r.from,r.to<ymd(new Date())?r.to:ymd(new Date()))+1);
    if(days>1&&type==='chi')h+=' Trung bình khoảng '+money(Math.round(total/days))+'/ngày.';
    const brk=cat&&cat.it?null:by(L,t=>cat?t.item:t.group).slice(0,5);
    if(brk&&brk.length>1)h+='<div class="as-sub">'+(cat?'Theo mục':'Theo nhóm')+':</div>'+li(brk.map(([k,v])=>esc(k)+': '+money(v)+' ('+pct(v,total)+'%)'));
    const p=prevRange(r);
    if(p){const ps=sameSpan(r,p),pt=sum(sel(ps,type,cat));if(pt>0){const d=total-pt;h+='<div class="as-note">So với '+esc(p.label)+(ps.partial?' (cùng số ngày)':'')+': '+(d>=0?'tăng ':'giảm ')+'<b>'+fmt(Math.abs(d))+'</b> ('+(d>=0?'+':'-')+pct(Math.abs(d),pt)+'%).</div>';}}
    return {html:h,acts:[btn('Xem lịch sử','showScreen(\'history\')')]};
  }
  function ansCompare(q,r,cat){
    const type=has(q,/thu nhap|thu bao|luong/)?'thu':'chi';
    {const q2=q.replace(/(so voi|voi|va|toi|den)\s+(tuan|thang|nam|hom)\s+(truoc|qua|roi)/g,' ');r=parseRange(q2)||monthRange(new Date().getFullYear(),new Date().getMonth());}
    let p=prevRange(r);
    if(!p)return {html:'Mình so sánh được theo ngày, tuần, tháng hoặc năm. Bạn thử hỏi “so sánh chi tiêu tháng này với tháng trước” nhé.'};
    p=sameSpan(r,p);
    const a=sel(r,type,cat),b=sel(p,type,cat),ta=sum(a),tb=sum(b),d=ta-tb;
    let h=type==='chi'?'Chi tiêu':'Thu nhập';
    h+=(cat?' <b>'+esc(cat.label)+'</b>':'')+':<ul class="as-ul"><li>'+esc(r.label)+': '+money(ta)+'</li><li>'+esc(p.label)+(p.partial?' (cùng số ngày)':'')+': '+money(tb)+'</li></ul>';
    if(!ta&&!tb)return {html:'Cả hai kỳ đều chưa có dữ liệu '+(type==='chi'?'chi':'thu')+(cat?' cho '+esc(cat.label):'')+'.'};
    h+=tb?('Chênh lệch: '+(d>=0?'tăng ':'giảm ')+'<b>'+fmt(Math.abs(d))+'</b> ('+(d>=0?'+':'-')+pct(Math.abs(d),tb)+'%).'):'Kỳ trước chưa có dữ liệu để so.';
    if(!cat){const ga=Object.fromEntries(by(a,t=>t.group)),gb=Object.fromEntries(by(b,t=>t.group));
      const diffs=Object.keys(Object.assign({},ga,gb)).map(k=>[k,(ga[k]||0)-(gb[k]||0)]).sort((x,y)=>Math.abs(y[1])-Math.abs(x[1])).slice(0,3).filter(x=>x[1]);
      if(diffs.length)h+='<div class="as-sub">Thay đổi nhiều nhất:</div>'+li(diffs.map(([k,v])=>esc(k)+': '+(v>0?'tăng ':'giảm ')+'<b>'+fmt(Math.abs(v))+'</b>'));}
    return {html:h};
  }
  function ansBiggest(q,r,cat,type){
    r=r||monthRange(new Date().getFullYear(),new Date().getMonth());
    const L=sel(r,type,cat);if(!L.length)return {html:'Trong '+esc(r.label)+' chưa có giao dịch '+(type==='chi'?'chi':'thu')+' nào.'};
    if(has(q,/nhom|hang muc|danh muc|vao dau|cho gi|loai/)){
      const b=by(L,t=>t.group).slice(0,5),tot=sum(L);
      return {html:'Trong '+esc(r.label)+', '+(type==='chi'?'bạn chi':'bạn thu')+' nhiều nhất cho:'+li(b.map(([k,v],i)=>(i+1)+'. '+esc(k)+': '+money(v)+' ('+pct(v,tot)+'%)'))};
    }
    const top=L.slice().sort((a,b)=>b.amount-a.amount).slice(0,5);
    return {html:'Các khoản '+(type==='chi'?'chi':'thu')+' lớn nhất '+esc(r.label)+':'+li(top.map(t=>money(t.amount)+' – '+esc(t.item||t.group)+(t.note?' ('+esc(String(t.note).slice(0,40))+')':'')+' · '+dmy(t.date)))};
  }
  function ansRecent(){
    const L=sortTxDesc(txs.filter(t=>t.type==='chi'||t.type==='thu')).slice(0,6);
    if(!L.length)return {html:'Bạn chưa có giao dịch nào. Bấm nút <b>+</b> để thêm giao dịch đầu tiên nhé.'};
    return {html:'Các giao dịch gần đây nhất:'+li(L.map(t=>(t.type==='chi'?'−':'+')+'<b>'+fmtShort(t.amount)+'</b> · '+esc(t.item||t.group)+(t.note?' ('+esc(String(t.note).slice(0,30))+')':'')+' · '+dmy(t.date))),acts:[btn('Mở lịch sử','showScreen(\'history\')')]};
  }

  /* ---------- trả lời: ví, tài sản ---------- */
  function ansBalance(q){
    const nw=netWorth();
    const wl=wallets.find(w=>{const k=N(w.name);return k.length>=3&&hasW(q,k);});
    if(wl){return {html:esc(wl.name)+': '+(isCredit(wl)?'dư nợ '+money(creditDebt(wl)):'số dư '+money(wl.balance||0))+'.'};}
    const typeName=t=>({cash:'Tiền mặt',bank:'Ngân hàng',ewallet:'Ví điện tử',saving:'Tiết kiệm',credit:'Thẻ tín dụng'}[t]||'Khác');
    const rows=wallets.map(w=>esc(w.name)+' ('+typeName(w.type)+'): '+(isCredit(w)?'nợ '+fmt(creditDebt(w)):fmt(w.balance||0)));
    let h='Tiền sẵn dùng (không gồm tiết kiệm) của bạn là '+money(nw.ready)+'. Tổng tài sản ròng ước tính: '+money(nw.net)+'.';
    h+='<div class="as-sub">Các ví:</div>'+(rows.length?li(rows):'Chưa có ví nào.');
    const extra=[];if(nw.saving)extra.push('Tiền gửi tiết kiệm: '+money(nw.saving));if(nw.lent)extra.push('Đang cho vay/cho mượn: '+money(nw.lent));if(nw.owe)extra.push('Tổng đang nợ: '+money(nw.owe));
    return {html:h+li(extra),acts:[btn('Mở Ví tiền','showScreen(\'accounts\')')]};
  }
  function ansLoans(q){
    loans.forEach(l=>{try{ensureLoanV2(l);}catch(e){}});
    const act=loans.filter(l=>l.status!=='closed');
    if(!act.length)return {html:'Bạn chưa có khoản vay ngân hàng nào đang theo dõi.',acts:[btn('Thêm khoản vay','showScreen(\'loans\')')]};
    const today=todayStr(),ms=loanNextSummary();
    let h='Tổng dư nợ vay ngân hàng: '+money(act.reduce((s,l)=>s+(l.balance||0),0))+' ('+act.length+' khoản).';
    h+=li(act.map(l=>{const ni=nextInterestDue(l),np=nextPrincipalDue(l);let s='<b>'+esc(l.name||'Khoản vay')+'</b>: dư nợ '+fmt(l.balance||0)+(l.rate?' · lãi '+l.rate+'%/năm':'');
      if(ni)s+='<br>Lãi kỳ tới: '+fmt(ni.amount)+' · hạn '+dmy(ni.due)+(ni.due<today?' ⚠ quá hạn':'');
      if(np&&np.amount>0)s+='<br>Gốc kỳ tới: '+fmt(np.amount)+' · hạn '+dmy(np.due)+(np.due<today?' ⚠ quá hạn':'');return s;}));
    h+='Tổng gốc + lãi phải trả kỳ tiếp theo: '+money(ms.p+ms.i)+(ms.overdue?' (có khoản quá hạn).':'.');
    return {html:h,acts:[btn('Mở Vay ngân hàng','showScreen(\'loans\')')]};
  }
  function nextDay(day){const now=new Date();let y=now.getFullYear(),m=now.getMonth();const mk=(yy,mm)=>{const last=new Date(yy,mm+1,0).getDate();return new Date(yy,mm,Math.min(day,last));};let d=mk(y,m);const t0=new Date(y,m,now.getDate());if(d<t0)d=mk(y,m+1);return d;}
  function ansCredit(){
    const cs=wallets.filter(isCredit);
    if(!cs.length)return {html:'Bạn chưa thêm thẻ tín dụng nào. Vào <b>Ví tiền → Thêm ví</b>, chọn loại “Thẻ tín dụng”.',acts:[btn('Mở Ví tiền','showScreen(\'accounts\')')]};
    const ym0=todayStr().slice(0,7);
    return {html:'Thẻ tín dụng của bạn:'+li(cs.map(w=>{let s='<b>'+esc(w.name)+'</b>: dư nợ '+fmt(creditDebt(w));
      if(w.limit)s+=' · hạn mức '+fmt(w.limit)+' (còn khả dụng '+fmt(Math.max(0,w.limit-creditDebt(w)))+')';
      const sp=sum(txs.filter(t=>t.type==='chi'&&String(t.walletId)===String(w.id)&&(t.date||'').slice(0,7)===ym0));if(sp)s+='<br>Chi bằng thẻ tháng này: '+fmt(sp);
      if(w.stmtDay){const d=nextDay(w.stmtDay);s+='<br>Ngày sao kê tới: '+pad(d.getDate())+'/'+pad(d.getMonth()+1);}
      if(w.dueDay){const d=nextDay(w.dueDay),dl=Math.round((d-new Date(new Date().getFullYear(),new Date().getMonth(),new Date().getDate()))/864e5);s+='<br>Hạn trả nợ: '+pad(d.getDate())+'/'+pad(d.getMonth()+1)+' (còn '+dl+' ngày)'+(dl<=5&&creditDebt(w)>0?' ⚠':'');}
      return s;})),acts:[btn('Mở Ví tiền','showScreen(\'accounts\')')]};
  }
  function ansDebts(q){
    const today=todayStr(),wantOut=has(q,/ai no (toi|minh)|no toi|cho vay|cho muon|toi cho/),wantIn=has(q,/toi no|minh no|dang no|vay cua|di vay|toi vay/);
    const all=!(wantOut^wantIn)||(wantOut&&wantIn);
    const pend=debts.filter(d=>d.status==='pending');
    const out=pend.filter(d=>!debtIsIn(d)),inn=pend.filter(d=>debtIsIn(d));
    const fam=txs.filter(t=>t.type==='family'&&t.repay&&!t.settled&&!t.settleOf);
    const famOut=fam.filter(t=>t.dir==='out'),famIn=fam.filter(t=>t.dir==='in');
    const row=(d,fam)=>'<b>'+esc(d.person)+'</b>: '+fmt(d.amount)+((d.dueDate)?' · hạn '+dmy(d.dueDate)+(d.dueDate<today?' ⚠ quá hạn':''):'')+(fam?' (gia đình)':'');
    let h='',any=false;
    if(all||wantOut){const L=out.map(d=>row(d)).concat(famOut.map(t=>row(t,1)));any=any||L.length;
      h+=L.length?'Người đang nợ bạn ('+money(sum(out)+sum(famOut))+'):'+li(L):'Hiện không ai đang nợ bạn.<br>';}
    if(all||wantIn){const L=inn.map(d=>row(d)).concat(famIn.map(t=>row(t,1)));any=any||L.length;
      h+=L.length?'Bạn đang nợ ('+money(sum(inn)+sum(famIn))+'):'+li(L):'Bạn không nợ cá nhân nào.<br>';}
    return {html:h,acts:[btn('Cho vay','openDebts(\'out\')'),btn('Vay nợ khác','openDebts(\'in\')')]};
  }
  function ansBudget(){
    const r=monthRange(new Date().getFullYear(),new Date().getMonth());const L=sel(r,'chi');
    const rows=GROUPS.chi.map(g=>({g:g.name,b:budgets[g.name]||0,s:sum(L.filter(t=>t.group===g.name))})).filter(x=>x.b>0);
    if(!rows.length)return {html:'Bạn chưa đặt ngân sách nhóm nào. Đặt ngân sách giúp app cảnh báo khi chi gần vượt mức.',acts:[btn('Đặt ngân sách','showScreen(\'budget\')')]};
    return {html:'Ngân sách tháng này:'+li(rows.map(x=>{const p=pct(x.s,x.b);return '<b>'+esc(x.g)+'</b>: '+fmt(x.s)+' / '+fmt(x.b)+' ('+p+'%)'+(p>=100?' 🔴 vượt '+fmt(x.s-x.b):p>=80?' 🟠 sắp hết':' 🟢');})),acts:[btn('Mở Ngân sách','showScreen(\'budget\')')]};
  }
  function ansGoals(){
    if(!goals.length)return {html:'Bạn chưa có mục tiêu tiết kiệm nào.',acts:[btn('Thêm mục tiêu','showScreen(\'goals\')')]};
    return {html:'Mục tiêu tiết kiệm:'+li(goals.map(g=>{let s='<b>'+esc((g.emoji||'')+' '+g.name)+'</b>: '+fmt(g.saved||0)+' / '+fmt(g.target||0)+' ('+pct(g.saved||0,g.target||0)+'%)';
      if(g.deadline){const mo=Math.max(1,Math.ceil(daysBetween(todayStr(),g.deadline)/30));const need=Math.max(0,(g.target||0)-(g.saved||0));s+=need?'<br>Hạn '+dmy(g.deadline)+(g.deadline<todayStr()?' ⚠ đã quá hạn':' · cần góp ~'+fmt(Math.ceil(need/mo))+'/tháng'):'<br>🎉 Đã đạt mục tiêu';}return s;})),acts:[btn('Mở Mục tiêu','showScreen(\'goals\')')]};
  }

  /* ---------- gợi ý tiết kiệm ---------- */
  function ansTips(){
    const now=new Date(),r=monthRange(now.getFullYear(),now.getMonth()),p=sameSpan(r,prevRange(r));
    const c=sel(r,'chi'),tot=sum(c),thu=sum(sel(r,'thu')),tips=[];
    if(!c.length)return {html:'Tháng này bạn chưa ghi khoản chi nào nên mình chưa có gì để nhận xét. Ghi chép vài ngày rồi hỏi lại nhé!'};
    const g=by(c,t=>t.group);
    if(g[0])tips.push('Nhóm chi nhiều nhất: <b>'+esc(g[0][0])+'</b> ('+fmt(g[0][1])+', '+pct(g[0][1],tot)+'% tổng chi). Đây là nơi cắt giảm hiệu quả nhất.');
    const pg=Object.fromEntries(by(sel(p,'chi'),t=>t.group));
    const up=g.filter(([k,v])=>pg[k]>0&&v>pg[k]*1.3&&v-pg[k]>=100000).sort((a,b)=>(b[1]-pg[b[0]])-(a[1]-pg[a[0]]))[0];
    if(up)tips.push('<b>'+esc(up[0])+'</b> tăng '+pct(up[1]-pg[up[0]],pg[up[0]])+'% so với tháng trước (thêm '+fmt(up[1]-pg[up[0]])+'). Xem lại xem có khoản nào không cần thiết.');
    const small=c.filter(t=>t.amount<=100000&&['Ăn uống','Hưởng thụ'].includes(t.group));
    if(small.length>=8)tips.push('Có '+small.length+' khoản chi nhỏ (≤100k) cho ăn uống/hưởng thụ, tổng '+fmt(sum(small))+'. Những khoản “nhỏ” cộng lại thường lớn hơn ta nghĩ.');
    if(thu>0){const rate=Math.round((thu-tot)/thu*100);tips.push(rate>=20?'Bạn đang để dành khoảng <b>'+rate+'%</b> thu nhập tháng này – rất tốt (mức hay được khuyên là ≥ 20%).':rate>=0?'Bạn mới để dành khoảng <b>'+rate+'%</b> thu nhập. Thử đặt mục tiêu ≥ 20% bằng cách “trả cho mình trước” ngay khi có lương.':'Tháng này chi <b>vượt thu '+fmt(tot-thu)+'</b>. Nên ưu tiên cắt các khoản không thiết yếu.');}
    const over=GROUPS.chi.filter(x=>budgets[x.name]>0&&sum(c.filter(t=>t.group===x.name))>budgets[x.name]).map(x=>x.name);
    if(over.length)tips.push('Đã vượt ngân sách: <b>'+over.map(esc).join(', ')+'</b>.');
    else if(!Object.keys(budgets).some(k=>budgets[k]>0))tips.push('Bạn chưa đặt ngân sách. Thử đặt ngân sách cho nhóm chi nhiều nhất để app nhắc khi gần vượt.');
    const cd=wallets.filter(isCredit).reduce((s,w)=>s+creditDebt(w),0);if(cd>0)tips.push('Thẻ tín dụng đang nợ '+fmt(cd)+'. Trả đủ trước hạn để tránh lãi suất cao.');
    const ln=loanNextSummary();if(ln.i>0)tips.push('Kỳ tới bạn phải trả lãi vay khoảng '+fmt(ln.i)+'. Nếu có tiền nhàn rỗi, trả bớt gốc sẽ giảm lãi.');
    return {html:'Nhận xét nhanh tháng này (gợi ý tham khảo, không phải tư vấn tài chính):'+li(tips),acts:[btn('Xem Báo cáo','showScreen(\'report\')')]};
  }

  /* ---------- hướng dẫn dùng app ---------- */
  const FAQ=[
    {k:['nhap nhanh','ghi nhanh','giong noi','noi de nhap','cafe 35k','1 dong'],a:'Ở màn hình <b>Thêm giao dịch (+)</b> có ô <b>⚡ Nhập nhanh</b>: gõ một dòng như “cafe 35k”, “xăng 80k hôm qua”, “lương 15tr” – app tự nhận số tiền, hạng mục, ngày. Bấm 🎤 để nói thay vì gõ.',act:btn('Mở Thêm giao dịch',"showScreen('add')")},
    {k:['sms','otp','tin nhan ngan hang','bien dong so du','dan tin nhan'],a:'Bấm nút <b>📩 Dán SMS ngân hàng</b> ở màn hình Thêm giao dịch: dán tin nhắn biến động số dư (nhiều tin cùng lúc cũng được), app tự tách chi/thu, số tiền, ngày giờ để bạn tick chọn rồi lưu. Mã OTP không bao giờ được lưu.',act:btn('Dán SMS ngay','openSmsImport()')},
    {k:['them giao dich','ghi giao dich','ghi chep','ghi chi','ghi thu','nhap giao dich'],a:'Bấm nút <b>+</b> ở giữa thanh dưới, chọn Chi/Thu, nhập số tiền, chọn hạng mục và ví rồi Lưu.',act:btn('Thêm giao dịch',"showScreen('add')")},
    {k:['sua giao dich','xoa giao dich','sua khoan','xoa khoan','nhap nham','chinh sua'],a:'Vào <b>Lịch sử giao dịch</b>, chạm vào giao dịch để sửa; bấm biểu tượng thùng rác để xoá. Số dư ví sẽ tự được tính lại.',act:btn('Mở Lịch sử',"showScreen('history')")},
    {k:['them vi','tao vi','vi tien','tai khoan ngan hang','them tai khoan','vi dien tu'],a:'Vào <b>Ví tiền → Thêm ví</b>, chọn loại ví (tiền mặt, ngân hàng, ví điện tử, tiết kiệm, thẻ tín dụng), đặt tên và số dư ban đầu.',act:btn('Mở Ví tiền',"showScreen('accounts')")},
    {k:['the tin dung','tra no the','thanh toan the','sao ke'],a:'Tạo ví loại <b>Thẻ tín dụng</b> (nhập hạn mức, ngày sao kê, ngày hạn trả). Chi bằng thẻ làm tăng dư nợ, không trừ tiền ví. Khi trả thẻ, dùng <b>Chuyển ví</b> từ ví của bạn sang thẻ hoặc nút “Trả nợ thẻ” trong Ví tiền.',act:btn('Mở Ví tiền',"showScreen('accounts')")},
    {k:['chuyen vi','chuyen tien giua','rut tien atm','chuyen khoan giua'],a:'Ở màn hình Thêm giao dịch chọn tab <b>Chuyển ví</b>, chọn ví nguồn và ví đích. Chuyển ví không tính vào chi tiêu hay thu nhập.',act:btn('Thêm giao dịch',"showScreen('add')")},
    {k:['ngan sach','han muc chi','canh bao chi'],a:'Vào <b>Cài đặt → Ngân sách</b> để đặt hạn mức theo nhóm hoặc từng mục. App sẽ cảnh báo khi chi gần hoặc vượt ngân sách.',act:btn('Mở Ngân sách',"showScreen('budget')")},
    {k:['muc tieu','tiet kiem de','heo dat','dành dụm','danh dum'],a:'Vào <b>Cài đặt → Mục tiêu tiết kiệm</b>, đặt tên, số tiền cần đạt và hạn. Bạn góp thêm/rút bớt bất cứ lúc nào và app tính số cần góp mỗi tháng.',act:btn('Mở Mục tiêu',"showScreen('goals')")},
    {k:['chia tien','chia hoa don','an chung','chia nhom'],a:'Vào <b>Cài đặt → Chia tiền nhóm</b>, nhập tổng hóa đơn và tên mọi người. App chia đều và ghi các khoản “người khác nợ bạn”.',act:btn('Chia tiền nhóm','openSplitBill()')},
    {k:['dinh ky','lap lai','hang thang','tien nha tu dong','tu dong ghi'],a:'Vào <b>Cài đặt → Thu chi định kỳ</b> để tạo khoản lặp lại (tiền nhà, lương, internet…); app tự ghi theo lịch.',act:btn('Mở Thu chi định kỳ',"showScreen('recurring')")},
    {k:['hang muc','danh muc','them muc','tao nhom','tu tao hang muc'],a:'Vào <b>Cài đặt → Quản lý hạng mục</b> để thêm nhóm/mục mới, ẩn mục ít dùng hoặc đổi biểu tượng.',act:btn('Quản lý hạng mục',"showScreen('cats')")},
    {k:['sao luu','backup','khoi phuc','mat du lieu','xuat du lieu','file json'],a:'Vào <b>Cài đặt → Sao lưu và đồng bộ</b>: có sao lưu tự động trong máy, xuất JSON để tự lưu, khôi phục từ file JSON. Nên đăng nhập Google để dữ liệu có thêm bản trên cloud.',act:btn('Bản sao lưu','openBackups()')},
    {k:['excel','csv','xuat file','tai ve bao cao'],a:'Vào <b>Cài đặt → Sao lưu và đồng bộ → Xuất dữ liệu (CSV / Excel)</b> để tải toàn bộ giao dịch.',act:btn('Xuất CSV','exportCSV()')},
    {k:['dong bo','nhieu thiet bi','dang nhap google','cloud','dien thoai khac','may khac'],a:'Đăng nhập bằng tài khoản Google ở <b>Cài đặt → Đồng bộ nhiều thiết bị</b>. Dùng chung một tài khoản trên các máy thì dữ liệu tự đồng bộ.',act:btn('Mở Đồng bộ',"showScreen('cloud')")},
    {k:['mat khau','khoa app','face id','pin','bao mat','van tay'],a:'Vào <b>Cài đặt → Mật khẩu vào app</b> để đặt mã PIN; có thể bật mở khoá bằng Face ID ở mục bên dưới.',act:btn('Đặt mật khẩu','openPinSettings()')},
    {k:['ngoai te','usd','do la','quy doi'],a:'Ở màn hình Thêm giao dịch, chọn ngoại tệ (USD, EUR…) và nhập số ngoại tệ; app quy đổi ra VND theo tỷ giá bạn nhập. Hoặc gõ nhanh “20 usd ăn tối”.',act:btn('Thêm giao dịch',"showScreen('add')")},
    {k:['hoa don','chup anh','anh hoa don','dinh kem'],a:'Ở màn hình Thêm giao dịch có mục <b>Đính kèm ảnh hoá đơn</b>; app nén ảnh và có thể đọc giúp tổng tiền trên hoá đơn.',act:btn('Thêm giao dịch',"showScreen('add')")},
    {k:['vay ngan hang','them khoan vay','thau chi','tra lai vay','khoan vay moi'],a:'Vào <b>Cài đặt → Vay ngân hàng → Thêm khoản vay</b> (vay tiêu dùng hoặc thấu chi), nhập số tiền, lãi suất, kỳ hạn. App lập lịch trả gốc/lãi và nhắc khi đến hạn.',act:btn('Mở Vay ngân hàng',"showScreen('loans')")},
    {k:['cho vay','vay ngoai','vay ban be','ghi no','cho muon','nguoi vay'],a:'Vào <b>Cài đặt → Cho vay</b> (người khác nợ bạn) hoặc <b>Vay nợ khác</b> (bạn nợ người khác) để ghi khoản nợ, hạn trả và đánh dấu khi đã thu/trả.',act:btn('Mở Cho vay',"openDebts('out')")},
    {k:['gia dinh','vo chong','bo me','tien gia dinh'],a:'Mục <b>Tiền gia đình</b> ghi các khoản nhận/đưa tiền cho người thân, có thể đánh dấu “cho mượn/mượn” để theo dõi trả lại.',act:btn('Mở Tiền gia đình',"showScreen('family')")},
    {k:['giao dien','doi mau','chu to','co chu','dark','nen toi'],a:'Vào <b>Cài đặt</b> để đổi giao diện màu và cỡ chữ & số.',act:btn('Mở Cài đặt',"showScreen('more')")},
    {k:['man hinh chinh','cai app','cai dat app','iphone','ios','pwa','offline','khong co mang'],a:'Mở app bằng Safari/Chrome, chọn <b>Thêm vào Màn hình chính</b> để dùng như app thật. App chạy được cả khi mất mạng; dữ liệu lưu trong máy.'},
    {k:['an so du','giau so du','che so du','mat so du'],a:'Bấm biểu tượng con mắt cạnh số dư ở Tổng quan để ẩn/hiện số dư.'},
    {k:['bao cao','thong ke','bieu do'],a:'Tab <b>Báo cáo</b> cho xem thu/chi theo thời gian, biểu đồ theo nhóm và các cảnh báo chi tiêu bất thường.',act:btn('Mở Báo cáo',"showScreen('report')")}
  ];
  function ansFaq(q,strict){
    let best=null,bs=0;
    FAQ.forEach(f=>{let s=0;f.k.forEach(k=>{const nk=N(k);if(q.indexOf(nk)>=0)s+=nk.length>=6?2:1;});if(s>bs){bs=s;best=f;}});
    if(!best||(strict&&bs<1))return null;
    return {html:best.a,acts:best.act?[best.act]:[]};
  }
  const HELP='Mình có thể giúp bạn:'+li(['<b>Tra cứu thu chi</b>: “tháng này chi bao nhiêu cho ăn uống?”, “khoản chi lớn nhất tuần này”','<b>Nợ & vay</b>: “dư nợ vay ngân hàng”, “lãi phải trả kỳ tới”, “thẻ tín dụng khi nào đến hạn”, “ai đang nợ tôi”','<b>Số dư</b>: “tôi còn bao nhiêu tiền”, “tài sản ròng”','<b>Gợi ý tiết kiệm</b>: “tôi nên cắt giảm gì?”','<b>Cách dùng app</b>: “làm sao để sao lưu?”, “dán SMS ngân hàng”']);

  /* ---------- bộ điều phối ---------- */
  function answer(raw){
    const q=N(raw);if(!q)return {html:HELP};
    if(has(q,/^(xin chao|chao|hello|hi|alo|hey)\b/)&&q.length<25)return {html:'Xin chào! 👋 Bạn muốn hỏi gì về sổ thu chi của mình?<br>'+HELP};
    if(has(q,/^(cam on|thanks|thank you|ok|oke)\b/)&&q.length<25)return {html:'Không có gì! Cần gì cứ hỏi mình nhé 😊'};
    if(has(q,/(giup duoc gi|lam duoc gi|huong dan|tro giup|^help|co the hoi)/)&&!has(q,/lam sao|cach/))return {html:HELP};
    const r=parseRange(q),cat=findCat(q);
    const how=has(q,/lam sao|lam the nao|cach |the nao de|o dau|chi dan|huong dan|bat |tat |dung de|co duoc khong|duoc khong|khong the|sao khong/);
    if(how){const f=ansFaq(q,true);if(f)return f;}
    if(has(q,/otp|sms|tin nhan ngan hang/)&&!has(q,/chi|thu/)){const f=ansFaq(q,true);if(f)return f;}
    if(has(q,/vay ngan hang|khoan vay|lai vay|du no vay|tra lai|tien lai phai|lai phai tra|tra goc|thau chi|lai ky|ky tra no|lich tra no|tien lai ngan hang/)&&!has(q,/tiet kiem.*lai|lai.*tiet kiem|lai suat tiet kiem/))return ansLoans(q);
    if(has(q,/the tin dung|the td|\bvisa\b|mastercard|sao ke|han tra the|du no the|no the|han muc the/))return ansCredit();
    if(has(q,/ai no|no toi|toi no|minh no|dang no|cho vay|cho muon|vay cua|di vay|tien no|so no|khoan no/))return ansDebts(q);
    if(has(q,/ngan sach/)&&!how)return ansBudget();
    if(has(q,/muc tieu/)&&!how)return ansGoals();
    if(has(q,/goi y|loi khuyen|nhan xet|danh gia|cat giam|nen cat|tiet kiem duoc|lam sao.*tiet kiem|thoi quen|tieu qua|chi qua|phan tich|tu van|toi tieu co|dang tieu/))return ansTips();
    if(has(q,/so du|tai san|con bao nhieu tien|co bao nhieu tien|con bao nhieu|tong tien|tien mat|bao nhieu tien trong|net worth|giau|vi cua toi|cac vi/)&&!has(q,/chi|thu nhap/))return ansBalance(q);
    if(has(q,/gan day|moi nhat|vua (chi|ghi|tieu)|giao dich cuoi|lich su/)&&!has(q,/lon nhat|nhieu nhat/))return ansRecent();
    const incomeQ=has(q,/thu nhap|thu bao|luong|kiem duoc|nhan duoc|\bthu\b|duoc nhan|doanh thu|tien vao/);
    const type=(cat?cat.type:null)||(incomeQ&&!has(q,/\bchi\b|tieu|mua/)?'thu':'chi');
    if(has(q,/so sanh|so voi|hon kem|tang bao nhieu|giam bao nhieu|chenh lech|khac gi/))return ansCompare(q,r,cat);
    if(has(q,/lon nhat|nhieu nhat|cao nhat|top|toi da|dat nhat/))return ansBiggest(q,r,cat,type);
    if(cat||has(q,/chi|tieu|mua sam|het bao nhieu|ton bao nhieu|bao nhieu tien|tong|thu|luong|kiem/))return ansSum(q,type,r,cat);
    const f=ansFaq(q,true);if(f)return f;
    return {html:'Mình chưa hiểu rõ câu hỏi này 🤔. Bạn thử diễn đạt khác, hoặc chọn một gợi ý bên dưới nhé.',fallback:true};
  }
  root.StcAssistant={answer,parseRange,findCat,N,FAQ};

  /* ---------- giao diện chat ---------- */
  const SUGGEST=['Tháng này tôi chi bao nhiêu?','Chi tiêu tháng này so với tháng trước','Khoản chi lớn nhất tuần này','Tôi còn bao nhiêu tiền?','Dư nợ vay và lãi kỳ tới','Thẻ tín dụng khi nào đến hạn?','Ai đang nợ tôi?','Tôi nên cắt giảm gì?','Dán SMS ngân hàng thế nào?','Làm sao để sao lưu dữ liệu?'];
  let log=[];
  function ui(){return {log:document.getElementById('asLog'),chips:document.getElementById('asChips'),inp:document.getElementById('asInput')};}
  function render(){
    const u=ui();if(!u.log)return;
    if(!log.length)log.push({who:'bot',html:'Xin chào! Mình là trợ lý của Sổ Thu Chi 💬. Mình trả lời từ dữ liệu ngay trong máy bạn – không gửi đi đâu cả.<br>'+HELP});
    u.log.innerHTML=log.map(m=>'<div class="as-msg '+m.who+'"><div class="as-bub">'+(m.who==='me'?esc(m.html):m.html)+'</div>'+((m.acts&&m.acts.length)?'<div class="as-acts">'+m.acts.map((a,i)=>'<button onclick="asAct('+log.indexOf(m)+','+i+')">'+esc(a.label)+'</button>').join('')+'</div>':'')+'</div>').join('');
    u.chips.innerHTML=SUGGEST.map((s,i)=>'<button onclick="asAsk(StcAssistant.sug['+i+'])">'+esc(s)+'</button>').join('');
    u.log.scrollTop=u.log.scrollHeight;try{window.scrollTo(0,document.body.scrollHeight);}catch(e){}
  }
  root.StcAssistant.sug=SUGGEST;
  root.asAsk=function(text){
    text=String(text||'').trim();if(!text)return;
    log.push({who:'me',html:text});
    let a;try{a=answer(text);}catch(e){console.error(e);a={html:'Có lỗi khi xử lý câu hỏi này. Bạn thử hỏi cách khác nhé.'};}
    log.push({who:'bot',html:a.html,acts:a.acts});if(log.length>60)log=log.slice(-60);
    const u=ui();if(u.inp)u.inp.value='';render();
  };
  root.asSubmit=function(ev){ev.preventDefault();asAsk(ui().inp.value);};
  root.asAct=function(i,j){const m=log[i];if(m&&m.acts&&m.acts[j]){try{(new Function(m.acts[j].js))();}catch(e){console.error(e);}}};
  root.asClear=function(){log=[];render();};
  root.openAssistant=function(q){showScreen('assistant');if(q)setTimeout(()=>asAsk(q),50);};
  window.screenHooks=window.screenHooks||{};
  const prev=window.screenHooks.assistant;window.screenHooks.assistant=function(){if(prev)prev();render();};
})(window);
