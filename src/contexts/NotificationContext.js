// ===== src/contexts/NotificationContext.js =====
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { 
  collection, 
  doc, 
  onSnapshot, 
  addDoc, 
  updateDoc,
  query,
  orderBy,
  where,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../services/firebase';
import { 
  requestNotificationPermission, 
  onMessageListener,
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [settings, setSettings] = useState({
    weeklyReminders: true,
    duaRequests: true,
    urgentDuas: true,
    announcements: false,
    goalReminders: true,
    brotherUpdates: false
  });

  // Load notifications from Firestore
  useEffect(() => {
    if (!user) {
      setNotifications([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'users', user.uid, 'notifications'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const notificationData = [];
        snapshot.forEach((doc) => {
          notificationData.push({ id: doc.id, ...doc.data() });
        });
        setNotifications(notificationData);
        setLoading(false);
        setError(null);
      },
      (err) => {
        setError('Failed to load notifications');
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [user]);

  // Load user settings
  useEffect(() => {
    if (!user) return;

    const settingsRef = doc(db, 'users', user.uid, 'settings', 'notifications');
    const unsubscribe = onSnapshot(settingsRef,
      (doc) => {
        if (doc.exists()) {
          setSettings({ ...settings, ...doc.data() });
        }
      },
      (err) => {
        console.error('Error loading notification settings:', err);
      }
    );

    return unsubscribe;
  }, [user]);

  // Initialize notifications
  useEffect(() => {
    if (user) {
      initializeNotifications();
    }
  }, [user]);

  // Listen for foreground messages
  useEffect(() => {
    const unsubscribe = onMessageListener().then((payload) => {
      console.log('Received foreground message:', payload);
      addNotificationToDb({
        title: payload.notification?.title || 'New Notification',
        body: payload.notification?.body || '',
        data: payload.data || {},
        type: payload.data?.type || 'general',
        read: false
      });
    });

    return () => unsubscribe;
  }, []);

  const initializeNotifications = async () => {
    try {
      const token = await requestNotificationPermission();
      setNotificationToken(token);
      
      // Save token to user profile for sending push notifications
      if (token && user) {
        await updateDoc(doc(db, 'users', user.uid), {
          fcmToken: token,
          updatedAt: serverTimestamp()
        });
      }
    } catch (err) {
      console.error('Failed to initialize notifications:', err);
    }
  };

  const addNotificationToDb = async (notification) => {
    if (!user) return;
    
    try {
      await addDoc(collection(db, 'users', user.uid, 'notifications'), {
        ...notification,
        createdAt: serverTimestamp()
      });
    } catch (err) {
      console.error('Failed to save notification:', err);
    }
  };

  const markAsRead = async (notificationId) => {
    if (!user) return;

    try {
      await updateDoc(doc(db, 'users', user.uid, 'notifications', notificationId), {
        read: true,
        readAt: serverTimestamp()
      });
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const markAllAsRead = async () => {
    if (!user) return;

    const unreadNotifications = notifications.filter(n => !n.read);
    
    try {
      const promises = unreadNotifications.map(notification =>
        updateDoc(doc(db, 'users', user.uid, 'notifications', notification.id), {
          read: true,
          readAt: serverTimestamp()
        })
      );
      
      await Promise.all(promises);
    } catch (err) {
      console.error('Failed to mark all notifications as read:', err);
    }
  };

  const updateSettings = async (newSettings) => {
    if (!user) return;

    try {
      await updateDoc(doc(db, 'users', user.uid, 'settings', 'notifications'), {
        ...newSettings,
        updatedAt: serverTimestamp()
      });
      setSettings(newSettings);
    } catch (err) {
      console.error('Failed to update notification settings:', err);
    }
  };

  const triggerDuaNotification = async (duaRequest) => {
    if (settings.duaRequests || (settings.urgentDuas && duaRequest.urgent)) {
      sendDuaNotification(duaRequest);
      
      // Add to database for persistent storage
      await addNotificationToDb({
        title: duaRequest.urgent ? '🚨 Urgent Dua Request' : '🤲 New Dua Request',
        body: duaRequest.anonymous 
          ? 'A brother needs your prayers'
          : `${duaRequest.authorName} needs your prayers`,
        type: 'dua_request',
        data: { duaId: duaRequest.id },
        read: false
      });
    }
  };

  const triggerContactReminder = async (brothers) => {
    if (settings.weeklyReminders) {
      sendContactReminder(brothers);
      
      await addNotificationToDb({
        title: '📞 Brotherhood Contact Reminder',
        body: `You have ${brothers.length} brothers to connect with`,
        type: 'contact_reminder',
        data: { brotherCount: brothers.length },
        read: false
      });
    }
  };

  const triggerGoalReminder = async (goal) => {
    if (settings.goalReminders) {
      sendGoalReminder(goal);
      
      await addNotificationToDb({
        title: '🎯 Spiritual Goal Reminder',
        body: `Time for your ${goal.title}`,
        type: 'goal_reminder',
        data: { goalId: goal.id },
        read: false
      });
    }
  };

  const getUnreadCount = () => {
    return notifications.filter(n => !n.read).length;
  };

  const value = {
    notificationToken,
    notifications,
    loading,
    error,
    settings,
    markAsRead,
    markAllAsRead,
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