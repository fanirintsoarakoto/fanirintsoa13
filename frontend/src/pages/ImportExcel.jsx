import { useState } from "react";
import { apiFetch, API, authHeaders } from "../api";
import BadgesBatch from "../components/BadgesBatch";

export default function ImportExcel({ toast }) {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [importedBadges, setImportedBadges] = useState(null);

  async function upload() {
    if (!file) {
      toast("Mifidiana fichier aloha", "error");
      return;
    }
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const r = await fetch(`${API}/students/import-excel`, {
        method: "POST",
        headers: authHeaders(),
        body: fd,
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || "Nisy olana");
      setResult(data);
      toast(`✅ Importer: ${data.imported} / ${data.total}`);

      // 🎫 Raha nisy mpianatra nampidirina → alaivo ny badges rehetra
      if (data.imported > 0) {
        await loadImportedBadges();
      }
    } catch (e) {
      toast(e.message, "error");
    } finally {
      setLoading(false);
    }
  }

  async function loadImportedBadges() {
    try {
      // Alaina ny 30 mpianatra farany (izay vao nampidirina)
      const students = await apiFetch("/students");
      // Raha vitsy ny mpianatra dia izy daholo no aseho
      // Raha maro dia ny farany ihany
      const recent = students.slice(0, 50);
      const badges = recent.map((s) => ({
        id: s.id,
        matricule: s.matricule,
        nom: s.nom,
        prenom: s.prenom,
        classe_nom: s.classe_nom,
        photo: s.photo,
      }));
      if (badges.length > 0) {
        setImportedBadges(badges);
      }
    } catch (e) {}
  }

  function downloadTemplate() {
    fetch(`${API}/students/template`, { headers: authHeaders() })
      .then((r) => r.blob())
      .then((blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "modele_eleves.xlsx";
        a.click();
        URL.revokeObjectURL(url);
      });
  }

  return (
    <div>
      <h1>📥 Import Excel</h1>

      <div className="card">
        <h3>1. Modèle</h3>
        <p style={{ color: "var(--muted)", fontSize: "0.9rem" }}>
          Alaina aloha ny modèle raha vao manomboka.
        </p>
        <button className="btn btn-secondary" onClick={downloadTemplate}>
          📥 Télécharger le modèle
        </button>
      </div>

      <div className="card">
        <h3>2. Fichier</h3>
        <input
          type="file"
          accept=".xlsx,.xls"
          onChange={(e) => { setFile(e.target.files[0]); setResult(null); setImportedBadges(null); }}
          style={{ padding: 10, width: "100%" }}
        />
        {file && (
          <p style={{ color: "var(--muted)", fontSize: "0.85rem", marginTop: 8 }}>
            📎 {file.name} ({(file.size / 1024).toFixed(1)} KB)
          </p>
        )}
        <button className="btn" onClick={upload} disabled={!file || loading}
          style={{ marginTop: 12 }}>
          {loading ? "⏳ Manandrana..." : "⬆️ Importer"}
        </button>
      </div>

      {result && (
        <div className="card">
          <h3>3. Résultats</h3>
          <div className="stats-grid">
            <div className="stat-card"><h2>{result.total}</h2><p>Lignes</p></div>
            <div className="stat-card green"><h2>{result.imported}</h2><p>Importés</p></div>
            <div className="stat-card orange"><h2>{result.duplicates}</h2><p>Doublons</p></div>
            <div className="stat-card red"><h2>{result.errors.length}</h2><p>Erreurs</p></div>
          </div>

          {result.errors.length > 0 && (
            <div style={{ marginTop: 16 }}>
              <h4 style={{ color: "var(--danger)" }}>Erreurs</h4>
              <ul style={{ color: "var(--danger)", fontSize: "0.85rem" }}>
                {result.errors.slice(0, 10).map((e, i) => (
                  <li key={i}>Ligne {e.ligne}: {e.error}</li>
                ))}
              </ul>
            </div>
          )}

          {importedBadges && importedBadges.length > 0 && (
            <div style={{ marginTop: 20, padding: 16, background: "var(--primary-light)", borderRadius: 12 }}>
              <h4 style={{ margin: 0 }}>🎫 {importedBadges.length} badges vonona</h4>
              <p style={{ color: "var(--muted)", fontSize: "0.85rem", margin: "8px 0 12px" }}>
                Ny badge rehetra noforonina avy amin'ny import — azo télécharger amin'ny PDF iray.
              </p>
              <button
                className="btn btn-badge-download"
                onClick={() => setImportedBadges(importedBadges)}
              >
                🎫 Jereo sy alaivo ny badges ({importedBadges.length})
              </button>
            </div>
          )}
        </div>
      )}

      {/* 🎫 Badges récap après import */}
      {importedBadges && (
        <BadgesBatch
          badges={importedBadges}
          title={`Badges importés (${importedBadges.length})`}
          onClose={() => setImportedBadges(null)}
        />
      )}
    </div>
  );
}
