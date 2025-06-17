// ===== src/components/announcements/Announcements.js =====
import React, { useState } from 'react';
import { Plus, Filter, MessageSquare } from 'lucide-react';
import AnnouncementCard from './AnnouncementCard';

const Announcements = () => {
  const [announcements, setAnnouncements] = useState([
    {
      id: '1',
      author: 'Ahmed Hassan',
      authorId: 'user1',
      title: 'Family Update',
      content: 'Alhamdulillah, my wife and I are expecting our first child! Please keep us in your duas.',
      type: 'personal',
      timestamp: new Date('2025-06-16T10:30:00'),
      likes: 15,
      comments: 8,
      isLiked: false
    },
    {
      id: '2',
      author: 'Omar Abdullah',
      authorId: 'user2',
      title: 'Job Promotion',
      content: 'SubhanAllah, I got the promotion I was interviewing for! Thank you all for your duas and support.',
      type: 'achievement',
      timestamp: new Date('2025-06-15T16:45:00'),
      likes: 22,
      comments: 12,
      isLiked: true
    },
    {
      id: '3',
      author: 'Brotherhood Admin',
      authorId: 'admin',
      title: 'Monthly Gathering',
      content: 'Assalamu alaikum brothers! Our next in-person gathering is scheduled for Saturday, June 28th at Masjid Al-Noor after Maghrib prayer. Looking forward to seeing everyone!',
      type: 'event',
      timestamp: new Date('2025-06-14T09:00:00'),
      likes: 8,
      comments: 5,
      isLiked: false,
      isPinned: true
    }
  ]);

  const [filter, setFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);

  const filteredAnnouncements = announcements.filter(announcement => {
    if (filter === 'all') return true;
    return announcement.type === filter;
  }).sort((a, b) => {
    // Pinned posts first, then by timestamp
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return new Date(b.timestamp) - new Date(a.timestamp);
  });

  const filterOptions = [
    { value: 'all', label: 'All Updates' },
    { value: 'personal', label: 'Personal' },
    { value: 'achievement', label: 'Achievements' },
    { value: 'event', label: 'Events' }
  ];

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
              announcement={announcement}
              onUpdate={(updatedAnnouncement) => {
                setAnnouncements(announcements.map(a => 
                  a.id === updatedAnnouncement.id ? updatedAnnouncement : a
                ));
              }}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default Announcements;