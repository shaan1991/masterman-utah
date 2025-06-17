// ===== src/components/goals/GoalCard.js =====
import React, { useState } from 'react';
import { CheckCircle, Star, Clock, Edit, Trash2 } from 'lucide-react';
import { formatDate } from '../../utils/dateHelpers';

const GoalCard = ({ goal, onUpdate }) => {
  const [showActions, setShowActions] = useState(false);
  
  const progressPercentage = Math.min((goal.progress / goal.target) * 100, 100);
  const isCompleted = goal.progress >= goal.target;
  
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
      onUpdate({
        ...goal,
        progress: goal.progress + 1,
        lastCompleted: new Date(),
        streak: goal.streak + 1
      });
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
          ></div>
        </div>
      </div>

      {/* Status and Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Clock className="w-3 h-3" />
          <span>
            {goal.lastCompleted 
              ? `Last: ${formatDate(goal.lastCompleted)}`
              : 'Not started'
            }
          </span>
        </div>
        
        <div className="flex space-x-2">
          {isCompleted ? (
            <div className="flex items-center space-x-1 text-green-600">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm font-medium">Completed!</span>
            </div>
          ) : (
            <button
              onClick={handleMarkComplete}
              className="bg-green-100 text-green-700 px-3 py-1 rounded-md text-sm hover:bg-green-200 transition-colors"
            >
              Mark Complete
            </button>
          )}
          
          {showActions && (
            <button
              onClick={handleReset}
              className="bg-gray-100 text-gray-600 px-3 py-1 rounded-md text-sm hover:bg-gray-200 transition-colors"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Completion Message */}
      {isCompleted && (
        <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-800 font-medium">
            Alhamdulillah! You've completed this week's goal.
          </p>
          <p className="text-xs text-green-700 mt-1">
            May Allah accept your efforts and increase you in good deeds.
          </p>
        </div>
      )}
    </div>
  );
};

export default GoalCard;