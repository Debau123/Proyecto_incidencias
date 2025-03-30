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
    <div className="mb-10">
      <h2 className="text-2xl font-bold mb-4 text-white">{titulo}</h2>
      {lista.length === 0 && (
        <p className="text-gray-300 italic">No hay incidencias {titulo.toLowerCase()}...</p>
      )}
      {lista.map(inc => {
        const id = inc.id;
        const attr = inc.attributes;
        const disp = attr.dispositivo?.data?.attributes;
        const usu = attr.user?.data?.attributes;

        return (
          <div key={id} className="mb-3 border border-gray-600 rounded-lg overflow-hidden bg-[#2a2a40] hover:bg-[#3a3a55] transition">
            <div
              className="p-4 flex justify-between items-center cursor-pointer"
              onClick={() => setAbiertos(prev => ({ ...prev, [id]: !prev[id] }))}
            >
              <div>
                <p className="font-semibold text-white">{attr.titulo}</p>
                <p className="text-sm text-gray-300">Usuario: {usu?.username}</p>
              </div>
              <span className={`text-xs text-white px-2 py-1 rounded ${getEstadoColor(attr.estado)}`}>
                {attr.estado}
              </span>
            </div>

            {abiertos[id] && (
              <div className="bg-[#1e1e2e] px-4 py-3 text-sm text-white">
                <p><strong>Dispositivo:</strong> {disp?.tipo_dispositivo} - {disp?.modelo}</p>
                <p><strong>Descripción:</strong> {attr.descripcion}</p>
                <button
                  onClick={() => router.push(`/tecnico/incidencia/${id}`)}
                  className="mt-3 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-white text-sm"
                >
                  Ver Detalle
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="p-6 text-white min-h-screen" style={{ backgroundColor: '#1e1e2e' }}>
      <h1 className="text-3xl font-extrabold mb-6">Incidencias Técnicas</h1>

      <input
  type="text"
  placeholder="🔍 Buscar incidencia..."
  value={busqueda}
  onChange={(e) => setBusqueda(e.target.value)}
  className="mb-8 p-3 rounded w-full max-w-lg bg-white text-black placeholder-gray-500 outline-none focus:ring-2 focus:ring-blue-500"
/>

      {renderLista(filtrarIncidencias('abierta'), 'Incidencias Abiertas')}
      {renderLista(filtrarIncidencias('resuelta'), 'Incidencias Resueltas')}
    </div>
  );
}
