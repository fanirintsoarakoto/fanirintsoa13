import { useEffect, useState } from "react";
import { apiFetch } from "../api";

export default function Notes({ toast }) {
  const [tab, setTab] = useState("saisir");
  const [classes, setClasses] = useState([]);
  const [matieres, setMatieres] = useState([]);
  const [students, setStudents] = useState([]);
  const [notes, setNotes] = useState([]);
  const [filterClasse, setFilterClasse] = useState("");
  const [filterMatiere, setFilterMatiere] = useState("");
  const [filterTrimestre, setFilterTrimestre] = useState("1");

  const [form, setForm] = useState({
    student_id: "", matiere_id: "", note: "",
    type: "devoir", trimestre: 1, date: new Date().toISOString().slice(0, 10),
    remarque: "",
  });
  const [editing, setEditing] = useState(null);

  async function loadBase() {
    const [c, m] = await Promise.all([
      apiFetch("/classes"),
      apiFetch("/matieres"),
    ]);
    setClasses(c);
    setMatieres(m);
  }

  async function loadStudents() {
    const params = filterClasse ? `?classe_id=${filterClasse}` : "";
    setStudents(await apiFetch(`/students${params}`));
  }

  async function loadNotes() {
    const params = new URLSearchParams();
    if (filterMatiere) params.set("matiere_id", filterMatiere);
    if (filterTrimestre) params.set("trimestre", filterTrimestre);
    if (filterClasse) params.set("classe_id", filterClasse);
    setNotes(await apiFetch(`/notes?${params}`));
  }

  useEffect(() => { loadBase(); loadStudents(); }, []);
  useEffect(() => { loadStudents(); }, [filterClasse]);
  useEffect(() => { loadNotes(); }, [filterMatiere, filterTrimestre, filterClasse]);

  function resetForm() {
    setForm({
      student_id: "", matiere_id: "", note: "",
      type: "devoir", trimestre: 1,
      date: new Date().toISOString().slice(0, 10),
      remarque: "",
    });
    setEditing(null);
  }

  async function submit(e) {
    e.preventDefault();
    try {
      if (editing) {
        // Modification
        await apiFetch(`/notes/${editing.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            note: Number(form.note),
            type: form.type,
            trimestre: Number(form.trimestre),
            date: form.date,
            remarque: form.remarque,
          }),
        });
        toast("✅ Note nohavaozina");
      } else {
        // Création
        await apiFetch("/notes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...form,
            student_id: Number(form.student_id),
            matiere_id: Number(form.matiere_id),
            note: Number(form.note),
            trimestre: Number(form.trimestre),
          }),
        });
        toast("✅ Note nampiana");
      }
      resetForm();
      loadNotes();
      setTab("liste");
    } catch (e) {
      toast(e.message, "error");
    }
  }

  function startEdit(n) {
    setEditing(n);
    setForm({
      student_id: String(n.student_id),
      matiere_id: String(n.matiere_id),
      note: String(n.note),
      type: n.type || "devoir",
      trimestre: String(n.trimestre || 1),
      date: n.date || new Date().toISOString().slice(0, 10),
      remarque: n.remarque || "",
    });
    setTab("saisir");
  }

  async function remove(id) {
    if (!confirm("Hamafa io note io?")) return;
    await apiFetch(`/notes/${id}`, { method: "DELETE" });
    toast("Voafafa");
    loadNotes();
  }

  return (
    <div>
      <h1>📝 Gestion des notes</h1>

      <div className="attendance-tabs">
        <button className={tab === "saisir" ? "active" : ""} onClick={() => setTab("saisir")}>
          {editing ? "✏️ Modifier" : "➕ Saisir"}
        </button>
        <button className={tab === "liste" ? "active" : ""} onClick={() => setTab("liste")}>
          📋 Liste ({notes.length})
        </button>
        <button className={tab === "stats" ? "active" : ""} onClick={() => setTab("stats")}>
          📊 Statistiques
        </button>
      </div>

      {tab === "saisir" && (
        <div className="card">
          <h3>{editing ? "✏️ Ovay ny note" : "➕ Note vaovao"}</h3>

          {editing && (
            <div className="edit-info-banner">
              <span>
                Manova note an'ny <strong>{editing.nom} {editing.prenom}</strong> —{" "}
                {editing.matiere_nom} (misy note <strong>{editing.note}/20</strong>)
              </span>
            </div>
          )}

          <form onSubmit={submit}>
            <div className="form-grid">
              {!editing && (
                <div className="form-group">
                  <label>Classe</label>
                  <select value={filterClasse} onChange={(e) => setFilterClasse(e.target.value)}>
                    <option value="">Safidio ny classe</option>
                    {classes.map((c) => <option key={c.id} value={c.id}>{c.nom}</option>)}
                  </select>
                </div>
              )}
              <div className="form-group">
                <label>Mpianatra *</label>
                <select value={form.student_id} required disabled={!!editing}
                  onChange={(e) => setForm({ ...form, student_id: e.target.value })}>
                  <option value="">Safidio</option>
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>{s.nom} {s.prenom} — {s.matricule}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Matière *</label>
                <select value={form.matiere_id} required disabled={!!editing}
                  onChange={(e) => setForm({ ...form, matiere_id: e.target.value })}>
                  <option value="">Safidio</option>
                  {matieres.map((m) => (
                    <option key={m.id} value={m.id}>{m.nom} (coef {m.coefficient})</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Note / 20 *</label>
                <input type="number" min="0" max="20" step="0.25" required
                  value={form.note}
                  onChange={(e) => setForm({ ...form, note: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Type</label>
                <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                  <option value="devoir">Devoir</option>
                  <option value="interrogation">Interrogation</option>
                  <option value="examen">Examen</option>
                  <option value="oral">Oral</option>
                  <option value="tp">TP</option>
                </select>
              </div>
              <div className="form-group">
                <label>Trimestre</label>
                <select value={form.trimestre} onChange={(e) => setForm({ ...form, trimestre: e.target.value })}>
                  <option value="1">Trimestre 1</option>
                  <option value="2">Trimestre 2</option>
                  <option value="3">Trimestre 3</option>
                </select>
              </div>
              <div className="form-group">
                <label>Daty</label>
                <input type="date" value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })} />
              </div>
            </div>
            <div className="form-group" style={{ marginTop: 12 }}>
              <label>Remarque</label>
              <input value={form.remarque}
                onChange={(e) => setForm({ ...form, remarque: e.target.value })}
                placeholder="Ohatra: hita fa niasa mafy" />
            </div>
            <div className="modal-actions">
              {editing && (
                <button type="button" className="btn btn-secondary" onClick={resetForm}>
                  Hiala
                </button>
              )}
              <button type="submit" className={`btn ${editing ? "btn-warn" : "btn-success"}`}>
                {editing ? "💾 Tehirizo ny fanovana" : "💾 Tehirizo"}
              </button>
            </div>
          </form>
        </div>
      )}

      {tab === "liste" && (
        <div className="card">
          <div className="toolbar">
            <select value={filterClasse} onChange={(e) => setFilterClasse(e.target.value)}>
              <option value="">Classe rehetra</option>
              {classes.map((c) => <option key={c.id} value={c.id}>{c.nom}</option>)}
            </select>
            <select value={filterMatiere} onChange={(e) => setFilterMatiere(e.target.value)}>
              <option value="">Matière rehetra</option>
              {matieres.map((m) => <option key={m.id} value={m.id}>{m.nom}</option>)}
            </select>
            <select value={filterTrimestre} onChange={(e) => setFilterTrimestre(e.target.value)}>
              <option value="1">Trimestre 1</option>
              <option value="2">Trimestre 2</option>
              <option value="3">Trimestre 3</option>
            </select>
          </div>

          {notes.length === 0 ? (
            <p className="empty">Tsy misy note.</p>
          ) : (
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Mpianatra</th><th>Matricule</th><th>Matière</th>
                    <th>Note</th><th>Type</th><th>Trim.</th><th>Daty</th><th></th>
                  </tr>
                </thead>
                <tbody>
                  {notes.map((n) => (
                    <tr key={n.id}>
                      <td>{n.nom} {n.prenom}</td>
                      <td>{n.matricule}</td>
                      <td>{n.matiere_nom}</td>
                      <td>
                        <span className={`note-badge ${n.note >= 10 ? "pass" : "fail"}`}>
                          {n.note}/20
                        </span>
                      </td>
                      <td>{n.type}</td>
                      <td>T{n.trimestre}</td>
                      <td>{n.date}</td>
                      <td>
                        <div style={{ display: "flex", gap: 4 }}>
                          <button className="btn btn-sm btn-secondary"
                            onClick={() => startEdit(n)} title="Ovay">
                            ✏️
                          </button>
                          <button className="btn btn-sm btn-danger"
                            onClick={() => remove(n.id)} title="Fafao">
                            🗑
                          </button>
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

      {tab === "stats" && <NotesStats matieres={matieres} classes={classes} />}
    </div>
  );
}

function NotesStats({ matieres, classes }) {
  const [stats, setStats] = useState([]);
  const [trimestre, setTrimestre] = useState("1");
  const [classeId, setClasseId] = useState("");

  useEffect(() => {
    const params = new URLSearchParams();
    if (trimestre) params.set("trimestre", trimestre);
    if (classeId) params.set("classe_id", classeId);
    apiFetch(`/notes/statistics?${params}`).then(setStats).catch(() => {});
  }, [trimestre, classeId]);

  return (
    <div>
      <div className="toolbar">
        <select value={trimestre} onChange={(e) => setTrimestre(e.target.value)}>
          <option value="1">Trimestre 1</option>
          <option value="2">Trimestre 2</option>
          <option value="3">Trimestre 3</option>
        </select>
        <select value={classeId} onChange={(e) => setClasseId(e.target.value)}>
          <option value="">Classe rehetra</option>
          {classes.map((c) => <option key={c.id} value={c.id}>{c.nom}</option>)}
        </select>
      </div>
      <div className="card">
        <h3>Moyennes par matière</h3>
        {stats.length === 0 ? (
          <p className="empty">Tsy misy data.</p>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead><tr><th>Matière</th><th>Moyenne</th><th>Isan'ny note</th></tr></thead>
              <tbody>
                {stats.map((s) => (
                  <tr key={s.matiere}>
                    <td><strong>{s.matiere}</strong></td>
                    <td>
                      <span className={`note-badge ${s.moyenne >= 10 ? "pass" : "fail"}`}>
                        {s.moyenne ? s.moyenne.toFixed(2) : "—"}
                      </span>
                    </td>
                    <td>{s.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
