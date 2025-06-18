// ===== src/components/interactions/InteractionHistory.js =====
import React, { useState, useEffect } from 'react';
import { Phone, MessageSquare, Mail, Users, Clock, Star, Calendar, Filter } from 'lucide-react';
import { formatDate } from '../../utils/dateHelpers';
import { useAuth } from '../../contexts/AuthContext';
import { getInteractions } from '../../services/firestore';

const InteractionHistory = ({ brotherId }) => {
  const { user } = useAuth();
  const [interactions, setInteractions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user && brotherId) {
      loadInteractions();
    }
  }, [user, brotherId]);

  const loadInteractions = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await getInteractions(user.uid, brotherId);
      if (result.error) {
        setError(result.error);
        setInteractions([]);
      } else {
        setInteractions(result.data || []);
      }
    } catch (err) {
      setError('Failed to load interactions');
      setInteractions([]);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredInteractions = () => {
    if (filter === 'all') return interactions;
    return interactions.filter(interaction => interaction.method === filter);
  };

  const getMethodIcon = (method) => {
    switch (method) {
      case 'call':
        return <Phone className="w-4 h-4" />;
      case 'text':
      case 'whatsapp':
        return <MessageSquare className="w-4 h-4" />;
      case 'email':
        return <Mail className="w-4 h-4" />;
      case 'in_person':
        return <Users className="w-4 h-4" />;
      default:
        return <MessageSquare className="w-4 h-4" />;
    }
  };

  const getMethodColor = (method) => {
    switch (method) {
      case 'call':
        return 'text-blue-600 bg-blue-50';
      case 'text':
        return 'text-green-600 bg-green-50';
      case 'whatsapp':
        return 'text-green-600 bg-green-50';
      case 'email':
        return 'text-purple-600 bg-purple-50';
      case 'in_person':
        return 'text-orange-600 bg-orange-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const formatInteractionDate = (timestamp) => {
    if (!timestamp) return 'Unknown date';
    
    // Handle Firestore timestamp
    if (timestamp.seconds) {
      return formatDate(new Date(timestamp.seconds * 1000));
    }
    
    // Handle regular Date object or string
    return formatDate(new Date(timestamp));
  };

  const renderStars = (rating) => {
    if (!rating) return null;
    
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-3 h-3 ${
              star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          <span className="ml-3 text-gray-600">Loading interactions...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <p className="text-red-600 mb-2">Error loading interactions</p>
            <p className="text-gray-500 text-sm">{error}</p>
            <button
              onClick={loadInteractions}
              className="mt-3 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const filteredInteractions = getFilteredInteractions();

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800">Interaction History</h3>
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="all">All Methods</option>
              <option value="call">Phone Calls</option>
              <option value="text">Text Messages</option>
              <option value="whatsapp">WhatsApp</option>
              <option value="email">Email</option>
              <option value="in_person">In Person</option>
            </select>
          </div>
        </div>
      </div>

      {/* Interactions List */}
      <div className="p-4">
        {filteredInteractions.length === 0 ? (
          <div className="text-center py-8">
            <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">
              {filter === 'all' 
                ? 'No interactions recorded yet' 
                : `No ${filter} interactions found`}
            </p>
            <p className="text-sm text-gray-400 mt-1">
              Start building your relationship by logging your first interaction
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredInteractions.map((interaction) => (
              <div
                key={interaction.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-full ${getMethodColor(interaction.method)}`}>
                      {getMethodIcon(interaction.method)}
                    </div>
                    <div>
                      <p className="font-medium text-gray-800 capitalize">
                        {interaction.method?.replace('_', ' ') || 'Unknown Method'}
                      </p>
                      <div className="flex items-center space-x-3 text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-3 h-3" />
                          <span>{formatInteractionDate(interaction.timestamp)}</span>
                        </div>
                        {interaction.duration && (
                          <div className="flex items-center space-x-1">
                            <Clock className="w-3 h-3" />
                            <span>{interaction.duration} min</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {interaction.rating && (
                    <div className="flex flex-col items-end">
                      {renderStars(interaction.rating)}
                      <span className="text-xs text-gray-500 mt-1">Quality</span>
                    </div>
                  )}
                </div>

                {/* Notes */}
                {interaction.notes && (
                  <div className="mb-3">
                    <p className="text-gray-700 text-sm leading-relaxed">
                      {interaction.notes}
                    </p>
                  </div>
                )}

                {/* Follow-up indicator */}
                {interaction.followUpNeeded && (
                  <div className="flex items-center space-x-2 text-sm">
                    <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                    <span className="text-orange-600">Follow-up needed</span>
                    {interaction.followUpDate && (
                      <span className="text-gray-500">
                        by {formatInteractionDate(interaction.followUpDate)}
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Summary */}
      {interactions.length > 0 && (
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 rounded-b-lg">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>Total interactions: {interactions.length}</span>
            {filter !== 'all' && (
              <span>{filter} interactions: {filteredInteractions.length}</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default InteractionHistory;