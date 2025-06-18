// ===== src/utils/duaSecurity.js =====

/**
 * Security utilities for Dua operations
 * Implements defense in depth with client-side validation
 * Note: Server-side validation in Firestore rules is the primary security layer
 */

// Input sanitization
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return '';
  
  return input
    .trim()
    // Remove script tags (XSS prevention)
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    // Remove iframe tags
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    // Remove object/embed tags
    .replace(/<(object|embed)\b[^<]*(?:(?!<\/\1>)<[^<]*)*<\/\1>/gi, '')
    // Remove javascript: protocols
    .replace(/javascript:/gi, '')
    // Remove on* event handlers
    .replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '')
    // Remove data: URLs (potential XSS vector)
    .replace(/data:\s*[^;,]+[;,]/gi, '');
};

// Validation functions
export const validateDuaRequest = (request) => {
  const errors = [];
  
  if (!request || typeof request !== 'string') {
    errors.push('Request text is required');
    return { isValid: false, errors };
  }
  
  const sanitized = sanitizeInput(request);
  
  if (sanitized.length < 10) {
    errors.push('Request must be at least 10 characters long');
  }
  
  if (sanitized.length > 500) {
    errors.push('Request must be less than 500 characters');
  }
  
  // Check for potential spam patterns
  if (isSpamPattern(sanitized)) {
    errors.push('Request contains inappropriate content');
  }
  
  // Check for excessive repetition
  if (hasExcessiveRepetition(sanitized)) {
    errors.push('Request contains excessive repetition');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    sanitizedRequest: sanitized
  };
};

// Authorization checks
export const canEditDua = (dua, currentUser) => {
  if (!currentUser || !currentUser.uid) {
    return { canEdit: false, reason: 'User not authenticated' };
  }
  
  if (!dua || !dua.authorId) {
    return { canEdit: false, reason: 'Invalid dua' };
  }
  
  if (dua.authorId !== currentUser.uid) {
    return { canEdit: false, reason: 'Only the creator can edit this dua' };
  }
  
  if (dua.answered) {
    return { canEdit: false, reason: 'Cannot edit answered dua requests' };
  }
  
  // Check edit frequency limits (prevent spam editing)
  if (hasExceededEditLimit(dua)) {
    return { canEdit: false, reason: 'Too many edits. Please wait before editing again.' };
  }
  
  return { canEdit: true };
};

export const canDeleteDua = (dua, currentUser) => {
  if (!currentUser || !currentUser.uid) {
    return { canDelete: false, reason: 'User not authenticated' };
  }
  
  if (!dua || !dua.authorId) {
    return { canDelete: false, reason: 'Invalid dua' };
  }
  
  if (dua.authorId !== currentUser.uid) {
    return { canDelete: false, reason: 'Only the creator can delete this dua' };
  }
  
  return { canDelete: true };
};

export const canRespondToDua = (dua, currentUser) => {
  if (!currentUser || !currentUser.uid) {
    return { canRespond: false, reason: 'User not authenticated' };
  }
  
  if (!dua) {
    return { canRespond: false, reason: 'Invalid dua' };
  }
  
  if (dua.responses && dua.responses.includes(currentUser.uid)) {
    return { canRespond: false, reason: 'You have already responded to this dua' };
  }
  
  return { canRespond: true };
};

// Spam detection utilities
const isSpamPattern = (text) => {
  const spamPatterns = [
    /(.)\1{10,}/i, // Excessive character repetition
    /(http[s]?:\/\/|www\.)/i, // URLs (may want to allow for legitimate sharing)
    /[^\w\s]{5,}/i, // Excessive special characters
    /(buy now|click here|free money|urgent response)/i, // Common spam phrases
  ];
  
  return spamPatterns.some(pattern => pattern.test(text));
};

const hasExcessiveRepetition = (text) => {
  const words = text.toLowerCase().split(/\s+/);
  const wordCount = {};
  
  for (const word of words) {
    if (word.length > 3) { // Only count longer words
      wordCount[word] = (wordCount[word] || 0) + 1;
    }
  }
  
  // Check if any word appears more than 30% of the time
  const totalWords = words.filter(w => w.length > 3).length;
  return Object.values(wordCount).some(count => count / totalWords > 0.3);
};

const hasExceededEditLimit = (dua) => {
  const maxEditsPerHour = 5;
  const editCount = dua.editCount || 0;
  
  // If no previous edits, allow
  if (editCount === 0) return false;
  
  // Check if last edit was within the last hour
  const lastEdit = dua.editedAt;
  if (!lastEdit) return false;
  
  const lastEditTime = lastEdit.toDate ? lastEdit.toDate() : new Date(lastEdit);
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  
  // If last edit was more than an hour ago, reset the limit
  if (lastEditTime < oneHourAgo) return false;
  
  // Check recent edit count (this would require tracking edits in the last hour)
  // For simplicity, we'll just check total edit count
  return editCount >= maxEditsPerHour;
};

// Rate limiting utilities
export const checkRateLimit = (action, userId) => {
  const rateLimits = {
    create: { maxPerHour: 10, maxPerDay: 50 },
    edit: { maxPerHour: 20, maxPerDay: 100 },
    delete: { maxPerHour: 5, maxPerDay: 20 },
    respond: { maxPerHour: 100, maxPerDay: 500 }
  };
  
  const limit = rateLimits[action];
  if (!limit) return { allowed: true };
  
  // In a real implementation, you'd check against a rate limiting service
  // For now, we'll return true but this is where you'd implement rate limiting
  const key = `${action}_${userId}`;
  const stored = sessionStorage.getItem(key);
  
  if (!stored) {
    sessionStorage.setItem(key, JSON.stringify({ count: 1, lastReset: Date.now() }));
    return { allowed: true };
  }
  
  const data = JSON.parse(stored);
  const hoursSinceReset = (Date.now() - data.lastReset) / (1000 * 60 * 60);
  
  // Reset hourly counter
  if (hoursSinceReset >= 1) {
    sessionStorage.setItem(key, JSON.stringify({ count: 1, lastReset: Date.now() }));
    return { allowed: true };
  }
  
  // Check limit
  if (data.count >= limit.maxPerHour) {
    return { 
      allowed: false, 
      reason: `Rate limit exceeded. Maximum ${limit.maxPerHour} ${action} operations per hour.` 
    };
  }
  
  // Increment counter
  data.count++;
  sessionStorage.setItem(key, JSON.stringify(data));
  return { allowed: true };
};

// Audit logging
export const logSecurityEvent = (event, details) => {
  const logEntry = {
    timestamp: new Date().toISOString(),
    event,
    details,
    userAgent: navigator.userAgent,
    url: window.location.href
  };
  
  console.log('[SECURITY]', logEntry);
  
  // In production, you might want to send this to a logging service
  // Example: sendToLoggingService(logEntry);
};

// Content moderation helpers
export const flagInappropriateContent = (text) => {
  const inappropriatePatterns = [
    // Add patterns for content that should be flagged for review
    /\b(hate|violence|inappropriate_word)\b/i,
  ];
  
  return inappropriatePatterns.some(pattern => pattern.test(text));
};

// Utility to clean and validate edit data
export const prepareEditData = (originalDua, editData, currentUser) => {
  const authCheck = canEditDua(originalDua, currentUser);
  if (!authCheck.canEdit) {
    throw new Error(authCheck.reason);
  }
  
  const validation = validateDuaRequest(editData.request);
  if (!validation.isValid) {
    throw new Error(validation.errors.join(', '));
  }
  
  const rateCheck = checkRateLimit('edit', currentUser.uid);
  if (!rateCheck.allowed) {
    throw new Error(rateCheck.reason);
  }
  
  // Flag inappropriate content
  if (flagInappropriateContent(validation.sanitizedRequest)) {
    logSecurityEvent('inappropriate_content_flagged', {
      userId: currentUser.uid,
      duaId: originalDua.id,
      content: validation.sanitizedRequest
    });
    // Don't throw error, but log for review
  }
  
  return {
    request: validation.sanitizedRequest,
    urgent: Boolean(editData.urgent),
    editedAt: new Date(),
    editedBy: currentUser.uid,
    editCount: (originalDua.editCount || 0) + 1
  };
};

export default {
  sanitizeInput,
  validateDuaRequest,
  canEditDua,
  canDeleteDua,
  canRespondToDua,
  checkRateLimit,
  logSecurityEvent,
  flagInappropriateContent,
  prepareEditData
};