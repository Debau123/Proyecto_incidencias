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

  if (!dispositivo) return <p style={{ color: 'white', padding: '2rem' }}>Cargando dispositivo...</p>;

  return (
    <div style={{ color: 'white', padding: '2rem' }}>
      <h1>Detalles del Dispositivo</h1>
      <p><strong>Tipo:</strong> {dispositivo.tipo_dispositivo}</p>
      <p><strong>Marca:</strong> {dispositivo.marca}</p>
      <p><strong>Modelo:</strong> {dispositivo.modelo}</p>
      <p><strong>Nº Serie:</strong> {dispositivo.numero_serie}</p>
      <p><strong>Fecha de compra:</strong> {dispositivo.fecha_compra}</p>
      <p><strong>Garantía hasta:</strong> {dispositivo.fecha_garantia_fin}</p>
      <p><strong>Estado:</strong> {dispositivo.estado}</p>
    </div>
  );
}
