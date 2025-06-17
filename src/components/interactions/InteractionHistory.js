// ===== src/components/interactions/InteractionHistory.js =====
import React, { useState, useEffect } from 'react';
import { Phone, MessageSquare, Mail, Users, Clock, Star, Calendar, Filter } from 'lucide-react';
import { formatDate } from '../../utils/dateHelpers';
import { useAuth } from '../../contexts/AuthContext';

const InteractionHistory = ({ brotherId }) => {
  const { user } = useAuth();
  const [interactions, setInteractions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    // In real app, fetch from Firestore
    // For now, using mock data
    const mockInteractions = [
      {
        id: '1',
        brotherId: brotherId,
        method: 'call',
        date: new Date('2025-06-15T14:30:00'),
        duration: 25,
        notes: 'Discussed his new job opportunity. He\'s considering a move to Toronto for better career prospects.',
        rating: 5,
        followUpNeeded: false
      },
      {
        id: '2',
        brotherId: brotherId,
        method: 'text',
        date: new Date('2025-06-10T09:15:00'),
        notes: 'Quick check-in about his mother\'s surgery. Alhamdulillah, everything went well.',
        rating: 4,
        followUpNeeded: true,
        followUpDate: new Date('2025-06-20')
      },
      {
        id: '3',
        brotherId: brotherId,
        method: 'whatsapp',
        date: new Date('2025-06-05T19:45:00'),
        duration: 15,
        notes: 'Shared some Islamic resources about time management. He was grateful for the recommendations.',
        rating: 5,
        followUpNeeded: false
      },
      {
        id: '4',
        brotherId: brotherId,
        method: 'in_person',
        date: new Date('2025-05-28T18:30:00'),
        duration: 120,
        notes: 'Met at the masjid after Maghrib. Long conversation about family planning and seeking Allah\'s guidance.',
        rating: 5,
        followUpNeeded: false
      }
    ];
    
    setInteractions(mockInteractions);
    setLoading(false);
  }, [brotherId]);

  const getMethodIcon = (method) => {
    switch (method) {
      case 'call': return <Phone className="w-4 h-4 text-green-600" />;
      case 'text': return <MessageSquare className="w-4 h-4 text-blue-600" />;
      case 'whatsapp': return <MessageSquare className="w-4 h-4 text-green-500" />;
      case 'email': return <Mail className="w-4 h-4 text-gray-600" />;
      case 'in_person': return <Users className="w-4 h-4 text-purple-600" />;
      default: return <MessageSquare className="w-4 h-4 text-gray-600" />;
    }
  };

  const getMethodLabel = (method) => {
    switch (method) {
      case 'call': return 'Phone Call';
      case 'text': return 'Text Message';
      case 'whatsapp': return 'WhatsApp';
      case 'email': return 'Email';
      case 'in_person': return 'In Person';
      default: return 'Unknown';
    }
  };

  const filteredInteractions = interactions.filter(interaction => {
    if (filter === 'all') return true;
    return interaction.method === filter;
  });

  const filterOptions = [
    { value: 'all', label: 'All' },
    { value: 'call', label: 'Calls' },
    { value: 'text', label: 'Texts' },
    { value: 'whatsapp', label: 'WhatsApp' },
    { value: 'email', label: 'Email' },
    { value: 'in_person', label: 'In Person' }
  ];

  if (loading) {
    return <div className="text-center py-4">Loading interaction history...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Filter */}
      <div className="flex items-center space-x-2">
        <Filter className="w-4 h-4 text-gray-600" />
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          {filterOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <span className="text-sm text-gray-500">
          {filteredInteractions.length} interaction{filteredInteractions.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Interactions List */}
      <div className="space-y-3">
        {filteredInteractions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No interactions found</p>
            <p className="text-sm mt-1">Start logging your conversations with this brother</p>
          </div>
        ) : (
          filteredInteractions.map(interaction => (
            <div key={interaction.id} className="bg-white border rounded-lg p-4 hover:shadow-sm transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  {getMethodIcon(interaction.method)}
                  <div>
                    <h4 className="font-medium text-gray-800 text-sm">
                      {getMethodLabel(interaction.method)}
                    </h4>
                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                      <Clock className="w-3 h-3" />
                      <span>{formatDate(interaction.date)}</span>
                      {interaction.duration && (
                        <>
                          <span>•</span>
                          <span>{interaction.duration} min</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3 h-3 ${
                        i < interaction.rating
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </div>
              
              <p className="text-sm text-gray-700 mb-3 leading-relaxed">
                {interaction.notes}
              </p>
              
              {interaction.followUpNeeded && (
                <div className="flex items-center space-x-2 p-2 bg-yellow-50 border border-yellow-200 rounded-md">
                  <Calendar className="w-4 h-4 text-yellow-600" />
                  <span className="text-sm text-yellow-800">
                    Follow-up needed {interaction.followUpDate && `by ${formatDate(interaction.followUpDate)}`}
                  </span>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Summary Stats */}
      {filteredInteractions.length > 0 && (
        <div className="bg-gray-50 border rounded-lg p-4">
          <h4 className="font-medium text-gray-800 mb-3">Interaction Summary</h4>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-lg font-bold text-gray-800">{filteredInteractions.length}</p>
              <p className="text-xs text-gray-600">Total</p>
            </div>
            <div>
              <p className="text-lg font-bold text-gray-800">
                {Math.round(filteredInteractions.reduce((acc, i) => acc + i.rating, 0) / filteredInteractions.length * 10) / 10}
              </p>
              <p className="text-xs text-gray-600">Avg Rating</p>
            </div>
            <div>
              <p className="text-lg font-bold text-gray-800">
                {Math.round(filteredInteractions.filter(i => i.duration).reduce((acc, i) => acc + (i.duration || 0), 0) / filteredInteractions.filter(i => i.duration).length) || 0}
              </p>
              <p className="text-xs text-gray-600">Avg Duration</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InteractionHistory;