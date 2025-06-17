// ===== src/hooks/useFirestore.js =====
import { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../services/firebase';

export const useFirestore = (collectionName, queryConstraints = []) => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let q = collection(db, collectionName);
    
    if (queryConstraints.length > 0) {
      q = query(q, ...queryConstraints);
    }

    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const docs = [];
        snapshot.forEach((doc) => {
          docs.push({ id: doc.id, ...doc.data() });
        });
        setDocuments(docs);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error('Firestore error:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [collectionName, JSON.stringify(queryConstraints)]);

  const addDocument = async (data) => {
    try {
      const docRef = await addDoc(collection(db, collectionName), {
        ...data,
        createdAt: serverTimestamp()
      });
      return { id: docRef.id, error: null };
    } catch (error) {
      return { id: null, error: error.message };
    }
  };

  const updateDocument = async (docId, data) => {
    try {
      await updateDoc(doc(db, collectionName, docId), {
        ...data,
        updatedAt: serverTimestamp()
      });
      return { error: null };
    } catch (error) {
      return { error: error.message };
    }
  };

  const deleteDocument = async (docId) => {
    try {
      await deleteDoc(doc(db, collectionName, docId));
      return { error: null };
    } catch (error) {
      return { error: error.message };
    }
  };

  return {
    documents,
    loading,
    error,
    addDocument,
    updateDocument,
    deleteDocument
  };
};

// Helper hook for subcollections
export const useSubcollection = (parentPath, subcollectionName, queryConstraints = []) => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!parentPath) {
      setDocuments([]);
      setLoading(false);
      return;
    }

    let q = collection(db, parentPath, subcollectionName);
    
    if (queryConstraints.length > 0) {
      q = query(q, ...queryConstraints);
    }

    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const docs = [];
        snapshot.forEach((doc) => {
          docs.push({ id: doc.id, ...doc.data() });
        });
        setDocuments(docs);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error('Subcollection error:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [parentPath, subcollectionName, JSON.stringify(queryConstraints)]);

  return { documents, loading, error };
};
