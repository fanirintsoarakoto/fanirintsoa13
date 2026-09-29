import { useEffect, useState } from "react";
import { apiFetch } from "../api";

export default function ParametresPresence({ toast }) {
  const [params, setParams] = useState({
    tolerance_minutes: 10,
    limite_retard_minutes: 30,
    doublon_minutes: 5,
    notif_retard: 1,
    notif_absence: 1,
    notif_depart: 1,
  });
  const [saving, setSaving] = useState(false);

  async function load() {
    const all = await apiFetch("/parametres");
    setParams(prev => ({ ...prev, ...all }));
  }
  useEffect(() => { load(); }, []);

  async function save() {
    setSaving(true);
    try {
      await apiFetch("/parametres", {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tolerance_minutes: String(params.tolerance_minutes),
          limite_retard_minutes: String(params.limite_retard_minutes),
          doublon_minutes: String(params.doublon_minutes),
          notif_retard: String(params.notif_retard),
          notif_absence: String(params.notif_absence),
          notif_depart: String(params.notif_depart),
        }),
      });
      toast("Voatahiry ✓");
    } catch (e) { toast(e.message, "error"); }
    finally { setSaving(false); }
  }

  const set = (k, v) => setParams({ ...params, [k]: v });

  return (
    <div>
      <div className="page-header">
        <h1>⚙️ Paramètres de présence</h1>
        <button className="btn" onClick={save} disabled={saving}>
          {saving ? "..." : "💾 Tehirizo"}
        </button>
      </div>

      <div className="card">
        <h3>⏰ Tolérance & Retard</h3>
        <div className="form-grid">
          <div className="form-group">
            <label>Tolérance (min)</label>
            <input type="number" value={params.tolerance_minutes || 10}
              onChange={(e) => set("tolerance_minutes", e.target.value)} />
            <small>Ex: 10 → à l'heure jusqu'à 07:40</small>
          </div>
          <div className="form-group">
            <label>Limite Retard → Très en retard (min)</label>
            <input type="number" value={params.limite_retard_minutes || 30}
              onChange={(e) => set("limite_retard_minutes", e.target.value)} />
          </div>
          <div className="form-group">
            <label>Anti-doublon (min)</label>
            <input type="number" value={params.doublon_minutes || 5}
              onChange={(e) => set("doublon_minutes", e.target.value)} />
          </div>
        </div>
      </div>

      <div className="card">
        <h3>🔔 Notifications</h3>
        <div className="form-grid">
          <div className="form-group">
            <label>Retard</label>
            <select value={params.notif_retard || 0}
              onChange={(e) => set("notif_retard", Number(e.target.value))}>
              <option value={1}>Actif</option>
              <option value={0}>Désactivé</option>
            </select>
          </div>
          <div className="form-group">
            <label>Absence</label>
            <select value={params.notif_absence || 0}
              onChange={(e) => set("notif_absence", Number(e.target.value))}>
              <option value={1}>Actif</option>
              <option value={0}>Désactivé</option>
            </select>
          </div>
          <div className="form-group">
            <label>Départ anticipé</label>
            <select value={params.notif_depart || 0}
              onChange={(e) => set("notif_depart", Number(e.target.value))}>
              <option value={1}>Actif</option>
              <option value={0}>Désactivé</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
