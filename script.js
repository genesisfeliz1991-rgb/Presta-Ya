
// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-analytics.js";
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword 
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC2SedBlK50Vv-ojsA3qnURG23gNdnwMTg",
  authDomain: "prestaya-17cf1.firebaseapp.com",
  projectId: "prestaya-17cf1",
  storageBucket: "prestaya-17cf1.firebasestorage.app",
  messagingSenderId: "558209246 90",
  appId: "1:558209246 90:web:0a2fe35a7db7d6889065cb",
  measurementId: "G-2XM03ZDZ3J"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);

// Registrar nuevo usuario
function registrar() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  createUserWithEmailAndPassword(auth, email, password)
    .then(() => {
      alert("Usuario registrado con éxito ✅");
    })
    .catch((error) => {
      alert("Error al registrar: " + error.message);
    });
}

// Iniciar sesión
function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  signInWithEmailAndPassword(auth, email, password)
    .then(() => {
      alert("Sesión iniciada con éxito ✅");
    })
    .catch((error) => {
      alert("Error al iniciar sesión: " + error.message);
    });
}

window.registrar = registrar;
window.login = login;

