// ===== src/hooks/useDuaRequests.js =====
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  addDuaRequest, 
  subscribeToDuaRequests, 
  updateDoc, 
  doc 
} from '../services/firestore';
import { db } from '../services/firebase';

export const useDuaRequests = () => {
  const { user } = useAuth();
  const [duaRequests, setDuaRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Subscribe to real-time updates
    const unsubscribe = subscribeToDuaRequests((snapshot) => {
      const requests = [];
      snapshot.forEach((doc) => {
        requests.push({ id: doc.id, ...doc.data() });
      });
      setDuaRequests(requests);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const addNewDuaRequest = async (duaData) => {
    if (!user) return { error: 'User not authenticated' };
    
    setError(null);
    const requestData = {
      ...duaData,
      authorId: user.uid,
      authorName: duaData.anonymous ? null : user.displayName,
      authorEmail: duaData.anonymous ? null : user.email
    };
    
    const result = await addDuaRequest(requestData);
    if (result.error) {
      setError(result.error);
    }
    return result;
  };

  const respondToDua = async (duaId) => {
    if (!user) return { error: 'User not authenticated' };
    
    try {
      const duaRef = doc(db, 'duaRequests', duaId);
      const dua = duaRequests.find(d => d.id === duaId);
      
      await updateDoc(duaRef, {
        responses: (dua.responses || 0) + 1
      });
      
      return { error: null };
    } catch (error) {
      return { error: error.message };
    }
  };

  const markDuaAnswered = async (duaId, answeredNote = '') => {
    if (!user) return { error: 'User not authenticated' };
    
    try {
      const duaRef = doc(db, 'duaRequests', duaId);
      
      await updateDoc(duaRef, {
        answered: true,
        answeredAt: new Date(),
        answeredNote
      });
      
      return { error: null };
    } catch (error) {
      return { error: error.message };
    }
  };

  const getUrgentDuas = () => {
    return duaRequests.filter(dua => dua.urgent && !dua.answered);
  };

  const getMyDuas = () => {
    return duaRequests.filter(dua => dua.authorId === user?.uid);
  };

  const getAnsweredDuas = () => {
    return duaRequests.filter(dua => dua.answered);
  };

  return {
    duaRequests,
    loading,
    error,
    addNewDuaRequest,
    respondToDua,
    markDuaAnswered,
    getUrgentDuas,
    getMyDuas,
    getAnsweredDuas
  };
};
        responses: (dua.responses || 0) + 1
      });
      
      return { error: null };
    } catch (error) {
      return { error: error.message };
    }
  };

  const markDuaAnswered = async (duaId, answeredNote = '') => {
    if (!user) return { error: 'User not authenticated' };
    
    try {
      const duaRef = doc(db, 'duaRequests', duaId);
      
      await updateDoc(duaRef, {
        answered: true,
        answeredAt: new Date(),
        answeredNote
      });
      
      return { error: null };
    } catch (error) {
      return { error: error.message };
    }
  };

  const getUrgentDuas = () => {
    return duaRequests.filter(dua => dua.urgent && !dua.answered);
  };

  const getMyDuas = () => {
    return duaRequests.filter(dua => dua.authorId === user?.uid);
  };

  const getAnsweredDuas = () => {
    return duaRequests.filter(dua => dua.answered);
  };

  return {
    duaRequests,
    loading,
    error,
    addNewDuaRequest,
    respondToDua,
    markDuaAnswered,
    getUrgentDuas,
    getMyDuas,
    getAnsweredDuas
  };
};