import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { API } from "../api";

export default function AnnoncesPubliques() {
  const [items, setItems] = useState([]);
  const [filterCat, setFilterCat] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const url = filterCat
      ? `${API}/public/annonces?categorie=${filterCat}`
      : `${API}/public/annonces`;
    fetch(url)
      .then(r => r.json())
      .then(d => setItems(Array.isArray(d) ? d : []))
      .finally(() => setLoading(false));
  }, [filterCat]);

  const cats = [...new Set(items.map(a => a.categorie).filter(c => c && c !== "general"))];

  return (
    <div className="pro-page">
      <div className="pro-page-header">
        <div>
          <h1>📢 Toutes les annonces</h1>
          <p>{items.length} publication(s)</p>
        </div>
      </div>

      {cats.length > 0 && (
        <div className="pro-filters">
          <button className={filterCat === "" ? "active" : ""}
            onClick={() => setFilterCat("")}>Rehetra</button>
          {cats.map(c => (
            <button key={c} className={filterCat === c ? "active" : ""}
              onClick={() => setFilterCat(c)}>{c}</button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="pro-loading">⏳ Chargement...</div>
      ) : items.length === 0 ? (
        <div className="pro-empty">
          <span>📭</span>
          <p>Tsy misy annonce amin'izao fotoana izao.</p>
        </div>
      ) : (
        <div className="pro-grid">
          {items.map(a => (
            <Link to={`/annonces/${a.id}`} key={a.id} className="pro-annonce-card">
              <div className="pro-card-cover">
                {a.image_url ? (
                  <img src={a.image_url} alt={a.titre} />
                ) : (
                  <div className="pro-card-placeholder"><span>📢</span></div>
                )}
                <div className="pro-badges">
                  <span className="pro-badge pro-badge-primary">📢 Annonce</span>
                </div>
              </div>
              <div className="pro-card-content">
                <div className="pro-card-meta">
                  <span className="pro-date">
                    {a.published_at ? new Date(a.published_at).toLocaleDateString("fr-FR") : ""}
                  </span>
                  {a.categorie && <span className="pro-cat">{a.categorie}</span>}
                </div>
                <h3 className="pro-card-title">{a.titre}</h3>
                <p className="pro-card-excerpt">{a.contenu?.slice(0, 140)}...</p>
                <span className="pro-card-cta">Lire la suite →</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
