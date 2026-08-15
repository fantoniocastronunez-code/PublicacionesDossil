import { useState, useEffect } from 'react';
import { Search, Loader2 } from 'lucide-react';
import VehicleCard from '../components/VehicleCard';
import { useVehicleStore } from '../store/useVehicleStore';

export default function Home() {
  const { vehiculos, fetchVehiculos, loading, error } = useVehicleStore();
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchVehiculos();
  }, [fetchVehiculos]);

  const filteredVehiculos = vehiculos.filter(v => 
    v.patente.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.fichaTecnica?.marca?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.fichaTecnica?.modelo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.fichaTecnica?.version?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-6 transition-colors">
          Gestión de <span className="text-indigo-600 dark:text-indigo-400">Vehículos</span>
        </h1>
        <p className="text-xl text-gray-500 dark:text-gray-400 mb-8 transition-colors">
          Busca por patente, marca o modelo para acceder rápidamente a la ficha técnica de tus vehículos.
        </p>
        
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
