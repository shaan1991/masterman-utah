import React, { useState } from 'react';
import { Phone, MessageSquare, MapPin, Clock, ChevronRight } from 'lucide-react';
import { getDaysAgo } from '../../utils/dateHelpers';
import LogInteraction from '../interactions/LogInteraction';

const BrotherCard = ({ brother, onClick }) => {
  const [showLogInteraction, setShowLogInteraction] = useState(false);
  const [editingInteraction, setEditingInteraction] = useState(null);
  
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

  // Handle call functionality
  const handleCall = (e) => {
    e.stopPropagation(); // Prevent card click
    if (brother.phone) {
      window.open(`tel:${brother.phone}`, '_self');
      // Log the call attempt
      setTimeout(() => {
        setEditingInteraction({
          brotherId: brother.id,
          method: 'call',
          date: new Date().toISOString().split('T')[0],
          time: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
          notes: 'Call initiated from contact card',
          rating: 5
        });
        setShowLogInteraction(true);
      }, 1000);
    } else {
      alert('No phone number available for this brother');
    }
  };

  // Handle text functionality
  const handleText = (e) => {
    e.stopPropagation(); // Prevent card click
    if (brother.phone) {
      window.open(`sms:${brother.phone}`, '_self');
      // Log the text attempt
      setTimeout(() => {
        setEditingInteraction({
          brotherId: brother.id,
          method: 'text',
          date: new Date().toISOString().split('T')[0],
          time: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
          notes: 'Text message initiated from contact card',
          rating: 5
        });
        setShowLogInteraction(true);
      }, 1000);
    } else {
      alert('No phone number available for this brother');
    }
  };

  const handleInteractionSaved = () => {
    setShowLogInteraction(false);
    setEditingInteraction(null);
    // Optionally refresh data or notify parent component
  };

  return (
    <>
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
              className="p-2 bg-green-100 text-green-600 rounded-full hover:bg-green-200 transition-colors"
              onClick={handleCall}
              title="Call this brother"
            >
              <Phone className="w-4 h-4" />
            </button>
            <button 
              className="p-2 bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200 transition-colors"
              onClick={handleText}
              title="Text this brother"
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

      {/* Log Interaction Modal */}
      {showLogInteraction && (
        <LogInteraction
          brotherId={brother.id}
          brotherName={brother.name}
          initialData={editingInteraction}
          onSave={handleInteractionSaved}
          onCancel={() => {
            setShowLogInteraction(false);
            setEditingInteraction(null);
          }}
        />
      )}
    </>
  );
};

export default BrotherCard;