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
            Authorization: `Bearer ${token}`,
          },
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
    return <p style={{ color: 'white', padding: '2rem' }}>Cargando dispositivo...</p>;
  }

  return (
    <div style={{ padding: '2rem', display: 'flex', justifyContent: 'center' }}>
      <div
        style={{
          background: '#1f2937',
          color: '#fff',
          padding: '2rem',
          borderRadius: '16px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
          maxWidth: '600px',
          width: '100%',
        }}
      >
        <h2 style={{ marginBottom: '1.5rem', borderBottom: '1px solid #374151', paddingBottom: '0.5rem' }}>
          🖥️ Detalles del Dispositivo
        </h2>
        <p><strong>🔧 Tipo:</strong> {dispositivo.tipo_dispositivo}</p>
        <p><strong>🏷️ Marca:</strong> {dispositivo.marca}</p>
        <p><strong>📦 Modelo:</strong> {dispositivo.modelo}</p>
        <p><strong>🔢 Nº Serie:</strong> {dispositivo.numero_serie}</p>
        <p><strong>🗓️ Fecha de compra:</strong> {dispositivo.fecha_compra}</p>
        <p><strong>📅 Garantía hasta:</strong> {dispositivo.fecha_garantia_fin}</p>
        <p>
          <strong>⚠️ Estado:</strong>{' '}
          <span
            style={{
              backgroundColor: getEstadoColor(dispositivo.estado),
              padding: '4px 8px',
              borderRadius: '8px',
              color: '#fff',
              fontWeight: 'bold',
              marginLeft: '0.5rem',
              textTransform: 'capitalize',
            }}
          >
            {dispositivo.estado.replace('_', ' ')}
          </span>
        </p>
      </div>
    </div>
  );
}

// 🎨 Colores por estado
function getEstadoColor(estado) {
  switch (estado) {
    case 'operativo':
      return '#16a34a'; // verde
    case 'mantenimiento':
      return '#eab308'; // amarillo
    case 'averiado':
    case 'fuera_servicio':
      return '#dc2626'; // rojo
    default:
      return '#6b7280'; // gris
  }
}
