import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function VistaDispositivos() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [dispositivos, setDispositivos] = useState([]);
  const [busqueda, setBusqueda] = useState("");

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
      prev.map((d) =>
        d.id === id
          ? { ...d, attributes: { ...d.attributes, estado: nuevoEstado } }
          : d
      )
    );
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

  // Filtrar los dispositivos según el término de búsqueda
  const filteredDispositivos = dispositivos.filter((d) => {
    const { tipo_dispositivo, modelo, marca } = d.attributes;
    const nombreUsuario =
      d.attributes.user?.data?.attributes?.username || "";
    const search = busqueda.toLowerCase();
    return (
      (tipo_dispositivo && tipo_dispositivo.toLowerCase().includes(search)) ||
      (modelo && modelo.toLowerCase().includes(search)) ||
      (marca && marca.toLowerCase().includes(search)) ||
      (nombreUsuario && nombreUsuario.toLowerCase().includes(search))
    );
  });

  return (
    <div className="min-h-screen bg-white p-6 text-gray-800">
      <h1 className="text-3xl font-semibold mb-4 text-center">Listado de Dispositivos</h1>
      <div className="mb-6">
        <input
          type="text"
          placeholder="Buscar dispositivo..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded"
        />
      </div>
      <ul className="divide-y divide-gray-200">
        {filteredDispositivos.map((d) => {
          const { tipo_dispositivo, modelo, estado } = d.attributes;
          const nombreUsuario = d.attributes.user?.data?.attributes?.username || 'Sin usuario';
          return (
            <li key={d.id} className="py-4">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div className="mb-2 md:mb-0">
                  <Link
                    href={`/tecnico/dispositivo/${d.id}`}
                    className="text-blue-600 font-medium hover:underline"
                  >
                    {tipo_dispositivo} - {modelo}
                  </Link>
                  <p className="text-sm text-gray-500">Asignado a: {nombreUsuario}</p>
                </div>
                <div className="flex flex-col md:flex-row md:items-center gap-2">
                  <label className="text-sm text-gray-600">Estado actual:</label>
                  <select
                    className={`rounded px-3 py-1 bg-white border border-gray-300 focus:outline-none text-sm ${estadoColor(estado)}`}
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
            </li>
          );
        })}
      </ul>
    </div>
  );
}
