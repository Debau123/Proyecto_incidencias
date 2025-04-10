import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

export default function RechartsAreaChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="colorOperativo" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#4ade80" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#4ade80" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="colorAveriado" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#f87171" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#f87171" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="colorMantenimiento" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#facc15" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#facc15" stopOpacity={0} />
          </linearGradient>
        </defs>

        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="mes" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Area
          type="monotone"
          dataKey="operativo"
          stroke="#4ade80"
          fillOpacity={1}
          fill="url(#colorOperativo)"
        />
        <Area
          type="monotone"
          dataKey="mantenimiento"
          stroke="#facc15"
          fillOpacity={1}
          fill="url(#colorMantenimiento)"
        />
        <Area
          type="monotone"
          dataKey="averiado"
          stroke="#f87171"
          fillOpacity={1}
          fill="url(#colorAveriado)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
