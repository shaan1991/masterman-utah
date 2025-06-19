// src/components/goals/GoalTracking.js
import React, { useState, useEffect } from 'react';
import { Plus, Target, Calendar, TrendingUp } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useSubcollection } from '../../hooks/useFirestore';
import { addDoc, collection, updateDoc, doc, deleteDoc, getDoc } from 'firebase/firestore';
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
    if (!user) {
      setError('User not authenticated');
      return;
    }
    
    try {
      setError(null); // Clear any previous errors
      await addDoc(collection(db, 'users', user.uid, 'goals'), {
        ...goalData,
        progress: 0,
        streak: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      setShowAddForm(false);
    } catch (err) {
      console.error('Error adding goal:', err);
      setError('Failed to create goal: ' + err.message);
    }
  };

  const handleUpdateGoal = async (goalId, updateData) => {
    if (!user) {
      setError('User not authenticated');
      return;
    }
    
    if (!goalId) {
      setError('Goal ID is required for update');
      return;
    }

    try {
      setError(null); // Clear any previous errors
      
      // First, verify the document exists
      const goalRef = doc(db, 'users', user.uid, 'goals', goalId);
      const goalDoc = await getDoc(goalRef);
      
      if (!goalDoc.exists()) {
        throw new Error(`Goal document with ID ${goalId} does not exist`);
      }
      
      // Proceed with update
      await updateDoc(goalRef, {
        ...updateData,
        updatedAt: new Date()
      });
      
      console.log(`Successfully updated goal ${goalId}`);
    } catch (err) {
      console.error('Error updating goal:', err);
      setError('Failed to update goal: ' + err.message);
    }
  };

  const handleDeleteGoal = async (goalId) => {
    if (!user) {
      setError('User not authenticated');
      return;
    }
    
    if (!goalId) {
      setError('Goal ID is required for deletion');
      return;
    }

    try {
      setError(null); // Clear any previous errors
      
      // First, verify the document exists
      const goalRef = doc(db, 'users', user.uid, 'goals', goalId);
      const goalDoc = await getDoc(goalRef);
      
      if (!goalDoc.exists()) {
        throw new Error(`Goal document with ID ${goalId} does not exist`);
      }
      
      await deleteDoc(goalRef);
      console.log(`Successfully deleted goal ${goalId}`);
    } catch (err) {
      console.error('Error deleting goal:', err);
      setError('Failed to delete goal: ' + err.message);
    }
  };

  const calculateWeeklyStats = () => {
    if (!goals.length) return { totalGoals: 0, completedGoals: 0, averageProgress: 0, longestStreak: 0 };
    
    const totalGoals = goals.length;
    const completedGoals = goals.filter(g => g.progress >= g.target).length;
    const averageProgress = Math.round(goals.reduce((acc, goal) => acc + (goal.progress / goal.target) * 100, 0) / goals.length);
    const longestStreak = Math.max(...goals.map(g => g.streak || 0), 0);
    
    return {
      totalGoals,
      completedGoals,
      averageProgress,
      longestStreak
    };
  };

  const weeklyStats = calculateWeeklyStats();

  if (loading) {
    return (
      <div className="space-y-6 p-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Spiritual Goals</h2>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Add Goal</span>
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
            <div className="ml-auto pl-3">
              <button
                onClick={() => setError(null)}
                className="inline-flex text-red-400 hover:text-red-600"
              >
                <span className="sr-only">Dismiss</span>
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Weekly Overview */}
      <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-lg p-6 text-white">
        <h3 className="text-lg font-semibold mb-4">This Week's Progress</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <p className="text-3xl font-bold">{weeklyStats.completedGoals}/{weeklyStats.totalGoals}</p>
            <p className="text-sm opacity-90">Goals Completed</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold">{weeklyStats.averageProgress}%</p>
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