import { Link } from 'react-router-dom';
import { ExternalLink, Calendar, KeyRound } from 'lucide-react';

export default function VehicleCard({ vehiculo }) {
  const foto = vehiculo.fotos?.[0] || 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&q=80&w=800';

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-xl dark:hover:shadow-2xl dark:hover:shadow-black/50 transition-all duration-300 group flex flex-col h-full">
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100 dark:bg-gray-900">
        <img 
          src={foto} 
          alt={`${vehiculo.fichaTecnica?.marca} ${vehiculo.fichaTecnica?.modelo}`}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-3 right-3 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-bold text-gray-900 dark:text-gray-100 shadow-sm border border-transparent dark:border-gray-700">
          {vehiculo.patente}
        </div>
      </div>
      
      <div className="p-5 flex flex-col flex-grow">
        <div className="flex-grow">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
            {vehiculo.fichaTecnica?.marca} {vehiculo.fichaTecnica?.modelo}
          </h3>
          <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-4">
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" /> {vehiculo.fichaTecnica?.anio}
            </span>
            <span className="flex items-center gap-1">
              <KeyRound className="w-4 h-4" /> {vehiculo.fichaTecnica?.numeroMotor ? 'Rev. OK' : 'Pendiente'}
            </span>
          </div>
        </div>
        
        <Link 
          to={`/vehiculo/${vehiculo.id}`}
          className="w-full flex items-center justify-center gap-2 bg-gray-50 dark:bg-gray-700/50 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-gray-700 font-medium py-2.5 rounded-xl transition-colors border border-gray-100 dark:border-gray-600"
        >
          Ver Ficha Completa <ExternalLink className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
