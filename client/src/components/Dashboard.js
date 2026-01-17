// src/components/Dashboard.js
import React from 'react';
import { Link } from 'react-router-dom';
import './Dashboard.css';

function Dashboard({ token }) {
  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <Link to="/import" className="btn-primary">
          Import Data
        </Link>
      </div>
      <div className="dashboard-content">
        <div className="dashboard-card">
          <h3>Recent Activity</h3>
          <p>Your energy consumption data will appear here.</p>
        </div>
        <div className="dashboard-card">
          <h3>Quick Actions</h3>
          <Link to="/import" className="btn-secondary">
            Add Data Manually
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;