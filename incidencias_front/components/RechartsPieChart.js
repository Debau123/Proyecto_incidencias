import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";

const colores = ["#facc15", "#60a5fa", "#4ade80"];

export default function RechartsPieChart({ data }) {
  if (!data || data.length === 0) return <p className="text-gray-500">Sin datos para mostrar.</p>;

  return (
    <PieChart width={300} height={300}>
      <Pie
        data={data}
        dataKey="value"
        nameKey="name"
        cx="50%"
        cy="50%"
        outerRadius={100}
        label
      >
        {data.map((entry, index) => (
          <Cell key={`cell-${index}`} fill={colores[index % colores.length]} />
        ))}
      </Pie>
      <Tooltip />
      <Legend />
    </PieChart>
  );
}
