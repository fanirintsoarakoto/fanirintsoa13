import { useEffect, useState } from "react";
import { apiFetch } from "../api";

export default function Logs() {
  const [logs, setLogs] = useState([]);
  const [filterDate, setFilterDate] = useState(new Date().toISOString().slice(0, 10));
  const [filterResultat, setFilterResultat] = useState("");

  async function load() {
    const params = new URLSearchParams();
    if (filterDate) params.set("date", filterDate);
    if (filterResultat) params.set("resultat", filterResultat);
    setLogs(await apiFetch(`/logs?${params}`));
  }
  useEffect(() => { load(); }, [filterDate, filterResultat]);

  return (
    <div>
      <div className="page-header">
        <h1>📋 Journal d'activité ({logs.length})</h1>
      </div>
      <div className="toolbar">
        <input type="date" value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)} />
        <select value={filterResultat}
          onChange={(e) => setFilterResultat(e.target.value)}>
          <option value="">Rehetra</option>
          <option value="succes">✅ Succès</option>
          <option value="echec">❌ Échec</option>
        </select>
      </div>
      {logs.length === 0 ? (
        <p className="empty">Tsy misy log.</p>
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead><tr>
              <th>Date</th><th>Utilisateur</th><th>Action</th>
              <th>Détails</th><th>Résultat</th>
            </tr></thead>
            <tbody>
              {logs.map(l => (
                <tr key={l.id}>
                  <td>{new Date(l.created_at).toLocaleString("fr-FR")}</td>
                  <td><strong>{l.username || "—"}</strong></td>
                  <td>{l.action}</td>
                  <td style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                    {l.details}
                  </td>
                  <td>
                    <span className={`badge ${l.resultat === "succes" ? "present" : "absent"}`}>
                      {l.resultat}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
