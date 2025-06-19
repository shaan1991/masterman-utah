// src/components/announcements/AnnouncementCard.js
import React, { useState } from 'react';
import { Heart, MessageCircle, Share, Calendar, Trophy, User, Send, Trash2 } from 'lucide-react';
import { formatDate } from '../../utils/dateHelpers';

const AnnouncementCard = ({ 
  announcement, 
  onLike, 
  onAddComment,
  onDeleteComment,
  currentUserId 
}) => {
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

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

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || isSubmittingComment) return;

    setIsSubmittingComment(true);
    try {
      const success = await onAddComment(newComment);
      if (success) {
        setNewComment('');
      }
    } catch (error) {
      console.error('Error submitting comment:', error);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      await onDeleteComment(commentId);
    }
  };

  const formatCommentDate = (timestamp) => {
    if (!timestamp) return '';
    
    const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  // Sort comments by timestamp (newest first)
  const sortedComments = (announcement.comments || []).sort((a, b) => {
    const dateA = a.timestamp instanceof Date ? a.timestamp : new Date(a.timestamp);
    const dateB = b.timestamp instanceof Date ? b.timestamp : new Date(b.timestamp);
    return dateB - dateA;
  });

  return (
    <div className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
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
          <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
            {announcement.content}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center space-x-4">
            <button
              onClick={onLike}
              className={`flex items-center space-x-1 text-sm transition-colors hover:scale-105 ${
                announcement.isLiked 
                  ? 'text-red-600' 
                  : 'text-gray-500 hover:text-red-600'
              }`}
            >
              <Heart className={`w-4 h-4 ${announcement.isLiked ? 'fill-current' : ''}`} />
              <span>{announcement.likes || 0}</span>
            </button>
            
            <button
              onClick={() => setShowComments(!showComments)}
              className={`flex items-center space-x-1 text-sm transition-colors hover:scale-105 ${
                showComments 
                  ? 'text-blue-600' 
                  : 'text-gray-500 hover:text-blue-600'
              }`}
            >
              <MessageCircle className="w-4 h-4" />
              <span>{announcement.commentCount || 0}</span>
            </button>
            
            <button className="flex items-center space-x-1 text-sm text-gray-500 hover:text-green-600 transition-colors hover:scale-105">
              <Share className="w-4 h-4" />
              <span>Share</span>
            </button>
          </div>
          
          <span className="text-xs text-gray-400 capitalize">
            {announcement.type}
          </span>
        </div>

        {/* Comments Section */}
        {showComments && (
          <div className="mt-4 pt-4 border-t border-gray-100 space-y-4">
            {/* Comment Input */}
            <form onSubmit={handleCommentSubmit} className="flex space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white font-semibold text-xs">
                  {getInitials(currentUserId)}
                </span>
              </div>
              <div className="flex-1 flex space-x-2">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Write a comment..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isSubmittingComment}
                />
                <button
                  type="submit"
                  disabled={!newComment.trim() || isSubmittingComment}
                  className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </form>

            {/* Comments List */}
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {sortedComments.length === 0 ? (
                <div className="text-sm text-gray-500 text-center py-4">
                  No comments yet. Be the first to comment!
                </div>
              ) : (
                sortedComments.map(comment => (
                  <div key={comment.id} className="flex space-x-2">
                    <div className="w-6 h-6 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-semibold text-xs">
                        {getInitials(comment.author)}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-800">{comment.author}</p>
                            <p className="text-sm text-gray-700 mt-1 whitespace-pre-wrap">{comment.text}</p>
                          </div>
                          {(comment.authorId === currentUserId || announcement.authorId === currentUserId) && (
                            <button
                              onClick={() => handleDeleteComment(comment.id)}
                              className="text-gray-400 hover:text-red-600 transition-colors ml-2 flex-shrink-0"
                              title="Delete comment"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          {formatCommentDate(comment.timestamp)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnnouncementCard;