import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useVehicleStore } from '../store/useVehicleStore';
import { ArrowLeft, Copy, CheckCircle2, Share2, Save, Globe, Facebook, Car, Store } from 'lucide-react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

export default function PublishVehicle() {
  const { id } = useParams();
  const { vehiculos, fetchVehiculos } = useVehicleStore();
  const vehiculo = vehiculos.find(v => v.id === id);
  const [copiedField, setCopiedField] = useState(null);
  
  // Links state
  const [links, setLinks] = useState({
    webNativa: '',
    mercadoLibre: '',
    autosUsados: '',
    fbMarketplace: ''
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (vehiculo?.publicaciones) {
      setLinks({
        webNativa: vehiculo.publicaciones.webNativa || '',
        mercadoLibre: vehiculo.publicaciones.mercadoLibre || '',
        autosUsados: vehiculo.publicaciones.autosUsados || '',
        fbMarketplace: vehiculo.publicaciones.fbMarketplace || ''
      });
    }
  }, [vehiculo]);

  const handleLinkChange = (e) => {
    setLinks(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const saveLinks = async () => {
    setSaving(true);
    try {
      await updateDoc(doc(db, 'vehiculos', id), {
        publicaciones: links
      });
      await fetchVehiculos(); // Refresh store
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error("Error saving links", error);
      alert("Error al guardar los links");
    } finally {
      setSaving(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(value);
  };

  const handleCopy = (text, fieldName) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedField(fieldName);
      setTimeout(() => setCopiedField(null), 2000);
    });
  };

  if (!vehiculo) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Vehículo no encontrado</h2>
        <Link to="/" className="text-indigo-600 hover:underline mt-4 inline-block">Volver al inicio</Link>
      </div>
    );
  }

  const titulo = vehiculo.comercial?.tituloPublicacion || `${vehiculo.fichaTecnica?.marca} ${vehiculo.fichaTecnica?.modelo}`;
  const marca = vehiculo.fichaTecnica?.marca || '';
  const modelo = vehiculo.fichaTecnica?.modelo || '';
  const version = vehiculo.fichaTecnica?.version || '';
  const anio = vehiculo.fichaTecnica?.anio || '';
  
  const precioBase = Number(vehiculo.comercial?.precio) || 0;
  let iva = 0;
  let total = precioBase;
  if (vehiculo.comercial?.masIva && precioBase > 0) {
    iva = precioBase * 0.19;
    total = precioBase + iva;
  }

  let textoDescripcion = "";
  if (vehiculo.comercial?.descripcion) {
    textoDescripcion += `📝 DETALLES:\n${vehiculo.comercial.descripcion}\n\n=============================\n`;
  }
  textoDescripcion += `SE RECIBEN VEHÍCULOS COMERCIALES EN PARTE DE PAGO.
CONSULTE POR SUS ALTERNATIVAS DE FINANCIAMIENTO DISPONIBLES!!!

CONTAMOS CON CRÉDITO DIRECTO Y CRÉDITO EXTERNO CON LAS MEJORES ENTIDADES FINANCIERAS TALES COMO AUTOFIN, UNIDAD, GLOBAL, TANNER ENTRE OTRAS Y LAS MEJORES CONDICIONES PARA LA COMPRA DE SU VEHÍCULO.

🏢 NUESTRA SUCURSAL SE ENCUENTRA UBICADA EN AMÉRICO VESPUCIO N° 2900, COMUNA DE MAIPÚ. 
AUTOMOTRIZ DOSSIL, LÍDER EN VEHÍCULOS DE TRABAJO!!

☎️ ➕️5️⃣6️⃣9️⃣6️⃣3️⃣6️⃣2️⃣2️⃣8️⃣1️⃣2️⃣`;

  const CopyField = ({ label, value, fieldId, isTextArea = false }) => (
    <div className="mb-4">
      <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">{label}</label>
      <div className="flex gap-2">
        {isTextArea ? (
          <textarea 
            readOnly 
            value={value} 
            className="flex-1 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 px-3 py-2 text-gray-900 dark:text-gray-100 min-h-[250px] resize-y"
          />
        ) : (
          <input 
            type="text" 
            readOnly 
            value={value} 
            className="flex-1 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 px-3 py-2 text-gray-900 dark:text-gray-100"
          />
        )}
        <button 
          onClick={() => handleCopy(value, fieldId)}
          className={`flex-shrink-0 px-4 rounded-lg font-medium transition-colors flex items-center gap-2 ${
            copiedField === fieldId 
              ? 'bg-green-500 text-white' 
              : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200 dark:bg-indigo-900/50 dark:text-indigo-300'
          }`}
        >
          {copiedField === fieldId ? <CheckCircle2 className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
          <span className="hidden sm:inline">{copiedField === fieldId ? 'Copiado' : 'Copiar'}</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 transition-colors">
      <div className="flex justify-between items-center mb-8">
        <Link to={`/vehiculo/${id}`} className="inline-flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" /> Volver a la Ficha
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* LADO IZQUIERDO: CAMPOS PARA COPIAR */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Share2 className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              Datos para Copiar
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Copia rápidamente cada dato para pegarlo en los formularios de los portales.
            </p>
          </div>
          
          <div className="p-6">
            <CopyField label="Título de Publicación" value={titulo} fieldId="titulo" />
            
            <div className="grid grid-cols-2 gap-4">
              <CopyField label="Marca" value={marca} fieldId="marca" />
              <CopyField label="Modelo" value={modelo} fieldId="modelo" />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <CopyField label="Versión" value={version} fieldId="version" />
              <CopyField label="Año" value={anio} fieldId="anio" />
            </div>

            {vehiculo.comercial?.masIva ? (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-xl mb-4 border border-yellow-200 dark:border-yellow-800/30">
                <p className="text-sm font-bold text-yellow-800 dark:text-yellow-400 mb-3">Vehículo con Factura (+ IVA)</p>
                <CopyField label="Valor Neto" value={formatCurrency(precioBase)} fieldId="neto" />
                <CopyField label="Monto IVA (19%)" value={formatCurrency(iva)} fieldId="iva" />
                <CopyField label="Valor Total (Neto + IVA)" value={formatCurrency(total)} fieldId="total" />
              </div>
            ) : (
              <CopyField label="Precio" value={formatCurrency(precioBase)} fieldId="precio" />
            )}

            <CopyField label="Descripción (Detalle + Texto Comercial)" value={textoDescripcion} fieldId="descripcion" isTextArea={true} />
          </div>
        </div>

        {/* LADO DERECHO: SINCRONIZACIÓN DE LINKS */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden h-fit sticky top-24">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Globe className="w-5 h-5 text-green-600 dark:text-green-400" />
              Links de Publicación
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
              Pega aquí los enlaces de tus publicaciones para llevar el control. Esto se sincronizará automáticamente.
            </p>
          </div>
          
          <div className="p-6 space-y-4">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                <Globe className="w-4 h-4 text-blue-500" /> Web Nativa
              </label>
              <input type="url" name="webNativa" value={links.webNativa} onChange={handleLinkChange} className="w-full rounded-lg bg-transparent border-gray-300 dark:border-gray-600 px-4 py-2 focus:ring-2 focus:ring-indigo-600 dark:text-white outline-none" placeholder="https://dossil.cl/..." />
            </div>
            
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                <Store className="w-4 h-4 text-yellow-500" /> Mercado Libre / Chileautos
              </label>
              <input type="url" name="mercadoLibre" value={links.mercadoLibre} onChange={handleLinkChange} className="w-full rounded-lg bg-transparent border-gray-300 dark:border-gray-600 px-4 py-2 focus:ring-2 focus:ring-indigo-600 dark:text-white outline-none" placeholder="https://auto.mercadolibre.cl/..." />
            </div>
            
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                <Car className="w-4 h-4 text-red-500" /> Autos Usados
              </label>
              <input type="url" name="autosUsados" value={links.autosUsados} onChange={handleLinkChange} className="w-full rounded-lg bg-transparent border-gray-300 dark:border-gray-600 px-4 py-2 focus:ring-2 focus:ring-indigo-600 dark:text-white outline-none" placeholder="https://autosusados.cl/..." />
            </div>
            
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                <Facebook className="w-4 h-4 text-blue-600" /> FB Marketplace
              </label>
              <input type="url" name="fbMarketplace" value={links.fbMarketplace} onChange={handleLinkChange} className="w-full rounded-lg bg-transparent border-gray-300 dark:border-gray-600 px-4 py-2 focus:ring-2 focus:ring-indigo-600 dark:text-white outline-none" placeholder="https://facebook.com/marketplace/..." />
            </div>

            <button 
              onClick={saveLinks}
              disabled={saving}
              className={`w-full mt-6 py-3 px-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                saved ? 'bg-green-500 text-white' : 'bg-indigo-600 hover:bg-indigo-700 text-white'
              } disabled:opacity-70`}
            >
              {saving ? (
                <span>Guardando...</span>
              ) : saved ? (
                <><CheckCircle2 className="w-5 h-5" /> Links Guardados</>
              ) : (
                <><Save className="w-5 h-5" /> Guardar Links</>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
