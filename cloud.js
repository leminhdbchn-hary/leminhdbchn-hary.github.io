/* Sổ Thu Chi – Cloud sync qua Firebase (đăng nhập bằng Google, mỗi tài khoản 1 dữ liệu riêng) */
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";
import {
  getAuth, GoogleAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult,
  signOut, onAuthStateChanged
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
const provider = new GoogleAuthProvider();

let currentUser = null;
let pushTimer = null;
let payloadGetter = null;

/* PWA chạy standalone (mở từ màn hình chính) thường chặn popup đăng nhập,
   nên dùng redirect (chuyển trang) trong trường hợp đó, popup cho trường hợp còn lại. */
function isStandalone() {
  return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
}

async function signIn() {
  if (isStandalone()) {
    await signInWithRedirect(auth, provider);
    return null; // trang sẽ tải lại sau khi đăng nhập xong
  }
  try {
    const cred = await signInWithPopup(auth, provider);
    return cred.user;
  } catch (e) {
    if (e && (e.code === 'auth/popup-blocked' || e.code === 'auth/cancelled-popup-request' || e.code === 'auth/popup-closed-by-user')) {
      await signInWithRedirect(auth, provider);
      return null;
    }
    throw e;
  }
}

async function logout() {
  try { await signOut(auth); } catch (e) {}
}

function userDocRef(uid) { return doc(db, 'users', uid); }

async function pushState(payload) {
  if (!currentUser) return false;
  await setDoc(userDocRef(currentUser.uid), Object.assign({}, payload, {
    email: currentUser.email || '',
    name: currentUser.displayName || '',
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
  window.dispatchEvent(new CustomEvent('cloud-auth-changed', { detail: { email: user ? user.email : null } }));
});

/* Hoàn tất luồng đăng nhập kiểu redirect (nếu vừa quay lại từ Google) */
getRedirectResult(auth).catch((e) => {
  window.dispatchEvent(new CustomEvent('cloud-signin-error', { detail: { error: e } }));
});

window.Cloud = {
  signIn, logout, pushState, pullState, queuePush,
  isLoggedIn: () => !!currentUser,
  currentEmail: () => (currentUser ? currentUser.email : ''),
  currentName: () => (currentUser ? (currentUser.displayName || currentUser.email) : '')
};
