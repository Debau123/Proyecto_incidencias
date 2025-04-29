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
        return 'bg-green-200 text-green-800';
      case 'mantenimiento':
        return 'bg-yellow-200 text-yellow-800';
      case 'averiado':
        return 'bg-red-200 text-red-800';
      case 'fuera de servicio':
        return 'bg-gray-200 text-gray-800';
      default:
        return 'bg-gray-300 text-gray-800';
    }
  };

  const PasswordField = ({ label, value }) => {
    const handleCopy = () => {
      navigator.clipboard.writeText(value);
      alert(`${label} copiada al portapapeles`);
    };

    return (
      <div className="flex items-center gap-2">
        <p>
          <strong>{label}:</strong>{' '}
          <span className="tracking-widest">••••••••</span>
        </p>
        <button
          onClick={handleCopy}
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-1 rounded"
        >
          Copiar
        </button>
      </div>
    );
  };

  if (loading) return <p className="text-gray-600 p-6">Cargando...</p>;

  const disp = dispositivo?.attributes;

  return (
    <div className="min-h-screen bg-white text-gray-800 p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-blue-600">
          {disp?.tipo_dispositivo} - {disp?.modelo}
        </h1>

        <ul className="space-y-2">
          <li>
            <strong>Marca:</strong> {disp?.marca}
          </li>
          <li>
            <strong>Nº Serie:</strong> {disp?.numero_serie}
          </li>
          <li>
            <strong>Estado actual:</strong>{' '}
            <span
              className={`px-2 py-1 rounded text-sm ${estadoColor(disp?.estado)}`}
            >
              {disp?.estado}
            </span>
          </li>
        </ul>

        {/* Cambiar estado */}
        <div>
          <label className="block mb-2 text-sm font-medium">Cambiar estado:</label>
          <select
            value={estado}
            onChange={(e) => setEstado(e.target.value)}
            className="w-full border border-gray-300 px-3 py-2 rounded"
          >
            <option value="operativo">Operativo</option>
            <option value="averiado">Averiado</option>
            <option value="mantenimiento">Mantenimiento</option>
            <option value="fuera de servicio">Fuera de servicio</option>
          </select>

          <button
            onClick={handleEstadoChange}
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded"
          >
            Guardar cambios
          </button>
        </div>

        {/* Software */}
        {disp?.software && (
          <div>
            <h2 className="text-xl font-bold text-blue-600 mt-6 mb-3">
              Software instalado
            </h2>

            {disp.software.data.length > 0 ? (
              <ul className="space-y-4">
                {disp.software.data.map((sw) => {
                  const s = sw.attributes;
                  const nombre = s.nombre_software?.toLowerCase();

                  return (
                    <li key={sw.id} className="border border-gray-200 rounded p-4">
                      <p className="font-medium">
                        {s.nombre_software} {s.version && `v${s.version}`}
                      </p>

                      {/* AnyDesk */}
                      {(nombre.includes('anydesk') || nombre.includes('anydesck')) && (
                        <>
                          <p>
                            <strong>ID AnyDesk:</strong> {s.usuario}
                          </p>
                          <PasswordField
                            label="Contraseña AnyDesk"
                            value={s.contrasena}
                          />
                          <a
                            href={`anydesk:${s.usuario}`}
                            className="inline-block mt-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded mr-2"
                          >
                            Conectar automáticamente
                          </a>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(s.usuario);
                              alert(
                                'ID AnyDesk copiado al portapapeles. Abre AnyDesk y pégalo.'
                              );
                            }}
                            className="inline-block mt-2 bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded"
                          >
                            Copiar ID
                          </button>
                        </>
                      )}

                      {/* Windows */}
                      {nombre.includes('windows') && (
                        <PasswordField
                          label="Contraseña de inicio"
                          value={s.contrasena}
                        />
                      )}

                      {/* ERP Ahora */}
                      {nombre.includes('erp ahora') && (
                        <>
                          <p>
                            <strong>Usuario:</strong> {s.usuario}
                          </p>
                          <PasswordField
                            label="Contraseña de inicio"
                            value={s.contrasena}
                          />
                        </>
                      )}
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="text-sm text-gray-500">No hay software instalado.</p>
            )}
          </div>
        )}

        {/* Componentes */}
        {disp?.componentes?.data?.length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-blue-600 mt-6 mb-3">
              Componentes
            </h2>
            <ul className="space-y-4">
              {disp.componentes.data.map((comp) => {
                const c = comp.attributes;
                return (
                  <li key={comp.id} className="border border-gray-200 rounded p-4">
                    <p>
                      <strong>Tipo:</strong> {c.tipo_componente}
                    </p>
                    <p>
                      <strong>Descripción:</strong> {c.descripcion}
                    </p>
                    <p>
                      <strong>Especificaciones:</strong> {c.especificaciones}
                    </p>
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
