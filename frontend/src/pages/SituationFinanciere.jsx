import { useEffect, useState } from "react";
import { apiFetch } from "../api";

export default function SituationFinanciere() {
  const [students, setStudents] = useState([]);
  const [selected, setSelected] = useState(null);
  const [data, setData] = useState(null);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    apiFetch("/students").then(setStudents);
    apiFetch("/paiements/stats-avance").then(setStats);
  }, []);

  async function openSituation(s) {
    setSelected(s);
    setData(await apiFetch(`/students/${s.id}/situation`));
  }

  return (
    <div>
      <div className="page-header">
        <h1>💰 Situations financières</h1>
      </div>
      {stats && (
        <div className="stats-grid">
          <div className="stat-card blue"><h2>{(stats.total_attendu / 1000).toFixed(0)}k</h2><p>Total attendu</p></div>
          <div className="stat-card green"><h2>{(stats.total_paye / 1000).toFixed(0)}k</h2><p>Total payé</p></div>
          <div className="stat-card red"><h2>{(stats.reste_global / 1000).toFixed(0)}k</h2><p>Reste</p></div>
          <div className="stat-card orange"><h2>{stats.taux_recouvrement}%</h2><p>Taux</p></div>
        </div>
      )}
      {!selected ? (
        <div className="card">
          <h3>👥 Safidio mpianatra</h3>
          <div className="bulletin-students-grid">
            {students.map(s => (
              <button key={s.id} className="bulletin-student-btn" onClick={() => openSituation(s)}>
                <div className="bs-name">{s.nom} {s.prenom}</div>
                <div className="bs-matricule">{s.matricule}</div>
                <div className="bs-classe">{s.classe_nom || "—"}</div>
              </button>
            ))}
          </div>
        </div>
      ) : data && (
        <>
          <div style={{ marginBottom: 16 }}>
            <button className="btn btn-secondary" onClick={() => { setSelected(null); setData(null); }}>
              ← Miverina
            </button>
          </div>
          <div className="card">
            <h3>👤 {data.student.nom} {data.student.prenom} ({data.student.matricule})</h3>
            <div className="stats-grid" style={{ marginTop: 16 }}>
              <div className="stat-card blue"><h2>{Number(data.total_du).toLocaleString()}</h2><p>Total dû (Ar)</p></div>
              <div className="stat-card green"><h2>{Number(data.total_paye).toLocaleString()}</h2><p>Payé (Ar)</p></div>
              <div className={`stat-card ${data.reste > 0 ? "red" : "green"}`}>
                <h2>{Number(data.reste).toLocaleString()}</h2><p>Reste</p>
              </div>
            </div>
          </div>
          <div className="card">
            <h3>📋 Frais applicables</h3>
            <div className="table-wrap">
              <table className="data-table">
                <thead><tr><th>Nom</th><th>Type</th><th>Montant</th></tr></thead>
                <tbody>
                  {data.frais.map(f => (
                    <tr key={f.id}>
                      <td>{f.nom}</td>
                      <td><span className="badge info">{f.type}</span></td>
                      <td><strong>{Number(f.montant).toLocaleString()} Ar</strong></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="card">
            <h3>💳 Historique</h3>
            {data.paiements.length === 0 ? <p className="empty">Tsy mbola nandoa.</p> : (
              <div className="table-wrap">
                <table className="data-table">
                  <thead><tr>
                    <th>Date</th><th>Mois</th><th>Montant</th>
                    <th>Méthode</th><th>Reçu</th>
                  </tr></thead>
                  <tbody>
                    {data.paiements.map(p => (
                      <tr key={p.id}>
                        <td>{p.date_paiement}</td>
                        <td>{p.mois} {p.annee}</td>
                        <td><strong>{Number(p.montant).toLocaleString()} Ar</strong></td>
                        <td>{p.methode}</td>
                        <td>{p.recu_numero || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
