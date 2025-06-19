// src/components/goals/GoalTracking.js - ENHANCED WITH DEBUG
import React, { useState, useEffect } from 'react';
import { Plus, Target, Calendar, TrendingUp } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useSubcollection } from '../../hooks/useFirestore';
import { addDoc, collection, updateDoc, doc, deleteDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../services/firebase';
import GoalCard from './GoalCard';
import AddGoalForm from './AddGoalForm';
import StravaIntegration from './StravaIntegration';

const GoalTracking = () => {
  const { user } = useAuth();
  const [showAddForm, setShowAddForm] = useState(false);
  const [error, setError] = useState(null);

  // Enhanced debugging
  useEffect(() => {
    console.log('GoalTracking: Component mounted');
    console.log('GoalTracking: User:', user ? { uid: user.uid, email: user.email } : 'No user');
  }, [user]);

  // Use real Firestore data with enhanced error handling
  const { documents: goals, loading, error: firestoreError } = useSubcollection(
    user ? `users/${user.uid}` : null,
    'goals',
    [] // We can add orderBy or other constraints here
  );

  useEffect(() => {
    if (firestoreError) {
      console.error('GoalTracking: Firestore error:', firestoreError);
      setError(`Firestore error: ${firestoreError}`);
    }
  }, [firestoreError]);

  const handleAddGoal = async (goalData) => {
    console.log('GoalTracking: handleAddGoal called with:', goalData);
    
    if (!user) {
      const errorMsg = 'User not authenticated';
      console.error('GoalTracking:', errorMsg);
      setError(errorMsg);
      return;
    }
    
    try {
      setError(null); // Clear any previous errors
      
      // Enhanced goal data with better validation
      const enhancedGoalData = {
        ...goalData,
        userId: user.uid, // Add user ID for security
        progress: 0,
        streak: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        // Ensure all required fields are present
        title: goalData.title?.trim() || 'Untitled Goal',
        description: goalData.description?.trim() || '',
        type: goalData.type || 'other',
        target: parseInt(goalData.target) || 1,
        frequency: goalData.frequency || 'daily'
      };
      
      console.log('GoalTracking: Adding goal to path:', `users/${user.uid}/goals`);
      console.log('GoalTracking: Enhanced goal data:', enhancedGoalData);
      
      const docRef = await addDoc(collection(db, 'users', user.uid, 'goals'), enhancedGoalData);
      
      console.log('GoalTracking: Goal added successfully with ID:', docRef.id);
      setShowAddForm(false);
      
    } catch (err) {
      console.error('GoalTracking: Error adding goal:', err);
      console.error('GoalTracking: Error code:', err.code);
      console.error('GoalTracking: Error message:', err.message);
      
      let userFriendlyError = 'Failed to create goal';
      
      if (err.code === 'permission-denied') {
        userFriendlyError = 'Permission denied. Please try signing out and back in.';
      } else if (err.code === 'unauthenticated') {
        userFriendlyError = 'Authentication expired. Please sign in again.';
      } else if (err.message) {
        userFriendlyError = `Error: ${err.message}`;
      }
      
      setError(userFriendlyError);
      alert(userFriendlyError); // Show immediate feedback
    }
  };

  const handleUpdateGoal = async (goalId, updateData) => {
    console.log('GoalTracking: handleUpdateGoal called:', { goalId, updateData });
    
    if (!user) {
      const errorMsg = 'User not authenticated';
      console.error('GoalTracking:', errorMsg);
      setError(errorMsg);
      return;
    }
    
    if (!goalId) {
      const errorMsg = 'Goal ID is required for update';
      console.error('GoalTracking:', errorMsg);
      setError(errorMsg);
      return;
    }

    try {
      setError(null); // Clear any previous errors
      
      // First, verify the document exists
      const goalRef = doc(db, 'users', user.uid, 'goals', goalId);
      console.log('GoalTracking: Checking if goal exists:', goalRef.path);
      
      const goalDoc = await getDoc(goalRef);
      
      if (!goalDoc.exists()) {
        throw new Error(`Goal document with ID ${goalId} does not exist`);
      }
      
      // Enhanced update data
      const enhancedUpdateData = {
        ...updateData,
        updatedAt: serverTimestamp()
      };
      
      console.log('GoalTracking: Updating goal with data:', enhancedUpdateData);
      
      // Proceed with update
      await updateDoc(goalRef, enhancedUpdateData);
      
      console.log('GoalTracking: Successfully updated goal', goalId);
    } catch (err) {
      console.error('GoalTracking: Error updating goal:', err);
      setError(`Failed to update goal: ${err.message}`);
    }
  };

  const handleDeleteGoal = async (goalId) => {
    console.log('GoalTracking: handleDeleteGoal called:', goalId);
    
    if (!user) {
      const errorMsg = 'User not authenticated';
      console.error('GoalTracking:', errorMsg);
      setError(errorMsg);
      return;
    }
    
    if (!goalId) {
      const errorMsg = 'Goal ID is required for deletion';
      console.error('GoalTracking:', errorMsg);
      setError(errorMsg);
      return;
    }

    try {
      setError(null); // Clear any previous errors
      
      // First, verify the document exists
      const goalRef = doc(db, 'users', user.uid, 'goals', goalId);
      console.log('GoalTracking: Checking if goal exists before deletion:', goalRef.path);
      
      const goalDoc = await getDoc(goalRef);
      
      if (!goalDoc.exists()) {
        throw new Error(`Goal document with ID ${goalId} does not exist`);
      }
      
      console.log('GoalTracking: Deleting goal:', goalId);
      await deleteDoc(goalRef);
      console.log('GoalTracking: Successfully deleted goal', goalId);
    } catch (err) {
      console.error('GoalTracking: Error deleting goal:', err);
      setError(`Failed to delete goal: ${err.message}`);
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

  // Enhanced loading state
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
        <div className="text-center text-sm text-gray-500">Loading goals...</div>
      </div>
    );
  }

  // Enhanced error display
  if (error) {
    return (
      <div className="space-y-6 p-4">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
          <button
            onClick={() => setError(null)}
            className="absolute top-0 bottom-0 right-0 px-4 py-3"
          >
            <span className="sr-only">Dismiss</span>
            ×
          </button>
        </div>
        <div className="text-center">
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4">
     

      {/* Error Banner */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
          <span className="block sm:inline">{error}</span>
          <button
            onClick={() => setError(null)}
            className="absolute top-0 bottom-0 right-0 px-4 py-3"
          >
            ×
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Goal Tracking</h2>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-green-600 text-white p-2 rounded-full hover:bg-green-700 transition-colors"
          title="Add new goal"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {/* Weekly Progress Card */}
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