// src/contexts/AuthContext.js - BULLETPROOF VERSION WITH LOGOUT
import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChange, signOut as authSignOut } from '../services/auth';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log('AuthProvider: Setting up auth state listener');
    
    const unsubscribe = onAuthStateChange((user) => {
      console.log('AuthProvider: Auth state changed:', user ? 'User signed in' : 'User signed out');
      setUser(user);
      setLoading(false);
      setError(null);
    });

    return () => {
      console.log('AuthProvider: Cleaning up auth listener');
      unsubscribe();
    };
  }, []);

  // BULLETPROOF LOGOUT FUNCTION
  const signOut = async () => {
    console.log('AuthProvider: Starting logout process');
    setError(null);
    
    try {
      // Clear any local storage
      console.log('AuthProvider: Clearing local storage');
      localStorage.removeItem('brotherhood_onboarding_completed');
      localStorage.removeItem('brotherhood_user_preferences');
      
      // Sign out from Firebase
      console.log('AuthProvider: Signing out from Firebase');
      const result = await authSignOut();
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      // Force clear user state
      console.log('AuthProvider: Clearing user state');
      setUser(null);
      
      // Reload page to ensure clean state
      console.log('AuthProvider: Logout successful, reloading page');
      window.location.reload();
      
      return { success: true, error: null };
      
    } catch (error) {
      console.error('AuthProvider: Logout error:', error);
      setError(error.message);
      
      // Even if there's an error, try to clear state
      setUser(null);
      localStorage.clear();
      window.location.reload();
      
      return { success: false, error: error.message };
    }
  };

  const value = {
    user,
    loading,
    error,
    signOut
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};