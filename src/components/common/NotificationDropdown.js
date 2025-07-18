// src/components/common/NotificationDropdown.js
import React, { useRef, useEffect } from 'react';
import { Bell, X, Heart, Clock, MessageSquare, Target, Calendar, Check, AlertCircle } from 'lucide-react';
import { useNotifications } from '../../contexts/NotificationContext';

const NotificationDropdown = ({ isOpen, onClose }) => {
  const dropdownRef = useRef(null);
  const { 
    notifications, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification, 
    clearAllNotifications,
    getUnreadCount,
    loading 
  } = useNotifications();
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const getNotificationIcon = (type) => {
    const iconProps = { className: "w-4 h-4" };
    switch (type) {
      case 'dua_request': return <Heart {...iconProps} className="w-4 h-4 text-red-500" />;
      case 'urgent_dua': return <Heart {...iconProps} className="w-4 h-4 text-red-600" />;
      case 'contact_reminder': return <Clock {...iconProps} className="w-4 h-4 text-blue-500" />;
      case 'goal_reminder': return <Target {...iconProps} className="w-4 h-4 text-green-500" />;
      case 'announcement': return <MessageSquare {...iconProps} className="w-4 h-4 text-purple-500" />;
      case 'brother_update': return <Calendar {...iconProps} className="w-4 h-4 text-yellow-500" />;
      default: return <Bell {...iconProps} className="w-4 h-4 text-gray-500" />;
    }
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const notificationTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now - notificationTime) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  const handleNotificationClick = (notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    
    // Navigate based on notification type
    const routes = {
      'dua_request': '/duas',
      'urgent_dua': '/duas',
      'contact_reminder': '/brotherhood',
      'goal_reminder': '/goals',
      'announcement': '/announcements',
      'brother_update': '/brotherhood'
    };
    
    const route = routes[notification.type] || '/';
    
    // In a real React Router app, you'd use navigate(route)
    console.log(`Navigate to: ${route}`, notification.data);
    
    // For now, you can dispatch a custom event or use window.location
    // window.location.hash = route;
    
    onClose();
  };

  const unreadCount = getUnreadCount();
  const sortedNotifications = [...notifications].sort((a, b) => 
    new Date(b.timestamp) - new Date(a.timestamp)
  );

  if (!isOpen) return null;

  return (
    <div 
      className="absolute top-12 right-0 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50"
      ref={dropdownRef}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <div className="flex items-center space-x-2">
          <Bell className="w-5 h-5 text-gray-600" />
          <h3 className="font-semibold text-gray-800">Notifications</h3>
          {unreadCount > 0 && (
            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
        <div className="flex items-center space-x-2">
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-xs text-green-600 hover:text-green-700 font-medium transition-colors"
              title="Mark all as read"
            >
              <Check className="w-4 h-4" />
            </button>
          )}
          {notifications.length > 0 && (
            <button
              onClick={clearAllNotifications}
              className="text-xs text-red-600 hover:text-red-700 font-medium transition-colors"
              title="Clear all notifications"
            >
              Clear
            </button>
          )}
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="max-h-96 overflow-y-auto">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
            <p className="text-gray-500 text-sm mt-2">Loading notifications...</p>
          </div>
        ) : sortedNotifications.length === 0 ? (
          <div className="p-8 text-center">
            <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">No notifications yet</p>
            <p className="text-gray-400 text-xs mt-1">
              We'll notify you when brothers share duas or announcements
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {sortedNotifications.slice(0, 10).map((notification) => (
              <div
                key={notification.id}
                className={`group p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                  !notification.read ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                } ${notification.type === 'urgent_dua' ? 'border-l-4 border-l-red-500' : ''}`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-1 relative">
                    {getNotificationIcon(notification.type)}
                    {notification.type === 'urgent_dua' && (
                      <AlertCircle className="w-3 h-3 text-red-500 absolute -top-1 -right-1" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${!notification.read ? 'font-semibold text-gray-900' : 'text-gray-800'}`}>
                      {notification.title}
                    </p>
                    <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                      {notification.body}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-gray-500">
                        {formatTimeAgo(notification.timestamp)}
                      </span>
                      {!notification.read && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      )}
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification(notification.id);
                      }}
                      className="text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Delete notification"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {sortedNotifications.length > 0 && (
        <div className="p-3 border-t border-gray-100 text-center">
          <button 
            className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
            onClick={() => {
              // Navigate to a full notifications page
              console.log('Navigate to full notifications page');
              onClose();
            }}
          >
            View All Notifications
          </button>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;