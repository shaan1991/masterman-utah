// ===== src/components/dua/DuaForm.js =====
import React, { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { addDuaRequest } from '../../services/firestore';

const DuaForm = ({ onClose, onSubmit }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    request: '',
    urgent: false,
    anonymous: false
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.request.trim()) return;

    setLoading(true);
    
    const duaData = {
      request: formData.request.trim(),
      urgent: formData.urgent,
      authorId: user.uid,
      authorName: formData.anonymous ? null : user.displayName,
      authorEmail: formData.anonymous ? null : user.email
    };

    try {
      await addDuaRequest(duaData);
      onSubmit(duaData);
    } catch (error) {
      console.error('Error submitting dua request:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-4 border-b flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800">Request Dua</h3>
          <button
            onClick={onClose}
            className="p-1 text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Please make dua for...
            </label>
            <textarea
              value={formData.request}
              onChange={(e) => setFormData({...formData, request: e.target.value})}
              placeholder="Share what you'd like the brotherhood to pray for..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
              rows="4"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Be specific but respectful. Your brothers want to support you.
            </p>
          </div>
          
          <div className="space-y-3">
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={formData.urgent}
                onChange={(e) => setFormData({...formData, urgent: e.target.checked})}
                className="rounded text-red-600 focus:ring-red-500"
              />
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                <span className="text-sm text-gray-700">Mark as urgent</span>
              </div>
            </label>
            
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={formData.anonymous}
                onChange={(e) => setFormData({...formData, anonymous: e.target.checked})}
                className="rounded text-gray-600 focus:ring-gray-500"
              />
              <span className="text-sm text-gray-700">Submit anonymously</span>
            </label>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-xs text-blue-800">
              <strong>Remember:</strong> "And when My servants ask you concerning Me, 
              indeed I am near. I respond to the invocation of the supplicant when he calls upon Me." 
              - Quran 2:186
            </p>
          </div>
          
          <div className="flex space-x-3 pt-2">
            <button
              type="submit"
              disabled={loading || !formData.request.trim()}
              className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Submitting...' : 'Request Dua'}
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

export default DuaForm;