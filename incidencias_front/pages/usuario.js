import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

export default function UsuarioPage() {
  const [dispositivos, setDispositivos] = useState(null);
  const [incidencias, setIncidencias] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));

    if (!token || !user) {
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
        setDispositivos(data.dispositivos || []);
      } catch (err) {
        console.error('Error al cargar dispositivos', err);
        setDispositivos([]);
      }
    };

    const fetchIncidencias = async () => {
      try {
        const res = await fetch(
          `http://localhost:1339/api/incidencias?filters[user][id][$eq]=${user.id}&populate=dispositivo`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = await res.json();
        setIncidencias(data.data || []);
      } catch (err) {
        console.error('Error al cargar incidencias', err);
      }
    };

    fetchDispositivos();
    fetchIncidencias();
  }, []);

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'operativo': return '#16a34a';
      case 'mantenimiento': return '#eab308';
      case 'averiado':
      case 'fuera_servicio': return '#dc2626';
      default: return '#6b7280';
    }
  };

  const getIncidenciaEstadoColor = (estado) => {
    switch (estado) {
      case 'abierta': return '#eab308';
      case 'en_progreso': return '#3b82f6';
      case 'resuelta': return '#16a34a';
      default: return '#6b7280';
    }
  };

  const abiertas = incidencias.filter(i => i.attributes.estado !== 'resuelta');
  const cerradas = incidencias.filter(i => i.attributes.estado === 'resuelta');

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
            <li key={d.id} style={{
              background: '#1f2937',
              margin: '1rem 0',
              borderRadius: '8px',
              padding: '1rem',
              color: '#fff',
            }}>
              <details>
                <summary style={{ cursor: 'pointer', fontSize: '1.2rem' }}>
                  <a href={`/dispositivo/${d.id}`} style={{ color: '#3b82f6', textDecoration: 'underline' }}>
                    {d.tipo_dispositivo} - {d.marca} {d.modelo}
                  </a>
                  <span style={{
                    marginLeft: '1rem',
                    backgroundColor: getEstadoColor(d.estado),
                    padding: '4px 8px',
                    borderRadius: '6px',
                    fontSize: '0.9rem',
                    textTransform: 'capitalize',
                  }}>
                    {d.estado.replace('_', ' ')}
                  </span>
                </summary>
                <div style={{ marginTop: '1rem', paddingLeft: '1rem' }}>
                  <p><strong>Nº Serie:</strong> {d.numero_serie}</p>
                  <p><strong>Fecha compra:</strong> {d.fecha_compra}</p>
                  <p><strong>Garantía hasta:</strong> {d.fecha_garantia_fin}</p>
                </div>
              </details>
            </li>
          ))}
        </ul>
        
      )}

      <h2 style={{ color: 'white', marginTop: '3rem' }}>🛠 Incidencias Abiertas</h2>
      {abiertas.length === 0 ? (
        <p style={{ color: 'white' }}>No tienes incidencias abiertas.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {abiertas.map((i) => {
            const attrs = i.attributes;
            return (
              <li key={i.id} style={{
                background: '#1f2937',
                margin: '1rem 0',
                borderRadius: '8px',
                padding: '1rem',
                color: '#fff',
              }}>
                <details>
                  <summary style={{ cursor: 'pointer', fontSize: '1.1rem' }}>
                    <a href={`/incidencia/${i.id}`} style={{ color: '#3b82f6', textDecoration: 'underline', fontWeight: 'bold' }}>
                      {attrs.titulo}
                    </a>
                    <span style={{ marginLeft: '1rem' }}>
                      {attrs.dispositivo?.data?.attributes?.modelo}
                    </span>
                    <span style={{
                      marginLeft: '1rem',
                      backgroundColor: getIncidenciaEstadoColor(attrs.estado),
                      padding: '4px 8px',
                      borderRadius: '6px',
                      fontSize: '0.9rem',
                      fontWeight: 'bold',
                      textTransform: 'capitalize',
                    }}>
                      {attrs.estado.replace('_', ' ')}
                    </span>
                  </summary>
                  <div style={{ marginTop: '1rem', paddingLeft: '1rem' }}>
                    <p><strong>Descripción:</strong> {attrs.descripcion}</p>
                    <p><strong>Fecha creación:</strong> {new Date(attrs.fecha_creacion).toLocaleString()}</p>
                  </div>
                </details>
              </li>
            );
          })}
        </ul>
      )}

      <h2 style={{ color: 'white', marginTop: '3rem' }}>📜 Historial de Incidencias Cerradas</h2>
      {cerradas.length === 0 ? (
        <p style={{ color: 'white' }}>No tienes incidencias cerradas.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {cerradas.map((i) => {
            const attrs = i.attributes;
            return (
              <li key={i.id} style={{
                background: '#1f2937',
                margin: '1rem 0',
                borderRadius: '8px',
                padding: '1rem',
                color: '#fff',
              }}>
                <details>
                  <summary style={{ cursor: 'pointer', fontSize: '1.1rem' }}>
                    <a href={`/incidencia/${i.id}`} style={{ color: '#3b82f6', textDecoration: 'underline', fontWeight: 'bold' }}>
                      {attrs.titulo}
                    </a>
                    <span style={{ marginLeft: '1rem' }}>
                      {attrs.dispositivo?.data?.attributes?.modelo}
                    </span>
                    <span style={{
                      marginLeft: '1rem',
                      backgroundColor: getIncidenciaEstadoColor(attrs.estado),
                      padding: '4px 8px',
                      borderRadius: '6px',
                      fontSize: '0.9rem',
                      fontWeight: 'bold',
                      textTransform: 'capitalize',
                    }}>
                      {attrs.estado.replace('_', ' ')}
                    </span>
                  </summary>
                  <div style={{ marginTop: '1rem', paddingLeft: '1rem' }}>
                    <p><strong>Descripción:</strong> {attrs.descripcion}</p>
                    <p><strong>Resuelta el:</strong> {new Date(attrs.updatedAt).toLocaleDateString()}</p>
                  </div>
                </details>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
