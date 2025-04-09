import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Search, Pencil, Trash, Eye } from "lucide-react";

export default function UsuariosAdminPage() {
  const [usuarios, setUsuarios] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [usuarioEditando, setUsuarioEditando] = useState(null);
  const [nuevoUsuario, setNuevoUsuario] = useState({ username: "", email: "", password: "", rol: "" });

  const router = useRouter();

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const fetchUsuarios = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch("http://localhost:1339/api/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setUsuarios(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error al cargar usuarios:", err);
    }
  };

  const crearUsuario = async () => {
    const token = localStorage.getItem("token");
    try {
      const rolesRes = await fetch("http://localhost:1339/api/users-permissions/roles", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const rolesData = await rolesRes.json();
      const authenticatedRole = rolesData.roles.find((r) => r.name === "Authenticated");

      const res = await fetch("http://localhost:1339/api/users", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: nuevoUsuario.username,
          email: nuevoUsuario.email,
          password: nuevoUsuario.password,
          role: authenticatedRole.id,
          rol: nuevoUsuario.rol,
          confirmed: true,
        }),
      });

      const data = await res.json();
      if (res.ok && data.id) {
        alert("✅ Usuario creado correctamente");
        setNuevoUsuario({ username: "", email: "", password: "", rol: "" });
        setMostrarFormulario(false);
        fetchUsuarios();
      } else {
        alert("❌ Error al crear usuario");
      }
    } catch (err) {
      console.error("Error al crear usuario:", err);
    }
  };

  const guardarEdicion = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`http://localhost:1339/api/users/${usuarioEditando.id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: usuarioEditando.username,
          email: usuarioEditando.email,
          rol: usuarioEditando.rol,
        }),
      });
      if (res.ok) {
        alert("✅ Usuario actualizado correctamente");
        setUsuarioEditando(null);
        fetchUsuarios();
      } else {
        alert("❌ Error al actualizar usuario");
      }
    } catch (err) {
      console.error("Error al actualizar usuario:", err);
    }
  };

  const eliminarUsuario = async (id) => {
    if (!window.confirm("¿Eliminar este usuario?")) return;
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`http://localhost:1339/api/users/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        alert("✅ Usuario eliminado correctamente");
        fetchUsuarios();
      } else {
        alert("❌ No se pudo eliminar el usuario");
      }
    } catch (err) {
      console.error("Error al eliminar usuario:", err);
      alert("❌ Error al eliminar el usuario");
    }
  };

  const usuariosFiltrados = usuarios.filter((u) => {
    const valores = [u.username, u.email, u.rol].join(" ").toLowerCase();
    return valores.includes(busqueda.toLowerCase());
  });

  return (
    <div className="p-6 bg-white min-h-screen text-gray-800">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-semibold">Gestión de Usuarios</h1>
        <button
          onClick={() => setMostrarFormulario(!mostrarFormulario)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {mostrarFormulario ? "Cancelar" : "Nuevo Usuario"}
        </button>
      </div>

      {mostrarFormulario && (
        <div className="bg-gray-50 p-6 rounded shadow mb-6">
          <h2 className="text-lg font-semibold mb-4">Crear nuevo usuario</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="text" name="username" placeholder="Nombre de usuario" value={nuevoUsuario.username} onChange={(e) => setNuevoUsuario({ ...nuevoUsuario, username: e.target.value })} className="p-2 border rounded" />
            <input type="email" name="email" placeholder="Correo electrónico" value={nuevoUsuario.email} onChange={(e) => setNuevoUsuario({ ...nuevoUsuario, email: e.target.value })} className="p-2 border rounded" />
            <input type="password" name="password" placeholder="Contraseña" value={nuevoUsuario.password} onChange={(e) => setNuevoUsuario({ ...nuevoUsuario, password: e.target.value })} className="p-2 border rounded" />
            <select name="rol" value={nuevoUsuario.rol} onChange={(e) => setNuevoUsuario({ ...nuevoUsuario, rol: e.target.value })} className="p-2 border rounded">
              <option value="">Seleccionar rol</option>
              <option value="administrador">Administrador</option>
              <option value="tecnico">Técnico</option>
              <option value="usuario">Usuario</option>
            </select>
          </div>
          <button onClick={crearUsuario} className="mt-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
            Crear Usuario
          </button>
        </div>
      )}

      {usuarioEditando && (
        <div className="bg-yellow-50 p-6 rounded shadow mb-6">
          <h2 className="text-lg font-semibold mb-4">Editar usuario</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="text" value={usuarioEditando.username} onChange={(e) => setUsuarioEditando({ ...usuarioEditando, username: e.target.value })} className="p-2 border rounded" />
            <input type="email" value={usuarioEditando.email} onChange={(e) => setUsuarioEditando({ ...usuarioEditando, email: e.target.value })} className="p-2 border rounded" />
            <select value={usuarioEditando.rol} onChange={(e) => setUsuarioEditando({ ...usuarioEditando, rol: e.target.value })} className="p-2 border rounded">
              <option value="">Seleccionar tipo de usuario</option>
              <option value="administrador">Administrador</option>
              <option value="tecnico">Técnico</option>
              <option value="usuario">Usuario</option>
            </select>
          </div>
          <button onClick={guardarEdicion} className="mt-4 bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700">
            Guardar Cambios
          </button>
        </div>
      )}

      {/* Búsqueda global */}
      <div className="flex items-center gap-2 mb-4">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Buscar por nombre, correo o rol..."
            className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded shadow overflow-x-auto border border-gray-300">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="px-4 py-2 border-b">ID</th>
              <th className="px-4 py-2 border-b">Usuario</th>
              <th className="px-4 py-2 border-b">Email</th>
              <th className="px-4 py-2 border-b">Rol</th>
              <th className="px-4 py-2 border-b">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {usuariosFiltrados.map((u) => (
              <tr key={u.id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-2">{u.id}</td>
                <td className="px-4 py-2">{u.username}</td>
                <td className="px-4 py-2">{u.email}</td>
                <td className="px-4 py-2 capitalize">{u.rol}</td>
                <td className="px-4 py-2 flex gap-2 flex-wrap">
                  <button onClick={() => router.push(`/admin/usuarios/${u.id}`)} className="flex items-center gap-1 text-blue-600 hover:underline">
                    <Eye size={16} /> Ver
                  </button>
                  <button onClick={() => setUsuarioEditando(u)} className="flex items-center gap-1 text-yellow-600 hover:underline">
                    <Pencil size={16} /> Editar
                  </button>
                  <button onClick={() => eliminarUsuario(u.id)} className="flex items-center gap-1 text-red-600 hover:underline">
                    <Trash size={16} /> Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
