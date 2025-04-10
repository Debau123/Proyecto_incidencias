import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

export default function NuevaIncidencia() {
  const router = useRouter();
  const { dispositivoId } = router.query;

  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [imagen, setImagen] = useState(null);
  const [mensaje, setMensaje] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));

    if (!user || !token) {
      alert('Debes iniciar sesión');
      return;
    }

    const formData = new FormData();
    formData.append('data', JSON.stringify({
      titulo,
      descripcion,
      estado: 'abierta',
      fecha_creacion: new Date().toISOString(),
      user: user.id,
      dispositivo: dispositivoId,
    }));

    if (imagen) {
      formData.append('files.imagen', imagen);
    }

    try {
      const res = await fetch('http://localhost:1339/api/incidencias', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const result = await res.json();

      if (res.ok) {
        await fetch(`http://localhost:1339/api/dispositivos/${dispositivoId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            data: { estado: 'averiado' },
          }),
        });

        setMensaje('✅ Incidencia creada correctamente');
        setTimeout(() => router.push('/usuario'), 1500);
      } else {
        console.error(result);
        alert('❌ Error al crear la incidencia');
      }
    } catch (err) {
      console.error('Error al enviar la incidencia', err);
    }
  };

  return (
    <div className="p-6 bg-white min-h-screen text-gray-800">
      <div className="max-w-xl mx-auto bg-gray-50 p-6 rounded shadow border border-gray-200">
        <h1 className="text-2xl font-semibold mb-6">📩 Nueva Incidencia</h1>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block font-medium mb-1">Título</label>
            <input
              type="text"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              required
              className="w-full border rounded px-3 py-2 bg-white text-gray-800"
            />
          </div>

          <div>
            <label className="block font-medium mb-1">Descripción</label>
            <textarea
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              required
              rows={4}
              className="w-full border rounded px-3 py-2 bg-white text-gray-800 resize-y"
            />
          </div>

          <div>
            <label className="block font-medium mb-1">Imagen (opcional)</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImagen(e.target.files[0])}
              className="w-full border rounded px-3 py-2 bg-white text-gray-800"
            />
          </div>

          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-semibold"
          >
            Crear Incidencia
          </button>

          {mensaje && (
            <p className="mt-4 text-green-700 font-medium">{mensaje}</p>
          )}
        </form>
      </div>
    </div>
  );
}
