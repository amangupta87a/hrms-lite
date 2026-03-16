import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Users, Calendar, LayoutDashboard, LogOut, Key, Menu, X } from 'lucide-react';

function Sidebar({ onLogout, onChangePassword, isOpen, onToggle }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    if (onLogout) onLogout();
    navigate('/login');
  };

  const handleNavClick = () => {
    if (window.innerWidth <= 768) onToggle();
  };

  return (
    <>
      {/* mobile header bar */}
      <header className="mobile-header">
        <button className="mobile-menu-btn" onClick={onToggle} aria-label="Toggle menu">
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
        <h1 className="mobile-title">HRMS Lite</h1>
        <div className="mobile-spacer"></div>
      </header>

      {/* overlay for mobile */}
      {isOpen && <div className="sidebar-overlay" onClick={onToggle}></div>}

      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h1 className="sidebar-logo">HRMS</h1>
          <span className="sidebar-subtitle">Lite</span>
        </div>

        <nav className="sidebar-nav">
          <NavLink to="/dashboard" className={({isActive}) => `sidebar-link ${isActive ? 'active' : ''}`} onClick={handleNavClick}>
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </NavLink>
          <NavLink to="/employees" className={({isActive}) => `sidebar-link ${isActive ? 'active' : ''}`} onClick={handleNavClick}>
            <Users size={20} />
            <span>Employees</span>
          </NavLink>
          <NavLink to="/attendance" className={({isActive}) => `sidebar-link ${isActive ? 'active' : ''}`} onClick={handleNavClick}>
            <Calendar size={20} />
            <span>Attendance</span>
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <button className="sidebar-btn" onClick={() => { onChangePassword(); handleNavClick(); }}>
            <Key size={18} />
            <span>Change Password</span>
          </button>
          <button className="sidebar-btn logout" onClick={handleLogout}>
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
