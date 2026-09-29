import { useEffect, useState } from "react";
import { apiFetch } from "../api";

export default function Annonces({ toast }) {
  const [annonces, setAnnonces] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    titre: "", contenu: "", priorite: "normale",
    date_debut: new Date().toISOString().slice(0, 10), date_fin: "", auteur: "Admin",
  });

  async function load() { setAnnonces(await apiFetch("/annonces")); }
  useEffect(() => { load(); }, []);

  function openAdd() {
    setForm({ titre: "", contenu: "", priorite: "normale",
      date_debut: new Date().toISOString().slice(0, 10), date_fin: "", auteur: "Admin" });
    setEditing(null); setShowModal(true);
  }
  function openEdit(a) { setForm({ ...a }); setEditing(a.id); setShowModal(true); }

  async function submit(e) {
    e.preventDefault();
    try {
      if (editing) {
        await apiFetch(`/annonces/${editing}`, {
          method: "PUT", headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        toast("Voatahiry ✓");
      } else {
        await apiFetch("/annonces", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        toast("Nampiana ✓");
      }
      setShowModal(false); load();
    } catch (e) { toast(e.message, "error"); }
  }

  async function remove(id) {
    if (!confirm("Hamafa?")) return;
    await apiFetch(`/annonces/${id}`, { method: "DELETE" });
    toast("Voafafa"); load();
  }

  const prioClass = { urgente: "danger", importante: "warn", normale: "info" };

  return (
    <div>
      <div className="page-header">
        <h1>📢 Annonces ({annonces.length})</h1>
        <button className="btn btn-pdf-export" onClick={openAdd}>+ Annonce</button>
      </div>
      {annonces.length === 0 ? <p className="empty">Tsy misy annonce.</p> : (
        <div className="annonces-grid">
          {annonces.map(a => (
            <div key={a.id} className={`annonce-card priorite-${a.priorite}`}>
              <div className="annonce-head">
                <span className={`badge ${prioClass[a.priorite] || "info"}`}>{a.priorite}</span>
                <span className="annonce-date">{a.date_debut || a.created_at?.slice(0, 10)}</span>
              </div>
              <h3>{a.titre}</h3>
              <p>{a.contenu}</p>
              <div className="annonce-foot">
                <span>👤 {a.auteur}</span>
                <div style={{ display: "flex", gap: 4 }}>
                  <button className="btn btn-sm btn-secondary" onClick={() => openEdit(a)}>✏️</button>
                  <button className="btn btn-sm btn-danger" onClick={() => remove(a.id)}>🗑</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>{editing ? "✏️ Ovay" : "➕ Annonce"}</h2>
            <form onSubmit={submit}>
              <div className="form-group">
                <label>Titre *</label>
                <input value={form.titre} required onChange={(e) => setForm({ ...form, titre: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Contenu *</label>
                <textarea value={form.contenu} required onChange={(e) => setForm({ ...form, contenu: e.target.value })} />
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label>Priorité</label>
                  <select value={form.priorite} onChange={(e) => setForm({ ...form, priorite: e.target.value })}>
                    <option value="normale">Normale</option>
                    <option value="importante">Importante</option>
                    <option value="urgente">Urgente</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Date début</label>
                  <input type="date" value={form.date_debut || ""}
                    onChange={(e) => setForm({ ...form, date_debut: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Date fin</label>
                  <input type="date" value={form.date_fin || ""}
                    onChange={(e) => setForm({ ...form, date_fin: e.target.value })} />
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Hiala</button>
                <button type="submit" className="btn">💾 Tehirizo</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
