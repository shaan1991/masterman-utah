import React, { useState } from 'react';
import { X, Target } from 'lucide-react';

const AddGoalForm = ({ onClose, onSave }) => {
  const [formData, setFormData] = useState({
    type: 'quran',
    title: '',
    description: '',
    target: 7,
    frequency: 'weekly'
  });

  const goalTypes = [
    { value: 'quran', label: 'Quran Reading', icon: '📖' },
    { value: 'dhikr', label: 'Dhikr/Remembrance', icon: '🤲' },
    { value: 'salah', label: 'Prayer', icon: '🕌' },
    { value: 'charity', label: 'Charity', icon: '💝' },
    { value: 'fasting', label: 'Fasting', icon: '🌙' },
    { value: 'other', label: 'Other', icon: '⭐' }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    const newGoal = {
      id: Date.now().toString(),
      ...formData,
      progress: 0,
      streak: 0,
      createdAt: new Date()
    };

    onSave(newGoal);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-4 border-b flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Target className="w-5 h-5 text-green-600" />
            <h3 className="text-lg font-semibold text-gray-800">Add New Goal</h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Goal Type</label>
            <div className="grid grid-cols-2 gap-2">
              {goalTypes.map(type => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setFormData({...formData, type: type.value})}
                  className={`flex items-center space-x-2 p-3 rounded-lg border text-sm ${
                    formData.type === type.value
                      ? 'bg-green-50 border-green-300 text-green-700'
                      : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  <span className="text-lg">{type.icon}</span>
                  <span>{type.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              placeholder="e.g. Daily Quran Reading"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Describe your goal in detail..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
              rows="2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Target</label>
            <div className="flex space-x-2">
              <input
                type="number"
                value={formData.target}
                onChange={(e) => setFormData({...formData, target: parseInt(e.target.value)})}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                min="1"
                required
              />
              <select
                value={formData.frequency}
                onChange={(e) => setFormData({...formData, frequency: e.target.value})}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="daily">per day</option>
                <option value="weekly">per week</option>
                <option value="monthly">per month</option>
              </select>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              <strong>Reminder:</strong> "And whoever relies upon Allah - then He is sufficient for him. Indeed, Allah will accomplish His purpose." - Quran 65:3
            </p>
          </div>

          <div className="flex space-x-3 pt-2">
            <button
              type="submit"
              disabled={!formData.title.trim()}
              className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              Create Goal
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

export default AddGoalForm;