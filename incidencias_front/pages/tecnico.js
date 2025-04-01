// pages/tecnico/index.js
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

export default function Tecnico() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [incidencias, setIncidencias] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [abiertos, setAbiertos] = useState({});
  const [usuariosAbiertos, setUsuariosAbiertos] = useState({});

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      if (parsedUser.rol !== 'tecnico') {
        router.push(`/${parsedUser.rol}`);
      }
    } else {
      router.push('/login');
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');

      const resInc = await fetch('http://localhost:1339/api/incidencias?populate=dispositivo,user', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const dataInc = await resInc.json();

      // Filtrar solo las incidencias abiertas o en progreso
      const incidenciasFiltradas = dataInc.data.filter(
        (inc) => inc.attributes.estado === 'abierta' || inc.attributes.estado === 'en_progreso'
      );
      setIncidencias(incidenciasFiltradas);

      const resUsers = await fetch('http://localhost:1339/api/users?populate=dispositivos', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const dataUsers = await resUsers.json();
      setUsuarios(dataUsers);
    };

    fetchData();
  }, []);

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'abierta': return 'bg-yellow-500';
      case 'en_progreso': return 'bg-blue-500';
      case 'resuelta': return 'bg-green-600';
      case 'operativo': return 'bg-green-600';
      case 'averiado': return 'bg-red-600';
      case 'mantenimiento': return 'bg-yellow-500';
      case 'fuera de servicio': return 'bg-gray-600';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 p-8 text-white">
      <h1 className="text-4xl font-extrabold mb-10 text-center">Panel del Técnico</h1>

      {/* INCIDENCIAS */}
      <section className="mb-14">
        <h2 className="text-2xl font-bold mb-6">🛠 Incidencias</h2>
        <div className="space-y-4">
          {incidencias.map((inc) => {
            const id = inc.id;
            const attr = inc.attributes;
            const disp = attr.dispositivo?.data?.attributes;
            const dispId = attr.dispositivo?.data?.id;
            const usu = attr.user?.data?.attributes;
            return (
              <div key={id} className="bg-gray-800 rounded-xl shadow p-4">
                <div
                  className="flex justify-between items-center cursor-pointer hover:bg-gray-700 rounded p-2"
                  onClick={() => setAbiertos(prev => ({ ...prev, [id]: !prev[id] }))}
                >
                  <div>
                    <p className="text-lg font-semibold">{attr.titulo}</p>
                    <p className="text-sm text-gray-400">👤 Usuario: {usu?.username}</p>
                  </div>
                  <span className={`text-xs px-3 py-1 rounded-full font-medium ${getEstadoColor(attr.estado)}`}>
                    {attr.estado}
                  </span>
                </div>
                {abiertos[id] && (
                  <div className="mt-3 px-3 py-2 bg-gray-900 rounded-lg space-y-2">
                    <p>
                      <strong>Dispositivo:</strong>{' '}
                      <span
                        className="underline text-blue-400 cursor-pointer hover:text-blue-300"
                        onClick={() => router.push(`/tecnico/dispositivo/${dispId}`)}
                      >
                        {disp?.tipo_dispositivo} - {disp?.modelo}
                      </span>
                    </p>
                    <p><strong>Descripción:</strong> {attr.descripcion}</p>
                    <button
                      onClick={() => router.push(`/tecnico/incidencia/${id}`)}
                      className="mt-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded font-semibold"
                    >
                      Ver Detalle
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* USUARIOS */}
      <section>
        <h2 className="text-2xl font-bold mb-6">👥 Usuarios y Dispositivos</h2>
        <div className="space-y-4">
          {usuarios.map((usu) => (
            <div key={usu.id} className="bg-gray-800 rounded-xl shadow">
              <div
                className="p-4 cursor-pointer hover:bg-gray-700 rounded-t-xl font-medium"
                onClick={() => setUsuariosAbiertos(prev => ({ ...prev, [usu.id]: !prev[usu.id] }))}
              >
                👤 {usu.username}
              </div>
              {usuariosAbiertos[usu.id] && (
                <div className="bg-gray-900 px-4 py-3 rounded-b-xl space-y-2">
                  {usu.dispositivos?.length > 0 ? (
                    usu.dispositivos.map((d, idx) => (
                      <div key={idx} className="flex justify-between items-center">
                        <p
                          className="underline text-blue-400 cursor-pointer hover:text-blue-300"
                          onClick={() => router.push(`/tecnico/dispositivo/${d.id}`)}
                        >
                          {d.tipo_dispositivo} - {d.modelo}
                        </p>
                        <span className={`text-xs px-3 py-1 rounded-full font-medium ${getEstadoColor(d.estado)}`}>
                          {d.estado}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-400">No tiene dispositivos asignados.</p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
