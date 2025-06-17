// ===== src/components/brothers/BrotherProfile.js =====
import React, { useState } from 'react';
import { Phone, MessageSquare, Mail, MapPin, Clock, Calendar, Star, Plus, Edit } from 'lucide-react';
import { formatDate, getDaysAgo } from '../../utils/dateHelpers';
import LogInteraction from '../interactions/LogInteraction';

const BrotherProfile = ({ brother, onClose, onUpdate }) => {
  const [showLogInteraction, setShowLogInteraction] = useState(false);
  const [activeTab, setActiveTab] = useState('info');

  const mockInteractions = [
    {
      id: '1',
      method: 'call',
      date: new Date('2025-06-15'),
      duration: 25,
      notes: 'Discussed his new job and upcoming move. He seems excited about the opportunities.',
      rating: 5
    },
    {
      id: '2',
      method: 'text',
      date: new Date('2025-06-10'),
      notes: 'Quick check-in about his mother\'s health. She\'s doing better, Alhamdulillah.',
      rating: 4
    }
  ];

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const handleLogInteraction = (interactionData) => {
    // In real app, this would save to Firestore
    console.log('Logging interaction:', interactionData);
    setShowLogInteraction(false);
    // Update brother's last contact info
    onUpdate({
      ...brother,
      lastContact: new Date(),
      lastContactMethod: interactionData.method
    });
  };

  const tabs = [
    { id: 'info', label: 'Info' },
    { id: 'history', label: 'History' },
    { id: 'notes', label: 'Notes' }
  ];

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
              onClick={() => setShowLogInteraction(true)}
              className="flex-1 bg-purple-100 text-purple-700 py-2 px-3 rounded-md text-sm hover:bg-purple-200 flex items-center justify-center space-x-1"
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
                  {brother.lastContact 
                    ? `${getDaysAgo(brother.lastContact)} days ago (${formatDate(brother.lastContact)})`
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
              {mockInteractions.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No interaction history</p>
              ) : (
                mockInteractions.map(interaction => (
                  <div key={interaction.id} className="border rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        {interaction.method === 'call' && <Phone className="w-4 h-4 text-green-600" />}
                        {interaction.method === 'text' && <MessageSquare className="w-4 h-4 text-blue-600" />}
                        {interaction.method === 'email' && <Mail className="w-4 h-4 text-gray-600" />}
                        <span className="text-sm font-medium text-gray-800">
                          {interaction.method === 'call' ? 'Phone Call' : 
                           interaction.method === 'text' ? 'Text Message' : 'Email'}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        {[...Array(interaction.rating)].map((_, i) => (
                          <Star key={i} className="w-3 h-3 text-yellow-400 fill-current" />
                        ))}
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-2">{interaction.notes}</p>
                    
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{formatDate(interaction.date)}</span>
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
          onSave={handleLogInteraction}
          onCancel={() => setShowLogInteraction(false)}
        />
      )}
    </div>
  );
};

export default BrotherProfile;export default StravaIntegration;