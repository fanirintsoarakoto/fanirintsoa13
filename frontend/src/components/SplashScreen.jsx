import { useEffect, useState } from "react";

export default function SplashScreen({ onComplete }) {
  const [fade, setFade] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setFade(true), 1800);
    const t2 = setTimeout(() => onComplete(), 2400);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [onComplete]);

  return (
    <div className={`splash-screen ${fade ? "fade-out" : ""}`}>
      <div className="splash-bg">
        <div className="splash-circle c1"></div>
        <div className="splash-circle c2"></div>
        <div className="splash-circle c3"></div>
      </div>

      <div className="splash-content">
        <div className="splash-icon">
          <div className="splash-ring"></div>
          <div className="splash-logo">🎓</div>
        </div>

        <h1 className="splash-title">FANIRINTSOA</h1>
        <p className="splash-sub">Gestion des élèves</p>

        <div className="splash-loader">
          <div className="splash-dot"></div>
          <div className="splash-dot"></div>
          <div className="splash-dot"></div>
        </div>
      </div>
    </div>
  );
}
