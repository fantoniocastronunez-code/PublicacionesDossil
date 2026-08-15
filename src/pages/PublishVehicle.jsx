import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useVehicleStore } from '../store/useVehicleStore';
import { ArrowLeft, Copy, CheckCircle2, Share2 } from 'lucide-react';

export default function PublishVehicle() {
  const { id } = useParams();
  const { vehiculos } = useVehicleStore();
  const vehiculo = vehiculos.find(v => v.id === id);
  const [copied, setCopied] = useState(false);
  const [textoGenerado, setTextoGenerado] = useState('');

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(value);
  };

  useEffect(() => {
    if (!vehiculo) return;

    const titulo = vehiculo.comercial?.tituloPublicacion || `${vehiculo.fichaTecnica?.marca} ${vehiculo.fichaTecnica?.modelo}`;
    const marca = vehiculo.fichaTecnica?.marca;
    const modelo = vehiculo.fichaTecnica?.modelo;
    const version = vehiculo.fichaTecnica?.version ? ` - ${vehiculo.fichaTecnica.version}` : '';
    const anio = vehiculo.fichaTecnica?.anio ? `Año ${vehiculo.fichaTecnica.anio}` : '';
    
    let precioBloque = '';
    const precioBase = Number(vehiculo.comercial?.precio) || 0;

    if (precioBase > 0) {
      if (vehiculo.comercial?.masIva) {
        const iva = precioBase * 0.19;
        const total = precioBase + iva;
        precioBloque = `💰 VALOR NETO:     ${formatCurrency(precioBase)}
💰 IVA (19%):      ${formatCurrency(iva)}
💰 VALOR + IVA:    ${formatCurrency(total)}`;
      } else {
        precioBloque = `💰 PRECIO: ${formatCurrency(precioBase)}`;
      }
    }

    const descripcionBloque = vehiculo.comercial?.descripcion ? `\n📝 DETALLES:\n${vehiculo.comercial.descripcion}\n` : '';

    const textoFinal = `🚗 ${titulo}
${marca} ${modelo}${version} | ${anio}

${precioBloque}
${descripcionBloque}
=============================
SE RECIBEN VEHÍCULOS COMERCIALES EN PARTE DE PAGO.
CONSULTE POR SUS ALTERNATIVAS DE FINANCIAMIENTO DISPONIBLES!!!

CONTAMOS CON CRÉDITO DIRECTO Y CRÉDITO EXTERNO CON LAS MEJORES ENTIDADES FINANCIERAS TALES COMO AUTOFIN, UNIDAD, GLOBAL, TANNER ENTRE OTRAS Y LAS MEJORES CONDICIONES PARA LA COMPRA DE SU VEHÍCULO.

🏢 NUESTRA SUCURSAL SE ENCUENTRA UBICADA EN AMÉRICO VESPUCIO N° 2900, COMUNA DE MAIPÚ. 
AUTOMOTRIZ DOSSIL, LÍDER EN VEHÍCULOS DE TRABAJO!!

☎️ ➕️5️⃣6️⃣9️⃣6️⃣3️⃣6️⃣2️⃣2️⃣8️⃣1️⃣2️⃣`;

    setTextoGenerado(textoFinal);
  }, [vehiculo]);

  const handleCopy = () => {
    navigator.clipboard.writeText(textoGenerado).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
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

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 transition-colors">
      <div className="flex justify-between items-center mb-8">
        <Link to={`/vehiculo/${id}`} className="inline-flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" /> Volver a la Ficha
        </Link>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden transition-colors">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Share2 className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              Preparar Publicación
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Texto listo para copiar y pegar en Marketplace, Yapo o Chileautos.
            </p>
          </div>
          <button
            onClick={handleCopy}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all shadow-sm w-full sm:w-auto justify-center ${
              copied 
                ? 'bg-green-500 text-white hover:bg-green-600' 
                : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow'
            }`}
          >
            {copied ? (
              <>
                <CheckCircle2 className="w-5 h-5" /> Copiado al portapapeles
              </>
            ) : (
              <>
                <Copy className="w-5 h-5" /> Copiar Texto Completo
              </>
            )}
          </button>
        </div>

        <div className="p-6">
          <textarea
            value={textoGenerado}
            readOnly
            className="w-full h-[500px] p-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-800 dark:text-gray-200 font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors leading-relaxed"
          />
        </div>
      </div>
    </div>
  );
}
