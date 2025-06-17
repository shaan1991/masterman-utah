// ===== src/hooks/useBrothers.js =====
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getBrothers, addBrother, updateBrother, subscribeToBrothers } from '../services/firestore';

export const useBrothers = () => {
  const { user } = useAuth();
  const [brothers, setBrothers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) {
      setBrothers([]);
      setLoading(false);
      return;
    }

    // Subscribe to real-time updates
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

  const addNewBrother = async (brotherData) => {
    if (!user) return { error: 'User not authenticated' };
    
    setError(null);
    const result = await addBrother(user.uid, brotherData);
    if (result.error) {
      setError(result.error);
    }
    return result;
  };

  const updateBrotherInfo = async (brotherId, updateData) => {
    if (!user) return { error: 'User not authenticated' };
    
    setError(null);
    const result = await updateBrother(user.uid, brotherId, updateData);
    if (result.error) {
      setError(result.error);
    }
    return result;
  };

  const getBrotherById = (brotherId) => {
    return brothers.find(brother => brother.id === brotherId);
  };

  const getOverdueBrothers = (days = 30) => {
    const threshold = new Date();
    threshold.setDate(threshold.getDate() - days);
    
    return brothers.filter(brother => 
      !brother.lastContact || 
      (brother.lastContact.seconds * 1000) < threshold.getTime()
    );
  };

  const getRecentContacts = (days = 7) => {
    const threshold = new Date();
    threshold.setDate(threshold.getDate() - days);
    
    return brothers.filter(brother => 
      brother.lastContact && 
      (brother.lastContact.seconds * 1000) >= threshold.getTime()
    );
  };

  return {
    brothers,
    loading,
    error,
    addNewBrother,
    updateBrotherInfo,
    getBrotherById,
    getOverdueBrothers,
    getRecentContacts
  };
};

