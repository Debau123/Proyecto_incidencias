import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function DetalleIncidencia() {
  const router = useRouter();
  const { id } = router.query;

  const [incidencia, setIncidencia] = useState(null);
  const [comentarios, setComentarios] = useState([]);
  const [nuevoComentario, setNuevoComentario] = useState('');
  const [imagenes, setImagenes] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [respuestas, setRespuestas] = useState({});
  const [mostrarRespuestas, setMostrarRespuestas] = useState({});
  const [user, setUser] = useState(null);

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'abierta': return 'bg-yellow-500';
      case 'en_progreso': return 'bg-blue-500';
      case 'resuelta': return 'bg-green-600';
      default: return 'bg-gray-500';
    }
  };

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  useEffect(() => {
    if (!id) return;
    const token = localStorage.getItem('token');

    const fetchIncidencia = async () => {
      const res = await fetch(`http://localhost:1339/api/incidencias/${id}?populate=dispositivo,imagen`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setIncidencia(data.data?.attributes || null);
    };

    fetchIncidencia();
    fetchComentarios();
  }, [id]);

  const fetchComentarios = async () => {
    const token = localStorage.getItem('token');
    const res = await fetch(
      `http://localhost:1339/api/comentarios?filters[incidencia][id][$eq]=${id}&populate[imagen]=*&populate[user]=*&populate[parent]=*`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const data = await res.json();
    setComentarios(data.data);
  };

  const handleComentario = async (e, parent = null) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));

    const content = parent ? respuestas[parent]?.text : nuevoComentario;
    const files = parent ? respuestas[parent]?.files || [] : imagenes;

    const formData = new FormData();
    formData.append('data', JSON.stringify({
      contenido: content,
      user: user.id,
      incidencia: id,
      parent: parent || null
    }));
    files.forEach((img) => formData.append('files.imagen', img));

    await fetch('http://localhost:1339/api/comentarios', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });

    if (parent) {
      setRespuestas(prev => ({ ...prev, [parent]: { text: '', files: [], previews: [], open: false } }));
    } else {
      setNuevoComentario('');
      setImagenes([]);
      setPreviews([]);
      setMostrarFormulario(false);
    }
    await fetchComentarios();
  };

  const eliminarComentario = async (comentarioId) => {
    const token = localStorage.getItem('token');
    const confirmado = window.confirm('¿Eliminar este comentario?');
    if (!confirmado) return;

    await fetch(`http://localhost:1339/api/comentarios/${comentarioId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });

    await fetchComentarios();
  };

  const eliminarIncidencia = async () => {
    const confirmado = window.confirm('¿Estás seguro de que quieres eliminar esta incidencia?');
    if (!confirmado) return;

    const token = localStorage.getItem('token');
    await fetch(`http://localhost:1339/api/incidencias/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });

    router.push('/usuario');
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImagenes(files);
    const previewUrls = files.map(file => URL.createObjectURL(file));
    setPreviews(previewUrls);
  };

  const renderComentarios = (comentarios, parentId = null, nivel = 0) => {
    return comentarios
      .filter(c => (c.attributes.parent?.data?.id || null) === parentId)
      .map(c => {
        const respuesta = respuestas[c.id] || { text: '', files: [], previews: [], open: false };
        const visible = mostrarRespuestas[c.id];

        return (
          <div key={c.id} className={`ml-${nivel * 4} mb-4 bg-gray-100 p-4 rounded border border-gray-300`}>
            <p className="mb-1">
              <span className="font-semibold text-blue-600">
                {c.attributes.user?.data?.attributes?.username ?? 'Usuario'}
              </span>: {c.attributes.contenido}
            </p>
            <p className="text-xs text-gray-500 mb-2">{new Date(c.attributes.createdAt).toLocaleString()}</p>

            {Array.isArray(c.attributes.imagen?.data) && (
              <div className="flex gap-2">
                {c.attributes.imagen.data.map((img, idx) => (
                  <img key={idx} src={`http://localhost:1339${img.attributes.url}`} alt="img" className="w-20 rounded" />
                ))}
              </div>
            )}

            <div className="flex gap-4 text-sm mt-2">
              <button onClick={() => setRespuestas(prev => ({ ...prev, [c.id]: { ...respuesta, open: !respuesta.open } }))} className="text-blue-600 hover:underline">Responder</button>
              {comentarios.some(com => com.attributes.parent?.data?.id === c.id) && (
                <button onClick={() => setMostrarRespuestas(prev => ({ ...prev, [c.id]: !prev[c.id] }))} className="text-green-600 hover:underline">
                  {visible ? 'Ocultar respuestas' : 'Ver respuestas'}
                </button>
              )}
              {user?.id === c.attributes.user?.data?.id && (
                <button onClick={() => eliminarComentario(c.id)} className="text-red-600 hover:underline">Eliminar</button>
              )}
            </div>

            {respuesta.open && (
              <form onSubmit={(e) => handleComentario(e, c.id)} className="mt-3 space-y-3">
                <textarea
                  placeholder="Escribe una respuesta..."
                  value={respuesta.text}
                  onChange={(e) => setRespuestas(prev => ({ ...prev, [c.id]: { ...respuesta, text: e.target.value } }))}
                  required rows={3}
                  className="w-full border rounded px-3 py-2"
                />
                <input type="file" accept="image/*" multiple onChange={(e) => {
                  const files = Array.from(e.target.files);
                  const previews = files.map(f => URL.createObjectURL(f));
                  setRespuestas(prev => ({ ...prev, [c.id]: { ...respuesta, files, previews } }));
                }} />
                <div className="flex gap-2">
                  {respuesta.previews?.map((src, idx) => (
                    <img key={idx} src={src} alt={`preview-${idx}`} className="w-16 rounded" />
                  ))}
                </div>
                <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded font-semibold">Enviar Respuesta</button>
              </form>
            )}

            <AnimatePresence initial={false}>
              {visible && (
                <motion.div key={`respuestas-${c.id}`} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3 }}>
                  {renderComentarios(comentarios, c.id, nivel + 1)}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      });
  };

  if (!incidencia) return <p className="p-6 text-gray-500">Cargando incidencia...</p>;

  const dispositivo = incidencia.dispositivo?.data?.attributes;
  const imagenUrl = incidencia.imagen?.data?.attributes?.url;

  return (
    <div className="p-6 bg-white min-h-screen text-gray-800">
      <div className="max-w-3xl mx-auto bg-gray-50 p-6 rounded shadow border border-gray-200">
        <h1 className="text-2xl font-bold mb-4">{incidencia.titulo}</h1>
        <div className="space-y-3">
          <p><strong>Descripción:</strong> {incidencia.descripcion}</p>
          <p className="flex items-center gap-2">
            <strong>Estado:</strong>
            <span className={`text-xs px-2 py-1 rounded font-medium text-white ${getEstadoColor(incidencia.estado)}`}>
              {incidencia.estado.replace('_', ' ')}
            </span>
          </p>
          <p><strong>Fecha de creación:</strong> {new Date(incidencia.fecha_creacion).toLocaleString()}</p>
          {dispositivo && (
            <p><strong>Dispositivo:</strong>{' '}
              <a href={`/dispositivo/${incidencia.dispositivo.data.id}`} className="text-blue-600 hover:underline">
                {dispositivo.tipo_dispositivo} - {dispositivo.modelo}
              </a>
            </p>
          )}
          {imagenUrl && (
            <div className="mt-4">
              <img src={`http://localhost:1339${imagenUrl}`} alt="Imagen incidencia" className="rounded max-w-md" />
            </div>
          )}
          <div className="flex flex-wrap gap-4 mt-6">
            <button onClick={() => setMostrarFormulario(!mostrarFormulario)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-semibold">
              {mostrarFormulario ? 'Cancelar' : 'Añadir Comentario'}
            </button>
            <button onClick={eliminarIncidencia} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded font-semibold">
              Eliminar Incidencia
            </button>
          </div>
        </div>

        {mostrarFormulario && (
          <form onSubmit={(e) => handleComentario(e)} className="mt-6 bg-white p-4 border border-gray-300 rounded space-y-4">
            <textarea
              placeholder="Escribe un comentario..."
              value={nuevoComentario}
              onChange={(e) => setNuevoComentario(e.target.value)}
              required
              rows={4}
              className="w-full border rounded px-3 py-2"
            />
            <input type="file" accept="image/*" multiple onChange={handleImageChange} />
            <div className="flex gap-2 flex-wrap">
              {previews.map((src, idx) => (
                <img key={idx} src={src} alt={`preview-${idx}`} className="w-20 rounded" />
              ))}
            </div>
            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-semibold">
              Enviar Comentario
            </button>
          </form>
        )}
      </div>

      <div className="max-w-3xl mx-auto mt-10">
        <h2 className="text-xl font-bold mb-4">Comentarios</h2>
        {comentarios.length === 0 ? <p className="text-gray-500">No hay comentarios aún.</p> : renderComentarios(comentarios)}
      </div>
    </div>
  );
}
