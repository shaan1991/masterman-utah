// src/components/brothers/EditBrotherForm.js
import React, { useState } from 'react';
import { User, Mail, Phone, MapPin, X } from 'lucide-react';

const EditBrotherForm = ({ brother, onSave, onClose, loading = false }) => {
  const [formData, setFormData] = useState({
    name: brother.name || '',
    email: brother.email || '',
    phone: brother.phone || '',
    location: brother.location || '',
    notes: brother.notes || '',
    preferences: {
      preferredContact: brother.preferences?.preferredContact || 'phone'
    }
  });

  const [errors, setErrors] = useState({});

  const handleChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (formData.email && !formData.email.includes('@')) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (formData.phone && formData.phone.length < 10) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Only include changed fields
    const updates = {};
    Object.keys(formData).forEach(key => {
      if (key === 'preferences') {
        if (formData.preferences.preferredContact !== brother.preferences?.preferredContact) {
          updates.preferences = formData.preferences;
        }
      } else if (formData[key] !== (brother[key] || '')) {
        updates[key] = formData[key];
      }
    });

    if (Object.keys(updates).length === 0) {
      onClose(); // No changes made
      return;
    }

    await onSave(updates);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Edit Brother Details</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Name Field */}
          <div>
            <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
              <User className="w-4 h-4" />
              <span>Name *</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="Brother's name"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                errors.name ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name}</p>
            )}
          </div>

          {/* Email Field */}
          <div>
            <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
              <Mail className="w-4 h-4" />
              <span>Email</span>
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="email@example.com"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                errors.email ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email}</p>
            )}
          </div>

          {/* Phone Field */}
          <div>
            <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
              <Phone className="w-4 h-4" />
              <span>Phone</span>
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              placeholder="+1 (555) 123-4567"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                errors.phone ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {errors.phone && (
              <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
            )}
          </div>

          {/* Location Field */}
          <div>
            <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
              <MapPin className="w-4 h-4" />
              <span>Location</span>
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => handleChange('location', e.target.value)}
              placeholder="City, State/Province"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          {/* Preferred Contact Method */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Preferred Contact Method
            </label>
            <select
              value={formData.preferences.preferredContact}
              onChange={(e) => handleChange('preferences.preferredContact', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="phone">Phone Call</option>
              <option value="text">Text Message</option>
              <option value="email">Email</option>
            </select>
          </div>

          {/* Notes Field */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              placeholder="Personal notes, family info, interests..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
              rows="3"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              disabled={loading || !formData.name.trim()}
              className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:opacity-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditBrotherForm;