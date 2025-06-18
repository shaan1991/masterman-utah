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
      vapidKey: process.env.REACT_APP_VAPID_KEY // You'll need to add this to your env
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
    // Remove actions from options as they're not supported in local notifications
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

// Schedule weekly contact reminders
export const scheduleWeeklyReminder = () => {
  // This would integrate with a backend service or use local scheduling
  console.log('Weekly reminder scheduled');
};

// Send dua request notification
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

// Send goal reminder notification
export const sendGoalReminder = (goal) => {
  const title = '🎯 Spiritual Goal Reminder';
  const body = `Time for your ${goal.title}`;
  
  showLocalNotification(title, body, {
    tag: 'goal-reminder'
  });
};

// Send contact reminder notification
export const sendContactReminder = (brothers) => {
  const count = brothers.length;
  const title = '📞 Brotherhood Contact Reminder';
  const body = count === 1 
    ? `Time to connect with ${brothers[0].name}`
    : `You have ${count} brothers to contact this week`;
  
  showLocalNotification(title, body, {
    tag: 'contact-reminder'
  });
};