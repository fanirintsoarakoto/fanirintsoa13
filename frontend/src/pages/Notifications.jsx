import { useEffect, useState } from "react";
import { apiFetch } from "../api";

const TYPES = {
  absence: { icon: "❌", color: "#ef4444" },
  paiement: { icon: "💰", color: "#eab308" },
  note: { icon: "📝", color: "#3b82f6" },
  annonce: { icon: "📢", color: "#8b5cf6" },
  info: { icon: "ℹ️", color: "#64748b" },
};

export default function Notifications({ toast }) {
  const [notifs, setNotifs] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ titre: "", contenu: "", type: "info" });

  async function load() { setNotifs(await apiFetch("/notifications")); }
  useEffect(() => { load(); }, []);

  async function markLu(id) {
    await apiFetch(`/notifications/${id}/lu`, { method: "PUT" });
    load();
  }
  async function remove(id) {
    await apiFetch(`/notifications/${id}`, { method: "DELETE" });
    load();
  }
  async function autoGenerate(type) {
    try {
      const r = await apiFetch("/notifications/auto", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type }),
      });
      toast(`✅ ${r.count} notification`);
      load();
    } catch (e) { toast(e.message, "error"); }
  }
  async function submit(e) {
    e.preventDefault();
    await apiFetch("/notifications", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    toast("Nampiana ✓");
    setShowModal(false);
    setForm({ titre: "", contenu: "", type: "info" });
    load();
  }

  const unread = notifs.filter(n => !n.lu).length;

  return (
    <div>
      <div className="page-header">
        <h1>🔔 Notifications {unread > 0 && <span className="badge danger">{unread}</span>}</h1>
        <div className="page-actions">
          <button className="btn btn-secondary" onClick={() => autoGenerate("absences")}>📊 Auto absences</button>
          <button className="btn btn-secondary" onClick={() => autoGenerate("paiements")}>💰 Auto paiements</button>
          <button className="btn btn-pdf-export" onClick={() => setShowModal(true)}>+ Notification</button>
        </div>
      </div>
      {notifs.length === 0 ? <p className="empty">Tsy misy notification.</p> : (
        <div className="notifs-list">
          {notifs.map(n => {
            const t = TYPES[n.type] || TYPES.info;
            return (
              <div key={n.id} className={`notif-card ${!n.lu ? "unread" : ""}`}
                   style={{ borderLeftColor: t.color }}>
                <div className="notif-icon" style={{ background: t.color + "22", color: t.color }}>
                  {t.icon}
                </div>
                <div className="notif-body">
                  <strong>{n.titre}</strong>
                  <p>{n.contenu}</p>
                  <small>{new Date(n.created_at).toLocaleString("fr-FR")}</small>
                </div>
                <div className="notif-actions">
                  {!n.lu && <button className="btn btn-sm btn-success" onClick={() => markLu(n.id)}>✓</button>}
                  <button className="btn btn-sm btn-danger" onClick={() => remove(n.id)}>🗑</button>
                </div>
              </div>
            );
          })}
        </div>
      )}
      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>🔔 Notification</h2>
            <form onSubmit={submit}>
              <div className="form-group">
                <label>Titre *</label>
                <input value={form.titre} required onChange={(e) => setForm({ ...form, titre: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Type</label>
                <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                  {Object.keys(TYPES).map(k => (
                    <option key={k} value={k}>{TYPES[k].icon} {k}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Contenu</label>
                <textarea value={form.contenu}
                  onChange={(e) => setForm({ ...form, contenu: e.target.value })} />
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
