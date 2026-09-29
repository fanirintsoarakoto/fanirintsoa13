import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { API } from "../api";

const TYPE_ICONS = {
  examen: "📝", fete: "🎉", reunion: "👥",
  sport: "⚽", sortie: "🚌", autre: "📌",
};

export default function EvenementDetail() {
  const { id } = useParams();
  const [e, setE] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`${API}/public/evenements/${id}`)
      .then(r => r.json())
      .then(d => d.error ? setError(d.error) : setE(d))
      .catch(() => setError("Erreur"));
  }, [id]);

  if (error) return (
    <div className="pro-page">
      <Link to="/evenements" className="pro-btn-ghost">← Miverina</Link>
      <div className="pro-empty"><span>⚠️</span><p>{error}</p></div>
    </div>
  );
  if (!e) return <div className="pro-loading">⏳...</div>;

  const dateStr = e.event_date || e.date_event;
  const d = dateStr ? new Date(dateStr) : null;
  const icon = TYPE_ICONS[e.type] || TYPE_ICONS.autre;

  return (
    <article className="pro-detail">
      <Link to="/evenements" className="pro-btn-ghost pro-btn-back">
        ← Miverina amin'ny événements
      </Link>

      <div className="pro-detail-hero">
        {e.image_url ? (
          <img src={e.image_url} alt={e.titre} />
        ) : (
          <div className="pro-detail-placeholder">
            <span>{icon}</span>
          </div>
        )}
        <div className="pro-badges pro-badges-float">
          <span className="pro-badge pro-badge-secondary">🎉 Événement</span>
        </div>
      </div>

      <div className="pro-detail-body">
        <div className="pro-badges">
          <span className="pro-badge pro-badge-secondary">🎉 Événement</span>
          <span className="pro-badge pro-badge-type">{icon} {e.type}</span>
          {e.categorie && <span className="pro-badge pro-badge-cat">{e.categorie}</span>}
        </div>

        <h1>{e.titre}</h1>

        <div className="pro-event-details">
          <div className="pro-detail-item">
            <div className="pro-di-icon">📅</div>
            <div>
              <div className="pro-di-label">Date</div>
              <div className="pro-di-value">
                {d ? d.toLocaleDateString("fr-FR", {
                  weekday: "long", day: "numeric", month: "long", year: "numeric"
                }) : "—"}
              </div>
            </div>
          </div>
          {(e.event_time || e.heure) && (
            <div className="pro-detail-item">
              <div className="pro-di-icon">🕐</div>
              <div>
                <div className="pro-di-label">Heure</div>
                <div className="pro-di-value">{e.event_time || e.heure}</div>
              </div>
            </div>
          )}
          {e.lieu && (
            <div className="pro-detail-item">
              <div className="pro-di-icon">📍</div>
              <div>
                <div className="pro-di-label">Lieu</div>
                <div className="pro-di-value">{e.lieu}</div>
              </div>
            </div>
          )}
        </div>

        {e.description && (
          <div className="pro-detail-content">
            {e.description.split("\n").map((p, i) => p && <p key={i}>{p}</p>)}
          </div>
        )}
      </div>
    </article>
  );
}
