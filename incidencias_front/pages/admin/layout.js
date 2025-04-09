"use client";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminLayout({ children }) {
  const router = useRouter();

  const cerrarSesion = () => {
    localStorage.removeItem("jwt"); // o el nombre que estés usando
    router.push("/login");
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white p-4 space-y-4">
        <h2 className="text-xl font-bold mb-6">Panel Admin</h2>
        <nav className="space-y-2">
          <Link href="/admin/dashboard">📊 Dashboard</Link>
          <Link href="/admin/usuarios">👥 Usuarios</Link>
          <Link href="/admin/dispositivos">💻 Dispositivos</Link>
          <Link href="/admin/licencias">🔑 Licencias</Link>
          <Link href="/admin/incidencias">⚠️ Incidencias</Link>
          <Link href="/admin/reportes">📄 Reportes</Link>
        </nav>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col bg-gray-100">
        {/* Header */}
        <header className="bg-white px-6 py-4 shadow flex items-center justify-between">
          <h1 className="text-xl font-semibold">Bienvenido, Admin</h1>
          <button
            onClick={cerrarSesion}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
          >
            Cerrar sesión
          </button>
        </header>

        {/* Contenido */}
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
