import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiFetch } from "../api";
import PhotoUpload from "../components/PhotoUpload";
import StudentBadge from "../components/StudentBadge";
import ExportPDF from "../components/ExportPDF";

const empty = {
  matricule: "", nom: "", prenom: "", date_naissance: "", age: "",
  sexe: "M", lieu: "", telephone: "", parent_nom: "",
  parent_telephone: "", classe_id: "", groupe_id: "", situation: "", photo: "",
};

export default function Students({ toast }) {
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [groupes, setGroupes] = useState([]);
  const [search, setSearch] = useState("");
  const [filterClasse, setFilterClasse] = useState("");
  const [filterSexe, setFilterSexe] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState(null);
  const [badgeId, setBadgeId] = useState(null);
  const [newBadge, setNewBadge] = useState(null);
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  async function load() {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (filterClasse) params.set("classe_id", filterClasse);
    if (filterSexe) params.set("sexe", filterSexe);
    const [s, c, g] = await Promise.all([
      apiFetch(`/students?${params}`),
      apiFetch("/classes"),
      apiFetch("/groupes"),
    ]);
    setStudents(s);
    setClasses(c);
    setGroupes(g);
  }

  useEffect(() => { load(); }, [search, filterClasse, filterSexe]);

  function openAdd() {
    setForm(empty);
    setEditing(null);
    setShowModal(true);
  }

  function openEdit(s) {
    setForm({ ...empty, ...s, classe_id: s.classe_id || "", groupe_id: s.groupe_id || "" });
    setEditing(s.id);
    setShowModal(true);
  }

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const body = {
        ...form,
        classe_id: form.classe_id ? Number(form.classe_id) : null,
        groupe_id: form.groupe_id ? Number(form.groupe_id) : null,
        age: form.age ? Number(form.age) : null,
      };
      if (editing) {
        await apiFetch(`/students/${editing}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        toast("Voatahiry ✓");
        setShowModal(false);
      } else {
        const created = await apiFetch("/students", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        toast(`✅ ${created.prenom} ${created.nom} nampiana!`);
        setShowModal(false);
        setNewBadge({
          id: created.id,
          matricule: created.matricule,
          nom: created.nom,
          prenom: created.prenom,
          classe: created.classe_nom,
          groupe: created.groupe_nom,
          photo: created.photo,
        });
      }
      load();
    } catch (e) {
      toast(e.message, "error");
    } finally {
      setLoading(false);
    }
  }

  async function remove(id) {
    if (!confirm("Hamafa io mpianatra io?")) return;
    await apiFetch(`/students/${id}`, { method: "DELETE" });
    toast("Voafafa");
    load();
  }

  const filteredGroupes = form.classe_id
    ? groupes.filter((g) => String(g.classe_id) === String(form.classe_id))
    : groupes;

  return (
    <div>
      <div className="page-header">
        <h1>👥 Élèves ({students.length})</h1>
        <div className="page-actions">
          {/* ✅ Bouton Export PDF — mampiasa ny ExportPDF component */}
          <ExportPDF students={students} title="Lisitry ny mpianatra" />

          <button className="btn btn-secondary" onClick={() => nav("/import-excel")}>
            📥 Import Excel
          </button>
          <button className="btn" onClick={openAdd}>+ Ajouter un élève</button>
        </div>
      </div>

      <div className="toolbar no-print">
        <input placeholder="🔍 Mitady..." value={search}
          onChange={(e) => setSearch(e.target.value)} />
        <select value={filterClasse} onChange={(e) => setFilterClasse(e.target.value)}>
          <option value="">Classe rehetra</option>
          {classes.map((c) => <option key={c.id} value={c.id}>{c.nom}</option>)}
        </select>
        <select value={filterSexe} onChange={(e) => setFilterSexe(e.target.value)}>
          <option value="">Sexe rehetra</option>
          <option value="M">Lahy</option>
          <option value="F">Vavy</option>
        </select>
      </div>

      {students.length === 0 ? (
        <p className="empty">Tsy misy mpianatra.</p>
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th></th>
                <th>Matricule</th>
                <th>Nom</th>
                <th>Prénom</th>
                <th>Classe</th>
                <th>Sexe</th>
                <th>Âge</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {students.map((s) => (
                <tr key={s.id}>
                  <td>
                    {s.photo ? (
                      <img src={s.photo} alt="" style={{ width: 36, height: 36, borderRadius: "50%", objectFit: "cover" }} />
                    ) : (
                      <div style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--border)", display: "flex", alignItems: "center", justifyContent: "center" }}>👤</div>
                    )}
                  </td>
                  <td><strong>{s.matricule}</strong></td>
                  <td>{s.nom}</td>
                  <td>{s.prenom}</td>
                  <td>{s.classe_nom || "—"}</td>
                  <td>{s.sexe === "F" ? "👩" : "👨"}</td>
                  <td>{s.age || "—"}</td>
                  <td>
                    <div style={{ display: "flex", gap: 4 }}>
                      <Link to={`/students/${s.id}`} className="btn btn-sm btn-secondary">👁</Link>
                      <button className="btn btn-sm btn-secondary" onClick={() => openEdit(s)}>✏️</button>
                      <button className="btn btn-sm btn-primary" onClick={() => setBadgeId(s.id)}>🎫</button>
                      <button className="btn btn-sm btn-danger" onClick={() => remove(s.id)}>🗑</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>{editing ? "✏️ Ovay mpianatra" : "➕ Mpianatra vaovao"}</h2>
            {editing && (
              <PhotoUpload studentId={editing} current={form.photo}
                onUpdate={(photo) => setForm({ ...form, photo })} />
            )}
            <form onSubmit={submit}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Matricule (auto)</label>
                  <input value={form.matricule} disabled={!!editing}
                    onChange={(e) => setForm({ ...form, matricule: e.target.value })}
                    placeholder="Auto" />
                </div>
                <div className="form-group">
                  <label>Nom *</label>
                  <input value={form.nom} required
                    onChange={(e) => setForm({ ...form, nom: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Prénom *</label>
                  <input value={form.prenom} required
                    onChange={(e) => setForm({ ...form, prenom: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Date naissance</label>
                  <input type="date" value={form.date_naissance || ""}
                    onChange={(e) => setForm({ ...form, date_naissance: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Sexe</label>
                  <select value={form.sexe} onChange={(e) => setForm({ ...form, sexe: e.target.value })}>
                    <option value="M">Lahy</option>
                    <option value="F">Vavy</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Lieu</label>
                  <input value={form.lieu} onChange={(e) => setForm({ ...form, lieu: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Téléphone</label>
                  <input value={form.telephone} onChange={(e) => setForm({ ...form, telephone: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Parent</label>
                  <input value={form.parent_nom} onChange={(e) => setForm({ ...form, parent_nom: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Tel. parent</label>
                  <input value={form.parent_telephone} onChange={(e) => setForm({ ...form, parent_telephone: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Classe</label>
                  <select value={form.classe_id}
                    onChange={(e) => setForm({ ...form, classe_id: e.target.value, groupe_id: "" })}>
                    <option value="">Tsy misy</option>
                    {classes.map((c) => <option key={c.id} value={c.id}>{c.nom}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Groupe</label>
                  <select value={form.groupe_id}
                    onChange={(e) => setForm({ ...form, groupe_id: e.target.value })}>
                    <option value="">Tsy misy</option>
                    {filteredGroupes.map((g) => <option key={g.id} value={g.id}>{g.nom}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-group" style={{ marginTop: 12 }}>
                <label>Situation</label>
                <textarea value={form.situation} onChange={(e) => setForm({ ...form, situation: e.target.value })} />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Hiala</button>
                <button type="submit" className="btn" disabled={loading}>
                  {loading ? "..." : "💾 Tehirizo"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {newBadge && (
        <StudentBadge badgeData={newBadge} onClose={() => setNewBadge(null)} />
      )}

      {badgeId && (
        <StudentBadge studentId={badgeId} onClose={() => setBadgeId(null)} />
      )}
    </div>
  );
}
