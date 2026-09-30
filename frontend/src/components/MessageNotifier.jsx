import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { apiFetch } from "../api";

export default function MessageNotifier({ toast }) {
  const [n, setN] = useState(0);
  const prev = useRef(null);
  const loc = useLocation();

  useEffect(() => {
    let stop = false;
    async function check() {
      try {
        const r = await apiFetch("/messages/unread-count");
        const v = typeof r === "number" ? r : (r.count ?? r.unread ?? r.n ?? 0);
        if (stop) return;
        if (prev.current !== null && v > prev.current && toast) {
          const d = v - prev.current;
          toast(`💬 ${d} nouveau message${d > 1 ? "s" : ""}`);
        }
        prev.current = v;
        setN(v);
      } catch (e) {}
    }
    check();
    const t = setInterval(check, 8000);
    return () => { stop = true; clearInterval(t); };
  }, []);

  if (!n || loc.pathname.startsWith("/messages")) return null;
  return (
    <Link to="/messages" style={{
      position: "fixed", right: 18, bottom: 18, zIndex: 1000,
      width: 58, height: 58, borderRadius: "50%", background: "#4f46e5",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: 26, textDecoration: "none", boxShadow: "0 4px 12px rgba(0,0,0,.3)",
    }}>
      💬
      <span style={{
        position: "absolute", top: -4, right: -4, background: "#dc2626", color: "#fff",
        borderRadius: 12, minWidth: 22, height: 22, fontSize: 12,
        display: "flex", alignItems: "center", justifyContent: "center", padding: "0 5px",
      }}>{n}</span>
    </Link>
  );
}
