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
  where
} from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '../../services/firebase';
import AnnouncementCard from './AnnouncementCard';
import AnnouncementForm from './AnnouncementForm';

const Announcements = () => {
  const [user] = useAuthState(auth);
  const [announcements, setAnnouncements] = useState([]);
  const [filter, setFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  // Real-time listener for announcements
  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'announcements'),
      orderBy('timestamp', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
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
    }, (error) => {
      console.error('Error fetching announcements:', error);
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
    if (!user) return;

    try {
      await addDoc(collection(db, 'announcements'), {
        ...announcementData,
        author: user.displayName || user.email,
        authorId: user.uid,
        timestamp: serverTimestamp(),
        likes: 0,
        comments: 0,
        likedBy: []
      });
      setShowForm(false);
    } catch (error) {
      console.error('Error saving announcement:', error);
    }
  };

  const handleLikeAnnouncement = async (announcementId, isCurrentlyLiked) => {
    if (!user) return;

    try {
      const announcementRef = doc(db, 'announcements', announcementId);
      const announcement = announcements.find(a => a.id === announcementId);
      
      if (!announcement) return;

      const likedBy = announcement.likedBy || [];
      let newLikedBy, newLikes;

      if (isCurrentlyLiked) {
        // Remove like
        newLikedBy = likedBy.filter(uid => uid !== user.uid);
        newLikes = Math.max(0, (announcement.likes || 0) - 1);
      } else {
        // Add like
        newLikedBy = [...likedBy, user.uid];
        newLikes = (announcement.likes || 0) + 1;
      }

      await updateDoc(announcementRef, {
        likes: newLikes,
        likedBy: newLikedBy
      });
    } catch (error) {
      console.error('Error updating like:', error);
    }
  };

  if (!user) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>Please sign in to view announcements</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>Loading announcements...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-800">Brotherhood Updates</h2>
        <button
          onClick={() => setShowForm(true)}
          className="bg-green-600 text-white p-2 rounded-full hover:bg-green-700"
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
              className={`px-3 py-1 text-xs rounded-full border ${
                filter === option.value 
                  ? 'bg-green-100 text-green-700 border-green-300'
                  : 'bg-gray-50 text-gray-600 border-gray-200'
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
            <p className="text-sm mt-1">Be the first to share with your brothers</p>
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