// ===== src/utils/dateHelpers.js =====
export const formatDate = (date) => {
  if (!date) return '';
  return new Date(date.seconds ? date.seconds * 1000 : date).toLocaleDateString();
};

export const getDaysAgo = (date) => {
  if (!date) return 0;
  const now = new Date();
  const past = new Date(date.seconds ? date.seconds * 1000 : date);
  const diffTime = Math.abs(now - past);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export const isOverdue = (lastContact, daysSinceContact = 30) => {
  return getDaysAgo(lastContact) > daysSinceContact;
};

export const formatHijriDate = (date) => {
  // This would integrate with a Hijri calendar library
  // For now, returning a placeholder
  return formatDate(date) + ' (Hijri equivalent)';
};