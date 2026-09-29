import { NavLink } from "react-router-dom";

export default function Sidebar({ user, onLogout }) {
  const role = user?.role || "admin";
  const perms = user?.permissions || [];
  const has = (p) => perms.includes(p);

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">Fanirintsoa</div>

      <nav className="sidebar-nav">
        {/* ==================== DASHBOARD ==================== */}
        <NavLink to="/" end>📊 Dashboard</NavLink>
        <NavLink to="/notifications">🔔 Notifications</NavLink>

        {/* ==================== PRÉSENCE & SCAN ==================== */}
        {has("attendance.scan") && (
          <>
            <NavLink to="/scanner">📱 Scanner</NavLink>
            <NavLink to="/absents">❌ Absents</NavLink>
            <NavLink to="/historique">📜 Historique</NavLink>
          </>
        )}

        <div className="nav-divider"></div>

        {/* ==================== ÉLÈVES ==================== */}
        {has("students.view") && (
          <>
            <NavLink to="/students">👥 Élèves</NavLink>
            <NavLink to="/recherche">🔍 Recherche</NavLink>
          </>
        )}

        {has("attendance.view") && (
          <NavLink to="/attendance">✅ Présence</NavLink>
        )}

        {has("schedules.view") && (
          <NavLink to="/emploi-temps">📅 Emploi du temps</NavLink>
        )}

        {/* ==================== NOTES & BULLETIN ==================== */}
        {(role === "admin" || role === "enseignant") && (
          <>
            <div className="nav-divider"></div>
            <NavLink to="/notes">📝 Notes</NavLink>
            <NavLink to="/bulletin">📄 Bulletin</NavLink>
          </>
        )}

        <div className="nav-divider"></div>

        {/* ==================== PUBLICATIONS PUBLIQUES ==================== */}
        <NavLink to="/annonces">📢 Annonces</NavLink>
        <NavLink to="/evenements">🎉 Événements</NavLink>
        <NavLink to="/messages">💬 Messages</NavLink>

        {/* ==================== PAIEMENTS ==================== */}
        {(role === "admin" || role === "comptable") && (
          <>
            <div className="nav-divider"></div>
            <NavLink to="/paiements">💰 Paiements</NavLink>
            <NavLink to="/situation">💼 Situation financière</NavLink>
          </>
        )}

        {/* ==================== STATISTIQUES ==================== */}
        {has("statistics.view") && (
          <NavLink to="/statistics">📈 Statistiques</NavLink>
        )}

        {/* ==================== ADMINISTRATION ==================== */}
        {role === "admin" && (
          <>
            <div className="nav-divider"></div>
            <NavLink to="/admin/publications">📢 Publier annonces</NavLink>
            <NavLink to="/utilisateurs">👤 Utilisateurs</NavLink>
            <NavLink to="/filieres">🏫 Filières & Frais</NavLink>
            <NavLink to="/parametres-notes">📝 Configuration notes</NavLink>
            <NavLink to="/parametres-presence">⚙️ Paramètres présence</NavLink>
            <NavLink to="/parametres-etab">🏢 Établissement</NavLink>
            <NavLink to="/logs">📋 Journal d'activité</NavLink>
            <NavLink to="/qr-batch">🖨 QR Codes</NavLink>
            <NavLink to="/import-excel">📥 Import Excel</NavLink>
          </>
        )}

        {/* ==================== PROFIL ==================== */}
        <div className="nav-divider"></div>
        <NavLink to="/profile">👤 Mon profil</NavLink>
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user">
          {user?.prenom || user?.username}
          <small>({role})</small>
        </div>
        <button onClick={onLogout} className="sidebar-logout">Déconnexion</button>
      </div>
    </aside>
  );
}
