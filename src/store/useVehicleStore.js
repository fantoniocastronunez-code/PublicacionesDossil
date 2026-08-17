import { create } from 'zustand';
import { db, storage } from '../config/firebase';
import { collection, getDocs, addDoc, doc, updateDoc, serverTimestamp, writeBatch } from 'firebase/firestore';
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

  addVehiculo: async (nuevoVehiculo, imagenes, documentoPdf) => {
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

      let urlDocumento = null;
      if (documentoPdf && documentoPdf.file) {
        const docRefStorage = ref(storage, `vehiculos/docs/${uuidv4()}_${documentoPdf.file.name}`);
        await withTimeout(uploadBytes(docRefStorage, documentoPdf.file));
        urlDocumento = await withTimeout(getDownloadURL(docRefStorage));
      }

      // 2. Guardar datos en Firestore
      const vehiculoParaGuardar = {
        ...nuevoVehiculo,
        fotos: urlsFotos,
        documento: urlDocumento,
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

  addMultipleVehiculos: async (vehiculosArray) => {
    set({ loading: true, error: null });
    try {
      const batch = writeBatch(db);
      const nuevosVehiculos = [];
      const timestamp = serverTimestamp();

      for (const vehiculo of vehiculosArray) {
        const newRef = doc(collection(db, "vehiculos"));
        const vehiculoParaGuardar = {
          ...vehiculo,
          fotos: [], // Sin fotos iniciales desde Excel
          fechaIngreso: timestamp
        };
        batch.set(newRef, vehiculoParaGuardar);
        
        nuevosVehiculos.push({ ...vehiculoParaGuardar, id: newRef.id, fechaIngreso: new Date().toISOString() });
      }

      await withTimeout(batch.commit());

      set(state => ({
        vehiculos: [...nuevosVehiculos, ...state.vehiculos],
        loading: false
      }));

    } catch (error) {
      console.error("Error al guardar múltiples vehículos: ", error);
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  deleteMultipleVehiculos: async (idsArray) => {
    set({ loading: true, error: null });
    try {
      const batch = writeBatch(db);
      for (const id of idsArray) {
        const vehiculoRef = doc(db, "vehiculos", id);
        batch.delete(vehiculoRef);
      }
      await withTimeout(batch.commit());
      
      set(state => ({
        vehiculos: state.vehiculos.filter(v => !idsArray.includes(v.id)),
        loading: false
      }));
    } catch (error) {
      console.error("Error al eliminar múltiples vehículos: ", error);
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  updateVehiculo: async (id, datosActualizados, imagenes, documentoPdf) => {
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

      const currentVehiculo = get().vehiculos.find(v => v.id === id);
      let urlDocumento = currentVehiculo?.documento || null;

      if (documentoPdf && documentoPdf.file) {
        // Se subió un nuevo documento
        const docRefStorage = ref(storage, `vehiculos/docs/${uuidv4()}_${documentoPdf.file.name}`);
        await withTimeout(uploadBytes(docRefStorage, documentoPdf.file));
        urlDocumento = await withTimeout(getDownloadURL(docRefStorage));
      } else if (documentoPdf === null) {
        // Se eliminó el documento existente
        urlDocumento = null;
      }

      // 2. Preparar datos para Firestore
      const vehiculoParaActualizar = {
        ...datosActualizados,
        fotos: urlsFotos,
        documento: urlDocumento
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
