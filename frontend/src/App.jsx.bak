import { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import ParametresNotes from "./pages/ParametresNotes";
import "./App.css";
import Sidebar from "./components/Sidebar";
import Toast from "./components/Toast";
import QRBatch from "./components/QRBatch";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Students from "./pages/Students";
import StudentDetail from "./pages/StudentDetail";
import Attendance from "./pages/Attendance";
import Scanner from "./pages/Scanner";
import Sessions from "./pages/Sessions";
import Statistics from "./pages/Statistics";
import ImportExcel from "./pages/ImportExcel";
import Settings from "./pages/Settings";
import Notes from "./pages/Notes";
import Bulletin from "./pages/Bulletin";
import Parametres from "./pages/Parametres";
import EmploiTemps from "./pages/EmploiTemps";
import Paiements from "./pages/Paiements";
import Messages from "./pages/Messages";
import Utilisateurs from "./pages/Utilisateurs";
import Notifications from "./pages/Notifications";
import ParametresEtab from "./pages/ParametresEtab";
import Filieres from "./pages/Filieres";
import RechercheAvancee from "./pages/RechercheAvancee";
import SituationFinanciere from "./pages/SituationFinanciere";
import Absents from "./pages/Absents";
import Historique from "./pages/Historique";
import ParametresPresence from "./pages/ParametresPresence";
import Profile from "./pages/Profile";
import Logs from "./pages/Logs";
import AnnoncesPubliques from "./pages/AnnoncesPubliques";
import EvenementsPublics from "./pages/EvenementsPublics";
import AnnonceDetail from "./pages/AnnonceDetail";
import EvenementDetail from "./pages/EvenementDetail";
import AdminPublications from "./pages/AdminPublications";
import { apiFetch } from "./api";

function Guard({ perm, user, children }) {
  const perms = user?.permissions || [];
  if (perm && !perms.includes(perm)) {
    return <div className="empty">🚫 Tsy manana alalana ianao</div>;
  }
  return children;
}

export default function App() {
  const [user, setUser] = useState(() => {
    const u = localStorage.getItem("user");
    return u ? JSON.parse(u) : null;
  });
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  function showToast(msg, type = "success") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { setLoading(false); return; }
    apiFetch("/auth/me")
      .then((u) => setUser(u))
      .catch(() => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  function handleAuth(token, u, permissions) {
    const userWithPerms = { ...u, permissions: permissions || [] };
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userWithPerms));
    setUser(userWithPerms);
    showToast(`Tongasoa, ${u.username}! 🎉`);
  }

  function handleLogout() {
    apiFetch("/auth/logout", { method: "POST" }).catch(() => {});
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  }

  if (loading) return <div className="loading-screen">⏳ Chargement...</div>;
  if (!user) return <><Login onAuth={handleAuth} /><Toast toast={toast} /></>;

  return (
    <div className="app-layout">
      <Sidebar user={user} onLogout={handleLogout} />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/scanner" element={<Scanner toast={showToast} />} />
          <Route path="/students" element={<Students toast={showToast} />} />
          <Route path="/students/:id" element={<StudentDetail toast={showToast} />} />
          <Route path="/attendance" element={<Attendance toast={showToast} />} />
          <Route path="/sessions" element={<Sessions toast={showToast} />} />
          <Route path="/notes" element={<Notes toast={showToast} />} />
          <Route path="/bulletin" element={<Bulletin />} />
          <Route path="/parametres" element={<Parametres toast={showToast} />} />
          <Route path="/emploi-temps" element={<EmploiTemps toast={showToast} />} />
          <Route path="/paiements" element={<Paiements toast={showToast} />} />
          <Route path="/messages" element={<Messages toast={showToast} user={user} />} />
          <Route path="/notifications" element={<Notifications toast={showToast} />} />
          <Route path="/parametres-etab" element={<ParametresEtab toast={showToast} />} />
          <Route path="/filieres" element={<Filieres toast={showToast} />} />
          <Route path="/recherche" element={<RechercheAvancee />} />
          <Route path="/situation" element={<SituationFinanciere />} />
          <Route path="/absents" element={<Absents toast={showToast} />} />
          <Route path="/historique" element={<Historique />} />
          <Route path="/parametres-presence" element={<ParametresPresence toast={showToast} />} />
          <Route path="/profile" element={<Profile toast={showToast} onUpdate={setUser} />} />
          <Route path="/statistics" element={<Statistics />} />
          <Route path="/qr-batch" element={<QRBatch />} />
        <Route path="/parametres-notes" element={
  <Guard perm="settings.manage" user={user}>
    <ParametresNotes toast={showToast} />
  </Guard>
} />  

	<Route path="/import-excel" element={<ImportExcel toast={showToast} />} />
          <Route path="/settings" element={<Settings toast={showToast} />} />

          {/* === PUBLICATIONS PUBLIQUES === */}
          <Route path="/annonces" element={<AnnoncesPubliques />} />
          <Route path="/annonces/:id" element={<AnnonceDetail />} />
          <Route path="/evenements" element={<EvenementsPublics />} />
          <Route path="/evenements/:id" element={<EvenementDetail />} />

          {/* === ADMIN PUBLICATION === */}
          <Route path="/admin/publications" element={
            <Guard perm="settings.manage" user={user}>
              <AdminPublications toast={showToast} />
            </Guard>
          } />

          {/* === GUARDS === */}
          <Route path="/utilisateurs" element={
            <Guard perm="users.view" user={user}>
              <Utilisateurs toast={showToast} />
            </Guard>
          } />
          <Route path="/logs" element={
            <Guard perm="logs.view" user={user}>
              <Logs />
            </Guard>
          } />

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
      <Toast toast={toast} />
    </div>
  );
}
