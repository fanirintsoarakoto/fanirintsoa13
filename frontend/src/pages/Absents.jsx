import { useEffect, useState } from "react";
import { apiFetch } from "../api";

export default function Absents({ toast }) {
  const [data, setData] = useState(null);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));

  async function load() {
    setData(await apiFetch(`/attendance/absents?date=${date}`));
  }
  useEffect(() => { load(); }, [date]);

  async function notifyAll() {
    if (!data) return;
    try {
      const r = await apiFetch("/notifications/auto", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "absences" }),
      });
      toast(`✅ ${r.count} notification`);
    } catch (e) { toast(e.message, "error"); }
  }

  return (
    <div>
      <div className="page-header">
        <h1>❌ Élèves absents ({data?.total || 0})</h1>
        <div className="page-actions">
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
            style={{ padding: 8, borderRadius: 8, border: "1px solid var(--border)",
                     background: "var(--card)", color: "var(--text)" }} />
          <button className="btn btn-warn" onClick={notifyAll}>🔔 Notifier</button>
        </div>
      </div>
      {!data ? <p className="loading">⏳...</p>
       : data.absents.length === 0 ? <p className="empty">Tsy misy absent.</p>
       : (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Matricule</th><th>Nom</th><th>Prénom</th>
                <th>Matière</th><th>Heure prévue</th><th>Délai</th>
              </tr>
            </thead>
            <tbody>
              {data.absents.map((a, i) => (
                <tr key={i}>
                  <td><strong>{a.matricule}</strong></td>
                  <td>{a.nom}</td><td>{a.prenom}</td>
                  <td>{a.matiere}</td><td>{a.heure_prevue}</td>
                  <td><span className="badge danger">+{a.minutes_ecoulees} min</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
