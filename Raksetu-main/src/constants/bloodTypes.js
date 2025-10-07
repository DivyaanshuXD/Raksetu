/**
 * Blood Type Constants
 * Centralized blood type definitions used across the application
 */

export const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export const BLOOD_TYPES_WITH_ALL = ['All', ...BLOOD_TYPES];

export const RARE_BLOOD_TYPES = ['O h', 'AB-', 'A-', 'B-', 'O-'];

export const URGENCY_LEVELS = {
  CRITICAL: 'Critical',
  HIGH: 'High',
  MEDIUM: 'Medium',
  LOW: 'Low'
};

export const URGENCY_PRIORITY = {
  [URGENCY_LEVELS.CRITICAL]: 4,
  [URGENCY_LEVELS.HIGH]: 3,
  [URGENCY_LEVELS.MEDIUM]: 2,
  [URGENCY_LEVELS.LOW]: 1
};

export const URGENCY_COLORS = {
  [URGENCY_LEVELS.CRITICAL]: {
    bg: 'bg-red-500',
    text: 'text-red-500',
    border: 'border-red-500',
    gradient: 'from-red-500 to-red-700'
  },
  [URGENCY_LEVELS.HIGH]: {
    bg: 'bg-orange-500',
    text: 'text-orange-500',
    border: 'border-orange-500',
    gradient: 'from-orange-500 to-orange-700'
  },
  [URGENCY_LEVELS.MEDIUM]: {
    bg: 'bg-yellow-500',
    text: 'text-yellow-500',
    border: 'border-yellow-500',
    gradient: 'from-yellow-500 to-yellow-700'
  },
  [URGENCY_LEVELS.LOW]: {
    bg: 'bg-blue-500',
    text: 'text-blue-500',
    border: 'border-blue-500',
    gradient: 'from-blue-500 to-blue-700'
  }
};

/**
 * Blood type compatibility matrix
 * Key: Recipient blood type, Value: Array of compatible donor blood types
 */
export const BLOOD_COMPATIBILITY = {
  'A+': ['A+', 'A-', 'O+', 'O-'],
  'A-': ['A-', 'O-'],
  'B+': ['B+', 'B-', 'O+', 'O-'],
  'B-': ['B-', 'O-'],
  'AB+': ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
  'AB-': ['A-', 'B-', 'AB-', 'O-'],
  'O+': ['O+', 'O-'],
  'O-': ['O-']
};
