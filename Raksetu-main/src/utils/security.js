/**
 * Security Utilities
 * Input sanitization, XSS protection, and secure data handling
 */

import DOMPurify from 'dompurify';
import { logger } from './logger';

/**
 * Sanitize HTML content to prevent XSS attacks
 * @param {string} dirty - Unsanitized HTML string
 * @param {Object} options - DOMPurify configuration options
 * @returns {string} Sanitized HTML string
 */
export function sanitizeHTML(dirty, options = {}) {
  if (!dirty || typeof dirty !== 'string') {
    return '';
  }

  const defaultOptions = {
    ALLOWED_TAGS: [
      'b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'code', 'pre'
    ],
    ALLOWED_ATTR: ['href', 'title', 'target', 'rel'],
    ALLOW_DATA_ATTR: false,
    ...options
  };

  try {
    const clean = DOMPurify.sanitize(dirty, defaultOptions);
    
    // Log if content was modified (potential XSS attempt)
    if (clean !== dirty && import.meta.env.DEV) {
      logger.warn('Content was sanitized:', { original: dirty.substring(0, 100), sanitized: clean.substring(0, 100) });
    }
    
    return clean;
  } catch (error) {
    logger.error('Error sanitizing HTML:', error);
    return '';
  }
}

/**
 * Sanitize user input for plain text (removes all HTML)
 * @param {string} input - User input
 * @returns {string} Sanitized plain text
 */
export function sanitizeText(input) {
  if (!input || typeof input !== 'string') {
    return '';
  }

  // Remove all HTML tags and decode HTML entities
  return DOMPurify.sanitize(input, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] })
    .trim();
}

/**
 * Validate and sanitize email address
 * @param {string} email - Email address
 * @returns {Object} { isValid: boolean, sanitized: string }
 */
export function validateEmail(email) {
  if (!email || typeof email !== 'string') {
    return { isValid: false, sanitized: '' };
  }

  const sanitized = email.trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  return {
    isValid: emailRegex.test(sanitized),
    sanitized
  };
}

/**
 * Validate and sanitize phone number
 * @param {string} phone - Phone number
 * @returns {Object} { isValid: boolean, sanitized: string, formatted: string }
 */
export function validatePhone(phone) {
  if (!phone || typeof phone !== 'string') {
    return { isValid: false, sanitized: '', formatted: '' };
  }

  // Remove all non-digit characters
  const digitsOnly = phone.replace(/\D/g, '');
  
  // Indian phone number: 10 digits
  const isValid = digitsOnly.length === 10;
  
  // Format: +91 XXXXX XXXXX
  const formatted = isValid 
    ? `+91 ${digitsOnly.slice(0, 5)} ${digitsOnly.slice(5)}`
    : digitsOnly;

  return {
    isValid,
    sanitized: digitsOnly,
    formatted
  };
}

/**
 * Validate and sanitize URL
 * @param {string} url - URL string
 * @returns {Object} { isValid: boolean, sanitized: string }
 */
export function validateURL(url) {
  if (!url || typeof url !== 'string') {
    return { isValid: false, sanitized: '' };
  }

  const sanitized = url.trim();
  
  try {
    const urlObject = new URL(sanitized);
    
    // Only allow http and https protocols
    const isValid = ['http:', 'https:'].includes(urlObject.protocol);
    
    return {
      isValid,
      sanitized: isValid ? urlObject.href : ''
    };
  } catch {
    return { isValid: false, sanitized: '' };
  }
}

/**
 * Sanitize filename to prevent directory traversal attacks
 * @param {string} filename - Filename
 * @returns {string} Sanitized filename
 */
export function sanitizeFilename(filename) {
  if (!filename || typeof filename !== 'string') {
    return '';
  }

  return filename
    .replace(/[^a-zA-Z0-9._-]/g, '_') // Replace special chars with underscore
    .replace(/\.{2,}/g, '.') // Remove multiple dots (directory traversal)
    .replace(/^\.+/, '') // Remove leading dots
    .substring(0, 255); // Limit length
}

/**
 * Validate blood type
 * @param {string} bloodType - Blood type
 * @returns {boolean}
 */
export function validateBloodType(bloodType) {
  const validTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  return validTypes.includes(bloodType);
}

/**
 * Validate date of birth (must be at least 18 years old)
 * @param {string} dob - Date of birth (YYYY-MM-DD)
 * @returns {Object} { isValid: boolean, age: number, reason: string }
 */
export function validateDateOfBirth(dob) {
  if (!dob) {
    return { isValid: false, age: 0, reason: 'Date of birth is required' };
  }

  const birthDate = new Date(dob);
  const today = new Date();
  
  if (isNaN(birthDate.getTime())) {
    return { isValid: false, age: 0, reason: 'Invalid date format' };
  }

  if (birthDate > today) {
    return { isValid: false, age: 0, reason: 'Date cannot be in the future' };
  }

  const age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  const dayDiff = today.getDate() - birthDate.getDate();
  
  const actualAge = (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) 
    ? age - 1 
    : age;

  if (actualAge < 18) {
    return { isValid: false, age: actualAge, reason: 'Must be at least 18 years old' };
  }

  if (actualAge > 150) {
    return { isValid: false, age: actualAge, reason: 'Invalid age' };
  }

  return { isValid: true, age: actualAge, reason: '' };
}

/**
 * Rate limiting helper (prevents spam/abuse)
 * @param {string} key - Unique key for the action
 * @param {number} maxAttempts - Maximum attempts allowed
 * @param {number} windowMs - Time window in milliseconds
 * @returns {Object} { allowed: boolean, remaining: number, resetAt: Date }
 */
const rateLimitStore = new Map();

export function checkRateLimit(key, maxAttempts = 5, windowMs = 60000) {
  const now = Date.now();
  const record = rateLimitStore.get(key);

  if (!record || now > record.resetAt) {
    // Create new record
    const resetAt = now + windowMs;
    rateLimitStore.set(key, {
      attempts: 1,
      resetAt
    });
    
    return {
      allowed: true,
      remaining: maxAttempts - 1,
      resetAt: new Date(resetAt)
    };
  }

  // Increment attempts
  record.attempts++;
  rateLimitStore.set(key, record);

  const allowed = record.attempts <= maxAttempts;
  const remaining = Math.max(0, maxAttempts - record.attempts);

  if (!allowed) {
    logger.warn(`Rate limit exceeded for: ${key}`);
  }

  return {
    allowed,
    remaining,
    resetAt: new Date(record.resetAt)
  };
}

/**
 * Clear rate limit for a key
 * @param {string} key - Unique key for the action
 */
export function clearRateLimit(key) {
  rateLimitStore.delete(key);
}

/**
 * Generate a secure random token
 * @param {number} length - Token length
 * @returns {string} Random token
 */
export function generateSecureToken(length = 32) {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Mask sensitive data for logging
 * @param {string} data - Sensitive data
 * @param {number} visibleChars - Number of visible characters at start/end
 * @returns {string} Masked data
 */
export function maskSensitiveData(data, visibleChars = 3) {
  if (!data || typeof data !== 'string') {
    return '';
  }

  if (data.length <= visibleChars * 2) {
    return '*'.repeat(data.length);
  }

  const start = data.substring(0, visibleChars);
  const end = data.substring(data.length - visibleChars);
  const masked = '*'.repeat(data.length - (visibleChars * 2));

  return `${start}${masked}${end}`;
}

/**
 * Secure comparison that prevents timing attacks
 * @param {string} a - First string
 * @param {string} b - Second string
 * @returns {boolean}
 */
export function secureCompare(a, b) {
  if (!a || !b || typeof a !== 'string' || typeof b !== 'string') {
    return false;
  }

  if (a.length !== b.length) {
    return false;
  }

  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }

  return result === 0;
}

/**
 * Validate that user input doesn't contain suspicious patterns
 * @param {string} input - User input
 * @returns {Object} { isSafe: boolean, threats: string[] }
 */
export function detectXSSPatterns(input) {
  if (!input || typeof input !== 'string') {
    return { isSafe: true, threats: [] };
  }

  const threats = [];
  const suspiciousPatterns = [
    { pattern: /<script[\s\S]*?>[\s\S]*?<\/script>/gi, name: 'Script tag' },
    { pattern: /javascript:/gi, name: 'JavaScript protocol' },
    { pattern: /on\w+\s*=\s*["'][\s\S]*?["']/gi, name: 'Event handler' },
    { pattern: /<iframe[\s\S]*?>/gi, name: 'IFrame tag' },
    { pattern: /<object[\s\S]*?>/gi, name: 'Object tag' },
    { pattern: /<embed[\s\S]*?>/gi, name: 'Embed tag' },
    { pattern: /eval\s*\(/gi, name: 'Eval function' },
    { pattern: /expression\s*\(/gi, name: 'CSS expression' }
  ];

  suspiciousPatterns.forEach(({ pattern, name }) => {
    if (pattern.test(input)) {
      threats.push(name);
    }
  });

  if (threats.length > 0) {
    logger.warn('Suspicious input detected:', { threats, input: input.substring(0, 100) });
  }

  return {
    isSafe: threats.length === 0,
    threats
  };
}

/**
 * Clean and validate user profile data
 * @param {Object} profile - User profile data
 * @returns {Object} Sanitized profile
 */
export function sanitizeUserProfile(profile) {
  if (!profile || typeof profile !== 'object') {
    return {};
  }

  return {
    name: sanitizeText(profile.name || '').substring(0, 100),
    email: validateEmail(profile.email || '').sanitized,
    phone: validatePhone(profile.phone || '').sanitized,
    bloodType: validateBloodType(profile.bloodType) ? profile.bloodType : '',
    address: sanitizeText(profile.address || '').substring(0, 500),
    city: sanitizeText(profile.city || '').substring(0, 100),
    dob: profile.dob || '',
    // Preserve safe fields
    role: profile.role || '',
    uid: profile.uid || '',
    createdAt: profile.createdAt || null,
    lastDonated: profile.lastDonated || null
  };
}

/**
 * Sanitize emergency request data
 * @param {Object} request - Emergency request data
 * @returns {Object} Sanitized request
 */
export function sanitizeEmergencyRequest(request) {
  if (!request || typeof request !== 'object') {
    return {};
  }

  return {
    bloodType: validateBloodType(request.bloodType) ? request.bloodType : '',
    hospital: sanitizeText(request.hospital || '').substring(0, 200),
    contact: validatePhone(request.contact || '').sanitized,
    urgency: ['critical', 'high', 'medium', 'low'].includes(request.urgency) 
      ? request.urgency 
      : 'medium',
    description: sanitizeHTML(request.description || '').substring(0, 1000),
    location: {
      lat: parseFloat(request.location?.lat) || 0,
      lng: parseFloat(request.location?.lng) || 0
    },
    // Preserve safe fields
    createdBy: request.createdBy || '',
    createdAt: request.createdAt || null,
    status: request.status || 'active'
  };
}

// Export all security utilities
export default {
  sanitizeHTML,
  sanitizeText,
  validateEmail,
  validatePhone,
  validateURL,
  sanitizeFilename,
  validateBloodType,
  validateDateOfBirth,
  checkRateLimit,
  clearRateLimit,
  generateSecureToken,
  maskSensitiveData,
  secureCompare,
  detectXSSPatterns,
  sanitizeUserProfile,
  sanitizeEmergencyRequest
};
