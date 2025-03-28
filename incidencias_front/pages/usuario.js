import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

export default function UsuarioPage() {
  const [dispositivos, setDispositivos] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (!token) {
      router.push('/login');
      return;
    }

    const fetchDispositivos = async () => {
      try {
        const res = await fetch('http://localhost:1339/api/users/me?populate=dispositivos', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();
        console.log('Usuario autenticado:', data);
        setDispositivos(data.dispositivos || []);
      } catch (err) {
        console.error('Error al cargar dispositivos', err);
        setDispositivos([]);
      }
    };

    fetchDispositivos();
  }, []);

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'operativo':
        return '#16a34a';
      case 'mantenimiento':
        return '#eab308';
      case 'averiado':
      case 'fuera_servicio':
        return '#dc2626';
      default:
        return '#6b7280';
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2 style={{ color: 'white' }}>Mis Dispositivos</h2>

      {dispositivos === null ? (
        <p style={{ color: 'white' }}>Cargando dispositivos...</p>
      ) : dispositivos.length === 0 ? (
        <p style={{ color: 'white' }}>No tienes dispositivos asignados.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {dispositivos.map((d) => (
            <li
              key={d.id}
              style={{
                background: '#1f2937',
                margin: '1rem 0',
                borderRadius: '8px',
                padding: '1rem',
                color: '#fff',
              }}
            >
              <details>
                <summary style={{ cursor: 'pointer', fontSize: '1.2rem' }}>
                  <a
                    href={`/dispositivo/${d.id}`}
                    style={{ color: '#3b82f6', textDecoration: 'underline' }}
                  >
                    {d.tipo_dispositivo} - {d.marca} {d.modelo}
                  </a>
                  <span
                    style={{
                      marginLeft: '1rem',
                      backgroundColor: getEstadoColor(d.estado),
                      padding: '4px 8px',
                      borderRadius: '6px',
                      fontSize: '0.9rem',
                      textTransform: 'capitalize',
                    }}
                  >
                    {d.estado.replace('_', ' ')}
                  </span>
                </summary>
                <div style={{ marginTop: '1rem', paddingLeft: '1rem' }}>
                  <p>
                    <strong>Nº Serie:</strong> {d.numero_serie}
                  </p>
                  <p>
                    <strong>Fecha compra:</strong> {d.fecha_compra}
                  </p>
                  <p>
                    <strong>Garantía hasta:</strong> {d.fecha_garantia_fin}
                  </p>
                </div>
              </details>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
