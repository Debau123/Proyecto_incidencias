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
      case 'abierta': return '#eab308';
      case 'en_progreso': return '#3b82f6';
      case 'resuelta': return '#16a34a';
      default: return '#6b7280';
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
          <div key={c.id} style={{
            marginLeft: `${nivel * 2}rem`,
            background: '#1f2937',
            padding: '1rem',
            borderRadius: '8px',
            marginBottom: '1rem'
          }}>
            <p style={{ marginBottom: '0.3rem' }}>
              <strong style={{ color: '#3b82f6' }}>
                {c.attributes.user?.data?.attributes?.username ?? 'Usuario'}
              </strong>: {c.attributes.contenido}
            </p>
            <p style={{ fontSize: '0.8rem', color: '#9ca3af', marginBottom: '0.5rem' }}>
              {new Date(c.attributes.createdAt).toLocaleString()}
            </p>

            {Array.isArray(c.attributes.imagen?.data) &&
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {c.attributes.imagen.data.map((img, idx) => (
                  <img key={idx} src={`http://localhost:1339${img.attributes.url}`} alt="img" style={{ width: '80px', borderRadius: '6px' }} />
                ))}
              </div>
            }

            <div style={{ marginTop: '0.5rem' }}>
              <button onClick={() =>
                setRespuestas(prev => ({ ...prev, [c.id]: { ...respuesta, open: !respuesta.open } }))
              } style={{ fontSize: '0.9rem', color: '#3b82f6', background: 'none', border: 'none', cursor: 'pointer' }}>
                Responder
              </button>

              {comentarios.some(com => com.attributes.parent?.data?.id === c.id) && (
                <button onClick={() =>
                  setMostrarRespuestas(prev => ({ ...prev, [c.id]: !prev[c.id] }))
                } style={{ fontSize: '0.9rem', color: '#10b981', background: 'none', border: 'none', cursor: 'pointer', marginLeft: '1rem' }}>
                  {visible ? 'Ocultar respuestas' : 'Ver respuestas'}
                </button>
              )}

              {user?.id === c.attributes.user?.data?.id && (
                <button onClick={() => eliminarComentario(c.id)} style={{ fontSize: '0.9rem', color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', marginLeft: '1rem' }}>
                  Eliminar
                </button>
              )}
            </div>

            {respuesta.open && (
              <form onSubmit={(e) => handleComentario(e, c.id)} style={{ marginTop: '1rem' }}>
                <textarea placeholder="Escribe una respuesta..." value={respuesta.text}
                  onChange={(e) => setRespuestas(prev => ({ ...prev, [c.id]: { ...respuesta, text: e.target.value } }))}
                  required rows={3}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '6px' }}
                />
                <input type="file" accept="image/*" multiple onChange={(e) => {
                  const files = Array.from(e.target.files);
                  const previews = files.map(f => URL.createObjectURL(f));
                  setRespuestas(prev => ({ ...prev, [c.id]: { ...respuesta, files, previews } }));
                }} style={{ marginTop: '0.5rem' }} />
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                  {respuesta.previews?.map((src, idx) => (
                    <img key={idx} src={src} alt={`preview-${idx}`} style={{ width: '60px', borderRadius: '6px' }} />
                  ))}
                </div>
                <button type="submit" style={{ marginTop: '0.5rem', backgroundColor: '#3b82f6', color: 'white', padding: '0.4rem 1rem', border: 'none', borderRadius: '6px' }}>
                  Enviar Respuesta
                </button>
              </form>
            )}

            <AnimatePresence initial={false}>
              {visible && (
                <motion.div
                  key={`respuestas-${c.id}`}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
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

  if (!incidencia) return <p style={{ color: 'white', padding: '2rem' }}>Cargando incidencia...</p>;

  const dispositivo = incidencia.dispositivo?.data?.attributes;
  const imagenUrl = incidencia.imagen?.data?.attributes?.url;

  return (
    <div style={{ padding: '2rem', color: 'white' }}>
      <div style={{ background: '#1f2937', borderRadius: '12px', padding: '2rem', boxShadow: '0 0 20px rgba(0,0,0,0.3)' }}>
        <h1>{incidencia.titulo}</h1>
        <p><strong>Descripción:</strong> {incidencia.descripcion}</p>
        <p>
          <strong>Estado:</strong>{' '}
          <span style={{
            backgroundColor: getEstadoColor(incidencia.estado),
            padding: '4px 8px',
            borderRadius: '6px',
            fontWeight: 'bold'
          }}>
            {incidencia.estado.replace('_', ' ')}
          </span>
        </p>
        <p><strong>Fecha de creación:</strong> {new Date(incidencia.fecha_creacion).toLocaleString()}</p>
        {dispositivo && (
          <p><strong>Dispositivo:</strong>{' '}
            <a href={`/dispositivo/${incidencia.dispositivo.data.id}`} style={{ color: '#3b82f6' }}>
              {dispositivo.tipo_dispositivo} - {dispositivo.modelo}
            </a>
          </p>
        )}
        {imagenUrl && <img src={`http://localhost:1339${imagenUrl}`} alt="Incidencia" style={{ maxWidth: '500px', marginTop: '1rem', borderRadius: '8px' }} />}

        <button onClick={() => setMostrarFormulario(!mostrarFormulario)}
          style={{ marginTop: '2rem', backgroundColor: '#3b82f6', color: 'white', padding: '0.6rem 1.2rem', border: 'none', borderRadius: '6px' }}>
          {mostrarFormulario ? 'Cancelar' : 'Añadir Comentario'}
        </button>

        {mostrarFormulario && (
          <form onSubmit={(e) => handleComentario(e)} style={{ marginTop: '1rem', background: '#111827', padding: '1rem', borderRadius: '8px' }}>
            <textarea placeholder="Escribe un comentario..." value={nuevoComentario}
              onChange={(e) => setNuevoComentario(e.target.value)} required rows={4}
              style={{ width: '100%', padding: '0.5rem', borderRadius: '6px' }}
            />
            <label style={{
              display: 'inline-block', background: '#3b82f6',
              color: 'white', padding: '0.5rem 1rem',
              borderRadius: '6px', marginTop: '0.5rem', cursor: 'pointer'
            }}>
              Subir imágenes
              <input type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={handleImageChange} />
            </label>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '1rem' }}>
              {previews.map((src, idx) => (
                <img key={idx} src={src} alt={`preview-${idx}`} style={{ width: '80px', borderRadius: '6px' }} />
              ))}
            </div>

            <button type="submit" style={{ marginTop: '1rem', backgroundColor: '#3b82f6', color: 'white', padding: '0.6rem 1.2rem', border: 'none', borderRadius: '6px' }}>
              Enviar Comentario
            </button>
          </form>
        )}
      </div>

      <div style={{ marginTop: '3rem' }}>
        <h2>Comentarios</h2>
        {comentarios.length === 0 ? <p>No hay comentarios aún.</p> : renderComentarios(comentarios)}
      </div>
    </div>
  );
}
