import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  addDoc,
  collection,
  updateDoc, 
  deleteDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../services/firebase';

export const useDuaRequests = () => {
  const { user } = useAuth();
  const [duaRequests, setDuaRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Subscribe to real-time updates
    const q = query(
      collection(db, 'duaRequests'),
      orderBy('createdAt', 'desc')
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const requests = [];
      snapshot.forEach((doc) => {
        requests.push({ id: doc.id, ...doc.data() });
      });
      setDuaRequests(requests);
      setLoading(false);
    }, (err) => {
      console.error('Error subscribing to dua requests:', err);
      setError(err.message);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const addNewDuaRequest = async (duaData) => {
    // Security: Validate user authentication
    if (!user?.uid) return { error: 'User not authenticated' };
    
    setError(null);
    
    try {
      // Security: Sanitize input data
      const sanitizedRequest = duaData.request?.trim()?.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
      
      if (!sanitizedRequest || sanitizedRequest.length < 10) {
        return { error: 'Dua request must be at least 10 characters long' };
      }

      if (sanitizedRequest.length > 500) {
        return { error: 'Dua request must be less than 500 characters' };
      }

      const requestData = {
        request: sanitizedRequest,
        urgent: Boolean(duaData.urgent),
        anonymous: Boolean(duaData.anonymous),
        // Security: Always use authenticated user's data
        authorId: user.uid,
        authorName: duaData.anonymous ? null : (user.displayName || 'Brother'),
        authorEmail: duaData.anonymous ? null : user.email,
        responses: [],
        responseCount: 0,
        answered: false,
        comments: 0,
        editCount: 0,
        createdAt: serverTimestamp()
      };
      
      const docRef = await addDoc(collection(db, 'duaRequests'), requestData);
      return { id: docRef.id, error: null };
    } catch (error) {
      console.error('Error adding dua request:', error);
      const errorMessage = error.code === 'permission-denied' 
        ? 'Permission denied. Please check your authentication.'
        : error.message;
      setError(errorMessage);
      return { error: errorMessage };
    }
  };

  const updateDuaRequest = async (duaId, updateData) => {
    // Security: Validate user authentication
    if (!user?.uid) return { error: 'User not authenticated' };
    
    // Security: Validate dua ownership
    const dua = duaRequests.find(d => d.id === duaId);
    if (!dua) return { error: 'Dua not found' };
    
    if (dua.authorId !== user.uid) {
      return { error: 'Permission denied. You can only edit your own duas.' };
    }

    // Security: Prevent editing answered duas (business logic)
    if (dua.answered && updateData.request) {
      return { error: 'Cannot edit answered dua requests' };
    }
    
    try {
      // Security: Sanitize input if updating request text
      if (updateData.request) {
        const sanitizedRequest = updateData.request?.trim()?.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
        
        if (!sanitizedRequest || sanitizedRequest.length < 10) {
          return { error: 'Dua request must be at least 10 characters long' };
        }

        if (sanitizedRequest.length > 500) {
          return { error: 'Dua request must be less than 500 characters' };
        }
        
        updateData.request = sanitizedRequest;
      }

      const duaRef = doc(db, 'duaRequests', duaId);
      const finalUpdateData = {
        ...updateData,
        editedAt: serverTimestamp(),
        editedBy: user.uid,
        editCount: (dua.editCount || 0) + 1
      };
      
      await updateDoc(duaRef, finalUpdateData);
      return { error: null };
    } catch (error) {
      console.error('Error updating dua request:', error);
      const errorMessage = error.code === 'permission-denied' 
        ? 'Permission denied. You can only edit your own duas.'
        : error.message;
      setError(errorMessage);
      return { error: errorMessage };
    }
  };

  const deleteDuaRequest = async (duaId) => {
    // Security: Validate user authentication
    if (!user?.uid) return { error: 'User not authenticated' };
    
    // Security: Validate dua ownership
    const dua = duaRequests.find(d => d.id === duaId);
    if (!dua) return { error: 'Dua not found' };
    
    if (dua.authorId !== user.uid) {
      return { error: 'Permission denied. You can only delete your own duas.' };
    }
    
    try {
      await deleteDoc(doc(db, 'duaRequests', duaId));
      return { error: null };
    } catch (error) {
      console.error('Error deleting dua request:', error);
      const errorMessage = error.code === 'permission-denied' 
        ? 'Permission denied. You can only delete your own duas.'
        : error.message;
      setError(errorMessage);
      return { error: errorMessage };
    }
  };

  const respondToDua = async (duaId) => {
    // Security: Validate user authentication
    if (!user?.uid) return { error: 'User not authenticated' };
    
    const dua = duaRequests.find(d => d.id === duaId);
    if (!dua) return { error: 'Dua not found' };
    
    // Security: Prevent duplicate responses
    if (dua.responses?.includes(user.uid)) {
      return { error: 'You have already responded to this dua' };
    }
    
    try {
      const duaRef = doc(db, 'duaRequests', duaId);
      await updateDoc(duaRef, {
        responses: [...(dua.responses || []), user.uid],
        responseCount: (dua.responseCount || 0) + 1
      });
      
      return { error: null };
    } catch (error) {
      console.error('Error responding to dua:', error);
      setError(error.message);
      return { error: error.message };
    }
  };

  const markDuaAnswered = async (duaId, answeredNote = '') => {
    // Security: Validate user authentication
    if (!user?.uid) return { error: 'User not authenticated' };
    
    // Security: Validate dua ownership
    const dua = duaRequests.find(d => d.id === duaId);
    if (!dua) return { error: 'Dua not found' };
    
    if (dua.authorId !== user.uid) {
      return { error: 'Permission denied. You can only mark your own duas as answered.' };
    }
    
    try {
      const duaRef = doc(db, 'duaRequests', duaId);
      await updateDoc(duaRef, {
        answered: true,
        answeredAt: serverTimestamp(),
        answeredNote: answeredNote || 'Alhamdulillah, this prayer has been answered.',
        answeredBy: user.uid
      });
      
      return { error: null };
    } catch (error) {
      console.error('Error marking dua as answered:', error);
      setError(error.message);
      return { error: error.message };
    }
  };

  // Helper functions for filtering
  const getUrgentDuas = () => {
    return duaRequests.filter(dua => dua.urgent && !dua.answered);
  };

  const getMyDuas = () => {
    return duaRequests.filter(dua => dua.authorId === user?.uid);
  };

  const getAnsweredDuas = () => {
    return duaRequests.filter(dua => dua.answered);
  };

  const getUnansweredDuas = () => {
    return duaRequests.filter(dua => !dua.answered);
  };

  // Security audit function for admin users (future use)
  const getDuaAuditInfo = (duaId) => {
    const dua = duaRequests.find(d => d.id === duaId);
    if (!dua) return null;
    
    return {
      id: dua.id,
      authorId: dua.authorId,
      createdAt: dua.createdAt,
      editCount: dua.editCount || 0,
      editedAt: dua.editedAt,
      editedBy: dua.editedBy,
      answeredBy: dua.answeredBy,
      responseCount: dua.responseCount || 0
    };
  };

  return {
    duaRequests,
    loading,
    error,
    addNewDuaRequest,
    updateDuaRequest,
    deleteDuaRequest,
    respondToDua,
    markDuaAnswered,
    getUrgentDuas,
    getMyDuas,
    getAnsweredDuas,
    getUnansweredDuas,
    getDuaAuditInfo
  };
};