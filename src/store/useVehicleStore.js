import { create } from 'zustand';
import { db, storage } from '../config/firebase';
import { collection, getDocs, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export const useVehicleStore = create((set, get) => ({
  vehiculos: [],
  loading: false,
  error: null,

  fetchVehiculos: async () => {
    if (!db) return; // Fallback handled in config
    set({ loading: true });
    try {
      const querySnapshot = await getDocs(collection(db, "vehiculos"));
      const vehiculos = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      set({ vehiculos, loading: false });
    } catch (error) {
      console.error("Error fetching vehicles:", error);
      set({ error: error.message, loading: false });
    }
  },

  addVehiculo: async (vehiculo, files) => {
    if (!db || !storage) {
      alert("Firebase no está configurado. Agrega tus credenciales en src/config/firebase.js");
      return;
    }
    
    set({ loading: true });
    try {
      const uploadedPhotos = [];
      
      // Upload photos to Firebase Storage
      if (files && files.length > 0) {
        for (const file of files) {
          const storageRef = ref(storage, `vehiculos/${Date.now()}_${file.name}`);
          const snapshot = await uploadBytes(storageRef, file);
          const downloadURL = await getDownloadURL(snapshot.ref);
          uploadedPhotos.push(downloadURL);
        }
      }

      // Cleanup files and photos (urls) from formData before saving
      const { archivosFotos, fotos, ...vehiculoData } = vehiculo;

      const newVehiculo = {
        ...vehiculoData,
        fotos: uploadedPhotos, // Reemplaza los blobs temporales por URLs reales
        fechaIngreso: new Date().toISOString()
      };
      
      const docRef = await addDoc(collection(db, "vehiculos"), newVehiculo);
      
      set(state => ({
        vehiculos: [{ ...newVehiculo, id: docRef.id }, ...state.vehiculos],
        loading: false
      }));
      
    } catch (error) {
      console.error("Error adding vehicle:", error);
      set({ error: error.message, loading: false });
      alert("Error al guardar en Firebase: " + error.message);
    }
  }
}));
