// src/components/announcements/AnnouncementForm.js
import React, { useState } from 'react';
import { X, MessageSquare } from 'lucide-react';

const AnnouncementForm = ({ onClose, onSave }) => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    type: 'personal'
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim()) return;
    
    setLoading(true);
    try {
      await onSave(formData);
    } catch (error) {
      console.error('Error saving announcement:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const typeOptions = [
    { value: 'personal', label: 'Personal Update' },
    { value: 'achievement', label: 'Achievement' },
    { value: 'event', label: 'Event' }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-400 to-blue-500 p-4 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <MessageSquare className="w-5 h-5" />
              <h2 className="text-lg font-semibold">Share Update</h2>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Title (required)
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="What's your update about?"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Category
            </label>
            <select
              value={formData.type}
              onChange={(e) => handleChange('type', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              {typeOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Content (required)
            </label>
            <textarea
              value={formData.content}
              onChange={(e) => handleChange('content', e.target.value)}
              placeholder="Share your update with your brothers..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
              rows="4"
              required
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              disabled={loading || !formData.title.trim() || !formData.content.trim()}
              className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Sharing...' : 'Share Update'}
            </button>
            <button
              type="button"
              onClick={onClose}
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

export default AnnouncementForm;