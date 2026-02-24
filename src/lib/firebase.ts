import { initializeApp, getApps, getApp } from "firebase/app";
import { getStorage } from "firebase/storage";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
} from "firebase/auth";

// Firebase config — from Firebase Console → Project Settings → Your apps
const firebaseConfig = {
  apiKey: "AIzaSyArr_CKdovaQF1Mgrylt4KNwOj9KwLIREM",
  authDomain: "online-ai-interviewer-system.firebaseapp.com",
  projectId: "online-ai-interviewer-system",
  storageBucket: "online-ai-interviewer-system.firebasestorage.app",
  messagingSenderId: "529196521380",
  appId: "1:529196521380:web:c53c916d5abbf36fe7d331",
  measurementId: "G-KVCXLQSB6P",
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const storage = getStorage(app);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });

export { app, storage, auth, googleProvider, signInWithPopup, firebaseSignOut };
export default app;
