export const API = "http://localhost:8000";

export function authHeaders() {
  const t = localStorage.getItem("token");
  return t ? { Authorization: `Bearer ${t}` } : {};
}

export async function apiFetch(path, options = {}) {
  const r = await fetch(`${API}${path}`, {
    ...options,
    headers: { ...(options.headers || {}), ...authHeaders() },
  });
  if (r.status === 401) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/";
    throw new Error("Session expirée");
  }
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(data.error || "Nisy olana");
  return data;
}
