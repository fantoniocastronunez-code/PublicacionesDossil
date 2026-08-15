import { create } from 'zustand';
import { db, storage } from '../config/firebase';
import { collection, getDocs, addDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';

const withTimeout = (promise, ms = 15000) => {
  return Promise.race([
    promise,
    new Promise((_, reject) => 
      setTimeout(() => reject(new Error("La operación tardó demasiado. Revisa tu conexión a internet o las Reglas de Seguridad en Firebase.")), ms)
    )
  ]);
};

export const useVehicleStore = create((set, get) => ({
  vehiculos: [],
  loading: false,
  error: null,

  fetchVehiculos: async () => {
    set({ loading: true, error: null });
    try {
      const querySnapshot = await withTimeout(getDocs(collection(db, "vehiculos")));
      const vehiculosData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      set({ vehiculos: vehiculosData, loading: false });
    } catch (error) {
      console.error("Error al obtener vehículos: ", error);
      set({ error: error.message, loading: false });
    }
  },

  addVehiculo: async (nuevoVehiculo, imagenes) => {
    set({ loading: true, error: null });
    try {
      // 1. Procesar todas las fotos en el orden exacto
      const urlsFotos = [];
      if (imagenes && imagenes.length > 0) {
        for (const img of imagenes) {
          if (img.file) {
            const imageRef = ref(storage, `vehiculos/${uuidv4()}_${img.file.name}`);
            await withTimeout(uploadBytes(imageRef, img.file));
            const url = await withTimeout(getDownloadURL(imageRef));
            urlsFotos.push(url);
          } else {
            urlsFotos.push(img.url); // Ya era una URL de Firebase
          }
        }
      }

      // 2. Guardar datos en Firestore
      const vehiculoParaGuardar = {
        ...nuevoVehiculo,
        fotos: urlsFotos,
        fechaIngreso: serverTimestamp()
      };
      
      delete vehiculoParaGuardar.fotos_temporales;

      const docRef = await withTimeout(addDoc(collection(db, "vehiculos"), vehiculoParaGuardar));
      
      // 3. Actualizar el estado local (optimista)
      set(state => ({
        vehiculos: [{ ...vehiculoParaGuardar, id: docRef.id, fechaIngreso: new Date().toISOString() }, ...state.vehiculos],
        loading: false
      }));

    } catch (error) {
      console.error("Error al guardar el vehículo: ", error);
      set({ error: error.message, loading: false });
    }
  },

  updateVehiculo: async (id, datosActualizados, imagenes) => {
    set({ loading: true, error: null });
    try {
      // 1. Procesar todas las fotos en el orden exacto
      const urlsFotos = [];
      if (imagenes && imagenes.length > 0) {
        for (const img of imagenes) {
          if (img.file) {
            const imageRef = ref(storage, `vehiculos/${uuidv4()}_${img.file.name}`);
            await withTimeout(uploadBytes(imageRef, img.file));
            const url = await withTimeout(getDownloadURL(imageRef));
            urlsFotos.push(url);
          } else {
            urlsFotos.push(img.url); // Mantiene la URL existente en ese orden
          }
        }
      }

      // 2. Preparar datos para Firestore
      const vehiculoParaActualizar = {
        ...datosActualizados,
        fotos: urlsFotos
      };
      
      delete vehiculoParaActualizar.fotos_temporales;

      // 3. Actualizar en Firestore
      const vehiculoRef = doc(db, "vehiculos", id);
      await withTimeout(updateDoc(vehiculoRef, vehiculoParaActualizar));
      
      // 4. Actualizar el estado local (optimista)
      set(state => ({
        vehiculos: state.vehiculos.map(v => v.id === id ? { ...v, ...vehiculoParaActualizar } : v),
        loading: false
      }));

    } catch (error) {
      console.error("Error al actualizar el vehículo: ", error);
      set({ error: error.message, loading: false });
    }
  }
}));
