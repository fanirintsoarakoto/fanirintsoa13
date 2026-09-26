import { useEffect, useState } from "react";
import { apiFetch } from "../api";

export default function Sessions({ toast }) {
  const [sessions, setSessions] = useState([]);
  const [classes, setClasses] = useState([]);
  const [groupes, setGroupes] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    classe_id: "", groupe_id: "",
    date: new Date().toISOString().slice(0, 10),
    heure_debut: "08:00", heure_fin: "12:00",
  });

  async function load() {
    const [s, c, g] = await Promise.all([
      apiFetch("/sessions"), apiFetch("/classes"), apiFetch("/groupes")
    ]);
    setSessions(s); setClasses(c); setGroupes(g);
  }
  useEffect(() => { load(); }, []);

  async function submit(e) {
    e.preventDefault();
    await apiFetch("/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        classe_id: form.classe_id ? Number(form.classe_id) : null,
        groupe_id: form.groupe_id ? Number(form.groupe_id) : null,
      }),
    });
    toast("Séance noforonina ✓");
    setShowModal(false); load();
  }

  async function close(id) {
    if (!confirm("Hidio ny séance? Ho lasa 'absent' ny mpianatra tsy tonga.")) return;
    const r = await apiFetch(`/sessions/${id}/close`, { method: "POST" });
    toast(`Voahidy — ${r.absents_marques} absent voamarika`);
    load();
  }

  const filteredGroupes = form.classe_id
    ? groupes.filter(g => String(g.classe_id) === String(form.classe_id))
    : groupes;

  return (
    <div>
      <div className="page-header">
        <h1>📅 Séances</h1>
        <button className="btn" onClick={() => setShowModal(true)}>+ Séance vaovao</button>
      </div>

      {sessions.length === 0 ? (
        <p className="empty">Tsy misy séance.</p>
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead><tr>
              <th>Date</th><th>Classe</th><th>Groupe</th>
              <th>Heure</th><th>Statut</th><th></th>
            </tr></thead>
            <tbody>
              {sessions.map(s => (
                <tr key={s.id}>
                  <td>{s.date}</td>
                  <td>{s.classe_nom || "—"}</td>
                  <td>{s.groupe_nom || "—"}</td>
                  <td>{s.heure_debut} - {s.heure_fin}</td>
                  <td><span className={`badge ${s.statut}`}>{s.statut}</span></td>
                  <td>
                    {s.statut === "open" && (
                      <button className="btn btn-sm btn-danger" onClick={() => close(s.id)}>
                        🔒 Hidio
                      </button>
                    )}
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
            <h2>➕ Séance vaovao</h2>
            <form onSubmit={submit}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Date</label>
                  <input type="date" value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Classe</label>
                  <select value={form.classe_id}
                    onChange={(e) => setForm({ ...form, classe_id: e.target.value, groupe_id: "" })}>
                    <option value="">Rehetra</option>
                    {classes.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Groupe</label>
                  <select value={form.groupe_id}
                    onChange={(e) => setForm({ ...form, groupe_id: e.target.value })}>
                    <option value="">Rehetra</option>
                    {filteredGroupes.map(g => <option key={g.id} value={g.id}>{g.nom}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Heure début</label>
                  <input type="time" value={form.heure_debut}
                    onChange={(e) => setForm({ ...form, heure_debut: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Heure fin</label>
                  <input type="time" value={form.heure_fin}
                    onChange={(e) => setForm({ ...form, heure_fin: e.target.value })} />
                </div>
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
