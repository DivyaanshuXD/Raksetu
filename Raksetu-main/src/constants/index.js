/**
 * Central export for all constants
 */

export * from './bloodTypes';
export * from './designTokens';

export const DONATION_ELIGIBILITY_DAYS = 56;

export const DEFAULT_MAP_CENTER = {
  lat: 17.4065,
  lng: 78.4691
};

export const DEFAULT_MAP_ZOOM = 12;

export const PAGINATION = {
  EMERGENCY_REQUESTS: 10,
  DONATIONS: 10,
  USERS: 8,
  TESTIMONIALS: 8
};

export const DISTANCE_FILTERS = [
  { label: 'Within 5 km', value: 5 },
  { label: 'Within 10 km', value: 10 },
  { label: 'Within 20 km', value: 20 },
  { label: 'Within 50 km', value: 50 },
  { label: 'Any distance', value: null }
];

export const NOTIFICATION_TYPES = {
  EMERGENCY: 'emergency',
  DONATION: 'donation',
  APPOINTMENT: 'appointment',
  SYSTEM: 'system'
};

export const DONATION_STATUS = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
};

export const REQUEST_STATUS = {
  ACTIVE: 'active',
  FULFILLED: 'fulfilled',
  CANCELLED: 'cancelled'
};
