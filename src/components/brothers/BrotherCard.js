// ===== src/components/brothers/BrotherCard.js =====
import React from 'react';
import { Phone, MessageSquare, MapPin, Clock, ChevronRight } from 'lucide-react';
import { getDaysAgo } from '../../utils/dateHelpers';

const BrotherCard = ({ brother, onClick }) => {
  const daysAgo = getDaysAgo(brother.lastContact);
  
  const getStatusColor = (days) => {
    if (days > 30) return 'bg-red-100 text-red-700';
    if (days > 21) return 'bg-yellow-100 text-yellow-700';
    if (days <= 7) return 'bg-green-100 text-green-700';
    return 'bg-gray-100 text-gray-700';
  };

  const getStatusText = (days) => {
    if (days > 30) return 'Contact Now';
    if (days > 21) return 'Due This Week';
    if (days <= 7) return 'Recent Contact';
    return 'Good';
  };

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div 
      className="bg-white p-4 rounded-lg shadow-sm border hover:shadow-md transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center">
            <span className="text-white font-semibold text-sm">
              {getInitials(brother.name)}
            </span>
          </div>
          
          <div className="flex-1">
            <h4 className="font-medium text-gray-800">{brother.name}</h4>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <MapPin className="w-3 h-3" />
              <span>{brother.location || 'Location not set'}</span>
            </div>
          </div>
        </div>
        
        <ChevronRight className="w-5 h-5 text-gray-400" />
      </div>
      
      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(daysAgo)}`}>
            {getStatusText(daysAgo)}
          </span>
          
          <span className="text-xs text-gray-500 flex items-center">
            <Clock className="w-3 h-3 mr-1" />
            {daysAgo === 0 ? 'Today' : `${daysAgo} days ago`}
          </span>
        </div>
        
        <div className="flex space-x-2">
          <button 
            className="p-2 bg-green-100 text-green-600 rounded-full hover:bg-green-200"
            onClick={(e) => {
              e.stopPropagation();
              // Handle phone call
            }}
          >
            <Phone className="w-4 h-4" />
          </button>
          <button 
            className="p-2 bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200"
            onClick={(e) => {
              e.stopPropagation();
              // Handle message
            }}
          >
            <MessageSquare className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      {brother.notes && (
        <div className="mt-2 text-xs text-gray-500 bg-gray-50 p-2 rounded">
          {brother.notes}
        </div>
      )}
    </div>
  );
};

export default BrotherCard;