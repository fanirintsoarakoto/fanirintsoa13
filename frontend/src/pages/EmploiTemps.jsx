import { useEffect, useState } from "react";
import { apiFetch } from "../api";

const JOURS = ["Lundi","Mardi","Mercredi","Jeudi","Vendredi","Samedi"];

export default function EmploiTemps({ toast }) {
  const [classes, setClasses] = useState([]);
  const [emploi, setEmploi] = useState([]);
  const [classeId, setClasseId] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    classe_id: "", jour: "Lundi", heure_debut: "08:00",
    heure_fin: "10:00", matiere: "", salle: "", professeur: "",
  });

  async function loadBase() {
    const c = await apiFetch("/classes");
    setClasses(c);
    if (c.length && !classeId) setClasseId(c[0].id);
  }

  async function loadEmploi() {
    const url = classeId ? `/emploi-temps?classe_id=${classeId}` : "/emploi-temps";
    setEmploi(await apiFetch(url));
  }

  useEffect(() => { loadBase(); }, []);
  useEffect(() => { if (classeId) loadEmploi(); }, [classeId]);

  async function submit(e) {
    e.preventDefault();
    await apiFetch("/emploi-temps", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, classe_id: Number(form.classe_id) }),
    });
    toast("Nampiana ✓");
    setShowModal(false);
    loadEmploi();
  }

  async function remove(id) {
    if (!confirm("Hamafa?")) return;
    await apiFetch(`/emploi-temps/${id}`, { method: "DELETE" });
    loadEmploi();
  }

  return (
    <div>
      <div className="page-header">
        <h1>📅 Emploi du temps</h1>
        <button className="btn btn-pdf-export" onClick={() => {
          setForm({ ...form, classe_id: classeId });
          setShowModal(true);
        }}>+ Cours</button>
      </div>
      <div className="toolbar">
        <select value={classeId} onChange={(e) => setClasseId(e.target.value)}>
          {classes.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}
        </select>
      </div>
      {emploi.length === 0 ? <p className="empty">Tsy misy cours.</p> : (
        <div className="emploi-grid">
          {JOURS.map(j => {
            const cours = emploi.filter(e => e.jour === j);
            if (cours.length === 0) return null;
            return (
              <div key={j} className="emploi-jour">
                <div className="emploi-jour-head">{j}</div>
                <div className="emploi-cours-list">
                  {cours.map(c => (
                    <div key={c.id} className="emploi-cours">
                      <div className="emploi-heure">
                        {c.heure_debut}<br/>↓<br/>{c.heure_fin}
                      </div>
                      <div className="emploi-details">
                        <strong>{c.matiere}</strong>
                        {c.salle && <span>🏫 {c.salle}</span>}
                        {c.professeur && <span>👨‍🏫 {c.professeur}</span>}
                      </div>
                      <button className="btn btn-sm btn-danger" onClick={() => remove(c.id)}>✕</button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>➕ Cours vaovao</h2>
            <form onSubmit={submit}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Classe</label>
                  <select value={form.classe_id} required
                    onChange={(e) => setForm({ ...form, classe_id: e.target.value })}>
                    {classes.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Jour</label>
                  <select value={form.jour}
                    onChange={(e) => setForm({ ...form, jour: e.target.value })}>
                    {JOURS.map(j => <option key={j} value={j}>{j}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Matière</label>
                  <input value={form.matiere} required
                    onChange={(e) => setForm({ ...form, matiere: e.target.value })} />
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
                <div className="form-group">
                  <label>Salle</label>
                  <input value={form.salle}
                    onChange={(e) => setForm({ ...form, salle: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Professeur</label>
                  <input value={form.professeur}
                    onChange={(e) => setForm({ ...form, professeur: e.target.value })} />
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
