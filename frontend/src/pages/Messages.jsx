import { useEffect, useRef, useState } from "react";
import { apiFetch } from "../api";

const parse = (d) => (d ? new Date(d.replace(" ", "T") + "Z") : null);
const hm = (d) => {
  const x = parse(d);
  return x ? x.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }) : "";
};
const short = (d) => {
  const x = parse(d);
  if (!x) return "";
  return x.toDateString() === new Date().toDateString()
    ? hm(d)
    : x.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" });
};
const dayLabel = (d) => {
  const x = parse(d);
  if (!x) return "";
  if (x.toDateString() === new Date().toDateString()) return "Aujourd'hui";
  return x.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });
};
const nm = (u) => u.prenom || u.username;
const COLORS = ["#4f46e5", "#0891b2", "#16a34a", "#d97706", "#db2777", "#7c3aed"];

function Avatar({ u, size = 46 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%", flexShrink: 0,
      background: COLORS[u.id % COLORS.length], color: "#fff",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontWeight: 700, fontSize: size / 2.3,
    }}>
      {nm(u).charAt(0).toUpperCase()}
    </div>
  );
}

export default function Messages({ toast, user }) {
  const [convs, setConvs] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [active, setActive] = useState(null);
  const [msgs, setMsgs] = useState([]);
  const [text, setText] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [sending, setSending] = useState(false);
  const [q, setQ] = useState("");
  const bottom = useRef(null);
  const me = user?.id;

  async function loadConvs() {
    try { setConvs(await apiFetch("/messages/conversations")); } catch (e) {}
  }
  async function loadMsgs(id) {
    try { setMsgs(await apiFetch(`/messages/with/${id}`)); } catch (e) {}
  }

  useEffect(() => {
    loadConvs();
    apiFetch("/messages/contacts").then(setContacts).catch(() => {});
    const t = setInterval(loadConvs, 8000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (!active) return;
    loadMsgs(active.id).then(loadConvs);
    const t = setInterval(() => loadMsgs(active.id), 5000);
    return () => clearInterval(t);
  }, [active?.id]);

  useEffect(() => {
    bottom.current && bottom.current.scrollIntoView({ behavior: "smooth" });
  }, [msgs.length, active?.id]);

  function open(u) {
    setMsgs([]); setActive(u); setShowNew(false); setQ("");
  }

  async function send(e) {
    e.preventDefault();
    const contenu = text.trim();
    if (!contenu || !active || sending) return;
    setSending(true);
    try {
      const m = await apiFetch("/messages/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ receiver_id: active.id, contenu }),
      });
      setMsgs((x) => [...x, m]);
      setText("");
      loadConvs();
    } catch (err) {
      toast && toast(err.message);
    } finally {
      setSending(false);
    }
  }

  const box = { height: "calc(100dvh - 80px)", display: "flex", flexDirection: "column", background: "#fff", borderRadius: 12, overflow: "hidden" };
  const head = { padding: "12px 14px", borderBottom: "1px solid #e5e7eb", display: "flex", alignItems: "center", gap: 10 };

  if (active) {
    let lastDay = "";
    return (
      <div style={box}>
        <div style={head}>
          <button onClick={() => { setActive(null); loadConvs(); }}
            style={{ border: 0, background: "none", fontSize: 22 }}>←</button>
          <Avatar u={active} size={38} />
          <div>
            <strong>{nm(active)}</strong>
            <div style={{ fontSize: 12, color: "#6b7280" }}>{active.role === "admin" ? "Administrateur" : "Utilisateur"}</div>
          </div>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: 12, display: "flex", flexDirection: "column", gap: 6, background: "#f3f4f6" }}>
          {msgs.length === 0 && <p style={{ textAlign: "center", color: "#6b7280" }}>Aucun message. Commencez la conversation 👋</p>}
          {msgs.map((m) => {
            const mine = m.sender_id === me;
            const dl = dayLabel(m.created_at);
            const sep = dl !== lastDay;
            lastDay = dl;
            return (
              <div key={m.id} style={{ display: "flex", flexDirection: "column" }}>
                {sep && <div style={{ textAlign: "center", fontSize: 12, color: "#6b7280", margin: "8px 0" }}>{dl}</div>}
                <div style={{
                  alignSelf: mine ? "flex-end" : "flex-start", maxWidth: "80%",
                  background: mine ? "#4f46e5" : "#fff", color: mine ? "#fff" : "#111",
                  padding: "8px 12px", wordBreak: "break-word",
                  borderRadius: mine ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                  boxShadow: "0 1px 2px rgba(0,0,0,.08)",
                }}>
                  <div>{m.contenu}</div>
                  <div style={{ fontSize: 11, textAlign: "right", opacity: 0.75, marginTop: 2 }}>
                    {hm(m.created_at)} {mine && (m.lu ? "✓✓" : "✓")}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={bottom} />
        </div>
        <form onSubmit={send} style={{ display: "flex", gap: 8, padding: 10, borderTop: "1px solid #e5e7eb" }}>
          <input value={text} onChange={(e) => setText(e.target.value)}
            placeholder="Écrire un message..."
            style={{ flex: 1, padding: "10px 14px", borderRadius: 22, border: "1px solid #d1d5db", fontSize: 16 }} />
          <button type="submit" disabled={sending || !text.trim()}
            style={{ width: 44, height: 44, borderRadius: "50%", border: 0, background: "#4f46e5", color: "#fff", fontSize: 18, opacity: text.trim() ? 1 : 0.5 }}>➤</button>
        </form>
      </div>
    );
  }

  const list = showNew
    ? contacts.filter((c) => (nm(c) + c.username).toLowerCase().includes(q.toLowerCase()))
    : convs.filter((c) => (nm(c.user) + c.user.username).toLowerCase().includes(q.toLowerCase()));
  const totalUnread = convs.reduce((a, c) => a + (c.unread || 0), 0);

  return (
    <div style={box}>
      <div style={{ ...head, justifyContent: "space-between" }}>
        <h2 style={{ margin: 0 }}>
          {showNew ? "Nouveau message" : "Messages"}
          {!showNew && totalUnread > 0 && (
            <span style={{ marginLeft: 8, background: "#dc2626", color: "#fff", borderRadius: 12, padding: "2px 8px", fontSize: 13 }}>{totalUnread}</span>
          )}
        </h2>
        <button onClick={() => { setShowNew(!showNew); setQ(""); }}
          style={{ border: 0, background: "#4f46e5", color: "#fff", borderRadius: 20, padding: "8px 14px" }}>
          {showNew ? "✕ Fermer" : "✏️ Nouveau"}
        </button>
      </div>
      <div style={{ padding: "8px 12px" }}>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="🔍 Rechercher..."
          style={{ width: "100%", boxSizing: "border-box", padding: "10px 14px", borderRadius: 22, border: "1px solid #d1d5db", fontSize: 16 }} />
      </div>
      <div style={{ flex: 1, overflowY: "auto" }}>
        {list.length === 0 && (
          <p style={{ textAlign: "center", color: "#6b7280", padding: 20 }}>
            {showNew ? "Aucun contact disponible." : "Aucune conversation. Appuyez sur « Nouveau »."}
          </p>
        )}
        {showNew
          ? list.map((c) => (
              <div key={c.id} onClick={() => open(c)}
                style={{ display: "flex", gap: 12, alignItems: "center", padding: "10px 14px", cursor: "pointer" }}>
                <Avatar u={c} />
                <div>
                  <strong>{nm(c)}</strong>
                  <div style={{ fontSize: 13, color: "#6b7280" }}>{c.role === "admin" ? "Administrateur" : "Utilisateur"}</div>
                </div>
              </div>
            ))
          : list.map((c) => {
              const lm = c.last_message;
              const unread = c.unread > 0;
              return (
                <div key={c.user.id} onClick={() => open(c.user)}
                  style={{ display: "flex", gap: 12, alignItems: "center", padding: "10px 14px", cursor: "pointer", background: unread ? "#eef2ff" : "transparent" }}>
                  <Avatar u={c.user} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <strong>{nm(c.user)}</strong>
                      <small style={{ color: unread ? "#4f46e5" : "#6b7280" }}>{lm ? short(lm.created_at) : ""}</small>
                    </div>
                    <div style={{ fontSize: 14, color: unread ? "#111" : "#6b7280", fontWeight: unread ? 600 : 400, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {lm ? (lm.sender_id === me ? "Vous : " : "") + lm.contenu : ""}
                    </div>
                  </div>
                  {unread && (
                    <span style={{ background: "#dc2626", color: "#fff", borderRadius: 12, minWidth: 22, height: 22, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, padding: "0 6px" }}>{c.unread}</span>
                  )}
                </div>
              );
            })}
      </div>
    </div>
  );
}
