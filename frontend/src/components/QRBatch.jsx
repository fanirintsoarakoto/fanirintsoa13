import { useEffect, useState } from "react";
import { apiFetch, API } from "../api";
import html2pdf from "html2pdf.js";

export default function QRBatch() {
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [classeId, setClasseId] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => { apiFetch("/classes").then(setClasses); }, []);

  async function load() {
    const params = classeId ? `?classe_id=${classeId}` : "";
    setStudents(await apiFetch(`/students${params}`));
  }
  useEffect(() => { load(); }, [classeId]);

  function printAll() {
    window.print();
  }

  async function downloadPDF() {
    setLoading(true);
    try {
      await html2pdf().set({
        margin: 8,
        filename: `qr-codes-${new Date().toISOString().slice(0,10)}.pdf`,
        image: { type: "jpeg", quality: 0.95 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      }).from(document.getElementById("qr-batch-print")).save();
    } finally { setLoading(false); }
  }

  return (
    <div>
      <div className="page-header">
        <h1>🖨 QR Codes par lot</h1>
        <div className="page-actions">
          <button className="btn btn-secondary" onClick={printAll}>🖨 Print</button>
          <button className="btn" onClick={downloadPDF} disabled={loading}>
            {loading ? "⏳..." : "⬇️ Télécharger PDF"}
          </button>
        </div>
      </div>

      <div className="toolbar no-print">
        <select value={classeId} onChange={(e) => setClasseId(e.target.value)}>
          <option value="">Classe rehetra ({students.length})</option>
          {classes.map(c => (
            <option key={c.id} value={c.id}>
              {c.nom} ({c.nb_students})
            </option>
          ))}
        </select>
      </div>

      {students.length === 0 ? (
        <p className="empty">Tsy misy mpianatra.</p>
      ) : (
        <div id="qr-batch-print" className="qr-batch">
          {students.map(s => (
            <div key={s.id} className="qr-card">
              <img src={`${API}/students/${s.id}/qr`} alt="QR" />
              <div className="qr-info">
                <strong>{s.nom} {s.prenom}</strong>
                <span>{s.matricule}</span>
                <span>{s.classe_nom || "—"}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
