// ===== src/contexts/NotificationContext.js =====
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
  const [notifications, setNotifications] = useState([]);
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

  useEffect(() => {
    // Listen for foreground messages
    const unsubscribe = onMessageListener().then((payload) => {
      console.log('Received foreground message:', payload);
      addNotification({
        id: Date.now().toString(),
        title: payload.notification.title,
        body: payload.notification.body,
        data: payload.data,
        timestamp: new Date(),
        read: false
      });
    });

    return () => unsubscribe;
  }, []);

  const initializeNotifications = async () => {
    const token = await requestNotificationPermission();
    setNotificationToken(token);
    
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
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(n => ({ ...n, read: true }))
    );
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const updateSettings = async (newSettings) => {
    setSettings(newSettings);
    // Save to Firestore
    // await updateNotificationSettings(user.uid, newSettings);
  };

  const triggerDuaNotification = (duaRequest) => {
    if (settings.duaRequests || (settings.urgentDuas && duaRequest.urgent)) {
      sendDuaNotification(duaRequest);
    }
  };

  const triggerContactReminder = (brothers) => {
    if (settings.weeklyReminders) {
      sendContactReminder(brothers);
    }
  };

  const triggerGoalReminder = (goal) => {
    if (settings.goalReminders) {
      sendGoalReminder(goal);
    }
  };

  const getUnreadCount = () => {
    return notifications.filter(n => !n.read).length;
  };

  const value = {
    notificationToken,
    notifications,
    settings,
    addNotification,
    markAsRead,
    markAllAsRead,
    clearNotifications,
    updateSettings,
    triggerDuaNotification,
    triggerContactReminder,
    triggerGoalReminder,
    getUnreadCount
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};