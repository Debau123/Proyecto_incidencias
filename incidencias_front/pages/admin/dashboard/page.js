"use client";
import { useEffect, useState } from "react";

export default function DashboardAdminPage() {
  const [datos, setDatos] = useState({
    usuarios: 0,
    dispositivos: 0,
    incidencias: 0,
    licencias: 0,
  });

  useEffect(() => {
    const fetchDatos = async () => {
      const token = localStorage.getItem("jwt");

      const headers = {
        Authorization: `Bearer ${token}`,
      };

      try {
        const [resUsuarios, resDispositivos, resIncidencias, resLicencias] =
          await Promise.all([
            fetch("http://localhost:1339/api/users", { headers }), // usuarios
            fetch("http://localhost:1339/api/dispositivos", { headers }),
            fetch("http://localhost:1339/api/incidencias", { headers }),
            fetch("http://localhost:1339/api/licencias", { headers }),
          ]);

        const usuarios = await resUsuarios.json();
        const dispositivos = await resDispositivos.json();
        const incidencias = await resIncidencias.json();
        const licencias = await resLicencias.json();

        setDatos({
          usuarios: usuarios.length || 0,
          dispositivos: dispositivos.data?.length || 0,
          incidencias: incidencias.data?.length || 0,
          licencias: licencias.data?.length || 0,
        });
      } catch (error) {
        console.error("Error al obtener datos:", error);
      }
    };

    fetchDatos();
  }, []);

  const estadisticas = [
    { label: "Usuarios", valor: datos.usuarios, icono: "👥" },
    { label: "Dispositivos", valor: datos.dispositivos, icono: "💻" },
    { label: "Incidencias", valor: datos.incidencias, icono: "⚠️" },
    { label: "Licencias", valor: datos.licencias, icono: "🔑" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Resumen general</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {estadisticas.map((item, index) => (
          <div
            key={index}
            className="bg-white shadow rounded p-6 flex items-center justify-between"
          >
            <div className="text-4xl">{item.icono}</div>
            <div className="text-right">
              <p className="text-2xl font-bold">{item.valor}</p>
              <p className="text-gray-600">{item.label}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
