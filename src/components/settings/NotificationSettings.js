// ===== src/components/settings/NotificationSettings.js =====
import React, { useState } from 'react';
import { Bell, Clock, Heart, MessageSquare } from 'lucide-react';

const NotificationSettings = () => {
  const [notifications, setNotifications] = useState({
    weeklyReminders: true,
    duaRequests: true,
    announcements: false,
    goalReminders: true,
    urgentDuas: true,
    brotherUpdates: false
  });

  const handleToggle = (key) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
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
      icon: Bell,
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
                <Icon className={`w-5 h-5 ${option.color} mt-1`} />
                <div>
                  <p className="font-medium text-gray-800 text-sm">{option.title}</p>
                  <p className="text-xs text-gray-600 mt-1">{option.description}</p>
                </div>
              </div>
              
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifications[option.key]}
                  onChange={() => handleToggle(option.key)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
              </label>
            </div>
          );
        })}
        
        <div className="pt-3 border-t border-gray-100">
          <p className="text-xs text-gray-500">
            You can change these settings anytime. Critical notifications like urgent dua requests 
            will always be delivered regardless of your preferences.
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotificationSettings;