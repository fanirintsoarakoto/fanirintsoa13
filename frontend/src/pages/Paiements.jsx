import { useEffect, useState } from "react";
import { apiFetch } from "../api";

const MOIS = ["Janvier","Février","Mars","Avril","Mai","Juin",
              "Juillet","Août","Septembre","Octobre","Novembre","Décembre"];

export default function Paiements({ toast }) {
  const [paiements, setPaiements] = useState([]);
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [stats, setStats] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [filterClasse, setFilterClasse] = useState("");
  const [filterMois, setFilterMois] = useState("");
  const [form, setForm] = useState({
    student_id: "", montant: "", mois: MOIS[new Date().getMonth()],
    annee: new Date().getFullYear(), methode: "especes", reference: "",
    date_paiement: new Date().toISOString().slice(0, 10),
  });

  async function loadBase() {
    const [s, c] = await Promise.all([apiFetch("/students"), apiFetch("/classes")]);
    setStudents(s); setClasses(c);
  }
  async function load() {
    const params = new URLSearchParams();
    if (filterClasse) params.set("classe_id", filterClasse);
    if (filterMois) params.set("mois", filterMois);
    const [p, st] = await Promise.all([
      apiFetch(`/paiements?${params}`),
      apiFetch(`/paiements/stats?annee=${new Date().getFullYear()}`),
    ]);
    setPaiements(p); setStats(st);
  }
  useEffect(() => { loadBase(); }, []);
  useEffect(() => { load(); }, [filterClasse, filterMois]);

  async function submit(e) {
    e.preventDefault();
    try {
      await apiFetch("/paiements", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form,
          student_id: Number(form.student_id),
          montant: Number(form.montant),
          annee: Number(form.annee) }),
      });
      toast("✅ Enregistré");
      setShowModal(false);
      setForm({ ...form, montant: "", reference: "" });
      load();
    } catch (e) { toast(e.message, "error"); }
  }

  async function remove(id) {
    if (!confirm("Hamafa?")) return;
    await apiFetch(`/paiements/${id}`, { method: "DELETE" });
    load();
  }

  async function viewRecu(id) {
    const r = await apiFetch(`/paiements/${id}/recu`);
    alert(`RECU ${r.recu_numero}\n\nÉlève: ${r.nom} ${r.prenom}\nMatricule: ${r.matricule}\nClasse: ${r.classe_nom || "—"}\n\nMontant: ${Number(r.montant).toLocaleString()} Ar\nMois: ${r.mois} ${r.annee}\nDate: ${r.date_paiement}\nMéthode: ${r.methode}`);
  }

  return (
    <div>
      <div className="page-header">
        <h1>💰 Paiements</h1>
        <button className="btn btn-pdf-export" onClick={() => setShowModal(true)}>+ Paiement</button>
      </div>
      {stats && (
        <div className="stats-grid">
          <div className="stat-card green"><h2>{(stats.total_annee / 1000).toFixed(0)}k</h2><p>Ar tamin'ity taona</p></div>
          <div className="stat-card blue"><h2>{stats.eleves_payes}</h2><p>Élèves nandoa</p></div>
          <div className="stat-card red"><h2>{stats.eleves_non_payes}</h2><p>Tsy nandoa</p></div>
        </div>
      )}
      <div className="toolbar">
        <select value={filterClasse} onChange={(e) => setFilterClasse(e.target.value)}>
          <option value="">Classe rehetra</option>
          {classes.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}
        </select>
        <select value={filterMois} onChange={(e) => setFilterMois(e.target.value)}>
          <option value="">Mois rehetra</option>
          {MOIS.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
      </div>
      {paiements.length === 0 ? <p className="empty">Tsy misy paiement.</p> : (
        <div className="table-wrap">
          <table className="data-table">
            <thead><tr>
              <th>Élève</th><th>Classe</th><th>Mois</th>
              <th>Montant</th><th>Méthode</th><th>Date</th><th>Reçu</th><th></th>
            </tr></thead>
            <tbody>
              {paiements.map(p => (
                <tr key={p.id}>
                  <td>{p.nom} {p.prenom} <small>({p.matricule})</small></td>
                  <td>{p.classe_nom || "—"}</td>
                  <td>{p.mois} {p.annee}</td>
                  <td><strong>{Number(p.montant).toLocaleString()} Ar</strong></td>
                  <td>{p.methode}</td>
                  <td>{p.date_paiement}</td>
                  <td><button className="btn btn-sm btn-secondary" onClick={() => viewRecu(p.id)}>🧾</button></td>
                  <td><button className="btn btn-sm btn-danger" onClick={() => remove(p.id)}>🗑</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>💰 Paiement vaovao</h2>
            <form onSubmit={submit}>
              <div className="form-group">
                <label>Élève *</label>
                <select value={form.student_id} required
                  onChange={(e) => setForm({ ...form, student_id: e.target.value })}>
                  <option value="">Safidio</option>
                  {students.map(s => (
                    <option key={s.id} value={s.id}>{s.nom} {s.prenom} ({s.matricule})</option>
                  ))}
                </select>
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label>Montant (Ar) *</label>
                  <input type="number" value={form.montant} required
                    onChange={(e) => setForm({ ...form, montant: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Mois</label>
                  <select value={form.mois} onChange={(e) => setForm({ ...form, mois: e.target.value })}>
                    {MOIS.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Année</label>
                  <input type="number" value={form.annee}
                    onChange={(e) => setForm({ ...form, annee: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Méthode</label>
                  <select value={form.methode} onChange={(e) => setForm({ ...form, methode: e.target.value })}>
                    <option value="especes">Espèces</option>
                    <option value="mobile">Mobile Money</option>
                    <option value="virement">Virement</option>
                    <option value="cheque">Chèque</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Date</label>
                  <input type="date" value={form.date_paiement}
                    onChange={(e) => setForm({ ...form, date_paiement: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Référence</label>
                  <input value={form.reference}
                    onChange={(e) => setForm({ ...form, reference: e.target.value })} />
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
