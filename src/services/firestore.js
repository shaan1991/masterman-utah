// ===== Updated src/services/firestore.js =====
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
    return { data: null, error: error.message };
  }
};

// Brothers collection operations
export const addBrother = async (userId, brotherData) => {
  try {
    const docRef = await addDoc(collection(db, 'users', userId, 'brothers'), {
      ...brotherData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return { id: docRef.id, error: null };
  } catch (error) {
    return { id: null, error: error.message };
  }
};

export const getBrothers = async (userId) => {
  try {
    const q = query(
      collection(db, 'users', userId, 'brothers'),
      orderBy('name', 'asc')
    );
    const querySnapshot = await getDocs(q);
    const brothers = [];
    querySnapshot.forEach((doc) => {
      brothers.push({ id: doc.id, ...doc.data() });
    });
    return { data: brothers, error: null };
  } catch (error) {
    return { data: [], error: error.message };
  }
};

export const updateBrother = async (userId, brotherId, updateData) => {
  try {
    await updateDoc(doc(db, 'users', userId, 'brothers', brotherId), {
      ...updateData,
      updatedAt: serverTimestamp()
    });
    return { error: null };
  } catch (error) {
    return { error: error.message };
  }
};

// Interactions collection operations
export const logInteraction = async (userId, interactionData) => {
  try {
    const docRef = await addDoc(collection(db, 'users', userId, 'interactions'), {
      ...interactionData,
      timestamp: serverTimestamp()
    });
    return { id: docRef.id, error: null };
  } catch (error) {
    return { id: null, error: error.message };
  }
};

// Dua requests collection operations (shared)
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
    return { id: null, error: error.message };
  }
};

export const getDuaRequests = () => {
  return query(
    collection(db, 'duaRequests'),
    orderBy('createdAt', 'desc')
  );
};

// Real-time listeners
export const subscribeToBrothers = (userId, callback) => {
  const q = query(
    collection(db, 'users', userId, 'brothers'),
    orderBy('name', 'asc')
  );
  return onSnapshot(q, callback);
};

export const subscribeToDuaRequests = (callback) => {
  const q = query(
    collection(db, 'duaRequests'),
    orderBy('createdAt', 'desc')
  );
  return onSnapshot(q, callback);
};