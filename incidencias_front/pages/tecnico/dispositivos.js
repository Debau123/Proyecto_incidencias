// pages/tecnico/dispositivos.js
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function VistaDispositivos() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [dispositivos, setDispositivos] = useState([]);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      if (parsedUser.rol !== 'tecnico') router.push(`/${parsedUser.rol}`);
    } else {
      router.push('/login');
    }
  }, []);

  useEffect(() => {
    const fetchDispositivos = async () => {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:1339/api/dispositivos?populate=user', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setDispositivos(data.data);
    };

    fetchDispositivos();
  }, []);

  const handleEstadoChange = async (id, nuevoEstado) => {
    const token = localStorage.getItem('token');
    await fetch(`http://localhost:1339/api/dispositivos/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        data: {
          estado: nuevoEstado,
        },
      }),
    });
    setDispositivos((prev) =>
      prev.map((d) => (d.id === id ? { ...d, attributes: { ...d.attributes, estado: nuevoEstado } } : d))
    );
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
        return 'text-gray-300';
    }
  };

  return (
    <div className="p-8 bg-gray-900 min-h-screen text-white">
      <h1 className="text-4xl font-extrabold mb-8 text-center">Listado de Dispositivos</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {dispositivos.map((d) => {
          const { tipo_dispositivo, modelo, estado } = d.attributes;
          const nombreUsuario = d.attributes.user?.data?.attributes?.username || 'Sin usuario';
          return (
            <div key={d.id} className="bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-2xl transition-shadow">
              <Link href={`/tecnico/dispositivo/${d.id}`}>
                <h2 className="text-xl font-bold text-blue-400 hover:underline mb-2 cursor-pointer">
                  {tipo_dispositivo} - {modelo}
                </h2>
              </Link>
              <p className="text-sm text-gray-400 mb-4">Asignado a: <span className="text-white">{nombreUsuario}</span></p>
              <div className="flex flex-col gap-2">
                <label className="text-sm text-gray-300 font-medium">Estado actual:</label>
                <select
                  className={`rounded px-3 py-2 bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 ${estadoColor(estado)}`}
                  value={estado}
                  onChange={(e) => handleEstadoChange(d.id, e.target.value)}
                >
                  <option value="operativo">Operativo</option>
                  <option value="averiado">Averiado</option>
                  <option value="mantenimiento">Mantenimiento</option>
                  <option value="fuera de servicio">Fuera de servicio</option>
                </select>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
