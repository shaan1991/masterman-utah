// src/components/settings/Settings.js - FIXED WITH WORKING LOGOUT
import React, { useState } from 'react';
import { User, Bell, Shield, LogOut, Cog, Share2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const Settings = () => {
  const { user, signOut } = useAuth(); // FIXED: Now getting signOut from context
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [notifications, setNotifications] = useState({
    duaRequests: true,
    weeklyReminders: true,
    announcements: false
  });

  const [profile] = useState({
    name: user?.displayName || 'User',
    email: user?.email || 'No email'
  });

  const handleNotificationToggle = (key) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleInvite = async () => {
    const shareData = {
      title: 'Join our Brotherhood App',
      text: 'Connect with your brothers in faith through our Brotherhood app. Stay in touch, share dua requests, and strengthen our bonds.',
      url: window.location.origin
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback for browsers that don't support Web Share API
        navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`);
        alert('Invite link copied to clipboard!');
      }
    } catch (error) {
      console.log('Error sharing:', error);
    }
  };

  // BULLETPROOF LOGOUT HANDLER
  const handleSignOut = async () => {
    if (!window.confirm('Are you sure you want to sign out?')) {
      return;
    }

    console.log('Settings: User confirmed logout');
    setIsSigningOut(true);

    try {
      console.log('Settings: Calling signOut function');
      const result = await signOut();
      
      if (result && result.error) {
        console.error('Settings: Logout error:', result.error);
        alert(`Logout failed: ${result.error}`);
      } else {
        console.log('Settings: Logout successful');
        // Page will reload automatically from AuthContext
      }
    } catch (error) {
      console.error('Settings: Unexpected logout error:', error);
      alert(`Unexpected error during logout: ${error.message}`);
      
      // Force reload as fallback
      window.location.reload();
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center justify-center gap-2">
          <Cog className="w-6 h-6" />
          Settings
        </h1>
      </div>

      {/* Profile Section */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-800">Profile</h2>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <p className="text-gray-800">{profile.name}</p>
            <p className="text-xs text-gray-500 mt-1">From Google account</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <p className="text-gray-800">{profile.email}</p>
            <p className="text-xs text-gray-500 mt-1">From Google account</p>
          </div>
        </div>
      </div>

      {/* Notifications Section */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center gap-2 mb-4">
          <Bell className="w-5 h-5 text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-800">Notifications</h2>
        </div>

        <div className="space-y-3">
          {Object.entries(notifications).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-800 capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </p>
                <p className="text-xs text-gray-600">
                  {key === 'duaRequests' && 'Get notified of new dua requests'}
                  {key === 'weeklyReminders' && 'Weekly brotherhood check-ins'}
                  {key === 'announcements' && 'New announcement notifications'}
                </p>
              </div>
              <button
                onClick={() => handleNotificationToggle(key)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${
                  value ? 'bg-green-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    value ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Privacy Section */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-5 h-5 text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-800">Privacy</h2>
        </div>

        <div className="space-y-3">
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-sm font-medium text-gray-800">Profile Visibility</p>
            <p className="text-xs text-gray-600 mt-1">Your profile is visible to brotherhood members only</p>
          </div>
          
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-sm font-medium text-gray-800">Contact Information</p>
            <p className="text-xs text-gray-600 mt-1">Phone and email are shared with verified brothers only</p>
          </div>

          {/* FIXED LOGOUT BUTTON */}
          <button
            onClick={handleSignOut}
            disabled={isSigningOut}
            className={`w-full p-3 flex items-center justify-center gap-2 text-red-600 hover:bg-red-50 border border-red-200 rounded-lg transition-colors mt-4 ${
              isSigningOut ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm font-medium">
              {isSigningOut ? 'Signing Out...' : 'Sign Out'}
            </span>
          </button>
        </div>
      </div>

      {/* Invite Section */}
      <div className="bg-white rounded-lg shadow-sm border">
        <button
          onClick={handleInvite}
          className="w-full p-4 flex items-center justify-center gap-3 text-blue-600 hover:bg-blue-50 transition-colors rounded-lg"
        >
          <Share2 className="w-5 h-5" />
          <span className="font-medium">Invite Brothers</span>
        </button>
      </div>

      {/* App Info */}
      <div className="text-center text-sm text-gray-500">
        <p>Brotherhood App v1.0.0</p>
        <p className="text-xs mt-1">May Allah bless our brotherhood</p>
      </div>
    </div>
  );
};

export default Settings;