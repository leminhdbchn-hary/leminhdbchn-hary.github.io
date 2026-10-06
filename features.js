/* Sổ Thu Chi – tính năng mở rộng
   1. Nhập nhanh 1 dòng + giọng nói      2. Ngoại tệ quy đổi VND        3. Đọc số tiền trên ảnh hoá đơn
   4. Sao lưu tự động trong máy          5. Quản lý hạng mục tự tạo      6. Mục tiêu tiết kiệm
   7. Chia tiền nhóm                     8. Báo cáo mở rộng + cảnh báo chi tiêu bất thường
   9. Nhắc ghi chép buổi tối (trong app)
   File này chạy sau app.js và dùng lại các hàm/biến của app.js. */

function escH(s){return String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function escA(s){return String(s==null?'':s).replace(/\\/g,'\\\\').replace(/'/g,"\\'").replace(/"/g,'&quot;');}
function openModal(html){document.getElementById('appModalBody').innerHTML=html;document.getElementById('appModal').classList.add('show');}
function numFromText(v){return parseInt(String(v||'').replace(/\D/g,''))||0;}
/* chuẩn hoá tiếng Việt về không dấu, GIỮ NGUYÊN độ dài chuỗi (để cắt lại đúng vị trí trong câu gốc) */
function normKeepLen(s){return String(s).toLowerCase().split('').map(ch=>{if(ch==='đ')return 'd';const b=ch.normalize('NFD')[0];return b&&b.length===1?b:ch;}).join('');}

/* =====================================================================
   1. NHẬP NHANH
   ===================================================================== */
const QE_SYN=[
  [['ca phe','cafe','caphe','cf','coffee','tra sua','sinh to','nuoc ep','highland','highlands','starbucks','phuc long','cong ca phe','tra chanh'],'chi','Ăn uống','Cafe'],
  [['an sang','bua sang','pho','bun','banh mi','xoi','chao','banh cuon','mi tom'],'chi','Ăn uống','Ăn sáng'],
  [['an trua','com trua','bua trua','com van phong'],'chi','Ăn uống','Ăn trưa'],
  [['an toi','com toi','bua toi'],'chi','Ăn uống','Ăn tối'],
  [['nha hang','an tiem','lau','nuong','nhau','buffet','an ngoai','quan an','an vat','an'],'chi','Ăn uống','Ăn tiệm'],
  [['di cho','sieu thi','winmart','coopmart','co.opmart','bach hoa xanh','bhx','circle k','circlek','gs25','thuc pham','mua rau','mua thit','trai cay','hoa qua'],'chi','Ăn uống','Đi chợ/siêu thị'],
  [['dam cuoi','cuoi','mung cuoi','an cuoi'],'chi','Hiếu hỉ','Cưới xin'],
  [['bieu','qua tang','mua qua','tang qua','sinh nhat'],'chi','Hiếu hỉ','Biếu tặng'],
  [['dam ma','dam hieu','ma chay','phung vieng'],'chi','Hiếu hỉ','Ma chay'],
  [['tham om','tham hoi','tham benh'],'chi','Hiếu hỉ','Thăm hỏi'],
  [['grab','taxi','be car','be bike','xanh sm','gojek','xe om','thue xe','uber','ve xe','xe khach','tau','may bay','ve may bay'],'chi','Đi lại','Taxi/thuê xe'],
  [['xang','do xang','xang xe','dau xe'],'chi','Đi lại','Xăng xe'],
  [['bao hiem xe'],'chi','Đi lại','Bảo hiểm xe'],
  [['gui xe','giu xe','ve xe thang','do xe','phi gui xe'],'chi','Đi lại','Gửi xe'],
  [['rua xe'],'chi','Đi lại','Rửa xe'],
  [['sua xe','thay nhot','bao duong xe','thay lop','va xe'],'chi','Đi lại','Sửa chữa, bảo dưỡng xe'],
  [['dien thoai','nap tien dien thoai','nap dien thoai','nap the','cuoc dien thoai','4g','5g','goi cuoc'],'chi','Dịch vụ sinh hoạt','Điện thoại di động'],
  [['gas','binh gas','tien gas'],'chi','Dịch vụ sinh hoạt','Gas'],
  [['internet','wifi','tien mang','cuoc mang','cap quang'],'chi','Dịch vụ sinh hoạt','Internet'],
  [['tien nuoc','nuoc sinh hoat','hoa don nuoc'],'chi','Dịch vụ sinh hoạt','Nước'],
  [['giup viec','osin','don nha'],'chi','Dịch vụ sinh hoạt','Thuê người giúp việc'],
  [['truyen hinh','k+','netflix','youtube premium','fpt play','tv360'],'chi','Dịch vụ sinh hoạt','Truyền hình'],
  [['tien dien','dien','hoa don dien'],'chi','Dịch vụ sinh hoạt','Điện'],
  [['mua sam do dac','noi that','do gia dung','mua do nha'],'chi','Nhà cửa','Mua sắm đồ đạc'],
  [['sua nha','sua chua nha'],'chi','Nhà cửa','Sửa chữa nhà cửa'],
  [['tien nha','thue nha','tien phong','thue phong'],'chi','Nhà cửa','Thuê nhà'],
  [['hoc phi','tien hoc'],'chi','Con cái','Học phí'],
  [['sach','sach vo','vo viet','do dung hoc tap'],'chi','Con cái','Sách vở'],
  [['sua bot','sua tuoi','sua cho be','bim','ta bim'],'chi','Con cái','Sữa'],
  [['tieu vat','tien tieu vat'],'chi','Con cái','Tiền tiêu vặt'],
  [['do choi'],'chi','Con cái','Đồ chơi'],
  [['du lich','khach san','homestay','resort','di choi xa'],'chi','Hưởng thụ','Du lịch'],
  [['lam dep','cat toc','goi dau','spa','lam mong','nail','massage'],'chi','Hưởng thụ','Làm đẹp'],
  [['my pham','son moi','kem duong','nuoc hoa','skincare'],'chi','Hưởng thụ','Mỹ phẩm'],
  [['xem phim','phim','ca nhac','concert','cgv','lotte cinema','spotify'],'chi','Hưởng thụ','Phim ảnh, ca nhạc'],
  [['vui choi','giai tri','game','karaoke','bida','di choi'],'chi','Hưởng thụ','Vui chơi giải trí'],
  [['phi chuyen khoan','phi ngan hang','phi sms'],'chi','Ngân hàng','Phí chuyển khoản'],
  [['the tin dung','tra the','thanh toan the'],'chi','Ngân hàng','Thanh toán thẻ tín dụng'],
  [['giao luu','gap mat','hop lop','moi khach','tiep khach'],'chi','Phát triển bản thân','Giao lưu, quan hệ'],
  [['khoa hoc','hoc them','hoc tieng anh','hoc hanh'],'chi','Phát triển bản thân','Học hành'],
  [['kham benh','kham','benh vien','nha khoa','xet nghiem'],'chi','Sức khỏe','Khám chữa bệnh'],
  [['thuoc','nha thuoc','thuoc men','vitamin'],'chi','Sức khỏe','Thuốc men'],
  [['gym','the thao','bong da','pickleball','cau long','tennis','boi','yoga','chay bo'],'chi','Sức khỏe','Thể thao'],
  [['giay','dep','giay dep'],'chi','Trang phục','Giày dép'],
  [['tui xach','that lung','kinh','dong ho','phu kien'],'chi','Trang phục','Phụ kiện khác'],
  [['quan ao','ao','ao khoac','quan jean'],'chi','Trang phục','Quần áo'],
  [['luong','tien luong','nhan luong'],'thu','Lương','Lương'],
  [['thuong','tien thuong','bonus'],'thu','Thưởng','Thưởng'],
  [['duoc cho','duoc tang','li xi','mung tuoi','qua duoc tang'],'thu','Được cho/tặng','Được cho/tặng'],
  [['lai tiet kiem'],'thu','Lãi tiết kiệm','Lãi tiết kiệm'],
  [['tien lai','co tuc','lai dau tu'],'thu','Tiền lãi','Tiền lãi'],
  [['thu no','tra no minh','doi no'],'thu','Thu hồi nợ','Thu hồi nợ'],
  [['ban do','ban hang','thu nhap them','nhan tien'],'thu','Khác','Khác']
];
const QE_CUR={usd:'USD','$':'USD','do la':'USD',dola:'USD',dollar:'USD',eur:'EUR',euro:'EUR',jpy:'JPY',yen:'JPY',krw:'KRW',won:'KRW',thb:'THB',baht:'THB',sgd:'SGD',cny:'CNY',ndt:'CNY','nhan dan te':'CNY',aud:'AUD',gbp:'GBP',twd:'TWD',hkd:'HKD'};
function qeKeywords(){
  const list=[];
  QE_SYN.forEach(([kws,type,g,it])=>kws.forEach(k=>list.push({k,type,g,it})));
  /* tên hạng mục (kể cả hạng mục tự tạo) cũng là từ khoá */
  ['chi','thu'].forEach(type=>(GROUPS[type]||[]).forEach(G=>{
    visibleItems(type,G).forEach(it=>{const k=normKeepLen(it).replace(/[^a-z0-9 ]/g,' ').replace(/\s+/g,' ').trim();if(k.length>=4)list.push({k,type,g:G.name,it});});
  }));
  return list.filter(x=>catValid(x.type,x.g,x.it)).sort((a,b)=>b.k.length-a.k.length);
}
function qeFindAmount(n){
  /* n: chuỗi đã chuẩn hoá (không dấu, chữ thường). Trả {value,start,end,cur,raw} */
  const tries=[
    {re:/(\d+(?:[.,]\d+)?)\s*(ty|ti)\b/,f:m=>parseFloat(m[1].replace(',','.'))*1e9},
    {re:/(\d+(?:[.,]\d+)?)\s*(tr|trieu|cu|m)(?:\s*(\d{1,3})(?!\d))?\b/,f:m=>{let v=parseFloat(m[1].replace(',','.'))*1e6;if(m[3])v+=parseInt(m[3])*Math.pow(10,6-m[3].length);return v;}},
    {re:/(\d+(?:[.,]\d+)?)\s*(k|nghin|ngan|ng|n)\b/,f:m=>parseFloat(m[1].replace(',','.'))*1000},
    {re:/(\d{1,3}(?:[.,]\d{3})+)(?:\s*(?:d|dong|vnd|vnđ)\b)?/,f:m=>parseInt(m[1].replace(/[.,]/g,''))},
    {re:/(\d+)(?:\s*(?:d|dong|vnd)\b)?/,f:m=>{const v=parseInt(m[1]);return v<1000?v*1000:v;}}
  ];
  /* ngoại tệ: 20 usd, $20, 20$ */
  const cm=n.match(/(?:\$\s*(\d+(?:[.,]\d+)?))|(?:(\d+(?:[.,]\d+)?)\s*(\$|usd|do la|dola|dollar|eur|euro|jpy|yen|krw|won|thb|baht|sgd|cny|ndt|nhan dan te|aud|gbp|twd|hkd)\b)/);
  if(cm){const amt=parseFloat((cm[1]||cm[2]).replace(',','.'));const cur=cm[1]?'USD':QE_CUR[cm[3]];if(amt>0&&cur)return {value:0,fxAmt:amt,cur,start:cm.index,end:cm.index+cm[0].length};}
  for(const t of tries){const m=n.match(t.re);if(m){const v=Math.round(t.f(m));if(v>0)return {value:v,start:m.index,end:m.index+m[0].length};}}
  return null;
}
function qeFindDate(n){
  const today=todayStr();
  const rel=[[/\bhom kia\b/,-2],[/\bhom qua\b/,-1],[/\bhom nay\b/,0]];
  for(const [re,d] of rel){const m=n.match(re);if(m)return {date:addDays(today,d),start:m.index,end:m.index+m[0].length,label:d===0?'hôm nay':d===-1?'hôm qua':'hôm kia'};}
  const m=n.match(/\b(\d{1,2})[\/-](\d{1,2})(?:[\/-](\d{2,4}))?\b/);
  if(m){const dd=+m[1],mm=+m[2];let yy=m[3]?+m[3]:+today.slice(0,4);if(yy<100)yy+=2000;
    if(dd>=1&&dd<=31&&mm>=1&&mm<=12){const s=yy+'-'+String(mm).padStart(2,'0')+'-'+String(dd).padStart(2,'0');const chk=new Date(s+'T00:00:00');if(chk.getDate()===dd)return {date:s,start:m.index,end:m.index+m[0].length,label:dmy(s)};}}
  return null;
}
function qeParse(text){
  const orig=String(text||'');const n=normKeepLen(orig);
  const res={type:null,group:null,item:null,amount:0,date:null,dateLabel:'',note:'',fx:null};
  const cut=[];
  const d=qeFindDate(n);if(d){res.date=d.date;res.dateLabel=d.label;cut.push([d.start,d.end]);}
  let n2=n;cut.forEach(([a,b])=>{n2=n2.slice(0,a)+' '.repeat(b-a)+n2.slice(b);});
  const a=qeFindAmount(n2);
  if(a){cut.push([a.start,a.end]);if(a.cur){res.fx={cur:a.cur,amt:a.fxAmt};}else res.amount=a.value;}
  let n3=n;cut.forEach(([s,e])=>{n3=n3.slice(0,s)+' '.repeat(e-s)+n3.slice(e);});
  const padded=' '+n3.replace(/[^a-z0-9$+.]/g,' ')+' ';
  let kwHit=null;
  for(const x of qeKeywords()){const i=padded.indexOf(' '+x.k+' ');if(i>=0){kwHit=x;break;}}
  if(kwHit){res.type=kwHit.type;res.group=kwHit.g;res.item=kwHit.it;}
  /* ghi chú = phần chữ còn lại (bỏ số tiền, ngày) */
  let note=orig;cut.sort((x,y)=>y[0]-x[0]).forEach(([s,e])=>{note=note.slice(0,s)+' '+note.slice(e);});
  note=note.replace(/\s+/g,' ').trim();
  if(kwHit&&normKeepLen(note).replace(/[^a-z0-9]/g,'')===kwHit.k.replace(/[^a-z0-9]/g,''))note='';
  res.note=note;
  return res;
}
let qeTimer=null,qeSetNote='';
function qeRun(){
  const inp=document.getElementById('qeInput'),hint=document.getElementById('qeHint');if(!inp)return;
  const txt=inp.value.trim();
  if(!txt){if(hint)hint.textContent='';return;}
  const r=qeParse(txt);
  if(r.type&&r.type!==currentType&&(currentType==='chi'||currentType==='thu'))setType(r.type);
  if(r.fx){fxSet(r.fx.cur,r.fx.amt);}
  else if(r.amount){fxSet('VND');document.getElementById('amountInput').value=fmtShort(r.amount);}
  if(r.group&&(currentType==='chi'||currentType==='thu')){selectedGroup=r.group;selectedItem=r.item;renderCatPicker();}
  if(r.date){document.getElementById('dateInput').value=r.date;}
  const noteEl=document.getElementById('noteInput');
  if(noteEl&&(noteEl.value===''||noteEl.value===qeSetNote)){noteEl.value=r.note;qeSetNote=r.note;}
  const parts=[];
  if(r.item)parts.push((r.type==='thu'?'Thu · ':'Chi · ')+r.item);
  if(r.fx)parts.push(r.fx.amt+' '+r.fx.cur+' ≈ '+document.getElementById('amountInput').value+' đ');else if(r.amount)parts.push(fmtShort(r.amount)+' đ');
  if(r.dateLabel)parts.push(r.dateLabel);
  if(hint)hint.innerHTML=parts.length?('✓ '+escH(parts.join(' · '))+(r.amount||r.fx?'':' · <span class="qe-warn">chưa có số tiền</span>')):'<span class="qe-warn">Chưa nhận ra nội dung, hãy nhập thêm số tiền (vd 35k)</span>';
}
let qeRec=null;
function qeVoice(){
  const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
  const inp=document.getElementById('qeInput'),mic=document.getElementById('qeMic');
  if(!SR){inp.focus();showMiniToast('🎤 Hãy dùng nút micro trên bàn phím để nói');return;}
  if(qeRec){try{qeRec.stop();}catch(e){}return;}
  try{
    const r=new SR();qeRec=r;r.lang='vi-VN';r.interimResults=false;r.maxAlternatives=1;
    mic.classList.add('rec');
    r.onresult=e=>{const t=e.results&&e.results[0]&&e.results[0][0]?e.results[0][0].transcript:'';if(t){inp.value=t;qeRun();}};
    r.onerror=e=>{if(e.error==='not-allowed'||e.error==='service-not-allowed')showMiniToast('Chưa cho phép dùng micro. Hãy dùng micro trên bàn phím.');};
    r.onend=()=>{qeRec=null;mic.classList.remove('rec');};
    r.start();
  }catch(e){qeRec=null;mic.classList.remove('rec');inp.focus();showMiniToast('🎤 Hãy dùng nút micro trên bàn phím để nói');}
}
function qeReset(){const i=document.getElementById('qeInput');if(i)i.value='';const h=document.getElementById('qeHint');if(h)h.textContent='';qeSetNote='';}
(function(){
  const inp=document.getElementById('qeInput');if(!inp)return;
  inp.addEventListener('input',()=>{clearTimeout(qeTimer);qeTimer=setTimeout(qeRun,250);});
  inp.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();clearTimeout(qeTimer);qeRun();inp.blur();}});
})();

/* =====================================================================
   2. NGOẠI TỆ → quy đổi VND (tỷ giá tham khảo, người dùng sửa được, app nhớ tỷ giá lần trước)
   ===================================================================== */
const FX_LIST=[['VND','VND – Việt Nam đồng',1],['USD','USD – Đô la Mỹ',26300],['EUR','EUR – Euro',30500],['JPY','JPY – Yên Nhật',175],['KRW','KRW – Won Hàn',19],['CNY','CNY – Nhân dân tệ',3650],['THB','THB – Baht Thái',800],['SGD','SGD – Đô Singapore',20300],['AUD','AUD – Đô Úc',17200],['GBP','GBP – Bảng Anh',35000],['TWD','TWD – Đài tệ',830],['HKD','HKD – Đô Hồng Kông',3380]];
function fxRates(){try{return JSON.parse(localStorage.getItem('tc_fx_rates')||'{}')||{};}catch(e){return {};}}
function fxParse(v){v=String(v||'').replace(/\s/g,'');if(!v)return 0;if(/^\d{1,3}([.,]\d{3})+$/.test(v))return parseInt(v.replace(/[.,]/g,''));return parseFloat(v.replace(',','.'))||0;}
function fxInit(){const s=document.getElementById('fxCur');if(!s||s.options.length)return;s.innerHTML=FX_LIST.map(([c,n])=>'<option value="'+c+'">'+(c==='VND'?'VND':n)+'</option>').join('');}
function fxCur(){const s=document.getElementById('fxCur');return s?s.value:'VND';}
function fxChange(){
  fxInit();const cur=fxCur(),wrap=document.getElementById('fxWrap'),amt=document.getElementById('amountInput');
  if(cur==='VND'){wrap.style.display='none';amt.readOnly=false;amt.classList.remove('fx-lock');return;}
  wrap.style.display='flex';amt.readOnly=true;amt.classList.add('fx-lock');
  const r=document.getElementById('fxRate');const saved=fxRates()[cur];const def=(FX_LIST.find(x=>x[0]===cur)||[])[2]||0;
  r.value=fmtShort(saved||def);fxCalc();
}
function fxCalc(){
  const cur=fxCur();if(cur==='VND')return;
  const a=fxParse(document.getElementById('fxAmt').value),r=fxParse(document.getElementById('fxRate').value);
  document.getElementById('amountInput').value=a>0&&r>0?fmtShort(Math.round(a*r)):'';
  if(r>0){const m=fxRates();m[cur]=r;try{localStorage.setItem('tc_fx_rates',JSON.stringify(m));}catch(e){}}
}
function fxSet(cur,amt,rate){
  fxInit();const s=document.getElementById('fxCur');if(!s)return;
  s.value=cur||'VND';fxChange();
  if(cur&&cur!=='VND'){if(amt!=null)document.getElementById('fxAmt').value=String(amt).replace('.',',');if(rate)document.getElementById('fxRate').value=fmtShort(rate);fxCalc();}
  else document.getElementById('fxAmt').value='';
}
function txExtras(tx){
  const cur=fxCur();
  if(cur&&cur!=='VND'){const a=fxParse(document.getElementById('fxAmt').value),r=fxParse(document.getElementById('fxRate').value);if(a>0&&r>0){tx.fx={cur,amt:a,rate:r};return;}}
  delete tx.fx;
}
function editTxExtras(t){
  qeReset();
  if(t.fx&&t.fx.cur)fxSet(t.fx.cur,t.fx.amt,t.fx.rate);else fxSet('VND');
  const ob=document.getElementById('ocrBtn');if(ob)ob.style.display=t.receipt?'block':'none';
}
function onTypeExtras(t){
  const normal=t==='chi'||t==='thu';
  ['qeBar','qeHint','fxRow'].forEach(id=>{const e=document.getElementById(id);if(e)e.style.display=normal?'':'none';});
  if(!normal&&fxCur()!=='VND')fxSet('VND');
}

/* =====================================================================
   3. ĐỌC SỐ TIỀN TRÊN ẢNH HOÁ ĐƠN (Tesseract.js, tải lần đầu khi dùng)
   ===================================================================== */
function afterReceipt(){const b=document.getElementById('ocrBtn');if(b){b.style.display=receiptData?'block':'none';b.disabled=false;b.textContent='🔍 Đọc số tiền trên hoá đơn';}}
function loadScriptOnce(src){return new Promise((res,rej)=>{if(document.querySelector('script[data-src="'+src+'"]')){res();return;}const s=document.createElement('script');s.src=src;s.dataset.src=src;s.onload=()=>res();s.onerror=()=>rej(new Error('LOAD'));document.head.appendChild(s);});}
function parseReceiptTotal(text){
  const lines=String(text||'').split(/\n+/).map(l=>({o:l,n:normKeepLen(l)}));
  const KEY=/(tong cong|tong tien|tong thanh toan|thanh toan|tong|total|phai tra|can tra|thanh tien|cong)/;
  const BAD=/(tien thua|thoi lai|khach dua|tien khach|tien mat dua|giam gia|chiet khau|vat|thue|so luong|sl\b|ma so|hotline|dien thoai|tel|mst|so hd)/;
  const nums=l=>{const out=[];const re=/(\d{1,3}(?:[.,\s]\d{3})+|\d{4,9})(?!\d)/g;let m;while((m=re.exec(l))){const v=parseInt(m[1].replace(/[.,\s]/g,''));if(v>=1000&&v<=500000000)out.push(v);}return out;};
  let best=0;
  lines.forEach((L,i)=>{if(KEY.test(L.n)&&!BAD.test(L.n)){let v=nums(L.n);if(!v.length&&lines[i+1])v=nums(lines[i+1].n);v.forEach(x=>{if(x>best)best=x;});}});
  if(best)return best;
  lines.forEach(L=>{if(!BAD.test(L.n))nums(L.n).forEach(x=>{if(x>best)best=x;});});
  return best;
}
async function ocrReceipt(){
  const b=document.getElementById('ocrBtn');if(!receiptData||!b)return;
  if(!navigator.onLine){showMiniToast('Cần có mạng để đọc hoá đơn');return;}
  b.disabled=true;b.textContent='⏳ Đang đọc hoá đơn… (lần đầu cần tải bộ đọc chữ, hơi lâu)';
  let worker=null;
  try{
    await loadScriptOnce('https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js');
    worker=await Tesseract.createWorker('vie');
    const r=await worker.recognize(receiptData);
    const v=parseReceiptTotal(r&&r.data?r.data.text:'');
    if(v){fxSet('VND');document.getElementById('amountInput').value=fmtShort(v);showMiniToast('✓ Đã điền số tiền '+fmtShort(v)+' đ — hãy kiểm tra lại');}
    else showMiniToast('Không tìm thấy tổng tiền trên ảnh, hãy nhập tay');
  }catch(e){console.warn('OCR',e);showMiniToast('Không đọc được hoá đơn lúc này, hãy nhập tay');}
  finally{if(worker){try{await worker.terminate();}catch(e){}}b.disabled=false;b.textContent='🔍 Đọc số tiền trên hoá đơn';}
}

/* =====================================================================
   4. SAO LƯU TỰ ĐỘNG TRONG MÁY (IndexedDB) – mỗi 7 ngày 1 bản, giữ 8 bản gần nhất
   ===================================================================== */
const AUTO_BK_DAYS=7,AUTO_BK_KEEP=8;
async function makeBackup(label){
  if(!window.StcStore||!StcStore.available)throw new Error('NO_IDB');
  const data=buildCloudPayload();const size=JSON.stringify(data).length;
  const rec={id:Date.now(),at:Date.now(),label:label||'',n:txs.length,w:wallets.length,size,data};
  await StcStore.addBackup(rec);
  const all=await StcStore.listBackups();
  const old=all.filter(x=>x.label==='Tự động').slice(AUTO_BK_KEEP);
  for(const o of old){try{await StcStore.delBackup(o.id);}catch(e){}}
  const extra=all.filter(x=>x.label!=='Tự động').slice(6);
  for(const o of extra){try{await StcStore.delBackup(o.id);}catch(e){}}
  return rec;
}
async function autoBackupCheck(){
  if(!window.StcStore||!StcStore.available)return;
  if(!txs.length&&!wallets.length)return;
  let last=0;try{last=Number(localStorage.getItem('tc_auto_bk_at')||0);}catch(e){}
  if(Date.now()-last<AUTO_BK_DAYS*86400000)return;
  try{await makeBackup('Tự động');localStorage.setItem('tc_auto_bk_at',String(Date.now()));}catch(e){console.warn('autobackup',e);}
}
function fmtDT(ts){const d=new Date(ts);return d.toLocaleDateString('vi-VN')+' '+String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0');}
async function openBackups(){
  if(!window.StcStore||!StcStore.available){alert('Trình duyệt này không hỗ trợ sao lưu tự động. Hãy dùng "Sao lưu dữ liệu (JSON)".');return;}
  let list=[];try{list=await StcStore.listBackups();}catch(e){}
  openModal('<h3>🗂️ Bản sao lưu tự động</h3>'+
    '<p class="bk-p">App tự lưu 1 bản mỗi 7 ngày ngay trên máy này (giữ 8 bản gần nhất). Dùng khi lỡ xoá nhầm hoặc dữ liệu bị lỗi.</p>'+
    (list.length?'<div class="bk-list">'+list.map(b=>'<div class="bk-row"><div class="bk-l"><b>'+fmtDT(b.at)+'</b><small>'+(b.label?escH(b.label)+' · ':'')+b.n+' giao dịch · '+b.w+' ví · '+fmtKB(b.size)+'</small></div>'+
      '<div class="bk-act"><button onclick="restoreBackup('+b.id+')">Khôi phục</button><button onclick="downloadBackup('+b.id+')">Tải về</button></div></div>').join('')+'</div>'
      :'<div class="empty" style="padding:12px 0;">Chưa có bản sao lưu nào.</div>')+
    '<div class="edit-modal-actions"><button class="edit-modal-cancel" onclick="closeAppModal()">Đóng</button><button class="edit-modal-save" onclick="backupNow()">Sao lưu ngay</button></div>');
}
async function backupNow(){try{await makeBackup('Thủ công');localStorage.setItem('tc_auto_bk_at',String(Date.now()));showMiniToast('✓ Đã tạo bản sao lưu');openBackups();}catch(e){alert('Không tạo được bản sao lưu: '+(e&&e.message||e));}}
async function restoreBackup(id){
  const b=await StcStore.getBackup(id);if(!b||!b.data||!Array.isArray(b.data.txs)){alert('Bản sao lưu bị lỗi.');return;}
  if(!confirm('Khôi phục bản sao lưu lúc '+fmtDT(b.at)+' ('+b.n+' giao dịch)?\nDữ liệu hiện tại sẽ được lưu thành 1 bản "Trước khi khôi phục" để có thể quay lại.'))return;
  try{await makeBackup('Trước khi khôi phục');}catch(e){}
  applyCloudPayload(JSON.parse(JSON.stringify(b.data)));saveAll();closeAppModal();
  try{renderHome();const s=currentScreen();if(s!=='home')showScreen(s);}catch(e){}
  showMiniToast('✓ Đã khôi phục dữ liệu');
}
async function downloadBackup(id){const b=await StcStore.getBackup(id);if(!b)return;await downloadFile(JSON.stringify(b.data,null,2),'so-thu-chi-backup-'+new Date(b.at).toISOString().slice(0,10)+'.json','application/json');}

/* =====================================================================
   5. QUẢN LÝ HẠNG MỤC TỰ TẠO
   ===================================================================== */
let catMgrType='chi';
const EMOJI_PICK=['🍜','🍱','🍺','🥤','🍰','🛒','🚗','🛵','⛽','🚌','✈️','🏠','💡','📱','💻','🎮','🎬','🎵','📚','🎓','👶','🐶','🐱','🌿','💊','🏥','🏋️','⚽','👕','👟','💄','💇','🎁','💍','🙏','💰','💵','💳','🏦','📈','🧾','🔧','🧹','🧺','✂️','🎨','📷','🌸','⭐','📦'];
function ensureCC(type){if(!customCats||typeof customCats!=='object')customCats={};const c=customCats[type]=customCats[type]||{};if(!Array.isArray(c.groups))c.groups=[];if(!c.add||typeof c.add!=='object')c.add={};if(!Array.isArray(c.hidden))c.hidden=[];return c;}
function catSave(){rebuildGroups();saveAll();renderCatMgr();}
function setCatMgrType(t){catMgrType=t;document.getElementById('catMgrChi').classList.toggle('active',t==='chi');document.getElementById('catMgrThu').classList.toggle('active',t==='thu');renderCatMgr();}
function isCustomItem(type,g,it){const c=ccOf(type);const cg=c.groups.find(x=>x.name===g);if(cg)return true;return (c.add[g]||[]).some(x=>x[0]===it);}
function renderCatMgr(){
  const el=document.getElementById('catMgrList');if(!el)return;const type=catMgrType;
  el.innerHTML='<div class="loan-hint" style="margin-bottom:10px;">Bấm vào hạng mục để ẩn/hiện hoặc xoá. Hạng mục bị ẩn không hiện khi chọn, giao dịch cũ vẫn giữ nguyên.</div>'+
  (GROUPS[type]||[]).map(G=>{
    const gHidden=catHidden(type,G.name,G.single?G.name:'*');
    let h='<div class="cm-group'+(gHidden?' cm-off':'')+'"><div class="cm-head"><span class="cm-emo">'+escH(G.emoji)+'</span><b>'+escH(G.name)+'</b>'+(G.custom?'<span class="cm-tag">Tự tạo</span>':'')+(gHidden?'<span class="cm-tag off">Đang ẩn</span>':'')+
      '<span class="cm-acts">'+(type==='chi'&&!G.single?'<button onclick="openCatItemAdd(\''+escA(G.name)+'\')">+ Mục</button>':'')+
      '<button onclick="toggleCatHidden(\''+type+'\',\''+escA(G.name)+'\',\''+(G.single?escA(G.name):'*')+'\')">'+(gHidden?'Hiện':'Ẩn')+'</button>'+
      (G.custom?'<button class="cm-del" onclick="deleteCatGroup(\''+type+'\',\''+escA(G.name)+'\')">Xoá</button>':'')+'</span></div>';
    if(!G.single)h+='<div class="cm-items">'+G.items.map(it=>{const off=catHidden(type,G.name,it);return '<button class="cm-item'+(off?' off':'')+'" onclick="openCatItemMenu(\''+type+'\',\''+escA(G.name)+'\',\''+escA(it)+'\')"><span>'+escH(itemEmoji(type,G.name,it))+'</span>'+escH(it)+(off?' <small>(ẩn)</small>':'')+'</button>';}).join('')+'</div>';
    return h+'</div>';
  }).join('');
}
function toggleCatHidden(type,g,it){const c=ensureCC(type);const k=g+'|'+it;const i=c.hidden.indexOf(k);if(i>=0)c.hidden.splice(i,1);else c.hidden.push(k);catSave();}
function emojiPickerHtml(id,cur){return '<div class="emo-pick">'+EMOJI_PICK.map(e=>'<button type="button" class="'+(e===cur?'on':'')+'" onclick="document.getElementById(\''+id+'\').value=\''+e+'\';this.parentNode.querySelectorAll(\'button\').forEach(b=>b.classList.remove(\'on\'));this.classList.add(\'on\')">'+e+'</button>').join('')+'</div>';}
function validCatName(n){return n&&!/[|]/.test(n)&&n.length<=40;}
function openCatGroupAdd(){
  const type=catMgrType;
  openModal('<h3>Thêm nhóm '+(type==='chi'?'chi':'thu')+' mới</h3><div class="we-form">'+
    '<label>Tên nhóm</label><input id="cgName" class="we-in" type="text" maxlength="40">'+
    '<label>Biểu tượng</label><input id="cgEmo" class="we-in" type="text" maxlength="4" value="📁">'+emojiPickerHtml('cgEmo','📁')+
    (type==='chi'?'<label>Hạng mục đầu tiên trong nhóm (tuỳ chọn)</label><input id="cgItem" class="we-in" type="text" maxlength="40">':'')+
    '</div><div class="edit-modal-actions"><button class="edit-modal-cancel" onclick="closeAppModal()">Huỷ</button><button class="edit-modal-save" onclick="saveCatGroup()">Thêm nhóm</button></div>');
}
function saveCatGroup(){
  const type=catMgrType;const name=document.getElementById('cgName').value.trim();const emo=(document.getElementById('cgEmo').value.trim()||'📁');
  if(!validCatName(name)){alert('Tên nhóm không hợp lệ (không để trống, không dùng ký tự |).');return;}
  if((GROUPS[type]||[]).some(g=>g.name.toLowerCase()===name.toLowerCase())){alert('Đã có nhóm tên này.');return;}
  const c=ensureCC(type);const g={name,emoji:emo,items:[]};
  if(type==='chi'){const it=(document.getElementById('cgItem').value||'').trim();if(it){if(!validCatName(it)){alert('Tên hạng mục không hợp lệ.');return;}g.items.push([it,emo]);}}
  c.groups.push(g);closeAppModal();catSave();showMiniToast('✓ Đã thêm nhóm "'+name+'"');
}
function openCatItemAdd(g){
  openModal('<h3>Thêm hạng mục vào "'+escH(g)+'"</h3><div class="we-form">'+
    '<label>Tên hạng mục</label><input id="ciName" class="we-in" type="text" maxlength="40">'+
    '<label>Biểu tượng</label><input id="ciEmo" class="we-in" type="text" maxlength="4" value="📌">'+emojiPickerHtml('ciEmo','📌')+
    '</div><div class="edit-modal-actions"><button class="edit-modal-cancel" onclick="closeAppModal()">Huỷ</button><button class="edit-modal-save" onclick="saveCatItem(\''+escA(g)+'\')">Thêm</button></div>');
}
function saveCatItem(g){
  const name=document.getElementById('ciName').value.trim();const emo=(document.getElementById('ciEmo').value.trim()||'📌');
  if(!validCatName(name)){alert('Tên hạng mục không hợp lệ (không để trống, không dùng ký tự |).');return;}
  const G=GROUPS.chi.find(x=>x.name===g);if(!G)return;
  if(G.items.some(x=>x.toLowerCase()===name.toLowerCase())||name.toLowerCase()===g.toLowerCase()){alert('Nhóm này đã có hạng mục tên này.');return;}
  const c=ensureCC('chi');const cg=c.groups.find(x=>x.name===g);
  if(cg){cg.items=cg.items||[];cg.items.push([name,emo]);}else{(c.add[g]=c.add[g]||[]).push([name,emo]);}
  closeAppModal();catSave();showMiniToast('✓ Đã thêm "'+name+'"');
}
function openCatItemMenu(type,g,it){
  const off=catHidden(type,g,it),custom=isCustomItem(type,g,it);
  const used=txs.filter(t=>t.group===g&&t.item===it).length;
  openModal('<h3>'+escH(itemEmoji(type,g,it))+' '+escH(it)+'</h3><p class="bk-p">Nhóm: '+escH(g)+(used?' · đã dùng trong '+used+' giao dịch':'')+'</p>'+
    '<div class="cm-menu"><button onclick="closeAppModal();toggleCatHidden(\''+type+'\',\''+escA(g)+'\',\''+escA(it)+'\')">'+(off?'👁 Hiện lại hạng mục':'🙈 Ẩn hạng mục')+'</button>'+
    (custom?'<button class="cm-del" onclick="deleteCatItem(\''+type+'\',\''+escA(g)+'\',\''+escA(it)+'\')">🗑 Xoá hạng mục</button>':'')+'</div>'+
    '<div class="edit-modal-actions"><button class="edit-modal-cancel" onclick="closeAppModal()">Đóng</button></div>');
}
function deleteCatItem(type,g,it){
  if(!confirm('Xoá hạng mục "'+it+'"? Các giao dịch đã ghi vẫn giữ nguyên.'))return;
  const c=ensureCC(type);const cg=c.groups.find(x=>x.name===g);
  if(cg)cg.items=(cg.items||[]).filter(x=>x[0]!==it);else if(c.add[g])c.add[g]=c.add[g].filter(x=>x[0]!==it);
  c.hidden=c.hidden.filter(k=>k!==g+'|'+it);closeAppModal();catSave();
}
function deleteCatGroup(type,g){
  if(!confirm('Xoá nhóm "'+g+'" và các hạng mục trong nhóm? Các giao dịch đã ghi vẫn giữ nguyên.'))return;
  const c=ensureCC(type);c.groups=c.groups.filter(x=>x.name!==g);c.hidden=c.hidden.filter(k=>k.split('|')[0]!==g);catSave();
}

/* =====================================================================
   6. MỤC TIÊU TIẾT KIỆM (chỉ theo dõi, không trừ tiền ví)
   ===================================================================== */
function monthsLeft(deadline){if(!deadline)return 0;const t=new Date(todayStr()+'T00:00:00'),d=new Date(deadline+'T00:00:00');const m=(d.getFullYear()-t.getFullYear())*12+(d.getMonth()-t.getMonth())+(d.getDate()>=t.getDate()?0:-1);return Math.max(0,m);}
function renderGoals(){
  const el=document.getElementById('goalList');if(!el)return;
  if(!goals.length){el.innerHTML='<div class="empty">Chưa có mục tiêu nào.</div>';return;}
  el.innerHTML=goals.map(g=>{
    const pct=g.target>0?Math.min(100,Math.round((g.saved||0)/g.target*100)):0,remain=Math.max(0,(g.target||0)-(g.saved||0));
    let plan='';
    if(remain<=0)plan='<span class="gl-done">🎉 Đã đạt mục tiêu!</span>';
    else if(g.deadline){const m=monthsLeft(g.deadline);const left=daysBetween(todayStr(),g.deadline);
      plan=left<0?'<span class="gl-late">Đã quá hạn '+dmy(g.deadline)+'</span>':'Hạn '+dmy(g.deadline)+' · cần góp ~<b>'+fmtShort(Math.ceil(remain/Math.max(1,m)))+'</b>/tháng'+(m<1?' (tháng này)':'');}
    return '<div class="goal-card"><div class="gl-top"><span class="gl-emo">'+escH(g.emoji||'🎯')+'</span><div class="gl-t"><b>'+escH(g.name)+'</b><small>'+fmtShort(g.saved||0)+' / '+fmtShort(g.target||0)+' VND</small></div><span class="gl-pct">'+pct+'%</span></div>'+
      '<div class="bar-bg"><div class="bar-fill" style="width:'+pct+'%;background:var(--green)"></div></div>'+
      '<div class="gl-plan">'+(remain>0?'Còn thiếu <b>'+fmtShort(remain)+'</b> · ':'')+plan+'</div>'+
      '<div class="debt-actions"><button onclick="goalMove('+g.id+',1)">+ Góp thêm</button><button onclick="goalMove('+g.id+',-1)">− Rút bớt</button><button onclick="openGoalEdit('+g.id+')">Sửa</button><button onclick="deleteGoal('+g.id+')">Xoá</button></div></div>';
  }).join('');
}
function openGoalEdit(id){
  const g=id?goals.find(x=>x.id===id):null;
  openModal('<h3>'+(g?'Sửa mục tiêu':'Mục tiêu mới')+'</h3><div class="we-form">'+
    '<label>Tên mục tiêu</label><input id="glName" class="we-in" type="text" maxlength="50" value="'+escH(g?g.name:'')+'">'+
    '<label>Biểu tượng</label><input id="glEmo" class="we-in" type="text" maxlength="4" value="'+escH(g?g.emoji||'🎯':'🎯')+'">'+emojiPickerHtml('glEmo',g?g.emoji:'🎯')+
    '<label>Số tiền cần đạt (VND)</label><input id="glTarget" class="we-in" type="tel" inputmode="numeric" oninput="fmtInput(this)" value="'+(g?fmtShort(g.target):'')+'">'+
    (g?'':'<label>Đã có sẵn (VND, tuỳ chọn)</label><input id="glSaved" class="we-in" type="tel" inputmode="numeric" oninput="fmtInput(this)">')+
    '<label>Hạn hoàn thành (tuỳ chọn)</label><input id="glDeadline" class="we-in" type="date" value="'+(g&&g.deadline?g.deadline:'')+'">'+
    '</div><div class="edit-modal-actions"><button class="edit-modal-cancel" onclick="closeAppModal()">Huỷ</button><button class="edit-modal-save" onclick="saveGoal('+(g?g.id:0)+')">Lưu</button></div>');
}
function saveGoal(id){
  const name=document.getElementById('glName').value.trim(),target=numFromText(document.getElementById('glTarget').value);
  if(!name){alert('Vui lòng nhập tên mục tiêu');return;}if(target<=0){alert('Vui lòng nhập số tiền cần đạt');return;}
  const emoji=document.getElementById('glEmo').value.trim()||'🎯',deadline=document.getElementById('glDeadline').value||'';
  if(id){const g=goals.find(x=>x.id===id);if(!g)return;Object.assign(g,{name,emoji,target,deadline});}
  else{const saved=numFromText((document.getElementById('glSaved')||{}).value);goals.push({id:Date.now(),name,emoji,target,saved,deadline,created:todayStr(),history:saved?[{d:todayStr(),a:saved}]:[]});}
  saveAll();closeAppModal();renderGoals();try{renderHome();}catch(e){}
}
function goalMove(id,sign){
  const g=goals.find(x=>x.id===id);if(!g)return;
  const v=prompt((sign>0?'Góp thêm vào "':'Rút bớt khỏi "')+g.name+'" (VND):','');if(v===null)return;
  const a=numFromText(v);if(a<=0){alert('Số tiền không hợp lệ');return;}
  if(sign<0&&a>(g.saved||0)){alert('Số tiền rút lớn hơn số đã góp ('+fmtShort(g.saved||0)+').');return;}
  g.saved=(g.saved||0)+sign*a;(g.history=g.history||[]).push({d:todayStr(),a:sign*a});
  saveAll();renderGoals();try{renderHome();}catch(e){}
  if(sign>0&&g.saved>=g.target)showMiniToast('🎉 Chúc mừng! Đã đạt mục tiêu "'+g.name+'"');
}
function deleteGoal(id){const g=goals.find(x=>x.id===id);if(!g||!confirm('Xoá mục tiêu "'+g.name+'"?'))return;goals=goals.filter(x=>x.id!==id);saveAll();renderGoals();try{renderHome();}catch(e){}}

/* =====================================================================
   7. CHIA TIỀN NHÓM
   Mình trả: ghi phần của mình là khoản chi + mỗi người còn lại là 1 khoản "Cho vay".
   Người khác trả: ghi phần của mình là 1 khoản "Vay nợ khác" với người đã trả.
   ===================================================================== */
function splitNames(){return (document.getElementById('spNames').value||'').split(/[,;\n]+/).map(s=>s.trim()).filter(Boolean).filter((v,i,a)=>a.indexOf(v)===i);}
function openSplitBill(){
  const wl=getSpendableWallets();
  const cats=GROUPS.chi.flatMap(G=>visibleItems('chi',G).map(it=>'<option value="'+escH(G.name+'|||'+it)+'"'+(G.name==='Ăn uống'&&it==='Ăn tiệm'?' selected':'')+'>'+escH(G.name+' • '+it)+'</option>')).join('');
  openModal('<h3>👥 Chia tiền nhóm</h3><div class="we-form">'+
    '<label>Tổng hoá đơn (VND)</label><input id="spTotal" class="we-in" type="tel" inputmode="numeric" oninput="fmtInput(this);splitPreview()">'+
    '<label>Những người đi cùng (không tính mình, cách nhau dấu phẩy)</label><input id="spNames" class="we-in" type="text" oninput="splitPreview()">'+
    '<label>Ai đã trả tiền?</label><select id="spPayer" class="we-in" onchange="splitPreview()"><option value="__me">Mình trả</option></select>'+
    '<div id="spWalletWrap"><label>Trả từ ví</label><select id="spWallet" class="we-in">'+(wl.length?wl.map(w=>'<option value="'+w.id+'">'+escH(w.name)+'</option>').join(''):'<option value="">Chưa có ví</option>')+'</select></div>'+
    '<label>Hạng mục</label><select id="spCat" class="we-in">'+cats+'</select>'+
    '<label>Ngày</label><input id="spDate" class="we-in" type="date" value="'+todayStr()+'">'+
    '<label>Ghi chú</label><input id="spNote" class="we-in" type="text" maxlength="60">'+
    '<div id="spPreview" class="sp-preview"></div>'+
    '</div><div class="edit-modal-actions"><button class="edit-modal-cancel" onclick="closeAppModal()">Huỷ</button><button class="edit-modal-save" onclick="saveSplitBill()">Lưu</button></div>');
  splitPreview();
}
function splitCalc(total,n){const share=Math.floor(total/n);return {share,mine:total-share*(n-1)};}
function splitPreview(){
  const total=numFromText(document.getElementById('spTotal').value),names=splitNames(),sel=document.getElementById('spPayer');
  const cur=sel.value;sel.innerHTML='<option value="__me">Mình trả</option>'+names.map(n=>'<option value="'+escH(n)+'">'+escH(n)+' trả</option>').join('');
  sel.value=(cur==='__me'||names.includes(cur))?cur:'__me';
  document.getElementById('spWalletWrap').style.display=sel.value==='__me'?'':'none';
  const pv=document.getElementById('spPreview');
  if(!total||!names.length){pv.innerHTML='Nhập tổng tiền và tên người đi cùng để chia.';return;}
  const n=names.length+1,{share,mine}=splitCalc(total,n);
  pv.innerHTML='Chia '+n+' người: mỗi người <b>'+fmtShort(share)+'</b>'+(mine!==share?' (phần mình '+fmtShort(mine)+')':'')+'<br>'+
    (sel.value==='__me'?'→ Ghi chi phần của mình, '+names.map(escH).join(', ')+' mỗi người nợ bạn '+fmtShort(share)+' (vào mục Cho vay).':'→ Bạn nợ '+escH(sel.value)+' '+fmtShort(mine)+' (vào mục Vay nợ khác).');
}
function splitMakeDebt(dir,person,amount,date,note,walletId,idx){
  const d={id:Date.now()+idx,dir,person,amount,date,dueDate:addDays(date,7),note,status:'pending',sourceWalletId:walletId||null,outTxId:null,paidDate:null,paidWalletId:null};
  if(walletId){const t=Object.assign({id:Date.now()+Math.random(),amount,time:nowTime()},debtStartTx(d,walletId));txs.unshift(t);applyTxBalance(t);d.outTxId=t.id;}
  debts.push(d);return d;
}
function saveSplitBill(){
  const total=numFromText(document.getElementById('spTotal').value),names=splitNames(),payer=document.getElementById('spPayer').value;
  if(total<=0){alert('Vui lòng nhập tổng hoá đơn');return;}
  if(!names.length){alert('Vui lòng nhập tên người đi cùng');return;}
  const n=names.length+1,{share,mine}=splitCalc(total,n);
  const [g,it]=document.getElementById('spCat').value.split('|||');const G=GROUPS.chi.find(x=>x.name===g);
  const date=document.getElementById('spDate').value||todayStr(),noteRaw=document.getElementById('spNote').value.trim();
  const note='Chia tiền'+(noteRaw?': '+noteRaw:'')+' ('+n+' người)';
  if(payer==='__me'){
    const walletId=document.getElementById('spWallet').value;if(!walletId){alert('Vui lòng chọn ví đã trả');return;}
    const tx={id:Date.now()+Math.random(),type:'chi',amount:mine,group:g,item:it,icon:'e:'+itemEmoji('chi',g,it),accent:G?G.accent:'#7c8b98',bg:itemTint('chi',g,it),walletId,person:'',note,receipt:null,date,time:nowTime(),split:{total,n}};
    txs.unshift(tx);applyTxBalance(tx);try{awardBaseLinhThach(tx);}catch(e){}
    names.forEach((p,i)=>splitMakeDebt('out',p,share,date,note,walletId,i+1));
  }else{
    splitMakeDebt('in',payer,mine,date,note+' · '+it,null,1);
  }
  saveAll();closeAppModal();try{renderHome();}catch(e){}
  showMiniToast(payer==='__me'?'✓ Đã chia tiền, '+names.length+' người nợ bạn':'✓ Đã ghi bạn nợ '+payer+' '+fmtShort(mine));
}

/* =====================================================================
   8. BÁO CÁO MỞ RỘNG + CẢNH BÁO CHI TIÊU BẤT THƯỜNG
   ===================================================================== */
function prevRange(){
  const saved=reportRef,d=new Date(reportRef);
  if(reportPeriod==='day')d.setDate(d.getDate()-1);else if(reportPeriod==='week')d.setDate(d.getDate()-7);else if(reportPeriod==='month')d.setMonth(d.getMonth()-1);else d.setFullYear(d.getFullYear()-1);
  reportRef=d;let r;try{r=getRange();}finally{reportRef=saved;}return r;
}
function inDates(t,a,b){const d=new Date((t.date||'')+'T00:00:00');return d>=a&&d<=b;}
function walletBalanceHistory(months){
  /* Ước tính tổng số dư các ví ở cuối mỗi tháng: lấy số dư hiện tại trừ ngược các giao dịch phát sinh sau đó */
  const now=walletTotal();const wById=id=>wallets.find(w=>String(w.id)===String(id));const wByName=n=>wallets.find(w=>w.name===n);
  const eff=t=>{
    /* Thẻ tín dụng không nằm trong tổng số dư: chi bằng thẻ = 0, trả nợ thẻ (ví → thẻ) = trừ tiền ví */
    if(t.type==='transfer'){const f=isCredit(wByName(t.fromName)),to=isCredit(wByName(t.toName));return f===to?0:(to?-t.amount:t.amount);}
    if(t.walletId&&isCredit(wById(t.walletId)))return 0;
    if(!t.walletId&&t.type!=='family')return 0;if(t.type==='thu')return t.walletId?t.amount:0;if(t.type==='chi')return t.walletId?-t.amount:0;if(t.type==='family')return t.walletId?(t.dir==='in'?t.amount:-t.amount):0;return 0;};
  const out=[];const t0=new Date();
  for(let i=months-1;i>=0;i--){
    const end=new Date(t0.getFullYear(),t0.getMonth()-i+1,0);const endS=end.getFullYear()+'-'+String(end.getMonth()+1).padStart(2,'0')+'-'+String(end.getDate()).padStart(2,'0');
    const after=txs.filter(t=>(t.date||'')>endS).reduce((s,t)=>s+eff(t),0);
    out.push({label:'T'+(end.getMonth()+1),ym:endS.slice(0,7),v:now-after});
  }
  return out;
}
function reportExtras(inRange,start,end){
  const el=document.getElementById('repExtras');if(!el)return;
  const P=prevRange();const prev=txs.filter(t=>t.type==='chi'&&inDates(t,P.start,P.end));const cur=inRange.filter(t=>t.type==='chi');
  const by=(list)=>{const m={};list.forEach(t=>{const k=t.group||'Khác';m[k]=(m[k]||0)+t.amount;});return m;};
  const c=by(cur),p=by(prev);const keys=[...new Set(Object.keys(c).concat(Object.keys(p)))].sort((a,b)=>(c[b]||0)-(c[a]||0)||(p[b]||0)-(p[a]||0)).slice(0,10);
  let h='';
  h+='<div class="rep-card"><div class="rep-card-t">So với kỳ trước · chi theo nhóm</div>'+(keys.length?'<div class="cmp-list">'+keys.map(k=>{
    const a=c[k]||0,b=p[k]||0;let tag='';
    if(b>0){const d=Math.round((a-b)/b*100);tag=d===0?'<span class="cmp-eq">=</span>':'<span class="'+(d>0?'cmp-up':'cmp-down')+'">'+(d>0?'▲ ':'▼ ')+Math.abs(d)+'%</span>';}else if(a>0)tag='<span class="cmp-new">mới</span>';
    return '<div class="cmp-row"><span class="cmp-n">'+escH(k)+'</span><span class="cmp-v">'+fmtShort(a)+'<small>trước '+fmtShort(b)+'</small></span>'+tag+'</div>';}).join('')+'</div>':'<div class="empty">Chưa có dữ liệu để so sánh.</div>')+'</div>';
  const byW={};cur.forEach(t=>{const w=wallets.find(x=>String(x.id)===String(t.walletId));const k=w?w.name:'Không trừ ví';byW[k]=(byW[k]||0)+t.amount;});
  const wRows=Object.entries(byW).sort((a,b)=>b[1]-a[1]);const wMax=wRows.length?wRows[0][1]:1;
  h+='<div class="rep-card"><div class="rep-card-t">Chi theo ví</div>'+(wRows.length?wRows.map(([k,v])=>'<div class="hb-row"><span class="hb-n">'+escH(k)+'</span><span class="hb-bar"><i style="width:'+Math.max(2,Math.round(v/wMax*100))+'%"></i></span><span class="hb-v">'+fmtShort(v)+'</span></div>').join(''):'<div class="empty">Không có chi tiêu trong kỳ này.</div>')+'</div>';
  const byP={};cur.forEach(t=>{const k=(t.person||'').trim();if(k)byP[k]=(byP[k]||0)+t.amount;});
  const pRows=Object.entries(byP).sort((a,b)=>b[1]-a[1]).slice(0,8);
  if(pRows.length){const pMax=pRows[0][1];h+='<div class="rep-card"><div class="rep-card-t">Chi theo người/đối tượng</div>'+pRows.map(([k,v])=>'<div class="hb-row"><span class="hb-n">'+escH(k)+'</span><span class="hb-bar"><i style="width:'+Math.max(2,Math.round(v/pMax*100))+'%"></i></span><span class="hb-v">'+fmtShort(v)+'</span></div>').join('')+'</div>';}
  const hist=walletBalanceHistory(12);const mx=Math.max(1,...hist.map(x=>Math.abs(x.v)));
  h+='<div class="rep-card"><div class="rep-card-t">Tổng số dư các ví · 12 tháng <small class="rep-est">(ước tính từ giao dịch)</small></div><div class="bh-chart">'+hist.map(x=>'<div class="bh-col" title="'+x.label+': '+fmtShort(x.v)+'"><span class="bh-v">'+(Math.abs(x.v)>=1e6?(x.v/1e6).toFixed(1).replace('.0','')+'tr':fmtShort(Math.round(x.v/1000))+'k')+'</span><i class="'+(x.v<0?'neg':'')+'" style="height:'+Math.max(3,Math.round(Math.abs(x.v)/mx*100))+'%"></i><span class="bh-l">'+x.label+'</span></div>').join('')+'</div></div>';
  el.innerHTML=h;
}
function extraInsights(out,now){
  const today=todayStr(),from7=addDays(today,-6),fromPrev=addDays(today,-62),toPrev=addDays(today,-7);
  const m7={},mp={};
  txs.forEach(t=>{if(t.type!=='chi'||t.loanId||t.debtId)return;const d=t.date||'';const k=t.group||'Khác';
    if(d>=from7&&d<=today)m7[k]=(m7[k]||0)+t.amount;else if(d>=fromPrev&&d<=toPrev)mp[k]=(mp[k]||0)+t.amount;});
  const alerts=Object.keys(m7).map(k=>{const avg=(mp[k]||0)/8;return {k,now:m7[k],avg,pct:avg>0?Math.round((m7[k]-avg)/avg*100):0};})
    .filter(x=>x.avg>0&&x.pct>=40&&x.now-x.avg>=100000).sort((a,b)=>(b.now-b.avg)-(a.now-a.avg)).slice(0,2);
  alerts.forEach(x=>out.unshift({emoji:'⚠️',text:'7 ngày qua chi <b>'+escH(x.k)+'</b> '+fmt(x.now)+', cao hơn '+x.pct+'% so với trung bình mỗi tuần ('+fmt(Math.round(x.avg))+').'}));
}

/* =====================================================================
   9. TỔNG QUAN: nhắc ghi chép buổi tối + mục tiêu tiết kiệm
   ===================================================================== */
function homeExtras(){
  const inner=document.querySelector('#screen-home .inner');if(!inner)return;
  let box=document.getElementById('homeExtra');
  if(!box){box=document.createElement('div');box.id='homeExtra';inner.insertBefore(box,inner.firstChild);}
  let h='';
  const today=todayStr();let skip='';try{skip=localStorage.getItem('tc_remind_skip')||'';}catch(e){}
  if(new Date().getHours()>=19&&txs.length&&skip!==today&&!txs.some(t=>t.date===today)){
    h+='<div class="eve-card"><span>📝 Hôm nay bạn chưa ghi khoản thu chi nào.</span><button class="rc-pay" onclick="showScreen(\'add\')">Ghi ngay</button><button class="bw-x" onclick="try{localStorage.setItem(\'tc_remind_skip\',\''+today+'\')}catch(e){};homeExtras()" aria-label="Ẩn">✕</button></div>';
  }
  const active=goals.filter(g=>(g.saved||0)<(g.target||0));
  if(active.length){
    h+='<div class="goal-mini" onclick="showScreen(\'goals\')">'+active.slice(0,2).map(g=>{const pct=Math.min(100,Math.round((g.saved||0)/g.target*100));return '<div class="gm-row"><span>'+escH(g.emoji||'🎯')+' '+escH(g.name)+'</span><b>'+pct+'%</b><span class="gm-bar"><i style="width:'+pct+'%"></i></span></div>';}).join('')+'</div>';
  }
  box.innerHTML=h;
}

/* =====================================================================
   Gắn vào app
   ===================================================================== */
window.screenHooks={
  add:()=>{qeReset();fxSet('VND');const ob=document.getElementById('ocrBtn');if(ob)ob.style.display='none';onTypeExtras(currentType);},
  goals:renderGoals,
  cats:()=>setCatMgrType(catMgrType)
};
(function initFeatures(){
  fxInit();
  const set=(id,ic,txt)=>{const e=document.getElementById(id);if(e)e.innerHTML='<span>'+icon(ic,'#c29a5c',20)+'</span><span>'+txt+'</span>';};
  set('more-goals','trophy','Mục tiêu tiết kiệm');set('more-split','handshake','Chia tiền nhóm');set('more-cats','dots','Quản lý hạng mục');set('more-autobk','repeat','Bản sao lưu tự động');
  const ng=document.getElementById('nav-goals');if(ng)ng.innerHTML=icon('trophy','currentColor',20);
  document.querySelectorAll('.more-item').forEach(el=>el.style.gap='12px');
  try{renderHome();}catch(e){}
})();

/* =====================================================================
   v53: Sắp xếp các mục trong Cài đặt (kéo thả / ▲▼), lưu trên máy
   ===================================================================== */
const MORE_ORDER_DEFAULT=['more-sms','more-acc','more-budget','more-recur','more-hist','more-cats','more-goals','more-loans','more-debts','more-borrow','more-family','more-split','grp-backup','more-lock','more-bio','more-admin','grp-skin','grp-fs','more-mode','more-reward','more-chars','more-update'];
const MORE_NAMES={'more-sms':'Dán SMS ngân hàng','more-acc':'Quản lý ví tiền','more-budget':'Ngân sách','more-recur':'Thu chi định kỳ','more-hist':'Lịch sử giao dịch','more-cats':'Quản lý hạng mục','more-goals':'Mục tiêu tiết kiệm','more-loans':'Vay ngân hàng','more-debts':'Cho vay','more-borrow':'Vay nợ khác','more-family':'Tiền gia đình','more-split':'Chia tiền nhóm','grp-backup':'Sao lưu và đồng bộ','more-lock':'Tên đăng nhập & mật khẩu','more-bio':'Mở khoá bằng Face ID','more-admin':'Quản trị (Admin)','grp-skin':'Giao diện màu','grp-fs':'Cỡ chữ & số','more-mode':'Chế độ Tu tiên','more-reward':'Nuôi Linh Thú','more-chars':'Bộ sưu tập nhân vật','more-update':'Cập nhật app'};
function moreInner(){return document.querySelector('#screen-more .inner');}
function moreMovables(){const inner=moreInner();return inner?[...inner.children].filter(e=>e.id&&MORE_NAMES[e.id]):[];}
function getMoreOrder(){let o=null;try{o=JSON.parse(localStorage.getItem('tc_more_order')||'null');}catch(e){}
  if(!Array.isArray(o))o=MORE_ORDER_DEFAULT.slice();
  o=o.filter(id=>MORE_NAMES[id]);MORE_ORDER_DEFAULT.forEach(id=>{if(!o.includes(id))o.push(id);});return o;}
function applyMoreOrder(){const inner=moreInner();if(!inner)return;const anchor=document.getElementById('more-trash');const map={};moreMovables().forEach(e=>map[e.id]=e);
  getMoreOrder().forEach(id=>{if(map[id])inner.insertBefore(map[id],anchor);});}
function saveMoreOrder(o){try{localStorage.setItem('tc_more_order',JSON.stringify(o));}catch(e){}applyMoreOrder();}
function renderMoreSort(){const box=document.getElementById('moreSortList');if(!box)return;const o=getMoreOrder();
  box.innerHTML=o.map((id,i)=>'<div class="ms-row'+(/more-reward|more-chars/.test(id)?' tt-only':'')+'" data-id="'+id+'"><span class="ms-grip" aria-label="Kéo để di chuyển">≡</span><span class="ms-name">'+MORE_NAMES[id]+'</span>'+
    '<button class="ms-btn" '+(i===0?'disabled':'')+' onclick="moveMoreItem(\''+id+'\',-1)" aria-label="Lên">▲</button><button class="ms-btn" '+(i===o.length-1?'disabled':'')+' onclick="moveMoreItem(\''+id+'\',1)" aria-label="Xuống">▼</button></div>').join('');
  box.querySelectorAll('.ms-grip').forEach(g=>g.addEventListener('pointerdown',moreDragStart));}
function moveMoreItem(id,d){const o=getMoreOrder();const i=o.indexOf(id),j=i+d;if(i<0||j<0||j>=o.length)return;[o[i],o[j]]=[o[j],o[i]];saveMoreOrder(o);renderMoreSort();}
function resetMoreOrder(){try{localStorage.removeItem('tc_more_order');}catch(e){}applyMoreOrder();renderMoreSort();showMiniToast('Đã đưa về thứ tự gợi ý');}
function toggleMoreSort(){const inner=moreInner();const on=!inner.classList.contains('sorting');inner.classList.toggle('sorting',on);
  document.getElementById('moreSort').style.display=on?'block':'none';document.getElementById('moreSortBtn').textContent=on?'✓ Xong':'⇅ Sắp xếp';
  if(on)renderMoreSort();else applyMoreOrder();}
function moreDragStart(ev){const row=ev.target.closest('.ms-row');if(!row)return;ev.preventDefault();const box=row.parentNode;row.classList.add('dragging');
  const move=e=>{const y=e.clientY;const rows=[...box.querySelectorAll('.ms-row')].filter(r=>r!==row&&r.offsetParent!==null);
    let before=null;for(const r of rows){const b=r.getBoundingClientRect();if(y<b.top+b.height/2){before=r;break;}}
    if(before)box.insertBefore(row,before);else box.appendChild(row);};
  const up=()=>{window.removeEventListener('pointermove',move);window.removeEventListener('pointerup',up);window.removeEventListener('pointercancel',up);row.classList.remove('dragging');
    saveMoreOrder([...box.querySelectorAll('.ms-row')].map(r=>r.dataset.id));renderMoreSort();};
  window.addEventListener('pointermove',move);window.addEventListener('pointerup',up);window.addEventListener('pointercancel',up);}
try{applyMoreOrder();}catch(e){}

/* =====================================================================
   Kiểm thử tự động (gọi từ tests/run.js)
   ===================================================================== */
window.__extraTests=async function(){
  const R=[];const t=(name,ok,extra)=>R.push({name,ok:!!ok,extra});
  const P=s=>qeParse(s);
  let r=P('cafe 35k');t('nhập nhanh: cafe 35k',r.item==='Cafe'&&r.amount===35000&&r.type==='chi',r);
  r=P('xăng 80k hôm qua');t('nhập nhanh: xăng hôm qua',r.item==='Xăng xe'&&r.amount===80000&&r.date===addDays(todayStr(),-1),r);
  r=P('lương 15tr');t('nhập nhanh: lương 15tr',r.type==='thu'&&r.item==='Lương'&&r.amount===15000000,r);
  r=P('ăn trưa 45.000');t('nhập nhanh: 45.000',r.item==='Ăn trưa'&&r.amount===45000,r);
  r=P('1tr2 học phí');t('nhập nhanh: 1tr2',r.item==='Học phí'&&r.amount===1200000,r);
  r=P('grab 32');t('nhập nhanh: grab 32',r.item==='Taxi/thuê xe'&&r.amount===32000,r);
  r=P('phở 40 nghìn');t('nhập nhanh: phở 40 nghìn',r.item==='Ăn sáng'&&r.amount===40000,r);
  r=P('tiền nhà 3 triệu');t('nhập nhanh: tiền nhà',r.item==='Thuê nhà'&&r.amount===3000000,r);
  r=P('20 usd ăn tối');t('nhập nhanh: ngoại tệ',r.fx&&r.fx.cur==='USD'&&r.fx.amt===20&&r.item==='Ăn tối',r);
  r=P('mua quà sinh nhật mẹ 500k 12/9');t('nhập nhanh: ngày 12/9 + ghi chú',r.amount===500000&&r.item==='Biếu tặng'&&r.date&&r.date.slice(5)==='09-12'&&/mẹ/.test(r.note),r);
  t('đọc hoá đơn: tổng tiền',parseReceiptTotal('CUA HANG ABC\nCa phe sua 2 x 25.000 50.000\nTong cong: 85.000\nTien khach dua 100.000\nTien thua 15.000')===85000);
  if(window.StcZip&&StcZip.supported){const s=JSON.stringify({a:'Tiếng Việt có dấu ✓',n:[1,2,3]}).repeat(50);const z=await StcZip.gzipB64(s);t('nén cloud khứ hồi',(await StcZip.gunzipB64(z))===s&&z.length<s.length);}
  if(window.StcStore&&StcStore.available){await storeFlush();const st=await StcStore.get('state');t('IndexedDB đã lưu',st&&st.data&&st.data.txs.length===txs.length,st&&st.data?st.data.txs.length:null);
    const b=await makeBackup('Kiểm thử');const bl=await StcStore.listBackups();t('tạo bản sao lưu',bl.some(x=>x.id===b.id));await StcStore.delBackup(b.id);}
  const saveCC=JSON.stringify(customCats);
  ensureCC('chi').groups.push({name:'Thú cưng',emoji:'🐶',items:[['Thức ăn mèo','🐱']]});ensureCC('chi').add['Ăn uống']=[['Trà đá','🧊']];rebuildGroups();
  t('hạng mục tự tạo: nhóm mới',GROUPS.chi.some(g=>g.name==='Thú cưng'&&g.items.includes('Thức ăn mèo'))&&GROUPS.chi[GROUPS.chi.length-1].name==='Khác');
  t('hạng mục tự tạo: thêm mục',GROUPS.chi.find(g=>g.name==='Ăn uống').items.includes('Trà đá'));
  r=P('trà đá 5k');t('nhập nhanh nhận hạng mục tự tạo',r.item==='Trà đá'&&r.amount===5000,r);
  ensureCC('chi').hidden.push('Ăn uống|Cafe');t('ẩn hạng mục',!visibleItems('chi',GROUPS.chi.find(g=>g.name==='Ăn uống')).includes('Cafe'));
  customCats=JSON.parse(saveCC);rebuildGroups();
  const w1=wallets[0],b0=w1.balance,d0=debts.length;
  openSplitBill();document.getElementById('spTotal').value='300.000';document.getElementById('spNames').value='An, Bình';splitPreview();document.getElementById('spWallet').value=String(w1.id);saveSplitBill();
  t('chia tiền: trừ đủ tổng hoá đơn',w1.balance===b0-300000,[b0,w1.balance]);
  t('chia tiền: 2 người nợ mình',debts.length===d0+2&&debts.slice(-2).every(d=>d.amount===100000&&d.dir==='out'));
  const g0=goals.length;goals.push({id:Date.now(),name:'Test',emoji:'🎯',target:1000000,saved:0,deadline:'',history:[]});renderGoals();
  t('mục tiêu tiết kiệm hiển thị',document.querySelectorAll('#goalList .goal-card').length===g0+1);goals.pop();saveAll();
  showScreen('add');setType('chi');fxSet('USD',10,26000);t('ngoại tệ quy đổi',document.getElementById('amountInput').value===fmtShort(260000),document.getElementById('amountInput').value);
  const tx={};txExtras(tx);t('ngoại tệ lưu vào giao dịch',tx.fx&&tx.fx.cur==='USD'&&tx.fx.amt===10&&tx.fx.rate===26000,tx);fxSet('VND');
  try{showScreen('report');reportExtras(txs,new Date(2000,0,1),new Date());t('báo cáo mở rộng',document.querySelectorAll('#repExtras .rep-card').length>=3);}catch(e){t('báo cáo mở rộng',false,e.message);}
  showScreen('cats');t('màn quản lý hạng mục',document.querySelectorAll('#catMgrList .cm-group').length===GROUPS.chi.length);
  showScreen('home');
  return R;
};
