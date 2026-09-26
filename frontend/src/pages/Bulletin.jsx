import { useEffect, useState } from "react";
import { apiFetch } from "../api";

export default function Bulletin() {
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [selected, setSelected] = useState(null);
  const [bulletin, setBulletin] = useState(null);
  const [trimestre, setTrimestre] = useState("1");
  const [filterClasse, setFilterClasse] = useState("");

  async function load() {
    const [c] = await Promise.all([apiFetch("/classes")]);
    setClasses(c);
    const params = filterClasse ? `?classe_id=${filterClasse}` : "";
    setStudents(await apiFetch(`/students${params}`));
  }

  useEffect(() => { load(); }, [filterClasse]);

  async function openBulletin(s) {
    setSelected(s);
    const data = await apiFetch(`/students/${s.id}/bulletin?trimestre=${trimestre}`);
    setBulletin(data);
  }

  useEffect(() => {
    if (selected) openBulletin(selected);
  }, [trimestre]);

  function printBulletin() {
    window.print();
  }

  return (
    <div>
      <h1>📄 Bulletin scolaire</h1>

      <div className="toolbar no-print">
        <select value={filterClasse} onChange={(e) => setFilterClasse(e.target.value)}>
          <option value="">Classe rehetra</option>
          {classes.map((c) => <option key={c.id} value={c.id}>{c.nom}</option>)}
        </select>
        <select value={trimestre} onChange={(e) => setTrimestre(e.target.value)}>
          <option value="1">Trimestre 1</option>
          <option value="2">Trimestre 2</option>
          <option value="3">Trimestre 3</option>
        </select>
      </div>

      {!selected ? (
        <div className="card">
          <h3>Mifidiana mpianatra</h3>
          <div className="bulletin-students-grid">
            {students.map((s) => (
              <button key={s.id} className="bulletin-student-btn" onClick={() => openBulletin(s)}>
                <div className="bs-name">{s.nom} {s.prenom}</div>
                <div className="bs-matricule">{s.matricule}</div>
                <div className="bs-classe">{s.classe_nom || "—"}</div>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <>
          <div className="no-print" style={{ marginBottom: 16 }}>
            <button className="btn btn-secondary" onClick={() => { setSelected(null); setBulletin(null); }}>
              ← Miverina
            </button>
            <button className="btn btn-primary" onClick={printBulletin} style={{ marginLeft: 8 }}>
              🖨 Imprimer / PDF
            </button>
          </div>

          {bulletin && (
            <div className="bulletin-doc">
              <div className="bulletin-header">
                <div className="bulletin-logo">🎓</div>
                <div>
                  <h2>FANIRINTSOA</h2>
                  <p>Bulletin de notes — Trimestre {bulletin.trimestre}</p>
                </div>
              </div>

              <div className="bulletin-info">
                <div className="bulletin-info-row">
                  <span>Mpianatra</span>
                  <strong>{bulletin.student.nom} {bulletin.student.prenom}</strong>
                </div>
                <div className="bulletin-info-row">
                  <span>Matricule</span>
                  <strong>{bulletin.student.matricule}</strong>
                </div>
                <div className="bulletin-info-row">
                  <span>Classe</span>
                  <strong>{bulletin.student.classe_nom || "—"}</strong>
                </div>
              </div>

              <table className="bulletin-table">
                <thead>
                  <tr>
                    <th>Matière</th>
                    <th>Coef</th>
                    <th>Moyenne</th>
                    <th>Points</th>
                    <th>Appréciation</th>
                  </tr>
                </thead>
                <tbody>
                  {bulletin.matieres.map((m) => (
                    <tr key={m.matiere_id}>
                      <td><strong>{m.matiere_nom}</strong></td>
                      <td>{m.coefficient}</td>
                      <td>
                        {m.moyenne !== null ? (
                          <span className={`note-badge ${m.moyenne >= 10 ? "pass" : "fail"}`}>
                            {m.moyenne.toFixed(2)}
                          </span>
                        ) : "—"}
                      </td>
                      <td>
                        {m.moyenne !== null ? (m.moyenne * m.coefficient).toFixed(2) : "—"}
                      </td>
                      <td>{getAppreciation(m.moyenne)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="bulletin-summary">
                <div>
                  <span>Moyenne générale</span>
                  <strong className={bulletin.moyenne_generale >= 10 ? "pass" : "fail"}>
                    {bulletin.moyenne_generale}/20
                  </strong>
                </div>
                <div>
                  <span>Total coefficients</span>
                  <strong>{bulletin.total_coefficients}</strong>
                </div>
                <div>
                  <span>Mention</span>
                  <strong>{getMention(bulletin.moyenne_generale)}</strong>
                </div>
              </div>

              <div className="bulletin-footer">
                <div>Fanirintsoa — {new Date().toLocaleDateString("fr-FR")}</div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function getAppreciation(moy) {
  if (moy === null) return "—";
  if (moy >= 16) return "Excellent";
  if (moy >= 14) return "Très bien";
  if (moy >= 12) return "Bien";
  if (moy >= 10) return "Assez bien";
  if (moy >= 8) return "Insuffisant";
  return "Très faible";
}

function getMention(moy) {
  if (moy >= 16) return "Excellent";
  if (moy >= 14) return "Très bien";
  if (moy >= 12) return "Bien";
  if (moy >= 10) return "Passable";
  return "Insuffisant";
}
