/**
 * Date and time utility functions
 */

/**
 * Check if a date is eligible for blood donation (56 days rule)
 * @param {string|Date|null} lastDonationDate - Last donation date
 * @returns {boolean} True if eligible, false otherwise
 */
export const isEligibleToDonate = (lastDonationDate) => {
  if (!lastDonationDate) return true;
  
  const lastDate = typeof lastDonationDate === 'string' 
    ? new Date(lastDonationDate) 
    : lastDonationDate;
  
  const daysSinceLastDonation = Math.floor(
    (new Date() - lastDate) / (1000 * 60 * 60 * 24)
  );
  
  return daysSinceLastDonation >= 56;
};

/**
 * Get days until eligible to donate again
 * @param {string|Date|null} lastDonationDate - Last donation date
 * @returns {number} Days remaining until eligible (0 if already eligible)
 */
export const getDaysUntilEligible = (lastDonationDate) => {
  if (!lastDonationDate) return 0;
  
  const lastDate = typeof lastDonationDate === 'string' 
    ? new Date(lastDonationDate) 
    : lastDonationDate;
  
  const daysSinceLastDonation = Math.floor(
    (new Date() - lastDate) / (1000 * 60 * 60 * 24)
  );
  
  const daysRemaining = 56 - daysSinceLastDonation;
  return daysRemaining > 0 ? daysRemaining : 0;
};

/**
 * Format timestamp to readable date string
 * @param {Object|string|Date} timestamp - Firebase timestamp or Date
 * @returns {string} Formatted date string
 */
export const formatTimestamp = (timestamp) => {
  if (!timestamp) return 'N/A';
  
  let date;
  if (timestamp.seconds) {
    date = new Date(timestamp.seconds * 1000);
  } else if (typeof timestamp === 'string') {
    date = new Date(timestamp);
  } else {
    date = timestamp;
  }
  
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

/**
 * Format timestamp to relative time (e.g., "2 hours ago")
 * @param {Object|string|Date} timestamp - Firebase timestamp or Date
 * @returns {string} Relative time string
 */
export const getRelativeTime = (timestamp) => {
  if (!timestamp) return 'N/A';
  
  let date;
  if (timestamp.seconds) {
    date = new Date(timestamp.seconds * 1000);
  } else if (typeof timestamp === 'string') {
    date = new Date(timestamp);
  } else {
    date = timestamp;
  }
  
  const seconds = Math.floor((new Date() - date) / 1000);
  
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + ' years ago';
  
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + ' months ago';
  
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + ' days ago';
  
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + ' hours ago';
  
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + ' minutes ago';
  
  return 'Just now';
};

/**
 * Calculate age from date of birth
 * @param {string|Date} dob - Date of birth
 * @returns {number} Age in years
 */
export const calculateAge = (dob) => {
  if (!dob) return 0;
  
  const birthDate = typeof dob === 'string' ? new Date(dob) : dob;
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
};
