// ============================================================
// PrestaYa - script.js
// ============================================================
// IMPORTANTE: reemplaza estos valores con los de TU proyecto de
// Firebase (Firebase Console > Configuración del proyecto >
// "Tus apps" > Config del SDK). El projectId ya está puesto
// según tu proyecto "prestaya-17cf1"; los demás campos son
// solo ejemplos y NO van a funcionar hasta que pongas los tuyos.
// ============================================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword,
  onAuthStateChanged, signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  getFirestore, collection, addDoc, doc, updateDoc, deleteDoc,
  onSnapshot, query, where, orderBy, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "REEMPLAZA_CON_TU_API_KEY",
  authDomain: "prestaya-17cf1.firebaseapp.com",
  projectId: "prestaya-17cf1",
  storageBucket: "prestaya-17cf1.appspot.com",
  messagingSenderId: "REEMPLAZA_CON_TU_SENDER_ID",
  appId: "REEMPLAZA_CON_TU_APP_ID"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

let currentUser = null;
let clientesCache = [];   // [{id, nombre, apellido, cedula, telefono}]
let prestamosCache = [];  // [{id, clienteId, monto, fecha, tasa, tiempo}]
let unsubClientes = null;
let unsubPrestamos = null;

// ---------------- utilidades ----------------
function toast(msg, tipo = "ok") {
  const wrap = document.getElementById("toast");
  const el = document.createElement("div");
  el.className = "toast-msg" + (tipo === "error" ? " error" : "");
  el.textContent = msg;
  wrap.appendChild(el);
  setTimeout(() => el.remove(), 3500);
}

function traducirErrorFirebase(codigo) {
  const mapa = {
    "auth/email-already-in-use": "Ese correo ya está registrado.",
    "auth/invalid-email": "El correo no es válido.",
    "auth/weak-password": "La contraseña debe tener al menos 6 caracteres.",
    "auth/invalid-credential": "Correo o contraseña incorrectos.",
    "auth/wrong-password": "Correo o contraseña incorrectos.",
    "auth/user-not-found": "Correo o contraseña incorrectos.",
    "auth/missing-password": "Escribe tu contraseña."
  };
  return mapa[codigo] || "Ocurrió un error. Intenta de nuevo.";
}

function money(n) {
  return Number(n).toLocaleString("es-DO", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function calcularTotal(monto, tasa, tiempo) {
  const interes = Number(monto) * (Number(tasa) / 100) * Number(tiempo);
  return Number(monto) + interes;
}

// ---------------- AUTENTICACIÓN ----------------
async function registrar() {
  const correo = document.getElementById("login-correo").value.trim();
  const clave = document.getElementById("login-clave").value;
  const errorEl = document.getElementById("login-error");
  errorEl.textContent = "";
  if (!correo || !clave) { errorEl.textContent = "Completa correo y contraseña."; return; }
  try {
    await createUserWithEmailAndPassword(auth, correo, clave);
    toast("Cuenta creada. ¡Bienvenido!");
  } catch (e) {
    errorEl.textContent = traducirErrorFirebase(e.code);
  }
}

async function login() {
  const correo = document.getElementById("login-correo").value.trim();
  const clave = document.getElementById("login-clave").value;
  const errorEl = document.getElementById("login-error");
  errorEl.textContent = "";
  if (!correo || !clave) { errorEl.textContent = "Completa correo y contraseña."; return; }
  try {
    await signInWithEmailAndPassword(auth, correo, clave);
  } catch (e) {
    errorEl.textContent = traducirErrorFirebase(e.code);
  }
}

async function logout() {
  await signOut(auth);
}

onAuthStateChanged(auth, (user) => {
  currentUser = user;
  const loginView = document.getElementById("login-view");
  const appView = document.getElementById("app-view");
  if (user) {
    loginView.classList.add("hidden");
    appView.classList.remove("hidden");
    document.getElementById("user-email").textContent = user.email;
    document.getElementById("login-correo").value = "";
    document.getElementById("login-clave").value = "";
    suscribirClientes();
    suscribirPrestamos();
  } else {
    loginView.classList.remove("hidden");
    appView.classList.add("hidden");
    if (unsubClientes) unsubClientes();
    if (unsubPrestamos) unsubPrestamos();
  }
});

// ---------------- CLIENTES ----------------
function suscribirClientes() {
  const q = query(collection(db, "clientes"), where("uid", "==", currentUser.uid));
  unsubClientes = onSnapshot(q, (snap) => {
    clientesCache = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    pintarClientes();
    pintarSelectClientes();
  }, (err) => toast("Error leyendo clientes: " + err.message, "error"));
}

function pintarClientes() {
  const tbody = document.querySelector("#tabla-clientes tbody");
  const vacio = document.getElementById("clientes-vacio");
  tbody.innerHTML = "";
  vacio.classList.toggle("hidden", clientesCache.length > 0);
  clientesCache.forEach(c => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${c.nombre}</td><td>${c.apellido}</td><td>${c.cedula}</td><td>${c.telefono}</td>
      <td class="row-actions"><button data-id="${c.id}" class="sel-cliente">Editar</button></td>`;
    tbody.appendChild(tr);
  });
  tbody.querySelectorAll(".sel-cliente").forEach(btn => {
    btn.addEventListener("click", () => cargarClienteEnForm(btn.dataset.id));
  });
}

function pintarSelectClientes() {
  const sel = document.getElementById("prestamo-cliente");
  const actual = sel.value;
  sel.innerHTML = '<option value="">Selecciona un cliente</option>' +
    clientesCache.map(c => <option value="${c.id}">${c.nombre} ${c.apellido} - ${c.cedula}</option>).join("");
  if (actual) sel.value = actual;
}

function cargarClienteEnForm(id) {
  const c = clientesCache.find(x => x.id === id);
  if (!c) return;
  document.getElementById("cliente-id").value = c.id;
  document.getElementById("cliente-nombre").value = c.nombre;
  document.getElementById("cliente-apellido").value = c.apellido;
  document.getElementById("cliente-cedula").value = c.cedula;
  document.getElementById("cliente-telefono").value = c.telefono;
}

function limpiarFormCliente() {
  document.getElementById("cliente-id").value = "";
  ["cliente-nombre", "cliente-apellido", "cliente-cedula", "cliente-telefono"].forEach(id => document.getElementById(id).value = "");
}

function leerFormCliente() {
  return {
    nombre: document.getElementById("cliente-nombre").value.trim(),
    apellido: document.getElementById("cliente-apellido").value.trim(),
    cedula: document.getElementById("cliente-cedula").value.trim(),
    telefono: document.getElementById("cliente-telefono").value.trim()
  };
}

async function registrarCliente() {
  const datos = leerFormCliente();
  if (!datos.nombre || !datos.apellido || !datos.cedula || !datos.telefono) {
    toast("Completa todos los campos del cliente.", "error"); return;
  }
  try {
    await addDoc(collection(db, "clientes"), { ...datos, uid: currentUser.uid, creado: serverTimestamp() });
    toast("Cliente registrado.");
    limpiarFormCliente();
  } catch (e) { toast("Error al registrar: " + e.message, "error"); }
}

async function actualizarCliente() {
  const id = document.getElementById("cliente-id").value;
  if (!id) { toast("Selecciona un cliente de la tabla primero.", "error"); return; }
  try {
    await updateDoc(doc(db, "clientes", id), leerFormCliente());
    toast("Cliente actualizado.");
    limpiarFormCliente();
  } catch (e) { toast("Error al actualizar: " + e.message, "error"); }
}

async function eliminarCliente() {
  const id = document.getElementById("cliente-id").value;
  if (!id) { toast("Selecciona un cliente de la tabla primero.", "error"); return; }
  if (!confirm("¿Eliminar este cliente?")) return;
  try {
    await deleteDoc(doc(db, "clientes", id));
    toast("Cliente eliminado.");
    limpiarFormCliente();
  } catch (e) { toast("Error al eliminar: " + e.message, "error"); }
}

// ---------------- PRÉSTAMOS ----------------
function suscribirPrestamos() {
  const q = query(collection(db, "prestamos"), where("uid", "==", currentUser.uid));
  unsubPrestamos = onSnapshot(q, (snap) => {
    prestamosCache = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    pintarPrestamos();
  }, (err) => toast("Error leyendo préstamos: " + err.message, "error"));
}

function nombreCliente(clienteId) {
  const c = clientesCache.find(x => x.id === clienteId);
  return c ? ${c.nombre} ${c.apellido} : "(cliente eliminado)";
}

function pintarPrestamos() {
  const tbody = document.querySelector("#tabla-prestamos tbody");
  const vacio = document.getElementById("prestamos-vacio");
  tbody.innerHTML = "";
  vacio.classList.toggle("hidden", prestamosCache.length > 0);
  prestamosCache.forEach(p => {
    const total = calcularTotal(p.monto, p.tasa, p.tiempo);
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${nombreCliente(p.clienteId)}</td>
      <td class="num">RD$ ${money(p.monto)}</td>
      <td>${p.fecha}</td>
      <td class="num">${p.tasa}%</td>
      <td>${p.tiempo} mes(es)</td>
      <td class="num">RD$ ${money(total)}</td>
      <td class="row-actions">
        <button data-id="${p.id}" class="sel-prestamo">Editar</button>
        <button data-id="${p.id}" class="imp-prestamo">Imprimir</button>
      </td>`;
    tbody.appendChild(tr);
  });
  tbody.querySelectorAll(".sel-prestamo").forEach(btn => btn.addEventListener("click", () => cargarPrestamoEnForm(btn.dataset.id)));
  tbody.querySelectorAll(".imp-prestamo").forEach(btn => btn.addEventListener("click", () => imprimirPrestamo(btn.dataset.id)));
}

function cargarPrestamoEnForm(id) {
  const p = prestamosCache.find(x => x.id === id);
  if (!p) return;
  document.getElementById("prestamo-id").value = p.id;
  document.getElementById("prestamo-cliente").value = p.clienteId;
  document.getElementById("prestamo-monto").value = p.monto;
  document.getElementById("prestamo-fecha").value = p.fecha;
  document.getElementById("prestamo-tasa").value = p.tasa;
  document.getElementById("prestamo-tiempo").value = p.tiempo;
}

function limpiarFormPrestamo() {
  document.getElementById("prestamo-id").value = "";
  document.getElementById("prestamo-cliente").value = "";
  ["prestamo-monto", "prestamo-fecha", "prestamo-tasa", "prestamo-tiempo"].forEach(id => document.getElementById(id).value = "");
}

function leerFormPrestamo() {
  return {
    clienteId: document.getElementById("prestamo-cliente").value,
    monto: Number(document.getElementById("prestamo-monto").value),
    fecha: document.getElementById("prestamo-fecha").value,
    tasa: Number(document.getElementById("prestamo-tasa").value),
    tiempo: Number(document.getElementById("prestamo-tiempo").value)
  };
}

async function guardarPrestamo() {
  const datos = leerFormPrestamo();
  if (!datos.clienteId || !datos.monto || !datos.fecha || !datos.tasa || !datos.tiempo) {
    toast("Completa todos los campos del préstamo.", "error"); return;
  }
  try {
    await addDoc(collection(db, "prestamos"), { ...datos, uid: currentUser.uid, creado: serverTimestamp() });
    toast("Préstamo guardado.");
    limpiarFormPrestamo();
  } catch (e) { toast("Error al guardar: " + e.message, "error"); }
}

async function editarPrestamo() {
  const id = document.getElementById("prestamo-id").value;
  if (!id) { toast("Selecciona un préstamo de la tabla primero.", "error"); return; }
  try {
    await updateDoc(doc(db, "prestamos", id), leerFormPrestamo());
    toast("Préstamo actualizado.");
    limpiarFormPrestamo();
  } catch (e) { toast("Error al actualizar: " + e.message, "error"); }
}

async function eliminarPrestamo() {
  const id = document.getElementById("prestamo-id").value;
  if (!id) { toast("Selecciona un préstamo de la tabla primero.", "error"); return; }
  if (!confirm("¿Eliminar este préstamo?")) return;
  try {
    await deleteDoc(doc(db, "prestamos", id));
    toast("Préstamo eliminado.");
    limpiarFormPrestamo();
  } catch (e) { toast("Error al eliminar: " + e.message, "error"); }
}

function imprimirPrestamo(id) {
  const p = prestamosCache.find(x => x.id === id);
  if (!p) return;
  const total = calcularTotal(p.monto, p.tasa, p.tiempo);
  const ventana = window.open("", "_blank");
  ventana.document.write(`
    <html><head><title>Recibo de préstamo</title>
    <style>
      body{font-family:sans-serif;padding:40px;color:#2B2620}
      h1{font-size:20px;border-bottom:2px solid #1F3D2B;padding-bottom:10px}
      table{width:100%;margin-top:20px;border-collapse:collapse}
      td{padding:8px 0;border-bottom:1px solid #ddd}
      td:first-child{color:#5C5546;width:180px}
    </style></head><body>
    <h1>PrestaYa — Recibo de préstamo</h1>
    <table>
      <tr><td>Cliente</td><td>${nombreCliente(p.clienteId)}</td></tr>
      <tr><td>Monto prestado</td><td>RD$ ${money(p.monto)}</td></tr>
      <tr><td>Fecha</td><td>${p.fecha}</td></tr>
      <tr><td>Tasa de interés</td><td>${p.tasa}%</td></tr>
      <tr><td>Tiempo</td><td>${p.tiempo} mes(es)</td></tr>
      <tr><td>Total a pagar</td><td><b>RD$ ${money(total)}</b></td></tr>
    </table>
    </body></html>`);
  ventana.document.close();
  ventana.focus();
  ventana.print();
}

// ---------------- NAVEGACIÓN DE PESTAÑAS ----------------
function activarTab(nombre) {
  document.querySelectorAll(".tab").forEach(t => t.classList.toggle("active", t.dataset.tab === nombre));
  document.getElementById("clientes-tab").classList.toggle("hidden", nombre !== "clientes");
  document.getElementById("prestamos-tab").classList.toggle("hidden", nombre !== "prestamos");
}

// ---------------- CONEXIÓN DE EVENTOS ----------------
document.getElementById("btn-entrar").addEventListener("click", login);
document.getElementById("btn-registrarme").addEventListener("click", registrar);
document.getElementById("btn-salir").addEventListener("click", logout);

document.getElementById("btn-cliente-registrar").addEventListener("click", registrarCliente);
document.getElementById("btn-cliente-actualizar").addEventListener("click", actualizarCliente);
document.getElementById("btn-cliente-eliminar").addEventListener("click", eliminarCliente);
document.getElementById("btn-cliente-limpiar").addEventListener("click", limpiarFormCliente);

document.getElementById("btn-prestamo-guardar").addEventListener("click", guardarPrestamo);
document.getElementById("btn-prestamo-editar").addEventListener("click", editarPrestamo);
document.getElementById("btn-prestamo-eliminar").addEventListener("click", eliminarPrestamo);
document.getElementById("btn-prestamo-limpiar").addEventListener("click", limpiarFormPrestamo);

document.querySelectorAll(".tab").forEach(t => t.addEventListener("click", () => activarTab(t.dataset.tab)));

// Enter para entrar en el login
document.getElementById("login-clave").addEventListener("keydown", (e) => {
  if (e.key === "Enter") login();
});
