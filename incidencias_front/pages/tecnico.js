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
      setIncidencias(dataInc.data);

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
    <div className="p-6 text-white">
      <h1 className="text-3xl font-bold mb-6">Panel del Técnico</h1>

      {/* INCIDENCIAS */}
      <div className="mb-10">
        <h2 className="text-2xl font-semibold mb-4">Incidencias</h2>
        {incidencias.map((inc) => {
          const id = inc.id;
          const attr = inc.attributes;
          const disp = attr.dispositivo?.data?.attributes;
          const usu = attr.user?.data?.attributes;
          return (
            <div key={id} className="mb-2 border border-gray-600 rounded-lg overflow-hidden">
              <div
                className="bg-gray-800 p-4 flex justify-between items-center cursor-pointer hover:bg-gray-700"
                onClick={() => setAbiertos(prev => ({ ...prev, [id]: !prev[id] }))}
              >
                <div>
                  <p className="font-semibold">{disp?.tipo_dispositivo} - {disp?.modelo}</p>
                  <p className="text-sm text-gray-400">Usuario: {usu?.username}</p>
                </div>
                <span className={`text-xs text-white px-2 py-1 rounded ${getEstadoColor(attr.estado)}`}>{attr.estado}</span>
              </div>
              {abiertos[id] && (
                <div className="bg-gray-900 px-4 py-3">
                  <p><strong>Título:</strong> {attr.titulo}</p>
                  <p><strong>Descripción:</strong> {attr.descripcion}</p>
                  <button
                    onClick={() => router.push(`/incidencia/${id}`)}
                    className="mt-2 bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-white"
                  >
                    Ver Detalle
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* USUARIOS Y SUS DISPOSITIVOS */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Usuarios</h2>
        {usuarios.map((usu) => (
          <div key={usu.id} className="mb-2 border border-gray-600 rounded-lg overflow-hidden">
            <div
              className="bg-gray-800 p-4 cursor-pointer hover:bg-gray-700"
              onClick={() => setUsuariosAbiertos(prev => ({ ...prev, [usu.id]: !prev[usu.id] }))}
            >
              👤 <strong>{usu.username}</strong>
            </div>
            {usuariosAbiertos[usu.id] && (
              <div className="bg-gray-900 px-4 py-3">
                {usu.dispositivos?.length > 0 ? (
                  usu.dispositivos.map((d, idx) => (
                    <div key={idx} className="mb-2">
                      <p>{d.tipo_dispositivo} - {d.modelo}</p>
                      <span className={`text-xs px-2 py-1 rounded text-white ${getEstadoColor(d.estado)}`}>{d.estado}</span>
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
    </div>
  );
}
