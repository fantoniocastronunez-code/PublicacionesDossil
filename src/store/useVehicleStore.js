import { create } from 'zustand';
import { db, storage } from '../config/firebase';
import { collection, getDocs, addDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';

export const useVehicleStore = create((set, get) => ({
  vehiculos: [],
  loading: false,
  error: null,

  fetchVehiculos: async () => {
    set({ loading: true });
    try {
      const querySnapshot = await getDocs(collection(db, "vehiculos"));
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

  addVehiculo: async (nuevoVehiculo, archivos) => {
    set({ loading: true });
    try {
      // 1. Subir fotos a Firebase Storage
      const urlsFotos = [];
      if (archivos && archivos.length > 0) {
        for (const archivo of archivos) {
          const imageRef = ref(storage, `vehiculos/${uuidv4()}_${archivo.name}`);
          await uploadBytes(imageRef, archivo);
          const url = await getDownloadURL(imageRef);
          urlsFotos.push(url);
        }
      }

      // 2. Guardar datos en Firestore
      const vehiculoParaGuardar = {
        ...nuevoVehiculo,
        fotos: urlsFotos,
        fechaIngreso: serverTimestamp()
      };
      
      // Eliminar archivosFotos del objeto antes de guardar en DB
      delete vehiculoParaGuardar.archivosFotos;

      const docRef = await addDoc(collection(db, "vehiculos"), vehiculoParaGuardar);
      
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

  updateVehiculo: async (id, datosActualizados, nuevosArchivos) => {
    set({ loading: true });
    try {
      // 1. Subir nuevas fotos si existen
      let urlsFotosAdicionales = [];
      if (nuevosArchivos && nuevosArchivos.length > 0) {
        for (const archivo of nuevosArchivos) {
          const imageRef = ref(storage, `vehiculos/${uuidv4()}_${archivo.name}`);
          await uploadBytes(imageRef, archivo);
          const url = await getDownloadURL(imageRef);
          urlsFotosAdicionales.push(url);
        }
      }

      // 2. Unir fotos antiguas con las nuevas (las urls antiguas ya vienen en datosActualizados.fotos)
      const fotosFinales = [...(datosActualizados.fotos || []), ...urlsFotosAdicionales];

      // 3. Preparar datos para Firestore
      const vehiculoParaActualizar = {
        ...datosActualizados,
        fotos: fotosFinales
      };
      
      delete vehiculoParaActualizar.archivosFotos;

      // 4. Actualizar en Firestore
      const vehiculoRef = doc(db, "vehiculos", id);
      await updateDoc(vehiculoRef, vehiculoParaActualizar);
      
      // 5. Actualizar el estado local (optimista)
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
