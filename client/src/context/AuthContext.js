// client/src/context/AuthContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Load user on initial render
 useEffect(() => {
    const loadUser = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const { data } = await authAPI.getMe();
          setUser(data);
        }
      } catch (err) {
        console.error('Failed to load user', err);
        localStorage.removeItem('token');
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, []);

  // Register user
  const register = async (userData) => {
    try {
      setError(null);
      const { data } = await authAPI.register(userData);
      localStorage.setItem('token', data.token);
      setUser(data.user);
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || 'Registration failed';
      setError(message);
      return { success: false, error: message };
    }
  };

  // Login user
  const login = async (email, password) => {
    try {
      setError(null);
      const { data } = await authAPI.login({ email, password });
      localStorage.setItem('token', data.token);
      setUser(data.user);
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed';
      setError(message);
      return { success: false, error: message };
    }
  };

  // Logout user
  const logout = async () => {
    try {
      await authAPI.logout();
      localStorage.removeItem('token');
      setUser(null);
      navigate('/login');
    } catch (err) {
      console.error('Logout failed', err);
    }
  };

  // Update user details
  const updateDetails = async (userData) => {
    try {
      const { data } = await authAPI.updateDetails(userData);
      setUser(data);
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to update profile';
      return { success: false, error: message };
    }
  };

  // Update password
  const updatePassword = async (currentPassword, newPassword) => {
    try {
      await authAPI.updatePassword({ currentPassword, newPassword });
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to update password';
      return { success: false, error: message };
    }
  };

  // Forgot password
  const forgotPassword = async (email) => {
    try {
      await authAPI.forgotPassword({ email });
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to send reset email';
      return { success: false, error: message };
    }
  };

  // Reset password
  const resetPassword = async (token, password) => {
    try {
      await authAPI.resetPassword(token, { password });
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to reset password';
      return { success: false, error: message };
    }
  };

  const value = {
    user,
    loading,
    error,
    register,
    login,
    logout,
    updateDetails,
    updatePassword,
    forgotPassword,
    resetPassword,
    isAuthenticated: !!user
  };

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};