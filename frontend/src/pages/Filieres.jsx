import { useEffect, useState } from "react";
import { apiFetch } from "../api";

export default function Filieres({ toast }) {
  const [filieres, setFilieres] = useState([]);
  const [frais, setFrais] = useState([]);
  const [classes, setClasses] = useState([]);
  const [tab, setTab] = useState("filieres");
  const [fForm, setFForm] = useState({ nom: "", description: "" });
  const [frForm, setFrForm] = useState({ nom: "", montant: 0, type: "ecolage", classe_id: "" });

  async function load() {
    const [f, fr, c] = await Promise.all([
      apiFetch("/filieres"), apiFetch("/frais"), apiFetch("/classes"),
    ]);
    setFilieres(f); setFrais(fr); setClasses(c);
  }
  useEffect(() => { load(); }, []);

  async function addFiliere(e) {
    e.preventDefault();
    if (!fForm.nom.trim()) return;
    await apiFetch("/filieres", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(fForm),
    });
    toast("Nampiana ✓");
    setFForm({ nom: "", description: "" });
    load();
  }
  async function addFrais(e) {
    e.preventDefault();
    if (!frForm.nom.trim()) return;
    await apiFetch("/frais", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...frForm,
        montant: Number(frForm.montant),
        classe_id: frForm.classe_id ? Number(frForm.classe_id) : null }),
    });
    toast("Nampiana ✓");
    setFrForm({ nom: "", montant: 0, type: "ecolage", classe_id: "" });
    load();
  }
  async function delFiliere(id) {
    if (!confirm("Hamafa?")) return;
    await apiFetch(`/filieres/${id}`, { method: "DELETE" });
    load();
  }
  async function delFrais(id) {
    if (!confirm("Hamafa?")) return;
    await apiFetch(`/frais/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div>
      <h1>🏫 Filières & Frais</h1>
      <div className="attendance-tabs">
        <button className={tab === "filieres" ? "active" : ""} onClick={() => setTab("filieres")}>
          🎓 Filières ({filieres.length})
        </button>
        <button className={tab === "frais" ? "active" : ""} onClick={() => setTab("frais")}>
          💰 Frais ({frais.length})
        </button>
      </div>
      {tab === "filieres" && (
        <>
          <div className="card">
            <h3>➕ Filière</h3>
            <form onSubmit={addFiliere} className="toolbar">
              <input placeholder="Anarana" value={fForm.nom}
                onChange={(e) => setFForm({ ...fForm, nom: e.target.value })} />
              <input placeholder="Description" value={fForm.description}
                onChange={(e) => setFForm({ ...fForm, description: e.target.value })} />
              <button type="submit" className="btn">+ Ampio</button>
            </form>
          </div>
          <div className="card">
            <h3>📋 Lisitra</h3>
            {filieres.length === 0 ? <p className="empty">Tsy misy filière.</p> : (
              <div className="table-wrap">
                <table className="data-table">
                  <thead><tr><th>Nom</th><th>Description</th><th></th></tr></thead>
                  <tbody>
                    {filieres.map(f => (
                      <tr key={f.id}>
                        <td><strong>{f.nom}</strong></td>
                        <td>{f.description || "—"}</td>
                        <td><button className="btn btn-sm btn-danger" onClick={() => delFiliere(f.id)}>🗑</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
      {tab === "frais" && (
        <>
          <div className="card">
            <h3>➕ Frais</h3>
            <form onSubmit={addFrais}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Anarana</label>
                  <input value={frForm.nom}
                    onChange={(e) => setFrForm({ ...frForm, nom: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Montant (Ar)</label>
                  <input type="number" value={frForm.montant}
                    onChange={(e) => setFrForm({ ...frForm, montant: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Type</label>
                  <select value={frForm.type}
                    onChange={(e) => setFrForm({ ...frForm, type: e.target.value })}>
                    <option value="inscription">Inscription</option>
                    <option value="ecolage">Écolage</option>
                    <option value="autre">Autre</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Classe</label>
                  <select value={frForm.classe_id}
                    onChange={(e) => setFrForm({ ...frForm, classe_id: e.target.value })}>
                    <option value="">Toutes</option>
                    {classes.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}
                  </select>
                </div>
              </div>
              <div className="modal-actions">
                <button type="submit" className="btn">+ Ampio</button>
              </div>
            </form>
          </div>
          <div className="card">
            <h3>💰 Lisitra</h3>
            {frais.length === 0 ? <p className="empty">Tsy misy frais.</p> : (
              <div className="table-wrap">
                <table className="data-table">
                  <thead><tr><th>Nom</th><th>Type</th><th>Montant</th><th>Classe</th><th></th></tr></thead>
                  <tbody>
                    {frais.map(f => (
                      <tr key={f.id}>
                        <td><strong>{f.nom}</strong></td>
                        <td><span className="badge info">{f.type}</span></td>
                        <td><strong>{Number(f.montant).toLocaleString()} Ar</strong></td>
                        <td>{f.classe_nom || "Toutes"}</td>
                        <td><button className="btn btn-sm btn-danger" onClick={() => delFrais(f.id)}>🗑</button></td>
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
