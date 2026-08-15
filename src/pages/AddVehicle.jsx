import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useVehicleStore } from '../store/useVehicleStore';
import { CheckCircle2, ChevronRight, UploadCloud, Loader2, ArrowLeft, ArrowRight, Trash2, Star } from 'lucide-react';

export default function AddVehicle() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { addVehiculo, updateVehiculo, vehiculos, loading } = useVehicleStore();
  const [step, setStep] = useState(1);
  
  const [formData, setFormData] = useState({
    patente: '',
    fichaTecnica: { marca: '', modelo: '', version: '', anio: '', vin: '', numeroMotor: '' },
    publicaciones: { webNativa: '', mercadoLibre: '', autosUsados: '', fbMarketplace: '' }
  });

  const [imagenes, setImagenes] = useState([]); // { id, url, file }

  useEffect(() => {
    if (id) {
      const vehiculoExistente = vehiculos.find(v => v.id === id);
      if (vehiculoExistente) {
        setFormData({
          patente: vehiculoExistente.patente || '',
          fichaTecnica: {
            marca: vehiculoExistente.fichaTecnica?.marca || '',
            modelo: vehiculoExistente.fichaTecnica?.modelo || '',
            version: vehiculoExistente.fichaTecnica?.version || '',
            anio: vehiculoExistente.fichaTecnica?.anio || '',
            vin: vehiculoExistente.fichaTecnica?.vin || '',
            numeroMotor: vehiculoExistente.fichaTecnica?.numeroMotor || ''
          },
          publicaciones: {
            webNativa: vehiculoExistente.publicaciones?.webNativa || '',
            mercadoLibre: vehiculoExistente.publicaciones?.mercadoLibre || '',
            autosUsados: vehiculoExistente.publicaciones?.autosUsados || '',
            fbMarketplace: vehiculoExistente.publicaciones?.fbMarketplace || ''
          }
        });

        if (vehiculoExistente.fotos) {
          setImagenes(vehiculoExistente.fotos.map((url, i) => ({
            id: `old_${i}_${Math.random()}`,
            url,
            file: null
          })));
        }
      }
    }
  }, [id, vehiculos]);

  const handleFichaChange = (e) => {
    const { name, value } = e.target;
    if (name === 'patente') {
      setFormData(prev => ({ ...prev, patente: value.toUpperCase() }));
    } else {
      setFormData(prev => ({
        ...prev,
        fichaTecnica: { ...prev.fichaTecnica, [name]: value }
      }));
    }
  };

  const handleLinksChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      publicaciones: { ...prev.publicaciones, [name]: value }
    }));
  };

  const handleFotoUpload = (e) => {
    const files = Array.from(e.target.files);
    const nuevasImagenes = files.map(file => ({
      id: `new_${Date.now()}_${Math.random()}`,
      url: URL.createObjectURL(file),
      file
    }));
    setImagenes(prev => [...prev, ...nuevasImagenes]);
  };

  const moverIzquierda = (index) => {
    if (index === 0) return;
    setImagenes(prev => {
      const nuevas = [...prev];
      [nuevas[index - 1], nuevas[index]] = [nuevas[index], nuevas[index - 1]];
      return nuevas;
    });
  };

  const moverDerecha = (index) => {
    setImagenes(prev => {
      if (index === prev.length - 1) return prev;
      const nuevas = [...prev];
      [nuevas[index], nuevas[index + 1]] = [nuevas[index + 1], nuevas[index]];
      return nuevas;
    });
  };

  const eliminarFoto = (index) => {
    setImagenes(prev => prev.filter((_, i) => i !== index));
  };

  const guardarVehiculo = async (e) => {
    e.preventDefault();
    try {
      if (id) {
        await updateVehiculo(id, formData, imagenes);
      } else {
        await addVehiculo(formData, imagenes);
      }
      
      const { error } = useVehicleStore.getState();
      if (error) {
        alert("Atención: " + error);
      } else {
        navigate('/');
      }
    } catch (err) {
      alert("Error inesperado: " + err.message);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 transition-colors">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">
          {id ? 'Editar Vehículo' : 'Agregar Vehículo Nuevo'}
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          {id ? 'Modifica los datos del vehículo existente.' : 'Completa la información para ingresar un nuevo vehículo al inventario.'}
        </p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-between mb-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full font-bold transition-colors ${step >= i ? 'bg-indigo-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'}`}>
              {step > i ? <CheckCircle2 className="w-6 h-6" /> : i}
            </div>
            {i < 3 && <div className={`w-16 sm:w-32 h-1 mx-2 transition-colors ${step > i ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-700'}`} />}
          </div>
        ))}
      </div>

      <form onSubmit={step === 3 ? guardarVehiculo : (e) => { e.preventDefault(); setStep(step + 1); }} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden transition-colors">
        
        {step === 1 && (
          <div className="p-8">
            <h2 className="text-xl font-bold mb-6 text-gray-800 dark:text-gray-100">1. Ficha Técnica</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="col-span-1 sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Patente <span className="text-red-500">*</span></label>
                <input type="text" name="patente" value={formData.patente} onChange={handleFichaChange} required className="w-full rounded-lg bg-transparent border-gray-300 dark:border-gray-600 ring-1 ring-gray-300 dark:ring-gray-600 px-4 py-2 focus:ring-2 focus:ring-indigo-600 dark:text-white outline-none transition-colors" placeholder="EJ: AB123CD" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Marca <span className="text-red-500">*</span></label>
                <input type="text" name="marca" value={formData.fichaTecnica.marca} onChange={handleFichaChange} required className="w-full rounded-lg bg-transparent border-gray-300 dark:border-gray-600 ring-1 ring-gray-300 dark:ring-gray-600 px-4 py-2 focus:ring-2 focus:ring-indigo-600 dark:text-white outline-none transition-colors" placeholder="Toyota" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Modelo <span className="text-red-500">*</span></label>
                <input type="text" name="modelo" value={formData.fichaTecnica.modelo} onChange={handleFichaChange} required className="w-full rounded-lg bg-transparent border-gray-300 dark:border-gray-600 ring-1 ring-gray-300 dark:ring-gray-600 px-4 py-2 focus:ring-2 focus:ring-indigo-600 dark:text-white outline-none transition-colors" placeholder="Yaris" />
              </div>
              <div className="col-span-1 sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Versión (Opcional)</label>
                <input type="text" name="version" value={formData.fichaTecnica.version} onChange={handleFichaChange} className="w-full rounded-lg bg-transparent border-gray-300 dark:border-gray-600 ring-1 ring-gray-300 dark:ring-gray-600 px-4 py-2 focus:ring-2 focus:ring-indigo-600 dark:text-white outline-none transition-colors" placeholder="GLI 1.5 AT" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Año (Opcional)</label>
                <input type="number" name="anio" value={formData.fichaTecnica.anio} onChange={handleFichaChange} className="w-full rounded-lg bg-transparent border-gray-300 dark:border-gray-600 ring-1 ring-gray-300 dark:ring-gray-600 px-4 py-2 focus:ring-2 focus:ring-indigo-600 dark:text-white outline-none transition-colors" placeholder="2024" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">VIN (Opcional)</label>
                <input type="text" name="vin" value={formData.fichaTecnica.vin} onChange={handleFichaChange} className="w-full rounded-lg bg-transparent border-gray-300 dark:border-gray-600 ring-1 ring-gray-300 dark:ring-gray-600 px-4 py-2 focus:ring-2 focus:ring-indigo-600 dark:text-white outline-none transition-colors" placeholder="Número de chasis" />
              </div>
              <div className="col-span-1 sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Número de Motor (Opcional)</label>
                <input type="text" name="numeroMotor" value={formData.fichaTecnica.numeroMotor} onChange={handleFichaChange} className="w-full rounded-lg bg-transparent border-gray-300 dark:border-gray-600 ring-1 ring-gray-300 dark:ring-gray-600 px-4 py-2 focus:ring-2 focus:ring-indigo-600 dark:text-white outline-none transition-colors" placeholder="Número de motor" />
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="p-8">
            <h2 className="text-xl font-bold mb-6 text-gray-800 dark:text-gray-100">2. Fotografías</h2>
            
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-10 text-center hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer relative">
              <UploadCloud className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-300 font-medium">Haz clic o arrastra fotos aquí</p>
              <p className="text-sm text-gray-400 mt-1">PNG, JPG hasta 5MB</p>
              <input type="file" multiple accept="image/*" onChange={handleFotoUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" title="" />
            </div>

            {imagenes.length > 0 && (
              <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-4">
                {imagenes.map((img, idx) => (
                  <div key={img.id} className={`relative aspect-[4/3] rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-900 border-2 transition-all group ${idx === 0 ? 'border-indigo-500 shadow-md ring-2 ring-indigo-500/20' : 'border-gray-200 dark:border-gray-700'}`}>
                    <img src={img.url} alt={`Preview ${idx}`} className="w-full h-full object-cover" />
                    
                    {idx === 0 && (
                      <div className="absolute top-2 left-2 bg-indigo-600 text-white text-xs font-bold px-2 py-1 rounded shadow flex items-center gap-1 z-10">
                        <Star className="w-3 h-3 fill-white" /> Portada
                      </div>
                    )}

                    <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent p-2 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="flex gap-1">
                        <button type="button" onClick={() => moverIzquierda(idx)} disabled={idx === 0} className="p-1.5 bg-white/20 hover:bg-white/40 disabled:opacity-30 rounded backdrop-blur-sm text-white transition-colors" title="Mover a la izquierda">
                          <ArrowLeft className="w-4 h-4" />
                        </button>
                        <button type="button" onClick={() => moverDerecha(idx)} disabled={idx === imagenes.length - 1} className="p-1.5 bg-white/20 hover:bg-white/40 disabled:opacity-30 rounded backdrop-blur-sm text-white transition-colors" title="Mover a la derecha">
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                      <button type="button" onClick={() => eliminarFoto(idx)} className="p-1.5 bg-red-500/80 hover:bg-red-500 text-white rounded backdrop-blur-sm transition-colors" title="Eliminar foto">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {step === 3 && (
          <div className="p-8">
            <h2 className="text-xl font-bold mb-6 text-gray-800 dark:text-gray-100">3. Enlaces de Publicación</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Web Empresa</label>
                <input type="url" name="webNativa" value={formData.publicaciones.webNativa} onChange={handleLinksChange} className="w-full rounded-lg bg-transparent border-gray-300 dark:border-gray-600 ring-1 ring-gray-300 dark:ring-gray-600 px-4 py-2 focus:ring-2 focus:ring-indigo-600 dark:text-white outline-none transition-colors" placeholder="https://" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">MercadoLibre</label>
                <input type="url" name="mercadoLibre" value={formData.publicaciones.mercadoLibre} onChange={handleLinksChange} className="w-full rounded-lg bg-transparent border-gray-300 dark:border-gray-600 ring-1 ring-gray-300 dark:ring-gray-600 px-4 py-2 focus:ring-2 focus:ring-indigo-600 dark:text-white outline-none transition-colors" placeholder="https://" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Autosusados.cl</label>
                <input type="url" name="autosUsados" value={formData.publicaciones.autosUsados} onChange={handleLinksChange} className="w-full rounded-lg bg-transparent border-gray-300 dark:border-gray-600 ring-1 ring-gray-300 dark:ring-gray-600 px-4 py-2 focus:ring-2 focus:ring-indigo-600 dark:text-white outline-none transition-colors" placeholder="https://" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Facebook Marketplace</label>
                <input type="url" name="fbMarketplace" value={formData.publicaciones.fbMarketplace} onChange={handleLinksChange} className="w-full rounded-lg bg-transparent border-gray-300 dark:border-gray-600 ring-1 ring-gray-300 dark:ring-gray-600 px-4 py-2 focus:ring-2 focus:ring-indigo-600 dark:text-white outline-none transition-colors" placeholder="https://" />
              </div>
            </div>
          </div>
        )}

        <div className="bg-gray-50 dark:bg-gray-900/50 p-6 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center transition-colors">
          {step > 1 ? (
            <button type="button" onClick={() => setStep(step - 1)} disabled={loading} className="px-6 py-2.5 text-gray-600 dark:text-gray-400 font-medium hover:text-gray-900 dark:hover:text-white transition-colors disabled:opacity-50">
              Volver
            </button>
          ) : <div></div>}
          
          <button type="submit" disabled={loading} className="bg-indigo-600 text-white px-8 py-2.5 rounded-xl font-bold hover:bg-indigo-700 transition-colors flex items-center gap-2 disabled:opacity-70">
            {loading ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> Guardando...</>
            ) : (
              <>{step === 3 ? (id ? 'Actualizar Vehículo' : 'Guardar Vehículo') : 'Continuar'} <ChevronRight className="w-5 h-5" /></>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
