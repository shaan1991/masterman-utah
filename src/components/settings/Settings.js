// ===== src/components/settings/Settings.js =====
import React from 'react';
import { Bell, Shield, User, Info, LogOut } from 'lucide-react';
import NotificationSettings from './NotificationSettings';
import PrivacySettings from './PrivacySettings';
import { useAuth } from '../../contexts/AuthContext';
import { useAuthActions } from '../../hooks/useAuth';

const Settings = () => {
  const { user } = useAuth();
  const { signOut } = useAuthActions();
  
  const settingsSections = [
    {
      title: 'Account',
      icon: User,
      items: [
        { label: 'Profile Information', action: 'profile' },
        { label: 'Contact Preferences', action: 'contact_prefs' }
      ]
    },
    {
      title: 'Notifications',
      icon: Bell,
      items: [
        { label: 'Push Notifications', action: 'notifications' },
        { label: 'Email Updates', action: 'email' }
      ]
    },
    {
      title: 'Privacy',
      icon: Shield,
      items: [
        { label: 'Data Sharing', action: 'privacy' },
        { label: 'Visibility Settings', action: 'visibility' }
      ]
    },
    {
      title: 'About',
      icon: Info,
      items: [
        { label: 'App Version', action: 'version' },
        { label: 'Terms of Service', action: 'terms' },
        { label: 'Privacy Policy', action: 'policy' }
      ]
    }
  ];

  const handleSignOut = async () => {
    if (window.confirm('Are you sure you want to sign out?')) {
      await signOut();
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-gray-800">Settings</h2>
        <p className="text-sm text-gray-600 mt-1">Manage your brotherhood app preferences</p>
      </div>

      {/* User Profile Card */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center">
            <span className="text-white font-semibold">
              {user?.displayName?.split(' ').map(n => n[0]).join('') || 'U'}
            </span>
          </div>
          <div>
            <h3 className="font-medium text-gray-800">
              {user?.displayName || 'Anonymous User'}
            </h3>
            <p className="text-sm text-gray-600">{user?.email}</p>
          </div>
        </div>
      </div>

      {/* Settings Sections */}
      <div className="space-y-4">
        {settingsSections.map((section, sectionIndex) => {
          const Icon = section.icon;
          return (
            <div key={sectionIndex} className="bg-white rounded-lg shadow-sm border">
              <div className="p-4 border-b">
                <div className="flex items-center space-x-2">
                  <Icon className="w-5 h-5 text-gray-600" />
                  <h3 className="font-semibold text-gray-800">{section.title}</h3>
                </div>
              </div>
              <div className="divide-y">
                {section.items.map((item, itemIndex) => (
                  <button
                    key={itemIndex}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors"
                    onClick={() => {
                      // Handle setting action
                      console.log(`Clicked: ${item.action}`);
                    }}
                  >
                    <span className="text-sm text-gray-700">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Notification Settings Component */}
      <NotificationSettings />
      
      {/* Privacy Settings Component */}
      <PrivacySettings />

      {/* Sign Out */}
      <div className="bg-white rounded-lg shadow-sm border">
        <button
          onClick={handleSignOut}
          className="w-full p-4 flex items-center space-x-3 text-red-600 hover:bg-red-50 transition-colors rounded-lg"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Sign Out</span>
        </button>
      </div>

      {/* App Info */}
      <div className="text-center text-xs text-gray-500 space-y-1">
        <p>Brotherhood Connection Manager</p>
        <p>Version 1.0.0</p>
        <p>Built with ❤️ for the Ummah</p>
      </div>
    </div>
  );
};

export default Settings;