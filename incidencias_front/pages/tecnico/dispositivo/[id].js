import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

export default function VistaDispositivo() {
  const router = useRouter();
  const { id } = router.query;
  const [user, setUser] = useState(null);
  const [dispositivo, setDispositivo] = useState(null);
  const [estado, setEstado] = useState('');
  const [loading, setLoading] = useState(true);

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
    const fetchDispositivo = async () => {
      if (!id) return;
      const token = localStorage.getItem('token');

      const res = await fetch(
        `http://localhost:1339/api/dispositivos/${id}?populate=software,componentes`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await res.json();
      setDispositivo(data.data);
      setEstado(data.data?.attributes?.estado || '');
      setLoading(false);
    };

    fetchDispositivo();
  }, [id]);

  const handleEstadoChange = async () => {
    const token = localStorage.getItem('token');

    await fetch(`http://localhost:1339/api/dispositivos/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        data: { estado },
      }),
    });

    alert('Estado actualizado');
  };

  const estadoColor = (estado) => {
    switch (estado) {
      case 'operativo':
        return 'text-green-400';
      case 'mantenimiento':
        return 'text-yellow-400';
      case 'averiado':
      case 'fuera de servicio':
        return 'text-red-400';
      default:
        return 'text-white';
    }
  };

  if (loading) return <p className="text-white p-6">Cargando...</p>;

  const disp = dispositivo?.attributes;

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-6">
      <div className="bg-gray-800 text-white w-full max-w-xl p-8 rounded-xl shadow-lg">
        <h1 className="text-3xl font-extrabold mb-6 text-blue-400">
          {disp?.tipo_dispositivo} - {disp?.modelo}
        </h1>

        <div className="space-y-3 text-lg">
          <p><span className="font-semibold">Marca:</span> {disp?.marca}</p>
          <p><span className="font-semibold">Nº Serie:</span> {disp?.numero_serie}</p>
          <p>
            <span className="font-semibold">Estado actual:</span>{' '}
            <span className={estadoColor(disp?.estado)}>{disp?.estado}</span>
          </p>
        </div>

        <div className="mt-6">
          <label className="block mb-2 text-sm font-medium">Cambiar estado:</label>
          <select
            value={estado}
            onChange={(e) => setEstado(e.target.value)}
            className="w-full bg-gray-700 text-white px-3 py-2 rounded mb-4"
          >
            <option value="operativo">Operativo</option>
            <option value="averiado">Averiado</option>
            <option value="mantenimiento">Mantenimiento</option>
            <option value="fuera de servicio">Fuera de servicio</option>
          </select>

          <button
            onClick={handleEstadoChange}
            className="bg-blue-600 hover:bg-blue-700 transition-all px-5 py-2 rounded text-white font-semibold w-full"
          >
            Guardar cambios
          </button>
        </div>

        {/* SOFTWARE INSTALADO */}
        {disp?.software && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold text-blue-400 mb-4">Software instalado</h2>
            {disp.software.data.length > 0 ? (
              <ul className="space-y-3">
                {disp.software.data.map((sw) => {
                  const s = sw.attributes;
                  const nombre = s.nombre_software?.toLowerCase();

                  return (
                    <li key={sw.id} className="bg-gray-700 p-4 rounded">
                      <p className="font-semibold text-white">
                        {s.nombre_software} {s.version && `v${s.version}`}
                      </p>

                      {(nombre.includes('anydesk') || nombre.includes('anydesck')) && (
                        <>
                          <p className="text-sm mt-1 text-gray-300">
                            <strong>ID AnyDesk:</strong> {s.usuario}
                          </p>
                          <p className="text-sm text-gray-300">
                            <strong>Contraseña:</strong> {s.contrasena}
                          </p>

                          {/* BOTÓN 1: INTENTAR CONECTAR AUTOMÁTICAMENTE */}
                          <a
                            href={`anydesk:${s.usuario}`}
                            className="inline-block mt-3 bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded mr-2"
                          >
                            Conectar automáticamente con AnyDesk
                          </a>

                          {/* BOTÓN 2: COPIAR ID */}
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(s.usuario);
                              alert("ID AnyDesk copiado al portapapeles. Abre AnyDesk y pégalo.");
                            }}
                            className="inline-block mt-3 bg-yellow-600 hover:bg-yellow-700 text-white font-semibold px-4 py-2 rounded"
                          >
                            Copiar ID y conectar manualmente
                          </button>
                        </>
                      )}

                      {nombre.includes('windows') && (
                        <p className="text-sm mt-1 text-gray-300">
                          <strong>Contraseña de inicio:</strong> {s.contrasena}
                        </p>
                      )}
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="text-gray-400 italic">No hay software instalado.</p>
            )}
          </div>
        )}

        {/* COMPONENTES */}
        {disp?.componentes?.data?.length > 0 && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold text-blue-400 mb-4">Componentes</h2>
            <ul className="space-y-3">
              {disp.componentes.data.map((comp) => {
                const c = comp.attributes;
                return (
                  <li key={comp.id} className="bg-gray-700 p-4 rounded">
                    <p><strong>Tipo:</strong> {c.tipo_componente}</p>
                    <p><strong>Descripción:</strong> {c.descripcion}</p>
                    <p><strong>Especificaciones:</strong> {c.especificaciones}</p>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
