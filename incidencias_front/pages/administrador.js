import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

// Carga dinámica de gráficos
const RechartsPie = dynamic(() => import("../components/RechartsPieChart"), { ssr: false });
const DispositivosAreaChart = dynamic(() => import("../components/RechartsAreaChart"), { ssr: false });

export default function AdminDashboard() {
  const [datosIncidencias, setDatosIncidencias] = useState([]);
  const [ultimasIncidencias, setUltimasIncidencias] = useState([]);
  const [datosDispositivos, setDatosDispositivos] = useState([]);
  const [topUsuarios, setTopUsuarios] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");

    const cargarIncidencias = async () => {
      try {
        const res = await fetch("http://localhost:1339/api/incidencias?populate=user", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();

        // Incidencias por estado
        const conteo = { abierta: 0, en_progreso: 0, resuelta: 0 };
        data.data.forEach((inc) => {
          const estado = inc.attributes.estado;
          if (conteo[estado] !== undefined) conteo[estado]++;
        });

        setDatosIncidencias([
          { name: "Abiertas", value: conteo.abierta },
          { name: "En progreso", value: conteo.en_progreso },
          { name: "Resueltas", value: conteo.resuelta },
        ]);

        // Últimas 5
        const ordenadas = data.data.sort(
          (a, b) => new Date(b.attributes.fecha_creacion) - new Date(a.attributes.fecha_creacion)
        );
        setUltimasIncidencias(ordenadas.slice(0, 5));

        // Top usuarios
        const usuarioConteo = {};
        data.data.forEach((inc) => {
          const usuario = inc.attributes.user?.data;
          if (usuario) {
            const id = usuario.id;
            const nombre = usuario.attributes.username;
            if (!usuarioConteo[id]) {
              usuarioConteo[id] = { id, nombre, cantidad: 1 };
            } else {
              usuarioConteo[id].cantidad++;
            }
          }
        });

        const top = Object.values(usuarioConteo)
          .sort((a, b) => b.cantidad - a.cantidad)
          .slice(0, 5);

        setTopUsuarios(top);
      } catch (err) {
        console.error("Error al cargar incidencias:", err);
      }
    };

    const cargarDispositivos = async () => {
      try {
        const res = await fetch("http://localhost:1339/api/dispositivos?pagination[pageSize]=100");
        const data = await res.json();

        const agrupados = {};
        data.data.forEach((dis) => {
          const { fecha_compra, estado } = dis.attributes;
          if (!fecha_compra) return;

          const fecha = new Date(fecha_compra);
          const clave = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, "0")}`;

          if (!agrupados[clave]) {
            agrupados[clave] = {
              fecha: clave,
              operativo: 0,
              mantenimiento: 0,
              averiado: 0,
            };
          }

          if (estado && agrupados[clave][estado] !== undefined) {
            agrupados[clave][estado]++;
          }
        });

        const resultado = Object.values(agrupados).sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
        setDatosDispositivos(resultado);
      } catch (err) {
        console.error("Error al cargar dispositivos:", err);
      }
    };

    cargarIncidencias();
    cargarDispositivos();
  }, []);

  const estadoColor = {
    abierta: "bg-yellow-200 text-yellow-800",
    en_progreso: "bg-blue-200 text-blue-800",
    resuelta: "bg-green-200 text-green-800",
  };

  return (
    <div className="p-6 bg-white min-h-screen text-gray-800">
      <h1 className="text-3xl font-semibold mb-6">Dashboard de Administrador</h1>

      <div className="flex flex-col md:flex-row gap-8 mb-10">
        <div className="bg-gray-50 p-4 rounded shadow w-full max-w-sm">
          <h2 className="text-xl font-bold mb-4">Incidencias por Estado</h2>
          <RechartsPie data={datosIncidencias} />
        </div>

        <div className="bg-gray-50 p-4 rounded shadow flex-1">
          <h2 className="text-xl font-bold mb-4">Últimas Incidencias</h2>
          <ul className="space-y-2">
            {ultimasIncidencias.map((i) => (
              <li key={i.id} className="flex justify-between items-center border-b pb-1">
                <div>
                  <a
                    href={`/admin/incidencias/${i.id}`}
                    className="text-blue-600 hover:underline font-medium"
                  >
                    {i.attributes.titulo}
                  </a>
                  <span
                    className={`ml-2 text-xs px-2 py-0.5 rounded font-medium ${estadoColor[i.attributes.estado]}`}
                  >
                    {i.attributes.estado}
                  </span>
                </div>
                <span className="text-sm px-2 py-0.5 rounded bg-gray-200 text-gray-700">
                  {new Date(i.attributes.fecha_creacion).toLocaleDateString()}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Gráfico dispositivos */}
      <div className="bg-gray-50 p-4 rounded shadow mb-10">
        <h2 className="text-xl font-bold mb-4">Dispositivos por Estado / Mes</h2>
        <DispositivosAreaChart data={datosDispositivos} />
      </div>

      {/* Top usuarios con más incidencias */}
      <div className="bg-gray-50 p-4 rounded shadow mb-6">
        <h2 className="text-xl font-bold mb-4">Top 5 Usuarios con Más Incidencias</h2>
        {topUsuarios.length > 0 ? (
          <ul className="space-y-2">
            {topUsuarios.map((u, index) => (
              <li key={u.id} className="flex justify-between border-b pb-1">
                <span className="font-medium text-gray-800">{index + 1}. {u.nombre}</span>
                <span className="text-sm text-gray-600">{u.cantidad} incidencia{u.cantidad !== 1 ? "s" : ""}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-500">No hay incidencias registradas aún.</p>
        )}
      </div>
    </div>
  );
}
