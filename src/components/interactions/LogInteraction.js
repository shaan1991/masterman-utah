import React, { useState } from 'react';
import { Phone, MessageSquare, Mail, Users, Save, X } from 'lucide-react';

const LogInteraction = ({ brotherId, brotherName, onSave, onCancel }) => {
  const [interaction, setInteraction] = useState({
    brotherId,
    method: 'call',
    duration: '',
    date: new Date().toISOString().split('T')[0],
    time: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
    notes: '',
    rating: 5
  });

  const contactMethods = [
    { value: 'call', label: 'Phone Call', icon: Phone },
    { value: 'text', label: 'Text Message', icon: MessageSquare },
    { value: 'email', label: 'Email', icon: Mail },
    { value: 'whatsapp', label: 'WhatsApp', icon: MessageSquare },
    { value: 'in_person', label: 'In Person', icon: Users }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(interaction);
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
                        ? 'bg-green-50 border-green-300 text-green-700'
                        : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input
                type="date"
                value={interaction.date}
                onChange={(e) => handleChange('date', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
              <input
                type="time"
                value={interaction.time}
                onChange={(e) => handleChange('time', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
              />
            </div>
          </div>

          {/* Duration */}
          {(interaction.method === 'call' || interaction.method === 'in_person') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Duration (minutes)
              </label>
              <input
                type="number"
                value={interaction.duration}
                onChange={(e) => handleChange('duration', e.target.value)}
                placeholder="e.g. 15"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                min="1"
              />
            </div>
          )}

          {/* Rating */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              How was the interaction?
            </label>
            <div className="flex space-x-2">
              {[1, 2, 3, 4, 5].map((rating) => (
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
                  ⭐
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              1 = Brief/Difficult, 5 = Great conversation
            </p>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              value={interaction.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              placeholder="What did you discuss? Any important updates?"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-sm resize-none"
              rows="3"
            />
          </div>

          {/* Action Buttons */}
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
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LogInteraction;