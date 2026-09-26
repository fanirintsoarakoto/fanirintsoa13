import { useState } from "react";
import { apiFetch } from "../api";

export default function JustifyModal({ attendance, onClose, onSave }) {
  const [motif, setMotif] = useState(attendance.justif_motif || "");
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    if (!motif.trim()) return;
    setLoading(true);
    try {
      await apiFetch(`/attendance/${attendance.id}/justify`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ motif }),
      });
      onSave();
    } catch (err) { alert(err.message); }
    finally { setLoading(false); }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <form className="modal" onClick={(e) => e.stopPropagation()} onSubmit={submit}>
        <h2>📝 Fanamarinana absence</h2>
        <p style={{ color: "var(--muted)", fontSize: "0.9rem", margin: 0 }}>
          <strong>{attendance.nom} {attendance.prenom}</strong><br />
          Daty: {attendance.date}
        </p>
        <div className="form-group" style={{ marginTop: 12 }}>
          <label>Anton'ny absence</label>
          <textarea value={motif} onChange={(e) => setMotif(e.target.value)}
            placeholder="Ohatra: Marary, nandeha... " required autoFocus />
        </div>
        <div className="modal-actions">
          <button type="button" className="btn btn-secondary" onClick={onClose}>Hiala</button>
          <button type="submit" className="btn btn-success" disabled={loading}>
            {loading ? "..." : "✅ Hamarino"}
          </button>
        </div>
      </form>
    </div>
  );
}
