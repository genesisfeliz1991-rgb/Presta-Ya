const firebaseConfig = {
  apiKey: "AIzaSyC2SedBlK50Vv-ojsA3qnURG23gNdnwMTg",
  authDomain: "prestaya-17cf1.firebaseapp.com",
  projectId: "prestaya-17cf1",
  storageBucket: "prestaya-17cf1.firebasestorage.app",
  messagingSenderId: "55820924690",
  appId: "1:55820924690:web:0a2fe35a7db7d6889065cb"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// ---------- TASAS POR TIPO ----------
// Cambia aquí tus % : 0.03 = 3%
const TASAS = {
  diario: 0.03, // 3% diario
  semanal: 0.15, // 15% semanal
  mensual: 0.25 // 25% mensual
};

// ---------- LOGIN ----------
function registrar() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  auth.createUserWithEmailAndPassword(email, password)
   .then(() => alert("Usuario registrado ✅"))
   .catch((error) => alert("Error: " + error.message));
}

function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  auth.signInWithEmailAndPassword(email, password)
   .catch((error) => alert("Error: " + error.message));
}

function logout() {
  auth.signOut();
}

auth.onAuthStateChanged((user) => {
  if (user) {
    document.getElementById("login").style.display = "none";
    document.getElementById("main").style.display = "block";
    document.getElementById("userEmail").textContent = user.email;
    cargarPrestamos(user.uid);
  } else {
    document.getElementById("login").style.display = "block";
    document.getElementById("main").style.display = "none";
  }
});

// ---------- CALCULAR PRÉSTAMO ----------
function calcularPrestamo(monto, plazo, tipo) {
  const tasa = TASAS[tipo];
  let interesTotal = monto * tasa * plazo;
  let montoTotal = monto + interesTotal;
  let cuota = montoTotal / plazo;
  let ganancia = interesTotal;

  return {
    interes: interesTotal.toFixed(2),
    cuota: cuota.toFixed(2),
    total: montoTotal.toFixed(2),
    ganancia: ganancia.toFixed(2),
    tasaUsada: (tasa * 100) + "%"
  };
}

// ---------- GUARDAR ----------
document.getElementById("formPrestamo").addEventListener("submit", (e) => {
  e.preventDefault();
  const user = auth.currentUser;
  if (!user) return;

  const nombre = document.getElementById("nombreCliente").value;
  const monto = parseFloat(document.getElementById("monto").value);
  const tipo = document.getElementById("plazoTipo").value;
  const plazo = parseInt(document.getElementById("plazo").value);

  const calculo = calcularPrestamo(monto, plazo, tipo);

  db.collection("prestamos").add({
    uid: user.uid,
    nombre,
    monto,
    tipo,
    plazo,
    tasa: calculo.tasaUsada,
    interes: calculo.interes,
    cuota: calculo.cuota,
    total: calculo.total,
    ganancia: calculo.ganancia,
    fecha: new Date()
  }).then(() => {
    document.getElementById("formPrestamo").reset();
    alert("Préstamo guardado ✅");
  }).catch(err => alert("Error guardando: " + err.message));
});

// ---------- CARGAR Y MOSTRAR TABLA ----------
function cargarPrestamos(uid) {
  cargarTasas(user.uid);  // <-- AGREGA ESTA
  db.collection("prestamos").where("uid", "==", uid)
  .orderBy("fecha", "desc")
  .onSnapshot((snapshot) => {
      let tabla = `
        <thead>
          <tr>
            <th>Cliente</th>
            <th>Monto</th>
            <th>Tipo</th>
            <th>Tiempo</th>
            <th>Tasa</th>
            <th>Valor Cuota</th>
            <th>Interés Total</th>
            <th>Ganancia</th>
            <th>Total Pagar</th>
          </tr>
        </thead>
        <tbody>
      `;

      snapshot.forEach((doc) => {
        const p = doc.data();
        tabla += `
          <tr>
            <td>${p.nombre}</td>
            <td>RD$ ${p.monto}</td>
            <td>${p.tipo}</td>
            <td>${p.plazo}</td>
            <td>${p.tasa}</td>
            <td>RD$ ${p.cuota}</td>
            <td>RD$ ${p.interes}</td>
            <td>RD$ ${p.ganancia}</td>
            <td>RD$ ${p.total}</td>
          </tr>
        `;
      });

      tabla += "</tbody>";
      document.getElementById("tablaPrestamos").innerHTML = tabla;
    });
}
let TASAS = { diario: 0.03, semanal: 0.15, mensual: 0.25 }; // Esto va arriba, debajo de const db

// 1. GUARDAR TASAS
function guardarTasas() {
  const user = auth.currentUser;
  const d = parseFloat(document.getElementById("tasaDiaria").value) / 100;
  const s = parseFloat(document.getElementById("tasaSemanal").value) / 100;
  const m = parseFloat(document.getElementById("tasaMensual").value) / 100;
  
  TASAS = { diario: d, semanal: s, mensual: m };

  db.collection("config").doc(user.uid).set({ tasas: TASAS })
  .then(() => alert("Tasas guardadas ✅"));
}

// 2. CARGAR TASAS AL ENTRAR
function cargarTasas(uid) {
  db.collection("config").doc(uid).get().then((doc) => {
    if (doc.exists) {
      TASAS = doc.data().tasas;
      document.getElementById("tasaDiaria").value = (TASAS.diario * 100);
      document.getElementById("tasaSemanal").value = (TAS.semanal * 100);
      document.getElementById("tasaMensual").value = (TAS.mensual * 100);
    }
  });
}
