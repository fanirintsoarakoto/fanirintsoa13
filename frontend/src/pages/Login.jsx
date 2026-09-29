import { useState } from "react";
import { apiFetch } from "../api";

export default function Login({ onAuth }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ username: "", email: "", password: "", prenom: "", telephone: "" });
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [remember, setRemember] = useState(localStorage.getItem("remember") === "1");

  async function submit(e) {
    e.preventDefault();
    setError(""); setInfo(""); setLoading(true);
    try {
      const path = mode === "login" ? "/auth/login" : "/auth/register";
      const body = mode === "login"
        ? { username: form.username, password: form.password }
        : form;
      const data = await apiFetch(path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (mode === "register") {
        setInfo(data.message || "Demande envoyée. Votre compte est en attente de validation par l'administrateur.");
        setMode("login");
        setForm({ username: "", email: "", password: "", prenom: "", telephone: "" });
        return;
      }
      localStorage.setItem("remember", remember ? "1" : "0");
      if (remember) localStorage.setItem("last_user", form.username);
      onAuth(data.token, data.user, data.permissions);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }

  return (
    <div className="login-page-pro">
      <div className="login-bg-decoration"></div>
      <form className="login-card-pro" onSubmit={submit}>
        <div className="login-logo-pro">
          <div className="login-logo-circle">🎓</div>
        </div>
        <h1>FANIRINTSOA</h1>
        <p className="login-sub">Système de gestion scolaire</p>

        {error && <div className="login-error-pro"><span>⚠️</span> {error}</div>}
        {info && (
          <div className="login-error-pro" style={{ background: "#dcfce7", color: "#166534", borderColor: "#86efac" }}>
            <span>✅</span> {info}
          </div>
        )}

        <div className="login-field">
          <label>Anarana na Email</label>
          <input value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            placeholder="anarana na email@exemple.mg" required autoFocus />
        </div>

        {mode === "register" && (
          <>
            <div className="login-field">
              <label>Email</label>
              <input type="email" value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="email@exemple.mg" required />
            </div>
            <div className="login-field">
              <label>Fanampiny</label>
              <input value={form.prenom}
                onChange={(e) => setForm({ ...form, prenom: e.target.value })}
                placeholder="Prénom" />
            </div>
            <div className="login-field">
              <label>Téléphone</label>
              <input value={form.telephone}
                onChange={(e) => setForm({ ...form, telephone: e.target.value })}
                placeholder="034 00 000 00" />
            </div>
          </>
        )}

        <div className="login-field">
          <label>Teny miafina</label>
          <div className="password-wrap">
            <input type={showPwd ? "text" : "password"}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="••••••••" required minLength={mode === "register" ? 8 : 1} />
            <button type="button" className="toggle-pwd" onClick={() => setShowPwd(!showPwd)}>
              {showPwd ? "🙈" : "👁️"}
            </button>
          </div>
          {mode === "register" && <small>8 litera farafahakeliny</small>}
        </div>

        {mode === "login" && (
          <div className="login-options">
            <label className="remember-check">
              <input type="checkbox" checked={remember}
                onChange={(e) => setRemember(e.target.checked)} />
              <span>Tsarovy aho</span>
            </label>
          </div>
        )}

        <button type="submit" className="btn-login-pro" disabled={loading}>
          {loading ? "⏳..." : (mode === "login" ? "🔐 Hiditra" : "✍️ Handefa demande")}
        </button>

        <p className="login-switch">
          {mode === "login"
            ? <>Tsy manana compte? <a onClick={() => { setMode("register"); setError(""); setInfo(""); }}>Hisoratra</a></>
            : <>Efa manana? <a onClick={() => { setMode("login"); setError(""); setInfo(""); }}>Hiditra</a></>}
        </p>
      </form>
    </div>
  );
}
