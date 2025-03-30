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
      estado: 'abierta', // ← fijo
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
        // ✅ Ahora actualizamos el dispositivo a estado averiado
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
    <div style={{ padding: '2rem', color: 'white' }}>
      <h1>Nueva Incidencia</h1>
      <form onSubmit={handleSubmit} style={{ maxWidth: '600px' }}>
        <div style={{ marginBottom: '1rem' }}>
          <label>Título:</label>
          <input
            type="text"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            required
            style={inputStyle}
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label>Descripción:</label>
          <textarea
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            required
            rows={4}
            style={{ ...inputStyle, resize: 'vertical' }}
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label>Imagen (opcional):</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImagen(e.target.files[0])}
            style={inputStyle}
          />
        </div>

        <button
          type="submit"
          style={{
            background: '#3b82f6',
            color: 'white',
            padding: '0.75rem 1.5rem',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 'bold',
          }}
        >
          Crear Incidencia
        </button>

        {mensaje && <p style={{ marginTop: '1rem' }}>{mensaje}</p>}
      </form>
    </div>
  );
}

const inputStyle = {
  width: '100%',
  padding: '0.5rem',
  borderRadius: '6px',
  border: '1px solid #444',
  backgroundColor: '#1f2937',
  color: 'white',
  fontSize: '1rem',
};
