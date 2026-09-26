import { useEffect, useState, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { apiFetch } from "../api";
import JustifyModal from "../components/JustifyModal";

export default function Attendance({ toast }) {
  const [mode, setMode] = useState("qr");
  const [scanning, setScanning] = useState(false);
  const [lastCheck, setLastCheck] = useState(null);
  const [manual, setManual] = useState("");
  const [results, setResults] = useState([]);
  const [today, setToday] = useState([]);
  const [justifying, setJustifying] = useState(null);
  const [filterDate, setFilterDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const scannerRef = useRef(null);

  async function loadToday() {
    const data = await apiFetch(`/attendance?date=${filterDate}`);
    setToday(data);
  }

  useEffect(() => { loadToday(); }, [filterDate]);

  async function startScan() {
    try {
      const qr = new Html5Qrcode("qr-reader");
      scannerRef.current = qr;
      setScanning(true);
      await qr.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: 250 },
        async (text) => { await handleScan(text); },
        () => {}
      );
    } catch (e) {
      toast("Camera: " + e.message, "error");
      setScanning(false);
    }
  }

  async function stopScan() {
    if (scannerRef.current) {
      try { await scannerRef.current.stop(); } catch (e) {}
      scannerRef.current = null;
    }
    setScanning(false);
  }

  async function handleScan(text) {
    try {
      const res = await apiFetch("/attendance/check-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ matricule: text, methode: "qr" }),
      });
      setLastCheck(res);
      toast(`✅ ${res.student.prenom} ${res.student.nom} tonga!`);
      loadToday();
    } catch (e) { toast(e.message, "error"); }
  }

  async function searchStudents(q) {
    setManual(q);
    if (!q.trim()) { setResults([]); return; }
    const data = await apiFetch(`/students?search=${encodeURIComponent(q)}`);
    setResults(data);
  }

  async function manualCheck(student) {
    try {
      const res = await apiFetch("/attendance/check-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ matricule: student.matricule, methode: "manual" }),
      });
      setLastCheck(res);
      toast(`✅ ${student.prenom} ${student.nom} tonga!`);
      setManual(""); setResults([]);
      loadToday();
    } catch (e) { toast(e.message, "error"); }
  }

  return (
    <div>
      <h1>✅ Présence des élèves</h1>

      <div className="attendance-tabs">
        <button className={mode === "qr" ? "active" : ""} onClick={() => setMode("qr")}>
          📱 Scanner QR
        </button>
        <button className={mode === "manual" ? "active" : ""} onClick={() => setMode("manual")}>
          🔍 Manuelle
        </button>
      </div>

      {mode === "qr" ? (
        <div className="card">
          {!scanning ? (
            <button className="btn btn-success" onClick={startScan}>
              📷 Atombohy ny scanning
            </button>
          ) : (
            <>
              <div id="qr-reader" className="qr-reader"></div>
              <button className="btn btn-danger" onClick={stopScan} style={{ marginTop: 12 }}>
                ⏹ Ajanony
              </button>
            </>
          )}
        </div>
      ) : (
        <div className="card">
          <input
            placeholder="🔍 Mitady (anarana na matricule)"
            value={manual}
            onChange={(e) => searchStudents(e.target.value)}
            style={{ width: "100%", padding: 12, borderRadius: 8,
                     border: "1px solid var(--border)", background: "var(--bg)",
                     color: "var(--text)" }}
          />
          {results.length > 0 && (
            <ul style={{ listStyle: "none", padding: 0, marginTop: 12 }}>
              {results.slice(0, 10).map(s => (
                <li key={s.id} style={{
                  display: "flex", justifyContent: "space-between",
                  alignItems: "center", padding: 10,
                  borderBottom: "1px solid var(--border)"
                }}>
                  <div>
                    <strong>{s.nom} {s.prenom}</strong>
                    <div style={{ fontSize: "0.8rem", color: "var(--muted)" }}>
                      {s.matricule} • {s.classe_nom || "—"}
                    </div>
                  </div>
                  <button className="btn btn-success btn-sm" onClick={() => manualCheck(s)}>
                    Présent
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {lastCheck && (
        <div className="check-in-success">
          <h2>✅ Présence enregistrée!</h2>
          <p style={{ fontSize: "1.1rem", margin: 8 }}>
            <strong>{lastCheck.student.prenom} {lastCheck.student.nom}</strong>
          </p>
          <p>Matricule: {lastCheck.student.matricule}</p>
          <p>Heure: {lastCheck.heure_arrivee} — <strong>{lastCheck.statut}</strong></p>
        </div>
      )}

      <div className="card">
        <div className="toolbar">
          <input type="date" value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)} />
          <span style={{ color: "var(--muted)", fontSize: "0.9rem" }}>
            {today.length} enregistrements
          </span>
        </div>
        {today.length === 0 ? (
          <p className="empty">Tsy misy présence amin'io daty io.</p>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead><tr>
                <th>Élève</th><th>Matricule</th><th>Classe</th>
                <th>Heure</th><th>Statut</th><th></th>
              </tr></thead>
              <tbody>
                {today.map(a => (
                  <tr key={a.id}>
                    <td>{a.nom} {a.prenom}</td>
                    <td>{a.matricule}</td>
                    <td>{a.classe_nom || "—"}</td>
                    <td>{a.heure_arrivee || "—"}</td>
                    <td>
                      <span className={`badge ${a.statut}`}>{a.statut}</span>
                      {a.justif_motif && (
                        <div style={{ fontSize: "0.75rem", color: "var(--muted)", marginTop: 2 }}>
                          💬 {a.justif_motif}
                        </div>
                      )}
                    </td>
                    <td>
                      {a.statut === "absent" && !a.justif_motif && (
                        <button className="btn btn-sm btn-warn"
                          onClick={() => setJustifying(a)}>
                          📝 Hamarino
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {justifying && (
        <JustifyModal
          attendance={justifying}
          onClose={() => setJustifying(null)}
          onSave={() => { setJustifying(null); loadToday(); toast("Voamarina ✓"); }}
        />
      )}
    </div>
  );
}
