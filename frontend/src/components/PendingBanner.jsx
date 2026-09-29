import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiFetch } from "../api";

export default function PendingBanner({ user }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!user || user.role !== "admin") return;
    let stop = false;
    async function check() {
      try {
        const rows = await apiFetch("/admin/demandes");
        if (!stop) setCount(rows.filter((r) => r.status === "PENDING").length);
      } catch (e) {}
    }
    check();
    const t = setInterval(check, 30000);
    return () => { stop = true; clearInterval(t); };
  }, [user]);

  if (!count) return null;
  return (
    <Link
      to="/admin/demandes"
      style={{
        display: "block", background: "#f59e0b", color: "#fff",
        padding: "12px 16px", textAlign: "center", fontWeight: 600,
        textDecoration: "none",
      }}
    >
      🔔 {count} demande{count > 1 ? "s" : ""} d'inscription en attente : tsindrio mba hankatoavina
    </Link>
  );
}
