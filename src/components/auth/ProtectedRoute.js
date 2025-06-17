// ===== src/components/auth/ProtectedRoute.js =====
import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../common/LoadingSpinner';
import AuthScreen from './AuthScreen';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <AuthScreen />;
  }

  return children;
};

export default ProtectedRoute;