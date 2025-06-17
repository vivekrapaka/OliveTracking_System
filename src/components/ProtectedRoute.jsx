import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>; // Or a more sophisticated loading spinner
  }

  if (!user) {
    // User is not authenticated, redirect to the login page
    return <Navigate to="/login" replace />;
  }

  return children;
};

