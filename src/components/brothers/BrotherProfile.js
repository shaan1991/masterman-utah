import React, { useState, useEffect } from 'react';
import { Phone, MessageSquare, MapPin, Clock, Plus, X, User, Mail, Edit3, Trash2 } from 'lucide-react';
import { getDaysAgo } from '../../utils/dateHelpers';
import LogInteraction from '../interactions/LogInteraction';
import { getInteractions, deleteInteraction } from '../../services/firestore';
import { useAuth } from '../../contexts/AuthContext';

const BrotherProfile = ({ brother, onClose }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('info');
  const [showLogInteraction, setShowLogInteraction] = useState(false);
  const [editingInteraction, setEditingInteraction] = useState(null);
  const [interactions, setInteractions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (activeTab === 'history') {
      loadInteractions();
    }
  }, [activeTab, user, brother.id]);

  const loadInteractions = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const result = await getInteractions(user.uid, brother.id);
      if (!result.error) {
        setInteractions(result.data || []);
      }
    } catch (error) {
      console.error('Error loading interactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInteractionSaved = async () => {
    setShowLogInteraction(false);
    setEditingInteraction(null);
    if (activeTab === 'history') {
      await loadInteractions();
    }
  };

  const handleDeleteInteraction = async (interactionId) => {
    if (!window.confirm('Delete this interaction?')) return;
    
    try {
      const result = await deleteInteraction(user.uid, interactionId);
      if (!result.error) {
        await loadInteractions();
      } else {
        alert('Error deleting interaction: ' + result.error);
      }
    } catch (error) {
      alert('Exception: ' + error.message);
    }
  };

  // Handle call functionality
  const handleCall = () => {
    if (brother.phone) {
      window.open(`tel:${brother.phone}`, '_self');
      // Log the call attempt
      setTimeout(() => {
        setEditingInteraction({
          brotherId: brother.id,
          method: 'call',
          date: new Date().toISOString().split('T')[0],
          time: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
          notes: 'Call initiated from contact profile',
          rating: 5
        });
        setShowLogInteraction(true);
      }, 1000);
    } else {
      alert('No phone number available for this brother');
    }
  };

  // Handle text functionality
  const handleText = () => {
    if (brother.phone) {
      window.open(`sms:${brother.phone}`, '_self');
      // Log the text attempt
      setTimeout(() => {
        setEditingInteraction({
          brotherId: brother.id,
          method: 'text',
          date: new Date().toISOString().split('T')[0],
          time: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
          notes: 'Text message initiated from contact profile',
          rating: 5
        });
        setShowLogInteraction(true);
      }, 1000);
    } else {
      alert('No phone number available for this brother');
    }
  };

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const tabs = [
    { id: 'info', label: 'Info' },
    { id: 'history', label: 'History' },
    { id: 'notes', label: 'Notes' }
  ];

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'Unknown date';
    
    const date = timestamp.seconds ? new Date(timestamp.seconds * 1000) : new Date(timestamp);
    return date.toLocaleDateString() + ' at ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getMethodLabel = (method) => {
    switch (method) {
      case 'call': return 'Phone Call';
      case 'text': return 'Text Message';
      case 'email': return 'Email';
      case 'whatsapp': return 'WhatsApp';
      case 'in_person': return 'In Person';
      default: return 'Contact';
    }
  };

  const getMethodIcon = (method) => {
    switch (method) {
      case 'call': return <Phone className="w-3 h-3 text-green-600" />;
      case 'text': 
      case 'whatsapp': return <MessageSquare className="w-3 h-3 text-green-600" />;
      case 'email': return <Mail className="w-3 h-3 text-green-600" />;
      case 'in_person': return <User className="w-3 h-3 text-green-600" />;
      default: return <MessageSquare className="w-3 h-3 text-green-600" />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-40">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="relative">
          <div className="bg-gradient-to-r from-green-400 to-blue-500 p-6 text-white">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-white hover:text-gray-200"
            >
              ✕
            </button>
            
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-xl">
                  {getInitials(brother.name)}
                </span>
              </div>
              <div>
                <h2 className="text-xl font-semibold">{brother.name}</h2>
                <div className="flex items-center space-x-2 mt-1">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm">{brother.location || 'Location not set'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="p-4 border-b">
          <div className="flex space-x-2">
            <button 
              onClick={handleCall}
              className="flex-1 bg-green-100 text-green-700 py-2 px-3 rounded-md text-sm hover:bg-green-200 flex items-center justify-center space-x-1 transition-colors"
            >
              <Phone className="w-4 h-4" />
              <span>Call</span>
            </button>
            <button 
              onClick={handleText}
              className="flex-1 bg-blue-100 text-blue-700 py-2 px-3 rounded-md text-sm hover:bg-blue-200 flex items-center justify-center space-x-1 transition-colors"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Text</span>
            </button>
            <button 
              onClick={() => {
                setEditingInteraction(null);
                setShowLogInteraction(true);
              }}
              disabled={loading}
              className="flex-1 bg-purple-100 text-purple-700 py-2 px-3 rounded-md text-sm hover:bg-purple-200 flex items-center justify-center space-x-1 disabled:opacity-50 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>{loading ? 'Saving...' : 'Log'}</span>
            </button>
          </div>
        </div>

        {/* Last Contact Info */}
        <div className="p-4 border-b bg-gray-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-800">Last Contact</p>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Clock className="w-3 h-3" />
                <span>
                  {brother.lastContact 
                    ? `${getDaysAgo(brother.lastContact)} days ago`
                    : 'Never contacted'
                  }
                </span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500">Method</p>
              <p className="text-sm font-medium text-gray-700">
                {brother.lastContactMethod || 'N/A'}
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b">
          <div className="flex">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-3 px-4 text-sm font-medium ${
                  activeTab === tab.id
                    ? 'text-green-600 border-b-2 border-green-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-4">
          {activeTab === 'info' && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Phone</label>
                <p className="text-sm text-gray-900">{brother.phone || 'Not provided'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Email</label>
                <p className="text-sm text-gray-900">{brother.email || 'Not provided'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Location</label>
                <p className="text-sm text-gray-900">{brother.location || 'Not provided'}</p>
              </div>
              {brother.bio && (
                <div>
                  <label className="text-sm font-medium text-gray-700">About</label>
                  <p className="text-sm text-gray-900">{brother.bio}</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-3">
              {loading ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600 mx-auto"></div>
                  <p className="text-sm text-gray-500 mt-2">Loading...</p>
                </div>
              ) : interactions.length === 0 ? (
                <div className="text-center py-8">
                  <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No interactions recorded yet</p>
                  <button
                    onClick={() => setShowLogInteraction(true)}
                    className="mt-2 text-green-600 text-sm hover:underline"
                  >
                    Log your first interaction
                  </button>
                </div>
              ) : (
                interactions.map(interaction => (
                  <div key={interaction.id} className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        {getMethodIcon(interaction.method)}
                        <span className="text-sm font-medium text-gray-800">
                          {getMethodLabel(interaction.method)}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            setEditingInteraction(interaction);
                            setShowLogInteraction(true);
                          }}
                          className="text-gray-400 hover:text-blue-600"
                        >
                          <Edit3 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleDeleteInteraction(interaction.id)}
                          className="text-gray-400 hover:text-red-600"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mb-1">
                      {formatTimestamp(interaction.timestamp)}
                    </p>
                    {interaction.notes && (
                      <p className="text-sm text-gray-700">{interaction.notes}</p>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'notes' && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Personal Notes</label>
                <textarea
                  className="mt-1 w-full p-2 border border-gray-300 rounded-md text-sm"
                  rows="4"
                  placeholder="Add personal notes about this brother..."
                  defaultValue={brother.notes || ''}
                />
              </div>
              <button className="w-full bg-green-600 text-white py-2 px-4 rounded-md text-sm hover:bg-green-700">
                Save Notes
              </button>
            </div>
          )}
        </div>
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
    </div>
  );
};

export default BrotherProfile;