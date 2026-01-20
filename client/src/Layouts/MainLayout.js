// client/src/layouts/MainLayout.js
import React from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import '../App.css';

const MainLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="app-container">
      <nav className="sidebar">
        <div className="sidebar-header">
          <h2>EcoTrackAI</h2>
        </div>
        <ul className="sidebar-nav">
          <li>
            <Link to="/dashboard" className="nav-link">
              <i className="icon-dashboard"></i> Dashboard
            </Link>
          </li>
          <li>
            <Link to="/profile" className="nav-link">
              <i className="fas fa-user"></i> My Profile
            </Link>
          </li>
          <li>
            <Link to="/devices" className="nav-link">
              <i className="icon-devices"></i> My Devices
            </Link>
          </li>
          <li>
            <Link to="/consumption" className="nav-link">
              <i className="icon-consumption"></i> Consumption
            </Link>
          </li>
          <li>
            <Link to="/analytics" className="nav-link">
              <i className="icon-analytics"></i> Analytics
            </Link>
          </li>
          {user?.role === "admin" && (
            <li>
              <Link to="/admin" className="nav-link">
                <i className="icon-admin"></i> Admin Panel
              </Link>
            </li>
          )}
        </ul>
        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="user-details">
              <span className="user-name">{user?.name}</span>
              <span className="user-email">{user?.email}</span>
            </div>
          </div>
          <button onClick={handleLogout} className="btn btn-link logout-btn">
            <i className="icon-logout"></i> Logout
          </button>
        </div>
      </nav>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;
