import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

export default function Tecnico() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [incidencias, setIncidencias] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [abiertos, setAbiertos] = useState({});
  const [usuariosAbiertos, setUsuariosAbiertos] = useState({});

  // Estados para guardar los textos de búsqueda
  const [busquedaIncidencias, setBusquedaIncidencias] = useState("");
  const [busquedaUsuarios, setBusquedaUsuarios] = useState("");

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

      const resInc = await fetch(
        'http://localhost:1339/api/incidencias?populate=dispositivo,user',
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const dataInc = await resInc.json();

      // Filtramos incidencias que estén abiertas o en progreso
      const incidenciasFiltradas = dataInc.data.filter(
        (inc) =>
          inc.attributes.estado === 'abierta' ||
          inc.attributes.estado === 'en_progreso'
      );
      setIncidencias(incidenciasFiltradas);

      const resUsers = await fetch(
        'http://localhost:1339/api/users?populate=dispositivos',
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const dataUsers = await resUsers.json();
      setUsuarios(dataUsers);
    };

    fetchData();
  }, []);

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'abierta':
        return 'bg-yellow-200 text-yellow-800';
      case 'en_progreso':
        return 'bg-blue-200 text-blue-800';
      case 'resuelta':
        return 'bg-green-200 text-green-800';
      case 'operativo':
        return 'bg-green-200 text-green-800';
      case 'averiado':
        return 'bg-red-200 text-red-800';
      case 'mantenimiento':
        return 'bg-yellow-200 text-yellow-800';
      case 'fuera de servicio':
        return 'bg-gray-200 text-gray-800';
      default:
        return 'bg-gray-300 text-gray-800';
    }
  };

  // Filtrado de incidencias por título o nombre de usuario
  const filteredIncidencias = incidencias.filter((inc) => {
    const titulo = inc.attributes.titulo.toLowerCase();
    const username = inc.attributes.user?.data?.attributes?.username?.toLowerCase() || "";
    const query = busquedaIncidencias.toLowerCase();
    return titulo.includes(query) || username.includes(query);
  });

  // Filtrado de usuarios por su nombre de usuario
  const filteredUsuarios = usuarios.filter((usu) => {
    return usu.username.toLowerCase().includes(busquedaUsuarios.toLowerCase());
  });

  return (
    <div className="min-h-screen bg-white p-6 text-gray-800">
      <h1 className="text-3xl font-semibold mb-10 text-center">Panel del Técnico</h1>

      {/* Sección de Incidencias */}
      <section className="mb-14">
        <h2 className="text-xl font-bold mb-6">🛠 Incidencias</h2>
        <div className="mb-4">
          <input
            type="text"
            placeholder="Buscar incidencias..."
            value={busquedaIncidencias}
            onChange={(e) => setBusquedaIncidencias(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>
        <div className="grid gap-6">
          {filteredIncidencias.map((inc) => {
            const id = inc.id;
            const attr = inc.attributes;
            const disp = attr.dispositivo?.data?.attributes;
            const dispId = attr.dispositivo?.data?.id;
            const usu = attr.user?.data?.attributes;
            return (
              <div key={id} className="bg-gray-50 rounded shadow p-4">
                <div
                  className="flex justify-between items-center cursor-pointer hover:bg-gray-100 p-2 rounded"
                  onClick={() =>
                    setAbiertos((prev) => ({ ...prev, [id]: !prev[id] }))
                  }
                >
                  <div>
                    <p className="text-lg font-medium text-gray-900">
                      {attr.titulo}
                    </p>
                    <p className="text-sm text-gray-500">
                      👤 Usuario: {usu?.username}
                    </p>
                  </div>
                  <span
                    className={`text-xs px-3 py-1 rounded-full font-medium ${getEstadoColor(
                      attr.estado
                    )}`}
                  >
                    {attr.estado}
                  </span>
                </div>
                {abiertos[id] && (
                  <div className="mt-3 px-3 py-2 bg-white rounded border border-gray-200 space-y-2">
                    <p>
                      <strong>Dispositivo:</strong>{' '}
                      <span
                        className="underline text-blue-600 cursor-pointer hover:text-blue-800"
                        onClick={() => router.push(`/tecnico/dispositivo/${dispId}`)}
                      >
                        {disp?.tipo_dispositivo} - {disp?.modelo}
                      </span>
                    </p>
                    <p>
                      <strong>Descripción:</strong> {attr.descripcion}
                    </p>
                    <button
                      onClick={() => router.push(`/tecnico/incidencia/${id}`)}
                      className="mt-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-white text-sm font-semibold"
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

      {/* Sección de Usuarios y Dispositivos */}
      <section>
        <h2 className="text-xl font-bold mb-6">
          👥 Usuarios y Dispositivos
        </h2>
        <div className="mb-4">
          <input
            type="text"
            placeholder="Buscar usuarios..."
            value={busquedaUsuarios}
            onChange={(e) => setBusquedaUsuarios(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>
        <div className="grid gap-6">
          {filteredUsuarios.map((usu) => (
            <div key={usu.id} className="bg-gray-50 rounded shadow overflow-hidden">
              <div
                className="p-4 font-semibold text-gray-800 hover:bg-gray-100 cursor-pointer"
                onClick={() =>
                  setUsuariosAbiertos((prev) => ({
                    ...prev,
                    [usu.id]: !prev[usu.id],
                  }))
                }
              >
                👤 {usu.username}
              </div>
              {usuariosAbiertos[usu.id] && (
                <div className="bg-white px-4 py-3 border-t border-gray-200 space-y-3">
                  {usu.dispositivos?.length > 0 ? (
                    usu.dispositivos.map((d, idx) => (
                      <div
                        key={idx}
                        className="flex justify-between items-center"
                      >
                        <p
                          className="underline text-blue-600 cursor-pointer hover:text-blue-800"
                          onClick={() => router.push(`/tecnico/dispositivo/${d.id}`)}
                        >
                          {d.tipo_dispositivo} - {d.modelo}
                        </p>
                        <span
                          className={`text-xs px-3 py-1 rounded-full font-medium ${getEstadoColor(
                            d.estado
                          )}`}
                        >
                          {d.estado}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">
                      No tiene dispositivos asignados.
                    </p>
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
