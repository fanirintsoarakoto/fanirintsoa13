import { useEffect, useState } from "react";
import { apiFetch } from "../api";

const STATUTS = {
  present: { label: "À l'heure", color: "#22c55e" },
  retard: { label: "Retard", color: "#f59e0b" },
  tres_retard: { label: "Très retard", color: "#ef4444" },
  non_prevu: { label: "Non prévu", color: "#8b5cf6" },
  sortie: { label: "Sortie", color: "#3b82f6" },
};

export default function Historique() {
  const [scans, setScans] = useState([]);
  const [filterDate, setFilterDate] = useState(new Date().toISOString().slice(0, 10));
  const [filterStatut, setFilterStatut] = useState("");

  async function load() {
    const params = new URLSearchParams();
    if (filterDate) params.set("date", filterDate);
    if (filterStatut) params.set("statut", filterStatut);
    setScans(await apiFetch(`/attendance/historique?${params}`));
  }
  useEffect(() => { load(); }, [filterDate, filterStatut]);

  return (
    <div>
      <div className="page-header">
        <h1>📜 Historique scans ({scans.length})</h1>
      </div>
      <div className="toolbar">
        <input type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} />
        <select value={filterStatut} onChange={(e) => setFilterStatut(e.target.value)}>
          <option value="">Statut rehetra</option>
          {Object.entries(STATUTS).map(([k, v]) => (
            <option key={k} value={k}>{v.label}</option>
          ))}
        </select>
      </div>
      {scans.length === 0 ? <p className="empty">Tsy misy scan.</p> : (
        <div className="table-wrap">
          <table className="data-table">
            <thead><tr>
              <th>#</th><th>Élève</th><th>Matricule</th><th>Classe</th>
              <th>Matière</th><th>Prévu</th><th>Scan</th>
              <th>Retard</th><th>Statut</th><th>Type</th>
            </tr></thead>
            <tbody>
              {scans.map(s => {
                const st = STATUTS[s.statut] || {};
                return (
                  <tr key={s.id}>
                    <td>{s.id}</td>
                    <td>{s.nom} {s.prenom}</td>
                    <td><strong>{s.matricule}</strong></td>
                    <td>{s.classe_nom || "—"}</td>
                    <td>{s.matiere || "—"}</td>
                    <td>{s.heure_prevue || "—"}</td>
                    <td>{s.heure_reelle}</td>
                    <td>{s.minutes_retard > 0 ? `+${s.minutes_retard} min` : "—"}</td>
                    <td>
                      <span className="badge" style={{ background: st.color + "33", color: st.color }}>
                        {st.label || s.statut}
                      </span>
                    </td>
                    <td>{s.type}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
