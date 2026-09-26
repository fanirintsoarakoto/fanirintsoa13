import { useEffect, useState, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { apiFetch } from "../api";

export default function Scanner({ toast }) {
  const [scanning, setScanning] = useState(false);
  const [lastStudent, setLastStudent] = useState(null);
  const [error, setError] = useState("");
  const [todayList, setTodayList] = useState([]);
  const [heureLimite, setHeureLimite] = useState("08:00");
  const [cameras, setCameras] = useState([]);
  const [selectedCamera, setSelectedCamera] = useState("");
  const scannerRef = useRef(null);
  const lastScanRef = useRef(null);
  const cooldownRef = useRef(false);

  async function loadToday() {
    try {
      const data = await apiFetch("/attendance/today");
      setTodayList(data);
    } catch (e) {}
  }

  useEffect(() => {
    loadToday();
    Html5Qrcode.getCameras()
      .then((devices) => {
        if (devices && devices.length) {
          setCameras(devices);
          // Safidio ny camera "back" raha misy
          const back = devices.find(
            (d) => /back|rear|environment/i.test(d.label)
          );
          setSelectedCamera(back ? back.id : devices[devices.length - 1].id);
        }
      })
      .catch(() => {});
  }, []);

  async function startScan() {
    setError("");
    if (scanning) return;

    // ZAVA-DEHIBE: Set scanning = true ALOHA mba hiseho ny div
    setScanning(true);

    // Andraso kely mba hahazoana antoka fa efa ao amin'ny DOM ny div
    setTimeout(async () => {
      try {
        const readerEl = document.getElementById("reader");
        if (!readerEl) {
          setError("Tsy hita ny #reader element");
          setScanning(false);
          return;
        }

        const qr = new Html5Qrcode("reader", { verbose: false });
        scannerRef.current = qr;

        const config = {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        };

        if (selectedCamera) {
          await qr.start(selectedCamera, config, onScanSuccess, () => {});
        } else {
          await qr.start(
            { facingMode: "environment" },
            config,
            onScanSuccess,
            () => {}
          );
        }
      } catch (e) {
        console.error(e);
        setError("Camera: " + (e.message || e));
        setScanning(false);
      }
    }, 150);
  }

  async function stopScan() {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
      } catch (e) {}
      scannerRef.current = null;
    }
    setScanning(false);
  }

  async function onScanSuccess(text) {
    if (cooldownRef.current) return;
    if (lastScanRef.current === text) return;
    cooldownRef.current = true;
    lastScanRef.current = text;
    setTimeout(() => {
      cooldownRef.current = false;
    }, 2500);

    try {
      const res = await apiFetch("/attendance/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: text, heure_limite: heureLimite }),
      });
      setLastStudent({ ...res.student, ...res.attendance, success: true });
      setError("");
      toast(
        `✅ ${res.student.prenom} ${res.student.nom} — ${res.attendance.heure_arrivee}`
      );
      if (navigator.vibrate) navigator.vibrate(200);
      loadToday();
    } catch (e) {
      setError(e.message || "Nisy olana");
      if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
    }
  }

  return (
    <div>
      <div className="page-header">
        <h1>📱 Scanner les présences</h1>
        <input
          type="time"
          value={heureLimite}
          onChange={(e) => setHeureLimite(e.target.value)}
          title="Heure limite avant retard"
          style={{
            padding: 8,
            borderRadius: 8,
            border: "1px solid var(--border)",
            background: "var(--card)",
            color: "var(--text)",
          }}
        />
      </div>

      {error && (
        <div className="error-banner">
          ⚠️ {error}
          <button
            onClick={() => setError("")}
            style={{
              background: "transparent",
              border: "none",
              color: "inherit",
              cursor: "pointer",
              fontSize: "1.2rem",
            }}
          >
            ✕
          </button>
        </div>
      )}

      {cameras.length > 1 && !scanning && (
        <div className="card">
          <label style={{ fontSize: "0.85rem", color: "var(--muted)" }}>
            Camera :
          </label>
          <select
            value={selectedCamera}
            onChange={(e) => setSelectedCamera(e.target.value)}
            style={{
              width: "100%",
              padding: 8,
              borderRadius: 8,
              border: "1px solid var(--border)",
              background: "var(--bg)",
              color: "var(--text)",
              marginTop: 4,
            }}
          >
            {cameras.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label || c.id.slice(0, 8)}
              </option>
            ))}
          </select>
        </div>
      )}

      {lastStudent && lastStudent.success && (
        <div className="scan-success">
          <div className="scan-success-icon">✅</div>
          <div className="scan-success-info">
            {lastStudent.photo ? (
              <img src={lastStudent.photo} alt="" className="scan-photo" />
            ) : (
              <div className="scan-photo placeholder">👤</div>
            )}
            <div className="scan-details">
              <h2>
                {lastStudent.prenom} {lastStudent.nom}
              </h2>
              <p>
                <strong>{lastStudent.matricule}</strong>
              </p>
              <p>
                🕐 {lastStudent.heure_arrivee} —{" "}
                <span className={`badge ${lastStudent.statut}`}>
                  {lastStudent.statut}
                </span>
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="card scanner-card">
        {/* ZAVA-DEHIBE: Ny #reader div dia ASON'NY FOANA ao amin'ny DOM */}
        <div
          id="reader"
          className="qr-reader"
          style={{ display: scanning ? "block" : "none" }}
        ></div>

        {!scanning ? (
          <button className="btn btn-success btn-lg" onClick={startScan}>
            📷 Atombohy ny scan
          </button>
        ) : (
          <button
            className="btn btn-danger"
            onClick={stopScan}
            style={{ marginTop: 12 }}
          >
            ⏹ Ajanony
          </button>
        )}
      </div>

      <div className="card">
        <div className="page-header">
          <h2>📋 Androany ({todayList.length})</h2>
          <button className="btn btn-sm btn-secondary" onClick={loadToday}>
            🔄 Refresh
          </button>
        </div>
        {todayList.length === 0 ? (
          <p className="empty">Mbola tsy misy présence androany.</p>
        ) : (
          <div className="scan-today-list">
            {todayList.map((a) => (
              <div key={a.id} className="scan-today-item">
                {a.photo ? (
                  <img src={a.photo} alt="" className="scan-today-photo" />
                ) : (
                  <div className="scan-today-photo placeholder">👤</div>
                )}
                <div className="scan-today-info">
                  <strong>
                    {a.prenom} {a.nom}
                  </strong>
                  <span>
                    {a.matricule} • {a.classe_nom || "—"}
                  </span>
                </div>
                <div className="scan-today-right">
                  <span className={`badge ${a.statut}`}>{a.statut}</span>
                  <span className="scan-time">{a.heure_arrivee}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
