import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useVehicleStore } from '../store/useVehicleStore';
import VehicleCard from '../components/VehicleCard';
import { Plus, Search, RefreshCw, CheckSquare, Trash2, X } from 'lucide-react';
import Swal from 'sweetalert2';

export default function Home() {
  const { vehiculos, fetchVehiculos, loading, deleteMultipleVehiculos } = useVehicleStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);

  useEffect(() => {
    fetchVehiculos();
  }, [fetchVehiculos]);

  const handleSelect = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleDeleteSelected = async () => {
    if (selectedIds.length === 0) return;
    
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: `Estás a punto de eliminar ${selectedIds.length} vehículos. Esta acción no se puede deshacer.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      customClass: {
        popup: 'rounded-2xl',
        confirmButton: 'rounded-xl px-4 py-2 font-bold',
        cancelButton: 'rounded-xl px-4 py-2 font-bold'
      }
    });

    if (result.isConfirmed) {
      await deleteMultipleVehiculos(selectedIds);
      setSelectedIds([]);
      setIsSelectionMode(false);
      Swal.fire({
        title: 'Eliminados!',
        text: 'Los vehículos han sido eliminados del inventario.',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false,
        customClass: { popup: 'rounded-2xl' }
      });
    }
  };

  const filteredVehiculos = vehiculos.filter(v => 
    v.patente.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.fichaTecnica?.marca?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.fichaTecnica?.modelo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.fichaTecnica?.version?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.comercial?.tituloPublicacion?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 transition-colors">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Stock Actualizado</h1>
      </div>

      <div className="mb-8">
        <div className="relative max-w-2xl mx-auto shadow-sm rounded-2xl overflow-hidden focus-within:shadow-md transition-shadow">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-6 w-6 text-gray-400 dark:text-gray-500" />
          </div>
          <input
            type="text"
            className="block w-full pl-12 pr-4 py-4 text-lg border-0 ring-1 ring-inset ring-gray-200 dark:ring-gray-700 focus:ring-2 focus:ring-inset focus:ring-indigo-600 outline-none rounded-2xl bg-white dark:bg-gray-800 dark:text-white transition-colors"
            placeholder="Revisar patente (ej. AB123CD)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="mb-8 border-b border-gray-200 dark:border-gray-800 pb-4 flex flex-col sm:flex-row justify-between sm:items-end gap-4 transition-colors">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {searchTerm ? 'Resultados de búsqueda' : 'Últimos ingresos'}
          </h2>
          <span className="text-gray-500 dark:text-gray-400 font-medium">{filteredVehiculos.length} vehículos</span>
        </div>

        <div className="flex items-center gap-2">
          {isSelectionMode ? (
            <>
              <span className="text-sm font-medium text-gray-500 mr-2">{selectedIds.length} seleccionados</span>
              <button 
                onClick={handleDeleteSelected}
                disabled={selectedIds.length === 0 || loading}
                className="flex items-center gap-1.5 bg-red-100 text-red-600 hover:bg-red-200 px-3 py-2 rounded-lg font-bold transition-colors disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" /> Eliminar
              </button>
              <button 
                onClick={() => { setIsSelectionMode(false); setSelectedIds([]); }}
                className="flex items-center gap-1.5 bg-gray-100 text-gray-600 hover:bg-gray-200 px-3 py-2 rounded-lg font-bold transition-colors"
              >
                <X className="w-4 h-4" /> Cancelar
              </button>
            </>
          ) : (
            <button 
              onClick={() => setIsSelectionMode(true)}
              className="flex items-center gap-1.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 px-3 py-2 rounded-lg font-bold transition-colors"
            >
              <CheckSquare className="w-4 h-4" /> Seleccionar Varios
            </button>
          )}
        </div>
      </div>

      {filteredVehiculos.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredVehiculos.map(vehiculo => (
            <VehicleCard 
              key={vehiculo.id} 
              vehiculo={vehiculo} 
              selectable={isSelectionMode}
              isSelected={selectedIds.includes(vehiculo.id)}
              onSelect={handleSelect}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 transition-colors">
          <p className="text-gray-500 dark:text-gray-400 text-lg">No se encontraron vehículos que coincidan con la búsqueda.</p>
        </div>
      )}
    </div>
  );
}
