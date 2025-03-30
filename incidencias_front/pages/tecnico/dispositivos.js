// pages/tecnico/dispositivos.js
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

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

  return (
    <div className="p-6 text-white">
      <h1 className="text-3xl font-bold mb-6">Dispositivos</h1>
      {dispositivos.map((d) => {
        const { tipo_dispositivo, modelo, estado } = d.attributes;
        const nombreUsuario = d.attributes.user?.data?.attributes?.username || 'Sin usuario';
        return (
          <div key={d.id} className="bg-gray-800 p-4 rounded mb-4">
            <p className="font-semibold">{tipo_dispositivo} - {modelo}</p>
            <p className="text-sm text-gray-400 mb-2">Usuario: {nombreUsuario}</p>
            <select
              className="text-black rounded px-2 py-1"
              value={estado}
              onChange={(e) => handleEstadoChange(d.id, e.target.value)}
            >
              <option value="operativo">Operativo</option>
              <option value="averiado">Averiado</option>
              <option value="mantenimiento">Mantenimiento</option>
              <option value="fuera de servicio">Fuera de servicio</option>
            </select>
          </div>
        );
      })}
    </div>
  );
}
