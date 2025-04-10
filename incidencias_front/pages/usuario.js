import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import ChatBotFloating from '../components/ChatBotFloating'; // 👈 Import del chatbot

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
    <div className="p-6 bg-white min-h-screen text-gray-800">
      <h1 className="text-3xl font-semibold mb-6">Mis Dispositivos</h1>
  
      {dispositivos === null ? (
        <p>Cargando dispositivos...</p>
      ) : dispositivos.length === 0 ? (
        <p>No tienes dispositivos asignados.</p>
      ) : (
        <ul className="space-y-4">
          {dispositivos.map((d) => (
            <li key={d.id} className="bg-gray-50 p-4 rounded shadow">
              <details>
                <summary className="cursor-pointer text-lg font-semibold">
                  <a
                    href={`/dispositivo/${d.id}`}
                    className="text-blue-600 hover:underline"
                  >
                    {d.tipo_dispositivo} - {d.marca} {d.modelo}
                  </a>
                  {d.estado && (
                    <span
                      className="ml-4 text-xs font-medium px-2 py-1 rounded"
                      style={{ backgroundColor: getEstadoColor(d.estado), color: "white" }}
                    >
                      {d.estado.replace("_", " ")}
                    </span>
                  )}
                </summary>
                <div className="mt-2 pl-4 text-sm">
                  <p><strong>Nº Serie:</strong> {d.numero_serie}</p>
                  <p><strong>Fecha compra:</strong> {d.fecha_compra}</p>
                  <p><strong>Garantía hasta:</strong> {d.fecha_garantia_fin}</p>
                </div>
              </details>
            </li>
          ))}
        </ul>
      )}
  
      {/* Incidencias abiertas */}
      <h2 className="text-2xl font-bold mt-10 mb-4">🛠 Incidencias Abiertas</h2>
      {abiertas.length === 0 ? (
        <p>No tienes incidencias abiertas.</p>
      ) : (
        <ul className="space-y-4">
          {abiertas.map((i) => {
            const a = i.attributes;
            return (
              <li key={i.id} className="bg-gray-50 p-4 rounded shadow">
                <details>
                  <summary className="cursor-pointer text-base font-semibold">
                    <a
                      href={`/incidencia/${i.id}`}
                      className="text-blue-600 hover:underline font-bold"
                    >
                      {a.titulo}
                    </a>
                    <span className="ml-2 text-sm text-gray-600">
                      {a.dispositivo?.data?.attributes?.modelo}
                    </span>
                    {a.estado && (
                      <span
                        className="ml-4 text-xs font-medium px-2 py-1 rounded"
                        style={{ backgroundColor: getIncidenciaEstadoColor(a.estado), color: "white" }}
                      >
                        {a.estado.replace("_", " ")}
                      </span>
                    )}
                  </summary>
                  <div className="mt-2 pl-4 text-sm">
                    <p><strong>Descripción:</strong> {a.descripcion}</p>
                    <p><strong>Fecha creación:</strong> {new Date(a.fecha_creacion).toLocaleString()}</p>
                  </div>
                </details>
              </li>
            );
          })}
        </ul>
      )}
  
      {/* Incidencias cerradas */}
      <h2 className="text-2xl font-bold mt-10 mb-4">📜 Historial de Incidencias Cerradas</h2>
      {cerradas.length === 0 ? (
        <p>No tienes incidencias cerradas.</p>
      ) : (
        <ul className="space-y-4">
          {cerradas.map((i) => {
            const a = i.attributes;
            return (
              <li key={i.id} className="bg-gray-50 p-4 rounded shadow">
                <details>
                  <summary className="cursor-pointer text-base font-semibold">
                    <a
                      href={`/incidencia/${i.id}`}
                      className="text-blue-600 hover:underline font-bold"
                    >
                      {a.titulo}
                    </a>
                    <span className="ml-2 text-sm text-gray-600">
                      {a.dispositivo?.data?.attributes?.modelo}
                    </span>
                    {a.estado && (
                      <span
                        className="ml-4 text-xs font-medium px-2 py-1 rounded"
                        style={{ backgroundColor: getIncidenciaEstadoColor(a.estado), color: "white" }}
                      >
                        {a.estado.replace("_", " ")}
                      </span>
                    )}
                  </summary>
                  <div className="mt-2 pl-4 text-sm">
                    <p><strong>Descripción:</strong> {a.descripcion}</p>
                    <p><strong>Resuelta el:</strong> {new Date(a.updatedAt).toLocaleDateString()}</p>
                  </div>
                </details>
              </li>
            );
          })}
        </ul>
      )}
  
      <ChatBotFloating />
    </div>
  );
}  