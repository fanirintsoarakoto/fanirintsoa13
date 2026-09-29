import { useEffect, useState, useRef } from "react";
import { apiFetch } from "../api";

export default function Profile({ toast, onUpdate }) {
  const [profile, setProfile] = useState(null);
  const [tab, setTab] = useState("info");
  const [form, setForm] = useState({ prenom: "", telephone: "", email: "", photo: "" });
  const [pwd, setPwd] = useState({ old_password: "", new_password: "", confirm: "" });
  const [saving, setSaving] = useState(false);
  const fileRef = useRef(null);

  async function load() {
    const p = await apiFetch("/profile");
    setProfile(p);
    setForm({ prenom: p.prenom || "", telephone: p.telephone || "",
              email: p.email || "", photo: p.photo || "" });
  }
  useEffect(() => { load(); }, []);

  async function saveInfo(e) {
    e.preventDefault(); setSaving(true);
    try {
      await apiFetch("/profile", {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      toast("Voatahiry ✓");
      load();
      const me = await apiFetch("/auth/me");
      onUpdate?.(me);
    } catch (e) { toast(e.message, "error"); }
    finally { setSaving(false); }
  }

  async function savePassword(e) {
    e.preventDefault();
    if (pwd.new_password !== pwd.confirm) {
      toast("Tsy mifanaraka", "error"); return;
    }
    try {
      await apiFetch("/profile/password", {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ old_password: pwd.old_password, new_password: pwd.new_password }),
      });
      toast("Voaova ✓");
      setPwd({ old_password: "", new_password: "", confirm: "" });
    } catch (e) { toast(e.message, "error"); }
  }

  function handlePhoto(e) {
    const f = e.target.files[0];
    if (!f) return;
    if (f.size > 2 * 1024 * 1024) { toast("Lehibe loatra (max 2MB)", "error"); return; }
    const reader = new FileReader();
    reader.onload = (ev) => setForm({ ...form, photo: ev.target.result });
    reader.readAsDataURL(f);
  }

  if (!profile) return <div className="loading">⏳...</div>;

  return (
    <div>
      <h1>👤 Mon profil</h1>

      <div className="attendance-tabs">
        <button className={tab === "info" ? "active" : ""} onClick={() => setTab("info")}>
          📋 Informations
        </button>
        <button className={tab === "password" ? "active" : ""} onClick={() => setTab("password")}>
          🔒 Mot de passe
        </button>
      </div>

      {tab === "info" && (
        <div className="card">
          <div style={{ textAlign: "center", marginBottom: 20 }}>
            <div className="profile-photo" onClick={() => fileRef.current?.click()}>
              {form.photo ? <img src={form.photo} alt="" /> : <span>📷</span>}
            </div>
            <input ref={fileRef} type="file" accept="image/*"
              style={{ display: "none" }} onChange={handlePhoto} />
            <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginTop: 8 }}>
              Tsindrio ny sary hanovana
            </p>
          </div>

          <form onSubmit={saveInfo}>
            <div className="form-grid">
              <div className="form-group">
                <label>Anarana (username)</label>
                <input value={profile.username} disabled />
              </div>
              <div className="form-group">
                <label>Rôle</label>
                <input value={profile.role} disabled />
              </div>
              <div className="form-group">
                <label>Fanampiny</label>
                <input value={form.prenom}
                  onChange={(e) => setForm({ ...form, prenom: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Téléphone</label>
                <input value={form.telephone}
                  onChange={(e) => setForm({ ...form, telephone: e.target.value })} />
              </div>
            </div>
            <div className="modal-actions">
              <button type="submit" className="btn" disabled={saving}>
                {saving ? "..." : "💾 Tehirizo"}
              </button>
            </div>
          </form>
        </div>
      )}

      {tab === "password" && (
        <div className="card">
          <form onSubmit={savePassword}>
            <div className="form-group">
              <label>Teny miafina taloha</label>
              <input type="password" value={pwd.old_password}
                onChange={(e) => setPwd({ ...pwd, old_password: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Teny miafina vaovao</label>
              <input type="password" value={pwd.new_password}
                onChange={(e) => setPwd({ ...pwd, new_password: e.target.value })}
                required minLength={4} />
            </div>
            <div className="form-group">
              <label>Hamafiso</label>
              <input type="password" value={pwd.confirm}
                onChange={(e) => setPwd({ ...pwd, confirm: e.target.value })}
                required minLength={4} />
            </div>
            <div className="modal-actions">
              <button type="submit" className="btn">🔒 Ovay</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
