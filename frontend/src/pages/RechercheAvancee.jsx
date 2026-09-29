import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiFetch, API, authHeaders } from "../api";

export default function RechercheAvancee() {
  const [classes, setClasses] = useState([]);
  const [filieres, setFilieres] = useState([]);
  const [results, setResults] = useState([]);
  const [filters, setFilters] = useState({
    q: "", classe_id: "", filiere_id: "", sexe: "", statut: "", annee: ""
  });
  const [loading, setLoading] = useState(false);

  async function loadBase() {
    const [c, f] = await Promise.all([apiFetch("/classes"), apiFetch("/filieres")]);
    setClasses(c); setFilieres(f);
  }
  async function search() {
    setLoading(true);
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, v); });
    try { setResults(await apiFetch(`/students/advanced?${params}`)); }
    finally { setLoading(false); }
  }
  useEffect(() => { loadBase(); search(); }, []);

  function exportCSV() {
    fetch(`${API}/students/export-csv`, { headers: authHeaders() })
      .then(r => r.blob())
      .then(blob => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url; a.download = "eleves.csv"; a.click();
        URL.revokeObjectURL(url);
      });
  }
  const set = (k, v) => setFilters({ ...filters, [k]: v });

  return (
    <div>
      <div className="page-header">
        <h1>🔍 Recherche avancée</h1>
        <button className="btn btn-secondary" onClick={exportCSV}>📥 Export CSV</button>
      </div>
      <div className="card">
        <div className="form-grid">
          <div className="form-group">
            <label>Recherche</label>
            <input value={filters.q} onChange={(e) => set("q", e.target.value)} placeholder="Matricule, nom..." />
          </div>
          <div className="form-group">
            <label>Classe</label>
            <select value={filters.classe_id} onChange={(e) => set("classe_id", e.target.value)}>
              <option value="">Toutes</option>
              {classes.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Filière</label>
            <select value={filters.filiere_id} onChange={(e) => set("filiere_id", e.target.value)}>
              <option value="">Toutes</option>
              {filieres.map(f => <option key={f.id} value={f.id}>{f.nom}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Sexe</label>
            <select value={filters.sexe} onChange={(e) => set("sexe", e.target.value)}>
              <option value="">Tous</option>
              <option value="M">Lahy</option>
              <option value="F">Vavy</option>
            </select>
          </div>
          <div className="form-group">
            <label>Année</label>
            <input value={filters.annee} onChange={(e) => set("annee", e.target.value)} placeholder="2024" />
          </div>
          <div className="form-group">
            <label>Statut paiement</label>
            <select value={filters.statut} onChange={(e) => set("statut", e.target.value)}>
              <option value="">Tous</option>
              <option value="avec_paiement">Avec paiement</option>
              <option value="sans_paiement">Sans paiement</option>
            </select>
          </div>
        </div>
        <div className="modal-actions">
          <button className="btn" onClick={search} disabled={loading}>
            {loading ? "..." : "🔍 Rechercher"}
          </button>
        </div>
      </div>
      <div className="card">
        <h3>{results.length} résultats</h3>
        {results.length === 0 ? <p className="empty">Tsy misy valiny.</p> : (
          <div className="table-wrap">
            <table className="data-table">
              <thead><tr>
                <th>Matricule</th><th>Nom</th><th>Prénom</th>
                <th>Classe</th><th>Filière</th><th>Sexe</th><th></th>
              </tr></thead>
              <tbody>
                {results.map(s => (
                  <tr key={s.id}>
                    <td><strong>{s.matricule}</strong></td>
                    <td>{s.nom}</td><td>{s.prenom}</td>
                    <td>{s.classe_nom || "—"}</td>
                    <td>{s.filiere_nom || "—"}</td>
                    <td>{s.sexe}</td>
                    <td><Link to={`/students/${s.id}`} className="btn btn-sm btn-secondary">👁</Link></td>
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
