// ===== src/components/goals/GoalTracking.js =====
import React, { useState } from 'react';
import { Plus, Target, Calendar, TrendingUp } from 'lucide-react';
import GoalCard from './GoalCard';
import StravaIntegration from './StravaIntegration';
import { GOAL_TYPES } from '../../utils/constants';

const GoalTracking = () => {
  const [goals, setGoals] = useState([
    {
      id: '1',
      type: GOAL_TYPES.QURAN,
      title: 'Daily Quran Reading',
      description: 'Read 2 pages of Quran daily',
      target: 14, // pages per week
      progress: 10,
      streak: 5,
      lastCompleted: new Date(),
      createdAt: new Date('2025-06-01')
    },
    {
      id: '2',
      type: GOAL_TYPES.DHIKR,
      title: 'Morning Adhkar',
      description: 'Complete morning remembrance daily',
      target: 7, // days per week
      progress: 5,
      streak: 3,
      lastCompleted: new Date(),
      createdAt: new Date('2025-06-01')
    },
    {
      id: '3',
      type: GOAL_TYPES.SALAH,
      title: 'Tahajjud Prayer',
      description: 'Wake for night prayer 3 times per week',
      target: 3,
      progress: 2,
      streak: 1,
      lastCompleted: new Date('2025-06-16'),
      createdAt: new Date('2025-06-10')
    }
  ]);

  const [showAddForm, setShowAddForm] = useState(false);

  const weeklyStats = {
    totalGoals: goals.length,
    completedGoals: goals.filter(g => g.progress >= g.target).length,
    averageProgress: Math.round(goals.reduce((acc, g) => acc + (g.progress / g.target * 100), 0) / goals.length),
    longestStreak: Math.max(...goals.map(g => g.streak))
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-800">Spiritual Goals</h2>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-green-600 text-white p-2 rounded-full hover:bg-green-700"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {/* Weekly Overview */}
      <div className="bg-gradient-to-r from-green-500 to-blue-500 text-white p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">This Week's Progress</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold">{weeklyStats.completedGoals}/{weeklyStats.totalGoals}</p>
            <p className="text-sm opacity-90">Goals Completed</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">{weeklyStats.averageProgress}%</p>
            <p className="text-sm opacity-90">Average Progress</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white p-3 rounded-lg shadow-sm border text-center">
          <Target className="w-6 h-6 text-blue-600 mx-auto mb-1" />
          <p className="text-lg font-bold text-gray-800">{goals.length}</p>
          <p className="text-xs text-gray-600">Active Goals</p>
        </div>
        <div className="bg-white p-3 rounded-lg shadow-sm border text-center">
          <Calendar className="w-6 h-6 text-green-600 mx-auto mb-1" />
          <p className="text-lg font-bold text-gray-800">{weeklyStats.longestStreak}</p>
          <p className="text-xs text-gray-600">Best Streak</p>
        </div>
        <div className="bg-white p-3 rounded-lg shadow-sm border text-center">
          <TrendingUp className="w-6 h-6 text-purple-600 mx-auto mb-1" />
          <p className="text-lg font-bold text-gray-800">{weeklyStats.averageProgress}%</p>
          <p className="text-xs text-gray-600">This Week</p>
        </div>
      </div>

      {/* Goals List */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800">Your Goals</h3>
        {goals.map(goal => (
          <GoalCard 
            key={goal.id} 
            goal={goal}
            onUpdate={(updatedGoal) => {
              setGoals(goals.map(g => g.id === updatedGoal.id ? updatedGoal : g));
            }}
          />
        ))}
      </div>

      {/* Strava Integration */}
      <StravaIntegration />

      {/* Inspirational Quote */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="text-center">
          <p className="text-sm text-gray-700 italic mb-2">
            "And whoever relies upon Allah - then He is sufficient for him. 
            Indeed, Allah will accomplish His purpose."
          </p>
          <p className="text-xs text-gray-500">- Quran 65:3</p>
        </div>
      </div>
    </div>
  );
};

export default GoalTracking;