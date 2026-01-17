import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import DataImport from './components/DataImport';
import Dashboard from './components/Dashboard'; // We'll create this next
import Navbar from './components/Navbar'; // We'll create this next
import './App.css';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));

  const handleLogin = (newToken) => {
    setToken(newToken);
    localStorage.setItem('token', newToken);
  };

  const handleLogout = () => {
    setToken(null);
    localStorage.removeItem('token');
  };

  return (
    <Router>
      <div className="app">
        {token && <Navbar onLogout={handleLogout} />}
        <div className="container">
          <Routes>
            <Route
              path="/"
              element={token ? <Navigate to="/dashboard" /> : <Navigate to="/login" />}
            />
            <Route
              path="/login"
              element={token ? <Navigate to="/dashboard" /> : <Login onLogin={handleLogin} />}
            />
            <Route
              path="/register"
              element={token ? <Navigate to="/dashboard" /> : <Register onRegister={handleLogin} />}
            />
            <Route
              path="/dashboard"
              element={token ? <Dashboard token={token} /> : <Navigate to="/login" />}
            />
            <Route
              path="/import"
              element={token ? <DataImport token={token} /> : <Navigate to="/login" />}
            />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;