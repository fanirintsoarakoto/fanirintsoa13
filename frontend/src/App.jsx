import { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
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
import { apiFetch } from "./api";

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

  function handleAuth(token, u) {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(u));
    setUser(u);
    showToast("Tongasoa! 🎉");
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
          <Route path="/statistics" element={<Statistics />} />
          <Route path="/qr-batch" element={<QRBatch />} />
          <Route path="/import-excel" element={<ImportExcel toast={showToast} />} />
          <Route path="/settings" element={<Settings toast={showToast} />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
      <Toast toast={toast} />
    </div>
  );
}
