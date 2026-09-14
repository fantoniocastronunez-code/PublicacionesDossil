import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useVehicleStore } from '../store/useVehicleStore';
import VehicleCard from '../components/VehicleCard';
import { Plus, Search, RefreshCw, CheckSquare, Trash2, X, ArrowDownUp, MessageCircle } from 'lucide-react';
import Swal from 'sweetalert2';

export default function Home() {
  const { vehiculos, fetchVehiculos, loading, deleteMultipleVehiculos } = useVehicleStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [sortBy, setSortBy] = useState('fecha');
  const [sortOrder, setSortOrder] = useState('desc');
  const [filtroPago, setFiltroPago] = useState('todas');

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

  const generarReporteWhatsApp = () => {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const vehiculosHoy = vehiculos.filter(v => {
      // Intentar procesar fechaIngreso, puede venir como timestamp de Firestore o string ISO
      let dateValue = v.fechaIngreso;
      if (!dateValue) return false;
      
      // Si es un objeto Timestamp de Firebase con toDate()
      if (typeof dateValue.toDate === 'function') {
        dateValue = dateValue.toDate();
      } else {
        dateValue = new Date(dateValue);
      }

      const fechaVehiculo = new Date(dateValue);
      fechaVehiculo.setHours(0, 0, 0, 0);
      return fechaVehiculo.getTime() === hoy.getTime();
    });

    if (vehiculosHoy.length === 0) {
      Swal.fire('Sin publicaciones', 'No se encontraron vehículos agregados el día de hoy.', 'info');
      return;
    }

    let texto = `*Resumen de Vehículos Publicados Hoy (${new Date().toLocaleDateString()})*\n\n`;

    vehiculosHoy.forEach((v, index) => {
      const { marca = '', modelo = '', anio = '' } = v.fichaTecnica || {};
      const { webNativa, mercadoLibre, autosUsados, fbMarketplace } = v.publicaciones || {};
      
      const lugares = [];
      if (webNativa) lugares.push('Web');
      if (mercadoLibre) lugares.push('MercadoLibre');
      if (autosUsados) lugares.push('AutosUsados');
      if (fbMarketplace) lugares.push('Marketplace');

      const lugaresStr = lugares.length > 0 ? lugares.join(', ') : 'Ninguno';

      texto += `${index + 1}. *${marca} ${modelo}* ${anio ? `(${anio})` : ''}\n`;
      texto += `📍 Lugares: ${lugaresStr}\n\n`;
    });

    const url = `https://wa.me/?text=${encodeURIComponent(texto)}`;
    window.open(url, '_blank');
  };

  const filteredVehiculos = vehiculos.filter(v => {
    const matchesSearch = 
      v.patente.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.fichaTecnica?.marca?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.fichaTecnica?.modelo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.fichaTecnica?.version?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.comercial?.tituloPublicacion?.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesFiltroPago = 
      filtroPago === 'todas' || 
      (filtroPago === 'no-pagadas' && !v.pagoPublicacion) ||
      (filtroPago === 'pagadas' && v.pagoPublicacion);
      
    return matchesSearch && matchesFiltroPago;
  });

  const sortedVehiculos = [...filteredVehiculos].sort((a, b) => {
    let comparison = 0;
    if (sortBy === 'fecha') {
      const dateA = new Date(a.fechaIngreso || 0).getTime();
      const dateB = new Date(b.fechaIngreso || 0).getTime();
      comparison = dateA - dateB;
    } else if (sortBy === 'precio') {
      const priceA = Number(a.comercial?.precio) || 0;
      const priceB = Number(b.comercial?.precio) || 0;
      comparison = priceA - priceB;
    } else if (sortBy === 'marca') {
      const marcaA = (a.fichaTecnica?.marca || '').toLowerCase();
      const marcaB = (b.fichaTecnica?.marca || '').toLowerCase();
      comparison = marcaA.localeCompare(marcaB);
    }
    return sortOrder === 'asc' ? comparison : -comparison;
  });

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
          <span className="text-gray-500 dark:text-gray-400 font-medium">{sortedVehiculos.length} vehículos</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          
          <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            <select 
              value={filtroPago} 
              onChange={(e) => setFiltroPago(e.target.value)}
              className="bg-transparent text-sm font-bold text-gray-700 dark:text-gray-300 outline-none cursor-pointer py-1 px-2"
            >
              <option value="todas" className="text-gray-900">Todas las Pub.</option>
              <option value="no-pagadas" className="text-gray-900">No Pagadas</option>
              <option value="pagadas" className="text-gray-900">Pagadas</option>
            </select>
          </div>

          <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-1 sm:mr-2">
            <div className="flex items-center px-2 text-gray-500 dark:text-gray-400">
              <ArrowDownUp className="w-4 h-4 mr-1" />
              <span className="text-sm font-medium hidden sm:inline">Ordenar:</span>
            </div>
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent text-sm font-bold text-gray-700 dark:text-gray-300 outline-none cursor-pointer py-1"
            >
              <option value="fecha" className="text-gray-900">Fecha</option>
              <option value="precio" className="text-gray-900">Precio</option>
              <option value="marca" className="text-gray-900">Marca</option>
            </select>
            <button 
              onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
              className="px-2 py-1 ml-1 text-xs font-bold bg-white dark:bg-gray-700 rounded shadow-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
              title="Cambiar orden ascendente/descendente"
            >
              {sortOrder === 'asc' ? 'ASC' : 'DESC'}
            </button>
          </div>

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
            <>
              <button 
                onClick={generarReporteWhatsApp}
                className="flex items-center gap-1.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50 px-3 py-2 rounded-lg font-bold transition-colors"
                title="Generar reporte para WhatsApp de los vehículos ingresados hoy"
              >
                <MessageCircle className="w-4 h-4" /> Reporte Diario
              </button>
              <button 
                onClick={() => setIsSelectionMode(true)}
                className="flex items-center gap-1.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 px-3 py-2 rounded-lg font-bold transition-colors"
              >
                <CheckSquare className="w-4 h-4" /> Seleccionar Varios
              </button>
            </>
          )}
        </div>
      </div>

      {sortedVehiculos.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {sortedVehiculos.map(vehiculo => (
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
