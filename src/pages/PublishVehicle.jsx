import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useVehicleStore } from '../store/useVehicleStore';
import { ArrowLeft, Copy, CheckCircle2, Share2, Save, Globe, Store, XCircle, Camera, Image as ImageIcon } from 'lucide-react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import * as htmlToImage from 'html-to-image';
import Swal from 'sweetalert2';

export default function PublishVehicle() {
  const { id } = useParams();
  const { vehiculos, fetchVehiculos } = useVehicleStore();
  const vehiculo = vehiculos.find(v => v.id === id);
  const [copiedField, setCopiedField] = useState(null);

  const cardRef = useRef(null);
  const [copyingImage, setCopyingImage] = useState(false);

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

      const Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        didOpen: (toast) => {
          toast.onmouseenter = Swal.stopTimer;
          toast.onmouseleave = Swal.resumeTimer;
        }
      });
      Toast.fire({
        icon: 'success',
        title: 'Links guardados correctamente'
      });
    } catch (error) {
      console.error("Error saving links", error);
      Swal.fire('Error', 'Error al guardar los links', 'error');
    } finally {
      setSaving(false);
    }
  };

  const copyImageToClipboard = async () => {
    if (!cardRef.current) return;
    setCopyingImage(true);
    try {
      const element = cardRef.current;
      const blob = await htmlToImage.toBlob(element, {
        pixelRatio: 2, // Mejor calidad
        backgroundColor: 'transparent',
        style: {
          transform: 'scale(1)',
          transformOrigin: 'top left',
          margin: '0',
        }
      });
      if (blob) {
        await navigator.clipboard.write([
          new window.ClipboardItem({
            'image/png': blob
          })
        ]);
        const Toast = Swal.mixin({
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 4000,
          timerProgressBar: true
        });
        Toast.fire({
          icon: 'success',
          title: '¡Imagen copiada!',
          text: 'Puedes pegarla en cualquier chat.'
        });
      }
    } catch (err) {
      console.error('Error al copiar la imagen', err);
      Swal.fire({
        title: 'Error al copiar',
        text: 'No se pudo copiar la imagen automáticamente, por favor toma una captura de pantalla normal.',
        icon: 'error',
        confirmButtonColor: '#4f46e5'
      });
    } finally {
      setCopyingImage(false);
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

  const titulo = vehiculo.comercial?.tituloPublicacion || `${vehiculo.fichaTecnica?.marca || ''} ${vehiculo.fichaTecnica?.modelo || ''}`.trim();
  const marca = vehiculo.fichaTecnica?.marca || '';
  const modelo = vehiculo.fichaTecnica?.modelo || '';
  const version = vehiculo.fichaTecnica?.version || '';
  const anio = vehiculo.fichaTecnica?.anio || '';
  const kilometraje = vehiculo.fichaTecnica?.kilometraje || '';
  const patente = vehiculo.patente || '';
  const vin = vehiculo.fichaTecnica?.vin || '';
  const numeroMotor = vehiculo.fichaTecnica?.numeroMotor || '';

  const precioBase = Number(vehiculo.comercial?.precio) || 0;
  let iva = 0;
  let total = precioBase;
  if (vehiculo.comercial?.masIva && precioBase > 0) {
    iva = precioBase * 0.19;
    total = precioBase + iva;
  }

  const cleanEmojis = (str) => {
    if (!str) return '';
    return str
      .replace(/[\p{Extended_Pictographic}\uFE0F\u20E3]/gu, '')
      .replace(/[ \t]{2,}/g, ' ')
      .trim();
  };

  let textoDescripcion = "";
  if (vehiculo.comercial?.descripcion) {
    const descSinEmojis = cleanEmojis(vehiculo.comercial.descripcion);
    if (descSinEmojis) {
      textoDescripcion += `DETALLES:\n${descSinEmojis}\n\n=============================\n`;
    }
  }
  textoDescripcion += `SE RECIBEN VEHÍCULOS COMERCIALES EN PARTE DE PAGO.
CONSULTE POR SUS ALTERNATIVAS DE FINANCIAMIENTO DISPONIBLES!!!

CONTAMOS CON CRÉDITO DIRECTO Y CRÉDITO EXTERNO CON LAS MEJORES ENTIDADES FINANCIERAS TALES COMO AUTOFIN, UNIDAD, GLOBAL, TANNER ENTRE OTRAS Y LAS MEJORES CONDICIONES PARA LA COMPRA DE SU VEHÍCULO.

NUESTRA SUCURSAL SE ENCUENTRA UBICADA EN AMÉRICO VESPUCIO N° 2900, COMUNA DE MAIPÚ. 
AUTOMOTRIZ DOSSIL, LÍDER EN VEHÍCULOS DE TRABAJO!!

  +56 9 6362 2812`;

  const StatusRow = ({ icon, name, hasLink }) => (
    <div className={`flex items - center justify - between p - 4 sm: p - 5 rounded - [16px] border ${ hasLink ? 'bg-[#101f19] border-[#18392a]' : 'bg-[#181c25] border-[#252b36]' } `}>
      <div className="flex items-center gap-4 sm:gap-5">
        <div className="flex justify-center items-center h-10 w-10">
          {icon}
        </div>
        <span className={`font - bold text - base sm: text - lg ${ hasLink ? 'text-white' : 'text-gray-400' } `}>
          {name}
        </span>
      </div>
      <div>
        {hasLink ? (
          <div className="flex items-center gap-2 text-[#00d26a] font-bold bg-[#0b291d] border border-[#0d3b28] px-4 py-1.5 rounded-xl text-sm sm:text-base">
            <CheckCircle2 className="w-5 h-5" />
            <span>Lista</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-gray-500 font-bold bg-[#11141a] border border-[#1f242e] px-4 py-1.5 rounded-xl text-sm sm:text-base">
            <XCircle className="w-5 h-5" />
            <span>Pendiente</span>
          </div>
        )}
      </div>
    </div>
  );

  const CopyField = ({ label, value, fieldId, isTextArea = false, isSmallArea = false }) => (
    <div className="mb-4">
      <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">{label}</label>
      <div className={`flex gap - 2 ${ isTextArea ? 'flex-col sm:flex-row' : 'items-center' } `}>
        {isTextArea ? (
          <textarea 
            readOnly 
            value={value} 
            className={`flex - 1 min - w - 0 w - full rounded - lg bg - gray - 50 dark: bg - gray - 900 border border - gray - 300 dark: border - gray - 600 px - 3 py - 2 text - gray - 900 dark: text - gray - 100 resize - y font - mono text - sm outline - none focus: ring - 2 focus: ring - indigo - 600 ${ isSmallArea ? 'h-28' : 'min-h-[250px]' } `}
          />
        ) : (
          <input 
            type="text" 
            readOnly 
            value={value} 
            className="flex-1 min-w-0 w-full rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 px-3 py-2 text-gray-900 dark:text-gray-100 outline-none focus:ring-2 focus:ring-indigo-600"
          />
        )}
        <button 
          onClick={() => handleCopy(value, fieldId)}
          className={`flex - shrink - 0 px - 4 py - 2.5 rounded - lg font - medium transition - colors flex items - center justify - center gap - 2 cursor - pointer shadow - sm ${
    isTextArea ? 'sm:self-start' : ''
  } ${
    copiedField === fieldId
      ? 'bg-green-500 text-white'
      : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200 dark:bg-indigo-900/50 dark:text-indigo-300 dark:hover:bg-indigo-900/80'
  } `}
        >
          {copiedField === fieldId ? <CheckCircle2 className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
          <span className="inline">{copiedField === fieldId ? 'Copiado' : 'Copiar'}</span>
        </button>
      </div>
    </div>
  );

  const ReportCardContent = () => (
    <>
      <div className="relative z-10 text-center mb-8">
        <h3 className="text-3xl sm:text-4xl text-[#ffffff] font-black tracking-tight">
          Estado de Publicación
        </h3>
        <p className="text-lg sm:text-[22px] text-[#e0e5eb] mt-3 font-bold">
          {titulo}
        </p>
      </div>

      <div className="relative z-10 space-y-4 px-2 sm:px-4">
        <StatusRow 
          icon={<img src="/LOGO.gif" alt="Portal Dossil" className="max-h-12 w-auto object-contain" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }} />} 
          name="Portal Dossil" 
          hasLink={!!links.webNativa} 
        />
        <StatusRow 
          icon={<img src="/Cliente-Logo-Mercado-Libre.png" alt="Mercado Libre" className="max-h-8 w-auto object-contain" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }} />} 
          name="Mercado Libre" 
          hasLink={!!links.mercadoLibre} 
        />
        <StatusRow 
          icon={<img src="/autosusados-logo.png" alt="autosusados.cl" className="max-h-8 w-auto object-contain" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }} />} 
          name="autosusados.cl" 
          hasLink={!!links.autosUsados} 
        />
        <StatusRow 
          icon={<img src="/marketplace-logo.png" alt="Facebook Marketplace" className="max-h-8 w-auto object-contain" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }} />} 
          name="Facebook Marketplace" 
          hasLink={!!links.fbMarketplace} 
        />
      </div>

      <div className="mt-8 text-center relative z-10 px-2 sm:px-4">
        <div className="w-full h-px bg-[#262c38] mb-6"></div>
        <p className="font-bold uppercase tracking-widest flex items-center justify-center gap-3 text-[#7a8494] text-sm sm:text-base">
          <Store className="w-5 h-5" /> Automotriz Dossil
        </p>
      </div>
    </>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 transition-colors">
      <div className="flex justify-between items-center mb-8">
        <Link to={`/ vehiculo / ${ id } `} className="inline-flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
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
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <CopyField label="Marca" value={marca} fieldId="marca" />
              <CopyField label="Modelo" value={modelo} fieldId="modelo" />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <CopyField label="Versión" value={version} fieldId="version" />
              <CopyField label="Año" value={anio} fieldId="anio" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <CopyField label="Kilometraje" value={kilometraje} fieldId="kilometraje" />
              <CopyField label="Patente" value={patente} fieldId="patente" />
            </div>

            <div className="mb-4">
              <CopyField label="VIN" value={vin} fieldId="vin" />
            </div>

            <div className="mb-4">
              <CopyField label="Número de Motor" value={numeroMotor} fieldId="numeroMotor" />
            </div>

            {vehiculo.comercial?.masIva ? (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-xl mb-4 border border-yellow-200 dark:border-yellow-800/30">
                <CopyField 
                  label="Vehículo con Factura (+ IVA)" 
                  value={`VALOR NETO:     ${ formatCurrency(precioBase) } \nIVA:            ${ formatCurrency(iva) } \nVALOR + IVA:    ${ formatCurrency(total) } `} 
                  fieldId="precio_iva" 
                  isTextArea={true} 
                  isSmallArea={true}
                />
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
                <img src="/LOGO.gif" alt="Portal Dossil" className="h-5 w-auto object-contain" /> Portal Dossil
              </label>
              <input type="url" name="webNativa" value={links.webNativa} onChange={handleLinkChange} className="w-full rounded-lg bg-transparent border border-gray-300 dark:border-gray-600 px-4 py-2 focus:ring-2 focus:ring-indigo-600 dark:text-white outline-none" placeholder="https://dossil.cl/..." />
            </div>
            
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                <img src="/Cliente-Logo-Mercado-Libre.png" alt="Mercado Libre" className="h-5 w-auto object-contain" /> Mercado Libre
              </label>
              <input type="url" name="mercadoLibre" value={links.mercadoLibre} onChange={handleLinkChange} className="w-full rounded-lg bg-transparent border border-gray-300 dark:border-gray-600 px-4 py-2 focus:ring-2 focus:ring-indigo-600 dark:text-white outline-none" placeholder="https://auto.mercadolibre.cl/..." />
            </div>
            
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                <img src="/autosusados-logo.png" alt="autosusados.cl" className="h-5 w-auto object-contain" /> autosusados.cl
              </label>
              <input type="url" name="autosUsados" value={links.autosUsados} onChange={handleLinkChange} className="w-full rounded-lg bg-transparent border border-gray-300 dark:border-gray-600 px-4 py-2 focus:ring-2 focus:ring-indigo-600 dark:text-white outline-none" placeholder="https://autosusados.cl/..." />
            </div>
            
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                <img src="/marketplace-logo.png" alt="Facebook Marketplace" className="h-5 w-auto object-contain" /> Facebook Marketplace
              </label>
              <input type="url" name="fbMarketplace" value={links.fbMarketplace} onChange={handleLinkChange} className="w-full rounded-lg bg-transparent border border-gray-300 dark:border-gray-600 px-4 py-2 focus:ring-2 focus:ring-indigo-600 dark:text-white outline-none" placeholder="https://facebook.com/marketplace/..." />
            </div>

            <button 
              onClick={saveLinks}
              disabled={saving}
              className={`w - full mt - 6 py - 3 px - 4 rounded - xl font - bold flex items - center justify - center gap - 2 transition - all cursor - pointer ${
    saved ? 'bg-green-500 text-white' : 'bg-indigo-600 hover:bg-indigo-700 text-white'
  } disabled: opacity - 70`}
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

      {/* SECCION: REPORTE DE PUBLICACIONES */}
      <div className="mt-12 mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg text-indigo-600 dark:text-indigo-400">
              <ImageIcon className="w-6 h-6" />
            </div>
            Reporte de Publicaciones
          </h2>
          <button 
            onClick={copyImageToClipboard}
            disabled={copyingImage}
            className="mt-4 sm:mt-0 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 rounded-xl font-bold transition-all disabled:opacity-70 shadow-sm hover:shadow-md active:scale-95 cursor-pointer"
          >
            <Camera className="w-5 h-5" />
            {copyingImage ? 'Generando Imagen...' : 'Copiar Reporte como Imagen'}
          </button>
        </div>
        
        <div className="pb-4">
          <div className="bg-[#111621] rounded-[24px] shadow-2xl border border-[#252b36] p-6 sm:p-8 w-full max-w-2xl mx-auto relative overflow-hidden">
            <ReportCardContent />
          </div>
        </div>
      </div>

      {/* OFF-SCREEN CARD PARA EXPORTACION (Asegura dimensiones y fondo exactos) */}
      <div className="fixed top-[-9999px] left-[-9999px] opacity-0 pointer-events-none">
        <div ref={cardRef} className="w-[700px] h-[700px] bg-[#111621] rounded-[24px] p-10 flex flex-col justify-center">
          <ReportCardContent />
        </div>
      </div>
    </div>
  );
}
