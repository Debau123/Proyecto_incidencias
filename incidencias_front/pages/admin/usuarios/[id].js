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
        const res = await fetch(`http://localhost:1339/api/users/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        setUsuario(data);
      } catch (error) {
        console.error('Error al obtener usuario:', error);
      } finally {
        setCargando(false);
      }
    };

    fetchUsuario();
  }, [id]);

  if (cargando) return <p className="p-6 text-center text-gray-500">Cargando...</p>;
  if (!usuario) return <p className="p-6 text-center text-red-600">Usuario no encontrado</p>;

  return (
    <div className="p-6 bg-white min-h-screen text-gray-800">
      <button onClick={() => router.back()} className="flex items-center gap-1 text-blue-600 mb-4 hover:underline">
        <ArrowLeft size={18} /> Volver
      </button>
      <h1 className="text-3xl font-semibold mb-6">Detalles del Usuario</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-6 rounded shadow">
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
          <p className="font-medium text-lg capitalize">{usuario.rol || "Sin rol asignado"}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Confirmado</p>
          <span className={`inline-block px-2 py-1 text-sm font-medium rounded ${usuario.confirmed ? "bg-green-200 text-green-800" : "bg-red-200 text-red-800"}`}>
            {usuario.confirmed ? "Sí" : "No"}
          </span>
        </div>
        <div>
          <p className="text-sm text-gray-500">Bloqueado</p>
          <span className={`inline-block px-2 py-1 text-sm font-medium rounded ${usuario.blocked ? "bg-red-200 text-red-800" : "bg-green-200 text-green-800"}`}>
            {usuario.blocked ? "Sí" : "No"}
          </span>
        </div>
        <div>
          <p className="text-sm text-gray-500">Creado</p>
          <p className="font-medium text-lg">{new Date(usuario.createdAt).toLocaleString()}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Última actualización</p>
          <p className="font-medium text-lg">{new Date(usuario.updatedAt).toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
}
