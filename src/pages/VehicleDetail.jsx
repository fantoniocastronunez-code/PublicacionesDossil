import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { ArrowLeft, CarFront, FileText, Calendar, KeyRound, Globe, ExternalLink, Hash, Loader2, Edit, Share2 } from 'lucide-react';
import { useVehicleStore } from '../store/useVehicleStore';

export default function VehicleDetail() {
  const { id } = useParams();
  const { vehiculos, loading } = useVehicleStore();
  
  const vehiculo = vehiculos.find(v => v.id === id);
  const [imagenSeleccionada, setImagenSeleccionada] = useState(null);

  useEffect(() => {
    if (vehiculo && vehiculo.fotos && vehiculo.fotos.length > 0 && !imagenSeleccionada) {
      setImagenSeleccionada(vehiculo.fotos[0]);
    }
  }, [vehiculo, imagenSeleccionada]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
      </div>
    );
  }

  if (!vehiculo) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Vehículo no encontrado</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-6">El vehículo que buscas no existe o ha sido eliminado.</p>
        <Link to="/" className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline">Volver al inicio</Link>
      </div>
    );
  }

  const titulo = vehiculo.comercial?.tituloPublicacion || `${vehiculo.fichaTecnica?.marca} ${vehiculo.fichaTecnica?.modelo}`;
  const precioFormatted = vehiculo.comercial?.precio ? new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(vehiculo.comercial.precio) : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 transition-colors">
      <div className="flex justify-between items-center mb-8">
        <Link to="/" className="inline-flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" /> Volver al inventario
        </Link>
        <div className="flex gap-3">
          <Link to={`/vehiculo/${id}/publicar`} className="inline-flex items-center gap-2 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 px-4 py-2 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/50 transition-colors font-medium shadow-sm">
            <Share2 className="w-4 h-4" /> <span className="hidden sm:inline">Preparar Publicaciones</span>
          </Link>
          <Link to={`/editar/${id}`} className="inline-flex items-center gap-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-4 py-2 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors font-medium">
            <Edit className="w-4 h-4" /> Editar
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Columna Izquierda: Fotos */}
        <div className="lg:col-span-2 space-y-4">
          <div className="aspect-[16/9] rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
            <img 
              src={imagenSeleccionada || vehiculo.fotos?.[0] || 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&q=80&w=1200'} 
              alt="Vehículo principal" 
              className="w-full h-full object-cover"
            />
          </div>
          {vehiculo.fotos && vehiculo.fotos.length > 1 && (
            <div className="grid grid-cols-4 sm:grid-cols-5 gap-4">
              {vehiculo.fotos.map((foto, idx) => (
                <div 
                  key={idx} 
                  onClick={() => setImagenSeleccionada(foto)}
                  className={`aspect-[4/3] rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-900 border-2 transition-all cursor-pointer ${imagenSeleccionada === foto ? 'border-indigo-600 ring-2 ring-indigo-600/20 opacity-100' : 'border-transparent hover:border-indigo-400 opacity-80 hover:opacity-100'}`}
                >
                  <img src={foto} alt={`Vista ${idx + 1}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Columna Derecha: Información */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-colors">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 leading-tight">
              {titulo}
            </h1>
            
            {precioFormatted && (
              <div className="flex items-end gap-3 mb-4">
                <span className="text-4xl font-black text-indigo-600 dark:text-indigo-400">{precioFormatted}</span>
                {vehiculo.comercial?.masIva && <span className="text-sm font-bold bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 px-3 py-1 rounded-full mb-1.5">+ IVA</span>}
              </div>
            )}

            <div className="flex items-center gap-3 mb-6 mt-2">
              <span className="bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-3 py-1 rounded-md font-mono font-bold border border-gray-200 dark:border-gray-600">
                {vehiculo.patente}
              </span>
              <span className="text-gray-500 dark:text-gray-400">Patente registrada</span>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2 text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-700 pb-2">
                <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400" /> Ficha Técnica
              </h3>

              <div className="grid grid-cols-2 gap-4 text-sm">
                {(vehiculo.fichaTecnica?.categoria || vehiculo.fichaTecnica?.tipoVehiculo) && (
                  <div className="col-span-2 flex flex-wrap gap-2 mb-2">
                    {vehiculo.fichaTecnica?.categoria && (
                      <span className="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 px-3 py-1 rounded-full font-medium border border-indigo-100 dark:border-indigo-800">
                        {vehiculo.fichaTecnica.categoria}
                      </span>
                    )}
                    {vehiculo.fichaTecnica?.tipoVehiculo && (
                      <span className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full font-medium border border-blue-100 dark:border-blue-800">
                        {vehiculo.fichaTecnica.tipoVehiculo}
                      </span>
                    )}
                  </div>
                )}
                <div>
                  <p className="text-gray-500 dark:text-gray-400 flex items-center gap-1"><CarFront className="w-4 h-4"/> Marca</p>
                  <p className="font-semibold text-gray-900 dark:text-gray-100">{vehiculo.fichaTecnica?.marca}</p>
                </div>
                {vehiculo.fichaTecnica?.version && (
                  <div>
                    <p className="text-gray-500 dark:text-gray-400 flex items-center gap-1"><CarFront className="w-4 h-4"/> Versión</p>
                    <p className="font-semibold text-gray-900 dark:text-gray-100">{vehiculo.fichaTecnica.version}</p>
                  </div>
                )}
                <div>
                  <p className="text-gray-500 dark:text-gray-400 flex items-center gap-1"><Calendar className="w-4 h-4"/> Año</p>
                  <p className="font-semibold text-gray-900 dark:text-gray-100">{vehiculo.fichaTecnica?.anio || '-'}</p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400 flex items-center gap-1"><Hash className="w-4 h-4"/> VIN</p>
                  <p className="font-semibold text-gray-900 dark:text-gray-100 font-mono text-xs mt-1">{vehiculo.fichaTecnica?.vin || '-'}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-gray-500 dark:text-gray-400 flex items-center gap-1"><KeyRound className="w-4 h-4"/> N° Motor</p>
                  <p className="font-semibold text-gray-900 dark:text-gray-100 font-mono text-xs mt-1">
                    {vehiculo.fichaTecnica?.numeroMotor || <span className="text-yellow-600 dark:text-yellow-500">Pendiente</span>}
                  </p>
                </div>
              </div>
            </div>

            {vehiculo.comercial?.descripcion && (
              <div className="mt-8 space-y-4">
                <h3 className="font-semibold flex items-center gap-2 text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-700 pb-2">
                  <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400" /> Descripción
                </h3>
                <p className="text-gray-600 dark:text-gray-300 whitespace-pre-wrap leading-relaxed text-sm">
                  {vehiculo.comercial.descripcion}
                </p>
              </div>
            )}
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-colors">
            <h3 className="font-semibold flex items-center gap-2 text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-700 pb-2 mb-4">
              <Globe className="w-5 h-5 text-indigo-600 dark:text-indigo-400" /> Enlaces de Publicación
            </h3>
            <div className="space-y-3">
              {['webNativa', 'mercadoLibre', 'autosUsados', 'fbMarketplace'].map(plataforma => {
                const url = vehiculo.publicaciones?.[plataforma];
                const labels = {
                  webNativa: 'Web Dossil',
                  mercadoLibre: 'Mercado Libre',
                  autosUsados: 'AutosUsados.cl',
                  fbMarketplace: 'FB Marketplace'
                };
                
                return url ? (
                  <a key={plataforma} href={url} target="_blank" rel="noreferrer" className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 hover:bg-indigo-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 hover:text-indigo-700 dark:hover:text-white transition-colors group">
                    <span className="font-medium">{labels[plataforma]}</span>
                    <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400" />
                  </a>
                ) : (
                  <div key={plataforma} className="flex items-center justify-between p-3 rounded-lg border border-dashed border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/30 text-gray-400 dark:text-gray-500">
                    <span>{labels[plataforma]}</span>
                    <span className="text-xs font-medium px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded">No pub.</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
