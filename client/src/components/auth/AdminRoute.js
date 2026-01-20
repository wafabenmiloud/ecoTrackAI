// client/src/components/auth/AdminRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const AdminRoute = ({ children }) => {
  const { isAdmin, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>; // Or a loading spinner
  }

  if (!isAdmin) {
    return <Navigate to="/" />; // Or to an unauthorized page
  }

  return children;
};

export default AdminRoute;