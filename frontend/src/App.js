import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Header as Sidebar } from './components';
import { Employees, Attendance, Login, Dashboard, ChangePassword } from './pages';

const STORAGE_KEY = 'hrms_auth';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showChangePass, setShowChangePass] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // check login state on mount
  useEffect(() => {
    const storedAuth = sessionStorage.getItem(STORAGE_KEY);
    if (storedAuth === 'true') setIsLoggedIn(true);
  }, []);

  const handleLogin = () => {
    setIsLoggedIn(true);
    sessionStorage.setItem(STORAGE_KEY, 'true');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    sessionStorage.removeItem(STORAGE_KEY);
  };

  // not logged in - show login page
  if (!isLoggedIn) {
    return (
      <Router>
        <div className="app">
          <Routes>
            <Route path="/login" element={<Login onLogin={handleLogin} />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </div>
      </Router>
    );
  }

  return (
    <Router>
      <div className="app-layout">
        <Sidebar 
          onLogout={handleLogout} 
          onChangePassword={() => setShowChangePass(true)}
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen(!sidebarOpen)}
        />
        <main className="main-content">
          <Routes>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/employees" element={<Employees />} />
            <Route path="/attendance" element={<Attendance />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
        <ChangePassword
          isOpen={showChangePass}
          onClose={() => setShowChangePass(false)}
        />
      </div>
    </Router>
  );
}

export default App;
