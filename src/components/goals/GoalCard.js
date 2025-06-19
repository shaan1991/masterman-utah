// src/components/goals/GoalCard.js
import React, { useState, useEffect } from 'react';
import { CheckCircle, Star, Clock, Edit, Trash2, Save, X, AlertTriangle } from 'lucide-react';
import { useNotifications } from '../../contexts/NotificationContext';
import { formatDate } from '../../utils/dateHelpers';

const GoalCard = ({ goal, onUpdate, onDelete }) => {
  const { createGoalReminderNotification } = useNotifications();
  const [showActions, setShowActions] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Edit form state
  const [editForm, setEditForm] = useState({
    title: goal.title || '',
    description: goal.description || '',
    type: goal.type || 'other',
    target: goal.target || 1,
    frequency: goal.frequency || 'daily'
  });
  
  // Validation state
  const [validationErrors, setValidationErrors] = useState({});
  
  const progressPercentage = Math.min((goal.progress / goal.target) * 100, 100);
  const isCompleted = goal.progress >= goal.target;
  
  // Reset edit form when goal changes or editing starts
  useEffect(() => {
    if (isEditing) {
      setEditForm({
        title: goal.title || '',
        description: goal.description || '',
        type: goal.type || 'other',
        target: goal.target || 1,
        frequency: goal.frequency || 'daily'
      });
      setValidationErrors({});
    }
  }, [isEditing, goal]);
  
  // Check if goal needs reminder notification
  useEffect(() => {
    const checkGoalReminder = () => {
      if (!goal.lastCompleted) return;
      
      const now = new Date();
      const lastCompleted = new Date(goal.lastCompleted);
      const hoursSinceLastActivity = (now - lastCompleted) / (1000 * 60 * 60);
      
      // Send reminder based on frequency
      let reminderThreshold = 24; // Default to daily
      if (goal.frequency === 'weekly') reminderThreshold = 168; // 7 days
      if (goal.frequency === 'monthly') reminderThreshold = 720; // 30 days
      
      if (hoursSinceLastActivity > reminderThreshold && !isCompleted) {
        createGoalReminderNotification(goal);
      }
    };
    
    // Check for reminders every hour when component mounts
    checkGoalReminder();
    const interval = setInterval(checkGoalReminder, 60 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [goal, isCompleted, createGoalReminderNotification]);
  
  const getGoalIcon = (type) => {
    switch (type) {
      case 'quran': return '📖';
      case 'dhikr': return '🤲';
      case 'salah': return '🕌';
      case 'charity': return '💝';
      case 'fasting': return '🌙';
      default: return '⭐';
    }
  };

  const goalTypes = [
    { value: 'quran', label: 'Quran Reading', icon: '📖' },
    { value: 'dhikr', label: 'Dhikr/Remembrance', icon: '🤲' },
    { value: 'salah', label: 'Prayer', icon: '🕌' },
    { value: 'charity', label: 'Charity', icon: '💝' },
    { value: 'fasting', label: 'Fasting', icon: '🌙' },
    { value: 'other', label: 'Other', icon: '⭐' }
  ];

  // Validation functions
  const validateForm = () => {
    const errors = {};
    
    // Title validation
    if (!editForm.title?.trim()) {
      errors.title = 'Title is required';
    } else if (editForm.title.trim().length < 3) {
      errors.title = 'Title must be at least 3 characters';
    } else if (editForm.title.trim().length > 100) {
      errors.title = 'Title must be less than 100 characters';
    }
    
    // Description validation
    if (editForm.description && editForm.description.length > 500) {
      errors.description = 'Description must be less than 500 characters';
    }
    
    // Target validation
    const target = parseInt(editForm.target);
    if (!target || target < 1) {
      errors.target = 'Target must be at least 1';
    } else if (target > 1000) {
      errors.target = 'Target cannot exceed 1000';
    } else if (target < goal.progress) {
      errors.target = `Target cannot be less than current progress (${goal.progress})`;
    }
    
    // Type validation
    if (!editForm.type || !goalTypes.find(t => t.value === editForm.type)) {
      errors.type = 'Please select a valid goal type';
    }
    
    // Frequency validation
    if (!editForm.frequency || !['daily', 'weekly', 'monthly'].includes(editForm.frequency)) {
      errors.frequency = 'Please select a valid frequency';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleMarkComplete = async () => {
    if (goal.progress >= goal.target || isUpdating) return;
    
    setIsUpdating(true);
    try {
      const updateData = {
        progress: goal.progress + 1,
        lastCompleted: new Date(),
        streak: goal.streak + 1
      };
      
      await onUpdate(updateData);
      
      // If goal is now completed, create celebration notification
      if (updateData.progress >= goal.target) {
        createGoalReminderNotification({
          ...goal,
          ...updateData,
          title: `🎉 Goal Completed: ${goal.title}`,
          type: 'goal_completed'
        });
      }
    } catch (error) {
      console.error('Error marking goal complete:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleReset = async () => {
    if (isUpdating) return;
    
    // Confirm reset if there's significant progress
    if (goal.progress > 0) {
      if (!window.confirm(`Are you sure you want to reset your progress? You'll lose ${goal.progress} completed units.`)) {
        return;
      }
    }
    
    setIsUpdating(true);
    try {
      await onUpdate({
        progress: 0,
        streak: 0,
        lastCompleted: null
      });
    } catch (error) {
      console.error('Error resetting goal:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleEditSubmit = async () => {
    if (!validateForm() || isUpdating) return;
    
    setIsUpdating(true);
    try {
      const updateData = {
        title: editForm.title.trim(),
        description: editForm.description?.trim() || '',
        type: editForm.type,
        target: parseInt(editForm.target),
        frequency: editForm.frequency
      };
      
      await onUpdate(updateData);
      setIsEditing(false);
      setShowActions(false);
    } catch (error) {
      console.error('Error updating goal:', error);
      setValidationErrors({ submit: 'Failed to update goal. Please try again.' });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleEditCancel = () => {
    setIsEditing(false);
    setValidationErrors({});
    // Reset form to original values
    setEditForm({
      title: goal.title || '',
      description: goal.description || '',
      type: goal.type || 'other',
      target: goal.target || 1,
      frequency: goal.frequency || 'daily'
    });
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
    setShowActions(false);
  };

  const handleDeleteConfirm = async () => {
    if (isDeleting) return;
    
    setIsDeleting(true);
    try {
      await onDelete();
    } catch (error) {
      console.error('Error deleting goal:', error);
      // Show error but don't close dialog
      alert('Failed to delete goal. Please try again.');
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false);
  };

  // Close actions menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showActions && !event.target.closest('.goal-actions-menu')) {
        setShowActions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showActions]);

  if (isEditing) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-gray-800">Edit Goal</h4>
            <div className="flex space-x-2">
              <button
                onClick={handleEditSubmit}
                disabled={isUpdating}
                className="bg-green-600 text-white px-3 py-1 rounded-md text-sm hover:bg-green-700 flex items-center space-x-1 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{isUpdating ? 'Saving...' : 'Save'}</span>
              </button>
              <button
                onClick={handleEditCancel}
                disabled={isUpdating}
                className="bg-gray-100 text-gray-600 px-3 py-1 rounded-md text-sm hover:bg-gray-200 flex items-center space-x-1 disabled:opacity-50"
              >
                <X className="w-4 h-4" />
                <span>Cancel</span>
              </button>
            </div>
          </div>

          {/* Title Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
            <input
              type="text"
              value={editForm.title}
              onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
              className={`w-full p-2 border rounded-md ${validationErrors.title ? 'border-red-300' : 'border-gray-300'}`}
              placeholder="Goal title"
              maxLength={100}
            />
            {validationErrors.title && (
              <p className="text-red-600 text-xs mt-1">{validationErrors.title}</p>
            )}
          </div>

          {/* Description Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={editForm.description}
              onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
              className={`w-full p-2 border rounded-md ${validationErrors.description ? 'border-red-300' : 'border-gray-300'}`}
              placeholder="Optional description"
              rows={2}
              maxLength={500}
            />
            {validationErrors.description && (
              <p className="text-red-600 text-xs mt-1">{validationErrors.description}</p>
            )}
          </div>

          {/* Type Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Goal Type *</label>
            <select
              value={editForm.type}
              onChange={(e) => setEditForm(prev => ({ ...prev, type: e.target.value }))}
              className={`w-full p-2 border rounded-md ${validationErrors.type ? 'border-red-300' : 'border-gray-300'}`}
            >
              {goalTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.icon} {type.label}
                </option>
              ))}
            </select>
            {validationErrors.type && (
              <p className="text-red-600 text-xs mt-1">{validationErrors.type}</p>
            )}
          </div>

          {/* Target and Frequency */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Target *</label>
              <input
                type="number"
                value={editForm.target}
                onChange={(e) => setEditForm(prev => ({ ...prev, target: e.target.value }))}
                className={`w-full p-2 border rounded-md ${validationErrors.target ? 'border-red-300' : 'border-gray-300'}`}
                min={goal.progress}
                max={1000}
              />
              {validationErrors.target && (
                <p className="text-red-600 text-xs mt-1">{validationErrors.target}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Frequency *</label>
              <select
                value={editForm.frequency}
                onChange={(e) => setEditForm(prev => ({ ...prev, frequency: e.target.value }))}
                className={`w-full p-2 border rounded-md ${validationErrors.frequency ? 'border-red-300' : 'border-gray-300'}`}
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
              {validationErrors.frequency && (
                <p className="text-red-600 text-xs mt-1">{validationErrors.frequency}</p>
              )}
            </div>
          </div>

          {/* Current Progress Info */}
          <div className="bg-blue-50 p-3 rounded-md">
            <p className="text-sm text-blue-700">
              <strong>Current Progress:</strong> {goal.progress}/{goal.target} completed
              {goal.streak > 0 && <span> • {goal.streak} day streak</span>}
            </p>
          </div>

          {/* Submit Error */}
          {validationErrors.submit && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <p className="text-red-600 text-sm">{validationErrors.submit}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border p-4 relative">
      {/* Delete Confirmation Overlay */}
      {showDeleteConfirm && (
        <div className="absolute inset-0 bg-white bg-opacity-95 rounded-lg flex items-center justify-center z-10">
          <div className="text-center p-4">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-3" />
            <h4 className="font-semibold text-gray-800 mb-2">Delete Goal?</h4>
            <p className="text-sm text-gray-600 mb-4">
              This will permanently delete "{goal.title}" and all its progress.
              {goal.progress > 0 && (
                <span className="block font-medium text-red-600 mt-1">
                  You'll lose {goal.progress} completed units!
                </span>
              )}
            </p>
            <div className="flex justify-center space-x-3">
              <button
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="bg-red-600 text-white px-4 py-2 rounded-md text-sm hover:bg-red-700 disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
              <button
                onClick={handleDeleteCancel}
                disabled={isDeleting}
                className="bg-gray-100 text-gray-600 px-4 py-2 rounded-md text-sm hover:bg-gray-200 disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <span className="text-2xl">{getGoalIcon(goal.type)}</span>
          <div>
            <h4 className="font-medium text-gray-800">{goal.title}</h4>
            {goal.description && (
              <p className="text-sm text-gray-600">{goal.description}</p>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {goal.streak > 0 && (
            <div className="flex items-center space-x-1 text-yellow-600">
              <Star className="w-4 h-4" />
              <span className="text-sm font-medium">{goal.streak}</span>
            </div>
          )}
          <div className="relative goal-actions-menu">
            <button
              onClick={() => setShowActions(!showActions)}
              className="p-1 text-gray-400 hover:text-gray-600"
            >
              <Edit className="w-4 h-4" />
            </button>
            
            {showActions && (
              <div className="absolute right-0 top-8 bg-white border rounded-md shadow-lg py-1 z-20 min-w-[120px]">
                <button
                  onClick={() => {
                    setIsEditing(true);
                    setShowActions(false);
                  }}
                  className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                >
                  <Edit className="w-4 h-4" />
                  <span>Edit Goal</span>
                </button>
                <button
                  onClick={handleDeleteClick}
                  className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete Goal</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-600">
            Progress: {goal.progress}/{goal.target}
          </span>
          <span className={`font-medium ${isCompleted ? 'text-green-600' : 'text-gray-600'}`}>
            {Math.round(progressPercentage)}%
          </span>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${
              isCompleted ? 'bg-green-500' : 'bg-blue-500'
            }`}
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {goal.lastCompleted && (
            <div className="flex items-center space-x-1 text-xs text-gray-500">
              <Clock className="w-3 h-3" />
              <span>Last: {formatDate(goal.lastCompleted)}</span>
            </div>
          )}
        </div>
        
        <div className="flex space-x-2">
          {!isCompleted && (
            <button
              onClick={handleMarkComplete}
              disabled={isUpdating}
              className="bg-green-600 text-white px-3 py-1 rounded-md text-sm hover:bg-green-700 flex items-center space-x-1 disabled:opacity-50"
            >
              <CheckCircle className="w-4 h-4" />
              <span>{isUpdating ? 'Completing...' : 'Complete'}</span>
            </button>
          )}
          
          {goal.progress > 0 && (
            <button
              onClick={handleReset}
              disabled={isUpdating}
              className="bg-gray-100 text-gray-600 px-3 py-1 rounded-md text-sm hover:bg-gray-200 flex items-center space-x-1 disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {isCompleted && (
        <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded-md">
          <p className="text-sm text-green-700 flex items-center space-x-1">
            <CheckCircle className="w-4 h-4" />
            <span>Alhamdulillah! Goal completed this period.</span>
          </p>
        </div>
      )}
    </div>
  );
};

export default GoalCard;