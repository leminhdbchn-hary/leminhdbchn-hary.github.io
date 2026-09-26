/* Sổ Thu Chi – Sao lưu đám mây (Firebase Firestore)
   - Dữ liệu nằm ở books/{MÃ SỔ} (meta) + books/{MÃ SỔ}/chunks/{0..n-1} (JSON chia nhỏ, mỗi doc < 1MB)
   - Chỉ ai biết đúng mã sổ mới đọc/ghi được (Security Rules chặn liệt kê danh sách sổ)
   - Tự sao lưu nền vài giây sau mỗi lần lưu; mở app thì tự lấy bản mới hơn từ thiết bị khác */
const FB_CONFIG={
  apiKey:"AIzaSyCxxQh184QCg623T6bu9mgQGrY8XEoGUl0",
  authDomain:"so-cloud-backup.firebaseapp.com",
  projectId:"so-cloud-backup",
  storageBucket:"so-cloud-backup.firebasestorage.app",
  messagingSenderId:"913280250618",
  appId:"1:913280250618:web:87aa07ac78f3383ad94f43"
};
const FB_SDK='https://www.gstatic.com/firebasejs/10.12.2/';
const CLOUD_CHUNK=300000;          /* ký tự / chunk (tối đa ~900KB kể cả chữ có dấu) */
const CLOUD_MAX=9000000;           /* giới hạn 1 lần ghi của Firestore ~10MB */
const CLOUD_ALPHA='ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; /* bỏ I,O,0,1 cho khỏi nhầm */

function cget(k){try{return localStorage.getItem(k);}catch(e){return null;}}
function cset(k,v){try{if(v===null||v===undefined)localStorage.removeItem(k);else localStorage.setItem(k,String(v));}catch(e){}}
function cloudCode(){return cget('tc_cloud_code')||'';}
function normCode(s){return String(s||'').toUpperCase().replace(/[^A-Z0-9]/g,'');}
function fmtCode(c){return (c||'').replace(/(.{4})(?=.)/g,'$1-');}
function validCode(c){return /^[A-Z0-9]{24}$/.test(c);}
function newCode(){const a=new Uint8Array(24);crypto.getRandomValues(a);let s='';a.forEach(x=>s+=CLOUD_ALPHA[x%32]);return s;}
function devName(){const u=navigator.userAgent;return /iPhone/.test(u)?'iPhone':/iPad/.test(u)?'iPad':/Android/.test(u)?'Android':/Mac/.test(u)?'Mac':/Windows/.test(u)?'Windows':'Thiết bị khác';}

let _fb=null;
async function fbLite(){
  if(_fb)return _fb;
  const [app,fs]=await Promise.all([import(FB_SDK+'firebase-app.js'),import(FB_SDK+'firebase-firestore-lite.js')]);
  const a=app.getApps().length?app.getApp():app.initializeApp(FB_CONFIG);
  _fb={fs,db:fs.getFirestore(a)};return _fb;
}

/* ---- dữ liệu ---- */
function getBackupData(){return {txs,wallets,budgets,recurring,debts,loans,customBanks,rewardProfile,rewardHistory,userAchievements,exportedAt:new Date().toISOString()};}
function applyBackupData(data){
  if(!data||!Array.isArray(data.txs)||!Array.isArray(data.wallets))throw new Error('bad-data');
  txs=data.txs||[];wallets=data.wallets||[];budgets=data.budgets||{};recurring=data.recurring||[];
  debts=data.debts||[];loans=data.loans||[];
  if(Array.isArray(data.customBanks)){customBanks=data.customBanks;saveCustomBanks();}
  rewardProfile=data.rewardProfile||{total_points:0,current_streak:0,longest_streak:0,last_reward_date:null};
  rewardHistory=data.rewardHistory||[];userAchievements=data.userAchievements||[];
  _cloudApplying=true;try{saveAll();}finally{_cloudApplying=false;}
}

/* ---- đọc / ghi ---- */
async function cloudReadMeta(code){
  const {fs,db}=await fbLite();
  const s=await fs.getDoc(fs.doc(db,'books',code));
  return s.exists()?s.data():null;
}
async function cloudWrite(code){
  const {fs,db}=await fbLite();
  const json=JSON.stringify(getBackupData());
  if(json.length>CLOUD_MAX)throw new Error('too-big');
  const rev=Date.now()+'-'+Math.random().toString(36).slice(2,8);
  const n=Math.max(1,Math.ceil(json.length/CLOUD_CHUNK));
  const b=fs.writeBatch(db);
  for(let i=0;i<n;i++)b.set(fs.doc(db,'books',code,'chunks',String(i)),{d:json.slice(i*CLOUD_CHUNK,(i+1)*CLOUD_CHUNK),r:rev});
  b.set(fs.doc(db,'books',code),{v:1,n,rev,at:Date.now(),dev:devName(),size:json.length});
  await b.commit();
  return rev;
}
async function cloudRead(code){
  const {fs,db}=await fbLite();
  for(let attempt=0;attempt<3;attempt++){
    const m=await cloudReadMeta(code);if(!m)return null;
    const parts=await Promise.all(Array.from({length:m.n},(_,i)=>fs.getDoc(fs.doc(db,'books',code,'chunks',String(i)))));
    if(parts.every(p=>p.exists()&&p.data().r===m.rev)){
      return {meta:m,data:JSON.parse(parts.map(p=>p.data().d).join(''))};
    }
    await new Promise(r=>setTimeout(r,800)); /* thiết bị khác đang ghi dở → thử lại */
  }
  throw new Error('inconsistent');
}

/* ---- sao lưu nền ---- */
let _cloudTimer=null,_cloudBusy=false,_cloudApplying=false,_cloudConflict=false;
function cloudMarkDirty(){
  if(_cloudApplying||!cloudCode())return;
  cset('tc_cloud_dirty','1');
  clearTimeout(_cloudTimer);_cloudTimer=setTimeout(()=>backupToCloud(),3000);
}
async function backupToCloud(opts){
  opts=opts||{};const code=cloudCode();if(!code)return false;
  if(!navigator.onLine){cloudStatus('offline');return false;}
  if(_cloudBusy){clearTimeout(_cloudTimer);_cloudTimer=setTimeout(()=>backupToCloud(opts),2000);return false;}
  if(_cloudConflict&&!opts.force)return false;
  _cloudBusy=true;cloudStatus('sync');
  try{
    if(!opts.force){
      const m=await cloudReadMeta(code);
      const mine=cget('tc_cloud_rev');
      if(m&&m.rev!==mine){_cloudBusy=false;cloudConflict(m);return false;} /* thiết bị khác vừa ghi */
    }
    const rev=await cloudWrite(code);
    cset('tc_cloud_rev',rev);cset('tc_cloud_last',Date.now());cset('tc_cloud_dirty',null);
    cset('tc_last_backup',Date.now());try{checkBackupReminder();}catch(e){}
    _cloudConflict=false;cloudStatus('ok');
    if(opts.toast)showMiniToast('☁️ Đã sao lưu lên cloud');
    return true;
  }catch(e){
    console.warn('backupToCloud',e);cloudStatus('err',e);
    if(opts.toast)showMiniToast(cloudErrMsg(e),true);
    return false;
  }finally{_cloudBusy=false;}
}
async function restoreFromCloud(code,opts){
  opts=opts||{};code=code||cloudCode();
  if(!navigator.onLine){showMiniToast('⚠️ Không có mạng',true);return false;}
  cloudStatus('sync');
  try{
    const r=await cloudRead(code);
    if(!r){cloudStatus('ok');if(!opts.silent)alert('Không tìm thấy sổ nào với mã này trên cloud. Kiểm tra lại mã sổ.');return false;}
    applyBackupData(r.data);
    cset('tc_cloud_code',code);cset('tc_cloud_rev',r.meta.rev);cset('tc_cloud_last',Date.now());cset('tc_cloud_dirty',null);
    _cloudConflict=false;
    try{sessionStorage.setItem('tc_cloud_toast',opts.silent?'🔄 Đã đồng bộ dữ liệu mới từ '+(r.meta.dev||'thiết bị khác'):'✅ Đã khôi phục dữ liệu từ cloud');}catch(e){}
    location.reload();return true;
  }catch(e){console.warn('restoreFromCloud',e);cloudStatus('err',e);alert(cloudErrMsg(e));return false;}
}
function cloudErrMsg(e){
  const m=String(e&&(e.code||e.message)||e);
  if(m==='too-big')return '⚠️ Dữ liệu quá lớn (nhiều ảnh hoá đơn) để sao lưu cloud. Hãy xoá bớt ảnh hoá đơn cũ.';
  if(/permission/i.test(m))return '⚠️ Cloud từ chối truy cập (mã sổ không hợp lệ).';
  if(/unavailable|network|fetch|import/i.test(m))return '⚠️ Không kết nối được cloud. Sẽ thử lại khi có mạng.';
  return '⚠️ Lỗi cloud: '+m;
}

/* ---- khi mở app / quay lại app ---- */
let _lastOpenSync=0;
async function cloudSyncOnOpen(){
  const code=cloudCode();if(!code||!navigator.onLine||_cloudBusy)return;
  if(Date.now()-_lastOpenSync<30000)return;_lastOpenSync=Date.now();
  try{
    const m=await cloudReadMeta(code);
    const dirty=cget('tc_cloud_dirty')==='1';
    if(!m){if(dirty||txs.length||wallets.length)backupToCloud();return;}
    if(m.rev===cget('tc_cloud_rev')){if(dirty)backupToCloud();else cloudStatus('ok');return;}
    if(!dirty){whenUnlocked(()=>restoreFromCloud(code,{silent:true}));return;}
    cloudConflict(m);
  }catch(e){console.warn('cloudSyncOnOpen',e);cloudStatus('err',e);}
}
function cloudConflict(m){
  _cloudConflict=true;cloudStatus('conflict');
  whenUnlocked(()=>{
    document.getElementById('appModalBody').innerHTML='<h3>☁️ Dữ liệu khác nhau</h3>'+
      '<p class="bk-p">Sổ trên cloud vừa được cập nhật từ <b>'+(m.dev||'thiết bị khác')+'</b> lúc <b>'+new Date(m.at).toLocaleString('vi-VN')+'</b>, trong khi máy này cũng có thay đổi chưa sao lưu.</p>'+
      '<p class="bk-p">Chọn bản muốn giữ (bản còn lại sẽ bị ghi đè):</p>'+
      '<div class="edit-modal-actions"><button class="edit-modal-cancel" onclick="closeAppModal();restoreFromCloud()">Lấy bản cloud</button><button class="edit-modal-save" onclick="closeAppModal();backupToCloud({force:true,toast:true})">Giữ bản máy này</button></div>';
    document.getElementById('appModal').classList.add('show');
  });
}

/* ---- giao diện ---- */
function cloudStatus(st,err){
  cset('tc_cloud_state',st);
  const el=document.getElementById('more-cloud');if(!el)return;
  const code=cloudCode();let sub;
  if(!code)sub='Chưa bật — dữ liệu chỉ nằm trong máy này';
  else if(st==='sync')sub='Đang đồng bộ...';
  else if(st==='offline')sub='Mất mạng — sẽ sao lưu khi có mạng lại';
  else if(st==='conflict')sub='⚠️ Cần chọn bản dữ liệu để giữ';
  else if(st==='err')sub='⚠️ Chưa sao lưu được — sẽ thử lại';
  else{const t=+cget('tc_cloud_last')||0;sub=t?'Đã sao lưu lúc '+new Date(t).toLocaleString('vi-VN',{hour:'2-digit',minute:'2-digit',day:'2-digit',month:'2-digit'}):'Đã bật';}
  el.innerHTML='<span>'+icon('upload','#c29a5c',20)+'</span><span>Sao lưu đám mây (Cloud)<small class="more-sub">'+sub+'</small></span>';
  const s=document.getElementById('cloudModalState');if(s)s.textContent=sub;
}
function openCloudSettings(){
  const code=cloudCode();let h;
  if(!code){
    h='<h3>☁️ Sao lưu đám mây</h3>'+
      '<p class="bk-p">Tự động lưu dữ liệu lên cloud sau mỗi lần thay đổi. Đổi/mất điện thoại chỉ cần nhập <b>mã sổ</b> là lấy lại toàn bộ.</p>'+
      '<div class="edit-modal-actions" style="margin-bottom:14px"><button class="edit-modal-save" style="flex:1" onclick="cloudCreate()">Tạo mã sổ mới</button></div>'+
      '<p class="bk-p">Đã có mã sổ từ máy khác? Nhập vào đây:</p>'+
      '<div class="we-form"><input class="we-in" id="cloudCodeIn" placeholder="XXXX-XXXX-XXXX-XXXX-XXXX-XXXX" autocapitalize="characters" autocomplete="off" spellcheck="false"></div>'+
      '<div class="edit-modal-actions"><button class="edit-modal-cancel" onclick="closeAppModal()">Đóng</button><button class="edit-modal-save" onclick="cloudJoin()">Khôi phục từ cloud</button></div>';
  }else{
    h='<h3>☁️ Sao lưu đám mây</h3>'+
      '<p class="bk-p">Mã sổ của bạn — <b>hãy chụp màn hình hoặc ghi lại</b>. Ai có mã này sẽ xem được dữ liệu, đừng gửi cho người lạ.</p>'+
      '<div class="we-form"><input class="we-in" id="cloudCodeShow" readonly value="'+fmtCode(code)+'" style="font-family:monospace;font-weight:700;letter-spacing:.5px;text-align:center"></div>'+
      '<p class="bk-p" id="cloudModalState" style="opacity:.8"></p>'+
      '<div class="edit-modal-actions" style="margin-bottom:10px"><button class="edit-modal-cancel" onclick="cloudCopy()">Sao chép mã</button><button class="edit-modal-save" onclick="backupToCloud({toast:true})">Sao lưu ngay</button></div>'+
      '<div class="edit-modal-actions" style="margin-bottom:10px"><button class="edit-modal-cancel" onclick="if(confirm(\'Khôi phục sẽ GHI ĐÈ dữ liệu trên máy này bằng bản trên cloud. Tiếp tục?\')){closeAppModal();restoreFromCloud();}">Khôi phục từ cloud</button><button class="edit-modal-cancel" style="color:var(--red)" onclick="cloudDisconnect()">Tắt trên máy này</button></div>'+
      '<div class="edit-modal-actions"><button class="edit-modal-save" style="flex:1" onclick="closeAppModal()">Đóng</button></div>';
  }
  document.getElementById('appModalBody').innerHTML=h;
  document.getElementById('appModal').classList.add('show');
  cloudStatus(cget('tc_cloud_state')||'ok');
}
async function cloudCreate(){
  if(!navigator.onLine){showMiniToast('⚠️ Cần có mạng để bật cloud',true);return;}
  const code=newCode();
  cset('tc_cloud_code',code);cset('tc_cloud_rev',null);
  const ok=await backupToCloud({force:true});
  if(!ok){cset('tc_cloud_code',null);alert('Chưa bật được sao lưu cloud. Kiểm tra mạng rồi thử lại.');cloudStatus();return;}
  openCloudSettings();showMiniToast('✅ Đã bật sao lưu cloud');
}
async function cloudJoin(){
  const code=normCode((document.getElementById('cloudCodeIn')||{}).value);
  if(!validCode(code)){alert('Mã sổ gồm 24 ký tự (chữ và số). Kiểm tra lại nhé.');return;}
  if((txs.length||wallets.length)&&!confirm('Khôi phục sẽ GHI ĐÈ toàn bộ dữ liệu hiện có trên máy này bằng dữ liệu trên cloud. Tiếp tục?'))return;
  closeAppModal();cset('tc_cloud_asked','1');
  await restoreFromCloud(code);
}
function cloudCopy(){
  const t=fmtCode(cloudCode());
  (navigator.clipboard?navigator.clipboard.writeText(t):Promise.reject()).then(()=>showMiniToast('📋 Đã sao chép mã sổ'))
    .catch(()=>{const i=document.getElementById('cloudCodeShow');if(i){i.select();try{document.execCommand('copy');showMiniToast('📋 Đã sao chép mã sổ');}catch(e){}}});
}
function cloudDisconnect(){
  if(!confirm('Tắt sao lưu cloud trên máy này? Dữ liệu trên cloud vẫn giữ nguyên, có thể nhập lại mã sổ để bật lại.'))return;
  ['tc_cloud_code','tc_cloud_rev','tc_cloud_last','tc_cloud_dirty','tc_cloud_state'].forEach(k=>cset(k,null));
  closeAppModal();cloudStatus();showMiniToast('Đã tắt sao lưu cloud');
}
/* Máy mới, chưa có dữ liệu → hỏi 1 lần có muốn khôi phục không */
function cloudFirstRun(){
  if(cloudCode()||cget('tc_cloud_asked')||txs.length||wallets.length)return;
  cset('tc_cloud_asked','1');
  whenUnlocked(()=>setTimeout(()=>{
    document.getElementById('appModalBody').innerHTML='<h3>☁️ Đã dùng app ở máy khác?</h3>'+
      '<p class="bk-p">Nếu bạn đã bật sao lưu cloud, nhập <b>mã sổ</b> để lấy lại toàn bộ dữ liệu.</p>'+
      '<div class="we-form"><input class="we-in" id="cloudCodeIn" placeholder="XXXX-XXXX-XXXX-XXXX-XXXX-XXXX" autocapitalize="characters" autocomplete="off" spellcheck="false"></div>'+
      '<div class="edit-modal-actions"><button class="edit-modal-cancel" onclick="closeAppModal()">Dùng mới</button><button class="edit-modal-save" onclick="cloudJoin()">Khôi phục</button></div>';
    document.getElementById('appModal').classList.add('show');
  },900));
}

/* ---- khởi động ---- */
(function cloudInit(){
  cloudStatus(cget('tc_cloud_dirty')==='1'?'err':'ok');
  try{const t=sessionStorage.getItem('tc_cloud_toast');if(t){sessionStorage.removeItem('tc_cloud_toast');setTimeout(()=>showMiniToast(t),600);}}catch(e){}
  window.addEventListener('online',()=>{_lastOpenSync=0;cloudSyncOnOpen();});
  window.addEventListener('offline',()=>{if(cloudCode())cloudStatus('offline');});
  document.addEventListener('visibilitychange',()=>{
    if(document.visibilityState==='visible')cloudSyncOnOpen();
    else if(cget('tc_cloud_dirty')==='1'){clearTimeout(_cloudTimer);backupToCloud();} /* rời app → lưu ngay */
  });
  setTimeout(cloudSyncOnOpen,1500);
  cloudFirstRun();
})();
