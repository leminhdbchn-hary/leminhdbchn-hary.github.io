/* ---------- DATA ---------- */
const BANKS=[{code:'AGB',name:'Agribank',color:'#8b1e2f'},{code:'VCB',name:'Vietcombank',color:'#00733e'},{code:'BIDV',name:'BIDV',color:'#0a4f8c'},{code:'MB',name:'MB Bank (Quân đội)',color:'#c8102e'},{code:'CTG',name:'VietinBank',color:'#0033a0'},{code:'TCB',name:'Techcombank',color:'#e4032e'},{code:'ACB',name:'ACB',color:'#003da5'},{code:'SHB',name:'SHB',color:'#f7941d'},{code:'MSB',name:'MSB (Hàng Hải)',color:'#f36f21'},{code:'CB',name:'CB Bank (Xây dựng)',color:'#1b6fb5'},{code:'OJB',name:'Oceanbank',color:'#0a4f8c'},{code:'GPB',name:'GPBank',color:'#009944'},{code:'VPB',name:'VPBank',color:'#00a651'},{code:'STB',name:'Sacombank',color:'#0066b3'},{code:'SCB',name:'SCB (Sài Gòn)',color:'#004b93'},{code:'EIB',name:'Eximbank',color:'#f7941d'},{code:'HDB',name:'HDBank',color:'#e2231a'},{code:'PVC',name:'PVcomBank',color:'#004b93'},{code:'TPB',name:'TPBank',color:'#7b2d8e'},{code:'VIB',name:'VIB',color:'#1b75bc'},{code:'OCB',name:'OCB (Phương Đông)',color:'#00335c'},{code:'LPB',name:'LPBank',color:'#e2231a'},{code:'DAB',name:'DongABank',color:'#f7941d'},{code:'SEA',name:'SeABank',color:'#7b2d8e'},{code:'BAB',name:'Bac A Bank',color:'#009944'},{code:'ABB',name:'ABBANK',color:'#f9a51a'},{code:'BVB',name:'BaoVietBank',color:'#f4b400'},{code:'VAB',name:'VietABank',color:'#0a4f8c'},{code:'VBB',name:'VietBank',color:'#009944'},{code:'SGB',name:'Saigonbank',color:'#0066b3'},{code:'NAB',name:'Nam A Bank',color:'#f36f21'},{code:'NCB',name:'NCB',color:'#00a99d'},{code:'PGB',name:'PG Bank',color:'#f7941d'},{code:'CITI',name:'Citibank',color:'#003b70'},{code:'HSBC',name:'HSBC',color:'#db0011'},{code:'SHBVN',name:'Shinhan Bank',color:'#0033a0'}];
const WTYPES=[{id:'cash',name:'Tiền mặt',color:'#22a765'},{id:'bank',name:'Ngân hàng',color:'#1487d8'},{id:'ewallet',name:'Ví điện tử',color:'#f7941d'},{id:'credit',name:'Thẻ tín dụng',color:'#e0483c'},{id:'saving',name:'Tiết kiệm',color:'#7b2d8e'}];
const GROUPS={
  chi:[
    {name:'Ăn uống',icon:'anuong',accent:'#22a765',bg:'#dcefe4',items:['Ăn sáng','Ăn trưa','Ăn tối','Cà phê']},
    {name:'Di chuyển',icon:'dichuyen',accent:'#c9860b',bg:'#fdf1cf',items:['Xăng xe','Taxi','Grab','Gửi xe']},
    {name:'Gia đình',icon:'house',accent:'#1487d8',bg:'#dceeff',items:['Điện','Nước','Internet','Mua sắm','Y tế','Giáo dục']},
    {name:'Cá nhân',icon:'user',accent:'#7b2d8e',bg:'#efe0f7',items:['Quần áo','Mỹ phẩm','Giải trí','Du lịch','Thể thao','Sức khỏe']},
    {name:'Khác',icon:'khac',accent:'#7c8b98',bg:'#e7e9ee',items:['Khác']}
  ],
  thu:[{name:'Thu nhập',icon:'luong',accent:'#22a765',bg:'#dcefe4',items:['Lương','Thưởng','Được cho/tặng','Thu hồi nợ','Khác']}]
};
const ICONS={
  handshake:'<path d="M11 17l2 2a1.4 1.4 0 002-2"/><path d="M14 14l2.5 2.5a1.4 1.4 0 002-2l-3.9-3.9a2.8 2.8 0 00-4 0l-.9.9a1.4 1.4 0 01-2-2l2.8-2.8a4 4 0 015.2-.4l.5.4"/><path d="M21 11l-2 1"/><path d="M3 11l5 5 1 1a1.4 1.4 0 002-2"/><path d="M3 5l3 3 3-2"/><path d="M21 5l-3 3"/>',
  lock:'<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 018 0v4"/><circle cx="12" cy="16" r="1.3"/>',
  paw:'<circle cx="7" cy="9" r="2"/><circle cx="12" cy="6" r="2"/><circle cx="17" cy="9" r="2"/><path d="M8 17c0-3 1.8-5 4-5s4 2 4 5c0 1.7-1.4 2.5-4 2.5S8 18.7 8 17z"/>',
  anuong:'<path d="M3 11h18"/><path d="M4 11a8 8 0 0016 0"/><path d="M9 5l1-3M15 5l-1-3"/>',
  dichuyen:'<rect x="2" y="11" width="20" height="6" rx="2"/><path d="M5 11l2-5h10l2 5"/><circle cx="7" cy="18" r="1.4"/><circle cx="17" cy="18" r="1.4"/>',
  house:'<path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/><path d="M9 20v-6h6v6"/>',
  user:'<circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 4-6 8-6s8 2 8 6"/>',
  khac:'<path d="M4 20l4-1 11-11a2 2 0 000-3l-1-1a2 2 0 00-3 0L4 15l-1 5z"/>',
  luong:'<rect x="3" y="7" width="18" height="12" rx="2"/><path d="M3 10h18"/><circle cx="17" cy="14" r="1.4"/>',
  bank:'<path d="M3 10l9-6 9 6"/><path d="M4 10v9h16v-9"/><path d="M9 10v9M15 10v9"/><path d="M2 22h20"/>',
  wallet:'<rect x="3" y="6" width="18" height="13" rx="2"/><path d="M3 10h18"/><circle cx="16" cy="14" r="1.3"/>',
  home:'<path d="M3 11l9-8 9 8"/><path d="M5 10v10h5v-6h4v6h5V10"/>',
  chart:'<path d="M4 20V10"/><path d="M10 20V4"/><path d="M16 20v-7"/><path d="M2 20h20"/>',
  gear:'<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>',
  dots:'<circle cx="5" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="19" cy="12" r="1.6"/>',
  clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/>',
  trash:'<path d="M4 7h16M9 7V5a1 1 0 011-1h4a1 1 0 011 1v2m2 0-1 13a2 2 0 01-2 2H9a2 2 0 01-2-2L6 7"/>',
  transfer:'<path d="M7 7h13l-4-4"/><path d="M17 17H4l4 4"/>',
  repeat:'<path d="M17 2l4 4-4 4"/><path d="M3 12v-2a4 4 0 014-4h14"/><path d="M7 22l-4-4 4-4"/><path d="M21 12v2a4 4 0 01-4 4H3"/>',
  download:'<path d="M12 3v12"/><path d="M7 10l5 5 5-5"/><path d="M5 21h14"/>',
  upload:'<path d="M12 21V9"/><path d="M7 14l5-5 5 5"/><path d="M5 3h14"/>',
  piggy:'<path d="M4 12a7 7 0 0113-3l2-1v3l-2 1a7 7 0 01-1 3v2a1 1 0 01-1 1h-2v-2h-3v2H8a1 1 0 01-1-1v-2a7 7 0 01-3-3z"/><circle cx="15" cy="10" r="0.6"/>',
  trophy:'<path d="M7 4h10v3a5 5 0 01-10 0V4z"/><path d="M7 5H4a3 3 0 003 3"/><path d="M17 5h3a3 3 0 01-3 3"/><path d="M10 14h4v3h-4z"/><path d="M8 20h8"/><path d="M12 17v3"/>'
};
function icon(name,color,size){return '<svg viewBox="0 0 24 24" width="'+(size||20)+'" height="'+(size||20)+'" fill="none" stroke="'+color+'" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">'+(ICONS[name]||ICONS.khac)+'</svg>';}
function fmt(n){return Number(n||0).toLocaleString('vi-VN')+' 💎';}
function fmtShort(n){return Number(n||0).toLocaleString('vi-VN');}
function attachThousandFormat(el){el.addEventListener('input',()=>{const d=el.value.replace(/\D/g,'');el.value=d?Number(d).toLocaleString('vi-VN'):'';});}
function todayStr(){const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');}
function nowTime(){const d=new Date();return String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0');}
function ym(dateStr){return dateStr.slice(0,7);}

/* ---------- GIAO DIỆN SÁNG / TỐI ---------- */
function applyTheme(){document.documentElement.removeAttribute('data-theme');return;
  let mode='system';
  try{mode=localStorage.getItem('tc_theme')||'system';}catch(e){}
  if(mode==='light'||mode==='dark')document.documentElement.setAttribute('data-theme',mode);
  else document.documentElement.removeAttribute('data-theme');
  document.querySelectorAll('#themeToggle button').forEach(b=>b.classList.toggle('active',b.dataset.th===mode));
}
function setTheme(mode){try{localStorage.setItem('tc_theme',mode);}catch(e){}applyTheme();}

/* ---------- STATE ---------- */
let txs=[],wallets=[],budgets={},recurring=[];
try{txs=JSON.parse(localStorage.getItem('tc_txs')||'[]');}catch(e){txs=[];}
try{wallets=JSON.parse(localStorage.getItem('tc_wallets')||'[]');}catch(e){wallets=[];}
try{budgets=JSON.parse(localStorage.getItem('tc_budgets')||'{}');}catch(e){budgets={};}
try{recurring=JSON.parse(localStorage.getItem('tc_recurring')||'[]');}catch(e){recurring=[];}
let debts=[];
try{debts=JSON.parse(localStorage.getItem('tc_debts')||'[]');}catch(e){debts=[];}
let loans=[];
try{loans=JSON.parse(localStorage.getItem('tc_loans')||'[]');}catch(e){loans=[];}
/* Ví "Tiết kiệm" bị khoá khỏi các thao tác chi tiêu/chuyển tiền thủ công.
   Toàn bộ tiền vào/ra sổ tiết kiệm chỉ được xử lý qua màn hình Ví tiền
   (gửi mới, đáo hạn, tất toán...) để tránh làm sai lệch lãi suất/kỳ hạn. */
function getSpendableWallets(){return wallets.filter(w=>w.type!=='saving');}

/* ---------- SAVING POINTS / REWARD STATE ---------- */
const PET_STAGES=[
  {name:'Ngưng Khí (Luyện Khí)',required:0,step:1,desc:'Linh khí khởi động · Thức tỉnh bản năng tu luyện'},
  {name:'Trúc Cơ',required:5,step:1,desc:'Linh căn hình thành · Cơ thể dần cường đại'},
  {name:'Kết Đan',required:15,step:1,desc:'Đan điền mở ra · Linh lực tụ thành đan'},
  {name:'Nguyên Anh',required:30,step:1,desc:'Nguyên anh xuất hiện · Tiên lực gia tăng'},
  {name:'Hóa Thần',required:50,step:1,desc:'Hóa thần thành hình · Thần pháp phiêu diêu'},
  {name:'Anh Biến',required:80,step:1,desc:'Thể chất biến đổi · Linh lực thăng hoa'},
  {name:'Vấn Đỉnh',required:120,step:1,desc:'Vấn đỉnh thiên địa · Chạm đến đỉnh cao'},
  {name:'Khuy Niết',required:170,step:2,desc:'Buông bỏ chấp niệm · Tâm cảnh thanh tịnh'},
  {name:'Tịnh Niết',required:240,step:2,desc:'Tịnh niết tâm hồn · Linh lực vô hạn'},
  {name:'Toái Niết',required:330,step:2,desc:'Phá vỡ giới hạn · Tái tạo bản thân'},
  {name:'Không Niết',required:440,step:3,desc:'Không niết vô ngã · Bất sinh bất diệt'},
  {name:'Không Linh',required:580,step:3,desc:'Linh thể vô hạn · Hội tụ thiên địa'},
  {name:'Không Huyền',required:760,step:3,desc:'Không huyền vô tận · Thấu suốt vạn pháp'},
  {name:'Không Kiếp',required:1000,step:3,desc:'Không kiếp hoàn nguyên · Vượt qua luân hồi'}
];
const ACHIEVEMENTS=PET_STAGES.slice(1).map((a,i)=>({code:'cg_'+(i+2),name:a.name,required:a.required,idx:i+1}));
const DAILY_REWARD_LIMIT=5;
let rewardProfile={total_points:0,current_streak:0,longest_streak:0,last_reward_date:null};
let rewardHistory=[],userAchievements=[];
try{rewardProfile=JSON.parse(localStorage.getItem('tc_reward_profile')||'null')||rewardProfile;}catch(e){}
try{rewardHistory=JSON.parse(localStorage.getItem('tc_reward_history')||'[]');}catch(e){rewardHistory=[];}
try{userAchievements=JSON.parse(localStorage.getItem('tc_user_achievements')||'[]');}catch(e){userAchievements=[];}

function saveAll(){
  try{localStorage.setItem('tc_txs',JSON.stringify(txs));}catch(e){}
  try{localStorage.setItem('tc_wallets',JSON.stringify(wallets));}catch(e){}
  try{localStorage.setItem('tc_budgets',JSON.stringify(budgets));}catch(e){}
  try{localStorage.setItem('tc_recurring',JSON.stringify(recurring));}catch(e){}
  try{localStorage.setItem('tc_debts',JSON.stringify(debts));}catch(e){}
  try{localStorage.setItem('tc_loans',JSON.stringify(loans));}catch(e){}
  try{localStorage.setItem('tc_reward_profile',JSON.stringify(rewardProfile));}catch(e){}
  try{localStorage.setItem('tc_reward_history',JSON.stringify(rewardHistory));}catch(e){}
  try{localStorage.setItem('tc_user_achievements',JSON.stringify(userAchievements));}catch(e){}
}

let currentType='chi', selectedGroup=null, selectedItem=null, receiptData=null, editingTxId=null;

/* ---------- SỬA GIAO DỊCH ---------- */
function resetEditUI(){
  editingTxId=null;
  const ti=document.getElementById('addScreenTitle');if(ti)ti.textContent='Thêm giao dịch';
  const bt=document.getElementById('saveTxBtn');if(bt)bt.textContent='Lưu lại';
  const cb=document.getElementById('cancelEditBtn');if(cb)cb.style.display='none';
}
function openEditTx(id){
  const t=txs.find(x=>x.id===id);
  if(!t)return;
  if(t.loanId&&(t.item==='Trả nợ gốc vay'||t.item==='Trả lãi vay')){alert('Giao dịch trả nợ vay được sửa trong mục "Vay ngân hàng" (bấm ✎ ở lịch sử trả nợ) để dư nợ luôn khớp.');showScreen('loans');return;}
  showScreen('add'); // reset về mặc định trước, rồi ghi đè bên dưới
  editingTxId=id;
  setType(t.type==='transfer'?'transfer':t.type);
  document.getElementById('amountInput').value=fmtShort(t.amount);
  document.getElementById('dateInput').value=t.date||todayStr();
  document.getElementById('timeInput').value=t.time||nowTime();
  document.getElementById('noteInput').value=t.note||'';
  if(t.type==='transfer'){
    const from=wallets.find(w=>w.name===t.fromName), to=wallets.find(w=>w.name===t.toName);
    if(from)document.getElementById('xferFrom').value=from.id;
    if(to)document.getElementById('xferTo').value=to.id;
  }else{
    selectedGroup=t.group;selectedItem=t.item;
    renderGroupChips();renderItemGrid();
    if(t.walletId)document.getElementById('accSelect').value=t.walletId;
    document.getElementById('personInput').value=t.person||'';
    const rp=document.getElementById('receiptPreview'), ri=document.getElementById('receiptInput');
    if(t.receipt){receiptData=t.receipt;rp.src=t.receipt;rp.style.display='block';}
    else{receiptData=null;rp.style.display='none';if(ri)ri.value='';}
  }
  document.getElementById('addScreenTitle').textContent='Sửa giao dịch';
  document.getElementById('saveTxBtn').textContent='Cập nhật giao dịch';
  document.getElementById('cancelEditBtn').style.display='block';
}
function cancelEditTx(){
  resetEditUI();
  document.getElementById('amountInput').value='';document.getElementById('noteInput').value='';document.getElementById('personInput').value='';
  receiptData=null;
  showScreen('history');
}

/* ---------- NAV ---------- */
const TAB_SCREENS=['home','accounts','report','more'];
let navStack=[];
function currentScreen(){const a=document.querySelector('.screen.active');return a?a.id.replace('screen-',''):'home';}
function goBack(){
  const cur=currentScreen();
  if(cur==='add'&&editingTxId){resetEditUI();}
  const prev=navStack.pop();
  showScreen(prev||(cur==='add'?'home':'more'),true);
}
function showScreen(name,isBack){
  const cur=currentScreen();
  if(!isBack&&cur!==name){if(TAB_SCREENS.includes(name))navStack=[];else{navStack.push(cur);if(navStack.length>20)navStack.shift();}}
  window.scrollTo(0,0);
  document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));
  document.getElementById('screen-'+name).classList.add('active');
  document.querySelectorAll('.tab').forEach(t=>t.classList.remove('active'));
  const t=document.querySelector('.tab[data-s="'+name+'"]');if(t)t.classList.add('active');
  if(name==='add'){resetEditUI();document.getElementById('dateInput').value=todayStr();document.getElementById('timeInput').value=nowTime();renderWalletSelects();renderGroupChips();renderItemGrid();}
  if(name==='home')renderHome();
  if(name==='history')renderHistory();
  if(name!=='accounts'){const af=document.getElementById('addAccForm');if(af&&af.style.display!=='none')cancelAccForm();}
  if(name==='accounts')renderAccounts();
  if(name==='report')renderReport();
  if(name==='budget')renderBudget();
  if(name==='recurring')renderRecurring();
  if(name==='debts')renderDebts();
  if(name==='loans')renderLoans();
  if(name==='reward')renderReward();
  if(name==='more')updateLockMenu();
  if(name==='chars')renderChars();
}

/* ---------- WALLETS ---------- */
function walletTotal(){return wallets.reduce((s,w)=>s+w.balance,0);}
function renderWTypeGrid(selected){
  const g=document.getElementById('wtypeGrid');
  g.innerHTML=WTYPES.map(w=>'<div class="wtype-btn'+(selected===w.id?' selected':'')+'" onclick="selectWType(\''+w.id+'\')">'+w.name+'</div>').join('');
}
let selectedWType='cash';
function selectWType(id){
  selectedWType=id;renderWTypeGrid(id);
  const bs=document.getElementById('bankSelect'),nm=document.getElementById('accNameInput');
  if(id==='bank'){bs.style.display='block';nm.style.display='none';}
  else{bs.style.display='none';nm.style.display='block';nm.placeholder=WTYPES.find(w=>w.id===id).name+' (đặt tên, VD: Ví Momo)';}
  const sf=document.getElementById('savingFields');
  if(id==='saving'){
    sf.style.display='block';nm.placeholder='Tên sổ tiết kiệm (VD: Sổ TK Vietcombank)';
    document.getElementById('savDate').value=todayStr();
    populateSavBankSelect();renderSavSourceWalletSelect();
  }
  else{sf.style.display='none';}
}
function populateSavBankSelect(){document.getElementById('savBank').innerHTML='<option value="">-- Không chọn --</option>'+BANKS.map((b,i)=>'<option value="'+i+'">'+b.name+'</option>').join('');}
function renderSavSourceWalletSelect(){
  const opts='<option value="">-- Không chọn --</option>'+getSpendableWallets().map(w=>'<option value="'+w.id+'">'+w.name+' ('+fmt(w.balance)+')</option>').join('');
  document.getElementById('savSourceWallet').innerHTML=opts;
}
function renderDebtSourceWalletSelect(){
  const opts='<option value="">-- Không trừ ví nào --</option>'+getSpendableWallets().map(w=>'<option value="'+w.id+'">'+w.name+' ('+fmt(w.balance)+')</option>').join('');
  document.getElementById('debtSourceWallet').innerHTML=opts;
}
function populateBankSelect(){document.getElementById('bankSelect').innerHTML='<option value="">-- Chọn ngân hàng --</option>'+BANKS.map((b,i)=>'<option value="'+i+'">'+b.name+'</option>').join('');}
function onBankChange(){}
function toggleAccForm(){const f=document.getElementById('addAccForm');const open=f.style.display==='none';f.style.display=open?'block':'none';const tb=document.getElementById('accToggleBtn');if(tb)tb.style.display=open?'none':'block';if(open){renderWTypeGrid('cash');selectWType('cash');}}
function cancelAccForm(){['accNameInput','accBalInput','savRate','savNote'].forEach(id=>{const e=document.getElementById(id);if(e)e.value='';});const f=document.getElementById('addAccForm');if(f.style.display!=='none')toggleAccForm();}
function saveAccount(){
  const bal=parseInt(document.getElementById('accBalInput').value.replace(/\D/g,''))||0;
  let name,code,color;
  if(selectedWType==='bank'){
    const v=document.getElementById('bankSelect').value;
    if(v===''){alert('Vui lòng chọn ngân hàng');return;}
    const b=BANKS[parseInt(v)];name=b.name;code=b.code;color=b.color;
  }else{
    name=document.getElementById('accNameInput').value.trim();
    if(!name){alert('Vui lòng đặt tên ví');return;}
    const wt=WTYPES.find(w=>w.id===selectedWType);color=wt.color;code=name.slice(0,3).toUpperCase();
  }
  const w={id:Date.now(),type:selectedWType,name,code,color,balance:bal};
  if(selectedWType==='saving'){
    const bankIdx=document.getElementById('savBank').value;
    const depositDate=document.getElementById('savDate').value||todayStr();
    const term=parseInt(document.getElementById('savTerm').value)||3;
    const rate=parseFloat(document.getElementById('savRate').value)||0;
    const rateNoTerm=parseFloat(document.getElementById('savRateNoTerm').value)||0;
    const dayBasis=parseInt(document.getElementById('savDayBasis').value)||365;
    const payTiming=document.getElementById('savPayTiming').value;
    const maturityAction=document.getElementById('savMaturityAction').value;
    const sourceWalletId=document.getElementById('savSourceWallet').value||null;
    const note=document.getElementById('savNote').value.trim();
    if(bankIdx!==''){const b=BANKS[parseInt(bankIdx)];w.bankCode=b.code;w.bankName=b.name;w.color=b.color;}
    w.depositDate=depositDate;w.termMonths=term;w.rate=rate;w.rateNoTerm=rateNoTerm;
    w.dayBasis=dayBasis;w.payTiming=payTiming;w.maturityAction=maturityAction;
    w.sourceWalletId=sourceWalletId;w.note=note;
    w.maturityDate=addMonths(depositDate,term);w.matured=false;w.lastAccrualYm=null;

    if(sourceWalletId){
      const sw=wallets.find(x=>String(x.id)===String(sourceWalletId));
      if(sw&&bal>0){
        sw.balance-=bal;
        txs.unshift({id:Date.now()+Math.random(),type:'transfer',amount:bal,fromName:sw.name,toName:name,note:'Gửi tiết kiệm: '+name,date:depositDate,time:nowTime()});
      }
    }
    if(payTiming==='start'&&rate>0&&bal>0){
      const days=daysBetween(depositDate,w.maturityDate);
      const interest=calcInterest(bal,rate,days,dayBasis);
      if(interest>0){
        const target=sourceWalletId?wallets.find(x=>String(x.id)===String(sourceWalletId)):null;
        if(target){target.balance+=interest;txs.unshift(mkSavTx('thu',interest,'Lãi trả trước: '+name,target.id,depositDate));}
        else{w.balance+=interest;txs.unshift(mkSavTx('thu',interest,'Lãi trả trước: '+name,w.id,depositDate));}
      }
    }
  }
  wallets.push(w);
  saveAll();
  document.getElementById('accNameInput').value='';document.getElementById('accBalInput').value='';
  document.getElementById('savRate').value='';document.getElementById('savNote').value='';
  toggleAccForm();renderAccounts();
}
function addMonths(dateStr,months){
  const p=dateStr.split('-').map(Number);const y=p[0],m=p[1]-1+months;
  const dim=new Date(y,m+1,0).getDate();const d=new Date(y,m,Math.min(p[2],dim));
  return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
}
function daysUntil(dateStr){
  const now=new Date();now.setHours(0,0,0,0);
  const d=new Date(dateStr+'T00:00:00');
  return Math.round((d-now)/86400000);
}
function daysBetween(a,b){return Math.round((new Date(b+'T00:00:00')-new Date(a+'T00:00:00'))/86400000);}
function calcInterest(balance,ratePct,days,dayBasis){return Math.round(balance*(ratePct||0)/100*days/(dayBasis||365));}
function mkSavTx(type,amount,note,walletId,date){
  return {id:Date.now()+Math.random(),type,amount,group:'Thu nhập',item:'Lãi tiết kiệm',icon:'luong',accent:'#22a765',bg:'#dcefe4',walletId,note,date,time:nowTime()};
}
function deleteAccount(id){wallets=wallets.filter(w=>w.id!==id);saveAll();renderAccounts();}
let editingWalletId=null;
function openWalletEdit(id){
  const w=wallets.find(x=>String(x.id)===String(id));if(!w)return;
  editingWalletId=id;
  document.getElementById('editWalletName').value=w.name;
  document.getElementById('editWalletBalance').value=fmtShort(w.balance);
  document.getElementById('walletEditModal').classList.add('show');
}
function closeWalletEdit(){document.getElementById('walletEditModal').classList.remove('show');editingWalletId=null;}
function saveWalletEdit(){
  const w=wallets.find(x=>String(x.id)===String(editingWalletId));if(!w)return;
  const name=document.getElementById('editWalletName').value.trim();
  const balRaw=document.getElementById('editWalletBalance').value.replace(/\D/g,'');
  if(!name){alert('Vui lòng nhập tên ví');return;}
  const bal=parseInt(balRaw)||0;
  w.name=name;w.balance=bal;
  saveAll();closeWalletEdit();renderAccounts();renderHome();
}
function renderAccounts(){
  document.getElementById('walletTotal').textContent=fmt(walletTotal());
  const list=document.getElementById('accList');
  if(!wallets.length){list.innerHTML='<div class="empty">Chưa có ví nào. Thêm ví tiền mặt, ngân hàng, ví điện tử... để theo dõi số dư.</div>';return;}
  list.innerHTML=wallets.map(w=>{
    let sub=WTYPES.find(t=>t.id===w.type).name;
    let name=w.name;
    if(w.type==='saving'){
      const left=daysUntil(w.maturityDate);
      if(w.bankName)name=w.name+' • '+w.bankName;
      sub=(w.rate||0)+'%/năm • '+w.termMonths+' tháng • '+(w.matured?'Đã tất toán/không kỳ hạn':(left<0?'Đã đáo hạn '+Math.abs(left)+' ngày trước':'Đáo hạn sau '+left+' ngày ('+w.maturityDate.split('-').reverse().join('/')+')'));
    }
    return '<div class="acc-item"><div class="acc-icon" style="background:rgba(194,154,92,.12);color:#c29a5c">'+icon(w.type==='bank'?'bank':(w.type==='saving'?'piggy':'wallet'),'#c29a5c',20)+'</div><div><div class="acc-name">'+name+'</div><div class="acc-sub">'+sub+'</div></div><div class="acc-bal">'+fmt(w.balance)+'</div><button class="icon-btn" onclick="openWalletEdit('+w.id+')" style="color:var(--blue);">✎</button><button class="icon-btn" onclick="deleteAccount('+w.id+')" style="color:var(--sub);">✕</button></div>';
  }).join('');
}
function renderWalletSelects(){
  const spendable=getSpendableWallets();
  const opts=spendable.length?spendable.map(w=>'<option value="'+w.id+'">'+w.name+' ('+fmt(w.balance)+')</option>').join(''):'<option value="">Chưa có ví chi tiêu (Sổ tiết kiệm không dùng để chi tiêu)</option>';
  document.getElementById('accSelect').innerHTML=opts;
  document.getElementById('xferFrom').innerHTML=opts;
  document.getElementById('xferTo').innerHTML=opts;
  document.getElementById('recWallet').innerHTML=opts;
}

/* ---------- CATEGORY PICKER ---------- */
function setType(t){
  currentType=t;selectedGroup=null;selectedItem=null;
  ['tabChi','tabThu','tabXfer'].forEach(id=>document.getElementById(id).classList.remove('active'));
  document.getElementById(t==='chi'?'tabChi':t==='thu'?'tabThu':'tabXfer').classList.add('active');
  document.getElementById('normalFields').style.display=t==='transfer'?'none':'block';
  document.getElementById('xferFields').style.display=t==='transfer'?'block':'none';
  document.getElementById('personField').style.display=t==='transfer'?'none':'block';
  document.getElementById('receiptField').style.display=t==='transfer'?'none':'block';
  if(t!=='transfer'){renderGroupChips();renderItemGrid();}
}
function renderGroupChips(){
  const groups=GROUPS[currentType];
  if(!selectedGroup)selectedGroup=groups[0].name;
  document.getElementById('groupChips').innerHTML=groups.map(g=>'<div class="chip'+(g.name===selectedGroup?' active':'')+'" onclick="pickGroup(\''+g.name.replace(/'/g,"")+'\')">'+icon(g.icon,g.name===selectedGroup?'#fff':g.accent,16)+g.name+'</div>').join('');
}
function pickGroup(name){selectedGroup=name;selectedItem=null;renderGroupChips();renderItemGrid();}
function renderItemGrid(){
  const g=GROUPS[currentType].find(x=>x.name===selectedGroup)||GROUPS[currentType][0];
  document.getElementById('catGrid').innerHTML=g.items.map(it=>'<div class="cat-btn'+(selectedItem===it?' selected':'')+'" onclick="pickItem(\''+it.replace(/'/g,"")+'\')"><span class="cat-emoji" style="background:'+g.bg+'">'+icon(g.icon,g.accent,18)+'</span>'+it+'</div>').join('');
}
function pickItem(it){selectedItem=it;renderItemGrid();}

function onReceiptChange(e){
  const f=e.target.files[0];if(!f)return;
  const reader=new FileReader();
  reader.onload=()=>{receiptData=reader.result;const img=document.getElementById('receiptPreview');img.src=receiptData;img.style.display='block';};
  reader.readAsDataURL(f);
}

/* ---------- SAVE TX ---------- */
function saveTx(){
  const amount=parseInt(document.getElementById('amountInput').value.replace(/\D/g,''))||0;
  if(amount<=0){alert('Vui lòng nhập số tiền');return;}
  const date=document.getElementById('dateInput').value||todayStr();
  const time=document.getElementById('timeInput').value||nowTime();
  const note=document.getElementById('noteInput').value;

  /* ----- CHẾ ĐỘ SỬA GIAO DỊCH ĐÃ CÓ ----- */
  if(editingTxId){
    const old=txs.find(x=>x.id===editingTxId);
    if(!old){resetEditUI();}
    else{
      reverseTxBalance(old); // hoàn tác ảnh hưởng số dư của giao dịch cũ trước khi ghi giá trị mới
      if(currentType==='transfer'){
        const fromId=document.getElementById('xferFrom').value, toId=document.getElementById('xferTo').value;
        if(!fromId||!toId||fromId===toId){
          // hoàn tác lại lệnh reverse ở trên vì chưa lưu được, giữ nguyên số dư ban đầu
          applyTxBalance(old);
          alert('Chọn 2 ví khác nhau');return;
        }
        const from=wallets.find(w=>String(w.id)===String(fromId)), to=wallets.find(w=>String(w.id)===String(toId));
        from.balance-=amount; to.balance+=amount;
        Object.assign(old,{type:'transfer',amount,fromName:from.name,toName:to.name,note,date,time});
        delete old.group;delete old.item;delete old.icon;delete old.accent;delete old.bg;delete old.walletId;delete old.person;delete old.receipt;
        if(old.reward_status==='REWARDED')revokeTxLinhLuc(old,true);delete old.reward_status;delete old.rewarded_at;
      }else{
        if(!selectedItem){applyTxBalance(old);alert('Vui lòng chọn danh mục');return;}
        const g=GROUPS[currentType].find(x=>x.name===selectedGroup);
        const walletId=document.getElementById('accSelect').value;
        const person=document.getElementById('personInput').value;
        Object.assign(old,{type:currentType,amount,group:g.name,item:selectedItem,icon:g.icon,accent:g.accent,bg:g.bg,walletId:walletId||null,person,note,receipt:receiptData,date,time});
        delete old.fromName;delete old.toName;
        if(currentType!=='chi'&&old.reward_status==='REWARDED'){revokeTxLinhLuc(old,true);delete old.reward_status;delete old.rewarded_at;}
        if(walletId){const w=wallets.find(x=>String(x.id)===String(walletId));if(w)w.balance+=(currentType==='thu'?amount:-amount);}
      }
      saveAll();
      resetEditUI();
      document.getElementById('amountInput').value='';document.getElementById('noteInput').value='';document.getElementById('personInput').value='';
      receiptData=null;
      const ri0=document.getElementById('receiptInput'),rp0=document.getElementById('receiptPreview');
      if(ri0)ri0.value='';if(rp0)rp0.style.display='none';
      selectedItem=null;
      showScreen('history');
    }
    return;
  }

  /* ----- THÊM GIAO DỊCH MỚI ----- */
  if(currentType==='transfer'){
    const fromId=document.getElementById('xferFrom').value, toId=document.getElementById('xferTo').value;
    if(!fromId||!toId||fromId===toId){alert('Chọn 2 ví khác nhau');return;}
    const from=wallets.find(w=>String(w.id)===String(fromId)), to=wallets.find(w=>String(w.id)===String(toId));
    from.balance-=amount; to.balance+=amount;
    const xferTx={id:Date.now(),type:'transfer',amount,fromName:from.name,toName:to.name,note,date,time};
    txs.unshift(xferTx);
    awardBaseLinhThach(xferTx);
    saveAll();
    document.getElementById('amountInput').value='';document.getElementById('noteInput').value='';
    showScreen('home');return;
  }

  if(!selectedItem){alert('Vui lòng chọn danh mục');return;}
  const g=GROUPS[currentType].find(x=>x.name===selectedGroup);
  const walletId=document.getElementById('accSelect').value;
  const person=document.getElementById('personInput').value;
  const tx={id:Date.now(),type:currentType,amount,group:g.name,item:selectedItem,icon:g.icon,accent:g.accent,bg:g.bg,walletId:walletId||null,person,note,receipt:receiptData,date,time};
  txs.unshift(tx);
  if(walletId){const w=wallets.find(x=>String(x.id)===String(walletId));if(w)w.balance+=(currentType==='thu'?amount:-amount);}
  awardBaseLinhThach(tx);
  saveAll();budgetWarn(tx);
  document.getElementById('amountInput').value='';document.getElementById('noteInput').value='';document.getElementById('personInput').value='';
  receiptData=null;document.getElementById('receiptInput').value='';document.getElementById('receiptPreview').style.display='none';
  selectedItem=null;
  showScreen('home');
}

function reverseTxBalance(t){
  if(t.type==='transfer'){
    const from=wallets.find(w=>w.name===t.fromName),to=wallets.find(w=>w.name===t.toName);
    if(from)from.balance+=t.amount; if(to)to.balance-=t.amount;
  }else if(t.walletId){
    const w=wallets.find(x=>String(x.id)===String(t.walletId));
    if(w)w.balance+=(t.type==='thu'?-t.amount:t.amount);
  }
}
function applyTxBalance(t){
  if(t.type==='transfer'){
    const from=wallets.find(w=>w.name===t.fromName),to=wallets.find(w=>w.name===t.toName);
    if(from)from.balance-=t.amount; if(to)to.balance+=t.amount;
  }else if(t.walletId){
    const w=wallets.find(x=>String(x.id)===String(t.walletId));
    if(w)w.balance+=(t.type==='thu'?t.amount:-t.amount);
  }
}
function revokeTxLinhLuc(t,onlyBonus){
  // Thu hồi linh lực của giao dịch (chống cày: tạo rồi xoá)
  const hs=rewardHistory.filter(h=>h.transaction_id===t.id&&(!onlyBonus||h.reward_type==='CHI_TIEU_HOP_LY'||h.reward_type==='SAVING_EXPENSE'));
  const pts=hs.reduce((a,h)=>a+(h.points||0),0);
  if(!pts)return;
  rewardProfile.total_points=Math.max(0,(rewardProfile.total_points||0)-pts);
  rewardHistory=rewardHistory.filter(h=>!hs.includes(h));
  if(onlyBonus){t.reward_points=Math.max(0,(t.reward_points||0)-pts);}
}
function deleteTx(id){
  const t0=txs.find(x=>x.id===id);
  if(t0&&t0.loanId&&t0.loanHistId){const l=loans.find(x=>x.id===t0.loanId);if(l&&confirm('Đây là giao dịch trả nợ vay. Xoá sẽ huỷ cả lần trả nợ này (cả gốc và lãi) và cộng lại dư nợ. Tiếp tục?')){revokeTxLinhLuc(t0,false);deleteLoanHist(l.id,t0.loanHistId,true);}return;}
  const t=txs.find(x=>x.id===id);if(t){reverseTxBalance(t);revokeTxLinhLuc(t,false);}
  txs=txs.filter(x=>x.id!==id);saveAll();renderHistory();renderHome();
}
function clearAll(){if(confirm('Xoá toàn bộ dữ liệu (giao dịch, ví, ngân sách, định kỳ, vay nợ, vay ngân hàng, linh lực tu luyện)?')){txs=[];wallets=[];budgets={};recurring=[];debts=[];loans=[];rewardProfile={total_points:0,current_streak:0,longest_streak:0,last_reward_date:null};rewardHistory=[];userAchievements=[];saveAll();renderHome();}}

function txItemHTML(t){
  if(t.type==='transfer'){
    return '<div class="tx-item"><div class="tx-icon" style="background:#dceeff">'+icon('transfer','#1487d8',19)+'</div><div class="tx-info"><div class="cat">Chuyển: '+t.fromName+' → '+t.toName+'</div><div class="note">'+(t.note||t.date)+'</div></div><div class="tx-amt xfer">'+fmt(t.amount)+'</div><button class="icon-btn" onclick="openEditTx('+t.id+')" style="color:var(--blue);">✎</button><button class="icon-btn" onclick="deleteTx('+t.id+')" style="color:var(--sub);">✕</button></div>';
  }
  const sign=t.type==='chi'?'-':'+';const cls=t.type==='chi'?'out':'in';
  return '<div class="tx-item" onclick="if(!event.target.closest(\'button\'))openEditTx('+t.id+')" style="cursor:pointer"><div class="tx-icon" style="background:'+(t.bg||'#e7f2fa')+'">'+icon(t.icon||'khac',t.accent||'#1487d8',19)+'</div><div class="tx-info"><div class="cat">'+t.item+'</div><div class="note">'+(t.note||t.person||t.date)+'</div></div><div class="tx-amt '+cls+'">'+sign+fmt(t.amount)+'</div>'+rewardBtnHTML(t)+'<button class="icon-btn" onclick="openEditTx('+t.id+')" style="color:var(--blue);">✎</button><button class="icon-btn" onclick="deleteTx('+t.id+')" style="color:var(--sub);">✕</button></div>';
}
function rewardBtnHTML(t){
  if(t.type!=='chi')return '';
  if(t.reward_status==='REWARDED')return '<button class="rw-badge rw-done" title="Đã x2: '+t.reward_points+' linh lực" onclick="event.stopPropagation()">✓</button>';
  return '<button class="rw-badge rw-pending" title="Đánh dấu chi tiêu hợp lý (x2 linh lực)" onclick="awardSavingReward('+t.id+')">✨</button>';
}
function renderHistory(){
  const list=document.getElementById('historyList');
  list.innerHTML=txs.length?txs.map(txItemHTML).join(''):'<div class="empty">Chưa có giao dịch nào.</div>';
}

/* ---------- HOME / DASHBOARD ---------- */
function renderHomePet(){
  const st=petStageIndex(),S=PET_STAGES[st],N=PET_STAGES[st+1],p=rewardProfile.total_points||0;
  document.getElementById('homePetName').textContent=rewardProfile.pet_name||'Linh Thú';
  document.getElementById('homePetLv').textContent=st+1;
  document.getElementById('homePetStage').textContent=S.name;
  document.getElementById('homePetStep').textContent='Bước '+S.step+' · '+S.desc;
  document.getElementById('homePetBar').style.width=(N?Math.round((p-S.required)/(N.required-S.required)*100):100)+'%';
  document.getElementById('homePetNext').textContent=N?('Còn '+(N.required-p)+' ✨ linh lực nữa để đột phá '+N.name):'🎉 Đã viên mãn Không Kiếp!';
  const v=document.getElementById('homePetVid'),im=document.getElementById('homePetImg');
  im.src=PET_IMGS[st];
  if(PET_VIDEOS[st]){
    v.muted=true;v.defaultMuted=true;v.setAttribute('muted','');v.setAttribute('playsinline','');v.setAttribute('webkit-playsinline','');
    if(v.dataset.st!==String(st)){v.src=PET_VIDEOS[st];v.dataset.st=st;v.load();}
    v.onerror=()=>{v.style.display='none';im.style.display='block';};
    v.style.display='block';im.style.display='none';
    const pl=v.play();if(pl&&pl.catch)pl.catch(()=>{});
  }else{v.style.display='none';im.style.display='block';}
}
function renderHome(){
  renderHomePet();
  applyMood();
  renderQuests();
  checkBackupReminder();
  try{renderInstallTip();renderReminders();renderQuickAdd();applyCompanion();}catch(e){console.error(e);}
  document.getElementById('homeBalance').textContent=fmt(walletTotal());
  document.getElementById('rwMiniPoints').textContent=rewardProfile.total_points||0;
  document.getElementById('rwMiniStreak').textContent=rewardProfile.current_streak||0;
  const pendingDebts=debts.filter(d=>d.status==='pending');
  const debtMini=document.getElementById('debtMini');
  if(pendingDebts.length){
    debtMini.style.display='flex';
    document.getElementById('debtMiniAmt').textContent=fmtShort(pendingDebts.reduce((s,d)=>s+d.amount,0))+' 💎';
    document.getElementById('debtMiniCount').textContent=pendingDebts.length+' người';
  }else{debtMini.style.display='none';}
  const activeLoans=loans.filter(l=>l.status==='active');
  const loanMini=document.getElementById('loanMini');
  if(activeLoans.length){
    loanMini.style.display='flex';
    document.getElementById('loanMiniAmt').textContent=fmtShort(activeLoans.reduce((s,l)=>s+l.balance,0))+' 💎';
    {const ms=loanNextSummary();document.getElementById('loanMiniCount').textContent=activeLoans.length+' khoản'+((ms.p+ms.i)>0?' • kỳ tới '+fmtShort(ms.p+ms.i):'');}
  }else{loanMini.style.display='none';}
  const now=new Date(); const curYm=now.toISOString().slice(0,7);
  document.getElementById('monthTitle').textContent='Tháng '+(now.getMonth()+1)+'/'+now.getFullYear();
  const monthTx=txs.filter(t=>t.type!=='transfer' && ym(t.date)===curYm);
  const thu=monthTx.filter(t=>t.type==='thu').reduce((s,t)=>s+t.amount,0);
  const chi=monthTx.filter(t=>t.type==='chi').reduce((s,t)=>s+t.amount,0);
  document.getElementById('mThu').textContent=fmtShort(thu)+' 💎';
  document.getElementById('mChi').textContent=fmtShort(chi)+' 💎';
  const net=document.getElementById('mNet');net.textContent=fmtShort(thu-chi)+' 💎';net.style.color=(thu-chi>=0)?'var(--green)':'var(--red)';

  const save=Math.max(thu-chi,0);
  const maxv=Math.max(thu,chi,save,1);
  document.getElementById('minibarWrap').innerHTML=['Thu','Chi','Tiết kiệm'].map((l,i)=>{
    const v=[thu,chi,save][i], color=['var(--green)','var(--red)','var(--blue)'][i];
    return '<div class="minibar-row"><div class="minibar-label">'+l+'</div><div class="minibar-track"><div class="minibar-fill" style="width:'+Math.round(v/maxv*100)+'%;background:'+color+'"></div></div><div class="minibar-val">'+fmtShort(v)+' 💎</div></div>';
  }).join('');

  const byGroup={};
  monthTx.filter(t=>t.type==='chi').forEach(t=>{byGroup[t.group]=byGroup[t.group]||{sum:0,icon:t.icon,accent:t.accent,bg:t.bg};byGroup[t.group].sum+=t.amount;});
  const rows=Object.entries(byGroup).sort((a,b)=>b[1].sum-a[1].sum).slice(0,4);
  document.getElementById('topSpendList').innerHTML=rows.length?rows.map(([name,d])=>'<div class="tx-item"><div class="tx-icon" style="background:'+d.bg+'">'+icon(d.icon,d.accent,19)+'</div><div class="tx-info"><div class="cat">'+name+'</div></div><div class="tx-amt out">'+fmt(d.sum)+'</div></div>').join(''):'<div class="empty">Chưa có chi tiêu tháng này.</div>';

  document.getElementById('insightList').innerHTML=computeInsights(monthTx,thu,chi,byGroup,now).map(i=>'<div class="insight-card"><span class="ic">'+i.emoji+'</span><span>'+i.text+'</span></div>').join('') || '<div class="empty">Chưa đủ dữ liệu để đưa ra nhận định.</div>';

  const recent=txs.slice(0,6);
  document.getElementById('recentList').innerHTML=recent.length?recent.map(txItemHTML).join(''):'<div class="empty">Chưa có giao dịch nào. Bấm nút + để thêm.</div>';
}

function computeInsights(monthTx,thu,chi,byGroup,now){
  const out=[];
  const rows=Object.entries(byGroup).sort((a,b)=>b[1].sum-a[1].sum);
  if(rows.length){
    const [topName,topData]=rows[0];
    const pctOfTotal=chi>0?Math.round(topData.sum/chi*100):0;
    out.push({emoji:'📌',text:'Bạn đã chi '+fmt(topData.sum)+' cho <b>'+topName+'</b> trong tháng này, chiếm '+pctOfTotal+'% tổng chi tiêu.'});
    let prevSum=0,prevCount=0;
    for(let i=1;i<=3;i++){
      const d=new Date(now.getFullYear(),now.getMonth()-i,1);const key=d.toISOString().slice(0,7);
      const s=txs.filter(t=>t.type==='chi'&&t.group===topName&&ym(t.date)===key).reduce((a,t)=>a+t.amount,0);
      if(s>0){prevSum+=s;prevCount++;}
    }
    if(prevCount>0){
      const avg=prevSum/prevCount;
      const diff=Math.round((topData.sum-avg)/avg*100);
      if(Math.abs(diff)>=5) out.push({emoji: diff>0?'🔺':'🔻', text:'Chi <b>'+topName+'</b> tháng này '+(diff>0?'cao hơn':'thấp hơn')+' '+Math.abs(diff)+'% so với trung bình các tháng gần đây.'});
    }
  }
  const dayOfMonth=now.getDate();
  const daysInMonth=new Date(now.getFullYear(),now.getMonth()+1,0).getDate();
  if(chi>0 && dayOfMonth>=3){
    const projected=Math.round(chi/dayOfMonth*daysInMonth);
    const projRemain=thu-projected;
    out.push({emoji:'🔮',text:'Nếu duy trì tốc độ chi hiện tại, cuối tháng bạn dự kiến còn khoảng <b>'+fmt(projRemain)+'</b>.'});
  }
  return out;
}

/* ---------- REPORT ---------- */
let reportPeriod='day', reportRef=new Date();
function setPeriod(p,btn){reportPeriod=p;document.querySelectorAll('.period-tabs button').forEach(b=>b.classList.remove('active'));btn.classList.add('active');reportRef=new Date();renderReport();}
function navPeriod(dir){const d=new Date(reportRef);if(reportPeriod==='day')d.setDate(d.getDate()+dir);if(reportPeriod==='week')d.setDate(d.getDate()+dir*7);if(reportPeriod==='month')d.setMonth(d.getMonth()+dir);if(reportPeriod==='year')d.setFullYear(d.getFullYear()+dir);reportRef=d;renderReport();}
function getRange(){
  const d=new Date(reportRef);let start,end,label;
  if(reportPeriod==='day'){start=new Date(d.getFullYear(),d.getMonth(),d.getDate());end=start;label=start.toLocaleDateString('vi-VN');}
  else if(reportPeriod==='week'){const day=(d.getDay()+6)%7;start=new Date(d.getFullYear(),d.getMonth(),d.getDate()-day);end=new Date(start.getFullYear(),start.getMonth(),start.getDate()+6);label=start.toLocaleDateString('vi-VN')+' - '+end.toLocaleDateString('vi-VN');}
  else if(reportPeriod==='month'){start=new Date(d.getFullYear(),d.getMonth(),1);end=new Date(d.getFullYear(),d.getMonth()+1,0);label='Tháng '+(d.getMonth()+1)+'/'+d.getFullYear();}
  else{start=new Date(d.getFullYear(),0,1);end=new Date(d.getFullYear(),11,31);label='Năm '+d.getFullYear();}
  return {start,end,label};
}
function renderReport(){
  const {start,end,label}=getRange();
  document.getElementById('rangeLabel').textContent=label;
  const inRange=txs.filter(t=>{if(t.type==='transfer')return false;const td=new Date(t.date+'T00:00:00');return td>=start&&td<=end;});
  const thu=inRange.filter(t=>t.type==='thu').reduce((s,t)=>s+t.amount,0);
  const chi=inRange.filter(t=>t.type==='chi').reduce((s,t)=>s+t.amount,0);
  document.getElementById('repThu').textContent=fmt(thu);document.getElementById('repChi').textContent=fmt(chi);
  const net=document.getElementById('repNet');net.textContent=(thu-chi>=0?'+':'')+fmt(thu-chi);net.style.color=(thu-chi>=0)?'var(--green)':'var(--red)';
  renderReportCharts(inRange,thu,chi);
  repRenderGroup(inRange,'chi','repCatList','Không có chi tiêu trong kỳ này.');
  repRenderGroup(inRange,'thu','repThuList','Không có khoản thu trong kỳ này.');
}
function sumRange(a,b,type){return txs.filter(t=>t.type===type&&(()=>{const d=new Date(t.date+'T00:00:00');return d>=a&&d<=b;})()).reduce((x,t)=>x+t.amount,0);}
function renderReportCharts(inRange,thu,chi){
  // So sánh kỳ trước
  const saved=new Date(reportRef),pr=new Date(reportRef);
  if(reportPeriod==='day')pr.setDate(pr.getDate()-1);else if(reportPeriod==='week')pr.setDate(pr.getDate()-7);else if(reportPeriod==='month')pr.setMonth(pr.getMonth()-1,1);else pr.setFullYear(pr.getFullYear()-1);
  reportRef=pr;const P=getRange();reportRef=saved;
  const pThu=sumRange(P.start,P.end,'thu'),pChi=sumRange(P.start,P.end,'chi');
  const cmp=(cur,prev,good)=>{if(!prev)return cur?'<b>mới phát sinh</b>':'không đổi';const d=Math.round((cur-prev)/prev*100);const up=d>0;const ok=good==='up'?up:!up;return '<b style="color:'+(d===0?'var(--sub)':ok?'var(--green)':'var(--red)')+'">'+(up?'▲ ':d<0?'▼ ':'')+Math.abs(d)+'%</b>';};
  document.getElementById('repCompare').innerHTML='So với kỳ trước ('+P.label+'): Chi '+cmp(chi,pChi,'down')+' · Thu '+cmp(thu,pThu,'up');
  // Donut cơ cấu chi
  const by={};inRange.filter(t=>t.type==='chi').forEach(t=>{const k=t.group||'Khác';by[k]=by[k]||{v:0,c:t.accent||'#7c8b98'};by[k].v+=t.amount;});
  const rows=Object.entries(by).sort((a,b)=>b[1].v-a[1].v);
  const dn=document.getElementById('repDonut');
  if(!chi){dn.innerHTML='<div class="empty" style="padding:10px">Chưa có chi tiêu.</div>';}
  else{let acc=0;const seg=rows.map(([k,o])=>{const a=acc/chi*360;acc+=o.v;return o.c+' '+a+'deg '+(acc/chi*360)+'deg';}).join(',');
    dn.innerHTML='<div class="donut-wrap"><div class="donut" style="background:conic-gradient('+seg+')"></div><div class="donut-legend">'+rows.map(([k,o])=>'<div><i style="background:'+o.c+'"></i>'+k+' · '+Math.round(o.v/chi*100)+'%</div>').join('')+'</div></div>';}
  // Xu hướng 6 tháng
  const base=new Date(reportRef);const cols=[];
  for(let i=5;i>=0;i--){const a=new Date(base.getFullYear(),base.getMonth()-i,1),b=new Date(base.getFullYear(),base.getMonth()-i+1,0);cols.push({lb:'T'+(a.getMonth()+1),t:sumRange(a,b,'thu'),c:sumRange(a,b,'chi')});}
  const mx=Math.max(1,...cols.map(c=>Math.max(c.t,c.c)));
  document.getElementById('repTrend').innerHTML='<div class="trend">'+cols.map(c=>'<div class="trend-col"><div class="trend-bars"><div title="Thu '+fmt(c.t)+'" style="height:'+(c.t/mx*100)+'%;background:var(--green)"></div><div title="Chi '+fmt(c.c)+'" style="height:'+(c.c/mx*100)+'%;background:var(--red)"></div></div><div class="trend-lb">'+c.lb+'</div></div>').join('')+'</div><div class="trend-leg"><span>🟩 Thu</span><span>🟥 Chi</span></div>';
}
function repRenderGroup(inRange,type,elId,emptyMsg){
  const byCat={};
  inRange.filter(t=>t.type===type).forEach(t=>{const k=t.group||'Khác';byCat[k]=byCat[k]||{sum:0,icon:t.icon||'khac',accent:t.accent||'#7c8b98',items:{}};byCat[k].sum+=t.amount;const it=t.item||k;byCat[k].items[it]=(byCat[k].items[it]||0)+t.amount;});
  const rows=Object.entries(byCat).sort((a,b)=>b[1].sum-a[1].sum);
  const list=document.getElementById(elId);
  if(!rows.length){list.innerHTML='<div class="empty">'+emptyMsg+'</div>';return;}
  const total=rows.reduce((s,r)=>s+r[1].sum,0);
  const maxSum=rows[0][1].sum;
  list.innerHTML=rows.map(([name,d])=>'<div class="cat-row"><div class="cat-row-top"><span style="display:flex;align-items:center;gap:8px;">'+icon(d.icon,d.accent,18)+name+'</span><span>'+fmt(d.sum)+' <small style="color:var(--sub)">'+Math.round(d.sum/total*100)+'%</small></span></div><div class="bar-bg"><div class="bar-fill" style="width:'+Math.round(d.sum/maxSum*100)+'%;background:'+d.accent+'"></div></div>'+(Object.keys(d.items).length>1?'<div style="font-size:12.5px;color:var(--sub);margin-top:4px;">'+Object.entries(d.items).sort((a,b)=>b[1]-a[1]).map(([n,v])=>n+': '+fmt(v)).join(' · ')+'</div>':'')+'</div>').join('');
}

/* ---------- BUDGET ---------- */
function renderBudget(){
  const now=new Date();const curYm=now.toISOString().slice(0,7);
  const monthChi=txs.filter(t=>t.type==='chi'&&ym(t.date)===curYm);
  const totalBudget=GROUPS.chi.reduce((s,g)=>s+(budgets[g.name]||0),0);
  const totalSpent=monthChi.reduce((s,t)=>s+t.amount,0);
  document.getElementById('budgetTotalLine').textContent=fmt(totalSpent)+' / '+fmt(totalBudget);
  document.getElementById('budgetList').innerHTML=GROUPS.chi.map(g=>{
    const spent=monthChi.filter(t=>t.group===g.name).reduce((s,t)=>s+t.amount,0);
    const bud=budgets[g.name]||0;
    const pct=bud>0?Math.min(Math.round(spent/bud*100),999):0;
    const color=pct>=90?'var(--red)':pct>=70?'var(--yellow)':'var(--green)';
    const statusEmoji=pct>=90?'🔴':pct>=70?'🟡':'🟢';
    return '<div class="cat-row"><div class="cat-row-top"><span style="display:flex;align-items:center;gap:8px;">'+icon(g.icon,g.accent,18)+g.name+'</span><span>'+(bud>0?statusEmoji+' '+pct+'%':'')+'</span></div>'+
      (bud>0?'<div class="bar-bg" style="margin-bottom:8px;"><div class="bar-fill" style="width:'+Math.min(pct,100)+'%;background:'+color+'"></div></div><div style="font-size:14px;color:var(--sub);">Đã dùng '+fmt(spent)+' / '+fmt(bud)+' — còn lại '+fmt(Math.max(bud-spent,0))+'</div>':'<div style="font-size:14px;color:var(--sub);margin-bottom:6px;">Chưa đặt ngân sách</div>')+
      '<input type="tel" inputmode="numeric" placeholder="Đặt ngân sách/tháng (💎)" value="'+(bud?fmtShort(bud):'')+'" style="width:100%;border:1px solid #d8e4ec;border-radius:8px;padding:8px 10px;margin-top:8px;font-family:inherit;font-size:14.5px;" onchange="setBudget(\''+g.name+'\',this.value)"></div>';
  }).join('');
}
function setBudget(group,val){const n=parseInt(String(val).replace(/\D/g,''))||0;budgets[group]=n;saveAll();renderBudget();}

/* ---------- RECURRING ---------- */
let recType='chi';
function setRecType(t){recType=t;document.getElementById('recTabChi').classList.toggle('active',t==='chi');document.getElementById('recTabThu').classList.toggle('active',t==='thu');populateRecGroup();}
function populateRecGroup(){document.getElementById('recGroup').innerHTML=GROUPS[recType].flatMap(g=>g.items.map(it=>'<option value="'+g.name+'|||'+it+'">'+g.name+' • '+it+'</option>')).join('');}
function toggleRecurForm(){const f=document.getElementById('addRecurForm');f.style.display=f.style.display==='none'?'block':'none';if(f.style.display==='block'){setRecType('chi');populateRecGroup();renderWalletSelects();}}
function saveRecurring(){
  const name=document.getElementById('recName').value.trim();
  const amount=parseInt(document.getElementById('recAmount').value.replace(/\D/g,''))||0;
  const gi=document.getElementById('recGroup').value.split('|||');
  const walletId=document.getElementById('recWallet').value;
  const day=parseInt(document.getElementById('recDay').value)||1;
  if(!name||amount<=0){alert('Nhập tên và số tiền');return;}
  recurring.push({id:Date.now(),type:recType,name,amount,group:gi[0],item:gi[1],walletId,day,lastLoggedYm:null});
  saveAll();
  document.getElementById('recName').value='';document.getElementById('recAmount').value='';document.getElementById('recDay').value='';
  toggleRecurForm();renderRecurring();
}
function deleteRecurring(id){recurring=recurring.filter(r=>r.id!==id);saveAll();renderRecurring();}
function renderRecurring(){
  const list=document.getElementById('recurList');
  if(!recurring.length){list.innerHTML='<div class="empty">Chưa có khoản định kỳ nào. VD: Lương ngày 25, Tiền nhà ngày 5...</div>';return;}
  list.innerHTML=recurring.map(r=>'<div class="acc-item"><div class="acc-icon" style="background:'+(r.type==='thu'?'#dcefe4':'#fbdfe0')+';color:'+(r.type==='thu'?'var(--green)':'var(--red)')+'">'+icon('repeat',r.type==='thu'?'var(--green)':'var(--red)',18)+'</div><div><div class="acc-name">'+r.name+'</div><div class="acc-sub">Ngày '+r.day+' hàng tháng • '+r.item+'</div></div><div class="acc-bal">'+fmt(r.amount)+'</div><button onclick="deleteRecurring('+r.id+')" style="background:none;border:none;color:var(--sub);font-size:16.5px;">✕</button></div>').join('');
}
function checkDueRecurring(){
  const now=new Date();const curYm=todayStr().slice(0,7);const curDay=now.getDate();
  const due=recurring.filter(r=>r.lastLoggedYm!==curYm && curDay>=r.day);
  if(!due.length)return;
  const names=due.map(r=>r.name+' ('+fmt(r.amount)+')').join(', ');
  if(confirm('Có '+due.length+' khoản định kỳ đến hạn: '+names+'.\nThêm vào sổ thu chi ngay?')){
    due.forEach(r=>{
      const g=GROUPS[r.type].find(x=>x.name===r.group)||GROUPS[r.type][0];
      txs.unshift({id:Date.now()+Math.random(),type:r.type,amount:r.amount,group:r.group,item:r.item,icon:g.icon,accent:g.accent,bg:g.bg,walletId:r.walletId||null,note:'Tự động: '+r.name,date:todayStr(),time:nowTime(),recurringId:r.id});
      if(r.walletId){const w=wallets.find(x=>String(x.id)===String(r.walletId));if(w)w.balance+=(r.type==='thu'?r.amount:-r.amount);}
      r.lastLoggedYm=curYm;
    });
    saveAll();renderHome();
  }
}

/* ---------- VAY NỢ ---------- */
function toggleDebtForm(){
  const f=document.getElementById('addDebtForm');
  f.style.display=f.style.display==='none'?'block':'none';
  if(f.style.display==='block'){
    renderDebtSourceWalletSelect();
    document.getElementById('debtDate').value=todayStr();
    document.getElementById('debtDueDate').value=todayStr();
  }
}
function saveDebt(){
  const person=document.getElementById('debtPerson').value.trim();
  const amount=parseInt(document.getElementById('debtAmount').value.replace(/\D/g,''))||0;
  const date=document.getElementById('debtDate').value||todayStr();
  const dueDate=document.getElementById('debtDueDate').value||date;
  const sourceWalletId=document.getElementById('debtSourceWallet').value||null;
  const note=document.getElementById('debtNote').value.trim();
  if(!person){alert('Vui lòng nhập tên người vay');return;}
  if(amount<=0){alert('Vui lòng nhập số tiền cho vay');return;}
  const d={id:Date.now(),person,amount,date,dueDate,note,status:'pending',sourceWalletId,outTxId:null,paidDate:null,paidWalletId:null};
  if(sourceWalletId){
    const w=wallets.find(x=>String(x.id)===String(sourceWalletId));
    if(w){
      w.balance-=amount;
      const txId=Date.now()+Math.random();
      txs.unshift({id:txId,type:'chi',group:'Khác',item:'Cho vay',icon:'khac',accent:'#7c8b98',bg:'#e7e9ee',walletId:sourceWalletId,person,note:'Cho vay: '+person+(note?' — '+note:''),date,time:nowTime(),debtId:d.id});
      d.outTxId=txId;
    }
  }
  debts.push(d);
  saveAll();
  document.getElementById('debtPerson').value='';document.getElementById('debtAmount').value='';document.getElementById('debtNote').value='';
  toggleDebtForm();renderDebts();renderHome();
}
function debtStatusInfo(d){
  if(d.status==='paid')return {label:'Đã trả ngày '+d.paidDate.split('-').reverse().join('/'),cls:'paid'};
  const left=daysUntil(d.dueDate);
  if(left<0)return {label:'Quá hạn '+Math.abs(left)+' ngày',cls:'overdue'};
  if(left===0)return {label:'Hẹn trả hôm nay',cls:'overdue'};
  return {label:'Còn '+left+' ngày (hẹn '+d.dueDate.split('-').reverse().join('/')+')',cls:'pending'};
}
function renderDebts(){
  const totalOut=debts.filter(d=>d.status==='pending').reduce((s,d)=>s+d.amount,0);
  document.getElementById('debtTotalLine').textContent=fmt(totalOut);
  const list=document.getElementById('debtList');
  if(!debts.length){list.innerHTML='<div class="empty">Chưa có khoản cho vay nào. Thêm để theo dõi ai đang nợ bạn và ngày hẹn trả.</div>';return;}
  const sorted=debts.slice().sort((a,b)=>{
    if(a.status!==b.status)return a.status==='pending'?-1:1;
    return new Date(a.dueDate)-new Date(b.dueDate);
  });
  const walletOpts=w=>getSpendableWallets().map(x=>'<option value="'+x.id+'">'+x.name+'</option>').join('')||'<option value="">Chưa có ví</option>';
  list.innerHTML=sorted.map(d=>{
    const st=debtStatusInfo(d);
    let payRow='';
    if(d.status==='pending'){
      payRow='<div class="debt-pay-row"><select id="payWallet_'+d.id+'">'+walletOpts()+'</select><button onclick="markDebtPaid('+d.id+')">Đã trả</button></div>';
    }
    return '<div class="debt-item"><div class="debt-top"><div><div class="debt-person">'+d.person+'</div><div class="debt-sub">Cho vay ngày '+d.date.split('-').reverse().join('/')+(d.note?' • '+d.note:'')+'</div></div><div class="debt-amt">'+fmt(d.amount)+'</div></div>'+
      '<span class="debt-badge '+st.cls+'">'+st.label+'</span>'+
      payRow+
      '<div class="debt-actions"><button onclick="deleteDebt('+d.id+')">Xoá khoản vay</button></div></div>';
  }).join('');
}
function markDebtPaid(id){
  const d=debts.find(x=>x.id===id);if(!d)return;
  const sel=document.getElementById('payWallet_'+id);
  const walletId=sel?sel.value:'';
  if(!walletId){alert('Vui lòng chọn ví nhận tiền trả nợ');return;}
  const w=wallets.find(x=>String(x.id)===String(walletId));if(!w)return;
  w.balance+=d.amount;
  const txId=Date.now()+Math.random();
  txs.unshift({id:txId,type:'thu',group:'Thu nhập',item:'Thu hồi nợ',icon:'luong',accent:'#22a765',bg:'#dcefe4',walletId,person:d.person,note:'Thu hồi nợ: '+d.person,date:todayStr(),time:nowTime(),debtId:d.id});
  d.status='paid';d.paidDate=todayStr();d.paidWalletId=walletId;d.inTxId=txId;
  saveAll();renderDebts();renderHome();
}
function deleteDebt(id){
  const d=debts.find(x=>x.id===id);if(!d)return;
  if(!confirm('Xoá khoản cho vay của '+d.person+'? Các giao dịch liên quan (nếu có) cũng sẽ bị xoá và hoàn lại số dư ví.'))return;
  if(d.outTxId){const t=txs.find(x=>x.id===d.outTxId);if(t){reverseTxBalance(t);txs=txs.filter(x=>x.id!==d.outTxId);}}
  if(d.inTxId){const t=txs.find(x=>x.id===d.inTxId);if(t){reverseTxBalance(t);txs=txs.filter(x=>x.id!==d.inTxId);}}
  debts=debts.filter(x=>x.id!==id);
  saveAll();renderDebts();renderHome();renderHistory();
}


/* ---------- LỊCH NGÀY LÀM VIỆC VIỆT NAM ---------- */
/* Tết Nguyên đán (mùng 1) và Giỗ Tổ (10/3 âm) theo dương lịch, tính theo lịch âm Việt Nam (GMT+7) */
const VN_LUNAR={2024:['02-10','04-18'],2025:['01-29','04-07'],2026:['02-17','04-26'],2027:['02-06','04-16'],2028:['01-26','04-04'],2029:['02-13','04-23'],2030:['02-02','04-12'],2031:['01-23','04-01'],2032:['02-11','04-19'],2033:['01-31','04-09'],2034:['02-19','04-28'],2035:['02-08','04-17'],2036:['01-28','04-06'],2037:['02-15','04-24'],2038:['02-04','04-13'],2039:['01-24','04-03'],2040:['02-12','04-20'],2041:['02-01','04-10'],2042:['01-22','04-29'],2043:['02-10','04-19'],2044:['01-30','04-07'],2045:['02-17','04-26'],2046:['02-06','04-15'],2047:['01-26','04-04'],2048:['02-14','04-22'],2049:['02-02','04-11'],2050:['01-23','04-01']};
/* Lịch nghỉ chính thức đã công bố (ngày thường được nghỉ, gồm cả nghỉ bù). 2027: theo phương án Bộ Nội vụ trình. */
const VN_HOLIDAY_OFFICIAL={
  2025:['01-01','01-27','01-28','01-29','01-30','01-31','04-07','04-30','05-01','05-02','09-01','09-02'],
  2026:['01-01','02-16','02-17','02-18','02-19','02-20','04-27','04-30','05-01','08-31','09-01','09-02','11-24'],
  2027:['01-01','02-04','02-05','02-08','02-09','02-10','04-16','04-30','05-03','09-02','09-03','11-24']
};
function ymd(d){return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');}
function parseYmd(s){const p=s.split('-').map(Number);return new Date(p[0],p[1]-1,p[2]);}
function dmy(s){return s?s.split('-').reverse().join('/'):'';}
function isWeekend(s){const w=parseYmd(s).getDay();return w===0||w===6;}
const _holiCache={};
function vnHolidays(y){
  if(_holiCache[y])return _holiCache[y];
  const set=new Set();
  if(VN_HOLIDAY_OFFICIAL[y]){VN_HOLIDAY_OFFICIAL[y].forEach(md=>set.add(y+'-'+md));}
  else{
    const base=[y+'-01-01',y+'-04-30',y+'-05-01',y+'-09-01',y+'-09-02'];
    if(y>=2026)base.push(y+'-11-24');
    const lu=VN_LUNAR[y];
    if(lu){base.push(y+'-'+lu[1]);const tet=y+'-'+lu[0];for(let i=-1;i<=3;i++)base.push(addDays(tet,i));}
    base.forEach(d=>set.add(d));
    /* ngày lễ trùng cuối tuần -> nghỉ bù ngày làm việc kế tiếp */
    base.filter(isWeekend).forEach(d=>{let x=addDays(d,1);while(isWeekend(x)||set.has(x))x=addDays(x,1);set.add(x);});
  }
  _holiCache[y]=set;return set;
}
function isWorkday(s){return !isWeekend(s)&&!vnHolidays(+s.slice(0,4)).has(s);}
function nextWorkday(s){let x=s,n=0;while(!isWorkday(x)&&n<30){x=addDays(x,1);n++;}return x;}

/* ---------- VAY NGÂN HÀNG ---------- */
const LOAN_TYPES={overdraft:'Thấu chi',consumer:'Vay tiêu dùng'};
function populateLoanBankSelect(){document.getElementById('loanBank').innerHTML='<option value="">-- Không chọn --</option>'+BANKS.map((b,i)=>'<option value="'+i+'">'+b.name+'</option>').join('');}
function renderLoanDisburseWalletSelect(){
  const opts='<option value="">-- Không chọn --</option>'+getSpendableWallets().map(w=>'<option value="'+w.id+'">'+w.name+' ('+fmt(w.balance)+')</option>').join('');
  document.getElementById('loanDisburseWallet').innerHTML=opts;
}
function num(id){return parseInt((document.getElementById(id).value||'').replace(/\D/g,''))||0;}
function readDay(id){const v=parseInt(document.getElementById(id).value);return v>=1&&v<=31?v:null;}
let editingLoanId=null,formLoanType='consumer';
function setLoanType(t){
  formLoanType=t;
  document.getElementById('ltOverdraft').classList.toggle('active',t==='overdraft');
  document.getElementById('ltConsumer').classList.toggle('active',t==='consumer');
  document.getElementById('loanTypeHint').innerHTML=t==='overdraft'
    ?'<b>Thấu chi:</b> lãi trả hàng tháng vào ngày cố định, gốc trả một lần vào cuối kỳ hạn vay.'
    :'<b>Vay tiêu dùng:</b> gốc mỗi tháng = số tiền vay ban đầu ÷ số tháng, trả cùng ngày với lãi. Trả trước bao nhiêu thì lịch trả gốc lùi lại bấy nhiêu tháng.';
  updateLoanPreview();
}
function toggleLoanForm(forceOpen){
  const f=document.getElementById('addLoanForm');
  const open=forceOpen===true||(forceOpen!==false&&f.style.display==='none');
  f.style.display=open?'block':'none';
  const tb=document.getElementById('loanToggleBtn');if(tb)tb.style.display=open?'none':'block';
  if(open&&!editingLoanId){
    clearLoanForm();populateLoanBankSelect();renderLoanDisburseWalletSelect();
    document.getElementById('loanStartDate').value=todayStr();
    document.getElementById('loanDisburseWrap').style.display='block';
    document.getElementById('loanSaveBtn').textContent='Lưu khoản vay';
    setLoanType('consumer');
  }
  if(!open){editingLoanId=null;clearLoanForm();}
}
function clearLoanForm(){['loanName','loanPrincipal','loanPaid','loanRate','loanTerm','loanInterestDay','loanNote'].forEach(id=>{const e=document.getElementById(id);if(e)e.value='';});const p=document.getElementById('loanPreview');if(p)p.innerHTML='';}

/* Ngày danh nghĩa kỳ k: ngày D của tháng (tháng giải ngân + k); tháng thiếu ngày thì lấy ngày cuối tháng */
function nominalDate(startDate,k,day){
  const s=parseYmd(startDate);const y=s.getFullYear(),m=s.getMonth()+k;
  const dim=new Date(y,m+1,0).getDate();return ymd(new Date(y,m,Math.min(day,dim)));
}
function loanMaturity(l){
  if(l.type==='overdraft')return nextWorkday(addMonths(l.startDate,l.termMonths));
  return nextWorkday(nominalDate(l.startDate,l.termMonths,l.interestDay));
}
/* Danh sách kỳ trả lãi: [{nominal, due}] ; kỳ cuối = ngày đáo hạn */
function loanSchedule(l){
  if(!l.startDate||!l.termMonths||!l.interestDay)return [];
  if(l._sch&&l._schKey===l.startDate+'|'+l.termMonths+'|'+l.interestDay+'|'+l.type)return l._sch;
  const out=[];
  if(l.type==='overdraft'){
    const matNom=addMonths(l.startDate,l.termMonths),mat=nextWorkday(matNom);
    for(let k=1;k<=l.termMonths+1;k++){const n=nominalDate(l.startDate,k,l.interestDay);if(n>=matNom)break;out.push({nominal:n,due:nextWorkday(n)});}
    out.push({nominal:matNom,due:mat});
  }else{
    for(let k=1;k<=l.termMonths;k++){const n=nominalDate(l.startDate,k,l.interestDay);out.push({nominal:n,due:nextWorkday(n)});}
  }
  Object.defineProperty(l,'_sch',{value:out,writable:true,configurable:true,enumerable:false});
  Object.defineProperty(l,'_schKey',{value:l.startDate+'|'+l.termMonths+'|'+l.interestDay+'|'+l.type,writable:true,configurable:true,enumerable:false});
  return out;
}
function loanPaidPrincipal(l){return (l.paidBefore||0)+(l.history||[]).reduce((s,h)=>s+(h.principal||0),0);}
function recalcLoan(l){l.balance=Math.max(0,(l.principal||0)-loanPaidPrincipal(l));l.status=l.balance>0?'active':'closed';}
function loanMonthlyPrincipal(l){return l.termMonths?Math.round(l.principal/l.termMonths):0;}
/* Tổng gốc phải trả tích luỹ đến hết kỳ n (vay tiêu dùng) */
function cumPrincipal(l,n){return n>=l.termMonths?l.principal:loanMonthlyPrincipal(l)*n;}
/* Kỳ gốc tiếp theo phải trả (vay tiêu dùng): gốc đã trả phủ được bao nhiêu kỳ thì lùi bấy nhiêu kỳ */
function nextPrincipalDue(l){
  if(l.status==='closed')return null;
  const sch=loanSchedule(l);if(!sch.length)return null;
  if(l.type==='overdraft'){const last=sch[sch.length-1];return {due:last.due,nominal:last.nominal,amount:l.balance,idx:sch.length};}
  const paid=loanPaidPrincipal(l);let n=1;
  while(n<l.termMonths&&cumPrincipal(l,n)<=paid)n++;
  const s=sch[n-1];return {due:s.due,nominal:s.nominal,amount:Math.max(0,cumPrincipal(l,n)-paid),idx:n};
}
function nextInterestDue(l){
  if(l.status==='closed')return null;
  const sch=loanSchedule(l);const i=l.iPaid||0;if(i>=sch.length)return null;
  const from=i===0?l.startDate:sch[i-1].due;const s=sch[i];
  const days=Math.max(0,daysBetween(from,s.due));
  return {due:s.due,nominal:s.nominal,from,days,idx:i+1,amount:Math.round((l.balance||0)*(l.rate||0)/100*days/365)};
}
/* Lãi ước tính của kỳ j (0-based) */
function loanPeriodInterest(l,j){
  const sch=loanSchedule(l);const from=j===0?l.startDate:sch[j-1].due;const days=Math.max(0,daysBetween(from,sch[j].due));
  let bal=l.balance||0;
  if(j>(l.iPaid||0)&&l.type==='consumer')bal=Math.max(0,l.principal-Math.max(loanPaidPrincipal(l),cumPrincipal(l,j)));
  return {days,from,amount:Math.round(bal*(l.rate||0)/100*days/365)};
}
/* Các khoản gốc/lãi chưa trả có hạn đến ngày `until` (gồm cả khoản quá hạn) */
function loanDueUntil(l,until){
  const res={p:0,i:0,iCount:0,items:{},overdue:false};
  if(l.status==='closed')return res;
  const sch=loanSchedule(l);if(!sch.length)return res;
  const today=todayStr();const add=(d,k,v)=>{if(v<=0)return;res.items[d]=res.items[d]||{p:0,i:0};res.items[d][k]+=v;if(d<today)res.overdue=true;};
  for(let j=l.iPaid||0;j<sch.length&&sch[j].due<=until;j++){const a=loanPeriodInterest(l,j).amount;res.i+=a;res.iCount++;add(sch[j].due,'i',a);}
  const paid=loanPaidPrincipal(l);
  if(l.type==='overdraft'){const last=sch[sch.length-1];if(last.due<=until){res.p=l.balance;add(last.due,'p',l.balance);}}
  else{for(let k=1;k<=sch.length&&sch[k-1].due<=until;k++){const v=Math.max(0,cumPrincipal(l,k)-Math.max(paid,cumPrincipal(l,k-1)));res.p+=v;add(sch[k-1].due,'p',v);}}
  return res;
}
/* Kỳ tiếp theo của từng khoản vay: kỳ gốc/lãi chưa trả gần nhất (kèm các khoản quá hạn) */
function loanNextSummary(){
  const today=todayStr();const out={p:0,i:0,rows:[],overdue:false};
  loans.forEach(l=>{ensureLoanV2(l);
    if(l.status==='closed'||!l.termMonths)return;
    const np=nextPrincipalDue(l),ni=nextInterestDue(l);
    const nextD=[np&&np.amount>0?np.due:null,ni&&ni.due].filter(Boolean).sort()[0];if(!nextD)return;
    const d=loanDueUntil(l,nextD>today?nextD:today);out.p+=d.p;out.i+=d.i;if(d.overdue)out.overdue=true;
    Object.keys(d.items).forEach(dt=>out.rows.push({date:dt,name:l.name,type:l.type,p:d.items[dt].p,i:d.items[dt].i}));
  });
  out.rows.sort((a,b)=>a.date.localeCompare(b.date));return out;
}
function loanMonthlyInterest(l){const n=nextInterestDue(l);return n?n.amount:0;}
/* Chuyển dữ liệu khoản vay kiểu cũ sang kiểu mới */
function ensureLoanV2(l){
  if(l.v===2)return;
  l.type=l.type||'consumer';
  l.interestDay=l.interestDay||l.payDay||l.principalDay||1;
  const histP=(l.history||[]).reduce((s,h)=>s+(h.principal||0),0);
  l.paidBefore=Math.max(0,(l.principal||0)-(l.balance||0)-histP);
  l.iPaid=0;
  if(l.termMonths&&l.startDate&&l.nextInterestDue){l.iPaid=loanSchedule(l).filter(s=>s.due<l.nextInterestDue).length;}
  l.v=2;recalcLoan(l);
}
function updateLoanPreview(){
  const box=document.getElementById('loanPreview');if(!box)return;
  const principal=num('loanPrincipal'),term=parseInt(document.getElementById('loanTerm').value)||0,day=readDay('loanInterestDay');
  const start=document.getElementById('loanStartDate').value;
  if(!principal||!term||!day||!start){box.innerHTML='';return;}
  const tmp={type:formLoanType,principal,termMonths:term,interestDay:day,startDate:start,paidBefore:num('loanPaid'),history:[],iPaid:0,rate:parseFloat(document.getElementById('loanRate').value)||0};
  recalcLoan(tmp);
  const sch=loanSchedule(tmp),first=sch[0],mat=loanMaturity(tmp);
  let h='Kỳ trả lãi đầu tiên: <b>'+dmy(first.due)+'</b>'+(first.due!==first.nominal?' <span class="shift">(dời từ '+dmy(first.nominal)+')</span>':'');
  if(formLoanType==='consumer'){const np=nextPrincipalDue(tmp);h+='<br>Gốc mỗi tháng: <b>'+fmt(loanMonthlyPrincipal(tmp))+'</b>'+(np&&np.idx>1?'<br>Đã trả trước → kỳ gốc tiếp theo: kỳ '+np.idx+' ('+dmy(np.due)+')':'');}
  h+='<br>Đáo hạn / trả hết gốc: <b>'+dmy(mat)+'</b>';
  box.innerHTML=h;
}
function saveLoan(){
  const name=document.getElementById('loanName').value.trim();
  const bankIdx=document.getElementById('loanBank').value;
  const principal=num('loanPrincipal'),paid=num('loanPaid');
  const startDate=document.getElementById('loanStartDate').value||todayStr();
  const term=parseInt(document.getElementById('loanTerm').value)||0;
  const rate=parseFloat(document.getElementById('loanRate').value)||0;
  const iDay=readDay('loanInterestDay');
  const note=document.getElementById('loanNote').value.trim();
  if(!name){alert('Vui lòng nhập tên khoản vay');return;}
  if(principal<=0){alert('Vui lòng nhập số tiền vay ban đầu');return;}
  if(paid>principal){alert('Số tiền đã trả không được lớn hơn số tiền vay ban đầu');return;}
  if(term<1||term>600){alert('Vui lòng nhập kỳ hạn vay (số tháng)');return;}
  if(!iDay){alert('Vui lòng nhập ngày trả lãi cố định (1–31)');return;}
  const setBank=l=>{if(bankIdx!==''){const b=BANKS[parseInt(bankIdx)];l.bankCode=b.code;l.bankName=b.name;l.bankColor=b.color;}else{delete l.bankCode;delete l.bankName;delete l.bankColor;}};
  if(editingLoanId){
    const l=loans.find(x=>x.id===editingLoanId);if(!l)return;
    const histP=(l.history||[]).reduce((s,h)=>s+(h.principal||0),0);
    if(paid<histP){alert('Số tiền đã trả nợ gốc không được nhỏ hơn tổng gốc đã ghi nhận trong lịch sử trả nợ ('+fmt(histP)+').');return;}
    Object.assign(l,{type:formLoanType,name,principal,startDate,termMonths:term,rate,interestDay:iDay,note,paidBefore:paid-histP});
    setBank(l);recalcLoan(l);
    const sch=loanSchedule(l);if((l.iPaid||0)>sch.length)l.iPaid=sch.length;
    saveAll();toggleLoanForm(false);renderLoans();renderHome();return;
  }
  const disburseWalletId=document.getElementById('loanDisburseWallet').value||null;
  const loan={v:2,id:Date.now(),type:formLoanType,name,principal,paidBefore:paid,balance:principal-paid,startDate,termMonths:term,rate,interestDay:iDay,iPaid:0,note,status:'active',history:[],disburseTxId:null};
  /* kỳ lãi đã qua trước hôm nay coi như đã trả (khoản vay đang trả dở) */
  loan.iPaid=loanSchedule(loan).filter(s=>s.due<todayStr()).length;
  setBank(loan);recalcLoan(loan);
  if(disburseWalletId){
    const w=wallets.find(x=>String(x.id)===String(disburseWalletId));
    if(w){w.balance+=principal;const txId=Date.now()+Math.random();
      txs.unshift({id:txId,type:'thu',amount:principal,group:'Thu nhập',item:'Giải ngân khoản vay',icon:'luong',accent:'#22a765',bg:'#dcefe4',walletId:disburseWalletId,note:'Giải ngân: '+name,date:startDate,time:nowTime(),loanId:loan.id});
      loan.disburseTxId=txId;}
  }
  loans.push(loan);saveAll();toggleLoanForm(false);renderLoans();renderHome();
}
function openEditLoan(id){
  const l=loans.find(x=>x.id===id);if(!l)return;ensureLoanV2(l);
  editingLoanId=id;populateLoanBankSelect();
  document.getElementById('loanName').value=l.name;
  const bi=BANKS.findIndex(b=>b.code===l.bankCode);document.getElementById('loanBank').value=bi>=0?String(bi):'';
  document.getElementById('loanPrincipal').value=fmtShort(l.principal);
  document.getElementById('loanPaid').value=fmtShort(loanPaidPrincipal(l));
  document.getElementById('loanStartDate').value=l.startDate||todayStr();
  document.getElementById('loanTerm').value=l.termMonths||'';
  document.getElementById('loanRate').value=l.rate||'';
  document.getElementById('loanInterestDay').value=l.interestDay||'';
  document.getElementById('loanNote').value=l.note||'';
  document.getElementById('loanDisburseWrap').style.display='none';
  document.getElementById('loanSaveBtn').textContent='Cập nhật khoản vay';
  toggleLoanForm(true);setLoanType(l.type||'consumer');
  document.getElementById('addLoanForm').scrollIntoView({behavior:'smooth',block:'start'});
}
function dueBadge(kind,d,amount){
  const diff=daysBetween(todayStr(),d.due);
  const shift=d.nominal&&d.nominal!==d.due?' • dời từ '+dmy(d.nominal):'';
  const amt=amount!=null?' '+fmtShort(amount)+' 💎':'';
  if(diff<0)return '<span class="loan-badge overdue">'+kind+amt+': quá hạn '+(-diff)+' ngày ('+dmy(d.due)+')</span>';
  if(diff===0)return '<span class="loan-badge overdue">'+kind+amt+': đến hạn hôm nay ('+dmy(d.due)+')</span>';
  return '<span class="loan-badge pending">'+kind+amt+': còn '+diff+' ngày ('+dmy(d.due)+shift+')</span>';
}
function loanScheduleHtml(l){
  const sch=loanSchedule(l);if(!sch.length)return '';
  const paid=loanPaidPrincipal(l),mp=loanMonthlyPrincipal(l);
  const rows=sch.map((s,i)=>{
    const k=i+1;let g='';
    if(l.type==='consumer'){const need=cumPrincipal(l,k)-cumPrincipal(l,k-1);const covered=Math.min(need,Math.max(0,paid-cumPrincipal(l,k-1)));g=covered>=need?'<span style="color:var(--green)">✓ đã trả</span>':(covered>0?'còn '+fmtShort(need-covered):fmtShort(need));}
    else g=k===sch.length?(l.balance>0?fmtShort(l.balance):'<span style="color:var(--green)">✓</span>'):'—';
    const iDone=k<=(l.iPaid||0);
    return '<tr><td>'+k+'</td><td>'+dmy(s.due)+(s.due!==s.nominal?'<span class="shift">*</span>':'')+'</td><td>'+g+'</td><td>'+(iDone?'<span style="color:var(--green)">✓</span>':'chưa')+'</td></tr>';
  }).join('');
  return '<div class="loan-sched" id="loanSched_'+l.id+'" style="display:none;"><table><tr><th>Kỳ</th><th>Ngày trả</th><th>Gốc</th><th>Lãi</th></tr>'+rows+'</table>'+
    '<div class="loan-hint" style="margin-top:6px;">* Ngày đã dời do trùng Thứ 7, Chủ nhật hoặc ngày lễ.'+(l.type==='consumer'?' Gốc mỗi kỳ: '+fmt(mp)+'.':'')+'</div></div>';
}
function renderLoans(){
  loans.forEach(ensureLoanV2);
  const active=loans.filter(l=>l.status!=='closed');
  document.getElementById('loanTotalLine').textContent=fmt(active.reduce((s,l)=>s+l.balance,0));
  const ms=loanNextSummary(),today=todayStr();
  document.getElementById('loanMonthBox').innerHTML=loans.length?
    '<div class="ls-grid"><div><span>Tổng gốc kỳ tiếp theo</span><b>'+fmt(ms.p)+'</b></div>'+
    '<div><span>Tổng lãi kỳ tiếp theo</span><b>'+fmt(ms.i)+'</b></div></div>'+
    '<div class="ls-total"><span>Tổng gốc lãi phải trả kỳ tiếp theo</span><b>'+fmt(ms.p+ms.i)+'</b></div>'+
    (ms.rows.length?'<div class="ls-rows">'+ms.rows.map(r=>'<div class="ls-row'+(r.date<today?' od':'')+'"><span class="d">'+dmy(r.date).slice(0,5)+(r.date<today?' ⚠':'')+'</span><span class="n">'+r.name+'</span><span class="v">'+(r.p?'Gốc '+fmtShort(r.p):'')+(r.p&&r.i?' • ':'')+(r.i?'Lãi '+fmtShort(r.i):'')+'</span></div>').join('')+'</div>':'<div class="loan-hint" style="margin:8px 0 0;">Không có khoản gốc, lãi nào sắp đến hạn.</div>')+
    '<div class="loan-hint" style="margin:8px 0 0;">Mỗi khoản vay lấy kỳ trả gần nhất chưa thanh toán'+(ms.overdue?', kèm các khoản quá hạn (⚠)':'')+'. Lãi là số ước tính theo dư nợ hiện tại.</div>':'';
  const list=document.getElementById('loanList');
  if(!loans.length){list.innerHTML='<div class="empty">Chưa có khoản vay ngân hàng nào. Thêm khoản vay thấu chi hoặc vay tiêu dùng để theo dõi dư nợ và lịch trả nợ.</div>';return;}
  const firstDue=l=>{const a=nextPrincipalDue(l),b=nextInterestDue(l);return [a&&a.due,b&&b.due].filter(Boolean).sort()[0]||'9999';};
  const sorted=loans.slice().sort((a,b)=>{if(a.status!==b.status)return a.status==='active'?-1:1;return firstDue(a).localeCompare(firstDue(b));});
  const walletOpts=()=>getSpendableWallets().map(x=>'<option value="'+x.id+'">'+x.name+' ('+fmt(x.balance)+')</option>').join('')||'<option value="">Chưa có ví</option>';
  list.innerHTML=sorted.map(l=>{
    const paid=loanPaidPrincipal(l);
    const pctPaid=l.principal>0?Math.min(100,Math.round(paid/l.principal*100)):0;
    const np=nextPrincipalDue(l),ni=nextInterestDue(l);
    const incomplete=!l.termMonths||!l.startDate;
    let badges='';
    if(l.status==='closed')badges='<span class="loan-badge closed">Đã tất toán</span>';
    else if(incomplete)badges='<span class="loan-badge overdue">Thiếu kỳ hạn vay — bấm "Sửa khoản vay" để bổ sung</span>';
    else{
      const od=loanDueUntil(l,addDays(todayStr(),-1));
      const odK=Object.values(od.items).filter(x=>x.p>0).length;
      const pKind=l.type==='overdraft'?'Trả gốc cuối kỳ':(np&&np.due<todayStr()&&odK>1?'Trả gốc '+odK+' kỳ':'Trả gốc kỳ '+(np?np.idx:''));
      const pAmt=np&&np.due<todayStr()&&od.p>0?od.p:(np?np.amount:0);
      const iKind=ni&&ni.due<todayStr()&&od.iCount>1?'Trả lãi '+od.iCount+' kỳ':'Trả lãi';
      const iAmt=ni&&ni.due<todayStr()&&od.i>0?od.i:(ni?ni.amount:0);
      badges='<div class="loan-due">'+
        (np?dueBadge(pKind,np,pAmt):'')+
        (ni?dueBadge(iKind,ni,iAmt):'')+'</div>';
    }
    let prepaid='';
    if(l.type==='consumer'&&np&&l.status!=='closed'){
      const today=todayStr();const sch=loanSchedule(l);const dueNow=sch.filter(s=>s.due<=today).length;
      if(np.idx-1>dueNow&&np.idx-1>0)prepaid='<div class="loan-hint" style="margin-top:6px;color:var(--green)">Đã trả gốc trước '+(np.idx-1-dueNow)+' kỳ — kỳ gốc tiếp theo: '+dmy(np.due)+'</div>';
    }
    let payBox='';
    if(l.status!=='closed'){
      const nextD=[np&&np.due,ni&&ni.due].filter(Boolean).sort()[0]||todayStr();
      const dd=loanDueUntil(l,nextD>todayStr()?nextD:todayStr());
      const preP=dd.p,preI=dd.i;
      const iLbl=dd.iCount>1?' — '+dd.iCount+' kỳ lãi chưa trả, tự tính theo dư nợ, có thể sửa':(ni?' — kỳ '+ni.idx+': '+ni.days+' ngày, tự tính theo dư nợ, có thể sửa':'');
      payBox='<div class="loan-pay-box" id="loanPayBox_'+l.id+'" style="display:none;">'+
        '<div class="field"><label>Ngày trả</label><input type="date" id="loanPayDate_'+l.id+'" value="'+todayStr()+'"></div>'+
        '<div class="field"><label>Trả nợ gốc (💎)'+(l.type==='consumer'?' — trả nhiều hơn sẽ lùi lịch trả gốc':'')+'</label><input type="tel" inputmode="numeric" id="loanPayPrincipal_'+l.id+'" value="'+(preP?fmtShort(preP):'')+'" placeholder="0" oninput="fmtInput(this)"></div>'+
        '<div class="field"><label>Trả lãi (💎)'+iLbl+'</label><input type="tel" inputmode="numeric" id="loanPayInterest_'+l.id+'" value="'+(preI?fmtShort(preI):'')+'" placeholder="0" oninput="fmtInput(this)"></div>'+
        '<div class="field"><label>Trả từ ví</label><select id="loanPayWallet_'+l.id+'">'+walletOpts()+'</select></div>'+
        '<button class="save-btn" style="margin-top:4px;" onclick="submitLoanPayment('+l.id+')">Xác nhận đã trả</button>'+
        '</div>';
    }
    const histRows=(l.history||[]).map(h=>'<div class="loan-hist-row"><span>'+dmy(h.date)+'</span><span class="lh-txt">Gốc '+fmtShort(h.principal)+' 💎 • Lãi '+fmtShort(h.interest)+' 💎</span><button class="icon-btn" style="color:var(--blue)" onclick="toggleHistEdit(\''+h.id+'\')">✎</button><button class="icon-btn" style="color:var(--sub)" onclick="deleteLoanHist('+l.id+',\''+h.id+'\')">✕</button></div>'+
      '<div class="loan-hist-edit" id="lhe_'+h.id+'"><input type="date" id="lhd_'+h.id+'" value="'+h.date+'"><input type="tel" inputmode="numeric" id="lhp_'+h.id+'" placeholder="Trả gốc" value="'+fmtShort(h.principal)+'" oninput="fmtInput(this)"><input type="tel" inputmode="numeric" id="lhi_'+h.id+'" placeholder="Trả lãi" value="'+fmtShort(h.interest)+'" oninput="fmtInput(this)"><button onclick="saveLoanHist('+l.id+',\''+h.id+'\')">Lưu</button><button style="background:#3a342d;color:var(--text)" onclick="toggleHistEdit(\''+h.id+'\')">Huỷ</button></div>').join('');
    return '<div class="loan-item">'+
      '<div class="loan-top"><div><div class="loan-name">'+l.name+' <span class="loan-type-chip">'+(LOAN_TYPES[l.type]||'')+'</span></div><div class="loan-bank">'+(l.bankName?l.bankName+' • ':'')+(l.termMonths?l.termMonths+' tháng • đáo hạn '+dmy(loanMaturity(l)):'')+'</div></div><div class="loan-bal">'+fmt(l.balance)+'<div style="font-size:12px;font-weight:600;color:var(--sub);">dư nợ</div></div></div>'+
      '<div class="loan-grid"><div><span>Số tiền vay ban đầu</span><b>'+fmt(l.principal)+'</b></div><div><span>Đã trả nợ gốc</span><b>'+fmt(paid)+' ('+pctPaid+'%)</b></div>'+
      '<div><span>Lãi suất</span><b>'+(l.rate||0)+'%/năm</b></div><div><span>'+(l.type==='consumer'?'Gốc mỗi tháng':'Ngày trả lãi')+'</span><b>'+(l.type==='consumer'?fmt(loanMonthlyPrincipal(l)):'Ngày '+l.interestDay+' hàng tháng')+'</b></div></div>'+
      '<div class="bar-bg" style="margin-top:8px;"><div class="bar-fill" style="width:'+pctPaid+'%;background:var(--blue)"></div></div>'+
      badges+prepaid+
      (l.note?'<div class="debt-sub" style="margin-top:6px;">'+l.note+'</div>':'')+
      (histRows?'<div style="margin-top:8px;">'+histRows+'</div>':'')+
      '<div class="loan-actions">'+(l.status!=='closed'?'<button onclick="toggleLoanPayBox('+l.id+')">Ghi nhận trả nợ</button>':'')+(incomplete?'':'<button onclick="toggleLoanSched('+l.id+')">Lịch trả nợ</button>')+'<button onclick="openEditLoan('+l.id+')">Sửa khoản vay</button><button onclick="deleteLoan('+l.id+')">Xoá khoản vay</button></div>'+
      (incomplete?'':loanScheduleHtml(l))+payBox+
      '</div>';
  }).join('');
}
function toggleLoanPayBox(id){const box=document.getElementById('loanPayBox_'+id);if(box)box.style.display=box.style.display==='none'?'block':'none';}
function toggleLoanSched(id){const box=document.getElementById('loanSched_'+id);if(box)box.style.display=box.style.display==='none'?'block':'none';}
function submitLoanPayment(id){
  const l=loans.find(x=>x.id===id);if(!l)return;
  const principal=num('loanPayPrincipal_'+id),interest=num('loanPayInterest_'+id);
  const walletId=document.getElementById('loanPayWallet_'+id).value;
  const date=document.getElementById('loanPayDate_'+id).value||todayStr();
  if(principal<=0&&interest<=0){alert('Vui lòng nhập số tiền trả gốc hoặc lãi');return;}
  if(principal>l.balance){alert('Số tiền trả gốc lớn hơn dư nợ còn lại ('+fmt(l.balance)+')');return;}
  if(!walletId){alert('Vui lòng chọn ví trả nợ');return;}
  const w=wallets.find(x=>String(x.id)===String(walletId));if(!w)return;
  w.balance-=principal+interest;
  const hid='h'+Date.now();
  const sch=loanSchedule(l),ip=l.iPaid||0;let iCount=0;
  if(interest>0){iCount=1;const lim=ip<sch.length&&sch[ip].due>date?sch[ip].due:date;for(let j=ip+1;j<sch.length&&sch[j].due<=lim;j++)iCount++;iCount=Math.min(iCount,Math.max(1,sch.length-ip));}
  const h={id:hid,date,principal,interest,walletId,iCount,txP:null,txI:null};
  if(principal>0){h.txP=Date.now()+Math.random();txs.unshift({id:h.txP,type:'chi',amount:principal,group:'Khác',item:'Trả nợ gốc vay',icon:'khac',accent:'#7c8b98',bg:'#e7e9ee',walletId,note:'Trả gốc: '+l.name,date,time:nowTime(),loanId:l.id,loanHistId:hid});}
  if(interest>0){h.txI=Date.now()+Math.random()+1;txs.unshift({id:h.txI,type:'chi',amount:interest,group:'Khác',item:'Trả lãi vay',icon:'khac',accent:'#7c8b98',bg:'#e7e9ee',walletId,note:'Trả lãi: '+l.name,date,time:nowTime(),loanId:l.id,loanHistId:hid});l.iPaid=Math.min(sch.length,ip+iCount);}
  l.history=l.history||[];l.history.unshift(h);
  recalcLoan(l);
  saveAll();renderLoans();renderHome();
}
function fmtInput(el){const d=el.value.replace(/\D/g,'');el.value=d?Number(d).toLocaleString('vi-VN'):'';}
function toggleHistEdit(hid){const e=document.getElementById('lhe_'+hid);if(e)e.style.display=e.style.display==='block'?'none':'block';}
function findHistTx(l,h,item,txKey){
  if(h[txKey])return txs.find(t=>t.id===h[txKey]);
  return txs.find(t=>t.loanId===l.id&&t.item===item&&t.date===h.date&&!t.loanHistId&&t.amount===(item==='Trả nợ gốc vay'?h.principal:h.interest));
}
function setHistTx(l,h,item,txKey,amount,date){
  let t=findHistTx(l,h,item,txKey);
  const w=wallets.find(x=>String(x.id)===String(h.walletId));
  if(t){if(w)w.balance+=t.amount;
    if(amount>0){t.amount=amount;t.date=date;t.loanHistId=h.id;h[txKey]=t.id;if(w)w.balance-=amount;}
    else{txs=txs.filter(x=>x!==t);h[txKey]=null;}}
  else if(amount>0){const id=Date.now()+Math.random()+(txKey==='txI'?1:0);txs.unshift({id,type:'chi',amount,group:'Khác',item,icon:'khac',accent:'#7c8b98',bg:'#e7e9ee',walletId:h.walletId,note:(txKey==='txP'?'Trả gốc: ':'Trả lãi: ')+l.name,date,time:nowTime(),loanId:l.id,loanHistId:h.id});h[txKey]=id;if(w)w.balance-=amount;}
}
function histICount(h){if(h.iCount!=null)return h.iCount;if(h.iPeriod!==undefined)return h.iPeriod?1:0;return h.interest>0?1:0;}
function saveLoanHist(loanId,hid){
  const l=loans.find(x=>x.id===loanId);if(!l)return;const h=(l.history||[]).find(x=>String(x.id)===String(hid));if(!h)return;
  const date=document.getElementById('lhd_'+hid).value||h.date;
  const p=num('lhp_'+hid),i=num('lhi_'+hid);
  if(p<=0&&i<=0){alert('Số tiền trả gốc hoặc lãi phải lớn hơn 0. Muốn huỷ lần trả này hãy bấm ✕.');return;}
  setHistTx(l,h,'Trả nợ gốc vay','txP',p,date);setHistTx(l,h,'Trả lãi vay','txI',i,date);
  const cnt=histICount(h);
  if(cnt>0&&i<=0){l.iPaid=Math.max(0,(l.iPaid||0)-cnt);h.iCount=0;}
  else if(cnt===0&&i>0){l.iPaid=Math.min(loanSchedule(l).length,(l.iPaid||0)+1);h.iCount=1;}
  else h.iCount=cnt;
  delete h.iPeriod;h.principal=p;h.interest=i;h.date=date;
  recalcLoan(l);
  saveAll();renderLoans();renderHome();
}
function deleteLoanHist(loanId,hid,silent){
  const l=loans.find(x=>x.id===loanId);if(!l)return;const h=(l.history||[]).find(x=>String(x.id)===String(hid));if(!h)return;
  if(!silent&&!confirm('Xoá lần trả nợ ngày '+dmy(h.date)+'? Số tiền sẽ được hoàn lại vào ví và cộng lại dư nợ.'))return;
  setHistTx(l,h,'Trả nợ gốc vay','txP',0,h.date);setHistTx(l,h,'Trả lãi vay','txI',0,h.date);
  l.iPaid=Math.max(0,(l.iPaid||0)-histICount(h));
  l.history=l.history.filter(x=>x!==h);
  recalcLoan(l);
  saveAll();renderLoans();renderHome();renderHistory();
}
function deleteLoan(id){
  const l=loans.find(x=>x.id===id);if(!l)return;
  if(!confirm('Xoá khoản vay "'+l.name+'"? Giao dịch giải ngân liên quan (nếu có) cũng sẽ bị xoá và trừ lại số dư ví.'))return;
  if(l.disburseTxId){const t=txs.find(x=>x.id===l.disburseTxId);if(t){reverseTxBalance(t);txs=txs.filter(x=>x.id!==l.disburseTxId);}}
  loans=loans.filter(x=>x.id!==id);
  saveAll();renderLoans();renderHome();renderHistory();
}
function repairLoanTxAmounts(){
  let fixed=false;
  txs.forEach(t=>{if(t.loanId&&(t.amount===undefined||t.amount===null||isNaN(t.amount))&&(t.item==='Trả nợ gốc vay'||t.item==='Trả lãi vay'||t.item==='Giải ngân khoản vay')){
    const l=loans.find(x=>x.id===t.loanId);const h=l&&(l.history||[]).find(x=>x.date===t.date);
    t.amount=t.item==='Giải ngân khoản vay'?(l?l.principal:0):(h?(t.item==='Trả nợ gốc vay'?h.principal:h.interest):0);fixed=true;}});
  wallets.forEach(w=>{if(w.balance===null||isNaN(w.balance)){w.balance=0;fixed=true;}});
  loans.forEach(l=>{if(l.v!==2){ensureLoanV2(l);fixed=true;}});
  if(fixed)saveAll();
}
function checkLoanPaymentsDue(){
  const t=todayStr();const due=[];
  loans.forEach(ensureLoanV2);
  loans.filter(l=>l.status==='active').forEach(l=>{
    const np=nextPrincipalDue(l),ni=nextInterestDue(l);
    if(np&&np.due<=t&&np.amount>0)due.push(l.name+' – trả gốc '+fmtShort(np.amount)+' 💎 ('+dmy(np.due)+')');
    if(ni&&ni.due<=t)due.push(l.name+' – trả lãi ~'+fmtShort(ni.amount)+' 💎 ('+dmy(ni.due)+')');
  });
  saveAll();
  if(!due.length)return;
  alert('Khoản vay đến hạn:\n• '+due.join('\n• ')+'\n\nVào mục "Vay ngân hàng" để ghi nhận trả nợ.');
}

/* ---------- SAVING POINTS / REWARD ---------- */
function addDays(dateStr,days){const p=dateStr.split('-').map(Number);const d=new Date(p[0],p[1]-1,p[2]+days);return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');}
function todaysRewardCount(){const today=todayStr();return rewardHistory.filter(h=>h.created_at.slice(0,10)===today&&(h.reward_type==='CHI_TIEU_HOP_LY'||h.reward_type==='SAVING_EXPENSE')).length;}
function nextAchievement(){return ACHIEVEMENTS.find(a=>!userAchievements.find(u=>u.code===a.code));}

function awardBaseLinhThach(t){
  // Mỗi lần ghi chép 1 giao dịch mới = +1 Linh Lực (nền tảng tu luyện)
  const now=new Date(); const today=todayStr();
  t.reward_points=1;
  rewardHistory.unshift({id:Date.now()+Math.random(),transaction_id:t.id,reward_type:'GHI_CHEP',points:1,created_at:now.toISOString()});
  rewardProfile.total_points=(rewardProfile.total_points||0)+1;
  if(!rewardProfile.last_reward_date){rewardProfile.current_streak=1;}
  else if(rewardProfile.last_reward_date===today){/* đã tu luyện hôm nay, streak giữ nguyên */}
  else if(rewardProfile.last_reward_date===addDays(today,-1)){rewardProfile.current_streak=(rewardProfile.current_streak||0)+1;}
  else{rewardProfile.current_streak=1;}
  rewardProfile.last_reward_date=today;
  rewardProfile.longest_streak=Math.max(rewardProfile.longest_streak||0,rewardProfile.current_streak);
  let unlocked=null;
  ACHIEVEMENTS.forEach(a=>{
    const already=userAchievements.find(u=>u.code===a.code);
    if(!already&&rewardProfile.total_points>=a.required){userAchievements.push({code:a.code,unlocked_at:now.toISOString()});unlocked=a;}
  });
  if(document.getElementById('screen-home').classList.contains('active'))renderHome();
  if(document.getElementById('screen-reward').classList.contains('active'))renderReward();
  if(unlocked)setTimeout(()=>showMilestoneModal(unlocked),350);
}
function awardSavingReward(txId){
  const t=txs.find(x=>x.id===txId);
  if(!t)return;
  if(t.type!=='chi')return; // chỉ áp dụng cho khoản chi
  if(t.reward_status==='REWARDED')return; // đảm bảo idempotent, không x2 lần 2
  if(todaysRewardCount()>=DAILY_REWARD_LIMIT){
    showRewardToast({limitReached:true});
    return;
  }
  const now=new Date();
  const today=todayStr();
  const bonus=t.reward_points||1; // x2: cộng thêm đúng bằng số linh lực đã có
  t.reward_status='REWARDED';t.reward_points=(t.reward_points||1)+bonus;t.rewarded_at=now.toISOString();
  rewardHistory.unshift({id:Date.now()+Math.random(),transaction_id:t.id,reward_type:'CHI_TIEU_HOP_LY',points:bonus,created_at:now.toISOString()});
  rewardProfile.total_points=(rewardProfile.total_points||0)+bonus;

  // Cập nhật streak theo ngày (logic mục 13)
  if(!rewardProfile.last_reward_date){
    rewardProfile.current_streak=1;
  }else if(rewardProfile.last_reward_date===today){
    // đã có giao dịch hôm nay rồi, streak không đổi
  }else if(rewardProfile.last_reward_date===addDays(today,-1)){
    rewardProfile.current_streak=(rewardProfile.current_streak||0)+1;
  }else{
    rewardProfile.current_streak=1;
  }
  rewardProfile.last_reward_date=today;
  rewardProfile.longest_streak=Math.max(rewardProfile.longest_streak||0,rewardProfile.current_streak);

  // Kiểm tra mở khoá thành tích
  let unlocked=null;
  ACHIEVEMENTS.forEach(a=>{
    const already=userAchievements.find(u=>u.code===a.code);
    if(!already&&rewardProfile.total_points>=a.required){
      userAchievements.push({code:a.code,unlocked_at:now.toISOString()});
      unlocked=a;
    }
  });

  saveAll();
  if(document.getElementById('screen-home').classList.contains('active'))renderHome();
  if(document.getElementById('screen-history').classList.contains('active'))renderHistory();
  if(document.getElementById('screen-reward').classList.contains('active'))renderReward();
  showRewardToast({points:bonus,total:t.reward_points,streak:rewardProfile.current_streak,achievement:unlocked});
  if(unlocked)setTimeout(()=>showMilestoneModal(unlocked),350);
}

function showRewardToast(opt){
  const el=document.getElementById('rwToast');
  if(opt.custom){el.innerHTML='<div class="rw-toast-line">'+opt.custom+'</div>';}
  else if(opt.limitReached){
    el.innerHTML='<div class="rw-toast-line">🎯 Bạn đã đạt giới hạn x2 hôm nay</div><div class="rw-toast-sub">'+DAILY_REWARD_LIMIT+'/'+DAILY_REWARD_LIMIT+' lượt x2 Linh Lực hôm nay</div>';
  }else{
    let html='<div class="rw-toast-line">✨ Chi tiêu hợp lý! x2 → <b>'+opt.total+'</b> Linh Lực</div>';
    if(opt.streak>1)html+='<div class="rw-toast-sub">🔥 Chuỗi tu luyện: '+opt.streak+' ngày</div>';
    if(opt.achievement)html+='<div class="rw-toast-sub">🐾 Linh thú tiến hoá: '+opt.achievement.name+'</div>';
    el.innerHTML=html;
  }
  el.classList.add('show');
  clearTimeout(window._rwToastTimer);
  window._rwToastTimer=setTimeout(()=>el.classList.remove('show'),2800);
}
function showMilestoneModal(a){
  if(a&&a.idx!==undefined){showBreakthrough(Math.max(0,a.idx-1),a.idx);return;}
  document.getElementById('rwMilestoneIcon').innerHTML='<img src="'+PET_IMGS[a.idx]+'" style="width:96px;height:125px;border-radius:12px;object-fit:contain;filter:drop-shadow(0 0 16px #00e5ff);">';
  document.getElementById('rwMilestoneName').textContent=a.name;
  document.getElementById('rwMilestonePoints').textContent=a.required;
  document.getElementById('rwMilestoneModal').classList.add('show');
}
function closeMilestoneModal(){document.getElementById('rwMilestoneModal').classList.remove('show');}

const PET_IMGS=[];for(let i=1;i<=14;i++)PET_IMGS.push('pets/stage'+i+'.jpg');
const PET_TALK={
  1:['Linh khí đang tụ lại quanh ta~ ✨','Chủ nhân ghi chép chi tiêu để ta tu luyện nhé!','Chi tiêu hợp lý, linh lực gấp đôi đó~','Meo~ hôm nay chủ nhân tiết kiệm chưa?'],
  2:['Tâm cảnh thanh tịnh, tiền tài tự đến 🌙','Buông bỏ chi tiêu thừa, tu vi tăng tiến~','Ta cảm nhận được niết bàn đang đến gần!'],
  3:['Không kiếp vô biên, cùng chủ nhân đồng hành 💫','Thần thú hộ mệnh túi tiền của người!','Đạo tiết kiệm, vạn pháp quy nhất~']
};
// Video động theo cảnh giới (index 0 = Ngưng Khí). Thêm video khác: PET_VIDEOS[1]='data:video/mp4;base64,...'
// Video mỗi cảnh giới: pets/1.mp4 ... pets/14.mp4. Muốn đổi video chỉ cần thay file cùng tên.
const PET_VIDEOS={};for(let i=0;i<14;i++)PET_VIDEOS[i]='pets/'+(i+1)+'.mp4';
let petPreviewSt=null; // xem lại cảnh giới đã đạt
function petStageIndex(){const p=rewardProfile.total_points||0;let i=0;PET_STAGES.forEach((a,k)=>{if(p>=a.required)i=k;});return i;}
function renderPet(){
  const real=petStageIndex();
  if(petPreviewSt!==null&&petPreviewSt>real)petPreviewSt=null;
  const st=petPreviewSt!==null?petPreviewSt:real,S=PET_STAGES[st],img=document.getElementById('petImg'),box=document.getElementById('petStage');
  if(!img)return;
  img.src=PET_IMGS[st];
  const vid=document.getElementById('petVid');
  if(PET_VIDEOS[st]){
    vid.muted=true;vid.defaultMuted=true;vid.setAttribute('muted','');vid.setAttribute('playsinline','');vid.setAttribute('webkit-playsinline','');
    if(vid.dataset.st!==String(st)){vid.src=PET_VIDEOS[st];vid.dataset.st=st;vid.load();}
    vid.onerror=()=>{vid.style.display='none';img.style.display='block';console.warn('Không tải được video pet:',PET_VIDEOS[st]);};
    vid.style.display='block';img.style.display='none';
    petPlayVideo();
  }else{vid.pause();vid.style.display='none';img.style.display='block';}
  box.style.setProperty('--glow',(10+st*4)+'px');
  const nm=rewardProfile.pet_name||'Linh Thú';
  document.getElementById('petName').innerHTML=nm+' ✎<small id="petStageName">Cảnh giới '+(st+1)+'/14 · '+S.name+' (Bước '+S.step+')</small>';
  document.getElementById('petLv').textContent=st+1;
  if(petPreviewSt!==null)document.getElementById('petStageName').innerHTML+=' · <u onclick="event.stopPropagation();petPreviewSt=null;renderReward()">về hiện tại</u>';
  document.getElementById('petTalk').textContent=S.desc;
}
function petPlayVideo(){['petVid','homePetVid'].forEach(id=>{const v=document.getElementById(id);if(v&&v.style.display!=='none'&&v.paused){const pl=v.play();if(pl&&pl.catch)pl.catch(()=>{});}});}
document.addEventListener('touchstart',petPlayVideo,{passive:true});document.addEventListener('click',petPlayVideo);
function petTap(){
  petPlayVideo();
  const box=document.getElementById('petStage');box.classList.remove('bounce');void box.offsetWidth;box.classList.add('bounce');
  const m=petMood();const lines=PET_TALK[PET_STAGES[petStageIndex()].step];document.getElementById('petTalk').textContent=(m.k!=='normal'&&Math.random()<.5)?m.say:lines[Math.floor(Math.random()*lines.length)];
}
function renamePet(){const n=prompt('Đặt tên cho linh thú:',rewardProfile.pet_name||'Linh Thú');if(n&&n.trim()){rewardProfile.pet_name=n.trim().slice(0,20);saveAll();renderPet();renderHomePet();}}
/* ---------- LINH LỰC CHUNG ---------- */
function grantLinhLuc(pts,type,txId){
  const before=petStageIndex(),now=new Date();
  rewardProfile.total_points=(rewardProfile.total_points||0)+pts;
  rewardHistory.unshift({id:Date.now()+Math.random(),transaction_id:txId||null,reward_type:type,points:pts,created_at:now.toISOString()});
  ACHIEVEMENTS.forEach(a=>{if(!userAchievements.find(u=>u.code===a.code)&&rewardProfile.total_points>=a.required)userAchievements.push({code:a.code,unlocked_at:now.toISOString()});});
  saveAll();
  const after=petStageIndex();
  if(after>before)setTimeout(()=>showBreakthrough(before,after),400);
}

/* ---------- TÂM TRẠNG PET ---------- */
function petMood(){
  const today=todayStr();
  const last=txs.filter(t=>t.type!=='transfer').map(t=>t.date).sort().pop();
  const idle=last?Math.floor((new Date(today)-new Date(last))/864e5):null;
  if(txs.length&&idle!==null&&idle>=3)return {k:'hungry',e:'🍂',l:'Đói linh khí',flt:'saturate(.5) brightness(.85)',say:'Đã '+idle+' ngày chủ nhân chưa ghi chép… ta đói linh khí quá~'};
  const curYm=today.slice(0,7);const mChi=txs.filter(t=>t.type==='chi'&&t.date.slice(0,7)===curYm);
  const over=GROUPS.chi.filter(g=>budgets[g.name]>0&&mChi.filter(t=>t.group===g.name).reduce((a,t)=>a+t.amount,0)>budgets[g.name]).map(g=>g.name);
  if(over.length)return {k:'sad',e:'😢',l:'Buồn bã',flt:'grayscale(.45) brightness(.9)',say:'Linh khí đang tán loạn… nhóm '+over.join(', ')+' đã vượt ngân sách rồi!'};
  const totB=GROUPS.chi.reduce((a,g)=>a+(budgets[g.name]||0),0);
  const d=new Date(),dim=new Date(d.getFullYear(),d.getMonth()+1,0).getDate();
  const spent=mChi.reduce((a,t)=>a+t.amount,0);
  if((totB>0&&spent/totB<=d.getDate()/dim)||last===today)return {k:'happy',e:'😊',l:'Vui vẻ',flt:'brightness(1.06) saturate(1.1)',say:totB>0?'Chủ nhân chi tiêu trong ngân sách, ta vui lắm~ ✨':'Hôm nay chủ nhân đã ghi chép, linh khí dồi dào~'};
  return {k:'normal',e:'🙂',l:'Bình thường',flt:'none',say:'Hôm nay chủ nhân nhớ ghi chép chi tiêu nhé~'};
}
function applyMood(){
  const m=petMood();
  ['petVid','petImg','homePetVid','homePetImg'].forEach(id=>{const e=document.getElementById(id);if(e)e.style.filter=m.flt;});
  const h=document.getElementById('homePetMood');if(h)h.textContent=m.e+' '+m.l;
  const c=document.getElementById('petMoodChip');if(c)c.textContent=m.e+' '+m.l;
  return m;
}

/* ---------- THƯỞNG NGÂN SÁCH THÁNG ---------- */
function checkMonthlyBudgetBonus(){
  const d=new Date(),prev=new Date(d.getFullYear(),d.getMonth()-1,1);
  const pym=prev.getFullYear()+'-'+String(prev.getMonth()+1).padStart(2,'0');
  if(rewardProfile.budget_bonus_month===pym)return;
  const totB=GROUPS.chi.reduce((a,g)=>a+(budgets[g.name]||0),0);
  const pChi=txs.filter(t=>t.type==='chi'&&t.date.slice(0,7)===pym);
  if(totB>0&&pChi.length&&pChi.reduce((a,t)=>a+t.amount,0)<=totB){
    rewardProfile.budget_bonus_month=pym;grantLinhLuc(20,'THUONG_NGAN_SACH');
    setTimeout(()=>showRewardToast({custom:'🎁 Tháng trước chi trong ngân sách! <b>+20</b> Linh Lực'}),600);
  }else{rewardProfile.budget_bonus_month=pym;saveAll();}
}

/* ---------- NHIỆM VỤ HẰNG NGÀY ---------- */
const QUEST_POOL=[
  {id:'log3',t:'Ghi chép 3 giao dịch',r:3,check:()=>txs.filter(t=>t.date===todayStr()).length>=3},
  {id:'x2',t:'Đánh dấu 1 khoản chi tiêu hợp lý ✨',r:2,check:()=>todaysRewardCount()>=1},
  {id:'thu1',t:'Ghi 1 khoản thu',r:1,check:()=>txs.some(t=>t.type==='thu'&&t.date===todayStr())},
  {id:'visit',t:'Ghé thăm linh thú',r:1,check:()=>rewardProfile.visit_date===todayStr()},
  {id:'nofun',t:'Không chi Giải trí hôm nay',r:2,night:1,check:()=>!txs.some(t=>t.type==='chi'&&t.date===todayStr()&&t.item==='Giải trí')},
  {id:'nocafe',t:'Không chi Cà phê hôm nay',r:2,night:1,check:()=>!txs.some(t=>t.type==='chi'&&t.date===todayStr()&&t.item==='Cà phê')},
  {id:'underavg',t:'Chi hôm nay thấp hơn trung bình ngày trong tháng',r:3,night:1,check:()=>{const td=todayStr(),ymv=td.slice(0,7);const m=txs.filter(t=>t.type==='chi'&&t.date.slice(0,7)===ymv&&t.date<td);const days=new Date(td).getDate()-1;if(!days||!m.length)return false;const avg=m.reduce((a,t)=>a+t.amount,0)/days;return txs.filter(t=>t.type==='chi'&&t.date===td).reduce((a,t)=>a+t.amount,0)<avg;}}
];
function todaysQuests(){
  const td=todayStr();let h=0;for(const c of td)h=(h*31+c.charCodeAt(0))%9973;
  const rest=QUEST_POOL.filter(q=>q.id!=='log3');const pick=[QUEST_POOL[0]];
  while(pick.length<3){const q=rest[h%rest.length];if(!pick.includes(q))pick.push(q);h=(h*7+3)%9973;}
  if(!rewardProfile.quests||rewardProfile.quests.date!==td)rewardProfile.quests={date:td,claimed:[]};
  return pick;
}
function questReady(q){return q.check()&&(!q.night||new Date().getHours()>=20);}
function renderQuests(){
  const qs=todaysQuests(),cl=rewardProfile.quests.claimed;
  const mini=document.getElementById('rwMiniQuest');if(mini)mini.textContent=cl.length+'/3';
  const el=document.getElementById('questList');if(!el)return;
  el.innerHTML=qs.map(q=>{const done=cl.includes(q.id),ok=!done&&questReady(q);
    const hint=q.night?(new Date().getHours()<20?'Nhận thưởng sau 20:00':''):'';
    return '<div class="quest"><div class="q-t">'+q.t+'<small>+'+q.r+' ✨ linh lực'+(hint?' · '+hint:'')+'</small></div>'+(done?'<button class="q-done">✓ Đã nhận</button>':ok?'<button class="q-claim" onclick="claimQuest(\''+q.id+'\')">Nhận</button>':'<button class="q-go">Chưa xong</button>')+'</div>';}).join('');
}
function claimQuest(id){
  const q=todaysQuests().find(x=>x.id===id);if(!q||rewardProfile.quests.claimed.includes(id)||!questReady(q))return;
  rewardProfile.quests.claimed.push(id);grantLinhLuc(q.r,'NHIEM_VU');
  showRewardToast({custom:'📜 Hoàn thành nhiệm vụ! <b>+'+q.r+'</b> Linh Lực'});
  renderReward();renderHome();
}

/* ---------- HIỆU ỨNG ĐỘT PHÁ ---------- */
function playBreakSound(){
  try{const C=window.AudioContext||window.webkitAudioContext;const ctx=new C();
    [523,659,784,1047,1319].forEach((f,i)=>{const o=ctx.createOscillator(),g=ctx.createGain();o.type='triangle';o.frequency.value=f;o.connect(g);g.connect(ctx.destination);const t=ctx.currentTime+1.2+i*.12;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.18,t+.02);g.gain.exponentialRampToValueAtTime(.001,t+1.2);o.start(t);o.stop(t+1.3);});
    const o=ctx.createOscillator(),g=ctx.createGain();o.type='sine';o.frequency.setValueAtTime(120,ctx.currentTime);o.frequency.exponentialRampToValueAtTime(900,ctx.currentTime+1.2);o.connect(g);g.connect(ctx.destination);g.gain.setValueAtTime(.001,ctx.currentTime);g.gain.exponentialRampToValueAtTime(.12,ctx.currentTime+1);g.gain.exponentialRampToValueAtTime(.001,ctx.currentTime+1.4);o.start();o.stop(ctx.currentTime+1.5);
  }catch(e){}
}
function showBreakthrough(from,to){
  const fx=document.getElementById('breakFx'),S=PET_STAGES[to];
  document.getElementById('bfOld').src=PET_IMGS[from];document.getElementById('bfNew').src=PET_IMGS[to];
  document.getElementById('bfName').textContent=(to+1)+'. '+S.name;document.getElementById('bfDesc').textContent='Bước '+S.step+' · '+S.desc;
  fx.classList.remove('show');void fx.offsetWidth;
  fx.querySelectorAll('*').forEach(e=>{e.style.animation='none';void e.offsetWidth;e.style.animation='';});
  fx.classList.add('show');playBreakSound();
  if(navigator.vibrate)navigator.vibrate([60,40,60,40,200]);
}
function closeBreakFx(){document.getElementById('breakFx').classList.remove('show');renderHome();if(document.getElementById('screen-reward').classList.contains('active'))renderReward();}

function renderReward(){
  if(rewardProfile.visit_date!==todayStr()){rewardProfile.visit_date=todayStr();saveAll();}
  renderQuests();
  renderPet();
  applyMood();
  document.getElementById('rwPoints').textContent=rewardProfile.total_points||0;
  document.getElementById('rwStreak').textContent=rewardProfile.current_streak||0;
  const next=nextAchievement();
  const prevReq=[...ACHIEVEMENTS].reverse().find(a=>userAchievements.find(u=>u.code===a.code));
  const base=prevReq?prevReq.required:0;
  const target=next?next.required:Math.max(rewardProfile.total_points||0,1);
  const cur=rewardProfile.total_points||0;
  const pct=next?Math.max(0,Math.min(100,Math.round((cur-base)/(target-base)*100))):100;
  document.getElementById('rwProgressFill').style.width=pct+'%';
  document.getElementById('rwProgressLabel').textContent=next?(cur+' / '+target+' linh lực — kế tiếp: '+next.name):'🎉 Linh thú đã trưởng thành viên mãn!';
  const curSt=petStageIndex();
  document.getElementById('rwAchList').innerHTML=PET_STAGES.map((a,i)=>{
    const unlocked=i<=curSt;
    const style=unlocked?'width:100%;height:92px;object-fit:cover;border-radius:10px;':'width:100%;height:92px;object-fit:cover;border-radius:10px;filter:grayscale(1) brightness(.35) blur(1.5px);';
    return '<div class="rw-ach'+(unlocked?' unlocked':'')+'"'+(unlocked?' onclick="petPreviewSt='+i+';renderReward();window.scrollTo({top:0,behavior:\'smooth\'})" style="cursor:pointer"':'')+'><div class="rw-ach-icon"><img src="'+PET_IMGS[i]+'" style="'+style+'"></div><div class="rw-ach-name">'+(i+1)+'. '+a.name+'</div><div class="rw-ach-req">'+a.required+' linh lực</div></div>';
  }).join('');
  const hist=rewardHistory.slice(0,30);
  document.getElementById('rwHistList').innerHTML=hist.length?hist.map(h=>{
    const d=new Date(h.created_at);
    const dateLabel=String(d.getDate()).padStart(2,'0')+'/'+String(d.getMonth()+1).padStart(2,'0');
    const label={CHI_TIEU_HOP_LY:'x2 Chi tiêu hợp lý',SAVING_EXPENSE:'Chi tiêu hợp lý',NHIEM_VU:'📜 Nhiệm vụ hằng ngày',THUONG_NGAN_SACH:'🎁 Thưởng giữ ngân sách'}[h.reward_type]||'Ghi chép giao dịch';
    return '<div class="rw-hist-row"><span>'+dateLabel+'</span><span>'+label+'</span><span class="rw-hist-pts">+'+h.points+'</span></div>';
  }).join(''):'<div class="empty">Chưa có lịch sử tu luyện.</div>';
}

/* ---------- SỔ TIẾT KIỆM: TỰ ĐỘNG CỘNG LÃI / TẤT TOÁN KHI ĐÁO HẠN ---------- */
function checkMaturedSavings(){
  const today=todayStr();
  const dueWallets=wallets.filter(w=>w.type==='saving'&&!w.matured&&w.maturityDate&&w.maturityDate<=today);
  if(!dueWallets.length)return;
  let changed=false;
  dueWallets.forEach(w=>{
    let guard=0;
    while(w.maturityDate<=today&&guard<60){
      guard++;
      const dayBasis=w.dayBasis||365;
      const days=daysBetween(w.depositDate,w.maturityDate);
      // Nếu trả lãi đầu kỳ thì lãi của kỳ này đã được cộng lúc gửi/tái tục trước đó rồi
      const interest=(w.payTiming==='start')?0:calcInterest(w.balance,w.rate,days,dayBasis);
      const action=w.maturityAction||(w.autoRenew===false?'no_renew':'renew_all');
      changed=true;
      if(action==='renew_principal'){
        const target=w.sourceWalletId?wallets.find(x=>String(x.id)===String(w.sourceWalletId)):null;
        if(interest>0){
          if(target){target.balance+=interest;txs.unshift(mkSavTx('thu',interest,'Rút lãi tiết kiệm: '+w.name,target.id,w.maturityDate));}
          else txs.unshift(mkSavTx('thu',interest,'Lãi tiết kiệm (chưa gán ví nhận): '+w.name,null,w.maturityDate));
        }
        w.depositDate=w.maturityDate;w.maturityDate=addMonths(w.depositDate,w.termMonths);
        if(w.payTiming==='start'&&w.rate>0){
          const newDays=daysBetween(w.depositDate,w.maturityDate);
          const preInterest=calcInterest(w.balance,w.rate,newDays,dayBasis);
          if(preInterest>0){
            if(target){target.balance+=preInterest;txs.unshift(mkSavTx('thu',preInterest,'Lãi trả trước (tái tục): '+w.name,target.id,w.depositDate));}
            else{w.balance+=preInterest;txs.unshift(mkSavTx('thu',preInterest,'Lãi trả trước (tái tục): '+w.name,w.id,w.depositDate));}
          }
        }
      }else if(action==='no_renew'){
        w.balance+=interest;
        if(interest>0)txs.unshift(mkSavTx('thu',interest,'Lãi tiết kiệm đáo hạn: '+w.name,w.id,w.maturityDate));
        const target=w.sourceWalletId?wallets.find(x=>String(x.id)===String(w.sourceWalletId)):null;
        if(target&&w.balance>0){
          txs.unshift({id:Date.now()+Math.random(),type:'transfer',amount:w.balance,fromName:w.name,toName:target.name,note:'Tất toán sổ tiết kiệm',date:w.maturityDate,time:nowTime()});
          target.balance+=w.balance;w.balance=0;
        }
        w.matured=true;break;
      }else{ // renew_all
        w.balance+=interest;
        if(interest>0)txs.unshift(mkSavTx('thu',interest,'Lãi tiết kiệm tự động: '+w.name,w.id,w.maturityDate));
        w.depositDate=w.maturityDate;w.maturityDate=addMonths(w.depositDate,w.termMonths);
        if(w.payTiming==='start'&&w.rate>0){
          const newDays=daysBetween(w.depositDate,w.maturityDate);
          const preInterest=calcInterest(w.balance,w.rate,newDays,dayBasis);
          if(preInterest>0){w.balance+=preInterest;txs.unshift(mkSavTx('thu',preInterest,'Lãi trả trước (tái tục): '+w.name,w.id,w.depositDate));}
        }
      }
    }
  });
  if(changed){
    saveAll();
    alert('Đã cập nhật lãi/tất toán cho '+dueWallets.length+' sổ tiết kiệm đến hạn. Kiểm tra ở tab Ví tiền.');
    renderHome();
  }
}
/* Cộng lãi hàng tháng cho sổ chọn "Trả lãi: Hàng tháng" */
function checkMonthlyInterestAccrual(){
  const curYm=todayStr().slice(0,7);
  let changed=false;
  wallets.filter(w=>w.type==='saving'&&!w.matured&&w.payTiming==='monthly'&&w.lastAccrualYm!==curYm).forEach(w=>{
    const monthlyInterest=Math.round(w.balance*(w.rate||0)/100/12);
    if(monthlyInterest>0){
      w.balance+=monthlyInterest;
      txs.unshift(mkSavTx('thu',monthlyInterest,'Lãi tiết kiệm hàng tháng: '+w.name,w.id,todayStr()));
      changed=true;
    }
    w.lastAccrualYm=curYm;
  });
  if(changed){saveAll();renderHome();}
}
/* Sổ đã tất toán/hết kỳ hạn không tái tục: tiếp tục sinh lãi không kỳ hạn nếu còn số dư */
function checkNoTermAccrual(){
  const curYm=todayStr().slice(0,7);
  let changed=false;
  wallets.filter(w=>w.type==='saving'&&w.matured&&w.balance>0&&(w.rateNoTerm||0)>0&&w.lastAccrualYm!==curYm).forEach(w=>{
    const monthlyInterest=Math.round(w.balance*w.rateNoTerm/100/12);
    if(monthlyInterest>0){
      w.balance+=monthlyInterest;
      txs.unshift(mkSavTx('thu',monthlyInterest,'Lãi không kỳ hạn: '+w.name,w.id,todayStr()));
      changed=true;
    }
    w.lastAccrualYm=curYm;
  });
  if(changed){saveAll();renderHome();}
}

/* ---------- XUẤT / NHẬP DỮ LIỆU ---------- */
/* downloadFile: khi chạy dưới dạng Artifact trên claude.ai phải dùng capability
   "downloads" của nền tảng (các cách tải file kiểu web thông thường bị chặn ở đó).
   Khi mở như 1 file HTML bình thường (ngoài claude.ai) thì dùng Web Share / thẻ <a> / tab mới. */
async function downloadFile(content,filename,mime){
  // Cách 1: capability "downloads" của claude.ai Artifact (ưu tiên khi đang chạy trong claude.ai)
  try{
    if(window.claude && typeof window.claude.use==='function'){
      const downloads=await window.claude.use('downloads');
      if(downloads){
        const blob=new Blob([content],{type:mime});
        await downloads.save({filename,data:blob});
        return true;
      }
    }
  }catch(err){
    if(err && (err.code==='declined'))return false; // người dùng bấm Huỷ ở hộp thoại lưu file
    // các lỗi khác (unavailable, not_granted...) -> thử tiếp các cách bên dưới
  }
  // Cách 2: Web Share API (chọn "Lưu vào Files" / chia sẻ) - tốt khi mở như file HTML thường trên điện thoại
  try{
    const blob=new Blob([content],{type:mime});
    const file=new File([blob],filename,{type:mime});
    if(navigator.canShare && navigator.canShare({files:[file]})){
      await navigator.share({files:[file],title:filename});
      return true;
    }
  }catch(err){
    if(err && err.name==='AbortError')return false; // người dùng tự đóng hộp thoại chia sẻ
  }
  // Cách 3: thẻ <a download> truyền thống
  try{
    const blob=new Blob([content],{type:mime});
    const url=URL.createObjectURL(blob);
    const a=document.createElement('a');
    a.href=url;a.download=filename;a.rel='noopener';a.style.display='none';
    document.body.appendChild(a);a.click();
    setTimeout(()=>{try{document.body.removeChild(a);}catch(e){}URL.revokeObjectURL(url);},400);
    return true;
  }catch(err){}
  // Cách 4: mở file ở tab mới dạng data URL để tự lưu/chia sẻ thủ công
  try{
    const blob=new Blob([content],{type:mime});
    await new Promise((resolve,reject)=>{
      const reader=new FileReader();
      reader.onload=()=>{const w=window.open(reader.result,'_blank');if(!w){reject(new Error('popup-blocked'));return;}resolve();};
      reader.onerror=reject;
      reader.readAsDataURL(blob);
    });
    return true;
  }catch(err){
    alert('Không thể tự động lưu file trên trình duyệt/chế độ hiện tại.\n\nMẹo: hãy mở trang này bằng Safari/Chrome (thay vì bản đã lưu ra màn hình chính), hoặc cho phép popup cho trang này rồi thử lại.');
    return false;
  }
}
async function exportCSV(){
  if(!txs.length){alert('Chưa có giao dịch nào để xuất.');return;}
  const rows=[['Ngày','Giờ','Loại','Nhóm','Khoản mục','Số linh thạch (💎)','Ví','Người/đối tượng','Ghi chú']];
  txs.slice().reverse().forEach(t=>{
    if(t.type==='transfer'){
      rows.push([t.date,t.time,'Chuyển tiền','','',t.amount,t.fromName+' → '+t.toName,'',t.note||'']);
    }else{
      const w=wallets.find(x=>String(x.id)===String(t.walletId));
      rows.push([t.date,t.time,t.type==='thu'?'Thu':'Chi',t.group,t.item,t.amount,w?w.name:'',t.person||'',t.note||'']);
    }
  });
  const csv=rows.map(r=>r.map(c=>'"'+String(c).replace(/"/g,'""')+'"').join(',')).join('\n');
  await downloadFile('\ufeff'+csv,'so-thu-chi-'+todayStr()+'.csv','text/csv;charset=utf-8;');
}
function checkBackupReminder(){
  const el=document.getElementById('backupWarn');if(!el)return;
  let last=null,snooze=null;try{last=localStorage.getItem('tc_last_backup');snooze=localStorage.getItem('tc_backup_snooze');}catch(e){}
  const now=Date.now(),DAY=864e5;
  if(!txs.length||(snooze&&now<+snooze)){el.style.display='none';return;}
  if(!last){try{last=localStorage.getItem('tc_first_use');if(!last){last=String(now);localStorage.setItem('tc_first_use',last);}}catch(e){}}
  const days=Math.floor((now-(+last||now))/DAY);
  if(days>=7){document.getElementById('backupWarnTxt').textContent='💾 Đã '+days+' ngày chưa sao lưu. Mất dữ liệu nếu xoá trình duyệt!';el.style.display='flex';}
  else el.style.display='none';
}
function snoozeBackup(){try{localStorage.setItem('tc_backup_snooze',String(Date.now()+864e5));}catch(e){}checkBackupReminder();}
async function exportJSON(){
  const data={txs,wallets,budgets,recurring,debts,loans,rewardProfile,rewardHistory,userAchievements,exportedAt:new Date().toISOString()};
  const ok=await downloadFile(JSON.stringify(data,null,2),'so-thu-chi-backup-'+todayStr()+'.json','application/json');
  if(ok!==false){try{localStorage.setItem('tc_last_backup',String(Date.now()));}catch(e){}checkBackupReminder();}
}
function triggerImport(){document.getElementById('importFileInput').click();}
function onImportFile(e){
  const f=e.target.files[0];if(!f)return;
  const reader=new FileReader();
  reader.onload=()=>{
    try{
      const data=JSON.parse(reader.result);
      if(!Array.isArray(data.txs)||!Array.isArray(data.wallets)){alert('File không đúng định dạng backup.');return;}
      if(!confirm('Nhập dữ liệu sẽ GHI ĐÈ toàn bộ dữ liệu hiện tại trên máy này. Tiếp tục?'))return;
      txs=data.txs||[];wallets=data.wallets||[];budgets=data.budgets||{};recurring=data.recurring||[];
      debts=data.debts||debts||[];loans=data.loans||[];
      rewardProfile=data.rewardProfile||{total_points:0,current_streak:0,longest_streak:0,last_reward_date:null};
      rewardHistory=data.rewardHistory||[];userAchievements=data.userAchievements||[];
      saveAll();renderHome();alert('Đã khôi phục dữ liệu thành công.');
    }catch(err){alert('File không hợp lệ hoặc bị lỗi.');}
  };
  reader.readAsText(f);
  e.target.value='';
}

/* ---------- TIỆN ÍCH: THÔNG BÁO NHỎ ---------- */
let _mtT=null;
function showMiniToast(msg,warn){const t=document.getElementById('miniToast');if(!t)return;t.textContent=msg;t.classList.toggle('warn',!!warn);t.classList.add('show');clearTimeout(_mtT);_mtT=setTimeout(()=>t.classList.remove('show'),warn?4200:2600);}

/* ---------- CẢNH BÁO NGÂN SÁCH ---------- */
function budgetWarn(tx){
  if(!tx||tx.type!=='chi'||!budgets[tx.group])return;
  const ym=(tx.date||todayStr()).slice(0,7),bud=budgets[tx.group];
  const spent=txs.filter(t=>t.type==='chi'&&t.group===tx.group&&(t.date||'').slice(0,7)===ym).reduce((s,t)=>s+(t.amount||0),0);
  const pct=Math.round(spent/bud*100);
  if(spent>bud)showMiniToast('⚠️ "'+tx.group+'" đã VƯỢT ngân sách tháng: '+fmtShort(spent)+' / '+fmtShort(bud)+' ('+pct+'%)',true);
  else if(pct>=80)showMiniToast('⚠️ "'+tx.group+'" đã dùng '+(spent===bud?'hết ':'')+pct+'% ngân sách tháng ('+fmtShort(spent)+' / '+fmtShort(bud)+')',true);
}

/* ---------- NHẮC CÀI APP (iPhone) ---------- */
function isIOS(){return /iphone|ipad|ipod/i.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);}
function isStandalone(){return !!(navigator.standalone||(window.matchMedia&&matchMedia('(display-mode: standalone)').matches));}
function renderInstallTip(){
  const el=document.getElementById('installTip');if(!el)return;
  let sn=0;try{sn=+localStorage.getItem('tc_install_snooze')||0;}catch(e){}
  el.style.display=(isIOS()&&!isStandalone()&&Date.now()>sn)?'flex':'none';
}
function snoozeInstallTip(){try{localStorage.setItem('tc_install_snooze',String(Date.now()+7*864e5));}catch(e){}renderInstallTip();}

/* ---------- NHẮC HẠN (7 NGÀY TỚI) ---------- */
function renderReminders(){
  const el=document.getElementById('remindCard');if(!el)return;
  const today=todayStr(),lim=addDays(today,7),days={};
  const day=dt=>days[dt]||(days[dt]={p:0,i:0,rec:[],debt:[]});
  loans.forEach(l=>{if(typeof ensureLoanV2==='function')ensureLoanV2(l);if(l.status==='closed'||!l.termMonths)return;
    const d=loanDueUntil(l,lim);Object.keys(d.items).forEach(dt=>{const it=d.items[dt];if(!it.p&&!it.i)return;const g=day(dt);g.p+=it.p||0;g.i+=it.i||0;});});
  const cur=today.slice(0,7);
  recurring.forEach(r=>{
    const nom=(ym)=>{const y=+ym.slice(0,4),m=+ym.slice(5,7)-1;const dim=new Date(y,m+1,0).getDate();return ymd(new Date(y,m,Math.min(r.day,dim)));};
    let dt=r.lastLoggedYm!==cur?nom(cur):nom(addMonths(today.slice(0,7)+'-01',1).slice(0,7));
    if(dt<=lim)day(dt).rec.push(r);
  });
  (debts||[]).forEach(d=>{if(d.status==='pending'&&d.dueDate&&d.dueDate<=lim)day(d.dueDate).debt.push(d);});
  const keys=Object.keys(days).sort();
  if(!keys.length){el.style.display='none';return;}
  const when=d=>{const k=daysBetween(today,d);return k<0?'Quá hạn':k===0?'Hôm nay':k===1?'Ngày mai':'';};
  el.innerHTML='<div class="rc-title">🔔 Sắp đến hạn (7 ngày tới)</div>'+keys.map(dt=>{
    const g=days[dt],recChi=g.rec.filter(r=>r.type!=='thu').reduce((s,r)=>s+(r.amount||0),0);
    const total=g.p+g.i+recChi,w=when(dt),od=dt<today;
    let lines='';
    if(g.p||g.i){const parts=[];if(g.p)parts.push('gốc '+fmtShort(g.p));if(g.i)parts.push('lãi ~'+fmtShort(g.i));lines+='<div class="rc-line" onclick="showScreen(\'loans\')">🏦 Khoản vay: '+parts.join(' • ')+'</div>';}
    g.rec.forEach(r=>{lines+='<div class="rc-line" onclick="showScreen(\'recurring\')">🔁 '+r.name+': '+(r.type==='thu'?'thu ':'chi ')+fmtShort(r.amount)+'</div>';});
    g.debt.forEach(d=>{lines+='<div class="rc-line" onclick="showScreen(\'debts\')">🤝 '+d.person+' hẹn trả bạn '+fmtShort(d.amount)+'</div>';});
    return '<div class="rc-day'+(od?' od':'')+'"><div class="rc-head"><span class="rc-date">'+dmy(dt)+(w?' <small>('+w+')</small>':'')+'</span>'+
      (total?'<span class="rc-sum">Tổng phải trả <b>'+fmtShort(total)+' 💎</b></span>':'')+'</div>'+lines+'</div>';
  }).join('');
  el.style.display='block';
}

/* ---------- GHI NHANH ---------- */
let qaList=[];
function renderQuickAdd(){
  const wrap=document.getElementById('quickAddWrap');if(!wrap)return;
  const from=addDays(todayStr(),-90),map={};
  txs.forEach(t=>{if(t.type!=='chi'||!t.item||!t.group||(t.date||'')<from||t.loanId||t.debtId)return;const k=t.group+'|'+t.item;
    if(!map[k])map[k]={group:t.group,item:t.item,icon:t.icon,accent:t.accent,count:0,amount:t.amount,walletId:t.walletId,date:t.date};
    const m=map[k];m.count++;if((t.date||'')>=m.date){m.date=t.date;m.amount=t.amount;m.walletId=t.walletId;}});
  qaList=Object.values(map).sort((a,b)=>b.count-a.count||b.date.localeCompare(a.date)).slice(0,6);
  if(!qaList.length){wrap.style.display='none';return;}
  document.getElementById('quickAdd').innerHTML=qaList.map((q,i)=>'<button class="qa-chip" onclick="quickAdd('+i+')">'+icon(q.icon||'khac',q.accent||'#c29a5c',18)+'<span>'+q.item+'<small>'+fmtShort(q.amount)+'</small></span></button>').join('');
  wrap.style.display='block';
}
function quickAdd(i){
  const q=qaList[i];if(!q)return;
  const v=prompt('Ghi nhanh: '+q.item+' ('+q.group+')\nSố tiền:',fmtShort(q.amount));if(v===null)return;
  const amount=parseInt(String(v).replace(/\D/g,''))||0;if(amount<=0){alert('Số tiền không hợp lệ');return;}
  const g=GROUPS.chi.find(x=>x.name===q.group)||GROUPS.chi[GROUPS.chi.length-1];
  const sp=getSpendableWallets();let w=sp.find(x=>String(x.id)===String(q.walletId))||sp[0]||null;
  const tx={id:Date.now(),type:'chi',amount,group:g.name,item:q.item,icon:g.icon,accent:g.accent,bg:g.bg,walletId:w?w.id:null,person:'',note:'',receipt:null,date:todayStr(),time:nowTime()};
  txs.unshift(tx);if(w)w.balance-=amount;
  awardBaseLinhThach(tx);saveAll();renderHome();
  showMiniToast('✅ Đã ghi '+q.item+' '+fmtShort(amount)+(w?' • '+w.name:''));
  setTimeout(()=>budgetWarn(tx),2700);
}

/* ---------- BỘ SƯU TẬP NHÂN VẬT ---------- */
/* Thêm nhân vật mới: tải video + ảnh vào thư mục characters rồi thêm 1 dòng vào danh sách này */
const CHARACTERS=[
  {id:'c1',name:'Ngân Thương Tiểu Tướng',rarity:'Hiếm',need:0,video:'characters/char1.mp4',poster:'characters/char1.jpg',desc:'Người bạn đồng hành đầu tiên. Tay cầm ngân thương, luôn canh giữ túi tiền của bạn.'}
];
const RARITY_COLOR={'Thường':'#a99d8d','Hiếm':'#4fa3ff','Sử thi':'#b67cff','Huyền thoại':'#f0c24b'};
const CHAR_SLOTS=6;
function charOwned(c){return (rewardProfile.total_points||0)>=(c.need||0);}
function companionId(){let id='';try{id=localStorage.getItem('tc_companion')||'';}catch(e){}const c=CHARACTERS.find(x=>x.id===id);return c&&charOwned(c)?c.id:CHARACTERS[0].id;}
function applyCompanion(){
  const v=document.getElementById('balChar');if(!v)return;const c=CHARACTERS.find(x=>x.id===companionId());if(!c)return;
  if(v.getAttribute('src')!==c.video){v.setAttribute('poster',c.poster);v.setAttribute('src',c.video);v.load();v.play&&v.play().catch(()=>{});}
}
function renderChars(){
  const pts=rewardProfile.total_points||0,own=CHARACTERS.filter(charOwned).length,comp=companionId();
  document.getElementById('charSum').innerHTML='<span>Đã sưu tầm <b>'+own+'/'+CHARACTERS.length+'</b></span><span>✨ Linh lực: <b>'+pts+'</b></span>';
  let html=CHARACTERS.map(c=>{const ok=charOwned(c);return '<div class="char-card'+(ok?'':' locked')+'" onclick="openCharView(\''+c.id+'\')">'+(c.id===comp?'<span class="cc-badge">Đồng hành</span>':'')+'<img src="'+c.poster+'" alt="" loading="lazy"><div class="cc-info"><div class="cc-name">'+(ok?c.name:'???')+'</div><div class="cc-rar" style="color:'+(RARITY_COLOR[c.rarity]||'#a99d8d')+'">'+(ok?c.rarity:'Cần '+c.need+' ✨')+'</div></div></div>';}).join('');
  for(let i=CHARACTERS.length;i<CHAR_SLOTS;i++)html+='<div class="char-card soon"><span>?</span>Sắp ra mắt</div>';
  document.getElementById('charGrid').innerHTML=html;
}
function openCharView(id){
  const c=CHARACTERS.find(x=>x.id===id);if(!c)return;const ok=charOwned(c),comp=companionId()===c.id;
  document.getElementById('cvSheet').innerHTML=(ok?'<video src="'+c.video+'" poster="'+c.poster+'" autoplay muted loop playsinline></video>':'<img src="'+c.poster+'" style="filter:brightness(0) drop-shadow(0 0 2px #c29a5c)">')+
    '<div class="cv-name">'+(ok?c.name:'Nhân vật bí ẩn')+'</div><div class="cc-rar" style="font-weight:800;color:'+(RARITY_COLOR[c.rarity]||'#a99d8d')+'">'+c.rarity+'</div>'+
    '<div class="cv-desc">'+(ok?c.desc:'Tích luỹ đủ <b>'+c.need+' ✨ linh lực</b> để mở khoá (hiện có '+(rewardProfile.total_points||0)+').')+'</div>'+
    (ok?(comp?'<button class="save-btn ghost-btn" disabled>✓ Đang là bạn đồng hành</button>':'<button class="save-btn" onclick="setCompanion(\''+c.id+'\')">Chọn làm bạn đồng hành</button>'):'')+
    '<button class="save-btn ghost-btn" onclick="closeCharView()">Đóng</button>';
  document.getElementById('charView').classList.add('show');
}
function closeCharView(){document.getElementById('charView').classList.remove('show');document.getElementById('cvSheet').innerHTML='';}
function setCompanion(id){try{localStorage.setItem('tc_companion',id);}catch(e){}closeCharView();renderChars();applyCompanion();showMiniToast('✅ Đã đổi bạn đồng hành');}

/* ---------- MẬT KHẨU (PIN 6 số) ---------- */
const PIN_LEN=6;let pinBuf='',pinMode='unlock',pinFirst='',pinFails=0,pinLockUntil=0,pinHiddenAt=0,pendingUser='',userOnlyChange=false;
function userIsSet(){try{return !!localStorage.getItem('tc_user_hash');}catch(e){return false;}}
function normUser(u){return String(u||'').trim().toLowerCase().replace(/\s+/g,' ');}
async function pinUserNext(){
  const u=normUser(document.getElementById('lockUser').value);
  if(u.length<3){pinSub('Tên đăng nhập cần ít nhất 3 ký tự',true);return;}
  pendingUser=u;
  if(userOnlyChange){localStorage.setItem('tc_user_hash',await pinHash('u:'+u));pendingUser='';userOnlyChange=false;pinHide();updateLockMenu();showMiniToast('✅ Đã đổi tên đăng nhập');return;}
  pinShow('set',true);
}
async function pinHash(pin){
  let salt=localStorage.getItem('tc_pin_salt');
  if(!salt){salt=Math.random().toString(36).slice(2)+Date.now().toString(36);localStorage.setItem('tc_pin_salt',salt);}
  const txt=salt+':'+pin;
  if(window.crypto&&crypto.subtle){const b=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(txt));return Array.from(new Uint8Array(b)).map(x=>x.toString(16).padStart(2,'0')).join('');}
  let h=0;for(let i=0;i<txt.length;i++)h=(h*31+txt.charCodeAt(i))|0;return 'f'+h;
}
function pinIsSet(){try{return !!localStorage.getItem('tc_pin_hash');}catch(e){return false;}}
function pinRender(){
  document.getElementById('lockDots').innerHTML=Array.from({length:PIN_LEN},(_,i)=>'<i class="'+(i<pinBuf.length?'on':'')+'"></i>').join('');
}
function pinBuildPad(){
  const keys=['1','2','3','4','5','6','7','8','9','','0','⌫'];
  document.getElementById('lockPad').innerHTML=keys.map(k=>k===''?'<span></span>':'<button class="'+(k==='⌫'?'ghost':'')+'" onclick="pinKey(\''+k+'\')">'+k+'</button>').join('');
}
function pinShow(mode,keepUser){
  pinMode=mode;pinBuf='';pinFirst='';if(!keepUser&&mode!=='setUser')pendingUser='';
  const T={unlock:['Nhập mật khẩu','Linh thú đang canh giữ sổ thu chi của bạn'],set:['Đặt mật khẩu mới','Nhập '+PIN_LEN+' số bạn dễ nhớ'],verifyOff:['Nhập mật khẩu hiện tại','Để tắt mật khẩu'],verifyChange:['Nhập mật khẩu hiện tại','Để đổi mật khẩu'],verifyChangeUser:['Nhập mật khẩu hiện tại','Để đổi tên đăng nhập'],setUser:['Đặt tên đăng nhập','Phải nhập đúng tên này (và mật khẩu) mới mở được app']}[mode];
  if(mode==='unlock'&&userIsSet()){T[0]='Đăng nhập';T[1]='Nhập tên đăng nhập và mật khẩu';}
  const uIn=document.getElementById('lockUser'),showU=mode==='setUser'||(mode==='unlock'&&userIsSet());
  uIn.style.display=showU?'':'none';uIn.value='';
  document.getElementById('lockNext').style.display=mode==='setUser'?'':'none';
  document.getElementById('lockDots').style.display=mode==='setUser'?'none':'';
  document.getElementById('lockPad').style.display=mode==='setUser'?'none':'';
  document.getElementById('lockTitle').textContent=T[0];pinSub(T[1]);
  document.getElementById('lockForgot').style.display=mode==='unlock'?'':'none';
  document.getElementById('lockCancel').style.display=mode==='unlock'?'none':'';
  pinBuildPad();pinRender();
  document.getElementById('lockScreen').classList.add('show');
}
function pinSub(t,err){const e=document.getElementById('lockSub');e.textContent=t;e.classList.toggle('err',!!err);}
function pinHide(){document.getElementById('lockScreen').classList.remove('show');document.documentElement.classList.remove('is-locked');}
function pinCancel(){pendingUser='';userOnlyChange=false;pinHide();updateLockMenu();}
function pinWrong(msg){const d=document.getElementById('lockDots');d.classList.remove('shake');void d.offsetWidth;d.classList.add('shake');if(navigator.vibrate)navigator.vibrate(120);pinBuf='';pinRender();pinSub(msg,true);}
async function pinKey(k){
  if(Date.now()<pinLockUntil){pinSub('Sai nhiều lần. Thử lại sau '+Math.ceil((pinLockUntil-Date.now())/1000)+' giây',true);return;}
  if(k==='⌫'){pinBuf=pinBuf.slice(0,-1);pinRender();return;}
  if(pinBuf.length>=PIN_LEN)return;
  pinBuf+=k;pinRender();
  if(pinBuf.length<PIN_LEN)return;
  const entered=pinBuf;
  if(pinMode==='set'){
    if(!pinFirst){pinFirst=entered;pinBuf='';pinRender();document.getElementById('lockTitle').textContent='Nhập lại mật khẩu';pinSub('Xác nhận '+PIN_LEN+' số vừa nhập');return;}
    if(entered!==pinFirst){pinFirst='';document.getElementById('lockTitle').textContent='Đặt mật khẩu mới';pinWrong('Hai lần nhập không khớp, nhập lại từ đầu');return;}
    localStorage.setItem('tc_pin_hash',await pinHash(entered));
    if(pendingUser){localStorage.setItem('tc_user_hash',await pinHash('u:'+pendingUser));pendingUser='';}
    pinHide();updateLockMenu();
    showRewardToast({custom:'🔒 Đã bật mật khẩu. Hãy nhớ kỹ, quên sẽ phải xoá dữ liệu!'});return;
  }
  let ok=(await pinHash(entered))===localStorage.getItem('tc_pin_hash');
  if(ok&&pinMode==='unlock'&&userIsSet()){ok=(await pinHash('u:'+normUser(document.getElementById('lockUser').value)))===localStorage.getItem('tc_user_hash');}
  if(!ok){pinFails++;if(pinFails>=5){pinFails=0;pinLockUntil=Date.now()+30000;pinWrong('Sai 5 lần. Vui lòng đợi 30 giây');}else pinWrong((pinMode==='unlock'&&userIsSet()?'Sai tên đăng nhập hoặc mật khẩu (':'Sai mật khẩu (')+pinFails+'/5)');return;}
  pinFails=0;
  if(pinMode==='unlock'){pinHide();petPlayVideo();return;}
  if(pinMode==='verifyChangeUser'){userOnlyChange=true;pinShow('setUser');return;}
  if(pinMode==='verifyOff'){localStorage.removeItem('tc_pin_hash');localStorage.removeItem('tc_user_hash');pinHide();updateLockMenu();showRewardToast({custom:'🔓 Đã tắt đăng nhập'});return;}
  if(pinMode==='verifyChange'){pinShow('set');return;}
}
function pinForgot(){
  if(!confirm('Mật khẩu không thể khôi phục vì chỉ lưu trên máy này.\n\nCách duy nhất là XOÁ TOÀN BỘ dữ liệu trên máy (giao dịch, ví, pet...). Nếu bạn có file sao lưu JSON thì có thể khôi phục lại sau.\n\nTiếp tục?'))return;
  if(!confirm('Xác nhận lần cuối: xoá toàn bộ dữ liệu và mật khẩu?'))return;
  try{localStorage.clear();}catch(e){}location.reload();
}
function openPinSettings(){
  if(!pinIsSet()){userOnlyChange=false;pinShow('setUser');return;}
  const c=prompt('Đăng nhập đang BẬT'+(userIsSet()?'':' (chưa có tên đăng nhập)')+'.\nGõ 1 để đổi mật khẩu\nGõ 2 để '+(userIsSet()?'đổi':'đặt')+' tên đăng nhập\nGõ 3 để tắt đăng nhập','1');
  if(c==='1')pinShow('verifyChange');else if(c==='2')pinShow('verifyChangeUser');else if(c==='3')pinShow('verifyOff');
}
function updateLockMenu(){const e=document.getElementById('more-lock');if(e)e.innerHTML='<span>'+icon('lock','#c29a5c',20)+'</span><span>Tên đăng nhập & mật khẩu</span><span style="margin-left:auto;font-size:14px;color:'+(pinIsSet()?'var(--green)':'var(--sub)')+'">'+(pinIsSet()?(userIsSet()?'Đang bật':'Chưa có tên'):'Chưa bật')+'</span>';}
// Khoá lại khi rời app quá 1 phút
document.addEventListener('visibilitychange',()=>{if(!pinIsSet())return;if(document.hidden)pinHiddenAt=Date.now();else if(pinHiddenAt&&Date.now()-pinHiddenAt>60000){document.documentElement.classList.add('is-locked');pinShow('unlock');}});
if(pinIsSet())pinShow('unlock');
updateLockMenu();

/* ---------- INIT ---------- */
if('serviceWorker' in navigator&&location.protocol.startsWith('http')){window.addEventListener('load',()=>navigator.serviceWorker.register('sw.js').catch(()=>{}));}
try{if(navigator.storage&&navigator.storage.persist)navigator.storage.persist().catch(()=>{});}catch(e){}
populateBankSelect();
renderWTypeGrid('cash');
attachThousandFormat(document.getElementById('amountInput'));
attachThousandFormat(document.getElementById('accBalInput'));
attachThousandFormat(document.getElementById('recAmount'));
attachThousandFormat(document.getElementById('editWalletBalance'));
['loanPrincipal','loanBalanceEdit','debtAmount'].forEach(id=>{const e=document.getElementById(id);if(e)attachThousandFormat(e);});
document.getElementById('nav-home').innerHTML=icon('home','currentColor',30);
document.getElementById('nav-accounts').innerHTML=icon('wallet','currentColor',30);
document.getElementById('nav-report').innerHTML=icon('chart','currentColor',30);
document.getElementById('nav-more').innerHTML=icon('gear','currentColor',30);
document.getElementById('more-budget').innerHTML='<span>'+icon('chart','#c29a5c',20)+'</span><span>Ngân sách</span>';
document.getElementById('more-recur').innerHTML='<span>'+icon('repeat','#c29a5c',20)+'</span><span>Thu chi định kỳ</span>';
document.getElementById('more-acc').innerHTML='<span>'+icon('wallet','#c29a5c',20)+'</span><span>Quản lý ví tiền</span>';
document.getElementById('more-hist').innerHTML='<span>'+icon('clock','#c29a5c',20)+'</span><span>Lịch sử giao dịch</span>';
document.getElementById('more-reward').innerHTML='<span>'+icon('trophy','#7f5cff',20)+'</span><span>Phần thưởng</span>';
document.getElementById('more-exportcsv').innerHTML='<span>'+icon('download','#c29a5c',20)+'</span><span>Xuất dữ liệu (CSV / Excel)</span>';
document.getElementById('more-exportjson').innerHTML='<span>'+icon('download','#c29a5c',20)+'</span><span>Sao lưu dữ liệu (JSON)</span>';
document.getElementById('more-import').innerHTML='<span>'+icon('upload','#c29a5c',20)+'</span><span>Khôi phục dữ liệu (JSON)</span>';
document.getElementById('more-debts').innerHTML='<span>'+icon('handshake','#c29a5c',20)+'</span><span>Theo dõi vay nợ</span>';
document.getElementById('more-loans').innerHTML='<span>'+icon('bank','#c29a5c',20)+'</span><span>Vay ngân hàng</span>';
document.getElementById('more-reward').innerHTML='<span>'+icon('paw','#c29a5c',20)+'</span><span>Nuôi Linh Thú</span>';
document.getElementById('more-chars').innerHTML='<span>'+icon('trophy','#c29a5c',20)+'</span><span>Bộ sưu tập nhân vật</span>';
document.getElementById('more-trash').innerHTML='<span>'+icon('trash','var(--red)',20)+'</span><span>Xoá toàn bộ dữ liệu</span>';
document.querySelectorAll('.more-item').forEach(el=>el.style.gap='12px');
renderHome();
checkDueRecurring();
checkMonthlyBudgetBonus();
checkMaturedSavings();
checkMonthlyInterestAccrual();
checkNoTermAccrual();
repairLoanTxAmounts();
checkLoanPaymentsDue();

/* Chặn phóng to bằng 2 ngón (iOS Safari bỏ qua user-scalable=no) */
(function(){
  ['gesturestart','gesturechange','gestureend'].forEach(ev=>document.addEventListener(ev,e=>e.preventDefault(),{passive:false}));
  document.addEventListener('touchmove',e=>{if(e.touches&&e.touches.length>1)e.preventDefault();},{passive:false});
  document.addEventListener('wheel',e=>{if(e.ctrlKey)e.preventDefault();},{passive:false});
  document.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&['+','-','=','0'].includes(e.key))e.preventDefault();});
})();
