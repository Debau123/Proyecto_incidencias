import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';

export default function DetalleUsuario() {
  const router = useRouter();
  const { id } = router.query;
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    if (!id) return;

    const token = localStorage.getItem('token');

    const fetchUsuario = async () => {
      try {
        const res = await fetch(
          `http://localhost:1339/api/users/${id}?populate=dispositivos.componentes,dispositivos.software`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = await res.json();
        setUsuario(data); // ← el JSON ya viene plano
      } catch (error) {
        console.error('Error al obtener usuario:', error);
      } finally {
        setCargando(false);
      }
    };

    fetchUsuario();
  }, [id]);

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'operativo':
        return 'bg-green-200 text-green-800';
      case 'averiado':
        return 'bg-red-200 text-red-800';
      case 'mantenimiento':
        return 'bg-yellow-200 text-yellow-800';
      case 'fuera de servicio':
        return 'bg-gray-300 text-gray-800';
      default:
        return 'bg-gray-200 text-gray-800';
    }
  };

  if (cargando)
    return <p className="p-6 text-center text-gray-500">Cargando...</p>;
  if (!usuario)
    return (
      <p className="p-6 text-center text-red-600">Usuario no encontrado</p>
    );

  return (
    <div className="p-6 bg-white min-h-screen text-gray-800">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1 text-blue-600 mb-4 hover:underline"
      >
        <ArrowLeft size={18} /> Volver
      </button>

      <h1 className="text-3xl font-semibold mb-6">Detalles del Usuario</h1>

      {/* Información del usuario */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-6 rounded shadow mb-10">
        <div>
          <p className="text-sm text-gray-500">ID</p>
          <p className="font-medium text-lg">{usuario.id}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Nombre de usuario</p>
          <p className="font-medium text-lg">{usuario.username}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Correo electrónico</p>
          <p className="font-medium text-lg">{usuario.email}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Rol</p>
          <p className="font-medium text-lg capitalize">
            {usuario.rol || 'Sin rol asignado'}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Confirmado</p>
          <span
            className={`inline-block px-2 py-1 text-sm font-medium rounded ${
              usuario.confirmed
                ? 'bg-green-200 text-green-800'
                : 'bg-red-200 text-red-800'
            }`}
          >
            {usuario.confirmed ? 'Sí' : 'No'}
          </span>
        </div>
        <div>
          <p className="text-sm text-gray-500">Bloqueado</p>
          <span
            className={`inline-block px-2 py-1 text-sm font-medium rounded ${
              usuario.blocked
                ? 'bg-red-200 text-red-800'
                : 'bg-green-200 text-green-800'
            }`}
          >
            {usuario.blocked ? 'Sí' : 'No'}
          </span>
        </div>
        <div>
          <p className="text-sm text-gray-500">Creado</p>
          <p className="font-medium text-lg">
            {new Date(usuario.createdAt).toLocaleString()}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Última actualización</p>
          <p className="font-medium text-lg">
            {new Date(usuario.updatedAt).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Dispositivos */}
      <div>
        <h2 className="text-2xl font-bold mb-6">Dispositivos Asignados</h2>
        {usuario.dispositivos?.length > 0 ? (
          usuario.dispositivos.map((d) => (
            <div
              key={d.id}
              className="bg-gray-50 rounded shadow p-6 mb-6 border"
            >
              <h3 className="text-xl font-bold mb-2">
                {d.tipo_dispositivo} - {d.modelo}
              </h3>
              <p><strong>Marca:</strong> {d.marca}</p>
              <p><strong>Serie:</strong> {d.numero_serie}</p>
              <p>
                <strong>Estado:</strong>{' '}
                <span className={`text-sm font-medium px-2 py-1 rounded-full ${getEstadoColor(d.estado)}`}>
                  {d.estado}
                </span>
              </p>

              {/* Componentes */}
              <div className="mt-4">
                <h4 className="font-semibold">Componentes</h4>
                {d.componentes?.length > 0 ? (
                  <ul className="list-disc list-inside">
                    {d.componentes.map((c) => (
                      <li key={c.id}>
                        <strong>{c.tipo_componente}:</strong> {c.descripcion}{' '}
                        {c.especificaciones && `- ${c.especificaciones}`}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500">
                    No tiene componentes
                  </p>
                )}
              </div>

              {/* Software */}
              <div className="mt-4">
                <h4 className="font-semibold">Software</h4>
                {d.software?.length > 0 ? (
                  <ul className="list-disc list-inside">
                    {d.software.map((s) => (
                      <li key={s.id}>
                        {s.nombre_software}
                        {s.version && ` v${s.version}`}
                        {s.usuario && (
                          <>
                            <br />
                            <strong>Usuario:</strong> {s.usuario}
                          </>
                        )}
                        {s.contrasena && (
                          <>
                            <br />
                            <strong>Contraseña:</strong> {s.contrasena}
                          </>
                        )}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500">
                    No tiene software instalado
                  </p>
                )}
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-gray-500">No hay dispositivos asignados</p>
        )}
      </div>
    </div>
  );
}
