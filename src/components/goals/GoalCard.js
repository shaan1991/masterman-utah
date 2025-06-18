// src/components/goals/GoalCard.js
import React, { useState, useEffect } from 'react';
import { CheckCircle, Star, Clock, Edit, Trash2 } from 'lucide-react';
import { useNotifications } from '../../contexts/NotificationContext';
import { formatDate } from '../../utils/dateHelpers';

const GoalCard = ({ goal, onUpdate }) => {
  const { createGoalReminderNotification } = useNotifications();
  const [showActions, setShowActions] = useState(false);
  
  const progressPercentage = Math.min((goal.progress / goal.target) * 100, 100);
  const isCompleted = goal.progress >= goal.target;
  
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

  const handleMarkComplete = () => {
    if (goal.progress < goal.target) {
      const updatedGoal = {
        ...goal,
        progress: goal.progress + 1,
        lastCompleted: new Date(),
        streak: goal.streak + 1
      };
      
      onUpdate(updatedGoal);
      
      // If goal is now completed, create celebration notification
      if (updatedGoal.progress >= updatedGoal.target) {
        createGoalReminderNotification({
          ...updatedGoal,
          title: `🎉 Goal Completed: ${updatedGoal.title}`,
          type: 'goal_completed'
        });
      }
    }
  };

  const handleReset = () => {
    onUpdate({
      ...goal,
      progress: 0,
      streak: 0
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <span className="text-2xl">{getGoalIcon(goal.type)}</span>
          <div>
            <h4 className="font-medium text-gray-800">{goal.title}</h4>
            <p className="text-sm text-gray-600">{goal.description}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {goal.streak > 0 && (
            <div className="flex items-center space-x-1 text-yellow-600">
              <Star className="w-4 h-4" />
              <span className="text-sm font-medium">{goal.streak}</span>
            </div>
          )}
          <button
            onClick={() => setShowActions(!showActions)}
            className="p-1 text-gray-400 hover:text-gray-600"
          >
            <Edit className="w-4 h-4" />
          </button>
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
              className="bg-green-600 text-white px-3 py-1 rounded-md text-sm hover:bg-green-700 flex items-center space-x-1"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Complete</span>
            </button>
          )}
          
          {showActions && (
            <button
              onClick={handleReset}
              className="bg-gray-100 text-gray-600 px-3 py-1 rounded-md text-sm hover:bg-gray-200 flex items-center space-x-1"
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