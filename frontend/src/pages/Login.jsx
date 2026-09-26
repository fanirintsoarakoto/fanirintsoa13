import { useState } from "react";
import { apiFetch } from "../api";
export default function Login({ onAuth }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault(); setError(""); setLoading(true);
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
      onAuth(data.token, data.user);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }

  return (
    <div className="login-page">
      <form className="login-card" onSubmit={submit}>
        <h1>🎓 Fanirintsoa</h1>
        <p className="login-sub">Gestion des élèves</p>
        {error && <div className="login-error">{error}</div>}
        <input placeholder="Anarana" value={form.username}
          onChange={(e) => setForm({ ...form, username: e.target.value })} required autoFocus />
        {mode === "register" && (
          <input type="email" placeholder="Email" value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        )}
        <input type="password" placeholder="Teny miafina" value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })} required minLength={4} />
        <button type="submit" disabled={loading}>
          {loading ? "..." : (mode === "login" ? "Hiditra" : "Hisoratra")}
        </button>
        <p className="login-switch">
          {mode === "login"
            ? <>Tsy manana compte? <a onClick={() => setMode("register")}>Hisoratra</a></>
            : <>Efa manana compte? <a onClick={() => setMode("login")}>Hiditra</a></>}
        </p>
      </form>
    </div>
  );
}
