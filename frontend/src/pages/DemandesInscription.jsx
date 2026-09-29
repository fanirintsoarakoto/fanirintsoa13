import { useEffect, useState } from "react";
import { apiFetch } from "../api";

const post = (path, body) =>
  apiFetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body || {}),
  });

export default function DemandesInscription({ toast }) {
  const [tab, setTab] = useState("demandes");
  const [demandes, setDemandes] = useState([]);
  const [historique, setHistorique] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roles, setRoles] = useState({});

  async function load() {
    setLoading(true);
    try {
      setDemandes(await apiFetch("/admin/demandes"));
      setHistorique(await apiFetch("/admin/validations"));
    } catch (e) {
      toast && toast(e.message);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { load(); }, []);

  async function decide(id, action) {
    try {
      await post(`/admin/demandes/${id}/${action}`, action === "approve" ? { role: roles[id] || "user" } : {});
      toast && toast(action === "approve" ? "✅ Compte activé" : "❌ Demande refusée");
      load();
    } catch (e) {
      toast && toast(e.message);
    }
  }

  const fmt = (d) => (d ? new Date(d.replace(" ", "T") + "Z").toLocaleString("fr-FR") : "-");
  const pending = demandes.filter((d) => d.status === "PENDING");
  const rejected = demandes.filter((d) => d.status === "REJECTED");

  const card = { background: "#fff", borderRadius: 12, padding: 14, marginBottom: 12, boxShadow: "0 1px 4px rgba(0,0,0,.08)" };
  const btn = (bg) => ({ background: bg, color: "#fff", border: 0, borderRadius: 8, padding: "10px 14px", fontSize: 15, flex: 1 });
  const tabBtn = (t) => ({
    padding: "8px 14px", borderRadius: 8, border: 0, marginRight: 8,
    background: tab === t ? "#4f46e5" : "#e5e7eb", color: tab === t ? "#fff" : "#111",
  });

  return (
    <div style={{ padding: 16 }}>
      <h2>Demandes d'inscription</h2>
      <div style={{ margin: "12px 0" }}>
        <button style={tabBtn("demandes")} onClick={() => setTab("demandes")}>
          En attente ({pending.length})
        </button>
        <button style={tabBtn("refusees")} onClick={() => setTab("refusees")}>
          Refusées ({rejected.length})
        </button>
        <button style={tabBtn("historique")} onClick={() => setTab("historique")}>
          Historique
        </button>
      </div>

      {loading && <p>⏳ Chargement...</p>}

      {!loading && tab === "demandes" && (
        pending.length === 0 ? <p>Aucune demande en attente.</p> :
        pending.map((d) => (
          <div key={d.id} style={card}>
            <strong>{d.prenom ? `${d.prenom} (${d.username})` : d.username}</strong>
            <div>{d.email}</div>
            {d.telephone && <div>{d.telephone}</div>}
            <small>Demandé le {fmt(d.created_at)}</small>
            <div style={{ margin: "10px 0" }}>
              <label>Rôle : </label>
              <input
                value={roles[d.id] ?? "user"}
                onChange={(e) => setRoles({ ...roles, [d.id]: e.target.value })}
                style={{ width: 120 }}
              />
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button style={btn("#16a34a")} onClick={() => decide(d.id, "approve")}>✅ Accepter</button>
              <button style={btn("#dc2626")} onClick={() => decide(d.id, "reject")}>❌ Refuser</button>
            </div>
          </div>
        ))
      )}

      {!loading && tab === "refusees" && (
        rejected.length === 0 ? <p>Aucune demande refusée.</p> :
        rejected.map((d) => (
          <div key={d.id} style={card}>
            <strong>{d.username}</strong>
            <div>{d.email}</div>
            <small>Refusée le {fmt(d.approved_at)}</small>
            <div style={{ marginTop: 10 }}>
              <button style={btn("#16a34a")} onClick={() => decide(d.id, "approve")}>✅ Accepter finalement</button>
            </div>
          </div>
        ))
      )}

      {!loading && tab === "historique" && (
        historique.length === 0 ? <p>Aucune validation.</p> :
        historique.map((h) => (
          <div key={h.id} style={card}>
            <strong>{h.action === "APPROVE" ? "✅ Approuvé" : "❌ Refusé"}</strong> : {h.utilisateur}
            <div><small>par {h.admin || "?"} le {fmt(h.created_at)}</small></div>
          </div>
        ))
      )}
    </div>
  );
}
