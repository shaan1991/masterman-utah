// src/services/contactTracking.js
import { useNotifications } from '../contexts/NotificationContext';

class ContactTrackingService {
  constructor() {
    this.contactHistory = this.loadContactHistory();
    this.checkInterval = null;
  }

  loadContactHistory() {
    try {
      const saved = localStorage.getItem('brotherhood_contact_history');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  }

  saveContactHistory() {
    try {
      localStorage.setItem('brotherhood_contact_history', JSON.stringify(this.contactHistory));
    } catch (error) {
      console.error('Failed to save contact history:', error);
    }
  }

  // Record contact with a brother
  recordContact(brotherId, brotherName, method = 'unknown') {
    if (!this.contactHistory[brotherId]) {
      this.contactHistory[brotherId] = {
        name: brotherName,
        contacts: []
      };
    }

    this.contactHistory[brotherId].contacts.push({
      timestamp: new Date(),
      method: method
    });

    // Keep only last 50 contacts per brother
    if (this.contactHistory[brotherId].contacts.length > 50) {
      this.contactHistory[brotherId].contacts = this.contactHistory[brotherId].contacts.slice(-50);
    }

    this.saveContactHistory();
  }

  // Get brothers who need contact reminders
  getBrothersNeedingContact(daysSinceLastContact = 7) {
    const now = new Date();
    const threshold = daysSinceLastContact * 24 * 60 * 60 * 1000; // Convert to milliseconds
    const needingContact = [];

    for (const [brotherId, data] of Object.entries(this.contactHistory)) {
      if (data.contacts.length === 0) {
        // Never contacted
        needingContact.push({
          id: brotherId,
          name: data.name,
          daysSinceLastContact: null,
          lastContactMethod: null
        });
      } else {
        const lastContact = new Date(data.contacts[data.contacts.length - 1].timestamp);
        const timeSinceContact = now - lastContact;

        if (timeSinceContact > threshold) {
          needingContact.push({
            id: brotherId,
            name: data.name,
            daysSinceLastContact: Math.floor(timeSinceContact / (24 * 60 * 60 * 1000)),
            lastContactMethod: data.contacts[data.contacts.length - 1].method,
            lastContactDate: lastContact
          });
        }
      }
    }

    return needingContact.sort((a, b) => (b.daysSinceLastContact || 999) - (a.daysSinceLastContact || 999));
  }

  // Get contact statistics
  getContactStats() {
    const now = new Date();
    const oneWeekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);

    let totalBrothers = 0;
    let contactedThisWeek = 0;
    let contactedThisMonth = 0;
    let totalContacts = 0;

    for (const [brotherId, data] of Object.entries(this.contactHistory)) {
      totalBrothers++;
      totalContacts += data.contacts.length;

      const recentContacts = data.contacts.filter(contact => 
        new Date(contact.timestamp) > oneWeekAgo
      );
      
      const monthlyContacts = data.contacts.filter(contact => 
        new Date(contact.timestamp) > oneMonthAgo
      );

      if (recentContacts.length > 0) contactedThisWeek++;
      if (monthlyContacts.length > 0) contactedThisMonth++;
    }

    return {
      totalBrothers,
      contactedThisWeek,
      contactedThisMonth,
      totalContacts,
      averageContactsPerBrother: totalBrothers > 0 ? Math.round(totalContacts / totalBrothers) : 0
    };
  }

  // Start automatic reminder checking
  startReminderService(notificationService) {
    // Check every 4 hours
    this.checkInterval = setInterval(() => {
      this.checkAndSendReminders(notificationService);
    }, 4 * 60 * 60 * 1000);

    // Also check immediately
    this.checkAndSendReminders(notificationService);
  }

  stopReminderService() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  checkAndSendReminders(notificationService) {
    const needingContact = this.getBrothersNeedingContact(7); // 7 days threshold
    
    if (needingContact.length > 0) {
      notificationService.createContactReminderNotification(needingContact);
    }
  }

  // Add sample brothers for testing
  addSampleBrothers() {
    const sampleBrothers = [
      { id: 'ahmad123', name: 'Ahmad Al-Rashid' },
      { id: 'ali789', name: 'Ali Abdullah' },
      { id: 'omar456', name: 'Omar Hassan' },
      { id: 'yusuf321', name: 'Yusuf Ibrahim' },
      { id: 'bilal654', name: 'Bilal Mohamed' }
    ];

    const now = new Date();

    sampleBrothers.forEach((brother, index) => {
      // Add some with recent contact, some without
      if (index < 2) {
        // Recent contact (within last 3 days)
        this.recordContact(brother.id, brother.name, 'call');
        // Simulate contact 2 days ago
        this.contactHistory[brother.id].contacts[0].timestamp = new Date(now - 2 * 24 * 60 * 60 * 1000);
      } else if (index < 4) {
        // Old contact (over a week ago)
        this.recordContact(brother.id, brother.name, 'text');
        // Simulate contact 10 days ago
        this.contactHistory[brother.id].contacts[0].timestamp = new Date(now - 10 * 24 * 60 * 60 * 1000);
      }
      // Last brother has no contact history
    });

    this.saveContactHistory();
  }
}

// Export singleton instance
export const contactTracker = new ContactTrackingService();

// React hook for using contact tracking
export const useContactTracking = () => {
  const { createContactReminderNotification } = useNotifications();

  const recordContact = (brotherId, brotherName, method) => {
    contactTracker.recordContact(brotherId, brotherName, method);
  };

  const getBrothersNeedingContact = (days = 7) => {
    return contactTracker.getBrothersNeedingContact(days);
  };

  const getContactStats = () => {
    return contactTracker.getContactStats();
  };

  const startReminders = () => {
    contactTracker.startReminderService({ createContactReminderNotification });
  };

  const stopReminders = () => {
    contactTracker.stopReminderService();
  };

  const initializeSampleData = () => {
    contactTracker.addSampleBrothers();
  };

  return {
    recordContact,
    getBrothersNeedingContact,
    getContactStats,
    startReminders,
    stopReminders,
    initializeSampleData
  };
};

// Non-hook helper functions for use outside components
export const initializeContactTracking = (notificationService) => {
  contactTracker.addSampleBrothers();
  contactTracker.startReminderService(notificationService);
};

export const getContactTrackingStats = () => contactTracker.getContactStats();
export const recordBrotherContact = (brotherId, brotherName, method) => 
  contactTracker.recordContact(brotherId, brotherName, method);