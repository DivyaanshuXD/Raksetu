import { useMemo } from 'react';
import { 
  USER_ROLES, 
  hasPermission, 
  canUserPerform, 
  isAdmin, 
  isDonor, 
  isRecipient 
} from '../constants/roles';

/**
 * Custom hook for role-based access control
 * 
 * Usage:
 * const { role, isAdmin, isDonor, isRecipient, can } = useRole(userProfile);
 * 
 * if (isAdmin) { ... }
 * if (can('donate_blood')) { ... }
 */
export const useRole = (user) => {
  const role = useMemo(() => user?.role || null, [user?.role]);

  const roleChecks = useMemo(() => ({
    isAdmin: isAdmin(user),
    isDonor: isDonor(user),
    isRecipient: isRecipient(user),
    hasRole: !!role,
    
    /**
     * Check if user has a specific permission
     * @param {string} permission - Permission to check
     * @returns {boolean}
     */
    can: (permission) => canUserPerform(user, permission),
    
    /**
     * Check if user has any of the specified permissions
     * @param {Array<string>} permissions - Array of permissions
     * @returns {boolean}
     */
    canAny: (permissions) => {
      return permissions.some(permission => canUserPerform(user, permission));
    },
    
    /**
     * Check if user has all of the specified permissions
     * @param {Array<string>} permissions - Array of permissions
     * @returns {boolean}
     */
    canAll: (permissions) => {
      return permissions.every(permission => canUserPerform(user, permission));
    }
  }), [user, role]);

  return {
    role,
    ...roleChecks
  };
};

export default useRole;
