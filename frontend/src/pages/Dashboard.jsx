import { useEffect, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  Area, AreaChart,
} from "recharts";
import { apiFetch } from "../api";

export default function Dashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    const load = () => apiFetch("/dashboard").then(setData).catch(() => {});
    load();
    const id = setInterval(load, 30000);
    return () => clearInterval(id);
  }, []);

  if (!data) return <div className="loading">Chargement...</div>;

  return (
    <div>
      <h1>Tableau de bord</h1>

      <div className="stats-grid">
        <div className="stat-card">
          <h2>{data.total_students}</h2>
          <p>Total élèves</p>
        </div>
        <div className="stat-card green">
          <h2>{data.present_today}</h2>
          <p>Présents</p>
        </div>
        <div className="stat-card red">
          <h2>{data.absent_today}</h2>
          <p>Absents</p>
        </div>
        <div className="stat-card orange">
          <h2>{data.late_today}</h2>
          <p>Retards</p>
        </div>
        <div className="stat-card blue">
          <h2>{data.taux_presence}%</h2>
          <p>Taux présence</p>
        </div>
        <div className="stat-card">
          <h2>{data.total_classes}</h2>
          <p>Classes</p>
        </div>
      </div>

      <div className="chart-card">
        <h3>Évolution de la présence (7 jours)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data.evolution}>
            <defs>
              <linearGradient id="gp" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="ga" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
            <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
            <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
            <Tooltip
              contentStyle={{
                background: "#fff",
                border: "1px solid #e2e8f0",
                borderRadius: 12,
                boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
              }}
            />
            <Area type="monotone" dataKey="present" stroke="#10b981" strokeWidth={2} fill="url(#gp)" name="Présents" />
            <Area type="monotone" dataKey="absent" stroke="#ef4444" strokeWidth={2} fill="url(#ga)" name="Absents" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
