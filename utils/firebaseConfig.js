import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyCLz-Bk7coVNRtQO8cUyEKGjSPGcTxeLws",
  authDomain: "book-log-392519.firebaseapp.com",
  projectId: "book-log-392519",
  storageBucket: "book-log-392519.appspot.com",
  messagingSenderId: "177953137158",
  appId: "1:177953137158:web:70d8543c535b506cbe9987"
};

export const firebaseApp = initializeApp(firebaseConfig);
