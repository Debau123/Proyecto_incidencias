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

      const res = await fetch(`http://localhost:1339/api/dispositivos/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

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

  if (loading) return <p className="text-white p-6">Cargando...</p>;

  const disp = dispositivo?.attributes;

  return (
    <div className="p-6 text-white">
      <h1 className="text-3xl font-bold mb-4">{disp?.tipo_dispositivo} - {disp?.modelo}</h1>
      <p className="mb-2"><strong>Marca:</strong> {disp?.marca}</p>
      <p className="mb-2"><strong>Nº Serie:</strong> {disp?.numero_serie}</p>
      <p className="mb-2"><strong>Estado:</strong> {disp?.estado}</p>

      <label className="block mt-4 mb-1">Cambiar estado:</label>
      <select
        value={estado}
        onChange={(e) => setEstado(e.target.value)}
        className="bg-gray-700 text-white px-3 py-2 rounded"
      >
        <option value="operativo">Operativo</option>
        <option value="averiado">Averiado</option>
        <option value="mantenimiento">Mantenimiento</option>
        <option value="fuera de servicio">Fuera de servicio</option>
      </select>

      <button
        onClick={handleEstadoChange}
        className="ml-4 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded"
      >
        Guardar
      </button>
    </div>
  );
}
