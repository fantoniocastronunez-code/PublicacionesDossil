import { Link } from 'react-router-dom';
import { CarFront, Calendar, KeyRound, ExternalLink, Globe, Hash, Share2 } from 'lucide-react';

export default function VehicleCard({ vehiculo }) {
  const linksActivos = Object.values(vehiculo.publicaciones || {}).filter(url => url).length;
  const imagenPrincipal = vehiculo.fotos?.[0] || 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&q=80&w=400';
  
  const titulo = vehiculo.comercial?.tituloPublicacion || `${vehiculo.fichaTecnica?.marca} ${vehiculo.fichaTecnica?.modelo}`;
  const precioFormatted = vehiculo.comercial?.precio ? new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(vehiculo.comercial.precio) : null;

  return (
    <div className="group bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden transition-all duration-300 flex flex-col h-full transform hover:-translate-y-1">
      <Link to={`/vehiculo/${vehiculo.id}`} className="relative aspect-[4/3] overflow-hidden bg-gray-100 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 block">
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
      </Link>

      <div className="p-5 flex-grow flex flex-col">
        <div className="flex justify-between items-start mb-2 gap-2">
          <Link to={`/vehiculo/${vehiculo.id}`} className="text-xl font-bold text-gray-900 dark:text-white leading-tight line-clamp-2 hover:text-indigo-600 transition-colors" title={titulo}>
            {titulo}
          </Link>
          <span className="shrink-0 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs font-mono px-2 py-1 rounded-md border border-gray-200 dark:border-gray-600">
            {vehiculo.patente}
          </span>
        </div>
        
        {vehiculo.fichaTecnica?.tipoVehiculo && (
          <div className="mb-2">
             <span className="text-xs font-semibold bg-gray-100 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-md border border-gray-200 dark:border-gray-600/50">{vehiculo.fichaTecnica.tipoVehiculo}</span>
          </div>
        )}

        {precioFormatted && (
          <div className="mb-4 flex items-end gap-2">
            <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">{precioFormatted}</span>
            {vehiculo.comercial?.masIva && <span className="text-xs font-bold bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 px-2 py-1 rounded-full mb-1">+ IVA</span>}
          </div>
        )}

        <div className="grid grid-cols-2 gap-2 mt-auto mb-4">
          <div className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
            <Calendar className="w-4 h-4" /> {vehiculo.fichaTecnica?.anio}
          </div>
          <div className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
            <KeyRound className="w-4 h-4" /> {vehiculo.fichaTecnica?.numeroMotor ? 'Rev. OK' : 'Pend.'}
          </div>
        </div>
        
        <div className="flex gap-2">
          <Link 
            to={`/vehiculo/${vehiculo.id}/publicar`}
            className="flex items-center justify-center bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 font-medium px-4 py-2.5 rounded-xl transition-colors border border-green-100 dark:border-green-800 hover:bg-green-100 dark:hover:bg-green-800/80"
            title="Preparar Publicación"
          >
            <Share2 className="w-5 h-5" />
          </Link>
          <Link 
            to={`/vehiculo/${vehiculo.id}`}
            className="flex-1 flex items-center justify-center gap-2 bg-gray-50 dark:bg-gray-700/50 text-indigo-600 dark:text-indigo-400 font-medium py-2.5 rounded-xl transition-colors border border-gray-100 dark:border-gray-600 hover:bg-indigo-50 dark:hover:bg-gray-700"
          >
            Ver Ficha <ExternalLink className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
