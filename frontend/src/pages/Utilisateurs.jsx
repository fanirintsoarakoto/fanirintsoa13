import { useEffect, useState } from "react";
import { apiFetch } from "../api";

const ROLES = {
  admin: { label: "Administrateur", color: "#ef4444", icon: "👑" },
  responsable: { label: "Responsable", color: "#3b82f6", icon: "📱" },
  enseignant: { label: "Enseignant", color: "#10b981", icon: "👨‍🏫" },
  comptable: { label: "Comptable", color: "#eab308", icon: "💰" },
  direction: { label: "Direction", color: "#8b5cf6", icon: "🏢" },
};

export default function Utilisateurs({ toast }) {
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    username: "", email: "", password: "", role: "responsable",
    active: 1, prenom: "", telephone: "",
  });

  async function load() { setUsers(await apiFetch("/users")); }
  useEffect(() => { load(); }, []);

  function openAdd() {
    setForm({ username: "", email: "", password: "", role: "responsable",
      active: 1, prenom: "", telephone: "" });
    setEditing(null); setShowModal(true);
  }
  function openEdit(u) {
    setForm({ ...u, password: "" });
    setEditing(u.id); setShowModal(true);
  }

  async function submit(e) {
    e.preventDefault();
    try {
      if (editing) {
        const body = { role: form.role, active: form.active,
          prenom: form.prenom, telephone: form.telephone };
        if (form.password) body.password = form.password;
        await apiFetch(`/users/${editing}`, {
          method: "PUT", headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        toast("Voatahiry ✓");
      } else {
        await apiFetch("/users", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        toast("Nampiana ✓");
      }
      setShowModal(false); load();
    } catch (e) { toast(e.message, "error"); }
  }

  async function resetPwd(u) {
    const p = prompt(`Teny miafina vaovao ho an'ny ${u.username}:`, "1234");
    if (!p) return;
    await apiFetch(`/users/${u.id}/reset-password`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: p }),
    });
    toast("Voaova ny teny miafina");
  }

  async function remove(id) {
    if (!confirm("Hamafa?")) return;
    await apiFetch(`/users/${id}`, { method: "DELETE" });
    toast("Voafafa"); load();
  }

  return (
    <div>
      <div className="page-header">
        <h1>👥 Utilisateurs ({users.length})</h1>
        <button className="btn btn-pdf-export" onClick={openAdd}>+ Utilisateur</button>
      </div>

      <div className="users-grid">
        {users.map(u => {
          const r = ROLES[u.role] || ROLES.responsable;
          return (
            <div key={u.id} className="user-card" style={{ borderTopColor: r.color }}>
              <div className="user-icon">{r.icon}</div>
              <h3>{u.prenom ? `${u.prenom} (${u.username})` : u.username}</h3>
              <p>{u.email}</p>
              <div className="user-meta">
                <span className="badge" style={{ background: r.color + "33", color: r.color }}>
                  {r.label}
                </span>
                {!u.active && <span className="badge absent">Désactivé</span>}
              </div>
              <div className="user-actions">
                <button className="btn btn-sm btn-secondary" onClick={() => openEdit(u)}>✏️</button>
                <button className="btn btn-sm btn-warn" onClick={() => resetPwd(u)}>🔑</button>
                <button className="btn btn-sm btn-danger" onClick={() => remove(u.id)}>🗑</button>
              </div>
            </div>
          );
        })}
      </div>

      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>{editing ? "✏️ Ovay utilisateur" : "➕ Utilisateur vaovao"}</h2>
            <form onSubmit={submit}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Anarana *</label>
                  <input value={form.username} disabled={!!editing} required
                    onChange={(e) => setForm({ ...form, username: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Email *</label>
                  <input type="email" value={form.email} disabled={!!editing} required
                    onChange={(e) => setForm({ ...form, email: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Fanampiny</label>
                  <input value={form.prenom}
                    onChange={(e) => setForm({ ...form, prenom: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Téléphone</label>
                  <input value={form.telephone}
                    onChange={(e) => setForm({ ...form, telephone: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>{editing ? "Teny miafina vaovao (foana=tsy ovaina)" : "Teny miafina *"}</label>
                  <input type="password" value={form.password} required={!editing}
                    onChange={(e) => setForm({ ...form, password: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Rôle</label>
                  <select value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}>
                    {Object.entries(ROLES).map(([k, v]) => (
                      <option key={k} value={k}>{v.icon} {v.label}</option>
                    ))}
                  </select>
                </div>
                {editing && (
                  <div className="form-group">
                    <label>Statut</label>
                    <select value={form.active ? 1 : 0}
                      onChange={(e) => setForm({ ...form, active: Number(e.target.value) })}>
                      <option value={1}>Actif</option>
                      <option value={0}>Désactivé</option>
                    </select>
                  </div>
                )}
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
