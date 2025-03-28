import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

export default function UsuarioPage() {
  const [dispositivos, setDispositivos] = useState(null);
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
        const res = await fetch(
          `http://localhost:1339/api/users?filters[username][$eq]=${user.username}&populate[dispositivos][filters][publishedAt][$notNull]=true`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const users = await res.json();

        // Aquí accedemos directamente al primer usuario y sus dispositivos
        if (users.length > 0) {
          setDispositivos(users[0].dispositivos || []);
        } else {
          setDispositivos([]);
        }
      } catch (err) {
        console.error('Error al cargar dispositivos', err);
        setDispositivos([]);
      }
    };

    fetchDispositivos();
  }, []);

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'Operativo':
        return '#16a34a';
      case 'Mantenimiento':
        return '#eab308';
      case 'Averiado':
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
                    }}
                  >
                    {d.estado}
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
