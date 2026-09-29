import { useEffect, useState } from "react";
import { apiFetch } from "../api";

export default function ParametresEtab({ toast }) {
  const [params, setParams] = useState({});
  const [saving, setSaving] = useState(false);

  async function load() { setParams(await apiFetch("/parametres")); }
  useEffect(() => { load(); }, []);

  async function save() {
    setSaving(true);
    try {
      await apiFetch("/parametres", {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });
      toast("Voatahiry ✓");
    } catch (e) { toast(e.message, "error"); }
    finally { setSaving(false); }
  }
  const update = (k, v) => setParams({ ...params, [k]: v });

  return (
    <div>
      <div className="page-header">
        <h1>⚙️ Paramètres établissement</h1>
        <button className="btn" onClick={save} disabled={saving}>
          {saving ? "..." : "💾 Tehirizo"}
        </button>
      </div>
      <div className="card">
        <h3>🏫 Informations</h3>
        <div className="form-grid">
          <div className="form-group">
            <label>Anaran'ny établissement</label>
            <input value={params.etablissement_nom || ""}
              onChange={(e) => update("etablissement_nom", e.target.value)} />
          </div>
          <div className="form-group">
            <label>Adresse</label>
            <input value={params.etablissement_adresse || ""}
              onChange={(e) => update("etablissement_adresse", e.target.value)} />
          </div>
          <div className="form-group">
            <label>Téléphone</label>
            <input value={params.etablissement_telephone || ""}
              onChange={(e) => update("etablissement_telephone", e.target.value)} />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input value={params.etablissement_email || ""}
              onChange={(e) => update("etablissement_email", e.target.value)} />
          </div>
          <div className="form-group">
            <label>Année académique</label>
            <input value={params.annee_academique || ""}
              onChange={(e) => update("annee_academique", e.target.value)} />
          </div>
          <div className="form-group">
            <label>Devise</label>
            <input value={params.devise || ""}
              onChange={(e) => update("devise", e.target.value)} />
          </div>
          <div className="form-group">
            <label>Logo (URL)</label>
            <input value={params.etablissement_logo || ""}
              onChange={(e) => update("etablissement_logo", e.target.value)}
              placeholder="https://..." />
          </div>
        </div>
        {params.etablissement_logo && (
          <div style={{ marginTop: 12, textAlign: "center" }}>
            <img src={params.etablissement_logo} alt="logo"
                 style={{ maxHeight: 80, borderRadius: 8 }} />
          </div>
        )}
      </div>
    </div>
  );
}
