// src/contexts/NotificationContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { 
  collection, 
  doc, 
  onSnapshot, 
  addDoc, 
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  serverTimestamp,
  setDoc
} from 'firebase/firestore';
import { db } from '../services/firebase';
import { 
  requestNotificationPermission, 
  onMessageListener,
  showLocalNotification
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
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [settings, setSettings] = useState({
    weeklyReminders: true,
    duaRequests: true,
    urgentDuas: true,
    announcements: true,
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
          const data = doc.data();
          notificationData.push({ 
            id: doc.id, 
            ...data,
            timestamp: data.createdAt?.toDate() || new Date()
          });
        });
        setNotifications(notificationData);
        setLoading(false);
        setError(null);
      },
      (err) => {
        setError('Failed to load notifications');
        setLoading(false);
        console.error('Error loading notifications:', err);
      }
    );

    return unsubscribe;
  }, [user]);

  // Load user notification settings
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

  // Initialize browser notifications
  useEffect(() => {
    if (user) {
      requestNotificationPermission();
    }
  }, [user]);

  // Listen for foreground Firebase messages
  useEffect(() => {
    const setupMessageListener = async () => {
      try {
        const payload = await onMessageListener();
        console.log('Received foreground message:', payload);
        
        // Add notification to Firestore when received
        if (payload.notification) {
          await addNotificationToDb({
            title: payload.notification.title,
            body: payload.notification.body,
            type: payload.data?.type || 'general',
            data: payload.data || {},
            read: false
          });
        }
      } catch (error) {
        console.error('Error setting up message listener:', error);
      }
    };

    if (user) {
      setupMessageListener();
    }
  }, [user]);

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

  const deleteNotification = async (notificationId) => {
    if (!user) return;

    try {
      await deleteDoc(doc(db, 'users', user.uid, 'notifications', notificationId));
    } catch (err) {
      console.error('Failed to delete notification:', err);
    }
  };

  const clearAllNotifications = async () => {
    if (!user) return;

    try {
      const promises = notifications.map(notification =>
        deleteDoc(doc(db, 'users', user.uid, 'notifications', notification.id))
      );
      
      await Promise.all(promises);
    } catch (err) {
      console.error('Failed to clear all notifications:', err);
    }
  };

  const updateSettings = async (newSettings) => {
    if (!user) return;

    try {
      await setDoc(doc(db, 'users', user.uid, 'settings', 'notifications'), {
        ...newSettings,
        updatedAt: serverTimestamp()
      });
      setSettings(newSettings);
    } catch (err) {
      console.error('Failed to update notification settings:', err);
    }
  };

  const triggerDuaNotification = async (duaRequest) => {
    if (!settings.duaRequests && !settings.urgentDuas) return;
    if (!settings.urgentDuas && duaRequest.urgent) return;

    const title = duaRequest.urgent ? '🚨 Urgent Dua Request' : '🤲 New Dua Request';
    const body = duaRequest.anonymous 
      ? 'A brother needs your prayers'
      : `${duaRequest.authorName} needs your prayers`;
    
    // Show browser notification
    showLocalNotification(title, body, {
      tag: 'dua-request',
      requireInteraction: duaRequest.urgent
    });
    
    // Add to database
    await addNotificationToDb({
      title,
      body,
      type: duaRequest.urgent ? 'urgent_dua' : 'dua_request',
      data: { duaId: duaRequest.id, authorName: duaRequest.authorName },
      read: false
    });
  };

  const triggerContactReminder = async (brothers) => {
    if (!settings.weeklyReminders) return;

    const title = '📞 Brotherhood Contact Reminder';
    const body = `You have ${brothers.length} brother${brothers.length > 1 ? 's' : ''} to connect with`;
    
    showLocalNotification(title, body, { tag: 'contact-reminder' });
    
    await addNotificationToDb({
      title,
      body,
      type: 'contact_reminder',
      data: { brotherCount: brothers.length, brothers: brothers.map(b => b.id) },
      read: false
    });
  };

  const triggerGoalReminder = async (goal) => {
    if (!settings.goalReminders) return;

    const title = '🎯 Spiritual Goal Reminder';
    const body = `Time for your ${goal.title}`;
    
    showLocalNotification(title, body, { tag: 'goal-reminder' });
    
    await addNotificationToDb({
      title,
      body,
      type: 'goal_reminder',
      data: { goalId: goal.id, goalName: goal.title },
      read: false
    });
  };

  const triggerAnnouncement = async (announcement) => {
    if (!settings.announcements) return;

    const title = '📅 Brotherhood Announcement';
    const body = announcement.message;
    
    showLocalNotification(title, body, { tag: 'announcement' });
    
    await addNotificationToDb({
      title,
      body,
      type: 'announcement',
      data: { announcementId: announcement.id },
      read: false
    });
  };

  const getUnreadCount = () => {
    return notifications.filter(n => !n.read).length;
  };

  const value = {
    notifications,
    loading,
    error,
    settings,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
    updateSettings,
    triggerDuaNotification,
    triggerContactReminder,
    triggerGoalReminder,
    triggerAnnouncement,
    getUnreadCount
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};