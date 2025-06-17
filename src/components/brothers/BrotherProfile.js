import React, { useState, useEffect } from 'react';
import { Phone, MessageSquare, Mail, MapPin, Clock, Calendar, Star, Plus, Edit, User, Trash2, MoreVertical } from 'lucide-react';
import { formatDate, getDaysAgo } from '../../utils/dateHelpers';
import LogInteraction from '../interactions/LogInteraction';
import { useAuth } from '../../contexts/AuthContext';
import { logInteraction, updateBrother, getInteractions, updateInteraction, deleteInteraction } from '../../services/firestore';

const BrotherProfile = ({ brother, onClose, onUpdate }) => {
  const { user } = useAuth();
  const [showLogInteraction, setShowLogInteraction] = useState(false);
  const [editingInteraction, setEditingInteraction] = useState(null);
  const [activeTab, setActiveTab] = useState('info');
  const [interactions, setInteractions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user && brother.id) {
      loadInteractions();
    }
  }, [user, brother.id]);

  const loadInteractions = async () => {
    try {
      const result = await getInteractions(user.uid, brother.id);
      if (!result.error) {
        setInteractions(result.data);
      }
    } catch (error) {
      console.error('Error loading interactions:', error);
    }
  };

  const handleLogInteraction = async (interactionData) => {
    if (!user) return;
    
    setLoading(true);
    try {
      let result;
      
      if (editingInteraction) {
        // Update existing interaction
        result = await updateInteraction(user.uid, editingInteraction.id, interactionData);
        setEditingInteraction(null);
      } else {
        // Create new interaction
        result = await logInteraction(user.uid, {
          ...interactionData,
          brotherId: brother.id,
          brotherName: brother.name,
          timestamp: new Date()
        });
      }

      if (!result.error) {
        await updateBrother(user.uid, brother.id, {
          lastContact: new Date(),
          lastContactMethod: interactionData.method
        });
        
        onUpdate({
          ...brother,
          lastContact: new Date(),
          lastContactMethod: interactionData.method
        });

        setShowLogInteraction(false);
        await loadInteractions();
      } else {
        alert('Error saving interaction: ' + result.error);
      }
    } catch (error) {
      alert('Exception: ' + error.message);
    }
    setLoading(false);
  };

  const handleEditInteraction = (interaction) => {
    setEditingInteraction(interaction);
    setShowLogInteraction(true);
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
            <button className="flex-1 bg-green-100 text-green-700 py-2 px-3 rounded-md text-sm hover:bg-green-200 flex items-center justify-center space-x-1">
              <Phone className="w-4 h-4" />
              <span>Call</span>
            </button>
            <button className="flex-1 bg-blue-100 text-blue-700 py-2 px-3 rounded-md text-sm hover:bg-blue-200 flex items-center justify-center space-x-1">
              <MessageSquare className="w-4 h-4" />
              <span>Text</span>
            </button>
            <button 
              onClick={() => {
                setEditingInteraction(null);
                setShowLogInteraction(true);
              }}
              disabled={loading}
              className="flex-1 bg-purple-100 text-purple-700 py-2 px-3 rounded-md text-sm hover:bg-purple-200 flex items-center justify-center space-x-1 disabled:opacity-50"
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
                <label className="text-sm font-medium text-gray-700">Email</label>
                <p className="text-sm text-gray-600">{brother.email || 'Not provided'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Phone</label>
                <p className="text-sm text-gray-600">{brother.phone || 'Not provided'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Preferred Contact</label>
                <p className="text-sm text-gray-600">
                  {brother.preferences?.preferredContact || 'Not set'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Timezone</label>
                <p className="text-sm text-gray-600">
                  {brother.preferences?.timezone || 'Not set'}
                </p>
              </div>
              <button className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-md text-sm hover:bg-gray-200 flex items-center justify-center space-x-1">
                <Edit className="w-4 h-4" />
                <span>Edit Information</span>
              </button>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-3">
              {interactions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No interactions recorded yet</p>
                  <p className="text-sm mt-1">Start logging your conversations</p>
                </div>
              ) : (
                interactions.map((interaction) => (
                  <div key={interaction.id} className="bg-gray-50 border rounded-lg p-3 relative">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                          {getMethodIcon(interaction.method)}
                        </div>
                        <span className="text-sm font-medium text-gray-700">
                          {getMethodLabel(interaction.method)}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center space-x-1">
                          {[...Array(interaction.rating || 5)].map((_, i) => (
                            <Star key={i} className="w-3 h-3 text-yellow-400 fill-current" />
                          ))}
                        </div>
                        <div className="relative">
                          <button
                            onClick={() => {
                              const menu = document.getElementById(`menu-${interaction.id}`);
                              menu.classList.toggle('hidden');
                            }}
                            className="p-1 text-gray-400 hover:text-gray-600"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>
                          <div 
                            id={`menu-${interaction.id}`}
                            className="hidden absolute right-0 mt-1 bg-white border rounded-lg shadow-lg z-10 min-w-[120px]"
                          >
                            <button
                              onClick={() => {
                                handleEditInteraction(interaction);
                                document.getElementById(`menu-${interaction.id}`).classList.add('hidden');
                              }}
                              className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                            >
                              <Edit className="w-3 h-3" />
                              <span>Edit</span>
                            </button>
                            <button
                              onClick={() => {
                                handleDeleteInteraction(interaction.id);
                                document.getElementById(`menu-${interaction.id}`).classList.add('hidden');
                              }}
                              className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                            >
                              <Trash2 className="w-3 h-3" />
                              <span>Delete</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-2">{interaction.notes || 'No notes added'}</p>
                    
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{formatTimestamp(interaction.timestamp)}</span>
                      {interaction.duration && (
                        <span>{interaction.duration} minutes</span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'notes' && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Personal Notes</label>
                <textarea
                  value={brother.notes || ''}
                  onChange={(e) => onUpdate({...brother, notes: e.target.value})}
                  placeholder="Add personal notes about this brother..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-sm resize-none"
                  rows="4"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Family/Personal Info</label>
                <textarea
                  placeholder="Family details, interests, important dates..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-sm resize-none"
                  rows="3"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {showLogInteraction && (
        <LogInteraction
          brotherId={brother.id}
          brotherName={brother.name}
          initialData={editingInteraction}
          onSave={handleLogInteraction}
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