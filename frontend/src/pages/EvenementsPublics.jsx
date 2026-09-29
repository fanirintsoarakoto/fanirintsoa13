import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { API } from "../api";

const TYPE_ICONS = {
  examen: "📝", fete: "🎉", reunion: "👥",
  sport: "⚽", sortie: "🚌", autre: "📌",
};

export default function EvenementsPublics() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPast, setShowPast] = useState(false);

  useEffect(() => {
    setLoading(true);
    const url = showPast
      ? `${API}/public/evenements`
      : `${API}/public/evenements?upcoming=1`;
    fetch(url)
      .then(r => r.json())
      .then(d => setItems(Array.isArray(d) ? d : []))
      .finally(() => setLoading(false));
  }, [showPast]);

  return (
    <div className="pro-page">
      <div className="pro-page-header">
        <div>
          <h1>🎉 Tous les événements</h1>
          <p>{items.length} événement(s)</p>
        </div>
        <button
          className={`pro-btn ${showPast ? "pro-btn-warn" : "pro-btn-ghost"}`}
          onClick={() => setShowPast(!showPast)}
        >
          {showPast ? "⏰ Ho avy ihany" : "📜 Hampiseho ny lasa"}
        </button>
      </div>

      {loading ? (
        <div className="pro-loading">⏳ Chargement...</div>
      ) : items.length === 0 ? (
        <div className="pro-empty">
          <span>📭</span>
          <p>Tsy misy événement.</p>
        </div>
      ) : (
        <div className="pro-grid pro-grid-events">
          {items.map(e => {
            const dateStr = e.event_date || e.date_event;
            const d = dateStr ? new Date(dateStr) : null;
            const icon = TYPE_ICONS[e.type] || TYPE_ICONS.autre;
            return (
              <Link to={`/evenements/${e.id}`} key={e.id} className="pro-event-card">
                <div className="pro-event-date-badge">
                  {d && (<>
                    <span className="ped-day">{d.getDate()}</span>
                    <span className="ped-month">
                      {d.toLocaleDateString("fr-FR", { month: "short" }).toUpperCase()}
                    </span>
                  </>)}
                </div>
                <div className="pro-event-cover">
                  {e.image_url ? (
                    <img src={e.image_url} alt={e.titre} />
                  ) : (
                    <div className="pro-event-placeholder"><span>{icon}</span></div>
                  )}
                </div>
                <div className="pro-event-content">
                  <div className="pro-badges">
                    <span className="pro-badge pro-badge-secondary">🎉 Événement</span>
                  </div>
                  <h3 className="pro-card-title">{e.titre}</h3>
                  <div className="pro-event-info">
                    {d && <span>📅 {d.toLocaleDateString("fr-FR")}</span>}
                    {(e.event_time || e.heure) && <span>🕐 {e.event_time || e.heure}</span>}
                    {e.lieu && <span>📍 {e.lieu}</span>}
                  </div>
                  {e.description && (
                    <p className="pro-card-excerpt">{e.description.slice(0, 100)}...</p>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
