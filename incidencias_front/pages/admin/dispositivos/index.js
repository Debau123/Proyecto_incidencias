import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Search, Eye, Pencil, Trash, UserPlus } from "lucide-react";

export default function AdminDispositivos() {
  const [dispositivos, setDispositivos] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [editandoId, setEditandoId] = useState(null);
  const [formulario, setFormulario] = useState({ marca: "", modelo: "", numero_serie: "" });
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [nuevoDispositivo, setNuevoDispositivo] = useState({
    tipo_dispositivo: "",
    marca: "",
    modelo: "",
    numero_serie: "",
    fecha_compra: "",
    estado: "operativo",
    user: ""
  });

  const router = useRouter();

  useEffect(() => {
    fetchDispositivos();
    fetchUsuarios();
  }, []);

  const fetchDispositivos = async () => {
    const res = await fetch("http://localhost:1339/api/dispositivos?populate=user");
    const data = await res.json();
    setDispositivos(data.data || []);
  };

  const fetchUsuarios = async () => {
    const token = localStorage.getItem("token");
    const res = await fetch("http://localhost:1339/api/users", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setUsuarios(data);
  };

  const estadoColor = {
    operativo: "bg-green-200 text-green-800",
    averiado: "bg-red-200 text-red-800",
    mantenimiento: "bg-yellow-200 text-yellow-800",
    "fuera de servicio": "bg-gray-300 text-gray-800"
  };

  const filtrarDispositivos = () => {
    return dispositivos.filter((d) => {
      const a = d.attributes;
      const usuario = a.user?.data?.attributes?.username || "";
      const valores = [
        a.tipo_dispositivo,
        a.estado,
        a.marca,
        a.modelo,
        a.numero_serie,
        usuario
      ].join(" ").toLowerCase();
      return valores.includes(busqueda.toLowerCase());
    });
  };

  const iniciarEdicion = (d) => {
    setEditandoId(d.id);
    setFormulario({
      marca: d.attributes.marca,
      modelo: d.attributes.modelo,
      numero_serie: d.attributes.numero_serie,
    });
  };

  const guardarEdicion = async (id) => {
    const token = localStorage.getItem("token");
    await fetch(`http://localhost:1339/api/dispositivos/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ data: formulario }),
    });
    setEditandoId(null);
    fetchDispositivos();
  };

  const eliminarDispositivo = async (id) => {
    if (!window.confirm("¿Eliminar este dispositivo?")) return;
    const token = localStorage.getItem("token");
    await fetch(`http://localhost:1339/api/dispositivos/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    fetchDispositivos();
  };

  const crearDispositivo = async () => {
    const token = localStorage.getItem("token");
    const res = await fetch("http://localhost:1339/api/dispositivos", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        data: {
          ...nuevoDispositivo,
          user: nuevoDispositivo.user || null,
        },
      }),
    });
    if (res.ok) {
      alert("✅ Dispositivo creado correctamente");
      setNuevoDispositivo({ tipo_dispositivo: "", marca: "", modelo: "", numero_serie: "", fecha_compra: "", estado: "operativo", user: "" });
      setMostrarFormulario(false);
      fetchDispositivos();
    } else {
      alert("❌ Error al crear dispositivo");
    }
  };

  return (
    <div className="p-6 bg-white text-gray-800 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-semibold">Gestión de Dispositivos</h1>
        <button
          onClick={() => setMostrarFormulario(!mostrarFormulario)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm"
        >
          <UserPlus size={18} /> {mostrarFormulario ? "Cancelar" : "Crear Dispositivo"}
        </button>
      </div>

      {mostrarFormulario && (
        <div className="bg-gray-50 p-6 rounded shadow mb-6">
          <h2 className="text-lg font-semibold mb-4">Crear nuevo dispositivo</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <select name="tipo_dispositivo" value={nuevoDispositivo.tipo_dispositivo} onChange={(e) => setNuevoDispositivo({ ...nuevoDispositivo, tipo_dispositivo: e.target.value })} className="p-2 border rounded">
              <option value="">Seleccionar tipo</option>
              <option value="Portatil">Portátil</option>
              <option value="Movil">Móvil</option>
              <option value="Ordenador">Ordenador</option>
              <option value="Pantalla">Pantalla</option>
              <option value="Sai">SAI</option>
            </select>
            <input type="text" name="marca" placeholder="Marca" value={nuevoDispositivo.marca} onChange={(e) => setNuevoDispositivo({ ...nuevoDispositivo, marca: e.target.value })} className="p-2 border rounded" />
            <input type="text" name="modelo" placeholder="Modelo" value={nuevoDispositivo.modelo} onChange={(e) => setNuevoDispositivo({ ...nuevoDispositivo, modelo: e.target.value })} className="p-2 border rounded" />
            <input type="text" name="numero_serie" placeholder="Nº de Serie" value={nuevoDispositivo.numero_serie} onChange={(e) => setNuevoDispositivo({ ...nuevoDispositivo, numero_serie: e.target.value })} className="p-2 border rounded" />
            <input type="date" name="fecha_compra" value={nuevoDispositivo.fecha_compra} onChange={(e) => setNuevoDispositivo({ ...nuevoDispositivo, fecha_compra: e.target.value })} className="p-2 border rounded" />
            <select name="estado" value={nuevoDispositivo.estado} onChange={(e) => setNuevoDispositivo({ ...nuevoDispositivo, estado: e.target.value })} className="p-2 border rounded">
              <option value="operativo">Operativo</option>
              <option value="averiado">Averiado</option>
              <option value="mantenimiento">Mantenimiento</option>
              <option value="fuera de servicio">Fuera de servicio</option>
            </select>
            <select name="user" value={nuevoDispositivo.user} onChange={(e) => setNuevoDispositivo({ ...nuevoDispositivo, user: e.target.value })} className="p-2 border rounded">
              <option value="">Sin usuario</option>
              {usuarios.map((u) => (
                <option key={u.id} value={u.id}>{u.username}</option>
              ))}
            </select>
          </div>
          <button onClick={crearDispositivo} className="mt-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
            Crear Dispositivo
          </button>
        </div>
      )}

      {/* 🔍 Barra de búsqueda a ancho completo */}
      <div className="flex items-center gap-2 mb-6">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Buscar por tipo, marca, serie, usuario..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* 🧾 Tabla de dispositivos */}
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm border border-gray-300">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="px-4 py-2 border-b">Tipo</th>
              <th className="px-4 py-2 border-b">Marca</th>
              <th className="px-4 py-2 border-b">Modelo</th>
              <th className="px-4 py-2 border-b">Nº Serie</th>
              <th className="px-4 py-2 border-b">Fecha Compra</th>
              <th className="px-4 py-2 border-b">Estado</th>
              <th className="px-4 py-2 border-b">Usuario</th>
              <th className="px-4 py-2 border-b">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtrarDispositivos().map((d) => {
              const a = d.attributes;
              const usuario = a.user?.data?.attributes?.username || "-";
              const editando = editandoId === d.id;
              return (
                <tr key={d.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-2">{a.tipo_dispositivo}</td>
                  <td className="px-4 py-2">
                    {editando ? (
                      <input className="border rounded px-2 py-1 w-full" value={formulario.marca} onChange={(e) => setFormulario({ ...formulario, marca: e.target.value })} />
                    ) : (
                      a.marca
                    )}
                  </td>
                  <td className="px-4 py-2">
                    {editando ? (
                      <input className="border rounded px-2 py-1 w-full" value={formulario.modelo} onChange={(e) => setFormulario({ ...formulario, modelo: e.target.value })} />
                    ) : (
                      a.modelo
                    )}
                  </td>
                  <td className="px-4 py-2">
                    {editando ? (
                      <input className="border rounded px-2 py-1 w-full" value={formulario.numero_serie} onChange={(e) => setFormulario({ ...formulario, numero_serie: e.target.value })} />
                    ) : (
                      a.numero_serie
                    )}
                  </td>
                  <td className="px-4 py-2">{a.fecha_compra}</td>
                  <td className="px-4 py-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded ${estadoColor[a.estado] || "bg-gray-200"}`}>
                      {a.estado}
                    </span>
                  </td>
                  <td className="px-4 py-2">{usuario}</td>
                  <td className="px-4 py-2 flex gap-2 flex-wrap">
                    {editando ? (
                      <>
                        <button onClick={() => guardarEdicion(d.id)} className="text-green-600 hover:underline text-sm">Guardar</button>
                        <button onClick={() => setEditandoId(null)} className="text-gray-500 hover:underline text-sm">Cancelar</button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => router.push(`/admin/dispositivos/${d.id}`)} className="flex items-center gap-1 text-blue-600 hover:underline text-sm">
                          <Eye size={16} /> Ver
                        </button>
                        <button onClick={() => iniciarEdicion(d)} className="flex items-center gap-1 text-yellow-600 hover:underline text-sm">
                          <Pencil size={16} /> Editar
                        </button>
                        <button onClick={() => eliminarDispositivo(d.id)} className="flex items-center gap-1 text-red-600 hover:underline text-sm">
                          <Trash size={16} /> Eliminar
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
