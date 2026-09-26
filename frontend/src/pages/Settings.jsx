import { useEffect, useState } from "react";
import { apiFetch, API, authHeaders } from "../api";

export default function Settings({ toast }) {
  const [classes, setClasses] = useState([]);
  const [groupes, setGroupes] = useState([]);
  const [newClasse, setNewClasse] = useState("");
  const [newGroupe, setNewGroupe] = useState("");
  const [groupeClasse, setGroupeClasse] = useState("");

  async function load() {
    const [c, g] = await Promise.all([apiFetch("/classes"), apiFetch("/groupes")]);
    setClasses(c); setGroupes(g);
  }
  useEffect(() => { load(); }, []);

  async function addClasse(e) {
    e.preventDefault();
    if (!newClasse.trim()) return;
    try {
      await apiFetch("/classes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nom: newClasse }),
      });
      setNewClasse(""); load(); toast("Classe nampiana ✓");
    } catch (e) { toast(e.message, "error"); }
  }

  async function addGroupe(e) {
    e.preventDefault();
    if (!newGroupe.trim()) return;
    await apiFetch("/groupes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nom: newGroupe,
        classe_id: groupeClasse ? Number(groupeClasse) : null }),
    });
    setNewGroupe(""); load(); toast("Groupe nampiana ✓");
  }

  async function delClasse(id) {
    if (!confirm("Hamafa?")) return;
    await apiFetch(`/classes/${id}`, { method: "DELETE" });
    load();
  }

  async function delGroupe(id) {
    if (!confirm("Hamafa?")) return;
    await apiFetch(`/groupes/${id}`, { method: "DELETE" });
    load();
  }

  async function backup() {
    const data = await apiFetch("/backup");
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `backup-fanirintsoa-${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast("Backup vita ✓");
  }

  function restoreFile() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = (e) => {
      const f = e.target.files[0];
      if (!f) return;
      const reader = new FileReader();
      reader.onload = async (ev) => {
        try {
          const data = JSON.parse(ev.target.result);
          if (!confirm(`Restore ${data.students?.length || 0} élèves?`)) return;
          const r = await fetch(`${API}/restore`, {
            method: "POST",
            headers: { "Content-Type": "application/json", ...authHeaders() },
            body: JSON.stringify(data),
          });
          const res = await r.json();
          if (!r.ok) throw new Error(res.error);
          toast(`Restore: ${res.restored} élèves ✓`);
        } catch (err) { toast(err.message, "error"); }
      };
      reader.readAsText(f);
    };
    input.click();
  }

  return (
    <div>
      <h1>⚙️ Paramètres</h1>

      <div className="card">
        <h3>💾 Backup / Restore</h3>
        <p style={{ color: "var(--muted)", fontSize: "0.9rem" }}>
          Alaivo tahiry ny data rehetra na avereno avy amin'ny fichier.
        </p>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button className="btn btn-secondary" onClick={backup}>📤 Backup JSON</button>
          <button className="btn btn-secondary" onClick={restoreFile}>📥 Restore JSON</button>
        </div>
      </div>

      <div className="card">
        <h3>🏫 Classes ({classes.length})</h3>
        <form onSubmit={addClasse} className="toolbar">
          <input placeholder="Anaran'ny classe" value={newClasse}
            onChange={(e) => setNewClasse(e.target.value)} />
          <button className="btn" type="submit">+ Ampio</button>
        </form>
        <ul style={{ listStyle: "none", padding: 0 }}>
          {classes.map(c => (
            <li key={c.id} style={{
              display: "flex", justifyContent: "space-between",
              padding: 10, borderBottom: "1px solid var(--border)"
            }}>
              <span><strong>{c.nom}</strong> — {c.nb_students} élèves</span>
              <button className="btn btn-sm btn-danger" onClick={() => delClasse(c.id)}>🗑</button>
            </li>
          ))}
        </ul>
      </div>

      <div className="card">
        <h3>👥 Groupes ({groupes.length})</h3>
        <form onSubmit={addGroupe} className="toolbar">
          <input placeholder="Anaran'ny groupe" value={newGroupe}
            onChange={(e) => setNewGroupe(e.target.value)} />
          <select value={groupeClasse} onChange={(e) => setGroupeClasse(e.target.value)}>
            <option value="">Tsy misy classe</option>
            {classes.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}
          </select>
          <button className="btn" type="submit">+ Ampio</button>
        </form>
        <ul style={{ listStyle: "none", padding: 0 }}>
          {groupes.map(g => (
            <li key={g.id} style={{
              display: "flex", justifyContent: "space-between",
              padding: 10, borderBottom: "1px solid var(--border)"
            }}>
              <span><strong>{g.nom}</strong></span>
              <button className="btn btn-sm btn-danger" onClick={() => delGroupe(g.id)}>🗑</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
