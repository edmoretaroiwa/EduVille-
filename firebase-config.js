// ============================
// FIREBASE CONFIGURATION
// EduVille — Commit to Your Future
// ============================

const firebaseConfig = {
  apiKey: "AIzaSyDjsjtjmcAHWc3ThPF5C4THVr4Rc66v-60",
  authDomain: "eduville-3ca9c.firebaseapp.com",
  projectId: "eduville-3ca9c",
  storageBucket: "eduville-3ca9c.firebasestorage.app",
  messagingSenderId: "693302555650",
  appId: "1:693302555650:web:a9804f9a18f7759873e31b"
};

// Initialize Firebase (using compat SDK for browser)
firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.firestore();