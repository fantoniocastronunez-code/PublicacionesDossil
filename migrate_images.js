import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, updateDoc, doc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';

const firebaseConfig = {
  apiKey: "AIzaSyDtXIQ3F6LE0r3chzcLvkzDCGFvCC1NQ8Y",
  authDomain: "publicaciones-dossil.firebaseapp.com",
  projectId: "publicaciones-dossil",
  storageBucket: "publicaciones-dossil.firebasestorage.app",
  messagingSenderId: "989294862954",
  appId: "1:989294862954:web:aeba1dcdd41bb7b88aa013",
  measurementId: "G-BGGRZEB8Q"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function run() {
  console.log("Fetching vehiculos...");
  try {
    const qs = await getDocs(collection(db, "vehiculos"));
    console.log(`Found ${qs.size} vehiculos.`);
    let migratedCount = 0;

    for (const docSnap of qs.docs) {
      const data = docSnap.data();
      const id = docSnap.id;
      let needsUpdate = false;
      const newFotos = [];
      let newDocUrl = data.documento;

      if (data.fotos && Array.isArray(data.fotos)) {
        for (const url of data.fotos) {
          if (url && typeof url === 'string' && url.includes('localhost:3001')) {
            // Migrar esta foto
            const filename = url.split('/').pop();
            const localPath = path.join(__dirname, 'server', 'uploads', 'vehiculos', filename);
            if (fs.existsSync(localPath)) {
              console.log(`Uploading ${filename}...`);
              const fileBuffer = fs.readFileSync(localPath);
              const fileRef = ref(storage, `vehiculos/${uuidv4()}_${filename}`);
              await uploadBytes(fileRef, fileBuffer, { contentType: 'image/jpeg' });
              const downloadUrl = await getDownloadURL(fileRef);
              newFotos.push(downloadUrl);
              needsUpdate = true;
            } else {
              console.warn(`Local file not found: ${localPath}`);
              // Keep original or remove? Let's remove if local file not found, or keep original.
              // I will keep original if not found just in case.
              newFotos.push(url);
            }
          } else {
            newFotos.push(url);
          }
        }
      }

      if (data.documento && typeof data.documento === 'string' && data.documento.includes('localhost:3001')) {
        const filename = data.documento.split('/').pop();
        const localPath = path.join(__dirname, 'server', 'uploads', 'docs', filename);
        if (fs.existsSync(localPath)) {
          console.log(`Uploading doc ${filename}...`);
          const fileBuffer = fs.readFileSync(localPath);
          const fileRef = ref(storage, `docs/${uuidv4()}_${filename}`);
          await uploadBytes(fileRef, fileBuffer, { contentType: 'application/pdf' });
          newDocUrl = await getDownloadURL(fileRef);
          needsUpdate = true;
        } else {
          console.warn(`Local doc not found: ${localPath}`);
        }
      }

      if (needsUpdate) {
        console.log(`Updating vehiculo ${id}...`);
        await updateDoc(doc(db, "vehiculos", id), {
          fotos: newFotos,
          documento: newDocUrl
        });
        migratedCount++;
      }
    }
    console.log(`Migration complete. Updated ${migratedCount} vehiculos.`);
    process.exit(0);
  } catch (err) {
    console.error("Migration error:", err);
    process.exit(1);
  }
}

run();
