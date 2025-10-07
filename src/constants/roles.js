/**
 * User Roles and Permissions System
 * 
 * Defines user roles and their associated permissions
 * for the Raksetu blood donation platform.
 */

// User role constants
export const USER_ROLES = {
  DONOR: 'donor',
  RECIPIENT: 'recipient',
  ADMIN: 'admin'
};

// Role display names
export const ROLE_LABELS = {
  [USER_ROLES.DONOR]: 'Blood Donor',
  [USER_ROLES.RECIPIENT]: 'Blood Recipient',
  [USER_ROLES.ADMIN]: 'Administrator'
};

// Role descriptions
export const ROLE_DESCRIPTIONS = {
  [USER_ROLES.DONOR]: 'I want to donate blood and help save lives',
  [USER_ROLES.RECIPIENT]: 'I need blood for myself or someone else',
  [USER_ROLES.ADMIN]: 'Platform administrator with full access'
};

// Role icons (using lucide-react)
export const ROLE_ICONS = {
  [USER_ROLES.DONOR]: 'Heart',
  [USER_ROLES.RECIPIENT]: 'User',
  [USER_ROLES.ADMIN]: 'ShieldAlert'
};

// Role colors
export const ROLE_COLORS = {
  [USER_ROLES.DONOR]: {
    bg: 'bg-red-50',
    border: 'border-red-300',
    text: 'text-red-700',
    hover: 'hover:bg-red-100',
    gradient: 'from-red-500 to-red-600'
  },
  [USER_ROLES.RECIPIENT]: {
    bg: 'bg-blue-50',
    border: 'border-blue-300',
    text: 'text-blue-700',
    hover: 'hover:bg-blue-100',
    gradient: 'from-blue-500 to-blue-600'
  },
  [USER_ROLES.ADMIN]: {
    bg: 'bg-purple-50',
    border: 'border-purple-300',
    text: 'text-purple-700',
    hover: 'hover:bg-purple-100',
    gradient: 'from-purple-500 to-purple-600'
  }
};

// Permissions for each role
export const PERMISSIONS = {
  // Donor permissions
  DONATE_BLOOD: 'donate_blood',
  VIEW_DONATION_HISTORY: 'view_donation_history',
  SCHEDULE_APPOINTMENT: 'schedule_appointment',
  REGISTER_FOR_DRIVES: 'register_for_drives',
  EARN_IMPACT_POINTS: 'earn_impact_points',
  
  // Recipient permissions
  REQUEST_BLOOD: 'request_blood',
  SEARCH_DONORS: 'search_donors',
  VIEW_BLOOD_BANKS: 'view_blood_banks',
  CREATE_EMERGENCY_REQUEST: 'create_emergency_request',
  
  // Admin permissions
  MANAGE_USERS: 'manage_users',
  MANAGE_TESTIMONIALS: 'manage_testimonials',
  VIEW_ANALYTICS: 'view_analytics',
  DELETE_CONTENT: 'delete_content',
  ASSIGN_ROLES: 'assign_roles',
  
  // Common permissions (all roles)
  VIEW_PROFILE: 'view_profile',
  EDIT_PROFILE: 'edit_profile',
  CHANGE_SETTINGS: 'change_settings',
  VIEW_NOTIFICATIONS: 'view_notifications'
};

// Map roles to their permissions
export const ROLE_PERMISSIONS = {
  [USER_ROLES.DONOR]: [
    PERMISSIONS.DONATE_BLOOD,
    PERMISSIONS.VIEW_DONATION_HISTORY,
    PERMISSIONS.SCHEDULE_APPOINTMENT,
    PERMISSIONS.REGISTER_FOR_DRIVES,
    PERMISSIONS.EARN_IMPACT_POINTS,
    PERMISSIONS.VIEW_BLOOD_BANKS,
    PERMISSIONS.VIEW_PROFILE,
    PERMISSIONS.EDIT_PROFILE,
    PERMISSIONS.CHANGE_SETTINGS,
    PERMISSIONS.VIEW_NOTIFICATIONS
  ],
  [USER_ROLES.RECIPIENT]: [
    PERMISSIONS.REQUEST_BLOOD,
    PERMISSIONS.SEARCH_DONORS,
    PERMISSIONS.VIEW_BLOOD_BANKS,
    PERMISSIONS.CREATE_EMERGENCY_REQUEST,
    PERMISSIONS.VIEW_PROFILE,
    PERMISSIONS.EDIT_PROFILE,
    PERMISSIONS.CHANGE_SETTINGS,
    PERMISSIONS.VIEW_NOTIFICATIONS
  ],
  [USER_ROLES.ADMIN]: [
    ...Object.values(PERMISSIONS) // Admins have all permissions
  ]
};

/**
 * Check if a role has a specific permission
 * @param {string} role - User role
 * @param {string} permission - Permission to check
 * @returns {boolean} - Whether the role has the permission
 */
export const hasPermission = (role, permission) => {
  if (!role || !permission) return false;
  
  const permissions = ROLE_PERMISSIONS[role] || [];
  return permissions.includes(permission);
};

/**
 * Check if a user can perform an action based on their role
 * @param {Object} user - User object with role property
 * @param {string} permission - Permission to check
 * @returns {boolean} - Whether the user can perform the action
 */
export const canUserPerform = (user, permission) => {
  if (!user || !user.role) return false;
  
  return hasPermission(user.role, permission);
};

/**
 * Check if a user is an admin
 * @param {Object} user - User object
 * @returns {boolean} - Whether the user is an admin
 */
export const isAdmin = (user) => {
  return user?.role === USER_ROLES.ADMIN;
};

/**
 * Check if a user is a donor
 * @param {Object} user - User object
 * @returns {boolean} - Whether the user is a donor
 */
export const isDonor = (user) => {
  return user?.role === USER_ROLES.DONOR;
};

/**
 * Check if a user is a recipient
 * @param {Object} user - User object
 * @returns {boolean} - Whether the user is a recipient
 */
export const isRecipient = (user) => {
  return user?.role === USER_ROLES.RECIPIENT;
};

/**
 * Get available roles for registration
 * (Excludes ADMIN - admins must be assigned manually)
 * @returns {Array} - Array of role objects
 */
export const getAvailableRoles = () => {
  return [
    {
      value: USER_ROLES.DONOR,
      label: ROLE_LABELS[USER_ROLES.DONOR],
      description: ROLE_DESCRIPTIONS[USER_ROLES.DONOR],
      icon: ROLE_ICONS[USER_ROLES.DONOR],
      colors: ROLE_COLORS[USER_ROLES.DONOR]
    },
    {
      value: USER_ROLES.RECIPIENT,
      label: ROLE_LABELS[USER_ROLES.RECIPIENT],
      description: ROLE_DESCRIPTIONS[USER_ROLES.RECIPIENT],
      icon: ROLE_ICONS[USER_ROLES.RECIPIENT],
      colors: ROLE_COLORS[USER_ROLES.RECIPIENT]
    }
  ];
};

/**
 * Validate if a role is valid
 * @param {string} role - Role to validate
 * @returns {boolean} - Whether the role is valid
 */
export const isValidRole = (role) => {
  return Object.values(USER_ROLES).includes(role);
};

export default USER_ROLES;
