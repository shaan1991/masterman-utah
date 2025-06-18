// src/components/common/NotificationBanner.js
import React, { useState, useEffect } from 'react';
import { X, Bell, Heart, Calendar, Target, Clock, MessageSquare } from 'lucide-react';
import { useNotifications } from '../../contexts/NotificationContext';

const NotificationBanner = () => {
  const { notifications, markAsRead, getUnreadCount } = useNotifications();
  const [showBanner, setShowBanner] = useState(false);
  const [currentNotification, setCurrentNotification] = useState(null);

  useEffect(() => {
    const unreadNotifications = notifications.filter(n => !n.read);
    if (unreadNotifications.length > 0) {
      // Show the most recent urgent notification first, or the most recent unread
      const urgentNotifications = unreadNotifications.filter(n => n.type === 'urgent_dua');
      const notificationToShow = urgentNotifications.length > 0 
        ? urgentNotifications[0] 
        : unreadNotifications[0];
      
      setCurrentNotification(notificationToShow);
      setShowBanner(true);
    } else {
      setShowBanner(false);
      setCurrentNotification(null);
    }
  }, [notifications]);

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'dua_request': return <Heart className="w-5 h-5 text-red-500" />;
      case 'urgent_dua': return <Heart className="w-5 h-5 text-red-600" />;
      case 'contact_reminder': return <Clock className="w-5 h-5 text-blue-500" />;
      case 'goal_reminder': return <Target className="w-5 h-5 text-green-500" />;
      case 'announcement': return <Calendar className="w-5 h-5 text-purple-500" />;
      case 'brother_update': return <MessageSquare className="w-5 h-5 text-yellow-500" />;
      default: return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  const getBannerColor = (type) => {
    switch (type) {
      case 'urgent_dua': return 'bg-red-50 border-l-red-500 text-red-800';
      case 'dua_request': return 'bg-red-50 border-l-red-400 text-red-800';
      case 'contact_reminder': return 'bg-blue-50 border-l-blue-400 text-blue-800';
      case 'goal_reminder': return 'bg-green-50 border-l-green-400 text-green-800';
      case 'announcement': return 'bg-purple-50 border-l-purple-400 text-purple-800';
      case 'brother_update': return 'bg-yellow-50 border-l-yellow-400 text-yellow-800';
      default: return 'bg-blue-50 border-l-blue-400 text-blue-800';
    }
  };

  const handleDismiss = () => {
    if (currentNotification) {
      markAsRead(currentNotification.id);
    }
    setShowBanner(false);
  };

  const handleBannerClick = () => {
    if (currentNotification) {
      // Navigate based on notification type
      const routes = {
        'dua_request': '/duas',
        'urgent_dua': '/duas',
        'contact_reminder': '/brotherhood',
        'goal_reminder': '/goals',
        'announcement': '/announcements',
        'brother_update': '/brotherhood'
      };
      
      const route = routes[currentNotification.type] || '/';
      console.log(`Navigate to: ${route}`, currentNotification.data);
      
      markAsRead(currentNotification.id);
      setShowBanner(false);
    }
  };

  if (!showBanner || !currentNotification) {
    return null;
  }

  const bannerColorClass = getBannerColor(currentNotification.type);

  return (
    <div 
      className={`${bannerColorClass} border-l-4 p-4 mb-4 cursor-pointer hover:opacity-90 transition-opacity`}
      onClick={handleBannerClick}
    >
      <div className="flex items-start">
        <div className="flex-shrink-0">
          {getNotificationIcon(currentNotification.type)}
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium">
            {currentNotification.title}
          </h3>
          <p className="text-sm mt-1">
            {currentNotification.body}
          </p>
          {currentNotification.type === 'urgent_dua' && (
            <p className="text-xs mt-1 font-medium">
              Tap to respond with prayer
            </p>
          )}
        </div>
        <div className="ml-auto pl-3">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDismiss();
            }}
            className="text-current hover:opacity-75 transition-opacity"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationBanner;