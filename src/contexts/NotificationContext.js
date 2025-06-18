// src/contexts/NotificationContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { 
  requestNotificationPermission, 
  onMessageListener,
  notificationTypes,
  sendDuaNotification,
  sendContactReminder,
  sendGoalReminder
} from '../services/notifications';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const [notificationToken, setNotificationToken] = useState(null);
  const [notifications, setNotifications] = useState(() => {
    // Load from localStorage or use empty array
    try {
      const saved = localStorage.getItem('brotherhood_notifications');
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      return [];
    }
  });
  const [settings, setSettings] = useState({
    weeklyReminders: true,
    duaRequests: true,
    urgentDuas: true,
    announcements: false,
    goalReminders: true,
    brotherUpdates: false
  });

  useEffect(() => {
    if (user) {
      initializeNotifications();
    }
  }, [user]);

  // Save notifications to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('brotherhood_notifications', JSON.stringify(notifications));
    } catch (error) {
      console.error('Failed to save notifications:', error);
    }
  }, [notifications]);

  useEffect(() => {
    // Listen for foreground messages
    const unsubscribe = onMessageListener().then((payload) => {
      console.log('Received foreground message:', payload);
      addNotification({
        id: Date.now().toString(),
        title: payload.notification.title,
        body: payload.notification.body,
        type: payload.data?.type || 'announcement',
        data: payload.data,
        timestamp: new Date(),
        read: false
      });
    }).catch(console.error);

    return () => unsubscribe;
  }, []);

  const initializeNotifications = async () => {
    const token = await requestNotificationPermission();
    setNotificationToken(token);
    
    // Initialize contact tracking with sample data if none exists
    const { initializeContactTracking } = require('../services/contactTracking');
    
    // Add sample data for testing
    if (notifications.length === 0) {
      initializeContactTracking({ createContactReminderNotification });
      
      // Add sample notifications
      const sampleNotifications = [
        {
          id: '1',
          title: '🤲 New Dua Request',
          body: 'Brother Ahmad needs prayers for his upcoming surgery',
          type: 'dua_request',
          timestamp: new Date(Date.now() - 5 * 60 * 1000),
          read: false,
          data: { brotherId: 'ahmad123', duaId: 'dua456' }
        }
      ];
      setNotifications(sampleNotifications);
    }
    
    // Load user notification settings from Firestore
    // loadNotificationSettings();
  };

  const addNotification = (notification) => {
    setNotifications(prev => [notification, ...prev.slice(0, 49)]); // Keep last 50
  };

  const markAsRead = (notificationId) => {
    setNotifications(prev => 
      prev.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      )
    );
    
    // Remove notification after 3 seconds
    setTimeout(() => {
      deleteNotification(notificationId);
    }, 3000);
  };

  const markAllAsRead = () => {
    const unreadIds = notifications.filter(n => !n.read).map(n => n.id);
    
    setNotifications(prev => 
      prev.map(n => ({ ...n, read: true }))
    );
    
    // Remove all previously unread notifications after 3 seconds
    setTimeout(() => {
      setNotifications(prev => 
        prev.filter(n => !unreadIds.includes(n.id))
      );
    }, 3000);
  };

  const deleteNotification = (notificationId) => {
    setNotifications(prev => 
      prev.filter(n => n.id !== notificationId)
    );
  };

  const getUnreadCount = () => {
    return notifications.filter(n => !n.read).length;
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    try {
      localStorage.removeItem('brotherhood_notifications');
    } catch (error) {
      console.error('Failed to clear notifications from storage:', error);
    }
  };

  const updateNotificationSettings = (newSettings) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
    // Save to Firestore in real implementation
  };

  // Helper functions to create notifications
  const createDuaRequestNotification = (duaRequest) => {
    if (!settings.duaRequests && !duaRequest.urgent) return;
    
    const notification = {
      id: Date.now().toString(),
      title: duaRequest.urgent ? '🚨 Urgent Dua Request' : '🤲 New Dua Request',
      body: duaRequest.anonymous 
        ? 'A brother needs your prayers'
        : `${duaRequest.authorName} needs your prayers`,
      type: duaRequest.urgent ? 'urgent_dua' : 'dua_request',
      timestamp: new Date(),
      read: false,
      data: { 
        duaId: duaRequest.id,
        brotherId: duaRequest.authorId,
        urgent: duaRequest.urgent
      }
    };
    
    addNotification(notification);
    sendDuaNotification(duaRequest);
  };

  const createContactReminderNotification = (brothers) => {
    if (!settings.weeklyReminders) return;
    
    const notification = {
      id: Date.now().toString(),
      title: '📞 Brotherhood Contact Reminder',
      body: brothers.length === 1 
        ? `Time to connect with ${brothers[0].name}`
        : `You have ${brothers.length} brothers to contact this week`,
      type: 'contact_reminder',
      timestamp: new Date(),
      read: false,
      data: { brotherIds: brothers.map(b => b.id) }
    };
    
    addNotification(notification);
    sendContactReminder(brothers);
  };

  const createGoalReminderNotification = (goal) => {
    if (!settings.goalReminders) return;
    
    const notification = {
      id: Date.now().toString(),
      title: '🎯 Spiritual Goal Reminder',
      body: `Time for your ${goal.title}`,
      type: 'goal_reminder',
      timestamp: new Date(),
      read: false,
      data: { goalId: goal.id }
    };
    
    addNotification(notification);
    sendGoalReminder(goal);
  };

  const createAnnouncementNotification = (announcement) => {
    if (!settings.announcements) return;
    
    const notification = {
      id: Date.now().toString(),
      title: '📢 Brotherhood Announcement',
      body: announcement.title,
      type: 'announcement',
      timestamp: new Date(),
      read: false,
      data: { announcementId: announcement.id }
    };
    
    addNotification(notification);
  };

  const value = {
    notifications,
    settings,
    notificationToken,
    // Core notification management
    addNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    getUnreadCount,
    clearAllNotifications,
    updateNotificationSettings,
    // Notification creators
    createDuaRequestNotification,
    createContactReminderNotification,
    createGoalReminderNotification,
    createAnnouncementNotification
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};