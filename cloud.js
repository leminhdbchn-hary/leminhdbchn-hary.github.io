/* Sổ Thu Chi – Cloud sync qua Firebase (đăng nhập số điện thoại, mỗi số 1 dữ liệu riêng)
   Lưu trữ: users/{uid} (thông tin phiên bản) + users/{uid}/chunks/{0..n-1} (JSON chia nhỏ, mỗi doc < 1MB)
   Chống ghi đè: mỗi lần lưu có 1 mã phiên bản (rev). Máy nào có rev cũ hơn cloud sẽ không được ghi đè
   mà phải lấy bản mới về (hoặc người dùng chọn bản giữ lại). */
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";
import {
  getAuth, RecaptchaVerifier, signInWithPhoneNumber, signOut, onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";
import {
  getFirestore, doc, getDoc, writeBatch
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCxxQh184QCg623T6bu9mgQGrY8XEoGUl0",
  authDomain: "so-cloud-backup.firebaseapp.com",
  projectId: "so-cloud-backup",
  storageBucket: "so-cloud-backup.firebasestorage.app",
  messagingSenderId: "913280250618",
  appId: "1:913280250618:web:87aa07ac78f3383ad94f43"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const CHUNK = 300000;      // ký tự / chunk (tối đa ~900KB kể cả chữ có dấu)
const MAX_SIZE = 9000000;  // giới hạn 1 lần ghi của Firestore ~10MB

let currentUser = null;
let confirmationResult = null;
let pushTimer = null;
let payloadGetter = null;
let pushing = null;

const ls = {
  get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
  set(k, v) { try { if (v === null || v === undefined) localStorage.removeItem(k); else localStorage.setItem(k, String(v)); } catch (e) {} }
};
const revKey = () => 'tc_cloud_rev_' + (currentUser ? currentUser.uid : '');
const localRev = () => ls.get(revKey());
const isDirty = () => ls.get('tc_cloud_dirty') === '1';
const emit = (name, detail) => window.dispatchEvent(new CustomEvent(name, { detail }));
function devName() {
  const u = navigator.userAgent;
  return /iPhone/.test(u) ? 'iPhone' : /iPad/.test(u) ? 'iPad' : /Android/.test(u) ? 'Android' : /Mac/.test(u) ? 'Mac' : /Windows/.test(u) ? 'Windows' : 'thiết bị khác';
}

function normalizePhoneVN(input) {
  let s = String(input || '').trim().replace(/[\s.\-()]/g, '');
  if (!s) return '';
  if (s.startsWith('+')) return s;
  if (s.startsWith('0')) return '+84' + s.slice(1);
  if (s.startsWith('84')) return '+' + s;
  return '+84' + s;
}

function ensureRecaptcha() {
  if (window.__recaptchaVerifier) return window.__recaptchaVerifier;
  window.__recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', { size: 'invisible' });
  return window.__recaptchaVerifier;
}

async function sendOtp(phoneRaw) {
  const phone = normalizePhoneVN(phoneRaw);
  if (!/^\+\d{9,15}$/.test(phone)) throw new Error('SDT_INVALID');
  const verifier = ensureRecaptcha();
  try {
    confirmationResult = await signInWithPhoneNumber(auth, phone, verifier);
  } catch (e) {
    try { verifier.clear(); } catch (x) {}
    window.__recaptchaVerifier = null; // cho phép thử lại
    throw e;
  }
  return phone;
}

async function verifyOtp(code) {
  if (!confirmationResult) throw new Error('NO_OTP_SENT');
  const cred = await confirmationResult.confirm(String(code || '').trim());
  return cred.user;
}

async function logout() {
  clearTimeout(pushTimer);
  ls.set('tc_cloud_dirty', null);
  try { await signOut(auth); } catch (e) {}
}

const metaRef = (uid) => doc(db, 'users', uid);
const chunkRef = (uid, i) => doc(db, 'users', uid, 'chunks', String(i));

/* Đọc thông tin phiên bản trên cloud (không tải dữ liệu) */
async function readMeta() {
  if (!currentUser) return null;
  const s = await getDoc(metaRef(currentUser.uid));
  return s.exists() ? s.data() : null;
}

/* Ghi toàn bộ dữ liệu. Nếu cloud đã có bản mới hơn từ máy khác → lỗi CLOUD_CONFLICT (trừ khi force) */
async function pushState(payload, opts) {
  opts = opts || {};
  if (!currentUser) return false;
  const uid = currentUser.uid;
  if (!opts.force) {
    const m = await readMeta();
    if (m && m.rev !== localRev()) {
      const err = new Error('CLOUD_CONFLICT'); err.meta = m; throw err;
    }
  }
  const json = JSON.stringify(payload);
  if (json.length > MAX_SIZE) throw new Error('CLOUD_TOO_BIG');
  const n = Math.max(1, Math.ceil(json.length / CHUNK));
  const rev = Date.now() + '-' + Math.random().toString(36).slice(2, 8);
  const b = writeBatch(db);
  for (let i = 0; i < n; i++) b.set(chunkRef(uid, i), { d: json.slice(i * CHUNK, (i + 1) * CHUNK), r: rev });
  // set() không merge → xoá sạch các trường của định dạng cũ (nếu có)
  b.set(metaRef(uid), { v: 2, n, rev, at: Date.now(), dev: devName(), size: json.length, phone: currentUser.phoneNumber || '' });
  await b.commit();
  ls.set(revKey(), rev);
  ls.set('tc_cloud_dirty', null);
  ls.set('tc_cloud_last_sync', Date.now());
  return true;
}

/* Tải dữ liệu từ cloud. Trả về payload (+ updatedAtClient, dev, __rev) hoặc null nếu chưa có */
async function pullState() {
  if (!currentUser) return null;
  const uid = currentUser.uid;
  for (let attempt = 0; attempt < 3; attempt++) {
    const m = await readMeta();
    if (!m) return null;
    if (!m.n) { // định dạng cũ: dữ liệu nằm thẳng trong users/{uid}
      if (!Array.isArray(m.txs)) return null;
      return Object.assign({}, m, { updatedAtClient: m.updatedAtClient || 0, __rev: m.rev });
    }
    const parts = await Promise.all(Array.from({ length: m.n }, (_, i) => getDoc(chunkRef(uid, i))));
    if (parts.every(p => p.exists() && p.data().r === m.rev)) {
      const data = JSON.parse(parts.map(p => p.data().d).join(''));
      return Object.assign(data, { updatedAtClient: m.at, dev: m.dev, __rev: m.rev });
    }
    await new Promise(r => setTimeout(r, 800)); // máy khác đang ghi dở → thử lại
  }
  throw new Error('CLOUD_INCONSISTENT');
}

/* Đánh dấu đã áp dụng bản cloud này vào máy (gọi sau khi khôi phục) */
function markApplied(data) {
  ls.set(revKey(), data && data.__rev ? data.__rev : null);
  ls.set('tc_cloud_dirty', null);
  ls.set('tc_cloud_last_sync', Date.now());
}

/* Sao lưu nền */
async function flushPush() {
  clearTimeout(pushTimer);
  if (!currentUser || !payloadGetter || !isDirty()) return;
  if (!navigator.onLine) { emit('cloud-sync-error', { offline: true }); return; }
  if (pushing) return pushing;
  pushing = (async () => {
    try {
      const p = payloadGetter();
      if (p) { await pushState(p); emit('cloud-sync-done'); }
    } catch (e) {
      if (e && e.message === 'CLOUD_CONFLICT') emit('cloud-conflict', { meta: e.meta });
      else emit('cloud-sync-error', { error: e });
    } finally { pushing = null; }
  })();
  return pushing;
}
function queuePush(getPayloadFn) {
  payloadGetter = getPayloadFn;
  if (!currentUser || Cloud.applying) return;
  ls.set('tc_cloud_dirty', '1');
  clearTimeout(pushTimer);
  pushTimer = setTimeout(flushPush, 2500);
}

onAuthStateChanged(auth, (user) => {
  currentUser = user;
  emit('cloud-auth-changed', { phone: user ? user.phoneNumber : null });
});
window.addEventListener('online', () => { flushPush(); emit('cloud-resume'); });
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') flushPush(); // rời app → lưu ngay
  else emit('cloud-resume');
});

const Cloud = window.Cloud = {
  sendOtp, verifyOtp, logout, pushState, pullState, queuePush, flushPush, readMeta, markApplied,
  applying: false,
  isLoggedIn: () => !!currentUser,
  currentPhone: () => (currentUser ? currentUser.phoneNumber : ''),
  localRev, isDirty,
  normalizePhoneVN
};
