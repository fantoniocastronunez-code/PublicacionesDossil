import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useVehicleStore } from '../store/useVehicleStore';
import VehicleCard from '../components/VehicleCard';
import { Plus, Search, RefreshCw } from 'lucide-react';

export default function Home() {
  const { vehiculos, fetchVehiculos, loading } = useVehicleStore();
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchVehiculos();
  }, [fetchVehiculos]);

  const filteredVehiculos = vehiculos.filter(v => 
    v.patente.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.fichaTecnica?.marca?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.fichaTecnica?.modelo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.fichaTecnica?.version?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.comercial?.tituloPublicacion?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 transition-colors">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Stock Actualizado</h1>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button 
            onClick={() => fetchVehiculos()} 
            disabled={loading}
            className="flex items-center justify-center gap-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 px-4 py-2.5 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors font-semibold border border-gray-200 dark:border-gray-700 disabled:opacity-50"
            title="Actualizar stock"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin text-indigo-600' : ''}`} />
            <span className="hidden sm:inline">Actualizar</span>
          </button>
          
          <Link to="/agregar" className="flex items-center justify-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl hover:bg-indigo-700 transition-all font-semibold shadow-sm hover:shadow flex-1 sm:flex-none">
            <Plus className="w-5 h-5" /> Nuevo Vehículo
          </Link>
        </div>
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

      <div className="mb-8 border-b border-gray-200 dark:border-gray-800 pb-4 flex justify-between items-end transition-colors">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {searchTerm ? 'Resultados de búsqueda' : 'Últimos ingresos'}
        </h2>
        <span className="text-gray-500 dark:text-gray-400 font-medium">{filteredVehiculos.length} vehículos</span>
      </div>

      {filteredVehiculos.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredVehiculos.map(vehiculo => (
            <VehicleCard key={vehiculo.id} vehiculo={vehiculo} />
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
