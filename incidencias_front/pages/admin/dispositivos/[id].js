import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { ArrowLeft, Plus, Trash } from "lucide-react";

export default function VistaDispositivo() {
  const router = useRouter();
  const { id } = router.query;
  const [dispositivo, setDispositivo] = useState(null);
  const [componentes, setComponentes] = useState([]);
  const [software, setSoftware] = useState([]);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    if (id) {
      const token = localStorage.getItem("token");
      fetch(`http://localhost:1339/api/dispositivos/${id}?populate=componentes,software,user`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then((res) => res.json())
        .then((data) => {
          setDispositivo(data.data);
          setComponentes(
            data.data.attributes.componentes?.data.map((c) => ({ id: c.id, ...c.attributes })) || []
          );
          setSoftware(
            data.data.attributes.software?.data.map((s) => ({ id: s.id, ...s.attributes })) || []
          );
        });
    }
  }, [id]);

  const handleComponenteChange = (index, field, value) => {
    const nuevos = [...componentes];
    nuevos[index][field] = value;
    setComponentes(nuevos);
  };

  const handleSoftwareChange = (index, field, value) => {
    const nuevos = [...software];
    nuevos[index][field] = value;
    setSoftware(nuevos);
  };

  const eliminarComponente = async (index) => {
    const item = componentes[index];
    if (item.id) {
      const token = localStorage.getItem("token");
      await fetch(`http://localhost:1339/api/componentes/${item.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
    }
    const nuevos = [...componentes];
    nuevos.splice(index, 1);
    setComponentes(nuevos);
  };

  const eliminarSoftware = async (index) => {
    const item = software[index];
    if (item.id) {
      const token = localStorage.getItem("token");
      await fetch(`http://localhost:1339/api/softwares/${item.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
    }
    const nuevos = [...software];
    nuevos.splice(index, 1);
    setSoftware(nuevos);
  };

  const agregarComponente = () => {
    setComponentes([...componentes, { tipo_componente: "Disco_duro", descripcion: "", especificaciones: "" }]);
  };

  const agregarSoftware = () => {
    setSoftware([...software, { nombre_software: "", version: "", usuario: "", contrasena: "" }]);
  };

  const guardarCambios = async () => {
    setGuardando(true);
    const token = localStorage.getItem("token");

    try {
      for (const c of componentes) {
        const { tipo_componente, descripcion, especificaciones } = c;
        if (c.id) {
          await fetch(`http://localhost:1339/api/componentes/${c.id}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
              data: { tipo_componente, descripcion, especificaciones, publishedAt: new Date().toISOString() }
            })
          });
        } else {
          await fetch(`http://localhost:1339/api/componentes`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
              data: { tipo_componente, descripcion, especificaciones, dispositivo: id, publishedAt: new Date().toISOString() }
            })
          });
        }
      }

      for (const s of software) {
        const { nombre_software, version, usuario, contrasena } = s;
        if (s.id) {
          await fetch(`http://localhost:1339/api/softwares/${s.id}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
              data: { nombre_software, version, usuario, contrasena, publishedAt: new Date().toISOString() }
            })
          });
        } else {
          await fetch(`http://localhost:1339/api/softwares`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
              data: { nombre_software, version, usuario, contrasena, dispositivo: id, publishedAt: new Date().toISOString() }
            })
          });
        }
      }

      alert("Cambios guardados correctamente");
    } catch (error) {
      console.error("Error al guardar cambios:", error);
      alert("Error al guardar los cambios");
    } finally {
      setGuardando(false);
    }
  };

  if (!dispositivo) return <p className="p-6">Cargando dispositivo...</p>;

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
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1 text-blue-600 mb-4 hover:underline"
      >
        <ArrowLeft size={18} /> Volver
      </button>

      <h1 className="text-3xl font-semibold mb-6">Detalles del Dispositivo</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-6 rounded shadow mb-8">
        <div><p className="text-sm text-gray-500">Tipo</p><p className="font-medium text-lg">{a.tipo_dispositivo}</p></div>
        <div><p className="text-sm text-gray-500">Marca</p><p className="font-medium text-lg">{a.marca}</p></div>
        <div><p className="text-sm text-gray-500">Modelo</p><p className="font-medium text-lg">{a.modelo}</p></div>
        <div><p className="text-sm text-gray-500">Nº Serie</p><p className="font-medium text-lg">{a.numero_serie}</p></div>
        <div><p className="text-sm text-gray-500">Fecha Compra</p><p className="font-medium text-lg">{a.fecha_compra}</p></div>
        <div>
          <p className="text-sm text-gray-500">Estado</p>
          <span className={`inline-block px-2 py-1 text-sm font-medium rounded ${estadoColor[a.estado] || "bg-gray-200"}`}>
            {a.estado}
          </span>
        </div>
        <div><p className="text-sm text-gray-500">Usuario asignado</p><p className="font-medium text-lg">{usuario}</p></div>
      </div>

      <div className="mb-10">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-bold">Componentes</h2>
          <button
            onClick={agregarComponente}
            className="flex items-center gap-1 text-sm text-blue-600 hover:underline"
          >
            <Plus size={16} /> Añadir Componente
          </button>
        </div>
        {componentes.length > 0 ? (
          componentes.map((c, i) => (
            <div key={i} className="mb-4 border rounded p-4">
              <div className="flex justify-end mb-2">
                <button
                  onClick={() => eliminarComponente(i)}
                  className="text-red-600 hover:underline text-sm flex items-center gap-1"
                >
                  <Trash size={14} /> Eliminar
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-600">Tipo</label>
                  <select
                    value={c.tipo_componente || ""}
                    onChange={(e) => handleComponenteChange(i, "tipo_componente", e.target.value)}
                    className="w-full p-2 border rounded"
                  >
                    <option value="Disco_duro">Disco duro</option>
                    <option value="Memoria_ram">Memoria RAM</option>
                    <option value="Procesador">Procesador</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Descripción</label>
                  <input
                    type="text"
                    value={c.descripcion || ""}
                    onChange={(e) => handleComponenteChange(i, "descripcion", e.target.value)}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm text-gray-600">Especificaciones</label>
                  <input
                    type="text"
                    value={c.especificaciones || ""}
                    onChange={(e) => handleComponenteChange(i, "especificaciones", e.target.value)}
                    className="w-full p-2 border rounded"
                  />
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-gray-500">No tiene componentes</p>
        )}
      </div>

      <div className="mb-10">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-bold">Software</h2>
          <button
            onClick={agregarSoftware}
            className="flex items-center gap-1 text-sm text-blue-600 hover:underline"
          >
            <Plus size={16} /> Añadir Software
          </button>
        </div>
        {software.length > 0 ? (
          software.map((s, i) => (
            <div key={i} className="mb-4 border rounded p-4">
              <div className="flex justify-end mb-2">
                <button
                  onClick={() => eliminarSoftware(i)}
                  className="text-red-600 hover:underline text-sm flex items-center gap-1"
                >
                  <Trash size={14} /> Eliminar
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-600">Nombre</label>
                  <input
                    type="text"
                    value={s.nombre_software || ""}
                    onChange={(e) => handleSoftwareChange(i, "nombre_software", e.target.value)}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600">Versión</label>
                  <input
                    type="text"
                    value={s.version || ""}
                    onChange={(e) => handleSoftwareChange(i, "version", e.target.value)}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600">Usuario</label>
                  <input
                    type="text"
                    value={s.usuario || ""}
                    onChange={(e) => handleSoftwareChange(i, "usuario", e.target.value)}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600">Contraseña</label>
                  <input
                    type="text"
                    value={s.contrasena || ""}
                    onChange={(e) => handleSoftwareChange(i, "contrasena", e.target.value)}
                    className="w-full p-2 border rounded"
                  />
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-gray-500">No tiene software instalado</p>
        )}
      </div>

      <button
        onClick={guardarCambios}
        disabled={guardando}
        className={`px-6 py-2 rounded font-semibold text-white ${
          guardando ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
        }`}
      >
        {guardando ? "Guardando..." : "Guardar Cambios"}
      </button>
    </div>
  );
}
