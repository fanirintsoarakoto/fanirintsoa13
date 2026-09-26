import { useEffect, useState } from "react";
import { apiFetch } from "../api";

export default function Parametres({ toast }) {
  const [matieres, setMatieres] = useState([]);
  const [classes, setClasses] = useState([]);
  const [form, setForm] = useState({ nom: "", coefficient: 1, classe_id: "" });
  const [editing, setEditing] = useState(null);

  async function load() {
    const [m, c] = await Promise.all([
      apiFetch("/matieres"),
      apiFetch("/classes"),
    ]);
    setMatieres(m);
    setClasses(c);
  }

  useEffect(() => { load(); }, []);

  async function submit(e) {
    e.preventDefault();
    if (!form.nom.trim()) return;
    try {
      if (editing) {
        await apiFetch(`/matieres/${editing}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nom: form.nom,
            coefficient: Number(form.coefficient),
            classe_id: form.classe_id ? Number(form.classe_id) : null,
          }),
        });
        toast("Voatahiry ✓");
        setEditing(null);
      } else {
        await apiFetch("/matieres", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nom: form.nom,
            coefficient: Number(form.coefficient),
            classe_id: form.classe_id ? Number(form.classe_id) : null,
          }),
        });
        toast("Matière nampiana ✓");
      }
      setForm({ nom: "", coefficient: 1, classe_id: "" });
      load();
    } catch (e) {
      toast(e.message, "error");
    }
  }

  async function remove(id) {
    if (!confirm("Hamafa ny matière sy ny note rehetra?")) return;
    await apiFetch(`/matieres/${id}`, { method: "DELETE" });
    toast("Voafafa"); load();
  }

  function startEdit(m) {
    setEditing(m.id);
    setForm({ nom: m.nom, coefficient: m.coefficient, classe_id: m.classe_id || "" });
  }

  return (
    <div>
      <h1>⚙️ Paramètres des matières</h1>

      <div className="card">
        <h3>{editing ? "✏️ Ovay matière" : "➕ Matière vaovao"}</h3>
        <form onSubmit={submit}>
          <div className="form-grid">
            <div className="form-group">
              <label>Anaran'ny matière *</label>
              <input value={form.nom} required
                onChange={(e) => setForm({ ...form, nom: e.target.value })}
                placeholder="Ohatra: Matematika" />
            </div>
            <div className="form-group">
              <label>Coefficient</label>
              <input type="number" min="1" max="10" value={form.coefficient}
                onChange={(e) => setForm({ ...form, coefficient: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Classe (tsy voatery)</label>
              <select value={form.classe_id}
                onChange={(e) => setForm({ ...form, classe_id: e.target.value })}>
                <option value="">Classe rehetra</option>
                {classes.map((c) => <option key={c.id} value={c.id}>{c.nom}</option>)}
              </select>
            </div>
          </div>
          <div className="modal-actions">
            {editing && (
              <button type="button" className="btn btn-secondary"
                onClick={() => { setEditing(null); setForm({ nom: "", coefficient: 1, classe_id: "" }); }}>
                Hiala
              </button>
            )}
            <button type="submit" className="btn">
              {editing ? "💾 Tehirizo" : "+ Ampio"}
            </button>
          </div>
        </form>
      </div>

      <div className="card">
        <h3>📚 Lisitry ny matières ({matieres.length})</h3>
        {matieres.length === 0 ? (
          <p className="empty">Tsy misy matière.</p>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr><th>Matière</th><th>Coef</th><th>Classe</th><th></th></tr>
              </thead>
              <tbody>
                {matieres.map((m) => (
                  <tr key={m.id}>
                    <td><strong>{m.nom}</strong></td>
                    <td><span className="coef-badge">× {m.coefficient}</span></td>
                    <td>{m.classe_id ? classes.find(c => c.id === m.classe_id)?.nom || "—" : "Rehetra"}</td>
                    <td>
                      <div style={{ display: "flex", gap: 4 }}>
                        <button className="btn btn-sm btn-secondary" onClick={() => startEdit(m)}>✏️</button>
                        <button className="btn btn-sm btn-danger" onClick={() => remove(m.id)}>🗑</button>
                      </div>
                    </td>
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
