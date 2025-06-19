// src/components/announcements/Announcements.js
import React, { useState, useEffect } from 'react';
import { Plus, Filter, MessageSquare } from 'lucide-react';
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  doc, 
  serverTimestamp,
  arrayUnion,
  arrayRemove,
  increment
} from 'firebase/firestore';
import { useAuth } from '../../contexts/AuthContext'; // FIXED: Using consistent auth
import { auth, db } from '../../services/firebase';
import AnnouncementCard from './AnnouncementCard';
import AnnouncementForm from './AnnouncementForm';

const Announcements = () => {
  const { user } = useAuth(); // FIXED: Using AuthContext instead of useAuthState
  const [announcements, setAnnouncements] = useState([]);
  const [filter, setFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Real-time listener for announcements
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    console.log('Setting up announcements listener for user:', user.uid);

    const q = query(
      collection(db, 'announcements'),
      orderBy('timestamp', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      console.log('Announcements snapshot received:', snapshot.size, 'documents');
      const announcementData = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        announcementData.push({
          id: doc.id,
          ...data,
          timestamp: data.timestamp?.toDate() || new Date()
        });
      });
      setAnnouncements(announcementData);
      setLoading(false);
      setError(null);
    }, (error) => {
      console.error('Error fetching announcements:', error);
      setError(`Failed to load announcements: ${error.message}`);
      setLoading(false);
    });

    return unsubscribe;
  }, [user]);

  const filteredAnnouncements = announcements.filter(announcement => {
    if (filter === 'all') return true;
    return announcement.type === filter;
  });

  const filterOptions = [
    { value: 'all', label: 'All Updates' },
    { value: 'personal', label: 'Personal' },
    { value: 'achievement', label: 'Achievements' },
    { value: 'event', label: 'Events' }
  ];

  const handleSaveAnnouncement = async (announcementData) => {
    if (!user) {
      alert('You must be signed in to create announcements');
      return;
    }

    console.log('Creating announcement for user:', user.uid);
    console.log('Announcement data:', announcementData);

    try {
      // BULLETPROOF: Ensure all required fields are present
      const docData = {
        title: announcementData.title?.trim() || '',
        content: announcementData.content?.trim() || '',
        type: announcementData.type || 'personal',
        author: user.displayName || user.email || 'Anonymous',
        authorId: user.uid,
        timestamp: serverTimestamp(),
        likes: 0,
        comments: [],
        commentCount: 0,
        likedBy: []
      };

      // BULLETPROOF: Validate required fields
      if (!docData.title || !docData.content) {
        throw new Error('Title and content are required');
      }

      if (docData.content.length > 1000) {
        throw new Error('Content must be less than 1000 characters');
      }

      if (docData.title.length > 200) {
        throw new Error('Title must be less than 200 characters');
      }

      console.log('Adding document to Firestore:', docData);
      
      const docRef = await addDoc(collection(db, 'announcements'), docData);
      
      console.log('Document successfully created with ID:', docRef.id);
      setShowForm(false);
      setError(null);
      
    } catch (error) {
      console.error('Error saving announcement:', error);
      
      // BULLETPROOF: Detailed error handling
      let errorMessage = 'Failed to save announcement';
      
      if (error.code === 'permission-denied') {
        errorMessage = 'Permission denied. Please sign out and sign back in.';
      } else if (error.code === 'unauthenticated') {
        errorMessage = 'Authentication required. Please sign in again.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      alert(errorMessage);
    }
  };

  const handleLikeAnnouncement = async (announcementId, isCurrentlyLiked) => {
    if (!user) {
      alert('Please sign in to like announcements');
      return;
    }

    console.log('Toggling like for announcement:', announcementId, 'Currently liked:', isCurrentlyLiked);

    try {
      const announcementRef = doc(db, 'announcements', announcementId);
      
      if (isCurrentlyLiked) {
        // Remove like
        console.log('Removing like from announcement');
        await updateDoc(announcementRef, {
          likedBy: arrayRemove(user.uid),
          likes: increment(-1)
        });
      } else {
        // Add like
        console.log('Adding like to announcement');
        await updateDoc(announcementRef, {
          likedBy: arrayUnion(user.uid),
          likes: increment(1)
        });
      }
      
      console.log('Like toggle successful');
      setError(null);
      
    } catch (error) {
      console.error('Error updating like:', error);
      
      let errorMessage = 'Failed to update like';
      if (error.code === 'permission-denied') {
        errorMessage = 'Permission denied. Please sign out and sign back in.';
      }
      
      setError(errorMessage);
      alert(errorMessage);
    }
  };

  const handleAddComment = async (announcementId, commentText) => {
    if (!user) {
      alert('Please sign in to comment');
      return false;
    }

    if (!commentText?.trim()) {
      alert('Comment cannot be empty');
      return false;
    }

    if (commentText.trim().length > 500) {
      alert('Comment must be less than 500 characters');
      return false;
    }

    console.log('Adding comment to announcement:', announcementId);

    try {
      const comment = {
        id: `${Date.now()}_${user.uid}`, // Unique comment ID
        text: commentText.trim(),
        author: user.displayName || user.email || 'Anonymous',
        authorId: user.uid,
        timestamp: new Date()
      };

      const announcementRef = doc(db, 'announcements', announcementId);
      
      await updateDoc(announcementRef, {
        comments: arrayUnion(comment),
        commentCount: increment(1)
      });

      console.log('Comment added successfully');
      setError(null);
      return true;
      
    } catch (error) {
      console.error('Error adding comment:', error);
      
      let errorMessage = 'Failed to add comment';
      if (error.code === 'permission-denied') {
        errorMessage = 'Permission denied. Please sign out and sign back in.';
      }
      
      setError(errorMessage);
      alert(errorMessage);
      return false;
    }
  };

  const handleDeleteComment = async (announcementId, commentId) => {
    if (!user) {
      alert('Please sign in to delete comments');
      return;
    }

    console.log('Deleting comment:', commentId, 'from announcement:', announcementId);

    try {
      const announcement = announcements.find(a => a.id === announcementId);
      if (!announcement) {
        alert('Announcement not found');
        return;
      }

      const comment = announcement.comments?.find(c => c.id === commentId);
      if (!comment) {
        alert('Comment not found');
        return;
      }

      // BULLETPROOF: Authorization check
      if (comment.authorId !== user.uid && announcement.authorId !== user.uid) {
        alert('You can only delete your own comments or comments on your announcements');
        return;
      }

      const announcementRef = doc(db, 'announcements', announcementId);
      
      await updateDoc(announcementRef, {
        comments: arrayRemove(comment),
        commentCount: increment(-1)
      });

      console.log('Comment deleted successfully');
      setError(null);
      
    } catch (error) {
      console.error('Error deleting comment:', error);
      
      let errorMessage = 'Failed to delete comment';
      if (error.code === 'permission-denied') {
        errorMessage = 'Permission denied. Please sign out and sign back in.';
      }
      
      setError(errorMessage);
      alert(errorMessage);
    }
  };

  // BULLETPROOF: Handle authentication states
  if (!user) {
    return (
      <div className="text-center py-8 text-gray-500">
        <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-300" />
        <p>Please sign in to view and create announcements</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center py-8 text-gray-500">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-3"></div>
        <p>Loading announcements...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Error Banner */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
          <span className="block sm:inline">{error}</span>
          <button
            onClick={() => setError(null)}
            className="absolute top-0 bottom-0 right-0 px-4 py-3"
          >
            <span className="sr-only">Dismiss</span>
            ×
          </button>
        </div>
      )}

      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-800">Brotherhood Updates</h2>
        <button
          onClick={() => setShowForm(true)}
          className="bg-green-600 text-white p-2 rounded-full hover:bg-green-700 transition-colors"
          title="Create new announcement"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="flex items-center space-x-2 mb-3">
          <Filter className="w-4 h-4 text-gray-600" />
          <span className="text-sm font-medium text-gray-700">Filter Updates:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {filterOptions.map(option => (
            <button
              key={option.value}
              onClick={() => setFilter(option.value)}
              className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                filter === option.value 
                  ? 'bg-green-100 text-green-700 border-green-300'
                  : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Announcements Feed */}
      <div className="space-y-4">
        {filteredAnnouncements.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No updates found</p>
            <p className="text-sm mt-1">
              {filter === 'all' 
                ? 'Be the first to share with your brothers'
                : `No ${filter} updates found. Try a different filter.`
              }
            </p>
          </div>
        ) : (
          filteredAnnouncements.map(announcement => (
            <AnnouncementCard
              key={announcement.id}
              announcement={{
                ...announcement,
                isLiked: (announcement.likedBy || []).includes(user.uid)
              }}
              onLike={() => handleLikeAnnouncement(
                announcement.id, 
                (announcement.likedBy || []).includes(user.uid)
              )}
              onAddComment={(commentText) => handleAddComment(announcement.id, commentText)}
              onDeleteComment={(commentId) => handleDeleteComment(announcement.id, commentId)}
              currentUserId={user.uid}
            />
          ))
        )}
      </div>

      {/* Add Announcement Form Modal */}
      {showForm && (
        <AnnouncementForm
          onClose={() => setShowForm(false)}
          onSave={handleSaveAnnouncement}
        />
      )}
    </div>
  );
};

export default Announcements;