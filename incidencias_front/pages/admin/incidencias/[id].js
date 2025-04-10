import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";

export default function DetalleIncidencia() {
  const router = useRouter();
  const { id } = router.query;
  const [incidencia, setIncidencia] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    if (!id) return;

    const token = localStorage.getItem("token");

    const fetchIncidencia = async () => {
      try {
        const res = await fetch(`http://localhost:1339/api/incidencias/${id}?populate[user]=*&populate[dispositivo]=*&populate[imagen]=*&populate[comentarios][populate]=user`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        setIncidencia(data.data);
      } catch (error) {
        console.error("Error al obtener incidencia:", error);
      } finally {
        setCargando(false);
      }
    };

    fetchIncidencia();
  }, [id]);

  if (cargando) return <p className="p-6 text-center text-gray-500">Cargando...</p>;
  if (!incidencia) return <p className="p-6 text-center text-red-600">Incidencia no encontrada</p>;

  const a = incidencia.attributes;
  const usuario = a.user?.data?.attributes?.username || "-";
  const dispositivo = a.dispositivo?.data?.attributes?.modelo || "-";
  const comentarios = a.comentarios?.data || [];

  const estadoColor = {
    abierta: "bg-yellow-100 text-yellow-800",
    en_progreso: "bg-blue-100 text-blue-800",
    resuelta: "bg-green-100 text-green-800",
  };

  return (
    <div className="p-6 bg-white min-h-screen text-gray-800">
      <button onClick={() => router.back()} className="flex items-center gap-1 text-blue-600 mb-4 hover:underline">
        <ArrowLeft size={18} /> Volver
      </button>

      <h1 className="text-3xl font-semibold mb-6">Detalles de la Incidencia</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-6 rounded shadow">
        <div>
          <p className="text-sm text-gray-500">Título</p>
          <p className="font-medium text-lg">{a.titulo}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Estado</p>
          <span className={`inline-block px-2 py-1 text-sm font-medium rounded ${estadoColor[a.estado] || "bg-gray-200"}`}>
            {a.estado}
          </span>
        </div>
        <div>
          <p className="text-sm text-gray-500">Usuario</p>
          <p className="font-medium text-lg">{usuario}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Dispositivo</p>
          <p className="font-medium text-lg">{dispositivo}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Fecha de creación</p>
          <p className="font-medium text-lg">{new Date(a.fecha_creacion).toLocaleString()}</p>
        </div>
        <div className="md:col-span-2">
          <p className="text-sm text-gray-500">Descripción</p>
          <p className="font-medium text-base whitespace-pre-line">{a.descripcion}</p>
        </div>
        {a.imagen?.data?.attributes?.url && (
          <div className="md:col-span-2">
            <p className="text-sm text-gray-500 mb-1">Imagen adjunta</p>
            <img
              src={`http://localhost:1339${a.imagen.data.attributes.url}`}
              alt="Imagen de la incidencia"
              className="max-w-xs rounded border"
            />
          </div>
        )}
      </div>

      {/* Sección de comentarios */}
      <div className="mt-10">
        <h2 className="text-2xl font-semibold mb-4">Comentarios</h2>
        {comentarios.length > 0 ? (
          <ul className="space-y-4">
            {comentarios.map((c) => (
              <li key={c.id} className="border border-gray-200 rounded p-4 bg-gray-50">
                <div className="text-sm text-gray-600 mb-1">
                  <strong>{c.attributes.user?.data?.attributes?.username || "Anónimo"}</strong>{" "}
                  <span className="text-xs text-gray-400">
                    ({new Date(c.attributes.createdAt).toLocaleString()})
                  </span>
                </div>
                <div className="text-gray-800 text-sm">{c.attributes.contenido}</div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No hay comentarios aún.</p>
        )}
      </div>
    </div>
  );
}
