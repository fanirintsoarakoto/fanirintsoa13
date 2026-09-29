import { useEffect, useState } from "react";
import { apiFetch } from "../api";

const STATUTS = {
  brouillon: { label: "📝 Brouillon", color: "#94a3b8" },
  publie: { label: "✅ Publié", color: "#22c55e" },
  archive: { label: "📦 Archivé", color: "#64748b" },
};

export default function AdminPublications({ toast }) {
  const [tab, setTab] = useState("annonces");
  const [items, setItems] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [filterStatut, setFilterStatut] = useState("");
  const [search, setSearch] = useState("");

  const [aForm, setAForm] = useState({
    titre: "", contenu: "", image_url: "", categorie: "general",
    type: "annonce", priorite: "normale", statut: "brouillon",
    date_debut: new Date().toISOString().slice(0, 10), date_fin: "",
  });
  const [eForm, setEForm] = useState({
    titre: "", description: "", image_url: "", categorie: "general",
    type: "autre", statut: "brouillon",
    date_event: new Date().toISOString().slice(0, 10),
    heure: "", date_fin: "", lieu: "",
  });

  async function load() {
    try {
      const params = new URLSearchParams();
      if (filterStatut) params.set("statut", filterStatut);
      if (search) params.set("search", search);
      const endpoint = tab === "annonces" ? "/annonces" : "/evenements";
      setItems(await apiFetch(`${endpoint}?${params}`));
    } catch (e) { setItems([]); }
  }
  useEffect(() => { load(); }, [tab, filterStatut, search]);

  function openAdd() { setEditing(null); setShowModal(true); }
  function openEdit(it) {
    setEditing(it.id);
    if (tab === "annonces") {
      setAForm({
        titre: it.titre || "", contenu: it.contenu || "",
        image_url: it.image_url || "", categorie: it.categorie || "general",
        type: it.type || "annonce", priorite: it.priorite || "normale",
        statut: it.statut || "brouillon",
        date_debut: it.date_debut || "", date_fin: it.date_fin || "",
      });
    } else {
      setEForm({
        titre: it.titre || "", description: it.description || "",
        image_url: it.image_url || "", categorie: it.categorie || "general",
        type: it.type || "autre", statut: it.statut || "brouillon",
        date_event: it.date_event || "", heure: it.heure || "",
        date_fin: it.date_fin || "", lieu: it.lieu || "",
      });
    }
    setShowModal(true);
  }

  async function submit(e) {
    e.preventDefault();
    try {
      if (tab === "annonces") {
        if (editing) {
          await apiFetch(`/annonces/${editing}`, {
            method: "PUT", headers: { "Content-Type": "application/json" },
            body: JSON.stringify(aForm),
          });
        } else {
          await apiFetch("/annonces", {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify(aForm),
          });
        }
      } else {
        if (editing) {
          await apiFetch(`/evenements/${editing}`, {
            method: "PUT", headers: { "Content-Type": "application/json" },
            body: JSON.stringify(eForm),
          });
        } else {
          await apiFetch("/evenements", {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify(eForm),
          });
        }
      }
      toast("✅ Voatahiry");
      setShowModal(false); load();
    } catch (err) { toast(err.message, "error"); }
  }

  async function publier(id, depublier = false) {
    const ep = tab === "annonces" ? "annonces" : "evenements";
    const action = depublier ? "depublier" : "publier";
    await apiFetch(`/${ep}/${id}/${action}`, { method: "POST" });
    toast(depublier ? "Dépublié" : "✅ Publié");
    load();
  }

  async function remove(id) {
    if (!confirm("Hamafa?")) return;
    const ep = tab === "annonces" ? "annonces" : "evenements";
    await apiFetch(`/${ep}/${id}`, { method: "DELETE" });
    toast("Voafafa"); load();
  }

  return (
    <div>
      <div className="page-header">
        <h1>📢 Annonces & Événements</h1>
        <button className="btn btn-pdf-export" onClick={openAdd}>
          + {tab === "annonces" ? "Annonce" : "Événement"}
        </button>
      </div>

      <div className="attendance-tabs">
        <button className={tab === "annonces" ? "active" : ""}
          onClick={() => { setTab("annonces"); setEditing(null); }}>
          📢 Annonces
        </button>
        <button className={tab === "evenements" ? "active" : ""}
          onClick={() => { setTab("evenements"); setEditing(null); }}>
          🎉 Événements
        </button>
      </div>

      <div className="toolbar">
        <input placeholder="🔍 Mitady..." value={search}
          onChange={(e) => setSearch(e.target.value)} />
        <select value={filterStatut} onChange={(e) => setFilterStatut(e.target.value)}>
          <option value="">Statut rehetra</option>
          {Object.entries(STATUTS).map(([k, v]) => (
            <option key={k} value={k}>{v.label}</option>
          ))}
        </select>
      </div>

      {items.length === 0 ? <p className="empty">Tsy misy publication.</p> : (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr><th>Titre</th><th>Catégorie</th><th>Statut</th><th>Date</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {items.map(it => {
                const st = STATUTS[it.statut] || {};
                return (
                  <tr key={it.id}>
                    <td><strong>{it.titre}</strong></td>
                    <td>{it.categorie || "—"}</td>
                    <td>
                      <span className="badge" style={{ background: st.color + "33", color: st.color }}>
                        {st.label || it.statut}
                      </span>
                    </td>
                    <td>
                      {tab === "annonces"
                        ? (it.date_debut || it.created_at?.slice(0, 10))
                        : it.date_event}
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: 4 }}>
                        <button className="btn btn-sm btn-secondary" onClick={() => openEdit(it)}>✏️</button>
                        {it.statut === "publie" ? (
                          <button className="btn btn-sm btn-warn" onClick={() => publier(it.id, true)}>📥</button>
                        ) : (
                          <button className="btn btn-sm btn-success" onClick={() => publier(it.id)}>✅</button>
                        )}
                        <button className="btn btn-sm btn-danger" onClick={() => remove(it.id)}>🗑</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>{editing ? "✏️ Ovay" : "➕"} {tab === "annonces" ? "Annonce" : "Événement"}</h2>
            {tab === "annonces" ? (
              <form onSubmit={submit}>
                <div className="form-group">
                  <label>Titre *</label>
                  <input value={aForm.titre} required
                    onChange={(e) => setAForm({ ...aForm, titre: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Contenu *</label>
                  <textarea value={aForm.contenu} required rows={5}
                    onChange={(e) => setAForm({ ...aForm, contenu: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Image URL</label>
                  <input value={aForm.image_url} placeholder="https://..."
                    onChange={(e) => setAForm({ ...aForm, image_url: e.target.value })} />
                </div>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Catégorie</label>
                    <input value={aForm.categorie}
                      onChange={(e) => setAForm({ ...aForm, categorie: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label>Priorité</label>
                    <select value={aForm.priorite}
                      onChange={(e) => setAForm({ ...aForm, priorite: e.target.value })}>
                      <option value="normale">Normale</option>
                      <option value="importante">Importante</option>
                      <option value="urgente">Urgente</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Statut</label>
                    <select value={aForm.statut}
                      onChange={(e) => setAForm({ ...aForm, statut: e.target.value })}>
                      <option value="brouillon">📝 Brouillon</option>
                      <option value="publie">✅ Publié</option>
                      <option value="archive">📦 Archivé</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Date début</label>
                    <input type="date" value={aForm.date_debut}
                      onChange={(e) => setAForm({ ...aForm, date_debut: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label>Date fin</label>
                    <input type="date" value={aForm.date_fin}
                      onChange={(e) => setAForm({ ...aForm, date_fin: e.target.value })} />
                  </div>
                </div>
                <div className="modal-actions">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Hiala</button>
                  <button type="submit" className="btn">💾 Tehirizo</button>
                </div>
              </form>
            ) : (
              <form onSubmit={submit}>
                <div className="form-group">
                  <label>Titre *</label>
                  <input value={eForm.titre} required
                    onChange={(e) => setEForm({ ...eForm, titre: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea value={eForm.description} rows={4}
                    onChange={(e) => setEForm({ ...eForm, description: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Image URL</label>
                  <input value={eForm.image_url} placeholder="https://..."
                    onChange={(e) => setEForm({ ...eForm, image_url: e.target.value })} />
                </div>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Type</label>
                    <select value={eForm.type}
                      onChange={(e) => setEForm({ ...eForm, type: e.target.value })}>
                      <option value="examen">📝 Examen</option>
                      <option value="fete">🎉 Fête</option>
                      <option value="reunion">👥 Réunion</option>
                      <option value="sport">⚽ Sport</option>
                      <option value="sortie">🚌 Sortie</option>
                      <option value="autre">📌 Autre</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Catégorie</label>
                    <input value={eForm.categorie}
                      onChange={(e) => setEForm({ ...eForm, categorie: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label>Statut</label>
                    <select value={eForm.statut}
                      onChange={(e) => setEForm({ ...eForm, statut: e.target.value })}>
                      <option value="brouillon">📝 Brouillon</option>
                      <option value="publie">✅ Publié</option>
                      <option value="archive">📦 Archivé</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Date événement *</label>
                    <input type="date" value={eForm.date_event} required
                      onChange={(e) => setEForm({ ...eForm, date_event: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label>Heure</label>
                    <input type="time" value={eForm.heure}
                      onChange={(e) => setEForm({ ...eForm, heure: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label>Date fin</label>
                    <input type="date" value={eForm.date_fin}
                      onChange={(e) => setEForm({ ...eForm, date_fin: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label>Lieu</label>
                    <input value={eForm.lieu}
                      onChange={(e) => setEForm({ ...eForm, lieu: e.target.value })} />
                  </div>
                </div>
                <div className="modal-actions">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Hiala</button>
                  <button type="submit" className="btn">💾 Tehirizo</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
