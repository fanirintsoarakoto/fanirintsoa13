import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { apiFetch, API } from "../api";

export default function StudentDetail() {
  const { id } = useParams();
  const [data, setData] = useState(null);

  useEffect(() => { apiFetch(`/students/${id}`).then(setData).catch(() => {}); }, [id]);
  if (!data) return <div className="loading">⏳...</div>;

  const chartData = [...(data.history || [])].reverse().map(h => ({
    date: h.date, value: h.statut === "present" ? 1 : h.statut === "retard" ? 0.5 : 0
  }));

  return (
    <div>
      <div className="page-header">
        <h1>👤 {data.nom} {data.prenom}</h1>
        <Link to="/students" className="btn btn-secondary">← Miverina</Link>
      </div>

      <div className="card">
        <div className="stats-grid">
          <div className="stat-card blue"><h2>{data.matricule}</h2><p>Matricule</p></div>
          <div className="stat-card"><h2>{data.age || "—"}</h2><p>Âge</p></div>
          <div className="stat-card green"><h2>{data.stats.present}</h2><p>Présences</p></div>
          <div className="stat-card red"><h2>{data.stats.absent}</h2><p>Absences</p></div>
          <div className="stat-card orange"><h2>{data.stats.retard}</h2><p>Retards</p></div>
          <div className="stat-card blue"><h2>{data.stats.taux}%</h2><p>Taux</p></div>
        </div>

        <div className="form-grid" style={{ marginTop: 16 }}>
          <div><strong>Classe :</strong> {data.classe_nom || "—"}</div>
          <div><strong>Groupe :</strong> {data.groupe_nom || "—"}</div>
          <div><strong>Sexe :</strong> {data.sexe}</div>
          <div><strong>Lieu :</strong> {data.lieu || "—"}</div>
          <div><strong>Téléphone :</strong> {data.telephone || "—"}</div>
          <div><strong>Parent :</strong> {data.parent_nom || "—"}</div>
          <div><strong>Tel. parent :</strong> {data.parent_telephone || "—"}</div>
          <div><strong>Inscription :</strong> {data.date_inscription}</div>
        </div>

        {data.situation && (
          <p style={{ marginTop: 12, color: "var(--muted)" }}>
            <strong>Situation :</strong> {data.situation}
          </p>
        )}
      </div>

      <div className="card" style={{ textAlign: "center" }}>
        <h3>📱 QR Code</h3>
        <img
          src={`${API}/students/${id}/qr`}
          alt="QR"
          style={{ background: "#fff", padding: 10, borderRadius: 8, maxWidth: 220 }}
        />
        <p style={{ color: "var(--muted)", fontSize: "0.85rem" }}>
          Scanner ity QR ity hamoahana présence
        </p>
      </div>

      {chartData.length > 0 && (
        <div className="chart-card">
          <h3>Évolution (1=présent, 0.5=retard, 0=absent)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} />
              <YAxis stroke="#94a3b8" fontSize={10} domain={[0, 1]} />
              <Tooltip contentStyle={{ background: "#1e293b", border: "1px solid #334155" }} />
              <Line type="monotone" dataKey="value" stroke="#38bdf8" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="card">
        <h3>📜 Historique</h3>
        {data.history.length === 0 ? (
          <p className="empty">Tsy misy tantara.</p>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead><tr><th>Date</th><th>Heure</th><th>Statut</th><th>Méthode</th></tr></thead>
              <tbody>
                {data.history.map(h => (
                  <tr key={h.id}>
                    <td>{h.date}</td>
                    <td>{h.heure_arrivee || "—"}</td>
                    <td><span className={`badge ${h.statut}`}>{h.statut}</span></td>
                    <td>{h.methode}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
