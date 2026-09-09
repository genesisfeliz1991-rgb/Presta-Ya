
// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-analytics.js";
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  getFirestore,
  collection,
  addDoc,
  query,
  where,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Your web app's Firebase configuration
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
const auth = getAuth(app);
const db = getFirestore(app);

let editandoId = null; // guarda el ID del préstamo si estamos editando

// ---------- AUTENTICACIÓN ----------

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

function logout() {
  auth.signOut().then(() => {
    document.getElementById("main").style.display = "none";
    document.getElementById("login").style.display = "block";
  });
}

onAuthStateChanged(auth, (user) => {
  if (user) {
    document.getElementById("login").style.display = "none";
    document.getElementById("main").style.display = "block";
    document.getElementById("userEmail").textContent = user.email;
    escucharPrestamos(user.uid);
  } else {
    document.getElementById("login").style.display = "block";
    document.getElementById("main").style.display = "none";
  }
});

// ---------- PRÉSTAMOS (Firestore) ----------

// Guardar o actualizar préstamo
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("formPrestamo");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    guardarPrestamo();
  });
});

async function guardarPrestamo() {
  const user = auth.currentUser;
  if (!user) return;

  const nombreCliente = document.getElementById("nombreCliente").value;
  const monto = document.getElementById("monto").value;
  const plazoTipo = document.getElementById("plazoTipo").value;
  const plazo = document.getElementById("plazo").value;

  const datos = {
    uid: user.uid,
    nombreCliente,
    monto: Number(monto),
    plazoTipo,
    plazo: Number(plazo),
    fecha: new Date().toISOString()
  };

  try {
    if (editandoId) {
      // Actualizar préstamo existente
      await updateDoc(doc(db, "prestamos", editandoId), datos);
      editandoId = null;
      alert("Préstamo actualizado ✅");
    } else {
      // Crear nuevo préstamo
      await addDoc(collection(db, "prestamos"), datos);
      alert("Préstamo guardado ✅");
    }
    document.getElementById("formPrestamo").reset();
  } catch (error) {
    alert("Error al guardar: " + error.message);
  }
}

// Escuchar en tiempo real los préstamos del usuario logueado
function escucharPrestamos(uid) {
  const q = query(collection(db, "prestamos"), where("uid", "==", uid));

  onSnapshot(q, (snapshot) => {
    const tabla = document.getElementById("tablaPrestamos");
    tabla.innerHTML = `
      <tr>
        <th>Cliente</th>
        <th>Monto</th>
        <th>Tipo</th>
        <th>Cuotas</th>
        <th>Acciones</th>
      </tr>
    `;

    snapshot.forEach((docSnap) => {
      const p = docSnap.data();
      const fila = document.createElement("tr");
      fila.innerHTML = `
        <td>${p.nombreCliente}</td>
        <td>RD$ ${p.monto}</td>
        <td>${p.plazoTipo}</td>
        <td>${p.plazo}</td>
        <td>
          <button onclick="editarPrestamo('${docSnap.id}')">✏️ Editar</button>
          <button onclick="eliminarPrestamo('${docSnap.id}')">🗑️ Eliminar</button>
        </td>
      `;
      tabla.appendChild(fila);
    });
  });
}

// Cargar datos en el formulario para editar
window.editarPrestamo = async function (id) {
  const fila = [...document.querySelectorAll("#tablaPrestamos tr")].find(tr =>
    tr.innerHTML.includes(id)
  );
  // Buscamos el préstamo directo en Firestore por snapshot en memoria es más simple:
  const q = query(collection(db, "prestamos"), where("uid", "==", auth.currentUser.uid));
  onSnapshot(q, (snapshot) => {
    snapshot.forEach((docSnap) => {
      if (docSnap.id === id) {
        const p = docSnap.data();
        document.getElementById("nombreCliente").value = p.nombreCliente;
        document.getElementById("monto").value = p.monto;
        document.getElementById("plazoTipo").value = p.plazoTipo;
        document.getElementById("plazo").value = p.plazo;
        editandoId = id;
      }
    });
  });
};

// Eliminar préstamo
window.eliminarPrestamo = async function (id) {
  if (confirm("¿Seguro que quieres eliminar este préstamo?")) {
    await deleteDoc(doc(db, "prestamos", id));
  }
};

// Imprimir recibo
function imprimir() {
  window.print();
}

window.registrar = registrar;
window.login = login;
window.logout = logout;
window.imprimir = imprimir;
