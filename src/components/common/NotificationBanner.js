// ===== src/components/common/NotificationBanner.js =====
import React, { useState, useEffect } from 'react';
import { X, Bell, Heart, Calendar, Target } from 'lucide-react';
import { useNotifications } from '../../contexts/NotificationContext';

const NotificationBanner = () => {
  const { notifications, markAsRead, getUnreadCount } = useNotifications();
  const [showBanner, setShowBanner] = useState(false);
  const [currentNotification, setCurrentNotification] = useState(null);

  useEffect(() => {
    const unreadNotifications = notifications.filter(n => !n.read);
    if (unreadNotifications.length > 0) {
      setCurrentNotification(unreadNotifications[0]);
      setShowBanner(true);
    }
  }, [notifications]);

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'dua_request': return <Heart className="w-5 h-5 text-red-500" />;
      case 'contact_reminder': return <Bell className="w-5 h-5 text-blue-500" />;
      case 'goal_reminder': return <Target className="w-5 h-5 text-green-500" />;
      case 'announcement': return <Calendar className="w-5 h-5 text-purple-500" />;
      default: return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  const handleDismiss = () => {
    if (currentNotification) {
      markAsRead(currentNotification.id);
    }
    setShowBanner(false);
  };

  if (!showBanner || !currentNotification) {
    return null;
  }

  return (
    <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-4">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          {getNotificationIcon(currentNotification.type)}
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-blue-800">
            {currentNotification.title}
          </h3>
          <p className="text-sm text-blue-700 mt-1">
            {currentNotification.body}
          </p>
        </div>
        <div className="ml-auto pl-3">
          <button
            onClick={handleDismiss}
            className="text-blue-400 hover:text-blue-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationBanner;