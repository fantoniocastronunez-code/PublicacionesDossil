import { Link } from 'react-router-dom';
import { CarFront, Calendar, KeyRound, ExternalLink, Globe, Hash } from 'lucide-react';

export default function VehicleCard({ vehiculo }) {
  const linksActivos = Object.values(vehiculo.publicaciones || {}).filter(url => url).length;
  const imagenPrincipal = vehiculo.fotos?.[0] || 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&q=80&w=400';
  
  const titulo = vehiculo.comercial?.tituloPublicacion || `${vehiculo.fichaTecnica?.marca} ${vehiculo.fichaTecnica?.modelo}`;
  const precioFormatted = vehiculo.comercial?.precio ? new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(vehiculo.comercial.precio) : null;

  return (
    <Link to={`/vehiculo/${vehiculo.id}`} className="group bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden transition-all duration-300 flex flex-col h-full transform hover:-translate-y-1">
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
        <img 
          src={imagenPrincipal}
          alt={titulo}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {linksActivos > 0 && (
          <div className="absolute top-3 right-3 bg-indigo-600/90 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-sm">
            <Globe className="w-3 h-3" /> {linksActivos} Pub.
          </div>
        )}
      </div>

      <div className="p-5 flex-grow flex flex-col">
        <div className="flex justify-between items-start mb-2 gap-2">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white leading-tight line-clamp-2" title={titulo}>
            {titulo}
          </h3>
          <span className="shrink-0 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs font-mono px-2 py-1 rounded-md border border-gray-200 dark:border-gray-600">
            {vehiculo.patente}
          </span>
        </div>
        
          to={`/vehiculo/${vehiculo.id}`}
          className="w-full flex items-center justify-center gap-2 bg-gray-50 dark:bg-gray-700/50 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-gray-700 font-medium py-2.5 rounded-xl transition-colors border border-gray-100 dark:border-gray-600"
        >
          Ver Ficha Completa <ExternalLink className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
