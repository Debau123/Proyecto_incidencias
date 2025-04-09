import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { ArrowLeft } from "lucide-react";

export default function VistaDispositivo() {
  const router = useRouter();
  const { id } = router.query;
  const [dispositivo, setDispositivo] = useState(null);

  useEffect(() => {
    if (id) {
      fetch(`http://localhost:1339/api/dispositivos/${id}?populate=user`)
        .then((res) => res.json())
        .then((data) => {
          setDispositivo(data.data);
        });
    }
  }, [id]);

  if (!dispositivo) {
    return <p className="p-6">Cargando dispositivo...</p>;
  }

  const a = dispositivo.attributes;
  const usuario = a.user?.data?.attributes?.username || "-";
  const estadoColor = {
    operativo: "bg-green-200 text-green-800",
    averiado: "bg-red-200 text-red-800",
    mantenimiento: "bg-yellow-200 text-yellow-800",
    "fuera de servicio": "bg-gray-300 text-gray-800"
  };

  return (
    <div className="p-6 bg-white min-h-screen text-gray-800">
      <button onClick={() => router.back()} className="flex items-center gap-1 text-blue-600 mb-4 hover:underline">
        <ArrowLeft size={18} /> Volver
      </button>
      <h1 className="text-3xl font-semibold mb-6">Detalles del Dispositivo</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-6 rounded shadow">
        <div>
          <p className="text-sm text-gray-500">Tipo</p>
          <p className="font-medium text-lg">{a.tipo_dispositivo}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Marca</p>
          <p className="font-medium text-lg">{a.marca}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Modelo</p>
          <p className="font-medium text-lg">{a.modelo}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Nº Serie</p>
          <p className="font-medium text-lg">{a.numero_serie}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Fecha Compra</p>
          <p className="font-medium text-lg">{a.fecha_compra}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Estado</p>
          <span className={`inline-block px-2 py-1 text-sm font-medium rounded ${estadoColor[a.estado] || "bg-gray-200"}`}>
            {a.estado}
          </span>
        </div>
        <div>
          <p className="text-sm text-gray-500">Usuario asignado</p>
          <p className="font-medium text-lg">{usuario}</p>
        </div>
      </div>
    </div>
  );
}
