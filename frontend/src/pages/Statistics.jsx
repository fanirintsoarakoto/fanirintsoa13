import { useEffect, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, PieChart, Pie, Cell, Legend, LineChart, Line
} from "recharts";
import { apiFetch } from "../api";

const COLORS = ["#22c55e", "#ef4444", "#eab308", "#38bdf8"];

export default function Statistics() {
  const [data, setData] = useState(null);
  const [classes, setClasses] = useState([]);
  const [filters, setFilters] = useState({ from: "", to: "", classe_id: "" });

  async function load() {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, v); });
    const [d, c] = await Promise.all([
      apiFetch(`/attendance/statistics?${params}`),
      apiFetch("/classes"),
    ]);
    setData(d); setClasses(c);
  }
  useEffect(() => { load(); }, [filters]);

  function exportCSV() {
    if (!data) return;
    const rows = [["Date", "Présents", "Absents"]];
    data.daily.forEach(d => rows.push([d.date, d.present, d.absent]));
    const csv = rows.map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "statistiques.csv"; a.click();
  }

  if (!data) return <div className="loading">⏳...</div>;
  const t = data.totals;

  const pieData = [
    { name: "Présents", value: t.present },
    { name: "Absents", value: t.absent },
    { name: "Retards", value: t.retard },
    { name: "Excusés", value: t.excuse },
  ];

  return (
    <div>
      <div className="page-header">
        <h1>📈 Statistiques</h1>
        <button className="btn btn-secondary" onClick={exportCSV}>📥 Export CSV</button>
      </div>

      <div className="toolbar">
        <input type="date" value={filters.from}
          onChange={(e) => setFilters({ ...filters, from: e.target.value })} />
        <input type="date" value={filters.to}
          onChange={(e) => setFilters({ ...filters, to: e.target.value })} />
        <select value={filters.classe_id}
          onChange={(e) => setFilters({ ...filters, classe_id: e.target.value })}>
          <option value="">Classe rehetra</option>
          {classes.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}
        </select>
      </div>

      <div className="stats-grid">
        <div className="stat-card"><h2>{t.total}</h2><p>Total</p></div>
        <div className="stat-card green"><h2>{t.present}</h2><p>Présents</p></div>
        <div className="stat-card red"><h2>{t.absent}</h2><p>Absents</p></div>
        <div className="stat-card orange"><h2>{t.retard}</h2><p>Retards</p></div>
        <div className="stat-card blue"><h2>{t.excuse}</h2><p>Excusés</p></div>
        <div className="stat-card blue"><h2>{t.taux}%</h2><p>Taux</p></div>
      </div>

      <div className="chart-card">
        <h3>Évolution quotidienne</h3>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={[...data.daily].reverse()}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} />
            <YAxis stroke="#94a3b8" fontSize={10} />
            <Tooltip contentStyle={{ background: "#1e293b", border: "1px solid #334155" }} />
            <Legend />
            <Line type="monotone" dataKey="present" stroke="#22c55e" name="Présents" />
            <Line type="monotone" dataKey="absent" stroke="#ef4444" name="Absents" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <h3>Répartition</h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name"
                cx="50%" cy="50%" outerRadius={80} label>
                {pieData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: "#1e293b", border: "1px solid #334155" }} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3>Top présents</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data.top} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis type="number" stroke="#94a3b8" fontSize={10} />
              <YAxis dataKey="nom" type="category" stroke="#94a3b8" fontSize={10} width={80} />
              <Tooltip contentStyle={{ background: "#1e293b", border: "1px solid #334155" }} />
              <Bar dataKey="presences" fill="#22c55e" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card">
        <h3>Tableau récapitulatif</h3>
        <div className="table-wrap">
          <table className="data-table">
            <thead><tr><th>Date</th><th>Présents</th><th>Absents</th></tr></thead>
            <tbody>
              {data.daily.map(d => (
                <tr key={d.date}>
                  <td>{d.date}</td>
                  <td style={{ color: "#22c55e" }}>{d.present}</td>
                  <td style={{ color: "#ef4444" }}>{d.absent}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
