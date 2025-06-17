// ===== src/contexts/BrothersContext.js =====
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { subscribeToBrothers } from '../services/firestore';

const BrothersContext = createContext();

export const useBrothers = () => {
  const context = useContext(BrothersContext);
  if (!context) {
    throw new Error('useBrothers must be used within a BrothersProvider');
  }
  return context;
};

export const BrothersProvider = ({ children }) => {
  const { user } = useAuth();
  const [brothers, setBrothers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setBrothers([]);
      setLoading(false);
      return;
    }

    const unsubscribe = subscribeToBrothers(user.uid, (snapshot) => {
      const brothersData = [];
      snapshot.forEach((doc) => {
        brothersData.push({ id: doc.id, ...doc.data() });
      });
      setBrothers(brothersData);
      setLoading(false);
    });

    return unsubscribe;
  }, [user]);

  const value = {
    brothers,
    loading
  };

  return (
    <BrothersContext.Provider value={value}>
      {children}
    </BrothersContext.Provider>
  );
};