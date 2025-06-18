// src/services/notifications.js
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { messaging } from './firebase';

// Request notification permission
export const requestNotificationPermission = async () => {
  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      console.log('Notification permission granted.');
      return await getNotificationToken();
    } else {
      console.log('Notification permission denied.');
      return null;
    }
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return null;
  }
};

// Get FCM token
export const getNotificationToken = async () => {
  try {
    const token = await getToken(messaging, {
      vapidKey: process.env.REACT_APP_VAPID_KEY
    });
    return token;
  } catch (error) {
    console.error('Error getting notification token:', error);
    return null;
  }
};

// Listen for foreground messages
export const onMessageListener = () =>
  new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      resolve(payload);
    });
  });

// Local notification helpers
export const showLocalNotification = (title, body, options = {}) => {
  if ('Notification' in window && Notification.permission === 'granted') {
    const { actions, ...cleanOptions } = options;
    new Notification(title, {
      body,
      icon: '/icon-192x192.png',
      badge: '/icon-96x96.png',
      ...cleanOptions
    });
  }
};

// Notification types for the brotherhood app
export const notificationTypes = {
  WEEKLY_REMINDER: 'weekly_reminder',
  DUA_REQUEST: 'dua_request',
  URGENT_DUA: 'urgent_dua',
  ANNOUNCEMENT: 'announcement',
  GOAL_REMINDER: 'goal_reminder',
  BROTHER_UPDATE: 'brother_update'
};

// Enhanced notification handlers for different contexts
export const sendDuaNotification = (duaRequest) => {
  const title = duaRequest.urgent ? '🚨 Urgent Dua Request' : '🤲 New Dua Request';
  const body = duaRequest.anonymous 
    ? 'A brother needs your prayers'
    : `${duaRequest.authorName} needs your prayers`;
  
  showLocalNotification(title, body, {
    tag: 'dua-request',
    requireInteraction: duaRequest.urgent
  });
};

export const sendGoalReminder = (goal) => {
  const title = '🎯 Spiritual Goal Reminder';
  const body = `Time for your ${goal.title}`;
  
  showLocalNotification(title, body, {
    tag: 'goal-reminder'
  });
};

export const sendContactReminder = (brothers) => {
  const count = brothers.length;
  const title = '📞 Brotherhood Contact Reminder';
  const body = count === 1 
    ? `Check in with ${brothers[0].name}`
    : `You have ${count} brothers to connect with`;
  
  showLocalNotification(title, body, {
    tag: 'contact-reminder'
  });
};

export const sendAnnouncementNotification = (announcement) => {
  const title = '📅 Brotherhood Announcement';
  const body = announcement.message;
  
  showLocalNotification(title, body, {
    tag: 'announcement'
  });
};

export const sendBrotherUpdateNotification = (update) => {
  const title = '👥 Brother Update';
  const body = `${update.brotherName}: ${update.message}`;
  
  showLocalNotification(title, body, {
    tag: 'brother-update'
  });
};

// Helper function to schedule notifications (for future use with service workers)
export const scheduleNotification = async (notification, delay) => {
  if ('serviceWorker' in navigator && 'PushManager' in window) {
    try {
      // This would require a service worker implementation
      console.log('Scheduling notification:', notification, 'in', delay, 'ms');
      
      // For now, use setTimeout for simple scheduling
      setTimeout(() => {
        showLocalNotification(notification.title, notification.body, notification.options);
      }, delay);
    } catch (error) {
      console.error('Error scheduling notification:', error);
    }
  }
};