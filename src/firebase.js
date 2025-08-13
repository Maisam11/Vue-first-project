import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBgmtzfN3zXkyOjSgIV3EpiLMTSDQeQEWU",
  authDomain: "practice-7f029.firebaseapp.com",
  databaseURL: "https://practice-7f029-default-rtdb.firebaseio.com",
  projectId: "practice-7f029",
  storageBucket: "practice-7f029.firebasestorage.app",
  messagingSenderId: "1012243784002",
  appId: "1:1012243784002:web:049232b8d55319c771a8db",
  measurementId: "G-7E1FKF2NRN"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
console.log('[Firebase] Initialized with config:', firebaseConfig);

export { db, app };