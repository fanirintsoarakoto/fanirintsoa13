import { useEffect, useState } from "react";
import { apiFetch } from "../api";

const TYPES = {
  examen: { label: "Examen", icon: "📝", color: "#ef4444" },
  fete: { label: "Fête", icon: "🎉", color: "#eab308" },
  reunion: { label: "Réunion", icon: "👥", color: "#3b82f6" },
  sport: { label: "Sport", icon: "⚽", color: "#10b981" },
  sortie: { label: "Sortie", icon: "🚌", color: "#8b5cf6" },
  autre: { label: "Autre", icon: "📌", color: "#64748b" },
};

export default function Evenements({ toast }) {
  const [evenements, setEvenements] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    titre: "", description: "", date_event: new Date().toISOString().slice(0, 10),
    heure: "", lieu: "", type: "autre",
  });

  async function load() { setEvenements(await apiFetch("/evenements")); }
  useEffect(() => { load(); }, []);

  async function submit(e) {
    e.preventDefault();
    await apiFetch("/evenements", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    toast("Nampiana ✓");
    setShowModal(false);
    setForm({ ...form, titre: "", description: "" });
    load();
  }

  async function remove(id) {
    if (!confirm("Hamafa?")) return;
    await apiFetch(`/evenements/${id}`, { method: "DELETE" });
    load();
  }

  const today = new Date().toISOString().slice(0, 10);
  const upcoming = evenements.filter(e => e.date_event >= today);
  const past = evenements.filter(e => e.date_event < today);

  return (
    <div>
      <div className="page-header">
        <h1>🎉 Événements</h1>
        <button className="btn btn-pdf-export" onClick={() => setShowModal(true)}>+ Événement</button>
      </div>
      {upcoming.length > 0 && (
        <>
          <h3>⏰ Ho avy ({upcoming.length})</h3>
          <div className="events-grid">
            {upcoming.map(e => {
              const t = TYPES[e.type] || TYPES.autre;
              return (
                <div key={e.id} className="event-card" style={{ borderLeftColor: t.color }}>
                  <div className="event-icon">{t.icon}</div>
                  <div className="event-body">
                    <div className="event-date">📅 {e.date_event} {e.heure && `• 🕐 ${e.heure}`}</div>
                    <h3>{e.titre}</h3>
                    {e.description && <p>{e.description}</p>}
                    {e.lieu && <p className="event-lieu">📍 {e.lieu}</p>}
                  </div>
                  <button className="btn btn-sm btn-danger" onClick={() => remove(e.id)}>🗑</button>
                </div>
              );
            })}
          </div>
        </>
      )}
      {past.length > 0 && (
        <>
          <h3 style={{ marginTop: 24, color: "var(--text-muted)" }}>📜 Vita ({past.length})</h3>
          <div className="events-grid">
            {past.map(e => {
              const t = TYPES[e.type] || TYPES.autre;
              return (
                <div key={e.id} className="event-card event-past" style={{ borderLeftColor: t.color }}>
                  <div className="event-icon">{t.icon}</div>
                  <div className="event-body">
                    <div className="event-date">📅 {e.date_event}</div>
                    <h3>{e.titre}</h3>
                  </div>
                  <button className="btn btn-sm btn-danger" onClick={() => remove(e.id)}>🗑</button>
                </div>
              );
            })}
          </div>
        </>
      )}
      {evenements.length === 0 && <p className="empty">Tsy misy événement.</p>}
      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>🎉 Événement</h2>
            <form onSubmit={submit}>
              <div className="form-group">
                <label>Titre *</label>
                <input value={form.titre} required
                  onChange={(e) => setForm({ ...form, titre: e.target.value })} />
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label>Date *</label>
                  <input type="date" value={form.date_event} required
                    onChange={(e) => setForm({ ...form, date_event: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Heure</label>
                  <input type="time" value={form.heure}
                    onChange={(e) => setForm({ ...form, heure: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Type</label>
                  <select value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}>
                    {Object.entries(TYPES).map(([k, v]) => (
                      <option key={k} value={k}>{v.icon} {v.label}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Lieu</label>
                  <input value={form.lieu}
                    onChange={(e) => setForm({ ...form, lieu: e.target.value })} />
                </div>
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })} />
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
