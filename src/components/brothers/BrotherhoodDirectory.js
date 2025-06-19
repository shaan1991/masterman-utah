// src/components/brothers/BrotherhoodDirectory.js - Complete with ALL features
import React, { useState, useEffect } from 'react';
import { 
  Plus, Edit, Trash2, X, Phone, MessageSquare, Mail, MapPin, 
  Clock, User, Users, Save 
} from 'lucide-react';
import SearchFilter from './SearchFilter';
import BrotherCard from './BrotherCard';
import AddBrotherForm from './AddBrotherForm';
import { useBrothers } from '../../contexts/BrothersContext';
import { useBrothers as useBrothersHook } from '../../hooks/useBrothers';
import { 
  updateBrother, 
  deleteBrother, 
  getInteractions, 
  deleteInteraction, 
  logInteraction 
} from '../../services/firestore';
import { useAuth } from '../../contexts/AuthContext';
import { getDaysAgo } from '../../utils/dateHelpers';

// LogInteraction Component
const LogInteraction = ({ brotherId, brotherName, initialData, onSave, onCancel }) => {
  const [interaction, setInteraction] = useState({
    brotherId,
    method: 'call',
    duration: '',
    date: new Date().toISOString().split('T')[0],
    time: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
    notes: '',
    rating: 5
  });

  const { user } = useAuth();

  useEffect(() => {
    if (initialData) {
      setInteraction(prev => ({
        ...prev,
        ...initialData
      }));
    }
  }, [initialData]);

  const contactMethods = [
    { value: 'call', label: 'Phone Call', icon: Phone },
    { value: 'text', label: 'Text Message', icon: MessageSquare },
    { value: 'email', label: 'Email', icon: Mail },
    { value: 'whatsapp', label: 'WhatsApp', icon: MessageSquare },
    { value: 'in_person', label: 'In Person', icon: Users }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('📝 Logging interaction:', interaction);

    try {
      const result = await logInteraction(user.uid, interaction);
      if (result.error) {
        alert('Error logging interaction: ' + result.error);
      } else {
        console.log('✅ Interaction logged successfully');
        onSave(interaction);
      }
    } catch (error) {
      console.error('❌ Error logging interaction:', error);
      alert('Error: ' + error.message);
    }
  };

  const handleChange = (field, value) => {
    setInteraction(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-4 border-b flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Log Interaction</h3>
            <p className="text-sm text-gray-600">Record your contact with {brotherName}</p>
          </div>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Contact Method */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contact Method
            </label>
            <div className="grid grid-cols-2 gap-2">
              {contactMethods.map((method) => {
                const Icon = method.icon;
                const isSelected = interaction.method === method.value;
                return (
                  <button
                    key={method.value}
                    type="button"
                    onClick={() => handleChange('method', method.value)}
                    className={`flex items-center space-x-2 p-3 rounded-lg border text-sm transition-colors ${
                      isSelected
                        ? 'bg-green-50 border-green-500 text-green-700'
                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{method.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date
              </label>
              <input
                type="date"
                value={interaction.date}
                onChange={(e) => handleChange('date', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Time
              </label>
              <input
                type="time"
                value={interaction.time}
                onChange={(e) => handleChange('time', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md text-sm"
              />
            </div>
          </div>

          {/* Duration (for calls) */}
          {interaction.method === 'call' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Duration (minutes)
              </label>
              <input
                type="number"
                value={interaction.duration}
                onChange={(e) => handleChange('duration', e.target.value)}
                placeholder="e.g., 15"
                className="w-full p-2 border border-gray-300 rounded-md text-sm"
              />
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              value={interaction.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              placeholder="How did the conversation go? Any follow-ups needed?"
              className="w-full p-2 border border-gray-300 rounded-md text-sm"
              rows="3"
            />
          </div>

          {/* Rating */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              How was the interaction?
            </label>
            <div className="flex space-x-2">
              {[1, 2, 3, 4, 5].map(rating => (
                <button
                  key={rating}
                  type="button"
                  onClick={() => handleChange('rating', rating)}
                  className={`w-8 h-8 rounded-full text-sm font-medium transition-colors ${
                    interaction.rating >= rating
                      ? 'bg-yellow-400 text-white'
                      : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                  }`}
                >
                  ★
                </button>
              ))}
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 flex items-center justify-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>Save Interaction</span>
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="px-6 bg-gray-300 text-gray-700 py-2 rounded-md hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Enhanced Brother Profile with ALL tabs and functionality
const CompleteProfile = ({ brother, onClose, onUpdate }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('info');
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [localBrother, setLocalBrother] = useState(brother);
  const [showLogInteraction, setShowLogInteraction] = useState(false);
  const [editingInteraction, setEditingInteraction] = useState(null);
  const [interactions, setInteractions] = useState([]);
  const [interactionsLoading, setInteractionsLoading] = useState(false);
  const [notes, setNotes] = useState(brother.notes || '');

  const tabs = [
    { id: 'info', label: 'Info' },
    { id: 'history', label: 'History' },
    { id: 'notes', label: 'Notes' }
  ];

  // Load interactions when history tab is active
  useEffect(() => {
    if (activeTab === 'history') {
      loadInteractions();
    }
  }, [activeTab, brother.id]);

  const loadInteractions = async () => {
    setInteractionsLoading(true);
    try {
      const result = await getInteractions(user.uid, brother.id);
      if (!result.error) {
        console.log('📥 Loaded interactions:', result.data.length);
        setInteractions(result.data || []);
      } else {
        console.error('❌ Error loading interactions:', result.error);
      }
    } catch (error) {
      console.error('❌ Exception loading interactions:', error);
    }
    setInteractionsLoading(false);
  };

  const handleInteractionSaved = () => {
    setShowLogInteraction(false);
    setEditingInteraction(null);
    if (activeTab === 'history') {
      loadInteractions(); // Reload interactions
    }
  };

  const handleDeleteInteraction = async (interactionId) => {
    if (!window.confirm('Delete this interaction?')) return;

    try {
      const result = await deleteInteraction(user.uid, interactionId);
      if (!result.error) {
        console.log('✅ Interaction deleted');
        loadInteractions(); // Reload interactions
      } else {
        alert('Error deleting interaction: ' + result.error);
      }
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  const handleCall = () => {
    if (localBrother.phone) {
      window.open(`tel:${localBrother.phone}`, '_self');
      setTimeout(() => {
        setEditingInteraction({
          brotherId: localBrother.id,
          method: 'call',
          date: new Date().toISOString().split('T')[0],
          time: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
          notes: 'Call initiated from contact profile',
          rating: 5
        });
        setShowLogInteraction(true);
      }, 1000);
    } else {
      alert('No phone number available');
    }
  };

  const handleText = () => {
    if (localBrother.phone) {
      window.open(`sms:${localBrother.phone}`, '_self');
      setTimeout(() => {
        setEditingInteraction({
          brotherId: localBrother.id,
          method: 'text',
          date: new Date().toISOString().split('T')[0],
          time: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
          notes: 'Text message initiated from contact profile',
          rating: 5
        });
        setShowLogInteraction(true);
      }, 1000);
    } else {
      alert('No phone number available');
    }
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'Unknown date';
    const date = timestamp.seconds ? 
      new Date(timestamp.seconds * 1000) : new Date(timestamp);
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

  const handleSaveNotes = async () => {
    setLoading(true);
    try {
      const result = await updateBrother(user.uid, brother.id, { notes });
      if (result.error) {
        alert('Error saving notes: ' + result.error);
      } else {
        const updatedBrother = { ...localBrother, notes };
        setLocalBrother(updatedBrother);
        if (onUpdate) onUpdate(updatedBrother);
        alert('✅ Notes saved successfully!');
      }
    } catch (error) {
      alert('Error: ' + error.message);
    }
    setLoading(false);
  };

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-40">
        <div className="bg-white rounded-lg shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="relative">
            <div className="bg-gradient-to-r from-green-400 to-blue-500 p-6 text-white">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-white hover:text-gray-200"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-xl">
                    {getInitials(localBrother.name)}
                  </span>
                </div>
                <div>
                  <h2 className="text-xl font-semibold">{localBrother.name}</h2>
                  <div className="flex items-center space-x-2 mt-1">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm">{localBrother.location || 'Location not set'}</span>
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
                className="flex-1 bg-purple-100 text-purple-700 py-2 px-3 rounded-md text-sm hover:bg-purple-200 flex items-center justify-center space-x-1 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Log</span>
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
                    {localBrother.lastContact 
                      ? `${getDaysAgo(localBrother.lastContact)} days ago`
                      : 'Never contacted'
                    }
                  </span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500">Method</p>
                <p className="text-sm font-medium text-gray-700">
                  {localBrother.lastContactMethod || 'N/A'}
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
                  className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'text-green-600 border-b-2 border-green-600 bg-green-50'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-4 min-h-[200px]">
            {activeTab === 'info' && (
              <div className="space-y-4">
                {/* Contact Information */}
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-2">Contact Information</h3>
                  <div className="space-y-2">
                    {localBrother.phone && (
                      <div className="flex items-center space-x-2 text-sm">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span>{localBrother.phone}</span>
                      </div>
                    )}
                    {localBrother.email && (
                      <div className="flex items-center space-x-2 text-sm">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <span>{localBrother.email}</span>
                      </div>
                    )}
                    {localBrother.location && (
                      <div className="flex items-center space-x-2 text-sm">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span>{localBrother.location}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Preferences */}
                {localBrother.preferences?.preferredContact && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-2">Preferences</h3>
                    <div className="text-sm text-gray-600">
                      Preferred contact: {localBrother.preferences.preferredContact}
                    </div>
                  </div>
                )}

                {/* Edit/Delete Buttons */}
                <div className="flex space-x-2 pt-4">
                  <button
                    onClick={() => setEditing(true)}
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 flex items-center justify-center space-x-2"
                  >
                    <Edit className="w-4 h-4" />
                    <span>Edit Details</span>
                  </button>
                  <button
                    onClick={async () => {
                      if (!window.confirm(`Really delete ${localBrother.name}? This cannot be undone and will delete all interaction history.`)) {
                        return;
                      }

                      setLoading(true);
                      try {
                        const result = await deleteBrother(user.uid, localBrother.id);
                        if (result.error) {
                          alert('Delete failed: ' + result.error);
                        } else {
                          alert('✅ Brother deleted successfully!');
                          onClose();
                          if (onUpdate) onUpdate(null, true);
                        }
                      } catch (error) {
                        alert('Error: ' + error.message);
                      }
                      setLoading(false);
                    }}
                    disabled={loading}
                    className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 disabled:opacity-50 flex items-center justify-center space-x-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'history' && (
              <div>
                {interactionsLoading ? (
                  <div className="text-center py-8">
                    <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
                    <p className="text-sm text-gray-500 mt-2">Loading interactions...</p>
                  </div>
                ) : interactions.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">No interactions recorded yet</p>
                    <button
                      onClick={() => setShowLogInteraction(true)}
                      className="mt-2 text-green-600 text-sm hover:underline"
                    >
                      Log your first interaction
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {interactions.map(interaction => (
                      <div key={interaction.id} className="bg-gray-50 p-3 rounded-md">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-2">
                            {getMethodIcon(interaction.method)}
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {getMethodLabel(interaction.method)}
                              </div>
                              <div className="text-xs text-gray-500">
                                {formatTimestamp(interaction.timestamp)}
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => handleDeleteInteraction(interaction.id)}
                            className="text-gray-400 hover:text-red-600 text-xs"
                          >
                            Delete
                          </button>
                        </div>
                        {interaction.notes && (
                          <div className="mt-2 text-sm text-gray-600">
                            {interaction.notes}
                          </div>
                        )}
                        {interaction.rating && (
                          <div className="mt-1 text-xs text-gray-500">
                            Rating: {interaction.rating}/5 ⭐
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'notes' && (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Personal Notes</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md text-sm"
                    rows="6"
                    placeholder="Add personal notes about this brother..."
                  />
                </div>
                <button 
                  onClick={handleSaveNotes}
                  disabled={loading}
                  className="w-full bg-green-600 text-white py-2 px-4 rounded-md text-sm hover:bg-green-700 disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Save Notes'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Log Interaction Modal */}
      {showLogInteraction && (
        <LogInteraction
          brotherId={localBrother.id}
          brotherName={localBrother.name}
          initialData={editingInteraction}
          onSave={handleInteractionSaved}
          onCancel={() => {
            setShowLogInteraction(false);
            setEditingInteraction(null);
          }}
        />
      )}

      {/* Edit Form Modal */}
      {editing && (
        <EditBrotherForm
          brother={localBrother}
          onSave={async (formData) => {
            setLoading(true);
            try {
              const result = await updateBrother(user.uid, brother.id, formData);
              if (result.error) {
                alert('Update failed: ' + result.error);
              } else {
                const updatedBrother = { ...localBrother, ...formData };
                setLocalBrother(updatedBrother);
                setEditing(false);
                if (onUpdate) onUpdate(updatedBrother);
                alert('✅ Brother updated successfully!');
              }
            } catch (error) {
              alert('Error: ' + error.message);
            }
            setLoading(false);
          }}
          onCancel={() => setEditing(false)}
          loading={loading}
        />
      )}
    </>
  );
};

// Simple Edit Form (same as before)
const EditBrotherForm = ({ brother, onSave, onCancel, loading }) => {
  const [formData, setFormData] = useState({
    name: brother.name || '',
    email: brother.email || '',
    phone: brother.phone || '',
    location: brother.location || '',
    notes: brother.notes || ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.name.trim()) {
      onSave(formData);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-md p-6">
        <h3 className="text-lg font-semibold mb-4">Edit {brother.name}</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
              disabled={loading}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Phone</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Location</label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="px-6 bg-gray-300 text-gray-700 py-2 rounded hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Main Directory Component
const BrotherhoodDirectory = () => {
  const { brothers, loading } = useBrothers(); // Context
  const { addNewBrother, forceRefresh } = useBrothersHook(); // Hook
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedBrother, setSelectedBrother] = useState(null);
  const [refreshCount, setRefreshCount] = useState(0);

  const filteredBrothers = brothers.filter(brother => {
    const matchesSearch = brother.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         brother.location?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (statusFilter === 'all') return matchesSearch;
    
    // Add status filtering logic based on last contact
    const daysAgo = brother.lastContact ?
      Math.floor((new Date() - new Date(brother.lastContact.seconds * 1000)) / (1000 * 60 * 60 * 24)) : 999;
    
    switch (statusFilter) {
      case 'urgent':
        return matchesSearch && daysAgo > 30;
      case 'needs_contact':
        return matchesSearch && daysAgo > 21 && daysAgo <= 30;
      case 'recent':
        return matchesSearch && daysAgo <= 7;
      default:
        return matchesSearch;
    }
  });

  const handleAddBrother = async (brotherData) => {
    console.log('➕ Adding brother:', brotherData);
    const result = await addNewBrother(brotherData);
    
    if (!result.error) {
      setShowAddForm(false);
      handleRefresh();
      alert('✅ Brother added successfully!');
    } else {
      alert('❌ Failed to add brother: ' + result.error);
    }
    
    return result;
  };

  const handleUpdateBrother = async (updatedBrother, isDelete = false) => {
    console.log('🔄 Brother update/delete:', { updatedBrother, isDelete });
    
    if (isDelete) {
      // Brother was deleted
      setSelectedBrother(null);
    } else if (updatedBrother) {
      // Brother was updated
      setSelectedBrother(updatedBrother);
    }
    
    // Force refresh data
    handleRefresh();
  };

  const handleRefresh = () => {
    console.log('🔄 Forcing refresh');
    setRefreshCount(prev => prev + 1);
    if (forceRefresh) {
      forceRefresh();
    }
  };

  // Update selected brother when brothers array changes
  React.useEffect(() => {
    if (selectedBrother) {
      const updatedBrother = brothers.find(b => b.id === selectedBrother.id);
      if (updatedBrother && JSON.stringify(updatedBrother) !== JSON.stringify(selectedBrother)) {
        console.log('🔄 Updating selected brother with new data');
        setSelectedBrother(updatedBrother);
      } else if (!updatedBrother) {
        console.log('🔄 Selected brother no longer exists');
        setSelectedBrother(null);
      }
    }
  }, [brothers, refreshCount]);

  if (loading) {
    return <div className="text-center py-8">Loading brothers...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Brotherhood Directory</h2>
          <p className="text-sm text-gray-600">Complete contact and interaction management</p>
        </div>
        <button 
          onClick={() => setShowAddForm(true)}
          className="bg-green-600 text-white p-2 rounded-full hover:bg-green-700"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      <SearchFilter
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
      />
      
      <div className="text-sm text-gray-600 mb-4">
        {filteredBrothers.length} of {brothers.length} brothers
      </div>
      
      <div className="space-y-3">
        {filteredBrothers.map(brother => (
          <BrotherCard 
            key={`${brother.id}-${refreshCount}`}
            brother={brother} 
            onClick={() => {
              console.log('🔍 Opening complete profile for:', brother.name);
              setSelectedBrother(brother);
            }}
          />
        ))}
        
        {filteredBrothers.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p>No brothers found matching your criteria</p>
          </div>
        )}
      </div>

      {/* Add Brother Form Modal */}
      {showAddForm && (
        <AddBrotherForm
          onClose={() => setShowAddForm(false)}
          onSave={handleAddBrother}
        />
      )}

      {/* Complete Brother Profile Modal with ALL features */}
      {selectedBrother && (
        <CompleteProfile
          brother={selectedBrother}
          onClose={() => setSelectedBrother(null)}
          onUpdate={handleUpdateBrother}
        />
      )}
    </div>
  );
};

export default BrotherhoodDirectory;