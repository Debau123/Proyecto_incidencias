// pages/tecnico/incidencias.js
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

export default function IncidenciasTecnico() {
  const router = useRouter();
  const [incidencias, setIncidencias] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [abiertos, setAbiertos] = useState({});

  useEffect(() => {
    const fetchIncidencias = async () => {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:1339/api/incidencias?populate=dispositivo,user', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setIncidencias(data.data);
    };

    fetchIncidencias();
  }, []);

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'abierta': return 'bg-yellow-500';
      case 'en_progreso': return 'bg-blue-500';
      case 'resuelta': return 'bg-green-600';
      default: return 'bg-gray-500';
    }
  };

  const filtrarIncidencias = (estado) => {
    return incidencias.filter(inc =>
      inc.attributes.estado === estado &&
      (inc.attributes.titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
        inc.attributes.descripcion.toLowerCase().includes(busqueda.toLowerCase()))
    );
  };

  const renderLista = (lista, titulo) => (
    <div className="mb-12">
      <h2 className="text-2xl font-bold mb-5 text-white">{titulo}</h2>
      {lista.length === 0 ? (
        <p className="text-gray-400 italic">No hay incidencias {titulo.toLowerCase()}...</p>
      ) : (
        <div className="space-y-4">
          {lista.map((inc) => {
            const id = inc.id;
            const attr = inc.attributes;
            const disp = attr.dispositivo?.data?.attributes;
            const usu = attr.user?.data?.attributes;

            return (
              <div
                key={id}
                className="bg-gray-800 rounded-xl shadow hover:shadow-xl transition duration-200"
              >
                <div
                  className="p-4 flex justify-between items-center cursor-pointer hover:bg-gray-700 rounded-t-xl"
                  onClick={() => setAbiertos(prev => ({ ...prev, [id]: !prev[id] }))}
                >
                  <div>
                    <p className="text-lg font-semibold">{attr.titulo}</p>
                    <p className="text-sm text-gray-300">👤 Usuario: {usu?.username}</p>
                  </div>
                  <span className={`text-xs px-3 py-1 rounded-full font-medium ${getEstadoColor(attr.estado)}`}>
                    {attr.estado}
                  </span>
                </div>

                {abiertos[id] && (
                  <div className="bg-gray-900 px-4 py-3 rounded-b-xl text-sm space-y-2">
                    <p>
                      <strong>📱 Dispositivo:</strong>{' '}
                      {disp?.tipo_dispositivo} - {disp?.modelo}
                    </p>
                    <p><strong>📝 Descripción:</strong> {attr.descripcion}</p>
                    <button
                      onClick={() => router.push(`/tecnico/incidencia/${id}`)}
                      className="mt-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-sm font-semibold"
                    >
                      Ver Detalle
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-900 p-8 text-white">
      <h1 className="text-4xl font-extrabold mb-10 text-center">📋 Incidencias Técnicas</h1>

      <div className="flex justify-center mb-10">
        <input
          type="text"
          placeholder="🔍 Buscar incidencia..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="p-3 rounded w-full max-w-xl bg-white text-black placeholder-gray-500 outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Abiertas */}
      {renderLista(filtrarIncidencias('abierta'), 'Incidencias Abiertas')}

      {/* En Progreso */}
      {renderLista(filtrarIncidencias('en_progreso'), 'Incidencias en Progreso')}

      {/* Resueltas */}
      {renderLista(filtrarIncidencias('resuelta'), 'Incidencias Resueltas')}
    </div>
  );
}
