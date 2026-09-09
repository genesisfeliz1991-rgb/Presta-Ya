// 1. AQUI PEGA TU CONFIG DE FIREBASE
const firebaseConfig = {
  apiKey: "TU_API_KEY",
  authDomain: "TU_AUTH_DOMAIN",
  projectId: "TU_PROJECT_ID",
  storageBucket: "TU_STORAGE_BUCKET",
  messagingSenderId: "TU_SENDER_ID",
  appId: "TU_APP_ID"
};

// 2. CONECTAR FIREBASE
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// 3. FUNCIÓN REGISTRAR
document.getElementById("btnRegistrar").addEventListener("click", () => {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      alert("Usuario registrado con éxito ✅");
    })
    .catch((error) => {
      alert("Error: " + error.message);
    });
});

// 4. FUNCIÓN ENTRAR
document.getElementById("btnEntrar").addEventListener("click", () => {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      alert("Bienvenido ✅");
      // aqui luego ponemos: window.location.href = "panel.html"
    })
    .catch((error) => {
      alert("Error: " + error.message);
    });
});
/ PEGA AQUÍ TU firebaseConfig QUE COPIASTE
const firebaseConfig = {
  apiKey: "TU_API_KEY",
  authDomain: "prestaya-17cf1.firebaseapp.com",
  projectId: "prestaya-17cf1",
  // ...todo lo demás
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

document.getElementById('btnRegistrar').onclick = function() {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  auth.createUserWithEmailAndPassword(email, password)
    .then(() => alert("Usuario registrado con éxito ✅"))
    .catch((error) => alert("Error: " + error.message));
};

document.getElementById('btnLogin').onclick = function() {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  auth.signInWithEmailAndPassword(email, password)
    .then(() => alert("Sesión iniciada ✅"))
    .catch((error) => alert("Error: " + error.message));
};
