// ===== src/components/dua/DuaCard.js =====
import React, { useState } from 'react';
import { Heart, MessageCircle, Clock, Star } from 'lucide-react';
import { formatDate } from '../../utils/dateHelpers';

const DuaCard = ({ dua }) => {
  const [hasResponded, setHasResponded] = useState(false);

  const handleAmeen = () => {
    setHasResponded(true);
    // Add API call to record response
  };

  const handleMarkAnswered = () => {
    // Add API call to mark as answered
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
            <span className="text-green-600 font-medium text-xs">
              {dua.authorName?.charAt(0) || 'B'}
            </span>
          </div>
          <div>
            <span className="font-medium text-gray-800 text-sm">
              {dua.authorName || 'Anonymous Brother'}
            </span>
            <div className="flex items-center space-x-2 mt-1">
              {dua.urgent && (
                <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-medium">
                  Urgent
                </span>
              )}
              {dua.answered && (
                <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
                  Alhamdulillah ✓
                </span>
              )}
            </div>
          </div>
        </div>
        
        <div className="text-right text-xs text-gray-500">
          <div className="flex items-center">
            <Clock className="w-3 h-3 mr-1" />
            {formatDate(dua.createdAt)}
          </div>
        </div>
      </div>
      
      <div className="mb-4">
        <p className="text-gray-700 text-sm leading-relaxed">
          {dua.request}
        </p>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1 text-xs text-gray-500">
            <Heart className="w-3 h-3" />
            <span>{dua.responses || 0} responses</span>
          </div>
          
          <div className="flex items-center space-x-1 text-xs text-gray-500">
            <MessageCircle className="w-3 h-3" />
            <span>{dua.comments || 0} comments</span>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={handleAmeen}
            disabled={hasResponded}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
              hasResponded
                ? 'bg-green-100 text-green-700'
                : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
            }`}
          >
            {hasResponded ? 'Ameen Said ✓' : 'Say Ameen'}
          </button>
          
          {!dua.answered && dua.isOwner && (
            <button
              onClick={handleMarkAnswered}
              className="px-3 py-1 bg-green-100 text-green-700 rounded-md text-xs font-medium hover:bg-green-200"
            >
              Mark Answered
            </button>
          )}
        </div>
      </div>
      
      {dua.answered && dua.answeredNote && (
        <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-start space-x-2">
            <Star className="w-4 h-4 text-green-600 mt-0.5" />
            <div>
              <p className="text-sm text-green-800 font-medium">
                Alhamdulillah - Prayer Answered
              </p>
              <p className="text-xs text-green-700 mt-1">
                {dua.answeredNote}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DuaCard;