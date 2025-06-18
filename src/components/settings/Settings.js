import React, { useState } from 'react';
import { User, Bell, Shield, LogOut, Cog, Share2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const Settings = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState({
    duaRequests: true,
    weeklyReminders: true,
    announcements: false
  });

  const [profile] = useState({
    name: user?.displayName || 'User',
    email: user?.email || 'No email'
  });

  const [isEditing, setIsEditing] = useState(false);

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

  const handleSignOut = () => {
    if (window.confirm('Are you sure you want to sign out?')) {
      // Handle sign out logic
      console.log('Signing out...');
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

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-800">Dua Requests</p>
              <p className="text-sm text-gray-600">Get notified of new prayer requests</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={notifications.duaRequests}
                onChange={() => handleNotificationToggle('duaRequests')}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-800">Weekly Reminders</p>
              <p className="text-sm text-gray-600">Reminders to contact brothers</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={notifications.weeklyReminders}
                onChange={() => handleNotificationToggle('weeklyReminders')}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-800">Announcements</p>
              <p className="text-sm text-gray-600">Brotherhood updates and news</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={notifications.announcements}
                onChange={() => handleNotificationToggle('announcements')}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
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

      {/* Sign Out */}
      <div className="bg-white rounded-lg shadow-sm border">
        <button
          onClick={handleSignOut}
          className="w-full p-4 flex items-center justify-center gap-3 text-red-600 hover:bg-red-50 transition-colors rounded-lg"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Sign Out</span>
        </button>
      </div>

      {/* App Info */}
      <div className="text-center text-sm text-gray-500">
        <p>Brotherhood App v1.0.0</p>
      </div>
    </div>
  );
};

export default Settings;