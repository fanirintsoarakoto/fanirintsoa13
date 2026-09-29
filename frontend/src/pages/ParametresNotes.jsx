import { useEffect, useState } from "react";
import { apiFetch } from "../api";

export default function ParametresNotes({ toast }) {
  const [tab, setTab] = useState("config");
  const [config, setConfig] = useState({
    note_max: "20", note_min_pass: "10", coefficient_max: "10",
    bareme_defaut: "sur20", moyenne_type: "ponderee", arrondi_decimales: "2",
  });
  const [matieres, setMatieres] = useState([]);
  const [classes, setClasses] = useState([]);
  const [edited, setEdited] = useState({});
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [mForm, setMForm] = useState({ nom: "", coefficient: 1, classe_id: "" });

  async function loadConfig() {
    try {
      const data = await apiFetch("/notes/config");
      setConfig({ ...config, ...data });
    } catch (e) {}
  }

  async function loadMatieres() {
    try {
      const data = await apiFetch("/matieres");
      setMatieres(data);
      setEdited({});
    } catch (e) { setMatieres([]); }
  }

  async function loadClasses() {
    try { setClasses(await apiFetch("/classes")); } catch (e) {}
  }

  useEffect(() => { loadConfig(); loadMatieres(); loadClasses(); }, []);

  async function saveConfig() {
    setSaving(true);
    try {
      await apiFetch("/notes/config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });
      toast("✅ Configuration voatahiry");
    } catch (e) { toast(e.message, "error"); }
    finally { setSaving(false); }
  }

  async function saveCoefs() {
    const items = Object.entries(edited).map(([id, coef]) => ({
      id: Number(id), coefficient: Number(coef),
    }));
    if (items.length === 0) {
      toast("Tsy misy fanovana", "error");
      return;
    }
    setSaving(true);
    try {
      await apiFetch("/matieres/coefficients/bulk", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      });
      toast(`✅ ${items.length} coefficient(s) nohavaozina`);
      loadMatieres();
    } catch (e) { toast(e.message, "error"); }
    finally { setSaving(false); }
  }

  function setCoef(id, val) {
    setEdited({ ...edited, [id]: val });
  }

  function openAdd() {
    setMForm({ nom: "", coefficient: 1, classe_id: "" });
    setEditing(null);
    setShowModal(true);
  }

  function openEdit(m) {
    setMForm({
      nom: m.nom, coefficient: m.coefficient,
      classe_id: m.classe_id || "",
    });
    setEditing(m.id);
    setShowModal(true);
  }

  async function submitMatiere(e) {
    e.preventDefault();
    try {
      const body = {
        nom: mForm.nom,
        coefficient: Number(mForm.coefficient),
        classe_id: mForm.classe_id ? Number(mForm.classe_id) : null,
      };
      if (editing) {
        await apiFetch(`/matieres/${editing}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        toast("Voatahiry ✓");
      } else {
        await apiFetch("/matieres", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        toast("Nampiana ✓");
      }
      setShowModal(false);
      loadMatieres();
    } catch (e) { toast(e.message, "error"); }
  }

  async function removeMatiere(id) {
    if (!confirm("Hamafa io matière io? Ho voafafa koa ny note mifandra aminy.")) return;
    try {
      await apiFetch(`/matieres/${id}`, { method: "DELETE" });
      toast("Voafafa");
      loadMatieres();
    } catch (e) { toast(e.message, "error"); }
  }

  const hasEdits = Object.keys(edited).length > 0;

  return (
    <div>
      <div className="page-header">
        <h1>📝 Configuration des Notes</h1>
      </div>

      <div className="attendance-tabs">
        <button className={tab === "config" ? "active" : ""} onClick={() => setTab("config")}>
          ⚙️ Paramètres généraux
        </button>
        <button className={tab === "matieres" ? "active" : ""} onClick={() => setTab("matieres")}>
          📚 Matières ({matieres.length})
        </button>
        <button className={tab === "coefs" ? "active" : ""} onClick={() => setTab("coefs")}>
          📊 Coefficients
        </button>
      </div>

      {tab === "config" && (
        <div className="card">
          <h3>📋 Paramètres généraux des notes</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>Note maximale</label>
              <input type="number" value={config.note_max}
                onChange={(e) => setConfig({ ...config, note_max: e.target.value })} />
              <small style={{ color: "var(--text-muted)" }}>Ohatra: 20</small>
            </div>
            <div className="form-group">
              <label>Note minimale de réussite</label>
              <input type="number" value={config.note_min_pass}
                onChange={(e) => setConfig({ ...config, note_min_pass: e.target.value })} />
              <small style={{ color: "var(--text-muted)" }}>Ambany = tsy nahazo</small>
            </div>
            <div className="form-group">
              <label>Coefficient maximale</label>
              <input type="number" value={config.coefficient_max}
                onChange={(e) => setConfig({ ...config, coefficient_max: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Barème</label>
              <select value={config.bareme_defaut}
                onChange={(e) => setConfig({ ...config, bareme_defaut: e.target.value })}>
                <option value="sur20">Sur 20</option>
                <option value="sur100">Sur 100</option>
                <option value="sur10">Sur 10</option>
              </select>
            </div>
            <div className="form-group">
              <label>Type de moyenne</label>
              <select value={config.moyenne_type}
                onChange={(e) => setConfig({ ...config, moyenne_type: e.target.value })}>
                <option value="ponderee">Pondérée (coefficients)</option>
                <option value="simple">Simple</option>
              </select>
            </div>
            <div className="form-group">
              <label>Décimales d'arrondi</label>
              <select value={config.arrondi_decimales}
                onChange={(e) => setConfig({ ...config, arrondi_decimales: e.target.value })}>
                <option value="0">0</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
              </select>
            </div>
          </div>
          <div className="modal-actions">
            <button className="btn" onClick={saveConfig} disabled={saving}>
              {saving ? "..." : "💾 Tehirizo"}
            </button>
          </div>
        </div>
      )}

      {tab === "matieres" && (
        <div className="card">
          <div className="page-header" style={{ marginBottom: 12 }}>
            <h3 style={{ margin: 0 }}>📚 Lisitry ny matières</h3>
            <button className="btn" onClick={openAdd}>+ Matière vaovao</button>
          </div>
          {matieres.length === 0 ? (
            <p className="empty">Tsy misy matière. Tsindrio "+ Matière vaovao".</p>
          ) : (
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Matière</th>
                    <th>Classe</th>
                    <th>Coefficient</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {matieres.map(m => (
                    <tr key={m.id}>
                      <td><strong>{m.nom}</strong></td>
                      <td>{m.classe_nom || "Rehetra"}</td>
                      <td><span className="badge info">× {m.coefficient}</span></td>
                      <td>
                        <div style={{ display: "flex", gap: 4 }}>
                          <button className="btn btn-sm btn-secondary"
                            onClick={() => openEdit(m)}>✏️</button>
                          <button className="btn btn-sm btn-danger"
                            onClick={() => removeMatiere(m.id)}>🗑</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {tab === "coefs" && (
        <div className="card">
          <div className="page-header" style={{ marginBottom: 12 }}>
            <h3 style={{ margin: 0 }}>📊 Coefficients par matière</h3>
            <button className="btn" onClick={saveCoefs}
              disabled={saving || !hasEdits}>
              {saving ? "..." : `💾 Tehirizo ${hasEdits ? `(${Object.keys(edited).length})` : ""}`}
            </button>
          </div>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: 16 }}>
            Ny coefficient dia mampitombo ny lanjan'ny note amin'ny moyenne générale.
          </p>
          {matieres.length === 0 ? (
            <p className="empty">Tsy misy matière.</p>
          ) : (
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Matière</th>
                    <th>Classe</th>
                    <th style={{ width: 160 }}>Coefficient</th>
                  </tr>
                </thead>
                <tbody>
                  {matieres.map(m => {
                    const current = edited[m.id] !== undefined ? edited[m.id] : m.coefficient;
                    const isEdited = edited[m.id] !== undefined;
                    return (
                      <tr key={m.id} style={{
                        background: isEdited ? "rgba(79, 70, 229, 0.08)" : "transparent"
                      }}>
                        <td>
                          <strong>{m.nom}</strong>
                          {isEdited && (
                            <span className="badge info" style={{ marginLeft: 8 }}>
                              ✏️ {m.coefficient} → {edited[m.id]}
                            </span>
                          )}
                        </td>
                        <td>{m.classe_nom || "Rehetra"}</td>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <button type="button" className="btn btn-sm btn-secondary"
                              onClick={() => {
                                const v = Number(current) - 1;
                                if (v >= 1) setCoef(m.id, v);
                              }}>−</button>
                            <input type="number" min="1"
                              max={config.coefficient_max || 10}
                              value={current}
                              onChange={(e) => setCoef(m.id, Number(e.target.value))}
                              style={{
                                width: 60, textAlign: "center",
                                padding: 6, borderRadius: 6,
                                border: "1.5px solid var(--border)",
                                background: "var(--bg)", color: "var(--text)",
                                fontWeight: 700,
                              }} />
                            <button type="button" className="btn btn-sm btn-secondary"
                              onClick={() => {
                                const v = Number(current) + 1;
                                if (v <= (Number(config.coefficient_max) || 10))
                                  setCoef(m.id, v);
                              }}>+</button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
          {hasEdits && (
            <div style={{
              marginTop: 16, padding: 12,
              background: "#eef2ff", borderRadius: 10,
              border: "1px solid #c7d2fe",
              fontSize: "0.9rem", color: "#4f46e5",
            }}>
              ✏️ <strong>{Object.keys(edited).length}</strong> fanovana tsy mbola voatahiry
            </div>
          )}
        </div>
      )}

      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>{editing ? "✏️ Ovay matière" : "➕ Matière vaovao"}</h2>
            <form onSubmit={submitMatiere}>
              <div className="form-group">
                <label>Anaran'ny matière *</label>
                <input value={mForm.nom} required
                  onChange={(e) => setMForm({ ...mForm, nom: e.target.value })}
                  placeholder="Ohatra: Matematika, Malagasy, Anglais..." />
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label>Coefficient</label>
                  <input type="number" min="1"
                    max={config.coefficient_max || 10}
                    value={mForm.coefficient}
                    onChange={(e) => setMForm({ ...mForm, coefficient: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Classe (tsy voatery)</label>
                  <select value={mForm.classe_id}
                    onChange={(e) => setMForm({ ...mForm, classe_id: e.target.value })}>
                    <option value="">Rehetra</option>
                    {classes.map(c => (
                      <option key={c.id} value={c.id}>{c.nom}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary"
                  onClick={() => setShowModal(false)}>Hiala</button>
                <button type="submit" className="btn">💾 Tehirizo</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
