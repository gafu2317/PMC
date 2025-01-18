// src/firebase.ts
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  // apiKey: import.meta.env.FIREBASE_API_KEY,
  // authDomain: import.meta.env.FIREBASE_AUTH_DOMAIN,
  // databaseURL: import.meta.env.FIREBASE_DATABASE_URL,
  // projectId: import.meta.env.FIREBASE_PROJECT_ID,
  // storageBucket: import.meta.env.FIREBASE_STORAGE_BUCKET,
  // messagingSenderId: import.meta.env.FIREBASE_MESSAGING_SENDER_ID,
  // appId: import.meta.env.FIREBASE_APP_ID,
  // measurementId: import.meta.env.FIREBASE_MEASUREMENT_ID,
  apiKey: "AIzaSyC4hRy3rapYrOC-RxWG3YrHZiLUgM-YoJo",
  authDomain: "pmcreservation.firebaseapp.com",
  databaseURL: "https://pmcreservation-default-rtdb.firebaseio.com",
  projectId: "pmcreservation",
  storageBucket: "pmcreservation.firebasestorage.app",
  messagingSenderId: "950223406190",
  appId: "1:950223406190:web:d5f3876cf36a1db9bb127f",
  measurementId: "G-XRWVB6CWWS",
};

// Firebaseの初期化
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
