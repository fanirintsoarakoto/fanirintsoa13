import { useRef, useState } from "react";
import html2pdf from "html2pdf.js";
import { API } from "../api";

export default function BadgesBatch({ badges, title, onClose }) {
  const containerRef = useRef(null);
  const [downloading, setDownloading] = useState(false);
  const [progress, setProgress] = useState("");

  async function downloadAll() {
    if (!containerRef.current || badges.length === 0) return;
    setDownloading(true);
    try {
      setProgress("Manomboka...");
      const filename = `badges-${new Date().toISOString().slice(0, 10)}.pdf`;
      await html2pdf()
        .set({
          margin: 6,
          filename,
          image: { type: "jpeg", quality: 0.95 },
          html2canvas: { scale: 2, useCORS: true, backgroundColor: "#ffffff" },
          jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
          pagebreak: { mode: ["css", "legacy"], avoid: ".badge-front-pro" },
        })
        .from(containerRef.current)
        .save();
      setProgress("Vita ✓");
    } catch (e) {
      setProgress("Nisy olana");
    } finally {
      setDownloading(false);
    }
  }

  const year = new Date().getFullYear();

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal badges-batch-modal-pro" onClick={(e) => e.stopPropagation()}>
        <div className="badge-modal-top">
          <div>
            <h2 className="badge-modal-title">🎫 {title || `Badges (${badges.length})`}</h2>
            <p className="badge-modal-subtitle">
              <strong>{badges.length}</strong> badge vonona — télécharger na print
            </p>
          </div>
          <button className="badge-close-pro" onClick={onClose}>✕</button>
        </div>

        <div ref={containerRef} className="badges-batch-grid-pro">
          {badges.map((b) => {
            const initials = `${b.prenom?.[0] || ""}${b.nom?.[0] || ""}`.toUpperCase();
            return (
              <div key={b.id} className="badge-front-pro">
                <div className="badge-top-band">
                  <div className="badge-top-band-pattern"></div>
                </div>

                <div className="badge-school-header">
                  <div className="badge-school-logo">
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
                      <path d="M6 12v5c3 3 9 3 12 0v-5"/>
                    </svg>
                  </div>
                  <div className="badge-school-info">
                    <div className="badge-school-name">FANIRINTSOA</div>
                    <div className="badge-school-tag">Établissement Privé</div>
                  </div>
                  <div className="badge-year-badge">
                    {year}<span className="badge-year-sep">/</span>{String(year + 1).slice(2)}
                  </div>
                </div>

                <div className="badge-photo-frame">
                  <div className="badge-photo-ring">
                    {b.photo ? (
                      <img src={b.photo} alt="" crossOrigin="anonymous" />
                    ) : (
                      <div className="badge-photo-initials">{initials}</div>
                    )}
                  </div>
                  <div className="badge-status-dot"></div>
                </div>

                <div className="badge-name-section">
                  <div className="badge-prenom-line">{b.prenom}</div>
                  <div className="badge-nom-line">{b.nom}</div>
                </div>

                <div className="badge-matricule-box">
                  <div className="badge-matricule-label">N° MATRICULE</div>
                  <div className="badge-matricule-value">{b.matricule}</div>
                </div>

                <div className="badge-infos-pro">
                  <div className="badge-info-pro">
                    <div className="badge-info-icon">🏫</div>
                    <div>
                      <div className="badge-info-label">CLASSE</div>
                      <div className="badge-info-value">{b.classe_nom || "—"}</div>
                    </div>
                  </div>
                </div>

                <div className="badge-qr-section">
                  <div className="badge-qr-frame">
                    <img src={`${API}/students/${b.id}/qr`} alt="QR" crossOrigin="anonymous" />
                  </div>
                  <div className="badge-qr-hint">
                    <svg viewBox="0 0 24 24" width="10" height="10" fill="currentColor">
                      <circle cx="12" cy="12" r="10"/>
                    </svg>
                    Scannez pour présence
                  </div>
                </div>

                <div className="badge-footer-band">
                  <span>Année scolaire {year}–{year + 1}</span>
                </div>

                <div className="badge-watermark">FANIRINTSOA</div>
              </div>
            );
          })}
        </div>

        <div className="badge-actions-pro">
          <button className="btn btn-secondary" onClick={onClose}>
            Fermer
          </button>
          <button
            className="btn btn-badge-download"
            onClick={downloadAll}
            disabled={downloading}
          >
            {downloading
              ? `⏳ ${progress}`
              : `⬇️ Télécharger daholo (${badges.length})`}
          </button>
        </div>
      </div>
    </div>
  );
}
