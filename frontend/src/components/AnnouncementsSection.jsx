import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { API } from "../api";

export default function AnnouncementsSection({ limit = 3, showAll = true }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/public/annonces`)
      .then(r => r.json())
      .then(d => setItems(Array.isArray(d) ? d.slice(0, limit) : []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [limit]);

  if (loading) return null;
  if (items.length === 0) return null;

  return (
    <section className="pro-section">
      <div className="pro-section-header">
        <div className="pro-section-title">
          <span className="pro-section-icon">📢</span>
          <div>
            <h2>Actualités & Annonces</h2>
            <p>Ny vaovao farany avy amin'ny établissement</p>
          </div>
        </div>
        {showAll && (
          <Link to="/annonces" className="pro-btn-ghost">
            Voir toutes →
          </Link>
        )}
      </div>

      <div className="pro-grid">
        {items.map(a => (
          <Link to={`/annonces/${a.id}`} key={a.id} className="pro-annonce-card">
            <div className="pro-card-cover">
              {a.image_url ? (
                <img src={a.image_url} alt={a.titre} />
              ) : (
                <div className="pro-card-placeholder">
                  <span>📢</span>
                </div>
              )}
              <div className="pro-badges">
                <span className="pro-badge pro-badge-primary">📢 Annonce</span>
                {a.priorite && a.priorite !== "normale" && (
                  <span className={`pro-badge pro-badge-${a.priorite}`}>
                    {a.priorite}
                  </span>
                )}
              </div>
            </div>
            <div className="pro-card-content">
              <div className="pro-card-meta">
                <span className="pro-date">
                  {a.published_at ? new Date(a.published_at).toLocaleDateString("fr-FR", {
                    day: "numeric", month: "long", year: "numeric"
                  }) : ""}
                </span>
                {a.categorie && a.categorie !== "general" && (
                  <span className="pro-cat">{a.categorie}</span>
                )}
              </div>
              <h3 className="pro-card-title">{a.titre}</h3>
              <p className="pro-card-excerpt">
                {(a.contenu || "").slice(0, 120)}
                {(a.contenu || "").length > 120 ? "..." : ""}
              </p>
              <span className="pro-card-cta">Lire la suite →</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
