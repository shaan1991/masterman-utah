// ===== src/utils/contactHelpers.js =====
import { getDaysAgo } from './dateHelpers';

export const getContactStatus = (brother) => {
  const daysAgo = getDaysAgo(brother.lastContact);
  
  if (daysAgo > 30) return 'urgent';
  if (daysAgo > 21) return 'needs_contact';
  if (daysAgo <= 7) return 'recent';
  return 'ok';
};

export const getContactPriority = (brothers = []) => {
  return brothers
    .map(brother => ({
      ...brother,
      priority: getContactPriorityScore(brother)
    }))
    .sort((a, b) => b.priority - a.priority);
};

const getContactPriorityScore = (brother) => {
  const daysAgo = getDaysAgo(brother.lastContact);
  let score = daysAgo; // Base score on days since last contact
  
  // Boost priority for preferred contact methods
  if (brother.preferences?.preferredContact === 'phone') score += 5;
  
  // Boost for urgent status
  if (brother.status === 'urgent') score += 20;
  
  return score;
};

export const suggestContactMethod = (brother) => {
  if (brother.preferences?.preferredContact) {
    return brother.preferences.preferredContact;
  }
  
  // Default suggestion based on time of day and contact history
  const hour = new Date().getHours();
  if (hour >= 9 && hour <= 17) {
    return 'text'; // Business hours - text first
  }
  return 'call'; // Evening - call might be better
};