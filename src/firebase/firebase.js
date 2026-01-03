// src/firebase/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyC2EhE3dfKeDifSvSFdYCcGZW4alqfrK6o",
  authDomain: "stock-portfolio-dashboar.firebaseapp.com",
  projectId: "stock-portfolio-dashboar",
  storageBucket: "stock-portfolio-dashboar.firebasestorage.app",
  messagingSenderId: "735568144534",
  appId: "1:735568144534:web:460e1f5bb580cd72867ab7",
  measurementId: "G-Q9BNNNE4YP"
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth };
