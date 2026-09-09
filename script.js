
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC2SedBlK50Vv-ojsA3qnURG23gNdnwMTg",
  authDomain: "prestaya-17cf1.firebaseapp.com",
  projectId: "prestaya-17cf1",
  storageBucket: "prestaya-17cf1.firebasestorage.app",
  messagingSenderId: "55820924690",
  appId: "1:55820924690:web:0a2fe35a7db7d6889065cb",
  measurementId: "G-2XM03ZDZ3J"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

