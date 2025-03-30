import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';

export default function TecnicoDetalleIncidencia() {
  const router = useRouter();
  const { id } = router.query;

  const [user, setUser] = useState(null);
  const [incidencia, setIncidencia] = useState(null);
  const [comentarios, setComentarios] = useState([]);
  const [nuevoEstado, setNuevoEstado] = useState('');
  const [archivo, setArchivo] = useState(null);
  const [nuevoComentario, setNuevoComentario] = useState('');
  const [imagenes, setImagenes] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [respuestas, setRespuestas] = useState({});
  const [mostrarRespuestas, setMostrarRespuestas] = useState({});

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'abierta': return '#eab308';
      case 'en_progreso': return '#3b82f6';
      case 'resuelta': return '#16a34a';
      default: return '#6b7280';
    }
  };

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
    if (id) {
      const fetchIncidencia = async () => {
        const token = localStorage.getItem('token');
        const res = await fetch(`http://localhost:1339/api/incidencias/${id}?populate=dispositivo,user,imagen`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setIncidencia(data.data);
        setNuevoEstado(data.data.attributes.estado);
      };

      const fetchComentarios = async () => {
        const token = localStorage.getItem('token');
        const res = await fetch(
          `http://localhost:1339/api/comentarios?filters[incidencia][id][$eq]=${id}&populate[imagen]=*&populate[user]=*&populate[parent]=*`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const data = await res.json();
        setComentarios(data.data);
      };

      fetchIncidencia();
      fetchComentarios();
    }
  }, [id]);

  const handleEstadoChange = async () => {
    const token = localStorage.getItem('token');
    const incidenciaId = incidencia.id;
    const dispositivoId = incidencia.attributes.dispositivo?.data?.id;

    await fetch(`http://localhost:1339/api/incidencias/${incidenciaId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ data: { estado: nuevoEstado } }),
    });

    if (archivo) {
      const formData = new FormData();
      formData.append('files', archivo);
      formData.append('ref', 'api::incidencia.incidencia');
      formData.append('refId', incidenciaId);
      formData.append('field', 'imagen');

      await fetch('http://localhost:1339/api/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
    }

    if (dispositivoId) {
      const nuevoEstadoDispositivo =
        nuevoEstado === 'resuelta' ? 'operativo' : nuevoEstado === 'en_progreso' ? 'mantenimiento' : null;

      if (nuevoEstadoDispositivo) {
        await fetch(`http://localhost:1339/api/dispositivos/${dispositivoId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ data: { estado: nuevoEstadoDispositivo } }),
        });
      }
    }

    router.push('/tecnico');
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImagenes(files);
    setPreviews(files.map(file => URL.createObjectURL(file)));
  };

  const handleComentario = async (e, parent = null) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
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

    const fetchComentarios = async () => {
      const res = await fetch(
        `http://localhost:1339/api/comentarios?filters[incidencia][id][$eq]=${id}&populate=imagen,user,parent`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      setComentarios(data.data);
    };
    fetchComentarios();
  };

  const eliminarComentario = async (comentarioId) => {
    const token = localStorage.getItem('token');
    const confirmado = window.confirm('¿Eliminar este comentario?');
    if (!confirmado) return;

    await fetch(`http://localhost:1339/api/comentarios/${comentarioId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });

    setComentarios(prev => prev.filter(c => c.id !== comentarioId));
  };

  const renderComentarios = (comentarios, parentId = null, nivel = 0) => {
    return comentarios
      .filter(c => (c.attributes.parent?.data?.id || null) === parentId)
      .map(c => {
        const respuesta = respuestas[c.id] || { text: '', files: [], previews: [], open: false };
        const visible = mostrarRespuestas[c.id];
        return (
          <div key={c.id} className="bg-gray-700 p-4 rounded-lg mb-2" style={{ marginLeft: `${nivel * 2}rem` }}>
            <p><strong className="text-blue-400">{c.attributes.user?.data?.attributes?.username}</strong>: {c.attributes.contenido}</p>
            <p className="text-sm text-gray-400">{new Date(c.attributes.createdAt).toLocaleString()}</p>
            {Array.isArray(c.attributes.imagen?.data) && (
              <div className="flex gap-2 mt-2">
                {c.attributes.imagen.data.map((img, idx) => (
                  <img key={idx} src={`http://localhost:1339${img.attributes.url}`} className="w-20 rounded" alt="" />
                ))}
              </div>
            )}
            <div className="mt-2">
              <button onClick={() => setRespuestas(prev => ({ ...prev, [c.id]: { ...respuesta, open: !respuesta.open } }))} className="text-blue-400 text-sm mr-4">Responder</button>
              {comentarios.some(com => com.attributes.parent?.data?.id === c.id) && (
                <button onClick={() => setMostrarRespuestas(prev => ({ ...prev, [c.id]: !prev[c.id] }))} className="text-green-400 text-sm mr-4">
                  {visible ? 'Ocultar respuestas' : 'Ver respuestas'}
                </button>
              )}
              {user?.id === c.attributes.user?.data?.id && (
                <button onClick={() => eliminarComentario(c.id)} className="text-red-500 text-sm">Eliminar</button>
              )}
            </div>
            {respuesta.open && (
              <form onSubmit={(e) => handleComentario(e, c.id)} className="mt-2">
                <textarea value={respuesta.text} onChange={(e) => setRespuestas(prev => ({ ...prev, [c.id]: { ...respuesta, text: e.target.value } }))} className="w-full p-2 rounded text-black" required />
                <input type="file" multiple onChange={(e) => {
                  const files = Array.from(e.target.files);
                  const previews = files.map(f => URL.createObjectURL(f));
                  setRespuestas(prev => ({ ...prev, [c.id]: { ...respuesta, files, previews } }));
                }} className="mt-2" />
                <div className="flex gap-2 mt-2">
                  {respuesta.previews?.map((src, idx) => (
                    <img key={idx} src={src} className="w-16 rounded" />
                  ))}
                </div>
                <button type="submit" className="mt-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded">Enviar respuesta</button>
              </form>
            )}
            <AnimatePresence initial={false}>
              {visible && (
                <motion.div
                  key={`respuestas-${c.id}`}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {renderComentarios(comentarios, c.id, nivel + 1)}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      });
  };

  const attr = incidencia?.attributes;
  const disp = attr?.dispositivo?.data?.attributes;
  const usu = attr?.user?.data?.attributes;

  if (!incidencia) return <p className="text-white p-4">Cargando incidencia...</p>;

  return (
    <div className="p-6 text-white max-w-3xl mx-auto">
      <div className="bg-gray-800 rounded-lg shadow-md p-6 mb-6">
        <h1 className="text-3xl font-bold mb-2">{attr.titulo}</h1>
        <p className="mb-1"><strong>Descripción:</strong> {attr.descripcion}</p>
        <p className="mb-1"><strong>Usuario:</strong> {usu?.username}</p>
        <p className="mb-1"><strong>Dispositivo:</strong> {disp?.tipo_dispositivo} - {disp?.modelo}</p>
        <p className="mb-3"><strong>Estado actual:</strong> <span style={{ color: getEstadoColor(attr.estado) }}>{attr.estado}</span></p>

        <div className="mb-4">
          <label className="block mb-1">Cambiar estado:</label>
          <select value={nuevoEstado} onChange={e => setNuevoEstado(e.target.value)} className="text-black p-2 rounded w-full">
            <option value="abierta">Abierta</option>
            <option value="en_progreso">En Progreso</option>
            <option value="resuelta">Resuelta</option>
          </select>
        </div>

        <div className="mb-4">
          <label className="block mb-1">Adjuntar informe (como imagen):</label>
          <input type="file" onChange={(e) => setArchivo(e.target.files[0])} className="text-white" />
        </div>

        <button
          onClick={handleEstadoChange}
          className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-white"
        >
          Guardar cambios
        </button>
      </div>

      {/* Comentarios */}
      <div className="bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-semibold mb-4">Comentarios</h2>

        <button onClick={() => setMostrarFormulario(!mostrarFormulario)}
          className="mb-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">
          {mostrarFormulario ? 'Cancelar' : 'Añadir Comentario'}
        </button>

        {mostrarFormulario && (
          <form onSubmit={handleComentario} className="mb-4">
            <textarea value={nuevoComentario} onChange={(e) => setNuevoComentario(e.target.value)}
              className="w-full p-2 rounded text-black" required rows={4} />
            <input type="file" multiple onChange={handleImageChange} className="mt-2" />
            <div className="flex gap-2 mt-2">
              {previews.map((src, idx) => (
                <img key={idx} src={src} className="w-20 rounded" alt="preview" />
              ))}
            </div>
            <button type="submit" className="mt-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">Enviar Comentario</button>
          </form>
        )}

        {comentarios.length === 0 ? <p>No hay comentarios aún.</p> : renderComentarios(comentarios)}
      </div>
    </div>
  );
}
