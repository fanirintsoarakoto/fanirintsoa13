import { useEffect, useState, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { apiFetch } from "../api";

const STATUTS = {
  present: { label: "À L'HEURE", icon: "✅", color: "#22c55e" },
  retard: { label: "RETARD", icon: "⚠️", color: "#f59e0b" },
  tres_retard: { label: "TRÈS EN RETARD", icon: "🔴", color: "#ef4444" },
  non_prevu: { label: "NON PRÉVU", icon: "❓", color: "#8b5cf6" },
  sortie: { label: "SORTIE", icon: "🚪", color: "#3b82f6" },
};

export default function Scanner({ toast }) {
  const [scanning, setScanning] = useState(false);
  const [last, setLast] = useState(null);
  const [error, setError] = useState("");
  const [todayScans, setTodayScans] = useState([]);
  const [stats, setStats] = useState(null);
  const [mode, setMode] = useState("entree");
  const [cameras, setCameras] = useState([]);
  const [selectedCamera, setSelectedCamera] = useState("");
  const scannerRef = useRef(null);
  const cooldownRef = useRef(false);
  const lastTextRef = useRef(null);

  async function loadToday() {
    try {
      const data = await apiFetch("/dashboard/real-time");
      setTodayScans(data.scans);
      setStats(data.stats);
    } catch (e) {}
  }

  useEffect(() => {
    loadToday();
    const id = setInterval(loadToday, 15000);
    Html5Qrcode.getCameras()
      .then((devices) => {
        if (devices?.length) {
          setCameras(devices);
          const back = devices.find(d => /back|rear|environment/i.test(d.label));
          setSelectedCamera(back ? back.id : devices[devices.length - 1].id);
        }
      })
      .catch(() => {});
    return () => clearInterval(id);
  }, []);

  async function startScan() {
    setError("");
    if (scanning) return;
    setScanning(true);
    setTimeout(async () => {
      try {
        const el = document.getElementById("reader");
        if (!el) { setError("Tsy hita #reader"); setScanning(false); return; }
        const qr = new Html5Qrcode("reader", { verbose: false });
        scannerRef.current = qr;
        const config = { fps: 10, qrbox: { width: 250, height: 250 } };
        const cb = (text) => handleScan(text);
        if (selectedCamera) {
          await qr.start(selectedCamera, config, cb, () => {});
        } else {
          await qr.start({ facingMode: "environment" }, config, cb, () => {});
        }
      } catch (e) {
        setError("Camera: " + (e.message || e));
        setScanning(false);
      }
    }, 200);
  }

  async function stopScan() {
    if (scannerRef.current) {
      try { await scannerRef.current.stop(); scannerRef.current.clear(); } catch (e) {}
      scannerRef.current = null;
    }
    setScanning(false);
  }

  async function handleScan(text) {
    if (cooldownRef.current) return;
    if (lastTextRef.current === text) return;
    cooldownRef.current = true;
    lastTextRef.current = text;
    setTimeout(() => { cooldownRef.current = false; lastTextRef.current = null; }, 3000);

    try {
      const endpoint = mode === "sortie" ? "/scan/sortie" : "/scan/intelligent";
      const res = await apiFetch(endpoint, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: text, type: mode }),
      });
      setLast({ ...res, mode });
      setError("");
      const label = STATUTS[res.statut]?.label || res.statut;
      toast(`${label}: ${res.student.prenom} ${res.student.nom}`);
      if (navigator.vibrate) navigator.vibrate(200);
      loadToday();
    } catch (e) {
      setError(e.message || "");
      if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
      loadToday();
    }
  }

  const stInfo = last ? STATUTS[last.statut] || {} : null;

  return (
    <div>
      <div className="page-header">
        <h1>📱 Scan Présence Intelligent</h1>
        <div className="page-actions">
          <button className={`btn ${mode === "entree" ? "btn-success" : "btn-secondary"}`}
            onClick={() => setMode("entree")}>🚪 ENTRÉE</button>
          <button className={`btn ${mode === "sortie" ? "btn-warn" : "btn-secondary"}`}
            onClick={() => setMode("sortie")}>🚶 SORTIE</button>
        </div>
      </div>

      {error && (
        <div className="error-banner">
          ⚠️ {error}
          <button onClick={() => setError("")} style={{
            background: "transparent", border: "none", color: "inherit",
            cursor: "pointer", fontSize: "1.2rem", float: "right"
          }}>✕</button>
        </div>
      )}

      {last && stInfo && (
        <div className="scan-result-card" style={{ borderColor: stInfo.color }}>
          <div className="scan-result-header" style={{ background: stInfo.color }}>
            <div style={{ fontSize: "2.5rem" }}>{stInfo.icon}</div>
            <h2>{stInfo.label}</h2>
            {last.statut === "present" && <p>Présence enregistrée à {last.heure_reelle}</p>}
            {last.statut === "retard" && <p>Arrivé avec {last.minutes_retard} min de retard</p>}
            {last.statut === "tres_retard" && <p>Retard très important: {last.minutes_retard} min</p>}
            {last.statut === "non_prevu" && <p>Aucun cours prévu à cette heure</p>}
            {last.statut === "sortie" && <p>Départ enregistré à {last.heure_reelle}</p>}
          </div>
          <div className="scan-result-body">
            {last.student.photo ? (
              <img src={last.student.photo} alt="" className="scan-result-photo" />
            ) : (
              <div className="scan-result-photo placeholder">👤</div>
            )}
            <div className="scan-result-info">
              <h3>{last.student.prenom} {last.student.nom}</h3>
              <p><strong>{last.student.matricule}</strong></p>
              <p>Classe: <strong>{last.student.classe || "—"}</strong></p>
              {last.schedule && (
                <p>Matière: <strong>{last.schedule.matiere}</strong> ({last.schedule.heure_debut}–{last.schedule.heure_fin})</p>
              )}
              {last.heure_prevue && <p>Heure prévue: <strong>{last.heure_prevue}</strong></p>}
              <p>Heure scan: <strong>{last.heure_reelle}</strong></p>
              {last.minutes_retard > 0 && <p>Retard: <strong>{last.minutes_retard} min</strong></p>}
            </div>
          </div>
        </div>
      )}

      <div className="card scanner-card">
        <div id="reader" className="qr-reader" style={{ display: scanning ? "block" : "none" }}></div>
        {!scanning ? (
          <button className="btn btn-success btn-lg" onClick={startScan}>
            📷 Atombohy ny scan ({mode === "entree" ? "ENTRÉE" : "SORTIE"})
          </button>
        ) : (
          <button className="btn btn-danger" onClick={stopScan} style={{ marginTop: 12 }}>
            ⏹ Ajanony
          </button>
        )}
      </div>

      {stats && (
        <div className="stats-grid">
          <div className="stat-card green"><h2>{stats.present}</h2><p>À l'heure</p></div>
          <div className="stat-card orange"><h2>{stats.retard}</h2><p>Retards</p></div>
          <div className="stat-card red"><h2>{stats.tres_retard}</h2><p>Très retard</p></div>
          <div className="stat-card"><h2>{stats.non_prevu}</h2><p>Non prévus</p></div>
          <div className="stat-card blue"><h2>{stats.sortie}</h2><p>Sorties</p></div>
        </div>
      )}

      <div className="card">
        <div className="page-header">
          <h2>📋 Scans androany ({todayScans.length})</h2>
          <button className="btn btn-sm btn-secondary" onClick={loadToday}>🔄</button>
        </div>
        {todayScans.length === 0 ? <p className="empty">Mbola tsy misy scan.</p> : (
          <div className="scan-today-list">
            {todayScans.map(a => {
              const si = STATUTS[a.statut] || {};
              return (
                <div key={a.id} className="scan-today-item" style={{ borderLeft: `3px solid ${si.color}` }}>
                  <div className="scan-today-info">
                    <strong>{a.prenom} {a.nom}</strong>
                    <span>{a.matricule} • {a.classe_nom || "—"} {a.matiere ? `• ${a.matiere}` : ""}</span>
                  </div>
                  <div className="scan-today-right">
                    <span className="badge" style={{ background: si.color + "33", color: si.color }}>
                      {si.label || a.statut}
                    </span>
                    <span className="scan-time">{a.heure_reelle} {a.minutes_retard > 0 && `(+${a.minutes_retard}m)`}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
