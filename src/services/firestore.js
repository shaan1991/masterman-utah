// src/services/firestore.js - Clean version without syntax errors
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  getDoc,
  setDoc,
  query, 
  where, 
  orderBy, 
  onSnapshot,
  serverTimestamp
} from 'firebase/firestore';
import { db } from './firebase';

// Users collection operations
export const createUserProfile = async (userId, userData) => {
  try {
    await setDoc(doc(db, 'users', userId), {
      ...userData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }, { merge: true });
    return { error: null };
  } catch (error) {
    console.error('createUserProfile error:', error);
    return { error: error.message };
  }
};

export const getUserProfile = async (userId) => {
  try {
    const docRef = doc(db, 'users', userId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { data: { id: docSnap.id, ...docSnap.data() }, error: null };
    } else {
      return { data: null, error: 'User profile not found' };
    }
  } catch (error) {
    console.error('getUserProfile error:', error);
    return { data: null, error: error.message };
  }
};

// Brothers collection operations
export const addBrother = async (userId, brotherData) => {
  try {
    console.log('addBrother: Adding brother for user:', userId);
    const docRef = await addDoc(collection(db, 'users', userId, 'brothers'), {
      ...brotherData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    console.log('addBrother: Success, ID:', docRef.id);
    return { id: docRef.id, error: null };
  } catch (error) {
    console.error('addBrother error:', error);
    return { id: null, error: error.message };
  }
};

export const getBrothers = async (userId) => {
  try {
    console.log('getBrothers: Fetching brothers for user:', userId);
    const q = query(
      collection(db, 'users', userId, 'brothers'),
      orderBy('name', 'asc')
    );
    const querySnapshot = await getDocs(q);
    const brothers = [];
    querySnapshot.forEach((doc) => {
      brothers.push({ id: doc.id, ...doc.data() });
    });
    console.log('getBrothers: Found', brothers.length, 'brothers');
    return { data: brothers, error: null };
  } catch (error) {
    console.error('getBrothers error:', error);
    return { data: [], error: error.message };
  }
};

export const updateBrother = async (userId, brotherId, updateData) => {
  try {
    console.log('updateBrother: Updating brother', brotherId, 'for user', userId);
    console.log('updateBrother: Update data:', updateData);
    
    const docRef = doc(db, 'users', userId, 'brothers', brotherId);
    await updateDoc(docRef, {
      ...updateData,
      updatedAt: serverTimestamp()
    });
    
    console.log('updateBrother: Success');
    return { error: null };
  } catch (error) {
    console.error('updateBrother error:', error);
    return { error: error.message };
  }
};

export const deleteBrother = async (userId, brotherId) => {
  try {
    console.log('deleteBrother: Deleting brother', brotherId, 'for user', userId);
    
    const docRef = doc(db, 'users', userId, 'brothers', brotherId);
    await deleteDoc(docRef);
    
    console.log('deleteBrother: Success');
    return { error: null };
  } catch (error) {
    console.error('deleteBrother error:', error);
    return { error: error.message };
  }
};

// Interactions collection operations
export const logInteraction = async (userId, interactionData) => {
  try {
    console.log('logInteraction: Adding interaction for user:', userId);
    console.log('logInteraction: Data:', interactionData);
    
    const docRef = await addDoc(collection(db, 'users', userId, 'interactions'), {
      ...interactionData,
      timestamp: serverTimestamp()
    });
    
    console.log('logInteraction: Success, ID:', docRef.id);
    return { id: docRef.id, error: null };
  } catch (error) {
    console.error('logInteraction error:', error);
    return { id: null, error: error.message };
  }
};

export const updateInteraction = async (userId, interactionId, updateData) => {
  try {
    console.log('updateInteraction: Updating interaction', interactionId);
    await updateDoc(doc(db, 'users', userId, 'interactions', interactionId), {
      ...updateData,
      updatedAt: serverTimestamp()
    });
    console.log('updateInteraction: Success');
    return { error: null };
  } catch (error) {
    console.error('updateInteraction error:', error);
    return { error: error.message };
  }
};

export const deleteInteraction = async (userId, interactionId) => {
  try {
    console.log('deleteInteraction: Deleting interaction', interactionId);
    await deleteDoc(doc(db, 'users', userId, 'interactions', interactionId));
    console.log('deleteInteraction: Success');
    return { error: null };
  } catch (error) {
    console.error('deleteInteraction error:', error);
    return { error: error.message };
  }
};

export const getInteractions = async (userId, brotherId) => {
  try {
    console.log('getInteractions: Fetching interactions for brother:', brotherId);
    // Simplified query without orderBy to avoid index requirement
    const q = query(
      collection(db, 'users', userId, 'interactions'),
      where('brotherId', '==', brotherId)
    );
    const snapshot = await getDocs(q);
    const interactions = [];
    snapshot.forEach(doc => {
      interactions.push({ id: doc.id, ...doc.data() });
    });
    
    // Sort in JavaScript instead of Firestore
    interactions.sort((a, b) => {
      const aTime = a.timestamp?.seconds ? new Date(a.timestamp.seconds * 1000) : new Date(a.timestamp);
      const bTime = b.timestamp?.seconds ? new Date(b.timestamp.seconds * 1000) : new Date(b.timestamp);
      return bTime - aTime; // Descending order (newest first)
    });
    
    console.log('getInteractions: Found', interactions.length, 'interactions');
    return { data: interactions, error: null };
  } catch (error) {
    console.error('getInteractions error:', error);
    return { data: [], error: error.message };
  }
};

// Real-time listeners with better error handling
export const subscribeToBrothers = (userId, callback) => {
  console.log('subscribeToBrothers: Setting up subscription for user:', userId);
  
  const q = query(
    collection(db, 'users', userId, 'brothers'),
    orderBy('name', 'asc')
  );
  
  return onSnapshot(q, 
    (snapshot) => {
      console.log('subscribeToBrothers: Received snapshot with', snapshot.docs.length, 'documents');
      
      // Log individual documents for debugging
      snapshot.docs.forEach((doc, index) => {
        console.log(`  Brother ${index + 1}:`, doc.id, doc.data());
      });
      
      callback(snapshot);
    },
    (error) => {
      console.error('subscribeToBrothers: Subscription error:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
    }
  );
};

export const subscribeToInteractions = (userId, brotherId, callback) => {
  console.log('subscribeToInteractions: Setting up subscription for brother:', brotherId);
  
  // Simplified query without orderBy to avoid index requirement
  const q = query(
    collection(db, 'users', userId, 'interactions'),
    where('brotherId', '==', brotherId)
  );
  
  return onSnapshot(q, 
    (snapshot) => {
      console.log('subscribeToInteractions: Received snapshot with', snapshot.docs.length, 'documents');
      
      // Sort the results in JavaScript
      const interactions = [];
      snapshot.forEach(doc => {
        interactions.push({ id: doc.id, ...doc.data() });
      });
      
      interactions.sort((a, b) => {
        const aTime = a.timestamp?.seconds ? new Date(a.timestamp.seconds * 1000) : new Date(a.timestamp);
        const bTime = b.timestamp?.seconds ? new Date(b.timestamp.seconds * 1000) : new Date(b.timestamp);
        return bTime - aTime; // Descending order (newest first)
      });
      
      // Create a mock snapshot-like object
      const mockSnapshot = {
        docs: interactions.map(interaction => ({
          id: interaction.id,
          data: () => {
            const { id, ...data } = interaction;
            return data;
          }
        })),
        forEach: (callback) => {
          interactions.forEach((interaction, index) => {
            callback({
              id: interaction.id,
              data: () => {
                const { id, ...data } = interaction;
                return data;
              }
            });
          });
        }
      };
      
      callback(mockSnapshot);
    },
    (error) => {
      console.error('subscribeToInteractions: Subscription error:', error);
    }
  );
};

// Dua requests (if you still need these)
export const addDuaRequest = async (duaData) => {
  try {
    const docRef = await addDoc(collection(db, 'duaRequests'), {
      ...duaData,
      createdAt: serverTimestamp(),
      responses: 0,
      answered: false
    });
    return { id: docRef.id, error: null };
  } catch (error) {
    console.error('addDuaRequest error:', error);
    return { id: null, error: error.message };
  }
};

export const getDuaRequests = () => {
  return query(
    collection(db, 'duaRequests'),
    orderBy('createdAt', 'desc')
  );
};

export const subscribeToDuaRequests = (callback) => {
  const q = query(
    collection(db, 'duaRequests'),
    orderBy('createdAt', 'desc')
  );
  return onSnapshot(q, callback);
};