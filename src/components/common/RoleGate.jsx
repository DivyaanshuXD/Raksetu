import PropTypes from 'prop-types';
import { useRole } from '../../hooks/useRole';
import { PERMISSIONS } from '../../constants/roles';

/**
 * RoleGate Component
 * 
 * Conditionally renders children based on user role or permissions
 * 
 * Usage:
 * <RoleGate roles={['donor']} user={userProfile}>
 *   <DonorOnlyFeature />
 * </RoleGate>
 * 
 * <RoleGate permissions={['donate_blood']} user={userProfile}>
 *   <DonateButton />
 * </RoleGate>
 * 
 * <RoleGate adminOnly user={userProfile}>
 *   <AdminPanel />
 * </RoleGate>
 */
const RoleGate = ({ 
  children, 
  user, 
  roles = [], 
  permissions = [], 
  adminOnly = false,
  donorOnly = false,
  recipientOnly = false,
  requireAll = false,
  fallback = null,
  onUnauthorized = null
}) => {
  const { role, isAdmin, isDonor, isRecipient, can, canAny, canAll } = useRole(user);

  // Check admin-only access
  if (adminOnly && !isAdmin) {
    if (onUnauthorized) onUnauthorized();
    return fallback;
  }

  // Check donor-only access
  if (donorOnly && !isDonor) {
    if (onUnauthorized) onUnauthorized();
    return fallback;
  }

  // Check recipient-only access
  if (recipientOnly && !isRecipient) {
    if (onUnauthorized) onUnauthorized();
    return fallback;
  }

  // Check role-based access
  if (roles.length > 0) {
    const hasRole = roles.includes(role);
    if (!hasRole) {
      if (onUnauthorized) onUnauthorized();
      return fallback;
    }
  }

  // Check permission-based access
  if (permissions.length > 0) {
    const hasPermissions = requireAll 
      ? canAll(permissions) 
      : canAny(permissions);
    
    if (!hasPermissions) {
      if (onUnauthorized) onUnauthorized();
      return fallback;
    }
  }

  // All checks passed, render children
  return <>{children}</>;
};

RoleGate.propTypes = {
  children: PropTypes.node.isRequired,
  user: PropTypes.object,
  roles: PropTypes.arrayOf(PropTypes.string),
  permissions: PropTypes.arrayOf(PropTypes.string),
  adminOnly: PropTypes.bool,
  donorOnly: PropTypes.bool,
  recipientOnly: PropTypes.bool,
  requireAll: PropTypes.bool,
  fallback: PropTypes.node,
  onUnauthorized: PropTypes.func
};

export default RoleGate;

// Convenience components for common use cases
export const AdminOnly = ({ children, user, fallback = null }) => (
  <RoleGate adminOnly user={user} fallback={fallback}>
    {children}
  </RoleGate>
);

AdminOnly.propTypes = {
  children: PropTypes.node.isRequired,
  user: PropTypes.object,
  fallback: PropTypes.node
};

export const DonorOnly = ({ children, user, fallback = null }) => (
  <RoleGate donorOnly user={user} fallback={fallback}>
    {children}
  </RoleGate>
);

DonorOnly.propTypes = {
  children: PropTypes.node.isRequired,
  user: PropTypes.object,
  fallback: PropTypes.node
};

export const RecipientOnly = ({ children, user, fallback = null }) => (
  <RoleGate recipientOnly user={user} fallback={fallback}>
    {children}
  </RoleGate>
);

RecipientOnly.propTypes = {
  children: PropTypes.node.isRequired,
  user: PropTypes.object,
  fallback: PropTypes.node
};
