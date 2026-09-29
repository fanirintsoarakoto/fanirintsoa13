import { useEffect, useState, useRef } from "react";
import { apiFetch } from "../api";

export default function Messages({ toast, user }) {
  const [conversations, setConversations] = useState([]);
  const [users, setUsers] = useState([]);
  const [selected, setSelected] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);
  const currentUser = user || JSON.parse(localStorage.getItem("user") || "{}");

  async function loadConversations() {
    try {
      const data = await apiFetch("/messages/conversations");
      setConversations(data);
    } catch (e) {}
  }

  async function loadUsers() {
    try { setUsers(await apiFetch("/users/list")); } catch (e) {}
  }

  async function loadMessages(otherId) {
    setLoading(true);
    try {
      const data = await apiFetch(`/messages/with/${otherId}`);
      setMessages(data);
      setTimeout(() => endRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    } catch (e) { setMessages([]); }
    finally { setLoading(false); }
  }

  useEffect(() => {
    loadConversations();
    loadUsers();
    const id = setInterval(() => {
      loadConversations();
      if (selected) loadMessages(selected.id);
    }, 8000);
    return () => clearInterval(id);
  }, [selected]);

  async function send(e) {
    e.preventDefault();
    if (!text.trim() || !selected) return;
    try {
      await apiFetch("/messages/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ receiver_id: selected.id, contenu: text }),
      });
      setText("");
      loadMessages(selected.id);
      loadConversations();
    } catch (e) { toast(e.message, "error"); }
  }

  function selectUser(u) {
    setSelected(u);
    setShowNew(false);
    loadMessages(u.id);
  }

  async function removeMessage(id) {
    if (!confirm("Hamafa io hafatra io?")) return;
    await apiFetch(`/messages/${id}`, { method: "DELETE" });
    loadMessages(selected.id);
  }

  function formatTime(ts) {
    if (!ts) return "";
    const d = new Date(ts);
    const now = new Date();
    const diffDays = Math.floor((now - d) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
    if (diffDays === 1) return "Hier";
    if (diffDays < 7) return d.toLocaleDateString("fr-FR", { weekday: "short" });
    return d.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
  }

  return (
    <div>
      <div className="page-header">
        <h1>💬 Messages</h1>
        <button className="btn btn-pdf-export" onClick={() => setShowNew(!showNew)}>
          {showNew ? "← Conversations" : "+ Nouveau message"}
        </button>
      </div>

      <div className="chat-wrapper">
        {/* SIDEBAR */}
        <div className={`chat-sidebar ${selected ? "mobile-hidden" : ""}`}>
          {showNew ? (
            <>
              <div className="chat-sidebar-head">👥 Safidio destinataire</div>
              <div className="chat-list">
                {users.length === 0 ? (
                  <p className="empty">Tsy misy utilisateur hafa.</p>
                ) : (
                  users.map(u => (
                    <div key={u.id} className="chat-item"
                      onClick={() => selectUser(u)}>
                      <div className="chat-avatar">
                        {u.photo ? <img src={u.photo} alt="" /> : (u.prenom?.[0] || u.username[0]).toUpperCase()}
                      </div>
                      <div className="chat-item-info">
                        <strong>{u.prenom || u.username}</strong>
                        <span>{u.role}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          ) : (
            <>
              <div className="chat-sidebar-head">📩 Conversations</div>
              <div className="chat-list">
                {conversations.length === 0 ? (
                  <p className="empty">
                    Tsy misy conversation.<br />
                    Tsindrio "+ Nouveau message".
                  </p>
                ) : (
                  conversations.map(c => {
                    const u = c.user;
                    const isActive = selected?.id === u.id;
                    return (
                      <div key={u.id}
                        className={`chat-item ${isActive ? "active" : ""}`}
                        onClick={() => selectUser(u)}>
                        <div className="chat-avatar">
                          {u.photo ? <img src={u.photo} alt="" /> : (u.prenom?.[0] || u.username[0]).toUpperCase()}
                        </div>
                        <div className="chat-item-info">
                          <div className="chat-item-top">
                            <strong>{u.prenom || u.username}</strong>
                            <span className="chat-time">
                              {formatTime(c.last_message?.created_at)}
                            </span>
                          </div>
                          <div className="chat-item-bottom">
                            <span className="chat-preview">
                              {c.last_message?.contenu?.slice(0, 35)}
                              {c.last_message?.contenu?.length > 35 ? "..." : ""}
                            </span>
                            {c.unread > 0 && (
                              <span className="chat-badge">{c.unread}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </>
          )}
        </div>

        {/* CHAT ZONE */}
        <div className={`chat-main ${!selected ? "mobile-hidden" : ""}`}>
          {!selected ? (
            <div className="chat-empty">
              <span>💬</span>
              <p>Mifidiana conversation na mamorona vaovao</p>
            </div>
          ) : (
            <>
              <div className="chat-head">
                <button className="btn btn-sm btn-secondary chat-back"
                  onClick={() => setSelected(null)}>←</button>
                <div className="chat-avatar small">
                  {selected.photo ? <img src={selected.photo} alt="" /> : (selected.prenom?.[0] || selected.username[0]).toUpperCase()}
                </div>
                <div className="chat-head-info">
                  <strong>{selected.prenom || selected.username}</strong>
                  <span>{selected.role}</span>
                </div>
              </div>

              <div className="chat-body">
                {loading ? (
                  <div className="loading">⏳...</div>
                ) : messages.length === 0 ? (
                  <div className="chat-empty">
                    <p>Manomboha resaka amin'ny {selected.prenom || selected.username}</p>
                  </div>
                ) : (
                  messages.map(m => {
                    const isMine = m.sender_id === currentUser.id;
                    return (
                      <div key={m.id}
                        className={`chat-bubble-wrap ${isMine ? "mine" : "theirs"}`}>
                        <div className={`chat-bubble ${isMine ? "mine" : "theirs"}`}>
                          <p>{m.contenu}</p>
                          <div className="chat-bubble-meta">
                            <span>{formatTime(m.created_at)}</span>
                            {isMine && m.lu === 1 && <span className="read-tick">✓✓</span>}
                          </div>
                          <button className="chat-delete"
                            onClick={() => removeMessage(m.id)}>×</button>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={endRef} />
              </div>

              <form className="chat-input-bar" onSubmit={send}>
                <input value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Soraty ny hafatra..." />
                <button type="submit" disabled={!text.trim()}>📤</button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
