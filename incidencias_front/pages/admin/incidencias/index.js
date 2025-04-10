import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Search, Eye } from "lucide-react";

export default function AdminIncidencias() {
  const [incidencias, setIncidencias] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const router = useRouter();

  useEffect(() => {
    fetchIncidencias();
  }, []);

  const fetchIncidencias = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch("http://localhost:1339/api/incidencias?populate=user,dispositivo", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      setIncidencias(data.data || []);
    } catch (error) {
      console.error("Error al cargar incidencias:", error);
    }
  };

  const filtrarIncidencias = () => {
    return incidencias.filter((i) => {
      const a = i.attributes;
      const usuario = a.user?.data?.attributes?.username || "";
      const dispositivo = a.dispositivo?.data?.attributes?.modelo || "";
      const texto = [a.titulo, a.estado, usuario, dispositivo].join(" ").toLowerCase();
      return texto.includes(busqueda.toLowerCase());
    });
  };

  const abiertasOEnProgreso = filtrarIncidencias().filter((i) =>
    ["abierta", "en_progreso"].includes(i.attributes.estado)
  );

  const cerradas = filtrarIncidencias().filter((i) => i.attributes.estado === "resuelta");

  const estadoColor = {
    abierta: "bg-yellow-100 text-yellow-800",
    en_progreso: "bg-blue-100 text-blue-800",
    resuelta: "bg-green-100 text-green-800",
  };

  const TablaIncidencias = ({ titulo, datos }) => (
    <div className="mb-10">
      <h2 className="text-xl font-semibold mb-2">{titulo}</h2>
      <div className="overflow-x-auto border border-gray-300 rounded shadow">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 border-b text-left">Título</th>
              <th className="px-4 py-2 border-b text-left">Estado</th>
              <th className="px-4 py-2 border-b text-left">Usuario</th>
              <th className="px-4 py-2 border-b text-left">Dispositivo</th>
              <th className="px-4 py-2 border-b text-left">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {datos.map((i) => {
              const a = i.attributes;
              const usuario = a.user?.data?.attributes?.username || "-";
              const dispositivo = a.dispositivo?.data?.attributes?.modelo || "-";
              return (
                <tr key={i.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-2 text-left">{a.titulo}</td>
                  <td className="px-4 py-2 text-left">
                    <span className={`inline-block px-2 py-1 text-xs rounded font-medium ${estadoColor[a.estado] || "bg-gray-200"}`}>
                      {a.estado}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-left">{usuario}</td>
                  <td className="px-4 py-2 text-left">{dispositivo}</td>
                  <td className="px-4 py-2 text-left">
                    <button
                      onClick={() => router.push(`/admin/incidencias/${i.id}`)}
                      className="flex items-center gap-1 text-blue-600 hover:underline text-sm"
                    >
                      <Eye size={16} /> Ver
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="p-6 bg-white text-gray-800 min-h-screen">
      <h1 className="text-3xl font-semibold mb-6">Gestión de Incidencias</h1>

      {/* 🔍 Barra de búsqueda */}
      <div className="flex items-center gap-2 mb-6">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Buscar por título, estado, usuario o dispositivo..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
      </div>

      {/* Tablas separadas */}
      <TablaIncidencias titulo="Incidencias Abiertas / En Progreso" datos={abiertasOEnProgreso} />
      <TablaIncidencias titulo="Incidencias Cerradas" datos={cerradas} />
    </div>
  );
}
