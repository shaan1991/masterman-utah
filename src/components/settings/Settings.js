// ===== Updated src/components/settings/Settings.js =====
import React, { useState } from 'react';
import { User, Bell, Shield, LogOut, Cog, Share2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import ContactPreloadSection from './ContactPreloadSection';

const Settings = () => {
  const { user, signOut } = useAuth();
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
        navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`);
        alert('Invite link copied to clipboard!');
      }
    } catch (error) {
      console.log('Error sharing:', error);
    }
  };

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
      }
    } catch (error) {
      console.error('Settings: Unexpected logout error:', error);
      alert(`Unexpected error during logout: ${error.message}`);
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
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-4 border-b">
          <div className="flex items-center space-x-2">
            <User className="w-5 h-5 text-gray-600" />
            <h3 className="font-semibold text-gray-800">Profile</h3>
          </div>
        </div>
        <div className="p-4">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h4 className="font-medium text-gray-800">{profile.name}</h4>
              <p className="text-sm text-gray-600">{profile.email}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Preload Section - NEW */}
      <ContactPreloadSection />

      {/* Notifications Section */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-4 border-b">
          <div className="flex items-center space-x-2">
            <Bell className="w-5 h-5 text-gray-600" />
            <h3 className="font-semibold text-gray-800">Notifications</h3>
          </div>
        </div>
        <div className="p-4 space-y-4">
          {Object.entries(notifications).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-800 capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={value}
                  onChange={() => handleNotificationToggle(key)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Privacy Section */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-4 border-b">
          <div className="flex items-center space-x-2">
            <Shield className="w-5 h-5 text-gray-600" />
            <h3 className="font-semibold text-gray-800">Privacy</h3>
          </div>
        </div>
        <div className="p-4">
          <p className="text-sm text-gray-600">
            Your data is protected according to Islamic principles of privacy and confidentiality.
          </p>
        </div>
      </div>

      {/* Share Section */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-4 border-b">
          <div className="flex items-center space-x-2">
            <Share2 className="w-5 h-5 text-gray-600" />
            <h3 className="font-semibold text-gray-800">Share Brotherhood</h3>
          </div>
        </div>
        <div className="p-4">
          <button
            onClick={handleInvite}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            Invite Brothers to Join
          </button>
        </div>
      </div>

      {/* Sign Out Section */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-4">
          <button
            onClick={handleSignOut}
            disabled={isSigningOut}
            className="w-full bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
          >
            <LogOut className="w-4 h-4" />
            <span>{isSigningOut ? 'Signing Out...' : 'Sign Out'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
