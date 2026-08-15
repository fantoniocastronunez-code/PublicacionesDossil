import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// TODO: Reemplaza con la configuración de tu proyecto Firebase
// Puedes encontrar esto en Configuración del Proyecto > General > Tus aplicaciones
const firebaseConfig = {
  apiKey: "AIzaSyDtXIQ3F6LE0r3chzcLvkzDCGFvCC1NQ8Y",
  authDomain: "publicaciones-dossil.firebaseapp.com",
  projectId: "publicaciones-dossil",
  storageBucket: "publicaciones-dossil.firebasestorage.app",
  messagingSenderId: "989294862954",
  appId: "1:989294862954:web:aeba1dcdd41bb7b88aa013",
  measurementId: "G-BGGRZEB8Q"
};

// Inicializar de forma segura para evitar errores si faltan datos
let app, db, storage;

try {
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  storage = getStorage(app);
} catch (error) {
  console.warn("Firebase no está configurado correctamente aún. Agrega tus credenciales en src/config/firebase.js");
}

export { db, storage };
