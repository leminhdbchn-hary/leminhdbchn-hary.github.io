/* Sổ Thu Chi – Cloud sync qua Firebase (đăng nhập số điện thoại, mỗi số 1 dữ liệu riêng) */
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";
import {
  getAuth, RecaptchaVerifier, signInWithPhoneNumber, signOut, onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";
import {
  getFirestore, doc, setDoc, getDoc, serverTimestamp
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

let currentUser = null;
let confirmationResult = null;
let pushTimer = null;
let payloadGetter = null;

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
  confirmationResult = await signInWithPhoneNumber(auth, phone, verifier);
  return phone;
}

async function verifyOtp(code) {
  if (!confirmationResult) throw new Error('NO_OTP_SENT');
  const cred = await confirmationResult.confirm(String(code || '').trim());
  return cred.user;
}

async function logout() {
  try { await signOut(auth); } catch (e) {}
}

function userDocRef(uid) { return doc(db, 'users', uid); }

async function pushState(payload) {
  if (!currentUser) return false;
  await setDoc(userDocRef(currentUser.uid), Object.assign({}, payload, {
    phone: currentUser.phoneNumber || '',
    updatedAt: serverTimestamp(),
    updatedAtClient: Date.now()
  }));
  return true;
}

function queuePush(getPayloadFn) {
  payloadGetter = getPayloadFn;
  if (!currentUser) return;
  clearTimeout(pushTimer);
  pushTimer = setTimeout(() => {
    try {
      const p = payloadGetter && payloadGetter();
      if (p) pushState(p).then(() => {
        window.dispatchEvent(new CustomEvent('cloud-sync-done'));
      }).catch(() => {});
    } catch (e) {}
  }, 2500);
}

async function pullState() {
  if (!currentUser) return null;
  const snap = await getDoc(userDocRef(currentUser.uid));
  return snap.exists() ? snap.data() : null;
}

onAuthStateChanged(auth, (user) => {
  currentUser = user;
  window.dispatchEvent(new CustomEvent('cloud-auth-changed', { detail: { phone: user ? user.phoneNumber : null } }));
});

window.Cloud = {
  sendOtp, verifyOtp, logout, pushState, pullState, queuePush,
  isLoggedIn: () => !!currentUser,
  currentPhone: () => (currentUser ? currentUser.phoneNumber : ''),
  normalizePhoneVN
};
