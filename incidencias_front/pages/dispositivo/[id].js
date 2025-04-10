import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

export default function DetalleDispositivo() {
  const router = useRouter();
  const { id } = router.query;
  const [dispositivo, setDispositivo] = useState(null);

  useEffect(() => {
    if (!id) return;

    const token = localStorage.getItem('token');

    const fetchDispositivo = async () => {
      try {
        const res = await fetch(`http://localhost:1339/api/dispositivos/${id}`, {
          headers: {
            Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setDispositivo(data.data?.attributes || null);
      } catch (err) {
        console.error('Error al cargar el dispositivo', err);
      }
    };

    fetchDispositivo();
  }, [id]);

  if (!dispositivo) {
    return <p className="p-6 text-gray-600">Cargando dispositivo...</p>;
  }

  return (
    <div className="p-6 bg-white min-h-screen text-gray-800 flex justify-center">
      <div className="bg-gray-50 p-6 rounded shadow max-w-xl w-full border border-gray-200">
        <h2 className="text-2xl font-semibold mb-6 border-b pb-2">🖥️ Detalles del Dispositivo</h2>

        <div className="space-y-3 text-sm md:text-base">
          <p><strong>🔧 Tipo:</strong> {dispositivo.tipo_dispositivo}</p>
          <p><strong>🏷️ Marca:</strong> {dispositivo.marca}</p>
          <p><strong>📦 Modelo:</strong> {dispositivo.modelo}</p>
          <p><strong>🔢 Nº Serie:</strong> {dispositivo.numero_serie}</p>
          <p><strong>🗓️ Fecha de compra:</strong> {dispositivo.fecha_compra}</p>
          <p><strong>📅 Garantía hasta:</strong> {dispositivo.fecha_garantia_fin || 'No especificada'}</p>
          <p className="flex items-center gap-2">
            <strong>⚠️ Estado:</strong>
            <span className={`text-xs px-2 py-1 rounded font-medium text-white ${getEstadoColor(dispositivo.estado)}`}>
              {dispositivo.estado.replace('_', ' ')}
            </span>
          </p>
        </div>

        <div className="mt-6">
          <button
            onClick={() => router.push(`/incidencia/nueva?dispositivoId=${id}`)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-semibold"
          >
            Crear Incidencia
          </button>
        </div>
      </div>
    </div>
  );
}

// 🎨 Colores por estado
function getEstadoColor(estado) {
  switch (estado) {
    case 'operativo':
      return 'bg-green-600';
    case 'mantenimiento':
      return 'bg-yellow-500';
    case 'averiado':
    case 'fuera_servicio':
      return 'bg-red-600';
    default:
      return 'bg-gray-500';
  }
}
