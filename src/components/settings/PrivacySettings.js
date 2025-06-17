import React, { useState } from 'react';
import { Shield, Eye, EyeOff, Lock } from 'lucide-react';

const PrivacySettings = () => {
  const [privacy, setPrivacy] = useState({
    profileVisibility: 'brothers_only',
    lastSeenVisibility: 'brothers_only',
    duaRequestsVisibility: 'brothers_only',
    goalsVisibility: 'private',
    contactInfoVisibility: 'brothers_only',
    allowDirectMessages: true,
    shareWithStrava: false
  });

  const handleChange = (key, value) => {
    setPrivacy(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const visibilityOptions = [
    { value: 'private', label: 'Only Me', icon: Lock },
    { value: 'brothers_only', label: 'Brotherhood Only', icon: Eye },
    { value: 'public', label: 'Public', icon: EyeOff }
  ];

  const privacySettings = [
    {
      key: 'profileVisibility',
      title: 'Profile Information',
      description: 'Who can see your basic profile information'
    },
    {
      key: 'lastSeenVisibility',
      title: 'Last Seen',
      description: 'Who can see when you were last active'
    },
    {
      key: 'duaRequestsVisibility',
      title: 'Dua Requests',
      description: 'Who can see your prayer requests'
    },
    {
      key: 'goalsVisibility',
      title: 'Spiritual Goals',
      description: 'Who can see your spiritual goals and progress'
    },
    {
      key: 'contactInfoVisibility',
      title: 'Contact Information',
      description: 'Who can see your phone number and email'
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="p-4 border-b">
        <div className="flex items-center space-x-2">
          <Shield className="w-5 h-5 text-gray-600" />
          <h3 className="font-semibold text-gray-800">Privacy Settings</h3>
        </div>
      </div>
      
      <div className="p-4 space-y-6">
        {/* Visibility Settings */}
        <div className="space-y-4">
          {privacySettings.map((setting) => (
            <div key={setting.key}>
              <div className="mb-2">
                <p className="font-medium text-gray-800 text-sm">{setting.title}</p>
                <p className="text-xs text-gray-600">{setting.description}</p>
              </div>
              
              <div className="flex space-x-2">
                {visibilityOptions.map((option) => {
                  const Icon = option.icon;
                  const isSelected = privacy[setting.key] === option.value;
                  return (
                    <button
                      key={option.value}
                      onClick={() => handleChange(setting.key, option.value)}
                      className={`flex items-center space-x-2 px-3 py-2 rounded-md text-xs border transition-colors ${
                        isSelected
                          ? 'bg-green-100 text-green-700 border-green-300'
                          : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className="w-3 h-3" />
                      <span>{option.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Toggle Settings */}
        <div className="space-y-4 pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-800 text-sm">Allow Direct Messages</p>
              <p className="text-xs text-gray-600">Let brothers send you private messages</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={privacy.allowDirectMessages}
                onChange={(e) => handleChange('allowDirectMessages', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
            </label>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-800 text-sm">Share with Strava</p>
              <p className="text-xs text-gray-600">Allow fitness data to be shared with the brotherhood</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={privacy.shareWithStrava}
                onChange={(e) => handleChange('shareWithStrava', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
            </label>
          </div>
        </div>

        {/* Data Management */}
        <div className="pt-4 border-t border-gray-100 space-y-3">
          <h4 className="font-medium text-gray-800 text-sm">Data Management</h4>
          
          <button className="w-full text-left p-3 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors">
            <p className="text-sm font-medium text-blue-800">Export My Data</p>
            <p className="text-xs text-blue-700">Download a copy of all your data</p>
          </button>
          
          <button className="w-full text-left p-3 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors">
            <p className="text-sm font-medium text-red-800">Delete Account</p>
            <p className="text-xs text-red-700">Permanently delete your account and all data</p>
          </button>
        </div>

        <div className="pt-3 border-t border-gray-100">
          <p className="text-xs text-gray-500">
            Your privacy is important to us. We follow Islamic principles of confidentiality and trust. 
            Data is encrypted and only shared according to your preferences.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PrivacySettings;