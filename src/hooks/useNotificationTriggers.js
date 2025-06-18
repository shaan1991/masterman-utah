// src/hooks/useNotificationTriggers.js
import { useCallback } from 'react';
import { useNotifications } from '../contexts/NotificationContext';

export const useNotificationTriggers = () => {
  const { 
    triggerDuaNotification, 
    triggerContactReminder, 
    triggerGoalReminder, 
    triggerAnnouncement 
  } = useNotifications();

  // Trigger when a new dua is created
  const handleNewDua = useCallback(async (duaData) => {
    await triggerDuaNotification({
      id: duaData.id,
      urgent: duaData.urgent || false,
      anonymous: duaData.anonymous || false,
      authorName: duaData.authorName || 'Anonymous Brother'
    });
  }, [triggerDuaNotification]);

  // Check for brothers who need contact reminders
  const checkContactReminders = useCallback(async (brothers) => {
    const now = new Date();
    const brothersNeedingContact = brothers.filter(brother => {
      if (!brother.lastContact) return true;
      
      const lastContactDate = new Date(brother.lastContact);
      const daysSinceContact = Math.floor((now - lastContactDate) / (1000 * 60 * 60 * 24));
      
      // Trigger reminder if more than 21 days since last contact
      return daysSinceContact > 21;
    });

    if (brothersNeedingContact.length > 0) {
      await triggerContactReminder(brothersNeedingContact);
    }

    return brothersNeedingContact;
  }, [triggerContactReminder]);

  // Trigger goal reminders based on schedule
  const checkGoalReminders = useCallback(async (goals) => {
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes(); // minutes since midnight
    
    for (const goal of goals) {
      if (!goal.reminderTime || !goal.active) continue;
      
      const [hours, minutes] = goal.reminderTime.split(':').map(Number);
      const goalTime = hours * 60 + minutes;
      
      // Check if it's time for this reminder (within 5 minutes window)
      if (Math.abs(currentTime - goalTime) <= 5) {
        await triggerGoalReminder({
          id: goal.id,
          title: goal.title
        });
      }
    }
  }, [triggerGoalReminder]);

  // Trigger announcement notifications
  const handleNewAnnouncement = useCallback(async (announcementData) => {
    await triggerAnnouncement({
      id: announcementData.id,
      message: announcementData.message || announcementData.title
    });
  }, [triggerAnnouncement]);

  // Set up periodic reminder checks
  const setupPeriodicChecks = useCallback((brothers, goals) => {
    // Check contact reminders daily
    const contactCheckInterval = setInterval(() => {
      checkContactReminders(brothers);
    }, 24 * 60 * 60 * 1000); // 24 hours

    // Check goal reminders every minute
    const goalCheckInterval = setInterval(() => {
      checkGoalReminders(goals);
    }, 60 * 1000); // 1 minute

    return () => {
      clearInterval(contactCheckInterval);
      clearInterval(goalCheckInterval);
    };
  }, [checkContactReminders, checkGoalReminders]);

  return {
    handleNewDua,
    checkContactReminders,
    checkGoalReminders,
    handleNewAnnouncement,
    setupPeriodicChecks
  };
};