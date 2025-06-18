import React, { useState, useEffect } from 'react';
import { Plus, Target, Calendar, TrendingUp } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useSubcollection } from '../../hooks/useFirestore';
import { addDoc, collection, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import GoalCard from './GoalCard';
import AddGoalForm from './AddGoalForm';
import StravaIntegration from './StravaIntegration';

const GoalTracking = () => {
  const { user } = useAuth();
  const [showAddForm, setShowAddForm] = useState(false);
  const [error, setError] = useState(null);

  // Use real Firestore data
  const { documents: goals, loading, error: firestoreError } = useSubcollection(
    user ? `users/${user.uid}` : null,
    'goals',
    [] // We can add orderBy or other constraints here
  );

  useEffect(() => {
    if (firestoreError) {
      setError(firestoreError);
    }
  }, [firestoreError]);

  const handleAddGoal = async (goalData) => {
    if (!user) return;
    
    try {
      await addDoc(collection(db, 'users', user.uid, 'goals'), {
        ...goalData,
        progress: 0,
        streak: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      setShowAddForm(false);
      setError(null);
    } catch (err) {
      setError('Failed to create goal: ' + err.message);
    }
  };

  const handleUpdateGoal = async (goalId, updateData) => {
    if (!user) return;
    
    try {
      await updateDoc(doc(db, 'users', user.uid, 'goals', goalId), {
        ...updateData,
        updatedAt: new Date()
      });
      setError(null);
    } catch (err) {
      setError('Failed to update goal: ' + err.message);
    }
  };

  const handleDeleteGoal = async (goalId) => {
    if (!user) return;
    
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'goals', goalId));
      setError(null);
    } catch (err) {
      setError('Failed to delete goal: ' + err.message);
    }
  };

  const calculateWeeklyStats = () => {
    if (!goals.length) return { totalGoals: 0, completedGoals: 0, averageProgress: 0, longestStreak: 0 };
    
    const totalGoals = goals.length;
    const completedGoals = goals.filter(g => g.progress >= g.target).length;
    const averageProgress = Math.round(goals.reduce((acc, g) => acc + (g.progress / g.target * 100), 0) / goals.length);
    const longestStreak = Math.max(...goals.map(g => g.streak || 0), 0);

    return { totalGoals, completedGoals, averageProgress, longestStreak };
  };

  const weeklyStats = calculateWeeklyStats();

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          <span className="ml-3 text-gray-600">Loading goals...</span>
        </div>
      </div>
    );
  }

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

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Weekly Overview */}
      <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white p-4 rounded-lg">
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
        {goals.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm border">
            <Target className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No goals set yet</p>
            <p className="text-sm text-gray-400 mt-1">Create your first spiritual goal to start tracking progress</p>
            <button
              onClick={() => setShowAddForm(true)}
              className="mt-4 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
            >
              Add Your First Goal
            </button>
          </div>
        ) : (
          goals.map(goal => (
            <GoalCard 
              key={goal.id} 
              goal={goal}
              onUpdate={(updateData) => handleUpdateGoal(goal.id, updateData)}
              onDelete={() => handleDeleteGoal(goal.id)}
            />
          ))
        )}
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

      {/* Add Goal Form Modal */}
      {showAddForm && (
        <AddGoalForm
          onClose={() => setShowAddForm(false)}
          onSave={handleAddGoal}
        />
      )}
    </div>
  );
};

export default GoalTracking;