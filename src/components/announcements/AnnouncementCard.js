// ===== src/components/announcements/AnnouncementCard.js =====
import React, { useState } from 'react';
import { Heart, MessageCircle, Share, Pin, Calendar, Trophy, User } from 'lucide-react';
import { formatDate } from '../../utils/dateHelpers';

const AnnouncementCard = ({ announcement, onUpdate }) => {
  const [showComments, setShowComments] = useState(false);

  const getTypeIcon = (type) => {
    switch (type) {
      case 'personal': return <User className="w-4 h-4" />;
      case 'achievement': return <Trophy className="w-4 h-4" />;
      case 'event': return <Calendar className="w-4 h-4" />;
      default: return <MessageCircle className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'personal': return 'text-blue-600 bg-blue-100';
      case 'achievement': return 'text-yellow-600 bg-yellow-100';
      case 'event': return 'text-purple-600 bg-purple-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const handleLike = () => {
    const updatedAnnouncement = {
      ...announcement,
      isLiked: !announcement.isLiked,
      likes: announcement.isLiked ? announcement.likes - 1 : announcement.likes + 1
    };
    onUpdate(updatedAnnouncement);
  };

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      {announcement.isPinned && (
        <div className="bg-green-50 border-b border-green-200 px-4 py-2 flex items-center space-x-2">
          <Pin className="w-4 h-4 text-green-600" />
          <span className="text-sm text-green-700 font-medium">Pinned Announcement</span>
        </div>
      )}
      
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start space-x-3 mb-3">
          <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center">
            <span className="text-white font-semibold text-sm">
              {getInitials(announcement.author)}
            </span>
          </div>
          
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <h4 className="font-medium text-gray-800">{announcement.author}</h4>
              <div className={`p-1 rounded-full ${getTypeColor(announcement.type)}`}>
                {getTypeIcon(announcement.type)}
              </div>
            </div>
            <p className="text-sm text-gray-500">{formatDate(announcement.timestamp)}</p>
          </div>
        </div>

        {/* Content */}
        <div className="mb-4">
          {announcement.title && (
            <h3 className="font-semibold text-gray-800 mb-2">{announcement.title}</h3>
          )}
          <p className="text-gray-700 text-sm leading-relaxed">
            {announcement.content}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleLike}
              className={`flex items-center space-x-1 text-sm transition-colors ${
                announcement.isLiked 
                  ? 'text-red-600' 
                  : 'text-gray-500 hover:text-red-600'
              }`}
            >
              <Heart className={`w-4 h-4 ${announcement.isLiked ? 'fill-current' : ''}`} />
              <span>{announcement.likes}</span>
            </button>
            
            <button
              onClick={() => setShowComments(!showComments)}
              className="flex items-center space-x-1 text-sm text-gray-500 hover:text-blue-600 transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              <span>{announcement.comments}</span>
            </button>
            
            <button className="flex items-center space-x-1 text-sm text-gray-500 hover:text-green-600 transition-colors">
              <Share className="w-4 h-4" />
              <span>Share</span>
            </button>
          </div>
          
          <span className="text-xs text-gray-400">
            {announcement.type.charAt(0).toUpperCase() + announcement.type.slice(1)}
          </span>
        </div>

        {/* Comments Section */}
        {showComments && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="space-y-3">
              <div className="text-sm text-gray-500 text-center">
                Comments feature coming soon...
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnnouncementCard;