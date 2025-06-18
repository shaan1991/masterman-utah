// src/components/settings/NotificationSettings.js
import React from 'react';
import { Bell, Clock, Heart, MessageSquare, Target } from 'lucide-react';
import { useNotifications } from '../../contexts/NotificationContext';

const NotificationSettings = () => {
  const { settings, updateSettings } = useNotifications();

  const handleToggle = (key) => {
    updateSettings({
      ...settings,
      [key]: !settings[key]
    });
  };

  const notificationOptions = [
    {
      key: 'weeklyReminders',
      icon: Clock,
      title: 'Weekly Contact Reminders',
      description: 'Get reminded to contact brothers you haven\'t spoken to recently',
      color: 'text-blue-600'
    },
    {
      key: 'duaRequests',
      icon: Heart,
      title: 'New Dua Requests',
      description: 'Notifications when brothers share prayer requests',
      color: 'text-red-600'
    },
    {
      key: 'urgentDuas',
      icon: Heart,
      title: 'Urgent Dua Requests',
      description: 'Priority notifications for urgent prayer requests',
      color: 'text-red-700'
    },
    {
      key: 'announcements',
      icon: MessageSquare,
      title: 'Brotherhood Announcements',
      description: 'Updates and news from the brotherhood',
      color: 'text-green-600'
    },
    {
      key: 'goalReminders',
      icon: Target,
      title: 'Spiritual Goal Reminders',
      description: 'Reminders for your daily spiritual goals',
      color: 'text-purple-600'
    },
    {
      key: 'brotherUpdates',
      icon: MessageSquare,
      title: 'Brother Life Updates',
      description: 'Personal announcements from brothers',
      color: 'text-yellow-600'
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="p-4 border-b">
        <div className="flex items-center space-x-2">
          <Bell className="w-5 h-5 text-gray-600" />
          <h3 className="font-semibold text-gray-800">Notification Preferences</h3>
        </div>
      </div>
      
      <div className="p-4 space-y-4">
        {notificationOptions.map((option) => {
          const Icon = option.icon;
          return (
            <div key={option.key} className="flex items-start justify-between">
              <div className="flex items-start space-x-3 flex-1">
                <Icon className={`w-5 h-5 ${option.color} mt-0.5`} />
                <div>
                  <h4 className="text-sm font-medium text-gray-800">{option.title}</h4>
                  <p className="text-xs text-gray-600 mt-1">{option.description}</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings[option.key]}
                  onChange={() => handleToggle(option.key)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default NotificationSettings;