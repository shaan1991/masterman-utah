// src/hooks/useBrothers.js - Fixed version with forced refresh
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  getBrothers, 
  addBrother, 
  updateBrother, 
  deleteBrother, 
  subscribeToBrothers 
} from '../services/firestore';

export const useBrothers = () => {
  const { user } = useAuth();
  const [brothers, setBrothers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Force refresh function
  const forceRefresh = () => {
    console.log('useBrothers: Force refresh triggered');
    setRefreshTrigger(prev => prev + 1);
  };

  useEffect(() => {
    if (!user) {
      setBrothers([]);
      setLoading(false);
      return;
    }

    console.log('useBrothers: Setting up subscription for user:', user.uid);
    setLoading(true);
    
    // Try both subscription and direct fetch
    const setupDataFetch = async () => {
      try {
        // First, get data directly
        const directResult = await getBrothers(user.uid);
        if (!directResult.error) {
          console.log('useBrothers: Direct fetch successful:', directResult.data.length, 'brothers');
          setBrothers(directResult.data);
          setLoading(false);
        }

        // Then set up real-time subscription
        const unsubscribe = subscribeToBrothers(user.uid, (snapshot) => {
          const brothersData = [];
          snapshot.forEach((doc) => {
            const data = doc.data();
            brothersData.push({ id: doc.id, ...data });
          });
          
          console.log('useBrothers: Real-time update received:', brothersData.length, 'brothers');
          
          // Log each brother for debugging
          brothersData.forEach((brother, index) => {
            console.log(`  Brother ${index + 1}:`, brother.name, brother.email, brother.phone);
          });
          
          setBrothers(brothersData);
          setLoading(false);
        });

        return unsubscribe;
      } catch (error) {
        console.error('useBrothers: Setup error:', error);
        setError(error.message);
        setLoading(false);
      }
    };

    const unsubscribe = setupDataFetch();
    
    return () => {
      if (unsubscribe && typeof unsubscribe.then === 'function') {
        unsubscribe.then(fn => fn && fn());
      } else if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, [user, refreshTrigger]);

  const addNewBrother = async (brotherData) => {
    if (!user) return { error: 'User not authenticated' };
    
    setError(null);
    console.log('useBrothers: Adding new brother:', brotherData);
    
    const result = await addBrother(user.uid, brotherData);
    if (result.error) {
      setError(result.error);
      console.error('useBrothers: Add brother error:', result.error);
    } else {
      console.log('useBrothers: Brother added successfully:', result.id);
      // Force refresh after a short delay to ensure Firestore is updated
      setTimeout(forceRefresh, 500);
    }
    return result;
  };

  const updateBrotherInfo = async (brotherId, updateData) => {
    if (!user) return { error: 'User not authenticated' };
    
    setError(null);
    console.log('useBrothers: Updating brother:', brotherId, 'with data:', updateData);
    
    const result = await updateBrother(user.uid, brotherId, updateData);
    if (result.error) {
      setError(result.error);
      console.error('useBrothers: Update brother error:', result.error);
    } else {
      console.log('useBrothers: Brother updated successfully');
      
      // Immediately update local state for instant UI feedback
      setBrothers(prevBrothers => 
        prevBrothers.map(brother => 
          brother.id === brotherId 
            ? { ...brother, ...updateData, updatedAt: new Date() }
            : brother
        )
      );
      
      // Also force refresh to get server data
      setTimeout(forceRefresh, 500);
    }
    return result;
  };

  const deleteBrotherInfo = async (brotherId) => {
    if (!user) return { error: 'User not authenticated' };
    
    setError(null);
    console.log('useBrothers: Deleting brother:', brotherId);
    
    const result = await deleteBrother(user.uid, brotherId);
    if (result.error) {
      setError(result.error);
      console.error('useBrothers: Delete brother error:', result.error);
    } else {
      console.log('useBrothers: Brother deleted successfully');
      
      // Immediately remove from local state
      setBrothers(prevBrothers => 
        prevBrothers.filter(brother => brother.id !== brotherId)
      );
      
      // Also force refresh
      setTimeout(forceRefresh, 500);
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
    deleteBrotherInfo,
    getBrotherById,
    getOverdueBrothers,
    getRecentContacts,
    forceRefresh
  };
};