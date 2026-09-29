import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { API } from "../api";

const TYPE_ICONS = {
  examen: "📝", fete: "🎉", reunion: "👥",
  sport: "⚽", sortie: "🚌", autre: "📌",
};

export default function EventsSection({ limit = 4, showAll = true }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/public/evenements?upcoming=1`)
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
          <span className="pro-section-icon">🎉</span>
          <div>
            <h2>Événements à venir</h2>
            <p>Ireo hetsika ho avy amin'ny établissement</p>
          </div>
        </div>
        {showAll && (
          <Link to="/evenements" className="pro-btn-ghost">
            Voir tous →
          </Link>
        )}
      </div>

      <div className="pro-grid pro-grid-events">
        {items.map(e => {
          const dateStr = e.event_date || e.date_event;
          const d = dateStr ? new Date(dateStr) : null;
          const icon = TYPE_ICONS[e.type] || TYPE_ICONS.autre;
          return (
            <Link to={`/evenements/${e.id}`} key={e.id} className="pro-event-card">
              <div className="pro-event-date-badge">
                {d && (
                  <>
                    <span className="ped-day">{d.getDate()}</span>
                    <span className="ped-month">
                      {d.toLocaleDateString("fr-FR", { month: "short" }).toUpperCase()}
                    </span>
                  </>
                )}
              </div>
              <div className="pro-event-cover">
                {e.image_url ? (
                  <img src={e.image_url} alt={e.titre} />
                ) : (
                  <div className="pro-event-placeholder">
                    <span>{icon}</span>
                  </div>
                )}
              </div>
              <div className="pro-event-content">
                <div className="pro-badges">
                  <span className="pro-badge pro-badge-secondary">🎉 Événement</span>
                  <span className="pro-badge pro-badge-type">{icon} {e.type}</span>
                </div>
                <h3 className="pro-card-title">{e.titre}</h3>
                <div className="pro-event-info">
                  {d && (
                    <span>📅 {d.toLocaleDateString("fr-FR", {
                      weekday: "long", day: "numeric", month: "long"
                    })}</span>
                  )}
                  {(e.event_time || e.heure) && (
                    <span>🕐 {e.event_time || e.heure}</span>
                  )}
                  {e.lieu && <span>📍 {e.lieu}</span>}
                </div>
                {e.description && (
                  <p className="pro-card-excerpt">
                    {e.description.slice(0, 90)}
                    {e.description.length > 90 ? "..." : ""}
                  </p>
                )}
                <span className="pro-card-cta">Voir détails →</span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
