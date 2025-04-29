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
      case 'abierta': return 'bg-yellow-200 text-yellow-800';
      case 'en_progreso': return 'bg-blue-200 text-blue-800';
      case 'resuelta': return 'bg-green-200 text-green-800';
      default: return 'bg-gray-200 text-gray-800';
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
      <h2 className="text-xl font-bold mb-4">{titulo}</h2>
      {lista.length === 0 ? (
        <p className="text-gray-500 italic">No hay incidencias {titulo.toLowerCase()}...</p>
      ) : (
        <ul className="divide-y divide-gray-200">
          {lista.map((inc) => {
            const id = inc.id;
            const attr = inc.attributes;
            const disp = attr.dispositivo?.data?.attributes;
            const usu = attr.user?.data?.attributes;

            return (
              <li key={id} className="py-4">
                <div className="flex justify-between items-center cursor-pointer" onClick={() => setAbiertos(prev => ({ ...prev, [id]: !prev[id] }))}>
                  <div>
                    <p className="text-lg font-medium text-gray-800">{attr.titulo}</p>
                    <p className="text-sm text-gray-500">👤 Usuario: {usu?.username}</p>
                  </div>
                  <span className={`text-xs px-3 py-1 rounded-full font-medium ${getEstadoColor(attr.estado)}`}>
                    {attr.estado}
                  </span>
                </div>
                {abiertos[id] && (
                  <div className="mt-2 pl-4 text-sm text-gray-700 space-y-2">
                    <p><strong>📱 Dispositivo:</strong> {disp?.tipo_dispositivo} - {disp?.modelo}</p>
                    <p><strong>📝 Descripción:</strong> {attr.descripcion}</p>
                    <button
                      onClick={() => router.push(`/tecnico/incidencia/${id}`)}
                      className="mt-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-semibold"
                    >
                      Ver Detalle
                    </button>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-white p-6 text-gray-800">
      <h1 className="text-3xl font-semibold mb-8 text-center">📋 Incidencias Técnicas</h1>

      <div className="flex justify-center mb-10">
        <input
          type="text"
          placeholder="🔍 Buscar incidencia..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="p-3 rounded w-full max-w-xl border border-gray-300 text-gray-800 placeholder-gray-500 outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {renderLista(filtrarIncidencias('abierta'), 'Incidencias Abiertas')}
      {renderLista(filtrarIncidencias('en_progreso'), 'Incidencias en Progreso')}
      {renderLista(filtrarIncidencias('resuelta'), 'Incidencias Resueltas')}
    </div>
  );
}
