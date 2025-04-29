// Vista técnico organizada tipo admin con disposición visual y respuestas anidadas
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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
    return {
      abierta: "bg-yellow-200 text-yellow-800",
      en_progreso: "bg-blue-200 text-blue-800",
      resuelta: "bg-green-200 text-green-800",
    }[estado] || "bg-gray-200 text-gray-800";
  };

  const handleEstadoChange = async () => {
    const token = localStorage.getItem("token");
    const incidenciaId = incidencia.id;
    const dispositivoId = incidencia.attributes.dispositivo?.data?.id;

    await fetch(`http://localhost:1339/api/incidencias/${incidenciaId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ data: { estado: nuevoEstado } }),
    });

    if (archivo) {
      const formData = new FormData();
      formData.append("files", archivo);
      formData.append("ref", "api::incidencia.incidencia");
      formData.append("refId", incidenciaId);
      formData.append("field", "imagen");

      await fetch("http://localhost:1339/api/upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
    }

    if (dispositivoId) {
      const nuevoEstadoDispositivo =
        nuevoEstado === "resuelta"
          ? "operativo"
          : nuevoEstado === "en_progreso"
          ? "mantenimiento"
          : null;

      if (nuevoEstadoDispositivo) {
        await fetch(`http://localhost:1339/api/dispositivos/${dispositivoId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ data: { estado: nuevoEstadoDispositivo } }),
        });
      }
    }

    router.push("/tecnico");
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImagenes(files);
    setPreviews(files.map(file => URL.createObjectURL(file)));
  };

  const handleComentario = async (e, parent = null) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    const content = parent ? respuestas[parent]?.text : nuevoComentario;
    const files = parent ? respuestas[parent]?.files || [] : imagenes;

    const formData = new FormData();
    formData.append("data", JSON.stringify({
      contenido: content,
      user: user.id,
      incidencia: id,
      parent: parent || null,
    }));
    files.forEach((img) => formData.append("files.imagen", img));

    await fetch("http://localhost:1339/api/comentarios", {
      method: "POST",
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

    const res = await fetch(
      `http://localhost:1339/api/comentarios?filters[incidencia][id][$eq]=${id}&populate=imagen,user,parent`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const data = await res.json();
    setComentarios(data.data);
  };

  const renderComentarios = (comentarios, parentId = null, nivel = 0) => {
    return comentarios
      .filter(c => (c.attributes.parent?.data?.id || null) === parentId)
      .map(c => {
        const respuesta = respuestas[c.id] || { text: '', files: [], previews: [], open: false };
        const visible = mostrarRespuestas[c.id];
        return (
          <div key={c.id} className="border rounded p-4 mb-2" style={{ marginLeft: `${nivel * 2}rem` }}>
            <p className="text-sm text-gray-600">
              <strong className="text-gray-800">{c.attributes.user?.data?.attributes?.username}:</strong> {c.attributes.contenido}
            </p>
            <p className="text-xs text-gray-400">{new Date(c.attributes.createdAt).toLocaleString()}</p>
            <div className="mt-2 flex gap-4">
              <button onClick={() => setRespuestas(prev => ({ ...prev, [c.id]: { ...respuesta, open: !respuesta.open } }))} className="text-blue-600 text-sm">Responder</button>
              {comentarios.some(com => com.attributes.parent?.data?.id === c.id) && (
                <button onClick={() => setMostrarRespuestas(prev => ({ ...prev, [c.id]: !prev[c.id] }))} className="text-green-600 text-sm">
                  {visible ? 'Ocultar respuestas' : 'Ver respuestas'}
                </button>
              )}
            </div>
            {respuesta.open && (
              <form onSubmit={(e) => handleComentario(e, c.id)} className="mt-2 space-y-2">
                <textarea value={respuesta.text} onChange={(e) => setRespuestas(prev => ({ ...prev, [c.id]: { ...respuesta, text: e.target.value } }))} className="w-full p-2 border rounded" required />
                <input type="file" multiple onChange={(e) => {
                  const files = Array.from(e.target.files);
                  const previews = files.map(f => URL.createObjectURL(f));
                  setRespuestas(prev => ({ ...prev, [c.id]: { ...respuesta, files, previews } }));
                }} />
                <div className="flex gap-2">
                  {respuesta.previews?.map((src, idx) => (
                    <img key={idx} src={src} className="w-16 h-16 object-cover rounded border" />
                  ))}
                </div>
                <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded">Enviar respuesta</button>
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

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      if (parsedUser.rol !== "tecnico") router.push(`/${parsedUser.rol}`);
    } else {
      router.push("/login");
    }
  }, []);

  useEffect(() => {
    if (id) {
      const fetchIncidencia = async () => {
        const token = localStorage.getItem("token");
        const res = await fetch(
          `http://localhost:1339/api/incidencias/${id}?populate=dispositivo,user,imagen`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const data = await res.json();
        setIncidencia(data.data);
        setNuevoEstado(data.data.attributes.estado);
      };

      const fetchComentarios = async () => {
        const token = localStorage.getItem("token");
        const res = await fetch(
          `http://localhost:1339/api/comentarios?filters[incidencia][id][$eq]=${id}&populate=imagen,user,parent`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const data = await res.json();
        setComentarios(data.data);
      };

      fetchIncidencia();
      fetchComentarios();
    }
  }, [id]);

  const attr = incidencia?.attributes;
  const disp = attr?.dispositivo?.data?.attributes;
  const usu = attr?.user?.data?.attributes;

  if (!incidencia) return <p className="text-gray-500 p-6">Cargando incidencia...</p>;

  return (
    <div className="p-8 bg-white min-h-screen text-gray-800 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Incidencia #{id}</h1>
        <button onClick={() => router.push("/tecnico")} className="flex items-center gap-2 text-sm text-gray-500 hover:underline">
          <ArrowLeft size={18} /> Volver
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <div className="md:col-span-2 space-y-2">
          <p><span className="font-semibold text-gray-700">Título:</span> {attr.titulo}</p>
          <p><span className="font-semibold text-gray-700">Descripción:</span> {attr.descripcion}</p>
          <p><span className="font-semibold text-gray-700">Usuario:</span> {usu?.username}</p>
         {/* Mostrar imágenes principales de la incidencia */}
{attr.imagen?.data && (
  <div className="flex gap-2 flex-wrap mt-4">
    {Array.isArray(attr.imagen.data) ? (
      attr.imagen.data.map((img) => (
        <img
          key={img.id}
          src={`http://localhost:1339${img.attributes.url}`}
          alt="Imagen incidencia"
          className="w-28 h-28 object-cover rounded border hover:scale-105 transition-transform duration-300"
        />
      ))
    ) : (
      <img
        src={`http://localhost:1339${attr.imagen.data.attributes.url}`}
        alt="Imagen incidencia"
        className="w-28 h-28 object-cover rounded border hover:scale-105 transition-transform duration-300"
      />
    )}
  </div>
)}

        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Estado actual</label>
            <span className={`inline-block px-2 py-1 rounded text-sm font-medium ${getEstadoColor(attr.estado)}`}>{attr.estado}</span>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cambiar estado</label>
            <select value={nuevoEstado} onChange={(e) => setNuevoEstado(e.target.value)} className="w-full p-2 border rounded">
              <option value="abierta">Abierta</option>
              <option value="en_progreso">En Progreso</option>
              <option value="resuelta">Resuelta</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Adjuntar informe</label>
            <input type="file" onChange={(e) => setArchivo(e.target.files[0])} className="w-full" />
          </div>
          <button onClick={handleEstadoChange} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded w-full">
            Guardar cambios
          </button>
        </div>
      </div>

      <section>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Comentarios</h2>
          <button
            onClick={() => setMostrarFormulario(!mostrarFormulario)}
            className="text-sm text-blue-600 hover:underline"
          >
            {mostrarFormulario ? "Cancelar" : "Añadir Comentario"}
          </button>
        </div>

        {mostrarFormulario && (
          <form onSubmit={handleComentario} className="space-y-4 mb-6">
            <textarea
              value={nuevoComentario}
              onChange={(e) => setNuevoComentario(e.target.value)}
              className="w-full border border-gray-300 rounded p-2"
              rows={4}
              placeholder="Escribe tu comentario..."
              required
            />
            <input type="file" multiple onChange={handleImageChange} />
            <div className="flex gap-2 mt-2">
              {previews.map((src, idx) => (
                <img key={idx} src={src} className="w-20 h-20 object-cover rounded border" />
              ))}
            </div>
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Enviar</button>
          </form>
        )}

        {comentarios.length === 0 ? (
          <p className="text-gray-500">No hay comentarios aún.</p>
        ) : (
          <div className="space-y-4">
            {renderComentarios(comentarios)}
          </div>
        )}
      </section>
    </div>
  );
}