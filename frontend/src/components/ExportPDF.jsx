import { useState, useRef } from "react";
import html2pdf from "html2pdf.js";

export default function ExportPDF({ students = [], title = "Lisitry ny mpianatra" }) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState(null); // "print" | "download"
  const [downloading, setDownloading] = useState(false);
  const [progress, setProgress] = useState(0);
  const contentRef = useRef(null);
  const dateNow = new Date().toLocaleString("fr-FR");

  // ===== TÉLÉCHARGER PDF =====
  function openDownload() {
    setMode("download");
    setOpen(true);
    setProgress(0);
    // Andraso kely ny render dia télécharger
    setTimeout(() => downloadPDF(), 400);
  }

  async function downloadPDF() {
    if (!contentRef.current || downloading) return;
    setDownloading(true);
    setProgress(10);

    try {
      setProgress(30);
      const filename = `${title.replace(/\s+/g, "-").toLowerCase()}-${new Date()
        .toISOString().slice(0, 10)}.pdf`;

      setProgress(60);

      await html2pdf()
        .set({
          margin: [10, 8, 12, 8],
          filename,
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: {
            scale: 2,
            useCORS: true,
            backgroundColor: "#ffffff",
            logging: false,
            windowWidth: 1000,
          },
          jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
          pagebreak: { mode: ["css", "legacy"], avoid: ["tr", ".pdf-stat"] },
        })
        .from(contentRef.current)
        .save();

      setProgress(100);
      setTimeout(() => {
        setOpen(false);
        setDownloading(false);
        setProgress(0);
      }, 800);
    } catch (e) {
      console.error(e);
      setProgress(0);
      setDownloading(false);
      // Fallback: print dialog
      setTimeout(() => window.print(), 200);
    }
  }

  // ===== IMPRIMER (print dialog) =====
  function openPrint() {
    setMode("print");
    setOpen(true);
    setTimeout(() => window.print(), 500);
  }

  return (
    <>
      {/* Bouton 1: Télécharger */}
      <button className="btn btn-pdf-download" onClick={openDownload}>
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none"
          stroke="currentColor" strokeWidth="2.5">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
          <polyline points="7 10 12 15 17 10"/>
          <line x1="12" y1="15" x2="12" y2="3"/>
        </svg>
        Télécharger PDF
      </button>

      {/* Bouton 2: Imprimer */}
      <button className="btn btn-pdf-print" onClick={openPrint}>
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none"
          stroke="currentColor" strokeWidth="2.5">
          <polyline points="6 9 6 2 18 2 18 9"/>
          <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
          <rect x="6" y="14" width="12" height="8"/>
        </svg>
        Imprimer
      </button>

      {open && (
        <div className="print-overlay">
          {/* Toolbar */}
          <div className="print-toolbar no-print">
            <div>
              <strong>
                {mode === "download" ? "⬇️ Téléchargement PDF" : "🖨 Impression"}
              </strong>
              <span>
                {mode === "download"
                  ? "Miandry ny téléchargement..."
                  : "Ao amin'ny dialogue print → safidio « Enregistrer au format PDF »"}
              </span>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                className="btn btn-secondary"
                onClick={() => setOpen(false)}
                disabled={downloading}
              >
                Fermer
              </button>
              <button
                className="btn btn-primary"
                onClick={() => (mode === "download" ? downloadPDF() : window.print())}
                disabled={downloading}
              >
                {mode === "download"
                  ? downloading ? `${progress}%` : "⬇️ Télécharger"
                  : "🖨 Imprimer"}
              </button>
            </div>
          </div>

          {/* Progress bar (rehefa téléchargement) */}
          {mode === "download" && downloading && (
            <div className="pdf-progress-bar no-print">
              <div className="pdf-progress-fill" style={{ width: `${progress}%` }}></div>
            </div>
          )}

          {/* Contenu */}
          <div className="print-content" ref={contentRef}>
            <div className="pdf-header-pro">
              <div className="pdf-header-left">
                <div className="pdf-logo-pro">🎓</div>
                <div>
                  <h1 className="pdf-title-pro">FANIRINTSOA</h1>
                  <p className="pdf-subtitle-pro">Établissement Privé</p>
                </div>
              </div>
              <div className="pdf-header-right">
                <div className="pdf-doc-title">{title}</div>
                <div className="pdf-doc-date">{dateNow}</div>
              </div>
            </div>

            <div className="pdf-summary-pro">
              <div className="pdf-stat">
                <div className="pdf-stat-value">{students.length}</div>
                <div className="pdf-stat-label">Total</div>
              </div>
              <div className="pdf-stat">
                <div className="pdf-stat-value">
                  {students.filter((s) => s.sexe === "M").length}
                </div>
                <div className="pdf-stat-label">Lahy</div>
              </div>
              <div className="pdf-stat">
                <div className="pdf-stat-value">
                  {students.filter((s) => s.sexe === "F").length}
                </div>
                <div className="pdf-stat-label">Vavy</div>
              </div>
              <div className="pdf-stat">
                <div className="pdf-stat-value">
                  {new Set(students.map((s) => s.classe_nom).filter(Boolean)).size}
                </div>
                <div className="pdf-stat-label">Classes</div>
              </div>
            </div>

            <table className="pdf-table-pro">
              <thead>
                <tr>
                  <th style={{ width: 30 }}>#</th>
                  <th style={{ width: 110 }}>Matricule</th>
                  <th>Nom</th>
                  <th>Prénom</th>
                  <th style={{ width: 40 }}>Sexe</th>
                  <th style={{ width: 40 }}>Âge</th>
                  <th style={{ width: 90 }}>Classe</th>
                  <th style={{ width: 130 }}>Parent</th>
                  <th style={{ width: 100 }}>Tél.</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s, i) => (
                  <tr key={s.id}>
                    <td>{i + 1}</td>
                    <td><strong>{s.matricule}</strong></td>
                    <td>{s.nom}</td>
                    <td>{s.prenom}</td>
                    <td>{s.sexe}</td>
                    <td>{s.age || "—"}</td>
                    <td>{s.classe_nom || "—"}</td>
                    <td>{s.parent_nom || "—"}</td>
                    <td>{s.parent_telephone || s.telephone || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {students.length === 0 && (
              <p className="pdf-empty-pro">Tsy misy mpianatra.</p>
            )}

            <div className="pdf-footer-pro">
              <div>Fanirintsoa — Système de Gestion des Élèves</div>
              <div>Document généré le {dateNow}</div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
