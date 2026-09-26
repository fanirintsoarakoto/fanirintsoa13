import { NavLink } from "react-router-dom";

export default function Sidebar({ user, onLogout }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">Fanirintsoa</div>
      <nav className="sidebar-nav">
        <NavLink to="/" end>📊 Tableau de bord</NavLink>
        <NavLink to="/scanner">📱 Scanner</NavLink>
        <NavLink to="/students">👥 Élèves</NavLink>
        <NavLink to="/attendance">✅ Présence</NavLink>
        <NavLink to="/sessions">📅 Séances</NavLink>
        <div className="nav-divider"></div>
        <NavLink to="/notes">📝 Notes</NavLink>
        <NavLink to="/bulletin">📄 Bulletin</NavLink>
        <NavLink to="/parametres">⚙️ Paramètres notes</NavLink>
        <div className="nav-divider"></div>
        <NavLink to="/statistics">📈 Statistiques</NavLink>
        <NavLink to="/qr-batch">🖨 QR Codes</NavLink>
        <NavLink to="/import-excel">📥 Import Excel</NavLink>
        <NavLink to="/settings">⚙️ Réglages</NavLink>
      </nav>
      <div className="sidebar-footer">
        <div className="sidebar-user">{user?.username}</div>
        <button onClick={onLogout} className="sidebar-logout">Déconnexion</button>
      </div>
    </aside>
  );
}
