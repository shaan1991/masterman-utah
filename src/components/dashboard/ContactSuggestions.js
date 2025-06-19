// ===== Fixed src/components/dashboard/ContactSuggestions.js =====
import React from 'react';
import { Phone, MessageSquare, Clock } from 'lucide-react';
import { getContactPriority } from '../../utils/contactHelpers';
import { getDaysAgo } from '../../utils/dateHelpers';

const ContactSuggestions = ({ brothers = [], onNavigate }) => {
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

  // Helper function to trim notes text
  const trimNotes = (notes) => {
    if (!notes) return '';
    return notes.length > 40 ? notes.substring(0, 40) + '...' : notes;
  };

  return (
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
              <div key={brother.id} className="p-4 flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-gray-800 truncate">{brother.name}</h4>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(daysAgo)}`}>
                      {getStatusText(daysAgo)}
                    </span>
                    <span className="text-xs text-gray-500 flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      {daysAgo} days ago
                    </span>
                  </div>
                  {brother.notes && (
                    <p className="text-xs text-gray-500 mt-1 truncate">
                      {trimNotes(brother.notes)}
                    </p>
                  )}
                </div>
                
                <div className="flex space-x-2 ml-2">
                  <button className="p-2 bg-green-100 text-green-600 rounded-full hover:bg-green-200">
                    <Phone className="w-4 h-4" />
                  </button>
                  <button className="p-2 bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200">
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
  );
};

export default ContactSuggestions;