import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { API } from "../api";

export default function AnnonceDetail() {
  const { id } = useParams();
  const [a, setA] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`${API}/public/annonces/${id}`)
      .then(r => r.json())
      .then(d => d.error ? setError(d.error) : setA(d))
      .catch(() => setError("Erreur"));
  }, [id]);

  if (error) return (
    <div className="pro-page">
      <Link to="/annonces" className="pro-btn-ghost">← Miverina</Link>
      <div className="pro-empty"><span>⚠️</span><p>{error}</p></div>
    </div>
  );
  if (!a) return <div className="pro-loading">⏳...</div>;

  return (
    <article className="pro-detail">
      <Link to="/annonces" className="pro-btn-ghost pro-btn-back">
        ← Miverina amin'ny annonces
      </Link>

      {a.image_url && (
        <div className="pro-detail-hero">
          <img src={a.image_url} alt={a.titre} />
          <div className="pro-badges pro-badges-float">
            <span className="pro-badge pro-badge-primary">📢 Annonce</span>
          </div>
        </div>
      )}

      <div className="pro-detail-body">
        <div className="pro-badges">
          <span className="pro-badge pro-badge-primary">📢 Annonce</span>
          {a.categorie && <span className="pro-badge pro-badge-cat">{a.categorie}</span>}
          {a.priorite && a.priorite !== "normale" && (
            <span className={`pro-badge pro-badge-${a.priorite}`}>{a.priorite}</span>
          )}
        </div>

        <h1>{a.titre}</h1>

        <div className="pro-detail-meta">
          <span>✍️ {a.auteur || "Admin"}</span>
          {a.published_at && (
            <span>📅 {new Date(a.published_at).toLocaleDateString("fr-FR", {
              day: "numeric", month: "long", year: "numeric"
            })}</span>
          )}
        </div>

        <div className="pro-detail-content">
          {(a.contenu || "").split("\n").map((p, i) => p && <p key={i}>{p}</p>)}
        </div>
      </div>
    </article>
  );
}
