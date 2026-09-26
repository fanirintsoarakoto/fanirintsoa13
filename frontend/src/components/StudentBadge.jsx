import { useEffect, useRef, useState } from "react";
import html2pdf from "html2pdf.js";
import { API, authHeaders } from "../api";

export default function StudentBadge({ studentId, badgeData, onClose }) {
  const [badge, setBadge] = useState(badgeData || null);
  const [error, setError] = useState("");
  const [downloading, setDownloading] = useState(false);
  const [flipped, setFlipped] = useState(false);
  const badgeRef = useRef(null);

  useEffect(() => {
    if (badgeData) { setBadge(badgeData); return; }
    if (!studentId) return;
    fetch(`${API}/students/${studentId}/badge`, { headers: authHeaders() })
      .then((r) => {
        if (!r.ok) throw new Error("Tsy hita ny mpianatra");
        return r.json();
      })
      .then(setBadge)
      .catch((e) => setError(e.message));
  }, [studentId, badgeData]);

  async function downloadPDF() {
    if (!badgeRef.current) return;
    setDownloading(true);
    try {
      await html2pdf()
        .set({
          margin: 0,
          filename: `badge-${badge?.matricule || "eleve"}.pdf`,
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: { scale: 3, useCORS: true, backgroundColor: "#ffffff" },
          jsPDF: { unit: "mm", format: [86, 130], orientation: "portrait" },
        })
        .from(badgeRef.current)
        .save();
    } catch (e) {
      setError("Tsy afaka télécharger");
    } finally {
      setDownloading(false);
    }
  }

  function printBadge() {
    window.print();
  }

  if (error) return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>⚠️ Olana</h2>
        <p style={{ color: "var(--danger)" }}>{error}</p>
        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={onClose}>Hiala</button>
        </div>
      </div>
    </div>
  );

  if (!badge) return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <p style={{ textAlign: "center", padding: 40 }}>⏳ Manamboatra ny badge...</p>
      </div>
    </div>
  );

  const year = new Date().getFullYear();
  const initials = `${badge.prenom?.[0] || ""}${badge.nom?.[0] || ""}`.toUpperCase();

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal badge-modal-pro" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="badge-modal-top">
          <div>
            <h2 className="badge-modal-title">🎫 Badge de l'élève</h2>
            <p className="badge-modal-subtitle">
              {badge.prenom} {badge.nom} • {badge.matricule}
            </p>
          </div>
          <button className="badge-close-pro" onClick={onClose}>✕</button>
        </div>

        {/* Conteneur avec effet 3D */}
        <div className="badge-stage">
          <div className="badge-glow"></div>

          <div className="badge-flip-wrapper" ref={badgeRef}>
            {/* ============ FACE AVANT ============ */}
            <div className={`badge-front-pro ${flipped ? "hidden" : ""}`}>
              {/* Bande décorative top */}
              <div className="badge-top-band">
                <div className="badge-top-band-pattern"></div>
              </div>

              {/* Header école */}
              <div className="badge-school-header">
                <div className="badge-school-logo">
                  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2">
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

              {/* Photo ronde */}
              <div className="badge-photo-frame">
                <div className="badge-photo-ring">
                  {badge.photo ? (
                    <img src={badge.photo} alt="" crossOrigin="anonymous" />
                  ) : (
                    <div className="badge-photo-initials">{initials}</div>
                  )}
                </div>
                <div className="badge-status-dot"></div>
              </div>

              {/* Nom */}
              <div className="badge-name-section">
                <div className="badge-prenom-line">{badge.prenom}</div>
                <div className="badge-nom-line">{badge.nom}</div>
              </div>

              {/* Matricule */}
              <div className="badge-matricule-box">
                <div className="badge-matricule-label">N° MATRICULE</div>
                <div className="badge-matricule-value">{badge.matricule}</div>
              </div>

              {/* Infos */}
              <div className="badge-infos-pro">
                <div className="badge-info-pro">
                  <div className="badge-info-icon">🏫</div>
                  <div>
                    <div className="badge-info-label">CLASSE</div>
                    <div className="badge-info-value">{badge.classe || "—"}</div>
                  </div>
                </div>
                {badge.groupe && (
                  <div className="badge-info-pro">
                    <div className="badge-info-icon">👥</div>
                    <div>
                      <div className="badge-info-label">GROUPE</div>
                      <div className="badge-info-value">{badge.groupe}</div>
                    </div>
                  </div>
                )}
              </div>

              {/* QR */}
              <div className="badge-qr-section">
                <div className="badge-qr-frame">
                  <img
                    src={`${API}/students/${badge.id}/qr`}
                    alt="QR"
                    crossOrigin="anonymous"
                  />
                </div>
                <div className="badge-qr-hint">
                  <svg viewBox="0 0 24 24" width="10" height="10" fill="currentColor">
                    <circle cx="12" cy="12" r="10"/>
                  </svg>
                  Scannez pour la présence
                </div>
              </div>

              {/* Footer */}
              <div className="badge-footer-band">
                <span>Valable année scolaire {year}–{year + 1}</span>
              </div>

              {/* Watermark */}
              <div className="badge-watermark">FANIRINTSOA</div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="badge-actions-pro">
          <button className="btn btn-secondary" onClick={onClose}>
            Fermer
          </button>
          <button className="btn btn-secondary" onClick={printBadge}>
            🖨 Imprimer
          </button>
          <button
            className="btn btn-badge-download"
            onClick={downloadPDF}
            disabled={downloading}
          >
            {downloading ? (
              <>⏳ Téléchargement...</>
            ) : (
              <>
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="7 10 12 15 17 10"/>
                  <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                Télécharger PDF
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
