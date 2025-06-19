// ===== src/components/dashboard/ContactSuggestions.js =====
import React, { useState } from 'react';
import { Phone, MessageSquare, Clock } from 'lucide-react';
import { getContactPriority } from '../../utils/contactHelpers';
import { getDaysAgo } from '../../utils/dateHelpers';
import LogInteraction from '../interactions/LogInteraction';

const ContactSuggestions = ({ brothers = [], onNavigate }) => {
  const [showLogInteraction, setShowLogInteraction] = useState(false);
  const [editingInteraction, setEditingInteraction] = useState(null);
  const [selectedBrother, setSelectedBrother] = useState(null);
  
  const suggestions = getContactPriority(brothers).slice(0, 3);

  const getStatusColor = (daysAgo) => {
    if (daysAgo > 30) return 'bg-red-100 text-red-700';
    if (daysAgo > 21) return 'bg-yellow-100 text-yellow-700';
    return 'bg-green-100 text-green-700';
  };

  const getStatusText = (daysAgo) => {
    if (daysAgo > 30) return 'Urgent';
    if (daysAgo > 21) return 'Due Soon';
    return 'Recent';
  };

  // Handle call functionality
  const handleCall = (e, brother) => {
    e.stopPropagation(); // Prevent any parent click handlers
    if (brother.phone) {
      window.open(`tel:${brother.phone}`, '_self');
      // Log the call attempt
      setTimeout(() => {
        setSelectedBrother(brother);
        setEditingInteraction({
          brotherId: brother.id,
          method: 'call',
          date: new Date().toISOString().split('T')[0],
          time: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
          notes: 'Call initiated from contact suggestion',
          rating: 5
        });
        setShowLogInteraction(true);
      }, 1000);
    } else {
      alert('No phone number available for this brother');
    }
  };

  // Handle text functionality
  const handleText = (e, brother) => {
    e.stopPropagation(); // Prevent any parent click handlers
    if (brother.phone) {
      window.open(`sms:${brother.phone}`, '_self');
      // Log the text attempt
      setTimeout(() => {
        setSelectedBrother(brother);
        setEditingInteraction({
          brotherId: brother.id,
          method: 'text',
          date: new Date().toISOString().split('T')[0],
          time: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
          notes: 'Text message initiated from contact suggestion',
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
    setSelectedBrother(null);
    // Optionally refresh data or notify parent component
  };

  const handleInteractionCancel = () => {
    setShowLogInteraction(false);
    setEditingInteraction(null);
    setSelectedBrother(null);
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-4 border-b">
          <h3 className="font-semibold text-gray-800">Contact Suggestions</h3>
          <p className="text-sm text-gray-600">Brothers to connect with this week</p>
        </div>
        
        <div className="divide-y">
          {suggestions.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              <p>All caught up! Alhamdulillah</p>
            </div>
          ) : (
            suggestions.map(brother => {
              const daysAgo = getDaysAgo(brother.lastContact);
              return (
                <div key={brother.id} className="p-4 flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0 pr-2">
                    <h4 className="font-medium text-gray-800 truncate">{brother.name}</h4>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className={`text-xs px-2 py-1 rounded-full whitespace-nowrap ${getStatusColor(daysAgo)}`}>
                        {getStatusText(daysAgo)}
                      </span>
                      <span className="text-xs text-gray-500 flex items-center whitespace-nowrap">
                        <Clock className="w-3 h-3 mr-1 flex-shrink-0" />
                        {daysAgo} days ago
                      </span>
                    </div>
                    {brother.location && (
                      <p className="text-xs text-gray-500 mt-1 truncate">
                        📍 {brother.location}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex space-x-2 flex-shrink-0">
                    <button 
                      onClick={(e) => handleCall(e, brother)}
                      className="p-2 bg-green-100 text-green-600 rounded-full hover:bg-green-200 transition-colors"
                      title={`Call ${brother.name}`}
                    >
                      <Phone className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={(e) => handleText(e, brother)}
                      className="p-2 bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200 transition-colors"
                      title={`Text ${brother.name}`}
                    >
                      <MessageSquare className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
        
        {suggestions.length > 0 && (
          <div className="p-3 border-t bg-gray-50">
            <button 
              onClick={() => onNavigate('brothers')}
              className="w-full text-center text-sm text-green-600 hover:text-green-700 font-medium"
            >
              View All Brothers
            </button>
          </div>
        )}
      </div>

      {/* Log Interaction Modal */}
      {showLogInteraction && selectedBrother && (
        <LogInteraction
          brotherId={selectedBrother.id}
          brotherName={selectedBrother.name}
          initialData={editingInteraction}
          onSave={handleInteractionSaved}
          onCancel={handleInteractionCancel}
        />
      )}
    </>
  );
};

export default ContactSuggestions;